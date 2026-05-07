import { useState } from 'react';
import { X } from 'lucide-react';
import { normalizeUserRole } from '../utils/roleUtils';
import toast from 'react-hot-toast';

export default function UnlockFarm({ user, onPageChange }) {
  const [currentRole, setCurrentRole] = useState(() => normalizeUserRole(user));
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

  const [farmId, setFarmId] = useState('');
  const [status, setStatus] = useState('unlock');
  const [paymentMode, setPaymentMode] = useState('cash');
  const [expiry, setExpiry] = useState('6');
  const [customExpiry, setCustomExpiry] = useState('');
  const [message, setMessage] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const handleFormSubmit = async () => {
    if (!farmId.trim()) {
      const errorMessage = 'Please enter a Farm ID.';
      setFormError(errorMessage);
      toast.error(errorMessage);
      return;
    }

    setFormLoading(true);
    setFormError('');
    setMessage('');

    try {
      // Step 1: Verify farm ownership first (only for client role)
      if (currentRole === 'client') {
        const storedAuth = localStorage.getItem('sat2farm_auth');
        let userMobileNumber = null;
        let authToken = null;

        if (storedAuth) {
          try {
            const authData = JSON.parse(storedAuth);
            userMobileNumber = authData.phone_number;
            authToken = authData.token || authData.jwt;
          } catch (e) {
            console.error('Error parsing auth data:', e);
          }
        }

        if (!userMobileNumber) {
          const errorMessage = 'User mobile number not found. Please login again.';
          setFormError(errorMessage);
          toast.error(errorMessage);
          return;
        }

        const verifyUrl = import.meta.env.VITE_FETCH_FARM_API_URL + `?mobile_no=${userMobileNumber}&farm_id=${farmId.trim()}`;
        console.log('Verifying farm ownership:', verifyUrl);

        const verifyResponse = await fetch(verifyUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          }
        });

        const verifyData = await verifyResponse.json();
        console.log('Farm verification response:', verifyData);

        if (verifyData.message !== "Access granted") {
          const errorMessage = 'Access denied: This farm does not belong to your account.';
          setFormError(errorMessage);
          toast.error(errorMessage);
          return;
        }

        console.log('Farm ownership verified successfully');
      }

      // Step 2: Proceed with unlock/lock operation
      const lockStatus = status === 'lock' ? 0 : 1;

      console.log('Form status:', status);
      console.log('Mapped lockstatus:', lockStatus);
      console.log('Farm ID:', farmId.trim());

      let expiryValue = expiry;
      if (expiry === 'other') {
        expiryValue = customExpiry.trim();
      }

      const apiUrl = import.meta.env.VITE_UNLOCK_FARM_API_URL + `?farm_id=${farmId.trim()}&lockstatus=${lockStatus}&mode=${paymentMode}&expiry=${expiryValue}`;
      console.log('Calling API:', apiUrl);

      const response = await fetch(apiUrl, { method: 'GET' });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json().catch(err => {
        console.log('Response is not JSON, trying to get text:', err);
        return response.text().then(text => {
          console.log('Response text:', text);
          return { rawResponse: text };
        });
      });
      console.log('API Response:', data);

      if (data && data.status !== 'Failure') {
        const statusText = status === 'lock' ? 'locked' : 'unlocked';
        const successMessage = `Farm ID ${farmId.trim()} has been ${statusText} successfully!`;

        toast.success(successMessage);
        setMessage(successMessage);

        setFarmId('');
        setStatus('unlock');
        setPaymentMode('cash');
        setExpiry('6');
        setCustomExpiry('');
      } else {
        const apiMessage = data?.message || 'API returned an error';
        console.log('API indicates failure:', apiMessage);
        setFormError(apiMessage);
        toast.error(apiMessage);
        return;
      }

    } catch (err) {
      console.error('API Error:', err);
      const errorMessage = `Failed to update farm status: ${err.message}`;
      setFormError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="content-area" style={{backgroundColor: '#ffffff', padding: '0', overflow: 'auto', minHeight: '100vh'}}>
      {/* Top Navigation Bar */}
      <div className="topbar" style={{marginBottom: '16px', marginLeft: '0', marginRight: '0', backgroundColor: '#ffffff', borderBottom: '1px solid var(--border)', padding: '0 24px'}}>
        <div className="tb-left">
          <div>
            <div className="tb-page">Unlock Farms</div>
            <div className="tb-sub">
              {currentRole === 'ops' ? 'Operations · Access Control' :
               currentRole === 'sales' ? 'Sales · Access Control' :
               'Client · Access Control'}
            </div>
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
      <div className="section-head" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 24px'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
          <div className="section-title">Farm unlock requests</div>
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
                {currentRole === 'client' ? (
                  <>
                    <button className="btn" style={{justifyContent: 'flex-start', textAlign: 'left'}} onClick={() => { closeModal(); onPageChange('register'); }}>
                      <span style={{marginRight: '8px'}}>+</span> New registration
                    </button>
                    <button className="btn" style={{justifyContent: 'flex-start', textAlign: 'left'}} onClick={() => { closeModal(); onPageChange('unlock-farm'); }}>
                      <span style={{marginRight: '8px'}}>+</span> Unlock farm
                    </button>
                  </>
                ) : (
                  <>
                    <button className="btn" style={{justifyContent: 'flex-start', textAlign: 'left'}} onClick={() => { closeModal(); onPageChange('assign-acreages'); }}>
                      <span style={{marginRight: '8px'}}>+</span> Assign acreage to client
                    </button>
                    <button className="btn" style={{justifyContent: 'flex-start', textAlign: 'left'}} onClick={() => { closeModal(); onPageChange('unlock-farm'); }}>
                      <span style={{marginRight: '8px'}}>+</span> Unlock farm
                    </button>
                    <button className="btn" style={{justifyContent: 'flex-start', textAlign: 'left'}} onClick={() => { closeModal(); onPageChange('monthly-acreages'); openModal('add-registration-modal'); }}>
                      <span style={{marginRight: '8px'}}>+</span> Add new registration
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Unlock by Farm ID Card */}
      <div className="card" style={{marginBottom: '16px', marginLeft: '24px', marginRight: '24px'}}>
        <div className="card-head">
          <span className="card-title">Unlock Farm by Farm ID</span>
        </div>
        <div className="card-body">
          <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
            <div className="two-col">
              <div className="form-group">
                <label>Farm ID</label>
                <input
                  type="text"
                  value={farmId}
                  onChange={(e) => setFarmId(e.target.value)}
                  placeholder="Enter Farm ID"
                />
              </div>
              <div className="form-group">
                <label>Lock Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="unlock">Unlock</option>
                  <option value="lock">Lock</option>
                </select>
              </div>
            </div>

            {status === 'unlock' && (
              <div className="two-col">
                <div className="form-group">
                  <label>Mode</label>
                  <select value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)}>
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="upi">UPI</option>
                    <option value="netbanking">Netbanking</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Expiry (in months)</label>
                  <select value={expiry} onChange={(e) => setExpiry(e.target.value)}>
                    <option value="1">1</option>
                    <option value="6">6</option>
                    <option value="12">12</option>
                    <option value="other">Other</option>
                  </select>
                  {expiry === 'other' && (
                    <input
                      type="text"
                      value={customExpiry}
                      onChange={(e) => setCustomExpiry(e.target.value)}
                      placeholder="Enter custom expiry (e.g. 2)"
                      style={{marginTop: '8px'}}
                    />
                  )}
                </div>
              </div>
            )}

            {status === 'lock' && (
              <p style={{fontSize: '13px', color: 'var(--text-2)', fontStyle: 'italic'}}>
                No payment/expiry required for lock.
              </p>
            )}

            <div style={{display: 'flex', gap: '8px', marginTop: '8px'}}>
              <button
                onClick={handleFormSubmit}
                disabled={formLoading}
                className="btn btn-primary"
              >
                {formLoading ? 'Processing...' : 'Update Status'}
              </button>
            </div>

            {message && (
              <p style={{fontSize: '13px', color: 'var(--green-600)', marginTop: '8px'}}>
                {message}
              </p>
            )}
            {formError && (
              <p style={{fontSize: '13px', color: 'var(--red-600)', marginTop: '8px'}}>
                {formError}
              </p>
            )}
          </div>
        </div>
      </div>

          </div>
  );
}