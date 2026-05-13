import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { normalizeUserRole } from '../utils/roleUtils';
import toast from 'react-hot-toast';

export default function UnlockFarm({ user, onPageChange }) {
  // Set currentRole based on actual user role
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
    // Stay on the unlock farm page for all role switches
    // No redirects for any role - ops, sales, partner, or client
  };
  // State for Unlock by Form ID modal
  const [showFormModal, setShowFormModal] = useState(false);
  const [farmId, setFarmId] = useState('');
  const [status, setStatus] = useState('unlock');
  const [paymentMode, setPaymentMode] = useState('cash');
  const [expiry, setExpiry] = useState('6');
  const [customExpiry, setCustomExpiry] = useState('');
  const [message, setMessage] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [farmDetails, setFarmDetails] = useState(null);
  const [farmDetailsLoading, setFarmDetailsLoading] = useState(false);
  const [farmDetailsError, setFarmDetailsError] = useState('');
  
  // State for recently added farms
  const [recentFarms, setRecentFarms] = useState([]);
  const [recentFarmsLoading, setRecentFarmsLoading] = useState(false);
  const [recentFarmsError, setRecentFarmsError] = useState('');
  const [activePage, setActivePage] = useState(0);
  
  // State for plan selection modal
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [selectedFarmId, setSelectedFarmId] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('');
  const [planLoading, setPlanLoading] = useState(false);

  // Function to fetch top 50 recently added farms
  const fetchRecentFarms = async () => {
    // Only fetch for client and partner roles
    if (currentRole !== 'client' && currentRole !== 'partner') {
      return;
    }

    setRecentFarmsLoading(true);
    setRecentFarmsError('');

    try {
      // Get user mobile number from login storage
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
        setRecentFarmsError('User mobile number not found. Please login again.');
        return;
      }

      // Call real API to fetch top 50 farms
      const apiUrl = import.meta.env.VITE_FETCH_50_FARMS_API_URL + `?mobile_no=${userMobileNumber}`;
      console.log('Fetching top 50 farms:', apiUrl);
      
      // Prepare headers - only add Authorization if token exists to avoid CORS issues
      const headers = {
        'Content-Type': 'application/json'
      };
      
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: headers
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('API endpoint not found. Please check the API URL configuration.');
        } else if (response.status === 500) {
          throw new Error('Server error occurred. Please try again later or contact support.');
        } else if (response.status === 401) {
          throw new Error('Unauthorized access. Please login again.');
        } else if (response.status === 403) {
          throw new Error('Access forbidden. You do not have permission to access this resource.');
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }
      
      const data = await response.json();
      console.log('Top 50 farms API response:', data);
      
      if (data && data.status === "Success" && data.data && Array.isArray(data.data)) {
        // Format the API response data to match the expected structure
        const formattedFarms = data.data.map((farm, index) => ({
          farmId: farm.farm_id || `FARM${String(index + 1).padStart(5, '0')}`,
          farmName: farm.farm_name || 'Unknown Farm',
          region: farm.state || 'Unknown Region', // Using state as region since API doesn't provide region
          area: farm.area ? `${farm.area} hectares` : 'N/A',
          createdTime: farm.created_time || 'N/A'
        }));
        
        setRecentFarms(formattedFarms);
        console.log(`Successfully loaded ${formattedFarms.length} farms`);
      } else {
        console.log('API response structure:', data);
        setRecentFarmsError('No farms data received from server');
      }
    } catch (error) {
      console.error('Error fetching recent farms:', error);
      setRecentFarmsError('Failed to fetch recent farms');
    } finally {
      setRecentFarmsLoading(false);
    }
  };

  // Function to show plan selection modal for farm unlock
  const unlockRecentFarm = (farmId) => {
    setSelectedFarmId(farmId);
    setSelectedPlan('');
    setShowPlanModal(true);
  };

  // Function to unlock farm with selected plan
  const unlockFarmWithPlan = async () => {
    if (!selectedPlan) {
      toast.error('Please select a plan');
      return;
    }

    setPlanLoading(true);
    setFormError('');
    setMessage('');

    try {
      // Call unlock API with selected plan using the new endpoint
      const apiUrl = import.meta.env.VITE_UNLOCK_FARM_API_URL + `?farm_id=${selectedFarmId}&lockstatus=1&mode=cash&expiry=${selectedPlan}`;
      console.log('Unlocking farm with plan:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'GET'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Unlock API response:', data);
      
      if (data && data.status !== 'Failure') {
        toast.success(`Farm ID ${selectedFarmId} has been unlocked successfully with ${selectedPlan} month plan!`);
        setMessage(`Farm ID ${selectedFarmId} has been unlocked successfully with ${selectedPlan} month plan!`);
        
        // Remove the unlocked farm from the list to show it's been processed
        setRecentFarms(prev => prev.filter(farm => farm.farmId !== selectedFarmId));
        
        // Close the modal
        setShowPlanModal(false);
        setSelectedFarmId('');
        setSelectedPlan('');
      } else {
        const errorMessage = data?.message || 'Farm already unlocked';
        setFormError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (err) {
      console.error('API Error:', err);
      const errorMessage = `Failed to unlock farm: ${err.message}`;
      setFormError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setPlanLoading(false);
    }
  };

  // Function to fetch farm details with referral code validation
  const fetchFarmDetails = async (farmIdValue) => {
    if (!farmIdValue.trim()) {
      setFarmDetails(null);
      setFarmDetailsError('');
      return;
    }

    setFarmDetailsLoading(true);
    setFarmDetailsError('');

    try {
      // Step 1: Validate referral code for partner and client roles
      if (currentRole === 'partner' || currentRole === 'client') {
        // Get user data from AuthContext storage
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
          setFarmDetailsError('User mobile number not found. Please login again.');
          return;
        }

        // Check if farm ID is under this referral code
        const referralCheckUrl = import.meta.env.VITE_FETCH_FARM_API_URL + `?mobile_no=${userMobileNumber}&farm_id=${farmIdValue.trim()}`;
        console.log('Checking referral code access:', referralCheckUrl);
        
        // Prepare headers - only add Authorization if token exists to avoid CORS issues
        const referralHeaders = {
          'Content-Type': 'application/json'
        };
        
        if (authToken) {
          referralHeaders['Authorization'] = `Bearer ${authToken}`;
        }
        
        const referralResponse = await fetch(referralCheckUrl, {
          method: 'GET',
          headers: referralHeaders
        });
        
        const referralData = await referralResponse.json();
        console.log('Referral validation response:', referralData);
        
        // Check if referral validation passed - look for success indicators
        const isAccessGranted = referralData.message === "Access granted" || 
                              referralData.status === "Success" || 
                              referralData.success === true ||
                              (referralData.data && referralData.data.access === true);
        
        if (!isAccessGranted) {
          setFarmDetailsError('Access denied: This farm ID is not under your referral code.');
          return;
        }
        
        console.log('Referral code validation successful');
      }

      // Step 2: Fetch farm details after successful validation
      const apiUrl = import.meta.env.VITE_FARM_DETAILS_API_URL + `?farm_id=${farmIdValue.trim()}`;
      console.log('Fetching farm details:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Farm details API response:', data);
      
      if (data.success && data.data) {
        // Clear any previous error messages
        setFarmDetailsError('');
        
        // Handle null values and format the data
        const farmData = {
          farmId: data.data.farm_id || farmIdValue.trim(),
          cropType: data.data.croptype || 'N/A',
          area: data.data.area ? `${data.data.area} hectares` : 'N/A',
          district: data.data.district || 'N/A',
          state: data.data.state || 'N/A',
          country: data.data.country || 'N/A',
          timeOfRegistration: data.data.time || 'N/A'
        };
        
        setFarmDetails(farmData);
      } else {
        setFarmDetailsError('Farm ID doesn\'t exist, please enter proper farm ID');
      }
    } catch (error) {
      console.error('Error fetching farm details:', error);
      setFarmDetailsError('Failed to fetch farm details');
    } finally {
      setFarmDetailsLoading(false);
    }
  };


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
      // Step 1: Verify farm ownership first (for client and partner roles)
      if (currentRole === 'client' || currentRole === 'partner') {
        // Get user data from AuthContext storage
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

        // Verify farm belongs to this user
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
      // Map status to lockstatus: unlock -> 1, lock -> 0 (reversed based on API behavior)
      const lockStatus = status === 'lock' ? 0 : 1;
      
      console.log('Form status:', status);
      console.log('Mapped lockstatus:', lockStatus);
      console.log('Farm ID:', farmId.trim());
      
      // Map expiry to numeric value
      let expiryValue = expiry;
      if (expiry === 'other') {
        expiryValue = customExpiry.trim();
      }
      
      // Construct API URL
      const apiUrl = import.meta.env.VITE_UNLOCK_FARM_API_URL + `?farm_id=${farmId.trim()}&lockstatus=${lockStatus}&mode=${paymentMode}&expiry=${expiryValue}`;
      console.log('Calling API:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'GET'
      });
      
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
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      // Check if the API call was successful based on response data
      if (data && data.status !== 'Failure') {
        const statusText = status === 'lock' ? 'locked' : 'unlocked';
        const successMessage = `Farm ID ${farmId.trim()} has been ${statusText} successfully!`;
        
        // Show toast message instead of alert
        toast.success(successMessage);
        
        // Also set the message state for UI display
        setMessage(successMessage);
        
        // Reset form
        setFarmId('');
        setStatus('unlock');
        setPaymentMode('cash');
        setExpiry('6');
        setCustomExpiry('');
      } else {
        // Show the API message directly to the user
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

  // useEffect to fetch farm details when farm ID changes
  useEffect(() => {
    fetchFarmDetails(farmId);
  }, [farmId]);

  // useEffect to fetch recent farms on component load for client and partner roles
  useEffect(() => {
    fetchRecentFarms();
  }, [currentRole]);

  
  return (
    <div className="content-area" style={{backgroundColor: '#ffffff', padding: '0', overflow: 'auto', height: '100vh', width: '100%'}}>
      {/* Top Navigation Bar - Full Width */}
      <div className="topbar" style={{marginBottom: '16px', marginLeft: '0', marginRight: '0', backgroundColor: '#ffffff', borderBottom: '1px solid var(--border)', padding: '0 24px'}}>
        <div className="tb-left">
          <div>
            <div className="tb-page">Unlock Farms</div>
            <div className="tb-sub">
              {currentRole === 'ops' ? 'Operations · Access Control' : 
               currentRole === 'sales' ? 'Sales · Access Control' : 
               currentRole === 'partner' ? 'Partner · Access Control' :
               'Client · Access Control'}
            </div>
          </div>
        </div>
        <div className="tb-right">
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
                {currentRole === 'client' || currentRole === 'partner' ? (
                  // Client and Partner user options
                  <>
                    <button className="btn" style={{justifyContent: 'flex-start', textAlign: 'left'}} onClick={() => { closeModal(); onPageChange('register'); }}>
                      <span style={{marginRight: '8px'}}>+</span> New registration
                    </button>
                    <button className="btn" style={{justifyContent: 'flex-start', textAlign: 'left'}} onClick={() => { closeModal(); onPageChange('unlock-farm'); }}>
                      <span style={{marginRight: '8px'}}>+</span> Unlock farm
                    </button>
                  </>
                ) : (
                  // Sales/Operations user options
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

      {/* Plan Selection Modal */}
      {showPlanModal && (
        <div className="modal-overlay">
          <div className="modal" style={{width: '420px', maxWidth: '90vw', maxHeight: '80vh', overflowY: 'auto'}}>
            <div className="modal-head">
              <h3>Select Unlock Plan</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowPlanModal(false)}>
                <X className="ic-xs" />
              </button>
            </div>
            <div className="modal-body">
              <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
                <div>
                  <label style={{display: 'block', marginBottom: '8px', fontWeight: '500', color: 'var(--text-1)'}}>
                    Farm ID: <span style={{fontWeight: '600', color: 'var(--primary)'}}>{selectedFarmId}</span>
                  </label>
                </div>
                
                <div>
                  <label style={{display: 'block', marginBottom: '8px', fontWeight: '500', color: 'var(--text-1)'}}>
                    Select Plan Duration
                  </label>
                  <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                    <button 
                      className={`btn ${selectedPlan === '1' ? 'btn-primary' : 'btn-outline'}`}
                      style={{justifyContent: 'flex-start', textAlign: 'left', padding: '12px 16px', minHeight: '60px'}}
                      onClick={(e) => { e.stopPropagation(); setSelectedPlan('1'); }}
                    >
                      <div>
                        <strong>1 Month</strong>
                        <div style={{fontSize: '12px', color: selectedPlan === '1' ? '#ffffff' : 'var(--text-2)', marginTop: '4px'}}>
                          Short term access
                        </div>
                      </div>
                    </button>
                    
                    <button 
                      className={`btn ${selectedPlan === '6' ? 'btn-primary' : 'btn-outline'}`}
                      style={{justifyContent: 'flex-start', textAlign: 'left', padding: '12px 16px', minHeight: '60px'}}
                      onClick={(e) => { e.stopPropagation(); setSelectedPlan('6'); }}
                    >
                      <div>
                        <strong>6 Months</strong>
                        <div style={{fontSize: '12px', color: selectedPlan === '6' ? '#ffffff' : 'var(--text-2)', marginTop: '4px'}}>
                          Standard plan
                        </div>
                      </div>
                    </button>
                    
                    <button 
                      className={`btn ${selectedPlan === '12' ? 'btn-primary' : 'btn-outline'}`}
                      style={{justifyContent: 'flex-start', textAlign: 'left', padding: '12px 16px', minHeight: '60px'}}
                      onClick={(e) => { e.stopPropagation(); setSelectedPlan('12'); }}
                    >
                      <div>
                        <strong>12 Months</strong>
                        <div style={{fontSize: '12px', color: selectedPlan === '12' ? '#ffffff' : 'var(--text-2)', marginTop: '4px'}}>
                          Best value
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
                
                <div style={{display: 'flex', gap: '8px', justifyContent: 'flex-end'}}>
                  <button 
                    className="btn btn-ghost" 
                    onClick={() => setShowPlanModal(false)}
                    disabled={planLoading}
                  >
                    Cancel
                  </button>
                  <button 
                    className="btn btn-primary" 
                    onClick={unlockFarmWithPlan}
                    disabled={planLoading || !selectedPlan}
                  >
                    {planLoading ? 'Processing...' : 'Unlock Farm'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Unlock by Form ID Card */}
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
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="unlock">Unlock</option>
                  <option value="lock">Lock</option>
                </select>
              </div>
            </div>

            {status === 'unlock' && (
              <div className="two-col">
                <div className="form-group">
                  <label>Mode</label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value)}
                  >
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="upi">UPI</option>
                    <option value="netbanking">Netbanking</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Expiry (in months)</label>
                  <select
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                  >
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

      {/* Farm Details Table */}
      {farmDetails && farmId.trim() && (
        <div className="card" style={{marginBottom: '16px', marginLeft: '24px', marginRight: '24px'}}>
          <div className="card-head">
            <span className="card-title">Farm Details</span>
          </div>
          <div className="card-body">
            <div style={{overflowX: 'auto'}}>
              <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '14px'}}>
                <thead>
                  <tr style={{backgroundColor: 'var(--bg-1)', borderBottom: '1px solid var(--border)'}}>
                    <th style={{padding: '12px', textAlign: 'left', fontWeight: '600', color: 'var(--text-1)'}}>Farm ID</th>
                    <th style={{padding: '12px', textAlign: 'left', fontWeight: '600', color: 'var(--text-1)'}}>Crop Type</th>
                    <th style={{padding: '12px', textAlign: 'left', fontWeight: '600', color: 'var(--text-1)'}}>Area</th>
                    <th style={{padding: '12px', textAlign: 'left', fontWeight: '600', color: 'var(--text-1)'}}>District</th>
                    <th style={{padding: '12px', textAlign: 'left', fontWeight: '600', color: 'var(--text-1)'}}>State</th>
                    <th style={{padding: '12px', textAlign: 'left', fontWeight: '600', color: 'var(--text-1)'}}>Country</th>
                    <th style={{padding: '12px', textAlign: 'left', fontWeight: '600', color: 'var(--text-1)'}}>Time of Registration</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{borderBottom: '1px solid var(--border)'}}>
                    <td style={{padding: '12px', color: 'var(--text-1)'}}>{farmDetails.farmId}</td>
                    <td style={{padding: '12px', color: 'var(--text-1)'}}>{farmDetails.cropType}</td>
                    <td style={{padding: '12px', color: 'var(--text-1)'}}>{farmDetails.area}</td>
                    <td style={{padding: '12px', color: 'var(--text-1)'}}>{farmDetails.district}</td>
                    <td style={{padding: '12px', color: 'var(--text-1)'}}>{farmDetails.state}</td>
                    <td style={{padding: '12px', color: 'var(--text-1)'}}>{farmDetails.country}</td>
                    <td style={{padding: '12px', color: 'var(--text-1)'}}>{farmDetails.timeOfRegistration}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Farm Details Loading */}
      {farmDetailsLoading && farmId.trim() && (
        <div className="card" style={{marginBottom: '16px', marginLeft: '24px', marginRight: '24px'}}>
          <div className="card-body" style={{textAlign: 'center', padding: '24px'}}>
            <p style={{color: 'var(--text-2)', fontSize: '14px'}}>Loading farm details...</p>
          </div>
        </div>
      )}

      {/* Farm Details Error */}
      {farmDetailsError && farmId.trim() && (
        <div className="card" style={{marginBottom: '16px', marginLeft: '24px', marginRight: '24px'}}>
          <div className="card-body" style={{textAlign: 'center', padding: '24px'}}>
            <p style={{color: 'var(--red-600)', fontSize: '14px'}}>{farmDetailsError}</p>
          </div>
        </div>
      )}

      {/* Recently Added Farms Table - Only for Client and Partner */}
      {(currentRole === 'client' || currentRole === 'partner') && (
        <div className="card" style={{marginBottom: '16px', marginLeft: '24px', marginRight: '24px'}}>
          <div className="card-head">
            <span className="card-title">Top 50 Recently Added Farms</span>
          </div>
          <div className="card-body" style={{padding: '16px'}}>
            {recentFarmsLoading && (
              <div style={{textAlign: 'center', padding: '24px'}}>
                <p style={{color: 'var(--text-2)', fontSize: '14px'}}>Loading recent farms...</p>
              </div>
            )}
            
            {recentFarmsError && (
              <div style={{textAlign: 'center', padding: '24px'}}>
                <p style={{color: 'var(--red-600)', fontSize: '14px'}}>{recentFarmsError}</p>
              </div>
            )}
            
            {!recentFarmsLoading && !recentFarmsError && recentFarms.length > 0 && (
              <div>
                {/* Show only the selected farm group */}
                {(() => {
                  const startIdx = activePage * 10;
                  const endIdx = Math.min(startIdx + 10, recentFarms.length);
                  const groupFarms = recentFarms.slice(startIdx, endIdx);
                  const groupNumber = activePage + 1;
                  
                  return (
                    <div>
                      <div style={{backgroundColor: 'var(--bg-1)', padding: '8px 12px', margin: '8px 0 4px 0', borderRadius: '4px', border: '1px solid var(--border)'}}>
                        <span style={{fontWeight: '600', color: 'var(--text-1)', fontSize: '13px'}}>
                          {startIdx + 1} to {endIdx} farm ids in {groupNumber}
                        </span>
                      </div>
                      <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '16px'}}>
                        <thead>
                          <tr style={{borderBottom: '1px solid var(--border)'}}>
                            <th style={{padding: '10px 16px', textAlign: 'left', fontWeight: '600', color: 'var(--text-1)', fontSize: '14px'}}>Farm ID</th>
                            <th style={{padding: '10px 16px', textAlign: 'left', fontWeight: '600', color: 'var(--text-1)', fontSize: '14px'}}>Farm Name</th>
                            <th style={{padding: '10px 16px', textAlign: 'left', fontWeight: '600', color: 'var(--text-1)', fontSize: '14px'}}>Region</th>
                            <th style={{padding: '10px 16px', textAlign: 'left', fontWeight: '600', color: 'var(--text-1)', fontSize: '14px'}}>Area</th>
                            <th style={{padding: '10px 16px', textAlign: 'left', fontWeight: '600', color: 'var(--text-1)', fontSize: '14px'}}>Created Time</th>
                            <th style={{padding: '10px 16px', textAlign: 'left', fontWeight: '600', color: 'var(--text-1)', fontSize: '14px', width: '100px'}}>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {groupFarms.map((farm, index) => (
                            <tr key={startIdx + index} style={{borderBottom: '1px solid var(--border)'}}>
                              <td style={{padding: '10px 16px', color: 'var(--text-1)', fontSize: '14px'}}>{farm.farmId}</td>
                              <td style={{padding: '10px 16px', color: 'var(--text-1)', fontSize: '14px'}}>{farm.farmName}</td>
                              <td style={{padding: '10px 16px', color: 'var(--text-1)', fontSize: '14px'}}>{farm.region}</td>
                              <td style={{padding: '10px 16px', color: 'var(--text-1)', fontSize: '14px'}}>{farm.area}</td>
                              <td style={{padding: '10px 16px', color: 'var(--text-1)', fontSize: '14px'}}>{farm.createdTime}</td>
                              <td style={{padding: '10px 16px'}}>
                                <div style={{display: 'flex', gap: '8px'}}>
                                  <button
                                    onClick={() => unlockRecentFarm(farm.farmId)}
                                    disabled={formLoading}
                                    className="btn btn-primary btn-sm"
                                    style={{fontSize: '12px', padding: '6px 12px', height: '32px', width: '80px'}}
                                  >
                                    {formLoading ? '...' : 'Unlock'}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                })()}
                
                {/* Pagination Buttons */}
                <div style={{display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '16px', padding: '8px', backgroundColor: 'var(--bg-1)', borderRadius: '4px', border: '1px solid var(--border)'}}>
                  {Array.from({ length: Math.ceil(recentFarms.length / 10) }, (_, index) => (
                    <button
                      key={index}
                      onClick={() => setActivePage(index)}
                      className="btn btn-sm"
                      style={{
                        padding: '6px 12px',
                        fontSize: '14px',
                        borderRadius: '20px',
                        backgroundColor: activePage === index ? '#2d7a3d' : '#ffffff',
                        color: activePage === index ? '#ffffff' : '#333333',
                        border: activePage === index ? 'none' : '1px solid #cccccc',
                        cursor: 'pointer',
                        fontWeight: activePage === index ? '600' : '400',
                        minWidth: '36px',
                        height: '36px',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {!recentFarmsLoading && !recentFarmsError && recentFarms.length === 0 && (
              <div style={{textAlign: 'center', padding: '24px'}}>
                <p style={{color: 'var(--text-2)', fontSize: '14px'}}>No farms found</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
