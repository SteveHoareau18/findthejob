const { execFile } = require('child_process');
const axios = require('axios');
const cheerio = require('cheerio');
const { scrapeLinkedIn, scrapeLinkedInJobs } = require('./src/scrapers/linkedin');
const { scrapeFranceTravail, scrapeFranceTravailJobs } = require('./src/scrapers/francetravail');

// Configuration HTTP avec headers réalistes simulant un navigateur complet
const browserHeaders = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
  'Sec-Ch-Ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
  'Sec-Ch-Ua-Mobile': '?0',
  'Sec-Ch-Ua-Platform': '"Windows"',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'none',
  'Sec-Fetch-User': '?1',
  'Upgrade-Insecure-Requests': '1'
};

const httpClient = axios.create({
  timeout: 12000,
  headers: browserHeaders
});

function cleanHtml(html) {
  if (!html) return '';
  try {
    const $ = cheerio.load(html);
    $('script, style, noscript, iframe').remove();
    return $('body').text().replace(/\s+/g, ' ').trim();
  } catch (e) {
    return html.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();
  }
}

/**
 * Nettoie et extrait les termes de recherche les plus efficaces pour les formulaires stricts
 */
function cleanSearchKeyword(query) {
  if (!query) return 'developpeur';
  return query
    .replace(/[&/\\#,+()$~%.'":*?<>{}\n\r]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
// 1. LINKEDIN JOBS : Délégué au module générique en couches ./src/scrapers/linkedin

// 2. FRANCE TRAVAIL : Délégué au module générique en couches ./src/scrapers/francetravail

/**
 * 3. HELLOWORK (France & DROM)
 */
async function scrapeHellowork(searchTerm, location = 'France', limit = 25) {
  try {
    const cleanTerm = cleanSearchKeyword(searchTerm);
    const term = encodeURIComponent(cleanTerm);
    const loc = encodeURIComponent(location || 'France');
    const url = `https://www.hellowork.com/fr-fr/emploi/recherche.html?k=${term}&l=${loc}`;

    const res = await httpClient.get(url);
    const $ = cheerio.load(res.data);
    const jobs = [];

    $('ul > li').each((_, el) => {
      if (jobs.length >= limit) return false;
      const h3 = $(el).find('h3').text().trim();
      const a = $(el).find('a').first().attr('href');
      const snippet = $(el).text().replace(/\s+/g, ' ').trim();

      if (h3 && a && a.includes('.html')) {
        let title = h3;
        let company = 'Recruteur HelloWork';
        if (h3.includes('\n')) {
          const lines = h3.split('\n').map(l => l.trim()).filter(Boolean);
          title = lines[0];
          if (lines[1]) company = lines[1];
        }

        const fullUrl = a.startsWith('http') ? a : `https://www.hellowork.com${a}`;
        jobs.push({
          id: `hw-${Math.abs(hashString(fullUrl))}`,
          title,
          company,
          location: location,
          contractType: 'CDI / CDD / Interim',
          salary: 'Non précisé',
          description: snippet.substring(0, 400),
          tags: ['HelloWork', location],
          url: fullUrl,
          source: 'HelloWork',
          date: 'Récemment'
        });
      }
    });

    console.log(`[Scraper HelloWork] ✅ ${jobs.length} offres trouvées.`);
    return jobs;
  } catch (err) {
    console.warn(`[Scraper HelloWork] Erreur:`, err.message);
    return [];
  }
}

/**
 * 4. METEOJOB (France Métropolitaine & DROM)
 * Plateforme majeure d'emploi sans blocage Cloudflare
 */
async function scrapeMeteojob(searchTerm, location = 'France', limit = 20) {
  try {
    const cleanTerm = cleanSearchKeyword(searchTerm);
    const what = encodeURIComponent(cleanTerm);
    const where = encodeURIComponent(location || 'France');
    const url = `https://www.meteojob.com/jobs?what=${what}&where=${where}`;

    const res = await httpClient.get(url);
    const $ = cheerio.load(res.data);
    const jobs = [];

    $('article, [class*="OfferCard"], .job-item').each((_, el) => {
      if (jobs.length >= limit) return false;
      const title = $(el).find('h2, h3').first().text().trim();
      const company = $(el).find('[class*="company"], .company-name').first().text().trim();
      const loc = $(el).find('[class*="location"], [class*="city"]').first().text().trim();
      const contract = $(el).find('[class*="contract"]').first().text().trim();
      const salary = $(el).find('[class*="salary"]').first().text().trim();
      
      let href = $(el).find('a[href*="/jobs/"]').first().attr('href');
      if (!href) href = $(el).find('a').first().attr('href');

      if (title && href) {
        const fullUrl = href.startsWith('http') ? href : `https://www.meteojob.com${href}`;
        jobs.push({
          id: `mj-${Math.abs(hashString(fullUrl))}`,
          title,
          company: company || 'Recruteur Météojob',
          location: loc || location,
          contractType: contract || 'CDI / Plein temps',
          salary: salary || 'Non communiqué',
          description: `${title} chez ${company || 'Recruteur'} à ${loc || location}. Offre disponible sur Météojob.`,
          tags: ['Météojob', location],
          url: fullUrl,
          source: 'Météojob',
          date: 'Récemment'
        });
      }
    });

    console.log(`[Scraper Météojob] ✅ ${jobs.length} offres trouvées.`);
    return jobs;
  } catch (err) {
    console.warn(`[Scraper Météojob] Erreur:`, err.message);
    return [];
  }
}

/**
 * 5. JOOBLE (API officielle gratuite & flux)
 * Si JOOBLE_API_KEY est configurée dans .env, utilise l'API REST officielle Jooble
 */
async function scrapeJooble(searchTerm, location = 'France', limit = 20) {
  const apiKey = process.env.JOOBLE_API_KEY;
  if (apiKey && apiKey.trim() !== '' && apiKey !== 'your_jooble_api_key_here') {
    try {
      const cleanTerm = cleanSearchKeyword(searchTerm);
      const res = await httpClient.post(`https://jooble.org/api/${apiKey}`, {
        keywords: cleanTerm,
        location: location,
        page: 1
      });

      const jobs = res.data?.jobs || [];
      console.log(`[Scraper Jooble API] ✅ ${jobs.length} offres trouvées via API.`);
      return jobs.map(j => ({
        id: `jooble-${j.id}`,
        title: j.title,
        company: j.company || 'Entreprise Jooble',
        location: j.location || location,
        contractType: j.type || 'Non précisé',
        salary: j.salary || 'Non communiqué',
        description: cleanHtml(j.snippet),
        tags: ['Jooble', location],
        url: j.link,
        source: 'Jooble',
        date: j.updated ? new Date(j.updated).toLocaleDateString('fr-FR') : 'Récent'
      }));
    } catch (e) {
      console.warn('[Scraper Jooble API] Erreur:', e.message);
    }
  }
  return [];
}

/**
 * Helper d'exécution curl avec headers réalistes pour contourner les empreintes TLS
 */
function fetchWithCurl(url) {
  return new Promise((resolve, reject) => {
    const args = [
      '-s',
      url,
      '-H', 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      '-H', 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      '-H', 'Accept-Language: fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
      '--compressed'
    ];
    execFile('curl.exe', args, { maxBuffer: 15 * 1024 * 1024, timeout: 12000 }, (error, stdout) => {
      if (error) return reject(error);
      resolve(stdout);
    });
  });
}

function parseIndeedHtml(html, fallbackUrl, location = 'France', limit = 25) {
  const jobs = [];
  if (!html) return jobs;

  // 1. Extraction haute fidélité via mosaicProviderJobCardsModel JSON
  try {
    const match = html.match(/window\.mosaic\.providerData\["mosaic-provider-jobcards"\]\s*=\s*(\{.+?\});/);
    if (match) {
      const data = JSON.parse(match[1]);
      const results = data.metaData?.mosaicProviderJobCardsModel?.results || [];
      for (const r of results) {
        if (jobs.length >= limit) break;
        if (r.title && r.jobkey) {
          let salary = 'Non communiqué';
          if (r.extractedSalary) {
            const { min, max, type } = r.extractedSalary;
            const unit = type === 'YEARLY' ? '€/an' : type === 'MONTHLY' ? '€/mois' : '€';
            salary = min && max ? `${min}€ - ${max} ${unit}` : `${min || max} ${unit}`;
          } else if (r.salarySnippet?.text) {
            salary = r.salarySnippet.text;
          }

          let snippet = '';
          if (r.snippet) {
            snippet = cheerio.load(`<div>${r.snippet}</div>`).text().trim();
          }

          jobs.push({
            id: `indeed-${r.jobkey}`,
            title: r.displayTitle || r.title,
            company: r.company || r.companyName || 'Recruteur Indeed',
            location: r.formattedLocation || location,
            contractType: Array.isArray(r.jobTypes) && r.jobTypes.length > 0 ? r.jobTypes.join(' / ') : 'CDI / CDD',
            salary,
            description: snippet || `${r.title} chez ${r.company || 'Indeed'} à ${r.formattedLocation || location}.`,
            tags: ['Indeed', ...(r.jobTypes || [])],
            url: `https://fr.indeed.com/viewjob?jk=${r.jobkey}`,
            source: 'Indeed',
            date: r.formattedRelativeTime || 'Récemment'
          });
        }
      }
    }
  } catch (e) {
    // Fallback silencieux vers le DOM Cheerio
  }

  // 2. Extraction de secours via les sélecteurs DOM Cheerio
  if (jobs.length === 0) {
    const $ = cheerio.load(html);
    $('[data-jk]').each((_, el) => {
      if (jobs.length >= limit) return false;
      const card = $(el).closest('li, div.cardOutline, div.job_seen_beacon');
      const title = card.find('h2.jobTitle, a[data-jk]').text().trim() || $(el).text().trim();
      const company = card.find('[data-testid="company-name"], span.companyName').text().trim();
      const loc = card.find('[data-testid="text-location"]').text().trim();
      const jk = $(el).attr('data-jk');
      if (title && jk && !jobs.some(j => j.id === `indeed-${jk}`)) {
        jobs.push({
          id: `indeed-${jk}`,
          title,
          company: company || 'Recruteur Indeed',
          location: loc || location,
          contractType: 'CDI / CDD',
          salary: 'Non communiqué',
          description: `${title} chez ${company || 'Indeed'} à ${loc || location}.`,
          tags: ['Indeed', location],
          url: `https://fr.indeed.com/viewjob?jk=${jk}`,
          source: 'Indeed',
          date: 'Récemment'
        });
      }
    });
  }

  return jobs;
}

/**
 * 6. INDEED (Utilise https://fr.indeed.com/jobs?q=[searchWord])
 */
async function scrapeIndeed(searchTerm, location = 'France', limit = 25) {
  const cleanTerm = cleanSearchKeyword(searchTerm);
  // Construction directe de l'URL demandée : https://fr.indeed.com/jobs?q=[searchWord]
  const url = `https://fr.indeed.com/jobs?q=${encodeURIComponent(cleanTerm)}`;
  console.log(`[Scraper Indeed] 🔍 Interrogation : ${url}`);

  let jobs = [];

  try {
    // 1. Appel via curl avec headers réalistes
    const html = await fetchWithCurl(url);
    jobs = parseIndeedHtml(html, url, location, limit);
  } catch (err) {
    console.warn(`[Scraper Indeed] Tentative curl échouée (${err.message}), repli axios...`);
    try {
      const res = await httpClient.get(url);
      jobs = parseIndeedHtml(res.data, url, location, limit);
    } catch (axiosErr) {
      console.warn(`[Scraper Indeed] Échec axios: ${axiosErr.message}`);
    }
  }

  // 2. Retry intelligent si 0 résultat et terme composé
  if (jobs.length === 0 && cleanTerm.includes(' ')) {
    const fallbackWord = cleanTerm.split(' ')[0];
    if (fallbackWord && fallbackWord.length > 2) {
      const fallbackUrl = `https://fr.indeed.com/jobs?q=${encodeURIComponent(fallbackWord)}`;
      console.log(`[Scraper Indeed] 🔄 Retry avec mot-clé de secours : ${fallbackUrl}`);
      try {
        const htmlFallback = await fetchWithCurl(fallbackUrl);
        jobs = parseIndeedHtml(htmlFallback, fallbackUrl, location, limit);
      } catch (e) {}
    }
  }

  console.log(`[Scraper Indeed] ✅ ${jobs.length} offres Indeed récupérées.`);
  return jobs;
}

/**
 * 7. REMOTIVE (Offres Tech & Télétravail Europe / International)
 */
async function scrapeRemotive(searchTerm, limit = 20) {
  try {
    const cleanTerm = cleanSearchKeyword(searchTerm);
    const term = encodeURIComponent(cleanTerm.split(' ')[0] || 'developer');
    const url = `https://remotive.com/api/remote-jobs?search=${term}&limit=${limit}`;
    const response = await httpClient.get(url);

    const jobs = response.data?.jobs || [];
    return jobs.map(job => ({
      id: `remotive-${job.id}`,
      title: job.title || 'Poste non spécifié',
      company: job.company_name || 'Entreprise non précisée',
      location: job.candidate_required_location || 'Remote Europe / Mondial',
      contractType: job.job_type ? job.job_type.toUpperCase() : 'Non précisé',
      salary: job.salary || 'Non communiqué',
      description: cleanHtml(job.description),
      tags: Array.isArray(job.tags) ? job.tags : ['Remote'],
      url: job.url,
      source: 'Remotive',
      date: job.publication_date ? new Date(job.publication_date).toLocaleDateString('fr-FR') : 'Récent'
    }));
  } catch (err) {
    return [];
  }
}

/**
 * ORCHESTRATEUR PRINCIPAL MULTI-SOURCES :
 * Interroge en parallèle LinkedIn, France Travail, HelloWork, Météojob, Jooble, Indeed et Remotive
 */
async function scrapeJobs({ query, keywords = [], primaryTitle = '', location = '', departmentCode = '', geoRegion = 'all' }) {
  console.log(`\n[Scraper Multi-Sources] Démarrage de la collecte...`);

  // Terme nettoyé optimisé
  const rawTerm = primaryTitle || (keywords.length > 0 ? keywords[0] : query) || 'developpeur';
  const searchTerm = cleanSearchKeyword(rawTerm);

  // Résolution géographique précise (DROM, France, Europe)
  const isDrom = geoRegion === 'drom' || /reunion|réunion|guadeloupe|martinique|guyane|mayotte|974|971|972|973|976/i.test(location + ' ' + query);
  const isEurope = geoRegion === 'europe' || /europe|belgique|suisse|allemagne|espagne|angleterre|uk|luxembourg/i.test(location + ' ' + query);

  let ftCode = '';
  let standardLocation = 'France';

  if (isDrom) {
    if (/reunion|réunion|974/i.test(location + ' ' + query)) {
      ftCode = '974';
      standardLocation = 'La Réunion';
    } else if (/guadeloupe|971/i.test(location + ' ' + query)) {
      ftCode = '971';
      standardLocation = 'Guadeloupe';
    } else if (/martinique|972/i.test(location + ' ' + query)) {
      ftCode = '972';
      standardLocation = 'Martinique';
    } else if (/guyane|973/i.test(location + ' ' + query)) {
      ftCode = '973';
      standardLocation = 'Guyane';
    } else if (/mayotte|976/i.test(location + ' ' + query)) {
      ftCode = '976';
      standardLocation = 'Mayotte';
    } else {
      ftCode = departmentCode || '974';
      standardLocation = 'La Réunion';
    }
  } else if (isEurope) {
    standardLocation = location && location !== 'Europe' ? location : 'Europe';
  } else {
    standardLocation = location || 'France';
    if (departmentCode) {
      ftCode = departmentCode.endsWith('D') ? departmentCode : `${departmentCode}D`;
    } else {
      // Détection heuristique de repli si le code département n'a pas été fourni
      const deptMatch = (standardLocation + ' ' + query).match(/\b([0-8][0-9]|2[AB])\b/);
      if (deptMatch) {
        ftCode = `${deptMatch[1]}D`;
      }
    }
  }

  // Terme optimisé pour Indeed (inclut la ville spécifique si définie)
  const isSpecificCity = standardLocation && standardLocation !== 'France' && standardLocation !== 'Europe' && standardLocation !== 'all';
  const indeedWord = isSpecificCity ? `${searchTerm} ${standardLocation}` : (isDrom ? `${searchTerm} ${standardLocation}` : searchTerm);

  // Configuration ciblée pour le scraper LinkedIn
  const qLower = (query || '').toLowerCase();
  let linkedInJobType = null;
  if (/\bcdi\b|temps plein/i.test(qLower)) linkedInJobType = 'F';
  else if (/\bfreelance\b|\bcontractuel\b|\bindependant\b/i.test(qLower)) linkedInJobType = 'C';
  else if (/\bstage\b|\balternance\b/i.test(qLower)) linkedInJobType = 'I';

  let linkedInTimeFilter = null;
  if (/24h|1 jour|derni[eè]res heures/i.test(qLower)) linkedInTimeFilter = 'r86400';
  else if (/semaine|7 jours/i.test(qLower)) linkedInTimeFilter = 'r604800';

  let linkedInWorkplaceType = null;
  if (/t[eé]l[eé]travail|remote|full remote/i.test(qLower)) linkedInWorkplaceType = '2';
  else if (/hybride/i.test(qLower)) linkedInWorkplaceType = '3';

  const linkedInConfig = {
    keywords: searchTerm,
    location: isDrom ? standardLocation.replace('La ', '') : standardLocation,
    limit: 25,
    f_JT: linkedInJobType,
    f_TPR: linkedInTimeFilter,
    f_WT: linkedInWorkplaceType
  };

  // Configuration ciblée pour France Travail
  let ftNatureContrat = null;
  if (/\bcdi\b|temps plein/i.test(qLower)) ftNatureContrat = 'E1';
  else if (/\bcdd\b/i.test(qLower)) ftNatureContrat = 'E2';
  else if (/\bint[eé]rim\b|\bmission\b/i.test(qLower)) ftNatureContrat = 'E3';

  const franceTravailConfig = {
    motsCles: searchTerm,
    lieux: ftCode,
    natureContrat: ftNatureContrat,
    tri: '1',
    limit: 25
  };

  // Lancement concurrent de TOUS les scrapers
  const scrapersToRun = [
    // 1. France Travail (Module générique en couches avec retry mots-clés)
    scrapeFranceTravail(franceTravailConfig),

    // 2. LinkedIn (France, DROM ou Europe - Module générique)
    scrapeLinkedIn(linkedInConfig),

    // 3. HelloWork (France & DROM)
    scrapeHellowork(searchTerm, standardLocation, 25),

    // 4. Météojob (France & DROM)
    scrapeMeteojob(searchTerm, standardLocation, 20),

    // 5. Jooble (API avec clé si dispo)
    scrapeJooble(searchTerm, standardLocation, 20),

    // 6. Indeed (Utilise https://fr.indeed.com/jobs?q=[searchWord])
    scrapeIndeed(indeedWord, standardLocation, 25),
  ];

  // 7. Remotive (Si Europe ou Tous)
  if (isEurope || geoRegion === 'all') {
    scrapersToRun.push(scrapeRemotive(searchTerm, 20));
  }

  const results = await Promise.allSettled(scrapersToRun);
  const allJobs = [];

  results.forEach(res => {
    if (res.status === 'fulfilled' && Array.isArray(res.value)) {
      allJobs.push(...res.value);
    }
  });

  // Déduplication intelligente
  const seenSignatures = new Set();
  const seenUrls = new Set();
  const uniqueJobs = [];

  for (const job of allJobs) {
    const signature = `${(job.title || '').toLowerCase()}|${(job.company || '').toLowerCase()}`;
    if (job.url && seenUrls.has(job.url)) continue;
    if (seenSignatures.has(signature)) continue;

    if (job.url) seenUrls.add(job.url);
    seenSignatures.add(signature);
    uniqueJobs.push(job);
  }

  console.log(`[Scraper Multi-Sources] ✅ Total: ${uniqueJobs.length} offres consolidées.`);
  return uniqueJobs;
}

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

module.exports = {
  scrapeJobs,
  scrapeFranceTravail,
  scrapeFranceTravailJobs,
  scrapeLinkedIn,
  scrapeLinkedInJobs,
  scrapeHellowork,
  scrapeMeteojob,
  scrapeJooble,
  scrapeIndeed
};
