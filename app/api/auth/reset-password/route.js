import { NextResponse } from "next/server";
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    const { token, password } = await request.json();
    console.log("Reset password request received. Token:", token);

    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });
    const [tokens] = await connection.execute(
      "SELECT username, expires_at FROM password_reset_tokens WHERE token = ?",
      [token]
    );

    if (tokens.length === 0) {
      await connection.end();
      console.log("Token not found in database or already used.");
      return NextResponse.json(
        { success: false, message: "Invalid or expired token" },
        { status: 400 }
      );
    }

    const tokenData = tokens[0];
    console.log("Token data retrieved from database:", tokenData);

    // Check if token has expired
    if (new Date() > new Date(tokenData.expires_at)) {
      // Optionally, delete expired token to clean up database
      await connection.execute(
        "DELETE FROM password_reset_tokens WHERE token = ?",
        [token]
      );
      await connection.end();
      console.log("Token has expired and was deleted.");
      return NextResponse.json(
        { success: false, message: "Token has expired" },
        { status: 400 }
      );
    }

    // Hash the password before updating in production
    const hashedPassword = await bcrypt.hash(password, 10);
    await connection.execute(
      "UPDATE users SET password = ? WHERE username = ?",
      [hashedPassword, tokenData.username]
    );
    console.log("User password updated for username:", tokenData.username);

    // Remove the used token from the database
    await connection.execute(
      "DELETE FROM password_reset_tokens WHERE token = ?",
      [token]
    );
    await connection.end();
    console.log("Used token deleted from database.");

    return NextResponse.json(
      { success: true, message: "Password reset successful" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Password reset error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to reset password" },
      { status: 500 }
    );
  }
}
