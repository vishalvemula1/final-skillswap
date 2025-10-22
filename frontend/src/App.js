// frontend/src/App.js
import React, { useState, useEffect } from 'react';
import './App.css';
import { API_URL } from './config/api';

// Import components
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import BrowseSkills from './components/BrowseSkills';
import MyRequests from './components/MyRequests';
import Profile from './components/Profile';

function App() {
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch(`${API_URL}/profile/`, {
        credentials: 'include'
      });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      }
    } catch (error) {
      console.log('Not logged in');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (userData) => {
    setUser(userData);
    setCurrentPage('dashboard');
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/auth/logout/`, {
        method: 'POST',
        credentials: 'include'
      });
      setUser(null);
      setCurrentPage('dashboard');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  // If not logged in, show login page
  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  // Navigation component
  const Navigation = () => (
    <nav className="navbar">
      <div className="nav-brand">
        <h2>SkillSwap</h2>
      </div>
      <div className="nav-links">
        <button 
          className={currentPage === 'dashboard' ? 'nav-btn active' : 'nav-btn'}
          onClick={() => setCurrentPage('dashboard')}
        >
          Dashboard
        </button>
        <button 
          className={currentPage === 'browse' ? 'nav-btn active' : 'nav-btn'}
          onClick={() => setCurrentPage('browse')}
        >
          Browse Skills
        </button>
        <button 
          className={currentPage === 'requests' ? 'nav-btn active' : 'nav-btn'}
          onClick={() => setCurrentPage('requests')}
        >
          My Requests
        </button>
        <button 
          className={currentPage === 'profile' ? 'nav-btn active' : 'nav-btn'}
          onClick={() => setCurrentPage('profile')}
        >
          Profile
        </button>
      </div>
      <div className="nav-user">
        <span>Welcome, {user.username}!</span>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );

  // Render current page
  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard user={user} setCurrentPage={setCurrentPage} />;
      case 'browse':
        return <BrowseSkills user={user} />;
      case 'requests':
        return <MyRequests user={user} />;
      case 'profile':
        return <Profile user={user} setUser={setUser} />;
      default:
        return <Dashboard user={user} setCurrentPage={setCurrentPage} />;
    }
  };

  return (
    <div className="App">
      <Navigation />
      <main className="main-content">
        {renderCurrentPage()}
      </main>
    </div>
  );
}

export default App;