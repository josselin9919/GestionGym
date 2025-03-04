const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// Fonction pour créer la table si elle n'existe pas déjà
function createDatabase() {
    const db = new sqlite3.Database(path.join(__dirname, 'members.db'), (err) => {
        if (err) {
            console.error('Erreur de connexion à la base de données:', err.message);
            return;
        }
        console.log('Connexion à la base de données réussie');
    });

    // Créer la table Membre si elle n'existe pas
    db.run(`
        CREATE TABLE IF NOT EXISTS Membre (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nom TEXT NOT NULL,
            prenom TEXT NOT NULL,
            age INTEGER,
            quartier TEXT,
            sexe TEXT,
            tel TEXT,
            date_i TEXT,
            date_D TEXT,
            date_F TEXT
        )
    `, (err) => {
        if (err) {
            console.error('Erreur de création de la table:', err.message);
        } else {
            console.log('Table Membre créée ou déjà existante');
        }
    });
    db.run(`
        CREATE TABLE IF NOT EXISTS Parametre (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            poids DOUBLE,
            taille DOUBLE,
            tension TEXT,
            glycemie DOUBLE,
            id_membre INTEGER,
            FOREIGN KEY(id_membre) REFERENCES Membre(id)
        )
    `, (err) => {
        if (err) {
            console.error('Erreur de création de la table Parametre:', err.message);
        } else {
            console.log('Table Parametre créée ou déjà existante');
        }
    });
}

// Création de la fenêtre principale
function createWindow() {
    const win = new BrowserWindow({
        width: 1600,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            enableRemoteModule: false,
            nodeIntegration: false // Désactiver nodeIntegration dans le renderer pour plus de sécurité
        }
    });

    win.loadFile('index.html');

    // Charger les membres depuis la base de données
    ipcMain.handle('load-members', async () => {
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database(path.join(__dirname, 'members.db'), (err) => {
                if (err) {
                    reject(err.message);
                    return;
                }
                console.log('Connexion à la base de données réussie');
            });

            db.all('SELECT * FROM Membre', [], (err, rows) => {
                console.log('Connexion à la base de données réussie1222222');
                if (err) {
                    reject(err.message);
                } else {
                    resolve(rows); // Renvoie les membres au renderer
                }
            });
        });
    });

    // Écouter les demandes d'ajout de membre
    ipcMain.handle('add-member', async (event, memberData) => {
        const { nom, prenom, age, quartier, sexe, tel, date_i, date_D, date_F } = memberData;

        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database(path.join(__dirname, 'members.db'), (err) => {
                if (err) {
                    reject(err.message);
                    return;
                }
                console.log('Connexion à la base de données réussie');
            });

            db.run(`INSERT INTO Membre (nom, prenom, age, quartier, sexe, tel, date_i, date_D, date_F) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
                [nom, prenom, age, quartier, sexe, tel, date_i, date_D, date_F], function(err) {
                    if (err) {
                        reject(err.message);
                    } else {
                        resolve('Membre ajouté avec succès!');
                    }
                });
        });
    });
    // Gestion des paramètres
ipcMain.handle('add-param', async (event, paramData) => {
    const { id_membre, poids, taille, tension, glycemie } = paramData;
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(path.join(__dirname, 'members.db'));
        db.run(`INSERT INTO Parametre (poids, taille, tension, glycemie, id_membre) VALUES (?, ?, ?, ?, ?)`,
            [poids, taille, tension, glycemie, id_membre], function(err) {
                if (err) reject(err.message);
                else resolve('Paramètre ajouté avec succès!');
            });
    });
});

ipcMain.handle('load-parametres', async (event, id_membre) => {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(path.join(__dirname, 'members.db'));
        db.all('SELECT * FROM Parametre WHERE id_membre = ?', [id_membre], (err, rows) => {
            if (err) reject(err.message);
            else resolve(rows);
        });
    });
});
// Mise à jour d'un membre
ipcMain.handle('update-member', async (event, memberData) => {
    const { id, nom, prenom, age, quartier, sexe, tel, date_i, date_D, date_F } = memberData;

    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(path.join(__dirname, 'members.db'));

        db.run(
            `UPDATE Membre SET nom = ?, prenom = ?, age = ?, quartier = ?, sexe = ?, tel = ?, date_i = ?, date_D = ?, date_F = ? WHERE id = ?`,
            [nom, prenom, age, quartier, sexe, tel, date_i, date_D, date_F, id],
            function (err) {
                if (err) reject(err.message);
                else resolve('Membre modifié avec succès!');
            }
        );
    });
});

// Suppression d'un membre
ipcMain.handle('delete-member', async (event, id) => {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(path.join(__dirname, 'members.db'));

        db.run(`DELETE FROM Membre WHERE id = ?`, [id], function (err) {
            if (err) reject(err.message);
            else resolve('Membre supprimé avec succès!');
        });
    });
});
}



app.whenReady().then(() => {
    createDatabase(); // Créer la base de données et la table au démarrage
    createWindow();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
