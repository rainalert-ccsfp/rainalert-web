import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("Testing email configuration...");
    console.log("Email settings:", {
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      user: process.env.APP_USER ? "Set" : "Not Set",
      pass: process.env.APP_PASSWORD ? "Set" : "Not Set"
    });

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.APP_USER,
        pass: process.env.APP_PASSWORD,
      },
    });

    // Verify the transporter
    try {
      await transporter.verify();
      console.log("Email transporter verified successfully");
    } catch (error) {
      console.error("Email transporter verification failed:", error);
      return NextResponse.json(
        { success: false, message: "Email configuration error: " + error.message },
        { status: 500 }
      );
    }

    // Send a test email
    const mailOptions = {
      from: process.env.APP_USER,
      to: process.env.APP_USER, // Send to the same address
      subject: "Test Email from Rain Alert App",
      html: `
        <h1>Test Email</h1>
        <p>If you're receiving this email, your email configuration is working correctly!</p>
        <p>This is a test email from your Rain Alert App.</p>
      `,
    };

    console.log("Attempting to send test email...");
    await transporter.sendMail(mailOptions);
    console.log("Test email sent successfully");

    return NextResponse.json(
      { success: true, message: "Test email sent successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Test email error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to send test email: " + error.message },
      { status: 500 }
    );
  }
} 