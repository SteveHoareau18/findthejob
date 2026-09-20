/**
 * Service d'analyse et d'adaptation des critères de CV propulsé par Groq AI
 * Extrait et normalise les critères clés : formations, expérience, soft skills, logiciels, âge, lieux, véhiculé
 */

const { getGroqClient, getModelName } = require('./groqService');

/**
 * Valide et normalise la structure retournée par Groq
 */
function validateAndNormalizeCvCriteria(raw) {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Format de réponse invalide de Groq (attendu: objet JSON).');
  }

  // 1. Formations (Tableau de chaînes)
  let formations = [];
  if (Array.isArray(raw.formations)) {
    formations = raw.formations
      .map(f => (typeof f === 'string' ? f.trim() : String(f || '').trim()))
      .filter(Boolean);
  } else if (typeof raw.formations === 'string' && raw.formations.trim()) {
    formations = raw.formations.split(/[\n\r]+/).map(s => s.trim()).filter(Boolean);
  }

  // 2. Expérience (Tableau de chaînes ou chaîne multilignes)
  let experience = [];
  if (Array.isArray(raw.experience)) {
    experience = raw.experience
      .map(e => (typeof e === 'string' ? e.trim() : String(e || '').trim()))
      .filter(Boolean);
  } else if (typeof raw.experience === 'string' && raw.experience.trim()) {
    experience = raw.experience.split(/[\n\r]+/).map(s => s.trim()).filter(Boolean);
  }

  // 3. Soft Skills (Tableau de chaînes nettoyées et dédoublonnées)
  let softSkills = [];
  if (Array.isArray(raw.softSkills)) {
    softSkills = raw.softSkills
      .map(s => (typeof s === 'string' ? s.trim() : String(s || '').trim()))
      .filter(Boolean);
  } else if (typeof raw.softSkills === 'string' && raw.softSkills.trim()) {
    softSkills = raw.softSkills.split(/[,;\n\r]+/).map(s => s.trim()).filter(Boolean);
  }
  // Déduplication insensible à la casse
  const seenSoft = new Set();
  softSkills = softSkills.filter(item => {
    const lower = item.toLowerCase();
    if (seenSoft.has(lower)) return false;
    seenSoft.add(lower);
    return true;
  });

  // 4. Logiciels & Compétences techniques (Tableau de chaînes atomiques)
  let logiciels = [];
  if (Array.isArray(raw.logiciels)) {
    logiciels = raw.logiciels
      .map(l => (typeof l === 'string' ? l.trim() : String(l || '').trim()))
      .filter(Boolean);
  } else if (typeof raw.logiciels === 'string' && raw.logiciels.trim()) {
    logiciels = raw.logiciels.split(/[,;\n\r]+/).map(s => s.trim()).filter(Boolean);
  }
  // Déduplication insensible à la casse
  const seenLog = new Set();
  logiciels = logiciels.filter(item => {
    const lower = item.toLowerCase();
    if (seenLog.has(lower)) return false;
    seenLog.add(lower);
    return true;
  });

  // 5. Âge
  let age = 'Non précisé';
  if (raw.age && typeof raw.age === 'string' && raw.age.trim() && !/non\s*pr[ée]cis[ée]|inconnu/i.test(raw.age)) {
    age = raw.age.trim();
  } else if (typeof raw.age === 'number') {
    age = `${raw.age} ans`;
  }

  // 6. Lieux / Mobilité
  let lieux = '';
  if (raw.lieux && typeof raw.lieux === 'string' && !/non\s*pr[ée]cis[ée]|inconnu/i.test(raw.lieux)) {
    lieux = raw.lieux.trim();
  }

  // 7. Véhiculé ou pas (booléen)
  let vehicule = false;
  if (typeof raw.vehicule === 'boolean') {
    vehicule = raw.vehicule;
  } else if (typeof raw.vehicule === 'string') {
    vehicule = /oui|yes|true|permis\s*b|v[ée]hicul[ée]|voiture/i.test(raw.vehicule);
  }

  // 8. Points positifs du CV (Analyse RH & atouts marquants)
  let pointsPositifs = [];
  const rawPositive = raw.pointsPositifs || raw.strengths || [];
  if (Array.isArray(rawPositive)) {
    pointsPositifs = rawPositive
      .map(p => (typeof p === 'string' ? p.trim() : String(p || '').trim()))
      .filter(Boolean);
  } else if (typeof rawPositive === 'string' && rawPositive.trim()) {
    pointsPositifs = rawPositive.split(/[\n\r]+/).map(s => s.trim()).filter(Boolean);
  }
  if (pointsPositifs.length === 0) {
    pointsPositifs = [
      'Expérience professionnelle claire et cohérente avec les technologies mentionnées.',
      'Compétences techniques et méthodologiques directement valorisables auprès des recruteurs.'
    ];
  }

  // 9. Points à améliorer (Conseils constructifs & axes d'optimisation)
  let pointsAmeliorer = [];
  const rawImprovement = raw.pointsAmeliorer || raw.improvements || [];
  if (Array.isArray(rawImprovement)) {
    pointsAmeliorer = rawImprovement
      .map(p => (typeof p === 'string' ? p.trim() : String(p || '').trim()))
      .filter(Boolean);
  } else if (typeof rawImprovement === 'string' && rawImprovement.trim()) {
    pointsAmeliorer = rawImprovement.split(/[\n\r]+/).map(s => s.trim()).filter(Boolean);
  }
  if (pointsAmeliorer.length === 0) {
    pointsAmeliorer = [
      'Pensez à quantifier vos réalisations (chiffres d’impact, métriques de performance, volumétrie de projets).',
      'Ajoutez des liens vers vos projets en ligne (GitHub, portfolio, démos interactives) pour crédibiliser vos acquis.'
    ];
  }

  return {
    formations,
    experience,
    softSkills,
    logiciels,
    age,
    lieux,
    vehicule,
    pointsPositifs,
    pointsAmeliorer
  };
}

/**
 * Analyse le CV avec Groq AI et extrait les critères normalisés
 * @param {string} cvText Contenu brut extrait du document (PDF, DOCX, TXT)
 */
async function adaptCvCriteriaWithGroq(cvText) {
  if (!cvText || typeof cvText !== 'string' || cvText.trim().length === 0) {
    throw new Error('Le texte du CV est vide ou indisponible.');
  }

  const client = getGroqClient();
  const model = getModelName();

  if (!client) {
    throw new Error('Clé API Groq absente ou non configurée dans le fichier .env.');
  }

  const systemPrompt = `Tu es un expert RH, recruteur technique de haut niveau et coach en employabilité.
Ta mission est d'analyser le texte brut d'un CV (Curriculum Vitae) afin de :
1. Extraire de manière fidèle, structurée et exhaustive les critères clés du profil candidat.
2. Formuler un retour d'analyse constructif et professionnel détaillant les "Points positifs" et les "Points à améliorer" du CV.

Tu dois IMPÉRATIVEMENT répondre uniquement avec un objet JSON valide conforme à ce schéma :
{
  "formations": [
    "Intitulé précis de diplôme, école/université, localisation, année (ex: 'BAC+5 Expert logiciel, Ynov Montpellier, 2026')"
  ],
  "experience": [
    "Poste, entreprise, période, missions clés et responsabilités (ex: 'Développeur Fullstack, Entreprise X, 2 ans, missions...')"
  ],
  "softSkills": [
    "Compétence comportementale ou humaine attestée dans le parcours (ex: 'Autonomie', 'Rigueur', 'Force de proposition', 'Travail d'équipe')"
  ],
  "logiciels": [
    "Chaque langage, framework, librairie, logiciel, système, base de données ou outil technique maîtrisé de manière atomique (ex: 'JavaScript', 'React', 'Node.js', 'Docker', 'PostgreSQL', 'Figma')"
  ],
  "age": "Âge précis mentionné (ex: '28 ans') ou 'Non précisé'",
  "lieux": "Ville(s), département, code postal ou région de résidence ou mobilité du candidat (ex: 'Montpellier (34)') ou 'Non précisé'",
  "vehicule": true ou false (true uniquement si le permis B, être véhiculé ou posséder un véhicule personnel est mentionné, sinon false),
  "pointsPositifs": [
    "Atout majeur 1 concret et valorisant déduit de l'analyse du CV (ex: 'Excellente progression avec des missions concrètes en alternance et montée en compétences sur Docker')",
    "Atout majeur 2 (ex: 'Stack technologique moderne et diversifiée couvrant à la fois le développement web et la gestion de données')",
    "Atout majeur 3 (ex: 'Parcours académique cohérent avec une spécialisation progressive vers un niveau BAC+5')"
  ],
  "pointsAmeliorer": [
    "Axe d'amélioration 1 concret et actionnable (ex: 'Quantifier davantage les résultats obtenus : métriques de trafic, gains de temps, volumes de données traités')",
    "Axe d'amélioration 2 (ex: 'Mentionner expressément les liens vers un portfolio en ligne, GitHub ou des projets publics')",
    "Axe d'amélioration 3 (ex: 'Uniformiser la présentation des expériences en débutant chaque puce par un verbe d'action à l'infinitif')"
  ]
}

Directives de précision :
1. "logiciels" : Liste tous les outils informatiques, progiciels et technologies de programmation mentionnés. Découpe les suites (ex: au lieu de 'Suite Adobe', renvoie 'Photoshop', 'Premiere Pro', etc.).
2. "softSkills" : Normalise avec des termes professionnels pertinents.
3. "formations" : Conserve toutes les formations mentionnées (du Bac aux diplômes supérieurs et certifications).
4. "experience" : Synthétise chaque expérience avec le rôle exact, l'entreprise et la période.
5. "vehicule" : Détecte 'permis B', 'véhiculé', 'titulaire du permis de conduire'. Si rien n'est écrit, mets false.
6. "age" : Ne devine pas l'âge s'il n'est pas expressément mentionné.
7. "pointsPositifs" : Donne entre 3 et 5 atouts forts, spécifiques et bien rédigés.
8. "pointsAmeliorer" : Donne entre 3 et 5 axes d'amélioration précis, bienveillants et directement applicables pour augmenter l'impact du CV auprès des recruteurs.
9. Ne renvoie AUCUN texte en dehors du JSON pur.`;

  try {
    // Troncature de sécurité si le texte du CV est gigantesque (> 30 000 caractères)
    const sanitizedText = cvText.length > 30000 ? cvText.slice(0, 30000) : cvText;

    const completion = await client.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Voici le texte brut du CV à analyser :\n\n${sanitizedText}` }
      ],
      temperature: 0.2,
      response_format: { type: 'json_object' }
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Réponse vide reçue de l\'API Groq.');
    }

    let parsedJson;
    try {
      parsedJson = JSON.parse(content);
    } catch (jsonErr) {
      // Nettoyage éventuel des balises markdown
      const cleaned = content.replace(/```json\s*/gi, '').replace(/```\s*$/gi, '').trim();
      parsedJson = JSON.parse(cleaned);
    }

    const validatedCriteria = validateAndNormalizeCvCriteria(parsedJson);

    return {
      success: true,
      source: 'groq',
      model,
      criteria: validatedCriteria,
      feedback: {
        pointsPositifs: validatedCriteria.pointsPositifs,
        pointsAmeliorer: validatedCriteria.pointsAmeliorer
      }
    };
  } catch (err) {
    console.error('[cvGroqService] Erreur appel Groq pour CV:', err);
    throw new Error(`Échec de l'adaptation des critères par Groq : ${err.message}`);
  }
}

module.exports = {
  adaptCvCriteriaWithGroq,
  validateAndNormalizeCvCriteria
};
