/**
 * Utilitaire de gestion des erreurs de quota et de rate limit Groq AI (FindTheJob 2026)
 * Détecte les dépassements de tokens/requêtes (TPM, RPM, TPD, HTTP 429)
 * et extrait le délai d'attente requis pour retenter.
 */

/**
 * Détermine si une erreur correspond à un épuisement de tokens ou rate limit Groq
 * @param {any} err Erreur ou objet de réponse
 * @returns {boolean}
 */
function isGroqRateLimitError(err) {
  if (!err) return false;
  if (err.isGroqRateLimit) return true;
  if (err.status === 429 || err.statusCode === 429) return true;
  if (err.name === 'RateLimitError') return true;

  const msg = (
    typeof err === 'string'
      ? err
      : `${err.message || ''} ${err.error || ''} ${JSON.stringify(err.error || '')}`
  ).toLowerCase();

  return (
    msg.includes('rate limit') ||
    msg.includes('rate_limit') ||
    msg.includes('tokens per minute') ||
    msg.includes('tokens per day') ||
    msg.includes('requests per minute') ||
    msg.includes('tpm') ||
    msg.includes('rpm') ||
    msg.includes('tpd') ||
    msg.includes('quota') ||
    msg.includes('token groq') ||
    msg.includes('tokens groq') ||
    msg.includes('too many requests') ||
    msg.includes('try again in') ||
    (msg.includes('429') && (msg.includes('groq') || msg.includes('limit')))
  );
}

/**
 * Convertit une chaîne de durée (ex: "1m23.45s", "42s", "2m", "1h30m", "10.5s") en secondes entières
 * @param {string} str Chaîne brute de durée
 * @returns {number} Nombre de secondes
 */
function parseDurationStringToSeconds(str) {
  if (!str || typeof str !== 'string') return 0;
  const s = str.trim().toLowerCase();

  let hours = 0;
  let minutes = 0;
  let seconds = 0;

  const msMatch = s.match(/(\d+(?:\.\d+)?)\s*ms/);
  if (msMatch) seconds += parseFloat(msMatch[1]) / 1000;

  const hMatch = s.match(/(\d+(?:\.\d+)?)\s*h/);
  if (hMatch) hours = parseFloat(hMatch[1]);

  const mMatch = s.match(/(\d+(?:\.\d+)?)\s*m(?!s)/);
  if (mMatch) minutes = parseFloat(mMatch[1]);

  const sMatch = s.match(/(\d+(?:\.\d+)?)\s*(?:s|sec)(?!ms)/);
  if (sMatch && !msMatch) seconds += parseFloat(sMatch[1]);

  // Si c'est un nombre isolé sans unité (ex: "45" ou "45.5")
  if (!hMatch && !mMatch && !sMatch && !msMatch && /^\d+(?:\.\d+)?$/.test(s)) {
    const num = parseFloat(s);
    if (!isNaN(num)) seconds = num;
  }

  const total = Math.ceil(hours * 3600 + minutes * 60 + seconds);
  return total > 0 ? total : 0;
}

/**
 * Formate un nombre de secondes en texte français naturel
 * Ex: 84 -> "1 min 24 s", 45 -> "45 s", 3600 -> "1 h"
 * @param {number} totalSeconds
 * @returns {string}
 */
function formatDurationFr(totalSeconds) {
  const sec = Math.max(0, Math.ceil(Number(totalSeconds) || 0));
  if (sec <= 0) return 'quelques secondes';

  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;

  const parts = [];
  if (h > 0) parts.push(`${h} h`);
  if (m > 0) parts.push(`${m} min`);
  if (s > 0 || parts.length === 0) parts.push(`${s} s`);

  return parts.join(' ');
}

/**
 * Analyse une erreur ou un message pour extraire les secondes et la durée formatée
 * @param {any} errorOrMessage
 * @param {Object} [headers]
 * @returns {{ totalSeconds: number, formatted: string }}
 */
function parseGroqWaitTime(errorOrMessage, headers = null) {
  let text = '';
  if (typeof errorOrMessage === 'string') {
    text = errorOrMessage;
  } else if (errorOrMessage && typeof errorOrMessage === 'object') {
    text = `${errorOrMessage.message || ''} ${errorOrMessage.error?.message || ''} ${typeof errorOrMessage.error === 'string' ? errorOrMessage.error : ''}`;
    if (!headers && errorOrMessage.headers) {
      headers = errorOrMessage.headers;
    }
  }

  let totalSeconds = 0;

  // 1. Vérification dans les headers HTTP de réponse (retry-after, x-ratelimit-reset-tokens, etc.)
  if (headers) {
    const getHeader = (key) => {
      if (typeof headers.get === 'function') return headers.get(key);
      return headers[key] || headers[key.toLowerCase()];
    };

    const retryAfter = getHeader('retry-after');
    if (retryAfter && !isNaN(Number(retryAfter))) {
      totalSeconds = Math.ceil(Number(retryAfter));
    }

    const resetTokens = getHeader('x-ratelimit-reset-tokens');
    if (!totalSeconds && resetTokens) {
      totalSeconds = parseDurationStringToSeconds(resetTokens);
    }

    const resetRequests = getHeader('x-ratelimit-reset-requests');
    if (!totalSeconds && resetRequests) {
      totalSeconds = parseDurationStringToSeconds(resetRequests);
    }
  }

  // 2. Recherche dans le texte du message ("Please try again in 1m23.45s", "dans 45s", etc.)
  if (!totalSeconds && text) {
    const match = text.match(/(?:try again in|retente[rz] dans|r[ée]essayer dans|attendre|in)\s+([0-9]+(?:\.[0-9]+)?[hms\s\.\d]+)/i);
    if (match && match[1]) {
      totalSeconds = parseDurationStringToSeconds(match[1]);
    }
  }

  // 3. Délai par défaut si aucun chiffre n'a pu être extrait (60 secondes)
  if (!totalSeconds || totalSeconds < 1) {
    totalSeconds = 60;
  }

  return {
    totalSeconds,
    formatted: formatDurationFr(totalSeconds)
  };
}

/**
 * Crée un payload JSON d'erreur standardisé pour l'épuisement des tokens Groq
 * @param {any} errorOrMessage
 * @param {string} [actionDesc]
 * @returns {Object}
 */
function createGroqRateLimitPayload(errorOrMessage, actionDesc = '') {
  const waitInfo = parseGroqWaitTime(errorOrMessage);
  const actionText = actionDesc ? ` pour ${actionDesc}` : '';
  const message = `Il n'y a plus assez de tokens Groq disponibles${actionText} pour le moment. Veuillez retenter dans ${waitInfo.formatted}.`;

  return {
    isGroqRateLimit: true,
    retryAfterSeconds: waitInfo.totalSeconds,
    retryAfterFormatted: waitInfo.formatted,
    message
  };
}

module.exports = {
  isGroqRateLimitError,
  parseDurationStringToSeconds,
  formatDurationFr,
  parseGroqWaitTime,
  createGroqRateLimitPayload
};
