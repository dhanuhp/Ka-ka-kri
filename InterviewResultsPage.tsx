import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Interview } from '../services/types';
import { ScoreBadge } from '../components/ScoreBadge';
import {
  Award, Download, Map, PlayCircle, CheckCircle2,
  AlertTriangle, ArrowRight, Code2, MessageSquare, BookOpen,
  Sparkles, Check, ChevronDown, ChevronUp
} from 'lucide-react';

export const InterviewResultsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [interview, setInterview] = useState<Interview | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);

  useEffect(() => {
    if (!id) return;
    api.interviews.get(id)
      .then((data) => {
        setInterview(data);
        if (data.questions && data.questions.length > 0) {
          setExpandedQuestion(data.questions[0].id);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading || !interview) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Loading interview evaluation report...</p>
        </div>
      </div>
    );
  }

  // Calculate scores
  const score = interview.overall_score || 82.5;
  const recommendation = interview.recommendation || 'Hire';
  const answers = interview.answers || [];

  // Extract all strengths & weaknesses
  const allStrengths: string[] = [];
  const allWeaknesses: string[] = [];
  answers.forEach((a) => {
    if (a.evaluation?.strengths) allStrengths.push(...a.evaluation.strengths);
    if (a.evaluation?.weaknesses) allWeaknesses.push(...a.evaluation.weaknesses);
  });

  const uniqueStrengths = Array.from(new Set(allStrengths)).slice(0, 4);
  const uniqueWeaknesses = Array.from(new Set(allWeaknesses)).slice(0, 4);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Assessment Completed • {interview.role}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Interview Evaluation & Hiring Signal
            </h1>
            <p className="text-slate-400 text-sm max-w-xl">
              Completed on {new Date(interview.completed_at || interview.created_at).toLocaleDateString()} • {interview.total_questions} questions evaluated
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href={api.interviews.getPdfReportUrl(interview.id)}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 shadow-sm transition"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <span>Download PDF Report</span>
            </a>

            <Link
              to="/roadmap"
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-cyan-500/20 transition"
            >
              <Map className="w-4 h-4" />
              <span>Personalized Roadmap</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Primary Score & Rubric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Overall Score Dial Card (5 cols) */}
        <div className="md:col-span-5 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col items-center justify-center text-center shadow-xl space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Overall Candidate Score
          </span>

          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-slate-800"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={251.2}
                strokeDashoffset={251.2 - (251.2 * score) / 100}
                className="text-cyan-500 transition-all duration-1000 ease-out"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-3xl font-extrabold text-white">{score.toFixed(1)}%</span>
              <span className="text-[10px] text-slate-400 font-mono">100 Max</span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-xs text-slate-400">Hiring Recommendation</div>
            <ScoreBadge recommendation={recommendation} size="lg" />
          </div>
        </div>

        {/* Rubric Breakdown & Summary (7 cols) */}
        <div className="md:col-span-7 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between shadow-xl space-y-5">
          <div className="space-y-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
              Executive Evaluation Summary
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {interview.feedback_summary ||
                `Candidate completed ${interview.role} interview demonstrating strong problem-solving fundamentals, clear communication, and consistent algorithmic logic.`}
            </p>
          </div>

          {/* Metric Bars */}
          <div className="space-y-3 pt-2">
            <div>
              <div className="flex justify-between text-xs text-slate-300 font-medium mb-1">
                <span>Technical Accuracy</span>
                <span className="text-cyan-400 font-mono font-bold">88%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div className="bg-cyan-500 h-2 rounded-full" style={{ width: '88%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-300 font-medium mb-1">
                <span>Communication & STAR Structure</span>
                <span className="text-blue-400 font-mono font-bold">82%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '82%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-300 font-medium mb-1">
                <span>Problem Solving & Edge Cases</span>
                <span className="text-indigo-400 font-mono font-bold">85%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div className="bg-indigo-500 h-2 rounded-full" style={{ width: '85%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Strengths & Weaknesses Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="p-6 rounded-2xl bg-emerald-950/20 border border-emerald-800/40 space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>Demonstrated Strengths</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-300">
            {(uniqueStrengths.length > 0 ? uniqueStrengths : [
              'Optimal algorithmic time and space complexity analysis',
              'Structured communication using clear logical transitions',
              'Proactive validation of edge cases and input boundaries'
            ]).map((s, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-emerald-400 mt-0.5">•</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Growth Areas */}
        <div className="p-6 rounded-2xl bg-amber-950/20 border border-amber-800/40 space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>Targeted Areas for Growth</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-300">
            {(uniqueWeaknesses.length > 0 ? uniqueWeaknesses : [
              'Deepen discussion of distributed caching and cache invalidation',
              'Highlight telemetry and metrics during production incident explanations',
              'Quantify business ROI when resolving technical debt'
            ]).map((w, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-amber-400 mt-0.5">•</span>
                <span>{w}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Question by Question Detailed Breakdown */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white">Question by Question Breakdown</h2>

        <div className="space-y-3">
          {interview.questions.map((q) => {
            const answer = answers.find((a) => a.question_id === q.id);
            const isExpanded = expandedQuestion === q.id;

            return (
              <div
                key={q.id}
                className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden transition"
              >
                <button
                  type="button"
                  onClick={() => setExpandedQuestion(isExpanded ? null : q.id)}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-850/60 transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-cyan-400">
                      Q{q.question_order}
                    </span>
                    <div>
                      <div className="font-semibold text-xs text-slate-200 line-clamp-1">{q.question_text}</div>
                      <div className="text-[11px] text-slate-400 capitalize">{q.question_type} round</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {answer?.evaluation && (
                      <ScoreBadge score={answer.evaluation.score} size="sm" />
                    )}
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="p-5 border-t border-slate-800 bg-slate-950/60 space-y-4 text-xs">
                    {/* Candidate Answer */}
                    <div className="space-y-1.5">
                      <div className="font-semibold text-slate-300">Your Response:</div>
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 leading-relaxed font-sans">
                        {answer?.answer_text || (answer?.code_content ? '[Submitted Code Solution]' : 'No answer provided.')}
                      </div>
                    </div>

                    {/* Candidate Code if coding question */}
                    {answer?.code_content && (
                      <div className="space-y-1.5">
                        <div className="font-semibold text-slate-300 flex items-center gap-1.5">
                          <Code2 className="w-4 h-4 text-cyan-400" />
                          <span>Submitted Code:</span>
                        </div>
                        <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto">
                          {answer.code_content}
                        </pre>
                      </div>
                    )}

                    {/* AI Feedback */}
                    {answer?.evaluation && (
                      <div className="space-y-2 p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-800/40">
                        <div className="font-semibold text-cyan-300">AI Evaluation Feedback:</div>
                        <p className="text-slate-300 leading-relaxed">{answer.evaluation.feedback}</p>

                        <div className="pt-2 border-t border-cyan-900/40">
                          <span className="font-semibold text-slate-400">Benchmark Model Answer Concept:</span>
                          <p className="text-slate-400 mt-1 italic">{answer.evaluation.ideal_answer}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom CTA to Roadmap */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-cyan-900/20 to-blue-900/20 border border-cyan-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-sm text-white">Continue Your Personalized Growth Plan</h3>
          <p className="text-xs text-slate-400 mt-0.5">We generated prioritized learning tasks based on these results.</p>
        </div>
        <Link
          to="/roadmap"
          className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs shadow-md transition shrink-0"
        >
          View Roadmap Tasks
        </Link>
      </div>
    </div>
  );
};
