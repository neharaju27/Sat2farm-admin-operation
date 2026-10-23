import { useState, useEffect } from 'react';
import { X } from "lucide-react";
import { normalizeUserRole } from '../utils/roleUtils';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_UPDATE_LIMIT_AREA_WEB_TEST_API_URL;
const FETCH_CLIENT_API_URL = import.meta.env.VITE_FETCH_UNIT_LIMIT_API_URL;

export default function AssignAcreage({ user, onPageChange }) {
  // Set currentRole based on actual user role
  const [currentRole, setCurrentRole] = useState(() => normalizeUserRole(user));
  
  // Restrict access to operation and sales roles only
  const normalizedRole = normalizeUserRole(user);
  if (normalizedRole !== 'ops' && normalizedRole !== 'sales') {
    return (
      <div className="content-area" style={{backgroundColor: '#f8f7f4', minHeight: '100vh', padding: '24px'}}>
        <div className="card" style={{textAlign: 'center', padding: '48px'}}>
          <h2 style={{color: '#dc2626', marginBottom: '16px'}}>Access Denied</h2>
          <p style={{color: '#6b7280', marginBottom: '24px'}}>You don't have permission to access this page. Only Operation and Sales roles can assign acreages.</p>
          <button className="btn btn-primary" onClick={() => onPageChange('dashboard')}>Back to Dashboard</button>
        </div>
      </div>
    );
  }
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    client: '',
    addAcreage: '',
    plan: 'Enterprise',
    expiryDate: '',
    notes: '',
    registerNumber: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [clientDetails, setClientDetails] = useState(null);
  const [fetchingClient, setFetchingClient] = useState(false);
  const [searchType, setSearchType] = useState('clientId'); // 'clientId' or 'registerNumber'
  const [registerDetails, setRegisterDetails] = useState(null);
  const [fetchingRegister, setFetchingRegister] = useState(false);
  
  // State for plan-based acreages
  const [planAcreages, setPlanAcreages] = useState({
    '1 month': { total: 0, used: 0, available: 0 },
    '6 months': { total: 0, used: 0, available: 0 },
    '12 months': { total: 0, used: 0, available: 0 }
  });

  const handleRoleSwitch = (role) => {
    setCurrentRole(role);
    // Stay on the assign acreage page for all role switches
    // No redirects for any role - ops, sales, manager, or client
  };

  const openModal = (modalType = 'assign-modal') => {
    setModalOpen(modalType);
  };
  const closeModal = () => {
    setModalOpen(false);
    setError('');
    setClientDetails(null);
    setRegisterDetails(null);                                                                                                                                         
    setFormData({
      client: '',
      addAcreage: '',
      plan: 'Enterprise',
      expiryDate: '',
      registerNumber: '',
    });
    setPlanAcreages({
      '1 month': { total: 0, used: 0, available: 0 },
      '6 months': { total: 0, used: 0, available: 0 },
      '12 months': { total: 0, used: 0, available: 0 }
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Fetch client details when client ID changes
  useEffect(() => {
    const fetchClientDetails = async () => {
      if (!formData.client || formData.client.trim() === '') {
        setClientDetails(null);
        return;
      }

      setFetchingClient(true);
      try {
        const apiUrl = `${FETCH_CLIENT_API_URL}?client_id=${formData.client}`;
        console.log('Fetching client details:', apiUrl);
        
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();
        console.log('API Response:', data);
        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);
        console.log('Data keys:', Object.keys(data));
        console.log('Data values:', Object.values(data));
        console.log('Full data:', JSON.stringify(data, null, 2));

        if (response.ok && data) {
          setClientDetails({
            clientId: data.client_id || formData.client,
            company: data.company || data.full_name || data.name || 'N/A',
            allocateArea: data.allocate_area || 0,
            usedArea: data.used_area || 0,
            availableArea: data.available_area || 0,
            totalArea: data.total_area || 0
          });
          
          // Set plan acreages from API response
          setPlanAcreages({
            '1 month': { 
              total: data['1_month']?.total_area || 0, 
              used: data['1_month']?.used_area || 0, 
              available: data['1_month']?.available_area || 0 
            },
            '6 months': { 
              total: data['6_month']?.total_area || 0, 
              used: data['6_month']?.used_area || 0, 
              available: data['6_month']?.available_area || 0 
            },
            '12 months': { 
              total: data['12_month']?.total_area || 0, 
              used: data['12_month']?.used_area || 0, 
              available: data['12_month']?.available_area || 0 
            }
          });
          console.log('Set clientDetails:', {
            clientId: data.client_id || formData.client,
            company: data.company || data.full_name || 'N/A',
            allocateArea: data.allocate_area || 0,
            usedArea: data.used_area || 0,
            availableArea: data.available_area || 0,
            totalArea: data.total_area || 0
          });
        } else {
          console.log('No data or response not ok');
          setClientDetails(null);
        }
      } catch (err) {
        console.error('Error fetching client:', err);
        setClientDetails(null);
      } finally {
        setFetchingClient(false);
      }
    };

    const timeoutId = setTimeout(() => {
      fetchClientDetails();
    }, 500); // Debounce for 500ms

    return () => clearTimeout(timeoutId);
  }, [formData.client]);

  // Fetch register details when register number changes
  useEffect(() => {
    const fetchRegisterDetails = async () => {
      if (!formData.registerNumber || formData.registerNumber.trim() === '') {
        setRegisterDetails(null);
        return;
      }

      setFetchingRegister(true);
      try {
        const apiUrl = `${FETCH_CLIENT_API_URL}?username=${formData.registerNumber}`;
        console.log('Fetching register details:', apiUrl);
        
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();
        console.log('Register API Response:', data);

        if (response.ok && data) {
          setRegisterDetails({
            registerId: data.register_number || formData.registerNumber,
            clientId: data.client_id || 'N/A',
            company: data.full_name || data.company || data.name || 'N/A',
            allocateArea: data.allocate_area || 0,
            usedArea: data.used_area || 0,
            availableArea: data.available_area || 0,
            totalArea: data.total_area || 0
          });
          
          // Set plan acreages from API response
          setPlanAcreages({
            '1 month': { 
              total: data['1_month']?.total_area || 0, 
              used: data['1_month']?.used_area || 0, 
              available: data['1_month']?.available_area || 0 
            },
            '6 months': { 
              total: data['6_month']?.total_area || 0, 
              used: data['6_month']?.used_area || 0, 
              available: data['6_month']?.available_area || 0 
            },
            '12 months': { 
              total: data['12_month']?.total_area || 0, 
              used: data['12_month']?.used_area || 0, 
              available: data['12_month']?.available_area || 0 
            }
          });
        } else {
          setRegisterDetails(null);
        }
      } catch (err) {
        console.error('Error fetching register:', err);
        setRegisterDetails(null);
      } finally {
        setFetchingRegister(false);
      }
    };

    const timeoutId = setTimeout(() => {
      fetchRegisterDetails();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [formData.registerNumber]);

  const handleAssign = async () => {
    if (!formData.addAcreage || !formData.expiryDate) {
      const errorMessage = 'Please fill in all required fields';
      setError(errorMessage);
      toast.error(errorMessage);
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Use clientID directly from the form input
      const clientID = formData.client;
      
      // Format date as DD-MM-YYYY
      const date = new Date(formData.expiryDate);
      const formattedDate = `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;

      // Get user name for updated_by parameter (the logged-in user who is assigning)
      const updatedBy = user?.name || user?.full_name || user?.username || user?.phone_number || 'operation';

      // Determine the API parameter based on selected plan
      let acreageParam = '';
      const trimmedPlan = formData.plan.trim();
      console.log('Selected plan:', formData.plan, 'Trimmed:', trimmedPlan);
      
      if (trimmedPlan === '1 month') {
        acreageParam = `one_month=${formData.addAcreage}`;
      } else if (trimmedPlan === '6 month') {
        acreageParam = `six_month=${formData.addAcreage}`;
      } else if (trimmedPlan === '12 month') {
        acreageParam = `twelve_month=${formData.addAcreage}`;
      } else {
        acreageParam = `one_month=${formData.addAcreage}`; // fallback
      }

      const apiUrl = `${API_URL}?clientID=${clientID}&${acreageParam}&date_of_expiry=${formattedDate}&updated_by=${updatedBy}`;
      
      console.log('Assign API URL:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      console.log('Assign API Response:', data);

      if (response.ok) {
        toast.success('Acreage assigned successfully!');
        
        // Refresh client details to show updated acreage
        if (searchType === 'clientId' && formData.client) {
          // Trigger the useEffect by not changing the value, but we need to refetch
          // We'll call the fetch logic directly
          const fetchClientDetails = async () => {
            setFetchingClient(true);
            try {
              const apiUrl = `${FETCH_CLIENT_API_URL}?client_id=${formData.client}`;
              const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                },
              });
              const data = await response.json();
              if (response.ok && data) {
                setClientDetails({
                  clientId: data.client_id || formData.client,
                  company: data.company || data.full_name || data.name || 'N/A',
                  allocateArea: data.allocate_area || 0,
                  usedArea: data.used_area || 0,
                  availableArea: data.available_area || 0,
                  totalArea: data.total_area || 0
                });
                setPlanAcreages({
                  '1 month': { 
                    total: data['1_month']?.total_area || 0, 
                    used: data['1_month']?.used_area || 0, 
                    available: data['1_month']?.available_area || 0 
                  },
                  '6 months': { 
                    total: data['6_month']?.total_area || 0, 
                    used: data['6_month']?.used_area || 0, 
                    available: data['6_month']?.available_area || 0 
                  },
                  '12 months': { 
                    total: data['12_month']?.total_area || 0, 
                    used: data['12_month']?.used_area || 0, 
                    available: data['12_month']?.available_area || 0 
                  }
                });
              }
            } catch (err) {
              console.error('Error refreshing client details:', err);
            } finally {
              setFetchingClient(false);
            }
          };
          fetchClientDetails();
        } else if (searchType === 'registerNumber' && formData.registerNumber) {
          const fetchRegisterDetails = async () => {
            setFetchingRegister(true);
            try {
              const apiUrl = `${FETCH_CLIENT_API_URL}?username=${formData.registerNumber}`;
              const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                },
              });
              const data = await response.json();
              if (response.ok && data) {
                setRegisterDetails({
                  registerId: data.register_number || formData.registerNumber,
                  clientId: data.client_id || 'N/A',
                  company: data.full_name || data.company || data.name || 'N/A',
                  allocateArea: data.allocate_area || 0,
                  usedArea: data.used_area || 0,
                  availableArea: data.available_area || 0,
                  totalArea: data.total_area || 0
                });
                setPlanAcreages({
                  '1 month': { 
                    total: data['1_month']?.total_area || 0, 
                    used: data['1_month']?.used_area || 0, 
                    available: data['1_month']?.available_area || 0 
                  },
                  '6 months': { 
                    total: data['6_month']?.total_area || 0, 
                    used: data['6_month']?.used_area || 0, 
                    available: data['6_month']?.available_area || 0 
                  },
                  '12 months': { 
                    total: data['12_month']?.total_area || 0, 
                    used: data['12_month']?.used_area || 0, 
                    available: data['12_month']?.available_area || 0 
                  }
                });
              }
            } catch (err) {
              console.error('Error refreshing register details:', err);
            } finally {
              setFetchingRegister(false);
            }
          };
          fetchRegisterDetails();
        }
        
        closeModal();
      } else {
        const errorMessage = data.message || 'Failed to assign acreage';
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (err) {
      console.error('Assign Error:', err);
      const errorMessage = 'Network error. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  // Mock client acreage allocations data
  const [clientAllocations] = useState([
    {
      id: 1,
      clientName: 'GreenField Agro',
      clientInitial: 'GF',
      plan: 'Enterprise',
      assignedAcreage: 8400,
      usedAcreage: 7920,
      utilization: 94,
      expiry: 'Dec 26'
    },
    {
      id: 2,
      clientName: 'Sunrise Farms',
      clientInitial: 'SR',
      plan: 'Growth',
      assignedAcreage: 6200,
      usedAcreage: 4800,
      utilization: 77,
      expiry: 'Jun 26'
    },
    {
      id: 3,
      clientName: 'Deccan Planters',
      clientInitial: 'DP',
      plan: 'Starter',
      assignedAcreage: 5100,
      usedAcreage: 5100,
      utilization: 100,
      expiry: 'Apr 26'
    }
  ]);

  const getUtilizationClass = (utilization) => {
    if (utilization >= 100) return 'over';
    if (utilization < 50) return 'warn';
    return '';
  };

  const getPlanBadgeClass = (plan) => {
    switch(plan) {
      case 'Enterprise': return 'badge-green';
      case 'Growth': return 'badge-blue';
      case 'Starter': return 'badge-amber';
      default: return 'badge-gray';
    }
  };

  const handleAddAcreage = (clientId) => {
    console.log(`Add acreage for client ${clientId}`);
  };

  const handleReduceAcreage = (clientId) => {
    console.log(`Reduce acreage for client ${clientId}`);
  };

  const handleUpgrade = (clientId) => {
    console.log(`Upgrade client ${clientId}`);
  };

  return (
    <div className="content-area" style={{backgroundColor: '#f8f7f4', minHeight: '100vh', padding: '0'}}>
      {/* Top Navigation Bar - Full Width */}
      <div className="topbar" style={{marginBottom: '16px', marginLeft: '0', marginRight: '0', backgroundColor: '#ffffff', borderBottom: '1px solid var(--border)', padding: '0 24px'}}>
        <div className="tb-left">
          <div>
            <div className="tb-page">Assign Acreage</div>
            <div className="tb-sub">Sales · Quota Management</div>
          </div>
        </div>
        <div className="tb-right">
          <button className="btn btn-primary btn-sm" onClick={() => openModal('quick-actions')}>+ New</button>
        </div>
      </div>

      {/* Section Header */}
      <div className="section-head" style={{padding: '0 24px'}}>
        <div className="section-title">Assign acreage to clients</div>
        <button className="btn btn-primary" onClick={() => openModal('assign-modal')}>+ Assign acreage</button>
      </div>

      {/* Metrics */}
      <div className="metrics" style={{gridTemplateColumns: 'repeat(3, 1fr)', padding: '0 24px'}}>
        <div className="metric metric-accent">
          <div className="metric-label">Total pool (ac)</div>
          <div className="metric-val">1,20,000</div>
          <div className="metric-sub">Available to assign</div>
        </div>
        <div className="metric">
          <div className="metric-label">Assigned (ac)</div>
          <div className="metric-val">84,320</div>
          <div className="metric-sub">70% of pool</div>
        </div>
        <div className="metric">
          <div className="metric-label">Remaining (ac)</div>
          <div className="metric-val">35,680</div>
          <div className="metric-sub metric-up">30% available</div>
        </div>
      </div>

      {/* Client Acreage Allocations Table */}
      <div className="card" style={{marginLeft: '24px', marginRight: '24px'}}>
        <div className="card-head">
          <span className="card-title">Client acreage allocations</span>
        </div>
        <div className="tbl-wrap">
          <table>
            <thead>
              <tr>
                <th>Client</th>
                <th>Plan</th>
                <th>Assigned (ac)</th>
                <th>Used (ac)</th>
                <th>Utilisation</th>
                <th>Expiry</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {clientAllocations.map((client) => (
                <tr key={client.id}>
                  <td>
                    <div className="flex-cell">
                      <div className="avatar-sm">{client.clientInitial}</div>
                      <div>
                        <div className="tbl-name">{client.clientName}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${getPlanBadgeClass(client.plan)}`}>
                      {client.plan}
                    </span>
                  </td>
                  <td>{client.assignedAcreage}</td>
                  <td>{client.usedAcreage}</td>
                  <td>
                    <div className="prog-wrap">
                      <div 
                        className={`prog-fill ${getUtilizationClass(client.utilization)}`}
                        style={{width: `${client.utilization}%`}}
                      ></div>
                    </div>
                  </td>
                  <td>{client.expiry}</td>
                  <td style={{display: 'flex', gap: '6px', paddingTop: '13px'}}>
                    <button 
                      className="btn btn-sm" 
                      onClick={() => handleAddAcreage(client.id)}
                    >
                      + Add
                    </button>
                    <button 
                      className="btn btn-danger btn-sm" 
                      onClick={() => handleReduceAcreage(client.id)}
                    >
                      Reduce
                    </button>
                    {client.utilization >= 100 && (
                      <button 
                        className="btn btn-sm btn-primary" 
                        onClick={() => handleUpgrade(client.id)}
                      >
                        Upgrade
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Quick Actions Modal */}
      {modalOpen === 'quick-actions' && (
        <div className="modal-overlay">
          <div className="modal" style={{width: '420px', maxWidth: '90vw'}}>
            <div className="modal-head">
              <h3>Quick actions</h3>
              <button className="btn btn-ghost btn-sm" onClick={closeModal}>
                <X className="ic-xs" />
              </button>
            </div>
            <div className="modal-body">
              <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
                
                
                <button className="btn" style={{justifyContent: 'flex-start', textAlign: 'left'}} onClick={() => { closeModal(); openModal('assign-modal'); }}>
                  <span style={{marginRight: '8px'}}>+</span> Assign acreage to client
                </button>
                
                <button className="btn" style={{justifyContent: 'flex-start', textAlign: 'left'}} onClick={() => { closeModal(); onPageChange('unlock-farm'); }}>
                  <span style={{marginRight: '8px'}}>+</span> Unlock farm
                </button>
                <button className="btn" style={{justifyContent: 'flex-start', textAlign: 'left'}} onClick={() => { closeModal(); openModal('add-registration-modal'); }}>
                  <span style={{marginRight: '8px'}}>+</span> Add new registration
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign Acreage Modal */}
      {modalOpen === 'assign-modal' && (
        <div className="modal-overlay">
          <div className="modal" style={{width: '600px', maxWidth: '90vw'}}>
            <div className="modal-head">
              <h3>Assign acreage to client</h3>
              <button className="btn btn-ghost btn-sm" onClick={closeModal}>
                <X className="ic-xs" />
              </button>
            </div>
            <div className="modal-body">
              {error && (
                <div className="alert alert-danger" style={{marginBottom: '16px'}}>
                  {error}
                </div>
              )}
              {/* Radio button selection */}
              <div style={{marginBottom: '16px'}}>
                <label style={{display: 'block', marginBottom: '8px', fontWeight: '500'}}>Search by:</label>
                <div style={{display: 'flex', gap: '24px'}}>
                  <label style={{display: 'flex', alignItems: 'center', cursor: 'pointer'}}>
                    <input
                      type="radio"
                      name="searchType"
                      value="clientId"
                      checked={searchType === 'clientId'}
                      onChange={(e) => {
                        setSearchType(e.target.value);
                        setClientDetails(null);
                        setRegisterDetails(null);
                        setFormData(prev => ({ ...prev, client: '', registerNumber: '' }));
                      }}
                      style={{marginRight: '8px'}}
                    />
                    <span>Client ID</span>
                  </label>
                  <label style={{display: 'flex', alignItems: 'center', cursor: 'pointer'}}>
                    <input
                      type="radio"
                      name="searchType"
                      value="registerNumber"
                      checked={searchType === 'registerNumber'}
                      onChange={(e) => {
                        setSearchType(e.target.value);
                        setClientDetails(null);
                        setRegisterDetails(null);
                        setFormData(prev => ({ ...prev, client: '', registerNumber: '' }));
                      }}
                      style={{marginRight: '8px'}}
                    />
                    <span>Registered Number</span>
                  </label>
                </div>
              </div>

              {/* Conditional input field */}
              {searchType === 'clientId' ? (
                <div className="form-group" style={{marginBottom: '16px'}}>
                  <label>Client ID</label>
                  <input type="text" name="client" value={formData.client} onChange={handleInputChange} placeholder="e.g. 343" />
                  {fetchingClient && <div style={{fontSize: '12px', color: '#666', marginTop: '4px'}}>Loading client details...</div>}
                </div>
              ) : (
                <div className="form-group" style={{marginBottom: '16px'}}>
                  <label>Registered Number</label>
                  <input type="text" name="registerNumber" value={formData.registerNumber} onChange={handleInputChange} placeholder="e.g. 9963758295" />
                  {fetchingRegister && <div style={{fontSize: '12px', color: '#666', marginTop: '4px'}}>Loading register details...</div>}
                </div>
              )}

              {/* Client Details - Full Width */}
              {clientDetails && !fetchingClient && (
                <div style={{backgroundColor: '#f0fdf4', border: '1px solid #86efac', borderRadius: '6px', padding: '16px', marginTop: '16px', marginBottom: '16px'}}>
                  <div style={{fontSize: '16px', fontWeight: '600', color: '#166534', marginBottom: '12px', borderBottom: '2px solid #86efac', paddingBottom: '8px'}}>Client Details</div>
                  <table style={{width: '100%', fontSize: '14px', borderCollapse: 'collapse'}}>
                    <tbody>
                      <tr style={{borderBottom: '1px solid #bbf7d0'}}>
                        <td style={{padding: '10px 0', color: '#374151', width: '25%', fontWeight: '500'}}>Client ID</td>
                        <td style={{padding: '10px 0', fontWeight: '600', color: '#1f2937'}}>{clientDetails.clientId}</td>
                      </tr>
                      <tr>
                        <td style={{padding: '10px 0', color: '#374151', fontWeight: '500'}}>Company</td>
                        <td style={{padding: '10px 0', fontWeight: '600', color: '#1f2937'}}>{clientDetails.company}</td>
                      </tr>
                    </tbody>
                  </table>
                  
                  {/* Plan Acreages Cards */}
                  <div style={{display: 'flex', gap: '12px', marginTop: '16px'}}>
                    <div className="card metric-accent" style={{flex: 1, transition: 'transform 0.2s ease, box-shadow 0.2s ease', cursor: 'pointer'}} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
                      <div className="card-body" style={{padding: '12px', textAlign: 'center'}}>
                        <div style={{display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center'}}>
                          <div style={{fontSize: '12px', color: 'var(--text-2)', fontWeight: '500'}}>1 Month Plan</div>
                          <div style={{display: 'flex', flexDirection: 'column', gap: '3px'}}>
                            <div style={{fontSize: '13px', color: 'var(--text-2)'}}>
                              <span style={{color: '#666'}}>Total:</span> <strong>{planAcreages['1 month'].total.toFixed(2)} ac</strong>
                            </div>
                            <div style={{fontSize: '13px', color: 'var(--text-2)'}}>
                              <span style={{color: '#666'}}>Used:</span> <strong>{planAcreages['1 month'].used.toFixed(2)} ac</strong>
                            </div>
                            <div style={{fontSize: '13px', color: 'var(--text-2)'}}>
                              <span style={{color: '#666'}}>Available:</span> <strong>{planAcreages['1 month'].available.toFixed(2)} ac</strong>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="card metric-accent" style={{flex: 1, transition: 'transform 0.2s ease, box-shadow 0.2s ease', cursor: 'pointer'}} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
                      <div className="card-body" style={{padding: '12px', textAlign: 'center'}}>
                        <div style={{display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center'}}>
                          <div style={{fontSize: '12px', color: 'var(--text-2)', fontWeight: '500'}}>6 Months Plan</div>
                          <div style={{display: 'flex', flexDirection: 'column', gap: '3px'}}>
                            <div style={{fontSize: '13px', color: 'var(--text-2)'}}>
                              <span style={{color: '#666'}}>Total:</span> <strong>{planAcreages['6 months'].total.toFixed(2)} ac</strong>
                            </div>
                            <div style={{fontSize: '13px', color: 'var(--text-2)'}}>
                              <span style={{color: '#666'}}>Used:</span> <strong>{planAcreages['6 months'].used.toFixed(2)} ac</strong>
                            </div>
                            <div style={{fontSize: '13px', color: 'var(--text-2)'}}>
                              <span style={{color: '#666'}}>Available:</span> <strong>{planAcreages['6 months'].available.toFixed(2)} ac</strong>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="card metric-accent" style={{flex: 1, transition: 'transform 0.2s ease, box-shadow 0.2s ease', cursor: 'pointer'}} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
                      <div className="card-body" style={{padding: '12px', textAlign: 'center'}}>
                        <div style={{display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center'}}>
                          <div style={{fontSize: '12px', color: 'var(--text-2)', fontWeight: '500'}}>12 Months Plan</div>
                          <div style={{display: 'flex', flexDirection: 'column', gap: '3px'}}>
                            <div style={{fontSize: '13px', color: 'var(--text-2)'}}>
                              <span style={{color: '#666'}}>Total:</span> <strong>{planAcreages['12 months'].total.toFixed(2)} ac</strong>
                            </div>
                            <div style={{fontSize: '13px', color: 'var(--text-2)'}}>
                              <span style={{color: '#666'}}>Used:</span> <strong>{planAcreages['12 months'].used.toFixed(2)} ac</strong>
                            </div>
                            <div style={{fontSize: '13px', color: 'var(--text-2)'}}>
                              <span style={{color: '#666'}}>Available:</span> <strong>{planAcreages['12 months'].available.toFixed(2)} ac</strong>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Register Details - Full Width */}
              {registerDetails && !fetchingRegister && (
                <div style={{backgroundColor: '#f0fdf4', border: '1px solid #86efac', borderRadius: '6px', padding: '16px', marginBottom: '16px'}}>
                  <div style={{fontSize: '16px', fontWeight: '600', color: '#166534', marginBottom: '12px', borderBottom: '2px solid #86efac', paddingBottom: '8px'}}>Register Details</div>
                  <table style={{width: '100%', fontSize: '14px', borderCollapse: 'collapse'}}>
                    <tbody>
                      <tr style={{borderBottom: '1px solid #bbf7d0'}}>
                        <td style={{padding: '10px 0', color: '#374151', width: '25%', fontWeight: '500'}}>Registered ID</td>
                        <td style={{padding: '10px 0', fontWeight: '600', color: '#1f2937'}}>{registerDetails.registerId}</td>
                      </tr>
                      <tr style={{borderBottom: '1px solid #bbf7d0'}}>
                        <td style={{padding: '10px 0', color: '#374151', fontWeight: '500'}}>Client ID</td>
                        <td style={{padding: '10px 0', fontWeight: '600', color: '#1f2937'}}>{registerDetails.clientId}</td>
                      </tr>
                      <tr>
                        <td style={{padding: '10px 0', color: '#374151', fontWeight: '500'}}>Company</td>
                        <td style={{padding: '10px 0', fontWeight: '600', color: '#1f2937'}}>{registerDetails.company}</td>
                      </tr>
                    </tbody>
                  </table>
                  
                  {/* Plan Acreages Cards */}
                  <div style={{display: 'flex', gap: '12px', marginTop: '16px'}}>
                    <div className="card metric-accent" style={{flex: 1, transition: 'transform 0.2s ease, box-shadow 0.2s ease', cursor: 'pointer'}} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
                      <div className="card-body" style={{padding: '12px', textAlign: 'center'}}>
                        <div style={{display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center'}}>
                          <div style={{fontSize: '12px', color: 'var(--text-2)', fontWeight: '500'}}>1 Month Plan</div>
                          <div style={{display: 'flex', flexDirection: 'column', gap: '3px'}}>
                            <div style={{fontSize: '13px', color: 'var(--text-2)'}}>
                              <span style={{color: '#666'}}>Total:</span> <strong>{planAcreages['1 month'].total.toFixed(2)} ac</strong>
                            </div>
                            <div style={{fontSize: '13px', color: 'var(--text-2)'}}>
                              <span style={{color: '#666'}}>Used:</span> <strong>{planAcreages['1 month'].used.toFixed(2)} ac</strong>
                            </div>
                            <div style={{fontSize: '13px', color: 'var(--text-2)'}}>
                              <span style={{color: '#666'}}>Available:</span> <strong>{planAcreages['1 month'].available.toFixed(2)} ac</strong>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="card metric-accent" style={{flex: 1, transition: 'transform 0.2s ease, box-shadow 0.2s ease', cursor: 'pointer'}} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
                      <div className="card-body" style={{padding: '12px', textAlign: 'center'}}>
                        <div style={{display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center'}}>
                          <div style={{fontSize: '12px', color: 'var(--text-2)', fontWeight: '500'}}>6 Months Plan</div>
                          <div style={{display: 'flex', flexDirection: 'column', gap: '3px'}}>
                            <div style={{fontSize: '13px', color: 'var(--text-2)'}}>
                              <span style={{color: '#666'}}>Total:</span> <strong>{planAcreages['6 months'].total.toFixed(2)} ac</strong>
                            </div>
                            <div style={{fontSize: '13px', color: 'var(--text-2)'}}>
                              <span style={{color: '#666'}}>Used:</span> <strong>{planAcreages['6 months'].used.toFixed(2)} ac</strong>
                            </div>
                            <div style={{fontSize: '13px', color: 'var(--text-2)'}}>
                              <span style={{color: '#666'}}>Available:</span> <strong>{planAcreages['6 months'].available.toFixed(2)} ac</strong>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="card metric-accent" style={{flex: 1, transition: 'transform 0.2s ease, box-shadow 0.2s ease', cursor: 'pointer'}} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
                      <div className="card-body" style={{padding: '12px', textAlign: 'center'}}>
                        <div style={{display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center'}}>
                          <div style={{fontSize: '12px', color: 'var(--text-2)', fontWeight: '500'}}>12 Months Plan</div>
                          <div style={{display: 'flex', flexDirection: 'column', gap: '3px'}}>
                            <div style={{fontSize: '13px', color: 'var(--text-2)'}}>
                              <span style={{color: '#666'}}>Total:</span> <strong>{planAcreages['12 months'].total.toFixed(2)} ac</strong>
                            </div>
                            <div style={{fontSize: '13px', color: 'var(--text-2)'}}>
                              <span style={{color: '#666'}}>Used:</span> <strong>{planAcreages['12 months'].used.toFixed(2)} ac</strong>
                            </div>
                            <div style={{fontSize: '13px', color: 'var(--text-2)'}}>
                              <span style={{color: '#666'}}>Available:</span> <strong>{planAcreages['12 months'].available.toFixed(2)} ac</strong>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
                <div className="form-group">
                  <label>Add acreage (ac) *</label>
                  <input type="number" name="addAcreage" value={formData.addAcreage} onChange={handleInputChange} placeholder="e.g. 1000" required />
                </div>
                <div className="form-group">
                  <label>Plan</label>
                  <select name="plan" value={formData.plan} onChange={handleInputChange}>
                    <option> 1 month</option>
                    <option> 6 month</option>
                    <option>12 month</option>
                    
                  </select>
                </div>
                <div className="form-group">
                  <label>Expiry date *</label>
                  <input type="date" name="expiryDate" value={formData.expiryDate} onChange={handleInputChange} required />
                </div>
                <div className="form-group" style={{gridColumn: 'span 2'}}>
                  <label>Notes</label>
                  <textarea name="notes" value={formData.notes} onChange={handleInputChange} placeholder="Reason for assignment, sales deal reference..." rows="3" />
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={closeModal}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAssign} disabled={loading}>
                {loading ? 'Assigning...' : 'Assign'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
