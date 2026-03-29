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
  const CURRENT_DATE = new Date().toISOString().split("T")[0];

  const jdSection = jobDescription?.trim()
    ? `JOB DESCRIPTION:\n"""\n${jobDescription.trim()}\n"""\n`
    : "";

  return `You are a professional CV coach. A real person has submitted their CV and needs honest, specific help to get more interviews.

CURRENT DATE: ${CURRENT_DATE}

IMPORTANT DATE HANDLING RULES:

- Interpret all dates in any format (e.g. "Apr 2026", "2025-03-10", "March 2024").
- Normalize all dates before comparison.

- Treat CURRENT DATE as the exact reference point.

- Any date that is AFTER CURRENT DATE (year/month/day comparison) is a FUTURE date.

- Even if the year is the same (2026), but:
  • month > current month OR
  • same month but day > current day  
  → it is STILL a future date and must be treated as INVALID.

- Future dates must always be flagged as HIGH priority ATS errors.

- Do NOT treat any future date as valid under any circumstance.

- Dates equal to or before CURRENT DATE are valid.

- If a date range is given (e.g. "Apr 2025 – Present"):
  • Validate that the start date is NOT in the future
  • "Present" is valid only if start date is ≤ CURRENT DATE

- Always classify future date issues as:
  priority: "high"
  type: "error"
  category: "ats"

- Clearly mention:
  • exact CV line
  • the future date
  • comparison with CURRENT DATE
  • ATS/recruiter rejection risk

${jdSection}

CV:
"""
${cvText}
"""


TASK: Analyze this CV and return JSON.Your feedback must be directly useful — specific to THIS CV's actual content, not generic advice.

━━ SCORING(be honest, not harsh) ━━
Overall score meaning:
- 80 - 100: Strong, interview - ready CV
  - 65 - 79: Good CV, clear improvements available
    - 50 - 64: Decent CV, needs work on impact
      - 35 - 49: Weak CV, significant improvements needed
        - Below 35: Only for truly incomplete CVs

Judge relative to career stage.A junior dev with solid projects and clean formatting = 62 - 72. Never give below 35 unless CV is nearly empty.

Score dimensions:
- contentScore: Quality of what IS present. 70 + if all main sections have good bullets.Never penalize for absent optional sections.
- atsScore: Will Workday / Greenhouse parse this ? 75 + for clean structure, correct dates, standard headings.Deduct for actual issues only, never for missing optional sections.
- keywordScore: ${jobDescription?.trim() ? "How many job description keywords appear in the CV?" : `Coverage of important ${industry} keywords`}
- formattingScore: Clean, readable, professional layout. 75 + if consistent.
- grammarScore: Action verbs, no first - person, professional tone, quantified where possible.

━━ SUGGESTIONS — THIS IS THE MOST IMPORTANT PART ━━
Each suggestion must:
1. Reference ACTUAL text from this CV(quote it)
2. Explain WHY it's a problem
3. Give a CONCRETE rewrite the person can copy - paste

The "rewrite" field is mandatory for medium and high priority suggestions.

  Priority:
- high: Will directly cause rejection(wrong dates, missing contact info, critical skill gaps if JD provided)
- medium: Significantly hurts chances(vague bullets, generic summary, zero quantification)
  - low: Nice - to - have(optional sections, minor polish)

Max: 3 high, 3 medium, 3 low.

GOOD suggestion example:
{
  "priority": "medium",
    "type": "warning",
      "message": "Bullet 'Built reusable components' gives no context on scale or impact",
        "rewrite": "Built 15+ reusable React components adopted across 3 projects, reducing development time by ~30%",
          "category": "content"
}

BAD suggestion(never do this):
{
  "message": "Add quantified achievements to your experience section"
}

━━ SECTION SCORES ━━
Score only sections that EXIST.For absent optional sections(certifications, awards, languages): score = null.

Return ONLY valid JSON, no markdown, no explanation:

{
  "overallScore": < 0 - 100 >,
    "grade": < "A+" | "A" | "B+" | "B" | "C+" | "C" | "D" | "F" >,
      "contentScore": < 0 - 100 >,
        "atsScore": < 0 - 100 >,
          "keywordScore": < 0 - 100 >,
            "formattingScore": < 0 - 100 >,
              "grammarScore": < 0 - 100 >,
                "matchedKeywords": [
                  {
                    "keyword": <string>, "type": <"technical"|"soft_skill"|"action_verb"|"job_match">, "source": <"industry"|"job_description"> }
                      ],
                      "missingKeywords": [
                      {"keyword": <string>, "type": <"technical"|"job_match">, "source": <"industry"|"job_description"> }
                        ],
                        "suggestions": [
                        {
                          "priority": <"high"|"medium"|"low">,
                        "type": <"error"|"warning"|"info">,
                        "message": <specific issue quoting actual CV text>,
                          "rewrite": <concrete improved version to copy-paste, or "" if low priority>,
                          "category": <"content"|"ats"|"keywords"|"formatting"|"general">
    }
                          ],
                          "sectionBreakdown": {
                            "personal":       {"name": "Personal Info",        "score": <0-100 or null>, "suggestions": [<max 1 specific string>] },
                          "summary":        {"name": "Professional Summary", "score": <0-100 or null>, "suggestions": [<max 1 specific rewrite>] },
                          "experience":     {"name": "Work Experience",      "score": <0-100 or null>, "count": <int>, "suggestions": [<max 1 specific bullet rewrite>] },
                            "education":      {"name": "Education",            "score": <0-100 or null>, "count": <int>, "suggestions": [<max 1 string>] },
                              "skills":         {"name": "Skills",               "score": <0-100 or null>, "count": <int>, "suggestions": [<max 1 string>] },
                                "projects":       {"name": "Projects",             "score": <0-100 or null>, "count": <int>, "suggestions": [<max 1 string>] },
                                  "certifications": {"name": "Certifications",       "score": <0-100 or null>, "count": <int>, "suggestions": [] },
                                    "languages":      {"name": "Languages",            "score": <0-100 or null>, "count": <int>, "suggestions": [] },
                                      "awards":         {"name": "Awards",               "score": <0-100 or null>, "count": <int>, "suggestions": [] }
  },
                                        "impactMetrics": {
                                          "totalStatements":   <bullet count in experience>,
                                            "quantified":        <bullets with numbers /metrics>,
                                          "quantifiedPct":     <0-100>,
                                          "actionLed":         <bullets starting with action verb>,
                                            "actionLedPct":      <0-100>,
                                            "resultOriented":    <bullets showing result /outcome>,
                                            "resultOrientedPct": <0-100>
  },
                                            "skillsGapRadar": [
                                            {"category": "Technical Skills",  "score": <0-100>, "matched": <int>, "total": <int> },
                                              {"category": "Soft Skills",       "score": <0-100>, "matched": <int>, "total": <int> },
                                                {"category": "Action Language",   "score": <0-100>, "matched": <int>, "total": <int> },
                                                  {"category": "Quantification",    "score": <0-100>, "matched": <int>, "total": <int> },
                                                    {"category": "Completeness",      "score": <0-100>, "matched": <int>, "total": <int> }
                                                      ],
                                                      "atsDetails": [
                                                      {"type": <"error"|"warning"|"info">, "msg": <specific ATS issue found in this CV, max 120 chars> }
                                                      ],
                                                      "contentDetails": [
                                                      {"type": <"error"|"warning"|"info">, "msg": <specific content observation, max 120 chars> }
                                                      ]
}

                                                      Limits: matchedKeywords ≤15, missingKeywords ≤10, suggestions ≤9, atsDetails ≤4, contentDetails ≤4. All strings ≤160 chars.`;
}// ── Gemini API call ───────────────────────────────────────────────────────────
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
        maxOutputTokens: 8192,
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
  // 1. Strip markdown fences
  let cleaned = raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/, "")
    .trim();

  // 2. Try direct parse first (happy path)
  try { return JSON.parse(cleaned); } catch { }

  // 3. Find the outermost {... } block
  const start = cleaned.indexOf("{");
  if (start === -1) throw new Error("No JSON object found in Gemini response");
  let extracted = cleaned.slice(start);

  // 4. Try parsing as-is
  try { return JSON.parse(extracted); } catch { }

  // 5. JSON is truncated — try to auto-close it
  extracted = autoCloseJSON(extracted);
  try { return JSON.parse(extracted); } catch { }

  throw new Error("Could not parse Gemini JSON response — try again");
}

// Attempt to close truncated JSON by counting open brackets/braces/strings
function autoCloseJSON(str) {
  const stack = [];
  let inString = false;
  let escape = false;
  let lastGood = 0;

  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (escape) { escape = false; continue; }
    if (ch === "\\") { escape = true; continue; }
    if (ch === "\"" && !escape) {
      inString = !inString;
      if (!inString) lastGood = i;
      continue;
    }
    if (inString) continue;

    if (ch === "{" || ch === "[") { stack.push(ch); }
    else if (ch === "}" || ch === "]") {
      stack.pop();
      if (stack.length === 0) lastGood = i;
    } else if (ch !== "," && ch !== ":" && ch !== " " && ch !== "\n" && ch !== "\t") {
      lastGood = i;
    }
  }

  // Trim to last complete value, then close all open containers
  let result = str.slice(0, lastGood + 1).trimEnd();
  // Remove trailing comma if any
  result = result.replace(/,\s*$/, "");
  // Close open containers in reverse order
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
                                                      * @returns {Promise < object >}                   - Full analysis result
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