import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { DataContext } from "../context/DataContext";
import { usersAPI } from "../api";
import { Link } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { FaUsers, FaBuilding, FaGraduationCap, FaUserPlus, FaBriefcase, FaTrash } from "react-icons/fa";

const COLORS = ["#7F77DD", "#1D9E75", "#D85A30", "#378ADD"];

function Dashboard() {
  const { user } = useContext(AuthContext);
  const {
    offers, applications, notification,
    deleteOffer, updateApplicationStatus, deleteUser,
    loadMyApplications, loadAllApplications, loadCompanyApplications,
    assignSupervisor, showNotification,
  } = useContext(DataContext);

  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [encadrants, setEncadrants] = useState([]);
  const [selectedEncadrants, setSelectedEncadrants] = useState({});
  const [searchUser, setSearchUser] = useState("");
  const [searchOffer, setSearchOffer] = useState("");

  useEffect(() => {
    if (user?.role === "étudiant") loadMyApplications();
    if (user?.role === "entreprise") loadCompanyApplications();
    if (user?.role === "admin" || user?.role === "encadrant") loadAllApplications();
    if (user?.role === "admin") {
      usersAPI.getAll().then((d) => setUsers(d.users)).catch(() => {});
      usersAPI.getStats().then((d) => setStats(d.stats)).catch(() => {});
      usersAPI.getEncadrants().then((d) => setEncadrants(d.encadrants)).catch(() => {});
    }
  }, [user, loadMyApplications, loadCompanyApplications, loadAllApplications]);

  const myApplications = applications.filter((a) => a.userId === user?._id);
  const myOffers = offers.filter((o) => o.companyId === user?._id);
  const companyApplications = applications.filter((a) =>
    myOffers.some((o) => o._id === a.offerId)
  );
  const myStudents = users.filter((u) => u.supervisorId === user?._id);
  const mySupervisor = users.find((u) => u._id === user?.supervisorId);
  const acceptedApps = myApplications.filter((a) => a.status === "Acceptée");

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(searchUser.toLowerCase()) ||
    u.email.toLowerCase().includes(searchUser.toLowerCase())
  );
  const filteredOffers = offers.filter((o) =>
    o.title.toLowerCase().includes(searchOffer.toLowerCase()) ||
    o.company.toLowerCase().includes(searchOffer.toLowerCase())
  );

  const handleAssign = async (studentId) => {
    const supervisorId = selectedEncadrants[studentId];
    if (!supervisorId) { showNotification("⚠️ Choisissez un encadrant.", "warning"); return; }
    await assignSupervisor(studentId, supervisorId);
    usersAPI.getAll().then((d) => setUsers(d.users)).catch(() => {});
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Supprimer ${userName} ?`)) return;
    await deleteUser(userId);
    setUsers((prev) => prev.filter((u) => u._id !== userId));
  };

  const pieData = stats ? [
    { name: "Étudiants", value: stats.students },
    { name: "Entreprises", value: stats.companies },
    { name: "Encadrants", value: stats.encadrants },
  ] : [];

  return (
    <div className="dashboard-pro">
      {notification && (
        <div className={`app-toast ${notification.type}`}>{notification.text}</div>
      )}

      <div className="dashboard-header">
        <div>
          <span className="dashboard-badge">📊 Tableau de bord</span>
          <h2>Bienvenue {user?.name} 👋</h2>
          <p>Rôle : <strong>{user?.role}</strong></p>
        </div>
      </div>

      {/* ══════════ ÉTUDIANT ══════════ */}
      {user?.role === "étudiant" && (
        <>
          <div className="dashboard-stats-grid">
            <div className="dashboard-stat-card">
              <h3>{myApplications.length}</h3><p>Candidatures</p>
            </div>
            <div className="dashboard-stat-card">
              <h3>{acceptedApps.length}</h3><p>Acceptées</p>
            </div>
            <div className="dashboard-stat-card">
              <h3>{offers.length}</h3><p>Offres dispo</p>
            </div>
            <div className="dashboard-stat-card">
              <h3>{user?.specialty || "—"}</h3><p>Spécialité</p>
            </div>
          </div>

          <div className="dashboard-panel">
            <h3>👨‍🏫 Mon encadrant</h3>
            {mySupervisor ? (
              <div className="dashboard-highlight-card">
                <strong>{mySupervisor.name}</strong>
                <p>{mySupervisor.email}</p>
              </div>
            ) : <p>Aucun encadrant affecté pour le moment.</p>}
          </div>

          <div className="dashboard-panel">
            <h3>📝 Mes candidatures</h3>
            {myApplications.length === 0 ? <p>Aucune candidature envoyée.</p> : (
              <ul className="dashboard-list">
                {myApplications.map((app) => (
                  <li key={app._id}>
                    <div>
                      <strong>{app.offerTitle}</strong>
                      <p>{app.company}</p>
                    </div>
                    <span className={`status-badge status-${app.status.toLowerCase().replace(" ", "-")}`}>
                      {app.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}

      {/* ══════════ ENTREPRISE ══════════ */}
      {user?.role === "entreprise" && (
        <>
          <div className="dashboard-stats-grid">
            <div className="dashboard-stat-card"><h3>{myOffers.length}</h3><p>Mes offres</p></div>
            <div className="dashboard-stat-card"><h3>{companyApplications.length}</h3><p>Candidatures reçues</p></div>
            <div className="dashboard-stat-card">
              <h3>{companyApplications.filter((a) => a.status === "Acceptée").length}</h3>
              <p>Acceptées</p>
            </div>
          </div>

          <div className="dashboard-panel">
            <div className="dashboard-panel-top">
              <h3>📢 Mes offres</h3>
              <Link to="/add-offer" className="btn btn-primary">+ Ajouter</Link>
            </div>
            {myOffers.length === 0 ? <p>Aucune offre publiée.</p> : (
              <ul className="dashboard-list">
                {myOffers.map((offer) => (
                  <li key={offer._id}>
                    <div><strong>{offer.title}</strong><p>{offer.location}</p></div>
                    <div className="status-actions">
                      <span>{offer.type}</span>
                      <button className="mini-btn reject" onClick={() => deleteOffer(offer._id)}>
                        <FaTrash /> Supprimer
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="dashboard-panel">
            <h3>📨 Candidatures reçues</h3>
            {companyApplications.length === 0 ? <p>Aucune candidature reçue.</p> : (
              <ul className="dashboard-list">
                {companyApplications.map((app) => (
                  <li key={app._id}>
                    <div><strong>{app.userName}</strong><p>{app.offerTitle}</p></div>
                    <div className="status-actions">
                      <span className="status-badge">{app.status}</span>
                      <div className="mini-actions">
                        <button className="mini-btn accept"
                          onClick={() => updateApplicationStatus(app._id, "Acceptée")}>Accepter</button>
                        <button className="mini-btn reject"
                          onClick={() => updateApplicationStatus(app._id, "Refusée")}>Refuser</button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}

      {/* ══════════ ENCADRANT ══════════ */}
      {user?.role === "encadrant" && (
        <>
          <div className="dashboard-stats-grid">
            <div className="dashboard-stat-card"><h3>{myStudents.length}</h3><p>Mes étudiants</p></div>
            <div className="dashboard-stat-card"><h3>{applications.length}</h3><p>Candidatures globales</p></div>
            <div className="dashboard-stat-card"><h3>{offers.length}</h3><p>Offres dispo</p></div>
          </div>
          <div className="dashboard-panel">
            <h3>🎓 Mes étudiants encadrés</h3>
            {myStudents.length === 0 ? <p>Aucun étudiant affecté.</p> : (
              <ul className="dashboard-list">
                {myStudents.map((s) => (
                  <li key={s._id}>
                    <div><strong>{s.name}</strong><p>{s.email}</p></div>
                    <span>{s.specialty || "Sans spécialité"}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}

      {/* ══════════ ADMIN ══════════ */}
      {user?.role === "admin" && (
        <>
          <div className="dashboard-stats-grid">
            <div className="dashboard-stat-card"><FaUsers className="dash-icon" /><h3>{stats?.totalUsers || 0}</h3><p>Utilisateurs</p></div>
            <div className="dashboard-stat-card"><FaGraduationCap className="dash-icon" /><h3>{stats?.students || 0}</h3><p>Étudiants</p></div>
            <div className="dashboard-stat-card"><FaUserPlus className="dash-icon" /><h3>{stats?.encadrants || 0}</h3><p>Encadrants</p></div>
            <div className="dashboard-stat-card"><FaBuilding className="dash-icon" /><h3>{stats?.companies || 0}</h3><p>Entreprises</p></div>
            <div className="dashboard-stat-card"><FaBriefcase className="dash-icon" /><h3>{stats?.totalOffers || 0}</h3><p>Offres actives</p></div>
            <div className="dashboard-stat-card"><h3>{stats?.totalApps || 0}</h3><p>Candidatures</p></div>
          </div>

          {/* Charts */}
          {stats?.chartData?.length > 0 && (
            <div className="dashboard-charts">
              <div className="chart-card">
                <h3>📈 Candidatures par mois</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={stats.chartData}>
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="candidatures" fill="#7F77DD" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="chart-card">
                <h3>👥 Répartition utilisateurs</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label>
                      {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Users management */}
          <div className="dashboard-panel">
            <div className="dashboard-panel-top">
              <h3>👥 Gestion des utilisateurs</h3>
              <input type="text" placeholder="Rechercher..." className="dashboard-search"
                value={searchUser} onChange={(e) => setSearchUser(e.target.value)} />
            </div>
            <ul className="dashboard-list">
              {filteredUsers.map((u) => (
                <li key={u._id}>
                  <div><strong>{u.name}</strong><p>{u.email}</p></div>
                  <div className="status-actions">
                    <span className="role-badge">{u.role}</span>
                    {u._id !== user._id && (
                      <button className="mini-btn reject" onClick={() => handleDeleteUser(u._id, u.name)}>
                        <FaTrash /> Supprimer
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Assign supervisor */}
          <div className="dashboard-panel">
            <h3>🎯 Affectation des encadrants</h3>
            {users.filter((u) => u.role === "étudiant").length === 0 ? (
              <p>Aucun étudiant disponible.</p>
            ) : (
              <ul className="dashboard-list">
                {users.filter((u) => u.role === "étudiant").map((student) => (
                  <li key={student._id}>
                    <div>
                      <strong>{student.name}</strong>
                      <p>{student.email}</p>
                      <small>Encadrant : <strong>{student.supervisorName || "Non affecté"}</strong></small>
                    </div>
                    <div className="status-actions">
                      <select className="dashboard-select"
                        value={selectedEncadrants[student._id] || student.supervisorId || ""}
                        onChange={(e) => setSelectedEncadrants({ ...selectedEncadrants, [student._id]: e.target.value })}>
                        <option value="">Choisir un encadrant</option>
                        {encadrants.map((enc) => (
                          <option key={enc._id} value={enc._id}>{enc.name}</option>
                        ))}
                      </select>
                      <button className="mini-btn accept" onClick={() => handleAssign(student._id)}>
                        <FaUserPlus /> Affecter
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* All offers */}
          <div className="dashboard-panel">
            <div className="dashboard-panel-top">
              <h3>📂 Toutes les offres</h3>
              <input type="text" placeholder="Rechercher..." className="dashboard-search"
                value={searchOffer} onChange={(e) => setSearchOffer(e.target.value)} />
            </div>
            <ul className="dashboard-list">
              {filteredOffers.map((offer) => (
                <li key={offer._id}>
                  <div><strong>{offer.title}</strong><p>{offer.location}</p></div>
                  <span>{offer.company}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* All applications */}
          <div className="dashboard-panel">
            <h3>📨 Toutes les candidatures</h3>
            {applications.length === 0 ? <p>Aucune candidature.</p> : (
              <ul className="dashboard-list">
                {applications.map((app) => (
                  <li key={app._id}>
                    <div><strong>{app.userName}</strong><p>{app.offerTitle}</p></div>
                    <span className="status-badge">{app.status}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;