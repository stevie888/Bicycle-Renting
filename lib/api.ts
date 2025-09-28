"use client";

// Configuration to enable/disable external API
// Check if running on external server (13.204.148.32) or localhost
const isExternalServer = typeof window !== 'undefined' && window.location.hostname === '13.204.148.32';
const USE_EXTERNAL_API = process.env.NEXT_PUBLIC_USE_EXTERNAL_API === "true" || isExternalServer;

// Debug logging
console.log("🔧 API Configuration Debug:");
console.log("Hostname:", typeof window !== 'undefined' ? window.location.hostname : 'server-side');
console.log("Is External Server:", isExternalServer);
console.log("NEXT_PUBLIC_USE_EXTERNAL_API:", process.env.NEXT_PUBLIC_USE_EXTERNAL_API);
console.log("NEXT_PUBLIC_EXTERNAL_API_BASE_URL:", process.env.NEXT_PUBLIC_EXTERNAL_API_BASE_URL);
console.log("USE_EXTERNAL_API:", USE_EXTERNAL_API);

// External API configuration
const EXTERNAL_API_BASE_URL =
  process.env.NEXT_PUBLIC_EXTERNAL_API_BASE_URL || "http://13.204.148.32/api";

console.log("EXTERNAL_API_BASE_URL:", EXTERNAL_API_BASE_URL);

// Enhanced API call with timeout, retry logic, and better error handling
async function externalApiCall(endpoint: string, options: RequestInit = {}, retries = 3) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

  try {
    const url = `${EXTERNAL_API_BASE_URL}${endpoint}`;
    console.log("🌐 Making external API call to:", url);
    console.log("Request options:", { method: options.method, body: options.body });

    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      mode: "cors",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    console.log("📡 External API response status:", response.status);
    console.log("📡 External API response headers:", Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ External API error response:", errorText);
      throw new Error(`External API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log("✅ External API response data:", data);
    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if ((error as Error).name === 'AbortError') {
      console.error("⏰ External API call timed out after 10 seconds");
      throw new Error("External API request timed out");
    }
    
    if (retries > 0) {
      console.log(`🔄 Retrying external API call (${retries} attempts left)...`);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
      return externalApiCall(endpoint, options, retries - 1);
    }
    
    console.error("❌ External API call failed after all retries:", error);
    throw error as Error;
  }
}

// Authentication API calls
export const authAPI = {
  // Enhanced login with better error handling
  login: async (mobile: string, password: string) => {
    if (USE_EXTERNAL_API) {
      try {
        console.log("🔐 Attempting external login...");
        const response = await externalApiCall("/auth/login", {
          method: "POST",
          body: JSON.stringify({ mobile, password }),
        });

        if (response.success || response.user) {
          console.log("✅ External login successful");
          return response;
        }

        throw new Error("External login failed - invalid response");
      } catch (externalError) {
        console.error("❌ External API login failed:", (externalError as Error).message);
        throw externalError;
      }
    } else {
      throw new Error("External API not enabled - cannot login");
    }
  },

  // Signup user
  signup: async (userData: {
    mobile: string;
    email: string;
    name: string;
    password: string;
  }) => {
    if (USE_EXTERNAL_API) {
      try {
        console.log("📝 Attempting external signup...");
        const response = await externalApiCall("/auth/register", {
          method: "POST",
          body: JSON.stringify(userData),
        });

        if (response.success || response.user) {
          console.log("✅ External signup successful");
          return response;
        }

        throw new Error("External signup failed - invalid response");
      } catch (externalError) {
        console.error("❌ External API signup failed:", (externalError as Error).message);
        throw externalError;
      }
    } else {
      throw new Error("External API not enabled - cannot signup");
    }
  },
};

// User profile API calls
export const userAPI = {
  // Get user profile
  getProfile: async (userId: string) => {
    if (USE_EXTERNAL_API) {
      try {
        return await externalApiCall(`/users/profile?userId=${userId}`, {
          method: "GET",
        });
      } catch (error) {
        console.error("❌ External API failed:", (error as Error).message);
        throw error;
      }
    } else {
      throw new Error("External API not available - cannot get profile");
    }
  },

  // Get all users (admin only)
  getAll: async () => {
    if (USE_EXTERNAL_API) {
      try {
        return await externalApiCall("/admin/users", { method: "GET" });
      } catch (error) {
        console.error("❌ External API failed:", (error as Error).message);
        throw error;
      }
    } else {
      throw new Error("External API not enabled - cannot get users");
    }
  },

  // Get users with pagination
  getPaginated: async (page: number = 1, limit: number = 10) => {
    if (USE_EXTERNAL_API) {
      try {
        return await externalApiCall(`/admin/users?page=${page}&limit=${limit}`, {
          method: "GET",
        });
      } catch (error) {
        console.error("❌ External API failed:", (error as Error).message);
        throw error;
      }
    } else {
      throw new Error("External API not enabled - cannot get users");
    }
  },

  // Get current user
  getCurrent: async () => {
    if (USE_EXTERNAL_API) {
      try {
        // Try to get user info from localStorage first
        const localUser = localStorage.getItem('user');
        if (localUser) {
          console.log("✅ Using local user data");
          return JSON.parse(localUser);
        }
        
        // If no local user, try to get from API
        console.log("🌐 Attempting to fetch user from API...");
        return await externalApiCall("/user", { method: "GET" });
      } catch (error) {
        // External API is unreachable - this is expected in local development
        console.log("🌐 External API unavailable, using local storage");
        
        // Fallback: return null or empty user object
        return null;
      }
    } else {
      throw new Error("External API not enabled - cannot get current user");
    }
  },

  // Update user profile
  update: async (userId: string, userData: any) => {
    if (USE_EXTERNAL_API) {
      try {
        return await externalApiCall(`/users/${userId}`, {
          method: "PUT",
          body: JSON.stringify(userData),
        });
      } catch (error) {
        console.error("❌ External API failed:", (error as Error).message);
        throw error;
      }
    } else {
      throw new Error("External API not enabled - cannot update user");
    }
  },

  // Update user status
  updateStatus: async (userId: string, status: string) => {
    if (USE_EXTERNAL_API) {
      try {
        return await externalApiCall(`/users/${userId}/status`, {
          method: "PUT",
          body: JSON.stringify({ status }),
        });
      } catch (error) {
        console.error("❌ External API failed:", (error as Error).message);
        throw error;
      }
    } else {
      throw new Error("External API not enabled - cannot update status");
    }
  },

  // Deactivate user
  deactivate: async (userId: string) => {
    if (USE_EXTERNAL_API) {
      try {
        return await externalApiCall(`/users/${userId}/deactivate`, {
          method: "PUT",
        });
      } catch (error) {
        console.error("❌ External API failed:", (error as Error).message);
        throw error;
      }
    } else {
      throw new Error("External API not enabled - cannot deactivate user");
    }
  },

  // Change password
  changePassword: async (userId: string, oldPassword: string, newPassword: string) => {
    if (USE_EXTERNAL_API) {
      try {
        return await externalApiCall(`/users/${userId}/password`, {
          method: "PUT",
          body: JSON.stringify({ oldPassword, newPassword }),
        });
      } catch (error) {
        console.error("❌ External API failed:", (error as Error).message);
        throw error;
      }
    } else {
      throw new Error("External API not enabled - cannot change password");
    }
  },

  // Get all users status
  getAllStatus: async () => {
    if (USE_EXTERNAL_API) {
      try {
        return await externalApiCall("/admin/users/status", { method: "GET" });
      } catch (error) {
        console.error("❌ External API failed:", (error as Error).message);
        throw error;
      }
    } else {
      throw new Error("External API not enabled - cannot get users status");
    }
  },

  // Promote user to admin
  promote: async (userId: string) => {
    if (USE_EXTERNAL_API) {
      try {
        return await externalApiCall(`/users/${userId}/promote`, {
          method: "PUT",
        });
      } catch (error) {
        console.error("❌ External API failed:", (error as Error).message);
        throw error;
      }
    } else {
      throw new Error("External API not enabled - cannot promote user");
    }
  },

  // Demote admin to user
  demote: async (userId: string) => {
    if (USE_EXTERNAL_API) {
      try {
        return await externalApiCall(`/users/${userId}/demote`, {
          method: "PUT",
        });
      } catch (error) {
        console.error("❌ External API failed:", (error as Error).message);
        throw error;
      }
    } else {
      throw new Error("External API not enabled - cannot demote user");
    }
  },

  // Delete user
  delete: async (userId: string) => {
    if (USE_EXTERNAL_API) {
      try {
        return await externalApiCall(`/users/${userId}`, {
          method: "DELETE",
        });
      } catch (error) {
        console.error("❌ External API failed:", (error as Error).message);
        throw error;
      }
    } else {
      throw new Error("External API not enabled - cannot delete user");
    }
  },

  // Increase user balance
  increaseBalance: async (userId: string, amount: number) => {
    if (USE_EXTERNAL_API) {
      try {
        return await externalApiCall(`/users/${userId}/balance`, {
          method: "PUT",
          body: JSON.stringify({ amount }),
        });
      } catch (error) {
        console.error("❌ External API failed:", (error as Error).message);
        throw error;
      }
    } else {
      throw new Error("External API not enabled - cannot increase balance");
    }
  },

  // Get customer users
  getCustomers: async () => {
    if (USE_EXTERNAL_API) {
      try {
        return await externalApiCall("/admin/users/customers", { method: "GET" });
      } catch (error) {
        console.error("❌ External API failed:", (error as Error).message);
        throw error;
      }
    } else {
      throw new Error("External API not enabled - cannot get customers");
    }
  },

  // Get admin users
  getAdmins: async () => {
    if (USE_EXTERNAL_API) {
      try {
        return await externalApiCall("/admin/users/admins", { method: "GET" });
      } catch (error) {
        console.error("❌ External API failed:", (error as Error).message);
        throw error;
      }
    } else {
      throw new Error("External API not enabled - cannot get admins");
    }
  },
};

// Rental API calls
export const rentalAPI = {
  // Create rental
  create: async (rentalData: any) => {
    if (USE_EXTERNAL_API) {
      try {
        return await externalApiCall("/rentals", {
          method: "POST",
          body: JSON.stringify(rentalData),
        });
      } catch (error) {
        console.error("❌ External API failed:", (error as Error).message);
        throw error;
      }
    } else {
      throw new Error("External API not enabled - cannot create rental");
    }
  },

  // Get rentals
  getRentals: async (userId?: string) => {
    if (USE_EXTERNAL_API) {
      try {
        const endpoint = userId ? `/rentals?userId=${userId}` : "/rentals";
        return await externalApiCall(endpoint, { method: "GET" });
      } catch (error) {
        console.error("❌ External API failed:", (error as Error).message);
        throw error;
      }
    } else {
      throw new Error("External API not enabled - cannot get rentals");
    }
  },

  // Complete rental
  complete: async (rentalId: string) => {
    if (USE_EXTERNAL_API) {
      try {
        return await externalApiCall(`/rentals/${rentalId}/complete`, {
          method: "PUT",
        });
      } catch (error) {
        console.error("❌ External API failed:", (error as Error).message);
        throw error;
      }
    } else {
      throw new Error("External API not enabled - cannot complete rental");
    }
  },
};

// Station API calls
export const stationAPI = {
  // Create station
  create: async (stationData: any) => {
    if (USE_EXTERNAL_API) {
      try {
        return await externalApiCall("/stations", {
          method: "POST",
          body: JSON.stringify(stationData),
        });
      } catch (error) {
        console.error("❌ External API failed:", (error as Error).message);
        throw error;
      }
    } else {
      throw new Error("External API not enabled - cannot create station");
    }
  },

  // Get all stations
  getAll: async () => {
    if (USE_EXTERNAL_API) {
      try {
        return await externalApiCall("/stations", { method: "GET" });
      } catch (error) {
        console.error("❌ External API failed:", (error as Error).message);
        throw error;
      }
    } else {
      throw new Error("External API not enabled - cannot get stations");
    }
  },

  // Get station by ID
  getById: async (id: string) => {
    if (USE_EXTERNAL_API) {
      try {
        return await externalApiCall(`/stations/${id}`, { method: "GET" });
      } catch (error) {
        console.error("❌ External API failed:", (error as Error).message);
        throw error;
      }
    } else {
      throw new Error("External API not enabled - cannot get station");
    }
  },

  // Get all stations services details
  getAllStationsServicesDetails: async (filters?: {
    location?: string;
    serviceType?: string;
    status?: string;
  }) => {
    if (USE_EXTERNAL_API) {
      try {
        const queryParams = new URLSearchParams();
        if (filters?.location) queryParams.append("location", filters.location);
        if (filters?.serviceType) queryParams.append("serviceType", filters.serviceType);
        if (filters?.status) queryParams.append("status", filters.status);
        
        const endpoint = `/stations/services?${queryParams.toString()}`;
        return await externalApiCall(endpoint, { method: "GET" });
      } catch (error) {
        console.error("❌ External API failed:", (error as Error).message);
        throw error;
      }
    } else {
      throw new Error("External API not enabled - cannot get stations services");
    }
  },
};

// Service API calls
export const serviceAPI = {
  // Create service
  create: async (serviceData: any) => {
    if (USE_EXTERNAL_API) {
      try {
        return await externalApiCall("/services", {
          method: "POST",
          body: JSON.stringify(serviceData),
        });
      } catch (error) {
        console.error("❌ External API failed:", (error as Error).message);
        throw error;
      }
    } else {
      throw new Error("External API not enabled - cannot create service");
    }
  },

  // Get all services
  getAll: async () => {
    if (USE_EXTERNAL_API) {
      try {
        return await externalApiCall("/services", { method: "GET" });
      } catch (error) {
        console.error("❌ External API failed:", (error as Error).message);
        throw error;
      }
    } else {
      throw new Error("External API not enabled - cannot get services");
    }
  },

  // Get service by ID
  getById: async (id: string) => {
    if (USE_EXTERNAL_API) {
      try {
        return await externalApiCall(`/services/${id}`, { method: "GET" });
      } catch (error) {
        console.error("❌ External API failed:", (error as Error).message);
        throw error;
      }
    } else {
      throw new Error("External API not enabled - cannot get service");
    }
  },

  // Get services by station ID
  getByStationId: async (stationId: string) => {
    if (USE_EXTERNAL_API) {
      try {
        return await externalApiCall(`/services/station/${stationId}`, { method: "GET" });
      } catch (error) {
        console.error("❌ External API failed:", (error as Error).message);
        throw error;
      }
    } else {
      throw new Error("External API not enabled - cannot get services by station");
    }
  },
};

// Add global functions for debugging and data management
if (typeof window !== "undefined") {
  // Test external API connection
  (window as any).testExternalAPI = async () => {
    try {
      console.log("🧪 Testing external API connection...");
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
      alert(`External API test failed: ${(error as Error).message}`);
    }
  };

  // Show current API configuration
  (window as any).showAPIConfig = () => {
    console.log("=== API Configuration ===");
    console.log("External API URL:", EXTERNAL_API_BASE_URL);
    console.log("Use External API:", USE_EXTERNAL_API);
    console.log("Is External Server:", isExternalServer);
    console.log("Hostname:", window.location.hostname);
    console.log("Environment Variables:");
    console.log("- NEXT_PUBLIC_EXTERNAL_API_BASE_URL:", process.env.NEXT_PUBLIC_EXTERNAL_API_BASE_URL);
    console.log("- NEXT_PUBLIC_USE_EXTERNAL_API:", process.env.NEXT_PUBLIC_USE_EXTERNAL_API);
    console.log("========================");
  };

  // Clear all data (for testing)
  (window as any).clearAllData = () => {
    console.log("🗑️ Clearing all data...");
    localStorage.clear();
    sessionStorage.clear();
    console.log("✅ All data cleared");
    alert("All data cleared. Please refresh the page.");
  };
}
