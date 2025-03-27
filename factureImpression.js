document.addEventListener('DOMContentLoaded', () => {
    // Récupérer les données de la facture depuis le stockage local (par exemple)
    const factureData = JSON.parse(localStorage.getItem('factureData'));
  
    if (factureData) {
      // Remplir les informations du client
      document.getElementById('nomClient').textContent = factureData.nomClient;
  
      // Remplir le tableau des articles de la facture
      const factureItemsBody = document.getElementById('factureItemsBody');
      factureData.produitsVendus.forEach(produit => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${produit.nom}</td>
          <td>${produit.prixUnitaire}</td>
          <td>${produit.quantite}</td>
          <td>${produit.prixTotal}</td>
        `;
        factureItemsBody.appendChild(row);
      });
  
      // Remplir le total de la facture
      document.getElementById('totalFacture').textContent = factureData.prixTotal.toFixed(2) + " FCFA";
  
      // Remplir le total en lettres (fonction à implémenter)
      document.getElementById('totalFactureEnLettres').textContent = "(" + nombreEnLettres(factureData.prixTotal) + ")";
  
      // Remplir la date
      document.getElementById('dateFacture').textContent = factureData.dateVente;
      createNewFacture();
    } else {
      console.error("Aucune donnée de facture trouvée dans le stockage local.");
      alert("Erreur : Impossible de charger les données de la facture.");
    }
  
    function nombreEnLettres(nombre) {
      if (isNaN(nombre) || !Number.isInteger(nombre) || nombre < 0) {
        return "Nombre invalide";
      }
    
      if (nombre > 999999999) {
        return "Nombre trop grand (max 999 999 999)";
      }
    
      const unites = ["", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf"];
      const dix_a_dixneuf = ["dix", "onze", "douze", "treize", "quatorze", "quinze", "seize", "dix-sept", "dix-huit", "dix-neuf"];
      const dizaines = ["", "", "vingt", "trente", "quarante", "cinquante", "soixante", "soixante-dix", "quatre-vingts", "quatre-vingt-dix"];
      const centaines = ["", "cent", "deux cents", "trois cents", "quatre cents", "cinq cents", "six cents", "sept cents", "huit cents", "neuf cents"];
    
      function convertirInferieurA1000(n) {
        if (n < 10) {
          return unites[n];
        } else if (n < 20) {
          return dix_a_dixneuf[n - 10];
        } else if (n < 100) {
          const dix = Math.floor(n / 10);
          const unite = n % 10;
          let resultat = dizaines[dix];
          if (unite > 0) {
            resultat += "-" + unites[unite];
          }
          return resultat;
        } else {
          const cent = Math.floor(n / 100);
          const reste = n % 100;
          let resultat = centaines[cent];
          if (reste > 0) {
            resultat += " " + convertirInferieurA1000(reste);
          }
          return resultat;
        }
      }
    
      if (nombre === 0) {
        return "zéro";
      } else if (nombre < 1000) {
        return convertirInferieurA1000(nombre);
      } else if (nombre < 1000000) {
        const milliers = Math.floor(nombre / 1000);
        const reste = nombre % 1000;
        let resultat = convertirInferieurA1000(milliers) + " mille";
        if (reste > 0) {
          resultat += " " + convertirInferieurA1000(reste);
        }
        return resultat;
      } else {
        const millions = Math.floor(nombre / 1000000);
        const reste = nombre % 1000000;
        let resultat = convertirInferieurA1000(millions) + " million";
        if (millions > 1) {
          resultat += "s";  // Ajouter "s" pour les millions pluriels
        }
        if (reste > 0) {
          if (reste < 1000){
            resultat += " " + convertirInferieurA1000(reste);
          } else {
            resultat += " " + nombreEnLettres(reste); // Recursive call for the rest
          }
        }
        return resultat;
      }
    }
    
  });