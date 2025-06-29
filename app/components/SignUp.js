"use client";
import { useState } from "react";
import { FaEye, FaEyeSlash, FaCloudRain } from "react-icons/fa";
import { toast } from "react-toastify";
import { Lora } from "next/font/google";

const Lorafont = Lora({
  subsets: ["latin"],
  weight: "700",
});

const SignUp = ({ closeModal }) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [hasPasswordText, setHasPasswordText] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "password") {
      setHasPasswordText(value.trim().length > 0);
    }
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible((prev) => !prev);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Sign up successful!");
        closeModal(false);
      } else {
        toast.error(data.message || "Sign up failed");
      }
    } catch (error) {
      toast.error("An error occurred during sign up");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-8 w-[90%] max-w-md shadow-2xl transform transition-all border border-blue-100">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <FaCloudRain className="text-blue-600 text-2xl" />
            <h2 className={`${Lorafont.className} text-2xl font-bold text-blue-900`}>Create Account</h2>
          </div>
          <button
            onClick={() => closeModal(false)}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 rounded-lg border-2 border-blue-200 focus:border-blue-400 focus:outline-none bg-white/70 backdrop-blur-sm transition-all"
            />
          </div>

          <div>
            <input
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 rounded-lg border-2 border-blue-200 focus:border-blue-400 focus:outline-none bg-white/70 backdrop-blur-sm transition-all"
            />
          </div>

          <div>
            <input
              name="email"
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 rounded-lg border-2 border-blue-200 focus:border-blue-400 focus:outline-none bg-white/70 backdrop-blur-sm transition-all"
            />
          </div>

          <div className="relative">
            <input
              name="password"
              type={isPasswordVisible ? "text" : "password"}
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 rounded-lg border-2 border-blue-200 focus:border-blue-400 focus:outline-none bg-white/70 backdrop-blur-sm transition-all pr-10"
            />
            {hasPasswordText && (
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-blue-500 hover:text-blue-700 transition-colors"
              >
                {isPasswordVisible ? <FaEye /> : <FaEyeSlash />}
              </button>
            )}
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
            >
              {isLoading ? "Creating Account..." : "Sign Up"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
