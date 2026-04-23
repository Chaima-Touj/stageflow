import React, { createContext, useState, useEffect, useCallback } from "react";
import { offersAPI, applicationsAPI, usersAPI } from "../api";

// eslint-disable-next-line react-refresh/only-export-components
export const DataContext = createContext();
// Composant DataProvider qui gère l'état des offres, des candidatures, des notifications et des fonctions pour interagir avec les API d'offres, de candidatures et d'utilisateurs, et fournit ces informations et fonctions à travers le contexte de données pour être utilisées dans toute l'application
export const DataProvider = ({ children }) => {
  const [offers, setOffers] = useState([]);
  const [applications, setApplications] = useState([]);
  const [notification, setNotification] = useState(null);
  const [loadingOffers, setLoadingOffers] = useState(true);

  // ─── Toast ───────────────────────────────────────────────────────────────────
  // Fonction pour afficher une notification (toast) avec un message et un type (succès ou erreur), qui met à jour l'état de la notification et réinitialise la notification après un délai pour masquer le toast, permettant d'afficher des messages de confirmation ou d'erreur à l'utilisateur de manière visuelle et temporaire
  const showNotification = useCallback((text, type = "success") => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 3500);
  }, []);

  // ─── Load offers on mount ────────────────────────────────────────────────────
  // Fonction pour charger les offres à partir de l'API, qui gère l'état de chargement, met à jour la liste des offres dans l'état, et affiche une notification en cas d'erreur lors du chargement des offres, permettant de récupérer et d'afficher les offres disponibles lorsque le composant est monté
  const loadOffers = useCallback(async (params = {}) => {
    try {
      setLoadingOffers(true);
      const data = await offersAPI.getAll(params);
      setOffers(data.offers);
    } catch {
      showNotification("❌ Erreur chargement des offres.", "danger");
    } finally {
      setLoadingOffers(false);
    }
  }, [showNotification]);

  // Effet de bord pour charger les offres lorsque le composant est monté, en appelant la fonction de chargement des offres, assurant que les offres sont récupérées et affichées dès que le composant est rendu
  useEffect(() => { loadOffers(); }, [loadOffers]);

  // ─── OFFERS ──────────────────────────────────────────────────────────────────
  // Fonctions pour ajouter, mettre à jour et supprimer des offres, qui interagissent avec l'API des offres pour effectuer les opérations correspondantes, mettent à jour la liste des offres dans l'état en fonction de l'opération effectuée, et affichent des notifications de succès ou d'erreur en fonction du résultat de l'opération, permettant aux entreprises de gérer leurs offres de stage de manière efficace à travers l'interface utilisateur
  const addOffer = async (offerData) => {
    try {
      const data = await offersAPI.create(offerData);
      setOffers((prev) => [data.offer, ...prev]);
      showNotification(`✅ Offre "${data.offer.title}" publiée !`);
      return { success: true, offer: data.offer };
    } catch (err) {
      showNotification(`❌ ${err.message}`, "danger");
      return { success: false, message: err.message };
    }
  };

  // Fonction pour mettre à jour une offre, qui appelle l'API de mise à jour des offres avec l'ID de l'offre et les nouvelles données, met à jour la liste des offres dans l'état en remplaçant l'offre mise à jour, et affiche une notification de succès ou d'erreur en fonction du résultat de l'opération, permettant aux entreprises de modifier les détails de leurs offres de stage après leur publication
  const updateOffer = async (id, updatedData) => {
    try {
      const data = await offersAPI.update(id, updatedData);
      setOffers((prev) => prev.map((o) => (o._id === id ? data.offer : o)));
      showNotification("✏️ Offre modifiée !");
      return { success: true };
    } catch (err) {
      showNotification(`❌ ${err.message}`, "danger");
      return { success: false };
    }
  };

  // Fonction pour supprimer une offre, qui appelle l'API de suppression des offres avec l'ID de l'offre à supprimer, met à jour la liste des offres dans l'état en filtrant l'offre supprimée, et affiche une notification de succès ou d'erreur en fonction du résultat de l'opération, permettant aux entreprises de retirer leurs offres de stage lorsqu'elles ne sont plus disponibles ou pertinentes
  const deleteOffer = async (id) => {
    try {
      await offersAPI.delete(id);
      setOffers((prev) => prev.filter((o) => o._id !== id));
      showNotification("🗑️ Offre supprimée !", "danger");
    } catch (err) {
      showNotification(`❌ ${err.message}`, "danger");
    }
  };

  // ─── APPLICATIONS ─────────────────────────────────────────────────────────────
  // Fonctions pour charger les candidatures de l'utilisateur, de toutes les candidatures (pour les administrateurs) et des candidatures de l'entreprise (pour les entreprises), qui appellent les API correspondantes pour récupérer les candidatures, mettent à jour la liste des candidatures dans l'état, et affichent une notification en cas d'erreur lors du chargement, permettant aux utilisateurs de voir leurs candidatures, aux entreprises de voir les candidatures reçues pour leurs offres, et aux administrateurs de voir toutes les candidatures pour la gestion globale
  const loadMyApplications = async () => {
    try {
      const data = await applicationsAPI.getMy();
      setApplications(data.applications);
    } catch {
      showNotification("❌ Erreur chargement candidatures.", "danger");
    }
  };

  // Fonction pour charger toutes les candidatures, qui est accessible uniquement aux administrateurs, et qui appelle l'API pour récupérer toutes les candidatures, met à jour la liste des candidatures dans l'état, et affiche une notification en cas d'erreur lors du chargement, permettant aux administrateurs de voir et de gérer toutes les candidatures soumises sur la plateforme
  const loadAllApplications = async () => {
    try {
      const data = await applicationsAPI.getAll();
      setApplications(data.applications);
    } catch {
      showNotification("❌ Erreur serveur.", "danger");
    }
  };

  // Fonction pour charger les candidatures de l'entreprise, qui est accessible uniquement aux entreprises, et qui appelle l'API pour récupérer les candidatures associées à l'entreprise connectée, met à jour la liste des candidatures dans l'état, et affiche une notification en cas d'erreur lors du chargement, permettant aux entreprises de voir les candidatures reçues pour leurs offres de stage
  const loadCompanyApplications = async () => {
    try {
      const data = await applicationsAPI.getCompany();
      setApplications(data.applications);
    } catch {
      showNotification("❌ Erreur serveur.", "danger");
    }
  };

  // Fonction pour ajouter une candidature à une offre, qui appelle l'API de création de candidatures avec l'ID de l'offre, la motivation et le fichier CV, ajoute la nouvelle candidature à la liste des candidatures dans l'état, et affiche une notification de succès ou d'erreur en fonction du résultat de l'opération, permettant aux utilisateurs de postuler facilement aux offres de stage en soumettant leurs candidatures à travers l'interface utilisateur
  const addApplication = async (offerId, motivation, cvFile) => {
    try {
      const data = await applicationsAPI.apply(offerId, motivation, cvFile);
      setApplications((prev) => [data.application, ...prev]);
      showNotification("🎉 Candidature envoyée !");
      return { success: true };
    } catch (err) {
      showNotification(`❌ ${err.message}`, "danger");
      return { success: false, message: err.message };
    }
  };

  // Fonction pour mettre à jour le statut d'une candidature, qui appelle l'API de mise à jour des candidatures avec l'ID de la candidature et le nouveau statut, met à jour la liste des candidatures dans l'état en remplaçant la candidature mise à jour, et affiche une notification de succès ou d'erreur en fonction du résultat de l'opération, permettant aux entreprises et aux administrateurs de gérer le processus de recrutement en mettant à jour le statut des candidatures (par exemple, accepté, rejeté, en attente)
  const updateApplicationStatus = async (id, status) => {
    try {
      await applicationsAPI.updateStatus(id, status);
      setApplications((prev) =>
        prev.map((a) => (a._id === id ? { ...a, status } : a))
      );
      showNotification(`📌 Statut mis à jour : ${status}`);
    } catch (err) {
      showNotification(`❌ ${err.message}`, "danger");
    }
  };

  // Fonction pour supprimer une candidature, qui appelle l'API de suppression des candidatures avec l'ID de la candidature à supprimer, met à jour la liste des candidatures dans l'état en filtrant la candidature supprimée, et affiche une notification de succès ou d'erreur en fonction du résultat de l'opération, permettant aux utilisateurs de retirer leurs candidatures soumises, ou aux entreprises et administrateurs de supprimer des candidatures indésirables
  const deleteApplication = async (id) => {
    try {
      await applicationsAPI.delete(id);
      setApplications((prev) => prev.filter((a) => a._id !== id));
      showNotification("🗑️ Candidature supprimée !", "danger");
    } catch (err) {
      showNotification(`❌ ${err.message}`, "danger");
    }
  };

  // ─── USERS (admin) ────────────────────────────────────────────────────────────
  // Fonction pour supprimer un utilisateur, qui est accessible uniquement aux administrateurs, et qui appelle l'API de suppression des utilisateurs avec l'ID de l'utilisateur à supprimer, met à jour la liste des utilisateurs dans l'état en filtrant l'utilisateur supprimé, et affiche une notification de succès ou d'erreur en fonction du résultat de l'opération, permettant aux administrateurs de gérer les comptes utilisateurs en supprimant les comptes indésirables ou inactifs
  const deleteUser = async (userId) => {
    try {
      await usersAPI.delete(userId);
      showNotification("👤 Utilisateur supprimé !", "danger");
      return { success: true };
    } catch (err) {
      showNotification(`❌ ${err.message}`, "danger");
      return { success: false };
    }
  };

  // Fonction pour affecter un encadrant à un étudiant, qui est accessible uniquement aux administrateurs, et qui appelle l'API d'affectation des encadrants avec l'ID de l'étudiant et l'ID de l'encadrant, met à jour les informations de l'étudiant dans l'état en remplaçant les données de l'étudiant affecté, et affiche une notification de succès ou d'erreur en fonction du résultat de l'opération, permettant aux administrateurs de gérer les relations entre étudiants et encadrants pour le suivi des stages
  const assignSupervisor = async (studentId, supervisorId) => {
    try {
      const data = await usersAPI.assignSupervisor(studentId, supervisorId);
      showNotification("🎓 Encadrant affecté !");
      return { success: true, student: data.student };
    } catch (err) {
      showNotification(`❌ ${err.message}`, "danger");
      return { success: false };
    }
  };

  // Rendu du fournisseur de contexte de données, en fournissant les offres, les candidatures, les notifications, l'état de chargement des offres, et les fonctions pour interagir avec les API d'offres, de candidatures et d'utilisateurs à travers le contexte pour être utilisées dans toute l'application, tout en affichant les enfants du composant pour permettre à ces données et fonctions d'être accessibles dans toute l'interface utilisateur
  return (
    // Rendu du fournisseur de contexte de données, en fournissant les offres, les candidatures, les notifications, l'état de chargement des offres, et les fonctions pour interagir avec les API d'offres, de candidatures et d'utilisateurs à travers le contexte pour être utilisées dans toute l'application, tout en affichant les enfants du composant pour permettre à ces données et fonctions d'être accessibles dans toute l'interface utilisateur
    <DataContext.Provider value={{ 
      offers, applications, notification, loadingOffers,
      addOffer, updateOffer, deleteOffer, loadOffers,
      addApplication, updateApplicationStatus, deleteApplication,
      loadMyApplications, loadAllApplications, loadCompanyApplications,
      deleteUser, assignSupervisor, showNotification,
    }}>
      {children}
    </DataContext.Provider>
  );
};
