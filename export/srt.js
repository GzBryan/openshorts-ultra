/* export/srt.js — SRT / VTT reales a partir de segmentos {start,end,text}. */
(function () {
  'use strict';
  function pad(n, l) { n = String(n); while (n.length < l) n = '0' + n; return n; }
  function fmt(t, vtt) {
    t = Math.max(0, t);
    var h = Math.floor(t / 3600), m = Math.floor(t % 3600 / 60), s = Math.floor(t % 60), ms = Math.floor((t % 1) * 1000);
    return pad(h, 2) + ':' + pad(m, 2) + ':' + pad(s, 2) + (vtt ? '.' : ',') + pad(ms, 3);
  }
  function toSRT(segs) {
    return segs.map(function (g, i) { return (i + 1) + '\n' + fmt(g.start) + ' --> ' + fmt(g.end) + '\n' + g.text + '\n'; }).join('\n');
  }
  function toVTT(segs) {
    return 'WEBVTT\n\n' + segs.map(function (g) { return fmt(g.start, true) + ' --> ' + fmt(g.end, true) + '\n' + g.text + '\n'; }).join('\n');
  }
  function download(name, text, type) {
    var blob = new Blob([text], { type: type || 'text/plain' });
    var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 5000);
  }
  window.OSU = window.OSU || {};
  OSU.srt = { toSRT: toSRT, toVTT: toVTT, download: download, fmt: fmt };
})();
