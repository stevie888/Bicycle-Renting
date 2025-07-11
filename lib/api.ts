// API utility functions for making requests to our backend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// Generic API call function
async function apiCall(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error('API call error:', error);
    throw error;
  }
}

// Authentication API calls
export const authAPI = {
  // Login user
  login: async (username: string, password: string) => {
    return apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },

  // Signup user
  signup: async (userData: {
    username: string;
    email: string;
    password: string;
    name: string;
    mobile: string;
  }) => {
    return apiCall('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },
};

// User profile API calls
export const userAPI = {
  // Get user profile
  getProfile: async (userId: string) => {
    return apiCall(`/users/profile?userId=${userId}`, {
      method: 'GET',
    });
  },

  // Update user profile
  updateProfile: async (userId: string, profileData: {
    name?: string;
    email?: string;
    mobile?: string;
    profileImage?: string;
  }) => {
    return apiCall(`/users/profile?userId=${userId}`, {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },
};

// Umbrella API calls
export const umbrellaAPI = {
  // Get all umbrellas
  getAll: async (filters?: { status?: string; location?: string }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.location) params.append('location', filters.location);
    
    const queryString = params.toString();
    const endpoint = queryString ? `/umbrellas?${queryString}` : '/umbrellas';
    
    return apiCall(endpoint, {
      method: 'GET',
    });
  },

  // Create new umbrella
  create: async (umbrellaData: {
    name: string;
    description: string;
    location: string;
    hourlyRate: number;
    dailyRate: number;
    image?: string;
  }) => {
    return apiCall('/umbrellas', {
      method: 'POST',
      body: JSON.stringify(umbrellaData),
    });
  },
};

// Rental API calls
export const rentalAPI = {
  // Get rentals
  getAll: async (filters?: { userId?: string; status?: string }) => {
    const params = new URLSearchParams();
    if (filters?.userId) params.append('userId', filters.userId);
    if (filters?.status) params.append('status', filters.status);
    
    const queryString = params.toString();
    const endpoint = queryString ? `/rentals?${queryString}` : '/rentals';
    
    return apiCall(endpoint, {
      method: 'GET',
    });
  },

  // Create new rental
  create: async (rentalData: {
    userId: string;
    umbrellaId: string;
    startTime: string;
    endTime?: string;
  }) => {
    return apiCall('/rentals', {
      method: 'POST',
      body: JSON.stringify(rentalData),
    });
  },
};

// Export the main API object
export const api = {
  auth: authAPI,
  user: userAPI,
  umbrella: umbrellaAPI,
  rental: rentalAPI,
};

export default api; 