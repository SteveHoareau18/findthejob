const assert = require('assert');

console.log('🧪 Test de démarrage et cohérence Express...');

try {
  const { isGroqRateLimitError, parseGroqWaitTime } = require('../src/utils/groqErrorHandler');
  const { adaptCvCriteriaWithGroq } = require('../src/cvGroqService');
  const { generateArgumentaire } = require('../src/services/argumentaireService');
  const { analyzeJobAndGetTips } = require('../src/jobAnalysisService');

  console.log('✓ Tous les modules métier et utilitaires se chargent sans erreur de syntaxe.');

  // Test de génération d'erreur simulée
  const simulatedErr = new Error('Rate limit reached for model llama-3.3-70b-versatile on tokens per minute (TPM). Please try again in 45s.');
  simulatedErr.status = 429;

  assert(isGroqRateLimitError(simulatedErr), 'Doit détecter le 429 simulé');
  const wait = parseGroqWaitTime(simulatedErr);
  assert.strictEqual(wait.totalSeconds, 45);
  assert.strictEqual(wait.formatted, '45 s');

  console.log('✓ Simulation d\'erreur 429 et extraction du délai (45 s) validée.');
  console.log('🎉 Succès du test d\'intégration API !');
} catch (e) {
  console.error('Erreur:', e);
  process.exit(1);
}
