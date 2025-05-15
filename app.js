const express = require('express');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;
const dotenv = require('dotenv');

// .env Datei für Umgebungsvariablen laden
dotenv.config();

// Sicherheitseinstellungen
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'sefrin-secure-token-change-me';
const DATA_FILE = path.join(__dirname, 'redirects.json');

// Laden der Kunden- und Weiterleitungsdaten aus Datei oder Initialisierung
let customerMap = {};

function loadCustomerMap() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      customerMap = JSON.parse(data);
      console.log(`Kundendaten geladen: ${Object.keys(customerMap).length} Einträge`);
    } else {
      // Beispiel-Kunde hinzufügen, wenn die Datei nicht existiert
      customerMap = {
        'beispielkunde': {
          formId: 'tjjsnG0hJTcpwDEhxzpx',
          redirects: {
            'hanswurst1413': {
              am_id: 'hanswurst1413',
              empfehlungsgeber: 'Hans Wurst',
              createdAt: new Date().toLocaleString('de-DE', { timeZone: 'Europe/Berlin' });
              updatedAt: new Date().toLocaleString('de-DE', { timeZone: 'Europe/Berlin' });
              count: 0 // Anzahl der Aufrufe
            }
          }
        }
      };
      saveCustomerMap();
      console.log('Neue Kundendatei mit Beispieleintrag erstellt');
    }
  } catch (error) {
    console.error('Fehler beim Laden der Kundendaten:', error);
    // Fallback zu einer leeren Map
    customerMap = {};
  }
}

// Speichern der Kundendaten in Datei
function saveCustomerMap() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(customerMap, null, 2), 'utf8');
    console.log('Kundendaten gespeichert');
    return true;
  } catch (error) {
    console.error('Fehler beim Speichern der Kundendaten:', error);
    return false;
  }
}

// Beim Start Kundendaten laden
loadCustomerMap();

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
  
  // Prüfen, ob der Kunde existiert
  if (!customerMap[kundenname]) {
    return res.status(404).send('Kunde nicht gefunden');
  }
  
  // Prüfen, ob der Code beim Kunden existiert
  if (customerMap[kundenname].redirects[code]) {
    const params = customerMap[kundenname].redirects[code];
    const formId = customerMap[kundenname].formId;
    const baseUrl = `https://api.leadconnectorhq.com/widget/form/${formId}`;
    const redirectUrl = `${baseUrl}?am_id=${encodeURIComponent(params.am_id)}&empfehlungsgeber=${encodeURIComponent(params.empfehlungsgeber)}`;
    
    // Anzahl der Aufrufe erhöhen und Timestamp aktualisieren
    params.count += 1;
    params.updatedAt = new Date().toLocaleString('de-DE', { timeZone: 'Europe/Berlin' }); // Deutsche Zeit
    
    // Änderungen speichern
    saveCustomerMap();
    
    // 302 Redirect (temporäre Weiterleitung)
    return res.redirect(302, redirectUrl);
  }
  
  // Code nicht gefunden
  res.status(404).send('Weiterleitungs-Code nicht gefunden');
});

// Admin-Route zum Erstellen eines neuen Kunden - mit Token-Schutz
app.get('/admin/customer/create/:kundenname/:formId', verifyAdminToken, (req, res) => {
  const kundenname = req.params.kundenname;
  const formId = req.params.formId;
  
  // Prüfen, ob Kunde bereits existiert
  if (customerMap[kundenname]) {
    return res.status(400).json({
      success: false,
      error: 'Kunde existiert bereits'
    });
  }
  
  // Neuen Kunden anlegen
  customerMap[kundenname] = {
    formId: formId,
    redirects: {}
  };
  
  // Änderungen speichern
  const saved = saveCustomerMap();
  
  res.json({
    success: saved,
    customer: kundenname,
    formId: formId
  });
});

// Admin-Route zum dynamisch Erstellen neuer Codes für einen Kunden - mit Token-Schutz
app.get('/admin/customer/:kundenname/create/:name/:am_id', verifyAdminToken, (req, res) => {
  const kundenname = req.params.kundenname;
  const name = req.params.name;
  const amId = req.params.am_id;
  
  // Prüfen, ob Kunde existiert
  if (!customerMap[kundenname]) {
    return res.status(404).json({
      success: false,
      error: 'Kunde nicht gefunden'
    });
  }
  
  // Prüfen, ob die am_id bereits für diesen Kunden existiert
  if (customerMap[kundenname].redirects[amId]) {
    return res.json({
      success: false,
      code: amId,
      error: 'Weiterleitung mit dieser am_id existiert bereits'
    });
  }
  
  // Überprüfen, ob die Kombination aus Empfehlungsgeber und am_id bereits existiert
  for (const existingCode in customerMap[kundenname].redirects) {
    const redirect = customerMap[kundenname].redirects[existingCode];
    if (redirect.am_id === amId && redirect.empfehlungsgeber === name) {
      return res.json({
        success: false,
        code: existingCode,
        error: 'Kombination aus Empfehlungsgeber und am_id existiert bereits'
      });
    }
  }
  
  // Code (am_id) zur Map hinzufügen
  customerMap[kundenname].redirects[amId] = {
    am_id: amId,
    empfehlungsgeber: name,
    createdAt: new Date().toISOString(), // Erstellungsdatum
    updatedAt: new Date().toISOString(), // Letztes Update
    count: 0 // Anzahl der Aufrufe
  };
  
  // Änderungen speichern
  const saved = saveCustomerMap();
  
  // Vollständige URL zurückgeben
  const fullUrl = `${req.protocol}://${req.get('host')}/${kundenname}/${amId}`;
  
  res.json({
    success: saved,
    customer: kundenname,
    code: amId,
    redirectUrl: fullUrl
  });
});

// Admin-Route zum Anzeigen aller Kunden - mit Token-Schutz
app.get('/admin/customer/list', verifyAdminToken, (req, res) => {
  res.json({
    count: Object.keys(customerMap).length,
    customers: customerMap
  });
});

// Admin-Route zum Anzeigen eines bestimmten Kunden - mit Token-Schutz
app.get('/admin/customer/:kundenname', verifyAdminToken, (req, res) => {
  const kundenname = req.params.kundenname;
  
  if (customerMap[kundenname]) {
    res.json({
      customer: kundenname,
      details: customerMap[kundenname]
    });
  } else {
    res.status(404).json({
      success: false,
      error: 'Kunde nicht gefunden'
    });
  }
});

// Admin-Route zum Löschen eines Kunden - mit Token-Schutz
app.get('/admin/customer/:kundenname/delete', verifyAdminToken, (req, res) => {
  const kundenname = req.params.kundenname;
  
  if (customerMap[kundenname]) {
    const deleted = customerMap[kundenname];
    delete customerMap[kundenname];
    
    // Änderungen speichern
    const saved = saveCustomerMap();
    
    res.json({
      success: saved,
      deleted: {
        customer: kundenname,
        details: deleted
      }
    });
  } else {
    res.status(404).json({
      success: false,
      error: 'Kunde nicht gefunden'
    });
  }
});

// Admin-Route zum Löschen einer Weiterleitung bei einem Kunden - mit Token-Schutz
app.get('/admin/customer/:kundenname/delete/:code', verifyAdminToken, (req, res) => {
  const kundenname = req.params.kundenname;
  const code = req.params.code;
  
  if (!customerMap[kundenname]) {
    return res.status(404).json({
      success: false,
      error: 'Kunde nicht gefunden'
    });
  }
  
  if (customerMap[kundenname].redirects[code]) {
    const deleted = customerMap[kundenname].redirects[code];
    delete customerMap[kundenname].redirects[code];
    
    // Änderungen speichern
    const saved = saveCustomerMap();
    
    res.json({
      success: saved,
      deleted: {
        customer: kundenname,
        code: code,
        details: deleted
      }
    });
  } else {
    res.status(404).json({
      success: false,
      error: 'Code nicht gefunden'
    });
  }
});

// Route zum Anzeigen der Details einer bestimmten Weiterleitung
app.get('/admin/customer/:kundenname/redirect/:am_id', verifyAdminToken, (req, res) => {
  const kundenname = req.params.kundenname;
  const amId = req.params.am_id;

  // Prüfen, ob der Kunde existiert
  if (!customerMap[kundenname]) {
    return res.status(404).json({
      success: false,
      error: 'Kunde nicht gefunden'
    });
  }

  // Prüfen, ob die Weiterleitung existiert
  if (customerMap[kundenname].redirects[amId]) {
    const redirect = customerMap[kundenname].redirects[amId];
    return res.json({
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

  // Weiterleitung nicht gefunden
  res.status(404).json({
    success: false,
    error: 'Weiterleitung nicht gefunden'
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