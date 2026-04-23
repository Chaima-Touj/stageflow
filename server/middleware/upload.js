import multer from "multer";// Bibliothèque pour gérer les fichiers téléchargés dans les requêtes HTTP
import path from "path";// Module pour manipuler les chemins de fichiers
import fs from "fs";// Module pour interagir avec le système de fichiers

// Configurer Multer pour stocker les fichiers téléchargés dans le dossier "uploads" avec des noms uniques
const uploadsDir = "./uploads";// Dossier où les fichiers téléchargés seront stockés
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });// Créer le dossier "uploads" s'il n'existe pas déjà

// Configurer le stockage des fichiers avec Multer
const storage = multer.diskStorage({// Définir la destination et le nom des fichiers téléchargés
  destination: (req, file, cb) => cb(null, uploadsDir),// Spécifier le dossier de destination pour les fichiers téléchargés
  filename: (req, file, cb) => {// Générer un nom de fichier unique en utilisant la date actuelle et un nombre aléatoire
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;// Générer un nom de fichier unique en utilisant la date actuelle et un nombre aléatoire
    cb(null, `cv-${unique}${path.extname(file.originalname)}`);// Conserver l'extension du fichier original et ajouter un préfixe "cv-" pour les fichiers téléchargés
  },
});

// Filtrer les fichiers pour n'accepter que les formats autorisés (PDF, DOC, DOCX, TXT)
const fileFilter = (req, file, cb) => {// Définir les extensions de fichiers autorisées
  const allowed = [".pdf", ".doc", ".docx", ".txt"];// Extraire l'extension du fichier téléchargé et la convertir en minuscules
  const ext = path.extname(file.originalname).toLowerCase();// Vérifier si l'extension du fichier est dans la liste des extensions autorisées
  if (allowed.includes(ext)) {// Si l'extension est autorisée, accepter le fichier
    cb(null, true);// Accepter le fichier
  } else {
    cb(new Error("Format non autorisé. Utilisez PDF, DOC, DOCX ou TXT."), false);// Rejeter le fichier avec une erreur si l'extension n'est pas autorisée
  }
};

// Configurer Multer avec le stockage, le filtrage et la limite de taille de fichier 
export const upload = multer({// Configurer Multer avec le stockage, le filtrage et la limite de taille de fichier
  storage,// Utiliser la configuration de stockage définie précédemment
  fileFilter,// Utiliser la fonction de filtrage des fichiers définie précédemment
  limits: { fileSize: 5 * 1024 * 1024 },// Limiter la taille des fichiers à 5MB
});// Exporter le middleware Multer configuré pour être utilisé dans les routes où les fichiers sont téléchargés
