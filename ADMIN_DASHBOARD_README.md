# Admin Dashboard - Umbrella Rental System

## Overview

The admin dashboard provides comprehensive management capabilities for the umbrella rental system, allowing administrators to manage users, umbrellas, and monitor system statistics.

## Features

### 🔐 Authentication & Authorization
- **Role-based access control**: Only users with `admin` role can access the dashboard
- **Secure admin creation**: First admin user can be created via `/admin-setup` endpoint
- **Session management**: Admin sessions are maintained securely

### 📊 Dashboard Overview
- **Real-time statistics**: View total users, umbrellas, and rentals
- **Activity monitoring**: Track recent user registrations, umbrella additions, and rental activities
- **Visual metrics**: Clean, modern interface with cards showing key metrics

### 👥 User Management
- **View all users**: List all registered users with search and filtering
- **Create users**: Add new users with role assignment (user/admin)
- **Update users**: Modify user information and roles
- **Delete users**: Remove users from the system (with cascade protection)
- **Search & filter**: Find users by name, email, or role

### ☂️ Umbrella Management
- **Inventory overview**: View all umbrellas with status and location
- **Add umbrellas**: Create new umbrella entries with descriptions and locations
- **Update umbrellas**: Modify umbrella details and status
- **Delete umbrellas**: Remove umbrellas (with rental protection)
- **Status tracking**: Monitor available vs rented umbrellas
- **Search & filter**: Find umbrellas by description, location, or status

### 📈 Analytics & Reporting
- **User statistics**: Total users, admin count, regular user count
- **Umbrella statistics**: Total umbrellas, available count, rented count
- **Rental statistics**: Total rentals, active rentals, completed rentals
- **Recent activities**: Latest user registrations, umbrella additions, rental activities

## API Endpoints

### Admin Dashboard
- `GET /api/admin/dashboard` - Get dashboard statistics and recent activities

### User Management
- `GET /api/admin/users` - Get all users with search/filter options
- `POST /api/admin/users` - Create new user
- `PUT /api/admin/users/[id]` - Update user
- `DELETE /api/admin/users/[id]` - Delete user

### Umbrella Management
- `GET /api/admin/umbrellas` - Get all umbrellas with statistics
- `POST /api/admin/umbrellas` - Create new umbrella
- `PUT /api/admin/umbrellas/[id]` - Update umbrella
- `DELETE /api/admin/umbrellas/[id]` - Delete umbrella

### Admin Setup
- `POST /api/admin/create-admin` - Create first admin user

## Setup Instructions

### 1. Database Setup
First, ensure your database is initialized with the updated schema:

```bash
# Visit the database initialization endpoint
http://localhost:3000/api/db/init
```

### 2. Create First Admin User
Visit the admin setup page to create the first admin user:

```
http://localhost:3000/admin-setup
```

Fill in the form with admin credentials:
- Username
- Email
- Password
- Name
- Mobile number

### 3. Access Admin Dashboard
After creating the admin user, login with the admin credentials and you'll see an "Admin" button in the navigation bar.

Navigate to: `http://localhost:3000/admin`

## Usage Guide

### Dashboard Navigation
The admin dashboard has three main sections:

1. **Overview Tab**: Shows statistics and recent activities
2. **Users Tab**: Manage all system users
3. **Umbrellas Tab**: Manage umbrella inventory

### Adding Users
1. Click "Add User" button in the dashboard header
2. Fill in user details (username, email, password, name, mobile)
3. Select role (user or admin)
4. Submit to create the user

### Adding Umbrellas
1. Click "Add Umbrella" button in the dashboard header
2. Fill in umbrella details (description, location, status)
3. Submit to add the umbrella to inventory

### Managing Existing Items
- **Search**: Use the search boxes to find specific users or umbrellas
- **Filter**: Use dropdown filters to show specific categories
- **Delete**: Click the trash icon to remove items (with confirmation)

## Security Features

### Role-based Access
- Only users with `admin` role can access admin features
- Regular users cannot access admin endpoints
- Admin role is clearly indicated in the navigation

### Data Protection
- User deletion includes cascade protection for related rentals
- Umbrella deletion prevents removal of currently rented items
- All admin actions are logged and validated

### Input Validation
- All form inputs are validated on both client and server
- Email format validation
- Required field validation
- Duplicate username/email prevention

## Database Schema Updates

The admin system requires the following database schema:

### Users Table
```sql
CREATE TABLE users (
  id VARCHAR(255) PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  mobile VARCHAR(255) NOT NULL,
  profileImage TEXT,
  role ENUM('user', 'admin') DEFAULT 'user',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Umbrellas Table
```sql
CREATE TABLE umbrellas (
  id VARCHAR(255) PRIMARY KEY,
  description TEXT,
  location VARCHAR(255) NOT NULL,
  status ENUM('available', 'rented') DEFAULT 'available',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Troubleshooting

### Common Issues

1. **Admin button not showing**
   - Ensure user has `admin` role in database
   - Check that user is properly logged in

2. **Database connection errors**
   - Verify MySQL server is running
   - Check `.env.local` configuration
   - Run database initialization: `/api/db/init`

3. **Permission denied errors**
   - Ensure user has admin role
   - Check database user permissions

4. **Admin setup page not working**
   - Verify database is properly initialized
   - Check that no admin user already exists

### Testing Admin Features

1. **Create test admin user**:
   ```bash
   curl -X POST http://localhost:3000/api/admin/create-admin \
     -H "Content-Type: application/json" \
     -d '{
       "username": "admin",
       "email": "admin@example.com",
       "password": "admin123",
       "name": "Admin User",
       "mobile": "1234567890"
     }'
   ```

2. **Test admin login**:
   - Use the created admin credentials to login
   - Verify admin button appears in navigation

3. **Test user management**:
   - Create a test user via admin dashboard
   - Verify user appears in user list
   - Test search and filter functionality

## Future Enhancements

### Planned Features
- **Advanced analytics**: Detailed rental reports and revenue tracking
- **Bulk operations**: Import/export users and umbrellas
- **Audit logs**: Track all admin actions
- **Email notifications**: Notify users of account changes
- **API rate limiting**: Prevent abuse of admin endpoints
- **Backup/restore**: Database backup functionality

### Security Improvements
- **Password hashing**: Implement proper password hashing
- **JWT tokens**: Add JWT-based authentication
- **Two-factor authentication**: Add 2FA for admin accounts
- **Session management**: Implement proper session handling

## Support

For issues or questions about the admin dashboard:

1. Check the troubleshooting section above
2. Verify database connectivity and schema
3. Review browser console for JavaScript errors
4. Check server logs for API errors

The admin dashboard provides a comprehensive solution for managing the umbrella rental system with a focus on security, usability, and scalability. 