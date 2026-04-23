import mongoose from "mongoose";// Importer Mongoose pour définir le schéma de données et le modèle de l'utilisateur
import bcrypt from "bcryptjs";// Importer bcryptjs pour le hachage des mots de passe
// Définir le schéma de données pour les utilisateurs de l'application
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Nom requis"], trim: true },
    email: {
      type: String,
      required: [true, "Email requis"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Email invalide"],
    },  
    password: {
      type: String,
      required: [true, "Mot de passe requis"],
      minlength: [6, "Minimum 6 caractères"],
      select: false,
    },
    role: {
      type: String,
      enum: ["étudiant", "entreprise", "encadrant", "admin"],
      default: "étudiant",
    },
    phone: { type: String, default: "" },
    university: { type: String, default: "" },
    specialty: { type: String, default: "" },
    supervisorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    supervisorName: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }// Ajouter des champs de date de création et de mise à jour automatiques
);

// ✅ Fix bcryptjs v3 — sans "next"
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});
// Ajouter une méthode pour comparer les mots de passe lors de la connexion
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};
// Ajouter une méthode pour exclure le mot de passe lors de la conversion en JSON
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};
// Exporter le modèle de données de l'utilisateur pour être utilisé dans les routes et les contrôleurs de l'application
export default mongoose.model("User", userSchema);