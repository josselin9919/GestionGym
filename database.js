const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'gym.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS Membre (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nom TEXT,
        prenom TEXT,
        age INTEGER,
        quartier TEXT,
        sexe TEXT,
        tel TEXT UNIQUE,
        date_i DATE,
        date_D DATE,
        date_F DATE
    );`);

    db.run(`CREATE TABLE IF NOT EXISTS Parametre (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        poids REAL,
        taille REAL,
        tension TEXT,
        glycemie REAL,
        id_membre INTEGER REFERENCES Membre(id)
    );`);

    db.run(`CREATE TABLE IF NOT EXISTS Paiement (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        id_membre INTEGER REFERENCES Membre(id),
        montant REAL,
        datePaiement DATE
    );`);
});

module.exports = db;
