import { useState } from 'react';

export default function TeamManagers({ user, onPageChange }) {
  const [currentRole, setCurrentRole] = useState('client');

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

  // Mock managers data
  const [managers] = useState([
    {
      id: 1,
      managerName: 'Ravi Shankar',
      managerInitial: 'RS',
      email: 'ravi.s@greenfield.in',
      role: 'Senior Manager',
      farmsManaged: 4,
      allocatedAcreage: 2400,
      usedAcreage: 2280,
      utilization: 95,
      status: 'Active'
    },
    {
      id: 2,
      managerName: 'Priya Nair',
      managerInitial: 'PN',
      email: 'priya.n@greenfield.in',
      role: 'Area Manager',
      farmsManaged: 5,
      allocatedAcreage: 2100,
      usedAcreage: 1800,
      utilization: 86,
      status: 'Active'
    },
    {
      id: 3,
      managerName: 'Manoj Kumar',
      managerInitial: 'MK',
      email: 'manoj.k@greenfield.in',
      role: 'Field Manager',
      farmsManaged: 3,
      allocatedAcreage: 1700,
      usedAcreage: 900,
      utilization: 53,
      status: 'Onboarding'
    }
  ]);

  const getUtilizationClass = (utilization) => {
    if (utilization >= 100) return 'over';
    if (utilization < 50) return 'warn';
    return '';
  };

  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'Active': return 'badge-green';
      case 'Onboarding': return 'badge-blue';
      default: return 'badge-gray';
    }
  };

  const handleAddManager = () => {
    console.log('Add new manager');
  };

  return (
    <div className="content-area" style={{backgroundColor: '#f8f7f4', minHeight: '100vh', padding: '0'}}>
      {/* Top Navigation Bar - Full Width */}
      <div className="topbar" style={{marginBottom: '16px', marginLeft: '0', marginRight: '0', backgroundColor: '#ffffff', borderBottom: '1px solid var(--border)', padding: '0 24px'}}>
        <div className="tb-left">
          <div>
            <div className="tb-page">Team & Managers</div>
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
          <button className="btn btn-primary btn-sm" onClick={handleAddManager}>+ Add</button>
        </div>
      </div>

      {/* Section Header */}
      <div className="section-head" style={{padding: '0 24px'}}>
        <div className="section-title">Team & managers — GreenField Agro</div>
        <button className="btn btn-primary" onClick={handleAddManager}>+ Add manager</button>
      </div>

      {/* Metrics */}
      <div className="metrics" style={{gridTemplateColumns: 'repeat(3, 1fr)', padding: '0 24px'}}>
        <div className="metric metric-accent">
          <div className="metric-label">Total acreage (ac)</div>
          <div className="metric-val">8,400</div>
          <div className="metric-sub">Assigned by sales</div>
        </div>
        <div className="metric">
          <div className="metric-label">Allocated to managers</div>
          <div className="metric-val">6,200</div>
          <div className="metric-sub">74% distributed</div>
        </div>
        <div className="metric">
          <div className="metric-label">Unallocated</div>
          <div className="metric-val">2,200</div>
          <div className="metric-sub metric-up">Available to assign</div>
        </div>
      </div>

      {/* Farm Managers Table */}
      <div className="card" style={{marginLeft: '24px', marginRight: '24px'}}>
        <div className="card-head">
          <span className="card-title">Farm managers</span>
        </div>
        <div className="tbl-wrap">
          <table>
            <thead>
              <tr>
                <th>Manager</th>
                <th>Role</th>
                <th>Farms managed</th>
                <th>Alloc. acreage (ac)</th>
                <th>Used (ac)</th>
                <th>Utilisation</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {managers.map((manager) => (
                <tr key={manager.id}>
                  <td>
                    <div className="flex-cell">
                      <div className="avatar-sm">{manager.managerInitial}</div>
                      <div>
                        <div className="tbl-name">{manager.managerName}</div>
                        <div className="tbl-sub">{manager.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>{manager.role}</td>
                  <td>{manager.farmsManaged}</td>
                  <td>{manager.allocatedAcreage}</td>
                  <td>{manager.usedAcreage}</td>
                  <td>
                    <div className="prog-wrap">
                      <div 
                        className={`prog-fill ${getUtilizationClass(manager.utilization)}`}
                        style={{width: `${manager.utilization}%`}}
                      ></div>
                    </div>
                    <span style={{fontSize: '10px', color: 'var(--text-3)'}}>{manager.utilization}%</span>
                  </td>
                  <td>
                    <span className={`badge ${getStatusBadgeClass(manager.status)}`}>
                      {manager.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
