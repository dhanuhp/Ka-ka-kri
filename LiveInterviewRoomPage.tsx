import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Interview, InterviewQuestion } from '../services/types';
import { VoiceAvatar } from '../components/VoiceAvatar';
import { AudioRecorder } from '../components/AudioRecorder';
import { CodeEditor } from '../components/CodeEditor';
import {
  Clock, Camera, CameraOff, Mic, MicOff, HelpCircle,
  ArrowRight, CheckCircle, Code2, MessageSquare, AlertCircle,
  FileCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const LiveInterviewRoomPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [interview, setInterview] = useState<Interview | null>(null);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [candidateText, setCandidateText] = useState('');
  const [candidateCode, setCandidateCode] = useState('');
  const [cameraActive, setCameraActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [activeHintIndex, setActiveHintIndex] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState(1800); // 30 min default
  const [avatarState, setAvatarState] = useState<'idle' | 'speaking' | 'listening' | 'thinking'>('speaking');
  const [activeTab, setActiveTab] = useState<'response' | 'code' | 'transcript'>('response');
  const [transcriptLogs, setTranscriptLogs] = useState<Array<{ sender: string; text: string; time: string }>>([]);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Load Interview
  useEffect(() => {
    if (!id) return;
    api.interviews.get(id)
      .then((data) => {
        setInterview(data);
        const idx = Math.min(data.current_question_index, (data.questions?.length || 1) - 1);
        setCurrentQIndex(idx);
        setSecondsRemaining((data.duration_minutes || 30) * 60);

        // Preload starter code if question is coding
        if (data.questions?.[idx]?.starter_code) {
          setCandidateCode(data.questions[idx].starter_code || '');
          setActiveTab('code');
        }

        // Add initial greeting to transcript
        setTranscriptLogs([
          {
            sender: 'AI Interviewer',
            text: `Hello! Welcome to your ${data.role} interview session. Let's begin with our first question.`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      })
      .catch((err) => {
        console.error('Failed to load interview', err);
      });
  }, [id]);

  // Webcam stream
  useEffect(() => {
    if (cameraActive) {
      navigator.mediaDevices?.getUserMedia({ video: true, audio: false })
        .then((stream) => {
          mediaStreamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch(() => {
          setCameraActive(false);
        });
    } else {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }

    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraActive]);

  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentQuestion: InterviewQuestion | undefined = interview?.questions?.[currentQIndex];

  // Update question change effects
  useEffect(() => {
    if (currentQuestion) {
      setAvatarState('speaking');
      setShowHint(false);
      setCandidateText('');
      if (currentQuestion.question_type === 'coding' && currentQuestion.starter_code) {
        setCandidateCode(currentQuestion.starter_code);
        setActiveTab('code');
      } else {
        setActiveTab('response');
      }

      setTranscriptLogs((prev) => [
        ...prev,
        {
          sender: 'AI Interviewer',
          text: currentQuestion.question_text,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  }, [currentQIndex, currentQuestion?.id]);

  const handleSubmitAnswer = async () => {
    if (!interview || !currentQuestion) return;
    setIsSubmitting(true);
    setAvatarState('thinking');

    try {
      // Record candidate log
      const candidateMessage = candidateText.trim() || (candidateCode ? '[Submitted Code Solution]' : 'Completed.');
      setTranscriptLogs((prev) => [
        ...prev,
        {
          sender: 'Candidate',
          text: candidateMessage,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);

      await api.interviews.submitAnswer(interview.id, {
        question_id: currentQuestion.id,
        answer_text: candidateText,
        code_content: currentQuestion.question_type === 'coding' ? candidateCode : null,
        language: currentQuestion.question_type === 'coding' ? 'python' : null,
        duration_seconds: 120,
      });

      // Advance or complete
      if (currentQIndex + 1 < (interview.questions?.length || 0)) {
        setCurrentQIndex(currentQIndex + 1);
      } else {
        await handleFinishInterview();
      }
    } catch (err: any) {
      console.error('Failed to submit answer:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinishInterview = async () => {
    if (!interview) return;
    setIsSubmitting(true);
    try {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      await api.interviews.complete(interview.id);
      navigate(`/interviews/${interview.id}/results`);
    } catch (err) {
      console.error('Failed to complete interview:', err);
      navigate(`/interviews/${interview.id}/results`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!interview || !currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Initializing Live Interview Room...</p>
        </div>
      </div>
    );
  }

  const isCodingQuestion = currentQuestion.question_type === 'coding';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Session Bar */}
      <header className="h-14 bg-slate-900/90 border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between shrink-0 z-30">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h1 className="font-bold text-sm text-white truncate max-w-xs sm:max-w-md">
              {interview.title}
            </h1>
          </div>
          <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-semibold">
            Question {currentQIndex + 1} of {interview.questions.length}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>{formatTimer(secondsRemaining)}</span>
          </div>

          <button
            onClick={handleFinishInterview}
            disabled={isSubmitting}
            className="px-3.5 py-1.5 rounded-lg bg-rose-600/80 hover:bg-rose-500 text-white text-xs font-semibold shadow-sm transition"
          >
            Finish Early
          </button>
        </div>
      </header>

      {/* Main Conference Layout */}
      <div className="flex-1 p-4 grid grid-cols-1 lg:grid-cols-12 gap-4 max-w-7xl mx-auto w-full overflow-hidden">
        {/* Left Column: AI Interviewer & Question Card (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* AI Avatar */}
          <VoiceAvatar
            state={avatarState}
            textToSpeak={currentQuestion.question_text}
            autoPlay={true}
          />

          {/* Question Details Card */}
          <div className="flex-1 p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between shadow-xl space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono px-2 py-0.5 rounded uppercase font-bold tracking-wider bg-slate-800 text-slate-300">
                  {currentQuestion.question_type} Question
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Time target: {Math.round(currentQuestion.time_limit_seconds / 60)}m
                </span>
              </div>

              <h2 className="text-sm sm:text-base font-semibold text-slate-100 leading-relaxed">
                {currentQuestion.question_text}
              </h2>

              {/* Hints Box */}
              {showHint && currentQuestion.hints && currentQuestion.hints.length > 0 && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs space-y-1">
                  <div className="font-semibold flex items-center gap-1">
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>AI Interviewer Hint:</span>
                  </div>
                  <p>{currentQuestion.hints[activeHintIndex]}</p>
                </div>
              )}
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-slate-800/80">
              {currentQuestion.hints && currentQuestion.hints.length > 0 ? (
                <button
                  type="button"
                  onClick={() => setShowHint(!showHint)}
                  className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 transition"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>{showHint ? 'Hide Hint' : 'Request Hint'}</span>
                </button>
              ) : (
                <span className="text-xs text-slate-500">No hints for this round</span>
              )}

              <span className="text-[11px] text-slate-500">
                {currentQIndex + 1} / {interview.questions.length} Completed
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Candidate Webcam & Workspace (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4 h-full">
          {/* Candidate Webcam Bar */}
          <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="relative w-24 h-16 rounded-xl bg-slate-950 overflow-hidden border border-slate-800 flex items-center justify-center">
                {cameraActive ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover mirror"
                  />
                ) : (
                  <CameraOff className="w-5 h-5 text-slate-600" />
                )}
                <span className="absolute bottom-1 right-1 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>

              <div>
                <div className="text-xs font-semibold text-slate-200">Candidate Video Feed</div>
                <div className="text-[11px] text-slate-400">Microphone & Speech Active</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCameraActive(!cameraActive)}
                className={`p-2 rounded-xl text-xs flex items-center gap-1 border transition ${
                  cameraActive
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                    : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                }`}
                title={cameraActive ? 'Turn Camera Off' : 'Turn Camera On'}
              >
                {cameraActive ? <Camera className="w-3.5 h-3.5" /> : <CameraOff className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Interactive Workspace with Tabs */}
          <div className="flex-1 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col overflow-hidden shadow-2xl">
            {/* Tab navigation */}
            <div className="flex items-center justify-between px-4 py-2 bg-slate-950 border-b border-slate-800">
              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setActiveTab('response')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition ${
                    activeTab === 'response'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Voice & Spoken Answer
                </button>

                {isCodingQuestion && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('code')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
                      activeTab === 'code'
                        ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Code2 className="w-3.5 h-3.5" />
                    <span>Monaco Code IDE</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setActiveTab('transcript')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
                    activeTab === 'transcript'
                      ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Live Transcript</span>
                </button>
              </div>

              {isCodingQuestion && (
                <span className="text-[11px] font-mono text-cyan-400">
                  Automated Tests Ready
                </span>
              )}
            </div>

            {/* Active Tab Panel */}
            <div className="flex-1 p-4 flex flex-col overflow-hidden">
              {activeTab === 'response' && (
                <div className="flex-1 flex flex-col justify-between">
                  <div className="space-y-2 flex-1">
                    <p className="text-xs text-slate-400">
                      Speak your response into the microphone or refine the transcription below:
                    </p>
                    <AudioRecorder
                      value={candidateText}
                      onTranscriptChange={(txt) => setCandidateText(txt)}
                      placeholder="Start speaking into your microphone. The AI will transcribe and evaluate your articulation, logic, and depth..."
                    />
                  </div>

                  <div className="pt-4 flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      {candidateText.split(/\s+/).filter(Boolean).length} words spoken
                    </span>
                    <button
                      type="button"
                      onClick={handleSubmitAnswer}
                      disabled={isSubmitting}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-xs shadow-md shadow-cyan-500/20 transition flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>Submit & Next Question</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'code' && isCodingQuestion && (
                <div className="flex-1 flex flex-col h-full space-y-3">
                  <div className="flex-1 min-h-[360px]">
                    <CodeEditor
                      initialCode={candidateCode}
                      language="python"
                      testCases={currentQuestion.test_cases || []}
                      onCodeChange={(c) => setCandidateCode(c)}
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-slate-400">
                      Ensure your solution handles edge cases and passes tests before submitting.
                    </span>
                    <button
                      type="button"
                      onClick={handleSubmitAnswer}
                      disabled={isSubmitting}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-xs shadow-md transition flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <span>Submit Solution & Next</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'transcript' && (
                <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                  {transcriptLogs.map((log, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl text-xs space-y-1 ${
                        log.sender === 'Candidate'
                          ? 'bg-cyan-950/40 border border-cyan-800/40 text-cyan-100 ml-6'
                          : 'bg-slate-950 border border-slate-800 text-slate-300 mr-6'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold">
                        <span>{log.sender}</span>
                        <span>{log.time}</span>
                      </div>
                      <p className="leading-relaxed">{log.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
