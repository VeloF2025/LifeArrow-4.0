import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Activity, 
  DollarSign, 
  Clock, 
  Eye,
  EyeOff,
  Grid,
  List,
  BarChart3
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ServiceCard } from '../components/services/ServiceCard';
import { ServiceModal } from '../components/services/ServiceModal';
import { useServices } from '../contexts/ServicesContext';
import { useAuth } from '../contexts/AuthContext';
import { ServiceType } from '../types/appointments';
import { clsx } from 'clsx';

type ViewMode = 'grid' | 'list';
type FilterCategory = 'all' | 'consultation' | 'scan' | 'therapy' | 'assessment';
type FilterStatus = 'all' | 'active' | 'inactive';

export const ServicesPage: React.FC = () => {
  const { user } = useAuth();
  const { 
    services, 
    isLoading, 
    addService, 
    updateService, 
    deleteService, 
    toggleServiceStatus,
    getActiveServices 
  } = useServices();
  
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<FilterCategory>('all');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<ServiceType | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');

  // Filter services
  const filteredServices = useMemo(() => {
    let filtered = services;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(service =>
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(service => service.category === filterCategory);
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(service => 
        filterStatus === 'active' ? service.isActive : !service.isActive
      );
    }

    return filtered;
  }, [services, searchTerm, filterCategory, filterStatus]);

  // Calculate stats
  const stats = useMemo(() => {
    const activeServices = getActiveServices();
    const totalRevenue = services.reduce((sum, service) => sum + service.price, 0);
    const avgDuration = services.length > 0 
      ? Math.round(services.reduce((sum, service) => sum + service.duration, 0) / services.length)
      : 0;
    const avgPrice = services.length > 0
      ? Math.round(services.reduce((sum, service) => sum + service.price, 0) / services.length)
      : 0;

    return {
      total: services.length,
      active: activeServices.length,
      totalRevenue,
      avgDuration,
      avgPrice,
    };
  }, [services, getActiveServices]);

  const handleAddService = () => {
    setEditingService(null);
    setModalMode('create');
    setShowModal(true);
  };

  const handleEditService = (service: ServiceType) => {
    setEditingService(service);
    setModalMode('edit');
    setShowModal(true);
  };

  const handleDeleteService = async (service: ServiceType) => {
    if (confirm(`Are you sure you want to delete "${service.name}"? This action cannot be undone.`)) {
      try {
        await deleteService(service.id);
        alert('Service deleted successfully');
      } catch (error) {
        alert('Failed to delete service');
      }
    }
  };

  const handleToggleStatus = async (service: ServiceType) => {
    try {
      await toggleServiceStatus(service.id);
      alert(`Service ${service.isActive ? 'deactivated' : 'activated'} successfully`);
    } catch (error) {
      alert('Failed to update service status');
    }
  };

  const handleSaveService = async (serviceData: Omit<ServiceType, 'id'> | ServiceType) => {
    if (modalMode === 'create') {
      await addService(serviceData as Omit<ServiceType, 'id'>);
      alert('Service added successfully');
    } else if (editingService) {
      await updateService(editingService.id, serviceData);
      alert('Service updated successfully');
    }
  };

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    { value: 'consultation', label: 'Consultation' },
    { value: 'scan', label: 'Scan' },
    { value: 'therapy', label: 'Therapy' },
    { value: 'assessment', label: 'Assessment' },
  ];

  // Only show services page to practitioners
  if (user?.role !== 'practitioner') {
    return (
      <div className="p-6 text-center">
        <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Restricted</h2>
        <p className="text-gray-600">Only practitioners can manage services.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Services Management</h1>
          <p className="text-gray-600 mt-1">
            Manage your service offerings, pricing, and availability
          </p>
        </div>
        <Button onClick={handleAddService}>
          <Plus className="w-4 h-4 mr-2" />
          Add New Service
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Services</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <Eye className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Services</p>
                <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg. Price</p>
                <p className="text-2xl font-bold text-gray-900">${stats.avgPrice}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-orange-100">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg. Duration</p>
                <p className="text-2xl font-bold text-gray-900">{stats.avgDuration}min</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-cyan-100">
                <BarChart3 className="w-6 h-6 text-cyan-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-gray-900">${stats.totalRevenue}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Controls */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value as FilterCategory)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                {categoryOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>

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
        </CardContent>
      </Card>

      {/* Services Display */}
      {filteredServices.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No services found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || filterCategory !== 'all' || filterStatus !== 'all'
                ? 'Try adjusting your search or filters to find services.'
                : "You haven't created any services yet. Start by adding your first service."
              }
            </p>
            {(!searchTerm && filterCategory === 'all' && filterStatus === 'all') && (
              <Button onClick={handleAddService}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Service
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
          {filteredServices.map(service => (
            <ServiceCard
              key={service.id}
              service={service}
              compact={viewMode === 'list'}
              onEdit={handleEditService}
              onDelete={handleDeleteService}
              onToggleStatus={handleToggleStatus}
            />
          ))}
        </div>
      )}

      {/* Service Modal */}
      <ServiceModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingService(null);
        }}
        onSave={handleSaveService}
        service={editingService}
        mode={modalMode}
      />
    </div>
  );
};