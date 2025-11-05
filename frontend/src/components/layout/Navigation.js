import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, Search, Inbox, User, LogOut, Moon, Sun } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../ui';
import Avatar from '../ui/Avatar';

const Navigation = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const toast = useToast();

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
  };

  const navLinks = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/browse', label: 'Browse Skills', icon: Search },
    { to: '/requests', label: 'My Requests', icon: Inbox },
    { to: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="sticky top-0 z-40 glass border-b border-neutral-200 dark:border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-white font-bold text-lg">
              SS
            </div>
            <span className="text-xl font-display font-bold text-neutral-900 dark:text-neutral-100">
              SkillSwap
            </span>
          </motion.div>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-2">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-smooth ${
                    isActive
                      ? 'bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-300'
                      : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon size={18} />
                    <span>{label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </div>

          {/* User Actions */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-smooth text-neutral-600 dark:text-neutral-400"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </motion.button>

            {/* User Menu */}
            <div className="flex items-center gap-3 pl-3 border-l border-neutral-200 dark:border-neutral-800">
              <Avatar name={user?.username} size="sm" />
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  {user?.username}
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-smooth"
                aria-label="Logout"
              >
                <LogOut size={18} />
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <div className="md:hidden border-t border-neutral-200 dark:border-neutral-800">
        <div className="flex justify-around py-2">
          {navLinks.map(({ to, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-smooth ${
                  isActive
                    ? 'text-brand-600 dark:text-brand-400'
                    : 'text-neutral-500 dark:text-neutral-500'
                }`
              }
            >
              <Icon size={20} />
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
