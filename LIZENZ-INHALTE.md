# Lizenz der Inhalte

In diesem Verzeichnis liegen zwei sehr verschiedene Sorten Werk, und sie stehen deshalb
unter zwei verschiedenen Lizenzen.

| Was | Wo | Lizenz |
|---|---|---|
| **Programmcode** | `sammlung.html`, `duell.html`, `App/kern/*.js`, `sw.js`, die Werkzeugskripte | [MIT](LICENSE) |
| **Spielinhalte** | `Karten/karten-daten.js`, das Regelwerk, alle Oberflächen- und Questtexte, die Handreichungen | **CC BY-NC-SA 4.0** (dieses Blatt) |
| **Kartenbilder** | `Karten/bilder-app/**` | kein Rechteanspruch, siehe unten |
| **Fremder Code** | `App/lib/jsQR.js` | Apache-2.0, siehe `App/lib/` |

---

## Die Spielinhalte: CC BY-NC-SA 4.0

Gemeint sind die 133 Elemental-Karten mit ihren Flavortexten, Attackennamen, Synthesen und
Sonderregeln, die 95 Questnamen, das Regelwerk und die Texte der App — also alles, was am
Schreibtisch entstanden ist und nicht Programmcode.

**Namensnennung – Nicht kommerziell – Weitergabe unter gleichen Bedingungen 4.0
International**
Lizenztext: <https://creativecommons.org/licenses/by-nc-sa/4.0/deed.de>

### Du darfst

- das Material **benutzen** — im Unterricht, in der AG, zu Hause,
- es **ausdrucken**, laminieren, kopieren, in beliebiger Zahl,
- es **verändern**: Karten austauschen, Quests umschreiben, an deinen Lehrplan anpassen,
- es **weitergeben**, im Original oder verändert.

### Unter diesen Bedingungen

- **Namensnennung (BY)** — nenne die Herkunft. Ein Satz genügt; einer zum Kopieren steht
  unten.
- **Nicht kommerziell (NC)** — nicht verkaufen und nicht in etwas einbauen, das verkauft
  wird. Der Kostenbeitrag für Papier, Folie und Toner in einer Schule ist damit nicht
  gemeint.
- **Weitergabe unter gleichen Bedingungen (SA)** — was du daraus machst und weitergibst,
  steht wieder unter dieser Lizenz.

### Namensnennung zum Kopieren

> „Elementia — Chemie-Lernspiel" von Becker, lizenziert unter CC BY-NC-SA 4.0
> (https://creativecommons.org/licenses/by-nc-sa/4.0/deed.de).
> Quelle: https://github.com/herrbecker1-star/Elementia

Bei einem veränderten Blatt gehört dazu, was du geändert hast — „gekürzt", „Quests für
Klasse 8 ergänzt", das reicht.

---

## Die Kartenbilder: kein Rechteanspruch

Die Bilder in `Karten/bilder-app/` sind lokal von einem Bildgenerator erzeugt worden
(stable-diffusion.cpp), ohne dass ein Mensch sie gezeichnet hat. Rein maschinell erzeugte
Bilder sind mangels menschlicher Schöpfung in aller Regel **nicht urheberrechtlich
geschützt**. Hier wird deshalb kein Recht daran behauptet — nimm sie, wenn du sie brauchst.

Eine Bitte statt einer Bedingung: Wenn du die Bilder außerhalb des Spiels verwendest, sag
dazu, dass sie maschinell erzeugt sind.

---

## Der Programmcode: MIT

Der Programmcode steht unter der MIT-Lizenz — siehe [`LICENSE`](LICENSE). Sie ist so
großzügig, wie eine Lizenz sein kann: benutzen, ändern, weitergeben, auch kommerziell,
solange der Copyright-Vermerk mitgeht. Das NC dieses Blattes gilt für die Inhalte, nicht
für den Code.

## Fremder Code: jsQR

`App/lib/jsQR.js` stammt nicht von hier. Es ist die Bibliothek, die in der Sammlung die
QR-Codes aus dem Kamerabild liest, und steht unter der **Apache License 2.0**. Der volle
Lizenztext liegt daneben in `App/lib/LICENSE-jsQR.txt`; Herkunft und Begründung stehen in
`App/lib/HERKUNFT.md`.

---

Fragen zur Nutzung? Die Lizenz ist die Erlaubnis — du musst niemanden fragen. Sie steht
hier, damit du es nicht musst.
