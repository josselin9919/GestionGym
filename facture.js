
let factureItems = []; // Tableau pour stocker les produits ajoutés à la facture

  //Mettre à jour le stock (Augmenter)
  async function augmenterLeStock(productId, quantiteARemettre) {
    try {
      const productInfo = await window.electron.getProductInfo(productId);

      if (!productInfo) {
        console.error("Impossible de trouver les informations du produit avec l'ID:", productId);
        alert("Produit introuvable.");
        return;
      }

      if (typeof productInfo.quantite === 'undefined') {
        console.error("La propriété 'quantite' n'est pas définie dans l'objet productInfo:", productInfo);
        alert("Erreur: La quantité en stock n'est pas définie.");
        return;
      }

      const newQuantity = productInfo.quantite + quantiteARemettre; //On additionne au lieu de soustraire

      await window.electron.updateStock(productId, newQuantity); //on appelle le preload.js pour qu'il fasse le pont avec le main.js

    } catch (error) {
      console.error("Erreur lors de la mise à jour du stock:", error);
      alert("Erreur lors de la mise à jour du stock.");
    }
  }

//fonction pour annuler la facture
  async function annulerFacture() {
    const confirmation = confirm("Voulez-vous vraiment annuler la facture ? Toutes vos données seront perdues !!!!!");
  
    if (confirmation) {
      try {
        // Augmenter le stock de tous les produits dans la facture
        for (const item of factureItems) {
          await augmenterLeStock(item.id, item.quantite);
        }
  
        // charger le tableau de facture vide
        window.location.href = "vente.html"; // ou toute autre méthode pour naviguer
      } catch (error) {
        console.error("Erreur lors de la remise en stock des produits:", error);
        alert("Erreur lors de la remise en stock des produits.");
      }
    }
  }

document.addEventListener('DOMContentLoaded', async () => {
    const produitSelect = document.getElementById('produitSelect');
    const ajouterAuTableau = document.getElementById('ajouterAuTableau');
    const factureTableBody = document.querySelector('#factureTable tbody');
    const totalFactureSpan = document.getElementById('totalFacture');
    const quantiteInput = document.getElementById('quantiteInput');
  
  
    // Récupérer les noms des produits depuis le processus principal
    try {
      const productNames = await window.electron.getProductNames();
  
      // Remplir la liste déroulante
      productNames.forEach(product => {
        const option = document.createElement('option');
        option.value = product.id; // Utiliser l'ID comme valeur
        option.textContent = `${product.nom} => (Stock: ${product.quantite}) (Prix unitaire: ${product.prix})` ; // Afficher le nom et le stock
        produitSelect.appendChild(option);
        
           
        
      });
    } catch (error) {
      console.error("Erreur lors du chargement des noms de produits:", error);
    }
  
      //Mettre à jour le stock (diminuer)
    async function diminuerLeStock(productId, quantiteAchetee){
        try{
            const productInfo = await window.electron.getProductInfo(productId);
  
            if (!productInfo) {
              console.error("Impossible de trouver les informations du produit avec l'ID:", productId);
              alert("Produit introuvable.");
              return;
            }
  
            if (typeof productInfo.quantite === 'undefined') {
              console.error("La propriété 'quantite' n'est pas définie dans l'objet productInfo:", productInfo);
              alert("Erreur: La quantité en stock n'est pas définie.");
              return;
            }
  
            const newQuantity = productInfo.quantite - quantiteAchetee;
  
            await window.electron.updateStock(productId, newQuantity);
        }catch(error){
          console.error("Erreur lors de la mise à jour du stock:", error);
          alert("Erreur lors de la mise à jour du stock.");
        }
      }
  
      //Mettre à jour le stock (Augmenter)
    async function augmenterLeStock(productId, quantiteARemettre) {
      try {
        const productInfo = await window.electron.getProductInfo(productId);
  
        if (!productInfo) {
          console.error("Impossible de trouver les informations du produit avec l'ID:", productId);
          alert("Produit introuvable.");
          return;
        }
  
        if (typeof productInfo.quantite === 'undefined') {
          console.error("La propriété 'quantite' n'est pas définie dans l'objet productInfo:", productInfo);
          alert("Erreur: La quantité en stock n'est pas définie.");
          return;
        }
  
        const newQuantity = productInfo.quantite + quantiteARemettre; //On additionne au lieu de soustraire
  
        await window.electron.updateStock(productId, newQuantity); //on appelle le preload.js pour qu'il fasse le pont avec le main.js
  
      } catch (error) {
        console.error("Erreur lors de la mise à jour du stock:", error);
        alert("Erreur lors de la mise à jour du stock.");
      }
    }
  
    // Fonction pour ajouter un produit à la facture
    ajouterAuTableau.addEventListener('click', async () => {
      const productId = produitSelect.value;
      const quantiteAchetee = parseInt(quantiteInput.value);
  
      if (!productId) {
        alert("Veuillez sélectionner un produit.");
        return;
      }
  
      if (isNaN(quantiteAchetee) || quantiteAchetee <= 0) {
        alert("Veuillez entrer une quantité valide.");
        return;
      }
  
      try {
        // Récupérer les informations du produit depuis le processus principal
        const productInfo = await window.electron.getProductInfo(productId);
  
        if (!productInfo) {
          alert("Produit introuvable.");
          return;
        }
  
        if (quantiteAchetee > productInfo.quantite) {
          alert(`La quantité demandée (${quantiteAchetee}) est supérieure à la quantité en stock (${productInfo.quantite}).`);
          return;
        }
  
        // Vérifier si le produit est déjà dans la facture
        const existingItemIndex = factureItems.findIndex(item => item.id === productInfo.id);
  
        if (existingItemIndex !== -1) {
          // Si le produit existe déjà, augmenter la quantité
          factureItems[existingItemIndex].quantite += quantiteAchetee;
        } else {
          // Sinon, ajouter le produit à la facture
          factureItems.push({
            id: productInfo.id,
            nom: productInfo.nom,
            prix: productInfo.prix,
            quantite: quantiteAchetee,
          });
        }
  
        // Mettre à jour le tableau de la facture
        updateFactureTable();
  
          try{
            await diminuerLeStock(productId, quantiteAchetee);
          }catch(error){
            console.error("Erreur lors de la mise à jour du stock:", error);
            alert("Erreur lors de la mise à jour du stock.");
          }
  
      } catch (error) {
        console.error("Erreur lors de l'ajout du produit à la facture:", error);
        alert("Erreur lors de l'ajout du produit à la facture.");
      }
    });
  
    // Fonction pour mettre à jour le tableau de la facture
    function updateFactureTable() {
      factureTableBody.innerHTML = ''; // Effacer le tableau
  
      let totalFacture = 0;
  
      factureItems.forEach((item, index) => {
        const sousTotal = item.prix * item.quantite;
        totalFacture += sousTotal;
  
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${item.nom}</td>
          <td>${item.quantite}</td>
          <td>${item.prix.toFixed(2)}</td>
          <td>${sousTotal.toFixed(2)}</td>
          <td>
            <button class="remove-item" data-index="${index}" data-product-id="${item.id}" data-quantite="${item.quantite}">Supprimer</button>
          </td>
        `;
        factureTableBody.appendChild(row);
      });
  
      totalFactureSpan.textContent = totalFacture.toFixed(2); // Mettre à jour le total
    }
  
    // Modifier le gestionnaire d'événements pour la suppression d'un élément :
    factureTableBody.addEventListener('click', async (event) => {
      if (event.target.classList.contains('remove-item')) {
        const indexToRemove = event.target.dataset.index;
        const productId = event.target.dataset.productId;
        const quantiteARemettre = parseInt(event.target.dataset.quantite);
  
        try {
          await augmenterLeStock(productId, quantiteARemettre); // Appel de la fonction pour augmenter le stock
          factureItems.splice(indexToRemove, 1); // Supprimer l'élément du tableau
          updateFactureTable(); // Mettre à jour le tableau
        } catch (error) {
          console.error("Erreur lors de la remise en stock du produit:", error);
          alert("Erreur lors de la remise en stock du produit.");
        }
      }
    });
  
  });
  
  async function navigateToIndex() {
    const confirmation = confirm("Voulez-vous vraiment quitter la facture ?");
  
    if (confirmation) {
      try {
        // Augmenter le stock de tous les produits dans la facture
        for (const item of factureItems) {
          await augmenterLeStock(item.id, item.quantite);
        }
  
        // Rediriger vers la page d'index
        window.location.href = "index.html"; // ou toute autre méthode pour naviguer
      } catch (error) {
        console.error("Erreur lors de la remise en stock des produits:", error);
        alert("Erreur lors de la remise en stock des produits.");
      }
    }
  }

 
// Gestionnaire d'événements pour le bouton "Imprimer la facture"
const imprimerFactureBtn = document.getElementById('imprimerFacture');
imprimerFactureBtn.addEventListener('click', async () => {
    try {
        // Récupérer le nom du client depuis le champ de formulaire
        const nomClient = document.getElementById('nomClient').value;

        if (!nomClient) {
            alert("Veuillez entrer le nom du client.");
            return;
        }

        // Récupérer les informations de la facture
        const produitsVendus = factureItems.map(item => ({
            nom: item.nom, // Assurez-vous d'avoir le nom du produit
            produitId: item.id,
            quantite: item.quantite,
            prixUnitaire: item.prix,
            prixTotal: item.prix * item.quantite
        }));

        // Calculer le prix total de la vente
        const prixTotal = produitsVendus.reduce((total, item) => total + item.prixTotal, 0);

        // Récupérer la date actuelleue
        const dateVente = new Date().toISOString().slice(0, 10);

        // Préparer les données pour la facture
        const factureData = {
            nomClient: nomClient,
            produitsVendus: produitsVendus,
            prixTotal: prixTotal,
            dateVente: dateVente
        };

        // Stocker les données de la facture dans le stockage local
        localStorage.setItem('factureData', JSON.stringify(factureData));

        // Appeler une fonction dans main.js pour enregistrer les informations de la vente
        await window.electron.enregistrerVente(produitsVendus, prixTotal, dateVente);

        

        // Ouvrir la fenêtre d'impression de la facture
        const printWindow = window.open('factureImpression.html', '_blank','width=600,height=400,left=-10000,top=-10000');
        printWindow.addEventListener('load', () => {
           
            printWindow.print();
            
            window.electron.createNewFacture(); // Assurez-vous que cette fonction ouvre une nouvelle fenêtre de facture

            printWindow.onafterprint = async () => {
              
                printWindow.close(); // Fermer la fenêtre d'impression

              
                // Ouvrir une nouvelle facture avec les mêmes privilèges
               // await window.electron.createNewFacture(); // Assurez-vous que cette fonction ouvre une nouvelle fenêtre de facture
                  // Fermer la facture actuelle
                 window.electron.fermerFactureActuelle();

            };
        });

       

    } catch (error) {
        console.error("Erreur lors de l'impression et de l'enregistrement de la facture:", error);
        alert("Erreur lors de l'impression et de l'enregistrement de la facture.");
    }
    //
   
});

//fonction pour fermer uniquement la fenetre factue
function fermerFacture() {
  window.electron.fermerFactureActuelle(); //appel de la fonction  fermerFactureActuelle dans le fichier main.js
}

//pour fermer la factute
function fermerFacture() {
  window.electron.fermerFactureActuelle();

}



