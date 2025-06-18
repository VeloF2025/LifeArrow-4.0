import React from 'react';
import { Calendar, Target, Activity, Award, Clock, TrendingUp, Heart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { WellnessScore } from '../components/dashboard/WellnessScore';
import { MetricCard } from '../components/dashboard/MetricCard';
import { EmotionalColorScan } from '../components/scans/EmotionalColorScan';
import { PhysiologicalSystemScan } from '../components/scans/PhysiologicalSystemScan';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { useAuth } from '../contexts/AuthContext';

const wellnessData = [
  { month: 'Jan', score: 65, bodyFat: 22, muscle: 35 },
  { month: 'Feb', score: 68, bodyFat: 21, muscle: 36 },
  { month: 'Mar', score: 72, bodyFat: 20, muscle: 37 },
  { month: 'Apr', score: 75, bodyFat: 19, muscle: 38 },
  { month: 'May', score: 78, bodyFat: 18, muscle: 39 },
  { month: 'Jun', score: 82, bodyFat: 17, muscle: 40 },
];

const goals = [
  { id: '1', title: 'Reduce Body Fat', current: 17, target: 15, unit: '%', progress: 85 },
  { id: '2', title: 'Increase Muscle Mass', current: 40, target: 42, unit: 'kg', progress: 75 },
  { id: '3', title: 'Daily Steps', current: 8500, target: 10000, unit: 'steps', progress: 85 },
  { id: '4', title: 'Water Intake', current: 2.1, target: 2.5, unit: 'L', progress: 84 },
];

const achievements = [
  { id: '1', title: 'First Scan Complete', icon: '🎯', date: '2 months ago' },
  { id: '2', title: 'Body Fat Goal Achieved', icon: '🔥', date: '1 month ago' },
  { id: '3', title: '30-Day Streak', icon: '⚡', date: '2 weeks ago' },
  { id: '4', title: 'Wellness Score 80+', icon: '🏆', date: '1 week ago' },
];

// Mock scan data
const emotionalColorData = {
  red: 40,
  yellow: 100,
  green: 0,
  blue: 60,
  darkBlue: 40,
  purple: 20,
  scanDate: '2025-3-16T23_20*004_brv.txt'
};

const physiologicalSystemData = [
  { name: 'Nervous System', value: 85, color: '#3B82F6', category: 'nervous' as const },
  { name: 'Cardio Vascular 1', value: 92, color: '#EF4444', category: 'cardiovascular' as const },
  { name: 'Cardio Vascular 2', value: 78, color: '#06B6D4', category: 'cardiovascular' as const },
  { name: 'Cardio Vascular 3', value: 65, color: '#8B5CF6', category: 'cardiovascular' as const },
  { name: 'Respiratory', value: 88, color: '#10B981', category: 'cardiovascular' as const },
  { name: 'Gastrointestinal 1', value: 72, color: '#F59E0B', category: 'gastrointestinal' as const },
  { name: 'Gastrointestinal 2', value: 80, color: '#84CC16', category: 'gastrointestinal' as const },
  { name: 'Immune', value: 90, color: '#F3F4F6', category: 'immune' as const },
  { name: 'Endocrine', value: 75, color: '#FEF3C7', category: 'endocrine' as const },
  { name: 'Lymphatic', value: 82, color: '#E0E7FF', category: 'lymphatic' as const },
  { name: 'Skin', value: 68, color: '#FCE7F3', category: 'skin' as const },
  { name: 'Reproductive', value: 77, color: '#FED7AA', category: 'reproductive' as const },
  { name: 'Urinary', value: 85, color: '#D97706', category: 'urinary' as const },
  { name: 'Muscle Tendon', value: 91, color: '#92400E', category: 'musculoskeletal' as const },
  { name: 'Bone Ligament', value: 73, color: '#451A03', category: 'musculoskeletal' as const },
];

export const ClientDashboard: React.FC = () => {
  const { user } = useAuth();
  const clientName = user ? `${user.firstName} ${user.lastName}` : 'Client';
  
  const nextAppointment = {
    date: 'Tomorrow',
    time: '2:30 PM',
    practitioner: 'Dr. Sarah Johnson',
    service: 'Body Composition Analysis',
    avatar: 'https://images.pexels.com/photos/5327585/pexels-photo-5327585.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=2',
  };

  // Add client name to scan data
  const emotionalColorDataWithClient = {
    ...emotionalColorData,
    clientName
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Welcome back, {user?.firstName || 'John'}!</h1>
            <p className="text-purple-100 mt-1">
              Your wellness journey continues. Keep up the great work!
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-purple-100">Current Streak</p>
            <p className="text-3xl font-bold">28 days</p>
          </div>
        </div>
      </div>

      {/* Body Score and Wellness Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Wellness Score */}
        <Card className="flex items-center justify-center">
          <CardContent className="p-6 text-center">
            <WellnessScore score={82} size="lg" />
          </CardContent>
        </Card>

        {/* Progress Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Wellness Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={wellnessData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="url(#wellnessGradient)"
                  fill="url(#wellnessGradient)"
                  strokeWidth={3}
                />
                <defs>
                  <linearGradient id="wellnessGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Next Appointment */}
      <Card className="bg-gradient-to-r from-cyan-50 to-blue-50 border-cyan-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-cyan-500 rounded-full">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Next Appointment</h3>
                <p className="text-gray-600">{nextAppointment.service}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {nextAppointment.date} at {nextAppointment.time}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <img
                      src={nextAppointment.avatar}
                      alt={nextAppointment.practitioner}
                      className="w-5 h-5 rounded-full"
                    />
                    <span className="text-sm text-gray-600">{nextAppointment.practitioner}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" size="sm">
                Reschedule
              </Button>
              <Button size="sm">
                Join Call
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Emotional Color Scan Result - Full width */}
      <Card>
        <CardContent className="p-6">
          <EmotionalColorScan data={emotionalColorDataWithClient} />
        </CardContent>
      </Card>

      {/* Physiological System Scan Result - Full width */}
      <Card>
        <CardContent className="p-6">
          <PhysiologicalSystemScan 
            data={physiologicalSystemData} 
            scanDate="2025-3-16T23_20*004_brv.txt"
            clientName={clientName}
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Goals Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="w-5 h-5 mr-2 text-purple-600" />
              Wellness Goals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {goals.map((goal) => (
                <div key={goal.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900">{goal.title}</span>
                    <span className="text-sm text-gray-600">
                      {goal.current} / {goal.target} {goal.unit}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-gray-500">{goal.progress}% complete</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Award className="w-5 h-5 mr-2 text-yellow-600" />
              Recent Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className="p-4 rounded-lg border border-gray-200 hover:border-purple-300 transition-colors text-center"
                >
                  <div className="text-3xl mb-2">{achievement.icon}</div>
                  <h4 className="font-medium text-gray-900 mb-1">{achievement.title}</h4>
                  <p className="text-xs text-gray-500">{achievement.date}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button className="h-16 text-lg">
          <Calendar className="w-6 h-6 mr-3" />
          Book Appointment
        </Button>
        <Button variant="outline" className="h-16 text-lg">
          <Activity className="w-6 h-6 mr-3" />
          View Scan History
        </Button>
        <Button variant="outline" className="h-16 text-lg">
          <Target className="w-6 h-6 mr-3" />
          Update Goals
        </Button>
      </div>
    </div>
  );
};