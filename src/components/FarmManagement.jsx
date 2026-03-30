import { useState } from 'react';
import { X } from 'lucide-react';

export default function FarmManagement({ user, onPageChange }) {
  const [currentRole, setCurrentRole] = useState('ops');
  const [modalOpen, setModalOpen] = useState(false);

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
                <button className="btn" style={{justifyContent: 'flex-start', textAlign: 'left'}} onClick={() => { closeModal(); onPageChange('sales-acreage'); }}>
                  <span style={{marginRight: '8px'}}>+</span> Assign acreage to client
                </button>
                <button className="btn" style={{justifyContent: 'flex-start', textAlign: 'left'}} onClick={() => { closeModal(); onPageChange('client-team'); }}>
                  <span style={{marginRight: '8px'}}>+</span> Add manager to team
                </button>
                <button className="btn" style={{justifyContent: 'flex-start', textAlign: 'left'}} onClick={() => { closeModal(); onPageChange('client-alloc'); }}>
                  <span style={{marginRight: '8px'}}>+</span> Allocate acreage to manager
                </button>
                <button className="btn" style={{justifyContent: 'flex-start', textAlign: 'left'}} onClick={() => { closeModal(); onPageChange('unlock-farm'); }}>
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
    </div>
  );
}
