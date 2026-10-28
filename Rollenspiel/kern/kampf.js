// ============================================================
//  KAMPF – der Reaktionskampf
//
//  Reine Logik ohne Phaser. Die Kampfszene zeigt nur an, was hier
//  entschieden wird; der Prüfstand lässt tausende Kämpfe ohne
//  Bildschirm laufen.
//
//  Grundgedanke (seit Fassung 12): Schadensformel wie im Spiel der
//  1. Generation, Typtabelle aus der Chemie (daten\typen.js).
//   · Werte kommen aus Gruppe und Stoffeigenschaften (grundwerte).
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
  var VOLLTREFFER = 1 / 16;       // verdoppelt den Schaden vor dem „+2“ (wie Gen 2)
  var ABWEHR_PLUS_MAX = 4;        // Schutzschichten stapeln sich nicht endlos
  var ABWEHR_PLUS_JE = 0.1;       // je Punkt +10 % Verteidigung und Sp.-Verteidigung
  // Stellschrauben, die der Prüfstand für Messreihen verstellen darf (KAMPF.REGEL):
  // stamm      Angriff aus der Grundausstattung der eigenen Art (Gen 2: STAB)
  // lpFaktor   LP ×2,5 gegenüber Gen 2 (siehe grundwerte)
  // lpSockel   wie sockel, nur für die LP
  // lpGrund, lpTeiler  LP-Basis = lpGrund + Schmelzpunkt / lpTeiler
  // waermeGrund, leitungKuehlt  Wärmeleitung (siehe waermeStaerke)
  // sockel     dämpft den Stufenvorsprung: Werte aus (2·Stufe + sockel)
  // stufenfaktorGlatt  2·Stufe/5 + 2 ohne Abrunden
  // hitzeFeuer Feldwärme, ab der Feuer ×1,5 wirkt (Gen 2: Sonne); null = aus
  // haerteDeckel  höchstens so viel Verteidigung aus der Härte (Bor: Mohs 9,3)
  // Fassung 13 hatte sockel und lpSockel 50, lpFaktor 2: Eine Stufe Vorsprung
  // gewann nur 76 %, und Kohlenstoff auf Stufe 5 hatte mehr LP (126) als
  // Schwefel auf Stufe 10 (124). Seit Fassung 15 (Leitlinie: „Mit Fleiß ist
  // jeder Gegner leicht zu besiegen“) wieder Gen 2 ohne Sockel. Gemessen
  // 28.10.2026 (LIESMICH.md), lpFaktor 1/1,5/2/2,5/3 → Kampfdauer im Median
  // 2/2/3/4/4 Runden; ×2,5: +1 Stufe 92 %, +2 98 %, +3 100 %.
  var REGEL = { stamm: 1.5, lpFaktor: 2.5, lpSockel: 0, lpGrund: 60, lpTeiler: 100, waermeGrund: 40, leitungKuehlt: 10, sockel: 0, stufenfaktorGlatt: true, hitzeFeuer: 80, haerteDeckel: 10 };
  var BLENDUNG_TREFFER = 0.7;     // Trefferchance geblendet
  var BLENDUNG_DAUER = 2;         // eigene Angriffe
  var GIFT_ANTEIL = 0.1, GIFT_RUNDEN = 3;
  var SEITEN = ["spieler", "gegner"];

  // ----------------------------------------------------------
  //  Werte aus Gruppe und Stoffeigenschaften (seit Fassung 12)
  // ----------------------------------------------------------
  // Basiswerte wie im Spiel der 1. und 2. Generation:
  //   Angriff, Sp.-Angriff, Sp.-Verteidigung  aus der Gruppe (GRUPPEN)
  //   Verteidigung   Gruppe + 5 · (Mohshärte − 3), höchstens + REGEL.haerteDeckel
  //   Tempo          130 − 12 · Dichte, auf 5 gerundet, mindestens 20
  //   LP             60 + Schmelzpunkt / 100 (gedeckelt bei 2000 °C, sonst
  //                  wäre Kohlenstoff mit 3640 °C unverwundbar)
  // Auf der Stufe wie in Gen 2 (ohne DVs und EVs), seit Fassung 15:
  //   Wert = ⌊Basis · Stufe / 50⌋ + 5
  //   LP   = 2,5 · (⌊Basis · Stufe / 50⌋ + Stufe + 10)
  // Die Stufe bestimmt die LP, der Schmelzpunkt nur den Feinschliff:
  // Schwefel 40/53/80 auf Stufe 3/5/10, Kohlenstoff 43/58/90.
  // Fassung 13/14 rechnete mit Sockel 50: ⌊Basis · (2 · Stufe + 50) / 100⌋.
  // Bis Fassung 11 gab es nur LP, eine Abwehr (Härte), Tempo und einen
  // Kraft-Faktor der Stufe; siehe LIESMICH.md.
  function basiswerte(artId) {
    var a = ARTEN[artId], s = a.stoff, g = GRUPPEN[a.gruppe];
    return {
      lp: REGEL.lpGrund + Math.min(s.schmelz, 2000) / REGEL.lpTeiler,
      angriff: g.angriff,
      verteidigung: g.verteidigung + Math.min(REGEL.haerteDeckel, 5 * (s.haerte - 3)),
      spAngriff: g.spAngriff,
      spVerteidigung: g.spVerteidigung,
      tempo: Math.max(20, Math.round((130 - 12 * s.dichte) / 5) * 5)
    };
  }

  function aufStufe(basis, stufe) { return Math.floor(basis * (2 * stufe + REGEL.sockel) / 100) + 5; }

  // Abweichung von Gen 2: LP ×2,5 (REGEL.lpFaktor). Mit den LP der Vorlage
  // dauerte ein Kampf im Median 2 Runden – ein sehr wirksamer Stamm-Treffer
  // entschied fast allein, Energie und Feld spielten keine Rolle. Mit ×2,5
  // dauert er auf Stufe 5 im Median 4 Runden.
  function grundwerte(artId, stufe) {
    var b = basiswerte(artId);
    return {
      zhMax: Math.round(REGEL.lpFaktor * (Math.floor(b.lp * (2 * stufe + REGEL.lpSockel) / 100) + stufe + 10)),
      angriff: aufStufe(b.angriff, stufe),
      verteidigung: aufStufe(b.verteidigung, stufe),
      spAngriff: aufStufe(b.spAngriff, stufe),
      spVerteidigung: aufStufe(b.spVerteidigung, stufe),
      tempo: aufStufe(b.tempo, stufe)
    };
  }

  // Die Werte eines konkreten Elementals. Das Starter-Elemental (aus
  // Schmiede oder Garten) ist stärker als alles, was man fängt: Es ist
  // der Gefährte der ganzen Reise. +5 % auf LP, Angriff und Sp.-Angriff –
  // nur für das eigene Elemental des Spielers: Das Flag starter setzt
  // allein die Starterwahl (neuesElemental(…, true)). Lumis Elemental,
  // wilde und Trainer haben es nie.
  var STARTER_BONUS = 0.05;
  function werte(el) {
    var w = grundwerte(el.art, el.stufe);
    if (el.starter) {
      w.zhMax = Math.round(w.zhMax * (1 + STARTER_BONUS));
      w.angriff = Math.round(w.angriff * (1 + STARTER_BONUS));
      w.spAngriff = Math.round(w.spAngriff * (1 + STARTER_BONUS));
    }
    return w;
  }

  // Stärke eines Angriffs für die Anzeige: die feste Zahl auf der Skala
  // bis 100. Schutz und Wärmeleitung (hängt am Feld) haben keine: null.
  function staerke(el, id) {
    var r = REAKTIONEN[id];
    if (r.typ === "schutz" || r.typ === "waerme") return null;
    return r.staerke;
  }

  function neuesElemental(artId, stufe, starter) {
    var el = { art: artId, stufe: stufe, ep: 0, angriffe: ARTEN[artId].reaktionen.slice() };
    if (starter) el.starter = true;
    el.zh = werte(el).zhMax;
    return el;
  }

  // ----------------------------------------------------------
  //  Angriffe lernen (seit 25.10.2026)
  //  Jedes Elemental hat seine eigene Liste (el.angriffe), anfangs die
  //  Angriffe seiner Art. Bei Stufe 6, 8 und 10 darf es einen neuen
  //  lernen: aus den allgemeinen Angriffen, die ihm laut Katalog
  //  zustehen (kannAngriff, daten\elementals.js). Höchstens 4.
  // ----------------------------------------------------------
  var LERNSTUFEN = [6, 8, 10], ANGRIFFE_MAX = 4;

  function angriffe(el) {
    return el.angriffe || ARTEN[el.art].reaktionen;
  }

  // Zwei Vorschläge, fest bestimmt (gleiches Elemental, gleiche Vorschläge):
  // zuerst Angriffe einer Art, die es noch gar nicht kann (Schlag, Feuer,
  // Schutz …), dann die stärkeren.
  // Lernbar ist ein Angriff mit lernbar: true (daten\elementals.js), der
  // dem Stoff zusteht und nicht stärker ist als der stärkste Angriff
  // seiner eigenen Art. Gemessen 25.10.2026 auf Stufe 10 (Spanne der
  // Siegquoten): ohne Lernen 45 · alles Erlaubte lernbar 61–91 (Eisen mit
  // Wuchtstoß 99 %) · mit Kraftgrenze 64 · nur Grundangriffe 44–47.
  // Darum sind vorerst nur Rempler, Schlag und Standfest lernbar.
  function kannLernen(el, id) {
    var r = REAKTIONEN[id];
    if (!r.lernbar || r.fuer.nur || !kannAngriff(el.art, id)) return false;
    var eigeneMax = Math.max.apply(null, ARTEN[el.art].reaktionen.map(function (x) { return REAKTIONEN[x].staerke || 0; }));
    return (r.staerke || 0) <= eigeneMax;
  }

  function lernVorschlaege(el) {
    var kann = angriffe(el), typen = kann.map(function (id) { return REAKTIONEN[id].typ; });
    return Object.keys(REAKTIONEN).filter(function (id) {
      return kann.indexOf(id) < 0 && kannLernen(el, id);
    }).sort(function (a, b) {
      var neuA = typen.indexOf(REAKTIONEN[a].typ) < 0 ? 0 : 1, neuB = typen.indexOf(REAKTIONEN[b].typ) < 0 ? 0 : 1;
      return neuA - neuB || (REAKTIONEN[b].staerke || 0) - (REAKTIONEN[a].staerke || 0) || (a < b ? -1 : 1);
    }).slice(0, 2);
  }

  // Lernt id; ist die Liste voll, ersetzt es den Angriff ersetze.
  function lernen(el, id, ersetze) {
    var liste = angriffe(el).slice();
    if (liste.indexOf(id) >= 0 || !kannLernen(el, id)) return false;
    if (liste.length >= ANGRIFFE_MAX) {
      var nr = liste.indexOf(ersetze);
      if (nr < 0) return false;
      liste[nr] = id;
    } else liste.push(id);
    el.angriffe = liste;
    return true;
  }

  function epBisNaechste(stufe) { return 10 + 10 * stufe; }

  // Gibt Erfahrung; liefert die Liste der erreichten Stufen.
  function erfahrung(el, betrag) {
    var neu = [];
    el.ep += betrag;
    while (el.ep >= epBisNaechste(el.stufe)) {
      el.ep -= epBisNaechste(el.stufe);
      var alt = werte(el).zhMax;
      el.stufe++;
      el.zh += werte(el).zhMax - alt;
      neu.push(el.stufe);
      // Merken, dass nach dem Kampf ein Angriff gelernt werden darf
      if (LERNSTUFEN.indexOf(el.stufe) >= 0) el.lernen = (el.lernen || 0) + 1;
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

  // ----------------------------------------------------------
  //  Protokoll mit Momentaufnahme (seit Fassung 15)
  //  Der Kern rechnet die ganze Runde auf einmal; die Szene spielt sie
  //  danach Eintrag für Eintrag ab. Zeichnete sie dabei den Stand von
  //  k, sah man den Endstand der Runde: Das eigene Elemental verlor
  //  schon LP, während es noch angriff, und ein Erschöpftes stand
  //  bereits auf 0 – „besiegt und greift trotzdem an“. Darum trägt
  //  jeder Eintrag die Lage im Augenblick der Meldung.
  // ----------------------------------------------------------
  function lage(k) {
    var l = { seiten: {}, feld: Object.assign({}, k.feld), erkannt: k.erkannt, befunde: Object.assign({}, k.befunde) };
    SEITEN.forEach(function (seite) {
      var s = k.seiten[seite], el = s.gruppe[s.aktiv];
      if (!el) return;
      l.seiten[seite] = { nr: s.aktiv, art: el.art, name: name(k, seite), stufe: el.stufe, zh: el.zh, zhMax: werte(el).zhMax, ae: s.ae, status: Object.assign({}, s.status) };
    });
    return l;
  }

  function melde(k, eintrag) {
    eintrag.lage = lage(k);
    k.log.push(eintrag);
  }

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

  // Die Schadensformel der 2. Generation (seit Fassung 13), nach jedem
  // Schritt abgerundet:
  //   Schaden = (⌊⌊(⌊2·Stufe/5⌋ + 2) · Stärke · A / V⌋ / 50⌋ · Volltreffer + 2) · Faktoren · Zufall
  // faktoren: Stamm (×1,5), Typ (×2, ×1, ×½), Feld (Gen 2: Wetter), einzeln abgerundet.
  // zufall: 217 bis 255, geteilt durch 255 (85–100 %).
  // voll: Volltreffer verdoppeln den Schaden vor dem „+2“ (Gen 1: die Stufe).
  // Beispiel aus der Vorlage: Stufe 50, Stärke 80, A = V = 100, Stamm,
  // sehr wirksam → 93 bis 110, Volltreffer 183 bis 216 (Prüfstand).
  function formel(stufe, st, A, V, faktoren, zufall, voll) {
    var sf = REGEL.stufenfaktorGlatt ? 2 * stufe / 5 + 2 : Math.floor(2 * stufe / 5) + 2;
    var s = Math.floor(Math.floor(sf * st * A / V) / 50) * (voll ? 2 : 1) + 2;
    faktoren.forEach(function (f) { s = Math.floor(s * f); });
    return Math.floor(s * zufall / 255);
  }

  // Wärmeleitung: Stärke = Wärme des Feldes + 40 (Fassung 12: +45), höchstens 100; danach ist
  // das Feld um 10 kühler. Nur die Feldwärme (Plan) gab bei Wärme 20 Stärke
  // 20 – Kupfer gewann 8 %. Messreihen 27.10.2026 (Kupfer, Stufe 5): +40 →
  // 25 %, +45 → 42 %, +50 → 51 %, aber dann schlägt Kupfer Eisen 98 %.
  function waermeStaerke(k) { return Math.min(100, Math.round(k.feld.waerme) + REGEL.waermeGrund); }

  // Das Feld als Wetter (Gen 2: Regen und Sonne): Feuchte über 70 dämpft
  // Feuer auf die Hälfte, große Hitze (REGEL.hitzeFeuer) facht es an (×1,5).
  // Bis Fassung 12: Feuchte ×0,7, keine Hitze-Regel.
  function feldFaktor(k, r) {
    if (r.typ !== "feuer") return 1;
    if (k.feld.feuchte > 70) return 0.5;
    if (REGEL.hitzeFeuer !== null && k.feld.waerme >= REGEL.hitzeFeuer) return 1.5;
    return 1;
  }

  // Trefferchance (0–1): Genauigkeit des Angriffs, geblendet ×0,7.
  function trefferChance(k, seite, reaktionId) {
    var r = REAKTIONEN[reaktionId];
    return (r.genau || 100) / 100 * (k.seiten[seite].status.geblendet ? BLENDUNG_TREFFER : 1);
  }

  // Mittlerer Schaden eines Treffers (Zufall 236/255 ≈ 92,5 %, ohne
  // Volltreffer) – für die KI und für die Anzeige „≈ x % LP“.
  // ohneSchutz: so, als stünde beim Ziel kein Schild – für die Anzeige
  // im Angriffsmenü. Ein Schild dämpft nur den nächsten Treffer; mit ihm
  // gerechnet sähe jeder Angriff wertlos aus.
  var ZUFALL_MITTEL = 236;
  function schaetzeSchaden(k, seite, reaktionId, ohneSchutz) {
    if (ohneSchutz) return ohneSchild(k, gegenueber(seite), function () { return schaden(k, seite, reaktionId, ZUFALL_MITTEL); });
    return schaden(k, seite, reaktionId, ZUFALL_MITTEL);
  }

  function schaden(k, seite, reaktionId, zufall, voll) {
    var r = REAKTIONEN[reaktionId];
    if (r.typ === "schutz") return 0;
    var an = aktiv(k, seite), ziel = aktiv(k, gegenueber(seite));
    var zs = k.seiten[gegenueber(seite)].status;
    var wa = werte(an), wz = werte(ziel);
    // Physisch oder speziell hängt nur am Typ (wie in Gen 1).
    var physisch = TYPEN[r.typ].physisch;
    var A = physisch ? wa.angriff : wa.spAngriff;
    var V = (physisch ? wz.verteidigung : wz.spVerteidigung) * (1 + ABWEHR_PLUS_JE * (zs.abwehrPlus || 0));
    var st = r.typ === "waerme" ? waermeStaerke(k) : r.staerke;
    var stamm = ARTEN[an.art].reaktionen.indexOf(reaktionId) >= 0 ? REGEL.stamm : 1;
    var s = formel(an.stufe, st, A, V, [stamm, typWirkung(r.typ, ziel.art, k.feld.waerme).faktor, feldFaktor(k, r)], zufall, voll);
    if (zs.schutz) s *= zs.schutz;
    if (zs.tarnung) s *= 0.5;
    return Math.max(1, Math.floor(s));
  }

  function fuehreAus(k, seite, reaktionId) {
    var r = REAKTIONEN[reaktionId];
    var s = k.seiten[seite], ander = gegenueber(seite);
    var z = k.seiten[ander];
    var wer = name(k, seite);

    var grund = hindernis(k, seite, reaktionId);
    if (grund) {
      melde(k, { seite: seite, handelt: true, text: wer + " versucht " + r.name + ". " + grund });
      // Eine erstickte Flamme hat die Energie trotzdem verbraucht.
      if (r.o2 && k.feld.sauerstoff < r.o2) s.ae = Math.max(0, s.ae - r.ae);
      return;
    }

    s.ae -= r.ae;
    melde(k, { seite: seite, reaktion: reaktionId, text: wer + ": " + r.name + "!" });

    var w = r.wirkung || {};
    if (r.typ !== "schutz") {
      var chance = trefferChance(k, seite, reaktionId);
      if (s.status.geblendet && --s.status.geblendet <= 0) delete s.status.geblendet;
      if (k.zufall() >= chance) {
        melde(k, { seite: seite, verfehlt: true, text: wer + " verfehlt!" });
      } else {
        // Volltreffer und Zufall gehören in die App, nicht an den
        // Kartentisch – hier sind sie erlaubt und halten Paarungen offen.
        var voll = k.zufall() < VOLLTREFFER;
        var betrag = schaden(k, seite, reaktionId, 217 + Math.floor(k.zufall() * 39), voll);
        if (r.typ === "waerme") k.feld.waerme = Math.max(0, k.feld.waerme - REGEL.leitungKuehlt);
        var ziel = aktiv(k, ander);
        // Erst „Volltreffer!“, dann sinken die LP – so steht es auch im Protokoll.
        if (voll) melde(k, { volltreffer: true, text: "Volltreffer!" });
        ziel.zh = Math.max(0, ziel.zh - betrag);
        delete z.status.schutz;
        delete z.status.tarnung;
        melde(k, { seite: ander, schaden: betrag, text: name(k, ander) + " verliert " + betrag + " LP." });
        // Nebenwirkungen mit ihrer Chance in % – nur, wer noch steht.
        if (ziel.zh > 0 && w.blendung && k.zufall() * 100 < w.blendung) {
          z.status.geblendet = BLENDUNG_DAUER;
          melde(k, { text: name(k, ander) + " ist geblendet und trifft schlechter." });
        }
        if (ziel.zh > 0 && w.vergiftung && k.zufall() * 100 < w.vergiftung) {
          z.status.vergiftet = GIFT_RUNDEN;
          melde(k, { text: name(k, ander) + " ist vergiftet." });
        }
      }
    }

    if (r.o2) k.feld.sauerstoff = Math.max(0, k.feld.sauerstoff - r.o2);
    if (r.waerme) k.feld.waerme = Math.min(100, k.feld.waerme + r.waerme);

    if (w.schutz) s.status.schutz = w.schutz;
    if (w.tarnung) s.status.tarnung = true;
    if (w.abwehrPlus) s.status.abwehrPlus = Math.min(ABWEHR_PLUS_MAX, (s.status.abwehrPlus || 0) + w.abwehrPlus);
  }

  // ----------------------------------------------------------
  //  Die KI des Gegners (und im Prüfstand beider Seiten)
  // ----------------------------------------------------------
  // Rechnet etwas, als stünde auf dieser Seite kein Schild.
  function ohneSchild(k, seite, rechne) {
    var st = k.seiten[seite].status, schutz = st.schutz, tarnung = st.tarnung;
    delete st.schutz; delete st.tarnung;
    var wert = rechne();
    if (schutz !== undefined) st.schutz = schutz;
    if (tarnung !== undefined) st.tarnung = tarnung;
    return wert;
  }

  function kiWahl(k, seite) {
    var el = aktiv(k, seite);
    var s = k.seiten[seite];
    var bestes = { typ: "sammeln" }, wert = 0.5;
    // Was der Gegner als Nächstes anrichten könnte – daran misst sich
    // der Wert eines Schutzzugs.
    var ander = gegenueber(seite);
    var zs = k.seiten[ander].status;
    var drohung = 0;
    angriffe(aktiv(k, ander)).forEach(function (id) {
      if (REAKTIONEN[id].typ !== "schutz" && !hindernis(k, ander, id)) drohung = Math.max(drohung, schaetzeSchaden(k, ander, id) * trefferChance(k, ander, id));
    });
    angriffe(el).forEach(function (id) {
      if (hindernis(k, seite, id)) return;
      var r = REAKTIONEN[id], w;
      if (r.typ === "schutz") {
        var wi = r.wirkung;
        // Verteidigung +10 % je Punkt ist auf Dauer etwa so viel wert wie
        // ein Zehntel der Drohung je Punkt (bis Fassung 11 feste Zahlen 2 und 4).
        var plus = wi.abwehrPlus && (s.status.abwehrPlus || 0) < ABWEHR_PLUS_MAX ? drohung * ABWEHR_PLUS_JE * wi.abwehrPlus : 0;
        if (wi.schutz) w = s.status.schutz ? 0 : drohung * (1 - wi.schutz) + plus;
        else if (wi.tarnung) w = s.status.tarnung ? 0 : drohung * 0.5;
        else if (wi.abwehrPlus) w = plus;
        else w = 0;
        // Nur wer noch lange genug steht, hat vom Schutz etwas.
        if (el.zh < drohung) w *= 0.3;
      } else {
        var p = trefferChance(k, seite, id);
        w = schaetzeSchaden(k, seite, id) * p;
        // Ein Schild hält nur einen Treffer. Wer ihn nur nach dem
        // gedämpften Schaden bewertet, schlägt nie hinein und wartet
        // ewig hinter „Standfest“ – so verlor Magnesium 98 % gegen Zink
        // (gefunden 25.10.2026). Das Brechen des Schilds zählt mit.
        if (zs.schutz || zs.tarnung) w = (w + ohneSchild(k, ander, function () { return schaetzeSchaden(k, seite, id) * p; })) / 2;
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
  // Handelt der Gegner vor dem Spieler? Der Schnellere zuerst, bei
  // gleichem Tempo entscheidet der Zufall.
  function gegnerZuerst(k) {
    var ts = werte(aktiv(k, "spieler")).tempo;
    var tg = werte(aktiv(k, "gegner")).tempo;
    return tg > ts || (tg === ts && k.zufall() < 0.5);
  }

  // Für die Kampfszene (seit 25.10.2026): Ist der Gegner schneller,
  // handelt er JETZT – bevor der Spieler wählt. So wählt man immer erst,
  // wenn das eigene Elemental an der Reihe ist. Vorher wählte man, und
  // danach griff manchmal erst der Gegner an; das verwirrte.
  // Der Prüfstand ruft nur zug() und spielt damit wie bisher.
  function rundeBeginnen(k) {
    k.log = [];
    if (k.ende) return k.log;
    var g = kiWahl(k, "gegner");
    var zuerst = gegnerZuerst(k);
    k.reihenfolge = zuerst ? "gegner" : "spieler";
    if (zuerst && (g.typ === "reaktion" || g.typ === "sammeln")) {
      if (g.typ === "reaktion") { fuehreAus(k, "gegner", g.id); pruefeErschoepfung(k); }
      else gegnerSammelt(k);
      k.gegnerHatGehandelt = true;
    } else {
      k.geplant = g;
    }
    return k.log;
  }

  function gegnerSammelt(k) {
    k.seiten.gegner.ae = Math.min(AE_MAX, k.seiten.gegner.ae + 2);
    melde(k, { seite: "gegner", handelt: true, text: name(k, "gegner") + " sammelt Kraft." });
  }

  function zug(k, aktion, gegnerAktion) {
    if (k.ende) throw new Error("Der Kampf ist schon vorbei.");
    k.log = [];
    var g = gegnerAktion || k.geplant || kiWahl(k, "gegner");
    var gegnerFertig = !!k.gegnerHatGehandelt, fest = k.reihenfolge;
    k.geplant = null; k.gegnerHatGehandelt = false; k.reihenfolge = null;
    var sp = k.seiten.spieler;

    // Alles, was keine Reaktion ist, geschieht zuerst.
    switch (aktion.typ) {
      case "untersuchen": untersuchen(k, aktion.werkzeug); break;
      case "bestimmen": bestimmen(k, aktion.art); break;
      case "fangen":
        FANGEN.versuch(k, aktion.geraet);
        if (k.ende === "gefangen") verteileErfahrung(k, 0.5);
        break;
      case "wechseln":
        if (!sp.gruppe[aktion.nr] || sp.gruppe[aktion.nr].zh <= 0) throw new Error("Wechsel nicht möglich.");
        sp.aktiv = aktion.nr; sp.status = {};
        melde(k, { seite: "spieler", ruft: true, text: "Du rufst " + name(k, "spieler") + "." });
        break;
      case "fliehen": fliehen(k); break;
      case "sammeln": sp.ae = Math.min(AE_MAX, sp.ae + 2); melde(k, { seite: "spieler", handelt: true, text: name(k, "spieler") + " sammelt Kraft." }); break;
      case "brenner":
        // Der Gasbrenner aus Brenner: einmal je Kampf Aktivierungsenergie
        // von außen – und seine Flamme heizt das Feld auf.
        if (k.werkzeuge.indexOf("gasbrenner") < 0) throw new Error("Kein Gasbrenner im Gepäck.");
        if (k.brennerBenutzt) { melde(k, { text: "Das Gas im Brenner ist für diesen Kampf verbraucht." }); break; }
        k.brennerBenutzt = true;
        sp.ae = Math.min(AE_MAX, sp.ae + 4);
        k.feld.waerme = Math.min(100, k.feld.waerme + 10);
        melde(k, { text: "Du entzündest den Gasbrenner – rauschende Flamme, Luftzufuhr offen. Die Hitze liefert Aktivierungsenergie." });
        break;
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
    if (!gegnerFertig) {
      if (g.typ === "reaktion") reihenfolge.push({ seite: "gegner", id: g.id, wer: aktiv(k, "gegner") });
      else if (g.typ === "sammeln") gegnerSammelt(k);
    }
    if (reihenfolge.length === 2 && (fest ? fest === "gegner" : gegnerZuerst(k))) reihenfolge.reverse();
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
      // Vergiftung: 10 % der vollen LP am Ende jeder Runde, 3 Runden lang.
      if (s.status.vergiftet && el.zh > 0) {
        var gift = Math.max(1, Math.round(werte(el).zhMax * GIFT_ANTEIL));
        el.zh = Math.max(0, el.zh - gift);
        melde(k, { seite: seite, schaden: gift, text: name(k, seite) + " leidet unter dem Gift (−" + gift + " LP)." });
        if (--s.status.vergiftet <= 0) delete s.status.vergiftet;
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
        melde(k, { seite: "gegner", erschoepft: true, text: name(k, "gegner") + " ist erschöpft und zieht sich zurück." });
      } else {
        melde(k, { seite: "gegner", erschoepft: true, text: name(k, "gegner") + " ist erschöpft." });
        var naechster = ersterFaehiger(k.seiten.gegner.gruppe);
        if (naechster >= 0) { k.seiten.gegner.aktiv = naechster; k.seiten.gegner.status = {}; melde(k, { seite: "gegner", ruft: true, text: "Der Gegner ruft " + name(k, "gegner") + "." }); return false; }
      }
      k.ende = "sieg";
      verteileErfahrung(k);
      return true;
    }
    var sp = k.seiten.spieler;
    if (aktiv(k, "spieler").zh <= 0) {
      melde(k, { seite: "spieler", erschoepft: true, text: name(k, "spieler") + " ist erschöpft." });
      var n = ersterFaehiger(sp.gruppe);
      if (n < 0) { k.ende = "niederlage"; melde(k, { text: "Keiner kann mehr. Zeit, ins Labor zurückzukehren." }); return true; }
      sp.aktiv = n; sp.status = {};
      melde(k, { seite: "spieler", ruft: true, text: "Du rufst " + name(k, "spieler") + "." });
    }
    return false;
  }

  // Das aktive Elemental bekommt die volle Erfahrung, alle anderen der
  // Gruppe 20 % – auch erschöpfte, sie haben zugesehen. Ein Fang bringt
  // die Hälfte (anteil 0.5).
  var GRUPPE_LERNT = 0.2;
  function verteileErfahrung(k, anteil) {
    var gegner = k.seiten.gegner.gruppe;
    var summe = Math.round(gegner.reduce(function (a, el) { return a + 12 * el.stufe; }, 0) * (anteil || 1));
    var sp = k.seiten.spieler, el = aktiv(k, "spieler");
    var stufen = erfahrung(el, summe);
    melde(k, { text: name(k, "spieler") + " gewinnt " + summe + " Erfahrung." });
    stufen.forEach(function (st) { melde(k, { text: name(k, "spieler") + " erreicht Stufe " + st + "!" }); });
    var rest = Math.round(summe * GRUPPE_LERNT);
    var andere = sp.gruppe.filter(function (g) { return g !== el; });
    if (!andere.length || !rest) return;
    melde(k, { text: "Die Gruppe lernt mit (+" + rest + " Erfahrung)." });
    andere.forEach(function (g) {
      erfahrung(g, rest).forEach(function (st) { melde(k, { text: (g.spitzname || ARTEN[g.art].name) + " erreicht Stufe " + st + "!" }); });
    });
  }

  function fliehen(k) {
    if (!k.wild) { melde(k, { text: "Vor einem Stoffmeister läuft man nicht davon." }); return; }
    var ts = werte(aktiv(k, "spieler")).tempo;
    var tg = werte(aktiv(k, "gegner")).tempo;
    var p = Math.max(0.3, Math.min(0.95, 0.6 + (ts - tg) / 20));
    if (k.zufall() < p) { k.ende = "geflohen"; melde(k, { text: "Du ziehst dich zurück." }); }
    else melde(k, { text: "Kein Durchkommen – das Elemental schneidet dir den Weg ab." });
  }

  // ----------------------------------------------------------
  //  Erkennen
  // ----------------------------------------------------------
  var BEFUND_TEXT = {
    farbe: function (v) { return "Farbe: " + v + "."; },
    glanz: function (v) { return v ? "Es glänzt metallisch." : "Kein Glanz – matt."; },
    magnetisch: function (v) { return v ? "Der Magnet zieht es an!" : "Der Magnet zeigt keine Wirkung."; },
    leitfaehig: function (v) { return v ? "Das Lämpchen leuchtet – es leitet den Strom." : "Das Lämpchen bleibt dunkel – kein Strom."; },
    verformbar: function (v) { return v ? "Unter dem Hammer verbiegt es sich." : "Unter dem Hammer splittert es – spröde."; },
    brennt: function (v) { return v ? "In der Brennerflamme fängt es Feuer." : "In der Brennerflamme brennt es nicht."; }
  };

  function untersuchen(k, werkzeug) {
    if (k.werkzeuge.indexOf(werkzeug) < 0) throw new Error("Werkzeug nicht im Gepäck: " + werkzeug);
    var art = ARTEN[aktiv(k, "gegner").art];
    melde(k, { text: "Du prüfst mit " + WERKZEUGE[werkzeug].name + "." });
    WERKZEUGE[werkzeug].prueft.forEach(function (eig) {
      k.befunde[eig] = art.steckbrief[eig];
      melde(k, { befund: eig, text: BEFUND_TEXT[eig](art.steckbrief[eig]) });
    });
  }

  function bestimmen(k, artId) {
    var wahr = aktiv(k, "gegner").art;
    if (artId === wahr) {
      k.erkannt = true;
      melde(k, { erkannt: true, text: "Richtig – das ist " + ARTEN[wahr].name + " (" + ARTEN[wahr].formel + ")! Jetzt weißt du, womit du es zu tun hast." });
      return;
    }
    // Ein Widerspruch zu den eigenen Befunden ist die beste Hilfe:
    // Er zeigt, WARUM die Vermutung nicht stimmt.
    var vermutet = ARTEN[artId];
    var widerspruch = Object.keys(k.befunde).filter(function (eig) { return vermutet.steckbrief[eig] !== k.befunde[eig]; })[0];
    melde(k, { erkannt: false, text: "Nein, " + vermutet.name + " ist es nicht." +
      (widerspruch ? " " + vermutet.name + " würde sich anders verhalten: " + BEFUND_TEXT[widerspruch](vermutet.steckbrief[widerspruch]) : "") });
  }

  return {
    grundwerte: grundwerte,
    werte: werte,
    staerke: staerke,
    rundeBeginnen: rundeBeginnen,
    melde: melde,
    angriffe: angriffe,
    lernVorschlaege: lernVorschlaege,
    kannLernen: kannLernen,
    lernen: lernen,
    LERNSTUFEN: LERNSTUFEN,
    ANGRIFFE_MAX: ANGRIFFE_MAX,
    befundText: function (eig, wert) { return BEFUND_TEXT[eig](wert); },
    STARTER_BONUS: STARTER_BONUS,
    GRUPPE_LERNT: GRUPPE_LERNT,
    basiswerte: basiswerte,
    formel: formel,
    trefferChance: trefferChance,
    waermeStaerke: waermeStaerke,
    REGEL: REGEL,
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
