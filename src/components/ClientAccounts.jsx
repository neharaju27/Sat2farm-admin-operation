import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const API_URL = import.meta.env.VITE_UPDATE_LIMIT_AREA_API_URL;
const FETCH_CLIENT_API_URL = import.meta.env.VITE_FETCH_UNIT_LIMIT_API_URL;

export default function ClientAccounts({ user, onPageChange }) {
  // Set currentRole based on actual user role
  const [currentRole, setCurrentRole] = useState(() => {
    const userRole = user?.role || user?.user_role || user?.type || 'ops';
    return userRole.toLowerCase();
  });
  const [modalOpen, setModalOpen] = useState(null);

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
  const [searchType, setSearchType] = useState('clientId');
  const [registerDetails, setRegisterDetails] = useState(null);
  const [fetchingRegister, setFetchingRegister] = useState(false);

  // State for Unlock Farm modal
  const [unlockFarmId, setUnlockFarmId] = useState('');
  const [unlockStatus, setUnlockStatus] = useState('unlock');
  const [unlockPaymentMode, setUnlockPaymentMode] = useState('cash');
  const [unlockExpiry, setUnlockExpiry] = useState('6');
  const [unlockCustomExpiry, setUnlockCustomExpiry] = useState('');

  // State for Add Client modal
  const [newClientFormData, setNewClientFormData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    state: 'Karnataka',
    plan: 'Trial',
    initialAcreage: ''
  });
  const [newClientLoading, setNewClientLoading] = useState(false);
  const [newClientError, setNewClientError] = useState('');
  const [newClientSuccess, setNewClientSuccess] = useState(false);
  const [unlockLoading, setUnlockLoading] = useState(false);
  const [unlockError, setUnlockError] = useState('');
  const [unlockMessage, setUnlockMessage] = useState('');

  const openModal = (modalType) => {
    setModalOpen(modalType);
  };

  const closeModal = () => {
    setModalOpen(null);
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
    setNewClientFormData({
      companyName: '',
      contactName: '',
      email: '',
      phone: '',
      state: 'Karnataka',
      plan: 'Trial',
      initialAcreage: ''
    });
    setNewClientError('');
    setNewClientSuccess(false);
  };

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
  // Mock client accounts data
  const [clients] = useState([
    {
      id: 1,
      clientName: 'GreenField Agro',
      clientInitial: 'GF',
      clientId: '#C-1042',
      state: 'Karnataka',
      contact: 'ravi@greenfield.in',
      plan: 'Enterprise',
      acreage: 8400,
      farms: 12,
      managers: 3,
      status: 'Active'
    },
    {
      id: 2,
      clientName: 'Sunrise Farms',
      clientInitial: 'SR',
      clientId: '#C-0887',
      state: 'Tamil Nadu',
      contact: 'info@sunrise.farm',
      plan: 'Growth',
      acreage: 6200,
      farms: 8,
      managers: 2,
      status: 'Active'
    },
    {
      id: 3,
      clientName: 'Deccan Planters',
      clientInitial: 'DP',
      clientId: '#C-0994',
      state: 'AP',
      contact: 'ops@deccan.in',
      plan: 'Starter',
      acreage: 5100,
      farms: 21,
      managers: 1,
      status: 'Quota full'
    },
    {
      id: 4,
      clientName: 'Kaveri Holdings',
      clientInitial: 'KH',
      clientId: '#C-0712',
      state: 'Telangana',
      contact: 'admin@kaveri.co',
      plan: 'Trial',
      acreage: 4800,
      farms: 8,
      managers: 1,
      status: 'Trial'
    }
  ]);

  const getPlanBadgeClass = (plan) => {
    switch(plan) {
      case 'Enterprise': return 'badge-green';
      case 'Growth': return 'badge-blue';
      case 'Starter': return 'badge-amber';
      case 'Trial': return 'badge-blue';
      default: return 'badge-gray';
    }
  };

  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'Active': return 'badge-green';
      case 'Quota full': return 'badge-amber';
      case 'Trial': return 'badge-blue';
      default: return 'badge-gray';
    }
  };

  const handleNewClient = () => {
    openModal('add-client-modal');
  };

  const handleNewClientInputChange = (e) => {
    const { name, value } = e.target;
    setNewClientFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateClient = async () => {
    if (!newClientFormData.companyName || !newClientFormData.email || !newClientFormData.phone) {
      setNewClientError('Please fill in all required fields');
      return;
    }
    setNewClientLoading(true);
    setNewClientError('');
    try {
      // API call would go here
      setNewClientSuccess(true);
      setTimeout(() => {
        closeModal();
        setNewClientSuccess(false);
        setNewClientFormData({
          companyName: '',
          contactName: '',
          email: '',
          phone: '',
          state: 'Karnataka',
          plan: 'Trial',
          initialAcreage: ''
        });
      }, 2000);
    } catch (error) {
      setNewClientError(error.message);
    } finally {
      setNewClientLoading(false);
    }
  };

  const handleAssignInputChange = (e) => {
    const { name, value } = e.target;
    setAssignFormData(prev => ({ ...prev, [name]: value }));
  };

  const fetchClientDetails = async (clientId) => {
    if (!clientId) return;
    setFetchingClient(true);
    try {
      const response = await fetch(`${FETCH_CLIENT_API_URL}?client_id=${clientId}`);
      const data = await response.json();
      if (response.ok && data) {
        setClientDetails({
          clientId: data.client_id || clientId,
          company: data.company || data.full_name || data.name || 'N/A',
          allocateArea: data.allocate_area || 0,
          usedArea: data.used_area || 0,
          availableArea: data.available_area || 0,
          totalArea: data.total_area || 0
        });
      }
    } catch (error) {
      console.error('Error fetching client details:', error);
    } finally {
      setFetchingClient(false);
    }
  };

  const fetchRegisterDetails = async (registerNumber) => {
    if (!registerNumber) return;
    setFetchingRegister(true);
    try {
      const response = await fetch(`${FETCH_CLIENT_API_URL}?username=${registerNumber}`);
      const data = await response.json();
      if (response.ok && data) {
        setRegisterDetails({
          registerId: registerNumber,
          clientId: data.client_id || 'N/A',
          company: data.company || data.full_name || data.name || 'N/A',
          allocateArea: data.allocate_area || 0,
          usedArea: data.used_area || 0,
          availableArea: data.available_area || 0,
          totalArea: data.total_area || 0
        });
      }
    } catch (error) {
      console.error('Error fetching register details:', error);
    } finally {
      setFetchingRegister(false);
    }
  };

  // Fetch client details when client ID changes
  useEffect(() => {
    if (searchType === 'clientId' && assignFormData.client) {
      const timeoutId = setTimeout(() => {
        fetchClientDetails(assignFormData.client);
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [assignFormData.client, searchType]);

  // Fetch register details when register number changes
  useEffect(() => {
    if (searchType === 'registerNumber' && assignFormData.registerNumber) {
      const timeoutId = setTimeout(() => {
        fetchRegisterDetails(assignFormData.registerNumber);
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [assignFormData.registerNumber, searchType]);

  const handleAssignAcreage = async () => {
    if (!assignFormData.addAcreage || !assignFormData.expiryDate) {
      setAssignError('Please fill in all required fields');
      return;
    }
    setAssignLoading(true);
    setAssignError('');
    try {
      const clientID = searchType === 'clientId' ? assignFormData.client : registerDetails?.clientId;
      if (!clientID) {
        setAssignError('Please enter a valid Client ID or Register Number');
        setAssignLoading(false);
        return;
      }
      const date = new Date(assignFormData.expiryDate);
      const formattedDate = `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
      const apiUrl = `${API_URL}?clientID=${clientID}&acreage=${assignFormData.addAcreage}&date_of_expiry=${formattedDate}`;
      const response = await fetch(apiUrl, { method: 'GET' });
      if (!response.ok) throw new Error('API error');
      const data = await response.json();
      if (data.status === 'Success') {
        setAssignSuccess(true);
        setAssignFormData({ client: '', addAcreage: '', plan: ' 1 month', expiryDate: '', notes: '', registerNumber: '' });
        setClientDetails(null);
        setRegisterDetails(null);
        setSearchType('clientId');
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
    if (!unlockFarmId) {
      setUnlockError('Please enter Farm ID');
      return;
    }
    setUnlockLoading(true);
    setUnlockError('');
    setUnlockMessage('');
    try {
      const expiryMonths = unlockExpiry === 'custom' ? unlockCustomExpiry : unlockExpiry;
      const apiUrl = `${import.meta.env.VITE_UNLOCK_FARM_API_URL}?farm_id=${unlockFarmId}&farm_lock=${unlockStatus === 'unlock' ? 'No' : 'Yes'}&date_of_expiry=${expiryMonths}&payment_mode=${unlockPaymentMode}`;
      const response = await fetch(apiUrl, { method: 'GET' });
      const data = await response.json();
      if (data.status === 'Success') {
        setUnlockMessage(`Farm ${unlockStatus === 'unlock' ? 'unlocked' : 'locked'} successfully!`);
        setTimeout(() => {
          closeModal();
        }, 2000);
      } else {
        setUnlockError(data.message || `Failed to ${unlockStatus} farm`);
      }
    } catch (error) {
      setUnlockError(error.message);
    } finally {
      setUnlockLoading(false);
    }
  };

  return (
    <div className="content-area" style={{backgroundColor: '#f8f7f4', minHeight: '100vh', padding: '0'}}>
      {/* Top Navigation Bar - Full Width */}
      <div className="topbar" style={{marginBottom: '16px', marginLeft: '0', marginRight: '0', backgroundColor: '#ffffff', borderBottom: '1px solid var(--border)', padding: '0 24px'}}>
        <div className="tb-left">
          <div>
            <div className="tb-page">Client Accounts</div>
            <div className="tb-sub">Sales · CRM</div>
          </div>
        </div>
        <div className="tb-right">
          <div className="role-switcher">
            <span style={{fontSize: '10px', color: 'var(--text-3)', marginRight: '2px'}}>Role:</span>
            <button className={`role-btn ${currentRole === 'ops' ? 'active' : ''}`} onClick={() => handleRoleSwitch('ops')}>Ops</button>
            <button className={`role-btn ${currentRole === 'sales' ? 'active' : ''}`} onClick={() => handleRoleSwitch('sales')}>Sales</button>
            <button className={`role-btn ${currentRole === 'partner' ? 'active' : ''}`} onClick={() => handleRoleSwitch('partner')}>Partner</button>
            <button className={`role-btn ${currentRole === 'client' ? 'active' : ''}`} onClick={() => handleRoleSwitch('client')}>Client</button>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => openModal('quick-actions')}>+ New</button>
        </div>
      </div>

      {/* Section Header */}
      <div className="section-head" style={{padding: '0 24px'}}>
        <div className="section-title">Client accounts</div>
        <button className="btn btn-primary" onClick={handleNewClient}>+ New client</button>
      </div>

      {/* Client Accounts Table */}
      <div className="card" style={{marginLeft: '24px', marginRight: '24px'}}>
        <div className="card-head">
          <span className="card-title">All accounts</span>
          <div className="search-bar">
            <span className="search-icon">⌕</span>
            <input type="text" placeholder="Search..."/>
          </div>
        </div>
        <div className="tbl-wrap">
          <table>
            <thead>
              <tr>
                <th>Client</th>
                <th>Contact</th>
                <th>Plan</th>
                <th>Acreage (ac)</th>
                <th>Farms</th>
                <th>Managers</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client.id}>
                  <td>
                    <div className="flex-cell">
                      <div className="avatar-sm">{client.clientInitial}</div>
                      <div>
                        <div className="tbl-name">{client.clientName}</div>
                        <div className="tbl-sub">{client.clientId} · {client.state}</div>
                      </div>
                    </div>
                  </td>
                  <td>{client.contact}</td>
                  <td>
                    <span className={`badge ${getPlanBadgeClass(client.plan)}`}>
                      {client.plan}
                    </span>
                  </td>
                  <td>{client.acreage}</td>
                  <td>{client.farms}</td>
                  <td>{client.managers}</td>
                  <td>
                    <span className={`badge ${getStatusBadgeClass(client.status)}`}>
                      {client.status}
                    </span>
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
                <button className="btn" style={{justifyContent: 'flex-start', textAlign: 'left'}} onClick={() => { closeModal(); openModal('add-client-modal'); }}>
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
                <button className="btn" style={{justifyContent: 'flex-start', textAlign: 'left'}} onClick={() => { closeModal(); openModal('add-registration-modal'); }}>
                  <span style={{marginRight: '8px'}}>+</span> Add new registration
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Add New Client Modal */}
      {modalOpen === 'add-client-modal' && (
        <div className="modal-overlay">
          <div className="modal" style={{width: '600px', maxWidth: '90vw'}}>
            <div className="modal-head">
              <h3>Add new client</h3>
              <button className="btn btn-ghost btn-sm" onClick={closeModal}>
                <X className="ic-xs" />
              </button>
            </div>
            <div className="modal-body">
              {newClientError && (
                <div className="alert alert-danger" style={{marginBottom: '16px', padding: '10px', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '6px'}}>
                  {newClientError}
                </div>
              )}
              {newClientSuccess ? (
                <div style={{textAlign: 'center', padding: '20px'}}>
                  <div style={{fontSize: '48px', marginBottom: '16px'}}>✅</div>
                  <h3 style={{marginBottom: '8px'}}>Client Created Successfully!</h3>
                  <p style={{color: 'var(--text-2)'}}>The new client has been added to the system.</p>
                </div>
              ) : (
                <div style={{display: 'grid', gridTemplateColumns: '1fr', gap: '16px'}}>
                  <div className="form-group">
                    <label>Company name</label>
                    <input type="text" name="companyName" value={newClientFormData.companyName} onChange={handleNewClientInputChange} placeholder="e.g. Agro Holdings Ltd" required />
                  </div>
                  <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
                    <div className="form-group">
                      <label>Contact name</label>
                      <input type="text" name="contactName" value={newClientFormData.contactName} onChange={handleNewClientInputChange} placeholder="Full name" />
                    </div>
                    <div className="form-group">
                      <label>Email</label>
                      <input type="email" name="email" value={newClientFormData.email} onChange={handleNewClientInputChange} placeholder="contact@company.in" required />
                    </div>
                  </div>
                  <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
                    <div className="form-group">
                      <label>Phone</label>
                      <input type="tel" name="phone" value={newClientFormData.phone} onChange={handleNewClientInputChange} placeholder="+91 XXXXX XXXXX" required />
                    </div>
                    <div className="form-group">
                      <label>State</label>
                      <select name="state" value={newClientFormData.state} onChange={handleNewClientInputChange}>
                        <option value="Karnataka">Karnataka</option>
                        <option value="Tamil Nadu">Tamil Nadu</option>
                        <option value="Andhra Pradesh">Andhra Pradesh</option>
                        <option value="Telangana">Telangana</option>
                        <option value="Maharashtra">Maharashtra</option>
                        <option value="Gujarat">Gujarat</option>
                        <option value="Rajasthan">Rajasthan</option>
                        <option value="Madhya Pradesh">Madhya Pradesh</option>
                      </select>
                    </div>
                  </div>
                  <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
                    <div className="form-group">
                      <label>Plan</label>
                      <select name="plan" value={newClientFormData.plan} onChange={handleNewClientInputChange}>
                        <option value="Trial">Trial</option>
                        <option value="Starter">Starter</option>
                        <option value="Growth">Growth</option>
                        <option value="Enterprise">Enterprise</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Initial acreage (ac)</label>
                      <input type="number" name="initialAcreage" value={newClientFormData.initialAcreage} onChange={handleNewClientInputChange} placeholder="1000" />
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={closeModal}>Cancel</button>
              {!newClientSuccess && (
                <button className="btn btn-primary" onClick={handleCreateClient} disabled={newClientLoading}>
                  {newClientLoading ? 'Creating...' : 'Create client'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Assign Acreage Modal */}
      {modalOpen === 'assign-acreage-modal' && (
        <div className="modal-overlay">
          <div className="modal" style={{width: '700px', maxWidth: '90vw'}}>
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
                <>
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
                            setAssignFormData(prev => ({ ...prev, client: '', registerNumber: '' }));
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
                            setAssignFormData(prev => ({ ...prev, client: '', registerNumber: '' }));
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
                      <input type="text" name="client" value={assignFormData.client} onChange={handleAssignInputChange} placeholder="e.g. 343" />
                      {fetchingClient && <div style={{fontSize: '12px', color: '#666', marginTop: '4px'}}>Loading client details...</div>}
                    </div>
                  ) : (
                    <div className="form-group" style={{marginBottom: '16px'}}>
                      <label>Registered Number</label>
                      <input type="text" name="registerNumber" value={assignFormData.registerNumber} onChange={handleAssignInputChange} placeholder="e.g. 9963758295" />
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
                          <tr style={{borderBottom: '1px solid #bbf7d0'}}>
                            <td style={{padding: '10px 0', color: '#374151', fontWeight: '500'}}>Company</td>
                            <td style={{padding: '10px 0', fontWeight: '600', color: '#1f2937'}}>{clientDetails.company}</td>
                          </tr>
                          <tr style={{borderBottom: '1px solid #bbf7d0'}}>
                            <td style={{padding: '10px 0', color: '#374151', fontWeight: '500'}}>Allocated Area</td>
                            <td style={{padding: '10px 0', fontWeight: '600', color: '#1f2937'}}>{clientDetails.allocateArea?.toFixed(2)} ac</td>
                          </tr>
                          <tr style={{borderBottom: '1px solid #bbf7d0'}}>
                            <td style={{padding: '10px 0', color: '#374151', fontWeight: '500'}}>Used Area</td>
                            <td style={{padding: '10px 0', fontWeight: '600', color: '#1f2937'}}>{clientDetails.usedArea?.toFixed(2)} ac</td>
                          </tr>
                          <tr style={{borderBottom: '1px solid #bbf7d0'}}>
                            <td style={{padding: '10px 0', color: '#374151', fontWeight: '500'}}>Available Area</td>
                            <td style={{padding: '10px 0', fontWeight: '600', color: '#1f2937'}}>{clientDetails.availableArea?.toFixed(2)} ac</td>
                          </tr>
                          <tr>
                            <td style={{padding: '10px 0', color: '#374151', fontWeight: '500'}}>Total Area</td>
                            <td style={{padding: '10px 0', fontWeight: '600', color: '#1f2937'}}>{clientDetails.totalArea?.toFixed(2)} ac</td>
                          </tr>
                        </tbody>
                      </table>
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
                          <tr style={{borderBottom: '1px solid #bbf7d0'}}>
                            <td style={{padding: '10px 0', color: '#374151', fontWeight: '500'}}>Company</td>
                            <td style={{padding: '10px 0', fontWeight: '600', color: '#1f2937'}}>{registerDetails.company}</td>
                          </tr>
                          <tr style={{borderBottom: '1px solid #bbf7d0'}}>
                            <td style={{padding: '10px 0', color: '#374151', fontWeight: '500'}}>Allocated Area</td>
                            <td style={{padding: '10px 0', fontWeight: '600', color: '#1f2937'}}>{registerDetails.allocateArea?.toFixed(2)} ac</td>
                          </tr>
                          <tr style={{borderBottom: '1px solid #bbf7d0'}}>
                            <td style={{padding: '10px 0', color: '#374151', fontWeight: '500'}}>Used Area</td>
                            <td style={{padding: '10px 0', fontWeight: '600', color: '#1f2937'}}>{registerDetails.usedArea?.toFixed(2)} ac</td>
                          </tr>
                          <tr style={{borderBottom: '1px solid #bbf7d0'}}>
                            <td style={{padding: '10px 0', color: '#374151', fontWeight: '500'}}>Available Area</td>
                            <td style={{padding: '10px 0', fontWeight: '600', color: '#1f2937'}}>{registerDetails.availableArea?.toFixed(2)} ac</td>
                          </tr>
                          <tr>
                            <td style={{padding: '10px 0', color: '#374151', fontWeight: '500'}}>Total Area</td>
                            <td style={{padding: '10px 0', fontWeight: '600', color: '#1f2937'}}>{registerDetails.totalArea?.toFixed(2)} ac</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}

                  <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
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
                </>
              )}
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={closeModal}>Cancel</button>
              {!assignSuccess && (
                <button className="btn btn-primary" onClick={handleAssignAcreage} disabled={assignLoading}>
                  {assignLoading ? 'Assigning...' : 'Assign Acreage'}
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
              <h3>Unlock/Lock Farm</h3>
              <button className="btn btn-ghost btn-sm" onClick={closeModal}>
                <X className="ic-xs" />
              </button>
            </div>
            <div className="modal-body">
              {unlockError && (
                <div className="alert alert-danger" style={{marginBottom: '16px', padding: '10px', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '6px'}}>
                  {unlockError}
                </div>
              )}
              {unlockMessage && (
                <div className="alert alert-success" style={{marginBottom: '16px', padding: '10px', backgroundColor: '#f0fdf4', color: '#166534', borderRadius: '6px'}}>
                  {unlockMessage}
                </div>
              )}
              <div className="form-group" style={{marginBottom: '16px'}}>
                <label>Farm ID *</label>
                <input type="text" value={unlockFarmId} onChange={(e) => setUnlockFarmId(e.target.value)} placeholder="Enter farm ID" />
              </div>
              <div className="form-group" style={{marginBottom: '16px'}}>
                <label>Status</label>
                <select value={unlockStatus} onChange={(e) => setUnlockStatus(e.target.value)}>
                  <option value="unlock">Unlock</option>
                  <option value="lock">Lock</option>
                </select>
              </div>
              <div className="form-group" style={{marginBottom: '16px'}}>
                <label>Payment Mode</label>
                <select value={unlockPaymentMode} onChange={(e) => setUnlockPaymentMode(e.target.value)}>
                  <option value="cash">Cash</option>
                  <option value="online">Online</option>
                </select>
              </div>
              <div className="form-group" style={{marginBottom: '16px'}}>
                <label>Expiry (months)</label>
                <select value={unlockExpiry} onChange={(e) => setUnlockExpiry(e.target.value)}>
                  <option value="1">1 month</option>
                  <option value="3">3 months</option>
                  <option value="6">6 months</option>
                  <option value="12">12 months</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              {unlockExpiry === 'custom' && (
                <div className="form-group" style={{marginBottom: '16px'}}>
                  <label>Custom Expiry (months)</label>
                  <input type="number" value={unlockCustomExpiry} onChange={(e) => setUnlockCustomExpiry(e.target.value)} placeholder="Enter number of months" />
                </div>
              )}
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={closeModal}>Cancel</button>
              <button className="btn btn-primary" onClick={handleUnlockFarm} disabled={unlockLoading}>
                {unlockLoading ? 'Processing...' : unlockStatus === 'unlock' ? 'Unlock Farm' : 'Lock Farm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
