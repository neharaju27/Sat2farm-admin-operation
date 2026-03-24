import { useState } from "react";
import { Eye, EyeOff, User, Lock, ArrowRight } from "lucide-react";

import backgroundImage from "../assets/satyukt.webp";

const API_URL = import.meta.env.VITE_LOGIN_API_URL;

export default function Login({ onLogin }) {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    phone_number: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors

    // Validate phone number is exactly 10 digits
    if (formData.phone_number.length !== 10 || !/^\d{10}$/.test(formData.phone_number)) {
      setError("Phone number must be exactly 10 digits");
      return;
    }

    try {
      const response = await fetch(`${API_URL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone_number: formData.phone_number,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        onLogin(data);
      } else {
        // Show specific error message from API or generic error
        const errorMessage = data.message || 'Login failed. Please check your credentials and try again.';
        setError(errorMessage);
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Network error. Please check your connection and try again.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Full Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      ></div>

      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/50"></div>

      <div className="relative z-10 w-full max-w-md mr-auto ml-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="relative inline-flex items-center justify-center mb-4">
            {/* Subtle glow effect */}
            <div className="absolute inset-0 w-20 h-20 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-full blur-lg"></div>



          </div>
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight drop-shadow-lg"> Admin Operation Portal </h1>
          </div>

        {/* Login Form - More Transparent */}
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 p-10 relative overflow-hidden">
          {/* Glass Effect Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            {/* Error Message */}
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-2xl p-4 text-red-200 text-sm text-center">
                {error}
              </div>
            )}

            {/* Username */}
            <div className="space-y-3">
              <label className="flex items-center text-sm font-bold text-white">
                <User className="w-5 h-5 mr-3" style={{ color: '#184876' }} />
                Username
              </label>
              <div className="relative group">
                <input
                  type="tel"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  required
                  placeholder="Enter your username"
                  maxLength={10}
                  pattern="[0-9]{10}"
                  className="w-full px-5 py-4 bg-white/5 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-400/40 focus:border-purple-400 transition-all duration-300 group-hover:bg-white/10 group-hover:border-purple-300 text-lg"
                />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/20 to-blue-500/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-400/10 to-indigo-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            </div>

            {/* Password */}
            <div className="space-y-3">
              <label className="flex items-center text-sm font-bold text-white">
                <Lock className="w-5 h-5 mr-3" style={{ color: '#184876' }} />
                Password
              </label>
              <div className="relative group">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Enter your password"
                  className="w-full px-5 py-4 pr-14 bg-white/5 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-400/40 focus:border-purple-400 transition-all duration-300 group-hover:bg-white/10 group-hover:border-purple-300 text-lg"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 hover:text-white transition-all duration-200 hover:scale-110"
                  style={{ color: '#184876' }}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/20 to-blue-500/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-400/10 to-indigo-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            </div>







            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-white text-black py-4 px-6 rounded-2xl font-bold text-lg shadow-2xl transform transition-all duration-300 hover:scale-105 hover:shadow-3xl hover:bg-gray-100 flex items-center justify-center group relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center">
                Sign In
                <ArrowRight className="w-5 h-5 ml-3 transform group-hover:translate-x-2 transition-transform duration-300" />
              </span>
              <div className="absolute inset-0 bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </form>





        </div>





      </div>
    </div>
  );
}
