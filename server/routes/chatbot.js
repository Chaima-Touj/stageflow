// server/routes/chatbot.js - Version avec date FIXE et 100% fonctionnelle
import express from "express";
import mongoose from "mongoose";
import process from "process";

const router = express.Router();

// ============ MODÈLES MONGODB ============
const offerSchema = new mongoose.Schema({
  title: String, company: String, location: String, type: String,
  duration: String, desc: String, requirements: String, isActive: Boolean,
  applicationsCount: { type: Number, default: 0 }
});

const userSchema = new mongoose.Schema({
  name: String, email: String, role: String, phone: String,
  university: String, specialty: String, isActive: Boolean
});

const applicationSchema = new mongoose.Schema({
  userName: String, userEmail: String, offerTitle: String,
  company: String, status: String, supervisorName: String,
  motivation: String
});

const Offer = mongoose.models.Offer || mongoose.model("Offer", offerSchema);
const User = mongoose.models.User || mongoose.model("User", userSchema);
const Application = mongoose.models.Application || mongoose.model("Application", applicationSchema);

// ============ FONCTIONS DATE CORRECTES ============
function getFullDate() {
  const today = new Date();
  const jours = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const mois = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
  
  const jourSemaine = jours[today.getDay()];
  const jour = today.getDate();
  const moisNom = mois[today.getMonth()];
  const annee = today.getFullYear();
  
  return `${jourSemaine} ${jour} ${moisNom} ${annee}`;
}

function getCurrentTime() {
  return new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

// ============ RECHERCHE DANS MONGODB ============
async function searchInDB(query, userEmail = null) {
  const lowerQuery = query.toLowerCase();
  const results = { offers: [], users: [], applications: [] };
  if (lowerQuery.includes('stage') || lowerQuery.includes('offre') || lowerQuery.includes('poste')) {
    let searchTerms = lowerQuery.replace(/stage|offre|trouver|cherche|poste|emploi/g, '').trim();
    let mongoQuery = { isActive: true };
    
    if (searchTerms && searchTerms.length > 2 && searchTerms !== 'tous' && searchTerms !== 'toutes') {
      const keywords = searchTerms.split(' ').filter(k => k.length > 2);
      if (keywords.length > 0) {
        mongoQuery.$or = [
          { title: { $regex: keywords.join('|'), $options: 'i' } },
          { company: { $regex: keywords.join('|'), $options: 'i' } },
          { location: { $regex: keywords.join('|'), $options: 'i' } },
          { requirements: { $regex: keywords.join('|'), $options: 'i' } }
        ];
      }
    }
    results.offers = await Offer.find(mongoQuery).limit(8);
  }

  if (userEmail && (lowerQuery.includes('candidature') || lowerQuery.includes('postulation'))) {
    results.applications = await Application.find({ userEmail: userEmail }).limit(5);
  }

  return results;
}

// ============ ROUTE PRINCIPALE ============
router.post("/", async (req, res) => {
  try {
    const { message, user = null } = req.body;
    const lowerMsg = message.toLowerCase();
    
    console.log(`📩 Message: "${message}"`);

    // ============ 1. COMMANDES DATE ET HEURE (directes, sans API) ============
    
    if (lowerMsg.includes('date') || lowerMsg.includes('aujourd\'hui') || lowerMsg === 'c quoi aujourd\'hui') {
      const fullDate = getFullDate();
      const time = getCurrentTime();
      return res.json({ 
        reply: `📅 Aujourd'hui nous sommes le ${fullDate}\n⏰ Il est ${time}\n\n🔍 Vous cherchez un stage ? Dites-moi votre domaine !` 
      });
    }
    
    if (lowerMsg.includes('heure') || lowerMsg === 'quelle heure' || lowerMsg.includes('il est quelle heure')) {
      const time = getCurrentTime();
      const fullDate = getFullDate();
      return res.json({ 
        reply: `⏰ Il est ${time}\n📅 Nous sommes le ${fullDate}\n\n💡 Besoin d'aide pour trouver un stage ?` 
      });
    }

    // ============ 2. SALUTATIONS ============
    if (lowerMsg === 'salut' || lowerMsg === 'bonjour' || lowerMsg === 'coucou' || lowerMsg === 'hello') {
      const hour = new Date().getHours();
      let greeting = "Bonjour";
      if (hour >= 18) greeting = "Bonsoir";
      else if (hour >= 12) greeting = "Bon après-midi";
      
      return res.json({ 
        reply: `${greeting} ! 👋\n\nJe suis StageFlow AI, votre assistant pour les stages en Tunisie.\n\n📅 Aujourd'hui :${getFullDate()}\n\n🔍 Que recherchez-vous ?\n• Un stage en informatique ?\n• Un PFE en data science ?\n• Des conseils pour postuler ?\n\nDites-moi tout ! 🌟` 
      });
    }
// ============ 3. QUI SUIS-JE ============
if (/(qui\s*(es|est)\s*tu|t.?es qui|ton nom|présente)/i.test(message)) {

  // 👇 réponse de base
  const baseReply = `Je suis StageFlow AI, votre assistant pour les stages en Tunisie.`;

  // 👇 إذا فما API → خليه يحسن الرد
  if (process.env.GEMINI_API_KEY) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

      const prompt = `
Tu es StageFlow AI.

Présente-toi brièvement à un utilisateur.

Règles :
- Français uniquement
- Maximum 80 mots
- Ton amical et professionnel
- Parle de tes capacités (stages, CV, candidatures)

Réponse :
`;

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7 }
        })
      });

      const data = await response.json();

      if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
        return res.json({ reply: data.candidates[0].content.parts[0].text });
      }

    } catch (err) {
      console.log("Gemini error:", err.message);
    }
  }

  // 👇 fallback (إذا API ما خدمش)
  return res.json({ 
    reply: `🤖 ${baseReply}

💼 Je peux vous aider à :
• Trouver des stages
• Postuler facilement
• Améliorer votre CV

Que puis-je faire pour vous ?`
  });
}
    // ============ 4. COMMENT ÇA VA ============
    if (lowerMsg.includes('ça va') || lowerMsg.includes('comment vas-tu')) {
      return res.json({ 
        reply: `🤗 Je vais très bien, merci !\n\nJe suis là et prêt à vous aider à trouver le stage de vos rêves !\n\nParlez-moi de votre recherche :\n• Quel domaine ? (informatique, marketing, finance...)\n• Quelle ville ? (Tunis, Sfax, Sousse...)\n\nÀ vous ! 🎯` 
      });
    }

    // ============ 5. BLAGUES ============
    if (lowerMsg.includes('blague') || lowerMsg.includes('humour')) {
      const jokes = [
        "Pourquoi les développeurs préfèrent-ils le mode nuit ? Parce que la lumière les dérange quand ils cherchent leurs bugs ! 😄",
        "Que dit un développeur à son café ? 'Tu es mon unique dépendance !' ☕",
        "Pourquoi un stagiaire en informatique a-t-il planté une batterie ? Parce qu'il voulait faire du Java ! ⚡",
        "Quel est le sport préféré des data scientists ? Le surf, pour mieux rider les vagues de données ! 🏄"
      ];
      const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
      return res.json({ reply: `😂 **Voici une blague pour vous :**\n\n${randomJoke}\n\n🔍 Recherchez-vous un stage ?` });
    }

    // ============ 6. AIDE ============
    if (lowerMsg === 'aide' || lowerMsg === 'help' || lowerMsg === 'que peux-tu faire') {
      return res.json({ reply: `🤖 STAGEFLOW AI - GUIDE COMPLET\n\n` +
        `📌 RECHERCHE DE STAGES\n` +
        `• "Stages informatique Tunis"\n` +
        `• "Offres PFE Sfax"\n` +
        `• "Stage React.js" ou "Data Science"\n\n` +
        `📝 GESTION CANDIDATURES\n` +
        `• "Mes candidatures" - Voir vos postulations\n` +
        `• "Comment postuler ?" - Guide étape par étape\n\n` +
        `💡 CONSEILS\n` +
        `• "Conseils CV" - Astuces professionnelles\n` +
        `• "Lettre de motivation" - Template\n\n` +
        `📊 INFORMATIONS\n` +
        `• "Statistiques" - Chiffres clés\n` +
        `• "Date" ou "Heure" - Info générale\n\n` +
        `💬 Que souhaitez-vous faire ?` });
    }

    // ============ 7. GUIDE CANDIDATURE ============
    if (lowerMsg.includes('postuler') && !lowerMsg.includes('comment')) {
      return res.json({ reply: `📝 COMMENT POSTULER SUR STAGEFLOW ?\n\n` +
        `Étape 1 : Trouvez une offre\n` +
        `• Utilisez "Stages [domaine]" ou "Offres [ville]"\n\n` +
        `Étape 2 : Préparez vos documents\n` +
        `• CV à jour (PDF)\n` +
        `• Lettre de motivation\n\n` +
        `Étape 3 : Soumettez votre candidature\n` +
        `• Cliquez sur "Postuler" sur l'offre\n` +
        `• Remplissez le formulaire\n\n` +
        `Étape 4 : Suivez votre candidature\n` +
        `• Rendez-vous dans "Mes candidatures"\n` +
        `• Réponse sous 3-7 jours\n\n` });
    }

    // ============ 8. CONSEILS CV ============
    if (lowerMsg.includes('cv') || lowerMsg.includes('lettre de motivation')) {
      return res.json({ reply: `📄 **CONSEILS CV & LETTRE DE MOTIVATION**\n\n` +
        `📋 CV IDÉAL (1 page max)\n` +
        `• En-tête : Nom, email, téléphone, LinkedIn\n` +
        `• Profil : 2-3 lignes sur vos objectifs\n` +
        `• Formation : Diplômes et établissements\n` +
        `• Compétences : Techniques et soft skills\n` +
        `• Expériences : Stages et projets\n\n` +
        `💌 LETTRE DE MOTIVATION\n` +
        `• Introduction : Présentation et offre visée\n` +
        `• Corps : Pourquoi vous ? Vos compétences\n` +
        `• Conclusion : Disponibilité et motivation\n\n` +
        `📧 Envoyez votre CV à support@stageflow.com !` });
    }

    // ============ 9. STATISTIQUES ============
    if (lowerMsg.includes('statistique') || lowerMsg.includes('combien') || lowerMsg.includes('total')) {
      const totalOffers = await Offer.countDocuments({ isActive: true });
      const totalUsers = await User.countDocuments({ isActive: true });
      const totalApps = await Application.countDocuments();
      
      return res.json({ reply: `📊 **STATISTIQUES STAGEFLOW**\n\n` +
        `🎯 **${totalOffers}** offres de stage actives\n` +
        `👥 **${totalUsers}** utilisateurs inscrits\n` +
        `📝 **${totalApps}** candidatures soumises\n\n` +
        `💡 Les domaines les plus demandés :\n` +
        `• 💻 Développement Web\n` +
        `• 🤖 Data Science\n` +
        `• ☁️ DevOps & Cloud\n` +
        `• 🔒 Cybersécurité\n\n` +
        `🔍 Que voulez-vous chercher ?` });
    }

    // ============ 10. RECHERCHE D'OFFRES MONGODB ============
    const stageKeywords = ['stage', 'offre', 'cherche', 'trouver', 'poste', 'emploi', 'développeur', 'data', 'designer', 'react', 'python', 'java', 'angular', 'flutter', 'aws', 'cybersécurité', 'pfe'];
    
    const isStageSearch = stageKeywords.some(keyword => lowerMsg.includes(keyword));
    
    if (isStageSearch) {
      const results = await searchInDB(message, user?.email);
      
      if (results.offers.length > 0) {
        let reply = `🔍 **${results.offers.length} offre(s) trouvée(s)**\n\n`;
        results.offers.forEach((offer, i) => {
          reply += `${i+1}. **${offer.title}**\n`;
          reply += `   🏢 ${offer.company} • 📍 ${offer.location}\n`;
          reply += `   📋 ${offer.type} • ⏱️ ${offer.duration}\n`;
          reply += `   📊 ${offer.applicationsCount} candidature(s)\n\n`;
        });
        reply += `💡 **Pour postuler :** Envoyez "postuler ${results.offers[0].title.substring(0, 30)}"\n`;
        return res.json({ reply });
      } else {
        return res.json({ 
          reply: `🔍 **Aucune offre trouvée**\n\n💡 **Suggestions :**\n• "Stages informatique"\n• "Offres PFE Sfax"\n• "Stage React.js"\n\n🔍 Essayez avec d'autres mots-clés !` 
        });
      }
    }

    // ============ 11. QUESTIONS GÉNÉRALES AVEC GEMINI ============
    console.log("🤖 Appel à Gemini API...");
    
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (apiKey) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
        
        const prompt = `
Tu es StageFlow AI, un assistant intelligent intégré dans une plateforme de gestion de stages.

🎯 Mission :
Aider l'utilisateur avec des réponses claires, utiles et professionnelles.

📌 Contexte :
- Plateforme pour trouver des stages en Tunisie
- Utilisateurs : étudiants, jeunes diplômés
- Domaines : IT, data, marketing, business

🧠 Comportement :
- Comprends l'intention de la question
- Donne une réponse directe et pertinente
- Si possible, propose des conseils concrets ou étapes
- Si la question concerne carrière/stage → donne des conseils pratiques
- Si la question est générale → réponds clairement sans complexité

⚡ Règles strictes :
- Réponds uniquement en français
- Maximum 100 mots
- Sois naturel (comme un humain, pas robot)
- Évite les réponses vagues
- Ne répète pas la question
- Si tu ne sais pas → dis-le simplement
- Si la question est floue → pose une courte question

🎨 Style :
Amical + professionnel + clair

💬 Question utilisateur :
"${message}"
`;
        
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { maxOutputTokens: 300, temperature: 0.8 }
          })
        });
        
        const data = await response.json();
        
        if (!data.error && data.candidates?.[0]?.content?.parts?.[0]?.text) {
          let botReply = data.candidates[0].content.parts[0].text;
          return res.json({ reply: botReply });
        }
      } catch (err) {
        console.log("Gemini error:", err.message);
      }
    }
    
    // ============ 12. FALLBACK ============
    res.json({ 
      reply: `🤖 **StageFlow AI**\n\n🔍 **Que voulez-vous faire ?**\n\n• Trouver un stage : "Stages informatique"\n• Conseils : "Comment postuler ?"\n• Aide : "Que peux-tu faire ?"\n\n💬 Posez-moi n'importe quelle question !` 
    });
    
  } catch (err) {
    console.error("❌ Erreur:", err.message);
    res.json({ 
      reply: `Désolé, une erreur technique s'est produite. 🙏\n\n📅 ${getFullDate()}\n\nVeuillez réessayer.` 
    });
  }
});

router.get("/", (req, res) => {
  res.json({ status: "OK", message: "StageFlow AI v8.0" });
});

export default router;