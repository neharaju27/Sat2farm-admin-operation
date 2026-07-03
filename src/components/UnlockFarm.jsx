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
    // No redirects for any role - ops, sales, manager, or client
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
  
  // State for recently added farms (for manager and client roles)
  const [recentFarms, setRecentFarms] = useState([]);
  const [recentFarmsLoading, setRecentFarmsLoading] = useState(false);
  const [recentFarmsError, setRecentFarmsError] = useState('');
  const [activePage, setActivePage] = useState(0);
  const [selectedView, setSelectedView] = useState('added'); // 'added' or 'expiring'
  
  // State for ops role recent farms
  const [opsRecentFarms, setOpsRecentFarms] = useState([]);
  const [opsRecentFarmsLoading, setOpsRecentFarmsLoading] = useState(false);
  const [opsRecentFarmsError, setOpsRecentFarmsError] = useState('');
  const [opsActivePage, setOpsActivePage] = useState(0);
  
  // State for expiring farms
  const [expiringFarms, setExpiringFarms] = useState([]);
  const [expiringFarmsLoading, setExpiringFarmsLoading] = useState(false);
  const [expiringFarmsError, setExpiringFarmsError] = useState('');
  
  // State for acreages
  const [totalAcreage, setTotalAcreage] = useState(0);
  const [availableAcreage, setAvailableAcreage] = useState(0);
  const [usedAcreage, setUsedAcreage] = useState(0);
  const [acreageLoading, setAcreageLoading] = useState(false);
  
  // State for plan selection modal
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [selectedFarmId, setSelectedFarmId] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('');
  const [planLoading, setPlanLoading] = useState(false);

  // State for delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [farmToDelete, setFarmToDelete] = useState(null);

  // State for add farm modal
  const [selectedPolygonCategory, setSelectedPolygonCategory] = useState('');
  const [selectedUploadMethod, setSelectedUploadMethod] = useState('');
  const [showAddFarmModal, setShowAddFarmModal] = useState(false);
  const [addFarmModalStep, setAddFarmModalStep] = useState(1);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [extractedCoordinates, setExtractedCoordinates] = useState('');
  const [csvUploadedFile, setCsvUploadedFile] = useState(null);
  const [isCsvDragging, setIsCsvDragging] = useState(false);
  
  // State for farm details form
  const [farmName, setFarmName] = useState('');
  const [cropType, setCropType] = useState('');
  const [variety, setVariety] = useState('');
  const [sowingDate, setSowingDate] = useState('');
  const [irrigation, setIrrigation] = useState('');

  // State for farmer selection
  const [farmerSearchQuery, setFarmerSearchQuery] = useState('');
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [farmersList, setFarmersList] = useState([]);
  const [farmersListLoading, setFarmersListLoading] = useState(false);
  const [selectedFarmerApiKey, setSelectedFarmerApiKey] = useState('');
  const [isFetchingFarmerApiKey, setIsFetchingFarmerApiKey] = useState(false);
  const [isAddFarmSubmitting, setIsAddFarmSubmitting] = useState(false);

  const getSelectedFarmerId = (farmer = selectedFarmer) =>
    farmer?.user_id || farmer?.userId || farmer?.id;

  const getLoggedInMobileNumber = () => {
    const fallback = user?.phone_number || user?.phoneNumber || user?.username || '';
    try {
      const storedAuth = localStorage.getItem('sat2farm_auth');
      if (!storedAuth) return fallback;
      const authData = JSON.parse(storedAuth);
      return authData?.phone_number || authData?.username || fallback;
    } catch {
      return fallback;
    }
  };

  const getAdminApiKey = () => {
    if (user?.admin_api_key) return user.admin_api_key;
    try {
      const storedAuth = localStorage.getItem('sat2farm_auth');
      if (!storedAuth) return null;
      const authData = JSON.parse(storedAuth);
      return authData?.admin_api_key || null;
    } catch {
      return null;
    }
  };

  const fetchAdminApiKey = async () => {
    const mobileNo = getLoggedInMobileNumber();
    if (!mobileNo) {
      toast.error('Login mobile number not found.');
      return null;
    }

    const adminKeyBaseUrl = import.meta.env.VITE_GET_ADMIN_KEY_API_URL;
    if (!adminKeyBaseUrl) {
      toast.error('Admin key API URL is missing in .env');
      return null;
    }

    try {
      const response = await fetch(
        `${adminKeyBaseUrl}?mobile_no=${encodeURIComponent(mobileNo)}`,
        { method: 'GET' }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const apiKey =
        result?.api_key ||
        result?.admin_key ||
        result?.key ||
        result?.data?.api_key;

      if (!apiKey) {
        throw new Error('Admin API key not found in response');
      }

      try {
        const storedAuth = localStorage.getItem('sat2farm_auth');
        if (storedAuth) {
          const authData = JSON.parse(storedAuth);
          localStorage.setItem(
            'sat2farm_auth',
            JSON.stringify({ ...authData, admin_api_key: apiKey })
          );
        }
      } catch {
        // Ignore localStorage update errors
      }

      return apiKey;
    } catch (error) {
      console.error('Error fetching admin API key:', error);
      toast.error(`Failed to fetch admin API key: ${error.message}`);
      return null;
    }
  };

  const fetchFarmerDetailsList = async () => {
    const farmFilterBaseUrl = import.meta.env.VITE_FARM_FILTER_DETAILS_API_URL;
    if (!farmFilterBaseUrl) {
      toast.error('Farm filter details API URL is missing in .env');
      return;
    }

    const adminApiKey = getAdminApiKey() || (await fetchAdminApiKey());
    if (!adminApiKey) {
      return;
    }

    try {
      setFarmersListLoading(true);
      const response = await fetch(
        `${farmFilterBaseUrl}?api_key=${encodeURIComponent(adminApiKey)}`,
        { method: 'GET' }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const rawList = Array.isArray(result?.data) ? result.data : [];
      const farmerMap = new Map();

      rawList.forEach((item) => {
        const userId = item?.user_id;
        if (!userId || farmerMap.has(userId)) return;

        farmerMap.set(userId, {
          id: userId,
          user_id: userId,
          name: item.user_name || '',
          phone: item.phone_number || item.mobile_no || '',
          registeredDate: item.date_of_registration || '',
          user_key: item.user_key || ''
        });
      });

      const uniqueFarmers = Array.from(farmerMap.values()).sort((a, b) =>
        a.name.localeCompare(b.name)
      );
      setFarmersList(uniqueFarmers);
    } catch (error) {
      console.error('Error fetching farmer details list:', error);
      toast.error('Failed to fetch farmer details');
      setFarmersList([]);
    } finally {
      setFarmersListLoading(false);
    }
  };

  const fetchFarmerApiKey = async (farmer) => {
    const farmerId = getSelectedFarmerId(farmer);
    if (!farmerId) {
      toast.error('Farmer ID is missing');
      return null;
    }

    const fetchKeyBaseUrl = import.meta.env.VITE_FETCH_FARMER_KEY_API_URL;
    if (!fetchKeyBaseUrl) {
      toast.error('Fetch farmer key API URL is missing in .env');
      return null;
    }

    try {
      setIsFetchingFarmerApiKey(true);
      const response = await fetch(
        `${fetchKeyBaseUrl}?user_id=${encodeURIComponent(farmerId)}`,
        { method: 'GET' }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const apiKey =
        result?.api_key || result?.data?.api_key || result?.key || result?.data?.key;

      if (!apiKey) {
        throw new Error('Farmer API key not found in response');
      }

      setSelectedFarmerApiKey(apiKey);
      return apiKey;
    } catch (error) {
      console.error('Error fetching farmer API key:', error);
      toast.error(`Failed to fetch farmer API key: ${error.message}`);
      setSelectedFarmerApiKey('');
      return null;
    } finally {
      setIsFetchingFarmerApiKey(false);
    }
  };

  const openAddFarmModal = () => {
    setShowAddFarmModal(true);
    setAddFarmModalStep(0);
    setSelectedPolygonCategory('');
    setSelectedUploadMethod('');
    setUploadedFile(null);
    setSelectedFarmer(null);
    setFarmerSearchQuery('');
    setSelectedFarmerApiKey('');
    fetchFarmerDetailsList();
  };

  const formatSowingDate = (dateValue) => {
    if (!dateValue) return '';
    const [year, month, day] = dateValue.split('-');
    if (!year || !month || !day) return dateValue;
    return `${day}-${month}-${year}`;
  };

  const toCoordinatePayload = (pairs) => {
    if (!Array.isArray(pairs) || pairs.length < 3) return '';
    const cleaned = pairs
      .filter((pair) => Array.isArray(pair) && pair.length >= 2)
      .map(([lng, lat]) => [Number(lng), Number(lat)])
      .filter(([lng, lat]) => !Number.isNaN(lng) && !Number.isNaN(lat));

    return cleaned.length >= 3 ? JSON.stringify(cleaned) : '';
  };

  const parseKmlCoordinatePairs = (rawCoordinateText) => {
    if (!rawCoordinateText) return [];
    return rawCoordinateText
      .trim()
      .split(/\s+/)
      .map((tuple) => tuple.split(','))
      .filter((parts) => parts.length >= 2)
      .map(([lng, lat]) => [Number(lng), Number(lat)])
      .filter(([lng, lat]) => !Number.isNaN(lng) && !Number.isNaN(lat));
  };

  const parseCsvCoordinatePairs = (content) => {
    const lines = content
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    const pairs = [];
    for (const line of lines) {
      const parts = line.split(',').map((part) => part.trim());
      if (parts.length < 2) continue;

      const first = Number(parts[0]);
      const second = Number(parts[1]);
      if (Number.isNaN(first) || Number.isNaN(second)) {
        continue;
      }

      // If first value looks like latitude, convert to [lng, lat]
      if (Math.abs(first) <= 90 && Math.abs(second) <= 180) {
        pairs.push([second, first]);
      } else {
        pairs.push([first, second]);
      }
    }

    return pairs;
  };

  const buildCoordinatesPayload = (coordinateText) => {
    if (!coordinateText) return '';

    try {
      const parsed = JSON.parse(coordinateText);
      const payload = toCoordinatePayload(parsed);
      if (payload) return payload;
    } catch {
      // Not JSON; fallback to previous string parsing.
    }

    const kmlPairs = parseKmlCoordinatePairs(coordinateText);
    const payload = toCoordinatePayload(kmlPairs);
    return payload || '';
  };

  const handleAddFarmSubmit = async () => {
    const farmerId = getSelectedFarmerId();
    if (!farmerId) {
      toast.error('Please select a farmer');
      return;
    }

    const addFarmBaseUrl = import.meta.env.VITE_ADD_FARM_API_URL;
    if (!addFarmBaseUrl) {
      toast.error('Add farm API URL is missing in .env');
      return;
    }

    const coordinatesPayload = buildCoordinatesPayload(extractedCoordinates);
    if (!coordinatesPayload) {
      toast.error('Invalid coordinates. Please upload a valid file.');
      return;
    }

    const farmerApiKey =
      selectedFarmerApiKey || (await fetchFarmerApiKey(selectedFarmer));
    if (!farmerApiKey) {
      return;
    }

    try {
      setIsAddFarmSubmitting(true);

      const queryParams = new URLSearchParams({
        name: farmName,
        coordinates: coordinatesPayload,
        croptype: cropType,
        category: selectedPolygonCategory.toLowerCase().replace(/\s+/g, '_'),
        sowingdate: formatSowingDate(sowingDate),
        crop_variety: variety || '',
        api_key: farmerApiKey
      });

      const apiUrl = `${addFarmBaseUrl}?${queryParams.toString()}`;
      const response = await fetch(apiUrl, {
        method: 'GET'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result?.status && String(result.status).toLowerCase() === 'failed') {
        throw new Error(result?.message || 'Failed to add farm');
      }

      toast.success(`${selectedPolygonCategory} farm added successfully!`);
      console.log('Farm add API response:', result);
      setShowAddFarmModal(false);
      setAddFarmModalStep(1);
      setSelectedPolygonCategory('');
      setSelectedUploadMethod('');
      setUploadedFile(null);
      setFarmName('');
      setCropType('');
      setVariety('');
      setSowingDate('');
      setIrrigation('');
      setExtractedCoordinates('');
      setSelectedFarmer(null);
      setFarmerSearchQuery('');
      setSelectedFarmerApiKey('');
    } catch (error) {
      console.error('Error adding farm:', error);
      toast.error(`Failed to add farm: ${error.message}`);
    } finally {
      setIsAddFarmSubmitting(false);
    }
  };

  // Function to parse KML file and extract coordinates
  const parseKMLFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = String(e.target.result || '');
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(content, 'text/xml');
      
      // Try to find coordinates in different possible locations
      const coordinatesElements = xmlDoc.getElementsByTagName('coordinates');
      if (coordinatesElements.length > 0) {
        const coordinates = coordinatesElements[0].textContent.trim();
        const pairs = parseKmlCoordinatePairs(coordinates);
        const payload = toCoordinatePayload(pairs);

        if (payload) {
          setExtractedCoordinates(payload);
          console.log('Extracted coordinates:', payload);
        } else {
          setExtractedCoordinates('');
          toast.error('No valid coordinates found in KML file');
        }
      } else {
        setExtractedCoordinates('');
        toast.error('No coordinates found in KML file');
      }
    };
    reader.onerror = () => {
      toast.error('Error reading KML file');
    };
    reader.readAsText(file);
  };

  // Function to parse CSV file and extract coordinates
  const parseCSVFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = String(e.target.result || '');
      const pairs = parseCsvCoordinatePairs(content);
      const payload = toCoordinatePayload(pairs);

      if (payload) {
        setExtractedCoordinates(payload);
        console.log('Extracted coordinates from CSV:', payload);
      } else {
        setExtractedCoordinates('');
        toast.error('No valid coordinates found in CSV file');
      }
    };
    reader.onerror = () => {
      toast.error('Error reading CSV file');
    };
    reader.readAsText(file);
  };

  // Function to fetch top 50 recently added farms
  const fetchRecentFarms = async () => {
    // Fetch for client, manager, ops, sales, and partner roles
    if (currentRole !== 'client' && currentRole !== 'manager' && currentRole !== 'ops' && currentRole !== 'sales' && currentRole !== 'partner') {
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

      // Check if original user role is partner to use partner API
      const originalRole = user?.role || user?.user_role || '';
      const isPartner = originalRole.toLowerCase() === 'partner';

      // Call appropriate API based on role
      let apiUrl;
      if (isPartner) {
        apiUrl = import.meta.env.VITE_FETCH_50_FARMS_PARTNER_API_URL + `?phone_number=${userMobileNumber}`;
      } else {
        apiUrl = import.meta.env.VITE_FETCH_50_FARMS_API_URL + `?mobile_no=${userMobileNumber}`;
      }
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
      
      // Handle different response structures
      let farmsArray = null;
      if (data && data.status === "Success" && data.data && Array.isArray(data.data)) {
        farmsArray = data.data;
      } else if (Array.isArray(data)) {
        farmsArray = data;
      }

      if (farmsArray && farmsArray.length > 0) {
        // Format the API response data to match the expected structure
        const formattedFarms = farmsArray.map((farm, index) => ({
          farmId: farm.farm_id || farm.farmId || `FARM${String(index + 1).padStart(5, '0')}`,
          farmName: farm.farm_name || farm.farmName || 'Unknown Farm',
          region: farm.state || farm.region || 'Unknown Region',
          area: farm.area ? `${farm.area} acre` : 'N/A',
          createdTime: farm.created_time || farm.createdTime || farm.added_time || 'N/A',
          expiryTime: farm.expiry_time || farm.expiry || farm.expiry_date || 'N/A',
          status: farm.farm_status || 'N/A',
          adminName: isPartner ? (farm.admin_name || farm.adminName || farm.adminname || 'N/A') : undefined
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

  // Function to fetch top 50 recently added farms for ops role
  const fetchOpsRecentFarms = async () => {
    // Only fetch for ops role
    if (currentRole !== 'ops') {
      return;
    }

    setOpsRecentFarmsLoading(true);
    setOpsRecentFarmsError('');

    try {
      const apiUrl = import.meta.env.VITE_OPS_RECENT_FARMS_API_URL;
      console.log('Fetching ops recent farms:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
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
      console.log('Ops recent farms API response:', data);
      
      if (data && Array.isArray(data)) {
        // Format the API response data to match the expected structure
        const formattedFarms = data.map((farm, index) => ({
          farmId: farm.farm_id || farm.farmId || `FARM${String(index + 1).padStart(5, '0')}`,
          farmName: farm.farm_name || farm.farmName || 'Unknown Farm',
          region: farm.state || farm.region || 'Unknown Region',
          area: farm.area ? `${farm.area} acre` : (farm.area ? `${farm.area} acre` : 'N/A'),
          createdTime: farm.created_time || farm.createdTime || farm.added_time || 'N/A',
          clientId: farm.client_id || farm.clientId || farm.user_id || farm.userId || 'N/A'
        }));
        
        setOpsRecentFarms(formattedFarms);
        console.log(`Successfully loaded ${formattedFarms.length} ops farms`);
      } else if (data && data.status === "Success" && data.data && Array.isArray(data.data)) {
        // Handle if API returns data in {status: "Success", data: [...]} format
        const formattedFarms = data.data.map((farm, index) => ({
          farmId: farm.farm_id || farm.farmId || `FARM${String(index + 1).padStart(5, '0')}`,
          farmName: farm.farm_name || farm.farmName || 'Unknown Farm',
          region: farm.state || farm.region || 'Unknown Region',
          area: farm.area ? `${farm.area} acre` : 'N/A',
          createdTime: farm.created_time || farm.createdTime || farm.added_time || 'N/A',
          clientId: farm.client_id || farm.clientId || farm.user_id || farm.userId || 'N/A'
        }));
        
        setOpsRecentFarms(formattedFarms);
        console.log(`Successfully loaded ${formattedFarms.length} ops farms`);
      } else {
        console.log('API response structure:', data);
        setOpsRecentFarmsError('No farms data received from server');
      }
    } catch (error) {
      console.error('Error fetching ops recent farms:', error);
      setOpsRecentFarmsError('Failed to fetch recent farms');
    } finally {
      setOpsRecentFarmsLoading(false);
    }
  };

  // Function to fetch top 50 expiring farms
  const fetchExpiringFarms = async () => {
    // Only fetch for client, manager, and partner roles
    if (currentRole !== 'client' && currentRole !== 'manager' && currentRole !== 'partner') {
      return;
    }

    setExpiringFarmsLoading(true);
    setExpiringFarmsError('');

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
        setExpiringFarmsError('User mobile number not found. Please login again.');
        return;
      }

      // Check if original user role is partner to use partner API
      const originalRole = user?.role || user?.user_role || '';
      const isPartner = originalRole.toLowerCase() === 'partner';

      // Call appropriate API based on role
      let apiUrl;
      if (isPartner) {
        apiUrl = import.meta.env.VITE_EXPIRING_FARMS_PARTNER_API_URL + `?phone_number=${userMobileNumber}`;
      } else {
        apiUrl = import.meta.env.VITE_EXPIRING_FARMS_API_URL + `?mobile_no=${userMobileNumber}`;
      }
      console.log('Fetching expiring farms:', apiUrl);
      
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
      console.log('Expiring farms API response:', data);
      
      if (data && data.status === "Success" && data.data && Array.isArray(data.data)) {
        // Format the API response data to match the expected structure
        const formattedFarms = data.data.map((farm, index) => ({
          farmId: farm.farm_id || `FARM${String(index + 1).padStart(5, '0')}`,
          farmName: farm.farm_name || 'Unknown Farm',
          region: farm.state || 'Unknown Region',
          area: farm.area ? `${farm.area} acre` : 'N/A',
          createdTime: farm.created_time || 'N/A',
          expiryTime: farm.date_of_expiry || 'N/A',
          status: farm.farm_status || 'N/A',
          adminName: isPartner ? (farm.admin_name || farm.adminName || farm.adminname || 'N/A') : undefined
        }));
        
        setExpiringFarms(formattedFarms);
        console.log(`Successfully loaded ${formattedFarms.length} expiring farms`);
      } else {
        console.log('API response structure:', data);
        setExpiringFarmsError('No expiring farms data received from server');
      }
    } catch (error) {
      console.error('Error fetching expiring farms:', error);
      setExpiringFarmsError('Failed to fetch expiring farms');
    } finally {
      setExpiringFarmsLoading(false);
    }
  };

  // Function to fetch acreages data
  const fetchAcreages = async () => {
    setAcreageLoading(true);
    
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
        console.error('User mobile number not found');
        return;
      }

      // Call API to fetch available area
      const apiUrl = import.meta.env.VITE_AVAILABLE_AREA_API_URL + `?mobile_no=${userMobileNumber}`;
      console.log('Fetching acreages:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        console.error('Failed to fetch acreages:', response.status);
        return;
      }
      
      const data = await response.json();
      console.log('Acreages API response:', data);
      
      if (data && data.status === "Success" && data.data) {
        setAvailableAcreage(data.data.available_area || 0);
        setUsedAcreage(data.data.used_area || 0);
      }
    } catch (error) {
      console.error('Error fetching acreages:', error);
    } finally {
      setAcreageLoading(false);
    }
  };

  // Function to fetch superadmin area data for partner role
  const fetchSuperadminArea = async () => {
    setAcreageLoading(true);
    
    try {
      // Get user mobile number from login storage
      const storedAuth = localStorage.getItem('sat2farm_auth');
      let userMobileNumber = null;
      
      if (storedAuth) {
        try {
          const authData = JSON.parse(storedAuth);
          userMobileNumber = authData.phone_number;
        } catch (e) {
          console.error('Error parsing auth data:', e);
        }
      }
      
      if (!userMobileNumber) {
        console.error('User mobile number not found');
        return;
      }

      // Call API to fetch superadmin area data
      const apiUrl = import.meta.env.VITE_FETCH_SUPERADMIN_AREA_API_URL + `?mobile_no=${userMobileNumber}`;
      console.log('Fetching superadmin area:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        console.error('Failed to fetch superadmin area:', response.status);
        return;
      }
      
      const data = await response.json();
      console.log('Superadmin area API response:', data);
      
      if (data && data.data) {
        setTotalAcreage(data.data.total_area || 0);
        setAvailableAcreage(data.data.available_area || 0);
        setUsedAcreage(data.data.used_area || 0);
      }
    } catch (error) {
      console.error('Error fetching superadmin area:', error);
    } finally {
      setAcreageLoading(false);
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
        method:'GET'
      });
      
      if (!response.ok) {
        if (response.status === 500 || response.status === 503 || response.status === 502) {
          throw new Error('Service unavailable');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Unlock API response:', data);
      
      if (data && data.status !== 'Failure') {
        toast.success(`Farm ID ${selectedFarmId} has been unlocked successfully with ${selectedPlan} month plan!`);
        setMessage(`Farm ID ${selectedFarmId} has been unlocked successfully with ${selectedPlan} month plan!`);
        
        // Remove the unlocked farm from the appropriate list based on current view
        if (selectedView === 'added') {
          setRecentFarms(prev => prev.filter(farm => farm.farmId !== selectedFarmId));
        } else {
          setExpiringFarms(prev => prev.filter(farm => farm.farmId !== selectedFarmId));
        }
        
        // Close the modal
        setShowPlanModal(false);
        setSelectedFarmId('');
        setSelectedPlan('');
      } else {
        const errorMessage = data?.message || 'Farm already unlocked';
        // Check if the farm is already unlocked - treat this as success since farm is in desired state
        if (errorMessage.toLowerCase().includes('already unlock') || errorMessage.toLowerCase().includes('already unlocked')) {
          toast.success(`Farm ID ${selectedFarmId} is already unlocked!`);
          setMessage(`Farm ID ${selectedFarmId} is already unlocked!`);
          
          // Remove the farm from the list since it's already unlocked
          if (selectedView === 'added') {
            setRecentFarms(prev => prev.filter(farm => farm.farmId !== selectedFarmId));
          } else {
            setExpiringFarms(prev => prev.filter(farm => farm.farmId !== selectedFarmId));
          }
          
          // Close the modal
          setShowPlanModal(false);
          setSelectedFarmId('');
          setSelectedPlan('');
        } else {
          setFormError(errorMessage);
          toast.error(errorMessage);
        }
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

  // Function to open delete confirmation modal
  const openDeleteModal = (farmId, index) => {
    setFarmToDelete({ farmId, index });
    setShowDeleteModal(true);
  };

  // Function to close delete confirmation modal
  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setFarmToDelete(null);
  };

  // Function to delete a farm
  const handleDeleteFarm = async () => {
    if (!farmToDelete) return;

    const { farmId } = farmToDelete;
    console.log('=== DELETE FUNCTION START ===');
    console.log('farmId:', farmId);

    closeDeleteModal();
    setFormLoading(true);
    setFormError('');

    try {
      // Get user mobile number from login storage
      const storedAuth = localStorage.getItem('sat2farm_auth');
      let userMobileNumber = null;

      console.log('storedAuth:', storedAuth);

      if (storedAuth) {
        try {
          const authData = JSON.parse(storedAuth);
          userMobileNumber = authData.phone_number;
          console.log('authData:', authData);
          console.log('userMobileNumber:', userMobileNumber);
        } catch (e) {
          console.error('Error parsing auth data:', e);
        }
      }

      if (!userMobileNumber) {
        console.log('=== NO MOBILE NUMBER FOUND ===');
        setFormError('User mobile number not found. Please login again.');
        toast.error('User mobile number not found. Please login again.');
        setFormLoading(false);
        return;
      }

      // Call delete API with mobile_no and farm_id parameters
      const apiUrl = import.meta.env.VITE_DELETE_FARM_API_URL + `?mobile_no=${userMobileNumber}&farm_id=${farmId}`;
      console.log('=== CALLING DELETE API ===');
      console.log('API URL:', apiUrl);
      console.log('VITE_DELETE_FARM_API_URL:', import.meta.env.VITE_DELETE_FARM_API_URL);

      const response = await fetch(apiUrl, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('=== API RESPONSE RECEIVED ===');
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('=== API RESPONSE DATA ===');
      console.log('Response data:', data);

      if (data && data.status !== 'Failure') {
        console.log('=== DELETE SUCCESSFUL ===');
        toast.success(`Farm ID ${farmId} has been deleted successfully!`);

        // Remove the deleted farm from the appropriate list based on current view
        if (selectedView === 'added') {
          setRecentFarms(prev => prev.filter(farm => farm.farmId !== farmId));
        } else {
          setExpiringFarms(prev => prev.filter(farm => farm.farmId !== farmId));
        }
      } else {
        console.log('=== DELETE FAILED ===');
        const errorMessage = data?.message || 'Failed to delete farm';
        setFormError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (err) {
      console.error('=== API ERROR ===');
      console.error('Error:', err);
      const errorMessage = `Failed to delete farm: ${err.message}`;
      setFormError(errorMessage);
      toast.error(errorMessage);
    } finally {
      console.log('=== DELETE FUNCTION END ===');
      setFormLoading(false);
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
      // Step 1: Validate farm access for partner role (check first)
      if (user?.role === 'partner' || user?.user_role === 'partner') {
        // Get user data from AuthContext storage
        const storedAuth = localStorage.getItem('sat2farm_auth');
        let userMobileNumber = null;
        
        if (storedAuth) {
          try {
            const authData = JSON.parse(storedAuth);
            userMobileNumber = authData.phone_number;
          } catch (e) {
            console.error('Error parsing auth data:', e);
          }
        }
        
        if (!userMobileNumber) {
          setFarmDetailsError('User mobile number not found. Please login again.');
          return;
        }

        // Check if farm ID is under super admin access
        const superFarmCheckUrl = import.meta.env.VITE_FETCH_SUPER_FARM_API_URL + `?mobile_no=${userMobileNumber}&farm_id=${farmIdValue.trim()}`;
        console.log('Checking super admin farm access:', superFarmCheckUrl);
        
        const superFarmResponse = await fetch(superFarmCheckUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        const superFarmData = await superFarmResponse.json();
        console.log('Super admin farm access response:', superFarmData);
        
        // Check if access is granted - look for success indicators (case-insensitive)
        const isAccessGranted = superFarmData.message?.toLowerCase() === "access granted" || 
                              superFarmData.status?.toLowerCase() === "success" || 
                              superFarmData.success === true ||
                              (superFarmData.data && superFarmData.data.access === true);
        
        if (!isAccessGranted) {
          setFarmDetailsError('Access denied: This farm ID is not under your super admin access.');
          return;
        }
        
        console.log('Super admin farm access validation successful');
      }
      // Step 2: Validate referral code for manager and client roles (non-partner)
      else if (currentRole === 'manager' || currentRole === 'client') {
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
          area: data.data.area ? `${data.data.area} acre` : 'N/A',
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
      // Step 1: Verify farm ownership first (for client and manager roles)
      if (currentRole === 'client' || currentRole === 'manager') {
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
        // Try to get the error message from the response body
        let errorDetails = '';
        try {
          const errorData = await response.json();
          errorDetails = errorData?.message || JSON.stringify(errorData);
        } catch {
          try {
            errorDetails = await response.text();
          } catch {
            errorDetails = 'No error details available';
          }
        }
        
        if (response.status === 500 || response.status === 503 || response.status === 502) {
          throw new Error(`Service unavailable: ${errorDetails}`);
        }
        if (response.status === 400) {
          throw new Error(`Bad Request - ${errorDetails}`);
        }
        throw new Error(`HTTP error! status: ${response.status} - ${errorDetails}`);
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
      
      const apiMessage = data?.message || `Farm ID ${farmId.trim()} has been ${status === 'lock' ? 'locked' : 'unlocked'} successfully!`;
      const wasSuccessful = data?.status?.toLowerCase() === 'success';
      
      if (wasSuccessful) {
        toast.success(apiMessage);
        setMessage(apiMessage);
        
        // Reset form only when the operation is truly completed or idempotent success
        setFarmId('');
        setStatus('unlock');
        setPaymentMode('cash');
        setExpiry('6');
        setCustomExpiry('');
      } else {
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

  // useEffect to fetch recent farms on component load
  useEffect(() => {
    if (currentRole === 'ops' || currentRole === 'sales') {
      fetchOpsRecentFarms();
    } else if (currentRole === 'client' || currentRole === 'manager' || currentRole === 'partner') {
      if (selectedView === 'added') {
        fetchRecentFarms();
      } else {
        fetchExpiringFarms();
      }
    }
  }, [currentRole, selectedView]);

  // useEffect to fetch acreages on component load
  useEffect(() => {
    if (currentRole === 'partner') {
      fetchSuperadminArea();
    } else {
      fetchAcreages();
    }
  }, [currentRole]);

  
  return (
    <div className="content-area" style={{backgroundColor: '#ffffff', padding: '0', overflow: 'auto', height: '100vh', width: '100%'}}>
      {/* Top Navigation Bar - Full Width */}
      <div className="topbar" style={{marginBottom: '16px', marginLeft: '0', marginRight: '0', backgroundColor: '#ffffff', borderBottom: '1px solid var(--border)', padding: '0 24px'}}>
        <div className="tb-left">
          <div>
            <div className="tb-page">Farms</div>
            <div className="tb-sub">
              {currentRole === 'ops' ? 'Operations · Access Control' : 
               currentRole === 'sales' ? 'Sales · Access Control' : 
               currentRole === 'manager' ? 'Manager · Access Control' :
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
          <div className="section-title">Farm requests</div>
        </div>
        {(currentRole === 'manager' || currentRole === 'client') && (
          <button className="btn btn-primary btn-sm" onClick={openAddFarmModal}>+ Add Farms</button>
        )}
      </div>

      {/* Acreages Cards - Only for Manager */}
      {currentRole === 'manager' && (
        <div style={{display: 'flex', gap: '16px', padding: '0 24px', marginBottom: '16px'}}>
          <div className="card" style={{flex: 1}}>
            <div className="card-body" style={{padding: '16px'}}>
              <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                <div style={{fontSize: '13px', color: 'var(--text-2)', fontWeight: '500'}}>Available Acreages</div>
                <div style={{fontSize: '28px', color: 'var(--text-1)', fontWeight: '600'}}>
                  {acreageLoading ? '...' : availableAcreage}
                </div>
              </div>
            </div>
          </div>
          <div className="card" style={{flex: 1}}>
            <div className="card-body" style={{padding: '16px'}}>
              <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                <div style={{fontSize: '13px', color: 'var(--text-2)', fontWeight: '500'}}>Used Acreages</div>
                <div style={{fontSize: '28px', color: 'var(--text-1)', fontWeight: '600'}}>
                  {acreageLoading ? '...' : usedAcreage}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Acreages Cards - Only for Partner */}
      {currentRole === 'partner' && (
        <div style={{display: 'flex', gap: '16px', padding: '0 24px', marginBottom: '16px'}}>
          <div className="card" style={{flex: 1}}>
            <div className="card-body" style={{padding: '16px'}}>
              <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                <div style={{fontSize: '13px', color: 'var(--text-2)', fontWeight: '500'}}>Total Area</div>
                <div style={{fontSize: '28px', color: 'var(--text-1)', fontWeight: '600'}}>
                  {acreageLoading ? '...' : totalAcreage}
                </div>
              </div>
            </div>
          </div>
          <div className="card" style={{flex: 1}}>
            <div className="card-body" style={{padding: '16px'}}>
              <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                <div style={{fontSize: '13px', color: 'var(--text-2)', fontWeight: '500'}}>Available Area</div>
                <div style={{fontSize: '28px', color: 'var(--text-1)', fontWeight: '600'}}>
                  {acreageLoading ? '...' : availableAcreage}
                </div>
              </div>
            </div>
          </div>
          <div className="card" style={{flex: 1}}>
            <div className="card-body" style={{padding: '16px'}}>
              <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                <div style={{fontSize: '13px', color: 'var(--text-2)', fontWeight: '500'}}>Used Area</div>
                <div style={{fontSize: '28px', color: 'var(--text-1)', fontWeight: '600'}}>
                  {acreageLoading ? '...' : usedAcreage}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
                {currentRole === 'client' || currentRole === 'manager' ? (
                  // Client and Manager user options
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && farmToDelete && (
        <div className="modal-overlay">
          <div className="modal" style={{width: '400px', maxWidth: '90vw'}}>
            <div className="modal-head">
              <h3>Confirm Delete</h3>
              <button className="btn btn-ghost btn-sm" onClick={closeDeleteModal}>
                <X className="ic-xs" />
              </button>
            </div>
            <div className="modal-body">
              <div style={{padding: '16px 0'}}>
                <p style={{fontSize: '14px', color: 'var(--text-1)', marginBottom: '8px'}}>
                  Are you sure you want to delete Farm ID <strong>{farmToDelete.farmId}</strong>?
                </p>
                <p style={{fontSize: '12px', color: 'var(--text-3)'}}>
                  This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="modal-foot">
              <button 
                className="btn btn-ghost" 
                onClick={closeDeleteModal}
                disabled={formLoading}
              >
                No
              </button>
              <button 
                className="btn btn-danger" 
                onClick={handleDeleteFarm}
                disabled={formLoading}
              >
                {formLoading ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Combined Add Farm Modal */}
      {showAddFarmModal && (
        <div className="modal-overlay">
          <div className="modal" style={{width: addFarmModalStep === 3 ? '600px' : '550px', maxWidth: '95vw', maxHeight: '85vh', display: 'flex', flexDirection: 'column'}}>
            <div className="modal-head">
              <h3>
                {addFarmModalStep === 0 && 'Select Farmer'}
                {addFarmModalStep === 1 && 'Choose a Polygon Category'}
                {addFarmModalStep === 2 && `Upload ${selectedPolygonCategory}`}
                {addFarmModalStep === 3 && `Upload using ${selectedUploadMethod} file - ${selectedPolygonCategory}`}
                {addFarmModalStep === 4 && 'Farm Details'}
              </h3>
              <button className="btn btn-ghost btn-sm" onClick={() => { setShowAddFarmModal(false); setAddFarmModalStep(0); setSelectedPolygonCategory(''); setSelectedUploadMethod(''); setUploadedFile(null); setFarmName(''); setCropType(''); setVariety(''); setSowingDate(''); setIrrigation(''); setSelectedFarmer(null); setFarmerSearchQuery(''); }}>
                <X className="ic-xs" />
              </button>
            </div>
            <div className="modal-body" style={{flex: 1, overflow: 'auto'}}>
              {/* Step 0: Select Farmer */}
              {addFarmModalStep === 0 && (
                <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
                  <input
                    type="text"
                    placeholder="Search farmer by name or ID..."
                    value={farmerSearchQuery}
                    onChange={(e) => setFarmerSearchQuery(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                      backgroundColor: 'var(--bg-2)',
                      color: 'var(--text-1)',
                      fontSize: '14px'
                    }}
                  />
                  <div style={{display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '400px', overflow: 'auto'}}>
                    {farmersListLoading && (
                      <div style={{padding: '12px', color: 'var(--text-2)', fontSize: '13px'}}>Loading farmers...</div>
                    )}
                    {!farmersListLoading && farmersList.length === 0 && (
                      <div style={{padding: '12px', color: 'var(--text-2)', fontSize: '13px'}}>No farmers found.</div>
                    )}
                    {farmersList
                      .filter(farmer =>
                        farmer.name.toLowerCase().includes(farmerSearchQuery.toLowerCase()) ||
                        String(farmer.id).includes(farmerSearchQuery)
                      )
                      .map(farmer => (
                        <div
                          key={farmer.id}
                          onClick={async () => {
                            setSelectedFarmer(farmer);
                            const key = await fetchFarmerApiKey(farmer);
                            if (key) {
                              setAddFarmModalStep(1);
                            }
                          }}
                          style={{
                            padding: '16px',
                            backgroundColor: 'var(--bg-2)',
                            border: '1px solid var(--border)',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          onMouseOver={(e) => e.target.style.borderColor = 'var(--primary)'}
                          onMouseOut={(e) => e.target.style.borderColor = 'var(--border)'}
                        >
                          <div style={{fontWeight: '600', marginBottom: '8px', color: 'var(--text-1)'}}>
                            {farmer.name}
                          </div>
                          <div style={{borderTop: '1px solid var(--border)', paddingTop: '8px'}}>
                            <div style={{fontSize: '12px', color: 'var(--text-2)', marginBottom: '4px'}}>
                              <strong>ID:</strong> {farmer.id}
                            </div>
                            <div style={{fontSize: '12px', color: 'var(--text-2)', marginBottom: '4px'}}>
                              <strong>Phone:</strong> {farmer.phone}
                            </div>
                            <div style={{fontSize: '12px', color: 'var(--text-2)'}}>
                              <strong>Registered Date:</strong> {farmer.registeredDate}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Step 1: Choose Polygon Category */}
              {addFarmModalStep === 1 && (
                <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
                  <button 
                    className="btn" 
                    style={{justifyContent: 'flex-start', textAlign: 'left', padding: '16px'}}
                    onClick={() => { setSelectedPolygonCategory('Farm'); setAddFarmModalStep(2); }}
                  >
                    <div>
                      <strong>Farm</strong>
                      <div style={{fontSize: '12px', color: 'var(--text-2)', marginTop: '4px'}}>
                        Add a new farm polygon
                      </div>
                    </div>
                  </button>
                  <button 
                    className="btn" 
                    style={{justifyContent: 'flex-start', textAlign: 'left', padding: '16px'}}
                    onClick={() => { setSelectedPolygonCategory('Aquaculture'); setAddFarmModalStep(2); }}
                  >
                    <div>
                      <strong>Aquaculture</strong>
                      <div style={{fontSize: '12px', color: 'var(--text-2)', marginTop: '4px'}}>
                        Add an aquaculture polygon
                      </div>
                    </div>
                  </button>
                  <button 
                    className="btn" 
                    style={{justifyContent: 'flex-start', textAlign: 'left', padding: '16px'}}
                    onClick={() => { setSelectedPolygonCategory('Polyhouse'); setAddFarmModalStep(2); }}
                  >
                    <div>
                      <strong>Polyhouse</strong>
                      <div style={{fontSize: '12px', color: 'var(--text-2)', marginTop: '4px'}}>
                        Add a polyhouse polygon
                      </div>
                    </div>
                  </button>
                  <button 
                    className="btn" 
                    style={{justifyContent: 'flex-start', textAlign: 'left', padding: '16px'}}
                    onClick={() => { setSelectedPolygonCategory('Terrace Garden'); setAddFarmModalStep(2); }}
                  >
                    <div>
                      <strong>Terrace Garden</strong>
                      <div style={{fontSize: '12px', color: 'var(--text-2)', marginTop: '4px'}}>
                        Add a terrace garden polygon
                      </div>
                    </div>
                  </button>
                </div>
              )}

              {/* Step 2: Choose Upload Method */}
              {addFarmModalStep === 2 && (
                <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
                  <button
                    className="btn"
                    style={{justifyContent: 'flex-start', textAlign: 'left', padding: '16px'}}
                    onClick={() => { setSelectedUploadMethod('KML'); setAddFarmModalStep(3); }}
                  >
                    <div>
                      <strong>Upload via KML</strong>
                      <div style={{fontSize: '12px', color: 'var(--text-2)', marginTop: '4px'}}>
                        Upload polygon data using KML file format
                      </div>
                    </div>
                  </button>
                  <button
                    className="btn"
                    style={{justifyContent: 'flex-start', textAlign: 'left', padding: '16px'}}
                    onClick={() => { setSelectedUploadMethod('CSV'); setAddFarmModalStep(3); }}
                  >
                    <div>
                      <strong>Upload via CSV</strong>
                      <div style={{fontSize: '12px', color: 'var(--text-2)', marginTop: '4px'}}>
                        Upload polygon data using CSV file format
                      </div>
                    </div>
                  </button>
                </div>
              )}

              {/* Step 3: Upload File (KML or CSV) */}
              {addFarmModalStep === 3 && selectedUploadMethod === 'KML' && (
                <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
                  <div>
                    <a
                      href="/sample.kml"
                      download="sample.kml"
                      style={{color: 'var(--primary)', textDecoration: 'underline'}}
                    >
                      Download sample KML file format here
                    </a>
                    <p style={{fontSize: '12px', color: 'var(--text-2)', marginTop: '8px', fontStyle: 'italic'}}>
                      Note: Please download the sample KML file provided here. Replace the sample coordinates in the downloaded file with your own coordinates, and then proceed with the upload
                    </p>
                  </div>

                  <div
                    style={{
                      border: '2px dashed',
                      borderColor: isDragging ? 'var(--primary)' : 'var(--border)',
                      borderRadius: '8px',
                      padding: '32px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      backgroundColor: isDragging ? 'var(--primary-bg)' : 'var(--bg-2)'
                    }}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      const file = e.dataTransfer.files[0];
                      if (file && file.name.endsWith('.kml')) {
                        setUploadedFile(file);
                        setExtractedCoordinates('');
                        parseKMLFile(file);
                      } else {
                        toast.error('Please upload a .kml file');
                      }
                    }}
                    onClick={() => document.getElementById('kml-file-input').click()}
                  >
                    <input
                      id="kml-file-input"
                      type="file"
                      accept=".kml"
                      style={{display: 'none'}}
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setUploadedFile(file);
                          setExtractedCoordinates('');
                          parseKMLFile(file);
                        }
                      }}
                    />
                    {uploadedFile ? (
                      <div>
                        <div style={{fontSize: '14px', fontWeight: '500', marginBottom: '8px'}}>
                          {uploadedFile.name}
                        </div>
                        <div style={{fontSize: '12px', color: 'var(--text-2)'}}>
                          {(uploadedFile.size / 1024).toFixed(2)} KB
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div style={{fontSize: '16px', fontWeight: '500', marginBottom: '8px'}}>
                          Drag and drop your KML file here
                        </div>
                        <div style={{fontSize: '12px', color: 'var(--text-2)'}}>
                          or click to browse
                        </div>
                      </div>
                    )}
                  </div>

                  <div style={{display: 'flex', gap: '8px', justifyContent: 'flex-end'}}>
                    <button
                      className="btn btn-ghost"
                      onClick={() => { setShowAddFarmModal(false); setAddFarmModalStep(0); setSelectedPolygonCategory(''); setSelectedUploadMethod(''); setUploadedFile(null); setSelectedFarmer(null); setFarmerSearchQuery(''); }}
                    >
                      Cancel
                    </button>
                    <button
                      className="btn btn-primary"
                      disabled={!uploadedFile}
                      onClick={() => {
                        setAddFarmModalStep(4);
                      }}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Upload CSV File */}
              {addFarmModalStep === 3 && selectedUploadMethod === 'CSV' && (
                <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
                  <div>
                    <a
                      href="/sample_coordinates.csv"
                      download="sample_coordinates.csv"
                      style={{color: 'var(--primary)', textDecoration: 'underline'}}
                    >
                      Download sample CSV file format here
                    </a>
                    <p style={{fontSize: '12px', color: 'var(--text-2)', marginTop: '8px', fontStyle: 'italic'}}>
                      Note: Please download the sample CSV file provided here. Replace the sample coordinates in the downloaded file with your own coordinates, and then proceed with the upload
                    </p>
                  </div>

                  <div
                    style={{
                      border: '2px dashed',
                      borderColor: isCsvDragging ? 'var(--primary)' : 'var(--border)',
                      borderRadius: '8px',
                      padding: '32px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      backgroundColor: isCsvDragging ? 'var(--primary-bg)' : 'var(--bg-2)'
                    }}
                    onDragOver={(e) => { e.preventDefault(); setIsCsvDragging(true); }}
                    onDragLeave={(e) => { e.preventDefault(); setIsCsvDragging(false); }}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsCsvDragging(false);
                      const file = e.dataTransfer.files[0];
                      if (file && file.name.endsWith('.csv')) {
                        setCsvUploadedFile(file);
                        setExtractedCoordinates('');
                        parseCSVFile(file);
                      } else {
                        toast.error('Please upload a .csv file');
                      }
                    }}
                    onClick={() => document.getElementById('csv-file-input').click()}
                  >
                    <input
                      id="csv-file-input"
                      type="file"
                      accept=".csv"
                      style={{display: 'none'}}
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setCsvUploadedFile(file);
                          setExtractedCoordinates('');
                          parseCSVFile(file);
                        }
                      }}
                    />
                    {csvUploadedFile ? (
                      <div>
                        <div style={{fontSize: '14px', fontWeight: '500', marginBottom: '8px'}}>
                          {csvUploadedFile.name}
                        </div>
                        <div style={{fontSize: '12px', color: 'var(--text-2)'}}>
                          {(csvUploadedFile.size / 1024).toFixed(2)} KB
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div style={{fontSize: '16px', fontWeight: '500', marginBottom: '8px'}}>
                          Drag and drop your CSV file here
                        </div>
                        <div style={{fontSize: '12px', color: 'var(--text-2)'}}>
                          or click to browse
                        </div>
                      </div>
                    )}
                  </div>

                  <div style={{display: 'flex', gap: '8px', justifyContent: 'flex-end'}}>
                    <button
                      className="btn btn-ghost"
                      onClick={() => { setShowAddFarmModal(false); setAddFarmModalStep(0); setSelectedPolygonCategory(''); setSelectedUploadMethod(''); setCsvUploadedFile(null); setSelectedFarmer(null); setFarmerSearchQuery(''); }}
                    >
                      Cancel
                    </button>
                    <button
                      className="btn btn-primary"
                      disabled={!csvUploadedFile}
                      onClick={() => {
                        setAddFarmModalStep(4);
                      }}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: Farm Details Form */}
              {addFarmModalStep === 4 && (
                <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
                  <div className="form-group">
                    <label>Farm Name</label>
                    {selectedFarmer && (
                      <div style={{fontSize: '13px', color: 'var(--text-2)', marginBottom: '8px'}}>
                        Farmer: {selectedFarmer.name} ({selectedFarmer.user_id || selectedFarmer.userId || selectedFarmer.id})
                      </div>
                    )}
                    <input
                      type="text"
                      value={farmName}
                      onChange={(e) => setFarmName(e.target.value)}
                      placeholder="Enter farm name"
                    />
                  </div>

                  <div className="form-group">
                    <label>Polygon Category</label>
                    <input
                      type="text"
                      value={selectedPolygonCategory}
                      disabled
                      style={{backgroundColor: 'var(--bg-2)', cursor: 'not-allowed'}}
                    />
                  </div>

                  <div className="form-group">
                    <label>Crop Type</label>
                    <select
                      value={cropType}
                      onChange={(e) => setCropType(e.target.value)}
                    >
                      <option value="">Select crop type</option>
                      <option value="Rice">Rice</option>
                      <option value="Wheat">Wheat</option>
                      <option value="Maize">Maize</option>
                      <option value="Cotton">Cotton</option>
                      <option value="Sugarcane">Sugarcane</option>
                      <option value="Vegetables">Vegetables</option>
                      <option value="Fruits">Fruits</option>
                      <option value="Pulses">Pulses</option>
                      <option value="Oilseeds">Oilseeds</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Variety</label>
                    <input
                      type="text"
                      value={variety}
                      onChange={(e) => setVariety(e.target.value)}
                      placeholder="Enter variety"
                    />
                  </div>

                  <div className="form-group">
                    <label>Sowing Date</label>
                    <input
                      type="date"
                      value={sowingDate}
                      onChange={(e) => setSowingDate(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Irrigation</label>
                    <div style={{display: 'flex', gap: '16px', marginTop: '8px'}}>
                      <label style={{display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer'}}>
                        <input
                          type="radio"
                          name="irrigation"
                          value="rainfed"
                          checked={irrigation === 'rainfed'}
                          onChange={(e) => setIrrigation(e.target.value)}
                        />
                        <span>Rainfed</span>
                      </label>
                      <label style={{display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer'}}>
                        <input
                          type="radio"
                          name="irrigation"
                          value="irrigated"
                          checked={irrigation === 'irrigated'}
                          onChange={(e) => setIrrigation(e.target.value)}
                        />
                        <span>Irrigated</span>
                      </label>
                    </div>
                  </div>

                  <div style={{display: 'flex', gap: '8px', justifyContent: 'flex-end'}}>
                    <button 
                      className="btn btn-ghost" 
                      onClick={() => { setShowAddFarmModal(false); setAddFarmModalStep(1); setSelectedPolygonCategory(''); setSelectedUploadMethod(''); setUploadedFile(null); setFarmName(''); setCropType(''); setVariety(''); setSowingDate(''); setIrrigation(''); }}
                    >
                      Cancel
                    </button>
                    <button 
                      className="btn btn-primary" 
                      disabled={!farmName || !cropType || !sowingDate || !irrigation || isFetchingFarmerApiKey || isAddFarmSubmitting}
                      onClick={handleAddFarmSubmit}
                    >
                      {isAddFarmSubmitting ? 'Submitting...' : 'Submit'}
                    </button>
                  </div>
                </div>
              )}
            </div>
            {/* Back Button for Steps 1, 2, 3, and 4 */}
            {addFarmModalStep > 0 && (
              <div className="modal-foot">
                <button
                  className="btn btn-ghost"
                  onClick={() => {
                    if (addFarmModalStep === 4) {
                      setAddFarmModalStep(3);
                    } else if (addFarmModalStep === 3) {
                      setAddFarmModalStep(2);
                      setUploadedFile(null);
                    } else if (addFarmModalStep === 2) {
                      setAddFarmModalStep(1);
                      setSelectedPolygonCategory('');
                    } else if (addFarmModalStep === 1) {
                      setAddFarmModalStep(0);
                      setSelectedPolygonCategory('');
                    }
                  }}
                >
                  ← Back
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Unlock by Form ID Card */}
      <div className="card" style={{marginBottom: '16px', marginLeft: '24px', marginRight: '24px'}}>
        <div className="card-head">
          <span className="card-title">Unlock/Lock Farm by Farm ID</span>
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

      {/* 50 Recently Added Farms Section - Only for Ops */}
      {currentRole === 'ops' && (
        <div className="card" style={{marginBottom: '16px', marginLeft: '24px', marginRight: '24px'}}>
          <div className="card-head">
            <span className="card-title">50 Recently Added Farm</span>
          </div>
          <div className="card-body">
            {opsRecentFarmsLoading && (
              <div style={{textAlign: 'center', padding: '24px'}}>
                <p style={{color: 'var(--text-2)', fontSize: '14px'}}>Loading recently added farms...</p>
              </div>
            )}
            {opsRecentFarmsError && (
              <div style={{textAlign: 'center', padding: '24px'}}>
                <p style={{color: 'var(--red-600)', fontSize: '14px'}}>{opsRecentFarmsError}</p>
              </div>
            )}
            {!opsRecentFarmsLoading && !opsRecentFarmsError && opsRecentFarms.length > 0 && (
              <div>
                {(() => {
                  const startIdx = opsActivePage * 10;
                  const endIdx = Math.min(startIdx + 10, opsRecentFarms.length);
                  const groupFarms = opsRecentFarms.slice(startIdx, endIdx);
                  const groupNumber = opsActivePage + 1;

                  return (
                    <div>
                      <div style={{backgroundColor: 'var(--bg-1)', padding: '8px 12px', margin: '8px 0 4px 0', borderRadius: '4px', border: '1px solid var(--border)'}}>
                        <span style={{fontWeight: '600', color: 'var(--text-1)', fontSize: '13px'}}>
                          {startIdx + 1} to {endIdx} farm ids in {groupNumber}
                        </span>
                      </div>
                      <div style={{overflowX: 'auto'}}>
                        <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '14px'}}>
                          <thead>
                            <tr style={{backgroundColor: 'var(--bg-1)', borderBottom: '1px solid var(--border)'}}>
                              <th style={{padding: '12px', textAlign: 'left', fontWeight: '600', color: 'var(--text-1)'}}>Farm ID</th>
                              <th style={{padding: '12px', textAlign: 'left', fontWeight: '600', color: 'var(--text-1)'}}>Farm Name</th>
                              <th style={{padding: '12px', textAlign: 'left', fontWeight: '600', color: 'var(--text-1)'}}>Region</th>
                              <th style={{padding: '12px', textAlign: 'left', fontWeight: '600', color: 'var(--text-1)'}}>Area</th>
                              <th style={{padding: '12px', textAlign: 'left', fontWeight: '600', color: 'var(--text-1)'}}>Added Time</th>
                              <th style={{padding: '12px', textAlign: 'left', fontWeight: '600', color: 'var(--text-1)'}}>Client ID</th>
                            </tr>
                          </thead>
                          <tbody>
                            {groupFarms.map((farm, index) => (
                              <tr key={startIdx + index} style={{borderBottom: '1px solid var(--border)'}}>
                                <td style={{padding: '12px', color: 'var(--text-1)'}}>{farm.farmId}</td>
                                <td style={{padding: '12px', color: 'var(--text-1)'}}>{farm.farmName}</td>
                                <td style={{padding: '12px', color: 'var(--text-1)'}}>{farm.region}</td>
                                <td style={{padding: '12px', color: 'var(--text-1)'}}>{farm.area}</td>
                                <td style={{padding: '12px', color: 'var(--text-1)'}}>{farm.createdTime}</td>
                                <td style={{padding: '12px', color: 'var(--text-1)'}}>{farm.clientId || farm.client_id || farm.user_id || farm.userId || 'N/A'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {/* Pagination Buttons */}
                      <div style={{display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '16px', padding: '8px', backgroundColor: 'var(--bg-1)', borderRadius: '4px', border: '1px solid var(--border)'}}>
                        {Array.from({ length: Math.ceil(opsRecentFarms.length / 10) }, (_, index) => (
                          <button
                            key={index}
                            onClick={() => setOpsActivePage(index)}
                            className="btn btn-sm"
                            style={{
                              padding: '6px 12px',
                              fontSize: '14px',
                              borderRadius: '20px',
                              backgroundColor: opsActivePage === index ? '#2d7a3d' : '#ffffff',
                              color: opsActivePage === index ? '#ffffff' : '#333333',
                              border: opsActivePage === index ? 'none' : '1px solid #cccccc',
                              cursor: 'pointer',
                              fontWeight: opsActivePage === index ? '600' : '400',
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
                  );
                })()}
              </div>
            )}
            {!opsRecentFarmsLoading && !opsRecentFarmsError && opsRecentFarms.length === 0 && (
              <div style={{textAlign: 'center', padding: '24px'}}>
                <p style={{color: 'var(--text-2)', fontSize: '14px'}}>No recently added farms found</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recently Added Farms Table - Only for Client, Manager, and Partner */}
      {(currentRole === 'client' || currentRole === 'manager' || currentRole === 'partner') && (
        <div className="card" style={{marginBottom: '16px', marginLeft: '24px', marginRight: '24px'}}>
          <div className="card-head" style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
            <span className="card-title">Top 50 Farms</span>
            <div style={{display: 'flex', gap: '8px'}}>
              <button
                className={`btn btn-sm ${selectedView === 'added' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => {
                  setSelectedView('added');
                  fetchRecentFarms();
                }}
                style={{flex: 1, padding: '4px 12px', fontSize: '12px'}}
              >
                Added Farms
              </button>
              <button
                className={`btn btn-sm ${selectedView === 'expiring' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => {
                  setSelectedView('expiring');
                  fetchExpiringFarms();
                }}
                style={{flex: 1, padding: '4px 12px', fontSize: '12px'}}
              >
                Expiring Farms
              </button>
            </div>
          </div>
          <div className="card-body" style={{padding: '16px'}}>
            {selectedView === 'added' && recentFarmsLoading && (
              <div style={{textAlign: 'center', padding: '24px'}}>
                <p style={{color: 'var(--text-2)', fontSize: '14px'}}>Loading recent farms...</p>
              </div>
            )}
            
            {selectedView === 'expiring' && expiringFarmsLoading && (
              <div style={{textAlign: 'center', padding: '24px'}}>
                <p style={{color: 'var(--text-2)', fontSize: '14px'}}>Loading expiring farms...</p>
              </div>
            )}
            
            {selectedView === 'added' && recentFarmsError && (
              <div style={{textAlign: 'center', padding: '24px'}}>
                <p style={{color: 'var(--red-600)', fontSize: '14px'}}>{recentFarmsError}</p>
              </div>
            )}
            
            {selectedView === 'expiring' && expiringFarmsError && (
              <div style={{textAlign: 'center', padding: '24px'}}>
                <p style={{color: 'var(--red-600)', fontSize: '14px'}}>{expiringFarmsError}</p>
              </div>
            )}
            
            {!recentFarmsLoading && !expiringFarmsLoading && !recentFarmsError && !expiringFarmsError && 
             ((selectedView === 'added' && recentFarms.length > 0) || (selectedView === 'expiring' && expiringFarms.length > 0)) && (
              <div>
                {/* Show only the selected farm group */}
                {(() => {
                  const currentFarms = selectedView === 'added' ? recentFarms : expiringFarms;
                  const startIdx = activePage * 10;
                  const endIdx = Math.min(startIdx + 10, currentFarms.length);
                  const groupFarms = currentFarms.slice(startIdx, endIdx);
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
                            <th style={{padding: '10px 16px', textAlign: 'left', fontWeight: '600', color: 'var(--text-1)', fontSize: '14px'}}>{selectedView === 'added' ? 'Added Time' : 'Expiry Time'}</th>
                            {selectedView === 'added' && (
                              <th style={{padding: '10px 16px', textAlign: 'left', fontWeight: '600', color: 'var(--text-1)', fontSize: '14px'}}>Status</th>
                            )}
                            {currentRole === 'partner' && (
                              <th style={{padding: '10px 16px', textAlign: 'left', fontWeight: '600', color: 'var(--text-1)', fontSize: '14px'}}>Admin Name</th>
                            )}
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
                              <td style={{padding: '10px 16px', color: 'var(--text-1)', fontSize: '14px'}}>{selectedView === 'added' ? farm.createdTime : farm.expiryTime}</td>
                              {selectedView === 'added' && (
                                <td style={{padding: '10px 16px', color: 'var(--text-1)', fontSize: '14px'}}>{farm.status}</td>
                              )}
                              {currentRole === 'partner' && (
                                <td style={{padding: '10px 16px', color: 'var(--text-1)', fontSize: '14px'}}>{farm.adminName || 'N/A'}</td>
                              )}
                              <td style={{padding: '10px 16px'}}>
                                <div style={{display: 'flex', gap: '8px'}}>
                                  <button
                                    onClick={() => {
                                      console.log('Unlock button clicked - Role:', currentRole, 'Status:', farm.status, 'Farm ID:', farm.farmId);
                                      unlockRecentFarm(farm.farmId);
                                    }}
                                    disabled={formLoading || (currentRole === 'manager' && String(farm.status).toLowerCase() === 'unlocked')}
                                    className="btn btn-primary btn-sm"
                                    style={{fontSize: '12px', padding: '6px 12px', height: '32px', width: '80px', cursor: (currentRole === 'manager' && String(farm.status).toLowerCase() === 'unlocked') ? 'not-allowed' : 'pointer', opacity: (currentRole === 'manager' && String(farm.status).toLowerCase() === 'unlocked') ? 0.5 : 1}}
                                  >
                                    {formLoading ? '...' : 'Unlock'}
                                  </button>
                                  {selectedView === 'added' && (
                                    <button
                                      onClick={() => {
                                        console.log('Delete button clicked - Role:', currentRole, 'Status:', farm.status, 'Farm ID:', farm.farmId);
                                        openDeleteModal(farm.farmId, startIdx + index);
                                      }}
                                      disabled={formLoading || (currentRole === 'manager' && String(farm.status).toLowerCase() === 'unlocked')}
                                      className="btn btn-danger btn-sm"
                                      style={{fontSize: '12px', padding: '6px 12px', height: '32px', width: '80px', cursor: (currentRole === 'manager' && String(farm.status).toLowerCase() === 'unlocked') ? 'not-allowed' : 'pointer', opacity: (currentRole === 'manager' && String(farm.status).toLowerCase() === 'unlocked') ? 0.5 : 1}}
                                    >
                                      Delete
                                    </button>
                                  )}
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
                  {Array.from({ length: Math.ceil((selectedView === 'added' ? recentFarms.length : expiringFarms.length) / 10) }, (_, index) => (
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
            
            {!recentFarmsLoading && !expiringFarmsLoading && !recentFarmsError && !expiringFarmsError && 
             ((selectedView === 'added' && recentFarms.length === 0) || (selectedView === 'expiring' && expiringFarms.length === 0)) && (
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
