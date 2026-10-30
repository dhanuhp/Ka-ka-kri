import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Resume } from '../services/types';
import {
  Sparkles, Code2, Users, Cpu, Layers, Sliders,
  FileText, Clock, PlayCircle, AlertCircle, ArrowRight
} from 'lucide-react';

export const InterviewSetupPage: React.FC = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('Full Stack Software Engineer');
  const [interviewType, setInterviewType] = useState<'mixed' | 'technical' | 'coding' | 'system_design' | 'behavioral'>('mixed');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [totalQuestions, setTotalQuestions] = useState(3);
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [selectedResumeId, setSelectedResumeId] = useState<number | null>(null);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [focusTopicInput, setFocusTopicInput] = useState('');
  const [focusTopics, setFocusTopics] = useState<string[]>(['Distributed Systems', 'Data Structures']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.resumes.list()
      .then(res => {
        setResumes(res);
        if (res.length > 0) setSelectedResumeId(res[0].id);
      })
      .catch(() => {});
  }, []);

  const handleAddTopic = () => {
    if (!focusTopicInput.trim()) return;
    if (!focusTopics.includes(focusTopicInput.trim())) {
      setFocusTopics([...focusTopics, focusTopicInput.trim()]);
    }
    setFocusTopicInput('');
  };

  const handleRemoveTopic = (t: string) => {
    setFocusTopics(focusTopics.filter(item => item !== t));
  };

  const handleStartInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const interview = await api.interviews.create({
        role,
        interview_type: interviewType,
        difficulty,
        total_questions: totalQuestions,
        duration_minutes: durationMinutes,
        focus_topics: focusTopics,
        resume_id: selectedResumeId,
      });
      navigate(`/interviews/${interview.id}/room`);
    } catch (err: any) {
      setError(err.message || 'Failed to initialize interview session');
      setLoading(false);
    }
  };

  const interviewTypes = [
    {
      id: 'mixed',
      title: 'Full Mock (Recommended)',
      desc: 'Balanced combination of coding, technical concepts, and behavioral leadership.',
      icon: Layers,
    },
    {
      id: 'coding',
      title: 'Algorithmic Coding',
      desc: 'Hands-on problem solving in Monaco editor with automated test suite.',
      icon: Code2,
    },
    {
      id: 'technical',
      title: 'Technical & Architecture',
      desc: 'In-depth concepts, protocols, asynchronous runtimes, and engineering trade-offs.',
      icon: Cpu,
    },
    {
      id: 'system_design',
      title: 'System Design',
      desc: 'Large scale distributed systems, caching, partitioning, and bottleneck mitigation.',
      icon: Sliders,
    },
    {
      id: 'behavioral',
      title: 'Behavioral (STAR)',
      desc: 'Culture, conflict resolution, ownership, and stakeholder incident communication.',
      icon: Users,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8">
      {/* Title */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Interactive AI Session Configuration</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Configure Your Mock Interview</h1>
        <p className="text-sm text-slate-400 max-w-xl mx-auto">
          Customize the role, focus topics, and difficulty. Our AI interviewer will synthesize questions calibrated to your level.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleStartInterview} className="space-y-6">
        {/* Step 1: Target Role */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
            Step 1: Target Role & Title
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              'Full Stack Software Engineer',
              'Frontend Engineer',
              'Backend Engineer',
              'Distributed Systems Architect',
              'DevOps & Infrastructure Engineer',
              'Machine Learning Engineer',
            ].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`p-3.5 rounded-xl border text-left text-xs font-semibold transition ${
                  role === r
                    ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-md shadow-cyan-500/10'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Track Type */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
            Step 2: Interview Type
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {interviewTypes.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setInterviewType(t.id as any)}
                  className={`p-4 rounded-xl border text-left transition flex flex-col justify-between ${
                    interviewType === t.id
                      ? 'bg-blue-600/20 border-blue-500 text-blue-200 shadow-md shadow-blue-500/10'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className={`w-4 h-4 ${interviewType === t.id ? 'text-blue-400' : 'text-slate-500'}`} />
                    <span className="font-bold text-xs text-slate-200">{t.title}</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-400">{t.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 3: Difficulty & Duration */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">Difficulty Level</label>
            <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800">
              {(['easy', 'medium', 'hard'] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDifficulty(d)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
                    difficulty === d
                      ? 'bg-cyan-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">Total Questions</label>
            <select
              value={totalQuestions}
              onChange={(e) => setTotalQuestions(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            >
              <option value={1}>1 Question (Quick Test)</option>
              <option value={3}>3 Questions (Standard)</option>
              <option value={5}>5 Questions (Comprehensive)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">Session Limit</label>
            <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>{durationMinutes} Minutes</span>
            </div>
          </div>
        </div>

        {/* Step 4: Resume Selection (Optional) */}
        {resumes.length > 0 && (
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              <span>Personalize with Uploaded Resume</span>
            </h2>
            <select
              value={selectedResumeId || ''}
              onChange={(e) => setSelectedResumeId(e.target.value ? Number(e.target.value) : null)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            >
              <option value="">None (Standard Industry Questions)</option>
              {resumes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.filename} ({r.experience_years} yrs exp • {r.parsed_skills.slice(0, 3).join(', ')}...)
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Step 5: Focus Topics */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
          <label className="block text-xs font-semibold text-slate-300">Focus Topics & Core Competencies</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {focusTopics.map((topic) => (
              <span
                key={topic}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs text-cyan-300 font-mono"
              >
                <span>{topic}</span>
                <button type="button" onClick={() => handleRemoveTopic(topic)} className="hover:text-rose-400">
                  ×
                </button>
              </span>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={focusTopicInput}
              onChange={(e) => setFocusTopicInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTopic();
                }
              }}
              placeholder="Add topic (e.g. Async IO, WebSockets, Redis, Trees)..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
            <button
              type="button"
              onClick={handleAddTopic}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl"
            >
              Add Topic
            </button>
          </div>
        </div>

        {/* Launch Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-sm shadow-xl shadow-cyan-500/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span>AI Interviewer Synthesizing Questions...</span>
              </div>
            ) : (
              <>
                <PlayCircle className="w-5 h-5" />
                <span>Launch Live Interview Room</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
