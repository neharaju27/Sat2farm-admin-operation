import { useState } from 'react';
import { Home, BarChart3, TrendingUp, ClipboardList, Users, Search, Phone, Calendar, Package, FileText, HelpCircle, Puzzle, Wrench, FolderOpen, Target, MessageSquare, Mic, ChevronDown, Settings, LogOut } from 'lucide-react';
import sat2farmLogo from '../assets/logo.png';

export default function Sidebar({ onLogout, user, onPageChange, currentPage }) {
  const [operationsOpen, setOperationsOpen] = useState(true);
  const [salesOpen, setSalesOpen] = useState(false);
  const [clientOpen, setClientOpen] = useState(false);
  const isOperationsActive = currentPage === 'operation-portal' || currentPage === 'unlock-farm' || currentPage === 'add-acreages' || currentPage === 'monthly-acreages' || currentPage === 'farm-management';
  const isSalesActive = currentPage === 'sales-acreage' || currentPage === 'sales-clients';
  const isClientActive = currentPage === 'client-team' || currentPage === 'client-alloc';

  return (
    <div className="h-full flex flex-col shadow-xl" style={{backgroundColor: '#0f2010'}}>
      
      {/* Header */}
      <div className="sb-logo">
        <div className="sb-logo-text">sat2farm business</div>
        <div className="sb-logo-sub">ADMIN PORTAL · v2.4</div>
      </div>
      <div className="sb-role">Viewing as: <span>Operations</span></div>
      
      {/* Navigation */}
      <div className="sb-nav">
        <div className="sb-section">Operations</div>
        <div 
          className={`sb-item ${currentPage === 'monthly-acreages' ? 'active' : ''}`}
          onClick={() => onPageChange('monthly-acreages')}
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
          className={`sb-item ${currentPage === 'farm-management' ? 'active' : ''}`}
          onClick={() => onPageChange('farm-management')}
        >
          <svg className="ic" viewBox="0 0 16 16" fill="none">
            <path d="M2 14V7L8 2l6 5v7H2z" stroke="currentColor" strokeWidth="1.2" fill="none"/>
            <rect x="6" y="9" width="4" height="5" rx="0.5" fill="currentColor" opacity="0.5"/>
          </svg>
          Farm Management
        </div>
        <div 
          className={`sb-item ${currentPage === 'unlock-farm' ? 'active' : ''}`}
          onClick={() => onPageChange('unlock-farm')}
        >
          <svg className="ic" viewBox="0 0 16 16" fill="none">
            <rect x="4" y="7" width="8" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.2" fill="none"/>
            <path d="M5.5 7V5a2.5 2.5 0 015 0" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.6"/>
          </svg>
          Unlock Farms
        </div>
        <div 
          className={`sb-item ${currentPage === 'register' ? 'active' : ''}`}
          onClick={() => onPageChange('register')}
        >
          <svg className="ic" viewBox="0 0 16 16" fill="none">
            <path d="M8 2v6M5 5l3-3 3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            <rect x="2" y="8" width="12" height="6" rx="1" stroke="currentColor" strokeWidth="1.2" fill="none"/>
            <path d="M5 11h6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
          New Registration
        </div>
        
        <div className="sb-section">CRM</div>
        <div 
          className={`sb-item ${currentPage === 'sales-acreage' ? 'active' : ''}`}
          onClick={() => onPageChange('sales-acreage')}
        >
          <svg className="ic" viewBox="0 0 16 16" fill="none">
            <path d="M2 12l4-5 3 3 2-4 3 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Assign Acreage
        </div>
        <div 
          className={`sb-item ${currentPage === 'sales-clients' ? 'active' : ''}`}
          onClick={() => onPageChange('sales-clients')}
        >
          <svg className="ic" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.2" fill="none"/>
            <path d="M2 14c0-3 2.7-5 6-5s6 2 6 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.6"/>
          </svg>
          Client Accounts
        </div>
        
        <div className="sb-section">Client</div>
        <div 
          className={`sb-item ${currentPage === 'client-team' ? 'active' : ''}`}
          onClick={() => onPageChange('client-team')}
        >
          <svg className="ic" viewBox="0 0 16 16" fill="none">
            <circle cx="5.5" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.2" fill="none"/>
            <circle cx="11" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.2" fill="none" opacity="0.5"/>
            <path d="M1 13c0-2.5 2-4 4.5-4s4.5 1.5 4.5 4" stroke="currentColor" strokeWidth="1.2" fill="none"/>
          </svg>
          Team & Managers
        </div>
        <div 
          className={`sb-item ${currentPage === 'client-alloc' ? 'active' : ''}`}
          onClick={() => onPageChange('client-alloc')}
        >
          <svg className="ic" viewBox="0 0 16 16" fill="none">
            <rect x="2" y="2" width="12" height="3" rx="1" fill="currentColor" opacity="0.3"/>
            <rect x="2" y="7" width="8" height="3" rx="1" fill="currentColor" opacity="0.6"/>
            <rect x="2" y="12" width="5" height="3" rx="1" fill="currentColor"/>
          </svg>
          Allocate Acreage
        </div>
      </div>
      
      {/* Footer */}
      <div className="sb-bottom">
        <div className="sb-user">
          <div className="sb-avatar">AK</div>
          <div>
            <div className="sb-uname">Anand Kumar</div>
            <div style={{fontSize: '9px', color: 'rgba(255,255,255,0.25)'}}>Super Admin</div>
          </div>
        </div>
      </div>
    </div>
  );
}
