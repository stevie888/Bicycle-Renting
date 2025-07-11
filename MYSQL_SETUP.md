# MySQL Database Setup Guide

This guide will help you set up MySQL with MySQL Workbench for your umbrella renting app.

## Prerequisites

1. **Install MySQL Server**
   - Download from: https://dev.mysql.com/downloads/mysql/
   - Or use XAMPP: https://www.apachefriends.org/

2. **Install MySQL Workbench**
   - Download from: https://dev.mysql.com/downloads/workbench/

## Step 1: Create Database

1. **Open MySQL Workbench**
2. **Connect to your MySQL server**
   - Host: `localhost`
   - Port: `3306`
   - Username: `root`
   - Password: (your MySQL root password)

3. **Create the database**
   ```sql
   CREATE DATABASE umbrella_rental;
   USE umbrella_rental;
   ```

## Step 2: Environment Configuration

Create a `.env.local` file in your project root:

```env
# MySQL Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=umbrella_rental
DB_PORT=3306

# Next.js Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

## Step 3: Initialize Database

1. **Start your Next.js app:**
   ```bash
   npm run dev
   ```

2. **Initialize the database tables:**
   - Visit: `http://localhost:3000/api/db/init`
   - Or make a POST request to: `http://localhost:3000/api/db/init`

3. **Test the connection:**
   - Visit: `http://localhost:3000/api/db/init` (GET request)

## Step 4: Verify Setup

### Check Database Tables in MySQL Workbench:

```sql
USE umbrella_rental;
SHOW TABLES;
```

You should see:
- `users`
- `umbrellas` 
- `rentals`

### Test API Endpoints:

1. **Test backend:** `http://localhost:3000/api/test`
2. **Test database:** `http://localhost:3000/api/db/init` (GET)
3. **Create a user:** POST to `http://localhost:3000/api/auth/signup`
4. **Login:** POST to `http://localhost:3000/api/auth/login`

## Database Schema

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
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Umbrellas Table
```sql
CREATE TABLE umbrellas (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  location VARCHAR(255) NOT NULL,
  status ENUM('available', 'rented', 'maintenance') DEFAULT 'available',
  hourlyRate DECIMAL(10,2) NOT NULL,
  dailyRate DECIMAL(10,2) NOT NULL,
  image TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Rentals Table
```sql
CREATE TABLE rentals (
  id VARCHAR(255) PRIMARY KEY,
  userId VARCHAR(255) NOT NULL,
  umbrellaId VARCHAR(255) NOT NULL,
  startTime TIMESTAMP NOT NULL,
  endTime TIMESTAMP,
  status ENUM('active', 'completed', 'cancelled') DEFAULT 'active',
  totalAmount DECIMAL(10,2) NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (umbrellaId) REFERENCES umbrellas(id) ON DELETE CASCADE
);
```

## Troubleshooting

### Common Issues:

1. **Connection refused**
   - Make sure MySQL server is running
   - Check if port 3306 is correct

2. **Access denied**
   - Verify username/password in `.env.local`
   - Make sure user has permissions for the database

3. **Database doesn't exist**
   - Create the database: `CREATE DATABASE umbrella_rental;`

4. **Tables not created**
   - Visit `/api/db/init` to initialize tables

### Testing with MySQL Workbench:

```sql
-- Check if database exists
SHOW DATABASES;

-- Use the database
USE umbrella_rental;

-- Check tables
SHOW TABLES;

-- Check users
SELECT * FROM users;

-- Check umbrellas
SELECT * FROM umbrellas;

-- Check rentals
SELECT * FROM rentals;
```

## Benefits of MySQL

✅ **Real database** with proper relationships
✅ **Data integrity** with foreign keys
✅ **Concurrent access** support
✅ **Better performance** for larger datasets
✅ **Professional** and scalable
✅ **Great for production** deployment

## Next Steps

1. **Test the app** with MySQL backend
2. **Add more features** like payment processing
3. **Deploy to production** with cloud MySQL (Railway, PlanetScale, etc.)
4. **Add data validation** and security features 

Your error message:
```
{"success":true,"connected":false,"message":"Database connection failed!"}
```
means your app **cannot connect to your MySQL database**. This is a common setup issue. Here’s how to troubleshoot:

---

## 1. **Check Your `.env.local` File**
Make sure you have a `.env.local` file in your project root (not committed to git) with the correct values:
```
- If you have no password, leave `DB_PASSWORD=` blank.
- Make sure the database name matches what you created in MySQL Workbench.

---

## 2. **Is MySQL Server Running?**
- Open MySQL Workbench or XAMPP and make sure MySQL is running.
- You can also check in Task Manager for `mysqld.exe`.

---

## 3. **Can You Connect With MySQL Workbench?**
- Open MySQL Workbench.
- Try connecting with the same credentials as in your `.env.local`.
- If you can’t connect, the problem is with your MySQL server or credentials.

---

## 4. **Did You Restart Your Next.js App After Changing `.env.local`?**
- Any change to `.env.local` requires a restart of your dev server:
  ```
  npm run dev
  ```

---

## 5. **Is the Database Created?**
- In MySQL Workbench, run:
  ```sql
  SHOW DATABASES;
  ```
- If `umbrella_rental` is not listed, create it:
  ```sql
  CREATE DATABASE umbrella_rental;
  ```

---

## 6. **Check for Port Conflicts**
- Default MySQL port is `3306`.
- If you changed it, update `DB_PORT` in `.env.local`.

---

## 7. **Check for Firewall/Antivirus Blocking**
- Sometimes, security software blocks MySQL connections. Temporarily disable and test.

---

## 8. **Check Error Logs**
- If you run `npm run dev` in your terminal, you may see more detailed error messages about the connection.

---

### **If you want, paste your `.env.local` (remove your password) and I’ll check it for you!**

---

**Summary:**  
- Double-check `.env.local`  
- Make sure MySQL is running  
- Make sure the database exists  
- Restart your dev server after changes

Let me know what you find or if you want step-by-step help with any of these! 