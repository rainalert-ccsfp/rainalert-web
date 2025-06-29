// app/api/current-sensor-data/route.js
"use server"; // Important for Next.js App Router API routes

import { NextResponse } from "next/server";
import { pool } from "@/app/lib/db"; // Adjust this path if your db.js is elsewhere

const CM_TO_FEET_FACTOR = 1 / 30.48;

export const GET = async () => {
  let connection;
  try {
    connection = await pool.getConnection();

    // Select the latest sensor data.
    const [rows] = await connection.execute(
      "SELECT distance, flood_level, status, reading_time FROM sensor_readings ORDER BY reading_time DESC LIMIT 1"
    );

    let latestData = rows[0] || {
      distance: null,
      flood_level: null,
      status: "No Data",
      reading_time: null,
    };

    // Convert distance and flood_level from CM to Feet
    if (latestData.distance !== null) {
      latestData.distance = parseFloat(
        (latestData.distance * CM_TO_FEET_FACTOR).toFixed(2)
      );
    }
    if (latestData.flood_level !== null) {
      latestData.flood_level = parseFloat(
        (latestData.flood_level * CM_TO_FEET_FACTOR).toFixed(2)
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Latest sensor data retrieved.",
        data: latestData,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "API Error: Problem retrieving current sensor data from MySQL.",
      error
    );
    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error during data retrieval.",
        error: error.message,
      },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
};

// This handles CORS preflight requests
export const OPTIONS = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
};
