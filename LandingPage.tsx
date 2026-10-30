import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles, Bot, Code2, Mic, Terminal, BarChart2,
  CheckCircle, ArrowRight, ShieldCheck, Zap, Award, Layers,
  Play
} from 'lucide-react';
import { VoiceAvatar } from '../components/VoiceAvatar';

export const LandingPage: React.FC = () => {
  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 overflow-hidden">
      {/* Background radial gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-gradient-to-b from-cyan-500/10 via-blue-600/5 to-transparent blur-3xl pointer-events-none" />

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 md:pt-32 md:pb-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Release badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold mb-8 animate-pulse-subtle">
          <Sparkles className="w-3.5 h-3.5" />
          <span>PrepSense AI 2.0 with Voice & Real-Time Code Execution</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6">
          Ace Technical Interviews with <br />
          <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-400 bg-clip-text text-transparent">
            Real-Time AI Simulation
          </span>
        </h1>

        <p className="max-w-2xl mx-auto text-lg sm:text-xl text-slate-400 font-normal leading-relaxed mb-10">
          Practice coding, system design, and behavioral questions with an intelligent AI interviewer that listens to your voice, reviews your code, and uncovers your exact knowledge gaps.
        </p>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link
            to="/register"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-base shadow-xl shadow-cyan-500/25 transition transform hover:-translate-y-0.5"
          >
            <span>Start Free Mock Interview</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-base transition"
          >
            <Play className="w-4 h-4 text-cyan-400" />
            <span>Try Live Demo</span>
          </Link>
        </div>

        {/* Social Proof Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto p-6 bg-slate-900/60 border border-slate-800 rounded-2xl backdrop-blur-md">
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white">94.2%</div>
            <div className="text-xs text-slate-400 mt-1">Interview Pass Rate</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-cyan-400">18,000+</div>
            <div className="text-xs text-slate-400 mt-1">Interviews Conducted</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-blue-400">4.9 / 5</div>
            <div className="text-xs text-slate-400 mt-1">Candidate Rating</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-indigo-400">FAANG+</div>
            <div className="text-xs text-slate-400 mt-1">Curated Benchmarks</div>
          </div>
        </div>
      </section>

      {/* Interactive Mock Preview Section */}
      <section className="py-16 bg-slate-900/40 border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold">The Immersive Interview Experience</h2>
            <p className="text-slate-400 text-sm mt-2">See how our AI voice agent and coding environment work together in real-time</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* AI Avatar Side */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center">
              <VoiceAvatar
                state="speaking"
                textToSpeak="Welcome to your Technical Mock Session. Can you explain how you handle race conditions in an asynchronous distributed service?"
                autoPlay={false}
              />
              <div className="mt-4 text-center">
                <span className="text-xs text-slate-400">AI Senior Interviewer • Real-time Speech Synthesis</span>
              </div>
            </div>

            {/* Live Coding Snippet Side */}
            <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="ml-2 text-xs font-mono text-slate-400">solution.py — Python 3</span>
                </div>
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono">
                  All 3 Tests Passed (0.04s)
                </span>
              </div>
              <pre className="mt-4 text-xs font-mono text-slate-300 leading-relaxed overflow-x-auto">
{`def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        diff = target - num
        if diff in seen:
            return [seen[diff], i]  # O(1) hash lookup
        seen[num] = i
    return []

# AI Feedback: Optimal O(N) time and O(N) space. Clean hash-map implementation.`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-extrabold sm:text-4xl">Everything You Need to Land the Offer</h2>
          <p className="mt-4 text-slate-400">
            Engineered from ground up to replicate true high-bar tech interviews, from FAANG coding screens to Staff-level architecture sessions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 transition">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-4">
              <Mic className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Live Voice & Audio Avatar</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Real-time speech recognition and text-to-speech synthesize natural interview dialogue, simulating realistic pressure and conversation pacing.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-blue-500/40 transition">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4">
              <Code2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Monaco Code IDE & Runner</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Full VS Code editor with multi-language execution, instant syntax checks, time/memory profiling, and automated test cases.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 transition">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4">
              <BarChart2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Knowledge Gap Detection</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Automated analytics isolate specific conceptual blind spots (e.g. concurrency, caching, STAR structure) with Recharts radar analysis.
            </p>
          </div>

          {/* Card 4 */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 transition">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Personalized Learning Roadmap</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Receive a customized action plan with step-by-step milestones, priority tasks, and curated learning resources to fix your weaknesses.
            </p>
          </div>

          {/* Card 5 */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-purple-500/40 transition">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-4">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Downloadable PDF Reports</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Generate official hiring recommendation documents with executive summaries, scoring rubrics, and model answers.
            </p>
          </div>

          {/* Card 6 */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-amber-500/40 transition">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Resume-Tailored Questions</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Upload your CV and receive questions targeted directly at your listed tech stack, projects, and declared seniority.
            </p>
          </div>
        </div>
      </section>

      {/* Role Tracks */}
      <section id="tracks" className="py-20 bg-slate-900/40 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Supported Roles & Technical Tracks</h2>
            <p className="text-slate-400 text-sm mt-2">Comprehensive curriculum calibrated from Junior to Staff Engineer</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { role: 'Frontend Engineer', skills: 'React, TypeScript, CSS, Performance' },
              { role: 'Backend Engineer', skills: 'Python, Node, Concurrency, APIs' },
              { role: 'Full Stack Engineer', skills: 'E2E Architecture, DBs, Microservices' },
              { role: 'System Design', skills: 'Scalability, Sharding, Caching, CAP' },
              { role: 'DevOps / Cloud', skills: 'Docker, K8s, CI/CD, AWS, Terraform' },
              { role: 'Data & ML Engineer', skills: 'Pipelines, PyTorch, Pandas, SQL' },
              { role: 'Behavioral & Leadership', skills: 'STAR Method, Conflict, Ownership' },
              { role: 'Algorithms & DS', skills: 'Dynamic Prog, Graphs, Trees, Heaps' },
            ].map((track, i) => (
              <div key={i} className="p-4 rounded-xl bg-slate-900 border border-slate-800/80 hover:border-slate-700 transition">
                <h4 className="font-semibold text-white text-sm">{track.role}</h4>
                <p className="text-xs text-slate-400 mt-1">{track.skills}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-20 max-w-5xl mx-auto px-4 text-center">
        <div className="p-10 rounded-3xl bg-gradient-to-r from-cyan-900/30 via-blue-900/40 to-indigo-900/30 border border-cyan-500/30 shadow-2xl">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Ready to Accelerate Your Interview Readiness?
          </h2>
          <p className="text-slate-300 max-w-xl mx-auto mb-8 text-sm sm:text-base">
            Start with our diagnostic mock interview now. Instant evaluation, zero cost, and complete feedback in minutes.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-base shadow-lg transition"
          >
            <span>Create Free Account</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
};
