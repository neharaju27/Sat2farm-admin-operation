import { useState, useEffect } from 'react';
import { Users, Phone, Calendar, User, Map } from 'lucide-react';
import '../styles/Sat2FarmAdminPortal.css';

const GET_ADMIN_KEY_API_URL = import.meta.env.VITE_GET_ADMIN_KEY_API_URL;
const GET_ADMIN_INFO_API_URL = import.meta.env.VITE_GET_ADMIN_INFO_API_URL;
const FETCH_SUPERADMIN_AREA_API_URL = import.meta.env.VITE_FETCH_SUPERADMIN_AREA_API_URL;

export default function SuperAdminDashboard({ user, onPageChange }) {
  const [adminInfo, setAdminInfo] = useState([]);
  const [areaData, setAreaData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAdminInfo = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get phone number from user
        const phoneNumber = user?.phone_number || user?.phone;
        if (!phoneNumber) {
          setError('Phone number not available');
          setLoading(false);
          return;
        }

        // Step 1: Fetch key using phone number
        const keyResponse = await fetch(`${GET_ADMIN_KEY_API_URL}?mobile_no=${phoneNumber}`);
        
        if (!keyResponse.ok) {
          throw new Error('Failed to fetch admin key');
        }

        const keyData = await keyResponse.json();
        console.log('Admin Key API Response:', keyData);
        
        // Extract api_key from response
        const adminKey = keyData?.api_key;
        
        console.log('Extracted Admin Key:', adminKey);
        
        if (!adminKey) {
          throw new Error('Admin key not found in response');
        }

        // Step 2: Fetch admin info using the fetched key
        console.log('Fetching admin info with key:', adminKey);
        const adminInfoResponse = await fetch(`${GET_ADMIN_INFO_API_URL}?key=${adminKey}`);
        
        console.log('Admin Info Response Status:', adminInfoResponse.status);
        console.log('Admin Info Response OK:', adminInfoResponse.ok);
        
        if (!adminInfoResponse.ok) {
          const errorText = await adminInfoResponse.text();
          console.log('Admin Info Error Response:', errorText);
          throw new Error(`Failed to fetch admin info: ${adminInfoResponse.status} - ${errorText}`);
        }

        const adminData = await adminInfoResponse.json();
        console.log('Admin Info API Response:', adminData);
        
        // Handle array response
        if (Array.isArray(adminData)) {
          setAdminInfo(adminData);
        } else {
          // If single object, wrap in array
          setAdminInfo([adminData]);
        }

        // Step 3: Fetch superadmin area data
        console.log('Fetching superadmin area data with phone:', phoneNumber);
        const areaResponse = await fetch(`${FETCH_SUPERADMIN_AREA_API_URL}?mobile_no=${phoneNumber}`);
        
        console.log('Area Response Status:', areaResponse.status);
        console.log('Area Response OK:', areaResponse.ok);
        
        if (!areaResponse.ok) {
          const errorText = await areaResponse.text();
          console.log('Area Error Response:', errorText);
          throw new Error(`Failed to fetch area data: ${areaResponse.status} - ${errorText}`);
        }

        const areaResult = await areaResponse.json();
        console.log('Area API Response:', areaResult);
        
        if (areaResult?.status === 'success' && areaResult?.data) {
          setAreaData(areaResult.data);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminInfo();
  }, [user]);

  return (
    <div className="main-full" style={{ background: '#ffffff' }}>
      {/* Top Header */}
      <div className="topbar">
        <div className="tb-left">
          <div className="tb-page">Super Admin Dashboard</div>
        </div>
        <div className="tb-right">
          <div className="badge badge-green">Overview</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="content-area ">
        <div className="sa-container">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
              Loading admin information...
            </div>
          ) : error ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#ef4444' }}>
              Error: {error}
            </div>
          ) : (
            /* Stats Cards - One card per admin with name, phone, and date */
            <div className="sa-stats-grid">
              {adminInfo.map((admin, index) => (
                <div 
                  key={index} 
                  className="sa-card bg-white rounded-2xl p-7 border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                  onClick={() => onPageChange('manager-monthly-report')}
                >
                  <div className="sa-card-accent sa-card-accent-blue"></div>
                  <div className="sa-card-content">
                    <div className="sa-card-header">
                      <div className="sa-icon-badge sa-icon-badge-blue">
                        <User style={{ width: '20px', height: '20px' }} className="sa-icon-blue" />
                      </div>
                    </div>
                    
                    {/* Full Name */}
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-1"></p>
                      <h3 className="sa-card-value m-0">
                        {admin?.full_name || 'N/A'}
                      </h3>
                    </div>

                    {/* Sub Admin ID */}
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-1">ID</p>
                      <div className="text-base font-semibold text-gray-900 m-0">
                        {admin?.sub_admin_id || 'N/A'}
                      </div>
                    </div>

                    {/* Phone Number */}
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-1">Phone</p>
                      <div className="text-base font-semibold text-gray-900 m-0">
                        {admin?.mobile_no || 'N/A'}
                      </div>
                    </div>

                    {/* Registered Date */}
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Registered Date</p>
                      <div className="text-base font-semibold text-gray-900 m-0">
                        {admin?.reg_date || 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Area Data Card */}
              {areaData && (
                <div className="sa-card bg-white rounded-2xl p-7 border border-gray-200 shadow-sm">
                  <div className="sa-card-accent sa-card-accent-green"></div>
                  <div className="sa-card-content">
                    <div className="sa-card-header">
                      <div className="sa-icon-badge sa-icon-badge-green">
                        <Map style={{ width: '20px', height: '20px' }} className="sa-icon-green" />
                      </div>
                    </div>
                    
                    {/* Total Area */}
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-1">Total Area</p>
                      <h3 className="sa-card-value m-0">
                        {areaData?.total_area || 'N/A'}
                      </h3>
                    </div>

                    {/* Available Area */}
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-1">Available Area</p>
                      <div className="text-base font-semibold text-gray-900 m-0">
                        {areaData?.available_area || 'N/A'}
                      </div>
                    </div>

                    {/* Used Area */}
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Used Area</p>
                      <div className="text-base font-semibold text-gray-900 m-0">
                        {areaData?.used_area || 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
