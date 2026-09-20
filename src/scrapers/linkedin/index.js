/**
 * Layer 4: Façade Publique & Adaptateur LinkedIn
 * Point d'entrée unifié pour le scraping LinkedIn.
 * Fournit une API générique acceptant un objet de configuration JSON
 * tout en conservant une compatibilité ascendante complète avec l'ancienne signature fonctionnelle.
 */

const { executeLinkedInScraping, buildLinkedInUrl, normalizeLinkedInConfig } = require('./service');
const { parseLinkedInHtml, cleanLinkedInUrl } = require('./parser');

/**
 * Scrape LinkedIn avec l'objet de configuration JSON générique
 * @param {Object} config - Configuration détaillée
 * @returns {Promise<Array<Object>>}
 */
async function scrapeLinkedInJobs(config = {}) {
  return executeLinkedInScraping(config);
}

/**
 * Façade rétrocompatible : accepte soit un objet config, soit les arguments historiques (searchTerm, location, limit)
 * @param {string | Object} searchTermOrConfig 
 * @param {string} [location='France'] 
 * @param {number} [limit=25] 
 * @returns {Promise<Array<Object>>}
 */
async function scrapeLinkedIn(searchTermOrConfig, location = 'France', limit = 25) {
  if (typeof searchTermOrConfig === 'object' && searchTermOrConfig !== null) {
    return executeLinkedInScraping(searchTermOrConfig);
  }

  return executeLinkedInScraping({
    keywords: searchTermOrConfig,
    location: location || 'France',
    limit: limit || 25,
    start: 0
  });
}

module.exports = {
  scrapeLinkedIn,
  scrapeLinkedInJobs,
  buildLinkedInUrl,
  parseLinkedInHtml,
  cleanLinkedInUrl,
  normalizeLinkedInConfig
};
