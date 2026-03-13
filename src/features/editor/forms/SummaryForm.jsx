import React, { useState, useEffect } from "react";
import { useCV } from "../../../context/CVContext";
import { FormField, Button, Modal } from "../../../shared/ui/UIComponents";
import {
  FaLightbulb,
  FaFileLines,
  FaCheck,
  FaCopy,
  FaCircleCheck,
  FaChevronRight,
} from "react-icons/fa6";

// ─── Tips ─────────────────────────────────────────────────────────
const TIPS = [
  { icon: "1️⃣", text: "Start with your job title and years of experience" },
  { icon: "2️⃣", text: "Mention 2–3 key skills or technologies you excel at" },
  { icon: "3️⃣", text: "Include a notable achievement with measurable impact" },
  { icon: "4️⃣", text: "End with what you're looking for professionally" },
];

function SummaryForm() {
  const { cvData, dispatch } = useCV();
  const [showModal,  setShowModal]  = useState(false);
  const [activeTab,  setActiveTab]  = useState("tips"); // "tips" | "examples"
  const [copied,     setCopied]     = useState(null);
  const [examples,   setExamples]   = useState([]);

  const charCount = (cvData.personal.summary || "").length;
  const charLimit  = 600;
  const charColor  =
    charCount > charLimit       ? "text-red-500"
    : charCount > charLimit * 0.85 ? "text-amber-500"
    : "text-[var(--surface-400)]";

  // ── Generate examples ──
  useEffect(() => {
    const title = cvData.personal.title;
    if (!title) {
      setExamples([
        "Dedicated professional with a strong track record of delivering results. Passionate about growth, collaboration, and making a measurable impact.",
        "Results-driven professional with broad expertise in their field. Committed to applying skills to solve complex challenges and drive success.",
        "Motivated and detail-oriented professional seeking to leverage experience and skills in a dynamic environment.",
      ]);
      return;
    }
    setExamples(
      JOB_TITLE_EXAMPLES[title] || [
        `${title} with hands-on experience delivering high-quality results. Adept at problem-solving and working in collaborative, fast-paced environments.`,
        `Results-driven ${title} with a proven record of impactful contributions. Skilled in relevant technologies and cross-functional teamwork.`,
        `Professional ${title} leveraging expertise to deliver effective and scalable solutions. Committed to continuous learning and measurable outcomes.`,
      ]
    );
  }, [cvData.personal.title]);

  const useExample = (ex) => {
    dispatch({ type: "UPDATE_PERSONAL", payload: { summary: ex } });
    setShowModal(false);
  };

  const copyExample = (ex, idx) => {
    navigator.clipboard.writeText(ex).catch(() => {});
    setCopied(idx);
    setTimeout(() => setCopied(null), 1800);
  };

  return (
    <div className="space-y-3">

      {/* Textarea */}
      <div className="space-y-1">
        <FormField
          label="Professional Summary"
          type="textarea"
          value={cvData.personal.summary}
          onChange={(v) => dispatch({ type: "UPDATE_PERSONAL", payload: { summary: v } })}
          placeholder="Briefly describe your professional background, key skills, and what you bring to the table…"
          rows={5}
        />
        {/* Char counter */}
        <div className={`text-right text-xs font-medium pr-1 ${charColor}`}>
          {charCount} / {charLimit}
        </div>
      </div>

      {/* Tips button */}
      <button
        onClick={() => { setShowModal(true); setActiveTab("tips"); }}
        className="flex items-center gap-2 text-xs font-semibold text-[var(--brand-500)] hover:text-[var(--brand-700)] transition-colors cursor-pointer"
      >
        Tips &amp; Examples
        <FaChevronRight className="text-[8px] opacity-60" />
      </button>

      {/* Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Summary Guide">
        <div className="space-y-4">

          {/* Tab switcher */}
          <div className="flex rounded-xl overflow-hidden border border-[var(--surface-200)] p-1 gap-1 bg-[var(--surface-100)]">
            {[
              { id: "tips",     label: "✦ Tips",     },
              { id: "examples", label: "📄 Examples", },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={[
                  "flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all",
                  activeTab === t.id
                    ? "bg-white text-[var(--brand-600)] shadow-sm"
                    : "text-[var(--surface-500)] hover:text-[var(--surface-700)]",
                ].join(" ")}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* ── TIPS TAB ── */}
          {activeTab === "tips" && (
            <div className="space-y-3">
              {TIPS.map((tip) => (
                <div
                  key={tip.text}
                  className="flex items-start gap-3 p-3 rounded-xl bg-[var(--surface-50)] border border-[var(--surface-200)]"
                >
                  <span className="text-base flex-shrink-0">{tip.icon}</span>
                  <span className="text-sm text-[var(--surface-700)] leading-relaxed">{tip.text}</span>
                </div>
              ))}

              {/* Pro tips card */}
              <div className="rounded-xl border border-[var(--brand-200,#bfdbfe)] bg-[var(--brand-50,#eff6ff)] p-3">
                <div className="text-xs font-bold text-[var(--brand-600,#2563eb)] mb-1.5 uppercase tracking-wide">
                  ✦ Pro tips
                </div>
                <ul className="space-y-1">
                  {[
                    "Keep it 3–5 sentences — recruiters skim",
                    "Tailor it to the job you're applying for",
                    "Avoid clichés like 'hard-working' or 'team player'",
                  ].map((tip) => (
                    <li key={tip} className="flex items-start gap-2 text-xs text-[var(--brand-700,#1d4ed8)]">
                      <FaCircleCheck className="text-[var(--brand-400,#60a5fa)] mt-0.5 flex-shrink-0" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => setActiveTab("examples")}
                className="w-full py-2.5 rounded-xl border-2 border-[var(--brand-400)] text-[var(--brand-600)] text-sm font-semibold hover:bg-[var(--brand-50,#eff6ff)] transition-all flex items-center justify-center gap-2  cursor-pointer"
              >
                <FaFileLines className="text-xs" />
                See example summaries →
              </button>
            </div>
          )}

          {/* ── EXAMPLES TAB ── */}
          {activeTab === "examples" && (
            <div className="space-y-3">
              {cvData.personal.title && (
                <div className="text-xs text-[var(--surface-400)] font-medium px-1">
                  Examples for: <span className="text-[var(--brand-600)] font-semibold">{cvData.personal.title}</span>
                </div>
              )}

              {examples.map((ex, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl border border-[var(--surface-200)] bg-[var(--surface-50)] hover:border-[var(--brand-300)] hover:bg-[var(--brand-50,#eff6ff)] transition-all group"
                >
                  <p className="text-sm text-[var(--surface-700)] leading-relaxed mb-3">
                    "{ex}"
                  </p>
                  <div className="flex gap-2">
                    {/* Use button */}
                    <button
                      onClick={() => useExample(ex)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-[var(--brand-500)] text-white text-xs font-semibold hover:bg-[var(--brand-600)] transition-all cursor-pointer"
                    >
                      <FaCheck className="text-[9px]" /> Use this
                    </button>
                    {/* Copy button */}
                    <button
                      onClick={() => copyExample(ex, idx)}
                      className={[
                        "flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all",
                        copied === idx
                          ? "border-green-400 bg-green-50 text-green-600"
                          : "border-[var(--surface-200)] text-[var(--surface-500)] hover:border-[var(--surface-300)]",
                      ].join(" ")}
                    >
                      {copied === idx
                        ? <><FaCheck className="text-[9px]" /> Copied!</>
                        : <><FaCopy className="text-[9px]" /> Copy</>
                      }
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </Modal>
    </div>
  );
}

export default SummaryForm;

// ─── Examples by job title ────────────────────────────────────────
const JOB_TITLE_EXAMPLES = {
  "Frontend Developer": [
    "Frontend Developer with 3+ years of experience building responsive web applications using React, TypeScript, and modern JavaScript frameworks. Skilled in UI/UX design and performance optimization.",
    "Results-driven Frontend Developer with expertise in React and modern JS ecosystems. Delivered high-performance web apps used by thousands of users.",
    "Professional Frontend Developer skilled in building scalable, maintainable, and accessible web applications. Experienced in collaborating with cross-functional teams."
  ],
  "Backend Developer": [
    "Backend Developer with experience in Node.js, Express, and database management. Built scalable APIs and optimized server-side performance for high-traffic applications.",
    "Results-oriented Backend Developer with expertise in server-side development and database optimization. Skilled in building secure and efficient systems.",
    "Professional Backend Developer experienced in Node.js, Python, and database technologies. Focused on creating robust and maintainable backend solutions."
  ],
  "Full Stack Developer": [
    "Full Stack Developer with expertise in both frontend (React, TypeScript) and backend (Node.js, Express). Delivered complete web applications end-to-end.",
    "Results-driven Full Stack Developer experienced in building scalable, high-performance web applications. Skilled in database design, API development, and responsive UI.",
    "Professional Full Stack Developer with experience in React, Node.js, and SQL/NoSQL databases. Committed to delivering high-quality, maintainable code."
  ],
  "Marketing Manager": [
    "Marketing Manager with expertise in digital marketing, SEO, and brand strategy. Increased engagement and revenue through data-driven campaigns.",
    "Results-oriented Marketing Manager skilled in content marketing, social media strategy, and analytics. Proven ability to generate measurable business outcomes.",
    "Professional Marketing Manager experienced in developing and executing marketing campaigns, optimizing brand visibility, and achieving growth targets."
  ],
  "Data Scientist": [
    "Data Scientist with experience in machine learning, data analysis, and predictive modeling. Skilled at turning complex datasets into actionable insights.",
    "Results-driven Data Scientist experienced in Python, R, and SQL. Developed predictive models that improved business decisions and outcomes.",
    "Professional Data Scientist leveraging statistical modeling and data visualization to extract insights, optimize processes, and drive business impact."
  ],
  "Graphic Designer": [
    "Graphic Designer with experience in Adobe Creative Suite, branding, and UI/UX design. Delivered creative solutions for web and print media.",
    "Results-oriented Graphic Designer skilled in visual storytelling, layout design, and brand identity. Successfully managed multiple design projects.",
    "Professional Graphic Designer experienced in creating compelling visuals and branding materials. Focused on delivering aesthetically pleasing and effective designs."
  ],
  "Product Manager": [
    "Product Manager with experience in agile project management, product strategy, and cross-functional team leadership. Successfully launched multiple products.",
    "Results-driven Product Manager skilled in roadmap planning, stakeholder communication, and delivering products that meet customer needs.",
    "Professional Product Manager with expertise in agile methodologies and product lifecycle management. Focused on driving product success and team efficiency."
  ],
  "UI/UX Designer": [
    "UI/UX Designer with expertise in user research, wireframing, and prototyping. Delivered intuitive interfaces and improved user satisfaction.",
    "Results-driven UI/UX Designer experienced in Figma, Adobe XD, and responsive design. Focused on creating seamless user experiences.",
    "Professional UI/UX Designer skilled in designing engaging digital experiences. Experienced in usability testing and iterative design improvements."
  ],
  "Mobile App Developer": [
    "Mobile App Developer with experience in building iOS and Android applications using React Native and Swift. Delivered high-performance, user-friendly apps.",
    "Results-driven Mobile App Developer skilled in cross-platform development and mobile UI/UX. Optimized app performance and user engagement.",
    "Professional Mobile App Developer experienced in designing, developing, and maintaining mobile applications for various industries."
  ],
  "DevOps Engineer": [
    "DevOps Engineer with expertise in CI/CD pipelines, cloud infrastructure, and automation tools. Improved deployment efficiency and system reliability.",
    "Results-oriented DevOps Engineer experienced in AWS, Docker, and Kubernetes. Focused on optimizing development workflows and infrastructure performance.",
    "Professional DevOps Engineer skilled in automation, monitoring, and cloud technologies. Delivered scalable and secure production environments."
  ],
  "Software Engineer": [
    "Software Engineer with experience in building scalable applications using Java, C#, and Python. Skilled in system architecture and problem-solving.",
    "Results-driven Software Engineer proficient in software development lifecycle, algorithms, and modern programming languages. Delivered high-quality software products.",
    "Professional Software Engineer experienced in designing, developing, and maintaining software solutions. Focused on efficiency, reliability, and clean code."
  ],
  "Data Analyst": [
    "Data Analyst with experience in SQL, Excel, and data visualization. Skilled in extracting insights and supporting data-driven decisions.",
    "Results-driven Data Analyst proficient in dashboards, reporting, and statistical analysis. Improved business decision-making with accurate insights.",
    "Professional Data Analyst experienced in analyzing complex datasets and delivering actionable recommendations."
  ],
  "Python Developer": [
    "Python Developer with experience in web development, automation, and data analysis using Python and Django/Flask frameworks.",
    "Results-driven Python Developer skilled in backend development, APIs, and data manipulation. Developed scalable solutions for diverse projects.",
    "Professional Python Developer experienced in writing clean, maintainable code, integrating third-party APIs, and optimizing performance."
  ],
  "Java Developer": [
    "Java Developer with expertise in building robust enterprise applications using Java, Spring Boot, and Hibernate frameworks.",
    "Results-driven Java Developer skilled in object-oriented programming, API design, and application optimization.",
    "Professional Java Developer experienced in developing scalable solutions, database integration, and performance tuning."
  ],
  "Machine Learning Engineer": [
    "Machine Learning Engineer with expertise in building predictive models, natural language processing, and computer vision applications.",
    "Results-driven Machine Learning Engineer skilled in Python, TensorFlow, PyTorch, and model optimization for real-world problems.",
    "Professional Machine Learning Engineer experienced in deploying machine learning pipelines and extracting actionable insights from data."
  ],
  "Cloud Engineer": [
    "Cloud Engineer with experience in AWS, Azure, and Google Cloud Platform. Skilled in cloud architecture, deployment, and automation.",
    "Results-oriented Cloud Engineer proficient in cloud services, infrastructure as code, and performance optimization.",
    "Professional Cloud Engineer experienced in designing scalable, secure, and cost-efficient cloud solutions."
  ],
  "Android Developer": [
    "Android Developer with experience in building native Android applications using Java and Kotlin. Delivered high-quality apps to production.",
    "Results-driven Android Developer skilled in mobile UI/UX, APIs, and performance optimization.",
    "Professional Android Developer experienced in full app lifecycle development, debugging, and publishing on Play Store."
  ],
  "iOS Developer": [
    "iOS Developer with expertise in Swift and Objective-C. Developed user-friendly applications with smooth performance.",
    "Results-driven iOS Developer skilled in UIKit, SwiftUI, and integrating APIs to deliver scalable mobile apps.",
    "Professional iOS Developer experienced in building maintainable, high-performance applications for iPhone and iPad."
  ],
  "Content Writer": [
    "Content Writer with experience creating engaging articles, blog posts, and marketing content. Skilled in SEO and storytelling.",
    "Results-driven Content Writer experienced in developing content strategies and producing high-quality copy for digital platforms.",
    "Professional Content Writer proficient in crafting compelling content that drives traffic and engagement."
  ],
  "Social Media Manager": [
    "Social Media Manager with expertise in managing platforms, content strategy, and analytics. Increased engagement and followers across multiple channels.",
    "Results-driven Social Media Manager skilled in social campaigns, community engagement, and brand growth.",
    "Professional Social Media Manager experienced in content planning, audience targeting, and performance optimization."
  ],
  "HR Manager": [
    "HR Manager with experience in recruitment, employee relations, and HR policies. Focused on fostering a productive and positive workplace.",
    "Results-oriented HR Manager skilled in talent acquisition, performance management, and organizational development.",
    "Professional HR Manager experienced in HR strategy, employee engagement, and compliance management."
  ],
  "Business Analyst": [
    "Business Analyst with expertise in requirements gathering, process improvement, and data analysis. Delivered actionable insights to stakeholders.",
    "Results-driven Business Analyst skilled in workflow optimization, stakeholder communication, and business process mapping.",
    "Professional Business Analyst experienced in analyzing business needs and providing data-driven recommendations for decision-making."
  ],
  "Project Manager": [
    "Project Manager with experience in agile and waterfall methodologies. Successfully delivered projects on time and within budget.",
    "Results-driven Project Manager skilled in team coordination, risk management, and project planning.",
    "Professional Project Manager experienced in managing cross-functional teams and delivering high-quality project outcomes."
  ],
  "Accountant": [
    "Accountant with experience in financial reporting, tax compliance, and bookkeeping. Ensured accurate financial records and reporting.",
    "Results-driven Accountant skilled in budget management, auditing, and financial analysis.",
    "Professional Accountant experienced in managing accounts, preparing statements, and ensuring regulatory compliance."
  ],
  "Sales Executive": [
    "Sales Executive with experience in lead generation, client relationship management, and achieving sales targets. Increased revenue by 25%.",
    "Results-driven Sales Executive skilled in B2B and B2C sales strategies. Proven track record in closing deals and growing accounts.",
    "Professional Sales Executive with expertise in sales pipelines, negotiations, and market research. Focused on delivering measurable results."
  ],
  "SEO Specialist": [
    "SEO Specialist with experience optimizing websites for search engines, increasing organic traffic, and improving rankings.",
    "Results-driven SEO Specialist skilled in keyword research, on-page optimization, and link building strategies.",
    "Professional SEO Specialist focused on improving website visibility, traffic, and conversions through strategic SEO practices."
  ],
  "Operations Manager": [
    "Operations Manager experienced in optimizing workflows, managing teams, and improving operational efficiency.",
    "Results-driven Operations Manager skilled in process improvement, resource planning, and cross-department collaboration.",
    "Professional Operations Manager with experience in leading operations, enhancing productivity, and achieving organizational goals."
  ],
  "Finance Manager": [
    "Finance Manager with expertise in financial planning, budgeting, and reporting. Ensured accurate and timely financial operations.",
    "Results-driven Finance Manager skilled in accounting, auditing, and financial analysis to support business decisions.",
    "Professional Finance Manager experienced in managing financial strategy, risk assessment, and compliance."
  ],
  "Electrical Engineer": [
    "Electrical Engineer with experience in designing, testing, and maintaining electrical systems. Ensured compliance with industry standards.",
    "Results-driven Electrical Engineer skilled in circuit design, system optimization, and project management.",
    "Professional Electrical Engineer experienced in implementing innovative electrical solutions for industrial and commercial projects."
  ],
  "Mechanical Engineer": [
    "Mechanical Engineer experienced in CAD design, prototyping, and product development. Delivered high-quality mechanical systems.",
    "Results-driven Mechanical Engineer skilled in problem-solving, material selection, and manufacturing processes.",
    "Professional Mechanical Engineer experienced in designing, testing, and optimizing mechanical components and systems."
  ],
  "Civil Engineer": [
    "Civil Engineer with experience in construction management, structural design, and project planning. Delivered projects on time and budget.",
    "Results-driven Civil Engineer skilled in site supervision, blueprint analysis, and compliance with safety standards.",
    "Professional Civil Engineer experienced in managing civil projects, coordinating teams, and ensuring structural integrity."
  ],
  "Customer Support Specialist": [
    "Customer Support Specialist with experience in providing excellent service via chat, email, and phone. Skilled in problem-solving and conflict resolution.",
    "Results-driven Customer Support Specialist experienced in CRM tools and delivering positive customer experiences.",
    "Professional Customer Support Specialist focused on ensuring customer satisfaction and retention through effective support."
  ],
  "QA Engineer": [
    "QA Engineer with experience in automated and manual testing, ensuring high-quality software releases. Skilled in Selenium and Jest.",
    "Results-driven QA Engineer experienced in test planning, defect tracking, and quality assurance processes. Focused on delivering reliable software.",
    "Professional QA Engineer proficient in functional and regression testing. Committed to maintaining high product quality standards."
  ],
  "Game Developer": [
    "Game Developer with experience in Unity and Unreal Engine. Developed engaging 2D and 3D games for multiple platforms.",
    "Results-oriented Game Developer skilled in C#, game physics, and interactive storytelling.",
    "Professional Game Developer experienced in designing gameplay mechanics, optimizing performance, and delivering immersive experiences."
  ],
};