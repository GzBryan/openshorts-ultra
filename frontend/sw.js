/* Service Worker: caché offline de la app (archivos locales, no vídeos del usuario). */
var CACHE='osu-v1';
var FILES=['./','./index.html','./styles.css','./manifest.json',
'../storage/db.js','../export/srt.js','../ai/score.js','../engine/scene.js','../engine/clips.js',
'../engine/reframe.js','../ai/transcribe.js','../ai/tts.js','../ai/translate.js','../ai/youtube.js',
'../ai/ugc.js','../engine/editor.js','../engine/exporter.js'];
self.addEventListener('install',function(e){e.waitUntil(caches.open(CACHE).then(function(c){return c.addAll(FILES);}).catch(function(){}));self.skipWaiting();});
self.addEventListener('fetch',function(e){e.respondWith(caches.match(e.request).then(function(r){return r||fetch(e.request);}).catch(function(){return caches.match('./index.html');}));});
