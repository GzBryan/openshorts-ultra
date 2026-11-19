/* engine/clips.js — Sugerencias de clips a partir de escenas + puntuación heurística.
   Ventanas deslizantes de `minDur..maxDur` s sobre los límites de escena, puntuadas
   con OSU.score.scoreWindow, ordenadas por puntuación, sin solaparse. */
(function () {
  'use strict';
  function suggestClips(scenes, duration, energy, wordCount, opts) {
    opts = opts || {};
    var count = opts.count || 5, minDur = opts.minDur || 15, maxDur = opts.maxDur || 60;
    var bounds = scenes.concat([duration]).filter(function (t, i, a) { return a.indexOf(t) === i; }).sort(function (a, b) { return a - b; });
    var cands = [];
    for (var i = 0; i < bounds.length; i++) {
      for (var j = i + 1; j < bounds.length; j++) {
        var s = bounds[i], e = bounds[j]; if (e - s < minDur) continue; if (e - s > maxDur) break;
        var sc = OSU.score.scoreWindow({ start: s, end: e }, energy, scenes, wordCount, duration);
        cands.push({ start: +s.toFixed(1), end: +e.toFixed(1), duration: +(e - s).toFixed(1), score: sc.score, detail: sc });
      }
    }
    // Ventanas de duración fija si no hay suficientes límites de escena
    if (!cands.length) {
      for (var t = 0; t + minDur <= duration; t += minDur) {
        var e2 = Math.min(duration, t + maxDur);
        var sc2 = OSU.score.scoreWindow({ start: t, end: e2 }, energy, scenes, wordCount, duration);
        cands.push({ start: +t.toFixed(1), end: +e2.toFixed(1), duration: +(e2 - t).toFixed(1), score: sc2.score, detail: sc2 });
      }
    }
    cands.sort(function (a, b) { return b.score - a.score; });
    var picked = [];
    cands.forEach(function (c) {
      if (picked.length >= count) return;
      var overlap = picked.some(function (p) { return c.start < p.end && c.end > p.start; });
      if (!overlap) picked.push(c);
    });
    return picked.sort(function (a, b) { return a.start - b.start; });
  }
  window.OSU = window.OSU || {};
  OSU.clips = { suggestClips: suggestClips };
})();
