import React from 'react';
import { Activity } from 'lucide-react';

interface EmotionalColorData {
  red: number;
  yellow: number;
  green: number;
  blue: number;
  darkBlue: number;
  purple: number;
  scanDate?: string;
  clientName?: string;
}

interface EmotionalColorScanProps {
  data: EmotionalColorData;
}

export const EmotionalColorScan: React.FC<EmotionalColorScanProps> = ({ data }) => {
  const colors = [
    { name: 'Red', value: data.red, color: '#EF4444', bgColor: '#FEE2E2' },
    { name: 'Yellow', value: data.yellow, color: '#F59E0B', bgColor: '#FEF3C7' },
    { name: 'Green', value: data.green, color: '#10B981', bgColor: '#D1FAE5' },
    { name: 'Light Blue', value: data.blue, color: '#06B6D4', bgColor: '#CFFAFE' },
    { name: 'Dark Blue', value: data.darkBlue, color: '#3B82F6', bgColor: '#DBEAFE' },
    { name: 'Purple', value: data.purple, color: '#8B5CF6', bgColor: '#EDE9FE' },
  ];

  const maxValue = Math.max(...colors.map(c => c.value));
  const scale = maxValue > 0 ? 100 / maxValue : 1;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Activity className="w-5 h-5 mr-2 text-purple-600" />
          Emotional Color Scan Result
        </h3>
        <span className="text-sm text-gray-500">Last scan results</span>
      </div>
      
      <div className="relative">
        {/* 3D Chart Container */}
        <div className="relative h-80 bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg overflow-hidden">
          {/* Grid Lines */}
          <div className="absolute inset-0 opacity-20">
            {[0, 25, 50, 75, 100].map((line) => (
              <div
                key={line}
                className="absolute left-0 right-0 border-t border-gray-400"
                style={{ bottom: `${(line / 100) * 80 + 10}%` }}
              />
            ))}
          </div>

          {/* Y-axis Labels */}
          <div className="absolute left-2 top-4 bottom-4 flex flex-col justify-between text-xs text-gray-300">
            <span>100%</span>
            <span>75%</span>
            <span>50%</span>
            <span>25%</span>
            <span>0%</span>
          </div>

          {/* 3D Bars */}
          <div className="absolute bottom-16 left-12 right-12 flex items-end justify-around">
            {colors.map((color, index) => {
              const height = (color.value * scale * 0.7); // 70% of available height
              const depth = 20; // 3D depth effect
              
              return (
                <div key={color.name} className="relative flex flex-col items-center">
                  {/* 3D Bar */}
                  <div className="relative">
                    {/* Main bar face */}
                    <div
                      className="relative rounded-t-sm transition-all duration-500 ease-out"
                      style={{
                        backgroundColor: color.color,
                        width: '40px',
                        height: `${height}px`,
                        boxShadow: `${depth/2}px ${depth/2}px 0 rgba(0,0,0,0.3)`,
                      }}
                    >
                      {/* Top face */}
                      <div
                        className="absolute -top-2 left-0 w-full rounded-sm"
                        style={{
                          backgroundColor: color.color,
                          height: '8px',
                          transform: `skewX(-45deg) translateX(${depth/4}px)`,
                          filter: 'brightness(1.2)',
                        }}
                      />
                      
                      {/* Right face */}
                      <div
                        className="absolute top-0 -right-4 rounded-r-sm"
                        style={{
                          backgroundColor: color.color,
                          width: `${depth/2}px`,
                          height: `${height}px`,
                          transform: 'skewY(-45deg)',
                          filter: 'brightness(0.8)',
                        }}
                      />
                    </div>

                    {/* Value label on top of bar */}
                    {color.value > 0 && (
                      <div
                        className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-sm font-bold text-white bg-black bg-opacity-50 px-2 py-0.5 rounded"
                      >
                        {color.value}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* X-axis Labels */}
          <div className="absolute bottom-4 left-12 right-12 flex justify-around">
            {colors.map((color) => (
              <div key={color.name} className="text-xs text-gray-300 text-center w-12">
                {color.name}
              </div>
            ))}
          </div>

          {/* Scan info with client name and date */}
          <div className="absolute bottom-1 left-4 text-xs text-gray-400">
            {data.clientName ? `${data.clientName} - ` : ''}{data.scanDate || "Scan Date"}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
          {colors.map((color) => (
            <div key={color.name} className="flex items-center space-x-2">
              <div
                className="w-4 h-4 rounded-sm"
                style={{ backgroundColor: color.color }}
              />
              <span className="text-gray-700">{color.name}: {color.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};