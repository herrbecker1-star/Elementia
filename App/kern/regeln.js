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

  fassung: "XI",

  // --- Abschnitt 2: Lebenspunkte ------------------------------
  // Die Stufen der LP-Leiter. Ausruestung hat gar keine (lp: null).
  //
  // Verbindungen standen bis Fassung VII auf 40. Gemessen am 15.08.2026
  // war der Grundsatz des Spiels damit VERLETZT: Wer synthetisiert, sobald
  // es geht – so spielt ein Kind –, verlor Duelle. syntheseLohnt lag bei
  // -15,5 % (Feuerlande) und -22,7 % (Periodika).
  //
  // Die Rechnung dahinter ist einfach: Zwei Elemente à 30 LP (zusammen 60)
  // werden zu EINER Verbindung. Bei 40 LP verliert das Team 20 LP und
  // einen Koerper auf der Bank – die Synthese war ein Verlustgeschaeft.
  //
  // Gemessen wurde die ganze Leiter (varianten.js, "verbindungen-lp-*"):
  //   40 LP  syntheseLohnt -15,5 %   der Ist-Zustand, eine Falle
  //   45 LP                 +0,2 %   gerade nicht mehr schaedlich
  //   50 LP                 +3,6 %   \ zusammen mit den neuen Bauformen
  //   55 LP                +15,3 %   / die Wahl (siehe unten)
  //   60 LP                +16,2 %   Pflicht: Bei zwei vollen 30ern ist
  //                                  lpEdukte <= verbindung.lp IMMER wahr,
  //                                  die Synthese ist keine Entscheidung
  //                                  mehr. Deshalb NICHT genommen.
  // Beschlossen wurde 50 zusammen mit der Schadensspreizung: Diese
  // Kombination bringt syntheseLohnt auf +19,7 % und laesst als einzige
  // die Spanne der belastbaren Karten SCHRUMPFEN (26,3 auf 24,8 %).
  lp: {
    element: 30,
    verbindung: 50,
    legendaer: 60,
    // Vierte Sprosse seit Fassung XI. Edelgase gehen KEINE Synthese ein –
    // sie sind nie Edukt, nie Produkt, und damit war ihr einziger Zweck
    // "Elemental mit 30 LP und einer 5er-Attacke". Gemessen waren sie die
    // schwaechsten Karten des Spiels und wurden schlicht nicht benutzt.
    //
    // Die Zahl kommt aus der Chemie, nicht aus der Not: Wer nicht
    // reagiert, haelt aus. Edelgase werden so zaeh wie eine Verbindung,
    // ohne je eine zu werden. Zusammen mit der Aetz-Immunitaet (siehe
    // typenMatrix) und der Wucht-Halbierung fuer "gasfoermig" trifft sie
    // nur noch Feuer und Gas voll.
    edelgas: 50
  },

  // --- Die Fuenferleiter ist seit Fassung VIII Geschichte -----
  // Bis Fassung VII gab es genau drei LP-Werte und vier Schadenswerte.
  // Der Grund lag nicht im Spiel, sondern im Punktezaehler: Die
  // Drehscheibe am Tisch zeigte elf Felder in Fuenferschritten, und was
  // nicht auf dieser Leiter lag, liess sich dort nicht anzeigen.
  //
  // Das war zu teuer. Gemessen am 15.08.2026: 72 % aller 127 Attacken
  // trugen schlicht die 10, und im ganzen Feuerlande-Pool gab es nur
  // VIER verschiedene Bauformen (LP × hoechster Schaden). Bei so wenigen
  // Bauformen ist die Meta in wenigen Duellen durchschaut – es gibt
  // schlicht nichts zu entdecken.
  //
  // Der Punktezaehler ist deshalb umgebaut: zwei Scheiben, Zehner und
  // Einer, Bereich 0-79 in Einerschritten (Karten\Drehscheibe\
  // lp-drehscheibe.html). Damit ist jede ganze Zahl anzeigbar. Der Preis
  // ist, dass am Tisch gerechnet wird – vorher wurde nur weitergedreht.
  // Das ist Kopfrechnen mit Zehneruebergang bei Kindern ab Klasse 7 und
  // vertretbar; ohne freie Zahlen war das Spiel nicht auszubalancieren.
  //
  // Grenzen statt Listen: Die Obergrenze der LP ist, was der Zaehler
  // zeigt. Beides sind ganze Zahlen – Halbe gaebe es auf keiner Scheibe.
  lpSpanne: [10, 79],
  schadenSpanne: [0, 40],

  // --- Abschnitt 2: Attacken ----------------------------------
  attackentypen: ["Feuer", "Wucht", "Gas", "Ätz"],

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
      begruendung: "Ein Hieb geht durch ein Gas beinahe hindurch." },
    // Fuenfte Zeile seit Fassung XI. Das ist KEINE neue Erfindung,
    // sondern die Einloesung eines Versprechens, das seit jeher auf VIER
    // Karten gedruckt steht: Helium, Neon, Argon ("Edel: immun gegen
    // Aetz-Attacken") und Stickstoff ("Reaktionstraege: erleidet durch
    // Aetz-Attacken keinen Schaden"). Ausgefuehrt wurde es nie – der Text
    // war Fliesstext, und die Engine liest nur diese Tabelle.
    //
    // Sie haengt an der EIGENSCHAFT, nicht an der Klasse: Stickstoff ist
    // kein Edelgas, aber genauso reaktionstraege - und er war mit 26,6 %
    // die schwaechste belastbare Karte in Feuerlande.
    { typ: "Ätz",   zielEigenschaft: "reaktionsträge", faktor: 0,
      begruendung: "Wer mit nichts reagiert, den greift auch nichts an." }
  ],

  // "halber Schaden (1/2)" – gerundet wird erst am Ende, nachdem alle
  // Faktoren angewandt wurden. Der Schritt ist seit Fassung VIII wieder
  // die 1: Der neue Punktezaehler zeigt jede ganze Zahl, also muss nicht
  // mehr auf die Fuenferleiter gerundet werden. Aufgerundet wird
  // weiterhin – zugunsten des Angreifers, damit 5 halbiert nicht auf 2,5
  // faellt und eine Attacke nie ins Leere laeuft.
  rundung: "auf",
  rundungsSchritt: 1,

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
  //   zweiteSynthese   eine zweite Synthese im selben Zug (Gasbrenner
  //                    einmalig, Platin-Katalysator dauerhaft)
  //   blick            in die gegnerische Hand sehen
  ausruestungsWirkungen: [
    "heilung", "schadensbonus", "dauerbonus", "schutz", "direktschaden",
    "zwangswechsel", "angriffsperre", "zweiteSynthese", "blick"
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
  // die Energiebilanz. Aus "exotherm" folgt nicht, dass keine Zuendung
  // noetig waere: Magnesium verbrennt heftig exotherm und muss trotzdem
  // angezuendet werden.
  //
  // Seit Fassung IX ist ⚡ aber nur noch FACHINFORMATION und kostet im
  // Spiel nichts mehr: Eine Synthese braucht allein ihre Edukte.
  // Grund ist kein Balancing, sondern eine Zwickmuehle im Deckbau. In
  // Feuerlande traegt JEDE Synthese ein ⚡, auf Stufe I gibt es aber nur
  // zwei Ausruestungsplaetze (handAusruestung: 2). Wer zwei Verbindungen
  // bauen wollte, fuellte damit beide Plaetze mit Zuendkarten –
  // Loeschdecke, Schutzbrille, Erlenmeyerkolben und Wunderkerze kamen
  // nie ins Deck. Die Synthese ist der fachliche Kern des Spiels und
  // darf nicht die Karte sein, die alle anderen verdraengt.
  //
  // Der Schalter bleibt stehen, damit sich die alte Regel als Variante
  // "zuendung-pflicht" gegenmessen laesst (varianten.js).
  zuendungNoetig: false,

  // --- Abschnitt 4: Was kostet einen Zug? ---------------------
  // Eine Synthese kostete drei Dinge auf einmal: zwei Elementals, den
  // ganzen Zug – und damit den Angriff. Gemessen hat sich das nicht
  // gerechnet: Wer synthetisierte, gewann nur 38 % statt 52 %. Seit
  // 07.08.2026 ist die Synthese eine FREIE Aktion. Weiterhin gilt
  // syntheseProZug: 1.
  syntheseIstFreieAktion: true,

  // Seit Fassung X gilt dasselbe fuer die Ausruestung, und aus zwei
  // Regeln wird eine: "Dein Zug endet, wenn du angreifst, wechselst
  // oder passt. Synthese und Ausruestung kosten keinen Zug."
  //
  // Der Grund ist derselbe wie bei der Zuendung eine Fassung vorher:
  // Wer die Loeschdecke spielte, griff in diesem Zug nicht an – fast
  // jedes Geraet war damit ein Verlustgeschaeft, und die Karten
  // blieben liegen. Gebremst wird es allein durch die Hand: zwei
  // Geraete auf Stufe I, drei ab Stufe III.
  //
  // Die alte Sonderregel ("die Synthese schenkt dir EINE weitere
  // Aktion") entfaellt dabei ersatzlos. Sie war der Sonderfall, den
  // diese Regel jetzt allgemein ausspricht.
  ausruestungIstFreieAktion: true,

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
  // ausweist (Gasbrenner, Streichholz). Seit Fassung IX nur noch
  // Beschriftung: Gelesen wird es fuer die Anzeige und fuer die
  // Variante "zuendung-pflicht", nicht mehr als Spielkosten.
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

  // --- Abschnitt 1: Wie oft darf dieselbe Karte ins Deck? -----
  // Bis Fassung IX: einmal. Das klang nach einer Regel, war aber
  // keine – im Deckbildschirm stand jede Karte schlicht nur einmal
  // im Raster, und gedruckt ergab sich das Verbot nur nebenbei aus
  // dem Deckbau-Kasten in Abschnitt 7.
  //
  // Der Preis war hoch: In Feuerlande brauchen 7 der 10 Synthesen
  // Sauerstoff, und jedes Edukt wird verbraucht. Mit einem einzigen
  // Sauerstoff im Team ist genau EIN Oxid baubar – zwei verschiedene
  // Oxide zu bilden war unmoeglich, obwohl das chemisch das
  // Naheliegendste ueberhaupt ist.
  //
  // Zwei, nicht beliebig viele: Vier Sauerstoff im Viererteam waeren
  // erlaubt, und Sauerstoff ist mit 65 % die staerkste
  // Feuerlande-Karte. Das waere kein Deck mehr, das etwas ueber
  // Chemie lehrt.
  //
  // Gilt fuer alle drei Deckteile und fuer jede Meisterstufe. Nicht
  // zu verwechseln mit koeffizienten (Abschnitt 10): Das sind
  // Synthesen, die zwei Exemplare desselben Edukts VERLANGEN
  // (2 Mg + O2 -> 2 MgO) – solche Rezepte gibt es in den Kartendaten
  // noch gar nicht.
  maxGleicheKarten: 2,

  // Wie VIELE verschiedene Karten duerfen doppelt sein? Der zweite
  // Hebel an derselben Regel – und der viel schaerfere, falls sich
  // zeigt, dass Doppelte das Gleichgewicht kippen: Um zwei Oxide zu
  // bauen, braucht man genau EINEN Zwilling (zweimal Sauerstoff).
  // Alles darueber hinaus ist Kuer.
  //   0   gar keine Doppelten (Stand bis Fassung IX)
  //   1   ein Zwilling je Deck – "Eine einzige Karte darfst du
  //       zweimal mitnehmen"
  //   99  beliebig viele, begrenzt nur durch maxGleicheKarten
  maxZwillinge: 99,

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
      // 4 (nur das Team) bis 8 (Team + beide Handgrenzen). Stand bis
      // 16.08.2026 auf 3/7 – uebersehen, als das Team in Fassung VI
      // von 3 auf 4 ging. Gelesen wird es nirgends, gedruckt schon.
      deckMin: 4, deckMax: 8,
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

  // --- NUR IN DER APP -----------------------------------------
  // Alles unter appZusatz gilt AUSDRUECKLICH NICHT am Tisch. Das
  // gedruckte Regelwerk kennt es nicht, die Regeltests pruefen es nicht,
  // und die Karten tragen es nicht.
  //
  // Der Grund fuer die Trennung: Am Tisch braeuchte jeder Angriff einen
  // Wuerfelwurf. Das kostet Zeit, und das Kartenspiel soll frei von
  // Zufallsereignissen bleiben – so entschieden am 15.08.2026. In der App
  // rechnet der Rechner, dort kostet es nichts.
  //
  // Wozu ueberhaupt Zufall: Er ist der einzige Hebel, der die Meta nicht
  // verschiebt, sondern unscharf macht. Freiere Zahlen und mehr Bauformen
  // aendern, WELCHE Karte die beste ist; der Volltreffer sorgt dafuer,
  // dass die beste Karte nicht jedes Duell gewinnt.
  //
  // Die Engine fuehrt das nur aus, wenn das Duell ausdruecklich mit
  // { volltreffer: true } gebaut wurde – Vorgabe ist aus.
  //
  // ACHTUNG, die Zahlen vom 15.08.2026 an dieser Stelle waren nicht
  // nachvollziehbar: Die Werkstatt hat "volltreffer" bis zum 17.08.2026
  // gar nicht an die Simulation gereicht (werkstatt.html), der Zufall
  // lief also in KEINEM Simulationslauf mit. Woher jene Werte stammten,
  // ist unklar; sie sind hier ersetzt.
  //
  // NEU GEMESSEN am 17.08.2026, mit dem Kaestchen "Volltreffer" in der
  // Werkstatt, Fassung X, je 200 Duelle je Karte, Kontrollzahl 50-51 %.
  // Spanne der belastbaren Karten:
  //
  //                 Feuerlande   Periodika   Aquaria
  //   aus (Tisch)      27,8 %      43,3 %     35,8 %
  //   15 % x1,5        25,7 %      39,0 %     35,2 %   <- Vorgabe
  //
  // Der Zufall hilft also, aber wenig: 0,6 bis 4,3 Punkte. Als Ersatz
  // fuer einen Regelhebel taugt er nicht – die doppelten Karten haben
  // die Spanne um 8 bis 11 Punkte gehoben.
  //
  // Die Staerke ist trotzdem richtig gewaehlt, und das ist jetzt
  // gemessen statt geschaetzt (Feuerlande):
  //   10 % x1,5   Spanne 28,9 %   syntheseLohnt 44,4 %
  //   15 % x1,5   Spanne 27,2 %                 45,1 %   genommen
  //   20 % x2     Spanne 29,0 %                 39,8 %   kostet Anreiz
  //                                                      und bringt
  //                                                      keine Spanne
  // Anders als 2026 zuerst notiert reisst 20 % x2 die Schwelle von 8 %
  // NICHT (Vorsprung 22,8 %) – seit Fassung IX/X haben die Verbindungen
  // dafuer zu viel Luft. Es lohnt nur trotzdem nicht.
  //
  // Die Kontrollzahl bleibt in allen Laeufen bei rund 50 % – der Zufall
  // bevorzugt also keine Seite, er macht nur die Rangfolge unschaerfer.
  // Genau das ist der Zweck: Die staerkste Karte soll nicht mehr jedes
  // Duell gewinnen.
  appZusatz: {
    volltreffer: { chance: 0.15, faktor: 1.5 }
  },

  // --- Klassenfarben: nicht mehr hier -------------------------
  // Sie standen bis zum 12.08.2026 als Kopie an dieser Stelle, die
  // massgebliche Fassung in Karten\generator.html. Beide sind jetzt
  // in App\kern\kartenstil.js zusammengefuehrt (window.KARTENSTIL).
  // Eine Farbe ist keine Spielregel: Diese Datei beantwortet, was
  // passiert, kartenstil.js, wie es aussieht.

  // Welche Klasse welche LP-Stufe haben soll (Regelwerk, Abschnitt 2):
  // "Elemente 30 LP · Verbindungen 50 LP · legendäre Elementals 60 LP".
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
