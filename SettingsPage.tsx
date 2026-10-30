import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { UserProfile } from '../services/types';
import {
  Settings, KeyRound, Volume2, Code2, ShieldCheck,
  CheckCircle2, AlertCircle, Save, Sparkles
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [aiProvider, setAiProvider] = useState('auto');
  const [geminiKey, setGeminiKey] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');
  const [voiceSpeed, setVoiceSpeed] = useState(1.0);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [editorTheme, setEditorTheme] = useState('vs-dark');
  const [editorFontSize, setEditorFontSize] = useState(13);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    api.users.getProfile()
      .then((p) => {
        setProfile(p);
        if (p.preferences) {
          setAiProvider(p.preferences.ai_provider || 'auto');
          setGeminiKey(p.preferences.gemini_key || '');
          setOpenaiKey(p.preferences.openai_key || '');
          setVoiceSpeed(p.preferences.voice_speed || 1.0);
          setAutoSpeak(p.preferences.auto_speak !== false);
          setEditorTheme(p.preferences.editor_theme || 'vs-dark');
          setEditorFontSize(p.preferences.editor_font_size || 13);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const updatedPrefs = {
        ai_provider: aiProvider,
        gemini_key: geminiKey,
        openai_key: openaiKey,
        voice_speed: voiceSpeed,
        auto_speak: autoSpeak,
        editor_theme: editorTheme,
        editor_font_size: editorFontSize,
      };

      await api.users.updateProfile({
        preferences: updatedPrefs,
      });

      setMessage('Preferences saved successfully!');
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-cyan-400" />
          <span>Platform & AI Settings</span>
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Configure external AI keys, voice synthesis preferences, and editor environment
        </p>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* AI Engine Configuration */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>AI Provider & API Keys</span>
          </div>
          <p className="text-xs text-slate-400">
            PrepSense includes an automated expert simulation engine out-of-the-box. You can also connect your personal Gemini or OpenAI keys.
          </p>

          <div className="space-y-3 pt-1">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">AI Engine Mode</label>
              <select
                value={aiProvider}
                onChange={(e) => setAiProvider(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              >
                <option value="auto">Auto / Built-in Expert Engine (No external API needed)</option>
                <option value="gemini">Google Gemini 1.5 Flash (Custom API Key)</option>
                <option value="openai">OpenAI GPT-4o-mini (Custom API Key)</option>
              </select>
            </div>

            {aiProvider === 'gemini' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Google Gemini API Key</label>
                <input
                  type="password"
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>
            )}

            {aiProvider === 'openai' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">OpenAI API Key</label>
                <input
                  type="password"
                  value={openaiKey}
                  onChange={(e) => setOpenaiKey(e.target.value)}
                  placeholder="sk-proj-..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>
            )}
          </div>
        </div>

        {/* Audio & Voice Avatar Settings */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <Volume2 className="w-4 h-4 text-cyan-400" />
            <span>Voice & Audio Speech Synthesis</span>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-slate-200">Auto-Play Question Voice</div>
                <div className="text-[11px] text-slate-400">Interviewer avatar automatically speaks question when loaded</div>
              </div>
              <input
                type="checkbox"
                checked={autoSpeak}
                onChange={(e) => setAutoSpeak(e.target.checked)}
                className="w-4 h-4 rounded text-cyan-500 bg-slate-950 border-slate-800 focus:ring-cyan-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-300 font-medium mb-1">
                <span>Interviewer Voice Speed</span>
                <span className="font-mono text-cyan-400">{voiceSpeed}x</span>
              </div>
              <input
                type="range"
                min="0.75"
                max="1.5"
                step="0.05"
                value={voiceSpeed}
                onChange={(e) => setVoiceSpeed(parseFloat(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Monaco Editor Preferences */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <Code2 className="w-4 h-4 text-cyan-400" />
            <span>Monaco IDE Code Preferences</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Theme</label>
              <select
                value={editorTheme}
                onChange={(e) => setEditorTheme(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              >
                <option value="vs-dark">Visual Studio Dark</option>
                <option value="light">Visual Studio Light</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Font Size</label>
              <select
                value={editorFontSize}
                onChange={(e) => setEditorFontSize(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              >
                <option value={12}>12px</option>
                <option value={13}>13px (Default)</option>
                <option value={14}>14px</option>
                <option value={16}>16px</option>
              </select>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-xs shadow-md transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save All Preferences'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
