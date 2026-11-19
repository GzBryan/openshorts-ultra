/* engine/exporter.js — Exportación REAL con Canvas + MediaRecorder (WebM).
   Dibuja cada fotograma con OSU.editor.drawFrame (+ subtítulos quemados), graba el
   stream del canvas y el audio original del vídeo con AudioContext. Salida: .webm
   (MediaRecorder no produce MP4 en el navegador; para MP4 usa FFmpeg en PC/Android
   nativo). Devuelve un Blob descargable. */
(function () {
  'use strict';
  function exportClip(video, state, subtitles, onProgress) {
    return new Promise(function (resolve, reject) {
      var canvas = document.createElement('canvas');
      var start = state.start || 0, end = state.end || video.duration;
      var stream = canvas.captureStream(30);
      var rec;
      try { rec = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9,opus', videoBitsPerSecond: 5000000 }); }
      catch (e) { try { rec = new MediaRecorder(stream, { mimeType: 'video/webm' }); } catch (e2) { return reject(new Error('Este navegador no soporta grabación de vídeo (MediaRecorder).')); } }
      var chunks = [];
      rec.ondataavailable = function (e) { if (e.data.size) chunks.push(e.data); };
      rec.onstop = function () { resolve(new Blob(chunks, { type: 'video/webm' })); };
      // Audio original: conecta el vídeo a MediaStreamDestination y añade su pista.
      var audioCtx = null, dest = null;
      try {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        var src = audioCtx.createMediaElementSource(video); dest = audioCtx.createMediaStreamDestination();
        src.connect(dest); src.connect(audioCtx.destination);
        dest.stream.getAudioTracks().forEach(function (t) { stream.addTrack(t); });
      } catch (e) { /* sin audio: se exporta solo vídeo */ }
      video.currentTime = start; video.playbackRate = state.speed || 1; video.volume = (state.volume == null ? 1 : state.volume);
      video.play();
      var face = null, stopped = false;
      var tick = function () {
        if (stopped) return;
        if (video.currentTime >= end || video.ended) { stopped = true; rec.stop(); video.pause(); if (audioCtx) audioCtx.close(); return; }
        OSU.editor.drawFrame(canvas, video, state, face);
        var seg = (subtitles || []).find(function (s) { return video.currentTime >= s.start && video.currentTime <= s.end; });
        if (seg) OSU.editor.drawSubtitle(canvas, seg.text, state.subStyle);
        if (onProgress) onProgress(Math.round((video.currentTime - start) / Math.max(0.01, end - start) * 100));
        requestAnimationFrame(tick);
      };
      video.onseeked = function () { if (!stopped) { rec.start(200); tick(); } };
      video.onerror = function () { reject(new Error('Error al reproducir el vídeo para exportar.')); };
    });
  }
  function downloadBlob(blob, name) {
    var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 10000);
  }
  window.OSU = window.OSU || {};
  OSU.exporter = { exportClip: exportClip, downloadBlob: downloadBlob };
})();
