import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Users, 
  Shield, 
  UserCheck, 
  Award,
  Building,
  Activity,
  Grid,
  List,
  Eye,
  EyeOff
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StaffCard } from '../components/staff/StaffCard';
import { StaffModal } from '../components/staff/StaffModal';
import { useStaff } from '../contexts/StaffContext';
import { useAuth } from '../contexts/AuthContext';
import { StaffMember } from '../types/staff';
import { clsx } from 'clsx';

type ViewMode = 'grid' | 'list';
type FilterRole = 'all' | 'admin' | 'practitioner' | 'consultant';
type FilterStatus = 'all' | 'active' | 'inactive' | 'on-leave';

export const StaffPage: React.FC = () => {
  const { user } = useAuth();
  const { 
    staff, 
    stats, 
    isLoading, 
    addStaffMember, 
    updateStaffMember, 
    deleteStaffMember, 
    toggleStaffStatus,
    getActiveStaff 
  } = useStaff();
  
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<FilterRole>('all');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');

  // Filter staff
  const filteredStaff = useMemo(() => {
    let filtered = staff;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(member =>
        member.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.specializations.some(spec => spec.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply role filter
    if (filterRole !== 'all') {
      filtered = filtered.filter(member => member.role === filterRole);
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(member => member.status === filterStatus);
    }

    return filtered;
  }, [staff, searchTerm, filterRole, filterStatus]);

  const handleAddStaff = () => {
    setEditingStaff(null);
    setModalMode('create');
    setShowModal(true);
  };

  const handleEditStaff = (member: StaffMember) => {
    setEditingStaff(member);
    setModalMode('edit');
    setShowModal(true);
  };

  const handleDeleteStaff = async (member: StaffMember) => {
    if (member.role === 'admin') {
      alert('Cannot delete administrator accounts. Please contact system administrator.');
      return;
    }

    if (confirm(`Are you sure you want to delete "${member.firstName} ${member.lastName}"? This action cannot be undone.`)) {
      try {
        await deleteStaffMember(member.id);
        alert('Staff member deleted successfully');
      } catch (error) {
        alert('Failed to delete staff member');
      }
    }
  };

  const handleToggleStatus = async (member: StaffMember) => {
    try {
      await toggleStaffStatus(member.id);
      alert(`Staff member ${member.status === 'active' ? 'deactivated' : 'activated'} successfully`);
    } catch (error) {
      alert('Failed to update staff member status');
    }
  };

  const handleSaveStaff = async (staffData: Omit<StaffMember, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => {
    if (modalMode === 'create') {
      await addStaffMember(staffData);
      alert('Staff member added successfully');
    } else if (editingStaff) {
      await updateStaffMember(editingStaff.id, staffData);
      alert('Staff member updated successfully');
    }
  };

  // Only show staff page to practitioners and admins
  if (user?.role === 'client') {
    return (
      <div className="p-6 text-center">
        <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Restricted</h2>
        <p className="text-gray-600">Only practitioners and administrators can manage staff.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
          <p className="text-gray-600 mt-1">
            Manage your team members, roles, and assignments
          </p>
        </div>
        <Button onClick={handleAddStaff}>
          <Plus className="w-4 h-4 mr-2" />
          Add Staff Member
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Staff</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalStaff}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <Activity className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Staff</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeStaff}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Administrators</p>
                <p className="text-2xl font-bold text-gray-900">{stats.admins}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-orange-100">
                <UserCheck className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Consultants</p>
                <p className="text-2xl font-bold text-gray-900">{stats.consultants}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-cyan-100">
                <Award className="w-6 h-6 text-cyan-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg. Experience</p>
                <p className="text-2xl font-bold text-gray-900">{stats.averageExperience}y</p>
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
                  placeholder="Search staff by name, email, or specialization..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Role Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value as FilterRole)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="all">All Roles</option>
                <option value="admin">Administrators</option>
                <option value="practitioner">Practitioners</option>
                <option value="consultant">Consultants</option>
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
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="on-leave">On Leave</option>
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

      {/* Staff Display */}
      {filteredStaff.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No staff members found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || filterRole !== 'all' || filterStatus !== 'all'
                ? 'Try adjusting your search or filters to find staff members.'
                : "You haven't added any staff members yet. Start by adding your first team member."
              }
            </p>
            {(!searchTerm && filterRole === 'all' && filterStatus === 'all') && (
              <Button onClick={handleAddStaff}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Staff Member
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
          {filteredStaff.map(member => (
            <StaffCard
              key={member.id}
              staff={member}
              compact={viewMode === 'list'}
              onEdit={handleEditStaff}
              onDelete={handleDeleteStaff}
              onToggleStatus={handleToggleStatus}
            />
          ))}
        </div>
      )}

      {/* Staff Modal */}
      <StaffModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingStaff(null);
        }}
        onSave={handleSaveStaff}
        staff={editingStaff}
        mode={modalMode}
      />
    </div>
  );
};