import Card from "./Card";
import { Search, Plus, Bell, Calendar, Settings, Grid3x3, RefreshCw, MoreVertical, Building, Users, Phone, Target, Menu, X, Home, BarChart3, TrendingUp, ClipboardList, ChevronDown, User, Download } from 'lucide-react';
import { useState, useRef, useEffect } from "react";
import axios from "axios";
// pushing in to get_acreages_data branch
export default function Operation({ user }) {
  const today = new Date();
  const [fromDay, setFromDay] = useState('01');
  const [fromMonth, setFromMonth] = useState('01');
  const [fromYear, setFromYear] = useState(today.getFullYear().toString());
  const [toDay, setToDay] = useState('01');
  const [toMonth, setToMonth] = useState('01');
  const [toYear, setToYear] = useState(today.getFullYear().toString());
  const [selectedTable, setSelectedTable] = useState('day');
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(10);

  // Countdown timer (30s) shown in date range header
  const [timerSeconds, setTimerSeconds] = useState(0);
  const timerRef = useRef(null);

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startTimer = () => {
    clearTimer();
    setTimerSeconds(30);
    timerRef.current = setInterval(() => {
      setTimerSeconds(prev => {
        if (prev <= 1) {
          clearTimer();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    return () => clearTimer();
  }, []);

  // API integration
  const API_URL = import.meta.env.VITE_API_URL;

  const fetchData = async () => {
    console.log('🚀 fetchData called');
    console.log('🌐 API_URL:', API_URL);
    console.log('📅 Selected dates:', { fromDay, fromMonth, fromYear, toDay, toMonth, toYear });
    console.log('📊 Selected table:', selectedTable);
    
    try {
      setLoading(true);
      setError(null);
      
      // Validate all date fields are selected
      if (!fromDay || !fromMonth || !fromYear || !toDay || !toMonth || !toYear) {
        console.log('❌ Validation failed - missing date fields');
        setError('Please select all date fields');
        return;
      }
      
      // Construct dates
      const fromDate = `${fromYear}-${fromMonth}-${fromDay}`;
      const toDate = `${toYear}-${toMonth}-${toDay}`;
      
      console.log('📅 Constructed dates:', { fromDate, toDate });
      
      // Determine endpoint based on selected table
      let endpoint = '/data/monthly-acreage'; // Use monthly endpoint as default
      if (selectedTable === 'day') {
        endpoint = '/data/monthly-acreage'; // Use monthly for day as well
      } else if (selectedTable === 'month') {
        endpoint = '/data/monthly-acreage';
      } else if (selectedTable === 'year') {
        endpoint = '/data/yearly-acreage';
      }
      
      // Construct full URL - use proxy for development
      const fullUrl = import.meta.env.DEV 
        ? `${endpoint}?from_date=${fromDate}&to_date=${toDate}` // Use proxy in dev
        : `${API_URL}${endpoint}?from_date=${fromDate}&to_date=${toDate}`; // Direct in prod
      
      console.log('🚀 Making API call:', fullUrl);
      
      // Make API call with multiple methods
      let response;
      try {
        // Method 1: Direct axios call
        console.log('📡 Trying axios...');
        response = await axios.get(fullUrl, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        console.log('✅ Direct axios success:', response.data);
      } catch (axiosError) {
        console.log('❌ Direct axios failed, trying fetch:', axiosError.message);
        console.log('🔍 Axios error details:', axiosError);
        
        // Method 2: Fetch API as fallback
        console.log('📡 Trying fetch API...');
        const fetchResponse = await fetch(fullUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        
        console.log('📡 Fetch response status:', fetchResponse.status);
        
        if (!fetchResponse.ok) {
          throw new Error(`HTTP error! status: ${fetchResponse.status}`);
        }
        
        const data = await fetchResponse.json();
        response = { data };
        console.log('✅ Fetch API success:', data);
      }
      
      // Process response data
      let data = response.data;
      console.log('📊 Raw response data:', data);
      console.log('📊 Data type:', typeof data);
      console.log('📊 Is array?:', Array.isArray(data));
      
      // Log first few records to understand structure
      if (data && data.length > 0) {
        console.log('📋 First record structure:', data[0]);
        console.log('📋 Second record structure:', data[1]);
        console.log('📋 Available fields:', Object.keys(data[0]));
      }
      
      // Handle different response structures
      if (data && typeof data === 'object') {
        // If data is nested, extract the array
        if (data.data && Array.isArray(data.data)) {
          data = data.data;
          console.log('📊 Extracted nested data.data');
        } else if (data.results && Array.isArray(data.results)) {
          data = data.results;
          console.log('📊 Extracted nested data.results');
        } else if (!Array.isArray(data)) {
          // If data is an object, convert to array
          data = [data];
          console.log('📊 Converted object to array');
        }
      }
      
      console.log('📊 Final processed data:', data);
      console.log('📊 Final data length:', data?.length || 0);
      
      // If API returned empty data, show error instead of using sample data
      if (!data || data.length === 0) {
        console.log('📊 API returned empty data');
        setError(`No data found for ${fromDate} to ${toDate}`);
        alert(`❌ No data found for ${fromDate} to ${toDate}. API returned empty response.`);
        return;
      } else {
        console.log('📊 Setting tableData with', data.length, 'records');
        setTableData(data);
        
        console.log('📊 Showing success alert');
        alert(`✅ API Success! Received ${data?.length || 0} records\n\nData loaded in table below`);
      }
      
    } catch (error) {
      console.error('❌ API Error:', error);
      console.error('🔍 Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        url: error.config?.url || 'Unknown'
      });
      
      setError(`API Error: ${error.message}`);
      alert(`❌ API Error: ${error.message}\n\nPlease check your API configuration and try again.`);
    } finally {
      setLoading(false);
      // Stop countdown when request completes
      setTimerSeconds(0);
      clearTimer();
      console.log('🏁 fetchData completed');
    }
  };

  const getCurrentData = () => {
    // Use ONLY the actual API data from tableData state - no sample data fallback
    console.log('📊 getCurrentData called, tableData:', tableData);
    console.log('📊 tableData length:', tableData?.length || 0);
    console.log('📊 selectedTable:', selectedTable);
    
    // Use only real API data - no sample data fallback
    let data = tableData;
    
    // Don't filter API data - the API should already return filtered data
    console.log('📊 Using real API data only, no filtering');
    
    console.log('📊 Final data to return:', data);
    return data;
  };

  const downloadCSV = () => {
    const data = tableData; // Use ALL records for CSV download
    console.log('📥 Download CSV called, data:', data);
    console.log('📥 Data length:', data?.length || 0);
    
    if (!data || data.length === 0) {
      console.log('❌ No data available to download');
      alert('❌ No data available to download');
      return;
    }
    
    // Get actual columns from data
    const sampleItem = data[0];
    const headers = Object.keys(sampleItem);
    
    console.log('📋 CSV Headers:', headers);
    
    const csvContent = [
      headers.join(','),
      ...data.map(item => 
        headers.map(header => {
          const value = item[header];
          // Handle different data types and escape commas
          if (value === null || value === undefined) return '';
          if (typeof value === 'string' && value.includes(',')) return `"${value}"`;
          return value;
        }).join(',')
      )
    ].join('\n');
    
    console.log('📄 CSV Content generated, length:', csvContent.length);
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `operations_data_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    console.log('✅ CSV Download completed');
  };

  const renderTable = () => {
    const data = getCurrentData();
    
    // Show only first 10 records
    const currentRecords = data.slice(0, 10);
    
    return (
      <div style={{
        background: 'white',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
      }}>
        {/* Table Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h3 style={{
            margin: 0,
            fontSize: '18px',
            fontWeight: '600',
            color: '#111827'
          }}>
            {selectedTable.charAt(0).toUpperCase() + selectedTable.slice(1)} Data 
            {data.length > 0 && <span style={{ color: '#6b7280', fontWeight: '400' }}> ({data.length} records)</span>}
          </h3>
          
          {/* Download Button in Table Header - Not in Table Headings */}
          {data.length > 0 && (
            <button
              onClick={downloadCSV}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#059669';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#10b981';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              <Download style={{ width: '16px', height: '16px' }} />
              Download CSV
            </button>
          )}
        </div>

        {/* Table Content */}
        {!loading && data.length > 0 && (
          <>
            {/* Records counter */}
            <div style={{
              padding: '12px 24px',
              borderBottom: '1px solid #e2e8f0',
              fontSize: '14px',
              color: '#6b7280'
            }}>
              Showing {currentRecords.length} of {data.length} records
            </div>
            {/* Table */}
            <div style={{ 
              overflowX: 'auto',
              overflowY: 'auto',
              height: '240px',
              minHeight: '200px',
              border: '1px solid #e5e7f0',
              borderRadius: '8px'
            }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse'
              }}>
                <thead>
                  <tr style={{ backgroundColor: '#f9fafb', position: 'sticky', top: 0, zIndex: 1, height: '24px' }}>
                    {/* Dynamic headers based on actual data */}
                    {data.length > 0 && Object.keys(data[0]).map((key, index) => (
                      <th key={index} style={{
                        padding: '6px 8px',
                        textAlign: 'left',
                        fontWeight: '600',
                        color: '#374151',
                        borderBottom: '1px solid #e5e7eb',
                        fontSize: '12px',
                        backgroundColor: '#f9fafb'
                      }}>
                        {key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {currentRecords.map((item, index) => (
                    <tr key={index} style={{ 
                      borderBottom: '1px solid #e5e7eb',
                      '&:hover': { backgroundColor: '#f9fafb' }
                    }}>
                      {Object.keys(data[0]).map((key, cellIndex) => (
                        <td key={cellIndex} style={{
                          padding: '2px 6px',
                          color: '#374151',
                          fontSize: '10px'
                        }}>
                          {item[key] !== null && item[key] !== undefined ? item[key].toString() : 'N/A'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </>
        )}

        {/* Empty State */}
        {!loading && data.length === 0 && !error && (
          <div style={{
            padding: '40px',
            textAlign: 'center',
            color: '#6b7280'
          }}>
            No data available. Select date range and click Submit to fetch data.
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ 
      flex: 1, 
      background: 'linear-gradient(135deg, #f8fafc 0%, #dbeafe 50%, #e0e7ff 100%)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'auto'
    }}>
      {/* Top Header */}
      <header style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e5e7eb',
        padding: '24px 32px',
        flexShrink: 0,
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <h1 style={{ 
              fontSize: '28px', 
              fontWeight: '600', 
              color: '#111827', 
              margin: 0,
              letterSpacing: '-0.5px',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            }}>
                Get acreage data
        
            </h1>
            
          </div>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            fontSize: '14px', 
            color: '#6b7280', 
            fontWeight: '500'
          }}>
            {timerSeconds > 0 ? (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                borderRadius: '999px',
                backgroundColor: '#f3f4f6',
                color: '#1f2937',
                fontWeight: '600'
              }}>
                <span style={{ fontSize: '12px', color: '#6b7280' }}>Timer:</span>
                <span style={{ fontSize: '14px' }}>
                  {String(Math.floor(timerSeconds / 60)).padStart(2, '0')}:
                  {String(timerSeconds % 60).padStart(2, '0')}
                </span>
              </div>
            ) : (
              <div style={{
                padding: '8px 12px',
                borderRadius: '999px',
                backgroundColor: '#f3f4f6',
                color: '#6b7280',
                fontWeight: '500',
                fontSize: '12px'
              }}>
                Ready to submit
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content - Full Page */}
      <main style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px',
        minHeight: 'calc(100vh - 80px)'
      }}>
        <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
          {/* Date Range and Table Selection Section */}
          <div style={{
            marginBottom: '16px',
            background: 'white',
            borderRadius: '12px',
            padding: '16px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            position: 'sticky',
            top: '20px',
            zIndex: 10
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px'
            }}>
              {/* Date Selection Dropdowns */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '2px'
              }}>
                {/* From Date Section */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151'
                  }}>From Date</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{
                        fontSize: '11px',
                        fontWeight: '600',
                        color: '#6b7280',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        Day
                      </div>
                      <select
                        value={fromDay}
                        onChange={(e) => setFromDay(e.target.value)}
                        style={{
                          padding: '8px 10px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '13px',
                          minWidth: '100px',
                          minHeight: '34px',
                          backgroundColor: 'white',
                          cursor: 'pointer'
                        }}
                      >
                        {Array.from({length: 31}, (_, i) => i + 1).map(day => (
                          <option key={day} value={day.toString().padStart(2, '0')}>{day}</option>
                        ))}
                      </select>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{
                        fontSize: '11px',
                        fontWeight: '600',
                        color: '#6b7280',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        Month
                      </div>
                      <select
                        value={fromMonth}
                        onChange={(e) => setFromMonth(e.target.value)}
                        style={{
                          padding: '8px 10px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '13px',
                          minWidth: '96px',
                          minHeight: '34px',
                          backgroundColor: 'white',
                          cursor: 'pointer'
                        }}
                      >
                        {Array.from({length: 12}, (_, i) => i + 1).map(month => (
                          <option key={month} value={month.toString().padStart(2, '0')}>{month}</option>
                        ))}
                      </select>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{
                        fontSize: '11px',
                        fontWeight: '600',
                        color: '#6b7280',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        Year
                      </div>
                      <select
                        value={fromYear}
                        onChange={(e) => setFromYear(e.target.value)}
                        style={{
                          padding: '8px 10px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '13px',
                          minWidth: '96px',
                          minHeight: '34px',
                          backgroundColor: 'white',
                          cursor: 'pointer'
                        }}
                      >
                        {Array.from({length: 10}, (_, i) => new Date().getFullYear() - i).map(year => (
                          <option key={year} value={year.toString()}>{year}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* To Date Section */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{
                    fontSize: '10px',
                    fontWeight: '500',
                    color: '#374151'
                  }}>To Date</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{
                        fontSize: '11px',
                        fontWeight: '600',
                        color: '#6b7280',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        Day
                      </div>
                      <select
                        value={toDay}
                        onChange={(e) => setToDay(e.target.value)}
                        style={{
                          padding: '8px 10px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '13px',
                          minWidth: '100px',
                          minHeight: '34px',
                          backgroundColor: 'white',
                          cursor: 'pointer'
                        }}
                      >
                        {Array.from({length: 31}, (_, i) => i + 1).map(day => (
                          <option key={day} value={day.toString().padStart(2, '0')}>{day}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{
                        fontSize: '11px',
                        fontWeight: '600',
                        color: '#6b7280',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        Month
                      </div>
                      <select
                        value={toMonth}
                        onChange={(e) => setToMonth(e.target.value)}
                        style={{
                          padding: '8px 10px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '13px',
                          minWidth: '96px',
                          minHeight: '34px',
                          backgroundColor: 'white',
                          cursor: 'pointer'
                        }}
                      >
                        {Array.from({length: 12}, (_, i) => i + 1).map(month => (
                          <option key={month} value={month.toString().padStart(2, '0')}>{month}</option>
                        ))}
                      </select>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{
                        fontSize: '11px',
                        fontWeight: '600',
                        color: '#6b7280',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        Year
                      </div>
                      <select
                        value={toYear}
                        onChange={(e) => setToYear(e.target.value)}
                        style={{
                          padding: '8px 10px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '13px',
                          minWidth: '96px',
                          minHeight: '34px',
                          backgroundColor: 'white',
                          cursor: 'pointer'
                        }}
                      >
                        {Array.from({length: 10}, (_, i) => new Date().getFullYear() - i).map(year => (
                          <option key={year} value={year.toString()}>{year}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    style={{
                      padding: '12px 32px',
                      backgroundColor: loading ? '#9ca3af' : '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: loading ? 'none' : '0 4px 6px -1px rgba(59, 130, 246, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                    disabled={loading}
                    onMouseEnter={(e) => {
                      if (!loading) {
                        e.target.style.backgroundColor = '#2563eb';
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 8px 12px -2px rgba(59, 130, 246, 0.4)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!loading) {
                        e.target.style.backgroundColor = '#3b82f6';
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 4px 6px -1px rgba(59, 130, 246, 0.3)';
                      }
                    }}
                    onClick={() => {
                      // Handle submit with API call
                      console.log('Submit clicked', {
                        fromDay, fromMonth, fromYear,
                        toDay, toMonth, toYear,
                        selectedTable
                      });
                      
                      // Validation
                      if (!fromDay || !fromMonth || !fromYear || !toDay || !toMonth || !toYear) {
                        console.log('❌ Validation failed - missing date fields');
                        setError('Please select all date fields');
                        alert('❌ Please select all date fields before submitting');
                        return;
                      }
                      
                      // Clear previous errors
                      setError(null);
                      
                      // Start countdown timer and fetch data
                      startTimer();
                      fetchData();
                    }}
                  >
                    {loading ? (
                      <>
                        <div style={{
                          width: '20px',
                          height: '20px',
                          border: '2px solid rgba(255, 255, 255, 0.3)',
                          borderTop: '2px solid #ffffff',
                          borderRadius: '50%',
                          animation: 'spin 1s linear infinite'
                        }}></div>
                        <span style={{ 
                          marginLeft: '12px', 
                          fontSize: '14px', 
                          fontWeight: '500',
                          color: 'rgba(255, 255, 255, 0.9)'
                        }}>
                          Processing
                        </span>
                      </>
                    ) : (
                      'Submit'
                    )}
                  </button>
                </div>
              </div>

              {/* Table Selection and Download */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                

                
              </div>
            </div>
          </div>

          {/* Data Table */}
          {renderTable()}
        </div>
      </main>
    </div>
  );
}
