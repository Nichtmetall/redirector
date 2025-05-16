# URL-Redirector

## Übersicht
Dieser Service ermöglicht die Verwaltung von URL-Weiterleitungen für verschiedene Kunden. Jeder Kunde kann mehrere Weiterleitungen haben, die durch einen Code identifiziert werden.

## Installation
1. Klone das Repository:
   ```bash
   git clone <repository-url>
   ```
2. Installiere die Abhängigkeiten:
   ```bash
   npm install
   ```

3. Erstelle eine `.env`-Datei und füge deinen Admin-Token hinzu:
   ```plaintext
   NODE_ENV=production
   PORT=3000
   ADMIN_TOKEN=dein-admin-token
   ```

## Nutzung
### Starten des Servers
Um den Server zu starten, führe den folgenden Befehl aus:
```bash
npm start
```
Der Server läuft standardmäßig auf Port 3000.

### API-Endpunkte

#### Kundenverwaltung
- **Kunden erstellen**
  - `GET /admin/customer/create/:kundenname/:formId`
  - Erstellt einen neuen Kunden mit einer angegebenen `formId`.

- **Kunden auflisten**
  - `GET /admin/customer/list`
  - Listet alle Kunden auf.

- **Kunden anzeigen**
  - `GET /admin/customer/:kundenname`
  - Zeigt die Details eines bestimmten Kunden an.

- **Kunden löschen**
  - `GET /admin/customer/:kundenname/delete`
  - Löscht einen bestimmten Kunden.

#### Weiterleitungen
- **Weiterleitung erstellen**
  - `GET /admin/customer/:kundenname/create/:name/:am_id`
  - Erstellt eine neue Weiterleitung für einen bestimmten Kunden.

- **Weiterleitung aufrufen**
  - `GET /:kundenname/:code`
  - Leitet zu der entsprechenden URL weiter, wenn der Kunde und der Code existieren.

- **Weiterleitung löschen**
  - `GET /admin/customer/:kundenname/delete/:code`
  - Löscht eine bestimmte Weiterleitung für einen Kunden.

## Datenstruktur
Die Weiterleitungsdaten werden in einer SQLite-Datenbank (`redirects.db`) gespeichert. Die Datenbank enthält folgende Tabellen:

### Tabelle: customers
- `id` (TEXT): Primärschlüssel, eindeutiger Identifier für den Kunden
- `formId` (TEXT): ID des Formulars für die Weiterleitung
- `createdAt` (TEXT): Erstellungszeitpunkt des Kunden

### Tabelle: redirects
- `code` (TEXT): Code für die Weiterleitung (Teil des Primärschlüssels)
- `customer_id` (TEXT): Zugehöriger Kunde (Teil des Primärschlüssels, Fremdschlüssel)
- `am_id` (TEXT): ID für die Weiterleitung
- `empfehlungsgeber` (TEXT): Name des Empfehlungsgebers
- `createdAt` (TEXT): Erstellungszeitpunkt der Weiterleitung
- `updatedAt` (TEXT): Zeitpunkt der letzten Aktualisierung
- `count` (INTEGER): Anzahl der Aufrufe der Weiterleitung

## Hinweise
- Der Admin-Bereich ist durch einen Token geschützt, der in der `.env`-Datei definiert ist.
- Bei der ersten Ausführung wird automatisch ein Beispielkunde mit einer Beispiel-Weiterleitung angelegt.
