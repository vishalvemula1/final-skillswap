import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BookOpen,
  GraduationCap,
  Clock,
  CheckCircle2,
  TrendingUp,
  Search,
  UserPlus,
  Inbox,
  ArrowRight
} from 'lucide-react';
import { API_URL } from '../config/api';
import { useAuth } from '../context/AuthContext';
import { Card, LoadingSkeleton, EmptyState, Badge } from './ui';

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalSkills: 0,
    teachingSkills: 0,
    learningSkills: 0,
    pendingRequests: 0,
    completedSwaps: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [profileResponse, requestsResponse] = await Promise.all([
        fetch(`${API_URL}/profile/`, { credentials: 'include' }),
        fetch(`${API_URL}/requests/`, { credentials: 'include' })
      ]);

      const profileData = await profileResponse.json();
      const requestsData = await requestsResponse.json();

      const teachingSkills = profileData.skills?.filter(skill => skill.can_teach).length || 0;
      const learningSkills = profileData.skills?.filter(skill => !skill.can_teach).length || 0;
      const pendingRequests = requestsData.received_requests?.filter(req => req.status === 'pending').length || 0;
      const completedSwaps = [...(requestsData.sent_requests || []), ...(requestsData.received_requests || [])]
        .filter(req => req.status === 'completed').length;

      setStats({
        totalSkills: profileData.skills?.length || 0,
        teachingSkills,
        learningSkills,
        pendingRequests,
        completedSwaps
      });

      const allRequests = [...(requestsData.sent_requests || []), ...(requestsData.received_requests || [])];
      const sortedActivity = allRequests
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 6);

      setRecentActivity(sortedActivity);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'accepted': return 'info';
      case 'pending': return 'warning';
      case 'rejected': return 'danger';
      default: return 'default';
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton className="h-24 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <LoadingSkeleton key={i} className="h-32" />
          ))}
        </div>
        <LoadingSkeleton className="h-64 w-full" />
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Skills',
      value: stats.totalSkills,
      icon: BookOpen,
      color: 'from-brand-500 to-brand-600',
      bgColor: 'bg-brand-50 dark:bg-brand-900/20',
      textColor: 'text-brand-600 dark:text-brand-400'
    },
    {
      label: 'Teaching',
      value: stats.teachingSkills,
      icon: GraduationCap,
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      textColor: 'text-green-600 dark:text-green-400'
    },
    {
      label: 'Learning',
      value: stats.learningSkills,
      icon: BookOpen,
      color: 'from-accent-500 to-accent-600',
      bgColor: 'bg-accent-50 dark:bg-accent-900/20',
      textColor: 'text-accent-600 dark:text-accent-400'
    },
    {
      label: 'Pending',
      value: stats.pendingRequests,
      icon: Clock,
      color: 'from-amber-500 to-orange-600',
      bgColor: 'bg-amber-50 dark:bg-amber-900/20',
      textColor: 'text-amber-600 dark:text-amber-400'
    },
    {
      label: 'Completed',
      value: stats.completedSwaps,
      icon: CheckCircle2,
      color: 'from-purple-500 to-pink-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      textColor: 'text-purple-600 dark:text-purple-400'
    }
  ];

  const quickActions = [
    {
      title: 'Browse Skills',
      description: 'Discover new skills to learn',
      icon: Search,
      action: () => navigate('/browse'),
      color: 'from-brand-500 to-accent-500'
    },
    {
      title: 'Update Profile',
      description: 'Add or manage your skills',
      icon: UserPlus,
      action: () => navigate('/profile'),
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: 'My Requests',
      description: 'Manage exchange requests',
      icon: Inbox,
      action: () => navigate('/requests'),
      color: 'from-green-500 to-emerald-500'
    }
  ];

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={item}>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-4xl font-display font-bold text-neutral-900 dark:text-neutral-100">
            Welcome back, {user?.username}!
          </h1>
          <motion.div
            animate={{ rotate: [0, 14, -8, 14, -4, 10, 0] }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            👋
          </motion.div>
        </div>
        <p className="text-neutral-600 dark:text-neutral-400">
          Here's your skill exchange overview
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={item}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"
      >
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            whileHover={{ scale: 1.02, y: -4 }}
            className="relative overflow-hidden"
          >
            <Card variant="default" hover={false} className="h-full">
              <div className={`absolute top-0 right-0 w-24 h-24 ${stat.bgColor} rounded-full blur-2xl opacity-50 -mr-12 -mt-12`} />
              <div className="relative">
                <div className={`inline-flex p-2 rounded-xl ${stat.bgColor} mb-3`}>
                  <stat.icon className={stat.textColor} size={20} />
                </div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 + 0.3 }}
                  className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-1"
                >
                  {stat.value}
                </motion.div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400">
                  {stat.label}
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Bento Box Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity - Takes 2 columns */}
        <motion.div variants={item} className="lg:col-span-2">
          <Card variant="default" className="h-full">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="text-brand-500" size={24} />
                <h2 className="text-2xl font-display font-semibold text-neutral-900 dark:text-neutral-100">
                  Recent Activity
                </h2>
              </div>
            </div>

            {recentActivity.length === 0 ? (
              <EmptyState
                icon={Inbox}
                title="No activity yet"
                description="Start by browsing skills or updating your profile!"
              />
            ) : (
              <div className="space-y-3">
                {recentActivity.map((activity, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-smooth"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-neutral-900 dark:text-neutral-100 mb-1">
                        {activity.from_user ? (
                          <>
                            <span className="font-semibold">{activity.from_user}</span>
                            {' '}requested{' '}
                            <span className="font-semibold">{activity.requested_skill}</span>
                          </>
                        ) : (
                          <>
                            You requested{' '}
                            <span className="font-semibold">{activity.requested_skill}</span>
                            {' '}from{' '}
                            <span className="font-semibold">{activity.to_user}</span>
                          </>
                        )}
                      </p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-500">
                        {formatDate(activity.created_at)}
                      </p>
                    </div>
                    <Badge variant={getStatusVariant(activity.status)}>
                      {activity.status}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            )}
          </Card>
        </motion.div>

        {/* Quick Actions - Takes 1 column */}
        <motion.div variants={item} className="space-y-4">
          <h2 className="text-2xl font-display font-semibold text-neutral-900 dark:text-neutral-100">
            Quick Actions
          </h2>
          {quickActions.map((action, index) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                variant="default"
                onClick={action.action}
                className="group cursor-pointer relative overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-10 transition-smooth`} />
                <div className="relative flex items-start gap-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${action.color} text-white`}>
                    <action.icon size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-1 flex items-center gap-2">
                      {action.title}
                      <ArrowRight
                        size={16}
                        className="opacity-0 group-hover:opacity-100 transition-smooth transform group-hover:translate-x-1"
                      />
                    </h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      {action.description}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}

export default Dashboard;
