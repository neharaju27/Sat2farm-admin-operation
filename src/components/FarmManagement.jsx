import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const API_URL = import.meta.env.VITE_UPDATE_LIMIT_AREA_API_URL || 'https://api.sat2farm.com/sat2farm_admin_web/update_limit_area_sat2farm_admin_web';
const FETCH_CLIENT_API_URL = import.meta.env.VITE_FETCH_UNIT_LIMIT_API_URL || 'https://api.sat2farm.com/fetch-unit-limit/get-unit-limit';

export default function FarmManagement({ user, onPageChange }) {
  const [currentRole, setCurrentRole] = useState('ops');
  const [modalOpen, setModalOpen] = useState(false);

  // State for Assign Acreage modal
  const [assignFormData, setAssignFormData] = useState({
    client: '',
    addAcreage: '',
    plan: ' 1 month',
    expiryDate: '',
    notes: '',
    registerNumber: ''
  });
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignError, setAssignError] = useState('');
  const [assignSuccess, setAssignSuccess] = useState(false);
  const [clientDetails, setClientDetails] = useState(null);
  const [fetchingClient, setFetchingClient] = useState(false);
  const [registerDetails, setRegisterDetails] = useState(null);
  const [fetchingRegister, setFetchingRegister] = useState(false);

  // State for Unlock Farm modal
  const [unlockFarmId, setUnlockFarmId] = useState('');
  const [unlockStatus, setUnlockStatus] = useState('unlock');
  const [unlockPaymentMode, setUnlockPaymentMode] = useState('cash');
  const [unlockExpiry, setUnlockExpiry] = useState('6');
  const [unlockCustomExpiry, setUnlockCustomExpiry] = useState('');
  const [unlockLoading, setUnlockLoading] = useState(false);
  const [unlockError, setUnlockError] = useState('');
  const [unlockMessage, setUnlockMessage] = useState('');

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

  const handleAssignInputChange = (e) => {
    const { name, value } = e.target;
    setAssignFormData(prev => ({ ...prev, [name]: value }));
  };

  // Fetch client details when client ID changes
  useEffect(() => {
    const fetchClientDetails = async () => {
      if (!assignFormData.client || assignFormData.client.trim() === '') {
        setClientDetails(null);
        return;
      }
      setFetchingClient(true);
      try {
        const apiUrl = `${FETCH_CLIENT_API_URL}?client_id=${assignFormData.client}`;
        const response = await fetch(apiUrl, { method: 'GET', headers: { 'Content-Type': 'application/json' } });
        const data = await response.json();
        if (response.ok && data) {
          setClientDetails({
            clientId: data.client_id || assignFormData.client,
            company: data.company || data.full_name || 'N/A',
            allocateArea: data.allocate_area || 0,
            usedArea: data.used_area || 0,
            availableArea: data.available_area || 0,
            totalArea: data.total_area || 0
          });
        } else {
          setClientDetails(null);
        }
      } catch (err) {
        setClientDetails(null);
      } finally {
        setFetchingClient(false);
      }
    };
    const timeoutId = setTimeout(fetchClientDetails, 500);
    return () => clearTimeout(timeoutId);
  }, [assignFormData.client]);

  // Fetch register details when register number changes
  useEffect(() => {
    const fetchRegisterDetails = async () => {
      if (!assignFormData.registerNumber || assignFormData.registerNumber.trim() === '') {
        setRegisterDetails(null);
        return;
      }
      setFetchingRegister(true);
      try {
        const apiUrl = `${FETCH_CLIENT_API_URL}?username=${assignFormData.registerNumber}`;
        const response = await fetch(apiUrl, { method: 'GET', headers: { 'Content-Type': 'application/json' } });
        const data = await response.json();
        if (response.ok && data) {
          setRegisterDetails({
            registerId: data.register_number || assignFormData.registerNumber,
            clientId: data.client_id || 'N/A',
            allocateArea: data.allocate_area || 0,
            usedArea: data.used_area || 0,
            availableArea: data.available_area || 0,
            totalArea: data.total_area || 0
          });
        } else {
          setRegisterDetails(null);
        }
      } catch (err) {
        setRegisterDetails(null);
      } finally {
        setFetchingRegister(false);
      }
    };
    const timeoutId = setTimeout(fetchRegisterDetails, 500);
    return () => clearTimeout(timeoutId);
  }, [assignFormData.registerNumber]);

  const handleAssignAcreage = async () => {
    if (!assignFormData.addAcreage || !assignFormData.expiryDate) {
      setAssignError('Please fill in all required fields');
      return;
    }
    setAssignLoading(true);
    setAssignError('');
    try {
      const clientID = assignFormData.client;
      const date = new Date(assignFormData.expiryDate);
      const formattedDate = `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
      const apiUrl = `${API_URL}?clientID=${clientID}&acreage=${assignFormData.addAcreage}&date_of_expiry=${formattedDate}`;
      const response = await fetch(apiUrl, { method: 'GET' });
      const data = await response.json();
      if (data.status === 'Success') {
        setAssignSuccess(true);
      } else {
        setAssignError(data.message || 'Failed to assign acreage');
      }
    } catch (error) {
      setAssignError(error.message);
    } finally {
      setAssignLoading(false);
    }
  };

  const handleUnlockFarm = async () => {
    if (!unlockFarmId.trim()) {
      setUnlockError('Please enter a Farm ID.');
      return;
    }
    setUnlockLoading(true);
    setUnlockError('');
    setUnlockMessage('');
    try {
      const lockStatus = unlockStatus === 'lock' ? 0 : 1;
      let expiryValue = unlockExpiry;
      if (unlockExpiry === 'other') {
        expiryValue = unlockCustomExpiry.trim();
      }
      const apiUrl = `${import.meta.env.VITE_UNLOCK_FARM_API_URL}?farm_id=${unlockFarmId.trim()}&lockstatus=${lockStatus}&mode=${unlockPaymentMode}&expiry=${expiryValue}`;
      const response = await fetch(apiUrl, { method: 'GET' });
      const data = await response.json();
      if (data && data.status !== 'Failure') {
        const statusText = unlockStatus === 'lock' ? 'locked' : 'unlocked';
        const successMessage = `Farm ID ${unlockFarmId.trim()} has been ${statusText} successfully!`;
        alert(successMessage);
        setUnlockMessage(successMessage);
        setUnlockFarmId('');
        setUnlockStatus('unlock');
        setUnlockPaymentMode('cash');
        setUnlockExpiry('6');
        setUnlockCustomExpiry('');
      } else {
        setUnlockError(data?.message || 'API returned an error');
      }
    } catch (err) {
      setUnlockError(`Failed to update farm status: ${err.message}`);
    } finally {
      setUnlockLoading(false);
    }
  };
  // Mock farms data matching the HTML structure
  const [farms] = useState([
    {
      id: 1,
      farmName: 'Hebbal Block-A',
      farmId: '#F-4421',
      clientName: 'GreenField Agro',
      location: 'Bengaluru, KA',
      area: 420,
      crop: 'Banana',
      addedDate: '12 Jan 26',
      status: 'Active'
    },
    {
      id: 2,
      farmName: 'Coimbatore Plot-3',
      farmId: '#F-3892',
      clientName: 'Sunrise Farms',
      location: 'Coimbatore, TN',
      area: 680,
      crop: 'Sugarcane',
      addedDate: '8 Feb 26',
      status: 'Active'
    },
    {
      id: 3,
      farmName: 'Kurnool North',
      farmId: '#F-3671',
      clientName: 'Deccan Planters',
      location: 'Kurnool, AP',
      area: 900,
      crop: 'Drumstick',
      addedDate: '3 Mar 26',
      status: 'Pending'
    },
    {
      id: 4,
      farmName: 'Warangal East',
      farmId: '#F-3210',
      clientName: 'Kaveri Holdings',
      location: 'Warangal, TS',
      area: 350,
      crop: 'Paddy',
      addedDate: '15 Dec 25',
      status: 'Inactive'
    },
    {
      id: 5,
      farmName: 'Nashik Vineyard',
      farmId: '#F-4012',
      clientName: 'Vijaya FarmTech',
      location: 'Nashik, MH',
      area: 540,
      crop: 'Grapes',
      addedDate: '22 Feb 26',
      status: 'Active'
    }
  ]);

  const openModal = (modalType = 'quick-actions') => {
    setModalOpen(modalType);
  };

  const closeModal = () => {
    setModalOpen(false);
    setAssignError('');
    setAssignSuccess(false);
    setClientDetails(null);
    setRegisterDetails(null);
    setAssignFormData({
      client: '',
      addAcreage: '',
      plan: ' 1 month',
      expiryDate: '',
      notes: '',
      registerNumber: ''
    });
    setUnlockError('');
    setUnlockMessage('');
    setUnlockFarmId('');
    setUnlockStatus('unlock');
    setUnlockPaymentMode('cash');
    setUnlockExpiry('6');
    setUnlockCustomExpiry('');
  };

  const handleEditFarm = (farmId) => {
    console.log(`Edit farm ${farmId}`);
  };

  return (
    <div className="content-area" style={{backgroundColor: '#f8f7f4', minHeight: '100vh', padding: '0'}}>
      {/* Top Navigation Bar - Full Width */}
      <div className="topbar" style={{marginBottom: '16px', marginLeft: '0', marginRight: '0', backgroundColor: '#ffffff', borderBottom: '1px solid var(--border)', padding: '0 24px'}}>
        <div className="tb-left">
          <div>
            <div className="tb-page">Farm Management</div>
            <div className="tb-sub">Operations · Farms</div>
          </div>
        </div>
        <div className="tb-right">
          <div className="role-switcher">
            <span style={{fontSize: '10px', color: 'var(--text-3)', marginRight: '2px'}}>Role:</span>
            <button className={`role-btn ${currentRole === 'ops' ? 'active' : ''}`} onClick={() => handleRoleSwitch('ops')}>Ops</button>
            <button className={`role-btn ${currentRole === 'sales' ? 'active' : ''}`} onClick={() => handleRoleSwitch('sales')}>Sales</button>
            <button className={`role-btn ${currentRole === 'client' ? 'active' : ''}`} onClick={() => handleRoleSwitch('client')}>Client</button>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => openModal('quick-actions')}>+ new</button>
        </div>
      </div>

      {/* Section Header */}
      <div className="section-head" style={{padding: '0 24px'}}>
        <div className="section-title">Farm management</div>
        <button className="btn btn-primary" onClick={openModal}>+ Add farm</button>
      </div>

      {/* Metrics */}
      <div className="metrics" style={{gridTemplateColumns: 'repeat(3, 1fr)', padding: '0 24px'}}>
        <div className="metric metric-accent">
          <div className="metric-label">Total farms</div>
          <div className="metric-val">1,284</div>
          <div className="metric-sub">Across all clients</div>
        </div>
        <div className="metric">
          <div className="metric-label">Active farms</div>
          <div className="metric-val">1,246</div>
          <div className="metric-sub metric-up">97% active rate</div>
        </div>
        <div className="metric">
          <div className="metric-label">Pending review</div>
          <div className="metric-val">12</div>
          <div className="metric-sub metric-down">Needs action</div>
        </div>
      </div>

      {/* Farms Table */}
      <div className="card" style={{marginLeft: '24px', marginRight: '24px'}}>
        <div className="card-head">
          <span className="card-title">All farms</span>
          <div style={{display: 'flex', gap: '8px'}}>
            <div className="search-bar">
              <span className="search-icon">⌕</span>
              <input type="text" placeholder="Farm name, ID, client..."/>
            </div>
          </div>
        </div>
        <div className="tbl-wrap">
          <table>
            <thead>
              <tr>
                <th>Farm</th>
                <th>Client</th>
                <th>Location</th>
                <th>Area (ac)</th>
                <th>Crop</th>
                <th>Added</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {farms.map((farm) => (
                <tr key={farm.id}>
                  <td>
                    <div className="tbl-name">{farm.farmName}</div>
                    <div className="tbl-sub">{farm.farmId}</div>
                  </td>
                  <td>{farm.clientName}</td>
                  <td>{farm.location}</td>
                  <td>{farm.area}</td>
                  <td>{farm.crop}</td>
                  <td>{farm.addedDate}</td>
                  <td>
                    <span className={`badge ${
                      farm.status === 'Active' ? 'badge-green' : 
                      farm.status === 'Pending' ? 'badge-amber' : 
                      'badge-red'
                    }`}>
                      {farm.status}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="btn btn-ghost btn-sm" 
                      onClick={() => handleEditFarm(farm.id)}
                    >
                      Edit
                    </button>
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
                <button className="btn" style={{justifyContent: 'flex-start', textAlign: 'left'}} onClick={() => { closeModal(); openModal('add-farm-modal'); }}>
                  <span style={{marginRight: '8px'}}>+</span> Add new farm
                </button>
                <button className="btn" style={{justifyContent: 'flex-start', textAlign: 'left'}} onClick={() => { closeModal(); /* TODO: Add client modal */ }}>
                  <span style={{marginRight: '8px'}}>+</span> Add new client
                </button>
                <button className="btn" style={{justifyContent: 'flex-start', textAlign: 'left'}} onClick={() => { closeModal(); openModal('assign-acreage-modal'); }}>
                  <span style={{marginRight: '8px'}}>+</span> Assign acreage to client
                </button>
                <button className="btn" style={{justifyContent: 'flex-start', textAlign: 'left'}} onClick={() => { closeModal(); onPageChange('client-team'); }}>
                  <span style={{marginRight: '8px'}}>+</span> Add manager to team
                </button>
                <button className="btn" style={{justifyContent: 'flex-start', textAlign: 'left'}} onClick={() => { closeModal(); onPageChange('client-alloc'); }}>
                  <span style={{marginRight: '8px'}}>+</span> Allocate acreage to manager
                </button>
                <button className="btn" style={{justifyContent: 'flex-start', textAlign: 'left'}} onClick={() => { closeModal(); openModal('unlock-farm-modal'); }}>
                  <span style={{marginRight: '8px'}}>+</span> Unlock farm
                </button>
                <button className="btn" style={{justifyContent: 'flex-start', textAlign: 'left'}} onClick={() => { closeModal(); /* TODO: Add registration modal */ }}>
                  <span style={{marginRight: '8px'}}>+</span> Add new registration
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add New Farm Modal */}
      {modalOpen === 'add-farm-modal' && (
        <div className="modal-overlay">
          <div className="modal" style={{width: '600px', maxWidth: '90vw'}}>
            <div className="modal-head">
              <h3>Add new farm</h3>
              <button className="btn btn-ghost btn-sm" onClick={closeModal}>
                <X className="ic-xs" />
              </button>
            </div>
            <div className="modal-body">
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
                <div className="form-group">
                  <label>Farm name</label>
                  <input type="text" placeholder="e.g. Hebbal Block-B" />
                </div>
                <div className="form-group">
                  <label>Farm ID (auto)</label>
                  <input type="text" placeholder="#F-XXXX" disabled />
                </div>
                <div className="form-group">
                  <label>Client</label>
                  <select>
                    <option>GreenField Agro</option>
                    <option>Sunrise Farms</option>
                    <option>Deccan Planters</option>
                    <option>Kaveri Holdings</option>
                    <option>Vijaya FarmTech</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>State</label>
                  <select>
                    <option>Karnataka</option>
                    <option>Tamil Nadu</option>
                    <option>Andhra Pradesh</option>
                    <option>Maharashtra</option>
                    <option>Telangana</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>District</label>
                  <input type="text" placeholder="Bengaluru Urban" />
                </div>
                <div className="form-group">
                  <label>Village / Taluk</label>
                  <input type="text" placeholder="Hebbal" />
                </div>
                <div className="form-group">
                  <label>Area (acres)</label>
                  <input type="number" placeholder="400" />
                </div>
                <div className="form-group">
                  <label>Primary crop</label>
                  <select>
                    <option>Banana</option>
                    <option>Paddy</option>
                    <option>Sugarcane</option>
                    <option>Drumstick</option>
                    <option>Papaya</option>
                    <option>Grapes</option>
                  </select>
                </div>
                <div className="form-group" style={{gridColumn: 'span 2'}}>
                  <label>GPS coordinates (optional)</label>
                  <input type="text" placeholder="12.9716, 77.5946" />
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={closeModal}>Cancel</button>
              <button className="btn btn-primary">Add farm</button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Acreage Modal */}
      {modalOpen === 'assign-acreage-modal' && (
        <div className="modal-overlay">
          <div className="modal" style={{width: '600px', maxWidth: '90vw'}}>
            <div className="modal-head">
              <h3>Assign acreage to client</h3>
              <button className="btn btn-ghost btn-sm" onClick={closeModal}>
                <X className="ic-xs" />
              </button>
            </div>
            <div className="modal-body">
              {assignError && (
                <div className="alert alert-danger" style={{marginBottom: '16px', padding: '10px', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '6px'}}>
                  {assignError}
                </div>
              )}
              {assignSuccess ? (
                <div style={{textAlign: 'center', padding: '20px'}}>
                  <div style={{fontSize: '48px', marginBottom: '16px'}}>✅</div>
                  <h3 style={{marginBottom: '8px'}}>Acreage Assigned Successfully!</h3>
                  <p style={{color: 'var(--text-2)'}}>The acreage has been assigned to the client.</p>
                </div>
              ) : (
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
                  <div className="form-group">
                    <label>Client ID</label>
                    <input type="text" name="client" value={assignFormData.client} onChange={handleAssignInputChange} placeholder="e.g. 343" />
                    {fetchingClient && <div style={{fontSize: '12px', color: '#666', marginTop: '4px'}}>Loading client details...</div>}
                    {clientDetails && !fetchingClient && (
                      <div style={{backgroundColor: '#f0fdf4', border: '1px solid #86efac', borderRadius: '6px', padding: '12px', marginTop: '8px'}}>
                        <div style={{fontSize: '14px', fontWeight: '600', color: '#166534', marginBottom: '8px'}}>Client Details</div>
                        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '13px', marginBottom: '8px'}}>
                          <div><span style={{color: '#666'}}>Client Id:</span> <strong>{clientDetails.clientId}</strong></div>
                          <div><span style={{color: '#666'}}>Company:</span> <strong>{clientDetails.company}</strong></div>
                        </div>
                        <div style={{display: 'flex', gap: '16px', fontSize: '13px', flexWrap: 'wrap'}}>
                          <div><span style={{color: '#666'}}>Allocated Area:</span> <strong>{clientDetails.allocateArea.toFixed(2)} ac</strong></div>
                          <div><span style={{color: '#666'}}>Used Area:</span> <strong>{clientDetails.usedArea.toFixed(2)} ac</strong></div>
                          <div><span style={{color: '#666'}}>Available Area:</span> <strong>{clientDetails.availableArea.toFixed(2)} ac</strong></div>
                          <div><span style={{color: '#666'}}>Total Area:</span> <strong>{clientDetails.totalArea.toFixed(2)} ac</strong></div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Register Number</label>
                    <input type="text" name="registerNumber" value={assignFormData.registerNumber} onChange={handleAssignInputChange} placeholder="e.g. REG-001" />
                    {fetchingRegister && <div style={{fontSize: '12px', color: '#666', marginTop: '4px'}}>Loading register details...</div>}
                    {registerDetails && !fetchingRegister && (
                      <div style={{backgroundColor: '#f0fdf4', border: '1px solid #86efac', borderRadius: '6px', padding: '12px', marginTop: '8px'}}>
                        <div style={{fontSize: '14px', fontWeight: '600', color: '#166534', marginBottom: '8px'}}>Register Details</div>
                        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '13px', marginBottom: '8px'}}>
                          <div><span style={{color: '#666'}}>Registered Id:</span> <strong>{registerDetails.registerId}</strong></div>
                          <div><span style={{color: '#666'}}>Client Id:</span> <strong>{registerDetails.clientId}</strong></div>
                        </div>
                        <div style={{display: 'flex', gap: '16px', fontSize: '13px', flexWrap: 'wrap'}}>
                          <div><span style={{color: '#666'}}>Allocated Area:</span> <strong>{registerDetails.allocateArea.toFixed(2)} ac</strong></div>
                          <div><span style={{color: '#666'}}>Used Area:</span> <strong>{registerDetails.usedArea.toFixed(2)} ac</strong></div>
                          <div><span style={{color: '#666'}}>Available Area:</span> <strong>{registerDetails.availableArea.toFixed(2)} ac</strong></div>
                          <div><span style={{color: '#666'}}>Total Area:</span> <strong>{registerDetails.totalArea.toFixed(2)} ac</strong></div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Add acreage (ac) *</label>
                    <input type="number" name="addAcreage" value={assignFormData.addAcreage} onChange={handleAssignInputChange} placeholder="e.g. 1000" required />
                  </div>
                  <div className="form-group">
                    <label>Plan</label>
                    <select name="plan" value={assignFormData.plan} onChange={handleAssignInputChange}>
                      <option> 1 month</option>
                      <option> 6 month</option>
                      <option>12 month</option>
                    </select>
                  </div>
                  <div className="form-group" style={{gridColumn: 'span 2'}}>
                    <label>Expiry date *</label>
                    <input type="date" name="expiryDate" value={assignFormData.expiryDate} onChange={handleAssignInputChange} required />
                  </div>
                  <div className="form-group" style={{gridColumn: 'span 2'}}>
                    <label>Notes</label>
                    <textarea name="notes" value={assignFormData.notes} onChange={handleAssignInputChange} placeholder="Reason for assignment, sales deal reference..." style={{minHeight: '80px'}} />
                  </div>
                </div>
              )}
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={closeModal}>Cancel</button>
              {!assignSuccess && (
                <button className="btn btn-primary" onClick={handleAssignAcreage} disabled={assignLoading}>
                  {assignLoading ? 'Assigning...' : 'Assign'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Unlock Farm Modal */}
      {modalOpen === 'unlock-farm-modal' && (
        <div className="modal-overlay">
          <div className="modal" style={{width: '500px', maxWidth: '90vw'}}>
            <div className="modal-head">
              <h3>Unlock Farm</h3>
              <button className="btn btn-ghost btn-sm" onClick={closeModal}>
                <X className="ic-xs" />
              </button>
            </div>
            <div className="modal-body">
              <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
                <div className="form-group">
                  <label>Farm ID</label>
                  <input type="text" value={unlockFarmId} onChange={(e) => setUnlockFarmId(e.target.value)} placeholder="Enter Farm ID" />
                </div>
                <div className="form-group">
                  <label>Lock Status</label>
                  <select value={unlockStatus} onChange={(e) => setUnlockStatus(e.target.value)}>
                    <option value="unlock">Unlock</option>
                    <option value="lock">Lock</option>
                  </select>
                </div>
                {unlockStatus === 'unlock' ? (
                  <>
                    <div className="form-group">
                      <label>Mode</label>
                      <select value={unlockPaymentMode} onChange={(e) => setUnlockPaymentMode(e.target.value)}>
                        <option value="cash">Cash</option>
                        <option value="card">Card</option>
                        <option value="upi">UPI</option>
                        <option value="netbanking">Netbanking</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Expiry (in months)</label>
                      <select value={unlockExpiry} onChange={(e) => setUnlockExpiry(e.target.value)}>
                        <option value="1">1</option>
                        <option value="6">6</option>
                        <option value="12">12</option>
                        <option value="other">Other</option>
                      </select>
                      {unlockExpiry === 'other' && (
                        <input type="text" value={unlockCustomExpiry} onChange={(e) => setUnlockCustomExpiry(e.target.value)} placeholder="Enter custom expiry (e.g. 2)" style={{marginTop: '8px'}} />
                      )}
                    </div>
                  </>
                ) : (
                  <p style={{fontSize: '13px', color: 'var(--text-2)', fontStyle: 'italic'}}>No payment/expiry required for lock.</p>
                )}
                {unlockError && (
                  <div className="alert alert-danger" style={{padding: '10px', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '6px', fontSize: '13px'}}>
                    {unlockError}
                  </div>
                )}
                {unlockMessage && (
                  <div className="alert alert-success" style={{padding: '10px', backgroundColor: '#dcfce7', color: '#16a34a', borderRadius: '6px', fontSize: '13px'}}>
                    {unlockMessage}
                  </div>
                )}
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={closeModal}>Cancel</button>
              <button className="btn btn-primary" onClick={handleUnlockFarm} disabled={unlockLoading}>
                {unlockLoading ? 'Processing...' : 'Update Status'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
