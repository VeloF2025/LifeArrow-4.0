import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit, 
  Calendar, 
  Upload, 
  Phone, 
  Mail, 
  MapPin, 
  Heart, 
  Activity, 
  Target,
  FileText,
  Clock,
  TrendingUp,
  User,
  Shield,
  AlertCircle,
  Save,
  X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { WellnessScore } from '../components/dashboard/WellnessScore';
import { format, differenceInYears } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

// Mock client data
const mockClient = {
  id: '1',
  firstName: 'Sarah',
  lastName: 'Johnson',
  email: 'sarah.johnson@email.com',
  phone: '+1 (555) 123-4567',
  dateOfBirth: new Date('1985-03-15'),
  avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
  wellnessScore: 85,
  status: 'active',
  joinDate: new Date('2023-06-01'),
  address: '123 Wellness Street, Health City, HC 12345',
  emergencyContact: {
    name: 'John Johnson',
    phone: '+1 (555) 987-6543',
    relationship: 'Spouse'
  },
  medicalHistory: [
    'Hypertension (controlled)',
    'Previous knee injury (2019)',
    'Allergic to shellfish'
  ],
  goals: ['Weight Loss', 'Muscle Gain', 'Improved Energy'],
  notes: [
    {
      id: '1',
      date: new Date('2024-01-15'),
      practitioner: 'Dr. Sarah Johnson',
      content: 'Client showing excellent progress with weight loss goals. Recommended increasing protein intake.',
      type: 'assessment'
    },
    {
      id: '2',
      date: new Date('2024-01-10'),
      practitioner: 'Dr. Sarah Johnson',
      content: 'Completed body composition scan. Body fat percentage decreased by 2% since last visit.',
      type: 'scan'
    }
  ]
};

const mockScans = [
  {
    id: '1',
    date: new Date('2024-01-15'),
    type: 'Body Composition',
    bodyFat: 22,
    muscleMass: 45,
    hydration: 68,
    wellnessScore: 85,
    notes: 'Excellent progress on muscle gain'
  },
  {
    id: '2',
    date: new Date('2024-01-01'),
    type: 'Body Composition',
    bodyFat: 24,
    muscleMass: 43,
    hydration: 65,
    wellnessScore: 78,
    notes: 'Good baseline measurements'
  },
  {
    id: '3',
    date: new Date('2023-12-15'),
    type: 'Body Composition',
    bodyFat: 26,
    muscleMass: 41,
    hydration: 62,
    wellnessScore: 72,
    notes: 'Initial assessment'
  }
];

const mockAppointments = [
  {
    id: '1',
    date: new Date('2024-01-25'),
    time: '10:00 AM',
    service: 'Body Composition Analysis',
    status: 'scheduled',
    practitioner: 'Dr. Sarah Johnson'
  },
  {
    id: '2',
    date: new Date('2024-01-15'),
    time: '2:30 PM',
    service: 'Wellness Consultation',
    status: 'completed',
    practitioner: 'Dr. Sarah Johnson'
  },
  {
    id: '3',
    date: new Date('2024-01-01'),
    time: '11:00 AM',
    service: 'Initial Assessment',
    status: 'completed',
    practitioner: 'Dr. Sarah Johnson'
  }
];

const mockWellnessPlans = [
  {
    id: '1',
    title: 'Weight Loss & Muscle Building Program',
    description: 'Comprehensive 12-week program focusing on sustainable weight loss and lean muscle development',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-03-31'),
    status: 'active',
    progress: 65,
    goals: [
      { title: 'Lose 10 lbs', progress: 70, target: 10, current: 7, unit: 'lbs' },
      { title: 'Gain 5 lbs muscle', progress: 60, target: 5, current: 3, unit: 'lbs' },
      { title: 'Exercise 4x/week', progress: 80, target: 4, current: 3.2, unit: 'days' }
    ]
  }
];

const progressData = [
  { month: 'Oct', bodyFat: 26, muscle: 41, weight: 165 },
  { month: 'Nov', bodyFat: 25, muscle: 42, weight: 163 },
  { month: 'Dec', bodyFat: 24, muscle: 43, weight: 161 },
  { month: 'Jan', bodyFat: 22, muscle: 45, weight: 158 }
];

export const ClientProfilePage: React.FC = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'scans' | 'appointments' | 'plans' | 'notes'>('overview');
  const [isEditing, setIsEditing] = useState(false);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'scans', label: 'Scans', icon: Activity },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'plans', label: 'Wellness Plans', icon: Target },
    { id: 'notes', label: 'Notes', icon: FileText }
  ];

  const renderOverview = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <User className="w-5 h-5 mr-2 text-blue-600" />
              Personal Information
            </span>
            {!isEditing && (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input label="First Name" value={mockClient.firstName} />
                <Input label="Last Name" value={mockClient.lastName} />
              </div>
              <Input label="Email" type="email" value={mockClient.email} />
              <Input label="Phone" value={mockClient.phone} />
              <Input label="Date of Birth" type="date" value={format(mockClient.dateOfBirth, 'yyyy-MM-dd')} />
              <Input label="Address" value={mockClient.address} />
              <div className="flex space-x-2">
                <Button onClick={() => setIsEditing(false)}>
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-gray-400" />
                <span>{mockClient.email}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-gray-400" />
                <span>{mockClient.phone}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span>
                  {format(mockClient.dateOfBirth, 'MMMM dd, yyyy')} 
                  ({differenceInYears(new Date(), mockClient.dateOfBirth)} years old)
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span>{mockClient.address}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="w-4 h-4 text-gray-400" />
                <span>Member since {format(mockClient.joinDate, 'MMMM yyyy')}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Emergency Contact */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertCircle className="w-5 h-5 mr-2 text-red-600" />
            Emergency Contact
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="font-medium text-gray-900">{mockClient.emergencyContact.name}</p>
              <p className="text-sm text-gray-600">{mockClient.emergencyContact.relationship}</p>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="w-4 h-4 text-gray-400" />
              <span>{mockClient.emergencyContact.phone}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Medical History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Heart className="w-5 h-5 mr-2 text-red-600" />
            Medical History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {mockClient.medicalHistory.map((item, index) => (
              <div key={index} className="flex items-center space-x-3 p-2 bg-red-50 rounded-lg">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Wellness Goals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="w-5 h-5 mr-2 text-purple-600" />
            Wellness Goals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {mockClient.goals.map((goal, index) => (
              <div key={index} className="flex items-center space-x-3 p-2 bg-purple-50 rounded-lg">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-sm">{goal}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderScans = () => (
    <div className="space-y-6">
      {/* Progress Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Progress Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={progressData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="bodyFat" stroke="#ef4444" strokeWidth={2} name="Body Fat %" />
              <Line type="monotone" dataKey="muscle" stroke="#3b82f6" strokeWidth={2} name="Muscle Mass (kg)" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Scan History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Scan History</span>
            <Button>
              <Upload className="w-4 h-4 mr-2" />
              Upload New Scan
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockScans.map((scan) => (
              <div key={scan.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900">{scan.type}</h4>
                    <p className="text-sm text-gray-600">{format(scan.date, 'MMMM dd, yyyy')}</p>
                  </div>
                  <WellnessScore score={scan.wellnessScore} size="sm" />
                </div>
                <div className="grid grid-cols-3 gap-4 mb-3">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-600">{scan.bodyFat}%</p>
                    <p className="text-xs text-gray-600">Body Fat</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{scan.muscleMass}kg</p>
                    <p className="text-xs text-gray-600">Muscle Mass</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-cyan-600">{scan.hydration}%</p>
                    <p className="text-xs text-gray-600">Hydration</p>
                  </div>
                </div>
                {scan.notes && (
                  <p className="text-sm text-gray-700 bg-gray-100 p-2 rounded">{scan.notes}</p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAppointments = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Appointment History</span>
          <Button>
            <Calendar className="w-4 h-4 mr-2" />
            Schedule Appointment
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockAppointments.map((appointment) => (
            <div key={appointment.id} className="border rounded-lg p-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">{appointment.service}</h4>
                  <p className="text-sm text-gray-600">
                    {format(appointment.date, 'MMMM dd, yyyy')} at {appointment.time}
                  </p>
                  <p className="text-sm text-gray-600">with {appointment.practitioner}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  appointment.status === 'completed' 
                    ? 'bg-green-100 text-green-800'
                    : appointment.status === 'scheduled'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {appointment.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const renderPlans = () => (
    <div className="space-y-6">
      {mockWellnessPlans.map((plan) => (
        <Card key={plan.id}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{plan.title}</span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                plan.status === 'active' 
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {plan.status}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{plan.description}</p>
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Overall Progress</span>
                <span>{plan.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                  style={{ width: `${plan.progress}%` }}
                />
              </div>
            </div>
            <div className="space-y-3">
              {plan.goals.map((goal, index) => (
                <div key={index} className="border rounded-lg p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">{goal.title}</span>
                    <span className="text-sm text-gray-600">
                      {goal.current} / {goal.target} {goal.unit}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderNotes = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Practitioner Notes</span>
          <Button>
            <FileText className="w-4 h-4 mr-2" />
            Add Note
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockClient.notes.map((note) => (
            <div key={note.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    note.type === 'assessment' 
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {note.type}
                  </span>
                  <span className="text-sm text-gray-600">{note.practitioner}</span>
                </div>
                <span className="text-sm text-gray-500">{format(note.date, 'MMM dd, yyyy')}</span>
              </div>
              <p className="text-gray-700">{note.content}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate('/clients')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Clients
          </Button>
          <div className="flex items-center space-x-4">
            <img
              src={mockClient.avatar}
              alt={`${mockClient.firstName} ${mockClient.lastName}`}
              className="w-16 h-16 rounded-full object-cover"
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {mockClient.firstName} {mockClient.lastName}
              </h1>
              <p className="text-gray-600">
                {differenceInYears(new Date(), mockClient.dateOfBirth)} years old • 
                Member since {format(mockClient.joinDate, 'MMMM yyyy')}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <WellnessScore score={mockClient.wellnessScore} size="md" />
          <div className="flex space-x-2">
            <Button variant="outline">
              <Calendar className="w-4 h-4 mr-2" />
              Schedule
            </Button>
            <Button>
              <Upload className="w-4 h-4 mr-2" />
              Upload Scan
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'border-cyan-500 text-cyan-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'scans' && renderScans()}
        {activeTab === 'appointments' && renderAppointments()}
        {activeTab === 'plans' && renderPlans()}
        {activeTab === 'notes' && renderNotes()}
      </div>
    </div>
  );
};