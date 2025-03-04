const { contextBridge, ipcRenderer } = require('electron');

// Expose des API sécurisées à l'interface utilisateur
contextBridge.exposeInMainWorld('electron', {
    loadMembers: () => ipcRenderer.invoke('load-members'), // Récupérer les membres
    addMember: (memberData) => ipcRenderer.invoke('add-member', memberData), // Ajouter un membre
    addParam: (paramData) => ipcRenderer.invoke('add-param', paramData), // Ajout de cette ligne
    updateMember: (memberData) => ipcRenderer.invoke('update-member', memberData),
    deleteMember: (id) => ipcRenderer.invoke('delete-member', id)
});
