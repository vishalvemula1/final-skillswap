// frontend/src/components/Profile.js
import React, { useState, useEffect } from 'react';
import { User, MapPin, Phone, BookOpen, Plus, X } from 'lucide-react';
import { API_URL } from '../config/api';
import { useAuth } from '../context/AuthContext';
import { Modal, Select, Button, Card, Input, Badge } from './ui';

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
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
          <p className="text-neutral-600 dark:text-neutral-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  const availableSkills = allSkills.filter(skill => 
    !profile.skills.some(userSkill => userSkill.id === skill.id)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center md:text-left">
        <h1 className="text-4xl font-display font-bold text-neutral-900 dark:text-neutral-100 mb-2">
          My Profile
        </h1>
        <p className="text-lg text-neutral-600 dark:text-neutral-400">
          Manage your personal information and skills
        </p>
      </div>

      {/* Success/Error Message */}
      {message && (
        <Card className={`p-4 ${message.includes('Error') ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'}`}>
          <p className={message.includes('Error') ? 'text-red-800 dark:text-red-300' : 'text-green-800 dark:text-green-300'}>
            {message}
          </p>
        </Card>
      )}

      {/* Basic Profile Info */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">
          Basic Information
        </h2>
        <form onSubmit={updateProfile} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Username"
              type="text"
              value={profile.username}
              disabled
              className="bg-neutral-100 dark:bg-neutral-700 cursor-not-allowed"
              icon={<User size={18} />}
            />

            <Input
              label="Email"
              type="email"
              value={profile.email}
              disabled
              className="bg-neutral-100 dark:bg-neutral-700 cursor-not-allowed"
            />

            <Input
              label="Location"
              type="text"
              value={profile.location}
              onChange={(e) => setProfile({...profile, location: e.target.value})}
              placeholder="e.g., Mumbai, Maharashtra"
              icon={<MapPin size={18} />}
            />

            <Input
              label="Phone"
              type="text"
              value={profile.phone}
              onChange={(e) => setProfile({...profile, phone: e.target.value})}
              placeholder="Your contact number"
              icon={<Phone size={18} />}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
              Bio
            </label>
            <textarea
              value={profile.bio}
              onChange={(e) => setProfile({...profile, bio: e.target.value})}
              rows="4"
              className="w-full px-4 py-2 rounded-xl border-2 border-neutral-200 dark:border-neutral-700 focus:border-brand-500 dark:focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-smooth bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
              placeholder="Tell others about yourself and your interests..."
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={saving}
            loading={saving}
            className="w-full md:w-auto"
          >
            {saving ? 'Saving...' : 'Update Profile'}
          </Button>
        </form>
      </Card>

      {/* Skills Section */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            My Skills
          </h2>
          <Button
            variant="primary"
            onClick={() => setShowAddSkill(true)}
          >
            <Plus size={18} className="mr-2" />
            Add Skill
          </Button>
        </div>

        {profile.skills && profile.skills.length > 0 ? (
          <div className="flex flex-wrap gap-3">
            {profile.skills.map(skill => (
              <div
                key={skill.id}
                className="group relative bg-gradient-to-br from-brand-50 to-accent-50 dark:from-brand-900/30 dark:to-accent-900/30 border border-brand-200 dark:border-brand-700 rounded-xl p-4 pr-12 hover:shadow-md transition-smooth"
              >
                <div>
                  <div className="font-bold text-neutral-900 dark:text-neutral-100 mb-1">
                    {skill.name}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400">
                    <Badge variant={skill.can_teach ? 'success' : 'info'} size="sm">
                      {skill.can_teach ? 'Teaching' : 'Learning'}
                    </Badge>
                    <span>•</span>
                    <span>{skill.category}</span>
                    <span>•</span>
                    <span>{skill.experience_level}</span>
                  </div>
                </div>
                <button
                  onClick={() => removeSkill(skill.id)}
                  className="absolute top-3 right-3 p-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove skill"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center bg-neutral-50 dark:bg-neutral-800/50">
            <BookOpen size={48} className="mx-auto mb-4 text-neutral-400" />
            <p className="text-neutral-600 dark:text-neutral-400">
              No skills added yet. Add skills you can teach or want to learn!
            </p>
          </Card>
        )}
      </Card>

      {/* Add Skill Modal */}
      <Modal
        isOpen={showAddSkill}
        onClose={() => setShowAddSkill(false)}
        title="Add Skill"
        size="sm"
      >
        <div className="space-y-4">
          <Select
            label="Skill"
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
          </Select>

          <Select
            label="Role"
            value={newSkill.can_teach}
            onChange={(e) => setNewSkill({...newSkill, can_teach: e.target.value === 'true'})}
          >
            <option value="true">I can teach this</option>
            <option value="false">I want to learn this</option>
          </Select>

          <Select
            label="Experience Level"
            value={newSkill.experience_level}
            onChange={(e) => setNewSkill({...newSkill, experience_level: e.target.value})}
          >
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </Select>

          <div className="flex gap-3 pt-4">
            <Button
              variant="primary"
              size="lg"
              onClick={addSkill}
              className="flex-1"
            >
              Add Skill
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => setShowAddSkill(false)}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Skills Summary */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">
          Skills Summary
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 text-center bg-gradient-to-br from-brand-50 to-accent-50 dark:from-brand-900/30 dark:to-accent-900/30 border-brand-200 dark:border-brand-700">
            <div className="text-4xl font-bold text-brand-600 dark:text-brand-400 mb-2">
              {profile.skills ? profile.skills.filter(s => s.can_teach).length : 0}
            </div>
            <div className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
              Skills I Teach
            </div>
          </Card>

          <Card className="p-6 text-center bg-gradient-to-br from-accent-50 to-brand-50 dark:from-accent-900/30 dark:to-brand-900/30 border-accent-200 dark:border-accent-700">
            <div className="text-4xl font-bold text-accent-600 dark:text-accent-400 mb-2">
              {profile.skills ? profile.skills.filter(s => !s.can_teach).length : 0}
            </div>
            <div className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
              Skills I'm Learning
            </div>
          </Card>

          <Card className="p-6 text-center bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 border-purple-200 dark:border-purple-700">
            <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">
              {profile.skills ? profile.skills.length : 0}
            </div>
            <div className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
              Total Skills
            </div>
          </Card>
        </div>
      </Card>
    </div>
  );
}

export default Profile;