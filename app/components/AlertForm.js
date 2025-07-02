/**
 * AlertForm.js
 * 
 * PURPOSE: Component for sending flood alerts to selected users
 * 
 * FUNCTIONALITY:
 * - Displays selected users for alert targeting
 * - Provides predefined alert message templates
 * - Sends push notifications to mobile app users
 * - Shows real-time clock for alert timestamps
 * - Handles alert sending with loading states and feedback
 * 
 * KEY FEATURES:
 * - Predefined alert levels: Critical, Danger, Warning
 * - Custom message templates for each alert level
 * - Real-time clock display for accurate timestamps
 * - Loading states during alert sending
 * - Success/error feedback messages
 * - Automatic form reset after successful send
 * 
 * ALERT LEVELS:
 * - Critical Alert: "Critical Flood Level! Immediate action required!"
 * - Danger: "High Water Level!"
 * - Warning: "Rising Water Level!"
 * 
 * API ENDPOINTS:
 * - POST to external backend: http://192.168.1.17:5000/api/send-push-alert
 * 
 * DEPENDENCIES:
 * - Axios for HTTP requests
 * - Selected users data from parent component
 * - External push notification service
 */

import React, { useState, useEffect } from "react";
import axios from "axios";

const predefinedMessages = [
  { level: 'Critical Alert', message: 'Critical Flood Level! Immediate action required!' },
  { level: 'Danger', message: 'High Water Level!' },
  { level: 'Warning', message: 'Rising Water Level!' },
];

const AlertForm = ({ selectedUsers }) => {
  const [selectedMessage, setSelectedMessage] = useState(predefinedMessages[0]);
  const [time, setTime] = useState(new Date().toLocaleString());
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date().toLocaleString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const onSendAlert = async (msg) => {
    const userIds = selectedUsers.map((u) => u.user_id || u.id);
    const backendUrl = "https://rainalert-mobile.onrender.com/api/send-push-alert";
    await axios.post(backendUrl, { userIds, message: msg });
  };

  const handleSend = async (e) => {
    e.preventDefault();
    setSending(true);
    setSuccess("");
    setError("");
    const fullMessage = `Alert Level: ${selectedMessage.level}\nMessage: ${selectedMessage.message}\nTime: ${time}`;
    try {
      await onSendAlert(fullMessage);
      setSuccess("Alert sent successfully!");
      setSelectedMessage(predefinedMessages[0]);
    } catch (err) {
      setError("Failed to send alert.");
    } finally {
      setSending(false);
    }
  };

  if (!selectedUsers || selectedUsers.length === 0) {
    return <div className="p-4 text-gray-500">Select at least one user to send an alert.</div>;
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200/80 w-full max-w-md mx-auto">
      <form onSubmit={handleSend} className="flex flex-col gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Send Alert to:
          </label>
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
            <p className="font-semibold text-gray-900">
              {selectedUsers.length === 1
                ? `${selectedUsers[0].full_name}`
                : `${selectedUsers.length} users selected`}
            </p>
            {selectedUsers.length === 1 && (
              <p className="text-xs text-gray-500">{selectedUsers[0].email}</p>
            )}
            {selectedUsers.length > 1 && (
              <ul className="text-xs text-gray-500 list-disc list-inside mt-1">
                {selectedUsers.map((user) => (
                  <li key={user.user_id}>{user.full_name} ({user.email})</li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="alert-select" className="block text-sm font-medium text-gray-700 mb-1">
            Select Predefined Message:
          </label>
          <select
            id="alert-select"
            className="block w-full p-3 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            value={JSON.stringify(selectedMessage)}
            onChange={(e) => setSelectedMessage(JSON.parse(e.target.value))}
          >
            {predefinedMessages.map((opt, index) => (
              <option key={index} value={JSON.stringify(opt)}>
                {opt.level}: {opt.message}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="time-display" className="block text-sm font-medium text-gray-700 mb-1">
            Current Time (Read-only):
          </label>
          <input
            id="time-display"
            className="block w-full p-3 border border-gray-200 bg-gray-100 text-gray-600 rounded-lg shadow-sm"
            value={time}
            readOnly
          />
        </div>

        <button
          type="submit"
          className={`w-full py-3 px-4 text-white font-semibold rounded-lg shadow-md transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            sending ? "bg-gray-400" : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
          }`}
          disabled={sending}
        >
          {sending ? "Sending Alert..." : `Send Alert to ${selectedUsers.length} user${selectedUsers.length > 1 ? "s" : ""}`}
        </button>

        {success && (
          <div className="mt-2 text-center text-green-600 font-medium bg-green-50 p-3 rounded-lg">
            {success}
          </div>
        )}
        {error && (
          <div className="mt-2 text-center text-red-600 font-medium bg-red-50 p-3 rounded-lg">
            {error}
          </div>
        )}
      </form>
    </div>
  );
};

export default AlertForm; 