// LocalStorage-based API for persistent data storage

// Helper functions for localStorage
const getStorageData = (key: string) => {
  if (typeof window === 'undefined') return null;
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return null;
  }
};

const setStorageData = (key: string, data: any) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Error writing to localStorage:', error);
  }
};

// Initialize default data if not exists
const initializeStorage = () => {
  // Initialize users if not exists
  if (!getStorageData('paddlenepal_users')) {
    const defaultUsers = [
      {
        id: '1',
        mobile: '+977-9841234567',
        email: 'john@example.com',
        name: 'John Doe',
        role: 'user',
        credits: 100,
        profileImage: null,
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        mobile: '+977-9841234568',
        email: 'admin@paddlenepal.com',
        name: 'Admin User',
        role: 'admin',
        credits: 1000,
        profileImage: null,
        createdAt: new Date().toISOString(),
      },
    ];
    setStorageData('paddlenepal_users', defaultUsers);
  }

  // Initialize bicycles if not exists
  if (!getStorageData('paddlenepal_bicycles')) {
    const defaultBicycles = [
      {
        id: '1',
        name: 'Mountain Bike 1',
        description: 'High-quality mountain bike for adventure trails',
        location: 'Basantapur, Kathmandu',
        status: 'available',
        hourlyRate: 200,
        dailyRate: 1500,
        image: '/bicycle1.jpg',
      },
      {
        id: '2',
        name: 'City Bike 1',
        description: 'Comfortable city bike for urban exploration',
        location: 'Patan, Lalitpur',
        status: 'available',
        hourlyRate: 150,
        dailyRate: 1200,
        image: '/bicycle2.jpg',
      },
      {
        id: '3',
        name: 'Hybrid Bike 1',
        description: 'Versatile hybrid bike for all terrains',
        location: 'Durbar Square, Bhaktapur',
        status: 'rented',
        hourlyRate: 180,
        dailyRate: 1400,
        image: '/bicycle3.jpg',
      },
    ];
    setStorageData('paddlenepal_bicycles', defaultBicycles);
  }

  // Initialize rentals if not exists
  if (!getStorageData('paddlenepal_rentals')) {
    const defaultRentals = [
      {
        id: '1',
        userId: '1',
        bicycleId: '3',
        startTime: '2024-01-15T10:00:00Z',
        endTime: null,
        status: 'active',
        totalCost: 360,
      },
    ];
    setStorageData('paddlenepal_rentals', defaultRentals);
  }
};

// Initialize storage on first client-side access
let isInitialized = false;

const ensureInitialized = () => {
  if (typeof window === 'undefined') return;
  if (isInitialized) return;
  
  initializeStorage();
  console.log('LocalStorage initialized with default data');
  isInitialized = true;
  
  // Add a function to clear and reinitialize storage (for debugging)
  (window as any).clearPaddleNepalStorage = () => {
    localStorage.removeItem('paddlenepal_users');
    localStorage.removeItem('paddlenepal_bicycles');
    localStorage.removeItem('paddlenepal_rentals');
    localStorage.removeItem('paddlenepal_current_user');
    isInitialized = false;
    initializeStorage();
    console.log('Storage cleared and reinitialized');
  };
};

// LocalStorage API call function
async function localStorageApiCall(endpoint: string, options: RequestInit = {}) {
  // Only run on client-side
  if (typeof window === 'undefined') {
    throw new Error('API calls can only be made on the client-side');
  }
  
  // Ensure storage is initialized
  ensureInitialized();
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const method = options.method || 'GET';
  
  try {
    // Handle different endpoints
    if (endpoint.includes('/auth/login')) {
      const { mobile, password } = JSON.parse(options.body as string);
      console.log('Login attempt with mobile:', mobile);
      
      const users = getStorageData('paddlenepal_users') || [];
      console.log('Available users in localStorage:', users);
      
      // Try to find user with exact match first
      let user = users.find((u: any) => u.mobile === mobile);
      
      // If not found, try to find by mobile number without country code
      if (!user && mobile.startsWith('+977-')) {
        const mobileWithoutCode = mobile.replace('+977-', '');
        user = users.find((u: any) => u.mobile === mobileWithoutCode);
      }
      
      // If still not found, try to find by mobile number with country code
      if (!user && !mobile.startsWith('+977-')) {
        const mobileWithCode = `+977-${mobile}`;
        user = users.find((u: any) => u.mobile === mobileWithCode);
      }
      
      console.log('Found user:', user);
      
      if (user && user.password === password) {
        console.log('Login successful for user:', user);
        return { success: true, user, token: 'local-token-' + user.id };
      } else {
        console.log('Login failed - invalid credentials');
        console.log('Available mobile numbers:', users.map((u: any) => u.mobile));
        console.log('User found but password mismatch. Expected:', user?.password, 'Got:', password);
        throw new Error('Invalid mobile number or password');
      }
    }
    
    if (endpoint.includes('/auth/signup')) {
      const userData = JSON.parse(options.body as string);
      console.log('Signup attempt with data:', userData);
      
      const users = getStorageData('paddlenepal_users') || [];
      console.log('Current users in localStorage:', users);
      console.log('Looking for mobile:', userData.mobile);
      
      // Check if mobile number already exists
      const existingUser = users.find((u: any) => u.mobile === userData.mobile);
      console.log('Existing user found:', existingUser);
      
      if (existingUser) {
        console.log('Mobile number already exists:', userData.mobile);
        throw new Error(`Mobile number ${userData.mobile} already registered`);
      }
      
      const newUser = {
        id: (users.length + 1).toString(),
        ...userData,
        role: 'user',
        credits: 50,
        profileImage: null,
        createdAt: new Date().toISOString(),
      };
      
      users.push(newUser);
      setStorageData('paddlenepal_users', users);
      console.log('New user saved to localStorage:', newUser);
      console.log('Updated users list:', getStorageData('paddlenepal_users'));
      
      return { success: true, user: newUser, token: 'local-token-' + newUser.id };
    }
    
    if (endpoint.includes('/users/profile')) {
      const userId = endpoint.match(/userId=(\d+)/)?.[1];
      const users = getStorageData('paddlenepal_users') || [];
      const user = users.find((u: any) => u.id === userId);
      return user || { error: 'User not found' };
    }
    
    if (endpoint.includes('/admin/users')) {
      return getStorageData('paddlenepal_users') || [];
    }
    
            if (endpoint.includes('/bicycles')) {
      return getStorageData('paddlenepal_bicycles') || [];
    }
    
    if (endpoint.includes('/rentals')) {
      return getStorageData('paddlenepal_rentals') || [];
    }
    
    if (endpoint.includes('/credits')) {
      const userId = endpoint.match(/userId=(\d+)/)?.[1];
      const users = getStorageData('paddlenepal_users') || [];
      const user = users.find((u: any) => u.id === userId);
      return { credits: user?.credits || 0 };
    }
    
    // Default response for unknown endpoints
    return { success: true, message: 'LocalStorage API response' };
    
  } catch (error) {
    console.error('LocalStorage API call error:', error);
    throw error;
  }
}

// Authentication API calls
export const authAPI = {
  // Login user with mobile number
  login: async (mobile: string, password: string) => {
    return localStorageApiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ mobile, password }),
    });
  },

  // Signup user
  signup: async (userData: {
    mobile: string;
    email: string;
    password: string;
    name: string;
  }) => {
    return localStorageApiCall('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },
};

// User profile API calls
export const userAPI = {
  // Get user profile
  getProfile: async (userId: string) => {
    return localStorageApiCall(`/users/profile?userId=${userId}`, {
      method: 'GET',
    });
  },

  // Get all users (admin only)
  getAll: async () => {
    return localStorageApiCall('/admin/users', {
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
    const users = getStorageData('paddlenepal_users') || [];
    const userIndex = users.findIndex((u: any) => u.id === userId);
    
    if (userIndex !== -1) {
      users[userIndex] = { ...users[userIndex], ...profileData };
      setStorageData('paddlenepal_users', users);
      return { success: true, user: users[userIndex] };
    }
    
    return { error: 'User not found' };
  },
};

// Bicycle API calls
export const bicycleAPI = {
  // Get all bicycles
  getAll: async (filters?: { status?: string; location?: string }) => {
    const bicycles = getStorageData('paddlenepal_bicycles') || [];
    
    if (filters) {
      return bicycles.filter((bike: any) => {
        if (filters.status && bike.status !== filters.status) return false;
        if (filters.location && !bike.location.includes(filters.location)) return false;
        return true;
      });
    }
    
    return bicycles;
  },

  // Create new bicycle
  create: async (bicycleData: {
    name: string;
    description: string;
    location: string;
    hourlyRate: number;
    dailyRate: number;
    image?: string;
  }) => {
    const bicycles = getStorageData('paddlenepal_bicycles') || [];
    const newBicycle = {
      id: (bicycles.length + 1).toString(),
      ...bicycleData,
      status: 'available',
    };
    
    bicycles.push(newBicycle);
    setStorageData('paddlenepal_bicycles', bicycles);
    
    return { success: true, bicycle: newBicycle };
  },
};

// Rental API calls
export const rentalAPI = {
  // Get rentals
  getAll: async (filters?: { userId?: string; status?: string }) => {
    const rentals = getStorageData('paddlenepal_rentals') || [];
    
    if (filters) {
      return rentals.filter((rental: any) => {
        if (filters.userId && rental.userId !== filters.userId) return false;
        if (filters.status && rental.status !== filters.status) return false;
        return true;
      });
    }
    
    return rentals;
  },

  // Create new rental
  create: async (rentalData: {
    userId: string;
    bicycleId: string;
    startTime: string;
    endTime?: string;
  }) => {
    const rentals = getStorageData('paddlenepal_rentals') || [];
    const bicycles = getStorageData('paddlenepal_bicycles') || [];
    
    // Find the bicycle to get its rate
    const bicycle = bicycles.find((b: any) => b.id === rentalData.bicycleId);
    if (!bicycle) {
      throw new Error('Bicycle not found');
    }
    
    const newRental = {
      id: (rentals.length + 1).toString(),
      ...rentalData,
      status: 'active',
      totalCost: bicycle.hourlyRate * 2, // Calculate based on duration
    };
    
    rentals.push(newRental);
    setStorageData('paddlenepal_rentals', rentals);
    
    // Update bicycle status to rented
    const bicycleIndex = bicycles.findIndex((b: any) => b.id === rentalData.bicycleId);
    if (bicycleIndex !== -1) {
      bicycles[bicycleIndex].status = 'rented';
      setStorageData('paddlenepal_bicycles', bicycles);
    }
    
    return { success: true, rental: newRental };
  },
};

// Credits API calls
export const creditsAPI = {
  // Get user's credit balance
  getBalance: async (userId: string) => {
    const users = getStorageData('paddlenepal_users') || [];
    const user = users.find((u: any) => u.id === userId);
    return { credits: user?.credits || 0 };
  },

  // Add/remove credits (admin only)
  updateCredits: async (data: {
    userId: string;
    credits: number;
    action: 'add' | 'remove';
    reason?: string;
  }) => {
    const users = getStorageData('paddlenepal_users') || [];
    const userIndex = users.findIndex((u: any) => u.id === data.userId);
    
    if (userIndex !== -1) {
      if (data.action === 'add') {
        users[userIndex].credits += data.credits;
      } else {
        users[userIndex].credits = Math.max(0, users[userIndex].credits - data.credits);
      }
      
      setStorageData('paddlenepal_users', users);
      return { success: true, user: users[userIndex] };
    }
    
    return { error: 'User not found' };
  },
};

// Export the main API object
export const api = {
  auth: authAPI,
  user: userAPI,
  bicycle: bicycleAPI,
  rental: rentalAPI,
  credits: creditsAPI,
};

export default api; 