/* engine/reframe.js — Reencuadre inteligente.
   Formatos 9:16 / 16:9 / 1:1. Si el navegador trae FaceDetector, centra el recorte
   en la cara detectada; si no, recorte centrado (y se avisa en la UI). Fondo
   desenfocado: dibuja el fotograma completo desenfocado detrás del recorte. */
(function () {
  'use strict';
  function aspectFor(fmt) { return fmt === '9:16' ? 9 / 16 : fmt === '1:1' ? 1 : 16 / 9; }
  function cropRect(vw, vh, fmt, face) {
    var target = aspectFor(fmt), cw, ch;
    if (vw / vh > target) { ch = vh; cw = vh * target; } else { cw = vw; ch = vw / target; }
    var cx = face ? face.x + face.width / 2 : vw / 2, cy = face ? face.y + face.height / 2 : vh / 2;
    var x = Math.max(0, Math.min(vw - cw, cx - cw / 2)), y = Math.max(0, Math.min(vh - ch, cy - ch / 2));
    return { x: x, y: y, w: cw, h: ch };
  }
  var faceDetector = null;
  function detectFace(canvas) {
    if (!('FaceDetector' in window)) return Promise.resolve(null);
    try {
      faceDetector = faceDetector || new FaceDetector({ fastMode: true, maxDetectedFaces: 2 });
      return faceDetector.detect(canvas).then(function (faces) {
        if (!faces || !faces.length) return null;
        var f = faces[0].boundingBox; return { x: f.x, y: f.y, width: f.width, height: f.height, count: faces.length, all: faces.map(function (x) { return x.boundingBox; }) };
      }).catch(function () { return null; });
    } catch (e) { return Promise.resolve(null); }
  }
  window.OSU = window.OSU || {};
  OSU.reframe = { aspectFor: aspectFor, cropRect: cropRect, detectFace: detectFace, faceSupported: ('FaceDetector' in window) };
})();
