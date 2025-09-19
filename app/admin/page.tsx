"use client";

// Force dynamic rendering to prevent prerendering issues
export const dynamic = "force-dynamic";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/AuthContext";
import { useLanguage } from "@/components/LanguageContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import ProtectedRoute from "@/components/ProtectedRoute";
import Card from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Modal from "@/components/ui/modal";
import {
  Users,
  Bike,
  MapPin,
  BarChart3,
  Plus,
  Search,
  CreditCard,
  Trash2,
  UserCheck,
  Activity,
  TrendingUp,
  TrendingDown,
  Edit,
  RefreshCw,
} from "lucide-react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
} from "chart.js";
import { Pie, Line } from "react-chartjs-2";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
);

interface DashboardStats {
  users: {
    totalUsers: number;
    adminUsers: number;
    regularUsers: number;
  };
  bicycles: {
    totalBicycles: number;
    availableBicycles: number;
    outOfStockBicycles: number;
  };
  rentals: {
    totalRentals: number;
    activeRentals: number;
    completedRentals: number;
    cancelledRentals: number;
  };
}

interface RecentActivity {
  users: any[];
  bicycles: any[];
  rentals: any[];
}

// Pie Chart Components
const BikeStatusPieChart = ({
  stats,
  t,
}: {
  stats: DashboardStats | null;
  t: (key: string) => string;
}) => {
  // Use the total bikes from stats (already calculated as stations * 10)
  const totalBikes = stats?.bicycles.totalBicycles || 0;

  const rentedBikes = stats?.rentals.activeRentals || 0;
  const availableBikes = Math.max(0, totalBikes - rentedBikes);
  const emptySlots = Math.max(0, totalBikes - availableBikes - rentedBikes);

  const data = {
    labels: [
      t("admin.rentedBikes"),
      t("admin.emptySlots"),
      t("admin.availableBikes"),
    ],
    datasets: [
      {
        data: [rentedBikes, emptySlots, availableBikes],
        backgroundColor: [
          "#ef4444", // Red for rented
          "#6b7280", // Gray for empty slots
          "#10b981", // Green for available
        ],
        borderColor: ["#dc2626", "#4b5563", "#059669"],
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          padding: 15,
          usePointStyle: true,
          font: {
            size: 11,
          },
        },
      },
      tooltip: {
        callbacks: {
          title: function (context: any) {
            return t("admin.bikeStatusTitle");
          },
          label: function (context: any) {
            const chart = context.chart;
            const labels = chart.data.labels;
            const values = chart.data.datasets[0].data;
            const total = values.reduce((a: number, b: number) => a + b, 0);

            // Return all data points
            return labels.map((label: string, index: number) => {
              const value = values[index];
              const percentage = ((value / total) * 100).toFixed(1);
              return `${label}: ${value} (${percentage}%)`;
            });
          },
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-4 border border-gray-100">
      <div className="flex items-center mb-4">
        <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl flex items-center justify-center mr-3">
          <Bike className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {t("admin.bikeStatusTitle")}
          </h3>
          <p className="text-sm text-gray-500">
            {t("admin.bikeStatusDescription")}
          </p>
        </div>
      </div>
      <div className="h-48">
        <Pie data={data} options={options} />
      </div>

      {/* Bike Inventory Summary */}
      <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
        <div className="text-center">
          <div className="font-semibold text-red-600">{rentedBikes}</div>
          <div className="text-gray-500">{t("admin.rented")}</div>
        </div>
        <div className="text-center">
          <div className="font-semibold text-gray-600">{emptySlots}</div>
          <div className="text-gray-500">{t("admin.empty")}</div>
        </div>
        <div className="text-center">
          <div className="font-semibold text-green-600">{availableBikes}</div>
          <div className="text-gray-500">{t("admin.available")}</div>
        </div>
      </div>
    </div>
  );
};

const UserActivityPieChart = ({
  stats,
  t,
}: {
  stats: DashboardStats | null;
  t: (key: string) => string;
}) => {
  // Calculate real-time active users (excluding logged out users)
  const activeSessions = JSON.parse(
    localStorage.getItem("pedalnepal_active_sessions") || "[]",
  );
  const inactiveSessions = JSON.parse(
    localStorage.getItem("pedalnepal_inactive_sessions") || "[]",
  );
  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

  const currentlyActiveUsers = activeSessions.filter((session: any) => {
    const isInactive = inactiveSessions.some(
      (inactiveSession: any) => inactiveSession.userId === session.userId,
    );

    // User is active if they have recent activity AND haven't logged out
    return !isInactive && new Date(session.lastActivity) > thirtyMinutesAgo;
  }).length;

  const data = {
    labels: [
      t("admin.activeUsers"),
      t("admin.returningUsers"),
      t("admin.newUsers"),
    ],
    datasets: [
      {
        data: [
          currentlyActiveUsers,
          Math.max(
            0,
            (stats?.users.totalUsers || 0) -
              (stats?.users.regularUsers || 0) -
              currentlyActiveUsers,
          ),
          stats?.users.regularUsers || 0,
        ],
        backgroundColor: [
          "#3b82f6", // Blue for active
          "#8b5cf6", // Purple for returning
          "#06b6d4", // Cyan for new
        ],
        borderColor: ["#2563eb", "#7c3aed", "#0891b2"],
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          padding: 15,
          usePointStyle: true,
          font: {
            size: 11,
          },
        },
      },
      tooltip: {
        callbacks: {
          title: function (context: any) {
            return t("admin.userActivityTitle");
          },
          label: function (context: any) {
            const chart = context.chart;
            const labels = chart.data.labels;
            const values = chart.data.datasets[0].data;
            const total = values.reduce((a: number, b: number) => a + b, 0);

            // Return all data points
            return labels.map((label: string, index: number) => {
              const value = values[index];
              const percentage = ((value / total) * 100).toFixed(1);
              return `${label}: ${value} (${percentage}%)`;
            });
          },
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-4 border border-gray-100">
      <div className="flex items-center mb-4">
        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mr-3">
          <Users className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {t("admin.userActivityTitle")}
          </h3>
          <p className="text-sm text-gray-500">
            {t("admin.userActivityDescription")}
          </p>
        </div>
      </div>
      <div className="h-48">
        <Pie data={data} options={options} />
      </div>
    </div>
  );
};

function AdminDashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recent, setRecent] = useState<RecentActivity | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "overview" | "users" | "bicycles" | "reviews"
  >("overview");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [lastRefresh, setLastRefresh] = useState(Date.now());

  // Function to get active user count for display
  const getActiveUserCount = () => {
    const activeSessions = JSON.parse(
      localStorage.getItem("pedalnepal_active_sessions") || "[]",
    );
    const inactiveSessions = JSON.parse(
      localStorage.getItem("pedalnepal_inactive_sessions") || "[]",
    );
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

    // Filter out users who have logged out
    const activeUsers = activeSessions.filter((session: any) => {
      const isInactive = inactiveSessions.some(
        (inactiveSession: any) => inactiveSession.userId === session.userId,
      );

      // User is active if they have recent activity AND haven't logged out
      return !isInactive && new Date(session.lastActivity) > thirtyMinutesAgo;
    });

    return activeUsers.length;
  };

  // Function to ensure proper rental data exists
  const ensureRentalData = () => {
    const existingRentals = JSON.parse(
      localStorage.getItem("pedalnepal_rentals") || "[]",
    );
    const users = JSON.parse(localStorage.getItem("pedalnepal_users") || "[]");

    // Find Samir's user ID
    const samir = users.find((u: any) => u.name === "Samir");
    if (!samir) return;

    // Check if we have proper rental data for Samir
    const samirRentals = existingRentals.filter(
      (r: any) => r.userId === samir.id,
    );

    if (samirRentals.length === 0) {
      // Create proper rental data for Samir
      const newRentals = [
        {
          id: "1",
          userId: samir.id,
          bicycleId: "3",
          startTime: "2024-01-15T10:00:00Z",
          endTime: "2024-01-15T12:30:00Z", // 2.5 hours
          status: "completed",
          totalCost: 360,
          price: 75,
          station: "Station 1",
          bikeName: "Station 1",
          slotNumber: 1,
        },
        {
          id: "2",
          userId: samir.id,
          bicycleId: "1",
          startTime: "2024-01-16T14:00:00Z",
          endTime: "2024-01-16T15:30:00Z", // 1.5 hours
          status: "completed",
          totalCost: 300,
          price: 75,
          station: "Station 1",
          bikeName: "Station 1",
          slotNumber: 2,
        },
        {
          id: "3",
          userId: samir.id,
          bicycleId: "2",
          startTime: "2024-01-17T09:00:00Z",
          endTime: "2024-01-17T10:00:00Z", // 1 hour
          status: "completed",
          totalCost: 200,
          price: 75,
          station: "Station 1",
          bikeName: "Station 1",
          slotNumber: 3,
        },
        {
          id: "4",
          userId: samir.id,
          bicycleId: "3",
          startTime: "2024-01-18T16:00:00Z",
          endTime: "2024-01-18T17:00:00Z", // 1 hour
          status: "completed",
          totalCost: 200,
          price: 75,
          station: "Station 1",
          bikeName: "Station 1",
          slotNumber: 4,
        },
      ];

      // Add new rentals to existing ones
      const updatedRentals = [...existingRentals, ...newRentals];
      localStorage.setItem(
        "pedalnepal_rentals",
        JSON.stringify(updatedRentals),
      );
      console.log("Created rental data for Samir with 6 hours total duration");
    }
  };

  // Add global test function to window object
  if (typeof window !== "undefined") {
    (window as any).testDurationCalculation = () => {
      const rentals = JSON.parse(
        localStorage.getItem("pedalnepal_rentals") || "[]",
      );
      const users = JSON.parse(
        localStorage.getItem("pedalnepal_users") || "[]",
      );
      const samir = users.find((u: any) => u.name === "Samir");

      if (!samir) {
        console.log("Samir user not found");
        return;
      }

      const samirRentals = rentals.filter((r: any) => r.userId === samir.id);
      console.log("Samir rentals:", samirRentals);

      let totalDuration = 0;
      samirRentals.forEach((rental: any) => {
        if (rental.startTime) {
          const start = new Date(rental.startTime);
          let end: Date;

          if (rental.endTime) {
            end = new Date(rental.endTime);
            const duration = end.getTime() - start.getTime();
            const hours = duration / (1000 * 60 * 60);
            console.log(
              `Completed rental ${rental.id}: ${hours.toFixed(2)} hours`,
            );
            totalDuration += duration;
          } else if (rental.status === "active") {
            end = new Date();
            const duration = end.getTime() - start.getTime();
            const hours = duration / (1000 * 60 * 60);
            console.log(
              `Active rental ${rental.id}: ${hours.toFixed(2)} hours (ongoing)`,
            );
            totalDuration += duration;
          }
        }
      });

      const totalHours = Math.round(totalDuration / (1000 * 60 * 60));
      console.log(`Total duration for Samir: ${totalHours} hours`);

      return totalHours;
    };

    (window as any).createTestRental = () => {
      const users = JSON.parse(
        localStorage.getItem("pedalnepal_users") || "[]",
      );
      const samir = users.find((u: any) => u.name === "Samir");

      if (!samir) {
        console.log("Samir user not found");
        return;
      }

      const newRental = {
        id: Date.now().toString(),
        userId: samir.id,
        bikeId: "test-bike",
        startTime: new Date().toISOString(),
        status: "active",
        price: 0,
        duration: "pay-as-you-go",
        bikeName: "Test Bike",
        station: "Station 1",
        slotNumber: 1,
        payAsYouGo: true,
      };

      const existingRentals = JSON.parse(
        localStorage.getItem("pedalnepal_rentals") || "[]",
      );
      const updatedRentals = [...existingRentals, newRental];
      localStorage.setItem(
        "pedalnepal_rentals",
        JSON.stringify(updatedRentals),
      );

      console.log("Created test rental for Samir");
      console.log("New rental:", newRental);

      // Refresh the admin dashboard
      fetchDashboardData();
    };
  }

  // Check if user is admin, if not redirect to home
  useEffect(() => {
    if (!user) return; // Wait for user to load
    
    if (user.role !== "admin") {
      router.push("/");
      return;
    }

    if (user.role === "admin") {
      fetchDashboardData();
    }
  }, [user, router]);

  // Refresh data periodically and when window gains focus
  useEffect(() => {
    if (!user || user.role !== "admin") return;
    
    const interval = setInterval(() => {
      try {
        setLastRefresh(Date.now());
        fetchDashboardData();
      } catch (error) {
        console.error("Error in interval refresh:", error);
      }
    }, 30000); // Refresh every 30 seconds

    const handleFocus = () => {
      try {
        setLastRefresh(Date.now());
        fetchDashboardData();
      } catch (error) {
        console.error("Error in focus refresh:", error);
      }
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
    };
  }, [user]);

  // Handle URL parameters for tab navigation
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (
      tabParam &&
      ["overview", "users", "bicycles", "reviews"].includes(tabParam)
    ) {
      setActiveTab(tabParam as "overview" | "users" | "bicycles" | "reviews");
    }
  }, [searchParams]);

  // Debug: Log user state
  console.log("Admin page - User state:", { user, loading });

  // Show loading while checking user role
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg font-medium">
            {t("admin.loadingDashboard")}
          </p>
          <div className="mt-4 text-sm text-gray-500">
            <p>If this continues, please:</p>
            <p>1. <a href="/login" className="text-blue-600 hover:underline">Login first</a></p>
            <p>2. Make sure you have admin access</p>
            <p>3. Try refreshing the page</p>
          </div>
        </div>
      </div>
    );
  }

  // Show access denied for non-admin users
  if (user.role !== "admin") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="bg-white rounded-2xl shadow-2xl p-8 border border-red-100">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <UserCheck className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-red-600 mb-4">
              {t("admin.accessDenied")}
            </h1>
            <p className="text-gray-600 mb-6">{t("admin.noPermission")}</p>
            <Button
              onClick={() => router.push("/")}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              {t("admin.goToHome")}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const fetchDashboardData = async () => {
    try {
      console.log("Fetching dashboard data from localStorage...");
      setLoading(true);

      // Ensure proper rental data exists
      ensureRentalData();

      // Get data from localStorage
      const users = JSON.parse(
        localStorage.getItem("pedalnepal_users") || "[]",
      );
      const bicycles = JSON.parse(
        localStorage.getItem("pedalnepal_bicycles") || "[]",
      );
      const rentals = JSON.parse(
        localStorage.getItem("pedalnepal_rentals") || "[]",
      );

      // Update existing data to use proper station names
      const updatedBicycles = bicycles.map((bicycle: any, index: number) => {
        const stationNumber = (index % 3) + 1;
        const locations = ["Kathmandu", "Lalitpur", "Bhaktapur"];
        return {
          ...bicycle,
          name: `Station ${stationNumber}`,
          description: `Station ${stationNumber}`,
          location: locations[index % 3],
        };
      });

      // Initialize stations if they don't exist
      if (bicycles.length === 0) {
        const initialStations = [
          {
            id: "1",
            name: "Station 1",
            description: "Station 1",
            location: "Kathmandu",
            status: "available",
            hourlyRate: 25,
            dailyRate: 250,
            image: "/bicycle-placeholder.jpg",
            createdAt: new Date().toISOString(),
          },
          {
            id: "2",
            name: "Station 2",
            description: "Station 2",
            location: "Lalitpur",
            status: "available",
            hourlyRate: 25,
            dailyRate: 250,
            image: "/bicycle-placeholder.jpg",
            createdAt: new Date().toISOString(),
          },
          {
            id: "3",
            name: "Station 3",
            description: "Station 3",
            location: "Bhaktapur",
            status: "available",
            hourlyRate: 25,
            dailyRate: 250,
            image: "/bicycle-placeholder.jpg",
            createdAt: new Date().toISOString(),
          },
        ];
        localStorage.setItem(
          "pedalnepal_bicycles",
          JSON.stringify(initialStations),
        );
        updatedBicycles.push(...initialStations);
      } else {
        // Save updated bicycles back to localStorage
        localStorage.setItem(
          "pedalnepal_bicycles",
          JSON.stringify(updatedBicycles),
        );
      }

      // Calculate stats
      // Count unique stations instead of individual bikes
      const uniqueStations = new Set(updatedBicycles.map((b: any) => b.name));
      const totalStations = uniqueStations.size;
      const totalBikes = totalStations * 10; // 10 slots per station

      const stats: DashboardStats = {
        users: {
          totalUsers: users.length,
          adminUsers: users.filter((u: any) => u.role === "admin").length,
          regularUsers: users.filter((u: any) => u.role === "user").length,
        },
        bicycles: {
          totalBicycles: totalBikes, // Use calculated total instead of individual bike count
          availableBicycles: updatedBicycles.filter(
            (b: any) => b.status === "available",
          ).length,
          outOfStockBicycles: updatedBicycles.filter(
            (b: any) => b.status === "rented",
          ).length,
        },
        rentals: {
          totalRentals: rentals.length,
          activeRentals: rentals.filter((r: any) => r.status === "active")
            .length,
          completedRentals: rentals.filter((r: any) => r.status === "completed")
            .length,
          cancelledRentals: rentals.filter((r: any) => r.status === "cancelled")
            .length,
        },
      };

      // Get recent activity
      const recent: RecentActivity = {
        users: users.slice(-5).reverse(),
        bicycles: updatedBicycles.slice(-5).reverse(),
        rentals: rentals.slice(-5).reverse(),
      };

      console.log("Dashboard data calculated:", { stats, recent });

      setStats(stats);
      setRecent(recent);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = () => {
    router.push("/admin/add-user");
  };

  const handleAddStation = () => {
    router.push("/admin/add-station");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-12 bg-gradient-to-r from-blue-200 to-purple-200 rounded-2xl w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-48 bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-100"
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Mobile-Optimized Header */}
      <div className="bg-white/90 backdrop-blur-lg shadow-lg border-b border-gray-100 sticky top-0 z-20">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {t("admin.dashboard")}
                </h1>
                <p className="text-gray-600 text-xs">
                  {t("admin.managePaddleNepal")}
                </p>
              </div>
            </div>
            <div className="text-right">{/* Welcome greeting removed */}</div>
          </div>

          {/* Mobile Action Buttons */}
          <div className="flex space-x-2">
            <Button
              onClick={handleAddUser}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 px-4 rounded-xl shadow-lg text-sm font-medium"
            >
              <Plus className="w-4 h-4 mr-2" />
              {t("admin.addUser")}
            </Button>
            <Button
              onClick={handleAddStation}
              className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3 px-4 rounded-xl shadow-lg text-sm font-medium"
            >
              <Plus className="w-4 h-4 mr-2" />
              {t("admin.addStation")}
            </Button>
            <Button
              onClick={() => {
                try {
                  setLastRefresh(Date.now());
                  fetchDashboardData();
                } catch (error) {
                  console.error("Error in manual refresh:", error);
                }
              }}
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-3 px-4 rounded-xl shadow-lg text-sm font-medium"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile-Optimized Tab Navigation */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-20 z-10">
        <div className="px-4 py-2">
          <div className="flex space-x-1 bg-gray-100 rounded-xl p-1">
            {[
              { id: "overview", label: t("admin.overview"), icon: BarChart3 },
              { id: "users", label: t("admin.users"), icon: Users },
              { id: "bicycles", label: t("admin.stations"), icon: MapPin },
              { id: "reviews", label: t("admin.reviews"), icon: Activity },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium text-sm transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6">
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-4 text-white shadow-xl">
                <div className="text-center">
                  <div className="text-2xl font-bold mb-1">
                    {stats?.users.totalUsers || 0}
                  </div>
                  <div className="text-xs text-blue-100">
                    {t("admin.totalUsers")}
                  </div>
                  <div className="text-xs text-blue-200 mt-1">
                    {getActiveUserCount()} {t("admin.currentlyActive")}
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-4 text-white shadow-xl">
                <div className="text-center">
                  <div className="text-2xl font-bold mb-1">
                    {stats?.bicycles.totalBicycles || 0}
                  </div>
                  <div className="text-xs text-green-100">
                    {t("admin.totalBikes")}
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-4 text-white shadow-xl">
                <div className="text-center">
                  <div className="text-2xl font-bold mb-1">
                    {stats?.rentals.totalRentals || 0}
                  </div>
                  <div className="text-xs text-purple-100">
                    {t("admin.totalRentals")}
                  </div>
                </div>
              </div>
            </div>

            {/* Pie Charts Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <BikeStatusPieChart stats={stats} t={t} />
              <UserActivityPieChart stats={stats} t={t} />
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-500 to-gray-600 px-6 py-4">
                <h3 className="text-white font-semibold flex items-center">
                  <Activity className="w-5 h-5 mr-2" />
                  {t("admin.recentActivity")}
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {recent?.users.slice(0, 3).map((user: any) => (
                    <div
                      key={user.id}
                      className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl"
                    >
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">
                          {user.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {t("admin.newUserRegistered")}
                        </div>
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <UsersManagement refreshTrigger={refreshTrigger} />
        )}
        {activeTab === "bicycles" && (
          <StationsManagement refreshTrigger={refreshTrigger} />
        )}
        {activeTab === "reviews" && (
          <ReviewsManagement refreshTrigger={refreshTrigger} />
        )}
      </div>
    </div>
  );
}

// Users Management Component
function UsersManagement({ refreshTrigger }: { refreshTrigger: number }) {
  const { t } = useLanguage();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState("");
  const [showAddCreditsModal, setShowAddCreditsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [creditsToAdd, setCreditsToAdd] = useState(50);
  const [nameFilter, setNameFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Function to determine if user is currently active (using the system in real-time)
  const isUserActive = (user: any) => {
    // First check if user has explicitly logged out
    const inactiveSessions = JSON.parse(
      localStorage.getItem("pedalnepal_inactive_sessions") || "[]",
    );
    const userInactiveSession = inactiveSessions.find(
      (session: any) => session.userId === user.id,
    );

    // If user has logged out, they are immediately inactive
    if (userInactiveSession) {
      return false;
    }

    // Get active sessions from localStorage
    const activeSessions = JSON.parse(
      localStorage.getItem("pedalnepal_active_sessions") || "[]",
    );

    // Check if user has an active session (logged in within last 30 minutes)
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

    const userActiveSession = activeSessions.find((session: any) => {
      return (
        session.userId === user.id &&
        new Date(session.lastActivity) > thirtyMinutesAgo
      );
    });

    return !!userActiveSession;
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, refreshTrigger]);

  // Refresh user data every 30 seconds to show real-time active users
  useEffect(() => {
    const interval = setInterval(() => {
      fetchUsers();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // Get users from localStorage
      const allUsers = JSON.parse(
        localStorage.getItem("pedalnepal_users") || "[]",
      );
      const allRentals = JSON.parse(
        localStorage.getItem("pedalnepal_rentals") || "[]",
      );

      console.log("fetchUsers - allUsers:", allUsers);
      console.log("fetchUsers - allRentals:", allRentals);

      // Calculate real-time credits for each user based on rental history
      const usersWithUpdatedCredits = allUsers.map((user: any) => {
        const userRentals = allRentals.filter(
          (rental: any) => rental.userId === user.id,
        );
        const totalSpent = userRentals.reduce(
          (sum: number, rental: any) => sum + rental.price,
          0,
        );

        // Use the user's current credits if they exist, otherwise calculate from initialCredits
        // If initialCredits is not set, default to 250
        const initialCredits =
          user.initialCredits !== undefined ? user.initialCredits : 250;
        const currentCredits =
          user.credits !== undefined
            ? user.credits
            : Math.max(0, initialCredits - totalSpent);

        console.log(`User ${user.name}:`, {
          initialCredits,
          totalSpent,
          currentCredits,
          rentals: userRentals.length,
          userInitialCredits: user.initialCredits,
        });

        return {
          ...user,
          initialCredits: initialCredits, // Preserve the initialCredits
          credits: currentCredits,
          totalRentals: userRentals.length,
          totalSpent: totalSpent,
        };
      });

      // Apply filters
      let filteredUsers = usersWithUpdatedCredits;

      if (roleFilter) {
        filteredUsers = filteredUsers.filter(
          (user: any) => user.role === roleFilter,
        );
      }

      // Sort users to put admin users first
      const sortedUsers = [...filteredUsers].sort((a: any, b: any) => {
        if (a.role === 'admin' && b.role !== 'admin') return -1;
        if (a.role !== 'admin' && b.role === 'admin') return 1;
        return 0;
      });
      
      setUsers(sortedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      const users = JSON.parse(
        localStorage.getItem("pedalnepal_users") || "[]",
      );
      const updatedUsers = users.filter((user: any) => user.id !== userId);
      localStorage.setItem("pedalnepal_users", JSON.stringify(updatedUsers));

      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const promoteToAdmin = async (userId: string) => {
    if (!confirm("Are you sure you want to promote this user to admin?"))
      return;

    try {
      const users = JSON.parse(
        localStorage.getItem("pedalnepal_users") || "[]",
      );
      const updatedUsers = users.map((user: any) =>
        user.id === userId ? { ...user, role: "admin" } : user,
      );
      localStorage.setItem("pedalnepal_users", JSON.stringify(updatedUsers));

      fetchUsers();
    } catch (error) {
      console.error("Error promoting user:", error);
      alert("Failed to promote user");
    }
  };

  const demoteToUser = async (userId: string) => {
    if (!confirm("Are you sure you want to demote this admin to user?")) return;

    try {
      const users = JSON.parse(
        localStorage.getItem("pedalnepal_users") || "[]",
      );
      const updatedUsers = users.map((user: any) =>
        user.id === userId ? { ...user, role: "user" } : user,
      );
      localStorage.setItem("pedalnepal_users", JSON.stringify(updatedUsers));

      fetchUsers();
    } catch (error) {
      console.error("Error demoting user:", error);
      alert("Failed to demote user");
    }
  };

  const openAddCreditsModal = (user: any) => {
    setSelectedUser(user);
    setCreditsToAdd(50);
    setShowAddCreditsModal(true);
  };

  const addCredits = async () => {
    if (!selectedUser || creditsToAdd <= 0) return;

    try {
      console.log("Adding credits:", { selectedUser, creditsToAdd });

      // Get current data
      const users = JSON.parse(
        localStorage.getItem("pedalnepal_users") || "[]",
      );
      const allRentals = JSON.parse(
        localStorage.getItem("pedalnepal_rentals") || "[]",
      );

      // Find the user and calculate their current spending
      const userRentals = allRentals.filter(
        (rental: any) => rental.userId === selectedUser.id,
      );
      const totalSpent = userRentals.reduce(
        (sum: number, rental: any) => sum + rental.price,
        0,
      );
      const currentInitialCredits = selectedUser.initialCredits || 250;
      const newInitialCredits = currentInitialCredits + creditsToAdd;

      // Calculate new current credits: add the new credits directly to current balance
      const currentCredits = selectedUser.credits || 0;
      const newCurrentCredits = Math.max(0, currentCredits + creditsToAdd);

      console.log("Credit calculation:", {
        currentInitialCredits,
        newInitialCredits,
        currentCredits: selectedUser.credits || 0,
        newCurrentCredits,
        totalSpent,
        userRentals: userRentals.length,
      });

      // Update the user in the main users array
      const updatedUsers = users.map((user: any) =>
        user.id === selectedUser.id
          ? {
              ...user,
              initialCredits: newInitialCredits,
              credits: newCurrentCredits,
            }
          : user,
      );
      localStorage.setItem("pedalnepal_users", JSON.stringify(updatedUsers));

      console.log("Updated users in localStorage:", updatedUsers);
      console.log(
        "Updated user data:",
        updatedUsers.find((u: any) => u.id === selectedUser.id),
      );

      // Update current user if it's the same user
      const currentUser = JSON.parse(
        localStorage.getItem("pedalnepal_current_user") || "null",
      );
      if (currentUser && currentUser.id === selectedUser.id) {
        const updatedCurrentUser = {
          ...currentUser,
          initialCredits: newInitialCredits,
          credits: newCurrentCredits,
        };
        localStorage.setItem(
          "pedalnepal_current_user",
          JSON.stringify(updatedCurrentUser),
        );
        console.log("Updated current user:", updatedCurrentUser);
      }

      alert(
        `Successfully added ${creditsToAdd} credits to ${selectedUser.name}. New balance: ${newCurrentCredits} credits`,
      );
      setShowAddCreditsModal(false);
      setSelectedUser(null);

      // Refresh the users list immediately to show updated credits
      fetchUsers();
    } catch (error) {
      console.error("Error adding credits:", error);
      alert("Failed to add credits");
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gradient-to-r from-green-200 to-teal-200 rounded-xl w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-16 bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl"
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-xl p-4 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("admin.filterByName")}
            </label>
            <input
              type="text"
              placeholder="Search by name..."
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("admin.filterByStatus")}
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 bg-white"
            >
              <option value="">{t("admin.allStatus")}</option>
              <option value="active">{t("admin.activeUsers")}</option>
              <option value="inactive">{t("admin.inactiveUsers")}</option>
              <option value="admin">{t("admin.adminUsers")}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-green-500 to-teal-500 px-6 py-4">
          <h3 className="text-white font-semibold flex items-center">
            <Users className="w-5 h-5 mr-2" />
            {t("admin.userManagement")} ({users.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                  {t("admin.serialNumber")}
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
                  {t("admin.name")}
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                  {t("admin.status")}
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                  {t("admin.rides")}
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                  {t("admin.duration")}
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                  {t("admin.credits")}
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                  {t("admin.spent")}
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">
                  {t("admin.actions")}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users
                .filter(
                  (user) =>
                    (nameFilter === "" ||
                      user.name
                        .toLowerCase()
                        .includes(nameFilter.toLowerCase())) &&
                    (statusFilter === "" ||
                      (statusFilter === "admin" && user.role === "admin") ||
                      (statusFilter === "active" &&
                        user.role === "user" &&
                        isUserActive(user)) ||
                      (statusFilter === "inactive" &&
                        user.role === "user" &&
                        !isUserActive(user))),
                )
                .map((user, index) => {
                  // Calculate user statistics
                  const allRentals = JSON.parse(
                    localStorage.getItem("pedalnepal_rentals") || "[]",
                  );
                  console.log("All rentals:", allRentals);
                  console.log("User ID:", user.id, "User name:", user.name);
                  const userRentals = allRentals.filter(
                    (rental: any) => rental.userId === user.id,
                  );
                  console.log("User rentals for", user.name, ":", userRentals);
                  const completedRentals = userRentals.filter(
                    (rental: any) => rental.status === "completed",
                  );
                  const activeRentals = userRentals.filter(
                    (rental: any) => rental.status === "active",
                  );
                  const totalRides =
                    completedRentals.length + activeRentals.length;

                  // Calculate most visited station (including active rentals)
                  const stationVisits = userRentals.reduce(
                    (acc: Record<string, number>, rental: any) => {
                      acc[rental.station] = (acc[rental.station] || 0) + 1;
                      return acc;
                    },
                    {} as Record<string, number>,
                  );
                  const mostVisitedStation =
                    Object.keys(stationVisits).length > 0
                      ? Object.entries(stationVisits).sort(
                          ([, a], [, b]) => (b as number) - (a as number),
                        )[0][0]
                      : "None";

                  // Calculate total duration (including active rentals)
                  const totalDuration = userRentals.reduce(
                    (total: number, rental: any) => {
                      if (rental.startTime) {
                        const start = new Date(rental.startTime);
                        let end: Date;

                        if (rental.endTime) {
                          // For completed rentals, use the actual end time
                          end = new Date(rental.endTime);
                        } else if (rental.status === "active") {
                          // For active rentals, use current time
                          end = new Date();
                        } else {
                          // Skip rentals without start time or invalid status
                          return total;
                        }

                        const duration = end.getTime() - start.getTime();
                        const durationHours = duration / (1000 * 60 * 60);

                        console.log(`Rental ${rental.id} for ${user.name}:`, {
                          startTime: rental.startTime,
                          endTime: rental.endTime,
                          status: rental.status,
                          durationMs: duration,
                          durationHours: durationHours,
                        });

                        return total + duration;
                      }
                      return total;
                    },
                    0,
                  );
                  const totalHours = Math.round(
                    totalDuration / (1000 * 60 * 60),
                  );

                  console.log(`Duration calculation for ${user.name}:`, {
                    totalDuration,
                    totalHours,
                    userRentalsCount: userRentals.length,
                    completedRentalsCount: completedRentals.length,
                    activeRentalsCount: activeRentals.length,
                  });

                  // Calculate total credit spent
                  const totalSpent = completedRentals.reduce(
                    (total: number, rental: any) => total + (rental.price || 0),
                    0,
                  );

                  // Determine user status
                  const userStatus =
                    user.role === "admin"
                      ? t("admin.statusAdmin")
                      : isUserActive(user)
                        ? t("admin.statusActive")
                        : t("admin.statusInactive");
                  const statusColor =
                    user.role === "admin"
                      ? "bg-purple-100 text-purple-800 border border-purple-300"
                      : isUserActive(user)
                        ? "bg-green-100 text-green-800 border border-green-300"
                        : "bg-gray-100 text-gray-800 border border-gray-300";

                  return (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900 font-medium">
                        {index + 1}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center text-white font-semibold text-xs mr-2">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium text-gray-900 truncate">
                              {user.name}
                            </div>
                            <div className="text-xs text-gray-500 truncate">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs rounded-full font-semibold ${statusColor}`}
                        >
                          {userStatus}
                        </span>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">
                        {user.role === 'admin' ? '-' : totalRides}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">
                        {user.role === 'admin' ? '-' : `${totalHours}h`}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-sm font-medium text-green-600">
                        {user.role === 'admin' ? '-' : `रू${user.credits || 0}`}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-sm font-medium text-red-600">
                        {user.role === 'admin' ? '-' : `रू${totalSpent}`}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-sm font-medium">
                        <div className="flex flex-wrap gap-1">
                          {user.role !== 'admin' && (
                            <button
                              onClick={() => openAddCreditsModal(user)}
                              className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs"
                            >
                              {t("admin.add")}
                            </button>
                          )}
                          {user.role === "user" ? (
                            <button
                              onClick={() => promoteToAdmin(user.id)}
                              className="bg-purple-600 hover:bg-purple-700 text-white px-2 py-1 rounded text-xs"
                            >
                              {t("admin.admin")}
                            </button>
                          ) : (
                            <button
                              onClick={() => demoteToUser(user.id)}
                              className="bg-orange-600 hover:bg-orange-700 text-white px-2 py-1 rounded text-xs"
                            >
                              {t("admin.remove")}
                            </button>
                          )}
                          <button
                            onClick={() => deleteUser(user.id)}
                            className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs"
                          >
                            {t("admin.delete")}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Credits Modal */}
      {showAddCreditsModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {t("admin.addCredits")}
              </h3>
              <p className="text-gray-600">{t("admin.addCreditsToUser")}</p>
            </div>

            {/* User Info */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-gray-900">
                    {selectedUser.name}
                  </div>
                  <div className="text-sm text-gray-600">
                    {selectedUser.email}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">
                    {t("admin.currentCredits")}
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    रू{selectedUser.credits || 0}
                  </div>
                </div>
              </div>
            </div>

            {/* Credits Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                {t("admin.creditsToAdd")}
              </label>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() =>
                    setCreditsToAdd(Math.max(0, creditsToAdd - 50))
                  }
                  className="w-12 h-12 border-2 border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all duration-200 flex items-center justify-center font-bold text-gray-600"
                >
                  -
                </button>
                <div className="flex-1 text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {creditsToAdd}
                  </div>
                  <div className="text-sm text-gray-500">credits</div>
                </div>
                <button
                  onClick={() => setCreditsToAdd(creditsToAdd + 50)}
                  className="w-12 h-12 border-2 border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all duration-200 flex items-center justify-center font-bold text-gray-600"
                >
                  +
                </button>
              </div>

              {/* Quick Amounts */}
              <div className="mt-4 text-center">
                <div className="text-xs text-gray-500 mb-2">Quick amounts:</div>
                <div className="flex justify-center space-x-2">
                  {[50, 100, 250].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setCreditsToAdd(amount)}
                      className={`px-3 py-1 text-xs rounded-full font-medium transition-all duration-200 ${
                        creditsToAdd === amount
                          ? "bg-green-500 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {amount}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* New Balance Preview */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <div className="text-center">
                <div className="text-sm text-blue-600 mb-1">
                  {t("admin.newBalance")}
                </div>
                <div className="text-2xl font-bold text-blue-700">
                  रू{(selectedUser.credits || 0) + creditsToAdd} credits
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <Button
                onClick={() => setShowAddCreditsModal(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 px-4 rounded-xl font-medium"
              >
                {t("admin.cancel")}
              </Button>
              <Button
                onClick={addCredits}
                className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3 px-4 rounded-xl font-medium"
              >
                {t("admin.addCreditsButton")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Stations Management Component
function StationsManagement({ refreshTrigger }: { refreshTrigger: number }) {
  const { t } = useLanguage();
  const [bicycles, setBicycles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [nameFilter, setNameFilter] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetchBicycles();
  }, [statusFilter, refreshTrigger]);

  // Add focus event listener to refresh data when returning from slot management
  useEffect(() => {
    const handleFocus = () => {
      fetchBicycles();
    };

    const handleSlotStatusChanged = () => {
      fetchBicycles();
    };

    window.addEventListener("focus", handleFocus);
    window.addEventListener("slotStatusChanged", handleSlotStatusChanged);

    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("slotStatusChanged", handleSlotStatusChanged);
    };
  }, []);

  const fetchBicycles = async () => {
    try {
      // Get bicycles from localStorage
      const allBicycles = JSON.parse(
        localStorage.getItem("pedalnepal_bicycles") || "[]",
      );

      // Group bicycles by unique stations
      const stationMap = new Map();
      allBicycles.forEach((bicycle: any) => {
        const stationKey = `${bicycle.name}_${bicycle.location}`;
        if (!stationMap.has(stationKey)) {
          stationMap.set(stationKey, {
            id: bicycle.id,
            name: bicycle.name,
            location: bicycle.location,
            hourlyRate: bicycle.hourlyRate || 25,
            dailyRate: bicycle.dailyRate || 250,
            status: bicycle.status,
            createdAt: bicycle.createdAt,
          });
        }
      });

      const uniqueStations = Array.from(stationMap.values());
      setBicycles(uniqueStations);
    } catch (error) {
      console.error("Error fetching bicycles:", error);
    } finally {
      setLoading(false);
    }
  };

  // Memoize filtered bicycles to prevent unnecessary re-renders
  const filteredBicycles = useMemo(() => {
    let filtered = bicycles;

    if (statusFilter) {
      filtered = filtered.filter(
        (bicycle: any) => bicycle.status === statusFilter,
      );
    }

    if (nameFilter) {
      filtered = filtered.filter(
        (bicycle: any) =>
          bicycle.name.toLowerCase().includes(nameFilter.toLowerCase()) ||
          bicycle.location.toLowerCase().includes(nameFilter.toLowerCase()),
      );
    }

    return filtered;
  }, [bicycles, statusFilter, nameFilter]);

  // Function to get slot statistics for a station
  const getSlotStatistics = useMemo(() => {
    return (stationKey: string) => {
      try {
        // Parse the station key to get name and location
        const [stationName, stationLocation] = stationKey.split("_");

        // Get all bicycles to count bikes at this station
        const bicycles = JSON.parse(
          localStorage.getItem("pedalnepal_bicycles") || "[]",
        );

        // Count all bikes that belong to this station
        const bikesAtThisStation = bicycles.filter(
          (bike: any) =>
            bike.name === stationName && bike.location === stationLocation,
        );
        const totalBikesForStation = bikesAtThisStation.length;

        console.log("Slot Statistics Debug:", {
          stationKey,
          stationName,
          stationLocation,
          totalBikesForStation,
          totalBicycles: bicycles.length,
          allBicycles: bicycles.map((b: any) => ({
            id: b.id,
            name: b.name,
            location: b.location,
          })),
          bikesAtThisStation: bikesAtThisStation.map((b: any) => ({
            id: b.id,
            name: b.name,
            location: b.location,
          })),
        });

        // Get slots for this station
        const slotsKey = `pedalnepal_slots_${stationKey}`;
        const slots = JSON.parse(localStorage.getItem(slotsKey) || "[]");

        // Use fixed slot count of 10, regardless of bike count
        const totalSlots = 10;

        // If no slots exist, initialize them with proper status (slots 9-10 reserved)
        if (slots.length === 0) {
          const defaultSlots = Array.from({ length: 10 }, (_, index) => ({
            id: `slot_${stationKey}_${index + 1}`,
            slotNumber: index + 1,
            status: index >= 8 ? ("reserved" as const) : ("active" as const),
            lastUpdated: new Date().toISOString(),
            notes:
              index >= 8 ? "Available for bike returns" : "Regular bike slot",
          }));
          localStorage.setItem(slotsKey, JSON.stringify(defaultSlots));

          return {
            totalSlots: 10,
            activeSlots: 8,
            maintenanceSlots: 0,
            reservedSlots: 2,
            availableSlots: 8,
          };
        }

        // Update existing slots to ensure proper status based on bike returns
        const updatedSlots = slots.map((slot: any) => {
          // If slot has a bike returned to it, keep it as active (available for rental)
          if (slot.status === "active" && slot.notes === "Bike returned") {
            return slot; // Keep as is - available for rental
          }
          // If slot is empty (marked as available for returns), keep it as reserved
          if (
            slot.status === "active" &&
            slot.notes?.includes("Available for bike returns")
          ) {
            return {
              ...slot,
              status: "reserved" as const,
              notes: "Available for bike returns",
              lastUpdated: new Date().toISOString(),
            };
          }
          // If it's a regular active slot (1-8), keep it as active (has bike)
          if (slot.slotNumber <= 8 && slot.status === "active") {
            return slot; // Keep as is - has bike available for rental
          }
          // If it's slot 9-10 and not marked as having a returned bike, mark as reserved
          if (
            slot.slotNumber >= 9 &&
            slot.status === "active" &&
            !slot.notes?.includes("Bike returned")
          ) {
            return {
              ...slot,
              status: "reserved" as const,
              notes: "Available for bike returns",
              lastUpdated: new Date().toISOString(),
            };
          }
          return slot;
        });

        // Save updated slots if any changes were made
        if (JSON.stringify(updatedSlots) !== JSON.stringify(slots)) {
          localStorage.setItem(slotsKey, JSON.stringify(updatedSlots));
        }

        const activeSlots = updatedSlots.filter((slot: any) => {
          // Regular slots (1-8) that are active and have bikes
          if (
            slot.slotNumber <= 8 &&
            slot.status === "active" &&
            !slot.notes?.includes("Available for bike returns")
          ) {
            return true;
          }
          // Any slot that has a bike returned to it (available for rental)
          if (slot.status === "active" && slot.notes === "Bike returned") {
            return true;
          }
          return false;
        }).length;
        const maintenanceSlots = updatedSlots.filter(
          (slot: any) => slot.status === "in-maintenance",
        ).length;
        const reservedSlots = updatedSlots.filter(
          (slot: any) => slot.status === "reserved",
        ).length;

        return {
          totalSlots,
          activeSlots,
          maintenanceSlots,
          reservedSlots,
          availableSlots: activeSlots,
        };
      } catch (error) {
        console.error("Error getting slot statistics:", error);
        return {
          totalSlots: 10,
          activeSlots: 10,
          maintenanceSlots: 0,
          reservedSlots: 0,
          availableSlots: 10,
        };
      }
    };
  }, []);

  const deleteBicycle = async (bicycleId: string) => {
    if (!confirm("Are you sure you want to delete this station?")) return;

    try {
      const bicycles = JSON.parse(
        localStorage.getItem("pedalnepal_bicycles") || "[]",
      );
      const updatedBicycles = bicycles.filter(
        (bicycle: any) => bicycle.id !== bicycleId,
      );
      localStorage.setItem(
        "pedalnepal_bicycles",
        JSON.stringify(updatedBicycles),
      );

      fetchBicycles();
    } catch (error) {
      console.error("Error deleting bicycle:", error);
    }
  };

  const manageSlots = (stationKey: string) => {
    // stationKey is already in the format "StationName_Location"
    router.push(`/admin/manage-slots?stationId=${stationKey}`);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gradient-to-r from-orange-200 to-red-200 rounded-xl w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-16 bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl"
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-xl p-4 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("admin.filterByNameLocation")}
            </label>
            <input
              type="text"
              placeholder="Search by station name or location..."
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200 bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("admin.filterByStatus")}
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200 bg-white"
            >
              <option value="">{t("admin.allStatus")}</option>
              <option value="available">{t("admin.available")}</option>
              <option value="rented">{t("admin.rented")}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stations Table */}
      <div
        id="station-management"
        className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
      >
        <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-4">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-semibold flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              {t("admin.stationManagement")} ({filteredBicycles.length})
            </h3>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("admin.serialNumber")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("admin.stationName")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("admin.location")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("admin.totalSlots")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("admin.inMaintenance")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("admin.availableSlots")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("admin.actions")}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBicycles.map((bicycle, index) => {
                // Get real slot statistics for each station
                const stationKey = `${bicycle.name}_${bicycle.location}`;
                const slotStats = getSlotStatistics(stationKey);

                return (
                  <tr
                    key={`${bicycle.id}-${stationKey}`}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-semibold text-sm mr-3">
                          <MapPin className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {bicycle.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            रू{bicycle.hourlyRate || 25}/hr • रू
                            {bicycle.dailyRate || 250}/day
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {bicycle.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="font-semibold">
                        {slotStats.totalSlots}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="font-semibold text-red-600">
                        {slotStats.maintenanceSlots}
                        {slotStats.maintenanceSlots > 0 && (
                          <span className="ml-1 text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                            {t("admin.maintenance")}
                          </span>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="font-semibold text-green-600">
                        {slotStats.availableSlots}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() =>
                            manageSlots(`${bicycle.name}_${bicycle.location}`)
                          }
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-xs"
                        >
                          {t("admin.manageSlots")}
                        </button>
                        <button
                          onClick={() =>
                            router.push(`/admin/add-station?edit=${bicycle.id}`)
                          }
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-xs"
                        >
                          {t("admin.edit")}
                        </button>
                        <button
                          onClick={() => deleteBicycle(bicycle.id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-xs"
                        >
                          {t("admin.delete")}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {filteredBicycles.length === 0 && (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
          <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {t("admin.noStationsFound")}
          </h3>
          <p className="text-gray-600">{t("admin.noStationsMessage")}</p>
        </div>
      )}
    </div>
  );
}

// Reviews Management Component
function ReviewsManagement({ refreshTrigger }: { refreshTrigger: number }) {
  const { t } = useLanguage();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, reviews, complaints
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [reviewsPerPage] = useState(5);
  const [selectedReview, setSelectedReview] = useState<any>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  // Function to fetch real reviews from localStorage
  const fetchRealReviews = () => {
    try {
      const storedReviews = localStorage.getItem("pedalnepal_reviews");
      if (storedReviews) {
        const parsedReviews = JSON.parse(storedReviews);

        // Transform the data to match the expected format
        const transformedReviews = parsedReviews.map(
          (review: any, index: number) => ({
            id: review.id || `review_${index + 1}`,
            userId: review.userId || "unknown",
            userName: review.userName || "Unknown User",
            type: review.rating >= 4 ? "review" : "rating", // 4-5 stars = review, 1-3 stars = rating
            title: review.review
              ? review.review.substring(0, 50) +
                (review.review.length > 50 ? "..." : "")
              : "No Title",
            content: review.review || "No review content provided",
            rating: review.rating || 0,
            station: review.stationName || "Unknown Station",
            createdAt: review.createdAt || new Date().toISOString(),
            status: "active",
          }),
        );

        return transformedReviews;
      }

      // No reviews exist yet - return empty array
      return [];
    } catch (error) {
      console.error("Error fetching reviews:", error);
      return [];
    }
  };

  useEffect(() => {
    // Fetch real reviews from localStorage
    setLoading(true);
    const realReviews = fetchRealReviews();
    setReviews(realReviews);
    setLoading(false);

    // Add event listener for real-time updates when new reviews are added
    const handleReviewsUpdate = () => {
      const updatedReviews = fetchRealReviews();
      setReviews(updatedReviews);
    };

    // Listen for custom event when reviews are updated
    window.addEventListener("reviewsUpdated", handleReviewsUpdate);

    // Cleanup
    return () => {
      window.removeEventListener("reviewsUpdated", handleReviewsUpdate);
    };
  }, [refreshTrigger]);

  // Function to clear any existing dummy data
  const clearDummyData = () => {
    // Remove any old dummy data keys that might exist
    const keysToRemove = [
      "pedalnepal_dummy_reviews",
      "pedalnepal_mock_reviews",
      "pedalnepal_sample_reviews",
    ];

    keysToRemove.forEach((key) => {
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
      }
    });
  };

  // Function to handle viewing review details
  const handleViewReview = (review: any) => {
    setSelectedReview(review);
    setShowViewModal(true);
  };

  // Function to handle replying to a review
  const handleReplyToReview = (review: any) => {
    setSelectedReview(review);
    setReplyText("");
    setShowReplyModal(true);
  };

  // Function to submit reply
  const handleSubmitReply = async () => {
    if (!replyText.trim() || !selectedReview) return;

    setIsSubmittingReply(true);

    try {
      // Get existing reviews
      const reviews = JSON.parse(
        localStorage.getItem("pedalnepal_reviews") || "[]",
      );

      // Find and update the selected review with admin reply
      const updatedReviews = reviews.map((review: any) => {
        if (review.id === selectedReview.id) {
          return {
            ...review,
            adminReply: replyText.trim(),
            adminReplyDate: new Date().toISOString(),
            status: "replied",
          };
        }
        return review;
      });

      // Save updated reviews
      localStorage.setItem(
        "pedalnepal_reviews",
        JSON.stringify(updatedReviews),
      );

      // Update local state
      setReviews(updatedReviews);

      // Close modal and show success message
      setShowReplyModal(false);
      setSelectedReview(null);
      setReplyText("");

      alert("Reply submitted successfully!");
    } catch (error) {
      console.error("Error submitting reply:", error);
      alert("Error submitting reply. Please try again.");
    } finally {
      setIsSubmittingReply(false);
    }
  };

  // Clear dummy data on component mount
  useEffect(() => {
    clearDummyData();
  }, []);

  const filteredReviews = (() => {
    const base = reviews.filter((review) => {
      const matchesFilter =
        filter === "all" ||
        filter === "ratings" ||
        filter === "rating" ||
        review.type === filter;
      const matchesSearch =
        review.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.userName.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
    });

    if (filter === "ratings") {
      return [...base].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    return base;
  })();

  // Pagination logic
  const indexOfLastReview = currentPage * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
  const currentReviews = filteredReviews.slice(
    indexOfFirstReview,
    indexOfLastReview,
  );
  const totalPages = Math.ceil(filteredReviews.length / reviewsPerPage);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchTerm]);

  const getTypeColor = (type: string) => {
    switch (type) {
      case "review":
        return "text-green-600 bg-green-100";
      case "rating":
        return "text-blue-600 bg-blue-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getRatingStars = (rating: number) => {
    return "★".repeat(rating) + "☆".repeat(5 - rating);
  };

  // Handle empty state when no reviews exist
  if (reviews.length === 0 && !loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl border border-gray-100 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                {t("admin.reviewsComplaints")}
              </h2>
              <p className="text-sm sm:text-base text-gray-600">
                {t("reviews.manageFeedback")}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  setLoading(true);
                  const realReviews = fetchRealReviews();
                  setReviews(realReviews);
                  setLoading(false);
                }}
                className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <svg
                  className="w-4 h-4 inline mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Empty State */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl border border-gray-100 p-8 sm:p-12">
          <div className="text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <svg
                className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
              No Reviews Yet
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4">
              Users haven't submitted any reviews or complaints yet. Reviews
              will appear here once users rate their bike rental experiences.
            </p>
            <div className="text-xs sm:text-sm text-gray-500">
              <p>
                Reviews are collected when users complete their rides and rate
                their experience.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl border border-gray-100 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              {t("admin.reviewsComplaints")}
            </h2>
            <p className="text-sm sm:text-base text-gray-600">
              {t("reviews.manageFeedback")}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center">
              <button
                onClick={() => {
                  setLoading(true);
                  const realReviews = fetchRealReviews();
                  setReviews(realReviews);
                  setLoading(false);
                }}
                className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <svg
                  className="w-4 h-4 inline mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl border border-gray-100 p-4 sm:p-6">
        <div className="space-y-4">
          {/* Search */}
          <div>
            <input
              type="text"
              placeholder={t("reviews.searchReviews")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {t("reviews.all")}
            </button>
            <button
              onClick={() => setFilter("review")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === "review"
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {t("reviews.reviews")}
            </button>
            <button
              onClick={() => setFilter("ratings")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === "ratings"
                  ? "bg-yellow-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Ratings
            </button>
          </div>
        </div>
      </div>

      {/* Reviews List - Mobile Cards */}
      <div className="space-y-3 sm:space-y-4">
        {currentReviews.map((review) => (
          <div
            key={review.id}
            className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 sm:p-6 border-b border-gray-100">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                    {review.userName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm sm:text-base">
                      {review.userName}
                    </div>
                    <div className="text-xs text-gray-500">
                      ID: {review.userId}
                    </div>
                  </div>
                </div>
                <span
                  className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getTypeColor(review.type)}`}
                >
                  {review.type === "review" ? "Review" : "Rating"}
                </span>
              </div>

              {/* Rating */}
              <div className="flex items-center justify-between mb-3">
                <div className="text-lg text-yellow-600 font-medium">
                  {getRatingStars(review.rating)}
                </div>
                <div className="text-sm text-gray-500">{review.rating}/5</div>
              </div>

              {/* Title and Content */}
              <div className="mb-3">
                <div className="font-medium text-gray-900 text-sm sm:text-base mb-1">
                  {review.title}
                </div>
                <div className="text-sm text-gray-600 line-clamp-2">
                  {review.content}
                </div>
              </div>

              {/* Station and Date */}
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>📍 {review.station}</span>
                <span>{new Date(review.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="px-4 sm:px-6 py-3 bg-gray-50">
              <div className="flex items-center justify-between">
                {review.adminReply && (
                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                    <svg
                      className="w-3 h-3 mr-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Replied
                  </span>
                )}

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleViewReview(review)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    {t("reviews.view")}
                  </button>
                  <button
                    onClick={() => handleReplyToReview(review)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      review.adminReply
                        ? "bg-orange-600 hover:bg-orange-700 text-white"
                        : "bg-green-600 hover:bg-green-700 text-white"
                    }`}
                  >
                    {review.adminReply ? "Edit Reply" : t("reviews.reply")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredReviews.length === 0 && (
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl border border-gray-100 p-8 text-center">
          <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {t("reviews.noReviews")}
          </h3>
          <p className="text-gray-600">{t("reviews.noReviews")}</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl border border-gray-100 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-700 text-center sm:text-left">
              {t("rentals.showing")} {indexOfFirstReview + 1} {t("rentals.to")}{" "}
              {Math.min(indexOfLastReview, filteredReviews.length)}{" "}
              {t("rentals.of")} {filteredReviews.length} {t("reviews.reviews")}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  currentPage === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {t("common.back")}
              </button>

              <div className="flex items-center space-x-1">
                {Array.from({ length: totalPages }, (_, index) => {
                  const pageNumber = index + 1;
                  // Show first page, last page, current page, and pages around current
                  const shouldShow =
                    pageNumber === 1 ||
                    pageNumber === totalPages ||
                    (pageNumber >= currentPage - 1 &&
                      pageNumber <= currentPage + 1);

                  if (shouldShow) {
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => setCurrentPage(pageNumber)}
                        className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                          currentPage === pageNumber
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  } else if (
                    pageNumber === currentPage - 2 ||
                    pageNumber === currentPage + 2
                  ) {
                    return (
                      <span
                        key={pageNumber}
                        className="px-2 py-2 text-gray-500"
                      >
                        ...
                      </span>
                    );
                  }
                  return null;
                })}
              </div>

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  currentPage === totalPages
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {t("common.next")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Review Modal */}
      {showViewModal && selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                  Review Details
                </h3>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
                >
                  <svg
                    className="w-4 h-4 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* User Info */}
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-xl">
                  {selectedReview.userName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">
                    {selectedReview.userName}
                  </h4>
                  <p className="text-gray-600">ID: {selectedReview.userId}</p>
                  <span
                    className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full mt-2 ${getTypeColor(selectedReview.type)}`}
                  >
                    {selectedReview.type === "review" ? "Review" : "Rating"}
                  </span>
                </div>
              </div>

              {/* Rating */}
              <div className="text-center">
                <div className="text-2xl text-yellow-600 font-medium mb-2">
                  {getRatingStars(selectedReview.rating)}
                </div>
                <p className="text-gray-600">
                  {selectedReview.rating}/5 Rating
                </p>
              </div>

              {/* Review Content */}
              <div>
                <h5 className="font-semibold text-gray-900 mb-2">
                  Review Content
                </h5>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700">{selectedReview.content}</p>
                </div>
              </div>

              {/* Additional Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h5 className="font-semibold text-gray-900 mb-2">Station</h5>
                  <p className="text-gray-600">{selectedReview.station}</p>
                </div>
                <div>
                  <h5 className="font-semibold text-gray-900 mb-2">Date</h5>
                  <p className="text-gray-600">
                    {new Date(selectedReview.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Admin Reply (if exists) */}
              {selectedReview.adminReply && (
                <div>
                  <h5 className="font-semibold text-gray-900 mb-2">
                    Admin Reply
                  </h5>
                  <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                    <p className="text-gray-700">{selectedReview.adminReply}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Replied on:{" "}
                      {new Date(
                        selectedReview.adminReplyDate,
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    handleReplyToReview(selectedReview);
                  }}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-xl font-medium transition-colors"
                >
                  {selectedReview.adminReply ? "Edit Reply" : "Reply to Review"}
                </button>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-xl font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reply Modal */}
      {showReplyModal && selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4">
            <div className="p-4 sm:p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                  {selectedReview.adminReply ? "Edit Reply" : "Reply to Review"}
                </h3>
                <button
                  onClick={() => setShowReplyModal(false)}
                  className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
                >
                  <svg
                    className="w-4 h-4 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6 space-y-4">
              {/* Review Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>{selectedReview.userName}</strong> wrote:
                </p>
                <p className="text-gray-700 text-sm">
                  {selectedReview.content}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Rating: {selectedReview.rating}/5
                </p>
              </div>

              {/* Reply Text Area */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Reply
                </label>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write your reply to this review..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200"
                  rows={4}
                  maxLength={500}
                />
                <div className="text-right mt-2">
                  <span className="text-xs text-gray-500">
                    {replyText.length}/500 characters
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  onClick={() => setShowReplyModal(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-xl font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitReply}
                  disabled={!replyText.trim() || isSubmittingReply}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-xl font-medium transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmittingReply ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                        />
                      </svg>
                      {selectedReview.adminReply
                        ? "Update Reply"
                        : "Submit Reply"}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminDashboardWithErrorBoundary() {
  return (
    <ProtectedRoute requireAuth={true} requireAdmin={true}>
      <ErrorBoundary>
        <AdminDashboard />
      </ErrorBoundary>
    </ProtectedRoute>
  );
}
