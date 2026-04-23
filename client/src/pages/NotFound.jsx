import React from "react";
import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="notfound-page">
      <div className="notfound-card">
        <h1>404</h1>
        <h2>Page introuvable</h2>
        <p>La page demandée n'existe pas ou a été déplacée.</p>
        <Link to="/" className="btn btn-primary">Retour à l'accueil</Link>
      </div>
    </div>
  );
}

export default NotFound;