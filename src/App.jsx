import { useState } from 'react';
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";


import Operation from "./components/operation";
import UnlockFarm from "./components/UnlockFarm";
import AddAcreages from "./components/AddAcreages";
import Login from "./components/Login";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('dashboard');

  const handleLogin = (userData) => {
    // Use the username directly from the form
    const username = userData.name;
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
      case 'dashboard':
        return <Dashboard user={user} />;
      case 'operation-portal':
        return <Operation user={user} />;
      case 'unlock-farm':
        return <UnlockFarm user={user} />;
      case 'add-acreages':
        return <AddAcreages user={user} />;
      default:
        return <Dashboard user={user} />;
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
