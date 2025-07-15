// API helper functions for communicating with the backend
console.log('API module loaded');

// Create a global API object for browser compatibility
window.API = {};

const API_URL = 'http://localhost:5000/api';

// User Authentication
API.register = async function(username, email, password) {
  console.log('Registering user...');
  const response = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ username, email, password }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Registration failed');
  }
  
  return response.json();
}

API.login = async function(username, password) {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ username, password }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Login failed');
  }
  
  return response.json();
}

API.logout = async function() {
  const response = await fetch(`${API_URL}/logout`, {
    method: 'POST',
    credentials: 'include',
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Logout failed');
  }
  
  return response.json();
}

// Profile Management
API.getUserProfile = async function() {
  const response = await fetch(`${API_URL}/user/profile`, {
    method: 'GET',
    credentials: 'include',
  });
  
  if (!response.ok) {
    if (response.status === 404) {
      // Profile not found is not necessarily an error
      return {};
    }
    const error = await response.json();
    throw new Error(error.error || 'Failed to get user profile');
  }
  
  return response.json();
}

API.updateUserProfile = async function(profileData) {
  const response = await fetch(`${API_URL}/user/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(profileData),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update profile');
  }
  
  return response.json();
}

// Tasks Management
API.getTasks = async function() {
  const response = await fetch(`${API_URL}/tasks`, {
    method: 'GET',
    credentials: 'include',
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get tasks');
  }
  
  return response.json();
}

API.createTask = async function(taskData) {
  const response = await fetch(`${API_URL}/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(taskData),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create task');
  }
  
  return response.json();
}

API.updateTask = async function(taskId, taskData) {
  const response = await fetch(`${API_URL}/tasks/${taskId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(taskData),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update task');
  }
  
  return response.json();
}

API.deleteTask = async function(taskId) {
  const response = await fetch(`${API_URL}/tasks/${taskId}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete task');
  }
  
  return response.json();
}

// Habits Management
API.getHabits = async function() {
  const response = await fetch(`${API_URL}/habits`, {
    method: 'GET',
    credentials: 'include',
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get habits');
  }
  
  return response.json();
}

API.createHabit = async function(habitData) {
  const response = await fetch(`${API_URL}/habits`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(habitData),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create habit');
  }
  
  return response.json();
}

API.updateHabitCompletion = async function(habitId, date, completed) {
  const response = await fetch(`${API_URL}/habits/${habitId}/completion`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ date, completed }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update habit completion');
  }
  
  return response.json();
}

// Daily Logs Management
API.getLogs = async function(date = null) {
  let url = `${API_URL}/logs`;
  if (date) {
    url += `?date=${date}`;
  }
  
  const response = await fetch(url, {
    method: 'GET',
    credentials: 'include',
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get logs');
  }
  
  return response.json();
}

API.saveLog = async function(logData) {
  const response = await fetch(`${API_URL}/logs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(logData),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to save log');
  }
  
  return response.json();
}

// Data Synchronization
API.syncData = async function(localData) {
  const response = await fetch(`${API_URL}/sync`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(localData),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to sync data');
  }
  
  return response.json();
}
