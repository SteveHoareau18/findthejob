/**
 * FindTheJob - Service de Sérialisation, Export/Import & Gestion d'Archives ZIP (Normes 2026)
 * - Couche Sérialisation & Formats (RFC 5545 iCalendar + JSZip)
 * - Décompression et compression 100% en mémoire côté client (zéro serveur)
 * - Validation défensive et assainissement anti-XSS
 */

(function () {
  'use strict';

  // =================== UTILITAIRES DE DATE & FORMATS ===================

  /**
   * Formate une date et heure au format standard iCalendar UTC ou Local (YYYYMMDDTHHmm00)
   */
  function formatIcsDateTime(dateStr, timeStr = '09:00', durationMinutes = 60) {
    if (!dateStr) return { start: '', end: '' };

    const cleanDate = dateStr.replace(/-/g, '');
    const cleanTime = (timeStr || '09:00').replace(':', '').padEnd(4, '0').slice(0, 4) + '00';
    const startIso = `${cleanDate}T${cleanTime}`;

    // Calcul de l'heure de fin
    try {
      const parts = dateStr.split('-');
      const timeParts = (timeStr || '09:00').split(':');
      const d = new Date(
        parseInt(parts[0], 10),
        parseInt(parts[1], 10) - 1,
        parseInt(parts[2], 10),
        parseInt(timeParts[0], 10),
        parseInt(timeParts[1], 10)
      );
      d.setMinutes(d.getMinutes() + (durationMinutes || 60));

      const endYear = d.getFullYear();
      const endMonth = String(d.getMonth() + 1).padStart(2, '0');
      const endDay = String(d.getDate()).padStart(2, '0');
      const endHours = String(d.getHours()).padStart(2, '0');
      const endMin = String(d.getMinutes()).padStart(2, '0');

      const endIso = `${endYear}${endMonth}${endDay}T${endHours}${endMin}00`;
      return { start: startIso, end: endIso };
    } catch (e) {
      return { start: startIso, end: startIso };
    }
  }

  /**
   * Échappe les caractères réservés pour les champs texte iCalendar RFC 5545
   */
  function escapeIcsText(str) {
    if (!str) return '';
    return String(str)
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\r?\n/g, '\\n');
  }

  /**
   * Assainissement anti-XSS basique pour les chaînes importées
   */
  function sanitizeString(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/[<>]/g, '')
      .trim();
  }

  /**
   * Déclenche le téléchargement d'un Blob côté navigateur
   */
  function triggerDownload(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 250);
  }

  // =================== GÉNÉRATEUR ICALENDAR (RFC 5545) ===================

  /**
   * Génère le fichier .ics pour l'ensemble des candidatures et entretiens
   */
  function generateIcs(candidatures = {}) {
    const now = new Date();
    const dtstamp = now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//FindTheJob//FR//Suivi Candidatures 2026//FR',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-WR-CALNAME:Entretiens & Candidatures FindTheJob',
      'X-WR-TIMEZONE:Europe/Paris'
    ];

    const cList = Array.isArray(candidatures) ? candidatures : Object.values(candidatures);

    cList.forEach((cand) => {
      if (!cand) return;

      // 1. Jalon de postulation si présent
      if (cand.appliedAt) {
        const cleanDate = cand.appliedAt.replace(/-/g, '');
        lines.push('BEGIN:VEVENT');
        lines.push(`UID:cand_${cand.id || cand.jobId}_applied@findthejob.local`);
        lines.push(`DTSTAMP:${dtstamp}`);
        lines.push(`DTSTART;VALUE=DATE:${cleanDate}`);
        lines.push(`SUMMARY:${escapeIcsText(`[Candidature] ${cand.company || 'Entreprise'} - ${cand.jobTitle || 'Poste'}`)}`);
        lines.push(`DESCRIPTION:${escapeIcsText(`Candidature envoyée le ${cand.appliedAt}\\nStatut actuel : ${cand.status || 'En attente'}\\nLien de l'offre : ${cand.url || 'N/A'}`)}`);
        lines.push(`LOCATION:${escapeIcsText(cand.location || '')}`);
        lines.push('STATUS:CONFIRMED');
        lines.push('TRANSP:TRANSPARENT');
        lines.push('END:VEVENT');
      }

      // 2. Événements d'entretiens programmés
      if (Array.isArray(cand.interviews)) {
        cand.interviews.forEach((interview, idx) => {
          if (!interview || !interview.date) return;

          const times = formatIcsDateTime(interview.date, interview.time || '09:00', interview.durationMinutes || 60);
          const eventId = interview.id || `int_${cand.id}_${idx}_${Date.now()}`;

          lines.push('BEGIN:VEVENT');
          lines.push(`UID:${eventId}@findthejob.local`);
          lines.push(`DTSTAMP:${dtstamp}`);
          lines.push(`DTSTART:${times.start}`);
          lines.push(`DTEND:${times.end}`);
          lines.push(`SUMMARY:${escapeIcsText(`[Entretien] ${cand.company || 'Entreprise'} : ${interview.title || 'Entretien'}`)}`);
          
          let desc = `Entreprise : ${cand.company || 'N/A'}\\n`;
          desc += `Poste : ${cand.jobTitle || 'N/A'}\\n`;
          desc += `Format : ${interview.type || 'Visio'}\\n`;
          if (interview.interviewer) desc += `Contact / Interlocuteur : ${interview.interviewer}\\n`;
          if (interview.locationOrLink) desc += `Lien / Lieu : ${interview.locationOrLink}\\n`;
          if (interview.notes) desc += `Notes préparatoires : ${interview.notes}\\n`;
          if (cand.url) desc += `Lien de l'offre : ${cand.url}\\n`;

          lines.push(`DESCRIPTION:${escapeIcsText(desc)}`);
          if (interview.locationOrLink) {
            lines.push(`LOCATION:${escapeIcsText(interview.locationOrLink)}`);
          } else if (cand.location) {
            lines.push(`LOCATION:${escapeIcsText(cand.location)}`);
          }

          lines.push('STATUS:CONFIRMED');
          lines.push('END:VEVENT');
        });
      }
    });

    lines.push('END:VCALENDAR');
    return lines.join('\r\n');
  }

  // =================== MOTEUR D'ARCHIVE ZIP (JSZip) ===================

  /**
   * Exporte un package tout-en-un ZIP contenant :
   * - entretiens.ics (Calendrier compatible Google, Apple, Outlook)
   * - candidatures_donnees.json (Jeu de données complet)
   * - README.txt (Notice explicative)
   */
  async function exportZipArchive(candidatures = {}, metadata = {}) {
    const today = new Date().toISOString().split('T')[0];
    const filename = `findthejob_candidatures_${today}.zip`;

    const cList = Array.isArray(candidatures) ? candidatures : Object.values(candidatures);
    const candidaturesMap = Array.isArray(candidatures)
      ? candidatures.reduce((acc, c) => { if (c?.id) acc[c.id] = c; return acc; }, {})
      : candidatures;

    // 1. Contenu JSON structuré
    const backupPackage = {
      version: '1.0',
      appName: 'FindTheJob',
      exportedAt: new Date().toISOString(),
      metadata: {
        totalCandidatures: cList.length,
        totalInterviews: cList.reduce((acc, c) => acc + ((c.interviews && c.interviews.length) || 0), 0),
        ...metadata
      },
      candidatures: candidaturesMap
    };
    const jsonContent = JSON.stringify(backupPackage, null, 2);

    // 2. Contenu Calendrier iCalendar RFC 5545
    const icsContent = generateIcs(candidaturesMap);

    // 3. Notice d'information
    const readmeContent = [
      '====================================================',
      '         FINDTHEJOB - EXPORT DE CANDIDATURES        ',
      '====================================================',
      `Date de l'export : ${new Date().toLocaleString('fr-FR')}`,
      `Nombre de candidatures : ${cList.length}`,
      `Nombre d'entretiens enregistrés : ${backupPackage.metadata.totalInterviews}`,
      '',
      'CONTENU DE L\'ARCHIVE :',
      '1. "entretiens.ics" : Votre calendrier prêt à être importé dans Google Agenda, Apple Calendar, Microsoft Outlook, Thunderbird, etc.',
      '2. "candidatures_donnees.json" : Sauvegarde intégrale de vos candidatures, notes et historiques, directement réimportable dans FindTheJob via le bouton "Importer".',
      '',
      'CONFIDENTIALITÉ ET RGPD :',
      'Toutes ces données proviennent de votre stockage local (navigateur). Aucun serveur n\'a conservé vos données.',
      '===================================================='
    ].join('\r\n');

    // Vérification de la présence de JSZip
    if (window.JSZip) {
      try {
        const zip = new window.JSZip();
        zip.file('entretiens.ics', icsContent);
        zip.file('candidatures_donnees.json', jsonContent);
        zip.file('README.txt', readmeContent);

        const zipBlob = await zip.generateAsync({
          type: 'blob',
          compression: 'DEFLATE',
          compressionOptions: { level: 6 }
        });

        triggerDownload(zipBlob, filename);
        return { success: true, format: 'zip', filename, candidaturesCount: cList.length };
      } catch (zipErr) {
        console.warn('[ArchiveService] Erreur création ZIP, repli sur téléchargements séparés:', zipErr);
      }
    }

    // Repli de secours si JSZip indisponible : téléchargement direct
    const icsBlob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    triggerDownload(icsBlob, `entretiens_${today}.ics`);

    const jsonBlob = new Blob([jsonContent], { type: 'application/json;charset=utf-8' });
    triggerDownload(jsonBlob, `candidatures_donnees_${today}.json`);

    return { success: true, format: 'dual', filename: `entretiens_${today}.ics`, candidaturesCount: cList.length };
  }

  /**
   * Exporte l'ensemble complet des données applicatives FindTheJob :
   * - candidatures et entretiens planifiés (candidatures_donnees.json)
   * - calendrier iCalendar RFC 5545 (entretiens.ics)
   * - état applicatif, critères de recherche, profil CV et favoris (app_state.json)
   * - notice explicative (README.txt)
   */
  async function exportFullDataArchive({ candidatures = {}, appState = null, metadata = {} } = {}) {
    const today = new Date().toISOString().split('T')[0];
    const filename = `findthejob_sauvegarde_${today}.zip`;

    const cList = Array.isArray(candidatures) ? candidatures : Object.values(candidatures);
    const candidaturesMap = Array.isArray(candidatures)
      ? candidatures.reduce((acc, c) => { if (c?.id) acc[c.id] = c; return acc; }, {})
      : candidatures;

    // 1. Contenu candidatures
    const candidaturesPackage = {
      version: '2.0',
      appName: 'FindTheJob',
      exportedAt: new Date().toISOString(),
      metadata: {
        totalCandidatures: cList.length,
        totalInterviews: cList.reduce((acc, c) => acc + ((c.interviews && c.interviews.length) || 0), 0),
        ...metadata
      },
      candidatures: candidaturesMap
    };
    const candidaturesJson = JSON.stringify(candidaturesPackage, null, 2);

    // 2. Contenu état applicatif
    const statePackage = {
      version: '2.0',
      appName: 'FindTheJob',
      exportedAt: new Date().toISOString(),
      appState: appState || {}
    };
    const stateJson = JSON.stringify(statePackage, null, 2);

    // 3. Fichier iCalendar
    const icsContent = generateIcs(candidaturesMap);

    // 4. Notice d'information
    const readmeContent = [
      '====================================================',
      '       FINDTHEJOB - SAUVEGARDE COMPLÈTE DES DONNÉES ',
      '====================================================',
      `Date de l'export : ${new Date().toLocaleString('fr-FR')}`,
      `Nombre de candidatures : ${cList.length}`,
      `Nombre d'entretiens enregistrés : ${candidaturesPackage.metadata.totalInterviews}`,
      `Profil CV sauvegardé : ${appState?.cvCriteria ? 'Oui' : 'Non'}`,
      `Recherches et filtres sauvegardés : ${appState?.query ? 'Oui ("' + appState.query + '")' : 'Non'}`,
      '',
      'CONTENU DU PACKAGE :',
      '1. "candidatures_donnees.json" : Vos candidatures, notes et historiques de postulation.',
      '2. "app_state.json" : Vos critères de CV extraits, requêtes, filtres et interactions sur les offres.',
      '3. "entretiens.ics" : Votre calendrier synchronisable avec Google Agenda, Outlook, Apple Calendar, etc.',
      '',
      'COMMENT RESTAURER VOS DONNÉES ?',
      'Sur la page d\'accueil de FindTheJob, cliquez sur le bouton "Importer" dans la barre d\'outils et sélectionnez cette archive ZIP (ou directement le fichier .json).',
      '',
      'CONFIDENTIALITÉ ET RGPD :',
      'Toutes ces données sont traitées 100% en local dans votre navigateur. Aucun serveur centralisé ne conserve vos informations personnelles.',
      '===================================================='
    ].join('\r\n');

    // Génération ZIP si JSZip présent
    if (window.JSZip) {
      try {
        const zip = new window.JSZip();
        zip.file('candidatures_donnees.json', candidaturesJson);
        zip.file('app_state.json', stateJson);
        zip.file('entretiens.ics', icsContent);
        zip.file('README.txt', readmeContent);

        const zipBlob = await zip.generateAsync({
          type: 'blob',
          compression: 'DEFLATE',
          compressionOptions: { level: 6 }
        });

        triggerDownload(zipBlob, filename);
        return { success: true, format: 'zip', filename, candidaturesCount: cList.length };
      } catch (zipErr) {
        console.warn('[ArchiveService] Erreur création archive ZIP complète, repli JSON unifié:', zipErr);
      }
    }

    // Repli de secours : JSON unifié complet + ICS
    const unifiedPackage = {
      version: '2.0',
      appName: 'FindTheJob',
      exportedAt: new Date().toISOString(),
      candidatures: candidaturesMap,
      appState: appState || {},
      metadata: {
        totalCandidatures: cList.length,
        totalInterviews: candidaturesPackage.metadata.totalInterviews,
        ...metadata
      }
    };
    const jsonBlob = new Blob([JSON.stringify(unifiedPackage, null, 2)], { type: 'application/json;charset=utf-8' });
    triggerDownload(jsonBlob, `findthejob_sauvegarde_${today}.json`);

    if (cList.length > 0) {
      const icsBlob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
      triggerDownload(icsBlob, `entretiens_${today}.ics`);
    }

    return { success: true, format: 'json', filename: `findthejob_sauvegarde_${today}.json`, candidaturesCount: cList.length };
  }

  // =================== MOTEUR D'IMPORTATION (ZIP ou JSON) ===================

  /**
   * Assainit un objet récursivement contre la pollution de prototype et les injections XSS
   */
  function sanitizeObject(obj, depth = 0) {
    if (depth > 6 || !obj || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) {
      return obj.map(item => (typeof item === 'string' ? sanitizeString(item) : sanitizeObject(item, depth + 1)));
    }
    const clean = {};
    for (const [key, value] of Object.entries(obj)) {
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') continue;
      const cleanKey = sanitizeString(key);
      if (typeof value === 'string') {
        clean[cleanKey] = sanitizeString(value);
      } else if (typeof value === 'object' && value !== null) {
        clean[cleanKey] = sanitizeObject(value, depth + 1);
      } else {
        clean[cleanKey] = value;
      }
    }
    return clean;
  }

  /**
   * Analyse et importe un fichier uploadé (supporte .zip ou .json direct, archive candidatures ou sauvegarde globale)
   */
  async function parseImportFile(file) {
    if (!file) throw new Error('Aucun fichier fourni pour l\'importation');

    const fileName = file.name.toLowerCase();
    let jsonString = '';
    let stateJsonString = '';

    if (fileName.endsWith('.zip')) {
      if (!window.JSZip) {
        throw new Error('La bibliothèque JSZip est requise pour décompresser l\'archive');
      }

      const arrayBuffer = await file.arrayBuffer();
      const zip = await window.JSZip.loadAsync(arrayBuffer);

      // 1. Recherche du fichier candidatures
      let candFile = zip.file('candidatures_donnees.json');
      if (!candFile) {
        const matchingFiles = zip.file(/candidature.*\.json$/i);
        if (matchingFiles && matchingFiles.length > 0) {
          candFile = matchingFiles[0];
        }
      }

      // 2. Recherche du fichier app_state
      let stateFile = zip.file('app_state.json');
      if (!stateFile) {
        const matchingState = zip.file(/state.*\.json$/i);
        if (matchingState && matchingState.length > 0) {
          stateFile = matchingState[0];
        }
      }

      // Si aucun fichier spécifique trouvé, recherche du premier .json
      if (!candFile && !stateFile) {
        const anyJson = zip.file(/\.json$/i);
        if (anyJson && anyJson.length > 0) {
          candFile = anyJson[0];
        }
      }

      if (!candFile && !stateFile) {
        throw new Error('Aucun fichier de données (.json) trouvé dans l\'archive .zip');
      }

      if (candFile) jsonString = await candFile.async('string');
      if (stateFile) stateJsonString = await stateFile.async('string');
    } else if (fileName.endsWith('.json')) {
      jsonString = await file.text();
    } else {
      throw new Error('Format de fichier non pris en charge. Veuillez sélectionner un fichier .zip ou .json');
    }

    // Parsing JSON & Validation défensive
    let parsedCand = null;
    let parsedState = null;

    if (jsonString) {
      try {
        parsedCand = JSON.parse(jsonString);
      } catch (parseErr) {
        throw new Error('Le fichier de données contient une syntaxe JSON invalide');
      }
    }

    if (stateJsonString) {
      try {
        parsedState = JSON.parse(stateJsonString);
      } catch (parseErr) {
        console.warn('[ArchiveService] Erreur parsing app_state.json dans le ZIP:', parseErr);
      }
    }

    // Détection d'un fichier unifié où appState et candidatures sont dans le même JSON
    if (parsedCand && !parsedState && parsedCand.appState) {
      parsedState = parsedCand.appState;
    }

    // Récupération des candidatures
    let rawCandidatures = null;
    if (parsedCand) {
      if (parsedCand.candidatures && typeof parsedCand.candidatures === 'object') {
        rawCandidatures = parsedCand.candidatures;
      } else if (Array.isArray(parsedCand)) {
        rawCandidatures = parsedCand;
      } else if (!parsedCand.appState && typeof parsedCand === 'object' && Object.keys(parsedCand).length > 0) {
        // Map directe { [id]: Candidature }
        rawCandidatures = parsedCand;
      }
    }

    // Normalisation et assainissement anti-XSS des candidatures
    const normalizedMap = {};
    let interviewCounter = 0;

    if (rawCandidatures) {
      const list = Array.isArray(rawCandidatures) ? rawCandidatures : Object.values(rawCandidatures);

      list.forEach((cand, idx) => {
        if (!cand || typeof cand !== 'object') return;

        const id = String(cand.id || cand.jobId || `cand_import_${idx}_${Date.now()}`);
        const cleanCand = {
          id,
          jobId: String(cand.jobId || id),
          jobTitle: sanitizeString(cand.jobTitle || 'Poste non spécifié'),
          company: sanitizeString(cand.company || 'Entreprise non spécifiée'),
          location: sanitizeString(cand.location || ''),
          url: sanitizeString(cand.url || ''),
          source: sanitizeString(cand.source || 'Import'),
          appliedAt: sanitizeString(cand.appliedAt || new Date().toISOString().split('T')[0]),
          status: sanitizeString(cand.status || 'En attente de réponse'),
          statusStep: sanitizeString(cand.statusStep || ''),
          notes: sanitizeString(cand.notes || ''),
          interviews: [],
          createdAt: Number(cand.createdAt) || Date.now(),
          updatedAt: Number(cand.updatedAt) || Date.now()
        };

        if (Array.isArray(cand.interviews)) {
          cand.interviews.forEach((item, iIdx) => {
            if (!item) return;
            interviewCounter++;
            cleanCand.interviews.push({
              id: String(item.id || `int_${id}_${iIdx}`),
              title: sanitizeString(item.title || `Entretien ${iIdx + 1}`),
              date: sanitizeString(item.date || ''),
              time: sanitizeString(item.time || '09:00'),
              durationMinutes: Number(item.durationMinutes) || 60,
              type: sanitizeString(item.type || 'visio'),
              locationOrLink: sanitizeString(item.locationOrLink || ''),
              interviewer: sanitizeString(item.interviewer || ''),
              notes: sanitizeString(item.notes || '')
            });
          });
        }

        normalizedMap[cleanCand.jobId] = cleanCand;
      });
    }

    // Normalisation de l'état applicatif
    let cleanAppState = null;
    if (parsedState) {
      const rawState = parsedState.appState || parsedState;
      if (typeof rawState === 'object') {
        cleanAppState = {
          query: sanitizeString(rawState.query || ''),
          exclusions: sanitizeString(rawState.exclusions || ''),
          geoRegion: sanitizeString(rawState.geoRegion || 'all'),
          cvFileName: sanitizeString(rawState.cvFileName || ''),
          cvRawText: sanitizeString(rawState.cvRawText || ''),
          cvCriteria: rawState.cvCriteria ? sanitizeObject(rawState.cvCriteria) : null,
          cvFeedback: rawState.cvFeedback ? sanitizeObject(rawState.cvFeedback) : null,
          jobInteractions: rawState.jobInteractions ? sanitizeObject(rawState.jobInteractions) : {},
          jobs: Array.isArray(rawState.jobs) ? rawState.jobs.map(j => sanitizeObject(j)) : null,
          parsedCriteria: rawState.parsedCriteria ? sanitizeObject(rawState.parsedCriteria) : null,
          stats: rawState.stats ? sanitizeObject(rawState.stats) : null,
          availableSources: rawState.availableSources ? sanitizeObject(rawState.availableSources) : null
        };
      }
    }

    const totalCand = Object.keys(normalizedMap).length;
    if (totalCand === 0 && !cleanAppState) {
      throw new Error('Aucune donnée valide (candidature ou profil) détectée dans le fichier importé');
    }

    return {
      success: true,
      candidatures: normalizedMap,
      candidaturesCount: totalCand,
      interviewsCount: interviewCounter,
      appState: cleanAppState
    };
  }

  // =================== EXPOSITION DU SERVICE ===================

  window.archiveService = {
    generateIcs,
    exportZipArchive,
    exportFullDataArchive,
    parseImportFile,
    formatIcsDateTime,
    sanitizeString,
    sanitizeObject
  };
})();
