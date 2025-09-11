// Test user creation utility for development and testing
export const createTestUsers = () => {
  const testUsers = [
    {
      id: 'test_user_1',
      name: 'Test User',
      email: 'test@example.com',
      mobile: '1234567890',
      password: 'password123',
      role: 'user' as const,
      credits: 1000,
      total_rentals: 0,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'test_admin_1',
      name: 'Test Admin',
      email: 'admin@example.com',
      mobile: '0987654321',
      password: 'admin123',
      role: 'admin' as const,
      credits: 5000,
      total_rentals: 0,
      createdAt: new Date().toISOString(),
    }
  ];

  // Store test users in localStorage
  localStorage.setItem('pedalnepal_users', JSON.stringify(testUsers));
  
  console.log('Test users created:', testUsers);
  return testUsers;
};

// Function to clear test data
export const clearTestData = () => {
  localStorage.removeItem('pedalnepal_users');
  localStorage.removeItem('pedalnepal_current_user');
  localStorage.removeItem('pedalnepal_rentals');
  localStorage.removeItem('pedalnepal_reviews');
  localStorage.removeItem('pedalnepal_active_sessions');
  localStorage.removeItem('pedalnepal_inactive_sessions');
  console.log('Test data cleared');
};

// Make functions available globally for testing
if (typeof window !== 'undefined') {
  (window as any).createTestUsers = createTestUsers;
  (window as any).clearTestData = clearTestData;
}
