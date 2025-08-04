"use client";

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export default function DebugStoragePage() {
  const [localStorageData, setLocalStorageData] = useState<any>({});
  const [testResult, setTestResult] = useState<string>('');

  useEffect(() => {
    // Load localStorage data
    const loadData = () => {
      const data: any = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          try {
            data[key] = JSON.parse(localStorage.getItem(key) || 'null');
          } catch (e) {
            data[key] = localStorage.getItem(key);
          }
        }
      }
      setLocalStorageData(data);
    };

    loadData();
  }, []);

  const testSignup = async () => {
    try {
      // Generate a random mobile number to avoid conflicts
      const randomMobile = `+977-984${Math.floor(Math.random() * 9000000) + 1000000}`;
      const result = await api.auth.signup({
        mobile: randomMobile,
        email: 'test@example.com',
        password: 'password',
        name: 'Test User'
      });
      setTestResult(`Signup successful: ${JSON.stringify(result, null, 2)}`);
      // Reload data
      setTimeout(() => {
        const data: any = {};
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key) {
            try {
              data[key] = JSON.parse(localStorage.getItem(key) || 'null');
            } catch (e) {
              data[key] = localStorage.getItem(key);
            }
          }
        }
        setLocalStorageData(data);
      }, 100);
    } catch (error) {
      setTestResult(`Signup failed: ${error}`);
    }
  };

  const testLogin = async () => {
    try {
      const result = await api.auth.login('+977-9841234599', 'password');
      setTestResult(`Login successful: ${JSON.stringify(result, null, 2)}`);
    } catch (error) {
      setTestResult(`Login failed: ${error}`);
    }
  };

  const clearStorage = () => {
    localStorage.clear();
    setLocalStorageData({});
    setTestResult('LocalStorage cleared');
  };

  const clearPaddleNepalStorage = () => {
    if ((window as any).clearPaddleNepalStorage) {
      (window as any).clearPaddleNepalStorage();
      setTimeout(() => {
        const data: any = {};
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key) {
            try {
              data[key] = JSON.parse(localStorage.getItem(key) || 'null');
            } catch (e) {
              data[key] = localStorage.getItem(key);
            }
          }
        }
        setLocalStorageData(data);
      }, 100);
      setTestResult('PaddleNepal storage cleared and reinitialized');
    } else {
      setTestResult('clearPaddleNepalStorage function not available');
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">LocalStorage Debug Page</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">LocalStorage Data</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
            {JSON.stringify(localStorageData, null, 2)}
          </pre>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Test Functions</h2>
          <div className="space-y-4">
            <button
              onClick={testSignup}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Test Signup
            </button>
            
            <button
              onClick={testLogin}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 ml-2"
            >
              Test Login
            </button>
            
            <button
              onClick={clearStorage}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 ml-2"
            >
              Clear All Storage
            </button>
            
            <button
              onClick={clearPaddleNepalStorage}
              className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 ml-2"
            >
              Clear PaddleNepal Storage
            </button>
          </div>
          
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Test Result:</h3>
            <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-48">
              {testResult}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
} 