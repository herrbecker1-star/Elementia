// ============================================================
//  ELEMENTALS – Stoffdaten, Steckbriefe, Reaktionen (Kapitel 1)
//
//  Eigene Daten des Rollenspiels, NICHT aus Karten\karten-daten.js:
//  Das Kartenspiel rechnet mit festen Lebenspunkten, hier entstehen
//  die Werte aus echten Stoffeigenschaften (siehe kern\kampf.js,
//  Funktion grundwerte). Wer eine Zahl ändern will, ändert den
//  Stoffwert – und der muss dann im Lehrbuch stimmen.
//
//  gruppe         Hauptgruppe oder Stoffklasse (GRUPPEN unten)
//                 → Angriff, Verteidigung, Sp.-Angriff, Sp.-Verteidigung
//  klasse         Stoffklasse für die Typtabelle (daten\typen.js)
//  stoff.haerte   Mohshärte                        → Verteidigung ±
//  stoff.dichte   g/cm³                            → Tempo (leicht = schnell)
//  stoff.schmelz  Schmelz-/Sublimationstemp. in °C → LP
//  ausnahmen      Abweichung von der Typtabelle, mit Begründung
//  steckbrief     was man mit Lupe, Magnet, Stromkreis und Hammer
//                 herausfindet (Quest 1, Maras Stoffkisten)
//  form           "stueck" | "pulver"
//  reaktionen     die Stammangriffe der Art: Sie wirken ×1,5 (KAMPF.REGEL.stamm).
//  lernset        (seit Fassung 18) Stufe → Angriffe, die die Art dort lernt.
//                 Freigegeben vom Nutzer am 29.10.2026 (drehbuch\Lernsets
//                 Kapitel 1.html, Quelle werkzeug\lernsets-entwurf.ps1).
//                 Stufen 1·4·8·…·40·45·50; ein neues Elemental kann die
//                 letzten 4 Angriffe bis zu seiner Stufe (KAMPF.neuesElemental).
//  fangbarAb      (seit Fassung 17) Region, ab der die Art wild vorkommt.
//                 Bis dahin sieht man sie nur bei Stoffmeistern und Bossen.
//  heftig         (seit Fassung 17) Satz, warum der Stoff heftig reagiert:
//                 Entwischt er, zerspringen Reagenzglas und Erlenmeyerkolben
//                 (kern\fangen.js). In Kapitel 1 trägt das noch keine Art –
//                 Natrium und Kalium in Periodika werden die ersten.
//
//  Quellen: Tafelwerk / Blickpunkt Chemie 7/8, S. 16–17.
// ============================================================

var ARTEN = {

  eisen: {
    name: "Eisen", formel: "Fe", klasse: "Metall", gruppe: "nebengruppe", bild: "eisen", seltenheit: "haeufig",
    beschreibung: "Graues, hartes Metall. Der Magnet hält es fest. An feuchter Luft rostet es. Aus Eisen schmiedet man Werkzeuge.",
    stoff: { haerte: 4, dichte: 7.87, schmelz: 1538 },
    steckbrief: { farbe: "grau", glanz: true, magnetisch: true, leitfaehig: true, verformbar: true, brennt: false },
    form: "stueck",
    reaktionen: ["blankhieb", "funkenflug", "standfest", "hieb"],
    lernset: { 1: ["leichtschlag", "hieb", "standfest"], 4: ["funkenflug"], 8: ["blankhieb"], 12: ["korrosion"], 16: ["anlaufen"],
      20: ["haerten"], 24: ["zuendfunke"], 28: ["wuchtstoss"], 32: ["waermeleitung"], 36: ["ansturm"], 40: ["flaechenbrand"],
      45: ["weissglut"], 50: ["schmiedehammer"] }
  },

  magnesium: {
    name: "Magnesium", formel: "Mg", klasse: "Metall", gruppe: "hg2", bild: "magnesium", seltenheit: "haeufig",
    beschreibung: "Leichtes, silbriges Metall. Es verbrennt mit gleißend hellem Licht. In jeder grünen Pflanze steckt etwas Magnesium.",
    stoff: { haerte: 2.5, dichte: 1.74, schmelz: 650 },
    steckbrief: { farbe: "silbrig", glanz: true, magnetisch: false, leitfaehig: true, verformbar: true, brennt: true },
    form: "stueck",
    reaktionen: ["hammerschlag", "aufflammen", "standfest", "kratzen"],
    lernset: { 1: ["leichtschlag", "kratzen", "standfest"], 4: ["aufflammen"], 8: ["hammerschlag"], 12: ["blitzlicht"], 16: ["anlaufen"],
      20: ["funkenflug"], 24: ["zuendfunke"], 28: ["hieb"], 32: ["flaechenbrand"], 36: ["ansturm"], 40: ["magnesiumfackel"],
      45: ["weissglut"], 50: ["feuersturm"] }
  },

  kohlenstoff: {
    // Holzkohle aus dem Meiler. Leitet den Strom – als einziges
    // Nichtmetall in Maras Kisten. Genau diese Ausnahme macht den
    // Steckbrief lehrreich: Leitfähigkeit allein heißt nicht Metall.
    name: "Kohlenstoff", formel: "C", klasse: "Nichtmetall", gruppe: "hg4", bild: "kohlenstoff", seltenheit: "haeufig", brennbar: true,
    ausnahmen: { waerme: { faktor: 2, wort: "Grafit leitet", merksatz: 7 } },
    beschreibung: "Schwarze, leichte Holzkohle. Leitet den Strom und ist trotzdem kein Metall. Verbrennt zu Kohlenstoffdioxid.",
    stoff: { haerte: 1.5, dichte: 2.26, schmelz: 3640 },   // Grafit, sublimiert
    steckbrief: { farbe: "schwarz", glanz: false, magnetisch: false, leitfaehig: true, verformbar: false, brennt: true },
    form: "stueck",
    reaktionen: ["glut", "russwolke", "kohlenstaub", "kratzen"],
    lernset: { 1: ["leichtschlag", "kratzen", "russwolke"], 4: ["glut"], 8: ["hieb"], 12: ["aktivkohle"], 16: ["waermeleitung"],
      20: ["kohlenstaub"], 24: ["schleichendes_gas"], 28: ["hammerschlag"], 32: ["diamantgitter"], 36: ["flaechenbrand"], 40: ["ansturm"],
      45: ["weissglut"], 50: ["feuersturm"] }
  },

  kupfer: {
    // Seit Fassung 17: in den Feuerlanden nur bei Gildenmeisterin Ilka,
    // fangbar erst in den Clans der Erzhügel (Elementals je Region).
    name: "Kupfer", formel: "Cu", klasse: "Metall", gruppe: "nebengruppe", bild: "kupfer", seltenheit: "selten", fangbarAb: "Clans der Erzhügel",
    beschreibung: "Rötliches, weiches Metall. Leitet Strom und Wärme besser als fast alle Stoffe – darum sind Kabel aus Kupfer.",
    stoff: { haerte: 3, dichte: 8.96, schmelz: 1085 },
    steckbrief: { farbe: "rötlich", glanz: true, magnetisch: false, leitfaehig: true, verformbar: true, brennt: false },
    form: "stueck",
    reaktionen: ["blankhieb", "waermeleitung", "anlaufen", "beissen"],
    lernset: { 1: ["leichtschlag", "beissen", "standfest"], 4: ["waermeleitung"], 8: ["blankhieb"], 12: ["anlaufen"], 16: ["wetterhaut"],
      20: ["kurzschluss"], 24: ["funkenflug"], 28: ["schwermetall"], 32: ["wuchtstoss"], 36: ["ansturm"], 40: ["weissglut"],
      45: ["lichtbogen"], 50: ["schmiedehammer"] }
  },

  zink: {
    // Bei Raumtemperatur spröde; gut verformbar erst zwischen 100 und
    // 150 °C. Darum hier "verformbar: false" – und gegen Schlag die
    // Ausnahme ×1 statt ×½, solange das Feld kälter als Wärme 50 ist.
    // Seit Fassung 12 Wärmeleitung statt „Sulfid bilden“ (Zink leitet gut).
    // Mit Funkenflug gewann Zink 83 % (doppelt mit Eisen und schneller),
    // ohne speziellen Angriff 23 % (gegen Metalle wirkt Schlag nur halb).
    name: "Zink", formel: "Zn", klasse: "Metall", gruppe: "nebengruppe", bild: "zink", seltenheit: "haeufig",
    ausnahmen: { schlag: { faktor: 1, wort: "kalt spröde", merksatz: 1, bisWaerme: 50 } },
    beschreibung: "Bläulich-graues Metall. Kalt spröde, warm formbar. Als dünne Schicht schützt es Eisen vor Rost (verzinken).",
    stoff: { haerte: 2.5, dichte: 7.14, schmelz: 420 },
    steckbrief: { farbe: "bläulich-grau", glanz: true, magnetisch: false, leitfaehig: true, verformbar: false, brennt: false },
    warmVerformbar: true,
    form: "stueck",
    reaktionen: ["wuchtstoss", "waermeleitung", "zinkschild", "hieb"],
    lernset: { 1: ["leichtschlag", "hieb", "zinkschild", "wuchtstoss"], 4: ["waermeleitung"], 8: ["blankhieb"], 12: ["zinkstaub"], 16: ["anlaufen"],
      20: ["funkenflug"], 24: ["zinkfieber"], 28: ["ansturm"], 32: ["feuerverzinken"], 36: ["zuendfunke"], 40: ["flaechenbrand"],
      45: ["weissglut"], 50: ["schmiedehammer"] }
  },

  schwefel: {
    name: "Schwefel", formel: "S", klasse: "Nichtmetall", gruppe: "hg6", bild: "schwefel", seltenheit: "selten", brennbar: true,
    beschreibung: "Gelbes Pulver, leitet keinen Strom. Schmilzt schon bei 115 °C und brennt mit blauer Flamme zu stechendem Schwefeldioxid.",
    stoff: { haerte: 2, dichte: 2.07, schmelz: 115 },
    steckbrief: { farbe: "gelb", glanz: false, magnetisch: false, leitfaehig: false, verformbar: false, brennt: true },
    form: "pulver",
    reaktionen: ["blaue_flamme", "sulfurierung", "leichtschlag", "beissen"],
    lernset: { 1: ["leichtschlag", "beissen", "standfest"], 4: ["blaue_flamme"], 8: ["glut"], 12: ["stechender_rauch"], 16: ["sulfurierung"],
      20: ["kohlenstaub"], 24: ["zuendfunke"], 28: ["hammerschlag"], 32: ["giftwolke"], 36: ["flaechenbrand"], 40: ["ansturm"],
      45: ["weissglut"], 50: ["feuersturm"] }
  },

  // Seit Fassung 13. Sieht aus wie Magnesium (silbrig, glänzt, leitet,
  // biegsam) – erst die Flammprobe trennt beide: Magnesium brennt grell,
  // Aluminiumblech nicht, weil eine dünne Oxidhaut es schützt. Dieselbe
  // Oxidhaut macht es im Kampf feuerfest (Ausnahme Feuer ×1) – darum ist
  // es der Konter gegen Schwefel: Schlag ×2, und Schwefels Flamme prallt ab.
  aluminium: {
    // Seit Fassung 17 wie Kupfer: Ilkas Elemental, fangbar ab den Erzhügeln.
    name: "Aluminium", formel: "Al", klasse: "Metall", gruppe: "hg3", bild: "aluminium", seltenheit: "selten", fangbarAb: "Clans der Erzhügel",
    ausnahmen: { feuer: { faktor: 1, wort: "Oxidhaut", merksatz: 2 }, reaktion: { faktor: 1, wort: "Oxidhaut", merksatz: 2 } },
    beschreibung: "Leichtes, silberweißes Metall. Eine dünne Oxidhaut schützt es, darum rostet es nicht. Aus Aluminium sind Folie und Dosen.",
    stoff: { haerte: 2.75, dichte: 2.70, schmelz: 660 },
    steckbrief: { farbe: "silberweiß", glanz: true, magnetisch: false, leitfaehig: true, verformbar: true, brennt: false },
    form: "stueck",
    reaktionen: ["hammerschlag", "funkenflug", "anlaufen", "kratzen"],
    lernset: { 1: ["leichtschlag", "kratzen", "standfest"], 4: ["funkenflug"], 8: ["hammerschlag"], 12: ["anlaufen"], 16: ["zinkschild"],
      20: ["zuendfunke"], 24: ["waermeleitung"], 28: ["ansturm"], 32: ["flaechenbrand"], 36: ["eloxieren"], 40: ["schweissglut"],
      45: ["weissglut"], 50: ["feuersturm"] }
  },

  // Seit Fassung 13. Halbmetall, hier bei den Nichtmetallen: glänzt
  // schwarz wie ein Metall, leitet aber nicht und splittert – das
  // Gegenstück zum Kohlenstoff, der nicht glänzt und doch leitet.
  // Fast so hart wie Diamant (Mohs 9,3); die Härte zählt höchstens +20.
  bor: {
    // brennbar seit Fassung 18: Bor brennt mit grüner Flamme (Steckbrief
    // brennt) und darf darum Staubexplosion und die Brand-Angriffe lernen.
    name: "Bor", formel: "B", klasse: "Nichtmetall", gruppe: "hg3", bild: "bor", seltenheit: "selten", brennbar: true,
    beschreibung: "Schwarz glänzende, sehr harte Kristalle. Leitet kaum Strom. Bor färbt Flammen grün; Borsäure kommt aus heißen Quellen.",
    stoff: { haerte: 9.3, dichte: 2.34, schmelz: 2076 },
    steckbrief: { farbe: "schwarz", glanz: true, magnetisch: false, leitfaehig: false, verformbar: false, brennt: true },
    form: "stueck",
    reaktionen: ["leichtschlag", "gruene_flamme", "standfest", "hieb"],
    lernset: { 1: ["leichtschlag", "hieb", "standfest"], 4: ["gruene_flamme"], 8: ["kristallsplitter"], 12: ["hammerschlag"], 16: ["borpanzer"],
      20: ["zuendfunke"], 24: ["kohlenstaub"], 28: ["ansturm"], 32: ["flaechenbrand"], 36: ["hartstoff"], 40: ["weissglut"],
      45: ["feuersturm"], 50: ["splitterregen"] }
  }
};

// Die Starter (Schmiede, Garten). Den nicht gewählten hat Lumi; er ist
// erst bei den Clans der Erzhügel fangbar (AUFTRETEN.fangbarAb, Fassung 18).
var STARTER_ARTEN = ["eisen", "magnesium"];

// ------------------------------------------------------------
//  Grundwerte je Gruppe (seit Fassung 12)
//  Elemente einer Hauptgruppe kämpfen ähnlich; der Stoff gibt den
//  Feinschliff (Härte → Verteidigung, Dichte → Tempo, Schmelzpunkt
//  → LP; siehe KAMPF.grundwerte). Skala wie Basiswerte im Spiel der
//  1. Generation. Faustregel: Die vier Werte ergeben zusammen etwa
//  250–310; wer weniger hat, gleicht über Tempo oder LP aus.
//  Die Gruppen der Elemente aus Kapitel 1 (hg2, hg3, hg4, hg6, nebengruppe)
//  sind gemessen (27.10.2026, siehe LIESMICH.md), die übrigen vorläufig.
// ------------------------------------------------------------
var GRUPPEN = {
  hg1:         { name: "1. Hauptgruppe",  kurz: "Alkalimetall",    angriff: 60, verteidigung: 35,  spAngriff: 110, spVerteidigung: 40 },
  hg2:         { name: "2. Hauptgruppe",  kurz: "Erdalkalimetall", angriff: 80, verteidigung: 55,  spAngriff: 90,  spVerteidigung: 75 },
  hg3:         { name: "3. Hauptgruppe",  kurz: "Borgruppe",       angriff: 65, verteidigung: 60,  spAngriff: 65,  spVerteidigung: 55 },
  hg4:         { name: "4. Hauptgruppe",  kurz: "Kohlenstoffgr.",  angriff: 60, verteidigung: 70,  spAngriff: 70,  spVerteidigung: 60 },
  hg5:         { name: "5. Hauptgruppe",  kurz: "Stickstoffgr.",   angriff: 50, verteidigung: 60,  spAngriff: 100, spVerteidigung: 70 },
  hg6:         { name: "6. Hauptgruppe",  kurz: "Chalkogen",       angriff: 45, verteidigung: 55,  spAngriff: 85,  spVerteidigung: 80 },
  hg7:         { name: "7. Hauptgruppe",  kurz: "Halogen",         angriff: 40, verteidigung: 50,  spAngriff: 110, spVerteidigung: 70 },
  hg8:         { name: "8. Hauptgruppe",  kurz: "Edelgas",         angriff: 30, verteidigung: 110, spAngriff: 50,  spVerteidigung: 110 },
  nebengruppe: { name: "Nebengruppe",     kurz: "Übergangsmetall", angriff: 85, verteidigung: 85,  spAngriff: 65,  spVerteidigung: 75 },
  legierung:   { name: "Legierung",       kurz: "Legierung",       angriff: 95, verteidigung: 100, spAngriff: 45,  spVerteidigung: 60 },
  oxid:        { name: "Oxid",            kurz: "Oxid",            angriff: 60, verteidigung: 100, spAngriff: 50,  spVerteidigung: 80 },
  sulfid:      { name: "Sulfid",          kurz: "Sulfid",          angriff: 65, verteidigung: 80,  spAngriff: 60,  spVerteidigung: 75 },
  salz:        { name: "Salz",            kurz: "Salz",            angriff: 55, verteidigung: 90,  spAngriff: 60,  spVerteidigung: 85 },
  saeure:      { name: "Säure",           kurz: "Säure",           angriff: 40, verteidigung: 50,  spAngriff: 110, spVerteidigung: 70 },
  lauge:       { name: "Lauge",           kurz: "Lauge",           angriff: 40, verteidigung: 55,  spAngriff: 105, spVerteidigung: 70 },
  molekuel:    { name: "Molekülverbindung", kurz: "Molekül",       angriff: 55, verteidigung: 65,  spAngriff: 80,  spVerteidigung: 80 }
};

// ------------------------------------------------------------
//  Reaktionen und Vorgänge
//
//  typ     Zeile der Typtabelle (daten\typen.js): "schlag" (physisch),
//          "feuer", "reaktion", "waerme" (speziell) – oder "schutz":
//          kein Schaden, nur Wirkung auf sich selbst – oder "stoer"
//          (seit Fassung 18): kein Schaden, aber eine sichere Wirkung
//          auf den Gegner (blenden, vergiften).
//          Feuer braucht Sauerstoff im Feld und gibt Wärme ab.
//          Wärme nimmt die Wärme des Feldes: Stärke = Feldwärme +
//          waermeGrund (fehlt = KAMPF.REGEL.waermeGrund, 40).
//  staerke Stärke, Skala bis 100 (seit Fassung 12; vorher kraft = staerke/5)
//  genau   Trefferchance in % (fehlt = 100)
//  ae      Aktivierungsenergie, die der Zug kostet
//  o2      Sauerstoff, den der Zug verbraucht (und mindestens braucht)
//  waerme  Wärme, die ins Feld abgegeben wird (exotherm)
//  wirkung beim Gegner, Chance in % nach einem Treffer:
//            { blendung: 50 }    Trefferchance ×0,7 für 2 Angriffe
//            { vergiftung: 30 }  −10 % der LP je Runde, 3 Runden
//            { brennen: 30 }     −12 % der LP je Runde, 2 Runden (Fassung 18)
//            { abwehrMinus: 2 }  Verteidigung des Gegners −20 % (sicher)
//          bei "stoer" wirken blendung und vergiftung immer (Wert 100).
//          auf sich selbst (immer): schutz, tarnung, abwehrPlus, entgiften
//  braucht { waerme: 30 } / { feuchte: 50 }: Mindestwert im Feld
//  chemie  ein Satz Chemie, erscheint beim Lernen (Fassung 18)
//  fuer    wer den Angriff ausführen und später lernen kann (seit
//          25.10.2026, siehe kannAngriff unten):
//            {}                         alle
//            { klasse: "Metall" }       eine Stoffklasse (später: "Säure" …)
//            { dichteAb: 5 }            dichte Stoffe (g/cm³)
//            { leitet: true }           gute Leiter für Strom und Wärme
//            { brennbar: true }         brennbare Stoffe (Feld brennbar an der Art)
//            { feuer: true }            Metalle und brennbare Stoffe
//            { nur: "schwefel" }        spezieller Angriff einer einzigen Art
//          Gelernt wird seit Fassung 18 nach dem Lernset der Art (oben).
//          Angriffe sind allgemein: Name und Text beschreiben, was passiert,
//          nicht, wer es tut. Die internen Schlüssel (hammerschlag …) sind
//          älter als die Namen und bleiben wegen Spielständen und Tests.
// ------------------------------------------------------------
var REAKTIONEN = {

  // Stärken seit Fassung 12 auf der Skala bis 100: die alte Kraft ×5
  // (Schlag 10 → 50, Staubexplosion 20 → 100). Starke Schläge kosten
  // Genauigkeit statt Energie. Danach gemessen (27.10.2026, LIESMICH.md):
  // Wuchtstoß 80 → 70, Funkenflug 4 → 3 E, Blendung 50 → 30 %,
  // Schutzschicht dämpft nur noch halb (vorher 0,2: Zink gewann 78 %).
  hammerschlag: { name: "Schlag", typ: "schlag", staerke: 50, ae: 1, fuer: {},
    text: "Harter Schlag mit voller Wucht." },
  leichtschlag: { name: "Rempler", typ: "schlag", staerke: 35, ae: 0, fuer: {},
    text: "Schneller, leichter Stoß." },
  blankhieb: { name: "Schwerer Schlag", typ: "schlag", staerke: 65, genau: 95, ae: 1, fuer: { dichteAb: 5 },
    text: "Wuchtiger Schlag – je dichter der Stoff, desto schwerer." },
  wuchtstoss: { name: "Wuchtstoß", typ: "schlag", staerke: 70, genau: 90, ae: 1, fuer: { dichteAb: 5 },
    text: "Stoß mit dem ganzen Gewicht." },

  funkenflug: { name: "Funkenflug", typ: "feuer", staerke: 70, ae: 3, o2: 8, waerme: 10, fuer: { klasse: "Metall" },
    text: "Fein verteiltes Metall verbrennt in sprühenden Funken zum Oxid." },
  aufflammen: { name: "Aufflammen", typ: "feuer", staerke: 65, ae: 4, o2: 10, waerme: 15, fuer: { nur: "magnesium" },
    wirkung: { blendung: 30 },
    text: "Verbrennt mit grellem Licht zum Oxid. Kann den Gegner blenden." },
  glut: { name: "Glut", typ: "feuer", staerke: 65, ae: 3, o2: 10, waerme: 12, fuer: { klasse: "Nichtmetall", brennbar: true },
    text: "Der Stoff glüht und verbrennt." },
  blaue_flamme: { name: "Blaue Flamme", typ: "feuer", staerke: 60, ae: 2, o2: 8, waerme: 8, fuer: { nur: "schwefel" },
    wirkung: { vergiftung: 30 },
    text: "Brennt blau zu giftigem Schwefeldioxid. Kann den Gegner vergiften." },
  // Seit Fassung 13: Bor verbrennt mit grüner Flamme zu Boroxid.
  gruene_flamme: { name: "Grüne Flamme", typ: "feuer", staerke: 65, ae: 3, o2: 10, waerme: 12, fuer: { nur: "bor" },
    text: "Verbrennt mit grüner Flamme zu Boroxid." },
  kohlenstaub: { name: "Staubexplosion", typ: "feuer", staerke: 100, genau: 85, ae: 6, o2: 15, waerme: 20, fuer: { klasse: "Nichtmetall", brennbar: true },
    text: "Feiner Staub verbrennt schlagartig." },

  // Keine Verbrennung, sondern die Reaktion mit dem Ziel selbst:
  // Schwefel bildet mit Metallen Sulfide (Fe + S → FeS, stark exotherm).
  // Mit einem Nichtmetall passiert fast nichts – das regelt die
  // Typtabelle (Reaktion: Metall ×2, Nichtmetall ×½). Bis Fassung 11
  // hieß der Angriff Sulfidbildung und hatte eigene Faktoren je Ziel;
  // „Sulfid bilden“ (Zink gegen Schwefel) ist mit Fassung 12 entfallen.
  sulfurierung: { name: "Sulfurierung", typ: "reaktion", staerke: 65, ae: 4, waerme: 12, fuer: { nur: "schwefel" },
    text: "Bildet mit dem Gegner ein Sulfid. Stark gegen Metalle." },

  waermeleitung: { name: "Wärmeleitung", typ: "waerme", staerke: 0, ae: 2, fuer: { leitet: true },
    text: "Leitet die Wärme des Feldes in den Gegner. Stärke = Wärme + 40." },

  russwolke: { name: "Rußwolke", typ: "schutz", ae: 2, fuer: { nur: "kohlenstoff" },
    wirkung: { tarnung: 1 },
    text: "Feiner Ruß verdeckt die Sicht. Der nächste Treffer wirkt nur halb." },
  standfest: { name: "Standfest", typ: "schutz", ae: 1, fuer: {},
    wirkung: { schutz: 0.5 },
    text: "Abwehrhaltung: Der nächste Treffer wirkt nur halb." },
  anlaufen: { name: "Oxidschicht", typ: "schutz", ae: 2, o2: 3, braucht: { waerme: 30 }, fuer: { klasse: "Metall" },
    wirkung: { abwehrPlus: 4 },
    text: "Oxidschicht: Verteidigung +40 % bis Kampfende. Braucht Wärme ab 30." },
  zinkschild: { name: "Schutzschicht", typ: "schutz", ae: 1, fuer: { klasse: "Metall" },
    wirkung: { schutz: 0.5, abwehrPlus: 2 },
    text: "Dichte Schicht: Der nächste Treffer wirkt nur halb, Verteidigung +20 %." },

  // ---------- Seit Fassung 18: die Angriffe der Lernsets ----------
  // Freigegeben 29.10.2026 (drehbuch\Lernsets Kapitel 1.html). Namen
  // sind Vorgänge, nie Verbindungen, die später als Elemental kommen.
  // Grundangriffe auf Stufe 1: schwach, ohne Energie, verschieden stark.
  kratzen: { name: "Kratzen", typ: "schlag", staerke: 40, genau: 95, ae: 0, fuer: {},
    text: "Kurzer Angriff mit den Krallen." },
  hieb: { name: "Hieb", typ: "schlag", staerke: 40, genau: 95, ae: 0, fuer: {},
    text: "Schneller Schlag mit der Kante." },
  beissen: { name: "Beißen", typ: "schlag", staerke: 45, genau: 90, ae: 0, fuer: {},
    text: "Kräftiger Biss." },
  ansturm: { name: "Ansturm", typ: "schlag", staerke: 85, genau: 85, ae: 2, fuer: {},
    text: "Anlauf mit vollem Gewicht." },
  schmiedehammer: { name: "Schmiedehammer", typ: "schlag", staerke: 110, genau: 80, ae: 3, fuer: { dichteAb: 5 },
    text: "Wuchtiger Schlag mit dem ganzen Gewicht eines dichten Metalls.", chemie: "Je dichter ein Metall, desto mehr Wucht steckt in einem Schlag." },
  kristallsplitter: { name: "Kristallsplitter", typ: "schlag", staerke: 60, ae: 1, fuer: { nur: "bor" },
    text: "Harte, scharfkantige Splitter.", chemie: "Bor ist fast so hart wie Diamant und splittert scharfkantig." },
  splitterregen: { name: "Splitterregen", typ: "schlag", staerke: 110, genau: 85, ae: 3, fuer: { nur: "bor" },
    text: "Viele harte Splitter auf einmal.", chemie: "Harte Kristalle zerspringen in viele scharfe Stücke." },

  // Feuer mit Brennen: Das Ziel verliert danach 2 Runden lang LP.
  zuendfunke: { name: "Zündfunke", typ: "feuer", staerke: 45, ae: 2, o2: 5, waerme: 6, fuer: { feuer: true },
    wirkung: { brennen: 50 },
    text: "Ein Funke entzündet den Gegner. Kann ihn in Brand setzen.", chemie: "Ein kleiner Funke reicht, wenn der Stoff fein verteilt ist." },
  flaechenbrand: { name: "Flächenbrand", typ: "feuer", staerke: 80, ae: 5, o2: 12, waerme: 15, fuer: { feuer: true },
    wirkung: { brennen: 30 },
    text: "Breites Feuer. Kann den Gegner in Brand setzen.", chemie: "Ein Feuer breitet sich aus, solange es Sauerstoff bekommt." },
  weissglut: { name: "Weißglut", typ: "feuer", staerke: 100, genau: 90, ae: 6, o2: 12, waerme: 18, fuer: { feuer: true },
    wirkung: { brennen: 50 },
    text: "Weiß glühende Hitze. Kann den Gegner in Brand setzen.", chemie: "Sehr heiße Stoffe leuchten erst rot, dann weiß." },
  feuersturm: { name: "Feuersturm", typ: "feuer", staerke: 120, genau: 80, ae: 8, o2: 18, waerme: 25, fuer: { feuer: true },
    wirkung: { brennen: 100 },
    text: "Ein riesiges Feuer. Setzt den Gegner sicher in Brand.", chemie: "Ein großes Feuer saugt Luft an und facht sich selbst an." },
  magnesiumfackel: { name: "Magnesiumfackel", typ: "feuer", staerke: 95, genau: 90, ae: 6, o2: 15, waerme: 20, fuer: { nur: "magnesium" },
    wirkung: { brennen: 30 },
    text: "Grell weiße Flamme. Kann den Gegner in Brand setzen.", chemie: "Magnesium brennt heißer als 2000 °C." },
  schweissglut: { name: "Schweißglut", typ: "feuer", staerke: 90, ae: 6, o2: 10, waerme: 20, braucht: { waerme: 60 }, fuer: { nur: "aluminium" },
    wirkung: { brennen: 30 },
    text: "Glühend heiße Schmelze. Braucht Wärme ab 60. Kann den Gegner in Brand setzen.", chemie: "Aluminium entreißt Eisenoxid den Sauerstoff. So schweißt man Schienen (Thermit-Verfahren)." },
  zinkstaub: { name: "Zinkstaub", typ: "feuer", staerke: 60, ae: 3, o2: 8, waerme: 8, fuer: { nur: "zink" },
    wirkung: { blendung: 20 },
    text: "Verbrennt zu weißem Rauch. Kann den Gegner blenden.", chemie: "Zink verbrennt zu weißem Zinkoxid, das als Rauch aufsteigt." },

  // Wärme mit eigenem Grundwert (Stärke = Feldwärme + waermeGrund)
  kurzschluss: { name: "Kurzschluss", typ: "waerme", staerke: 0, waermeGrund: 50, genau: 90, ae: 3, fuer: { nur: "kupfer" },
    text: "Strom erhitzt den Gegner. Stärke = Wärme + 50.", chemie: "Kupfer leitet so gut, dass ein Kurzschluss die Drähte glühen lässt." },
  lichtbogen: { name: "Lichtbogen", typ: "waerme", staerke: 0, waermeGrund: 70, ae: 5, fuer: { nur: "kupfer" },
    wirkung: { brennen: 30 },
    text: "Strom springt durch die Luft. Stärke = Wärme + 70. Kann den Gegner in Brand setzen.", chemie: "Springt Strom durch die Luft, wird sie heißer als die Oberfläche der Sonne." },

  // Reaktion mit Nebenwirkung
  korrosion: { name: "Korrosion", typ: "reaktion", staerke: 50, ae: 3, braucht: { feuchte: 50 }, fuer: { nur: "eisen" },
    wirkung: { abwehrMinus: 2 },
    text: "Zersetzt die Oberfläche: Verteidigung des Gegners −20 %. Braucht Feuchte ab 50.", chemie: "Eisen rostet nur, wenn Wasser und Luft zusammenkommen." },
  giftwolke: { name: "Giftwolke", typ: "reaktion", staerke: 70, ae: 4, fuer: { nur: "schwefel" },
    wirkung: { vergiftung: 50 },
    text: "Giftige Dämpfe. Kann den Gegner vergiften.", chemie: "Schwefeldämpfe reizen die Lunge und sind giftig." },
  zinkfieber: { name: "Zinkfieber", typ: "reaktion", staerke: 55, ae: 3, fuer: { nur: "zink" },
    wirkung: { vergiftung: 40 },
    text: "Feiner Metallrauch. Kann den Gegner vergiften.", chemie: "Wer Zinkrauch einatmet, bekommt Fieber (Gießfieber)." },
  schwermetall: { name: "Schwermetall", typ: "reaktion", staerke: 60, ae: 3, fuer: { nur: "kupfer" },
    wirkung: { vergiftung: 40 },
    text: "Giftige Metallteilchen. Kann den Gegner vergiften.", chemie: "Kupfer ist für Algen und Pilze giftig." },

  // Störangriffe: kein Schaden, die Wirkung tritt sicher ein.
  blitzlicht: { name: "Blitzlicht", typ: "stoer", ae: 2, o2: 5, fuer: { nur: "magnesium" },
    wirkung: { blendung: 100 },
    text: "Grelles Licht blendet den Gegner sicher. Kein Schaden.", chemie: "Brennendes Magnesium war das Blitzlicht der ersten Fotografen." },
  stechender_rauch: { name: "Stechender Rauch", typ: "stoer", ae: 2, o2: 5, fuer: { nur: "schwefel" },
    wirkung: { vergiftung: 100 },
    text: "Stechendes Gas vergiftet den Gegner sicher. Kein Schaden.", chemie: "Brennender Schwefel bildet Schwefeldioxid, ein stechend giftiges Gas." },
  schleichendes_gas: { name: "Schleichendes Gas", typ: "stoer", ae: 2, o2: 8, fuer: { nur: "kohlenstoff" },
    wirkung: { vergiftung: 100 },
    text: "Unsichtbares Gas vergiftet den Gegner sicher. Kein Schaden.", chemie: "Kohle, die mit wenig Luft verbrennt, bildet ein unsichtbares Giftgas." },

  // Schutz
  haerten: { name: "Härten", typ: "schutz", ae: 2, braucht: { waerme: 50 }, fuer: { nur: "eisen" },
    wirkung: { abwehrPlus: 3 },
    text: "Verteidigung +30 % bis Kampfende. Braucht Wärme ab 50.", chemie: "Glühender Stahl, in Wasser abgeschreckt, wird hart." },
  wetterhaut: { name: "Wetterhaut", typ: "schutz", ae: 2, braucht: { feuchte: 50 }, fuer: { nur: "kupfer" },
    wirkung: { abwehrPlus: 3 },
    text: "Verteidigung +30 % bis Kampfende. Braucht Feuchte ab 50.", chemie: "Kupferdächer werden an feuchter Luft grün (Patina) und sind dann geschützt." },
  diamantgitter: { name: "Diamantgitter", typ: "schutz", ae: 3, fuer: { nur: "kohlenstoff" },
    wirkung: { abwehrPlus: 4 },
    text: "Verteidigung +40 % bis Kampfende.", chemie: "Diamant ist auch Kohlenstoff, nur anders gepackt, und der härteste Stoff." },
  borpanzer: { name: "Borpanzer", typ: "schutz", ae: 2, fuer: { nur: "bor" },
    wirkung: { abwehrPlus: 3 },
    text: "Verteidigung +30 % bis Kampfende.", chemie: "Bor macht Laborglas hitzefest und Stahl härter." },
  hartstoff: { name: "Hartstoff", typ: "schutz", ae: 3, fuer: { nur: "bor" },
    wirkung: { abwehrPlus: 5 },
    text: "Verteidigung +50 % bis Kampfende.", chemie: "Bohrerspitzen werden mit Bor beschichtet, damit sie länger halten." },
  feuerverzinken: { name: "Feuerverzinken", typ: "schutz", ae: 3, fuer: { nur: "zink" },
    wirkung: { abwehrPlus: 5 },
    text: "Verteidigung +50 % bis Kampfende.", chemie: "Stahl wird in flüssiges Zink getaucht und rostet dann nicht mehr." },
  eloxieren: { name: "Eloxieren", typ: "schutz", ae: 3, fuer: { nur: "aluminium" },
    wirkung: { abwehrPlus: 5 },
    text: "Verteidigung +50 % bis Kampfende.", chemie: "Mit Strom wird die Oxidschicht des Aluminiums dicker und härter." },
  aktivkohle: { name: "Aktivkohle", typ: "schutz", ae: 2, fuer: { nur: "kohlenstoff" },
    wirkung: { entgiften: true, tarnung: 1 },
    text: "Hebt die eigene Vergiftung auf. Der nächste Treffer wirkt nur halb.", chemie: "Aktivkohle bindet Giftstoffe an ihrer riesigen Oberfläche." }
};

// Alte Schlüssel aus Spielständen bis Fassung 11 (SPIELSTAND.pruefen)
var ALTE_ANGRIFFE = { sulfidbildung: "sulfurierung", zinksulfid: "waermeleitung" };

// Darf diese Art den Angriff ausführen (und später lernen)?
function kannAngriff(artId, angriffId) {
  var a = ARTEN[artId], f = REAKTIONEN[angriffId].fuer;
  if (!f) return false;
  if (f.nur) return f.nur === artId;
  if (f.klasse && a.klasse !== f.klasse) return false;
  if (f.dichteAb && a.stoff.dichte < f.dichteAb) return false;
  if (f.leitet && !a.steckbrief.leitfaehig) return false;
  if (f.brennbar && !a.brennbar) return false;
  if (f.feuer && a.klasse !== "Metall" && !a.brennbar) return false;
  return true;
}

// Wer den Angriff kann, in Worten – für die Detailansicht.
function angriffFuerText(angriffId) {
  var f = REAKTIONEN[angriffId].fuer || {};
  if (f.nur) return "nur " + ARTEN[f.nur].name;
  var t = [];
  if (f.brennbar) t.push("brennbare");
  if (f.klasse) t.push(f.klasse === "Metall" ? "Metalle" : f.klasse === "Nichtmetall" ? "Nichtmetalle" : f.klasse);
  if (f.dichteAb) t.push("dichte Stoffe");
  if (f.leitet) t.push("gute Leiter");
  if (f.feuer) t.push("Metalle und brennbare Stoffe");
  return t.length ? t.join(" ") : "alle";
}

// Genauigkeit unter 100 und Nebenwirkung in Worten, z. B.
// ["Treffer 90 %", "Blendung 50 %"] – für Menü und Detailansicht.
function angriffZusatz(angriffId) {
  var r = REAKTIONEN[angriffId], w = r.wirkung || {}, t = [];
  if (r.genau && r.genau < 100) t.push("Treffer " + r.genau + " %");
  var pr = function (wort, sicher, wert) { t.push(wert >= 100 ? sicher : wort + " " + wert + " %"); };
  if (w.blendung) pr("Blendung", "blendet sicher", w.blendung);
  if (w.vergiftung) pr("Vergiftung", "vergiftet sicher", w.vergiftung);
  if (w.brennen) pr("Brennen", "brennt sicher", w.brennen);
  return t;
}

// ------------------------------------------------------------
//  Untersuchungswerkzeuge (Erkennen im Kampf)
// ------------------------------------------------------------
var WERKZEUGE = {
  lupe:       { name: "Lupe",       prueft: ["farbe", "glanz"] },
  magnet:     { name: "Magnet",     prueft: ["magnetisch"] },
  stromkreis: { name: "Stromkreis", prueft: ["leitfaehig"] },
  hammer:     { name: "Hammer",     prueft: ["verformbar"] },
  // Gegenstände ohne Prüfung – stehen im Gepäck, nicht im Menü „Untersuchen“
  // Seit Fassung 13 auch ein Prüfwerkzeug: die Flammprobe (Magnesium oder Aluminium?)
  // Die id „gasbrenner“ bleibt wegen der Spielstände; seit Fassung 17 heißt er Bunsenbrenner.
  gasbrenner:        { name: "Bunsenbrenner", prueft: ["brennt"], labor: true, text: "Flammprobe: Brennt der Stoff? Im Kampf einmal Energie (+4), heizt das Feld auf." },
  geraetepass:       { name: "Gerätepass des Kolbenwaldes", prueft: [], text: "Unterschrieben von Meisterin Vitra." },
  // Laborgeräte für den Abzug (seit Fassung 17). Man bekommt sie in Quests;
  // mit ihnen entstehen später Verbindungen.
  tiegelzange:       { name: "Tiegelzange", prueft: [], labor: true, text: "Greift heiße Tiegel und Schalen. Vom Köhler." },
  messzylinder:      { name: "Messzylinder", prueft: [], labor: true, text: "Misst Flüssigkeiten genau ab. Von Meisterin Vitra." }
};

// Die Geräte, die der Abzug kennt, in dieser Reihenfolge
var LABORGERAETE = ["gasbrenner", "tiegelzange", "messzylinder"];

// ------------------------------------------------------------
//  Fanggefäße der Grundstufe (seit Fassung 17) – siehe kern\fangen.js
//  faktor  Fangrate      immer  fängt in jedem Fall
//  haelt   zerspringt nicht, wenn ein heftig reagierender Stoff entwischt
//  aus     herstellbar am Labortisch aus Material (braucht den Bunsenbrenner)
// ------------------------------------------------------------
var GEFAESSE = {
  reagenzglas:      { name: "Reagenzglas",      kurz: "Reagenzglas",  faktor: 1,   rate: "×1",
                      text: "Das einfache Standardgefäß, billig und überall erhältlich." },
  erlenmeyerkolben: { name: "Erlenmeyerkolben", kurz: "Erlenmeyer",   faktor: 1.5, rate: "×1,5", aus: { glasbruch: 4 },
                      text: "Mehr Volumen, stabiler Stand, kippt nicht um." },
  rundkolben:       { name: "Rundkolben",       kurz: "Rundkolben",   faktor: 2,   rate: "×2",   aus: { glasbruch: 8 }, haelt: true,
                      text: "Hält Hitze und Druck aus." },
  quarzampulle:     { name: "Quarzampulle",     kurz: "Quarzampulle", immer: true, rate: "sicher", aus: { quarz: 1 }, haelt: true,
                      text: "Wird zugeschmolzen. Extrem selten." }
};

// Weitere Waren im Gepäck: Verbrauchsgüter (in stand.vorrat) und Material (stand.material)
var WAREN = {
  kaeltemischung: { name: "Kältemischung", vorrat: true, text: "Eis und Kochsalz kühlen bis −20 °C. Ein abgekühltes Elemental fängt man doppelt so leicht." },
  glasbruch:      { name: "Glasbruch",     text: "Scherben aus dem Kolbenwald. Verkaufen oder am Labortisch zu neuen Gefäßen schmelzen." },
  quarz:          { name: "Quarz",         text: "Reiner Quarzsand (Siliciumdioxid). Daraus entsteht die Quarzampulle." }
};

// Name einer Sache im Gepäck, egal welcher Sorte
function sachName(id) {
  return (GEFAESSE[id] || WAREN[id] || WERKZEUGE[id] || { name: id }).name;
}
