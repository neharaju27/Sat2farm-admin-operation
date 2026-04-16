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

  // Fetch monthly report data from API
  useEffect(() => {
    const fetchMonthlyReports = async () => {
      try {
        setLoadingMonths(true);
        const response = await fetch(`${import.meta.env.VITE_LABELING_API_URL}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (Array.isArray(data)) {
          const months = data.map(item => item.label);
          const filesMap = {};
          data.forEach(item => {
            filesMap[item.label] = item.file;
          });
          
          setAvailableMonths(months);
          setMonthlyFiles(filesMap);
          
          // Set the first month as selected by default
          if (months.length > 0) {
            setSelectedMonth(months[0]);
            setMonthlyData(dummyMonthlyData[months[0]] || null);
          }
        } else {
          throw new Error('Invalid API response format');
        }
      } catch (error) {
        console.error('Error fetching monthly reports:', error);
        setReportError('Failed to load monthly reports. Using fallback data.');
        // Fallback to hardcoded months if API fails
        const fallbackMonths = ['Oct 25', 'Nov 25', 'Dec 25', 'Jan 26', 'Feb 26', 'Mar 26'];
        setAvailableMonths(fallbackMonths);
        setSelectedMonth('Mar 26');
        setMonthlyData(dummyMonthlyData['Mar 26']);
      } finally {
        setLoadingMonths(false);
      }
    };

    fetchMonthlyReports();
  }, []);

  const handleMonthSelect = (month) => {
    setSelectedMonth(month);
    setMonthlyData(dummyMonthlyData[month] || null);
    // Reset metrics when month changes
    setApiMetrics(null);
    // Auto-fetch metrics for the selected month
    fetchMetricsForMonth(month);
  };

  const fetchMetricsForMonth = async (month) => {
    const selectedFile = monthlyFiles[month];
    if (selectedFile) {
      try {
        const response = await fetch(`${import.meta.env.VITE_ESLY_API_URL}?filename=${encodeURIComponent(selectedFile.split('/').pop())}&download=true`);
        
        if (response.ok) {
          const data = await response.json();
          if (data.status === 'success' && data.metrics) {
            setApiMetrics(data.metrics);
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

              {/* Summary Metrics */}
              {apiMetrics && (
                <div className="metrics" style={{gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: '24px'}}>
                  <div className="metric">
                    <div className="metric-label">Total Unlocked Area</div>
                    <div className="metric-val">{(apiMetrics.total_unlocked_area || 0).toFixed(2)}</div>
                    <div className="metric-sub">Acres</div>
                  </div>
                  
                  <div className="metric">
                    <div className="metric-label">Total Added Area</div>
                    <div className="metric-val">{(apiMetrics.total_added_area || 0).toFixed(2)}</div>
                    <div className="metric-sub">Acres</div>
                  </div>
                </div>
              )}

              {/* Karnataka and Outside Karnataka Metrics */}
              {apiMetrics && (
                <div className="two-col" style={{marginBottom: '24px'}}>
                  <div className="card">
                    <div className="card-head">
                      <span className="card-title">Added Area</span>
                      <div className="month-chip">{selectedMonth}</div>
                    </div>
                    <div className="card-body">
                      <div style={{textAlign: 'center', padding: '20px'}}>
                        <div style={{marginBottom: '12px'}}>
                          <div style={{fontSize: '20px', color: '#184876', marginBottom: '4px'}}>
                            📍 Karnataka: {(apiMetrics.karnataka_added_area || 0).toFixed(2)} Acres
                          </div>
                          <div style={{fontSize: '20px', color: '#059669', marginBottom: '8px'}}>
                            🌍 Outside Karnataka: {(apiMetrics.outside_karnataka_added_area || 0).toFixed(2)} Acres
                          </div>
                          
                        </div>
                        
                        {/* 3D Pie Chart */}
                        <div style={{display: 'flex', justifyContent: 'center', marginBottom: '16px'}}>
                          <svg width="240" height="240" viewBox="0 0 120 120" style={{filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))'}}>
                            <defs>
                              <linearGradient id="karnatakaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" style={{stopColor: '#3B6D11', stopOpacity: 1}} />
                                <stop offset="100%" style={{stopColor: '#27500A', stopOpacity: 1}} />
                              </linearGradient>
                              <linearGradient id="otherGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" style={{stopColor: '#185FA5', stopOpacity: 1}} />
                                <stop offset="100%" style={{stopColor: '#0F4A8A', stopOpacity: 1}} />
                              </linearGradient>
                            </defs>
                            
                            {/* 3D Effect - Bottom Ellipse */}
                            <ellipse cx="60" cy="85" rx="55" ry="8" fill="rgba(0,0,0,0.1)" />
                            
                            {/* Pie Slices */}
                            {(() => {
                              const karnatakaAdded = apiMetrics.karnataka_added_area || 0;
                              const outsideKarnatakaAdded = apiMetrics.outside_karnataka_added_area || 0;
                              const totalAdded = karnatakaAdded + outsideKarnatakaAdded;
                              const karnatakaPercentage = totalAdded > 0 ? (karnatakaAdded / totalAdded) * 100 : 0;
                              const otherPercentage = 100 - karnatakaPercentage;
                              const karnatakaAngle = (karnatakaPercentage / 100) * 360;
                              
                              // Handle 100% cases
                              if (karnatakaPercentage === 100) {
                                return (
                                  <g>
                                    {/* Full Karnataka Circle */}
                                    <circle cx="60" cy="60" r="50" fill="url(#karnatakaGradient)" stroke="#ffffff" strokeWidth="2" />
                                    {/* 3D Effect - Full Circle */}
                                    <ellipse cx="60" cy="85" rx="55" ry="8" fill="rgba(0,0,0,0.1)" />
                                  </g>
                                );
                              }
                              
                              if (otherPercentage === 100) {
                                return (
                                  <g>
                                    {/* Full Other States Circle */}
                                    <circle cx="60" cy="60" r="50" fill="url(#otherGradient)" stroke="#ffffff" strokeWidth="2" />
                                    {/* 3D Effect - Full Circle */}
                                    <ellipse cx="60" cy="85" rx="55" ry="8" fill="rgba(0,0,0,0.1)" />
                                  </g>
                                );
                              }
                              
                              return (
                                <g>
                                  {/* Karnataka Slice */}
                                  <path
                                    d={`M 60 60 L 60 10 A 50 50 0 ${karnatakaAngle > 180 ? 1 : 0} 1 ${60 + 50 * Math.sin(karnatakaAngle * Math.PI / 180)} ${60 - 50 * Math.cos(karnatakaAngle * Math.PI / 180)} Z`}
                                    fill="url(#karnatakaGradient)"
                                    stroke="#ffffff"
                                    strokeWidth="2"
                                  />
                                    
                                  {/* Other States Slice */}
                                  <path
                                    d={`M 60 60 L ${60 + 50 * Math.sin(karnatakaAngle * Math.PI / 180)} ${60 - 50 * Math.cos(karnatakaAngle * Math.PI / 180)} A 50 50 0 ${karnatakaAngle > 180 ? 0 : 1} 1 60 10 Z`}
                                    fill="url(#otherGradient)"
                                    stroke="#ffffff"
                                    strokeWidth="2"
                                  />
                                    
                                  {/* 3D Side Effect */}
                                  <path
                                    d={`M 60 60 L 60 10 A 50 50 0 ${karnatakaAngle > 180 ? 1 : 0} 1 ${60 + 50 * Math.sin(karnatakaAngle * Math.PI / 180)} ${60 - 50 * Math.cos(karnatakaAngle * Math.PI / 180)} L ${60 + 55 * Math.sin(karnatakaAngle * Math.PI / 180)} ${85 - 8 * Math.cos(karnatakaAngle * Math.PI / 180)} Z`}
                                    fill="rgba(0,0,0,0.1)"
                                  />
                                </g>
                              );
                            })()}
                          </svg>
                        </div>
                        
                        <div style={{fontSize: '20px', color: 'var(--text-3)', marginTop: '8px'}}>
                            📊 {((apiMetrics.karnataka_added_area || 0) / ((apiMetrics.karnataka_added_area || 0) + (apiMetrics.outside_karnataka_added_area || 0)) * 100).toFixed(1)}% Karnataka, {((apiMetrics.outside_karnataka_added_area || 0) / ((apiMetrics.karnataka_added_area || 0) + (apiMetrics.outside_karnataka_added_area || 0)) * 100).toFixed(1)}% Other States
                          </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="card">
                    <div className="card-head">
                      <span className="card-title">Unlocked Acres</span>
                      <div className="month-chip">{selectedMonth}</div>
                    </div>
                    <div className="card-body">
                      <div style={{textAlign: 'center', padding: '20px'}}>
                        <div style={{marginBottom: '12px'}}>
                          <div style={{fontSize: '20px', color: '#BA7517', marginBottom: '4px'}}>
                            📍 Karnataka: {(apiMetrics.karnataka_unlocked_area || 0).toFixed(2)} Acres
                          </div>
                          <div style={{fontSize: '20px', color: '#0F6E56', marginBottom: '8px'}}>
                            🌍 Outside Karnataka: {(apiMetrics.outside_karnataka_unlocked_area || 0).toFixed(2)} Acres
                          </div>
                          
                        </div>
                        
                        {/* 3D Pie Chart */}
                        <div style={{display: 'flex', justifyContent: 'center', marginBottom: '16px'}}>
                          <svg width="240" height="240" viewBox="0 0 120 120" style={{filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))'}}>
                            <defs>
                              <linearGradient id="outsideGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" style={{stopColor: '#0F6E56', stopOpacity: 1}} />
                                <stop offset="100%" style={{stopColor: '#0A5A47', stopOpacity: 1}} />
                              </linearGradient>
                              <linearGradient id="karnatakaUsageGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" style={{stopColor: '#BA7517', stopOpacity: 1}} />
                                <stop offset="100%" style={{stopColor: '#9A5F12', stopOpacity: 1}} />
                              </linearGradient>
                            </defs>
                            
                            {/* 3D Effect - Bottom Ellipse */}
                            <ellipse cx="60" cy="85" rx="55" ry="8" fill="rgba(0,0,0,0.1)" />
                            
                            {/* Pie Slices */}
                            {(() => {
                              const karnatakaUnlocked = apiMetrics.karnataka_unlocked_area || 0;
                              const outsideKarnatakaUnlocked = apiMetrics.outside_karnataka_unlocked_area || 0;
                              const totalUnlocked = karnatakaUnlocked + outsideKarnatakaUnlocked;
                              const outsidePercentage = totalUnlocked > 0 ? (outsideKarnatakaUnlocked / totalUnlocked) * 100 : 0;
                              const karnatakaUsagePercentage = 100 - outsidePercentage;
                              const outsideAngle = (outsidePercentage / 100) * 360;
                              
                              // Handle 100% cases
                              if (karnatakaUsagePercentage === 100) {
                                return (
                                  <g>
                                    {/* Full Karnataka Circle */}
                                    <circle cx="60" cy="60" r="50" fill="url(#karnatakaUsageGradient)" stroke="#ffffff" strokeWidth="2" />
                                    {/* 3D Effect - Full Circle */}
                                    <ellipse cx="60" cy="85" rx="55" ry="8" fill="rgba(0,0,0,0.1)" />
                                  </g>
                                );
                              }
                              
                              if (outsidePercentage === 100) {
                                return (
                                  <g>
                                    {/* Full Other States Circle */}
                                    <circle cx="60" cy="60" r="50" fill="url(#outsideGradient)" stroke="#ffffff" strokeWidth="2" />
                                    {/* 3D Effect - Full Circle */}
                                    <ellipse cx="60" cy="85" rx="55" ry="8" fill="rgba(0,0,0,0.1)" />
                                  </g>
                                );
                              }
                              
                              return (
                                <g>
                                  {/* Outside Karnataka Slice */}
                                  <path
                                    d={`M 60 60 L 60 10 A 50 50 0 ${outsideAngle > 180 ? 1 : 0} 1 ${60 + 50 * Math.sin(outsideAngle * Math.PI / 180)} ${60 - 50 * Math.cos(outsideAngle * Math.PI / 180)} Z`}
                                    fill="url(#outsideGradient)"
                                    stroke="#ffffff"
                                    strokeWidth="2"
                                  />
                                    
                                  {/* Karnataka Usage Slice */}
                                  <path
                                    d={`M 60 60 L ${60 + 50 * Math.sin(outsideAngle * Math.PI / 180)} ${60 - 50 * Math.cos(outsideAngle * Math.PI / 180)} A 50 50 0 ${outsideAngle > 180 ? 0 : 1} 1 60 10 Z`}
                                    fill="url(#karnatakaUsageGradient)"
                                    stroke="#ffffff"
                                    strokeWidth="2"
                                  />
                                    
                                  {/* 3D Side Effect */}
                                  <path
                                    d={`M 60 60 L 60 10 A 50 50 0 ${outsideAngle > 180 ? 1 : 0} 1 ${60 + 50 * Math.sin(outsideAngle * Math.PI / 180)} ${60 - 50 * Math.cos(outsideAngle * Math.PI / 180)} L ${60 + 55 * Math.sin(outsideAngle * Math.PI / 180)} ${85 - 8 * Math.cos(outsideAngle * Math.PI / 180)} Z`}
                                    fill="rgba(0,0,0,0.1)"
                                  />
                                </g>
                              );
                            })()}
                          </svg>
                        </div>
                        
                        <div style={{fontSize: '20px', color: 'var(--text-3)', marginTop: '8px'}}>
                            📊 {((apiMetrics.karnataka_unlocked_area || 0) / ((apiMetrics.karnataka_unlocked_area || 0) + (apiMetrics.outside_karnataka_unlocked_area || 0)) * 100).toFixed(1)}% Karnataka, {((apiMetrics.outside_karnataka_unlocked_area || 0) / ((apiMetrics.karnataka_unlocked_area || 0) + (apiMetrics.outside_karnataka_unlocked_area || 0)) * 100).toFixed(1)}% Other States
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
