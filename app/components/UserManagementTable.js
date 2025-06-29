/**
 * UserManagementTable.js
 * 
 * PURPOSE: Component for managing mobile app users in the RainAlert system
 * 
 * FUNCTIONALITY:
 * - Displays a table of all registered mobile app users
 * - Allows administrators to delete users from the system
 * - Integrates with Socket.IO for real-time user updates
 * - Shows user details: email, role, status
 * - Provides optimistic UI updates during user deletion
 * 
 * KEY FEATURES:
 * - Real-time user list updates when users are added/deleted elsewhere
 * - Optimistic UI updates (user disappears immediately on delete)
 * - Confirmation dialog before user deletion
 * - Loading states and error handling
 * - Automatic refresh of user list after operations
 * 
 * REAL-TIME UPDATES:
 * - Listens for 'user_deleted' events to remove users instantly
 * - Listens for 'user_added' events to add new users instantly
 * - No page refresh needed for updates
 * 
 * API ENDPOINTS:
 * - GET /api/mob_app_users - Fetches user list
 * - DELETE /api/mob_app_users/[id] - Deletes a user
 * 
 * DEPENDENCIES:
 * - Socket.IO for real-time updates
 * - Database connection for user operations
 */

"use client";
import React, { useState, useEffect, useCallback } from "react";
import { RefreshCw } from "lucide-react";
import socket from "../lib/socket";

const UserManagementTable = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pendingDeleteIds, setPendingDeleteIds] = useState([]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/mob_app_users", { cache: "no-store" });
      const result = await response.json();
      if (result.success) {
        setUsers(result.data);
        // Remove IDs from pendingDeleteIds if they are no longer in the backend
        setPendingDeleteIds((pending) => pending.filter(id => result.data.some(user => user.user_id === id)));
      } else {
        throw new Error(result.error || "Failed to fetch users.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers(); // Initial fetch
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
  }, [fetchUsers]);

  const handleDelete = async (userId) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    // Add to pendingDeleteIds for optimistic UI
    setPendingDeleteIds((prev) => [...prev, userId]);

    try {
      const response = await fetch(`/api/mob_app_users/${userId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to delete user.");
      }

      // No need to update users here; polling will handle it
    } catch (err) {
      // Remove from pendingDeleteIds if error
      setPendingDeleteIds((prev) => prev.filter((id) => id !== userId));
      alert(`Error: ${err.message}`);
    }
  };

  if (loading && users.length === 0) return <p>Loading users...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">User List</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              {/* <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th> */}
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Email
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Role
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Status
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {users.filter(user => !pendingDeleteIds.includes(user.user_id)).map((user) => (
              <tr key={user.user_id}>
                {/* <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{user.full_name}</td> */}
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  {user.email}
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  {user.role}
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  {user.status}
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <button
                    onClick={() => handleDelete(user.user_id)}
                    className="text-white bg-red-600 hover:bg-red-700 px-3 py-1 rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagementTable;
