/* ai/youtube.js — YouTube Studio LOCAL (plantillas + palabras clave, sin Gemini).
   Extrae las palabras más frecuentes de la transcripción (sin palabras vacías en
   español/inglés) y genera títulos, descripción, hashtags y capítulos. */
(function () {
  'use strict';
  var STOP = new Set(('el la los las de en y a que es un una para con por se su sus del al lo como más pero sus este esta esto eso ese esa son fue ser ya o si no me mi te tu le les nos os cuando donde qué quién cómo por qué porque hasta desde sin sobre entre también muy bien mal hoy ayer'.split(' ')));
  function keywords(text, n) {
    var freq = {};
    text.toLowerCase().replace(/[^a-záéíóúñü0-9\s]/g, ' ').split(/\s+/).forEach(function (w) {
      if (w.length > 2 && !STOP.has(w)) freq[w] = (freq[w] || 0) + 1;
    });
    return Object.keys(freq).sort(function (a, b) { return freq[b] - freq[a]; }).slice(0, n || 8);
  }
  function titles(text, topic) {
    var k = keywords(text, 3), a = k[0] || topic || 'esto', b = k[1] || 'nadie te cuenta', c = k[2] || 'en 60 segundos';
    return [
      'El secreto de ' + a + ' que nadie te cuenta', '¿Por qué ' + a + ' cambia todo?',
      a + ': lo que ' + b, 'No hagas esto con ' + a, 'Así funciona ' + a + ' (' + c + ')',
      'La verdad sobre ' + a, a + ' explicado en 1 minuto', '3 cosas de ' + a + ' que debes saber',
      'Esto de ' + a + ' te va a sorprender', 'Cómo dominar ' + a + ' desde cero'
    ];
  }
  function description(text, title) {
    var k = keywords(text, 6);
    return title + '\n\nEn este vídeo hablamos de ' + k.join(', ') + '.\n\nSuscríbete para más vídeos cortos.\n\n#shorts';
  }
  function hashtags(text, n) {
    return keywords(text, n || 8).map(function (k) { return '#' + k.replace(/\s/g, ''); });
  }
  function chapters(scenes) {
    return scenes.map(function (t, i) {
      var m = Math.floor(t / 60), s = Math.floor(t % 60);
      return (m < 10 ? '0' + m : m) + ':' + (s < 10 ? '0' + s : s) + ' — Parte ' + (i + 1);
    });
  }
  window.OSU = window.OSU || {};
  OSU.youtube = { keywords: keywords, titles: titles, description: description, hashtags: hashtags, chapters: chapters };
})();
