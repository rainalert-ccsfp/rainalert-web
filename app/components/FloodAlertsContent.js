/**
 * FloodAlertsContent.js
 * 
 * PURPOSE: Main dashboard component for the RainAlert flood monitoring system
 * 
 * FUNCTIONALITY:
 * - Main navigation hub for the entire application
 * - Displays real-time sensor data and flood status on Dashboard
 * - Manages user list and alert sending in Alert Users section
 * - Shows flood alerts history and analytics
 * - Handles user management interface
 * - Integrates with Socket.IO for real-time user updates
 * 
 * KEY FEATURES:
 * - Real-time sensor data polling (every 200ms on Dashboard)
 * - Live flood status monitoring with color-coded alerts
 * - User management with real-time add/delete notifications
 * - Camera livestream integration
 * - Responsive navigation between different app sections
 * 
 * SECTIONS:
 * - Dashboard: Sensor data, flood status, camera stream
 * - Flood Alerts: Historical and active flood alerts
 * - Alert Users: User selection and alert sending
 * - Analytics: Flood data visualization
 * - User Management: User administration
 * 
 * DEPENDENCIES:
 * - Socket.IO for real-time updates
 * - Various UI components (UserTable, AlertForm, etc.)
 * - API endpoints for data fetching
 */

"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  LayoutDashboard,
  BellRing,
  Map,
  History,
  Bell,
  BarChart2,
  Users,
  LogOut,
  RefreshCw,
} from "lucide-react";
import { handleSubmit, fetchCurrentSensorData } from "./getData";
import { useRouter } from "next/navigation";
import FloodAlertsTable from "./FloodAlertsTable";
import FloodAnalytics from "./FloodAnalytics";
import UserTable from "../components/UserTable";
import AlertForm from "../components/AlertForm";
import UserManagementTable from "../components/UserManagementTable";
import WebSocketStream from "../components/WebSocketStream";
import socket from "../lib/socket";

const FloodMonitoringApp = () => {
  const router = useRouter();
  const [latestSensorDistance, setLatestSensorDistance] = useState(null);
  const [lastUpdateTimestamp, setLastUpdateTimestamp] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [activeItem, setActiveItem] = useState("Dashboard");

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInitialFetch, setIsInitialFetch] = useState(true);

  const fetchAlertUsers = useCallback(async () => {
    if (isInitialFetch) {
      setUsersLoading(true);
    }
    setUsersError("");

    try {
      const response = await fetch("/api/mob_app_users");
      const data = await response.json();
      if (data.success) {
        setUsers(data.data);
      } else {
        setUsersError("Failed to fetch users.");
      }
    } catch {
      setUsersError("Failed to fetch users.");
    } finally {
      if (isInitialFetch) {
        setUsersLoading(false);
        setIsInitialFetch(false);
      }
    }
  }, [isInitialFetch]);

  useEffect(() => {
    if (activeItem === "Alert Users") {
      fetchAlertUsers();
      socket.on("user_deleted", ({ userId }) => {
        setUsers((prevUsers) => prevUsers.filter((user) => user.user_id !== userId));
      });
      socket.on("user_added", (user) => {
        setUsers((prevUsers) => [user, ...prevUsers]);
      });
      return () => {
        socket.off("user_deleted");
        socket.off("user_added");
      };
    }
  }, [activeItem, fetchAlertUsers]);

  const mainNavItems = [
    { name: "Dashboard", icon: LayoutDashboard },
    { name: "Flood Alerts", icon: BellRing },
    { name: "Alert Users", icon: Bell },
    { name: "Analytics", icon: BarChart2 },
  ];

  const managementNavItems = [{ name: "User Management", icon: Users }];

  const handleLogout = () => {
    localStorage.removeItem("user");
    sessionStorage.removeItem("user");
    router.push("/");
  };

  useEffect(() => {
    const pollSensorData = async () => {
      setErrorMessage("");
      try {
        const data = await fetchCurrentSensorData();
        if (data) {
          setLatestSensorDistance(data.distance);
          setLastUpdateTimestamp(
            data.timestamp
              ? new Date(data.timestamp).toLocaleTimeString()
              : new Date().toLocaleTimeString()
          );
        } else {
          setErrorMessage(
            "No sensor data available. Waiting for first POST to API."
          );
          setLatestSensorDistance(null);
          setLastUpdateTimestamp(null);
          setResponseMessage("Awaiting submission or data.");
          const messageElement = document.getElementById(
            "currentStatusDisplayMessage"
          );
          if (messageElement) {
            messageElement.className =
              "text-gray-600 font-bold text-lg md:text-xl break-words";
          }
        }
      } catch (error) {
        setErrorMessage("Network error fetching data: " + error.message);
        setLatestSensorDistance(null);
        setLastUpdateTimestamp(null);
        setResponseMessage("Awaiting submission or data.");
        const messageElement = document.getElementById(
          "currentStatusDisplayMessage"
        );
        if (messageElement) {
          messageElement.className =
            "text-gray-600 font-bold text-lg md:text-xl break-words";
        }
      }
    };

    if (activeItem === "Dashboard") {
      pollSensorData();

      const intervalId = setInterval(pollSensorData, 200);

      return () => clearInterval(intervalId);
    }
  }, [activeItem]);

  let statusMessage = "";
  let statusColor = "text-gray-600";

if (latestSensorDistance !== null) {
  if (latestSensorDistance >= 0.0 && latestSensorDistance <= 1.0) {
    statusMessage = "Critical Flood Level! Immediate action required.";
    statusColor = "text-red-600 animate-pulse";
  } else if (latestSensorDistance > 1.0 && latestSensorDistance <= 2.0) {
    statusMessage = "Danger: High Water Level!";
    statusColor = "text-red-500";
  } else if (latestSensorDistance > 2.0 && latestSensorDistance <= 2.5) {
    statusMessage = "Warning: Rising Water Level.";
    statusColor = "text-yellow-500";
  } else if (latestSensorDistance > 2.5 && latestSensorDistance <= 3.5) {
    statusMessage = "Safe Water Level.";
    statusColor = "text-green-600";
  } else {
    statusMessage = "Invalid reading.";
    statusColor = "text-gray-600";
  }

  const handleSendAlert = async (message) => {
    return new Promise((resolve) => setTimeout(resolve, 1000));
  };

  return (
    <div className="min-h-screen flex font-inter text-gray-800">
      <aside className="w-64 bg-gradient-to-br from-blue-700 to-blue-900 text-white shadow-lg p-6 flex flex-col justify-between fixed top-0 left-0 bottom-0 z-50">
        <div>
          <div className="flex items-center mb-10 px-4">
            <BellRing className="w-8 h-8 mr-3 text-blue-200 animate-wiggle" />
            <h1 className="text-2xl font-bold text-blue-100">RainAlert</h1>
          </div>

          <div className="mb-8">
            <h2 className="text-xs uppercase text-blue-300 tracking-wider mb-4 px-4">
              Main
            </h2>
            <nav>
              <ul>
                {mainNavItems.map((item) => (
                  <li key={item.name} className="mb-3">
                    <button
                      onClick={() => setActiveItem(item.name)}
                      className={`
                        flex items-center w-full py-3 px-4 rounded-lg text-left transition-all duration-200
                        ${
                          activeItem === item.name
                            ? "bg-blue-500 bg-opacity-70 text-white shadow-inner transform scale-105"
                            : "text-blue-100 hover:bg-blue-600 hover:bg-opacity-50 hover:text-white"
                        }
                      `}
                    >
                      <item.icon className="w-5 h-5 mr-3" />
                      <span className="font-medium">{item.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div>
            <h2 className="text-xs uppercase text-blue-300 tracking-wider mb-4 mt-6 px-4">
              Management
            </h2>
            <nav>
              <ul>
                {managementNavItems.map((item) => (
                  <li key={item.name} className="mb-3">
                    <button
                      onClick={() => setActiveItem(item.name)}
                      className={`
                        flex items-center w-full py-3 px-4 rounded-lg text-left transition-all duration-200
                        ${
                          activeItem === item.name
                            ? "bg-blue-500 bg-opacity-70 text-white shadow-inner transform scale-105"
                            : "text-blue-100 hover:bg-blue-600 hover:bg-opacity-50 hover:text-white"
                        }
                      `}
                    >
                      <item.icon className="w-5 h-5 mr-3" />
                      <span className="font-medium">{item.name}</span>
                    </button>
                  </li>
                ))}
                <li className="mt-8">
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full py-3 px-4 rounded-lg text-left transition-all duration-200
                      text-blue-100 hover:bg-blue-600 hover:bg-opacity-50 hover:text-white"
                  >
                    <LogOut className="w-5 h-5 mr-3" />
                    <span className="font-medium">Logout</span>
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        <div className="text-center text-blue-300 text-sm opacity-75">
          &copy; 2025 RainAlert CCSFP
        </div>
      </aside>

      <main className="flex-1 bg-white p-8 overflow-y-auto ml-64">
        <div className={activeItem === "Dashboard" ? "" : "hidden"}>
          <div className="text-gray-700">
            <h2 className="text-3xl font-bold mb-4 text-blue-700">
              Flood Alerts Overview
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-2">
                  Latest Water Distance
                </h3>
                {latestSensorDistance !== null ? (
                  <p className="text-blue-600 font-bold text-3xl">
                    {latestSensorDistance} ft
                  </p>
                ) : (
                  <p className="text-gray-600 font-bold text-2xl">
                    No data yet
                  </p>
                )}
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-2">Current Status</h3>
                <p
                  id="currentStatusDisplayMessage"
                  className={`font-bold text-lg md:text-xl break-words ${statusColor}`}
                >
                  {statusMessage}
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-2">Last Update</h3>
                {lastUpdateTimestamp ? (
                  <p className="text-gray-600 font-bold text-lg md:text-xl">
                    {lastUpdateTimestamp}
                  </p>
                ) : (
                  <p className="text-gray-600 font-bold text-lg md:text-xl">
                    N/A
                  </p>
                )}
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md col-span-1 md:col-span-2">
                <h3 className="text-xl font-semibold mb-4">
                  Camera Livestream
                </h3>
                <WebSocketStream />
              </div>
            </div>
          </div>
        </div>
        <div className={activeItem === "Flood Alerts" ? "" : "hidden"}>
          <div className="text-gray-700">
            <h2 className="text-3xl font-bold mb-4 text-blue-700">
              Flood Alerts
            </h2>
            <p className="text-lg mb-6">
              View and manage all active and historical flood alerts. Stay
              informed about potential risks and emergencies.
            </p>
            <FloodAlertsTable />
          </div>
        </div>
        <div className={activeItem === "Alert Users" ? "" : "hidden"}>
          <div className="text-gray-700 p-8 flex flex-col md:flex-row gap-8">
            <div className="flex-1">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-3xl font-bold text-blue-700">
                  Send Flood Alert
                </h2>
              </div>
              <p className="text-lg mb-6">
                Select users and send flood alerts directly to their mobile
                apps.
              </p>
              {usersLoading && users.length === 0 ? (
                <div>Loading users...</div>
              ) : usersError ? (
                <div className="text-red-600">{usersError}</div>
              ) : (
                <UserTable users={users} onSelectUser={setSelectedUsers} />
              )}
            </div>
            <div className="w-full md:w-1/3">
              <AlertForm
                selectedUsers={selectedUsers}
                onSendAlert={async (message) => {
                  return new Promise((resolve) => setTimeout(resolve, 1000));
                }}
              />
            </div>
          </div>
        </div>
        <div className={activeItem === "Analytics" ? "" : "hidden"}>
          <FloodAnalytics />
        </div>
        <div className={activeItem === "User Management" ? "" : "hidden"}>
          <div className="text-gray-700">
            <h2 className="text-3xl font-bold mb-4 text-blue-700">
              User Management
            </h2>
            <p className="text-lg mb-6">Mobile app user registered account</p>
            <UserManagementTable />
          </div>
        </div>
      </main>
    </div>
  );
};

export default FloodMonitoringApp;
