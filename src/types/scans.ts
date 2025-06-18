export interface EmotionalColorScanData {
  id: string;
  clientId: string;
  scanDate: Date;
  red: number;
  yellow: number;
  green: number;
  blue: number;
  darkBlue: number;
  purple: number;
  interpretation?: string;
  notes?: string;
}

export interface PhysiologicalSystemData {
  name: string;
  value: number;
  color: string;
  category: 'cardiovascular' | 'gastrointestinal' | 'immune' | 'lymphatic' | 'skin' | 'reproductive' | 'urinary' | 'musculoskeletal' | 'endocrine';
  normalRange: {
    min: number;
    max: number;
  };
  status: 'optimal' | 'good' | 'attention' | 'concern';
}

export interface PhysiologicalSystemScanData {
  id: string;
  clientId: string;
  scanDate: Date;
  systems: PhysiologicalSystemData[];
  overallScore: number;
  interpretation?: string;
  notes?: string;
}

export interface ScanResult {
  id: string;
  clientId: string;
  scanDate: Date;
  scanType: 'emotional-color' | 'physiological-system' | 'body-composition';
  emotionalColorData?: EmotionalColorScanData;
  physiologicalSystemData?: PhysiologicalSystemScanData;
  bodyCompositionData?: {
    bodyFat: number;
    muscleMass: number;
    hydration: number;
    metabolicAge: number;
  };
  wellnessScore: number;
  videoRecommendations?: string[]; // Video IDs to play based on results
  createdAt: Date;
  updatedAt: Date;
}