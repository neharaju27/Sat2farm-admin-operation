import { useState, useEffect } from 'react';
import PhoneInput from 'react-phone-input-2';
import { Search, Plus, ChevronDown, Home, TrendingUp, Users, Settings, LogOut, Menu, X, Download, Edit, Eye, Lock, Unlock, AlertCircle, CheckCircle, Clock, MapPin, Phone, Mail, Calendar, Filter, BarChart3, Database, User, Building, Package, ArrowUp, ArrowDown } from 'lucide-react';
import '../styles/Sat2FarmAdminPortal.css';
import API from '../api/api';
import { normalizeUserRole } from '../utils/roleUtils';

const API_URL = import.meta.env.VITE_USER_REGISTRATION_API_URL;
const REPORT_API_URL = import.meta.env.DEV ? '/report/report' : import.meta.env.VITE_REPORT_API_URL;
const REPORT_DATA_API_URL = import.meta.env.DEV ? '/report_data/report_data' : import.meta.env.VITE_REPORT_DATA_API_URL;

export default function MonthlyAcreages({ user, onPageChange }) {
  const [currentView, setCurrentView] = useState('ops-acreage');
  // Set currentRole based on actual user role
  const [currentRole, setCurrentRole] = useState(() => normalizeUserRole(user));
  const [selectedMonth, setSelectedMonth] = useState('Mar 26');
  const [reportData, setReportData] = useState(null);
  const [monthlyData, setMonthlyData] = useState(null);
  const [availableMonths, setAvailableMonths] = useState(['Oct 25', 'Nov 25', 'Dec 25', 'Jan 26', 'Feb 26', 'Mar 26']);
  const [loadingReport, setLoadingReport] = useState(false);
  const [reportError, setReportError] = useState('');
  const [modalOpen, setModalOpen] = useState(null);
  const [regFormData, setRegFormData] = useState({
    fName: '',
    lName: '',
    user_email: '',
    country_code: '+91',
    pNumber: '',
    fullPhoneNumber: '',
    acc_id: '',
    referal_code: '',
    category: '',
    new_password: ''
  });
  const [regError, setRegError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [regSuccess, setRegSuccess] = useState(false);
  const [registeredUser, setRegisteredUser] = useState(null);

  // Unlock Farm form state
  const [unlockFarmId, setUnlockFarmId] = useState('');
  const [unlockStatus, setUnlockStatus] = useState('unlock');
  const [unlockPaymentMode, setUnlockPaymentMode] = useState('cash');
  const [unlockExpiry, setUnlockExpiry] = useState('6');
  const [unlockCustomExpiry, setUnlockCustomExpiry] = useState('');
  const [unlockMessage, setUnlockMessage] = useState('');
  const [unlockLoading, setUnlockLoading] = useState(false);
  const [unlockError, setUnlockError] = useState('');

  // Assign Acreage form state
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
  const [searchType, setSearchType] = useState('clientId');

  const views = {
    'ops-acreage': { title: 'Monthly Acreage', sub: 'Operations · Reporting' },
    'ops-farms': { title: 'Farm Management', sub: 'Operations · Farms' },
    'ops-unlock': { title: 'Unlock Farms', sub: 'Operations · Access Control' },
    'sales-acreage': { title: 'Assign Acreage', sub: 'Sales · Quota Management' },
    'sales-clients': { title: 'Client Accounts', sub: 'Sales · CRM' },
    'client-team': { title: 'Team & Managers', sub: 'Client · GreenField Agro' },
    'client-alloc': { title: 'Allocate Acreage', sub: 'Client · GreenField Agro' },
  };

  const roleLabels = {
    ops: 'Operations',
    sales: 'Sales',
    client: 'Client (GreenField)'
  };

  const firstViews = {
    ops: 'ops-acreage',
    sales: 'sales-acreage',
    client: 'client-team'
  };

  const handleNavigate = (view) => {
    setCurrentView(view);
  };

  const handleRoleSwitch = (role) => {
    setCurrentRole(role);
    if (role === 'sales') {
      onPageChange('sales-acreage');
    } else if (role === 'client') {
      onPageChange('client-team');
    } else {
      setCurrentView(firstViews[role]);
    }
  };

  const handleMonthSelect = async (month) => {
    setSelectedMonth(month);
    
    // Find the file path for selected month from report data
    if (reportData && Array.isArray(reportData)) {
      const monthData = reportData.find(item => item.label === month);
      if (monthData && monthData.file) {
        await fetchMonthlyData(monthData.file);
      }
    }
  };

  const fetchMonthlyData = async (filePath) => {
  setLoadingReport(true);
  setReportError('');

  try {
    const apiUrl = `${REPORT_DATA_API_URL}?file=${encodeURIComponent(filePath)}`;
    console.log('Fetching monthly data from:', apiUrl); // Debug log
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    console.log('Monthly data API response:', data); // Debug log

    if (response.ok) {
      setMonthlyData(data);
    } else {
      setReportError(data.message || 'Failed to fetch monthly data');
    }
  } catch (error) {
    console.error('Error fetching monthly data:', error);
    setReportError('Network error. Please try again.');
  } finally {
    setLoadingReport(false);
  }
};

  const fetchReportData = async (month) => {
  setLoadingReport(true);
  setReportError('');

  try {
    const response = await fetch(REPORT_API_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, response: ${errorText.substring(0, 200)}`);
    }

    const data = await response.json();

    if (response.ok) {
      let parsedData = data;

      if (typeof data === 'string') {
        try {
          parsedData = JSON.parse(data);
        } catch (parseError) {
          console.error('Error parsing JSON response:', parseError);
          setReportError('Invalid response format from server');
          return;
        }
      }

      setReportData(parsedData);

      if (Array.isArray(parsedData)) {
        const monthLabels = parsedData.map(item => item.label).filter(label => label);
        if (monthLabels.length > 0) {
          setAvailableMonths(monthLabels);
        }
      }
    } else {
      setReportError(data.message || 'Failed to fetch report data');
    }
  } catch (error) {
    console.error('Error fetching report data:', error);
    setReportError('Network error. Please try again.');
  } finally {
    setLoadingReport(false);
  }
};

  // Fetch report data when component mounts with default month
  useEffect(() => {
    // Initial fetch to get available months
    fetchReportData(selectedMonth);
  }, []);

  // Refetch data when selected month changes
  useEffect(() => {
    if (availableMonths.length > 0 && availableMonths.includes(selectedMonth)) {
      fetchReportData(selectedMonth);
    }
  }, [selectedMonth]);

  const openModal = (modalId) => {
    setModalOpen(modalId);
  };

  const closeModal = () => {
    setModalOpen(null);
    setAssignSuccess(false);
    setAssignError('');
    setClientDetails(null);
    setRegisterDetails(null);
    setSearchType('clientId');
    setAssignFormData({
      client: '',
      addAcreage: '',
      plan: ' 1 month',
      expiryDate: '',
      notes: '',
      registerNumber: ''
    });
  };

  const handleRegisterSubmit = async () => {
    setIsRegistering(true);
    setRegError('');

    // Validate phone number
    if (regFormData.pNumber && !/^\d{10}$/.test(regFormData.pNumber)) {
      setRegError('Phone number must be exactly 10 digits');
      setIsRegistering(false);
      return;
    }

    // Validate email
    if (regFormData.user_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regFormData.user_email)) {
      setRegError('Please enter a valid email address');
      setIsRegistering(false);
      return;
    }

    try {
      const apiUrl = `${API_URL}?fName=${encodeURIComponent(regFormData.fName)}&lName=${encodeURIComponent(regFormData.lName)}&user_email=${encodeURIComponent(regFormData.user_email)}&pNumber=${encodeURIComponent(regFormData.pNumber)}&acc_id=${encodeURIComponent(regFormData.acc_id)}&referal_code=${encodeURIComponent(regFormData.referal_code)}&category=${encodeURIComponent(regFormData.category)}&new_password=${encodeURIComponent(regFormData.new_password)}&country_code=${encodeURIComponent(regFormData.country_code)}`;
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        // Backend stores TWO passwords:
        // 1. Auto-generated: fName[:5] + "@" + pNumber[-4:]
        // 2. Submitted: what user entered in form
        const autoPassword = regFormData.fName.slice(0, 5) + "@" + regFormData.pNumber.slice(-4);
        
        const newUser = {
          id: Date.now(),
          firstName: regFormData.fName,
          lastName: regFormData.lName,
          email: regFormData.user_email,
          phone: regFormData.pNumber,
          countryCode: regFormData.country_code,
          accountId: regFormData.acc_id,
          referralCode: regFormData.referal_code || '-',
          category: regFormData.category,
          submittedPassword: regFormData.new_password,
          autoPassword: autoPassword,
          password: regFormData.new_password,
          registrationDate: new Date().toLocaleDateString()
        };
        setRegisteredUser(newUser);
        setRegSuccess(true);
        // Reset form
        setRegFormData({
          fName: '',
          lName: '',
          user_email: '',
          country_code: '+91',
          pNumber: '',
          fullPhoneNumber: '',
          acc_id: '',
          referal_code: '',
          category: '',
          new_password: ''
        });
      } else {
        const errorMessage = data.message || 'Registration failed. Please try again.';
        setRegError(errorMessage);
      }
    } catch (err) {
      setRegError('Network error. Please check your connection and try again.');
    } finally {
      setIsRegistering(false);
    }
  };

  const handleAssignInputChange = (e) => {
    const { name, value } = e.target;
    setAssignFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const fetchClientDetails = async (clientId) => {
    if (!clientId) return;
    setFetchingClient(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_FETCH_UNIT_LIMIT_API_URL || 'https://api.sat2farm.com/fetch-unit-limit/get-unit-limit'}?client_id=${clientId}`);
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
      const response = await fetch(`${import.meta.env.VITE_FETCH_UNIT_LIMIT_API_URL || 'https://api.sat2farm.com/fetch-unit-limit/get-unit-limit'}?username=${registerNumber}`);
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
    if (!assignFormData.addAcreage || !assignFormData.expiryDate || !assignFormData.client) {
      setAssignError('Please fill in all required fields');
      return;
    }

    setAssignLoading(true);
    setAssignError('');

    try {
      // Mock API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAssignSuccess(true);
      setAssignFormData({
        client: '',
        addAcreage: '',
        plan: ' 1 month',
        expiryDate: '',
        notes: '',
        registerNumber: ''
      });
    } catch (error) {
      setAssignError('Failed to assign acreage. Please try again.');
    } finally {
      setAssignLoading(false);
    }
  };

  // Mock data
  const mockData = {
    monthlyAcreage: {
      metrics: [
        { label: 'Total mapped area', value: '84,320', sub: '↑ 6.2% from last month', trend: 'up' },
        { label: 'Active clients', value: '142', sub: 'Across 9 states' },
        { label: 'Locked farms', value: '38', sub: '↑ 4 pending unlock', trend: 'down' },
        { label: 'Revenue (MRR)', value: '₹18.4L', sub: '↑ 11% MoM', trend: 'up' }
      ],
      cropData: [
        { crop: 'Banana', acres: '21,480 ac', percentage: 72 },
        { crop: 'Paddy', acres: '17,240 ac', percentage: 58 },
        { crop: 'Sugarcane', acres: '13,400 ac', percentage: 45 },
        { crop: 'Drumstick', acres: '9,560 ac', percentage: 32 },
        { crop: 'Papaya', acres: '6,580 ac', percentage: 22 },
        { crop: 'Other', acres: '16,060 ac', percentage: 53 }
      ],
      stateData: [
        { state: 'Karnataka', acres: '24,800 ac', percentage: '29%' },
        { state: 'Tamil Nadu', acres: '18,200 ac', percentage: '22%' },
        { state: 'Andhra Pradesh', acres: '14,100 ac', percentage: '17%' },
        { state: 'Maharashtra', acres: '11,800 ac', percentage: '14%' },
        { state: 'Telangana', acres: '8,620 ac', percentage: '10%' },
        { state: 'Others', acres: '6,800 ac', percentage: '8%' }
      ],
      clients: [
        { id: 'C-1042', name: 'GreenField Agro', avatar: 'GF', assigned: 8400, used: 7920, utilization: 94, crops: 'Banana, Paddy', state: 'Karnataka', status: 'Active' },
        { id: 'C-0887', name: 'Sunrise Farms', avatar: 'SR', assigned: 6200, used: 4800, utilization: 77, crops: 'Sugarcane', state: 'Tamil Nadu', status: 'Active' },
        { id: 'C-0994', name: 'Deccan Planters', avatar: 'DP', assigned: 5100, used: 5100, utilization: 100, crops: 'Drumstick, Papaya', state: 'Andhra Pradesh', status: 'Quota full' },
        { id: 'C-0712', name: 'Kaveri Holdings', avatar: 'KH', assigned: 4800, used: 2100, utilization: 44, crops: 'Paddy', state: 'Telangana', status: 'Trial' },
        { id: 'C-1110', name: 'Vijaya FarmTech', avatar: 'VF', assigned: 3600, used: 3240, utilization: 90, crops: 'Banana, Cotton', state: 'Maharashtra', status: 'Active' }
      ]
    },
    farmManagement: {
      metrics: [
        { label: 'Total farms', value: '1,284', sub: 'Across all clients', accent: true },
        { label: 'Active farms', value: '1,246', sub: '97% active rate', trend: 'up' },
        { label: 'Pending review', value: '12', sub: 'Needs action', trend: 'down' }
      ],
      farms: [
        { id: 'F-4421', name: 'Hebbal Block-A', client: 'GreenField Agro', location: 'Bengaluru, KA', area: 420, crop: 'Banana', added: '12 Jan 26', status: 'Active' },
        { id: 'F-3892', name: 'Coimbatore Plot-3', client: 'Sunrise Farms', location: 'Coimbatore, TN', area: 680, crop: 'Sugarcane', added: '8 Feb 26', status: 'Active' },
        { id: 'F-3671', name: 'Kurnool North', client: 'Deccan Planters', location: 'Kurnool, AP', area: 900, crop: 'Drumstick', added: '3 Mar 26', status: 'Pending' },
        { id: 'F-3210', name: 'Warangal East', client: 'Kaveri Holdings', location: 'Warangal, TS', area: 350, crop: 'Paddy', added: '15 Dec 25', status: 'Inactive' },
        { id: 'F-4012', name: 'Nashik Vineyard', client: 'Vijaya FarmTech', location: 'Nashik, MH', area: 540, crop: 'Grapes', added: '22 Feb 26', status: 'Active' }
      ]
    },
    unlockFarms: {
      requests: [
        { id: 'F-3671', name: 'Kurnool North', client: 'Deccan Planters', reason: 'Payment overdue', requestedBy: 'Ravi Shankar', date: '20 Mar 26' },
        { id: 'F-3210', name: 'Warangal East', client: 'Kaveri Holdings', reason: 'KYC incomplete', requestedBy: 'Sales Team', date: '18 Mar 26' },
        { id: 'F-4201', name: 'Mysuru Block-2', client: 'GreenField Agro', reason: 'Quota exceeded', requestedBy: 'Priya Nair', date: '15 Mar 26' },
        { id: 'F-3980', name: 'Hospet Plot-7', client: 'Vijaya FarmTech', reason: 'Manual review', requestedBy: 'Admin', date: '10 Mar 26' }
      ],
      bulkToggles: [
        { client: 'GreenField Agro', farms: 12, description: 'Lock all / unlock all in one click', enabled: true },
        { client: 'Kaveri Holdings', farms: 8, description: 'KYC pending — unlock after verification', enabled: false },
        { client: 'Deccan Planters', farms: 21, description: 'Payment confirmed on 22 Mar 26', enabled: true }
      ]
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      'Active': 'badge-green',
      'Pending': 'badge-amber',
      'Inactive': 'badge-red',
      'Trial': 'badge-blue',
      'Quota full': 'badge-amber'
    };
    return <span className={`badge ${statusClasses[status] || 'badge-gray'}`}>{status}</span>;
  };

  const getProgressClass = (utilization) => {
    if (utilization >= 100) return 'over';
    if (utilization < 50) return 'warn';
    return '';
  };

  return (
    <div className="sat2farm-portal-full">
      {/* MAIN CONTENT - FULL SCREEN */}
      <div className="main-full">
        {/* TOPBAR */}
        <div className="topbar" style={{backgroundColor: '#ffffff', borderBottom: '1px solid var(--border)'}}>
          <div className="tb-left">
            <div>
              <div className="tb-page">{views[currentView].title}</div>
              <div className="tb-sub">{views[currentView].sub}</div>
            </div>
          </div>
          <div className="tb-right">
            <div className="role-switcher">
              <span style={{fontSize: '10px', color: 'var(--text-3)', marginRight: '2px'}}>Role:</span>
              <button className={`role-btn ${currentRole === 'ops' ? 'active' : ''}`} onClick={() => handleRoleSwitch('ops')}>Ops</button>
              <button className={`role-btn ${currentRole === 'sales' ? 'active' : ''}`} onClick={() => handleRoleSwitch('sales')}>Sales</button>
              <button className={`role-btn ${currentRole === 'client' ? 'active' : ''}`} onClick={() => handleRoleSwitch('client')}>Client</button>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => openModal('new-modal')}>+ New</button>
          </div>
        </div>

        {/* CONTENT */}
        <div className="content-area">
          {/* ===================== VIEW: OPS ACREAGE ===================== */}
          {currentView === 'ops-acreage' && (
            <div className="view active">
              {/* Loading and Error States */}
              {loadingReport && (
                <div style={{textAlign: 'center', padding: '40px', color: 'var(--text-2)'}}>
                  <div style={{fontSize: '24px', marginBottom: '16px'}}>⏳</div>
                  <div>Loading monthly report data...</div>
                </div>
              )}
              
              {reportError && (
                <div style={{marginBottom: '16px', padding: '12px', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '6px'}}>
                  <strong>Error:</strong> {reportError}
                </div>
              )}

              {/* Report Data */}
              {!loadingReport && !reportError && (
                <>
                  <div className="metrics">
                    {(reportData?.metrics || mockData.monthlyAcreage.metrics).map((metric, index) => (
                      <div key={index} className={`metric ${metric.accent ? 'metric-accent' : ''}`}>
                        <div className="metric-label">{metric.label}</div>
                        <div className="metric-val">{metric.value}</div>
                        <div className={`metric-sub ${metric.trend === 'up' ? 'metric-up' : metric.trend === 'down' ? 'metric-down' : ''}`}>
                          {metric.sub}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="section-head">
                    <div className="section-title">Monthly acreage report</div>
                    <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                      <button className="btn btn-sm" onClick={() => window.open(monthlyData?.download_url, '_blank')}>↓ Export CSV</button>
                    </div>
                  </div>

                  <div className="month-tabs">
                    {availableMonths.map((month) => (
                      <div
                        key={month}
                        className={`month-chip ${selectedMonth === month ? 'active' : ''}`}
                        onClick={() => handleMonthSelect(month)}
                      >
                        {month}
                      </div>
                    ))}
                  </div>

                  <div className="two-col" style={{marginBottom: '16px'}}>
                    <div className="card">
                    <div className="card-head">
                      <span className="card-title">Top 5 Clients by Used Acreage</span>
                      <div className="month-chip">{selectedMonth}</div>
                    </div>
                    <div className="card-body">
                      {monthlyData?.top5_clients && monthlyData.top5_clients.length > 0 ? (
                        (() => {
                          const maxUsedArea = Math.max(...monthlyData.top5_clients.map(client => client.unlocked_area || 0));
                          return (
                            <div className="client-acreage-chart">
                              {monthlyData.top5_clients.map((client, index) => (
                                <div className="chart-item" key={index}>
                                  <div className="label">{client.full_name}</div>
                                  <div className="bar-wrap" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div className="bar-fill" style={{width: `${((client.unlocked_area || 0) / maxUsedArea) * 100}%`}}></div>
                                    <div className="value" style={{ 
                                      fontSize: '14px', 
                                      fontWeight: '700', 
                                      color: '#000000',
                                      backgroundColor: '#f3f4f6',
                                      padding: '2px 6px',
                                      borderRadius: '4px',
                                      border: '1px solid #d1d5db',
                                      minWidth: '80px',
                                      textAlign: 'center',
                                      boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                                    }}>{(client.unlocked_area || 0).toLocaleString()} ac</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          );
                        })()
                      ) : (
                        <p>No client acreage data available.</p>
                      )}
                    </div>
                  </div>
                    <div className="card">
                      <div className="card-head"><span className="card-title">State breakdown</span></div>
                      <div className="card-body">
                        <div className="stat-list">
                          {(reportData?.stateData || mockData.monthlyAcreage.stateData).map((state, index) => (
                            <div key={index} className="stat-row">
                              <span className="stat-key">{state.state}</span>
                              <span className="stat-val">{state.acres} <span style={{color: 'var(--text-3)', fontWeight: '400'}}>({state.percentage})</span></span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="card">
                    <div className="card-head">
                      <span className="card-title">Top clients by acreage</span>
                      <div className="search-bar">
                        <span className="search-icon">⌕</span>
                        <input type="text" placeholder="Search clients..."/>
                      </div>
                    </div>
                    <div className="tbl-wrap">
                      <table>
                        <thead>
                          <tr>
                            <th>Client ID</th>
                            <th>Full Name</th>
                            <th>Company Name</th>
                            <th>Mobile No</th>
                            <th>Date of Payment</th>
                            <th>Date of Expiry</th>
                            <th>Total Area Added</th>
                            <th>Monthly Used Area</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(monthlyData?.top5_clients || []).map((client, index) => {
                            console.log(`Client ${index} data:`, client); // Debug log
                            console.log(`Client ${index} ALL FIELDS:`, Object.keys(client)); // Show all available fields
                            console.log(`Client ${index} client_id:`, client.client_id); // Specific check for client_id
                            return (
                            <tr key={index}>
                              <td>
                                <div className="flex-cell">
                                  <div>
                                    
                                    <div className="tbl-sub">ID: {client.client_id || 'N/A'}</div>
                                  </div>
                                </div>
                              </td>
                          
                              <td>{client.full_name}</td>
                              <td>{client.company_name}</td>
                              <td>{client.mobile_no}</td>
                              <td>{client.dateOfPayment}</td>
                              <td>{client.dateOfExpiry}</td>
                              <td>{(client.Total_added_area || 0).toLocaleString()}</td>
                              <td>{(client.unlocked_area|| 0).toLocaleString()}</td>
                              
                            </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ===================== VIEW: OPS FARMS ===================== */}
          {currentView === 'ops-farms' && (
            <div className="view active">
              <div className="section-head">
                <div className="section-title">Farm management</div>
                <button className="btn btn-primary" onClick={() => openModal('add-farm-modal')}>+ Add farm</button>
              </div>
              <div className="metrics" style={{gridTemplateColumns: 'repeat(3, 1fr)'}}>
                {mockData.farmManagement.metrics.map((metric, index) => (
                  <div key={index} className={`metric ${metric.accent ? 'metric-accent' : ''}`}>
                    <div className="metric-label">{metric.label}</div>
                    <div className="metric-val">{metric.value}</div>
                    <div className={`metric-sub ${metric.trend === 'up' ? 'metric-up' : metric.trend === 'down' ? 'metric-down' : ''}`}>
                      {metric.sub}
                    </div>
                  </div>
                ))}
              </div>
              <div className="card">
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
                      {mockData.farmManagement.farms.map((farm, index) => (
                        <tr key={index}>
                          <td>
                            <div>
                              <div className="tbl-name">{farm.name}</div>
                              <div className="tbl-sub">#{farm.id}</div>
                            </div>
                          </td>
                          <td>{farm.client}</td>
                          <td>{farm.location}</td>
                          <td>{farm.area}</td>
                          <td>{farm.crop}</td>
                          <td>{farm.added}</td>
                          <td>{getStatusBadge(farm.status)}</td>
                          <td><button className="btn btn-ghost btn-sm">Edit</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ===================== VIEW: OPS UNLOCK ===================== */}
          {currentView === 'ops-unlock' && (
            <div className="view active">
              <div className="section-head">
                <div className="section-title">Farm unlock requests</div>
                <span className="badge badge-amber">{mockData.unlockFarms.requests.length} pending</span>
              </div>
              <div className="card" style={{marginBottom: '16px'}}>
                <div className="card-head"><span className="card-title">Pending unlock requests</span></div>
                <div className="tbl-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Farm</th>
                        <th>Client</th>
                        <th>Locked reason</th>
                        <th>Requested by</th>
                        <th>Date</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockData.unlockFarms.requests.map((request, index) => (
                        <tr key={index}>
                          <td>
                            <div>
                              <div className="tbl-name">{request.name}</div>
                              <div className="tbl-sub">#{request.id}</div>
                            </div>
                          </td>
                          <td>{request.client}</td>
                          <td>{request.reason}</td>
                          <td>{request.requestedBy}</td>
                          <td>{request.date}</td>
                          <td style={{display: 'flex', gap: '6px', alignItems: 'center', paddingTop: '13px'}}>
                            <button className="btn btn-primary btn-sm">Unlock</button>
                            <button className="btn btn-danger btn-sm">Deny</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="card">
                <div className="card-head"><span className="card-title">Unlock all farms — bulk toggle</span></div>
                <div className="card-body">
                  <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
                    {mockData.unlockFarms.bulkToggles.map((toggle, index) => (
                      <div key={index} style={{
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between', 
                        padding: '10px 12px', 
                        border: '1px solid var(--border-soft)', 
                        borderRadius: 'var(--r)'
                      }}>
                        <div>
                          <div className="tbl-name">{toggle.client} — all farms ({toggle.farms})</div>
                          <div className="tbl-sub">{toggle.description}</div>
                        </div>
                        <button className={`toggle ${toggle.enabled ? 'on' : ''}`}></button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODALS */}
      {modalOpen === 'new-modal' && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-head">
              <h3>Quick actions</h3>
              <button className="btn btn-ghost btn-sm" onClick={closeModal}>
                <X className="ic-xs" />
              </button>
            </div>
            <div className="modal-body">
              <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
                <button className="btn" style={{justifyContent: 'flex-start', textAlign: 'left'}} onClick={() => { openModal('add-farm-modal'); }}>
                  <span style={{marginRight: '8px'}}>+</span> Add new farm
                </button>
                <button className="btn" style={{justifyContent: 'flex-start', textAlign: 'left'}} onClick={() => { openModal('add-client-modal'); }}>
                  <span style={{marginRight: '8px'}}>+</span> Add new client
                </button>
                <button className="btn" style={{justifyContent: 'flex-start', textAlign: 'left'}} onClick={() => { closeModal(); openModal('assign-acreage-modal'); }}>
                  <span style={{marginRight: '8px'}}>+</span> Assign acreage to client
                </button>
                <button className="btn" style={{justifyContent: 'flex-start', textAlign: 'left'}} onClick={() => { handleNavigate('client-team'); closeModal(); }}>
                  <span style={{marginRight: '8px'}}>+</span> Add manager to team
                </button>
                <button className="btn" style={{justifyContent: 'flex-start', textAlign: 'left'}} onClick={() => { handleNavigate('client-alloc'); closeModal(); }}>
                  <span style={{marginRight: '8px'}}>+</span> Allocate acreage to manager
                </button>
                <button className="btn" style={{justifyContent: 'flex-start', textAlign: 'left'}} onClick={() => { openModal('unlock-farm-modal'); }}>
                  <span style={{marginRight: '8px'}}>+</span> Unlock farm
                </button>
                <button className="btn" style={{justifyContent: 'flex-start', textAlign: 'left'}} onClick={() => { openModal('add-registration-modal'); }}>
                  <span style={{marginRight: '8px'}}>+</span> Add new registration
                </button>
              </div>
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
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
                <div className="form-group" style={{gridColumn: 'span 2'}}>
                  <label>Company name</label>
                  <input type="text" placeholder="e.g. Agro Holdings Ltd" />
                </div>
                <div className="form-group">
                  <label>Contact name</label>
                  <input type="text" placeholder="Full name" />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" placeholder="contact@company.in" />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input type="tel" placeholder="+91 XXXXX XXXXX" />
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
                  <label>Plan</label>
                  <select>
                    <option>Trial</option>
                    <option>Stater</option>
                    <option>Growth</option>
                    <option>Enterprise</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Initial acreage (ac)</label>
                  <input type="number" placeholder="1000" />
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={closeModal}>Cancel</button>
              <button className="btn btn-primary">Create client</button>
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
                  <input
                    type="text"
                    value={unlockFarmId}
                    onChange={(e) => setUnlockFarmId(e.target.value)}
                    placeholder="Enter Farm ID"
                  />
                </div>

                <div className="form-group">
                  <label>Lock Status</label>
                  <select
                    value={unlockStatus}
                    onChange={(e) => setUnlockStatus(e.target.value)}
                  >
                    <option value="unlock">Unlock</option>
                    <option value="lock">Lock</option>
                  </select>
                </div>

                {unlockStatus === 'unlock' ? (
                  <>
                    <div className="form-group">
                      <label>Mode</label>
                      <select
                        value={unlockPaymentMode}
                        onChange={(e) => setUnlockPaymentMode(e.target.value)}
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
                        value={unlockExpiry}
                        onChange={(e) => setUnlockExpiry(e.target.value)}
                      >
                        <option value="3">3</option>
                        <option value="6">6</option>
                        <option value="12">12</option>
                        <option value="other">Other</option>
                      </select>
                      {unlockExpiry === 'other' && (
                        <input
                          type="text"
                          value={unlockCustomExpiry}
                          onChange={(e) => setUnlockCustomExpiry(e.target.value)}
                          placeholder="Enter custom expiry (e.g. 2)"
                          style={{marginTop: '8px'}}
                        />
                      )}
                    </div>
                  </>
                ) : (
                  <p style={{fontSize: '13px', color: 'var(--text-2)', fontStyle: 'italic'}}>
                    No payment/expiry required for lock.
                  </p>
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
              <button 
                className="btn btn-primary" 
                onClick={async () => {
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
                    
                    if (!response.ok) {
                      throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    
                    const data = await response.json();
                    
                    if (data && data.status !== 'Failure') {
                      const statusText = unlockStatus === 'lock' ? 'locked' : 'unlocked';
                      const successMessage = `Farm ID ${unlockFarmId.trim()} has been ${statusText} successfully!`;
                      alert(successMessage);
                      setUnlockMessage(successMessage);
                      
                      // Reset form
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
                }}
                disabled={unlockLoading}
              >
                {unlockLoading ? 'Processing...' : 'Update Status'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Registration Modal */}
      {modalOpen === 'add-registration-modal' && (
        <div className="modal-overlay">
          <div className="modal" style={{width: '900px', maxWidth: '95vw'}}>
            <div className="modal-head">
              <h3>{regSuccess ? 'Registration Successful!' : 'Create New Account'}</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => { closeModal(); setRegSuccess(false); setRegisteredUser(null); }}>
                <X className="ic-xs" />
              </button>
            </div>
            {!regSuccess ? (
              <>
                <div className="modal-body">
                  {regError && (
                    <div className="alert alert-danger" style={{marginBottom: '16px', padding: '10px', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '6px'}}>
                      {regError}
                    </div>
                  )}
                  <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
                    <div className="form-group">
                      <label>First Name *</label>
                      <input 
                        type="text" 
                        placeholder="Enter first name" 
                        value={regFormData.fName}
                        onChange={(e) => setRegFormData(prev => ({...prev, fName: e.target.value}))}
                      />
                    </div>
                    <div className="form-group">
                      <label>Last Name *</label>
                      <input 
                        type="text" 
                        placeholder="Enter last name" 
                        value={regFormData.lName}
                        onChange={(e) => setRegFormData(prev => ({...prev, lName: e.target.value}))}
                      />
                    </div>
                    <div className="form-group">
                      <label>Email Address *</label>
                      <input 
                        type="email" 
                        placeholder="Enter email address" 
                        value={regFormData.user_email}
                        onChange={(e) => setRegFormData(prev => ({...prev, user_email: e.target.value}))}
                      />
                    </div>
                    <div className="form-group">
                      <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                        <Phone className="input-icon" />
                        <label>Phone Number *</label>
                      </div>
                      <PhoneInput
                        country={'in'}
                        value={regFormData.fullPhoneNumber}
                        onChange={(value, country) => {
                          setRegFormData(prev => ({
                            ...prev,
                            country_code: `+${country.dialCode}`,
                            pNumber: value.slice(country.dialCode.length),
                            fullPhoneNumber: value
                          }));
                        }}
                        inputStyle={{
                          width: '100%',
                          height: '40px',
                          borderRadius: '8px',
                          border: '1px solid var(--border)',
                          fontSize: '14px',
                          paddingLeft: '48px'
                        }}
                        buttonStyle={{
                          borderRadius: '8px 0 0 8px',
                          border: '1px solid var(--border)',
                          backgroundColor: 'var(--bg-2)'
                        }}
                        containerStyle={{
                          marginTop: '8px'
                        }}
                      />
                    </div>
                    <div className="form-group">
                      <label>Account ID *</label>
                      <input 
                        type="text" 
                        placeholder="Enter account ID" 
                        value={regFormData.acc_id}
                        onChange={(e) => setRegFormData(prev => ({...prev, acc_id: e.target.value}))}
                      />
                    </div>
                    <div className="form-group">
                      <label>Referral Code</label>
                      <input 
                        type="text" 
                        placeholder="Enter referral code (optional)" 
                        value={regFormData.referal_code}
                        onChange={(e) => setRegFormData(prev => ({...prev, referal_code: e.target.value}))}
                      />
                    </div>
                    <div className="form-group">
                      <label>Category *</label>
                      <select 
                        value={regFormData.category}
                        onChange={(e) => setRegFormData(prev => ({...prev, category: e.target.value}))}
                      >
                        <option value="">Choose a role...</option>
                        <option value="farmer">Farmer</option>
                        <option value="Admin">Partner</option>
                        <option value="Franchise">Manager</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Password *</label>
                      <input 
                        type="password" 
                        placeholder="Enter password" 
                        value={regFormData.new_password}
                        onChange={(e) => setRegFormData(prev => ({...prev, new_password: e.target.value}))}
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-actions">
                  <button className="btn btn-ghost" onClick={closeModal}>Cancel</button>
                  <button 
                    className="btn btn-primary" 
                    onClick={handleRegisterSubmit}
                    disabled={isRegistering}
                  >
                    {isRegistering ? 'Registering...' : 'Register User'}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="modal-body" style={{padding: '32px 24px'}}>
                  {/* Success Message */}
                  <div style={{textAlign: 'center', marginBottom: '24px'}}>
                    <div className="metric metric-accent" style={{margin: '0 auto 16px', maxWidth: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                      <CheckCircle className="ic" style={{fontSize: '32px', color: 'var(--green-600)'}} />
                    </div>
                    <h3 style={{fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: 'var(--text-1)'}}>
                      User Registered Successfully
                    </h3>
                    <p style={{color: 'var(--text-2)', marginBottom: '16px'}}>
                      The user has been successfully registered in the system.
                    </p>
                  </div>

                  {/* Registered User Table */}
                  {registeredUser && (
                    <div className="card" style={{marginTop: '20px'}}>
                      <div className="card-head">
                        <span className="card-title">Current Registered User</span>
                        <span className="badge badge-blue">1 User</span>
                      </div>
                      <div className="card-body" style={{padding: '0', overflow: 'auto'}}>
                        <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '12px'}}>
                          <thead>
                            <tr style={{backgroundColor: 'var(--bg-2)', borderBottom: '1px solid var(--border)'}}>
                              <th style={{padding: '12px 8px', textAlign: 'left', fontWeight: '600', color: 'var(--text-2)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Name</th>
                              <th style={{padding: '12px 8px', textAlign: 'left', fontWeight: '600', color: 'var(--text-2)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Email</th>
                              <th style={{padding: '12px 8px', textAlign: 'left', fontWeight: '600', color: 'var(--text-2)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Phone</th>
                              <th style={{padding: '12px 8px', textAlign: 'left', fontWeight: '600', color: 'var(--text-2)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Category</th>
                              <th style={{padding: '12px 8px', textAlign: 'left', fontWeight: '600', color: 'var(--text-2)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Password</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr style={{borderBottom: '1px solid var(--border-soft)'}}>
                              <td style={{padding: '12px 8px'}}>{registeredUser.firstName} {registeredUser.lastName}</td>
                              <td style={{padding: '12px 8px'}}>{registeredUser.email}</td>
                              <td style={{padding: '12px 8px'}}>{registeredUser.phone}</td>
                              <td style={{padding: '12px 8px'}}>
                                <span className="badge badge-blue">{registeredUser.category}</span>
                              </td>
                              <td style={{padding: '12px 8px'}}>{registeredUser.password}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
                <div className="modal-actions">
                  <button 
                    className="btn btn-primary" 
                    onClick={() => { setRegSuccess(false); setRegisteredUser(null); }}
                    style={{padding: '8px 16px', fontSize: '13px'}}
                  >
                    OK
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
