import { useState, useEffect } from 'react';
import { Download, Calendar, FileText, TrendingUp, BarChart3, Users, MapPin, Phone, Mail, Search, Filter, Eye, Edit, Lock, Unlock, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import '../styles/Sat2FarmAdminPortal.css';

export default function ManagerMonthlyReport({ user, onPageChange }) {
  const [selectedMonth, setSelectedMonth] = useState('');
  const [monthlyData, setMonthlyData] = useState(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [reportError, setReportError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [availableMonths, setAvailableMonths] = useState([]);
  const [monthlyFiles, setMonthlyFiles] = useState({});
  const [monthQueries, setMonthQueries] = useState({});
  const [selectedMonthQuery, setSelectedMonthQuery] = useState('');
  const [loadingMonths, setLoadingMonths] = useState(true);
  const [loadingMetrics, setLoadingMetrics] = useState(false);
  const [apiMetrics, setApiMetrics] = useState(null);

  // Dummy data for different months (manager-specific)
  const dummyMonthlyData = {
    'Oct 25': {
      total_clients: 142,
      total_used_area: 78420,
      total_added_area: 82300,
      average_utilization: 95.2,
      karnataka_added_area: 45600,
      outside_karnataka_unlocked_area: 32820,
      top5_clients: [
        { client_id: 'C-1042', full_name: 'GreenField Agro', unlocked_area: 8400, mobile_no: '9876543210', status: 'Active', Total_added_area: 8800 },
        { client_id: 'C-0887', full_name: 'Sunrise Farms', unlocked_area: 6200, mobile_no: '9876543211', status: 'Active', Total_added_area: 6500 },
        { client_id: 'C-0994', full_name: 'Deccan Planters', unlocked_area: 5100, mobile_no: '9876543212', status: 'Active', Total_added_area: 5200 },
        { client_id: 'C-0712', full_name: 'Kaveri Holdings', unlocked_area: 4800, mobile_no: '9876543213', status: 'Active', Total_added_area: 5000 },
        { client_id: 'C-1110', full_name: 'Vijaya FarmTech', unlocked_area: 3600, mobile_no: '9876543214', status: 'Active', Total_added_area: 3800 }
      ]
    },
    'Nov 25': {
      total_clients: 138,
      total_used_area: 72100,
      total_added_area: 75500,
      average_utilization: 95.5,
      karnataka_added_area: 41200,
      outside_karnataka_unlocked_area: 30900,
      top5_clients: [
        { client_id: 'C-1042', full_name: 'GreenField Agro', unlocked_area: 8200, mobile_no: '9876543210', status: 'Active', Total_added_area: 8600 },
        { client_id: 'C-0887', full_name: 'Sunrise Farms', unlocked_area: 5800, mobile_no: '9876543211', status: 'Active', Total_added_area: 6200 },
        { client_id: 'C-0994', full_name: 'Deccan Planters', unlocked_area: 4900, mobile_no: '9876543212', status: 'Active', Total_added_area: 5100 },
        { client_id: 'C-0712', full_name: 'Kaveri Holdings', unlocked_area: 4500, mobile_no: '9876543213', status: 'Active', Total_added_area: 4700 },
        { client_id: 'C-1110', full_name: 'Vijaya FarmTech', unlocked_area: 3400, mobile_no: '9876543214', status: 'Active', Total_added_area: 3600 }
      ]
    },
    'Dec 25': {
      total_clients: 145,
      total_used_area: 81200,
      total_added_area: 85100,
      average_utilization: 95.4,
      karnataka_added_area: 46800,
      outside_karnataka_unlocked_area: 34400,
      top5_clients: [
        { client_id: 'C-1042', full_name: 'GreenField Agro', unlocked_area: 8600, mobile_no: '9876543210', status: 'Active', Total_added_area: 9000 },
        { client_id: 'C-0887', full_name: 'Sunrise Farms', unlocked_area: 6400, mobile_no: '9876543211', status: 'Active', Total_added_area: 6700 },
        { client_id: 'C-0994', full_name: 'Deccan Planters', unlocked_area: 5300, mobile_no: '9876543212', status: 'Active', Total_added_area: 5500 },
        { client_id: 'C-0712', full_name: 'Kaveri Holdings', unlocked_area: 4900, mobile_no: '9876543213', status: 'Active', Total_added_area: 5200 },
        { client_id: 'C-1110', full_name: 'Vijaya FarmTech', unlocked_area: 3800, mobile_no: '9876543214', status: 'Active', Total_added_area: 4000 }
      ]
    },
    'Jan 26': {
      total_clients: 148,
      total_used_area: 83600,
      total_added_area: 87800,
      average_utilization: 95.2,
      karnataka_added_area: 48200,
      outside_karnataka_unlocked_area: 35400,
      top5_clients: [
        { client_id: 'C-1042', full_name: 'GreenField Agro', unlocked_area: 8800, mobile_no: '9876543210', status: 'Active', Total_added_area: 9200 },
        { client_id: 'C-0887', full_name: 'Sunrise Farms', unlocked_area: 6600, mobile_no: '9876543211', status: 'Active', Total_added_area: 6900 },
        { client_id: 'C-0994', full_name: 'Deccan Planters', unlocked_area: 5500, mobile_no: '9876543212', status: 'Active', Total_added_area: 5700 },
        { client_id: 'C-0712', full_name: 'Kaveri Holdings', unlocked_area: 5200, mobile_no: '9876543213', status: 'Active', Total_added_area: 5400 },
        { client_id: 'C-1110', full_name: 'Vijaya FarmTech', unlocked_area: 4000, mobile_no: '9876543214', status: 'Active', Total_added_area: 4200 }
      ]
    },
    'Feb 26': {
      total_clients: 152,
      total_used_area: 86100,
      total_added_area: 90500,
      average_utilization: 95.1,
      karnataka_added_area: 49600,
      outside_karnataka_unlocked_area: 36500,
      top5_clients: [
        { client_id: 'C-1042', full_name: 'GreenField Agro', unlocked_area: 9000, mobile_no: '9876543210', status: 'Active', Total_added_area: 9400 },
        { client_id: 'C-0887', full_name: 'Sunrise Farms', unlocked_area: 6800, mobile_no: '9876543211', status: 'Active', Total_added_area: 7100 },
        { client_id: 'C-0994', full_name: 'Deccan Planters', unlocked_area: 5700, mobile_no: '9876543212', status: 'Active', Total_added_area: 5900 },
        { client_id: 'C-0712', full_name: 'Kaveri Holdings', unlocked_area: 5500, mobile_no: '9876543213', status: 'Active', Total_added_area: 5700 },
        { client_id: 'C-1110', full_name: 'Vijaya FarmTech', unlocked_area: 4200, mobile_no: '9876543214', status: 'Active', Total_added_area: 4400 }
      ]
    },
    'Mar 26': {
      total_clients: 156,
      total_used_area: 89320,
      total_added_area: 93800,
      average_utilization: 95.2,
      karnataka_added_area: 51400,
      outside_karnataka_unlocked_area: 37920,
      top5_clients: [
        { client_id: 'C-1042', full_name: 'GreenField Agro', unlocked_area: 9200, mobile_no: '9876543210', status: 'Active', Total_added_area: 9600 },
        { client_id: 'C-0887', full_name: 'Sunrise Farms', unlocked_area: 7000, mobile_no: '9876543211', status: 'Active', Total_added_area: 7300 },
        { client_id: 'C-0994', full_name: 'Deccan Planters', unlocked_area: 5900, mobile_no: '9876543212', status: 'Active', Total_added_area: 6100 },
        { client_id: 'C-0712', full_name: 'Kaveri Holdings', unlocked_area: 5800, mobile_no: '9876543213', status: 'Active', Total_added_area: 6000 },
        { client_id: 'C-1110', full_name: 'Vijaya FarmTech', unlocked_area: 4400, mobile_no: '9876543214', status: 'Active', Total_added_area: 4600 }
      ]
    }
  };

  // Fetch available months from API
  useEffect(() => {
    const fetchAvailableMonths = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_LABELING_API_URL}`);
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) {
            // Extract month labels from API response
            const months = data.map(item => item.label);
            setAvailableMonths(months);
            
            // Create monthlyFiles mapping using the actual file path from the labeling API
            const filesMapping = {};
            const queriesMapping = {};
            data.forEach(item => {
              filesMapping[item.label] = item.file;
              queriesMapping[item.label] = item.query;
            });
            setMonthlyFiles(filesMapping);
            setMonthQueries(queriesMapping);
            
            // Select the most recent month (last in array)
            if (months.length > 0) {
              const mostRecentMonth = months[months.length - 1];
              setSelectedMonth(mostRecentMonth);
              setSelectedMonthQuery(queriesMapping[mostRecentMonth] || '');
            }
          }
        }
      } catch (error) {
        console.error('Error fetching available months:', error);
        // Fallback to dummy months if API fails
        const dummyMonths = ['Oct 25', 'Nov 25', 'Dec 25', 'Jan 26', 'Feb 26', 'Mar 26'];
        setAvailableMonths(dummyMonths);
        const mostRecentMonth = dummyMonths[dummyMonths.length - 1];
        setSelectedMonth(mostRecentMonth);
      } finally {
        setLoadingMonths(false);
      }
    };
    
    fetchAvailableMonths();
  }, []);

  // Auto-fetch data when selectedMonth and monthlyFiles are available
  useEffect(() => {
    if (selectedMonth && monthlyFiles[selectedMonth]) {
      fetchMetricsForMonth(selectedMonth, monthQueries[selectedMonth]);
    }
  }, [selectedMonth, monthlyFiles, monthQueries]);

  const handleMonthSelect = (month) => {
    setSelectedMonth(month);
    setSelectedMonthQuery(monthQueries[month] || '');
    fetchMetricsForMonth(month, monthQueries[month] || '');
  };

  const fetchMetricsForMonth = async (month, monthQueryParam = '') => {
    try {
      setLoadingMetrics(true);
      
      // Get mobile number from user or localStorage
      const storedAuth = localStorage.getItem('sat2farm_auth');
      let mobileNo = null;
      if (storedAuth) {
        try {
          const authData = JSON.parse(storedAuth);
          mobileNo = authData.mobile_no || authData.phone_number || authData.phoneNumber;
        } catch (e) {
          console.error('Error parsing auth data:', e);
        }
      }
      
      if (!mobileNo) {
        mobileNo = user?.phone_number || user?.phoneNumber || user?.pNumber;
      }
      
      // Use query parameter from labeling API response and normalize to the expected lowercase format
      const rawMonthQuery = monthQueryParam || monthQueries[month] || month;
      const monthQuery = rawMonthQuery.trim().toLowerCase();
      
      const response = await fetch(`${import.meta.env.VITE_BUSINESS_REPORT_API_URL}?month=${encodeURIComponent(monthQuery)}&mobile_no=${encodeURIComponent(mobileNo)}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Business Report API Response:', data);
        if (data.status === 'success') {
          const apiData = {
            month: data.month || selectedMonth,
            ...data.metrics,
            plans: data.plans,
            download_link: data.download_link
          };

          console.log('Setting apiMetrics:', apiData);
          setApiMetrics(apiData);
        }
      }
    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setLoadingMetrics(false);
    }
  };

  const handleDownloadReport = async () => {
    const selectedFile = monthlyFiles[selectedMonth];
    
    if (selectedFile) {
      try {
        setLoadingReport(true);
        const response = await fetch(`${import.meta.env.VITE_ESLY_API_URL}?filename=${encodeURIComponent(selectedFile)}&download=true`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = selectedFile.split('/').pop();
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Error downloading file:', error);
        setReportError('Failed to download report file. Generating fallback CSV.');
        generateFallbackCSV();
      } finally {
        setLoadingReport(false);
      }
    } else {
      generateFallbackCSV();
    }
  };

  const generateFallbackCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(
      "Client ID,Full Name,Mobile No,Total Area Added,Monthly Used Area,Status\n" +
      (monthlyData?.top5_clients || []).map(client => 
        `${client.client_id},${client.full_name},${client.mobile_no},${client.Total_added_area},${client.unlocked_area},${client.status}`
      ).join("\n")
    );
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `manager_monthly_report_${selectedMonth.replace(' ', '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportCSV = async () => {
    if (apiMetrics?.download_link) {
      const downloadUrl = apiMetrics.download_link;
      const filename = downloadUrl.split('?')[0].split('/').pop() || `manager_monthly_report_${selectedMonth.replace(/\s+/g, '_')}.csv`;
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    const selectedFile = monthlyFiles[selectedMonth];
    
    if (selectedFile) {
      try {
        setLoadingReport(true);
        const filename = selectedFile.split('/').pop();
        
        const response = await fetch(`${import.meta.env.VITE_ESLY_API_URL}?filename=${encodeURIComponent(filename)}&download=true`);
        
        if (!response.ok) {
          const fallbackResponse = await fetch(`${import.meta.env.VITE_ESLY_API_URL}?filename=${encodeURIComponent(selectedFile)}&download=true`);
          
          if (!fallbackResponse.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const data = await fallbackResponse.json();
          handleDownloadSuccess(data);
        } else {
          const data = await response.json();
          handleDownloadSuccess(data);
        }
      } catch (error) {
        console.error('Error downloading CSV:', error);
        setReportError(`Failed to download CSV file: ${error.message}`);
      } finally {
        setLoadingReport(false);
      }
    } else {
      setReportError('No file available for selected month.');
    }
  };

  const handleDownloadSuccess = (data) => {
    if (data.status === 'success' && data.download_url) {
      if (data.metrics) {
        setApiMetrics(data.metrics);
      }
      
      const link = document.createElement("a");
      link.href = data.download_url;
      link.download = data.file_name || 'report.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      throw new Error('Invalid API response format');
    }
  };

  const filteredClientData = monthlyData?.top5_clients?.filter(client => {
    const matchesSearch = !searchTerm || 
      client.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.client_id?.toString().includes(searchTerm) ||
      client.mobile_no?.includes(searchTerm);
    
    const matchesFilter = filterStatus === 'all' || 
      (filterStatus === 'active' && client.status === 'Active') ||
      (filterStatus === 'inactive' && client.status === 'Inactive');
    
    return matchesSearch && matchesFilter;
  }) || [];

  return (
    <div className="sat2farm-portal-full">
      <div className="main-full">
        {/* TOPBAR */}
        <div className="topbar" style={{backgroundColor: '#ffffff', borderBottom: '1px solid var(--border)'}}>
          <div className="tb-left">
            <div>
              <div className="tb-page">Manager Monthly Report</div>
              <div className="tb-sub">Manager · Reporting</div>
            </div>
          </div>
        </div>
          

        {/* CONTENT */}
        <div className="content-area">
          {/* Loading and Error States */}
          {loadingMonths && (
            <div style={{textAlign: 'center', padding: '40px', color: 'var(--text-2)'}}>
              <div style={{fontSize: '24px', marginBottom: '16px'}}>⏳</div>
              <div>Loading monthly reports...</div>
            </div>
          )}
          
          {loadingMetrics && (
            <div style={{textAlign: 'center', padding: '40px', color: 'var(--text-2)'}}>
              <div style={{fontSize: '24px', marginBottom: '16px'}}>⏳</div>
              <div>Loading metrics data...</div>
            </div>
          )}
          
          {loadingReport && (
            <div style={{textAlign: 'center', padding: '40px', color: 'var(--text-2)'}}>
              <div style={{fontSize: '24px', marginBottom: '16px'}}>⏳</div>
              <div>Downloading report...</div>
            </div>
          )}
          
          {reportError && (
            <div style={{marginBottom: '16px', padding: '12px', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '6px'}}>
              <strong>Error:</strong> {reportError}
            </div>
          )}

          {/* Report Data */}
          {!loadingMonths && !loadingMetrics && !reportError && (
            <>
              {/* Month Selection */}
              <div className="section-head">
                <div className="section-title">Monthly Report Overview</div>
                <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                </div>
              </div>

              <div className="month-tabs">
                {availableMonths.length > 0 ? (
                  availableMonths.map((month) => (
                    <div
                      key={month}
                      className={`month-chip ${selectedMonth === month ? 'active' : ''}`}
                      onClick={() => handleMonthSelect(month)}
                    >
                      {month}
                    </div>
                  ))
                ) : (
                  <div style={{color: 'var(--text-2)', fontSize: '14px'}}>No monthly reports available</div>
                )}
              </div>

              <div className="section-head">
                <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                  <button className="btn btn-sm" onClick={() => handleExportCSV()}>Export CSV</button>
                </div>
              </div>

              {/* Summary Metrics - Two Tables Side by Side */}
              {apiMetrics && (
                <div style={{display: 'flex', gap: '16px', marginBottom: '24px'}}>
                  {/* Total Added Area Table */}
                  <div className="card" style={{flex: 1}}>
                    <div className="card-head">
                      <span className="card-title">Total Added Area</span>
                      <div className="month-chip">{selectedMonth}</div>
                    </div>
                    <div className="card-body">
                      <table style={{width: '100%', borderCollapse: 'collapse'}}>
                        <thead>
                          <tr style={{borderBottom: '2px solid var(--border)'}}>
                            <th style={{padding: '12px', textAlign: 'left', fontWeight: '600', color: 'var(--text-1)'}}>State</th>
                            <th style={{padding: '12px', textAlign: 'right', fontWeight: '600', color: 'var(--text-1)'}}>Area</th>
                          </tr>
                        </thead>
                        <tbody>
                          {apiMetrics.state_wise_total_added_area && Object.keys(apiMetrics.state_wise_total_added_area).length > 0 ? (
                            Object.entries(apiMetrics.state_wise_total_added_area).map(([state, area], index) => (
                              <tr key={state} style={{borderBottom: '1px solid var(--border)'}}>
                                <td style={{padding: '12px', color: 'var(--text-1)'}}>{state.charAt(0).toUpperCase() + state.slice(1)}</td>
                                <td style={{padding: '12px', textAlign: 'right', color: 'var(--text-1)'}}>{area || 0}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="2" style={{padding: '24px', textAlign: 'center', color: 'var(--text-2)'}}>
                                No state data available
                              </td>
                            </tr>
                          )}
                          <tr style={{fontWeight: '600'}}>
                            <td style={{padding: '12px', color: 'var(--text-1)'}}>Total</td>
                            <td style={{padding: '12px', textAlign: 'right', color: 'var(--text-1)'}}>{apiMetrics.total_added_area || 0}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                  
                  {/* Total Unlocked Area Table */}
                  <div className="card" style={{flex: 1}}>
                    <div className="card-head">
                      <span className="card-title">Total Unlocked Area</span>
                      <div className="month-chip">{selectedMonth}</div>
                    </div>
                    <div className="card-body">
                      <table style={{width: '100%', borderCollapse: 'collapse'}}>
                        <thead>
                          <tr style={{borderBottom: '2px solid var(--border)'}}>
                            <th style={{padding: '12px', textAlign: 'left', fontWeight: '600', color: 'var(--text-1)'}}>State</th>
                            <th style={{padding: '12px', textAlign: 'right', fontWeight: '600', color: 'var(--text-1)'}}>Area</th>
                          </tr>
                        </thead>
                        <tbody>
                          {apiMetrics.state_wise_unlocked_area && Object.keys(apiMetrics.state_wise_unlocked_area).length > 0 ? (
                            Object.entries(apiMetrics.state_wise_unlocked_area).map(([state, area], index) => (
                              <tr key={state} style={{borderBottom: '1px solid var(--border)'}}>
                                <td style={{padding: '12px', color: 'var(--text-1)'}}>{state.charAt(0).toUpperCase() + state.slice(1)}</td>
                                <td style={{padding: '12px', textAlign: 'right', color: 'var(--text-1)'}}>{area || 0}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="2" style={{padding: '24px', textAlign: 'center', color: 'var(--text-2)'}}>
                                No state data available
                              </td>
                            </tr>
                          )}
                          <tr style={{fontWeight: '600'}}>
                            <td style={{padding: '12px', color: 'var(--text-1)'}}>Total</td>
                            <td style={{padding: '12px', textAlign: 'right', color: 'var(--text-1)'}}>{apiMetrics.total_unlocked_area || 0}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Plan Wise Summary Table */}
              <div className="card">
                <div className="card-head">
                  <span className="card-title">Plan Wise Summary</span>
                  <div className="month-chip">{selectedMonth}</div>
                </div>
                <div className="card-body">
                  <table style={{width: '100%', borderCollapse: 'collapse'}}>
                    <thead>
                      <tr style={{borderBottom: '2px solid var(--border)'}}>
                        <th style={{padding: '12px', textAlign: 'left', fontWeight: '600', color: 'var(--text-1)'}}>State</th>
                        <th style={{padding: '12px', textAlign: 'right', fontWeight: '600', color: 'var(--text-1)'}}>Month Plan</th>
                        <th style={{padding: '12px', textAlign: 'right', fontWeight: '600', color: 'var(--text-1)'}}>6 Months Plan</th>
                        <th style={{padding: '12px', textAlign: 'right', fontWeight: '600', color: 'var(--text-1)'}}>12 Months Plan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {apiMetrics && apiMetrics.plans && Object.keys(apiMetrics.plans).length > 0 ? (
                        <>
                          {Object.entries(apiMetrics.plans).map(([state, planData], index) => (
                            <tr key={state} style={{borderBottom: '1px solid var(--border)'}}>
                              <td style={{padding: '12px', color: 'var(--text-1)'}}>{state.charAt(0).toUpperCase() + state.slice(1)}</td>
                              <td style={{padding: '12px', textAlign: 'right', color: 'var(--text-1)'}}>{planData['1_month'] || 0}</td>
                              <td style={{padding: '12px', textAlign: 'right', color: 'var(--text-1)'}}>{planData['6_month'] || 0}</td>
                              <td style={{padding: '12px', textAlign: 'right', color: 'var(--text-1)'}}>{planData['12_month'] || 0}</td>
                            </tr>
                          ))}
                        </>
                      ) : (
                        <tr>
                          <td colSpan="4" style={{padding: '24px', textAlign: 'center', color: 'var(--text-2)'}}>
                            No plan data available
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
