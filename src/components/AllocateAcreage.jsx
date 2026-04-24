import { useState } from 'react';
import { X } from 'lucide-react';

export default function AllocateAcreage({ user, onPageChange }) {
  // Set currentRole based on actual user role
  const [currentRole, setCurrentRole] = useState(() => {
    const userRole = user?.role || user?.user_role || user?.type || 'ops';
    return userRole.toLowerCase();
  });
  const [modalOpen, setModalOpen] = useState(null);

  const openModal = (modalType) => {
    setModalOpen(modalType);
  };

  const closeModal = () => {
    setModalOpen(null);
  };

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
  // Mock acreage pool data
  const [acreagePool] = useState({
    totalAssigned: 8400,
    allocatedToManagers: 6200,
    unallocated: 2200
  });

  // Mock manager allocations
  const [managerAllocations] = useState([
    {
      id: 1,
      managerName: 'Ravi Shankar',
      acreage: 2400,
      color: 'var(--green-500)'
    },
    {
      id: 2,
      managerName: 'Priya Nair',
      acreage: 2100,
      color: 'var(--green-400)'
    },
    {
      id: 3,
      managerName: 'Manoj Kumar',
      acreage: 1700,
      color: 'var(--green-200)'
    }
  ]);

  // Mock transfer form data
  const [transferData, setTransferData] = useState({
    fromManager: '',
    toManager: '',
    acreage: '',
    reason: ''
  });

  const handleAllocateAcreage = () => {
    console.log('Allocate acreage');
  };

  const handleTransfer = () => {
    console.log('Transfer acreage', transferData);
  };

  const getTotalWidth = () => {
    return managerAllocations.reduce((total, manager) => total + manager.acreage, 0);
  };

  const getPercentageWidth = (acreage) => {
    const total = getTotalWidth();
    return total > 0 ? (acreage / total) * 100 : 0;
  };

  return (
    <div className="content-area" style={{backgroundColor: '#f8f7f4',  minHeight: '100vh', padding: '0'}}>
      {/* Top Navigation Bar - Full Width */}
      <div className="topbar" style={{marginBottom: '16px', marginLeft: '0', marginRight: '0', backgroundColor: '#ffffff', borderBottom: '1px solid var(--border)', padding: '0 24px'}}>
        <div className="tb-left">
          <div>
            <div className="tb-page">Allocate Acreage</div>
            <div className="tb-sub">Client · GreenField Agro</div>
          </div>
        </div>
        <div className="tb-right">
          <div className="role-switcher">
            <span style={{fontSize: '10px', color: 'var(--text-3)', marginRight: '2px'}}>Role:</span>
            <button className={`role-btn ${currentRole === 'ops' ? 'active' : ''}`} onClick={() => handleRoleSwitch('ops')}>Ops</button>
            <button className={`role-btn ${currentRole === 'sales' ? 'active' : ''}`} onClick={() => handleRoleSwitch('sales')}>Sales</button>
            <button className={`role-btn ${currentRole === 'client' ? 'active' : ''}`} onClick={() => handleRoleSwitch('client')}>Client</button>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => openModal('quick-actions')}>+ New</button>
        </div>
      </div>

      {/* Section Header */}
      <div className="section-head" style={{padding: '0 24px'}}>
        <div className="section-title">Allocate acreage to managers</div>
        <button className="btn btn-primary" onClick={handleAllocateAcreage}>Allocate acreage</button>
      </div>

      {/* Two Column Layout */}
      <div className="two-col" style={{padding: '0 24px'}}>
        {/* Acreage Pool Card */}
        <div className="card">
          <div className="card-head">
            <span className="card-title">Acreage pool — GreenField Agro</span>
          </div>
          <div className="card-body">
            {/* Total Assigned Bar */}
            <div style={{marginBottom: '14px'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px'}}>
                <span style={{color: 'var(--text-2)'}}>Total assigned by sales</span>
                <span style={{fontWeight: '500'}}>{acreagePool.totalAssigned} ac</span>
              </div>
              <div className="alloc-bar">
                {managerAllocations.map((manager) => (
                  <div 
                    key={manager.id}
                    className="alloc-seg" 
                    style={{width: `${getPercentageWidth(manager.acreage)}%`, background: manager.color}}
                    title={`${manager.managerName} ${manager.acreage}ac`}
                  ></div>
                ))}
                <div 
                  className="alloc-seg" 
                  style={{width: `${getPercentageWidth(acreagePool.unallocated)}%`, background: 'var(--gray-100)'}}
                ></div>
              </div>
              {/* Legend */}
              <div style={{display: 'flex', gap: '14px', marginTop: '6px', flexWrap: 'wrap'}}>
                {managerAllocations.map((manager) => (
                  <div key={manager.id} style={{display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: 'var(--text-3)'}}>
                    <div style={{width: '8px', height: '8px', background: manager.color, borderRadius: '2px'}}></div>
                    {manager.managerName.split(' ')[0]} {manager.acreage}
                  </div>
                ))}
                <div style={{display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: 'var(--text-3)'}}>
                  <div style={{width: '8px', height: '8px', background: 'var(--gray-100)', borderRadius: '2px', border: '1px solid var(--border)'}}></div>
                  Free {acreagePool.unallocated}
                </div>
              </div>
            </div>
            {/* Statistics */}
            <div className="stat-list">
              <div className="stat-row">
                <span className="stat-key">Total pool</span>
                <span className="stat-val">{acreagePool.totalAssigned} ac</span>
              </div>
              <div className="stat-row">
                <span className="stat-key">Allocated to managers</span>
                <span className="stat-val">{acreagePool.allocatedToManagers} ac</span>
              </div>
              <div className="stat-row">
                <span className="stat-key">Unallocated (available)</span>
                <span className="stat-val" style={{color: 'var(--green-600)'}}>{acreagePool.unallocated} ac</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Reallocate Card */}
        <div className="card">
          <div className="card-head">
            <span className="card-title">Quick reallocate</span>
          </div>
          <div className="card-body" style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
            <div className="form-group">
              <label>From manager</label>
              <select 
                value={transferData.fromManager}
                onChange={(e) => setTransferData({...transferData, fromManager: e.target.value})}
              >
                <option>— select —</option>
                <option>Ravi Shankar (2,400 ac)</option>
                <option>Priya Nair (2,100 ac)</option>
                <option>Manoj Kumar (1,700 ac)</option>
                <option>Unallocated pool (2,200 ac)</option>
              </select>
            </div>
            <div className="form-group">
              <label>To manager</label>
              <select 
                value={transferData.toManager}
                onChange={(e) => setTransferData({...transferData, toManager: e.target.value})}
              >
                <option>— select —</option>
                <option>Ravi Shankar</option>
                <option>Priya Nair</option>
                <option>Manoj Kumar</option>
              </select>
            </div>
            <div className="form-group">
              <label>Acreage to transfer (ac)</label>
              <input 
                type="number" 
                placeholder="e.g. 500"
                value={transferData.acreage}
                onChange={(e) => setTransferData({...transferData, acreage: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Reason / notes</label>
              <textarea 
                placeholder="Seasonal expansion, new farm block..."
                value={transferData.reason}
                onChange={(e) => setTransferData({...transferData, reason: e.target.value})}
              ></textarea>
            </div>
            <button className="btn btn-primary" style={{width: '100%'}} onClick={handleTransfer}>
              Transfer acreage
            </button>
          </div>
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
                <button className="btn" style={{justifyContent: 'flex-start', textAlign: 'left'}} onClick={() => { closeModal(); onPageChange('sales-acreage'); }}>
                  <span style={{marginRight: '8px'}}>+</span> Assign acreage to client
                </button>
                <button className="btn" style={{justifyContent: 'flex-start', textAlign: 'left'}} onClick={() => { closeModal(); onPageChange('client-team'); }}>
                  <span style={{marginRight: '8px'}}>+</span> Add manager to team
                </button>
                <button className="btn" style={{justifyContent: 'flex-start', textAlign: 'left'}} onClick={() => { closeModal(); handleAllocateAcreage(); }}>
                  <span style={{marginRight: '8px'}}>+</span> Allocate acreage to manager
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
    </div>
  );
}
