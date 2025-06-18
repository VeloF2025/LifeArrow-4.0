import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';

interface PhysiologicalSystemData {
  nervousSystem: number;
  cardiovascular1: number;
  cardiovascular2: number;
  cardiovascular3: number;
  respiratory: number;
  gastrointestinal1: number;
  gastrointestinal2: number;
  immune: number;
  endocrine: number;
  lymphatic: number;
  skin: number;
  reproductive: number;
  urinary: number;
  muscleTendon: number;
  boneLigament: number;
}

interface PhysiologicalSystemScanProps {
  data: PhysiologicalSystemData;
  scanDate?: string;
}

export const PhysiologicalSystemScan: React.FC<PhysiologicalSystemScanProps> = ({ 
  data, 
  scanDate = "Sheet1" 
}) => {
  const systemLabels = [
    'Nervous System',
    'Cardio Vascular 1',
    'Cardio Vascular 2', 
    'Cardio Vascular 3',
    'Respiratory',
    'Gastrointestinal 1',
    'Gastrointestinal 2',
    'Immune',
    'Endocrine',
    'Lymphatic',
    'Skin',
    'Reproductive',
    'Urinary',
    'Muscle Tendon',
    'Bone Ligament'
  ];

  const systemColors = [
    '#3B82F6', // Blue
    '#EF4444', // Red
    '#06B6D4', // Cyan
    '#22C55E', // Green
    '#F3F4F6', // Light gray
    '#FEF3C7', // Light yellow
    '#D1FAE5', // Light green
    '#FCE7F3', // Light pink
    '#FED7AA', // Light orange
    '#FDBA74', // Orange
  ];

  const barData = Object.values(data);
  const maxValue = Math.max(...barData);

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-gray-900">
          Physiological System Scan
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="relative">
          {/* 3D Chart Container */}
          <div 
            className="relative w-full h-80 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg overflow-hidden"
            style={{
              perspective: '1200px',
              transformStyle: 'preserve-3d'
            }}
          >
            {/* Y-axis scale */}
            <div className="absolute left-2 top-4 text-white text-xs font-medium">100</div>
            <div className="absolute left-2 bottom-16 text-white text-xs font-medium">0</div>
            
            {/* 3D Cylinders Container */}
            <div 
              className="absolute inset-0 flex items-end justify-center px-4 pb-12"
              style={{
                transform: 'rotateX(20deg) rotateY(-15deg)',
                transformOrigin: 'center bottom'
              }}
            >
              <div className="flex items-end space-x-1">
                {barData.map((value, index) => {
                  const height = (value / maxValue) * 180; // Max height 180px
                  const color = systemColors[index % systemColors.length];
                  
                  return (
                    <div key={index} className="relative flex flex-col items-center">
                      {/* Cylinder */}
                      <div
                        className="relative"
                        style={{
                          width: '18px',
                          height: `${height}px`,
                          background: `linear-gradient(135deg, ${color} 0%, ${color}dd 50%, ${color}aa 100%)`,
                          borderRadius: '9px',
                          boxShadow: `
                            inset 0 0 0 1px rgba(255,255,255,0.1),
                            3px 0 6px rgba(0,0,0,0.3),
                            0 3px 6px rgba(0,0,0,0.2)
                          `,
                          transform: 'translateZ(0)',
                          transformStyle: 'preserve-3d'
                        }}
                      >
                        {/* Top ellipse */}
                        <div
                          className="absolute top-0 left-1/2 transform -translate-x-1/2"
                          style={{
                            width: '18px',
                            height: '6px',
                            background: `radial-gradient(ellipse, ${color} 0%, ${color}cc  100%)`,
                            borderRadius: '50%',
                            transform: 'translateZ(1px) rotateX(90deg)',
                            transformOrigin: 'center'
                          }}
                        />
                        
                        {/* Side highlight */}
                        <div
                          className="absolute top-0 left-0 w-1 h-full"
                          style={{
                            background: `linear-gradient(180deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.1) 100%)`,
                            borderRadius: '9px 0 0 9px'
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* System labels at bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-12 overflow-hidden">
              <div 
                className="flex justify-center items-end space-x-1 px-4 pb-2"
                style={{
                  transform: 'rotateX(-20deg) rotateY(15deg) scale(0.8)',
                  transformOrigin: 'center bottom'
                }}
              >
                {systemLabels.map((label, index) => (
                  <div 
                    key={index}
                    className="text-white text-[8px] font-medium text-center leading-tight"
                    style={{ 
                      width: '18px',
                      writingMode: 'vertical-rl',
                      textOrientation: 'mixed',
                      transform: 'rotate(180deg)'
                    }}
                  >
                    {label.split(' ').map((word, i) => (
                      <div key={i}>{word}</div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Scan info */}
            <div className="absolute bottom-2 left-4 text-white text-xs font-medium opacity-80">
              {scanDate}
            </div>
            
            {/* Result label */}
            <div className="absolute top-4 right-4">
              <div className="bg-gray-600 text-white px-3 py-6 rounded text-center text-xs font-bold tracking-wider">
                <div>SYSTEM</div>
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