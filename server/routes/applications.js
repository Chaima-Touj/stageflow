import express from "express";// Importer Express pour créer des routes pour les candidatures
import Application from "../models/Application.js";// Modèle de données de l'application pour accéder à la base de données
import Offer from "../models/Offer.js";// Modèle de données de l'offre pour accéder à la base de données
import User from "../models/User.js";// Modèle de données de l'utilisateur pour accéder à la base de données
import { protect, restrictTo } from "../middleware/auth.js";// Middleware pour protéger les routes et restreindre l'accès en fonction du rôle de l'utilisateur
import { upload } from "../middleware/upload.js";// Middleware pour gérer le téléchargement de fichiers (CV) lors de la candidature

// Créer un routeur Express pour les routes liées aux candidatures
const router = express.Router();

// GET my applications
router.get("/my", protect, async (req, res) => {
  try {
    const apps = await Application.find({ userId: req.user._id }).sort({ createdAt: -1 });// Récupérer les candidatures de l'utilisateur connecté, triées par date de création décroissante
    res.json({ success: true, applications: apps });// Renvoyer les candidatures au client
  } catch {
    res.status(500).json({ message: "Erreur serveur." });
  }
});

// GET company applications
router.get("/company", protect, restrictTo("entreprise", "admin"), async (req, res) => {// Récupérer les candidatures pour les offres de l'entreprise connectée (ou pour tous les administrateurs)
  try {
    const myOffers = await Offer.find({ companyId: req.user._id }).select("_id");// Récupérer les offres de l'entreprise connectée pour obtenir leurs IDs
    const offerIds = myOffers.map((o) => o._id);// Extraire les IDs des offres
    const apps = await Application.find({ offerId: { $in: offerIds } })// Récupérer les candidatures dont l'offerId correspond à l'un des IDs des offres de l'entreprise
      .populate("userId", "name email specialty")// Remplir les informations de l'utilisateur (nom, email, spécialité) pour chaque candidature
      .sort({ createdAt: -1 });// Trier les candidatures par date de création décroissante
    res.json({ success: true, applications: apps });// Renvoyer les candidatures au client
  } catch {
    res.status(500).json({ message: "Erreur serveur." });
  }
});

// GET all applications (admin/encadrant)
router.get("/", protect, restrictTo("admin", "encadrant"), async (req, res) => {// Récupérer toutes les candidatures pour les administrateurs et les encadrants
  try {
    const apps = await Application.find()// Récupérer toutes les candidatures
      .populate("userId", "name email specialty university")// Remplir les informations de l'utilisateur (nom, email, spécialité, université) pour chaque candidature
      .sort({ createdAt: -1 });// Trier les candidatures par date de création décroissante
    res.json({ success: true, applications: apps });// Renvoyer les candidatures au client
  } catch {
    res.status(500).json({ message: "Erreur serveur." });
  }
});

// POST apply
router.post("/", protect, restrictTo("étudiant"), upload.single("cv"), async (req, res) => {// Permettre aux étudiants de postuler à une offre en envoyant une candidature avec un CV (fichier) attaché
  try {
    const { offerId, motivation } = req.body;// Extraire l'ID de l'offre et la lettre de motivation du corps de la requête
    const offer = await Offer.findById(offerId);// Vérifier que l'offre existe avant de créer la candidature
    if (!offer) return res.status(404).json({ message: "Offre introuvable." });// Si l'offre n'existe pas, renvoyer une erreur 404

    const existing = await Application.findOne({ userId: req.user._id, offerId });// Vérifier si l'utilisateur a déjà postulé à cette offre
    if (existing) return res.status(400).json({ message: "Vous avez déjà postulé." });// Si oui, renvoyer une erreur 400

    // Créer une nouvelle candidature avec les informations de l'utilisateur, de l'offre, de la lettre de motivation et du CV (si fourni)
    const app = await Application.create({
      userId: req.user._id,
      userName: req.user.name,
      userEmail: req.user.email,
      offerId,
      offerTitle: offer.title,
      company: offer.company,
      location: offer.location,
      type: offer.type,
      motivation,
      cvFileName: req.file?.originalname || "",
      cvPath: req.file?.path || "",
    });

    await Offer.findByIdAndUpdate(offerId, { $inc: { applicationsCount: 1 } });// Incrémenter le compteur de candidatures de l'offre
    res.status(201).json({ success: true, application: app });// Renvoyer la candidature créée au client
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: "Déjà postulé." });// Gérer l'erreur de clé unique (candidature en double)
    res.status(500).json({ message: "Erreur lors de l'envoi." });
  }
});

// PUT update status
router.put("/:id/status", protect, restrictTo("entreprise", "admin"), async (req, res) => {// Permettre aux entreprises et aux administrateurs de mettre à jour le statut d'une candidature (acceptée, refusée, en cours)
  try {
    const app = await Application.findByIdAndUpdate(// Trouver la candidature par ID et mettre à jour son statut
      req.params.id,// ID de la candidature à mettre à jour, extrait des paramètres de l'URL
      { status: req.body.status },// Nouveau statut à appliquer, extrait du corps de la requête
      { new: true }// Option pour retourner la candidature mise à jour dans la réponse
    );
    if (!app) return res.status(404).json({ message: "Candidature introuvable." });// Si la candidature n'existe pas, renvoyer une erreur 404
    res.json({ success: true, application: app });// Renvoyer la candidature mise à jour au client
  } catch {
    res.status(500).json({ message: "Erreur serveur." });
  }
});

// PUT assign supervisor
router.put("/:id/supervisor", protect, restrictTo("admin"), async (req, res) => {// Permettre aux administrateurs d'affecter un encadrant à une candidature
  try {
    const supervisor = await User.findById(req.body.supervisorId);// Vérifier que l'encadrant existe et a le rôle d'encadrant
    if (!supervisor || supervisor.role !== "encadrant")// Si l'encadrant n'existe pas ou n'a pas le rôle d'encadrant, renvoyer une erreur 400
      return res.status(400).json({ message: "Encadrant invalide." });

    const app = await Application.findByIdAndUpdate(// Trouver la candidature par ID et mettre à jour les informations de l'encadrant
      req.params.id,// ID de la candidature à mettre à jour, extrait des paramètres de l'URL
      { supervisorId: supervisor._id, supervisorName: supervisor.name },// Informations de l'encadrant à appliquer, extraites du corps de la requête
      { new: true }// Option pour retourner la candidature mise à jour dans la réponse
    );
    await User.findByIdAndUpdate(app.userId, {// Mettre à jour les informations de l'encadrant dans le profil de l'utilisateur qui a postulé
      supervisorId: supervisor._id,// ID de l'encadrant à appliquer, extrait du corps de la requête
      supervisorName: supervisor.name,// Nom de l'encadrant à appliquer, extrait du corps de la requête
    });
    res.json({ success: true, application: app });// Renvoyer la candidature mise à jour au client
  } catch {
    res.status(500).json({ message: "Erreur lors de l'affectation." });
  }
});

// DELETE application
router.delete("/:id", protect, async (req, res) => {
  try {
    const app = await Application.findById(req.params.id);// Trouver la candidature par ID pour vérifier son existence et les autorisations de suppression
    if (!app) return res.status(404).json({ message: "Introuvable." });
    if (req.user.role !== "admin" && app.userId.toString() !== req.user._id.toString())// Seuls les administrateurs ou l'utilisateur qui a postulé peuvent supprimer la candidature
      return res.status(403).json({ message: "Non autorisé." });

    await Application.findByIdAndDelete(req.params.id);// Supprimer la candidature de la base de données
    await Offer.findByIdAndUpdate(app.offerId, { $inc: { applicationsCount: -1 } });// Décrémenter le compteur de candidatures de l'offre associée

    res.json({ success: true, message: "Candidature supprimée." });// Renvoyer une confirmation de suppression au client
  } catch {
    res.status(500).json({ message: "Erreur serveur." });
  }
});
// Exporter le routeur pour être utilisé dans le fichier principal de l'application (server.js) pour monter les routes liées aux candidatures
export default router;