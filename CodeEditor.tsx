import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Play, RotateCcw, CheckCircle2, XCircle, Clock, Cpu } from 'lucide-react';
import { api } from '../services/api';
import { CodeRunResult } from '../services/types';

interface CodeEditorProps {
  initialCode?: string;
  language?: string;
  testCases?: Array<{ input: string; expected: string; hidden?: boolean }>;
  onCodeChange?: (code: string) => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  initialCode = '# Write your solution here\n',
  language = 'python',
  testCases = [],
  onCodeChange,
}) => {
  const [code, setCode] = useState<string>(initialCode);
  const [selectedLanguage, setSelectedLanguage] = useState<string>(language);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [runResult, setRunResult] = useState<CodeRunResult | null>(null);
  const [activeTab, setActiveTab] = useState<'tests' | 'console'>('tests');

  const handleEditorChange = (value?: string) => {
    const val = value || '';
    setCode(val);
    if (onCodeChange) onCodeChange(val);
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    try {
      const result = await api.coding.run({
        language: selectedLanguage,
        code,
        test_cases: testCases,
      });
      setRunResult(result);
    } catch (err: any) {
      setRunResult({
        status: 'error',
        stdout: '',
        stderr: err.message || 'Execution failed',
        runtime_ms: 0,
        memory_kb: 0,
        tests_passed: 0,
        total_tests: testCases.length,
        test_results: [],
      });
    } finally {
      setIsRunning(false);
    }
  };

  const resetCode = () => {
    setCode(initialCode);
    if (onCodeChange) onCodeChange(initialCode);
    setRunResult(null);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      {/* Editor Header Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono"
          >
            <option value="python">Python 3</option>
            <option value="javascript">JavaScript (Node.js)</option>
            <option value="typescript">TypeScript</option>
            <option value="cpp">C++ (GCC)</option>
            <option value="java">Java (OpenJDK)</option>
          </select>
          <span className="text-xs text-slate-500 font-mono">Monaco IDE v0.45</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={resetCode}
            className="flex items-center gap-1 px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
            title="Reset code"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          <button
            onClick={handleRunCode}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium text-xs rounded-lg shadow-md transition disabled:opacity-50"
          >
            <Play className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
            <span>{isRunning ? 'Executing...' : 'Run Code & Tests'}</span>
          </button>
        </div>
      </div>

      {/* Monaco Code Editor Area */}
      <div className="flex-1 min-h-[300px]">
        <Editor
          height="100%"
          language={selectedLanguage === 'js' ? 'javascript' : selectedLanguage}
          theme="vs-dark"
          value={code}
          onChange={handleEditorChange}
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 4,
            padding: { top: 12, bottom: 12 },
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          }}
        />
      </div>

      {/* Output & Test Results Panel */}
      <div className="border-t border-slate-800 bg-slate-950 flex flex-col max-h-56">
        {/* Panel tabs */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800/80 bg-slate-900/50">
          <div className="flex items-center gap-4 text-xs font-medium">
            <button
              onClick={() => setActiveTab('tests')}
              className={`pb-0.5 border-b-2 transition ${
                activeTab === 'tests'
                  ? 'border-cyan-500 text-cyan-400 font-semibold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Test Cases ({testCases.length})
            </button>
            <button
              onClick={() => setActiveTab('console')}
              className={`pb-0.5 border-b-2 transition ${
                activeTab === 'console'
                  ? 'border-cyan-500 text-cyan-400 font-semibold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Terminal Console
            </button>
          </div>

          {runResult && (
            <div className="flex items-center gap-3 text-xs">
              <span
                className={`font-semibold px-2 py-0.5 rounded-full ${
                  runResult.status === 'accepted'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-rose-500/20 text-rose-400'
                }`}
              >
                {runResult.status.toUpperCase()} ({runResult.tests_passed}/{runResult.total_tests} passed)
              </span>
              <span className="text-slate-400 flex items-center gap-1 font-mono">
                <Clock className="w-3 h-3 text-slate-500" />
                {runResult.runtime_ms}ms
              </span>
              <span className="text-slate-400 flex items-center gap-1 font-mono">
                <Cpu className="w-3 h-3 text-slate-500" />
                {runResult.memory_kb}KB
              </span>
            </div>
          )}
        </div>

        {/* Tab content */}
        <div className="p-3 overflow-y-auto font-mono text-xs text-slate-300">
          {activeTab === 'tests' ? (
            runResult?.test_results && runResult.test_results.length > 0 ? (
              <div className="space-y-2">
                {runResult.test_results.map((tr) => (
                  <div
                    key={tr.test_index}
                    className={`p-2.5 rounded-lg border flex items-start justify-between ${
                      tr.passed
                        ? 'bg-emerald-950/20 border-emerald-800/40'
                        : 'bg-rose-950/20 border-rose-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {tr.passed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      )}
                      <div>
                        <div className="font-semibold text-slate-200">Test Case #{tr.test_index}</div>
                        <div className="text-slate-400 text-[11px] mt-0.5">Input: <span className="text-slate-300">{tr.input}</span></div>
                      </div>
                    </div>
                    <div className="text-right text-[11px]">
                      <div>Expected: <span className="text-emerald-400">{tr.expected}</span></div>
                      <div>Output: <span className={tr.passed ? 'text-emerald-300' : 'text-rose-400 font-bold'}>{tr.output}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-1.5 text-slate-400">
                {testCases.map((tc, idx) => (
                  <div key={idx} className="p-2 rounded bg-slate-900 border border-slate-800">
                    <span className="text-cyan-400">Case {idx + 1}:</span> Input: <span className="text-slate-300">{tc.input}</span> | Expected: <span className="text-slate-300">{tc.expected}</span>
                  </div>
                ))}
                {testCases.length === 0 && <p className="text-slate-500 italic">No automated test cases configured. Output will print to console.</p>}
              </div>
            )
          ) : (
            <div>
              {runResult ? (
                <>
                  {runResult.stdout && <pre className="text-emerald-400 whitespace-pre-wrap">{runResult.stdout}</pre>}
                  {runResult.stderr && <pre className="text-rose-400 whitespace-pre-wrap">{runResult.stderr}</pre>}
                  {!runResult.stdout && !runResult.stderr && (
                    <span className="text-slate-500 italic">Program executed with no console output.</span>
                  )}
                </>
              ) : (
                <span className="text-slate-500 italic">Click 'Run Code & Tests' to see compiler/interpreter output.</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
