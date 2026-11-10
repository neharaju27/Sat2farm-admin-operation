import { useState } from 'react';
import { Search, X, User, Shield, Phone, Mail, Building, Calendar, Copy, Check, MapPin, Loader2, Users, Key, Clock } from 'lucide-react';
import "../styles/Sat2FarmAdminPortal.css";
import toast from 'react-hot-toast';

const USER_SEARCH_API_URL = import.meta.env.VITE_USER_SEARCH_API_URL;
const REFERRED_ACCOUNT_API_URL = import.meta.env.VITE_USER_SEARCH_ACCOUNTS_API_URL || 'https://api.sat2farm.com/search/accounts';

export default function UserSearch({ user }) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedField, setCopiedField] = useState(null);
  const [referredAccountDetails, setReferredAccountDetails] = useState(null);
  const [loadingReferred, setLoadingReferred] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!phoneNumber.trim()) {
      setError('Please enter a phone number');
      return;
    }

    if (!USER_SEARCH_API_URL) {
      setError('API URL not configured. Please contact administrator.');
      toast.error('API configuration error');
      return;
    }

    setLoading(true);
    setError('');
    setSearchResult(null);

    try {
      const apiUrl = `${USER_SEARCH_API_URL}?phone_number=${encodeURIComponent(phoneNumber.trim())}`;
      console.log('Fetching from:', apiUrl);
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const result = await response.json();
      console.log('API Response:', result);

      if (response.ok && result.success) {
        // Transform the response to match expected structure
        const transformedData = {
          user_credentials: result.account?.user_credentials,
          admin_portal_details: result.account?.admin_portal_details,
          referal_code: result.account?.referal_code,
          referred_accounts: result.referred_accounts || [],
          referred_accounts_count: result.referred_accounts_count || 0
        };
        setSearchResult(transformedData);
        toast.success('User found successfully');
      } else {
        setError(result.message || 'User not found with this phone number');
        toast.error('User not found');
      }
    } catch (err) {
      console.error('Error searching user:', err);
      setError('Failed to search user. Please try again.');
      toast.error('Failed to search user');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setPhoneNumber('');
    setSearchResult(null);
    setError('');
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setPhoneNumber(value);
    
    // Clear results when search bar is cleared
    if (!value.trim()) {
      setSearchResult(null);
      setError('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
  };

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleReferredAccountClick = async (account) => {
    const userId = account.user_credentials?.user_id;
    if (!userId) {
      toast.error('User ID not found');
      return;
    }

    if (!REFERRED_ACCOUNT_API_URL) {
      toast.error('API URL not configured');
      return;
    }

    setLoadingReferred(true);
    try {
      const apiUrl = `${REFERRED_ACCOUNT_API_URL}?user_id=${userId}`;
      console.log('Fetching referred accounts from:', apiUrl);
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const result = await response.json();
      console.log('Referred accounts API Response:', result);

      if (response.ok && result.success && result.accounts) {
        setReferredAccountDetails(result);
        toast.success(`Loaded ${result.accounts_count} accounts`);
      } else {
        toast.error('Failed to load account details');
      }
    } catch (err) {
      console.error('Error fetching referred account details:', err);
      toast.error('Failed to load account details');
    } finally {
      setLoadingReferred(false);
    }
  };

  const getRoleBadgeClass = (role) => {
    const roleLower = (role || '').toLowerCase();
    if (roleLower.includes('operation') || roleLower.includes('ops')) {
      return 'badge-green';
    } else if (roleLower.includes('sales')) {
      return 'badge-amber';
    } else if (roleLower.includes('manager') || roleLower.includes('admin')) {
      return 'badge-green';
    } else if (roleLower.includes('client')) {
      return 'badge-purple';
    } else if (roleLower.includes('partner') || roleLower.includes('superadmin')) {
      return 'badge-pink';
    } else {
      return 'badge-gray';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const hasUserCredentials = searchResult?.user_credentials;
  const hasAdminPortalDetails = searchResult?.admin_portal_details;
  const isSuperAdmin = searchResult?.user_credentials?.account_type === 'superadmin';

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--surface)' }}>
      {/* Welcome Header - Only show when no results */}
      {!searchResult && (
        <div style={{ padding: '24px 32px', textAlign: 'left' }} className="welcome-header">
          <h1 style={{ color: 'var(--text)', fontSize: '36px', fontWeight: '500', margin: 0, lineHeight: 1.2 }}>
            Welcome ..! {user?.name || user?.fullName || user?.first_name || 'Operation'}
          </h1>
          <p style={{ color: 'var(--text-3)', fontSize: '16px', marginTop: '12px', maxWidth: '600px' }}>
            Search for users by phone number to view their credentials and account information.
          </p>
        </div>
      )}

      {/* Header - Only show when results are present */}
      {searchResult && (
        <div style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          padding: '12px 20px',
          borderBottom: '1px solid var(--border)',
          boxShadow: '0 2px 4px -1px rgba(0, 0, 0, 0.1)'
        }} className="search-header">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexDirection: 'row' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, flexWrap: 'wrap' }}>
              <h1 style={{ color: '#ffffff', fontSize: '18px', fontWeight: '600', margin: 0, whiteSpace: 'nowrap' }}>
                User Credentials
              </h1>
              {searchResult && (
                <span style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.35) 100%)',
                  padding: '8px 20px',
                  borderRadius: '25px',
                  border: '2px solid rgba(255, 255, 255, 0.4)',
                  color: '#ffffff',
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                  boxShadow: '0 4px 12px rgba(255, 255, 255, 0.15)'
                }}>
                  {searchResult.admin_portal_details?.name || searchResult.user_credentials?.user_name || 'N/A'}
                </span>
              )}
            </div>

            {/* Search Bar */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', flex: 1, justifyContent: 'flex-end' }}>
              <div style={{
                position: 'relative',
                width: '280px',
                minWidth: '200px',
                flex: 1,
                maxWidth: '400px'
              }}>
                <Phone size={16} style={{
                  position: 'absolute',
                  left: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94a3b8'
                }} />
                <input
                  type="tel"
                  placeholder="Search by Phone Number..."
                  value={phoneNumber}
                  onChange={handleSearchChange}
                  onKeyPress={handleKeyPress}
                  style={{
                    width: '100%',
                    padding: '8px 8px 8px 36px',
                    borderRadius: 'var(--r)',
                    border: '1px solid var(--border)',
                    background: 'var(--surface)',
                    color: 'var(--text)',
                    fontSize: '13px',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--green-600)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                />
              </div>
              <button
                onClick={handleSearch}
                disabled={loading}
                style={{
                  padding: '8px 16px',
                  background: loading ? 'var(--gray-200)' : 'var(--green-600)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 'var(--r)',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'background 0.2s'
                }}
              >
                {loading ? (
                  <>
                    <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search size={14} />
                    Search
                  </>
                )}
              </button>
              {phoneNumber && (
                <button
                  onClick={handleClear}
                  style={{
                    padding: '8px 12px',
                    background: 'var(--gray-100)',
                    color: 'var(--text-2)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--r)',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'background 0.2s'
                  }}
                >
                  <X size={14} />
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Centered Search Bar - Only show when no results */}
      {!searchResult && (
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          paddingTop: '60px',
          padding: '20px'
        }}>
          <h1 style={{ color: 'var(--text)', fontSize: '32px', fontWeight: '600', margin: 0, marginBottom: '32px', textAlign: 'center' }}>
            User Search
          </h1>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', width: '100%', maxWidth: '600px' }}>
            <div style={{
              flex: 1,
              position: 'relative'
            }}>
              <Phone size={20} style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94a3b8'
              }} />
              <input
                type="tel"
                placeholder="Search by Phone Number..."
                value={phoneNumber}
                onChange={handleSearchChange}
                onKeyPress={handleKeyPress}
                style={{
                  width: '100%',
                  padding: '16px 16px 16px 48px',
                  borderRadius: 'var(--r)',
                  border: '1px solid var(--border)',
                  background: 'var(--surface)',
                  color: 'var(--text)',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--green-600)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={loading}
              style={{
                padding: '16px 32px',
                background: loading ? 'var(--gray-200)' : 'var(--green-600)',
                color: '#ffffff',
                border: 'none',
                borderRadius: 'var(--r)',
                fontSize: '16px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'background 0.2s',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
                  Searching...
                </>
              ) : (
                <>
                  <Search size={20} />
                  Search
                </>
              )}
            </button>
          </div>
          <div style={{ 
            marginTop: '16px', 
            padding: '12px 24px',
            background: 'linear-gradient(135deg, var(--green-100) 0%, var(--green-50) 100%)',
            borderRadius: 'var(--r)',
            border: '2px solid var(--green-600)',
            color: 'var(--green-600)', 
            fontSize: '15px', 
            fontWeight: '600',
            textAlign: 'center',
            boxShadow: '0 4px 12px rgba(34, 197, 94, 0.2)',
            animation: 'glowPulse 2s ease-in-out infinite'
          }}>
            Search for users by phone number to view their credentials
          </div>

          {/* Decorative Design */}
          <div style={{ 
            marginTop: '40px', 
            position: 'relative',
            width: '100%',
            maxWidth: '600px',
            height: '120px',
            opacity: 0.15
          }}>
            <svg width="100%" height="100%" viewBox="0 0 600 120" style={{ overflow: 'visible' }}>
              {[0, 1, 2, 3, 4].map((i) => (
                <path
                  key={i}
                  d={`M ${-50 + i * 30} 120 C ${100 - i * 20} ${60 - i * 10}, ${300 + i * 15} ${80 - i * 5}, ${650 - i * 20} ${20 + i * 15}`}
                  fill="none"
                  stroke="var(--green-600)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              ))}
              <circle cx="550" cy="30" r="40" fill="none" stroke="var(--green-600)" strokeWidth="1" />
              <circle cx="530" cy="50" r="25" fill="none" stroke="var(--green-600)" strokeWidth="1" />
              <circle cx="510" cy="70" r="15" fill="none" stroke="var(--green-600)" strokeWidth="1" />
            </svg>
          </div>
        </div>
      )}

      {/* Main Content - Only show when results are present */}
      {searchResult && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
          {/* Top Section - Credentials Side by Side */}
          <div style={{ padding: '20px', borderBottom: '1px solid var(--border)', background: 'var(--surface)', flexShrink: 0 }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: hasUserCredentials && hasAdminPortalDetails ? '1fr 1fr' : '1fr',
              gap: '16px',
              alignItems: 'stretch'
            }} className="credentials-grid">
              
              {/* Sat2Farm Portal Credentials */}
              {hasUserCredentials && (
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <h3 style={{ color: 'var(--text)', fontSize: '15px', fontWeight: '600', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <User size={18} />
                    Sat2Farm Portal
                  </h3>

                  <div style={{
                    background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                    borderRadius: 'var(--r-lg)',
                    padding: '20px',
                    border: '1px solid #bbf7d0',
                    boxShadow: '0 2px 8px rgba(34, 197, 94, 0.1)',
                    minHeight: '280px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                  }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'rgba(255, 255, 255, 0.6)', borderRadius: 'var(--r)' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--green-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <User size={18} color="white" />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '10px', color: 'var(--text-3)', marginBottom: '2px', fontFamily: 'var(--font-mono)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                            Username
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '14px', color: 'var(--text)', fontFamily: 'var(--font-mono)', fontWeight: '500' }}>
                              {searchResult.user_credentials.user_name}
                            </span>
                            <button
                              onClick={() => handleCopy(searchResult.user_credentials.user_name, 'username')}
                              className="btn btn-ghost btn-sm"
                              style={{ padding: '4px 8px', background: 'rgba(255, 255, 255, 0.8)', borderRadius: '6px' }}
                            >
                              {copiedField === 'username' ? <Check size={14} color="var(--green-600)" /> : <Copy size={14} color="var(--green-600)" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'rgba(255, 255, 255, 0.6)', borderRadius: 'var(--r)' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--green-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Key size={18} color="white" />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '10px', color: 'var(--text-3)', marginBottom: '2px', fontFamily: 'var(--font-mono)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                            Password
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '14px', color: 'var(--text)', fontFamily: 'var(--font-mono)', fontWeight: '500' }}>
                              {searchResult.user_credentials.password}
                            </span>
                            <button
                              onClick={() => handleCopy(searchResult.user_credentials.password, 'password')}
                              className="btn btn-ghost btn-sm"
                              style={{ padding: '4px 8px', background: 'rgba(255, 255, 255, 0.8)', borderRadius: '6px' }}
                            >
                              {copiedField === 'password' ? <Check size={14} color="var(--green-600)" /> : <Copy size={14} color="var(--green-600)" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'rgba(255, 255, 255, 0.6)', borderRadius: 'var(--r)' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--green-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Shield size={18} color="white" />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '10px', color: 'var(--text-3)', marginBottom: '2px', fontFamily: 'var(--font-mono)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                            Account Type
                          </div>
                          <span className={`badge ${getRoleBadgeClass(searchResult.user_credentials.account_type)}`} style={{ fontSize: '12px', padding: '6px 12px', fontWeight: '500' }}>
                            {searchResult.user_credentials.account_type}
                          </span>
                        </div>
                      </div>

                      {searchResult.referal_code && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'rgba(255, 255, 255, 0.6)', borderRadius: 'var(--r)' }}>
                          <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--green-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Users size={18} color="white" />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '10px', color: 'var(--text-3)', marginBottom: '2px', fontFamily: 'var(--font-mono)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                              Referral Code
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '14px', color: 'var(--text)', fontFamily: 'var(--font-mono)', fontWeight: '500' }}>
                                {searchResult.referal_code}
                              </span>
                              <button
                                onClick={() => handleCopy(searchResult.referal_code, 'referral')}
                                className="btn btn-ghost btn-sm"
                                style={{ padding: '4px 8px', background: 'rgba(255, 255, 255, 0.8)', borderRadius: '6px' }}
                              >
                                {copiedField === 'referral' ? <Check size={14} color="var(--green-600)" /> : <Copy size={14} color="var(--green-600)" />}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Business Portal Credentials */}
              {hasAdminPortalDetails && (
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <h3 style={{ color: 'var(--text)', fontSize: '15px', fontWeight: '600', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Building size={18} />
                    Business Portal
                  </h3>

                  <div style={{
                    background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                    borderRadius: 'var(--r-lg)',
                    padding: '20px',
                    border: '1px solid #fcd34d',
                    boxShadow: '0 2px 8px rgba(234, 179, 8, 0.1)',
                    minHeight: '280px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                  }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'rgba(255, 255, 255, 0.6)', borderRadius: 'var(--r)' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--amber-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Phone size={18} color="white" />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '10px', color: 'var(--text-3)', marginBottom: '2px', fontFamily: 'var(--font-mono)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                            Phone Number
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '14px', color: 'var(--text)', fontFamily: 'var(--font-mono)', fontWeight: '500' }}>
                              {searchResult.admin_portal_details.phone_number}
                            </span>
                            <button
                              onClick={() => handleCopy(searchResult.admin_portal_details.phone_number, 'bphone')}
                              className="btn btn-ghost btn-sm"
                              style={{ padding: '4px 8px', background: 'rgba(255, 255, 255, 0.8)', borderRadius: '6px' }}
                            >
                              {copiedField === 'bphone' ? <Check size={14} color="var(--amber-600)" /> : <Copy size={14} color="var(--amber-600)" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'rgba(255, 255, 255, 0.6)', borderRadius: 'var(--r)' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--amber-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Key size={18} color="white" />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '10px', color: 'var(--text-3)', marginBottom: '2px', fontFamily: 'var(--font-mono)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                            Password
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '14px', color: 'var(--text)', fontFamily: 'var(--font-mono)', fontWeight: '500' }}>
                              {searchResult.admin_portal_details.password}
                            </span>
                            <button
                              onClick={() => handleCopy(searchResult.admin_portal_details.password, 'bpassword')}
                              className="btn btn-ghost btn-sm"
                              style={{ padding: '4px 8px', background: 'rgba(255, 255, 255, 0.8)', borderRadius: '6px' }}
                            >
                              {copiedField === 'bpassword' ? <Check size={14} color="var(--amber-600)" /> : <Copy size={14} color="var(--amber-600)" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'rgba(255, 255, 255, 0.6)', borderRadius: 'var(--r)' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--amber-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Shield size={18} color="white" />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '10px', color: 'var(--text-3)', marginBottom: '2px', fontFamily: 'var(--font-mono)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                            Role
                          </div>
                          <span className={`badge ${getRoleBadgeClass(searchResult.admin_portal_details.role)}`} style={{ fontSize: '12px', padding: '6px 12px', fontWeight: '500' }}>
                            {searchResult.admin_portal_details.role}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Section - Referred Accounts Table */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--surface)', overflow: 'visible' }}>
            <div style={{ padding: '20px', overflow: 'visible' }}>
              <h3 style={{ color: 'var(--text)', fontSize: '16px', fontWeight: '600', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={20} />
                Referred Accounts
                {searchResult.referred_accounts_count > 0 && (
                  <span className="badge badge-green" style={{ fontSize: '11px', padding: '4px 10px', marginLeft: '8px' }}>
                    {searchResult.referred_accounts_count}
                  </span>
                )}
              </h3>

              {searchResult.referred_accounts && searchResult.referred_accounts.length > 0 ? (
                <div style={{
                  background: 'var(--gray-50)',
                  borderRadius: 'var(--r-lg)',
                  border: '1px solid var(--border)',
                  overflow: 'hidden'
                }} className="tbl-wrap">
                  <table style={{ margin: 0, minWidth: '600px' }}>
                    <thead>
                      <tr style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)' }}>
                        <th style={{ padding: '14px 16px', background: 'transparent', color: 'var(--green-800)', fontWeight: '600' }}>Name</th>
                        <th style={{ padding: '14px 16px', background: 'transparent', color: 'var(--green-800)', fontWeight: '600' }}>Username</th>
                        <th style={{ padding: '14px 16px', background: 'transparent', color: 'var(--green-800)', fontWeight: '600' }}>Password</th>
                        <th style={{ padding: '14px 16px', background: 'transparent', color: 'var(--green-800)', fontWeight: '600' }}>Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {searchResult.referred_accounts.map((account, index) => (
                        <tr
                          key={index}
                          onClick={() => isSuperAdmin && handleReferredAccountClick(account)}
                          style={{
                            cursor: isSuperAdmin ? (loadingReferred ? 'wait' : 'pointer') : 'default',
                            backgroundColor: 'white',
                            transition: 'all 0.2s ease',
                            borderBottom: '1px solid var(--border-soft)',
                            opacity: loadingReferred ? 0.6 : 1
                          }}
                          onMouseEnter={(e) => {
                            if (isSuperAdmin && !loadingReferred) {
                              e.currentTarget.style.backgroundColor = '#f0fdf4';
                              e.currentTarget.style.transform = 'scale(1.01)';
                              e.currentTarget.style.boxShadow = '0 2px 8px rgba(34, 197, 94, 0.1)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'white';
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                        >
                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, var(--green-400) 0%, var(--green-600) 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontSize: '12px',
                                fontWeight: '600',
                                flexShrink: 0
                              }}>
                                {(account.user_details?.full_name || 'N')[0].toUpperCase()}
                              </div>
                              <div className="tbl-name" style={{ fontSize: '14px', fontWeight: '500' }}>
                                {account.user_details?.full_name || 'N/A'}
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <div style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: '13px',
                              background: 'var(--gray-100)',
                              padding: '6px 10px',
                              borderRadius: '6px',
                              display: 'inline-block'
                            }}>
                              {account.user_credentials?.user_name || 'N/A'}
                            </div>
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <div style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: '13px',
                              background: 'var(--gray-100)',
                              padding: '6px 10px',
                              borderRadius: '6px',
                              display: 'inline-block'
                            }}>
                              {account.user_credentials?.password || 'N/A'}
                            </div>
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <span className={`badge ${getRoleBadgeClass(account.user_credentials?.account_type)}`} style={{ fontSize: '11px', padding: '6px 12px', fontWeight: '500' }}>
                              {account.user_credentials?.account_type || 'N/A'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{
                  textAlign: 'center',
                  padding: '60px 20px',
                  color: 'var(--text-3)',
                  background: 'var(--gray-50)',
                  borderRadius: 'var(--r-lg)',
                  border: '1px dashed var(--border)'
                }}>
                  <Users size={64} style={{ margin: '0 auto 20px', opacity: 0.3, color: 'var(--green-400)' }} />
                  <div style={{ fontSize: '16px', fontWeight: '500', color: 'var(--text-2)' }}>No referred accounts found</div>
                  <div style={{ fontSize: '13px', marginTop: '8px' }}>This user hasn't referred any accounts yet</div>
                </div>
              )}
            </div>
          </div>

          {/* Referred Account Details Modal */}
          {referredAccountDetails && (
            <div className="modal-bg open" style={{ zIndex: 1000 }}>
              <div className="modal" style={{ width: '900px', maxHeight: '85vh' }}>
                <div className="modal-head">
                  <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Building size={20} />
                    Sub-Accounts
                    {referredAccountDetails.accounts_count > 0 && (
                      <span className="badge badge-green" style={{ fontSize: '11px', padding: '4px 10px', marginLeft: '8px' }}>
                        {referredAccountDetails.accounts_count}
                      </span>
                    )}
                  </h3>
                  <button
                    onClick={() => setReferredAccountDetails(null)}
                    className="modal-close"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="modal-body" style={{ padding: '20px' }}>
                  {loadingReferred ? (
                    <div style={{
                      textAlign: 'center',
                      padding: '60px 20px',
                      background: 'var(--gray-50)',
                      borderRadius: 'var(--r-lg)',
                      border: '1px dashed var(--border)'
                    }}>
                      <Loader2 size={48} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 20px', color: 'var(--amber-600)' }} />
                      <div style={{ fontSize: '16px', fontWeight: '500', color: 'var(--text-2)' }}>Loading account details...</div>
                      <div style={{ fontSize: '13px', marginTop: '8px', color: 'var(--text-3)' }}>Please wait while we fetch the sub-accounts</div>
                    </div>
                  ) : (
                    <div style={{
                      background: 'var(--gray-50)',
                      borderRadius: 'var(--r-lg)',
                      border: '1px solid var(--border)',
                      overflow: 'hidden'
                    }}>
                      <table style={{ margin: 0 }}>
                        <thead>
                          <tr style={{ background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)' }}>
                            <th style={{ padding: '14px 16px', background: 'transparent', color: 'var(--amber-800)', fontWeight: '600' }}>Name</th>
                            <th style={{ padding: '14px 16px', background: 'transparent', color: 'var(--amber-800)', fontWeight: '600' }}>Username</th>
                            <th style={{ padding: '14px 16px', background: 'transparent', color: 'var(--amber-800)', fontWeight: '600' }}>Password</th>
                            <th style={{ padding: '14px 16px', background: 'transparent', color: 'var(--amber-800)', fontWeight: '600' }}>Type</th>
                            <th style={{ padding: '14px 16px', background: 'transparent', color: 'var(--amber-800)', fontWeight: '600' }}>Registration Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {referredAccountDetails.accounts && referredAccountDetails.accounts.length > 0 ? (
                            referredAccountDetails.accounts.map((account, index) => (
                              <tr
                                key={index}
                                style={{
                                  backgroundColor: 'white',
                                  transition: 'all 0.2s ease',
                                  borderBottom: '1px solid var(--border-soft)'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = '#fef3c7';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = 'white';
                                }}
                              >
                                <td style={{ padding: '14px 16px' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{
                                      width: '32px',
                                      height: '32px',
                                      borderRadius: '50%',
                                      background: 'linear-gradient(135deg, var(--amber-400) 0%, var(--amber-600) 100%)',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      color: 'white',
                                      fontSize: '12px',
                                      fontWeight: '600',
                                      flexShrink: 0
                                    }}>
                                      {(account.user_details?.full_name || 'N')[0].toUpperCase()}
                                    </div>
                                    <div className="tbl-name" style={{ fontSize: '14px', fontWeight: '500' }}>
                                      {account.user_details?.full_name || 'N/A'}
                                    </div>
                                  </div>
                                </td>
                                <td style={{ padding: '14px 16px' }}>
                                  <div style={{
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '13px',
                                    background: 'var(--gray-100)',
                                    padding: '6px 10px',
                                    borderRadius: '6px',
                                    display: 'inline-block'
                                  }}>
                                    {account.user_credentials?.user_name || 'N/A'}
                                  </div>
                                </td>
                                <td style={{ padding: '14px 16px' }}>
                                  <div style={{
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '13px',
                                    background: 'var(--gray-100)',
                                    padding: '6px 10px',
                                    borderRadius: '6px',
                                    display: 'inline-block'
                                  }}>
                                    {account.user_credentials?.password || 'N/A'}
                                  </div>
                                </td>
                                <td style={{ padding: '14px 16px' }}>
                                  <span className={`badge ${getRoleBadgeClass(account.user_credentials?.account_type)}`} style={{ fontSize: '11px', padding: '6px 12px', fontWeight: '500' }}>
                                    {account.user_credentials?.account_type || 'N/A'}
                                  </span>
                                </td>
                                <td style={{ padding: '14px 16px' }}>
                                  <div style={{
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '13px',
                                    background: 'var(--gray-100)',
                                    padding: '6px 10px',
                                    borderRadius: '6px',
                                    display: 'inline-block'
                                  }}>
                                    {formatDate(account.user_details?.registration_date)}
                                  </div>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-3)' }}>
                                No accounts found
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
