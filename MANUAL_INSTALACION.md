# MANUAL_INSTALACION.md — OPENSHORTS ULTRA

## 1. Qué se entrega (sin engaños)

- **PWA / app web** en `frontend/` — funciona HOY, sin compilar nada.
- **Proyecto Android** en `android/` — código Kotlin + WebView listo para compilar.
- **APK: NO está compilado en esta entrega.** En esta máquina virtual no hay Android SDK
  ni Java. El APK se genera con GitHub Actions (paso 3) o con Android Studio (paso 4).
  No se afirma que exista un APK hasta que una compilación lo produzca.

## 2. Opción A — Usar la PWA ahora mismo (recomendada, 2 minutos)

1. Sirve el proyecto **desde su raíz** (no desde `frontend/`, porque los módulos
   JS viven en `engine/`, `ai/`, `storage/` y `export/` junto a `frontend/`):
   ```bash
   cd ~/workspace/openshorts-ultra
   python3 -m http.server 8080
   ```
   y abre `http://localhost:8080/frontend/` en el navegador. También vale abrir
   `frontend/index.html` directamente (doble clic), pero el Service Worker solo
   se registra con `http(s)://`.
2. En Android (Chrome): menú ⋮ → **Añadir a pantalla principal** / **Instalar aplicación**.
   Queda el icono en el escritorio, se abre a pantalla completa y funciona sin internet
   después de la primera carga.
3. Permisos: al importar un vídeo, el navegador pide acceso al archivo que tú eliges.
   Nada se sube a ningún servidor.

## 3. Opción B — Generar el APK con GitHub Actions (sin instalar nada)

1. Crea un repositorio en GitHub y sube TODO el contenido de `~/workspace/openshorts-ultra/`
   (sin `upstream/`, que es solo referencia; no hace falta subirlo).
2. En GitHub: **Actions** → el workflow `.github/workflows/build-apk.yml` se ejecuta
   automáticamente al hacer push a `main` (también se puede lanzar a mano:
   Actions → "Build APK" → Run workflow).
3. El workflow instala JDK 17 y el Android SDK, compila `android/` con Gradle
   (`assembleDebug`) y sube el artefacto **`app-debug.apk`**.
4. Descarga el artefacto desde la pestaña del run, pásalo al móvil e instálalo.
   Android pedirá permitir "instalar aplicaciones desconocidas" para el navegador o el
   gestor de archivos que uses — es normal fuera de Play Store.
5. El APK es **debug, sin firmar para Play Store**. Para publicar en Play Store hay que
   generar una keystore de release y firmar el AAB/APK (ver paso 5).

## 4. Opción C — Compilar en tu PC con Android Studio

1. Instala Android Studio (versión con JDK 17) y el SDK de Android (API 34).
2. Abre la carpeta `android/` como proyecto.
3. Copia `frontend/` dentro de `android/app/src/main/assets/web/` si aún no está
   (el workflow de Actions lo hace solo; en local hazlo a mano).
4. Build → Build APK(s) → el APK queda en `android/app/build/outputs/apk/debug/`.

## 5. Firma release (solo si vas a publicar)

```bash
keytool -genkeypair -v -keystore release.keystore -alias ultra -keyalg RSA -keysize 2048 -validity 10000
# en android/gradle.properties añade:
#   ULTRA_STORE_FILE=../release.keystore
#   ULTRA_STORE_PASSWORD=...
#   ULTRA_KEY_ALIAS=ultra
#   ULTRA_KEY_PASSWORD=...
```
**Guarda la keystore y sus contraseñas fuera del repositorio. Perderla impide actualizar
la app en Play Store.**

## 6. Permisos Android (ya declarados en `AndroidManifest.xml`)

- `READ_MEDIA_VIDEO` (Android 13+) / `READ_EXTERNAL_STORAGE` (anteriores)
- `WRITE_EXTERNAL_STORAGE` (solo API ≤ 28), `FOREGROUND_SERVICE` para exportación en segundo plano
- `RECORD_AUDIO` solo si en el futuro se añade grabación de voz (ahora no se usa)
- `INTERNET` declarado pero la app funciona sin red; solo se usa si el usuario configura
  un proveedor externo (ElevenLabs / Gemini / Ollama) en Ajustes.

## 7. Solución de problemas

| Problema | Causa probable / solución |
|---|---|
| Actions falla en `assembleDebug` | Revisa el log del paso Gradle; lo habitual es falta de `local.properties` (el workflow lo genera) o versión de Gradle. |
| El APK no instala | APK debug de otra arquitectura no: es universal. Activa "orígenes desconocidos" y comprueba espacio libre. |
| La PWA no se instala | Debe servirse por `http://localhost` o `https://`; con `file://` no hay Service Worker. |
| El vídeo no se importa | Formato no soportado por el navegador (usa MP4 H.264 o WebM). |
