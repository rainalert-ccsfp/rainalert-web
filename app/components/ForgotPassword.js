"use client";
import { useState } from "react";
import { FaWater, FaArrowLeft } from "react-icons/fa";
import { toast } from "react-toastify";
import { Lora } from "next/font/google";

const Lorafont = Lora({
  subsets: ["latin"],
  weight: "700",
});

const ForgotPassword = ({ closeModal }) => {
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || "Password reset instructions sent!");
        closeModal(false);
      } else {
        toast.error(data.message || "Failed to send reset instructions.");
      }
    } catch (error) {
      console.error("Frontend forgot password error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-8 w-[90%] max-w-md shadow-2xl transform transition-all border border-blue-100">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <FaWater className="text-blue-600 text-2xl" />
            <h2 className={`${Lorafont.className} text-2xl font-bold text-blue-900`}>
              Reset Password
            </h2>
          </div>
          <button
            onClick={() => closeModal(false)}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            ✕
          </button>
        </div>

        <p className="text-gray-600 mb-6">
          {"Enter your username and we'll send password reset instructions to your registered email address."}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border-2 border-blue-200 focus:border-blue-400 focus:outline-none bg-white/70 backdrop-blur-sm transition-all"
            />
          </div>

          <div className="flex flex-col gap-4">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
            >
              {isLoading ? "Sending..." : "Send Reset Instructions"}
            </button>

            <button
              type="button"
              onClick={() => closeModal(false)}
              className="flex items-center justify-center gap-2 text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              <FaArrowLeft />
              Back to Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword; 