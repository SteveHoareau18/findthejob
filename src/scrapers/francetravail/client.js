/**
 * Layer 1: Infrastructure & Transport HTTP pour France Travail
 * Gère les requêtes HTTP avec en-têtes réalistes et détection spécifique de la protection DataDome.
 */

const axios = require('axios');

// En-têtes réalistes pour simuler une navigation légitime
const BROWSER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
  'Sec-Ch-Ua': '"Not/A)Brand";v="8", "Chromium";v="126", "Google Chrome";v="126"',
  'Sec-Ch-Ua-Mobile': '?0',
  'Sec-Ch-Ua-Platform': '"Windows"',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'same-origin',
  'Sec-Fetch-User': '?1',
  'Upgrade-Insecure-Requests': '1',
  'Referer': 'https://candidat.francetravail.fr/offres/recherche',
  'Cache-Control': 'max-age=0'
};

/**
 * Effectue un appel HTTP GET vers candidat.francetravail.fr
 * avec interception robuste des challenges DataDome (HTTP 403).
 * @param {string} url - URL complète à requêter
 * @param {number} timeoutMs - Timeout en millisecondes
 * @returns {Promise<{ html: string | null, status: number, isBlockedByDataDome: boolean, error?: string }>}
 */
async function fetchFranceTravailHtml(url, timeoutMs = 12000) {
  try {
    const response = await axios.get(url, {
      headers: BROWSER_HEADERS,
      timeout: timeoutMs,
      validateStatus: (status) => status >= 200 && status < 400
    });

    const html = response.data || '';
    
    // Détection de challenge DataDome intégré dans la page 200 (page de captcha)
    if (typeof html === 'string' && (html.includes('datadome') || html.includes('geo.captcha-delivery.com'))) {
      console.warn(`[France Travail Scraper - Client] ⚠️ Challenge DataDome détecté dans le HTML.`);
      return {
        html: null,
        status: 403,
        isBlockedByDataDome: true,
        error: 'DataDome captcha challenge'
      };
    }

    return {
      html,
      status: response.status,
      isBlockedByDataDome: false
    };
  } catch (error) {
    const status = error.response ? error.response.status : null;
    const responseHeaders = error.response ? error.response.headers : {};
    const isDataDomeHeader = Boolean(responseHeaders['x-datadome'] || responseHeaders['datadome']);

    if (status === 403 || isDataDomeHeader) {
      console.warn(`[France Travail Scraper - Client] ⚠️ Blocage DataDome détecté (HTTP ${status}) sur candidat.francetravail.fr`);
      return {
        html: null,
        status: status || 403,
        isBlockedByDataDome: true,
        error: 'DataDome anti-bot protection active'
      };
    }

    if (status === 429) {
      console.warn(`[France Travail Scraper - Client] ⚠️ HTTP 429 Too Many Requests`);
      return {
        html: null,
        status: 429,
        isBlockedByDataDome: false,
        error: 'Rate limited (429)'
      };
    }

    console.warn(`[France Travail Scraper - Client] Erreur réseau (${error.message}) sur : ${url}`);
    return {
      html: null,
      status: status || 500,
      isBlockedByDataDome: false,
      error: error.message
    };
  }
}

module.exports = {
  fetchFranceTravailHtml,
  BROWSER_HEADERS
};
