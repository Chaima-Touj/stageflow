import React, { useState, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { DataContext } from "../context/DataContext";
import { AuthContext } from "../context/AuthContext";

function Apply() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { offers, addApplication, applications } = useContext(DataContext);
  const { user } = useContext(AuthContext);
  const offer = offers.find((o) => o._id === id);
  const [form, setForm] = useState({ motivation: "", cv: null });
  const [message, setMessage] = useState("");
  const [fileError, setFileError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!offer) return (
    <div className="page">
      <div className="offer-details-card">
        <h2>Offre introuvable</h2>
        <Link to="/offers" className="btn btn-primary" style={{ marginTop: "20px" }}>
          Retour aux offres
        </Link>
      </div>
    </div>
  );

  const alreadyApplied = applications.some(
    (app) => app.userId === user?._id && app.offerId === offer._id
  );

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) { setForm({ ...form, cv: file }); setFileError(""); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) { navigate("/login"); return; }
    if (!form.cv) { setFileError("⚠️ Veuillez sélectionner un fichier CV."); return; }
    if (alreadyApplied) { setMessage("Vous avez déjà postulé à cette offre."); return; }

    setLoading(true);
    const result = await addApplication(offer._id, form.motivation, form.cv);
    setLoading(false);

    if (result.success) {
      setMessage("✅ Candidature envoyée avec succès !");
      setTimeout(() => navigate("/dashboard"), 1500);
    } else {
      setMessage(result.message);
    }
  };
  return (
    <div className="auth-page">
      <div className="auth-wrapper apply-wrapper">
        <div className="auth-left">
          <span className="auth-badge">🚀 Nouvelle candidature</span>
          <h1>Postulez à cette opportunité</h1>
          <p>Envoyez votre candidature en quelques secondes.</p>
          <div className="auth-features">
            <div className="auth-feature-card">
              <h4>🎯 Offre sélectionnée</h4>
              <p>{offer.title}</p>
            </div>
            <div className="auth-feature-card">
              <h4>🏢 Entreprise</h4>
              <p>{offer.company}</p>
            </div>
            <div className="auth-feature-card">
              <h4>📍 Localisation</h4>
              <p>{offer.location}</p>
            </div>
          </div>
        </div>

        <div className="auth-right">
          <div className="form-box auth-box">
            <h2>Envoyer ma candidature</h2>
            <p><strong>{offer.title}</strong> — {offer.company}</p>

            {message && <div className={`form-message ${message.startsWith("✅") ? "success" : "error"}`}>{message}</div>}

            {alreadyApplied ? (
              <div className="already-applied-box">
                <h3>⚠️ Déjà postulé</h3>
                <p>Vous avez déjà envoyé une candidature pour cette offre.</p>
                <Link to="/dashboard" className="btn btn-primary">Voir mon dashboard</Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <textarea
                  name="motivation" placeholder="Écrivez votre motivation ici..."
                  value={form.motivation}
                  onChange={(e) => setForm({ ...form, motivation: e.target.value })}
                  required rows="6"
                />

                <div className="file-upload-wrapper">
                  <p className="file-instruction">Votre CV (PDF, DOC, DOCX, TXT — max 5MB)</p>
                  <input type="file" id="cv-upload" name="cv"
                    accept=".pdf,.doc,.docx,.txt" onChange={handleFileChange} />
                  <label htmlFor="cv-upload" className="file-upload-btn">
                    📂 Choisir un fichier
                  </label>
                  {form.cv && (
                    <div className="file-selected-wrapper">
                      <span className="file-name">📄 {form.cv.name}</span>
                      <label htmlFor="cv-upload" className="file-edit-btn">✏️ Modifier</label>
                    </div>
                  )}
                  {fileError && <p className="file-error">{fileError}</p>}
                </div>

                <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
                  {loading ? "Envoi en cours..." : "Envoyer ma candidature"}
                </button>
              </form>
            )}

            <p className="auth-switch">
              <Link to={`/offers/${offer._id}`}>← Retour à l'offre</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Apply;