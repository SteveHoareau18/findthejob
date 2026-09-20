# Journal des modifications (Changelog)

Toutes les modifications notables apportées au projet **FindTheJob** sont consignées dans ce document.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/) et ce projet adhère aux principes de [Semantic Versioning](https://semver.org/lang/fr/).

---

## [Non publié] - Unreleased

### Prévu
- Connecteur direct OAuth 2.0 pour l'API partenaire officielle France Travail (`francetravail.io`).
- Système de notifications push locales pour les rappels d'entretiens.
- Filtres avancés supplémentaires par fourchette salariale et stack technique spécifique.

---

## [1.0.0] - 2026-09-20

Version initiale de **FindTheJob** : métamoteur de recherche d'emploi multi-sources, filtrage sémantique strict des exclusions par IA (Groq), analyse de CV locale, espace candidat complet et assistant de candidature.

### Ajouté
- **Scraping multi-sources concurrent** :
  - Interrogation simultanée via `Promise.allSettled` de 7 plateformes : France Travail, LinkedIn Jobs, HelloWork, Météojob, Indeed, Jooble et Remotive.
  - Normalisation unifiée des formats d'offres et déduplication intelligente basée sur les signatures titre/entreprise.
  - Prise en charge des zones géographiques : France Métropolitaine, DROM (974, 971, 972, 973, 976) et Europe / Remote.
- **Moteur sémantique & exclusion IA (Groq)** :
  - Filtrage sémantique strict par IA (Groq Llama 3.3 70B / compound-mini) pour éliminer les formes fléchies et variantes des critères rédhibitoires.
  - Mode de repli heuristique déterministe autonome si aucune clé d'API Groq n'est configurée.
- **Analyse de CV & Matching Local-First** :
  - Extraction de texte 100% côté client pour fichiers PDF (PDF.js), Word DOCX (Mammoth.js) et texte brut (TXT).
  - Dictionnaire local de plus de 60 technologies et détection d'affinités.
  - Diagnostic RH automatisé avec Groq : points positifs, axes d'optimisation et calcul de score d'adéquation offre/profil.
- **Gestionnaire de candidatures & calendrier** :
  - Suivi des statuts de démarche : *En cours*, *Relancé*, *Entretien*, *Offre*, *Refusé*.
  - Vue Calendrier interactive mensuelle pour planifier et visualiser les entretiens.
  - Export standard iCalendar (`.ics`, RFC 5545) compatible Google Calendar, Microsoft Outlook et Apple Calendar.
  - Sauvegarde et restauration complète par archives ZIP en mémoire (JSZip) sans transit serveur (Zero-DB).
- **Assistant IA & Générateur de lettres de motivation** :
  - Chatbot interactif intégré avec contexte dynamique lié à l'offre consultée.
  - Génération d'argumentaires et de lettres de motivation sur-mesure.
  - Communication temps réel par WebSockets (`ws`) avec streaming de réponse token par token.
- **Progressive Web App (PWA) & Mode Hors-ligne** :
  - Service Worker (`sw.js`) pour la mise en cache des ressources statiques et des requêtes.
  - Manifeste d'application (`manifest.webmanifest`) et icônes vectorielles/PNG adaptatives (`pwaIconService.js`).
  - Page de secours hors-ligne (`offline.html`) et stockage résilient dans IndexedDB.
- **Intégration & Déploiement continus (CI/CD)** :
  - Workflow GitHub Actions (`.github/workflows/ci-cd.yml`) pour les audits de dépendances, tests de build, scans de sécurité de conteneurs (Trivy) et publication automatique sur GitHub Container Registry (GHCR).
  - Conteneurisation Docker multi-stage optimisée sous Node.js 24 Alpine et configurations Docker Compose (`compose.yml`, `dev.compose.yml`).
  - Compatibilité Vercel Serverless Functions (`vercel.json`, `api/index.js`).
- **Télémétrie & Analytics** :
  - Intégration de Vercel Web Analytics via CDN script dans les pages principale et hors-ligne.

### Modifié
- Modularisation des modules de scraping (`src/scrapers/linkedin`, `src/scrapers/francetravail`, `src/scrapers/indeed`) avec découpage clair client HTTP, parseur HTML/JSON et service d'agrégation.
- Amélioration du parcours utilisateur de postulation : affichage d'une fenêtre modale interactive d'action et de suivi directement depuis les fiches d'offres et la modale « Résumé & Tips ».
- Standardisation de l'environnement d'exécution avec Node.js `>=24.15.0` et npm `11.19.0` via `.node-version` et configuration `packageManager`.

### Corrigé
- **Prise en charge WSS (WebSockets sécurisés)** : détection automatique du protocole `wss://` sous HTTPS et reverse proxy cloud avec politique de reconnexion automatique.
- **Gestion des quotas Groq** : gestionnaire de limitation de tokens et de rate limit (`src/utils/groqErrorHandler.js`) avec délai d'attente exponentiel et retour utilisateur informatif.
- **Scrapers tiers** :
  - Correction de l'extraction des sélecteurs pour les offres France Travail et prise en compte des codes départements.
  - Correction de la pagination et de la gestion anti-bot sur LinkedIn et Indeed.
- **Flux de redirection** : remplacement des redirections immédiates vers l'offre externe par une modale de confirmation permettant l'enregistrement préalable dans le suivi de candidature.

### Sécurité
- Retrait des ports de débogage ouverts non indispensables dans les fichiers de configuration de production Docker et Docker Compose.
- Architecture Zero-DB : garantie absolue de non-persistance des données personnelles et CV sur un serveur centralisé.
- Assainissement strict anti-XSS de tous les flux externes et documents importés.

### Documentation
- Publication du fichier de licence open-source ISC (`LICENSE`).
- Documentation exhaustive dans le `README.md` : architecture Mermaid, guide d'installation, référence des variables d'environnement, endpoints REST et scénarios d'usage.

---

[Non publié]: https://github.com/SteveHoareau18/findthejob/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/SteveHoareau18/findthejob/releases/tag/v1.0.0
