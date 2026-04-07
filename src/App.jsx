import { useState, useEffect } from 'react';
import Sidebar from "./components/Sidebar";
import UnlockFarm from "./components/UnlockFarm";
import AddAcreages from "./components/AddAcreages";
import Login from "./components/Login";
import AdminOperationalPortal from "./components/AdminOperationalPortal";
import MonthlyAcreages from "./components/MonthlyAcreages";
import FarmManagement from "./components/FarmManagement";
import AssignAcreage from "./components/AssignAcreage";
import ClientAccounts from "./components/ClientAccounts";
import TeamManagers from "./components/TeamManagers";
import AllocateAcreage from "./components/AllocateAcreage";
import Registration from "./components/Register";
import AccessControl from "./components/AccessControl";
import { useAuth } from './context/AuthContext';

function App() {
  const { user, loading, logout } = useAuth();
  const [currentPage, setCurrentPage] = useState('monthly-acreages');
  const [hasRedirected, setHasRedirected] = useState(false);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Handle role-based redirect after login
  useEffect(() => {
    if (user && !hasRedirected) {
      // Get role from user data
      let role = user.role || user.user_role || user.type || 'User';
      role = role.toLowerCase().trim();
      
      console.log('User logged in, detected role:', role);
      
      // Redirect based on role
      if (role === 'sales') {
        console.log('Redirecting to assign-acreages (sales - with access)');
        setCurrentPage('assign-acreages');
      } else if (role === 'client' || role === 'test' || role === 'user') {
        console.log('Redirecting to client-team (client/test user)');
        setCurrentPage('client-team');
      } else {
        console.log('Redirecting to monthly-acreages (default/ops)');
        setCurrentPage('monthly-acreages');
      }
      
      setHasRedirected(true);
    }
  }, [user, hasRedirected]);

  // Reset redirect flag when user logs out
  useEffect(() => {
    if (!user) {
      setHasRedirected(false);
      setCurrentPage('monthly-acreages');
    }
  }, [user]);

  // Build user display object from auth context data
  const getUserDisplay = () => {
    if (!user) return null;
    // Prioritize name from API response over phone number
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
      role: user.role || user.user_role || user.type || 'User'
    };
  };

  const userDisplay = getUserDisplay();

  const renderCurrentPage = () => {
    const getComponent = () => {
      switch(currentPage) {
        case 'unlock-farm':
          return <UnlockFarm user={userDisplay} onPageChange={handlePageChange} />;
        case 'add-acreages':
          return <AddAcreages user={userDisplay} onPageChange={handlePageChange} />;
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
        default:
          return <MonthlyAcreages user={userDisplay} onPageChange={handlePageChange} />;
      }
    };

    const component = getComponent();
    
    // Wrap with AccessControl to handle restrictions
    return (
      <AccessControl user={userDisplay} currentPage={currentPage} onPageChange={handlePageChange}>
        {component}
      </AccessControl>
    );
  };

  // Show loading spinner while checking stored session
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
      background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
    }}>
      <div style={{ 
        width: '256px', 
        flexShrink: 0,
        borderRight: '1px solid #334155',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)'
      }}>
        <Sidebar onLogout={logout} user={userDisplay} onPageChange={handlePageChange} currentPage={currentPage} />
      </div>
      <div style={{ 
        flex: 1,
        overflow: 'hidden'
      }}>
        {renderCurrentPage()}
      </div>
    </div>
  );
}

export default App;