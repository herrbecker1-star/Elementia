# Elementia

Ein Chemie-Lernspiel für den Unterricht ab Klasse 7: 133 Sammelkarten aus acht Regionen —
Elemente, Oxide, Salze, Säuren, organische Stoffe — die im Unterricht erspielt und im Duell
gegeneinander eingesetzt werden. Wer eine Karte will, löst die Aufgabe an der Station und
scannt das QR-Kärtchen, das dort liegt.

**Zum Spielen: <https://herrbecker1-star.github.io/Elementia/>**

Die Seite ist eine PWA: kein Konto, kein Server, keine Installation nötig. Sie lässt sich
auf dem Startbildschirm ablegen und läuft danach auch ohne Netz. Der Sammelstand bleibt auf
dem Gerät und wird nirgendwohin gesendet.

- `App/sammlung.html` — die Sammlung mit dem Kamera-Scanner
- `App/duell.html` — das Kartenduell
- `Karten/karten-daten.js` — alle Karten mit Werten, Synthesen und Texten
- `App/geraetetest.html` — Kamera, Speicher und Anzeige eines Geräts prüfen

## Lizenz

Zwei Sorten Werk, zwei Lizenzen:

- **Programmcode** — MIT, siehe [`LICENSE`](LICENSE)
- **Spielinhalte** (Karten, Regelwerk, Texte) — CC BY-NC-SA 4.0, siehe
  [`LIZENZ-INHALTE.md`](LIZENZ-INHALTE.md)

Die Kartenbilder sind maschinell erzeugt; darauf wird kein Recht beansprucht.
`App/lib/jsQR.js` ist fremder Code unter der Apache License 2.0
([`App/lib/LICENSE-jsQR.txt`](App/lib/LICENSE-jsQR.txt)).
