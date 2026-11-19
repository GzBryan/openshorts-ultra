/* engine/editor.js — Estado del editor y dibujo de la vista previa en canvas.
   Aplica recorte (9:16/16:9/1:1), rotación, filtros CSS en el contexto, fondo
   desenfocado, modo dividido (dos personas) y subtítulos quemados en la vista previa. */
(function () {
  'use strict';
  function drawFrame(canvas, video, state, face) {
    var ctx = canvas.getContext('2d');
    var fmt = state.format || '9:16', target = OSU.reframe.aspectFor(fmt);
    var W = fmt === '9:16' ? 540 : fmt === '1:1' ? 720 : 1280;
    var H = Math.round(W / target); canvas.width = W; canvas.height = H;
    ctx.save();
    ctx.filter = state.filter || 'none';
    if (state.blurBg) { ctx.filter = (state.filter && state.filter !== 'none' ? state.filter + ' ' : '') + 'blur(18px) brightness(0.6)'; ctx.drawImage(video, 0, 0, W, H); ctx.filter = state.filter || 'none'; }
    var r = OSU.reframe.cropRect(video.videoWidth, video.videoHeight, fmt, face);
    if (state.layout === 'split') {
      // Dos personas: mitad superior e inferior del fotograma original, apiladas.
      var halfH = video.videoHeight / 2;
      ctx.drawImage(video, 0, 0, video.videoWidth, halfH, 0, 0, W, H / 2);
      ctx.drawImage(video, 0, halfH, video.videoWidth, halfH, 0, H / 2, W, H / 2);
      ctx.fillStyle = '#000'; ctx.fillRect(0, H / 2 - 2, W, 4);
    } else {
      var rot = (state.rotate || 0) * Math.PI / 180;
      ctx.translate(W / 2, H / 2); ctx.rotate(rot);
      var dw = rot % Math.PI === 0 ? W : H, dh = rot % Math.PI === 0 ? H : W;
      ctx.drawImage(video, r.x, r.y, r.w, r.h, -dw / 2, -dh / 2, dw, dh);
    }
    ctx.restore();
    return { W: W, H: H };
  }
  function drawSubtitle(canvas, text, style) {
    if (!text) return;
    var ctx = canvas.getContext('2d'), W = canvas.width, H = canvas.height;
    style = style || {};
    var size = style.size || 42;
    ctx.font = 'bold ' + size + 'px ' + (style.font || 'Arial');
    ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
    var words = text.split(' '), lines = [''], li = 0;
    words.forEach(function (w) { if (ctx.measureText(lines[li] + ' ' + w).width > W * 0.9) { li++; lines[li] = ''; } lines[li] += (lines[li] ? ' ' : '') + w; });
    var y = H - 30;
    lines.slice(-2).reverse().forEach(function (line, idx) {
      var yy = y - idx * (size + 8);
      ctx.lineWidth = 8; ctx.strokeStyle = '#000'; ctx.strokeText(line, W / 2, yy);
      ctx.fillStyle = style.color || '#00ff88'; ctx.fillText(line, W / 2, yy);
    });
  }
  window.OSU = window.OSU || {};
  OSU.editor = { drawFrame: drawFrame, drawSubtitle: drawSubtitle };
})();
