// ============================================================
//  SPIELSTAND – Speichern, Laden, Übertragen
//
//  Reine Logik, kein Phaser. Läuft genauso im Prüfstand.
//
//  Zwei Wege, weil einer nicht reicht: Der localStorage ist bequem,
//  aber auf iPhones überlebt er keine Ferien (Safari räumt nach
//  sieben Tagen ohne Besuch auf), in privaten Fenstern gibt es ihn
//  gar nicht. Deshalb lässt sich jeder Stand auch als Code
//  herausgeben und wieder einlesen – abschreiben, sich selbst
//  schicken, ins Heft kleben.
// ============================================================

var SPIELSTAND = (function () {
  "use strict";

  var SCHLUESSEL = "elementia-abenteuer-spielstand";
  var FASSUNG = 1;
  var CODE_VORSATZ = "EA1-";

  function neu() {
    return {
      fassung: FASSUNG,
      karte: "stoffingen",
      x: null,            // null = Startpunkt der Karte
      y: null,
      richtung: "unten",
      flags: {},
      gruppe: [],         // Elementals, die mitkommen (höchstens GRUPPE_MAX)
      lager: [],          // weitere gefangene Elementals
      vorrat: { reagenzglas: 3 },                 // Fanggeräte
      werkzeuge: ["lupe", "magnet", "stromkreis"], // zum Untersuchen
      bekannt: [],        // erkannte Arten (Stoffbuch)
      gespeichert: null
    };
  }

  var GRUPPE_MAX = 4;

  // Ein gefangenes Elemental kommt in die Gruppe, wenn Platz ist,
  // sonst ins Lager. Liefert "gruppe" oder "lager".
  function aufnehmen(stand, el) {
    if (stand.gruppe.length < GRUPPE_MAX) { stand.gruppe.push(el); return "gruppe"; }
    stand.lager.push(el);
    return "lager";
  }

  // Alles, was von außen kommt – localStorage oder abgetippter Code –,
  // wird geprüft, bevor das Spiel es anfasst. Ein halber Spielstand
  // soll mit einer Meldung scheitern, nicht mit einem schwarzen Bild.
  function pruefen(stand) {
    if (!stand || typeof stand !== "object") throw new Error("Kein Spielstand.");
    if (stand.fassung !== FASSUNG) throw new Error("Spielstand aus einer anderen Fassung (" + stand.fassung + ").");
    if (typeof stand.karte !== "string") throw new Error("Spielstand ohne Ort.");
    if (!stand.flags || typeof stand.flags !== "object") stand.flags = {};
    // Felder, die mit M1 dazukamen: fehlen sie in einem älteren
    // Stand, gelten die Anfangswerte.
    var anfang = neu();
    ["gruppe", "lager", "vorrat", "werkzeuge", "bekannt"].forEach(function (f) {
      if (!stand[f] || typeof stand[f] !== "object") stand[f] = anfang[f];
    });
    if (typeof stand.x !== "number" || typeof stand.y !== "number") { stand.x = null; stand.y = null; }
    if (["unten", "links", "rechts", "oben"].indexOf(stand.richtung) < 0) stand.richtung = "unten";
    return stand;
  }

  function speichern(stand) {
    stand.gespeichert = new Date().toISOString();
    try {
      localStorage.setItem(SCHLUESSEL, JSON.stringify(stand));
      return true;
    } catch (e) {
      return false;
    }
  }

  function laden() {
    try {
      var text = localStorage.getItem(SCHLUESSEL);
      return text ? pruefen(JSON.parse(text)) : null;
    } catch (e) {
      return null;
    }
  }

  function vorhanden() {
    return laden() !== null;
  }

  // UTF-8 über TextEncoder, weil btoa nur Latin-1 kennt und Flags
  // oder spätere Namen Umlaute tragen dürfen.
  function alsCode(stand) {
    var bytes = new TextEncoder().encode(JSON.stringify(stand));
    var roh = "";
    for (var i = 0; i < bytes.length; i++) roh += String.fromCharCode(bytes[i]);
    return CODE_VORSATZ + btoa(roh);
  }

  function ausCode(code) {
    var sauber = String(code || "").replace(/\s+/g, "");
    if (sauber.indexOf(CODE_VORSATZ) !== 0) throw new Error("Das ist kein Spielstand-Code (er beginnt mit " + CODE_VORSATZ + ").");
    var roh;
    try { roh = atob(sauber.slice(CODE_VORSATZ.length)); } catch (e) { throw new Error("Der Code ist unvollständig oder vertippt."); }
    var bytes = new Uint8Array(roh.length);
    for (var i = 0; i < roh.length; i++) bytes[i] = roh.charCodeAt(i);
    var stand;
    try { stand = JSON.parse(new TextDecoder().decode(bytes)); } catch (e) { throw new Error("Der Code ist unvollständig oder vertippt."); }
    return pruefen(stand);
  }

  return {
    FASSUNG: FASSUNG,
    GRUPPE_MAX: GRUPPE_MAX,
    neu: neu,
    aufnehmen: aufnehmen,
    pruefen: pruefen,
    speichern: speichern,
    laden: laden,
    vorhanden: vorhanden,
    alsCode: alsCode,
    ausCode: ausCode
  };
})();
