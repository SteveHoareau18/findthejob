document.addEventListener('DOMContentLoaded', () => {
  // Elements DOM
  const searchForm = document.getElementById('searchForm');
  const queryInput = document.getElementById('queryInput');
  const exclusionsInput = document.getElementById('exclusionsInput');
  const submitBtn = document.getElementById('submitBtn');
  const exampleBtn = document.getElementById('exampleBtn');

  // Status & Banners
  const aiStatusBadge = document.getElementById('aiStatusBadge');
  const aiStatusText = document.getElementById('aiStatusText');
  const apiKeyBanner = document.getElementById('apiKeyBanner');
  const groqRateLimitGlobalBanner = document.getElementById('groqRateLimitGlobalBanner');
  const cvGroqRateLimitBanner = document.getElementById('cvGroqRateLimitBanner');
  const modalGroqRateLimitBanner = document.getElementById('modalGroqRateLimitBanner');

  // Contrôles du Cache Local (Cookies, localStorage & IndexedDB)
  const cacheStatusBadge = document.getElementById('cacheStatusBadge');
  const cacheStatusDot = document.getElementById('cacheStatusDot');
  const cacheStatusText = document.getElementById('cacheStatusText');
  const saveCacheBtn = document.getElementById('saveCacheBtn');
  const clearCacheBtn = document.getElementById('clearCacheBtn');

  // CV Upload & Criteria Elements
  const cvFileInput = document.getElementById('cvFileInput');
  const cvUploadLabel = document.getElementById('cvUploadLabel');
  const cvUploadBtnText = document.getElementById('cvUploadBtnText');
  const cvInitialChoiceContainer = document.getElementById('cvInitialChoiceContainer');
  const cvStatusBadge = document.getElementById('cvStatusBadge');
  const cvStatusText = document.getElementById('cvStatusText');
  const clearCvBtn = document.getElementById('clearCvBtn');
  const cvQuickSummary = document.getElementById('cvQuickSummary');
  const openCvCriteriaBtn = document.getElementById('openCvCriteriaBtn');
  const adaptCvGroqBtn = document.getElementById('adaptCvGroqBtn');
  const recalcCvGroqBtn = document.getElementById('recalcCvGroqBtn');
  const cvScoreStatusIndicator = document.getElementById('cvScoreStatusIndicator');
  const cvFilterRow = document.getElementById('cvFilterRow');
  const cvRelevanceFiltersContainer = document.getElementById('cvRelevanceFiltersContainer');

  // Zone de retour d'analyse Groq (Points positifs & Points à améliorer)
  const cvGroqFeedbackContainer = document.getElementById('cvGroqFeedbackContainer');
  const toggleCvFeedbackBtn = document.getElementById('toggleCvFeedbackBtn');
  const cvFeedbackGrid = document.getElementById('cvFeedbackGrid');
  const cvStrengthsList = document.getElementById('cvStrengthsList');
  const cvImprovementsList = document.getElementById('cvImprovementsList');

  // Modale Modification des critères
  const cvCriteriaModal = document.getElementById('cvCriteriaModal');
  const cvModalBadge = document.getElementById('cvModalBadge');
  const modalCvFeedbackBanner = document.getElementById('modalCvFeedbackBanner');
  const modalCvStrengthsList = document.getElementById('modalCvStrengthsList');
  const modalCvImprovementsList = document.getElementById('modalCvImprovementsList');
  const cvCriteriaCloseBtn = document.getElementById('cvCriteriaCloseBtn');
  const cancelCvCriteriaBtn = document.getElementById('cancelCvCriteriaBtn');
  const cvCriteriaForm = document.getElementById('cvCriteriaForm');
  const cvFormationsInput = document.getElementById('cvFormationsInput');
  const cvExperienceInput = document.getElementById('cvExperienceInput');
  const cvSoftSkillsInput = document.getElementById('cvSoftSkillsInput');
  const cvLogicielsInput = document.getElementById('cvLogicielsInput');
  const cvAgeInput = document.getElementById('cvAgeInput');
  const cvLieuxInput = document.getElementById('cvLieuxInput');
  const cvVehiculeInput = document.getElementById('cvVehiculeInput');

  // Progress Section
  const progressSection = document.getElementById('progressSection');
  const progressTitle = document.getElementById('progressTitle');
  const progressSubtitle = document.getElementById('progressSubtitle');
  const step1 = document.getElementById('step1');
  const step2 = document.getElementById('step2');
  const step3 = document.getElementById('step3');

  // Results Section
  const resultsSection = document.getElementById('resultsSection');
  const resultsCountTitle = document.getElementById('resultsCountTitle');
  const intentSummaryText = document.getElementById('intentSummaryText');
  const statRaw = document.getElementById('statRaw');
  const statExcluded = document.getElementById('statExcluded');
  const statKept = document.getElementById('statKept');
  const jobsGrid = document.getElementById('jobsGrid');
  const emptyState = document.getElementById('emptyState');
  const quickFilterInput = document.getElementById('quickFilterInput');
  const sortBySelect = document.getElementById('sortBy');

  // Filtres interactifs
  const sourceFiltersContainer = document.getElementById('sourceFiltersContainer');
  const relevanceFiltersContainer = document.getElementById('relevanceFiltersContainer');
  const userStatusFiltersContainer = document.getElementById('userStatusFiltersContainer');
  const countFavorites = document.getElementById('countFavorites');
  const countDismissed = document.getElementById('countDismissed');
  const countUnmarked = document.getElementById('countUnmarked');

  // DataTable & Commutateur de Vue
  const viewModeTableBtn = document.getElementById('viewModeTableBtn');
  const viewModeGridBtn = document.getElementById('viewModeGridBtn');
  const jobsTableContainer = document.getElementById('jobsTableContainer');
  const jobsDataTable = document.getElementById('jobsDataTable');
  const jobsTableBody = document.getElementById('jobsTableBody');
  const tablePageSizeSelect = document.getElementById('tablePageSizeSelect');
  const tablePaginationInfo = document.getElementById('tablePaginationInfo');
  const tablePrevPageBtn = document.getElementById('tablePrevPageBtn');
  const tableNextPageBtn = document.getElementById('tableNextPageBtn');
  const tablePageNumbers = document.getElementById('tablePageNumbers');

  // Suivi des Candidatures & Entretiens (Header, Filtres, Modales, Calendrier)
  const openCandidaturesBtn = document.getElementById('openCandidaturesBtn');
  const headerCandidaturesBadge = document.getElementById('headerCandidaturesBadge');
  const candidatureFilterRow = document.getElementById('candidatureFilterRow');
  const candidatureFiltersContainer = document.getElementById('candidatureFiltersContainer');
  const countUnapplied = document.getElementById('countUnapplied');
  const countApplied = document.getElementById('countApplied');

  // Éléments Modale Candidatures
  const candidaturesModal = document.getElementById('candidaturesModal');
  const closeCandidaturesModalBtn = document.getElementById('closeCandidaturesModalBtn');
  const modalCandidaturesTotalBadge = document.getElementById('modalCandidaturesTotalBadge');
  const candTabListBtn = document.getElementById('candTabListBtn');
  const candTabCalendarBtn = document.getElementById('candTabCalendarBtn');
  const candListView = document.getElementById('candListView');
  const candCalendarView = document.getElementById('candCalendarView');
  const candEmptyState = document.getElementById('candEmptyState');
  const candidaturesCardsContainer = document.getElementById('candidaturesCardsContainer');
  const modalStatusFilterBar = document.getElementById('modalStatusFilterBar');
  const modalActionNotification = document.getElementById('modalActionNotification');
  const exportArchiveZipBtn = document.getElementById('exportArchiveZipBtn');
  const importArchiveBtn = document.getElementById('importArchiveBtn');
  const importArchiveFileInput = document.getElementById('importArchiveFileInput');
  const addManualCandBtn = document.getElementById('addManualCandBtn');
  const candCountWaiting = document.getElementById('candCountWaiting');
  const candCountInterview = document.getElementById('candCountInterview');
  const candCountAccepted = document.getElementById('candCountAccepted');
  const candCountRejected = document.getElementById('candCountRejected');

  // Éléments Calendrier
  const calPrevMonthBtn = document.getElementById('calPrevMonthBtn');
  const calNextMonthBtn = document.getElementById('calNextMonthBtn');
  const calMonthYearLabel = document.getElementById('calMonthYearLabel');
  const calTodayBtn = document.getElementById('calTodayBtn');
  const calendarDaysGrid = document.getElementById('calendarDaysGrid');
  const calendarDayInspector = document.getElementById('calendarDayInspector');
  const calendarInspectorDateTitle = document.getElementById('calendarInspectorDateTitle');
  const calendarInspectorEventsList = document.getElementById('calendarInspectorEventsList');
  const closeCalendarInspectorBtn = document.getElementById('closeCalendarInspectorBtn');

  // Éléments Modale Entretien
  const interviewModal = document.getElementById('interviewModal');
  const closeInterviewModalBtn = document.getElementById('closeInterviewModalBtn');
  const cancelInterviewModalBtn = document.getElementById('cancelInterviewModalBtn');
  const interviewForm = document.getElementById('interviewForm');
  const interviewCandJobId = document.getElementById('interviewCandJobId');
  const interviewEditId = document.getElementById('interviewEditId');
  const interviewModalTitle = document.getElementById('interviewModalTitle');
  const interviewModalJobSubtitle = document.getElementById('interviewModalJobSubtitle');
  const interviewTitleInput = document.getElementById('interviewTitleInput');
  const interviewDateInput = document.getElementById('interviewDateInput');
  const interviewTimeInput = document.getElementById('interviewTimeInput');
  const interviewTypeInput = document.getElementById('interviewTypeInput');
  const interviewDurationInput = document.getElementById('interviewDurationInput');
  const interviewLocationInput = document.getElementById('interviewLocationInput');
  const interviewInterviewerInput = document.getElementById('interviewInterviewerInput');
  const interviewNotesInput = document.getElementById('interviewNotesInput');

  // Éléments Modale Candidature Manuelle
  const manualCandModal = document.getElementById('manualCandModal');
  const closeManualCandModalBtn = document.getElementById('closeManualCandModalBtn');
  const cancelManualCandBtn = document.getElementById('cancelManualCandBtn');
  const manualCandForm = document.getElementById('manualCandForm');
  const manualJobTitleInput = document.getElementById('manualJobTitleInput');
  const manualCompanyInput = document.getElementById('manualCompanyInput');
  const manualLocationInput = document.getElementById('manualLocationInput');
  const manualAppliedDateInput = document.getElementById('manualAppliedDateInput');
  const manualStatusSelect = document.getElementById('manualStatusSelect');
  const manualUrlInput = document.getElementById('manualUrlInput');

  // Éléments Modale de Confirmation de Postulation
  const applyConfirmModal = document.getElementById('applyConfirmModal');
  const closeApplyConfirmModalBtn = document.getElementById('closeApplyConfirmModalBtn');
  const cancelApplyConfirmBtn = document.getElementById('cancelApplyConfirmBtn');
  const justVisitOfferBtn = document.getElementById('justVisitOfferBtn');
  const applyAndRedirectBtn = document.getElementById('applyAndRedirectBtn');
  const applyConfirmJobTitle = document.getElementById('applyConfirmJobTitle');
  const applyConfirmCompany = document.getElementById('applyConfirmCompany');
  const applyConfirmLocation = document.getElementById('applyConfirmLocation');
  const applyConfirmSource = document.getElementById('applyConfirmSource');
  const applyConfirmDateInput = document.getElementById('applyConfirmDateInput');

  let currentJobs = [];
  let pendingApplyJob = null;
  let progressInterval = null;
  let activeSourceFilter = 'all';
  let activeRelevanceFilter = 'all';
  let activeCvRelevanceFilter = 'all';
  let activeUserStatusFilter = 'all'; // 'all' | 'favorite' | 'dismissed' | 'unmarked'
  let activeCandidatureFilter = 'all'; // 'all' | 'unapplied' | 'applied'
  let activeModalStatusFilter = 'all'; // 'all' | 'En attente de réponse' | 'Entretien x' | 'Accepté' | 'Non abouti'
  let candidatures = {}; // { [jobId]: Candidature }
  let calendarDisplayedDate = new Date();
  let selectedCalendarDay = null;
  let currentCandViewTab = 'list'; // 'list' | 'calendar'
  let jobInteractions = {}; // { [jobId]: 'favorite' | 'dismissed' }
  let currentViewMode = localStorage.getItem('ftj_view_mode') || 'table'; // 'table' | 'grid'
  let tableCurrentPage = 1;
  let tableSortCol = null;
  let tableSortDir = 'desc';
  let lastFilteredJobs = [];
  let currentCvCriteria = null;
  let currentCvFileName = '';
  let currentCvRawText = '';
  let isGroqAdaptedCv = false;
  let currentCvFeedback = null;
  let lastFocusedElement = null; // Pour restitution du focus après modale (RGAA)
  let lastSearchData = {
    parsedCriteria: null,
    stats: null,
    availableSources: null
  };

  // 1. Vérification du statut Groq au chargement
  checkServerStatus();

  async function checkServerStatus() {
    try {
      const res = await fetch('/api/status');
      const data = await res.json();

      if (data.hasGroqApiKey) {
        aiStatusBadge.className = 'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold border bg-emerald-50 text-emerald-800 border-emerald-200';
        aiStatusBadge.innerHTML = `<span class="w-2.5 h-2.5 rounded-full bg-emerald-500" aria-hidden="true"></span><span>Groq IA Connecté (${escapeHtml(data.model)})</span>`;
        apiKeyBanner.classList.add('hidden');
      } else {
        aiStatusBadge.className = 'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold border bg-amber-50 text-amber-800 border-amber-200';
        aiStatusBadge.innerHTML = `<span class="w-2.5 h-2.5 rounded-full bg-amber-500" aria-hidden="true"></span><span>Mode Heuristique (Clé Groq absente)</span>`;
        apiKeyBanner.classList.remove('hidden');
      }
    } catch (err) {
      console.warn('Impossible de vérifier le statut Groq:', err);
      aiStatusBadge.className = 'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold border bg-rose-50 text-rose-800 border-rose-200';
      aiStatusBadge.innerHTML = `<span class="w-2.5 h-2.5 rounded-full bg-rose-500" aria-hidden="true"></span><span>Serveur hors ligne</span>`;
    }
  }

  // =========================================================================
  // GESTIONNAIRE D'ÉPUISEMENT DES TOKENS GROQ & RAPPELS PWA (2026)
  // =========================================================================

  let activeReminderTimeout = null;
  let activeCountdownInterval = null;

  /**
   * Détecte si l'application s'exécute dans un contexte PWA
   * (Mode autonome/standalone, TWA, URL avec ?pwa=1, ou contrôlé par un Service Worker actif)
   */
  function isPwa() {
    const isStandalone = (
      (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
      window.navigator.standalone === true ||
      (window.matchMedia && window.matchMedia('(display-mode: fullscreen)').matches) ||
      (window.matchMedia && window.matchMedia('(display-mode: minimal-ui)').matches) ||
      (document.referrer && document.referrer.includes('android-app://'))
    );
    const urlPwa = new URLSearchParams(window.location.search).has('pwa');
    const swControlled = Boolean(navigator.serviceWorker && navigator.serviceWorker.controller);
    return Boolean(isStandalone || urlPwa || swControlled || window.__FORCE_PWA__);
  }

  /**
   * Vérifie si une erreur correspond à un épuisement de tokens ou rate limit Groq (HTTP 429)
   */
  function isGroqRateLimitError(err) {
    if (!err) return false;
    if (err.isGroqRateLimit) return true;
    if (err.status === 429 || err.statusCode === 429) return true;
    const msg = (typeof err === 'string' ? err : `${err.message || ''} ${err.error || ''} ${JSON.stringify(err.data || '')}`).toLowerCase();
    return (
      msg.includes('rate limit') ||
      msg.includes('tokens per minute') ||
      msg.includes('tokens per day') ||
      msg.includes('requests per minute') ||
      msg.includes('tpm') ||
      msg.includes('rpm') ||
      msg.includes('tpd') ||
      msg.includes('quota') ||
      msg.includes('token groq') ||
      msg.includes('tokens groq') ||
      msg.includes('trop de requêtes') ||
      msg.includes('try again in') ||
      (msg.includes('429') && (msg.includes('groq') || msg.includes('limit')))
    );
  }

  function parseDurationStringToSeconds(str) {
    if (!str || typeof str !== 'string') return 0;
    const s = str.trim().toLowerCase();
    let hours = 0, minutes = 0, seconds = 0;

    const msMatch = s.match(/(\d+(?:\.\d+)?)\s*ms/);
    if (msMatch) seconds += parseFloat(msMatch[1]) / 1000;

    const h = s.match(/(\d+(?:\.\d+)?)\s*h/);
    if (h) hours = parseFloat(h[1]);

    const m = s.match(/(\d+(?:\.\d+)?)\s*m(?!s)/);
    if (m) minutes = parseFloat(m[1]);

    const sec = s.match(/(\d+(?:\.\d+)?)\s*(?:s|sec)(?!ms)/);
    if (sec && !msMatch) seconds += parseFloat(sec[1]);

    if (!h && !m && !sec && !msMatch && /^\d+(?:\.\d+)?$/.test(s)) {
      const num = parseFloat(s);
      if (!isNaN(num)) seconds = num;
    }
    const total = Math.ceil(hours * 3600 + minutes * 60 + seconds);
    return total > 0 ? total : 0;
  }

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

  function extractGroqWaitTime(errorOrData) {
    if (errorOrData && errorOrData.retryAfterSeconds) {
      return {
        totalSeconds: errorOrData.retryAfterSeconds,
        formatted: errorOrData.retryAfterFormatted || formatDurationFr(errorOrData.retryAfterSeconds)
      };
    }
    let text = typeof errorOrData === 'string' ? errorOrData : `${errorOrData?.message || ''} ${errorOrData?.error || ''} ${JSON.stringify(errorOrData?.data || '')}`;
    let totalSeconds = 0;
    const match = text.match(/(?:try again in|retente[rz] dans|r[ée]essayer dans|attendre|in)\s+([0-9]+(?:\.[0-9]+)?[hms\s\.\d]+)/i);
    if (match && match[1]) {
      totalSeconds = parseDurationStringToSeconds(match[1]);
    }
    if (!totalSeconds) totalSeconds = 60;
    return {
      totalSeconds,
      formatted: formatDurationFr(totalSeconds)
    };
  }

  /**
   * Demande ou vérifie l'autorisation des notifications du système
   */
  async function requestNotificationPermission() {
    if (!('Notification' in window)) {
      return 'unsupported';
    }
    if (Notification.permission === 'granted') {
      return 'granted';
    }
    if (Notification.permission === 'denied') {
      return 'denied';
    }
    try {
      const perm = await Notification.requestPermission();
      return perm;
    } catch {
      return 'denied';
    }
  }

  /**
   * Déclenche la notification système après expiration du délai
   */
  function triggerGroqReminderNotification() {
    localStorage.removeItem('ftj_groq_reminder');
    if (activeReminderTimeout) clearTimeout(activeReminderTimeout);
    activeReminderTimeout = null;

    const notifTitle = 'Tokens Groq disponibles ! 🚀';
    const notifOptions = {
      body: 'Le temps d\'attente est écoulé. Vos quotas sont réinitialisés, vous pouvez relancer votre requête.',
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      tag: 'groq-token-available',
      renotify: true,
      data: { url: '/' }
    };

    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then(reg => {
        if (reg && reg.showNotification) {
          reg.showNotification(notifTitle, notifOptions);
        } else if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(notifTitle, notifOptions);
        }
      }).catch(() => {
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(notifTitle, notifOptions);
        }
      });
    } else if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notifTitle, notifOptions);
    }

    showToastNotification('🎉 Tokens Groq de nouveau disponibles ! Vous pouvez réessayer.', true);

    document.querySelectorAll('.ftj-groq-ratelimit-banner').forEach(b => {
      updateBannerToReady(b);
    });
  }

  function updateBannerToReady(banner) {
    if (!banner) return;
    banner.className = 'ftj-groq-ratelimit-banner rounded-2xl border border-emerald-300 bg-emerald-50 p-4 text-emerald-950 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3';
    banner.innerHTML = `
      <div class="flex items-center gap-3">
        <span class="text-2xl" aria-hidden="true">🎉</span>
        <div>
          <div class="font-bold text-sm text-emerald-950">Tokens Groq de nouveau disponibles !</div>
          <div class="text-xs text-emerald-800">Le délai d'attente est écoulé. Vous pouvez relancer vos opérations avec l'IA.</div>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <button type="button" class="ftj-retry-banner-btn inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all focus:outline-none">
          <span>🔄 Réessayer maintenant</span>
        </button>
        <button type="button" class="ftj-close-banner-btn text-emerald-700 hover:text-emerald-900 font-bold text-lg px-2 py-1" title="Fermer">&times;</button>
      </div>
    `;
    banner.querySelector('.ftj-close-banner-btn')?.addEventListener('click', () => {
      banner.classList.add('hidden');
    });
    banner.querySelector('.ftj-retry-banner-btn')?.addEventListener('click', () => {
      banner.classList.add('hidden');
      if (typeof banner._retryAction === 'function') {
        banner._retryAction();
      }
    });
  }

  /**
   * Affiche la bannière d'alerte pour l'épuisement de tokens Groq
   * avec compte à rebours dynamique et bouton "Mettre un rappel" si PWA
   */
  function showGroqTokenLimitBanner({ retryAfterSeconds, formattedDuration, container, onRetry, customMessage }) {
    const targetContainer = container || groqRateLimitGlobalBanner;
    if (!targetContainer) return;

    const seconds = Math.max(3, retryAfterSeconds || 60);
    const initialDurationStr = formattedDuration || formatDurationFr(seconds);
    const isRunningPwa = isPwa();
    const targetTime = Date.now() + (seconds * 1000);

    targetContainer.classList.remove('hidden');
    targetContainer._retryAction = onRetry;

    targetContainer.className = 'ftj-groq-ratelimit-banner rounded-2xl border border-amber-300 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 p-4 text-amber-950 shadow-md transition-all space-y-3';

    targetContainer.innerHTML = `
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div class="flex items-start gap-3">
          <span class="text-2xl mt-0.5" aria-hidden="true">⏳</span>
          <div class="space-y-0.5">
            <div class="font-extrabold text-sm text-amber-950 flex items-center gap-2 flex-wrap">
              <span>Plus assez de tokens Groq disponibles</span>
              <span class="px-2 py-0.5 rounded-full text-[11px] font-black bg-amber-200/80 text-amber-900 border border-amber-300">
                Quota temporaire
              </span>
            </div>
            <p class="text-xs sm:text-sm text-amber-900 leading-relaxed">
              ${customMessage ? escapeHtml(customMessage) + ' ' : ''}Veuillez retenter dans <strong class="ftj-countdown font-black text-amber-950 bg-amber-200/60 px-1.5 py-0.5 rounded">${initialDurationStr}</strong>.
            </p>
          </div>
        </div>
        
        <!-- Bouton Mettre un rappel (affiché si en PWA) -->
        <div class="flex items-center gap-2 self-end sm:self-center shrink-0">
          ${isRunningPwa ? `
            <button
              type="button"
              class="ftj-pwa-reminder-btn inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500"
              title="Activer un rappel par notification quand les tokens seront de nouveau utilisables"
            >
              <span aria-hidden="true">🔔</span>
              <span class="ftj-reminder-label">Mettre un rappel</span>
            </button>
          ` : ''}
          <button
            type="button"
            class="ftj-close-banner-btn text-amber-700 hover:text-amber-900 text-xl font-bold p-1 leading-none rounded-lg hover:bg-amber-200/50 transition-colors"
            aria-label="Fermer cette notification"
          >
            &times;
          </button>
        </div>
      </div>
      <div class="ftj-permission-notice hidden text-xs font-semibold text-rose-800 bg-rose-100 border border-rose-300 px-3 py-1.5 rounded-xl"></div>
    `;

    const countdownEl = targetContainer.querySelector('.ftj-countdown');
    const reminderBtn = targetContainer.querySelector('.ftj-pwa-reminder-btn');
    const closeBtn = targetContainer.querySelector('.ftj-close-banner-btn');
    const permNotice = targetContainer.querySelector('.ftj-permission-notice');

    closeBtn?.addEventListener('click', () => {
      targetContainer.classList.add('hidden');
    });

    // Si un rappel est déjà en cours dans le localStorage
    const existingReminder = localStorage.getItem('ftj_groq_reminder');
    if (existingReminder && reminderBtn) {
      try {
        const parsed = JSON.parse(existingReminder);
        if (parsed.targetTime > Date.now()) {
          reminderBtn.disabled = true;
          reminderBtn.className = 'inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-sm opacity-90 cursor-default';
          const label = reminderBtn.querySelector('.ftj-reminder-label');
          if (label) label.textContent = 'Rappel activé ✅';
        }
      } catch {}
    }

    reminderBtn?.addEventListener('click', async () => {
      const perm = await requestNotificationPermission();
      if (perm === 'granted') {
        const currentSec = Math.max(1, Math.ceil((targetTime - Date.now()) / 1000));
        localStorage.setItem('ftj_groq_reminder', JSON.stringify({
          targetTime,
          seconds: currentSec,
          formatted: formatDurationFr(currentSec)
        }));

        reminderBtn.disabled = true;
        reminderBtn.className = 'inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-sm opacity-90 cursor-default';
        const label = reminderBtn.querySelector('.ftj-reminder-label');
        if (label) label.textContent = 'Rappel activé ✅';

        if (permNotice) permNotice.classList.add('hidden');
        showToastNotification(`🔔 Rappel programmé ! Notification dans ${formatDurationFr(currentSec)}.`, true);

        if (navigator.serviceWorker && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: 'FTJ_SCHEDULE_REMINDER',
            delayMs: currentSec * 1000,
            title: 'Tokens Groq disponibles ! 🚀',
            options: {
              body: 'Le temps d\'attente est écoulé. Vos quotas sont réinitialisés, vous pouvez relancer votre requête.',
              icon: '/favicon.svg',
              badge: '/favicon.svg',
              tag: 'groq-token-available'
            }
          });
        }

        if (activeReminderTimeout) clearTimeout(activeReminderTimeout);
        activeReminderTimeout = setTimeout(() => {
          triggerGroqReminderNotification();
        }, currentSec * 1000);
      } else if (perm === 'denied') {
        if (permNotice) {
          permNotice.textContent = '⚠️ Notifications désactivées. Veuillez autoriser les notifications dans les paramètres de votre navigateur/application pour recevoir le rappel.';
          permNotice.classList.remove('hidden');
        }
      } else {
        if (permNotice) {
          permNotice.textContent = '⚠️ Les notifications ne sont pas prises en charge sur ce terminal.';
          permNotice.classList.remove('hidden');
        }
      }
    });

    // Compte à rebours temps réel
    if (activeCountdownInterval) clearInterval(activeCountdownInterval);
    activeCountdownInterval = setInterval(() => {
      const remainingSec = Math.ceil((targetTime - Date.now()) / 1000);
      if (remainingSec <= 0) {
        clearInterval(activeCountdownInterval);
        activeCountdownInterval = null;
        updateBannerToReady(targetContainer);
        if (localStorage.getItem('ftj_groq_reminder')) {
          triggerGroqReminderNotification();
        }
      } else {
        if (countdownEl) {
          countdownEl.textContent = formatDurationFr(remainingSec);
        }
      }
    }, 1000);
  }

  /**
   * Reprend un rappel en cours au chargement de la page
   */
  function checkAndResumeActiveReminder() {
    const saved = localStorage.getItem('ftj_groq_reminder');
    if (!saved) return;
    try {
      const reminder = JSON.parse(saved);
      const now = Date.now();
      if (reminder.targetTime <= now) {
        triggerGroqReminderNotification();
      } else {
        const remainingSec = Math.ceil((reminder.targetTime - now) / 1000);
        showGroqTokenLimitBanner({
          retryAfterSeconds: remainingSec,
          formattedDuration: formatDurationFr(remainingSec),
          customMessage: "Un rappel pour les tokens Groq est actuellement en cours."
        });
        if (activeReminderTimeout) clearTimeout(activeReminderTimeout);
        activeReminderTimeout = setTimeout(() => {
          triggerGroqReminderNotification();
        }, remainingSec * 1000);
      }
    } catch {
      localStorage.removeItem('ftj_groq_reminder');
    }
  }

  // Vérification au chargement
  checkAndResumeActiveReminder();

  // ========================================================
  // GESTION DE LA PERSISTANCE LOCALE & DU CACHE (COOKIES, LOCALSTORAGE, INDEXEDDB)
  // ========================================================

  function updateCacheBadgeUI(state) {
    if (!cacheStatusBadge || !cacheStatusText || !cacheStatusDot) return;

    if (!state || !state.hasCache) {
      cacheStatusBadge.className = 'inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border bg-slate-50 text-slate-700 border-slate-200 shadow-sm transition-all';
      cacheStatusDot.className = 'w-2.5 h-2.5 rounded-full bg-slate-400';
      cacheStatusText.textContent = 'Aucune donnée locale';
      cacheStatusBadge.title = 'Aucune donnée enregistrée dans les cookies ou IndexedDB';
      if (clearCacheBtn) clearCacheBtn.classList.add('hidden');
      return;
    }

    if (state.isExpired) {
      cacheStatusBadge.className = 'inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border bg-rose-50 text-rose-800 border-rose-200 shadow-sm transition-all';
      cacheStatusDot.className = 'w-2.5 h-2.5 rounded-full bg-rose-500';
      cacheStatusText.textContent = `⚠️ Cache expiré (${state.expiryFormatted || ''})`;
      cacheStatusBadge.title = `Le cache local a expiré le ${state.expiryFormatted}. Cliquez sur 'Enregistrer (+7j)' pour le renouveler.`;
      if (clearCacheBtn) clearCacheBtn.classList.remove('hidden');
      return;
    }

    // Cache actif et valide
    cacheStatusBadge.className = 'inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border bg-emerald-50 text-emerald-800 border-emerald-200 shadow-sm transition-all';
    cacheStatusDot.className = 'w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse';
    cacheStatusText.textContent = `💾 Cache actif : ${state.remainingTimeStr}`;
    cacheStatusBadge.title = `Données conservées localement (Cookies, localStorage & IndexedDB) jusqu'au ${state.expiryFormatted}. Cliquez sur 'Enregistrer (+7j)' pour allonger la durée de validité de 7 jours.`;
    if (clearCacheBtn) clearCacheBtn.classList.remove('hidden');
  }

  async function saveCurrentAppState(ttlDays = 7) {
    if (!window.storageManager) return null;
    const query = queryInput.value.trim();
    const exclusions = exclusionsInput.value.trim();
    const geoRegion = document.querySelector('input[name="geoRegion"]:checked')?.value || 'all';

    const res = await window.storageManager.saveState({
      query,
      exclusions,
      geoRegion,
      cvCriteria: currentCvCriteria,
      cvFileName: currentCvFileName,
      cvRawText: currentCvRawText,
      cvFeedback: currentCvFeedback,
      jobs: currentJobs,
      jobInteractions,
      parsedCriteria: lastSearchData.parsedCriteria,
      stats: lastSearchData.stats,
      availableSources: lastSearchData.availableSources,
      ttlDays
    });

    updateCacheBadgeUI({
      hasCache: true,
      isExpired: false,
      remainingTimeStr: res.remainingTimeStr,
      expiryFormatted: res.expiryFormatted
    });

    return res;
  }

  // Écouteur sur le bouton Enregistrer (+7j)
  if (saveCacheBtn) {
    saveCacheBtn.addEventListener('click', async () => {
      const originalHtml = saveCacheBtn.innerHTML;
      saveCacheBtn.disabled = true;
      saveCacheBtn.innerHTML = '<span class="animate-spin inline-block">⏳</span><span>Sauvegarde...</span>';

      try {
        await saveCurrentAppState(7);
        saveCacheBtn.className = 'inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-emerald-600 bg-emerald-600 text-white font-bold text-xs shadow-sm transition-all focus:outline-none min-h-[38px]';
        saveCacheBtn.innerHTML = '<span>✅ Enregistré (+7j) !</span>';

        setTimeout(() => {
          saveCacheBtn.className = 'inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-indigo-600 bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 font-bold text-xs shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 min-h-[38px]';
          saveCacheBtn.innerHTML = originalHtml;
          saveCacheBtn.disabled = false;
        }, 2500);
      } catch (err) {
        console.error('Erreur sauvegarde cache:', err);
        saveCacheBtn.innerHTML = '<span>❌ Erreur</span>';
        setTimeout(() => {
          saveCacheBtn.innerHTML = originalHtml;
          saveCacheBtn.disabled = false;
        }, 2500);
      }
    });
  }

  // Écouteur sur le bouton Vider le cache
  if (clearCacheBtn) {
    clearCacheBtn.addEventListener('click', async () => {
      const confirmed = window.confirm('Voulez-vous supprimer toutes les données locales sauvegardées (Cookies, localStorage et IndexedDB) ?');
      if (!confirmed) return;

      try {
        await window.storageManager.clearAll();
        currentJobs = [];
        jobInteractions = {};
        activeUserStatusFilter = 'all';
        currentCvCriteria = null;
        currentCvFileName = '';
        currentCvRawText = '';
        isGroqAdaptedCv = false;
        lastSearchData = { parsedCriteria: null, stats: null, availableSources: null };
        if (cvFileInput) cvFileInput.value = '';
        updateCvQuickSummary(null);
        if (cvFilterRow) cvFilterRow.classList.add('hidden');
        resultsSection.classList.add('hidden');
        updateUserStatusFilterBadges();
        updateCacheBadgeUI({ hasCache: false });
      } catch (err) {
        console.error('Erreur purge cache:', err);
      }
    });
  }

  // Chargement et restauration automatique de l'état au démarrage
  async function initStorageState() {
    if (!window.storageManager) return;
    try {
      const cached = await window.storageManager.loadState();
      updateCacheBadgeUI(cached);

      // Restauration des interactions (Favoris & Désintéressés)
      if (cached.jobInteractions) {
        jobInteractions = cached.jobInteractions;
      } else if (window.storageManager.getJobInteractions) {
        jobInteractions = window.storageManager.getJobInteractions() || {};
      }
      updateUserStatusFilterBadges();

      // Restauration des candidatures et entretiens
      if (cached.candidatures) {
        candidatures = cached.candidatures;
      } else if (window.storageManager.getCandidatures) {
        candidatures = window.storageManager.getCandidatures() || {};
      }
      updateCandidaturesBadgeUI();
      updateCandidatureFilterBadges();

      if (cached.hasCache && !cached.isExpired) {
        // Restauration des critères du formulaire
        if (cached.query && !queryInput.value) {
          queryInput.value = cached.query;
        }
        if (cached.exclusions && !exclusionsInput.value) {
          exclusionsInput.value = cached.exclusions;
        }
        if (cached.geoRegion) {
          const radio = document.querySelector(`input[name="geoRegion"][value="${cached.geoRegion}"]`);
          if (radio) radio.checked = true;
        }

        // Restauration du profil CV
        if (cached.cvCriteria) {
          currentCvCriteria = cached.cvCriteria;
          currentCvFileName = cached.cvFileName || 'CV sauvegardé';
          currentCvRawText = cached.cvRawText || '';
          updateCvQuickSummary(currentCvCriteria, currentCvFileName);
        }

        // Restauration du feedback Groq si disponible
        if (cached.cvFeedback) {
          currentCvFeedback = cached.cvFeedback;
          renderCvFeedback(currentCvFeedback);
        }

        // Restauration des offres sauvegardées sans scraper à nouveau
        if (cached.jobs && cached.jobs.length > 0) {
          displayResults({
            jobs: cached.jobs,
            parsedCriteria: cached.parsedCriteria,
            stats: cached.stats,
            availableSources: cached.availableSources
          }, true);
        }
      }
    } catch (err) {
      console.warn('[FindTheJob] Erreur initialisation cache local:', err);
    }
  }

  initStorageState();

  // Rafraîchissement périodique du badge (toutes les minutes)
  setInterval(async () => {
    if (window.storageManager) {
      const state = await window.storageManager.loadState();
      if (state && state.hasCache) {
        updateCacheBadgeUI(state);
      }
    }
  }, 60000);

  // 2. Bouton d'exemple pré-rempli (DROM / France)
  exampleBtn.addEventListener('click', () => {
    queryInput.value = `Développeur Fullstack React / Python ou Node.js
Poste basé à La Réunion (974) ou en France métropolitaine
CDI ou Freelance avec télétravail hybride`;
    exclusionsInput.value = `Pas de stage ni d'alternance
Pas d'ESN ni de cabinet de prestation
Pas de PHP ni de WordPress`;
    const dromRadio = document.querySelector('input[name="geoRegion"][value="drom"]');
    if (dromRadio) dromRadio.checked = true;
    queryInput.focus();
  });

  // Raccourci Ctrl+Entrée pour soumettre le formulaire sans bloquer les retours à la ligne
  const handleKeydown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      searchForm.requestSubmit();
    }
  };
  queryInput.addEventListener('keydown', handleKeydown);
  exclusionsInput.addEventListener('keydown', handleKeydown);

  // ========================================================
  // GESTION DU CV & ANALYSE SANS IA (CRITÈRES DE PERTINENCE)
  // ========================================================

  let isScoringCvWithGroq = false;

  function updateCvScoringStatusUI(isLoading) {
    if (!cvScoreStatusIndicator) return;
    if (isLoading) {
      cvScoreStatusIndicator.classList.remove('hidden');
      cvScoreStatusIndicator.innerHTML = '<span class="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-full"><span class="animate-spin text-xs">⏳</span><span>Évaluation Groq en cours...</span></span>';
      if (recalcCvGroqBtn) {
        recalcCvGroqBtn.disabled = true;
        recalcCvGroqBtn.classList.add('opacity-50', 'cursor-not-allowed');
      }
    } else {
      cvScoreStatusIndicator.classList.remove('hidden');
      cvScoreStatusIndicator.innerHTML = '<span class="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full" title="Scores évalués avec l\'IA Groq"><span>✨</span><span>Scores validés par Groq</span></span>';
      if (recalcCvGroqBtn) {
        recalcCvGroqBtn.disabled = false;
        recalcCvGroqBtn.classList.remove('opacity-50', 'cursor-not-allowed');
      }
      setTimeout(() => {
        if (!isScoringCvWithGroq && cvScoreStatusIndicator) {
          cvScoreStatusIndicator.classList.add('hidden');
        }
      }, 6000);
    }
  }

  function recalculateAllCvScores(forceGroq = false) {
    if (!currentCvCriteria) {
      currentJobs.forEach(j => {
        j.cvScore = null;
        j.cvMatchDetails = '';
        j.matchedLogiciels = [];
        j.cvScoreSource = null;
        j.cvMatchedStrengths = [];
      });
      if (cvFilterRow) cvFilterRow.classList.add('hidden');
      return;
    }

    // 1. Calcul immédiat du score déterministe (pour un rendu instantané sans lag)
    currentJobs.forEach(job => {
      // Si l'offre possède déjà un score Groq officiel et qu'on ne force pas le recalcul, on le préserve
      if (!forceGroq && job.cvScoreSource === 'groq' && job.cvScore !== undefined && job.cvScore !== null) {
        return;
      }
      const res = window.cvParser.calculateCvJobScore(job, currentCvCriteria);
      job.cvScore = res.score;
      job.cvMatchDetails = res.matchDetails;
      job.matchedLogiciels = res.matchedLogiciels;
      job.cvScoreSource = 'local';
    });

    if (cvFilterRow) cvFilterRow.classList.remove('hidden');

    // 2. Évaluation sémantique Groq en arrière-plan si demandée
    if (forceGroq && currentJobs.length > 0 && !isScoringCvWithGroq) {
      scoreAllJobsWithGroqAsync();
    }
  }

  async function scoreAllJobsWithGroqAsync() {
    if (!currentCvCriteria || currentJobs.length === 0 || isScoringCvWithGroq) return;

    isScoringCvWithGroq = true;
    updateCvScoringStatusUI(true);

    try {
      console.log(`[Groq CV] Envoi de ${currentJobs.length} offres à l'API pour évaluation sémantique...`);
      const response = await fetch('/api/cv/score-jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobs: currentJobs,
          cvCriteria: currentCvCriteria
        })
      });

      const data = await response.json();
      if (response.ok && data.success && Array.isArray(data.jobs)) {
        const scoredMap = new Map();
        data.jobs.forEach(sj => {
          const key = sj.id || sj.title;
          scoredMap.set(key, sj);
        });

        currentJobs.forEach(job => {
          const key = job.id || job.title;
          const sj = scoredMap.get(key);
          if (sj && sj.cvScore !== undefined && sj.cvScore !== null) {
            job.cvScore = sj.cvScore;
            job.cvMatchDetails = sj.cvMatchDetails || job.cvMatchDetails;
            job.cvMatchedStrengths = sj.cvMatchedStrengths || [];
            job.cvScoreSource = 'groq';
          }
        });

        // Réapplication immédiate du tri et des filtres
        applyAllFiltersAndSort();
        await saveCurrentAppState(7);

        if (data.groqRateLimit) {
          showGroqTokenLimitBanner({
            retryAfterSeconds: data.groqRateLimit.retryAfterSeconds,
            formattedDuration: data.groqRateLimit.retryAfterFormatted,
            container: cvGroqRateLimitBanner,
            customMessage: "Évaluation CV partielle : plus assez de tokens Groq disponibles pour noter toutes les offres.",
            onRetry: () => recalculateAllCvScores(true)
          });
        }
      } else if (data && data.isGroqRateLimit) {
        showGroqTokenLimitBanner({
          retryAfterSeconds: data.retryAfterSeconds,
          formattedDuration: data.retryAfterFormatted,
          container: cvGroqRateLimitBanner,
          customMessage: "Évaluation CV reportée : plus assez de tokens Groq disponibles.",
          onRetry: () => recalculateAllCvScores(true)
        });
      }
    } catch (err) {
      console.warn('[Groq CV] Échec de l\'évaluation asynchrone Groq:', err);
      if (isGroqRateLimitError(err) || err.data?.isGroqRateLimit || err.status === 429) {
        const wait = extractGroqWaitTime(err.data || err);
        showGroqTokenLimitBanner({
          retryAfterSeconds: wait.totalSeconds,
          formattedDuration: wait.formatted,
          container: cvGroqRateLimitBanner,
          customMessage: "Évaluation CV en pause : plus assez de tokens Groq disponibles.",
          onRetry: () => recalculateAllCvScores(true)
        });
      }
    } finally {
      isScoringCvWithGroq = false;
      updateCvScoringStatusUI(false);
    }
  }

  function updateCvQuickSummary(criteria, fileName) {
    if (!criteria) {
      if (cvStatusBadge) cvStatusBadge.classList.add('hidden');
      if (cvQuickSummary) cvQuickSummary.classList.add('hidden');
      if (cvInitialChoiceContainer) cvInitialChoiceContainer.classList.remove('hidden');
      if (cvUploadBtnText) cvUploadBtnText.textContent = 'Glissez votre CV ici ou cliquez pour parcourir';
      return;
    }

    if (cvInitialChoiceContainer) cvInitialChoiceContainer.classList.add('hidden');
    if (cvStatusBadge) cvStatusBadge.classList.remove('hidden');
    if (cvStatusText) cvStatusText.textContent = fileName ? `${fileName}` : 'Profil CV actif';
    if (cvQuickSummary) cvQuickSummary.classList.remove('hidden');

    const techCount = (criteria.logiciels || []).length;
    const softCount = (criteria.softSkills || []).length;

    cvQuickSummary.innerHTML = `
      <span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
        💻 ${techCount} logiciel${techCount > 1 ? 's' : ''}
      </span>
      <span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
        🤝 ${softCount} soft skill${softCount > 1 ? 's' : ''}
      </span>
      ${criteria.lieux ? `<span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">📍 ${escapeHtml(criteria.lieux)}</span>` : ''}
      ${criteria.vehicule ? `<span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">🚗 Véhiculé</span>` : ''}
    `;
  }

  // Rendu de la zone de retour d'analyse Groq (Points positifs & Points à améliorer)
  function renderCvFeedback(feedback) {
    if (!feedback || (!feedback.pointsPositifs?.length && !feedback.pointsAmeliorer?.length)) {
      if (cvGroqFeedbackContainer) cvGroqFeedbackContainer.classList.add('hidden');
      if (modalCvFeedbackBanner) modalCvFeedbackBanner.classList.add('hidden');
      return;
    }

    const strengths = feedback.pointsPositifs || [];
    const improvements = feedback.pointsAmeliorer || [];

    // 1. Rendu dans le bloc CV de la page d'accueil
    if (cvStrengthsList) {
      cvStrengthsList.innerHTML = strengths
        .map(s => `<li class="flex items-start gap-1.5"><span class="text-emerald-600 font-bold leading-none mt-0.5" aria-hidden="true">✔</span><span>${escapeHtml(s)}</span></li>`)
        .join('');
    }

    if (cvImprovementsList) {
      cvImprovementsList.innerHTML = improvements
        .map(i => `<li class="flex items-start gap-1.5"><span class="text-amber-600 font-bold leading-none mt-0.5" aria-hidden="true">▸</span><span>${escapeHtml(i)}</span></li>`)
        .join('');
    }

    if (cvGroqFeedbackContainer) {
      cvGroqFeedbackContainer.classList.remove('hidden');
    }

    // 2. Rendu dans la modale
    if (modalCvStrengthsList) {
      modalCvStrengthsList.innerHTML = strengths
        .map(s => `<li>${escapeHtml(s)}</li>`)
        .join('');
    }

    if (modalCvImprovementsList) {
      modalCvImprovementsList.innerHTML = improvements
        .map(i => `<li>${escapeHtml(i)}</li>`)
        .join('');
    }

    if (modalCvFeedbackBanner) {
      modalCvFeedbackBanner.classList.remove('hidden');
    }
  }

  // Écouteur pour masquer / afficher la boîte de feedback
  if (toggleCvFeedbackBtn && cvFeedbackGrid) {
    toggleCvFeedbackBtn.addEventListener('click', () => {
      const isHidden = cvFeedbackGrid.classList.contains('hidden');
      if (isHidden) {
        cvFeedbackGrid.classList.remove('hidden');
        toggleCvFeedbackBtn.textContent = 'Masquer';
        toggleCvFeedbackBtn.setAttribute('aria-expanded', 'true');
      } else {
        cvFeedbackGrid.classList.add('hidden');
        toggleCvFeedbackBtn.textContent = 'Afficher';
        toggleCvFeedbackBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Traitement mutualisé d'un fichier CV (sélection ou drag-and-drop)
  async function handleCvFileSelected(file) {
    if (!file) return;

    if (cvUploadBtnText) {
      cvUploadBtnText.textContent = `⏳ Analyse locale de ${file.name}...`;
    }

    try {
      const rawText = await window.cvParser.extractTextFromFile(file);
      currentCvRawText = rawText;
      isGroqAdaptedCv = false;
      currentCvFeedback = null;
      renderCvFeedback(null);
      const extracted = window.cvParser.parseCvWithoutAi(rawText);
      currentCvCriteria = extracted;
      currentCvFileName = file.name;

      updateCvQuickSummary(currentCvCriteria, currentCvFileName);
      recalculateAllCvScores(true);
      applyAllFiltersAndSort();
      await saveCurrentAppState(7);
    } catch (err) {
      console.error('Erreur analyse CV:', err);
      alert(`Impossible d'analyser ce CV : ${err.message}`);
    } finally {
      if (cvUploadBtnText) {
        cvUploadBtnText.textContent = 'Glissez votre CV ici ou cliquez pour parcourir';
      }
    }
  }

  // Import de fichier CV (clic input)
  if (cvFileInput) {
    cvFileInput.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (file) {
        handleCvFileSelected(file);
      }
    });
  }

  // Support natif du Drag & Drop interactif sur la zone de dépôt
  if (cvUploadLabel) {
    ['dragenter', 'dragover'].forEach(eventName => {
      cvUploadLabel.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        cvUploadLabel.classList.add('border-indigo-500', 'bg-indigo-50/80', 'ring-2', 'ring-indigo-300');
      }, false);
    });

    ['dragleave', 'dragend'].forEach(eventName => {
      cvUploadLabel.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        cvUploadLabel.classList.remove('border-indigo-500', 'bg-indigo-50/80', 'ring-2', 'ring-indigo-300');
      }, false);
    });

    cvUploadLabel.addEventListener('drop', (e) => {
      e.preventDefault();
      e.stopPropagation();
      cvUploadLabel.classList.remove('border-indigo-500', 'bg-indigo-50/80', 'ring-2', 'ring-indigo-300');
      const file = e.dataTransfer?.files?.[0];
      if (file) {
        handleCvFileSelected(file);
      }
    }, false);
  }

  // Suppression du CV
  if (clearCvBtn) {
    clearCvBtn.addEventListener('click', async () => {
      currentCvCriteria = null;
      currentCvFileName = '';
      currentCvRawText = '';
      currentCvFeedback = null;
      isGroqAdaptedCv = false;
      renderCvFeedback(null);
      if (cvFileInput) cvFileInput.value = '';
      activeCvRelevanceFilter = 'all';
      updateCvRelevanceFilterBadges();
      updateCvQuickSummary(null);
      recalculateAllCvScores();
      applyAllFiltersAndSort();
      await saveCurrentAppState(7);
    });
  }

  // Bouton "Adapter les critères avec Groq*"
  if (adaptCvGroqBtn) {
    adaptCvGroqBtn.addEventListener('click', async () => {
      if (!currentCvRawText) {
        alert('Veuillez d\'abord sélectionner ou déposer un fichier CV (.pdf, .docx, .txt) pour que l\'IA Groq puisse l\'analyser.');
        if (cvFileInput) cvFileInput.click();
        return;
      }

      const originalHtml = adaptCvGroqBtn.innerHTML;
      adaptCvGroqBtn.disabled = true;
      adaptCvGroqBtn.innerHTML = '<span class="animate-spin inline-block mr-1">⏳</span><span>Analyse Groq en cours...</span>';

      try {
        const response = await fetch('/api/cv/adapt-groq', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cvText: currentCvRawText })
        });

        const data = await response.json();
        if (!response.ok || !data.success) {
          const customErr = new Error(data.error || 'Erreur lors de l\'adaptation des critères par Groq.');
          customErr.data = data;
          customErr.status = response.status;
          throw customErr;
        }

        currentCvCriteria = data.criteria;
        currentCvFeedback = data.feedback || {
          pointsPositifs: data.criteria.pointsPositifs,
          pointsAmeliorer: data.criteria.pointsAmeliorer
        };
        renderCvFeedback(currentCvFeedback);

        isGroqAdaptedCv = true;
        const displayName = currentCvFileName ? `${currentCvFileName} (adapté Groq*)` : 'Profil adapté par Groq*';
        updateCvQuickSummary(currentCvCriteria, displayName);
        recalculateAllCvScores(true);
        applyAllFiltersAndSort();
        await saveCurrentAppState(7);

        // Masquer une éventuelle alerte de rate limit précédente
        if (cvGroqRateLimitBanner) cvGroqRateLimitBanner.classList.add('hidden');

        adaptCvGroqBtn.className = 'inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-emerald-600 bg-emerald-600 text-white font-bold text-xs shadow-sm transition-all focus:outline-none min-h-[40px]';
        adaptCvGroqBtn.innerHTML = '<span>✅ Critères adaptés par Groq !</span>';

        // Ouverture automatique de la modale de révision
        setTimeout(() => {
          openCvCriteriaModalFunc();
        }, 350);

        setTimeout(() => {
          adaptCvGroqBtn.className = 'inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-indigo-200 bg-gradient-to-r from-indigo-50 via-purple-50 to-indigo-50 hover:from-indigo-600 hover:to-purple-600 hover:text-white text-indigo-800 font-bold text-xs shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 min-h-[40px]';
          adaptCvGroqBtn.innerHTML = originalHtml;
          adaptCvGroqBtn.disabled = false;
        }, 3000);
      } catch (err) {
        console.error('Erreur adaptation CV par Groq:', err);
        if (isGroqRateLimitError(err) || err.data?.isGroqRateLimit || err.status === 429) {
          const wait = extractGroqWaitTime(err.data || err);
          showGroqTokenLimitBanner({
            retryAfterSeconds: wait.totalSeconds,
            formattedDuration: wait.formatted,
            container: cvGroqRateLimitBanner,
            customMessage: "Impossible d'adapter le CV actuellement : plus assez de tokens Groq disponibles.",
            onRetry: () => adaptCvGroqBtn.click()
          });
        } else {
          alert(`Erreur Groq : ${err.message}`);
        }
        adaptCvGroqBtn.innerHTML = originalHtml;
        adaptCvGroqBtn.disabled = false;
      }
    });
  }

  // Modale Modification des critères extraits du CV
  function openCvCriteriaModalFunc() {
    const crit = currentCvCriteria || window.cvParser.parseCvWithoutAi('');

    cvFormationsInput.value = (crit.formations || []).join('\n');
    cvExperienceInput.value = Array.isArray(crit.experience) ? crit.experience.join('\n') : (crit.experience || '');
    cvSoftSkillsInput.value = (crit.softSkills || []).join(', ');
    cvLogicielsInput.value = (crit.logiciels || []).join(', ');
    cvAgeInput.value = crit.age === 'Non précisé' ? '' : (crit.age || '');
    cvLieuxInput.value = crit.lieux || '';
    cvVehiculeInput.value = crit.vehicule ? 'true' : 'false';

    if (cvModalBadge) {
      if (isGroqAdaptedCv) {
        cvModalBadge.className = 'px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-800 border border-purple-200 flex items-center gap-1';
        cvModalBadge.innerHTML = '<span>✨ Profil adapté par Groq AI</span><span class="text-[10px] text-amber-700 font-normal">(*Vérifiez les données)</span>';
      } else {
        cvModalBadge.className = 'px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200';
        cvModalBadge.textContent = 'Profil Candidat (Extraction locale)';
      }
    }

    lastFocusedElement = openCvCriteriaBtn;
    document.body.style.overflow = 'hidden';
    cvCriteriaModal.classList.remove('hidden');
    cvFormationsInput.focus();
  }

  function closeCvCriteriaModalFunc() {
    cvCriteriaModal.classList.add('hidden');
    document.body.style.overflow = '';
    if (lastFocusedElement) {
      lastFocusedElement.focus();
    }
  }

  if (openCvCriteriaBtn) {
    openCvCriteriaBtn.addEventListener('click', openCvCriteriaModalFunc);
  }
  if (cvCriteriaCloseBtn) {
    cvCriteriaCloseBtn.addEventListener('click', closeCvCriteriaModalFunc);
  }
  if (cancelCvCriteriaBtn) {
    cancelCvCriteriaBtn.addEventListener('click', closeCvCriteriaModalFunc);
  }
  if (cvCriteriaModal) {
    cvCriteriaModal.addEventListener('click', (e) => {
      if (e.target === cvCriteriaModal) closeCvCriteriaModalFunc();
    });
  }

  if (cvCriteriaForm) {
    cvCriteriaForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const formations = cvFormationsInput.value
        .split(/[\n\r]+/)
        .map(s => s.trim())
        .filter(Boolean);

      const experience = cvExperienceInput.value
        .split(/[\n\r]+/)
        .map(s => s.trim())
        .filter(Boolean);

      const softSkills = cvSoftSkillsInput.value
        .split(/[,;\n]+/)
        .map(s => s.trim())
        .filter(Boolean);

      const logiciels = cvLogicielsInput.value
        .split(/[,;\n]+/)
        .map(s => s.trim())
        .filter(Boolean);

      currentCvCriteria = {
        formations,
        experience,
        softSkills,
        logiciels,
        age: cvAgeInput.value.trim() || 'Non précisé',
        lieux: cvLieuxInput.value.trim() || '',
        vehicule: cvVehiculeInput.value === 'true'
      };

      updateCvQuickSummary(currentCvCriteria, currentCvFileName || 'Critères personnalisés');
      closeCvCriteriaModalFunc();
      recalculateAllCvScores(true);
      applyAllFiltersAndSort();
      await saveCurrentAppState(7);
    });
  }

  // Filtre Pertinence CV
  if (cvRelevanceFiltersContainer) {
    cvRelevanceFiltersContainer.querySelectorAll('button[data-cv-relevance]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        activeCvRelevanceFilter = e.currentTarget.dataset.cvRelevance || 'all';
        updateCvRelevanceFilterBadges();
        applyAllFiltersAndSort();
      });
    });
  }

  // Écouteur sur le bouton de recalcul Groq CV
  if (recalcCvGroqBtn) {
    recalcCvGroqBtn.addEventListener('click', () => {
      scoreAllJobsWithGroqAsync();
    });
  }

  function updateCvRelevanceFilterBadges() {
    if (!cvRelevanceFiltersContainer) return;
    cvRelevanceFiltersContainer.querySelectorAll('button[data-cv-relevance]').forEach(btn => {
      const isActive = btn.dataset.cvRelevance === activeCvRelevanceFilter;
      if (isActive) {
        btn.className = 'filter-badge active px-3 py-1 rounded-full text-xs font-bold border transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-emerald-500 bg-emerald-600 text-white border-emerald-600 shadow-sm';
      } else {
        btn.className = 'filter-badge px-3 py-1 rounded-full text-xs font-semibold border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-emerald-500';
      }
    });
  }

  // 3. Soumission du formulaire
  searchForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const query = queryInput.value.trim();
    const exclusions = exclusionsInput.value.trim();
    const geoRegion = document.querySelector('input[name="geoRegion"]:checked')?.value || 'all';

    if (!query && !exclusions) {
      alert('Veuillez renseigner au moins ce que vous cherchez.');
      return;
    }

    startProgressAnimation();

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          exclusions,
          geoRegion,
          cvCriteria: currentCvCriteria
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        const customErr = new Error(data.error || 'Erreur lors de la recherche.');
        customErr.data = data;
        customErr.status = response.status;
        throw customErr;
      }

      stopProgressAnimation();
      displayResults(data);

      if (data.groqRateLimit) {
        showGroqTokenLimitBanner({
          retryAfterSeconds: data.groqRateLimit.retryAfterSeconds,
          formattedDuration: data.groqRateLimit.retryAfterFormatted,
          container: groqRateLimitGlobalBanner,
          customMessage: "La recherche a été réalisée en mode standard : plus assez de tokens Groq disponibles pour l'analyse sémantique.",
          onRetry: () => submitBtn.click()
        });
      }
    } catch (error) {
      stopProgressAnimation();
      if (isGroqRateLimitError(error) || error.data?.isGroqRateLimit || error.status === 429) {
        const wait = extractGroqWaitTime(error.data || error);
        showGroqTokenLimitBanner({
          retryAfterSeconds: wait.totalSeconds,
          formattedDuration: wait.formatted,
          container: groqRateLimitGlobalBanner,
          customMessage: "Recherche interrompue : plus assez de tokens Groq disponibles.",
          onRetry: () => submitBtn.click()
        });
      } else {
        alert(`Erreur : ${error.message}`);
      }
    }
  });

  // 4. Animation des étapes de progression
  function startProgressAnimation() {
    submitBtn.disabled = true;
    resultsSection.classList.add('hidden');
    progressSection.classList.remove('hidden');

    resetSteps();
    setStepActive(step1);
    progressTitle.textContent = 'Analyse de votre recherche par Groq...';
    progressSubtitle.textContent = 'Détection sémantique des critères et identification des exclusions strictes.';

    let stepCounter = 1;
    progressInterval = setInterval(() => {
      stepCounter++;
      if (stepCounter === 2) {
        setStepCompleted(step1);
        setStepActive(step2);
        progressTitle.textContent = 'Scraping multi-plateformes en temps réel...';
        progressSubtitle.textContent = 'France Travail, LinkedIn, HelloWork, Météojob, Remotive...';
      } else if (stepCounter === 3) {
        setStepCompleted(step2);
        setStepActive(step3);
        progressTitle.textContent = 'Filtrage des exclusions & Classement IA...';
        progressSubtitle.textContent = 'Classement par pertinence et identification des offres avec exclusions.';
      }
    }, 2500);
  }

  function stopProgressAnimation() {
    clearInterval(progressInterval);
    progressSection.classList.add('hidden');
    submitBtn.disabled = false;
    resetSteps();
  }

  function resetSteps() {
    [step1, step2, step3].forEach(step => {
      step.className = 'flex items-center gap-1.5 text-slate-500 font-medium';
      step.querySelector('span:first-child').className = 'w-6 h-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs';
    });
  }

  function setStepActive(step) {
    step.className = 'flex items-center gap-1.5 text-indigo-700 font-bold';
    step.querySelector('span:first-child').className = 'w-6 h-6 rounded-full bg-indigo-50 border border-indigo-400 text-indigo-700 flex items-center justify-center text-xs font-bold ring-2 ring-indigo-500/20';
  }

  function setStepCompleted(step) {
    step.className = 'flex items-center gap-1.5 text-emerald-700 font-semibold';
    step.querySelector('span:first-child').className = 'w-6 h-6 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-700 flex items-center justify-center text-xs font-bold';
  }

  // 5. Affichage des résultats
  function displayResults(data, fromCache = false) {
    currentJobs = data.jobs || [];

    lastSearchData = {
      parsedCriteria: data.parsedCriteria || null,
      stats: data.stats || null,
      availableSources: data.availableSources || null
    };

    const totalCount = data.stats?.total || currentJobs.length;
    const recommendedCount = data.stats?.recommended || currentJobs.filter(j => !j.isExcluded).length;
    const excludedCount = data.stats?.excluded || currentJobs.filter(j => j.isExcluded).length;

    statRaw.textContent = totalCount;
    statKept.textContent = recommendedCount;
    statExcluded.textContent = excludedCount;

    resultsCountTitle.textContent = `${totalCount} offre${totalCount > 1 ? 's' : ''} trouvée${totalCount > 1 ? 's' : ''}${fromCache ? ' (chargées depuis le cache local)' : ''}`;
    
    const summary = data.parsedCriteria?.summary || '';
    intentSummaryText.textContent = summary 
      ? `Synthèse Groq : ${summary}` 
      : 'Toutes les offres sont affichées et classées par ordre de pertinence.';

    resultsSection.classList.remove('hidden');

    buildSourceFilters(data.availableSources || {});

    activeSourceFilter = 'all';
    activeRelevanceFilter = 'all';
    updateRelevanceFilterBadges();

    // Recalcul des scores d'adéquation CV si un CV est déjà chargé
    recalculateAllCvScores();
    activeCvRelevanceFilter = 'all';
    updateCvRelevanceFilterBadges();

    activeUserStatusFilter = 'all';
    updateUserStatusFilterBadges();

    activeCandidatureFilter = 'all';
    updateCandidatureFilterBadges();

    applyAllFiltersAndSort();

    if (!fromCache) {
      saveCurrentAppState(7);
      resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // Construction des boutons de filtre de provenance (Tailwind Thème Clair)
  function buildSourceFilters(sourcesMap) {
    if (!sourceFiltersContainer) return;
    sourceFiltersContainer.innerHTML = '';

    const safeMap = (sourcesMap && Object.keys(sourcesMap).length > 0) ? { ...sourcesMap } : {};
    if (Object.keys(safeMap).length === 0 && currentJobs.length > 0) {
      currentJobs.forEach(job => {
        const src = job.source || 'Autre';
        safeMap[src] = (safeMap[src] || 0) + 1;
      });
    }

    const allBtn = document.createElement('button');
    allBtn.type = 'button';
    allBtn.className = 'px-3 py-1 rounded-full text-xs font-bold border transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 bg-indigo-600 text-white border-indigo-600 shadow-sm';
    allBtn.dataset.source = 'all';
    allBtn.textContent = `Toutes (${currentJobs.length})`;
    allBtn.addEventListener('click', () => {
      activeSourceFilter = 'all';
      updateSourceFilterBadges();
      applyAllFiltersAndSort();
    });
    sourceFiltersContainer.appendChild(allBtn);

    Object.entries(safeMap).forEach(([srcName, count]) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'px-3 py-1 rounded-full text-xs font-semibold border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500';
      btn.dataset.source = srcName;
      btn.textContent = `${srcName} (${count})`;
      btn.addEventListener('click', () => {
        activeSourceFilter = srcName;
        updateSourceFilterBadges();
        applyAllFiltersAndSort();
      });
      sourceFiltersContainer.appendChild(btn);
    });
  }

  function updateSourceFilterBadges() {
    if (!sourceFiltersContainer) return;
    sourceFiltersContainer.querySelectorAll('button').forEach(btn => {
      const isActive = btn.dataset.source === activeSourceFilter;
      if (isActive) {
        btn.className = 'px-3 py-1 rounded-full text-xs font-bold border transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 bg-indigo-600 text-white border-indigo-600 shadow-sm';
      } else {
        btn.className = 'px-3 py-1 rounded-full text-xs font-semibold border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500';
      }
    });
  }

  // Gestion des filtres de pertinence
  if (relevanceFiltersContainer) {
    relevanceFiltersContainer.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', (e) => {
        activeRelevanceFilter = e.currentTarget.dataset.relevance || 'all';
        updateRelevanceFilterBadges();
        applyAllFiltersAndSort();
      });
    });
  }

  function updateRelevanceFilterBadges() {
    if (!relevanceFiltersContainer) return;
    const total = currentJobs.length;
    const recommended = currentJobs.filter(j => !j.isExcluded && (j.matchScore || 0) >= 40).length;
    const excluded = currentJobs.filter(j => j.isExcluded || (j.matchScore || 0) < 40).length;

    relevanceFiltersContainer.querySelectorAll('button').forEach(btn => {
      const rel = btn.dataset.relevance;
      const isActive = rel === activeRelevanceFilter;

      if (rel === 'all') {
        btn.textContent = `Toutes (${total})`;
      } else if (rel === 'recommended') {
        btn.textContent = `★ Recommandées (${recommended})`;
      } else if (rel === 'excluded') {
        btn.textContent = `⚠️ Non recommandées (${excluded})`;
      }

      if (isActive) {
        btn.className = 'px-3 py-1 rounded-full text-xs font-bold border transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 bg-indigo-600 text-white border-indigo-600 shadow-sm';
      } else {
        btn.className = 'px-3 py-1 rounded-full text-xs font-semibold border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500';
      }
    });
  }

  // Gestion du filtre par statut utilisateur (Favoris & Désintéressés)
  if (userStatusFiltersContainer) {
    userStatusFiltersContainer.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', (e) => {
        activeUserStatusFilter = e.currentTarget.dataset.userStatus || 'all';
        updateUserStatusFilterBadges();
        applyAllFiltersAndSort();
      });
    });
  }

  function updateUserStatusFilterBadges() {
    if (!userStatusFiltersContainer) return;
    const favCount = currentJobs.filter(j => jobInteractions[j.id] === 'favorite').length;
    const disCount = currentJobs.filter(j => jobInteractions[j.id] === 'dismissed').length;
    const unmarkedCount = currentJobs.filter(j => !jobInteractions[j.id]).length;

    if (countFavorites) countFavorites.textContent = favCount;
    if (countDismissed) countDismissed.textContent = disCount;
    if (countUnmarked) countUnmarked.textContent = unmarkedCount;

    userStatusFiltersContainer.querySelectorAll('button').forEach(btn => {
      const status = btn.dataset.userStatus;
      const isActive = status === activeUserStatusFilter;

      if (isActive) {
        btn.className = 'filter-badge active px-3 py-1 rounded-full text-xs font-bold border transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 bg-indigo-600 text-white border-indigo-600 shadow-sm';
      } else {
        btn.className = 'filter-badge px-3 py-1 rounded-full text-xs font-semibold border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500';
      }
    });
  }

  // Gestion du filtre par statut de candidature (Toutes / Non postulées / Postulées)
  if (candidatureFiltersContainer) {
    candidatureFiltersContainer.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', (e) => {
        activeCandidatureFilter = e.currentTarget.dataset.candidatureStatus || e.currentTarget.dataset.candidatureFilter || 'all';
        updateCandidatureFilterBadges();
        applyAllFiltersAndSort();
      });
    });
  }

  function updateCandidatureFilterBadges() {
    if (!candidatureFiltersContainer) return;
    const totalCount = currentJobs.length;
    const appliedCount = currentJobs.filter(j => Boolean(candidatures[j.id])).length;
    const unappliedCount = currentJobs.filter(j => !candidatures[j.id]).length;

    if (countApplied) countApplied.textContent = appliedCount;
    if (countUnapplied) countUnapplied.textContent = unappliedCount;
    const countTotalEl = document.getElementById('countTotalJobs');
    if (countTotalEl) countTotalEl.textContent = totalCount;

    candidatureFiltersContainer.querySelectorAll('button').forEach(btn => {
      const status = btn.dataset.candidatureStatus || btn.dataset.candidatureFilter;
      const isActive = status === activeCandidatureFilter;

      if (isActive) {
        btn.className = 'filter-badge active px-3 py-1 rounded-full text-xs font-bold border transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 bg-indigo-600 text-white border-indigo-600 shadow-sm';
      } else {
        btn.className = 'filter-badge px-3 py-1 rounded-full text-xs font-semibold border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500';
      }
    });
  }

  function setJobUserStatus(jobId, newStatus) {
    if (!jobId) return;
    if (newStatus === 'favorite' || newStatus === 'dismissed') {
      jobInteractions[jobId] = newStatus;
    } else {
      delete jobInteractions[jobId];
    }

    if (window.storageManager) {
      window.storageManager.saveJobInteraction(jobId, newStatus);
    }

    updateUserStatusFilterBadges();
    applyAllFiltersAndSort();
  }

  // Filtrage combiné et tri avec priorité absolue aux éléments non marqués
  function applyAllFiltersAndSort() {
    let filtered = [...currentJobs];

    // Filtre par statut utilisateur (Favoris / Désintéressés / Non marqués)
    if (activeUserStatusFilter === 'favorite') {
      filtered = filtered.filter(job => jobInteractions[job.id] === 'favorite');
    } else if (activeUserStatusFilter === 'dismissed') {
      filtered = filtered.filter(job => jobInteractions[job.id] === 'dismissed');
    } else if (activeUserStatusFilter === 'unmarked') {
      filtered = filtered.filter(job => !jobInteractions[job.id]);
    }

    // Filtre par statut de candidature (Postulées / Non postulées)
    if (activeCandidatureFilter === 'applied') {
      filtered = filtered.filter(job => Boolean(candidatures[job.id]));
    } else if (activeCandidatureFilter === 'unapplied') {
      filtered = filtered.filter(job => !candidatures[job.id]);
    }

    // Filtre par provenance
    if (activeSourceFilter !== 'all') {
      filtered = filtered.filter(job => job.source === activeSourceFilter);
    }

    // Filtre par pertinence recherche Groq
    if (activeRelevanceFilter === 'recommended') {
      filtered = filtered.filter(job => !job.isExcluded && (job.matchScore || 0) >= 40);
    } else if (activeRelevanceFilter === 'excluded') {
      filtered = filtered.filter(job => job.isExcluded || (job.matchScore || 0) < 40);
    }

    // Filtre par pertinence CV
    if (currentCvCriteria && activeCvRelevanceFilter !== 'all') {
      if (activeCvRelevanceFilter === 'high') {
        filtered = filtered.filter(job => (job.cvScore || 0) >= 70);
      } else if (activeCvRelevanceFilter === 'mid') {
        filtered = filtered.filter(job => (job.cvScore || 0) >= 40 && (job.cvScore || 0) < 70);
      } else if (activeCvRelevanceFilter === 'low') {
        filtered = filtered.filter(job => (job.cvScore || 0) < 40);
      }
    }

    // Recherche textuelle rapide
    const queryTerm = quickFilterInput ? quickFilterInput.value.toLowerCase().trim() : '';
    if (queryTerm) {
      filtered = filtered.filter(job => {
        const full = `${job.title} ${job.company} ${job.location} ${job.contractType} ${job.source} ${(job.tags || []).join(' ')} ${job.matchExplanation || ''} ${job.cvMatchDetails || ''} ${(job.matchedLogiciels || []).join(' ')}`.toLowerCase();
        return full.includes(queryTerm);
      });
    }

    // RÈGLE DE TRI : Priorité aux éléments NON MARQUÉS
    filtered.sort((a, b) => {
      const isMarkedA = Boolean(jobInteractions[a.id]);
      const isMarkedB = Boolean(jobInteractions[b.id]);
      if (isMarkedA !== isMarkedB) {
        return isMarkedA ? 1 : -1; // Les non marqués sont toujours placés en premier
      }

      // Tri spécifique si clic sur une colonne de la DataTable
      if (tableSortCol) {
        let cmp = 0;
        if (tableSortCol === 'status') {
          const stA = jobInteractions[a.id] || '';
          const stB = jobInteractions[b.id] || '';
          cmp = stA.localeCompare(stB);
        } else if (tableSortCol === 'title') {
          cmp = (a.title || '').localeCompare(b.title || '');
        } else if (tableSortCol === 'location') {
          cmp = (a.location || '').localeCompare(b.location || '');
        } else if (tableSortCol === 'source') {
          cmp = (a.source || '').localeCompare(b.source || '');
        } else if (tableSortCol === 'groqScore') {
          cmp = (a.matchScore || 0) - (b.matchScore || 0);
        } else if (tableSortCol === 'cvScore') {
          cmp = (a.cvScore || 0) - (b.cvScore || 0);
        }
        return tableSortDir === 'asc' ? cmp : -cmp;
      }

      // Tri selon le sélecteur sortBySelect
      const sortVal = sortBySelect ? sortBySelect.value : 'score';
      if (sortVal === 'score') {
        if (a.isExcluded !== b.isExcluded) return a.isExcluded ? 1 : -1;
        return (b.matchScore || 0) - (a.matchScore || 0);
      } else if (sortVal === 'cvScore') {
        return (b.cvScore || 0) - (a.cvScore || 0);
      } else if (sortVal === 'company') {
        return (a.company || '').localeCompare(b.company || '');
      } else if (sortVal === 'date') {
        return (b.id || '').localeCompare(a.id || '');
      } else if (sortVal === 'source') {
        return (a.source || '').localeCompare(b.source || '');
      }
      return 0;
    });

    lastFilteredJobs = filtered;
    renderJobsDisplay(filtered);
  }

  // Gestion de l'affichage (Basculable DataTable ou Grille)
  function renderJobsDisplay(jobsToRender) {
    if (!jobsToRender || jobsToRender.length === 0) {
      if (emptyState) emptyState.classList.remove('hidden');
      if (jobsGrid) jobsGrid.classList.add('hidden');
      if (jobsTableContainer) jobsTableContainer.classList.add('hidden');
      return;
    }

    if (emptyState) emptyState.classList.add('hidden');

    updateViewModeButtons();

    if (currentViewMode === 'table') {
      if (jobsGrid) jobsGrid.classList.add('hidden');
      if (jobsTableContainer) jobsTableContainer.classList.remove('hidden');
      renderJobsTable(jobsToRender);
    } else {
      if (jobsTableContainer) jobsTableContainer.classList.add('hidden');
      if (jobsGrid) jobsGrid.classList.remove('hidden');
      renderJobsList(jobsToRender);
    }
  }

  function updateViewModeButtons() {
    if (!viewModeTableBtn || !viewModeGridBtn) return;
    if (currentViewMode === 'table') {
      viewModeTableBtn.className = 'view-mode-btn inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all bg-white text-indigo-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';
      viewModeTableBtn.setAttribute('aria-pressed', 'true');
      viewModeGridBtn.className = 'view-mode-btn inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500';
      viewModeGridBtn.setAttribute('aria-pressed', 'false');
    } else {
      viewModeGridBtn.className = 'view-mode-btn inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all bg-white text-indigo-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';
      viewModeGridBtn.setAttribute('aria-pressed', 'true');
      viewModeTableBtn.className = 'view-mode-btn inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500';
      viewModeTableBtn.setAttribute('aria-pressed', 'false');
    }
  }

  // Rendu de la vue DataTable interactive
  function renderJobsTable(jobsToRender) {
    if (!jobsTableBody) return;
    jobsTableBody.innerHTML = '';

    const pageSizeVal = tablePageSizeSelect ? tablePageSizeSelect.value : '25';
    const totalCount = jobsToRender.length;
    let pageSize = pageSizeVal === 'all' ? totalCount : parseInt(pageSizeVal, 10);
    if (isNaN(pageSize) || pageSize <= 0) pageSize = 25;

    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
    if (tableCurrentPage > totalPages) tableCurrentPage = totalPages;
    if (tableCurrentPage < 1) tableCurrentPage = 1;

    const startIdx = (tableCurrentPage - 1) * pageSize;
    const endIdx = pageSizeVal === 'all' ? totalCount : Math.min(startIdx + pageSize, totalCount);
    const paginatedJobs = pageSizeVal === 'all' ? jobsToRender : jobsToRender.slice(startIdx, endIdx);

    if (tablePaginationInfo) {
      tablePaginationInfo.textContent = `Affichage de ${totalCount > 0 ? startIdx + 1 : 0} à ${endIdx} sur ${totalCount}`;
    }

    if (tablePrevPageBtn) {
      tablePrevPageBtn.disabled = tableCurrentPage <= 1;
    }
    if (tableNextPageBtn) {
      tableNextPageBtn.disabled = tableCurrentPage >= totalPages;
    }

    if (tablePageNumbers) {
      tablePageNumbers.innerHTML = '';
      if (totalPages <= 7) {
        for (let p = 1; p <= totalPages; p++) {
          appendPageBtn(p, p === tableCurrentPage);
        }
      } else {
        appendPageBtn(1, tableCurrentPage === 1);
        if (tableCurrentPage > 3) {
          const dots = document.createElement('span');
          dots.className = 'px-1 text-slate-400 text-xs';
          dots.textContent = '…';
          tablePageNumbers.appendChild(dots);
        }
        const startP = Math.max(2, tableCurrentPage - 1);
        const endP = Math.min(totalPages - 1, tableCurrentPage + 1);
        for (let p = startP; p <= endP; p++) {
          appendPageBtn(p, p === tableCurrentPage);
        }
        if (tableCurrentPage < totalPages - 2) {
          const dots = document.createElement('span');
          dots.className = 'px-1 text-slate-400 text-xs';
          dots.textContent = '…';
          tablePageNumbers.appendChild(dots);
        }
        appendPageBtn(totalPages, tableCurrentPage === totalPages);
      }
    }

    function appendPageBtn(page, isActive) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = isActive
        ? 'w-7 h-7 rounded-lg text-xs font-black bg-indigo-600 text-white flex items-center justify-center shadow-xs'
        : 'w-7 h-7 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 flex items-center justify-center';
      btn.textContent = page;
      btn.addEventListener('click', () => {
        tableCurrentPage = page;
        renderJobsTable(jobsToRender);
      });
      tablePageNumbers.appendChild(btn);
    }

    paginatedJobs.forEach(job => {
      const tr = document.createElement('tr');
      const isExcluded = Boolean(job.isExcluded);
      const userStatus = jobInteractions[job.id] || null;
      const isFavorite = userStatus === 'favorite';
      const isDismissed = userStatus === 'dismissed';
      const isUnmarked = !userStatus;
      const isApplied = Boolean(candidatures[job.id]);
      const cand = candidatures[job.id];

      let rowBg = 'hover:bg-slate-50/80 transition-colors';
      if (isApplied) {
        rowBg = 'bg-emerald-50/25 hover:bg-emerald-50/50 transition-colors border-l-4 border-emerald-500';
      } else if (isFavorite) {
        rowBg = 'bg-amber-50/35 hover:bg-amber-50/60 transition-colors border-l-4 border-amber-400';
      } else if (isDismissed) {
        rowBg = 'bg-slate-50/60 opacity-60 hover:opacity-100 transition-opacity';
      } else if (isExcluded) {
        rowBg = 'bg-rose-50/20 hover:bg-rose-50/40 transition-colors';
      }

      tr.className = rowBg;

      let platformClass = 'bg-slate-100 text-slate-800 border-slate-200';
      const srcLower = (job.source || '').toLowerCase();
      if (srcLower.includes('linkedin')) platformClass = 'bg-blue-50 text-blue-800 border-blue-200';
      else if (srcLower.includes('france') || srcLower.includes('travail')) platformClass = 'bg-sky-50 text-sky-900 border-sky-200';
      else if (srcLower.includes('hellowork')) platformClass = 'bg-orange-50 text-orange-900 border-orange-200';
      else if (srcLower.includes('meteo')) platformClass = 'bg-cyan-50 text-cyan-900 border-cyan-200';
      else if (srcLower.includes('jooble')) platformClass = 'bg-purple-50 text-purple-900 border-purple-200';
      else if (srcLower.includes('remotive')) platformClass = 'bg-emerald-50 text-emerald-900 border-emerald-200';
      else if (srcLower.includes('indeed')) platformClass = 'bg-blue-100 text-blue-950 border-blue-300 font-bold';

      const score = job.matchScore || 50;
      let scoreBadgeHtml = '';
      if (isExcluded || score < 40) {
        scoreBadgeHtml = `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-black bg-rose-50 text-rose-800 border border-rose-200" title="${escapeHtml(job.matchExplanation || '')}">⚠️ ${score}%</span>`;
      } else if (score >= 75) {
        scoreBadgeHtml = `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-black bg-emerald-50 text-emerald-800 border border-emerald-200" title="${escapeHtml(job.matchExplanation || '')}">★ ${score}%</span>`;
      } else {
        scoreBadgeHtml = `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-black bg-amber-50 text-amber-800 border border-amber-200" title="${escapeHtml(job.matchExplanation || '')}">★ ${score}%</span>`;
      }

      let cvScoreBadgeHtml = '<span class="text-slate-400 text-xs">-</span>';
      if (job.cvScore !== undefined && job.cvScore !== null) {
        const cs = job.cvScore;
        const isGroq = job.cvScoreSource === 'groq';
        const groqIcon = isGroq ? ' ✨' : '';
        const tooltip = `${job.cvMatchDetails || ''}${isGroq ? ' (Évalué sémantiquement par Groq AI)' : ''}`;
        if (cs >= 70) {
          cvScoreBadgeHtml = `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-950 border border-emerald-300" title="${escapeHtml(tooltip)}">🎯 ${cs}%${groqIcon}</span>`;
        } else if (cs >= 40) {
          cvScoreBadgeHtml = `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-black bg-amber-100 text-amber-950 border border-amber-300" title="${escapeHtml(tooltip)}">🎯 ${cs}%${groqIcon}</span>`;
        } else {
          cvScoreBadgeHtml = `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-black bg-slate-100 text-slate-700 border border-slate-300" title="${escapeHtml(tooltip)}">🎯 ${cs}%${groqIcon}</span>`;
        }
      }

      let statusTagHtml = '';
      if (isApplied) {
        statusTagHtml = `<span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">✅ Postulée</span>`;
      } else if (isUnmarked) {
        statusTagHtml = '<span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">🆕 À traiter</span>';
      } else if (isFavorite) {
        statusTagHtml = '<span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">⭐ Favori</span>';
      } else if (isDismissed) {
        statusTagHtml = '<span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-700 border border-slate-300">✕ Écarté</span>';
      }

      tr.innerHTML = `
        <td class="py-3 px-3 text-center align-middle whitespace-nowrap">
          <div class="flex items-center justify-center gap-1.5">
            <button
              type="button"
              class="btn-table-favorite p-1 rounded-lg text-sm transition-all focus:outline-none focus:ring-1 focus:ring-amber-500 ${isFavorite ? 'bg-amber-100 text-amber-900 font-black ring-1 ring-amber-300' : 'text-slate-300 hover:text-amber-500 hover:bg-slate-100'}"
              title="${isFavorite ? 'Retirer des favoris' : 'Marquer comme favori'}"
              aria-label="${isFavorite ? 'Retirer des favoris' : 'Marquer comme favori'}"
              data-job-id="${escapeHtml(job.id)}"
            >
              <span aria-hidden="true">${isFavorite ? '⭐' : '☆'}</span>
            </button>
            <button
              type="button"
              class="btn-table-dismiss p-1 rounded-lg text-sm transition-all focus:outline-none focus:ring-1 focus:ring-rose-500 ${isDismissed ? 'bg-rose-100 text-rose-800 font-black ring-1 ring-rose-300' : 'text-slate-300 hover:text-rose-600 hover:bg-slate-100'}"
              title="${isDismissed ? 'Ne plus marquer comme désintéressé' : 'Marquer comme désintéressé'}"
              aria-label="${isDismissed ? 'Ne plus marquer comme désintéressé' : 'Marquer comme désintéressé'}"
              data-job-id="${escapeHtml(job.id)}"
            >
              <span aria-hidden="true">${isDismissed ? '❌' : '✕'}</span>
            </button>
          </div>
          <div class="mt-1">${statusTagHtml}</div>
        </td>

        <td class="py-3 px-4 align-middle">
          <div class="space-y-0.5 max-w-sm">
            <h4 class="font-bold text-slate-900 leading-snug line-clamp-1 hover:text-indigo-600">
              <a href="${job.url}" target="_blank" rel="noopener noreferrer" class="focus:outline-none focus:underline">
                ${escapeHtml(job.title)}
              </a>
            </h4>
            <div class="text-xs text-slate-600 flex items-center gap-1.5 flex-wrap">
              <span class="font-semibold text-slate-800">🏢 ${escapeHtml(job.company)}</span>
              ${job.date ? `<span class="text-slate-400">· 📅 ${escapeHtml(job.date)}</span>` : ''}
              ${isExcluded ? '<span class="px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-100 text-rose-800">Exclu</span>' : ''}
              ${isApplied && cand?.appliedAt ? `<span class="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">Postulée le ${escapeHtml(formatDateFr(cand.appliedAt))}</span>` : ''}
            </div>
          </div>
        </td>

        <td class="py-3 px-4 align-middle whitespace-nowrap">
          <div class="space-y-0.5 text-xs text-slate-600">
            <div class="font-medium text-slate-800">📍 ${escapeHtml(job.location || 'France')}</div>
            <div class="text-slate-500">📄 ${escapeHtml(job.contractType || 'CDI / Indifférent')}</div>
            ${job.salary && job.salary !== 'Non communiqué' ? `<div class="text-emerald-700 font-semibold">💰 ${escapeHtml(job.salary)}</div>` : ''}
          </div>
        </td>

        <td class="py-3 px-4 align-middle whitespace-nowrap">
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${platformClass}">
            ${escapeHtml(job.source)}
          </span>
        </td>

        <td class="py-3 px-4 text-center align-middle whitespace-nowrap">
          ${scoreBadgeHtml}
        </td>

        <td class="py-3 px-4 text-center align-middle whitespace-nowrap">
          ${cvScoreBadgeHtml}
        </td>

        <td class="py-3 px-4 text-right align-middle whitespace-nowrap">
          <div class="flex items-center justify-end gap-1.5">
            <button
              type="button"
              class="btn-table-ai-summary inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-all focus:outline-none focus:ring-1 focus:ring-indigo-500"
              data-job-id="${escapeHtml(job.id)}"
              title="Voir le résumé et conseils IA"
            >
              <span aria-hidden="true">✨</span>
              <span>Tips</span>
            </button>
            <button
              type="button"
              class="btn-table-apply-toggle inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${isApplied ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xs'}"
              data-job-id="${escapeHtml(job.id)}"
              title="${isApplied ? 'Gérer le suivi et les entretiens de cette candidature' : 'Postuler à l\'offre et marquer comme postulée'}"
            >
              <span>${isApplied ? '✓ Postulée' : 'Postuler ↗'}</span>
            </button>
            ${isApplied ? `
              <a
                href="${job.url}"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-all"
                title="Ouvrir le lien de l'offre dans un nouvel onglet"
              >
                ↗
              </a>
            ` : ''}
          </div>
        </td>
      `;

      const favBtn = tr.querySelector('.btn-table-favorite');
      if (favBtn) {
        favBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const currentStatus = jobInteractions[job.id] || null;
          const newStatus = (currentStatus === 'favorite') ? null : 'favorite';
          setJobUserStatus(job.id, newStatus);
        });
      }

      const disBtn = tr.querySelector('.btn-table-dismiss');
      if (disBtn) {
        disBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const currentStatus = jobInteractions[job.id] || null;
          const newStatus = (currentStatus === 'dismissed') ? null : 'dismissed';
          setJobUserStatus(job.id, newStatus);
        });
      }

      const applyToggleBtn = tr.querySelector('.btn-table-apply-toggle');
      if (applyToggleBtn) {
        applyToggleBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          handleJobApplyClick(job);
        });
      }

      const summaryBtn = tr.querySelector('.btn-table-ai-summary');
      if (summaryBtn) {
        summaryBtn.addEventListener('click', (e) => {
          lastFocusedElement = e.currentTarget;
          openJobAnalysisModal(job);
        });
      }

      jobsTableBody.appendChild(tr);
    });
  }

  // 6. Rendu des cartes d'offres en Tailwind Thème Clair Accessible
  function renderJobsList(jobsToRender) {
    jobsGrid.innerHTML = '';

    if (!jobsToRender || jobsToRender.length === 0) {
      emptyState.classList.remove('hidden');
      return;
    }

    emptyState.classList.add('hidden');

    jobsToRender.forEach(job => {
      const card = document.createElement('article');
      const isExcluded = Boolean(job.isExcluded);
      const userStatus = jobInteractions[job.id] || null;
      const isFavorite = userStatus === 'favorite';
      const isDismissed = userStatus === 'dismissed';
      const isApplied = Boolean(candidatures[job.id]);
      const cand = candidatures[job.id];

      // Classes Tailwind pour carte claire
      let cardBg = 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-md';
      if (isApplied) {
        cardBg = 'bg-emerald-50/20 border-emerald-300 hover:border-emerald-400 shadow-sm';
      } else if (isFavorite) {
        cardBg = 'bg-amber-50/25 border-amber-300 hover:border-amber-400 shadow-sm';
      } else if (isDismissed) {
        cardBg = 'bg-slate-50/70 border-slate-200 opacity-60 hover:opacity-100 transition-opacity';
      } else if (isExcluded) {
        cardBg = 'bg-rose-50/25 border-rose-200 hover:border-rose-400';
      }
      card.className = `rounded-2xl border p-5 sm:p-6 shadow-sm transition-all flex flex-col justify-between space-y-4 ${cardBg}`;

      const score = job.matchScore || 50;
      let scoreBadgeHtml = '';
      if (isExcluded || score < 40) {
        scoreBadgeHtml = `<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-rose-50 text-rose-800 border border-rose-200" title="Score de recherche Groq">⚠️ Groq ${score}%</span>`;
      } else if (score >= 75) {
        scoreBadgeHtml = `<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-800 border border-emerald-200" title="Score de recherche Groq">★ Groq ${score}%</span>`;
      } else {
        scoreBadgeHtml = `<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-amber-50 text-amber-800 border border-amber-200" title="Score de recherche Groq">★ Groq ${score}%</span>`;
      }

      // Badge Score CV s'il a été calculé
      let cvScoreBadgeHtml = '';
      if (job.cvScore !== undefined && job.cvScore !== null) {
        const cs = job.cvScore;
        const isGroq = job.cvScoreSource === 'groq';
        const groqTag = isGroq ? ' ✨' : '';
        const tooltip = `${job.cvMatchDetails || ''}${isGroq ? ' (Évalué sémantiquement par Groq AI)' : ''}`;
        if (cs >= 70) {
          cvScoreBadgeHtml = `<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-950 border border-emerald-300" title="${escapeHtml(tooltip)}">🎯 CV ${cs}%${groqTag}</span>`;
        } else if (cs >= 40) {
          cvScoreBadgeHtml = `<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-950 border border-amber-300" title="${escapeHtml(tooltip)}">🎯 CV ${cs}%${groqTag}</span>`;
        } else {
          cvScoreBadgeHtml = `<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-slate-100 text-slate-700 border border-slate-300" title="${escapeHtml(tooltip)}">🎯 CV ${cs}%${groqTag}</span>`;
        }
      }

      // Badge Plateforme accessible
      let platformClass = 'bg-slate-100 text-slate-800 border-slate-200';
      const srcLower = (job.source || '').toLowerCase();
      if (srcLower.includes('linkedin')) platformClass = 'bg-blue-50 text-blue-800 border-blue-200';
      else if (srcLower.includes('france') || srcLower.includes('travail')) platformClass = 'bg-sky-50 text-sky-900 border-sky-200';
      else if (srcLower.includes('hellowork')) platformClass = 'bg-orange-50 text-orange-900 border-orange-200';
      else if (srcLower.includes('meteo')) platformClass = 'bg-cyan-50 text-cyan-900 border-cyan-200';
      else if (srcLower.includes('jooble')) platformClass = 'bg-purple-50 text-purple-900 border-purple-200';
      else if (srcLower.includes('remotive')) platformClass = 'bg-emerald-50 text-emerald-900 border-emerald-200';
      else if (srcLower.includes('indeed')) platformClass = 'bg-blue-100 text-blue-950 border-blue-300 font-bold';

      const tagsHtml = (job.tags || [])
        .slice(0, 4)
        .map(tag => `<span class="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">${escapeHtml(tag)}</span>`)
        .join(' ');

      // Bloc d'explication IA contrasté
      const explBg = isExcluded 
        ? 'bg-rose-50/80 border-l-4 border-rose-500 text-rose-900' 
        : 'bg-slate-50 border-l-4 border-indigo-600 text-slate-700';

      card.innerHTML = `
        <div class="space-y-3">
          
          <!-- Ligne En-tête : Badges, Scores & Actions Utilisateur (Favoris / Désintéressé) -->
          <div class="flex items-center justify-between gap-2 flex-wrap">
            <div class="flex items-center gap-1.5 flex-wrap">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${platformClass}">
                ${escapeHtml(job.source)}
              </span>
              ${isExcluded ? '<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">Exclu</span>' : ''}
              ${isApplied ? `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">✓ Postulée</span>` : ''}
              ${isFavorite ? '<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">⭐ Favori</span>' : ''}
              ${isDismissed ? '<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-200 text-slate-700 border border-slate-300">✕ Désintéressé</span>' : ''}
            </div>
            <div class="flex items-center gap-1.5 flex-wrap">
              ${scoreBadgeHtml}
              ${cvScoreBadgeHtml}

              <!-- Actions Utilisateur (Favoris / Désintéressé avec exclusivité mutuelle) -->
              <div class="inline-flex items-center rounded-xl border border-slate-200 bg-slate-50/90 p-0.5 shadow-2xs gap-0.5 ml-1" role="group" aria-label="Marquer comme favori ou désintéressé">
                <button
                  type="button"
                  class="btn-job-favorite p-1.5 rounded-lg text-sm transition-all focus:outline-none focus:ring-2 focus:ring-amber-500 min-w-[34px] min-h-[34px] flex items-center justify-center ${isFavorite ? 'bg-amber-100 text-amber-900 font-black shadow-2xs ring-1 ring-amber-300' : 'text-slate-400 hover:text-amber-500 hover:bg-white'}"
                  title="${isFavorite ? 'Retirer des favoris' : 'Mettre en favoris'}"
                  aria-label="${isFavorite ? 'Retirer l\'offre des favoris' : 'Ajouter l\'offre aux favoris'}"
                  aria-pressed="${isFavorite ? 'true' : 'false'}"
                  data-job-id="${escapeHtml(job.id)}"
                >
                  <span aria-hidden="true">${isFavorite ? '⭐' : '☆'}</span>
                </button>
                <button
                  type="button"
                  class="btn-job-dismiss p-1.5 rounded-lg text-sm transition-all focus:outline-none focus:ring-2 focus:ring-rose-500 min-w-[34px] min-h-[34px] flex items-center justify-center ${isDismissed ? 'bg-rose-100 text-rose-800 font-black shadow-2xs ring-1 ring-rose-300' : 'text-slate-400 hover:text-rose-600 hover:bg-white'}"
                  title="${isDismissed ? 'Ne plus marquer comme désintéressé' : 'Marquer comme désintéressé'}"
                  aria-label="${isDismissed ? 'Ne plus marquer comme désintéressé' : 'Marquer comme désintéressé'}"
                  aria-pressed="${isDismissed ? 'true' : 'false'}"
                  data-job-id="${escapeHtml(job.id)}"
                >
                  <span aria-hidden="true">${isDismissed ? '❌' : '✕'}</span>
                </button>
              </div>

            </div>
          </div>

          <!-- Titre du poste -->
          <h3 class="text-base sm:text-lg font-bold text-slate-900 leading-snug line-clamp-2">
            <a href="${job.url}" target="_blank" rel="noopener noreferrer" class="hover:text-indigo-600 focus:outline-none focus:underline">
              ${escapeHtml(job.title)}
            </a>
          </h3>

          <!-- Métadonnées : Entreprise, Lieu, Contrat -->
          <div class="flex flex-wrap gap-x-3 gap-y-1 text-xs sm:text-sm text-slate-600 font-medium">
            <span class="flex items-center gap-1">🏢 <strong>${escapeHtml(job.company)}</strong></span>
            <span class="flex items-center gap-1">📍 <span>${escapeHtml(job.location)}</span></span>
            <span class="flex items-center gap-1">📄 <span>${escapeHtml(job.contractType)}</span></span>
            ${job.salary && job.salary !== 'Non communiqué' ? `<span class="flex items-center gap-1">💰 <span class="font-semibold text-slate-700">${escapeHtml(job.salary)}</span></span>` : ''}
          </div>

          <!-- Bloc Adéquation CV (si calculé) -->
          ${job.cvScore !== null && job.cvScore !== undefined ? `
            <div class="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-950 space-y-1.5">
              <div class="flex items-center justify-between gap-1 font-bold">
                <span class="flex items-center gap-1.5">
                  <span>🎯</span>
                  <span>Adéquation CV (${job.cvScore}%)</span>
                  ${job.cvScoreSource === 'groq' ? '<span class="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-900 border border-purple-200 font-bold flex items-center gap-0.5"><span>✨</span> <span>Groq AI</span></span>' : ''}
                </span>
                ${job.matchedLogiciels && job.matchedLogiciels.length > 0 ? `<span class="text-[11px] font-medium text-emerald-800">${job.matchedLogiciels.length} outil(s)</span>` : ''}
              </div>
              <p class="text-[11px] text-emerald-800 leading-tight">${escapeHtml(job.cvMatchDetails || 'Profil compatible.')}</p>
              ${job.cvMatchedStrengths && job.cvMatchedStrengths.length > 0 ? `
                <div class="flex flex-wrap gap-1 pt-1">
                  ${job.cvMatchedStrengths.map(s => `<span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-950 border border-emerald-300">✓ ${escapeHtml(s)}</span>`).join('')}
                </div>
              ` : ''}
            </div>
          ` : ''}

          <!-- Explication Groq IA -->
          <div class="p-3 rounded-r-xl text-xs sm:text-sm leading-relaxed ${explBg}">
            <strong class="font-bold">${isExcluded ? '⚠️ Alerte exclusion :' : '🤖 Analyse IA :'}</strong>
            <span>${escapeHtml(job.matchExplanation || 'Offre analysée.')}</span>
          </div>

          <!-- Tags -->
          ${tagsHtml ? `<div class="flex flex-wrap gap-1 pt-1">${tagsHtml}</div>` : ''}

        </div>

        <!-- Ligne Pied : Date & Boutons d'action -->
        <div class="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap text-xs text-slate-500">
          <div class="flex items-center gap-2">
            <span>${escapeHtml(job.date || 'Récemment')}</span>
            ${isApplied && cand?.appliedAt ? `<span class="font-semibold text-emerald-700">· Postulée le ${escapeHtml(formatDateFr(cand.appliedAt))}</span>` : ''}
          </div>
          <div class="flex items-center gap-2">
            <button
              type="button"
              class="btn-ai-summary inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[38px]"
              data-job-id="${escapeHtml(job.id)}"
              aria-label="Voir le résumé et les conseils IA pour ${escapeHtml(job.title)}"
            >
              <span aria-hidden="true">✨</span>
              <span>Résumé & Tips</span>
            </button>

            <button
              type="button"
              class="btn-card-apply-toggle inline-flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs font-bold transition-all min-h-[38px] ${isApplied ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xs'}"
              data-job-id="${escapeHtml(job.id)}"
              aria-label="${isApplied ? 'Gérer cette candidature' : 'Postuler à l\'offre ' + escapeHtml(job.title)}"
            >
              <span>${isApplied ? '✓ Postulée' : 'Postuler ↗'}</span>
            </button>
            ${isApplied ? `
              <a
                href="${job.url}"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center justify-center w-9 h-9 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-all"
                title="Ouvrir le lien de l'offre dans un nouvel onglet"
              >
                ↗
              </a>
            ` : ''}
          </div>
        </div>
      `;

      // Écouteur bouton Favoris (exclusif)
      const favBtn = card.querySelector('.btn-job-favorite');
      if (favBtn) {
        favBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const currentStatus = jobInteractions[job.id] || null;
          const newStatus = (currentStatus === 'favorite') ? null : 'favorite';
          setJobUserStatus(job.id, newStatus);
        });
      }

      // Écouteur bouton Désintéressé (exclusif)
      const disBtn = card.querySelector('.btn-job-dismiss');
      if (disBtn) {
        disBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const currentStatus = jobInteractions[job.id] || null;
          const newStatus = (currentStatus === 'dismissed') ? null : 'dismissed';
          setJobUserStatus(job.id, newStatus);
        });
      }

      // Écouteur bouton Postuler Intelligent
      const cardApplyBtn = card.querySelector('.btn-card-apply-toggle');
      if (cardApplyBtn) {
        cardApplyBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          handleJobApplyClick(job);
        });
      }

      const summaryBtn = card.querySelector('.btn-ai-summary');
      if (summaryBtn) {
        summaryBtn.addEventListener('click', (e) => {
          lastFocusedElement = e.currentTarget;
          openJobAnalysisModal(job);
        });
      }

      jobsGrid.appendChild(card);
    });
  }

  // 7. Écouteurs recherche rapide, tri et DataTable
  quickFilterInput.addEventListener('input', () => {
    tableCurrentPage = 1;
    applyAllFiltersAndSort();
  });
  sortBySelect.addEventListener('change', () => {
    tableCurrentPage = 1;
    tableSortCol = null;
    applyAllFiltersAndSort();
  });

  if (viewModeTableBtn) {
    viewModeTableBtn.addEventListener('click', () => {
      currentViewMode = 'table';
      localStorage.setItem('ftj_view_mode', 'table');
      renderJobsDisplay(lastFilteredJobs);
    });
  }

  if (viewModeGridBtn) {
    viewModeGridBtn.addEventListener('click', () => {
      currentViewMode = 'grid';
      localStorage.setItem('ftj_view_mode', 'grid');
      renderJobsDisplay(lastFilteredJobs);
    });
  }

  if (tablePageSizeSelect) {
    tablePageSizeSelect.addEventListener('change', () => {
      tableCurrentPage = 1;
      renderJobsTable(lastFilteredJobs);
    });
  }

  if (tablePrevPageBtn) {
    tablePrevPageBtn.addEventListener('click', () => {
      if (tableCurrentPage > 1) {
        tableCurrentPage--;
        renderJobsTable(lastFilteredJobs);
      }
    });
  }

  if (tableNextPageBtn) {
    tableNextPageBtn.addEventListener('click', () => {
      tableCurrentPage++;
      renderJobsTable(lastFilteredJobs);
    });
  }

  if (jobsDataTable) {
    jobsDataTable.querySelectorAll('thead th[data-sort-col]').forEach(th => {
      th.addEventListener('click', () => {
        const col = th.dataset.sortCol;
        if (tableSortCol === col) {
          tableSortDir = tableSortDir === 'asc' ? 'desc' : 'asc';
        } else {
          tableSortCol = col;
          tableSortDir = 'desc';
        }

        jobsDataTable.querySelectorAll('thead th[data-sort-col]').forEach(header => {
          const icon = header.querySelector('.sort-icon');
          if (!icon) return;
          if (header.dataset.sortCol === tableSortCol) {
            icon.textContent = tableSortDir === 'asc' ? '▲' : '▼';
            icon.className = 'sort-icon text-[10px] text-indigo-600 font-bold';
          } else {
            icon.textContent = '↕';
            icon.className = 'sort-icon text-[10px] text-slate-400';
          }
        });

        tableCurrentPage = 1;
        applyAllFiltersAndSort();
      });
    });
  }

  // =========================================================================
  // 8. GESTION DE LA POP-UP MODALE ACCESSIBLE (WCAG 2.2 / RGAA 4.1.2)
  // Architecture en 3 onglets : Résumé & Tips | Argumentaire | ChatBot IA
  // =========================================================================

  const jobModal = document.getElementById('jobModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  let currentAnalysisJob = null;

  // Éléments d'en-tête partagé
  const modalJobTitle = document.getElementById('modalJobTitle');
  const modalJobSourceBadge = document.getElementById('modalJobSourceBadge');
  const modalJobCompany = document.getElementById('modalJobCompany');
  const modalJobLocation = document.getElementById('modalJobLocation');
  const modalJobContract = document.getElementById('modalJobContract');

  // Éléments de navigation par onglets
  const tabBtnSummary = document.getElementById('tabBtnSummary');
  const tabBtnArgumentaire = document.getElementById('tabBtnArgumentaire');
  const tabBtnChat = document.getElementById('tabBtnChat');
  const panelSummary = document.getElementById('panelSummary');
  const panelArgumentaire = document.getElementById('panelArgumentaire');
  const panelChat = document.getElementById('panelChat');

  // Onglet 1 : Résumé & Tips
  const modalLoading = document.getElementById('modalLoading');
  const modalContent = document.getElementById('modalContent');

  // Onglet 2 : Argumentaire & Lettre de motivation
  const argLoading = document.getElementById('argLoading');
  const argContent = document.getElementById('argContent');
  const argumentairesCache = {}; // { [jobId]: Object }

  // Onglet 3 : ChatBot WebSocket
  const chatWsStatusDot = document.getElementById('chatWsStatusDot');
  const chatWsStatusText = document.getElementById('chatWsStatusText');
  const clearChatBtn = document.getElementById('clearChatBtn');
  const chatMessages = document.getElementById('chatMessages');
  const chatQuickSuggestions = document.getElementById('chatQuickSuggestions');
  const chatForm = document.getElementById('chatForm');
  const chatInput = document.getElementById('chatInput');
  const chatSendBtn = document.getElementById('chatSendBtn');

  let currentModalTab = 'summary'; // 'summary' | 'argumentaire' | 'chat'
  let chatWs = null;
  let chatMessagesHistory = [];
  let isStreamingChat = false;
  let currentStreamingMsgEl = null;
  let currentStreamingText = '';
  let wsReconnectTimeout = null;

  function closeModal() {
    jobModal.classList.add('hidden');
    currentAnalysisJob = null;
    document.body.style.overflow = '';
    if (wsReconnectTimeout) {
      clearTimeout(wsReconnectTimeout);
      wsReconnectTimeout = null;
    }
    // Restitution du focus au bouton déclencheur (RGAA)
    if (lastFocusedElement) {
      lastFocusedElement.focus();
    }
  }

  modalCloseBtn.addEventListener('click', closeModal);
  jobModal.addEventListener('click', (e) => {
    if (e.target === jobModal) closeModal();
  });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (applyConfirmModal && !applyConfirmModal.classList.contains('hidden')) {
        return;
      }
      if (!jobModal.classList.contains('hidden')) {
        closeModal();
      }
      if (cvCriteriaModal && !cvCriteriaModal.classList.contains('hidden')) {
        closeCvCriteriaModalFunc();
      }
    }
  });

  // --- Gestion de la barre d'onglets (Accessibilité WCAG 2.2) ---
  function switchModalTab(targetTab) {
    currentModalTab = targetTab;
    const tabList = [
      { key: 'summary', btn: tabBtnSummary, panel: panelSummary },
      { key: 'argumentaire', btn: tabBtnArgumentaire, panel: panelArgumentaire },
      { key: 'chat', btn: tabBtnChat, panel: panelChat }
    ];

    tabList.forEach(t => {
      if (!t.btn || !t.panel) return;
      const isActive = t.key === targetTab;
      t.btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
      t.btn.setAttribute('tabindex', isActive ? '0' : '-1');

      if (isActive) {
        t.btn.className = 'inline-flex items-center gap-1.5 px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 border-indigo-600 text-indigo-700 bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 whitespace-nowrap';
        t.panel.classList.remove('hidden');
        if (targetTab === 'chat') {
          t.panel.classList.add('flex');
        }
      } else {
        t.btn.className = 'inline-flex items-center gap-1.5 px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 border-transparent text-slate-600 hover:text-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 whitespace-nowrap';
        t.panel.classList.add('hidden');
        if (t.key === 'chat') {
          t.panel.classList.remove('flex');
        }
      }
    });

    if (targetTab === 'argumentaire') {
      ensureArgumentaireLoaded(currentAnalysisJob);
    } else if (targetTab === 'chat') {
      ensureChatInitialized(currentAnalysisJob);
      setTimeout(() => {
        chatInput?.focus();
        scrollChatToBottom();
      }, 50);
    }
  }

  // Écouteurs sur les boutons d'onglets
  if (tabBtnSummary) tabBtnSummary.addEventListener('click', () => switchModalTab('summary'));
  if (tabBtnArgumentaire) tabBtnArgumentaire.addEventListener('click', () => switchModalTab('argumentaire'));
  if (tabBtnChat) tabBtnChat.addEventListener('click', () => switchModalTab('chat'));

  // Navigation accessible au clavier (Flèches gauche/droite) sur role="tablist"
  const tabButtons = [tabBtnSummary, tabBtnArgumentaire, tabBtnChat].filter(Boolean);
  tabButtons.forEach((btn, index) => {
    btn.addEventListener('keydown', (e) => {
      let targetIndex = null;
      if (e.key === 'ArrowRight') {
        targetIndex = (index + 1) % tabButtons.length;
      } else if (e.key === 'ArrowLeft') {
        targetIndex = (index - 1 + tabButtons.length) % tabButtons.length;
      } else if (e.key === 'Home') {
        targetIndex = 0;
      } else if (e.key === 'End') {
        targetIndex = tabButtons.length - 1;
      }

      if (targetIndex !== null) {
        e.preventDefault();
        tabButtons[targetIndex].focus();
        tabButtons[targetIndex].click();
      }
    });
  });

  // --- Ouverture de la modale principale ---
  async function openJobAnalysisModal(job) {
    currentAnalysisJob = job;
    document.body.style.overflow = 'hidden';

    // Remplissage de l'en-tête partagé
    if (modalJobTitle) modalJobTitle.textContent = job.title || 'Offre d\'emploi';
    if (modalJobSourceBadge) modalJobSourceBadge.textContent = job.source || 'Offre';
    if (modalJobCompany) modalJobCompany.innerHTML = `🏢 <strong>${escapeHtml(job.company || 'Entreprise non précisée')}</strong>`;
    if (modalJobLocation) modalJobLocation.textContent = `📍 ${job.location || 'Localisation non précisée'}`;
    if (modalJobContract) modalJobContract.textContent = `📄 ${job.contractType || 'Contrat non précisé'}`;

    // Réinitialisation de la vue sur l'onglet 1 (Résumé & Tips)
    switchModalTab('summary');
    jobModal.classList.remove('hidden');
    modalLoading.classList.remove('hidden');
    modalContent.innerHTML = '';
    if (modalGroqRateLimitBanner) modalGroqRateLimitBanner.classList.add('hidden');
    modalCloseBtn.focus();

    // Réinitialisation de l'historique de chat pour cette offre
    chatMessagesHistory = [];

    try {
      const res = await fetch('/api/jobs/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job })
      });

      const data = await res.json();
      modalLoading.classList.add('hidden');

      if (!res.ok || !data.success) {
        const customErr = new Error(data.error || 'Erreur lors de l\'analyse');
        customErr.data = data;
        customErr.status = res.status;
        throw customErr;
      }

      renderModalAnalysis(job, data.analysis);

      if (data.groqRateLimit) {
        showGroqTokenLimitBanner({
          retryAfterSeconds: data.groqRateLimit.retryAfterSeconds,
          formattedDuration: data.groqRateLimit.retryAfterFormatted,
          container: modalGroqRateLimitBanner,
          customMessage: "Analyse générée en mode standard : plus assez de tokens Groq disponibles pour le modèle complet.",
          onRetry: () => openJobModal(job)
        });
      }
    } catch (err) {
      modalLoading.classList.add('hidden');
      if (isGroqRateLimitError(err) || err.data?.isGroqRateLimit || err.status === 429) {
        const wait = extractGroqWaitTime(err.data || err);
        showGroqTokenLimitBanner({
          retryAfterSeconds: wait.totalSeconds,
          formattedDuration: wait.formatted,
          container: modalGroqRateLimitBanner,
          customMessage: "Impossible de compléter l'analyse : plus assez de tokens Groq disponibles.",
          onRetry: () => openJobModal(job)
        });
      }
      modalContent.innerHTML = `
        <div class="text-center py-8 space-y-4">
          <div class="text-3xl" aria-hidden="true">⚠️</div>
          <h3 class="text-lg font-bold text-rose-700">Impossible d'analyser cette offre</h3>
          <p class="text-sm text-slate-600">${escapeHtml(err.message)}</p>
          <div id="modalApplyActionWrapper" class="pt-3 flex justify-center"></div>
        </div>
      `;
      updateModalApplyState(job);
    }
  }

  function updateModalApplyState(job) {
    if (!job) return;
    const modalApplyWrapper = document.getElementById('modalApplyActionWrapper');
    if (!modalApplyWrapper) return;
    const isApplied = Boolean(candidatures[job.id]);
    modalApplyWrapper.innerHTML = `
      <button
        type="button"
        id="modalApplyBtn"
        class="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 min-h-[44px] px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 ${isApplied ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100 focus:ring-emerald-500' : 'bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-indigo-500'}"
        data-job-id="${escapeHtml(job.id)}"
        aria-label="${isApplied ? 'Gérer cette candidature' : 'Postuler à l\'offre ' + escapeHtml(job.title)}"
      >
        <span>${isApplied ? '✓ Postulée (Gérer le suivi)' : `Postuler sur ${escapeHtml(job.source || "l'offre")} ↗`}</span>
      </button>
      ${isApplied ? `
        <a
          href="${job.url}"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center justify-center w-11 h-11 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-all shrink-0"
          title="Ouvrir le lien de l'offre dans un nouvel onglet"
        >
          ↗
        </a>
      ` : ''}
    `;

    const btn = document.getElementById('modalApplyBtn');
    if (btn) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        lastFocusedElement = btn;
        if (Boolean(candidatures[job.id])) {
          closeModal();
          openCandidaturesModal(job.id);
        } else {
          openApplyConfirmModal(job);
        }
      });
    }
  }

  // --- Rendu Onglet 1 : Résumé & Tips ---
  function renderModalAnalysis(job, analysis) {
    const cvKeywordsHtml = (analysis.cvKeywords || [])
      .map(k => `<span class="inline-block px-2.5 py-1 rounded-md text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">${escapeHtml(k)}</span>`)
      .join(' ');

    const missionsHtml = (analysis.missions || [])
      .map(m => `<li class="flex items-start gap-2 text-sm text-slate-700 leading-relaxed"><span class="text-indigo-600 font-bold leading-none mt-1" aria-hidden="true">▸</span><span>${escapeHtml(m)}</span></li>`)
      .join('');

    const profileHtml = (analysis.profileRequired || [])
      .map(p => `<li class="flex items-start gap-2 text-sm text-slate-700 leading-relaxed"><span class="text-indigo-600 font-bold leading-none mt-1" aria-hidden="true">▸</span><span>${escapeHtml(p)}</span></li>`)
      .join('');

    const questionsHtml = (analysis.interviewQuestions || [])
      .map(q => `<li class="flex items-start gap-2 text-sm text-slate-700 leading-relaxed"><span class="text-amber-600 font-bold leading-none mt-1" aria-hidden="true">❓</span><span>${escapeHtml(q)}</span></li>`)
      .join('');

    modalContent.innerHTML = `
      <div class="space-y-6">
        
        <!-- 1. Résumé Exécutif -->
        <div class="space-y-2">
          <h3 class="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <span>📋</span> Résumé Exécutif du Poste
          </h3>
          <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 border-l-4 border-l-indigo-600 text-sm sm:text-base text-slate-800 leading-relaxed">
            ${escapeHtml(analysis.summary || 'Poste ciblé.')}
          </div>
        </div>

        <!-- 2. Missions Clés -->
        ${missionsHtml ? `
        <div class="space-y-2">
          <h3 class="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <span>🎯</span> Missions & Responsabilités Clés
          </h3>
          <ul class="space-y-2">
            ${missionsHtml}
          </ul>
        </div>` : ''}

        <!-- 3. Profil Recherché -->
        ${profileHtml ? `
        <div class="space-y-2">
          <h3 class="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <span>👤</span> Profil & Compétences Attendues
          </h3>
          <ul class="space-y-2">
            ${profileHtml}
          </ul>
        </div>` : ''}

        <!-- 4. Boîte à Tips pour Postuler (Highlight) -->
        <div class="rounded-xl border border-indigo-200 bg-indigo-50/40 p-5 space-y-4">
          <h3 class="text-base font-extrabold text-indigo-950 flex items-center gap-2">
            <span>💡</span> Tips Groq pour Réussir votre Candidature
          </h3>

          <!-- Mots-clés CV -->
          ${cvKeywordsHtml ? `
          <div class="space-y-1.5">
            <h4 class="text-xs font-bold uppercase tracking-wider text-indigo-900">
              📌 Mots-clés stratégiques à intégrer dans votre CV :
            </h4>
            <div class="flex flex-wrap gap-1.5 pt-0.5">
              ${cvKeywordsHtml}
            </div>
          </div>` : ''}

          <!-- Pitch d'accroche -->
          ${analysis.applicationTips ? `
          <div class="space-y-1.5">
            <h4 class="text-xs font-bold uppercase tracking-wider text-indigo-900">
              ✉️ Phrase d'accroche & argument massue pour postuler :
            </h4>
            <div class="relative p-3.5 rounded-lg bg-white border border-indigo-100 shadow-sm space-y-2">
              <p id="pitchText" class="text-sm text-slate-800 leading-relaxed font-medium">
                ${escapeHtml(analysis.applicationTips)}
              </p>
              <div class="flex justify-end">
                <button
                  type="button"
                  id="copyPitchBtn"
                  class="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-bold bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  📋 Copier le pitch
                </button>
              </div>
            </div>
          </div>` : ''}

          <!-- Questions d'entretien -->
          ${questionsHtml ? `
          <div class="space-y-1.5">
            <h4 class="text-xs font-bold uppercase tracking-wider text-indigo-900">
              🗣️ Questions probables en entretien d'embauche :
            </h4>
            <ul class="space-y-2">
              ${questionsHtml}
            </ul>
          </div>` : ''}
        </div>

        <!-- Pied de modale -->
        <div class="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span class="text-xs text-slate-500">
            Analyse effectuée par Groq AI • Llama 3
          </span>
          <div id="modalApplyActionWrapper" class="flex items-center gap-2 w-full sm:w-auto justify-end"></div>
        </div>

      </div>
    `;

    updateModalApplyState(job);

    const copyPitchBtn = document.getElementById('copyPitchBtn');
    if (copyPitchBtn) {
      copyPitchBtn.addEventListener('click', () => {
        const text = document.getElementById('pitchText')?.textContent?.trim() || '';
        navigator.clipboard.writeText(text).then(() => {
          copyPitchBtn.innerHTML = '✅ Copié !';
          copyPitchBtn.classList.add('bg-emerald-600', 'text-white');
          setTimeout(() => {
            copyPitchBtn.innerHTML = '📋 Copier le pitch';
            copyPitchBtn.classList.remove('bg-emerald-600', 'text-white');
          }, 2500);
        });
      });
    }
  }

  // =========================================================================
  // ONGLET 2 : ARGUMENTAIRE & LETTRE DE MOTIVATION (Basé sur critères CV Groq)
  // =========================================================================

  async function ensureArgumentaireLoaded(job, forceRefresh = false) {
    if (!job) return;
    if (!forceRefresh && argumentairesCache[job.id]) {
      renderArgumentaire(job, argumentairesCache[job.id], true);
      return;
    }

    argLoading.classList.remove('hidden');
    argContent.innerHTML = '';

    try {
      const res = await fetch('/api/jobs/argumentaire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job,
          cvCriteria: currentCvCriteria || null
        })
      });

      const data = await res.json();
      argLoading.classList.add('hidden');

      if (!res.ok || !data.success) {
        const customErr = new Error(data.error || 'Erreur lors de la génération de l\'argumentaire');
        customErr.data = data;
        customErr.status = res.status;
        throw customErr;
      }

      argumentairesCache[job.id] = data.argumentaire;
      renderArgumentaire(job, data.argumentaire, data.isAiPowered);

      if (data.groqRateLimit) {
        showGroqTokenLimitBanner({
          retryAfterSeconds: data.groqRateLimit.retryAfterSeconds,
          formattedDuration: data.groqRateLimit.retryAfterFormatted,
          container: modalGroqRateLimitBanner,
          customMessage: "Argumentaire généré en mode standard : plus assez de tokens Groq disponibles pour le modèle complet.",
          onRetry: () => ensureArgumentaireLoaded(job, true)
        });
      }
    } catch (err) {
      console.error('Erreur chargement argumentaire:', err);
      argLoading.classList.add('hidden');
      if (isGroqRateLimitError(err) || err.data?.isGroqRateLimit || err.status === 429) {
        const wait = extractGroqWaitTime(err.data || err);
        showGroqTokenLimitBanner({
          retryAfterSeconds: wait.totalSeconds,
          formattedDuration: wait.formatted,
          container: modalGroqRateLimitBanner,
          customMessage: "Impossible de générer l'argumentaire : plus assez de tokens Groq disponibles.",
          onRetry: () => ensureArgumentaireLoaded(job, true)
        });
      }
      argContent.innerHTML = `
        <div class="text-center py-8 space-y-4">
          <div class="text-3xl" aria-hidden="true">⚠️</div>
          <h3 class="text-lg font-bold text-rose-700">Impossible de générer l'argumentaire</h3>
          <p class="text-sm text-slate-600">${escapeHtml(err.message)}</p>
          <button type="button" id="retryArgBtn" class="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm">
            <span>🔄 Réessayer</span>
          </button>
        </div>
      `;
      document.getElementById('retryArgBtn')?.addEventListener('click', () => ensureArgumentaireLoaded(job, true));
    }
  }

  function renderArgumentaire(job, arg, isAiPowered = true) {
    const hasCvCriteria = Boolean(currentCvCriteria && (
      (currentCvCriteria.logiciels && currentCvCriteria.logiciels.length) ||
      (currentCvCriteria.experience && currentCvCriteria.experience.length) ||
      (currentCvCriteria.formations && currentCvCriteria.formations.length)
    ));

    const argumentsCardsHtml = (arg.argumentsCles || []).map((a, idx) => `
      <div class="p-4 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 shadow-sm transition-all space-y-2.5">
        <div class="flex items-center gap-2">
          <span class="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-extrabold flex items-center justify-center shrink-0">${idx + 1}</span>
          <h4 class="text-sm font-bold text-slate-900">${escapeHtml(a.titre || 'Argument clé')}</h4>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <div class="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200/80">
            <span class="font-bold text-amber-900 block mb-0.5">Besoin de l'offre :</span>
            <span class="text-amber-800">${escapeHtml(a.pointOffre || '')}</span>
          </div>
          <div class="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200/80">
            <span class="font-bold text-emerald-900 block mb-0.5">Votre atout CV :</span>
            <span class="text-emerald-800">${escapeHtml(a.atoutCandidat || '')}</span>
          </div>
        </div>
        <p class="text-xs sm:text-sm text-slate-700 leading-relaxed pt-1">
          ${escapeHtml(a.argumentation || '')}
        </p>
      </div>
    `).join('');

    const diffHtml = (arg.differentiateurs || []).map(d => `
      <li class="flex items-start gap-2 text-xs sm:text-sm text-slate-700">
        <span class="text-purple-600 font-bold leading-none mt-0.5">✨</span>
        <span>${escapeHtml(d)}</span>
      </li>
    `).join('');

    argContent.innerHTML = `
      <div class="space-y-6">

        <!-- Bandeau source des critères du candidat -->
        <div class="p-4 rounded-xl border ${hasCvCriteria ? 'bg-purple-50/50 border-purple-200' : 'bg-amber-50 border-amber-200'} flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div class="space-y-1">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="px-2.5 py-0.5 rounded-full text-xs font-bold ${hasCvCriteria ? 'bg-purple-100 text-purple-800 border border-purple-300' : 'bg-amber-100 text-amber-800 border border-amber-300'} flex items-center gap-1">
                <span>${hasCvCriteria ? '✨ Profil adapté par Groq AI' : '⚠️ Critères CV non configurés'}</span>
              </span>
              <span class="text-xs text-slate-600">
                ${hasCvCriteria ? 'Généré à partir de vos critères extraits sans ré-envoi du CV brut' : 'Modèle généraliste'}
              </span>
            </div>
            <p class="text-xs text-slate-600">
              ${hasCvCriteria ? 'Vous pouvez ajuster vos critères pour recalculer instantanément l\'argumentaire.' : 'Ajoutez votre CV ou renseignez vos critères pour obtenir un argumentaire ultra-personnalisé.'}
            </p>
          </div>
          <button
            type="button"
            id="argOpenCvModalBtn"
            class="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-white text-indigo-700 border border-indigo-200 hover:bg-indigo-50 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <span>✏️ Modifier les critères CV</span>
          </button>
        </div>

        <!-- 1. Phrase d'accroche pour la candidature -->
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <span>🎯</span> Phrase d'accroche percutante
            </h3>
            <button
              type="button"
              id="copyArgAccrocheBtn"
              class="text-xs text-indigo-600 hover:text-indigo-800 font-bold focus:outline-none"
            >
              📋 Copier
            </button>
          </div>
          <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 leading-relaxed font-medium">
            <span id="argAccrocheText">${escapeHtml(arg.accroche || '')}</span>
          </div>
        </div>

        <!-- 2. Les 3 arguments massues -->
        <div class="space-y-3">
          <h3 class="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <span>⚔️</span> Arguments Massues (Miroir Offre ⟷ Candidat)
          </h3>
          <div class="space-y-3">
            ${argumentsCardsHtml}
          </div>
        </div>

        <!-- 3. Atouts différenciateurs -->
        ${diffHtml ? `
        <div class="space-y-2">
          <h3 class="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <span>💎</span> Vos Différenciateurs & Valeur Ajoutée
          </h3>
          <ul class="p-4 rounded-xl bg-purple-50/30 border border-purple-100 space-y-2">
            ${diffHtml}
          </ul>
        </div>` : ''}

        <!-- 4. Modèle intégral de Lettre de Motivation -->
        <div class="space-y-2">
          <div class="flex items-center justify-between flex-wrap gap-2">
            <h3 class="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <span>✉️</span> Modèle de Lettre de Motivation Rédigée
            </h3>
            <button
              type="button"
              id="copyFullLetterBtn"
              class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <span>📋 Copier la lettre entière</span>
            </button>
          </div>
          <div class="relative p-5 rounded-xl bg-slate-50 border border-slate-300 text-xs sm:text-sm text-slate-800 leading-relaxed font-sans whitespace-pre-line shadow-inner max-h-96 overflow-y-auto">
            <div id="fullLetterContent">${escapeHtml(arg.modeleLettre || '')}</div>
          </div>
        </div>

        <!-- Pied de panneau -->
        <div class="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span class="text-xs text-slate-500">
            Généré par Groq AI • Llama 3.3 Versatile
          </span>
          <button
            type="button"
            id="regenArgBtn"
            class="text-xs font-bold text-indigo-700 hover:text-indigo-900 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-indigo-200 bg-white hover:bg-indigo-50 transition-colors"
          >
            <span>🔄 Régénérer l'argumentaire</span>
          </button>
        </div>

      </div>
    `;

    // Événements boutons de copie et liens
    document.getElementById('argOpenCvModalBtn')?.addEventListener('click', () => {
      openCvCriteriaModalFunc();
    });

    document.getElementById('copyArgAccrocheBtn')?.addEventListener('click', () => {
      const text = document.getElementById('argAccrocheText')?.textContent || '';
      navigator.clipboard.writeText(text).then(() => {
        const btn = document.getElementById('copyArgAccrocheBtn');
        if (btn) btn.textContent = '✅ Copiée !';
        setTimeout(() => { if (btn) btn.textContent = '📋 Copier'; }, 2000);
      });
    });

    document.getElementById('copyFullLetterBtn')?.addEventListener('click', () => {
      const text = document.getElementById('fullLetterContent')?.textContent || '';
      navigator.clipboard.writeText(text).then(() => {
        const btn = document.getElementById('copyFullLetterBtn');
        if (btn) {
          btn.innerHTML = '<span>✅ Lettre copiée dans le presse-papier !</span>';
          btn.classList.add('bg-emerald-600');
          setTimeout(() => {
            btn.innerHTML = '<span>📋 Copier la lettre entière</span>';
            btn.classList.remove('bg-emerald-600');
          }, 3000);
        }
      });
    });

    document.getElementById('regenArgBtn')?.addEventListener('click', () => {
      ensureArgumentaireLoaded(job, true);
    });
  }

  // =========================================================================
  // ONGLET 3 : CHATBOT RECRUTEMENT GROQ AI VIA WEBSOCKET (Temps Réel 2026)
  // =========================================================================

  function getWebSocketUrl() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${window.location.host}/ws/chat`;
  }

  function updateChatWsStatus(isOnline, text) {
    if (chatWsStatusDot) {
      chatWsStatusDot.className = `w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-amber-500'}`;
    }
    if (chatWsStatusText) {
      chatWsStatusText.textContent = text;
    }
  }

  function initChatWebSocket() {
    if (chatWs && (chatWs.readyState === WebSocket.OPEN || chatWs.readyState === WebSocket.CONNECTING)) {
      return;
    }

    try {
      chatWs = new WebSocket(getWebSocketUrl());

      chatWs.onopen = () => {
        updateChatWsStatus(true, 'Coach Groq connecté en direct');
      };

      chatWs.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleChatWsMessage(data);
        } catch (err) {
          console.error('[ChatWS] Erreur parsing message serveur :', err);
        }
      };

      chatWs.onerror = (err) => {
        console.warn('[ChatWS] Erreur WebSocket :', err);
        updateChatWsStatus(false, 'Connexion instable');
      };

      chatWs.onclose = () => {
        updateChatWsStatus(false, 'Déconnecté (reconnexion automatique...)');
        if (jobModal && !jobModal.classList.contains('hidden')) {
          clearTimeout(wsReconnectTimeout);
          wsReconnectTimeout = setTimeout(initChatWebSocket, 3000);
        }
      };
    } catch (e) {
      console.warn('[ChatWS] Impossible d\'initialiser WebSocket:', e);
      updateChatWsStatus(false, 'Mode hors-ligne');
    }
  }

  function ensureChatInitialized(job) {
    initChatWebSocket();
    if (chatMessagesHistory.length === 0) {
      resetChatToWelcome(job);
    }
  }

  function resetChatToWelcome(job) {
    chatMessagesHistory = [];
    if (!chatMessages) return;

    const hasCriteria = Boolean(currentCvCriteria && currentCvCriteria.formations);
    const welcomeHtml = `
      <div class="mr-auto bg-white text-slate-800 border border-slate-200 p-4 max-w-[85%] space-y-2 rounded-2xl rounded-tl-xs shadow-xs">
        <div class="flex items-center gap-2 mb-1">
          <span class="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">✨</span>
          <span class="text-xs font-bold text-slate-900">Coach Recrutement Groq AI</span>
          <span class="text-[10px] text-slate-400 font-medium">Maintenant</span>
        </div>
        <div class="text-xs sm:text-sm text-slate-700 leading-relaxed space-y-2">
          <p>Bonjour ! Je suis votre coach carrière dédié pour le poste de <strong>${escapeHtml(job?.title || 'ce poste')}</strong> chez <strong>${escapeHtml(job?.company || 'cette entreprise')}</strong>.</p>
          <p class="text-xs text-slate-500">
            ${hasCriteria ? '✅ Vos critères CV sont chargés : je personnaliserai toutes mes réponses selon votre profil.' : '💡 Astuce : vos critères de CV enrichissent mes réponses. Vous pouvez aussi poser vos questions directement ci-dessous.'}
          </p>
          <p>Comment puis-je vous aider à maximiser vos chances aujourd\'hui ?</p>
        </div>
      </div>
    `;
    chatMessages.innerHTML = welcomeHtml;
    scrollChatToBottom();
  }

  function renderMarkdownView(text) {
    if (!text) return '';

    // 1. Échappement anti-XSS strict
    let safe = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // 2. Extraction sécurisée des blocs de code multi-lignes ```lang ... ```
    const codeBlocks = [];
    safe = safe.replace(/```([a-zA-Z0-9_\-\.]*)\n?([\s\S]*?)```/g, (match, lang, code) => {
      const id = `__CODE_BLOCK_${codeBlocks.length}__`;
      codeBlocks.push(`<pre class="my-2 p-3 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800"><code>${code.trim()}</code></pre>`);
      return id;
    });

    // 3. Code inline `...`
    safe = safe.replace(/`([^`\n]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 font-mono text-xs text-indigo-700 font-semibold">$1</code>');

    // 4. Mises en valeur : gras et italique
    safe = safe.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    safe = safe.replace(/__([^_]+)__/g, '<strong>$1</strong>');
    safe = safe.replace(/\*([^*\n]+)\*/g, '<em>$1</em>');
    safe = safe.replace(/_([^_\n]+)_/g, '<em>$1</em>');

    // 5. Analyse par ligne (Titres, Listes, Citations, Paragraphes)
    const lines = safe.split('\n');
    let html = '';
    let currentListType = null; // 'ul' | 'ol' | null

    function closeList() {
      if (currentListType === 'ul') {
        html += '</ul>';
        currentListType = null;
      } else if (currentListType === 'ol') {
        html += '</ol>';
        currentListType = null;
      }
    }

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Placeholder de bloc de code
      if (line.startsWith('__CODE_BLOCK_') && line.endsWith('__')) {
        closeList();
        html += line;
        continue;
      }

      // Ligne vide
      if (line === '') {
        closeList();
        continue;
      }

      // Titres H4
      if (line.startsWith('#### ')) {
        closeList();
        html += `<h4 class="text-xs font-black text-slate-800 uppercase tracking-wide mt-3 mb-1.5">${line.substring(5)}</h4>`;
        continue;
      }

      // Titres H3
      if (line.startsWith('### ')) {
        closeList();
        html += `<h3 class="text-sm font-extrabold text-slate-900 mt-3.5 mb-1.5 flex items-center gap-1.5">${line.substring(4)}</h3>`;
        continue;
      }

      // Titres H1 ou H2
      if (line.startsWith('## ') || line.startsWith('# ')) {
        closeList();
        const cleanTitle = line.replace(/^#+\s*/, '');
        html += `<h3 class="text-sm sm:text-base font-extrabold text-indigo-950 mt-4 mb-2 flex items-center gap-1.5">${cleanTitle}</h3>`;
        continue;
      }

      // Citations (> ...)
      if (line.startsWith('&gt; ') || line.startsWith('> ')) {
        closeList();
        const quoteText = line.replace(/^(&gt;|>)\s*/, '');
        html += `<blockquote class="border-l-4 border-indigo-500 bg-indigo-50/50 pl-3.5 pr-2 py-1.5 my-2 text-xs sm:text-sm text-slate-700 italic rounded-r-lg">${quoteText}</blockquote>`;
        continue;
      }

      // Listes numérotées (1. ..., 2. ...)
      const olMatch = line.match(/^(\d+)\.\s+(.*)/);
      if (olMatch) {
        if (currentListType !== 'ol') {
          closeList();
          html += '<ol class="list-decimal ml-5 space-y-1.5 my-2 text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">';
          currentListType = 'ol';
        }
        html += `<li>${olMatch[2]}</li>`;
        continue;
      }

      // Listes à puces (- ..., * ..., • ...)
      const ulMatch = line.match(/^[-*•]\s+(.*)/);
      if (ulMatch) {
        if (currentListType !== 'ul') {
          closeList();
          html += '<ul class="list-disc ml-5 space-y-1 my-2 text-xs sm:text-sm text-slate-800 leading-relaxed">';
          currentListType = 'ul';
        }
        html += `<li>${ulMatch[1]}</li>`;
        continue;
      }

      // Paragraphe standard
      closeList();
      html += `<p class="my-1.5 text-xs sm:text-sm text-slate-800 leading-relaxed">${line}</p>`;
    }

    closeList();

    // Restitution des blocs de code
    codeBlocks.forEach((codeBlockHtml, idx) => {
      html = html.replace(`__CODE_BLOCK_${idx}__`, codeBlockHtml);
    });

    return html;
  }

  function appendChatMessage(role, text, isStreaming = false) {
    if (!chatMessages) return null;

    const wrapper = document.createElement('div');
    if (role === 'user') {
      wrapper.className = 'ml-auto bg-gradient-to-r from-indigo-600 to-indigo-700 text-white p-3.5 max-w-[85%] text-xs sm:text-sm leading-relaxed rounded-2xl rounded-tr-xs shadow-sm';
      wrapper.textContent = text;
    } else {
      wrapper.className = 'mr-auto bg-white text-slate-800 border border-slate-200 p-4 max-w-[85%] space-y-2 rounded-2xl rounded-tl-xs shadow-xs';
      wrapper.innerHTML = `
        <div class="flex items-center gap-2 mb-1">
          <span class="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">✨</span>
          <span class="text-xs font-bold text-slate-900">Coach Recrutement</span>
          <span class="text-[10px] text-slate-400 font-medium">En direct</span>
        </div>
        <div class="text-xs sm:text-sm text-slate-700 leading-relaxed chat-msg-content">
          ${renderMarkdownView(text)}${isStreaming ? '<span class="inline-block w-1.5 h-3.5 ml-0.5 bg-indigo-600 animate-pulse align-middle" aria-hidden="true"></span>' : ''}
        </div>
      `;
    }

    chatMessages.appendChild(wrapper);
    scrollChatToBottom();
    return wrapper;
  }

  function scrollChatToBottom() {
    if (chatMessages) {
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
  }

  function setChatInputState(disabled) {
    if (chatInput) chatInput.disabled = disabled;
    if (chatSendBtn) chatSendBtn.disabled = disabled;
    isStreamingChat = disabled;
  }

  function sendChatMessage(text) {
    if (!text || !text.trim() || isStreamingChat) return;
    const cleanText = text.trim();

    appendChatMessage('user', cleanText);
    chatMessagesHistory.push({ role: 'user', content: cleanText });

    if (chatInput) chatInput.value = '';

    currentStreamingText = '';
    isStreamingChat = true;
    currentStreamingMsgEl = appendChatMessage('assistant', '', true);
    setChatInputState(true);

    const payload = {
      type: 'chat_message',
      job: currentAnalysisJob,
      cvCriteria: currentCvCriteria || null,
      messages: chatMessagesHistory
    };

    if (chatWs && chatWs.readyState === WebSocket.OPEN) {
      chatWs.send(JSON.stringify(payload));
    } else {
      initChatWebSocket();
      setTimeout(() => {
        if (chatWs && chatWs.readyState === WebSocket.OPEN) {
          chatWs.send(JSON.stringify(payload));
        } else {
          finishStreaming("Désolé, la connexion au serveur est interrompue. Veuillez réessayer.");
        }
      }, 600);
    }
  }

  function handleChatWsMessage(data) {
    if (!data || !data.type) return;

    if (data.type === 'start') {
      currentStreamingText = '';
    } else if (data.type === 'chunk') {
      currentStreamingText += (data.delta || '');
      if (currentStreamingMsgEl) {
        const contentEl = currentStreamingMsgEl.querySelector('.chat-msg-content');
        if (contentEl) {
          contentEl.innerHTML = renderMarkdownView(currentStreamingText) + '<span class="inline-block w-1.5 h-3.5 ml-0.5 bg-indigo-600 animate-pulse align-middle" aria-hidden="true"></span>';
        }
        scrollChatToBottom();
      }
    } else if (data.type === 'done') {
      finishStreaming(data.fullText || currentStreamingText);
      if (data.isGroqRateLimit) {
        showGroqTokenLimitBanner({
          retryAfterSeconds: data.retryAfterSeconds,
          formattedDuration: data.retryAfterFormatted,
          container: modalGroqRateLimitBanner,
          customMessage: "Le coach Groq a atteint la limite de tokens par minute.",
          onRetry: () => {
            const lastMsg = chatMessagesHistory.filter(m => m.role === 'user').pop();
            if (lastMsg) sendChatMessage(lastMsg.content);
          }
        });
      }
    } else if (data.type === 'error') {
      const isRateLimit = data.isGroqRateLimit || isGroqRateLimitError(data.error);
      if (isRateLimit) {
        const wait = extractGroqWaitTime(data);
        const msg = `⚠️ Il n'y a plus assez de tokens Groq disponibles pour le moment. Veuillez retenter dans ${wait.formatted}.`;
        finishStreaming(msg);
        showGroqTokenLimitBanner({
          retryAfterSeconds: wait.totalSeconds,
          formattedDuration: wait.formatted,
          container: modalGroqRateLimitBanner,
          customMessage: "Le coach Groq a atteint la limite de tokens par minute.",
          onRetry: () => {
            const lastMsg = chatMessagesHistory.filter(m => m.role === 'user').pop();
            if (lastMsg) sendChatMessage(lastMsg.content);
          }
        });
      } else {
        finishStreaming("⚠️ Erreur : " + (data.error || 'Une erreur est survenue lors de la réponse de Groq.'));
      }
    }
  }

  function finishStreaming(finalText) {
    if (currentStreamingMsgEl) {
      const contentEl = currentStreamingMsgEl.querySelector('.chat-msg-content');
      if (contentEl) {
        contentEl.innerHTML = renderMarkdownView(finalText);
      }
    }
    chatMessagesHistory.push({ role: 'assistant', content: finalText });
    setChatInputState(false);
    currentStreamingMsgEl = null;
    currentStreamingText = '';
    scrollChatToBottom();
    chatInput?.focus();
  }

  // Événements de soumission du chat
  if (chatForm) {
    chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      sendChatMessage(chatInput.value);
    });
  }

  if (chatInput) {
    chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendChatMessage(chatInput.value);
      }
    });
  }

  // Pilules de suggestions cliquables
  if (chatQuickSuggestions) {
    chatQuickSuggestions.querySelectorAll('.chat-suggest-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const text = btn.textContent.replace(/^[^\wÀ-ÿ]+/, '').trim();
        sendChatMessage(text);
      });
    });
  }

  // Bouton de réinitialisation du chat
  if (clearChatBtn) {
    clearChatBtn.addEventListener('click', () => {
      resetChatToWelcome(currentAnalysisJob);
      chatInput?.focus();
    });
  }

  // =========================================================================
  // GESTIONNAIRE COMPLET DES CANDIDATURES, ENTRETIENS, CALENDRIER & EXPORT/IMPORT
  // =========================================================================

  function formatDateFr(dateStr) {
    if (!dateStr) return '';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
      return dateStr;
    } catch (e) {
      return dateStr;
    }
  }

  function showToastNotification(message, isSuccess = true) {
    if (modalActionNotification) {
      modalActionNotification.textContent = message;
      modalActionNotification.className = `text-xs font-bold px-3 py-1 rounded-lg ${isSuccess ? 'text-emerald-800 bg-emerald-100 border border-emerald-300' : 'text-rose-800 bg-rose-100 border border-rose-300'}`;
      modalActionNotification.classList.remove('hidden');
      setTimeout(() => {
        modalActionNotification.classList.add('hidden');
      }, 4000);
    }

    // Notification globale flottante
    let toast = document.getElementById('ftjFloatingToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'ftjFloatingToast';
      toast.className = 'fixed bottom-5 right-5 z-50 px-4 py-3 rounded-2xl shadow-xl border text-xs sm:text-sm font-bold transition-all transform duration-300 flex items-center gap-2 max-w-sm';
      document.body.appendChild(toast);
    }
    toast.className = `fixed bottom-5 right-5 z-50 px-4 py-3 rounded-2xl shadow-xl border text-xs sm:text-sm font-bold transition-all transform duration-300 flex items-center gap-2 max-w-sm ${isSuccess ? 'bg-slate-900 text-white border-slate-700' : 'bg-rose-900 text-white border-rose-700'}`;
    toast.innerHTML = `<span>${isSuccess ? '✅' : '⚠️'}</span><span>${escapeHtml(message)}</span>`;
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
    }, 4000);
  }

  function updateCandidaturesBadgeUI() {
    const list = Object.values(candidatures);
    const total = list.length;

    if (headerCandidaturesBadge) headerCandidaturesBadge.textContent = total;
    if (modalCandidaturesTotalBadge) modalCandidaturesTotalBadge.textContent = `${total} candidature${total > 1 ? 's' : ''}`;

    const waiting = list.filter(c => c.status === 'En attente de réponse').length;
    const interviews = list.filter(c => c.status === 'Entretien x' || (c.interviews && c.interviews.length > 0)).length;
    const accepted = list.filter(c => c.status === 'Accepté').length;
    const rejected = list.filter(c => (c.status || '').startsWith('Non abouti')).length;

    if (candCountWaiting) candCountWaiting.textContent = waiting;
    if (candCountInterview) candCountInterview.textContent = interviews;
    if (candCountAccepted) candCountAccepted.textContent = accepted;
    if (candCountRejected) candCountRejected.textContent = rejected;

    if (currentAnalysisJob && jobModal && !jobModal.classList.contains('hidden')) {
      updateModalApplyState(currentAnalysisJob);
    }
  }

  function openApplyConfirmModal(job) {
    if (!applyConfirmModal || !job) return;
    pendingApplyJob = job;
    lastFocusedElement = document.activeElement;

    if (applyConfirmJobTitle) applyConfirmJobTitle.textContent = job.title || 'Poste sans titre';
    if (applyConfirmCompany) applyConfirmCompany.textContent = job.company || 'Entreprise';
    if (applyConfirmLocation) applyConfirmLocation.textContent = job.location || 'Lieu non précisé';
    if (applyConfirmSource) applyConfirmSource.textContent = job.source || 'FindTheJob';

    const today = new Date().toISOString().split('T')[0];
    if (applyConfirmDateInput) applyConfirmDateInput.value = today;

    document.body.style.overflow = 'hidden';
    applyConfirmModal.classList.remove('hidden');
    if (applyAndRedirectBtn) applyAndRedirectBtn.focus();
  }

  function closeApplyConfirmModal() {
    if (!applyConfirmModal) return;
    applyConfirmModal.classList.add('hidden');
    pendingApplyJob = null;
    if (
      (!jobModal || jobModal.classList.contains('hidden')) &&
      (!candidaturesModal || candidaturesModal.classList.contains('hidden'))
    ) {
      document.body.style.overflow = '';
    }
    if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
      lastFocusedElement.focus();
    }
  }

  function handleJobApplyClick(job) {
    if (!job) return;
    const isApplied = Boolean(candidatures[job.id]);

    if (isApplied) {
      // Ouvre directement la modale de gestion focalisée sur cette offre
      openCandidaturesModal(job.id);
    } else {
      // Affiche le pop-up d'information et de confirmation avec les 3 options
      openApplyConfirmModal(job);
    }
  }

  // =================== CONTRÔLEURS DE LA MODALE PRINCIPALE ===================

  function openCandidaturesModal(focusJobId = null) {
    if (!candidaturesModal) return;
    lastFocusedElement = document.activeElement;
    if (jobModal && !jobModal.classList.contains('hidden')) {
      jobModal.classList.add('hidden');
    }
    document.body.style.overflow = 'hidden';
    candidaturesModal.classList.remove('hidden');

    updateCandidaturesBadgeUI();
    if (currentCandViewTab === 'calendar') {
      renderCalendarView();
    } else {
      renderCandidaturesList();
    }

    if (focusJobId) {
      setTimeout(() => {
        const cardEl = document.getElementById(`cand-card-${focusJobId}`);
        if (cardEl) {
          cardEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          cardEl.classList.add('ring-2', 'ring-indigo-500');
          setTimeout(() => cardEl.classList.remove('ring-2', 'ring-indigo-500'), 3000);
        }
      }, 150);
    }
  }

  function closeCandidaturesModal() {
    if (!candidaturesModal) return;
    candidaturesModal.classList.add('hidden');
    document.body.style.overflow = '';
    if (lastFocusedElement) lastFocusedElement.focus();
  }

  if (openCandidaturesBtn) {
    openCandidaturesBtn.addEventListener('click', () => openCandidaturesModal());
  }

  if (closeCandidaturesModalBtn) {
    closeCandidaturesModalBtn.addEventListener('click', closeCandidaturesModal);
  }

  // Fermeture modale sur fond ou touche Echap
  if (candidaturesModal) {
    candidaturesModal.addEventListener('click', (e) => {
      if (e.target === candidaturesModal) closeCandidaturesModal();
    });
  }

  // Événements Modale de Confirmation de Postulation
  if (closeApplyConfirmModalBtn) {
    closeApplyConfirmModalBtn.addEventListener('click', closeApplyConfirmModal);
  }

  if (cancelApplyConfirmBtn) {
    cancelApplyConfirmBtn.addEventListener('click', closeApplyConfirmModal);
  }

  if (applyConfirmModal) {
    applyConfirmModal.addEventListener('click', (e) => {
      if (e.target === applyConfirmModal) closeApplyConfirmModal();
    });
  }

  // Option 2 : Juste être redirigé vers l'offre (sans marquer comme postulée)
  if (justVisitOfferBtn) {
    justVisitOfferBtn.addEventListener('click', () => {
      if (!pendingApplyJob) return;
      const urlToOpen = pendingApplyJob.url;
      closeApplyConfirmModal();
      if (urlToOpen) {
        window.open(urlToOpen, '_blank', 'noopener,noreferrer');
      }
    });
  }

  // Option 1 : Marquer comme « Postulée » avec la date choisie ET ouvrir l'offre
  if (applyAndRedirectBtn) {
    applyAndRedirectBtn.addEventListener('click', () => {
      if (!pendingApplyJob) return;
      const job = pendingApplyJob;
      const chosenDate = (applyConfirmDateInput && applyConfirmDateInput.value)
        ? applyConfirmDateInput.value
        : new Date().toISOString().split('T')[0];

      const newCand = {
        id: job.id,
        jobId: job.id,
        jobTitle: job.title || 'Poste sans titre',
        company: job.company || 'Entreprise',
        location: job.location || '',
        url: job.url || '',
        source: job.source || 'FindTheJob',
        appliedAt: chosenDate,
        status: 'En attente de réponse',
        statusStep: '',
        notes: '',
        interviews: [],
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      if (window.storageManager) {
        candidatures = window.storageManager.saveCandidature(newCand);
      } else {
        candidatures[job.id] = newCand;
      }

      const urlToOpen = job.url;
      closeApplyConfirmModal();

      if (urlToOpen) {
        window.open(urlToOpen, '_blank', 'noopener,noreferrer');
      }

      updateCandidaturesBadgeUI();
      updateCandidatureFilterBadges();
      applyAllFiltersAndSort();
      showToastNotification(`Candidature pour « ${job.company} » enregistrée au ${formatDateFr(chosenDate)} !`);
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (applyConfirmModal && !applyConfirmModal.classList.contains('hidden')) {
        closeApplyConfirmModal();
        return;
      }
      if (manualCandModal && !manualCandModal.classList.contains('hidden')) {
        manualCandModal.classList.add('hidden');
        return;
      }
      if (interviewModal && !interviewModal.classList.contains('hidden')) {
        interviewModal.classList.add('hidden');
        return;
      }
      if (candidaturesModal && !candidaturesModal.classList.contains('hidden')) {
        closeCandidaturesModal();
      }
    }
  });

  // Basculement Onglets (Liste / Calendrier)
  if (candTabListBtn && candTabCalendarBtn) {
    candTabListBtn.addEventListener('click', () => {
      currentCandViewTab = 'list';
      candTabListBtn.className = 'inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all bg-white text-indigo-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[34px]';
      candTabListBtn.setAttribute('aria-selected', 'true');
      candTabCalendarBtn.className = 'inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[34px]';
      candTabCalendarBtn.setAttribute('aria-selected', 'false');

      if (candListView) candListView.classList.remove('hidden');
      if (candCalendarView) candCalendarView.classList.add('hidden');
      renderCandidaturesList();
    });

    candTabCalendarBtn.addEventListener('click', () => {
      currentCandViewTab = 'calendar';
      candTabCalendarBtn.className = 'inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all bg-white text-indigo-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[34px]';
      candTabCalendarBtn.setAttribute('aria-selected', 'true');
      candTabListBtn.className = 'inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[34px]';
      candTabListBtn.setAttribute('aria-selected', 'false');

      if (candListView) candListView.classList.add('hidden');
      if (candCalendarView) candCalendarView.classList.remove('hidden');
      renderCalendarView();
    });
  }

  // Filtres statut dans la modale
  if (modalStatusFilterBar) {
    modalStatusFilterBar.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', (e) => {
        activeModalStatusFilter = e.currentTarget.dataset.modalStatus || 'all';
        modalStatusFilterBar.querySelectorAll('button').forEach(b => {
          if (b.dataset.modalStatus === activeModalStatusFilter) {
            b.className = 'modal-status-filter active px-3 py-1 rounded-full font-bold border border-indigo-600 bg-indigo-50 text-indigo-700 shadow-2xs';
          } else {
            b.className = 'modal-status-filter px-3 py-1 rounded-full font-semibold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50';
          }
        });
        renderCandidaturesList();
      });
    });
  }

  // =================== RENDU DE LA VUE LISTE DES CANDIDATURES ===================

  function renderCandidaturesList() {
    if (!candidaturesCardsContainer) return;
    candidaturesCardsContainer.innerHTML = '';

    const list = Object.values(candidatures).sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
    let filtered = list;

    if (activeModalStatusFilter === 'En attente de réponse') {
      filtered = list.filter(c => c.status === 'En attente de réponse');
    } else if (activeModalStatusFilter === 'Entretien x') {
      filtered = list.filter(c => c.status === 'Entretien x' || (c.interviews && c.interviews.length > 0));
    } else if (activeModalStatusFilter === 'Accepté') {
      filtered = list.filter(c => c.status === 'Accepté');
    } else if (activeModalStatusFilter === 'Non abouti') {
      filtered = list.filter(c => (c.status || '').startsWith('Non abouti'));
    }

    if (!filtered || filtered.length === 0) {
      if (candEmptyState) candEmptyState.classList.remove('hidden');
      return;
    }

    if (candEmptyState) candEmptyState.classList.add('hidden');

    filtered.forEach(cand => {
      const card = document.createElement('div');
      card.id = `cand-card-${cand.jobId || cand.id}`;
      card.className = 'rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm space-y-4 hover:border-indigo-200 transition-all';

      // Statut actuel & bordure
      const status = cand.status || 'En attente de réponse';
      let statusBorderColor = 'border-l-4 border-amber-400';
      if (status === 'Entretien x') statusBorderColor = 'border-l-4 border-indigo-500';
      else if (status === 'Accepté') statusBorderColor = 'border-l-4 border-emerald-500';
      else if (status.startsWith('Non abouti')) statusBorderColor = 'border-l-4 border-rose-400';

      card.classList.add(...statusBorderColor.split(' '));

      // Entretien(s)
      const interviews = Array.isArray(cand.interviews) ? cand.interviews : [];
      let interviewsHtml = '';

      if (interviews.length > 0) {
        interviewsHtml = `
          <div class="space-y-2 pt-2 border-t border-slate-100">
            <h5 class="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <span>🎙️</span>
              <span>Entretiens programmés (${interviews.length}) :</span>
            </h5>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              ${interviews.map((item, idx) => `
                <div class="p-3 rounded-xl bg-indigo-50/50 border border-indigo-100 text-xs space-y-1 relative group">
                  <div class="flex items-center justify-between gap-1 font-bold text-indigo-950">
                    <span class="truncate">${escapeHtml(item.title || `Entretien ${idx + 1}`)}</span>
                    <span class="px-2 py-0.5 rounded-full text-[10px] bg-white border border-indigo-200 text-indigo-700 capitalize">
                      ${escapeHtml(item.type || 'Visio')}
                    </span>
                  </div>
                  <div class="text-slate-600 flex items-center gap-2 flex-wrap">
                    <span>📅 ${escapeHtml(formatDateFr(item.date))}</span>
                    <span>⏰ ${escapeHtml(item.time || '10:00')} (${item.durationMinutes || 60}m)</span>
                  </div>
                  ${item.locationOrLink ? `
                    <div class="text-indigo-700 truncate font-medium">
                      📍 ${item.locationOrLink.startsWith('http') ? `<a href="${item.locationOrLink}" target="_blank" rel="noopener noreferrer" class="underline hover:text-indigo-900">Lien Visio</a>` : escapeHtml(item.locationOrLink)}
                    </div>
                  ` : ''}
                  ${item.interviewer ? `<div class="text-slate-500 truncate">👤 ${escapeHtml(item.interviewer)}</div>` : ''}
                  ${item.notes ? `<div class="text-slate-600 text-[11px] italic pt-0.5">"${escapeHtml(item.notes)}"</div>` : ''}
                  
                  <!-- Actions entretien -->
                  <div class="pt-1 flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      class="btn-edit-interview text-[11px] font-bold text-indigo-600 hover:text-indigo-900 px-2 py-0.5 rounded hover:bg-white"
                      data-job-id="${escapeHtml(cand.jobId)}"
                      data-interview-id="${escapeHtml(item.id)}"
                    >
                      Modifier
                    </button>
                    <button
                      type="button"
                      class="btn-delete-interview text-[11px] font-semibold text-rose-600 hover:text-rose-900 px-2 py-0.5 rounded hover:bg-white"
                      data-job-id="${escapeHtml(cand.jobId)}"
                      data-interview-id="${escapeHtml(item.id)}"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }

      card.innerHTML = `
        <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div class="space-y-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <h4 class="font-extrabold text-slate-900 text-sm sm:text-base leading-snug">
                ${cand.url ? `<a href="${cand.url}" target="_blank" rel="noopener noreferrer" class="hover:text-indigo-600 focus:outline-none focus:underline">${escapeHtml(cand.jobTitle)} ↗</a>` : escapeHtml(cand.jobTitle)}
              </h4>
              <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                ${escapeHtml(cand.source || 'Offre')}
              </span>
            </div>
            
            <div class="text-xs text-slate-600 flex items-center gap-2 flex-wrap">
              <span class="font-bold text-slate-800">🏢 ${escapeHtml(cand.company)}</span>
              ${cand.location ? `<span>📍 ${escapeHtml(cand.location)}</span>` : ''}
              <span class="text-slate-400">·</span>
              <span class="font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200 flex items-center gap-1">
                <span>📨 Postulée le</span>
                <input
                  type="date"
                  class="cand-applied-date-input bg-transparent border-0 p-0 text-emerald-950 font-bold text-xs cursor-pointer focus:ring-1 focus:ring-emerald-500 rounded"
                  value="${cand.appliedAt || ''}"
                  data-job-id="${escapeHtml(cand.jobId)}"
                  title="Modifier la date de postulation"
                />
              </span>
            </div>
          </div>

          <!-- Sélecteur de statut réactif -->
          <div class="flex items-center gap-2 self-start shrink-0">
            <label for="status-sel-${escapeHtml(cand.jobId)}" class="sr-only">Statut de la candidature</label>
            <select
              id="status-sel-${escapeHtml(cand.jobId)}"
              class="cand-status-select rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-800 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
              data-job-id="${escapeHtml(cand.jobId)}"
            >
              <option value="En attente de réponse" ${status === 'En attente de réponse' ? 'selected' : ''}>⏳ En attente de réponse</option>
              <option value="Entretien x" ${status === 'Entretien x' ? 'selected' : ''}>🎙️ Entretien x</option>
              <option value="Accepté" ${status === 'Accepté' ? 'selected' : ''}>🎉 Accepté</option>
              <option value="Non abouti entreprise" ${status === 'Non abouti entreprise' ? 'selected' : ''}>✕ Non abouti entreprise</option>
              <option value="Non abouti candidat" ${status === 'Non abouti candidat' ? 'selected' : ''}>✕ Non abouti candidat</option>
            </select>
          </div>
        </div>

        <!-- Section Entretiens -->
        ${interviewsHtml}

        <!-- Barre d'actions du dossier -->
        <div class="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap text-xs">
          <div class="flex items-center gap-2">
            <button
              type="button"
              class="btn-add-interview inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold border border-indigo-200 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500"
              data-job-id="${escapeHtml(cand.jobId)}"
            >
              <span aria-hidden="true">➕</span>
              <span>Planifier un entretien</span>
            </button>
          </div>

          <button
            type="button"
            class="btn-delete-candidature text-slate-400 hover:text-rose-600 hover:bg-rose-50 px-2.5 py-1.5 rounded-xl transition-all font-semibold"
            data-job-id="${escapeHtml(cand.jobId)}"
            title="Supprimer cette candidature de votre suivi"
          >
            🗑️ Retirer du suivi
          </button>
        </div>
      `;

      // Écouteur changement de statut
      const statusSelect = card.querySelector('.cand-status-select');
      if (statusSelect) {
        statusSelect.addEventListener('change', (e) => {
          const newSt = e.target.value;
          cand.status = newSt;
          cand.updatedAt = Date.now();
          if (window.storageManager) {
            candidatures = window.storageManager.saveCandidature(cand);
          }
          updateCandidaturesBadgeUI();
          applyAllFiltersAndSort();
          renderCandidaturesList();
          showToastNotification(`Statut mis à jour : "${newSt}"`);
        });
      }

      // Écouteur date de postulation
      const dateInput = card.querySelector('.cand-applied-date-input');
      if (dateInput) {
        dateInput.addEventListener('change', (e) => {
          const newDate = e.target.value;
          if (newDate) {
            cand.appliedAt = newDate;
            cand.updatedAt = Date.now();
            if (window.storageManager) {
              candidatures = window.storageManager.saveCandidature(cand);
            }
            applyAllFiltersAndSort();
            showToastNotification(`Date de candidature mise à jour au ${formatDateFr(newDate)}`);
          }
        });
      }

      // Écouteur ajout d'entretien
      const addIntBtn = card.querySelector('.btn-add-interview');
      if (addIntBtn) {
        addIntBtn.addEventListener('click', () => {
          openInterviewModal(cand.jobId);
        });
      }

      // Écouteur modification d'entretien
      card.querySelectorAll('.btn-edit-interview').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const jId = e.currentTarget.dataset.jobId;
          const iId = e.currentTarget.dataset.interviewId;
          openInterviewModal(jId, iId);
        });
      });

      // Écouteur suppression d'entretien
      card.querySelectorAll('.btn-delete-interview').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const jId = e.currentTarget.dataset.jobId;
          const iId = e.currentTarget.dataset.interviewId;
          if (confirm('Voulez-vous vraiment supprimer cet entretien ?')) {
            const targetCand = candidatures[jId];
            if (targetCand && Array.isArray(targetCand.interviews)) {
              targetCand.interviews = targetCand.interviews.filter(item => item.id !== iId);
              if (window.storageManager) {
                candidatures = window.storageManager.saveCandidature(targetCand);
              }
              renderCandidaturesList();
              updateCandidaturesBadgeUI();
              showToastNotification('Entretien supprimé.');
            }
          }
        });
      });

      // Écouteur suppression candidature
      const delCandBtn = card.querySelector('.btn-delete-candidature');
      if (delCandBtn) {
        delCandBtn.addEventListener('click', () => {
          if (confirm(`Voulez-vous retirer la candidature pour "${cand.company}" de votre suivi ?`)) {
            if (window.storageManager) {
              candidatures = window.storageManager.deleteCandidature(cand.jobId);
            } else {
              delete candidatures[cand.jobId];
            }
            updateCandidaturesBadgeUI();
            updateCandidatureFilterBadges();
            applyAllFiltersAndSort();
            renderCandidaturesList();
            showToastNotification('Candidature retirée du suivi.');
          }
        });
      }

      candidaturesCardsContainer.appendChild(card);
    });
  }

  // =================== RENDU DE LA VUE CALENDRIER INTERACTIF ===================

  function renderCalendarView() {
    if (!calendarDaysGrid || !calMonthYearLabel) return;
    calendarDaysGrid.innerHTML = '';

    const currentYear = calendarDisplayedDate.getFullYear();
    const currentMonth = calendarDisplayedDate.getMonth();

    calMonthYearLabel.textContent = calendarDisplayedDate.toLocaleDateString('fr-FR', {
      month: 'long',
      year: 'numeric'
    });

    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
    // En France, la semaine commence le Lundi (0=Dimanche -> shift)
    const startDayOffset = (firstDayIndex === 0 ? 6 : firstDayIndex - 1);
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    const todayStr = new Date().toISOString().split('T')[0];
    const cList = Object.values(candidatures);

    // Total de 35 ou 42 cases
    const totalCells = (startDayOffset + daysInMonth > 35) ? 42 : 35;

    for (let i = 0; i < totalCells; i++) {
      const cell = document.createElement('div');
      cell.className = 'p-1.5 sm:p-2 min-h-[75px] sm:min-h-[85px] bg-white flex flex-col justify-between transition-colors hover:bg-slate-50 cursor-pointer group relative';

      let cellDateStr = '';
      let isCurrentMonth = true;
      let dayNumber = 0;

      if (i < startDayOffset) {
        isCurrentMonth = false;
        dayNumber = daysInPrevMonth - startDayOffset + i + 1;
        const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        cellDateStr = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`;
        cell.classList.add('bg-slate-50/50', 'text-slate-400');
      } else if (i >= startDayOffset + daysInMonth) {
        isCurrentMonth = false;
        dayNumber = i - (startDayOffset + daysInMonth) + 1;
        const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
        const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
        cellDateStr = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`;
        cell.classList.add('bg-slate-50/50', 'text-slate-400');
      } else {
        dayNumber = i - startDayOffset + 1;
        cellDateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`;
        cell.classList.add('text-slate-800');
      }

      cell.dataset.date = cellDateStr;

      const isToday = cellDateStr === todayStr;
      if (isToday) {
        cell.classList.add('bg-indigo-50/40', 'font-extrabold');
      }

      if (selectedCalendarDay === cellDateStr) {
        cell.classList.add('ring-2', 'ring-indigo-600', 'bg-indigo-50/60');
      }

      // En-tête du jour
      const dayHeader = document.createElement('div');
      dayHeader.className = 'flex items-center justify-between text-xs font-bold leading-none';
      dayHeader.innerHTML = `
        <span class="${isToday ? 'w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[11px]' : ''}">${dayNumber}</span>
      `;
      cell.appendChild(dayHeader);

      // Événements pour cette date
      const eventsContainer = document.createElement('div');
      eventsContainer.className = 'space-y-1 mt-1 overflow-hidden';

      // 1. Candidatures postulées ce jour-là
      const appliedToday = cList.filter(c => c.appliedAt === cellDateStr);
      appliedToday.forEach(c => {
        const tag = document.createElement('div');
        tag.className = 'px-1.5 py-0.5 rounded text-[10px] font-bold bg-sky-50 text-sky-800 border border-sky-200 truncate';
        tag.textContent = `📨 ${c.company || 'Postulé'}`;
        tag.title = `Candidature envoyée chez ${c.company} : ${c.jobTitle}`;
        eventsContainer.appendChild(tag);
      });

      // 2. Entretiens programmés ce jour-là
      const interviewsToday = [];
      cList.forEach(c => {
        if (Array.isArray(c.interviews)) {
          c.interviews.forEach(item => {
            if (item && item.date === cellDateStr) {
              interviewsToday.push({ cand: c, interview: item });
            }
          });
        }
      });

      interviewsToday.forEach(({ cand, interview }) => {
        const tag = document.createElement('div');
        tag.className = 'px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-950 border border-emerald-300 truncate';
        tag.textContent = `🎙️ ${interview.time || ''} ${cand.company}`;
        tag.title = `Entretien : ${interview.title || 'Entretien'} chez ${cand.company}`;
        eventsContainer.appendChild(tag);
      });

      cell.appendChild(eventsContainer);

      // Clic sur la case -> Ouvre l'inspecteur d'événements
      cell.addEventListener('click', () => {
        selectedCalendarDay = cellDateStr;
        renderCalendarView();
        inspectCalendarDay(cellDateStr, appliedToday, interviewsToday);
      });

      calendarDaysGrid.appendChild(cell);
    }
  }

  function inspectCalendarDay(dateStr, appliedList, interviewsList) {
    if (!calendarDayInspector || !calendarInspectorDateTitle || !calendarInspectorEventsList) return;

    calendarDayInspector.classList.remove('hidden');
    calendarInspectorDateTitle.innerHTML = `<span>📅</span><span>Événements du ${escapeHtml(formatDateFr(dateStr))}</span>`;
    calendarInspectorEventsList.innerHTML = '';

    const totalEvents = appliedList.length + interviewsList.length;
    if (totalEvents === 0) {
      calendarInspectorEventsList.innerHTML = `
        <div class="text-slate-500 py-2">
          Aucun événement (postulation ou entretien) enregistré pour cette date.
        </div>
      `;
      return;
    }

    appliedList.forEach(cand => {
      const item = document.createElement('div');
      item.className = 'p-2.5 rounded-xl bg-white border border-sky-200 flex items-center justify-between gap-2';
      item.innerHTML = `
        <div>
          <div class="font-bold text-sky-950">📨 Candidature envoyée : ${escapeHtml(cand.company)}</div>
          <div class="text-[11px] text-slate-600">${escapeHtml(cand.jobTitle)}</div>
        </div>
        <button
          type="button"
          class="px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-800 font-bold text-xs"
        >
          Voir
        </button>
      `;
      item.querySelector('button').addEventListener('click', () => {
        candTabListBtn.click();
        openCandidaturesModal(cand.jobId);
      });
      calendarInspectorEventsList.appendChild(item);
    });

    interviewsList.forEach(({ cand, interview }) => {
      const item = document.createElement('div');
      item.className = 'p-2.5 rounded-xl bg-white border border-emerald-200 space-y-1';
      item.innerHTML = `
        <div class="flex items-center justify-between gap-2 font-bold text-emerald-950">
          <span>🎙️ ${escapeHtml(interview.title || 'Entretien')} — ${escapeHtml(cand.company)}</span>
          <span class="text-xs bg-emerald-50 px-2 py-0.5 rounded text-emerald-800 border border-emerald-200">
            ${escapeHtml(interview.time || '10:00')} (${interview.durationMinutes || 60} min)
          </span>
        </div>
        <div class="text-slate-600 text-xs">${escapeHtml(cand.jobTitle)} (${escapeHtml(interview.type || 'Visio')})</div>
        ${interview.locationOrLink ? `<div class="text-indigo-700 text-xs font-semibold truncate">📍 ${escapeHtml(interview.locationOrLink)}</div>` : ''}
        ${interview.notes ? `<div class="text-slate-600 text-xs italic">"${escapeHtml(interview.notes)}"</div>` : ''}
      `;
      calendarInspectorEventsList.appendChild(item);
    });
  }

  if (closeCalendarInspectorBtn) {
    closeCalendarInspectorBtn.addEventListener('click', () => {
      calendarDayInspector.classList.add('hidden');
    });
  }

  if (calPrevMonthBtn) {
    calPrevMonthBtn.addEventListener('click', () => {
      calendarDisplayedDate.setMonth(calendarDisplayedDate.getMonth() - 1);
      renderCalendarView();
    });
  }

  if (calNextMonthBtn) {
    calNextMonthBtn.addEventListener('click', () => {
      calendarDisplayedDate.setMonth(calendarDisplayedDate.getMonth() + 1);
      renderCalendarView();
    });
  }

  if (calTodayBtn) {
    calTodayBtn.addEventListener('click', () => {
      calendarDisplayedDate = new Date();
      selectedCalendarDay = new Date().toISOString().split('T')[0];
      renderCalendarView();
    });
  }

  // =================== MODALE D'AJOUT / ÉDITION D'ENTRETIEN ===================

  function openInterviewModal(candJobId, interviewId = null) {
    if (!interviewModal || !interviewForm) return;
    const cand = candidatures[candJobId];
    if (!cand) return;

    interviewCandJobId.value = candJobId;
    interviewEditId.value = interviewId || '';

    if (interviewModalJobSubtitle) {
      interviewModalJobSubtitle.textContent = `${cand.company} — ${cand.jobTitle}`;
    }

    if (interviewId && Array.isArray(cand.interviews)) {
      const existing = cand.interviews.find(i => i.id === interviewId);
      if (existing) {
        if (interviewModalTitle) interviewModalTitle.textContent = 'Modifier l\'entretien';
        interviewTitleInput.value = existing.title || '';
        interviewDateInput.value = existing.date || '';
        interviewTimeInput.value = existing.time || '10:00';
        interviewTypeInput.value = existing.type || 'visio';
        interviewDurationInput.value = existing.durationMinutes || 60;
        interviewLocationInput.value = existing.locationOrLink || '';
        interviewInterviewerInput.value = existing.interviewer || '';
        interviewNotesInput.value = existing.notes || '';
      }
    } else {
      if (interviewModalTitle) interviewModalTitle.textContent = 'Planifier un entretien';
      const existingCount = (cand.interviews && cand.interviews.length) || 0;
      interviewTitleInput.value = `Entretien ${existingCount + 1}`;
      // Date par défaut : aujourd'hui + 2 jours
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 2);
      interviewDateInput.value = defaultDate.toISOString().split('T')[0];
      interviewTimeInput.value = '10:00';
      interviewTypeInput.value = 'visio';
      interviewDurationInput.value = '60';
      interviewLocationInput.value = '';
      interviewInterviewerInput.value = '';
      interviewNotesInput.value = '';
    }

    interviewModal.classList.remove('hidden');
    interviewTitleInput.focus();
  }

  if (closeInterviewModalBtn) {
    closeInterviewModalBtn.addEventListener('click', () => interviewModal.classList.add('hidden'));
  }
  if (cancelInterviewModalBtn) {
    cancelInterviewModalBtn.addEventListener('click', () => interviewModal.classList.add('hidden'));
  }

  if (interviewForm) {
    interviewForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const candJobId = interviewCandJobId.value;
      const editId = interviewEditId.value;
      const cand = candidatures[candJobId];
      if (!cand) return;

      if (!Array.isArray(cand.interviews)) {
        cand.interviews = [];
      }

      const interviewData = {
        id: editId || `int_${candJobId}_${Date.now()}`,
        title: interviewTitleInput.value.trim() || 'Entretien',
        date: interviewDateInput.value,
        time: interviewTimeInput.value || '10:00',
        durationMinutes: parseInt(interviewDurationInput.value, 10) || 60,
        type: interviewTypeInput.value || 'visio',
        locationOrLink: interviewLocationInput.value.trim(),
        interviewer: interviewInterviewerInput.value.trim(),
        notes: interviewNotesInput.value.trim()
      };

      if (editId) {
        const idx = cand.interviews.findIndex(i => i.id === editId);
        if (idx !== -1) cand.interviews[idx] = interviewData;
      } else {
        cand.interviews.push(interviewData);
      }

      // Si le statut était "En attente de réponse", on le bascule automatiquement en "Entretien x"
      if (cand.status === 'En attente de réponse') {
        cand.status = 'Entretien x';
      }

      cand.updatedAt = Date.now();

      if (window.storageManager) {
        candidatures = window.storageManager.saveCandidature(cand);
      }

      interviewModal.classList.add('hidden');
      updateCandidaturesBadgeUI();
      applyAllFiltersAndSort();
      renderCandidaturesList();
      if (currentCandViewTab === 'calendar') renderCalendarView();

      showToastNotification(`Entretien enregistré pour ${cand.company} le ${formatDateFr(interviewData.date)} à ${interviewData.time} !`);
    });
  }

  // =================== MODALE CANDIDATURE MANUELLE ===================

  if (addManualCandBtn) {
    addManualCandBtn.addEventListener('click', () => {
      if (!manualCandModal || !manualCandForm) return;
      manualCandForm.reset();
      manualAppliedDateInput.value = new Date().toISOString().split('T')[0];
      manualCandModal.classList.remove('hidden');
      manualJobTitleInput.focus();
    });
  }

  if (closeManualCandModalBtn) {
    closeManualCandModalBtn.addEventListener('click', () => manualCandModal.classList.add('hidden'));
  }
  if (cancelManualCandBtn) {
    cancelManualCandBtn.addEventListener('click', () => manualCandModal.classList.add('hidden'));
  }

  if (manualCandForm) {
    manualCandForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const newId = `cand_manual_${Date.now()}`;
      const newCand = {
        id: newId,
        jobId: newId,
        jobTitle: manualJobTitleInput.value.trim() || 'Poste',
        company: manualCompanyInput.value.trim() || 'Entreprise',
        location: manualLocationInput.value.trim() || '',
        url: manualUrlInput.value.trim() || '',
        source: 'Spontanée / Externe',
        appliedAt: manualAppliedDateInput.value || new Date().toISOString().split('T')[0],
        status: manualStatusSelect.value || 'En attente de réponse',
        statusStep: '',
        notes: '',
        interviews: [],
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      if (window.storageManager) {
        candidatures = window.storageManager.saveCandidature(newCand);
      } else {
        candidatures[newId] = newCand;
      }

      manualCandModal.classList.add('hidden');
      updateCandidaturesBadgeUI();
      updateCandidatureFilterBadges();
      renderCandidaturesList();
      showToastNotification(`Candidature chez "${newCand.company}" ajoutée avec succès !`);
    });
  }

  // =================== EXPORT ARCHIVE ZIP (DONNÉES + CALENDRIER) ===================

  if (exportArchiveZipBtn) {
    exportArchiveZipBtn.addEventListener('click', async () => {
      if (!window.archiveService) {
        alert('Le service d\'archivage n\'est pas encore chargé.');
        return;
      }

      const total = Object.keys(candidatures).length;
      if (total === 0) {
        alert('Vous n\'avez aucune candidature enregistrée à exporter.');
        return;
      }

      exportArchiveZipBtn.disabled = true;
      const oldHtml = exportArchiveZipBtn.innerHTML;
      exportArchiveZipBtn.innerHTML = '<span>⏳ Création de l\'archive ZIP...</span>';

      try {
        const res = await window.archiveService.exportZipArchive(candidatures);
        showToastNotification('📦 Archive ZIP téléchargée ! (Contient vos entretiens .ics et vos données .json)');
      } catch (err) {
        console.error('Erreur export archive:', err);
        alert(`Erreur lors de l'exportation : ${err.message}`);
      } finally {
        exportArchiveZipBtn.disabled = false;
        exportArchiveZipBtn.innerHTML = oldHtml;
      }
    });
  }

  // =================== IMPORT ARCHIVE ZIP OU JSON ===================

  if (importArchiveBtn && importArchiveFileInput) {
    importArchiveBtn.addEventListener('click', () => {
      importArchiveFileInput.click();
    });

    importArchiveFileInput.addEventListener('change', async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!window.archiveService) {
        alert('Le service d\'archivage n\'est pas disponible.');
        return;
      }

      importArchiveBtn.disabled = true;
      const oldText = importArchiveBtn.innerHTML;
      importArchiveBtn.innerHTML = '<span>⏳ Lecture...</span>';

      try {
        const result = await window.archiveService.parseImportFile(file);

        if (result.success && result.candidatures) {
          if (window.storageManager) {
            candidatures = window.storageManager.saveAllCandidatures(result.candidatures, true);
          } else {
            candidatures = { ...candidatures, ...result.candidatures };
          }

          updateCandidaturesBadgeUI();
          updateCandidatureFilterBadges();
          applyAllFiltersAndSort();
          renderCandidaturesList();
          if (currentCandViewTab === 'calendar') renderCalendarView();

          showToastNotification(`📥 ${result.candidaturesCount} candidatures et ${result.interviewsCount} entretiens importés avec succès !`);
        }
      } catch (err) {
        console.error('Erreur import archive:', err);
        alert(`Échec de l'importation : ${err.message}`);
      } finally {
        importArchiveFileInput.value = '';
        importArchiveBtn.disabled = false;
        importArchiveBtn.innerHTML = oldText;
      }
    });
  }

  // =================== GESTION PROGRESSIVE WEB APP (PWA) & MODE HORS-LIGNE ===================
  const pwaInstallBtn = document.getElementById('pwaInstallBtn');
  const pwaStatusBanner = document.getElementById('pwaStatusBanner');
  const pwaStatusDot = document.getElementById('pwaStatusDot');
  const pwaStatusText = document.getElementById('pwaStatusText');
  const pwaOutboxBadge = document.getElementById('pwaOutboxBadge');
  const pwaSyncBtn = document.getElementById('pwaSyncBtn');

  let deferredInstallPrompt = null;

  // 1. Enregistrement du Service Worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('[PWA] Service Worker actif (scope):', registration.scope);

          registration.addEventListener('updatefound', () => {
            const installingWorker = registration.installing;
            if (installingWorker) {
              installingWorker.addEventListener('statechange', () => {
                if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  showToastNotification('🚀 Une nouvelle version de FindTheJob est prête. Rechargez pour mettre à jour.');
                }
              });
            }
          });
        })
        .catch((err) => {
          console.warn('[PWA] Échec enregistrement Service Worker:', err);
        });

      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'FTJ_SYNC_OUTBOX') {
          console.log('[PWA] Message Background Sync reçu');
          triggerOutboxSync();
        }
      });
    });
  }

  // 2. Gestion de l'installation PWA (Prompt beforeinstallprompt)
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    if (pwaInstallBtn) {
      pwaInstallBtn.classList.remove('hidden');
    }
  });

  if (pwaInstallBtn) {
    pwaInstallBtn.addEventListener('click', async () => {
      if (!deferredInstallPrompt) return;
      pwaInstallBtn.disabled = true;
      deferredInstallPrompt.prompt();
      const choiceResult = await deferredInstallPrompt.userChoice;
      console.log(`[PWA] Résultat invitation: ${choiceResult.outcome}`);
      deferredInstallPrompt = null;
      pwaInstallBtn.classList.add('hidden');
      pwaInstallBtn.disabled = false;
    });
  }

  window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    if (pwaInstallBtn) pwaInstallBtn.classList.add('hidden');
    showToastNotification('🎉 FindTheJob est désormais installé sur votre appareil !');
  });

  // 3. Gestion de l'état réseau (Online / Offline)
  function updateNetworkStatusUI() {
    const isOnline = navigator.onLine;
    if (!pwaStatusBanner) return;

    if (!isOnline) {
      pwaStatusBanner.classList.remove('hidden', 'bg-slate-50', 'border-slate-200');
      pwaStatusBanner.classList.add('bg-amber-50', 'border-amber-300');
      if (pwaStatusDot) {
        pwaStatusDot.className = 'w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse';
      }
      if (pwaStatusText) {
        pwaStatusText.className = 'font-bold text-amber-900';
        pwaStatusText.textContent = 'Mode Hors-ligne — Données locales accessibles';
      }
    } else {
      pwaStatusBanner.classList.remove('bg-amber-50', 'border-amber-300');
      pwaStatusBanner.classList.add('bg-slate-50', 'border-slate-200');
      if (pwaStatusDot) {
        pwaStatusDot.className = 'w-2.5 h-2.5 rounded-full bg-emerald-500';
      }
      if (pwaStatusText) {
        pwaStatusText.className = 'font-bold text-slate-800';
        pwaStatusText.textContent = 'En ligne — Synchronisé';
      }
    }

    refreshOutboxBadge();
  }

  // 4. Badge d'actions en attente
  async function refreshOutboxBadge() {
    if (!window.storageManager || !window.storageManager.getOutboxItems) return;
    try {
      const items = await window.storageManager.getOutboxItems();
      const count = items ? items.length : 0;

      if (!pwaOutboxBadge || !pwaSyncBtn || !pwaStatusBanner) return;

      if (count > 0) {
        pwaStatusBanner.classList.remove('hidden');
        pwaOutboxBadge.classList.remove('hidden');
        pwaOutboxBadge.textContent = `${count} action${count > 1 ? 's' : ''} en attente`;
        if (navigator.onLine) {
          pwaSyncBtn.classList.remove('hidden');
          pwaSyncBtn.classList.add('inline-flex');
        } else {
          pwaSyncBtn.classList.add('hidden');
          pwaSyncBtn.classList.remove('inline-flex');
        }
      } else {
        pwaOutboxBadge.classList.add('hidden');
        pwaSyncBtn.classList.add('hidden');
        pwaSyncBtn.classList.remove('inline-flex');
        if (navigator.onLine) {
          pwaStatusBanner.classList.add('hidden');
        }
      }
    } catch (e) {
      console.warn('[PWA] Erreur refreshOutboxBadge:', e);
    }
  }

  // 5. Exécution de la synchronisation de l'Outbox
  async function triggerOutboxSync() {
    if (!navigator.onLine || !window.storageManager || !window.storageManager.processOutboxQueue) return;

    if (pwaSyncBtn) {
      pwaSyncBtn.disabled = true;
      pwaSyncBtn.innerHTML = '<span>⏳ Envoi...</span>';
    }

    try {
      const res = await window.storageManager.processOutboxQueue();
      if (res && res.synced > 0) {
        showToastNotification(`🔄 ${res.synced} action${res.synced > 1 ? 's' : ''} synchronisée${res.synced > 1 ? 's' : ''} avec succès !`);
      }
    } catch (err) {
      console.warn('[PWA] Erreur synchronisation:', err);
    } finally {
      if (pwaSyncBtn) {
        pwaSyncBtn.disabled = false;
        pwaSyncBtn.innerHTML = '<span>🔄 Synchroniser</span>';
      }
      refreshOutboxBadge();
    }
  }

  window.addEventListener('online', () => {
    updateNetworkStatusUI();
    showToastNotification('🌐 Connexion rétablie !');
    triggerOutboxSync();
  });

  window.addEventListener('offline', () => {
    updateNetworkStatusUI();
    showToastNotification('⚠️ Mode hors-ligne actif. Vos actions locales sont conservées.');
  });

  window.addEventListener('ftj:outbox-updated', () => {
    refreshOutboxBadge();
  });

  window.addEventListener('ftj:outbox-synced', () => {
    refreshOutboxBadge();
  });

  if (pwaSyncBtn) {
    pwaSyncBtn.addEventListener('click', () => {
      triggerOutboxSync();
    });
  }

  updateNetworkStatusUI();
  refreshOutboxBadge();

  function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
});
