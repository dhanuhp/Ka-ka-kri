import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Interview, UserProgress, LearningRoadmap, AnalyticsOverview } from '../services/types';
import { ScoreBadge } from '../components/ScoreBadge';
import {
  PlayCircle, Map, Code2, BarChart3, Flame, Award,
  CheckCircle2, Clock, ArrowRight, Zap, Target, BookOpen
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [roadmap, setRoadmap] = useState<LearningRoadmap | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [progData, intData, roadData, analData] = await Promise.all([
          api.users.getProgress(),
          api.interviews.list(),
          api.roadmaps.getCurrent(),
          api.analytics.getOverview(),
        ]);
        setProgress(progData);
        setInterviews(intData);
        setRoadmap(roadData);
        setAnalytics(analData);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const completedTasks = roadmap?.tasks.filter(t => t.status === 'completed').length || 0;
  const totalTasks = roadmap?.tasks.length || 1;
  const roadmapProgressPercent = Math.round((completedTasks / totalTasks) * 100);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Welcome Banner */}
      <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold">
              <Zap className="w-3.5 h-3.5" />
              <span>Target Role: {user?.profile?.target_role || 'Software Engineer'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome, {user?.full_name}!
            </h1>
            <p className="text-slate-400 text-sm max-w-2xl">
              You are on a <span className="text-cyan-400 font-semibold">{progress?.current_streak_days || 1}-day practice streak</span>. 
              Complete your next mock interview to boost your readiness score and calibrate your roadmap.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/interviews/setup"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-sm shadow-lg shadow-cyan-500/20 transition transform hover:-translate-y-0.5"
            >
              <PlayCircle className="w-4 h-4" />
              <span>Start New Interview</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Readiness Score */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-3">
            <span>Interview Readiness</span>
            <Target className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-white">
              {progress?.readiness_score ? progress.readiness_score.toFixed(1) : 45.0}%
            </span>
            <span className="text-xs text-emerald-400 font-semibold">+4.5% this week</span>
          </div>
          <div className="mt-3 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-cyan-500 to-blue-500 h-1.5 rounded-full transition-all duration-1000"
              style={{ width: `${progress?.readiness_score || 45}%` }}
            />
          </div>
        </div>

        {/* Total Interviews */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-3">
            <span>Completed Sessions</span>
            <Award className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-white">
              {progress?.total_interviews_completed || interviews.filter(i => i.status === 'completed').length}
            </span>
            <span className="text-xs text-slate-400">Total sessions</span>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            {interviews.filter(i => i.status === 'in_progress').length} active in progress
          </p>
        </div>

        {/* Average Score */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-3">
            <span>Average Evaluation</span>
            <BarChart3 className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-white">
              {progress?.average_score ? progress.average_score.toFixed(1) : '84.5'}%
            </span>
            <span className="text-xs text-emerald-400 font-semibold">Senior Benchmark</span>
          </div>
          <p className="mt-2 text-xs text-slate-500">Based on technical and behavioral rubric</p>
        </div>

        {/* Streak */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-3">
            <span>Daily Streak</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-white">
              {progress?.current_streak_days || 1}
            </span>
            <span className="text-xs text-amber-400 font-semibold">Days Active 🔥</span>
          </div>
          <p className="mt-2 text-xs text-slate-500">Keep practicing daily to stay sharp</p>
        </div>
      </div>

      {/* Main Grid: Recent Interviews & Career Roadmap */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Recent Interviews */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-bold text-white">Recent Mock Interviews</h2>
            </div>
            <Link to="/history" className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition">
              <span>View All History</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {interviews.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 text-center space-y-3">
              <p className="text-slate-400 text-sm">No interviews recorded yet.</p>
              <Link
                to="/interviews/setup"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 text-white text-xs font-semibold"
              >
                <span>Launch Your First Interview</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {interviews.slice(0, 4).map((item) => (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <h3 className="font-bold text-sm text-white">{item.title}</h3>
                      <ScoreBadge score={item.overall_score} recommendation={item.recommendation} size="sm" />
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span>{new Date(item.created_at).toLocaleDateString()}</span>
                      <span>•</span>
                      <span className="capitalize">{item.interview_type}</span>
                      <span>•</span>
                      <span>{item.total_questions} Questions</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {item.status === 'completed' ? (
                      <Link
                        to={`/interviews/${item.id}/results`}
                        className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition"
                      >
                        View Evaluation
                      </Link>
                    ) : (
                      <Link
                        to={`/interviews/${item.id}/room`}
                        className="px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition"
                      >
                        Resume Session
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quick Action Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <Link
              to="/sandbox"
              className="p-4 rounded-xl bg-gradient-to-br from-slate-900 to-slate-850 border border-slate-800 hover:border-cyan-500/30 transition flex items-center gap-3 group"
            >
              <div className="w-10 h-10 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center group-hover:scale-105 transition">
                <Code2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Monaco Code Sandbox</h4>
                <p className="text-xs text-slate-400">Practice algorithms with test cases</p>
              </div>
            </Link>

            <Link
              to="/analytics"
              className="p-4 rounded-xl bg-gradient-to-br from-slate-900 to-slate-850 border border-slate-800 hover:border-blue-500/30 transition flex items-center gap-3 group"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center group-hover:scale-105 transition">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Skill Analytics</h4>
                <p className="text-xs text-slate-400">Radar gaps & performance trends</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Right Column: Active Career Roadmap & Gaps */}
        <div className="lg:col-span-5 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Map className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-bold text-white">Targeted Career Roadmap</h2>
            </div>
            <Link to="/roadmap" className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition">
              Full Plan
            </Link>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-5">
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-semibold text-slate-300 truncate">{roadmap?.title || 'Personalized Preparation Plan'}</span>
                <span className="text-emerald-400 font-mono font-bold">{roadmapProgressPercent}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${roadmapProgressPercent}%` }}
                />
              </div>
            </div>

            <div className="space-y-3">
              {roadmap?.tasks.slice(0, 3).map((task) => (
                <div
                  key={task.id}
                  className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-start gap-3"
                >
                  <div className="pt-0.5">
                    {task.status === 'completed' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-slate-600" />
                    )}
                  </div>
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className={`text-xs font-semibold truncate ${task.status === 'completed' ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                        {task.title}
                      </h4>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono uppercase ${
                        task.priority === 'critical' ? 'bg-rose-500/20 text-rose-400' : 'bg-cyan-500/20 text-cyan-400'
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-1">{task.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <Link
              to="/roadmap"
              className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Explore All Milestones & Resources</span>
            </Link>
          </div>

          {/* Top Identified Knowledge Gaps */}
          {analytics?.knowledge_gaps && analytics.knowledge_gaps.length > 0 && (
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Top Priority Focus Areas
              </h3>
              <div className="space-y-2">
                {analytics.knowledge_gaps.slice(0, 3).map((gap, i) => (
                  <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-slate-800/60 last:border-0">
                    <span className="text-slate-300 truncate max-w-[240px]">{gap.topic}</span>
                    <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 font-mono text-[10px]">
                      {gap.impact} Priority
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
