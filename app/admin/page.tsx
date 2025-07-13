'use client';

import { useState, useEffect } from 'react';
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
    rentedUmbrellas: number;
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
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recent, setRecent] = useState<RecentActivity | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'umbrellas'>('overview');
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalType, setModalType] = useState<'user' | 'umbrella'>('user');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/admin/dashboard');
      const data = await response.json();
      
      if (data.success) {
        setStats(data.stats);
        setRecent(data.recent);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = (type: 'user' | 'umbrella') => {
    setModalType(type);
    setShowAddModal(true);
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
              <p className="text-gray-600">Manage users, umbrellas, and system overview</p>
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
                    {stats?.umbrellas.availableUmbrellas || 0} available, {stats?.umbrellas.rentedUmbrellas || 0} rented
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

        {activeTab === 'users' && <UsersManagement />}
        {activeTab === 'umbrellas' && <UmbrellasManagement />}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <Modal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          title={`Add New ${modalType === 'user' ? 'User' : 'Umbrella'}`}
        >
          {modalType === 'user' ? <AddUserForm onSuccess={() => setShowAddModal(false)} /> : <AddUmbrellaForm onSuccess={() => setShowAddModal(false)} />}
        </Modal>
      )}
    </div>
  );
}

// Users Management Component
function UsersManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [searchTerm, roleFilter]);

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
                    <button
                      onClick={() => deleteUser(user.id)}
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

// Umbrellas Management Component
function UmbrellasManagement() {
  const [umbrellas, setUmbrellas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchUmbrellas();
  }, [searchTerm, statusFilter]);

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
  const [formData, setFormData] = useState({
    description: '',
    location: '',
    status: 'available'
  });
  const [loading, setLoading] = useState(false);

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
        onSuccess();
      }
    } catch (error) {
      console.error('Error creating umbrella:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <Input
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Location</label>
        <Input
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          required
        />
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
  );
} 