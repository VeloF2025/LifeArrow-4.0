import React, { useState } from 'react';
import { Users, Calendar, Activity, DollarSign, Plus, Clock, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { MetricCard } from '../components/dashboard/MetricCard';
import { WellnessScore } from '../components/dashboard/WellnessScore';
import { CurrencyDisplay } from '../components/currency/CurrencyDisplay';
import { AddClientModal } from '../components/clients/AddClientModal';
import { BookAppointmentModal } from '../components/appointments/BookAppointmentModal';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const revenueData = [
  { month: 'Jan', revenue: 4500 },
  { month: 'Feb', revenue: 5200 },
  { month: 'Mar', revenue: 4800 },
  { month: 'Apr', revenue: 6100 },
  { month: 'May', revenue: 5800 },
  { month: 'Jun', revenue: 6500 },
];

const appointmentData = [
  { day: 'Mon', appointments: 8 },
  { day: 'Tue', appointments: 12 },
  { day: 'Wed', appointments: 10 },
  { day: 'Thu', appointments: 15 },
  { day: 'Fri', appointments: 9 },
  { day: 'Sat', appointments: 6 },
  { day: 'Sun', appointments: 3 },
];

const recentClients = [
  {
    id: '1',
    name: 'Sarah Johnson',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=2',
    lastScan: '2 days ago',
    wellnessScore: 85,
    status: 'Improving',
  },
  {
    id: '2',
    name: 'Michael Chen',
    avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=2',
    lastScan: '1 week ago',
    wellnessScore: 72,
    status: 'Stable',
  },
  {
    id: '3',
    name: 'Emily Davis',
    avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=2',
    lastScan: '3 days ago',
    wellnessScore: 91,
    status: 'Excellent',
  },
];

const upcomingAppointments = [
  {
    id: '1',
    client: 'David Wilson',
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=2',
    time: '10:00 AM',
    service: 'Body Composition Analysis',
    duration: '45 min',
  },
  {
    id: '2',
    client: 'Lisa Anderson',
    avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=2',
    time: '2:30 PM',
    service: 'Wellness Consultation',
    duration: '60 min',
  },
  {
    id: '3',
    client: 'James Brown',
    avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=2',
    time: '4:00 PM',
    service: 'Follow-up Scan',
    duration: '30 min',
  },
];

export const PractitionerDashboard: React.FC = () => {
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [showBookAppointmentModal, setShowBookAppointmentModal] = useState(false);

  const handleAddClient = (clientData: any) => {
    console.log('New client added:', clientData);
    // In a real app, this would save the client to the database
    setShowAddClientModal(false);
  };

  // Custom tooltip formatter for revenue chart
  const formatTooltip = (value: number, name: string) => {
    if (name === 'Revenue') {
      return [<CurrencyDisplay amount={value} />, name];
    }
    return [value, name];
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Welcome back, Dr. Sarah!</h1>
            <p className="text-cyan-100 mt-1">
              Today is {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          <div className="flex space-x-3">
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => setShowAddClientModal(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Client
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="border-white text-white hover:bg-white hover:text-cyan-600"
              onClick={() => setShowBookAppointmentModal(true)}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Schedule
            </Button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Active Clients"
          value={127}
          change={12}
          changeLabel="this month"
          icon={<Users className="w-6 h-6" />}
          color="blue"
        />
        <MetricCard
          title="Today's Appointments"
          value={8}
          change={-5}
          changeLabel="vs yesterday"
          icon={<Calendar className="w-6 h-6" />}
          color="green"
        />
        <MetricCard
          title="Scans This Week"
          value={23}
          change={18}
          changeLabel="vs last week"
          icon={<Activity className="w-6 h-6" />}
          color="purple"
        />
        <MetricCard
          title="Monthly Revenue"
          value={<CurrencyDisplay amount={6500} />}
          change={8}
          changeLabel="vs last month"
          icon={<DollarSign className="w-6 h-6" />}
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
              Revenue Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={formatTooltip} />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="url(#revenueGradient)" 
                  strokeWidth={3}
                  dot={{ fill: '#06b6d4', strokeWidth: 2, r: 4 }}
                />
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#06b6d4" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Weekly Appointments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-blue-600" />
              Weekly Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={appointmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="appointments" fill="url(#appointmentGradient)" radius={[4, 4, 0, 0]} />
                <defs>
                  <linearGradient id="appointmentGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06b6d4" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Client Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Client Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentClients.map((client) => (
                <div key={client.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <img
                    src={client.avatar}
                    alt={client.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{client.name}</h4>
                    <p className="text-sm text-gray-500">Last scan: {client.lastScan}</p>
                  </div>
                  <div className="text-right">
                    <WellnessScore score={client.wellnessScore} size="sm" />
                    <p className="text-xs text-gray-500 mt-1">{client.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Today's Appointments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Today's Appointments</span>
              <Clock className="w-5 h-5 text-gray-400" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center space-x-4 p-3 rounded-lg border border-gray-200 hover:border-cyan-300 transition-colors">
                  <img
                    src={appointment.avatar}
                    alt={appointment.client}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{appointment.client}</h4>
                    <p className="text-sm text-gray-500">{appointment.service}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-cyan-600">{appointment.time}</p>
                    <p className="text-xs text-gray-500">{appointment.duration}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button 
              variant="outline" 
              className="w-full mt-4"
              onClick={() => setShowBookAppointmentModal(true)}
            >
              View All Appointments
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <AddClientModal
        isOpen={showAddClientModal}
        onClose={() => setShowAddClientModal(false)}
        onSave={handleAddClient}
      />

      <BookAppointmentModal
        isOpen={showBookAppointmentModal}
        onClose={() => setShowBookAppointmentModal(false)}
      />
    </div>
  );
};