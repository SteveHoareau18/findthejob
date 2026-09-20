/**
 * FindTheJob - Gestionnaire de persistance locale hybride
 * - Cookies : Horodatages de validité, statut du cache et préférences session
 * - localStorage : Saisie formulaire, filtres, métadonnées et critères CV
 * - IndexedDB : Stockage haute capacité pour l'intégralité des offres, analyses Groq et CV
 */

(function () {
  const DB_NAME = 'FindTheJobDB';
  const DB_VERSION = 1;
  const STORES = ['jobs', 'searchData', 'cvData'];

  // =================== COOKIES HELPERS ===================
  function setCookie(name, value, days = 7) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = '; expires=' + date.toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value || '')}${expires}; path=/; SameSite=Lax`;
  }

  function getCookie(name) {
    const nameEQ = name + '=';
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
    }
    return null;
  }

  function deleteCookie(name) {
    document.cookie = `${name}=; Max-Age=-99999999; path=/; SameSite=Lax`;
  }

  // =================== INDEXEDDB HELPERS ===================
  function openDb() {
    return new Promise((resolve, reject) => {
      if (!window.indexedDB) {
        return reject(new Error('IndexedDB non supporté'));
      }
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        STORES.forEach((store) => {
          if (!db.objectStoreNames.contains(store)) {
            db.createObjectStore(store, { keyPath: 'id' });
          }
        });
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  function saveToStore(db, storeName, item) {
    return new Promise((resolve, reject) => {
      try {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        const req = store.put(item);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      } catch (err) {
        reject(err);
      }
    });
  }

  function getFromStore(db, storeName, key) {
    return new Promise((resolve, reject) => {
      try {
        const tx = db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const req = store.get(key);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      } catch (err) {
        reject(err);
      }
    });
  }

  function clearStore(db, storeName) {
    return new Promise((resolve, reject) => {
      try {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        const req = store.clear();
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      } catch (err) {
        reject(err);
      }
    });
  }

  // =================== DÉLAIS ET FORMULATION ===================
  function formatRemainingTime(expiresAt) {
    if (!expiresAt) return 'Aucun';
    const diffMs = Number(expiresAt) - Date.now();
    if (diffMs <= 0) return 'Expiré';

    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays >= 1) {
      const remainingHours = diffHours % 24;
      return remainingHours > 0 ? `${diffDays}j ${remainingHours}h` : `${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    }
    if (diffHours >= 1) {
      const diffMin = Math.floor((diffMs / (1000 * 60)) % 60);
      return `${diffHours}h ${diffMin}m`;
    }
    const diffMin = Math.max(1, Math.floor(diffMs / (1000 * 60)));
    return `${diffMin} minute${diffMin > 1 ? 's' : ''}`;
  }

  function formatExpiryDate(expiresAt) {
    if (!expiresAt) return '';
    const d = new Date(Number(expiresAt));
    return d.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // =================== API STORAGE MANAGER ===================
  const storageManager = {
    setCookie,
    getCookie,
    deleteCookie,

    /**
     * Sauvegarde complète hybride (Cookies, localStorage, IndexedDB)
     */
    async saveState({
      query = '',
      exclusions = '',
      geoRegion = 'all',
      cvCriteria = null,
      cvFileName = '',
      cvRawText = '',
      cvFeedback = null,
      jobs = null,
      jobInteractions = null,
      parsedCriteria = null,
      stats = null,
      availableSources = null,
      ttlDays = 7
    }) {
      const now = Date.now();
      const expiresAt = now + ttlDays * 24 * 60 * 60 * 1000;

      // 1. Sauvegarde dans les Cookies
      setCookie('ftj_cache_active', '1', ttlDays);
      setCookie('ftj_cache_expires', expiresAt.toString(), ttlDays);
      setCookie('ftj_geo_region', geoRegion, ttlDays);
      if (cvFileName) setCookie('ftj_has_cv', '1', ttlDays);

      // 2. Sauvegarde dans localStorage
      localStorage.setItem('ftj_query', query || '');
      localStorage.setItem('ftj_exclusions', exclusions || '');
      localStorage.setItem('ftj_geo_region', geoRegion || 'all');
      localStorage.setItem('ftj_cv_filename', cvFileName || '');
      if (cvCriteria) {
        localStorage.setItem('ftj_cv_criteria', JSON.stringify(cvCriteria));
      } else {
        localStorage.removeItem('ftj_cv_criteria');
      }
      if (jobInteractions) {
        localStorage.setItem('ftj_job_interactions', JSON.stringify(jobInteractions));
      }

      const meta = {
        savedAt: now,
        expiresAt,
        ttlDays,
        jobsCount: jobs ? jobs.length : 0
      };
      localStorage.setItem('ftj_cache_meta', JSON.stringify(meta));

      // 3. Sauvegarde dans IndexedDB (Offres lourdes, données enrichies Groq, texte CV, feedback)
      try {
        const db = await openDb();
        if (jobs && Array.isArray(jobs)) {
          await saveToStore(db, 'jobs', {
            id: 'latest_jobs',
            jobs,
            savedAt: now,
            count: jobs.length
          });
        }
        if (parsedCriteria || stats || availableSources) {
          await saveToStore(db, 'searchData', {
            id: 'latest_search',
            parsedCriteria,
            stats,
            availableSources,
            savedAt: now
          });
        }
        if (cvCriteria || cvRawText || cvFeedback) {
          await saveToStore(db, 'cvData', {
            id: 'latest_cv',
            criteria: cvCriteria,
            fileName: cvFileName,
            rawText: cvRawText || '',
            feedback: cvFeedback || null,
            savedAt: now
          });
        }
      } catch (idbErr) {
        console.warn('[StorageManager] Erreur écriture IndexedDB (fallback local actif):', idbErr);
      }

      return {
        success: true,
        savedAt: now,
        expiresAt,
        remainingTimeStr: formatRemainingTime(expiresAt),
        expiryFormatted: formatExpiryDate(expiresAt)
      };
    },

    /**
     * Prolonge la durée de vie du cache existant de 7 jours
     */
    async extendCache(ttlDays = 7) {
      const now = Date.now();
      const expiresAt = now + ttlDays * 24 * 60 * 60 * 1000;

      // Mise à jour des Cookies
      setCookie('ftj_cache_active', '1', ttlDays);
      setCookie('ftj_cache_expires', expiresAt.toString(), ttlDays);

      // Mise à jour du localStorage
      const metaRaw = localStorage.getItem('ftj_cache_meta');
      let meta = metaRaw ? JSON.parse(metaRaw) : {};
      meta.expiresAt = expiresAt;
      meta.ttlDays = ttlDays;
      meta.extendedAt = now;
      localStorage.setItem('ftj_cache_meta', JSON.stringify(meta));

      return {
        success: true,
        expiresAt,
        remainingTimeStr: formatRemainingTime(expiresAt),
        expiryFormatted: formatExpiryDate(expiresAt)
      };
    },

    /**
     * Sauvegarde ou met à jour l'interaction sur une offre (favorite, dismissed ou suppression)
     */
    saveJobInteraction(jobId, status) {
      if (!jobId) return {};
      try {
        const raw = localStorage.getItem('ftj_job_interactions');
        const interactions = raw ? JSON.parse(raw) : {};
        if (status === 'favorite' || status === 'dismissed') {
          interactions[jobId] = status;
        } else {
          delete interactions[jobId];
        }
        localStorage.setItem('ftj_job_interactions', JSON.stringify(interactions));
        return interactions;
      } catch (e) {
        console.warn('[StorageManager] Erreur saveJobInteraction:', e);
        return {};
      }
    },

    /**
     * Récupère l'ensemble des interactions (favoris et désintéressés)
     */
    getJobInteractions() {
      try {
        const raw = localStorage.getItem('ftj_job_interactions');
        return raw ? JSON.parse(raw) : {};
      } catch (e) {
        return {};
      }
    },

    /**
     * =================== GESTION DES CANDIDATURES ET ENTRETIENS ===================
     */

    /**
     * Récupère l'ensemble des candidatures depuis le cache local (localStorage)
     * @returns {Record<string, Object>} Dictionnaire des candidatures indexées par jobId
     */
    getCandidatures() {
      try {
        const raw = localStorage.getItem('ftj_candidatures');
        return raw ? JSON.parse(raw) : {};
      } catch (e) {
        console.warn('[StorageManager] Erreur getCandidatures:', e);
        return {};
      }
    },

    /**
     * Enregistre ou met à jour une candidature
     * @param {Object} cand Objet candidature
     * @returns {Record<string, Object>} Dictionnaire mis à jour
     */
    saveCandidature(cand) {
      if (!cand || (!cand.jobId && !cand.id)) return this.getCandidatures();
      try {
        const candidatures = this.getCandidatures();
        const key = cand.jobId || cand.id;
        const existing = candidatures[key] || {};

        candidatures[key] = {
          ...existing,
          ...cand,
          id: key,
          jobId: key,
          updatedAt: Date.now()
        };

        if (!candidatures[key].createdAt) {
          candidatures[key].createdAt = Date.now();
        }

        localStorage.setItem('ftj_candidatures', JSON.stringify(candidatures));
        return candidatures;
      } catch (e) {
        console.warn('[StorageManager] Erreur saveCandidature:', e);
        return this.getCandidatures();
      }
    },

    /**
     * Supprime une candidature du suivi local
     * @param {string} jobId Identifiant de l'offre
     * @returns {Record<string, Object>} Dictionnaire mis à jour
     */
    deleteCandidature(jobId) {
      if (!jobId) return this.getCandidatures();
      try {
        const candidatures = this.getCandidatures();
        delete candidatures[jobId];
        localStorage.setItem('ftj_candidatures', JSON.stringify(candidatures));
        return candidatures;
      } catch (e) {
        console.warn('[StorageManager] Erreur deleteCandidature:', e);
        return this.getCandidatures();
      }
    },

    /**
     * Remplace ou fusionne l'ensemble des candidatures (utilisé lors de l'import)
     * @param {Record<string, Object>} candidaturesMap Dictionnaire complet
     * @param {boolean} merge Si true, fusionne avec l'existant sans écraser
     * @returns {Record<string, Object>} Dictionnaire résultant
     */
    saveAllCandidatures(candidaturesMap, merge = true) {
      try {
        let finalMap = {};
        if (merge) {
          const current = this.getCandidatures();
          finalMap = { ...current, ...candidaturesMap };
        } else {
          finalMap = { ...candidaturesMap };
        }
        localStorage.setItem('ftj_candidatures', JSON.stringify(finalMap));
        return finalMap;
      } catch (e) {
        console.warn('[StorageManager] Erreur saveAllCandidatures:', e);
        return this.getCandidatures();
      }
    },

    /**
     * Vérifie si une offre a déjà fait l'objet d'une postulation
     * @param {string} jobId Identifiant de l'offre
     * @returns {boolean}
     */
    isJobApplied(jobId) {
      if (!jobId) return false;
      const candidatures = this.getCandidatures();
      return Boolean(candidatures[jobId]);
    },

    /**
     * Charge l'état complet depuis les 3 couches
     */
    async loadState() {
      // 1. Vérification de la date d'expiration
      const cookieExp = getCookie('ftj_cache_expires');
      const metaRaw = localStorage.getItem('ftj_cache_meta');
      const meta = metaRaw ? JSON.parse(metaRaw) : null;

      const expiresAt = cookieExp ? Number(cookieExp) : (meta?.expiresAt ? Number(meta.expiresAt) : null);
      if (!expiresAt) {
        return { hasCache: false };
      }

      const isExpired = Date.now() >= expiresAt;

      // 2. Lecture localStorage
      const query = localStorage.getItem('ftj_query') || '';
      const exclusions = localStorage.getItem('ftj_exclusions') || '';
      const geoRegion = localStorage.getItem('ftj_geo_region') || getCookie('ftj_geo_region') || 'all';
      const cvFileName = localStorage.getItem('ftj_cv_filename') || '';
      const cvRaw = localStorage.getItem('ftj_cv_criteria');
      const cvCriteria = cvRaw ? JSON.parse(cvRaw) : null;
      const interactionsRaw = localStorage.getItem('ftj_job_interactions');
      const jobInteractions = interactionsRaw ? JSON.parse(interactionsRaw) : {};

      // 3. Lecture IndexedDB
      let jobs = [];
      let parsedCriteria = null;
      let stats = null;
      let availableSources = null;
      let cvRawText = '';
      let cvFeedback = null;

      try {
        const db = await openDb();
        const jobsRecord = await getFromStore(db, 'jobs', 'latest_jobs');
        if (jobsRecord?.jobs) jobs = jobsRecord.jobs;

        const searchRecord = await getFromStore(db, 'searchData', 'latest_search');
        if (searchRecord) {
          parsedCriteria = searchRecord.parsedCriteria || null;
          stats = searchRecord.stats || null;
          availableSources = searchRecord.availableSources || null;
        }

        const cvRecord = await getFromStore(db, 'cvData', 'latest_cv');
        if (cvRecord) {
          cvRawText = cvRecord.rawText || '';
          cvFeedback = cvRecord.feedback || null;
        }
      } catch (idbErr) {
        console.warn('[StorageManager] Erreur lecture IndexedDB:', idbErr);
      }

      return {
        hasCache: true,
        isExpired,
        expiresAt,
        remainingTimeStr: formatRemainingTime(expiresAt),
        expiryFormatted: formatExpiryDate(expiresAt),
        query,
        exclusions,
        geoRegion,
        cvCriteria,
        cvFileName,
        cvRawText,
        cvFeedback,
        jobs,
        jobInteractions,
        candidatures: this.getCandidatures(),
        parsedCriteria,
        stats,
        availableSources,
        meta
      };
    },

    /**
     * Purge intégrale des Cookies, localStorage et IndexedDB
     * @param {Object} [options]
     * @param {boolean} [options.purgeCandidatures=false] Détermine si les candidatures doivent également être supprimées
     */
    async clearAll(options = { purgeCandidatures: false }) {
      // Purge Cookies
      deleteCookie('ftj_cache_active');
      deleteCookie('ftj_cache_expires');
      deleteCookie('ftj_geo_region');
      deleteCookie('ftj_has_cv');

      // Purge localStorage
      localStorage.removeItem('ftj_query');
      localStorage.removeItem('ftj_exclusions');
      localStorage.removeItem('ftj_geo_region');
      localStorage.removeItem('ftj_cv_filename');
      localStorage.removeItem('ftj_cv_criteria');
      localStorage.removeItem('ftj_job_interactions');
      localStorage.removeItem('ftj_cache_meta');

      if (options && options.purgeCandidatures) {
        localStorage.removeItem('ftj_candidatures');
      }

      // Purge IndexedDB
      try {
        const db = await openDb();
        await clearStore(db, 'jobs');
        await clearStore(db, 'searchData');
        await clearStore(db, 'cvData');
      } catch (e) {
        console.warn('[StorageManager] Erreur purge IndexedDB:', e);
      }

      return { success: true };
    },

    formatRemainingTime,
    formatExpiryDate
  };

  window.storageManager = storageManager;
})();
