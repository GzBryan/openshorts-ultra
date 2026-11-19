/* ai/transcribe.js — Transcripción.
   1) Web Speech API (SpeechRecognition) si el navegador la trae: real, pero en
      Chrome Android suele requerir red — la UI lo advierte.
   2) Fallback manual: pegar/escribir el texto; los tiempos se reparten de forma
      aproximada entre inicio y fin (etiquetado como APROXIMADO, no es Whisper).
   No se finge transcripción palabra por palabra con timestamps reales de Whisper. */
(function () {
  'use strict';
  function supported() {
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    return !!SR;
  }
  function transcribeLive(video, lang, onResult, onStatus) {
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return Promise.reject(new Error('Este navegador no trae reconocimiento de voz. Usa el modo manual.'));
    return new Promise(function (resolve, reject) {
      var rec = new SR(); rec.lang = lang || 'es-ES'; rec.interimResults = true; rec.continuous = true;
      var finalText = '';
      rec.onresult = function (e) {
        var txt = ''; for (var i = e.resultIndex; i < e.results.length; i++) txt += e.results[i][0].transcript;
        if (onResult) onResult(txt, video.currentTime);
        if (e.results[e.results.length - 1].isFinal) finalText += txt + ' ';
      };
      rec.onerror = function (e) { if (onStatus) onStatus('Error de reconocimiento: ' + e.error + '. Prueba el modo manual.'); reject(new Error(e.error)); };
      rec.onend = function () { resolve(finalText.trim()); };
      rec.start(); if (onStatus) onStatus('Escuchando… reproduce el vídeo. Pulsa Detener al terminar.');
      transcribeLive._rec = rec;
    });
  }
  function stopLive() { try { if (transcribeLive._rec) transcribeLive._rec.stop(); } catch (e) {} }
  // Reparte palabras de forma aproximada en [start,end] -> segmentos de ~4 s.
  function wordsToSegments(text, start, end) {
    var words = text.split(/\s+/).filter(Boolean); if (!words.length) return [];
    var total = Math.max(1, end - start), perWord = total / words.length, segs = [], cur = [], curStart = start;
    words.forEach(function (w, i) {
      cur.push(w);
      var t = start + (i + 1) * perWord;
      if (cur.length >= 7 || i === words.length - 1) { segs.push({ start: +curStart.toFixed(2), end: +t.toFixed(2), text: cur.join(' ') }); cur = []; curStart = t; }
    });
    return segs;
  }
  window.OSU = window.OSU || {};
  OSU.transcribe = { supported: supported, transcribeLive: transcribeLive, stopLive: stopLive, wordsToSegments: wordsToSegments };
})();
