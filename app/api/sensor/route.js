"use server";
import { NextResponse } from "next/server";
import { pool } from "@/app/lib/db";

export const POST = async (request) => {
  let parsedData;

  try {
    parsedData = await request.json();
  } catch (error) {
    console.error(
      "API Error: Failed to parse incoming JSON from POST request."
    );
    return NextResponse.json(
      {
        success: false,
        message: "Invalid JSON format in request body.",
        error: error.message,
      },
      { status: 400 }
    );
  }

  const { distance, floodLevel, status } = parsedData;

  if (
    typeof distance !== "number" ||
    typeof floodLevel !== "number" ||
    typeof status !== "string"
  ) {
    return NextResponse.json(
      {
        success: false,
        message:
          "Missing or invalid sensor data. Expected: number (distance), number (floodLevel), string (status).",
      },
      { status: 400 }
    );
  }

  let connection;

  try {
    connection = await pool.getConnection();

    // Insert sensor data
    const [result] = await connection.execute(
      "INSERT INTO sensor_readings (distance, flood_level, status) VALUES (?, ?, ?)",
      [distance, floodLevel, status]
    );

    console.log("--- Sensor Data Stored in MySQL ---");
    console.log(`Distance: ${distance} cm`);
    console.log(`Flood Level: ${floodLevel} cm`);
    console.log(`Status: ${status}`);
    console.log(`Inserted ID: ${result.insertId}`);
    console.log("-----------------------------------");

    // Automatically insert flood alert if status is WARNING, DANGER, or CRITICAL
    if (
      status.toUpperCase() === "WARNING" ||
      status.toUpperCase() === "DANGER" ||
      status.toUpperCase() === "CRITICAL"
    ) {
      let alertLevel = status.toLowerCase();
      let message = "";

      if (status.toUpperCase() === "WARNING") {
        message = "Warning: Rising Water Level.";
      } else if (status.toUpperCase() === "DANGER") {
        message = "Danger: High Water Level!";
      } else if (status.toUpperCase() === "CRITICAL") {
        message = "Critical Flood Level! Immediate action required.";
      }

      const [alertResult] = await connection.execute(
        "INSERT INTO flood_alerts (alert_level, message, status, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())",
        [alertLevel, message, "active"]
      );

      console.log(`Flood Alert Inserted: ${alertLevel} - ${message}`);
    }

    return NextResponse.json(
      {
        success: true,
        message: "✅ Sensor data successfully stored in the database.",
        receivedData: {
          id: result.insertId,
          distance,
          floodLevel,
          status,
          timestamp: new Date().toISOString(),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "API Error: Problem processing sensor data in POST to MySQL.",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error during data processing.",
        error: error.message,
      },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release(); // Release the connection
  }
};

export const OPTIONS = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
};
