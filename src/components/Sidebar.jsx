import { useState, useEffect } from 'react';
import { Home, BarChart3, TrendingUp, ClipboardList, Users, Search, Phone, Calendar, Package, FileText, HelpCircle, Puzzle, Wrench, FolderOpen, Target, MessageSquare, Mic, ChevronDown, Settings, LogOut, Lock } from 'lucide-react';
import sat2farmLogo from '../assets/satyukt.webp';

export default function Sidebar({ onLogout, user, onPageChange, currentPage }) {
  const [operationsOpen, setOperationsOpen] = useState(true);
  const [salesOpen, setSalesOpen] = useState(false);
  const [clientOpen, setClientOpen] = useState(false);
  const [satyuktCrmOpen, setSatyuktCrmOpen] = useState(false);
  const [todayTasks, setTodayTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  
  // Check user role with more flexible matching
  const userRole = user?.role?.toLowerCase().trim();
  const isOperationsUser = userRole === 'operation' || userRole === 'operations';
  const isSalesUser = userRole === 'sales';
  const isClientUser = userRole === 'client' || userRole === 'test' || userRole === 'user';
  const isManagerUser = userRole === 'manager' || userRole === 'admin';
  const isPartnerUser = userRole === 'partner';
  const isMarketingUser = userRole === 'marketing';
  const isTechDepartmentUser = userRole?.includes('tech') || userRole === 'tech department' || userRole === 'tech-department' || userRole === 'tech';

  // Helper to normalize user parameter for backend API
  const getApiUserName = (u) => {
    const name = u?.name || u?.username || u?.phone_number || 'Operation';
    if (!name || name.toLowerCase() === 'operation' || name === '8970095700' || name === 'admin') {
      return 'Operation';
    }
    return name;
  };

  // Robust Date Parser to handle YYYY-MM-DD, DD-MM-YYYY, ISO strings, etc.
  const parseDateRobust = (dateStr) => {
    if (!dateStr) return null;
    if (dateStr instanceof Date) return isNaN(dateStr.getTime()) ? null : dateStr;
    const str = String(dateStr).trim();
    if (!str || str === 'Invalid Date' || str === 'undefined' || str === 'null') return null;

    // Try DD-MM-YYYY HH:mm:ss or DD-MM-YYYY HH:mm or DD-MM-YYYY
    const dmyMatch = str.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})(?:\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?$/);
    if (dmyMatch) {
      const [, day, month, year, hours = '0', minutes = '0', seconds = '0'] = dmyMatch;
      const d = new Date(Number(year), Number(month) - 1, Number(day), Number(hours), Number(minutes), Number(seconds));
      if (!isNaN(d.getTime())) return d;
    }

    // Try YYYY-MM-DD HH:mm:ss or YYYY-MM-DD HH:mm
    const ymdMatch = str.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})(?:\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?$/);
    if (ymdMatch) {
      const [, year, month, day, hours = '0', minutes = '0', seconds = '0'] = ymdMatch;
      const d = new Date(Number(year), Number(month) - 1, Number(day), Number(hours), Number(minutes), Number(seconds));
      if (!isNaN(d.getTime())) return d;
    }

    // Try standard JS Date parsing
    let d = new Date(str.includes(' ') && !str.includes('T') ? str.replace(' ', 'T') : str);
    if (!isNaN(d.getTime())) return d;

    d = new Date(str);
    if (!isNaN(d.getTime())) return d;

    return null;
  };

  // Check if task is overdue
  const isTaskOverdue = (task) => {
    const taskDate = parseDateRobust(task.due_date);
    if (!taskDate) return false;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    taskDate.setHours(0, 0, 0, 0);
    
    // Task is overdue if due date is before today and status is still "in progress"
    const statusLower = (task.status || 'Pending').toLowerCase();
    const isInProgress = statusLower === 'in progress';
    
    return taskDate < today && isInProgress;
  };

  // Fetch today's tasks for sales users
  useEffect(() => {
    if (!isSalesUser) return;

    const fetchTodayTasks = async () => {
      try {
        setLoadingTasks(true);
        const calendarApiUrl = import.meta.env.VITE_CALENDAR_API_URL;
        const currentUserName = getApiUserName(user);
        
        const apiUrl = `${calendarApiUrl}?role=sales&user=${encodeURIComponent(currentUserName)}`;
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        if (result.success && result.data) {
          const today = new Date();
          const todaysTasks = result.data
            .filter(activity => {
              const taskDate = parseDateRobust(activity.due_date);
              return taskDate && taskDate.toDateString() === today.toDateString() && 
                     (activity.activity_type === 'task' || activity.task_name);
            })
            .sort((a, b) => {
              const dateA = parseDateRobust(a.due_date);
              const dateB = parseDateRobust(b.due_date);
              if (!dateA && !dateB) return 0;
              if (!dateA) return 1;
              if (!dateB) return -1;
              return dateA - dateB;
            });
          
          // Also count overdue tasks (tasks due before today that are still in progress)
          const overdueTasks = result.data
            .filter(activity => {
              const taskDate = parseDateRobust(activity.due_date);
              if (!taskDate) return false;
              taskDate.setHours(0, 0, 0, 0);
              const statusLower = (activity.status || 'Pending').toLowerCase();
              const isInProgress = statusLower === 'in progress';
              return taskDate < today && isInProgress && 
                     (activity.activity_type === 'task' || activity.task_name);
            });
          
          // Combine today's tasks and overdue tasks for the badge count
          setTodayTasks([...todaysTasks, ...overdueTasks]);
          
          setTodayTasks(todaysTasks);
        } else {
          setTodayTasks([]);
        }
      } catch (error) {
        console.error('Error fetching today\'s tasks:', error);
        setTodayTasks([]);
      } finally {
        setLoadingTasks(false);
      }
    };

    fetchTodayTasks();
  }, [isSalesUser, user]);
  
  // Page activity states
  const isOperationsActive = currentPage === 'operation-dashboard' || currentPage === 'operation-portal' || currentPage === 'unlock-farm' || currentPage === 'assign-acreages' || currentPage === 'monthly-acreages' || currentPage === 'register';
  const isSalesActive = currentPage === 'sales-acreage' || currentPage === 'sales-clients' || currentPage === 'assign-acreages' || currentPage === 'lead-pipeline';
  const isClientActive = currentPage === 'unlock-farm' || currentPage === 'register';
  const isManagerActive = currentPage === 'unlock-farm' || currentPage === 'register';
  const isPartnerActive = currentPage === 'super-admin-dashboard' || currentPage === 'unlock-farm' || currentPage === 'register';
  const isMarketingActive = currentPage === 'marketing-dashboard';
  const isSatyuktCrmActive = currentPage === 'lead-pipeline' || currentPage === 'opportunities' || currentPage === 'green-team' || currentPage === 'prospect-stats' || currentPage === 'task-calendar';
  
  // Handle navigation with role-based access control
  const handleNavigationClick = (page) => {
    // Check if user has access to this page
    if (isOperationsUser) {
      // Operations users can only access specific pages
      const allowedOperationsPages = ['operation-dashboard', 'monthly-acreages', 'unlock-farm', 'register', 'assign-acreages', 'lead-pipeline', 'opportunities', 'all-sales-data', 'pricing', 'green-team', 'prospect-stats', 'task-calendar'];
      if (allowedOperationsPages.includes(page)) {
        onPageChange(page);
      } else {
        alert('Access denied: Operations users cannot access this page');
      }
    } else if (isSalesUser) {
      // Sales users can only access sales pages and unlock-farm
      const allowedSalesPages = ['sales-dashboard', 'sales-acreage', 'sales-clients', 'assign-acreages', 'lead-pipeline', 'unlock-farm', 'opportunities', 'pricing', 'task-calendar'];
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
    } else if (isManagerUser) {
      // Manager users can only access specific pages
      const allowedManagerPages = ['unlock-farm', 'register', 'manager-monthly-report'];
      if (allowedManagerPages.includes(page)) {
        onPageChange(page);
      } else {
        alert('Access denied: Manager users cannot access this page');
      }
    } else if (isPartnerUser) {
      // Partner users can only access specific pages
      const allowedPartnerPages = ['super-admin-dashboard', 'unlock-farm', 'register'];
      if (allowedPartnerPages.includes(page)) {
        onPageChange(page);
      } else {
        alert('Access denied: Partner users cannot access this page');
      }
    } else if (isMarketingUser) {
      // Marketing users can only access specific pages
      const allowedMarketingPages = ['marketing-dashboard'];
      if (allowedMarketingPages.includes(page)) {
        onPageChange(page);
      } else {
        alert('Access denied: Marketing users cannot access this page');
      }
    } else if (isTechDepartmentUser) {
      // Tech Department users can only access Green Team
      const allowedTechDepartmentPages = ['green-team'];
      if (allowedTechDepartmentPages.includes(page)) {
        onPageChange(page);
      } else {
        alert('Access denied: Tech Department users can only access Green Team');
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
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.95)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '10px 0 6px',
          padding: '6px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.18), 0 0 0 2px rgba(255,255,255,0.15)'
        }}>
          <img src={sat2farmLogo} alt="Satyukt" style={{width: '100%', height: '100%', objectFit: 'contain', borderRadius: '50%'}} />
        </div>
        <div className="sb-logo-sub">ADMIN PORTAL · v2.4</div>
      </div>
      <div className="sb-role">Viewing as: <span>{
        user?.role?.toLowerCase().includes('sales') ? 'Sales' :
        user?.role?.toLowerCase().includes('client') ? 'Client' :
        user?.role?.toLowerCase().includes('manager') ? 'Manager' :
        user?.role?.toLowerCase().includes('partner') ? 'Partner' :
        user?.role?.toLowerCase().includes('marketing') ? 'Marketing' :
        user?.role?.toLowerCase().includes('tech') ? 'Tech Department' :
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
                {/* Lead Pipeline and Opportunities - Only for Operations and Sales Users */}
                {!isTechDepartmentUser && (
                  <>
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
                    <div
                      className={`sb-item ${currentPage === 'opportunities' ? 'active' : ''}`}
                      onClick={() => handleNavigationClick('opportunities')}
                    >
                      <svg className="ic" viewBox="0 0 16 16" fill="none">
                        <path d="M8 2v6M5 5l3-3 3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                        <rect x="2" y="8" width="12" height="6" rx="1" stroke="currentColor" strokeWidth="1.2" fill="none"/>
                        <path d="M5 11h6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                        <circle cx="12" cy="4" r="2" stroke="currentColor" strokeWidth="1.2"/>
                      </svg>
                      Opportunities
                    </div>
                  </>
                )}
                {/* Green Team Section - Only for Operations Users */}
                {isOperationsUser && (
                  <div
                    className={`sb-item ${currentPage === 'green-team' ? 'active' : ''}`}
                    onClick={() => handleNavigationClick('green-team')}
                  >
                    <svg className="ic" viewBox="0 0 16 16" fill="none">
                      <path d="M8 2v6M5 5l3-3 3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                      <rect x="2" y="8" width="12" height="6" rx="1" stroke="currentColor" strokeWidth="1.2" fill="none"/>
                      <path d="M5 11h6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                      <circle cx="12" cy="4" r="2" stroke="currentColor" strokeWidth="1.2"/>
                      <path d="M3 13l3-3 2 2 3-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Green Team
                  </div>
                )}
                {/* Prospect Stats - Only for Operations Users */}
                {isOperationsUser && (
                  <div
                    className={`sb-item ${currentPage === 'prospect-stats' ? 'active' : ''}`}
                    onClick={() => handleNavigationClick('prospect-stats')}
                  >
                    <svg className="ic" viewBox="0 0 16 16" fill="none">
                      <path d="M8 2v6M5 5l3-3 3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                      <rect x="2" y="8" width="12" height="6" rx="1" stroke="currentColor" strokeWidth="1.2" fill="none"/>
                      <path d="M5 11h6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                      <circle cx="12" cy="4" r="2" stroke="currentColor" strokeWidth="1.2"/>
                    </svg>
                    Prospect Stats
                  </div>
                )}
                {/* Task Calendar - For Operations and Sales Users */}
                <div
                  className={`sb-item ${currentPage === 'task-calendar' ? 'active' : ''}`}
                  onClick={() => handleNavigationClick('task-calendar')}
                  style={{ position: 'relative' }}
                >
                  <svg className="ic" viewBox="0 0 16 16" fill="none">
                    <rect x="2" y="3" width="12" height="10" rx="1" stroke="currentColor" strokeWidth="1.2" fill="none"/>
                    <path d="M2 6h12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                    <path d="M5 2v2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                    <path d="M11 2v2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                    <circle cx="5" cy="9" r="1" fill="currentColor"/>
                    <circle cx="8" cy="9" r="1" fill="currentColor"/>
                    <circle cx="11" cy="9" r="1" fill="currentColor"/>
                  </svg>
                  Task Calendar
                  {isSalesUser && todayTasks.length > 0 && (
                    <span style={{
                      position: 'absolute',
                      right: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: '#ef4444',
                      color: 'white',
                      fontSize: '10px',
                      fontWeight: '600',
                      minWidth: '18px',
                      height: '18px',
                      borderRadius: '9px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '0 6px',
                      boxShadow: '0 2px 4px rgba(239, 68, 68, 0.3)'
                    }}>
                      {todayTasks.length}
                    </span>
                  )}
                </div>
              </div>
            )}
          </>
        )}
        {/* Operations Section - Only for Operations Users (not Tech Department) */}
        {isOperationsUser && !isTechDepartmentUser && (
          <>
            <div className="sb-section">Operations</div>
            <div 
              className={`sb-item ${currentPage === 'operation-dashboard' ? 'active' : ''}`}
              onClick={() => handleNavigationClick('operation-dashboard')}
            >
              <svg className="ic" viewBox="0 0 16 16" fill="none">
                <rect x="2" y="3" width="12" height="10" rx="1" stroke="currentColor" strokeWidth="1.2" fill="none"/>
                <path d="M5 6h6M5 8h4M5 10h2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
              Dashboard
              <span className="sb-dot"></span>
            </div>
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
              Farms
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
            <div
              className={`sb-item ${currentPage === 'pricing' ? 'active' : ''}`}
              onClick={() => handleNavigationClick('pricing')}
            >
              <svg className="ic" viewBox="0 0 16 16" fill="none">
                <path d="M8 2v6M5 5l3-3 3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                <rect x="2" y="8" width="12" height="6" rx="1" stroke="currentColor" strokeWidth="1.2" fill="none"/>
                <path d="M5 11h6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
              Pricing
              <span className="sb-dot"></span>
            </div>
          </>
        )}

        {/* Tech Department Section - Only for Tech Department Users */}
        {isTechDepartmentUser && (
          <>
            <div className="sb-section">Tech Department</div>
            <div
              className={`sb-item ${currentPage === 'green-team' ? 'active' : ''}`}
              onClick={() => handleNavigationClick('green-team')}
            >
              <svg className="ic" viewBox="0 0 16 16" fill="none">
                <path d="M8 2v6M5 5l3-3 3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                <rect x="2" y="8" width="12" height="6" rx="1" stroke="currentColor" strokeWidth="1.2" fill="none"/>
                <path d="M5 11h6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                <circle cx="12" cy="4" r="2" stroke="currentColor" strokeWidth="1.2"/>
                <path d="M3 13l3-3 2 2 3-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Green Team
              <span className="sb-dot"></span>
            </div>
          </>
        )}

        {/* CRM Section - Only for Sales Users */}
        {isSalesUser && (
          <>
            <div className="sb-section">CRM</div>

            <div
              className={`sb-item ${currentPage === 'sales-dashboard' ? 'active' : ''}`}
              onClick={() => handleNavigationClick('sales-dashboard')}
            >
              <svg className="ic" viewBox="0 0 16 16" fill="none">
                <rect x="2" y="3" width="12" height="10" rx="1" stroke="currentColor" strokeWidth="1.2" fill="none"/>
                <path d="M5 6h6M5 8h4M5 10h2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
              Dashboard
              <span className="sb-dot"></span>
            </div>

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
              Farms
              <span className="sb-dot"></span>
            </div>
            <div
              className={`sb-item ${currentPage === 'pricing' ? 'active' : ''}`}
              onClick={() => handleNavigationClick('pricing')}
            >
              <svg className="ic" viewBox="0 0 16 16" fill="none">
                <path d="M8 2v6M5 5l3-3 3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                <rect x="2" y="8" width="12" height="6" rx="1" stroke="currentColor" strokeWidth="1.2" fill="none"/>
                <path d="M5 11h6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
              Pricing
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
              Farms
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

        {/* Manager Section - Only for Manager Users */}
        {isManagerUser && (
          <>
            <div className="sb-section">Manager</div>
            <div 
              className={`sb-item ${currentPage === 'manager-monthly-report' ? 'active' : ''}`}
              onClick={() => handleNavigationClick('manager-monthly-report')}
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
              Farms
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

        {/* Partner Section - Only for Partner Users */}
        {isPartnerUser && (
          <>
            <div className="sb-section">Partner</div>
            <div 
              className={`sb-item ${currentPage === 'super-admin-dashboard' ? 'active' : ''}`}
              onClick={() => handleNavigationClick('super-admin-dashboard')}
            >
              <svg className="ic" viewBox="0 0 16 16" fill="none">
                <rect x="2" y="2" width="12" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.2" fill="none"/>
                <path d="M5 6h6M5 8h6M5 10h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
              Dashboard
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
              Farms
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

        {/* Marketing Section - Only for Marketing Users */}
        {isMarketingUser && (
          <>
            <div className="sb-section">Marketing</div>
            <div 
              className={`sb-item ${currentPage === 'marketing-dashboard' ? 'active' : ''}`}
              onClick={() => handleNavigationClick('marketing-dashboard')}
            >
              <svg className="ic" viewBox="0 0 16 16" fill="none">
                <rect x="2" y="2" width="12" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.2" fill="none"/>
                <path d="M5 6h6M5 8h6M5 10h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
              Dashboard
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
