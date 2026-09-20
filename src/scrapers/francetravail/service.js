/**
 * Layer 3: Service Métier & Orchestration France Travail
 * Construit l'URL avec les paramètres natifs (motsCles, lieux, natureContrat, rayon, tri=1),
 * orchestre les requêtes et applique l'algorithme de retry heuristique sur mots-clés.
 */

const { fetchFranceTravailHtml } = require('./client');
const { parseFranceTravailHtml } = require('./parser');

const FT_BASE_URL = 'https://candidat.francetravail.fr/offres/recherche';

/**
 * Nettoie les mots-clés pour éviter les rejets de formulaire
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
 * Normalise l'objet de configuration avec les valeurs par défaut
 * @param {Object} rawConfig 
 * @returns {Object}
 */
function normalizeFranceTravailConfig(rawConfig = {}) {
  const motsCles = cleanSearchKeyword(rawConfig.motsCles || rawConfig.searchTerm || rawConfig.keywords || 'developpeur');
  const lieux = rawConfig.lieux ? String(rawConfig.lieux).trim() : (rawConfig.locationCode ? String(rawConfig.locationCode).trim() : '');
  const limit = Math.max(1, parseInt(rawConfig.limit, 10) || 25);
  const natureContrat = rawConfig.natureContrat ? String(rawConfig.natureContrat).trim() : null; // E1, E2, E3
  const rayon = rawConfig.rayon ? String(rawConfig.rayon).trim() : (lieux ? '10' : null);
  const tri = rawConfig.tri !== undefined ? String(rawConfig.tri) : '1'; // 1 = date de publication (plus récentes)

  return {
    motsCles,
    lieux,
    limit,
    natureContrat,
    rayon,
    tri,
    enableKeywordFallback: rawConfig.enableKeywordFallback !== false,
    timeoutMs: rawConfig.timeoutMs || 12000
  };
}

/**
 * Assemble l'URL complète avec ses paramètres de recherche
 * @param {Object} config - Configuration normalisée
 * @param {string} [queryOverride] - Remplacement ponctuel du mot-clé pour retry
 * @returns {string}
 */
function buildFranceTravailUrl(config, queryOverride = null) {
  const url = new URL(FT_BASE_URL);
  const query = queryOverride || config.motsCles;

  if (query) url.searchParams.append('motsCles', query);
  if (config.lieux) url.searchParams.append('lieux', config.lieux);
  if (config.natureContrat) url.searchParams.append('natureContrat', config.natureContrat);
  if (config.rayon) url.searchParams.append('rayon', config.rayon);
  if (config.tri) url.searchParams.append('tri', config.tri);

  return url.toString();
}

/**
 * Exécute la collecte France Travail avec retry heuristique si 0 résultat
 * @param {Object} rawConfig - Configuration de recherche
 * @returns {Promise<Array<Object>>} Liste des offres extraites
 */
async function executeFranceTravailScraping(rawConfig = {}) {
  const config = normalizeFranceTravailConfig(rawConfig);

  console.log(`[France Travail Scraper] 🚀 Lancement recherche: "${config.motsCles}" (Lieux: ${config.lieux || 'France entière'}, Contrat: ${config.natureContrat || 'Tous'}, Tri: ${config.tri})`);

  // Construction des requêtes candidates en cas de résultat vide (fallback heuristique)
  const words = config.motsCles.split(' ').filter(w => w.length > 2);
  const queriesToTry = config.enableKeywordFallback
    ? [
        config.motsCles,
        words.length > 1 ? words.slice(0, 2).join(' ') : null,
        words[0] || 'developpeur'
      ].filter(Boolean)
    : [config.motsCles];

  // Déduplication de la liste d'essais
  const uniqueQueries = [...new Set(queriesToTry)];

  for (const query of uniqueQueries) {
    const targetUrl = buildFranceTravailUrl(config, query);

    const transportResult = await fetchFranceTravailHtml(targetUrl, config.timeoutMs);

    // Arrêt gracieux en cas de blocage DataDome sans faire échouer les autres plateformes
    if (transportResult.isBlockedByDataDome) {
      console.warn(`[France Travail Scraper] ⚠️ Blocage DataDome détecté. La requête serveur n'a pas pu aboutir.`);
      break;
    }

    if (!transportResult.html) {
      continue;
    }

    const fallbackLoc = config.lieux ? `Département ${config.lieux}` : 'France';
    const jobs = parseFranceTravailHtml(transportResult.html, fallbackLoc, config.limit);

    if (jobs.length > 0) {
      console.log(`[France Travail Scraper] ✅ ${jobs.length} offres trouvées avec "${query}" (Lieu: ${config.lieux || 'Tout'}).`);
      return jobs;
    }
  }

  console.log(`[France Travail Scraper] ℹ️ Aucune offre trouvée pour les critères donnés.`);
  return [];
}

module.exports = {
  executeFranceTravailScraping,
  buildFranceTravailUrl,
  normalizeFranceTravailConfig,
  cleanSearchKeyword
};
