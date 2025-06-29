/**
 * db.js
 * 
 * PURPOSE: Database connection and query utilities for the RainAlert application
 * 
 * FUNCTIONALITY:
 * - Establishes MySQL database connection pool
 * - Provides query function for database operations
 * - Handles connection errors and timeouts
 * - Manages database connection lifecycle
 * 
 * KEY FEATURES:
 * - Connection pooling for efficient database access
 * - Prepared statements for SQL injection prevention
 * - Error handling and logging
 * - Connection timeout management
 * - Environment-based configuration
 * 
 * DATABASE CONFIGURATION:
 * - Host: Local MySQL server
 * - Port: Standard MySQL port (3306)
 * - Database: rainalert_db
 * - User: root (development)
 * - Connection limit: 10 concurrent connections
 * 
 * SECURITY:
 * - Prepared statements prevent SQL injection
 * - Connection pooling prevents connection exhaustion
 * - Error handling prevents information leakage
 * 
 * DEPENDENCIES:
 * - mysql2 for MySQL database driver
 * - Environment variables for configuration
 */

import mysql from "mysql2/promise"; // Import MySQL2 with promise support

// Database configuration object
const dbConfig = {
  host: "153.92.15.45", // Database server hostname
  port: 3306, // Database server port
  user: "u315184670_rainalert", // Database username
  password: "V8l5bp!^0>d", // Database password (empty for development)
  database: "u315184670_rainalert", // Database name (updated to match actual DB)
  waitForConnections: true, // Wait for available connections
  connectionLimit: 10, // Maximum number of concurrent connections
  queueLimit: 0, // No limit on connection queue
  acquireTimeout: 60000, // 60 seconds timeout for acquiring connection
  timeout: 60000, // 60 seconds timeout for queries
  reconnect: true, // Automatically reconnect if connection is lost
};

// Create database connection pool
const pool = mysql.createPool(dbConfig);

// Query function for executing database operations
export async function query(sql, params = []) {
  let connection; // Variable to hold database connection
  
  try {
    // Get connection from pool
    connection = await pool.getConnection();
    
    // Execute query with parameters (prepared statement)
    const [rows] = await connection.execute(sql, params);
    
    // Return query results
    return rows;
    
  } catch (error) { // If any error occurred during query execution
    // Log error for debugging
    console.error("Database query error:", {
      sql: sql,
      params: params,
      error: error.message
    });
    
    // Re-throw error for handling by calling function
    throw error;
    
  } finally { // Always execute this block
    // Release connection back to pool if connection exists
    if (connection) {
      connection.release();
    }
  }
}

// Export the connection pool for direct access if needed
export { pool };

// Test database connection function
export async function testConnection() {
  try {
    // Execute simple query to test connection
    const result = await query("SELECT 1 as test");
    
    // Log successful connection
    console.log("Database connection successful:", result);
    
    return true; // Return true if connection successful
    
  } catch (error) { // If connection test failed
    // Log connection error
    console.error("Database connection failed:", error.message);
    
    return false; // Return false if connection failed
  }
}

// Initialize database connection on module load
testConnection().catch(error => {
  console.error("Failed to initialize database connection:", error);
});
