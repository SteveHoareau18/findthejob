/**
 * Couche Métier / Service - FindTheJob (2026)
 * Génération d'argumentaire sur-mesure et modèle de lettre de motivation
 * basé sur les critères extraits du CV et l'offre d'emploi.
 */

const { getGroqClient, getModelName } = require('../groqService');
const { buildArgumentairePrompt } = require('../domain/jobContextBuilder');

/**
 * Génère l'argumentaire stratégique et le projet de lettre de motivation
 * @param {Object} job Données de l'offre
 * @param {Object} cvCriteria Critères extraits du profil candidat
 * @returns {Promise<Object>}
 */
async function generateArgumentaire(job, cvCriteria) {
  if (!job) {
    throw new Error('Les informations de l\'offre sont requises.');
  }

  const client = getGroqClient();
  const { systemPrompt, userPrompt } = buildArgumentairePrompt(job, cvCriteria);

  if (!client) {
    console.log('[ArgumentaireService] Groq non connecté : génération de l\'argumentaire heuristique.');
    return {
      success: true,
      isAiPowered: false,
      argumentaire: generateFallbackArgumentaire(job, cvCriteria)
    };
  }

  const candidateModels = [
    getModelName(),
    'llama-3.3-70b-versatile',
    'groq/compound-mini',
    'openai/gpt-oss-120b',
    'openai/gpt-oss-20b'
  ].filter(Boolean);

  for (const model of candidateModels) {
    try {
      console.log(`[ArgumentaireService] Appel Groq (${model}) pour "${job.title}"...`);
      const completion = await client.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
        max_completion_tokens: 2000
      });

      const rawContent = completion.choices[0]?.message?.content || '{}';
      const parsed = JSON.parse(rawContent);

      return {
        success: true,
        isAiPowered: true,
        modelUsed: model,
        argumentaire: {
          accroche: parsed.accroche || 'Votre recherche de compétences correspond à mes réalisations concrètes.',
          argumentsCles: Array.isArray(parsed.argumentsCles) ? parsed.argumentsCles : [],
          differentiateurs: Array.isArray(parsed.differentiateurs) ? parsed.differentiateurs : [],
          modeleLettre: parsed.modeleLettre || ''
        }
      };
    } catch (err) {
      console.warn(`[ArgumentaireService] Échec avec le modèle ${model} (${err.message}). Tentative suivante...`);
    }
  }

  console.warn('[ArgumentaireService] Tous les modèles ont échoué. Basculement sur l\'argumentaire de secours.');
  return {
    success: true,
    isAiPowered: false,
    argumentaire: generateFallbackArgumentaire(job, cvCriteria)
  };
}

/**
 * Génère un argumentaire de secours si Groq n'est pas accessible
 */
function generateFallbackArgumentaire(job, cvCriteria = {}) {
  const company = job.company || "votre entreprise";
  const title = job.title || "ce poste";
  const logiciels = Array.isArray(cvCriteria.logiciels) && cvCriteria.logiciels.length > 0 
    ? cvCriteria.logiciels.slice(0, 4).join(', ') 
    : 'outils techniques de référence';

  return {
    accroche: `Passionné par les défis liés au poste de ${title}, je souhaite mettre mon savoir-faire au service des ambitions de ${company}.`,
    argumentsCles: [
      {
        titre: `Adéquation avec les missions clés de ${title}`,
        pointOffre: `Exigences du poste chez ${company}`,
        atoutCandidat: `Expériences et réalisations confirmées sur les environnements ciblés`,
        argumentation: `Mon parcours me permet d'être rapidement opérationnel et autonome sur les responsabilités requises.`
      },
      {
        titre: `Maîtrise opérationnelle des outils & logiciels`,
        pointOffre: `Pratique des technologies et méthodes du secteur`,
        atoutCandidat: `Compétences appliquées : ${logiciels}`,
        argumentation: `Une aptitude avérée à délivrer des livrables de haute qualité dans le respect des délais imposés.`
      },
      {
        titre: `Capacité d'adaptation et posture collaborative`,
        pointOffre: `Esprit d'équipe et communication transversale`,
        atoutCandidat: Array.isArray(cvCriteria.softSkills) && cvCriteria.softSkills.length > 0 ? cvCriteria.softSkills.slice(0, 3).join(', ') : 'Rigueur, écoute et proactivité',
        argumentation: `Une intégration rapide au sein des équipes existantes et une contribution positive aux projets communs.`
      }
    ],
    differentiateurs: [
      `Expérience concrète mobilisable immédiatement pour ${company}.`,
      `Maîtrise confirmée des logiciels : ${logiciels}.`
    ],
    modeleLettre: `Madame, Monsieur,\n\nC'est avec un grand intérêt que je vous présente ma candidature au poste de ${title} au sein de ${company}.\n\nVotre offre a immédiatement retenu mon attention car elle correspond aux réalisations que j'ai pu mener lors de mes précédentes expériences. Fort d'une solide maîtrise de mes domaines d'intervention (notamment ${logiciels}), je suis capable d'apporter des réponses pragmatiques et performantes à vos enjeux quotidiens.\n\nRejoindre ${company} représente pour moi l'opportunité de mettre mon énergie, ma rigueur et mon enthousiasme au profit de vos projets collectifs.\n\nJe serais ravi de vous rencontrer lors d'un prochain entretien pour vous exposer plus en détail la pertinence de mon profil pour ce poste.\n\nDans cette attente, je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.`
  };
}

module.exports = {
  generateArgumentaire,
  generateFallbackArgumentaire
};
