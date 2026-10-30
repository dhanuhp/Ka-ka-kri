import React, { useEffect, useState } from 'react';
import { Volume2, VolumeX, Sparkles, Radio } from 'lucide-react';

interface VoiceAvatarProps {
  state: 'idle' | 'speaking' | 'listening' | 'thinking';
  textToSpeak?: string;
  autoPlay?: boolean;
}

export const VoiceAvatar: React.FC<VoiceAvatarProps> = ({
  state,
  textToSpeak,
  autoPlay = true,
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakingInternally, setIsSpeakingInternally] = useState(false);

  const speakText = (text: string) => {
    if (isMuted || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    // Pick a natural voice if available
    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(v => v.name.includes('Natural') || v.name.includes('Google') || v.lang.startsWith('en'));
    if (naturalVoice) utterance.voice = naturalVoice;

    utterance.onstart = () => setIsSpeakingInternally(true);
    utterance.onend = () => setIsSpeakingInternally(false);
    utterance.onerror = () => setIsSpeakingInternally(false);

    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (autoPlay && textToSpeak) {
      speakText(textToSpeak);
    }
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [textToSpeak, autoPlay, isMuted]);

  const activeSpeaking = state === 'speaking' || isSpeakingInternally;

  return (
    <div className="relative flex flex-col items-center justify-center p-6 bg-slate-900/80 border border-slate-800 rounded-2xl backdrop-blur-md shadow-2xl overflow-hidden group">
      {/* Background glow aura */}
      <div
        className={`absolute -inset-1 rounded-3xl opacity-30 blur-2xl transition-all duration-700 ${
          activeSpeaking
            ? 'bg-cyan-500 opacity-60 scale-105'
            : state === 'thinking'
            ? 'bg-purple-600 opacity-60 animate-pulse'
            : state === 'listening'
            ? 'bg-emerald-500 opacity-50'
            : 'bg-blue-600/30'
        }`}
      />

      {/* Holographic Avatar Core */}
      <div className="relative z-10 flex flex-col items-center">
        <div className="relative w-28 h-28 flex items-center justify-center">
          {/* Pulsing rings */}
          <div
            className={`absolute inset-0 rounded-full border-2 transition-all duration-500 ${
              activeSpeaking
                ? 'border-cyan-400 scale-125 animate-ping opacity-30'
                : state === 'thinking'
                ? 'border-purple-400 scale-110 animate-pulse'
                : 'border-slate-700 opacity-20'
            }`}
          />
          <div
            className={`absolute -inset-3 rounded-full border border-dashed transition-all duration-700 ${
              activeSpeaking
                ? 'border-cyan-500/50 animate-spin [animation-duration:8s]'
                : 'border-slate-700/40'
            }`}
          />

          {/* Central orb */}
          <div
            className={`w-24 h-24 rounded-full flex items-center justify-center shadow-inner transition-all duration-500 ${
              activeSpeaking
                ? 'bg-gradient-to-tr from-cyan-600 via-blue-500 to-indigo-600 shadow-cyan-500/50 scale-105'
                : state === 'thinking'
                ? 'bg-gradient-to-tr from-purple-700 via-violet-600 to-indigo-700 shadow-purple-500/40'
                : state === 'listening'
                ? 'bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-600 shadow-emerald-500/40'
                : 'bg-gradient-to-tr from-slate-800 via-slate-700 to-slate-800'
            }`}
          >
            {activeSpeaking ? (
              <div className="flex items-center gap-1 h-8">
                <span className="w-1.5 bg-white rounded-full h-4 animate-soundwave [animation-delay:0.1s]" />
                <span className="w-1.5 bg-white rounded-full h-7 animate-soundwave [animation-delay:0.3s]" />
                <span className="w-1.5 bg-white rounded-full h-8 animate-soundwave [animation-delay:0.2s]" />
                <span className="w-1.5 bg-white rounded-full h-5 animate-soundwave [animation-delay:0.4s]" />
                <span className="w-1.5 bg-white rounded-full h-3 animate-soundwave [animation-delay:0.15s]" />
              </div>
            ) : state === 'thinking' ? (
              <Sparkles className="w-10 h-10 text-purple-200 animate-spin [animation-duration:4s]" />
            ) : state === 'listening' ? (
              <Radio className="w-10 h-10 text-emerald-200 animate-pulse" />
            ) : (
              <div className="w-12 h-12 rounded-full border border-slate-500/50 flex items-center justify-center">
                <div className="w-4 h-4 rounded-full bg-cyan-400/80 animate-pulse" />
              </div>
            )}
          </div>
        </div>

        {/* Status label */}
        <div className="mt-4 flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              activeSpeaking
                ? 'bg-cyan-400 animate-ping'
                : state === 'thinking'
                ? 'bg-purple-400 animate-pulse'
                : state === 'listening'
                ? 'bg-emerald-400 animate-pulse'
                : 'bg-slate-500'
            }`}
          />
          <span className="text-xs font-semibold tracking-wider uppercase text-slate-300">
            {activeSpeaking
              ? 'AI Speaking Question...'
              : state === 'thinking'
              ? 'Analyzing Response...'
              : state === 'listening'
              ? 'Listening to Candidate...'
              : 'Interviewer Ready'}
          </span>
        </div>
      </div>

      {/* Voice controls */}
      <div className="relative z-10 mt-3 flex items-center gap-2">
        <button
          onClick={() => {
            if (isSpeakingInternally) {
              window.speechSynthesis.cancel();
              setIsSpeakingInternally(false);
            } else if (textToSpeak) {
              speakText(textToSpeak);
            }
          }}
          className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition text-xs flex items-center gap-1 border border-slate-700/60"
          title="Repeat Question Audio"
        >
          <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
          <span>Repeat Question</span>
        </button>
        <button
          onClick={() => {
            if (!isMuted) window.speechSynthesis.cancel();
            setIsMuted(!isMuted);
          }}
          className={`p-1.5 rounded-lg text-xs flex items-center gap-1 border transition ${
            isMuted
              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
              : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700/60'
          }`}
          title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          <span>{isMuted ? 'Muted' : 'Mute'}</span>
        </button>
      </div>
    </div>
  );
};
