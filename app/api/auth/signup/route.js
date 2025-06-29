import { NextResponse } from "next/server";
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    const { name, username, email, password } = await request.json();

    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    // Check if username or email already exists
    const [existingUsers] = await connection.execute(
      "SELECT * FROM users WHERE username = ? OR email = ?",
      [username, email]
    );

    if (existingUsers.length > 0) {
      await connection.end();
      return NextResponse.json(
        { success: false, message: "Username or email already exists" },
        { status: 400 }
      );
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    await connection.execute(
      "INSERT INTO users (name, username, email, password) VALUES (?, ?, ?, ?)",
      [name, username, email, hashedPassword]
    );

    await connection.end();

    return NextResponse.json({
      success: true,
      message: "User registered successfully",
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
