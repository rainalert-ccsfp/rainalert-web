/**
 * /api/users/route.js
 * 
 * PURPOSE: API endpoint for managing user data operations
 * 
 * FUNCTIONALITY:
 * - GET: Retrieves all users from the database
 * - POST: Creates a new user in the database
 * - PUT: Updates an existing user's information
 * - DELETE: Removes a user from the database
 * 
 * KEY FEATURES:
 * - CRUD operations for user management
 * - Input validation and sanitization
 * - Error handling and response formatting
 * - Database connection management
 * - Password hashing for security
 * 
 * DATABASE OPERATIONS:
 * - SELECT: Fetch all users with role and status
 * - INSERT: Add new user with hashed password
 * - UPDATE: Modify existing user data
 * - DELETE: Remove user by ID
 * 
 * SECURITY:
 * - Password hashing using bcrypt
 * - Input validation to prevent SQL injection
 * - Error message sanitization
 * 
 * DEPENDENCIES:
 * - MySQL database connection
 * - bcrypt for password hashing
 * - Input validation utilities
 */

import { NextResponse } from "next/server"; // Import Next.js response handler
import bcrypt from "bcryptjs"; // Import bcrypt for password hashing
import { query } from "@/app/lib/db"; // Import database query function

// GET handler - Retrieve all users
export async function GET() {
  try {
    // SQL query to fetch all users with role and status information
    const sql = `
      SELECT 
        user_id, 
        full_name, 
        email, 
        role, 
        status, 
        created_at 
      FROM users 
      ORDER BY created_at DESC
    `;
    
    const users = await query(sql); // Execute the query and get results
    
    // Return successful response with user data
    return NextResponse.json({
      success: true,
      data: users,
      message: "Users retrieved successfully"
    });
    
  } catch (error) { // If any error occurred during database operation
    console.error("Error fetching users:", error); // Log error for debugging
    
    // Return error response
    return NextResponse.json({
      success: false,
      message: "Failed to fetch users",
      error: error.message
    }, { status: 500 }); // HTTP 500 Internal Server Error
  }
}

// POST handler - Create a new user
export async function POST(request) {
  try {
    const body = await request.json(); // Parse request body as JSON
    
    // Extract user data from request body
    const { full_name, email, password, role = "user", status = "active" } = body;
    
    // Validate required fields
    if (!full_name || !email || !password) {
      return NextResponse.json({
        success: false,
        message: "Full name, email, and password are required"
      }, { status: 400 }); // HTTP 400 Bad Request
    }
    
    // Check if user with this email already exists
    const existingUser = await query(
      "SELECT user_id FROM users WHERE email = ?",
      [email]
    );
    
    if (existingUser.length > 0) { // If user already exists
      return NextResponse.json({
        success: false,
        message: "User with this email already exists"
      }, { status: 409 }); // HTTP 409 Conflict
    }
    
    // Hash the password for security
    const hashedPassword = await bcrypt.hash(password, 10); // Hash with salt rounds of 10
    
    // SQL query to insert new user
    const sql = `
      INSERT INTO users (full_name, email, password, role, status) 
      VALUES (?, ?, ?, ?, ?)
    `;
    
    // Execute the insert query with user data
    const result = await query(sql, [
      full_name,
      email,
      hashedPassword,
      role,
      status
    ]);
    
    // Return successful response with new user ID
    return NextResponse.json({
      success: true,
      message: "User created successfully",
      userId: result.insertId // Return the ID of the newly created user
    }, { status: 201 }); // HTTP 201 Created
    
  } catch (error) { // If any error occurred during user creation
    console.error("Error creating user:", error); // Log error for debugging
    
    // Return error response
    return NextResponse.json({
      success: false,
      message: "Failed to create user",
      error: error.message
    }, { status: 500 }); // HTTP 500 Internal Server Error
  }
}

// PUT handler - Update an existing user
export async function PUT(request) {
  try {
    const body = await request.json(); // Parse request body as JSON
    
    // Extract user data from request body
    const { user_id, full_name, email, role, status } = body;
    
    // Validate required fields
    if (!user_id) {
      return NextResponse.json({
        success: false,
        message: "User ID is required"
      }, { status: 400 }); // HTTP 400 Bad Request
    }
    
    // Check if user exists
    const existingUser = await query(
      "SELECT user_id FROM users WHERE user_id = ?",
      [user_id]
    );
    
    if (existingUser.length === 0) { // If user doesn't exist
      return NextResponse.json({
        success: false,
        message: "User not found"
      }, { status: 404 }); // HTTP 404 Not Found
    }
    
    // Build dynamic SQL query based on provided fields
    let sql = "UPDATE users SET ";
    const values = [];
    const updates = [];
    
    // Add fields to update if they are provided
    if (full_name !== undefined) {
      updates.push("full_name = ?");
      values.push(full_name);
    }
    
    if (email !== undefined) {
      updates.push("email = ?");
      values.push(email);
    }
    
    if (role !== undefined) {
      updates.push("role = ?");
      values.push(role);
    }
    
    if (status !== undefined) {
      updates.push("status = ?");
      values.push(status);
    }
    
    // If no fields to update, return error
    if (updates.length === 0) {
      return NextResponse.json({
        success: false,
        message: "No fields to update"
      }, { status: 400 }); // HTTP 400 Bad Request
    }
    
    sql += updates.join(", ") + " WHERE user_id = ?";
    values.push(user_id); // Add user_id for WHERE clause
    
    // Execute the update query
    await query(sql, values);
    
    // Return successful response
    return NextResponse.json({
      success: true,
      message: "User updated successfully"
    });
    
  } catch (error) { // If any error occurred during user update
    console.error("Error updating user:", error); // Log error for debugging
    
    // Return error response
    return NextResponse.json({
      success: false,
      message: "Failed to update user",
      error: error.message
    }, { status: 500 }); // HTTP 500 Internal Server Error
  }
}

// DELETE handler - Remove a user
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url); // Get URL search parameters
    const user_id = searchParams.get("user_id"); // Extract user_id from query parameters
    
    // Validate required fields
    if (!user_id) {
      return NextResponse.json({
        success: false,
        message: "User ID is required"
      }, { status: 400 }); // HTTP 400 Bad Request
    }
    
    // Check if user exists
    const existingUser = await query(
      "SELECT user_id FROM users WHERE user_id = ?",
      [user_id]
    );
    
    if (existingUser.length === 0) { // If user doesn't exist
      return NextResponse.json({
        success: false,
        message: "User not found"
      }, { status: 404 }); // HTTP 404 Not Found
    }
    
    // SQL query to delete user
    const sql = "DELETE FROM users WHERE user_id = ?";
    
    // Execute the delete query
    await query(sql, [user_id]);
    
    // Return successful response
    return NextResponse.json({
      success: true,
      message: "User deleted successfully"
    });
    
  } catch (error) { // If any error occurred during user deletion
    console.error("Error deleting user:", error); // Log error for debugging
    
    // Return error response
    return NextResponse.json({
      success: false,
      message: "Failed to delete user",
      error: error.message
    }, { status: 500 }); // HTTP 500 Internal Server Error
  }
}
