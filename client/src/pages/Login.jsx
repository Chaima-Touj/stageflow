import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { FaEye, FaEyeSlash, FaEnvelope, FaLock } from "react-icons/fa";

function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await login(form.email, form.password);
    setLoading(false);
    if (result.success) {
      navigate("/dashboard");
    } else {
      setMessage(result.message);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-wrapper">
        <div className="auth-left">
          <span className="auth-badge">🔐 Connexion sécurisée</span>
          <h1>Bienvenue sur StageFlow</h1>
          <p>Connectez-vous pour accéder à vos candidatures, offres et outils de gestion.</p>
          <div className="auth-features">
            <div className="auth-feature-card">
              <h4>📄 Candidatures centralisées</h4>
              <p>Suivez vos stages, CV et demandes facilement.</p>
            </div>
            <div className="auth-feature-card">
              <h4>⚡ Accès rapide</h4>
              <p>Connectez-vous et continuez votre parcours instantanément.</p>
            </div>
          </div>
        </div>

        <div className="auth-right">
          <div className="form-box auth-box">
            <h2>Connexion</h2>
            <p>Accédez à votre espace personnel</p>
            {message && <div className="form-message error">{message}</div>}

            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <span className="input-icon"><FaEnvelope /></span>
                <input
                  type="email" name="email" placeholder="Adresse e-mail"
                  value={form.email} onChange={handleChange} required
                />
              </div>

              <div className="input-group password-group">
                <span className="input-icon"><FaLock /></span>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password" placeholder="Mot de passe"
                  value={form.password} onChange={handleChange} required
                />
                <button type="button" className="show-password-btn"
                  onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
                {loading ? "Connexion..." : "Se connecter"}
              </button>
            </form>

            <p className="auth-switch">
              Pas de compte ? <Link to="/register">Créer un compte</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;