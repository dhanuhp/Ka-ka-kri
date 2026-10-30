import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { UserProfile, Resume } from '../services/types';
import {
  User, Briefcase, FileText, Upload, Trash2, CheckCircle2,
  AlertCircle, Plus, X, Globe, Phone, MapPin, Sparkles
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfileAndResumes = async () => {
      try {
        const [profData, resData] = await Promise.all([
          api.users.getProfile(),
          api.resumes.list(),
        ]);
        setProfile(profData);
        setResumes(resData);
      } catch (err: any) {
        setError('Failed to load profile data');
      }
    };
    fetchProfileAndResumes();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const updated = await api.users.updateProfile(profile);
      setProfile(updated);
      await refreshUser();
      setMessage('Profile saved successfully!');
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAddSkill = () => {
    if (!newSkill.trim() || !profile) return;
    const currentSkills = profile.skills || [];
    if (!currentSkills.includes(newSkill.trim())) {
      setProfile({
        ...profile,
        skills: [...currentSkills, newSkill.trim()],
      });
    }
    setNewSkill('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    if (!profile) return;
    setProfile({
      ...profile,
      skills: (profile.skills || []).filter((s) => s !== skillToRemove),
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setMessage(null);
    setError(null);
    try {
      const newResume = await api.resumes.upload(file);
      setResumes([newResume, ...resumes]);
      // Update profile skills
      const prof = await api.users.getProfile();
      setProfile(prof);
      setMessage(`Resume '${file.name}' parsed successfully! Extracted ${newResume.parsed_skills.length} skills.`);
      setTimeout(() => setMessage(null), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to upload and parse resume');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteResume = async (id: number) => {
    try {
      await api.resumes.delete(id);
      setResumes(resumes.filter((r) => r.id !== id));
      setMessage('Resume deleted.');
      setTimeout(() => setMessage(null), 2500);
    } catch (err: any) {
      setError('Failed to delete resume');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Candidate Profile & Resume
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Manage your personal details, target tracks, and resumes for personalized AI question generation
        </p>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Profile Form */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <h2 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <User className="w-4 h-4 text-cyan-400" />
              <span>Professional Overview</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Headline</label>
                <input
                  type="text"
                  value={profile?.headline || ''}
                  onChange={(e) => setProfile({ ...profile!, headline: e.target.value })}
                  placeholder="e.g. Senior Full Stack Engineer"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Target Role</label>
                <input
                  type="text"
                  value={profile?.target_role || ''}
                  onChange={(e) => setProfile({ ...profile!, target_role: e.target.value })}
                  placeholder="e.g. Distributed Systems Engineer"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Professional Bio</label>
              <textarea
                rows={3}
                value={profile?.bio || ''}
                onChange={(e) => setProfile({ ...profile!, bio: e.target.value })}
                placeholder="Brief summary of your technical background, accomplishments, and career goals..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-500 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Experience Level</label>
                <select
                  value={profile?.experience_level || 'Mid-Level'}
                  onChange={(e) => setProfile({ ...profile!, experience_level: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                >
                  <option value="Entry-Level">Entry-Level (0-1 yrs)</option>
                  <option value="Junior">Junior (1-3 yrs)</option>
                  <option value="Mid-Level">Mid-Level (3-5 yrs)</option>
                  <option value="Senior">Senior (5-8 yrs)</option>
                  <option value="Lead / Staff">Lead / Staff (8+ yrs)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Location</label>
                <input
                  type="text"
                  value={profile?.location || ''}
                  onChange={(e) => setProfile({ ...profile!, location: e.target.value })}
                  placeholder="e.g. San Francisco, CA (or Remote)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">GitHub Profile URL</label>
                <input
                  type="url"
                  value={profile?.github_url || ''}
                  onChange={(e) => setProfile({ ...profile!, github_url: e.target.value })}
                  placeholder="https://github.com/username"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">LinkedIn Profile URL</label>
                <input
                  type="url"
                  value={profile?.linkedin_url || ''}
                  onChange={(e) => setProfile({ ...profile!, linkedin_url: e.target.value })}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>
            </div>

            {/* Skills manager */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-300 mb-2">Technical Skills & Technologies</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {profile?.skills?.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs text-cyan-300 font-mono"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="hover:text-rose-400 transition"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSkill();
                    }
                  }}
                  placeholder="Add skill (e.g. Docker, GraphQL, Redis)..."
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={saving}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-xs shadow-md transition disabled:opacity-50"
              >
                {saving ? 'Saving Changes...' : 'Save Profile Details'}
              </button>
            </div>
          </form>
        </div>

        {/* Right: Resume Management */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              <span>Resume & CV Parser</span>
            </h2>

            {/* Upload Box */}
            <div className="border-2 border-dashed border-slate-700/80 hover:border-cyan-500/60 rounded-2xl p-6 text-center transition bg-slate-950/40 relative">
              <input
                type="file"
                accept=".pdf,.txt,.docx,.md"
                onChange={handleFileUpload}
                disabled={uploading}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                  <Upload className={`w-6 h-6 ${uploading ? 'animate-bounce' : ''}`} />
                </div>
                <div className="font-semibold text-xs text-slate-200">
                  {uploading ? 'Parsing Resume & Skills...' : 'Click or drag resume here'}
                </div>
                <p className="text-[11px] text-slate-500">Supports PDF, DOCX, TXT (up to 10MB)</p>
              </div>
            </div>

            {/* Resume List */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Uploaded Resumes ({resumes.length})
              </h3>
              {resumes.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No resumes uploaded yet. Upload one to get questions tailored to your experience!</p>
              ) : (
                resumes.map((res) => (
                  <div
                    key={res.id}
                    className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-start justify-between gap-3"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="font-semibold text-xs text-slate-200 truncate flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span className="truncate">{res.filename}</span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {res.experience_years} years exp • {res.parsed_skills.length} skills identified
                      </div>
                      <div className="flex flex-wrap gap-1 pt-1">
                        {res.parsed_skills.slice(0, 4).map((sk) => (
                          <span key={sk} className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono">
                            {sk}
                          </span>
                        ))}
                        {res.parsed_skills.length > 4 && (
                          <span className="text-[10px] text-slate-500 font-mono">+{res.parsed_skills.length - 4} more</span>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteResume(res.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 transition rounded-lg hover:bg-slate-900"
                      title="Delete resume"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
