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
      vorrat: {},         // Fanggefäße und Kältemischung – die ersten Gläser gibt es in der Nacht des Aufbruchs
      werkzeuge: [],      // Lupe, Magnet, Stromkreis, Hammer leiht Mara aus (Quest 1); Laborgeräte
      bekannt: [],        // erkannte Arten (Stoffbuch)
      gesehen: [],        // Arten, gegen die man bei einem Stoffmeister gekämpft hat (seit Fassung 17)
      geld: 0,            // Taler (seit Fassung 17)
      material: {},       // Glasbruch, Quarz
      funde: {},          // Fundstelle → Spieltag, an dem sie zuletzt geleert wurde
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

  // Holt das Elemental Nummer nr aus dem Lager in die Gruppe. Ist die
  // Gruppe voll, geht das unterste Gruppenmitglied an seinen Platz.
  function ausLager(stand, nr) {
    var el = stand.lager[nr];
    if (!el) return;
    if (stand.gruppe.length < GRUPPE_MAX) { stand.lager.splice(nr, 1); stand.gruppe.push(el); return; }
    stand.lager[nr] = stand.gruppe[stand.gruppe.length - 1];
    stand.gruppe[stand.gruppe.length - 1] = el;
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
    ["gruppe", "lager", "vorrat", "werkzeuge", "bekannt", "gesehen", "material", "funde"].forEach(function (f) {
      if (!stand[f] || typeof stand[f] !== "object") stand[f] = anfang[f];
    });
    if (typeof stand.geld !== "number" || !(stand.geld >= 0)) stand.geld = 0;
    // Seit Fassung 17 fängt man mit Gefäßen. Tiegelzange und Spatel aus
    // älteren Ständen werden zu Reagenzgläsern; wer eine Tiegelzange hatte,
    // behält sie als Laborgerät. Der Erlenmeyerkolben war ein Werkzeug und
    // ist jetzt ein Gefäß.
    var v = stand.vorrat;
    if (v.tiegelzange > 0 && stand.werkzeuge.indexOf("tiegelzange") < 0) stand.werkzeuge.push("tiegelzange");
    ["tiegelzange", "spatel"].forEach(function (alt) {
      if (v[alt] > 0) v.reagenzglas = (v.reagenzglas || 0) + v[alt];
      delete v[alt];
    });
    var ek = stand.werkzeuge.indexOf("erlenmeyerkolben");
    if (ek >= 0) { stand.werkzeuge.splice(ek, 1); v.erlenmeyerkolben = (v.erlenmeyerkolben || 0) + 1; }
    // Das Labor war bis Fassung 16 ein Punkt vor der Tür; jetzt ist es ein Raum.
    if (stand.labor && (stand.labor.karte === "stoffingen" || stand.labor.karte === "brenner")) stand.labor = { karte: "labor_" + stand.labor.karte, x: null, y: null };
    // Seit Fassung 6 (25.10.2026) trägt der Starter eine Markierung. In
    // älteren Ständen bekommt sie das erste Elemental der gewählten Art.
    var alle = stand.gruppe.concat(stand.lager);
    // Seit Fassung 8: eigene Angriffsliste je Elemental (Angriffe lernen)
    alle.forEach(function (el) {
      if (!Array.isArray(el.angriffe) && typeof ARTEN !== "undefined" && ARTEN[el.art]) el.angriffe = ARTEN[el.art].reaktionen.slice();
      // Seit Fassung 12: Sulfidbildung heißt Sulfurierung, „Sulfid bilden“
      // ist entfallen (Zink bekommt Funkenflug). Doppelte fallen weg.
      if (Array.isArray(el.angriffe) && typeof ALTE_ANGRIFFE !== "undefined") {
        el.angriffe = el.angriffe.map(function (id) { return ALTE_ANGRIFFE[id] || id; })
          .filter(function (id, i, liste) { return liste.indexOf(id) === i; });
      }
      // Die LP-Skala ist seit Fassung 12 kleiner: nicht mehr als voll.
      if (typeof KAMPF !== "undefined" && ARTEN[el.art] && typeof el.zh === "number") el.zh = Math.min(el.zh, KAMPF.werte(el).zhMax);
    });
    if (stand.flags.starter && !alle.some(function (el) { return el.starter; })) {
      var erster = alle.filter(function (el) { return el.art === stand.flags.starter; })[0];
      if (erster) erster.starter = true;
    }
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
    ausLager: ausLager,
    pruefen: pruefen,
    speichern: speichern,
    laden: laden,
    vorhanden: vorhanden,
    alsCode: alsCode,
    ausCode: ausCode
  };
})();
