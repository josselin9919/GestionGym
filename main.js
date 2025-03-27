const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');  // ✅ Importer fs ici
const sqlite3 = require('sqlite3').verbose();
let db;

// Fonction pour créer la table si elle n'existe pas déjà
function createDatabase() {
     db = new sqlite3.Database(path.join(__dirname, 'members.db'), (err) => {
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
            NCNI TEXT NOT NULL,
            nom TEXT NOT NULL,
            age INTEGER,
            quartier TEXT,
            sexe TEXT,
            tel TEXT,
            date_i TEXT,
            date_D TEXT,
            date_F TEXT,
            photo TEXT
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
            date_p TEXT,
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
    db.run(`CREATE TABLE IF NOT EXISTS Paiement (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        id_membre INTEGER REFERENCES Membre(id),
        montant REAL,
        datePaiement DATE
    );
    `, (err) => {
        if (err) {
            console.error('Erreur de création de la table Parametre:', err.message);
        } else {
            console.log('Table Parametre créée ou déjà existante');
        }
    });




    //code patrick
        // Créer la table Membre si elle n'existe pas
        db.run(`
            CREATE TABLE IF NOT EXISTS produits (
                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                  nom TEXT NOT NULL,
                  prix REAL NOT NULL,
                  quantite REAL NOT NULL
                 
                  
              );
          `, (err) => {
              if (err) {
                  console.error('Erreur de création de la table produit:', err.message);
              } else {
                  console.log('Table produits créée ou déjà existante');
              }
          });
      
          
          db.run(`
             CREATE TABLE IF NOT EXISTS vente (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date_vente TEXT NOT NULL,
        produit_id INTEGER NOT NULL,
        nom_produit TEXT,
        quantite INTEGER NOT NULL,
        prix_unitaire REAL NOT NULL,
        prix_total REAL NOT NULL,
        FOREIGN KEY (produit_id) REFERENCES produits(id)
        );
          `, (err) => {
              if (err) {
                  console.error('Erreur de création de la table vente:', err.message);
              } else {
                  console.log('Table vente créée ou déjà existante');
              }
          });

}

// Création de la fenêtre principale
function createWindow() {
    const win = new BrowserWindow({
        width: 1600,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),  // ✅ Vérifie bien ce chemin !
            contextIsolation: true,
            enableRemoteModule: false,
            //nodeIntegration: false  ✅ Désactiver nodeIntegration pour la sécurité
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
        const { NCNI, nom, age, quartier, sexe, tel, date_i, date_D, date_F, photoData } = memberData;
    const uploadsDir = path.join(__dirname, 'uploads');

    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir);
    }

    let imagePath = null;

    if (photoData) {
        const base64Data = photoData.replace(/^data:image\/\w+;base64,/, ""); // Nettoyage
        const buffer = Buffer.from(base64Data, 'base64');
        const fileName = `photo_${Date.now()}.png`;
        imagePath = path.join(uploadsDir, fileName);

        fs.writeFileSync(imagePath, buffer); // Enregistre l'image
    }

    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(path.join(__dirname, 'members.db'));
        db.run(`INSERT INTO Membre (NCNI, nom, age, quartier, sexe, tel, date_i, date_D, date_F, photo) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
            [NCNI, nom, age, quartier, sexe, tel, date_i, date_D, date_F, imagePath], 
            function(err) {
                if (err) reject(err.message);
                else resolve("Membre ajouté avec succès !");
                db.close();
            }
        );
    });

    });
    // Gestion des paramètres
ipcMain.handle('add-param', async (event, paramData) => {
    const { id_membre, poids, taille, tension, glycemie,date_p } = paramData;
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(path.join(__dirname, 'members.db'));
        db.run(`INSERT INTO Parametre (poids, taille, tension, glycemie, date_p, id_membre) VALUES (?, ?, ?, ?, ?, ?)`,
            [poids, taille, tension, glycemie, date_p, id_membre], function(err) {
                if (err) reject(err.message);
                else resolve('Paramètre ajouté avec succès!');
            });
    });
});

ipcMain.handle('add-paye', async (event, payeData) => {
    const { id_membre, montant, date_P , date_D, date_F} = payeData;
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(path.join(__dirname, 'members.db'));
        db.run(`INSERT INTO Paiement (montant, datePaiement, id_membre) VALUES (?, ?, ?)`,
            [ montant, date_P, id_membre], function(err) {
                if (err) reject(err.message);
                else resolve('payement ajouté avec succès!');
            });
        db.run(`UPDATE Membre SET date_D = ?, date_F = ? WHERE id = ?`,
            [ date_D, date_F, id_membre], function(err) {
                if (err) reject(err.message);
                else resolve('date modifier avec succès!');
            });
    });
});

ipcMain.handle('load-parametre', async (event, id_membre) => {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(path.join(__dirname, 'members.db'));
        db.all('SELECT * FROM Parametre WHERE id_membre = ?', [id_membre], (err, rows) => {
            if (err) reject(err.message);
            else resolve(rows);
        });
        db.close(); // ✅ Fermeture propre
    });
});

ipcMain.handle('load-payement', async (event, id_membre) => {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(path.join(__dirname, 'members.db'));
        db.all('SELECT * FROM Paiement WHERE id_membre = ?', [id_membre], (err, rows) => {
            if (err) reject(err.message);
            else resolve(rows);
        });
        db.close(); // ✅ Fermeture propre
    });
});
// Mise à jour d'un membre
ipcMain.handle('update-member', async (event, memberData) => {
    const { id, NCNI, nom, age, quartier, sexe, tel, date_i, date_D, date_F } = memberData;

    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(path.join(__dirname, 'members.db'));

        db.run(
            `UPDATE Membre SET nom = ?, prenom = ?, age = ?, quartier = ?, sexe = ?, tel = ?, date_i = ?, date_D = ?, date_F = ? WHERE id = ?`,
            [NCNI, nom, age, quartier, sexe, tel, date_i, date_D, date_F, id],
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


//code patrick

ipcMain.on('open-historique-window', () => {
    if (!historiqueWindow) {
        historiqueWindow = new BrowserWindow({
            width: 800,
            height: 600,
            webPreferences: {
                preload: path.join(__dirname, 'preload.js'),
                contextIsolation: true,
                enableRemoteModule: false,
            }
        });

        historiqueWindow.loadFile('historique.html');

        historiqueWindow.on('closed', () => {
            historiqueWindow = null;
        });
    } else {
        historiqueWindow.focus();
    }
});






// Charger les produits depuis la base de données
ipcMain.handle('load-products', async () => {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(path.join(__dirname, 'members.db'), (err) => {
            if (err) {
                reject(err.message);
                return;
            }
            console.log('Connexion à la base de données réussie');
        });

        db.all('SELECT * FROM produits', [], (err, rows) => {
            console.log('Connexion à la base de données réussie');
            if (err) {
                reject(err.message);
            } else {
                resolve(rows); // Renvoie les membres au renderer
            }
        });
    });
});


// Écouter les demandes d'ajout de membre
ipcMain.handle('add-product', async (event, productData) => {
    const { nom, prix, quantite, image_data} = productData;

return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(path.join(__dirname, 'members.db'));

    db.run(`INSERT INTO produits (nom, prix, quantite ) 
            VALUES (?, ?, ?)`, 
        [nom, prix, quantite], 
        function(err) {
            if (err) {
                console.error("Erreur SQL:", err.message);
                reject(err.message);
            } else {
                resolve("Produit ajouté avec succès !");
            }
            db.close(); // ✅ Fermeture propre de la connexion
        }
    );
});

});




// Mise à jour d'un Produit
ipcMain.handle('update-product', async (event, productData) => {
const { id, nom, prix, quantite } = productData;

return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(path.join(__dirname, 'members.db'));

    db.run(
        `UPDATE produits SET nom = ?, prix = ?, quantite = ? WHERE id = ?`,
        [nom, prix, quantite, id],
        function (err) {
            if (err) reject(err.message);
            else resolve('Produit modifié avec succès!');
        }
    );
});
});

// Suppression d'un produit
ipcMain.handle('delete-product', async (event, id) => {
return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(path.join(__dirname, 'members.db'));

    db.run(`DELETE FROM produits WHERE id = ?`, [id], function (err) {
        if (err) reject(err.message);
        else resolve('Produit supprimé avec succès!');
    });
});
})// Récupérer les noms des produits
ipcMain.handle('get-product-names', async (event) => {
   return new Promise((resolve, reject) => {
     db.all("SELECT id, nom, quantite, prix FROM produits", [], (err, rows) => { // Ne sélectionnez que l'ID et le nom
       if (err) {
         console.error("Erreur lors de la récupération des noms de produits:", err.message);
         reject(err);
       } else {
         const productNames = rows.map(row => ({ id: row.id, nom: row.nom, quantite: row.quantite, prix: row.prix })); //Formater les données
         resolve(productNames); // Envoyer les noms et quantités des produits
       }
     });
   });
 });

 //Récupérer les infos d'un produit spécifique
 ipcMain.handle('get-product-info', async (event, productId) => {
   return new Promise((resolve, reject) => {
     db.get("SELECT id, nom, prix, quantite FROM produits WHERE id = ?", [productId], (err, row) => {
       if (err) {
         console.error("Erreur lors de la récupération des informations du produit:", err.message);
         reject(err);
       } else {
         resolve(row); // Envoyer les informations du produit
       }
     });
   });
 });

 //Mettre à jour le stock apres la vente d'un produit
 ipcMain.handle('update-stock', async (event, productId, newQuantity) => {
   return new Promise((resolve, reject) => {
     if (!db) {
       console.error("La connexion à la base de données n'est pas établie.");
       reject(new Error("La connexion à la base de données n'est pas établie."));
       return;
     }
     db.run(
       "UPDATE produits SET quantite = ? WHERE id = ?",
       [newQuantity, productId],
       function (err) {
         if (err) {
           console.error("Erreur lors de la mise à jour du stock:", err.message);
           reject(err);
         } else {
           console.log(`Stock du produit ${productId} mis à jour à ${newQuantity}`);
           resolve(); // Indiquer le succès
         }
       }
     );
   });
 });

 ipcMain.handle('augmenter-stock', async (event, productId, quantiteARemettre) => {
   return new Promise((resolve, reject) => {
     if (!db) {
       console.error("La connexion à la base de données n'est pas établie.");
       reject(new Error("La connexion à la base de données n'est pas établie."));
       return;
     }
     db.run(
       "UPDATE produits SET quantite = ? WHERE id = ?",
       [quantiteARemettre, productId], // On additionne au lieu de soustraire
       function (err) {
         if (err) {
           console.error("Erreur lors de la mise à jour du stock:", err.message);
           reject(err);
         } else {
           console.log(`Stock du produit ${productId} augmenté de ${quantiteARemettre}`);
           resolve(); // Indiquer le succès
         }
       }
     );
   });
 });;

 ipcMain.on('create-new-facture', () => {
    createFactureWindow();
  });
 
 ipcMain.handle('enregistrer-vente', async (event, produitsVendus, prixTotalGeneral, dateVente) => {
    return new Promise((resolve, reject) => {
      if (!db) {
        console.error("La connexion à la base de données n'est pas établie.");
        reject(new Error("La connexion à la base de données n'est pas établie."));
        return;
      }
  
      // Utiliser une transaction pour garantir l'intégrité des données
      db.serialize(() => {
        db.run("BEGIN TRANSACTION");
  
        try {
          // Insérer chaque produit vendu dans la table vente
          const stmt = db.prepare("INSERT INTO vente (date_vente, produit_id, nom_produit, quantite, prix_unitaire, prix_total) VALUES (?, ?, ?, ?, ?, ?)");
          produitsVendus.forEach(produit => {
            const prixTotalPourCetArticle = produit.quantite * produit.prixUnitaire;
            stmt.run(dateVente, produit.produitId, produit.nom, produit.quantite, produit.prixUnitaire, prixTotalPourCetArticle);
          });
          stmt.finalize();
  
          db.run("COMMIT");
          console.log("Vente enregistrée avec succès.");
          resolve();
  
        } catch (err) {
          db.run("ROLLBACK");
          console.error("Erreur lors de l'enregistrement de la vente:", err.message);
          reject(err);
  
        }
      });
    });
  });
 
 
 
 
  ipcMain.handle('get-historique-ventes', async () => {
    return new Promise((resolve, reject) => {
      db.all("SELECT id, date_vente, produit_id, nom_produit, prix_unitaire, quantite, prix_total FROM vente", [], (err, rows) => {
        if (err) {
          console.error("Erreur lors de la récupération de l'historique des ventes:", err.message);
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  });
 
  //pour fermer la facture actuelle
  ipcMain.on('fermer-facture-actuelle', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender); // Récupérer la fenêtre actuelle
    if (win) {
      win.close();
    }
  });
 
 
 
 
 // Suppression d'une vente
 ipcMain.handle('delete-vente', async (event, id) => {
  return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(path.join(__dirname, 'members.db'));
 
      db.run(`DELETE FROM vente WHERE id = ?`, [id], function (err) {
          if (err) reject(err.message);
          else resolve('Vente supprimée avec succès!');
      });
  });
 });
 
 
 ipcMain.on('open-produit-window', () => {
  win.loadFile('index.html'); // Charger produit.html dans la fenêtre principale
 });
 
 
 
 ipcMain.handle('show-product-name-dialog', async () => {
    const result = await dialog.showMessageBox({
        title: 'Rechercher par nom de produit',
        message: 'Veuillez saisir le nom du produit à rechercher:',
        buttons: ['OK', 'Annuler'],
        type: 'question', // Specifies the message box’s type. Can be "none", "info", "warning", "question" or "error".
        defaultId: 0, // Specifies the index of the button that will be selected by default when the message box opens.
        cancelId: 1,
        noLink: true, // false to display links in the dialog
        checkboxLabel: null, // String to display as the dialog’s checkbox label.
        checkboxChecked: false, // Initial state of the checkbox.
        text: "",
         message: 'Veuillez saisir le nom du produit à rechercher:',
        detail: "",
        icon: null,
        customImage: null,
        normalizeAccessKeys: true,
        selecteAll: false,
         inputPlaceholder: "Nom du produit",
          optionstype: 'input'  // Utiliser 'input' pour afficher un champ de saisie
 
    });
 
    if (result.response === 0) { // OK button clicked
        return result.value; // Return the entered value
    } else {
        return null; // Return null if cancelled
    }
 });

 ipcMain.on('fermer-facture-actuelle', (event) => {
    const win = BrowserWindow.getFocusedWindow()
    if (win) win.close()
 
  })
  

 // main.js
let factureWindows = []; // Tableau pour stocker les références à toutes les fenêtres de facture
function createFactureWindow() {

  
 const factureWindow = new BrowserWindow({
   width: 1800,
   height: 1000,
   webPreferences: {
     nodeIntegration: false,
     contextIsolation: true,
     preload: path.join(__dirname, 'preload.js'),
   },
   
 });
 factureWindow.loadFile('vente.html');
  
 


 


 //jusqu'a la ligne 288 pour ouvrir l'historique des ventes
 /*function createHistoriqueWindow() {
   const historiqueWindow = new BrowserWindow({
     width: 800,
     height: 600,
     webPreferences: {
       nodeIntegration: false,
       contextIsolation: true,
       preload: path.join(__dirname, 'preload.js'),
     },
   });

   historiqueWindow.loadFile('historique.html');
 }*/

ipcMain.on('open-historique-window', () => {
 createHistoriqueWindow();
});

 // Gérer la fermeture de la fenêtre
 factureWindow.on('closed', () => {
   factureWindows = factureWindows.filter(win => win !== factureWindow); // Retirer la fenêtre fermée du tableau
 });

 factureWindows.push(factureWindow); // Ajouter la nouvelle fenêtre au tableau

 return factureWindow; // Retourner la fenêtre nouvellement créée
}


}



ipcMain.handle('navigate-to-vente',async () => {
win.loadFile('vente.html');
});

ipcMain.handle('navigate-to-index',async () => {
win.loadFile('index.html');
});

ipcMain.handle('navigate-to-index2',async () => {
win.loadFile('index.html');
});





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


//code patrick
// Création de la fenêtre principale
function createWindows() {
    win = new BrowserWindow({
       width: 1600,
       height: 800,
       webPreferences: {
           preload: path.join(__dirname, 'preload.js'),  // ✅ Vérifie bien ce chemin !
           contextIsolation: true,
           enableRemoteModule: false,
           nodeIntegration: false  //✅ Désactiver nodeIntegration pour la sécurité
       }
   });

   win.loadFile('index.html');





   
app.whenReady().then(() => {
   createDatabase(); // Créer la base de données et la table au démarrage
   createWindows();
});

app.on('window-all-closed', () => {
   if (process.platform !== 'darwin') {
       app.quit();
   }
});

app.on('activate', () => {
   if (BrowserWindow.getAllWindows().length === 0) {
       createWindows();
   }
});







}