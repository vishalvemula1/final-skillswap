import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, Send, Inbox, MessageSquare } from 'lucide-react';
import { API_URL } from '../config/api';
import { useAuth } from '../context/AuthContext';
import { Button, Card, Badge } from './ui';

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

  const getStatusVariant = (status) => {
    const variants = {
      pending: 'warning',
      accepted: 'info',
      rejected: 'danger',
      completed: 'success'
    };
    return variants[status] || 'default';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: <Clock size={16} />,
      accepted: <CheckCircle size={16} />,
      rejected: <XCircle size={16} />,
      completed: <CheckCircle size={16} />
    };
    return icons[status] || <Clock size={16} />;
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
    <Card className="p-6 hover:shadow-soft-lg transition-smooth">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 mb-2">
            {isSent ? `To: ${request.to_user}` : `From: ${request.from_user}`}
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400 text-sm">
            Skill: <strong className="text-neutral-900 dark:text-neutral-100">{request.requested_skill}</strong>
            {request.offered_skill && (
              <span> • In exchange for: <strong className="text-neutral-900 dark:text-neutral-100">{request.offered_skill}</strong></span>
            )}
          </p>
        </div>
        <Badge variant={getStatusVariant(request.status)} className="flex items-center gap-1">
          {getStatusIcon(request.status)}
          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
        </Badge>
      </div>

      {request.message && (
        <div className="bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-4 mb-4">
          <div className="flex items-start gap-2 mb-2">
            <MessageSquare size={16} className="text-neutral-500 dark:text-neutral-400 mt-0.5" />
            <strong className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Message:</strong>
          </div>
          <p className="text-neutral-600 dark:text-neutral-400 text-sm pl-6">{request.message}</p>
        </div>
      )}

      <div className="flex justify-between items-center pt-4 border-t border-neutral-200 dark:border-neutral-700">
        <span className="text-sm text-neutral-500 dark:text-neutral-400">
          Sent: {formatDate(request.created_at)}
        </span>

        <div className="flex gap-2">
          {!isSent && request.status === 'pending' && (
            <>
              <Button
                variant="success"
                size="sm"
                onClick={() => updateRequestStatus(request.id, 'accepted')}
              >
                <CheckCircle size={16} className="mr-1" />
                Accept
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => updateRequestStatus(request.id, 'rejected')}
              >
                <XCircle size={16} className="mr-1" />
                Reject
              </Button>
            </>
          )}

          {request.status === 'accepted' && (
            <Button
              variant="success"
              size="sm"
              onClick={() => updateRequestStatus(request.id, 'completed')}
            >
              <CheckCircle size={16} className="mr-1" />
              Mark Completed
            </Button>
          )}
        </div>
      </div>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
          <p className="text-neutral-600 dark:text-neutral-400">Loading requests...</p>
        </div>
      </div>
    );
  }

  const currentRequests = activeTab === 'received' 
    ? requests.received_requests 
    : requests.sent_requests;

  const pendingCount = requests.received_requests.filter(r => r.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center md:text-left">
        <h1 className="text-4xl font-display font-bold text-neutral-900 dark:text-neutral-100 mb-2">
          My Requests
        </h1>
        <p className="text-lg text-neutral-600 dark:text-neutral-400">
          Manage your skill exchange requests
        </p>
      </div>

      {/* Tabs */}
      <Card className="p-1">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('received')}
            className={`flex-1 py-3 px-4 rounded-xl font-medium transition-smooth flex items-center justify-center gap-2 ${
              activeTab === 'received'
                ? 'bg-brand-500 text-white shadow-md'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            <Inbox size={18} />
            Received ({requests.received_requests.length})
            {pendingCount > 0 && (
              <Badge variant="warning" size="sm" className="ml-2">
                {pendingCount}
              </Badge>
            )}
          </button>
          <button
            onClick={() => setActiveTab('sent')}
            className={`flex-1 py-3 px-4 rounded-xl font-medium transition-smooth flex items-center justify-center gap-2 ${
              activeTab === 'sent'
                ? 'bg-brand-500 text-white shadow-md'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            <Send size={18} />
            Sent ({requests.sent_requests.length})
          </button>
        </div>
      </Card>

      {/* Requests List */}
      <div className="space-y-4">
        {currentRequests.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="max-w-md mx-auto">
              {activeTab === 'received' ? (
                <Inbox size={64} className="mx-auto mb-4 text-neutral-400" />
              ) : (
                <Send size={64} className="mx-auto mb-4 text-neutral-400" />
              )}
              <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
                No {activeTab} requests
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                {activeTab === 'received'
                  ? 'When others request to learn from you, they\'ll appear here.'
                  : 'Requests you send to learn new skills will appear here.'
                }
              </p>
            </div>
          </Card>
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
      <Card className="p-6">
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">
          Request Summary
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6 text-center bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/30 dark:to-orange-900/30 border-yellow-200 dark:border-yellow-700">
            <div className="text-4xl font-bold text-yellow-600 dark:text-yellow-400 mb-2">
              {requests.received_requests.filter(r => r.status === 'pending').length}
            </div>
            <div className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
              Pending (Received)
            </div>
          </Card>

          <Card className="p-6 text-center bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 border-blue-200 dark:border-blue-700">
            <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              {requests.sent_requests.filter(r => r.status === 'accepted').length}
            </div>
            <div className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
              Accepted (Sent)
            </div>
          </Card>

          <Card className="p-6 text-center bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border-green-200 dark:border-green-700">
            <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">
              {[...requests.sent_requests, ...requests.received_requests].filter(r => r.status === 'completed').length}
            </div>
            <div className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
              Completed
            </div>
          </Card>

          <Card className="p-6 text-center bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 border-purple-200 dark:border-purple-700">
            <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">
              {requests.sent_requests.length + requests.received_requests.length}
            </div>
            <div className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
              Total Requests
            </div>
          </Card>
        </div>
      </Card>
    </div>
  );
}

export default MyRequests;