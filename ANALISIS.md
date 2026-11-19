# ANALISIS.md — OpenShorts (upstream) y plan de adaptación a Android offline

Fuente verificada: `upstream/` (clon de https://github.com/mutonby/openshorts, licencia MIT,
Copyright (c) 2024 OpenShorts). **No se modificó `upstream/`.** Esta versión, OPENSHORTS ULTRA,
es independiente, con identidad propia (negro + verde Matrix, interfaz en español) y sin
créditos, límites ni marcas de agua artificiales.

## 1. Qué es OpenShorts (según su README y su código)

> "The open-source OpusClip alternative. Turn long videos into viral 9:16 Shorts, TikToks and Reels.
> Self-host free (MIT) or use the hosted cloud."

Tres herramientas en una: **Clip Generator**, **AI Shorts (UGC con actores IA)** y **YouTube Studio**,
más autopublicación y Autopilot (solo en la nube de pago).

## 2. Mapa de módulos (upstream, verificado por lectura directa)

| Módulo upstream | Archivo(s) | Función real |
|---|---|---|
| API / backend | `app.py` (11.397 líneas), `main.py` (3.185), `serve.py`, `front.py` | FastAPI, subidas (límite 2 GB), cola de trabajos asíncrona, `MAX_CONCURRENT_JOBS=5` por defecto, archivos en `uploads/` y `output/` |
| Selección de clips | `clip_selection.py` (390 l.), `gemini_worker.py`, `llm_backend.py` | Gemini 3.1 Flash-Lite puntúa la transcripción + límites de escena y elige 3–15 momentos de 15–60 s, cada uno con puntuación viral |
| Detección de escenas | `scene_detection.py` (168 l.), `frame_sampler.py` | PySceneDetect (`scenedetect==0.7`) |
| Transcripción | `transcribe_backends.py` (870 l.) | faster-whisper (`faster-whisper==1.2.1`, word-level) o Parakeet en GPU; reintento CPU si la GPU se queda sin VRAM |
| Reencuadre 9:16 | `reframe_v2.py` (936 l.), `layout_picker.py`, `layout_ranges.py`, `split_layout.py`, `screencast_layout.py`, `active_speaker.py`, `camera_inset.py` | Modos TRACK (MediaPipe + YOLOv8), GENERAL (fondo desenfocado), SPLIT (dos personas apiladas, subtítulos en la junta), SCREENCAST (pantalla + presentador) |
| Subtítulos | `subtitles.py` (836 l.), `burned_subtitles.py` | Estilos, subtítulos quemados en el vídeo con FFmpeg |
| Editor | `editor.py`, `edit_builder.py`, `recut.py`, `hook_placement.py`, `hooks.py`, `punch_in.py` | Cortes por palabra, segmentos extra, cambio de encuadre, re-render |
| Doblaje / traducción | `translate.py` (285 l.) | ElevenLabs, 30+ idiomas, clonación de voz (con clave propia) |
| Miniaturas / YouTube | `thumbnail.py` (790 l.), `yt_account.py`, `yt_clients.py` | Miniaturas con cara sobre fondo, títulos, descripciones, capítulos, publicación |
| UGC / AI Shorts | `saasshorts.py`, `pro_mode.py`, `free_tools.py` | Guion (hook-problema-solución-CTA), actor con Flux 2 Pro, voz ElevenLabs, talking-head Hailuo 2.3 / Kling Avatar v2, B-roll, lip-sync VEED, composición FFmpeg |
| Publicación social | `social_platforms.py`, `social_metrics.py`, `s3_uploader.py` | Upload-Post (TikTok, Instagram, YouTube, Facebook, LinkedIn, Threads, Bluesky), S3 |
| Frontend | `dashboard/` (React + Vite + Tailwind, `src/App.jsx`) | Panel web |
| Infraestructura | `Dockerfile`, `docker-compose.yml`, `render-service/`, `remotion/`, `cloud/` (facturación, auth, metering — solo nube) | Docker, 8 GB+ RAM, GPU NVIDIA opcional (NVENC), 8 GB VRAM suficientes para `large-v3-turbo` fp16 |
| API para agentes | `mcp_server.py`, `mcp_stdio.py` | Servidor MCP / REST |

## 3. Dependencias clave (de `requirements.txt`, verificado)

`faster-whisper==1.2.1`, `scenedetect==0.7`, `mediapipe==0.10.14`,
`ultralytics==8.4.46` (YOLOv8), `torch==2.11.0`, `torchvision==0.26.0`,
FFmpeg (binario en `bin/ffmpeg`), FastAPI, React/Vite en `dashboard/`.

Claves externas que usa el upstream (no incluidas, el usuario las aporta):
Gemini (`GEMINI_API_KEY` / `LLM_BASE_URL` para Ollama/LM Studio/vLLM),
ElevenLabs, fal.ai, Upload-Post, AWS S3.

## 4. Qué es offline-capaz y qué NO (tabla honesta)

| Función | Upstream | En OPENSHORTS ULTRA (esta versión) |
|---|---|---|
| Importar vídeo local, recortar, velocidad, rotación, filtros | Local (FFmpeg) | **Offline, real** — Canvas + MediaRecorder en el navegador / WebView |
| Detección de escenas | PySceneDetect, local | **Offline, real** — muestreo de fotogramas + diferencia de píxeles (heurística, no PySceneDetect) |
| Puntuación viral | Gemini (nube) | **Offline, heurística local** — energía de audio + densidad de cambios de escena + densidad de palabras. Se etiqueta como heurística, NO es Gemini |
| Transcripción palabra por palabra | faster-whisper local (GPU/CPU, pesado) | **Parcial offline** — Web Speech API (depende del navegador/dispositivo; en Chrome Android suele requerir red). Fallback manual: pegar/editar texto. Sin Whisper en el navegador |
| Reencuadre 9:16, seguimiento facial | MediaPipe + YOLOv8, local | **Parcial** — API `FaceDetector` del navegador si existe; si no, recorte centrado + fondo desenfocado. YOLOv8/MediaPipe reales solo en el backend Python / app nativa (ver `MODELOS_LOCALES.md`) |
| Subtítulos quemados, SRT/VTT | FFmpeg, local | **Offline, real** — overlay en canvas al exportar; SRT/VTT generados localmente |
| Doblaje TTS | ElevenLabs (nube, clave) | **Offline, real (voz del dispositivo)** — `speechSynthesis` en español; clonación de voz NO disponible offline, solo con ElevenLabs + internet + autorización del propietario |
| Traducción | Nube | **Parcial** — API Translator del navegador si existe; si no, texto manual |
| Generador UGC (actor IA, lip-sync, B-roll IA) | fal.ai + ElevenLabs + Hailuo/Kling (nube, pago) | **NO offline** — solo generador de guiones local (plantillas). La generación de vídeo con actor se etiqueta claramente como "requiere internet + API" y no se simula |
| YouTube Studio (títulos, miniaturas) | Gemini + publicación | **Offline, real (plantillas locales)** — títulos/descripciones/hashtags por palabras clave, miniatura por canvas. Publicación en YouTube NO incluida (requiere OAuth + internet) |
| Historial, proyectos, ajustes | Servidor + S3 | **Offline, real** — IndexedDB + localStorage en el dispositivo |

## 5. Plan de adaptación para Android (lo aplicado en este proyecto)

1. **Frontend → PWA en `frontend/`**: una sola página en español, tema oscuro negro/verde
   Matrix, navegación inferior, sin servidor. Todo el procesamiento, en el navegador/WebView.
2. **Motor → `engine/`**: detección de escenas, clips, reencuadre, editor y exportación
   con APIs web estándar (Canvas, MediaRecorder, Web Audio, FaceDetector).
3. **IA → `ai/`**: transcripción, puntuación heurística, TTS, traducción y Studio con
   APIs del dispositivo o plantillas locales. Nada que finja ser Gemini/Whisper/ElevenLabs.
4. **Almacenamiento → `storage/`**: IndexedDB (proyectos, blobs de vídeo si caben) +
   localStorage (ajustes).
5. **Exportación → `export/`**: SRT/VTT, WebM exportado, PNG de miniatura, guion .txt.
6. **Android → `android/`**: proyecto Kotlin + WebView que empaqueta `frontend/`,
   permisos de almacenamiento, selector de archivos, procesamiento en segundo plano
   (WorkManager cuando Android lo permite). El APK se compila en GitHub Actions
   (no hay Android SDK en esta máquina virtual — ver `MANUAL_INSTALACION.md`).
7. **Modelos locales → `MODELOS_LOCALES.md`**: Whisper tiny/base, YOLOv8n y MediaPipe
   son descargables y enchufables en un backend Python/Kotlin futuro; en la PWA actual
   no se empaquetan (pesan cientos de MB y el navegador no los ejecuta sin WASM pesado).

## 6. Límites conocidos (sin adornar)

- La exportación del navegador es **WebM** (MediaRecorder), no MP4. Para MP4 hace falta
  FFmpeg nativo (Android) o convertir después en PC.
- Vídeos largos (>10–15 min) en un móvil modesto pueden ir lentos o quedarse sin memoria;
  la detección de escenas muestrea fotogramas para no cargar todo el vídeo en RAM.
- La transcripción automática depende del navegador; en muchos Android, Chrome usa el
  servicio de voz de Google (red). Sin red, usa el modo manual.
- Sin GPU, Whisper local real solo es viable en PC/servidor o en un módulo nativo
  futuro, no en esta PWA.
