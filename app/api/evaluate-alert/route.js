// app/api/evaluate-alert/route.js
import { pool } from "@/app/lib/db";
import { NextResponse } from "next/server";

let firstSafeDetectedAt = null;

export async function POST() {
  try {
    // Fetch the latest sensor data
    const [rows] = await pool.query(
      "SELECT * FROM sensor_readings ORDER BY reading_time DESC LIMIT 1"
    );

    if (rows.length === 0) {
      return NextResponse.json({
        success: false,
        message: "No sensor data found.",
      });
    }

    const latestSensorData = rows[0];

    // ✅ Safe condition with 5-minute grace period (updated to use 76.2cm)
    if (latestSensorData.distance > 76.2) {
      const now = new Date();

      if (!firstSafeDetectedAt) {
        firstSafeDetectedAt = now;
        return NextResponse.json({
          success: true,
          message: "Water is safe. Waiting for grace period to confirm.",
        });
      }

      const elapsedTime = (now - new Date(firstSafeDetectedAt)) / 1000;

      if (elapsedTime >= 300) {
        await pool.query(`
          UPDATE flood_alerts 
          SET status = 'past' 
          WHERE status = 'active'
        `);

        firstSafeDetectedAt = null;

        return NextResponse.json({
          success: true,
          message:
            "Water level has been safe for 5 minutes. Alerts marked as past.",
        });
      } else {
        return NextResponse.json({
          success: true,
          message: `Water is safe. ${Math.ceil(
            300 - elapsedTime
          )} seconds remaining to confirm.`,
        });
      }
    } else {
      firstSafeDetectedAt = null;
    }

    // ✅ Parse and round the sensor distance
    const distance = parseFloat(latestSensorData.distance.toFixed(2));

    // ✅ Determine alert level based on Arduino thresholds
    let alertLevel = "";

    if (distance > 60.96 && distance <= 76.2) {
      alertLevel = "Warning";
    } else if (distance > 30.48 && distance <= 60.96) {
      alertLevel = "Danger";
    } else if (distance <= 30.48) {
      alertLevel = "Critical";
    } else {
      return NextResponse.json({
        success: true,
        message: "No flood alert triggered. Water level is safe.",
      });
    }

    // Check for duplicate alert
    const [existingAlert] = await pool.query(
      "SELECT * FROM flood_alerts WHERE reading_time = ? AND alert_level = ?",
      [latestSensorData.reading_time, alertLevel]
    );

    if (existingAlert.length > 0) {
      return NextResponse.json({
        success: true,
        message: "Duplicate alert already exists. Skipping insertion.",
      });
    }

    // Insert new alert
    await pool.query(
      "INSERT INTO flood_alerts (alert_level, message, status, distance, flood_level, reading_time, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        alertLevel,
        `${alertLevel} flood level detected.`,
        "active",
        latestSensorData.distance,
        latestSensorData.flood_level,
        latestSensorData.reading_time,
        new Date(),
      ]
    );

    // ✅ Check active alerts count
    const [activeAlerts] = await pool.query(
      "SELECT id FROM flood_alerts WHERE status = 'active' ORDER BY created_at DESC"
    );

    if (activeAlerts.length > 2) {
      const idsToKeep = activeAlerts.slice(0, 2).map((alert) => alert.id);

      await pool.query(
        `UPDATE flood_alerts SET status = 'past' WHERE status = 'active' AND id NOT IN (?, ?)`,
        idsToKeep
      );

      return NextResponse.json({
        success: true,
        message: "New alert recorded. Older alerts marked as past.",
      });
    }

    return NextResponse.json({
      success: true,
      message: "Flood alert recorded successfully.",
    });
  } catch (error) {
    console.error("Error evaluating and recording flood alert:", error);
    return NextResponse.json({
      success: false,
      message: "Error evaluating flood alert.",
    });
  }
}
