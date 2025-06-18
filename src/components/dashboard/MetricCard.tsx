import React from 'react';
import { Card, CardContent } from '../ui/Card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number | React.ReactNode;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'orange' | 'purple' | 'pink';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  changeLabel,
  icon,
  color = 'blue',
}) => {
  const colorClasses = {
    blue: 'from-blue-500 to-cyan-500',
    green: 'from-green-500 to-emerald-500',
    orange: 'from-orange-500 to-amber-500',
    purple: 'from-purple-500 to-indigo-500',
    pink: 'from-pink-500 to-rose-500',
  };

  const getTrendIcon = () => {
    if (change === undefined) return null;
    if (change > 0) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (change < 0) return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <Minus className="w-4 h-4 text-gray-600" />;
  };

  const getTrendColor = () => {
    if (change === undefined) return '';
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <Card hover>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {typeof value === 'string' || typeof value === 'number' ? value : value}
            </p>
            {change !== undefined && (
              <div className="flex items-center mt-2 space-x-1">
                {getTrendIcon()}
                <span className={`text-sm font-medium ${getTrendColor()}`}>
                  {Math.abs(change)}%
                </span>
                {changeLabel && (
                  <span className="text-sm text-gray-500">{changeLabel}</span>
                )}
              </div>
            )}
          </div>
          {icon && (
            <div className={`p-3 rounded-lg bg-gradient-to-r ${colorClasses[color]}`}>
              <div className="text-white">{icon}</div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};