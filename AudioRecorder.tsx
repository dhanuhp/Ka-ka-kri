import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, AlertCircle } from 'lucide-react';

interface AudioRecorderProps {
  onTranscriptChange: (text: string) => void;
  value: string;
  placeholder?: string;
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({
  onTranscriptChange,
  value,
  placeholder = "Speak your answer or type here...",
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check SpeechRecognition support
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSpeechSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + ' ';
        }
      }
      if (finalTranscript) {
        onTranscriptChange(value ? `${value} ${finalTranscript.trim()}` : finalTranscript.trim());
      }
    };

    recognition.onerror = (event: any) => {
      console.warn('Speech recognition error:', event.error);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
    };
  }, [value, onTranscriptChange]);

  const toggleRecording = () => {
    if (!recognitionRef.current) return;

    if (isRecording) {
      try {
        recognitionRef.current.stop();
      } catch {}
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.error('Failed to start speech recognition', err);
        setIsRecording(false);
      }
    }
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onTranscriptChange(e.target.value)}
          placeholder={placeholder}
          rows={6}
          className="w-full bg-slate-900/90 text-slate-100 placeholder-slate-500 rounded-xl border border-slate-700/80 p-4 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-y transition shadow-inner font-sans text-sm leading-relaxed"
        />

        {/* Floating mic trigger inside or right below textarea */}
        <div className="absolute bottom-3 right-3 flex items-center gap-2">
          {isRecording && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs animate-pulse">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span>Transcribing Speech...</span>
            </div>
          )}

          {isSpeechSupported ? (
            <button
              type="button"
              onClick={toggleRecording}
              className={`p-2.5 rounded-full shadow-lg transition transform active:scale-95 flex items-center justify-center ${
                isRecording
                  ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse'
                  : 'bg-cyan-600 hover:bg-cyan-500 text-white hover:shadow-cyan-500/30'
              }`}
              title={isRecording ? 'Stop Recording' : 'Start Voice Recording'}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          ) : (
            <div
              className="text-xs text-slate-500 flex items-center gap-1"
              title="Voice transcription requires Google Chrome or Chromium browser"
            >
              <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
              <span>Voice not supported in this browser</span>
            </div>
          )}
        </div>
      </div>

      {/* Real-time audio waveform animation during recording */}
      {isRecording && (
        <div className="flex items-center justify-center gap-1 h-6 bg-slate-950/60 rounded-lg border border-slate-800/80 py-1">
          {[...Array(16)].map((_, i) => (
            <span
              key={i}
              className="w-1 bg-gradient-to-t from-cyan-500 to-blue-400 rounded-full animate-soundwave"
              style={{
                animationDuration: `${0.4 + (i % 5) * 0.2}s`,
                animationDelay: `${(i % 7) * 0.05}s`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};
