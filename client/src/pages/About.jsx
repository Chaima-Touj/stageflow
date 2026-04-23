// ─── About.jsx ────────────────────────────────────────────────────────────────
import React from "react";
// Composant About qui affiche des informations sur la plateforme StageFlow, ses fonctionnalités et les avantages pour les étudiants, les entreprises et les encadrants, en utilisant une mise en page simple avec des sections dédiées pour chaque type d'utilisateur, afin de présenter clairement les objectifs et les bénéfices de la plateforme aux visiteurs intéressés
export function About() {
  return (
    <div className="page about-page">
      <br /><br />
      <h2>À propos de StageFlow</h2>
      <p>StageFlow est une plateforme moderne conçue pour simplifier la gestion des stages, PFE et candidatures.</p>
      <p>Elle permet aux étudiants de rechercher des opportunités, postuler et suivre leurs candidatures dans un seul espace.</p>
      <div className="offers-grid">
        <div className="card"><h3>🎓 Étudiants</h3><p>Rechercher des stages, postuler facilement et suivre vos candidatures.</p></div>
        <div className="card"><h3>🏢 Entreprises</h3><p>Publier des offres et gérer efficacement les candidatures reçues.</p></div>
        <div className="card"><h3>👨‍🏫 Encadrants</h3><p>Suivre les étudiants et faciliter l'encadrement académique.</p></div>
      </div>
    </div>
  );
}

export default About;