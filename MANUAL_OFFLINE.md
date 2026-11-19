# MANUAL_OFFLINE.md — Uso sin internet

OPENSHORTS ULTRA está diseñada para trabajar sin conexión. Todo lo de la tabla
"Funciona offline" se ejecuta en tu dispositivo y ningún vídeo sale de él.

## Funciona 100% offline (después de la primera carga)

- Abrir la app, importar vídeos locales, ver la vista previa.
- Recortar (inicio/fin), velocidad, rotación, filtros, volumen.
- Detección de escenas por muestreo de fotogramas.
- Sugerencias de clips 3–15, de 15–60 s, con puntuación heurística local
  (energía de audio + cambios de escena + densidad de palabras — ver `ai/score.js`).
- Reencuadre 9:16 / 16:9 / 1:1, fondo desenfocado, modo dos personas (dividido).
- Subtítulos: edición manual, estilos, colores, exportación SRT/VTT y quemado en el vídeo.
- Doblaje con voces del dispositivo (`speechSynthesis`, español).
- Generador de títulos, descripciones, hashtags y miniaturas (plantillas locales).
- Generador de guiones UGC (plantillas locales, sin actor IA).
- Guardar / cargar / borrar proyectos, historial y ajustes (IndexedDB + localStorage).
- Exportar clips en WebM (individual y por lotes).

## Funciona parcialmente offline (depende del navegador/dispositivo)

| Función | Comportamiento sin red |
|---|---|
| Transcripción automática (Web Speech API) | En Chrome Android suele usar el servicio de voz de Google → **necesita red**. Sin red, la app avisa y ofrece pegar el texto o escribirlo a mano. En algunos navegadores de escritorio con reconocimiento local, funciona sin red. |
| Traducción automática | Usa la API Translator del navegador si existe; si no existe, la app avisa y pide el texto traducido a mano. |
| Detección facial (`FaceDetector`) | Si el navegador la trae, es local. Si no la trae, la app usa recorte centrado y lo indica. |

## Necesita internet (la app lo etiqueta, no lo simula)

- Puntuación viral con Gemini, transcripción Whisper en la nube, doblaje ElevenLabs,
  clonación de voz, generación de actor IA / lip-sync (fal.ai, Hailuo, Kling),
  publicación en YouTube/TikTok/Instagram y autopublicación.
- Para usarlos, ve a **Ajustes → Proveedores externos** y pega tu propia clave API.
  Sin clave, esos botones muestran el aviso y no hacen nada falso.
- El upstream original permite un LLM local (Ollama/LM Studio) con `LLM_BASE_URL`;
  en esta PWA ese campo es solo configuración guardada para el futuro módulo nativo.

## Cómo trabajar offline, paso a paso

1. Carga la app una vez con internet (o instálala como PWA) para que el Service Worker
   guarde los archivos en caché.
2. Activa el modo avión. Abre la app desde el icono: debe abrir igual.
3. Importa un vídeo → **Clips** → "Detectar escenas" → elige clips → **Editor** →
   ajusta recorte y formato → **Subtítulos** → pega o escribe el texto →
   **Exportar** → se descarga el WebM en tu dispositivo.
4. El proyecto se guarda solo al pulsar "Guardar proyecto". Al cerrar y reabrir,
   aparece en **Proyectos** (el vídeo se guarda si cabe en IndexedDB; si es muy
   grande, la app guarda solo los ajustes y te pedirá reimportar el vídeo).

## Datos y privacidad

- Nada se sube: no hay servidor, no hay analítica, no hay cuenta.
- Borrar los datos del navegador / desinstalar la PWA borra también los proyectos
  guardados. Exporta los clips y los .srt importantes antes de limpiar datos.
