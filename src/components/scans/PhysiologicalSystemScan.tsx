import React from 'react';
import { Heart } from 'lucide-react';

interface SystemData {
  name: string;
  value: number;
  color: string;
  category: string;
}

interface PhysiologicalSystemScanProps {
  data: SystemData[];
  scanDate: string;
  clientName?: string;
}

export const PhysiologicalSystemScan: React.FC<PhysiologicalSystemScanProps> = ({ 
  data, 
  scanDate,
  clientName
}) => {
  const maxValue = Math.max(...data.map(d => d.value));
  const scale = maxValue > 0 ? 100 / maxValue : 1;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Heart className="w-5 h-5 mr-2 text-red-600" />
          Physiological System Scan Result
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
            <span>100</span>
            <span>75</span>
            <span>50</span>
            <span>25</span>
            <span>0</span>
          </div>

          {/* 3D Cylindrical Bars */}
          <div className="absolute bottom-16 left-12 right-12 flex items-end justify-between">
            {data.map((system, index) => {
              const height = (system.value * scale * 0.7); // 70% of available height
              const width = 24;
              const depth = 12;
              
              return (
                <div key={system.name} className="relative flex flex-col items-center">
                  {/* 3D Cylinder */}
                  <div className="relative">
                    {/* Main cylinder body */}
                    <div
                      className="relative transition-all duration-500 ease-out"
                      style={{
                        backgroundColor: system.color,
                        width: `${width}px`,
                        height: `${height}px`,
                        borderRadius: '12px 12px 0 0',
                        boxShadow: `${depth/2}px ${depth/2}px 0 rgba(0,0,0,0.3)`,
                      }}
                    >
                      {/* Top ellipse */}
                      <div
                        className="absolute -top-3 left-0 w-full rounded-full"
                        style={{
                          backgroundColor: system.color,
                          height: '6px',
                          filter: 'brightness(1.3)',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                        }}
                      />
                      
                      {/* Right side highlight */}
                      <div
                        className="absolute top-0 right-0 w-1 rounded-r"
                        style={{
                          backgroundColor: 'rgba(255,255,255,0.3)',
                          height: `${height}px`,
                          borderRadius: '0 12px 0 0',
                        }}
                      />

                      {/* Left side shadow */}
                      <div
                        className="absolute top-0 left-0 w-1 rounded-l"
                        style={{
                          backgroundColor: 'rgba(0,0,0,0.2)',
                          height: `${height}px`,
                          borderRadius: '12px 0 0 0',
                        }}
                      />
                    </div>

                    {/* Value label */}
                    {system.value > 0 && (
                      <div
                        className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-sm font-bold text-white bg-black bg-opacity-50 px-2 py-0.5 rounded"
                      >
                        {system.value}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* X-axis Labels */}
          <div className="absolute bottom-4 left-12 right-12 flex justify-between">
            {data.map((system) => (
              <div key={system.name} className="text-xs text-gray-300 text-center transform -rotate-45 origin-top-left" style={{ width: '24px' }}>
                {system.name.split(' ').map((word, i) => (
                  <span key={i} className="block">{word}</span>
                ))}
              </div>
            ))}
          </div>

          {/* Scan info with client name and date */}
          <div className="absolute bottom-1 left-4 text-xs text-gray-400">
            {clientName ? `${clientName} - ` : ''}{scanDate}
          </div>
        </div>

        {/* Legend - Grouped by category */}
        <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
          {data.slice(0, 9).map((system) => (
            <div key={system.name} className="flex items-center space-x-2">
              <div
                className="w-4 h-4 rounded-sm"
                style={{ backgroundColor: system.color }}
              />
              <span className="text-gray-700 truncate">{system.name}: {system.value}</span>
            </div>
          ))}
        </div>

        {data.length > 9 && (
          <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
            {data.slice(9).map((system) => (
              <div key={system.name} className="flex items-center space-x-2">
                <div
                  className="w-4 h-4 rounded-sm"
                  style={{ backgroundColor: system.color }}
                />
                <span className="text-gray-700 truncate">{system.name}: {system.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};