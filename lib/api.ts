// LocalStorage-based API for persistent data storage

// External API configuration
const EXTERNAL_API_BASE_URL =
  process.env.NEXT_PUBLIC_EXTERNAL_API_BASE_URL || "http://13.204.148.32";

// Configuration to enable/disable external API
const USE_EXTERNAL_API = process.env.NEXT_PUBLIC_USE_EXTERNAL_API === "true"; // Set to false to use only localStorage

// Helper function to make external API calls
async function externalApiCall(endpoint: string, options: RequestInit = {}) {
  try {
    const url = `${EXTERNAL_API_BASE_URL}${endpoint}`;
    console.log("Making external API call to:", url);

    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      // Add mode: 'cors' explicitly for better error handling
      mode: "cors",
    });

    if (!response.ok) {
      throw new Error(
        `External API error: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();
    console.log("External API response:", data);
    return data;
  } catch (error) {
    console.error("External API call failed:", error);
    throw error;
  }
}

// Helper functions for localStorage
const getStorageData = (key: string) => {
  if (typeof window === "undefined") return null;
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Error reading from localStorage:", error);
    return null;
  }
};

const setStorageData = (key: string, data: any) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error("Error writing to localStorage:", error);
  }
};

// Initialize default data if not exists
const initializeStorage = () => {
  // Initialize users if not exists
  if (!getStorageData("pedalnepal_users")) {
    const defaultUsers = [
      {
        id: "1",
        mobile: "+977-9841234567",
        email: "john@example.com",
        name: "John Doe",
        password: "password",
        role: "user",
        credits: 250,
        profileImage: null,
        createdAt: new Date().toISOString(),
      },
      {
        id: "2",
        mobile: "+977-9841234568",
        email: "samirgrg0888@gmail.com",
        name: "Samir",
        password: "password",
        role: "user",
        credits: 175,
        profileImage: null,
        createdAt: new Date().toISOString(),
      },
      {
        id: "3",
        mobile: "+977-9841234569",
        email: "admin@pedalnepal.com",
        name: "Admin User",
        password: "password",
        role: "admin",
        credits: 1000,
        profileImage: null,
        createdAt: new Date().toISOString(),
      },
      {
        id: "4",
        mobile: "9869251081",
        email: "samirgrg0888@gmail.com",
        name: "Samir",
        password: "123",
        role: "user",
        credits: 250,
        profileImage: null,
        createdAt: new Date().toISOString(),
      },
    ];
    setStorageData("pedalnepal_users", defaultUsers);
  }

  // Initialize bicycles if not exists
  if (!getStorageData("pedalnepal_bicycles")) {
    const defaultBicycles = [
      {
        description: "Station 1",
        location: "Basantapur, Kathmandu",
        status: "available",
        hourlyRate: 200,
        dailyRate: 1500,
        image: "/bicycle1.jpg",
      },
      {
        description: "Station 2",
        location: "Patan, Lalitpur",
        status: "available",
        hourlyRate: 150,
        dailyRate: 1200,
        image: "/bicycle2.jpg",
      },
      {
        description: "Station 3",
        location: "Durbar Square, Bhaktapur",
        status: "rented",
        hourlyRate: 180,
        dailyRate: 1400,
        image: "/bicycle3.jpg",
      },
    ];
    setStorageData("pedalnepal_bicycles", defaultBicycles);
  }

  // Initialize rentals if not exists
  if (!getStorageData("pedalnepal_rentals")) {
    const defaultRentals = [
      {
        id: "1",
        userId: "2", // Samir's user ID
        bicycleId: "3",
        startTime: "2024-01-15T10:00:00Z",
        endTime: "2024-01-15T12:30:00Z", // 2.5 hours duration
        status: "completed",
        totalCost: 360,
        price: 75,
        station: "Station 1",
        bikeName: "Station 1",
        slotNumber: 1,
      },
      {
        id: "2",
        userId: "2", // Samir's user ID
        bicycleId: "1",
        startTime: "2024-01-16T14:00:00Z",
        endTime: "2024-01-16T15:30:00Z", // 1.5 hours duration
        status: "completed",
        totalCost: 300,
        price: 75,
        station: "Station 1",
        bikeName: "Station 1",
        slotNumber: 2,
      },
    ];
    setStorageData("pedalnepal_rentals", defaultRentals);
  }
};

// Initialize storage on first client-side access
let isInitialized = false;

const ensureInitialized = () => {
  if (typeof window === "undefined") return;
  if (isInitialized) return;

  initializeStorage();
  console.log("LocalStorage initialized with default data");
  isInitialized = true;

  // Add a function to clear and reinitialize storage (for debugging)
  (window as any).clearpedalNepalStorage = () => {
    localStorage.removeItem("pedalnepal_users");
    localStorage.removeItem("pedalnepal_bicycles");
    localStorage.removeItem("pedalnepal_rentals");
    localStorage.removeItem("pedalnepal_current_user");
    isInitialized = false;
    initializeStorage();
    console.log("Storage cleared and reinitialized");
  };

  // Add a function to fix rental data specifically
  (window as any).fixRentalData = () => {
    const defaultRentals = [
      {
        id: "1",
        userId: "2", // Samir's user ID
        bicycleId: "3",
        startTime: "2024-01-15T10:00:00Z",
        endTime: "2024-01-15T12:30:00Z", // 2.5 hours duration
        status: "completed",
        totalCost: 360,
        price: 75,
        station: "Station 1",
        bikeName: "Station 1",
        slotNumber: 1,
      },
      {
        id: "2",
        userId: "2", // Samir's user ID
        bicycleId: "1",
        startTime: "2024-01-16T14:00:00Z",
        endTime: "2024-01-16T15:30:00Z", // 1.5 hours duration
        status: "completed",
        totalCost: 300,
        price: 75,
        station: "Station 1",
        bikeName: "Station 1",
        slotNumber: 2,
      },
    ];
    localStorage.setItem("pedalnepal_rentals", JSON.stringify(defaultRentals));
    console.log("Rental data fixed with proper end times");
  };
};

// Add this function to help reset slot data with reserved slots
if (typeof window !== "undefined") {
  (window as any).resetSlotDataWithReserved = () => {
    try {
      const bicycles = JSON.parse(
        localStorage.getItem("pedalnepal_bicycles") || "[]",
      );
      const uniqueStations = new Map<string, any>();

      // Get unique stations
      bicycles.forEach((bike: any) => {
        const stationKey = `${bike.name}_${bike.location}`;
        if (!uniqueStations.has(stationKey)) {
          uniqueStations.set(stationKey, {
            name: bike.name,
            location: bike.location,
          });
        }
      });

      // Reset slots for each station with reserved slots
      uniqueStations.forEach((station, stationKey) => {
        const slotsKey = `pedalnepal_slots_${stationKey}`;
        const newSlots = Array.from({ length: 10 }, (_, index) => ({
          id: `slot_${stationKey}_${index + 1}`,
          slotNumber: index + 1,
          // Keep slots 9 and 10 empty for bike returns
          status: index >= 8 ? "in-maintenance" : "active",
          lastUpdated: new Date().toISOString(),
          notes: index >= 8 ? "Reserved for bike returns" : "",
        }));

        localStorage.setItem(slotsKey, JSON.stringify(newSlots));
        console.log(`Reset slots for ${station.name} with reserved slots 9-10`);
      });

      console.log("Slot data reset successfully with reserved slots!");
      alert(
        "Slot data reset successfully! Slots 9-10 are now reserved for bike returns.",
      );

      // Refresh the page to see changes
      window.location.reload();
    } catch (error) {
      console.error("Error resetting slot data:", error);
      alert("Error resetting slot data. Please try again.");
    }
  };
}

// LocalStorage API call function
async function localStorageApiCall(
  endpoint: string,
  options: RequestInit = {},
) {
  // Only run on client-side
  if (typeof window === "undefined") {
    throw new Error("API calls can only be made on the client-side");
  }

  // Ensure storage is initialized
  ensureInitialized();

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 100));

  const method = options.method || "GET";

  try {
    // Handle different endpoints
    if (endpoint.includes("/auth/login")) {
      const { mobile, password } = JSON.parse(options.body as string);
      console.log("Login attempt with mobile:", mobile);

      const users = getStorageData("pedalnepal_users") || [];
      console.log("Available users in localStorage:", users);

      // Try to find user with exact match first
      let user = users.find((u: any) => u.mobile === mobile);

      // If not found, try to find by mobile number without country code
      if (!user && mobile.startsWith("+977-")) {
        const mobileWithoutCode = mobile.replace("+977-", "");
        user = users.find((u: any) => u.mobile === mobileWithoutCode);
      }

      // If still not found, try to find by mobile number with country code
      if (!user && !mobile.startsWith("+977-")) {
        const mobileWithCode = `+977-${mobile}`;
        user = users.find((u: any) => u.mobile === mobileWithCode);
      }

      // Additional check: try to find by mobile number without any formatting
      if (!user) {
        const cleanMobile = mobile.replace(/[^0-9]/g, "");
        user = users.find((u: any) => {
          const userMobile = u.mobile.replace(/[^0-9]/g, "");
          return userMobile === cleanMobile;
        });
      }

      console.log("Found user:", user);
      console.log("Login attempt details:", { mobile, password });
      console.log(
        "User details if found:",
        user
          ? { id: user.id, mobile: user.mobile, password: user.password }
          : "No user found",
      );

      if (user && user.password === password) {
        console.log("Login successful for user:", user);
        return { success: true, user, token: "local-token-" + user.id };
      } else {
        console.log("Login failed - invalid credentials");
        console.log(
          "Available mobile numbers:",
          users.map((u: any) => u.mobile),
        );
        if (user) {
          console.log(
            "User found but password mismatch. Expected:",
            user.password,
            "Got:",
            password,
          );
        } else {
          console.log("No user found with mobile number:", mobile);
        }
        throw new Error("Invalid mobile number or password");
      }
    }

    if (endpoint.includes("/auth/register")) {
      const userData = JSON.parse(options.body as string);
      console.log("Signup attempt with data:", userData);

      const users = getStorageData("pedalnepal_users") || [];
      console.log("Current users in localStorage:", users);
      console.log("Looking for mobile:", userData.mobile);

      // Check if mobile number already exists
      const existingUser = users.find((u: any) => u.mobile === userData.mobile);
      console.log("Existing user found:", existingUser);

      if (existingUser) {
        console.log("Mobile number already exists:", userData.mobile);
        throw new Error(`Mobile number ${userData.mobile} already registered`);
      }

      const newUser = {
        id: (users.length + 1).toString(),
        ...userData,
        role: "user",
        credits: 250,
        profileImage: null,
        createdAt: new Date().toISOString(),
      };

      users.push(newUser);
      setStorageData("pedalnepal_users", users);
      console.log("New user saved to localStorage:", newUser);
      console.log("Updated users list:", getStorageData("pedalnepal_users"));

      return {
        success: true,
        user: newUser,
        token: "local-token-" + newUser.id,
      };
    }

    if (endpoint.includes("/users/profile")) {
      const userId = endpoint.match(/userId=(\d+)/)?.[1];
      const users = getStorageData("pedalnepal_users") || [];
      const user = users.find((u: any) => u.id === userId);
      return user || { error: "User not found" };
    }

    if (endpoint.includes("/admin/users")) {
      return getStorageData("pedalnepal_users") || [];
    }

    if (endpoint.includes("/bicycles")) {
      return getStorageData("pedalnepal_bicycles") || [];
    }

    if (endpoint.includes("/rentals")) {
      return getStorageData("pedalnepal_rentals") || [];
    }

    if (endpoint.includes("/credits")) {
      const userId = endpoint.match(/userId=(\d+)/)?.[1];
      const users = getStorageData("pedalnepal_users") || [];
      const user = users.find((u: any) => u.id === userId);
      return { credits: user?.credits || 0 };
    }

    // Stations endpoints
    if (endpoint.includes("/stations")) {
      if (method === "POST") {
        const stationData = JSON.parse(options.body as string);
        const stations = getStorageData("pedalnepal_stations") || [];
        const newStation = {
          id: (stations.length + 1).toString(),
          ...stationData,
          createdAt: new Date().toISOString(),
        };
        stations.push(newStation);
        setStorageData("pedalnepal_stations", stations);
        return { success: true, station: newStation };
      } else if (method === "GET") {
        const stations = getStorageData("pedalnepal_stations") || [];
        // If no stations exist, create some default ones
        if (stations.length === 0) {
          const defaultStations = [
            {
              id: "1",
              name: "Station 1",
              location: "Kathmandu",
              capacity: 50,
              status: "ACTIVE",
              createdAt: new Date().toISOString(),
            },
            {
              id: "2",
              name: "Station 2",
              location: "Lalitpur",
              capacity: 30,
              status: "ACTIVE",
              createdAt: new Date().toISOString(),
            },
            {
              id: "3",
              name: "Station 3",
              location: "Bhaktapur",
              capacity: 25,
              status: "ACTIVE",
              createdAt: new Date().toISOString(),
            },
          ];
          setStorageData("pedalnepal_stations", defaultStations);
          return defaultStations;
        }
        return stations;
      }
    }

    // Services endpoints
    if (endpoint.includes("/services")) {
      if (method === "POST") {
        const serviceData = JSON.parse(options.body as string);
        const services = getStorageData("pedalnepal_services") || [];
        const newService = {
          id: (services.length + 1).toString(),
          ...serviceData,
          createdAt: new Date().toISOString(),
        };
        services.push(newService);
        setStorageData("pedalnepal_services", services);
        return { success: true, service: newService };
      } else if (method === "GET") {
        const services = getStorageData("pedalnepal_services") || [];
        // If no services exist, create some default ones
        if (services.length === 0) {
          const defaultServices = [
            {
              id: "1",
              name: "Bicycle Rental",
              stationId: 1,
              serviceType: "Rental",
              status: "ACTIVE",
              createdAt: new Date().toISOString(),
            },
            {
              id: "2",
              name: "Bicycle Rental",
              stationId: 2,
              serviceType: "Rental",
              status: "ACTIVE",
              createdAt: new Date().toISOString(),
            },
            {
              id: "3",
              name: "Bicycle Rental",
              stationId: 3,
              serviceType: "Rental",
              status: "ACTIVE",
              createdAt: new Date().toISOString(),
            },
          ];
          setStorageData("pedalnepal_services", defaultServices);
          return defaultServices;
        }
        return services;
      }
    }

    // AWS Services endpoints
    if (endpoint.includes("/aws-services/s3-presigned-url")) {
      const { fileName, fileType } = JSON.parse(options.body as string);
      return {
        success: true,
        presignedUrl: `https://mock-s3-bucket.s3.amazonaws.com/${fileName}`,
        fileName,
        fileType,
      };
    }

    // Default response for unknown endpoints
    return { success: true, message: "LocalStorage API response" };
  } catch (error) {
    console.error("LocalStorage API call error:", error);
    throw error;
  }
}

// Authentication API calls
export const authAPI = {
  // Login user with mobile number
  login: async (mobile: string, password: string) => {
    if (USE_EXTERNAL_API) {
      try {
        // Try external API first
        console.log("Attempting external login...");
        const externalResponse = await externalApiCall("/auth/login", {
          method: "POST",
          body: JSON.stringify({ mobile, password }),
        });

        // If external API succeeds, return the response
        if (externalResponse.success || externalResponse.user) {
          console.log("External login successful");
          return externalResponse;
        }

        throw new Error("External login failed");
      } catch (externalError) {
        console.log(
          "External login failed, falling back to localStorage:",
          externalError,
        );

        // Fallback to localStorage
        try {
          return await localStorageApiCall("/auth/login", {
            method: "POST",
            body: JSON.stringify({ mobile, password }),
          });
        } catch (localError) {
          console.error("Both external and local login failed:", localError);
          throw localError;
        }
      }
    } else {
      // Use only localStorage
      return localStorageApiCall("/auth/login", {
        method: "POST",
        body: JSON.stringify({ mobile, password }),
      });
    }
  },

  // Signup user
  signup: async (userData: {
    mobile: string;
    email: string;
    password: string;
    name: string;
  }) => {
    if (USE_EXTERNAL_API) {
      try {
        // Try external API first
        console.log("Attempting external signup...");
        const externalResponse = await externalApiCall("/auth/register", {
          method: "POST",
          body: JSON.stringify(userData),
        });

        // If external API succeeds, return the response
        if (externalResponse.success || externalResponse.user) {
          console.log("External signup successful");
          return externalResponse;
        }

        throw new Error("External signup failed");
      } catch (externalError) {
        console.log(
          "External signup failed, falling back to localStorage:",
          externalError,
        );

        // Fallback to localStorage
        try {
          return await localStorageApiCall("/auth/register", {
            method: "POST",
            body: JSON.stringify(userData),
          });
        } catch (localError) {
          console.error("Both external and local signup failed:", localError);
          throw localError;
        }
      }
    } else {
      // Use only localStorage
      return localStorageApiCall("/auth/register", {
        method: "POST",
        body: JSON.stringify(userData),
      });
    }
  },
};

// User profile API calls
export const userAPI = {
  // Get user profile
  getProfile: async (userId: string) => {
    return localStorageApiCall(`/users/profile?userId=${userId}`, {
      method: "GET",
    });
  },

  // Get all users (admin only)
  getAll: async () => {
    return localStorageApiCall("/admin/users", {
      method: "GET",
    });
  },

  // Update user profile
  updateProfile: async (
    userId: string,
    profileData: {
      name?: string;
      email?: string;
      mobile?: string;
      profileImage?: string;
    },
  ) => {
    const users = getStorageData("pedalnepal_users") || [];
    const userIndex = users.findIndex((u: any) => u.id === userId);

    if (userIndex !== -1) {
      users[userIndex] = { ...users[userIndex], ...profileData };
      setStorageData("pedalnepal_users", users);
      return { success: true, user: users[userIndex] };
    }

    return { error: "User not found" };
  },
};

// Bicycle API calls
export const bicycleAPI = {
  // Get all bicycles
  getAll: async (filters?: { status?: string; location?: string }) => {
    const bicycles = getStorageData("pedalnepal_bicycles") || [];

    if (filters) {
      return bicycles.filter((bike: any) => {
        if (filters.status && bike.status !== filters.status) return false;
        if (filters.location && !bike.location.includes(filters.location))
          return false;
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
    const bicycles = getStorageData("pedalnepal_bicycles") || [];
    const newBicycle = {
      id: (bicycles.length + 1).toString(),
      ...bicycleData,
      status: "available",
    };

    bicycles.push(newBicycle);
    setStorageData("pedalnepal_bicycles", bicycles);

    return { success: true, bicycle: newBicycle };
  },
};

// Rental API calls
export const rentalAPI = {
  // Get rentals
  getAll: async (filters?: { userId?: string; status?: string }) => {
    const rentals = getStorageData("pedalnepal_rentals") || [];

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
    const rentals = getStorageData("pedalnepal_rentals") || [];
    const bicycles = getStorageData("pedalnepal_bicycles") || [];

    // Find the bicycle to get its rate
    const bicycle = bicycles.find((b: any) => b.id === rentalData.bicycleId);
    if (!bicycle) {
      throw new Error("Bicycle not found");
    }

    const newRental = {
      id: (rentals.length + 1).toString(),
      ...rentalData,
      status: "active",
      totalCost: bicycle.hourlyRate * 2, // Calculate based on duration
    };

    rentals.push(newRental);
    setStorageData("pedalnepal_rentals", rentals);

    // Update bicycle status to rented
    const bicycleIndex = bicycles.findIndex(
      (b: any) => b.id === rentalData.bicycleId,
    );
    if (bicycleIndex !== -1) {
      bicycles[bicycleIndex].status = "rented";
      setStorageData("pedalnepal_bicycles", bicycles);
    }

    return { success: true, rental: newRental };
  },
};

// Credits API calls
export const creditsAPI = {
  // Get user's credit balance
  getBalance: async (userId: string) => {
    const users = getStorageData("pedalnepal_users") || [];
    const user = users.find((u: any) => u.id === userId);
    return { credits: user?.credits || 0 };
  },

  // Add/remove credits (admin only)
  updateCredits: async (data: {
    userId: string;
    credits: number;
    action: "add" | "remove";
    reason?: string;
  }) => {
    const users = getStorageData("pedalnepal_users") || [];
    const userIndex = users.findIndex((u: any) => u.id === data.userId);

    if (userIndex !== -1) {
      if (data.action === "add") {
        users[userIndex].credits += data.credits;
      } else {
        users[userIndex].credits = Math.max(
          0,
          users[userIndex].credits - data.credits,
        );
      }

      setStorageData("pedalnepal_users", users);
      return { success: true, user: users[userIndex] };
    }

    return { error: "User not found" };
  },
};

// Stations API calls
export const stationsAPI = {
  // Create station
  create: async (stationData: {
    name: string;
    location: string;
    capacity: number;
    status: string;
  }) => {
    if (USE_EXTERNAL_API) {
      try {
        const response = await externalApiCall("/stations", {
          method: "POST",
          body: JSON.stringify(stationData),
        });
        return response;
      } catch (error) {
        console.log("External stations API failed, using localStorage fallback");
        // Fallback to localStorage
        return localStorageApiCall("/stations", {
          method: "POST",
          body: JSON.stringify(stationData),
        });
      }
    } else {
      return localStorageApiCall("/stations", {
        method: "POST",
        body: JSON.stringify(stationData),
      });
    }
  },

  // Get all stations
  getAll: async (filters?: { status?: string; minCapacity?: number }) => {
    if (USE_EXTERNAL_API) {
      try {
        const queryParams = new URLSearchParams();
        if (filters?.status) queryParams.append("status", filters.status);
        if (filters?.minCapacity) queryParams.append("minCapacity", filters.minCapacity.toString());
        
        const endpoint = `/stations${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
        const response = await externalApiCall(endpoint, { method: "GET" });
        return response;
      } catch (error) {
        console.log("External stations API failed, using localStorage fallback");
        // Fallback to localStorage
        return localStorageApiCall("/stations", { method: "GET" });
      }
    } else {
      return localStorageApiCall("/stations", { method: "GET" });
    }
  },

  // Get station by ID
  getById: async (id: string) => {
    if (USE_EXTERNAL_API) {
      try {
        const response = await externalApiCall(`/stations/${id}`, { method: "GET" });
        return response;
      } catch (error) {
        console.log("External stations API failed, using localStorage fallback");
        // Fallback to localStorage
        return localStorageApiCall(`/stations/${id}`, { method: "GET" });
      }
    } else {
      return localStorageApiCall(`/stations/${id}`, { method: "GET" });
    }
  },
};

// Services API calls
export const servicesAPI = {
  // Create service
  create: async (serviceData: {
    name: string;
    stationId: number;
    serviceType: string;
    status: string;
  }) => {
    if (USE_EXTERNAL_API) {
      try {
        const response = await externalApiCall("/services", {
          method: "POST",
          body: JSON.stringify(serviceData),
        });
        return response;
      } catch (error) {
        console.log("External services API failed, using localStorage fallback");
        // Fallback to localStorage
        return localStorageApiCall("/services", {
          method: "POST",
          body: JSON.stringify(serviceData),
        });
      }
    } else {
      return localStorageApiCall("/services", {
        method: "POST",
        body: JSON.stringify(serviceData),
      });
    }
  },

  // Get all services
  getAll: async (filters?: { stationId?: number; serviceType?: string; status?: string }) => {
    if (USE_EXTERNAL_API) {
      try {
        const queryParams = new URLSearchParams();
        if (filters?.stationId) queryParams.append("stationId", filters.stationId.toString());
        if (filters?.serviceType) queryParams.append("serviceType", filters.serviceType);
        if (filters?.status) queryParams.append("status", filters.status);
        
        const endpoint = `/services${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
        const response = await externalApiCall(endpoint, { method: "GET" });
        return response;
      } catch (error) {
        console.log("External services API failed, using localStorage fallback");
        // Fallback to localStorage
        return localStorageApiCall("/services", { method: "GET" });
      }
    } else {
      return localStorageApiCall("/services", { method: "GET" });
    }
  },

  // Get service by ID
  getById: async (id: string) => {
    if (USE_EXTERNAL_API) {
      try {
        const response = await externalApiCall(`/services/${id}`, { method: "GET" });
        return response;
      } catch (error) {
        console.log("External services API failed, using localStorage fallback");
        // Fallback to localStorage
        return localStorageApiCall(`/services/${id}`, { method: "GET" });
      }
    } else {
      return localStorageApiCall(`/services/${id}`, { method: "GET" });
    }
  },

  // Get services by station ID
  getByStationId: async (stationId: string) => {
    if (USE_EXTERNAL_API) {
      try {
        const response = await externalApiCall(`/services/station/${stationId}`, { method: "GET" });
        return response;
      } catch (error) {
        console.log("External services API failed, using localStorage fallback");
        // Fallback to localStorage
        return localStorageApiCall(`/services/station/${stationId}`, { method: "GET" });
      }
    } else {
      return localStorageApiCall(`/services/station/${stationId}`, { method: "GET" });
    }
  },
};

// AWS Services API calls
export const awsAPI = {
  // Get S3 presigned URL
  getS3PresignedUrl: async (fileName: string, fileType: string) => {
    if (USE_EXTERNAL_API) {
      try {
        const response = await externalApiCall("/aws-services/s3-presigned-url", {
          method: "POST",
          body: JSON.stringify({ fileName, fileType }),
        });
        return response;
      } catch (error) {
        console.log("External AWS API failed, using localStorage fallback");
        // Fallback to localStorage - return a mock URL
        return {
          success: true,
          presignedUrl: `https://mock-s3-bucket.s3.amazonaws.com/${fileName}`,
          fileName,
          fileType,
        };
      }
    } else {
      // Return mock URL for localStorage mode
      return {
        success: true,
        presignedUrl: `https://mock-s3-bucket.s3.amazonaws.com/${fileName}`,
        fileName,
        fileType,
      };
    }
  },
};

// Export the main API object
export const api = {
  auth: authAPI,
  user: userAPI,
  bicycle: bicycleAPI,
  rental: rentalAPI,
  credits: creditsAPI,
  stations: stationsAPI,
  services: servicesAPI,
  aws: awsAPI,
};

export default api;

// Add global functions for debugging and data management
if (typeof window !== "undefined") {
  // Test external API connection
  (window as any).testExternalAPI = async () => {
    try {
      console.log("Testing external API connection...");
      console.log("API URL:", EXTERNAL_API_BASE_URL);
      console.log("Use External API:", USE_EXTERNAL_API);

      const response = await fetch(`${EXTERNAL_API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mobile: "test",
          password: "test",
        }),
      });

      console.log("External API response status:", response.status);
      const data = await response.json();
      console.log("External API response data:", data);

      alert(
        `External API test completed. Status: ${response.status}\nURL: ${EXTERNAL_API_BASE_URL}`,
      );
    } catch (error) {
      console.error("External API test failed:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      alert(
        `External API test failed: ${errorMessage}\nURL: ${EXTERNAL_API_BASE_URL}`,
      );
    }
  };

  // Toggle external API usage
  (window as any).toggleExternalAPI = () => {
    const currentSetting = localStorage.getItem("use_external_api");
    const newSetting = currentSetting === "false" ? "true" : "false";
    localStorage.setItem("use_external_api", newSetting);
    alert(
      `External API ${newSetting === "true" ? "enabled" : "disabled"}. Please refresh the page.`,
    );
  };

  // Show current API configuration
  (window as any).showAPIConfig = () => {
    console.log("=== API Configuration ===");
    console.log("External API URL:", EXTERNAL_API_BASE_URL);
    console.log("Use External API:", USE_EXTERNAL_API);
    console.log("Environment Variables:");
    console.log(
      "- NEXT_PUBLIC_EXTERNAL_API_BASE_URL:",
      process.env.NEXT_PUBLIC_EXTERNAL_API_BASE_URL,
    );
    console.log(
      "- NEXT_PUBLIC_USE_EXTERNAL_API:",
      process.env.NEXT_PUBLIC_USE_EXTERNAL_API,
    );
    console.log("========================");
  };

  (window as any).clearpedalNepalStorage = () => {
    localStorage.removeItem("pedalnepal_users");
    localStorage.removeItem("pedalnepal_bicycles");
    localStorage.removeItem("pedalnepal_rentals");
    localStorage.removeItem("pedalnepal_current_user");
    // Clear all slot data
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("pedalnepal_slots_")) {
        localStorage.removeItem(key);
      }
    });
    location.reload();
  };

  (window as any).fixRentalData = () => {
    const defaultRentals = [
      {
        id: "1",
        userId: "2",
        bikeId: "1-bike-1",
        startTime: "2024-01-15T10:00:00.000Z",
        endTime: "2024-01-15T12:30:00.000Z",
        status: "completed",
        price: 62,
        duration: "hourly",
        hours: 2.5,
        bikeName: "Bike 1",
        station: "Station 1",
        slotNumber: 1,
      },
      {
        id: "2",
        userId: "2",
        bikeId: "1-bike-2",
        startTime: "2024-01-16T14:00:00.000Z",
        endTime: "2024-01-16T15:30:00.000Z",
        status: "completed",
        price: 37,
        duration: "hourly",
        hours: 1.5,
        bikeName: "Bike 2",
        station: "Station 1",
        slotNumber: 2,
      },
    ];
    localStorage.setItem("pedalnepal_rentals", JSON.stringify(defaultRentals));
    location.reload();
  };

  (window as any).resetSlotDataWithReserved = () => {
    // Reset all station slot data to include reserved slots
    const bicycles = JSON.parse(
      localStorage.getItem("pedalnepal_bicycles") || "[]",
    );

    bicycles.forEach((bike: any) => {
      const stationKey = `${bike.description}_${bike.location}`;
      const slotsKey = `pedalnepal_slots_${stationKey}`;

      const slots = [];
      for (let i = 1; i <= 10; i++) {
        slots.push({
          id: `${stationKey}_slot_${i}`,
          slotNumber: i,
          status: i >= 9 ? "in-maintenance" : "active",
          lastUpdated: new Date().toISOString(),
          notes: i >= 9 ? "Reserved for bike returns" : undefined,
        });
      }

      localStorage.setItem(slotsKey, JSON.stringify(slots));
    });

    location.reload();
  };

  (window as any).testSmartSlotManagement = () => {
    // Test function to simulate smart slot management
    console.log("Testing Smart Slot Management...");

    // Get all stations
    const bicycles = JSON.parse(
      localStorage.getItem("pedalnepal_bicycles") || "[]",
    );

    bicycles.forEach((bike: any) => {
      const stationKey = `${bike.description}_${bike.location}`;
      const slotsKey = `pedalnepal_slots_${stationKey}`;
      const slots = JSON.parse(localStorage.getItem(slotsKey) || "[]");

      console.log(`\nStation: ${bike.description}`);
      console.log("Current slot status:");
      slots.forEach((slot: any) => {
        console.log(
          `  Slot ${slot.slotNumber}: ${slot.status} - ${slot.notes || "No notes"}`,
        );
      });
    });
  };

  // Test new API integrations
  (window as any).testNewAPIs = async () => {
    console.log("Testing new API integrations...");
    
    try {
      // Test Stations API
      console.log("\n=== Testing Stations API ===");
      const stations = await api.stations.getAll();
      console.log("Stations:", stations);
      
      // Test Services API
      console.log("\n=== Testing Services API ===");
      const services = await api.services.getAll();
      console.log("Services:", services);
      
      // Test AWS API
      console.log("\n=== Testing AWS API ===");
      const s3Url = await api.aws.getS3PresignedUrl("test.jpg", "image/jpeg");
      console.log("S3 Presigned URL:", s3Url);
      
      console.log("\n✅ All new APIs are working!");
    } catch (error) {
      console.error("❌ API test failed:", error);
    }
  };

  // Test external API connection for new endpoints
  (window as any).testExternalNewAPIs = async () => {
    console.log("Testing external API for new endpoints...");
    
    try {
      // Test external stations API
      const stationsResponse = await fetch(`${EXTERNAL_API_BASE_URL}/stations`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      console.log("External Stations API Status:", stationsResponse.status);
      
      // Test external services API
      const servicesResponse = await fetch(`${EXTERNAL_API_BASE_URL}/services`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      console.log("External Services API Status:", servicesResponse.status);
      
      // Test external AWS API
      const awsResponse = await fetch(`${EXTERNAL_API_BASE_URL}/aws-services/s3-presigned-url`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: "test.jpg", fileType: "image/jpeg" }),
      });
      console.log("External AWS API Status:", awsResponse.status);
      
      console.log("✅ External API tests completed!");
    } catch (error) {
      console.error("❌ External API test failed:", error);
    }
  };
}
