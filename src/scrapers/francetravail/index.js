/**
 * Layer 4: Façade Publique & Adaptateur France Travail
 * Point d'entrée unifié pour le scraping France Travail.
 * Supporte le JSON de configuration moderne, la rétrocompatibilité 100%
 * et fournit un générateur de script pour console de navigateur (contournement DataDome).
 */

const { executeFranceTravailScraping, buildFranceTravailUrl, normalizeFranceTravailConfig } = require('./service');
const { parseFranceTravailHtml } = require('./parser');

/**
 * Scrape France Travail avec l'objet de configuration JSON générique
 * @param {Object} config - Configuration détaillée
 * @returns {Promise<Array<Object>>}
 */
async function scrapeFranceTravailJobs(config = {}) {
  return executeFranceTravailScraping(config);
}

/**
 * Façade rétrocompatible : accepte soit un objet config, soit les arguments historiques (searchTerm, locationCode, limit)
 * @param {string | Object} searchTermOrConfig 
 * @param {string} [locationCode=''] 
 * @param {number} [limit=25] 
 * @returns {Promise<Array<Object>>}
 */
async function scrapeFranceTravail(searchTermOrConfig, locationCode = '', limit = 25) {
  if (typeof searchTermOrConfig === 'object' && searchTermOrConfig !== null) {
    return executeFranceTravailScraping(searchTermOrConfig);
  }

  return executeFranceTravailScraping({
    motsCles: searchTermOrConfig,
    lieux: locationCode || '',
    limit: limit || 25
  });
}

/**
 * Génère un snippet JavaScript autonome prêt à être collé dans la console
 * du navigateur sur https://candidat.francetravail.fr pour contourner DataDome avec la session active.
 * @param {Object} config - Configuration de recherche
 * @returns {string} Code JS à exécuter dans la console
 */
function generateBrowserConsoleScript(config = {}) {
  const normConfig = normalizeFranceTravailConfig(config);
  const targetUrl = buildFranceTravailUrl(normConfig);

  return `
(async function scrapFranceTravailInBrowser() {
  const targetUrl = ${JSON.stringify(targetUrl)};
  console.log("🚀 Récupération France Travail via session navigateur sur :", targetUrl);
  try {
    const res = await fetch(targetUrl);
    if (!res.ok) throw new Error("Erreur HTTP " + res.status);
    const htmlText = await res.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlText, "text/html");
    const cards = doc.querySelectorAll("li[data-id-offre], [data-id-offre], li.result");
    const jobs = [];
    cards.forEach(card => {
      const id = card.getAttribute("data-id-offre") || card.getAttribute("id");
      const titleEl = card.querySelector(".media-heading, .media-heading-title, .titre, h2");
      const subtextEl = card.querySelector(".subtext, .entreprise, .nom-entreprise");
      const locEl = card.querySelector("span[itemprop='addressLocality'], .lieux, .localisation");
      const contractEl = card.querySelector(".contrat, .type-contrat");
      if (titleEl && id) {
        jobs.push({
          id: id.replace(/^ft-/, ""),
          title: titleEl.innerText.replace(/\\s+/g, " ").trim(),
          company: subtextEl ? subtextEl.innerText.trim() : "Entreprise France Travail",
          location: locEl ? locEl.innerText.trim() : ${JSON.stringify(normConfig.lieux || "France")},
          contract: contractEl ? contractEl.innerText.trim() : "Non renseigné",
          url: "https://candidat.francetravail.fr/offres/recherche/detail/" + id.replace(/^ft-/, "")
        });
      }
    });
    console.log("✅ " + jobs.length + " offres récupérées !");
    console.table(jobs);
    return jobs;
  } catch (err) {
    console.error("Échec du scraping navigateur :", err);
  }
})();
  `.trim();
}

module.exports = {
  scrapeFranceTravail,
  scrapeFranceTravailJobs,
  buildFranceTravailUrl,
  parseFranceTravailHtml,
  normalizeFranceTravailConfig,
  generateBrowserConsoleScript
};
