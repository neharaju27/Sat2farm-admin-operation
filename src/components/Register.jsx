import { useState, useEffect } from "react";
import { User, Mail, Phone, Building, Tag, ArrowRight, CheckCircle, Eye, EyeOff, AlertCircle } from "lucide-react";
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import '../styles/Sat2FarmAdminPortal.css';
import toast from 'react-hot-toast';
import { useLanguage } from '../context/LanguageContext';

const API_URL = import.meta.env.VITE_BUSINESS_PORTAL_REGISTER_API_URL;
const MANAGER_RESTRICT_API_URL = import.meta.env.VITE_MANAGER_RESTRICT_API_URL;
const GET_USER_ID_API_URL=import.meta.env.VITE_GET_USER_ID_API_URL;


export default function Registration({ user, onPageChange }) {
  const { t } = useLanguage();
  // Set currentRole based on actual user role
  const [currentRole, setCurrentRole] = useState(() => {
    const userRole = user?.role || user?.user_role || user?.type || 'ops';
    return userRole.toLowerCase();
  });

  const handleRoleSwitch = (role) => {
    setCurrentRole(role);
    // Stay on the registration page for all role switches
    // No redirects for any role - ops, sales, manager, or client
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
    country_code: "+91"
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [showErrorModal, setShowErrorModal] = useState(false);

  // Helper function to get logged-in mobile number with localStorage fallback
  const getLoggedInMobileNumber = () => {
    const fallback = user?.phone_number || user?.phoneNumber || user?.pNumber || '';
    try {
      const storedAuth = localStorage.getItem('sat2farm_auth');
      if (!storedAuth) return fallback;
      const authData = JSON.parse(storedAuth);
      return authData?.phone_number || authData?.username || fallback;
    } catch {
      return fallback;
    }
  };

  useEffect(() => {
    console.log('User prop in Registration component:', user);
    
    // Fetch client ID for referral code and account ID based on logged-in user's mobile number
    const fetchClientId = async () => {
      const loggedInPhoneNumber = getLoggedInMobileNumber();
      console.log('=== REFERRAL CODE & ACCOUNT ID DEBUG ===');
      console.log('Logged in phone number:', loggedInPhoneNumber);
      console.log('User object:', user);

      if (!loggedInPhoneNumber) {
        console.warn('No logged-in mobile number found for referral code / account ID lookup.');
        return;
      }

      try {
        const apiUrl = `${GET_USER_ID_API_URL}?mobile_no=${encodeURIComponent(loggedInPhoneNumber)}`;
        console.log('Fetching user details from URL:', apiUrl);
        
        const response = await fetch(apiUrl);
        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Full API response data:', JSON.stringify(data, null, 2));

        const clientId = data?.user_id || data?.client_id || data?.data?.client_id || data?.clientid || data?.Client_ID;
        const accountId = data?.account_id ?? data?.acc_id ?? data?.data?.account_id ?? data?.AccountId;
        console.log('Extracted client ID:', clientId);
        console.log('Extracted account ID:', accountId);

        setFormData(prev => ({
          ...prev,
          ...(clientId ? { referal_code: String(clientId) } : {}),
          ...(accountId !== undefined && accountId !== null && accountId !== '' ? { acc_id: String(accountId) } : {})
        }));

        if (clientId) {
          console.log('✅ Referral code auto-populated with client ID:', clientId);
        } else {
          console.warn('⚠️ No client_id found in response. Available keys:', Object.keys(data));
        }

        if (accountId !== undefined && accountId !== null && accountId !== '') {
          console.log('✅ Account ID auto-populated with account ID:', accountId);
        } else {
          console.warn('⚠️ No account_id found in response. Available keys:', Object.keys(data));
        }
      } catch (error) {
        console.error('❌ Error fetching user details:', error);
      }
      console.log('=== END REFERRAL CODE & ACCOUNT ID DEBUG ===');
    };
    
    fetchClientId();
  }, [user]);

  // Function to check manager count for client/manager roles
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

    // Validate email (only if provided)
    if (formData.user_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.user_email)) {
      const errorMessage = t('validEmail');
      setError(errorMessage);
      toast.error(errorMessage);
      setShowErrorModal(true);
      setLoading(false);
      return;
    }

    // Check manager count restriction for client/manager roles when registering managers
    if ((currentRole === 'client' || currentRole === 'manager') && formData.category === 'Franchise') {
      try {
        // Get the logged-in user's phone number from the user object
        const loggedInPhoneNumber = user?.phone_number || user?.phoneNumber || user?.pNumber;
        
        if (!loggedInPhoneNumber) {
          const errorMessage = t('unableToVerifyAccount');
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
          const errorMessage = t('contactOperationsTeam');
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
          toast.info(t('managerLimitUnavailable'));
          // Don't return here - allow registration to continue
        } else {
          // For other errors, block registration
          const errorMessage = t('failedToVerifyManagerLimit');
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

      // Prepare request body for new business portal API
      const requestBody = {
        type: "user",
        fName: formData.fName,
        lName: formData.lName,
        pNumber: formData.pNumber,
        category: formData.category,
        referal_code: formData.referal_code,
        country_code: formData.country_code,
        acc_id: formData.acc_id,
        user_email: formData.user_email
      };

      console.log('Request body:', JSON.stringify(requestBody));
      console.log('API URL:', API_URL);

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();
      console.log('API Response:', JSON.stringify(data, null, 2)); // Debug: Log full response as JSON
      console.log('Password fields in response:', JSON.stringify({
        password: data.password,
        new_password: data.new_password,
        user_password: data.user_password,
        Password: data.Password,
        generated_password: data.generated_password,
        temp_password: data.temp_password,
        allKeys: Object.keys(data)
      }, null, 2));

      if (response.ok) {
        // Check if the API returned a duplicate user message
        console.log('Checking for duplicate - Message:', data.Message);
        console.log('Message type:', typeof data.Message);
        console.log('Exact match test:', data.Message === "User already registered");
        
        if (data.Message && data.Message.toLowerCase().includes("already registered")) {
          const errorMessage = t('userAlreadyRegistered');
          setError(errorMessage);
          toast.error(errorMessage);
          setShowErrorModal(true);
          setLoading(false);
          return;
        }
        
        setSuccess(true);
        toast.success(t('userRegisteredSuccess'));
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
          password: data['User Login Password'] || data.password || data.new_password || data.user_password || data.Password || data.generated_password || data.temp_password || t('notProvided'),
          registrationDate: new Date().toLocaleDateString()
        };
        setRegisteredUsers(prev => [...prev, newUser]);
        
        // Reset form
        setFormData(prev => ({
          fName: "",
          lName: "",
          user_email: "",
          pNumber: "",
          acc_id: (currentRole === 'partner' || currentRole === 'manager') ? prev.acc_id : "",
          referal_code: (currentRole === 'partner' || currentRole === 'client' || currentRole === 'manager' || currentRole === 'sales') ? prev.referal_code : "",
          category: "",
          new_password: "",
          country_code: "+91"
        }));
      } else {
        const errorMessage = t('registrationFailed');
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = t('networkError');
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
              <div className="tb-page">{t('userRegistration')}</div>
              <div className="tb-sub">{t('operationsUserManagement')}</div>
            </div>
          </div>
          <div className="tb-right">
            <button className="btn btn-primary btn-sm" onClick={() => {}}>{t('new')}</button>
          </div>
        </div>

        {/* Success Message */}
        <div className="card" style={{marginBottom: '20px'}}>
          <div className="card-head">
            <span className="card-title">{t('registrationSuccessful')}</span>
          </div>
          <div className="card-body" style={{textAlign: 'center', padding: '20px'}}>
            <div className="metric metric-accent" style={{margin: '0 auto 16px', maxWidth: '80px'}}>
              <CheckCircle className="ic" style={{fontSize: '32px', color: 'var(--green-600)'}} />
            </div>
            <h3 style={{fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: 'var(--text-1)'}}>
              {t('userRegisteredSuccessfully')}
            </h3>
            <p style={{color: 'var(--text-2)', marginBottom: '16px'}}>
              {t('userRegisteredMessage')}
            </p>
            <button 
              className="btn btn-primary" 
              onClick={() => {
                setSuccess(false);
                setRegisteredUsers([]);
              }}
              style={{padding: '8px 16px', fontSize: '13px'}}
            >
              {t('ok')}
            </button>
          </div>
        </div>

        {/* Registered Users Table */}
        {registeredUsers.length > 0 && (
          <div className="card">
            <div className="card-head">
              <span className="card-title">{t('registeredUsers')}</span>
              <span className="badge badge-blue">{registeredUsers.length} {registeredUsers.length !== 1 ? t('users') : t('user')}</span>
            </div>
            <div className="card-body">
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>{t('name')}</th>
                      <th>{t('email')}</th>
                      <th>{t('phone')}</th>
                      <th>{t('countryCode')}</th>
                      <th>{t('accountId')}</th>
                      <th>{t('category')}</th>
                      <th>{t('referralCode')}</th>
                      <th>{t('password')}</th>
                      <th>{t('registrationDate')}</th>
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
            <div className="tb-page">{t('userRegistration')}</div>
            <div className="tb-sub">{t('operationsUserManagement')}</div>
          </div>
        </div>
        <div className="tb-right">
          <button className="btn btn-primary btn-sm" onClick={() => {}}>{t('new')}</button>
        </div>
      </div>

      <div style={{padding: '0 24px', maxWidth: '1000px', width: '100%', margin: '0 auto'}}>
        {/* Section Header */}
        <div className="section-head">
          <div className="section-title">{t('newRegistration')}</div>
          <span className="badge badge-blue">{t('newAccount')}</span>
        </div>

        {/* Registration Form */}
        <div className="card">
          <div className="card-head">
            <span className="card-title">{t('createNewAccount')}</span>
            <span className="card-sub">{t('fillDetailsToRegister')}</span>
          </div>
          <div className="card-body" style={{padding: '32px 24px'}}>
            <form onSubmit={handleSubmit}>
              
              {/* First Name and Last Name */}
              <div className="two-col" style={{marginBottom: '24px'}}>
                <div className="form-group">
                  <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                    <User className="input-icon" />
                    <label>{t('firstName')} *</label>
                  </div>
                  <input
                    type="text"
                    name="fName"
                    value={formData.fName}
                    onChange={handleChange}
                    required
                    placeholder={t('enterFirstName')}
                  />
                </div>

                <div className="form-group">
                  <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                    <User className="input-icon" />
                    <label>{t('lastName')}</label>
                  </div>
                  <input
                    type="text"
                    name="lName"
                    value={formData.lName}
                    onChange={handleChange}
                    placeholder={t('enterLastName')}
                  />
                </div>
              </div>

              {/* Email and Phone */}
              <div className="two-col" style={{marginBottom: '24px'}}>
                <div className="form-group">
                  <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                    <Mail className="input-icon" />
                    <label>{t('emailAddress')}</label>
                  </div>
                  <input
                    type="email"
                    name="user_email"
                    value={formData.user_email}
                    onChange={handleChange}
                    placeholder={t('enterEmailAddress')}
                  />
                </div>

                <div className="form-group">
                  <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                    <Phone className="input-icon" />
                    <label>{t('phoneNumber')} *</label>
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
                      paddingLeft: '95px'
                    }}
                    buttonStyle={{
                      borderRadius: '8px 0 0 8px',
                      border: '1px solid var(--border)',
                      backgroundColor: 'var(--bg-2)',
                      width: '80px',
                      height: '40px',
                      fontSize: '14px'
                    }}
                    containerStyle={{
                      marginTop: '8px'
                    }}
                  />
                </div>
              </div>

              {currentRole === 'client' ? (
                /* Only Referral Code for Client */
                <div className="form-group" style={{marginBottom: '24px'}}>
                  <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                    <Tag className="input-icon" />
                    <label>{t('referralCode')}</label>
                  </div>
                  <input
                    type="text"
                    name="referal_code"
                    value={formData.referal_code}
                    onChange={handleChange}
                    placeholder={t('enterReferralCodeOptional')}
                    disabled
                    style={{backgroundColor: '#f3f4f6', cursor: 'not-allowed'}}
                  />
                </div>
              ) : currentRole === 'ops' || currentRole === 'operation' || currentRole === 'operations' ? (
                /* Account ID and Referral Code for Operations role (referral code enabled) */
                <div className="two-col" style={{marginBottom: '24px'}}>
                  <div className="form-group">
                    <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                      <Building className="input-icon" />
                      <label>{t('accountId')}</label>
                    </div>
                    <input
                      type="text"
                      name="acc_id"
                      value={formData.acc_id}
                      onChange={handleChange}
                      placeholder={t('enterAccountId')}
                    />
                  </div>

                  <div className="form-group">
                    <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                      <Tag className="input-icon" />
                      <label>{t('referralCode')}</label>
                    </div>
                    <input
                      type="text"
                      name="referal_code"
                      value={formData.referal_code}
                      onChange={handleChange}
                      placeholder={t('enterReferralCodeOptional')}
                    />
                  </div>
                </div>
              ) : (
                /* Account ID and Referral Code for Sales, Partner, and Manager roles (referral code disabled, account ID auto-fetched and disabled for partner/manager) */
                <div className="two-col" style={{marginBottom: '24px'}}>
                  <div className="form-group">
                    <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                      <Building className="input-icon" />
                      <label>{t('accountId')}</label>
                    </div>
                    <input
                      type="text"
                      name="acc_id"
                      value={formData.acc_id}
                      onChange={handleChange}
                      placeholder={currentRole === 'partner' || currentRole === 'manager' ? t('fetchingAccountId') : t('enterAccountId')}
                      disabled={currentRole === 'partner' || currentRole === 'manager'}
                      style={currentRole === 'partner' || currentRole === 'manager' ? {backgroundColor: '#f3f4f6', cursor: 'not-allowed'} : {}}
                    />
                  </div>

                  <div className="form-group">
                    <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                      <Tag className="input-icon" />
                      <label>{t('referralCode')}</label>
                    </div>
                    <input
                      type="text"
                      name="referal_code"
                      value={formData.referal_code}
                      onChange={handleChange}
                      placeholder={t('fetchingReferralCode')}
                      disabled
                      style={{backgroundColor: '#f3f4f6', cursor: 'not-allowed'}}
                    />
                  </div>
                </div>
              )}

              {/* Category */}
              <div className="form-group" style={{marginBottom: '24px'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                  <Tag className="input-icon" />
                  <label>{t('category')} *</label>
                </div>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  <option value="">{t('chooseRole')}</option>
                  {currentRole === 'partner' ? (
                    <>
                      <option value="Manager">{t('manager')}</option>
                    </>
                  ) : currentRole === 'manager' ? (
                    <>
                      <option value="Farmer">{t('farmer')}</option>
                    </>
                  ) : currentRole === 'client' ? (
                    <>
                      <option value="Farmer">{t('farmer')}</option>
                      <option value="Manager">{t('manager')}</option>
                    </>
                  ) : (
                    <>
                      <option value="Farmer">{t('farmer')}</option>
                      <option value="Partner">{t('partner')}</option>
                      <option value="Manager">{t('manager')}</option>
                    </>
                  )}
                </select>
              </div>

              {/* Submit Button */}
              <div className="form-actions" style={{display: 'flex', justifyContent: 'center', marginTop: '20px'}}>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={loading}
                  style={{width: '40%', padding: '6px 12px', fontSize: '12px', height: '36px'}}
                >
                  {loading ? t('registering') : t('registerUser')}
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
              {t('registrationError')}
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
              {t('ok')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
