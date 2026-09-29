# Steffis Lernwerkstatt – Starter

Statische Lernwebsite ohne Build-Schritt. HTML/CSS/JavaScript laufen direkt im Browser bzw. über einen kleinen lokalen Webserver.

## Enthalten
- Englisch Klassen 5–10
- Musik Klassen 5, 6, 7 und 9
- Passwortschutz pro Realm via `localStorage`
- Themes, Hell/Dunkel, Schriftgröße
- Beispielübungen: Match, Sort, Cloze, Type, Order, Choice, Mark
- Lokale Ergebnisspeicherung, solange Backend aus ist
- vorbereiteter Adminbereich
- vorbereiteter Cloudflare Worker + KV
- Datendatei + frameworkfreier Node-Test

## Lokal starten
Wegen ES-Modulen nicht per Doppelklick öffnen. Im Projektordner z. B.:

```bash
python3 -m http.server 8000
```

Dann `http://localhost:8000` öffnen.

Demo-Passwort Englisch 5: `eng5` (in `src/shared/config.js` ändern). Diese Klassenpasswörter sind nur weicher Schutz und stehen absichtlich im Frontend.

## Tests
```bash
node english/klasse5/demo/demo_data.test.js
```

## GitHub + Cloudflare Pages
Noch nicht nötig. Sobald Accounts angelegt sind:
1. GitHub-Repo erstellen und diesen Ordner committen/pushen.
2. In Cloudflare Pages das Repo verbinden und `main` beobachten lassen.
3. Kein Build-Befehl nötig; Ausgabeordner ist das Repo-Root.

## Worker: bewusst separater Deploy
Cloudflare Pages deployt die Webseite nach jedem Git-Push automatisch. **Der Worker wird dadurch NICHT automatisch aktualisiert.**

Worker-Deployment erfolgt manuell von einem Rechner mit Cloudflare-Zugang:
```bash
npx wrangler login
npx wrangler kv namespace create LEARNING_KV
# ID in wrangler.toml eintragen
npx wrangler secret put ADMIN_PASSWORD
npx wrangler secret put SUBMIT_TOKEN
npx wrangler secret put OPENAI_API_KEY   # optional
npx wrangler deploy
```

Danach in `src/shared/config.js` `remote.enabled` auf `true`, die Worker-URL eintragen und denselben Submit-Token verwenden.

## Sicherheits-Hinweis
- Klassen-/Themenpasswörter sind **kein echtes Login**; sie stehen im Browsercode.
- Das echte Admin-Passwort liegt ausschließlich als Worker-Secret vor.
- Namen bei Abgaben sind optional; Pseudonyme sind möglich.

## Noch nicht vollständig implementiert
Dieser Starter bereitet die Architektur vor. Nach Einrichtung der Accounts ergänzen wir als nächsten Schritt:
- echte PDF-/Bild-Uploads
- Sichtbarkeitseditor im Adminbereich
- Statistik und Verlauf
- OpenAI-Aufruf inkl. Tageslimit pro Gerät
- serverseitige QR-Code-Erzeugung **plus Decoder-Verifikation**, bevor der QR-Code an die Seite ausgeliefert wird

Die QR-Code-Funktion wird bewusst nicht mit handgebautem SVG vorgetäuscht: Sie bleibt bis zur verifizierbaren Server-Implementierung deaktiviert.
