import React, { useState } from "react";
import { messagesAPI } from "../api";// Importer l'API de gestion des messages pour envoyer les données du formulaire de contact au backend, permettant ainsi à l'équipe de StageFlow de recevoir et de répondre aux messages des utilisateurs

// Composant Contact qui rend un formulaire de contact pour permettre aux utilisateurs d'envoyer des messages à l'équipe de StageFlow, avec des champs pour le nom, l'email et le message, ainsi que des notifications de succès ou d'erreur en fonction du résultat de l'envoi du message, et une gestion de l'état pour les données du formulaire, les notifications et le chargement

function Contact() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [notif, setNotif] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fonction pour gérer les changements dans les champs du formulaire, qui met à jour l'état formData en fonction des entrées de l'utilisateur, permettant au composant de suivre les valeurs saisies dans le formulaire de contact et de les utiliser lors de la soumission du formulaire pour envoyer le message au backend
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // Fonction pour gérer la soumission du formulaire, qui empêche le comportement par défaut de soumission, indique que le processus d'envoi est en cours en mettant à jour l'état de chargement, appelle l'API de gestion des messages pour envoyer les données du formulaire au backend, gère le résultat de l'envoi en affichant une notification de succès ou d'erreur en fonction du résultat, réinitialise les données du formulaire en cas de succès, et réinitialise l'état de chargement une fois le processus terminé
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await messagesAPI.send(formData.name, formData.email, formData.message);
      setNotif({ text: "✅ Message envoyé avec succès !", type: "success" });
      setFormData({ name: "", email: "", message: "" });
    } catch {
      setNotif({ text: "❌ Erreur lors de l'envoi.", type: "error" });
    } finally {
      setLoading(false);
      setTimeout(() => setNotif(null), 3500);
    }
  };

// Rendu du formulaire de contact, avec des champs pour le nom, l'email et le message, ainsi que des notifications de succès ou d'erreur en fonction du résultat de l'envoi du message, et une gestion de l'état pour les données du formulaire, les notifications et le chargement
  return (
    <div className="form-page">
      <div className="form-box contact-pro-box">
        {notif && <div className={`inline-notif ${notif.type}`}>{notif.text}</div>}
        <h2>Contact</h2>
        <p>Contactez l'équipe StageFlow</p>
        <form onSubmit={handleSubmit}>
          <input type="text" name="name" placeholder="Nom"
            value={formData.name} onChange={handleChange} required />
          <input type="email" name="email" placeholder="Email"
            value={formData.email} onChange={handleChange} required />
          <textarea name="message" placeholder="Votre message..." rows="6"
            value={formData.message} onChange={handleChange} required />
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Envoi..." : "Envoyer"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Contact;