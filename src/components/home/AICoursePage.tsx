import React, { useState } from 'react';
import API_ENDPOINTS from '../../config/api';

const AICoursePage: React.FC = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    work_email: '',
    phone_number: '',
    current_role: '',
    experience: '',
    python_level: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Basic validation – all fields are required
    if (
      !formData.first_name ||
      !formData.last_name ||
      !formData.work_email ||
      !formData.phone_number ||
      !formData.current_role ||
      !formData.experience ||
      !formData.python_level
    ) {
      alert('Please fill in all fields.');
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage('Submitting...');

    try {
      const payload = {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        work_email: formData.work_email.trim().toLowerCase(),
        phone_number: formData.phone_number.trim(),
        current_role: formData.current_role.trim(),
        experience: formData.experience.trim(),
        python_level: formData.python_level.trim(),
      };

      const response = await fetch(
        API_ENDPOINTS.AI_ENGINEER_ACCELERATOR_ENQUIRY,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        let errorMsg = errorText;
        try {
          const errorJson = JSON.parse(errorText);
          errorMsg = errorJson.message || errorJson.error || errorText;
        } catch {
          // keep plain text
        }
        throw new Error(errorMsg || 'Submission failed');
      }

      const result = await response.json();
      console.log('AI Engineer Accelerator enquiry submitted:', result);

      // Reset form and show success modal
      setFormData({
        first_name: '',
        last_name: '',
        work_email: '',
        phone_number: '',
        current_role: '',
        experience: '',
        python_level: '',
      });
      setShowSuccessModal(true);
      setSubmitMessage('');
    } catch (error: any) {
      console.error('AI Engineer Accelerator submission error:', error);
      setSubmitMessage(`✗ Failed: ${error.message || 'Please try again later.'}`);
      setTimeout(() => {
        if (submitMessage?.startsWith('✗ Failed')) setSubmitMessage('');
      }, 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#020617] pt-16 text-[#f1f5f9] font-sans antialiased">
      <style>{`
        .drc-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .drc-scroll::-webkit-scrollbar-track {
          background: #020617;
        }
        .drc-scroll::-webkit-scrollbar-thumb {
          background: #1e293b;
          border-radius: 3px;
        }
      `}</style>

      <section
        id="hero"
        className="hero px-4 md:px-8 py-20 max-w-[1140px] mx-auto grid grid-cols-1 md:grid-cols-[1fr_420px] gap-16 relative before:absolute before:inset-0 before:pointer-events-none before:bg-[linear-gradient(rgba(74,222,128,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(74,222,128,0.03)_1px,transparent_1px)] before:bg-[48px_48px] before:[mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,black_40%,transparent_100%)]"
      >
        <div>
          <div className="flex items-center gap-2.5 font-mono text-[11px] font-semibold tracking-[0.14em] text-[#4ade80] uppercase mb-6 before:content-[''] before:block before:w-5 before:h-px before:bg-gradient-to-r before:from-[#4ade80] before:to-transparent">
            2026 Cohort · Seats Filling Fast
          </div>

          <h1 className="text-[clamp(2.4rem,5vw,3.8rem)] font-black leading-[1.05] tracking-[-0.03em] mb-6">
            Become an<br />
            <span className="bg-gradient-to-r from-[#4ade80] via-[#86efac] to-[#06b6d4] bg-clip-text text-transparent">
              AI Engineer
            </span>
            <br />in 16 Weeks.
          </h1>

          <p className="text-[#94a3b8] text-[1.05rem] leading-relaxed max-w-[500px] mb-8">
            A project-driven accelerator for working tech professionals. Ship real RAG systems,
            agentic pipelines, and LLMOps infra — then get placed with 100% active support.
          </p>

          <div className="flex flex-wrap gap-2 mb-10">
            <span className="font-mono text-[11px] font-semibold px-2.5 py-1 rounded bg-[rgba(74,222,128,0.1)] border border-[rgba(74,222,128,0.25)] text-[#4ade80]">
              16 Weeks
            </span>
            <span className="font-mono text-[11px] font-semibold px-2.5 py-1 rounded bg-[rgba(74,222,128,0.1)] border border-[rgba(74,222,128,0.25)] text-[#4ade80]">
              3 Live Projects
            </span>
            <span className="font-mono text-[11px] font-semibold px-2.5 py-1 rounded bg-[rgba(74,222,128,0.1)] border border-[rgba(74,222,128,0.25)] text-[#4ade80]">
              6 Modules
            </span>
            <span className="font-mono text-[11px] font-semibold px-2.5 py-1 rounded bg-[rgba(168,85,247,0.1)] border border-[rgba(168,85,247,0.25)] text-[#a855f7]">
              100% Placement
            </span>
            <span className="font-mono text-[11px] font-semibold px-2.5 py-1 rounded bg-[rgba(6,182,212,0.1)] border border-[rgba(6,182,212,0.25)] text-[#06b6d4]">
              200+ Jobs Applied
            </span>
          </div>

          <div className="grid grid-cols-3 divide-x divide-[rgba(255,255,255,0.07)] border border-[rgba(255,255,255,0.07)] rounded-xl overflow-hidden bg-[#0f172a]">
            <div className="p-5 text-center">
              <div className="font-mono text-[1.75rem] font-bold text-[#4ade80] leading-none drop-shadow-[0_0_20px_rgba(74,222,128,0.4)]">
                16
              </div>
              <div className="text-[11px] text-[#475569] uppercase tracking-[0.06em] mt-1">Weeks</div>
            </div>
            <div className="p-5 text-center">
              <div className="font-mono text-[1.75rem] font-bold text-[#4ade80] leading-none drop-shadow-[0_0_20px_rgba(74,222,128,0.4)]">
                10–15
              </div>
              <div className="text-[11px] text-[#475569] uppercase tracking-[0.06em] mt-1">Hrs / Week</div>
            </div>
            <div className="p-5 text-center">
              <div className="font-mono text-[1.75rem] font-bold text-[#4ade80] leading-none drop-shadow-[0_0_20px_rgba(74,222,128,0.4)]">
                80%
              </div>
              <div className="text-[11px] text-[#475569] uppercase tracking-[0.06em] mt-1">Salary Hike</div>
            </div>
          </div>
        </div>

        <div className="bg-[#0f172a] border border-[rgba(255,255,255,0.12)] rounded-xl p-7 sticky top-[76px] shadow-[0_0_60px_rgba(74,222,128,0.05)]">
          <div className="bg-gradient-to-br from-[rgba(74,222,128,0.12)] to-[rgba(5,150,105,0.12)] border border-[rgba(74,222,128,0.2)] rounded p-4 mb-6">
            <p className="font-mono text-[10px] text-[#4ade80] tracking-[0.10em] uppercase font-semibold mb-1">
              // Cohort 2026 · Live Online
            </p>
            <h3 className="text-[15px] font-bold text-[#f1f5f9]">
              Apply for the AI Engineer Accelerator
            </h3>
          </div>

          <div className="flex items-center justify-between mb-1.5">
            <span className="font-mono text-[11px] font-semibold text-[#4ade80]">⚡ 11 seats remaining</span>
            <span className="font-mono text-[11px] text-[#475569]">73% filled</span>
          </div>
          <div className="bg-[#1e293b] rounded h-[3px] mb-5 overflow-hidden">
            <div className="h-full w-[73%] bg-gradient-to-r from-[#4ade80] to-[#059669] rounded shadow-[0_0_8px_rgba(74,222,128,0.6)]" />
          </div>

          {!showSuccessModal ? (
            <form onSubmit={handleSubmit}>
              {submitMessage && submitMessage.startsWith('✗ Failed') && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-xl text-xs font-light mb-3">
                  {submitMessage}
                </div>
              )}
              <div className="grid grid-cols-2 gap-2">
                <div className="mb-2">
                  <label className="block text-[11px] font-semibold text-[#94a3b8] tracking-[0.06em] uppercase mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    placeholder="Rahul"
                    required
                    value={formData.first_name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-[#020617] border border-[rgba(255,255,255,0.12)] rounded text-[13px] text-[#f1f5f9] placeholder:text-[#475569] focus:outline-none focus:border-[#4ade80] focus:ring-2 focus:ring-[rgba(74,222,128,0.1)]"
                    disabled={isSubmitting}
                  />
                </div>
                <div className="mb-2">
                  <label className="block text-[11px] font-semibold text-[#94a3b8] tracking-[0.06em] uppercase mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    placeholder="Sharma"
                    required
                    value={formData.last_name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-[#020617] border border-[rgba(255,255,255,0.12)] rounded text-[13px] text-[#f1f5f9] placeholder:text-[#475569] focus:outline-none focus:border-[#4ade80] focus:ring-2 focus:ring-[rgba(74,222,128,0.1)]"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              <div className="mb-2">
                <label className="block text-[11px] font-semibold text-[#94a3b8] tracking-[0.06em] uppercase mb-1">
                  Work Email
                </label>
                <input
                  type="email"
                  name="work_email"
                  placeholder="you@company.com"
                  required
                  value={formData.work_email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-[#020617] border border-[rgba(255,255,255,0.12)] rounded text-[13px] text-[#f1f5f9] placeholder:text-[#475569] focus:outline-none focus:border-[#4ade80] focus:ring-2 focus:ring-[rgba(74,222,128,0.1)]"
                  disabled={isSubmitting}
                />
              </div>
              <div className="mb-2">
                <label className="block text-[11px] font-semibold text-[#94a3b8] tracking-[0.06em] uppercase mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone_number"
                  placeholder="+91 98765 XXXXX"
                  required
                  value={formData.phone_number}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-[#020617] border border-[rgba(255,255,255,0.12)] rounded text-[13px] text-[#f1f5f9] placeholder:text-[#475569] focus:outline-none focus:border-[#4ade80] focus:ring-2 focus:ring-[rgba(74,222,128,0.1)]"
                  disabled={isSubmitting}
                />
              </div>
              <div className="mb-2">
                <label className="block text-[11px] font-semibold text-[#94a3b8] tracking-[0.06em] uppercase mb-1">
                  Current Role
                </label>
                <input
                  type="text"
                  name="current_role"
                  placeholder="Software Engineer, Backend Dev…"
                  required
                  value={formData.current_role}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-[#020617] border border-[rgba(255,255,255,0.12)] rounded text-[13px] text-[#f1f5f9] placeholder:text-[#475569] focus:outline-none focus:border-[#4ade80] focus:ring-2 focus:ring-[rgba(74,222,128,0.1)]"
                  disabled={isSubmitting}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="mb-2">
                  <label className="block text-[11px] font-semibold text-[#94a3b8] tracking-[0.06em] uppercase mb-1">
                    Experience
                  </label>
                  <select
                    name="experience"
                    required
                    value={formData.experience}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-[#020617] border border-[rgba(255,255,255,0.12)] rounded text-[13px] text-[#f1f5f9] appearance-none focus:outline-none focus:border-[#4ade80] focus:ring-2 focus:ring-[rgba(74,222,128,0.1)]"
                    disabled={isSubmitting}
                  >
                    <option value="" disabled hidden>
                      Select
                    </option>
                    <option>1–2 years</option>
                    <option>2–4 years</option>
                    <option>4–7 years</option>
                    <option>7+ years</option>
                  </select>
                </div>
                <div className="mb-2">
                  <label className="block text-[11px] font-semibold text-[#94a3b8] tracking-[0.06em] uppercase mb-1">
                    Python Level
                  </label>
                  <select
                    name="python_level"
                    required
                    value={formData.python_level}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-[#020617] border border-[rgba(255,255,255,0.12)] rounded text-[13px] text-[#f1f5f9] appearance-none focus:outline-none focus:border-[#4ade80] focus:ring-2 focus:ring-[rgba(74,222,128,0.1)]"
                    disabled={isSubmitting}
                  >
                    <option value="" disabled hidden>
                      Select
                    </option>
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </select>
                </div>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-3 bg-gradient-to-r from-[#4ade80] to-[#059669] text-black font-extrabold text-[14px] rounded shadow-[0_0_20px_rgba(74,222,128,0.35)] hover:shadow-[0_0_32px_rgba(74,222,128,0.55)] hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-60"
              >
                {isSubmitting ? 'Submitting...' : 'Reserve My Spot →'}
              </button>
            </form>
          ) : (
            <div className="text-center py-8">
              <div className="w-[52px] h-[52px] rounded-full bg-[rgba(74,222,128,0.12)] border border-[rgba(74,222,128,0.3)] flex items-center justify-center mx-auto mb-4 text-[22px]">
                ✓
              </div>
              <h4 className="text-[17px] font-bold text-[#f1f5f9] mb-1.5">
                Application received!
              </h4>
              <p className="text-[13px] text-[#94a3b8]">
                Dheeraj's team will reach out within 24 hours to schedule your discovery call.
              </p>
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  setFormData({
                    first_name: '',
                    last_name: '',
                    work_email: '',
                    phone_number: '',
                    current_role: '',
                    experience: '',
                    python_level: '',
                  });
                }}
                className="mt-4 font-mono text-[11px] font-bold text-[#4ade80] tracking-[0.06em] uppercase hover:underline"
              >
                Apply Again
              </button>
            </div>
          )}

          <p className="text-center text-[11px] text-[#475569] mt-2.5">
            No spam · Discovery call within 24 hrs
          </p>
        </div>
      </section>

      <hr className="h-px bg-gradient-to-r from-transparent via-[#4ade80] to-transparent opacity-20" />

      <section className="py-20 px-4 md:px-8 bg-[#0f172a]">
        <div className="max-w-[1140px] mx-auto">
          <div className="flex items-center gap-2.5 font-mono text-[11px] font-semibold text-[#4ade80] tracking-[0.12em] uppercase mb-4 before:content-['//'] before:text-[#475569] before:text-[10px]">
            Your 16-week roadmap
          </div>
          <h2 className="text-[clamp(1.75rem,3.5vw,2.4rem)] font-extrabold tracking-[-0.03em] leading-[1.15] text-[#f1f5f9] mb-3">
            Every week ships something real.
          </h2>
          <p className="text-[#94a3b8] text-[1rem] max-w-[520px] mb-12 leading-relaxed">
            Six modules, three production-grade projects, and a full cloud deployment — all within
            your existing work schedule.
          </p>

          <div className="grid gap-0">
            {[
              { week: 'Wk 1–2', module: 'Module 0', title: 'Engineering Foundations', topics: 'Python · OOP · FastAPI · REST APIs · Git · SQL · PostgreSQL', pill: '→ AI API Service' },
              { week: 'Wk 3–4', module: 'Module 1', title: 'LLM Foundations & Prompt Engineering', topics: 'Transformers · GPT / Claude / Gemini / Llama · Zero-shot & Few-shot · Function Calling · Structured Outputs · Hallucination Reduction', pill: '→ Project 1 — AI Business Assistant' },
              { week: 'Wk 5–7', module: 'Module 2', title: 'RAG Engineering', topics: 'Embeddings · Pinecone · Chroma · Weaviate · Azure AI Search · Hybrid Search · BM25 · Reranking · LangChain · LlamaIndex · GraphRAG', pill: '→ Project 2 — Enterprise Knowledge Assistant' },
              { week: 'Wk 8–10', module: 'Module 3', title: 'Agentic AI & AI Workflows', topics: 'Agent Architecture · LangGraph · StateGraph · MCP Protocol · GitHub MCP · Jira MCP · CrewAI · AutoGen · Multi-agent Systems', pill: '→ Agent Platform' },
              { week: 'Wk 11–13', module: 'Module 4', title: 'Production AI & LLMOps', topics: 'Hugging Face · Ollama · vLLM · LoRA / QLoRA · BLEU / ROUGE / BERTScore · MLflow · Weights & Biases · Docker · CI/CD · Azure DevOps', pill: '→ Production Pipeline' },
              { week: 'Wk 14–16', module: 'Module 5', title: 'Capstone & Career Launch', topics: 'System Design · Full GenAI Platform · Cloud Deploy (Azure / AWS) · Mock Interviews · Resume · Portfolio Review · Placement Activation', pill: '→ Project 3 — Production GenAI Platform' },
            ].map((item, idx) => (
              <div key={idx} className="grid grid-cols-[90px_1fr] items-stretch">
                <div className="relative pr-5 py-6 border-r border-[rgba(255,255,255,0.12)] flex flex-col items-end gap-1 font-mono text-[10px] font-semibold text-[#475569]">
                  {item.week}
                  <span className="absolute right-[-5px] top-[1.65rem] w-[9px] h-[9px] rounded-full bg-[#4ade80] border border-[#4ade80] shadow-[0_0_8px_#4ade80]" />
                </div>
                <div className="py-6 pl-8 border-b border-[rgba(255,255,255,0.07)]">
                  <div className="font-mono text-[10px] font-bold text-[#4ade80] tracking-[0.10em] uppercase mb-1">
                    {item.module}
                  </div>
                  <div className="text-[15px] font-bold text-[#f1f5f9] mb-1">{item.title}</div>
                  <div className="text-[12px] text-[#475569] leading-relaxed">{item.topics}</div>
                  <div className="inline-flex items-center gap-1.5 mt-2 font-mono text-[10px] font-bold bg-[rgba(74,222,128,0.08)] text-[#4ade80] border border-[rgba(74,222,128,0.2)] px-2 py-0.5 rounded">
                    {item.pill}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <hr className="h-px bg-gradient-to-r from-transparent via-[#4ade80] to-transparent opacity-20" />

      <section className="py-20 px-4 md:px-8">
        <div className="max-w-[1140px] mx-auto">
          <div className="flex items-center gap-2.5 font-mono text-[11px] font-semibold text-[#4ade80] tracking-[0.12em] uppercase mb-4 before:content-['//'] before:text-[#475569] before:text-[10px]">
            Tech stack
          </div>
          <h2 className="text-[clamp(1.75rem,3.5vw,2.4rem)] font-extrabold tracking-[-0.03em] leading-[1.15] text-[#f1f5f9] mb-3">
            Tools you'll actually master.
          </h2>
          <p className="text-[#94a3b8] text-[1rem] max-w-[520px] mb-12 leading-relaxed">
            The same stack used at top AI companies. No toy demos — you'll ship with every tool in this list.
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              'Python', 'OpenAI API', 'Claude API', 'LangChain', 'LangGraph', 'MCP Protocol',
              'LlamaIndex', 'Pinecone', 'Chroma', 'Weaviate', 'Qdrant', 'Azure AI Search',
              'FastAPI', 'Streamlit', 'Hugging Face', 'Ollama', 'vLLM', 'LoRA / QLoRA',
              'CrewAI', 'AutoGen', 'MLflow', 'Weights & Biases', 'Docker', 'GitHub Actions',
              'Azure / AWS', 'PostgreSQL', 'BM25 / FAISS', 'Git', 'Azure DevOps', 'Jira MCP',
            ].map((tool) => (
              <span
                key={tool}
                className={`font-mono text-[11px] font-medium px-3 py-1 rounded border transition-colors ${
                  ['Python', 'OpenAI API', 'Claude API', 'LangChain', 'LangGraph', 'MCP Protocol'].includes(tool)
                    ? 'bg-[rgba(74,222,128,0.08)] border-[rgba(74,222,128,0.3)] text-[#4ade80]'
                    : 'bg-[#0f172a] border-[rgba(255,255,255,0.12)] text-[#94a3b8] hover:border-[#4ade80] hover:text-[#4ade80]'
                }`}
              >
                {tool}
              </span>
            ))}
          </div>
        </div>
      </section>

      <hr className="h-px bg-gradient-to-r from-transparent via-[#4ade80] to-transparent opacity-20" />

      <section className="py-20 px-4 md:px-8 bg-[#0f172a]">
        <div className="max-w-[1140px] mx-auto">
          <div className="flex items-center gap-2.5 font-mono text-[11px] font-semibold text-[#4ade80] tracking-[0.12em] uppercase mb-4 before:content-['//'] before:text-[#475569] before:text-[10px]">
            Placement track
          </div>
          <h2 className="text-[clamp(1.75rem,3.5vw,2.4rem)] font-extrabold tracking-[-0.03em] leading-[1.15] text-[#f1f5f9] mb-3">
            We don't stop until you're hired.
          </h2>
          <p className="text-[#94a3b8] text-[1rem] max-w-[520px] mb-12 leading-relaxed">
            DRC takes full ownership of your job search — from resume to offer letter. While you learn, we're
            already in the market for you.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-[rgba(255,255,255,0.07)] border border-[rgba(255,255,255,0.07)] rounded-xl overflow-hidden bg-[#020617] mb-12">
            <div className="p-8">
              <div className="font-mono text-[2.2rem] font-bold bg-gradient-to-r from-[#4ade80] to-[#06b6d4] bg-clip-text text-transparent leading-none mb-2">
                200+
              </div>
              <div className="text-[13px] text-[#94a3b8] leading-tight">Jobs applied on your behalf</div>
            </div>
            <div className="p-8">
              <div className="font-mono text-[2.2rem] font-bold bg-gradient-to-r from-[#4ade80] to-[#06b6d4] bg-clip-text text-transparent leading-none mb-2">
                100%
              </div>
              <div className="text-[13px] text-[#94a3b8] leading-tight">Active support till you're hired</div>
            </div>
            <div className="p-8">
              <div className="font-mono text-[2.2rem] font-bold bg-gradient-to-r from-[#4ade80] to-[#06b6d4] bg-clip-text text-transparent leading-none mb-2">
                ∞
              </div>
              <div className="text-[13px] text-[#94a3b8] leading-tight">Unlimited mock interview rounds</div>
            </div>
            <div className="p-8">
              <div className="font-mono text-[2.2rem] font-bold bg-gradient-to-r from-[#4ade80] to-[#06b6d4] bg-clip-text text-transparent leading-none mb-2">
                40–80%
              </div>
              <div className="text-[13px] text-[#94a3b8] leading-tight">Average salary hike achieved</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {[
              { icon: '📄', text: '1:1 resume engineering tailored for AI Engineer roles' },
              { icon: '💼', text: 'LinkedIn profile rebuild for maximum recruiter visibility' },
              { icon: '🔍', text: 'Naukri profile setup highlighting AI skills and projects' },
              { icon: '🚀', text: '200+ job applications sent across 3 portals on your behalf' },
              { icon: '📢', text: 'Targeted HR and recruiter outreach to actively hiring companies' },
              { icon: '🤝', text: 'Referral network activation within DRC alumni and partners' },
              { icon: '🎯', text: 'Unlimited mock interviews — GenAI, system design, behavioral' },
              { icon: '💰', text: 'Offer negotiation support to maximize your final package' },
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 bg-[#0f172a] border border-[rgba(255,255,255,0.07)] rounded p-4 text-[13px] text-[#94a3b8] leading-relaxed hover:border-[rgba(74,222,128,0.3)] transition-colors"
              >
                <span className="w-7 h-7 flex-shrink-0 rounded bg-[rgba(74,222,128,0.1)] flex items-center justify-center text-[13px]">
                  {item.icon}
                </span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <hr className="h-px bg-gradient-to-r from-transparent via-[#4ade80] to-transparent opacity-20" />

      <section className="py-20 px-4 md:px-8">
        <div className="max-w-[1140px] mx-auto">
          <div className="flex items-center gap-2.5 font-mono text-[11px] font-semibold text-[#4ade80] tracking-[0.12em] uppercase mb-4 before:content-['//'] before:text-[#475569] before:text-[10px]">
            Target roles
          </div>
          <h2 className="text-[clamp(1.75rem,3.5vw,2.4rem)] font-extrabold tracking-[-0.03em] leading-[1.15] text-[#f1f5f9] mb-3">
            Roles you'll be ready to land.
          </h2>
          <p className="text-[#94a3b8] text-[1rem] max-w-[520px] mb-12 leading-relaxed">
            These roles didn't exist 3 years ago — and they're among the highest-paying in tech today.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { icon: '🤖', title: 'AI Engineer', desc: 'Build and deploy production LLM applications end-to-end.' },
              { icon: '🕸️', title: 'Agent Engineer', desc: 'Design multi-agent systems using LangGraph and MCP.' },
              { icon: '🔎', title: 'RAG Engineer', desc: 'Architect enterprise retrieval pipelines at scale.' },
              { icon: '⚙️', title: 'LLMOps Engineer', desc: 'Monitor, evaluate, and maintain AI systems in production.' },
              { icon: '🏛️', title: 'AI Architect', desc: 'Lead GenAI system design for enterprise organizations.' },
              { icon: '💡', title: 'GenAI Developer', desc: 'Build AI-powered products with modern LLM stacks.' },
            ].map((role) => (
              <div
                key={role.title}
                className="bg-[#0f172a] border border-[rgba(255,255,255,0.07)] rounded-xl p-6 relative overflow-hidden transition-all hover:border-[rgba(74,222,128,0.3)] hover:shadow-[0_0_24px_rgba(74,222,128,0.08)] before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-[2px] before:bg-gradient-to-r before:from-[#4ade80] before:to-[#06b6d4] before:scale-x-0 before:transition-transform before:duration-200 hover:before:scale-x-100"
              >
                <div className="w-9 h-9 rounded bg-[rgba(74,222,128,0.1)] border border-[rgba(74,222,128,0.2)] flex items-center justify-center text-[16px] mb-3">
                  {role.icon}
                </div>
                <h4 className="text-[14px] font-bold text-[#f1f5f9] mb-1">{role.title}</h4>
                <p className="text-[12px] text-[#475569] leading-relaxed">{role.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 px-4 md:px-8 text-center relative overflow-hidden before:content-[''] before:absolute before:inset-0 before:bg-radial before:from-[rgba(74,222,128,0.08)] before:to-transparent before:pointer-events-none">
        <div className="flex justify-center items-center gap-2.5 font-mono text-[11px] font-semibold text-[#4ade80] tracking-[0.12em] uppercase mb-5 before:content-['//'] before:text-[#475569] before:text-[10px]">
          Ready to start
        </div>
        <h2 className="text-[clamp(1.75rem,3.5vw,2.4rem)] font-extrabold tracking-[-0.03em] leading-[1.15] text-[#f1f5f9] mb-3">
          Seats are limited.<br />Apply before the cohort fills.
        </h2>
        <p className="text-[#94a3b8] text-[1rem] max-w-[440px] mx-auto mb-10 leading-relaxed">
          Live online · 10–15 hrs/week · Built for working tech professionals · 100% placement support
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <a
            href="#hero"
            className="bg-gradient-to-r from-[#4ade80] to-[#059669] text-black font-extrabold text-[15px] px-8 py-3.5 rounded shadow-[0_0_24px_rgba(74,222,128,0.35)] hover:shadow-[0_0_40px_rgba(74,222,128,0.55)] hover:opacity-90 transition-all"
          >
            Reserve My Spot →
          </a>
          <a
            href="https://dheerajrathodconsult.com"
            target="_blank"
            rel="noreferrer"
            className="bg-transparent text-[#94a3b8] border border-[rgba(255,255,255,0.12)] font-semibold text-[14px] px-7 py-3.5 rounded hover:border-[#4ade80] hover:text-[#4ade80] transition-colors"
          >
            Visit dheerajrathodconsult.com ↗
          </a>
        </div>
      </section>
    </main>
  );
};

export default AICoursePage;