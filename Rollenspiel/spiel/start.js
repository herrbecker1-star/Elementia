// ============================================================
//  START – das Spiel zusammensetzen
// ============================================================

(function () {
  "use strict";

  // Mit ?probe=1 landen Fehler sichtbar auf dem Bildschirm. Auf einem
  // Handy gibt es keine Konsole, und ein stehendes Bild sagt nichts.
  if (MASS.probe) {
    var kasten = document.createElement("pre");
    kasten.id = "probe-fehler";
    kasten.style.cssText = "position:fixed;left:0;bottom:0;max-height:40%;overflow:auto;margin:0;padding:6px;" +
      "font:12px monospace;color:#ffb4b4;background:rgba(0,0,0,.8);z-index:20;white-space:pre-wrap;pointer-events:none";
    document.body.appendChild(kasten);
    var melde = function (text) { kasten.textContent += text + "\n"; kasten.scrollTop = kasten.scrollHeight; };
    window.addEventListener("error", function (e) { melde("Fehler: " + e.message + " (" + (e.filename || "").split("/").pop() + ":" + e.lineno + ")"); });
    window.addEventListener("unhandledrejection", function (e) { melde("Fehler: " + (e.reason && e.reason.message || e.reason)); });
    window.PROBE_MELDEN = melde;
    // Läuft die Spielschleife noch? Ein DOM-Zeitgeber, unabhängig von Phaser.
    var puls = document.createElement("div");
    puls.id = "probe-puls";
    puls.style.cssText = "position:fixed;right:4px;bottom:4px;font:11px monospace;color:#9fe870;background:#000a;padding:2px 4px;z-index:21;pointer-events:none";
    document.body.appendChild(puls);
    setInterval(function () {
      if (window.SPIEL) puls.textContent = "Bild " + window.SPIEL.loop.frame + " · " + Math.round(performance.now() / 100) / 10 + " s";
    }, 250);
  }

  var masse = MASS.leinwand();

  var spiel = new Phaser.Game({
    // ?grafik=canvas erzwingt den 2D-Renderer: für kopflose Fotos, bei
    // denen WebGL das letzte Bild nicht hergibt, und für alte Geräte.
    type: /[?&]grafik=canvas\b/.test(location.search) ? Phaser.CANVAS : Phaser.AUTO,
    parent: "spiel",
    backgroundColor: "#101418",
    pixelArt: true,
    roundPixels: true,
    // Leinwand in echten Bildpunkten, per zoom auf CSS-Größe gebracht.
    // Mode NONE, weil FIT oder RESIZE die Leinwand auf CSS-Pixel
    // setzen würden (siehe spiel\bausteine.js).
    scale: {
      mode: Phaser.Scale.NONE,
      width: masse.b,
      height: masse.h,
      zoom: 1 / MASS.dpr
    },
    // Bilder als <img> statt über XHR: Der Browser (und sein Service
    // Worker) behandelt sie dann wie jedes andere Bild, und kopflose
    // Fotos warten auf sie.
    loader: { imageLoadType: "HTMLImageElement" },
    // ?takt=1: Spielschleife über setTimeout statt requestAnimationFrame.
    // Nur für kopflose Fotos: Dort liefert Chrome in 20 s kaum drei
    // Bildtakte, und jeder Ablauf mit Zeitgebern bleibt stehen.
    fps: { forceSetTimeOut: /[?&]takt=1\b/.test(location.search) },
    input: { activePointers: 3 },     // Stick und Aktionsknopf gleichzeitig
    physics: { default: "arcade", arcade: { debug: /[?&]koerper=1\b/.test(location.search) } },
    scene: [LadeSzene, TitelSzene, OberweltSzene, UiSzene, KampfSzene]
  });

  // Drehen, Adressleiste ein/aus, Fenster ziehen: Die Leinwand folgt.
  // Kurz gebündelt, weil manche Handys beim Drehen mehrere
  // Größen hintereinander melden.
  var wartet = null;
  function anpassen() {
    clearTimeout(wartet);
    wartet = setTimeout(function () {
      var m = MASS.leinwand();
      spiel.scale.resize(m.b, m.h);
    }, 60);
  }
  window.addEventListener("resize", anpassen);
  window.addEventListener("orientationchange", anpassen);

  // Offline-Betrieb nur über http(s); von der Festplatte gibt es
  // keinen Service Worker, und das ist in Ordnung.
  if ("serviceWorker" in navigator && location.protocol !== "file:" && !MASS.probe) {
    navigator.serviceWorker.register("sw.js").catch(function (e) { console.warn("[sw]", e); });
  }

  window.SPIEL = spiel;
})();
