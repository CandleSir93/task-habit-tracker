// API helper functions for communicating with the backend
console.log('API module loaded');

const API_URL = 'http://localhost:5000/api';

// User Authentication
export async function register(username, email, password) {
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

export async function login(username, password) {
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

export async function logout() {
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
export async function getUserProfile() {
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

export async function updateUserProfile(profileData) {
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
export async function getTasks() {
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

export async function createTask(taskData) {
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

export async function updateTask(taskId, taskData) {
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

export async function deleteTask(taskId) {
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
export async function getHabits() {
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

export async function createHabit(habitData) {
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

export async function updateHabitCompletion(habitId, date, completed) {
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
export async function getLogs(date = null) {
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

export async function saveLog(logData) {
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
export async function syncData(localData) {
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
