import React, { useState, useEffect } from 'react';
import { API_URL } from '../config/api';
import { useAuth } from '../context/AuthContext';

function MyRequests() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('received');
  const [requests, setRequests] = useState({
    sent_requests: [],
    received_requests: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/requests/`, {
        credentials: 'include'
      });
      const data = await response.json();
      setRequests({
        sent_requests: data.sent_requests || [],
        received_requests: data.received_requests || []
      });
    } catch (error) {
      console.error('Error loading requests:', error);
      setRequests({ sent_requests: [], received_requests: [] });
    } finally {
      setLoading(false);
    }
  };

  const updateRequestStatus = async (requestId, status) => {
    try {
      const response = await fetch(`${API_URL}/requests/${requestId}/update/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        await loadRequests(); // Reload requests
        alert(`Request ${status} successfully!`);
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to update request');
      }
    } catch (error) {
      console.error('Error updating request:', error);
      alert('Error updating request');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#FF9800',
      accepted: '#2196F3',
      rejected: '#f44336',
      completed: '#4CAF50'
    };
    return colors[status] || '#757575';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const RequestCard = ({ request, isSent }) => (
    <div className="request-card">
      <div className="request-header">
        <div>
          <h3>
            {isSent ? `To: ${request.to_user}` : `From: ${request.from_user}`}
          </h3>
          <p style={{color: '#666', margin: '0.5rem 0'}}>
            Skill: <strong>{request.requested_skill}</strong>
            {request.offered_skill && (
              <span> • In exchange for: <strong>{request.offered_skill}</strong></span>
            )}
          </p>
        </div>
        <span 
          className="request-status"
          style={{ 
            backgroundColor: getStatusColor(request.status),
            color: 'white'
          }}
        >
          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
        </span>
      </div>

      {request.message && (
        <div style={{
          background: '#f9f9f9',
          padding: '1rem',
          borderRadius: '4px',
          margin: '1rem 0'
        }}>
          <strong>Message:</strong>
          <p style={{margin: '0.5rem 0 0 0'}}>{request.message}</p>
        </div>
      )}

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '1rem',
        fontSize: '0.9rem',
        color: '#666'
      }}>
        <span>Sent: {formatDate(request.created_at)}</span>
        
        {!isSent && request.status === 'pending' && (
          <div className="request-actions">
            <button 
              className="accept-btn"
              onClick={() => updateRequestStatus(request.id, 'accepted')}
            >
              Accept
            </button>
            <button 
              className="reject-btn"
              onClick={() => updateRequestStatus(request.id, 'rejected')}
            >
              Reject
            </button>
          </div>
        )}
        
        {request.status === 'accepted' && (
          <button 
            className="action-btn"
            onClick={() => updateRequestStatus(request.id, 'completed')}
            style={{background: '#4CAF50'}}
          >
            Mark Completed
          </button>
        )}
      </div>
    </div>
  );

  if (loading) {
    return <div className="loading">Loading requests...</div>;
  }

  const currentRequests = activeTab === 'received' 
    ? requests.received_requests 
    : requests.sent_requests;

  const pendingCount = requests.received_requests.filter(r => r.status === 'pending').length;

  return (
    <div className="my-requests">
      <div className="dashboard-header">
        <h1>My Requests</h1>
        <p>Manage your skill exchange requests</p>
      </div>

      {/* Tabs */}
      <div className="requests-tabs">
        <button 
          className={`tab-btn ${activeTab === 'received' ? 'active' : ''}`}
          onClick={() => setActiveTab('received')}
        >
          Received ({requests.received_requests.length})
          {pendingCount > 0 && (
            <span style={{
              background: '#FF9800',
              color: 'white',
              borderRadius: '12px',
              padding: '2px 8px',
              fontSize: '0.8rem',
              marginLeft: '0.5rem'
            }}>
              {pendingCount} pending
            </span>
          )}
        </button>
        <button 
          className={`tab-btn ${activeTab === 'sent' ? 'active' : ''}`}
          onClick={() => setActiveTab('sent')}
        >
          Sent ({requests.sent_requests.length})
        </button>
      </div>

      {/* Requests List */}
      <div className="requests-list">
        {currentRequests.length === 0 ? (
          <div className="empty-state">
            <h3>No {activeTab} requests</h3>
            <p>
              {activeTab === 'received' 
                ? 'When others request to learn from you, they\'ll appear here.'
                : 'Requests you send to learn new skills will appear here.'
              }
            </p>
          </div>
        ) : (
          currentRequests.map(request => (
            <RequestCard 
              key={request.id} 
              request={request} 
              isSent={activeTab === 'sent'}
            />
          ))
        )}
      </div>

      {/* Summary Stats */}
      <div className="dashboard-section" style={{marginTop: '2rem'}}>
        <h2>Request Summary</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">
              {requests.received_requests.filter(r => r.status === 'pending').length}
            </div>
            <div className="stat-label">Pending (Received)</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-number">
              {requests.sent_requests.filter(r => r.status === 'accepted').length}
            </div>
            <div className="stat-label">Accepted (Sent)</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-number">
              {[...requests.sent_requests, ...requests.received_requests].filter(r => r.status === 'completed').length}
            </div>
            <div className="stat-label">Completed</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-number">
              {requests.sent_requests.length + requests.received_requests.length}
            </div>
            <div className="stat-label">Total Requests</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MyRequests;