"use client"; // Add this at the top

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FaEye, FaEyeSlash, FaWater } from "react-icons/fa";
import { toast } from "react-toastify";
import { Lora } from "next/font/google";
import { Suspense } from 'react'

const Lorafont = Lora({
  subsets: ["latin"],
  weight: "700",
});

export default function ResetPassword() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (!token) {
      toast.error("Invalid or missing reset token");
      router.push("/");
    }
  }, [token, router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible((prev) => !prev);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Password reset successful!");
        router.push("/");
      } else {
        toast.error(data.message || "Failed to reset password");
      }
    } catch (error) {
      toast.error("An error occurred while resetting password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-8 w-[90%] max-w-md shadow-2xl transform transition-all border border-blue-100">
        <div className="flex items-center gap-2 mb-6">
          <FaWater className="text-blue-600 text-2xl" />
          <h2 className={`${Lorafont.className} text-2xl font-bold text-blue-900`}>
            Reset Password
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              name="password"
              type={isPasswordVisible ? "text" : "password"}
              placeholder="New Password"
              value={formData.password}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 rounded-lg border-2 border-blue-200 focus:border-blue-400 focus:outline-none bg-white/70 backdrop-blur-sm transition-all pr-10"
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-blue-500 hover:text-blue-700 transition-colors"
            >
              {isPasswordVisible ? <FaEye /> : <FaEyeSlash />}
            </button>
          </div>

          <div>
            <input
              name="confirmPassword"
              type="password"
              placeholder="Confirm New Password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 rounded-lg border-2 border-blue-200 focus:border-blue-400 focus:outline-none bg-white/70 backdrop-blur-sm transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
          >
            {isLoading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
