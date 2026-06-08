
import { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from "./components/Sidebar";
import UnlockFarm from "./components/UnlockFarm";
import Login from "./components/Login";
import AdminOperationalPortal from "./components/AdminOperationalPortal";
import MonthlyAcreages from "./components/MonthlyAcreages";
import FarmManagement from "./components/FarmManagement";
import AssignAcreage from "./components/AssignAcreage";
import ClientAccounts from "./components/ClientAccounts";
import TeamManagers from "./components/TeamManagers";
import AllocateAcreage from "./components/AllocateAcreage";
import Registration from "./components/Register";
import ClientMonthlyReport from "./components/ClientMonthlyReport";
import ManagerMonthlyReport from "./components/ManagerMonthlyReport";
import LeadPipeline from "./components/LeadPipeline";
import AccessControl from "./components/AccessControl";
import { useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import EarlyAccessBanner from './components/EarlyAccessBanner';

function App() {
  const { user, loading, logout } = useAuth();
  const [currentPage, setCurrentPage] = useState(() => {
    return localStorage.getItem('currentPage') || 'monthly-acreages';
  });
  const [hasRedirected, setHasRedirected] = useState(false);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 1024 : false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    localStorage.setItem('currentPage', page);
    setIsSidebarOpen(false); // Close sidebar on mobile navigation
  };

  const handleLogout = () => {
    localStorage.removeItem('currentPage');
    setHasRedirected(false);
    setCurrentPage('monthly-acreages');
    setIsSidebarOpen(false); // Close sidebar on logout
    logout();
  };

  // Single unified effect for role-based redirect and page restore
  useEffect(() => {
    if (!user) {
      setHasRedirected(false);
      return;
    }

    if (hasRedirected) return;

    const savedPage = localStorage.getItem('currentPage');
    let role = (user.role || user.user_role || user.type || 'user').toLowerCase().trim();

    console.log('App.jsx - User role detected:', role);
    console.log('App.jsx - Saved page from localStorage:', savedPage);

    // After refresh — restore saved page (but check if it's appropriate for user role)
    if (savedPage) {
      // Check if user is manager and saved page is lead-pipeline
      if (role === 'manager' && savedPage === 'lead-pipeline') {
        // Manager trying to access lead-pipeline - redirect to unlock-farm instead
        console.log('Manager user trying to access lead-pipeline, redirecting to unlock-farm');
        setCurrentPage('unlock-farm');
        localStorage.setItem('currentPage', 'unlock-farm');
      } else if (role === 'client' && savedPage !== 'client-monthly-report' && savedPage !== 'unlock-farm' && savedPage !== 'register') {
        // Client trying to access other pages - redirect to client-monthly-report instead
        console.log('Client user trying to access other page, redirecting to client-monthly-report');
        setCurrentPage('client-monthly-report');
        localStorage.setItem('currentPage', 'client-monthly-report');
      } else {
        // Normal page restore - stay on the current page
        setCurrentPage(savedPage);
      }
      setHasRedirected(true);
      return;
    }

    // Fresh login — redirect based on role
    console.log('User logged in, detected role:', role);

    if (role === 'sales') {
      console.log('Redirecting to assign-acreages (sales)');
      setCurrentPage('assign-acreages');
      localStorage.setItem('currentPage', 'assign-acreages');
    } else if (role === 'client') {
      console.log('Redirecting to client-monthly-report (client)');
      setCurrentPage('client-monthly-report');
      localStorage.setItem('currentPage', 'client-monthly-report');
    } else if (role === 'manager' || role === 'test' || role === 'user') {
      console.log('Redirecting to unlock-farm (manager)');
      setCurrentPage('unlock-farm');
      localStorage.setItem('currentPage', 'unlock-farm');
    } else {
      // operation, admin, default
      console.log('Redirecting to monthly-acreages (operation/admin/default)');
      setCurrentPage('monthly-acreages');
      localStorage.setItem('currentPage', 'monthly-acreages');
    }

    setHasRedirected(true);
  }, [user, hasRedirected]);

  // Build user display object from auth context data
  const getUserDisplay = () => {
    if (!user) return null;
    const username = user.name || user.full_name || user.first_name || user.last_name || user.phone_number || user.username || 'User';
    const firstName = user.first_name || '';
    const lastName = user.last_name || '';
    const fullNameFromAPI = user.full_name || user.name || '';
    let formattedName = fullNameFromAPI;
    if (!formattedName && (firstName || lastName)) {
      formattedName = `${firstName} ${lastName}`.trim();
    }
    if (!formattedName) {
      formattedName = username;
    }
    return {
      name: formattedName,
      username: username,
      fullName: formattedName,
      role: user.role || user.user_role || user.type || 'User',
      phone_number: user.phone_number || user.phoneNumber || user.pNumber || username,
      admin_api_key: user.admin_api_key || null
    };
  };

  const userDisplay = getUserDisplay();

  const shouldShowBanner = () => {
    if (!userDisplay) return false;
    const role = (userDisplay.role || '').toLowerCase().trim();
    
    if (role === 'operation' || role === 'operations') {
      return currentPage === 'monthly-acreages' || currentPage === 'sat2farm-admin-portal';
    }
    
    if (role === 'sales') {
      return currentPage === 'assign-acreages';
    }
    
    if (role === 'manager') {
      return currentPage === 'unlock-farm';
    }
    
    return true;
  };

  const renderCurrentPage = () => {
    const getComponent = () => {
      switch (currentPage) {
        case 'unlock-farm':
          return <UnlockFarm user={userDisplay} onPageChange={handlePageChange} />;
        case 'monthly-acreages':
          return <MonthlyAcreages user={userDisplay} onPageChange={handlePageChange} />;
        case 'farm-management':
          return <FarmManagement user={userDisplay} onPageChange={handlePageChange} />;
        case 'assign-acreages':
          return <AssignAcreage user={userDisplay} onPageChange={handlePageChange} />;
        case 'sales-clients':
          return <ClientAccounts user={userDisplay} onPageChange={handlePageChange} />;
        case 'client-team':
          return <TeamManagers user={userDisplay} onPageChange={handlePageChange} />;
        case 'client-alloc':
          return <AllocateAcreage user={userDisplay} onPageChange={handlePageChange} />;
        case 'admin-operational-portal':
          return <AdminOperationalPortal user={userDisplay} onPageChange={handlePageChange} />;
        case 'sat2farm-admin-portal':
          return <MonthlyAcreages user={userDisplay} onPageChange={handlePageChange} />;
        case 'register':
          return <Registration user={userDisplay} onPageChange={handlePageChange} />;
        case 'client-monthly-report':
          return <ClientMonthlyReport user={userDisplay} onPageChange={handlePageChange} />;
        case 'manager-monthly-report':
          return <ManagerMonthlyReport user={userDisplay} onPageChange={handlePageChange} />;
        case 'lead-pipeline':
          return <LeadPipeline user={userDisplay} onPageChange={handlePageChange} />;
        default:
          return <MonthlyAcreages user={userDisplay} onPageChange={handlePageChange} />;
      }
    };

    const component = getComponent();

    return (
      <AccessControl user={userDisplay} currentPage={currentPage} onPageChange={handlePageChange}>
        {component}
      </AccessControl>
    );
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        height: '100vh',
        width: '100vw',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        color: '#94a3b8',
        fontSize: '1.125rem',
      }}>
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      width: '100vw',
      background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
      position: 'relative'
    }}>
      {/* Sidebar Backdrop Overlay on Mobile */}
      {isMobile && isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(2px)',
            zIndex: 999,
            transition: 'opacity 0.3s ease'
          }}
        />
      )}

      {/* Hamburger Button on Mobile */}
      {isMobile && (
        <button
          onClick={() => setIsSidebarOpen(true)}
          style={{
            position: 'absolute',
            top: shouldShowBanner() ? '50px' : '10px',
            left: '10px',
            zIndex: 998,
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#ffffff',
            border: '1px solid #e2e0d8',
            borderRadius: '6px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            cursor: 'pointer'
          }}
          aria-label="Open menu"
        >
          <Menu size={18} style={{ color: '#5F5E5A' }} />
        </button>
      )}

      {/* Sidebar Container */}
      <div style={
        isMobile ? {
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          width: '256px',
          zIndex: 1000,
          borderRight: '1px solid #334155',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
          transform: isSidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        } : {
          width: '256px',
          flexShrink: 0,
          borderRight: '1px solid #334155',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)'
        }
      }>
        <Sidebar onLogout={handleLogout} user={userDisplay} onPageChange={handlePageChange} currentPage={currentPage} />
      </div>
      <div style={{
        flex: 1,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {shouldShowBanner() && <EarlyAccessBanner />}
        <div style={{
          flex: 1,
          overflow: 'hidden'
        }}>
          {renderCurrentPage()}
        </div>
      </div>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 5000,
          style: {
            background: '#f0fdf4',
            color: '#166534',
            border: '1px solid #86efac',
            borderRadius: '8px',
            padding: '12px 16px',
            fontSize: '14px',
            fontWeight: '500',
          },
          success: {
            iconTheme: {
              primary: '#22c55e',
              secondary: '#ffffff',
            },
          },
        }}
      />
    </div>
  );
}

export default App;
