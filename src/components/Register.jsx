import { useState } from "react";
import { User, Mail, Phone, Building, Tag, ArrowRight, CheckCircle, Eye, EyeOff } from "lucide-react";
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import '../styles/Sat2FarmAdminPortal.css';

const API_URL = import.meta.env.VITE_USER_REGISTRATION_API_URL ;

export default function Registration({ user, onPageChange }) {
  // Set currentRole based on actual user role
  const [currentRole, setCurrentRole] = useState(() => {
    const userRole = user?.role || user?.user_role || user?.type || 'ops';
    return userRole.toLowerCase();
  });

  const handleRoleSwitch = (role) => {
    setCurrentRole(role);
    if (role === 'ops') {
      onPageChange('monthly-acreages');
    } else if (role === 'sales') {
      onPageChange('sales-acreage');
    } else if (role === 'client') {
      onPageChange('client-team');
    }
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
  const [currentUser, setCurrentUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

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
        setSuccess(true);
        // Set current user for table display
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
        setCurrentUser(newUser);
        
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
            <div className="role-switcher">
              <span style={{fontSize: '10px', color: 'var(--text-3)', marginRight: '2px'}}>Role:</span>
              <button className={`role-btn ${currentRole === 'ops' ? 'active' : ''}`} onClick={() => handleRoleSwitch('ops')}>Ops</button>
              <button className={`role-btn ${currentRole === 'sales' ? 'active' : ''}`} onClick={() => handleRoleSwitch('sales')}>Sales</button>
              <button className={`role-btn ${currentRole === 'client' ? 'active' : ''}`} onClick={() => handleRoleSwitch('client')}>Client</button>
            </div>
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
                setCurrentUser(null);
              }}
              style={{padding: '8px 16px', fontSize: '13px'}}
            >
              OK
            </button>
          </div>
        </div>

        {/* Current Registered User Table */}
        {currentUser && (
          <div className="card">
            <div className="card-head">
              <span className="card-title">Current Registered User</span>
              <span className="badge badge-blue">1 User</span>
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
                    <tr key={currentUser.id}>
                      <td>{currentUser.firstName} {currentUser.lastName}</td>
                      <td>{currentUser.email}</td>
                      <td>{currentUser.phone}</td>
                      
                      <td>{currentUser.countryCode}</td>
                      <td>{currentUser.accountId}</td>
                      <td>
                        <span className="badge badge-blue">
                          {currentUser.category}
                        </span>
                      </td>
                      <td>{currentUser.referralCode}</td>
                      <td>{currentUser.password}</td>
                      <td>{currentUser.registrationDate}</td>
                    </tr>
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
          <div className="role-switcher">
            <span style={{fontSize: '10px', color: 'var(--text-3)', marginRight: '2px'}}>Role:</span>
            <button className={`role-btn ${currentRole === 'ops' ? 'active' : ''}`} onClick={() => handleRoleSwitch('ops')}>Ops</button>
            <button className={`role-btn ${currentRole === 'sales' ? 'active' : ''}`} onClick={() => handleRoleSwitch('sales')}>Sales</button>
            <button className={`role-btn ${currentRole === 'client' ? 'active' : ''}`} onClick={() => handleRoleSwitch('client')}>Client</button>
          </div>
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
              {/* Error Message */}
              {error && (
                <div className="alert alert-danger" style={{marginBottom: '16px'}}>
                  {error}
                </div>
              )}

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

              {/* Account ID and Referral Code */}
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
                    <option value="farmer">Farmer</option>
                    <option value="Admin">Partner</option>
                    <option value="Franchise">Manager</option>
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
    </div>
  );
}
