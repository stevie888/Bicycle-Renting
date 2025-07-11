# Backend API Documentation

This project uses Next.js API routes as the backend. All API endpoints are located in the `app/api/` directory.

## Getting Started

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Test the backend:**
   Visit `http://localhost:3000/api/test` to verify the backend is working.

## API Endpoints

### Authentication

#### POST `/api/auth/login`
Login with username/email and password.

**Request Body:**
```json
{
  "username": "john_doe",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "1234567890",
    "username": "john_doe",
    "email": "john@example.com",
    "name": "John Doe",
    "mobile": "+1234567890",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Login successful"
}
```

#### POST `/api/auth/signup`
Register a new user.

**Request Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123",
  "name": "John Doe",
  "mobile": "+1234567890"
}
```

### User Management

#### GET `/api/users/profile?userId=123`
Get user profile by ID.

#### PUT `/api/users/profile?userId=123`
Update user profile.

**Request Body:**
```json
{
  "name": "John Doe Updated",
  "email": "john.updated@example.com",
  "mobile": "+1234567890",
  "profileImage": "data:image/jpeg;base64,..."
}
```

### Umbrella Management

#### GET `/api/umbrellas`
Get all umbrellas with optional filters.

**Query Parameters:**
- `status`: Filter by status (`available`, `rented`, `maintenance`)
- `location`: Filter by location

#### POST `/api/umbrellas`
Create a new umbrella.

**Request Body:**
```json
{
  "name": "Premium Umbrella",
  "description": "High-quality umbrella for rent",
  "location": "Central Park",
  "hourlyRate": 5,
  "dailyRate": 20,
  "image": "data:image/jpeg;base64,..."
}
```

### Rental Management

#### GET `/api/rentals`
Get all rentals with optional filters.

**Query Parameters:**
- `userId`: Filter by user ID
- `status`: Filter by status (`active`, `completed`, `cancelled`)

#### POST `/api/rentals`
Create a new rental.

**Request Body:**
```json
{
  "userId": "1234567890",
  "umbrellaId": "umbrella123",
  "startTime": "2024-01-01T10:00:00.000Z",
  "endTime": "2024-01-01T18:00:00.000Z"
}
```

## Data Storage

The backend uses JSON files for data storage in the `data/` directory:
- `data/users.json` - User data
- `data/umbrellas.json` - Umbrella data
- `data/rentals.json` - Rental data

## Frontend Integration

Use the API utility functions in `lib/api.ts` to make requests from the frontend:

```typescript
import { api } from '@/lib/api';

// Login
const loginResult = await api.auth.login('username', 'password');

// Get user profile
const profile = await api.user.getProfile('userId');

// Get available umbrellas
const umbrellas = await api.umbrella.getAll({ status: 'available' });

// Create rental
const rental = await api.rental.create({
  userId: 'userId',
  umbrellaId: 'umbrellaId',
  startTime: new Date().toISOString()
});
```

## Error Handling

All API endpoints return consistent error responses:

```json
{
  "error": "Error message"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

## Development Notes

- Passwords are stored in plain text (for development only)
- No authentication middleware implemented yet
- File-based storage for simplicity
- CORS is handled by Next.js automatically
- All endpoints support JSON request/response

## Next Steps

1. Add password hashing
2. Implement JWT authentication
3. Add input validation middleware
4. Implement database (PostgreSQL/MongoDB)
5. Add file upload for images
6. Implement payment processing
7. Add admin endpoints
8. Add email notifications 