/* ai/translate.js — Traducción.
   Usa la API Translator del navegador (Chrome) si existe; si no, devuelve
   "no disponible" y la UI pide el texto traducido a mano. No se llama a ningún
   servicio externo en secreto. */
(function () {
  'use strict';
  function supported() { return !!(window.Translator && window.Translator.create); }
  function translate(text, from, to) {
    if (!supported()) return Promise.reject(new Error('Este navegador no trae traductor integrado. Pega la traducción manual.'));
    return window.Translator.create({ sourceLanguage: from || 'zh', targetLanguage: to || 'es' })
      .then(function (t) { return t.translate(text); });
  }
  window.OSU = window.OSU || {};
  OSU.translate = { supported: supported, translate: translate };
})();
