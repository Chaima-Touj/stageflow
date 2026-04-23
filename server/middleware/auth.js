import jwt from "jsonwebtoken";// Bibliothèque pour créer et vérifier les JWT
import User from "../models/User.js";// Modèle utilisateur pour accéder à la base de données
import process from "process";// Accès aux variables d'environnement

// Middleware pour protéger les routes nécessitant une authentification
export const protect = async (req, res, next) => {
  try {
    let token;// Variable pour stocker le token JWT

    // Vérifier si le token est présent dans les en-têtes d'autorisation
    if (req.headers.authorization?.startsWith("Bearer ")) {// Vérifier que le token commence par "Bearer "
      token = req.headers.authorization.split(" ")[1];// Extraire le token de l'en-tête
    }
    if (!token) {// Si aucun token n'est trouvé, renvoyer une erreur d'authentification
      return res.status(401).json({ message: "Non authentifié. Veuillez vous connecter." });
    }

    // Vérifier que le token est valide et décoder son contenu
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);// Rechercher l'utilisateur correspondant à l'ID dans le token
    
    if (!user || !user.isActive) { // Si l'utilisateur n'existe pas ou est désactivé, renvoyer une erreur d'authentification
      return res.status(401).json({ message: "Utilisateur introuvable ou désactivé." }); 
    }
    req.user = user;// Attacher l'utilisateur à la requête pour les routes suivantes
    next();// Passer au middleware ou à la route suivante
  } catch {// En cas d'erreur (token invalide, expiré, etc.), renvoyer une erreur d'authentification
    return res.status(401).json({ message: "Token invalide ou expiré." });
  }
};

// Middleware pour restreindre l'accès à certaines routes en fonction du rôle de l'utilisateur
export const restrictTo = (...roles) => {// Prendre une liste de rôles autorisés en argument
  return (req, res, next) => {  // Middleware retourné qui vérifie le rôle de l'utilisateur
     if (!req.user) { // Vérifier que l'utilisateur est authentifié
      return res.status(401).json({ message: "Non authentifié. Veuillez vous connecter." });
    }// Vérifier que le rôle de l'utilisateur est dans la liste des rôles autorisés
    if (!roles.includes(req.user.role)) {// Si le rôle de l'utilisateur n'est pas autorisé, renvoyer une erreur d'autorisation
      return res.status(403).json({ message: `Accès refusé. Rôle requis : ${roles.join(", ")}` });
    }
    next();// Passer au middleware ou à la route suivante si le rôle est autorisé
  };
};

// Fonction pour créer un token JWT pour un utilisateur donné
export const signToken = (id) => {// Prendre l'ID de l'utilisateur en argument
  return jwt.sign({ id }, process.env.JWT_SECRET, {// Signer le token avec l'ID de l'utilisateur et la clé secrète
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",// Définir la durée d'expiration du token (par défaut 7 jours)
  });// Retourner le token signé
};
