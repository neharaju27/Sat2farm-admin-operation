import { AlertCircle, Lock } from 'lucide-react';

export default function AccessControl({ user, currentPage, onPageChange, children }) {
  const isSalesUser = user?.role === 'sales' || user?.role === 'Sales';
  
  // List of sales users BLOCKED from accessing unlock-farm and assign-acreage
  const blockedSalesUsers = [
    'Chaturya',
    'Priyanshu',
    'Bhagwati',
    'Harshitha',
    'Shurti',
    'Vijay K B',
    'Mustaqeem'
  ];
  
  // Get user name from various possible fields
  const userName = user?.name || user?.full_name || user?.first_name || user?.username || '';
  
  // Check if current sales user is in the blocked list
  const isBlockedSalesUser = blockedSalesUsers.some(blockedName => 
    userName.toLowerCase().includes(blockedName.toLowerCase())
  );
  
  // Restrict access to unlock-farm and assign-acreages for sales users in blocked list
  const isPageRestricted = isSalesUser && 
    (currentPage === 'unlock-farm' || currentPage === 'assign-acreages') && 
    isBlockedSalesUser;
  
  if (!isPageRestricted) {
    // No restriction, render the children normally
    return children;
  }
  
<<<<<<< HEAD
=======
  const handleRedirectToUnlockFarm = () => {
    onPageChange('unlock-farm');
  };
  
>>>>>>> origin/lead-opportunities
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      padding: '40px',
      backgroundColor: '#f8f7f4',
      textAlign: 'center'
    }}>
      <div style={{
        maxWidth: '500px',
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb'
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          backgroundColor: '#fee2e2',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px'
        }}>
          <Lock style={{ width: '32px', height: '32px', color: '#dc2626' }} />
        </div>
        
        <h2 style={{
          fontSize: '24px',
          fontWeight: '600',
          color: '#1f2937',
          marginBottom: '16px',
          margin: '0 0 16px 0'
        }}>
          Access Restricted
        </h2>
        
        <p style={{
          fontSize: '16px',
          color: '#6b7280',
          lineHeight: '1.5',
          marginBottom: '24px'
        }}>
<<<<<<< HEAD
          This page is only accessible to specific authorized Sales users. Please contact your administrator if you believe you should have access.
=======
          This page is only accessible to Operations users. As a Sales user, you only have access to the Unlock Farm functionality.
>>>>>>> origin/lead-opportunities
        </p>
        
        <div style={{
          backgroundColor: '#fef3c7',
          border: '1px solid #f59e0b',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '32px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px'
        }}>
          <AlertCircle style={{ width: '20px', height: '20px', color: '#f59e0b', flexShrink: 0, marginTop: '2px' }} />
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontWeight: '600', color: '#92400e', marginBottom: '4px' }}>
              Login as Operations Required
            </div>
            <div style={{ fontSize: '14px', color: '#78350f' }}>
              To access this page, please log in with Operations credentials instead of Sales credentials.
            </div>
          </div>
        </div>
<<<<<<< HEAD
=======
        
        <button
          onClick={handleRedirectToUnlockFarm}
          style={{
            backgroundColor: '#184876',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '16px',
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
          Go to Unlock Farm
        </button>
>>>>>>> origin/lead-opportunities
      </div>
    </div>
  );
}
