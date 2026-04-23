import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

function Profile() {
  const { user, updateProfile } = useContext(AuthContext);
  const [form, setForm] = useState({
    name: user?.name || "", email: user?.email || "",
    phone: user?.phone || "", university: user?.university || "",
    specialty: user?.specialty || "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await updateProfile(form);
    setLoading(false);
    setMessage(result.success ? "✅ Profil mis à jour !" : result.message);
  };

  return (
    <div className="page profile-pro">
      <div className="profile-header-card">
        <div className="profile-avatar-large">
          {(user?.name || "U").charAt(0).toUpperCase()}
        </div>
        <div className="profile-main-info">
          <h2>{user?.name}</h2>
          <p>{user?.email}</p>
          <span className="profile-role-badge">{user?.role}</span>
        </div>
      </div>

      <div className="form-page">
        <div className="form-box">
          <h2>Modifier mon profil</h2>
          <p>Complétez ou mettez à jour vos informations</p>
          {message && <div className={`form-message ${message.startsWith("✅") ? "success" : "error"}`}>{message}</div>}
          <form onSubmit={handleSubmit}>
            <input type="text" name="name" placeholder="Nom complet"
              value={form.name} onChange={handleChange} />
            <input type="email" name="email" placeholder="Email" value={form.email} disabled
              style={{ opacity: 0.6, cursor: "not-allowed" }} />
            <input type="text" name="phone" placeholder="Téléphone"
              value={form.phone} onChange={handleChange} />
            <input type="text" name="university" placeholder="Université / Établissement"
              value={form.university} onChange={handleChange} />
            <input type="text" name="specialty" placeholder="Spécialité"
              value={form.specialty} onChange={handleChange} />
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Mise à jour..." : "Enregistrer"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Profile;