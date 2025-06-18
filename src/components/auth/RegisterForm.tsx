import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

export const RegisterForm: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'client' as 'practitioner' | 'client',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);

    try {
      await register(formData);
      // For clients, they will be redirected to onboarding automatically by App.tsx
      // For practitioners, they go directly to dashboard
      if (formData.role === 'practitioner') {
        navigate('/dashboard');
      }
      // Client navigation is handled by the App component's routing logic
    } catch (err) {
      setError('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <img
            src="/Life Arrow Logo.jpg"
            alt="Life Arrow"
            className="mx-auto h-20 w-auto"
          />
          <h2 className="mt-6 text-3xl font-bold text-white">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-gray-300">
            Join Life Arrow and start your wellness journey
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="First name"
                icon={<User className="w-4 h-4" />}
                required
                className="bg-white/10 border-white/20 text-white placeholder-gray-400"
              />
              <Input
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Last name"
                icon={<User className="w-4 h-4" />}
                required
                className="bg-white/10 border-white/20 text-white placeholder-gray-400"
              />
            </div>

            <Input
              label="Email address"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              icon={<Mail className="w-4 h-4" />}
              required
              className="bg-white/10 border-white/20 text-white placeholder-gray-400"
            />

            <Input
              label="Phone number"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter your phone number"
              icon={<Phone className="w-4 h-4" />}
              className="bg-white/10 border-white/20 text-white placeholder-gray-400"
            />

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Account Type
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="block w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              >
                <option value="client" className="text-gray-900">Client</option>
                <option value="practitioner" className="text-gray-900">Practitioner</option>
              </select>
              {formData.role === 'client' && (
                <p className="text-xs text-cyan-400 mt-1">
                  You'll complete a detailed profile setup after registration
                </p>
              )}
            </div>

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password (min. 6 characters)"
                icon={<Lock className="w-4 h-4" />}
                required
                className="bg-white/10 border-white/20 text-white placeholder-gray-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-8 text-gray-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <Input
              label="Confirm Password"
              type={showPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              icon={<Lock className="w-4 h-4" />}
              required
              className="bg-white/10 border-white/20 text-white placeholder-gray-400"
            />
          </div>

          {error && (
            <div className="text-red-400 text-sm text-center bg-red-900/20 p-3 rounded-lg border border-red-500/20">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Creating account...' : 'Create account'}
          </Button>

          <div className="text-center">
            <p className="text-sm text-gray-300">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-cyan-400 hover:text-cyan-300 font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>

          {/* Information about the process */}
          {formData.role === 'client' && (
            <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
              <h4 className="text-sm font-medium text-white mb-2">What happens next?</h4>
              <ul className="text-xs text-gray-300 space-y-1">
                <li>• Complete your detailed profile information</li>
                <li>• Provide emergency contact details</li>
                <li>• Add medical aid information (optional)</li>
                <li>• Set your wellness goals and preferences</li>
              </ul>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};