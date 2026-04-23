import mongoose from "mongoose";// Importer Mongoose pour définir le schéma de données et le modèle de l'offre de stage et PFE

// Définir le schéma de données pour les offres de stage et PFE
const offerSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, "Titre requis"], trim: true },
    company: { type: String, required: [true, "Entreprise requise"], trim: true },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    location: { type: String, required: [true, "Localisation requise"] },
    type: { type: String, enum: ["Stage", "PFE"], required: true },
    duration: { type: String, required: [true, "Durée requise"] },
    desc: { type: String, required: [true, "Description requise"] },
    requirements: { type: String, required: [true, "Compétences requises"] },
    isActive: { type: Boolean, default: true },
    applicationsCount: { type: Number, default: 0 },
  },
  { timestamps: true }// Ajouter des champs de date de création et de mise à jour automatiques
);
// Créer un index de texte pour les champs title, company et location pour permettre la recherche textuelle
offerSchema.index({ title: "text", company: "text", location: "text" });
// Exporter le modèle de données de l'offre pour être utilisé dans les routes et les contrôleurs de l'application
export default mongoose.model("Offer", offerSchema);
