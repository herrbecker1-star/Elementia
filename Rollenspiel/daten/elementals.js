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
  },

  magnesium: {
    name: "Magnesium", formel: "Mg", klasse: "Metall", gruppe: "hg2", bild: "magnesium", seltenheit: "haeufig",
    beschreibung: "Leichtes, silbriges Metall. Es verbrennt mit gleißend hellem Licht. In jeder grünen Pflanze steckt etwas Magnesium.",
    stoff: { haerte: 2.5, dichte: 1.74, schmelz: 650 },
    steckbrief: { farbe: "silbrig", glanz: true, magnetisch: false, leitfaehig: true, verformbar: true, brennt: true },
    form: "stueck",
  },

  kohlenstoff: {
    // Holzkohle aus dem Meiler. Leitet den Strom – als einziges
    // Nichtmetall in Maras Kisten. Genau diese Ausnahme macht den
    // Steckbrief lehrreich: Leitfähigkeit allein heißt nicht Metall.
    name: "Kohlenstoff", formel: "C", klasse: "Nichtmetall", gruppe: "hg4", bild: "kohlenstoff", seltenheit: "haeufig", brennbar: true,
    beschreibung: "Schwarze, leichte Holzkohle. Leitet den Strom und ist trotzdem kein Metall. Verbrennt zu Kohlenstoffdioxid.",
    stoff: { haerte: 1.5, dichte: 2.26, schmelz: 3640 },   // Grafit, sublimiert
    steckbrief: { farbe: "schwarz", glanz: false, magnetisch: false, leitfaehig: true, verformbar: false, brennt: true },
    form: "stueck",
  },

  kupfer: {
    // Seit Fassung 17: in den Feuerlanden nur bei Gildenmeisterin Ilka,
    // fangbar erst in den Clans der Erzhügel (Elementals je Region).
    name: "Kupfer", formel: "Cu", klasse: "Metall", gruppe: "nebengruppe", bild: "kupfer", seltenheit: "selten", fangbarAb: "Clans der Erzhügel",
    beschreibung: "Rötliches, weiches Metall. Leitet Strom und Wärme besser als fast alle Stoffe – darum sind Kabel aus Kupfer.",
    stoff: { haerte: 3, dichte: 8.96, schmelz: 1085 },
    steckbrief: { farbe: "rötlich", glanz: true, magnetisch: false, leitfaehig: true, verformbar: true, brennt: false },
    form: "stueck",
  },

  zink: {
    // Bei Raumtemperatur spröde; gut verformbar erst zwischen 100 und
    // 150 °C. Darum hier "verformbar: false" – und gegen Schlag die
    // Ausnahme ×1 statt ×½, solange das Feld kälter als Wärme 50 ist.
    // Seit Fassung 12 Wärmeleitung statt „Sulfid bilden“ (Zink leitet gut).
    // Mit Funkenflug gewann Zink 83 % (doppelt mit Eisen und schneller),
    // ohne speziellen Angriff 23 % (gegen Metalle wirkt Schlag nur halb).
    name: "Zink", formel: "Zn", klasse: "Metall", gruppe: "nebengruppe", bild: "zink", seltenheit: "haeufig",
    beschreibung: "Bläulich-graues Metall. Kalt spröde, warm formbar. Als dünne Schicht schützt es Eisen vor Rost (verzinken).",
    stoff: { haerte: 2.5, dichte: 7.14, schmelz: 420 },
    steckbrief: { farbe: "bläulich-grau", glanz: true, magnetisch: false, leitfaehig: true, verformbar: false, brennt: false },
    warmVerformbar: true,
    form: "stueck",
  },

  schwefel: {
    name: "Schwefel", formel: "S", klasse: "Nichtmetall", gruppe: "hg6", bild: "schwefel", seltenheit: "selten", brennbar: true,
    beschreibung: "Gelbes Pulver, leitet keinen Strom. Schmilzt schon bei 115 °C und brennt mit blauer Flamme zu stechendem Schwefeldioxid.",
    stoff: { haerte: 2, dichte: 2.07, schmelz: 115 },
    steckbrief: { farbe: "gelb", glanz: false, magnetisch: false, leitfaehig: false, verformbar: false, brennt: true },
    form: "pulver",
  },

  // Seit Fassung 13. Sieht aus wie Magnesium (silbrig, glänzt, leitet,
  // biegsam) – erst die Flammprobe trennt beide: Magnesium brennt grell,
  // Aluminiumblech nicht, weil eine dünne Oxidhaut es schützt. Dieselbe
  // Oxidhaut macht es im Kampf feuerfest (Ausnahme Feuer ×1) – darum ist
  // es der Konter gegen Schwefel: Schlag ×2, und Schwefels Flamme prallt ab.
  aluminium: {
    // Seit Fassung 17 wie Kupfer: Ilkas Elemental, fangbar ab den Erzhügeln.
    name: "Aluminium", formel: "Al", klasse: "Metall", gruppe: "hg3", bild: "aluminium", seltenheit: "selten", fangbarAb: "Clans der Erzhügel",
    beschreibung: "Leichtes, silberweißes Metall. Eine dünne Oxidhaut schützt es, darum rostet es nicht. Aus Aluminium sind Folie und Dosen.",
    stoff: { haerte: 2.75, dichte: 2.70, schmelz: 660 },
    steckbrief: { farbe: "silberweiß", glanz: true, magnetisch: false, leitfaehig: true, verformbar: true, brennt: false },
    form: "stueck",
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
  // Seit Fassung 20 sind Angriff und Verteidigung der Kapitel-1-Gruppen
  // angeglichen (Nutzer, 30.10.2026): In Kapitel 1 gibt es fast nur
  // Normal-Attacken, also entschieden allein diese Werte – Eisen gewann
  // auf gleicher Stufe alles, Schwefel nichts. Gemessen: Stufe 5 jetzt
  // 44–69 % je Art (Aluminium 29 %), +1 Stufe 98 % (f20b-D2).
  hg2:         { name: "2. Hauptgruppe",  kurz: "Erdalkalimetall", angriff: 75, verteidigung: 70,  spAngriff: 90,  spVerteidigung: 75 },
  hg3:         { name: "3. Hauptgruppe",  kurz: "Borgruppe",       angriff: 75, verteidigung: 70,  spAngriff: 65,  spVerteidigung: 55 },
  hg4:         { name: "4. Hauptgruppe",  kurz: "Kohlenstoffgr.",  angriff: 75, verteidigung: 70,  spAngriff: 70,  spVerteidigung: 60 },
  hg5:         { name: "5. Hauptgruppe",  kurz: "Stickstoffgr.",   angriff: 50, verteidigung: 60,  spAngriff: 100, spVerteidigung: 70 },
  hg6:         { name: "6. Hauptgruppe",  kurz: "Chalkogen",       angriff: 80, verteidigung: 70,  spAngriff: 85,  spVerteidigung: 75 },
  hg7:         { name: "7. Hauptgruppe",  kurz: "Halogen",         angriff: 40, verteidigung: 50,  spAngriff: 110, spVerteidigung: 70 },
  hg8:         { name: "8. Hauptgruppe",  kurz: "Edelgas",         angriff: 30, verteidigung: 110, spAngriff: 50,  spVerteidigung: 110 },
  nebengruppe: { name: "Nebengruppe",     kurz: "Übergangsmetall", angriff: 75, verteidigung: 70,  spAngriff: 65,  spVerteidigung: 75 },
  legierung:   { name: "Legierung",       kurz: "Legierung",       angriff: 95, verteidigung: 100, spAngriff: 45,  spVerteidigung: 60 },
  oxid:        { name: "Oxid",            kurz: "Oxid",            angriff: 60, verteidigung: 100, spAngriff: 50,  spVerteidigung: 80 },
  sulfid:      { name: "Sulfid",          kurz: "Sulfid",          angriff: 65, verteidigung: 80,  spAngriff: 60,  spVerteidigung: 75 },
  salz:        { name: "Salz",            kurz: "Salz",            angriff: 55, verteidigung: 90,  spAngriff: 60,  spVerteidigung: 85 },
  saeure:      { name: "Säure",           kurz: "Säure",           angriff: 40, verteidigung: 50,  spAngriff: 110, spVerteidigung: 70 },
  lauge:       { name: "Lauge",           kurz: "Lauge",           angriff: 40, verteidigung: 55,  spAngriff: 105, spVerteidigung: 70 },
  molekuel:    { name: "Molekülverbindung", kurz: "Molekül",       angriff: 55, verteidigung: 65,  spAngriff: 80,  spVerteidigung: 80 }
};

// ------------------------------------------------------------
//  Typen, Attacken und Lernsets (seit Fassung 20)
//
//  Stammen aus der Tabelle des Nutzers (daten\kreaturen.js, erzeugt
//  von werkzeug\kreaturensammler-import.py): Jede Art bekommt hier
//  Typ 1/2, Zustand und Lernset über ihr Symbol (formel). Die alten
//  Angriffe (REAKTIONEN bis Fassung 19) sind entfallen; der Name
//  REAKTIONEN bleibt als Verweis auf ATTACKEN, weil Szene und Buch ihn
//  benutzen.
// ------------------------------------------------------------
Object.keys(ARTEN).forEach(function (id) {
  var a = ARTEN[id], e = ELEMENTE[a.formel];
  if (!e) throw new Error("Kein Eintrag in der Tabelle für " + a.formel);
  a.typ1 = e.typ1;
  a.typ2 = e.typ2 || null;
  a.zustand = e.zustand;
  a.lernset = LERNSETS[a.formel];
});
var REAKTIONEN = ATTACKEN;

// Was eine Attacke kann, in kurzen Worten – für Lernfenster, Detail und
// Stoffkunde: Treffer unter 100 % und der Effekt aus der Tabelle.
function angriffZusatz(id) {
  var a = ATTACKEN[id], t = [];
  if (a.genau !== null && a.genau < 100) t.push("Treffer " + a.genau + " %");
  if (a.genau === null && a.kategorie !== "status") t.push("trifft immer");
  if (a.effekt) t.push(a.effekt);
  return t;
}

// Status-Attacken: stärkt sie einen selbst (Schild) oder schwächt sie
// den Gegner (Blitz)? Für das Symbol im Menüband.
function angriffHilftSelbst(id) {
  var e = ATTACKEN[id].e;
  return !(e.gegner || e.status || e.kampfwetter === "staub");
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
