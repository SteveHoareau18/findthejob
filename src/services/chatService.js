/**
 * Couche Métier / Service - FindTheJob (2026)
 * Service de streaming conversationnel Groq AI pour le ChatBot Recrutement
 */

const { getGroqClient, getModelName } = require('../groqService');
const { isGroqRateLimitError, createGroqRateLimitPayload } = require('../utils/groqErrorHandler');
const { buildChatSystemPrompt } = require('../domain/jobContextBuilder');

/**
 * Valide et filtre l'historique des messages utilisateur/assistant
 * @param {Array} rawMessages 
 * @param {number} maxTurns 
 * @returns {Array}
 */
function sanitizeConversationHistory(rawMessages, maxTurns = 12) {
  if (!Array.isArray(rawMessages)) return [];

  return rawMessages
    .filter(msg => msg && (msg.role === 'user' || msg.role === 'assistant') && typeof msg.content === 'string')
    .map(msg => ({
      role: msg.role,
      content: msg.content.trim().substring(0, 2000)
    }))
    .slice(-maxTurns);
}

/**
 * Exécute un tour de conversation en streaming vers le client
 * @param {Object} params
 * @param {Object} params.job Offre concernée
 * @param {Object} params.cvCriteria Critères du candidat
 * @param {Array} params.messages Historique des messages
 * @param {Function} params.onChunk Callback appelé pour chaque fragment (delta)
 * @param {Function} params.onDone Callback appelé à la fin du flux
 * @param {Function} params.onError Callback appelé en cas d'erreur
 */
async function streamChatConversation({ job, cvCriteria, messages, onChunk, onDone, onError }) {
  const client = getGroqClient();
  const systemPrompt = buildChatSystemPrompt(job, cvCriteria);
  const history = sanitizeConversationHistory(messages);

  if (!client) {
    console.log('[ChatService] Groq non connecté : réponse heuristique simulée.');
    const fallbackResponse = `Bonjour ! Je suis votre coach recrutement FindTheJob.\n\n` +
      `Pour ce poste de **${job?.title || 'l\'offre'}** chez **${job?.company || 'cette entreprise'}**, ` +
      `votre profil présente de très bons atouts, notamment votre rigueur et vos compétences clés.\n\n` +
      `*Note : Pour bénéficier de réponses complètes et dynamiques personnalisées par Groq AI, activez votre clé \`GROQ_API_KEY\` dans le fichier \`.env\`.*`;
    
    // Simulation d'un streaming fluide même en mode heuristique
    const words = fallbackResponse.split(' ');
    for (const word of words) {
      onChunk(word + ' ');
      await new Promise(r => setTimeout(r, 25));
    }
    onDone(fallbackResponse);
    return;
  }

  const candidateModels = [
    getModelName(),
    'llama-3.3-70b-versatile',
    'groq/compound-mini',
    'openai/gpt-oss-120b'
  ].filter(Boolean);

  let success = false;
  let fullAccumulated = '';

  let lastRateLimitErr = null;
  for (const model of candidateModels) {
    try {
      console.log(`[ChatService] Démarrage du streaming Groq (${model}) pour session de chat...`);

      const stream = await client.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          ...history
        ],
        stream: true,
        temperature: 0.5,
        max_completion_tokens: 1500
      });

      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content || '';
        if (delta) {
          fullAccumulated += delta;
          onChunk(delta);
        }
      }

      success = true;
      onDone(fullAccumulated);
      break;
    } catch (err) {
      if (isGroqRateLimitError(err)) {
        lastRateLimitErr = err;
      }
      console.warn(`[ChatService] Erreur stream modèle ${model} (${err.message}). Essai du suivant...`);
    }
  }

  if (!success) {
    if (lastRateLimitErr) {
      const rlPayload = createGroqRateLimitPayload(lastRateLimitErr, 'le coach Groq');
      onChunk(rlPayload.message);
      onDone(rlPayload.message, rlPayload);
    } else {
      const errorMsg = "Désolé, une indisponibilité momentanée du service Groq s'est produite. Veuillez réessayer dans quelques instants.";
      onChunk(errorMsg);
      onDone(errorMsg, { isGroqRateLimit: false });
    }
  }
}

module.exports = {
  streamChatConversation,
  sanitizeConversationHistory
};
