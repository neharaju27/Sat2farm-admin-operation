import { useState, useEffect } from 'react';
import { X } from "lucide-react";

const API_URL = import.meta.env.VITE_UPDATE_LIMIT_AREA_API_URL || 'https://api.sat2farm.com/sat2farm_admin_web/update_limit_area_sat2farm_admin_web';
const FETCH_CLIENT_API_URL = import.meta.env.VITE_FETCH_UNIT_LIMIT_API_URL || 'https://api.sat2farm.com/fetch-unit-limit/get-unit-limit';

export default function AssignAcreage({ user, onPageChange }) {
  const [currentRole, setCurrentRole] = useState('sales');
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    client: '',
    addAcreage: '',
    plan: 'Enterprise',
    expiryDate: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [clientDetails, setClientDetails] = useState(null);
  const [fetchingClient, setFetchingClient] = useState(false);

  const handleRoleSwitch = (role) => {
    setCurrentRole(role);
    if (role === 'ops') {
      onPageChange('monthly-acreages');
    } else if (role === 'sales') {
      onPageChange('sales-acreage');
    } else if (role === 'client') {
      onPageChange('client-team');
    }
  };

  const openModal = () => setModalOpen(true);
  const closeModal = () => {
    setModalOpen(false);
    setError('');
    setClientDetails(null);
    setFormData({
      client: '',
      addAcreage: '',
      plan: 'Enterprise',
      expiryDate: '',
      notes: ''
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

        if (response.ok && data) {
          setClientDetails({
            clientId: data.client_id || formData.client,
            company: data.full_name || 'N/A',
            totalAcreage: data.unit_limit || 0
          });
          console.log('Set clientDetails:', clientDetails);
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

  const handleAssign = async () => {
    if (!formData.addAcreage || !formData.expiryDate || !formData.client) {
      setError('Please fill in all required fields');
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

      const apiUrl = `${API_URL}?clientID=${clientID}&one_month=${formData.addAcreage}&date_of_expiry=${formattedDate}`;
      
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
        alert('Acreage assigned successfully!');
        closeModal();
      } else {
        setError(data.message || 'Failed to assign acreage');
      }
    } catch (err) {
      console.error('Assign Error:', err);
      setError('Network error. Please try again.');
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
          <div className="role-switcher">
            <span style={{fontSize: '10px', color: 'var(--text-3)', marginRight: '2px'}}>Role:</span>
            <button className={`role-btn ${currentRole === 'ops' ? 'active' : ''}`} onClick={() => handleRoleSwitch('ops')}>Ops</button>
            <button className={`role-btn ${currentRole === 'sales' ? 'active' : ''}`} onClick={() => handleRoleSwitch('sales')}>Sales</button>
            <button className={`role-btn ${currentRole === 'client' ? 'active' : ''}`} onClick={() => handleRoleSwitch('client')}>Client</button>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => {}}>+ New</button>
        </div>
      </div>

      {/* Section Header */}
      <div className="section-head" style={{padding: '0 24px'}}>
        <div className="section-title">Assign acreage to clients</div>
        <button className="btn btn-primary" onClick={openModal}>+ Assign acreage</button>
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
      {/* Assign Acreage Modal */}
      {modalOpen && (
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
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
                <div className="form-group" style={{gridColumn: 'span 2'}}>
                  <label>Client ID</label>
                  <input type="text" name="client" value={formData.client} onChange={handleInputChange} placeholder="e.g. 343" />
                  {fetchingClient && <div style={{fontSize: '12px', color: '#666', marginTop: '4px'}}>Loading client details...</div>}
                  {clientDetails && !fetchingClient && (
                    <div style={{backgroundColor: '#f0fdf4', border: '1px solid #86efac', borderRadius: '6px', padding: '12px', marginTop: '8px'}}>
                      <div style={{fontSize: '14px', fontWeight: '600', color: '#166534', marginBottom: '8px'}}>Client Details</div>
                      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '13px'}}>
                        <div><span style={{color: '#666'}}>Client Id:</span> <strong>{clientDetails.clientId}</strong></div>
                        <div><span style={{color: '#666'}}>Company:</span> <strong>{clientDetails.company}</strong></div>
                        <div style={{gridColumn: 'span 2'}}><span style={{color: '#666'}}>Total Acreage:</span> <strong>{clientDetails.totalAcreage} acres</strong></div>
                      </div>
                    </div>
                  )}
                </div>
                
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
