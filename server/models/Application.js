import mongoose from "mongoose";// Importer Mongoose pour définir le schéma de données et le modèle de l'application

// Définir le schéma de données pour les candidatures aux offres de stage et PFE
const applicationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    userName: { type: String, required: true },
    userEmail: { type: String, required: true },
    offerId: { type: mongoose.Schema.Types.ObjectId, ref: "Offer", required: true },
    offerTitle: { type: String, required: true },
    company: { type: String, required: true },
    location: { type: String, default: "" },
    type: { type: String, default: "Stage" },
    motivation: { type: String, required: true },
    cvFileName: { type: String, default: "" },
    cvPath: { type: String, default: "" },
    status: {
      type: String,
      enum: ["En attente", "Acceptée", "Refusée", "En cours"],
      default: "En attente",
    },
    supervisorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    supervisorName: { type: String, default: "" },
  },
  { timestamps: true }
);
// Créer un index unique pour empêcher les candidatures en double d'un même utilisateur à une même offre
applicationSchema.index({ userId: 1, offerId: 1 }, { unique: true });

export default mongoose.model("Application", applicationSchema);// Exporter le modèle de données de l'application pour être utilisé dans les routes et les contrôleurs de l'application
