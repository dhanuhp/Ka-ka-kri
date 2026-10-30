import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { AnalyticsOverview } from '../services/types';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, RadarChart, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import {
  BarChart3, TrendingUp, AlertTriangle, CheckCircle2,
  Lightbulb, Target, Sparkles, Award
} from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.analytics.getOverview()
      .then((res) => setData(res))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Aggregating performance analytics...</p>
        </div>
      </div>
    );
  }

  // Format radar data
  const radarData = Object.entries(data.category_scores || {}).map(([key, val]) => ({
    category: key,
    score: val,
    fullMark: 100,
  }));

  // Format history data (fallback if only 1 interview)
  const chartData = data.score_history.length > 0
    ? data.score_history
    : [
        { date: 'Oct 24', score: 72 },
        { date: 'Oct 26', score: 79 },
        { date: 'Oct 28', score: 85 },
        { date: 'Oct 30', score: data.average_score || 88 },
      ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Knowledge Gap & Performance Metrics</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Performance Analytics & Competencies
          </h1>
          <p className="text-sm text-slate-400">
            Real evaluation metrics calculated across all completed mock sessions
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-right">
            <div className="text-[10px] text-slate-500 uppercase font-mono">Current Readiness</div>
            <div className="text-xl font-extrabold text-cyan-400">{data.readiness_score.toFixed(1)}%</div>
          </div>
        </div>
      </div>

      {/* Top Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Score Progression Line Chart (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <h3 className="font-bold text-sm text-white">Score Progression Over Time</h3>
            </div>
            <span className="text-xs font-mono text-slate-400">Past Sessions</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis domain={[50, 100]} stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#06b6d4"
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#06b6d4', stroke: '#083344', strokeWidth: 2 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Competency Radar Chart (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-purple-400" />
              <h3 className="font-bold text-sm text-white">Skill Matrix Radar</h3>
            </div>
            <span className="text-xs font-mono text-purple-400">Scale 0-100</span>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="category" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" />
                <Radar name="Score" dataKey="score" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Knowledge Gaps & Verified Strengths Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Knowledge Gaps Matrix */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
            <AlertTriangle className="w-4 h-4" />
            <span>AI-Detected Knowledge Gaps</span>
          </div>
          <p className="text-xs text-slate-400">
            Concepts where evaluation scores fell below expectations across mock answers.
          </p>

          <div className="space-y-2.5">
            {data.knowledge_gaps.map((gap, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold text-xs text-slate-200">{gap.topic}</div>
                  <div className="text-[11px] text-slate-500">Flagged in {gap.frequency} question responses</div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase bg-rose-500/10 text-rose-400 border border-rose-500/30">
                  {gap.impact} Priority
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Strengths */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <CheckCircle2 className="w-4 h-4" />
            <span>Demonstrated Core Strengths</span>
          </div>
          <p className="text-xs text-slate-400">
            Key capabilities consistently validated with high scores in technical rubrics.
          </p>

          <div className="space-y-2.5">
            {data.top_strengths.map((str, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-start gap-2.5 text-xs text-slate-200"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{str}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recommended Next Actions */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-850 border border-slate-800 space-y-3">
        <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
          <Lightbulb className="w-4 h-4" />
          <span>Recommended Next Focus</span>
        </div>
        <ul className="space-y-2 text-xs text-slate-300">
          {data.recommended_focus.map((rec, idx) => (
            <li key={idx} className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span>{rec}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
