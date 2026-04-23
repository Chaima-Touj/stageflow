import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function Register() {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "", email: "", password: "", confirmPassword: "",
    role: "étudiant", phone: "", university: "", specialty: "",
  });
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { setMessage("Minimum 6 caractères."); return; }
    if (form.password !== form.confirmPassword) { setMessage("Les mots de passe ne correspondent pas."); return; }

    setLoading(true);
    const result = await register({
      name: form.name, email: form.email, password: form.password,
      role: form.role, phone: form.phone, university: form.university, specialty: form.specialty,
    });
    setLoading(false);

    if (result.success) {
      navigate("/dashboard");
    } else {
      setMessage(result.message);
    }
  };

  return (
    <div className="form-page">
      <div className="form-box">
        <h2>Créer un compte</h2>
        <p>Inscrivez-vous sur StageFlow et commencez votre parcours.</p>
        {message && <div className="form-message error">{message}</div>}

        <form onSubmit={handleSubmit}>
          <input type="text" name="name" placeholder="Nom complet"
            value={form.name} onChange={handleChange} required />

          <input type="email" name="email" placeholder="Adresse e-mail"
            value={form.email} onChange={handleChange} required />

          <div className="password-wrapper">
            <input type={showPassword ? "text" : "password"} name="password"
              placeholder="Mot de passe" value={form.password} onChange={handleChange} required />
            <button type="button" className="show-password-btn"
              onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>

          <input type={showPassword ? "text" : "password"} name="confirmPassword"
            placeholder="Confirmer le mot de passe" value={form.confirmPassword}
            onChange={handleChange} required />

          <select name="role" value={form.role} onChange={handleChange}>
            <option value="étudiant">Étudiant</option>
            <option value="entreprise">Entreprise</option>
            <option value="encadrant">Encadrant</option>
            <option value="admin">Admin</option>
          </select>

          <input type="text" name="phone" placeholder="Téléphone"
            value={form.phone} onChange={handleChange} />

          <input type="text" name="university" placeholder="Établissement / Université"
            value={form.university} onChange={handleChange} />

          <input type="text" name="specialty" placeholder="Spécialité"
            value={form.specialty} onChange={handleChange} />

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Inscription..." : "S'inscrire"}
          </button>
        </form>

        <p style={{ marginTop: "20px", color: "#cfd8e3" }}>
          Déjà inscrit ? <Link to="/login" style={{ color: "#ffdd59", fontWeight: "600" }}>Se connecter</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;