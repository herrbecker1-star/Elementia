// ============================================================
//  KAMPF – der Elementalkampf
//
//  Reine Logik ohne Phaser. Die Kampfszene zeigt nur an, was hier
//  entschieden wird; der Prüfstand lässt tausende Kämpfe ohne
//  Bildschirm laufen.
//
//  Seit Fassung 20 (30.10.2026) nach der Tabelle des Nutzers
//  (drehbuch\Chemie-Kreaturensammler.xlsx → daten\kreaturen.js):
//   · 14 Typen nach dem Periodensystem, Typentabelle mit ×2/×½/×0.
//     Jede Art hat Typ 1 und Typ 2; Normal trifft kein Gas und keinen Geist.
//   · 100 Attacken nach Vorbildern aus Gen 2 mit Effekten (e) und
//     Statusproblemen: verbrannt, gefroren, geladen, korrodiert,
//     inert, verstrahlt. Statuswert-Stufen −6 bis +6 wie in Gen 2.
//   · Werte weiter aus Gruppe und Stoff, Schadensformel Gen 2.
//   · Aktivierungsenergie (AE) bleibt die Zugressource (Wunsch des
//     Nutzers); die Kosten folgen der Stärke (Import-Skript).
//   · Das Kampffeld (Sauerstoff, Wärme, Feuchte) ist entfallen. Dafür
//     gibt es Kampfwetter aus Attacken (Sauerstoffschub, Kalkstaubsturm).
//   · Wer erschöpft ist, zieht sich zurück. Niemand stirbt.
// ============================================================

var KAMPF = (function () {
  "use strict";

  var AE_START = 3, AE_MAX = 10, AE_JE_RUNDE = 3;
  var VOLLTREFFER = 1 / 16, VOLLTREFFER_HOCH = 1 / 4;   // Gen 2: hohe Volltrefferchance
  // Stellschrauben, die der Prüfstand für Messreihen verstellen darf (KAMPF.REGEL):
  // stamm      Attacke vom eigenen Typ (Gen 2: STAB)
  // lpFaktor   LP ×2,5 gegenüber Gen 2 (siehe grundwerte)
  // lpSockel   wie sockel, nur für die LP
  // lpGrund, lpTeiler  LP-Basis = lpGrund + Schmelzpunkt / lpTeiler
  // sockel     dämpft den Stufenvorsprung: Werte aus (2·Stufe + sockel)
  // stufenfaktorGlatt  2·Stufe/5 + 2 ohne Abrunden
  // haerteDeckel  höchstens so viel Verteidigung aus der Härte (Bor: Mohs 9,3)
  // tempoGrund, tempoJeDichte  Tempo = tempoGrund − tempoJeDichte · Dichte
  // Seit Fassung 15 Gen 2 ohne Sockel. lpFaktor seit Fassung 20 wieder 1
  // (wie Gen 2): Mit den Attacken der Tabelle dauerte ein Kampf bei 2,5
  // im Median 13 Runden, bei 1,5 acht, bei 1 fünf (gemessen 30.10.2026).
  // Ebenfalls seit Fassung 20 angeglichen (Messung f20b-D2): Schmelzpunkt,
  // Härte und Dichte geben nur noch Feinschliff – lpTeiler 300 statt 100,
  // haerteDeckel 5 statt 10, Tempo 110 − 8 · Dichte statt 130 − 12 · Dichte.
  var REGEL = { stamm: 1.5, lpFaktor: 1, lpSockel: 0, lpGrund: 60, lpTeiler: 300, sockel: 0, stufenfaktorGlatt: true, haerteDeckel: 5, tempoGrund: 110, tempoJeDichte: 8 };
  // Statusprobleme (Gen 2): Dauerschaden je Rundenende als Anteil der LP
  var VERBRANNT_ANTEIL = 1 / 8, KORRODIERT_ANTEIL = 1 / 8, FESTHALTEN_ANTEIL = 1 / 16, STAUB_ANTEIL = 1 / 16;
  var AUFTAUEN = 0.1, GELADEN_AUSSETZEN = 0.25, VERSTRAHLT_SELBST = 0.5;
  var KAMPFWETTER_RUNDEN = 5, WAND_RUNDEN = 5;
  var STAUBFEST = ["erde", "kristall", "stahl", "hartmetall"];
  var HAUPTSTATUS = ["verbrannt", "gefroren", "geladen", "korrodiert", "schwer_korrodiert", "inert"];
  var STATUS_KURZ = { verbrannt: "VERBR", gefroren: "GEFR", geladen: "GELADEN", korrodiert: "KORR", schwer_korrodiert: "KORR+", inert: "INERT" };
  var WERT_NAME = { ang: "Angriff", vert: "Verteidigung", spAng: "Spezial-Angriff", spVert: "Spezial-Verteidigung", init: "Initiative", genau: "Genauigkeit" };
  var SEITEN = ["spieler", "gegner"];

  // ----------------------------------------------------------
  //  Werte aus Gruppe und Stoffeigenschaften (seit Fassung 12)
  // ----------------------------------------------------------
  // Basiswerte wie im Spiel der 1. und 2. Generation:
  //   Angriff, Sp.-Angriff, Sp.-Verteidigung  aus der Gruppe (GRUPPEN)
  //   Verteidigung   Gruppe + 5 · (Mohshärte − 3), höchstens + REGEL.haerteDeckel
  //   Tempo          110 − 8 · Dichte (REGEL), auf 5 gerundet, mindestens 20
  //   LP             60 + Schmelzpunkt / 300 (REGEL; gedeckelt bei 2000 °C, sonst
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
      tempo: Math.max(20, Math.round((REGEL.tempoGrund - REGEL.tempoJeDichte * s.dichte) / 5) * 5)
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

  // Stärke einer Attacke für die Anzeige. Status-Attacken haben keine
  // (null); fester Schaden und „wie Level“ zeigen ihre Zahl, Sofort-K.o.
  // das Wort.
  function staerke(el, id) {
    var a = ATTACKEN[id], e = a.e;
    if (a.kategorie === "status") return null;
    if (e.fest) return e.fest;
    if (e.festLevel) return el ? el.stufe : null;
    if (e.ohko) return "K.O.";
    if (e.konter) return "×2";
    return a.staerke;
  }

  // Typwirkung einer Attacke vom Typ atyp gegen die Art artId:
  // Typ 1 × Typ 2 aus der Tabelle; Normal geht durch Gas einfach hindurch.
  function typFaktor(atyp, artId) {
    var a = ARTEN[artId], zeile = TYPENTABELLE[atyp];
    if (!zeile) return 1;
    if (atyp === "normal" && a.zustand === "gasförmig") return 0;
    var f = zeile[a.typ1] !== undefined ? zeile[a.typ1] : 1;
    if (a.typ2) f *= zeile[a.typ2] !== undefined ? zeile[a.typ2] : 1;
    return f;
  }

  // Statuswert-Stufen wie in Gen 2: +1 = ×1,5, +2 = ×2 … −1 = ×⅔ …;
  // Genauigkeit in Dritteln.
  function stufenMult(n, genau) {
    var b = genau ? 3 : 2;
    n = Math.max(-6, Math.min(6, n || 0));
    return n >= 0 ? (b + n) / b : b / (b - n);
  }

  // ----------------------------------------------------------
  //  Angriffe lernen – seit Fassung 18 nach dem Lernset der Art
  //  (ARTEN[art].lernset, freigegeben 29.10.2026). Jedes Elemental hat
  //  seine eigene Liste (el.angriffe), höchstens 4. Ein neues Elemental
  //  kann die letzten 4 Angriffe seines Lernsets bis zu seiner Stufe.
  //  Bis Fassung 17: zwei Vorschläge aus dem Katalog bei Stufe 6/8/10.
  // ----------------------------------------------------------
  var ANGRIFFE_MAX = 4;

  // Alle Angriffe des Lernsets bis zur Stufe, in Lernreihenfolge.
  function lernsetBis(artId, stufe) {
    var set = ARTEN[artId].lernset, liste = [];
    Object.keys(set).map(Number).sort(function (a, b) { return a - b; }).forEach(function (st) {
      if (st <= stufe) set[st].forEach(function (id) { if (liste.indexOf(id) < 0) liste.push(id); });
    });
    return liste;
  }

  function neuesElemental(artId, stufe, starter) {
    var el = { art: artId, stufe: stufe, ep: 0, angriffe: lernsetBis(artId, stufe).slice(-ANGRIFFE_MAX) };
    if (starter) el.starter = true;
    el.zh = werte(el).zhMax;
    return el;
  }

  function angriffe(el) {
    return el.angriffe || lernsetBis(el.art, el.stufe).slice(-ANGRIFFE_MAX);
  }

  // Lernen darf ein Elemental, was sein Lernset bis zu seiner Stufe enthält.
  function kannLernen(el, id) {
    return lernsetBis(el.art, el.stufe).indexOf(id) >= 0;
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

  // Gibt Erfahrung; liefert die Liste der erreichten Stufen. Fällige
  // Angriffe des Lernsets kommen in el.lernen (Liste); nach dem Kampf
  // fragt die Szene sie ab (lernDialog).
  function erfahrung(el, betrag) {
    var neu = [];
    el.ep += betrag;
    while (el.ep >= epBisNaechste(el.stufe)) {
      el.ep -= epBisNaechste(el.stufe);
      var alt = werte(el).zhMax;
      el.stufe++;
      el.zh += werte(el).zhMax - alt;
      neu.push(el.stufe);
      (ARTEN[el.art].lernset[el.stufe] || []).forEach(function (id) {
        if (!Array.isArray(el.lernen)) el.lernen = [];
        if (angriffe(el).indexOf(id) < 0 && el.lernen.indexOf(id) < 0) el.lernen.push(id);
      });
    }
    return neu;
  }

  // ----------------------------------------------------------
  //  Kampf anlegen
  // ----------------------------------------------------------
  // optionen: gruppe (Liste Elementals), gegner (Liste), wild, bekannt
  //   (Liste der schon erkannten Arten), vorrat { gefaess: anzahl },
  //   material, werkzeuge (Liste), startwert. Ein „feld“ (bis Fassung 19)
  //   wird nicht mehr gebraucht.
  function neueSeite(gruppe, aktivNr) {
    return { gruppe: gruppe, aktiv: aktivNr, ae: AE_START, status: {} };
  }

  function neu(o) {
    var k = {
      runde: 1,
      wetter: null,                        // Kampfwetter: { art: "sauerstoff" | "staub", runden }
      seiten: {
        spieler: neueSeite(o.gruppe, ersterFaehiger(o.gruppe)),
        gegner:  neueSeite(o.gegner, 0)
      },
      wild: o.wild !== false,
      vorrat: o.vorrat || {},
      material: o.material || {},          // Glasbruch aus zersprungenen Gefäßen
      werkzeuge: o.werkzeuge || [],
      befunde: {},
      fehlversuche: 0,
      ende: null,
      log: [],
      zufall: ZUFALL(o.startwert)
    };
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
  //  danach Eintrag für Eintrag ab. Darum trägt jeder Eintrag die Lage
  //  im Augenblick der Meldung.
  // ----------------------------------------------------------
  function lage(k) {
    var l = { seiten: {}, wetter: k.wetter ? Object.assign({}, k.wetter) : null, erkannt: k.erkannt, befunde: Object.assign({}, k.befunde) };
    SEITEN.forEach(function (seite) {
      var s = k.seiten[seite], el = s.gruppe[s.aktiv];
      if (!el) return;
      l.seiten[seite] = { nr: s.aktiv, art: el.art, name: name(k, seite), stufe: el.stufe, zh: el.zh, zhMax: werte(el).zhMax, ae: s.ae,
        status: JSON.parse(JSON.stringify(s.status)) };
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
  // Liefert null, wenn der Zug geht, sonst den Grund. Eine aufgeladene
  // zweirundige Attacke kostet in der zweiten Runde nichts mehr.
  function hindernis(k, seite, id) {
    var a = ATTACKEN[id], s = k.seiten[seite];
    if (s.status.laedt && s.status.laedt.id === id) return null;
    if (s.ae < a.ae) return "Zu wenig Aktivierungsenergie (" + a.ae + " nötig).";
    return null;
  }

  // Die Schadensformel der 2. Generation (seit Fassung 13), nach jedem
  // Schritt abgerundet:
  //   Schaden = (⌊⌊(⌊2·Stufe/5⌋ + 2) · Stärke · A / V⌋ / 50⌋ · Volltreffer + 2) · Faktoren · Zufall
  // faktoren: Stamm (×1,5), Typ (×2, ×1, ×½, ×0), Kampfwetter, einzeln abgerundet.
  // zufall: 217 bis 255, geteilt durch 255 (85–100 %).
  // Beispiel aus der Vorlage: Stufe 50, Stärke 80, A = V = 100, Stamm,
  // sehr wirksam → 93 bis 110, Volltreffer 183 bis 216 (Prüfstand).
  function formel(stufe, st, A, V, faktoren, zufall, voll) {
    var sf = REGEL.stufenfaktorGlatt ? 2 * stufe / 5 + 2 : Math.floor(2 * stufe / 5) + 2;
    var s = Math.floor(Math.floor(sf * st * A / V) / 50) * (voll ? 2 : 1) + 2;
    faktoren.forEach(function (f) { s = Math.floor(s * f); });
    return Math.floor(s * zufall / 255);
  }

  function stufe(s, wert) { return (s.status.stufen && s.status.stufen[wert]) || 0; }

  // Initiative mit Stufen; geladen viertelt sie (Gen 2: Paralyse).
  function initiative(k, seite) {
    var s = k.seiten[seite], t = werte(aktiv(k, seite)).tempo * stufenMult(stufe(s, "init"));
    return s.status.haupt === "geladen" ? t / 4 : t;
  }

  // Trefferchance (0–1): Genauigkeit der Attacke mal Genauigkeits-Stufe.
  // „trifft immer“ (genau null) und „Zielen“ treffen sicher. Wer
  // verschwunden ist (Ausfällung, Heliumballon), wird nicht getroffen.
  function trefferChance(k, seite, id) {
    var a = ATTACKEN[id], s = k.seiten[seite], z = k.seiten[gegenueber(seite)];
    if (z.status.weg) return 0;
    if (a.genau === null || a.kategorie === "status" && !a.e.gegner && !a.e.status) return 1;
    if (s.status.zielen) return 1;
    return Math.min(1, a.genau / 100 * stufenMult(stufe(s, "genau"), true));
  }

  // Mittlerer Schaden eines Treffers (Zufall 236/255 ≈ 92,5 %, ohne
  // Volltreffer) – für die KI. Mehrfach-Attacken mit 3 Treffern im Mittel.
  var ZUFALL_MITTEL = 236;
  function schaetzeSchaden(k, seite, id) {
    var a = ATTACKEN[id], e = a.e;
    if (a.kategorie === "status") return 0;
    if (e.konter) {
      var letzter = k.seiten[seite].status.erlitten;
      return letzter && letzter.kategorie === e.konter ? letzter.betrag * 2 : 0;
    }
    var s = schaden(k, seite, id, ZUFALL_MITTEL);
    if (e.mehrfach) s *= e.mehrfach[0] === e.mehrfach[1] ? e.mehrfach[0] : 3;
    if (e.ohko) s = aktiv(k, gegenueber(seite)).zh;
    return s;
  }

  function schaden(k, seite, id, zufall, voll) {
    var a = ATTACKEN[id], e = a.e;
    if (a.kategorie === "status") return 0;
    var an = aktiv(k, seite), ziel = aktiv(k, gegenueber(seite));
    var s = k.seiten[seite], z = k.seiten[gegenueber(seite)];
    var typ = typFaktor(a.typ, ziel.art);
    if (typ === 0) return 0;
    if (e.fest) return e.fest;
    if (e.festLevel) return an.stufe;
    var wa = werte(an), wz = werte(ziel), physisch = a.kategorie === "physisch";
    var A = (physisch ? wa.angriff : wa.spAngriff) * stufenMult(stufe(s, physisch ? "ang" : "spAng"));
    var V = (physisch ? wz.verteidigung : wz.spVerteidigung) * stufenMult(stufe(z, physisch ? "vert" : "spVert"));
    if (physisch && s.status.haupt === "verbrannt") A /= 2;           // Gen 2: Verbrennung halbiert Angriff
    var art = ARTEN[an.art];
    var stamm = a.typ === art.typ1 || a.typ === art.typ2 ? REGEL.stamm : 1;
    var wetter = k.wetter && k.wetter.art === "sauerstoff" && a.typ === "feuer" ? 1.5 : 1;
    var wand = z.status.wand && z.status.wand[a.kategorie] ? 0.5 : 1;
    var betrag = formel(an.stufe, a.staerke, A, V, [stamm, typ, wetter, wand], zufall, voll);
    return Math.max(1, betrag);
  }

  function wirkungsText(f) {
    return f === 0 ? "Es hat keine Wirkung …" : f >= 2 ? "Das ist sehr effektiv!" : f <= 0.5 ? "Das ist nicht sehr effektiv." : "";
  }

  // Ein Statusproblem setzen – nur, wenn noch keins da ist. Wer vom Typ
  // Feuer ist, verbrennt nicht; Frost friert nicht ein.
  function setzeStatus(k, seite, st) {
    var s = k.seiten[seite], el = aktiv(k, seite), a = ARTEN[el.art];
    if (el.zh <= 0) return;
    if (st === "verstrahlt") {
      if (s.status.verstrahlt) return;
      s.status.verstrahlt = 2 + Math.floor(k.zufall() * 4);
      melde(k, { text: name(k, seite) + " ist verstrahlt und verwirrt!" });
      return;
    }
    if (s.status.haupt) return;
    if (st === "verbrannt" && (a.typ1 === "feuer" || a.typ2 === "feuer")) return;
    if (st === "gefroren" && (a.typ1 === "frost" || a.typ2 === "frost")) return;
    s.status.haupt = st;
    if (st === "inert") s.status.schlaf = 1 + Math.floor(k.zufall() * 3);
    if (st === "schwer_korrodiert") s.status.korrZaehler = 1;
    melde(k, { text: name(k, seite) + {
      verbrannt: " ist verbrannt!", gefroren: " ist eingefroren!", geladen: " ist geladen und kann sich kaum rühren!",
      korrodiert: " ist korrodiert!", schwer_korrodiert: " ist schwer korrodiert!", inert: " wird inert und rührt sich nicht."
    }[st] });
  }

  // Statuswert-Stufen ändern; „Stickstoffnebel“ schützt vor Senkungen.
  function aendereStufen(k, seite, aenderung) {
    var s = k.seiten[seite];
    s.status.stufen = s.status.stufen || {};
    Object.keys(aenderung).forEach(function (w) {
      var n = aenderung[w];
      if (n < 0 && s.status.nebel) { melde(k, { text: "Der Nebel schützt " + name(k, seite).replace(/^Das /, "das ") + "." }); return; }
      var alt = s.status.stufen[w] || 0, neuWert = Math.max(-6, Math.min(6, alt + n));
      if (neuWert === alt) { melde(k, { text: WERT_NAME[w] + " von " + name(k, seite).replace(/^Das /, "dem ").replace(/^dem unbekannte /, "dem unbekannten ") + " geht nicht weiter " + (n > 0 ? "hoch." : "runter.") }); return; }
      s.status.stufen[w] = neuWert;
      melde(k, { text: WERT_NAME[w] + " von " + name(k, seite).replace(/^Das unbekannte /, "dem unbekannten ") + (n > 0 ? " steigt" : " sinkt") + (Math.abs(n) > 1 ? " stark." : ".") });
    });
  }

  // Kann das Elemental in diesem Zug überhaupt handeln? Liefert false
  // (und meldet, warum), wenn nicht.
  function kannHandeln(k, seite) {
    var s = k.seiten[seite], el = aktiv(k, seite), wer = name(k, seite);
    if (s.status.aussetzen) { delete s.status.aussetzen; melde(k, { seite: seite, handelt: true, text: wer + " muss sich erholen." }); return false; }
    if (s.status.haupt === "gefroren") {
      if (k.zufall() < AUFTAUEN) { delete s.status.haupt; melde(k, { text: wer + " taut auf!" }); }
      else { melde(k, { seite: seite, handelt: true, text: wer + " ist eingefroren." }); return false; }
    }
    if (s.status.haupt === "inert") {
      if (--s.status.schlaf <= 0) { delete s.status.haupt; delete s.status.schlaf; melde(k, { text: wer + " wird wieder aktiv." }); }
      else { melde(k, { seite: seite, handelt: true, text: wer + " ist inert und rührt sich nicht." }); return false; }
    }
    if (s.status.schreck) { melde(k, { seite: seite, handelt: true, text: wer + " schreckt zurück!" }); return false; }
    if (s.status.haupt === "geladen" && k.zufall() < GELADEN_AUSSETZEN) { melde(k, { seite: seite, handelt: true, text: wer + " ist geladen und kann sich nicht rühren!" }); return false; }
    if (s.status.verstrahlt) {
      if (--s.status.verstrahlt <= 0) { delete s.status.verstrahlt; melde(k, { text: wer + " ist nicht mehr verstrahlt." }); }
      else if (k.zufall() < VERSTRAHLT_SELBST) {
        // Gen 2: Verwirrung trifft sich selbst mit Stärke 40, ohne Typ
        var w = werte(el), betrag = Math.max(1, formel(el.stufe, 40, w.angriff, w.verteidigung, [], 217 + Math.floor(k.zufall() * 39)));
        el.zh = Math.max(0, el.zh - betrag);
        melde(k, { seite: seite, handelt: true, schaden: betrag, text: wer + " ist verstrahlt und trifft sich selbst (−" + betrag + " LP)." });
        return false;
      }
    }
    return true;
  }

  function fuehreAus(k, seite, id) {
    var a = ATTACKEN[id], e = a.e;
    var s = k.seiten[seite], ander = gegenueber(seite), z = k.seiten[ander];
    var wer = name(k, seite), an = aktiv(k, seite);

    if (!kannHandeln(k, seite)) { delete s.status.laedt; delete s.status.weg; return; }

    var zweiteRunde = s.status.laedt && s.status.laedt.id === id;
    var grund = hindernis(k, seite, id);
    if (grund) { melde(k, { seite: seite, handelt: true, text: wer + " versucht " + a.name + ". " + grund }); return; }
    if (!zweiteRunde) s.ae -= a.ae;

    // Zweirundige Attacken: erst laden oder verschwinden, dann zuschlagen.
    if (e.zweirundig && !zweiteRunde) {
      s.status.laedt = { id: id };
      if (e.zweirundig === "weg") s.status.weg = true;
      melde(k, { seite: seite, reaktion: id, text: wer + ": " + a.name + "! " + (e.zweirundig === "weg" ? "Es ist nicht mehr zu sehen." : "Es lädt auf.") });
      if (e.selbst) aendereStufen(k, seite, e.selbst);
      return;
    }
    delete s.status.laedt; delete s.status.weg;

    melde(k, { seite: seite, reaktion: id, text: wer + ": " + a.name + "!" });

    if (a.kategorie === "status") { statusAttacke(k, seite, id); return; }

    // Konter (Federstahl): doppelt zurück, was in dieser Runde ankam
    if (e.konter) {
      var erlitten = s.status.erlitten;
      if (!erlitten || erlitten.kategorie !== e.konter) { melde(k, { seite: seite, verfehlt: true, text: "Es schlägt fehl!" }); return; }
      triff(k, seite, erlitten.betrag * 2, a);
      return;
    }

    var trefferAnzahl = 1;
    if (e.mehrfach) {
      var r = k.zufall();
      trefferAnzahl = e.mehrfach[0] === e.mehrfach[1] ? e.mehrfach[0] : r < 0.375 ? 2 : r < 0.75 ? 3 : r < 0.875 ? 4 : 5;
    }
    if (k.zufall() >= trefferChance(k, seite, id)) {
      delete s.status.zielen;
      melde(k, { seite: seite, verfehlt: true, text: wer + " verfehlt!" });
      return;
    }
    delete s.status.zielen;
    var f = typFaktor(a.typ, aktiv(k, ander).art);
    if (f === 0) { melde(k, { text: wirkungsText(0) }); return; }
    if (e.ohko) {
      if (aktiv(k, ander).stufe > an.stufe) { melde(k, { text: "Es schlägt fehl!" }); return; }
      melde(k, { text: "Ein Treffer mit einem Schlag!" });
      triff(k, seite, aktiv(k, ander).zh, a);
      return;
    }
    var gesamt = 0, n;
    for (n = 0; n < trefferAnzahl && aktiv(k, ander).zh > 0; n++) {
      var voll = !e.fest && !e.festLevel && k.zufall() < (e.volltreffer ? VOLLTREFFER_HOCH : VOLLTREFFER);
      var betrag = schaden(k, seite, id, 217 + Math.floor(k.zufall() * 39), voll);
      if (voll) melde(k, { volltreffer: true, text: "Volltreffer!" });
      gesamt += triff(k, seite, betrag, a);
    }
    if (trefferAnzahl > 1) melde(k, { text: n + " Treffer!" });
    if (wirkungsText(f) && !e.fest && !e.festLevel) melde(k, { text: wirkungsText(f) });

    // Folgen für den Angreifer
    if (e.rueckstoss && gesamt > 0) {
      var rs = Math.max(1, Math.floor(gesamt * e.rueckstoss));
      an.zh = Math.max(0, an.zh - rs);
      melde(k, { seite: seite, schaden: rs, text: wer + " erleidet Rückstoß (−" + rs + " LP)." });
    }
    if (e.selbstKO) { an.zh = 0; melde(k, { seite: seite, schaden: 0, text: wer + " ist danach erschöpft." }); }
    if (e.aussetzen) s.status.aussetzen = true;

    // Nebenwirkungen beim Ziel
    if (aktiv(k, ander).zh <= 0) return;
    var trifft = function () { return !e.chance || e.chance >= 100 || k.zufall() * 100 < e.chance; };
    if (e.status && trifft()) setzeStatus(k, ander, e.status);
    if (e.schreck && k.zufall() * 100 < e.schreck && !k.hatGehandelt[ander]) z.status.schreck = true;
    if (e.gegner && trifft()) aendereStufen(k, ander, e.gegner);
    if (e.selbst && trifft()) aendereStufen(k, seite, e.selbst);
    if (e.festhalten && !z.status.festgehalten) {
      z.status.festgehalten = 2 + Math.floor(k.zufall() * 4);
      melde(k, { text: name(k, ander) + " wird festgehalten." });
    }
  }

  // Schaden anrichten (mit Schutz und Ausdauer) – liefert den Betrag.
  function triff(k, seite, betrag, a) {
    var ander = gegenueber(seite), z = k.seiten[ander], ziel = aktiv(k, ander);
    if (z.status.schutzRunde) { melde(k, { text: name(k, ander) + " ist geschützt." }); return 0; }
    if (z.status.ausdauer && betrag >= ziel.zh) { betrag = ziel.zh - 1; melde(k, { text: name(k, ander) + " hält durch!" }); }
    ziel.zh = Math.max(0, ziel.zh - betrag);
    z.status.erlitten = { betrag: betrag, kategorie: a.kategorie };
    melde(k, { seite: ander, schaden: betrag, text: name(k, ander) + " verliert " + betrag + " LP." });
    return betrag;
  }

  // Status-Attacken: wirken auf sich selbst, auf den Gegner oder auf den Kampf.
  function statusAttacke(k, seite, id) {
    var a = ATTACKEN[id], e = a.e, s = k.seiten[seite], ander = gegenueber(seite), an = aktiv(k, seite);
    var aufGegner = e.gegner || e.status;
    if (aufGegner && k.zufall() >= trefferChance(k, seite, id)) { melde(k, { seite: seite, verfehlt: true, text: "Es schlägt fehl!" }); return; }
    if (e.selbst) aendereStufen(k, seite, e.selbst);
    if (e.gegner) aendereStufen(k, ander, e.gegner);
    if (e.status) setzeStatus(k, ander, e.status);
    if (e.neutral) {
      SEITEN.forEach(function (sd) { delete k.seiten[sd].status.stufen; });
      melde(k, { text: "Alle Statuswerte sind wieder normal." });
    }
    if (e.kampfwetter) {
      k.wetter = { art: e.kampfwetter, runden: KAMPFWETTER_RUNDEN };
      melde(k, { text: e.kampfwetter === "sauerstoff" ? "Viel Sauerstoff! Feuer-Attacken sind 5 Runden stärker." : "Kalkstaub weht über den Kampfplatz." });
    }
    if (e.wand) {
      s.status.wand = s.status.wand || {};
      s.status.wand[e.wand] = WAND_RUNDEN;
      melde(k, { text: (e.wand === "physisch" ? "Physischer" : "Spezieller") + " Schaden wird 5 Runden halbiert." });
    }
    if (e.zielen) { s.status.zielen = true; melde(k, { text: name(k, seite) + " zielt genau." }); }
    if (e.nebel) { s.status.nebel = e.nebel; melde(k, { text: "Nebel schützt vor Statuswert-Senkung." }); }
    if (e.heilen || e.erholung) {
      var max = werte(an).zhMax, plus = Math.min(max - an.zh, e.erholung ? max : Math.round(max * e.heilen));
      an.zh += plus;
      melde(k, { seite: seite, text: name(k, seite) + " erholt sich (+" + plus + " LP)." });
      if (e.erholung) { s.status.haupt = "inert"; s.status.schlaf = 3; melde(k, { text: name(k, seite) + " ruht sich aus und wird inert." }); }
    }
    if (e.schutzRunde) {
      if (k.hatGehandelt[ander]) melde(k, { text: "Es schlägt fehl!" });
      else { s.status.schutzRunde = true; melde(k, { text: name(k, seite) + " schützt sich." }); }
    }
    if (e.ausdauer) { s.status.ausdauer = true; melde(k, { text: name(k, seite) + " macht sich bereit." }); }
    if (e.heilStatus) { delete s.status.haupt; delete s.status.verstrahlt; melde(k, { text: "Alle Statusprobleme sind geheilt." }); }
  }

  // ----------------------------------------------------------
  //  Die KI des Gegners (und im Prüfstand beider Seiten)
  // ----------------------------------------------------------
  // Was ein Zug in LP wert ist: Schaden × Trefferchance, dazu grob
  // geschätzt, was Status und Stufen bringen. drohung = was der Gegner
  // im nächsten Zug anrichten könnte.
  function zugWert(k, seite, id, drohung) {
    var a = ATTACKEN[id], e = a.e, s = k.seiten[seite], ander = gegenueber(seite), z = k.seiten[ander];
    var ziel = aktiv(k, ander), lp = werte(ziel).zhMax, eigen = aktiv(k, seite);
    var p = trefferChance(k, seite, id) || (z.status.weg ? 0 : 1);
    var w = 0;
    if (a.kategorie !== "status") {
      w = Math.min(ziel.zh, schaetzeSchaden(k, seite, id)) * p;
      if (e.zweirundig && !(s.status.laedt && s.status.laedt.id === id)) w *= 0.5;
      if (e.rueckstoss) w -= w * e.rueckstoss * 0.5;
      if (e.selbstKO) w -= eigen.zh;
      if (e.aussetzen) w *= 0.6;
    }
    var chance = e.chance ? e.chance / 100 : 1;
    if (e.status && !z.status.haupt && !(e.status === "verstrahlt" && z.status.verstrahlt)) {
      var dauer = { verbrannt: 3 * VERBRANNT_ANTEIL, korrodiert: 3 * KORRODIERT_ANTEIL, schwer_korrodiert: 0.6 }[e.status];
      w += (dauer ? lp * dauer : drohung * 0.6) * chance * p;
    }
    if (e.gegner && !z.status.nebel) Object.keys(e.gegner).forEach(function (wt) {
      if (stufe(z, wt) > -4) w += drohung * 0.12 * Math.abs(e.gegner[wt]) * chance * p;
    });
    if (e.selbst) Object.keys(e.selbst).forEach(function (wt) {
      if (stufe(s, wt) < 4) w += drohung * 0.12 * e.selbst[wt] * chance;
    });
    if (e.schreck && !k.hatGehandelt[ander]) w += drohung * e.schreck / 100 * 0.5;
    if (e.festhalten && !z.status.festgehalten) w += lp * FESTHALTEN_ANTEIL * 3;
    if (e.neutral) w += drohung * 0.12 * (Math.max(0, stufe(z, "ang") + stufe(z, "spAng")) - Math.min(0, stufe(s, "vert") + stufe(s, "spVert")));
    if (e.kampfwetter && !(k.wetter && k.wetter.art === e.kampfwetter)) {
      var feuer = angriffe(eigen).some(function (x) { return ATTACKEN[x].typ === "feuer" && ATTACKEN[x].kategorie !== "status"; });
      w += e.kampfwetter === "sauerstoff" ? (feuer ? drohung * 0.6 : 0) : (STAUBFEST.indexOf(ARTEN[ziel.art].typ1) < 0 ? lp * STAUB_ANTEIL * 3 : 0);
    }
    if (e.wand && !(s.status.wand && s.status.wand[e.wand])) w += drohung * 0.5;
    if (e.zielen && !s.status.zielen) w += drohung * 0.2;
    if (e.heilen || e.erholung) w += Math.min(werte(eigen).zhMax - eigen.zh, werte(eigen).zhMax * (e.heilen || 1)) * 0.8;
    // Wer kurz vor dem Ende steht, hat von langfristigen Zügen nichts.
    if (a.kategorie === "status" && eigen.zh < drohung) w *= 0.3;
    return w;
  }

  function kiWahl(k, seite) {
    var el = aktiv(k, seite), s = k.seiten[seite];
    // Eine geladene Attacke wird zu Ende geführt.
    if (s.status.laedt) return { typ: "reaktion", id: s.status.laedt.id };
    var bestes = { typ: "sammeln" }, wert = 0.5;
    var ander = gegenueber(seite), drohung = 0;
    angriffe(aktiv(k, ander)).forEach(function (id) {
      if (!hindernis(k, ander, id)) drohung = Math.max(drohung, schaetzeSchaden(k, ander, id) * (ATTACKEN[id].genau || 100) / 100);
    });
    angriffe(el).forEach(function (id) {
      if (hindernis(k, seite, id)) return;
      var w = zugWert(k, seite, id, drohung);
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
  //   { typ: "fangen", geraet } | { typ: "kuehlen" } | { typ: "wechseln", nr } | { typ: "fliehen" }
  // gegnerAktion: optional (Prüfstand); sonst wählt die KI.
  // Handelt der Gegner vor dem Spieler? „Greift immer zuerst an“ vor
  // allem, sonst die höhere Initiative, bei Gleichstand der Zufall.
  function gegnerZuerst(k, idSp, idGeg) {
    var pSp = idSp && ATTACKEN[idSp].e.zuerst ? 1 : 0, pGeg = idGeg && ATTACKEN[idGeg].e.zuerst ? 1 : 0;
    if (pSp !== pGeg) return pGeg > pSp;
    var ts = initiative(k, "spieler"), tg = initiative(k, "gegner");
    return tg > ts || (tg === ts && k.zufall() < 0.5);
  }

  function rundeStart(k) {
    k.hatGehandelt = { spieler: false, gegner: false };
  }

  // Für die Kampfszene (seit 25.10.2026): Ist der Gegner schneller,
  // handelt er JETZT – bevor der Spieler wählt. So wählt man immer erst,
  // wenn das eigene Elemental an der Reihe ist.
  // Der Prüfstand ruft nur zug() und spielt damit wie bisher.
  function rundeBeginnen(k) {
    k.log = [];
    if (k.ende) return k.log;
    rundeStart(k);
    var g = kiWahl(k, "gegner");
    var zuerst = gegnerZuerst(k, null, g.typ === "reaktion" ? g.id : null);
    k.reihenfolge = zuerst ? "gegner" : "spieler";
    if (zuerst && (g.typ === "reaktion" || g.typ === "sammeln")) {
      if (g.typ === "reaktion") { fuehreAus(k, "gegner", g.id); k.hatGehandelt.gegner = true; pruefeErschoepfung(k); }
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

  // Wechseln (Spieler) setzt alles zurück, was am Elemental hing.
  function wechsle(k, seite, nr) {
    var s = k.seiten[seite];
    s.aktiv = nr;
    s.status = {};
  }

  function zug(k, aktion, gegnerAktion) {
    if (k.ende) throw new Error("Der Kampf ist schon vorbei.");
    k.log = [];
    var gegnerFertig = !!k.gegnerHatGehandelt, fest = k.reihenfolge;
    if (!k.hatGehandelt) rundeStart(k);
    var g = gegnerAktion || k.geplant || kiWahl(k, "gegner");
    k.geplant = null; k.gegnerHatGehandelt = false; k.reihenfolge = null;
    var sp = k.seiten.spieler;

    // Eine geladene Attacke läuft weiter, was auch gewählt wurde.
    if (sp.status.laedt && aktion.typ !== "reaktion") aktion = { typ: "reaktion", id: sp.status.laedt.id };

    // Alles, was keine Attacke ist, geschieht zuerst.
    switch (aktion.typ) {
      case "untersuchen": untersuchen(k, aktion.werkzeug); break;
      case "bestimmen": bestimmen(k, aktion.art); break;
      case "fangen":
        FANGEN.versuch(k, aktion.geraet);
        if (k.ende === "gefangen") verteileErfahrung(k, 0.5);
        break;
      case "kuehlen": FANGEN.kuehlen(k); break;
      case "wechseln":
        if (!sp.gruppe[aktion.nr] || sp.gruppe[aktion.nr].zh <= 0) throw new Error("Wechsel nicht möglich.");
        if (sp.status.festgehalten) { melde(k, { text: name(k, "spieler") + " wird festgehalten und kann nicht weg." }); break; }
        wechsle(k, "spieler", aktion.nr);
        melde(k, { seite: "spieler", ruft: true, text: "Du rufst " + name(k, "spieler") + "." });
        break;
      case "fliehen": fliehen(k); break;
      case "sammeln": sp.ae = Math.min(AE_MAX, sp.ae + 2); melde(k, { seite: "spieler", handelt: true, text: name(k, "spieler") + " sammelt Kraft." }); break;
      case "brenner":
        // Der Bunsenbrenner: einmal je Kampf Aktivierungsenergie von außen.
        if (k.werkzeuge.indexOf("gasbrenner") < 0) throw new Error("Kein Gasbrenner im Gepäck.");
        if (k.brennerBenutzt) { melde(k, { text: "Das Gas im Brenner ist für diesen Kampf verbraucht." }); break; }
        k.brennerBenutzt = true;
        sp.ae = Math.min(AE_MAX, sp.ae + 4);
        melde(k, { text: "Du entzündest den Bunsenbrenner – rauschende Flamme. Die Hitze liefert Aktivierungsenergie." });
        break;
      case "reaktion": break;
      default: throw new Error("Unbekannte Aktion: " + aktion.typ);
    }
    if (k.ende) return k.log;

    // Attacken: Priorität, dann Initiative.
    // Jede Attacke gehört dem Elemental, das sie gewählt hat. Wird es
    // erschöpft und ein anderes springt ein, handelt der Neue in dieser
    // Runde nicht mehr.
    var reihenfolge = [];
    if (aktion.typ === "reaktion") reihenfolge.push({ seite: "spieler", id: aktion.id, wer: aktiv(k, "spieler") });
    if (!gegnerFertig) {
      if (g.typ === "reaktion") reihenfolge.push({ seite: "gegner", id: g.id, wer: aktiv(k, "gegner") });
      else if (g.typ === "sammeln") gegnerSammelt(k);
    }
    if (reihenfolge.length === 2 && (fest ? fest === "gegner" : gegnerZuerst(k, aktion.id, g.id))) reihenfolge.reverse();
    // Wer nicht angreift, hat für Schreck und Schutz schon „gehandelt“.
    if (aktion.typ !== "reaktion") k.hatGehandelt.spieler = true;
    for (var i = 0; i < reihenfolge.length; i++) {
      var z = reihenfolge[i];
      if (aktiv(k, z.seite) !== z.wer || z.wer.zh <= 0) continue;     // erschöpft oder ausgewechselt
      fuehreAus(k, z.seite, z.id);
      k.hatGehandelt[z.seite] = true;
      if (pruefeErschoepfung(k)) return k.log;
    }

    rundenende(k);
    pruefeErschoepfung(k);
    return k.log;
  }

  function dauerschaden(k, seite, anteil, text) {
    var el = aktiv(k, seite);
    if (!el || el.zh <= 0) return;
    var betrag = Math.max(1, Math.floor(werte(el).zhMax * anteil));
    el.zh = Math.max(0, el.zh - betrag);
    melde(k, { seite: seite, schaden: betrag, text: name(k, seite) + " " + text + " (−" + betrag + " LP)." });
  }

  function rundenende(k) {
    SEITEN.forEach(function (seite) {
      var s = k.seiten[seite], st = s.status, el = aktiv(k, seite);
      if (!el) return;
      if (st.haupt === "verbrannt") dauerschaden(k, seite, VERBRANNT_ANTEIL, "leidet unter der Verbrennung");
      if (st.haupt === "korrodiert") dauerschaden(k, seite, KORRODIERT_ANTEIL, "korrodiert weiter");
      if (st.haupt === "schwer_korrodiert") { dauerschaden(k, seite, Math.min(15, st.korrZaehler) / 16, "korrodiert immer schneller"); st.korrZaehler++; }
      if (st.festgehalten) {
        dauerschaden(k, seite, FESTHALTEN_ANTEIL, "wird festgehalten");
        if (--st.festgehalten <= 0) { delete st.festgehalten; melde(k, { text: name(k, seite) + " ist wieder frei." }); }
      }
      if (k.wetter && k.wetter.art === "staub") {
        var a = ARTEN[el.art];
        if (STAUBFEST.indexOf(a.typ1) < 0 && STAUBFEST.indexOf(a.typ2) < 0) dauerschaden(k, seite, STAUB_ANTEIL, "leidet unter dem Kalkstaub");
      }
      if (st.wand) Object.keys(st.wand).forEach(function (kat) { if (--st.wand[kat] <= 0) delete st.wand[kat]; });
      if (st.nebel && --st.nebel <= 0) delete st.nebel;
      delete st.schreck; delete st.schutzRunde; delete st.ausdauer; delete st.erlitten;
      s.ae = Math.min(AE_MAX, s.ae + AE_JE_RUNDE);
    });
    if (k.wetter && --k.wetter.runden <= 0) {
      melde(k, { text: k.wetter.art === "sauerstoff" ? "Der Sauerstoff ist verbraucht." : "Der Kalkstaub legt sich." });
      k.wetter = null;
    }
    k.runde++;
    k.hatGehandelt = null;
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
        if (naechster >= 0) { wechsle(k, "gegner", naechster); melde(k, { seite: "gegner", ruft: true, text: "Der Gegner ruft " + name(k, "gegner") + "." }); return false; }
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
      wechsle(k, "spieler", n);
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
    if (k.seiten.spieler.status.festgehalten) { melde(k, { text: "Festgehalten – kein Entkommen." }); return; }
    var ts = initiative(k, "spieler");
    var tg = initiative(k, "gegner");
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
    lernsetBis: lernsetBis,
    kannLernen: kannLernen,
    lernen: lernen,
    ANGRIFFE_MAX: ANGRIFFE_MAX,
    typFaktor: typFaktor,
    stufenMult: stufenMult,
    initiative: initiative,
    STATUS_KURZ: STATUS_KURZ,
    WERT_NAME: WERT_NAME,
    VERBRANNT_ANTEIL: VERBRANNT_ANTEIL,
    KORRODIERT_ANTEIL: KORRODIERT_ANTEIL,
    AE_JE_RUNDE: AE_JE_RUNDE,
    befundText: function (eig, wert) { return BEFUND_TEXT[eig](wert); },
    STARTER_BONUS: STARTER_BONUS,
    GRUPPE_LERNT: GRUPPE_LERNT,
    basiswerte: basiswerte,
    formel: formel,
    trefferChance: trefferChance,
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
