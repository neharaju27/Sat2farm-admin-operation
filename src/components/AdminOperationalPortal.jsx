import { useState } from 'react';
import { Search, Plus, Bell, Calendar, Settings, Grid3x3, RefreshCw, MoreVertical, Building, Users, Phone, Target, Menu, X, Home, BarChart3, TrendingUp, ClipboardList, ChevronDown, User, Download, Lock, Unlock, CreditCard, Clock, CheckCircle, XCircle, AlertCircle, Activity, DollarSign, ShoppingCart, Package, ArrowUpRight, ArrowDownRight, Filter, FileText, Mail, MapPin, Star, Eye, Edit, Trash2 } from 'lucide-react';

export default function AdminOperationalPortal({ user, onPageChange }) {
  const [selectedPeriod, setSelectedPeriod] = useState('This Month');
  // Set currentRole based on actual user role
  const [currentRole, setCurrentRole] = useState(() => {
    const userRole = user?.role || user?.user_role || user?.type || 'ops';
    return userRole.toLowerCase();
  });

  const handleRoleSwitch = (role) => {
    setCurrentRole(role);
    if (role === 'ops') {
      onPageChange('monthly-acreages');
    } else if (role === 'sales') {
      onPageChange('sales-acreage');
    } else if (role === 'client') {
      onPageChange('client-team');
    } else if (role === 'partner') {
      onPageChange('client-team');
    }
  };
  
  return (
    <div style={{ 
      flex: 1, 
      backgroundColor: '#f8f7f4',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'auto'
    }}>
      {/* Top Header */}
      <header style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid var(--border)',
        padding: '0 24px',
        height: '52px',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <h1 style={{ 
              fontSize: '28px', 
              fontWeight: '600', 
              color: '#111827', 
              margin: 0,
              letterSpacing: '-0.5px',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            }}>
              Admin Operational Portal
            </h1>
          </div>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '16px',
            fontSize: '14px', 
            color: '#6b7280', 
            fontWeight: '500'
          }}>
            {/* Role Switcher */}
            <div className="role-switcher" style={{display: 'flex', alignItems: 'center', gap: '4px'}}>
              <span style={{fontSize: '10px', color: 'var(--text-3)', marginRight: '2px'}}>Role:</span>
              <button className={`role-btn ${currentRole === 'ops' ? 'active' : ''}`} onClick={() => handleRoleSwitch('ops')}>Ops</button>
              <button className={`role-btn ${currentRole === 'sales' ? 'active' : ''}`} onClick={() => handleRoleSwitch('sales')}>Sales</button>
              <button className={`role-btn ${currentRole === 'partner' ? 'active' : ''}`} onClick={() => handleRoleSwitch('partner')}>Partner</button>
              <button className={`role-btn ${currentRole === 'client' ? 'active' : ''}`} onClick={() => handleRoleSwitch('client')}>Client</button>
            </div>
            <div style={{
              padding: '8px 12px',
              borderRadius: '999px',
              backgroundColor: '#f3f4f6',
              color: '#6b7280',
              fontWeight: '500',
              fontSize: '12px'
            }}>
              Dashboard Overview
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px',
        minHeight: 'calc(100vh - 80px)'
      }}>
        <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
          {/* Stats Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px',
            marginBottom: '24px'
          }}>
            {/* Total Revenue Card */}
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '24px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: '0',
                right: '0',
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                opacity: '0.1',
                borderRadius: '0 0 0 80px'
              }}></div>
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '12px'
                }}>
                  <div style={{
                    padding: '8px',
                    backgroundColor: '#d1fae5',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <DollarSign style={{ width: '20px', height: '20px', color: '#10b981' }} />
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '12px',
                    color: '#10b981',
                    fontWeight: '500'
                  }}>
                    <ArrowUpRight style={{ width: '16px', height: '16px' }} />
                    +12.5%
                  </div>
                </div>
                <h3 style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: '#111827',
                  margin: '0 0 4px 0'
                }}>
                  $45,231
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  margin: 0
                }}>
                  Total Revenue
                </p>
              </div>
            </div>

            {/* Total Orders Card */}
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '24px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: '0',
                right: '0',
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                opacity: '0.1',
                borderRadius: '0 0 0 80px'
              }}></div>
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '12px'
                }}>
                  <div style={{
                    padding: '8px',
                    backgroundColor: '#dbeafe',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <ShoppingCart style={{ width: '20px', height: '20px', color: '#3b82f6' }} />
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '12px',
                    color: '#3b82f6',
                    fontWeight: '500'
                  }}>
                    <ArrowUpRight style={{ width: '16px', height: '16px' }} />
                    +8.2%
                  </div>
                </div>
                <h3 style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: '#111827',
                  margin: '0 0 4px 0'
                }}>
                  1,234
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  margin: 0
                }}>
                  Total Orders
                </p>
              </div>
            </div>

            {/* Total Customers Card */}
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '24px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: '0',
                right: '0',
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                opacity: '0.1',
                borderRadius: '0 0 0 80px'
              }}></div>
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '12px'
                }}>
                  <div style={{
                    padding: '8px',
                    backgroundColor: '#fef3c7',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Users style={{ width: '20px', height: '20px', color: '#f59e0b' }} />
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '12px',
                    color: '#f59e0b',
                    fontWeight: '500'
                  }}>
                    <ArrowDownRight style={{ width: '16px', height: '16px' }} />
                    -2.1%
                  </div>
                </div>
                <h3 style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: '#111827',
                  margin: '0 0 4px 0'
                }}>
                  892
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  margin: 0
                }}>
                  Total Customers
                </p>
              </div>
            </div>

            {/* Growth Rate Card */}
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '24px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: '0',
                right: '0',
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                opacity: '0.1',
                borderRadius: '0 0 0 80px'
              }}></div>
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '12px'
                }}>
                  <div style={{
                    padding: '8px',
                    backgroundColor: '#ede9fe',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <TrendingUp style={{ width: '20px', height: '20px', color: '#8b5cf6' }} />
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '12px',
                    color: '#8b5cf6',
                    fontWeight: '500'
                  }}>
                    <ArrowUpRight style={{ width: '16px', height: '16px' }} />
                    +18.7%
                  </div>
                </div>
                <h3 style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: '#111827',
                  margin: '0 0 4px 0'
                }}>
                  24.8%
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  margin: 0
                }}>
                  Growth Rate
                </p>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr',
            gap: '20px',
            marginBottom: '24px'
          }}>
            {/* Revenue Chart */}
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '24px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px'
              }}>
                <h2 style={{
                  margin: 0,
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#111827'
                }}>
                  Revenue Overview
                </h2>
                <div style={{
                  display: 'flex',
                  gap: '8px'
                }}>
                  {['Day', 'Week', 'Month', 'Year'].map((period) => (
                    <button
                      key={period}
                      onClick={() => setSelectedPeriod(period)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: selectedPeriod === period ? '#3b82f6' : '#f3f4f6',
                        color: selectedPeriod === period ? 'white' : '#6b7280',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {period}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Chart Placeholder */}
              <div style={{
                height: '300px',
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <BarChart3 style={{ width: '48px', height: '48px', color: '#cbd5e1', marginBottom: '12px' }} />
                  <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>
                    Revenue Chart
                  </p>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '24px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
            }}>
              <h2 style={{
                margin: '0 0 24px 0',
                fontSize: '18px',
                fontWeight: '600',
                color: '#111827'
              }}>
                Recent Activity
              </h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[
                  { icon: ShoppingCart, text: 'New order #1234', time: '2 min ago', color: '#3b82f6' },
                  { icon: Users, text: 'New customer registered', time: '15 min ago', color: '#10b981' },
                  { icon: DollarSign, text: 'Payment received', time: '1 hour ago', color: '#f59e0b' },
                  { icon: Package, text: 'Product shipped', time: '2 hours ago', color: '#8b5cf6' }
                ].map((activity, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '8px',
                    border: '1px solid #f1f5f9'
                  }}>
                    <div style={{
                      padding: '8px',
                      backgroundColor: `${activity.color}15`,
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <activity.icon style={{ width: '16px', height: '16px', color: activity.color }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontSize: '14px', color: '#374151', fontWeight: '500' }}>
                        {activity.text}
                      </p>
                      <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af' }}>
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Orders Table */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px'
            }}>
              <h2 style={{
                margin: 0,
                fontSize: '18px',
                fontWeight: '600',
                color: '#111827'
              }}>
                Recent Orders
              </h2>
              <div style={{
                display: 'flex',
                gap: '12px',
                alignItems: 'center'
              }}>
                <div style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <Search style={{
                    position: 'absolute',
                    left: '12px',
                    width: '16px',
                    height: '16px',
                    color: '#9ca3af'
                  }} />
                  <input
                    type="text"
                    placeholder="Search orders..."
                    style={{
                      paddingLeft: '40px',
                      paddingRight: '16px',
                      padding: '10px 16px 10px 40px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      width: '200px',
                      backgroundColor: 'white',
                      transition: 'all 0.2s ease'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#3b82f6';
                      e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#d1d5db';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
                
                <button style={{
                  padding: '10px 16px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <Filter style={{ width: '16px', height: '16px' }} />
                  Filter
                </button>
              </div>
            </div>

            {/* Table */}
            <div style={{
              overflowX: 'auto',
              border: '1px solid #e5e7eb',
              borderRadius: '8px'
            }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '14px'
              }}>
                <thead>
                  <tr style={{
                    backgroundColor: '#f8fafc',
                    borderBottom: '1px solid #e5e7eb'
                  }}>
                    <th style={{
                      padding: '12px 16px',
                      textAlign: 'left',
                      fontWeight: '600',
                      color: '#374151',
                      fontSize: '12px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>Order ID</th>
                    <th style={{
                      padding: '12px 16px',
                      textAlign: 'left',
                      fontWeight: '600',
                      color: '#374151',
                      fontSize: '12px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>Customer</th>
                    <th style={{
                      padding: '12px 16px',
                      textAlign: 'left',
                      fontWeight: '600',
                      color: '#374151',
                      fontSize: '12px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>Product</th>
                    <th style={{
                      padding: '12px 16px',
                      textAlign: 'left',
                      fontWeight: '600',
                      color: '#374151',
                      fontSize: '12px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>Amount</th>
                    <th style={{
                      padding: '12px 16px',
                      textAlign: 'left',
                      fontWeight: '600',
                      color: '#374151',
                      fontSize: '12px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>Status</th>
                    <th style={{
                      padding: '12px 16px',
                      textAlign: 'center',
                      fontWeight: '600',
                      color: '#374151',
                      fontSize: '12px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { id: '#1234', customer: 'John Doe', product: 'Premium Plan', amount: '$99.00', status: 'completed' },
                    { id: '#1235', customer: 'Jane Smith', product: 'Basic Plan', amount: '$49.00', status: 'pending' },
                    { id: '#1236', customer: 'Bob Johnson', product: 'Enterprise', amount: '$299.00', status: 'processing' },
                    { id: '#1237', customer: 'Alice Brown', product: 'Premium Plan', amount: '$99.00', status: 'completed' }
                  ].map((order, index) => (
                    <tr key={index} style={{
                      borderBottom: index < 3 ? '1px solid #f3f4f6' : 'none',
                      backgroundColor: 'white',
                      transition: 'all 0.15s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f8fafc';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'white';
                    }}>
                      <td style={{
                        padding: '16px',
                        color: '#1e293b',
                        fontWeight: '500'
                      }}>{order.id}</td>
                      <td style={{
                        padding: '16px',
                        color: '#475569'
                      }}>{order.customer}</td>
                      <td style={{
                        padding: '16px',
                        color: '#475569'
                      }}>{order.product}</td>
                      <td style={{
                        padding: '16px',
                        color: '#1e293b',
                        fontWeight: '500'
                      }}>{order.amount}</td>
                      <td style={{
                        padding: '16px'
                      }}>
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '999px',
                          fontSize: '12px',
                          fontWeight: '500',
                          backgroundColor: order.status === 'completed' ? '#d1fae5' : order.status === 'pending' ? '#fef3c7' : '#dbeafe',
                          color: order.status === 'completed' ? '#065f46' : order.status === 'pending' ? '#92400e' : '#1e40af'
                        }}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </td>
                      <td style={{
                        padding: '16px',
                        textAlign: 'center'
                      }}>
                        <div style={{
                          display: 'flex',
                          gap: '6px',
                          justifyContent: 'center'
                        }}>
                          <button style={{
                            padding: '4px 8px',
                            backgroundColor: '#f3f4f6',
                            color: '#6b7280',
                            border: '1px solid #d1d5db',
                            borderRadius: '4px',
                            fontSize: '12px',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#e5e7eb';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = '#f3f4f6';
                          }}>
                            <Eye style={{ width: '14px', height: '14px' }} />
                          </button>
                          <button style={{
                            padding: '4px 8px',
                            backgroundColor: '#f3f4f6',
                            color: '#6b7280',
                            border: '1px solid #d1d5db',
                            borderRadius: '4px',
                            fontSize: '12px',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#e5e7eb';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = '#f3f4f6';
                          }}>
                            <Edit style={{ width: '14px', height: '14px' }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
