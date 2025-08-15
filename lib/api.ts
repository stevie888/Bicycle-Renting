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
        password: 'password',
        role: 'user',
        credits: 250,
        profileImage: null,
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        mobile: '+977-9841234568',
        email: 'samirgrg0888@gmail.com',
        name: 'Samir',
        password: 'password',
        role: 'user',
        credits: 175,
        profileImage: null,
        createdAt: new Date().toISOString(),
      },
      {
        id: '3',
        mobile: '+977-9841234569',
        email: 'admin@paddlenepal.com',
        name: 'Admin User',
        password: 'password',
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
        description: 'Station 1',
        location: 'Basantapur, Kathmandu',
        status: 'available',
        hourlyRate: 200,
        dailyRate: 1500,
        image: '/bicycle1.jpg',
      },
      {
        description: 'Station 2',
        location: 'Patan, Lalitpur',
        status: 'available',
        hourlyRate: 150,
        dailyRate: 1200,
        image: '/bicycle2.jpg',
      },
      {
        description: 'Station 3',
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
        userId: '2', // Samir's user ID
        bicycleId: '3',
        startTime: '2024-01-15T10:00:00Z',
        endTime: '2024-01-15T12:30:00Z', // 2.5 hours duration
        status: 'completed',
        totalCost: 360,
        price: 75,
        station: 'Station 1',
        bikeName: 'Station 1',
        slotNumber: 1,
      },
      {
        id: '2',
        userId: '2', // Samir's user ID
        bicycleId: '1',
        startTime: '2024-01-16T14:00:00Z',
        endTime: '2024-01-16T15:30:00Z', // 1.5 hours duration
        status: 'completed',
        totalCost: 300,
        price: 75,
        station: 'Station 1',
        bikeName: 'Station 1',
        slotNumber: 2,
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
  
  // Add a function to fix rental data specifically
  (window as any).fixRentalData = () => {
    const defaultRentals = [
      {
        id: '1',
        userId: '2', // Samir's user ID
        bicycleId: '3',
        startTime: '2024-01-15T10:00:00Z',
        endTime: '2024-01-15T12:30:00Z', // 2.5 hours duration
        status: 'completed',
        totalCost: 360,
        price: 75,
        station: 'Station 1',
        bikeName: 'Station 1',
        slotNumber: 1,
      },
      {
        id: '2',
        userId: '2', // Samir's user ID
        bicycleId: '1',
        startTime: '2024-01-16T14:00:00Z',
        endTime: '2024-01-16T15:30:00Z', // 1.5 hours duration
        status: 'completed',
        totalCost: 300,
        price: 75,
        station: 'Station 1',
        bikeName: 'Station 1',
        slotNumber: 2,
      },
    ];
    localStorage.setItem('paddlenepal_rentals', JSON.stringify(defaultRentals));
    console.log('Rental data fixed with proper end times');
  };
};

// Add this function to help reset slot data with reserved slots
if (typeof window !== 'undefined') {
  (window as any).resetSlotDataWithReserved = () => {
    try {
      const bicycles = JSON.parse(localStorage.getItem('paddlenepal_bicycles') || '[]');
      const uniqueStations = new Map<string, any>();
      
      // Get unique stations
      bicycles.forEach((bike: any) => {
        const stationKey = `${bike.name}_${bike.location}`;
        if (!uniqueStations.has(stationKey)) {
          uniqueStations.set(stationKey, {
            name: bike.name,
            location: bike.location
          });
        }
      });
      
      // Reset slots for each station with reserved slots
      uniqueStations.forEach((station, stationKey) => {
        const slotsKey = `paddlenepal_slots_${stationKey}`;
        const newSlots = Array.from({ length: 10 }, (_, index) => ({
          id: `slot_${stationKey}_${index + 1}`,
          slotNumber: index + 1,
          // Keep slots 9 and 10 empty for bike returns
          status: (index >= 8) ? 'in-maintenance' : 'active',
          lastUpdated: new Date().toISOString(),
          notes: index >= 8 ? 'Reserved for bike returns' : ''
        }));
        
        localStorage.setItem(slotsKey, JSON.stringify(newSlots));
        console.log(`Reset slots for ${station.name} with reserved slots 9-10`);
      });
      
      console.log('Slot data reset successfully with reserved slots!');
      alert('Slot data reset successfully! Slots 9-10 are now reserved for bike returns.');
      
      // Refresh the page to see changes
      window.location.reload();
    } catch (error) {
      console.error('Error resetting slot data:', error);
      alert('Error resetting slot data. Please try again.');
    }
  };
}

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
        credits: 250,
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

// Add global functions for debugging and data management
if (typeof window !== 'undefined') {
  (window as any).clearPaddleNepalStorage = () => {
    localStorage.removeItem('paddlenepal_users');
    localStorage.removeItem('paddlenepal_bicycles');
    localStorage.removeItem('paddlenepal_rentals');
    localStorage.removeItem('paddlenepal_current_user');
    // Clear all slot data
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('paddlenepal_slots_')) {
        localStorage.removeItem(key);
      }
    });
    location.reload();
  };

  (window as any).fixRentalData = () => {
    const defaultRentals = [
      {
        id: '1',
        userId: '2',
        bikeId: '1-bike-1',
        startTime: '2024-01-15T10:00:00.000Z',
        endTime: '2024-01-15T12:30:00.000Z',
        status: 'completed',
        price: 62,
        duration: 'hourly',
        hours: 2.5,
        bikeName: 'Bike 1',
        station: 'Station 1',
        slotNumber: 1
      },
      {
        id: '2',
        userId: '2',
        bikeId: '1-bike-2',
        startTime: '2024-01-16T14:00:00.000Z',
        endTime: '2024-01-16T15:30:00.000Z',
        status: 'completed',
        price: 37,
        duration: 'hourly',
        hours: 1.5,
        bikeName: 'Bike 2',
        station: 'Station 1',
        slotNumber: 2
      }
    ];
    localStorage.setItem('paddlenepal_rentals', JSON.stringify(defaultRentals));
    location.reload();
  };

  (window as any).resetSlotDataWithReserved = () => {
    // Reset all station slot data to include reserved slots
    const bicycles = JSON.parse(localStorage.getItem('paddlenepal_bicycles') || '[]');
    
    bicycles.forEach((bike: any) => {
      const stationKey = `${bike.description}_${bike.location}`;
      const slotsKey = `paddlenepal_slots_${stationKey}`;
      
      const slots = [];
      for (let i = 1; i <= 10; i++) {
        slots.push({
          id: `${stationKey}_slot_${i}`,
          slotNumber: i,
          status: i >= 9 ? 'in-maintenance' : 'active',
          lastUpdated: new Date().toISOString(),
          notes: i >= 9 ? 'Reserved for bike returns' : undefined
        });
      }
      
      localStorage.setItem(slotsKey, JSON.stringify(slots));
    });
    
    location.reload();
  };

  (window as any).testSmartSlotManagement = () => {
    // Test function to simulate smart slot management
    console.log('Testing Smart Slot Management...');
    
    // Get all stations
    const bicycles = JSON.parse(localStorage.getItem('paddlenepal_bicycles') || '[]');
    
    bicycles.forEach((bike: any) => {
      const stationKey = `${bike.description}_${bike.location}`;
      const slotsKey = `paddlenepal_slots_${stationKey}`;
      const slots = JSON.parse(localStorage.getItem(slotsKey) || '[]');
      
      console.log(`\nStation: ${bike.description}`);
      console.log('Current slot status:');
      slots.forEach((slot: any) => {
        console.log(`  Slot ${slot.slotNumber}: ${slot.status} - ${slot.notes || 'No notes'}`);
      });
    });
  };
} 