// ============================================================
//  OBERWELT – Karte, Laufen, Ansprechen
//
//  Die Eingabe (Stick, Knöpfe, Tastatur) liegt ganz in der
//  UI-Szene. Die Oberwelt fragt sie nur ab. So gibt es genau eine
//  Stelle, die weiß, ob gerade ein Dialog läuft.
// ============================================================

var TEMPO = 110;          // Weltpixel je Sekunde, gut drei Kacheln
var REICHWEITE = 22;      // wie nah man jemandem gegenüberstehen muss

// Schemen: freie Elementals, sichtbar, aber unerkannt (M2).
var SCHEMEN = {
  TAKT: 3000,             // alle 3 s ein Versuch, einen neuen zu erzeugen
  HOECHSTENS: 5,          // gleichzeitig auf der Karte
  MIN_ABSTAND: 4,         // Kacheln zum Spieler – nicht direkt vor der Nase
  // Anteil der Versuche an besonderen Orten (alles außer Wiese). Ohne
  // ihn kamen 83 % aller Schemen von der Wiese – der Garten hat 24 von
  // 641 Kacheln, und wer dort stand, sah nie Magnesium (gemessen 24.09.2026).
  BESONDERE_ORTE: 0.5,
  MAX_ABSTAND: 18,
  LEBENSDAUER: [90, 150], // Sekunden, dann verblasst er
  TEMPO: 16,              // Weltpixel je Sekunde, gemächliches Umherstreifen
  BERUEHRUNG: 16          // Abstand in Weltpixeln, ab dem es zum Kampf kommt
};

class OberweltSzene extends Phaser.Scene {
  constructor() { super("oberwelt"); }

  create(daten) {
    var szene = this;
    this.stand = daten.stand;

    // ---------- Karte ----------
    var karte = this.make.tilemap({ key: this.stand.karte });
    var satz = karte.addTilesetImage("platzhalter", "kacheln");
    karte.createLayer("boden", satz);
    this.hindernisse = karte.createLayer("hindernisse", satz);
    this.hindernisse.setCollisionByExclusion([-1]);
    this.karte = karte;
    this.physics.world.setBounds(0, 0, karte.widthInPixels, karte.heightInPixels);

    // ---------- Objekte der Karte ----------
    // Eigenschaften siehe werkzeug\platzhalter-bauen.ps1. Vier Sorten:
    //   Ankunftspunkte, Ausgänge (beim Betreten), Auslöser (einmal beim
    //   Betreten) und alles zum Ansprechen (mit oder ohne Figur).
    this.ansprechbar = [];
    this.ausgaenge = [];
    this.ausloeser = [];
    this.punkte = {};
    this.personen = this.physics.add.staticGroup();
    var start = { x: karte.widthInPixels / 2, y: karte.heightInPixels / 2 };

    karte.getObjectLayer("objekte").objects.forEach(function (o) {
      var eig = {};
      (o.properties || []).forEach(function (p) { eig[p.name] = p.value; });
      var eintrag = { name: o.name, x: o.x, y: o.y, dialog: eig.dialog, eig: eig, figur: null };
      if (eig.ankunft) { szene.punkte[o.name] = { x: o.x, y: o.y }; if (o.name === "start") start = { x: o.x, y: o.y }; return; }
      if (eig.ziel || o.name.indexOf("ausgang") === 0) { szene.ausgaenge.push(eintrag); return; }
      if (eig.ausloeser) { szene.ausloeser.push(eintrag); return; }

      if (eig.figur !== undefined) {
        var spr = szene.personen.create(o.x, o.y, "figuren", eig.figur * 8 + richtungsSpalte(eig.richtung));
        spr.body.setSize(20, 12, false).setOffset(6, 19);
        spr.setDepth(o.y);
        eintrag.figur = spr;
        eintrag.figurNr = eig.figur;
      } else if (eig.bild) {
        var ding = szene.personen.create(o.x, o.y, szene.dingTextur(eig.bild));
        ding.body.setSize(20, 12, false).setOffset(6, 19);
        ding.setDepth(o.y);
        eintrag.figur = null;
        eintrag.ding = ding;
      }
      szene.ansprechbar.push(eintrag);
    });

    this.startpunkt = start;

    // ---------- Spielfigur ----------
    // Nach einem Kartenwechsel steht im Spielstand, an welchem Punkt man ankommt.
    if (this.stand.ankunft && this.punkte[this.stand.ankunft]) {
      var p = this.punkte[this.stand.ankunft];
      this.stand.x = p.x; this.stand.y = p.y;
    }
    delete this.stand.ankunft;
    var x = this.stand.x !== null ? this.stand.x : start.x;
    var y = this.stand.y !== null ? this.stand.y : start.y;
    this.held = this.physics.add.sprite(x, y, "figuren", richtungsSpalte(this.stand.richtung));
    this.held.body.setSize(16, 10).setOffset(8, 21);
    this.held.setCollideWorldBounds(true);
    this.richtung = this.stand.richtung;
    this.physics.add.collider(this.held, this.hindernisse);
    this.physics.add.collider(this.held, this.personen);

    // ---------- Kamera ----------
    var kamera = this.cameras.main;
    kamera.setBounds(0, 0, karte.widthInPixels, karte.heightInPixels);
    kamera.startFollow(this.held, true);
    kamera.setRoundPixels(true);
    this.zoomAnpassen();
    this.scale.on("resize", this.zoomAnpassen, this);

    // ---------- Zeit, Wetter, Schemen (M2) ----------
    this.zufall = ZUFALL();
    WELT.einrichten(this.stand, "feuerlande", this.zufall);
    this.lagen = AUFTRETEN.kartenLagen(this.cache.tilemap.get(this.stand.karte).data);
    this.auftritte = AUFTRITTE[this.stand.karte] || [];
    this.schemen = [];
    this.time.addEvent({ delay: SCHEMEN.TAKT, loop: true, callback: this.schemenErzeugen, callbackScope: this });
    this.letzteWarnung = -99999;

    // Prüfschalter ?anfassen=1: nach einer Sekunde ein Schemen genau an
    // der Spielfigur – so lässt sich der Weg in den Kampf kopflos prüfen.
    if (/[?&]anfassen=1\b/.test(location.search)) {
      this.time.delayedCall(1000, function () {
        szene.schemenTextur();
        var kx = Math.floor(szene.held.x / 32), ky = Math.floor(szene.held.y / 32);
        var lage = szene.lageAn(kx, ky);
        var wahl = AUFTRETEN.waehle(szene.auftritte, lage, szene.zufall) || { art: "zink", stufe: 3 };
        szene.schemenSetzen(kx, ky, wahl, lage);
        szene.schemen[szene.schemen.length - 1].setPosition(szene.held.x, szene.held.y + 6).setAlpha(1);
      });
    }

    this.sichtbarkeitAnpassen();
    this.cameras.main.fadeIn(250, 16, 20, 24);

    // ---------- Oberfläche darüber ----------
    this.scene.launch("ui", { oberwelt: this });
    this.ui = this.scene.get("ui");

    // Wer das Handy weglegt oder die App wechselt, verliert nichts.
    this.beimVerstecken = function () {
      if (document.visibilityState === "hidden") szene.speichern();
    };
    document.addEventListener("visibilitychange", this.beimVerstecken);

    this.events.once("shutdown", function () {
      szene.scale.off("resize", szene.zoomAnpassen, szene);
      document.removeEventListener("visibilitychange", szene.beimVerstecken);
      szene.scene.stop("ui");
    });
  }

  zoomAnpassen() {
    this.cameras.main.setZoom(MASS.weltZoom(this.scale.width, this.scale.height));
  }

  // Kleine Dinge auf der Karte, als Platzhalter gezeichnet.
  dingTextur(name) {
    var schluessel = "ding-" + name;
    if (this.textures.exists(schluessel)) return schluessel;
    var g = this.make.graphics({ add: false });
    if (name === "schild") {
      g.fillStyle(0x6e4626).fillRect(14, 16, 4, 14);
      g.fillStyle(0xa07848).fillRect(4, 6, 24, 12);
      g.fillStyle(0x6e4626).fillRect(6, 9, 20, 1).fillRect(6, 13, 16, 1);
    } else if (name === "kiste") {
      g.fillStyle(0x6e4626).fillRect(5, 12, 22, 16);
      g.fillStyle(0x8a5a32).fillRect(5, 10, 22, 5);
      g.fillStyle(0xc9a66b).fillRect(14, 16, 4, 4);
      g.fillStyle(0xf4ead5).fillRect(8, 18, 5, 4);   // der Zettel
    } else {
      // Ein Laborgerät, das an einem Ast hängt: Pfahl mit Glaskörper
      g.fillStyle(0x6b4424).fillRect(15, 4, 2, 26);
      g.fillStyle(0x6b4424).fillRect(9, 4, 14, 2);
      g.fillStyle(0xcfeeff, 0.95).fillRect(8, 8, 5, 12);
      g.fillStyle(0xffffff).fillRect(9, 9, 1, 8);
      g.fillStyle(0xffe08a).fillCircle(24, 10, 2);   // ein Funkeln: „Hier gibt es etwas.“
    }
    g.generateTexture(schluessel, 32, 32);
    g.destroy();
    return schluessel;
  }

  // Figuren mit nurWenn/nichtWenn erscheinen oder verschwinden je nach Flags.
  sichtbarkeitAnpassen() {
    var flags = this.stand.flags;
    this.ansprechbar.forEach(function (e) {
      var sichtbar = bedingungErfuellt(e.eig, flags);
      e.aktiv = sichtbar;
      [e.figur, e.ding].forEach(function (spr) {
        if (!spr) return;
        spr.setVisible(sichtbar);
        spr.body.enable = sichtbar;
      });
    });
  }

  // Wechsel auf eine andere Karte: Die Szene startet mit dem neuen Ort neu.
  wechsleKarte(ziel, punkt) {
    this.stand.karte = ziel;
    this.stand.ankunft = punkt;
    this.stand.x = null; this.stand.y = null;
    SPIELSTAND.speichern(this.stand);
    this.cameras.main.fadeOut(250, 16, 20, 24);
    var szene = this;
    this.cameras.main.once("camerafadeoutcomplete", function () { szene.scene.restart({ stand: szene.stand }); });
  }

  // Ausgänge und Auslöser prüfen, sobald man sie betritt.
  betreten() {
    var held = this.held, szene = this, flags = this.stand.flags;
    for (var i = 0; i < this.ausgaenge.length; i++) {
      var a = this.ausgaenge[i];
      if (Phaser.Math.Distance.Between(held.x, held.y + 6, a.x, a.y) > 22) continue;
      // Zurückschieben, damit man nicht auf dem Ausgang stehen bleibt
      var zurueck = function () {
        var dx = szene.karte.widthInPixels / 2 - a.x, dy = szene.karte.heightInPixels / 2 - a.y;
        var d = Math.hypot(dx, dy) || 1;
        held.x += dx / d * 28; held.y += dy / d * 28;
      };
      if (a.eig.offenWenn && !flags[a.eig.offenWenn]) {
        zurueck();
        this.ui.dialogFuehren(DIALOGE[a.eig.gesperrt] || [{ erzaehl: "Hier geht es noch nicht weiter." }], flags);
        return true;
      }
      if (a.eig.ziel) { this.wechsleKarte(a.eig.ziel, a.eig.punkt); return true; }
      if (a.dialog) { zurueck(); this.ui.dialogFuehren(DIALOGE[a.dialog], flags); return true; }
    }
    for (var j = 0; j < this.ausloeser.length; j++) {
      var t = this.ausloeser[j];
      var merker = "ausgeloest_" + this.stand.karte + "_" + t.name;
      if (flags[merker] || !bedingungErfuellt(t.eig, flags)) continue;
      if (Phaser.Math.Distance.Between(held.x, held.y, t.x, t.y) > 28) continue;
      flags[merker] = true;
      this.ui.dialogFuehren(DIALOGE[t.dialog], flags);
      return true;
    }
    return false;
  }

  // ---------- Spielstand ----------
  speichern() {
    this.stand.x = Math.round(this.held.x);
    this.stand.y = Math.round(this.held.y);
    this.stand.richtung = this.richtung;
    return SPIELSTAND.speichern(this.stand);
  }

  // ---------- Labor ----------
  heilen() {
    // Hierher kehrt man nach einer Niederlage zurück.
    this.stand.labor = { karte: this.stand.karte, x: Math.round(this.held.x), y: Math.round(this.held.y) };
    this.stand.gruppe.concat(this.stand.lager).forEach(function (el) {
      el.zh = KAMPF.grundwerte(el.art, el.stufe).zhMax;
    });
  }

  // ---------- Schemen ----------
  lageAn(kx, ky) {
    var l = this.lagen.lage(kx, ky);
    l.wetter = this.stand.wetter.art;
    l.phase = WELT.phase(this.stand.zeit);
    return l;
  }

  schemenTextur() {
    if (this.textures.exists("schemen")) return;
    // Ein weicher Lichtfleck aus Ringen – Pixelkunst, kein Verlauf.
    var g = this.make.graphics({ add: false });
    [[12, 0.1], [9, 0.22], [6.5, 0.45], [4, 0.8], [2, 1]].forEach(function (r) {
      g.fillStyle(0xffffff, r[1]).fillCircle(12, 12, r[0]);
    });
    g.generateTexture("schemen", 24, 24);
    g.destroy();
  }

  schemenErzeugen() {
    // Solange niemand mitkommt und Mara nicht gewarnt hat (Flag schemen_frei), zeigen sich keine.
    if (!this.stand.gruppe.length || !this.stand.flags.schemen_frei || this.schemen.length >= SCHEMEN.HOECHSTENS) return;
    if (this.ui && (this.ui.dialogAktiv || this.ui.menueOffen)) return;
    this.schemenTextur();
    var kx0 = Math.floor(this.held.x / 32), ky0 = Math.floor(this.held.y / 32);
    if (!this.besondere) {
      // Einmal je Karte: alle begehbaren Kacheln an besonderen Orten.
      this.besondere = [];
      for (var y = 0; y < this.lagen.hoehe; y++) for (var x = 0; x < this.lagen.breite; x++) {
        var l = this.lagen.lage(x, y);
        if (l.begehbar && l.biom !== "wiese") this.besondere.push([x, y]);
      }
    }
    var besonders = this.besondere.length && this.zufall() < SCHEMEN.BESONDERE_ORTE;
    for (var versuch = 0; versuch < 8; versuch++) {
      var kx, ky;
      if (besonders) {
        var k = this.besondere[Math.floor(this.zufall() * this.besondere.length)];
        kx = k[0]; ky = k[1];
      } else {
        kx = Math.floor(this.zufall() * this.lagen.breite);
        ky = Math.floor(this.zufall() * this.lagen.hoehe);
      }
      var d = Math.max(Math.abs(kx - kx0), Math.abs(ky - ky0));
      if (d < SCHEMEN.MIN_ABSTAND || d > SCHEMEN.MAX_ABSTAND) continue;
      var lage = this.lageAn(kx, ky);
      if (!lage.begehbar) continue;
      var wahl = AUFTRETEN.waehle(this.auftritte, lage, this.zufall);
      if (!wahl) continue;
      this.schemenSetzen(kx, ky, wahl, lage);
      return;
    }
  }

  schemenSetzen(kx, ky, wahl, lage) {
    var szene = this;
    var spr = this.physics.add.sprite(kx * 32 + 16, ky * 32 + 16, "schemen");
    spr.body.setCircle(6, 6, 6);
    spr.setCollideWorldBounds(true);
    this.physics.add.collider(spr, this.hindernisse);
    // Wer dahintersteckt, bleibt verborgen. Nur Seltenes schimmert
    // golden – das verrät die Seltenheit, nicht den Stoff.
    var selten = ARTEN[wahl.art].seltenheit !== "haeufig";
    spr.setTint(selten ? 0xffd86a : 0xcfe8ff).setAlpha(0);
    spr.wahl = wahl;
    spr.lage = lage;
    spr.ende = this.time.now + 1000 * (SCHEMEN.LEBENSDAUER[0] + this.zufall() * (SCHEMEN.LEBENSDAUER[1] - SCHEMEN.LEBENSDAUER[0]));
    spr.naechsteRichtung = 0;
    this.tweens.add({ targets: spr, alpha: 1, duration: 800 });
    spr.flackern = this.tweens.add({ targets: spr, scale: { from: 0.85, to: 1.15 }, duration: 600 + this.zufall() * 400, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
    this.schemen.push(spr);
  }

  schemenEntfernen(spr, sanft) {
    var i = this.schemen.indexOf(spr);
    if (i >= 0) this.schemen.splice(i, 1);
    if (spr.flackern) spr.flackern.stop();
    if (!sanft) { spr.destroy(); return; }
    this.tweens.add({ targets: spr, alpha: 0, duration: 700, onComplete: function () { spr.destroy(); } });
  }

  schemenBewegen() {
    var jetzt = this.time.now, szene = this;
    this.schemen.slice().forEach(function (spr) {
      if (jetzt > spr.ende) { szene.schemenEntfernen(spr, true); return; }
      spr.setDepth(spr.y);
      if (jetzt > spr.naechsteRichtung) {
        var w = szene.zufall() * Math.PI * 2, halt = szene.zufall() < 0.3;
        spr.setVelocity(halt ? 0 : Math.cos(w) * SCHEMEN.TEMPO, halt ? 0 : Math.sin(w) * SCHEMEN.TEMPO);
        spr.naechsteRichtung = jetzt + 1500 + szene.zufall() * 2000;
      }
    });
  }

  schemenBeruehrt() {
    var held = this.held;
    for (var i = 0; i < this.schemen.length; i++) {
      var spr = this.schemen[i];
      if (spr.alpha < 0.5) continue;
      if (Phaser.Math.Distance.Between(held.x, held.y + 6, spr.x, spr.y) > SCHEMEN.BERUEHRUNG) continue;

      var bereit = this.stand.gruppe.some(function (el) { return el.zh > 0; });
      if (!bereit) {
        // Kein Kampf mit erschöpften Gefährten – der Schemen weicht aus.
        spr.setVelocity((spr.x - held.x) * 3, (spr.y - held.y) * 3);
        if (this.time.now - this.letzteWarnung > 8000) {
          this.letzteWarnung = this.time.now;
          this.ui.dialogFuehren([{ erzaehl: "Das Licht weicht zurück. Deine Elementals sind zu erschöpft – erst ins Labor." }], this.stand.flags);
        }
        return;
      }

      var wahl = spr.wahl, lage = spr.lage;
      this.schemenEntfernen(spr, false);
      this.ui.dialogFuehren([{ kampf: {
        art: wahl.art, stufe: wahl.stufe,
        feld: WELT.feld(lage.biom, this.stand.wetter.art, WELT.phase(this.stand.zeit)),
        ort: WELT.ort(lage.biom)
      } }], this.stand.flags);
      return;
    }
  }

  // ---------- Kampf ----------
  // cfg: { art, stufe, wild, feld, ort }. Liefert ein Promise mit dem
  // Ausgang ("sieg", "gefangen", "geflohen", "entkommen", "niederlage").
  // Die Oberwelt ruht so lange, die Oberfläche schläft.
  kampfStarten(cfg) {
    var szene = this;
    return new Promise(function (fertig) {
      szene.held.setVelocity(0, 0);
      szene.scene.pause();
      szene.scene.sleep("ui");
      szene.scene.launch("kampf", {
        stand: szene.stand,
        gegner: cfg.gegner || [{ art: cfg.art, stufe: cfg.stufe || 3 }],
        gegnerName: cfg.name,
        feld: cfg.feld,
        ort: cfg.ort || "dorf",
        wild: cfg.wild !== false,
        beiEnde: function (ende) {
          szene.scene.resume();
          szene.scene.wake("ui");
          // Nach einer Niederlage wacht man im Labor auf, nicht auf dem Schlachtfeld.
          szene.speichern();
          if (ende === "niederlage") {
            var l = szene.stand.labor || { karte: "stoffingen", x: szene.startpunkt.x, y: szene.startpunkt.y };
            szene.stand.karte = l.karte; szene.stand.x = l.x; szene.stand.y = l.y;
            SPIELSTAND.speichern(szene.stand);
            // Der laufende Ablauf (etwa eine Prüfung) wird nicht fortgesetzt:
            // Man wacht im Labor auf und kann es noch einmal versuchen.
            szene.scene.restart({ stand: szene.stand });
            return;
          }
          fertig(ende);
        }
      });
    });
  }

  // ---------- Ansprechen ----------
  gegenueber() {
    var v = richtungsVektor(this.richtung);
    var px = this.held.x + v.x * 20;
    var py = this.held.y + 4 + v.y * 20;
    var bestes = null, abstand = REICHWEITE;
    this.ansprechbar.forEach(function (e) {
      if (e.aktiv === false) return;
      var d = Phaser.Math.Distance.Between(px, py, e.x, e.y);
      if (d < abstand) { abstand = d; bestes = e; }
    });
    return bestes;
  }

  ansprechen(ziel) {
    var ablauf = DIALOGE[ziel.dialog];
    if (!ablauf) return;
    if (ziel.figur) {
      // Wer angesprochen wird, dreht sich zum Sprechenden.
      var gegen = { unten: "oben", oben: "unten", links: "rechts", rechts: "links" }[this.richtung];
      ziel.figur.setFrame(ziel.figurNr * 8 + richtungsSpalte(gegen));
    }
    this.ui.dialogFuehren(ablauf, this.stand.flags);
  }

  update(zeit, delta) {
    var held = this.held;
    held.setDepth(held.y);

    // Die UI-Szene startet parallel und ist im ersten Takt noch nicht fertig.
    if (!this.ui.eingabe) return;

    if (this.ui.dialogAktiv || this.ui.menueOffen) {
      held.setVelocity(0, 0);
      held.anims.stop();
      held.setFrame(richtungsSpalte(this.richtung));
      this.schemen.forEach(function (s) { s.setVelocity(0, 0); });
      return;
    }

    // Die Zeit läuft nur, solange gespielt wird – nicht im Dialog, nicht im Menü.
    var aenderung = WELT.vorruecken(this.stand, delta / 1000, this.zufall);
    if (aenderung.phase || aenderung.wetter) this.ui.himmelZeichnen();
    this.schemenBewegen();
    this.schemenBeruehrt();
    if (this.ui.dialogAktiv) return;

    var e = this.ui.eingabe;
    var betrag = Math.min(1, Math.hypot(e.x, e.y));
    if (betrag > 0.15) {
      var winkel = Math.atan2(e.y, e.x);
      held.setVelocity(Math.cos(winkel) * TEMPO * betrag, Math.sin(winkel) * TEMPO * betrag);
      this.richtung = Math.abs(e.x) > Math.abs(e.y) ? (e.x > 0 ? "rechts" : "links") : (e.y > 0 ? "unten" : "oben");
      held.anims.play("gehen-0-" + this.richtung, true);
    } else {
      held.setVelocity(0, 0);
      held.anims.stop();
      held.setFrame(richtungsSpalte(this.richtung));
    }

    if (this.betreten()) return;

    var ziel = this.gegenueber();
    this.ui.zeigeAktion(ziel ? (ziel.figur ? "Sprechen" : "Ansehen") : "");
    if (this.ui.aktionAbholen() && ziel) this.ansprechen(ziel);
  }
}

// nurWenn / nichtWenn eines Objekts gegen die Flags prüfen
function bedingungErfuellt(eig, flags) {
  if (eig.nurWenn && !flags[eig.nurWenn]) return false;
  if (eig.nichtWenn && flags[eig.nichtWenn]) return false;
  return true;
}

function richtungsSpalte(richtung) {
  return { unten: 0, links: 2, rechts: 4, oben: 6 }[richtung] || 0;
}

function richtungsVektor(richtung) {
  return { unten: { x: 0, y: 1 }, oben: { x: 0, y: -1 }, links: { x: -1, y: 0 }, rechts: { x: 1, y: 0 } }[richtung];
}
