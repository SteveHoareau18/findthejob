/**
 * Service d'analyse et d'adaptation des critères de CV propulsé par Groq AI
 * Extrait et normalise les critères clés : formations, expérience, soft skills, logiciels, âge, lieux, véhiculé
 */

const { getGroqClient, getModelName } = require('./groqService');
const { isGroqRateLimitError, parseGroqWaitTime, createGroqRateLimitPayload } = require('./utils/groqErrorHandler');

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
    if (isGroqRateLimitError(err)) {
      const waitInfo = parseGroqWaitTime(err);
      const customErr = new Error(`Il n'y a plus assez de tokens Groq disponibles pour le moment. Veuillez retenter dans ${waitInfo.formatted}.`);
      customErr.isGroqRateLimit = true;
      customErr.status = 429;
      customErr.retryAfterSeconds = waitInfo.totalSeconds;
      customErr.retryAfterFormatted = waitInfo.formatted;
      throw customErr;
    }
    throw new Error(`Échec de l'adaptation des critères par Groq : ${err.message}`);
  }
}

/**
 * Évalue sémantiquement l'adéquation entre une liste d'offres et un profil CV via Groq AI
 * Calcul 100% générique, valorisant les alternances, formations et compétences réelles
 * @param {Array} jobs Liste d'offres d'emploi
 * @param {Object} cvCriteria Critères du candidat (formations, experience, logiciels, softSkills, lieux, vehicule)
 */
async function scoreJobsWithCvGroq(jobs, cvCriteria) {
  if (!jobs || !Array.isArray(jobs) || jobs.length === 0) {
    return [];
  }
  if (!cvCriteria) {
    return jobs.map(j => ({ ...j, cvScore: null, cvMatchDetails: 'Aucun critère CV fourni' }));
  }

  const client = getGroqClient();
  const model = getModelName();

  if (!client) {
    console.log('[cvGroqService] Groq non configuré pour le scoring CV. Fallback local.');
    return null;
  }

  // Profil synthétisé pour le prompt
  const candidateProfile = {
    formations: Array.isArray(cvCriteria.formations) ? cvCriteria.formations : [cvCriteria.formations || ''],
    experience: Array.isArray(cvCriteria.experience) ? cvCriteria.experience : [cvCriteria.experience || ''],
    logiciels: Array.isArray(cvCriteria.logiciels) ? cvCriteria.logiciels : [cvCriteria.logiciels || ''],
    softSkills: Array.isArray(cvCriteria.softSkills) ? cvCriteria.softSkills : [cvCriteria.softSkills || ''],
    lieux: cvCriteria.lieux || 'Non précisé',
    vehicule: !!cvCriteria.vehicule
  };

  const systemPrompt = `Tu es un recruteur expert et évaluateur RH impartial. Ta mission est d'évaluer de manière rigoureuse et bienveillante l'adéquation globale (score de 0 à 100%) entre le profil d'un candidat et une liste d'offres d'emploi.

Profil candidat :
- Formations & Diplômes : ${JSON.stringify(candidateProfile.formations)}
- Expériences professionnelles : ${JSON.stringify(candidateProfile.experience)}
- Logiciels & Compétences techniques : ${JSON.stringify(candidateProfile.logiciels)}
- Soft skills : ${JSON.stringify(candidateProfile.softSkills)}
- Localisation / Mobilité : ${candidateProfile.lieux} (Véhiculé: ${candidateProfile.vehicule ? 'Oui' : 'Non'})

Directives d'évaluation GÉNÉRIQUES (valables pour tout domaine professionnel) :
1. EXPÉRIENCES & ALTERNANCE : L'alternance (apprentissage ou professionnalisation) et les stages longs sont de VRAIES expériences professionnelles de terrain. Valorise-les pleinement comme telles (ne pénalise JAMAIS un candidat parce qu'il a été alternant).
2. FORMATIONS & DIPLÔMES : Prends en compte le domaine d'études et le niveau académique (Bac, Bac+2/3/5, BTS, Titre RNCP, diplôme d'ingénieur, université, autodidacte) face aux prérequis de l'offre.
3. COMPÉTENCES & TRANSFÉRABILITÉ : Analyse la compatibilité réelle et les technologies/outils équivalents ou complémentaires.
4. LOCALISATION : Vérifie la cohérence géographique (même secteur, région proche, candidat véhiculé ou offre mentionnant télétravail/remote).
5. ÉCHELLE DE SCORE DE MATCHING (0 à 100) :
   - 80 à 100% : Excellente adéquation (profil aligné, compétences clés présentes, alternance ou expérience opérationnelle très pertinente).
   - 65 à 79% : Bonne adéquation (profil junior/alternant adapté au poste, socle technique présent avec potentiel rapide d'intégration).
   - 45 à 64% : Adéquation partielle (domaine proche mais écarts notables de technologies ou niveau d'expérience demandé trop élevé).
   - 10 à 44% : Faible adéquation ou métier sans rapport.

Tu dois IMPÉRATIVEMENT répondre uniquement avec un objet JSON respectant ce schéma :
{
  "results": [
    {
      "index": 0,
      "score": 85,
      "explanation": "Courte phrase (max 18 mots) expliquant précisément le score (ex: 'Alternance valorisée, bonne maîtrise de la stack et profil junior idéal pour cette offre.')",
      "matchedStrengths": ["Force 1", "Force 2", "Force 3"]
    }
  ]
}
Ne renvoie aucun texte en dehors du JSON pur.`;

  // Traitement par lots de 12 offres pour optimiser latence et limites de tokens
  const BATCH_SIZE = 12;
  const batches = [];
  for (let i = 0; i < jobs.length; i += BATCH_SIZE) {
    batches.push({
      startIndex: i,
      items: jobs.slice(i, i + BATCH_SIZE)
    });
  }

  console.log(`[cvGroqService] Évaluation sémantique Groq de ${jobs.length} offres en ${batches.length} lot(s)...`);

  const scoredResultsMap = new Map();

  let lastRateLimitErr = null;
  const batchPromises = batches.map(async (batch, batchIdx) => {
    const compactJobs = batch.items.map((job, idx) => ({
      index: idx,
      title: job.title || '',
      company: job.company || '',
      location: job.location || '',
      contractType: job.contractType || '',
      tags: Array.isArray(job.tags) ? job.tags.slice(0, 6) : [],
      description: (job.description || '').replace(/\s+/g, ' ').trim().slice(0, 450)
    }));

    try {
      const completion = await client.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Évalue ces ${compactJobs.length} offres d'emploi pour le candidat :\n\n${JSON.stringify(compactJobs, null, 2)}` }
        ],
        temperature: 0.1,
        response_format: { type: 'json_object' }
      });

      const rawContent = completion.choices[0]?.message?.content;
      if (!rawContent) return;

      let parsed;
      try {
        parsed = JSON.parse(rawContent);
      } catch {
        const cleaned = rawContent.replace(/```json\s*/gi, '').replace(/```\s*$/gi, '').trim();
        parsed = JSON.parse(cleaned);
      }

      const list = parsed.results || parsed.scores || parsed.evaluations || [];
      list.forEach(res => {
        const globalIdx = batch.startIndex + (res.index !== undefined ? res.index : 0);
        const originalJob = jobs[globalIdx];
        if (originalJob) {
          const scoreNum = Math.min(100, Math.max(10, Math.round(Number(res.score) || 50)));
          scoredResultsMap.set(originalJob.id || `idx_${globalIdx}`, {
            score: scoreNum,
            explanation: res.explanation || 'Profil évalué par Groq AI.',
            matchedStrengths: Array.isArray(res.matchedStrengths) ? res.matchedStrengths : []
          });
        }
      });
    } catch (err) {
      if (isGroqRateLimitError(err)) {
        lastRateLimitErr = err;
      }
      console.warn(`[cvGroqService] Avertissement sur le lot ${batchIdx + 1}/${batches.length}:`, err.message);
    }
  });

  await Promise.allSettled(batchPromises);

  // Fusionner les résultats avec les offres initiales
  const finalJobs = jobs.map((job, idx) => {
    const key = job.id || `idx_${idx}`;
    const groqEval = scoredResultsMap.get(key);
    if (groqEval) {
      return {
        ...job,
        cvScore: groqEval.score,
        cvMatchDetails: groqEval.explanation,
        cvMatchedStrengths: groqEval.matchedStrengths,
        cvScoreSource: 'groq'
      };
    }
    return job;
  });

  if (lastRateLimitErr && scoredResultsMap.size === 0) {
    finalJobs.groqRateLimit = createGroqRateLimitPayload(lastRateLimitErr, "l'évaluation des offres");
  }

  return finalJobs;
}

module.exports = {
  adaptCvCriteriaWithGroq,
  validateAndNormalizeCvCriteria,
  scoreJobsWithCvGroq
};

