const axios = require('axios');
const cheerio = require('cheerio');
const { getGroqClient } = require('./groqService');
const { isGroqRateLimitError, createGroqRateLimitPayload } = require('./utils/groqErrorHandler');
require('dotenv').config();

const detailHttpClient = axios.create({
  timeout: 7000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8'
  }
});

/**
 * Tente d'extraire le texte complet depuis l'URL de l'offre
 */
async function fetchJobPageContent(url, source) {
  if (!url || !url.startsWith('http')) return null;

  try {
    const res = await detailHttpClient.get(url);
    const $ = cheerio.load(res.data);

    // Suppression des éléments parasites
    $('script, style, noscript, nav, header, footer, iframe, .cookie-banner').remove();

    // Sélecteurs ciblés selon les plateformes
    let targetedText = '';

    if (source === 'France Travail' || url.includes('francetravail.fr')) {
      targetedText = $('.description, [itemprop="description"], .modal-details').text().trim();
    } else if (source === 'HelloWork' || url.includes('hellowork.com')) {
      targetedText = $('section.description, [data-cy="job-description"], .tw-typo-long-m').text().trim();
    } else if (source === 'LinkedIn' || url.includes('linkedin.com')) {
      targetedText = $('.show-more-less-html__markup, .description__text').text().trim();
    } else if (source === 'Remotive' || url.includes('remotive.com')) {
      targetedText = $('.job-description, .job-details').text().trim();
    }

    if (targetedText && targetedText.length > 100) {
      return targetedText.replace(/\s+/g, ' ').trim().substring(0, 4000);
    }

    // Fallback body text
    const bodyText = $('main, article, body').text().replace(/\s+/g, ' ').trim();
    return bodyText.length > 150 ? bodyText.substring(0, 3000) : null;
  } catch (err) {
    console.warn(`[JobAnalysisService] Impossible de scraper l'URL ${url} (${err.message}). Utilisation des données existantes.`);
    return null;
  }
}

/**
 * Service principal : analyse approfondie d'une offre avec Groq
 */
async function analyzeJobAndGetTips(jobData) {
  const { title = '', company = '', location = '', contractType = '', salary = '', url = '', description = '', source = '' } = jobData;

  // 1. Récupération du contenu détaillé de la page si possible
  console.log(`[JobAnalysisService] Analyse détaillée pour "${title}" (${company})...`);
  const fetchedContent = await fetchJobPageContent(url, source);
  const fullContent = fetchedContent || description || `${title} chez ${company} à ${location}`;

  // 2. Modèle Groq
  const client = getGroqClient();
  const candidateModels = [
    process.env.GROQ_MODEL,
    'groq/compound-mini',
    'openai/gpt-oss-20b',
    'openai/gpt-oss-120b',
    'llama-3.3-70b-versatile'
  ].filter(Boolean);

  if (!client) {
    console.log('[JobAnalysisService] Groq non connecté, génération du résumé heuristique.');
    return generateFallbackAnalysis(jobData, fullContent);
  }

  const systemPrompt = `Tu es un coach carrière et expert en recrutement de haut niveau.
Tu analyses une offre d'emploi pour donner un résumé clair et des conseils ultra-actionnables à un candidat qui souhaite postuler.

Tu dois répondre UNIQUEMENT avec un objet JSON valide structuré comme suit :
{
  "summary": "Résumé clair et percutant du poste en 2 à 3 phrases (ce que fait l'entreprise, le rôle principal, le contexte).",
  "missions": ["Mission principale 1", "Mission principale 2", "Mission principale 3"],
  "profileRequired": ["Niveau d'expérience et compétences clés attendues 1", "Point clé 2"],
  "strengths": ["Atout majeur du poste (ambiance, techno, remote, projet...) 1", "Atout 2"],
  "cvKeywords": ["Mot-clé stratégique 1 à mettre dans le CV", "Mot-clé 2", "Mot-clé 3", "Mot-clé 4"],
  "applicationTips": "Le meilleur argument d'accroche pour la lettre de motivation ou message de candidature (conseil concret personnalisé au poste).",
  "interviewQuestions": [
    "Question d'entretien probable 1 que le recruteur posera",
    "Question d'entretien probable 2 avec un axe de réponse suggéré"
  ]
}`;

  const userPrompt = `Offre d'emploi :
- Titre : ${title}
- Entreprise : ${company}
- Lieu : ${location}
- Contrat : ${contractType}
- Salaire : ${salary}
- Plateforme : ${source}

Contenu de l'offre :
${fullContent.substring(0, 3000)}`;

  let lastRateLimitErr = null;
  for (const currentModel of candidateModels) {
    try {
      const completion = await client.chat.completions.create({
        model: currentModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.2,
        max_completion_tokens: 1500
      });

      const parsed = JSON.parse(completion.choices[0]?.message?.content || '{}');
      return {
        success: true,
        isAiPowered: true,
        modelUsed: currentModel,
        job: { title, company, location, contractType, source, url },
        analysis: parsed
      };
    } catch (err) {
      if (isGroqRateLimitError(err)) {
        lastRateLimitErr = err;
      }
      console.warn(`[JobAnalysisService] Modèle ${currentModel} indisponible (${err.message}). Essai du suivant...`);
    }
  }

  // Si tous les modèles échouent
  const fallbackResult = {
    success: true,
    isAiPowered: false,
    job: { title, company, location, contractType, source, url },
    analysis: generateFallbackAnalysis(jobData, fullContent)
  };

  if (lastRateLimitErr) {
    fallbackResult.groqRateLimit = createGroqRateLimitPayload(lastRateLimitErr, "l'analyse approfondie de l'offre");
  }

  return fallbackResult;
}

/**
 * Analyse de secours locale si Groq n'est pas disponible
 */
function generateFallbackAnalysis(job, content) {
  const words = (content || '').split(/\s+/).filter(w => w.length > 4);
  const keywords = Array.from(new Set(words.slice(0, 8)));

  return {
    summary: `Poste de ${job.title || 'Développeur'} proposé par ${job.company || 'l\'entreprise'} à ${job.location || 'Localisation non précisée'}. L'opportunité requiert rigueur, autonomie et esprit d'équipe.`,
    missions: [
      `Participer activement aux projets techniques et fonctionnels liés au poste de ${job.title}.`,
      "Concevoir, tester et déployer des solutions adaptées aux besoins de l'entreprise.",
      "Collaborer étroitement avec les équipes internes et assurer le suivi des bonnes pratiques."
    ],
    profileRequired: [
      "Expérience démontrée sur les compétences associées au poste.",
      "Capacité d'analyse, curiosité technique et bonne communication."
    ],
    strengths: [
      `Opportunité sur la plateforme ${job.source || 'partenaire'}.`,
      "Projet dynamique avec perspectives d'évolution."
    ],
    cvKeywords: keywords.slice(0, 5),
    applicationTips: `Mettez en avant vos réalisations concrètes en lien avec ${job.title} et montrez votre motivation pour le secteur de ${job.company}.`,
    interviewQuestions: [
      `Pouvez-vous nous présenter un projet similaire à ce que nous recherchons pour ce poste de ${job.title} ?`,
      `Comment abordez-vous la résolution d'un problème technique complexe sous contrainte de temps ?`
    ]
  };
}

module.exports = {
  analyzeJobAndGetTips,
  fetchJobPageContent
};
