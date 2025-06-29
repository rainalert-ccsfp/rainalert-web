// lib/getTableData.js
import { pool } from "./db"; // Database connection

/**
 * Fetches all records from the specified table, ordered by created_at descending.
 * @param {string} tableName - The database table to query.
 * @returns {Promise<Array<Object>>} The table records.
 * @throws {Error} If the table name is missing or database query fails.
 */
export async function getTableData(tableName) {
  if (!tableName) {
    throw new Error("Table name is required to fetch data.");
  }

  try {
    const [rows] = await pool.query(
      `SELECT * FROM ${tableName} ORDER BY created_at DESC`
    );
    return rows;
  } catch (error) {
    console.error(`Error fetching data from table '${tableName}':`, error);
    throw error;
  }
}

/**
 * Fetches the latest sensor reading from the /api/current-sensor-data endpoint.
 * This is specifically for display on the dashboard.
 *
 * @returns {Promise<Object|null>} The latest sensor data or null if not available.
 * @throws {Error} If the API request fails.
 */
export async function getLatestSensorDisplayData() {
  const apiEndpoint = `${
    process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
  }/api/current-sensor-data`;

  try {
    const response = await fetch(apiEndpoint, {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store", // Ensure fresh data
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(
        `Error fetching display data from /api/current-sensor-data. Status: ${response.status}. Details: ${errorBody}`
      );
      return null;
    }

    const apiResult = await response.json();

    if (apiResult.success && apiResult.data) {
      console.log("Successfully fetched sensor data:", apiResult.data);
      return apiResult.data;
    } else {
      console.warn("No valid sensor data found:", apiResult.message);
      return null;
    }
  } catch (error) {
    console.error("Error fetching sensor display data:", error);
    throw new Error(`Failed to retrieve sensor data: ${error.message}`);
  }
}

/**
 * Calls the /api/evaluate-alert endpoint to evaluate and record flood alerts.
 *
 * @returns {Promise<Object>} The JSON response from the evaluation API.
 * @throws {Error} If the API call fails or the evaluation is unsuccessful.
 */
export async function evaluateAndRecordFloodAlert() {
  const apiEndpoint = "/api/evaluate-alert";

  try {
    const response = await fetch(apiEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    const result = await response.json();

    if (result.success) {
      console.log("Flood alert evaluation successful:", result.message);

      if (result.alertLevel === "Critical") {
        console.log(`Critical alert recorded: Distance ${result.distance} ft.`);
      }

      return result;
    } else {
      console.error("Flood alert evaluation failed:", result.message);
      throw new Error(`Evaluation failed: ${result.message}`);
    }
  } catch (error) {
    console.error("Error calling /api/evaluate-alert:", error);
    throw new Error(`Could not evaluate flood alert: ${error.message}`);
  }
}
