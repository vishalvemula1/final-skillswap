// frontend/src/components/BrowseSkills.js
import React, { useState, useEffect, useCallback } from 'react';
import { API_URL } from '../config/api';
import { useAuth } from '../context/AuthContext';

function BrowseSkills() {
  const { user } = useAuth();
  const [skills, setSkills] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    category_id: ''
  });
  const [loading, setLoading] = useState(true);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [requestMessage, setRequestMessage] = useState('');

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadSkills();
    }, 300); // Debounce search by 300ms

    return () => clearTimeout(timer);
  }, [filters]);

  const loadCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/categories/`, {
        credentials: 'include'
      });
      const data = await response.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadSkills = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.location) params.append('location', filters.location);
      if (filters.category_id) params.append('category_id', filters.category_id);

      const response = await fetch(`${API_URL}/skills/browse/?${params}`, {
        credentials: 'include'
      });
      const data = await response.json();
      setSkills(data.skills || []);
    } catch (error) {
      console.error('Error loading skills:', error);
      setSkills([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const openRequestModal = (teacher, skill) => {
    setSelectedTeacher({ ...teacher, skill });
    setShowRequestModal(true);
    setRequestMessage(`Hi! I'd like to learn ${skill.name}. Could we arrange a skill exchange?`);
  };

  const sendRequest = async () => {
    if (!selectedTeacher) return;

    try {
      const response = await fetch(`${API_URL}/requests/send/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          to_user_id: selectedTeacher.id,
          requested_skill_id: selectedTeacher.skill.id,
          message: requestMessage
        })
      });

      if (response.ok) {
        alert('Request sent successfully!');
        setShowRequestModal(false);
        setSelectedTeacher(null);
        setRequestMessage('');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to send request');
      }
    } catch (error) {
      console.error('Error sending request:', error);
      alert('Error sending request');
    }
  };

  const RequestModal = () => {
    if (!showRequestModal || !selectedTeacher) return null;

    return (
      <div className="modal-overlay" onClick={() => setShowRequestModal(false)}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h3>Send Skill Exchange Request</h3>
            <button className="close-btn" onClick={() => setShowRequestModal(false)}>×</button>
          </div>
          
          <div>
            <p><strong>To:</strong> {selectedTeacher.username}</p>
            <p><strong>Skill:</strong> {selectedTeacher.skill.name}</p>
            <p><strong>Location:</strong> {selectedTeacher.location || 'Not specified'}</p>
            
            <div className="form-group" style={{marginTop: '1rem'}}>
              <label>Message:</label>
              <textarea
                value={requestMessage}
                onChange={(e) => setRequestMessage(e.target.value)}
                rows="4"
                style={{width: '100%', padding: '0.5rem', marginTop: '0.5rem'}}
                placeholder="Introduce yourself and explain what you'd like to learn..."
              />
            </div>
            
            <div style={{display: 'flex', gap: '1rem', marginTop: '1.5rem'}}>
              <button className="submit-btn" onClick={sendRequest}>
                Send Request
              </button>
              <button 
                style={{background: '#ccc', color: '#333'}} 
                className="submit-btn"
                onClick={() => setShowRequestModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading && skills.length === 0) {
    return <div className="loading">Loading skills...</div>;
  }

  return (
    <div className="browse-skills">
      <div className="browse-header">
        <h1>Browse Skills</h1>
        <p>Discover skills you can learn from community members</p>
      </div>

      {/* Filters */}
      <div className="filters">
        <input
          type="text"
          placeholder="Search skills..."
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
        />
        
        <input
          type="text"
          placeholder="Filter by location..."
          value={filters.location}
          onChange={(e) => handleFilterChange('location', e.target.value)}
        />
        
        <select
          value={filters.category_id}
          onChange={(e) => handleFilterChange('category_id', e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map(category => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        
        <button onClick={loadSkills} className="action-btn">
          Refresh
        </button>
      </div>

      {/* Skills Grid */}
      {loading ? (
        <div className="loading">Loading...</div>
      ) : skills.length === 0 ? (
        <div className="empty-state">
          <h3>No skills found</h3>
          <p>Try adjusting your filters or check back later for new skills.</p>
        </div>
      ) : (
        <div className="skills-grid">
          {skills.map(skill => (
            <div key={skill.id} className="skill-card">
              <div className="skill-header">
                <div>
                  <h3>{skill.name}</h3>
                  <span className="skill-category">{skill.category}</span>
                </div>
              </div>
              
              {skill.description && (
                <p style={{margin: '1rem 0', color: '#666'}}>{skill.description}</p>
              )}
              
              <div>
                <h4 style={{marginBottom: '1rem'}}>
                  Teachers Available ({skill.teachers?.length || 0})
                </h4>
                
                {skill.teachers && skill.teachers.length > 0 ? (
                  <div className="teachers-list">
                    {skill.teachers.map(teacher => (
                      <div key={teacher.id} className="teacher-item">
                        <div className="teacher-info">
                          <div className="teacher-name">{teacher.username}</div>
                          <div className="teacher-location">
                            {teacher.location || 'Location not specified'} • 
                            Level: {teacher.experience_level} • 
                            Rating: {teacher.avg_rating > 0 ? `${teacher.avg_rating}/5` : 'No ratings yet'}
                          </div>
                        </div>
                        
                        {teacher.id !== user.id && (
                          <button 
                            className="request-btn"
                            onClick={() => openRequestModal(teacher, skill)}
                          >
                            Request
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <p>No teachers available for this skill yet.</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <RequestModal />
    </div>
  );
}

export default BrowseSkills;