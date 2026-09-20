/**
 * Layer 2: Parsing HTML et Extraction de Données LinkedIn
 * Utilise Cheerio pour parser le fragment HTML renvoyé par l'endpoint guest de LinkedIn.
 * Extrait les données avec tolérance aux variations de classes et nettoie les URLs de tracking.
 */

const cheerio = require('cheerio');

/**
 * Fonction de hachage déterministe pour générer un identifiant stable
 * @param {string} str 
 * @returns {number}
 */
function hashString(str = '') {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Nettoie une URL LinkedIn en supprimant les paramètres de tracking (?trackingId, refId, etc.)
 * @param {string} rawUrl 
 * @returns {string}
 */
function cleanLinkedInUrl(rawUrl) {
  if (!rawUrl) return 'https://www.linkedin.com/jobs';
  try {
    const parsed = new URL(rawUrl);
    return `${parsed.origin}${parsed.pathname}`;
  } catch {
    return rawUrl.split('?')[0];
  }
}

/**
 * Parse le HTML brut retourné par /jobs-guest/jobs/api/seeMoreJobPostings/search
 * @param {string} htmlText - Le HTML de la réponse
 * @param {string} defaultLocation - Lieu par défaut si non spécifié dans l'offre
 * @returns {Array<Object>} Liste des offres d'emploi normalisées
 */
function parseLinkedInHtml(htmlText, defaultLocation = 'France') {
  if (!htmlText || typeof htmlText !== 'string') {
    return [];
  }

  const $ = cheerio.load(htmlText);
  const jobs = [];

  // LinkedIn encapsule chaque carte dans un <li> ou un conteneur .base-card
  const cards = $('li, .base-search-card, .job-search-card');

  cards.each((_, el) => {
    // 1. Titre du poste
    const titleEl = $(el).find('.base-search-card__title, .job-search-card__title, h3').first();
    const title = titleEl.text().replace(/\s+/g, ' ').trim();
    if (!title) return; // Ignorer les éléments non pertinents

    // 2. Entreprise
    const companyEl = $(el).find('.base-search-card__subtitle, .job-search-card__subtitle, h4, a[data-tracking-control-name*="subtitle"]').first();
    const company = companyEl.text().replace(/\s+/g, ' ').trim() || 'Entreprise sur LinkedIn';

    // 3. Localisation
    const locationEl = $(el).find('.job-search-card__location, .base-search-card__metadata span').first();
    const jobLocation = locationEl.text().replace(/\s+/g, ' ').trim() || defaultLocation;

    // 4. Lien de l'offre
    const linkEl = $(el).find('a.base-card__full-link, a.job-search-card__url-link, a[href*="/jobs/view/"]').first();
    const rawLink = linkEl.attr('href') || '';
    const cleanUrl = cleanLinkedInUrl(rawLink);

    // 5. Date de publication (attribut datetime prioritaire pour format standardisé)
    const timeEl = $(el).find('time').first();
    const isoDate = timeEl.attr('datetime');
    const displayDate = timeEl.text().replace(/\s+/g, ' ').trim();
    const date = isoDate || displayDate || 'Récemment';

    // 6. Génération d'un ID déterministe
    const uniqueKey = cleanUrl !== 'https://www.linkedin.com/jobs' ? cleanUrl : `${title}|${company}|${jobLocation}`;
    const id = `li-${hashString(uniqueKey)}`;

    // 7. Normalisation de l'objet offre
    jobs.push({
      id,
      title,
      company,
      location: jobLocation,
      contractType: 'CDI / Plein temps',
      salary: 'Selon profil',
      description: `${title} chez ${company} à ${jobLocation}. Offre consultable sur LinkedIn.`,
      tags: ['LinkedIn', defaultLocation],
      url: cleanUrl,
      source: 'LinkedIn',
      date
    });
  });

  return jobs;
}

module.exports = {
  parseLinkedInHtml,
  cleanLinkedInUrl,
  hashString
};
