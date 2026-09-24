// ============================================================
//  SERVICE WORKER – damit das Abenteuer ohne Netz startet
//
//  Von Hand geschrieben wie in App\pwa\sw.js, aber eigenständig:
//  Das Rollenspiel teilt mit der Karten-App keinen Code und keinen
//  Zwischenspeicher.
//
//  Strategie: Erst der Zwischenspeicher, dann das Netz. Beim Testen
//  mit ?probe=1 wird kein Worker angemeldet (spiel\start.js).
// ============================================================

// Bei JEDER Veröffentlichung erhöhen – sonst holt kein Handy die neue Fassung.
var FASSUNG = 2;
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

self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(function (treffer) {
      return treffer || fetch(e.request);
    })
  );
});
