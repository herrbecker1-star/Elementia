// ============================================================
//  SERVICE WORKER – damit das Abenteuer ohne Netz startet
//
//  Von Hand geschrieben wie in App\pwa\sw.js, aber eigenständig:
//  Das Rollenspiel teilt mit der Karten-App keinen Code und keinen
//  Zwischenspeicher.
//
//  Strategie: Erst das Netz, dann der Zwischenspeicher (unten beim
//  fetch begründet). Beim Testen mit ?probe=1 wird kein Worker
//  angemeldet (spiel\start.js) – ein schon angemeldeter bleibt aber
//  zuständig, bis er ersetzt wird.
// ============================================================

// Bei JEDER Veröffentlichung erhöhen – sonst holt kein Handy die neue Fassung.
var FASSUNG = 3;
var SPEICHER = "elementia-abenteuer-" + FASSUNG;

var DATEIEN = [
  "./",
  "index.html",
  "manifest.webmanifest",
  "lib/phaser.min.js",
  "kern/zufall.js",
  "kern/spielstand.js",
  "kern/kampf.js",
  "kern/fangen.js",
  "kern/welt.js",
  "kern/auftreten.js",
  "daten/auftreten.js",
  "spiel/buch.js",
  "daten/elementals.js",
  "spiel/kampfszene.js",
  "grafik/elementals/eisen.png",
  "grafik/elementals/magnesium.png",
  "grafik/elementals/kohlenstoff.png",
  "grafik/elementals/kupfer.png",
  "grafik/elementals/zink.png",
  "grafik/elementals/schwefel.png",
  "grafik/kampf/dorf.jpg",
  "grafik/kampf/wald.jpg",
  "grafik/kampf/steppe.jpg",
  "kern/ereignisse.js",
  "daten/dialoge.js",
  "spiel/bausteine.js",
  "spiel/titel.js",
  "spiel/oberwelt.js",
  "spiel/ui.js",
  "spiel/start.js",
  "grafik/platzhalter-kacheln.png",
  "grafik/platzhalter-figuren.png",
  "karten/stoffingen.json",
  "icons/icon-192.png",
  "icons/icon-512.jpg"
];

self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(SPEICHER).then(function (speicher) {
      // Einzeln statt addAll: Eine fehlende Datei soll nicht die ganze
      // Offline-Fähigkeit kosten.
      return Promise.all(DATEIEN.map(function (pfad) {
        return speicher.add(new Request(pfad, { cache: "reload" }))["catch"](function () {
          console.warn("[sw] nicht gefunden:", pfad);
        });
      }));
    })["catch"](function () { /* gesperrter Speicher: dann eben nur online */ })
  );
  self.skipWaiting();
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (namen) {
      return Promise.all(namen.filter(function (n) {
        return n.indexOf("elementia-abenteuer-") === 0 && n !== SPEICHER;
      }).map(function (n) { return caches["delete"](n); }));
    }).then(function () { return self.clients.claim(); })
  );
});

// Erst das Netz, dann der Zwischenspeicher (seit Fassung 3).
// Vorher kam alles zuerst aus dem Speicher – beim ersten Öffnen nach
// einer Veröffentlichung lief dann noch das alte Spiel, und der neue
// Kampf war nicht zu sehen. Jetzt gilt: mit Netz immer das Neueste
// (und der Speicher wird nebenbei aufgefrischt), ohne Netz das Letzte.
self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request).then(function (antwort) {
      if (antwort && antwort.ok && new URL(e.request.url).origin === location.origin) {
        var kopie = antwort.clone();
        caches.open(SPEICHER).then(function (s) {
          // Ohne Suchteil ablegen, damit ?probe=1 und Co. offline dieselbe Seite finden.
          var u = new URL(e.request.url); u.search = "";
          s.put(u.toString(), kopie);
        })["catch"](function () {});
      }
      return antwort;
    })["catch"](function () {
      return caches.match(e.request, { ignoreSearch: true });
    })
  );
});
