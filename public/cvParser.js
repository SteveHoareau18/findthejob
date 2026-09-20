/**
 * Module d'extraction et d'analyse de CV sans IA (FindTheJob)
 * 100% déterministe, basé sur dictionnaires et expressions régulières.
 * Calibré sur des CV réels (ex: STEVE HOAREAU.pdf) et génériques.
 */

function cleanAndNormalizeText(str) {
  if (!str) return '';
  return str
    .replace(/\r\n/g, '\n')
    .replace(/[’‘`]/g, "'")
    .replace(/[–—]/g, '-')
    .replace(/\u00A0/g, ' ')
    .replace(/--\s*\d+\s*of\s*\d+\s*--/gi, '')
    .replace(/page\s*\d+\s*(?:\/|sur)\s*\d+/gi, '')
    .replace(/[ \t]+/g, ' ');
}

// 1. Dictionnaire complet des Logiciels, Langages, Frameworks et Outils
const SOFTWARE_CATALOG = [
  // Web & Backend
  { name: 'PHP', regex: /\bPHP\b/i },
  { name: 'Symfony', regex: /\bSymfony\b/i },
  { name: 'Yii', regex: /\bYII(\s*PHP)?\b/i },
  { name: 'Laravel', regex: /\bLaravel\b/i },
  { name: 'JavaScript', regex: /\b(JavaScript|\bJS\b)\b/i },
  { name: 'TypeScript', regex: /\b(TypeScript|\bTS\b)\b/i },
  { name: 'jQuery', regex: /\bJQuery\b/i },
  { name: 'WordPress', regex: /\b(Wordpress|WP)\b/i },
  { name: 'Node.js', regex: /\bNode(\.js)?\b/i },
  { name: 'Express', regex: /\bExpress(\.js)?\b/i },
  { name: 'NestJS', regex: /\bNestJS\b/i },
  { name: 'React', regex: /\bReact(\.js)?\b/i },
  { name: 'React Native', regex: /\bReact\s*Native\b/i },
  { name: 'Next.js', regex: /\bNext(\.js)?\b/i },
  { name: 'Vue.js', regex: /\b(Vue|Vue\.js|Nuxt|Nuxt\.js)\b/i },
  { name: 'Angular', regex: /\bAngular\b/i },
  { name: 'Svelte', regex: /\bSvelte\b/i },
  { name: 'Python', regex: /\bPython\b/i },
  { name: 'Django', regex: /\bDjango\b/i },
  { name: 'FastAPI', regex: /\bFastAPI\b/i },
  { name: 'Flask', regex: /\bFlask\b/i },
  { name: 'Java', regex: /\bJava\b(?!script)/i },
  { name: 'Spring Boot', regex: /\bSpring(\s*Boot)?\b/i },
  { name: 'C#', regex: /\b(C#|\.NET|ASP\.NET)\b/i },
  { name: 'C++', regex: /\bC\+\+\b/i },
  { name: 'Ruby', regex: /\b(Ruby|Ruby\s*on\s*Rails|Rails)\b/i },
  { name: 'Go / Golang', regex: /\b(Golang|Langage\s*Go)\b/i },
  { name: 'Rust', regex: /\bRust\b/i },
  { name: 'HTML5 / CSS3', regex: /\b(HTML|HTML5|CSS|CSS3|Sass|SCSS)\b/i },
  { name: 'Tailwind CSS', regex: /\bTailwind(\s*CSS)?\b/i },
  { name: 'Bootstrap', regex: /\bBootstrap\b/i },

  // Outils métiers, Microsoft Power Platform, ERP & Systèmes de gestion
  { name: 'PowerBI', regex: /\bPower\s*BI\b/i },
  { name: 'PowerApps', regex: /\bPower\s*Apps\b/i },
  { name: 'EBP', regex: /\bEBP\b/i },
  { name: 'SAP', regex: /\bSAP\b/i },
  { name: 'Salesforce', regex: /\bSalesforce\b/i },
  { name: 'ERP / CRM', regex: /\b(ERP|CRM|HubSpot)\b/i },
  { name: 'Docker', regex: /\bDocker\b/i },
  { name: 'Kubernetes', regex: /\b(Kubernetes|K8s)\b/i },
  { name: 'Git / GitHub', regex: /\b(Git|GitHub|GitLab|Bitbucket)\b/i },
  { name: 'Bases de données / SQL', regex: /\b(SQL|MySQL|PostgreSQL|MongoDB|Redis|SQLite|MariaDB|Oracle|bases?\s*de\s*donn[ée]es|persistance\s*des\s*donn[ée]es)\b/i },
  { name: 'Méthodologie Agile', regex: /\b(Agile|Scrum|Kanban)\b/i },
  { name: 'Excel / Suite Office', regex: /\b(Excel|Office\s*365|Word|PowerPoint)\b/i },
  { name: 'Cloud (AWS / Azure / GCP)', regex: /\b(AWS|Amazon Web Services|Azure|Google Cloud|GCP)\b/i },
  { name: 'CI/CD', regex: /\b(CI\/CD|Jenkins|GitHub Actions|GitLab CI)\b/i },
  { name: 'Linux', regex: /\b(Linux|Ubuntu|Debian|Bash|Shell)\b/i },
  { name: 'Figma', regex: /\b(Figma|Adobe XD|Canva|Photoshop|Illustrator)\b/i },
  { name: 'Postman', regex: /\bPostman\b/i }
];

// 2. Dictionnaire des Soft Skills avec variantes adjectivales et nominales
const SOFT_SKILLS_CATALOG = [
  { name: "Esprit d'équipe", regex: /\b(esprit\s*d['’]équipe|travail\s*en\s*équipe|collaboratif|collaboration)\b/i },
  { name: 'Autonomie', regex: /\b(autonome|autonomie)\b/i },
  { name: 'Force de proposition', regex: /\bforce\s*de\s*proposition\b/i },
  { name: 'Responsable', regex: /\b(responsable|sens\s*des\s*responsabilités)\b/i },
  { name: 'Rigueur', regex: /\b(rigoureux|rigoureuse|rigueur|sens\s*du\s*détail)\b/i },
  { name: 'Adaptabilité', regex: /\b(adaptabilit[ée]|adaptable|flexibilit[ée])\b/i },
  { name: 'Communication', regex: /\b(communication|aisance\s*relationnelle|sens\s*du\s*relationnel)\b/i },
  { name: 'Curiosité', regex: /\b(curiosit[ée]|curieux|curieuse)\b/i },
  { name: 'Organisation', regex: /\b(organisation|organis[ée]|m[ée]thodique)\b/i },
  { name: 'Leadership', regex: /\b(leadership|gestion\s*d['’][ée]quipe|management)\b/i },
  { name: 'Proactivité', regex: /\b(proactivit[ée]|proactif|proactive|prise\s*d['’]initiative)\b/i },
  { name: 'Polyvalence', regex: /\b(polyvalence|polyvalent|polyvalente)\b/i },
  { name: 'Pédagogie', regex: /\b(p[ée]dagogie|p[ée]dagogue|former\s*des\s*personnes)\b/i },
  { name: 'Résolution de problèmes', regex: /\br[ée]solution\s*de\s*probl[èe]mes\b/i }
];

// 3. Extraction de texte brut depuis un fichier (PDF, DOCX, TXT)
async function extractTextFromFile(file) {
  const extension = file.name.split('.').pop().toLowerCase();

  if (extension === 'txt') {
    return await file.text();
  }

  if (extension === 'pdf') {
    if (typeof pdfjsLib === 'undefined') {
      throw new Error('La librairie PDF.js n\'est pas encore chargée. Veuillez patienter.');
    }
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      fullText += pageText + '\n';
    }
    return fullText;
  }

  if (extension === 'docx') {
    if (typeof mammoth === 'undefined') {
      throw new Error('La librairie Mammoth n\'est pas encore chargée.');
    }
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  }

  throw new Error(`Format de fichier non pris en charge : .${extension}. Utilisez .pdf, .docx ou .txt`);
}

// Helper : fusion ciblée des lignes brisées (séparateur, préposition ou date coupée)
function smartMergeLines(rawLines) {
  const monthNames = "(?:janvier|f[ée]vrier|mars|avril|mai|juin|juillet|ao[ûu]t|septembre|octobre|novembre|d[ée]cembre)";
  const endsWithContinuation = new RegExp(`(?:[-–—:|/]|\\b(?:en|de|du|d'|d’|des|avec|et|à|option|sp[ée]cialit[ée]|${monthNames}))\\s*$`, 'i');

  const result = [];
  for (let i = 0; i < rawLines.length; i++) {
    let cur = rawLines[i];

    while (i + 1 < rawLines.length) {
      const next = rawLines[i + 1];
      const isNextBullet = /^[-•*]/.test(next);
      const isNextHeader = /^(formations?|dipl[ôo]mes?|exp[ée]riences?|comp[ée]tences?|soft\s*skills|profil|contact|me\s*contacter)\b/i.test(next);

      if (!isNextBullet && !isNextHeader && endsWithContinuation.test(cur)) {
        cur = `${cur} ${next}`.replace(/\s+/g, ' ').trim();
        i++;
      } else {
        break;
      }
    }

    result.push(cur);
  }
  return result;
}

const jobRoleRegex = /\b(d[ée]velopp(?:eur|euse)?|ing[ée]nieur[e]?|consultan[te]?|chef\s*de\s*projet|responsable(?!\s*$)|charg[ée]e?\s*de|technicien(?:ne)?|architecte|fullstack|frontend|backend|data|admin|commercial[e]?|comptable|formateur|formatrice|manager|designer|analyste|alternan[te]|stagiaire|assistant[e]?)\b/i;

function isInvalidExpLine(str) {
  const s = str.trim().toLowerCase();
  if (/^(objectif|profil|me contacter|centre d|compétences|soft skills|anglais|site web|e-mail|numéro)/i.test(s)) return true;
  if (/\b(mon objectif|je souhaite|cherche un|recherche un|devenir|passionné)\b/i.test(s)) return true;
  if (/\b(brevet|baccalauréat|bac\s*\+[0-9]|bac\s*(?:si|s|es|l|pro)|licence|master|bts|dut|but|diplôme|diplômé|rncp)\b/i.test(s)) return true;
  if (/^(responsable|autonome|rigoureux|rigoureuse|curieux|dynamique)$/i.test(s)) return true;
  return false;
}

// Helper : appariement d'intitulé de poste pour les formats multi-colonnes / multi-lignes
function findNearestRole(lines, index) {
  for (let offset = -1; offset >= -8; offset--) {
    const i = index + offset;
    if (i < 0) break;
    const cand = lines[i];
    if (cand && jobRoleRegex.test(cand) && !isInvalidExpLine(cand) && cand.length < 65) {
      let fullRole = cand;
      if (i > 0 && /^(?:alternan[te]|stagiaire|assistant[e]?|chef\s*de\s*projet|lead|junior|senior|direct(?:eur|rice))\b/i.test(lines[i - 1]) && !isInvalidExpLine(lines[i - 1])) {
        fullRole = `${lines[i - 1]} ${fullRole}`;
      }
      if (i + 1 < index && /^(d[ée]veloppeur|d['’]application|web|mobile|logiciel|système)/i.test(lines[i + 1])) {
        fullRole += ` ${lines[i + 1]}`;
      }
      return fullRole.replace(/\s+/g, ' ').trim();
    }
  }

  for (let offset = 1; offset <= 3; offset++) {
    const i = index + offset;
    if (i >= lines.length) break;
    const cand = lines[i];
    if (cand && jobRoleRegex.test(cand) && !isInvalidExpLine(cand) && cand.length < 65) {
      let fullRole = cand;
      if (i + 1 < lines.length && /^(d[ée]veloppeur|d['’]application|web|mobile|logiciel|système)/i.test(lines[i + 1])) {
        fullRole += ` ${lines[i + 1]}`;
      }
      return fullRole.replace(/\s+/g, ' ').trim();
    }
  }

  return '';
}

/**
 * 4. Analyseur automatique sans IA (100% Générique)
 * Sections extraites :
 * - formations
 * - expérience pro
 * - softs skills
 * - logiciels
 * - age
 * - lieux
 * - véhiculé ou pas
 */
function parseCvWithoutAi(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    return createEmptyCriteria();
  }

  const text = cleanAndNormalizeText(rawText);
  const rawLines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const lines = smartMergeLines(rawLines);

  // A. ÂGE
  let age = 'Non précisé';
  const ageMatch = text.match(/(?:âg[ée]\s*de\s*|âge\s*:\s*|\b)([1-6][0-9])\s*(?:ans|années)\b/i);
  if (ageMatch) {
    age = `${ageMatch[1]} ans`;
  } else {
    // Date de naissance (ex: né le 15/04/1996 ou année 1995)
    const birthMatch = text.match(/n[ée]\(?[e]?\)?\s*(?:le\s*)?([0-9]{1,2}[\/\.-][0-9]{1,2}[\/\.-])?(19[5-9][0-9]|200[0-8])/i);
    if (birthMatch && birthMatch[2]) {
      const birthYear = parseInt(birthMatch[2], 10);
      const currentYear = new Date().getFullYear();
      age = `${currentYear - birthYear} ans`;
    }
  }

  // B. VÉHICULÉ OU PAS
  const vehiculeRegex = /\b(permis\s*(b|auto|voiture)|v[ée]hicul[ée]|voiture\s*personnelle|titulaire\s*du\s*permis\s*b)\b/i;
  const nonVehiculeRegex = /\b(non\s*v[ée]hicul[ée]|pas\s*de\s*permis|sans\s*permis)\b/i;
  let vehicule = false;
  if (vehiculeRegex.test(text) && !nonVehiculeRegex.test(text)) {
    vehicule = true;
  }

  // C. LIEUX (France Métro, DROM, Grandes Agglomérations & Codes Postaux)
  const detectedLocations = new Set();
  const majorLocations = [
    { label: 'La Réunion', regex: /\b(La\s*R[ée]union|Saint-Denis|Saint-Pierre|Saint-Paul|Le\s*Port|Sainte-Marie|Saint-Beno[îi]t|Saint-Leu|Saint-Joseph|Saint-Andr[ée]|974\d{2})\b/i },
    { label: 'Guadeloupe', regex: /\b(Guadeloupe|Pointe-[àa]-Pitre|Les\s*Abymes|Baie-Mahault|971\d{2})\b/i },
    { label: 'Martinique', regex: /\b(Martinique|Fort-de-France|Le\s*Lamentin|972\d{2})\b/i },
    { label: 'Guyane', regex: /\b(Guyane|Cayenne|Kourou|973\d{2})\b/i },
    { label: 'Mayotte', regex: /\b(Mayotte|Mamoudzou|976\d{2})\b/i },
    { label: 'Montpellier', regex: /\bMontpellier\b/i },
    { label: 'Paris / IDF', regex: /\b(Paris|Île-de-France|Boulogne|Saint-Denis\s*\(?93\)?|Nanterre|Versailles|Créteil)\b/i },
    { label: 'Lyon', regex: /\b(Lyon|Villeurbanne)\b/i },
    { label: 'Toulouse', regex: /\bToulouse\b/i },
    { label: 'Bordeaux', regex: /\bBordeaux\b/i },
    { label: 'Nantes', regex: /\bNantes\b/i },
    { label: 'Marseille', regex: /\b(Marseille|Aix-en-Provence)\b/i },
    { label: 'Lille', regex: /\b(Lille|Roubaix|Tourcoing)\b/i },
    { label: 'Strasbourg', regex: /\bStrasbourg\b/i },
    { label: 'Rennes', regex: /\bRennes\b/i },
    { label: 'Nice', regex: /\b(Nice|Cannes|Antibes|Sophia\s*Antipolis)\b/i },
    { label: 'Grenoble', regex: /\bGrenoble\b/i },
    { label: 'Rouen', regex: /\bRouen\b/i },
    { label: 'Toulon', regex: /\bToulon\b/i },
    { label: 'Angers', regex: /\bAngers\b/i },
    { label: 'Clermont-Ferrand', regex: /\bClermont-Ferrand\b/i }
  ];

  majorLocations.forEach(loc => {
    if (loc.regex.test(text)) {
      detectedLocations.add(loc.label);
    }
  });

  // Codes postaux stricts à 5 chiffres (filtre anti-collision avec les années 1950 - 2035)
  const postalMatches = text.matchAll(/\b(97[1-6]\d{2}|[0-8]\d{3}|9[0-5]\d{3})\b/g);
  for (const p of postalMatches) {
    const code = p[1];
    const num = parseInt(code, 10);
    if (num >= 1950 && num <= 2035) continue;
    detectedLocations.add(code);
  }

  const lieux = Array.from(detectedLocations).join(' / ') || 'France';

  // D. SOFT SKILLS
  const softSkills = [];
  SOFT_SKILLS_CATALOG.forEach(item => {
    if (item.regex.test(text)) {
      softSkills.push(item.name);
    }
  });

  // E. LOGICIELS & COMPÉTENCES TECHNIQUES
  const logiciels = [];
  SOFTWARE_CATALOG.forEach(tool => {
    if (tool.regex.test(text)) {
      logiciels.push(tool.name);
    }
  });

  // F. FORMATIONS (Générique - Détection de diplômes & spécialisations)
  const formations = [];
  const degreeRegex = /\b(bac\s*\+\s*[1-8]|titre\s*(?:rncp|professionnel|pro)?\s*(?:rncp\s*)?\d+|rncp\s*\d+|master(?:\s*[12])?|msc|mba|licence(?:\s*pro)?|bachelor|bts(?:\s*[a-z]+)?|dut|but|doctorat|phd|dipl[ôo]me(?:\s*d['’]ing[ée]nieur|\s*d['’][ée]tat)?|ing[ée]nieur|baccalaur[ée]at|bac\s*(?:si|isn|nsi|s|es|l|sti2d|stmg|pro|g[ée]n[ée]ral))\b/i;
  const schoolOrYearRegex = /(?:dipl[ôo]m[ée]|campus|universit[ée]|[ée]cole|lyc[ée]e|centre|formation|institut|iut|\b20[0-2][0-9]\b)/i;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^(formations?|dipl[ôo]mes?|parcours\s*scolaire|études?)$/i.test(line)) continue;
    if (line.length > 130 && !line.includes(':') && !line.includes('-')) continue;

    if (degreeRegex.test(line)) {
      let degreeLine = line;
      let extra = '';
      if (i + 1 < lines.length) {
        const next = lines[i + 1];
        if (schoolOrYearRegex.test(next) && !degreeRegex.test(next) && next.length < 110) {
          extra = next;
          i++;
        }
      }

      let formatted = extra ? `${degreeLine} (${extra})` : degreeLine;
      formatted = formatted.replace(/\s+/g, ' ').replace(/^[-•*]\s*/, '').trim();

      const alreadyHas = formations.some(f => {
        const fLow = f.toLowerCase();
        const dLow = degreeLine.toLowerCase();
        return fLow.includes(dLow) || dLow.includes(fLow);
      });

      if (!alreadyHas && formatted.length > 5 && formatted.length < 160) {
        formations.push(formatted);
      }
    }
  }

  // G. EXPÉRIENCES PROFESSIONNELLES (Générique - Détection basée sur dates, entreprises et rôles)
  const experiences = [];
  const monthNames = "(?:janvier|f[ée]vrier|mars|avril|mai|juin|juillet|ao[ûu]t|septembre|octobre|novembre|d[ée]cembre)";
  const dateRangeRegex = new RegExp(`\\b(20[0-2][0-9]|${monthNames}\\s*20[0-2][0-9])\\s*[-–—àa]\\s*(20[0-2][0-9]|actuel|pr[ée]sent|aujourd'hui|${monthNames}\\s*20[0-2][0-9])\\b`, "i");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (isInvalidExpLine(line)) continue;

    const hasDates = dateRangeRegex.test(line);

    if (hasDates) {
      if (jobRoleRegex.test(line) && (line.includes('chez') || line.includes('-') || line.includes('|') || line.includes(':'))) {
        const clean = line.replace(/^[-•*]\s*/, '').trim();
        if (!experiences.some(e => e.toLowerCase() === clean.toLowerCase())) {
          experiences.push(clean);
        }
        continue;
      }

      const role = findNearestRole(lines, i);
      const cleanLine = line.replace(/^[-•*]\s*/, '').trim();
      const entry = role ? `${role} - ${cleanLine}` : cleanLine;
      if (!experiences.some(e => e.toLowerCase() === entry.toLowerCase())) {
        experiences.push(entry);
      }
    }
  }

  // Fallback si aucune date explicite n'a été détectée
  if (experiences.length === 0) {
    lines.forEach(l => {
      if (jobRoleRegex.test(l) && !isInvalidExpLine(l) && l.length > 8 && l.length < 70) {
        const clean = l.replace(/^[-•*]\s*/, '').trim();
        if (!experiences.includes(clean)) experiences.push(clean);
      }
    });
  }

  return {
    formations: formations.slice(0, 8),
    experience: experiences.slice(0, 8),
    softSkills,
    logiciels,
    age: age || 'Non précisé',
    lieux: lieux || 'France',
    vehicule
  };
}

function createEmptyCriteria() {
  return {
    formations: [],
    experience: [],
    softSkills: [],
    logiciels: [],
    age: '',
    lieux: '',
    vehicule: false
  };
}

/**
 * 5. Calculateur d'adéquation CV / Offre (Score 0-100% sans IA)
 * Compare les critères extraits du CV aux détails de chaque offre.
 */
function calculateCvJobScore(job, cvCriteria) {
  if (!cvCriteria || (!cvCriteria.logiciels?.length && !cvCriteria.experience?.length)) {
    return { score: null, matchDetails: 'Aucun CV importé', matchedLogiciels: [] };
  }

  let totalScore = 0;
  const matchPoints = [];
  const matchedLogiciels = [];

  const jobText = `${job.title} ${job.company} ${job.description} ${(job.tags || []).join(' ')}`.toLowerCase();

  // 1. Logiciels & Compétences Techniques (Pondération max: 45 pts)
  const cvLogiciels = cvCriteria.logiciels || [];
  if (cvLogiciels.length > 0) {
    cvLogiciels.forEach(tech => {
      const escaped = tech.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = tech.length <= 2
        ? new RegExp(`(^|[^a-zA-Z0-9_#+])${escaped}([^a-zA-Z0-9_#+]|$)`)
        : new RegExp(`(^|[^a-zA-Z0-9_#+])${escaped}([^a-zA-Z0-9_#+]|$)`, 'i');
      if (regex.test(jobText)) {
        matchedLogiciels.push(tech);
      }
    });

    if (matchedLogiciels.length > 0) {
      const techScore = Math.min(45, matchedLogiciels.length * 10);
      totalScore += techScore;
      matchPoints.push(`${matchedLogiciels.length} outil(s) en commun (${matchedLogiciels.slice(0, 3).join(', ')}${matchedLogiciels.length > 3 ? '...' : ''})`);
    }
  }

  // 2. Titre & Cohérence Métier (Pondération max: 25 pts)
  const jobTitleLower = (job.title || '').toLowerCase();
  const cvExperiences = Array.isArray(cvCriteria.experience) ? cvCriteria.experience : [cvCriteria.experience || ''];
  const hasRoleMatch = cvExperiences.some(exp => {
    const expLower = exp.toLowerCase();
    const tokens = jobTitleLower.split(/[\s\/\-]+/).filter(t => t.length > 3);
    return tokens.some(tok => expLower.includes(tok));
  });

  if (hasRoleMatch) {
    totalScore += 25;
    matchPoints.push('Expérience en adéquation avec le poste');
  } else if (jobTitleLower.includes('dév') || jobTitleLower.includes('dev') || jobTitleLower.includes('projet') || jobTitleLower.includes('logiciel')) {
    totalScore += 18;
  }

  // 3. Localisation & Mobilité (Pondération max: 20 pts)
  const jobLocationLower = (job.location || '').toLowerCase();
  const cvLieuxLower = (cvCriteria.lieux || '').toLowerCase();

  const locationsList = cvLieuxLower.split('/').map(l => l.trim()).filter(Boolean);
  const locationMatches = locationsList.some(loc => jobLocationLower.includes(loc) || loc.includes(jobLocationLower));

  if (jobLocationLower.includes('remote') || jobLocationLower.includes('télétravail') || jobLocationLower.includes('france entière')) {
    totalScore += 20;
    matchPoints.push('Télétravail / Mobilité compatible');
  } else if (locationMatches) {
    totalScore += 20;
    matchPoints.push('Zone géographique identique');
  } else if (cvCriteria.vehicule && (jobLocationLower.includes('france') || !cvLieuxLower)) {
    totalScore += 12;
    matchPoints.push('Candidat véhiculé');
  } else {
    totalScore += 5;
  }

  // 4. Soft Skills & Formation (Pondération max: 10 pts)
  const cvSoftSkills = cvCriteria.softSkills || [];
  let foundSoft = 0;
  cvSoftSkills.forEach(soft => {
    if (jobText.includes(soft.toLowerCase())) {
      foundSoft++;
    }
  });
  if (foundSoft > 0) {
    totalScore += Math.min(10, foundSoft * 5);
    matchPoints.push(`${foundSoft} soft skill(s) identifiée(s)`);
  } else {
    totalScore += 5;
  }

  const finalScore = Math.min(100, Math.max(10, Math.round(totalScore)));

  return {
    score: finalScore,
    matchedLogiciels,
    matchDetails: matchPoints.join(' • ') || 'Correspondance générale'
  };
}

// Export pour le navigateur
if (typeof window !== 'undefined') {
  window.cvParser = {
    cleanAndNormalizeText,
    extractTextFromFile,
    parseCvWithoutAi,
    calculateCvJobScore,
    SOFTWARE_CATALOG,
    SOFT_SKILLS_CATALOG
  };
}

// Export pour l'environnement Node.js (tests & CI)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    cleanAndNormalizeText,
    extractTextFromFile,
    parseCvWithoutAi,
    calculateCvJobScore,
    SOFTWARE_CATALOG,
    SOFT_SKILLS_CATALOG
  };
}
