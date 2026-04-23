import express from "express";// Importer les modules nécessaires, notamment Express pour la création du routeur, les modèles Offer et Application pour interagir avec la base de données des offres et des candidatures, et les middlewares d'authentification pour protéger certaines routes
import Offer from "../models/Offer.js";// Modèle de données de l'offre pour accéder à la base de données
import Application from "../models/Application.js";// Modèle de données de l'application pour accéder à la base de données
import { protect, restrictTo } from "../middleware/auth.js";// Middleware pour protéger les routes et restreindre l'accès en fonction du rôle de l'utilisateur

// Créer un routeur Express pour les routes liées aux offres de stage

const router = express.Router();

// GET all offers (public)
router.get("/", async (req, res) => {
  try {
    const { type, location, search, page = 1, limit = 6 } = req.query;

    const filter = { isActive: true };

    if (type) filter.type = type;
    if (location) filter.location = new RegExp(location, "i");
    if (search) filter.$text = { $search: search };

    const skip = (page - 1) * limit;

    const offers = await Offer.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Offer.countDocuments(filter);

    res.json({
      success: true,
      offers,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    });

  } catch {
    res.status(500).json({ message: "Erreur lors de la récupération des offres." });
  }
});

// GET single offer (public)
router.get("/:id", async (req, res) => {
  try {
    // Récupérer une offre de stage spécifique de la base de données en utilisant l'ID fourni dans les paramètres de l'URL, puis renvoyer l'offre au client ou une erreur 404 si l'offre n'est pas trouvée
    const offer = await Offer.findById(req.params.id);
    if (!offer) return res.status(404).json({ message: "Offre introuvable." });
    res.json({ success: true, offer });
  } catch {
    res.status(500).json({ message: "Erreur serveur." });
  }
});

// POST create offer
router.post("/", protect, restrictTo("entreprise", "admin"), async (req, res) => {
  try {
    // Créer une nouvelle offre de stage dans la base de données en utilisant les informations fournies dans le corps de la requête, en associant l'offre à l'entreprise connectée (ou en utilisant le nom de l'entreprise fourni) et renvoyer l'offre créée au client
    const offer = await Offer.create({
      ...req.body,
      company: req.body.company || req.user.name,
      companyId: req.user._id,
    });
    res.status(201).json({ success: true, offer });
  } catch (err) {
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(". ") });
    }
    res.status(500).json({ message: "Erreur lors de la création." });
  }
});

// PUT update offer
router.put("/:id", protect, restrictTo("entreprise", "admin"), async (req, res) => {
  try {
    // Récupérer l'offre de stage à mettre à jour de la base de données en utilisant l'ID fourni dans les paramètres de l'URL, vérifier que l'offre existe et que l'utilisateur connecté est autorisé à la modifier (soit un administrateur, soit l'entreprise qui a créé l'offre), puis mettre à jour l'offre avec les nouvelles informations fournies dans le corps de la requête et renvoyer l'offre mise à jour au client
    const offer = await Offer.findById(req.params.id);
    if (!offer) return res.status(404).json({ message: "Offre introuvable." });
    if (req.user.role !== "admin" && offer.companyId?.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Non autorisé." });

    // Mettre à jour l'offre avec les nouvelles informations fournies dans le corps de la requête et renvoyer l'offre mise à jour au client
    const updated = await Offer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, offer: updated });
  } catch {
    res.status(500).json({ message: "Erreur lors de la mise à jour." });
  }
});

// DELETE offer
router.delete("/:id", protect, restrictTo("entreprise", "admin"), async (req, res) => {
  try {
    // Récupérer l'offre de stage à supprimer de la base de données en utilisant l'ID fourni dans les paramètres de l'URL, vérifier que l'offre existe et que l'utilisateur connecté est autorisé à la supprimer (soit un administrateur, soit l'entreprise qui a créé l'offre), puis supprimer l'offre et toutes les candidatures associées de la base de données, et renvoyer une confirmation de suppression au client
    const offer = await Offer.findById(req.params.id);
    if (!offer) return res.status(404).json({ message: "Offre introuvable." });
    if (req.user.role !== "admin" && offer.companyId?.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Non autorisé." });

    // Supprimer l'offre et toutes les candidatures associées de la base de données, et renvoyer une confirmation de suppression au client
    await Offer.findByIdAndDelete(req.params.id);
    await Application.deleteMany({ offerId: req.params.id });
    res.json({ success: true, message: "Offre supprimée." });
  } catch {
    res.status(500).json({ message: "Erreur lors de la suppression." });
  }
});

export default router;