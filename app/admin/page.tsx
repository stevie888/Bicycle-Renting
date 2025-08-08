'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import Card from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Modal from '@/components/ui/modal';
import { Users, Bike, BarChart3, Plus, Search, Edit, Trash2, TrendingUp, TrendingDown, Activity, CreditCard, UserCheck, BikeIcon, MapPin, DollarSignIcon } from 'lucide-react';

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

export default function AdminDashboard() {
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
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
            <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Admin Dashboard
                </h1>
                <p className="text-gray-600 text-sm">Manage your PaddleNepal platform</p>
            </div>
            </div>
            <div className="flex space-x-4">
              <Button
                onClick={handleAddUser}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add User
              </Button>
              <Button
                onClick={handleAddStation}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Station
              </Button>

            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white/60 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3, color: 'from-blue-500 to-purple-500' },
              { id: 'users', label: 'Users', icon: Users, color: 'from-green-500 to-teal-500' },
              { id: 'bicycles', label: 'Stations', icon: MapPin, color: 'from-orange-500 to-red-500' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-3 py-6 px-4 border-b-2 font-semibold text-sm rounded-t-lg transition-all duration-200 ${
                  activeTab === tab.id
                    ? `border-gradient-to-r ${tab.color} text-gray-900 bg-white/80 shadow-lg`
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-white/40'
                }`}
              >
                <div className={`p-2 rounded-lg ${activeTab === tab.id ? 'bg-gradient-to-r ' + tab.color + ' text-white' : 'bg-gray-100 text-gray-600'}`}>
                  <tab.icon className="w-5 h-5" />
                </div>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-xl transform hover:scale-105 transition-all duration-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6" />
                  </div>
                  <TrendingUp className="w-8 h-8 text-blue-200" />
                </div>
                <h3 className="text-2xl font-bold mb-2">{stats?.users.totalUsers || 0}</h3>
                <p className="text-blue-100 text-sm">
                    {stats?.users.adminUsers || 0} admins, {stats?.users.regularUsers || 0} regular users
                  </p>
                <div className="mt-4 pt-4 border-t border-blue-400/30">
                  <p className="text-xs text-blue-200">Total Users</p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-xl transform hover:scale-105 transition-all duration-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Bike className="w-6 h-6" />
                  </div>
                  <Activity className="w-8 h-8 text-green-200" />
                </div>
                <h3 className="text-2xl font-bold mb-2">{stats?.bicycles.totalBicycles || 0}</h3>
                <p className="text-green-100 text-sm">
                  {stats?.bicycles.availableBicycles || 0} available, {stats?.bicycles.outOfStockBicycles || 0} out of stock
                </p>
                <div className="mt-4 pt-4 border-t border-green-400/30">
                  <p className="text-xs text-green-200">Total Stations</p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl transform hover:scale-105 transition-all duration-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <TrendingUp className="w-8 h-8 text-purple-200" />
                </div>
                <h3 className="text-2xl font-bold mb-2">{stats?.rentals.totalRentals || 0}</h3>
                <p className="text-purple-100 text-sm">
                    {stats?.rentals.activeRentals || 0} active, {stats?.rentals.completedRentals || 0} completed
                  </p>
                <div className="mt-4 pt-4 border-t border-purple-400/30">
                  <p className="text-xs text-purple-200">Total Rentals</p>
                </div>
              </div>
            </div>

            {/* Recent Activities */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
                  <h3 className="text-white font-semibold flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    Recent Users
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                  {recent?.users.map((user: any) => (
                      <div key={user.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                      <div>
                          <p className="font-semibold text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                        <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                          user.role === 'admin' ? 'bg-red-100 text-red-800 border border-red-200' : 'bg-blue-100 text-blue-800 border border-blue-200'
                      }`}>
                        {user.role}
                      </span>
                    </div>
                  ))}
                </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4">
                  <h3 className="text-white font-semibold flex items-center">
                    <Bike className="w-5 h-5 mr-2" />
                    Recent Stations
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {recent?.bicycles.map((bicycle: any) => (
                      <div key={bicycle.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200">
                      <div>
                          <p className="font-semibold text-gray-900">{bicycle.description}</p>
                          <p className="text-sm text-gray-600">{bicycle.location}</p>
                        <p className="text-xs text-gray-500">
                            {bicycle.updated_at ? `Updated: ${new Date(bicycle.updated_at).toLocaleDateString()}` : ''}
                        </p>
                      </div>
                        <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                          bicycle.status === 'available' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                      }`}>
                          {bicycle.status}
                      </span>
                    </div>
                  ))}
                </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4">
                  <h3 className="text-white font-semibold flex items-center">
                    <CreditCard className="w-5 h-5 mr-2" />
                    Recent Rentals
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                  {recent?.rentals.map((rental: any) => (
                      <div key={rental.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                      <div>
                          <p className="font-semibold text-gray-900">{rental.username}</p>
                        <p className="text-sm text-gray-600">{rental.description}</p>
                      </div>
                        <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                          rental.status === 'active' ? 'bg-green-100 text-green-800 border border-green-200' : 
                          rental.status === 'completed' ? 'bg-blue-100 text-blue-800 border border-blue-200' : 'bg-red-100 text-red-800 border border-red-200'
                      }`}>
                        {rental.status}
                      </span>
                    </div>
                  ))}
                </div>
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
  const [searchTerm, setSearchTerm] = useState('');
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
      
      // Calculate real-time credits for each user based on rental history
      const usersWithUpdatedCredits = allUsers.map((user: any) => {
        const userRentals = allRentals.filter((rental: any) => rental.userId === user.id);
        const totalSpent = userRentals.reduce((sum: number, rental: any) => sum + rental.price, 0);
        const initialCredits = user.initialCredits || 250; // Default starting credits
        const currentCredits = Math.max(0, initialCredits - totalSpent);
        
        return {
          ...user,
          credits: currentCredits,
          totalRentals: userRentals.length,
          totalSpent: totalSpent
        };
      });
      
      // Apply filters
      let filteredUsers = usersWithUpdatedCredits;
      
      if (searchTerm) {
        filteredUsers = filteredUsers.filter((user: any) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.mobile.includes(searchTerm)
        );
      }
      
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
      const users = JSON.parse(localStorage.getItem('paddlenepal_users') || '[]');
      const updatedUsers = users.map((user: any) => 
        user.id === selectedUser.id 
          ? { ...user, initialCredits: (user.initialCredits || 250) + creditsToAdd }
          : user
      );
      localStorage.setItem('paddlenepal_users', JSON.stringify(updatedUsers));
      
      // Update current user if it's the same user
      const currentUser = JSON.parse(localStorage.getItem('paddlenepal_current_user') || 'null');
      if (currentUser && currentUser.id === selectedUser.id) {
        const updatedCurrentUser = { ...currentUser, credits: (currentUser.credits || 0) + creditsToAdd };
        localStorage.setItem('paddlenepal_current_user', JSON.stringify(updatedCurrentUser));
      }
      
      alert(`Successfully added ${creditsToAdd} credits to ${selectedUser.name}`);
      setShowAddCreditsModal(false);
      setSelectedUser(null);
      fetchUsers();
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
    <div className="space-y-8">
      {/* Search and Filter Section */}
      <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
        <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
          <div className="flex-1 w-full md:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
                placeholder="Search users by name, email, or mobile..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200"
          />
            </div>
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 bg-white"
        >
          <option value="">All Roles</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-green-500 to-teal-500 px-6 py-4">
          <h3 className="text-white font-semibold flex items-center">
            <Users className="w-5 h-5 mr-2" />
            User Management
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Credits</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Created</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gradient-to-r hover:from-green-50 hover:to-teal-50 transition-all duration-200">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-semibold text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 text-xs rounded-full font-semibold ${
                      user.role === 'admin' 
                        ? 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border border-red-300' 
                        : 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-300'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <CreditCard className="w-4 h-4 text-green-500 mr-2" />
                      <span className="text-sm font-semibold text-gray-900">{user.credits || 0}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => openAddCreditsModal(user)}
                        className="p-2 text-green-600 hover:text-green-800 hover:bg-green-100 rounded-lg transition-all duration-200"
                        title="Add Credits"
                      >
                        <span className="text-lg">💰</span>
                      </button>
                      {user.role === 'user' ? (
                        <button
                          onClick={() => promoteToAdmin(user.id)}
                          className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg transition-all duration-200"
                          title="Promote to Admin"
                        >
                          <Users className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => demoteToUser(user.id)}
                          className="p-2 text-orange-600 hover:text-orange-800 hover:bg-orange-100 rounded-lg transition-all duration-200"
                          title="Demote to User"
                        >
                          <Users className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteUser(user.id)}
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-lg transition-all duration-200"
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Credits Modal */}
      {showAddCreditsModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl border border-gray-100">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Add Credits</h3>
              <p className="text-gray-600">Add credits to user account</p>
            </div>
            
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-xl p-4 border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900">{selectedUser.name}</h4>
                    <p className="text-sm text-gray-600">{selectedUser.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Current Credits</p>
                    <p className="text-2xl font-bold text-green-600">{selectedUser.credits || 0}</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Credits to Add
                </label>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setCreditsToAdd(Math.max(10, creditsToAdd - 10))}
                    className="w-10 h-10 border-2 border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all duration-200 flex items-center justify-center font-bold text-gray-600"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="10"
                    step="10"
                    value={creditsToAdd}
                    onChange={(e) => setCreditsToAdd(Number(e.target.value))}
                    className="flex-1 border-2 border-gray-300 rounded-lg px-4 py-3 text-center font-semibold focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200"
                  />
                  <button
                    onClick={() => setCreditsToAdd(creditsToAdd + 10)}
                    className="w-10 h-10 border-2 border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all duration-200 flex items-center justify-center font-bold text-gray-600"
                  >
                    +
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Quick amounts: 
                  <button onClick={() => setCreditsToAdd(50)} className="ml-1 text-green-600 hover:underline font-medium">50</button> | 
                  <button onClick={() => setCreditsToAdd(100)} className="ml-1 text-green-600 hover:underline font-medium">100</button> | 
                  <button onClick={() => setCreditsToAdd(250)} className="ml-1 text-green-600 hover:underline font-medium">250</button>
                </p>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm text-blue-800 text-center">
                  <strong>New Balance:</strong> <span className="text-lg font-bold">{(selectedUser.credits || 0) + creditsToAdd} credits</span>
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setShowAddCreditsModal(false)}
                  className="flex-1 py-3 px-4 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all duration-200 font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={addCredits}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl hover:from-green-700 hover:to-teal-700 transition-all duration-200 font-semibold shadow-lg transform hover:scale-105"
                >
                  Add Credits
                </button>
              </div>
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
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchBicycles();
  }, [searchTerm, statusFilter, refreshTrigger]);

  const fetchBicycles = async () => {
    try {
      // Get bicycles from localStorage
      const allBicycles = JSON.parse(localStorage.getItem('paddlenepal_bicycles') || '[]');
      
      // Apply filters
      let filteredBicycles = allBicycles;
      
      if (searchTerm) {
        filteredBicycles = filteredBicycles.filter((bicycle: any) =>
          bicycle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          bicycle.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          bicycle.location.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
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
    <div className="space-y-8">
      {/* Search and Filter Section */}
      <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
        <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
          <div className="flex-1 w-full md:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search stations by name, description, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200"
              />
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200 bg-white"
          >
            <option value="">All Status</option>
            <option value="available">Available</option>
            <option value="rented">Rented</option>
          </select>
        </div>
      </div>

      {/* Stations Table */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-4">
          <h3 className="text-white font-semibold flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            Station Management
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Station</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Location</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Inventory</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Last Updated</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {bicycles.map((bicycle) => (
                <tr key={bicycle.id} className="hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 transition-all duration-200">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-semibold text-gray-900">{bicycle.description}</div>
                        <div className="text-sm text-gray-500">{bicycle.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {bicycle.location}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 text-xs rounded-full font-semibold ${
                      bicycle.status === 'available' 
                        ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300' 
                        : 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border border-yellow-300'
                    }`}>
                      {bicycle.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Activity className="w-4 h-4 text-orange-500 mr-2" />
                      {bicycle.inventory || 0}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {bicycle.updated_at ? new Date(bicycle.updated_at).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => deleteBicycle(bicycle.id)}
                      className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-lg transition-all duration-200"
                      title="Delete Station"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

 