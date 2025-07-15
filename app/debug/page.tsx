'use client';

import { useAuth } from '@/components/AuthContext';
import { useState, useEffect } from 'react';

export default function DebugPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [schema, setSchema] = useState<any>(null);

  useEffect(() => {
    // Fetch debug data
    fetch('/api/debug/user')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setUsers(data.users);
        }
      })
      .catch(console.error);

    fetch('/api/debug/schema')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setSchema(data);
        }
      })
      .catch(console.error);
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Debug Information</h1>
      
      <div className="space-y-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-3">Current User</h2>
          <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-3">All Users</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="px-4 py-2 border">Username</th>
                  <th className="px-4 py-2 border">Email</th>
                  <th className="px-4 py-2 border">Role</th>
                  <th className="px-4 py-2 border">Created</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-4 py-2 border">{user.username}</td>
                    <td className="px-4 py-2 border">{user.email}</td>
                    <td className="px-4 py-2 border">
                      <span className={`px-2 py-1 rounded text-xs ${
                        user.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-2 border">{new Date(user.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-3">Database Schema</h2>
          <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
            {JSON.stringify(schema, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
} 