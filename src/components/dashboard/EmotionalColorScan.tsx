import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';

interface EmotionalColorData {
  red: number;
  yellow: number;
  green: number;
  lightBlue: number;
  darkBlue: number;
  purple: number;
  black: number;
}

interface EmotionalColorScanProps {
  data: EmotionalColorData;
  scanDate?: string;
}

export const EmotionalColorScan: React.FC<EmotionalColorScanProps> = ({ 
  data, 
  scanDate = "2025-3-16T23 20*004 brv.txt" 
}) => {
  const maxValue = Math.max(...Object.values(data));
  const colors = {
    red: '#EF4444',
    yellow: '#EAB308',
    green: '#22C55E',
    lightBlue: '#06B6D4',
    darkBlue: '#3B82F6',
    purple: '#8B5CF6',
    black: '#1F2937'
  };

  const barData = [
    { key: 'red', value: data.red, color: colors.red },
    { key: 'yellow', value: data.yellow, color: colors.yellow },
    { key: 'green', value: data.green, color: colors.green },
    { key: 'lightBlue', value: data.lightBlue, color: colors.lightBlue },
    { key: 'darkBlue', value: data.darkBlue, color: colors.darkBlue },
    { key: 'purple', value: data.purple, color: colors.purple },
    { key: 'black', value: data.black, color: colors.black }
  ];

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-gray-900">
          Emotional Color Scan
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="relative">
          {/* 3D Chart Container */}
          <div 
            className="relative w-full h-80 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg overflow-hidden"
            style={{
              perspective: '1000px',
              transformStyle: 'preserve-3d'
            }}
          >
            {/* Y-axis labels */}
            <div className="absolute left-2 top-4 text-white text-xs font-medium">100%</div>
            <div className="absolute left-2 bottom-16 text-white text-xs font-medium">0%</div>
            
            {/* 3D Bars Container */}
            <div 
              className="absolute inset-0 flex items-end justify-center space-x-2 px-8 pb-12"
              style={{
                transform: 'rotateX(15deg) rotateY(-10deg)',
                transformOrigin: 'center bottom'
              }}
            >
              {barData.map((bar, index) => {
                const height = (bar.value / maxValue) * 200; // Max height 200px
                return (
                  <div key={bar.key} className="relative flex flex-col items-center">
                    {/* Value label */}
                    <div 
                      className="absolute text-white text-xs font-bold bg-black bg-opacity-50 px-1 rounded"
                      style={{ 
                        bottom: `${height + 10}px`,
                        transform: 'rotateX(-15deg) rotateY(10deg)'
                      }}
                    >
                      {bar.value}
                    </div>
                    
                    {/* 3D Bar */}
                    <div
                      className="relative"
                      style={{
                        width: '32px',
                        height: `${height}px`,
                        background: `linear-gradient(135deg, ${bar.color} 0%, ${bar.color}dd 100%)`,
                        borderRadius: '4px 4px 0 0',
                        boxShadow: `
                          inset 0 0 0 1px rgba(255,255,255,0.1),
                          4px 0 8px rgba(0,0,0,0.3),
                          0 4px 8px rgba(0,0,0,0.2)
                        `,
                        transform: 'translateZ(0)',
                        transformStyle: 'preserve-3d'
                      }}
                    >
                      {/* Top face */}
                      <div
                        className="absolute top-0 left-0 w-full"
                        style={{
                          height: '8px',
                          background: `linear-gradient(45deg, ${bar.color} 0%, ${bar.color}aa 100%)`,
                          transform: 'rotateX(90deg) translateZ(4px)',
                          transformOrigin: 'top'
                        }}
                      />
                      
                      {/* Right face */}
                      <div
                        className="absolute top-0 right-0 h-full"
                        style={{
                          width: '8px',
                          background: `linear-gradient(180deg, ${bar.color}88 0%, ${bar.color}44 100%)`,
                          transform: 'rotateY(90deg) translateZ(4px)',
                          transformOrigin: 'right'
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Scan info */}
            <div className="absolute bottom-2 left-4 text-white text-xs font-medium opacity-80">
              {scanDate}
            </div>
            
            {/* Result label */}
            <div className="absolute top-4 right-4">
              <div className="bg-gray-600 text-white px-3 py-6 rounded text-center text-xs font-bold tracking-wider">
                <div>COLOR</div>
                <div className="my-1">SCAN</div>
                <div>RESULT</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};