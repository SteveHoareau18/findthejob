const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { parseUserQueryAndExclusions, filterAndScoreJobs, getGroqClient } = require('./src/groqService');
const { isGroqRateLimitError, parseGroqWaitTime } = require('./src/utils/groqErrorHandler');
const { analyzeJobAndGetTips } = require('./src/jobAnalysisService');
const { adaptCvCriteriaWithGroq, scoreJobsWithCvGroq } = require('./src/cvGroqService');
const { handleGenerateArgumentaire } = require('./src/controllers/argumentaireController');
const { initChatWebSocketServer } = require('./src/websocket/chatWebSocketHandler');
const { scrapeJobs } = require('./scrap');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Assure la disponibilité des icônes PWA (192x192, 512x512, maskable)
const { ensurePwaIcons } = require('./src/services/pwaIconService');
try {
  ensurePwaIcons();
} catch (pwaErr) {
  console.warn('[PWA] Initialisation des icônes:', pwaErr.message);
}

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
 * - cvCriteria: (optionnel) profil candidat pour scoring d'adéquation Groq direct
 */
app.post('/api/search', async (req, res) => {
  const startTime = Date.now();
  const { query = '', exclusions = '', geoRegion = 'all', cvCriteria = null } = req.body;

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
    let allScoredJobs = await filterAndScoreJobs(rawJobs, query, exclusions, intentData);

    // Étape optionnelle : Évaluation sémantique d'adéquation CV avec Groq si un profil candidat est fourni
    if (cvCriteria && ((cvCriteria.logiciels && cvCriteria.logiciels.length) || (cvCriteria.experience && cvCriteria.experience.length) || (cvCriteria.formations && cvCriteria.formations.length))) {
      console.log(`[CV Groq] Évaluation d'adéquation du profil candidat avec Groq (${allScoredJobs.length} offres)...`);
      try {
        const groqScored = await scoreJobsWithCvGroq(allScoredJobs, cvCriteria);
        if (groqScored && groqScored.length > 0) {
          allScoredJobs = groqScored;
        }
      } catch (cvErr) {
        console.warn('[CV Groq] Avertissement scoring CV lors de la recherche:', cvErr.message);
      }
    }

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
      groqRateLimit: analysis.groqRateLimit || allScoredJobs.groqRateLimit || null,
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
    if (isGroqRateLimitError(error)) {
      const waitInfo = parseGroqWaitTime(error);
      return res.status(429).json({
        success: false,
        isGroqRateLimit: true,
        retryAfterSeconds: waitInfo.totalSeconds,
        retryAfterFormatted: waitInfo.formatted,
        error: `Il n'y a plus assez de tokens Groq disponibles pour le moment. Veuillez retenter dans ${waitInfo.formatted}.`
      });
    }
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
    if (isGroqRateLimitError(error)) {
      const waitInfo = parseGroqWaitTime(error);
      return res.status(429).json({
        success: false,
        isGroqRateLimit: true,
        retryAfterSeconds: waitInfo.totalSeconds,
        retryAfterFormatted: waitInfo.formatted,
        error: `Il n'y a plus assez de tokens Groq disponibles pour le moment. Veuillez retenter dans ${waitInfo.formatted}.`
      });
    }
    res.status(500).json({
      success: false,
      error: 'Erreur lors de l\'analyse approfondie de l\'offre.',
      details: error.message
    });
  }
});

/**
 * Route POST /api/jobs/argumentaire
 * Génère un argumentaire stratégique et une lettre de motivation personnalisée
 * basés sur les critères du candidat et les données de l'offre
 */
app.post('/api/jobs/argumentaire', handleGenerateArgumentaire);

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
    if (error.isGroqRateLimit || isGroqRateLimitError(error)) {
      const waitInfo = parseGroqWaitTime(error);
      return res.status(429).json({
        success: false,
        isGroqRateLimit: true,
        retryAfterSeconds: error.retryAfterSeconds || waitInfo.totalSeconds,
        retryAfterFormatted: error.retryAfterFormatted || waitInfo.formatted,
        error: error.message || `Il n'y a plus assez de tokens Groq disponibles pour le moment. Veuillez retenter dans ${waitInfo.formatted}.`
      });
    }
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur lors de l\'adaptation des critères par Groq.'
    });
  }
});

/**
 * Route POST /api/cv/score-jobs
 * Évalue sémantiquement l'adéquation d'une liste d'offres par rapport aux critères du candidat avec Groq
 */
app.post('/api/cv/score-jobs', async (req, res) => {
  const { jobs = [], cvCriteria = null } = req.body;

  if (!jobs || !Array.isArray(jobs) || jobs.length === 0) {
    return res.status(400).json({ success: false, error: 'Aucune offre fournie pour l\'évaluation.' });
  }

  if (!cvCriteria) {
    return res.status(400).json({ success: false, error: 'Critères du candidat manquants.' });
  }

  try {
    console.log(`\n[CV Scoring] Évaluation Groq de ${jobs.length} offres face au profil candidat...`);
    const scoredJobs = await scoreJobsWithCvGroq(jobs, cvCriteria);
    res.json({
      success: true,
      isAiPowered: Boolean(getGroqClient()),
      groqRateLimit: scoredJobs?.groqRateLimit || null,
      jobs: scoredJobs || jobs
    });
  } catch (error) {
    console.error('[Erreur /api/cv/score-jobs]:', error);
    if (error.isGroqRateLimit || isGroqRateLimitError(error)) {
      const waitInfo = parseGroqWaitTime(error);
      return res.status(429).json({
        success: false,
        isGroqRateLimit: true,
        retryAfterSeconds: error.retryAfterSeconds || waitInfo.totalSeconds,
        retryAfterFormatted: error.retryAfterFormatted || waitInfo.formatted,
        error: error.message || `Il n'y a plus assez de tokens Groq disponibles pour le moment. Veuillez retenter dans ${waitInfo.formatted}.`
      });
    }
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur lors de l\'évaluation des offres par Groq.'
    });
  }
});

/**
 * =================== ROUTES PWA & HORS-LIGNE ===================
 */

// Stockage mémoire des alertes & souscriptions push
const serverAlerts = new Map();
const pushSubscriptions = new Set();

/**
 * Route POST /api/sync/outbox
 * Reçoit et traite les actions posées hors-ligne (UI optimiste)
 */
app.post('/api/sync/outbox', (req, res) => {
  const item = req.body;
  if (!item || !item.actionType) {
    return res.status(400).json({ success: false, error: 'Données de synchronisation invalides' });
  }

  console.log(`[PWA Outbox Sync] Action reçue : ${item.actionType} (ID local: ${item.localId || 'N/A'})`);

  switch (item.actionType) {
    case 'SAVE_INTERACTION':
      console.log(`  -> Offre ${item.payload?.jobId} marquée comme ${item.payload?.status}`);
      break;

    case 'SAVE_CANDIDATURE':
      console.log(`  -> Candidature synchronisée : ${item.payload?.company} - ${item.payload?.jobTitle}`);
      break;

    case 'DELETE_CANDIDATURE':
      console.log(`  -> Suppression candidature : ${item.payload?.jobId}`);
      break;

    case 'SAVE_ALERT':
      if (item.payload?.id) {
        serverAlerts.set(item.payload.id, item.payload);
      }
      break;

    default:
      console.log(`  -> Action générique traitée avec succès`);
  }

  res.json({
    success: true,
    syncedAt: Date.now(),
    localId: item.localId
  });
});

/**
 * Route GET /api/alerts
 * Retourne la liste des alertes de recherche
 */
app.get('/api/alerts', (req, res) => {
  res.json({
    success: true,
    alerts: Array.from(serverAlerts.values())
  });
});

/**
 * Route POST /api/alerts
 * Sauvegarde ou met à jour une alerte de recherche
 */
app.post('/api/alerts', (req, res) => {
  const alert = req.body;
  if (!alert || !alert.id) {
    return res.status(400).json({ success: false, error: 'Alerte invalide' });
  }

  serverAlerts.set(alert.id, {
    ...alert,
    updatedAt: Date.now()
  });

  res.json({ success: true, alert });
});

/**
 * Route DELETE /api/alerts/:id
 * Supprime une alerte de recherche
 */
app.delete('/api/alerts/:id', (req, res) => {
  const id = req.params.id;
  const deleted = serverAlerts.delete(id);
  res.json({ success: true, deleted });
});

/**
 * Route GET /api/push/status
 * Vérifie l'état de prise en charge des notifications Push
 */
app.get('/api/push/status', (req, res) => {
  res.json({
    enabled: true,
    hasVapid: Boolean(process.env.VAPID_PUBLIC_KEY),
    subscribersCount: pushSubscriptions.size
  });
});

/**
 * Route POST /api/push/subscribe
 * Enregistre une souscription Web Push client
 */
app.post('/api/push/subscribe', (req, res) => {
  const subscription = req.body;
  if (!subscription || !subscription.endpoint) {
    return res.status(400).json({ success: false, error: 'Souscription push invalide' });
  }

  pushSubscriptions.add(JSON.stringify(subscription));
  console.log(`[PWA Push] Nouveau client abonné aux notifications (${pushSubscriptions.size} abonnés)`);

  res.json({ success: true, registered: true });
});

// Démarrage du serveur HTTP & WebSocket (2026)
const server = http.createServer(app);
initChatWebSocketServer(server);

// Écoute locale uniquement (sur Vercel, l'environnement Serverless gère le port et l'écoute)
if (!process.env.VERCEL) {
  server.listen(PORT, () => {
    console.log(`\n🚀 Serveur FindTheJob démarré avec succès !`);
    console.log(`👉 Ouvrez votre navigateur sur: http://localhost:${PORT}`);
    console.log(`🤖 Groq IA: ${getGroqClient() ? 'Activé (Clé valide)' : 'Mode Heuristique (Clé manquante dans .env)'}`);
    console.log(`💬 WebSocket Chatbot: ws://localhost:${PORT}/ws/chat\n`);
  });
}

module.exports = server;
