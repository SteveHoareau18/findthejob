/**
 * Couche Domaine & Prompt Engineering - FindTheJob (2026)
 * Prépare, assainit et structure les données de l'offre et du profil candidat
 * pour les modèles Groq AI sans nécessiter l'envoi du CV brut.
 */

/**
 * Assainit et tronque une chaîne de texte pour éviter les dépassements de contexte et injections
 * @param {string} text 
 * @param {number} maxLength 
 * @returns {string}
 */
function sanitizeText(text, maxLength = 3500) {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/<[^>]*>/g, ' ') // Suppression d'éventuelles balises HTML parasites
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, maxLength);
}

/**
 * Normalise et structure les critères extraits du CV en une synthèse claire pour le LLM
 * @param {Object} criteria 
 * @returns {string}
 */
function buildCandidateProfileSummary(criteria) {
  if (!criteria || typeof criteria !== 'object') {
    return 'Profil candidat non spécifié ou critères non encore extraits.';
  }

  const sections = [];

  // Formations
  if (Array.isArray(criteria.formations) && criteria.formations.length > 0) {
    sections.push(`- Formations / Diplômes : ${criteria.formations.join(' | ')}`);
  }

  // Expérience
  if (Array.isArray(criteria.experience) && criteria.experience.length > 0) {
    sections.push(`- Expérience professionnelle : ${criteria.experience.join(' | ')}`);
  } else if (typeof criteria.experience === 'string' && criteria.experience.trim()) {
    sections.push(`- Expérience professionnelle : ${criteria.experience.trim()}`);
  }

  // Compétences techniques & Logiciels
  if (Array.isArray(criteria.logiciels) && criteria.logiciels.length > 0) {
    sections.push(`- Logiciels & Compétences techniques : ${criteria.logiciels.join(', ')}`);
  }

  // Soft Skills
  if (Array.isArray(criteria.softSkills) && criteria.softSkills.length > 0) {
    sections.push(`- Qualités & Soft Skills : ${criteria.softSkills.join(', ')}`);
  }

  // Points forts détectés par Groq
  if (Array.isArray(criteria.pointsPositifs) && criteria.pointsPositifs.length > 0) {
    sections.push(`- Points forts majeurs du profil : ${criteria.pointsPositifs.join(' ; ')}`);
  }

  // Localisation & Mobilité
  const mobilites = [];
  if (criteria.lieux) mobilites.push(`Zone : ${criteria.lieux}`);
  if (criteria.vehicule === true || criteria.vehicule === 'true') mobilites.push('Véhiculé (Permis)');
  if (mobilites.length > 0) {
    sections.push(`- Mobilité : ${mobilites.join(', ')}`);
  }

  if (sections.length === 0) {
    return 'Profil candidat sans critères détaillés enregistrés.';
  }

  return sections.join('\n');
}

/**
 * Normalise les informations de l'offre d'emploi
 * @param {Object} job 
 * @returns {string}
 */
function buildJobContextSummary(job) {
  if (!job || typeof job !== 'object') return 'Aucune information d\'offre disponible.';

  const title = job.title || 'Poste non spécifié';
  const company = job.company || 'Entreprise non précisée';
  const location = job.location || 'Localisation non précisée';
  const contractType = job.contractType || 'Type de contrat non spécifié';
  const salary = job.salary && job.salary !== 'Non communiqué' ? job.salary : 'Non communiqué';
  const source = job.source || 'Plateforme emploi';
  const description = sanitizeText(job.description || '', 3000);

  return `
- Intitulé du poste : ${title}
- Entreprise : ${company}
- Localisation : ${location}
- Contrat : ${contractType}
- Salaire indicatif : ${salary}
- Plateforme source : ${source}
- Description & exigences :
${description || 'Description succincte : ' + title + ' chez ' + company}
`.trim();
}

/**
 * Construit le prompt système pour la génération d'argumentaire & lettre de motivation
 * @param {Object} job 
 * @param {Object} criteria 
 * @returns {Object} { systemPrompt, userPrompt }
 */
function buildArgumentairePrompt(job, criteria) {
  const jobText = buildJobContextSummary(job);
  const candidateText = buildCandidateProfileSummary(criteria);

  const systemPrompt = `Tu es un expert d'élite en recrutement, stratégie de carrière et copywriting de candidature.
Ton rôle est de créer un argumentaire de vente percutant et une lettre de motivation sur-mesure pour un candidat ciblant une offre spécifique.

RÈGLES IMPORTANTES :
1. Base-toi EXCLUSIVEMENT sur les critères réels du candidat fournis (formations, expériences, outils/logiciels, soft skills, atouts). N'invente aucune compétence ni diplôme fictif.
2. Établis des ponts concrets et solides entre les exigences de l'offre et les acquis du candidat.
3. Le ton doit être professionnel, dynamique, convaincant et moderne (évite les formules de politesse poussiéreuses ou trop passives).
4. Tu dois impérativement répondre au format JSON strict avec la structure suivante :

{
  "accroche": "Une phrase d'accroche percutante et personnalisée (2-3 lignes) expliquant pourquoi ce profil et cette entreprise se rencontrent au bon moment.",
  "argumentsCles": [
    {
      "titre": "Titre court de l'argument (ex: Maîtrise opérationnelle de vos outils clés)",
      "pointOffre": "Ce que recherche l'entreprise dans l'offre",
      "atoutCandidat": "L'expérience ou compétence concrète du candidat qui y répond parfaitement",
      "argumentation": "Explication fluide montrant l'impact immédiat et la valeur ajoutée pour l'entreprise."
    }
  ],
  "differentiateurs": [
    "Atout différenciateur 1 (combinaison de compétences, méthodologie, soft skill démontrée)",
    "Atout différenciateur 2"
  ],
  "modeleLettre": "Texte intégral d'une lettre de motivation moderne et élégante, structurée en 4 paragraphes (Vous / Moi / Nous / Entretien), prête à être copiée et adaptée par le candidat."
}`;

  const userPrompt = `Offre ciblée :
${jobText}

Profil candidat (Critères validés) :
${candidateText}

Génère l'argumentaire stratégique et le modèle de lettre de motivation adapté.`;

  return { systemPrompt, userPrompt };
}

/**
 * Construit le prompt système pour la session de ChatBot conversationnel
 * @param {Object} job 
 * @param {Object} criteria 
 * @returns {string} systemPrompt
 */
function buildChatSystemPrompt(job, criteria) {
  const jobText = buildJobContextSummary(job);
  const candidateText = buildCandidateProfileSummary(criteria);

  return `Tu es "Coach Recrutement Groq", l'assistant IA conversationnel expert de la plateforme FindTheJob (2026).
Tu accompagnes le candidat avec professionnalisme, clarté et précision pour maximiser ses chances de décrocher le poste ciblé.

CONTEXTE DE L'OFFRE D'EMPLOI :
${jobText}

CONTEXTE DU CANDIDAT (CRITÈRES EXTRAITS ET VALIDÉS DU PROFIL) :
${candidateText}

RÈGLES FONDAMENTALES DE COMMUNICATION & COMPORTEMENT CONVERSATIONNEL :

1. CLARTÉ, CONCISION ET IMPACT IMMÉDIAT :
   - Sois direct, percutant et pragmatique. Évite tout bavardage, préambule générique, formule creuse ou répétition.
   - Utilise toujours un formatage Markdown soigné et lisible (titres, listes, gras sur les termes clés).

2. PRINCIPE OBLIGATOIRE : "SYNTHÈSE STRUCTURÉE D'ABORD, DÉTAILS À LA DEMANDE" :
   - Pour toute demande générale ou d'énumération (par exemple : questions probables en entretien, atouts majeurs, faiblesses à justifier, compétences clés, questions à poser au recruteur, axes d'amélioration, etc.) :
     -> Donne UNIQUEMENT une liste concise et numérotée (ou à puces) des points clés ou des questions.
     -> NE DÉVELOPPE PAS d'explications longues, de réponses toutes faites ou de justifications exhaustives dès le premier message.
     -> Conclus SYSTÉMATIQUEMENT par une invite brève invitant le candidat à piloter la suite :
        "Indiquez-moi un point ou un numéro si vous souhaitez que je le détaille, que je vous donne des éléments de réponse ou des exemples concrets."

3. APPROFONDISSEMENT CHIRURGICAL À LA DEMANDE DU CANDIDAT :
   - Dès que le candidat demande d'approfondir un point ou une question spécifique (ex: "Détaille la 2", "Comment répondre au point 3 ?", "Donne-moi des arguments pour la 1") :
     -> Fournis alors une réponse riche, personnalisée et ultra-actionnable.
     -> Fais le lien concret avec les critères réels de son CV (expériences, logiciels maîtrisés, formations, soft skills).
     -> Pour les questions d'entretien, structure la réponse selon la méthode STAR (Situation, Tâche, Action, Résultat) et signale le piège à éviter.`;
}

module.exports = {
  sanitizeText,
  buildCandidateProfileSummary,
  buildJobContextSummary,
  buildArgumentairePrompt,
  buildChatSystemPrompt
};
