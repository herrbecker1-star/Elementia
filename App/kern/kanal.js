// ============================================================
//  KANAL – wo die Züge des Gegners herkommen
//
//  Der Duell-Bildschirm soll nicht wissen, ob gegen den Computer,
//  auf einem Gerät zu zweit oder übers Netz gespielt wird. Er fragt
//  immer dasselbe:
//
//    kanal.steuert(index)          Bediene ICH diesen Spieler?
//    kanal.fordereZug(duell, sp, f)  Wenn nicht: bitte den Zug holen.
//    kanal.sendeZug(nummer, zug)   Ich habe gezogen – weitersagen.
//
//  Ein Zug ist ein winziges Objekt: {art:"angriff", index:0}. Weil
//  die Engine mit gesetzter Saat wiederholbar rechnet (zufallsQuelle
//  in engine.js), reicht das vollständig aus – beide Seiten rechnen
//  dasselbe Duell. Über das Netz gehen deshalb keine Spielstände,
//  sondern rund 30 Byte je Zug.
//
//  Braucht: engine.js, ki.js
// ============================================================

(function () {
  "use strict";

  // ------------------------------------------------------------
  //  Hot-Seat: ein Gerät, zwei Spieler
  //
  //  Beide Seiten werden hier bedient, also wird nie ein Zug
  //  angefordert. Der Bildschirm zeigt zwischen den Zügen einen
  //  Vorhang, damit die Handkarten verdeckt bleiben – am Tisch
  //  hält man die Karten schließlich auch vor die Brust.
  // ------------------------------------------------------------
  function hotseat(namen) {
    return {
      art: "hotseat",
      vorhang: true,
      namen: namen || ["Spieler 1", "Spieler 2"],
      meineSeite: null,                    // beide
      steuert: function () { return true; },
      fordereZug: null,
      sendeZug: function () { },
      schliessen: function () { }
    };
  }

  // ------------------------------------------------------------
  //  Computer
  //
  //  Nutzt KI.entscheide – dieselbe Spiellogik, mit der in der
  //  Werkstatt tausende Duelle gerechnet werden. Wer hier übt, übt
  //  also gegen genau den Gegner, an dem das Spiel ausbalanciert
  //  wurde, und nicht gegen eine zweite, schwächere Fassung.
  //
  //  Die Denkpause ist reine Anzeigesache: Ein Zug, der im selben
  //  Augenblick zurückkommt, wirkt wie ein Fehler.
  // ------------------------------------------------------------
  function computer(strategie, denkpause) {
    var pause = (denkpause === undefined) ? 700 : denkpause;
    return {
      art: "computer",
      vorhang: false,
      namen: ["Du", "Computer"],
      meineSeite: 0,
      steuert: function (index) { return index === 0; },
      fordereZug: function (duell, spieler, fertig) {
        var zug = window.KI.entscheide(duell, spieler, strategie || "vorsichtig");
        if (pause <= 0) { fertig(zug); return; }
        setTimeout(function () { fertig(zug); }, pause);
      },
      sendeZug: function () { },
      schliessen: function () { }
    };
  }

  // ------------------------------------------------------------
  //  Gleichlauf-Prüfsumme
  //
  //  Nur für den Netz-Kanal gedacht, steht aber hier, weil beide
  //  Seiten dieselbe Rechnung brauchen. Sie fasst den Spielstand in
  //  einer Zahl zusammen: Lebenspunkte aller Elementals, wer wo
  //  steht, wie viele Karten auf der Hand liegen.
  //
  //  Läuft das Duell auseinander (ein verlorener Zug, zwei
  //  verschiedene Fassungen der Kartendaten), weichen die Zahlen ab
  //  und der Bildschirm kann es SAGEN. Zwei Geräte, die
  //  unbemerkt verschiedene Spiele zeigen, wären das Schlimmste.
  // ------------------------------------------------------------
  function pruefsumme(duell) {
    var s = duell.zugZaehler * 7919 + (duell.amZug + 1) * 104729;
    for (var i = 0; i < duell.spieler.length; i++) {
      var p = duell.spieler[i];
      var teil = (p.arena ? p.arena.lp + 1 : 0) * 31 +
                 p.bank.length * 131 +
                 p.hand.ausruestung.length * 517 +
                 p.hand.verbindungen.length * 1009 +
                 p.ablage.length * 3121;
      for (var b = 0; b < p.bank.length; b++) teil += (b + 1) * (p.bank[b].lp + 1);
      s = (s * 33 + teil * (i + 1)) % 2147483647;
    }
    return s;
  }

  // ------------------------------------------------------------
  //  Netz – zwei Geräte über einen Cloudflare-Worker
  //
  //  Der Worker ist ein Briefkasten (siehe Worker\LIESMICH-worker.md).
  //  Er kennt die Regeln nicht. Die Sicherheit kommt nicht von ihm,
  //  sondern daher, dass JEDES Gerät jeden hereinkommenden Zug gegen
  //  moeglicheZuege() prüft.
  //
  //  optionen = {
  //    adresse:   "https://elementia-raum.name.workers.dev"
  //    code:      "MG42"
  //    eroeffner: true|false
  //    beiLage(text, verbunden)      Statusanzeige
  //    beiAufbau(aufbau)             der Eröffner schickt das Duell
  //    beiZug(nummer, zug, pruefsumme)
  //    beiPartner(anzahl)            jemand ist da / weg
  //  }
  // ------------------------------------------------------------
  function netz(optionen) {
    var o = optionen || {};
    var meineSeite = o.eroeffner ? 0 : 1;
    var socket = null;
    var offen = false;
    var empfangen = 0;          // wie viele Nachrichten schon da waren
    var wartetAufZug = null;    // fordereZug hat einen Zug bestellt
    var puffer = [];            // Züge, die vor der Bestellung ankamen
    var geschlossen = false;
    var versuche = 0;
    var neuZeit = null;

    function sag(text, verbunden) { if (o.beiLage) o.beiLage(text, !!verbunden); }

    function adresseBauen() {
      var a = String(o.adresse || "").trim().replace(/\/+$/, "");
      // Der Nutzer tippt eine https-Adresse ein; WebSocket braucht wss.
      a = a.replace(/^http:/i, "ws:").replace(/^https:/i, "wss:");
      if (!/^wss?:/i.test(a)) a = "wss://" + a;
      var code = String(o.code || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
      return a + "/raum/" + code;
    }

    function verbinden() {
      if (geschlossen) return;
      try { socket = new WebSocket(adresseBauen()); }
      catch (e) { sag("Die Adresse des Vermittlers ist unbrauchbar.", false); return; }

      socket.onopen = function () {
        offen = true; versuche = 0;
        sag("Verbunden. Warte auf den anderen …", true);
        // "ab" sagt, was schon angekommen ist – der Raum schickt nur
        // den Rest. Das ist der ganze Wiedereinstieg nach einem
        // gesperrten Handy.
        schicken({ t: "hallo", rolle: o.eroeffner ? "a" : "b", ab: empfangen });
      };

      socket.onmessage = function (ev) {
        var m;
        try { m = JSON.parse(ev.data); } catch (e) { return; }

        if (m.t === "willkommen") {
          (m.nachholen || []).forEach(verarbeiten);
          if (o.beiPartner) o.beiPartner(m.anzahl || 1);
          return;
        }
        if (m.t === "da") {
          sag("Der andere ist da.", true);
          if (o.beiPartner) o.beiPartner(m.anzahl || 2);
          return;
        }
        if (m.t === "weg") {
          sag("Der andere hat die Verbindung verloren. Warte …", true);
          if (o.beiPartner) o.beiPartner(1);
          return;
        }
        verarbeiten(m);
      };

      socket.onclose = function () {
        offen = false;
        if (geschlossen) return;
        // Wiederverbinden mit wachsendem Abstand. Ein Handy, das sich
        // sperrt, soll von selbst zurückfinden – ohne dass jemand
        // etwas antippen muss.
        versuche++;
        var wartezeit = Math.min(15000, 700 * versuche);
        sag("Verbindung weg. Neuer Versuch in " + Math.round(wartezeit / 1000) + " s …", false);
        neuZeit = setTimeout(verbinden, wartezeit);
      };

      socket.onerror = function () { /* onclose kommt gleich danach */ };
    }

    function verarbeiten(m) {
      empfangen++;
      if (m.t === "aufbau") {
        if (o.beiAufbau) o.beiAufbau(m.aufbau);
        return;
      }
      if (m.t === "zug") {
        if (wartetAufZug) {
          var fertig = wartetAufZug;
          wartetAufZug = null;
          fertig(m.zug, m.n, m.p);
        } else {
          puffer.push(m);
        }
        return;
      }
    }

    function schicken(nachricht) {
      if (!offen || !socket) return false;
      try { socket.send(JSON.stringify(nachricht)); return true; }
      catch (e) { return false; }
    }

    verbinden();

    return {
      art: "netz",
      vorhang: false,
      namen: o.eroeffner ? ["Du", "Gegner"] : ["Gegner", "Du"],
      meineSeite: meineSeite,
      code: o.code,

      steuert: function (index) { return index === meineSeite; },

      fordereZug: function (duell, spieler, fertig) {
        // Lag der Zug schon im Puffer, geht es sofort weiter.
        if (puffer.length) {
          var m = puffer.shift();
          fertig(m.zug, m.n, m.p);
          return;
        }
        wartetAufZug = fertig;
      },

      sendeAufbau: function (aufbau) { return schicken({ t: "aufbau", aufbau: aufbau }); },

      sendeZug: function (nummer, zug, pruefsumme) {
        return schicken({ t: "zug", n: nummer, zug: zug, p: pruefsumme });
      },

      istOffen: function () { return offen; },

      schliessen: function () {
        geschlossen = true;
        if (neuZeit) clearTimeout(neuZeit);
        if (socket) { try { socket.close(); } catch (e) { } }
      }
    };
  }

  // Ein Raumcode, den man am Telefon durchsagen kann: keine Ziffern
  // und Buchstaben, die sich verwechseln lassen (0/O, 1/I/L).
  function raumcode() {
    var zeichen = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
    var raus = "";
    for (var i = 0; i < 4; i++) {
      raus += zeichen.charAt(Math.floor(Math.random() * zeichen.length));
    }
    return raus;
  }

  window.KANAL = {
    hotseat: hotseat,
    computer: computer,
    netz: netz,
    raumcode: raumcode,
    pruefsumme: pruefsumme
  };
})();
