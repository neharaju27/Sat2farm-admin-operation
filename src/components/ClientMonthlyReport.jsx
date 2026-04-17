import { useState, useEffect } from 'react';
import { Download, Calendar, FileText, TrendingUp, BarChart3, Users, MapPin, Phone, Mail, Search, Filter, Eye, Edit, Lock, Unlock, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import '../styles/Sat2FarmAdminPortal.css';

export default function ClientMonthlyReport({ user, onPageChange }) {
  const [selectedMonth, setSelectedMonth] = useState('');
  const [monthlyData, setMonthlyData] = useState(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [reportError, setReportError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [availableMonths, setAvailableMonths] = useState([]);
  const [monthlyFiles, setMonthlyFiles] = useState({});
  const [loadingMonths, setLoadingMonths] = useState(true);
  const [apiMetrics, setApiMetrics] = useState(null);

  // Dummy data for different months
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
            
            // Create monthlyFiles mapping using query parameter for fetch_esly
            const filesMapping = {};
            data.forEach(item => {
              filesMapping[item.label] = `${import.meta.env.VITE_ESLY_API_URL}?month_year=${item.query}`;
            });
            setMonthlyFiles(filesMapping);
            
            // Select the most recent month (last in array)
            if (months.length > 0) {
              const mostRecentMonth = months[months.length - 1];
              setSelectedMonth(mostRecentMonth);
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
        // Removed: setMonthlyData(dummyMonthlyData[mostRecentMonth]);
        // Removed: setApiMetrics(dummyMonthlyData[mostRecentMonth]);
      } finally {
        setLoadingMonths(false);
      }
    };
    
    fetchAvailableMonths();
  }, []);

  // Auto-fetch data when selectedMonth and monthlyFiles are available
  useEffect(() => {
    if (selectedMonth && monthlyFiles[selectedMonth]) {
      fetchMetricsForMonth(selectedMonth);
    }
  }, [selectedMonth, monthlyFiles]);

  const handleMonthSelect = (month) => {
    setSelectedMonth(month);
    // Removed: setMonthlyData(dummyMonthlyData[month] || null);
    // Fetch real API data for selected month
    fetchMetricsForMonth(month);
  };

  const fetchMetricsForMonth = async (month) => {
    const selectedFile = monthlyFiles[month];
    if (selectedFile) {
      try {
        // Extract month_year parameter from the URL
        const monthYearParam = selectedFile.includes('?month_year=') 
          ? selectedFile.split('?month_year=')[1] 
          : month; // Fallback to month label if not in URL format
        
        const response = await fetch(`${import.meta.env.VITE_ESLY_API_URL}?month_year=${encodeURIComponent(monthYearParam)}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log('API Response:', data); // Debug log
          if (data.status === 'success') {
            // Set the entire response data to include metrics, plan, and karnataka_bucket
            const apiData = {
              ...data.metrics,
              plan: data.plan,
              karnataka_bucket: data.karnataka_bucket
            };
            console.log('Setting apiMetrics:', apiData); // Debug log
            setApiMetrics(apiData);
          }
        }
      } catch (error) {
        console.error('Error fetching metrics:', error);
      }
    }
  };

  const handleDownloadReport = async () => {
    const selectedFile = monthlyFiles[selectedMonth];
    
    if (selectedFile) {
      // Download the actual file using Esly API
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
        link.download = selectedFile.split('/').pop(); // Get filename from path
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Error downloading file:', error);
        setReportError('Failed to download report file. Generating fallback CSV.');
        
        // Fallback to CSV generation
        generateFallbackCSV();
      } finally {
        setLoadingReport(false);
      }
    } else {
      // Fallback to CSV generation if no file is available
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
    link.setAttribute("download", `client_monthly_report_${selectedMonth.replace(' ', '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportCSV = async () => {
    const selectedFile = monthlyFiles[selectedMonth];
    
    if (selectedFile) {
      try {
        setLoadingReport(true);
        console.log('Attempting to download file:', selectedFile);
        
        // Try with just the filename without path first
        const filename = selectedFile.split('/').pop();
        console.log('Using filename:', filename);
        
        const response = await fetch(`${import.meta.env.VITE_ESLY_API_URL}?filename=${encodeURIComponent(filename)}&download=true`);
        
        console.log('API Response status:', response.status);
        
        if (!response.ok) {
          // If that fails, try with the full path
          console.log('Trying with full path:', selectedFile);
          const fallbackResponse = await fetch(`${import.meta.env.VITE_ESLY_API_URL}?filename=${encodeURIComponent(selectedFile)}&download=true`);
          
          if (!fallbackResponse.ok) {
            throw new Error(`HTTP error! status: ${response.status} (full path also failed)`);
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
      // Store metrics from API response
      if (data.metrics) {
        setApiMetrics(data.metrics);
      }
      
      // Create download link for the CSV file
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

  const handleDownload6MonthData = async () => {
    try {
      setLoadingReport(true);
      const response = await fetch(`${import.meta.env.VITE_PARTNER_REPORTS_API_URL}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status === 'success' && data.download_url) {
        // Create download link for the 6-month report
        const link = document.createElement("a");
        link.href = data.download_url;
        link.download = data.file_name || 'six_month_report.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        throw new Error('Invalid API response format');
      }
    } catch (error) {
      console.error('Error downloading 6-month data:', error);
      setReportError('Failed to download 6-month report. Please try again.');
    } finally {
      setLoadingReport(false);
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
              <div className="tb-page">Client Monthly Report</div>
              <div className="tb-sub">Client · Reporting</div>
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
          {!loadingMonths && !reportError && (
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
                  <button className="btn btn-sm" onClick={() => handleExportCSV()}> Export CSV</button>
                  <button className="btn btn-sm" onClick={() => handleDownload6MonthData()}>Download 6 Month Data</button>
                </div>
              </div>

              {/* Summary Metrics Bar Charts - Side by Side */}
              {apiMetrics && (
                <div style={{display: 'flex', gap: '16px', marginBottom: '24px'}}>
                  {/* Added Area Summary Bar Chart */}
                  <div className="card" style={{flex: 1}}>
                    <div className="card-head">
                      <span className="card-title">Added Area Summary</span>
                      <div className="month-chip">{selectedMonth}</div>
                    </div>
                    <div className="card-body">
                      <div style={{textAlign: 'center', padding: '20px'}}>
                        <svg width="100%" height="300" viewBox="0 0 600 300" style={{fontFamily: 'Arial, sans-serif'}}>
                          {/* Chart Title */}
                          <text x="300" y="20" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#333">
                            Area Added - {selectedMonth}
                          </text>
                          
                          {/* Y-axis */}
                          <line x1="60" y1="50" x2="60" y2="250" stroke="#666" strokeWidth="2"/>
                          
                          {/* X-axis */}
                          <line x1="60" y1="250" x2="550" y2="250" stroke="#666" strokeWidth="2"/>
                          
                          {/* Calculate max value for scaling */}
                          {(() => {
                            const totalAdded = apiMetrics.total_added_area || 0;
                            const karnatakaAdded = apiMetrics.karnataka_added_area || 0;
                            const outsideKarnatakaAdded = apiMetrics.outside_karnataka_added_area || 0;
                            const maxValue = Math.max(totalAdded, karnatakaAdded, outsideKarnatakaAdded);
                            const scale = maxValue > 0 ? 180 / maxValue : 1;
                            
                            return (
                              <>
                                  {/* Y-axis labels */}
                                  <text x="50" y="55" textAnchor="end" fontSize="12" fill="#666">{maxValue.toFixed(0)}</text>
                                  <text x="50" y="105" textAnchor="end" fontSize="12" fill="#666">{(maxValue * 0.75).toFixed(0)}</text>
                                  <text x="50" y="155" textAnchor="end" fontSize="12" fill="#666">{(maxValue * 0.5).toFixed(0)}</text>
                                  <text x="50" y="205" textAnchor="end" fontSize="12" fill="#666">{(maxValue * 0.25).toFixed(0)}</text>
                                  <text x="50" y="255" textAnchor="end" fontSize="12" fill="#666">0</text>
                                  
                                  {/* Total Added Area Bar */}
                                  <rect x="100" y={250 - (totalAdded * scale)} width="80" height={totalAdded * scale} fill="#3B6D11" stroke="#27500A" strokeWidth="2" rx="4" style={{cursor: 'pointer'}}>
                                    <title>Total Added Area: {totalAdded.toFixed(2)} Acres</title>
                                  </rect>
                                  <text x="140" y={245 - (totalAdded * scale)} textAnchor="middle" fontSize="12" fontWeight="bold" fill="#fff">
                                    {totalAdded.toFixed(1)}
                                  </text>
                                  <text x="140" y="270" textAnchor="middle" fontSize="12" fill="#333">
                                    Total Added
                                  </text>
                                  
                                  {/* Karnataka Added Area Bar */}
                                  <rect x="240" y={250 - (karnatakaAdded * scale)} width="80" height={karnatakaAdded * scale} fill="#185FA5" stroke="#0F4A8A" strokeWidth="2" rx="4" style={{cursor: 'pointer'}}>
                                    <title>Karnataka Added Area: {karnatakaAdded.toFixed(2)} Acres</title>
                                  </rect>
                                  <text x="280" y={245 - (karnatakaAdded * scale)} textAnchor="middle" fontSize="12" fontWeight="bold" fill="#fff">
                                    {karnatakaAdded.toFixed(1)}
                                  </text>
                                  <text x="280" y="270" textAnchor="middle" fontSize="12" fill="#333">
                                    Karnataka
                                  </text>
                                  
                                  {/* Outside Karnataka Added Area Bar */}
                                  <rect x="380" y={250 - (outsideKarnatakaAdded * scale)} width="80" height={outsideKarnatakaAdded * scale} fill="#059669" stroke="#047857" strokeWidth="2" rx="4" style={{cursor: 'pointer'}}>
                                    <title>Outside Karnataka Added Area: {outsideKarnatakaAdded.toFixed(2)} Acres</title>
                                  </rect>
                                  <text x="420" y={245 - (outsideKarnatakaAdded * scale)} textAnchor="middle" fontSize="12" fontWeight="bold" fill="#fff">
                                    {outsideKarnatakaAdded.toFixed(1)}
                                  </text>
                                  <text x="420" y="270" textAnchor="middle" fontSize="12" fill="#333">
                                    Outside Karnataka
                                  </text>
                                </>
                            );
                          })()}
                        </svg>
                        
                        {/* Value Summary Below Chart */}
                        <div style={{marginTop: '20px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '6px', border: '1px solid #dee2e6'}}>
                          <div style={{display: 'flex', justifyContent: 'space-around', alignItems: 'center'}}>
                            <div style={{textAlign: 'center'}}>
                              <div style={{fontSize: '12px', color: '#666', marginBottom: '4px'}}>Total Added</div>
                              <div style={{fontSize: '16px', fontWeight: 'bold', color: '#3B6D11'}}>{(apiMetrics.total_added_area || 0).toFixed(2)}</div>
                              <div style={{fontSize: '11px', color: '#666'}}>Acres</div>
                            </div>
                            <div style={{textAlign: 'center'}}>
                              <div style={{fontSize: '12px', color: '#666', marginBottom: '4px'}}>Karnataka Added</div>
                              <div style={{fontSize: '16px', fontWeight: 'bold', color: '#185FA5'}}>{(apiMetrics.karnataka_added_area || 0).toFixed(2)}</div>
                              <div style={{fontSize: '11px', color: '#666'}}>Acres</div>
                            </div>
                            <div style={{textAlign: 'center'}}>
                              <div style={{fontSize: '12px', color: '#666', marginBottom: '4px'}}>Outside Karnataka Added</div>
                              <div style={{fontSize: '16px', fontWeight: 'bold', color: '#059669'}}>{(apiMetrics.outside_karnataka_added_area || 0).toFixed(2)}</div>
                              <div style={{fontSize: '11px', color: '#666'}}>Acres</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Unlocked Area Summary Bar Chart */}
                  <div className="card" style={{flex: 1}}>
                    <div className="card-head">
                      <span className="card-title">Unlocked Area Summary</span>
                      <div className="month-chip">{selectedMonth}</div>
                    </div>
                    <div className="card-body">
                      <div style={{textAlign: 'center', padding: '20px'}}>
                        <svg width="100%" height="300" viewBox="0 0 600 300" style={{fontFamily: 'Arial, sans-serif'}}>
                          {/* Chart Title */}
                          <text x="300" y="20" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#333">
                            Area Unlocked - {selectedMonth}
                          </text>
                          
                          {/* Y-axis */}
                          <line x1="60" y1="50" x2="60" y2="250" stroke="#666" strokeWidth="2"/>
                          
                          {/* X-axis */}
                          <line x1="60" y1="250" x2="550" y2="250" stroke="#666" strokeWidth="2"/>
                          
                          {/* Calculate max value for scaling */}
                          {(() => {
                            const totalUnlocked = apiMetrics.total_unlocked_area || 0;
                            const karnatakaUnlocked = apiMetrics.karnataka_unlocked_area || 0;
                            const outsideKarnatakaUnlocked = apiMetrics.outside_karnataka_unlocked_area || 0;
                            const maxValue = Math.max(totalUnlocked, karnatakaUnlocked, outsideKarnatakaUnlocked);
                            const scale = maxValue > 0 ? 180 / maxValue : 1;
                            
                            return (
                              <>
                                  {/* Y-axis labels */}
                                  <text x="50" y="55" textAnchor="end" fontSize="12" fill="#666">{maxValue.toFixed(0)}</text>
                                  <text x="50" y="105" textAnchor="end" fontSize="12" fill="#666">{(maxValue * 0.75).toFixed(0)}</text>
                                  <text x="50" y="155" textAnchor="end" fontSize="12" fill="#666">{(maxValue * 0.5).toFixed(0)}</text>
                                  <text x="50" y="205" textAnchor="end" fontSize="12" fill="#666">{(maxValue * 0.25).toFixed(0)}</text>
                                  <text x="50" y="255" textAnchor="end" fontSize="12" fill="#666">0</text>
                                  
                                  {/* Total Unlocked Area Bar */}
                                  <rect x="100" y={250 - (totalUnlocked * scale)} width="80" height={totalUnlocked * scale} fill="#BA7517" stroke="#9A5F12" strokeWidth="2" rx="4" style={{cursor: 'pointer'}}>
                                    <title>Total Unlocked Area: {totalUnlocked.toFixed(2)} Acres</title>
                                  </rect>
                                  <text x="140" y={245 - (totalUnlocked * scale)} textAnchor="middle" fontSize="12" fontWeight="bold" fill="#fff">
                                    {totalUnlocked.toFixed(1)}
                                  </text>
                                  <text x="140" y="270" textAnchor="middle" fontSize="12" fill="#333">
                                    Total Unlocked
                                  </text>
                                  
                                  {/* Karnataka Unlocked Area Bar */}
                                  <rect x="240" y={250 - (karnatakaUnlocked * scale)} width="80" height={karnatakaUnlocked * scale} fill="#0F6E56" stroke="#0A5A47" strokeWidth="2" rx="4" style={{cursor: 'pointer'}}>
                                    <title>Karnataka Unlocked Area: {karnatakaUnlocked.toFixed(2)} Acres</title>
                                  </rect>
                                  <text x="280" y={245 - (karnatakaUnlocked * scale)} textAnchor="middle" fontSize="12" fontWeight="bold" fill="#fff">
                                    {karnatakaUnlocked.toFixed(1)}
                                  </text>
                                  <text x="280" y="270" textAnchor="middle" fontSize="12" fill="#333">
                                    Karnataka
                                  </text>
                                  
                                  {/* Outside Karnataka Unlocked Area Bar */}
                                  <rect x="380" y={250 - (outsideKarnatakaUnlocked * scale)} width="80" height={outsideKarnatakaUnlocked * scale} fill="#DC2626" stroke="#B91C1C" strokeWidth="2" rx="4" style={{cursor: 'pointer'}}>
                                    <title>Outside Karnataka Unlocked Area: {outsideKarnatakaUnlocked.toFixed(2)} Acres</title>
                                  </rect>
                                  <text x="420" y={245 - (outsideKarnatakaUnlocked * scale)} textAnchor="middle" fontSize="12" fontWeight="bold" fill="#fff">
                                    {outsideKarnatakaUnlocked.toFixed(1)}
                                  </text>
                                  <text x="420" y="270" textAnchor="middle" fontSize="12" fill="#333">
                                    Outside Karnataka
                                  </text>
                                </>
                            );
                          })()}
                        </svg>
                        
                        {/* Value Summary Below Chart */}
                        <div style={{marginTop: '20px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '6px', border: '1px solid #dee2e6'}}>
                          <div style={{display: 'flex', justifyContent: 'space-around', alignItems: 'center'}}>
                            <div style={{textAlign: 'center'}}>
                              <div style={{fontSize: '12px', color: '#666', marginBottom: '4px'}}>Total Unlocked</div>
                              <div style={{fontSize: '16px', fontWeight: 'bold', color: '#BA7517'}}>{(apiMetrics.total_unlocked_area || 0).toFixed(2)}</div>
                              <div style={{fontSize: '11px', color: '#666'}}>Acres</div>
                            </div>
                            <div style={{textAlign: 'center'}}>
                              <div style={{fontSize: '12px', color: '#666', marginBottom: '4px'}}>Karnataka Unlocked</div>
                              <div style={{fontSize: '16px', fontWeight: 'bold', color: '#0F6E56'}}>{(apiMetrics.karnataka_unlocked_area || 0).toFixed(2)}</div>
                              <div style={{fontSize: '11px', color: '#666'}}>Acres</div>
                            </div>
                            <div style={{textAlign: 'center'}}>
                              <div style={{fontSize: '12px', color: '#666', marginBottom: '4px'}}>Outside Karnataka Unlocked</div>
                              <div style={{fontSize: '16px', fontWeight: 'bold', color: '#DC2626'}}>{(apiMetrics.outside_karnataka_unlocked_area || 0).toFixed(2)}</div>
                              <div style={{fontSize: '11px', color: '#666'}}>Acres</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Plan Distribution Donut Charts - Side by Side */}
              {apiMetrics && (
                <div style={{display: 'flex', gap: '16px', marginBottom: '24px'}}>
                  {/* One Month Plan Donut Chart */}
                  <div className="card" style={{flex: 1}}>
                    <div className="card-head">
                      <span className="card-title">One Month Plan</span>
                      <div className="month-chip">{selectedMonth}</div>
                    </div>
                    <div className="card-body">
                      <div style={{textAlign: 'center', padding: '20px'}}>
                        <svg width="100%" height="350" viewBox="0 0 400 350" style={{fontFamily: 'Arial, sans-serif'}}>
                          {/* Chart Title */}
                          <text x="200" y="25" textAnchor="middle" fontSize="20" fontWeight="bold" fill="#333">
                            One Month Distribution
                          </text>
                          
                          {/* Calculate data for donut chart */}
                          {(() => {
                            console.log('apiMetrics in donut chart:', apiMetrics); // Debug log
                            const karnatakaData = apiMetrics.plan?.karnataka?.['1_month'] || 0;
                            const outsideKarnatakaData = apiMetrics.plan?.outside_karnataka?.['1_month'] || 0;
                            const entireRegionData = apiMetrics.karnataka_bucket?.plan?.['1_month'] || 0;
                            console.log('Donut chart data - Karnataka:', karnatakaData, 'Outside:', outsideKarnatakaData, 'Entire:', entireRegionData); // Debug log
                            
                            // Always show all three segments, even if some are 0
                            // If total is 0, assign equal proportions to show all segments
                            const total = karnatakaData + outsideKarnatakaData + entireRegionData || 1;
                            
                            // Calculate percentages
                            const karnatakaPercentage = total > 0 ? (karnatakaData / total) * 100 : 0;
                            const outsideKarnatakaPercentage = total > 0 ? (outsideKarnatakaData / total) * 100 : 0;
                            const entireRegionPercentage = total > 0 ? (entireRegionData / total) * 100 : 0;
                            
                            // Calculate angles for donut segments
                            const karnatakaAngle = (karnatakaPercentage / 100) * 360;
                            const outsideKarnatakaAngle = (outsideKarnatakaPercentage / 100) * 360;
                            const entireRegionAngle = (entireRegionPercentage / 100) * 360;
                            
                            // Donut chart parameters - much larger donut only
                            const centerX = 200;
                            const centerY = 160;
                            const outerRadius = 130;
                            const innerRadius = 70;
                            
                            // Helper function to create arc path
                            const createArcPath = (startAngle, endAngle, outerRadius, innerRadius) => {
                              // Handle case where angle is 0 or very small
                              if (Math.abs(endAngle - startAngle) < 0.1) {
                                return ''; // Don't render anything for zero/near-zero angles
                              }
                              
                              // Handle full circle case (360 degrees)
                              if (Math.abs(endAngle - startAngle) >= 359.9) {
                                return `
                                  M ${centerX - outerRadius} ${centerY}
                                  A ${outerRadius} ${outerRadius} 0 1 1 ${centerX + outerRadius} ${centerY}
                                  A ${outerRadius} ${outerRadius} 0 1 1 ${centerX - outerRadius} ${centerY}
                                  M ${centerX - innerRadius} ${centerY}
                                  A ${innerRadius} ${innerRadius} 0 1 0 ${centerX + innerRadius} ${centerY}
                                  A ${innerRadius} ${innerRadius} 0 1 0 ${centerX - innerRadius} ${centerY}
                                  Z
                                `;
                              }
                              
                              const startAngleRad = (startAngle * Math.PI) / 180;
                              const endAngleRad = (endAngle * Math.PI) / 180;
                              
                              const x1 = centerX + outerRadius * Math.cos(startAngleRad);
                              const y1 = centerY + outerRadius * Math.sin(startAngleRad);
                              const x2 = centerX + outerRadius * Math.cos(endAngleRad);
                              const y2 = centerY + outerRadius * Math.sin(endAngleRad);
                              
                              const x3 = centerX + innerRadius * Math.cos(endAngleRad);
                              const y3 = centerY + innerRadius * Math.sin(endAngleRad);
                              const x4 = centerX + innerRadius * Math.cos(startAngleRad);
                              const y4 = centerY + innerRadius * Math.sin(startAngleRad);
                              
                              const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
                              
                              return `
                                M ${x1} ${y1}
                                A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2}
                                L ${x3} ${y3}
                                A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}
                                Z
                              `;
                            };
                            
                            let currentAngle = -90; // Start from top
                            
                            return (
                              <>
                                {/* Karnataka Data Segment */}
                                <path
                                  d={createArcPath(currentAngle, currentAngle + karnatakaAngle, outerRadius, innerRadius)}
                                  fill="#185FA5"
                                  stroke="#fff"
                                  strokeWidth="2"
                                  style={{cursor: 'pointer'}}
                                >
                                  <title>{user?.name || user?.fullName || 'Client'} Karnataka Data: {karnatakaData.toFixed(2)} Acres ({karnatakaPercentage.toFixed(1)}%)</title>
                                </path>
                                
                                {/* Outside Karnataka Data Segment */}
                                <path
                                  d={createArcPath(currentAngle + karnatakaAngle, currentAngle + karnatakaAngle + outsideKarnatakaAngle, outerRadius, innerRadius)}
                                  fill="#059669"
                                  stroke="#fff"
                                  strokeWidth="2"
                                  style={{cursor: 'pointer'}}
                                >
                                  <title>{user?.name || user?.fullName || 'Client'} Outside Karnataka Data: {outsideKarnatakaData.toFixed(2)} Acres ({outsideKarnatakaPercentage.toFixed(1)}%)</title>
                                </path>
                                
                                {/* Entire Region Data Segment */}
                                <path
                                  d={createArcPath(currentAngle + karnatakaAngle + outsideKarnatakaAngle, currentAngle + karnatakaAngle + outsideKarnatakaAngle + entireRegionAngle, outerRadius, innerRadius)}
                                  fill="#BA7517"
                                  stroke="#fff"
                                  strokeWidth="2"
                                  style={{cursor: 'pointer'}}
                                >
                                  <title>Entire Region Data: {entireRegionData.toFixed(2)} Acres ({entireRegionPercentage.toFixed(1)}%)</title>
                                </path>
                                
                                                                
                                {/* Center text */}
                                <text x={centerX} y={centerY - 5} textAnchor="middle" fontSize="15" fontWeight="bold" fill="#333">
                                  One Month
                                </text>
                                <text x={centerX} y={centerY + 8} textAnchor="middle" fontSize="12" fill="#666">
                                  Plan
                                </text>
                              </>
                            );
                          })()}
                        </svg>
                        
                        {/* Legend Summary Below Chart */}
                        <div style={{marginTop: '20px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '6px', border: '1px solid #dee2e6'}}>
                          <div style={{display: 'flex', justifyContent: 'space-around', alignItems: 'center'}}>
                            <div style={{textAlign: 'center'}}>
                              <div style={{fontSize: '11px', color: '#666', marginBottom: '4px'}}>{user?.name || user?.fullName || 'Client'} Karnataka</div>
                              <div style={{fontSize: '14px', fontWeight: 'bold', color: '#185FA5'}}>{(apiMetrics.plan?.karnataka?.['1_month'] || 0).toFixed(2)}</div>
                              <div style={{fontSize: '10px', color: '#666'}}>Acres</div>
                            </div>
                            <div style={{textAlign: 'center'}}>
                              <div style={{fontSize: '11px', color: '#666', marginBottom: '4px'}}>{user?.name || user?.fullName || 'Client'} Outside Karnataka</div>
                              <div style={{fontSize: '14px', fontWeight: 'bold', color: '#059669'}}>{(apiMetrics.plan?.outside_karnataka?.['1_month'] || 0).toFixed(2)}</div>
                              <div style={{fontSize: '10px', color: '#666'}}>Acres</div>
                            </div>
                            <div style={{textAlign: 'center'}}>
                              <div style={{fontSize: '11px', color: '#666', marginBottom: '4px'}}>Entire Region</div>
                              <div style={{fontSize: '14px', fontWeight: 'bold', color: '#BA7517'}}>{(apiMetrics.karnataka_bucket?.plan?.['1_month'] || 0).toFixed(2)}</div>
                              <div style={{fontSize: '10px', color: '#666'}}>Acres</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Six Months Plan Donut Chart */}
                  <div className="card" style={{flex: 1}}>
                    <div className="card-head">
                      <span className="card-title">Six Months Plan</span>
                      <div className="month-chip">{selectedMonth}</div>
                    </div>
                    <div className="card-body">
                      <div style={{textAlign: 'center', padding: '20px'}}>
                        <svg width="100%" height="350" viewBox="0 0 400 350" style={{fontFamily: 'Arial, sans-serif'}}>
                          {/* Chart Title */}
                          <text x="200" y="25" textAnchor="middle" fontSize="20" fontWeight="bold" fill="#333">
                            Six Months Distribution
                          </text>
                          
                          {/* Calculate data for donut chart */}
                          {(() => {
                            const karnatakaData = apiMetrics.plan?.karnataka?.['6_month'] || 0;
                            const outsideKarnatakaData = apiMetrics.plan?.outside_karnataka?.['6_month'] || 0;
                            const entireRegionData = apiMetrics.karnataka_bucket?.plan?.['6_month'] || 0;
                            
                            // Always show all three segments, even if some are 0
                            // If total is 0, assign equal proportions to show all segments
                            const total = karnatakaData + outsideKarnatakaData + entireRegionData || 1;
                            
                            // Calculate percentages
                            const karnatakaPercentage = total > 0 ? (karnatakaData / total) * 100 : 0;
                            const outsideKarnatakaPercentage = total > 0 ? (outsideKarnatakaData / total) * 100 : 0;
                            const entireRegionPercentage = total > 0 ? (entireRegionData / total) * 100 : 0;
                            
                            // Calculate angles for donut segments
                            const karnatakaAngle = (karnatakaPercentage / 100) * 360;
                            const outsideKarnatakaAngle = (outsideKarnatakaPercentage / 100) * 360;
                            const entireRegionAngle = (entireRegionPercentage / 100) * 360;
                            
                            // Donut chart parameters - much larger donut only
                            const centerX = 200;
                            const centerY = 160;
                            const outerRadius = 130;
                            const innerRadius = 70;
                            
                            // Helper function to create arc path
                            const createArcPath = (startAngle, endAngle, outerRadius, innerRadius) => {
                              // Handle case where angle is 0 or very small
                              if (Math.abs(endAngle - startAngle) < 0.1) {
                                return ''; // Don't render anything for zero/near-zero angles
                              }
                              
                              // Handle full circle case (360 degrees)
                              if (Math.abs(endAngle - startAngle) >= 359.9) {
                                return `
                                  M ${centerX - outerRadius} ${centerY}
                                  A ${outerRadius} ${outerRadius} 0 1 1 ${centerX + outerRadius} ${centerY}
                                  A ${outerRadius} ${outerRadius} 0 1 1 ${centerX - outerRadius} ${centerY}
                                  M ${centerX - innerRadius} ${centerY}
                                  A ${innerRadius} ${innerRadius} 0 1 0 ${centerX + innerRadius} ${centerY}
                                  A ${innerRadius} ${innerRadius} 0 1 0 ${centerX - innerRadius} ${centerY}
                                  Z
                                `;
                              }
                              
                              const startAngleRad = (startAngle * Math.PI) / 180;
                              const endAngleRad = (endAngle * Math.PI) / 180;
                              
                              const x1 = centerX + outerRadius * Math.cos(startAngleRad);
                              const y1 = centerY + outerRadius * Math.sin(startAngleRad);
                              const x2 = centerX + outerRadius * Math.cos(endAngleRad);
                              const y2 = centerY + outerRadius * Math.sin(endAngleRad);
                              
                              const x3 = centerX + innerRadius * Math.cos(endAngleRad);
                              const y3 = centerY + innerRadius * Math.sin(endAngleRad);
                              const x4 = centerX + innerRadius * Math.cos(startAngleRad);
                              const y4 = centerY + innerRadius * Math.sin(startAngleRad);
                              
                              const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
                              
                              return `
                                M ${x1} ${y1}
                                A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2}
                                L ${x3} ${y3}
                                A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}
                                Z
                              `;
                            };
                            
                            let currentAngle = -90; // Start from top
                            
                            return (
                              <>
                                {/* Karnataka Data Segment */}
                                <path
                                  d={createArcPath(currentAngle, currentAngle + karnatakaAngle, outerRadius, innerRadius)}
                                  fill="#3B6D11"
                                  stroke="#fff"
                                  strokeWidth="2"
                                  style={{cursor: 'pointer'}}
                                >
                                  <title>{user?.name || user?.fullName || 'Client'} Karnataka Data (6 months): {karnatakaData.toFixed(2)} Acres ({karnatakaPercentage.toFixed(1)}%)</title>
                                </path>
                                
                                {/* Outside Karnataka Data Segment */}
                                <path
                                  d={createArcPath(currentAngle + karnatakaAngle, currentAngle + karnatakaAngle + outsideKarnatakaAngle, outerRadius, innerRadius)}
                                  fill="#DC2626"
                                  stroke="#fff"
                                  strokeWidth="2"
                                  style={{cursor: 'pointer'}}
                                >
                                  <title>{user?.name || user?.fullName || 'Client'} Outside Karnataka Data (6 months): {outsideKarnatakaData.toFixed(2)} Acres ({outsideKarnatakaPercentage.toFixed(1)}%)</title>
                                </path>
                                
                                {/* Entire Region Data Segment */}
                                <path
                                  d={createArcPath(currentAngle + karnatakaAngle + outsideKarnatakaAngle, currentAngle + karnatakaAngle + outsideKarnatakaAngle + entireRegionAngle, outerRadius, innerRadius)}
                                  fill="#7C3AED"
                                  stroke="#fff"
                                  strokeWidth="2"
                                  style={{cursor: 'pointer'}}
                                >
                                  <title>Entire Region Data (6 months): {entireRegionData.toFixed(2)} Acres ({entireRegionPercentage.toFixed(1)}%)</title>
                                </path>
                                
                                                                
                                {/* Center text */}
                                <text x={centerX} y={centerY - 5} textAnchor="middle" fontSize="15" fontWeight="bold" fill="#333">
                                  Six Months
                                </text>
                                <text x={centerX} y={centerY + 8} textAnchor="middle" fontSize="12" fill="#666">
                                  Plan
                                </text>
                              </>
                            );
                          })()}
                        </svg>
                        
                        {/* Legend Summary Below Chart */}
                        <div style={{marginTop: '20px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '6px', border: '1px solid #dee2e6'}}>
                          <div style={{display: 'flex', justifyContent: 'space-around', alignItems: 'center'}}>
                            <div style={{textAlign: 'center'}}>
                              <div style={{fontSize: '11px', color: '#666', marginBottom: '4px'}}>{user?.name || user?.fullName || 'Client'} Karnataka</div>
                              <div style={{fontSize: '14px', fontWeight: 'bold', color: '#3B6D11'}}>{(apiMetrics.plan?.karnataka?.['6_month'] || 0).toFixed(2)}</div>
                              <div style={{fontSize: '10px', color: '#666'}}>Acres</div>
                            </div>
                            <div style={{textAlign: 'center'}}>
                              <div style={{fontSize: '11px', color: '#666', marginBottom: '4px'}}>{user?.name || user?.fullName || 'Client'} Outside Karnataka</div>
                              <div style={{fontSize: '14px', fontWeight: 'bold', color: '#DC2626'}}>{(apiMetrics.plan?.outside_karnataka?.['6_month'] || 0).toFixed(2)}</div>
                              <div style={{fontSize: '10px', color: '#666'}}>Acres</div>
                            </div>
                            <div style={{textAlign: 'center'}}>
                              <div style={{fontSize: '11px', color: '#666', marginBottom: '4px'}}>Entire Region</div>
                              <div style={{fontSize: '14px', fontWeight: 'bold', color: '#7C3AED'}}>{(apiMetrics.karnataka_bucket?.plan?.['6_month'] || 0).toFixed(2)}</div>
                              <div style={{fontSize: '10px', color: '#666'}}>Acres</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Twelve Months Plan Donut Chart */}
                  <div className="card" style={{flex: 1}}>
                    <div className="card-head">
                      <span className="card-title">Twelve Months Plan</span>
                      <div className="month-chip">{selectedMonth}</div>
                    </div>
                    <div className="card-body">
                      <div style={{textAlign: 'center', padding: '20px'}}>
                        <svg width="100%" height="350" viewBox="0 0 400 350" style={{fontFamily: 'Arial, sans-serif'}}>
                          {/* Chart Title */}
                          <text x="200" y="25" textAnchor="middle" fontSize="20" fontWeight="bold" fill="#333">
                            Twelve Months Distribution
                          </text>
                          
                          {/* Calculate data for donut chart */}
                          {(() => {
                            const karnatakaData = apiMetrics.plan?.karnataka?.['12_month'] || 0;
                            const outsideKarnatakaData = apiMetrics.plan?.outside_karnataka?.['12_month'] || 0;
                            const entireRegionData = apiMetrics.karnataka_bucket?.plan?.['12_month'] || 0;
                            
                            // Always show all three segments, even if some are 0
                            // If total is 0, assign equal proportions to show all segments
                            const total = karnatakaData + outsideKarnatakaData + entireRegionData || 1;
                            
                            // Calculate percentages
                            const karnatakaPercentage = total > 0 ? (karnatakaData / total) * 100 : 0;
                            const outsideKarnatakaPercentage = total > 0 ? (outsideKarnatakaData / total) * 100 : 0;
                            const entireRegionPercentage = total > 0 ? (entireRegionData / total) * 100 : 0;
                            
                            // Calculate angles for donut segments
                            const karnatakaAngle = (karnatakaPercentage / 100) * 360;
                            const outsideKarnatakaAngle = (outsideKarnatakaPercentage / 100) * 360;
                            const entireRegionAngle = (entireRegionPercentage / 100) * 360;
                            
                            // Donut chart parameters - much larger donut only
                            const centerX = 200;
                            const centerY = 160;
                            const outerRadius = 130;
                            const innerRadius = 70;
                            
                            // Helper function to create arc path
                            const createArcPath = (startAngle, endAngle, outerRadius, innerRadius) => {
                              // Handle case where angle is 0 or very small
                              if (Math.abs(endAngle - startAngle) < 0.1) {
                                return ''; // Don't render anything for zero/near-zero angles
                              }
                              
                              // Handle full circle case (360 degrees)
                              if (Math.abs(endAngle - startAngle) >= 359.9) {
                                return `
                                  M ${centerX - outerRadius} ${centerY}
                                  A ${outerRadius} ${outerRadius} 0 1 1 ${centerX + outerRadius} ${centerY}
                                  A ${outerRadius} ${outerRadius} 0 1 1 ${centerX - outerRadius} ${centerY}
                                  M ${centerX - innerRadius} ${centerY}
                                  A ${innerRadius} ${innerRadius} 0 1 0 ${centerX + innerRadius} ${centerY}
                                  A ${innerRadius} ${innerRadius} 0 1 0 ${centerX - innerRadius} ${centerY}
                                  Z
                                `;
                              }
                              
                              const startAngleRad = (startAngle * Math.PI) / 180;
                              const endAngleRad = (endAngle * Math.PI) / 180;
                              
                              const x1 = centerX + outerRadius * Math.cos(startAngleRad);
                              const y1 = centerY + outerRadius * Math.sin(startAngleRad);
                              const x2 = centerX + outerRadius * Math.cos(endAngleRad);
                              const y2 = centerY + outerRadius * Math.sin(endAngleRad);
                              
                              const x3 = centerX + innerRadius * Math.cos(endAngleRad);
                              const y3 = centerY + innerRadius * Math.sin(endAngleRad);
                              const x4 = centerX + innerRadius * Math.cos(startAngleRad);
                              const y4 = centerY + innerRadius * Math.sin(startAngleRad);
                              
                              const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
                              
                              return `
                                M ${x1} ${y1}
                                A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2}
                                L ${x3} ${y3}
                                A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}
                                Z
                              `;
                            };
                            
                            let currentAngle = -90; // Start from top
                            
                            return (
                              <>
                                {/* Karnataka Data Segment */}
                                <path
                                  d={createArcPath(currentAngle, currentAngle + karnatakaAngle, outerRadius, innerRadius)}
                                  fill="#059669"
                                  stroke="#fff"
                                  strokeWidth="2"
                                  style={{cursor: 'pointer'}}
                                >
                                  <title>{user?.name || user?.fullName || 'Client'} Karnataka Data (12 months): {karnatakaData.toFixed(2)} Acres ({karnatakaPercentage.toFixed(1)}%)</title>
                                </path>
                                
                                {/* Outside Karnataka Data Segment */}
                                <path
                                  d={createArcPath(currentAngle + karnatakaAngle, currentAngle + karnatakaAngle + outsideKarnatakaAngle, outerRadius, innerRadius)}
                                  fill="#F59E0B"
                                  stroke="#fff"
                                  strokeWidth="2"
                                  style={{cursor: 'pointer'}}
                                >
                                  <title>{user?.name || user?.fullName || 'Client'} Outside Karnataka Data (12 months): {outsideKarnatakaData.toFixed(2)} Acres ({outsideKarnatakaPercentage.toFixed(1)}%)</title>
                                </path>
                                
                                {/* Entire Region Data Segment */}
                                <path
                                  d={createArcPath(currentAngle + karnatakaAngle + outsideKarnatakaAngle, currentAngle + karnatakaAngle + outsideKarnatakaAngle + entireRegionAngle, outerRadius, innerRadius)}
                                  fill="#EC4899"
                                  stroke="#fff"
                                  strokeWidth="2"
                                  style={{cursor: 'pointer'}}
                                >
                                  <title>Entire Region Data (12 months): {entireRegionData.toFixed(2)} Acres ({entireRegionPercentage.toFixed(1)}%)</title>
                                </path>
                                
                                                                
                                {/* Center text */}
                                <text x={centerX} y={centerY - 5} textAnchor="middle" fontSize="15" fontWeight="bold" fill="#333">
                                  Twelve Months
                                </text>
                                <text x={centerX} y={centerY + 8} textAnchor="middle" fontSize="12" fill="#666">
                                  Plan
                                </text>
                              </>
                            );
                          })()}
                        </svg>
                        
                        {/* Legend Summary Below Chart */}
                        <div style={{marginTop: '20px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '6px', border: '1px solid #dee2e6'}}>
                          <div style={{display: 'flex', justifyContent: 'space-around', alignItems: 'center'}}>
                            <div style={{textAlign: 'center'}}>
                              <div style={{fontSize: '11px', color: '#666', marginBottom: '4px'}}>{user?.name || user?.fullName || 'Client'} Karnataka</div>
                              <div style={{fontSize: '14px', fontWeight: 'bold', color: '#059669'}}>{(apiMetrics.plan?.karnataka?.['12_month'] || 0).toFixed(2)}</div>
                              <div style={{fontSize: '10px', color: '#666'}}>Acres</div>
                            </div>
                            <div style={{textAlign: 'center'}}>
                              <div style={{fontSize: '11px', color: '#666', marginBottom: '4px'}}>{user?.name || user?.fullName || 'Client'} Outside Karnataka</div>
                              <div style={{fontSize: '14px', fontWeight: 'bold', color: '#F59E0B'}}>{(apiMetrics.plan?.outside_karnataka?.['12_month'] || 0).toFixed(2)}</div>
                              <div style={{fontSize: '10px', color: '#666'}}>Acres</div>
                            </div>
                            <div style={{textAlign: 'center'}}>
                              <div style={{fontSize: '11px', color: '#666', marginBottom: '4px'}}>Entire Region</div>
                              <div style={{fontSize: '14px', fontWeight: 'bold', color: '#EC4899'}}>{(apiMetrics.karnataka_bucket?.plan?.['12_month'] || 0).toFixed(2)}</div>
                              <div style={{fontSize: '10px', color: '#666'}}>Acres</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

                          </>
          )}
        </div>
      </div>
    </div>
  );
}
