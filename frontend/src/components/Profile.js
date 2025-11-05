// frontend/src/components/Profile.js
import React, { useState, useEffect } from 'react';
import { API_URL } from '../config/api';
import { useAuth } from '../context/AuthContext';

function Profile() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState({
    username: '',
    email: '',
    bio: '',
    location: '',
    phone: '',
    skills: []
  });
  const [allSkills, setAllSkills] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showAddSkill, setShowAddSkill] = useState(false);
  const [newSkill, setNewSkill] = useState({
    skill_id: '',
    can_teach: true,
    experience_level: 'Intermediate'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadProfile();
    loadSkills();
    loadCategories();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await fetch(`${API_URL}/profile/`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSkills = async () => {
    try {
      const response = await fetch(`${API_URL}/skills/`, {
        credentials: 'include'
      });
      const data = await response.json();
      setAllSkills(data.skills || []);
    } catch (error) {
      console.error('Error loading skills:', error);
    }
  };

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

  const updateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const response = await fetch(`${API_URL}/profile/update/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          bio: profile.bio,
          location: profile.location,
          phone: profile.phone
        })
      });

      if (response.ok) {
        setMessage('Profile updated successfully!');
        updateUser({ ...user, location: profile.location, bio: profile.bio });
      } else {
        const data = await response.json();
        setMessage('Error: ' + (data.error || 'Failed to update profile'));
      }
    } catch (error) {
      setMessage('Error updating profile');
    } finally {
      setSaving(false);
    }
  };

  const addSkill = async () => {
    if (!newSkill.skill_id) {
      setMessage('Please select a skill');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/profile/add-skill/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(newSkill)
      });

      if (response.ok) {
        await loadProfile(); // Reload profile to show new skill
        setNewSkill({
          skill_id: '',
          can_teach: true,
          experience_level: 'Intermediate'
        });
        setShowAddSkill(false);
        setMessage('Skill added successfully!');
      } else {
        const data = await response.json();
        setMessage('Error: ' + (data.error || 'Failed to add skill'));
      }
    } catch (error) {
      setMessage('Error adding skill');
    }
  };

  const removeSkill = async (skillId) => {
    if (!window.confirm('Remove this skill from your profile?')) return;

    try {
      // Since there's no remove endpoint in the backend, we'll just simulate it
      // In a real app, you'd implement a delete endpoint
      setMessage('Skill removal not implemented in backend');
    } catch (error) {
      setMessage('Error removing skill');
    }
  };

  if (loading) {
    return <div className="loading">Loading profile...</div>;
  }

  const availableSkills = allSkills.filter(skill => 
    !profile.skills.some(userSkill => userSkill.id === skill.id)
  );

  return (
    <div className="profile">
      <div className="dashboard-header">
        <h1>My Profile</h1>
        <p>Manage your personal information and skills</p>
      </div>

      {message && (
        <div className={message.includes('Error') ? 'error-message' : 'success-message'}>
          {message}
        </div>
      )}

      {/* Basic Profile Info */}
      <div className="profile-section">
        <h2>Basic Information</h2>
        <form onSubmit={updateProfile} className="profile-form">
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              value={profile.username}
              disabled
              style={{ backgroundColor: '#f5f5f5' }}
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={profile.email}
              disabled
              style={{ backgroundColor: '#f5f5f5' }}
            />
          </div>

          <div className="form-group">
            <label>Location</label>
            <input
              type="text"
              value={profile.location}
              onChange={(e) => setProfile({...profile, location: e.target.value})}
              placeholder="e.g., Mumbai, Maharashtra"
            />
          </div>

          <div className="form-group">
            <label>Phone</label>
            <input
              type="text"
              value={profile.phone}
              onChange={(e) => setProfile({...profile, phone: e.target.value})}
              placeholder="Your contact number"
            />
          </div>

          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label>Bio</label>
            <textarea
              value={profile.bio}
              onChange={(e) => setProfile({...profile, bio: e.target.value})}
              rows="4"
              placeholder="Tell others about yourself and your interests..."
            />
          </div>

          <button 
            type="submit" 
            className="submit-btn" 
            disabled={saving}
            style={{ gridColumn: '1 / -1' }}
          >
            {saving ? 'Saving...' : 'Update Profile'}
          </button>
        </form>
      </div>

      {/* Skills Section */}
      <div className="profile-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>My Skills</h2>
          <button 
            className="action-btn"
            onClick={() => setShowAddSkill(true)}
          >
            Add Skill
          </button>
        </div>

        {profile.skills && profile.skills.length > 0 ? (
          <div className="skills-list">
            {profile.skills.map(skill => (
              <div key={skill.id} className="skill-tag">
                <div>
                  <strong>{skill.name}</strong>
                  <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                    {skill.category} • {skill.can_teach ? 'Teaching' : 'Learning'} • {skill.experience_level}
                  </div>
                </div>
                <button 
                  className="remove-skill"
                  onClick={() => removeSkill(skill.id)}
                  title="Remove skill"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>No skills added yet. Add skills you can teach or want to learn!</p>
          </div>
        )}
      </div>

      {/* Add Skill Modal */}
      {showAddSkill && (
        <div className="modal-overlay" onClick={() => setShowAddSkill(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Skill</h3>
              <button className="close-btn" onClick={() => setShowAddSkill(false)}>×</button>
            </div>
            
            <div>
              <div className="form-group">
                <label>Skill</label>
                <select
                  value={newSkill.skill_id}
                  onChange={(e) => setNewSkill({...newSkill, skill_id: e.target.value})}
                >
                  <option value="">Select a skill</option>
                  {categories.map(category => (
                    <optgroup key={category.id} label={category.name}>
                      {availableSkills
                        .filter(skill => skill.category_id === category.id)
                        .map(skill => (
                          <option key={skill.id} value={skill.id}>
                            {skill.name}
                          </option>
                        ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Role</label>
                <select
                  value={newSkill.can_teach}
                  onChange={(e) => setNewSkill({...newSkill, can_teach: e.target.value === 'true'})}
                >
                  <option value="true">I can teach this</option>
                  <option value="false">I want to learn this</option>
                </select>
              </div>

              <div className="form-group">
                <label>Experience Level</label>
                <select
                  value={newSkill.experience_level}
                  onChange={(e) => setNewSkill({...newSkill, experience_level: e.target.value})}
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
              
              <div style={{display: 'flex', gap: '1rem', marginTop: '1.5rem'}}>
                <button className="submit-btn" onClick={addSkill}>
                  Add Skill
                </button>
                <button 
                  style={{background: '#ccc', color: '#333'}} 
                  className="submit-btn"
                  onClick={() => setShowAddSkill(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Skills Summary */}
      <div className="profile-section">
        <h2>Skills Summary</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">
              {profile.skills ? profile.skills.filter(s => s.can_teach).length : 0}
            </div>
            <div className="stat-label">Skills I Teach</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-number">
              {profile.skills ? profile.skills.filter(s => !s.can_teach).length : 0}
            </div>
            <div className="stat-label">Skills I'm Learning</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-number">
              {profile.skills ? profile.skills.length : 0}
            </div>
            <div className="stat-label">Total Skills</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;