"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Montserrat } from "next/font/google";
import { Lora } from "next/font/google";
import { FaEye, FaEyeSlash, FaWater, FaChartLine, FaShieldAlt } from "react-icons/fa";
import { toast } from "react-toastify";
import SignUp from "./SignUp";
import ForgotPassword from "./ForgotPassword";

const Montserratfont = Montserrat({
  subsets: ["latin"],
  weight: "500",
});

const Lorafont = Lora({
  subsets: ["latin"],
  weight: "700",
});

const Hero = () => {
  const router = useRouter();
  const [isSee, setSee] = useState(false);
  const [hasText, setHasText] = useState(false);
  const [isSign, setSign] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    remember: false,
  });

  // Check if user is already logged in
  useEffect(() => {
    const user = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (user) {
      router.push('/dashboard');
    }
  }, [router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "password") {
      setHasText(value.trim().length > 0);
    }
  };

  const handleSee = () => {
    setSee((prev) => !prev);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        // Store user data in localStorage if remember me is checked
        if (formData.remember) {
          localStorage.setItem('user', JSON.stringify(data.user));
        } else {
          sessionStorage.setItem('user', JSON.stringify(data.user));
        }
        
        toast.success("Login successful!");
        router.push('/dashboard');
      } else {
        toast.error(data.message || "Invalid username or password");
      }
    } catch (error) {
      toast.error("An error occurred during login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-32 left-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        {/* Water wave effect */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-blue-200/50 to-transparent"></div>

        {/* Floating icons */}
        <div className="absolute top-1/3 right-1/4 animate-float animation-delay-1000">
          <FaWater className="text-blue-400 text-4xl" />
        </div>

        <div className="relative min-h-screen flex items-center justify-center px-4">
          <div className="w-full max-w-4xl flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="w-full md:w-1/2 text-center md:text-left">
              <div className="inline-block p-2 px-4 rounded-full bg-blue-100/50 backdrop-blur-sm mb-4">
                <span className="text-blue-700 font-medium">Flood Monitoring System</span>
              </div>
              <h1 className={`${Lorafont.className} text-4xl md:text-5xl font-bold text-blue-900 mb-4`}>
                RainAlert Admin Dashboard
              </h1>
              <p className={`${Montserratfont.className} text-lg text-blue-800 mb-8`}>
                Stay informed about flood risks in your area
              </p>
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-white/50 backdrop-blur-sm p-4 rounded-xl border border-blue-100">
                  <FaChartLine className="text-blue-600 text-2xl mb-2" />
                  <h3 className="font-semibold text-blue-900">Real-time Monitoring</h3>
                  <p className="text-sm text-blue-700">Track water levels and flood risks</p>
                </div>
                <div className="bg-white/50 backdrop-blur-sm p-4 rounded-xl border border-blue-100">
                  <FaShieldAlt className="text-blue-600 text-2xl mb-2" />
                  <h3 className="font-semibold text-blue-900">Early Warning</h3>
                  <p className="text-sm text-blue-700">Proactive flood alerts</p>
                </div>
              </div>
            </div>

            <div className="w-full md:w-1/2">
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-blue-100">
                <div className="flex items-center gap-2 mb-6">
                  <FaWater className="text-blue-600 text-2xl" />
                  <h2 className={`${Lorafont.className} text-2xl font-bold text-blue-900`}>
                    Hello, Welcome Back!
                  </h2>
                </div>
                <form onSubmit={handleLogin} className="space-y-6">
                  <div className="space-y-4">
                    <div className="relative">
                      <input
                        name="username"
                        placeholder="Username"
                        value={formData.username}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 rounded-lg border-2 border-blue-200 focus:border-blue-400 focus:outline-none bg-white/70 backdrop-blur-sm transition-all"
                      />
                    </div>

                    <div className="relative">
                      <input
                        name="password"
                        type={isSee ? "text" : "password"}
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 rounded-lg border-2 border-blue-200 focus:border-blue-400 focus:outline-none bg-white/70 backdrop-blur-sm transition-all pr-10"
                      />
                      {hasText && (
                        <button
                          type="button"
                          onClick={handleSee}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-blue-500 hover:text-blue-700 transition-colors"
                        >
                          {isSee ? <FaEye /> : <FaEyeSlash />}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-x-2">
                      <input
                        type="checkbox"
                        id="remember"
                        checked={formData.remember}
                        onChange={(e) => setFormData(prev => ({ ...prev, remember: e.target.checked }))}
                        className="w-4 h-4 text-blue-600 border-blue-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="remember" className="text-gray-600">
                        Remember me
                      </label>
                    </div>
                    <button
                      type="button"
                      className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                      onClick={() => setIsForgotPassword(true)}
                    >
                      Forgot Password?
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-x-1 text-gray-600">
                      No Account?
                      <button
                        type="button"
                        onClick={() => setSign(true)}
                        className="text-blue-600 hover:text-blue-800 font-semibold transition-colors"
                      >
                        Sign Up
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
                  >
                    {isLoading ? "Logging in..." : "Log in"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      {isSign && <SignUp closeModal={setSign} />}
      {isForgotPassword && <ForgotPassword closeModal={setIsForgotPassword} />}
    </>
  );
};

export default Hero;
