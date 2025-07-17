import mysql from 'mysql2/promise';

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'umbrella_rental',
  port: parseInt(process.env.DB_PORT || '3306'),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection
export async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully!');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

// Initialize database tables
export async function initializeDatabase() {
  try {
    const connection = await pool.getConnection();
    
    // Create users table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        mobile VARCHAR(255) NOT NULL,
        profileImage TEXT,
        role ENUM('user', 'admin') DEFAULT 'user',
        credits INT DEFAULT 200, -- 4 rentals at 50 credits each
        total_rentals INT DEFAULT 0,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create umbrellas table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS umbrellas (
        id VARCHAR(255) PRIMARY KEY,
        description TEXT,
        location VARCHAR(255) NOT NULL,
        status ENUM('available', 'rented', 'out_of_stock') DEFAULT 'available',
        inventory INT DEFAULT 1,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create rental_history table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS rental_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        user_name VARCHAR(255) NOT NULL,
        umbrella_id VARCHAR(255) NOT NULL,
        rented_at TIMESTAMP NOT NULL,
        returned_at TIMESTAMP NULL,
        status ENUM('active', 'completed', 'cancelled') DEFAULT 'active',
        credits_used INT DEFAULT 50,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (umbrella_id) REFERENCES umbrellas(id) ON DELETE CASCADE
      )
    `);

    console.log('✅ Database tables created successfully!');
    connection.release();
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

// Helper function to execute queries
export async function executeQuery(query: string, params: any[] = []) {
  try {
    const [rows] = await pool.execute(query, params);
    return rows;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Helper function to execute transactions
export async function executeTransaction(queries: { query: string; params: any[] }[]) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    for (const { query, params } of queries) {
      await connection.execute(query, params);
    }
    
    await connection.commit();
    connection.release();
  } catch (error) {
    await connection.rollback();
    connection.release();
    throw error;
  }
}

export default pool; 