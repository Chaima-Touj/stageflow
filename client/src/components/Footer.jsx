import React from "react";// Importer les icônes de réseaux sociaux depuis la bibliothèque react-icons pour les utiliser dans le pied de page
import { Link } from "react-router-dom";// Importer les composants de lien de react-router-dom pour permettre la navigation vers différentes pages du site à partir du pied de page
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram } from "react-icons/fa";// Importer les icônes spécifiques pour Facebook, Twitter, LinkedIn et Instagram depuis la bibliothèque react-icons/fa pour les utiliser dans les liens de réseaux sociaux du pied de page

// Composant Footer qui affiche un pied de page avec le nom de la plateforme, des liens vers les différentes sections du site, des icônes de réseaux sociaux pour encourager les utilisateurs à suivre la plateforme sur les réseaux sociaux, et une mention de copyright

function Footer() {
  const socialLinks = [
    { icon: <FaFacebookF />, url: "#", name: "Facebook" },
    { icon: <FaTwitter />, url: "#", name: "Twitter" },
    { icon: <FaLinkedinIn />, url: "#", name: "LinkedIn" },
    { icon: <FaInstagram />, url: "#", name: "Instagram" },
  ];

  // Rendu du composant, incluant une section supérieure avec le nom de la plateforme et une description, une section de liens pour naviguer vers les différentes pages du site, une section d'icônes de réseaux sociaux pour encourager les utilisateurs à suivre la plateforme sur les réseaux sociaux, et une mention de copyright en bas du pied de page
  return (
    <footer className="footer-ultra">
      <div className="footer-top">
        <h2 className="footer-title">StageFlow</h2>
        <p className="footer-subtitle">Smart Internship & PFE Platform</p>
      </div>

      <div className="footer-links">
        <Link to="/offers">Offres</Link>
        <Link to="/about">À propos</Link>
        <Link to="/contact">Contact</Link>
        <Link to="/dashboard">Dashboard</Link>
      </div>

      <div className="footer-social">
        {socialLinks.map((s, i) => (
          <a key={i} href={s.url} title={s.name} className="social-icon">
            {s.icon}
          </a>
        ))}
      </div>

      <p className="footer-copy">© 2026 StageFlow — Tous droits réservés</p>
    </footer>
  );
}

export default Footer;