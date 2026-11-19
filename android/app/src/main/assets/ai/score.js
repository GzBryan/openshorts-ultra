/* ai/score.js — Puntuación VIRAL HEURÍSTICA LOCAL.
   NO es Gemini ni ninguna IA en la nube. Fórmula documentada:
   score = 40*energiaAudioNormalizada + 30*densidadCambiosEscena + 30*densidadPalabras
   Cada componente 0..1. La energía se mide de verdad con Web Audio (RMS por segundo);
   los cambios de escena, de verdad con engine/scene.js; las palabras, de la transcripción. */
(function () {
  'use strict';
  function rmsPerSecond(arrayBuffer) {
    var ctx = new (window.AudioContext || window.webkitAudioContext)();
    return ctx.decodeAudioData(arrayBuffer.slice(0)).then(function (buf) {
      var ch = buf.getChannelData(0), sr = buf.sampleRate, out = [], n = Math.floor(buf.duration);
      for (var s = 0; s < n; s++) {
        var sum = 0, start = s * sr, end = Math.min(ch.length, start + sr), c = 0;
        for (var i = start; i < end; i += 10) { sum += ch[i] * ch[i]; c++; }
        out.push(c ? Math.sqrt(sum / c) : 0);
      }
      ctx.close(); return out;
    }).catch(function () { return []; });
  }
  function scoreWindow(win, energy, scenes, wordCount, duration) {
    var e = energy.slice(Math.floor(win.start), Math.ceil(win.end));
    var eAvg = e.length ? e.reduce(function (a, b) { return a + b; }, 0) / e.length : 0;
    var eMax = energy.length ? Math.max.apply(null, energy) : 1;
    var eN = eMax > 0 ? Math.min(1, eAvg / eMax) : 0;
    var sc = scenes.filter(function (t) { return t >= win.start && t <= win.end; }).length;
    var scN = Math.min(1, sc / Math.max(1, (win.end - win.start) / 5));
    var wN = Math.min(1, (wordCount / Math.max(1, duration)) / 3); // ~3 palabras/s = habla densa
    var score = Math.round(100 * (0.4 * eN + 0.3 * scN + 0.3 * wN));
    return { score: score, energy: +eN.toFixed(2), sceneDensity: +scN.toFixed(2), wordDensity: +wN.toFixed(2) };
  }
  window.OSU = window.OSU || {};
  OSU.score = { rmsPerSecond: rmsPerSecond, scoreWindow: scoreWindow };
})();
