const assert = require('assert');
const {
  isGroqRateLimitError,
  parseDurationStringToSeconds,
  formatDurationFr,
  parseGroqWaitTime,
  createGroqRateLimitPayload
} = require('../src/utils/groqErrorHandler');

console.log('🧪 Lancement des tests de détection & formatage des limites de tokens Groq...\n');

// 1. Tests de détection isGroqRateLimitError
console.log('--- 1. Détection isGroqRateLimitError ---');
assert.strictEqual(
  isGroqRateLimitError({ status: 429, message: 'Too many requests' }),
  true,
  'Status 429 doit être détecté comme rate limit'
);

assert.strictEqual(
  isGroqRateLimitError(new Error('Rate limit reached for model on tokens per minute (TPM). Please try again in 1m23s')),
  true,
  'Message avec TPM doit être détecté'
);

assert.strictEqual(
  isGroqRateLimitError({ message: 'Rate limit reached on requests per minute (RPM)' }),
  true,
  'Message avec RPM doit être détecté'
);

assert.strictEqual(
  isGroqRateLimitError({ message: 'tokens per day (TPD) quota exceeded' }),
  true,
  'Message avec TPD doit être détecté'
);

assert.strictEqual(
  isGroqRateLimitError({ isGroqRateLimit: true }),
  true,
  'Propriété isGroqRateLimit: true doit être reconnue'
);

assert.strictEqual(
  isGroqRateLimitError(new Error('Invalid credentials / 401')),
  false,
  'Une erreur 401 ne doit PAS être un rate limit'
);

assert.strictEqual(
  isGroqRateLimitError(new Error('Network timeout')),
  false,
  'Un timeout ne doit PAS être un rate limit'
);
console.log('✓ Tous les tests de détection isGroqRateLimitError sont passés.');

// 2. Tests de parsing de durées
console.log('\n--- 2. Parsing parseDurationStringToSeconds ---');
assert.strictEqual(parseDurationStringToSeconds('1m23.45s'), 84, '1m23.45s doit valoir 84s');
assert.strictEqual(parseDurationStringToSeconds('45s'), 45, '45s doit valoir 45s');
assert.strictEqual(parseDurationStringToSeconds('2m'), 120, '2m doit valoir 120s');
assert.strictEqual(parseDurationStringToSeconds('1h15m30s'), 4530, '1h15m30s doit valoir 4530s');
assert.strictEqual(parseDurationStringToSeconds('500ms'), 1, '500ms renvoie 1s arrondie au plafond');
console.log('✓ Tous les tests de parseDurationStringToSeconds sont passés.');

// 3. Tests de formatage en français
console.log('\n--- 3. Formatage formatDurationFr ---');
assert.strictEqual(formatDurationFr(84), '1 min 24 s');
assert.strictEqual(formatDurationFr(45), '45 s');
assert.strictEqual(formatDurationFr(120), '2 min');
assert.strictEqual(formatDurationFr(3600), '1 h');
assert.strictEqual(formatDurationFr(3665), '1 h 1 min 5 s');
assert.strictEqual(formatDurationFr(0), 'quelques secondes');
console.log('✓ Tous les tests de formatDurationFr sont passés.');

// 4. Tests de parseGroqWaitTime avec différents formats Groq réels
console.log('\n--- 4. Extraction temps d\'attente parseGroqWaitTime ---');
const groqTpmError = 'Rate limit reached for model `llama-3.3-70b-versatile` on tokens per minute (TPM): Limit 6000, Used 5800, Requested 1200. Please try again in 1m23.45s.';
const wait1 = parseGroqWaitTime(groqTpmError);
assert.strictEqual(wait1.totalSeconds, 84);
assert.strictEqual(wait1.formatted, '1 min 24 s');
console.log(`✓ Erreur TPM Groq parsée avec succès : ${wait1.formatted} (${wait1.totalSeconds}s)`);

const groqRpmError = 'Rate limit reached on requests per minute (RPM). Please try again in 8.35s.';
const wait2 = parseGroqWaitTime(groqRpmError);
assert.strictEqual(wait2.totalSeconds, 9);
assert.strictEqual(wait2.formatted, '9 s');
console.log(`✓ Erreur RPM Groq parsée avec succès : ${wait2.formatted} (${wait2.totalSeconds}s)`);

const groqHeaderError = {
  status: 429,
  message: 'Rate limit reached',
  headers: {
    'retry-after': '42'
  }
};
const wait3 = parseGroqWaitTime(groqHeaderError);
assert.strictEqual(wait3.totalSeconds, 42);
assert.strictEqual(wait3.formatted, '42 s');
console.log(`✓ Header retry-after parsé avec succès : ${wait3.formatted} (${wait3.totalSeconds}s)`);

const groqTokensResetHeader = {
  status: 429,
  message: 'Rate limit reached',
  headers: {
    'x-ratelimit-reset-tokens': '2m15s'
  }
};
const wait4 = parseGroqWaitTime(groqTokensResetHeader);
assert.strictEqual(wait4.totalSeconds, 135);
assert.strictEqual(wait4.formatted, '2 min 15 s');
console.log(`✓ Header x-ratelimit-reset-tokens parsé avec succès : ${wait4.formatted} (${wait4.totalSeconds}s)`);

// 5. Tests de createGroqRateLimitPayload
console.log('\n--- 5. Payload structuré createGroqRateLimitPayload ---');
const payload = createGroqRateLimitPayload(groqTpmError, "l'analyse du CV");
assert.strictEqual(payload.isGroqRateLimit, true);
assert.strictEqual(payload.retryAfterSeconds, 84);
assert.strictEqual(payload.retryAfterFormatted, '1 min 24 s');
assert.ok(payload.message.includes('plus assez de tokens Groq'));
assert.ok(payload.message.includes('1 min 24 s'));
console.log(`✓ Message généré : "${payload.message}"`);

console.log('\n🎉 TOUS LES TESTS DE GESTION DU RATE LIMIT GROQ SONT PASSÉS AVEC SUCCÈS !\n');
