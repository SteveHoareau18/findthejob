const Groq = require('groq-sdk');
require('dotenv').config();
const { isGroqRateLimitError, createGroqRateLimitPayload } = require('./utils/groqErrorHandler');

let groqClient = null;

function getGroqClient() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey.includes('your_groq_api_key')) {
    return null;
  }
  if (!groqClient) {
    groqClient = new Groq({ apiKey });
  }
  return groqClient;
}

// Modèle Groq optimal (groq/compound-mini, llama-3.3-70b-versatile ou custom GROQ_MODEL)
function getModelName() {
  const envModel = process.env.GROQ_MODEL;
  if (envModel) {
    return envModel;
  }
  return 'groq/compound-mini';
}

/**
 * Analyse sémantique de la recherche et des critères d'exclusion
 */
async function parseUserQueryAndExclusions(query, exclusions, manualGeoRegion = 'all') {
  const client = getGroqClient();
  const model = getModelName();

  if (!client) {
    console.log('[GroqService] Aucune clé GROQ_API_KEY. Utilisation du mode heuristique.');
    return {
      success: true,
      data: fallbackParse(query, exclusions, manualGeoRegion),
      isAiPowered: false,
      warning: 'Clé GROQ_API_KEY non configurée. Mode heuristique actif.'
    };
  }

  const systemPrompt = `Tu es un moteur d'analyse sémantique expert en recrutement (France, DROM, Europe et International).
L'utilisateur formule sa recherche d'emploi en deux volets :
1. Ce qu'il cherche concrètement (métier, technologies, niveau, ville ciblée, conditions souhaitées).
2. Ce qu'il refuse formellement dans les résultats (mots-clés, sous-domaines, quartiers ou villes exclues, types de contrat refusés comme stage/alternance, etc.).

Tu dois extraire impérativement un JSON structuré avec :
{
  "primaryJobTitle": "Intitule normalise et concis du poste (ex: 'Assistante de production', 'Menuisier agenceur')",
  "searchKeywords": ["mot-cle 1", "mot-cle 2", "mot-cle 3"],
  "targetLocation": "La ville ou zone precise demandee (ex: 'Montpellier', 'Quimper', 'Saint-Denis') ou null si non precise",
  "targetDepartmentCode": "Code departement a 2 ou 3 chiffres si France/DROM (ex: '34', '29', '974', '75') sinon null",
  "targetLocationAliases": ["tableau", "des codes postaux", "variantes et communes directes de la zone ciblee"],
  "exclusionTokens": [
    "Tableau exhaustif de TOUS les termes, variantes morphologiques, racines et synonymes a exclure formellement.",
    "Decline chaque refus de l'utilisateur (masculin/feminin, singulier/pluriel, synonymes directs, sans articles).",
    "Exemple : si l'utilisateur refuse 'regie, alternance, Lemasson', renvoie : ['regie', 'regisseur', 'regisseuse', 'alternance', 'alternant', 'alternante', 'apprentissage', 'apprenti', 'lemasson']"
  ],
  "excludedContractTypes": ["stage", "alternance"],
  "excludedLocations": ["quartiers", "villes ou zones explicitement rejetees"],
  "geoRegion": "france" | "drom" | "europe" | "all",
  "summary": "Synthese fluide et precise en une phrase de la recherche et des exclusions"
}`;

  const userMessage = `RECHERCHE : ${query || 'Tous postes'}
EXCLUSIONS : ${exclusions || 'Aucune'}
ZONE : ${manualGeoRegion}`;

  try {
    const completion = await client.chat.completions.create({
      model: model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1,
      max_completion_tokens: 1500
    });

    const parsed = JSON.parse(completion.choices[0]?.message?.content || '{}');
    return {
      success: true,
      data: parsed,
      isAiPowered: true
    };
  } catch (err) {
    console.warn('[GroqService] Erreur analyse Groq:', err.message);
    // Tentative de fallback sur groq/compound-mini si rate limit ou modèle alternatif
    try {
      const fallbackCompletion = await client.chat.completions.create({
        model: 'groq/compound-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1
      });
      const parsed = JSON.parse(fallbackCompletion.choices[0]?.message?.content || '{}');
      return { success: true, data: parsed, isAiPowered: true };
    } catch (e2) {
      const isRateLimit = isGroqRateLimitError(e2) || isGroqRateLimitError(err);
      if (isRateLimit) {
        const rateLimitPayload = createGroqRateLimitPayload(e2 || err, 'la recherche sémantique');
        return {
          success: true,
          data: fallbackParse(query, exclusions, manualGeoRegion),
          isAiPowered: false,
          warning: rateLimitPayload.message,
          groqRateLimit: rateLimitPayload
        };
      }
      return {
        success: true,
        data: fallbackParse(query, exclusions, manualGeoRegion),
        isAiPowered: false,
        warning: `Notice Groq: ${err.message}. Mode heuristique actif.`
      };
    }
  }
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Nettoie un terme d'exclusion en retirant les mots de liaison, articles et préfixes de zone/quartier
 */
function cleanExclusionToken(token) {
  if (!token || typeof token !== 'string') return '';
  return token
    .replace(/^(?:les|le|la|l\x27|des|du|de|d\x27|un|une|pas\s+de|pas\s+d\x27|pas\s+à|pas\s+a|aucun|aucune|sans|sauf|hors)\s+/i, '')
    .replace(/^(?:contrats?\s+d\x27|contrats?\s+de\s+|contrats?\s+)/i, '')
    .replace(/^(?:quartiers?|secteurs?|zones?|arrondissements?)\s+(?:de\s+|d\x27)?/i, '')
    .trim()
    .toLowerCase();
}

/**
 * Construit un ensemble 100% générique de règles regex d'exclusion
 * Exploite toutes les déclinaisons sémantiques extraites par Groq + saisie utilisateur
 */
function buildExclusionRules(parsedCriteria, rawExclusions) {
  const rules = [];
  const addedTokens = new Set();

  // Consolidation de TOUS les tokens d'exclusion (extraits par l'IA + saisis par l'utilisateur)
  const allRawTokens = [
    ...(parsedCriteria?.exclusionTokens || []),
    ...(parsedCriteria?.strictExclusions || []),
    ...(parsedCriteria?.excludedContractTypes || []),
    ...(parsedCriteria?.excludedLocations || []),
    ...(rawExclusions || '').split(/[\n,;/|]+|\s+(?:et|ou|ni|sans|sauf|hors)\s+/i)
  ];

  for (const raw of allRawTokens) {
    if (!raw) continue;
    const clean = cleanExclusionToken(raw);
    if (!clean || clean.length < 2) continue;
    if (addedTokens.has(clean)) continue;
    addedTokens.add(clean);

    rules.push({
      label: clean,
      regex: new RegExp(`\\b${escapeRegex(clean)}\\b`, 'i')
    });
  }

  return rules;
}

/**
 * Valide strictement la conformité géographique d'une offre par rapport au lieu ciblé
 * 100% générique : s'appuie sur targetLocation, targetLocationAliases et targetDepartmentCode fournis par l'IA
 */
function checkLocationMatch(jobLocation, jobFullText, parsedCriteria) {
  const target = parsedCriteria?.targetLocation || parsedCriteria?.location;
  if (!target) return { matches: true };

  const targetClean = target.toLowerCase().trim();
  if (['france', 'europe', 'all', 'tous', 'monde', 'aucun', 'null'].includes(targetClean)) {
    return { matches: true };
  }

  const jobLoc = (jobLocation || '').toLowerCase();
  const full = (jobFullText || '').toLowerCase();

  // 1. Correspondance directe avec le nom de la ville ou zone
  if (jobLoc.includes(targetClean) || full.includes(targetClean)) {
    return { matches: true };
  }

  // 2. Correspondance avec les alias / codes postaux / communes associées par l'IA
  const aliases = parsedCriteria?.targetLocationAliases || [];
  for (const alias of aliases) {
    const a = (alias || '').toLowerCase().trim();
    if (!a) continue;
    if (jobLoc.includes(a) || full.includes(a)) {
      return { matches: true };
    }
  }

  // 3. Correspondance avec le code département si fourni
  const dept = parsedCriteria?.targetDepartmentCode;
  if (dept) {
    const deptRegex = new RegExp(`(?:\\b|[^0-9])${escapeRegex(dept)}(?:\\b|[^0-9])`, 'i');
    if (deptRegex.test(jobLoc) || deptRegex.test(full)) {
      return { matches: true };
    }
  }

  return {
    matches: false,
    reason: `Localisation hors cible : "${jobLocation || 'Non précisée'}" (attendu : ${target})`
  };
}

/**
 * Détecte de façon heuristique un lieu dans la requête en mode repli
 */
function extractTargetLocationFromQuery(query) {
  if (!query) return '';
  const q = query.toLowerCase();

  const cpMatch = q.match(/\b([0-9]{5})\b/);
  if (cpMatch) return cpMatch[1];

  const prepMatch = q.match(/(?:à|a|sur|dans|vers|proche)\s+([A-Za-zÀ-ÿ\-]{3,25})/i);
  if (prepMatch) return prepMatch[1];

  return '';
}

/**
 * Évaluation, détection des exclusions et tri de TOUTES les offres
 * Aucune offre n'est éliminée : les offres non conformes sont marquées et classées en fin de liste.
 */
async function filterAndScoreJobs(jobs, query, exclusions, parsedCriteria) {
  if (!jobs || jobs.length === 0) return [];

  const exclusionRules = buildExclusionRules(parsedCriteria, exclusions);
  const targetLocation = parsedCriteria?.targetLocation || parsedCriteria?.location || extractTargetLocationFromQuery(query);

  const searchKeywords = (parsedCriteria?.searchKeywords || [])
    .concat((query || '').toLowerCase().split(/[\s,\n]+/))
    .map(s => s.trim().toLowerCase())
    .filter(w => w.length > 2);

  const processedJobs = [];

  // 1. Évaluation locale ultra-rapide pour chaque offre
  for (const job of jobs) {
    const fullText = `${job.title || ''} ${job.company || ''} ${job.location || ''} ${job.contractType || ''} ${job.description || ''} ${(job.tags || []).join(' ')}`;

    // Détection des critères d'exclusion (mots-clés, types de contrat, quartiers comme Lemasson)
    let isExcluded = false;
    let foundReason = '';

    for (const rule of exclusionRules) {
      if (rule.regex.test(fullText)) {
        isExcluded = true;
        foundReason = `Critère ou zone exclu : "${rule.label}"`;
        break;
      }
    }

    // Détection de non-conformité géographique (si une ville spécifique est ciblée)
    if (!isExcluded && targetLocation) {
      const locCheck = checkLocationMatch(job.location, fullText, parsedCriteria);
      if (!locCheck.matches) {
        isExcluded = true;
        foundReason = locCheck.reason;
      }
    }

    // Calcul de correspondance des termes de recherche
    let matchesCount = 0;
    const matchedTerms = [];
    for (const kw of searchKeywords) {
      if (fullText.toLowerCase().includes(kw)) {
        matchesCount++;
        if (matchedTerms.length < 3) matchedTerms.push(kw);
      }
    }

    let score = 50;
    let explanation = '';

    if (isExcluded) {
      score = Math.max(10, 20 - matchesCount);
      explanation = `⚠️ Non recommandé : ${foundReason}.`;
    } else {
      score = Math.min(98, Math.max(50, 50 + matchesCount * 12));
      explanation = matchedTerms.length > 0
        ? `Recommandé : correspond à vos termes (${matchedTerms.join(', ')}), aucune exclusion détectée.`
        : `Offre compatible avec votre profil, respecte toutes vos exclusions.`;
    }

    processedJobs.push({
      ...job,
      isExcluded,
      exclusionReason: isExcluded ? foundReason : null,
      matchScore: score,
      matchExplanation: explanation,
      keyHighlights: job.tags || []
    });
  }

  // 2. Enrichissement par Groq pour les meilleures offres (Top 10) si la clé est présente
  const client = getGroqClient();
  if (client) {
    try {
      const topJobs = processedJobs.filter(j => !j.isExcluded).slice(0, 8);
      if (topJobs.length > 0) {
        const promptData = topJobs.map((j, idx) => ({
          idx,
          title: j.title,
          company: j.company,
          location: j.location,
          source: j.source
        }));

        const enrichPrompt = `Tu es un assistant de recrutement. Pour ces offres d'emploi compatibles avec la recherche "${query}", rédige pour chacune une courte phrase percutante (max 15 mots) expliquant son atout majeur pour le candidat.
Réponds en JSON : { "highlights": [ { "idx": 0, "tip": "..." } ] }`;

        const res = await client.chat.completions.create({
          model: 'groq/compound-mini', // Très rapide et quotas élevés
          messages: [
            { role: 'system', content: enrichPrompt },
            { role: 'user', content: JSON.stringify(promptData) }
          ],
          response_format: { type: 'json_object' },
          max_completion_tokens: 400
        });

        const tips = JSON.parse(res.choices[0]?.message?.content || '{}').highlights || [];
        tips.forEach(t => {
          if (topJobs[t.idx] && t.tip) {
            topJobs[t.idx].matchExplanation = `★ Atout IA : ${t.tip}`;
          }
        });
      }
    } catch (e) {
      // Si l'enrichissement optionnel échoue, ce n'est pas bloquant
      console.log('[GroqService] Notice enrichissement optionnel:', e.message);
    }
  }

  // Tri impératif :
  // 1. Les offres recommandées (non exclues) en tête, ordonnées par score décroissant
  // 2. Les offres non recommandées (exclues) à la fin
  return processedJobs.sort((a, b) => {
    if (a.isExcluded !== b.isExcluded) {
      return a.isExcluded ? 1 : -1;
    }
    return (b.matchScore || 0) - (a.matchScore || 0);
  });
}

// =================== FALLBACKS ===================

function fallbackParse(query, exclusions, manualGeoRegion = 'all') {
  const combined = `${query || ''} ${exclusions || ''}`.toLowerCase();

  let detectedLocation = '';
  let geoRegion = manualGeoRegion;

  if (manualGeoRegion !== 'all') {
    geoRegion = manualGeoRegion;
  } else if (/reunion|réunion|974/.test(combined)) {
    geoRegion = 'drom';
    detectedLocation = 'La Réunion';
  } else if (/guadeloupe|971/.test(combined)) {
    geoRegion = 'drom';
    detectedLocation = 'Guadeloupe';
  } else if (/martinique|972/.test(combined)) {
    geoRegion = 'drom';
    detectedLocation = 'Martinique';
  } else if (/guyane|973/.test(combined)) {
    geoRegion = 'drom';
    detectedLocation = 'Guyane';
  } else if (/mayotte|976/.test(combined)) {
    geoRegion = 'drom';
    detectedLocation = 'Mayotte';
  } else if (/europe|belgique|suisse|luxembourg|allemagne/.test(combined)) {
    geoRegion = 'europe';
  } else {
    geoRegion = 'france';
    detectedLocation = extractTargetLocationFromQuery(query);
  }

  const searchKeywords = (query || '')
    .split(/[\n,;]+/)
    .map(s => s.trim())
    .filter(s => s.length > 2);

  const strictExclusions = (exclusions || '')
    .split(/[\n,;/|]+|\s+(?:et|ou|ni|sans|sauf)\s+/i)
    .map(s => cleanExclusionToken(s))
    .filter(s => s.length > 1);

  const excludedContractTypes = [];
  if (/alternan|apprenti/i.test(exclusions)) excludedContractTypes.push('alternance');
  if (/stag|intern/i.test(exclusions)) excludedContractTypes.push('stage');
  if (/b[ée]n[ée]vol|volontair/i.test(exclusions)) excludedContractTypes.push('bénévolat');
  if (/freelance|ind[ée]pendant/i.test(exclusions)) excludedContractTypes.push('freelance');
  if (/int[ée]rim/i.test(exclusions)) excludedContractTypes.push('intérim');

  return {
    searchKeywords: searchKeywords.length > 0 ? searchKeywords : ['développeur'],
    primaryJobTitle: searchKeywords[0] || 'Développeur',
    location: detectedLocation,
    geoRegion: geoRegion,
    mandatorySkills: searchKeywords,
    strictExclusions: strictExclusions,
    excludedContractTypes: excludedContractTypes,
    summary: `Recherche: ${searchKeywords.join(', ')} | Région: ${geoRegion.toUpperCase()} | Exclusions: ${strictExclusions.join(', ') || 'Aucune'}`
  };
}

module.exports = {
  getGroqClient,
  getModelName,
  parseUserQueryAndExclusions,
  filterAndScoreJobs
};
