// frontend/src/config/api.js

// Get the backend API URL from environment variable or default
const getApiUrl = () => {
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  // For local development
  return 'http://localhost:8000/api';
};

export const API_URL = getApiUrl();

// Helper function for API calls
export const apiCall = async (endpoint, options = {}) => {
  const url = `${API_URL}${endpoint}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  };

  const finalOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...(options.headers || {}),
    },
  };

  try {
    const response = await fetch(url, finalOptions);
    const data = await response.json();
    
    return {
      ok: response.ok,
      status: response.status,
      data: data,
    };
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export default API_URL;
