import { useState } from 'react';
import { Home, BarChart3, TrendingUp, ClipboardList, Users, Search, Phone, Calendar, Package, FileText, HelpCircle, Puzzle, Wrench, FolderOpen, Target, MessageSquare, Mic, ChevronDown, Settings, LogOut, Lock } from 'lucide-react';
import sat2farmLogo from '../assets/satyukt.webp';

export default function Sidebar({ onLogout, user, onPageChange, currentPage }) {
  const [operationsOpen, setOperationsOpen] = useState(true);
  const [salesOpen, setSalesOpen] = useState(false);
  const [clientOpen, setClientOpen] = useState(false);
  const [satyuktCrmOpen, setSatyuktCrmOpen] = useState(false);
  
  // Debug: Log user data and role detection
  console.log('Sidebar - User data:', user);
  console.log('Sidebar - User role (raw):', user?.role);
  console.log('Sidebar - User role (lowercase):', user?.role?.toLowerCase());
  console.log('Sidebar - Checking operations ===:', 'operations', user?.role === 'operations');
  console.log('Sidebar - Checking Operations ===:', 'Operations', user?.role === 'Operations');
  console.log('Sidebar - Checking sales ===:', 'sales', user?.role === 'sales');
  console.log('Sidebar - Checking Sales ===:', 'Sales', user?.role === 'Sales');
  
  // Check user role with more flexible matching
  const userRole = user?.role?.toLowerCase().trim();
  const isOperationsUser = userRole === 'operation' || userRole === 'operations';
  const isSalesUser = userRole === 'sales';
  const isClientUser = userRole === 'client' || userRole === 'test' || userRole === 'user';
  
  // Debug: Log what should be visible
  console.log('Sidebar - User data:', user);
  console.log('Sidebar - User role (raw):', user?.role);
  console.log('Sidebar - User role (lowercase):', userRole);
  console.log('Sidebar - Checking client ===:', 'client', userRole === 'client');
  console.log('Sidebar - Checking test ===:', 'test', userRole === 'test');
  console.log('Sidebar - Checking user ===:', 'user', userRole === 'user');
  console.log('Sidebar - Processed role:', userRole);
  console.log('Sidebar - Should show operations section:', isOperationsUser);
  console.log('Sidebar - Should show sales section:', isSalesUser);
  console.log('Sidebar - Should show client section:', isClientUser);
  
  // Page activity states
  const isOperationsActive = currentPage === 'operation-portal' || currentPage === 'unlock-farm' || currentPage === 'assign-acreages' || currentPage === 'monthly-acreages' || currentPage === 'register';
  const isSalesActive = currentPage === 'sales-acreage' || currentPage === 'sales-clients' || currentPage === 'assign-acreages' || currentPage === 'lead-pipeline';
  const isClientActive = currentPage === 'unlock-farm' || currentPage === 'register';
  
  // Handle navigation with role-based access control
  const handleNavigationClick = (page) => {
    // Check if user has access to this page
    if (isOperationsUser) {
      // Operations users can only access specific pages
      const allowedOperationsPages = ['monthly-acreages', 'unlock-farm', 'register', 'assign-acreages', 'lead-pipeline'];
      if (allowedOperationsPages.includes(page)) {
        onPageChange(page);
      } else {
        alert('Access denied: Operations users cannot access this page');
      }
    } else if (isSalesUser) {
      // Sales users can only access sales pages and unlock-farm
      const allowedSalesPages = ['sales-acreage', 'sales-clients', 'assign-acreages', 'lead-pipeline', 'unlock-farm'];
      if (allowedSalesPages.includes(page)) {
        onPageChange(page);
      } else {
        alert('Access denied: Sales users cannot access this page');
      }
    } else if (isClientUser) {
      // Client users can only access specific pages
      const allowedClientPages = ['client-monthly-report', 'unlock-farm', 'register'];
      if (allowedClientPages.includes(page)) {
        onPageChange(page);
      } else {
        alert('Access denied: Client users cannot access this page');
      }
    } else {
      // Default fallback
      onPageChange(page);
    }
  };

  return (
    <div className="h-full flex flex-col shadow-xl" style={{backgroundColor: '#0f2010'}}>
      
      {/* Header */}
      <div className="sb-logo">
        <div className="sb-logo-text">SATYUKT</div>
        <img src={sat2farmLogo} alt="Satyukt" style={{width: '100px', height: 'auto', margin: '8px 0'}} />
        <div className="sb-logo-sub">ADMIN PORTAL · v2.4</div>
      </div>
      <div className="sb-role">Viewing as: <span>{
        user?.role === 'sales' || user?.role === 'Sales' ? 'Sales' : 
        user?.role === 'client' || user?.role === 'Client' ? 'Client' : 
        'Operations'
      }</span></div>
      
      {/* Navigation */}
      <div className="sb-nav">
        {/* Satyukt CRM Section - Only for Operations and Sales Users */}
        {(isOperationsUser || isSalesUser) && (
          <>
            <div 
              className="sb-section"
              onClick={() => setSatyuktCrmOpen(!satyuktCrmOpen)}
              style={{cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}
            >
              Satyukt CRM
              <ChevronDown 
                size={16} 
                style={{transform: satyuktCrmOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s'}}
              />
            </div>
            
            {satyuktCrmOpen && (
              <div style={{marginLeft: '12px'}}>
                <div 
                  className={`sb-item ${currentPage === 'lead-pipeline' ? 'active' : ''}`}
                  onClick={() => handleNavigationClick('lead-pipeline')}
                >
                  <svg className="ic" viewBox="0 0 16 16" fill="none">
                    <path d="M8 2v6M5 5l3-3 3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                    <rect x="2" y="8" width="12" height="6" rx="1" stroke="currentColor" strokeWidth="1.2" fill="none"/>
                    <path d="M5 11h6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                  </svg>
                  Lead Pipeline
                </div>
              </div>
            )}
          </>
        )}
        {/* Operations Section - Only for Operations Users */}
        {isOperationsUser && (
          <>
            <div className="sb-section">Operations</div>
            <div 
              className={`sb-item ${currentPage === 'monthly-acreages' ? 'active' : ''}`}
              onClick={() => handleNavigationClick('monthly-acreages')}
            >
              <svg className="ic" viewBox="0 0 16 16" fill="none">
                <rect x="2" y="2" width="5" height="5" rx="1" fill="currentColor"/>
                <rect x="9" y="2" width="5" height="5" rx="1" fill="currentColor" opacity="0.5"/>
                <rect x="2" y="9" width="5" height="5" rx="1" fill="currentColor" opacity="0.5"/>
                <rect x="9" y="9" width="5" height="5" rx="1" fill="currentColor" opacity="0.5"/>
              </svg>
              Monthly Acreage
              <span className="sb-dot"></span>
            </div>
            <div 
              className={`sb-item ${currentPage === 'unlock-farm' ? 'active' : ''}`}
              onClick={() => handleNavigationClick('unlock-farm')}
            >
              <svg className="ic" viewBox="0 0 16 16" fill="none">
                <rect x="4" y="7" width="8" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.2" fill="none"/>
                <path d="M5.5 7V5a2.5 2.5 0 015 0" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.6"/>
              </svg>
              Unlock Farms
              <span className="sb-dot"></span>
            </div>
            <div 
              className={`sb-item ${currentPage === 'register' ? 'active' : ''}`}
              onClick={() => handleNavigationClick('register')}
            >
              <svg className="ic" viewBox="0 0 16 16" fill="none">
                <path d="M8 2v6M5 5l3-3 3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                <rect x="2" y="8" width="12" height="6" rx="1" stroke="currentColor" strokeWidth="1.2" fill="none"/>
                <path d="M5 11h6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
              New Registration
              <span className="sb-dot"></span>
            </div>
            <div 
              className={`sb-item ${currentPage === 'assign-acreages' ? 'active' : ''}`}
              onClick={() => handleNavigationClick('assign-acreages')}
            >
              <svg className="ic" viewBox="0 0 16 16" fill="none">
                <path d="M2 12l4-5 3 3 2-4 3 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Assign Acreages
              <span className="sb-dot"></span>
            </div>
          </>
        )}

        {/* CRM Section - Only for Sales Users */}
        {isSalesUser && (
          <>
            <div className="sb-section">CRM</div>
            
            <div 
              className={`sb-item ${currentPage === 'assign-acreages' ? 'active' : ''}`}
              onClick={() => handleNavigationClick('assign-acreages')}
            >
              <svg className="ic" viewBox="0 0 16 16" fill="none">
                <path d="M2 12l4-5 3 3 2-4 3 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Assign Acreage
            </div>
            
            <div 
              className={`sb-item ${currentPage === 'unlock-farm' ? 'active' : ''}`}
              onClick={() => handleNavigationClick('unlock-farm')}
            >
              <svg className="ic" viewBox="0 0 16 16" fill="none">
                <rect x="4" y="7" width="8" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.2" fill="none"/>
                <path d="M5.5 7V5a2.5 2.5 0 015 0" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.6"/>
              </svg>
              Unlock Farms
              <span className="sb-dot"></span>
            </div>
          </>
        )}

        {/* Client Section - Only for Client Users */}
        {isClientUser && (
          <>
            <div className="sb-section">Client</div>
            <div 
              className={`sb-item ${currentPage === 'client-monthly-report' ? 'active' : ''}`}
              onClick={() => handleNavigationClick('client-monthly-report')}
            >
              <svg className="ic" viewBox="0 0 16 16" fill="none">
                <rect x="2" y="2" width="12" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.2" fill="none"/>
                <path d="M5 6h6M5 8h6M5 10h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
              Monthly Report
              <span className="sb-dot"></span>
            </div>
            <div 
              className={`sb-item ${currentPage === 'unlock-farm' ? 'active' : ''}`}
              onClick={() => handleNavigationClick('unlock-farm')}
            >
              <svg className="ic" viewBox="0 0 16 16" fill="none">
                <rect x="4" y="7" width="8" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.2" fill="none"/>
                <path d="M5.5 7V5a2.5 2.5 0 015 0" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.6"/>
              </svg>
              Unlock Farms
              <span className="sb-dot"></span>
            </div>
            <div 
              className={`sb-item ${currentPage === 'register' ? 'active' : ''}`}
              onClick={() => handleNavigationClick('register')}
            >
              <svg className="ic" viewBox="0 0 16 16" fill="none">
                <path d="M8 2v6M5 5l3-3 3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                <rect x="2" y="8" width="12" height="6" rx="1" stroke="currentColor" strokeWidth="1.2" fill="none"/>
                <path d="M5 11h6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
              New Registration
              <span className="sb-dot"></span>
            </div>
          </>
        )}
      </div>
      
      {/* Footer */}
      <div className="sb-bottom">
        <div className="sb-user">
          <div className="sb-avatar">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</div>
          <div>
            <div className="sb-uname">{user?.name || 'Unknown User'}</div>
            <div style={{fontSize: '9px', color: 'rgba(255,255,255,0.25)'}}>{user?.role || 'User'}</div>
          </div>
        </div>
        <button 
          className="sb-item" 
          onClick={onLogout}
          style={{marginTop: '12px', color: '#ef4444', justifyContent: 'center'}}
        >
          <svg className="ic" viewBox="0 0 16 16" fill="none" style={{marginRight: '8px'}}>
            <path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            <path d="M11 5l3 3-3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M14 8H6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
          Logout
        </button>
      </div>
    </div>
  );
}
