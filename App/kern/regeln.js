// ============================================================
//  REGELN – Elemental-Duell, Fassung VI
//
//  Diese Datei enthaelt die Regeln als DATEN, nicht als Code.
//  Wer das Spiel neu ausbalancieren will, aendert hier Zahlen –
//  und nirgends sonst. Die Engine liest nur, sie entscheidet nichts.
//
//  Quelle: Regelwerk\Elemental-Duell Regelwerk.html
// ============================================================

window.REGELN = {

  fassung: "VI",

  // --- Abschnitt 2: Lebenspunkte ------------------------------
  // Es gibt nur drei Werte. Ausruestung hat gar keine (lp: null).
  lp: {
    element: 30,
    verbindung: 40,
    legendaer: 50
  },
  erlaubteLp: [30, 40, 50],

  // --- Abschnitt 2: Attacken ----------------------------------
  attackentypen: ["Feuer", "Wucht", "Gas", "Ätz"],

  // Die Schadensleiter, seit Fassung VII wieder 0/5/10/15. Die
  // Zwischenstufen 8 und 12 kamen aus dem Balancing (eine Stufe ist rund
  // 15 Prozentpunkte Siegquote wert, das war zum Nachjustieren zu grob).
  // Sie fallen wieder weg, weil der Punktezähler am Tisch eine Drehscheibe
  // in Fünferschritten ist: Was nicht auf der Fünferleiter liegt, lässt
  // sich dort nicht anzeigen, und genau das Rechnen sollte verschwinden.
  // Betroffen waren drei Karten (Schwefelsäure, Octan, Ethin: 12 → 10).
  erlaubterSchaden: [0, 5, 10, 15],

  // --- Abschnitt 5: Staerken und Schwaechen -------------------
  // Der Angriffstyp trifft auf eine Eigenschaft des Ziels.
  // Treffen mehrere Regeln zu, werden die Faktoren multipliziert.
  typenMatrix: [
    { typ: "Feuer", zielEigenschaft: "brennbar",   faktor: 2,
      begruendung: "Brennbare Stoffe fangen leicht Feuer." },
    { typ: "Feuer", zielEigenschaft: "erstickend", faktor: 0.5,
      begruendung: "Ohne Sauerstoff erlischt jedes Feuer." },
    { typ: "Ätz",   zielEigenschaft: "metallisch", faktor: 2,
      begruendung: "Aetzende Stoffe nagen an Metall (Korrosion)." },
    { typ: "Wucht", zielEigenschaft: "gasförmig",  faktor: 0.5,
      begruendung: "Ein Hieb geht durch ein Gas beinahe hindurch." }
  ],

  // "halber Schaden (1/2, auf volle 5 aufrunden)" – aufgerundet wird erst
  // am Ende, nachdem alle Faktoren angewandt wurden. Der Schritt ist seit
  // Fassung VII die 5 statt der 1: Damit bleibt jeder Punktestand auf der
  // Fünferleiter der Drehscheibe. Es gibt nur drei Fälle: 15 → 10,
  // 10 → 5, 5 → 5.
  rundung: "auf",
  rundungsSchritt: 5,

  // Zusatzeffekte werden nie verdoppelt oder halbiert, nur der Schaden.
  effekteSkalieren: false,

  // --- Maschinenlesbare Wirkungen ------------------------------
  // Das Feld "effekt" einer Attacke ist Fliesstext fuer Menschen und
  // fuer ein Programm unlesbar. Wo eine Wirkung ausfuehrbar sein soll,
  // bekommt die Attacke zusaetzlich das knappe Feld "wirkung":
  //   { "art": "selbstschaden", "wert": 5 }
  // Der Text bleibt daneben stehen – er ist das, was auf der Karte
  // gedruckt wird. Weitere Arten kommen spaeter dazu.
  wirkungsarten: ["selbstschaden"],

  // --- Abschnitt 4: Ausruestung spielen ------------------------
  // Die vierte Aktion stand von Anfang an im Regelwerk, die Engine
  // kannte sie bis zum 15.08.2026 nicht. Ausgefuehrt wird, was in
  // dieser Liste steht; alles andere ist ein Datenfehler.
  //
  //   heilung          Lebenspunkte zurueckgeben (Feldflasche)
  //   schadensbonus    naechste Attacke staerker (Wunderkerze)
  //   dauerbonus       bleibt liegen und wirkt weiter (pH-Kompass)
  //   schutz           Schaden am Ziel senken (Erlenmeyerkolben)
  //   direktschaden    Sofortschaden, meist an eine Bedingung
  //                    geknuepft (Glimmspan trifft nur Sauerstoff)
  //   zwangswechsel    Ziel muss auf die Bank (Siedeglas)
  //   angriffsperre    Gegner darf einen Zug nicht angreifen
  //   freieAktivierung eine ⚡-Synthese ohne Energiekarte
  //   blick            in die gegnerische Hand sehen
  ausruestungsWirkungen: [
    "heilung", "schadensbonus", "dauerbonus", "schutz", "direktschaden",
    "zwangswechsel", "angriffsperre", "freieAktivierung", "blick"
  ],

  // --- Grundsatz des Spiels ------------------------------------
  // Ziel des Spiels ist es, Verbindungen zu bilden. Also muessen
  // Verbindungen im Schnitt staerker sein als Elemente – sonst lohnt
  // sich die Synthese nicht, und der fachliche Kern verliert seinen
  // spielerischen Anreiz. Die Simulation prueft das als Kennzahl.
  grundsatz: {
    verbindungenStaerker: true,
    // Wie weit Verbindungen mindestens vorn liegen sollen (Prozentpunkte).
    mindestVorsprung: 0.08
  },

  // --- Abschnitt 3: Initiative --------------------------------
  // "Kleine Teilchen sind flink." Bei Gleichstand entscheidet der Zufall
  // (am Tisch: Schere-Stein-Papier).
  initiative: "kleinereMasse",

  // --- Abschnitt 6: Synthese ----------------------------------
  syntheseProZug: 1,

  // Fassung V hat drei Dinge in Worte gefasst, die die Engine schon
  // immer so entschieden hat – am Tisch wurde darueber geraten:
  //
  //  1. ALLE Edukte werden verbraucht, nicht "beide". Fast alle
  //     Synthesen haben zwei Edukte, die Gaerung nur eines
  //     (Traubenzucker -> Ethanol), Koeffizienten ab Stufe III
  //     verlangen zwei Exemplare derselben Karte. Es bleibt nie
  //     ein Edukt uebrig, auch der Sauerstoff nicht: Er steckt
  //     danach im Produkt. Das ist die Massenbilanz.
  //  2. Alles auf einmal oder gar nicht – kein Zwischenlagern,
  //     keine halbe Reaktion (moeglicheSynthesen in engine.js
  //     prueft die Vollstaendigkeit vor dem Zug).
  //  3. War das aktive Elemental ein Edukt, ist die Arena danach
  //     leer und das Produkt tritt dort an – ohne Zugverbrauch.
  //
  // Weiterhin gilt: ⚡ ist die ZUENDUNG (Aktivierungsenergie), nicht
  // die Energiebilanz. Aus "exotherm" folgt nicht, dass keine
  // Energie-Ausruestung noetig waere: Magnesium verbrennt heftig
  // exotherm und muss trotzdem angezuendet werden. Es zaehlt allein
  // das Feld synthese.aktivierung.

  // Eine Synthese kostete drei Dinge auf einmal: zwei Elementals, den
  // ganzen Zug – und damit den Angriff. Gemessen hat sich das nicht
  // gerechnet: Wer synthetisierte, gewann nur 38 % statt 52 %. Seit
  // 07.08.2026 ist die Synthese eine FREIE Aktion – wer synthetisiert,
  // darf im selben Zug noch angreifen oder wechseln. Weiterhin gilt
  // syntheseProZug: 1, die Zusatzaktion darf also keine zweite
  // Synthese sein.
  syntheseIstFreieAktion: true,

  // Was mit den Edukten passiert. "alle" ist die Regel (Abschnitt 6:
  // „Kein Edukt bleibt uebrig") und die einzige Einstellung, zu der die
  // auf JEDER Verbindungs-Karte gedruckte Massenbilanz passt.
  //   "alle"    Regel. 56 u + 32 u = 88 u, nichts bleibt liegen.
  //   "keines"  Messvariante: Die Edukte bleiben, das Team waechst.
  //   "eines"   Messvariante: Eines bleibt fuer die naechste Synthese.
  // Die beiden Messvarianten widersprechen dem Kartentext und erzeugen
  // genau die Klasse-7-Fehlvorstellung, gegen die der Unterricht
  // arbeitet ("die Ausgangsstoffe bleiben erhalten, der neue Stoff kommt
  // dazu"). Sie stehen hier, damit sich der Unterschied MESSEN laesst –
  // nicht, damit damit gespielt wird.
  eduktVerbrauch: "alle",

  // Eigenschafts-Schlagwort, das eine Ausruestung als Energiequelle
  // ausweist (Gasbrenner, Streichholz) – noetig bei aktivierung: true.
  energieMerkmal: "Energie",
  // Exothermer Schaden trifft das aktive Elemental des Gegners direkt
  // und wird nicht von der Typen-Matrix veraendert.
  exothermIgnoriertTypen: true,

  // "brennbar" ist im Spiel bisher ein reiner Nachteil: In Feuerlande
  // tragen acht von elf Karten eine Feuer-Attacke, also wird jedes
  // brennbare Elemental dauernd doppelt getroffen. Steht dieser Wert
  // ueber 0, bekommt brennbar eine Kehrseite nach oben: Ist eines der
  // Edukte brennbar, setzt die exotherme Reaktion entsprechend mehr
  // Energie frei. Der Brennstoff ist es schliesslich, der sie liefert.
  brennstoffBonus: 0,

  // --- Abschnitt 10: Meisterstufen ----------------------------
  // Stufe I spielte bis Fassung V mit team: 3. Gemessen (je 1.100 Duelle,
  // bis=Feuerlande): Team 3 -> 16,2 Zuege / 0,54 Synthesen / Spanne 16,5 %,
  // Team 4 -> 22,4 / 0,87 / 12,5 %, Team 5 -> 28,2 / 1,14 / 10,4 %.
  // Ausschlaggebend ist die Synthese-Zahl: Bei 0,54 sieht die halbe Klasse
  // den fachlichen Kern des Spiels im Duell gar nicht. Team 5 faellt aus,
  // weil dort der Synthese-Vorteil von +14,2 % auf +7,9 % einbricht – wer
  // fuenf Elementals hat, braucht die Verbindung nicht mehr.
  meisterstufen: {
    "I": {
      region: "Feuerlande", team: 4, handAusruestung: 2, handVerbindungen: 2,
      deckMin: 3, deckMax: 7,
      syntheseKetten: false, koeffizienten: false, analyse: false,
      neu: "Grundregeln, einstufige Synthese"
    },
    "II": {
      region: "Periodika", team: 4, handAusruestung: 2, handVerbindungen: 3,
      deckMin: 4, deckMax: 9,
      syntheseKetten: true, koeffizienten: false, analyse: false,
      neu: "Synthese-Ketten: Eine Verbindung im Spiel darf Edukt der naechsten Synthese sein."
    },
    "III": {
      region: "Region 3", team: 5, handAusruestung: 3, handVerbindungen: 3,
      deckMin: 5, deckMax: 11,
      syntheseKetten: true, koeffizienten: true, analyse: false,
      neu: "Koeffizienten: 2 Mg + O2 -> 2 MgO"
    },
    "IV": {
      region: "später", team: 5, handAusruestung: 3, handVerbindungen: 3,
      deckMin: 5, deckMax: 11,
      syntheseKetten: true, koeffizienten: true, analyse: true,
      neu: "Analyse: Verbindungen wieder zerlegen. Danach wachsen die Limits nicht mehr."
    }
  },

  // --- Regionen und Meisterstufen ------------------------------
  // Schueler sammeln kumulativ: Wer in Aquaria ist, spielt mit allen
  // Karten aus Feuerlande bis Aquaria. Jede dieser Stufen ist ein
  // eigenes Spiel mit eigenem Gleichgewicht. Ab Salzkueste waechst die
  // Meisterstufe nicht mehr, nur noch die Kartenzahl.
  regionStufe: {
    "Feuerlande": "I",
    "Periodika": "II",
    "Aerosol": "III",
    "Aquaria": "IV",
    "Salzküste": "IV",
    "Erdhügel": "IV",
    "Acidia": "IV",
    "Organica": "IV"
  },

  // Sicherung gegen Endlosduelle in der Simulation. Im echten Spiel
  // gibt es keine Zugbegrenzung.
  maxZuege: 300,

  // --- Klassenfarben: nicht mehr hier -------------------------
  // Sie standen bis zum 12.08.2026 als Kopie an dieser Stelle, die
  // massgebliche Fassung in Karten\generator.html. Beide sind jetzt
  // in App\kern\kartenstil.js zusammengefuehrt (window.KARTENSTIL).
  // Eine Farbe ist keine Spielregel: Diese Datei beantwortet, was
  // passiert, kartenstil.js, wie es aussieht.

  // Welche Klasse welche LP-Stufe haben soll (Regelwerk, Abschnitt 2):
  // "Elemente 30 LP · Verbindungen 40 LP · legendäre Elementals 50 LP".
  // Alles, was in keiner der beiden Listen steht, gilt als Verbindung.
  elementKlassen: ["Metall", "Nichtmetall", "Alkalimetall", "Erdalkalimetall", "Halogen", "Edelgas"],
  legendaereKlassen: ["Legendär"],
  // "legendär" ist KEINE Kartenklasse, sondern eine Auszeichnung: Eine
  // Karte kann chemisch ein Halogen sein und trotzdem die Belohnung am
  // Ende einer Region. Solche Karten tragen das Feld legendaer: true.
  // Nur die drei Finale-Karten behalten die volle Stufe von 50 LP;
  // die Regions-Belohnungen bekommen ihre chemische Stufe und beziehen
  // ihre Besonderheit aus dem Kartentext, nicht aus den Lebenspunkten.
  legendaerFeld: "legendaer",

  // Klassen, deren Karten metallisch sein sollten. Fehlt einer solchen
  // Karte das Schlagwort "metallisch", greift die Aetz-Regel nicht.
  metallischeKlassen: ["Metall", "Alkalimetall", "Erdalkalimetall", "Legierung"],

  // ... es sei denn, die Karte ist ausdruecklich saeurefest. Die Aetz-Regel
  // bildet Korrosion ab, und Edelmetalle korrodieren nicht: Gold, Silber
  // und Platin werden von Saeuren nicht angegriffen, Aluminium schuetzt
  // sich durch seine Oxidschicht. Dass diesen Karten "metallisch" fehlt,
  // ist chemisch richtig und kein Datenfehler.
  saeurefestMerkmale: ["edel", "korrosionsfest", "säurefest"]
};
