const GEMINI_API_KEY =
  import.meta.env?.VITE_GEMINI_API_KEY ||
  process.env?.REACT_APP_GEMINI_API_KEY ||
  "";

const GEMINI_MODEL = "gemini-2.5-flash"; // fast + cheap, good for structured tasks
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

// ── Industry list (kept client-side — no AI needed for this) ─────────────────
export const INDUSTRIES = [
  "technology", "finance", "marketing", "healthcare",
  "education", "engineering", "design", "sales", "hr", "legal", "general",
];

export function getIndustries() {
  return INDUSTRIES;
}

// ── CV → plain text for the prompt ───────────────────────────────────────────
function cvToText(cvData) {
  // If this is a PDF upload, use the raw extracted text directly
  if (cvData._pdfText) {
    return cvData._pdfText;
  }

  const p = cvData.personal || {};
  const lines = [];

  lines.push("=== PERSONAL INFO ===");
  if (p.firstName || p.lastName)
    lines.push(`Name: ${`${p.firstName || ""} ${p.lastName || ""}`.trim()}`);
  if (p.title) lines.push(`Title: ${p.title}`);
  if (p.email) lines.push(`Email: ${p.email}`);
  if (p.phone) lines.push(`Phone: ${p.phone}`);
  if (p.city) lines.push(`City: ${p.city}`);
  if (p.country) lines.push(`Country: ${p.country}`);
  if (p.linkedin) lines.push(`LinkedIn: ${p.linkedin}`);
  if (p.github) lines.push(`GitHub: ${p.github}`);
  if (p.website) lines.push(`Website: ${p.website}`);

  if (p.summary) {
    lines.push("\n=== PROFESSIONAL SUMMARY ===");
    lines.push(p.summary);
  }

  // Experience
  if ((cvData.experience || []).length > 0) {
    lines.push("\n=== WORK EXPERIENCE ===");
    cvData.experience.forEach((e, i) => {
      lines.push(`\n[${i + 1}] ${e.position || "Unknown Role"} at ${e.company || "Unknown Company"}`);
      if (e.startDate || e.endDate)
        lines.push(`    Dates: ${e.startDate || ""} – ${e.current ? "Present" : e.endDate || ""}`);
      if (e.city) lines.push(`    Location: ${e.city}`);
      if (e.type) lines.push(`    Type: ${e.type}`);
      if (e.description) lines.push(`    Description:\n${e.description}`);
    });
  }

  // Education
  if ((cvData.education || []).length > 0) {
    lines.push("\n=== EDUCATION ===");
    cvData.education.forEach((e, i) => {
      lines.push(`\n[${i + 1}] ${e.degree || "Degree"} – ${e.school || e.institution || "School"}`);
      if (e.field) lines.push(`    Field: ${e.field}`);
      if (e.startDate || e.endDate)
        lines.push(`    Dates: ${e.startDate || ""} – ${e.current ? "Present" : e.endDate || ""}`);
      if (e.gpa) lines.push(`    GPA: ${e.gpa}`);
      if (e.description) lines.push(`    Notes: ${e.description}`);
    });
  }

  // Skills
  if ((cvData.skills || []).length > 0) {
    lines.push("\n=== SKILLS ===");
    cvData.skills.forEach((s) => {
      if (Array.isArray(s.items)) {
        lines.push(`${s.name || s.category || "Skills"}: ${s.items.join(", ")}`);
      } else {
        lines.push(`${s.name}${s.level ? ` (${s.level}%)` : ""}`);
      }
    });
  }

  // Projects
  if ((cvData.projects || []).length > 0) {
    lines.push("\n=== PROJECTS ===");
    cvData.projects.forEach((proj, i) => {
      lines.push(`\n[${i + 1}] ${proj.name || "Project"}`);
      if (proj.techStack) lines.push(`    Stack: ${proj.techStack}`);
      if (proj.description) lines.push(`    ${proj.description}`);
      if (proj.link) lines.push(`    Link: ${proj.link}`);
    });
  }

  // Certifications
  if ((cvData.certifications || []).length > 0) {
    lines.push("\n=== CERTIFICATIONS ===");
    cvData.certifications.forEach((c) =>
      lines.push(`• ${c.name}${c.issuer ? ` (${c.issuer})` : ""}${c.date ? ` — ${c.date}` : ""}`)
    );
  }

  // Languages
  if ((cvData.languages || []).length > 0) {
    lines.push("\n=== LANGUAGES ===");
    cvData.languages.forEach((l) => lines.push(`• ${l.name}: ${l.level}`));
  }

  // Awards
  if ((cvData.awards || []).length > 0) {
    lines.push("\n=== AWARDS ===");
    cvData.awards.forEach((a) =>
      lines.push(`• ${a.title || a.name}${a.issuer ? ` — ${a.issuer}` : ""}${a.date ? ` (${a.date})` : ""}`)
    );
  }

  // Custom sections
  (cvData.customSections || []).forEach((cs) => {
    if ((cs.entries || []).length > 0) {
      lines.push(`\n=== ${(cs.name || "SECTION").toUpperCase()} ===`);
      cs.entries.forEach((e) => {
        lines.push(`• ${e.title || ""}${e.subtitle ? ` — ${e.subtitle}` : ""}`);
        if (e.description) lines.push(`  ${e.description}`);
      });
    }
  });

  return lines.join("\n");
}

// ── Master prompt ─────────────────────────────────────────────────────────────
function buildPrompt(cvText, jobDescription, industry) {
  // ── Inject real current date from the browser/server clock ──────────────
  const now = new Date();
  const CURRENT_YEAR  = now.getFullYear();          // e.g. 2026
  const CURRENT_MONTH = now.getMonth() + 1;         // 1-based, e.g. 4
  const CURRENT_DAY   = now.getDate();              // e.g. 4
  // Zero-pad for ISO format
  const MM = String(CURRENT_MONTH).padStart(2, "0");
  const DD = String(CURRENT_DAY).padStart(2, "0");
  const CURRENT_DATE  = `${CURRENT_YEAR}-${MM}-${DD}`; // e.g. 2026-04-04

  const jdSection = jobDescription?.trim()
    ? `JOB DESCRIPTION:\n"""\n${jobDescription.trim()}\n"""\n`
    : "";

  return `You are a senior technical recruiter and ATS specialist with 15+ years of experience at companies like Google, Amazon, and McKinsey. You have reviewed over 50,000 CVs and know exactly what gets candidates rejected — and what gets them hired.

A candidate has submitted their CV for professional analysis. Your job is to give them an honest, brutally specific, and actionable assessment — the same feedback a $500/hr career coach would give.

════════════════════════════════════════════════════════════════
SYSTEM DATE (INJECTED FROM SERVER — AUTHORITATIVE — DO NOT IGNORE)
  TODAY      : ${CURRENT_DATE}
  YEAR       : ${CURRENT_YEAR}
  MONTH      : ${CURRENT_MONTH}  (1=Jan, 2=Feb, 3=Mar, 4=Apr … 12=Dec)
  DAY        : ${CURRENT_DAY}

Your training knowledge cutoff does NOT affect this. The date above
is real-time from the application server. Use ONLY ${CURRENT_DATE}
as the reference point for every single date comparison below.
════════════════════════════════════════════════════════════════

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DATE VALIDATION — MANDATORY BEFORE ANY OTHER ANALYSIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
For EVERY date in the CV (experience, education, certifications, projects):

Step 1 — Parse the date to YEAR and MONTH (assume day=1 if not given)
Step 2 — Compare against TODAY = ${CURRENT_DATE}

  VALID   (on or before today):
    • year < ${CURRENT_YEAR}
    • year == ${CURRENT_YEAR}  AND  month <= ${CURRENT_MONTH}

  INVALID (strictly in the future):
    • year > ${CURRENT_YEAR}
    • year == ${CURRENT_YEAR}  AND  month > ${CURRENT_MONTH}

"Present" / "Current" / "Ongoing" = treat as ${CURRENT_DATE} = VALID (as long as start date is valid)

Real examples using TODAY = ${CURRENT_DATE}:
  "Jan 2025"  → 2025 < ${CURRENT_YEAR}                     → ✅ VALID
  "Mar 2026"  → 2026 == ${CURRENT_YEAR}, month 3 < ${CURRENT_MONTH}  → ✅ VALID
  "Apr 2026"  → 2026 == ${CURRENT_YEAR}, month 4 == ${CURRENT_MONTH} → ✅ VALID (current month)
  "Jun 2026"  → 2026 == ${CURRENT_YEAR}, month 6 > ${CURRENT_MONTH}  → ❌ FUTURE DATE — ATS error
  "2027"      → 2027 > ${CURRENT_YEAR}                     → ❌ FUTURE DATE — ATS error

⚠ ONLY flag a date as invalid if it is STRICTLY after ${CURRENT_DATE}.
⚠ NEVER invent or assume dates not written in the CV.
⚠ A date in the current month is VALID, not future.

${jdSection}

CV CONTENT:
"""
${cvText}
"""

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ANALYSIS FRAMEWORK — HOW REAL ATS + RECRUITERS EVALUATE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[1] ATS PARSE-ABILITY (Does it even get read by software?)
    • Standard section headings (Experience, Education, Skills — not fancy names)
    • No tables, columns, text boxes, headers/footers with key info
    • Dates in consistent, parseable format (MM/YYYY or Month YYYY)
    • No future dates
    • Email, phone, LinkedIn present and parseable
    • File would survive Workday, Greenhouse, Lever, Taleo, iCIMS

[2] CONTENT QUALITY (Does it tell a compelling story?)
    • Every bullet should follow: Action Verb + Task/Scope + Quantified Result
    • BAD: "Responsible for managing team projects"
    • GOOD: "Led cross-functional team of 8 engineers to deliver $2M product 3 weeks ahead of schedule"
    • Summary must be role-specific, not a generic career objective
    • Skills section must match the actual job market for this industry

[3] KEYWORD OPTIMIZATION (Will it match job requirements?)
    ${jobDescription?.trim()
      ? "Match CV keywords against the provided job description. Flag every important JD keyword missing from the CV."
      : `Evaluate against standard ${industry} industry keywords. Flag critical missing terms for this field.`}

[4] RECRUITER FIRST-IMPRESSION (6-second scan test)
    • Most recent role visible immediately
    • Clear career progression
    • No red flags: employment gaps >6 months unexplained, job-hopping <1yr, inconsistent dates

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SCORING RUBRIC — BE CALIBRATED, NOT HARSH OR GENEROUS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Score relative to career stage and industry. A fresh graduate is not compared to a senior director.

  90–100  → Exceptional. Ready to apply to top-tier companies as-is.
  80–89   → Strong. Minor polish needed. Will pass most ATS filters.
  70–79   → Good foundation. A few clear gaps holding it back.
  60–69   → Average. Passes ATS but unlikely to impress recruiters.
  50–59   → Below average. Multiple issues reducing interview chances.
  40–49   → Weak. Significant rework needed across most sections.
  30–39   → Poor. Missing critical elements or major structural problems.
  Below 30 → Only for CVs that are nearly empty or completely broken.

NEVER score below 30 unless the CV has fewer than 3 real sections of content.
NEVER inflate scores. A score of 85 should mean genuinely strong, not just "not terrible."

Score dimensions:
  contentScore    — Quality and impact of bullets, summary, and section depth.
                    70+ = solid bullets with some quantification.
                    Deduct 5pts per vague/passive bullet cluster.

  atsScore        — Technical parseability. Start at 85, deduct for real issues ONLY:
                    -15 if future dates found
                    -10 if contact info incomplete
                    -10 if non-standard section headings
                    -8  if inconsistent date formats
                    -5  if no skills section
                    Do NOT deduct for absent optional sections.

  keywordScore    — ${jobDescription?.trim()
                      ? "JD keyword match rate. 80+ means most critical JD terms appear in CV."
                      : `Industry keyword coverage for ${industry}. 80+ means strong terminology alignment.`}

  formattingScore — Visual consistency and readability. 75+ if: consistent fonts implied,
                    logical section order, appropriate length (1 page <5yrs, 2 pages 5-15yrs).

  grammarScore    — Language quality: strong action verbs, no first-person ("I", "my"),
                    no spelling errors, professional tone, tense consistency (past for old roles).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SUGGESTIONS — THE MOST VALUABLE OUTPUT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Rules for every suggestion:
1. Quote the EXACT problematic text from this specific CV
2. Explain the business/recruiter impact of the problem
3. Provide a COMPLETE ready-to-use rewrite — not a template, the actual text
4. Be specific to THIS person's career, not generic advice

Priority levels:
  HIGH   → Automatic rejection risk: future dates, broken contact info, critical missing skills vs JD
  MEDIUM → Significantly reduces callback rate: weak bullets, generic summary, zero quantification, keyword gaps
  LOW    → Competitive edge improvements: optional sections, stronger action verbs, minor polish

Limit: max 3 HIGH + 3 MEDIUM + 3 LOW = 9 total.

✅ GOOD suggestion (specific + actionable):
{
  "priority": "medium",
  "type": "warning",
  "message": "Bullet 'Worked on backend APIs' at [Company Name] is vague — no technology, scale, or outcome mentioned",
  "rewrite": "Engineered 12 RESTful APIs using Node.js and PostgreSQL serving 200K daily active users, reducing average response time by 40%",
  "category": "content"
}

❌ BAD suggestion (generic — never do this):
{
  "message": "Add quantified achievements to your experience section"
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OUTPUT — RETURN ONLY VALID JSON. NO MARKDOWN. NO EXPLANATION.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

{
  "overallScore": <0-100>,
  "grade": <"A+"|"A"|"B+"|"B"|"C+"|"C"|"D"|"F">,
  "contentScore": <0-100>,
  "atsScore": <0-100>,
  "keywordScore": <0-100>,
  "formattingScore": <0-100>,
  "grammarScore": <0-100>,
  "matchedKeywords": [
    { "keyword": <string>, "type": <"technical"|"soft_skill"|"action_verb"|"job_match">, "source": <"industry"|"job_description"> }
  ],
  "missingKeywords": [
    { "keyword": <string>, "type": <"technical"|"job_match">, "source": <"industry"|"job_description"> }
  ],
  "suggestions": [
    {
      "priority": <"high"|"medium"|"low">,
      "type": <"error"|"warning"|"info">,
      "message": <exact CV text quoted + specific problem explained>,
      "rewrite": <complete ready-to-use replacement text, or "" for low priority>,
      "category": <"content"|"ats"|"keywords"|"formatting"|"general">
    }
  ],
  "sectionBreakdown": {
    "personal":       { "name": "Personal Info",        "score": <0-100|null>, "suggestions": [<max 1 specific actionable string>] },
    "summary":        { "name": "Professional Summary", "score": <0-100|null>, "suggestions": [<max 1 full rewrite of the summary>] },
    "experience":     { "name": "Work Experience",      "score": <0-100|null>, "count": <int>, "suggestions": [<max 1 improved bullet rewrite>] },
    "education":      { "name": "Education",            "score": <0-100|null>, "count": <int>, "suggestions": [<max 1 specific string>] },
    "skills":         { "name": "Skills",               "score": <0-100|null>, "count": <int>, "suggestions": [<max 1 specific string>] },
    "projects":       { "name": "Projects",             "score": <0-100|null>, "count": <int>, "suggestions": [<max 1 specific string>] },
    "certifications": { "name": "Certifications",       "score": <0-100|null>, "count": <int>, "suggestions": [] },
    "languages":      { "name": "Languages",            "score": <0-100|null>, "count": <int>, "suggestions": [] },
    "awards":         { "name": "Awards",               "score": <0-100|null>, "count": <int>, "suggestions": [] }
  },
  "impactMetrics": {
    "totalStatements":   <total bullet points across all experience entries>,
    "quantified":        <count of bullets containing a number, %, $, or metric>,
    "quantifiedPct":     <0-100>,
    "actionLed":         <count of bullets starting with a strong action verb>,
    "actionLedPct":      <0-100>,
    "resultOriented":    <count of bullets that show an outcome or business result>,
    "resultOrientedPct": <0-100>
  },
  "skillsGapRadar": [
    { "category": "Technical Skills",  "score": <0-100>, "matched": <int>, "total": <int> },
    { "category": "Soft Skills",       "score": <0-100>, "matched": <int>, "total": <int> },
    { "category": "Action Language",   "score": <0-100>, "matched": <int>, "total": <int> },
    { "category": "Quantification",    "score": <0-100>, "matched": <int>, "total": <int> },
    { "category": "Completeness",      "score": <0-100>, "matched": <int>, "total": <int> }
  ],
  "atsDetails": [
    { "type": <"error"|"warning"|"info">, "msg": <specific ATS finding citing actual CV text, max 120 chars> }
  ],
  "contentDetails": [
    { "type": <"error"|"warning"|"info">, "msg": <specific content observation citing actual CV text, max 120 chars> }
  ]
}

Hard limits: matchedKeywords ≤15, missingKeywords ≤10, suggestions ≤9, atsDetails ≤5, contentDetails ≤5. All string values ≤160 chars.`;
}

// ── Gemini API call ───────────────────────────────────────────────────────────
async function callGemini(prompt) {
  if (!GEMINI_API_KEY) {
    throw new Error(
      "Gemini API key missing. Add VITE_GEMINI_API_KEY to your .env file."
    );
  }

  const res = await fetch(GEMINI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,   // low = consistent, structured JSON output
        topK: 32,
        topP: 0.95,
        maxOutputTokens: 16384,
      },
      safetySettings: [
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      `Gemini API error ${res.status}: ${err?.error?.message || res.statusText}`
    );
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Gemini returned an empty response");
  return text;
}

// ── JSON extractor — handles truncated / wrapped Gemini responses ────────────
function extractJSON(raw) {
  if (!raw || typeof raw !== "string") throw new Error("Gemini returned empty response");

  // 1. Strip ALL markdown fences (Gemini sometimes wraps entire response)
  let cleaned = raw
    .replace(/^```(?:json)?[ \t]*\r?\n?/im, "")
    .replace(/\r?\n?```[ \t]*$/im, "")
    .trim();

  // If stripping left nothing useful, use raw
  if (!cleaned || !cleaned.includes("{")) cleaned = raw.trim();

  // 2. Try direct parse (happy path)
  try { return JSON.parse(cleaned); } catch { /* continue */ }

  // 3. Find the first '{' and walk to find the matching '}'
  const start = cleaned.indexOf("{");
  if (start === -1) {
    console.error("[extractJSON] No JSON object found. Response:", raw.slice(0, 300));
    throw new Error("No JSON object found in Gemini response");
  }

  let depth = 0, inStr = false, esc = false, end = -1;
  for (let i = start; i < cleaned.length; i++) {
    const ch = cleaned[i];
    if (esc)         { esc = false; continue; }
    if (ch === "\\") { esc = true;  continue; }
    if (ch === '"')  { inStr = !inStr; continue; }
    if (inStr)       continue;
    if (ch === "{")        depth++;
    else if (ch === "}") { depth--; if (depth === 0) { end = i; break; } }
  }

  // 4. Balanced block found — try parsing it
  if (end !== -1) {
    try { return JSON.parse(cleaned.slice(start, end + 1)); } catch { /* fall through */ }
  }

  // 5. Truncated — repair and retry
  const fragment = end === -1 ? cleaned.slice(start) : cleaned.slice(start, end + 1);
  const repaired = autoCloseJSON(fragment);
  try { return JSON.parse(repaired); } catch { /* fall through */ }

  // 6. Debug log + throw
  console.error("[extractJSON] Parse failed. Raw (first 800 chars):", raw.slice(0, 800));
  throw new Error("Could not parse Gemini JSON response — try again");
}

// Repair truncated JSON by closing unclosed brackets/braces/strings
function autoCloseJSON(str) {
  const stack  = [];
  let inString = false;
  let escape   = false;
  let lastGood = 0;

  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (escape)        { escape = false; continue; }
    if (ch === "\\") { escape = true;  continue; }
    if (ch === '"')    { inString = !inString; if (!inString) lastGood = i; continue; }
    if (inString)      continue;

    if      (ch === "{" || ch === "[")  { stack.push(ch); }
    else if (ch === "}" || ch === "]")  { stack.pop(); if (stack.length === 0) lastGood = i; }
    else if (!" \n\t,:".includes(ch)) { lastGood = i; }
  }

  let result = str.slice(0, lastGood + 1).trimEnd();
  if (inString) result += '"';           // close dangling string
  result = result.replace(/,\s*$/, ""); // strip trailing comma
  for (let i = stack.length - 1; i >= 0; i--) {
    result += stack[i] === "{" ? "}" : "]";
  }
  return result;
}

// ── Fallback result when API call fails ───────────────────────────────────────
function fallbackResult(error) {
  return {
    overallScore: 0,
    grade: "F",
    contentScore: 0,
    atsScore: 0,
    keywordScore: 0,
    formattingScore: 0,
    grammarScore: 0,
    matchedKeywords: [],
    missingKeywords: [],
    suggestions: [
      {
        priority: "high",
        type: "error",
        message: `Analysis failed: ${error?.message || "Unknown error"}. Please check your Gemini API key and try again.`,
        category: "general",
      },
    ],
    sectionBreakdown: {},
    impactMetrics: {
      totalStatements: 0, quantified: 0, quantifiedPct: 0,
      actionLed: 0, actionLedPct: 0, resultOriented: 0, resultOrientedPct: 0,
    },
    skillsGapRadar: [
      { category: "Technical Skills", score: 0, matched: 0, total: 15 },
      { category: "Soft Skills", score: 0, matched: 0, total: 10 },
      { category: "Action Language", score: 0, matched: 0, total: 12 },
      { category: "Quantification", score: 0, matched: 0, total: 5 },
      { category: "Completeness", score: 0, matched: 0, total: 7 },
    ],
    atsDetails: [{ type: "error", msg: error?.message || "Analysis failed" }],
    contentDetails: [],
    error: error?.message || "Analysis failed",
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function clamp(val, min = 0, max = 100) {
  const n = Number(val);
  return isNaN(n) ? 0 : Math.min(max, Math.max(min, Math.round(n)));
}

function scoreToGrade(score) {
  if (score >= 90) return "A+";
  if (score >= 80) return "A";
  if (score >= 70) return "B+";
  if (score >= 60) return "B";
  if (score >= 50) return "C+";
  if (score >= 40) return "C";
  if (score >= 30) return "D";
  return "F";
}

// ── PUBLIC API ────────────────────────────────────────────────────────────────

/**
 * Analyze a CV using Google Gemini AI.
 * Async drop-in replacement for the old synchronous AnalyzerEngine.analyze().
 *
 * @param   {object}  cvData
 * @param   {object}  [options]
 * @param   {string}  [options.jobDescription]  - Raw text of job posting
 * @param   {string}  [options.industry]        - One of INDUSTRIES (default "general")
 * @param   {string}  [options.scanId]          - Optional pre-generated ID
 * @returns {Promise<object>}                   - Full analysis result
 */
export async function analyze(cvData, options = {}) {
  const {
    jobDescription = "",
    industry = "general",
    scanId = null,
  } = options;

  // Shared envelope fields
  const envelope = {
    scanId: scanId || `scan_${Date.now().toString(36)}`,
    timestamp: Date.now(),
    meta: {
      cvName: cvData?._pdfName || (cvData?.meta || {}).cvName || "Untitled",
      industry,
      hasJobDescription: jobDescription.trim().length > 0,
      analyzedAt: new Date().toISOString(),
      engine: GEMINI_MODEL,
      source: cvData?._pdfText ? "pdf_upload" : "builder",
    },
    weights: { content: 0.30, ats: 0.25, keywords: 0.20, formatting: 0.15, grammar: 0.10 },
  };

  if (!cvData || typeof cvData !== "object") {
    return { ...envelope, ...fallbackResult(new Error("Invalid CV data provided")) };
  }

  let aiResult;
  try {
    const cvText = cvToText(cvData);
    const prompt = buildPrompt(cvText, jobDescription, industry);
    const rawText = await callGemini(prompt);
    aiResult = extractJSON(rawText);
  } catch (err) {
    console.error("[AnalyzerEngine] Gemini call failed:", err);
    return { ...envelope, meta: { ...envelope.meta, engine: "gemini-failed" }, ...fallbackResult(err) };
  }

  // Merge AI fields into the envelope with type safety
  return {
    ...envelope,

    overallScore: clamp(aiResult.overallScore),
    grade: aiResult.grade || scoreToGrade(clamp(aiResult.overallScore)),
    contentScore: clamp(aiResult.contentScore),
    atsScore: clamp(aiResult.atsScore),
    keywordScore: clamp(aiResult.keywordScore),
    formattingScore: clamp(aiResult.formattingScore),
    grammarScore: clamp(aiResult.grammarScore),

    matchedKeywords: Array.isArray(aiResult.matchedKeywords) ? aiResult.matchedKeywords.slice(0, 25) : [],
    missingKeywords: Array.isArray(aiResult.missingKeywords) ? aiResult.missingKeywords.slice(0, 15) : [],
    suggestions: Array.isArray(aiResult.suggestions) ? aiResult.suggestions.slice(0, 12) : [],
    skillsGapRadar: Array.isArray(aiResult.skillsGapRadar) ? aiResult.skillsGapRadar : [],
    atsDetails: Array.isArray(aiResult.atsDetails) ? aiResult.atsDetails : [],
    contentDetails: Array.isArray(aiResult.contentDetails) ? aiResult.contentDetails : [],
    keywordDetails: [],

    sectionBreakdown: aiResult.sectionBreakdown || {},
    impactMetrics: aiResult.impactMetrics || {
      totalStatements: 0, quantified: 0, quantifiedPct: 0,
      actionLed: 0, actionLedPct: 0, resultOriented: 0, resultOrientedPct: 0,
    },
  };
}

// Named object export — keeps AnalyzerPage import working without any changes
export const AnalyzerEngine = { analyze, getIndustries, INDUSTRIES };
export default AnalyzerEngine;