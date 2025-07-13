'use client';

import { useState } from 'react';
import Card from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function AdminSetup() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    name: '',
    mobile: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/admin/create-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Admin user created successfully! You can now login with these credentials.');
        setFormData({ username: '', email: '', password: '', name: '', mobile: '' });
      } else {
        setMessage(data.error || 'Failed to create admin user');
      }
    } catch (error) {
      setMessage('An error occurred while creating admin user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <Card 
        className="w-full max-w-md"
        titleRender={
          <div className="text-center">
            <h2 className="text-xl font-bold">Admin Setup</h2>
            <p className="text-gray-600 text-sm">
              Create the first admin user for the system
            </p>
          </div>
        }
        bodyRender={
          <div className="space-y-4">
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
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Creating Admin...' : 'Create Admin User'}
              </Button>
            </form>
            
            {message && (
              <div className={`mt-4 p-3 rounded ${
                message.includes('successfully') 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {message}
              </div>
            )}
          </div>
        }
      />
    </div>
  );
} 