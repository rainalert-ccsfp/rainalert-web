/**
 * FloodAnalytics.js
 * 
 * PURPOSE: Component for displaying flood analytics and sensor data visualization
 * 
 * FUNCTIONALITY:
 * - Fetches and displays sensor data in real-time
 * - Shows current water level and distance readings
 * - Provides historical data visualization
 * - Calculates and displays flood risk indicators
 * - Updates data automatically every second
 * 
 * KEY FEATURES:
 * - Real-time sensor data display
 * - Water level and distance monitoring
 * - Historical data trends
 * - Flood risk assessment
 * - Automatic data refresh
 * 
 * SENSOR DATA:
 * - Distance: Distance from sensor to water surface (cm)
 * - Water Level: Calculated water level based on sensor height
 * - Timestamp: When the reading was taken
 * 
 * API ENDPOINTS:
 * - GET /api/current-sensor-data - Fetches latest sensor readings
 * 
 * DEPENDENCIES:
 * - Chart.js for data visualization
 * - Real-time sensor data from database
 */

"use client"; // Enable client-side features in Next.js

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function FloodAnalytics() {
  const [floodData, setFloodData] = useState([]);
  const [selectedYear, setSelectedYear] = useState("2023");
  const [filteredData, setFilteredData] = useState([]);
  const [barangayFrequency, setBarangayFrequency] = useState({});
  const [sensorData, setSensorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  useEffect(() => {
    axios
      .get("/api/flood")
      .then((response) => {
        setFloodData(response.data);
      })
      .catch((error) => {
        console.error("Error fetching flood analytics data:", error);
      });
  }, []);

  useEffect(() => {
    const data = floodData.filter(
      (item) => item.year.toString() === selectedYear
    );
    setFilteredData(data);

    const freq = {};
    data.forEach((item) => {
      freq[item.barangay] = (freq[item.barangay] || 0) + 1;
    });
    setBarangayFrequency(freq);
  }, [selectedYear, floodData]);

  const chartLabels = filteredData.map(
    (item) => `${monthNames[item.month - 1]}`
  );
  const waterLevels = filteredData.map((item) => item.flood_depth_m);

  const lineChartData = {
    labels: chartLabels,
    datasets: [
      {
        label: "Water Level (m)",
        data: waterLevels,
        borderColor: "rgba(54, 162, 235, 1)",
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        tension: 0.3,
      },
    ],
  };

  const barChartData = {
    labels: chartLabels,
    datasets: [
      {
        label: "Flood Events",
        data: waterLevels,
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
    ],
  };

  const barangayChartData = {
    labels: Object.keys(barangayFrequency),
    datasets: [
      {
        label: "Flood Frequency per Barangay",
        data: Object.values(barangayFrequency),
        backgroundColor: "rgba(75, 192, 192, 0.7)",
      },
    ],
  };

  // Flood Prediction Logic
  const currentMonth = new Date().getMonth() + 1;
  const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
  const nextMonthName = monthNames[nextMonth - 1] || "Next Month";

  const allNextMonthData = floodData.filter(
    (item) => item.month === nextMonth && item.year !== 2025
  );

  let confidenceLevel = "No data";
  let floodRiskLevel = "No data";

  if (allNextMonthData.length > 0) {
    const sumLevels = allNextMonthData.reduce(
      (sum, item) => sum + item.flood_depth_m,
      0
    );
    const predictedFloodLevel = sumLevels / allNextMonthData.length;

    confidenceLevel = Math.min((allNextMonthData.length / 5) * 100, 95).toFixed(
      0
    );
    floodRiskLevel =
      predictedFloodLevel >= 0.7
        ? "High"
        : predictedFloodLevel >= 0.4
        ? "Moderate"
        : "Low";
  }

  // Function to fetch current sensor data from the API
  const fetchSensorData = async () => {
    try {
      const response = await fetch("/api/current-sensor-data", { cache: "no-store" }); // Fetch data, bypass cache
      const data = await response.json(); // Parse the JSON response

      if (data.success && data.data) { // If API call was successful and data exists
        setSensorData(data.data); // Update sensor data state
      } else { // If API response format is unexpected
        setError("No sensor data available."); // Set error message
      }
    } catch (error) { // If any error occurred
      console.error("Error fetching sensor data:", error); // Log error to console
      setError("Failed to fetch sensor data."); // Set error message
    } finally { // Always execute this block
      setLoading(false); // Hide loading state
    }
  };

  // Function to determine flood risk level based on water level
  const getFloodRisk = (waterLevel) => {
    if (waterLevel >= 80) return { level: "Critical", color: "text-red-600", bg: "bg-red-100" }; // Critical risk
    if (waterLevel >= 60) return { level: "High", color: "text-orange-600", bg: "bg-orange-100" }; // High risk
    if (waterLevel >= 40) return { level: "Moderate", color: "text-yellow-600", bg: "bg-yellow-100" }; // Moderate risk
    return { level: "Low", color: "text-green-600", bg: "bg-green-100" }; // Low risk
  };

  // Function to get status indicator color based on sensor status
  const getStatusColor = (timestamp) => {
    if (!timestamp) return "bg-gray-400"; // Gray if no timestamp
    const now = new Date(); // Get current time
    const readingTime = new Date(timestamp); // Convert timestamp to Date object
    const diffMinutes = (now - readingTime) / (1000 * 60); // Calculate difference in minutes
    return diffMinutes > 2 ? "bg-red-400" : "bg-green-400"; // Red if > 2 minutes old, green if recent
  };

  // Effect to initialize data fetching and set up polling
  useEffect(() => {
    fetchSensorData(); // Fetch data immediately

    const interval = setInterval(() => { // Set up interval to run every 1000ms
      fetchSensorData(); // Fetch data
    }, 1000);

    return () => clearInterval(interval); // Cleanup: clear interval when component unmounts
  }, []); // Empty dependency array - effect runs only once on mount

  // Render analytics charts and prediction, but not sensor data cards or recent readings
  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-4">
        <label htmlFor="year" className="font-medium text-blue-700">
          Select Year:
        </label>
        <select
          id="year"
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="border border-blue-500 p-2 rounded-lg text-blue-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-400 hover:bg-blue-50"
        >
          <option value="2023">2023</option>
          <option value="2024">2024</option>
          <option value="2025">2025</option>
        </select>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h3 className="text-xl font-semibold mb-3">Water Level Trends</h3>
        <Line data={lineChartData} />
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h3 className="text-xl font-semibold mb-3">Alert Frequency</h3>
        <Bar data={barChartData} />
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h3 className="text-xl font-semibold mb-3">Barangay Flood Frequency</h3>
        <Bar data={barangayChartData} />
      </div>

      {selectedYear === "2025" && (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h3 className="text-xl font-semibold mb-4">
            Flood Prediction for {nextMonthName} 2025
          </h3>

          {floodRiskLevel !== "No data" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg shadow text-center">
                <h4 className="text-lg font-bold text-blue-700 mb-2">
                  Flood Risk Level
                </h4>
                <p className="text-2xl font-semibold">{floodRiskLevel}</p>
              </div>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg shadow text-center">
                <h4 className="text-lg font-bold text-blue-700 mb-2">
                  Confidence Level
                </h4>
                <p className="text-2xl font-semibold">{confidenceLevel}%</p>
              </div>
            </div>
          ) : (
            <p className="text-lg text-gray-500">
              No prediction available based on historical data.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
