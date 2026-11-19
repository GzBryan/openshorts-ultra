# OPENSHORTS ULTRA — Android offline

Versión independiente inspirada en OpenShorts (MIT, `upstream/` — no modificado).
Interfaz en español, tema negro + verde Matrix, sin créditos, sin límites, sin marca de agua.

## Estructura modular

```
frontend/   PWA: index.html, styles.css, manifest.json, sw.js, icon.svg
engine/     scene.js (escenas), clips.js (sugerencias), reframe.js (9:16),
            editor.js (vista previa), exporter.js (WebM con MediaRecorder)
ai/         score.js (heurística viral local), transcribe.js (Web Speech),
            tts.js (voces del dispositivo), translate.js (Translator API),
            youtube.js (títulos/hashtags locales), ugc.js (guiones locales)
storage/    db.js (IndexedDB + localStorage)
export/     srt.js (SRT/VTT)
android/    Proyecto Kotlin + WebView (compila en GitHub Actions)
.github/workflows/build-apk.yml
```

## Uso rápido

```bash
# Servir DESDE LA RAÍZ del proyecto (importante: los módulos viven en
# engine/, ai/, storage/ y export/ junto a frontend/)
cd ~/workspace/openshorts-ultra && python3 -m http.server 8080
# abre http://localhost:8080/frontend/
```

## APK

**No hay APK compilado en esta entrega** (sin Android SDK en esta VM).
Sigue `MANUAL_INSTALACION.md` opción B: sube el proyecto a GitHub y el workflow
`.github/workflows/build-apk.yml` compila `app-debug.apk`.

## Documentos

- `ANALISIS.md` — análisis del repo original y plan de adaptación
- `MANUAL_INSTALACION.md` — PWA, APK por Actions, Android Studio, firma release
- `MANUAL_OFFLINE.md` — qué funciona sin internet y qué necesita API
- `MODELOS_LOCALES.md` — Whisper, YOLOv8n, MediaPipe, Ollama: dónde descargarlos y dónde enchufarlos
