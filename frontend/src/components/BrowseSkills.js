// frontend/src/components/BrowseSkills.js
import React, { useState, useEffect } from 'react';
import { Search, MapPin, RefreshCw, Send } from 'lucide-react';
import { API_URL } from '../config/api';
import { useAuth } from '../context/AuthContext';
import { Modal, Select, Input, Button, Card } from './ui';

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

  const RequestModal = () => (
    <Modal
      isOpen={showRequestModal && !!selectedTeacher}
      onClose={() => setShowRequestModal(false)}
      title="Send Skill Exchange Request"
      size="sm"
    >
      {selectedTeacher && (
        <div className="space-y-4">
          <div className="space-y-2 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
            <p className="text-neutral-900 dark:text-neutral-100">
              <strong>To:</strong> {selectedTeacher.username}
            </p>
            <p className="text-neutral-900 dark:text-neutral-100">
              <strong>Skill:</strong> {selectedTeacher.skill.name}
            </p>
            <p className="text-neutral-900 dark:text-neutral-100">
              <strong>Location:</strong> {selectedTeacher.location || 'Not specified'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
              Message
            </label>
            <textarea
              value={requestMessage}
              onChange={(e) => setRequestMessage(e.target.value)}
              rows="4"
              className="w-full px-4 py-2 rounded-xl border-2 border-neutral-200 dark:border-neutral-700 focus:border-brand-500 dark:focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-smooth bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
              placeholder="Introduce yourself and explain what you'd like to learn..."
            />
          </div>

          <div className="flex gap-3">
            <Button
              variant="primary"
              size="lg"
              onClick={sendRequest}
              className="flex-1"
            >
              <Send size={18} className="mr-2" />
              Send Request
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => setShowRequestModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );

  if (loading && skills.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
          <p className="text-neutral-600 dark:text-neutral-400">Loading skills...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center md:text-left">
        <h1 className="text-4xl font-display font-bold text-neutral-900 dark:text-neutral-100 mb-2">
          Browse Skills
        </h1>
        <p className="text-lg text-neutral-600 dark:text-neutral-400">
          Discover skills you can learn from community members
        </p>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-1">
            <Input
              type="text"
              placeholder="Search skills..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              icon={<Search size={18} />}
            />
          </div>

          <div className="md:col-span-1">
            <Input
              type="text"
              placeholder="Filter by location..."
              value={filters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
              icon={<MapPin size={18} />}
            />
          </div>

          <div className="md:col-span-1">
            <Select
              value={filters.category_id}
              onChange={(e) => handleFilterChange('category_id', e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
          </div>

          <div className="md:col-span-1 flex items-end">
            <Button
              variant="secondary"
              onClick={loadSkills}
              className="w-full"
            >
              <RefreshCw size={18} className="mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </Card>

      {/* Skills Grid */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
        </div>
      ) : skills.length === 0 ? (
        <Card className="p-12 text-center">
          <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
            No skills found
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400">
            Try adjusting your filters or check back later for new skills.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {skills.map(skill => (
            <Card key={skill.id} className="p-6 hover:shadow-soft-lg transition-smooth">
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
                    {skill.name}
                  </h3>
                  <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-brand-100 dark:bg-brand-900 text-brand-600 dark:text-brand-400">
                    {skill.category}
                  </span>
                </div>

                {skill.description && (
                  <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                    {skill.description}
                  </p>
                )}

                <div>
                  <h4 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3">
                    Teachers Available ({skill.teachers?.length || 0})
                  </h4>

                  {skill.teachers && skill.teachers.length > 0 ? (
                    <div className="space-y-2">
                      {skill.teachers.map(teacher => (
                        <div
                          key={teacher.id}
                          className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-smooth"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                              {teacher.username}
                            </div>
                            <div className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                              {teacher.location || 'Location not specified'} •
                              {teacher.experience_level} •
                              ⭐ {teacher.avg_rating > 0 ? teacher.avg_rating.toFixed(1) : 'New'}
                            </div>
                          </div>

                          {teacher.id !== user.id && (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => openRequestModal(teacher, skill)}
                              className="ml-2"
                            >
                              Request
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 text-center py-4">
                      No teachers available for this skill yet.
                    </p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <RequestModal />
    </div>
  );
}

export default BrowseSkills;