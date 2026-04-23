import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { DataContext } from "../context/DataContext";
import { AuthContext } from "../context/AuthContext";

function Offers() {
  const { offers, deleteOffer, loadingOffers } = useContext(DataContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("Tous");

  const filtered = offers.filter((o) => {
    const matchType = filterType === "Tous" || o.type === filterType;
    const matchSearch =
      o.title.toLowerCase().includes(search.toLowerCase()) ||
      o.company.toLowerCase().includes(search.toLowerCase()) ||
      o.location.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  const handleApply = (offerId) => {
    if (!user) { navigate("/login"); return; }
    navigate(`/apply/${offerId}`);
  };

  return (
    <div className="page">
      <div className="section-title left" style={{ paddingTop: "60px" }}>
        <span>📂 Opportunités</span>
        <h2>Découvrez les offres disponibles</h2>
        <p>Trouvez le stage ou PFE qui correspond à votre profil.</p>
      </div>

      {/* Filters */}
      <div className="offers-filters">
        <input
          type="text" placeholder="🔍 Rechercher une offre, entreprise, lieu..."
          className="filter-search" value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="filter-tabs">
          {["Tous", "Stage", "PFE"].map((t) => (
            <button key={t}
              className={`filter-tab ${filterType === t ? "active" : ""}`}
              onClick={() => setFilterType(t)}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {loadingOffers ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Chargement des offres...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <h3>Aucune offre trouvée</h3>
          <p>Essayez d'autres mots-clés ou filtres.</p>
          {user?.role === "entreprise" && (
            <Link to="/add-offer" className="btn btn-primary" style={{ marginTop: "16px" }}>
              + Publier une offre
            </Link>
          )}
        </div>
      ) : (
        <div className="offers-pro-grid">
          {filtered.map((offer) => (
            <div key={offer._id} className="offer-pro-card">
              <div className="offer-top">
                <span className={`offer-type ${offer.type === "PFE" ? "pfe" : "stage"}`}>
                  {offer.type}
                </span>
                <span className="offer-location">📍 {offer.location}</span>
              </div>
              <h3>{offer.title}</h3>
              <h4>{offer.company}</h4>
              <p>{offer.desc?.substring(0, 100)}...</p>
              <div className="offer-meta">
                <span>⏳ {offer.duration}</span>
                <span>📨 {offer.applicationsCount || 0} candidature(s)</span>
              </div>
              <div className="offer-actions">
                <Link to={`/offers/${offer._id}`} className="btn btn-secondary">
                  Voir détails
                </Link>
                <button className="btn btn-primary" onClick={() => handleApply(offer._id)}>
                  Postuler
                </button>
                {(user?.role === "admin" || user?._id === offer.companyId) && (
                  <button className="btn btn-danger" onClick={() => deleteOffer(offer._id)}>
                    Supprimer
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Offers;