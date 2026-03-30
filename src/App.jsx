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
    // Use the username from the API response, fallback to phone_number if name is not available
    const username = userData.name || userData.phone_number || 'User';
    // Capitalize first letter and make the rest lowercase
    const formattedName = username.charAt(0).toUpperCase() + username.slice(1);
    
    setUser({
      name: formattedName,
      username: username,
      fullName: formattedName
    });
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
      case 'sales-acreage':
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
