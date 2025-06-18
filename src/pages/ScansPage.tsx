import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Upload, 
  Download, 
  Activity, 
  Calendar, 
  Users, 
  TrendingUp,
  Grid,
  List,
  Eye,
  RefreshCw,
  Cloud
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ScanCard } from '../components/scans/ScanCard';
import { ScanUploadModal } from '../components/scans/ScanUploadModal';
import { useScans } from '../contexts/ScansContext';
import { useAuth } from '../contexts/AuthContext';
import { ScanSearchFilters, ScanCardData } from '../types/scans';
import { format, subDays } from 'date-fns';
import { clsx } from 'clsx';

type ViewMode = 'grid' | 'list';

export const ScansPage: React.FC = () => {
  const { user } = useAuth();
  const { 
    scans,
    isLoading,
    searchScans,
    getRecentScans,
    importFromDropbox,
    searchClients
  } = useScans();
  
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filteredScans, setFilteredScans] = useState<ScanCardData[]>([]);
  const [recentScans, setRecentScans] = useState<ScanCardData[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  
  const [filters, setFilters] = useState<ScanSearchFilters>({
    sort_by: 'date_desc',
    page: 1,
    limit: 20
  });

  // Calculate stats
  const stats = useMemo(() => {
    const totalScans = scans.length;
    const recentScansCount = scans.filter(scan => 
      scan.scan_date >= subDays(new Date(), 7)
    ).length;
    const avgScore = scans.length > 0 
      ? Math.round(scans.reduce((sum, scan) => sum + scan.body_wellness_score, 0) / scans.length)
      : 0;
    const uniqueClients = new Set(scans.map(scan => scan.client_id)).size;

    return {
      totalScans,
      recentScansCount,
      avgScore,
      uniqueClients
    };
  }, [scans]);

  // Load initial data
  useEffect(() => {
    loadScans();
    loadRecentScans();
  }, [filters]);

  const loadScans = async () => {
    try {
      const result = await searchScans(filters);
      setFilteredScans(result.scans);
    } catch (error) {
      console.error('Failed to load scans:', error);
    }
  };

  const loadRecentScans = async () => {
    try {
      const recent = await getRecentScans(5);
      setRecentScans(recent);
    } catch (error) {
      console.error('Failed to load recent scans:', error);
    }
  };

  const handleSearch = async () => {
    const searchFilters: ScanSearchFilters = {
      ...filters,
      client_name: searchTerm || undefined,
      page: 1
    };
    
    try {
      const result = await searchScans(searchFilters);
      setFilteredScans(result.scans);
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  const handleFilterChange = (key: keyof ScanSearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleImportFromDropbox = async () => {
    setIsImporting(true);
    try {
      const importedScans = await importFromDropbox();
      alert(`Successfully imported ${importedScans.length} scans from Dropbox`);
      loadScans();
      loadRecentScans();
    } catch (error) {
      alert('Failed to import from Dropbox');
      console.error('Import failed:', error);
    } finally {
      setIsImporting(false);
    }
  };

  const handleViewScan = (scanId: string) => {
    // In a real app, this would navigate to scan details page
    alert(`Viewing scan details for: ${scanId}`);
  };

  const handleDownloadScan = (scanId: string) => {
    // In a real app, this would download the scan file
    alert(`Downloading scan: ${scanId}`);
  };

  const clearFilters = () => {
    setFilters({
      sort_by: 'date_desc',
      page: 1,
      limit: 20
    });
    setSearchTerm('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Scan Management</h1>
          <p className="text-gray-600 mt-1">
            Upload, manage, and analyze wellness scans
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            variant="outline" 
            onClick={handleImportFromDropbox}
            disabled={isImporting}
          >
            {isImporting ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Cloud className="w-4 h-4 mr-2" />
                Import from Dropbox
              </>
            )}
          </Button>
          <Button onClick={() => setShowUploadModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Upload Scan
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Scans</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalScans}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">This Week</p>
                <p className="text-2xl font-bold text-gray-900">{stats.recentScansCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg. Score</p>
                <p className="text-2xl font-bold text-gray-900">{stats.avgScore}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-orange-100">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Clients</p>
                <p className="text-2xl font-bold text-gray-900">{stats.uniqueClients}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Scans */}
      {recentScans.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Scans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentScans.map(scan => (
                <ScanCard
                  key={scan.scan_id}
                  scan={scan}
                  compact
                  onView={handleViewScan}
                  onDownload={handleDownloadScan}
                  showClientInfo={user?.role === 'practitioner'}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by client name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filter Toggle */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </Button>

            {/* Search Button */}
            <Button onClick={handleSearch}>
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>

            {/* View Mode Toggle */}
            <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={clsx(
                  'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  viewMode === 'grid'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                )}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={clsx(
                  'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  viewMode === 'list'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                )}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date From
                  </label>
                  <input
                    type="date"
                    value={filters.date_from ? format(filters.date_from, 'yyyy-MM-dd') : ''}
                    onChange={(e) => handleFilterChange('date_from', e.target.value ? new Date(e.target.value) : undefined)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date To
                  </label>
                  <input
                    type="date"
                    value={filters.date_to ? format(filters.date_to, 'yyyy-MM-dd') : ''}
                    onChange={(e) => handleFilterChange('date_to', e.target.value ? new Date(e.target.value) : undefined)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sort By
                  </label>
                  <select
                    value={filters.sort_by}
                    onChange={(e) => handleFilterChange('sort_by', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="date_desc">Newest First</option>
                    <option value="date_asc">Oldest First</option>
                    <option value="score_desc">Highest Score</option>
                    <option value="score_asc">Lowest Score</option>
                  </select>
                </div>

                <Input
                  label="Centre Name"
                  value={filters.centre_name || ''}
                  onChange={(e) => handleFilterChange('centre_name', e.target.value || undefined)}
                  placeholder="Filter by centre..."
                />

                <Input
                  label="Consultant Name"
                  value={filters.consultant_name || ''}
                  onChange={(e) => handleFilterChange('consultant_name', e.target.value || undefined)}
                  placeholder="Filter by consultant..."
                />

                <Input
                  label="Scan Type"
                  value={filters.scan_type || ''}
                  onChange={(e) => handleFilterChange('scan_type', e.target.value || undefined)}
                  placeholder="Filter by scan type..."
                />
              </div>

              <div className="mt-4 flex justify-end space-x-2">
                <Button variant="ghost" onClick={clearFilters}>
                  Clear Filters
                </Button>
                <Button onClick={loadScans}>
                  Apply Filters
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Scans Display */}
      {filteredScans.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No scans found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || Object.keys(filters).some(key => filters[key as keyof ScanSearchFilters])
                ? 'Try adjusting your search or filters to find scans.'
                : "No scans have been uploaded yet. Start by uploading your first scan."
              }
            </p>
            {(!searchTerm && !Object.keys(filters).some(key => filters[key as keyof ScanSearchFilters])) && (
              <Button onClick={() => setShowUploadModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Upload Your First Scan
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className={clsx(
          viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
        )}>
          {filteredScans.map(scan => (
            <ScanCard
              key={scan.scan_id}
              scan={scan}
              compact={viewMode === 'list'}
              onView={handleViewScan}
              onDownload={handleDownloadScan}
              showClientInfo={user?.role === 'practitioner'}
            />
          ))}
        </div>
      )}

      {/* Upload Modal */}
      <ScanUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
      />
    </div>
  );
};