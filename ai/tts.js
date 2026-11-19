/* ai/tts.js — Doblaje con voces DEL DISPOSITIVO (speechSynthesis).
   Real y offline si la voz está instalada. No es ElevenLabs ni clonación de voz.
   La clonación solo se haría con ElevenLabs + internet + autorización del propietario. */
(function () {
  'use strict';
  function voices(lang) {
    return speechSynthesis.getVoices().filter(function (v) { return !lang || v.lang.toLowerCase().indexOf(lang.toLowerCase().slice(0, 2)) === 0; });
  }
  function speak(text, opts) {
    opts = opts || {};
    return new Promise(function (resolve) {
      speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(text);
      u.lang = opts.lang || 'es-ES'; u.rate = opts.rate || 1; u.pitch = opts.pitch || 1;
      var vs = voices(opts.lang || 'es-ES');
      var pick = opts.voiceURI ? vs.find(function (v) { return v.voiceURI === opts.voiceURI; }) : vs[0];
      if (pick) u.voice = pick;
      u.onend = resolve; u.onerror = resolve;
      speechSynthesis.speak(u);
    });
  }
  window.OSU = window.OSU || {};
  OSU.tts = { voices: voices, speak: speak };
})();
