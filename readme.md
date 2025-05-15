# URL-Redirector

## Übersicht
Dieser Service ermöglicht die Verwaltung von URL-Weiterleitungen für verschiedene Kunden. Jeder Kunde kann mehrere Weiterleitungen haben, die durch einen Hashwert identifiziert werden.

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
  - Erstellt eine neue Weiterleitung für einen bestimmten Kunden. Der Code wird automatisch generiert und basiert auf `am_id` und `kundenname`.

- **Weiterleitung aufrufen**
  - `GET /:kundenname/:code`
  - Leitet zu der entsprechenden URL weiter, wenn der Kunde und der Code existieren.

- **Weiterleitung löschen**
  - `GET /admin/customer/:kundenname/delete/:code`
  - Löscht eine bestimmte Weiterleitung für einen Kunden.

## Datenstruktur
Die Weiterleitungsdaten werden in der Datei `redirects.json` gespeichert. Hier ist ein Beispiel für die Struktur:

```json
{
  "beispielkunde": {
    "formId": "tjjsnG0hJTcpwDEhxzpx",
    "redirects": {
      "a1b2c3d4": {
        "am_id": "hanswurst1413",
        "empfehlungsgeber": "Hans Wurst"
      }
    }
  }
}
```

## Hinweise
- Der Hashwert für die Weiterleitungen wird aus der Kombination von `am_id` und `kundenname` generiert und ist auf 8 Zeichen begrenzt.
- Der Admin-Bereich ist durch einen Token geschützt, der in der `.env`-Datei definiert ist.
