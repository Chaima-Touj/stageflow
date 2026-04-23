import mongoose from "mongoose";// Importer Mongoose pour définir le schéma de données et le modèle de messages
// Définir le schéma de données pour les messages de contact
const messageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }// Ajouter des champs de date de création et de mise à jour automatiques
);
// Exporter le modèle de données de message pour être utilisé dans les routes et les contrôleurs de l'application
export default mongoose.model("Message", messageSchema);
