$(document).ready(function() {
  let table; // Déclarer la variable table en dehors de la fonction chargerHistorique

  // Fonction pour charger l'historique des ventes
  function chargerHistorique() {
      window.electron.chargerHistorique()
          .then(ventes => {
              const tableBody = $('#historiqueTable tbody');
              tableBody.empty(); // Effacer les anciennes données

              ventes.forEach(vente => {
                  const row = `
                      <tr>
                          <td>${vente.date_vente}</td>
                          <td>${vente.nom_produit}</td>
                          <td>${vente.quantite}</td>
                          <td>${vente.prix_unitaire}</td>
                          <td>${vente.prix_total}</td>
                          <td><button onclick="deleteVente(${vente.id})" class="btn btn-danger">Supprimer</button></td>
                      </tr>
                  `;
                  tableBody.append(row);
              });

              // Initialiser DataTables après avoir ajouté les données
              table = $('#historiqueTable').DataTable({ // Assigner l'instance DataTable à la variable table
                  language: {
                      url: 'assets/json/fr-FR.json'
                  },
              });
          })
          .catch(err => {
              console.error("Erreur lors de la récupération de l'historique des ventes:", err);
          });
  }

  // Fonction pour calculer et afficher le prix total en fonction des données filtrées
  function calculerEtAfficherPrixTotal(filteredData) {
      let total = 0;
      filteredData.forEach(data => {
          total += parseFloat(data[4]); // Ajouter le prix total (5ème colonne)
      });
      alert(`Prix total des ventes : ${total.toFixed(2)}`);
  }

  // Fonction pour rechercher par date
  window.rechercherParDate = function() {
      const dateRecherche = $('#dateSearch').val();

      // Vérifier si le champ de date est vide
      if (!dateRecherche) {
          alert("Veuillez saisir une date.");
          return;
      }

      let filteredData = [];

      // Filtrer les données du tableau en fonction de la date
      table.rows().every(function() {
          const data = this.data();
          if (data[0] === dateRecherche) { // Comparer la date (1ère colonne)
              filteredData.push(data);
            }
          });
          calculerEtAfficherPrixTotal(filteredData);
      }
  
      // Fonction pour rechercher par nom de produit (MODIFIÉE)
     /* window.rechercherParProduit = function() {
          // Ouvrir une boîte de dialogue pour demander le nom du produit
          const nomProduitRecherche = prompt("Veuillez saisir le nom du produit à rechercher:");
  
          // Vérifier si l'utilisateur a annulé la saisie
          if (nomProduitRecherche === null) {
              return; // L'utilisateur a annulé, ne rien faire
          }
  
          // Vérifier si le champ de nom de produit est vide
          if (!nomProduitRecherche) {
              alert("Veuillez saisir un nom de produit.");
              return;
          }
  
          let filteredData = [];
  
          // Filtrer les données du tableau en fonction du nom du produit
          table.rows().every(function() {
              const data = this.data();
              if (data[1].toLowerCase().includes(nomProduitRecherche.toLowerCase())) { // Comparer le nom du produit (2ème colonne)
                  filteredData.push(data);
              }
          });
          calculerEtAfficherPrixTotal(filteredData);
      }*/

           // Fonction pour rechercher par nom de produit (MODIFIÉE)
    window.rechercherParProduit = async function() {
      // Ouvrir une boîte de dialogue pour demander le nom du produit
      const result = await window.electron.showProductNameDialog();

      // Vérifier si l'utilisateur a annulé la saisie ou n'a rien entré
      if (result === null || result.trim() === "") {
          return; // L'utilisateur a annulé ou n'a rien saisi, ne rien faire
      }

      const nomProduitRecherche = result;
      let filteredData = [];

      // Filtrer les données du tableau en fonction du nom du produit
      table.rows().every(function() {
          const data = this.data();
          if (data[1].toLowerCase().includes(nomProduitRecherche.toLowerCase())) { // Comparer le nom du produit (2ème colonne)
              filteredData.push(data);
          }
      });
      calculerEtAfficherPrixTotal(filteredData);
  }
  
      // Fonction pour rechercher par période
      window.rechercherParPeriode = function() {
          const startDate = $('#startDate').val();
          const endDate = $('#endDate').val();
  
          // Vérifier si les champs de date sont vides
          if (!startDate || !endDate) {
              alert("Veuillez saisir une date de début et une date de fin.");
              return;
          }
  
          // Valider que la date de début est antérieure à la date de fin
          if (startDate > endDate) {
              alert("La date de début doit être antérieure à la date de fin.");
              return;
          }
  
          let filteredData = [];
  
          // Filtrer les données du tableau en fonction de la période
          table.rows().every(function() {
              const data = this.data();
              const dateVente = data[0];
  
              if (dateVente >= startDate && dateVente <= endDate) {
                  filteredData.push(data);
              }
          });
          calculerEtAfficherPrixTotal(filteredData);
      }
  
      // Charger l'historique au chargement de la page
      chargerHistorique();
  });
  
  function navigateToProduit() {
      window.electron.openProduitWindow(); // Envoyer un message au processus principal
  }