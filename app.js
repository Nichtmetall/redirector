const express = require('express');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;
const dotenv = require('dotenv');
const sqlite3 = require('sqlite3').verbose();

// .env Datei für Umgebungsvariablen laden
dotenv.config();

// Sicherheitseinstellungen
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'sefrin-secure-token-change-me';
const DB_FILE = path.join(__dirname, 'redirects.db');

// Datenbank initialisieren
const db = new sqlite3.Database(DB_FILE, (err) => {
  if (err) {
    console.error('Fehler beim Öffnen der Datenbank:', err.message);
  } else {
    console.log('Verbindung zur SQLite-Datenbank hergestellt');
    initDatabase();
  }
});

// Datenbank-Schema erstellen
function initDatabase() {
  db.serialize(() => {
    // Tabelle für Kunden
    db.run(`CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      formId TEXT NOT NULL,
      createdAt TEXT
    )`);

    // Tabelle für Weiterleitungen
    db.run(`CREATE TABLE IF NOT EXISTS redirects (
      code TEXT,
      customer_id TEXT,
      am_id TEXT NOT NULL,
      empfehlungsgeber TEXT NOT NULL,
      createdAt TEXT,
      updatedAt TEXT,
      count INTEGER DEFAULT 0,
      PRIMARY KEY (code, customer_id),
      FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
    )`, (err) => {
      if (err) {
        console.error('Fehler beim Erstellen der Tabellen:', err.message);
      } else {
        console.log('Datenbank-Tabellen wurden erstellt');
        
        // Prüfen, ob bereits Daten in der Datenbank vorhanden sind
        db.get("SELECT COUNT(*) as count FROM customers", (err, row) => {
          if (err) {
            console.error('Fehler beim Abfragen der Datenbank:', err.message);
            return;
          }
          
          // Wenn keine Kunden vorhanden sind, Beispieldaten einfügen
          if (row.count === 0) {
            createExampleData();
          }
        });
      }
    });
  });
}

// Beispieldaten erstellen
function createExampleData() {
  const now = new Date().toLocaleString('de-DE', { timeZone: 'Europe/Berlin' });
  
  // Beispielkunde einfügen
  db.run(`INSERT INTO customers (id, formId, createdAt) VALUES (?, ?, ?)`, 
    ['beispielkunde', 'tjjsnG0hJTcpwDEhxzpx', now], 
    function(err) {
      if (err) {
        console.error('Fehler beim Einfügen des Beispielkunden:', err.message);
        return;
      }
      console.log('Beispielkunde erstellt');
      
      // Beispiel-Weiterleitung einfügen
      db.run(`INSERT INTO redirects (code, customer_id, am_id, empfehlungsgeber, createdAt, updatedAt, count) 
              VALUES (?, ?, ?, ?, ?, ?, ?)`, 
        ['hanswurst1413', 'beispielkunde', 'hanswurst1413', 'Hans Wurst', now, now, 0], 
        function(err) {
          if (err) {
            console.error('Fehler beim Einfügen der Beispiel-Weiterleitung:', err.message);
            return;
          }
          console.log('Beispiel-Weiterleitung erstellt');
        });
    });
}

// Middleware zur Überprüfung des Admin-Tokens
function verifyAdminToken(req, res, next) {
  const token = req.query.token;

  if (!token || token !== ADMIN_TOKEN) {
    return res.status(401).json({
      error: 'Nicht autorisiert. Bitte gültigen Admin-Token angeben.'
    });
  }

  next();
}

// Route für Weiterleitungen
app.get('/:kundenname/:code', (req, res) => {
  const kundenname = req.params.kundenname;
  const code = req.params.code;

  // Prüfen, ob der Kunde mit dem Code existiert
  db.get(`
    SELECT c.formId, r.am_id, r.empfehlungsgeber, r.count 
    FROM customers c
    JOIN redirects r ON c.id = r.customer_id
    WHERE c.id = ? AND r.code = ?
  `, [kundenname, code], (err, row) => {
    if (err) {
      console.error('Datenbankfehler:', err.message);
      return res.status(500).send('Serverfehler');
    }

    if (!row) {
      return res.status(404).send('Weiterleitung nicht gefunden');
    }

    // URL für die Weiterleitung erstellen
    const baseUrl = `https://api.leadconnectorhq.com/widget/form/${row.formId}`;
    const redirectUrl = `${baseUrl}?am_id=${encodeURIComponent(row.am_id)}&empfehlungsgeber=${encodeURIComponent(row.empfehlungsgeber)}`;

    // Anzahl der Aufrufe erhöhen und Timestamp aktualisieren
    const now = new Date().toLocaleString('de-DE', { timeZone: 'Europe/Berlin' });
    db.run(`
      UPDATE redirects
      SET count = count + 1, updatedAt = ?
      WHERE customer_id = ? AND code = ?
    `, [now, kundenname, code], function(err) {
      if (err) {
        console.error('Fehler beim Aktualisieren des Zählers:', err.message);
      }
    });

    // 302 Redirect (temporäre Weiterleitung)
    return res.redirect(302, redirectUrl);
  });
});

// Admin-Route zum Erstellen eines neuen Kunden - mit Token-Schutz
app.get('/admin/customer/create/:kundenname/:formId', verifyAdminToken, (req, res) => {
  const kundenname = req.params.kundenname;
  const formId = req.params.formId;
  const now = new Date().toLocaleString('de-DE', { timeZone: 'Europe/Berlin' });

  // Prüfen, ob Kunde bereits existiert
  db.get("SELECT id FROM customers WHERE id = ?", [kundenname], (err, row) => {
    if (err) {
      console.error('Datenbankfehler:', err.message);
      return res.status(500).json({
        success: false,
        error: 'Datenbankfehler'
      });
    }

    if (row) {
      return res.status(400).json({
        success: false,
        error: 'Kunde existiert bereits'
      });
    }

    // Neuen Kunden anlegen
    db.run("INSERT INTO customers (id, formId, createdAt) VALUES (?, ?, ?)", 
      [kundenname, formId, now], 
      function(err) {
        if (err) {
          console.error('Fehler beim Erstellen des Kunden:', err.message);
          return res.status(500).json({
            success: false,
            error: 'Fehler beim Erstellen des Kunden'
          });
        }

        res.json({
          success: true,
          customer: kundenname,
          formId: formId
        });
      });
  });
});

// Admin-Route zum dynamisch Erstellen neuer Codes für einen Kunden - mit Token-Schutz
app.get('/admin/customer/:kundenname/create/:name/:am_id', verifyAdminToken, (req, res) => {
  const kundenname = req.params.kundenname;
  const name = req.params.name;
  const amId = req.params.am_id;
  const now = new Date().toLocaleString('de-DE', { timeZone: 'Europe/Berlin' });

  // Prüfen, ob Kunde existiert
  db.get("SELECT id FROM customers WHERE id = ?", [kundenname], (err, row) => {
    if (err) {
      console.error('Datenbankfehler:', err.message);
      return res.status(500).json({
        success: false,
        error: 'Datenbankfehler'
      });
    }

    if (!row) {
      return res.status(404).json({
        success: false,
        error: 'Kunde nicht gefunden'
      });
    }

    // Prüfen, ob die am_id bereits für diesen Kunden existiert
    db.get("SELECT code FROM redirects WHERE customer_id = ? AND code = ?", 
      [kundenname, amId], 
      (err, row) => {
        if (err) {
          console.error('Datenbankfehler:', err.message);
          return res.status(500).json({
            success: false,
            error: 'Datenbankfehler'
          });
        }

        if (row) {
          return res.json({
            success: false,
            code: amId,
            error: 'Weiterleitung mit dieser am_id existiert bereits'
          });
        }

        // Überprüfen, ob die Kombination aus Empfehlungsgeber und am_id bereits existiert
        db.get(
          "SELECT code FROM redirects WHERE customer_id = ? AND am_id = ? AND empfehlungsgeber = ?", 
          [kundenname, amId, name], 
          (err, row) => {
            if (err) {
              console.error('Datenbankfehler:', err.message);
              return res.status(500).json({
                success: false,
                error: 'Datenbankfehler'
              });
            }

            if (row) {
              return res.json({
                success: false,
                code: row.code,
                error: 'Kombination aus Empfehlungsgeber und am_id existiert bereits'
              });
            }

            // Code (am_id) zur Datenbank hinzufügen
            db.run(
              `INSERT INTO redirects (code, customer_id, am_id, empfehlungsgeber, createdAt, updatedAt, count) 
               VALUES (?, ?, ?, ?, ?, ?, ?)`, 
              [amId, kundenname, amId, name, now, now, 0], 
              function(err) {
                if (err) {
                  console.error('Fehler beim Erstellen der Weiterleitung:', err.message);
                  return res.status(500).json({
                    success: false,
                    error: 'Fehler beim Erstellen der Weiterleitung'
                  });
                }

                // Vollständige URL zurückgeben
                const fullUrl = `${req.protocol}://${req.get('host')}/${kundenname}/${amId}`;

                res.json({
                  success: true,
                  customer: kundenname,
                  code: amId,
                  redirectUrl: fullUrl
                });
              }
            );
          }
        );
      }
    );
  });
});

// Admin-Route zum Anzeigen aller Kunden - mit Token-Schutz
app.get('/admin/customer/list', verifyAdminToken, (req, res) => {
  db.all("SELECT id, formId, createdAt FROM customers", [], (err, customers) => {
    if (err) {
      console.error('Datenbankfehler:', err.message);
      return res.status(500).json({
        success: false,
        error: 'Datenbankfehler'
      });
    }

    // Für jeden Kunden die Weiterleitungen abfragen
    const customerMap = {};
    let pendingCustomers = customers.length;

    if (pendingCustomers === 0) {
      return res.json({
        count: 0,
        customers: {}
      });
    }

    customers.forEach(customer => {
      db.all(
        "SELECT code, am_id, empfehlungsgeber, createdAt, updatedAt, count FROM redirects WHERE customer_id = ?", 
        [customer.id], 
        (err, redirects) => {
          if (err) {
            console.error('Datenbankfehler:', err.message);
            pendingCustomers = 0;
            return res.status(500).json({
              success: false,
              error: 'Datenbankfehler'
            });
          }

          // Kundenobjekt erstellen
          customerMap[customer.id] = {
            formId: customer.formId,
            redirects: {}
          };

          // Weiterleitungen zum Kunden hinzufügen
          redirects.forEach(redirect => {
            customerMap[customer.id].redirects[redirect.code] = {
              am_id: redirect.am_id,
              empfehlungsgeber: redirect.empfehlungsgeber,
              createdAt: redirect.createdAt,
              updatedAt: redirect.updatedAt,
              count: redirect.count
            };
          });

          pendingCustomers--;
          
          // Wenn alle Kunden verarbeitet wurden, Antwort senden
          if (pendingCustomers === 0) {
            res.json({
              count: customers.length,
              customers: customerMap
            });
          }
        }
      );
    });
  });
});

// Admin-Route zum Anzeigen eines bestimmten Kunden - mit Token-Schutz
app.get('/admin/customer/:kundenname', verifyAdminToken, (req, res) => {
  const kundenname = req.params.kundenname;

  db.get("SELECT id, formId, createdAt FROM customers WHERE id = ?", [kundenname], (err, customer) => {
    if (err) {
      console.error('Datenbankfehler:', err.message);
      return res.status(500).json({
        success: false,
        error: 'Datenbankfehler'
      });
    }

    if (!customer) {
      return res.status(404).json({
        success: false,
        error: 'Kunde nicht gefunden'
      });
    }

    // Weiterleitungen des Kunden abfragen
    db.all(
      "SELECT code, am_id, empfehlungsgeber, createdAt, updatedAt, count FROM redirects WHERE customer_id = ?", 
      [kundenname], 
      (err, redirects) => {
        if (err) {
          console.error('Datenbankfehler:', err.message);
          return res.status(500).json({
            success: false,
            error: 'Datenbankfehler'
          });
        }

        // Kundenobjekt erstellen
        const customerObj = {
          formId: customer.formId,
          redirects: {}
        };

        // Weiterleitungen zum Kunden hinzufügen
        redirects.forEach(redirect => {
          customerObj.redirects[redirect.code] = {
            am_id: redirect.am_id,
            empfehlungsgeber: redirect.empfehlungsgeber,
            createdAt: redirect.createdAt,
            updatedAt: redirect.updatedAt,
            count: redirect.count
          };
        });

        res.json({
          customer: kundenname,
          details: customerObj
        });
      }
    );
  });
});

// Admin-Route zum Löschen eines Kunden - mit Token-Schutz
app.get('/admin/customer/:kundenname/delete', verifyAdminToken, (req, res) => {
  const kundenname = req.params.kundenname;

  // Zuerst Kundeninformationen abrufen
  db.get("SELECT id, formId FROM customers WHERE id = ?", [kundenname], (err, customer) => {
    if (err) {
      console.error('Datenbankfehler:', err.message);
      return res.status(500).json({
        success: false,
        error: 'Datenbankfehler'
      });
    }

    if (!customer) {
      return res.status(404).json({
        success: false,
        error: 'Kunde nicht gefunden'
      });
    }

    // Weiterleitungen des Kunden abrufen
    db.all(
      "SELECT code, am_id, empfehlungsgeber, createdAt, updatedAt, count FROM redirects WHERE customer_id = ?", 
      [kundenname], 
      (err, redirects) => {
        if (err) {
          console.error('Datenbankfehler:', err.message);
          return res.status(500).json({
            success: false,
            error: 'Datenbankfehler'
          });
        }

        // Kundenobjekt für die Antwort erstellen
        const customerObj = {
          formId: customer.formId,
          redirects: {}
        };

        // Weiterleitungen zum Kunden hinzufügen
        redirects.forEach(redirect => {
          customerObj.redirects[redirect.code] = {
            am_id: redirect.am_id,
            empfehlungsgeber: redirect.empfehlungsgeber,
            createdAt: redirect.createdAt,
            updatedAt: redirect.updatedAt,
            count: redirect.count
          };
        });

        // Kunden und alle zugehörigen Weiterleitungen löschen
        db.run("DELETE FROM customers WHERE id = ?", [kundenname], function(err) {
          if (err) {
            console.error('Fehler beim Löschen des Kunden:', err.message);
            return res.status(500).json({
              success: false,
              error: 'Fehler beim Löschen des Kunden'
            });
          }

          res.json({
            success: true,
            deleted: {
              customer: kundenname,
              details: customerObj
            }
          });
        });
      }
    );
  });
});

// Admin-Route zum Löschen einer Weiterleitung bei einem Kunden - mit Token-Schutz
app.get('/admin/customer/:kundenname/delete/:code', verifyAdminToken, (req, res) => {
  const kundenname = req.params.kundenname;
  const code = req.params.code;

  // Prüfen, ob der Kunde existiert
  db.get("SELECT id FROM customers WHERE id = ?", [kundenname], (err, customer) => {
    if (err) {
      console.error('Datenbankfehler:', err.message);
      return res.status(500).json({
        success: false,
        error: 'Datenbankfehler'
      });
    }

    if (!customer) {
      return res.status(404).json({
        success: false,
        error: 'Kunde nicht gefunden'
      });
    }

    // Weiterleitungsdetails abrufen
    db.get(
      "SELECT code, am_id, empfehlungsgeber, createdAt, updatedAt, count FROM redirects WHERE customer_id = ? AND code = ?", 
      [kundenname, code], 
      (err, redirect) => {
        if (err) {
          console.error('Datenbankfehler:', err.message);
          return res.status(500).json({
            success: false,
            error: 'Datenbankfehler'
          });
        }

        if (!redirect) {
          return res.status(404).json({
            success: false,
            error: 'Code nicht gefunden'
          });
        }

        // Weiterleitungsobjekt für die Antwort erstellen
        const redirectObj = {
          am_id: redirect.am_id,
          empfehlungsgeber: redirect.empfehlungsgeber,
          createdAt: redirect.createdAt,
          updatedAt: redirect.updatedAt,
          count: redirect.count
        };

        // Weiterleitung löschen
        db.run(
          "DELETE FROM redirects WHERE customer_id = ? AND code = ?", 
          [kundenname, code], 
          function(err) {
            if (err) {
              console.error('Fehler beim Löschen der Weiterleitung:', err.message);
              return res.status(500).json({
                success: false,
                error: 'Fehler beim Löschen der Weiterleitung'
              });
            }

            res.json({
              success: true,
              deleted: {
                customer: kundenname,
                code: code,
                details: redirectObj
              }
            });
          }
        );
      }
    );
  });
});

// Route zum Anzeigen der Details einer bestimmten Weiterleitung
app.get('/admin/customer/:kundenname/redirect/:am_id', verifyAdminToken, (req, res) => {
  const kundenname = req.params.kundenname;
  const amId = req.params.am_id;

  // Prüfen, ob der Kunde existiert
  db.get("SELECT id FROM customers WHERE id = ?", [kundenname], (err, customer) => {
    if (err) {
      console.error('Datenbankfehler:', err.message);
      return res.status(500).json({
        success: false,
        error: 'Datenbankfehler'
      });
    }

    if (!customer) {
      return res.status(404).json({
        success: false,
        error: 'Kunde nicht gefunden'
      });
    }

    // Weiterleitungsdetails abrufen
    db.get(
      "SELECT code, am_id, empfehlungsgeber, createdAt, updatedAt, count FROM redirects WHERE customer_id = ? AND code = ?", 
      [kundenname, amId], 
      (err, redirect) => {
        if (err) {
          console.error('Datenbankfehler:', err.message);
          return res.status(500).json({
            success: false,
            error: 'Datenbankfehler'
          });
        }

        if (!redirect) {
          return res.status(404).json({
            success: false,
            error: 'Weiterleitung nicht gefunden'
          });
        }

        res.json({
          success: true,
          redirect: {
            am_id: redirect.am_id,
            empfehlungsgeber: redirect.empfehlungsgeber,
            createdAt: redirect.createdAt,
            updatedAt: redirect.updatedAt,
            count: redirect.count
          }
        });
      }
    );
  });
});

// Schließe die Datenbank, wenn der Server heruntergefahren wird
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Datenbankverbindung geschlossen');
    process.exit(0);
  });
});

// Startseite
app.get('/', (req, res) => {
  res.send('Weiterleitungsservice aktiv');
});

// Server starten
app.listen(port, () => {
  console.log(`Weiterleitungsservice läuft auf Port ${port}`);
  console.log(`Admin-Bereich ist mit Token geschützt`);
});