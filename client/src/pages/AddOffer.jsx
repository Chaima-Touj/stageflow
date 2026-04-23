import React, { useState, useContext } from "react";// Importer les fonctions et objets nécessaires depuis React pour créer un composant de page d'ajout d'offre, gérer l'état du formulaire, accéder au contexte de données et d'authentification, et naviguer entre les pages de l'application
import { useNavigate } from "react-router-dom";// Importer les fonctions et objets nécessaires depuis React pour créer un composant de page d'ajout d'offre, gérer l'état du formulaire, accéder au contexte de données et d'authentification, et naviguer entre les pages de l'application
import { DataContext } from "../context/DataContext";// Importer le contexte de données pour accéder aux fonctions d'ajout d'offre et aux données de l'application, permettant au composant de gérer les interactions avec les offres de stage
import { AuthContext } from "../context/AuthContext";// Importer le contexte d'authentification pour accéder aux informations de l'utilisateur connecté, permettant au composant de vérifier les autorisations de l'utilisateur pour ajouter une offre et d'afficher des informations pertinentes dans le formulaire d'ajout d'offre

// Composant AddOffer qui affiche un formulaire pour ajouter une nouvelle offre de stage, en vérifiant que l'utilisateur connecté a les autorisations nécessaires (entreprise ou admin), en gérant l'état du formulaire et le processus de soumission, et en utilisant les fonctions du contexte de données pour interagir avec l'API d'offres de stage, tout en naviguant vers la page des offres après une création réussie ou en affichant un message d'erreur en cas de problème
function AddOffer() {
  const { addOffer } = useContext(DataContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "", company: user?.name || "", location: "",
    type: "Stage", duration: "", desc: "", requirements: "",
  });

  // Fonction pour gérer les changements dans les champs du formulaire, qui met à jour l'état du formulaire en fonction des entrées de l'utilisateur, permettant au composant de suivre les valeurs saisies dans le formulaire d'ajout d'offre et de les utiliser lors de la soumission du formulaire pour créer une nouvelle offre de stage
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // Fonction pour gérer la soumission du formulaire, qui empêche le comportement par défaut de soumission, indique que le processus de création est en cours en mettant à jour l'état de chargement, appelle la fonction d'ajout d'offre du contexte de données avec les informations du formulaire, gère le résultat de la création en naviguant vers la page des offres si la création est réussie ou en affichant un message d'erreur si la création échoue, et réinitialise l'état de chargement une fois le processus terminé
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await addOffer(form);
    setLoading(false);
    if (result.success) navigate("/offers");
  };

  // Vérifier que l'utilisateur connecté a les autorisations nécessaires pour ajouter une offre (doit être une entreprise ou un administrateur), et afficher un message d'accès refusé si l'utilisateur n'a pas les autorisations, ou afficher le formulaire d'ajout d'offre si l'utilisateur est autorisé, assurant que seules les entreprises et les administrateurs peuvent accéder à la fonctionnalité de création d'offres de stage
  if (user?.role !== "entreprise" && user?.role !== "admin") {
    return (
      <div className="page">
        <h2>Accès refusé</h2>
        <p>Seules les entreprises et les admins peuvent ajouter des offres.</p>
      </div>
    );
  }

  // Rendu du formulaire d'ajout d'offre, avec des champs pour le titre de l'offre, le nom de l'entreprise, la localisation, le type de stage, la durée, la description et les compétences requises, ainsi qu'un bouton de soumission qui affiche un état de chargement pendant le processus de création, permettant aux utilisateurs autorisés de créer une nouvelle offre de stage en remplissant les informations nécessaires et en soumettant le formulaire
  return (
    <div className="form-page">
      <div className="form-box">
        <h2>Ajouter une offre</h2>
        <p>Publiez une nouvelle opportunité sur StageFlow</p>
        <form onSubmit={handleSubmit}>
          <input type="text" name="title" placeholder="Titre de l'offre"
            value={form.title} onChange={handleChange} required />
          <input type="text" name="company" placeholder="Nom de l'entreprise"
            value={form.company} onChange={handleChange} required />
          <input type="text" name="location" placeholder="Lieu"
            value={form.location} onChange={handleChange} required />
          <select name="type" value={form.type} onChange={handleChange}>
            <option value="Stage">Stage</option>
            <option value="PFE">PFE</option>
          </select>
          <input type="text" name="duration" placeholder="Durée (ex: 3 mois)"
            value={form.duration} onChange={handleChange} required />
          <textarea name="desc" placeholder="Description de l'offre"
            value={form.desc} onChange={handleChange} required rows="4" />
          <textarea name="requirements" placeholder="Compétences requises"
            value={form.requirements} onChange={handleChange} required rows="3" />
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Publication..." : "Publier l'offre"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddOffer;