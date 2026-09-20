/**
 * Layer 1: Infrastructure & Transport HTTP pour Indeed
 * Transport hybride (curl.exe avec repli axios) avec en-têtes réalistes et détection Cloudflare.
 */

const { execFile } = require('child_process');
const axios = require('axios');

// En-têtes modernes pour simuler fidèlement un navigateur Chrome récent
const BROWSER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
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

/**
 * Pause asynchrone avec délai aléatoire (anti-bot jitter)
 * @param {number} minMs 
 * @param {number} maxMs 
 * @returns {Promise<void>}
 */
function waitRandomDelay(minMs = 3000, maxMs = 6000) {
  const delay = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  return new Promise(resolve => setTimeout(resolve, delay));
}

/**
 * Exécute une requête via curl.exe pour contourner les empreintes TLS JA3/JA4 de Node.js
 * @param {string} url 
 * @param {number} timeoutMs 
 * @returns {Promise<string>}
 */
function fetchWithCurl(url, timeoutMs = 12000) {
  return new Promise((resolve, reject) => {
    const args = [
      '-s',
      url,
      '-H', `User-Agent: ${BROWSER_HEADERS['User-Agent']}`,
      '-H', `Accept: ${BROWSER_HEADERS['Accept']}`,
      '-H', `Accept-Language: ${BROWSER_HEADERS['Accept-Language']}`,
      '-H', 'Sec-Fetch-Dest: document',
      '-H', 'Sec-Fetch-Mode: navigate',
      '-H', 'Sec-Fetch-Site: none',
      '--compressed'
    ];

    execFile('curl.exe', args, { maxBuffer: 15 * 1024 * 1024, timeout: timeoutMs }, (error, stdout) => {
      if (error) return reject(error);
      resolve(stdout || '');
    });
  });
}

/**
 * Analyse le HTML pour détecter un challenge ou blocage Cloudflare
 * @param {string} html 
 * @param {number} status 
 * @returns {boolean}
 */
function isCloudflareBlocked(html = '', status = 200) {
  if (status === 403 || status === 503) return true;
  if (!html || typeof html !== 'string') return false;

  const markers = [
    'cf-browser-verification',
    'challenge-platform',
    'cf-turnstile',
    'Just a moment...',
    'Vérifiez que vous êtes humain',
    'Attention Required! | Cloudflare'
  ];

  return markers.some(marker => html.includes(marker));
}

/**
 * Effectue un appel HTTP hybride vers Indeed (curl en priorité, axios en repli)
 * @param {string} url - URL cible
 * @param {number} timeoutMs - Timeout en ms
 * @returns {Promise<{ html: string | null, status: number, isCloudflareChallenge: boolean, error?: string }>}
 */
async function fetchIndeedHtml(url, timeoutMs = 12000) {
  // 1. Tentative prioritaire via curl.exe
  try {
    const html = await fetchWithCurl(url, timeoutMs);
    if (isCloudflareBlocked(html, 200)) {
      console.warn(`[Indeed Scraper - Client] ⚠️ Défi Cloudflare détecté via curl sur : ${url}`);
      return {
        html: null,
        status: 403,
        isCloudflareChallenge: true,
        error: 'Cloudflare challenge detected'
      };
    }

    if (html && html.length > 500) {
      return {
        html,
        status: 200,
        isCloudflareChallenge: false
      };
    }
  } catch (curlErr) {
    console.warn(`[Indeed Scraper - Client] Repli curl -> axios (${curlErr.message})`);
  }

  // 2. Repli via axios
  try {
    const response = await axios.get(url, {
      headers: BROWSER_HEADERS,
      timeout: timeoutMs,
      validateStatus: (status) => status >= 200 && status < 400
    });

    const html = response.data || '';
    if (isCloudflareBlocked(html, response.status)) {
      console.warn(`[Indeed Scraper - Client] ⚠️ Défi Cloudflare détecté via axios sur : ${url}`);
      return {
        html: null,
        status: response.status,
        isCloudflareChallenge: true,
        error: 'Cloudflare challenge detected'
      };
    }

    return {
      html,
      status: response.status,
      isCloudflareChallenge: false
    };
  } catch (axiosErr) {
    const status = axiosErr.response ? axiosErr.response.status : null;
    const isChallenge = isCloudflareBlocked(axiosErr.response?.data, status);

    if (isChallenge) {
      console.warn(`[Indeed Scraper - Client] ⚠️ Blocage Cloudflare (HTTP ${status}) sur Indeed.`);
      return {
        html: null,
        status: status || 403,
        isCloudflareChallenge: true,
        error: 'Cloudflare bot protection active'
      };
    }

    console.warn(`[Indeed Scraper - Client] Erreur réseau (${axiosErr.message})`);
    return {
      html: null,
      status: status || 500,
      isCloudflareChallenge: false,
      error: axiosErr.message
    };
  }
}

module.exports = {
  fetchIndeedHtml,
  fetchWithCurl,
  waitRandomDelay,
  isCloudflareBlocked,
  BROWSER_HEADERS
};
