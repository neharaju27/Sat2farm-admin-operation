import { useState } from "react";
import { User, Mail, Phone, Building, Tag, ArrowRight, CheckCircle } from "lucide-react";

const API_URL = import.meta.env.VITE_USER_REGISTRATION_API_URL ;

export default function Registration() {
  const [formData, setFormData] = useState({
    fName: "",
    lName: "",
    user_email: "",
    pNumber: "",
    acc_id: "",
    referal_code: "",
    category: "",
    new_password: "",
    country_code: "91"
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    // Validate phone number
    if (formData.pNumber && !/^\d{10}$/.test(formData.pNumber)) {
      setError("Phone number must be exactly 10 digits");
      setLoading(false);
      return;
    }

    // Validate email
    if (formData.user_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.user_email)) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    try {
      // Debug: Log the form data before sending
      console.log('Form data being sent:', formData);
      console.log('Category value:', formData.category);
      console.log('Category type:', typeof formData.category);
      
      const apiUrl = `${API_URL}?fName=${encodeURIComponent(formData.fName)}&lName=${encodeURIComponent(formData.lName)}&user_email=${encodeURIComponent(formData.user_email)}&pNumber=${encodeURIComponent(formData.pNumber)}&acc_id=${encodeURIComponent(formData.acc_id)}&referal_code=${encodeURIComponent(formData.referal_code)}&category=${encodeURIComponent(formData.category)}&new_password=${encodeURIComponent(formData.new_password)}&country_code=${encodeURIComponent(formData.country_code)}`;
      console.log('Complete API URL:', apiUrl); // Debug: Show full URL
      console.log('Category in URL:', apiUrl.split('category=')[1]?.split('&')[0]); // Extract category from URL
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      console.log('API Response:', data); // Debug: Log full response

      if (response.ok) {
        setSuccess(true);
        // Reset form
        setFormData({
          fName: "",
          lName: "",
          user_email: "",
          pNumber: "",
          acc_id: "",
          referal_code: "",
          category: "",
          new_password: "",
          country_code: "91"
        });
      } else {
        const errorMessage = data.message || 'Registration failed. Please try again.';
        setError(errorMessage);
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`Field changed: ${name} = ${value}`); // Debug: Log each field change
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 p-12 text-center max-w-md relative overflow-hidden">
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 pointer-events-none"></div>
          
          <div className="w-24 h-24 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 relative z-10 border border-green-400/30">
            <CheckCircle className="w-14 h-14 text-green-600" />
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4 relative z-10">Registration Successful!</h2>
          <p className="text-gray-600 mb-8 relative z-10"> registered successfully.</p>
          <button
            onClick={() => setSuccess(false)}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-8 rounded-2xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg relative z-10"
          >
            Register Another User
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 p-8 relative overflow-hidden">
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 pointer-events-none"></div>
          
          <h2 className="text-4xl font-bold text-gray-900 mb-2 text-center relative z-10">New  Registration</h2>
          <p className="text-gray-600 text-center mb-8 relative z-10">Fill in the details to register a new user</p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 backdrop-blur-sm border border-red-200 rounded-2xl p-4 text-red-700 text-sm relative z-10">
                {error}
              </div>
            )}

            {/* First Name and Last Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3 relative z-10">
                <label className="flex items-center text-sm font-semibold text-gray-900">
                  <User className="w-4 h-4 mr-2 text-blue-600" />
<<<<<<< HEAD
                  First Name <span className="text-red-500 ml-1">*</span>
=======
                  First Name
>>>>>>> 935f5cf04e695e21cde9535dac104ba2c88adcb6
                </label>
                <input
                  type="text"
                  name="fName"
                  value={formData.fName}
                  onChange={handleChange}
                  required
                  placeholder="Enter first name"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 transition-all duration-300 hover:bg-gray-100"
                />
              </div>

              <div className="space-y-3 relative z-10">
                <label className="flex items-center text-sm font-semibold text-gray-900">
                  <User className="w-4 h-4 mr-2 text-blue-600" />
<<<<<<< HEAD
                  Last Name <span className="text-red-500 ml-1">*</span>
=======
                  Last Name
>>>>>>> 935f5cf04e695e21cde9535dac104ba2c88adcb6
                </label>
                <input
                  type="text"
                  name="lName"
                  value={formData.lName}
                  onChange={handleChange}
                  required
                  placeholder="Enter last name"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 transition-all duration-300 hover:bg-gray-100"
                />
              </div>
            </div>

            {/* Email and Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3 relative z-10">
                <label className="flex items-center text-sm font-semibold text-gray-900">
                  <Mail className="w-4 h-4 mr-2 text-blue-600" />
<<<<<<< HEAD
                  Email <span className="text-red-500 ml-1">*</span>
=======
                  Email
>>>>>>> 935f5cf04e695e21cde9535dac104ba2c88adcb6
                </label>
                <input
                  type="email"
                  name="user_email"
                  value={formData.user_email}
                  onChange={handleChange}
                  required
                  placeholder="Enter email address"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 transition-all duration-300 hover:bg-gray-100"
                />
              </div>

              <div className="space-y-3 relative z-10">
                <label className="flex items-center text-sm font-semibold text-gray-900">
                  <Phone className="w-4 h-4 mr-2 text-blue-600" />
<<<<<<< HEAD
                  Phone Number <span className="text-red-500 ml-1">*</span>
=======
                  Phone Number
>>>>>>> 935f5cf04e695e21cde9535dac104ba2c88adcb6
                </label>
                <input
                  type="tel"
                  name="pNumber"
                  value={formData.pNumber}
                  onChange={handleChange}
                  required
                  placeholder="Enter 10-digit phone number"
                  maxLength={10}
                  pattern="[0-9]{10}"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 transition-all duration-300 hover:bg-gray-100"
                />
              </div>
            </div>

            {/* Account ID and Referral Code */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3 relative z-10">
                <label className="flex items-center text-sm font-semibold text-gray-900">
                  <Building className="w-4 h-4 mr-2 text-blue-600" />
<<<<<<< HEAD
                  Account ID <span className="text-red-500 ml-1">*</span>
=======
                  Account ID
>>>>>>> 935f5cf04e695e21cde9535dac104ba2c88adcb6
                </label>
                <input
                  type="text"
                  name="acc_id"
                  value={formData.acc_id}
                  onChange={handleChange}
<<<<<<< HEAD
                  required
=======
>>>>>>> 935f5cf04e695e21cde9535dac104ba2c88adcb6
                  placeholder="Enter account ID"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 transition-all duration-300 hover:bg-gray-100"
                />
              </div>

              <div className="space-y-3 relative z-10">
                <label className="flex items-center text-sm font-semibold text-gray-900">
                  <Tag className="w-4 h-4 mr-2 text-blue-600" />
                  Referral Code
                </label>
                <input
                  type="text"
                  name="referal_code"
                  value={formData.referal_code}
                  onChange={handleChange}
                  placeholder="Enter referral code (optional)"
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 transition-all duration-300 hover:border-blue-300 hover:shadow-sm"
                />
              </div>
            </div>

            {/* Category and Password */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3 relative z-10">
                <label className="flex items-center text-sm font-semibold text-gray-900">
                  <Tag className="w-4 h-4 mr-2 text-blue-600" />
<<<<<<< HEAD
                  Category <span className="text-red-500 ml-1">*</span>
=======
                  Category
>>>>>>> 935f5cf04e695e21cde9535dac104ba2c88adcb6
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-2xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 transition-all duration-300 hover:bg-gray-100"
                >
                  <option value="" className="bg-white">Choose a role...</option>
                  <option value="farmer" className="bg-white">Farmer</option>
                  <option value="Admin" className="bg-white"> Super Admin</option>
                  <option value="Franchise" className="bg-white">Admin</option>
                </select>
              </div>
              
              <div className="space-y-3 relative z-10">
                <label className="flex items-center text-sm font-semibold text-gray-900">
                  <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
<<<<<<< HEAD
                  Password <span className="text-red-500 ml-1">*</span>
=======
                  Password
>>>>>>> 935f5cf04e695e21cde9535dac104ba2c88adcb6
                </label>
                <input
                  type="password"
                  name="new_password"
                  value={formData.new_password}
                  onChange={handleChange}
                  required
                  placeholder="Enter password"
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 transition-all duration-300 hover:border-blue-300 hover:shadow-sm"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-2xl font-bold text-lg shadow-2xl transform transition-all duration-300 hover:scale-105 hover:shadow-3xl hover:from-blue-700 hover:to-indigo-700 flex items-center justify-center group disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative z-10"
            >
              <span className="flex items-center">
                {loading ? 'Registering...' : 'Register User'}
                {!loading && <ArrowRight className="w-5 h-5 ml-3 transform group-hover:translate-x-2 transition-transform duration-300" />}
              </span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
