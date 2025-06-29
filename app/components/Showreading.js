"use client";
import React, { useState, useEffect } from "react";
import { fetchCurrentSensorData } from "./getData"; // Adjust path

const Showreading = () => {
  const [temperature, setTemperature] = useState(null);
  const [humidity, setHumidity] = useState(null);
  const [distance, setDistance] = useState(null);
  const [lastUpdateTimestamp, setLastUpdateTimestamp] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const pollSensorData = async () => {
      setErrorMessage("");
      try {
        const data = await fetchCurrentSensorData(); // Fetch data from your GET endpoint
        if (data) {
          setTemperature(data.temperature);
          setHumidity(data.humidity);
          setDistance(data.distance);
          setLastUpdateTimestamp(
            data.timestamp
              ? new Date(data.timestamp).toLocaleTimeString()
              : new Date().toLocaleTimeString()
          );
        } else {
          setErrorMessage(
            "No sensor data available. Waiting for first POST to API."
          );
          setTemperature(null);
          setHumidity(null);
          setDistance(null);
          setLastUpdateTimestamp(null);
        }
      } catch (error) {
        setErrorMessage("Network error fetching data: " + error.message);
        setTemperature(null);
        setHumidity(null);
        setDistance(null);
        setLastUpdateTimestamp(null);
      }
    };

    pollSensorData(); // Fetch immediately on mount

    const intervalId = setInterval(pollSensorData, 1000); // Poll every 1 second (adjust as needed)

    return () => clearInterval(intervalId); // Cleanup interval on unmount
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 overflow-hidden">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md text-center">
        <h1 className="text-4xl font-bold text-blue-700 mb-6">
          Live Sensor Readings
        </h1>

        {errorMessage && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
            role="alert"
          >
            <strong>Error:</strong>
            <span> {errorMessage}</span>
          </div>
        )}

        <div className="space-y-6">
          <div className="p-4 bg-blue-50 rounded-md border border-blue-200">
            <h2 className="text-xl font-semibold text-gray-700">Temperature</h2>
            <p className="text-5xl font-extrabold text-blue-800 mt-2">
              {temperature !== null ? `${temperature}°C` : "--"}
            </p>
          </div>

          <div className="p-4 bg-green-50 rounded-md border border-green-200">
            <h2 className="text-xl font-semibold text-gray-700">Humidity</h2>
            <p className="text-5xl font-extrabold text-green-800 mt-2">
              {humidity !== null ? `${humidity}%` : "--"}
            </p>
          </div>

          <div className="p-4 bg-purple-50 rounded-md border border-purple-200">
            <h2 className="text-xl font-semibold text-gray-700">
              Water Distance
            </h2>
            <p className="text-5xl font-extrabold text-purple-800 mt-2">
              {distance !== null ? `${distance} cm` : "--"}
            </p>
          </div>
        </div>

        <p className="text-sm text-gray-500 mt-8">
          Last Updated:{" "}
          <span className="font-semibold text-gray-700">
            {lastUpdateTimestamp || "N/A"}
          </span>
        </p>
      </div>
    </div>
  );
};

export default Showreading;
