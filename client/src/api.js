const BASE_URL = import.meta.env.VITE_API_URL ;

// ─── Token helpers ─────────────────────────────────────────────────────────────
export const getToken = () => localStorage.getItem("stageflow_token");
export const setToken = (token) => localStorage.setItem("stageflow_token", token);
export const removeToken = () => localStorage.removeItem("stageflow_token");

// ─── Base fetch ────────────────────────────────────────────────────────────────
async function apiFetch(endpoint, options = {}) {
  const token = getToken();
  const headers = { ...options.headers };

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });
  const data = await res.json();

  if (!res.ok) throw new Error(data.message || "Erreur serveur");
  return data;
}

// ─── AUTH ──────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (userData) =>
    apiFetch("/auth/register", { method: "POST", body: JSON.stringify(userData) }),

  login: (email, password) =>
    apiFetch("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),

  getMe: () => apiFetch("/auth/me"),

  updateProfile: (data) =>
    apiFetch("/auth/me", { method: "PUT", body: JSON.stringify(data) }),

  changePassword: (currentPassword, newPassword) =>
    apiFetch("/auth/change-password", {
      method: "PUT",
      body: JSON.stringify({ currentPassword, newPassword }),
    }),
};

// ─── OFFERS ────────────────────────────────────────────────────────────────────
export const offersAPI = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiFetch(`/offers${query ? "?" + query : ""}`);
  },
  getOne: (id) => apiFetch(`/offers/${id}`),
  create: (data) => apiFetch("/offers", { method: "POST", body: JSON.stringify(data) }),
  update: (id, data) => apiFetch(`/offers/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id) => apiFetch(`/offers/${id}`, { method: "DELETE" }),
};

// ─── APPLICATIONS ──────────────────────────────────────────────────────────────
export const applicationsAPI = {
  getMy: () => apiFetch("/applications/my"),
  getAll: () => apiFetch("/applications"),
  getCompany: () => apiFetch("/applications/company"),

  apply: (offerId, motivation, cvFile) => {
    const formData = new FormData();
    formData.append("offerId", offerId);
    formData.append("motivation", motivation);
    if (cvFile) formData.append("cv", cvFile);
    return apiFetch("/applications", { method: "POST", body: formData });
  },

  updateStatus: (id, status) =>
    apiFetch(`/applications/${id}/status`, { method: "PUT", body: JSON.stringify({ status }) }),

  assignSupervisor: (id, supervisorId) =>
    apiFetch(`/applications/${id}/supervisor`, {
      method: "PUT",
      body: JSON.stringify({ supervisorId }),
    }),

  delete: (id) => apiFetch(`/applications/${id}`, { method: "DELETE" }),
};

// ─── USERS ─────────────────────────────────────────────────────────────────────
export const usersAPI = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiFetch(`/users${query ? "?" + query : ""}`);
  },
  getStats: () => apiFetch("/users/stats"),
  getEncadrants: () => apiFetch("/users/encadrants"),
  delete: (id) => apiFetch(`/users/${id}`, { method: "DELETE" }),
  assignSupervisor: (studentId, supervisorId) =>
    apiFetch(`/users/${studentId}/assign-supervisor`, {
      method: "PUT",
      body: JSON.stringify({ supervisorId }),
    }),
};

// ─── CHATBOT ───────────────────────────────────────────────────────────────────
// Ajoutez ces méthodes à votre chatbotAPI existant

export const chatbotAPI = {
  send: (message, history = [], user = null) =>
    apiFetch("/chat", {
      method: "POST",
      body: JSON.stringify({
        message,
        history: history.filter(m => m.sender !== 'system').slice(-10), // Derniers 10 messages
        user: user ? { id: user.id, email: user.email, role: user.role } : null,
      }),
    }),
  
  // Nouvelle méthode pour le feedback
  sendFeedback: (messageId, rating, userId) =>
    apiFetch("/chat/feedback", {
      method: "POST",
      body: JSON.stringify({ messageId, rating, userId }),
    }),
  
  // Nouvelle méthode pour chercher des offres
  searchOffers: (keyword) =>
    apiFetch("/chat/offers", {
      method: "POST",
      body: JSON.stringify({ keyword }),
    }),
};
// ─── MESSAGES ──────────────────────────────────────────────────────────────────
export const messagesAPI = {
  send: (name, email, message) =>
    apiFetch("/messages", { method: "POST", body: JSON.stringify({ name, email, message }) }),
  getAll: () => apiFetch("/messages"),
  markRead: (id) => apiFetch(`/messages/${id}/read`, { method: "PUT" }),
};