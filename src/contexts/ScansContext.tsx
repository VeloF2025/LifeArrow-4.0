import React, { createContext, useContext, useState, useEffect } from 'react';
import { ScanData, ScanCardData, ScanUploadRequest, ScanSearchFilters, ScanSearchResult, ClientSearchResult } from '../types/scans';

interface ScansContextType {
  scans: ScanData[];
  isLoading: boolean;
  
  // Scan management
  uploadScan: (uploadData: ScanUploadRequest) => Promise<ScanData>;
  importFromDropbox: () => Promise<ScanData[]>;
  getLatestScan: (clientId: string) => Promise<ScanData | null>;
  getScanDetails: (scanId: string) => Promise<ScanData | null>;
  getClientScans: (clientId: string, page?: number, limit?: number) => Promise<ScanSearchResult>;
  getPreviousScans: (clientId: string, page?: number, limit?: number) => Promise<ScanSearchResult>;
  
  // Search functionality
  searchClients: (query: string) => Promise<ClientSearchResult[]>;
  searchScans: (filters: ScanSearchFilters) => Promise<ScanSearchResult>;
  getRecentScans: (limit?: number) => Promise<ScanCardData[]>;
  
  // Utility functions
  deleteScan: (scanId: string) => Promise<void>;
  updateScan: (scanId: string, updates: Partial<ScanData>) => Promise<ScanData>;
}

const ScansContext = createContext<ScansContextType | undefined>(undefined);

export const useScans = () => {
  const context = useContext(ScansContext);
  if (context === undefined) {
    throw new Error('useScans must be used within a ScansProvider');
  }
  return context;
};

// Mock data for demonstration
const mockScans: ScanData[] = [
  {
    scan_id: 'scan_001',
    client_id: '1',
    client_name: 'Sarah Johnson',
    scan_date: new Date('2024-01-15'),
    centre_name: 'Life Arrow Johannesburg',
    consultant_name: 'Dr. Sarah Johnson',
    body_wellness_score: 85,
    scan_type: 'Body Composition Analysis',
    file_path: '/scans/1/2024/01/scan_001.pdf',
    file_format: 'PDF',
    file_url: 'https://example.com/scans/scan_001.pdf',
    created_at: new Date('2024-01-15T10:30:00Z'),
    updated_at: new Date('2024-01-15T10:30:00Z'),
    metadata: {
      device_model: 'InBody 970',
      technician: 'Tech001',
      notes: 'Regular quarterly assessment'
    },
    detailed_results: {
      body_fat_percentage: 22.5,
      muscle_mass: 45.2,
      hydration_level: 68.5,
      metabolic_age: 28,
      visceral_fat_level: 8
    },
    recommendations: [
      'Increase protein intake to 1.2g per kg body weight',
      'Add 2 strength training sessions per week',
      'Maintain current cardio routine'
    ]
  },
  {
    scan_id: 'scan_002',
    client_id: '2',
    client_name: 'Michael Chen',
    scan_date: new Date('2024-01-10'),
    centre_name: 'Life Arrow New York',
    consultant_name: 'Dr. Michael Chen',
    body_wellness_score: 72,
    scan_type: 'Body Composition Analysis',
    file_path: '/scans/2/2024/01/scan_002.pdf',
    file_format: 'PDF',
    file_url: 'https://example.com/scans/scan_002.pdf',
    created_at: new Date('2024-01-10T14:15:00Z'),
    updated_at: new Date('2024-01-10T14:15:00Z'),
    metadata: {
      device_model: 'InBody 970',
      technician: 'Tech002'
    },
    detailed_results: {
      body_fat_percentage: 18.3,
      muscle_mass: 52.1,
      hydration_level: 71.2,
      metabolic_age: 25,
      visceral_fat_level: 6
    },
    recommendations: [
      'Focus on flexibility and mobility work',
      'Consider stress management techniques',
      'Maintain current nutrition plan'
    ]
  },
  {
    scan_id: 'scan_003',
    client_id: '3',
    client_name: 'Emily Davis',
    scan_date: new Date('2024-01-18'),
    centre_name: 'Life Arrow London',
    consultant_name: 'Dr. Emily Davis',
    body_wellness_score: 91,
    scan_type: 'Body Composition Analysis',
    file_path: '/scans/3/2024/01/scan_003.pdf',
    file_format: 'PDF',
    file_url: 'https://example.com/scans/scan_003.pdf',
    created_at: new Date('2024-01-18T09:45:00Z'),
    updated_at: new Date('2024-01-18T09:45:00Z'),
    metadata: {
      device_model: 'InBody 970',
      technician: 'Tech003'
    },
    detailed_results: {
      body_fat_percentage: 16.8,
      muscle_mass: 38.9,
      hydration_level: 73.1,
      metabolic_age: 22,
      visceral_fat_level: 4
    },
    recommendations: [
      'Excellent progress - maintain current routine',
      'Consider advanced training techniques',
      'Monitor recovery and sleep quality'
    ]
  }
];

const mockClients = [
  { client_id: '1', client_name: 'Sarah Johnson', contact_info: { email: 'sarah@example.com' } },
  { client_id: '2', client_name: 'Michael Chen', contact_info: { email: 'michael@example.com' } },
  { client_id: '3', client_name: 'Emily Davis', contact_info: { email: 'emily@example.com' } },
  { client_id: '4', client_name: 'David Wilson', contact_info: { email: 'david@example.com' } },
  { client_id: '5', client_name: 'Lisa Anderson', contact_info: { email: 'lisa@example.com' } }
];

export const ScansProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [scans, setScans] = useState<ScanData[]>(mockScans);
  const [isLoading, setIsLoading] = useState(false);

  // Simulate API delay
  const simulateApiDelay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

  const uploadScan = async (uploadData: ScanUploadRequest): Promise<ScanData> => {
    setIsLoading(true);
    await simulateApiDelay();
    
    const newScan: ScanData = {
      scan_id: `scan_${Date.now()}`,
      client_id: uploadData.client_id,
      client_name: mockClients.find(c => c.client_id === uploadData.client_id)?.client_name || 'Unknown Client',
      scan_date: uploadData.scan_date || new Date(),
      centre_name: uploadData.centre_name,
      consultant_name: uploadData.consultant_name,
      body_wellness_score: Math.floor(Math.random() * 40) + 60, // Random score 60-100
      scan_type: uploadData.scan_type,
      file_path: `/scans/${uploadData.client_id}/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/scan_${Date.now()}.${uploadData.file.name.split('.').pop()}`,
      file_format: uploadData.file.name.split('.').pop()?.toUpperCase() || 'UNKNOWN',
      file_url: `https://example.com/scans/scan_${Date.now()}.${uploadData.file.name.split('.').pop()}`,
      created_at: new Date(),
      updated_at: new Date(),
      metadata: uploadData.metadata || {}
    };
    
    setScans(prev => [newScan, ...prev]);
    setIsLoading(false);
    return newScan;
  };

  const importFromDropbox = async (): Promise<ScanData[]> => {
    setIsLoading(true);
    await simulateApiDelay(2000); // Longer delay for import
    
    // Simulate importing 2-3 new scans
    const importedScans: ScanData[] = [];
    const importCount = Math.floor(Math.random() * 3) + 1;
    
    for (let i = 0; i < importCount; i++) {
      const randomClient = mockClients[Math.floor(Math.random() * mockClients.length)];
      const newScan: ScanData = {
        scan_id: `dropbox_scan_${Date.now()}_${i}`,
        client_id: randomClient.client_id,
        client_name: randomClient.client_name,
        scan_date: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random date within last week
        centre_name: ['Life Arrow Johannesburg', 'Life Arrow New York', 'Life Arrow London'][Math.floor(Math.random() * 3)],
        consultant_name: ['Dr. Sarah Johnson', 'Dr. Michael Chen', 'Dr. Emily Davis'][Math.floor(Math.random() * 3)],
        body_wellness_score: Math.floor(Math.random() * 40) + 60,
        scan_type: 'Body Composition Analysis',
        file_path: `/scans/${randomClient.client_id}/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/dropbox_scan_${Date.now()}_${i}.pdf`,
        file_format: 'PDF',
        file_url: `https://example.com/scans/dropbox_scan_${Date.now()}_${i}.pdf`,
        created_at: new Date(),
        updated_at: new Date(),
        metadata: { source: 'dropbox_import' }
      };
      importedScans.push(newScan);
    }
    
    setScans(prev => [...importedScans, ...prev]);
    setIsLoading(false);
    return importedScans;
  };

  const getLatestScan = async (clientId: string): Promise<ScanData | null> => {
    await simulateApiDelay();
    const clientScans = scans.filter(scan => scan.client_id === clientId);
    if (clientScans.length === 0) return null;
    
    return clientScans.reduce((latest, current) => 
      current.scan_date > latest.scan_date ? current : latest
    );
  };

  const getScanDetails = async (scanId: string): Promise<ScanData | null> => {
    await simulateApiDelay();
    return scans.find(scan => scan.scan_id === scanId) || null;
  };

  const getClientScans = async (clientId: string, page = 1, limit = 10): Promise<ScanSearchResult> => {
    await simulateApiDelay();
    const clientScans = scans
      .filter(scan => scan.client_id === clientId)
      .sort((a, b) => b.scan_date.getTime() - a.scan_date.getTime());
    
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedScans = clientScans.slice(startIndex, endIndex);
    
    return {
      scans: paginatedScans.map(scan => ({
        scan_id: scan.scan_id,
        client_id: scan.client_id,
        scan_date: scan.scan_date,
        centre_name: scan.centre_name,
        consultant_name: scan.consultant_name,
        body_wellness_score: scan.body_wellness_score,
        scan_type: scan.scan_type
      })),
      total_count: clientScans.length,
      page,
      total_pages: Math.ceil(clientScans.length / limit)
    };
  };

  const getPreviousScans = async (clientId: string, page = 1, limit = 10): Promise<ScanSearchResult> => {
    await simulateApiDelay();
    const clientScans = scans
      .filter(scan => scan.client_id === clientId)
      .sort((a, b) => b.scan_date.getTime() - a.scan_date.getTime());
    
    // Exclude the latest scan
    const previousScans = clientScans.slice(1);
    
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedScans = previousScans.slice(startIndex, endIndex);
    
    return {
      scans: paginatedScans.map(scan => ({
        scan_id: scan.scan_id,
        client_id: scan.client_id,
        scan_date: scan.scan_date,
        centre_name: scan.centre_name,
        consultant_name: scan.consultant_name,
        body_wellness_score: scan.body_wellness_score,
        scan_type: scan.scan_type
      })),
      total_count: previousScans.length,
      page,
      total_pages: Math.ceil(previousScans.length / limit)
    };
  };

  const searchClients = async (query: string): Promise<ClientSearchResult[]> => {
    await simulateApiDelay();
    const filteredClients = mockClients.filter(client =>
      client.client_name.toLowerCase().includes(query.toLowerCase()) ||
      client.client_id.includes(query)
    );
    
    return filteredClients.map(client => {
      const clientScans = scans.filter(scan => scan.client_id === client.client_id);
      const latestScan = clientScans.length > 0 
        ? clientScans.reduce((latest, current) => 
            current.scan_date > latest.scan_date ? current : latest
          )
        : undefined;
      
      return {
        client_id: client.client_id,
        client_name: client.client_name,
        contact_info: client.contact_info,
        latest_scan: latestScan ? {
          scan_id: latestScan.scan_id,
          client_id: latestScan.client_id,
          scan_date: latestScan.scan_date,
          centre_name: latestScan.centre_name,
          consultant_name: latestScan.consultant_name,
          body_wellness_score: latestScan.body_wellness_score,
          scan_type: latestScan.scan_type
        } : undefined,
        total_scans: clientScans.length
      };
    });
  };

  const searchScans = async (filters: ScanSearchFilters): Promise<ScanSearchResult> => {
    await simulateApiDelay();
    let filteredScans = [...scans];
    
    // Apply filters
    if (filters.client_name) {
      filteredScans = filteredScans.filter(scan =>
        scan.client_name?.toLowerCase().includes(filters.client_name!.toLowerCase())
      );
    }
    
    if (filters.client_id) {
      filteredScans = filteredScans.filter(scan => scan.client_id === filters.client_id);
    }
    
    if (filters.date_from) {
      filteredScans = filteredScans.filter(scan => scan.scan_date >= filters.date_from!);
    }
    
    if (filters.date_to) {
      filteredScans = filteredScans.filter(scan => scan.scan_date <= filters.date_to!);
    }
    
    if (filters.centre_name) {
      filteredScans = filteredScans.filter(scan =>
        scan.centre_name.toLowerCase().includes(filters.centre_name!.toLowerCase())
      );
    }
    
    if (filters.consultant_name) {
      filteredScans = filteredScans.filter(scan =>
        scan.consultant_name.toLowerCase().includes(filters.consultant_name!.toLowerCase())
      );
    }
    
    if (filters.scan_type) {
      filteredScans = filteredScans.filter(scan =>
        scan.scan_type.toLowerCase().includes(filters.scan_type!.toLowerCase())
      );
    }
    
    // Apply sorting
    switch (filters.sort_by) {
      case 'date_asc':
        filteredScans.sort((a, b) => a.scan_date.getTime() - b.scan_date.getTime());
        break;
      case 'date_desc':
        filteredScans.sort((a, b) => b.scan_date.getTime() - a.scan_date.getTime());
        break;
      case 'score_asc':
        filteredScans.sort((a, b) => a.body_wellness_score - b.body_wellness_score);
        break;
      case 'score_desc':
        filteredScans.sort((a, b) => b.body_wellness_score - a.body_wellness_score);
        break;
      default:
        filteredScans.sort((a, b) => b.scan_date.getTime() - a.scan_date.getTime());
    }
    
    // Apply pagination
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedScans = filteredScans.slice(startIndex, endIndex);
    
    return {
      scans: paginatedScans.map(scan => ({
        scan_id: scan.scan_id,
        client_id: scan.client_id,
        scan_date: scan.scan_date,
        centre_name: scan.centre_name,
        consultant_name: scan.consultant_name,
        body_wellness_score: scan.body_wellness_score,
        scan_type: scan.scan_type
      })),
      total_count: filteredScans.length,
      page,
      total_pages: Math.ceil(filteredScans.length / limit)
    };
  };

  const getRecentScans = async (limit = 10): Promise<ScanCardData[]> => {
    await simulateApiDelay();
    const recentScans = scans
      .sort((a, b) => b.scan_date.getTime() - a.scan_date.getTime())
      .slice(0, limit);
    
    return recentScans.map(scan => ({
      scan_id: scan.scan_id,
      client_id: scan.client_id,
      scan_date: scan.scan_date,
      centre_name: scan.centre_name,
      consultant_name: scan.consultant_name,
      body_wellness_score: scan.body_wellness_score,
      scan_type: scan.scan_type
    }));
  };

  const deleteScan = async (scanId: string): Promise<void> => {
    await simulateApiDelay();
    setScans(prev => prev.filter(scan => scan.scan_id !== scanId));
  };

  const updateScan = async (scanId: string, updates: Partial<ScanData>): Promise<ScanData> => {
    await simulateApiDelay();
    const updatedScan = scans.find(scan => scan.scan_id === scanId);
    if (!updatedScan) throw new Error('Scan not found');
    
    const newScan = { ...updatedScan, ...updates, updated_at: new Date() };
    setScans(prev => prev.map(scan => scan.scan_id === scanId ? newScan : scan));
    return newScan;
  };

  return (
    <ScansContext.Provider value={{
      scans,
      isLoading,
      uploadScan,
      importFromDropbox,
      getLatestScan,
      getScanDetails,
      getClientScans,
      getPreviousScans,
      searchClients,
      searchScans,
      getRecentScans,
      deleteScan,
      updateScan,
    }}>
      {children}
    </ScansContext.Provider>
  );
};