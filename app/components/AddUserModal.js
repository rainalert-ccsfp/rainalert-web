"use client";
import React, { useState } from "react";

const AddUserModal = ({ isOpen, onClose, onUserAdded }) => {
  const [formData, setFormData] = useState({
    full_name: "",
    username: "",
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/mob_app_users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to add user.");
      }

      onUserAdded();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 w-full max-w-md shadow-xl">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Add New User</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="full_name"
            placeholder="Full Name"
            value={formData.full_name}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500"
          />
          <input
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500"
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500"
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500"
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md text-gray-600 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? "Adding..." : "Add User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserModal;
