import nodemailer from "nodemailer";
import { NextResponse } from "next/server";
import crypto from "crypto";
import mysql from 'mysql2/promise';

export async function POST(request) {
  try {
    const { username } = await request.json();
    console.log("Forgot password request for username:", username);

    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    const [users] = await connection.execute(
      'SELECT id, email FROM users WHERE username = ?',
      [username]
    );

    if (users.length === 0) {
      await connection.end();
      console.log("No user found with username:", username);
      return NextResponse.json(
        { message: "If an account exists, you will receive password reset instructions." },
        { status: 200 }
      );
    }

    const userEmail = users[0].email;
    const userId = users[0].id;
    console.log("User found. Attempting to send reset email to:", userEmail);

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 3600000); // Token expires in 1 hour

    // Store the token in the database
    await connection.execute(
      'INSERT INTO password_reset_tokens (username, token, expires_at) VALUES (?, ?, ?)',
      [username, token, expiresAt]
    );
    await connection.end();

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.APP_USER,
        pass: process.env.APP_PASSWORD,
      },
    });

    try {
      await transporter.verify();
      console.log("Nodemailer transporter verified successfully.");
    } catch (verifyError) {
      console.error("Nodemailer transporter verification failed:", verifyError.message);
      return NextResponse.json(
        { message: "Failed to verify email service. Please check server logs." },
        { status: 500 }
      );
    }

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

    const mailOptions = {
      from: process.env.APP_USER,
      to: userEmail,
      subject: "Password Reset Request",
      html: `
        <h1>Password Reset Request</h1>
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <a href="${resetUrl}">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn\'t request this, please ignore this email.</p>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log("Password reset email successfully sent to:", userEmail);
      return NextResponse.json(
        { message: "Password reset instructions sent to your email!" },
        { status: 200 }
      );
    } catch (emailSendError) {
      console.error("Error sending password reset email:", emailSendError.message);
      return NextResponse.json(
        { message: "Failed to send reset instructions. Please try again later." },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error("Forgot password general error:", error);
    return NextResponse.json(
      { message: "An unexpected error occurred. Please try again later." },
      { status: 500 }
    );
  }
} 