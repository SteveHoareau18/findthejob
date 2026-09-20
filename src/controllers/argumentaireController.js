/**
 * Couche Contrôleur REST - FindTheJob (2026)
 * Contrôleur pour la génération d'argumentaire & lettre de motivation
 */

const { generateArgumentaire } = require('../services/argumentaireService');

/**
 * Endpoint POST /api/jobs/argumentaire
 */
async function handleGenerateArgumentaire(req, res) {
  try {
    const { job, cvCriteria } = req.body;

    if (!job || typeof job !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Données de l\'offre obligatoires pour générer l\'argumentaire.'
      });
    }

    console.log(`[ArgumentaireController] Requête reçue pour "${job.title || 'Poste'}" (${job.company || 'Entreprise'})...`);
    const result = await generateArgumentaire(job, cvCriteria || null);

    return res.json(result);
  } catch (error) {
    console.error('[ArgumentaireController] Erreur :', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur interne lors de la génération de l\'argumentaire.',
      details: error.message
    });
  }
}

module.exports = {
  handleGenerateArgumentaire
};
