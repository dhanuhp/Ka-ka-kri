import React from 'react';

interface ScoreBadgeProps {
  score?: number | null;
  recommendation?: string | null;
  size?: 'sm' | 'md' | 'lg';
}

export const ScoreBadge: React.FC<ScoreBadgeProps> = ({ score, recommendation, size = 'md' }) => {
  const getColors = () => {
    if (recommendation) {
      const rec = recommendation.toLowerCase();
      if (rec.includes('strong hire')) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      if (rec.includes('lean no hire')) return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      if (rec.includes('no hire')) return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      if (rec.includes('lean hire')) return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
      if (rec.includes('hire')) return 'bg-green-500/20 text-green-400 border-green-500/30';
    }

    if (score !== undefined && score !== null) {
      if (score >= 85) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      if (score >= 70) return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
      if (score >= 55) return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
    }

    return 'bg-slate-700/30 text-slate-400 border-slate-700/50';
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5 font-semibold',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${getColors()} ${sizeClasses[size]}`}>
      {score !== undefined && score !== null && (
        <span className="font-bold">{score.toFixed(1)}%</span>
      )}
      {recommendation && <span>{recommendation}</span>}
    </span>
  );
};
