import React, { useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { DataContext } from "../context/DataContext";
import { AuthContext } from "../context/AuthContext";

function OfferDetails() {
  const { id } = useParams();
  const { offers } = useContext(DataContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const offer = offers.find((o) => o._id === id);

  if (!offer) return (
    <div className="page">
      <div className="offer-details-card">
        <h2>Offre introuvable</h2>
        <p>Cette offre n'existe pas ou a été supprimée.</p>
        <Link to="/offers" className="btn btn-primary" style={{ marginTop: "20px" }}>
          Retour aux offres
        </Link>
      </div>
    </div>
  );

  const handleApply = () => {
    if (!user) { navigate("/login"); return; }
    navigate(`/apply/${offer._id}`);
  };

  return (
    <div className="page offer-details-page">
      <div className="offer-details-card">
        <div className="offer-details-top">
          <span className={`offer-type ${offer.type === "PFE" ? "pfe" : "stage"}`}>
            {offer.type}
          </span>
          <span className="offer-location">📍 {offer.location}</span>
        </div>

        <h2>{offer.title}</h2>
        <h3>{offer.company}</h3>

        <div className="offer-details-grid">
          <div className="offer-info-box">
            <h4>🏢 Entreprise</h4>
            <p>{offer.company}</p>
          </div>
          <div className="offer-info-box">
            <h4>📍 Localisation</h4>
            <p>{offer.location}</p>
          </div>
          <div className="offer-info-box">
            <h4>⏳ Durée</h4>
            <p>{offer.duration}</p>
          </div>
          <div className="offer-info-box">
            <h4>🎯 Type</h4>
            <p>{offer.type}</p>
          </div>
        </div>

        <div className="offer-description-box">
          <h4>📝 Description</h4>
          <p>{offer.desc}</p>
        </div>

        <div className="offer-description-box">
          <h4>💡 Compétences requises</h4>
          <p>{offer.requirements}</p>
        </div>

        <div className="offer-details-actions">
          <button onClick={handleApply} className="btn btn-primary">
            Postuler maintenant
          </button>
          <Link to="/offers" className="btn btn-secondary">
            ← Retour aux offres
          </Link>
        </div>
      </div>
    </div>
  );
}

export default OfferDetails;