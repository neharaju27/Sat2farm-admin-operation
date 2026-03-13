import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react";

export default function Login({ onLogin }) {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    password: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl animate-pulse delay-500"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 rounded-3xl shadow-2xl mb-4 transform transition-all duration-500 hover:scale-110 hover:rotate-6 backdrop-blur-sm">
            <span className="text-4xl font-bold text-white tracking-tight drop-shadow-lg">S</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight drop-shadow-lg"> Satyukt CRM</h1>
          <p className="text-purple-200 text-lg font-light">Welcome back! Please sign in to continue</p>
        </div>

        {/* Login Form - More Transparent */}
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 p-10 relative overflow-hidden">
          {/* Glass Effect Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>
          
          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            {/* Email */}
            <div className="space-y-3">
              <label className="flex items-center text-sm font-bold text-purple-100">
                <Mail className="w-5 h-5 mr-3 text-purple-400" />
                username
              </label>
              <div className="relative group">
                <input
                  type="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter your name"
                  className="w-full px-5 py-4 bg-white/5 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-purple-300/70 focus:outline-none focus:ring-2 focus:ring-purple-400/40 focus:border-purple-400 transition-all duration-300 group-hover:bg-white/10 group-hover:border-purple-300 text-lg"
                />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/20 to-blue-500/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-400/10 to-indigo-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            </div>

            {/* Password */}
            <div className="space-y-3">
              <label className="flex items-center text-sm font-bold text-purple-100">
                <Lock className="w-5 h-5 mr-3 text-purple-400" />
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
                  className="w-full px-5 py-4 pr-14 bg-white/5 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-purple-300/70 focus:outline-none focus:ring-2 focus:ring-purple-400/40 focus:border-purple-400 transition-all duration-300 group-hover:bg-white/10 group-hover:border-purple-300 text-lg"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-purple-300 hover:text-white transition-all duration-200 hover:scale-110"
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

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  className="w-5 h-5 text-purple-600 border-white/30 rounded focus:ring-purple-400 focus:ring-2 mr-3 bg-white/10 backdrop-blur-sm"
                />
                <span className="text-sm text-purple-100 group-hover:text-white transition-all duration-200">Remember me</span>
              </label>
              <a href="#" className="text-sm text-purple-300 hover:text-white font-medium transition-all duration-200 hover:scale-105">
                Forgot password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white py-4 px-6 rounded-2xl font-bold text-lg shadow-2xl transform transition-all duration-300 hover:scale-105 hover:shadow-3xl hover:from-purple-700 hover:via-blue-700 hover:to-indigo-700 flex items-center justify-center group relative overflow-hidden backdrop-blur-sm"
            >
              <span className="relative z-10 flex items-center">
                Sign In
                <ArrowRight className="w-5 h-5 ml-3 transform group-hover:translate-x-2 transition-transform duration-300" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-700 via-blue-700 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-8 text-center relative z-10">
            <p className="text-purple-200 text-lg">
              Don't have an account? 
              <a href="#" className="text-white font-bold ml-2 hover:text-purple-300 transition-all duration-200 hover:scale-105">
                Create an account
              </a>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-10 text-center">
          <p className="text-xs text-purple-300/60">
            © 2024 Zoho CRM. Built with innovation and professionalism.
          </p>
        </div>
      </div>
    </div>
  );
}
