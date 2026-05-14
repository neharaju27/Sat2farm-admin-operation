import { useState, useEffect } from 'react';
import { Search, Users, User, Building, Phone, Mail, Lock, Unlock, ArrowRight, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import '../styles/Sat2FarmAdminPortal.css';

export default function AccountMonitor({ user, onPageChange }) {
  const { login, logout } = useAuth();
  const [selectedRole, setSelectedRole] = useState('sales');
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [originalUser, setOriginalUser] = useState(null);

  // Mock data for different roles - replace with actual API calls
  const mockAccounts = {
    sales: [
      { id: 1, name: 'Nirosha', phone: '+91 9876543210', email: 'nirosha@satyukt.com', role: 'sales' },
      { id: 2, name: 'Aymen', phone: '+91 9876543211', email: 'aymen@satyukt.com', role: 'sales' },
      { id: 3, name: 'Rahul', phone: '+91 9876543212', email: 'rahul@satyukt.com', role: 'sales' },
      { id: 4, name: 'Priya', phone: '+91 9876543213', email: 'priya@satyukt.com', role: 'sales' },
    ],
    partner: [
      { id: 5, name: 'GreenField Agro', phone: '+91 8765432101', email: 'contact@greenfield.com', role: 'partner' },
      { id: 6, name: 'Sunrise Farms', phone: '+91 8765432102', email: 'info@sunrisefarms.com', role: 'partner' },
      { id: 7, name: 'Deccan Planters', phone: '+91 8765432103', email: 'admin@deccan.com', role: 'partner' },
    ],
    client: [
      { id: 8, name: 'Kaveri Holdings', phone: '+91 7654321010', email: 'kaveri@holdings.com', role: 'client' },
      { id: 9, name: 'Vijaya FarmTech', phone: '+91 7654321011', email: 'vijaya@farmtech.com', role: 'client' },
      { id: 10, name: 'Tamil Nadu Agro', phone: '+91 7654321012', email: 'tnagro@agro.com', role: 'client' },
    ]
  };

  // Store original user when component mounts
  useEffect(() => {
    setOriginalUser(user);
  }, [user]);

  // Load accounts based on selected role
  useEffect(() => {
    setLoading(true);
    // Simulate API call - replace with actual API
    setTimeout(() => {
      setAccounts(mockAccounts[selectedRole] || []);
      setLoading(false);
    }, 500);
  }, [selectedRole]);

  // Filter accounts based on search query
  const filteredAccounts = accounts.filter(account =>
    account.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    account.phone.includes(searchQuery) ||
    account.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle login as selected user
  const handleLoginAsUser = async (account) => {
    try {
      // Store original user before switching
      if (!originalUser) {
        setOriginalUser(user);
      }
      
      // Login as the selected user
      // Note: You'll need to implement actual password retrieval or use a different auth mechanism
      // For now, this is a placeholder - you may need to use a special admin API endpoint
      await login(account.phone, 'default_password'); // Replace with actual password retrieval
      
      // Redirect to appropriate page based on role
      if (account.role === 'sales') {
        onPageChange('assign-acreages');
      } else if (account.role === 'partner' || account.role === 'client') {
        onPageChange('unlock-farm');
      }
    } catch (error) {
      console.error('Login failed:', error);
      alert('Failed to login as this user. Please check credentials.');
    }
  };

  // Handle logout and return to original user
  const handleReturnToOriginal = async () => {
    if (originalUser) {
      try {
        await login(originalUser.phone_number || originalUser.phone, 'default_password');
        onPageChange('monthly-acreages');
      } catch (error) {
        console.error('Return to original user failed:', error);
      }
    }
  };

  const roleLabels = {
    sales: 'Sales Accounts',
    partner: 'Partner Accounts',
    client: 'Client Accounts'
  };

  const roleIcons = {
    sales: Users,
    partner: Building,
    client: User
  };

  const RoleIcon = roleIcons[selectedRole];

  return (
    <div className="sat2farm-portal-full">
      <div className="main-full">
        {/* TOPBAR */}
        <div className="topbar" style={{ backgroundColor: '#ffffff', borderBottom: '1px solid var(--border)' }}>
          <div className="tb-left">
            <div>
              <div className="tb-page">Account Monitor</div>
              <div className="tb-sub">Operations · Account Management</div>
            </div>
          </div>
          <div className="tb-right">
            {originalUser && originalUser.role !== user?.role && (
              <button
                className="btn btn-sm"
                onClick={handleReturnToOriginal}
                style={{ marginRight: '8px' }}
              >
                <LogOut style={{ width: '14px', height: '14px', marginRight: '6px' }} />
                Return to Admin
              </button>
            )}
          </div>
        </div>

        {/* CONTENT */}
        <div className="content-area">
          {/* Role Switcher */}
          <div style={{ marginBottom: '24px' }}>
            <div className="role-switcher">
              <span style={{ fontSize: '12px', color: 'var(--text-3)', fontWeight: '500', marginRight: '8px' }}>Monitor:</span>
              {['sales', 'partner', 'client'].map((role) => (
                <button
                  key={role}
                  onClick={() => setSelectedRole(role)}
                  className={`role-btn ${selectedRole === role ? 'active' : ''}`}
                >
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Header */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <div style={{
                padding: '12px',
                backgroundColor: 'var(--green-100)',
                borderRadius: 'var(--r)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <RoleIcon style={{ width: '24px', height: '24px', color: 'var(--green-600)' }} />
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '500', color: 'var(--text)', fontFamily: 'var(--font-display)' }}>
                  {roleLabels[selectedRole]}
                </h2>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-3)' }}>
                  {filteredAccounts.length} accounts found
                </p>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div style={{ marginBottom: '24px' }}>
            <div className="search-bar" style={{ width: '400px' }}>
              <Search className="search-icon" style={{ fontSize: '13px' }} />
              <input
                type="text"
                placeholder="Search accounts by name, phone, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Accounts Grid */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-2)' }}>
              <div style={{ fontSize: '24px', marginBottom: '16px' }}>⏳</div>
              <div>Loading accounts...</div>
            </div>
          ) : filteredAccounts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-2)' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
              <div>No accounts found</div>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '16px'
            }}>
              {filteredAccounts.map((account) => (
                <div
                  key={account.id}
                  className="card"
                  style={{
                    padding: '20px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onClick={() => handleLoginAsUser(account)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--green-400)';
                    e.currentTarget.style.boxShadow = '0 4px 12px 0 rgba(39, 80, 10, 0.15)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <div className="avatar-sm" style={{
                      width: '48px',
                      height: '48px',
                      fontSize: '18px',
                      backgroundColor: 'var(--green-200)',
                      color: 'var(--green-800)'
                    }}>
                      {account.name.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '16px', fontWeight: '500', color: 'var(--text)', marginBottom: '4px', fontFamily: 'var(--font-display)' }}>
                        {account.name}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-3)', textTransform: 'capitalize', fontFamily: 'var(--font-mono)' }}>
                        {account.role}
                      </div>
                    </div>
                    <ArrowRight style={{ width: '20px', height: '20px', color: 'var(--text-3)' }} />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-2)' }}>
                      <Phone style={{ width: '14px', height: '14px' }} />
                      <span>{account.phone}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-2)' }}>
                      <Mail style={{ width: '14px', height: '14px' }} />
                      <span>{account.email}</span>
                    </div>
                  </div>

                  <div style={{
                    marginTop: '16px',
                    paddingTop: '16px',
                    borderTop: '1px solid var(--border-soft)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-3)' }}>
                      Click to login as this user
                    </span>
                    <div style={{
                      padding: '6px 12px',
                      backgroundColor: 'var(--green-600)',
                      color: '#fff',
                      borderRadius: 'var(--r)',
                      fontSize: '12px',
                      fontWeight: '500',
                      fontFamily: 'var(--font-mono)'
                    }}>
                      Login
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
