import { useState } from 'react';
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

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('monthly-acreages');

  const handleLogin = (userData) => {
    console.log('Login response:', userData);
    
    // Extract user info from response
    const username = userData.phone_number || userData.username || '';
    
    // Format the name properly from API response
    const firstName = userData.first_name || '';
    const lastName = userData.last_name || '';
    const fullNameFromAPI = userData.full_name || '';
    
    // Use full_name if available, otherwise combine first and last names
    let formattedName = fullNameFromAPI;
    if (!formattedName && (firstName || lastName)) {
      formattedName = `${firstName} ${lastName}`.trim();
    }
    if (!formattedName) {
      formattedName = username;
    }
    
    // Get role from API response - check multiple possible field names and values
    let role = userData.role || userData.user_role || userData.type || 'User';
    role = role.toLowerCase().trim();
    console.log('Detected role:', role);
    
    setUser({
      name: formattedName,
      username: username,
      fullName: formattedName,
      role: role
    });
    
    // Redirect based on role - sales users go to sales page, client users go to client page, others go to ops
    if (role === 'sales') {
      console.log('Redirecting to assign-acreages (sales)');
      setCurrentPage('assign-acreages');
    } else if (role === 'client' || role === 'test' || role === 'user') {
      console.log('Redirecting to client-team (client/test user)');
      setCurrentPage('client-team');
    } else {
      console.log('Redirecting to monthly-acreages (default/ops)');
      setCurrentPage('monthly-acreages');
    }
    
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const renderCurrentPage = () => {
    switch(currentPage) {
      case 'unlock-farm':
        return <UnlockFarm user={user} onPageChange={handlePageChange} />;
      case 'add-acreages':
        return <AddAcreages user={user} onPageChange={handlePageChange} />;
      case 'monthly-acreages':
        return <MonthlyAcreages user={user} onPageChange={handlePageChange} />;
      case 'farm-management':
        return <FarmManagement user={user} onPageChange={handlePageChange} />;
      
      case 'assign-acreages':
        return <AssignAcreage user={user} onPageChange={handlePageChange} />;
      case 'sales-clients':
        return <ClientAccounts user={user} onPageChange={handlePageChange} />;
      case 'client-team':
        return <TeamManagers user={user} onPageChange={handlePageChange} />;
      case 'client-alloc':
        return <AllocateAcreage user={user} onPageChange={handlePageChange} />;
      case 'admin-operational-portal':
        return <AdminOperationalPortal user={user} onPageChange={handlePageChange} />;
      case 'sat2farm-admin-portal':
        return <MonthlyAcreages user={user} onPageChange={handlePageChange} />;
      case 'register':
        return <Registration user={user} onPageChange={handlePageChange} />;
      default:
        return <MonthlyAcreages user={user} onPageChange={handlePageChange} />;
    }
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
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
        <Sidebar onLogout={handleLogout} user={user} onPageChange={handlePageChange} currentPage={currentPage} />
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
