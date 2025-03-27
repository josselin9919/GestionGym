document.getElementById('productForm').addEventListener('submit', async function(event) {
    event.preventDefault();


 

    const nom = document.getElementById('nom').value;
    const prix = document.getElementById('prix').value;
    const quantite = document.getElementById('quantite').value;
    const ouvrirHistoriqueBtn = document.getElementById('ouvrirHistorique');

    document.addEventListener('DOMContentLoaded', () => {
        const ouvrirHistoriqueBtn = document.getElementById('ouvrirHistorique');
      
        ouvrirHistoriqueBtn.addEventListener('click', () => {
          window.electron.ouvrirHistorique(); // Appel à la fonction preload
        });
      });
   
    const productData = { nom, prix, quantite};

    // Ajouter un produit
    electron.addProduct(productData).then((message) => {
        alert(message);
        loadProducts(); // Recharger les produits après l'ajout
    }).catch((error) => {
        console.error('Erreur lors de l\'ajout du produit:', error);
    });
});

function navigateToVente (){

    //electron.navigateToVente();
    window.location.href = "vente.html";
    
}

function navigateToIndex2 (){

    //electron.navigateToVente();
    window.location.href = "index.html";
    
}

/*function navigateToIndex (){

    electron.navigateToIndex();
}*/


async function navigateToIndex() {
    const confirmation = confirm("Voulez-vous vraiment quitter la facture ? Toutes vos données seront perdues !!!!!");
  
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


// Charger les produits
function loadProducts() {
    electron.loadProducts().then((products) => {
        console.log("Appel de loadProducts()");
        console.log("Données reçues :", products);
        const productsTableBody = $('#productsTable tbody');
        productsTableBody.empty(); // Vider le corps du tableau avant de le remplir
        
        products.forEach((row) => {

                productsTableBody.append(`
                    <tr>
                        <td>${row.nom}</td>
                        <td>${row.prix}</td>
                        <td>${row.quantite}</td>
                       
                        <td><button class="btn btn-info" onclick="openEditModal(${row.id}, '${row.nom}', ${row.prix}, ${row.quantite}, )">Modifier</button></td>
                        <td><button onclick="deleteProduct(${row.id})" class="btn btn-danger">Supprimer</button></td>
                    </tr>
                `);
           
           
        });
        console.log(products)
        
        console.log("Nombre de lignes détectées par DataTables :", $('#productsTable').DataTable().column(1).data());

        // Réinitialiser DataTable après ajout de nouvelles lignes
        //$('#productsTable').DataTable().destroy();
        /*if ($.fn.DataTable.isDataTable('#productsTable')) {
            $('#productsTable').DataTable().destroy();
        }*/
        $('#productsTable').DataTable();
    }).catch((error) => {
        console.error("Erreur lors du chargement des produits :", error);
    });
}



function openParamModal(productId) {
    $('#paramproductId').val(productId);
    $('#paramModal').css('display', 'block');
}
function openParamModal2() {
    $('#paramModal2').css('display', 'block');
}
function openAfficheModal(productId) {
    loadParametre(productId);
    loadPayement(productId);
    $('#afficheModal').css('display', 'block');
}
function closeAfficheModal() {
    $('#afficheModal').css('display', 'none');
}

function closeModal() {
    $('#paramModal').css('display', 'none');
}
function closeModal2() {
    $('#paramModal2').css('display', 'none');
}

function closeModal3() {
    $('#payeModal').css('display', 'none');
}



// Fermer la modale d'édition
function closeEditModal() {
    $('#editModal').css('display', 'none');
}

// Modifier un produit
$('#editForm').submit(function (event) {
    event.preventDefault();

    const id = $('#editProductId').val();
    const nom = $('#editNom').val();
    const prix = $('#editPrix').val();
    const quantite = $('#editQuantite').val();
   

    const productData = { id, nom, prix, quantite };

    electron.updateProduct(productData).then((message) => {
        alert(message);
        closeEditModal();
        loadProducts();
    }).catch((error) => {
        console.error('Erreur lors de la modification du produit:', error);
    });
});

// Supprimer un membre
function deleteProduct(id) {
    if (confirm('Voulez-vous vraiment supprimer ce produit ?')) {
        electron.deleteProduct(id).then((message) => {
            alert(message);
            loadProducts();
        }).catch((error) => {
            console.error('Erreur lors de la suppression du produit:', error);
        });
    }
}

 // Supprimer une vente
 function deleteVente(id) {
    if (confirm('Voulez-vous vraiment supprimer cette vente ?')) {
        electron.deleteVente(id).then((message) => {
            alert(message);
            window.location.href = "historique.html";
        }).catch((error) => {
            console.error('Erreur lors de la suppression de la vente:', error);
        });
    }
  }
// Ouvrir la modale d'édition avec les informations du produit
function openEditModal(id, nom, prix, quantite) {
    $('#editProductId').val(id);
    $('#editNom').val(nom);
    $('#editPrix').val(prix);
    $('#editQuantite').val(quantite);
  
    $('#editModal').css('display', 'block');
}
// Initialiser l'affichage des membres
loadProducts();




