import { useState, useEffect } from "react";
import { User, Mail, Phone, Building, Tag, ArrowRight, CheckCircle, Eye, EyeOff, AlertCircle } from "lucide-react";
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import '../styles/Sat2FarmAdminPortal.css';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_USER_REGISTRATION_API_URL;
const MANAGER_RESTRICT_API_URL = import.meta.env.VITE_MANAGER_RESTRICT_API_URL;

export default function Registration({ user, onPageChange }) {
  // Set currentRole based on actual user role
  const [currentRole, setCurrentRole] = useState(() => {
    const userRole = user?.role || user?.user_role || user?.type || 'ops';
    return userRole.toLowerCase();
  });

  const handleRoleSwitch = (role) => {
    setCurrentRole(role);
    // Stay on the registration page for all role switches
    // No redirects for any role - ops, sales, partner, or client
  };
  const [formData, setFormData] = useState({
    fName: "",
    lName: "",
    user_email: "",
    pNumber: "",
    fullPhoneNumber: "",
    acc_id: "",
    referal_code: "",
    category: "",
    new_password: "",
    country_code: "+91"
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);

  useEffect(() => {
    console.log('User prop in Registration component:', user);
  }, [user]);

  // Function to check manager count for client/partner roles
  const checkManagerCount = async (phoneNumber, category) => {
    try {
      console.log('Making API call to:', MANAGER_RESTRICT_API_URL);
      console.log('Request body:', JSON.stringify({
        phone_number: phoneNumber,
        category: category
      }));

      const response = await fetch(MANAGER_RESTRICT_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          phone_number: phoneNumber,
          category: category
        })
      });

      const data = await response.json();
      console.log('Manager restrict API response:', data);

      if (response.ok) {
        return data; // Returns { status: 1, manager_count: 1, remaining_slots: 1, message: "Manager added successfully" }
      } else {
        console.error('API Error:', response.status, data);
        throw new Error(data.message || `API Error: ${response.status}`);
      }
    } catch (error) {
      console.error('Error checking manager count:', error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    // Validate phone number
    if (formData.pNumber && !/^\d{10}$/.test(formData.pNumber)) {
      const errorMessage = "Phone number must be exactly 10 digits";
      setError(errorMessage);
      toast.error(errorMessage);
      setShowErrorModal(true);
      setLoading(false);
      return;
    }

    // Validate email
    if (formData.user_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.user_email)) {
      const errorMessage = "Please enter a valid email address";
      setError(errorMessage);
      toast.error(errorMessage);
      setShowErrorModal(true);
      setLoading(false);
      return;
    }

    // Check manager count restriction for client/partner roles when registering managers
    if ((currentRole === 'client' || currentRole === 'partner') && formData.category === 'Franchise') {
      try {
        // Get the logged-in user's phone number from the user object
        const loggedInPhoneNumber = user?.phone_number || user?.phoneNumber || user?.pNumber;
        
        if (!loggedInPhoneNumber) {
          const errorMessage = "Unable to verify account. Please log in again.";
          setError(errorMessage);
          toast.error(errorMessage);
          setShowErrorModal(true);
          setLoading(false);
          return;
        }

        console.log('Checking manager count for phone:', loggedInPhoneNumber, 'category:', formData.category);
        
        // First, check current manager count BEFORE registration
        const currentManagerData = await checkManagerCount(loggedInPhoneNumber, formData.category);
        
        console.log('=== PRE-REGISTRATION MANAGER COUNT CHECK ===');
        console.log('Current manager count BEFORE registration:', currentManagerData.manager_count);
        console.log('Remaining slots BEFORE registration:', currentManagerData.remaining_slots);
        
        // Check if manager count has already reached the limit BEFORE trying to add
        // Block when manager_count is exactly 2 (already have 2 managers)
        if (currentManagerData.manager_count === 2) {
          console.log('🚫 BLOCKING: Manager count is', currentManagerData.manager_count, ', cannot add more');
          const errorMessage = "Please contact operations team to add more managers";
          setError(errorMessage);
          toast.error(errorMessage);
          setShowErrorModal(true);
          setLoading(false);
          return;
        }
        
        console.log('✅ ALLOWING: Registration can proceed. Current manager count:', currentManagerData.manager_count, 'is less than 2');
        console.log('=== END PRE-REGISTRATION CHECK ===');
      } catch (error) {
        console.error('API Error:', error);
        
        // If API fails (500 error), allow registration to proceed with a warning
        if (error.message.includes('Internal Server Error') || error.message.includes('500')) {
          console.log('API unavailable, allowing registration to proceed');
          toast.info('Manager limit check temporarily unavailable. Registration will proceed.');
          // Don't return here - allow registration to continue
        } else {
          // For other errors, block registration
          const errorMessage = "Failed to verify manager limit. Please try again.";
          setError(errorMessage);
          toast.error(errorMessage);
          setShowErrorModal(true);
          setLoading(false);
          return;
        }
      }
    }

    try {
      // Debug: Log form data before sending
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
        // Check if the API returned a duplicate user message
        console.log('Checking for duplicate - Message:', data.Message);
        console.log('Message type:', typeof data.Message);
        console.log('Exact match test:', data.Message === "User already registered");
        
        if (data.Message && data.Message.toLowerCase().includes("already registered")) {
          const errorMessage = "User already registered with this phone number. Please try registering with a new phone number.";
          setError(errorMessage);
          toast.error(errorMessage);
          setShowErrorModal(true);
          setLoading(false);
          return;
        }
        
        setSuccess(true);
        toast.success('User registered successfully!');
        // Add new user to the registered users list
        const newUser = {
          id: Date.now(),
          firstName: formData.fName,
          lastName: formData.lName,
          email: formData.user_email,
          phone: formData.pNumber,
          
          countryCode: formData.country_code,
          accountId: formData.acc_id,
          referralCode: formData.referal_code || '-',
          category: formData.category,
          password: formData.new_password,
          registrationDate: new Date().toLocaleDateString()
        };
        setRegisteredUsers(prev => [...prev, newUser]);
        
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
          country_code: "+91"
        });
      } else {
        const errorMessage = data.message || 'Registration failed. Please try again.';
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = 'Network error. Please check your connection and try again.';
      setError(errorMessage);
      toast.error(errorMessage);
      setShowErrorModal(true);
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
      <div className="content-area" style={{backgroundColor: '#f8f7f4', minHeight: '100vh', padding: '0'}}>
        {/* Top Navigation Bar - Full Width */}
        <div className="topbar" style={{marginBottom: '20px', marginLeft: '0', marginRight: '0', backgroundColor: '#ffffff', borderBottom: '1px solid var(--border)', padding: '0 24px'}}>
          <div className="tb-left">
            <div>
              <div className="tb-page">User Registration</div>
              <div className="tb-sub">Operations · User Management</div>
            </div>
          </div>
          <div className="tb-right">
            <button className="btn btn-primary btn-sm" onClick={() => {}}>+ New</button>
          </div>
        </div>

        {/* Success Message */}
        <div className="card" style={{marginBottom: '20px'}}>
          <div className="card-head">
            <span className="card-title">Registration Successful!</span>
          </div>
          <div className="card-body" style={{textAlign: 'center', padding: '20px'}}>
            <div className="metric metric-accent" style={{margin: '0 auto 16px', maxWidth: '80px'}}>
              <CheckCircle className="ic" style={{fontSize: '32px', color: 'var(--green-600)'}} />
            </div>
            <h3 style={{fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: 'var(--text-1)'}}>
              User Registered Successfully
            </h3>
            <p style={{color: 'var(--text-2)', marginBottom: '16px'}}>
              The user has been successfully registered in the system.
            </p>
            <button 
              className="btn btn-primary" 
              onClick={() => {
                setSuccess(false);
                setRegisteredUsers([]);
              }}
              style={{padding: '8px 16px', fontSize: '13px'}}
            >
              OK
            </button>
          </div>
        </div>

        {/* Registered Users Table */}
        {registeredUsers.length > 0 && (
          <div className="card">
            <div className="card-head">
              <span className="card-title">Registered Users</span>
              <span className="badge badge-blue">{registeredUsers.length} User{registeredUsers.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="card-body">
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Country Code</th>
                      <th>Account ID</th>
                      <th>Category</th>
                      <th>Referral Code</th>
                      <th>Password</th>
                      <th>Registration Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registeredUsers.map((user) => (
                      <tr key={user.id}>
                        <td>{user.firstName} {user.lastName}</td>
                        <td>{user.email}</td>
                        <td>{user.phone}</td>
                        
                        <td>{user.countryCode}</td>
                        <td>{user.accountId}</td>
                        <td>
                          <span className="badge badge-blue">
                            {user.category}
                          </span>
                        </td>
                        <td>{user.referralCode}</td>
                        <td>{user.password}</td>
                        <td>{user.registrationDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="content-area" style={{backgroundColor: '#f8f7f4', minHeight: '100vh', padding: '0'}}>
      {/* Top Navigation Bar - Full Width */}
      <div className="topbar" style={{marginBottom: '20px', marginLeft: '0', marginRight: '0', backgroundColor: '#ffffff', borderBottom: '1px solid var(--border)', padding: '0 24px'}}>
        <div className="tb-left">
          <div>
            <div className="tb-page">User Registration</div>
            <div className="tb-sub">Operations · User Management</div>
          </div>
        </div>
        <div className="tb-right">
          <button className="btn btn-primary btn-sm" onClick={() => {}}>+ New</button>
        </div>
      </div>

      <div style={{padding: '0 24px', maxWidth: '1000px', width: '100%', margin: '0 auto'}}>
        {/* Section Header */}
        <div className="section-head">
          <div className="section-title"> Registration</div>
          <span className="badge badge-blue">New Account</span>
        </div>

        {/* Registration Form */}
        <div className="card">
          <div className="card-head">
            <span className="card-title">Create New Account</span>
            <span className="card-sub">Fill in the details below to register</span>
          </div>
          <div className="card-body" style={{padding: '32px 24px'}}>
            <form onSubmit={handleSubmit}>
              
              {/* First Name and Last Name */}
              <div className="two-col" style={{marginBottom: '24px'}}>
                <div className="form-group">
                  <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                    <User className="input-icon" />
                    <label>First Name *</label>
                  </div>
                  <input
                    type="text"
                    name="fName"
                    value={formData.fName}
                    onChange={handleChange}
                    required
                    placeholder="Enter first name"
                  />
                </div>

                <div className="form-group">
                  <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                    <User className="input-icon" />
                    <label>Last Name *</label>
                  </div>
                  <input
                    type="text"
                    name="lName"
                    value={formData.lName}
                    onChange={handleChange}
                    required
                    placeholder="Enter last name"
                  />
                </div>
              </div>

              {/* Email and Phone */}
              <div className="two-col" style={{marginBottom: '24px'}}>
                <div className="form-group">
                  <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                    <Mail className="input-icon" />
                    <label>Email Address *</label>
                  </div>
                  <input
                    type="email"
                    name="user_email"
                    value={formData.user_email}
                    onChange={handleChange}
                    required
                    placeholder="Enter email address"
                  />
                </div>

                <div className="form-group">
                  <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                    <Phone className="input-icon" />
                    <label>Phone Number *</label>
                  </div>
                  <PhoneInput
                    country={'in'}
                    value={formData.fullPhoneNumber}
                    onChange={(value, country) => {
                      setFormData(prev => ({
                        ...prev,
                        country_code: `+${country.dialCode}`,
                        pNumber: value.slice(country.dialCode.length),
                        fullPhoneNumber: value
                      }));
                    }}
                    inputStyle={{
                      width: '100%',
                      height: '40px',
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                      fontSize: '14px',
                      paddingLeft: '48px'
                    }}
                    buttonStyle={{
                      borderRadius: '8px 0 0 8px',
                      border: '1px solid var(--border)',
                      backgroundColor: 'var(--bg-2)'
                    }}
                    containerStyle={{
                      marginTop: '8px'
                    }}
                  />
                </div>
              </div>

              {currentRole === 'client' || currentRole === 'partner' ? (
                /* Only Referral Code for Client and Partner */
                <div className="form-group" style={{marginBottom: '24px'}}>
                  <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                    <Tag className="input-icon" />
                    <label>Referral Code *</label>
                  </div>
                  <input
                    type="text"
                    name="referal_code"
                    value={formData.referal_code}
                    onChange={handleChange}
                    placeholder="Enter referral code (required)"
                    required
                  />
                </div>
              ) : (
                /* Account ID and Referral Code for other roles */
                <div className="two-col" style={{marginBottom: '24px'}}>
                  <div className="form-group">
                    <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                      <Building className="input-icon" />
                      <label>Account ID *</label>
                    </div>
                    <input
                      type="text"
                      name="acc_id"
                      value={formData.acc_id}
                      onChange={handleChange}
                      required
                      placeholder="Enter account ID"
                    />
                  </div>

                  <div className="form-group">
                    <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                      <Tag className="input-icon" />
                      <label>Referral Code</label>
                    </div>
                    <input
                      type="text"
                      name="referal_code"
                      value={formData.referal_code}
                      onChange={handleChange}
                      placeholder="Enter referral code (optional)"
                    />
                  </div>
                </div>
              )}

              {/* Category and Password */}
              <div className="two-col" style={{marginBottom: '24px'}}>
                <div className="form-group">
                  <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                    <Tag className="input-icon" />
                    <label>Category *</label>
                  </div>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Choose a role...</option>
                    {currentRole === 'client' || currentRole === 'partner' ? (
                      <>
                        <option value="farmer">Farmer</option>
                        <option value="Franchise">Manager</option>
                      </>
                    ) : (
                      <>
                        <option value="farmer">Farmer</option>
                        <option value="Admin">Partner</option>
                        <option value="Franchise">Manager</option>
                      </>
                    )}
                  </select>
                </div>
                
                <div className="form-group">
                  <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                    <Tag className="input-icon" />
                    <label>Password *</label>
                  </div>
                  <div style={{position: 'relative'}}>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="new_password"
                      value={formData.new_password}
                      onChange={handleChange}
                      required
                      placeholder="Enter password"
                      style={{width: '100%', paddingRight: '40px'}}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '8px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px',
                        color: 'var(--text-2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      tabIndex="-1"
                    >
                      {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="form-actions" style={{display: 'flex', justifyContent: 'center', marginTop: '20px'}}>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={loading}
                  style={{width: '40%', padding: '6px 12px', fontSize: '12px', height: '36px'}}
                >
                  {loading ? 'Registering...' : 'Register User'}
                  {!loading && <ArrowRight className="ic-xs" style={{marginLeft: '4px'}} />}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Error Modal */}
      {showErrorModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '32px',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
            maxWidth: '400px',
            width: '90%',
            textAlign: 'center'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              backgroundColor: '#fee2e2',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <AlertCircle style={{ width: '24px', height: '24px', color: '#dc2626' }} />
            </div>
            
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '12px',
              margin: '0 0 12px 0'
            }}>
              Registration Error
            </h3>
            
            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              lineHeight: '1.5',
              marginBottom: '24px'
            }}>
              {error}
            </p>
            
            <button
              onClick={() => {
                setShowErrorModal(false);
                setError("");
              }}
              style={{
                backgroundColor: '#184876',
                color: 'white',
                padding: '10px 20px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                width: '100%'
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#1a5490';
                e.target.style.transform = 'translateY(-1px)';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = '#184876';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
