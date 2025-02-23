document.addEventListener('DOMContentLoaded', () => {
    const { ipcRenderer } = require('electron');
    const membreForm = document.getElementById('membreForm');
    const membreList = document.getElementById('membreList');
    const editFormContainer = document.getElementById('editFormContainer');
    const editForm = document.getElementById('editForm');
    const photoInput = document.getElementById('photo');
    const editPhotoInput = document.getElementById('editPhoto');

    function loadMembres() {
        ipcRenderer.send('charger-membres');
    }

    ipcRenderer.on('membres-charges', (event, membres) => {
        membreList.innerHTML = '';
        membres.forEach(membre => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${membre.id}</td>
                <td>${membre.nom}</td>
                <td>${membre.prenom}</td>
                <td>${membre.email}</td>
                <td><img src="${membre.photo}" alt="Photo" width="50"></td>
                <td>
                    <button class="edit" onclick="openEditForm(${membre.id}, '${membre.nom}', '${membre.prenom}', '${membre.email}', '${membre.photo}')">Modifier</button>
                    <button class="delete" onclick="deleteMembre(${membre.id})">Supprimer</button>
                </td>
            `;
            membreList.appendChild(row);
        });
    });

    loadMembres();

    membreForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const nom = document.getElementById('nom').value;
        const prenom = document.getElementById('prenom').value;
        const email = document.getElementById('email').value;
        const photo = photoInput.files[0] ? URL.createObjectURL(photoInput.files[0]) : '';

        ipcRenderer.send('ajouter-membre', { nom, prenom, email, photo });
        membreForm.reset();
        loadMembres();
    });

    window.deleteMembre = (id) => {
        ipcRenderer.send('supprimer-membre', id);
        loadMembres();
    };

    window.openEditForm = (id, nom, prenom, email, photo) => {
        document.getElementById('editNom').value = nom;
        document.getElementById('editPrenom').value = prenom;
        document.getElementById('editEmail').value = email;
        document.getElementById('editId').value = id;
        document.getElementById('editPhotoPreview').src = photo;
        editFormContainer.style.display = 'block';
    };

    editForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('editId').value;
        const nom = document.getElementById('editNom').value;
        const prenom = document.getElementById('editPrenom').value;
        const email = document.getElementById('editEmail').value;
        const photo = editPhotoInput.files[0] ? URL.createObjectURL(editPhotoInput.files[0]) : document.getElementById('editPhotoPreview').src;

        ipcRenderer.send('modifier-membre', { id, nom, prenom, email, photo });
        editForm.reset();
        editFormContainer.style.display = 'none';
        loadMembres();
    });
});
