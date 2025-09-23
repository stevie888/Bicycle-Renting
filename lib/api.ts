// LocalStorage-based API for persistent data storage

// External API configuration
const EXTERNAL_API_BASE_URL = "/api/proxy"; // Use Next.js proxy to avoid CORS

// Configuration to enable/disable external API
const USE_EXTERNAL_API = true; // Force external API usage

// Check if we're in browser environment and handle CORS issues
const isBrowser = typeof window !== "undefined";
const shouldUseExternalAPI = USE_EXTERNAL_API && isBrowser;

// Data synchronization helper
const syncUserData = async (userId: string) => {
  if (USE_EXTERNAL_API) {
    try {
      // Try to get user data from external API
      const externalUser = await externalApiCall(`/users/profile?userId=${userId}`, {
        method: "GET",
      });
      
      if (externalUser && externalUser.id) {
        // Update localStorage with external data
        const users = getStorageData("pedalnepal_users") || [];
        const userIndex = users.findIndex((u: any) => u.id === userId);
        
        if (userIndex !== -1) {
          users[userIndex] = { ...users[userIndex], ...externalUser };
          setStorageData("pedalnepal_users", users);
          console.log("✅ User data synchronized from external API");
        }
        
        return externalUser;
      }
    } catch (error) {
      console.log("External user sync failed, using localStorage data");
    }
  }
  
  // Fallback to localStorage
  const users = getStorageData("pedalnepal_users") || [];
  return users.find((u: any) => u.id === userId);
};

// Helper function to make external API calls
async function externalApiCall(endpoint: string, options: RequestInit = {}) {
  try {
    const url = `${EXTERNAL_API_BASE_URL}${endpoint}`;
    console.log("Making external API call to:", url);

    // Get auth token from localStorage if available
    const authToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        ...(authToken && { "Authorization": `Bearer ${authToken}` }),
        ...options.headers,
      },
      // Use cors mode and let the server handle CORS
      mode: "cors",
      // Add credentials for authentication
      credentials: "include",
    });

    if (!response.ok) {
      // If 401, try without auth token for public endpoints
      if (response.status === 401 && authToken) {
        console.log("401 error with auth token, trying without token");
        const retryResponse = await fetch(url, {
          ...options,
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            ...options.headers,
          },
          mode: "cors",
          credentials: "include",
        });
        
        if (retryResponse.ok) {
          const data = await retryResponse.json();
          console.log("External API response (no auth):", data);
          return data;
        }
      }
      
      // For 401 errors, return the response instead of throwing
      if (response.status === 401) {
        const errorData = await response.text();
        let errorJson;
        try {
          errorJson = JSON.parse(errorData);
        } catch {
          errorJson = { error: "Unauthorized", message: "Authentication required" };
        }
        return { success: false, error: errorJson, status: 401 };
      }
      
      throw new Error(
        `External API error: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();
    console.log("External API response:", data);
    return data;
  } catch (error) {
    console.error("External API call failed:", error);
    // Check if it's a CORS error
    if (error instanceof TypeError && error.message.includes("Failed to fetch")) {
      console.log("CORS error detected - server needs CORS headers");
      throw new Error("CORS_ERROR");
    }
    // For live API usage, don't fall back to localStorage - throw the error
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

    // User endpoints with pagination
    if (endpoint.includes("/user?page=") && endpoint.includes("&limit=")) {
      const url = new URL(`http://localhost${endpoint}`);
      const page = parseInt(url.searchParams.get("page") || "1");
      const limit = parseInt(url.searchParams.get("limit") || "10");
      const users = getStorageData("pedalnepal_users") || [];
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedUsers = users.slice(startIndex, endIndex);
      return {
        users: paginatedUsers,
        total: users.length,
        page,
        limit,
        totalPages: Math.ceil(users.length / limit)
      };
    }

    // User endpoints
    if (endpoint.includes("/user")) {
      if (method === "GET") {
        // Get current user profile
        const currentUser = getStorageData("pedalnepal_current_user");
        return currentUser || { error: "No current user" };
      } else if (method === "PUT") {
        // Update user profile
        const profileData = JSON.parse(options.body as string);
        const currentUser = getStorageData("pedalnepal_current_user");
        if (currentUser) {
          const updatedUser = { ...currentUser, ...profileData };
          setStorageData("pedalnepal_current_user", updatedUser);
          return { success: true, user: updatedUser };
        }
        return { error: "No current user" };
      } else if (method === "PATCH") {
        // Update user status, deactivate, change password
        return { success: true, message: "Operation completed locally" };
      } else if (method === "DELETE") {
        // Delete user
        const userId = endpoint.split("/").pop();
        const users = getStorageData("pedalnepal_users") || [];
        const filteredUsers = users.filter((u: any) => u.id !== userId);
        setStorageData("pedalnepal_users", filteredUsers);
        return { success: true, message: "User deleted" };
      }
    }

    // User promote/demote endpoints
    if (endpoint.includes("/user/") && (endpoint.includes("/promote") || endpoint.includes("/demote"))) {
      const userId = endpoint.split("/")[2];
      const users = getStorageData("pedalnepal_users") || [];
      const userIndex = users.findIndex((u: any) => u.id === userId);
      
      if (userIndex !== -1) {
        users[userIndex].role = endpoint.includes("/promote") ? "admin" : "user";
        setStorageData("pedalnepal_users", users);
        return { success: true, user: users[userIndex] };
      }
      return { error: "User not found" };
    }

    // User increase balance endpoint
    if (endpoint.includes("/user/") && endpoint.includes("/increase-balance")) {
      const userId = endpoint.split("/")[2];
      const { amount } = JSON.parse(options.body as string);
      const users = getStorageData("pedalnepal_users") || [];
      const userIndex = users.findIndex((u: any) => u.id === userId);
      
      if (userIndex !== -1) {
        users[userIndex].credits = (users[userIndex].credits || 0) + amount;
        setStorageData("pedalnepal_users", users);
        return { success: true, user: users[userIndex] };
      }
      return { error: "User not found" };
    }

    // User customer/admin users endpoints
    if (endpoint.includes("/user/customer-users") || endpoint.includes("/user/admin-users")) {
      const url = new URL(`http://localhost${endpoint}`);
      const search = url.searchParams.get("search");
      const role = endpoint.includes("customer") ? "user" : "admin";
      
      let users = getStorageData("pedalnepal_users") || [];
      users = users.filter((u: any) => u.role === role);
      
      if (search) {
        users = users.filter((u: any) => 
          u.name.toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase())
        );
      }
      
      return { users, total: users.length };
    }

    // User all users status endpoint
    if (endpoint.includes("/user/all-users-status")) {
      const users = getStorageData("pedalnepal_users") || [];
      return { users: users.map((u: any) => ({ id: u.id, status: u.status || "ACTIVE" })) };
    }

    // Stations endpoints with additional functionality
    if (endpoint.includes("/stations/all-stations-services-details")) {
      const stations = getStorageData("pedalnepal_stations") || [];
      const services = getStorageData("pedalnepal_services") || [];
      
      return {
        stations: stations.map((station: any) => ({
          ...station,
          services: services.filter((service: any) => service.stationId === station.id)
        }))
      };
    }

    if (endpoint.includes("/stations/all-stations-services-status")) {
      const stations = getStorageData("pedalnepal_stations") || [];
      const services = getStorageData("pedalnepal_services") || [];
      
      return {
        stations: stations.map((station: any) => ({
          id: station.id,
          name: station.name,
          status: station.status,
          servicesCount: services.filter((service: any) => service.stationId === station.id).length
        }))
      };
    }

    if (endpoint.includes("/stations/list")) {
      const url = new URL(`http://localhost${endpoint}`);
      const search = url.searchParams.get("search");
      const status = url.searchParams.get("status");
      const page = parseInt(url.searchParams.get("page") || "1");
      const limit = parseInt(url.searchParams.get("limit") || "10");
      
      let stations = getStorageData("pedalnepal_stations") || [];
      
      if (search) {
        stations = stations.filter((station: any) => 
          station.name.toLowerCase().includes(search.toLowerCase()) ||
          station.location.toLowerCase().includes(search.toLowerCase())
        );
      }
      
      if (status) {
        stations = stations.filter((station: any) => station.status === status);
      }
      
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedStations = stations.slice(startIndex, endIndex);
      
      return {
        stations: paginatedStations,
        total: stations.length,
        page,
        limit,
        totalPages: Math.ceil(stations.length / limit)
      };
    }

    if (endpoint.includes("/stations/slot-stats")) {
      const url = new URL(`http://localhost${endpoint}`);
      const stationId = url.searchParams.get("stationId");
      
      const slotsKey = stationId ? `pedalnepal_slots_${stationId}` : null;
      if (slotsKey) {
        const slots = getStorageData(slotsKey) || [];
        return {
          totalSlots: slots.length,
          availableSlots: slots.filter((slot: any) => slot.status === "active").length,
          occupiedSlots: slots.filter((slot: any) => slot.status === "occupied").length,
          maintenanceSlots: slots.filter((slot: any) => slot.status === "in-maintenance").length,
          reservedSlots: slots.filter((slot: any) => slot.status === "reserved").length
        };
      }
      return { totalSlots: 0, availableSlots: 0, occupiedSlots: 0, maintenanceSlots: 0, reservedSlots: 0 };
    }

    if (endpoint.includes("/stations/change-slot-status")) {
      return { success: true, message: "Slot status changed locally" };
    }

    if (endpoint.includes("/stations/") && method === "PATCH") {
      // Update station
      const stationId = endpoint.split("/")[2];
      const updateData = JSON.parse(options.body as string);
      const stations = getStorageData("pedalnepal_stations") || [];
      const stationIndex = stations.findIndex((s: any) => s.id === stationId);

      if (stationIndex !== -1) {
        stations[stationIndex] = { ...stations[stationIndex], ...updateData };
        setStorageData("pedalnepal_stations", stations);
        return { success: true, station: stations[stationIndex] };
      }

      return { error: "Station not found" };
    }

    // Rentals endpoints
    if (endpoint.includes("/rentals")) {
      if (method === "POST") {
        // Create rental
        const rentalData = JSON.parse(options.body as string);
        const rentals = getStorageData("pedalnepal_rentals") || [];
        const newRental = {
          id: (rentals.length + 1).toString(),
          ...rentalData,
          startTime: new Date().toISOString(),
          status: "ACTIVE",
        };

        rentals.push(newRental);
        setStorageData("pedalnepal_rentals", rentals);

        return { success: true, rental: newRental };
      } else if (method === "GET") {
        // Get rentals with filters
        const url = new URL(`http://localhost${endpoint}`);
        const service_id = url.searchParams.get("service_id");
        const status = url.searchParams.get("status");
        const page = parseInt(url.searchParams.get("page") || "1");
        const limit = parseInt(url.searchParams.get("limit") || "10");
        
        let rentals = getStorageData("pedalnepal_rentals") || [];

        if (service_id) {
          rentals = rentals.filter((rental: any) => rental.serviceId === parseInt(service_id));
        }
        if (status) {
          rentals = rentals.filter((rental: any) => rental.status === status);
        }

        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedRentals = rentals.slice(startIndex, endIndex);

        return {
          rentals: paginatedRentals,
          total: rentals.length,
          page,
          limit,
          totalPages: Math.ceil(rentals.length / limit)
        };
      }
    }

    // Rental complete endpoint
    if (endpoint.includes("/rentals/") && endpoint.includes("/complete")) {
      const rentalId = endpoint.split("/")[2];
      const { remarks } = JSON.parse(options.body as string);
      const rentals = getStorageData("pedalnepal_rentals") || [];
      const rentalIndex = rentals.findIndex((r: any) => r.id === rentalId);

      if (rentalIndex !== -1) {
        rentals[rentalIndex].status = "COMPLETED";
        rentals[rentalIndex].endTime = new Date().toISOString();
        rentals[rentalIndex].remarks = remarks || "Rental completed successfully";
        setStorageData("pedalnepal_rentals", rentals);
        return { success: true, rental: rentals[rentalIndex] };
      }

      return { error: "Rental not found" };
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
        console.error("External login failed:", externalError);
        // Don't fall back to localStorage - throw the error for live API usage
        throw externalError;
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
          body: JSON.stringify({
            fullName: userData.name,
            email: userData.email,
            phone: userData.mobile,
            password: userData.password,
            role: "user"
          }),
        });

        // If external API succeeds, return the response
        if (externalResponse.success || externalResponse.user) {
          console.log("External signup successful");
          return externalResponse;
        }

        throw new Error("External signup failed");
      } catch (externalError) {
        console.error("External signup failed:", externalError);
        // Don't fall back to localStorage - throw the error for live API usage
        throw externalError;
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
  // Get user profile with synchronization
  getProfile: async (userId: string) => {
    // Try to sync data from external API first
    const syncedUser = await syncUserData(userId);
    if (syncedUser) {
      return syncedUser;
    }
    
    // Fallback to localStorage
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

  // Get users with pagination
  getPaginated: async (page: number = 1, limit: number = 10) => {
    if (USE_EXTERNAL_API) {
      try {
        const response = await externalApiCall(`/user?page=${page}&limit=${limit}`, {
          method: "GET",
        });
        return response;
      } catch (error) {
        console.log("External user pagination API failed, using localStorage fallback");
        // Check if it's a CORS error
        if (error.message === "CORS_ERROR") {
          console.log("CORS error detected, using localStorage fallback");
        }
        // Fallback to localStorage
        const users = getStorageData("pedalnepal_users") || [];
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedUsers = users.slice(startIndex, endIndex);
        return {
          users: paginatedUsers,
          total: users.length,
          page,
          limit,
          totalPages: Math.ceil(users.length / limit)
        };
      }
    } else {
      const users = getStorageData("pedalnepal_users") || [];
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedUsers = users.slice(startIndex, endIndex);
      return {
        users: paginatedUsers,
        total: users.length,
        page,
        limit,
        totalPages: Math.ceil(users.length / limit)
      };
    }
  },

  // Get authenticated user profile
  getCurrentProfile: async () => {
    if (USE_EXTERNAL_API) {
      try {
        const response = await externalApiCall("/user", {
          method: "GET",
        });
        return response;
      } catch (error) {
        console.log("External current user API failed, using localStorage fallback");
        // Fallback to localStorage
        const currentUser = getStorageData("pedalnepal_current_user");
        return currentUser || { error: "No current user" };
      }
    } else {
      const currentUser = getStorageData("pedalnepal_current_user");
      return currentUser || { error: "No current user" };
    }
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
    if (USE_EXTERNAL_API) {
      try {
        const response = await externalApiCall("/user", {
          method: "PUT",
          body: JSON.stringify(profileData),
        });
        return response;
      } catch (error) {
        console.log("External user update API failed, using localStorage fallback");
        // Fallback to localStorage
        const users = getStorageData("pedalnepal_users") || [];
        const userIndex = users.findIndex((u: any) => u.id === userId);

        if (userIndex !== -1) {
          users[userIndex] = { ...users[userIndex], ...profileData };
          setStorageData("pedalnepal_users", users);
          return { success: true, user: users[userIndex] };
        }

        return { error: "User not found" };
      }
    } else {
      const users = getStorageData("pedalnepal_users") || [];
      const userIndex = users.findIndex((u: any) => u.id === userId);

      if (userIndex !== -1) {
        users[userIndex] = { ...users[userIndex], ...profileData };
        setStorageData("pedalnepal_users", users);
        return { success: true, user: users[userIndex] };
      }

      return { error: "User not found" };
    }
  },

  // Update user status
  updateStatus: async (status: "ACTIVE" | "INACTIVE" | "SUSPENDED") => {
    if (USE_EXTERNAL_API) {
      try {
        const response = await externalApiCall("/user/status", {
          method: "PATCH",
          body: JSON.stringify({ status }),
        });
        return response;
      } catch (error) {
        console.log("External user status update API failed, using localStorage fallback");
        return { success: true, message: "Status updated locally" };
      }
    } else {
      return { success: true, message: "Status updated locally" };
    }
  },

  // Deactivate user
  deactivate: async () => {
    if (USE_EXTERNAL_API) {
      try {
        const response = await externalApiCall("/user/deactivate", {
          method: "PATCH",
        });
        return response;
      } catch (error) {
        console.log("External user deactivate API failed, using localStorage fallback");
        return { success: true, message: "User deactivated locally" };
      }
    } else {
      return { success: true, message: "User deactivated locally" };
    }
  },

  // Change password
  changePassword: async (currentPassword: string, newPassword: string) => {
    if (USE_EXTERNAL_API) {
      try {
        const response = await externalApiCall("/user/change-password", {
          method: "PATCH",
          body: JSON.stringify({ currentPassword, newPassword }),
        });
        return response;
      } catch (error) {
        console.log("External password change API failed, using localStorage fallback");
        return { success: true, message: "Password changed locally" };
      }
    } else {
      return { success: true, message: "Password changed locally" };
    }
  },

  // Get all users status
  getAllUsersStatus: async () => {
    if (USE_EXTERNAL_API) {
      try {
        const response = await externalApiCall("/user/all-users-status", {
          method: "GET",
        });
        return response;
      } catch (error) {
        console.log("External all users status API failed, using localStorage fallback");
        const users = getStorageData("pedalnepal_users") || [];
        return { users: users.map((u: any) => ({ id: u.id, status: u.status || "ACTIVE" })) };
      }
    } else {
      const users = getStorageData("pedalnepal_users") || [];
      return { users: users.map((u: any) => ({ id: u.id, status: u.status || "ACTIVE" })) };
    }
  },

  // Promote user to admin
  promote: async (userId: string) => {
    if (USE_EXTERNAL_API) {
      try {
        const response = await externalApiCall(`/user/${userId}/promote`, {
          method: "PATCH",
        });
        return response;
      } catch (error) {
        console.log("External user promote API failed, using localStorage fallback");
        // Fallback to localStorage
        const users = getStorageData("pedalnepal_users") || [];
        const userIndex = users.findIndex((u: any) => u.id === userId);

        if (userIndex !== -1) {
          users[userIndex].role = "admin";
          setStorageData("pedalnepal_users", users);
          return { success: true, user: users[userIndex] };
        }

        return { error: "User not found" };
      }
    } else {
      const users = getStorageData("pedalnepal_users") || [];
      const userIndex = users.findIndex((u: any) => u.id === userId);

      if (userIndex !== -1) {
        users[userIndex].role = "admin";
        setStorageData("pedalnepal_users", users);
        return { success: true, user: users[userIndex] };
      }

      return { error: "User not found" };
    }
  },

  // Demote user from admin
  demote: async (userId: string) => {
    if (USE_EXTERNAL_API) {
      try {
        const response = await externalApiCall(`/user/${userId}/demote`, {
          method: "PATCH",
        });
        return response;
      } catch (error) {
        console.log("External user demote API failed, using localStorage fallback");
        // Fallback to localStorage
        const users = getStorageData("pedalnepal_users") || [];
        const userIndex = users.findIndex((u: any) => u.id === userId);

        if (userIndex !== -1) {
          users[userIndex].role = "user";
          setStorageData("pedalnepal_users", users);
          return { success: true, user: users[userIndex] };
        }

        return { error: "User not found" };
      }
    } else {
      const users = getStorageData("pedalnepal_users") || [];
      const userIndex = users.findIndex((u: any) => u.id === userId);

      if (userIndex !== -1) {
        users[userIndex].role = "user";
        setStorageData("pedalnepal_users", users);
        return { success: true, user: users[userIndex] };
      }

      return { error: "User not found" };
    }
  },

  // Delete user
  delete: async (userId: string) => {
    if (USE_EXTERNAL_API) {
      try {
        const response = await externalApiCall(`/user/${userId}`, {
          method: "DELETE",
        });
        return response;
      } catch (error) {
        console.log("External user delete API failed, using localStorage fallback");
        // Fallback to localStorage
        const users = getStorageData("pedalnepal_users") || [];
        const filteredUsers = users.filter((u: any) => u.id !== userId);
        setStorageData("pedalnepal_users", filteredUsers);
        return { success: true, message: "User deleted" };
      }
    } else {
      const users = getStorageData("pedalnepal_users") || [];
      const filteredUsers = users.filter((u: any) => u.id !== userId);
      setStorageData("pedalnepal_users", filteredUsers);
      return { success: true, message: "User deleted" };
    }
  },

  // Increase user balance
  increaseBalance: async (userId: string, amount: number) => {
    if (USE_EXTERNAL_API) {
      try {
        const response = await externalApiCall(`/user/${userId}/increase-balance`, {
          method: "PATCH",
          body: JSON.stringify({ amount }),
        });
        return response;
      } catch (error) {
        console.log("External user balance increase API failed, using localStorage fallback");
        // Fallback to localStorage
        const users = getStorageData("pedalnepal_users") || [];
        const userIndex = users.findIndex((u: any) => u.id === userId);

        if (userIndex !== -1) {
          users[userIndex].credits = (users[userIndex].credits || 0) + amount;
          setStorageData("pedalnepal_users", users);
          return { success: true, user: users[userIndex] };
        }

        return { error: "User not found" };
      }
    } else {
      const users = getStorageData("pedalnepal_users") || [];
      const userIndex = users.findIndex((u: any) => u.id === userId);

      if (userIndex !== -1) {
        users[userIndex].credits = (users[userIndex].credits || 0) + amount;
        setStorageData("pedalnepal_users", users);
        return { success: true, user: users[userIndex] };
      }

      return { error: "User not found" };
    }
  },

  // Get customer users
  getCustomerUsers: async (filters?: {
    search?: string;
    status?: string;
    role?: string;
    page?: number;
    limit?: number;
  }) => {
    if (USE_EXTERNAL_API) {
      try {
        const queryParams = new URLSearchParams();
        if (filters?.search) queryParams.append("search", filters.search);
        if (filters?.status) queryParams.append("status", filters.status);
        if (filters?.role) queryParams.append("role", filters.role);
        if (filters?.page) queryParams.append("page", filters.page.toString());
        if (filters?.limit) queryParams.append("limit", filters.limit.toString());
        
        const endpoint = `/user/customer-users${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
        const response = await externalApiCall(endpoint, { method: "GET" });
        return response;
      } catch (error) {
        console.log("External customer users API failed, using localStorage fallback");
        // Check if it's a CORS error
        if (error.message === "CORS_ERROR") {
          console.log("CORS error detected, using localStorage fallback");
        }
        // Fallback to localStorage
        let users = getStorageData("pedalnepal_users") || [];
        
        // If no users in localStorage, create some default data
        if (users.length === 0) {
          console.log("No users in localStorage, creating default data");
          const defaultUsers = [
            { id: "1", name: "Samir", email: "samir@example.com", role: "user", status: "ACTIVE" },
            { id: "2", name: "John Doe", email: "john@example.com", role: "user", status: "ACTIVE" },
            { id: "3", name: "Admin User", email: "admin@example.com", role: "admin", status: "ACTIVE" }
          ];
          setStorageData("pedalnepal_users", defaultUsers);
          users = defaultUsers;
        }
        
        users = users.filter((u: any) => u.role === "user");
        
        if (filters?.search) {
          users = users.filter((u: any) => 
            u.name.toLowerCase().includes(filters.search!.toLowerCase()) ||
            u.email.toLowerCase().includes(filters.search!.toLowerCase())
          );
        }
        
        return { users, total: users.length, success: true };
      }
    } else {
      let users = getStorageData("pedalnepal_users") || [];
      users = users.filter((u: any) => u.role === "user");
      
      if (filters?.search) {
        users = users.filter((u: any) => 
          u.name.toLowerCase().includes(filters.search!.toLowerCase()) ||
          u.email.toLowerCase().includes(filters.search!.toLowerCase())
        );
      }
      
      return { users, total: users.length };
    }
  },

  // Get admin users
  getAdminUsers: async (filters?: {
    search?: string;
    status?: string;
    role?: string;
    page?: number;
    limit?: number;
  }) => {
    if (USE_EXTERNAL_API) {
      try {
        const queryParams = new URLSearchParams();
        if (filters?.search) queryParams.append("search", filters.search);
        if (filters?.status) queryParams.append("status", filters.status);
        if (filters?.role) queryParams.append("role", filters.role);
        if (filters?.page) queryParams.append("page", filters.page.toString());
        if (filters?.limit) queryParams.append("limit", filters.limit.toString());
        
        const endpoint = `/user/admin-users${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
        const response = await externalApiCall(endpoint, { method: "GET" });
        return response;
      } catch (error) {
        console.log("External admin users API failed, using localStorage fallback");
        // Check if it's a CORS error
        if (error.message === "CORS_ERROR") {
          console.log("CORS error detected, using localStorage fallback");
        }
        // Fallback to localStorage
        let users = getStorageData("pedalnepal_users") || [];
        
        // If no users in localStorage, create some default data
        if (users.length === 0) {
          console.log("No users in localStorage, creating default data");
          const defaultUsers = [
            { id: "1", name: "Samir", email: "samir@example.com", role: "user", status: "ACTIVE" },
            { id: "2", name: "John Doe", email: "john@example.com", role: "user", status: "ACTIVE" },
            { id: "3", name: "Admin User", email: "admin@example.com", role: "admin", status: "ACTIVE" }
          ];
          setStorageData("pedalnepal_users", defaultUsers);
          users = defaultUsers;
        }
        
        users = users.filter((u: any) => u.role === "admin");
        
        if (filters?.search) {
          users = users.filter((u: any) => 
            u.name.toLowerCase().includes(filters.search!.toLowerCase()) ||
            u.email.toLowerCase().includes(filters.search!.toLowerCase())
          );
        }
        
        return { users, total: users.length, success: true };
      }
    } else {
      let users = getStorageData("pedalnepal_users") || [];
      users = users.filter((u: any) => u.role === "admin");
      
      if (filters?.search) {
        users = users.filter((u: any) => 
          u.name.toLowerCase().includes(filters.search!.toLowerCase()) ||
          u.email.toLowerCase().includes(filters.search!.toLowerCase())
        );
      }
      
      return { users, total: users.length };
    }
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
    serviceId: number;
    status: string;
    duration: number;
  }) => {
    if (USE_EXTERNAL_API) {
      try {
        const response = await externalApiCall("/rentals", {
          method: "POST",
          body: JSON.stringify({
            user_id: rentalData.userId,
            service_id: rentalData.serviceId,
            status: rentalData.status,
            duration: rentalData.duration
          }),
        });
        return response;
      } catch (error) {
        console.log("External rental create API failed, using localStorage fallback");
        // Fallback to localStorage
        const rentals = getStorageData("pedalnepal_rentals") || [];
        const newRental = {
          id: (rentals.length + 1).toString(),
          ...rentalData,
          startTime: new Date().toISOString(),
          status: "ACTIVE",
        };

        rentals.push(newRental);
        setStorageData("pedalnepal_rentals", rentals);

        return { success: true, rental: newRental };
      }
    } else {
      const rentals = getStorageData("pedalnepal_rentals") || [];
      const newRental = {
        id: (rentals.length + 1).toString(),
        ...rentalData,
        startTime: new Date().toISOString(),
        status: "ACTIVE",
      };

      rentals.push(newRental);
      setStorageData("pedalnepal_rentals", rentals);

      return { success: true, rental: newRental };
    }
  },

  // Get rentals with filters and pagination
  getRentals: async (filters?: {
    service_id?: number;
    status?: string;
    page?: number;
    limit?: number;
  }) => {
    if (USE_EXTERNAL_API) {
      try {
        const queryParams = new URLSearchParams();
        if (filters?.service_id) queryParams.append("service_id", filters.service_id.toString());
        if (filters?.status) queryParams.append("status", filters.status);
        if (filters?.page) queryParams.append("page", filters.page.toString());
        if (filters?.limit) queryParams.append("limit", filters.limit.toString());
        
        const endpoint = `/rentals${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
        const response = await externalApiCall(endpoint, { method: "GET" });
        return response;
      } catch (error) {
        console.log("External rentals API failed, using localStorage fallback");
        // Fallback to localStorage
        let rentals = getStorageData("pedalnepal_rentals") || [];

        if (filters?.service_id) {
          rentals = rentals.filter((rental: any) => rental.serviceId === filters.service_id);
        }
        if (filters?.status) {
          rentals = rentals.filter((rental: any) => rental.status === filters.status);
        }

        const page = filters?.page || 1;
        const limit = filters?.limit || 10;
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedRentals = rentals.slice(startIndex, endIndex);

        return {
          rentals: paginatedRentals,
          total: rentals.length,
          page,
          limit,
          totalPages: Math.ceil(rentals.length / limit)
        };
      }
    } else {
      let rentals = getStorageData("pedalnepal_rentals") || [];

      if (filters?.service_id) {
        rentals = rentals.filter((rental: any) => rental.serviceId === filters.service_id);
      }
      if (filters?.status) {
        rentals = rentals.filter((rental: any) => rental.status === filters.status);
      }

      const page = filters?.page || 1;
      const limit = filters?.limit || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedRentals = rentals.slice(startIndex, endIndex);

      return {
        rentals: paginatedRentals,
        total: rentals.length,
        page,
        limit,
        totalPages: Math.ceil(rentals.length / limit)
      };
    }
  },

  // Complete rental
  complete: async (rentalId: string, remarks?: string) => {
    if (USE_EXTERNAL_API) {
      try {
        const response = await externalApiCall(`/rentals/${rentalId}/complete`, {
          method: "PATCH",
          body: JSON.stringify({ remarks: remarks || "Rental completed successfully" }),
        });
        return response;
      } catch (error) {
        console.log("External rental complete API failed, using localStorage fallback");
        // Fallback to localStorage
        const rentals = getStorageData("pedalnepal_rentals") || [];
        const rentalIndex = rentals.findIndex((r: any) => r.id === rentalId);

        if (rentalIndex !== -1) {
          rentals[rentalIndex].status = "COMPLETED";
          rentals[rentalIndex].endTime = new Date().toISOString();
          rentals[rentalIndex].remarks = remarks || "Rental completed successfully";
          setStorageData("pedalnepal_rentals", rentals);
          return { success: true, rental: rentals[rentalIndex] };
        }

        return { error: "Rental not found" };
      }
    } else {
      const rentals = getStorageData("pedalnepal_rentals") || [];
      const rentalIndex = rentals.findIndex((r: any) => r.id === rentalId);

      if (rentalIndex !== -1) {
        rentals[rentalIndex].status = "COMPLETED";
        rentals[rentalIndex].endTime = new Date().toISOString();
        rentals[rentalIndex].remarks = remarks || "Rental completed successfully";
        setStorageData("pedalnepal_rentals", rentals);
        return { success: true, rental: rentals[rentalIndex] };
      }

      return { error: "Rental not found" };
    }
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
          body: JSON.stringify({
            name: stationData.name,
            latitude: 27.7138, // Default Kathmandu coordinates
            longitude: 85.3444,
            address: stationData.location,
            status: stationData.status,
            totalCapacity: stationData.capacity
          }),
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

  // Get all stations services details
  getAllStationsServicesDetails: async (filters?: {
    stationId?: string;
    status?: string;
    service?: string;
  }) => {
    if (USE_EXTERNAL_API) {
      try {
        const queryParams = new URLSearchParams();
        if (filters?.stationId) queryParams.append("stationId", filters.stationId);
        if (filters?.status) queryParams.append("status", filters.status);
        if (filters?.service) queryParams.append("service", filters.service);
        
        const endpoint = `/stations/all-stations-services-details${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
        const response = await externalApiCall(endpoint, { method: "GET" });
        return response;
      } catch (error) {
        console.log("External stations services details API failed, using localStorage fallback");
        // Fallback to localStorage
        const stations = getStorageData("pedalnepal_stations") || [];
        const services = getStorageData("pedalnepal_services") || [];
        
        return {
          stations: stations.map((station: any) => ({
            ...station,
            services: services.filter((service: any) => service.stationId === station.id)
          }))
        };
      }
    } else {
      const stations = getStorageData("pedalnepal_stations") || [];
      const services = getStorageData("pedalnepal_services") || [];
      
      return {
        stations: stations.map((station: any) => ({
          ...station,
          services: services.filter((service: any) => service.stationId === station.id)
        }))
      };
    }
  },

  // Get all stations services status
  getAllStationsServicesStatus: async (filters?: {
    status?: string;
    service?: string;
  }) => {
    if (USE_EXTERNAL_API) {
      try {
        const queryParams = new URLSearchParams();
        if (filters?.status) queryParams.append("status", filters.status);
        if (filters?.service) queryParams.append("service", filters.service);
        
        const endpoint = `/stations/all-stations-services-status${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
        const response = await externalApiCall(endpoint, { method: "GET" });
        return response;
      } catch (error) {
        console.log("External stations services status API failed, using localStorage fallback");
        // Fallback to localStorage
        const stations = getStorageData("pedalnepal_stations") || [];
        const services = getStorageData("pedalnepal_services") || [];
        
        return {
          stations: stations.map((station: any) => ({
            id: station.id,
            name: station.name,
            status: station.status,
            servicesCount: services.filter((service: any) => service.stationId === station.id).length
          }))
        };
      }
    } else {
      const stations = getStorageData("pedalnepal_stations") || [];
      const services = getStorageData("pedalnepal_services") || [];
      
      return {
        stations: stations.map((station: any) => ({
          id: station.id,
          name: station.name,
          status: station.status,
          servicesCount: services.filter((service: any) => service.stationId === station.id).length
        }))
      };
    }
  },

  // List stations with search and pagination
  list: async (filters?: {
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) => {
    if (USE_EXTERNAL_API) {
      try {
        const queryParams = new URLSearchParams();
        if (filters?.search) queryParams.append("search", filters.search);
        if (filters?.status) queryParams.append("status", filters.status);
        if (filters?.page) queryParams.append("page", filters.page.toString());
        if (filters?.limit) queryParams.append("limit", filters.limit.toString());
        
        const endpoint = `/stations/list${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
        const response = await externalApiCall(endpoint, { method: "GET" });
        return response;
      } catch (error) {
        console.log("External stations list API failed, using localStorage fallback");
        // Fallback to localStorage
        let stations = getStorageData("pedalnepal_stations") || [];
        
        if (filters?.search) {
          stations = stations.filter((station: any) => 
            station.name.toLowerCase().includes(filters.search!.toLowerCase()) ||
            station.location.toLowerCase().includes(filters.search!.toLowerCase())
          );
        }
        
        if (filters?.status) {
          stations = stations.filter((station: any) => station.status === filters.status);
        }
        
        const page = filters?.page || 1;
        const limit = filters?.limit || 10;
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedStations = stations.slice(startIndex, endIndex);
        
        return {
          stations: paginatedStations,
          total: stations.length,
          page,
          limit,
          totalPages: Math.ceil(stations.length / limit)
        };
      }
    } else {
      let stations = getStorageData("pedalnepal_stations") || [];
      
      if (filters?.search) {
        stations = stations.filter((station: any) => 
          station.name.toLowerCase().includes(filters.search!.toLowerCase()) ||
          station.location.toLowerCase().includes(filters.search!.toLowerCase())
        );
      }
      
      if (filters?.status) {
        stations = stations.filter((station: any) => station.status === filters.status);
      }
      
      const page = filters?.page || 1;
      const limit = filters?.limit || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedStations = stations.slice(startIndex, endIndex);
      
      return {
        stations: paginatedStations,
        total: stations.length,
        page,
        limit,
        totalPages: Math.ceil(stations.length / limit)
      };
    }
  },

  // Get slot statistics
  getSlotStats: async (stationId?: string) => {
    if (USE_EXTERNAL_API) {
      try {
        const queryParams = new URLSearchParams();
        if (stationId) queryParams.append("stationId", stationId);
        
        const endpoint = `/stations/slot-stats${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
        const response = await externalApiCall(endpoint, { method: "GET" });
        return response;
      } catch (error) {
        console.log("External slot stats API failed, using localStorage fallback");
        // Fallback to localStorage
        const slotsKey = stationId ? `pedalnepal_slots_${stationId}` : null;
        if (slotsKey) {
          const slots = getStorageData(slotsKey) || [];
          return {
            totalSlots: slots.length,
            availableSlots: slots.filter((slot: any) => slot.status === "active").length,
            occupiedSlots: slots.filter((slot: any) => slot.status === "occupied").length,
            maintenanceSlots: slots.filter((slot: any) => slot.status === "in-maintenance").length,
            reservedSlots: slots.filter((slot: any) => slot.status === "reserved").length
          };
        }
        return { totalSlots: 0, availableSlots: 0, occupiedSlots: 0, maintenanceSlots: 0, reservedSlots: 0 };
      }
    } else {
      const slotsKey = stationId ? `pedalnepal_slots_${stationId}` : null;
      if (slotsKey) {
        const slots = getStorageData(slotsKey) || [];
        return {
          totalSlots: slots.length,
          availableSlots: slots.filter((slot: any) => slot.status === "active").length,
          occupiedSlots: slots.filter((slot: any) => slot.status === "occupied").length,
          maintenanceSlots: slots.filter((slot: any) => slot.status === "in-maintenance").length,
          reservedSlots: slots.filter((slot: any) => slot.status === "reserved").length
        };
      }
      return { totalSlots: 0, availableSlots: 0, occupiedSlots: 0, maintenanceSlots: 0, reservedSlots: 0 };
    }
  },

  // Change slot status
  changeSlotStatus: async (slotId: number, newStatus: string) => {
    if (USE_EXTERNAL_API) {
      try {
        const response = await externalApiCall("/stations/change-slot-status", {
          method: "PATCH",
          body: JSON.stringify({ slot_id: slotId, new_status: newStatus }),
        });
        return response;
      } catch (error) {
        console.log("External slot status change API failed, using localStorage fallback");
        // Fallback to localStorage
        return { success: true, message: "Slot status changed locally" };
      }
    } else {
      return { success: true, message: "Slot status changed locally" };
    }
  },

  // Update station
  update: async (id: string, updateData: {
    name?: string;
    fileKey?: string;
    latitude?: number;
    longitude?: number;
    address?: string;
    status?: string;
    totalCapacity?: number;
  }) => {
    if (USE_EXTERNAL_API) {
      try {
        const response = await externalApiCall(`/stations/${id}`, {
          method: "PATCH",
          body: JSON.stringify(updateData),
        });
        return response;
      } catch (error) {
        console.log("External station update API failed, using localStorage fallback");
        // Fallback to localStorage
        const stations = getStorageData("pedalnepal_stations") || [];
        const stationIndex = stations.findIndex((s: any) => s.id === id);

        if (stationIndex !== -1) {
          stations[stationIndex] = { ...stations[stationIndex], ...updateData };
          setStorageData("pedalnepal_stations", stations);
          return { success: true, station: stations[stationIndex] };
        }

        return { error: "Station not found" };
      }
    } else {
      const stations = getStorageData("pedalnepal_stations") || [];
      const stationIndex = stations.findIndex((s: any) => s.id === id);

      if (stationIndex !== -1) {
        stations[stationIndex] = { ...stations[stationIndex], ...updateData };
        setStorageData("pedalnepal_stations", stations);
        return { success: true, station: stations[stationIndex] };
      }

      return { error: "Station not found" };
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
          body: JSON.stringify({
            stationId: serviceData.stationId,
            slot_id: 1, // Default slot
            serviceType: serviceData.serviceType,
            status: serviceData.status,
            brand: serviceData.name,
            hourly_rate: 5.0,
            daily_rate: 25.00,
            description: `${serviceData.name} rental service`
          }),
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

  // Sync user data across devices
  (window as any).syncUserData = async (userId: string) => {
    try {
      console.log("Syncing user data for user ID:", userId);
      const syncedUser = await syncUserData(userId);
      
      if (syncedUser) {
        console.log("✅ User data synced successfully:", syncedUser);
        alert(`User data synced! Credits: ${syncedUser.credits}`);
        // Refresh the page to show updated data
        window.location.reload();
      } else {
        console.log("❌ Failed to sync user data");
        alert("Failed to sync user data. Check console for details.");
      }
    } catch (error) {
      console.error("❌ User data sync failed:", error);
      alert("Failed to sync user data. Check console for details.");
    }
  };

  // Fix credit synchronization issue
  (window as any).fixCreditSync = async () => {
    try {
      console.log("Fixing credit synchronization...");
      
      // Get current user from localStorage
      const currentUser = JSON.parse(localStorage.getItem("pedalnepal_current_user") || "{}");
      if (!currentUser.id) {
        alert("No current user found. Please log in first.");
        return;
      }
      
      console.log("Current user:", currentUser);
      
      // Try to sync with external API
      if (USE_EXTERNAL_API) {
        try {
          const externalUser = await externalApiCall(`/users/profile?userId=${currentUser.id}`, {
            method: "GET",
          });
          
          if (externalUser && externalUser.credits !== undefined) {
            // Update localStorage with external credits
            const users = getStorageData("pedalnepal_users") || [];
            const userIndex = users.findIndex((u: any) => u.id === currentUser.id);
            
            if (userIndex !== -1) {
              users[userIndex].credits = externalUser.credits;
              setStorageData("pedalnepal_users", users);
              
              // Update current user
              currentUser.credits = externalUser.credits;
              localStorage.setItem("pedalnepal_current_user", JSON.stringify(currentUser));
              
              console.log("✅ Credits synced from external API:", externalUser.credits);
              alert(`Credits synced! New balance: ${externalUser.credits}`);
              window.location.reload();
              return;
            }
          }
        } catch (error) {
          console.log("External API sync failed, using localStorage data");
        }
      }
      
      // If external sync fails, show current data
      console.log("Current credits in localStorage:", currentUser.credits);
      alert(`Current credits: ${currentUser.credits}`);
      
    } catch (error) {
      console.error("❌ Credit sync failed:", error);
      alert("Failed to sync credits. Check console for details.");
    }
  };

  // Test all new API integrations
  (window as any).testAllNewAPIs = async () => {
    console.log("🧪 Testing all new API integrations...");
    
    try {
      // Test User APIs
      console.log("\n=== Testing User APIs ===");
      const userPagination = await api.user.getPaginated(1, 5);
      console.log("User Pagination:", userPagination);
      
      const customerUsers = await api.user.getCustomerUsers({ search: "samir" });
      console.log("Customer Users:", customerUsers);
      
      const adminUsers = await api.user.getAdminUsers();
      console.log("Admin Users:", adminUsers);
      
      const allUsersStatus = await api.user.getAllUsersStatus();
      console.log("All Users Status:", allUsersStatus);
      
      // Test Station APIs
      console.log("\n=== Testing Station APIs ===");
      const stationList = await api.stations.list({ search: "Station", page: 1, limit: 5 });
      console.log("Station List:", stationList);
      
      const stationServicesDetails = await api.stations.getAllStationsServicesDetails();
      console.log("Station Services Details:", stationServicesDetails);
      
      const stationServicesStatus = await api.stations.getAllStationsServicesStatus();
      console.log("Station Services Status:", stationServicesStatus);
      
      const slotStats = await api.stations.getSlotStats("1");
      console.log("Slot Stats:", slotStats);
      
      // Test Rental APIs
      console.log("\n=== Testing Rental APIs ===");
      const rentals = await api.rental.getRentals({ page: 1, limit: 5 });
      console.log("Rentals:", rentals);
      
      // Test existing APIs
      console.log("\n=== Testing Existing APIs ===");
      const stations = await api.stations.getAll();
      console.log("Stations:", stations);
      
      const services = await api.services.getAll();
      console.log("Services:", services);
      
      const s3Url = await api.aws.getS3PresignedUrl("test.jpg", "image/jpeg");
      console.log("S3 URL:", s3Url);
      
      console.log("\n✅ All API tests completed successfully!");
      alert("All API tests completed! Check console for details.");
      
    } catch (error) {
      console.error("❌ API test failed:", error);
      alert("API test failed! Check console for details.");
    }
  };

  // Test external API for all new endpoints
  (window as any).testExternalAllAPIs = async () => {
    console.log("🌐 Testing external API for all new endpoints...");
    
    try {
      const baseUrl = EXTERNAL_API_BASE_URL;
      const endpoints = [
        { url: `${baseUrl}/user?page=1&limit=5`, method: "GET", name: "User Pagination" },
        { url: `${baseUrl}/user/customer-users`, method: "GET", name: "Customer Users" },
        { url: `${baseUrl}/user/admin-users`, method: "GET", name: "Admin Users" },
        { url: `${baseUrl}/user/all-users-status`, method: "GET", name: "All Users Status" },
        { url: `${baseUrl}/stations/list?page=1&limit=5`, method: "GET", name: "Station List" },
        { url: `${baseUrl}/stations/all-stations-services-details`, method: "GET", name: "Station Services Details" },
        { url: `${baseUrl}/stations/all-stations-services-status`, method: "GET", name: "Station Services Status" },
        { url: `${baseUrl}/stations/slot-stats`, method: "GET", name: "Slot Stats" },
        { url: `${baseUrl}/rentals?page=1&limit=5`, method: "GET", name: "Rentals" },
      ];
      
      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint.url, {
            method: endpoint.method,
            headers: { "Content-Type": "application/json" },
          });
          console.log(`${endpoint.name}: ${response.status} ${response.statusText}`);
        } catch (error) {
          console.log(`${endpoint.name}: Failed - ${error}`);
        }
      }
      
      console.log("✅ External API tests completed!");
      alert("External API tests completed! Check console for details.");
      
    } catch (error) {
      console.error("❌ External API test failed:", error);
      alert("External API test failed! Check console for details.");
    }
  };
}
