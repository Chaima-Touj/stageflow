import express from "express";// Importer le framework Express pour créer des routes HTTP
import User from "../models/User.js";// Importer le modèle de données de l'utilisateur pour accéder à la base de données
import { signToken, protect } from "../middleware/auth.js"; // Importer les fonctions de middleware pour protéger les routes et créer des tokens JWT

// Créer un routeur Express pour les routes liées à l'authentification et à la gestion du profil utilisateur

const router = express.Router();

// Register
router.post("/register", async (req, res) => { // Route pour l'inscription d'un nouvel utilisateur
  try {
    const { name, email, password, role, phone, university, specialty } = req.body;
    console.log("📝 Register attempt:", { name, email, role });

    // Vérifier que les champs requis sont présents
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Nom, email et mot de passe requis." });
    }

    // Vérifier que l'email n'est pas déjà utilisé par un autre utilisateur
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "Cet email est déjà utilisé." });

    // Créer un nouvel utilisateur avec les informations fournies et enregistrer dans la base de données
    const user = await User.create({ name, email, password, role, phone, university, specialty });
    const token = signToken(user._id);
    console.log("✅ User created:", user._id);
    res.status(201).json({ success: true, token, user });

  } 
  // Gérer les erreurs d'inscription, notamment les erreurs de validation et les conflits d'email
  catch (err) {
    console.error("❌ REGISTER ERROR name:", err.name);
    console.error("❌ REGISTER ERROR message:", err.message);
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(". ") });
    }
    if (err.code === 11000) {
      return res.status(400).json({ message: "Cet email est déjà utilisé." });
    }
    res.status(500).json({ message: err.message || "Erreur serveur lors de l'inscription." });
  }
});

// Login
router.post("/login", async (req, res) => {// Route pour la connexion d'un utilisateur existant
  try {
    // Extraire l'email et le mot de passe du corps de la requête pour vérifier les informations d'identification de l'utilisateur
    const { email, password } = req.body;
    console.log("🔐 Login attempt:", email);
    if (!email || !password)
      return res.status(400).json({ message: "Email et mot de passe requis." });

    // Rechercher l'utilisateur dans la base de données en utilisant l'email fourni et inclure le mot de passe pour la comparaison
    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ message: "Email ou mot de passe incorrect." });

    if (!user.isActive)
      return res.status(403).json({ message: "Compte désactivé." });

    // Si les informations d'identification sont correctes et que le compte est actif, créer un token JWT pour l'utilisateur et le renvoyer dans la réponse
    const token = signToken(user._id);
    console.log("✅ Login success:", user._id);
    res.json({ success: true, token, user: user.toJSON() });

  } 
  // Gérer les erreurs de connexion, notamment les erreurs d'authentification et les problèmes de serveur
  catch (err) {
    console.error("❌ LOGIN ERROR:", err.message);
    res.status(500).json({ message: "Erreur serveur lors de la connexion." });
  }
});

// Get current user
router.get("/me", protect, async (req, res) => {
  try {
    // Renvoyer les informations de l'utilisateur actuellement connecté, en utilisant le middleware de protection pour s'assurer que la requête est authentifiée
    const user = await User.findById(req.user._id).populate("supervisorId", "name email");
    res.json({ success: true, user });
  } 
  // Gérer les erreurs lors de la récupération des informations de l'utilisateur, notamment les erreurs d'authentification et les problèmes de serveur  
  catch {
    res.status(500).json({ message: "Erreur serveur." });
  }
});

// Update profile
router.put("/me", protect, async (req, res) => {
  try {
    // Extraire les champs modifiables du corps de la requête pour mettre à jour le profil de l'utilisateur
    const { name, phone, university, specialty } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, university, specialty },
      { new: true, runValidators: true }
    );
    res.json({ success: true, user });
  } catch {
    res.status(500).json({ message: "Erreur lors de la mise à jour." });
  }
});

// Change password
router.put("/change-password", protect, async (req, res) => {
  try {
    // Extraire le mot de passe actuel et le nouveau mot de passe du corps de la requête pour permettre à l'utilisateur de changer son mot de passe
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select("+password");
    if (!(await user.comparePassword(currentPassword)))
      return res.status(400).json({ message: "Mot de passe actuel incorrect." });
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: "Mot de passe modifié avec succès." });
  } catch {
    res.status(500).json({ message: "Erreur lors du changement de mot de passe." });
  }
});

export default router;// Exporter le routeur pour être utilisé dans le fichier principal de l'application (server.js) pour monter les routes liées à l'authentification et à la gestion du profil utilisateur