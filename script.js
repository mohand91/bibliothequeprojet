const bibliotheque = {
    livres: [],
    utilisateurs: [],
    emprunts: [],
    prochainIdLivre: 1,
    prochainIdUtilisateur: 1,
    prochainIdEmprunt: 1
};

const savedl = localStorage.getItem("livres");
if (savedl && savedl !== "undefined") {
    bibliotheque.livres = JSON.parse(savedl);
}

const savedu = localStorage.getItem("utilisateurs");
if (savedu && savedu !== "undefined") {
    bibliotheque.utilisateurs = JSON.parse(savedu);
}

const savede = localStorage.getItem("emprunts");
if (savede && savede !== "undefined") {
    bibliotheque.emprunts = JSON.parse(savede);
}

afficherUtilisateurs();
afficherLivres();
remplirSelects();
afficherEmprunts();


function ajouterLivre(titre, auteur, quantite) {
    if (!titre || !auteur || !quantite || quantite <= 0) {
        return { succes: false, message: "Champs invalides" };
    }

    const nouveauLivre = {
    id: crypto.randomUUID(),
    titre: titre,
    auteur: auteur,
    quantiteTotal: parseInt(quantite),
    quantiteDisponible: parseInt(quantite)
    };

    bibliotheque.livres.push(nouveauLivre);
    localStorage.setItem("livres", JSON.stringify(bibliotheque.livres));
    afficherLivres();
    return { succes: true, message: "Livre ajouté", livre: nouveauLivre };
}


function supprimerLivre(id) {
    bibliotheque.livres = bibliotheque.livres.filter(livre => livre.id !== id);
    localStorage.setItem("livres", JSON.stringify(bibliotheque.livres));
    afficherLivres();
}

function afficherLivres() {
    const listeDiv = document.getElementById("liste-livres");
    listeDiv.innerHTML = "";

    bibliotheque.livres.forEach(livre => {
        const p = document.createElement("p");
        p.textContent = `${livre.id}. ${livre.titre} - ${livre.auteur} (Dispo: ${livre.quantiteDisponible}/${livre.quantiteTotal})`;
        const Supprimer = document.createElement("button");
        Supprimer.textContent = "Supprimer";
        Supprimer.addEventListener("click", () => supprimerLivre(livre.id));
        p.appendChild(Supprimer);
        listeDiv.appendChild(p);
});
}

document.getElementById("form-livre").addEventListener("submit", e => {
    e.preventDefault();
    ajouterLivre(
        document.getElementById("titre").value,
        document.getElementById("auteur").value,
        document.getElementById("quantite").value
    );
    e.target.reset();
});

function ajouterUtilisateurs(nom, prenom, email) {
    if (!nom || !prenom || !email) {
        return { succes: false, message: "Champs invalides" };
    }

    const nouvelleUtilisateur = {
    id: crypto.randomUUID(),
    nom: nom,
    prenom: prenom,
    email: email,
    };

    bibliotheque.utilisateurs.push(nouvelleUtilisateur);
    localStorage.setItem("utilisateurs", JSON.stringify(bibliotheque.utilisateurs));
    afficherUtilisateurs();
    return { succes: true, message: "Utilisateur ajouté", utilisateur: nouvelleUtilisateur };
}

function supprimerUtilisateur(id) {
    bibliotheque.utilisateurs = bibliotheque.utilisateurs.filter(utilisateur => utilisateur.id !== id);
    localStorage.setItem("utilisateurs", JSON.stringify(bibliotheque.utilisateurs));
    afficherUtilisateurs();
}

function afficherUtilisateurs() {
    const listeDiv = document.getElementById("liste-utilisateurs");
    listeDiv.innerHTML = "";

    bibliotheque.utilisateurs.forEach(utilisateur => {
        const p = document.createElement("p");
        p.textContent = `${utilisateur.id}. ${utilisateur.nom} - ${utilisateur.prenom} - ${utilisateur.email} `;
        const Supprimer = document.createElement("button");
        Supprimer.textContent = "Supprimer";
        Supprimer.addEventListener("click", () => supprimerUtilisateur(utilisateur.id));
        p.appendChild(Supprimer);
        listeDiv.appendChild(p);
    });
}

document.getElementById("form-utilisateur").addEventListener("submit", e => {
    e.preventDefault();
    ajouterUtilisateurs(
        document.getElementById("nom").value,
        document.getElementById("prenom").value,
        document.getElementById("email").value
    );
    e.target.reset();
});

function emprunterEmprunt(utilisateurId, livreId) {
    const utilisateur = bibliotheque.utilisateurs.find(utilisateurs => utilisateurs.id === utilisateurId);
    const livre = bibliotheque.livres.find(livres => livres.id === livreId);

    if (!utilisateur || !livre) {
        return { succes: false, message: "Utilisateur ou livre introuvable" };
    }

    if (livre.quantiteDisponible <= 0) {
        return { succes: false, message: "Livre indisponible" };
    }

const nouvelEmprunt = {
    id: crypto.randomUUID(),
    utilisateurId,
    livreId,
    dateEmprunt: new Date().toLocaleDateString()
};

bibliotheque.emprunts.push(nouvelEmprunt);
livre.quantiteDisponible -= 1;

localStorage.setItem("emprunts", JSON.stringify(bibliotheque.emprunts));
localStorage.setItem("livres", JSON.stringify(bibliotheque.livres));

afficherEmprunts();
afficherLivres();

return { succes: true, message: "Emprunt enregistré", emprunt: nouvelEmprunt };
}

function supprimerEmprunt(empruntId) {
    const emprunt = bibliotheque.emprunts.find(e => e.id === empruntId);
    if (!emprunt) return;

    const livre = bibliotheque.livres.find(l => l.id === emprunt.livreId);
    if (livre) livre.quantiteDisponible += 1;

    bibliotheque.emprunts = bibliotheque.emprunts.filter(e => e.id !== empruntId);

    localStorage.setItem("emprunts", JSON.stringify(bibliotheque.emprunts));
    localStorage.setItem("livres", JSON.stringify(bibliotheque.livres));

    afficherEmprunts();
    afficherLivres();
    remplirSelects()
}

function afficherEmprunts() {
    const listeDiv = document.getElementById("liste-emprunts");
    listeDiv.innerHTML = "";

    bibliotheque.emprunts.forEach(emprunt => {
        const utilisateur = bibliotheque.utilisateurs.find(u => u.id === emprunt.utilisateurId);
        const livre = bibliotheque.livres.find(l => l.id === emprunt.livreId);

        const p = document.createElement("p");
        p.textContent = `${emprunt.id}. ${utilisateur.nom} a emprunté "${livre.titre}" le ${emprunt.dateEmprunt}`;

        const boutonRetour = document.createElement("button");
        boutonRetour.textContent = "Retour";
        boutonRetour.addEventListener("click", () => supprimerEmprunt(emprunt.id));

        p.appendChild(boutonRetour);
        listeDiv.appendChild(p);
    });
}

function remplirSelects() {
    const selectUtilisateur = document.getElementById("select-utilisateur");
    const selectLivre = document.getElementById("select-livre");

    selectUtilisateur.innerHTML = "";
    bibliotheque.utilisateurs.forEach(u => {
        const option = document.createElement("option");
        option.value = u.id;
        option.textContent = `${u.nom} ${u.prenom}`;
        selectUtilisateur.appendChild(option);
    });

    selectLivre.innerHTML = "";
    bibliotheque.livres.forEach(l => {
        if (l.quantiteDisponible > 0) {
        const option = document.createElement("option");
        option.value = l.id;
        option.textContent = l.titre;
        selectLivre.appendChild(option);
        }
    });
}

document.getElementById("form-emprunt").addEventListener("submit", e => {
    e.preventDefault();
    emprunterEmprunt(
        document.getElementById("select-utilisateur").value,
        document.getElementById("select-livre").value
    );
    remplirSelects();
});
