import express from "express";// Importer les modules nécessaires, notamment Express pour la création du routeur, le modèle Message pour interagir avec la base de données des messages, et les middlewares d'authentification pour protéger certaines routes
import Message from "../models/Message.js";// Modèle de données de message pour accéder à la base de données
import { protect, restrictTo } from "../middleware/auth.js";// Middleware pour protéger les routes et restreindre l'accès en fonction du rôle de l'utilisateur

// Créer un routeur Express pour les routes liées aux messages de contact

const router = express.Router();
// Fonction utilitaire pour fournir des réponses locales simples du chatbot en fonction du contenu du message de l'utilisateur, utilisée lorsque l'API d'Anthropic n'est pas disponible ou en cas d'erreur
router.post("/", async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message)
      return res.status(400).json({ message: "Tous les champs sont requis." });
    const msg = await Message.create({ name, email, message });
    res.status(201).json({ success: true, message: "Message envoyé !", data: msg });
  } catch {
    res.status(500).json({ message: "Erreur lors de l'envoi." });
  }
});

//
router.get("/", protect, restrictTo("admin"), async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.json({ success: true, messages });
  } catch {
    res.status(500).json({ message: "Erreur serveur." });
  }
});

// Route PUT pour marquer un message comme lu, accessible uniquement aux administrateurs, en mettant à jour le champ isRead du message dans la base de données
router.put("/:id/read", protect, restrictTo("admin"), async (req, res) => {
  try {
    const msg = await Message.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
    res.json({ success: true, message: msg });
  } catch {
    res.status(500).json({ message: "Erreur serveur." });
  }
});

export default router;