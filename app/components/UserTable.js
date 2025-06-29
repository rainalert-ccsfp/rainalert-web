/**
 * UserTable.js
 * 
 * PURPOSE: Component for displaying and selecting users for alert sending
 * 
 * FUNCTIONALITY:
 * - Displays a table of all available users
 * - Allows multiple user selection via checkboxes
 * - Provides select all/none functionality
 * - Shows user details: name, email, role, status
 * - Integrates with parent component for user selection
 * 
 * KEY FEATURES:
 * - Custom checkbox component with keyboard accessibility
 * - Bulk user selection (select all/none)
 * - Individual user selection
 * - Responsive table design
 * - Real-time updates when user list changes
 * 
 * USER SELECTION:
 * - Tracks selected user IDs in local state
 * - Calls parent callback when selection changes
 * - Maintains selection state across re-renders
 * 
 * ACCESSIBILITY:
 * - Keyboard navigation support
 * - ARIA labels for screen readers
 * - Focus management for checkboxes
 * 
 * DEPENDENCIES:
 * - Parent component for user data and selection callback
 * - Custom checkbox component for selection UI
 */

import React, { useState } from "react";

// Custom Checkbox Component with accessibility features
const CustomCheckbox = ({ checked, onChange, label }) => {
  const handleKeyDown = (e) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      onChange();
    }
  };

  return (
    <button
      type="button"
      onClick={onChange}
      onKeyDown={handleKeyDown}
      aria-checked={checked}
      role="checkbox"
      tabIndex={0}
      className={`w-5 h-5 flex items-center justify-center border-2 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-150 ${
        checked
          ? "bg-blue-500 border-blue-500 hover:bg-blue-600"
          : "bg-white border-gray-300 hover:bg-gray-100"
      }`}
    >
      {checked && (
        <svg
          className="w-3 h-3 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="3"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      )}
      <span className="sr-only">{label}</span>
    </button>
  );
};

// User Table Component
const UserTable = ({ users, onSelectUser }) => {
  const [selectedUserIds, setSelectedUserIds] = useState([]);

  const allSelected = users.length > 0 && selectedUserIds.length === users.length;

  const handleSelectAll = () => {
    const newSelectedIds = allSelected ? [] : users.map((u) => u.user_id);
    setSelectedUserIds(newSelectedIds);
    const selectedUsers = users.filter((user) => newSelectedIds.includes(user.user_id));
    onSelectUser(selectedUsers);
  };

  const handleSelectUser = (userId) => {
    const newSelectedIds = selectedUserIds.includes(userId)
      ? selectedUserIds.filter((id) => id !== userId)
      : [...selectedUserIds, userId];
    setSelectedUserIds(newSelectedIds);
    const selectedUsers = users.filter((user) => newSelectedIds.includes(user.user_id));
    onSelectUser(selectedUsers);
  };

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                <CustomCheckbox
                  checked={allSelected}
                  onChange={handleSelectAll}
                  label="Select All Users"
                />
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Role</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-5 text-gray-500">
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((user) => {
                const isSelected = selectedUserIds.includes(user.user_id);
                return (
                  <tr key={user.user_id}>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                      <CustomCheckbox
                        checked={isSelected}
                        onChange={() => handleSelectUser(user.user_id)}
                        label={`Select user ${user.full_name}`}
                      />
                    </td>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{user.full_name}</td>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{user.email}</td>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{user.role}</td>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{user.status}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserTable;
