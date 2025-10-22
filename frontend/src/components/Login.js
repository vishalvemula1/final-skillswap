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

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = isRegistering ? '/auth/register/' : '/auth/login/';
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok) {
        if (isRegistering) {
          setIsRegistering(false);
          setError('Registration successful! Please log in.');
          setFormData({ username: formData.username, email: '', password: '' });
        } else {
          onLogin(data.user);
        }
      } else {
        setError(data.error || 'Something went wrong');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
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
        </div>
      </div>
    </div>
  );
}

export default Login;