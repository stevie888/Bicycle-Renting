'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import Card from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Modal from '@/components/ui/modal';
import { Users, Umbrella, BarChart3, Plus, Search, Edit, Trash2 } from 'lucide-react';

interface DashboardStats {
  users: {
    totalUsers: number;
    adminUsers: number;
    regularUsers: number;
  };
  umbrellas: {
    totalUmbrellas: number;
    availableUmbrellas: number;
    outOfStockUmbrellas: number;
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
  umbrellas: any[];
  rentals: any[];
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recent, setRecent] = useState<RecentActivity | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'umbrellas'>('overview');
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalType, setModalType] = useState<'user' | 'umbrella'>('user');
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show access denied for non-admin users
  if (user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">You don't have permission to access the admin dashboard.</p>
          <Button onClick={() => router.push('/')} className="bg-blue-600 hover:bg-blue-700">
            Go to Home
          </Button>
        </div>
      </div>
    );
  }

  const fetchDashboardData = async () => {
    try {
      console.log('Fetching dashboard data...');
      const response = await fetch('/api/admin/dashboard');
      const data = await response.json();
      
      console.log('Dashboard API response:', data);
      
      if (data.success) {
        setStats(data.stats);
        setRecent(data.recent);
      } else {
        console.error('Dashboard API returned error:', data.error, data.details);
        throw new Error(data.details || data.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // You could add a toast notification here to show the error to the user
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = (type: 'user' | 'umbrella') => {
    setModalType(type);
    setShowAddModal(true);
  };

  const handleModalClose = () => {
    setShowAddModal(false);
    // Trigger refresh by incrementing the trigger
    setRefreshTrigger(prev => prev + 1);
    // Refresh dashboard data after modal closes
    fetchDashboardData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
      
            </div>
            <div className="flex space-x-3">
              <Button
                onClick={() => handleAddItem('user')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add User
              </Button>
              <Button
                onClick={() => handleAddItem('umbrella')}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Umbrella
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'users', label: 'Users', icon: Users },
              { id: 'umbrellas', label: 'Umbrellas', icon: Umbrella },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card titleRender={<div>Total Users</div>} bodyRender={<>{
                <>
                  <div className="text-2xl font-bold">{stats?.users.totalUsers || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats?.users.adminUsers || 0} admins, {stats?.users.regularUsers || 0} regular users
                  </p>
                </>
              }</>} />

              <Card titleRender={<div>Total Umbrellas</div>} bodyRender={<>{
                <>
                  <div className="text-2xl font-bold">{stats?.umbrellas.totalUmbrellas || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats?.umbrellas.availableUmbrellas || 0} available, {stats?.umbrellas.outOfStockUmbrellas || 0} out of stock
                  </p>
                </>
              }</>} />

              <Card titleRender={<div>Total Rentals</div>} bodyRender={<>{
                <>
                  <div className="text-2xl font-bold">{stats?.rentals.totalRentals || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats?.rentals.activeRentals || 0} active, {stats?.rentals.completedRentals || 0} completed
                  </p>
                </>
              }</>} />
            </div>

            {/* Recent Activities */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card titleRender={<div>Recent Users</div>} bodyRender={<>{
                <div className="space-y-3">
                  {recent?.users.map((user: any) => (
                    <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded ${
                        user.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role}
                      </span>
                    </div>
                  ))}
                </div>
              }</>} />

              <Card titleRender={<div>Recent Umbrellas</div>} bodyRender={<>{
                <div className="space-y-3">
                  {recent?.umbrellas.map((umbrella: any) => (
                    <div key={umbrella.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium">{umbrella.description}</p>
                        <p className="text-sm text-gray-600">{umbrella.location}</p>
                        <p className="text-xs text-gray-500">
                          {umbrella.updated_at ? `Updated: ${new Date(umbrella.updated_at).toLocaleDateString()}` : ''}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded ${
                        umbrella.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {umbrella.status}
                      </span>
                    </div>
                  ))}
                </div>
              }</>} />

              <Card titleRender={<div>Recent Rentals</div>} bodyRender={<>{
                <div className="space-y-3">
                  {recent?.rentals.map((rental: any) => (
                    <div key={rental.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium">{rental.username}</p>
                        <p className="text-sm text-gray-600">{rental.description}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded ${
                        rental.status === 'active' ? 'bg-green-100 text-green-800' : 
                        rental.status === 'completed' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {rental.status}
                      </span>
                    </div>
                  ))}
                </div>
              }</>} />
            </div>
          </div>
        )}

        {activeTab === 'users' && <UsersManagement refreshTrigger={refreshTrigger} />}
        {activeTab === 'umbrellas' && <UmbrellasManagement refreshTrigger={refreshTrigger} />}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <Modal
          isOpen={showAddModal}
          onClose={handleModalClose}
          title={`Add New ${modalType === 'user' ? 'User' : 'Umbrella'}`}
        >
          {modalType === 'user' ? <AddUserForm onSuccess={handleModalClose} /> : <AddUmbrellaForm onSuccess={handleModalClose} />}
        </Modal>
      )}
    </div>
  );
}

// Users Management Component
function UsersManagement({ refreshTrigger }: { refreshTrigger: number }) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [searchTerm, roleFilter, refreshTrigger]);

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (roleFilter) params.append('role', roleFilter);

      const response = await fetch(`/api/admin/users?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        fetchUsers();
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const promoteToAdmin = async (userId: string) => {
    if (!confirm('Are you sure you want to promote this user to admin?')) return;

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: 'admin' }),
      });
      
      if (response.ok) {
        fetchUsers();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to promote user');
      }
    } catch (error) {
      console.error('Error promoting user:', error);
      alert('Failed to promote user');
    }
  };

  const demoteToUser = async (userId: string) => {
    if (!confirm('Are you sure you want to demote this admin to user?')) return;

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: 'user' }),
      });
      
      if (response.ok) {
        fetchUsers();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to demote user');
      }
    } catch (error) {
      console.error('Error demoting user:', error);
      alert('Failed to demote user');
    }
  };

  if (loading) {
    return <div className="animate-pulse">Loading users...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="">All Roles</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded ${
                      user.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      {user.role === 'user' ? (
                        <button
                          onClick={() => promoteToAdmin(user.id)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Promote to Admin"
                        >
                          <Users className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => demoteToUser(user.id)}
                          className="text-orange-600 hover:text-orange-900"
                          title="Demote to User"
                        >
                          <Users className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteUser(user.id)}
                        className="text-red-600 hover:text-red-900"
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
    </div>
  );
}

// Umbrellas Management Component
function UmbrellasManagement({ refreshTrigger }: { refreshTrigger: number }) {
  const [umbrellas, setUmbrellas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchUmbrellas();
  }, [searchTerm, statusFilter, refreshTrigger]);

  const fetchUmbrellas = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter) params.append('status', statusFilter);

      const response = await fetch(`/api/admin/umbrellas?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setUmbrellas(data.umbrellas);
      }
    } catch (error) {
      console.error('Error fetching umbrellas:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteUmbrella = async (umbrellaId: string) => {
    if (!confirm('Are you sure you want to delete this umbrella?')) return;

    try {
      const response = await fetch(`/api/admin/umbrellas/${umbrellaId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        fetchUmbrellas();
      }
    } catch (error) {
      console.error('Error deleting umbrella:', error);
    }
  };

  if (loading) {
    return <div className="animate-pulse">Loading umbrellas...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <Input
            placeholder="Search umbrellas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="">All Status</option>
          <option value="available">Available</option>
          <option value="rented">Rented</option>
        </select>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Umbrella</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inventory</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {umbrellas.map((umbrella) => (
                <tr key={umbrella.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{umbrella.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {umbrella.location}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded ${
                      umbrella.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {umbrella.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {umbrella.inventory || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {umbrella.updated_at ? new Date(umbrella.updated_at).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => deleteUmbrella(umbrella.id)}
                      className="text-red-600 hover:text-red-900"
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

// Add User Form Component
function AddUserForm({ onSuccess }: { onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    name: '',
    mobile: '',
    role: 'user'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error creating user:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Username</label>
        <Input
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <Input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Password</label>
        <Input
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Name</label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Mobile</label>
        <Input
          value={formData.mobile}
          onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Role</label>
        <select
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          className="w-full border rounded px-3 py-2"
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Creating...' : 'Create User'}
      </Button>
    </form>
  );
}

// Add Umbrella Form Component
function AddUmbrellaForm({ onSuccess }: { onSuccess: () => void }) {
  const stationOptions = [
    { station: 'Station 1', location: 'Kathmandu' },
    { station: 'Station 2', location: 'Lalitpur' },
    { station: 'Station 3', location: 'Bhaktapur' },
  ];
  const [formData, setFormData] = useState({
    description: '',
    quantity: 1,
    location: '',
    status: 'available'
  });
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = stationOptions.find(opt => opt.station === e.target.value);
    setFormData({
      ...formData,
      description: e.target.value,
      location: selected ? selected.location : ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/admin/umbrellas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        setSuccessMessage(data.message);
        
        // Reset form
        setFormData({
          description: '',
          quantity: 1,
          location: '',
          status: 'available'
        });

        // Show success message for 3 seconds, then close modal
        setTimeout(() => {
          setSuccessMessage('');
          onSuccess();
        }, 3000);
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error || 'Failed to create umbrella'}`);
      }
    } catch (error) {
      console.error('Error creating umbrella:', error);
      alert('Error creating umbrella. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {successMessage && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          {successMessage}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <select
            value={formData.description}
            onChange={handleDescriptionChange}
            required
            className="w-full border rounded px-3 py-2"
          >
            <option value="">Select a station</option>
            {stationOptions.map(opt => (
              <option key={opt.station} value={opt.station}>{opt.station}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Quantity</label>
          <input
            type="number"
            min={1}
            value={formData.quantity}
            onChange={e => setFormData({ ...formData, quantity: Number(e.target.value) })}
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Location</label>
          <select
            value={formData.location}
            disabled
            className="w-full border rounded px-3 py-2 bg-gray-100 text-gray-700"
          >
            <option value="">Select a location</option>
            {stationOptions.map(opt => (
              <option key={opt.location} value={opt.location}>{opt.location}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Status</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="w-full border rounded px-3 py-2"
          >
            <option value="available">Available</option>
            <option value="rented">Rented</option>
          </select>
        </div>
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Creating...' : 'Create Umbrella'}
        </Button>
      </form>
    </div>
  );
} 