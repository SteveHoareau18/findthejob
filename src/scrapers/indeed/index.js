/**
 * Layer 4: Façade Publique & Adaptateur Indeed
 * Point d'entrée unifié pour le scraping Indeed.
 * Supporte le JSON de configuration moderne, la rétrocompatibilité 100%
 * et fournit un générateur de script pour console de navigateur (contournement Cloudflare).
 */

const { executeIndeedScraping, buildIndeedUrl, normalizeIndeedConfig } = require('./service');
const { parseIndeedHtml } = require('./parser');

/**
 * Scrape Indeed avec l'objet de configuration JSON générique
 * @param {Object} config - Configuration détaillée
 * @returns {Promise<Array<Object>>}
 */
async function scrapeIndeedJobs(config = {}) {
  return executeIndeedScraping(config);
}

/**
 * Façade rétrocompatible : accepte soit un objet config, soit les arguments historiques (searchTerm, location, limit)
 * @param {string | Object} searchTermOrConfig 
 * @param {string} [location='France'] 
 * @param {number} [limit=25] 
 * @returns {Promise<Array<Object>>}
 */
async function scrapeIndeed(searchTermOrConfig, location = 'France', limit = 25) {
  if (typeof searchTermOrConfig === 'object' && searchTermOrConfig !== null) {
    return executeIndeedScraping(searchTermOrConfig);
  }

  return executeIndeedScraping({
    q: searchTermOrConfig,
    l: location || 'France',
    limit: limit || 25
  });
}

/**
 * Génère un snippet JavaScript autonome prêt à être collé dans la console
 * de https://fr.indeed.com pour contourner Cloudflare grâce aux cookies de session active.
 * @param {Object} config - Configuration de recherche
 * @returns {string} Code JS à exécuter dans la console
 */
function generateIndeedConsoleScript(config = {}) {
  const normConfig = normalizeIndeedConfig(config);
  const targetUrl = buildIndeedUrl(normConfig, normConfig.start || 0);

  return `
(async function scrapIndeedInBrowser() {
  const targetUrl = ${JSON.stringify(targetUrl)};
  console.log("🚀 Récupération Indeed via session navigateur sur :", targetUrl);
  try {
    const res = await fetch(targetUrl, {
      headers: {
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8"
      }
    });
    if (!res.ok) throw new Error("Erreur HTTP " + res.status + " (Vérifiez si Cloudflare bloque)");
    const htmlText = await res.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlText, "text/html");
    const jobCards = doc.querySelectorAll(".job_seen_beacon, [data-testid='job-card']");
    const jobs = [];
    jobCards.forEach(card => {
      const titleLink = card.querySelector("h2.jobTitle a, a[data-jk]");
      const jk = titleLink ? titleLink.getAttribute("data-jk") : card.getAttribute("data-jk");
      const titleElement = card.querySelector("h2.jobTitle span[title], h2.jobTitle");
      const companyElement = card.querySelector("[data-testid='company-name']");
      const locationElement = card.querySelector("[data-testid='text-location']");
      if (titleElement && jk) {
        jobs.push({
          id: jk,
          title: titleElement.innerText.trim(),
          company: companyElement ? companyElement.innerText.trim() : "Non renseigné",
          location: locationElement ? locationElement.innerText.trim() : ${JSON.stringify(normConfig.l || "France")},
          url: "https://fr.indeed.com/viewjob?jk=" + jk
        });
      }
    });
    console.log("✅ " + jobs.length + " offres récupérées !");
    console.table(jobs);
    return jobs;
  } catch (err) {
    console.error("Échec du scraping navigateur Indeed :", err);
  }
})();
  `.trim();
}

module.exports = {
  scrapeIndeed,
  scrapeIndeedJobs,
  buildIndeedUrl,
  parseIndeedHtml,
  normalizeIndeedConfig,
  generateIndeedConsoleScript
};
