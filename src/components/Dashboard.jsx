import Card from "./Card";
import { Search, Plus, Bell, Calendar, Settings, Grid3x3, RefreshCw, MoreVertical, Building, Users, Phone, Target, Menu, X, Home, BarChart3, TrendingUp, ClipboardList, ChevronDown, User } from 'lucide-react';

export default function Dashboard({ user }) {
  return (
    <div style={{ 
      flex: 1, 
      background: 'linear-gradient(135deg, #f8fafc 0%, #dbeafe 50%, #e0e7ff 100%)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* Top Header */}
      <header style={{
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(226, 232, 240, 0.5)',
        padding: '16px 24px',
        flexShrink: 0,
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <h1 style={{ fontSize: '20px', fontWeight: '600', color: '#1f2937', margin: 0 }}>
              Welcome back, {user?.name || 'User'}! 👋
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', fontSize: '14px', color: '#6b7280' }}>
              
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Search Bar */}
            <div style={{ position: 'relative' }}>
              <Search style={{ position: 'absolute', left: '12px', top: '12px', width: '16px', height: '16px', color: '#9ca3af' }} />
              <input
                type="text"
                placeholder="Search records"
                style={{
                  width: '256px',
                  backgroundColor: 'white',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  padding: '8px 16px 8px 40px',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>
            
            {/* Icons */}
            <button style={{
              padding: '8px',
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              position: 'relative'
            }} onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'} 
                 onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}>
              <Bell style={{ width: '16px', height: '16px', color: '#4b5563' }} />
              <span style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                width: '8px',
                height: '8px',
                backgroundColor: '#ef4444',
                borderRadius: '50%'
              }}></span>
            </button>
            <button style={{
              padding: '8px',
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }} onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'} 
                 onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}>
              <User style={{ width: '16px', height: '16px', color: '#4b5563' }} />
            </button>
            <button style={{
              padding: '8px',
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }} onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'} 
                 onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}>
              <Settings style={{ width: '16px', height: '16px', color: '#4b5563' }} />
            </button>
            <button style={{
              padding: '8px',
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }} onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'} 
                 onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}>
              <Grid3x3 style={{ width: '16px', height: '16px', color: '#4b5563' }} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content - Full Page */}
      <main style={{
        flex: 1,
        overflowY: 'auto',
        padding: '32px',
        minHeight: 'calc(100vh - 80px)'
      }}>
        <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
          {/* Innovative Welcome Section */}
          <div style={{ 
            textAlign: 'center', 
            marginBottom: '60px',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              top: '-30px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '120px',
              height: '120px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              borderRadius: '50%',
              opacity: 0.08,
              animation: 'pulse 4s infinite'
            }}></div>
            <h1 style={{
              fontSize: '56px',
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: '16px',
              position: 'relative',
              zIndex: 1,
              letterSpacing: '-1px'
            }}>Dashboard Home</h1>
            <p style={{ 
              color: '#6b7280', 
              fontSize: '22px', 
              marginBottom: '32px',
              fontWeight: '300',
              letterSpacing: '0.5px'
            }}>Welcome to you Dashboard</p>
          </div>

          {/* Horizontal Cards Section */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'row', 
            gap: '20px', 
            marginBottom: '40px',
            justifyContent: 'center',
            flexWrap: 'nowrap',
            overflowX: 'auto'
          }}>
            
              
           

            
          </div>
        </div>
      </main>
    </div>
  );
}
