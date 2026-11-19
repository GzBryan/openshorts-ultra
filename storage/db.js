/* storage/db.js — IndexedDB + localStorage. Todo local, nada se sube. */
(function () {
  'use strict';
  var DB_NAME = 'openshorts-ultra', STORE = 'projects', VER = 1;
  function openDB() {
    return new Promise(function (res, rej) {
      var rq = indexedDB.open(DB_NAME, VER);
      rq.onupgradeneeded = function () { rq.result.createObjectStore(STORE, { keyPath: 'id' }); };
      rq.onsuccess = function () { res(rq.result); };
      rq.onerror = function () { rej(rq.error); };
    });
  }
  function tx(mode, fn) {
    return openDB().then(function (db) {
      return new Promise(function (res, rej) {
        var t = db.transaction(STORE, mode), s = t.objectStore(STORE), out = fn(s);
        t.oncomplete = function () { db.close(); res(out && out.result); };
        t.onerror = function () { db.close(); rej(t.error); };
      });
    });
  }
  window.OSU = window.OSU || {};
  OSU.storage = {
    saveProject: function (p) { p.updatedAt = Date.now(); return tx('readwrite', function (s) { return s.put(p); }); },
    listProjects: function () {
      return tx('readonly', function (s) { return s.getAll(); }).then(function (all) {
        return (all || []).sort(function (a, b) { return b.updatedAt - a.updatedAt; });
      });
    },
    getProject: function (id) { return tx('readonly', function (s) { return s.get(id); }); },
    deleteProject: function (id) { return tx('readwrite', function (s) { return s.delete(id); }); },
    getSettings: function () { try { return JSON.parse(localStorage.getItem('osu-settings') || '{}'); } catch (e) { return {}; } },
    saveSettings: function (s) { localStorage.setItem('osu-settings', JSON.stringify(s)); }
  };
})();
