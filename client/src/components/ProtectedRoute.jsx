// ─── ProtectedRoute.jsx ───────────────────────────────────────────────────────
import { useContext } from "react"; // Importer le hook useContext depuis React pour accéder au contexte d'authentification
import { Navigate } from "react-router-dom"; // Importer le composant Navigate de react-router-dom pour rediriger les utilisateurs non authentifiés vers la page de connexion
import { AuthContext } from "../context/AuthContext"; // Importer le contexte d'authentification pour accéder aux informations de l'utilisateur et déterminer s'il est connecté ou non

// Composant ProtectedRoute qui protège les routes de l'application en vérifiant si l'utilisateur est authentifié, et redirige les utilisateurs non authentifiés vers la page de connexion

function ProtectedRoute({ children }) {
  // Accéder au contexte d'authentification pour obtenir les informations de l'utilisateur, et vérifier si l'utilisateur est connecté en vérifiant la présence d'un objet utilisateur dans le contexte, puis rediriger vers la page de connexion si l'utilisateur n'est pas connecté, ou afficher les enfants du composant (la route protégée) si l'utilisateur est connecté
  const { user } = useContext(AuthContext);
  // Vérifier si l'utilisateur est connecté en vérifiant la présence d'un objet utilisateur dans le contexte, et rediriger vers la page de connexion si l'utilisateur n'est pas connecté, ou afficher les enfants du composant (la route protégée) si l'utilisateur est connecté
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default ProtectedRoute;