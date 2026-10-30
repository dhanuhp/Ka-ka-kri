import React, { useEffect, useState } from 'react';
import { Bot, Heart, Activity } from 'lucide-react';

export const Footer: React.FC = () => {
  const [backendStatus, setBackendStatus] = useState<'checking' | 'healthy' | 'offline'>('checking');

  useEffect(() => {
    fetch('/api/health')
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(() => setBackendStatus('healthy'))
      .catch(() => setBackendStatus('offline'));
  }, []);

  return (
    <footer className="border-t border-slate-900 bg-slate-950 text-slate-400 text-xs py-10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-cyan-600 flex items-center justify-center text-white">
                <Bot className="w-4 h-4" />
              </div>
              <span className="font-bold text-sm text-white">PrepSense AI</span>
            </div>
            <p className="text-slate-500 text-xs leading-relaxed">
              Enterprise-grade AI Technical & Behavioral Interview Simulation Platform with real speech recognition, code execution, and gap analytics.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-slate-300 mb-2.5">Interview Tracks</h4>
            <ul className="space-y-1.5 text-slate-500">
              <li>Full Stack & Frontend Engineering</li>
              <li>Backend & Cloud Distributed Systems</li>
              <li>System Design & Scalability</li>
              <li>Executive Behavioral (STAR Method)</li>
              <li>Data Structures & Algorithms</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-300 mb-2.5">Platform Features</h4>
            <ul className="space-y-1.5 text-slate-500">
              <li>Live AI Interviewer Avatar & TTS</li>
              <li>Speech-to-Text Voice Transcription</li>
              <li>Monaco IDE & Multi-Language Runner</li>
              <li>Dynamic Knowledge Gap Detection</li>
              <li>Automated PDF Evaluation Reports</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-300 mb-2.5">System Status</h4>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">FastAPI Backend</span>
                <span className="flex items-center gap-1.5 font-mono text-[11px]">
                  <span className={`w-2 h-2 rounded-full ${
                    backendStatus === 'healthy' ? 'bg-emerald-400 animate-pulse' : backendStatus === 'offline' ? 'bg-rose-500' : 'bg-amber-400 animate-spin'
                  }`} />
                  <span className={backendStatus === 'healthy' ? 'text-emerald-400' : 'text-slate-400'}>
                    {backendStatus === 'healthy' ? 'Operational' : backendStatus === 'offline' ? 'Offline' : 'Connecting...'}
                  </span>
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Code Sandbox</span>
                <span className="text-cyan-400 font-mono text-[11px]">Local + Judge0</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Database</span>
                <span className="text-emerald-400 font-mono text-[11px]">SQLAlchemy ORM</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500">
          <p>© 2026 PrepSense AI Platform. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with modern FastAPI, React, TypeScript, Monaco & Tailwind CSS
          </p>
        </div>
      </div>
    </footer>
  );
};
