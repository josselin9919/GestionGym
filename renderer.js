document.getElementById('memberForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const nom = document.getElementById('nom').value;
    const prenom = document.getElementById('prenom').value;
    const age = document.getElementById('age').value;
    const quartier = document.getElementById('quartier').value;
    const sexe = document.getElementById('sexe').value;
    const tel = document.getElementById('tel').value;
    const date_i = document.getElementById('date_i').value;
    const date_D = document.getElementById('date_D').value;
    const date_F = document.getElementById('date_F').value;

    const memberData = { nom, prenom, age, quartier, sexe, tel, date_i, date_D, date_F };

    // Ajouter un membre
    electron.addMember(memberData).then((message) => {
        alert(message);
        loadMembers(); // Recharger les membres après l'ajout
    }).catch((error) => {
        console.error('Erreur lors de l\'ajout du membre:', error);
    });
});

// Charger les membres
function loadMembers() {
    electron.loadMembers().then((members) => {
        console.log("Données reçues :", members);
        const membersTableBody = $('#membersTable tbody');
        membersTableBody.empty(); // Vider le corps du tableau avant de le remplir
        
        members.forEach((row) => {
            membersTableBody.append(`
                <tr>
                    <td>${row.nom}</td>
                    <td>${row.prenom}</td>
                    <td>${row.age}</td>
                    <td>${row.quartier}</td>
                    <td>${row.sexe}</td>
                    <td>${row.tel}</td>
                    <td>${row.date_i}</td>
                    <td>${row.date_D}</td>
                    <td>${row.date_F}</td>
                    <td><button onclick="openParamModal(${row.id} )" class="btn btn-success">Ajouter Paramètre</button></td>
                    <button onclick="deleteMember(${row.id})" class="deleteBtn">Supprimer</button>
                    <td><button class="btn btn-info" onclick="openEditModal(${row.id}, '${row.nom}', '${row.prenom}', ${row.age}, '${row.quartier}', '${row.sexe}', '${row.tel}', '${row.date_i}', '${row.date_D}', '${row.date_F}')">Modifier</button></td>
                    <td><button onclick="deleteMember(${row.id})" class="btn btn-danger">Supprimer</button></td>
                </tr>
            `);
        });
        console.log(members)
        
        console.log("Nombre de lignes détectées par DataTables :", $('#membersTable').DataTable().column(1).data());

        // Réinitialiser DataTable après ajout de nouvelles lignes
        //$('#membersTable').DataTable().destroy();
        $('#membersTable').DataTable();
    })
}
function openParamModal(memberId) {
    $('#paramMemberId').val(memberId);
    $('#paramModal').css('display', 'block');
}
function openParamModal2() {
    $('#paramModal2').css('display', 'block');
}

function closeModal() {
    $('#paramModal').css('display', 'none');
}
function closeModal2() {
    $('#paramModal2').css('display', 'none');
}

$('#paramForm').submit(function(event) {
    event.preventDefault();

    const memberId = $('#paramMemberId').val();
    const poids = $('#poids').val();
    const taille = $('#taille').val();
    const tension = $('#tension').val();
    const glycemie = $('#glycemie').val();

    const paramData = { id_membre: memberId, poids, taille, tension, glycemie };

    electron.addParam(paramData).then((message) => {
        alert(message);
        closeModal();
    }).catch((error) => {
        console.error('Erreur lors de l\'ajout du paramètre:', error);
    });
});
// Fermer la modale d'édition
function closeEditModal() {
    $('#editModal').css('display', 'none');
}

// Modifier un membre
$('#editForm').submit(function (event) {
    event.preventDefault();

    const id = $('#editMemberId').val();
    const nom = $('#editNom').val();
    const prenom = $('#editPrenom').val();
    const age = $('#editAge').val();
    const quartier = $('#editQuartier').val();
    const sexe = $('#editSexe').val();
    const tel = $('#editTel').val();
    const date_i = $('#editDate_i').val();
    const date_D = $('#editDate_D').val();
    const date_F = $('#editDate_F').val();

    const memberData = { id, nom, prenom, age, quartier, sexe, tel, date_i, date_D, date_F };

    electron.updateMember(memberData).then((message) => {
        alert(message);
        closeEditModal();
        loadMembers();
    }).catch((error) => {
        console.error('Erreur lors de la modification du membre:', error);
    });
});

// Supprimer un membre
function deleteMember(id) {
    if (confirm('Voulez-vous vraiment supprimer ce membre ?')) {
        electron.deleteMember(id).then((message) => {
            alert(message);
            loadMembers();
        }).catch((error) => {
            console.error('Erreur lors de la suppression du membre:', error);
        });
    }
}
// Ouvrir la modale d'édition avec les informations du membre
function openEditModal(id, nom, prenom, age, quartier, sexe, tel, date_i, date_D, date_F) {
    $('#editMemberId').val(id);
    $('#editNom').val(nom);
    $('#editPrenom').val(prenom);
    $('#editAge').val(age);
    $('#editQuartier').val(quartier);
    $('#editSexe').val(sexe);
    $('#editTel').val(tel);
    $('#editDate_i').val(date_i);
    $('#editDate_D').val(date_D);
    $('#editDate_F').val(date_F);
    
    $('#editModal').css('display', 'block');
}
// Initialiser l'affichage des membres
loadMembers();
