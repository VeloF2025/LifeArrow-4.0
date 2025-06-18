import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password');
    setError('');
    setIsLoading(true);

    try {
      await login(demoEmail, 'password');
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
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
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-gray-300">
            Sign in to your Life Arrow account
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <Input
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              icon={<Mail className="w-4 h-4" />}
              required
              className="bg-white/10 border-white/20 text-white placeholder-gray-400"
            />

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
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
          </div>

          {error && (
            <div className="text-red-400 text-sm text-center bg-red-900/20 p-3 rounded-lg border border-red-500/20">
              {error}
            </div>
          )}

          <div className="flex items-center justify-between">
            <Link
              to="/forgot-password"
              className="text-sm text-cyan-400 hover:text-cyan-300"
            >
              Forgot your password?
            </Link>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </Button>

          <div className="text-center">
            <p className="text-sm text-gray-300">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-cyan-400 hover:text-cyan-300 font-medium"
              >
                Sign up
              </Link>
            </p>
          </div>

          {/* Demo credentials */}
          <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
            <p className="text-xs text-gray-300 mb-3 text-center">Try the demo:</p>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('practitioner@lifearrow.com')}
                disabled={isLoading}
                className="w-full text-xs text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded border border-white/10 hover:border-white/20 transition-colors"
              >
                👩‍⚕️ Login as Practitioner
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('client@lifearrow.com')}
                disabled={isLoading}
                className="w-full text-xs text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded border border-white/10 hover:border-white/20 transition-colors"
              >
                👤 Login as Client
              </button>
            </div>
            <div className="mt-3 pt-3 border-t border-white/10">
              <p className="text-xs text-gray-400 text-center">
                Email: practitioner@lifearrow.com or client@lifearrow.com<br />
                Password: password
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};