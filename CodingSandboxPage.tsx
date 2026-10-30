import React, { useState } from 'react';
import { CodeEditor } from '../components/CodeEditor';
import { Code2, BookOpen, Sparkles, CheckCircle2 } from 'lucide-react';

const PRESET_CHALLENGES = [
  {
    title: 'Two Sum (Easy)',
    language: 'python',
    description: 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`. Target time complexity: O(N).',
    starterCode: `def two_sum(nums, target):\n    # Return indices [i, j]\n    seen = {}\n    for i, num in enumerate(nums):\n        diff = target - num\n        if diff in seen:\n            return [seen[diff], i]\n        seen[num] = i\n    return []\n\nimport sys, json\ninput_data = sys.stdin.read().strip()\nif input_data:\n    data = json.loads(input_data)\n    print(json.dumps(two_sum(data['nums'], data['target'])))\nelse:\n    print(json.dumps(two_sum([2, 7, 11, 15], 9)))\n`,
    testCases: [
      { input: '{"nums": [2, 7, 11, 15], "target": 9}', expected: '[0, 1]' },
      { input: '{"nums": [3, 2, 4], "target": 6}', expected: '[1, 2]' },
      { input: '{"nums": [3, 3], "target": 6}', expected: '[0, 1]' },
    ],
  },
  {
    title: 'Valid Parentheses (Easy)',
    language: 'python',
    description: 'Determine if an input string containing `(`, `)`, `{`, `}`, `[`, `]` is valid. Must close in the correct order using a Stack.',
    starterCode: `def is_valid(s: str) -> bool:\n    stack = []\n    mapping = {')': '(', '}': '{', ']': '['}\n    for char in s:\n        if char in mapping:\n            top = stack.pop() if stack else '#'\n            if mapping[char] != top:\n                return False\n        else:\n            stack.append(char)\n    return not stack\n\nimport sys\ns = sys.stdin.read().strip() or '()[]{}'\nprint(str(is_valid(s)).lower())\n`,
    testCases: [
      { input: '()[]{}', expected: 'true' },
      { input: '(]', expected: 'false' },
      { input: '{[]}', expected: 'true' },
    ],
  },
  {
    title: 'Binary Search (Easy)',
    language: 'python',
    description: 'Given a sorted array of distinct integers `nums` and a target value, return the index if found, or -1 in O(log N) time.',
    starterCode: `def binary_search(nums, target):\n    left, right = 0, len(nums) - 1\n    while left <= right:\n        mid = (left + right) // 2\n        if nums[mid] == target:\n            return mid\n        elif nums[mid] < target:\n            left = mid + 1\n        else:\n            right = mid - 1\n    return -1\n\nimport sys, json\nin_data = sys.stdin.read().strip()\nif in_data:\n    d = json.loads(in_data)\n    print(binary_search(d['nums'], d['target']))\nelse:\n    print(binary_search([-1,0,3,5,9,12], 9))\n`,
    testCases: [
      { input: '{"nums": [-1, 0, 3, 5, 9, 12], "target": 9}', expected: '4' },
      { input: '{"nums": [-1, 0, 3, 5, 9, 12], "target": 2}', expected: '-1' },
    ],
  },
];

export const CodingSandboxPage: React.FC = () => {
  const [selectedChallenge, setSelectedChallenge] = useState(PRESET_CHALLENGES[0]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Monaco IDE & Fast Code Runner</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Code2 className="w-6 h-6 text-cyan-400" />
            <span>Algorithmic Coding Sandbox</span>
          </h1>
          <p className="text-sm text-slate-400">
            Practice data structures and algorithms with real-time test execution and memory profiling
          </p>
        </div>

        {/* Challenge selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold">Challenge:</span>
          <select
            value={selectedChallenge.title}
            onChange={(e) => {
              const ch = PRESET_CHALLENGES.find((c) => c.title === e.target.value);
              if (ch) setSelectedChallenge(ch);
            }}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          >
            {PRESET_CHALLENGES.map((c) => (
              <option key={c.title} value={c.title}>
                {c.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Problem Description Banner */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
        <h2 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
          Problem Description: {selectedChallenge.title}
        </h2>
        <p className="text-xs text-slate-300 leading-relaxed font-sans">
          {selectedChallenge.description}
        </p>
      </div>

      {/* Editor Component */}
      <div className="h-[620px]">
        <CodeEditor
          key={selectedChallenge.title}
          initialCode={selectedChallenge.starterCode}
          language={selectedChallenge.language}
          testCases={selectedChallenge.testCases}
        />
      </div>
    </div>
  );
};
