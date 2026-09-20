/**
 * Layer 3: Service Métier & Orchestration LinkedIn
 * Construit les URLs ciblées avec filtres natifs (f_TPR, f_JT, f_WT, f_E),
 * orchestre la pagination multi-pages et applique les délais anti-bot.
 */

const { fetchLinkedInPageHtml, waitRandomDelay } = require('./client');
const { parseLinkedInHtml } = require('./parser');

const LINKEDIN_GUEST_BASE_URL = 'https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search';

/**
 * Nettoie les mots-clés de recherche pour les endpoints stricts
 * @param {string} query 
 * @returns {string}
 */
function cleanKeywords(query = '') {
  if (!query) return 'developpeur';
  return String(query)
    .replace(/[&/\\#,+()$~%.'":*?<>{}\n\r]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Normalise la configuration fournie avec les valeurs par défaut
 * @param {Object} rawConfig 
 * @returns {Object}
 */
function normalizeLinkedInConfig(rawConfig = {}) {
  const keywords = cleanKeywords(rawConfig.keywords || rawConfig.searchTerm || 'developpeur');
  const location = (rawConfig.location || 'France').trim();
  const start = Math.max(0, parseInt(rawConfig.start, 10) || 0);
  const limit = Math.max(1, parseInt(rawConfig.limit, 10) || 25);
  const maxPages = Math.max(1, parseInt(rawConfig.maxPages, 10) || Math.ceil(limit / 25));
  
  const delayRange = Array.isArray(rawConfig.delayBetweenRequestsMs) && rawConfig.delayBetweenRequestsMs.length === 2
    ? rawConfig.delayBetweenRequestsMs
    : [3000, 6000];

  return {
    keywords,
    location,
    start,
    limit,
    maxPages,
    f_TPR: rawConfig.f_TPR || null, // Date (ex: r86400, r604800)
    f_JT: rawConfig.f_JT || null,   // Type de contrat (ex: F, C, I, P)
    f_WT: rawConfig.f_WT || null,   // Télétravail (ex: 1=site, 2=remote, 3=hybride)
    f_E: rawConfig.f_E || null,     // Niveau d'expérience (ex: 1=stage, 2=junior, 3=confirmé, 4=senior)
    delayRange,
    timeoutMs: rawConfig.timeoutMs || 12000
  };
}

/**
 * Construit l'URL cible de l'API Guest de LinkedIn avec tous ses paramètres
 * @param {Object} config - Configuration normalisée
 * @param {number} startOffset - Index de début de pagination
 * @returns {string}
 */
function buildLinkedInUrl(config, startOffset = 0) {
  const url = new URL(LINKEDIN_GUEST_BASE_URL);

  url.searchParams.append('keywords', config.keywords);
  url.searchParams.append('location', config.location);
  url.searchParams.append('start', String(startOffset));

  if (config.f_TPR) url.searchParams.append('f_TPR', config.f_TPR);
  if (config.f_JT) url.searchParams.append('f_JT', config.f_JT);
  if (config.f_WT) url.searchParams.append('f_WT', config.f_WT);
  if (config.f_E) url.searchParams.append('f_E', config.f_E);

  return url.toString();
}

/**
 * Exécute le scraping multi-pages avec pagination et temporisation
 * @param {Object} rawConfig - Configuration de recherche
 * @returns {Promise<Array<Object>>} Liste consolidée des offres extraites
 */
async function executeLinkedInScraping(rawConfig = {}) {
  const config = normalizeLinkedInConfig(rawConfig);
  const collectedJobs = [];
  const seenUrls = new Set();

  console.log(`[LinkedIn Scraper] 🚀 Lancement recherche: "${config.keywords}" à "${config.location}" (start: ${config.start}, max: ${config.limit})`);
  if (config.f_TPR || config.f_JT) {
    console.log(`[LinkedIn Scraper] 🏷️ Filtres actifs: f_TPR=${config.f_TPR || 'aucun'}, f_JT=${config.f_JT || 'aucun'}`);
  }

  let currentStart = config.start;
  let pageIndex = 0;

  while (pageIndex < config.maxPages && collectedJobs.length < config.limit) {
    const pageUrl = buildLinkedInUrl(config, currentStart);
    
    // 1. Récupération HTTP résiliente
    const result = await fetchLinkedInPageHtml(pageUrl, config.timeoutMs);

    // 2. Gestion de l'interruption en cas de limitation (429 ou bot challenge)
    if (result.isRateLimited) {
      console.warn(`[LinkedIn Scraper] ⚠️ Interruption sécurisée de la pagination (statut ${result.status}). ${collectedJobs.length} offres conservées.`);
      break;
    }

    if (!result.html) {
      break;
    }

    // 3. Parsing du HTML
    const pageJobs = parseLinkedInHtml(result.html, config.location);

    if (pageJobs.length === 0) {
      // Fin des résultats disponibles sur LinkedIn
      break;
    }

    // 4. Dédoublonnage et accumulation
    let newJobsCount = 0;
    for (const job of pageJobs) {
      if (!seenUrls.has(job.url)) {
        seenUrls.add(job.url);
        collectedJobs.push(job);
        newJobsCount++;
        if (collectedJobs.length >= config.limit) break;
      }
    }

    pageIndex++;

    // Si moins de 25 résultats reçus, nous avons atteint la dernière page
    if (pageJobs.length < 25 || collectedJobs.length >= config.limit || pageIndex >= config.maxPages) {
      break;
    }

    // 5. Temporisation aléatoire anti-détection avant la page suivante
    currentStart += 25;
    const [minDelay, maxDelay] = config.delayRange;
    console.log(`[LinkedIn Scraper] ⏳ Pause anti-bot avant page suivante (start: ${currentStart})...`);
    await waitRandomDelay(minDelay, maxDelay);
  }

  console.log(`[LinkedIn Scraper] ✅ Terminé : ${collectedJobs.length} offres récupérées.`);
  return collectedJobs;
}

module.exports = {
  executeLinkedInScraping,
  buildLinkedInUrl,
  normalizeLinkedInConfig,
  cleanKeywords
};
