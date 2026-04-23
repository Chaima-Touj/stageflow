import React, { createContext, useState, useEffect } from "react";// Importer les fonctions et objets nécessaires depuis React pour créer un contexte d'authentification, gérer l'état de l'utilisateur et les effets de bord liés à l'authentification, ainsi que les fonctions pour gérer les tokens d'authentification depuis l'API
import { authAPI, getToken, setToken, removeToken } from "../api";// Importer les fonctions de l'API d'authentification pour gérer les opérations d'inscription, de connexion, de mise à jour du profil et de récupération des informations de l'utilisateur, ainsi que les fonctions pour gérer les tokens d'authentification dans le stockage local du navigateur

// Créer un contexte d'authentification pour partager les informations de l'utilisateur et les fonctions d'authentification à travers l'application, et un fournisseur de contexte qui gère l'état de l'utilisateur, les opérations d'inscription, de connexion, de déconnexion, de mise à jour du profil et de restauration de session à partir d'un token d'authentification stocké
// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext();

// Composant AuthProvider qui gère l'état de l'utilisateur, les opérations d'inscription, de connexion, de déconnexion, de mise à jour du profil et de restauration de session à partir d'un token d'authentification stocké, et fournit ces informations et fonctions à travers le contexte d'authentification pour être utilisées dans toute l'application
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Effet de bord pour restaurer la session de l'utilisateur à partir d'un token d'authentification stocké dans le stockage local du navigateur, en vérifiant la présence d'un token, en appelant l'API pour récupérer les informations de l'utilisateur associé au token, et en mettant à jour l'état de l'utilisateur ou en supprimant le token si la récupération échoue, tout en gérant un état de chargement pour indiquer que la restauration de session est en cours
  useEffect(() => {
    const restoreSession = async () => {
      const token = getToken();
      if (!token) { setLoading(false); return; }
      try {
        const data = await authAPI.getMe();
        setUser(data.user);
      } catch {
        removeToken();
      } finally {
        setLoading(false);
      }
    };
    restoreSession();
  }, []);

  // ─── Register ────────────────────────────────────────────────────────────────
  const register = async (userData) => {
    try {
      // Appeler l'API d'inscription avec les données de l'utilisateur, et en cas de succès, stocker le token d'authentification et les informations de l'utilisateur dans l'état, ou retourner un message d'erreur en cas d'échec
      const data = await authAPI.register(userData);
      setToken(data.token);
      setUser(data.user);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  // ─── Login ───────────────────────────────────────────────────────────────────
  const login = async (email, password) => {
    try {
      // Appeler l'API de connexion avec l'email et le mot de passe de l'utilisateur, et en cas de succès, stocker le token d'authentification et les informations de l'utilisateur dans l'état, ou retourner un message d'erreur en cas d'échec
      const data = await authAPI.login(email, password);
      setToken(data.token);
      setUser(data.user);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  // ─── Logout ──────────────────────────────────────────────────────────────────
  const logout = () => {
    removeToken();// Supprimer le token d'authentification du stockage local du navigateur, et réinitialiser l'état de l'utilisateur à null pour indiquer que l'utilisateur est déconnecté
    setUser(null);// Réinitialiser l'état de l'utilisateur à null pour indiquer que l'utilisateur est déconnecté
  };

  // ─── Update profile ──────────────────────────────────────────────────────────
  const updateProfile = async (updatedData) => {
    try {
      // Appeler l'API de mise à jour du profil avec les nouvelles données de l'utilisateur, et en cas de succès, mettre à jour les informations de l'utilisateur dans l'état, ou retourner un message d'erreur en cas d'échec
      const data = await authAPI.updateProfile(updatedData);
      setUser(data.user);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  // ─── Refresh user ────────────────────────────────────────────────────────────
  const refreshUser = async () => {
    try {
      // Appeler l'API pour récupérer les informations de l'utilisateur actuel à partir du token d'authentification, et mettre à jour les informations de l'utilisateur dans l'état, ou supprimer le token et réinitialiser l'état de l'utilisateur en cas d'échec
      const data = await authAPI.getMe();
      setUser(data.user);
    } catch {
      logout();
    }
  };

  // Rendu du fournisseur de contexte d'authentification, en fournissant les informations de l'utilisateur, l'état de chargement, et les fonctions d'inscription, de connexion, de déconnexion, de mise à jour du profil et de rafraîchissement de l'utilisateur à travers le contexte pour être utilisées dans toute l'application, tout en affichant les enfants du composant uniquement lorsque le chargement est terminé pour éviter d'afficher des composants dépendant de l'authentification avant que les informations de l'utilisateur ne soient restaurées
  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register, updateProfile, refreshUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
