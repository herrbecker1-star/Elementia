// ============================================================
//  OBERFLÄCHE – Stick, Knöpfe, Dialogbox, Menü
//
//  Eigene Szene über der Oberwelt, mit Kamerazoom 1: Alles hier ist
//  in echten Bildpunkten gezeichnet und damit auf jedem Display
//  scharf, egal wie stark die Welt darunter vergrößert ist.
//
//  Der Stick schwebt: Er erscheint dort, wo der Daumen die linke
//  Bildschirmhälfte berührt. Ein fester Stick in der Ecke passt nie
//  zu allen Händen und allen Handygrößen.
// ============================================================

var TIPPGESCHWINDIGKEIT = 45;   // Zeichen je Sekunde in der Dialogbox

class UiSzene extends Phaser.Scene {
  constructor() { super("ui"); }

  create(daten) {
    var szene = this;
    this.oberwelt = daten.oberwelt;
    this.eingabe = { x: 0, y: 0 };
    this.dialogAktiv = false;
    this.menueOffen = false;
    this.aktionGedrueckt = false;
    this.weiterWartet = null;     // resolve-Funktion der offenen Sprechblase

    this.baueHimmel();
    this.baueStick();
    this.baueKnoepfe();
    this.baueDialog();
    this.baueMenue();
    this.baueTastatur();
    if (MASS.probe) this.probeText = this.add.text(MASS.px(8), MASS.px(8), "", {
      fontFamily: "monospace", fontSize: MASS.px(12) + "px", color: "#9fe870", backgroundColor: "#000000aa"
    }).setDepth(100);

    this.anordnen();
    this.scale.on("resize", this.anordnen, this);
    this.events.once("shutdown", function () { szene.scale.off("resize", szene.anordnen, szene); });

    // Prüfschalter ?dialog=<name> und ?kampf=<art>&stufe=<n> (siehe spiel\titel.js)
    var suche = new URLSearchParams(location.search);
    var probeDialog = suche.get("dialog"), probeKampf = suche.get("kampf");
    if (probeDialog && DIALOGE[probeDialog]) this.dialogFuehren(DIALOGE[probeDialog], this.oberwelt.stand.flags);
    else if (suche.get("buch")) {
      // Prüfschalter ?buch=gruppe|stoffbuch|gepaeck
      this.menueOffen = true;
      this.scene.launch("buch", { stand: this.oberwelt.stand, reiter: suche.get("buch") });
    }
    else if (probeKampf && ARTEN[probeKampf]) this.dialogFuehren([{ kampf: { art: probeKampf, stufe: Number(suche.get("stufe")) || 5, ort: suche.get("ort") || "dorf",
      // &gegen=Name: Prüfungskampf gegen einen Stoffmeister statt eines wilden Elementals
      wild: !suche.get("gegen"), name: suche.get("gegen") || undefined,
      gegner: suche.get("gegen") ? [{ art: probeKampf, stufe: Number(suche.get("stufe")) || 5 }] : undefined } }], this.oberwelt.stand.flags);
  }

  // ============================================================
  //  Himmel: Tageszeit und Wetter über der Welt, unter den Knöpfen
  // ============================================================
  baueHimmel() {
    this.himmel = this.add.graphics().setDepth(-10);
    // Regentropfen als Partikel; die Textur ist ein schmaler Strich.
    if (!this.textures.exists("tropfen")) {
      var g = this.make.graphics({ add: false });
      g.fillStyle(0xbfd8ff, 0.8).fillRect(0, 0, MASS.px(1.5), MASS.px(12));
      g.generateTexture("tropfen", Math.max(2, MASS.px(1.5)), MASS.px(12));
      g.destroy();
    }
    this.regen = null;
    this.uhr = this.add.text(0, 0, "", {
      fontFamily: SCHRIFT.familie, fontSize: MASS.px(13) + "px", color: "#f4ead5",
      backgroundColor: "#101418aa", padding: { x: MASS.px(8), y: MASS.px(4) }
    }).setOrigin(0.5, 0).setDepth(5);
    this.blitzUhr = null;
    this.himmelZeichnen();
  }

  himmelZeichnen() {
    var stand = this.oberwelt.stand;
    var b = this.scale.width, h = this.scale.height;
    var ph = WELT.phase(stand.zeit), wetter = stand.wetter.art;
    var farbe = { morgen: [0xffb070, 0.10], tag: [0x000000, 0], abend: [0xff6030, 0.16], nacht: [0x0b1840, 0.45] }[ph];
    var wf = { klar: [0, 0], hitze: [0xffa040, 0.08], nebel: [0xe8eef2, 0.32], regen: [0x203040, 0.18], gewitter: [0x101830, 0.28] }[wetter];
    this.himmel.clear();
    if (farbe[1]) this.himmel.fillStyle(farbe[0], farbe[1]).fillRect(0, 0, b, h);
    if (wf[1]) this.himmel.fillStyle(wf[0], wf[1]).fillRect(0, 0, b, h);

    // Der Regen wird mit der aktuellen Breite neu angelegt – nach dem
    // Drehen des Handys soll er über den ganzen Bildschirm fallen.
    var regnet = wetter === "regen" || wetter === "gewitter";
    if (this.regen) { this.regen.destroy(); this.regen = null; }
    if (regnet) {
      this.regen = this.add.particles(0, 0, "tropfen", {
        x: { min: 0, max: b }, y: -MASS.px(20), lifespan: Math.round(1000 * h / MASS.px(600)),
        speedY: { min: MASS.px(520), max: MASS.px(680) }, speedX: -MASS.px(60),
        quantity: 2, frequency: 25, alpha: { start: 0.7, end: 0.25 }
      }).setDepth(-9);
    }

    if (this.blitzUhr) { this.blitzUhr.remove(); this.blitzUhr = null; }
    if (wetter === "gewitter") {
      var szene = this;
      this.blitzUhr = this.time.addEvent({ delay: 6000, loop: true, callback: function () {
        if (Math.random() < 0.5) szene.cameras.main.flash(120, 230, 235, 255);
      } });
    }
    this.uhrZeigen();
  }

  uhrZeigen() {
    var stand = this.oberwelt.stand;
    this.uhr.setText(WELT.uhr(stand.zeit) + " · " + WELT.PHASE_NAME[WELT.phase(stand.zeit)] + " · " + WELT.WETTER_NAME[stand.wetter.art]);
  }

  // ============================================================
  //  Stick
  // ============================================================
  baueStick() {
    var szene = this;
    this.stickGrund = this.add.graphics().setVisible(false);
    this.stickKnauf = this.add.graphics().setVisible(false);
    this.stickZeiger = null;
    this.stickMitte = { x: 0, y: 0 };
    var radius = MASS.px(52);

    function zeichneStick() {
      szene.stickGrund.clear().fillStyle(0x000000, 0.25).fillCircle(0, 0, radius)
        .lineStyle(MASS.px(2), 0xf4ead5, 0.5).strokeCircle(0, 0, radius);
      szene.stickKnauf.clear().fillStyle(0xf4ead5, 0.75).fillCircle(0, 0, MASS.px(22));
    }
    zeichneStick();

    this.input.on("pointerdown", function (zeiger, getroffen) {
      // Getroffene Knöpfe regeln sich selbst – sonst blättert ein
      // Tipper auf den Aktionsknopf zwei Seiten auf einmal weiter.
      if (getroffen.length) return;
      if (szene.dialogAktiv) { szene.weiterTippen(); return; }
      if (szene.menueOffen) return;
      if (zeiger.x > szene.scale.width * 0.5 || szene.stickZeiger) return;
      szene.stickZeiger = zeiger;
      szene.stickMitte = { x: zeiger.x, y: zeiger.y };
      szene.stickGrund.setPosition(zeiger.x, zeiger.y).setVisible(true);
      szene.stickKnauf.setPosition(zeiger.x, zeiger.y).setVisible(true);
    });
    this.input.on("pointermove", function (zeiger) {
      if (zeiger !== szene.stickZeiger) return;
      var dx = zeiger.x - szene.stickMitte.x, dy = zeiger.y - szene.stickMitte.y;
      var d = Math.hypot(dx, dy);
      if (d > radius) { dx = dx / d * radius; dy = dy / d * radius; }
      szene.stickKnauf.setPosition(szene.stickMitte.x + dx, szene.stickMitte.y + dy);
      szene.stickWert = { x: dx / radius, y: dy / radius };
    });
    var loslassen = function (zeiger) {
      if (zeiger !== szene.stickZeiger) return;
      szene.stickZeiger = null;
      szene.stickWert = null;
      szene.stickGrund.setVisible(false);
      szene.stickKnauf.setVisible(false);
    };
    this.input.on("pointerup", loslassen);
    this.input.on("pointerupoutside", loslassen);
  }

  // ============================================================
  //  Knöpfe: Aktion (rechts unten) und Menü (rechts oben)
  // ============================================================
  baueKnoepfe() {
    var szene = this;
    this.aktionKnopf = this.add.container(0, 0);
    var kreis = this.add.graphics();
    var r = MASS.px(38);
    kreis.fillStyle(FARBE.knopf, 0.85).fillCircle(0, 0, r).lineStyle(MASS.px(2), 0xc9a66b, 1).strokeCircle(0, 0, r);
    this.aktionText = this.add.text(0, 0, "A", {
      fontFamily: SCHRIFT.familie, fontSize: MASS.px(16) + "px", color: FARBE.knopfText, align: "center"
    }).setOrigin(0.5);
    this.aktionKnopf.add([kreis, this.aktionText]);
    this.aktionKnopf.setSize(r * 2, r * 2).setInteractive(new Phaser.Geom.Circle(r, r, r), Phaser.Geom.Circle.Contains);
    this.aktionKnopf.on("pointerdown", function () {
      if (szene.dialogAktiv) szene.weiterTippen();
      else szene.aktionGedrueckt = true;
    });

    this.menueKnopf = baueKnopf(this, "Menü", function () { if (!szene.dialogAktiv) szene.menueUmschalten(); }, { mindestbreite: 72, hoehe: 40, schrift: 15 });
  }

  zeigeAktion(text) {
    this.aktionText.setText(text || "A");
    this.aktionKnopf.setAlpha(text ? 1 : 0.55);
  }

  aktionAbholen() {
    var war = this.aktionGedrueckt;
    this.aktionGedrueckt = false;
    return war;
  }

  // ============================================================
  //  Tastatur – für den Rechner und fürs Ausprobieren
  // ============================================================
  baueTastatur() {
    var szene = this;
    var t = this.input.keyboard;
    if (!t) return;
    this.tasten = t.addKeys("W,A,S,D,UP,DOWN,LEFT,RIGHT");
    t.on("keydown", function (ereignis) {
      var taste = ereignis.key;
      if (taste === " " || taste === "Enter" || taste === "e" || taste === "E") {
        if (szene.dialogAktiv) szene.weiterTippen();
        else if (!szene.menueOffen) szene.aktionGedrueckt = true;
      } else if (taste === "Escape" || taste === "m" || taste === "M") {
        if (!szene.dialogAktiv) szene.menueUmschalten();
      } else if (szene.dialogAktiv && szene.wahlKnoepfe.length && /^[1-9]$/.test(taste)) {
        var nr = Number(taste) - 1;
        if (nr < szene.wahlKnoepfe.length) szene.wahlTreffen(nr);
      }
    });
  }

  // ============================================================
  //  Dialogbox
  // ============================================================
  baueDialog() {
    this.dialog = this.add.container(0, 0).setVisible(false).setDepth(10);
    this.dialogGrund = this.add.graphics();
    this.dialogName = this.add.text(0, 0, "", {
      fontFamily: SCHRIFT.familie, fontSize: MASS.px(15) + "px", color: "#f4ead5", fontStyle: "bold",
      backgroundColor: "#6b4a2b", padding: { x: MASS.px(10), y: MASS.px(4) }
    });
    this.dialogText = this.add.text(0, 0, "", {
      fontFamily: SCHRIFT.familie, fontSize: MASS.px(18) + "px", color: FARBE.tinte, lineSpacing: MASS.px(4)
    });
    this.dialogWeiter = this.add.text(0, 0, "▼", {
      fontFamily: SCHRIFT.familie, fontSize: MASS.px(14) + "px", color: "#6b4a2b"
    }).setOrigin(1, 1);
    this.dialog.add([this.dialogGrund, this.dialogName, this.dialogText, this.dialogWeiter]);
    this.wahlKnoepfe = [];
    this.tweens.add({ targets: this.dialogWeiter, alpha: 0.2, duration: 500, yoyo: true, repeat: -1 });
  }

  // Die Anzeige für kern/ereignisse.js: zwei Funktionen, die Promises liefern.
  dialogFuehren(ablauf, flags) {
    var szene = this;
    if (this.dialogAktiv) return;
    this.dialogAktiv = true;
    this.aktionGedrueckt = false;
    this.zeigeAktion("Weiter");
    var anzeige = {
      sag: function (sprecher, text) { return szene.sprechblase(sprecher, text); },
      wahl: function (frage, texte) { return szene.wahl(frage, texte); },
      kampf: function (cfg) {
        var bereit = szene.oberwelt.stand.gruppe.some(function (el) { return el.zh > 0; });
        if (!bereit) {
          var text = szene.oberwelt.stand.gruppe.length ? "Deine Elementals sind erschöpft. Erst ins Labor!" : "Du hast noch kein Elemental dabei.";
          return szene.sprechblase(null, text).then(function () { return "nicht_bereit"; });
        }
        szene.dialog.setVisible(false);
        return szene.oberwelt.kampfStarten(cfg);
      },
      heilen: function () { szene.oberwelt.heilen(); },
      speichern: function () { szene.oberwelt.speichern(); },
      geben: function (g) { return szene.geben(g); },
      benennen: function () { szene.benennen(); },
      welt: function (w) { szene.weltStellen(w); },
      einblenden: function (name, text) { return szene.einblenden(name, text); },
      karte: function (k) { szene.oberwelt.wechsleKarte(k.ziel, k.punkt); },
      ablauf: function (name) { return DIALOGE[name] || []; },
      hatElemental: function (art) { return szene.oberwelt.stand.gruppe.some(function (el) { return el.art === art; }); }
    };
    EREIGNISSE.ausfuehren(ablauf, flags, anzeige).catch(function (fehler) {
      console.error(fehler);
    }).then(function () {
      szene.dialog.setVisible(false);
      // Flags können Figuren erscheinen oder verschwinden lassen.
      if (szene.oberwelt.sichtbarkeitAnpassen) szene.oberwelt.sichtbarkeitAnpassen();
      // Einen Takt warten: Derselbe Tipper, der den Dialog schließt,
      // soll nicht sofort den nächsten öffnen.
      szene.time.delayedCall(150, function () { szene.dialogAktiv = false; });
    });
  }

  // ============================================================
  //  Schritte, die den Spielstand ändern
  // ============================================================
  geben(g) {
    var stand = this.oberwelt.stand, teile = [];
    if (g.elemental) {
      var el = KAMPF.neuesElemental(g.elemental.art, g.elemental.stufe || 3);
      SPIELSTAND.aufnehmen(stand, el);
      if (stand.bekannt.indexOf(el.art) < 0) stand.bekannt.push(el.art);
      teile.push(ARTEN[el.art].name + " (Stufe " + el.stufe + ") schließt sich dir an");
    }
    Object.keys(g.vorrat || {}).forEach(function (geraet) {
      stand.vorrat[geraet] = (stand.vorrat[geraet] || 0) + g.vorrat[geraet];
      teile.push(g.vorrat[geraet] + "× " + FANGGERAETE[geraet].name);
    });
    [].concat(g.werkzeug || []).forEach(function (w) {
      if (stand.werkzeuge.indexOf(w) < 0) stand.werkzeuge.push(w);
      teile.push(WERKZEUGE[w].name);
    });
    if (!teile.length) return Promise.resolve();
    return this.sprechblase(null, (g.elemental ? "" : "Du erhältst: ") + teile.join(", ") + ".");
  }

  benennen() {
    var stand = this.oberwelt.stand;
    var el = stand.gruppe[stand.gruppe.length - 1];
    if (!el) return;
    var name = window.prompt("Wie soll dein " + ARTEN[el.art].name + " heißen? (Leer lassen: " + ARTEN[el.art].name + ")", "");
    if (name && name.trim()) el.spitzname = name.trim().slice(0, 14);
  }

  // Uhrzeit vorstellen (nie zurück: ein früherer Zeitpunkt heißt „am nächsten Tag“).
  weltStellen(w) {
    var stand = this.oberwelt.stand;
    if (w.zeit) {
      var hm = w.zeit.split(":"), ziel = Number(hm[0]) * 60 + Number(hm[1] || 0);
      var neu = Math.floor(stand.zeit / 1440) * 1440 + ziel;
      if (neu < stand.zeit) neu += 1440;
      stand.zeit = neu;
    }
    if (w.wetter) stand.wetter = { art: w.wetter, bis: stand.zeit + 240 };
    this.himmelZeichnen();
  }

  // Gemalte Einblendung. Solange das Bild fehlt, ein Platzhalter mit
  // Bildname – so sieht man beim Spielen, wo später ein Bild hinkommt.
  einblenden(name, text) {
    var szene = this, b = this.scale.width, h = this.scale.height;
    this.dialog.setVisible(false);
    var ebene = this.add.container(0, 0).setDepth(30).setAlpha(0);
    var grund = this.add.graphics().fillStyle(0x08090b, 0.92).fillRect(0, 0, b, h);
    ebene.add(grund);
    var schluessel = "szene-" + name, bild;
    if (this.textures.exists(schluessel)) {
      bild = this.add.image(b / 2, h * 0.45, schluessel);
      bild.setScale(Math.min(b * 0.9 / bild.width, h * 0.72 / bild.height));
      this.tweens.add({ targets: bild, scale: bild.scale * 1.06, duration: 6000 });
      ebene.add(bild);
    } else {
      var rahmen = this.add.graphics().lineStyle(MASS.px(2), 0xc9a66b, 0.8).strokeRect(b * 0.2, h * 0.1, b * 0.6, h * 0.62);
      var platz = this.add.text(b / 2, h * 0.41, "[ Einblendung: " + name + " ]", {
        fontFamily: SCHRIFT.familie, fontSize: MASS.px(14) + "px", color: "#c9a66b", fontStyle: "italic"
      }).setOrigin(0.5);
      ebene.add([rahmen, platz]);
    }
    if (text) {
      var unter = this.add.text(b / 2, h * 0.86, text, {
        fontFamily: SCHRIFT.titel, fontSize: MASS.px(17) + "px", color: "#f4ead5", fontStyle: "italic", align: "center",
        wordWrap: { width: b * 0.8, useAdvancedWrap: true }
      }).setOrigin(0.5);
      ebene.add(unter);
    }
    this.tweens.add({ targets: ebene, alpha: 1, duration: 500 });
    return new Promise(function (fertig) {
      // Erst nach einer Weile antippbar – die Einblendung soll wirken.
      szene.time.delayedCall(900, function () {
        szene.einblendungWartet = function () {
          szene.einblendungWartet = null;
          szene.tweens.add({ targets: ebene, alpha: 0, duration: 400, onComplete: function () { ebene.destroy(); fertig(); } });
        };
      });
    });
  }

  sprechblase(sprecher, text) {
    var szene = this;
    this.dialog.setVisible(true);
    this.dialogName.setVisible(!!sprecher).setText(sprecher || "");
    this.dialogText.setColor(sprecher ? FARBE.tinte : "#5a4632").setFontStyle(sprecher ? "" : "italic");
    this.voll = text;
    this.gezeigt = 0;
    this.dialogText.setText("");
    this.dialogWeiter.setVisible(false);
    if (this.tippUhr) this.tippUhr.remove();
    this.tippUhr = this.time.addEvent({
      delay: 1000 / TIPPGESCHWINDIGKEIT, loop: true, callback: function () {
        szene.gezeigt++;
        szene.dialogText.setText(szene.voll.slice(0, szene.gezeigt));
        if (szene.gezeigt >= szene.voll.length) szene.tippenFertig();
      }
    });
    return new Promise(function (fertig) { szene.weiterWartet = fertig; });
  }

  tippenFertig() {
    if (this.tippUhr) { this.tippUhr.remove(); this.tippUhr = null; }
    this.dialogText.setText(this.voll);
    this.dialogWeiter.setVisible(this.wahlKnoepfe.length === 0);
  }

  // Ein Tipper beendet erst das Tippen, der zweite blättert weiter.
  // Wer schnell liest, soll nicht warten müssen – wer langsam liest,
  // soll nichts verpassen.
  weiterTippen() {
    if (this.einblendungWartet) { this.einblendungWartet(); return; }
    if (this.tippUhr) { this.tippenFertig(); return; }
    if (this.wahlKnoepfe.length) return;
    var fertig = this.weiterWartet;
    this.weiterWartet = null;
    if (fertig) fertig();
  }

  wahl(frage, texte) {
    var szene = this;
    this.wahlKnoepfe = texte.map(function (t, nr) {
      return baueKnopf(szene, t, function () { szene.wahlTreffen(nr); }, { hoehe: 44, schrift: 16, mindestbreite: 220 }).setDepth(11);
    });
    this.anordnen();
    // Die Frage steht sofort ganz da; weiter geht es nur über eine Wahl.
    this.sprechblase(null, frage);
    this.tippenFertig();
    return new Promise(function (fertig) { szene.wahlWartet = fertig; });
  }

  wahlTreffen(nr) {
    this.wahlKnoepfe.forEach(function (k) { k.destroy(); });
    this.wahlKnoepfe = [];
    this.weiterWartet = null;
    var fertig = this.wahlWartet;
    this.wahlWartet = null;
    if (fertig) fertig(nr);
  }

  // ============================================================
  //  Menü
  // ============================================================
  baueMenue() {
    var szene = this;
    var oberwelt = this.oberwelt;
    this.menue = this.add.container(0, 0).setVisible(false).setDepth(20);
    this.menueGrund = this.add.graphics();
    this.menue.add(this.menueGrund);
    this.meldung = this.add.text(0, 0, "", {
      fontFamily: SCHRIFT.familie, fontSize: MASS.px(15) + "px", color: "#f4ead5", align: "center"
    }).setOrigin(0.5);
    this.menue.add(this.meldung);

    this.menueKnoepfe = [
      baueKnopf(this, "Gruppe & Stoffbuch", function () {
        szene.menue.setVisible(false);
        szene.scene.launch("buch", { stand: oberwelt.stand, beiEnde: function () { szene.menue.setVisible(true); } });
      }),
      baueKnopf(this, "Speichern", function () {
        szene.melde(oberwelt.speichern() ? "Gespeichert." : "Speichern nicht möglich (privates Fenster?). Nimm den Spielstand-Code.");
      }),
      baueKnopf(this, "Spielstand-Code", function () {
        oberwelt.speichern();
        var code = SPIELSTAND.alsCode(oberwelt.stand);
        // prompt zeigt den Code markierbar an – auf jedem Handy, ohne
        // Berechtigung für die Zwischenablage.
        window.prompt("Dein Spielstand-Code. Kopieren und gut aufheben:", code);
      }),
      baueKnopf(this, "Vollbild", function () {
        if (szene.scale.isFullscreen) szene.scale.stopFullscreen();
        else szene.scale.startFullscreen();
      }),
      baueKnopf(this, "Zum Titel", function () {
        oberwelt.speichern();
        szene.menueOffen = false;
        oberwelt.scene.start("titel");
      }),
      baueKnopf(this, "Weiterspielen", function () { szene.menueUmschalten(); })
    ];
    this.menueKnoepfe.forEach(function (k) { szene.menue.add(k); k.setzeBreite(220); });
  }

  melde(text) {
    this.meldung.setText(text);
  }

  menueUmschalten() {
    this.menueOffen = !this.menueOffen;
    this.menue.setVisible(this.menueOffen);
    this.melde("");
    this.stickZeiger = null;
    this.stickWert = null;
    this.stickGrund.setVisible(false);
    this.stickKnauf.setVisible(false);
  }

  // ============================================================
  //  Anordnen – bei jedem Drehen und jeder Größenänderung
  // ============================================================
  anordnen() {
    var b = this.scale.width, h = this.scale.height;
    var rand = MASS.px(16);

    this.aktionKnopf.setPosition(b - rand - MASS.px(44), h - rand - MASS.px(44));
    this.menueKnopf.setPosition(b - rand - this.menueKnopf.width / 2, rand + this.menueKnopf.height / 2);

    // Dialogbox: unten, höchstens 760 CSS-Pixel breit, und rechts
    // so viel Platz lassen, dass der Aktionsknopf frei bleibt.
    var db = Math.min(MASS.px(760), b - 2 * rand - MASS.px(100));
    var dh = MASS.px(118);
    var dx = Math.max(rand, (b - db) / 2 - MASS.px(50));
    var dy = h - rand - dh;
    this.dialog.setPosition(dx, dy);
    this.dialogGrund.clear()
      .fillStyle(FARBE.papier, 0.97).fillRoundedRect(0, 0, db, dh, MASS.px(12))
      .lineStyle(MASS.px(3), FARBE.papierRand, 1).strokeRoundedRect(0, 0, db, dh, MASS.px(12));
    this.dialogName.setPosition(MASS.px(14), -MASS.px(14));
    this.dialogText.setPosition(MASS.px(18), MASS.px(22)).setWordWrapWidth(db - MASS.px(40), true);
    this.dialogWeiter.setPosition(db - MASS.px(12), dh - MASS.px(8));

    var wy = dy - MASS.px(12);
    for (var i = this.wahlKnoepfe.length - 1; i >= 0; i--) {
      var k = this.wahlKnoepfe[i];
      wy -= k.height / 2;
      k.setPosition(dx + db - k.width / 2 - MASS.px(8), wy);
      wy -= k.height / 2 + MASS.px(8);
    }

    // Menü in zwei Spalten: Sechs Knöpfe untereinander passen auf
    // einem Handy quer (390 CSS-Pixel hoch) nicht mehr hin.
    this.menueGrund.clear().fillStyle(0x000000, 0.7).fillRect(0, 0, b, h);
    var zeilen = Math.ceil(this.menueKnoepfe.length / 2), abstandY = MASS.px(58), abstandX = MASS.px(240);
    var my0 = h / 2 - (zeilen - 1) * abstandY / 2 - MASS.px(14);
    this.menueKnoepfe.forEach(function (k, i) {
      k.setPosition(b / 2 + (i % 2 ? 0.5 : -0.5) * abstandX, my0 + Math.floor(i / 2) * abstandY);
    });
    this.meldung.setPosition(b / 2, my0 + zeilen * abstandY);

    this.uhr.setPosition(b / 2, MASS.px(10));
    this.himmelZeichnen();
  }

  update() {
    var e = { x: 0, y: 0 };
    if (this.stickWert) { e.x = this.stickWert.x; e.y = this.stickWert.y; }
    var t = this.tasten;
    if (t) {
      if (t.A.isDown || t.LEFT.isDown) e.x = -1;
      if (t.D.isDown || t.RIGHT.isDown) e.x = 1;
      if (t.W.isDown || t.UP.isDown) e.y = -1;
      if (t.S.isDown || t.DOWN.isDown) e.y = 1;
    }
    this.eingabe = e;

    // Die Uhr einmal je Spielminute auffrischen, nicht in jedem Bild.
    var minute = Math.floor(this.oberwelt.stand.zeit);
    if (minute !== this.letzteMinute) { this.letzteMinute = minute; this.uhrZeigen(); }

    if (this.probeText) {
      var kamera = this.oberwelt.cameras.main;
      this.probeText.setText(
        Math.round(this.game.loop.actualFps) + " fps · Leinwand " + this.scale.width + "×" + this.scale.height +
        " · dpr " + MASS.dpr + " · Zoom " + kamera.zoom +
        " · " + (this.game.renderer.type === Phaser.WEBGL ? "WebGL" : "Canvas")
      );
    }
  }
}
