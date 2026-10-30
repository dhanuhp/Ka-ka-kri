import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { LearningRoadmap, LearningTask } from '../services/types';
import {
  Map, CheckCircle2, Clock, ExternalLink, Sparkles,
  ArrowRight, BookOpen, AlertCircle, PlayCircle, Target
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const LearningRoadmapPage: React.FC = () => {
  const [roadmap, setRoadmap] = useState<LearningRoadmap | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingTaskId, setUpdatingTaskId] = useState<number | null>(null);

  useEffect(() => {
    api.roadmaps.getCurrent()
      .then((res) => setRoadmap(res))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleStatusChange = async (taskId: number, newStatus: 'todo' | 'in_progress' | 'completed') => {
    setUpdatingTaskId(taskId);
    try {
      const updatedTask = await api.roadmaps.updateTask(taskId, newStatus);
      if (newStatus === 'completed') {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      }
      if (roadmap) {
        const updatedTasks = roadmap.tasks.map((t) => (t.id === taskId ? updatedTask : t));
        const completedCount = updatedTasks.filter((t) => t.status === 'completed').length;
        const newReadiness = Math.min(99, roadmap.readiness_score + (newStatus === 'completed' ? 2.5 : -2.5));
        setRoadmap({
          ...roadmap,
          readiness_score: newReadiness,
          tasks: updatedTasks,
        });
      }
    } catch (err) {
      console.error('Failed to update task status:', err);
    } finally {
      setUpdatingTaskId(null);
    }
  };

  if (loading || !roadmap) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Calibrating your personalized roadmap...</p>
        </div>
      </div>
    );
  }

  const completedCount = roadmap.tasks.filter((t) => t.status === 'completed').length;
  const progressPercent = Math.round((completedCount / Math.max(roadmap.tasks.length, 1)) * 100);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8">
      {/* Roadmap Header */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Target: {roadmap.target_role}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {roadmap.title}
            </h1>
            <p className="text-slate-400 text-sm max-w-xl">
              {roadmap.description}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 text-center min-w-[180px]">
            <div className="text-[11px] text-slate-400 uppercase font-mono">Curriculum Completion</div>
            <div className="text-3xl font-extrabold text-emerald-400 mt-1">{progressPercent}%</div>
            <div className="text-[11px] text-slate-500 mt-0.5">{completedCount} of {roadmap.tasks.length} Milestones</div>
          </div>
        </div>

        {/* Overall progress bar */}
        <div className="relative z-10 mt-6 w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-emerald-500 to-teal-400 h-2.5 rounded-full transition-all duration-700"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Task Milestones List */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Target className="w-5 h-5 text-emerald-400" />
          <span>Priority Mastery Milestones</span>
        </h2>

        <div className="space-y-4">
          {roadmap.tasks.map((task, idx) => (
            <div
              key={task.id}
              className={`p-6 rounded-2xl border transition shadow-xl ${
                task.status === 'completed'
                  ? 'bg-slate-900/40 border-slate-800/80 opacity-80'
                  : task.status === 'in_progress'
                  ? 'bg-slate-900 border-cyan-500/40 shadow-cyan-500/5'
                  : 'bg-slate-900/80 border-slate-800'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 font-bold text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium">
                      {task.category}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold uppercase ${
                        task.priority === 'critical'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : task.priority === 'high'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-slate-700/40 text-slate-400'
                      }`}
                    >
                      {task.priority} Priority
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3 text-slate-500" />
                      ~{task.estimated_hours}h
                    </span>
                  </div>

                  <h3 className={`text-base font-bold ${task.status === 'completed' ? 'line-through text-slate-400' : 'text-white'}`}>
                    {task.title}
                  </h3>

                  <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                    {task.description}
                  </p>

                  {/* Curated Resources */}
                  {task.resources && task.resources.length > 0 && (
                    <div className="pt-2 flex flex-wrap items-center gap-2">
                      <span className="text-[11px] text-slate-400 font-semibold">Recommended Study:</span>
                      {task.resources.map((res, rIdx) => (
                        <a
                          key={rIdx}
                          href={res.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-cyan-400 hover:text-cyan-300 hover:border-slate-700 transition"
                        >
                          <BookOpen className="w-3 h-3" />
                          <span>{res.title}</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      ))}
                    </div>
                  )}
                </div>

                {/* Status Toggle Selector */}
                <div className="shrink-0 flex sm:flex-col items-center sm:items-end gap-2">
                  <select
                    value={task.status}
                    disabled={updatingTaskId === task.id}
                    onChange={(e) => handleStatusChange(task.id, e.target.value as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold focus:outline-none transition border ${
                      task.status === 'completed'
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                        : task.status === 'in_progress'
                        ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
                        : 'bg-slate-950 text-slate-300 border-slate-700'
                    }`}
                  >
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed ✓</option>
                  </select>

                  <Link
                    to="/interviews/setup"
                    className="p-1.5 text-xs text-slate-400 hover:text-cyan-400 flex items-center gap-1 transition"
                  >
                    <span>Practice Mock</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
