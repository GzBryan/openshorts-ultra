/* ai/ugc.js — Generador de guiones UGC LOCAL (plantillas, sin actor IA).
   Genera guion hook-problema-solución-CTA y narración. La generación de vídeo con
   actor IA, lip-sync y B-roll IA REQUIERE internet + fal.ai/ElevenLabs y NO se
   simula aquí: la UI lo etiqueta así. */
(function () {
  'use strict';
  function script(product, benefit, audience) {
    product = product || 'tu producto'; benefit = benefit || 'ahorrar tiempo'; audience = audience || 'creadores';
    return {
      hook: '¿Y si te dijera que ' + product + ' puede ayudarte a ' + benefit + ' en minutos?',
      problem: 'Muchos ' + audience + ' pierden horas cada día con lo mismo. Suena familiar, ¿verdad?',
      solution: 'Con ' + product + ', lo haces en tres pasos: lo abres, eliges y exportas. Sin complicaciones.',
      cta: 'Pruébalo hoy y cuéntame en comentarios qué te pareció. Enlace en la descripción.',
      narration: '¿Y si te dijera que ' + product + ' puede ayudarte a ' + benefit + ' en minutos? Muchos ' + audience + ' pierden horas cada día con lo mismo. Con ' + product + ', lo haces en tres pasos. Pruébalo hoy.'
    };
  }
  window.OSU = window.OSU || {};
  OSU.ugc = { script: script };
})();
