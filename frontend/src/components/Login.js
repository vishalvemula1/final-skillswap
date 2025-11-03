// frontend/src/components/Login.js
import React, { useState } from 'react';
import { apiCall, API_URL } from '../config/api';

function Login({ onLogin }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Log API configuration on component mount
  React.useEffect(() => {
    console.log('🔧 Login component mounted');
    console.log('🌐 API_URL configured as:', API_URL);
    console.log('🌍 Current origin:', window.location.origin);
    console.log('📍 Environment:', process.env.NODE_ENV);
  }, []);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    console.log('🎯 Form submit triggered');
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = isRegistering ? '/auth/register/' : '/auth/login/';
      const fullURL = `${API_URL}${endpoint}`;
      console.log('🌐 API_URL:', API_URL);
      console.log('📡 Full URL:', fullURL);
      console.log('📦 Sending data:', { username: formData.username, email: formData.email, password: '***' });

      const response = await fetch(fullURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
        credentials: 'include'
      });

      console.log('✅ Response received - Status:', response.status);
      console.log('📋 Response headers:', [...response.headers.entries()]);

      const data = await response.json();
      console.log('📄 Response data:', data);

      if (response.ok) {
        console.log('✅ Login successful!');
        if (isRegistering) {
          setIsRegistering(false);
          setError('Registration successful! Please log in.');
          setFormData({ username: formData.username, email: '', password: '' });
        } else {
          console.log('🔐 Calling onLogin with user data:', data.user);
          onLogin(data.user);
        }
      } else {
        console.error('❌ Login failed:', data.error);
        setError(data.error || 'Something went wrong');
      }
    } catch (error) {
      console.error('❌ Network/Fetch error:', error);
      console.error('Error details:', error.message, error.stack);
      setError(`Network error: ${error.message}. Please check if backend is running.`);
    } finally {
      setLoading(false);
      console.log('🏁 Login attempt completed');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>SkillSwap</h1>
        <p className="tagline">Exchange skills, grow together</p>
        
        <form onSubmit={handleSubmit} className="login-form">
          <h2>{isRegistering ? 'Create Account' : 'Sign In'}</h2>
          
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleInputChange}
              required
            />
          </div>

          {isRegistering && (
            <div className="form-group">
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
          )}

          <div className="form-group">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Please wait...' : (isRegistering ? 'Register' : 'Login')}
          </button>
        </form>

        <div className="toggle-form">
          <p>
            {isRegistering ? 'Already have an account?' : "Don't have an account?"}
            <button
              type="button"
              className="link-btn"
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError('');
                setFormData({ username: '', email: '', password: '' });
              }}
            >
              {isRegistering ? 'Sign In' : 'Register'}
            </button>
          </p>
        </div>

        {/* Demo credentials hint */}
        <div className="demo-hint">
          <p><small>Demo users: admin/admin, user1/password, user2/password</small></p>
          <p><small style={{color: '#666', marginTop: '5px'}}>API: {API_URL}</small></p>
        </div>
      </div>
    </div>
  );
}

export default Login;