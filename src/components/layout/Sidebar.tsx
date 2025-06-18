import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Activity,
  FileText,
  Settings,
  User,
  Heart,
  Target,
  Bell,
  Wrench,
  Globe,
  ChevronDown,
  ChevronRight,
  Building,
  UserCheck,
  Scan,
  Video
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { clsx } from 'clsx';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [settingsExpanded, setSettingsExpanded] = useState(false);

  const practitionerNavItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Users, label: 'Clients', path: '/clients' },
    { icon: Calendar, label: 'Appointments', path: '/appointments' },
    { icon: Wrench, label: 'Services', path: '/services' },
    { icon: Building, label: 'Treatment Centres', path: '/centres' },
    { icon: UserCheck, label: 'Staff', path: '/staff' },
    { icon: Scan, label: 'Scans', path: '/scans' },
    { icon: Video, label: 'Videos', path: '/videos' },
    { icon: Target, label: 'Wellness Plans', path: '/wellness-plans' },
    { icon: FileText, label: 'Reports', path: '/reports' },
  ];

  const clientNavItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: User, label: 'My Profile', path: '/profile' },
    { icon: Calendar, label: 'Appointments', path: '/appointments' },
    { icon: Scan, label: 'My Scans', path: '/scans' },
    { icon: Video, label: 'Videos', path: '/videos' },
    { icon: Target, label: 'Wellness Goals', path: '/goals' },
    { icon: Heart, label: 'Wellness Plan', path: '/wellness-plan' },
    { icon: Bell, label: 'Notifications', path: '/notifications' },
  ];

  const settingsSubItems = user?.role === 'practitioner' ? [
    { icon: Globe, label: 'Currency Settings', path: '/currency-settings' },
    { icon: Settings, label: 'General Settings', path: '/settings' },
  ] : [
    { icon: Settings, label: 'General Settings', path: '/settings' },
  ];

  const navItems = user?.role === 'practitioner' ? practitionerNavItems : clientNavItems;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={clsx(
          'fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-slate-900 to-slate-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-4 border-b border-slate-700">
            <img
              src="/Life Arrow Logo.jpg"
              alt="Life Arrow"
              className="h-10 w-auto"
            />
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200',
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700'
                  )
                }
                onClick={() => window.innerWidth < 1024 && onClose()}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.label}
              </NavLink>
            ))}

            {/* Settings with Sub-menu */}
            <div>
              <button
                onClick={() => setSettingsExpanded(!settingsExpanded)}
                className="flex items-center justify-between w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 text-slate-300 hover:text-white hover:bg-slate-700"
              >
                <div className="flex items-center">
                  <Settings className="w-5 h-5 mr-3" />
                  Settings
                </div>
                {settingsExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>

              {/* Settings Sub-menu */}
              {settingsExpanded && (
                <div className="ml-4 mt-2 space-y-1">
                  {settingsSubItems.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={({ isActive }) =>
                        clsx(
                          'flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200',
                          isActive
                            ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                            : 'text-slate-300 hover:text-white hover:bg-slate-700'
                        )
                      }
                      onClick={() => window.innerWidth < 1024 && onClose()}
                    >
                      <item.icon className="w-4 h-4 mr-3" />
                      {item.label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          </nav>

          {/* User info */}
          <div className="p-4 border-t border-slate-700">
            <div className="flex items-center space-x-3">
              <img
                src={user?.avatar || `https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&dpr=2`}
                alt={`${user?.firstName} ${user?.lastName}`}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-slate-400 truncate capitalize">
                  {user?.role}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};