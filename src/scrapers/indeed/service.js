/**
 * Layer 3: Service Métier & Orchestration Indeed
 * Construit les URLs ciblées (q, l, radius, fromage, start par pas de 10),
 * gère la pagination multi-pages, les temporisations anti-bot et le retry heuristique.
 */

const { fetchIndeedHtml, waitRandomDelay } = require('./client');
const { parseIndeedHtml } = require('./parser');

const INDEED_BASE_URL = 'https://fr.indeed.com/jobs';

/**
 * Nettoie les termes de recherche
 * @param {string} query 
 * @returns {string}
 */
function cleanSearchKeyword(query = '') {
  if (!query) return 'developpeur';
  return String(query)
    .replace(/[&/\\#,+()$~%.'":*?<>{}\n\r]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Normalise la configuration Indeed avec les valeurs par défaut
 * @param {Object} rawConfig 
 * @returns {Object}
 */
function normalizeIndeedConfig(rawConfig = {}) {
  const q = cleanSearchKeyword(rawConfig.q || rawConfig.searchTerm || rawConfig.keywords || 'developpeur');
  const l = (rawConfig.l || rawConfig.location || 'France').trim();
  const radius = rawConfig.radius ? parseInt(rawConfig.radius, 10) : null;
  const fromage = rawConfig.fromage ? parseInt(rawConfig.fromage, 10) : null;
  const start = Math.max(0, parseInt(rawConfig.start, 10) || 0);
  const limit = Math.max(1, parseInt(rawConfig.limit, 10) || 25);
  const maxPages = Math.max(1, parseInt(rawConfig.maxPages, 10) || Math.min(3, Math.ceil(limit / 10)));

  const delayRange = Array.isArray(rawConfig.delayRange) && rawConfig.delayRange.length === 2
    ? rawConfig.delayRange
    : [3000, 5000];

  return {
    q,
    l,
    radius,
    fromage,
    start,
    limit,
    maxPages,
    delayRange,
    enableFallbackRetry: rawConfig.enableFallbackRetry !== false,
    timeoutMs: rawConfig.timeoutMs || 12000
  };
}

/**
 * Construit l'URL complète pour Indeed
 * @param {Object} config - Configuration normalisée
 * @param {number} startOffset - Index de pagination (multiple de 10)
 * @param {string} [queryOverride] - Remplacement ponctuel du mot-clé
 * @returns {string}
 */
function buildIndeedUrl(config, startOffset = 0, queryOverride = null) {
  const url = new URL(INDEED_BASE_URL);
  const searchTerm = queryOverride || config.q;

  if (searchTerm) url.searchParams.append('q', searchTerm);
  if (config.l && config.l.toLowerCase() !== 'all') url.searchParams.append('l', config.l);
  if (config.radius) url.searchParams.append('radius', String(config.radius));
  if (config.fromage) url.searchParams.append('fromage', String(config.fromage));
  if (startOffset > 0) url.searchParams.append('start', String(startOffset));

  return url.toString();
}

/**
 * Exécute la collecte d'offres sur Indeed avec pagination (de 10 en 10)
 * et mécanisme de retry sur mot-clé de secours.
 * @param {Object} rawConfig - Configuration de recherche
 * @returns {Promise<Array<Object>>} Liste des offres consolidées
 */
async function executeIndeedScraping(rawConfig = {}) {
  const config = normalizeIndeedConfig(rawConfig);
  const collectedJobs = [];
  const seenIds = new Set();

  console.log(`[Indeed Scraper] 🚀 Recherche: "${config.q}" à "${config.l}" (start: ${config.start}, limit: ${config.limit}, fromage: ${config.fromage || 'tous'}, rayon: ${config.radius || 'auto'})`);

  let currentStart = config.start;
  let pageIndex = 0;

  while (pageIndex < config.maxPages && collectedJobs.length < config.limit) {
    const pageUrl = buildIndeedUrl(config, currentStart);
    const transportResult = await fetchIndeedHtml(pageUrl, config.timeoutMs);

    // Détection Cloudflare sans crash
    if (transportResult.isCloudflareChallenge) {
      console.warn(`[Indeed Scraper] ⚠️ Interruption sécurisée : défi Cloudflare rencontré. ${collectedJobs.length} offres conservées.`);
      break;
    }

    if (!transportResult.html) {
      break;
    }

    let pageJobs = parseIndeedHtml(transportResult.html, config.l, config.limit - collectedJobs.length);

    // Retry heuristique sur la première page si 0 résultat et terme composé
    if (pageJobs.length === 0 && pageIndex === 0 && config.enableFallbackRetry && config.q.includes(' ')) {
      const fallbackWord = config.q.split(' ')[0];
      if (fallbackWord && fallbackWord.length > 2) {
        const fallbackUrl = buildIndeedUrl(config, 0, fallbackWord);
        console.log(`[Indeed Scraper] 🔄 Retry avec mot-clé de secours : ${fallbackUrl}`);
        const fallbackRes = await fetchIndeedHtml(fallbackUrl, config.timeoutMs);
        if (fallbackRes.html && !fallbackRes.isCloudflareChallenge) {
          pageJobs = parseIndeedHtml(fallbackRes.html, config.l, config.limit);
        }
      }
    }

    if (pageJobs.length === 0) {
      break;
    }

    // Dédoublonnage et accumulation
    for (const job of pageJobs) {
      if (!seenIds.has(job.id)) {
        seenIds.add(job.id);
        collectedJobs.push(job);
        if (collectedJobs.length >= config.limit) break;
      }
    }

    pageIndex++;

    // Chez Indeed, une page contient généralement 10 à 15 annonces
    if (pageJobs.length < 5 || collectedJobs.length >= config.limit || pageIndex >= config.maxPages) {
      break;
    }

    // Pagination par pas de 10 avec temporisation
    currentStart += 10;
    const [minDelay, maxDelay] = config.delayRange;
    await waitRandomDelay(minDelay, maxDelay);
  }

  console.log(`[Indeed Scraper] ✅ ${collectedJobs.length} offres Indeed récupérées.`);
  return collectedJobs;
}

module.exports = {
  executeIndeedScraping,
  buildIndeedUrl,
  normalizeIndeedConfig,
  cleanSearchKeyword
};
