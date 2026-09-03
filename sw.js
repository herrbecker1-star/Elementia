// ============================================================
//  SERVICE WORKER – damit die Sammlung ohne Netz startet
//
//  Von Hand geschrieben, ohne Workbox oder vite-plugin-pwa. Das
//  ganze Vorhaben kommt ohne Node.js und ohne Build aus; eine
//  Bibliothek, die genau hier eine Werkzeugkette nachzieht, wäre
//  der teuerste Teil der App.
//
//  Er muss in der WURZEL der veröffentlichten Seite liegen. Ein
//  Service Worker überwacht nur seinen eigenen Ordner und alles
//  darunter – aus App\ heraus käme er an Karten\ nicht heran, und
//  dort liegen die Kartendaten und alle Bilder.
//  Siehe pwa\LIESMICH-pwa.md.
// ============================================================

// ------------------------------------------------------------
//  Diese Zahl bei JEDER Veröffentlichung erhöhen.
//  Sie ist der einzige Auslöser dafür, dass ein Handy die neue
//  Fassung holt. Wird sie vergessen, sitzt die halbe Klasse mit
//  der alten App da und niemand versteht, warum.
// ------------------------------------------------------------
var FASSUNG = 18;

var GERUEST_SPEICHER = "elementia-geruest-" + FASSUNG;
var BILD_SPEICHER    = "elementia-bilder-" + FASSUNG;

// Das Gerüst: alles, was die App zum Starten braucht. Bewusst OHNE
// die Kartenbilder – die sind zusammen um ein Vielfaches größer als
// alles andere und werden erst geholt, wenn jemand sie ansieht oder
// den Knopf "Alles für offline laden" drückt.
//
// Warum die Liste hier von Hand steht und nicht erzeugt wird: Sie
// hat neun Einträge und ändert sich fast nie. Ein Erzeuger dafür
// wäre mehr Code als die Liste.
var GERUEST = [
  "./",
  "index.html",
  "manifest.webmanifest",
  "App/sammlung.html",
  "App/duell.html",
  "geraetetest.html",
  "App/kern/kartenstil.js",
  "App/kern/stationscode.js",
  "App/kern/regeln.js",
  "App/kern/engine.js",
  "App/kern/ki.js",
  "App/kern/kanal.js",
  "App/lib/jsQR.js",
  "Karten/karten-daten.js",
  "icons/icon-192.png",
  "icons/apple-touch-icon.png"
];

// ============================================================
//  Einbauen
// ============================================================
self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(GERUEST_SPEICHER).then(function (speicher) {
      // Einzeln statt addAll: Ein fehlender Eintrag – etwa jsQR.js,
      // wenn jemand lib\ nicht mitgeladen hat – würde bei addAll die
      // GANZE Installation abbrechen, und dann startet die App gar
      // nicht mehr offline. Lieber neun von zehn Dateien.
      return Promise.all(GERUEST.map(function (pfad) {
        return speicher.add(new Request(pfad, { cache: "reload" }))["catch"](function () {
          console.warn("[sw] nicht gefunden:", pfad);
        });
      }));
    })["catch"](function (fehler) {
      // Hier landet man, wenn der Zwischenspeicher selbst nicht
      // aufgeht: volles Gerät, privater Modus, gesperrter Speicher
      // auf einem verwalteten Schul-Tablet. Beim Ausprobieren ist
      // genau das passiert (CacheStorage: "Unexpected internal
      // error"), und das Ergebnis war, dass der Worker "redundant"
      // wurde – also GAR kein Service Worker mehr da war.
      //
      // Der Fehler wird deshalb geschluckt. Die App verliert dann
      // ihre Offline-Fähigkeit, läuft aber online normal weiter.
      // Alles ohne Netz zu verlieren wäre schlimm; nichts zu haben,
      // weil man nicht alles haben kann, wäre schlimmer.
      console.warn("[sw] Zwischenspeicher nicht verfügbar:", fehler);
    }).then(function () { return self.skipWaiting(); })
  );
});

// ============================================================
//  Aufräumen – alte Fassungen wegwerfen
// ============================================================
self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (namen) {
      return Promise.all(namen.map(function (n) {
        var unser = n.indexOf("elementia-") === 0;
        var aktuell = (n === GERUEST_SPEICHER || n === BILD_SPEICHER);
        if (unser && !aktuell) return caches["delete"](n);
      }));
    })["catch"](function () { /* siehe install: kein Speicher, kein Drama */ })
     .then(function () { return self.clients.claim(); })
  );
});

// ============================================================
//  Ausliefern
//
//  Zwei Verhalten, weil die App zwei Sorten Dateien hat:
//
//  Bilder – aus dem Speicher, sonst holen und behalten. Sie ändern
//  sich nie: Ein neues Bild bekommt einen neuen Dateinamen, ein
//  geändertes wird von bilder-verkleinern.ps1 neu geschrieben und
//  landet über die erhöhte FASSUNG in einem neuen Speicher.
//
//  Alles andere – aus dem Speicher, aber im Hintergrund erneuern.
//  So startet die App auch im schlechten Schul-WLAN sofort und ist
//  beim nächsten Mal aktuell.
// ============================================================
function istBild(url) {
  return url.pathname.indexOf("/bilder-app/") >= 0 ||
         /\.(jpg|jpeg|png|webp)$/i.test(url.pathname);
}

// Jeder Zugriff auf den Zwischenspeicher kann fehlschlagen (siehe
// install). Passiert das mitten in einer Antwort, bekäme die Seite
// einen Netzwerkfehler und bliebe weiß – schlimmer als gar kein
// Service Worker. Diese beiden Helfer machen daraus ein "nichts
// gefunden" bzw. ein "nicht abgelegt".
function ausSpeicher(anfrage) {
  return caches.match(anfrage)["catch"](function () { return undefined; });
}

function inSpeicher(name, anfrage, antwort) {
  caches.open(name).then(function (s) {
    return s.put(anfrage, antwort);
  })["catch"](function () { /* nicht ablegbar – die Antwort steht trotzdem */ });
}

self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;

  var url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return;

  if (istBild(url)) {
    e.respondWith(
      ausSpeicher(e.request).then(function (treffer) {
        if (treffer) return treffer;
        return fetch(e.request).then(function (antwort) {
          if (antwort && antwort.ok) inSpeicher(BILD_SPEICHER, e.request, antwort.clone());
          return antwort;
        });
      })
    );
    return;
  }

  e.respondWith(
    ausSpeicher(e.request).then(function (treffer) {
      var ausDemNetz = fetch(e.request).then(function (antwort) {
        if (antwort && antwort.ok) inSpeicher(GERUEST_SPEICHER, e.request, antwort.clone());
        return antwort;
      })["catch"](function () {
        // Kein Netz. Wenn es auch nichts im Speicher gab, bleibt für
        // eine Seite die eigene Startseite – besser als der
        // Dinosaurier des Browsers.
        return treffer || ausSpeicher("App/sammlung.html");
      });
      return treffer || ausDemNetz;
    })
  );
});

// ============================================================
//  "Alles für offline laden"
//
//  Die Seite schickt die Bildliste herüber – sie kennt sie aus
//  karten-daten.js, hier wäre sie ein zweites Mal zu berechnen.
//  Gemeldet wird der Fortschritt zurück, denn es geht um mehrere
//  Megabyte, und ein Knopf, der eine Minute lang nichts tut, gilt
//  als kaputt.
// ============================================================
self.addEventListener("message", function (e) {
  if (!e.data || e.data.art !== "bilder-holen") return;

  var liste = e.data.liste || [];
  var kanal = e.ports && e.ports[0];
  var fertig = 0, gescheitert = 0;

  function melden(zustand) {
    if (kanal) kanal.postMessage({ zustand: zustand, fertig: fertig,
                                   gesamt: liste.length, gescheitert: gescheitert });
  }

  e.waitUntil(caches.open(BILD_SPEICHER).then(function (speicher) {
    // Sechs auf einmal. Alles gleichzeitig loszuschicken bringt im
    // Schul-WLAN nichts und lässt die Seite ruckeln.
    var naechstes = 0;

    function strang() {
      if (naechstes >= liste.length) return Promise.resolve();
      var pfad = liste[naechstes++];
      return speicher.match(pfad).then(function (schonDa) {
        if (schonDa) return;
        return fetch(pfad).then(function (antwort) {
          if (antwort && antwort.ok) return speicher.put(pfad, antwort);
          gescheitert++;
        })["catch"](function () { gescheitert++; });
      }).then(function () {
        fertig++;
        if (fertig % 5 === 0 || fertig === liste.length) melden("laeuft");
        return strang();
      });
    }

    var straenge = [];
    for (var i = 0; i < 6; i++) straenge.push(strang());
    return Promise.all(straenge);
  })["catch"](function () {
    // Kein Zwischenspeicher verfügbar. Der Knopf muss trotzdem eine
    // Antwort bekommen, sonst dreht sich die Meldung ewig.
    gescheitert = liste.length;
  }).then(function () { melden("fertig"); }));
});
