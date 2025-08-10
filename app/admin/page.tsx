'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import Card from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Modal from '@/components/ui/modal';
import { Users, Bike, MapPin, BarChart3, Plus, Search, CreditCard, Trash2, UserCheck, Activity, TrendingUp, TrendingDown, Edit } from 'lucide-react';
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
} from 'chart.js';
import { Pie, Line } from 'react-chartjs-2';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title
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
const BikeStatusPieChart = ({ stats }: { stats: DashboardStats | null }) => {
  // Simulate realistic bike inventory across all stations
  const totalStations = stats?.bicycles.totalBicycles || 0;
  const bikesPerStation = 15; // Average bikes per station
  const totalBikes = totalStations * bikesPerStation;
  
  const rentedBikes = stats?.rentals.activeRentals || 0;
  const availableBikes = Math.max(0, totalBikes - rentedBikes);
  const emptySlots = Math.max(0, totalBikes - availableBikes - rentedBikes);
  
  const data = {
    labels: ['Rented Bikes', 'Empty Slots', 'Available Bikes'],
    datasets: [
      {
        data: [rentedBikes, emptySlots, availableBikes],
        backgroundColor: [
          '#ef4444', // Red for rented
          '#6b7280', // Gray for empty slots
          '#10b981', // Green for available
        ],
        borderColor: [
          '#dc2626',
          '#4b5563',
          '#059669',
        ],
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.parsed;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
      <div className="flex items-center mb-4">
        <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl flex items-center justify-center mr-3">
          <Bike className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">All Stations Bike Status</h3>
          <p className="text-sm text-gray-500">Total bikes across {totalStations} stations</p>
        </div>
      </div>
      <div className="h-64">
        <Pie data={data} options={options} />
      </div>
      
      {/* Bike Inventory Summary */}
      <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
        <div className="text-center">
          <div className="font-semibold text-red-600">{rentedBikes}</div>
          <div className="text-gray-500">Rented</div>
        </div>
        <div className="text-center">
          <div className="font-semibold text-gray-600">{emptySlots}</div>
          <div className="text-gray-500">Empty</div>
        </div>
        <div className="text-center">
          <div className="font-semibold text-green-600">{availableBikes}</div>
          <div className="text-gray-500">Available</div>
        </div>
      </div>
    </div>
  );
};

const UserActivityPieChart = ({ stats }: { stats: DashboardStats | null }) => {
  const data = {
    labels: ['Active Users', 'Returning Users', 'New Users'],
    datasets: [
      {
        data: [
          stats?.rentals.activeRentals || 0,
          Math.max(0, (stats?.users.totalUsers || 0) - (stats?.users.regularUsers || 0) - (stats?.rentals.activeRentals || 0)),
          stats?.users.regularUsers || 0,
        ],
        backgroundColor: [
          '#3b82f6', // Blue for active
          '#8b5cf6', // Purple for returning
          '#06b6d4', // Cyan for new
        ],
        borderColor: [
          '#2563eb',
          '#7c3aed',
          '#0891b2',
        ],
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.parsed;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
      <div className="flex items-center mb-4">
        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mr-3">
          <Users className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">User Activity</h3>
          <p className="text-sm text-gray-500">User engagement breakdown</p>
        </div>
      </div>
      <div className="h-64">
        <Pie data={data} options={options} />
      </div>
    </div>
  );
};

const ReviewsPieChart = ({ stats }: { stats: DashboardStats | null }) => {
  // Mock data for reviews/complaints - you can replace with real data
  const totalReviews = 15;
  const bicycleComplaints = 8;
  const generalReviews = totalReviews - bicycleComplaints;

  const data = {
    labels: ['General Reviews', 'Bicycle Complaints'],
    datasets: [
      {
        data: [generalReviews, bicycleComplaints],
        backgroundColor: [
          '#10b981', // Green for positive reviews
          '#f59e0b', // Amber for complaints
        ],
        borderColor: [
          '#059669',
          '#d97706',
        ],
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.parsed;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
      <div className="flex items-center mb-4">
        <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-amber-500 rounded-xl flex items-center justify-center mr-3">
          <Activity className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Reviews & Complaints</h3>
          <p className="text-sm text-gray-500">Customer feedback analysis</p>
        </div>
      </div>
      <div className="h-64">
        <Pie data={data} options={options} />
      </div>
    </div>
  );
};

function AdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recent, setRecent] = useState<RecentActivity | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'bicycles'>('overview');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Check if user is admin, if not redirect to home
  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/');
      return;
    }
    
    if (user && user.role === 'admin') {
      fetchDashboardData();
    }
  }, [user, router]);

  // Show loading while checking user role
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg font-medium">Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  // Show access denied for non-admin users
  if (user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="bg-white rounded-2xl shadow-2xl p-8 border border-red-100">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <UserCheck className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-red-600 mb-4">Access Denied</h1>
            <p className="text-gray-600 mb-6">You don't have permission to access the admin dashboard.</p>
            <Button onClick={() => router.push('/')} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200">
            Go to Home
          </Button>
          </div>
        </div>
      </div>
    );
  }

  const fetchDashboardData = async () => {
    try {
      console.log('Fetching dashboard data from localStorage...');
      
      // Get data from localStorage
      const users = JSON.parse(localStorage.getItem('paddlenepal_users') || '[]');
      const bicycles = JSON.parse(localStorage.getItem('paddlenepal_bicycles') || '[]');
      const rentals = JSON.parse(localStorage.getItem('paddlenepal_rentals') || '[]');
      
      // Update existing data to use proper station names
      const updatedBicycles = bicycles.map((bicycle: any, index: number) => {
        const stationNumber = (index % 3) + 1;
        const locations = ['Kathmandu', 'Lalitpur', 'Bhaktapur'];
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
            id: '1',
            name: 'Station 1',
            description: 'Station 1',
            location: 'Kathmandu',
            status: 'available',
            hourlyRate: 25,
            dailyRate: 250,
            image: '/bicycle-placeholder.jpg',
            createdAt: new Date().toISOString(),
          },
          {
            id: '2',
            name: 'Station 2',
            description: 'Station 2',
            location: 'Lalitpur',
            status: 'available',
            hourlyRate: 25,
            dailyRate: 250,
            image: '/bicycle-placeholder.jpg',
            createdAt: new Date().toISOString(),
          },
          {
            id: '3',
            name: 'Station 3',
            description: 'Station 3',
            location: 'Bhaktapur',
            status: 'available',
            hourlyRate: 25,
            dailyRate: 250,
            image: '/bicycle-placeholder.jpg',
            createdAt: new Date().toISOString(),
          },
        ];
        localStorage.setItem('paddlenepal_bicycles', JSON.stringify(initialStations));
        updatedBicycles.push(...initialStations);
      } else {
        // Save updated bicycles back to localStorage
        localStorage.setItem('paddlenepal_bicycles', JSON.stringify(updatedBicycles));
      }
      
      // Calculate stats
      const stats: DashboardStats = {
        users: {
          totalUsers: users.length,
          adminUsers: users.filter((u: any) => u.role === 'admin').length,
          regularUsers: users.filter((u: any) => u.role === 'user').length,
        },
        bicycles: {
          totalBicycles: updatedBicycles.length,
          availableBicycles: updatedBicycles.filter((b: any) => b.status === 'available').length,
          outOfStockBicycles: updatedBicycles.filter((b: any) => b.status === 'rented').length,
        },
        rentals: {
          totalRentals: rentals.length,
          activeRentals: rentals.filter((r: any) => r.status === 'active').length,
          completedRentals: rentals.filter((r: any) => r.status === 'completed').length,
          cancelledRentals: rentals.filter((r: any) => r.status === 'cancelled').length,
        },
      };
      
      // Get recent activity
      const recent: RecentActivity = {
        users: users.slice(-5).reverse(),
        bicycles: updatedBicycles.slice(-5).reverse(),
        rentals: rentals.slice(-5).reverse(),
      };
      
      console.log('Dashboard data calculated:', { stats, recent });
      
      setStats(stats);
      setRecent(recent);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = () => {
    router.push('/admin/add-user');
  };

  const handleAddStation = () => {
    router.push('/admin/add-station');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-12 bg-gradient-to-r from-blue-200 to-purple-200 rounded-2xl w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-100"></div>
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
                  Admin Dashboard
                </h1>
                <p className="text-gray-600 text-xs">Manage PaddleNepal</p>
            </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500">Welcome,</div>
              <div className="text-sm font-semibold text-gray-900">Admin User</div>
            </div>
          </div>
          
          {/* Mobile Action Buttons */}
          <div className="flex space-x-2">
              <Button
              onClick={handleAddUser}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 px-4 rounded-xl shadow-lg text-sm font-medium"
              >
              <Plus className="w-4 h-4 mr-2" />
                Add User
              </Button>
              <Button
              onClick={handleAddStation}
              className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3 px-4 rounded-xl shadow-lg text-sm font-medium"
              >
              <Plus className="w-4 h-4 mr-2" />
                Add Station
              </Button>
          </div>
        </div>
      </div>

      {/* Mobile-Optimized Tab Navigation */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-20 z-10">
        <div className="px-4 py-2">
          <div className="flex space-x-1 bg-gray-100 rounded-xl p-1">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'users', label: 'Users', icon: Users },
              { id: 'bicycles', label: 'Stations', icon: MapPin },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium text-sm transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
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
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-4 text-white shadow-xl">
                <div className="text-center">
                  <div className="text-2xl font-bold mb-1">{stats?.users.totalUsers || 0}</div>
                  <div className="text-xs text-blue-100">Total Users</div>
                  </div>
                </div>
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-4 text-white shadow-xl">
                <div className="text-center">
                  <div className="text-2xl font-bold mb-1">{stats?.bicycles.totalBicycles || 0}</div>
                  <div className="text-xs text-green-100">Total Bikes</div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-4 text-white shadow-xl">
                <div className="text-center">
                  <div className="text-2xl font-bold mb-1">{stats?.rentals.totalRentals || 0}</div>
                  <div className="text-xs text-purple-100">Total Rentals</div>
                  </div>
                </div>
              </div>

            {/* Pie Charts Overview */}
            <div className="grid grid-cols-1 gap-6">
              <BikeStatusPieChart stats={stats} />
              <UserActivityPieChart stats={stats} />
              <ReviewsPieChart stats={stats} />
            </div>

            {/* Recent Activity */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-500 to-gray-600 px-6 py-4">
                  <h3 className="text-white font-semibold flex items-center">
                  <Activity className="w-5 h-5 mr-2" />
                  Recent Activity
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                  {recent?.users.slice(0, 3).map((user: any) => (
                    <div key={user.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-gray-900">{user.name}</div>
                        <div className="text-xs text-gray-500">New user registered</div>
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

        {activeTab === 'users' && <UsersManagement refreshTrigger={refreshTrigger} />}
        {activeTab === 'bicycles' && <StationsManagement refreshTrigger={refreshTrigger} />}
      </div>
    </div>
  );
}

// Users Management Component
function UsersManagement({ refreshTrigger }: { refreshTrigger: number }) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');
  const [showAddCreditsModal, setShowAddCreditsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [creditsToAdd, setCreditsToAdd] = useState(50);

  useEffect(() => {
    fetchUsers();
  }, [searchTerm, roleFilter, refreshTrigger]);

  const fetchUsers = async () => {
    try {
      // Get users from localStorage
      const allUsers = JSON.parse(localStorage.getItem('paddlenepal_users') || '[]');
      const allRentals = JSON.parse(localStorage.getItem('paddlenepal_rentals') || '[]');
      
      console.log('fetchUsers - allUsers:', allUsers);
      console.log('fetchUsers - allRentals:', allRentals);
      
      // Calculate real-time credits for each user based on rental history
      const usersWithUpdatedCredits = allUsers.map((user: any) => {
        const userRentals = allRentals.filter((rental: any) => rental.userId === user.id);
        const totalSpent = userRentals.reduce((sum: number, rental: any) => sum + rental.price, 0);
        const initialCredits = user.initialCredits || 250; // Default starting credits
        const currentCredits = Math.max(0, initialCredits - totalSpent);
        
        console.log(`User ${user.name}:`, {
          initialCredits,
          totalSpent,
          currentCredits,
          rentals: userRentals.length
        });
        
        return {
          ...user,
          credits: currentCredits,
          totalRentals: userRentals.length,
          totalSpent: totalSpent
        };
      });
      
      // Apply filters
      let filteredUsers = usersWithUpdatedCredits;
      
      if (roleFilter) {
        filteredUsers = filteredUsers.filter((user: any) => user.role === roleFilter);
      }
      
      setUsers(filteredUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const users = JSON.parse(localStorage.getItem('paddlenepal_users') || '[]');
      const updatedUsers = users.filter((user: any) => user.id !== userId);
      localStorage.setItem('paddlenepal_users', JSON.stringify(updatedUsers));
      
        fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const promoteToAdmin = async (userId: string) => {
    if (!confirm('Are you sure you want to promote this user to admin?')) return;

    try {
      const users = JSON.parse(localStorage.getItem('paddlenepal_users') || '[]');
      const updatedUsers = users.map((user: any) => 
        user.id === userId ? { ...user, role: 'admin' } : user
      );
      localStorage.setItem('paddlenepal_users', JSON.stringify(updatedUsers));
      
        fetchUsers();
    } catch (error) {
      console.error('Error promoting user:', error);
      alert('Failed to promote user');
    }
  };

  const demoteToUser = async (userId: string) => {
    if (!confirm('Are you sure you want to demote this admin to user?')) return;

    try {
      const users = JSON.parse(localStorage.getItem('paddlenepal_users') || '[]');
      const updatedUsers = users.map((user: any) => 
        user.id === userId ? { ...user, role: 'user' } : user
      );
      localStorage.setItem('paddlenepal_users', JSON.stringify(updatedUsers));
      
        fetchUsers();
    } catch (error) {
      console.error('Error demoting user:', error);
      alert('Failed to demote user');
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
      console.log('Adding credits:', { selectedUser, creditsToAdd });
      
      // Get current data
      const users = JSON.parse(localStorage.getItem('paddlenepal_users') || '[]');
      const allRentals = JSON.parse(localStorage.getItem('paddlenepal_rentals') || '[]');
      
      // Find the user and calculate their current spending
      const userRentals = allRentals.filter((rental: any) => rental.userId === selectedUser.id);
      const totalSpent = userRentals.reduce((sum: number, rental: any) => sum + rental.price, 0);
      const currentInitialCredits = selectedUser.initialCredits || 250;
      const newInitialCredits = currentInitialCredits + creditsToAdd;
      const newCurrentCredits = Math.max(0, newInitialCredits - totalSpent);
      
      console.log('Credit calculation:', {
        currentInitialCredits,
        newInitialCredits,
        totalSpent,
        newCurrentCredits,
        userRentals: userRentals.length
      });
      
      // Update the user in the main users array
      const updatedUsers = users.map((user: any) => 
        user.id === selectedUser.id 
          ? { 
              ...user, 
              initialCredits: newInitialCredits,
              credits: newCurrentCredits 
            }
          : user
      );
      localStorage.setItem('paddlenepal_users', JSON.stringify(updatedUsers));
      
      // Update current user if it's the same user
      const currentUser = JSON.parse(localStorage.getItem('paddlenepal_current_user') || 'null');
      if (currentUser && currentUser.id === selectedUser.id) {
        const updatedCurrentUser = { 
          ...currentUser, 
          initialCredits: newInitialCredits,
          credits: newCurrentCredits 
        };
        localStorage.setItem('paddlenepal_current_user', JSON.stringify(updatedCurrentUser));
        console.log('Updated current user:', updatedCurrentUser);
      }
      
      alert(`Successfully added ${creditsToAdd} credits to ${selectedUser.name}. New balance: ${newCurrentCredits} credits`);
      setShowAddCreditsModal(false);
      setSelectedUser(null);
      
      // Add a small delay to ensure localStorage is updated before refreshing
      setTimeout(() => {
      fetchUsers();
      }, 100);
    } catch (error) {
      console.error('Error adding credits:', error);
      alert('Failed to add credits');
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gradient-to-r from-green-200 to-teal-200 rounded-xl w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Mobile Filter */}
      <div className="bg-white rounded-2xl shadow-xl p-4 border border-gray-100">
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 bg-white"
        >
          <option value="">All Roles</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {/* Mobile Users List */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-green-500 to-teal-500 px-4 py-4">
          <h3 className="text-white font-semibold flex items-center">
            <Users className="w-5 h-5 mr-2" />
            User Management ({users.length})
          </h3>
        </div>
        
        <div className="divide-y divide-gray-100">
              {users.map((user) => (
            <div key={user.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                  <div>
                    <div className="text-lg font-semibold text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                    <span className={`px-3 py-1 text-xs rounded-full font-semibold ${
                      user.role === 'admin' 
                        ? 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border border-red-300' 
                        : 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-300'
                    }`}>
                      {user.role}
                    </span>
                    </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-1">Credits</div>
                  <div className="text-lg font-bold text-green-600">रू{user.credits || 0}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-1">Rentals</div>
                  <div className="text-lg font-bold text-blue-600">{user.totalRentals || 0}</div>
                </div>
              </div>
              
              {/* Mobile Action Buttons */}
              <div className="flex space-x-2">
                <Button
                        onClick={() => openAddCreditsModal(user)}
                  className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-2 px-3 rounded-lg text-sm font-medium"
                      >
                  <CreditCard className="w-4 h-4 mr-1" />
                  Add Credits
                </Button>
                      {user.role === 'user' ? (
                  <Button
                          onClick={() => promoteToAdmin(user.id)}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-2 px-3 rounded-lg text-sm font-medium"
                        >
                    <UserCheck className="w-4 h-4 mr-1" />
                    Make Admin
                  </Button>
                      ) : (
                  <Button
                          onClick={() => demoteToUser(user.id)}
                    className="flex-1 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white py-2 px-3 rounded-lg text-sm font-medium"
                        >
                    <UserCheck className="w-4 h-4 mr-1" />
                    Remove Admin
                  </Button>
                      )}
                <Button
                        onClick={() => deleteUser(user.id)}
                  className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-2 px-3 rounded-lg text-sm font-medium"
                      >
                        <Trash2 className="w-4 h-4" />
                </Button>
                    </div>
            </div>
              ))}
        </div>
        
        {users.length === 0 && (
          <div className="p-8 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Users Found</h3>
            <p className="text-gray-600">No users match your search criteria.</p>
          </div>
        )}
      </div>

      {/* Add Credits Modal */}
      {showAddCreditsModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Add Credits</h3>
              <p className="text-gray-600">Add credits to user account</p>
            </div>
            
            {/* User Info */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                  <div className="font-semibold text-gray-900">{selectedUser.name}</div>
                  <div className="text-sm text-gray-600">{selectedUser.email}</div>
                  </div>
                  <div className="text-right">
                  <div className="text-xs text-gray-500">Current Credits</div>
                  <div className="text-2xl font-bold text-green-600">रू{selectedUser.credits || 0}</div>
                  </div>
                </div>
              </div>

            {/* Credits Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Credits to Add</label>
                <div className="flex items-center space-x-3">
                  <button
                  onClick={() => setCreditsToAdd(Math.max(0, creditsToAdd - 50))}
                  className="w-12 h-12 border-2 border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all duration-200 flex items-center justify-center font-bold text-gray-600"
                  >
                    -
                  </button>
                <div className="flex-1 text-center">
                  <div className="text-3xl font-bold text-green-600">{creditsToAdd}</div>
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
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
                <div className="text-sm text-blue-600 mb-1">New Balance</div>
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
                  Cancel
              </Button>
              <Button
                  onClick={addCredits}
                className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3 px-4 rounded-xl font-medium"
                >
                  Add Credits
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
  const [bicycles, setBicycles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const router = useRouter(); // Added useRouter here

  useEffect(() => {
    fetchBicycles();
  }, [searchTerm, statusFilter, refreshTrigger]);

  const fetchBicycles = async () => {
    try {
      // Get bicycles from localStorage
      const allBicycles = JSON.parse(localStorage.getItem('paddlenepal_bicycles') || '[]');
      
      // Apply filters
      let filteredBicycles = allBicycles;
      
      if (statusFilter) {
        filteredBicycles = filteredBicycles.filter((bicycle: any) => bicycle.status === statusFilter);
      }
      
      setBicycles(filteredBicycles);
    } catch (error) {
      console.error('Error fetching bicycles:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteBicycle = async (bicycleId: string) => {
    if (!confirm('Are you sure you want to delete this station?')) return;

    try {
      const bicycles = JSON.parse(localStorage.getItem('paddlenepal_bicycles') || '[]');
      const updatedBicycles = bicycles.filter((bicycle: any) => bicycle.id !== bicycleId);
      localStorage.setItem('paddlenepal_bicycles', JSON.stringify(updatedBicycles));
      
      fetchBicycles();
    } catch (error) {
      console.error('Error deleting bicycle:', error);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gradient-to-r from-orange-200 to-red-200 rounded-xl w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Mobile Filter */}
      <div className="bg-white rounded-2xl shadow-xl p-4 border border-gray-100">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200 bg-white"
          >
            <option value="">All Status</option>
            <option value="available">Available</option>
            <option value="rented">Rented</option>
          </select>
      </div>

      {/* Mobile Stations List */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-orange-500 to-red-500 px-4 py-4">
          <h3 className="text-white font-semibold flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            Station Management ({bicycles.length})
          </h3>
        </div>
        
        <div className="divide-y divide-gray-100">
              {bicycles.map((bicycle) => (
            <div key={bicycle.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                    <MapPin className="w-6 h-6" />
                      </div>
                  <div>
                    <div className="text-lg font-semibold text-gray-900">{bicycle.name}</div>
                    <div className="text-sm text-gray-500">{bicycle.location}</div>
                      </div>
                    </div>
                    <span className={`px-3 py-1 text-xs rounded-full font-semibold ${
                      bicycle.status === 'available' 
                        ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300' 
                        : 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border border-yellow-300'
                    }`}>
                      {bicycle.status}
                    </span>
                    </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-1">Hourly Rate</div>
                  <div className="text-lg font-bold text-orange-600">रू{bicycle.hourlyRate || 25}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-1">Daily Rate</div>
                  <div className="text-lg font-bold text-red-600">रू{bicycle.dailyRate || 250}</div>
                </div>
              </div>
              
              {/* Mobile Action Buttons */}
              <div className="flex space-x-2">
                <Button
                  onClick={() => router.push(`/admin/add-station?edit=${bicycle.id}`)}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-2 px-3 rounded-lg text-sm font-medium"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                <Button
                      onClick={() => deleteBicycle(bicycle.id)}
                  className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-2 px-3 rounded-lg text-sm font-medium"
                    >
                      <Trash2 className="w-4 h-4" />
                </Button>
        </div>
      </div>
          ))}
    </div>
        
        {bicycles.length === 0 && (
          <div className="p-8 text-center">
            <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Stations Found</h3>
            <p className="text-gray-600">No stations available.</p>
      </div>
        )}
      </div>
      </div>
  );
}

export default function AdminDashboardWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <AdminDashboard />
    </ErrorBoundary>
  );
}


