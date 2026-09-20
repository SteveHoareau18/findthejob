/**
 * Layer 2: Parsing HTML et Extraction Multi-Stratégies pour Indeed
 * Stratégie 1 : Extraction haute fidélité via l'objet React JSON window.mosaic
 * Stratégie 2 : Extraction Cheerio résiliente ciblant les attributs data-testid et data-jk
 */

const cheerio = require('cheerio');

/**
 * Nettoie une chaîne de texte
 * @param {string} str 
 * @returns {string}
 */
function sanitizeText(str = '') {
  return String(str).replace(/\s+/g, ' ').trim();
}

/**
 * Formate le salaire extrait du modèle JSON Indeed
 * @param {Object} extractedSalary 
 * @param {Object} salarySnippet 
 * @returns {string}
 */
function formatSalary(extractedSalary, salarySnippet) {
  if (extractedSalary) {
    const { min, max, type } = extractedSalary;
    const unit = type === 'YEARLY' ? '€/an' : type === 'MONTHLY' ? '€/mois' : '€';
    if (min && max) return `${min}€ - ${max} ${unit}`;
    if (min || max) return `${min || max} ${unit}`;
  }
  if (salarySnippet && salarySnippet.text) {
    return sanitizeText(salarySnippet.text);
  }
  return 'Non communiqué';
}

/**
 * Parse le HTML retourné par fr.indeed.com/jobs
 * @param {string} htmlText - Contenu HTML de la page
 * @param {string} fallbackLocation - Localisation de repli
 * @param {number} limit - Nombre maximum d'offres
 * @returns {Array<Object>} Liste des offres normalisées
 */
function parseIndeedHtml(htmlText, fallbackLocation = 'France', limit = 25) {
  const jobs = [];
  if (!htmlText || typeof htmlText !== 'string') return jobs;

  const seenJks = new Set();

  // =========================================================================
  // STRATÉGIE 1 : Extraction JSON haute fidélité (window.mosaic)
  // =========================================================================
  try {
    const match = htmlText.match(/window\.mosaic\.providerData\["mosaic-provider-jobcards"\]\s*=\s*(\{.+?\});/);
    if (match && match[1]) {
      const data = JSON.parse(match[1]);
      const results = data.metaData?.mosaicProviderJobCardsModel?.results || [];

      for (const r of results) {
        if (jobs.length >= limit) break;
        const jk = r.jobkey;
        if (!jk || seenJks.has(jk)) continue;

        const title = sanitizeText(r.displayTitle || r.title);
        if (!title) continue;

        const company = sanitizeText(r.company || r.companyName || 'Recruteur Indeed');
        const loc = sanitizeText(r.formattedLocation || fallbackLocation);
        const salary = formatSalary(r.extractedSalary, r.salarySnippet);

        let snippet = '';
        if (r.snippet) {
          try {
            snippet = cheerio.load(`<div>${r.snippet}</div>`).text().trim();
          } catch {
            snippet = sanitizeText(r.snippet);
          }
        }

        const contractType = Array.isArray(r.jobTypes) && r.jobTypes.length > 0
          ? r.jobTypes.join(' / ')
          : 'CDI / CDD';

        seenJks.add(jk);
        jobs.push({
          id: `indeed-${jk}`,
          title,
          company,
          location: loc,
          contractType,
          salary,
          description: snippet || `${title} chez ${company} à ${loc}. Offre consultable sur Indeed.`,
          tags: ['Indeed', loc],
          url: `https://fr.indeed.com/viewjob?jk=${jk}`,
          source: 'Indeed',
          date: sanitizeText(r.formattedRelativeTime || 'Récemment')
        });
      }
    }
  } catch (err) {
    // Poursuite vers la stratégie 2 en cas d'absence ou d'évolution du format JSON
  }

  // Si la stratégie 1 a extrait suffisamment d'offres, retourner directement
  if (jobs.length >= limit) {
    return jobs;
  }

  // =========================================================================
  // STRATÉGIE 2 : Extraction DOM Cheerio (attributs sémantiques data-testid & data-jk)
  // =========================================================================
  try {
    const $ = cheerio.load(htmlText);
    const cards = $('[data-jk], .job_seen_beacon, div.cardOutline');

    cards.each((_, el) => {
      if (jobs.length >= limit) return false;

      const card = $(el).closest('.job_seen_beacon, div.cardOutline, li');
      const target = card.length ? card : $(el);

      // Job Key
      const jk = target.find('a[data-jk]').attr('data-jk') || target.attr('data-jk') || $(el).attr('data-jk');
      if (!jk || seenJks.has(jk)) return;

      // Titre
      const titleEl = target.find('h2.jobTitle span[title], h2.jobTitle a, h2.jobTitle, a[data-jk]').first();
      const title = sanitizeText(titleEl.text());
      if (!title) return;

      // Entreprise
      const companyEl = target.find('[data-testid="company-name"], span.companyName, .company_location .companyName').first();
      const company = sanitizeText(companyEl.text()) || 'Recruteur Indeed';

      // Localisation
      const locEl = target.find('[data-testid="text-location"], .companyLocation, div.company_location [data-testid="text-location"]').first();
      const loc = sanitizeText(locEl.text()) || fallbackLocation;

      // Description
      const snippetEl = target.find('.job-snippet, [data-testid="job-snippet"]').first();
      const snippet = sanitizeText(snippetEl.text());

      seenJks.add(jk);
      jobs.push({
        id: `indeed-${jk}`,
        title,
        company,
        location: loc,
        contractType: 'CDI / CDD',
        salary: 'Non communiqué',
        description: snippet || `${title} chez ${company} à ${loc}. Offre consultable sur Indeed.`,
        tags: ['Indeed', loc],
        url: `https://fr.indeed.com/viewjob?jk=${jk}`,
        source: 'Indeed',
        date: 'Récemment'
      });
    });
  } catch (domErr) {
    console.warn(`[Indeed Scraper - Parser] Erreur Cheerio DOM : ${domErr.message}`);
  }

  return jobs;
}

module.exports = {
  parseIndeedHtml,
  formatSalary,
  sanitizeText
};
