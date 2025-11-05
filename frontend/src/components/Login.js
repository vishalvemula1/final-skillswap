import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, UserPlus, AlertCircle, Sparkles } from 'lucide-react';
import { API_URL } from '../config/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from './ui';
import { Button, Input, Card } from './ui';

function Login() {
  const { login } = useAuth();
  const toast = useToast();
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = isRegistering ? '/auth/register/' : '/auth/login/';
      const fullURL = `${API_URL}${endpoint}`;

      console.log('Attempting login to:', fullURL);

      const response = await fetch(fullURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
        credentials: 'include'
      });

      const data = await response.json();
      console.log('Login response:', response.ok, data);

      if (response.ok) {
        if (isRegistering) {
          setIsRegistering(false);
          toast.success('Registration successful! Please log in.');
          setFormData({ username: formData.username, email: '', password: '' });
          setLoading(false);
        } else {
          // Successful login
          console.log('Login successful, setting user:', data.user);
          toast.success(`Welcome back, ${data.user.username}!`);
          login(data.user);
          // Don't set loading to false here - let the app redirect
        }
      } else {
        setError(data.error || 'Something went wrong');
        toast.error(data.error || 'Authentication failed');
        setLoading(false);
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMsg = `Network error: Failed to connect. Please check if backend is running.`;
      setError(errorMsg);
      toast.error('Connection failed');
      setLoading(false);
    }
  };

  const fillDemoCredentials = (username, password) => {
    setFormData({ username, email: '', password });
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-500 via-purple-500 to-accent-500 p-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-1/2 -right-1/2 w-full h-full bg-white/5 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [0, -90, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-white/5 rounded-full blur-3xl"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <Card variant="glass" className="backdrop-blur-xl bg-white/90 dark:bg-neutral-900/90 shadow-2xl border border-white/20">
          {/* Logo and Header */}
          <div className="text-center mb-8">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 text-white text-2xl font-bold mb-4 shadow-lg"
            >
              <Sparkles size={32} />
            </motion.div>
            <h1 className="text-3xl font-display font-bold text-neutral-900 dark:text-neutral-100 mb-2">
              SkillSwap
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              Exchange skills, grow together
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex gap-2 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl mb-6">
            <button
              onClick={() => {
                setIsRegistering(false);
                setError('');
              }}
              className={`flex-1 py-2.5 rounded-lg font-medium transition-all ${
                !isRegistering
                  ? 'bg-white dark:bg-neutral-700 text-brand-600 dark:text-brand-400 shadow-md'
                  : 'text-neutral-600 dark:text-neutral-400'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <LogIn size={18} />
                Sign In
              </div>
            </button>
            <button
              onClick={() => {
                setIsRegistering(true);
                setError('');
              }}
              className={`flex-1 py-2.5 rounded-lg font-medium transition-all ${
                isRegistering
                  ? 'bg-white dark:bg-neutral-700 text-brand-600 dark:text-brand-400 shadow-md'
                  : 'text-neutral-600 dark:text-neutral-400'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <UserPlus size={18} />
                Register
              </div>
            </button>
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-start gap-3"
              >
                <AlertCircle size={20} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleInputChange}
              required
              autoComplete="username"
            />

            <AnimatePresence>
              {isRegistering && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <Input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required={isRegistering}
                    autoComplete="email"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <Input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
              required
              autoComplete={isRegistering ? 'new-password' : 'current-password'}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={loading}
              loading={loading}
              className="w-full"
            >
              {isRegistering ? 'Create Account' : 'Sign In'}
            </Button>
          </form>

          {/* Demo Credentials */}
          {!isRegistering && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-700"
            >
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3 text-center">
                Quick demo access:
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <button
                  type="button"
                  onClick={() => fillDemoCredentials('admin', 'admin')}
                  className="px-3 py-1.5 text-xs rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition-smooth"
                >
                  Admin
                </button>
                <button
                  type="button"
                  onClick={() => fillDemoCredentials('user1', 'password')}
                  className="px-3 py-1.5 text-xs rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition-smooth"
                >
                  User1
                </button>
                <button
                  type="button"
                  onClick={() => fillDemoCredentials('user2', 'password')}
                  className="px-3 py-1.5 text-xs rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition-smooth"
                >
                  User2
                </button>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-3 text-center">
                API: {API_URL}
              </p>
            </motion.div>
          )}
        </Card>
      </motion.div>
    </div>
  );
}

export default Login;
