import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Plus, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Calendar, 
  Download, 
  ChevronLeft, 
  ChevronRight,
  Users,
  Activity,
  Clock,
  Target,
  CheckSquare,
  X,
  Trash2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { WellnessScore } from '../components/dashboard/WellnessScore';
import { AddClientModal } from '../components/clients/AddClientModal';
import { EditClientModal } from '../components/clients/EditClientModal';
import { format, differenceInYears } from 'date-fns';
import { clsx } from 'clsx';

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: Date;
  avatar: string;
  wellnessScore: number;
  lastScanDate: Date;
  goals: string[];
  status: 'active' | 'inactive';
  joinDate: Date;
}

// Mock client data
const initialMockClients: Client[] = [
  {
    id: '1',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@email.com',
    phone: '+1 (555) 123-4567',
    dateOfBirth: new Date('1985-03-15'),
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&dpr=2',
    wellnessScore: 85,
    lastScanDate: new Date('2024-01-15'),
    goals: ['Weight Loss', 'Muscle Gain'],
    status: 'active',
    joinDate: new Date('2023-06-01'),
  },
  {
    id: '2',
    firstName: 'Michael',
    lastName: 'Chen',
    email: 'michael.chen@email.com',
    phone: '+1 (555) 234-5678',
    dateOfBirth: new Date('1990-07-22'),
    avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&dpr=2',
    wellnessScore: 72,
    lastScanDate: new Date('2024-01-10'),
    goals: ['Flexibility', 'Stress Management'],
    status: 'active',
    joinDate: new Date('2023-08-15'),
  },
  {
    id: '3',
    firstName: 'Emily',
    lastName: 'Davis',
    email: 'emily.davis@email.com',
    phone: '+1 (555) 345-6789',
    dateOfBirth: new Date('1988-11-08'),
    avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&dpr=2',
    wellnessScore: 91,
    lastScanDate: new Date('2024-01-18'),
    goals: ['Endurance', 'Nutrition'],
    status: 'active',
    joinDate: new Date('2023-04-10'),
  },
  {
    id: '4',
    firstName: 'David',
    lastName: 'Wilson',
    email: 'david.wilson@email.com',
    phone: '+1 (555) 456-7890',
    dateOfBirth: new Date('1982-05-30'),
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&dpr=2',
    wellnessScore: 68,
    lastScanDate: new Date('2024-01-05'),
    goals: ['Weight Loss', 'Heart Health'],
    status: 'active',
    joinDate: new Date('2023-09-20'),
  },
  {
    id: '5',
    firstName: 'Lisa',
    lastName: 'Anderson',
    email: 'lisa.anderson@email.com',
    phone: '+1 (555) 567-8901',
    dateOfBirth: new Date('1993-12-12'),
    avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&dpr=2',
    wellnessScore: 79,
    lastScanDate: new Date('2024-01-12'),
    goals: ['Muscle Gain', 'Energy'],
    status: 'active',
    joinDate: new Date('2023-07-05'),
  },
  {
    id: '6',
    firstName: 'James',
    lastName: 'Brown',
    email: 'james.brown@email.com',
    phone: '+1 (555) 678-9012',
    dateOfBirth: new Date('1987-09-18'),
    avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&dpr=2',
    wellnessScore: 83,
    lastScanDate: new Date('2024-01-08'),
    goals: ['Flexibility', 'Balance'],
    status: 'inactive',
    joinDate: new Date('2023-05-15'),
  },
];

const ITEMS_PER_PAGE = 10;

export const ClientsPage: React.FC = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>(initialMockClients);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [ageRange, setAgeRange] = useState<[number, number]>([18, 80]);
  const [sortBy, setSortBy] = useState<'name' | 'lastScan' | 'wellnessScore' | 'joinDate'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  // Get unique goals for filter
  const allGoals = useMemo(() => {
    const goals = new Set<string>();
    clients.forEach(client => {
      client.goals.forEach(goal => goals.add(goal));
    });
    return Array.from(goals);
  }, [clients]);

  // Filter and sort clients
  const filteredAndSortedClients = useMemo(() => {
    let filtered = clients.filter(client => {
      const matchesSearch = 
        client.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = selectedStatus === 'all' || client.status === selectedStatus;
      
      const matchesGoals = selectedGoals.length === 0 || 
        selectedGoals.some(goal => client.goals.includes(goal));
      
      const age = differenceInYears(new Date(), client.dateOfBirth);
      const matchesAge = age >= ageRange[0] && age <= ageRange[1];
      
      return matchesSearch && matchesStatus && matchesGoals && matchesAge;
    });

    // Sort clients
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'name':
          aValue = `${a.firstName} ${a.lastName}`;
          bValue = `${b.firstName} ${b.lastName}`;
          break;
        case 'lastScan':
          aValue = a.lastScanDate.getTime();
          bValue = b.lastScanDate.getTime();
          break;
        case 'wellnessScore':
          aValue = a.wellnessScore;
          bValue = b.wellnessScore;
          break;
        case 'joinDate':
          aValue = a.joinDate.getTime();
          bValue = b.joinDate.getTime();
          break;
        default:
          return 0;
      }
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [clients, searchTerm, selectedStatus, selectedGoals, ageRange, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedClients.length / ITEMS_PER_PAGE);
  const paginatedClients = filteredAndSortedClients.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleSelectClient = (clientId: string) => {
    setSelectedClients(prev => 
      prev.includes(clientId) 
        ? prev.filter(id => id !== clientId)
        : [...prev, clientId]
    );
  };

  const handleSelectAll = () => {
    if (selectedClients.length === paginatedClients.length) {
      setSelectedClients([]);
    } else {
      setSelectedClients(paginatedClients.map(client => client.id));
    }
  };

  const handleAddClient = (newClient: any) => {
    setClients(prev => [...prev, newClient]);
  };

  const handleEditClient = (updatedClient: Client) => {
    setClients(prev => prev.map(client => 
      client.id === updatedClient.id ? updatedClient : client
    ));
  };

  const handleDeleteClient = (clientId: string) => {
    if (confirm('Are you sure you want to delete this client? This action cannot be undone.')) {
      setClients(prev => prev.filter(client => client.id !== clientId));
      setSelectedClients(prev => prev.filter(id => id !== clientId));
    }
  };

  const handleBulkDelete = () => {
    if (confirm(`Are you sure you want to delete ${selectedClients.length} clients? This action cannot be undone.`)) {
      setClients(prev => prev.filter(client => !selectedClients.includes(client.id)));
      setSelectedClients([]);
    }
  };

  const exportClients = () => {
    const clientsToExport = selectedClients.length > 0 
      ? filteredAndSortedClients.filter(client => selectedClients.includes(client.id))
      : filteredAndSortedClients;
    
    // In a real app, this would generate and download a CSV/Excel file
    console.log('Exporting clients:', clientsToExport);
    alert(`Exporting ${clientsToExport.length} clients...`);
  };

  const handleViewClient = (clientId: string) => {
    navigate(`/clients/${clientId}`);
  };

  const handleEditClientModal = (client: Client) => {
    setEditingClient(client);
    setShowEditModal(true);
  };

  const handleScheduleAppointment = (clientId: string) => {
    // In a real app, this would open a scheduling modal or navigate to scheduling page
    alert(`Scheduling appointment for client ${clientId}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Client Management</h1>
          <p className="text-gray-600 mt-1">
            Manage your clients and track their wellness journey
          </p>
        </div>
        <Button 
          className="flex items-center space-x-2"
          onClick={() => setShowAddModal(true)}
        >
          <Plus className="w-4 h-4" />
          <span>Add New Client</span>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Clients</p>
                <p className="text-2xl font-bold text-gray-900">{clients.length}</p>
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
                <p className="text-sm font-medium text-gray-600">Active Clients</p>
                <p className="text-2xl font-bold text-gray-900">
                  {clients.filter(c => c.status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Recent Scans</p>
                <p className="text-2xl font-bold text-gray-900">
                  {clients.filter(c => 
                    (new Date().getTime() - c.lastScanDate.getTime()) / (1000 * 60 * 60 * 24) <= 7
                  ).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-orange-100">
                <Target className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg. Wellness Score</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(clients.reduce((sum, c) => sum + c.wellnessScore, 0) / clients.length)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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
                  placeholder="Search clients by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
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

            {/* Export */}
            <Button
              variant="outline"
              onClick={exportClients}
              className="flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </Button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value as any)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                {/* Goals Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Wellness Goals
                  </label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {allGoals.map(goal => (
                      <label key={goal} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedGoals.includes(goal)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedGoals([...selectedGoals, goal]);
                            } else {
                              setSelectedGoals(selectedGoals.filter(g => g !== goal));
                            }
                          }}
                          className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">{goal}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Age Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Age Range: {ageRange[0]} - {ageRange[1]}
                  </label>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="18"
                      max="80"
                      value={ageRange[0]}
                      onChange={(e) => setAgeRange([parseInt(e.target.value), ageRange[1]])}
                      className="w-full"
                    />
                    <input
                      type="range"
                      min="18"
                      max="80"
                      value={ageRange[1]}
                      onChange={(e) => setAgeRange([ageRange[0], parseInt(e.target.value)])}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Clear Filters */}
              <div className="mt-4 flex justify-end">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setSelectedStatus('all');
                    setSelectedGoals([]);
                    setAgeRange([18, 80]);
                    setSearchTerm('');
                  }}
                  className="text-sm"
                >
                  Clear All Filters
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Client Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              Clients ({filteredAndSortedClients.length})
            </CardTitle>
            {selectedClients.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  {selectedClients.length} selected
                </span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleBulkDelete}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete Selected
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedClients.length === paginatedClients.length && paginatedClients.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                    />
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                    onClick={() => handleSort('name')}
                  >
                    Client
                    {sortBy === 'name' && (
                      <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Age
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                    onClick={() => handleSort('lastScan')}
                  >
                    Last Scan
                    {sortBy === 'lastScan' && (
                      <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                    onClick={() => handleSort('wellnessScore')}
                  >
                    Wellness Score
                    {sortBy === 'wellnessScore' && (
                      <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Goals
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedClients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedClients.includes(client.id)}
                        onChange={() => handleSelectClient(client.id)}
                        className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <img
                          src={client.avatar}
                          alt={`${client.firstName} ${client.lastName}`}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {client.firstName} {client.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{client.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{client.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {differenceInYears(new Date(), client.dateOfBirth)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {format(client.lastScanDate, 'MMM dd, yyyy')}
                      </div>
                      <div className="text-xs text-gray-500">
                        {Math.floor((new Date().getTime() - client.lastScanDate.getTime()) / (1000 * 60 * 60 * 24))} days ago
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <WellnessScore score={client.wellnessScore} size="sm" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {client.goals.slice(0, 2).map((goal) => (
                          <span
                            key={goal}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {goal}
                          </span>
                        ))}
                        {client.goals.length > 2 && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            +{client.goals.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={clsx(
                          'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                          client.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        )}
                      >
                        {client.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleViewClient(client.id)}
                          className="text-gray-400 hover:text-blue-600 transition-colors"
                          title="View Profile"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleEditClientModal(client)}
                          className="text-gray-400 hover:text-green-600 transition-colors"
                          title="Edit Client"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleScheduleAppointment(client.id)}
                          className="text-gray-400 hover:text-purple-600 transition-colors"
                          title="Schedule Appointment"
                        >
                          <Calendar className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteClient(client.id)}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete Client"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{' '}
                  {Math.min(currentPage * ITEMS_PER_PAGE, filteredAndSortedClients.length)} of{' '}
                  {filteredAndSortedClients.length} results
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Button>
                  
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={clsx(
                          'px-3 py-1 text-sm rounded-md transition-colors',
                          page === currentPage
                            ? 'bg-cyan-500 text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        )}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <AddClientModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddClient}
      />

      <EditClientModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingClient(null);
        }}
        onSave={handleEditClient}
        client={editingClient}
      />
    </div>
  );
};