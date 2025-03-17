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
});
