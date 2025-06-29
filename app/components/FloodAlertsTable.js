/**
 * FloodAlertsTable.js
 *
 * PURPOSE: Component for displaying flood alerts history and active alerts
 *
 * FUNCTIONALITY:
 * - Fetches and displays flood alerts from the database
 * - Shows active and past alerts with different styling
 * - Provides detailed view modal for each alert
 * - Automatically evaluates and creates new alerts
 * - Color-codes alerts based on severity level
 *
 * KEY FEATURES:
 * - Real-time alert fetching and evaluation
 * - Active vs past alert distinction
 * - Detailed alert information modal
 * - Color-coded alert levels (Warning, Danger, Critical)
 * - Automatic alert evaluation every second
 *
 * ALERT LEVELS:
 * - Warning: Yellow styling
 * - Danger: Red styling
 * - Critical: Dark red styling with white text
 *
 * API ENDPOINTS:
 * - GET /api/flood_alerts - Fetches alert history
 * - POST /api/evaluate-alert - Evaluates and creates new alerts
 *
 * DEPENDENCIES:
 * - Database connection for alert data
 * - Sensor data for alert evaluation
 */

"use client"; // Enable client-side features in Next.js

import React, { useEffect, useState } from "react"; // Import React hooks for state management and side effects

const FloodAlertsTable = () => {
  // State for managing alert data and UI states
  const [alerts, setAlerts] = useState([]); // Store the list of all flood alerts
  const [loading, setLoading] = useState(true); // Track if data is being loaded
  const [error, setError] = useState(null); // Store any error messages
  const [selectedAlert, setSelectedAlert] = useState(null); // Store the alert selected for detailed view

  // Function to determine alert card color based on alert level
  const getAlertColor = (alertLevel) => {
    switch (
      alertLevel.toLowerCase() // Convert to lowercase for case-insensitive comparison
    ) {
      case "warning": // If alert level is warning
        return "bg-yellow-100 border-yellow-400"; // Return yellow styling
      case "danger": // If alert level is danger
        return "bg-red-300/70 border-red-400"; // Return red styling with transparency
      case "critical": // If alert level is critical
        return "bg-red-400/70 border-red-700 text-white"; // Return dark red styling with white text
      default: // For any other alert level
        return "bg-gray-100 border-gray-400"; // Return gray styling
    }
  };

  // Function to fetch alerts from the API
  const fetchAlerts = async () => {
    try {
      const response = await fetch("/api/flood_alerts", { cache: "no-store" }); // Fetch alerts, bypass cache
      const data = await response.json(); // Parse the JSON response

      if (data.success && Array.isArray(data.data)) {
        // If API call was successful and data is an array
        setAlerts(data.data); // Update alerts state with fetched data
      } else {
        // If API response format is unexpected
        setError("Unexpected API response format."); // Set error message
      }
    } catch (error) {
      // If any error occurred
      console.error("Error fetching flood alerts:", error); // Log error to console
      setError("Failed to fetch flood alerts."); // Set error message
    } finally {
      // Always execute this block
      setLoading(false); // Hide loading state
    }
  };

  // Function to evaluate and record flood alerts
  const evaluateFloodAlert = async () => {
    try {
      await fetch("/api/evaluate-alert", { method: "POST" }); // Send POST request to evaluate alerts
    } catch (error) {
      // If any error occurred
      console.error("Error triggering flood alert evaluation:", error); // Log error to console
    }
  };

  // Effect to initialize fetching and evaluation, and set up polling
  useEffect(() => {
    fetchAlerts(); // Fetch alerts immediately
    evaluateFloodAlert(); // Evaluate alerts immediately

    const interval = setInterval(() => {
      // Set up interval to run every 1000ms
      fetchAlerts(); // Fetch alerts
      evaluateFloodAlert(); // Evaluate alerts
    }, 1000);

    return () => clearInterval(interval); // Cleanup: clear interval when component unmounts
  }, []); // Empty dependency array - effect runs only once on mount

  const activeAlerts = alerts.filter((alert) => alert.status === "active"); // Filter alerts to get only active ones
  const pastAlerts = alerts.filter((alert) => alert.status === "past"); // Filter alerts to get only past ones

  if (loading) return <p>Loading flood alerts...</p>;
  // Show error message if there's an error
  if (error) return <p className="text-red-500">Error: {error}</p>; // Return early with error message

  return (
    <div className="space-y-6">
      {/* Active Alerts Section */}
      <div>
        <h2 className="text-2xl font-bold text-gray-700 mb-4">Active Alerts</h2>
        {activeAlerts.length > 0 ? (
          activeAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 border-l-4 rounded-lg shadow-md mb-4 ${getAlertColor(
                alert.alert_level
              )}`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-lg font-bold text-black">
                    {alert.alert_level} Alert
                  </h4>
                  <p className="text-sm text-black">{alert.message}</p>
                  <p className="text-xs mt-1 text-black">
                    Distance: {alert.distance} cm | Flood Level:{" "}
                    {alert.flood_level} cm
                  </p>
                  <p className="text-xs mt-1 text-black">
                    Reading Time:{" "}
                    {alert.reading_time
                      ? new Date(alert.reading_time).toLocaleString()
                      : "N/A"}
                  </p>
                  <p className="text-xs mt-1 text-black">
                    Created At: {new Date(alert.created_at).toLocaleString()}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-semibold px-2 py-1 rounded bg-red-600 text-white">
                    Active
                  </span>
                </div>
              </div>
              <div className="mt-3 text-right">
                <button
                  className="bg-blue-500 text-white px-3 py-1 text-sm rounded hover:bg-blue-600"
                  onClick={() => setSelectedAlert(alert)}
                >
                  View Details
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-gray-600 text-center">
            No active flood alerts.
          </div>
        )}
      </div>

      {/* Past Alerts Section */}
      <div>
        <h2 className="text-2xl font-bold text-gray-700 mb-4">Past Alerts</h2>
        {pastAlerts.length > 0 ? (
          pastAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 border-l-4 rounded-lg shadow-md mb-4 ${getAlertColor(
                alert.alert_level
              )}`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-black">
                    {alert.alert_level} Alert
                  </h4>
                  <p className="text-xs mt-1 text-black">
                    Created At: {new Date(alert.created_at).toLocaleString()}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-semibold px-2 py-1 rounded bg-gray-500 text-white">
                    Past
                  </span>
                </div>
              </div>
              <div className="mt-3 text-right">
                <button
                  className="bg-blue-500 text-white px-3 py-1 text-sm rounded hover:bg-blue-600"
                  onClick={() => setSelectedAlert(alert)}
                >
                  View Details
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-gray-600 text-center">No past alerts.</div>
        )}
      </div>

      {/* Modal for Details */}
      {selectedAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Flood Alert Details</h3>
            <p>
              <strong>Alert Level:</strong> {selectedAlert.alert_level}
            </p>
            <p>
              <strong>Message:</strong> {selectedAlert.message}
            </p>
            <p>
              <strong>Status:</strong>{" "}
              <span
                className={`ml-2 px-2 py-1 text-xs rounded-full ${
                  selectedAlert.status === "active"
                    ? "bg-red-500 text-white"
                    : "bg-gray-400 text-white"
                }`}
              >
                {selectedAlert.status === "active"
                  ? "Active Flood"
                  : "Past Alert"}
              </span>
            </p>
            <p>
              <strong>Distance:</strong> {selectedAlert.distance} cm
            </p>
            <p>
              <strong>Flood Level:</strong> {selectedAlert.flood_level} cm
            </p>
            <p>
              <strong>Reading Time:</strong>{" "}
              {selectedAlert.reading_time
                ? new Date(selectedAlert.reading_time).toLocaleString()
                : "N/A"}
            </p>
            <p>
              <strong>Created At:</strong>{" "}
              {new Date(selectedAlert.created_at).toLocaleString()}
            </p>
            <button
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={() => setSelectedAlert(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FloodAlertsTable;
