const { contextBridge, ipcRenderer } = require('electron');

// Expose des API sécurisées à l'interface utilisateur
contextBridge.exposeInMainWorld('electron', {
    loadMembers: () => ipcRenderer.invoke('load-members'), // Récupérer les membres
    loadParametres: (id_membre) => ipcRenderer.invoke('load-parametre',id_membre), // Récupérer les parametres
    loadPayements: (id_membre) => ipcRenderer.invoke('load-payement',id_membre), // Récupérer les payement
    addMember: (memberData) => ipcRenderer.invoke('add-member', memberData), // Ajouter un membre
    addParam: (paramData) => ipcRenderer.invoke('add-param', paramData), // Ajout de cette ligne
    addPaye: (payeData) => ipcRenderer.invoke('add-paye', payeData), // Ajout de cette ligne
    updateMember: (memberData) => ipcRenderer.invoke('update-member', memberData),
    deleteMember: (id) => ipcRenderer.invoke('delete-member', id),

    //code patrick
    loadProducts: () => ipcRenderer.invoke('load-products'), // Récupérer les produits
    addProduct: (productData) => ipcRenderer.invoke('add-product', productData), // Ajouter un produit
    updateProduct: (productData) => ipcRenderer.invoke('update-product', productData),
    deleteProduct: (id) => ipcRenderer.invoke('delete-product', id),
    navigateToVente: () => ipcRenderer.invoke('navigate-to-vente'),
    navigateToIndex: () => ipcRenderer.invoke('navigate-to-index'),
    navigateToIndex2: () => ipcRenderer.invoke('navigate-to-index2'),
    getProductNames: () => ipcRenderer.invoke('get-product-names'),
    getProductInfo: (productId) => ipcRenderer.invoke('get-product-info', productId),
    updateStock: (productId, newQuantity) => ipcRenderer.invoke('update-stock', productId, newQuantity),
    augmenterLeStock: (productId, quantiteARemettre) => ipcRenderer.invoke('augmenter-stock', productId, quantiteARemettre),
    createNewFacture: () => ipcRenderer.send('create-new-facture'),
    enregistrerVente: (produitsVendus, prixTotal, dateVente) => ipcRenderer.invoke('enregistrer-vente', produitsVendus, prixTotal, dateVente),
    chargerHistorique: () => ipcRenderer.invoke('get-historique-ventes'),
    afficherDialogueSaisie: (message) => ipcRenderer.invoke('afficher-dialogue-saisie', message),
    fermerFactureActuelle: () => ipcRenderer.send('fermer-facture-actuelle'),
    deleteVente: (id) => ipcRenderer.invoke('delete-vente', id),
    openProduitWindow: () => ipcRenderer.send('open-produit-window'),
    showProductNameDialog: () => ipcRenderer.invoke('show-product-name-dialog')
});
