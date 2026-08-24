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

  // Was eine APP-ATTACKE (Feld "appAttacke") wirken darf. Eine eigene
  // Liste, nicht ausruestungsWirkungen: "blick" und "dauerbonus"
  // gehoeren keiner Attacke, und die Trennung ist die Stelle, an der
  // pruefer.js greift.
  //
  // Alle vier gelten NUR in der App (appRegeln.appAttacken):
  //   schutz     einen Schadenstyp schwaechen – gibt es schon, hier
  //              mit "gegen" auf Wucht, Feuer oder Gas und "minus"
  //              statt "faktor"
  //   heilung    Lebenspunkte zurueckgeben – gibt es schon
  //   vernebeln  senkt die Trefferquote des Gegners (haengt an
  //              appZusatz.treffer, also an "Daneben")
  //   gift       Schaden am Ende des naechsten gegnerischen Zuges
  appAttackenWirkungen: ["schutz", "heilung", "vernebeln", "gift"],

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

  // --- Abschnitt 4: Wer rueckt nach? --------------------------
  // Gedruckt steht seit jeher: "Sein Besitzer WAEHLT sofort (ohne einen
  // Zug zu verbrauchen) ein neues aktives Elemental von der Bank."
  // Die Engine hat bis zum 24.08.2026 stattdessen stumm den ersten
  // Bankplatz genommen – eine Abweichung vom Regelwerk, keine Regel.
  //
  // Das ist mehr als Bequemlichkeit: Wer waehlen darf, kann nach dem
  // Erschoepfen auf den Typ des Gegners antworten, und die Bank hoert
  // auf, eine Warteschlange zu sein.
  //
  // Auf false steht wieder die alte Automatik – als Messvariante
  // ("nachruecken-automatisch"), damit sich beziffern laesst, was die
  // freie Wahl im Gleichgewicht bewegt.
  nachrueckenWaehlen: true,

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
    volltreffer: { chance: 0.15, faktor: 1.5 },

    // --- Daneben und Ausweichen (22.08.2026) ------------------
    // Nicht jeder Treffer sitzt. Jede Schadensattacke trifft zu 95 %.
    //
    // FLACH, und das ist ein Meßergebnis, keine Bequemlichkeit.
    // Geplant war eine Leiter, die am gedruckten Grundschaden haengt
    // ("wer weit ausholt, trifft seltener": 100/90/80 ueber die
    // Schwellen 10 und 20). Gemessen wurde sie am 22.08.2026 und
    // faellt aus, weil sie den GRUNDSATZ des Spiels verletzt.
    //
    // Der Grund liegt im Kartensatz: "starke Attacke" und "Verbindung"
    // sind hier dasselbe.
    //
    //   Mittlerer Schaden     Elemente  9,6   Verbindungen 11,4
    //   Anteil Verbindungen an allen Wucht-Attacken   74 % (Periodika)
    //   Anteil Verbindungen an allen Feuer-Attacken   18 % (Periodika)
    //
    // Eine Trefferstrafe, die an der Staerke einer Attacke haengt, ist
    // deshalb eine Steuer auf das Synthetisieren – und die trifft den
    // fachlichen Kern des Spiels. Gemessen, Periodika, 400 Duelle je
    // Karte, zwei Saaten, App mit Volltreffer (Schwelle: vorsprung
    // >= 8 % und syntheseLohnt > 0):
    //
    //   Form                        vorsprung      Grundsatz
    //   aus (Tisch)                 10,0 / 10,4 %  ja
    //   Leiter 100/90/80             5,4 /  4,7 %  NEIN
    //   Typquoten F92 W85 G97 Ae92   5,0 /  3,9 %  NEIN
    //   Typquoten, mildeste Fassung  5,9 /  5,4 %  NEIN
    //   flach 95 %                   8,7 /  8,0 %  ja    <- genommen
    //   flach 97 %                   9,5 /  8,8 %  ja
    //
    // Eine Leiter KANN in diesem Kartensatz gar nichts anderes tun:
    // Der Schaden reicht nur von 5 bis 18 (schadenSpanne erlaubt 0-40),
    // und die Masse liegt bei 10 (Elemente) und 13 (Verbindungen). Eine
    // Bandgrenze zwischen 10 und 13 IST die Trennung Element/Verbindung;
    // eine Grenze darueber wirkt gar nicht. Drei geprueft Leitern mit
    // Grenze bei 15 lieferten Zahlen, die auf die Stelle genau dem
    // Tischspiel entsprachen – sie feuerten nie.
    //
    // Die flache Quote wirkt dabei nicht schwaecher: Spanne der
    // belastbaren Karten in Periodika 32,3 -> 28,7 %, in Feuerlande
    // 24,8 -> 22,5 %. Der Preis sind rund eine Runde mehr je Duell.
    //
    // Wollte man die Leiter doch, muesste zuerst der Schaden ueber die
    // erlaubte Spanne gespreizt werden, so dass Staerke nicht mehr mit
    // "Verbindung" zusammenfaellt. Das aendert die gedruckten Karten
    // und ist ein eigenes Vorhaben.
    //
    // Attacken mit Schaden 0 wuerfeln NIE. Der Zinkpanzer ist keine
    // Attacke, die danebengehen kann – er ist eine Wirkung, die als
    // Attacke gedruckt ist. Ein Wurf wuerde solche Karten grundlos
    // entwerten.
    //
    // ACHTUNG beim Messen: Zusammen mit dem Volltreffer hat ein Angriff
    // jetzt DREI Ausgaenge (daneben – Treffer – Volltreffer). Die
    // 15 % x1,5 des Volltreffers wurden gegen ein Spiel ohne
    // Fehlschlaege gemessen; beide Zufallsquellen gehoeren zusammen
    // gemessen, nie nacheinander bewertet.
    //
    // Beide widerlegten Formen bleiben als Bauform stehen, damit sie
    // sich gegenmessen lassen (varianten.js, "daneben-*"):
    //   leiter: [{ bisSchaden, quote }, …]  erste passende Sprosse gilt
    //   jeTyp:  { Feuer: 0.9, Wucht: 0.8, … }  hat Vorrang vor leiter
    treffer: {
      leiter: [
        { bisSchaden: 99, quote: 0.95 }
      ]
    },

    // --- Kostet eine App-Attacke den Zug? ---------------------
    // Zur Messung offen, Vorgabe aus. Der Hintergrund ist derselbe wie
    // bei der Ausruestung in Fassung X: Ein Zug ohne Schaden, der rund
    // 5 Schaden verhindert, ist ein Verlustgeschaeft, wenn ein Zug rund
    // 11 Schaden macht. Gemessen am 22.08.2026 hat der Bot deshalb 9
    // von 11 App-Attacken NIE gespielt – nur Zinksalbe (Heilung) und
    // ganz vereinzelt den Aetzenden Hauch.
    //
    // Steht der Wert auf true, ist HOECHSTENS EINE App-Attacke je Zug
    // frei (wie syntheseProZug: 1), sonst stuende das Duell still.
    appAttackeIstFreieAktion: false,

    // --- Wie lange haelt ein Schutz? (24.08.2026) -------------
    // Wie viele eigene Zuege ueberlebt ein Schutz, der aus einer
    // APP-ATTACKE stammt. Bis hierher war es einer ("bis zu deinem
    // naechsten Zug"), und genau das war das Problem:
    //
    // Gemessen am 23.08.2026 ueber alle acht Regionen, 400 Duelle je
    // Region, hat der Bot von 24 Schutz-App-Attacken KEINE EINZIGE je
    // gespielt (heilung 3 von 9, vernebeln 1 von 11, gift 1 von 14,
    // schutz 0 von 24). Der Grund steht in derselben Zeile: Ein Zug
    // ohne Schaden, der 5 Schaden verhindert, ist ein Verlustgeschaeft,
    // wenn ein Zug rund 11 Schaden macht. Bei zwei Runden sind es bis zu
    // 10 – erst damit wird die Karte ueberhaupt eine Entscheidung.
    //
    // ZWEI, NICHT DREI – und das ist eine Entscheidung des Nutzers, keine
    // Rechnung: Drei Runden haben sich am Bildschirm zu lang angefuehlt.
    // Gemessen wurden beide (24.08.2026, 200 Duelle je Karte, zwei
    // Saaten); die Zahlen stehen in App\LIESMICH.md. Kurz: Drei Runden
    // heben vorsprung und syntheseLohnt etwas hoeher, verbreitern aber
    // auch die Spanne staerker. Der Unterschied ist klein genug, dass
    // das Spielgefuehl entscheiden darf – so wie bei den Fassungen IX
    // und X, die ebenfalls aus dem Spielen kamen und nicht aus einer
    // Kennzahl.
    //
    // GILT NICHT FUER AUSRUESTUNG. Loeschdecke, Schutzbrille und
    // Erlenmeyerkolben tragen "bis zu deinem naechsten Zug" GEDRUCKT auf
    // dem Kartenbild; sie duerfen ohne Neudruck nichts anderes bedeuten.
    // Die Trennung macht engine.js ueber das Feld "herkunft" in
    // wirkungAnwenden. App-Attacken stehen auf keinem Druckbogen
    // (generator.html liest nur "attacken") – dort kostet es nichts.
    //
    // ACHTUNG: Wer diesen Wert aendert, muss die 26 Kartentexte in
    // karten-daten.js mitaendern ("zwei Runden lang"). pruefer.js meldet
    // es, wenn Text und Zahl auseinanderlaufen – es prueft das Zahlwort,
    // nicht mehr nur einen einzelnen Satz.
    // Gegenmessen laesst sich beides ueber die Varianten
    // "schutz-1-runde" und "schutz-3-runden" (varianten.js).
    schutzRunden: 2,

    // --- Bank-Synergien (22.08.2026) --------------------------
    // Wer inaktiv auf der Bank steht, tat bisher genau nichts, bis er
    // nachrueckte. Hier bekommt die Bank eine Rolle: Elementals, die
    // fachlich zusammengehoeren, staerken das aktive.
    //
    // Kuratierte Tabelle wie die typenMatrix – jede Zeile mit
    // Begruendung. NICHT automatisch aus "eigenschaften": Dort stehen
    // ueber hundert Schlagwoerter, darunter "weiß", "klangvoll" und
    // "Glücksbringer". Eine Synergie auf "goldglänzend" waere Unsinn.
    //
    // geltung:
    //   "bank-zu-aktiv"  Ein Elemental auf der Bank teilt ein Merkmal
    //                    mit dem aktiven. Braucht "mindestens".
    //   "team"           Das GANZE Team traegt das Merkmal.
    //
    // bedingung:
    //   { gleich: "hauptgruppe" | "klasse" }   Uebereinstimmung
    //   { alle: "<merkmal>" }                  jede Karte traegt es
    //   { eines: "<merkmal>" }                 mindestens eine
    //
    // ACHTUNG BEIM BALANCIEREN: Synergien belohnen ein volles,
    // sortenreines Team – die Synthese verkleinert es. Wer zwei
    // Elemente verschmilzt, verliert einen Bankplatz und womoeglich
    // seine Synergie. Das ist derselbe Mechanismus, der die Synthese
    // bis Fassung VII zum Verlustgeschaeft gemacht hat. syntheseLohnt
    // ist hier keine Kennzahl unter mehreren, sondern die
    // ABBRUCHBEDINGUNG (Schwelle grundsatz.mindestVorsprung).
    //
    // Deshalb steht "Verwandte Stoffklasse" mit in der Tabelle: Sie
    // gilt auch zwischen VERBINDUNGEN (Oxid neben Oxid), damit die
    // Synthese eine Synergie verschiebt statt sie zu zerstoeren.
    // Hoechstens EINE Synergie gilt gleichzeitig. Ohne Grenze stapeln
    // sie sich: In Feuerlande griffen "Verwandte Stoffklasse" (35 % der
    // Runden) und "Brennstoff im Ruecken" (31 %) oft zusammen. Bei
    // einem Grundschaden von rund 11 sind +10 kein Bonus mehr.
    synergienMax: 1,

    // "inKraft: false" heisst: gebaut, chemisch richtig, gemessen – und
    // NICHT im Spiel. Die Zeile bleibt stehen, damit sie sich
    // gegenmessen laesst, so wie zuendungNoetig stehen geblieben ist.
    //
    // ============================================================
    //  DAS ERGEBNIS VOM 22.08.2026 IN EINEM SATZ:
    //  Eine Synergie, die nur ELEMENTE tragen koennen, bestraft das
    //  Synthetisieren – denn die Synthese verbraucht genau diese
    //  Elemente. Eine Synergie, die auch eine VERBINDUNG tragen kann,
    //  tut das nicht; sie belohnt es sogar.
    // ============================================================
    //
    // Gemessen (400 Duelle je Karte, zwei Saaten, alle uebrigen
    // App-Regeln an; Schwelle vorsprung >= 8 % UND syntheseLohnt > 0):
    //
    //   Fassung                       Periodika vorsprung   Grundsatz
    //   ohne Synergien                    9,7 / 9,1 %       ja
    //   alle fuenf, Staerke 5, gestapelt  0,8 / 0,1 %       NEIN  (!)
    //   alle fuenf, Staerke 5, max 1      3,9 / 3,4 %       NEIN
    //   alle fuenf, Staerke 2, max 1      7,2 / 6,6 %       NEIN
    //   alle fuenf, Staerke 1, max 1      6,9 / 6,9 %       NEIN
    //   nur Stoffklasse, Staerke 3       10,7 / 10,5 %      ja    <- genommen
    //   nur Stoffklasse, Staerke 2       11,0 / 10,5 %      ja
    //   nur Stoffklasse, Staerke 5       11,3 / 10,3 %      ja
    //
    // Bei "alle fuenf, Staerke 5" fiel syntheseLohnt sogar unter NULL
    // (-3,6 %): Wer synthetisierte, verlor. Das ist der Grundsatz des
    // Spiels, und deshalb ist die Sache entschieden.
    //
    // Staerke 3 gewaehlt, nicht 2: Sie bringt in Feuerlande die groesste
    // Verbesserung der Spanne (22,7 -> 19,4 % und 22,0 -> 17,7 %) und
    // hebt Periodikas vorsprung trotzdem ueber den Ausgangswert. Der
    // Preis ist eine um 2 bis 3 Punkte breitere Spanne in Periodika.
    synergien: [
      // Seit dem 24.08.2026 mit "nurVerbindungen": Die Zeile zaehlt nur
      // noch zwischen VERBINDUNGEN – Oxid neben Oxid, Sulfid neben
      // Sulfid. Zwei Alkalimetalle auf der Bank zaehlen nicht mehr.
      //
      // Zwei Gruende, und beide zeigen in dieselbe Richtung:
      //
      // 1. Der Wunsch aus dem Spielen: "Im eigenen Zug Verbindungen aus
      //    den Elementen der Bank bilden, um Synergien freizuschalten."
      //    Genau das tut diese Fassung – vorher war die Synergie schon
      //    da, BEVOR man etwas gebaut hatte.
      // 2. Der offene Befund vom 23.08.2026: In der bisherigen Fassung
      //    drueckte diese Zeile ab Erdhuegel syntheseLohnt unter NULL
      //    (Erdhuegel 4,0 -> -2,1 %, Acidia 3,1 -> -3,2 %, Organica
      //    0,4 -> -5,6 %) und war dort der groesste einzelne
      //    Negativposten – groesser als Volltreffer und Daneben
      //    zusammen. Der Grund ist das Gesetz des Kartensatzes: Je
      //    groesser der Pool, desto mehr ELEMENTE teilen sich eine
      //    Klasse, und die Synthese verbraucht genau die.
      //
      // Der Weg zurueck bleibt als Variante "synergie-klasse-alle".
      { name: "Verwandte Stoffklasse", inKraft: true,
        geltung: "bank-zu-aktiv", mindestens: 1,
        bedingung: { gleich: "klasse", nurVerbindungen: true },
        wirkung: { art: "schadensbonus", wert: 3 },
        begruendung: "Stoffe derselben Klasse reagieren nach demselben Muster – " +
          "zwei Oxide, zwei Salze, zwei Alkane. Die einzige Zeile, die eine " +
          "Verbindung genauso tragen kann wie ein Element: Wer zwei Oxide " +
          "nebeneinander stellt, hat sie – und die Synthese schafft Oxide." },

      // --- Gebaut, gemessen, nicht in Kraft ---------------------
      // Alle vier belohnen ELEMENTE auf der Bank. Genau die verbraucht
      // die Synthese, und damit bestrafen sie den fachlichen Kern des
      // Spiels. Sie wieder einzuschalten lohnt erst, wenn Verbindungen
      // eigene Merkmale tragen, an denen Synergien haengen koennen.
      { name: "Gleiche Hauptgruppe", inKraft: false,
        geltung: "bank-zu-aktiv", mindestens: 1,
        bedingung: { gleich: "hauptgruppe" },
        wirkung: { art: "schadensbonus", wert: 3 },
        begruendung: "Elemente einer Hauptgruppe haben gleich viele Außenelektronen " +
          "und reagieren ähnlich. In Feuerlande griff sie in 0 % der Runden – " +
          "dort gibt es keine Karte mit Hauptgruppen-Klasse." },

      { name: "Metallischer Verbund", inKraft: false,
        geltung: "team",
        bedingung: { alle: "metallisch" },
        wirkung: { art: "schutz", gegen: "alle", minus: 1 },
        begruendung: "Metalle leiten Wärme und Energie ab, statt sie aufzunehmen. " +
          "Ein Oxid ist nicht metallisch – jede Synthese bricht den Verbund." },

      { name: "Schutzgas", inKraft: false,
        geltung: "bank", mindestens: 1,
        bedingung: { eines: "reaktionsträge" },
        wirkung: { art: "schutz", gegen: "Feuer", minus: 3 },
        begruendung: "Ein reaktionsträges Gas verdrängt den Sauerstoff – genau dafür " +
          "wird beim Schweißen Argon eingesetzt. Griff in Periodika in 24 % der " +
          "Runden und war dort einer der beiden Hauptgründe für den Einbruch." },

      { name: "Brennstoff im Rücken", inKraft: false,
        geltung: "bank", mindestens: 1,
        bedingung: { eines: "brennbar" },
        wirkung: { art: "schadensbonus", wert: 3, typ: "Feuer" },
        begruendung: "Wer Brennstoff im Team hat, hält die Flamme in Gang. Dasselbe " +
          "Bild wie brennstoffBonus, nur aufs Team bezogen. Griff in 25 bis 31 % " +
          "der Runden – und der Brennstoff ist immer ein Element." }
    ]
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
