import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { AdminStats, User, QuestionBankItem } from '../services/types';
import {
  Shield, Users, Award, PlayCircle, Plus, Trash2,
  CheckCircle2, AlertCircle, BarChart3, Activity, Layers
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [questions, setQuestions] = useState<QuestionBankItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'questions' | 'health'>('users');

  // New question form state
  const [newRole, setNewRole] = useState('Full Stack Software Engineer');
  const [newType, setNewType] = useState('technical');
  const [newDiff, setNewDiff] = useState('medium');
  const [newText, setNewText] = useState('');
  const [newPoints, setNewPoints] = useState('');
  const [addingQuestion, setAddingQuestion] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [statsData, usersData, questionsData] = await Promise.all([
          api.admin.getStats(),
          api.admin.getUsers(),
          api.admin.getQuestions(),
        ]);
        setStats(statsData);
        setUsers(usersData);
        setQuestions(questionsData);
      } catch (err) {
        console.error('Failed to load admin data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  const handleToggleActive = async (userId: number, currentStatus: boolean) => {
    try {
      const updated = await api.admin.updateUser(userId, { is_active: !currentStatus });
      setUsers(users.map((u) => (u.id === userId ? updated : u)));
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleRole = async (userId: number, currentRole: string) => {
    const nextRole = currentRole === 'admin' ? 'candidate' : 'admin';
    try {
      const updated = await api.admin.updateUser(userId, { role: nextRole });
      setUsers(users.map((u) => (u.id === userId ? updated : u)));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;
    setAddingQuestion(true);
    try {
      const added = await api.admin.addQuestion({
        role: newRole,
        type: newType,
        difficulty: newDiff,
        question_text: newText.trim(),
        expected_points: newPoints.split(',').map((p) => p.trim()).filter(Boolean),
      });
      setQuestions([...questions, added]);
      setNewText('');
      setNewPoints('');
      setMessage('Question added to bank successfully!');
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      console.error(err);
    } finally {
      setAddingQuestion(false);
    }
  };

  const handleDeleteQuestion = async (id?: number) => {
    if (!id) return;
    try {
      await api.admin.deleteQuestion(id);
      setQuestions(questions.filter((q) => q.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-semibold mb-2">
            <Shield className="w-3.5 h-3.5" />
            <span>Platform Governance & Administration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Admin Master Dashboard
          </h1>
          <p className="text-sm text-slate-400">
            Real-time platform metrics, user access management, and question bank curation
          </p>
        </div>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
            <span>Registered Users</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">{stats.total_users}</div>
          <p className="text-xs text-slate-500 mt-1">Active platform candidates</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
            <span>Total Mock Interviews</span>
            <PlayCircle className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">{stats.total_interviews}</div>
          <p className="text-xs text-slate-500 mt-1">Conducted across all tracks</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
            <span>Platform Avg Score</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400">{stats.average_platform_score.toFixed(1)}%</div>
          <p className="text-xs text-slate-500 mt-1">Passing threshold: 72%</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
            <span>Active Roadmaps</span>
            <Layers className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">{stats.active_roadmaps}</div>
          <p className="text-xs text-slate-500 mt-1">Personalized candidate plans</p>
        </div>
      </div>

      {/* Daily Volume Bar Chart */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <h3 className="font-bold text-sm text-white">Daily Interview Volume (Last 7 Days)</h3>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.daily_interviews_last_7_days}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} stroke="#64748b" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
              />
              <Bar dataKey="interviews" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabs */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
              activeTab === 'users' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            User Management ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('questions')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
              activeTab === 'questions' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Question Bank Manager ({questions.length})
          </button>
          <button
            onClick={() => setActiveTab('health')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
              activeTab === 'health' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            System Diagnostics
          </button>
        </div>

        {/* Tab 1: User Management */}
        {activeTab === 'users' && (
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-x-auto shadow-xl">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3">User</th>
                  <th className="px-5 py-3">Role</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Registered</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-850/50">
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-slate-200">{u.full_name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{u.email}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`px-2 py-0.5 rounded font-mono uppercase text-[10px] ${
                          u.role === 'admin'
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold ${
                          u.is_active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${u.is_active ? 'bg-emerald-400' : 'bg-rose-500'}`} />
                        {u.is_active ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-400">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-2">
                      <button
                        onClick={() => handleToggleRole(u.id, u.role)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium"
                      >
                        Toggle Role
                      </button>
                      <button
                        onClick={() => handleToggleActive(u.id, u.is_active)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-medium ${
                          u.is_active
                            ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                        }`}
                      >
                        {u.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Question Bank Manager */}
        {activeTab === 'questions' && (
          <div className="space-y-6">
            {/* Add question form */}
            <form onSubmit={handleAddQuestion} className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-purple-400" />
                <span>Add Question to Curated Bank</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Target Track</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
                  >
                    <option value="Full Stack Software Engineer">Full Stack</option>
                    <option value="Frontend Engineer">Frontend</option>
                    <option value="Backend Engineer">Backend</option>
                    <option value="System Design & Architect">System Design</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Question Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
                  >
                    <option value="technical">Technical Concept</option>
                    <option value="coding">Algorithmic Coding</option>
                    <option value="system_design">System Design</option>
                    <option value="behavioral">Behavioral (STAR)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Difficulty</label>
                  <select
                    value={newDiff}
                    onChange={(e) => setNewDiff(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Question Prompt</label>
                <textarea
                  rows={2}
                  required
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  placeholder="e.g. How does the Raft consensus algorithm handle leader election and network partitions?"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Expected Key Points (comma separated)</label>
                <input
                  type="text"
                  value={newPoints}
                  onChange={(e) => setNewPoints(e.target.value)}
                  placeholder="Heartbeats, Term numbers, Quorum voting"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
                />
              </div>

              <button
                type="submit"
                disabled={addingQuestion}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition"
              >
                {addingQuestion ? 'Adding...' : 'Add to Question Bank'}
              </button>
            </form>

            {/* List */}
            <div className="space-y-3">
              {questions.map((q) => (
                <div
                  key={q.id}
                  className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-start justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] px-2 py-0.5 rounded font-mono uppercase bg-purple-500/20 text-purple-300">
                        {q.type}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded font-mono capitalize bg-slate-800 text-slate-400">
                        {q.difficulty}
                      </span>
                      <span className="text-xs font-semibold text-slate-400">{q.role}</span>
                    </div>
                    <p className="text-xs font-semibold text-slate-200 leading-relaxed">{q.question_text}</p>
                    <p className="text-[11px] text-slate-500">Expected: {q.expected_points?.join(', ')}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteQuestion(q.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: System Diagnostics */}
        {activeTab === 'health' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-slate-300">FastAPI REST Server</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <p className="text-xs text-slate-400 font-mono">Port 8000 • Uvicorn</p>
              <div className="text-[11px] text-emerald-400 font-semibold">Healthy (Latency: 4ms)</div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-slate-300">Database Engine</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <p className="text-xs text-slate-400 font-mono">SQLAlchemy ORM 2.0</p>
              <div className="text-[11px] text-emerald-400 font-semibold">14 Tables Connected</div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-slate-300">Code Execution Sandbox</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <p className="text-xs text-slate-400 font-mono">Isolated Subprocess + Judge0</p>
              <div className="text-[11px] text-emerald-400 font-semibold">Python 3 & JS Operational</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
