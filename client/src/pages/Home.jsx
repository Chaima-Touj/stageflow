// ─── Home.jsx ─────────────────────────────────────────────────────────────────
import React from "react";
import { Link } from "react-router-dom";

export function Home() {
  return (
    <div className="home-page">
      <section className="hero-pro">
        <div className="hero-pro-content">
          <div className="hero-left">
            <span className="hero-badge">🚀 Plateforme intelligente de stages & PFE</span>
            <h1>Gérez vos <span>Stages</span>, <span>PFE</span> et <span>Candidatures</span> en toute simplicité</h1>
            <p>StageFlow connecte les étudiants, les entreprises et les encadrants dans un seul espace digital.</p>
            <div className="hero-actions">
              <Link to="/offers" className="btn btn-primary">Explorer les offres</Link>
              <Link to="/register" className="btn btn-secondary">Commencer maintenant</Link>
            </div>
            <div className="hero-stats">
              <div className="stat-card"><h3>120+</h3><p>Offres publiées</p></div>
              <div className="stat-card"><h3>300+</h3><p>Étudiants inscrits</p></div>
              <div className="stat-card"><h3>40+</h3><p>Entreprises partenaires</p></div>
            </div>
          </div>
          <div className="hero-right">
            <div className="floating-card card-one">
              <h4>📄 Gestion des candidatures</h4>
              <p>Suivez les demandes, CV et lettres de motivation.</p>
            </div>
            <div className="floating-card card-two">
              <h4>🎓 Espace étudiant</h4>
              <p>Consultez les offres, postulez et suivez vos stages.</p>
            </div>
            <div className="floating-card card-three">
              <h4>🏢 Espace entreprise</h4>
              <p>Publiez vos offres et gérez les candidatures.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section-block">
        <div className="section-title center">
          <span>✨ Fonctionnalités</span>
          <h2>Pourquoi choisir StageFlow ?</h2>
          <p>Une solution complète pour digitaliser la gestion des stages et PFE.</p>
        </div>
        <div className="feature-grid">
          <div className="feature-card"><div className="feature-icon">📌</div><h3>Offres centralisées</h3><p>Accédez à toutes les offres depuis une seule plateforme.</p></div>
          <div className="feature-card"><div className="feature-icon">⚡</div><h3>Postulation rapide</h3><p>Déposez vos candidatures en quelques clics.</p></div>
          <div className="feature-card"><div className="feature-icon">📊</div><h3>Suivi intelligent</h3><p>Visualisez l'état de vos candidatures en temps réel.</p></div>
          <div className="feature-card"><div className="feature-icon">🔒</div><h3>Espace sécurisé</h3><p>Authentification JWT et données sécurisées.</p></div>
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-box">
          <h2>Prêt à démarrer avec StageFlow ?</h2>
          <p>Rejoignez une plateforme moderne conçue pour étudiants, entreprises et encadrants.</p>
          <Link to="/register" className="btn btn-primary">Créer un compte</Link>
        </div>
      </section>
    </div>
  );
}

export default Home;