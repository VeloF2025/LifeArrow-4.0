import React from 'react';
import { Card, CardContent } from '../ui/Card';

interface WellnessScoreProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

export const WellnessScore: React.FC<WellnessScoreProps> = ({ score, size = 'md' }) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'from-green-400 to-emerald-500';
    if (score >= 60) return 'from-yellow-400 to-orange-500';
    return 'from-red-400 to-pink-500';
  };

  const getScoreText = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Attention';
  };

  const sizeClasses = {
    sm: { container: 'w-20 h-20', text: 'text-lg', label: 'text-xs' },
    md: { container: 'w-32 h-32', text: 'text-2xl', label: 'text-sm' },
    lg: { container: 'w-48 h-48', text: 'text-4xl', label: 'text-lg' },
  };

  const classes = sizeClasses[size];

  return (
    <div className="flex flex-col items-center space-y-2">
      <div className={`relative ${classes.container}`}>
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-gray-200"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 45}`}
            strokeDashoffset={`${2 * Math.PI * 45 * (1 - score / 100)}`}
            className={`bg-gradient-to-r ${getScoreColor(score)}`}
            style={{
              stroke: `url(#gradient-${score})`,
            }}
          />
          <defs>
            <linearGradient id={`gradient-${score}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" className={getScoreColor(score).split(' ')[0].replace('from-', '')} />
              <stop offset="100%" className={getScoreColor(score).split(' ')[1].replace('to-', '')} />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className={`font-bold text-gray-900 ${classes.text}`}>{score}</div>
            <div className={`text-gray-600 ${classes.label}`}>Score</div>
          </div>
        </div>
      </div>
      <div className={`text-center ${classes.label}`}>
        <div className="font-medium text-gray-900">{getScoreText(score)}</div>
      </div>
    </div>
  );
};