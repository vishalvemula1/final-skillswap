// frontend/src/components/Dashboard.js
import React, { useState, useEffect } from 'react';

function Dashboard({ user, setCurrentPage }) {
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
      // Get user profile with skills
      const profileResponse = await fetch('/api/profile/', {
        credentials: 'include'
      });
      const profileData = await profileResponse.json();

      // Get swap requests
      const requestsResponse = await fetch('/api/requests/', {
        credentials: 'include'
      });
      const requestsData = await requestsResponse.json();

      // Calculate stats
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

      // Create recent activity from requests
      const allRequests = [...(requestsData.sent_requests || []), ...(requestsData.received_requests || [])];
      const sortedActivity = allRequests
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5);

      setRecentActivity(sortedActivity);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#4CAF50';
      case 'accepted': return '#2196F3';
      case 'pending': return '#FF9800';
      case 'rejected': return '#f44336';
      default: return '#757575';
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Welcome back, {user.username}! Here's your skill exchange overview.</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{stats.totalSkills}</div>
          <div className="stat-label">Total Skills</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-number">{stats.teachingSkills}</div>
          <div className="stat-label">Teaching</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-number">{stats.learningSkills}</div>
          <div className="stat-label">Learning</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-number">{stats.pendingRequests}</div>
          <div className="stat-label">Pending Requests</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-number">{stats.completedSwaps}</div>
          <div className="stat-label">Completed Swaps</div>
        </div>
      </div>

      {/* {Action Cards} */}
      <div className="action-card">
        <h3>Browse Skills</h3>
        <p>Discover new skills to learn from community members</p>
        <button className="action-btn" onClick={() => setCurrentPage('browse')}>Explore Now</button>
      </div>
      
      <div className="action-card">
        <h3>Update Profile</h3>
        <p>Add skills you can teach or want to learn</p>
        <button className="action-btn" onClick={() => setCurrentPage('profile')}>Edit Profile</button>
      </div>
      
      <div className="action-card">
        <h3>My Requests</h3>
        <p>Manage your skill exchange requests</p>
        <button className="action-btn" onClick={() => setCurrentPage('requests')}>View Requests</button>
      </div>

      {/* Recent Activity */}
      <div className="dashboard-section">
        <h2>Recent Activity</h2>
        {recentActivity.length === 0 ? (
          <div className="empty-state">
            <p>No recent activity. Start by browsing skills or updating your profile!</p>
          </div>
        ) : (
          <div className="activity-list">
            {recentActivity.map((activity, index) => (
              <div key={index} className="activity-item">
                <div className="activity-content">
                  <div className="activity-main">
                    {activity.from_user ? (
                      <span>
                        <strong>{activity.from_user}</strong> requested to learn{' '}
                        <strong>{activity.requested_skill}</strong>
                        {activity.offered_skill && (
                          <span> in exchange for <strong>{activity.offered_skill}</strong></span>
                        )}
                      </span>
                    ) : (
                      <span>
                        You requested to learn <strong>{activity.requested_skill}</strong> from{' '}
                        <strong>{activity.to_user}</strong>
                      </span>
                    )}
                  </div>
                  <div className="activity-meta">
                    <span className="activity-date">{formatDate(activity.created_at)}</span>
                    <span 
                      className="activity-status"
                      style={{ color: getStatusColor(activity.status) }}
                    >
                      {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="dashboard-section">
        <h2>Quick Actions</h2>
        <div className="quick-actions">
          <div className="action-card">
            <h3>🔍 Browse Skills</h3>
            <p>Discover new skills to learn from community members</p>
            <button className="action-btn">Explore Now</button>
          </div>
          
          <div className="action-card">
            <h3>👤 Update Profile</h3>
            <p>Add skills you can teach or want to learn</p>
            <button className="action-btn">Edit Profile</button>
          </div>
          
          <div className="action-card">
            <h3>📋 My Requests</h3>
            <p>Manage your skill exchange requests</p>
            <button className="action-btn">View Requests</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;