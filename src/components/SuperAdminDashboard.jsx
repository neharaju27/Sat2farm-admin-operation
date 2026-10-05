import { useState, useEffect, useMemo } from "react";
import {
  Search,
  Filter,
  Building2,
  Eye,
  X,
} from "lucide-react";
import toast from 'react-hot-toast';
import "../styles/Sat2FarmAdminPortal.css";

const GET_ADMIN_KEY_API_URL =
  import.meta.env.VITE_GET_ADMIN_KEY_API_URL;

const GET_ADMIN_INFO_API_URL =
  import.meta.env.VITE_GET_ADMIN_INFO_API_URL;

const FETCH_SUPERADMIN_AREA_API_URL =
  import.meta.env.VITE_FETCH_SUPERADMIN_AREA_API_URL;

const UPDATE_ADMIN_AREA_API_URL =
  import.meta.env.VITE_UPDATE_ADMIN_AREA_API_URL;

export default function SuperAdminDashboard({
  user,
  onPageChange,
}) {
  const [adminInfo, setAdminInfo] = useState([]);
  const [areaData, setAreaData] = useState(null);
  const [superAdminKey, setSuperAdminKey] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedManager, setSelectedManager] = useState(null);
  const [assignFormData, setAssignFormData] = useState({
    area: "",
    plan: "1 month"
  });
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignError, setAssignError] = useState("");

  useEffect(() => {
    fetchManagers();
  }, [user]);

  async function fetchManagers() {
    try {
      setLoading(true);
      setError(null);

      const phoneNumber =
        user?.phone_number ||
        user?.phoneNumber ||
        user?.phone ||
        user?.pNumber;

      if (!phoneNumber) {
        setError("Phone number not available");
        return;
      }

      // Get Admin Key
      const keyResponse = await fetch(
        `${GET_ADMIN_KEY_API_URL}?mobile_no=${phoneNumber}`
      );

      if (!keyResponse.ok) {
        throw new Error("Unable to fetch admin key");
      }

      const keyData = await keyResponse.json();
      console.log('Admin Key API Response:', keyData);
      
      // Extract api_key from response
      const adminKey = keyData?.api_key;
      
      console.log('Extracted Admin Key:', adminKey);
      
      if (!adminKey) {
        throw new Error('Admin key not found in response');
      }

      // Store super admin key for assign acreage
      setSuperAdminKey(adminKey);

      // Step 2: Fetch admin info using the fetched key
      console.log('Fetching admin info with key:', adminKey);
      const adminInfoResponse = await fetch(`${GET_ADMIN_INFO_API_URL}?key=${adminKey}`);
      
      console.log('Admin Info Response Status:', adminInfoResponse.status);
      console.log('Admin Info Response OK:', adminInfoResponse.ok);
      
      if (!adminInfoResponse.ok) {
        // Try to parse as JSON first
        let errorText = '';
        try {
          const errorJson = await adminInfoResponse.json();
          errorText = JSON.stringify(errorJson);
          console.log('Admin Info Error Response (JSON):', errorJson);
          // Check if the error is "no sub admin" - treat this as empty array instead of error
          if (errorJson?.error?.toLowerCase().includes('no sub admin') || 
              errorJson?.error?.toLowerCase().includes('no sub-admin')) {
            setAdminInfo([]);
            return;
          }
        } catch {
          // If not JSON, get as text
          errorText = await adminInfoResponse.text();
          console.log('Admin Info Error Response (Text):', errorText);
          // Check if the error is "no sub admin" - treat this as empty array instead of error
          if (errorText.toLowerCase().includes('no sub admin') || errorText.toLowerCase().includes('no sub-admin')) {
            setAdminInfo([]);
            return;
          }
        }
        throw new Error(`Failed to fetch admin info: ${adminInfoResponse.status} - ${errorText}`);
      }

      const adminData = await adminInfoResponse.json();
      console.log('Admin Info API Response:', adminData);
      
      // Handle array response
      const formattedAdminData = Array.isArray(adminData) ? adminData : [adminData];
      
      // First set admin info with plan data if available in the response
      const adminInfoWithPlanData = formattedAdminData.map(admin => ({
        ...admin,
        plan_acreages: {
          '1 month': { 
            total: admin?.['1_month']?.total_area || 0, 
            used: admin?.['1_month']?.used_area || 0, 
            available: admin?.['1_month']?.available_area || 0 
          },
          '6 months': { 
            total: admin?.['6_month']?.total_area || 0, 
            used: admin?.['6_month']?.used_area || 0, 
            available: admin?.['6_month']?.available_area || 0 
          },
          '12 months': { 
            total: admin?.['12_month']?.total_area || 0, 
            used: admin?.['12_month']?.used_area || 0, 
            available: admin?.['12_month']?.available_area || 0 
          }
        }
      }));
      
      setAdminInfo(adminInfoWithPlanData);

      // Step 3: Fetch superadmin area data
      console.log('Fetching superadmin area data with phone:', phoneNumber);
      const areaResponse = await fetch(`${FETCH_SUPERADMIN_AREA_API_URL}?mobile_no=${phoneNumber}`);
      
      console.log('Area Response Status:', areaResponse.status);
      console.log('Area Response OK:', areaResponse.ok);
      
      if (!areaResponse.ok) {
        const errorText = await areaResponse.text();
        console.log('Area Error Response:', errorText);
        // Check if error is specifically about area details not found
        if (errorText.toLowerCase().includes('not found') || 
            errorText.toLowerCase().includes('area details not found') ||
            errorText.toLowerCase().includes('no area')) {
          // Don't clear admin info, just keep it without area data
          console.log('Area data not found, keeping admin info without area details');
          return;
        }
        throw new Error(`Failed to fetch area data: ${areaResponse.status} - ${errorText}`);
      }

      const areaResult = await areaResponse.json();
      console.log('Area Result:', areaResult);

      if (
        areaResult.status === "success" &&
        areaResult.data
      ) {
        setAreaData(areaResult.data);
        
        // Merge area data with admin info
        const areaDataMap = {};
        if (Array.isArray(areaResult.data)) {
          areaResult.data.forEach(area => {
            areaDataMap[area.mobile_no || area.phoneNumber] = area;
          });
        } else if (areaResult.data && typeof areaResult.data === 'object') {
          areaDataMap[areaResult.data.mobile_no || areaResult.data.phoneNumber] = areaResult.data;
        }
        
        // Update adminInfo with area data, merging plan data from both sources
        const mergedAdminInfo = adminInfoWithPlanData.map(admin => {
          const areaInfo = areaDataMap[admin.mobile_no || admin.phoneNumber];
          return {
            ...admin,
            allocate_area: areaInfo?.allocate_area || areaInfo?.allocated_area || admin.allocate_area || admin.allocated_area || 'N/A',
            available_area: areaInfo?.available_area || admin.available_area || 'N/A',
            used_area: areaInfo?.used_area || admin.used_area || 'N/A',
            total_area: areaInfo?.total_area || admin.total_area || 'N/A',
            // Merge plan-based acreages from both admin info and area API, preferring area API data
            plan_acreages: {
              '1 month': { 
                total: areaInfo?.['1_month']?.total_area || admin?.['1_month']?.total_area || 0, 
                used: areaInfo?.['1_month']?.used_area || admin?.['1_month']?.used_area || 0, 
                available: areaInfo?.['1_month']?.available_area || admin?.['1_month']?.available_area || 0 
              },
              '6 months': { 
                total: areaInfo?.['6_month']?.total_area || admin?.['6_month']?.total_area || 0, 
                used: areaInfo?.['6_month']?.used_area || admin?.['6_month']?.used_area || 0, 
                available: areaInfo?.['6_month']?.available_area || admin?.['6_month']?.available_area || 0 
              },
              '12 months': { 
                total: areaInfo?.['12_month']?.total_area || admin?.['12_month']?.total_area || 0, 
                used: areaInfo?.['12_month']?.used_area || admin?.['12_month']?.used_area || 0, 
                available: areaInfo?.['12_month']?.available_area || admin?.['12_month']?.available_area || 0 
              }
            }
          };
        });
        
        setAdminInfo(mergedAdminInfo);
      } else {
        // If area data is not available, still use admin info with plan data
        setAdminInfo(adminInfoWithPlanData);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const displayName =
    user?.name ||
    user?.fullName ||
    areaData?.company_name ||
    areaData?.organization_name ||
    areaData?.name ||
    "AGRICORE LTD";

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const filteredManagers = useMemo(() => {
    let list = [...adminInfo];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();

      list = list.filter((m) => {
        return (
          m.full_name?.toLowerCase().includes(q) ||
          m.mobile_no?.includes(q) ||
          m.sub_admin_id?.toString().includes(q)
        );
      });
    }

    list.sort((a, b) => {
      if (sortBy === "oldest") {
        return (
          new Date(a.reg_date) -
          new Date(b.reg_date)
        );
      }

      return (
        new Date(b.reg_date) -
        new Date(a.reg_date)
      );
    });

    return list;
  }, [adminInfo, searchTerm, sortBy]);

  const handleCardClick = (manager) => {
    localStorage.setItem(
      "selectedManagerPhone",
      manager.mobile_no
    );

    onPageChange("manager-monthly-report");
  };

  const handleOpenAssignModal = (manager) => {
    setSelectedManager(manager);
    setAssignFormData({
      area: "",
      plan: "1 month"
    });
    setAssignError("");
    setAssignModalOpen(true);
  };

  const handleCloseAssignModal = () => {
    setAssignModalOpen(false);
    setSelectedManager(null);
    setAssignFormData({
      area: "",
      plan: "1 month"
    });
    setAssignError("");
  };

  const handleAssignInputChange = (e) => {
    const { name, value } = e.target;
    setAssignFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    
    if (!assignFormData.area) {
      setAssignError("Please fill in all required fields");
      return;
    }

    setAssignLoading(true);
    setAssignError("");

    try {
      const adminId = selectedManager?.sub_admin_id || selectedManager?.client_id;
      
      console.log('Super Admin Key:', superAdminKey);
      console.log('Admin ID:', adminId);
      console.log('Area to increase:', assignFormData.area);
      console.log('Plan:', assignFormData.plan);
      
      if (!superAdminKey) {
        setAssignError('Super admin key not available. Please refresh the page.');
        setAssignLoading(false);
        return;
      }
      
      if (!adminId) {
        setAssignError('Admin ID not available for this manager.');
        setAssignLoading(false);
        return;
      }
      
      // Map plan values to API format
      let planValue = '';
      const trimmedPlan = assignFormData.plan.trim();
      
      if (trimmedPlan === '1 month') {
        planValue = '1';
      } else if (trimmedPlan === '6 months') {
        planValue = '6';
      } else if (trimmedPlan === '12 months') {
        planValue = '12';
      } else {
        planValue = '1';
      }

      const apiUrl = `${UPDATE_ADMIN_AREA_API_URL}?super_admin_key=${superAdminKey}&admin_id=${adminId}&area_to_increase=${assignFormData.area}&plan=${planValue}`;
      console.log('API URL:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Acreage assigned successfully!');
        handleCloseAssignModal();
        // Refresh the data
        fetchManagers();
      } else {
        const errorMessage = data.message || data.error || 'Failed to assign acreage';
        setAssignError(errorMessage);
      }
    } catch (err) {
      console.error('Assign Error:', err);
      setAssignError('Network error. Please try again.');
    } finally {
      setAssignLoading(false);
    }
  };

  return (
    <div className="main-full" style={{ background: "#f8fafc" }}>
      {/* Header */}
      <div className="topbar">
        <div className="tb-left">
          <div className="tb-page">Super Admin Dashboard</div>
        </div>

        <div className="tb-right">
          <div className="badge badge-green">Overview</div>
        </div>
      </div>

      <div className="content-area">
        <div className="sa-container">
          {/* ================= Welcome ================= */}
          <div className="sa-welcome">
            <div>
              <h1 className="sa-welcome-title">
                Welcome back,
                <span className="sa-company-name">
                  {" "}
                  {displayName}
                </span>
              </h1>
              <p className="sa-welcome-subtitle">
                Manage and monitor all your managers from one place.
              </p>
            </div>

            <div className="sa-sort">
              <Filter size={16} />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>

          {/* ================= Loading ================= */}
          {loading && (
            <div className="sa-empty">
              Loading managers...
            </div>
          )}

          {/* ================= Error ================= */}
          {!loading && error && (
            <div className="sa-error">
              {error}
            </div>
          )}

          {/* ================= Table ================= */}
          {!loading && !error && (
            <div className="sa-table-card">
              <table className="sa-table">
                <thead>
                  <tr>
                    <th style={{ width: "20%" }}>Manager</th>
                    <th style={{ width: "8%" }}>Manager ID</th>
                    <th style={{ width: "12%" }}>Phone Number</th>
                    <th style={{ width: "12%" }}>Registered Date</th>
                    <th style={{ width: "12%" }}>1 Month Plan</th>
                    <th style={{ width: "12%" }}>6 Months Plan</th>
                    <th style={{ width: "12%" }}>12 Months Plan</th>
                    <th style={{ width: "24%", textAlign: "center" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredManagers.length === 0 ? (
                    <tr>
                      <td
                        colSpan="8"
                        style={{
                          textAlign: "center",
                          padding: "60px",
                          color: "#64748b",
                        }}
                      >
                        No managers found.
                      </td>
                    </tr>
                  ) : (
                    filteredManagers.map((manager, index) => (
                      <tr
                        key={manager.mobile_no || index}
                        className="sa-table-row"
                      >
                        {/* Manager */}
                        <td>
                          <div className="sa-manager-cell">
                            <div className="sa-avatar">
                              {manager.full_name
                                ?.charAt(0)
                                ?.toUpperCase() || "M"}
                            </div>
                            <div>
                              <div className="sa-manager-name">
                                {manager.full_name}
                              </div>
                              <div className="sa-manager-role">
                                Manager
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Manager ID */}
                        <td>
                          <span className="sa-table-id">
                            {manager.sub_admin_id}
                          </span>
                        </td>

                        {/* Phone */}
                        <td>{manager.mobile_no}</td>

                        {/* Registered */}
                        <td>{formatDate(manager.reg_date)}</td>

                        {/* 1 Month Plan */}
                        <td>
                          <div style={{display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '12px'}}>
                            <div><span style={{color: '#666'}}>Total:</span> <strong>{(manager.plan_acreages?.['1 month']?.total || 0).toFixed(2)}</strong></div>
                            <div><span style={{color: '#666'}}>Used:</span> <strong>{(manager.plan_acreages?.['1 month']?.used || 0).toFixed(2)}</strong></div>
                            <div><span style={{color: '#666'}}>Available:</span> <strong>{(manager.plan_acreages?.['1 month']?.available || 0).toFixed(2)}</strong></div>
                          </div>
                        </td>

                        {/* 6 Months Plan */}
                        <td>
                          <div style={{display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '12px'}}>
                            <div><span style={{color: '#666'}}>Total:</span> <strong>{(manager.plan_acreages?.['6 months']?.total || 0).toFixed(2)}</strong></div>
                            <div><span style={{color: '#666'}}>Used:</span> <strong>{(manager.plan_acreages?.['6 months']?.used || 0).toFixed(2)}</strong></div>
                            <div><span style={{color: '#666'}}>Available:</span> <strong>{(manager.plan_acreages?.['6 months']?.available || 0).toFixed(2)}</strong></div>
                          </div>
                        </td>

                        {/* 12 Months Plan */}
                        <td>
                          <div style={{display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '12px'}}>
                            <div><span style={{color: '#666'}}>Total:</span> <strong>{(manager.plan_acreages?.['12 months']?.total || 0).toFixed(2)}</strong></div>
                            <div><span style={{color: '#666'}}>Used:</span> <strong>{(manager.plan_acreages?.['12 months']?.used || 0).toFixed(2)}</strong></div>
                            <div><span style={{color: '#666'}}>Available:</span> <strong>{(manager.plan_acreages?.['12 months']?.available || 0).toFixed(2)}</strong></div>
                          </div>
                        </td>

                        {/* Actions */}
                        <td style={{ textAlign: "center" }}>
                          <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
                            <button
                              className="sa-action-btn"
                              onClick={() => handleOpenAssignModal(manager)}
                              style={{ padding: "6px 10px", fontSize: "12px" }}
                            >
                              Assign Acreages
                            </button>
                            <button
                              className="sa-action-btn"
                              onClick={() => handleCardClick(manager)}
                              style={{ padding: "6px 10px", fontSize: "12px" }}
                            >
                              <Eye size={14} />
                              View Report
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Assign Acreage Modal */}
      {assignModalOpen && selectedManager && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="modal" style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            width: '500px',
            maxWidth: '90vw',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
          }}>
            <div className="modal-head" style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px 20px',
              borderBottom: '1px solid #e5e7eb'
            }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>Assign Acreage</h3>
              <button 
                onClick={handleCloseAssignModal}
                style={{
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-body" style={{ padding: '20px' }}>
              {assignError && (
                <div style={{
                  backgroundColor: '#fee2e2',
                  color: '#dc2626',
                  padding: '12px',
                  borderRadius: '6px',
                  marginBottom: '16px',
                  fontSize: '14px'
                }}>
                  {assignError}
                </div>
              )}

              {/* Manager Info */}
              <div style={{
                backgroundColor: '#f0fdf4',
                border: '1px solid #86efac',
                borderRadius: '6px',
                padding: '16px',
                marginBottom: '20px'
              }}>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#166534', marginBottom: '8px' }}>
                  Manager Details
                </div>
                <table style={{ width: '100%', fontSize: '14px', borderCollapse: 'collapse' }}>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #bbf7d0' }}>
                      <td style={{ padding: '8px 0', color: '#374151', width: '40%', fontWeight: '500' }}>Manager Name</td>
                      <td style={{ padding: '8px 0', fontWeight: '600', color: '#1f2937' }}>
                        {selectedManager.full_name}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '8px 0', color: '#374151', fontWeight: '500' }}>Client ID</td>
                      <td style={{ padding: '8px 0', fontWeight: '600', color: '#1f2937' }}>
                        {selectedManager.sub_admin_id || selectedManager.client_id || 'N/A'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <form onSubmit={handleAssignSubmit}>
                {/* Area Input */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px' }}>
                    Area to Add (acres) *
                  </label>
                  <input
                    type="number"
                    name="area"
                    value={assignFormData.area}
                    onChange={handleAssignInputChange}
                    placeholder="Enter area in acres"
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Plan Selection */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px' }}>
                    Plan *
                  </label>
                  <select
                    name="plan"
                    value={assignFormData.plan}
                    onChange={handleAssignInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                      backgroundColor: 'white'
                    }}
                  >
                    <option value="1 month">1 Month</option>
                    <option value="6 months">6 Months</option>
                    <option value="12 months">12 Months</option>
                  </select>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={assignLoading}
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                >
                  {assignLoading ? 'Assigning...' : 'Submit'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
