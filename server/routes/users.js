import express from "express";//importer les modules nécessaires, notamment Express pour la création du routeur, les modèles User, Application et Offer pour interagir avec la base de données, et les middlewares d'authentification pour protéger certaines routes
import User from "../models/User.js";
import Application from "../models/Application.js";
import Offer from "../models/Offer.js";
import { protect, restrictTo } from "../middleware/auth.js";// Middleware pour protéger les routes et restreindre l'accès en fonction du rôle de l'utilisateur

// Créer un routeur Express pour les routes liées à la gestion des utilisateurs et des statistiques

const router = express.Router();

// GET stats (admin)
router.get("/stats", protect, restrictTo("admin"), async (req, res) => {
  try {
    // Utiliser Promise.all pour exécuter plusieurs requêtes de comptage en parallèle afin d'obtenir les statistiques globales sur les utilisateurs, les candidatures et les offres, puis formater les données pour le graphique des candidatures par mois et renvoyer les statistiques au client
    const [totalUsers, students, encadrants, companies, totalApps, pendingApps, acceptedApps, totalOffers] =
      await Promise.all([
        User.countDocuments(),
        User.countDocuments({ role: "étudiant" }),
        User.countDocuments({ role: "encadrant" }),
        User.countDocuments({ role: "entreprise" }),
        Application.countDocuments(),
        Application.countDocuments({ status: "En attente" }),
        Application.countDocuments({ status: "Acceptée" }),
        Offer.countDocuments({ isActive: true }),
      ]);

      // Calculer les candidatures par mois pour les 6 derniers mois en utilisant une agrégation MongoDB, puis formater les données pour le graphique en associant les numéros de mois à des noms de mois et renvoyer les statistiques au client
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    // Calculer les candidatures par mois pour les 6 derniers mois en utilisant une agrégation MongoDB, puis formater les données pour le graphique en associant les numéros de mois à des noms de mois et renvoyer les statistiques au client
    const appsByMonth = await Application.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    // Formater les données pour le graphique en associant les numéros de mois à des noms de mois
    const months = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];
    const chartData = appsByMonth.map((item) => ({
      month: months[item._id.month - 1],
      candidatures: item.count,
    }));

    // Renvoyer les statistiques au client
    res.json({
      success: true,
      stats: { totalUsers, students, encadrants, companies, totalApps, pendingApps, acceptedApps, totalOffers, chartData },
    });
  } catch {
    res.status(500).json({ message: "Erreur statistiques." });
  }
});

// GET encadrants list
router.get("/encadrants", protect, restrictTo("admin"), async (req, res) => {
  try {
    // Récupérer la liste des encadrants de la base de données en filtrant les utilisateurs par rôle "encadrant" et en sélectionnant uniquement les champs pertinents (nom, email, spécialité), puis renvoyer la liste des encadrants au client
    const encadrants = await User.find({ role: "encadrant" }).select("name email specialty");
    res.json({ success: true, encadrants });
  } catch {
    res.status(500).json({ message: "Erreur serveur." });
  }
});

// GET all users (admin)
router.get("/", protect, restrictTo("admin"), async (req, res) => {
  try {
    // Extraire les paramètres de requête pour filtrer les utilisateurs en fonction du rôle et d'une recherche textuelle, puis construire un objet de filtre pour interroger la base de données des utilisateurs
    const { role, search } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (search) filter.$or = [
      { name: new RegExp(search, "i") },
      { email: new RegExp(search, "i") },
    ];
    // Récupérer les utilisateurs de la base de données en appliquant les filtres et trier les résultats par date de création décroissante, puis renvoyer les utilisateurs au client
    const users = await User.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch {
    res.status(500).json({ message: "Erreur serveur." });
  }
});

// DELETE user (admin)
router.delete("/:id", protect, restrictTo("admin"), async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString())
      return res.status(400).json({ message: "Impossible de supprimer votre propre compte." });

    // Récupérer l'utilisateur à supprimer de la base de données en utilisant l'ID fourni dans les paramètres de l'URL, vérifier que l'utilisateur existe, puis supprimer l'utilisateur et toutes les candidatures associées de la base de données, et renvoyer une confirmation de suppression au client
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "Utilisateur introuvable." });

    // Supprimer l'utilisateur et toutes les candidatures associées de la base de données, et renvoyer une confirmation de suppression au client
    await Application.deleteMany({ userId: req.params.id });
    res.json({ success: true, message: `${user.name} supprimé.` });
  } catch {
    res.status(500).json({ message: "Erreur serveur." });
  }
});

// PUT assign supervisor (admin)
router.put("/:studentId/assign-supervisor", protect, restrictTo("admin"), async (req, res) => {
  try {
    // Vérifier que l'encadrant existe et a le rôle d'encadrant, puis mettre à jour les informations de l'encadrant dans le profil de l'étudiant spécifié par l'ID dans les paramètres de l'URL, et renvoyer les informations mises à jour de l'étudiant au client
    const supervisor = await User.findById(req.body.supervisorId);
    if (!supervisor || supervisor.role !== "encadrant")
      return res.status(400).json({ message: "Encadrant invalide." });

    // Mettre à jour les informations de l'encadrant dans le profil de l'étudiant spécifié par l'ID dans les paramètres de l'URL, et renvoyer les informations mises à jour de l'étudiant au client
    const student = await User.findByIdAndUpdate(
      req.params.studentId,
      { supervisorId: supervisor._id, supervisorName: supervisor.name },
      { new: true }
    );
    if (!student) return res.status(404).json({ message: "Étudiant introuvable." });
    res.json({ success: true, student });
  } catch {
    res.status(500).json({ message: "Erreur serveur." });
  }
});

export default router;