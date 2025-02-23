const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

let mainWindow;
const db = new sqlite3.Database('./gym.db', (err) => {
    if (err) {
        console.error('Erreur lors de l\'ouverture de la base de données', err);
    } else {
        console.log('Connexion à la base de données réussie');
        db.run(`CREATE TABLE IF NOT EXISTS membres (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nom TEXT,
            prenom TEXT,
            email TEXT,
            photo TEXT
        )`);
    }
});

app.whenReady().then(() => {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });
    mainWindow.loadFile(path.join(__dirname, 'index.html'));
});

// Ajouter un membre
ipcMain.on('ajouter-membre', (event, membre) => {
    db.run('INSERT INTO membres (nom, prenom, email, photo) VALUES (?, ?, ?, ?)',
        [membre.nom, membre.prenom, membre.email, membre.photo],
        function (err) {
            if (err) {
                console.error('Erreur lors de l\'ajout du membre :', err);
            } else {
                event.reply('membre-ajoute', { id: this.lastID, ...membre });
            }
        }
    );
});

// Charger les membres
ipcMain.on('charger-membres', (event) => {
    db.all('SELECT * FROM membres', [], (err, rows) => {
        if (err) {
            console.error('Erreur lors du chargement des membres :', err);
        } else {
            event.reply('membres-charges', rows);
        }
    });
});

// Supprimer un membre
ipcMain.on('supprimer-membre', (event, id) => {
    db.run('DELETE FROM membres WHERE id = ?', [id], (err) => {
        if (err) {
            console.error('Erreur lors de la suppression du membre :', err);
        } else {
            event.reply('membre-supprime', id);
        }
    });
});

// Modifier un membre
ipcMain.on('modifier-membre', (event, membre) => {
    db.run('UPDATE membres SET nom = ?, prenom = ?, email = ?, photo = ? WHERE id = ?',
        [membre.nom, membre.prenom, membre.email, membre.photo, membre.id],
        (err) => {
            if (err) {
                console.error('Erreur lors de la modification du membre :', err);
            } else {
                event.reply('membre-modifie', membre);
            }
        }
    );
});
