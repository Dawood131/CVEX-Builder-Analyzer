/* ================================================
   CVEX AI Analyzer Engine — Real Scoring Algorithm
   Separate module (second engine), not part of builder
   
   Analyzes CV data against job descriptions and industry
   standards. Returns structured scoring object.
   ================================================ */

const AnalyzerEngine = (() => {

  // ---- Industry keyword databases ----
  const INDUSTRY_KEYWORDS = {
    technology: {
      technical: ['javascript','python','java','react','node','typescript','aws','docker','kubernetes','sql','mongodb','git','ci/cd','rest','api','agile','scrum','devops','microservices','cloud','graphql','redis','linux','html','css','angular','vue','swift','kotlin','machine learning','data science','algorithms','data structures','tensorflow','pytorch','golang','rust','c++','php','ruby','rails','django','flask','express','next.js','terraform','jenkins'],
      soft: ['problem solving','teamwork','communication','leadership','mentoring','collaboration','analytical','critical thinking','innovation','adaptability','project management','time management'],
      action: ['developed','implemented','architected','engineered','optimized','deployed','automated','designed','built','created','led','managed','mentored','scaled','improved','reduced','increased','launched','delivered','integrated','refactored','migrated','streamlined']
    },
    finance: {
      technical: ['financial analysis','financial modeling','excel','bloomberg','sql','python','risk management','portfolio management','derivatives','fixed income','equity','accounting','gaap','ifrs','budgeting','forecasting','valuation','m&a','due diligence','compliance','audit','tax','treasury','capital markets','quantitative analysis','statistics','vba','tableau','power bi','sap'],
      soft: ['analytical','attention to detail','communication','teamwork','problem solving','leadership','negotiation','presentation','client management','time management','strategic thinking','decision making'],
      action: ['analyzed','managed','advised','structured','evaluated','negotiated','executed','optimized','reported','presented','forecasted','audited','reconciled','assessed','developed','increased','reduced','streamlined','implemented','delivered']
    },
    marketing: {
      technical: ['seo','sem','ppc','google analytics','social media','content marketing','email marketing','crm','hubspot','salesforce','a/b testing','marketing automation','branding','market research','copywriting','google ads','facebook ads','campaign management','conversion optimization','funnel optimization','adobe creative suite','photoshop','figma','canva','wordpress','mailchimp','hootsuite'],
      soft: ['creativity','communication','storytelling','analytical','teamwork','leadership','project management','strategic thinking','adaptability','presentation','negotiation','customer focus'],
      action: ['launched','created','developed','managed','optimized','increased','grew','designed','executed','analyzed','implemented','drove','generated','led','coordinated','strategized','improved','boosted','delivered','established']
    },
    healthcare: {
      technical: ['patient care','electronic health records','ehr','hipaa','clinical research','medical terminology','cpr','bls','acls','epic','cerner','pharmaceutical','diagnosis','treatment planning','infection control','quality assurance','regulatory compliance','clinical trials','telemedicine','public health','epidemiology','biostatistics'],
      soft: ['empathy','communication','teamwork','attention to detail','problem solving','adaptability','compassion','patience','leadership','critical thinking','time management','stress management'],
      action: ['diagnosed','treated','managed','administered','coordinated','assessed','monitored','implemented','educated','collaborated','improved','reduced','documented','developed','led','supervised','trained','evaluated','delivered','maintained']
    },
    general: {
      technical: ['microsoft office','excel','powerpoint','word','project management','data analysis','crm','erp','communication','presentation','reporting','budgeting','scheduling','research','quality assurance','process improvement'],
      soft: ['leadership','teamwork','communication','problem solving','analytical','organized','detail oriented','adaptability','time management','customer service','initiative','strategic thinking','negotiation','interpersonal','multitasking'],
      action: ['managed','led','developed','created','implemented','improved','increased','reduced','achieved','delivered','coordinated','organized','supervised','trained','mentored','established','streamlined','launched','executed','designed']
    }
  };

  // ATS formatting rules
  const ATS_RULES = {
    requiredSections: ['personal', 'experience', 'education', 'skills'],
    recommendedSections: ['summary', 'certifications', 'projects'],
    optimalSummaryLength: { min: 50, max: 300 },
    optimalExperienceEntries: { min: 2, max: 8 },
    optimalSkillCount: { min: 6, max: 20 },
    optimalBulletLength: { min: 30, max: 150 },
    actionVerbImportance: 0.85,
    quantificationBonus: 0.15,
    dateConsistency: true,
    contactInfoRequired: ['email', 'phone'],
    contactInfoRecommended: ['linkedin', 'website', 'city']
  };

  // ---- Utility functions ----
  function tokenize(text) {
    if (!text) return [];
    return text.toLowerCase()
      .replace(/[^a-z0-9\s\+\#\.\/\-]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 1);
  }

  function extractNgrams(tokens, n) {
    const grams = [];
    for (let i = 0; i <= tokens.length - n; i++) {
      grams.push(tokens.slice(i, i + n).join(' '));
    }
    return grams;
  }

  function getAllTextFromCV(cvData) {
    const parts = [];
    const p = cvData.personal || {};
    parts.push(p.firstName, p.lastName, p.title, p.summary);
    
    (cvData.experience || []).forEach(e => {
      parts.push(e.position, e.company, e.description, e.location);
      (e.highlights || []).forEach(h => parts.push(h));
    });
    
    (cvData.education || []).forEach(e => {
      parts.push(e.degree, e.institution, e.field, e.description);
    });
    
    (cvData.skills || []).forEach(s => {
      parts.push(s.name, s.category);
      if (Array.isArray(s.items)) s.items.forEach(i => parts.push(i));
    });
    
    (cvData.projects || []).forEach(p => {
      parts.push(p.name, p.description, p.technologies, p.url);
    });
    
    (cvData.certifications || []).forEach(c => {
      parts.push(c.name, c.issuer, c.description);
    });
    
    (cvData.languages || []).forEach(l => parts.push(l.name, l.level));
    (cvData.awards || []).forEach(a => parts.push(a.name, a.issuer, a.description));
    (cvData.hobbies || []).forEach(h => parts.push(h.name || h));
    (cvData.references || []).forEach(r => parts.push(r.name, r.title, r.company));
    
    (cvData.customSections || []).forEach(cs => {
      parts.push(cs.name);
      (cs.entries || []).forEach(e => parts.push(e.title, e.description));
    });

    return parts.filter(Boolean).join(' ');
  }

  function countQuantifiedStatements(text) {
    const quantPattern = /(\d+[\%\+]?|[$€£]\d+|\d+x|\d+\s*(percent|million|billion|thousand|hundred|users|clients|customers|team|members|projects|years))/gi;
    const matches = text.match(quantPattern);
    return matches ? matches.length : 0;
  }

  function extractActionVerbs(text, industry) {
    const db = INDUSTRY_KEYWORDS[industry] || INDUSTRY_KEYWORDS.general;
    const tokens = tokenize(text);
    return db.action.filter(verb => tokens.includes(verb.toLowerCase()));
  }

  // ---- Scoring Modules ----

  /** Content Score (0–100): evaluates completeness and quality of CV content */
  function scoreContent(cvData) {
    let score = 0;
    const details = [];
    const personal = cvData.personal || {};

    // Contact info completeness (15 pts)
    let contactPts = 0;
    if (personal.firstName && personal.lastName) contactPts += 3;
    else details.push({ type: 'error', msg: 'Missing full name' });
    
    if (personal.email) contactPts += 3;
    else details.push({ type: 'error', msg: 'Missing email address' });
    
    if (personal.phone) contactPts += 3;
    else details.push({ type: 'error', msg: 'Missing phone number' });
    
    if (personal.title) contactPts += 2;
    else details.push({ type: 'warning', msg: 'Missing professional title/headline' });
    
    if (personal.city || personal.address) contactPts += 2;
    else details.push({ type: 'info', msg: 'Consider adding location' });
    
    if (personal.linkedin) contactPts += 1;
    else details.push({ type: 'info', msg: 'LinkedIn profile recommended' });
    
    if (personal.website) contactPts += 1;
    else details.push({ type: 'info', msg: 'Portfolio/website recommended' });
    
    score += Math.min(15, contactPts);

    // Summary (10 pts)
    const summary = personal.summary || '';
    const summaryLen = summary.trim().length;
    if (summaryLen >= ATS_RULES.optimalSummaryLength.min && summaryLen <= ATS_RULES.optimalSummaryLength.max) {
      score += 10;
    } else if (summaryLen > 0 && summaryLen < ATS_RULES.optimalSummaryLength.min) {
      score += 5;
      details.push({ type: 'warning', msg: 'Summary too short (' + summaryLen + ' chars). Aim for ' + ATS_RULES.optimalSummaryLength.min + '-' + ATS_RULES.optimalSummaryLength.max + ' characters.' });
    } else if (summaryLen > ATS_RULES.optimalSummaryLength.max) {
      score += 7;
      details.push({ type: 'info', msg: 'Summary is lengthy (' + summaryLen + ' chars). Consider trimming to ' + ATS_RULES.optimalSummaryLength.max + ' characters.' });
    } else {
      details.push({ type: 'error', msg: 'Missing professional summary' });
    }

    // Experience (30 pts)
    const exp = cvData.experience || [];
    if (exp.length >= ATS_RULES.optimalExperienceEntries.min) {
      let expScore = Math.min(15, exp.length * 3);
      
      // Quality of experience entries
      let totalBullets = 0;
      let goodBullets = 0;
      exp.forEach(entry => {
        if (entry.position) expScore += 0.5;
        if (entry.company) expScore += 0.5;
        if (entry.startDate) expScore += 0.5;
        const desc = entry.description || '';
        const bullets = desc.split(/\n|•|●|▪/).filter(b => b.trim().length > 0);
        totalBullets += bullets.length;
        bullets.forEach(b => {
          const len = b.trim().length;
          if (len >= ATS_RULES.optimalBulletLength.min && len <= ATS_RULES.optimalBulletLength.max) goodBullets++;
        });
      });
      
      if (totalBullets > 0) {
        expScore += Math.min(10, (goodBullets / totalBullets) * 10);
      }
      score += Math.min(30, expScore);
    } else if (exp.length === 1) {
      score += 12;
      details.push({ type: 'warning', msg: 'Only 1 experience entry. Add more work history for better results.' });
    } else {
      details.push({ type: 'error', msg: 'No work experience entries found' });
    }

    // Education (15 pts)
    const edu = cvData.education || [];
    if (edu.length > 0) {
      let eduScore = Math.min(8, edu.length * 4);
      edu.forEach(entry => {
        if (entry.degree) eduScore += 1;
        if (entry.institution) eduScore += 1;
        if (entry.field) eduScore += 0.5;
        if (entry.startDate || entry.endDate) eduScore += 0.5;
      });
      score += Math.min(15, eduScore);
    } else {
      details.push({ type: 'error', msg: 'No education entries found' });
    }

    // Skills (15 pts)
    const skills = cvData.skills || [];
    const skillCount = skills.reduce((sum, s) => sum + (Array.isArray(s.items) ? s.items.length : 1), 0) || skills.length;
    if (skillCount >= ATS_RULES.optimalSkillCount.min) {
      score += Math.min(15, 8 + Math.min(7, (skillCount - 6) * 0.7));
    } else if (skillCount > 0) {
      score += skillCount * 1.5;
      details.push({ type: 'warning', msg: 'Only ' + skillCount + ' skills listed. Aim for ' + ATS_RULES.optimalSkillCount.min + '-' + ATS_RULES.optimalSkillCount.max + '.' });
    } else {
      details.push({ type: 'error', msg: 'No skills section found' });
    }

    // Optional sections bonus (15 pts)
    let optBonus = 0;
    if ((cvData.projects || []).length > 0) optBonus += 3;
    if ((cvData.certifications || []).length > 0) optBonus += 3;
    if ((cvData.languages || []).length > 0) optBonus += 2;
    if ((cvData.awards || []).length > 0) optBonus += 2;
    if ((cvData.references || []).length > 0) optBonus += 2;
    if ((cvData.hobbies || []).length > 0) optBonus += 1;
    if ((cvData.customSections || []).length > 0) optBonus += 2;
    score += Math.min(15, optBonus);

    return { score: Math.round(Math.min(100, score)), details };
  }

  /** ATS Compatibility Score (0–100) */
  function scoreATS(cvData) {
    let score = 0;
    const details = [];
    const personal = cvData.personal || {};

    // Standard sections present (30 pts)
    let sectionPts = 0;
    ATS_RULES.requiredSections.forEach(sec => {
      if (sec === 'personal') {
        if (personal.firstName || personal.lastName) sectionPts += 7.5;
        else details.push({ type: 'error', msg: 'ATS: Missing personal information section' });
      } else if (sec === 'experience' && (cvData.experience || []).length > 0) {
        sectionPts += 7.5;
      } else if (sec === 'education' && (cvData.education || []).length > 0) {
        sectionPts += 7.5;
      } else if (sec === 'skills' && (cvData.skills || []).length > 0) {
        sectionPts += 7.5;
      } else {
        details.push({ type: 'error', msg: 'ATS: Missing "' + sec + '" section — most ATS systems look for this' });
      }
    });
    score += sectionPts;

    // Contact info format (15 pts)
    let contactATS = 0;
    if (personal.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(personal.email)) contactATS += 5;
    else if (personal.email) { contactATS += 2; details.push({ type: 'warning', msg: 'Email format may not parse correctly in ATS' }); }
    else details.push({ type: 'error', msg: 'ATS requires an email address' });

    if (personal.phone && /[\d\(\)\+\-\s]{7,}/.test(personal.phone)) contactATS += 5;
    else details.push({ type: 'warning', msg: 'ATS requires a phone number' });

    if (personal.linkedin) contactATS += 3;
    if (personal.city || personal.country) contactATS += 2;
    score += Math.min(15, contactATS);

    // Date formatting (10 pts)
    let dateScore = 10;
    (cvData.experience || []).forEach(e => {
      if (!e.startDate) dateScore -= 1;
    });
    (cvData.education || []).forEach(e => {
      if (!e.startDate && !e.endDate) dateScore -= 1;
    });
    score += Math.max(0, dateScore);

    // Formatting cleanliness (20 pts)
    let formatScore = 20;
    const design = cvData.design || {};
    
    // Standard fonts are ATS-safe
    const atsSafeFonts = ['inter', 'arial', 'helvetica', 'georgia', 'times new roman', 'courier new', 'plus jakarta sans'];
    if (!atsSafeFonts.includes((design.fontFamily || '').toLowerCase())) {
      formatScore -= 3;
      details.push({ type: 'info', msg: 'Consider using a standard font for better ATS parsing' });
    }
    
    // Font size check
    if (design.fontSize && (design.fontSize < 10 || design.fontSize > 14)) {
      formatScore -= 2;
      details.push({ type: 'info', msg: 'Font size 10-14pt is optimal for ATS readability' });
    }
    
    // Single column is better for ATS
    if (design.layout === 'sidebar') {
      formatScore -= 4;
      details.push({ type: 'warning', msg: 'Two-column layouts may not parse well in some ATS systems' });
    }
    
    score += Math.max(0, formatScore);

    // Section order (10 pts)
    const order = cvData.sectionOrder || [];
    const expectedOrder = ['personal', 'summary', 'experience', 'education', 'skills'];
    let orderScore = 0;
    expectedOrder.forEach((sec, idx) => {
      const actualIdx = order.indexOf(sec);
      if (actualIdx !== -1 && actualIdx <= idx + 2) orderScore += 2;
    });
    score += orderScore;

    // Completeness of descriptions (15 pts)
    let descScore = 0;
    const allText = getAllTextFromCV(cvData);
    const wordCount = tokenize(allText).length;
    if (wordCount >= 200) descScore += 8;
    else if (wordCount >= 100) descScore += 5;
    else details.push({ type: 'warning', msg: 'CV content may be too brief for ATS ranking' });

    // Check for quantified achievements
    const quantCount = countQuantifiedStatements(allText);
    if (quantCount >= 5) descScore += 7;
    else if (quantCount >= 2) descScore += 4;
    else {
      descScore += 1;
      details.push({ type: 'warning', msg: 'Add more quantified achievements (numbers, percentages, metrics)' });
    }
    score += Math.min(15, descScore);

    return { score: Math.round(Math.min(100, score)), details };
  }

  /** Keyword Score (0–100): match against job description and industry */
  function scoreKeywords(cvData, jobDescription, industry) {
    const details = [];
    const db = INDUSTRY_KEYWORDS[industry] || INDUSTRY_KEYWORDS.general;
    const cvText = getAllTextFromCV(cvData).toLowerCase();
    const cvTokens = tokenize(cvText);
    const cvBigrams = extractNgrams(cvTokens, 2);
    const cvTrigrams = extractNgrams(cvTokens, 3);
    const allCvTerms = [...cvTokens, ...cvBigrams, ...cvTrigrams];

    let score = 0;
    const matchedKeywords = [];
    const missingKeywords = [];

    // Match against industry technical keywords (50 pts)
    let techMatches = 0;
    db.technical.forEach(keyword => {
      const kw = keyword.toLowerCase();
      if (cvText.includes(kw) || allCvTerms.includes(kw)) {
        techMatches++;
        matchedKeywords.push({ keyword, type: 'technical', source: 'industry' });
      }
    });
    const techScore = Math.min(50, (techMatches / Math.min(db.technical.length, 15)) * 50);
    score += techScore;

    // Match against industry soft skills (15 pts)
    let softMatches = 0;
    db.soft.forEach(keyword => {
      const kw = keyword.toLowerCase();
      if (cvText.includes(kw)) {
        softMatches++;
        matchedKeywords.push({ keyword, type: 'soft_skill', source: 'industry' });
      }
    });
    score += Math.min(15, (softMatches / Math.min(db.soft.length, 8)) * 15);

    // Action verbs usage (15 pts)
    const actionVerbs = extractActionVerbs(cvText, industry);
    const actionScore = Math.min(15, (actionVerbs.length / 8) * 15);
    score += actionScore;
    actionVerbs.forEach(v => matchedKeywords.push({ keyword: v, type: 'action_verb', source: 'industry' }));

    // Job description matching (20 pts)
    if (jobDescription && jobDescription.trim().length > 0) {
      const jdTokens = tokenize(jobDescription);
      const jdBigrams = extractNgrams(jdTokens, 2);
      const jdTerms = [...new Set([...jdTokens, ...jdBigrams])];
      
      // Filter common stop words
      const stopWords = new Set(['the','a','an','and','or','but','in','on','at','to','for','of','with','by','from','as','is','was','are','were','be','been','being','have','has','had','do','does','did','will','would','shall','should','may','might','can','could','this','that','these','those','i','we','you','he','she','it','they','my','our','your','his','her','its','their','me','us','him','them','what','which','who','whom','when','where','why','how','all','each','every','both','few','more','most','other','some','such','no','not','only','own','same','so','than','too','very','just','because','also','about','into','through','during','before','after','above','below','between','under','again','further','then','once','here','there','any','many','much','if','while','until','unless','although','since','even','still','etc','per','via']);
      const meaningfulJdTerms = jdTerms.filter(t => !stopWords.has(t) && t.length > 2);

      let jdMatches = 0;
      meaningfulJdTerms.forEach(term => {
        if (cvText.includes(term) || allCvTerms.includes(term)) {
          jdMatches++;
          if (!matchedKeywords.find(m => m.keyword.toLowerCase() === term)) {
            matchedKeywords.push({ keyword: term, type: 'job_match', source: 'job_description' });
          }
        } else {
          missingKeywords.push({ keyword: term, type: 'job_match', source: 'job_description' });
        }
      });

      const jdScore = meaningfulJdTerms.length > 0 
        ? Math.min(20, (jdMatches / meaningfulJdTerms.length) * 20) 
        : 10; // baseline if no JD
      score += jdScore;
    } else {
      score += 10; // baseline without JD
      details.push({ type: 'info', msg: 'Add a job description for more accurate keyword matching' });
    }

    // Find missing industry keywords
    db.technical.forEach(kw => {
      if (!cvText.includes(kw.toLowerCase()) && !missingKeywords.find(m => m.keyword === kw)) {
        missingKeywords.push({ keyword: kw, type: 'technical', source: 'industry' });
      }
    });

    // Limit missing keywords to most relevant
    const topMissing = missingKeywords.slice(0, 20);

    if (techMatches < 5) details.push({ type: 'warning', msg: 'Only ' + techMatches + ' industry-relevant technical keywords found. Consider adding more.' });
    if (actionVerbs.length < 4) details.push({ type: 'warning', msg: 'Use more action verbs to describe your achievements' });

    return { 
      score: Math.round(Math.min(100, score)), 
      details, 
      matchedKeywords: matchedKeywords.slice(0, 30),
      missingKeywords: topMissing
    };
  }

  /** Formatting Score (0–100) */
  function scoreFormatting(cvData) {
    let score = 0;
    const details = [];
    const design = cvData.design || {};

    // Font choice (15 pts)
    const professionalFonts = ['inter', 'arial', 'helvetica', 'plus jakarta sans', 'georgia'];
    if (professionalFonts.includes((design.fontFamily || '').toLowerCase())) {
      score += 15;
    } else {
      score += 8;
      details.push({ type: 'info', msg: 'Consider using a professional font like Inter or Arial' });
    }

    // Font size (10 pts)
    const fs = design.fontSize || 14;
    if (fs >= 10 && fs <= 14) score += 10;
    else if (fs >= 9 && fs <= 16) { score += 6; details.push({ type: 'warning', msg: 'Font size should be 10-14pt for optimal readability' }); }
    else { score += 2; details.push({ type: 'error', msg: 'Font size is not within readable range' }); }

    // Line height (10 pts)
    const lh = design.lineHeight || 1.5;
    if (lh >= 1.3 && lh <= 1.7) score += 10;
    else if (lh >= 1.1 && lh <= 2.0) { score += 6; details.push({ type: 'info', msg: 'Line height 1.3-1.7 is optimal' }); }
    else score += 2;

    // Color professionalism (15 pts)
    score += 15; // All themes are predefined and professional

    // Layout consistency (15 pts)
    const order = cvData.sectionOrder || [];
    if (order.length >= 4) score += 10;
    else score += 5;
    
    // Enabled sections ratio
    const enabled = cvData.enabledSections || {};
    const enabledCount = Object.values(enabled).filter(Boolean).length;
    if (enabledCount >= 5) score += 5;
    else score += 3;

    // Content balance (20 pts)
    const exp = cvData.experience || [];
    const edu = cvData.education || [];
    let balanceScore = 0;
    
    if (exp.length > 0) {
      const hasDescriptions = exp.filter(e => (e.description || '').trim().length > 20).length;
      balanceScore += Math.min(10, (hasDescriptions / exp.length) * 10);
    }
    
    if (edu.length > 0) balanceScore += 5;
    if ((cvData.personal || {}).summary) balanceScore += 5;
    score += Math.min(20, balanceScore);

    // Section spacing (5 pts)
    const spacing = design.sectionSpacing || 16;
    if (spacing >= 12 && spacing <= 24) score += 5;
    else score += 3;

    // Photo consideration (10 pts)
    if (design.showPhoto && (cvData.personal || {}).photo) {
      score += 7;
      details.push({ type: 'info', msg: 'Note: Some ATS systems may not process photos. Consider removing for US/UK applications.' });
    } else {
      score += 10; // No photo is actually better for ATS
    }

    return { score: Math.round(Math.min(100, score)), details };
  }

  /** Grammar/Writing Score (0–100): heuristic-based checks */
  function scoreGrammar(cvData) {
    let score = 70; // baseline
    const details = [];
    const allText = getAllTextFromCV(cvData);

    if (allText.length < 50) {
      return { score: 0, details: [{ type: 'error', msg: 'Not enough content to evaluate writing quality' }] };
    }

    // Check for common issues
    const sentences = allText.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    // Sentence variety (10 pts)
    const avgLen = sentences.reduce((sum, s) => sum + s.trim().split(/\s+/).length, 0) / Math.max(sentences.length, 1);
    if (avgLen >= 8 && avgLen <= 25) score += 10;
    else if (avgLen >= 5) score += 5;
    else details.push({ type: 'info', msg: 'Vary sentence length for better readability' });

    // Check for repetitive words (5 pts)
    const words = tokenize(allText);
    const wordFreq = {};
    words.forEach(w => { wordFreq[w] = (wordFreq[w] || 0) + 1; });
    const repeatedWords = Object.entries(wordFreq).filter(([w, c]) => c > 5 && w.length > 4);
    if (repeatedWords.length <= 2) score += 5;
    else {
      score += 2;
      details.push({ type: 'info', msg: 'Some words are overused: ' + repeatedWords.slice(0, 3).map(function(pair) { return '"' + pair[0] + '"'; }).join(', ') });
    }

    // First-person usage (5 pts)
    const firstPerson = (allText.match(/\b(i |my |me |myself)\b/gi) || []).length;
    if (firstPerson === 0) score += 5;
    else if (firstPerson <= 3) score += 3;
    else {
      details.push({ type: 'warning', msg: 'Avoid first-person pronouns (I, my, me) in CV. Use action verbs instead.' });
    }

    // Capitalization consistency (5 pts)
    const personal = cvData.personal || {};
    let capScore = 5;
    if (personal.firstName && personal.firstName[0] !== personal.firstName[0].toUpperCase()) capScore -= 2;
    if (personal.lastName && personal.lastName[0] !== personal.lastName[0].toUpperCase()) capScore -= 2;
    score += Math.max(0, capScore);

    // Quantified achievements (5 pts)
    const quantCount = countQuantifiedStatements(allText);
    if (quantCount >= 3) score += 5;
    else if (quantCount >= 1) score += 3;
    else details.push({ type: 'warning', msg: 'Add quantified achievements (e.g., "Increased revenue by 35%")' });

    return { score: Math.round(Math.min(100, score)), details };
  }

  /** Impact Metrics — analyze quality of achievement statements */
  function analyzeImpact(cvData) {
    const allText = getAllTextFromCV(cvData);
    const exp = cvData.experience || [];
    
    let totalStatements = 0;
    let quantified = 0;
    let actionLed = 0;
    let resultOriented = 0;
    
    const resultWords = ['increased','decreased','improved','reduced','achieved','delivered','generated','saved','grew','launched','earned','won','exceeded','surpassed','doubled','tripled'];
    
    exp.forEach(entry => {
      const desc = entry.description || '';
      const bullets = desc.split(/\n|•|●|▪/).filter(b => b.trim().length > 10);
      totalStatements += bullets.length;
      
      bullets.forEach(b => {
        const lower = b.toLowerCase();
        if (/\d+/.test(b)) quantified++;
        if (resultWords.some(w => lower.includes(w))) resultOriented++;
        const firstWord = tokenize(lower)[0] || '';
        const allActions = [].concat(...Object.values(INDUSTRY_KEYWORDS).map(db => db.action));
        if (allActions.includes(firstWord)) actionLed++;
      });
    });

    return {
      totalStatements,
      quantified,
      quantifiedPct: totalStatements > 0 ? Math.round((quantified / totalStatements) * 100) : 0,
      actionLed,
      actionLedPct: totalStatements > 0 ? Math.round((actionLed / totalStatements) * 100) : 0,
      resultOriented,
      resultOrientedPct: totalStatements > 0 ? Math.round((resultOriented / totalStatements) * 100) : 0
    };
  }

  /** Section Breakdown — per-section analysis */
  function analyzeSections(cvData) {
    const sections = {};
    const personal = cvData.personal || {};

    // Personal
    let personalScore = 0;
    const personalFields = ['firstName','lastName','email','phone','title','city','linkedin'];
    const filledPersonal = personalFields.filter(f => personal[f] && String(personal[f]).trim().length > 0);
    personalScore = Math.round((filledPersonal.length / personalFields.length) * 100);
    sections.personal = {
      name: 'Personal Info',
      score: personalScore,
      filled: filledPersonal.length,
      total: personalFields.length,
      suggestions: []
    };
    if (!personal.linkedin) sections.personal.suggestions.push('Add LinkedIn profile URL');
    if (!personal.title) sections.personal.suggestions.push('Add a professional title/headline');

    // Summary
    const summaryLen = (personal.summary || '').trim().length;
    let summaryScore = 0;
    if (summaryLen >= 50 && summaryLen <= 300) summaryScore = 100;
    else if (summaryLen > 0) summaryScore = Math.min(80, Math.round((summaryLen / 50) * 80));
    sections.summary = {
      name: 'Professional Summary',
      score: summaryScore,
      length: summaryLen,
      suggestions: []
    };
    if (summaryLen === 0) sections.summary.suggestions.push('Write a compelling 2-3 sentence professional summary');
    else if (summaryLen < 50) sections.summary.suggestions.push('Expand your summary to at least 50 characters');

    // Experience
    const exp = cvData.experience || [];
    let expScore = 0;
    if (exp.length >= 2) expScore += 40;
    else if (exp.length === 1) expScore += 20;
    
    const withDesc = exp.filter(e => (e.description || '').trim().length > 20);
    if (exp.length > 0) expScore += Math.round((withDesc.length / exp.length) * 40);
    
    const withDates = exp.filter(e => e.startDate);
    if (exp.length > 0) expScore += Math.round((withDates.length / exp.length) * 20);
    
    sections.experience = {
      name: 'Work Experience',
      score: Math.min(100, expScore),
      count: exp.length,
      suggestions: []
    };
    if (exp.length === 0) sections.experience.suggestions.push('Add at least 2-3 relevant work experiences');
    if (withDesc.length < exp.length) sections.experience.suggestions.push('Add detailed descriptions with bullet points for all roles');

    // Education
    const edu = cvData.education || [];
    let eduScore = edu.length > 0 ? 60 : 0;
    const withDegree = edu.filter(e => e.degree);
    if (edu.length > 0) eduScore += Math.round((withDegree.length / edu.length) * 40);
    sections.education = {
      name: 'Education',
      score: Math.min(100, eduScore),
      count: edu.length,
      suggestions: []
    };
    if (edu.length === 0) sections.education.suggestions.push('Add your educational background');

    // Skills
    const skills = cvData.skills || [];
    const skillCount = skills.reduce((sum, s) => sum + (Array.isArray(s.items) ? s.items.length : 1), 0) || skills.length;
    let skillScore = Math.min(100, skillCount * 8);
    sections.skills = {
      name: 'Skills',
      score: skillScore,
      count: skillCount,
      suggestions: []
    };
    if (skillCount < 6) sections.skills.suggestions.push('Add more relevant skills (aim for 8-15)');

    // Optional sections
    const optionalSections = [
      { key: 'projects', name: 'Projects' },
      { key: 'certifications', name: 'Certifications' },
      { key: 'languages', name: 'Languages' },
      { key: 'awards', name: 'Awards' },
    ];
    optionalSections.forEach(({ key, name }) => {
      const items = cvData[key] || [];
      sections[key] = {
        name,
        score: items.length > 0 ? Math.min(100, 50 + items.length * 15) : 0,
        count: items.length,
        suggestions: items.length === 0 ? ['Consider adding ' + name.toLowerCase() + ' if applicable'] : []
      };
    });

    return sections;
  }

  /** Skills Gap Radar — compare CV skills vs industry requirements */
  function analyzeSkillsGap(cvData, industry) {
    const db = INDUSTRY_KEYWORDS[industry] || INDUSTRY_KEYWORDS.general;
    const cvText = getAllTextFromCV(cvData).toLowerCase();
    
    const categories = {
      'Technical Skills': { matched: 0, total: Math.min(db.technical.length, 15), items: [] },
      'Soft Skills': { matched: 0, total: Math.min(db.soft.length, 10), items: [] },
      'Action Language': { matched: 0, total: Math.min(db.action.length, 12), items: [] },
      'Quantification': { matched: 0, total: 5, items: [] },
      'Completeness': { matched: 0, total: 7, items: [] }
    };

    // Technical
    db.technical.slice(0, 15).forEach(kw => {
      const found = cvText.includes(kw.toLowerCase());
      categories['Technical Skills'].items.push({ keyword: kw, found });
      if (found) categories['Technical Skills'].matched++;
    });

    // Soft
    db.soft.slice(0, 10).forEach(kw => {
      const found = cvText.includes(kw.toLowerCase());
      categories['Soft Skills'].items.push({ keyword: kw, found });
      if (found) categories['Soft Skills'].matched++;
    });

    // Action
    db.action.slice(0, 12).forEach(kw => {
      const found = cvText.includes(kw.toLowerCase());
      categories['Action Language'].items.push({ keyword: kw, found });
      if (found) categories['Action Language'].matched++;
    });

    // Quantification
    const quantCount = countQuantifiedStatements(cvText);
    categories['Quantification'].matched = Math.min(5, quantCount);
    categories['Quantification'].items = [
      { keyword: 'Percentages', found: /\d+%/.test(cvText) },
      { keyword: 'Dollar amounts', found: /[$€£]\d+/.test(cvText) },
      { keyword: 'Team sizes', found: /\d+\s*(team|members|people)/i.test(cvText) },
      { keyword: 'Time metrics', found: /\d+\s*(years?|months?|weeks?)/i.test(cvText) },
      { keyword: 'Growth metrics', found: /\d+x|\d+\s*times/i.test(cvText) }
    ];

    // Completeness
    const completeChecks = [
      { keyword: 'Contact Info', found: !!((cvData.personal || {}).email && (cvData.personal || {}).phone) },
      { keyword: 'Summary', found: !!((cvData.personal || {}).summary) },
      { keyword: 'Experience', found: (cvData.experience || []).length > 0 },
      { keyword: 'Education', found: (cvData.education || []).length > 0 },
      { keyword: 'Skills', found: (cvData.skills || []).length > 0 },
      { keyword: 'Dates', found: (cvData.experience || []).some(e => e.startDate) },
      { keyword: 'Descriptions', found: (cvData.experience || []).some(e => (e.description || '').length > 20) }
    ];
    categories['Completeness'].items = completeChecks;
    categories['Completeness'].matched = completeChecks.filter(c => c.found).length;

    // Convert to radar chart data
    const radarData = Object.entries(categories).map(([name, data]) => ({
      category: name,
      score: Math.round((data.matched / Math.max(data.total, 1)) * 100),
      matched: data.matched,
      total: data.total,
      items: data.items
    }));

    return radarData;
  }

  /** Generate prioritized suggestions */
  function generateSuggestions(cvData, contentResult, atsResult, keywordResult, formattingResult, grammarResult, industry) {
    const suggestions = [];
    const allDetails = [
      ...contentResult.details,
      ...atsResult.details,
      ...keywordResult.details,
      ...formattingResult.details,
      ...grammarResult.details
    ];

    // Deduplicate and prioritize
    const seen = new Set();
    allDetails.forEach(d => {
      if (!seen.has(d.msg)) {
        seen.add(d.msg);
        suggestions.push({
          priority: d.type === 'error' ? 'high' : d.type === 'warning' ? 'medium' : 'low',
          type: d.type,
          message: d.msg,
          category: d.msg.startsWith('ATS') ? 'ats' : 'general'
        });
      }
    });

    // Add strategic suggestions based on scores
    if (contentResult.score < 60) {
      suggestions.unshift({ priority: 'high', type: 'error', message: 'Your CV content needs significant improvement. Fill in all core sections.', category: 'content' });
    }
    if (atsResult.score < 60) {
      suggestions.unshift({ priority: 'high', type: 'error', message: 'ATS compatibility is low. Ensure standard sections and formatting.', category: 'ats' });
    }
    if (keywordResult.score < 50) {
      suggestions.unshift({ priority: 'high', type: 'warning', message: 'Add more ' + (industry || 'industry') + '-relevant keywords to improve match rate.', category: 'keywords' });
    }

    // Sort: high > medium > low
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    suggestions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    return suggestions.slice(0, 15);
  }

  // ============== MAIN ANALYZE FUNCTION ==============
  function analyze(cvData, options = {}) {
    const {
      jobDescription = '',
      industry = 'general',
      scanId = null
    } = options;

    if (!cvData || typeof cvData !== 'object') {
      return { error: 'Invalid CV data provided', overallScore: 0 };
    }

    // Run all scoring modules
    const contentResult = scoreContent(cvData);
    const atsResult = scoreATS(cvData);
    const keywordResult = scoreKeywords(cvData, jobDescription, industry);
    const formattingResult = scoreFormatting(cvData);
    const grammarResult = scoreGrammar(cvData);

    // Weighted overall score
    const weights = { content: 0.30, ats: 0.25, keywords: 0.20, formatting: 0.15, grammar: 0.10 };
    const overallScore = Math.round(
      contentResult.score * weights.content +
      atsResult.score * weights.ats +
      keywordResult.score * weights.keywords +
      formattingResult.score * weights.formatting +
      grammarResult.score * weights.grammar
    );

    // Section breakdown
    const sectionBreakdown = analyzeSections(cvData);

    // Impact metrics
    const impactMetrics = analyzeImpact(cvData);

    // Skills gap radar
    const skillsGapRadar = analyzeSkillsGap(cvData, industry);

    // Generate suggestions
    const suggestions = generateSuggestions(cvData, contentResult, atsResult, keywordResult, formattingResult, grammarResult, industry);

    // Grade letter
    let grade;
    if (overallScore >= 90) grade = 'A+';
    else if (overallScore >= 80) grade = 'A';
    else if (overallScore >= 70) grade = 'B+';
    else if (overallScore >= 60) grade = 'B';
    else if (overallScore >= 50) grade = 'C+';
    else if (overallScore >= 40) grade = 'C';
    else if (overallScore >= 30) grade = 'D';
    else grade = 'F';

    return {
      scanId: scanId || ('scan_' + Date.now().toString(36)),
      timestamp: Date.now(),
      overallScore,
      grade,
      contentScore: contentResult.score,
      atsScore: atsResult.score,
      keywordScore: keywordResult.score,
      formattingScore: formattingResult.score,
      grammarScore: grammarResult.score,
      suggestions,
      sectionBreakdown,
      impactMetrics,
      skillsGapRadar,
      matchedKeywords: keywordResult.matchedKeywords,
      missingKeywords: keywordResult.missingKeywords,
      contentDetails: contentResult.details,
      atsDetails: atsResult.details,
      keywordDetails: keywordResult.details,
      formattingDetails: formattingResult.details,
      grammarDetails: grammarResult.details,
      meta: {
        cvName: (cvData.meta || {}).cvName || 'Untitled',
        industry: industry,
        hasJobDescription: jobDescription.length > 0,
        analyzedAt: new Date().toISOString()
      },
      weights
    };
  }

  // Public API
  return {
    analyze,
    getIndustries: () => Object.keys(INDUSTRY_KEYWORDS),
    INDUSTRY_KEYWORDS,
    ATS_RULES
  };
})();

window.AnalyzerEngine = AnalyzerEngine;
