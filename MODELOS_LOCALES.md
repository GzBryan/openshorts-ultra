# MODELOS_LOCALES.md — Modelos de IA locales (descargables)

Estos modelos **NO vienen empaquetados** en la PWA (pesan de decenas de MB a varios GB
y el navegador no los ejecuta sin un motor WASM pesado). Son los que usa el upstream
o sus equivalentes, y son el camino para una versión nativa con IA real.

## 1. Transcripción — Whisper (faster-whisper, upstream)

- Modelos: `tiny` (~75 MB), `base` (~145 MB), `small` (~490 MB), `large-v3-turbo` (~1,6 GB).
- Origen: Hugging Face `Systran/faster-whisper-tiny`, `-base`, `-small`, `-large-v3-turbo`.
- Uso en PC/servidor (el upstream): `pip install faster-whisper`, transcribe con
  `word_timestamps=True`. En GPU es rápido; en CPU, `tiny`/`base` son usables y
  `large-v3-turbo` necesita 8 GB de VRAM (según el README del upstream).
- En Android nativo (futuro): `whisper.cpp` (GGML) con el modelo `ggml-tiny.bin` /
  `ggml-base.bin` desde Hugging Face `ggerganov/whisper.cpp`. No incluido aquí.

## 2. Detección de personas / seguimiento facial — YOLOv8 + MediaPipe

- YOLOv8n: `yolov8n.pt` (~6 MB), Ultralytics (`ultralytics==8.4.46` en el upstream),
  https://github.com/ultralytics/assets/releases — detección de personas para reencuadre.
- MediaPipe Face Detection / Face Landmarker: modelos `.task` en
  https://developers.google.com/mediapipe — seguimiento facial en TRACK.
- En Android nativo: MediaPipe Tasks Vision (Java/Kotlin) o YOLOv8 en TFLite/ONNX.
- En esta PWA: se usa la API `FaceDetector` del navegador cuando existe; si no,
  recorte centrado (ver `engine/reframe.js`).

## 3. Detección de escenas — PySceneDetect

- `scenedetect==0.7`, local, sin modelo de red neuronal (detecta por cambio de contenido).
- En la PWA se replica la idea con muestreo de fotogramas + diferencia de píxeles
  (`engine/scene.js`). No es PySceneDetect, y así se indica en la interfaz.

## 4. LLM local para puntuación viral / guiones (alternativa a Gemini)

- Ollama (https://ollama.com): `ollama pull llama3.1:8b` o `qwen2.5:7b`, servir en
  `http://localhost:11434`. El upstream lo admite con `LLM_BASE_URL` apuntando a un
  servidor compatible con OpenAI.
- En Android: Ollama no corre directamente en el móvil; haría falta un servidor en la
  red local o un modelo GGUF con `llama.cpp` en nativo. Por eso la PWA usa una
  heurística local y deja el campo de proveedor en Ajustes como configuración.

## 5. Voces / doblaje local

- Voces del sistema (`speechSynthesis`): gratuitas, offline si el dispositivo las tiene
  descargadas (Android: Ajustes → Idioma → Texto a voz → descargar voz en español).
- ElevenLabs (nube, clave propia): clonación de voz solo con autorización del propietario.
- Coqui XTTS / Piper TTS: TTS local en PC/servidor; en Android, Piper tiene builds
  experimentales. No incluido.

## 6. Dónde enchufar cada modelo (arquitectura)

```
frontend/  →  UI (no cambia)
engine/    →  llama a ai/* ; si hay modelo nativo, lo llama por puente JS (WebView)
ai/        →  transcribe.js / score.js : aquí iría el puente a whisper.cpp
             (transcribeLocalWithWhisper) y a YOLO/MediaPipe (reframe.js)
android/   →  MainActivity.kt : expone @JavascriptInterface para los modelos nativos
```
Regla: ningún módulo finge un resultado. Si el modelo no está descargado/instalado,
la función devuelve "no disponible" y la UI lo muestra.
