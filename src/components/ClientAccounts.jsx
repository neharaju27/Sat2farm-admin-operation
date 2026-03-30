import { useState } from 'react';

export default function ClientAccounts({ user, onPageChange }) {
  const [currentRole, setCurrentRole] = useState('sales');

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
    console.log('Add new client');
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
            <button className={`role-btn ${currentRole === 'client' ? 'active' : ''}`} onClick={() => handleRoleSwitch('client')}>Client</button>
          </div>
          <button className="btn btn-primary btn-sm" onClick={handleNewClient}>+ New</button>
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
    </div>
  );
}
