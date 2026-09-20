/**
 * Layer 1: Infrastructure & Transport HTTP pour LinkedIn
 * Gère les requêtes HTTP, l'émulation d'en-têtes navigateur, les délais aléatoires (jitter)
 * et la résilience face aux limites de taux (HTTP 429 / 403).
 */

const axios = require('axios');

// Pool de User-Agents desktop récents (2026 / Chromium / Firefox / Safari)
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:127.0) Gecko/20100101 Firefox/127.0',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15'
];

/**
 * Sélectionne un User-Agent aléatoire dans le pool
 * @returns {string}
 */
function getRandomUserAgent() {
  const index = Math.floor(Math.random() * USER_AGENTS.length);
  return USER_AGENTS[index];
}

/**
 * Génère les en-têtes HTTP réalistes conformes aux standards navigateurs
 * @returns {Record<string, string>}
 */
function buildBrowserHeaders() {
  return {
    'User-Agent': getRandomUserAgent(),
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
    'Sec-Ch-Ua': '"Not/A)Brand";v="8", "Chromium";v="126", "Google Chrome";v="126"',
    'Sec-Ch-Ua-Mobile': '?0',
    'Sec-Ch-Ua-Platform': '"Windows"',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
    'Upgrade-Insecure-Requests': '1',
    'Cache-Control': 'max-age=0'
  };
}

/**
 * Pause asynchrone avec délai aléatoire (anti-bot jitter)
 * @param {number} minMs - Délai minimum en ms
 * @param {number} maxMs - Délai maximum en ms
 * @returns {Promise<void>}
 */
function waitRandomDelay(minMs = 3000, maxMs = 6000) {
  const delay = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  return new Promise(resolve => setTimeout(resolve, delay));
}

/**
 * Effectue un appel GET résilient vers l'API publique LinkedIn Guest
 * @param {string} url - URL complète à interroger
 * @param {number} timeoutMs - Timeout en millisecondes
 * @returns {Promise<{ html: string | null, status: number, isRateLimited: boolean, error?: string }>}
 */
async function fetchLinkedInPageHtml(url, timeoutMs = 12000) {
  try {
    const response = await axios.get(url, {
      headers: buildBrowserHeaders(),
      timeout: timeoutMs,
      validateStatus: (status) => status >= 200 && status < 400
    });

    return {
      html: response.data || '',
      status: response.status,
      isRateLimited: false
    };
  } catch (error) {
    const status = error.response ? error.response.status : null;

    if (status === 429) {
      console.warn(`[LinkedIn Scraper - Client] ⚠️ HTTP 429 Too Many Requests détecté sur : ${url}`);
      return {
        html: null,
        status: 429,
        isRateLimited: true,
        error: 'Too Many Requests (429)'
      };
    }

    if (status === 403 || status === 999) {
      console.warn(`[LinkedIn Scraper - Client] ⚠️ HTTP ${status} (Challenge anti-bot détecté) sur : ${url}`);
      return {
        html: null,
        status,
        isRateLimited: true,
        error: `Anti-bot challenge (${status})`
      };
    }

    console.warn(`[LinkedIn Scraper - Client] Erreur réseau (${error.message}) sur : ${url}`);
    return {
      html: null,
      status: status || 500,
      isRateLimited: false,
      error: error.message
    };
  }
}

module.exports = {
  fetchLinkedInPageHtml,
  waitRandomDelay,
  buildBrowserHeaders,
  getRandomUserAgent
};
