const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { parseUserQueryAndExclusions, filterAndScoreJobs, getGroqClient } = require('./src/groqService');
const { analyzeJobAndGetTips } = require('./src/jobAnalysisService');
const { adaptCvCriteriaWithGroq } = require('./src/cvGroqService');
const { scrapeJobs } = require('./scrap');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

/**
 * Route GET /api/status
 * Vérifie l'état du serveur et la présence de la clé Groq
 */
app.get('/api/status', (req, res) => {
  const hasGroq = Boolean(getGroqClient());
  res.json({
    status: 'online',
    hasGroqApiKey: hasGroq,
    model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile'
  });
});

/**
 * Route POST /api/search
 * Prend en entrée :
 * - query: texte libre de recherche avec sauts de ligne possibles
 * - exclusions: texte libre des critères d'exclusion avec sauts de ligne possibles
 */
app.post('/api/search', async (req, res) => {
  const startTime = Date.now();
  const { query = '', exclusions = '', geoRegion = 'all' } = req.body;

  if (!query && !exclusions) {
    return res.status(400).json({
      success: false,
      error: 'Veuillez saisir au moins un critère de recherche ou d\'exclusion.'
    });
  }

  try {
    console.log('\n================ NOUVELLE RECHERCHE ================');
    console.log(`[1/3] Analyse Groq (Région: ${geoRegion})...`);
    
    // Étape 1 : Analyse Groq avec détection géographique
    const analysis = await parseUserQueryAndExclusions(query, exclusions, geoRegion);
    const intentData = analysis.data || {};

    console.log(`[2/3] Scraping des offres (FR, DROM, EU, LinkedIn, France Travail, HelloWork)...`);
    // Étape 2 : Scraping multi-sources ciblé
    const rawJobs = await scrapeJobs({
      query,
      keywords: intentData.searchKeywords || [],
      primaryTitle: intentData.primaryJobTitle || query,
      location: intentData.targetLocation || intentData.location || '',
      departmentCode: intentData.targetDepartmentCode || '',
      geoRegion: intentData.geoRegion || geoRegion
    });

    console.log(`[3/3] Analyse sémantique, détection des exclusions et tri (${rawJobs.length} offres)...`);
    // Étape 3 : Évaluation, calcul des exclusions et tri par pertinence de TOUTES les offres
    const allScoredJobs = await filterAndScoreJobs(rawJobs, query, exclusions, intentData);

    const elapsedSeconds = ((Date.now() - startTime) / 1000).toFixed(1);
    const recommendedCount = allScoredJobs.filter(j => !j.isExcluded && j.matchScore >= 40).length;
    const excludedCount = allScoredJobs.filter(j => j.isExcluded || j.matchScore < 40).length;

    // Calcul des sources disponibles et de leurs effectifs
    const sourceCounts = {};
    allScoredJobs.forEach(job => {
      const src = job.source || 'Autre';
      sourceCounts[src] = (sourceCounts[src] || 0) + 1;
    });

    console.log(`[Fin] ${allScoredJobs.length} offres conservées et triées (${recommendedCount} recommandées, ${excludedCount} avec exclusions) en ${elapsedSeconds}s.`);

    res.json({
      success: true,
      executionTimeSeconds: elapsedSeconds,
      isAiPowered: analysis.isAiPowered,
      warning: analysis.warning || null,
      stats: {
        rawScraped: rawJobs.length,
        total: allScoredJobs.length,
        recommended: recommendedCount,
        excluded: excludedCount
      },
      availableSources: sourceCounts,
      parsedCriteria: intentData,
      jobs: allScoredJobs
    });
  } catch (error) {
    console.error('[Erreur API /api/search]:', error);
    res.status(500).json({
      success: false,
      error: 'Une erreur est survenue lors de la recherche et du scraping des offres.',
      details: error.message
    });
  }
});

/**
 * Route POST /api/jobs/analyze
 * Analyse approfondie d'une offre spécifique : résumé détaillé, profil requis et tips pour postuler
 */
app.post('/api/jobs/analyze', async (req, res) => {
  const { job } = req.body;
  if (!job) {
    return res.status(400).json({ success: false, error: 'Données de l\'offre manquantes.' });
  }

  try {
    const result = await analyzeJobAndGetTips(job);
    res.json(result);
  } catch (error) {
    console.error('[Erreur /api/jobs/analyze]:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de l\'analyse approfondie de l\'offre.',
      details: error.message
    });
  }
});

/**
 * Route POST /api/cv/adapt-groq
 * Analyse sémantique du CV et adaptation structurée des critères par l'IA Groq
 */
app.post('/api/cv/adapt-groq', async (req, res) => {
  const { cvText } = req.body;
  if (!cvText || typeof cvText !== 'string' || !cvText.trim()) {
    return res.status(400).json({
      success: false,
      error: 'Le texte du CV est manquant ou vide.'
    });
  }

  try {
    console.log(`\n[CV Groq] Adaptation des critères avec Groq (${cvText.length} caractères)...`);
    const result = await adaptCvCriteriaWithGroq(cvText);
    res.json(result);
  } catch (error) {
    console.error('[Erreur /api/cv/adapt-groq]:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur lors de l\'adaptation des critères par Groq.'
    });
  }
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`\n🚀 Serveur FindTheJob démarré avec succès !`);
  console.log(`👉 Ouvrez votre navigateur sur: http://localhost:${PORT}`);
  console.log(`🤖 Groq IA: ${getGroqClient() ? 'Activé (Clé valide)' : 'Mode Heuristique (Clé manquante dans .env)'}\n`);
});
