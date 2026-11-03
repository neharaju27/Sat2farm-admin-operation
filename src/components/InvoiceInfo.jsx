import React, { useState } from 'react';
import { Search, FileText, Building, User, Phone, Mail, Calendar, DollarSign, ArrowRight, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const InvoiceInfo = ({ user, onPageChange }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [deals, setDeals] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter an account ID or name');
      return;
    }

    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_INVOICE_INFO_API_URL;
      const response = await fetch(`${apiUrl}?search=${encodeURIComponent(searchQuery)}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.jwt || user?.token || ''}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to search account');
      }

      const result = await response.json();
      
      if (result.status === 'success' && result.data && result.data.length > 0) {
        setSearchResults(result.data);
        setShowDropdown(true);
        
        // Auto-select the first result
        const firstAccount = result.data[0];
        setSelectedAccount(firstAccount.account_information);
        setDeals(firstAccount.deals || []);
        
        toast.success(`Found ${result.data.length} account(s)`);
      } else {
        toast.error('No account found with this ID or name');
        setSearchResults([]);
        setShowDropdown(false);
        setSelectedAccount(null);
        setDeals([]);
      }
    } catch (error) {
      console.error('Error searching account:', error);
      toast.error('Failed to search account. Please try again.');
      setSearchResults([]);
      setShowDropdown(false);
      setSelectedAccount(null);
      setDeals([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    // Clear results when search bar is cleared
    if (!value.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      setSelectedAccount(null);
      setDeals([]);
    }
  };

  const handleAccountSelect = (accountData, dealsData) => {
    setSelectedAccount(accountData);
    setDeals(dealsData || []);
    setShowDropdown(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-IN');
    } catch {
      return dateStr;
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--surface)' }}>
      {/* Welcome Header - Only show when no results */}
      {!(searchResults.length > 0 && selectedAccount) && (
        <div style={{ padding: '24px 32px', textAlign: 'left' }}>
          <h1 style={{ color: 'var(--text)', fontSize: '36px', fontWeight: '500', margin: 0, lineHeight: 1.2 }}>
            Welcome ..! {user?.name || user?.fullName || user?.first_name || 'Operation'}
          </h1>
          <p style={{ color: 'var(--text-3)', fontSize: '16px', marginTop: '12px', maxWidth: '600px' }}>
            Your pipeline, tracked the way a season grows — from the first lead
            sown to the invoice that closes the cycle.
          </p>
        </div>
      )}

      {/* Header - Only show when results are present */}
      {searchResults.length > 0 && selectedAccount && (
        <div style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          padding: '20px 24px',
          borderBottom: '1px solid var(--border)',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          <h1 style={{ color: '#ffffff', fontSize: '24px', fontWeight: '600', margin: 0, marginBottom: '16px' }}>
            Invoice Information
            {selectedAccount && (
              <span style={{ fontSize: '16px', fontWeight: '400', marginLeft: '12px', opacity: 0.8 }}>
                - {selectedAccount.full_name || selectedAccount.account_name || 'N/A'}
              </span>
            )}
          </h1>
          
          {/* Search Bar */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{
              flex: 1,
              position: 'relative',
              maxWidth: '600px'
            }}>
              <Search size={20} style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94a3b8'
              }} />
              <input
                type="text"
                placeholder="Search by Account Number, Name, or Mobile Number..."
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyPress={handleKeyPress}
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 44px',
                  borderRadius: 'var(--r)',
                  border: '1px solid var(--border)',
                  background: 'var(--surface)',
                  color: 'var(--text)',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--green-600)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
              />
              
              {/* Search Results Dropdown */}
              {showDropdown && searchResults.length > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: '0',
                  right: '0',
                  marginTop: '8px',
                  maxHeight: '300px',
                  overflow: 'auto',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--r)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  zIndex: 1000
                }} className="scale-in">
                  {searchResults.map((result, index) => {
                    const account = result.account_information;
                    const isSelected = selectedAccount?.account_number === account.account_number;
                    return (
                      <div
                        key={account.account_number || `account-${index}`}
                        onClick={() => handleAccountSelect(account, result.deals)}
                        style={{
                          padding: '12px 16px',
                          borderBottom: index < searchResults.length - 1 ? '1px solid var(--border)' : 'none',
                          cursor: 'pointer',
                          background: isSelected ? 'var(--green-100)' : 'transparent',
                          transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) e.target.style.background = 'var(--gray-100)';
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) e.target.style.background = 'transparent';
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ 
                            width: '36px', 
                            height: '36px', 
                            borderRadius: '50%', 
                            background: isSelected ? 'var(--green-600)' : 'var(--gray-200)', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            color: isSelected ? '#ffffff' : 'var(--text-3)', 
                            fontWeight: '600', 
                            fontSize: '14px' 
                          }}>
                            {account.full_name?.charAt(0)?.toUpperCase() || account.account_name?.charAt(0)?.toUpperCase() || 'A'}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ color: 'var(--text)', fontWeight: '600', fontSize: '14px' }}>
                              {account.full_name || account.account_name || 'N/A'}
                            </div>
                            <div style={{ color: 'var(--text-3)', fontSize: '12px' }}>
                              Account Number: {account.account_number} | {result.deals?.length || 0} deal(s)
                            </div>
                          </div>
                          {isSelected && (
                            <div style={{ color: 'var(--green-600)' }}>
                              <FileText size={16} />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <button
              onClick={handleSearch}
              disabled={loading}
              style={{
                padding: '12px 24px',
                background: loading ? 'var(--gray-200)' : 'var(--green-600)',
                color: '#ffffff',
                border: 'none',
                borderRadius: 'var(--r)',
                fontSize: '14px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'background 0.2s'
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                  Searching...
                </>
              ) : (
                <>
                  <Search size={18} />
                  Search
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Centered Search Bar - Only show when no results */}
      {!(searchResults.length > 0 && selectedAccount) && (
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
            Invoice Information
          </h1>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', width: '100%', maxWidth: '600px' }}>
            <div style={{
              flex: 1,
              position: 'relative'
            }}>
              <Search size={20} style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94a3b8'
              }} />
              <input
                type="text"
                placeholder="Search by Account Number, Name, or Mobile Number..."
                value={searchQuery}
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
              
              {/* Search Results Dropdown */}
              {showDropdown && searchResults.length > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: '0',
                  right: '0',
                  marginTop: '8px',
                  maxHeight: '300px',
                  overflow: 'auto',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--r)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  zIndex: 1000
                }} className="scale-in">
                  {searchResults.map((result, index) => {
                    const account = result.account_information;
                    const isSelected = selectedAccount?.account_number === account.account_number;
                    return (
                      <div
                        key={account.account_number || `account-${index}`}
                        onClick={() => handleAccountSelect(account, result.deals)}
                        style={{
                          padding: '12px 16px',
                          borderBottom: index < searchResults.length - 1 ? '1px solid var(--border)' : 'none',
                          cursor: 'pointer',
                          background: isSelected ? 'var(--green-100)' : 'transparent',
                          transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) e.target.style.background = 'var(--gray-100)';
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) e.target.style.background = 'transparent';
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ 
                            width: '36px', 
                            height: '36px', 
                            borderRadius: '50%', 
                            background: isSelected ? 'var(--green-600)' : 'var(--gray-200)', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            color: isSelected ? '#ffffff' : 'var(--text-3)', 
                            fontWeight: '600', 
                            fontSize: '14px' 
                          }}>
                            {account.full_name?.charAt(0)?.toUpperCase() || account.account_name?.charAt(0)?.toUpperCase() || 'A'}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ color: 'var(--text)', fontWeight: '600', fontSize: '14px' }}>
                              {account.full_name || account.account_name || 'N/A'}
                            </div>
                            <div style={{ color: 'var(--text-3)', fontSize: '12px' }}>
                              Account Number: {account.account_number} | {result.deals?.length || 0} deal(s)
                            </div>
                          </div>
                          {isSelected && (
                            <div style={{ color: 'var(--green-600)' }}>
                              <FileText size={16} />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
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
            Search for accounts by account number, phone number, account name, or deal name
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
      {searchResults.length > 0 && selectedAccount && (
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Left Panel - Account Information */}
          <div style={{
            width: '45%',
            borderRight: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            background: 'var(--surface)',
            overflow: 'hidden'
          }}>
            {/* Account Info */}
            <div style={{ padding: '20px', overflow: 'auto' }} className="slide-in-left">
              <h3 style={{ color: 'var(--text)', fontSize: '16px', fontWeight: '600', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Building size={20} />
                Account Information
              </h3>
              
              <div style={{ display: 'grid', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--green-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', fontWeight: '600', fontSize: '18px' }}>
                    {selectedAccount.full_name?.charAt(0)?.toUpperCase() || selectedAccount.account_name?.charAt(0)?.toUpperCase() || 'A'}
                  </div>
                  <div>
                    <div style={{ color: 'var(--text)', fontWeight: '600', fontSize: '16px' }}>{selectedAccount.full_name || selectedAccount.account_name || 'N/A'}</div>
                    <div style={{ 
                      marginTop: '8px',
                      padding: '8px 12px',
                      background: 'var(--green-100)',
                      borderRadius: 'var(--r)',
                      border: '1px solid var(--green-600)',
                      color: 'var(--green-600)',
                      fontWeight: '600',
                      fontSize: '14px',
                      display: 'inline-block'
                    }}>
                      Account Number: {selectedAccount.account_number || 'N/A'}
                    </div>
                  </div>
                </div>

                {selectedAccount.phone && (
                  <div style={{ padding: '12px', background: 'var(--gray-100)', borderRadius: 'var(--r)', border: '2px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text)', fontSize: '13px', fontWeight: '500', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                    <Phone size={16} style={{ color: 'var(--green-600)' }} />
                    Phone: {selectedAccount.phone}
                  </div>
                )}
                
                {selectedAccount.alternate_number && (
                  <div style={{ padding: '12px', background: 'var(--gray-100)', borderRadius: 'var(--r)', border: '2px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text)', fontSize: '13px', fontWeight: '500', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                    <Phone size={16} style={{ color: 'var(--green-600)' }} />
                    Alternate Phone: {selectedAccount.alternate_number}
                  </div>
                )}

                {selectedAccount.email && (
                  <div style={{ padding: '12px', background: 'var(--gray-100)', borderRadius: 'var(--r)', border: '2px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text)', fontSize: '13px', fontWeight: '500', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                    <Mail size={16} style={{ color: 'var(--green-600)' }} />
                    Email: {selectedAccount.email}
                  </div>
                )}

                {selectedAccount.company_name && (
                  <div style={{ padding: '12px', background: 'var(--gray-100)', borderRadius: 'var(--r)', border: '2px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text)', fontSize: '13px', fontWeight: '500', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                    <Building size={16} style={{ color: 'var(--green-600)' }} />
                    Company: {selectedAccount.company_name}
                  </div>
                )}

                {selectedAccount.website && (
                  <div style={{ padding: '12px', background: 'var(--gray-100)', borderRadius: 'var(--r)', border: '2px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text)', fontSize: '13px', fontWeight: '500', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                    <FileText size={16} style={{ color: 'var(--green-600)' }} />
                    Website: {selectedAccount.website}
                  </div>
                )}

                {selectedAccount.city && selectedAccount.state && (
                  <div style={{ padding: '12px', background: 'var(--gray-100)', borderRadius: 'var(--r)', border: '2px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text)', fontSize: '13px', fontWeight: '500', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                    <User size={16} style={{ color: 'var(--green-600)' }} />
                    Location: {selectedAccount.city}, {selectedAccount.state}
                  </div>
                )}

                {selectedAccount.country && (
                  <div style={{ padding: '12px', background: 'var(--gray-100)', borderRadius: 'var(--r)', border: '2px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text)', fontSize: '13px', fontWeight: '500', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                    <User size={16} style={{ color: 'var(--green-600)' }} />
                    Country: {selectedAccount.country}
                  </div>
                )}

                {selectedAccount.industry && (
                  <div style={{ padding: '12px', background: 'var(--gray-100)', borderRadius: 'var(--r)', border: '2px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text)', fontSize: '13px', fontWeight: '500', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                    <FileText size={16} style={{ color: 'var(--green-600)' }} />
                    Industry: {selectedAccount.industry}
                  </div>
                )}

                {selectedAccount.account_type && (
                  <div style={{ padding: '12px', background: 'var(--gray-100)', borderRadius: 'var(--r)', border: '2px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text)', fontSize: '13px', fontWeight: '500', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                    <FileText size={16} style={{ color: 'var(--green-600)' }} />
                    Account Type: {selectedAccount.account_type}
                  </div>
                )}

                {selectedAccount.owner && (
                  <div style={{ padding: '12px', background: 'var(--gray-100)', borderRadius: 'var(--r)', border: '2px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text)', fontSize: '13px', fontWeight: '500', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                    <User size={16} style={{ color: 'var(--green-600)' }} />
                    Owner: {selectedAccount.owner}
                  </div>
                )}

                {selectedAccount.created_time && (
                  <div style={{ padding: '12px', background: 'var(--gray-100)', borderRadius: 'var(--r)', border: '2px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text)', fontSize: '13px', fontWeight: '500', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                    <Calendar size={16} style={{ color: 'var(--green-600)' }} />
                    Created Date: {formatDate(selectedAccount.created_time)}
                  </div>
                )}
              </div>
            </div>
          </div>

        {/* Right Panel - Deals */}
        <div style={{
          width: '55%',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--gray-100)',
          overflow: 'hidden'
        }}>
          <div style={{ padding: '20px', borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
            <h3 style={{ color: 'var(--text)', fontSize: '16px', fontWeight: '600', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={20} />
              Deals ({deals.length})
            </h3>
          </div>

          <div style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
            {deals.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '60px 20px',
                color: 'var(--text-3)',
                fontSize: '14px'
              }}>
                <FileText size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
                No deals found for this account
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '16px' }} className="slide-in-right">
                {deals.map((deal, index) => (
                  <div
                    key={deal.deal_id}
                    style={{
                      padding: '20px',
                      borderRadius: 'var(--r)',
                      background: 'var(--surface)',
                      border: '1px solid var(--border)',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                      animation: `fadeIn 0.3s ease-out ${index * 0.1}s both`
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                      <div>
                        <div style={{ color: 'var(--text)', fontWeight: '600', fontSize: '15px', marginBottom: '4px' }}>
                          {deal.deal_name || 'N/A'}
                        </div>
                      </div>
                      <div style={{ 
                        padding: '8px 12px',
                        background: 'var(--gray-100)',
                        borderRadius: 'var(--r)',
                        border: '1px solid var(--border)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <span style={{ color: 'var(--text-3)', fontSize: '12px' }}>Deal Stage:</span>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: 'var(--r)',
                          fontSize: '11px',
                          fontWeight: '600',
                          background: 'var(--green-100)',
                          color: 'var(--green-600)'
                        }}>
                          {deal.deal_stage || 'Active'}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '16px' }}>
                      {deal.deal_amount != null && (
                        <div style={{ padding: '12px', background: 'var(--gray-100)', borderRadius: 'var(--r)', border: '2px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text)', fontSize: '13px', fontWeight: '500', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                          <span style={{ fontWeight: '600', color: 'var(--green-600)' }}>Amount:</span> ₹{deal.deal_amount.toLocaleString()}
                        </div>
                      )}
                      {deal.deal_close_date != null && (
                        <div style={{ padding: '12px', background: 'var(--gray-100)', borderRadius: 'var(--r)', border: '2px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text)', fontSize: '13px', fontWeight: '500', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                          <Calendar size={16} style={{ color: 'var(--green-600)' }} />
                          <span style={{ fontWeight: '600', color: 'var(--green-600)' }}>Closing Date:</span> {formatDate(deal.deal_close_date)}
                        </div>
                      )}
                      {deal.deal_owner != null && (
                        <div style={{ padding: '12px', background: 'var(--gray-100)', borderRadius: 'var(--r)', border: '2px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text)', fontSize: '13px', fontWeight: '500', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                          <User size={16} style={{ color: 'var(--green-600)' }} />
                          <span style={{ fontWeight: '600', color: 'var(--green-600)' }}>Owner:</span> {deal.deal_owner}
                        </div>
                      )}
                      {deal.deal_type != null && (
                        <div style={{ padding: '12px', background: 'var(--gray-100)', borderRadius: 'var(--r)', border: '2px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text)', fontSize: '13px', fontWeight: '500', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                          <FileText size={16} style={{ color: 'var(--green-600)' }} />
                          <span style={{ fontWeight: '600', color: 'var(--green-600)' }}>Deal Type:</span> {deal.deal_type}
                        </div>
                      )}
                      {deal.deal_probability != null && (
                        <div style={{ padding: '12px', background: 'var(--gray-100)', borderRadius: 'var(--r)', border: '2px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text)', fontSize: '13px', fontWeight: '500', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                          <ArrowRight size={16} style={{ color: 'var(--green-600)' }} />
                          <span style={{ fontWeight: '600', color: 'var(--green-600)' }}>Probability:</span> {deal.deal_probability}%
                        </div>
                      )}
                      {deal.expected_revenue != null && (
                        <div style={{ padding: '12px', background: 'var(--gray-100)', borderRadius: 'var(--r)', border: '2px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text)', fontSize: '13px', fontWeight: '500', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                          <span style={{ fontWeight: '600', color: 'var(--green-600)' }}>Expected Revenue:</span> ₹{deal.expected_revenue.toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }

        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.5; }
        }

        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }

        @keyframes glowPulse {
          0%, 100% { 
            box-shadow: 0 4px 12px rgba(34, 197, 94, 0.2);
            transform: scale(1);
          }
          50% { 
            box-shadow: 0 4px 20px rgba(34, 197, 94, 0.4);
            transform: scale(1.02);
          }
        }

        .fade-in {
          animation: fadeIn 0.4s ease-out;
        }

        .slide-in-left {
          animation: slideInLeft 0.5s ease-out;
        }

        .slide-in-right {
          animation: slideInRight 0.5s ease-out;
        }

        .pulse-animation {
          animation: pulse 2s ease-in-out infinite;
        }

        .scale-in {
          animation: scaleIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default InvoiceInfo;
