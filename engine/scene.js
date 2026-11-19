/* engine/scene.js — Detección de cambios de escena REAL por muestreo de fotogramas.
   Dibuja el vídeo en un canvas pequeño (32x18) cada `step` segundos y compara la
   diferencia media de píxeles con el fotograma anterior. Umbral configurable.
   No es PySceneDetect, es la misma idea adaptada al navegador. */
(function () {
  'use strict';
  function frameDiff(a, b) {
    var sum = 0; for (var i = 0; i < a.length; i += 4) sum += Math.abs(a[i] - b[i]) + Math.abs(a[i + 1] - b[i + 1]) + Math.abs(a[i + 2] - b[i + 2]);
    return sum / (a.length / 4 * 3 * 255);
  }
  function seek(video, t) {
    return new Promise(function (res) {
      var done = function () { video.removeEventListener('seeked', done); res(); };
      video.addEventListener('seeked', done); video.currentTime = Math.min(t, Math.max(0, video.duration - 0.05));
      setTimeout(done, 1500); // seguridad si el seek se atasca
    });
  }
  function detectScenes(video, opts, onProgress) {
    opts = opts || {}; var step = opts.step || 0.5, threshold = opts.threshold || 0.25;
    var canvas = document.createElement('canvas'); canvas.width = 32; canvas.height = 18;
    var ctx = canvas.getContext('2d', { willReadFrequently: true });
    var scenes = [0], prev = null, times = [];
    for (var t = 0; t < video.duration; t += step) times.push(t);
    var chain = Promise.resolve();
    times.forEach(function (t, idx) {
      chain = chain.then(function () {
        return seek(video, t).then(function () {
          ctx.drawImage(video, 0, 0, 32, 18);
          var data = ctx.getImageData(0, 0, 32, 18).data;
          if (prev) { if (frameDiff(prev, data) > threshold) scenes.push(+t.toFixed(2)); }
          prev = new Uint8ClampedArray(data);
          if (onProgress) onProgress(Math.round((idx + 1) / times.length * 100));
        });
      });
    });
    return chain.then(function () { return scenes; });
  }
  window.OSU = window.OSU || {};
  OSU.scene = { detectScenes: detectScenes, frameDiff: frameDiff };
})();
