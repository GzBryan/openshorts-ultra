/* ai/translate.js — Traducción con varias vías, en orden.
   1) API Translator del navegador (Chrome) si existe.
   2) MyMemory (gratis, sin clave).
   3) Google Translate (endpoint público, sin clave).
   4) Lingva Translate (gratis, sin clave).
   5) Argos Translate (gratis, sin clave).
   Se prueba cada vía hasta que una responda; si todas fallan (sin internet
   o con cuota agotada), la UI pide la traducción a mano. Ninguna vía es
   obligatoria: el fallo de una no rompe la app. */
(function () {
  'use strict';

  function hasTranslator() { return !!(window.Translator && window.Translator.create); }
  function supported() { return hasTranslator() || typeof fetch === 'function'; }

  function chunkText(text, max) {
    // Divide por frases para no superar el límite de cada servicio (~500 caracteres).
    var parts = text.split(/(?<=[.!?。！？\n])\s+/);
    var chunks = [], cur = '';
    parts.forEach(function (p) {
      if ((cur + ' ' + p).trim().length > max && cur) { chunks.push(cur.trim()); cur = p; }
      else cur = (cur + ' ' + p).trim();
    });
    if (cur) chunks.push(cur.trim());
    return chunks.length ? chunks : [text];
  }

  function viaMyMemory(text, from, to) {
    var url = 'https://api.mymemory.translated.net/get?q=' + encodeURIComponent(text) +
      '&langpair=' + encodeURIComponent(from + '|' + to);
    return fetch(url).then(function (r) { return r.json(); }).then(function (d) {
      var out = d && d.responseData && d.responseData.translatedText;
      if (!out || /MYMEMORY WARNING/i.test(out)) throw new Error('MyMemory sin cuota');
      return out;
    });
  }

  function viaGoogle(text, from, to) {
    var url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=' +
      encodeURIComponent(from) + '&tl=' + encodeURIComponent(to) + '&dt=t&q=' + encodeURIComponent(text);
    return fetch(url).then(function (r) { return r.json(); }).then(function (d) {
      if (!d || !d[0]) throw new Error('Google sin respuesta');
      return d[0].map(function (seg) { return seg[0] || ''; }).join('');
    });
  }

  function viaLingva(text, from, to) {
    var url = 'https://lingva.ml/api/v1/' + encodeURIComponent(from) + '/' +
      encodeURIComponent(to) + '/' + encodeURIComponent(text);
    return fetch(url).then(function (r) { return r.json(); }).then(function (d) {
      if (!d || !d.translation) throw new Error('Lingva sin respuesta');
      return d.translation;
    });
  }

  function viaArgos(text, from, to) {
    return fetch('https://translate.argosopentech.com/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: text, source: from, target: to, format: 'text' })
    }).then(function (r) { return r.json(); }).then(function (d) {
      if (!d || !d.translatedText) throw new Error('Argos sin respuesta');
      return d.translatedText;
    });
  }

  var ONLINE = [viaMyMemory, viaGoogle, viaLingva, viaArgos];

  function translateChunk(text, from, to, i) {
    if (i >= ONLINE.length) return Promise.reject(new Error('ningún traductor en línea respondió'));
    return ONLINE[i](text, from, to).catch(function () { return translateChunk(text, from, to, i + 1); });
  }

  function translateOnline(text, from, to) {
    var chunks = chunkText(text, 450);
    var out = Promise.resolve('');
    chunks.forEach(function (c, idx) {
      out = out.then(function (acc) {
        return translateChunk(c, from, to, 0).then(function (t) {
          return acc + (idx ? ' ' : '') + t;
        });
      });
    });
    return out;
  }

  function translate(text, from, to) {
    from = from || 'zh'; to = to || 'es';
    if (hasTranslator()) {
      return window.Translator.create({ sourceLanguage: from, targetLanguage: to })
        .then(function (t) { return t.translate(text); })
        .catch(function () { return translateOnline(text, from, to); });
    }
    return translateOnline(text, from, to);
  }

  window.OSU = window.OSU || {};
  window.OSU.translate = { supported: supported, translate: translate };
})();
