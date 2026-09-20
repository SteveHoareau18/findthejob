/**
 * Layer 2: Parsing HTML et Extraction de Données France Travail
 * Utilise Cheerio pour extraire et normaliser les cartes d'offres de candidat.francetravail.fr
 */

const cheerio = require('cheerio');

/**
 * Nettoie une chaîne de texte des espaces multiples et retours à la ligne
 * @param {string} str 
 * @returns {string}
 */
function sanitizeText(str = '') {
  return String(str).replace(/\s+/g, ' ').trim();
}

/**
 * Parse le HTML brut retourné par /offres/recherche
 * @param {string} htmlText - Le contenu HTML de la page
 * @param {string} fallbackLocation - Localisation de repli
 * @param {number} limit - Nombre maximum d'offres à extraire
 * @returns {Array<Object>} Liste des offres normalisées
 */
function parseFranceTravailHtml(htmlText, fallbackLocation = 'France', limit = 25) {
  if (!htmlText || typeof htmlText !== 'string') {
    return [];
  }

  const $ = cheerio.load(htmlText);
  const jobs = [];

  // Sélecteur résilient pour cibler les conteneurs d'offres
  const cards = $('li[data-id-offre], [data-id-offre], li.result');

  cards.each((_, el) => {
    if (jobs.length >= limit) return false;

    // 1. Identifiant de l'offre
    const rawId = $(el).attr('data-id-offre') || $(el).attr('id');
    const idOffre = rawId ? rawId.replace(/^ft-/, '') : `gen-${jobs.length}`;

    // 2. Intitulé du poste
    const titleEl = $(el).find('.media-heading, .media-heading-title, .titre, h2').first();
    const title = sanitizeText(titleEl.text());
    if (!title) return; // Ignorer les éléments vides

    // 3. Entreprise et sous-texte
    const subtextEl = $(el).find('.subtext, .entreprise, .nom-entreprise').first();
    const subtext = sanitizeText(subtextEl.text());
    let company = 'Entreprise France Travail';
    let extractedLoc = '';

    if (subtext) {
      const parts = subtext.split('-').map(p => p.trim());
      if (parts.length >= 2) {
        company = parts[0];
        extractedLoc = parts.slice(1).join(' - ');
      } else {
        company = subtext;
      }
    }

    // 4. Localisation spécifique si présente
    const locEl = $(el).find('span[itemprop="addressLocality"], .lieux, .localisation').first();
    const specificLoc = sanitizeText(locEl.text());
    const finalLocation = specificLoc || extractedLoc || fallbackLocation;

    // 5. Type de contrat
    const contractEl = $(el).find('.contrat, .type-contrat').first();
    const contractText = sanitizeText(contractEl.text());
    const contractType = contractText || 'CDI / CDD';

    // 6. Description / extrait
    const descEl = $(el).find('.description').first();
    const description = sanitizeText(descEl.text()) || `${title} chez ${company} à ${finalLocation}. Offre consultable sur France Travail.`;

    // 7. URL canonique propre
    const linkEl = $(el).find('a[href*="/offres/recherche/detail/"]').first();
    const href = linkEl.attr('href');
    const cleanUrl = href 
      ? (href.startsWith('http') ? href : `https://candidat.francetravail.fr${href}`)
      : `https://candidat.francetravail.fr/offres/recherche/detail/${idOffre}`;

    // 8. Normalisation DTO
    jobs.push({
      id: `ft-${idOffre}`,
      title,
      company: company || 'Entreprise France Travail',
      location: finalLocation,
      contractType,
      salary: 'Non communiqué',
      description,
      tags: ['France Travail', finalLocation],
      url: cleanUrl,
      source: 'France Travail',
      date: 'Récemment'
    });
  });

  return jobs;
}

module.exports = {
  parseFranceTravailHtml,
  sanitizeText
};
