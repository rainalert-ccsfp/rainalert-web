import { NextResponse } from "next/server";
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    // Query user by username only
    const [rows] = await connection.execute(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );

    await connection.end();

    if (rows.length > 0) {
      // Compare the provided password with the hashed password in the database
      const isPasswordValid = await bcrypt.compare(password, rows[0].password);
      if (!isPasswordValid) {
        return NextResponse.json({ success: false, message: "Invalid username or password" }, { status: 401 });
      }

      return NextResponse.json({
        success: true,
        message: "Login successful",
        user: {
          id: rows[0].id,
          name: rows[0].name,
          username: rows[0].username,
        },
      });
    } else {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
