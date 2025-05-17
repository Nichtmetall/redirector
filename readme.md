# URL-Weiterleitungsservice

Dieser Service ermöglicht die Weiterleitung von benutzerdefinierten URLs zu LeadConnector-Formularen mit vordefinierten Parametern.

## Funktionen

- Einfache URL-Weiterleitungen (z.B. `/kundenname/code` -> LeadConnector-Formular)
- Zählen und Verfolgen von Weiterleitungen
- Admin-Bereich zur Verwaltung von Kunden und Weiterleitungen
- Token-basierte Authentifizierung für den Admin-Bereich

## Technologien

- Next.js (App Router)
- Prisma ORM mit SQLite-Datenbank
- TailwindCSS + shadcn/ui für die Benutzeroberfläche
- TypeScript

## Installation und Einrichtung

1. Repository klonen
2. Abhängigkeiten installieren:
   ```bash
   npm install
   ```
3. Umgebungsvariablen konfigurieren (`.env` Datei erstellen):
   ```
   DATABASE_URL="file:./dev.db"
   ADMIN_TOKEN="dein-geheimes-admin-token"
   ```
4. Datenbank initialisieren:
   ```bash
   npx prisma migrate dev --name init
   ```
5. Anwendung starten:
   ```bash
   npm run dev
   ```

## Verwendung

### Admin-Bereich

Zugriff auf den Admin-Bereich über:

```
http://localhost:3000/admin?token=dein-geheimes-admin-token
```

Im Admin-Bereich können Sie:

- Kunden anlegen und verwalten
- Weiterleitungen erstellen und löschen
- Statistiken zu den Weiterleitungen einsehen

### Weiterleitungen nutzen

Sobald Kunden und Weiterleitungen angelegt sind, können Sie die Weiterleitungen über folgende URL aufrufen:

```
http://localhost:3000/[kundenname]/[code]
```

Die Benutzer werden automatisch zum konfigurierten LeadConnector-Formular weitergeleitet, wobei die Parameter `am_id` und `empfehlungsgeber` entsprechend der Konfiguration gesetzt werden.

## Produktionsumgebung

Für die Produktionsumgebung:

1. Build erstellen:
   ```bash
   npm run build
   ```
2. Anwendung starten:
   ```bash
   npm start
   ```

Es wird empfohlen, in der Produktionsumgebung eine robustere Datenbanklösung anstelle von SQLite zu verwenden (z.B. PostgreSQL). Dazu die Prisma-Konfiguration in `prisma/schema.prisma` anpassen und die Umgebungsvariablen entsprechend setzen.
