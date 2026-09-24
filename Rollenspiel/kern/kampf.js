// ============================================================
//  KAMPF – der Reaktionskampf
//
//  Reine Logik ohne Phaser. Die Kampfszene zeigt nur an, was hier
//  entschieden wird; der Prüfstand lässt tausende Kämpfe ohne
//  Bildschirm laufen.
//
//  Grundgedanke: keine Typentabelle, sondern Chemie.
//   · Werte kommen aus Stoffeigenschaften (grundwerte).
//   · Das FELD hat Sauerstoff, Wärme und Feuchte. Verbrennungen
//     verbrauchen Sauerstoff und heizen das Feld auf. Wärme gibt
//     beiden Seiten mehr Aktivierungsenergie – wer Feuer macht,
//     hilft auch dem Gegner.
//   · Aktivierungsenergie (AE) ist die Zugressource.
//   · Wer erschöpft ist, zieht sich zurück. Niemand stirbt.
//
//  Alle Zahlen sind vorläufig und werden im Prüfstand gemessen.
// ============================================================

var KAMPF = (function () {
  "use strict";

  // Bei 2 AE je Runde lohnte sich nur Wucht (1 AE), Feuer (3–5 AE)
  // kam zu selten – wer schlug, gewann. Gemessen 24.09.2026.
  var AE_START = 3, AE_MAX = 10, AE_JE_RUNDE = 3;
  var WAERME_ABKUEHLUNG = 4;
  var LUFTZUFUHR = 3;             // Sauerstoff je Runde im Freien
  var VOLLTREFFER = 1 / 12;
  var ABWEHR_PLUS_MAX = 4;        // Schutzschichten stapeln sich nicht endlos
  var GEBLENDET = 0.65;           // bei 0,5 gewann Magnesium 87 % seiner Paarungen
  var SEITEN = ["spieler", "gegner"];

  // ----------------------------------------------------------
  //  Werte aus Stoffeigenschaften
  // ----------------------------------------------------------
  // Zusammenhalt: je höher die Schmelztemperatur, desto stärker hält
  //   der Stoff zusammen (gedeckelt bei 2000 °C, sonst wäre Kohlenstoff
  //   mit 3640 °C unverwundbar).
  // Abwehr: aus der Mohshärte.
  // Tempo: leichte Stoffe sind schnell – aus der Dichte.
  //
  // Die Stoffwerte gehen gedämpft ein (Fassung 2, 24.09.2026): In der
  // ersten Fassung (30 + T/80, 4 + 2·Härte) gewann Eisen 100 % aller
  // Paarungen, weil es Hitze UND Wucht zugleich widersteht. Die
  // Richtung bleibt – Eisen ist zäh –, der Abstand schrumpft.
  function grundwerte(artId, stufe) {
    var s = ARTEN[artId].stoff;
    return {
      zhMax: Math.round((40 + Math.min(s.schmelz, 2000) / 200) * (1 + 0.1 * (stufe - 1))),
      abwehr: Math.round((8 + s.haerte) * (1 + 0.05 * (stufe - 1))),
      tempo: Math.round((12 - s.dichte) * 10) / 10 + stufe * 0.1,
      kraft: 1 + 0.08 * (stufe - 1)
    };
  }

  // Hitze trifft Stoffe mit niedriger Schmelztemperatur härter:
  // Schwefel (115 °C) ×1,4, Zink (420 °C) ×1,15, Eisen und Kupfer ×0,8.
  function hitzeFaktor(artId) {
    var t = ARTEN[artId].stoff.schmelz;
    return Math.max(0.8, Math.min(1.4, 1 + (600 - t) / 1200));
  }

  // Verformbare Stoffe geben nach, spröde zerbrechen. Zink ist bei
  // Raumtemperatur spröde, wird aber warm verformbar – ist das Feld
  // heiß (Wärme ab 50), zählt es als verformbar.
  function wuchtFaktor(artId, waerme) {
    var a = ARTEN[artId];
    var verformbar = a.steckbrief.verformbar || (a.warmVerformbar && waerme >= 50);
    return verformbar ? 0.9 : 1.15;
  }

  // Reaktionen mit dem Ziel selbst (Sulfidbildung) hängen daran,
  // ob das Ziel ein Metall ist.
  function stoffFaktor(r, artId) {
    return ARTEN[artId].klasse === "Metall" ? (r.gegenMetall || 1) : (r.gegenNichtmetall || 1);
  }

  // Wärmeleitung: Ein guter Wärmeleiter (alle Metalle, auch Grafit)
  // wird durch und durch heiß; ein Isolator wie Schwefel lässt die
  // Wärme kaum hinein. Die Antwort auf die hitzefesten Metalle.
  function leitFaktor(artId) {
    return ARTEN[artId].steckbrief.leitfaehig ? 1.3 : 0.7;
  }

  function neuesElemental(artId, stufe) {
    return { art: artId, stufe: stufe, ep: 0, zh: grundwerte(artId, stufe).zhMax };
  }

  function epBisNaechste(stufe) { return 10 + 10 * stufe; }

  // Gibt Erfahrung; liefert die Liste der erreichten Stufen.
  function erfahrung(el, betrag) {
    var neu = [];
    el.ep += betrag;
    while (el.ep >= epBisNaechste(el.stufe)) {
      el.ep -= epBisNaechste(el.stufe);
      var alt = grundwerte(el.art, el.stufe).zhMax;
      el.stufe++;
      el.zh += grundwerte(el.art, el.stufe).zhMax - alt;
      neu.push(el.stufe);
    }
    return neu;
  }

  // ----------------------------------------------------------
  //  Kampf anlegen
  // ----------------------------------------------------------
  // optionen: gruppe (Liste Elementals), gegner (Liste), feld
  //   { sauerstoff, waerme, feuchte, offen }, wild, bekannt (Liste
  //   der schon erkannten Arten), vorrat { geraet: anzahl },
  //   werkzeuge (Liste), startwert
  function neu(o) {
    var feld = o.feld || {};
    var k = {
      runde: 1,
      feld: {
        sauerstoff: feld.sauerstoff !== undefined ? feld.sauerstoff : 100,
        waerme: feld.waerme !== undefined ? feld.waerme : 20,
        feuchte: feld.feuchte !== undefined ? feld.feuchte : 30,
        offen: feld.offen !== false,
        grundwaerme: feld.waerme !== undefined ? feld.waerme : 20
      },
      seiten: {
        spieler: { gruppe: o.gruppe, aktiv: ersterFaehiger(o.gruppe), ae: AE_START, status: {} },
        gegner:  { gruppe: o.gegner, aktiv: 0, ae: AE_START, status: {} }
      },
      wild: o.wild !== false,
      vorrat: o.vorrat || {},
      werkzeuge: o.werkzeuge || [],
      befunde: {},
      fehlversuche: 0,
      ende: null,
      log: [],
      zufall: ZUFALL(o.startwert)
    };
    k.feld.maxSauerstoff = k.feld.sauerstoff;
    k.erkannt = (o.bekannt || []).indexOf(o.gegner[0].art) >= 0;
    return k;
  }

  function ersterFaehiger(gruppe) {
    for (var i = 0; i < gruppe.length; i++) if (gruppe[i].zh > 0) return i;
    return -1;
  }

  function aktiv(k, seite) {
    var s = k.seiten[seite];
    return s.gruppe[s.aktiv];
  }

  function gegenueber(seite) { return seite === "spieler" ? "gegner" : "spieler"; }

  // Wie das Elemental im Text heißt. Ein unerkanntes wildes Wesen
  // bleibt namenlos – erkennen ist Teil des Spiels.
  function name(k, seite) {
    var el = aktiv(k, seite);
    if (seite === "gegner" && k.wild && !k.erkannt) return "Das unbekannte Elemental";
    return (el.spitzname || ARTEN[el.art].name);
  }

  // ----------------------------------------------------------
  //  Können und Schaden
  // ----------------------------------------------------------
  // Liefert null, wenn der Zug geht, sonst den Grund.
  function hindernis(k, seite, reaktionId) {
    var r = REAKTIONEN[reaktionId];
    if (k.seiten[seite].ae < r.ae) return "Zu wenig Aktivierungsenergie (" + r.ae + " nötig).";
    if (r.o2 && k.feld.sauerstoff < r.o2) return "Zu wenig Sauerstoff – die Flamme erstickt.";
    if (r.braucht && r.braucht.waerme && k.feld.waerme < r.braucht.waerme) return "Das Feld ist zu kalt dafür (Wärme " + r.braucht.waerme + " nötig).";
    return null;
  }

  // Erwarteter Schaden ohne Zufallsstreuung – für die KI und für
  // die Anzeige „etwa … Schaden".
  function schaetzeSchaden(k, seite, reaktionId) {
    return schaden(k, seite, reaktionId, 1);
  }

  function schaden(k, seite, reaktionId, streuung) {
    var r = REAKTIONEN[reaktionId];
    if (r.art === "schutz") return 0;
    var an = aktiv(k, seite), ziel = aktiv(k, gegenueber(seite));
    var zs = k.seiten[gegenueber(seite)].status;
    var basis = r.art === "leitung" ? k.feld.waerme / 4 : r.kraft;
    basis *= grundwerte(an.art, an.stufe).kraft;
    var abwehr = grundwerte(ziel.art, ziel.stufe).abwehr + (zs.abwehrPlus || 0);
    var s = basis * 20 / (10 + abwehr);
    if (r.art === "wucht") s *= wuchtFaktor(ziel.art, k.feld.waerme);
    else if (r.art === "leitung") s *= leitFaktor(ziel.art);
    else if (r.art === "reaktion") s *= stoffFaktor(r, ziel.art);
    else s *= hitzeFaktor(ziel.art);
    if (r.art === "hitze" && k.feld.feuchte > 70) s *= 0.7;
    if (k.seiten[seite].status.geblendet) s *= GEBLENDET;
    if (zs.schutz) s *= zs.schutz;
    if (zs.tarnung) s *= 0.5;
    return Math.max(1, Math.round(s * streuung));
  }

  function fuehreAus(k, seite, reaktionId) {
    var r = REAKTIONEN[reaktionId];
    var s = k.seiten[seite], ander = gegenueber(seite);
    var z = k.seiten[ander];
    var wer = name(k, seite);

    var grund = hindernis(k, seite, reaktionId);
    if (grund) {
      k.log.push({ seite: seite, text: wer + " versucht " + r.name + ". " + grund });
      // Eine erstickte Flamme hat die Energie trotzdem verbraucht.
      if (r.o2 && k.feld.sauerstoff < r.o2) s.ae = Math.max(0, s.ae - r.ae);
      return;
    }

    s.ae -= r.ae;
    k.log.push({ seite: seite, reaktion: reaktionId, text: wer + ": " + r.name + "!" });

    if (r.art !== "schutz") {
      // Volltreffer: Der Zufall gehört in die App, nicht an den
      // Kartentisch – hier ist er erlaubt und hält Paarungen offen.
      var voll = k.zufall() < VOLLTREFFER;
      var betrag = schaden(k, seite, reaktionId, k.zufall.zwischen(0.8, 1.2) * (voll ? 1.5 : 1));
      if (r.art === "leitung") k.feld.waerme = Math.max(0, k.feld.waerme - 20);
      var ziel = aktiv(k, ander);
      ziel.zh = Math.max(0, ziel.zh - betrag);
      if (voll) k.log.push({ volltreffer: true, text: "Volltreffer!" });
      k.log.push({ seite: ander, schaden: betrag, text: name(k, ander) + " verliert " + betrag + " Zusammenhalt." });
      if (s.status.geblendet) { s.status.geblendet--; }
      delete z.status.schutz;
      delete z.status.tarnung;
    }

    if (r.o2) k.feld.sauerstoff = Math.max(0, k.feld.sauerstoff - r.o2);
    if (r.waerme) k.feld.waerme = Math.min(100, k.feld.waerme + r.waerme);

    var w = r.wirkung || {};
    if (w.geblendet) { z.status.geblendet = w.geblendet; k.log.push({ text: name(k, ander) + " ist geblendet." }); }
    if (w.reizgas) { z.status.reizgas = { schaden: w.reizgas, runden: w.dauer }; k.log.push({ text: "Stechendes Gas hängt über " + name(k, ander) + "." }); }
    if (w.schutz) s.status.schutz = w.schutz;
    if (w.tarnung) s.status.tarnung = true;
    if (w.abwehrPlus) s.status.abwehrPlus = Math.min(ABWEHR_PLUS_MAX, (s.status.abwehrPlus || 0) + w.abwehrPlus);
  }

  // ----------------------------------------------------------
  //  Die KI des Gegners (und im Prüfstand beider Seiten)
  // ----------------------------------------------------------
  function kiWahl(k, seite) {
    var el = aktiv(k, seite);
    var s = k.seiten[seite];
    var bestes = { typ: "sammeln" }, wert = 0.5;
    // Was der Gegner als Nächstes anrichten könnte – daran misst sich
    // der Wert eines Schutzzugs.
    var ander = gegenueber(seite);
    var drohung = 0;
    ARTEN[aktiv(k, ander).art].reaktionen.forEach(function (id) {
      if (REAKTIONEN[id].art !== "schutz" && !hindernis(k, ander, id)) drohung = Math.max(drohung, schaetzeSchaden(k, ander, id));
    });
    ARTEN[el.art].reaktionen.forEach(function (id) {
      if (hindernis(k, seite, id)) return;
      var r = REAKTIONEN[id], w;
      if (r.art === "schutz") {
        var wi = r.wirkung;
        if (wi.schutz) w = s.status.schutz ? 0 : drohung * (1 - wi.schutz) + (wi.abwehrPlus && (s.status.abwehrPlus || 0) < ABWEHR_PLUS_MAX ? 2 : 0);
        else if (wi.tarnung) w = s.status.tarnung ? 0 : drohung * 0.5;
        else if (wi.abwehrPlus) w = (s.status.abwehrPlus || 0) >= ABWEHR_PLUS_MAX ? 0 : 4;
        else w = 0;
        // Nur wer noch lange genug steht, hat vom Schutz etwas.
        if (el.zh < drohung) w *= 0.3;
      } else {
        w = schaetzeSchaden(k, seite, id);
      }
      if (w > wert) { wert = w; bestes = { typ: "reaktion", id: id }; }
    });
    return bestes;
  }

  // ----------------------------------------------------------
  //  Eine Runde
  // ----------------------------------------------------------
  // aktion des Spielers:
  //   { typ: "reaktion", id } | { typ: "sammeln" }
  //   { typ: "untersuchen", werkzeug } | { typ: "bestimmen", art }
  //   { typ: "fangen", geraet } | { typ: "wechseln", nr } | { typ: "fliehen" }
  // gegnerAktion: optional (Prüfstand); sonst wählt die KI.
  // Liefert das Protokoll dieser Runde.
  function zug(k, aktion, gegnerAktion) {
    if (k.ende) throw new Error("Der Kampf ist schon vorbei.");
    k.log = [];
    var g = gegnerAktion || kiWahl(k, "gegner");
    var sp = k.seiten.spieler;

    // Alles, was keine Reaktion ist, geschieht zuerst.
    switch (aktion.typ) {
      case "untersuchen": untersuchen(k, aktion.werkzeug); break;
      case "bestimmen": bestimmen(k, aktion.art); break;
      case "fangen": FANGEN.versuch(k, aktion.geraet); break;
      case "wechseln":
        if (!sp.gruppe[aktion.nr] || sp.gruppe[aktion.nr].zh <= 0) throw new Error("Wechsel nicht möglich.");
        sp.aktiv = aktion.nr; sp.status = {};
        k.log.push({ text: "Du rufst " + name(k, "spieler") + "." });
        break;
      case "fliehen": fliehen(k); break;
      case "sammeln": sp.ae = Math.min(AE_MAX, sp.ae + 2); k.log.push({ text: name(k, "spieler") + " sammelt Kraft." }); break;
      case "reaktion": break;
      default: throw new Error("Unbekannte Aktion: " + aktion.typ);
    }
    if (k.ende) return k.log;

    // Reaktionen: der Schnellere zuerst.
    // Jede Reaktion gehört dem Elemental, das sie gewählt hat. Wird es
    // erschöpft und ein anderes springt ein, handelt der Neue in dieser
    // Runde nicht mehr – sonst schlug Magnesium Eisens Hammerschlag.
    var reihenfolge = [];
    if (aktion.typ === "reaktion") reihenfolge.push({ seite: "spieler", id: aktion.id, wer: aktiv(k, "spieler") });
    if (g.typ === "reaktion") reihenfolge.push({ seite: "gegner", id: g.id, wer: aktiv(k, "gegner") });
    else if (g.typ === "sammeln") { k.seiten.gegner.ae = Math.min(AE_MAX, k.seiten.gegner.ae + 2); k.log.push({ text: name(k, "gegner") + " sammelt Kraft." }); }
    if (reihenfolge.length === 2) {
      var ts = grundwerte(aktiv(k, "spieler").art, aktiv(k, "spieler").stufe).tempo;
      var tg = grundwerte(aktiv(k, "gegner").art, aktiv(k, "gegner").stufe).tempo;
      if (tg > ts || (tg === ts && k.zufall() < 0.5)) reihenfolge.reverse();
    }
    for (var i = 0; i < reihenfolge.length; i++) {
      var z = reihenfolge[i];
      if (aktiv(k, z.seite) !== z.wer || z.wer.zh <= 0) continue;     // erschöpft oder ausgewechselt
      fuehreAus(k, z.seite, z.id);
      if (pruefeErschoepfung(k)) return k.log;
    }

    rundenende(k);
    pruefeErschoepfung(k);
    return k.log;
  }

  function rundenende(k) {
    SEITEN.forEach(function (seite) {
      var s = k.seiten[seite];
      var el = s.gruppe[s.aktiv];
      if (s.status.reizgas && el.zh > 0) {
        el.zh = Math.max(0, el.zh - s.status.reizgas.schaden);
        k.log.push({ seite: seite, schaden: s.status.reizgas.schaden, text: name(k, seite) + " hustet im Schwefeldioxid (−" + s.status.reizgas.schaden + ")." });
        if (--s.status.reizgas.runden <= 0) delete s.status.reizgas;
      }
      s.ae = Math.min(AE_MAX, s.ae + AE_JE_RUNDE + Math.floor(k.feld.waerme / 30));
    });
    var f = k.feld;
    if (f.waerme > f.grundwaerme) f.waerme = Math.max(f.grundwaerme, f.waerme - WAERME_ABKUEHLUNG);
    if (f.offen) f.sauerstoff = Math.min(f.maxSauerstoff, f.sauerstoff + LUFTZUFUHR);
    k.runde++;
  }

  // true, wenn der Kampf dadurch endet.
  function pruefeErschoepfung(k) {
    var g = aktiv(k, "gegner");
    if (g.zh <= 0) {
      if (k.wild) {
        k.log.push({ text: name(k, "gegner") + " ist erschöpft und zieht sich zurück." });
      } else {
        var naechster = ersterFaehiger(k.seiten.gegner.gruppe);
        if (naechster >= 0) { k.seiten.gegner.aktiv = naechster; k.seiten.gegner.status = {}; k.log.push({ text: "Der Gegner ruft " + name(k, "gegner") + "." }); return false; }
      }
      k.ende = "sieg";
      verteileErfahrung(k);
      return true;
    }
    var sp = k.seiten.spieler;
    if (aktiv(k, "spieler").zh <= 0) {
      k.log.push({ text: name(k, "spieler") + " ist erschöpft." });
      var n = ersterFaehiger(sp.gruppe);
      if (n < 0) { k.ende = "niederlage"; k.log.push({ text: "Keiner kann mehr. Zeit, ins Labor zurückzukehren." }); return true; }
      sp.aktiv = n; sp.status = {};
      k.log.push({ text: "Du rufst " + name(k, "spieler") + "." });
    }
    return false;
  }

  function verteileErfahrung(k) {
    var gegner = k.seiten.gegner.gruppe;
    var summe = gegner.reduce(function (a, el) { return a + 12 * el.stufe; }, 0);
    var el = aktiv(k, "spieler");
    var stufen = erfahrung(el, summe);
    k.log.push({ text: name(k, "spieler") + " gewinnt " + summe + " Erfahrung." });
    stufen.forEach(function (st) { k.log.push({ text: name(k, "spieler") + " erreicht Stufe " + st + "!" }); });
  }

  function fliehen(k) {
    if (!k.wild) { k.log.push({ text: "Vor einem Stoffmeister läuft man nicht davon." }); return; }
    var ts = grundwerte(aktiv(k, "spieler").art, aktiv(k, "spieler").stufe).tempo;
    var tg = grundwerte(aktiv(k, "gegner").art, aktiv(k, "gegner").stufe).tempo;
    var p = Math.max(0.3, Math.min(0.95, 0.6 + (ts - tg) / 20));
    if (k.zufall() < p) { k.ende = "geflohen"; k.log.push({ text: "Du ziehst dich zurück." }); }
    else k.log.push({ text: "Kein Durchkommen – das Elemental schneidet dir den Weg ab." });
  }

  // ----------------------------------------------------------
  //  Erkennen
  // ----------------------------------------------------------
  var BEFUND_TEXT = {
    farbe: function (v) { return "Farbe: " + v + "."; },
    glanz: function (v) { return v ? "Es glänzt metallisch." : "Kein Glanz – matt."; },
    magnetisch: function (v) { return v ? "Der Magnet zieht es an!" : "Der Magnet zeigt keine Wirkung."; },
    leitfaehig: function (v) { return v ? "Das Lämpchen leuchtet – es leitet den Strom." : "Das Lämpchen bleibt dunkel – kein Strom."; },
    verformbar: function (v) { return v ? "Unter dem Hammer verbiegt es sich." : "Unter dem Hammer splittert es – spröde."; }
  };

  function untersuchen(k, werkzeug) {
    if (k.werkzeuge.indexOf(werkzeug) < 0) throw new Error("Werkzeug nicht im Gepäck: " + werkzeug);
    var art = ARTEN[aktiv(k, "gegner").art];
    k.log.push({ text: "Du prüfst mit " + WERKZEUGE[werkzeug].name + "." });
    WERKZEUGE[werkzeug].prueft.forEach(function (eig) {
      k.befunde[eig] = art.steckbrief[eig];
      k.log.push({ befund: eig, text: BEFUND_TEXT[eig](art.steckbrief[eig]) });
    });
  }

  function bestimmen(k, artId) {
    var wahr = aktiv(k, "gegner").art;
    if (artId === wahr) {
      k.erkannt = true;
      k.log.push({ erkannt: true, text: "Richtig – das ist " + ARTEN[wahr].name + " (" + ARTEN[wahr].formel + ")! Jetzt weißt du, womit du es zu tun hast." });
      return;
    }
    // Ein Widerspruch zu den eigenen Befunden ist die beste Hilfe:
    // Er zeigt, WARUM die Vermutung nicht stimmt.
    var vermutet = ARTEN[artId];
    var widerspruch = Object.keys(k.befunde).filter(function (eig) { return vermutet.steckbrief[eig] !== k.befunde[eig]; })[0];
    k.log.push({ erkannt: false, text: "Nein, " + vermutet.name + " ist es nicht." +
      (widerspruch ? " " + vermutet.name + " würde sich anders verhalten: " + BEFUND_TEXT[widerspruch](vermutet.steckbrief[widerspruch]) : "") });
  }

  return {
    grundwerte: grundwerte,
    hitzeFaktor: hitzeFaktor,
    wuchtFaktor: wuchtFaktor,
    leitFaktor: leitFaktor,
    neuesElemental: neuesElemental,
    erfahrung: erfahrung,
    epBisNaechste: epBisNaechste,
    neu: neu,
    zug: zug,
    kiWahl: kiWahl,
    hindernis: hindernis,
    schaetzeSchaden: schaetzeSchaden,
    aktiv: aktiv,
    name: name,
    AE_MAX: AE_MAX
  };
})();
