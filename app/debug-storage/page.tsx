"use client";

import { useState, useEffect } from "react";

export default function DebugStoragePage() {
  const [users, setUsers] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    // Load data from localStorage
    const loadData = () => {
      const storedUsers = localStorage.getItem('paddlenepal_users');
      const storedCurrentUser = localStorage.getItem('paddlenepal_current_user');
      
      if (storedUsers) {
        setUsers(JSON.parse(storedUsers));
      }
      
      if (storedCurrentUser) {
        setCurrentUser(JSON.parse(storedCurrentUser));
      }
    };

    loadData();
  }, []);

  const clearStorage = () => {
    localStorage.removeItem('paddlenepal_users');
    localStorage.removeItem('paddlenepal_current_user');
    localStorage.removeItem('paddlenepal_bicycles');
    localStorage.removeItem('paddlenepal_rentals');
    setUsers([]);
    setCurrentUser(null);
    alert('Storage cleared! Refresh the page to reinitialize.');
  };

  const reinitializeStorage = () => {
    // Clear storage first
    clearStorage();
    // Force reinitialization by reloading
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Debug Storage</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Users Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Users in localStorage</h2>
            {users.length === 0 ? (
              <p className="text-gray-500">No users found in localStorage</p>
            ) : (
              <div className="space-y-4">
                {users.map((user, index) => (
                  <div key={index} className="border rounded-lg p-4 bg-gray-50">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div><strong>ID:</strong> {user.id}</div>
                      <div><strong>Name:</strong> {user.name}</div>
                      <div><strong>Mobile:</strong> {user.mobile}</div>
                      <div><strong>Email:</strong> {user.email}</div>
                      <div><strong>Role:</strong> {user.role}</div>
                      <div><strong>Credits:</strong> {user.credits}</div>
                      <div><strong>Password:</strong> {user.password ? '✅ Set' : '❌ Missing'}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Current User Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Current User</h2>
            {currentUser ? (
              <div className="border rounded-lg p-4 bg-blue-50">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><strong>ID:</strong> {currentUser.id}</div>
                  <div><strong>Name:</strong> {currentUser.name}</div>
                  <div><strong>Mobile:</strong> {currentUser.mobile}</div>
                  <div><strong>Role:</strong> {currentUser.role}</div>
                  <div><strong>Credits:</strong> {currentUser.credits}</div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No current user logged in</p>
            )}
          </div>
        </div>

        {/* Admin Login Test */}
        <div className="bg-white rounded-lg shadow p-6 mt-8">
          <h2 className="text-xl font-semibold mb-4">Admin Login Test</h2>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-yellow-800 mb-2">Admin Credentials:</h3>
            <div className="text-sm space-y-1">
              <div><strong>Mobile:</strong> +977-9841234568</div>
              <div><strong>Password:</strong> password</div>
              <div><strong>Role:</strong> admin</div>
            </div>
          </div>
          
          <div className="space-y-4">
            <button
              onClick={clearStorage}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Clear Storage
            </button>
            
            <button
              onClick={reinitializeStorage}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors ml-4"
            >
              Reinitialize Storage
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-lg shadow p-6 mt-8">
          <h2 className="text-xl font-semibold mb-4">Troubleshooting Steps</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Check if users have password fields (should show "✅ Set")</li>
            <li>If passwords are missing, click "Reinitialize Storage"</li>
            <li>Go to login page and try admin credentials</li>
            <li>If still having issues, try "Clear Storage" then refresh</li>
          </ol>
        </div>
      </div>
    </div>
  );
} 