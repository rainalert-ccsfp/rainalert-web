/**
 * Navigation.js
 * 
 * PURPOSE: Main navigation component for the RainAlert application
 * 
 * FUNCTIONALITY:
 * - Provides navigation links to different sections of the app
 * - Handles responsive mobile menu with hamburger toggle
 * - Shows user authentication status
 * - Provides logout functionality
 * - Highlights active navigation item
 * 
 * KEY FEATURES:
 * - Responsive design with mobile hamburger menu
 * - Active page highlighting
 * - User authentication display
 * - Smooth mobile menu transitions
 * - Clean and modern UI design
 * 
 * NAVIGATION ITEMS:
 * - Dashboard: Main overview page
 * - Flood Alerts: Alert management and history
 * - Alert Users: Send alerts to users
 * - User Management: Manage system users
 * - Analytics: Data visualization and reports
 * 
 * DEPENDENCIES:
 * - Next.js router for navigation
 * - User authentication context
 * - Responsive design utilities
 */

"use client"; // Enable client-side features in Next.js

import React, { useState } from "react"; // Import React and useState hook for state management
import Link from "next/link"; // Import Next.js Link component for client-side navigation
import { usePathname } from "next/navigation"; // Import usePathname hook to get current route

const Navigation = () => {
  // State for managing mobile menu visibility
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Track if mobile menu is open
  const pathname = usePathname(); // Get current route path for active link highlighting

  // Function to toggle mobile menu visibility
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen); // Toggle menu state
  };

  // Function to close mobile menu (used when clicking navigation links)
  const closeMenu = () => {
    setIsMenuOpen(false); // Close mobile menu
  };

  // Navigation items configuration
  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: "📊" }, // Dashboard link
    { href: "/flood-alerts", label: "Flood Alerts", icon: "🚨" }, // Flood alerts link
    { href: "/alert-users", label: "Alert Users", icon: "📱" }, // Alert users link
    { href: "/user-management", label: "User Management", icon: "👥" }, // User management link
    { href: "/analytics", label: "Analytics", icon: "📈" }, // Analytics link
  ];

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link href="/dashboard" className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold">RainAlert</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  pathname === item.href
                    ? "bg-blue-700 text-white"
                    : "text-blue-100 hover:bg-blue-500 hover:text-white"
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-blue-100 hover:text-white hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              aria-expanded="false"
              aria-label="Toggle navigation menu"
            >
              <span className="sr-only">Open main menu</span>
              {/* Hamburger Icon */}
              <svg
                className={`${isMenuOpen ? "hidden" : "block"} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              {/* Close Icon */}
              <svg
                className={`${isMenuOpen ? "block" : "hidden"} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <div className={`${isMenuOpen ? "block" : "hidden"} md:hidden`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-blue-700">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={closeMenu}
              className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                pathname === item.href
                  ? "bg-blue-800 text-white"
                  : "text-blue-100 hover:bg-blue-600 hover:text-white"
              }`}
            >
              <span className="mr-2">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navigation; // Export the component as default
