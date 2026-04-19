<div align="center">

<img src="public/CVEX Logo Design.png" alt="CVEX Logo" width="80" height="80" style="border-radius: 50%"/>

# CVEX — CV Builder & AI Analyzer

**Create and analyze professional CVs that get you hired.**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-cvex--builder--analyzer.vercel.app-6366f1?style=for-the-badge&logo=vercel)](https://cvex-builder-analyzer.vercel.app/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38BDF8?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-Build-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev/)

</div>

---

## What is CVEX?

CVEX is a full-stack SaaS CV builder and AI-powered resume analyzer. Users can create, customize, and export professional CVs in PDF format — and then analyze them against any job description using AI to get ATS scores, keyword match reports, skills gap analysis, and actionable suggestions.

---

## Features

- **CV Builder** — Drag-and-drop section ordering, real-time preview, multiple templates
- **Design Panel** — Custom colors, fonts, layouts (single column / sidebar), photo options
- **AI Analyzer** — ATS score, keyword match, skills gap radar, section-by-section analysis
- **PDF Export** — High-fidelity PDF export with daily usage limits
- **CV History** — Save, restore, and delete CV versions
- **Auth System** — Email/password + Google OAuth, email verification, password reset
- **Dark Mode** — Full dark/light mode support
- **Responsive** — Mobile-first design with swipe gestures and bottom navigation
- **Rate Limiting** — Per-user daily PDF and analysis limits with reset timers

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS |
| Backend / DB | Supabase (PostgreSQL, Auth, RLS) |
| Auth | Supabase Auth — Email + Google OAuth |
| AI Analysis | Gemini API |
| Analytics | Google Analytics 4 |
| Hosting | Vercel |

---

## Project Structure

```
src/
├── app/
│   ├── App.jsx                  # Root component, GA4 page tracking
│   └── routes.jsx               # All app routes
│
├── context/
│   ├── AuthContext.jsx          # Auth state, signIn, signOut, Google OAuth
│   └── CVContext.jsx            # CV state, reducer, undo/redo, dark mode
│
├── data/
│   └── templates.js             # Section metadata, template configs
│
├── features/
│   ├── analyzer/
│   │   ├── components/
│   │   │   ├── ATSScore.jsx         # ATS compatibility score display
│   │   │   ├── DownloadReport.jsx   # Export analysis report
│   │   │   ├── ImpactMetrics.jsx    # Impact metrics panel
│   │   │   ├── KeywordMatch.jsx     # Keyword match visualization
│   │   │   ├── SectionAnalysis.jsx  # Per-section feedback
│   │   │   ├── SkillsGapRadar.jsx   # Radar chart for skills gap
│   │   │   └── SuggestionsPanel.jsx # AI suggestions list
│   │   ├── pages/
│   │   │   └── AnalyzerPage.jsx     # Main analyzer page
│   │   └── analyzerEngine.js        # AI analysis logic
│   │
│   ├── auth/
│   │   ├── components/
│   │   │   ├── AuthLayout.jsx       # Shared auth page layout
│   │   │   ├── PasswordStrength.jsx # Password strength indicator
│   │   │   └── SocialAuthButtons.jsx # Google OAuth button
│   │   ├── hooks/
│   │   │   ├── useAnalysisDatabase.js # Analysis history CRUD
│   │   │   ├── useCVDatabase.js       # CV save/load/autosave (Supabase)
│   │   │   └── useUserLimits.js       # Daily usage limits logic
│   │   └── pages/
│   │       ├── AuthCallback.jsx       # OAuth redirect handler
│   │       ├── ForgotPasswordPage.jsx
│   │       ├── LoginPage.jsx
│   │       ├── ResetPasswordPage.jsx
│   │       ├── SignupPage.jsx
│   │       └── VerifyEmailPage.jsx
│   │
│   ├── editor/
│   │   ├── components/
│   │   │   ├── DesignPanel.jsx       # Colors, fonts, layout controls
│   │   │   ├── MultiEntryForm.jsx    # Reusable multi-entry list form
│   │   │   └── SectionFormRouter.jsx # Routes to correct section form
│   │   ├── forms/
│   │   │   ├── PersonalForm.jsx
│   │   │   ├── SummaryForm.jsx
│   │   │   ├── ExperienceForm.jsx
│   │   │   ├── EducationForm.jsx
│   │   │   ├── SkillsForm.jsx
│   │   │   ├── ProjectsForm.jsx
│   │   │   ├── CertificationsForm.jsx
│   │   │   ├── LanguagesForm.jsx
│   │   │   ├── AwardsForm.jsx
│   │   │   ├── HobbiesForm.jsx
│   │   │   └── ReferencesForm.jsx
│   │   ├── pages/
│   │   │   └── EditorPage.jsx        # Main editor — sidebar + preview
│   │   ├── preview/
│   │   │   └── CVRenderer.jsx        # Live CV preview + HTML for PDF
│   │   └── exportPdf.js              # PDF generation logic
│   │
│   ├── landing/
│   │   ├── components/
│   │   │   ├── HeroSection.jsx
│   │   │   ├── FeatureSection.jsx
│   │   │   ├── AIAnalyzerSection.jsx
│   │   │   ├── CustomizationSection.jsx
│   │   │   ├── HowItWorks.jsx
│   │   │   ├── StatsSection.jsx
│   │   │   ├── TestimonialsSection.jsx
│   │   │   └── SectionHeader.jsx
│   │   └── pages/
│   │       └── Landingpage.jsx
│   │
│   └── template/
│       ├── components/
│       │   ├── TemplateCard.jsx      # Single template preview card
│       │   └── TemplateSection.jsx   # Template gallery grid
│       └── pages/
│           └── Templatepage.jsx
│
├── hooks/
│   └── useScrollReveal.js            # Scroll animation hook
│
├── lib/
│   └── supabaseClient.js             # Supabase client init
│
├── shared/
│   ├── guards/
│   │   └── ProtectedRoute.jsx        # Auth-gated route wrapper
│   ├── layout/
│   │   ├── Footer.jsx
│   │   └── Navbar.jsx
│   ├── pages/
│   │   ├── NotFound.jsx
│   │   ├── PrivacyPolicy.jsx
│   │   └── ServicePolicy.jsx
│   └── ui/
│       └── UIComponents.jsx
│
├── utils/
│   ├── cvSession.js
│   └── helper.js
│
├── index.css
└── main.jsx
```

---

<div align="center">

Developed by [Dawood Butt](https://github.com/Dawood131)

[Live Demo](https://cvex-builder-analyzer.vercel.app/)

</div>