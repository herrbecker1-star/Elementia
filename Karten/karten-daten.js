// ============================================================
//  ELEMENTAL-KARTEN – Datenquelle für generator.html
//  Regionen: Feuerlande (3.1) + Periodika (3.2, PSE/Atombau)
//            + Aerosol (3.3, Gase/Moleküle) + Aquaria (3.4, Wasser)
//            + Salzküste (3.5, Salze/Ionenbindung)
//            + Erdhügel (3.6, Metalle/Redox/Legierungen)
//            + Acidia (3.8, Säuren und Laugen)
//            + Organica (3.9–3.12, organische Chemie; Teil I+II)
//
//  HIER pflegst du alle Karteninhalte. Der Generator liest nur
//  diese Datei. Einfach in einem Texteditor bearbeiten, speichern
//  und generator.html im Browser neu laden.
//
//  Felder:
//   name/formel   Stoffname und chemische Formel
//   region        Feuerlande | Periodika | Aerosol | Aquaria | Salzküste | Erdhügel
//                 (fehlt das Feld → Feuerlande)
//   klasse        Nichtmetall | Metall | Oxid | Sulfid | Ausrüstung
//                 | Alkalimetall | Erdalkalimetall | Halogen | Edelgas
//                 | Salz | Hydroxid | Molekül | Legierung | Säure
//                 | Alkan | Alken | Alkin | Alkanol | Aldehyd
//                 | Carbonsäure | Ester | Legendär (Organica)
//   oz            Ordnungszahl (nur Elemente; wird auf der Karte gezeigt)
//   lp            Lebenspunkte: Element 30 | Verbindung 40 | Legendär 50
//   masse         Teilchenmasse in u (gerundet) – Steckbrief-Wert; sie
//                 entscheidet, wer das Duell beginnt (der Leichtere)
//   eigenschaften Stoffeigenschafts-Tags (steuern Stärken/Schwächen)
//   attacken      typ: Feuer | Wucht | Gas | Ätz
//   synthese      Wortgleichung + Massen-Bilanz; aktivierung=true → ⚡
//                 exotherm: Sofortschaden beim Gegner
//   besonderheit  Sonderregel der Karte
//   flavor        Stimmungstext
//   quest         Wo die Karte erspielt wird
//   bild          Entweder ein Dateiname, z. B. "bilder/schwefel.jpg",
//                 oder ein Emoji als Platzhalter. Der Generator erkennt
//                 die Datei am enthaltenen Punkt. Feuerlande ist
//                 vollständig bebildert, die übrigen Regionen tragen
//                 noch Emojis. Dateinamen folgen App\kern\dateiname.js:
//                 klein, ohne Umlaute, Bindestriche statt Leerzeichen.
// ============================================================

window.KARTEN_DATEN = {
  "meta": {
    "titel": "Elemental – Elementia",
    "regionen": ["Feuerlande", "Periodika", "Aerosol", "Aquaria", "Salzküste", "Erdhügel", "Acidia", "Organica"],
    "kartenBreiteMM": 63.5,
    "kartenHoeheMM": 88.9
  },
  "karten": [

    // ---------- STARTER-ELEMENTALS ----------
    {
      "name": "Eisen", "formel": "Fe", "klasse": "Metall", "lp": 30, "masse": 56,
      "eigenschaften": ["fest", "metallisch", "magnetisch"],
      "attacken": [
        { "name": "Schmiedehieb", "typ": "Wucht", "schaden": 10, "effekt": "" },
        { "name": "Funkenregen", "typ": "Feuer", "schaden": 10, "effekt": "" }
      ],
      "synthese": null,
      "besonderheit": "",
      "flavor": "Rot glüht das Blut der Esse.",
      "quest": "Starter – Schmiede", "bild": "bilder/eisen.jpg"
    },
    {
      "name": "Magnesium", "formel": "Mg", "klasse": "Metall", "lp": 30, "masse": 24,
      "eigenschaften": ["fest", "metallisch", "brennbar"],
      "attacken": [
        { "name": "Weißglut", "typ": "Feuer", "schaden": 10, "effekt": "" },
        { "name": "Blendlicht", "typ": "Feuer", "schaden": 5, "effekt": "Geblendet: Die nächste Attacke des Gegners macht nur halben Schaden." }
      ],
      "synthese": null,
      "besonderheit": "",
      "flavor": "Ein Funke aus Mutters Garten – grün das Blatt, grell die Flamme.",
      "quest": "Starter – Garten", "bild": "bilder/magnesium.jpg"
    },

    // ---------- WEITERE ELEMENTE ----------
    {
      "name": "Kohlenstoff", "formel": "C", "klasse": "Nichtmetall", "lp": 30, "masse": 12,
      "eigenschaften": ["fest", "brennbar", "schwarz"],
      "attacken": [
        { "name": "Glutkohle", "typ": "Feuer", "schaden": 10, "effekt": "" },
        { "name": "Rußschleier", "typ": "Gas", "schaden": 5, "effekt": "Die nächste Attacke des Gegners macht 5 Schaden weniger." }
      ],
      "synthese": null,
      "besonderheit": "",
      "flavor": "Aus der Köhlerglut von Stoffingen geboren.",
      "quest": "Quest 1 – Stoffingen", "bild": "bilder/kohlenstoff.jpg"
    },
    {
      "name": "Kupfer", "formel": "Cu", "klasse": "Metall", "lp": 30, "masse": 64,
      "eigenschaften": ["fest", "metallisch", "rotglänzend"],
      "attacken": [
        { "name": "Blankhieb", "typ": "Wucht", "schaden": 10, "effekt": "" },
        { "name": "Grüne Flamme", "typ": "Feuer", "schaden": 10, "effekt": "" }
      ],
      "synthese": null,
      "besonderheit": "",
      "flavor": "Der Kessel der Ahnen, blank poliert.",
      "quest": "Quest 1 – Stoffingen", "bild": "bilder/kupfer.jpg"
    },
    {
      "name": "Zink", "formel": "Zn", "klasse": "Metall", "lp": 30, "masse": 65,
      "eigenschaften": ["fest", "metallisch", "bläulich"],
      "attacken": [
        { "name": "Wuchtstoß", "typ": "Wucht", "schaden": 10, "effekt": "" },
        { "name": "Zinkpanzer", "typ": "Wucht", "schaden": 0, "effekt": "Zink erleidet bis zu deinem nächsten Zug nur halben Schaden." }
      ],
      "synthese": null,
      "besonderheit": "",
      "flavor": "Ein stiller Wächter vor dem Rost.",
      "quest": "Quest 1 – Stoffingen", "bild": "bilder/zink.jpg"
    },
    {
      "name": "Schwefel", "formel": "S", "klasse": "Nichtmetall", "lp": 30, "masse": 32,
      "eigenschaften": ["fest", "brennbar", "gelb"],
      "attacken": [
        { "name": "Blaue Flamme", "typ": "Feuer", "schaden": 10, "effekt": "" },
        { "name": "Schwefelhauch", "typ": "Ätz", "schaden": 10, "effekt": "" }
      ],
      "synthese": null,
      "besonderheit": "",
      "flavor": "Das zitronengelbe Pulver aus Maras Rätselkiste – kein Metall, aber voller Feuer.",
      "quest": "Quest 1 – Stoffingen", "bild": "bilder/schwefel.jpg"
    },
    {
      "name": "Stickstoff", "formel": "N₂", "klasse": "Nichtmetall", "lp": 30, "masse": 28,
      "eigenschaften": ["gasförmig", "erstickend", "reaktionsträge"],
      "attacken": [
        { "name": "Erstickender Griff", "typ": "Gas", "schaden": 5, "effekt": "Der Gegner darf in seinem nächsten Zug keine Feuer-Attacke einsetzen." }
      ],
      "synthese": null,
      "besonderheit": "Reaktionsträge: Stickstoff erleidet durch Ätz-Attacken keinen Schaden.",
      "flavor": "Es schläft in jedem Atemzug – vier Fünftel der Luft.",
      "quest": "Quest 3 – Teilchin", "bild": "bilder/stickstoff.jpg"
    },
    {
      "name": "Sauerstoff", "formel": "O₂", "klasse": "Nichtmetall", "lp": 30, "masse": 32,
      "eigenschaften": ["gasförmig", "brandfördernd"],
      "attacken": [
        { "name": "Brandwind", "typ": "Feuer", "schaden": 10, "effekt": "" },
        { "name": "Anfachen", "typ": "Gas", "schaden": 0, "effekt": "Deine nächste Feuer-Attacke macht doppelten Schaden." }
      ],
      "synthese": null,
      "besonderheit": "",
      "flavor": "Unsichtbar – doch ohne mich stirbt jede Flamme.",
      "quest": "Quest 5 – Kerzing", "bild": "bilder/sauerstoff.jpg"
    },
    {
      "name": "Phosphor", "formel": "P", "klasse": "Nichtmetall", "lp": 30, "masse": 31,
      "eigenschaften": ["fest", "brennbar", "giftig"],
      "attacken": [
        { "name": "Weiße Glut", "typ": "Feuer", "schaden": 15, "effekt": "Phosphor erleidet dabei selbst 5 Schaden.",
          "wirkung": { "art": "selbstschaden", "wert": 5 } },
        { "name": "Giftnebel", "typ": "Gas", "schaden": 10, "effekt": "" }
      ],
      "synthese": null,
      "besonderheit": "Selbstentzündung: Wird Phosphor eingewechselt, erleidet das aktive Elemental des Gegners sofort 5 Schaden. (Phosphor braucht keine Aktivierungsenergie!)",
      "flavor": "Es glimmt im Dunkeln und wartet.",
      "quest": "Quest 9 – Energenium", "bild": "bilder/phosphor.jpg"
    },
    {
      "name": "Wasserstoff", "formel": "H₂", "klasse": "Nichtmetall", "lp": 30, "masse": 2,
      "eigenschaften": ["gasförmig", "brennbar", "federleicht"],
      "attacken": [
        { "name": "Knallgas-Funke", "typ": "Feuer", "schaden": 10, "effekt": "" }
      ],
      "synthese": null,
      "besonderheit": "Knallgas: Trifft eine Feuer-Attacke H₂, explodiert es – beide aktiven Elementals erleiden 15 Schaden.",
      "flavor": "Das kleinste Wesen Elementias. Unterschätze es nicht.",
      "quest": "Quest 12 – Daltons Haus", "bild": "bilder/wasserstoff.jpg"
    },

    // ---------- OXIDE ----------
    {
      "name": "Magnesiumoxid", "formel": "MgO", "klasse": "Oxid", "lp": 40, "masse": 40,
      "eigenschaften": ["fest", "weiß"],
      "attacken": [
        { "name": "Weißglanz-Schlag", "typ": "Wucht", "schaden": 10, "effekt": "" },
        { "name": "Basenbiss", "typ": "Ätz", "schaden": 10, "effekt": "" }
      ],
      "synthese": {
        "wortgleichung": "Magnesium + Sauerstoff → Magnesiumoxid",
        "bilanz": "48 u + 32 u = 80 u (zwei Teilchen à 40 u)",
        "edukte": ["Magnesium", "Sauerstoff"],
        "aktivierung": true, "exotherm": 5
      },
      "besonderheit": "",
      "flavor": "Weißer als Schnee, geboren aus blendendem Licht.",
      "quest": "Quest 7 – Oxide", "bild": "bilder/magnesiumoxid.jpg"
    },
    {
      "name": "Kohlenstoffdioxid", "formel": "CO₂", "klasse": "Oxid", "lp": 40, "masse": 44,
      "eigenschaften": ["gasförmig", "erstickend"],
      "attacken": [
        { "name": "Erstickungswolke", "typ": "Gas", "schaden": 5, "effekt": "Der Gegner darf in seinem nächsten Zug keine Feuer-Attacke einsetzen." },
        { "name": "Schwerer Fall", "typ": "Wucht", "schaden": 10, "effekt": "" }
      ],
      "synthese": {
        "wortgleichung": "Kohlenstoff + Sauerstoff → Kohlenstoffdioxid",
        "bilanz": "12 u + 32 u = 44 u – nichts geht verloren!",
        "edukte": ["Kohlenstoff", "Sauerstoff"],
        "aktivierung": true, "exotherm": 5
      },
      "besonderheit": "",
      "flavor": "Der schwere Atem der Feuer. Kerzen ersticken in seiner Nähe.",
      "quest": "Quest 7 – Oxide", "bild": "bilder/kohlenstoffdioxid.jpg"
    },
    {
      "name": "Eisenoxid", "formel": "FeO", "klasse": "Oxid", "lp": 40, "masse": 72,
      "eigenschaften": ["fest", "dunkel"],
      "attacken": [
        { "name": "Rostbiss", "typ": "Ätz", "schaden": 10, "effekt": "" },
        { "name": "Zunderbrocken", "typ": "Wucht", "schaden": 10, "effekt": "" }
      ],
      "synthese": {
        "wortgleichung": "Eisen + Sauerstoff → Eisenoxid",
        "bilanz": "112 u + 32 u = 144 u (zwei Teilchen à 72 u)",
        "edukte": ["Eisen", "Sauerstoff"],
        "aktivierung": true, "exotherm": 5
      },
      "besonderheit": "",
      "flavor": "Zunder von der Esse des Vaters.",
      "quest": "Quest 7 – Oxide", "bild": "bilder/eisenoxid.jpg"
    },
    {
      "name": "Kupferoxid", "formel": "CuO", "klasse": "Oxid", "lp": 40, "masse": 80,
      "eigenschaften": ["fest", "schwarz"],
      "attacken": [
        { "name": "Schwarzmantel", "typ": "Wucht", "schaden": 10, "effekt": "" },
        { "name": "Sauerstoffgabe", "typ": "Feuer", "schaden": 10, "effekt": "" }
      ],
      "synthese": {
        "wortgleichung": "Kupfer + Sauerstoff → Kupferoxid",
        "bilanz": "127 u + 32 u = 159 u (zwei Teilchen à 80 u)",
        "edukte": ["Kupfer", "Sauerstoff"],
        "aktivierung": true, "exotherm": 5
      },
      "besonderheit": "",
      "flavor": "Schwarzer Mantel über altem Glanz.",
      "quest": "Quest 7 – Oxide", "bild": "bilder/kupferoxid.jpg"
    },
    {
      "name": "Zinkoxid", "formel": "ZnO", "klasse": "Oxid", "lp": 40, "masse": 81,
      "eigenschaften": ["fest", "weiß"],
      "attacken": [
        { "name": "Weißer Rauch", "typ": "Gas", "schaden": 10, "effekt": "" },
        { "name": "Pulverstoß", "typ": "Wucht", "schaden": 10, "effekt": "" }
      ],
      "synthese": {
        "wortgleichung": "Zink + Sauerstoff → Zinkoxid",
        "bilanz": "131 u + 32 u = 163 u (zwei Teilchen à 81 u)",
        "edukte": ["Zink", "Sauerstoff"],
        "aktivierung": true, "exotherm": 5
      },
      "besonderheit": "",
      "flavor": "Weißer Rauch, der im Wind über Massenhall tanzt.",
      "quest": "Quest 7 – Oxide", "bild": "bilder/zinkoxid.jpg"
    },
    {
      "name": "Wasser", "formel": "H₂O", "klasse": "Oxid", "lp": 40, "masse": 18,
      "eigenschaften": ["flüssig", "löschend"],
      "attacken": [
        { "name": "Dampfstoß", "typ": "Wucht", "schaden": 10, "effekt": "" },
        { "name": "Heißer Dampf", "typ": "Gas", "schaden": 10, "effekt": "" }
      ],
      "synthese": {
        "wortgleichung": "Wasserstoff + Sauerstoff → Wasser (Knallgas-Reaktion!)",
        "bilanz": "4 u + 32 u = 36 u (zwei Teilchen à 18 u)",
        "edukte": ["Wasserstoff", "Sauerstoff"],
        "aktivierung": true, "exotherm": 5
      },
      "besonderheit": "Löscht: Feuer-Attacken gegen Wasser richten keinen Schaden an.",
      "flavor": "Des Feuers ältester Feind.",
      "quest": "Quest 10 – Massenhall", "bild": "bilder/wasser.jpg"
    },
    {
      "name": "Schwefeldioxid", "formel": "SO₂", "klasse": "Oxid", "lp": 40, "masse": 64,
      "eigenschaften": ["gasförmig", "ätzend", "stechend"],
      "attacken": [
        { "name": "Ätzender Atem", "typ": "Ätz", "schaden": 10, "effekt": "" },
        { "name": "Stechender Geruch", "typ": "Gas", "schaden": 5, "effekt": "Der Gegner muss sein aktives Elemental auswechseln (wenn er kann)." }
      ],
      "synthese": {
        "wortgleichung": "Schwefel + Sauerstoff → Schwefeldioxid",
        "bilanz": "32 u + 32 u = 64 u – nichts geht verloren!",
        "edukte": ["Schwefel", "Sauerstoff"],
        "aktivierung": true, "exotherm": 5
      },
      "besonderheit": "",
      "flavor": "„Fürchte nicht die Flamme. Die Gase verätzen dir die Atemwege.“",
      "quest": "Quest 13 – Berzelius", "bild": "bilder/schwefeldioxid.jpg"
    },

    // ---------- SULFIDE ----------
    {
      "name": "Eisensulfid", "formel": "FeS", "klasse": "Sulfid", "lp": 40, "masse": 88,
      "eigenschaften": ["fest", "grauschwarz"],
      "attacken": [
        { "name": "Glutzorn", "typ": "Feuer", "schaden": 10, "effekt": "" },
        { "name": "Eisenschwefelhieb", "typ": "Wucht", "schaden": 10, "effekt": "" }

      ],
      "synthese": {
        "wortgleichung": "Eisen + Schwefel → Eisensulfid",
        "bilanz": "56 u + 32 u = 88 u – nichts geht verloren!",
        "edukte": ["Eisen", "Schwefel"],
        "aktivierung": true, "exotherm": 5
      },
      "besonderheit": "",
      "flavor": "Kein Magnet ruft es mehr – aus zwei Stoffen wurde ein neuer.",
      "quest": "Quest 8 – Sulfide", "bild": "bilder/eisensulfid.jpg"
    },
    {
      "name": "Zinksulfid", "formel": "ZnS", "klasse": "Sulfid", "lp": 40, "masse": 97,
      "eigenschaften": ["fest", "nachleuchtend"],
      "attacken": [
        { "name": "Schimmerblitz", "typ": "Gas", "schaden": 5, "effekt": "Leuchtet nach: Die nächste Attacke des Gegners macht 5 Schaden weniger." },
        { "name": "Kristallstoß", "typ": "Wucht", "schaden": 10, "effekt": "" }
      ],
      "synthese": {
        "wortgleichung": "Zink + Schwefel → Zinksulfid",
        "bilanz": "65 u + 32 u = 97 u – nichts geht verloren!",
        "edukte": ["Zink", "Schwefel"],
        "aktivierung": true, "exotherm": 5
      },
      "besonderheit": "",
      "flavor": "Es leuchtet nach, wenn das Licht längst fort ist.",
      "quest": "Quest 8 – Sulfide", "bild": "bilder/zinksulfid.jpg"
    },
    {
      "name": "Kupfersulfid", "formel": "CuS", "klasse": "Sulfid", "lp": 40, "masse": 96,
      "eigenschaften": ["fest", "blauschwarz"],
      "attacken": [
        { "name": "Schwarzglanz", "typ": "Wucht", "schaden": 10, "effekt": "" },
        { "name": "Schwefelbiss", "typ": "Ätz", "schaden": 10, "effekt": "" }
      ],
      "synthese": {
        "wortgleichung": "Kupfer + Schwefel → Kupfersulfid",
        "bilanz": "64 u + 32 u = 96 u – nichts geht verloren!",
        "edukte": ["Kupfer", "Schwefel"],
        "aktivierung": true, "exotherm": 5
      },
      "besonderheit": "",
      "flavor": "Die Alten nennen es Kupferglanz.",
      "quest": "Quest 8 – Sulfide", "bild": "bilder/kupfersulfid.jpg"
    },
    {
      "name": "Pyrit", "formel": "FeS₂", "klasse": "Sulfid", "legendaer": true, "lp": 40, "masse": 120,
      "eigenschaften": ["fest", "brennbar", "goldglänzend"],
      "attacken": [
        { "name": "Funkenschlag", "typ": "Feuer", "schaden": 10, "effekt": "" },
        { "name": "Kantenhieb", "typ": "Wucht", "schaden": 10, "effekt": "" }
      ],
      "synthese": null,
      "besonderheit": "Narrengold: Die erste Attacke jedes gegnerischen Elementals gegen Pyrit macht nur halben Schaden – es glänzt wie Gold, doch es ist keins. Aber Vorsicht: Pyrit ist brennbar – geröstet wird daraus Eisenoxid und Schwefeldioxid.",
      "flavor": "Narren hielten es für Gold. Weise schlugen Funken daraus.",
      "quest": "Quest 8 – Sulfide (legendär)", "bild": "bilder/pyrit.jpg"
    },

    // ---------- AUSRÜSTUNG ----------
    {
      "name": "Gasbrenner", "formel": "", "klasse": "Ausrüstung", "lp": null,
      "eigenschaften": ["Energie"],
      "attacken": [],
      "synthese": null,
      "besonderheit": "Lege den Gasbrenner ab, um eine ⚡-Synthese zu zünden ODER deine nächste Feuer-Attacke um 5 Schaden zu verstärken.",
      "flavor": "Wer die rauschende Flamme beherrscht, dem öffnet sich die Kunst der Verwandlung.",
      "quest": "Quest 2b – Brenner (Brennerführerschein)", "bild": "bilder/gasbrenner.jpg"
    },
    {
      "name": "Streichholz", "formel": "", "klasse": "Ausrüstung", "lp": null,
      "eigenschaften": ["Energie"],
      "attacken": [],
      "synthese": null,
      "besonderheit": "Lege das Streichholz ab, um eine ⚡-Synthese zu zünden (Aktivierungsenergie).",
      "flavor": "Ein kleiner Funke genügt – den Rest erledigt die Reaktion.",
      "quest": "Quest 2b – Brenner", "bild": "bilder/streichholz.jpg"
    },
    {
      "name": "Erlenmeyerkolben", "formel": "", "klasse": "Ausrüstung", "lp": null,
      "eigenschaften": ["Aufbewahrung"],
      "attacken": [],
      "synthese": null,
      "besonderheit": "Spiele den Erlenmeyerkolben auf ein gasförmiges Elemental: Es erleidet bis zu deinem nächsten Zug keinen Schaden – im engen Hals des Kolbens ist es sicher verwahrt.",
      "flavor": "Aus dem Kolbenwald: ein Glas, das den flüchtigsten Wesen ein sicheres Zuhause gibt.",
      "quest": "Quest 2 – Kolbenwald", "bild": "bilder/erlenmeyerkolben.jpg"
    },
    {
      "name": "Wunderkerze", "formel": "", "klasse": "Ausrüstung", "lp": null,
      "eigenschaften": ["Fest der Funken"],
      "attacken": [],
      "synthese": null,
      "besonderheit": "Lege ab: Die nächste Attacke deines aktiven Elementals macht +5 Schaden, und der geblendete Gegner macht bei seiner nächsten Attacke 5 Schaden weniger.",
      "flavor": "Beim Lichterfest von Kerzing regnet es kalte Sterne.",
      "quest": "Quest 5 – Kerzing", "bild": "bilder/wunderkerze.jpg"
    },
    {
      "name": "Löschdecke", "formel": "", "klasse": "Ausrüstung", "lp": null,
      "eigenschaften": ["Brandschutz"],
      "attacken": [],
      "synthese": null,
      "besonderheit": "Spiele die Löschdecke (auch außerhalb deines Zuges), wenn dein Elemental von einer Feuer-Attacke getroffen wird: Der Schaden wird 0. Ersticken statt löschen!",
      "flavor": "Kein Feuer brennt ohne Luft.",
      "quest": "Quest 6 – Feuerfurt", "bild": "bilder/loeschdecke.jpg"
    },
    {
      "name": "Sandeimer", "formel": "", "klasse": "Ausrüstung", "lp": null,
      "eigenschaften": ["Brandschutz"],
      "attacken": [],
      "synthese": null,
      "besonderheit": "Spiele den Sandeimer (auch außerhalb deines Zuges), wenn dein Elemental von einer Feuer-Attacke oder einer exothermen Synthese getroffen wird: halber Schaden.",
      "flavor": "Schwer, staubig, zuverlässig.",
      "quest": "Quest 6 – Feuerfurt", "bild": "bilder/sandeimer.jpg"
    },
    {
      "name": "Schutzbrille", "formel": "", "klasse": "Ausrüstung", "lp": null,
      "eigenschaften": ["Sicherheit"],
      "attacken": [],
      "synthese": null,
      "besonderheit": "Spiele die Schutzbrille (auch außerhalb deines Zuges), wenn eine gegnerische Attacke einen Zusatzeffekt hat: Der Zusatzeffekt wird verhindert, der Schaden bleibt.",
      "flavor": "Erste Regel jeder Werkstatt: Schütze deine Augen.",
      "quest": "Quest 6 – Feuerfurt", "bild": "bilder/schutzbrille.jpg"
    },

    // ---------- NEUE AUSRÜSTUNG (Feuerlande II) ----------
    {
      "name": "Feuerstahl", "formel": "", "klasse": "Ausrüstung", "lp": null,
      "eigenschaften": ["Energie"],
      "attacken": [],
      "synthese": null,
      "besonderheit": "Lege den Feuerstahl ab, um eine ⚡-Synthese zu zünden – du schlägst dir den Funken selbst (Aktivierungsenergie).",
      "flavor": "Aus dem Funkenstein von Pyrit: dein eigenes Feuer, das dir niemand nehmen kann.",
      "quest": "Quest 4 – Pyrit", "bild": "bilder/feuerstahl.jpg"
    },
    {
      "name": "Glutkern", "formel": "", "klasse": "Ausrüstung", "lp": null,
      "eigenschaften": ["Energie"],
      "attacken": [],
      "synthese": null,
      "besonderheit": "Lege den Glutkern ab, um eine ⚡-Synthese zu zünden ODER deiner nächsten Feuer-Attacke +5 Schaden zu geben.",
      "flavor": "Ein Stück ewiger Glut aus der Großen Esse von Energenium.",
      "quest": "Nebenquest – Kaldors Truhe (Energenium)", "bild": "bilder/glutkern.jpg"
    },
    {
      "name": "Rostschutz-Öl", "formel": "", "klasse": "Ausrüstung", "lp": null,
      "eigenschaften": ["Schutz"],
      "attacken": [],
      "synthese": null,
      "besonderheit": "Spiele Rostschutz-Öl auf eine deiner Metall-Karten: Sie erleidet bis zu deinem nächsten Zug keinen Schaden durch Ätz-Attacken (Rost).",
      "flavor": "Ein dünner Film gegen den langsamen Feind.",
      "quest": "Quest 11 – Feuerfurt 2", "bild": "bilder/rostschutz-oel.jpg"
    },
    {
      "name": "Daltons Kugel", "formel": "", "klasse": "Ausrüstung", "lp": null,
      "eigenschaften": ["Glücksbringer"],
      "attacken": [],
      "synthese": null,
      "besonderheit": "Einmal pro Duell: Wenn du bei einer Synthese die Massen-Bilanz laut und richtig vorrechnest, heile dein aktives Elemental um 5 LP.",
      "flavor": "Eine von Daltons hölzernen Kugeln – wer die kleinsten Teilchen versteht, hat immer einen Vorteil.",
      "quest": "Nebenquest – Daltons Zahlenschloss", "bild": "bilder/daltons-kugel.jpg"
    },

    // ============================================================
    //  REGION 2: PERIODIKA (Themenfeld 3.2 – PSE, Atombau, Familien)
    //  Meisterstufe II: Team 4, Hand 2+3, Synthese-Ketten
    // ============================================================

    // ---------- ALKALIMETALLE (Ort: Alkali) ----------
    {
      "name": "Lithium", "formel": "Li", "region": "Periodika", "klasse": "Alkalimetall", "oz": 3, "lp": 30, "masse": 7,
      "eigenschaften": ["fest", "metallisch", "weich", "federleicht"],
      "attacken": [
        { "name": "Karminrote Flamme", "typ": "Feuer", "schaden": 10, "effekt": "" }
      ],
      "synthese": null,
      "besonderheit": "Federleicht: das leichteste aller Metalle – es schwimmt auf Wasser, und mit nur 7 u Masse beginnt Lithium fast jedes Duell.",
      "flavor": "Man kann es mit dem Messer schneiden. Unterschätze es trotzdem nicht.",
      "quest": "Periodika – Alkali", "bild": "🧈"
    },
    {
      "name": "Natrium", "formel": "Na", "region": "Periodika", "klasse": "Alkalimetall", "oz": 11, "lp": 30, "masse": 23,
      "eigenschaften": ["fest", "metallisch", "weich", "reaktionsfreudig"],
      "attacken": [
        { "name": "Gelbe Lohe", "typ": "Feuer", "schaden": 10, "effekt": "" },
        { "name": "Wasserfunken", "typ": "Wucht", "schaden": 5, "effekt": "Gegen Wasser macht diese Attacke doppelten Schaden – Natrium reagiert heftig mit Wasser!" }
      ],
      "synthese": null,
      "besonderheit": "Familienbande: Sitzt ein weiteres Alkalimetall auf deiner Bank, machen Natriums Attacken +5 Schaden.",
      "flavor": "Gleiche Familie, gleiches Feuer – nur wilder als der kleine Bruder.",
      "quest": "Periodika – Alkali", "bild": "💛"
    },
    {
      "name": "Kalium", "formel": "K", "region": "Periodika", "klasse": "Alkalimetall", "oz": 19, "lp": 30, "masse": 39,
      "eigenschaften": ["fest", "metallisch", "weich", "stürmisch"],
      "attacken": [
        { "name": "Veilchensturm", "typ": "Feuer", "schaden": 15, "effekt": "" }
      ],
      "synthese": null,
      "wirkung": { "ausloeser": "zugende", "art": "selbstschaden", "wert": 5 },
      "besonderheit": "Stürmisch: Kalium verliert am Ende jedes deiner Züge 5 LP – es reagiert schon mit der Luft. Je tiefer in der Familie, desto wilder!",
      "flavor": "Das wildeste der drei Geschwister. Selbst die Luft ist ihm nicht geheuer.",
      "quest": "Periodika – Alkali", "bild": "💜"
    },

    // ---------- ERDALKALIMETALLE (Ort: Erdalkali) ----------
    {
      "name": "Calcium", "formel": "Ca", "region": "Periodika", "klasse": "Erdalkalimetall", "oz": 20, "lp": 30, "masse": 40,
      "eigenschaften": ["fest", "metallisch", "silbrig"],
      "attacken": [
        { "name": "Ziegelglut", "typ": "Feuer", "schaden": 10, "effekt": "" },
        { "name": "Knochenhieb", "typ": "Wucht", "schaden": 10, "effekt": "" }
      ],
      "synthese": null,
      "besonderheit": "Familienbande: Sitzt ein weiteres Erdalkalimetall auf deiner Bank, machen Calciums Attacken +5 Schaden.",
      "flavor": "Es steckt in deinen Knochen, in Muscheln und in den Mauern von Erdalkali.",
      "quest": "Periodika – Erdalkali", "bild": "🦴"
    },
    {
      "name": "Barium", "formel": "Ba", "region": "Periodika", "klasse": "Erdalkalimetall", "oz": 56, "legendaer": true, "lp": 30, "masse": 137,
      "eigenschaften": ["fest", "metallisch", "schwer", "giftig"],
      "attacken": [
        { "name": "Grünfeuer", "typ": "Feuer", "schaden": 10, "effekt": "" },
        { "name": "Schwermassenschlag", "typ": "Wucht", "schaden": 15, "effekt": "" }
      ],
      "synthese": null,
      "besonderheit": "Träge Masse: Barium kann nicht ausgewechselt werden – wer es in die Arena schickt, kämpft bis zum Ende.",
      "flavor": "Der grüne Riese aus der Tiefe. Sein Feuer färbt den Nachthimmel von Erdalkali.",
      "quest": "Periodika – Erdalkali (legendär)", "bild": "🎆"
    },

    // ---------- HALOGENE (Ort: Halogeni) ----------
    {
      "name": "Fluor", "formel": "F₂", "region": "Periodika", "klasse": "Halogen", "oz": 9, "lp": 30, "masse": 38,
      "eigenschaften": ["gasförmig", "blassgelb", "aggressiv", "giftig"],
      "attacken": [
        { "name": "Fluorbiss", "typ": "Ätz", "schaden": 15, "effekt": "Fluor erleidet dabei selbst 5 Schaden – es reagiert mit fast allem, sogar mit Glas.",
          "wirkung": { "art": "selbstschaden", "wert": 5 } }
      ],
      "synthese": null,
      "besonderheit": "",
      "flavor": "Das reaktionswütigste Element Elementias. Sein Käfig in Halogeni ist aus Sonderstahl.",
      "quest": "Periodika – Halogeni", "bild": "🦷"
    },
    {
      "name": "Chlor", "formel": "Cl₂", "region": "Periodika", "klasse": "Halogen", "oz": 17, "lp": 30, "masse": 71,
      "eigenschaften": ["gasförmig", "gelbgrün", "stechend", "giftig"],
      "attacken": [
        { "name": "Chlorhauch", "typ": "Ätz", "schaden": 10, "effekt": "" },
        { "name": "Gelbgrüner Nebel", "typ": "Gas", "schaden": 5, "effekt": "Giftig: Der Gegner erleidet in seinem nächsten Zug zusätzlich 5 Schaden." }
      ],
      "synthese": null,
      "besonderheit": "",
      "flavor": "Schwerer als Luft kriecht es durch die Gassen von Halogeni.",
      "quest": "Periodika – Halogeni", "bild": "☣️"
    },
    {
      "name": "Brom", "formel": "Br₂", "region": "Periodika", "klasse": "Halogen", "oz": 35, "legendaer": true, "lp": 30, "masse": 160,
      "eigenschaften": ["flüssig", "braun", "stechend", "giftig"],
      "attacken": [
        { "name": "Braune Brandung", "typ": "Ätz", "schaden": 10, "effekt": "" },
        { "name": "Dampfschwaden", "typ": "Gas", "schaden": 10, "effekt": "" }
      ],
      "synthese": null,
      "besonderheit": "Einziges flüssiges Nichtmetall: Wucht-Attacken gegen Brom machen nur halben Schaden – es fließt einfach beiseite.",
      "flavor": "Ein See aus braunem Dampf und Tücke, tief im Süden von Halogeni.",
      "quest": "Periodika – Halogeni (legendär)", "bild": "🫗"
    },

    // ---------- EDELGASE (Ort: Edelwald) ----------
    {
      "name": "Helium", "formel": "He", "region": "Periodika", "klasse": "Edelgas", "oz": 2, "lp": 30, "masse": 4,
      "eigenschaften": ["gasförmig", "federleicht", "reaktionsträge"],
      "attacken": [
        { "name": "Piepsstimme", "typ": "Gas", "schaden": 5, "effekt": "Der Gegner muss lachen: Seine nächste Attacke macht 5 Schaden weniger." }
      ],
      "synthese": null,
      "besonderheit": "Edel: Helium nimmt an keiner Synthese teil und ist immun gegen Ätz-Attacken.",
      "flavor": "Es schwebt über allem und lässt sich auf nichts ein.",
      "quest": "Periodika – Edelwald", "bild": "🎈"
    },
    {
      "name": "Neon", "formel": "Ne", "region": "Periodika", "klasse": "Edelgas", "oz": 10, "lp": 30, "masse": 20,
      "eigenschaften": ["gasförmig", "leuchtend", "reaktionsträge"],
      "attacken": [
        { "name": "Neonblitz", "typ": "Gas", "schaden": 5, "effekt": "Geblendet: Die nächste Attacke des Gegners macht nur halben Schaden." }
      ],
      "synthese": null,
      "besonderheit": "Edel: Neon nimmt an keiner Synthese teil und ist immun gegen Ätz-Attacken.",
      "flavor": "Nachts leuchten die Wipfel des Edelwalds in rotem Licht.",
      "quest": "Periodika – Edelwald", "bild": "🌃"
    },
    {
      "name": "Argon", "formel": "Ar", "region": "Periodika", "klasse": "Edelgas", "oz": 18, "lp": 30, "masse": 40,
      "eigenschaften": ["gasförmig", "unsichtbar", "reaktionsträge"],
      "attacken": [
        { "name": "Schutzgasmantel", "typ": "Gas", "schaden": 0, "effekt": "Argon erleidet bis zu deinem nächsten Zug nur halben Schaden." },
        { "name": "Stiller Druck", "typ": "Gas", "schaden": 10, "effekt": "" }
      ],
      "synthese": null,
      "besonderheit": "Edel: Argon nimmt an keiner Synthese teil und ist immun gegen Ätz-Attacken.",
      "flavor": "Ein Hundertstel jedes Atemzugs – und niemand bemerkt es.",
      "quest": "Periodika – Edelwald", "bild": "💡"
    },

    // ---------- SALZE & VERBINDUNGEN (Synthese-Ketten!) ----------
    {
      "name": "Natriumchlorid", "formel": "NaCl", "region": "Periodika", "klasse": "Salz", "lp": 40, "masse": 58,
      "eigenschaften": ["fest", "kristallin", "weiß", "würzig"],
      "attacken": [
        { "name": "Kristallhagel", "typ": "Wucht", "schaden": 10, "effekt": "" }
      ],
      "synthese": {
        "wortgleichung": "Natrium + Chlor → Natriumchlorid (Kochsalz)",
        "bilanz": "46 u + 71 u = 117 u – nichts geht verloren! (zwei Teilchen à ca. 58 u)",
        "edukte": ["Natrium", "Chlor"],
        "aktivierung": true, "exotherm": 5
      },
      "besonderheit": "Gezähmt: Aus wildem Metall und giftigem Gas wurde ein harmloses Salz – das Wunder der Salzhochzeit.",
      "flavor": "Es liegt auf jedem Tisch Elementias – und niemand ahnt, aus welchen Eltern es stammt.",
      "quest": "Periodika – Halogeni", "bild": "🧂"
    },
    {
      "name": "Kaliumchlorid", "formel": "KCl", "region": "Periodika", "klasse": "Salz", "lp": 40, "masse": 75,
      "eigenschaften": ["fest", "kristallin", "weiß"],
      "attacken": [
        { "name": "Salzsplitter", "typ": "Wucht", "schaden": 10, "effekt": "" }
      ],
      "synthese": {
        "wortgleichung": "Kalium + Chlor → Kaliumchlorid",
        "bilanz": "78 u + 71 u = 149 u – nichts geht verloren! (zwei Teilchen à ca. 75 u)",
        "edukte": ["Kalium", "Chlor"],
        "aktivierung": true, "exotherm": 5
      },
      "besonderheit": "Gleiche Familie, gleiche Reaktion: Kalium reagiert mit Chlor genauso wie Natrium – daran erkennst du eine Elementfamilie.",
      "flavor": "Die Bauern von Periodika streuen es auf ihre Felder.",
      "quest": "Periodika – Halogeni", "bild": "🌱"
    },
    {
      "name": "Calciumoxid", "formel": "CaO", "region": "Periodika", "klasse": "Oxid", "lp": 40, "masse": 56,
      "eigenschaften": ["fest", "weiß", "ätzend"],
      "attacken": [
        { "name": "Branntkalk-Wurf", "typ": "Wucht", "schaden": 10, "effekt": "" },
        { "name": "Ätzstaub", "typ": "Ätz", "schaden": 10, "effekt": "" }
      ],
      "synthese": {
        "wortgleichung": "Calcium + Sauerstoff → Calciumoxid (Branntkalk)",
        "bilanz": "80 u + 32 u = 112 u (zwei Teilchen à 56 u)",
        "edukte": ["Calcium", "Sauerstoff"],
        "aktivierung": true, "exotherm": 5
      },
      "besonderheit": "",
      "flavor": "Aus den Brennöfen von Erdalkali – der Stoff, aus dem man Mauern macht.",
      "quest": "Periodika – Erdalkali", "bild": "🧱"
    },
    {
      "name": "Calciumhydroxid", "formel": "Ca(OH)₂", "region": "Periodika", "klasse": "Hydroxid", "lp": 40, "masse": 74,
      "eigenschaften": ["fest", "weiß", "ätzend", "laugig"],
      "attacken": [
        { "name": "Kalkmilchguss", "typ": "Ätz", "schaden": 10, "effekt": "" },
        { "name": "Mörtelpanzer", "typ": "Wucht", "schaden": 0, "effekt": "Calciumhydroxid erleidet bis zu deinem nächsten Zug 5 Schaden weniger pro Attacke." }
      ],
      "synthese": {
        "wortgleichung": "Calciumoxid + Wasser → Calciumhydroxid (Löschkalk)",
        "bilanz": "56 u + 18 u = 74 u – nichts geht verloren!",
        "edukte": ["Calciumoxid", "Wasser"],
        "aktivierung": false, "exotherm": 5
      },
      "besonderheit": "Kettenglied: Beide Edukte sind selbst Verbindungen – deine erste Synthese-Kette (Meisterstufe II)! Diese Reaktion braucht keine Zündung und wird trotzdem heiß.",
      "flavor": "Wer Kalk löscht, dem dampft der Eimer – Wärme ohne Feuer.",
      "quest": "Periodika – Mendelmey Festung", "bild": "🥛"
    },

    // ---------- AUSRÜSTUNG (Periodika) ----------
    {
      "name": "Petroleumglas", "formel": "", "region": "Periodika", "klasse": "Ausrüstung", "lp": null,
      "eigenschaften": ["Aufbewahrung"],
      "attacken": [],
      "synthese": null,
      "besonderheit": "Spiele das Petroleumglas auf eines deiner Alkalimetalle: Es erleidet bis zu deinem nächsten Zug keinen Schaden – sicher unter Petroleum, so lagert man Alkalimetalle.",
      "flavor": "Was mit Luft und Wasser streitet, schläft ruhig unter Öl.",
      "quest": "Periodika – Alkali", "bild": "🫙"
    },
    {
      "name": "Spektralbrille", "formel": "", "region": "Periodika", "klasse": "Ausrüstung", "lp": null,
      "eigenschaften": ["Flammenfärbung"],
      "attacken": [],
      "synthese": null,
      "besonderheit": "Lege ab und nenne die Flammenfärbung deines aktiven Metalls richtig (Li karminrot · Na gelb · K violett · Ca ziegelrot · Ba grün): Seine nächste Feuer-Attacke macht +5 Schaden.",
      "flavor": "Jede Familie hat ihre Farbe. Man muss nur hinsehen können.",
      "quest": "Periodika – Erdalkali", "bild": "🕶️"
    },
    {
      "name": "Das Periodenbuch", "formel": "", "region": "Periodika", "klasse": "Ausrüstung", "lp": null,
      "eigenschaften": ["Wissen ist Macht"],
      "attacken": [],
      "synthese": null,
      "besonderheit": "Lege ab und nenne Ordnungszahl UND Familie deines aktiven Elementals richtig: Deine nächste ⚡-Synthese braucht keine Aktivierungsenergie – du kennst den Stoff genau.",
      "flavor": "Mendelejews Erben schrieben jedes Wesen Elementias in dieses Buch – geordnet nach der Zahl im Kern.",
      "quest": "Periodika – Mendelmey Festung", "bild": "📖"
    },

    // ============================================================
    //  REGION 3: AEROSOL (Themenfeld 3.3 – Gase, Molekülbindung)
    //  Meisterstufe III: Team 5, Hand 3+3, Koeffizienten
    //  Neue Klasse "Molekül". Gase O₂/N₂/H₂/CO₂ stehen bereits in
    //  Feuerlande und werden hier als Edukte wiederverwendet.
    // ============================================================

    // ---------- MOLEKÜLE (Aerosol) ----------
    {
      "name": "Ozon", "formel": "O₃", "region": "Aerosol", "klasse": "Molekül", "legendaer": true, "lp": 40, "masse": 48,
      "eigenschaften": ["gasförmig", "stechend", "bläulich"],
      "attacken": [
        { "name": "Reizhauch", "typ": "Gas", "schaden": 10, "effekt": "" },
        { "name": "Höhenriss", "typ": "Ätz", "schaden": 10, "effekt": "" }
      ],
      "synthese": null,
      "wirkung": { "ausloeser": "zugende", "art": "selbstschaden", "wert": 5 },
      "besonderheit": "Schutzschild der Höhen: Die erste Attacke jedes gegnerischen Elementals gegen Ozon macht nur halben Schaden – die Ozonschicht fängt den ersten Schlag ab. Zerfall: Am Ende jedes deiner Züge verliert Ozon 5 LP – O₃ ist instabil und wird von selbst wieder zu gewöhnlichem Sauerstoff.",
      "flavor": "Dreifacher Sauerstoff. Hoch oben schützt er alles Leben vor der Sonne – tief unten reizt er die Lunge.",
      "quest": "Aerosol – Oxigen (legendär)", "bild": "🌐"
    },
    {
      "name": "Stickstoffmonoxid", "formel": "NO", "region": "Aerosol", "klasse": "Molekül", "lp": 40, "masse": 30,
      "eigenschaften": ["gasförmig", "farblos", "reaktionsfreudig"],
      "attacken": [
        { "name": "Radikalbiss", "typ": "Ätz", "schaden": 10, "effekt": "" }
      ],
      "synthese": {
        "wortgleichung": "Stickstoff + Sauerstoff → Stickstoffmonoxid",
        "bilanz": "28 u + 32 u = 60 u (zwei Teilchen à 30 u)",
        "edukte": ["Stickstoff", "Sauerstoff"],
        "aktivierung": true, "exotherm": 0
      },
      "besonderheit": "Endotherm: Diese Synthese braucht ⚡, gibt aber KEINE Energie ab (kein Sofortschaden) – NO entsteht nur, wo es richtig heiß wird: im Blitz, im Motor.",
      "flavor": "Das Blitzkind. Es verschlingt Energie, statt sie zu schenken.",
      "quest": "Aerosol – Nitrogen", "bild": "⚡"
    },
    {
      "name": "Stickstoffdioxid", "formel": "NO₂", "region": "Aerosol", "klasse": "Molekül", "lp": 40, "masse": 46,
      "eigenschaften": ["gasförmig", "braun", "stechend", "giftig"],
      "attacken": [
        { "name": "Brauner Reizer", "typ": "Ätz", "schaden": 10, "effekt": "" },
        { "name": "Stechhusten", "typ": "Gas", "schaden": 5, "effekt": "Der Gegner darf in seinem nächsten Zug keine Gas-Attacke einsetzen." }
      ],
      "synthese": {
        "wortgleichung": "Stickstoffmonoxid + Sauerstoff → Stickstoffdioxid",
        "bilanz": "60 u + 32 u = 92 u (zwei Teilchen à 46 u)",
        "edukte": ["Stickstoffmonoxid", "Sauerstoff"],
        "aktivierung": false, "exotherm": 5
      },
      "besonderheit": "",
      "flavor": "Der braune Schleier über der Stadt – er beißt in Augen und Lunge.",
      "quest": "Aerosol – Smogon", "bild": "🟤"
    },
    {
      "name": "Kohlenstoffmonoxid", "formel": "CO", "region": "Aerosol", "klasse": "Molekül", "lp": 40, "masse": 28,
      "eigenschaften": ["gasförmig", "farblos", "geruchlos", "giftig"],
      "attacken": [
        { "name": "Stilles Gift", "typ": "Gas", "schaden": 10, "effekt": "" }
      ],
      "synthese": {
        "wortgleichung": "Kohlenstoff + Sauerstoff → Kohlenstoffmonoxid (unvollständige Verbrennung)",
        "bilanz": "24 u + 32 u = 56 u (zwei Teilchen à 28 u)",
        "edukte": ["Kohlenstoff", "Sauerstoff"],
        "aktivierung": true, "exotherm": 5
      },
      "besonderheit": "Heimtücke: Wird CO eingewechselt, erleidet das aktive Elemental des Gegners sofort 5 Schaden – man riecht es nicht, bis es zu spät ist.",
      "flavor": "Es entsteht, wo Feuer zu wenig Luft bekommt. Das stille Gift.",
      "quest": "Aerosol – Smogon", "bild": "💀"
    },
    {
      "name": "Lachgas", "formel": "N₂O", "region": "Aerosol", "klasse": "Molekül", "lp": 40, "masse": 44,
      "eigenschaften": ["gasförmig", "süßlich", "treibhauswirksam"],
      "attacken": [
        { "name": "Lachkrampf", "typ": "Gas", "schaden": 5, "effekt": "Betäubt: Der Gegner darf sein aktives Elemental in seinem nächsten Zug nicht auswechseln." },
        { "name": "Treibhausdruck", "typ": "Wucht", "schaden": 10, "effekt": "" }
      ],
      "synthese": null,
      "besonderheit": "Starkes Treibhausgas: N₂O wirkt fast 300-mal so stark wie CO₂ – nicht alles, was harmlos klingt, ist es auch.",
      "flavor": "Lachgas – klingt lustig, wärmt aber die Welt wie kaum ein anderes Gas.",
      "quest": "Aerosol – Treibhus 2", "bild": "😄"
    },
    {
      "name": "Methan", "formel": "CH₄", "region": "Aerosol", "klasse": "Molekül", "lp": 40, "masse": 16,
      "eigenschaften": ["gasförmig", "brennbar", "farblos", "treibhauswirksam"],
      "attacken": [
        { "name": "Sumpffeuer", "typ": "Feuer", "schaden": 10, "effekt": "" }
      ],
      "synthese": {
        "wortgleichung": "Kohlenstoff + Wasserstoff → Methan",
        "bilanz": "12 u + 4 u = 16 u – nichts geht verloren!",
        "edukte": ["Kohlenstoff", "Wasserstoff"],
        "aktivierung": true, "exotherm": 5
      },
      "besonderheit": "Vier Brücken: Methan trägt vier Einfachbindungen an einem einzigen Kohlenstoff – das Schaubild der Klasse Molekül.",
      "flavor": "Das Sumpfgas von Molekülia – und der Hauptbestandteil von Erdgas.",
      "quest": "Aerosol – Molekülia 2", "bild": "⛽"
    },
    {
      "name": "Chlorwasserstoff", "formel": "HCl", "region": "Aerosol", "klasse": "Molekül", "lp": 40, "masse": 36,
      "eigenschaften": ["gasförmig", "stechend", "sauer"],
      "attacken": [
        { "name": "Salzsäure-Spritzer", "typ": "Ätz", "schaden": 10, "effekt": "" }
      ],
      "synthese": {
        "wortgleichung": "Wasserstoff + Chlor → Chlorwasserstoff",
        "bilanz": "2 u + 71 u = 73 u (zwei Teilchen à ~36 u; Cl gerundet)",
        "edukte": ["Wasserstoff", "Chlor"],
        "aktivierung": true, "exotherm": 5
      },
      "besonderheit": "Koeffizienten (Meisterstufe III): Für diese Synthese brauchst du ein H₂ UND ein Cl₂ – und erhältst zwei Teilchen HCl.",
      "flavor": "Aus zwei Gasen ein drittes. In Wasser gelöst wird daraus die scharfe Salzsäure.",
      "quest": "Aerosol – Hydrogen", "bild": "🌶️"
    },

    // ---------- AUSRÜSTUNG (Aerosol) ----------
    {
      "name": "Glimmspan", "formel": "", "region": "Aerosol", "klasse": "Ausrüstung", "lp": null,
      "eigenschaften": ["Nachweis"],
      "attacken": [],
      "synthese": null,
      "besonderheit": "Spiele den Glimmspan, wenn der Gegner Sauerstoff (O₂) in die Arena bringt: Der Span flammt auf – O₂ erleidet sofort 5 Schaden (nachgewiesen). Die Glimmspanprobe lügt nie.",
      "flavor": "Ein glimmender Span. Flammt er auf, ist Sauerstoff im Spiel.",
      "quest": "Aerosol – Oxigen", "bild": "🕯️"
    },
    {
      "name": "Kalkwasserglas", "formel": "", "region": "Aerosol", "klasse": "Ausrüstung", "lp": null,
      "eigenschaften": ["Nachweis"],
      "attacken": [],
      "synthese": null,
      "besonderheit": "Spiele das Kalkwasserglas (auch außerhalb deines Zuges), wenn dich ein erstickendes Gas (z. B. CO₂) angreift: Der Angriff macht 0 Schaden – das Kalkwasser trübt sich und weist das Gas nach.",
      "flavor": "Wird es trüb, ist Kohlenstoffdioxid im Spiel.",
      "quest": "Aerosol – Treibhus", "bild": "🥛"
    },
    {
      "name": "Gasmaske", "formel": "", "region": "Aerosol", "klasse": "Ausrüstung", "lp": null,
      "eigenschaften": ["Schutz"],
      "attacken": [],
      "synthese": null,
      "besonderheit": "Spiele die Gasmaske auf eines deiner Elementals (auch außerhalb deines Zuges): Die nächste Gas-Attacke gegen dieses Elemental macht 0 Schaden.",
      "flavor": "Wer in Aerosol reist, geht auf Nummer sicher.",
      "quest": "Aerosol – Fähre nach Aerosol", "bild": "😷"
    },

    // ============================================================
    //  REGION 4: AQUARIA (Themenfeld 3.4 – Wasser, Analyse/Synthese)
    //  Meisterstufe IV: Team 5, Hand 3+3, Analyse (Verbindung zerlegen)
    //  H₂/O₂/H₂O werden als Aquaria-Variante mitgedruckt, damit der
    //  Aquaria-Bogen für Analyse/Synthese eigenständig spielbar ist.
    // ============================================================

    // ---------- WASSER-ELEMENTALS (Aquaria) ----------
    {
      "name": "Wasserstoff", "formel": "H₂", "region": "Aquaria", "klasse": "Nichtmetall", "lp": 30, "masse": 2,
      "eigenschaften": ["gasförmig", "brennbar", "federleicht"],
      "attacken": [
        { "name": "Knallgas-Funke", "typ": "Feuer", "schaden": 10, "effekt": "" }
      ],
      "synthese": null,
      "besonderheit": "Knallgas: Trifft eine Feuer-Attacke H₂, explodiert es – beide aktiven Elementals erleiden 15 Schaden. Analyse-Produkt der Elektrolyse (am Minuspol, doppeltes Volumen).",
      "flavor": "Das kleinste Wesen Elementias – am Minuspol steigt es doppelt so schnell wie sein Zwilling.",
      "quest": "Aquaria – Analysia", "bild": "💫"
    },
    {
      "name": "Sauerstoff", "formel": "O₂", "region": "Aquaria", "klasse": "Nichtmetall", "lp": 30, "masse": 32,
      "eigenschaften": ["gasförmig", "brandfördernd"],
      "attacken": [
        { "name": "Brandwind", "typ": "Feuer", "schaden": 10, "effekt": "" },
        { "name": "Anfachen", "typ": "Gas", "schaden": 0, "effekt": "Deine nächste Feuer-Attacke macht doppelten Schaden." }
      ],
      "synthese": null,
      "besonderheit": "Analyse-Produkt der Elektrolyse (am Pluspol) – der Glimmspan weist es nach.",
      "flavor": "Am Pluspol steigt es auf: ein Teil auf zwei Teile Wasserstoff.",
      "quest": "Aquaria – Analysia", "bild": "🌬️"
    },
    {
      "name": "Wasser", "formel": "H₂O", "region": "Aquaria", "klasse": "Oxid", "lp": 40, "masse": 18,
      "eigenschaften": ["flüssig", "löschend", "Dipol"],
      "attacken": [
        { "name": "Dampfstoß", "typ": "Wucht", "schaden": 10, "effekt": "" }
      ],
      "synthese": {
        "wortgleichung": "Wasserstoff + Sauerstoff → Wasser (Knallgas-Reaktion!)",
        "bilanz": "4 u + 32 u = 36 u (zwei Teilchen à 18 u)",
        "edukte": ["Wasserstoff", "Sauerstoff"],
        "aktivierung": true, "exotherm": 5
      },
      "besonderheit": "Löscht: Feuer-Attacken gegen Wasser richten keinen Schaden an. Analyse (Meisterstufe IV): Mit dem Elektrolyse-Apparat lässt sich Wasser wieder in H₂ + O₂ zerlegen.",
      "flavor": "Des Feuers ältester Feind – und die einzige Verbindung, die man im Duell zerlegen UND bauen kann.",
      "quest": "Aquaria – Synthesia", "bild": "💧"
    },

    // ---------- AUSRÜSTUNG (Aquaria) ----------
    {
      "name": "Feldflasche", "formel": "", "region": "Aquaria", "klasse": "Ausrüstung", "lp": null,
      "eigenschaften": ["Heilung"],
      "attacken": [],
      "synthese": null,
      "besonderheit": "Lege die Feldflasche ab: Heile eines deiner Elementals um 5 LP – ein Schluck frisches Wasser hilft in der Not.",
      "flavor": "Wasser ist Leben. Ein voller Feldflaschen-Schluck rettet manchen Kampf.",
      "quest": "Aquaria – Schiffreise", "bild": "🥤"
    },
    {
      "name": "Weißes Kupfersulfat", "formel": "", "region": "Aquaria", "klasse": "Ausrüstung", "lp": null,
      "eigenschaften": ["Nachweis"],
      "attacken": [],
      "synthese": null,
      "besonderheit": "Spiele Weißes Kupfersulfat (auch außerhalb deines Zuges), wenn dich ein flüssiges Elemental (z. B. Wasser) angreift: Der Angriff macht 0 Schaden – das Pulver färbt sich blau und weist das Wasser nach.",
      "flavor": "Weiß wie Schnee – bis ein Tropfen Wasser es tiefblau färbt.",
      "quest": "Aquaria – Eigenschaftis", "bild": "🔵"
    },
    {
      "name": "Aktivkohlefilter", "formel": "", "region": "Aquaria", "klasse": "Ausrüstung", "lp": null,
      "eigenschaften": ["Schutz"],
      "attacken": [],
      "synthese": null,
      "besonderheit": "Spiele den Aktivkohlefilter auf eines deiner Elementals: Der nächste Zusatzeffekt einer Gas- oder Ätz-Attacke gegen es wird herausgefiltert – nur der Schaden bleibt.",
      "flavor": "Hält zurück, was das Wasser trübt. Nur das Gelöste kommt hindurch.",
      "quest": "Aquaria – Gewinn", "bild": "⚫"
    },
    {
      "name": "Destillierhelm", "formel": "", "region": "Aquaria", "klasse": "Ausrüstung", "lp": null,
      "eigenschaften": ["Rückgewinnung"],
      "attacken": [],
      "synthese": null,
      "besonderheit": "Lege den Destillierhelm ab: Nimm eine deiner bereits abgelegten Ausrüstungskarten zurück auf die Hand – durch Verdampfen und Auffangen zurückgewonnen.",
      "flavor": "Gelöst ist nicht verschwunden. Der Helm holt zurück, was das Wasser verschluckt hat.",
      "quest": "Aquaria – Anomalie", "bild": "⚗️"
    },
    {
      "name": "Tensid", "formel": "", "region": "Aquaria", "klasse": "Ausrüstung", "lp": null,
      "eigenschaften": ["Seifenlösung"],
      "attacken": [],
      "synthese": null,
      "besonderheit": "Lege das Tensid ab: Die Schutz-/„Haut\"-Besonderheit des aktiven gegnerischen Elementals ist bis zu deinem nächsten Zug außer Kraft – die Oberflächenspannung bricht.",
      "flavor": "Ein Tropfen Seife, und die Haut des Wassers zerreißt.",
      "quest": "Aquaria – Dipol", "bild": "🫧"
    },
    {
      "name": "Elektrolyse-Apparat", "formel": "", "region": "Aquaria", "klasse": "Ausrüstung", "lp": null,
      "eigenschaften": ["Analyse", "Energie"],
      "attacken": [],
      "synthese": null,
      "besonderheit": "Analyse (Meisterstufe IV): Lege den Elektrolyse-Apparat mit einer ⚡-Energie ab und zerlege eine deiner Verbindungs-Karten wieder in ihre Edukt-Karten – nimm diese auf die Hand. Die Zerlegung ist endotherm.",
      "flavor": "Zwei Elektroden, ein wenig Strom – und aus Wasser werden wieder zwei Gase.",
      "quest": "Aquaria – Analysia", "bild": "🔌"
    },
    {
      "name": "Strichformel-Feder", "formel": "", "region": "Aquaria", "klasse": "Ausrüstung", "lp": null,
      "eigenschaften": ["Wissen ist Macht"],
      "attacken": [],
      "synthese": null,
      "besonderheit": "Lege die Strichformel-Feder ab und zeichne die Strichformel deiner nächsten Verbindung richtig: Diese Synthese gelingt ohne ⚡-Aktivierungsenergie.",
      "flavor": "Wer eine Verbindung Strich für Strich versteht, dem gelingt sie ganz ohne Funken.",
      "quest": "Aquaria – Lewisfurt", "bild": "🖋️"
    },

    // ============================================================
    //  REGION 5: SALZKÜSTE (Themenfeld 3.5 – Salze, Ionenbindung)
    //  Meisterstufe IV bleibt; neue Kartenfamilie "Salz".
    //  NaCl/KCl bestehen bereits in Periodika und werden wiederverwendet.
    // ============================================================

    // ---------- SALZE (Salzküste) ----------
    {
      "name": "Natriumsulfid", "formel": "Na₂S", "region": "Salzküste", "klasse": "Salz", "lp": 40, "masse": 78,
      "eigenschaften": ["fest", "gelblich", "gut löslich"],
      "attacken": [
        { "name": "Sulfidhieb", "typ": "Wucht", "schaden": 10, "effekt": "" }
      ],
      "synthese": {
        "wortgleichung": "Natrium + Schwefel → Natriumsulfid",
        "bilanz": "46 u + 32 u = 78 u (zwei Na⁺ je S²⁻)",
        "edukte": ["Natrium", "Schwefel"],
        "aktivierung": true, "exotherm": 5
      },
      "besonderheit": "Ladungsausgleich: Zwei Na⁺ (je +1) tragen ein S²⁻ (−2) – die Ladungen gehen auf.",
      "flavor": "Zwei geben, einer nimmt – und das Salz steht fest.",
      "quest": "Salzküste – Anion", "bild": "🟡"
    },
    {
      "name": "Magnesiumchlorid", "formel": "MgCl₂", "region": "Salzküste", "klasse": "Salz", "lp": 40, "masse": 95,
      "eigenschaften": ["fest", "bitter", "zieht Wasser an"],
      "attacken": [
        { "name": "Bitterbiss", "typ": "Ätz", "schaden": 10, "effekt": "" }
      ],
      "synthese": {
        "wortgleichung": "Magnesium + Chlor → Magnesiumchlorid",
        "bilanz": "24 u + 71 u = 95 u (ein Mg²⁺ hält zwei Cl⁻)",
        "edukte": ["Magnesium", "Chlor"],
        "aktivierung": true, "exotherm": 5
      },
      "besonderheit": "Über Kreuz: Mg²⁺ braucht zwei Cl⁻ – die Formel MgCl₂ ist der Beweis.",
      "flavor": "Es zieht die Feuchtigkeit aus der Luft – und macht die Straßen im Sommer staubfrei.",
      "quest": "Salzküste – Formalis", "bild": "🧂"
    },
    {
      "name": "Natriumoxid", "formel": "Na₂O", "region": "Salzküste", "klasse": "Salz", "lp": 40, "masse": 62,
      "eigenschaften": ["fest", "weiß"],
      "attacken": [
        { "name": "Gitterstoß", "typ": "Wucht", "schaden": 10, "effekt": "" }
      ],
      "synthese": {
        "wortgleichung": "Natrium + Sauerstoff → Natriumoxid",
        "bilanz": "92 u + 32 u = 124 u (zwei Teilchen à 62 u)",
        "edukte": ["Natrium", "Sauerstoff"],
        "aktivierung": true, "exotherm": 5
      },
      "besonderheit": "Verhältnis 2 : 1 – zwei Na⁺ je O²⁻; ein Musterfall der Über-Kreuz-Regel.",
      "flavor": "Aus dem hellen Feuer des Natriums wächst ein weißes Gitter.",
      "quest": "Salzküste – Salztal", "bild": "⚪"
    },
    {
      "name": "Calciumfluorid", "formel": "CaF₂", "region": "Salzküste", "klasse": "Salz", "lp": 40, "masse": 78,
      "eigenschaften": ["fest", "kristallin", "fluoreszierend"],
      "attacken": [
        { "name": "Flussspat-Schlag", "typ": "Wucht", "schaden": 10, "effekt": "" }
      ],
      "synthese": {
        "wortgleichung": "Calcium + Fluor → Calciumfluorid",
        "bilanz": "40 u + 38 u = 78 u (ein Ca²⁺ hält zwei F⁻)",
        "edukte": ["Calcium", "Fluor"],
        "aktivierung": true, "exotherm": 5
      },
      "besonderheit": "Leuchtstein: Im Dunkeln schimmert Flussspat – daher stammt das Wort „fluoreszieren“.",
      "flavor": "Ein Kristall, der das Licht speichert und im Dunkeln zurückgibt.",
      "quest": "Salzküste – Kristallis", "bild": "🔦"
    },
    {
      "name": "Kupfersulfat", "formel": "CuSO₄", "region": "Salzküste", "klasse": "Salz", "lp": 40, "masse": 160,
      "eigenschaften": ["fest", "tiefblau", "kristallin"],
      "attacken": [
        { "name": "Blaukristall", "typ": "Ätz", "schaden": 10, "effekt": "" }
      ],
      "synthese": null,
      "besonderheit": "Wasserzeiger: Weißes Kupfersulfat färbt sich mit Wasser tiefblau – der Nachweis aus Aquaria.",
      "flavor": "Der schönste Kristall der Salzküste – tiefblau und klar, aus dem eigenen Beet gezüchtet.",
      "quest": "Salzküste – Nebenquest Kristallgärtner", "bild": "🔷"
    },
    {
      "name": "Calciumchlorid", "formel": "CaCl₂", "region": "Salzküste", "klasse": "Salz", "lp": 40, "masse": 111,
      "eigenschaften": ["fest", "zieht Wasser an"],
      "attacken": [
        { "name": "Streusalz-Stoß", "typ": "Wucht", "schaden": 10, "effekt": "" }
      ],
      "synthese": {
        "wortgleichung": "Calcium + Chlor → Calciumchlorid",
        "bilanz": "40 u + 71 u = 111 u (ein Ca²⁺ hält zwei Cl⁻)",
        "edukte": ["Calcium", "Chlor"],
        "aktivierung": true, "exotherm": 5
      },
      "besonderheit": "Trockenmittel: Es zieht Wasser so gierig an, dass man es zum Enteisen und Trocknen nutzt.",
      "flavor": "Wo es liegt, taut das Eis – noch weit unter dem Nullpunkt.",
      "quest": "Salzküste – Uferstraße", "bild": "❄️"
    },

    // ---------- AUSRÜSTUNG (Salzküste) ----------
    {
      "name": "Salzsäckchen", "formel": "", "region": "Salzküste", "klasse": "Ausrüstung", "lp": null,
      "eigenschaften": ["Heilung"],
      "attacken": [],
      "synthese": null,
      "besonderheit": "Lege das Salzsäckchen ab: Heile eines deiner Elementals um 5 LP – eine Prise Salz stärkt und konserviert.",
      "flavor": "Einst wurde man mit Salz bezahlt. Ein Säckchen davon ist mehr wert, als es aussieht.",
      "quest": "Salzküste – Kochsalz", "bild": "👝"
    },
    {
      "name": "Kristallschale", "formel": "", "region": "Salzküste", "klasse": "Ausrüstung", "lp": null,
      "eigenschaften": ["Rückgewinnung"],
      "attacken": [],
      "synthese": null,
      "besonderheit": "Lege die Kristallschale ab: Nimm eine deiner abgelegten Salz-Karten zurück auf die Hand – über Nacht in der gesättigten Lösung nachgewachsen.",
      "flavor": "Gib dem Gitter Zeit, und aus der Lösung wächst zurück, was verloren schien.",
      "quest": "Salzküste – Kristallis", "bild": "🥣"
    },
    {
      "name": "Leitfähigkeitsprüfer", "formel": "", "region": "Salzküste", "klasse": "Ausrüstung", "lp": null,
      "eigenschaften": ["Nachweis"],
      "attacken": [],
      "synthese": null,
      "besonderheit": "Halte den Leitfähigkeitsprüfer an ein aktives gegnerisches Salz: Ist es gelöst (in der Arena aktiv), „leuchtet“ es auf und erleidet sofort 5 Schaden – als Ion entlarvt.",
      "flavor": "Die Lampe leuchtet nur, wenn die Ionen frei schwimmen. Sie lügt nie.",
      "quest": "Salzküste – Hydratis", "bild": "💡"
    },
    {
      "name": "Detektor", "formel": "", "region": "Salzküste", "klasse": "Ausrüstung", "lp": null,
      "eigenschaften": ["Nachweis", "Bauteil"],
      "attacken": [],
      "synthese": null,
      "besonderheit": "Lege den Detektor ab: Sieh dir die Handkarten des Gegners an ODER weise ein gegnerisches Salz nach (es erleidet 5 Schaden). Das dritte Bauteil, dem Feind entrissen.",
      "flavor": "Er macht das Unsichtbare sichtbar. Jedes Ion verrät sich – und jeder Verräter auch.",
      "quest": "Salzküste – Detekta", "bild": "📡"
    },

    // ============================================================
    //  REGION 6: ERDHÜGEL (Themenfeld 3.6 – Metalle, Redox)
    //  Meisterstufe IV bleibt; neue Kartenfamilie "Legierung".
    //  Kupfer/Eisen/Zink/Magnesium bestehen bereits (Feuerlande).
    // ============================================================

    // ---------- METALLE (Erdhügel) ----------
    {
      "name": "Aluminium", "formel": "Al", "region": "Erdhügel", "klasse": "Metall", "oz": 13, "lp": 30, "masse": 27,
      "eigenschaften": ["fest", "leicht", "silbrig", "korrosionsfest"],
      "attacken": [
        { "name": "Leichtklinge", "typ": "Wucht", "schaden": 10, "effekt": "" }
      ],
      "synthese": null,
      "besonderheit": "Passivierung: Eine dichte Oxidschicht schützt Aluminium – die erste Ätz-Attacke gegen es macht 0 Schaden. Nur mit Strom (Elektrolyse) aus dem Erz zu gewinnen.",
      "flavor": "Federleicht und rostfrei – doch nur der Blitz holt es aus dem Erz.",
      "quest": "Erdhügel – Alu", "bild": "🥫"
    },
    {
      "name": "Zinn", "formel": "Sn", "region": "Erdhügel", "klasse": "Metall", "oz": 50, "lp": 30, "masse": 119,
      "eigenschaften": ["fest", "weich", "silbrig", "korrosionsfest"],
      "attacken": [
        { "name": "Zinnschlag", "typ": "Wucht", "schaden": 10, "effekt": "" }
      ],
      "synthese": null,
      "besonderheit": "Legierungs-Partner: Mit Kupfer zusammengeschmolzen ergibt Zinn die harte Bronze.",
      "flavor": "Weich für sich allein – doch mit Kupfer wird es zur Klinge der Alten.",
      "quest": "Erdhügel – Metallum 2", "bild": "🥄"
    },
    {
      "name": "Silber", "formel": "Ag", "region": "Erdhügel", "klasse": "Metall", "oz": 47, "lp": 30, "masse": 108,
      "eigenschaften": ["fest", "edel", "glänzend"],
      "attacken": [
        { "name": "Silberblitz", "typ": "Wucht", "schaden": 10, "effekt": "" }
      ],
      "synthese": null,
      "besonderheit": "Edelmetall &amp; bester Leiter: Silber erleidet durch Ätz-Attacken nur halben Schaden. Es ist der beste Stromleiter überhaupt.",
      "flavor": "Der beste Leiter der Welt – und der klügste Kopf unter den Clans.",
      "quest": "Erdhügel – Agentum", "bild": "🥈"
    },
    {
      "name": "Gold", "formel": "Au", "region": "Erdhügel", "klasse": "Metall", "oz": 79, "lp": 30, "masse": 197,
      "eigenschaften": ["fest", "edel", "goldglänzend", "schwer"],
      "attacken": [
        { "name": "Goldgewicht", "typ": "Wucht", "schaden": 10, "effekt": "" }
      ],
      "synthese": null,
      "besonderheit": "Edelmetall: Gold reagiert mit nichts – Ätz-Attacken (Säure, Rost) machen 0 Schaden. Es kommt gediegen (rein) in der Natur vor.",
      "flavor": "Es fürchtet weder Feuer noch Säure noch die Zeit.",
      "quest": "Erdhügel – Aurum", "bild": "🥇"
    },
    {
      "name": "Platin", "formel": "Pt", "region": "Erdhügel", "klasse": "Metall", "oz": 78, "legendaer": true, "lp": 50, "masse": 195,
      "eigenschaften": ["fest", "edel", "sehr wertvoll", "legendär"],
      "attacken": [
        { "name": "Platinwucht", "typ": "Wucht", "schaden": 10, "effekt": "" },
        { "name": "Katalyse", "typ": "Gas", "schaden": 0, "effekt": "Deine nächste ⚡-Synthese gelingt ohne Energie-Item – Platin beschleunigt die Reaktion." }
      ],
      "synthese": null,
      "besonderheit": "Legendäres Edelmetall: Platin erleidet durch Ätz- und Feuer-Attacken keinen Schaden. Genau dieses Elemental brauchen die Entroperianer für ihr Massenspektrometer.",
      "flavor": "Edler als Gold, unzerstörbar – das Herzstück, um das ein ganzer Krieg entbrannte.",
      "quest": "Erdhügel – Finale (legendär)", "bild": "💍"
    },

    // ---------- LEGIERUNGEN (Erdhügel) ----------
    {
      "name": "Messing", "formel": "Cu+Zn", "region": "Erdhügel", "klasse": "Legierung", "lp": 40, "masse": 129,
      "eigenschaften": ["fest", "metallisch", "goldgelb", "klangvoll"],
      "attacken": [
        { "name": "Klangschlag", "typ": "Wucht", "schaden": 10, "effekt": "" }
      ],
      "synthese": {
        "wortgleichung": "Kupfer + Zink → Messing (Legierung)",
        "bilanz": "64 u + 65 u = 129 u – ein Gemisch, keine Verbindung!",
        "edukte": ["Kupfer", "Zink"],
        "aktivierung": true, "exotherm": 0
      },
      "besonderheit": "Legierung (Gemisch): Härter und klangvoller als reines Kupfer – aus zwei Metallen ein drittes.",
      "flavor": "Golden schimmernd, aber kein Gold – der Klang der Glocken und Hörner.",
      "quest": "Erdhügel – Legierung", "bild": "🎺"
    },
    {
      "name": "Bronze", "formel": "Cu+Sn", "region": "Erdhügel", "klasse": "Legierung", "lp": 40, "masse": 183,
      "eigenschaften": ["fest", "metallisch", "hart", "bronzefarben"],
      "attacken": [
        { "name": "Bronzehieb", "typ": "Wucht", "schaden": 10, "effekt": "" }
      ],
      "synthese": {
        "wortgleichung": "Kupfer + Zinn → Bronze (Legierung)",
        "bilanz": "64 u + 119 u = 183 u – ein Gemisch, keine Verbindung!",
        "edukte": ["Kupfer", "Zinn"],
        "aktivierung": true, "exotherm": 0
      },
      "besonderheit": "Legierung (Gemisch): Härter als Kupfer oder Zinn allein – das Metall eines ganzen Zeitalters.",
      "flavor": "Aus zwei weichen Metallen wurde die erste harte Klinge der Welt.",
      "quest": "Erdhügel – Nebenquest Wiegemeister", "bild": "🗡️"
    },
    {
      "name": "Stahl", "formel": "Fe+C", "region": "Erdhügel", "klasse": "Legierung", "lp": 40, "masse": 68,
      "eigenschaften": ["fest", "metallisch", "hart", "zäh"],
      "attacken": [
        { "name": "Klingenschnitt", "typ": "Wucht", "schaden": 10, "effekt": "" }
      ],
      "synthese": {
        "wortgleichung": "Eisen + Kohlenstoff → Stahl (Legierung)",
        "bilanz": "56 u + 12 u = 68 u – Eisen mit wenig Kohlenstoff, ein Gemisch!",
        "edukte": ["Eisen", "Kohlenstoff"],
        "aktivierung": true, "exotherm": 0
      },
      "besonderheit": "Legierung (Gemisch): Eisen mit wenig Kohlenstoff – härter und zäher als reines Eisen. Die Klinge der Erdhügel.",
      "flavor": "Roheisen ist spröde, reines Eisen weich. Stahl ist beides überwunden.",
      "quest": "Erdhügel – Ferrum", "bild": "⚔️"
    },

    // ---------- AUSRÜSTUNG (Erdhügel) ----------
    {
      "name": "Schmelztiegel", "formel": "", "region": "Erdhügel", "klasse": "Ausrüstung", "lp": null,
      "eigenschaften": ["Reduktion", "Energie"],
      "attacken": [],
      "synthese": null,
      "besonderheit": "Lege den Schmelztiegel mit einer ⚡-Energie ab: Entziehe einem gegnerischen Oxid-Elemental mit Kohle den Sauerstoff (Reduktion) – es verliert seine Oxid-Besonderheit und erleidet 5 Schaden.",
      "flavor": "Ein wenig Kohle, viel Feuer – und aus totem Erz wird lebendiges Metall.",
      "quest": "Erdhügel – Cupper", "bild": "🫕"
    },
    {
      "name": "Opferanode", "formel": "", "region": "Erdhügel", "klasse": "Ausrüstung", "lp": null,
      "eigenschaften": ["Korrosionsschutz"],
      "attacken": [],
      "synthese": null,
      "besonderheit": "Lege die Opferanode auf ein Metall-Elemental: Ein unedleres Metall opfert sich – das Elemental erleidet bis zu deinem nächsten Zug keinen Ätz-/Rost-Schaden (die Anode rostet an seiner Stelle).",
      "flavor": "Ein Stück Zink, das für das Eisen stirbt. Zusammen stärker als allein.",
      "quest": "Erdhügel – Korrosion", "bild": "⛓️"
    },

    // ============================================================
    //  REGION 7: ACIDIA (Themenfeld 3.8 – Säuren und Laugen)
    //  Meisterstufe IV bleibt; neue Kartenfamilie "Säure".
    //  Der Ätz-Angriffstyp (seit Region 1) bekommt hier seine
    //  Fachbegründung: Ätz trifft metallische Elementals doppelt.
    //  Laugen laufen unter der bestehenden Klasse "Hydroxid".
    //  ACHTUNG: Das Gas Chlorwasserstoff (HCl) ist bereits eine
    //  Aerosol-Karte – die Acidia-Karte ist die wässrige LÖSUNG
    //  Salzsäure und entsteht per Synthese aus dem Gas + Wasser.
    // ============================================================

    // ---------- SÄUREN (Acidia) ----------
    {
      "name": "Kohlensäure", "formel": "H₂CO₃", "region": "Acidia", "klasse": "Säure", "lp": 40, "masse": 62,
      "eigenschaften": ["flüssig", "ätzend", "sauer", "schwach"],
      "attacken": [
        { "name": "Sprudelstoß", "typ": "Ätz", "schaden": 5, "effekt": "Prickeln: Die nächste Attacke des Gegners macht 5 Schaden weniger." }
      ],
      "synthese": {
        "wortgleichung": "Kohlenstoffdioxid + Wasser → Kohlensäure",
        "bilanz": "44 u + 18 u = 62 u",
        "edukte": ["Kohlenstoffdioxid", "Wasser"],
        "aktivierung": false, "exotherm": 0
      },
      "besonderheit": "Schwache Säure: Sie zerfällt nur zum kleinen Teil in Ionen – und sie hält nicht. Lässt du Kohlensäure eine ganze Runde in der Arena stehen, entweicht das Gas: Lege sie ab (sie wird schal).",
      "flavor": "Das sprudelnde Wesen aus Malvas Keller. Offen stehen lassen darf man es nicht.",
      "quest": "Acidia – Ätzfurt", "bild": "🥤"
    },
    {
      "name": "Salzsäure", "formel": "HCl (aq)", "region": "Acidia", "klasse": "Säure", "lp": 40, "masse": 36,
      "eigenschaften": ["flüssig", "ätzend", "sauer", "stark"],
      "attacken": [
        { "name": "Ätzstrahl", "typ": "Ätz", "schaden": 10, "effekt": "" },
        { "name": "Magensäure", "typ": "Ätz", "schaden": 15, "effekt": "Rückstoß: Salzsäure erleidet selbst 5 Schaden – wer ätzt, wird auch angegriffen.",
          "wirkung": { "art": "selbstschaden", "wert": 5 } }
      ],
      "synthese": {
        "wortgleichung": "Chlorwasserstoff + Wasser → Salzsäure",
        "bilanz": "Das Gas (36 u) löst sich im Wasser und zerfällt: HCl → H⁺ + Cl⁻",
        "edukte": ["Chlorwasserstoff", "Wasser"],
        "aktivierung": false, "exotherm": 0
      },
      "besonderheit": "Starke Säure: Sie zerfällt in Wasser vollständig in H⁺ und Cl⁻. Gegen metallische Elementals machen ihre Ätz-Attacken doppelten Schaden – Säure frisst Metall (Zinkgrube!).",
      "flavor": "Das Wappenwesen von Hydrochloria – und dieselbe Säure, die du im Magen trägst.",
      "quest": "Acidia – Hydrochloria", "bild": "🧪"
    },
    {
      "name": "Schwefelsäure", "formel": "H₂SO₄", "region": "Acidia", "klasse": "Säure", "lp": 40, "masse": 98,
      "eigenschaften": ["flüssig", "ätzend", "sauer", "stark", "wasserziehend"],
      "attacken": [
        { "name": "Vitriolguss", "typ": "Ätz", "schaden": 12, "effekt": "" }
      ],
      "synthese": null,
      "besonderheit": "Das „Vitriol“: Schwefelsäure entzieht anderen Stoffen das Wasser. Solange sie in der Arena steht, können Wasser- und Lösungs-Ausrüstungen des Gegners nicht gespielt werden. Entsteht in zwei Schritten: Schwefel verbrennen, das Oxid in Wasser leiten.",
      "flavor": "An den Wänden der Schlucht blüht es grünlich. Die Alten nannten es Vitriol.",
      "quest": "Acidia – Vitriolschlucht", "bild": "🌫️"
    },
    {
      "name": "Salpetersäure", "formel": "HNO₃", "region": "Acidia", "klasse": "Säure", "lp": 40, "masse": 63,
      "eigenschaften": ["flüssig", "ätzend", "sauer", "stark"],
      "attacken": [
        { "name": "Scheidewasser", "typ": "Ätz", "schaden": 10, "effekt": "Auch edle Metall-Elementals (Silber, Kupfer) erleiden vollen Schaden – Salpetersäure greift an, wo andere Säuren aufgeben." }
      ],
      "synthese": null,
      "besonderheit": "Aus Galvanas versiegeltem Schrank: Salpetersäure löst sogar Silber und Kupfer. Nur Gold und Platin widerstehen ihr – deshalb hieß sie früher „Scheidewasser“.",
      "flavor": "Womit man Gold von Silber scheidet – und wovor jeder Grubenmeister den Schlüssel doppelt dreht.",
      "quest": "Acidia – Zinkgrube", "bild": "⚗️"
    },

    // ---------- LAUGEN / HYDROXIDE (Acidia) ----------
    {
      "name": "Natronlauge", "formel": "NaOH", "region": "Acidia", "klasse": "Hydroxid", "lp": 40, "masse": 40,
      "eigenschaften": ["flüssig", "ätzend", "alkalisch", "stark"],
      "attacken": [
        { "name": "Laugenbiss", "typ": "Ätz", "schaden": 10, "effekt": "" },
        { "name": "Seifensieder", "typ": "Ätz", "schaden": 5, "effekt": "Verseifung: Eine Ausrüstungskarte des Gegners wird abgelegt – Natronlauge löst Fett und Farbe." }
      ],
      "synthese": {
        "wortgleichung": "Natrium + Wasser → Natronlauge + Wasserstoff",
        "bilanz": "23 u + 18 u = 40 u + 1 u (heftige Reaktion!)",
        "edukte": ["Natrium", "Wasser"],
        "aktivierung": false, "exotherm": 5
      },
      "besonderheit": "Starke Lauge: Sie zerfällt vollständig in Na⁺ und OH⁻. Tückisch wie am Bau – ihr Schaden wirkt verzögert: Das getroffene Elemental erleidet zu Beginn deines nächsten Zuges noch einmal 5 Schaden.",
      "flavor": "Alkalias schärfste Mitarbeiterin. Sie brennt nicht sofort – das ist das Gefährliche.",
      "quest": "Acidia – Seifensieden", "bild": "🧼"
    },
    {
      "name": "Kalkwasser", "formel": "Ca(OH)₂", "region": "Acidia", "klasse": "Hydroxid", "lp": 40, "masse": 74,
      "eigenschaften": ["flüssig", "ätzend", "alkalisch", "Nachweis"],
      "attacken": [
        { "name": "Kalkmilchguss", "typ": "Ätz", "schaden": 10, "effekt": "" }
      ],
      "synthese": {
        "wortgleichung": "Calciumoxid + Wasser → Calciumhydroxid (Kalkwasser)",
        "bilanz": "56 u + 18 u = 74 u (Kalklöschen – es zischt und wird heiß!)",
        "edukte": ["Calciumoxid", "Wasser"],
        "aktivierung": false, "exotherm": 5
      },
      "besonderheit": "Doppelte Rolle: Kalkwasser ist Lauge und Nachweismittel zugleich. Zeigt der Gegner ein Elemental mit dem Tag „gasförmig“, darfst du prüfen, ob es Kohlenstoffdioxid ist – trübt sich das Kalkwasser, erleidet es 5 Schaden.",
      "flavor": "Aus Calx' Öfen. Sieht harmlos aus wie Mehlteig – seine Unterarme sagen etwas anderes.",
      "quest": "Acidia – Calcaria", "bild": "🧱"
    },

    // ---------- AUSRÜSTUNG (Acidia) ----------
    {
      "name": "Universalindikator", "formel": "", "region": "Acidia", "klasse": "Ausrüstung", "lp": null,
      "eigenschaften": ["Nachweis"],
      "attacken": [],
      "synthese": null,
      "besonderheit": "Lege den Universalindikator ab: Der Gegner muss alle Handkarten mit den Tags „sauer“ oder „alkalisch“ offen vorzeigen. Sie können sich nicht verstecken – der Indikator verrät sie durch die Farbe.",
      "flavor": "Rot bei Säure, grün bei neutral, blau bei Lauge. Färbermeister Lakmus lügt nie.",
      "quest": "Acidia – Indikatoria", "bild": "🌈"
    },
    {
      "name": "Rotkohlsaft", "formel": "", "region": "Acidia", "klasse": "Ausrüstung", "lp": null,
      "eigenschaften": ["Nachweis", "natürlich"],
      "attacken": [],
      "synthese": null,
      "besonderheit": "Lege den Rotkohlsaft ab: Sieh dir die oberste Karte des gegnerischen Decks an. Der Indikator aus der Küche – er kann alles, was der teure aus der Akademie kann.",
      "flavor": "Ein Kohlkopf, ein Topf, und die halbe Chemie wird sichtbar.",
      "quest": "Acidia – Indikatoria", "bild": "🥬"
    },
    {
      "name": "pH-Kompass", "formel": "", "region": "Acidia", "klasse": "Ausrüstung", "lp": null,
      "eigenschaften": ["Nachweis", "Messung"],
      "attacken": [],
      "synthese": null,
      "besonderheit": "Bleibt liegen: Solange der pH-Kompass ausliegt, machen deine Ätz-Attacken 5 Schaden mehr – du triffst genau die Stelle, an der es wirkt.",
      "flavor": "Vierzehn Tore, von 0 bis 14. Wer nicht weiß, hinter welchem die Gefahr wartet, überlebt hier keine Woche.",
      "quest": "Acidia – Neutralis", "bild": "🧭"
    },
    {
      "name": "Neutralisations-Phiole", "formel": "", "region": "Acidia", "klasse": "Ausrüstung", "lp": null,
      "eigenschaften": ["Schutz", "Neutralisation"],
      "attacken": [],
      "synthese": null,
      "besonderheit": "Lege die Phiole ab, wenn du von einer Ätz-Attacke getroffen wirst: Der Angriff macht 0 Schaden – Säure und Lauge heben sich auf. Übrig bleiben Salz und Wasser.",
      "flavor": "Auf der Friedensbrücke vor beiden Völkern angerührt. Aus Gegnern wird etwas Neues.",
      "quest": "Acidia – Friedensbrücke", "bild": "⚖️"
    },

    // ============================================================
    //  REGION 8: ORGANICA – TEIL I: DIE KETTENSÜMPFE (Klasse 9)
    //  Themenfeld 3.9 – Kohlenwasserstoffe. Meisterstufe IV bleibt.
    //  NEU: Stoff-Stammbäume – Karten desselben C-Gerüsts bilden
    //  eine Sammel-Familie (Tag "C2-Stamm" usw.). Kohlenwasserstoffe
    //  dürfen direkt als Team-Elemental antreten (im Moor erspielt,
    //  kein Synthese-Zwang). Alle sind "brennbar": Feuer trifft ×2!
    // ============================================================

    // ---------- ALKANE (Organica I) ----------
    {
      "name": "Methan", "formel": "CH₄", "region": "Organica", "teil": 1, "klasse": "Alkan", "lp": 40, "masse": 16,
      "eigenschaften": ["gasförmig", "brennbar", "C1-Stamm"],
      "attacken": [
        { "name": "Sumpfblase", "typ": "Gas", "schaden": 5, "effekt": "Die nächste Attacke des Gegners macht 5 Schaden weniger." },
        { "name": "Irrlichtflamme", "typ": "Feuer", "schaden": 10, "effekt": "" }
      ],
      "synthese": null,
      "besonderheit": "Kohlenwasserstoff: darf direkt als Team-Elemental antreten. Das kleinste organische Molekül – 1 C, 4 H, ein perfekter Tetraeder.",
      "flavor": "Wo einst Lebendiges versank, steigt es als Blase wieder auf.",
      "quest": "Organica – Methanmoor", "bild": "💨"
    },
    {
      "name": "Ethan", "formel": "C₂H₆", "region": "Organica", "teil": 1, "klasse": "Alkan", "lp": 40, "masse": 30,
      "eigenschaften": ["gasförmig", "brennbar", "C2-Stamm"],
      "attacken": [
        { "name": "Kettenschlag", "typ": "Wucht", "schaden": 10, "effekt": "" },
        { "name": "Flammenzunge", "typ": "Feuer", "schaden": 10, "effekt": "" }
      ],
      "synthese": null,
      "besonderheit": "Kohlenwasserstoff: darf direkt als Team-Elemental antreten. Ahnherr des großen C2-Stammbaums – aus ihm werden Ethen, Ethanol, Ethanal, Essigsäure und Ester.",
      "flavor": "Zwei Glieder nur – doch jede lange Reise beginnt mit dem zweiten Schritt.",
      "quest": "Organica – Kettenheim", "bild": "⛓️"
    },
    {
      "name": "Butan", "formel": "C₄H₁₀", "region": "Organica", "teil": 1, "klasse": "Alkan", "lp": 40, "masse": 58,
      "eigenschaften": ["gasförmig", "brennbar", "C4-Stamm"],
      "attacken": [
        { "name": "Feuerzeugfunke", "typ": "Feuer", "schaden": 10, "effekt": "" },
        { "name": "Druckstoß", "typ": "Wucht", "schaden": 10, "effekt": "" }
      ],
      "synthese": null,
      "besonderheit": "Isomer-Wechsel: Einmal pro Duell weicht Butan einer Attacke aus – es war in diesem Moment iso-Butan (gleiche Formel, andere Gestalt).",
      "flavor": "Im Feuerzeug wartet es flüssig und geduldig – bis jemand den Funken ruft.",
      "quest": "Organica – Zickzackfurt", "bild": "🔥"
    },
    {
      "name": "Octan", "formel": "C₈H₁₈", "region": "Organica", "teil": 1, "klasse": "Alkan", "lp": 40, "masse": 114,
      "eigenschaften": ["flüssig", "brennbar", "C8-Stamm"],
      "attacken": [
        { "name": "Superzündung", "typ": "Feuer", "schaden": 12, "effekt": "" }
      ],
      "synthese": null,
      "besonderheit": "Klopffest: Octan zündet erst, wenn es zünden soll – Feuer-Attacken gegen Octan machen 5 Schaden weniger.",
      "flavor": "Aus der obersten Etage der Türme von Raffineria – das Blut der Straßen.",
      "quest": "Organica – Raffineria", "bild": "⛽"
    },

    // ---------- ALKENE / ALKINE (Organica I) ----------
    {
      "name": "Ethen", "formel": "C₂H₄", "region": "Organica", "teil": 1, "klasse": "Alken", "lp": 40, "masse": 28,
      "eigenschaften": ["gasförmig", "brennbar", "ungesättigt", "C2-Stamm"],
      "attacken": [
        { "name": "Reifehauch", "typ": "Gas", "schaden": 5, "effekt": "" },
        { "name": "Doppelgriff", "typ": "Wucht", "schaden": 10, "effekt": "Addition: Die Doppelbindung greift zu – der Gegner kann in seinem nächsten Zug nicht wechseln." }
      ],
      "synthese": null,
      "besonderheit": "Ungesättigt und ungeduldig: An der Doppelbindung ist noch Platz – Ethen wartet nicht, es greift zu.",
      "flavor": "Ein Hauch davon, und die grünste Banane wird gelb.",
      "quest": "Organica – Ethenau", "bild": "🍌"
    },
    {
      "name": "Ethin", "formel": "C₂H₂", "region": "Organica", "teil": 1, "klasse": "Alkin", "lp": 40, "masse": 26,
      "eigenschaften": ["gasförmig", "brennbar", "ungesättigt", "C2-Stamm"],
      "attacken": [
        { "name": "Schweißflamme", "typ": "Feuer", "schaden": 12, "effekt": "" }
      ],
      "synthese": null,
      "besonderheit": "Dreifachbindung unter Spannung: Die heißeste Flamme der Sümpfe (über 3000 °C) – geboren aus Karbid und Wasser.",
      "flavor": "Drei Striche zwischen zwei Kohlenstoffen. Mehr Spannung hält kein Molekül aus.",
      "quest": "Organica – Karbidklamm", "bild": "🛠️"
    },

    // ---------- AUSRÜSTUNG (Organica I) ----------
    {
      "name": "Fährmanns Laterne", "formel": "", "region": "Organica", "teil": 1, "klasse": "Ausrüstung", "lp": null,
      "eigenschaften": ["Licht"],
      "attacken": [],
      "synthese": null,
      "besonderheit": "Lege die Laterne ab: Sieh dir die verdeckten Handkarten (Verbindungen) deines Gegners an – ihr Licht leuchtet durch Nebel und Lügen.",
      "flavor": "Sie hing über der Tür des Fährhauses, so lange sich das Schilf erinnert.",
      "quest": "Organica – Fährhaus im Schilf", "bild": "🏮"
    },
    {
      "name": "Siedeglas", "formel": "", "region": "Organica", "teil": 1, "klasse": "Ausrüstung", "lp": null,
      "eigenschaften": ["Hitze"],
      "attacken": [],
      "synthese": null,
      "besonderheit": "Lege das Siedeglas ab: Ein gegnerisches Elemental mit dem Tag „gasförmig“ muss sofort auf die Bank wechseln – es verdampft aus der Arena (schwache Van-der-Waals-Kräfte!).",
      "flavor": "Die Siedemutter füllte es an ihrer Quelle: Wer leicht ist, bleibt nicht lange.",
      "quest": "Organica – Siedequell", "bild": "🌡️"
    },
    {
      "name": "Geckohandschuhe", "formel": "", "region": "Organica", "teil": 1, "klasse": "Ausrüstung", "lp": null,
      "eigenschaften": ["Haftung"],
      "attacken": [],
      "synthese": null,
      "besonderheit": "Lege die Handschuhe auf dein aktives Elemental: Es weicht der nächsten Attacke aus – Millionen feinster Härchen tragen es die Wand hinauf.",
      "flavor": "Keine Krallen, kein Leim. Nur die heimlichen Kräfte zwischen den Molekülen.",
      "quest": "Organica – Geckofels", "bild": "🧤"
    },
    {
      "name": "Platin-Katalysator", "formel": "", "region": "Organica", "teil": 1, "klasse": "Ausrüstung", "lp": null,
      "eigenschaften": ["Katalyse"],
      "attacken": [],
      "synthese": null,
      "besonderheit": "Bleibt liegen: Einmal pro Duell gelingt dir eine ⚡-Synthese ohne Energie-Item – der Katalysator senkt die Aktivierungsenergie und wird dabei nicht verbraucht.",
      "flavor": "Ein Splitter des legendären Platins. Jetzt weißt du, wofür der Feind es wollte.",
      "quest": "Organica – Flammensumpf", "bild": "⚙️"
    },

    // ============================================================
    //  REGION 8: ORGANICA – TEIL II: REIHERHALL (Klasse 10)
    //  Alkanole, Aldehyde, Carbonsäuren, Ester.
    //  Die VEREDELUNGSLEITER läuft komplett über die vorhandene
    //  Synthese-Mechanik – keine neue Regel:
    //    Ethanol + Kupferoxid -> Ethanal
    //    Ethanal + Sauerstoff -> Essigsäure
    //    Essigsäure + Ethanol -> Ester (+ Wasser, Kondensation)
    //  Damit ist der C2-Stamm vollständig: Ethan, Ethen, Ethanol,
    //  Ethanal, Essigsäure, Ester -> Titel "Stammmeister".
    // ============================================================

    // ---------- ALKANOLE (Organica II) ----------
    {
      "name": "Traubenzucker", "formel": "C₆H₁₂O₆", "region": "Organica", "teil": 2, "klasse": "Molekül", "lp": 40, "masse": 180,
      "eigenschaften": ["fest", "süß", "wasserlöslich", "Energieträger"],
      "attacken": [
        { "name": "Zuckerschub", "typ": "Wucht", "schaden": 5, "effekt": "Ein eigenes Elemental erhält 5 LP zurück – Traubenzucker ist reine Energie." }
      ],
      "synthese": null,
      "besonderheit": "Edukt der Gärung: Lege Traubenzucker zusammen mit der Ethanol-Karte ab, um die alkoholische Gärung zu spielen (Hefe arbeitet ohne Energie-Item – Enzyme sind Katalysatoren).",
      "flavor": "Aus ihm machen die Hefen von Gärhusen alles, was in den Bottichen blubbert.",
      "quest": "Organica – Gärhusen", "bild": "🍬"
    },
    {
      "name": "Ethanol", "formel": "C₂H₅OH", "region": "Organica", "teil": 2, "klasse": "Alkanol", "lp": 40, "masse": 46,
      "eigenschaften": ["flüssig", "brennbar", "löst Fett und Wasser", "C2-Stamm"],
      "attacken": [
        { "name": "Spiritusflamme", "typ": "Feuer", "schaden": 10, "effekt": "" },
        { "name": "Lösungsmittel", "typ": "Ätz", "schaden": 5, "effekt": "Eine Ausrüstungskarte des Gegners wird abgelegt – Ethanol löst fast alles." }
      ],
      "synthese": {
        "wortgleichung": "Traubenzucker → Ethanol + Kohlenstoffdioxid (alkoholische Gärung)",
        "bilanz": "180 u → 2 × 46 u + 2 × 44 u",
        "edukte": ["Traubenzucker"],
        "aktivierung": false, "exotherm": 0
      },
      "besonderheit": "Wasserstoffbrücken: Ethanol siedet erst bei 78 °C – Siedeglas und andere Hitze-Effekte wirken gegen Ethanol nicht.",
      "flavor": "Die erste Sprosse der Leiter. Aus Zucker geboren, von Hefen gemacht.",
      "quest": "Organica – Gärhusen", "bild": "🍷"
    },
    {
      "name": "Methanol", "formel": "CH₃OH", "region": "Organica", "teil": 2, "klasse": "Alkanol", "lp": 40, "masse": 32,
      "eigenschaften": ["flüssig", "brennbar", "giftig", "C1-Stamm"],
      "attacken": [
        { "name": "Holzgeist", "typ": "Gas", "schaden": 10, "effekt": "Blendung: Die nächste Attacke des Gegners macht nur halben Schaden." }
      ],
      "synthese": null,
      "besonderheit": "Der falsche Bruder: Ein C-Atom weniger als Ethanol – und aus dem Trinkbaren wird der Blindmacher. Methanol darf nie als Ersatz für Ethanol gespielt werden.",
      "flavor": "Hinter Gittern im Spiritushafen. Ein Atom Unterschied, ein Leben Unterschied.",
      "quest": "Organica – Spiritushafen", "bild": "☠️"
    },
    {
      "name": "Glycerin", "formel": "C₃H₅(OH)₃", "region": "Organica", "teil": 2, "klasse": "Alkanol", "lp": 40, "masse": 92,
      "eigenschaften": ["flüssig", "zäh", "hygroskopisch", "süß"],
      "attacken": [
        { "name": "Sirupfessel", "typ": "Wucht", "schaden": 5, "effekt": "Der Gegner kann in seinem nächsten Zug nicht wechseln – zäh wie Sirup." }
      ],
      "synthese": null,
      "besonderheit": "Dreiwertig: Drei OH-Gruppen ziehen Wasser an. Heile ein eigenes Elemental um 10 LP (Salvias Salbe) – einmal pro Duell.",
      "flavor": "Das Rückgrat jedes Fettes – und in jeder Salbe der Heilerin.",
      "quest": "Organica – Glyceria", "bild": "🧴"
    },

    // ---------- ALDEHYD (Organica II) ----------
    {
      "name": "Ethanal", "formel": "CH₃CHO", "region": "Organica", "teil": 2, "klasse": "Aldehyd", "lp": 40, "masse": 44,
      "eigenschaften": ["flüssig", "brennbar", "stechend", "C2-Stamm"],
      "attacken": [
        { "name": "Stechender Hauch", "typ": "Gas", "schaden": 10, "effekt": "" }
      ],
      "synthese": {
        "wortgleichung": "Ethanol + Kupferoxid → Ethanal + Kupfer + Wasser",
        "bilanz": "46 u + 80 u = 44 u + 64 u + 18 u (Oxidation: dem Molekül wird Wasserstoff entzogen)",
        "edukte": ["Ethanol", "Kupferoxid"],
        "aktivierung": true, "exotherm": 0
      },
      "besonderheit": "Zweite Sprosse der Veredelungsleiter. Gebefreudig: Ethanal kann sofort weiter zur Essigsäure oxidiert werden.",
      "flavor": "Der Draht glüht schwarz, taucht ein – und kommt kupferrot zurück.",
      "quest": "Organica – Spiegelsee", "bild": "🪞"
    },

    // ---------- CARBONSÄUREN (Organica II) ----------
    {
      "name": "Methansäure", "formel": "HCOOH", "region": "Organica", "teil": 2, "klasse": "Carbonsäure", "lp": 40, "masse": 46,
      "eigenschaften": ["flüssig", "ätzend", "sauer", "C1-Stamm"],
      "attacken": [
        { "name": "Ameisensäure-Sprühregen", "typ": "Ätz", "schaden": 10, "effekt": "" }
      ],
      "synthese": null,
      "besonderheit": "Echte Säure: Wie in Acidia gelernt – Ätz-Attacken machen doppelten Schaden gegen metallische Elementals.",
      "flavor": "Der ganze Wald gehört den Ameisen. Wer zu nah kommt, lernt das schnell.",
      "quest": "Organica – Ameisenwald", "bild": "🐜"
    },
    {
      "name": "Essigsäure", "formel": "CH₃COOH", "region": "Organica", "teil": 2, "klasse": "Carbonsäure", "lp": 40, "masse": 60,
      "eigenschaften": ["flüssig", "ätzend", "sauer", "C2-Stamm"],
      "attacken": [
        { "name": "Entkalker", "typ": "Ätz", "schaden": 10, "effekt": "Gegen Salz- und Kalk-Elementals: zusätzlich 5 Schaden – der Kalk sprudelt weg." }
      ],
      "synthese": {
        "wortgleichung": "Ethanol + Sauerstoff → Essigsäure + Wasser (Essigsäuregärung)",
        "bilanz": "46 u + 32 u = 60 u + 18 u",
        "edukte": ["Ethanol", "Sauerstoff"],
        "aktivierung": false, "exotherm": 0
      },
      "besonderheit": "Dritte Sprosse der Veredelungsleiter – und Edukt für den Ester. Eine Säure, die man essen kann.",
      "flavor": "Ein Fass Wein, ein Spund offen, ein wenig Geduld.",
      "quest": "Organica – Essigheim", "bild": "🍶"
    },
    {
      "name": "Buttersäure", "formel": "C₃H₇COOH", "region": "Organica", "teil": 2, "klasse": "Carbonsäure", "lp": 40, "masse": 88,
      "eigenschaften": ["flüssig", "ätzend", "widerlich riechend"],
      "attacken": [
        { "name": "Stinkwolke", "typ": "Gas", "schaden": 5, "effekt": "Der Gegner muss sein aktives Elemental auf die Bank wechseln – niemand kämpft freiwillig daneben." },
        { "name": "Säurespritzer", "typ": "Ätz", "schaden": 10, "effekt": "" }
      ],
      "synthese": null,
      "besonderheit": "Noch in millionenfacher Verdünnung wahrnehmbar. Zusammen mit einem Alkanol wird aus ihr ein Ananas-Duft – Chemie ist erstaunlich.",
      "flavor": "Ranzige Butter, alter Käse, Schweiß. Der Lagermeister isst dabei sein Brot.",
      "quest": "Organica – Säuregasse", "bild": "🧀"
    },

    // ---------- ESTER (Organica II) ----------
    {
      "name": "Essigsäure­ethylester", "formel": "CH₃COOC₂H₅", "region": "Organica", "teil": 2, "klasse": "Ester", "lp": 40, "masse": 88,
      "eigenschaften": ["flüssig", "brennbar", "duftend", "unpolar", "C2-Stamm"],
      "attacken": [
        { "name": "Duftschleier", "typ": "Gas", "schaden": 5, "effekt": "Verstecken: Dein Elemental kann im nächsten Zug des Gegners nicht angegriffen werden." }
      ],
      "synthese": {
        "wortgleichung": "Essigsäure + Ethanol → Essigsäureethylester + Wasser (Kondensation)",
        "bilanz": "60 u + 46 u = 88 u + 18 u",
        "edukte": ["Essigsäure", "Ethanol"],
        "aktivierung": true, "exotherm": 0
      },
      "besonderheit": "Letzte Sprosse der Leiter: Wer diese Karte durch Synthese ins Spiel bringt, hat den C2-Stamm vollendet – Titel „Stammmeister“. Hydrolyse: Mit der Analyse-Aktion (Meisterstufe IV) zerfällt der Ester wieder in Säure und Alkohol.",
      "flavor": "Aus Säure und Alkohol wird ein Duft. Und ein Duft öffnet Tore, die keine Waffe öffnet.",
      "quest": "Organica – Die Duftgärten", "bild": "🌸"
    },

    // ---------- AUSRÜSTUNG (Organica II) ----------
    {
      "name": "Seifenblase", "formel": "", "region": "Organica", "teil": 2, "klasse": "Ausrüstung", "lp": null,
      "eigenschaften": ["Tensid", "Schutz"],
      "attacken": [],
      "synthese": null,
      "besonderheit": "Lege die Seifenblase auf dein aktives Elemental: Die nächste Ätz-Attacke gegen es macht 0 Schaden – der Tensid-Film umschließt den Angriff wie ein Fetttröpfchen in einer Micelle.",
      "flavor": "Polarer Kopf, unpolarer Schwanz. Sie bringt zusammen, was sich nicht mag.",
      "quest": "Organica – Seifensiederei", "bild": "🫧"
    },
    {
      "name": "Duftphiole", "formel": "", "region": "Organica", "teil": 2, "klasse": "Ausrüstung", "lp": null,
      "eigenschaften": ["Tarnung"],
      "attacken": [],
      "synthese": null,
      "besonderheit": "Lege die Duftphiole ab: Der Gegner kann in seinem nächsten Zug nicht angreifen – wer nach Obstgarten riecht, riecht nicht nach Sumpf.",
      "flavor": "Birne, Rum, Ananas. Damit sind vier Kinder durch das Tor von Entropolis gegangen.",
      "quest": "Organica – Tor von Entropolis", "bild": "🧪"
    },

    // ---------- LEGENDÄRE FINALE-KARTEN (Starter-Payoff) ----------
    // Der Porphyrin-Ring ist der zweite Reaktionspartner beider Finale-
    // Synthesen – er stand schon immer in den Wortgleichungen, hatte aber
    // keine Karte. Dieselbe Ringstruktur, ein anderes Metall im Zentrum:
    // mit Eisen wird sie zu Blut, mit Magnesium zu Blattgrün.
    {
      "name": "Porphyrin-Ring", "formel": "C₂₀H₁₄N₄", "region": "Organica", "teil": 2, "klasse": "Molekül", "lp": 40, "masse": 310,
      "eigenschaften": ["fest", "ringförmig", "Metallfänger", "lebendig"],
      "attacken": [
        { "name": "Ringschluss", "typ": "Wucht", "schaden": 10, "effekt": "" },
        { "name": "Klammergriff", "typ": "Ätz", "schaden": 10, "effekt": "" }
      ],
      "synthese": null,
      "besonderheit": "Vier Stickstoff-Arme greifen nach jedem Metall-Ion, das ihnen zu nahe kommt. Allein ist der Ring farblos – erst das Metall in seiner Mitte gibt ihm seine Farbe.",
      "flavor": "Ein Ring aus vier Armen, leer in der Mitte. Was hineinfindet, entscheidet, ob daraus Blut wird oder Blattgrün.",
      "quest": "Organica – Die Herzkammer", "bild": "⭕"
    },
    {
      "name": "Hämoglobin", "formel": "Fe-Porphyrin", "region": "Organica", "teil": 2, "klasse": "Legendär", "legendaer": true, "lp": 50, "masse": 64500,
      "eigenschaften": ["legendär", "rot", "Sauerstoff-Träger", "lebendig"],
      "attacken": [
        { "name": "Sauerstoffstrom", "typ": "Wucht", "schaden": 15, "effekt": "" },
        { "name": "Atemzug", "typ": "Gas", "schaden": 0, "effekt": "Heile alle deine Elementals um 10 LP – Hämoglobin bringt jedem, was er zum Leben braucht." }
      ],
      "synthese": {
        "wortgleichung": "Eisen(II)-Ion + Porphyrin-Ring → Häm; Häm + Globin → Hämoglobin",
        "bilanz": "Fe (56 u) im Zentrum eines Riesenmoleküls von rund 64 500 u",
        "edukte": ["Eisen", "Porphyrin-Ring"],
        "aktivierung": true, "exotherm": 0
      },
      "besonderheit": "LEGENDÄR – nur für Spieler mit dem Starter Eisen. Das schwerste Elemental Elementias: Es beginnt ein Duell nie (der Leichtere beginnt). Immun gegen Ätz-Attacken. Achtung: Gegen Kohlenstoffmonoxid ist es wehrlos – CO bindet fester als Sauerstoff.",
      "flavor": "Eisen im Blut. Vier Jahre lang hast du es getragen, ohne zu wissen, wohin es dich führt.",
      "quest": "Organica – Die Herzkammer (legendär)", "bild": "❤️"
    },
    {
      "name": "Chlorophyll", "formel": "Mg-Porphyrin", "region": "Organica", "teil": 2, "klasse": "Legendär", "legendaer": true, "lp": 50, "masse": 893,
      "eigenschaften": ["legendär", "grün", "Lichtfänger", "lebendig"],
      "attacken": [
        { "name": "Lichternte", "typ": "Feuer", "schaden": 15, "effekt": "" },
        { "name": "Fotosynthese", "typ": "Gas", "schaden": 0, "effekt": "Nimm eine abgelegte Karte zurück auf die Hand – aus Licht und Luft entsteht Neues." }
      ],
      "synthese": {
        "wortgleichung": "Magnesium-Ion + Porphyrin-Ring → Chlorophyll",
        "bilanz": "Mg (24 u) im Zentrum eines Moleküls von rund 893 u",
        "edukte": ["Magnesium", "Porphyrin-Ring"],
        "aktivierung": true, "exotherm": 0
      },
      "besonderheit": "LEGENDÄR – nur für Spieler mit dem Starter Magnesium. Immun gegen Feuer-Attacken (es lebt vom Licht). Solange Chlorophyll in der Arena steht, erhält jedes deiner Elementals zu Beginn deines Zuges 5 LP zurück.",
      "flavor": "Magnesium im Blattgrün. Der grelle Funke aus Mutters Garten – jetzt weißt du, warum er grün war.",
      "quest": "Organica – Die Herzkammer (legendär)", "bild": "💚"
    }
  ]
};
