import { useState, useEffect, useRef } from "react";
import { TrendingUp, Users, Target, BarChart3, Calendar, ArrowUpRight, ArrowDownRight, Filter, X, Download } from "lucide-react";
import ReactECharts from 'echarts-for-react';
import axios from "axios";
import toast from 'react-hot-toast';
import "../styles/Sat2FarmAdminPortal.css";

// Function to sort months chronologically and limit to 6 months
const sortAndLimitMonths = (months) => {
  if (!Array.isArray(months) || months.length === 0) return [];
  
  const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const parsedMonths = months.map(monthStr => {
    const parts = monthStr.split(' ');
    if (parts.length !== 2) return { month: monthStr, monthName: '', year: '', sortOrder: -1 };
    
    const [monthName, year] = parts;
    const monthIndex = monthOrder.indexOf(monthName);
    
    return {
      month: monthStr,
      monthName,
      year: parseInt(year),
      monthIndex,
      sortKey: monthIndex === -1 ? -1 : (parseInt(year) * 100 + monthIndex)
    };
  }).filter(item => item.sortKey !== -1);
  
  parsedMonths.sort((a, b) => a.sortKey - b.sortKey);
  const recentMonths = parsedMonths.slice(-6);
  
  return recentMonths.map(item => item.month);
};

export default function MarketingDashboard({ user, onPageChange }) {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('monthly');
  const [selectedMonth, setSelectedMonth] = useState('Mar 26');
  const [selectedYear, setSelectedYear] = useState('all');
  const [isLast6Months, setIsLast6Months] = useState(false);
  const [isCustom, setIsCustom] = useState(false);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [availableMonths, setAvailableMonths] = useState(() => sortAndLimitMonths(['Oct 25', 'Nov 25', 'Dec 25', 'Jan 26', 'Feb 26', 'Mar 26']));
  const [contactOwner, setContactOwner] = useState('all');
  const [leadSource, setLeadSource] = useState('all');
  const [region, setRegion] = useState([]);
  const [regionOperator, setRegionOperator] = useState('contains');
  const [status, setStatus] = useState('all');
  const [filterSidebarOpen, setFilterSidebarOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [filterOptionsLoading, setFilterOptionsLoading] = useState(false);
  const getFilteredRegions = () => {
  if (!regionSearchTerm) return uniqueRegions;
  const term = regionSearchTerm.toLowerCase();
  return uniqueRegions.filter((r) => {
    const val = r.toLowerCase();
    if (pendingRegionOperator === 'is') return val === term;
    if (pendingRegionOperator === 'is_not') return val !== term;
    return val.includes(term); // contains
  });
};

  const handleAddCustomRegion = () => {
    if (regionSearchTerm && regionSearchTerm.trim() && !pendingRegion.includes(regionSearchTerm.trim())) {
      setPendingRegion([...pendingRegion, regionSearchTerm.trim()]);
      setRegionSearchTerm('');
      setRegionDropdownOpen(false);
    }
  };
  
  // Pending filter states (for Apply button)
  const [pendingContactOwner, setPendingContactOwner] = useState('all');
  const [pendingLeadSource, setPendingLeadSource] = useState('all');
  const [pendingRegion, setPendingRegion] = useState([]);
  const [pendingStatus, setPendingStatus] = useState('all');
  const [pendingSelectedMonth, setPendingSelectedMonth] = useState('Mar 26');
  const [pendingSelectedYear, setPendingSelectedYear] = useState('all');
  const [pendingIsCustom, setPendingIsCustom] = useState(false);
  const [pendingIsLast6Months, setPendingIsLast6Months] = useState(false);
  const [pendingFromDate, setPendingFromDate] = useState('');
  const [pendingToDate, setPendingToDate] = useState('');
  const [regionDropdownOpen, setRegionDropdownOpen] = useState(false);
  const [pendingRegionOperator, setPendingRegionOperator] = useState('contains');
  const [regionSearchTerm, setRegionSearchTerm] = useState('');
  const [metrics, setMetrics] = useState({
    totalLeads: 0,
    convertedLeads: 0,
    conversionRate: 0,
    totalRevenue: 0,
    leadsGrowth: 0,
    revenueGrowth: 0,
    accountsWithDeal: 0
  });
  const [leadSourceData, setLeadSourceData] = useState([]);
  const [dealStageData, setDealStageData] = useState([]);
  const [monthlyTrendData, setMonthlyTrendData] = useState([]);
  const [uniqueLeadSources, setUniqueLeadSources] = useState([]);
  const [uniqueRegions, setUniqueRegions] = useState([]);
  const [uniqueStatuses, setUniqueStatuses] = useState([]);
  const [uniqueContactOwners, setUniqueContactOwners] = useState([]);
  const [uniqueYears, setUniqueYears] = useState([]);
  const [monthQueryMap, setMonthQueryMap] = useState({});
  const [monthLoading, setMonthLoading] = useState(false);

  const handleMetricClick = (metricName, value) => {
    toast.success(`${metricName}: ${formatNumber(value)}`);
  };

  const applyFilters = () => {
    setContactOwner(pendingContactOwner);
    setLeadSource(pendingLeadSource);
    setRegion(pendingRegion);
    setRegionOperator(pendingRegionOperator);
    setStatus(pendingStatus);
    setSelectedMonth(pendingSelectedMonth);
    setSelectedYear(pendingSelectedYear);
    setIsCustom(pendingIsCustom);
    setIsLast6Months(pendingIsLast6Months);
    setFromDate(pendingFromDate);
    setToDate(pendingToDate);
    setFilterSidebarOpen(false);
    toast.success('Filters applied');
  };

  // Sync pending states with actual states when sidebar opens
  useEffect(() => {
    if (filterSidebarOpen) {
      setPendingContactOwner(contactOwner);
      setPendingLeadSource(leadSource);
      setPendingRegion(region);
      setPendingStatus(status);
      setPendingSelectedMonth(selectedMonth);
      setPendingSelectedYear(selectedYear);
      setPendingIsCustom(isCustom);
      setPendingIsLast6Months(isLast6Months);
      setPendingFromDate(fromDate);
      setPendingToDate(toDate);
      setPendingRegionOperator(regionOperator);
      fetchFilterOptions();
    }
  }, [filterSidebarOpen, contactOwner, leadSource, region, status, selectedMonth, selectedYear, isCustom, isLast6Months, fromDate, toDate, regionOperator]);

  const clearFilters = () => {
    setSelectedMonth('Mar 26');
    setSelectedYear('all');
    setIsCustom(false);
    setIsLast6Months(false);
    setFromDate('');
    setToDate('');
    setContactOwner('all');
    setLeadSource('all');
    setRegion([]);
    setRegionOperator('contains');
    setStatus('all');
    setPendingContactOwner('all');
    setPendingLeadSource('all');
    setPendingRegion([]);
    setPendingRegionOperator('contains');
    setPendingStatus('all');
    setPendingSelectedMonth('Mar 26');
    setPendingSelectedYear('all');
    setPendingIsCustom(false);
    setPendingIsLast6Months(false);
    setPendingFromDate('');
    setPendingToDate('');
    setRegionSearchTerm('');
    toast.success('Filters cleared');
  };
  const regionFilterRef = useRef(null);

useEffect(() => {
  const handleClickOutside = (event) => {
    if (regionFilterRef.current && !regionFilterRef.current.contains(event.target)) {
      setRegionDropdownOpen(false);
    }
  };
  document.addEventListener('mousedown', handleClickOutside);
  return () => document.removeEventListener('mousedown', handleClickOutside);
}, []);
  const fetchFilterOptions = async () => {
  try {
    setFilterOptionsLoading(true);
    const baseUrl =  import.meta.env.VITE_MARKETING_DASHBOARD_API_URL;

    console.log('Fetching all filter options from:', baseUrl);
    const response = await axios.get(baseUrl);

    if (response.data) {
      const data = response.data;

      if (data.owners) {
        setUniqueContactOwners(data.owners);
      }

      if (data.lead_source) {
        const sources = [...new Set(data.lead_source.map(item => item.lead_source))];
        setUniqueLeadSources(sources);
      }

      if (data.region && data.region.data) {
  const regionSet = new Set();
  data.region.data.forEach(item => {
    if (item.region) regionSet.add(item.region);
    if (item.state) regionSet.add(item.state);
    if (item.city) regionSet.add(item.city);
    // add any other geo fields your API returns, e.g. item.country, item.district
  });
  setUniqueRegions([...regionSet]);
}

      if (data.deal_stage) {
        const statuses = [...new Set(data.deal_stage.map(item => item.stage))];
        setUniqueStatuses(statuses);
      }
    }
  } catch (error) {
    console.error('Error fetching filter options:', error);
  } finally {
    setFilterOptionsLoading(false);
  }
};

  const hasActiveFilters = selectedMonth !== 'Mar 26' || leadSource !== 'all' || region.length > 0 || status !== 'all' || contactOwner !== 'all';

  // Fetch month list from dedicated endpoint
  useEffect(() => {
    const fetchMonthList = async () => {
      try {
        const apiUrl = import.meta.env.VITE_MARKETING_DASHBOARD_API_URL;
        const monthListUrl = `${apiUrl}/month-list`;
        
        console.log('Fetching month list from:', monthListUrl);
        const response = await axios.get(monthListUrl);
        
        if (response.data && response.data.months) {
          const months = response.data.months;
          const labels = months.map(m => m.label);
          
          // Create query map for API calls
          const queryMap = {};
          months.forEach(m => {
            queryMap[m.label] = m.query;
          });
          
          setAvailableMonths(labels);
          setMonthQueryMap(queryMap);
          
          // Set default selected month from API
          if (response.data.default) {
            const defaultMonth = months.find(m => m.query === response.data.default);
            if (defaultMonth) {
              setSelectedMonth(defaultMonth.label);
            }
          }
          
          console.log('Month list fetched:', labels);
          console.log('Query map:', queryMap);
        }
      } catch (error) {
        console.error('Error fetching month list:', error);
      }
    };
    
    fetchMonthList();
  }, []);

  // Fetch year list from dedicated endpoint
  useEffect(() => {
    const fetchYearList = async () => {
      try {
        const apiUrl = import.meta.env.VITE_MARKETING_DASHBOARD_API_URL;
        const yearListUrl = `${apiUrl}/year-list`;
        
        console.log('Fetching year list from:', yearListUrl);
        const response = await axios.get(yearListUrl);
        
        if (response.data && response.data.years) {
          const years = response.data.years;
          setUniqueYears(years);
          console.log('Year list fetched:', years);
        }
      } catch (error) {
        console.error('Error fetching year list:', error);
      }
    };
    
    fetchYearList();
  }, []);
  const handleDownloadDeals = async () => {
  try {
    setDownloading(true);
    //const apiUrl = import.meta.env.VITE_MARKETING_DASHBOARD_API_URL;;
    const baseUrl = import.meta.env.VITE_MARKETING_DASHBOARD_DOWNLOAD_URL;
    //https://api.sat2farm.com/dashboard/dashboard/marketing-dashboard/download";

    const params = new URLSearchParams();

    // Same date/period params as your main fetch
    if (isCustom && fromDate && toDate) {
      params.append('period', 'custom');
      params.append('from', fromDate);
      params.append('to', toDate);
    } else if (isLast6Months) {
      params.append('period', 'last6months');
    } else {
      params.append('period', 'month');
      if (selectedMonth && selectedMonth !== 'all' && monthQueryMap[selectedMonth]) {
        const queryParts = monthQueryMap[selectedMonth].split('_');
        if (queryParts.length === 2) {
          params.append('month', queryParts[0]);
          params.append('year', queryParts[1]);
        }
      }
    }

    // Same filters as your main fetch
    if (leadSource && leadSource !== 'all') {
      params.append('lead_source', leadSource);
    }
    if (region && region.length > 0) {
      params.append('region', region.join(','));
    }
    if (status && status !== 'all') {
      params.append('deal_stage', status);
    }
    if (contactOwner && contactOwner !== 'all') {
      params.append('owner', contactOwner);
    }

    // The new bit: tell the API this is a download request
    //params.append('download', 'true');

    const url = `${baseUrl}?${params.toString()}`;
    console.log('Downloading deals from:', url);

    const response = await axios.get(url, { responseType: 'blob' });

    // Trigger the browser download
    const blob = new Blob([response.data], { type: response.headers['content-type'] });
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;

    // Try to pull filename from headers, else fall back to a default
    const disposition = response.headers['content-disposition'];
    let filename = `deals_${Date.now()}.xlsx`;
    if (disposition && disposition.includes('filename=')) {
      filename = disposition.split('filename=')[1].replace(/["']/g, '').trim();
    }
    link.setAttribute('download', filename);

    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);

    toast.success('Deals downloaded successfully');
  } catch (error) {
    console.error('Error downloading deals:', error);
    toast.error('Failed to download deals');
  } finally {
    setDownloading(false);
  }
};
// Fetch monthly conversion trend independently — always full 12 months, unaffected by other filters
  useEffect(() => {
    const fetchTrendData = async () => {
      try {
        const apiUrl = import.meta.env.VITE_MARKETING_DASHBOARD_API_URL;
        const params = new URLSearchParams();
        
        // Only use trend_year parameter as requested
        params.append('trend_year', selectedYear && selectedYear !== 'all' ? selectedYear : '2026');

        const url = `${apiUrl}?${params.toString()}`;
        console.log('🔵 TREND FETCH URL:', url);

        const response = await axios.get(url);

        if (response.data && response.data.monthly_conversion_trend) {
          const trend = response.data.monthly_conversion_trend;
          if (trend.data && Array.isArray(trend.data)) {
            setMonthlyTrendData(trend.data);
          } else if (Array.isArray(trend)) {
            setMonthlyTrendData(trend);
          }
        }
      } catch (error) {
        console.error('Error fetching monthly trend data:', error);
      }
    };

    fetchTrendData();
  }, [selectedYear]);

  const handleDownloadDealsLast6Months = async () => {
  try {
    setDownloading(true);
    const baseUrl = import.meta.env.VITE_MARKETING_DASHBOARD_DOWNLOAD_URL;

    const params = new URLSearchParams();
    params.append('period', 'last6months');

    // Include current filters
    if (leadSource && leadSource !== 'all') {
      params.append('lead_source', leadSource);
    }
    if (region && region.length > 0) {
      params.append('region', region.join(','));
    }
    if (status && status !== 'all') {
      params.append('deal_stage', status);
    }
    if (contactOwner && contactOwner !== 'all') {
      params.append('owner', contactOwner);
    }

    const url = `${baseUrl}?${params.toString()}`;
    console.log('Downloading deals for last 6 months from:', url);

    const response = await axios.get(url, { responseType: 'blob' });

    // Trigger the browser download
    const blob = new Blob([response.data], { type: response.headers['content-type'] });
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;

    // Try to pull filename from headers, else fall back to a default
    const disposition = response.headers['content-disposition'];
    let filename = `deals_last_6_months_${Date.now()}.xlsx`;
    if (disposition && disposition.includes('filename=')) {
      filename = disposition.split('filename=')[1].replace(/["']/g, '').trim();
    }
    link.setAttribute('download', filename);

    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);

    toast.success('Deals for last 6 months downloaded successfully');
  } catch (error) {
    console.error('Error downloading deals for last 6 months:', error);
    toast.error('Failed to download deals for last 6 months');
  } finally {
    setDownloading(false);
  }
};

  useEffect(() => {
    const fetchMarketingData = async () => {
      try {
        const apiUrl = import.meta.env.VITE_MARKETING_DASHBOARD_API_URL;
        
        // Build query parameters using month query map
        const params = new URLSearchParams();
        
        if (isCustom && fromDate && toDate) {
          params.append('period', 'custom');
          params.append('from', fromDate);
          params.append('to', toDate);
        } else if (isLast6Months) {
          params.append('period', 'last6months');
        } else {
          params.append('period', 'month');
          // Use the query parameter from month list API
          if (selectedMonth && selectedMonth !== 'all' && monthQueryMap[selectedMonth]) {
            const queryParts = monthQueryMap[selectedMonth].split('_');
            if (queryParts.length === 2) {
              params.append('month', queryParts[0]);
              params.append('year', queryParts[1]);
            }
          }
        }
        if (leadSource && leadSource !== 'all') {
          params.append('lead_source', leadSource);
        }
        if (region && region.length > 0) {
          params.append('region', region.join(','));
        }
        if (status && status !== 'all') {
          params.append('deal_stage', status);
        }
        if (contactOwner && contactOwner !== 'all') {
          params.append('owner', contactOwner);
        }
        
        const queryString = params.toString();
        const url = queryString ? `${apiUrl}?${queryString}` : apiUrl;
        
        console.log('Fetching marketing data from:', url);
        
        const response = await axios.get(url);
        
        console.log('API response:', response.data);
        
        if (response.data) {
          const data = response.data;
          
          // Set metrics
          if (data.kpi) {
            const kpi = data.kpi;
            setMetrics({
              totalLeads: kpi.total_leads || 0,
              convertedLeads: kpi.converted_accounts || 0,
              conversionRate: kpi.account_to_deal_rate || kpi.lead_to_deal_rate || 0,
              totalRevenue: data.total_paid?.total_paid || 0,
              leadsGrowth: 0, // Will be calculated or provided later
              revenueGrowth: 0, // Will be calculated or provided later
              accountsWithDeal: kpi.accounts_with_deals || 0
            });
          }
          
          // Set lead source data for pie chart
          if (data.lead_source) {
            setLeadSourceData(data.lead_source);
          }
          
          // Set deal stage data for donut chart
          if (data.deal_stage) {
            setDealStageData(data.deal_stage);
          }
          {/*
          // Set monthly conversion trend data for line chart
          if (data.monthly_conversion_trend) {
            setMonthlyTrendData(data.monthly_conversion_trend);
          }*/}
          
          // Extract unique lead sources for dropdown
          if (data.lead_source) {
            const sources = [...new Set(data.lead_source.map(item => item.lead_source))];
            setUniqueLeadSources(sources);
          }
          
          // Extract unique regions for dropdown
          if (data.region && data.region.data) {
  const regionSet = new Set();
  data.region.data.forEach(item => {
    if (item.region) regionSet.add(item.region);
    if (item.state) regionSet.add(item.state);
    if (item.city) regionSet.add(item.city);
    // add any other geo fields your API returns, e.g. item.country, item.district
  });
  setUniqueRegions([...regionSet]);
}
          
          // Extract unique statuses for dropdown (from deal_stage)
          if (data.deal_stage) {
            const statuses = [...new Set(data.deal_stage.map(item => item.stage))];
            setUniqueStatuses(statuses);
          }
          
          // Extract unique contact owners for dropdown
          console.log('Contact owner data from API:', data.owners);
          if (data.owners) {
            console.log('Extracted contact owners:', data.owners);
            setUniqueContactOwners(data.owners);
          } else {
            console.log('No owners data found in API response');
            // Check if contact owners might be in a different structure
            console.log('Available keys in data:', Object.keys(data));
          }
        }
        setLoading(false);
        setMonthLoading(false);
      } catch (error) {
        console.error('Error fetching marketing dashboard data:', error);
        setLoading(false);
        setMonthLoading(false);
      }
    };

    fetchMarketingData();
  }, [selectedMonth, leadSource, region, status, contactOwner, isLast6Months, isCustom, fromDate, toDate]);

  const displayName =
    user?.name ||
    user?.fullName ||
    user?.first_name ||
    "Marketing User";

  const formatNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toLocaleString();
  };

  const formatCurrency = (num) => {
    return '₹' + num.toLocaleString('en-IN');
  };

  // Process lead source data for pie chart
  const getProcessedLeadSourceData = () => {
    if (!leadSourceData || leadSourceData.length === 0) {
      return [];
    }
    
    const total = leadSourceData.reduce((sum, item) => sum + item.count, 0);
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];
    
    return leadSourceData.slice(0, 8).map((item, index) => ({
      name: item.lead_source,
      count: item.count,
      percentage: ((item.count / total) * 100).toFixed(1),
      color: colors[index % colors.length]
    })).sort((a, b) => b.count - a.count);
  };

  // Generate pie chart paths dynamically
  const generatePieChartPaths = (data) => {
    const paths = [];
    let currentAngle = 0;
    
    data.forEach((item, index) => {
      const percentage = parseFloat(item.percentage);
      const angle = (percentage / 100) * 360;
      
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;
      
      const x1 = 100 + 100 * Math.sin((startAngle * Math.PI) / 180);
      const y1 = 100 - 100 * Math.cos((startAngle * Math.PI) / 180);
      const x2 = 100 + 100 * Math.sin((endAngle * Math.PI) / 180);
      const y2 = 100 - 100 * Math.cos((endAngle * Math.PI) / 180);
      
      const largeArcFlag = angle > 180 ? 1 : 0;
      
      const path = `M 100 100 L ${x1} ${y1} A 100 100 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
      
      paths.push({
        path,
        color: item.color,
        name: item.name,
        percentage: item.percentage,
        count: item.count
      });
      
      currentAngle = endAngle;
    });
    
    return paths;
  };

  // Process deal stage data for donut chart
  const getProcessedDealStageData = () => {
    if (!dealStageData || dealStageData.length === 0) {
      return [];
    }
    
    const total = dealStageData.reduce((sum, item) => sum + item.count, 0);
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
    
    return dealStageData.map((item, index) => ({
      name: item.stage,
      count: item.count,
      percentage: item.percentage || ((item.count / total) * 100).toFixed(1),
      color: colors[index % colors.length]
    }));
  };




  // Generate donut chart paths dynamically
  const generateDonutChartPaths = (data) => {
    const paths = [];
    let currentAngle = 0;
    
    data.forEach((item, index) => {
      const percentage = parseFloat(item.percentage);
      const angle = (percentage / 100) * 360;
      
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;
      
      // Handle 100% case - use a circle element instead of path
      if (percentage >= 99.9) {
        paths.push({
          type: 'circle',
          cx: 100,
          cy: 100,
          r: 90,
          color: item.color,
          name: item.name,
          percentage: item.percentage,
          count: item.count
        });
        return;
      }
      
      const x1 = 100 + 100 * Math.sin((startAngle * Math.PI) / 180);
      const y1 = 100 - 100 * Math.cos((startAngle * Math.PI) / 180);
      const x2 = 100 + 100 * Math.sin((endAngle * Math.PI) / 180);
      const y2 = 100 - 100 * Math.cos((endAngle * Math.PI) / 180);
      
      const largeArcFlag = angle > 180 ? 1 : 0;
      
      const path = `M 100 100 L ${x1} ${y1} A 100 100 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
      
      paths.push({
        type: 'path',
        path,
        color: item.color,
        name: item.name,
        percentage: item.percentage,
        count: item.count
      });
      
      currentAngle = endAngle;
    });
    
    return paths;
  };

  return (
    <div className="main-full" style={{ background: "#f8fafc" }}>
      {/* Header */}
      <div className="topbar">
        <div className="tb-left">
          <div className="tb-page">Marketing Dashboard</div>
        </div>
        <div className="tb-right">
          <div className="badge badge-green">Overview</div>
        </div>
      </div>

      <div className="content-area">
        <div className="sa-container">
          {/* Welcome Section */}
          <div className="sa-welcome" style={{ marginBottom: '16px' }}>
            <div>
              <h1 className="sa-welcome-title">
                Welcome back,
                <span className="sa-company-name"> {displayName}</span>
              </h1>
              <p className="sa-welcome-subtitle">
                Track your marketing performance and campaign metrics.
              </p>
            </div>
          </div>

          {/* Filter Section */}
          <div className="sa-toolbar" style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
              {/* Month Filter */}
<div style={{ display: 'flex', gap: '12px', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
    {/* Filter Icon Button - now on the left */}
    <button
      onClick={() => setFilterSidebarOpen(true)}
      style={{
        padding: '8px 12px',
        backgroundColor: hasActiveFilters ? '#27500a' : '#f3f4f6',
        color: hasActiveFilters ? '#ffffff' : 'rgba(35, 105, 2, 0.51)',
        border: '1px solid #e5e7eb',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        flexShrink: 0
      }}
    >
      <Filter size={16} />
    </button>

    <div className="month-tabs">
      {availableMonths.map((month) => (
        <div
          key={month}
          className={`month-chip ${selectedMonth === month && !isLast6Months ? 'active' : ''}`}
          onClick={() => {
            setSelectedMonth(month);
            setIsLast6Months(false);
            setIsCustom(false);
            setMonthLoading(true);
          }}
          style={{
            opacity: monthLoading && selectedMonth === month && !isLast6Months ? 0.6 : 1,
            cursor: monthLoading && selectedMonth === month && !isLast6Months ? 'not-allowed' : 'pointer'
          }}
        >
          {monthLoading && selectedMonth === month && !isLast6Months ? 'Loading...' : month}
        </div>
      ))}
    </div>
  </div>

  {/* Export CSV and Download 6 Month Data Buttons */}
  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
    <button
      onClick={handleDownloadDeals}
      disabled={downloading}
      style={{
        padding: '8px 16px',
        backgroundColor: '#f3f4f6',
        color: '#374151',
        border: '1px solid #e5e7eb',
        borderRadius: '6px',
        cursor: downloading ? 'not-allowed' : 'pointer',
        fontSize: '14px',
        fontWeight: '500',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        opacity: downloading ? 0.7 : 1,
        whiteSpace: 'nowrap',
        flexShrink: 0
      }}
    >
      {downloading ? 'Exporting...' : 'Export CSV'}
    </button>

    <button
      onClick={handleDownloadDealsLast6Months}
      disabled={downloading}
      style={{
        padding: '8px 16px',
        backgroundColor: '#f3f4f6',
        color: '#374151',
        border: '1px solid #e5e7eb',
        borderRadius: '6px',
        cursor: downloading ? 'not-allowed' : 'pointer',
        fontSize: '14px',
        fontWeight: '500',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        opacity: downloading ? 0.7 : 1,
        whiteSpace: 'nowrap',
        flexShrink: 0
      }}
    >
      <BarChart3 size={16} />
      {downloading ? 'Downloading...' : 'Download 6 Month Data'}
    </button>
  </div>
</div>

              {/* Last 6 Months Button */}
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div
                  className={`month-chip ${isLast6Months ? 'active' : ''}`}
                  onClick={() => {
                    setIsLast6Months(true);
                    setIsCustom(false);
                    setMonthLoading(true);
                  }}
                  style={{
                    padding: '4px 14px',
                    borderRadius: '15px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    backgroundColor: isLast6Months ? '#27500a' : '#f3f4f6',
                    color: isLast6Months ? '#ffffff' : '#374151',
                    border: '1px solid #e5e7eb',
                    opacity: monthLoading && isLast6Months ? 0.6 : 1
                  }}
                >
                  {monthLoading && isLast6Months ? 'Loading...' : 'Last 6 Months'}
                </div>
              </div>

              {/* Custom Date Pickers */}
              {isCustom && (
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '8px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '500', marginBottom: '4px', display: 'block' }}>From:</label>
                    <input
                      type="date"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      style={{
                        padding: '6px 10px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '500', marginBottom: '4px', display: 'block' }}>To:</label>
                    <input
                      type="date"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      style={{
                        padding: '6px 10px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                  <button
                    onClick={() => {
                      if (fromDate && toDate) {
                        setMonthLoading(true);
                      }
                    }}
                    disabled={!fromDate || !toDate}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: fromDate && toDate ? '#27500a' : '#9ca3af',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: fromDate && toDate ? 'pointer' : 'not-allowed',
                      fontSize: '14px',
                      fontWeight: '500',
                      marginTop: '18px'
                    }}
                  >
                    Apply
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Filter Sidebar */}
          {filterSidebarOpen && (
            <div style={{
              position: 'fixed',
              top: 0,
              right: 0,
              width: '320px',
              height: '100vh',
              backgroundColor: '#ffffff',
              boxShadow: '-4px 0 20px rgba(0, 0, 0, 0.15)',
              zIndex: 1000,
              display: 'flex',
              flexDirection: 'column'
            }}>
              {/* Sidebar Header */}
              <div style={{
                padding: '20px',
                borderBottom: '1px solid #e5e7eb',
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
                  Filters
                </h3>
                <button
                  onClick={() => setFilterSidebarOpen(false)}
                  style={{
                    padding: '8px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <X size={20} style={{ color: '#6b7280' }} />
                </button>
              </div>
              {filterOptionsLoading && (
  <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '12px' }}>
    Refreshing filter options...
  </div>
)}


              {/* Sidebar Content */}
              <div style={{
                flex: 1,
                padding: '20px',
                overflowY: 'auto'
              }}>
                {/* Month and Year Filters - Side by Side */}
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    {/* Month Filter */}
                    <div style={{ flex: 1 }}>
                      <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#374151',
                        marginBottom: '8px'
                      }}>
                        <Calendar size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
                        Month
                      </label>

                      <select
                        value={pendingIsCustom ? 'custom' : pendingSelectedMonth}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === 'custom') {
                            setPendingIsCustom(true);
                            setPendingIsLast6Months(false);
                          } else {
                            setPendingSelectedMonth(val);
                            setPendingIsCustom(false);
                            setPendingIsLast6Months(false);
                          }
                        }}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px',
                          color: '#374151',
                          backgroundColor: '#ffffff'
                        }}
                      >
                        {availableMonths.map((month) => (
                          <option key={month} value={month}>{month.split(' ')[0]}</option>
                        ))}
                        <option value="custom">Custom</option>
                      </select>
                    </div>

                    {/* Year Filter */}
                    <div style={{ flex: 1 }}>
                      <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#374151',
                        marginBottom: '8px'
                      }}>
                        <Calendar size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
                        Year
                      </label>

                      <select
                        value={pendingSelectedYear}
                        onChange={(e) => setPendingSelectedYear(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px',
                          color: '#374151',
                          backgroundColor: '#ffffff'
                        }}
                      >
                        <option value="all">All Years</option>
                        {uniqueYears.map((year) => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {pendingIsCustom && (
                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', display: 'block' }}>From</label>
                        <input
                          type="date"
                          value={pendingFromDate}
                          onChange={(e) => setPendingFromDate(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '8px 10px',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '13px',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', display: 'block' }}>To</label>
                        <input
                          type="date"
                          value={pendingToDate}
                          onChange={(e) => setPendingToDate(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '8px 10px',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '13px',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Contact Owner Filter */}
                <div style={{ marginBottom: '24px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    <Users size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
                    Contact Owner
                  </label>
                  <select
                    value={pendingContactOwner}
                    onChange={(e) => setPendingContactOwner(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      color: '#374151',
                      backgroundColor: '#ffffff'
                    }}
                  >
                    <option value="all">All Owners</option>
                    {uniqueContactOwners.map((owner, index) => (
                      <option key={index} value={owner}>{owner}</option>
                    ))}
                  </select>
                </div>

                {/* Lead Source Filter */}
                <div style={{ marginBottom: '24px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    <Target size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
                    Lead Source
                  </label>
                  <select
                    value={pendingLeadSource}
                    onChange={(e) => setPendingLeadSource(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      color: '#374151',
                      backgroundColor: '#ffffff'
                    }}
                  >
                    <option value="all">All Sources</option>
                    {uniqueLeadSources.map((source, index) => (
                      <option key={index} value={source}>{source}</option>
                    ))}
                  </select>
                </div>

                {/* Region Filter */}
<div style={{ marginBottom: '24px', position: 'relative' }}>
  <label style={{
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '8px'
  }}>
    <BarChart3 size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
    Region
  </label>

  <select
    value={pendingRegionOperator}
    onChange={(e) => setPendingRegionOperator(e.target.value)}
    style={{
      width: '100%',
      padding: '10px 12px',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      fontSize: '14px',
      color: '#374151',
      backgroundColor: '#ffffff',
      marginBottom: '8px'
    }}
  >
    <option value="contains">Contains</option>
    <option value="is">Is</option>
    <option value="is_not">Is Not</option>
  </select>

  {/* Search input - opens dropdown on click/focus */}
  <input
    type="text"
    placeholder="Search regions..."
    value={regionSearchTerm}
    onFocus={() => setRegionDropdownOpen(true)}
    onChange={(e) => {
      setRegionSearchTerm(e.target.value);
      setRegionDropdownOpen(true);
    }}
    style={{
      width: '100%',
      padding: '10px 12px',
      border: regionDropdownOpen ? '1px solid #86efac' : '1px solid #d1d5db',
      borderRadius: '6px',
      fontSize: '14px',
      color: '#374151',
      backgroundColor: '#ffffff',
      boxSizing: 'border-box',
      outline: 'none'
    }}
  />

  {/* Dropdown - only shows when open (click/focus), not tied to typing */}
  {regionDropdownOpen && (
    <div style={{
      position: 'absolute',
      top: '100%',
      left: 0,
      right: 0,
      marginTop: '4px',
      maxHeight: '180px',
      overflowY: 'auto',
      backgroundColor: '#ffffff',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
      zIndex: 1001
    }}>
      {getFilteredRegions().length === 0 && regionSearchTerm ? (
        <div
          onClick={handleAddCustomRegion}
          style={{
            padding: '10px 12px',
            fontSize: '13px',
            color: '#3B6D11',
            cursor: 'pointer',
            backgroundColor: '#f0fdf4',
            borderBottom: '1px solid #f3f4f6'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#dcfce7'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f0fdf4'}
        >
          Add "{regionSearchTerm}" as custom region
        </div>
      ) : (
        <>
          {getFilteredRegions().map((r, index) => (
            <div
              key={index}
              onClick={() => {
                if (!pendingRegion.includes(r)) {
                  setPendingRegion([...pendingRegion, r]);
                }
                setRegionSearchTerm('');
                setRegionDropdownOpen(false);
              }}
              style={{
                padding: '10px 12px',
                fontSize: '13px',
                color: '#374151',
                cursor: 'pointer',
                backgroundColor: pendingRegion.includes(r) ? '#f0fdf4' : '#ffffff',
                borderBottom: '1px solid #f3f4f6'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = pendingRegion.includes(r) ? '#f0fdf4' : '#ffffff'}
            >
              {r} {pendingRegion.includes(r) && '✓'}
            </div>
          ))}
          {regionSearchTerm && !getFilteredRegions().includes(regionSearchTerm) && (
            <div
              onClick={handleAddCustomRegion}
              style={{
                padding: '10px 12px',
                fontSize: '13px',
                color: '#3B6D11',
                cursor: 'pointer',
                backgroundColor: '#f0fdf4',
                borderBottom: '1px solid #f3f4f6'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#dcfce7'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f0fdf4'}
            >
              Add "{regionSearchTerm}" as custom region
            </div>
          )}
        </>
      )}
    </div>
  )}

  {/* Selected regions as removable chips */}
  {pendingRegion.length > 0 && (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
      {pendingRegion.map((r, index) => (
        <div
          key={index}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 8px',
            backgroundColor: '#27500a',
            color: '#ffffff',
            borderRadius: '12px',
            fontSize: '12px'
          }}
        >
          {r}
          <X
            size={12}
            style={{ cursor: 'pointer' }}
            onClick={() => setPendingRegion(pendingRegion.filter((item) => item !== r))}
          />
        </div>
      ))}
    </div>
  )}
</div>

                {/* Status Filter */}
                <div style={{ marginBottom: '24px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    <TrendingUp size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
                    Deal Status
                  </label>
                  <select
                    value={pendingStatus}
                    onChange={(e) => setPendingStatus(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      color: '#374151',
                      backgroundColor: '#ffffff'
                    }}
                  >
                    <option value="all">All Status</option>
                    {uniqueStatuses.map((statusItem, index) => (
                      <option key={index} value={statusItem}>{statusItem}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Sidebar Footer */}
              <div style={{
                padding: '20px',
                borderTop: '1px solid #e5e7eb',
                display: 'flex',
                gap: '12px'
              }}>
                <button
                  onClick={applyFilters}
                  style={{
                    flex: 1,
                    padding: '12px',
                    backgroundColor: '#27500a',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  Apply Filters
                </button>
                <button
                  onClick={clearFilters}
                  style={{
                    flex: 1,
                    padding: '12px',
                    backgroundColor: '#ef4444',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  Clear All
                </button>
               
              </div>
            </div>
          )}

          {/* Overlay */}
          {filterSidebarOpen && (
            <div
              onClick={() => setFilterSidebarOpen(false)}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                zIndex: 999
              }}
            />
          )}

          {/* Loading State */}
          {loading && (
            <div className="sa-empty">
              Loading marketing data...
            </div> 
          )}

          {/* Metrics Grid */}
          {!loading && (
            <>
              <div className="metrics">
                {/* Total Leads */}
                <div className="metric metric-accent" onClick={() => handleMetricClick('Total Leads', metrics.totalLeads)}>
                  <div className="metric-label">Total Leads</div>
                  <div className="metric-val">{formatNumber(metrics.totalLeads)}</div>
                  <div className="metric-sub">
                    <span className={`metric-up ${metrics.leadsGrowth >= 0 ? 'metric-up' : 'metric-down'}`}>
                      {metrics.leadsGrowth >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                      {Math.abs(metrics.leadsGrowth)}%
                    </span>
                    <span style={{ marginLeft: '4px', color: '#888780' }}>vs last month</span>
                  </div>
                </div>

                {/* Converted Accounts */}
                <div className="metric metric-accent" onClick={() => handleMetricClick('Converted Accounts', metrics.convertedLeads)}>
                  <div className="metric-label">Converted Accounts</div>
                  <div className="metric-val">{formatNumber(metrics.convertedLeads)}</div>
                  <div className="metric-sub">
                    <span className="metric-up">
                      <ArrowUpRight size={12} />
                      8.7%
                    </span>
                    <span style={{ marginLeft: '4px', color: '#888780' }}>vs last month</span>
                  </div>
                </div>

                {/* Accounts with Deal */}
                <div className="metric metric-accent" onClick={() => handleMetricClick('Accounts with Deal', metrics.accountsWithDeal)}>
                  <div className="metric-label">Accounts with Deal</div>
                  <div className="metric-val">{formatNumber(metrics.accountsWithDeal)}</div>
                  <div className="metric-sub">
                    <span className="metric-up">
                      <Users size={12} />
                    </span>
                    <span style={{ marginLeft: '4px', color: '#888780' }}>Active deals</span>
                  </div>
                </div>

                {/* Conversion Rate */}
                <div className="metric metric-accent" onClick={() => handleMetricClick('Conversion Rate', metrics.conversionRate)}>
                  <div className="metric-label">Conversion Rate</div>
                  <div className="metric-val">{metrics.conversionRate}%</div>
                  <div className="metric-sub">
                    <span className="metric-up">
                      <ArrowUpRight size={12} />
                      2.3%
                    </span>
                    <span style={{ marginLeft: '4px', color: '#888780' }}>vs last month</span>
                  </div>
                </div>

                {/* Total Revenue */}
                <div className="metric metric-accent" onClick={() => handleMetricClick('Total Revenue', metrics.totalRevenue)}>
                  <div className="metric-label">Total Revenue</div>
                  <div className="metric-val">{formatCurrency(metrics.totalRevenue)}</div>
                  <div className="metric-sub">
                    <span className={`metric-up ${metrics.revenueGrowth >= 0 ? 'metric-up' : 'metric-down'}`}>
                      {metrics.revenueGrowth >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                      {Math.abs(metrics.revenueGrowth)}%
                    </span>
                    <span style={{ marginLeft: '4px', color: '#888780' }}>vs last month</span>
                  </div>
                </div>
              </div>

              {/* Quick Stats Section */}
              <div className="two-col" style={{ marginBottom: '24px' }}>
                {/* Leads by Source */}
                <div className="card">
                  <div className="card-head">
                    <div className="card-title">Leads by Source</div>
                    <Target size={18} style={{ color: '#3B6D11' }} />
                  </div>
                  <div className="card-body" style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                      {/* Pie Chart */}
                      <div style={{ position: 'relative', width: '140px', height: '140px', flexShrink: 0 }}>
                        <svg width="140" height="140" viewBox="0 0 200 200">
                          {generatePieChartPaths(getProcessedLeadSourceData()).map((item, index) => (
                            <path
                              key={index}
                              d={item.path}
                              fill={item.color}
                              stroke="#ffffff"
                              strokeWidth="2"
                            />
                          ))}
                        </svg>
                      </div>
                      
                      {/* Legend */}
                      <div style={{ width: '100%' }}>
                        {getProcessedLeadSourceData().map((item, index) => (
                          <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: item.color }}></div>
                            <span style={{ fontSize: '12px', color: '#1a1c17', fontWeight: '500' }}>{item.name}</span>
                            <span style={{ fontSize: '12px', color: '#5F5E5A', marginLeft: 'auto', fontWeight: '600' }}>{item.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Lead Status */}
                <div className="card">
                  <div className="card-head">
                    <div className="card-title">Lead By Status</div>
                    <TrendingUp size={18} style={{ color: '#3B6D11' }} />
                  </div>
                  <div className="card-body" style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                      {/* Donut Chart */}
                      <div style={{ position: 'relative', width: '140px', height: '140px', flexShrink: 0 }}>
                        <svg width="140" height="140" viewBox="0 0 200 200">
                          {generateDonutChartPaths(getProcessedDealStageData()).map((item, index) => (
                            item.type === 'circle' ? (
                              <circle
                                key={index}
                                cx={item.cx}
                                cy={item.cy}
                                r={item.r}
                                fill={item.color}
                                stroke="#ffffff"
                                strokeWidth="2"
                              />
                            ) : (
                              <path
                                key={index}
                                d={item.path}
                                fill={item.color}
                                stroke="#ffffff"
                                strokeWidth="2"
                              />
                            )
                          ))}
                        </svg>
                      </div>
                      
                      {/* Legend */}
                      <div style={{ width: '100%' }}>
                        {getProcessedDealStageData().map((item, index) => (
                          <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: item.color }}></div>
                            <span style={{ fontSize: '12px', color: '#1a1c17', fontWeight: '500' }}>{item.name}</span>
                            <span style={{ fontSize: '12px', color: '#5F5E5A', marginLeft: 'auto', fontWeight: '600' }}>{item.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Monthly Conversion Trend */}
              <div className="card">
                <div className="card-head">
                  <div className="card-title">Monthly Conversion Trend</div>
                  <TrendingUp size={18} style={{ color: '#3B6D11' }} />
                </div>
                <div className="card-body" style={{ padding: '24px' }}>
                  <div style={{ marginBottom: '16px', fontSize: '14px', color: '#5F5E5A', fontWeight: '500' }}>
                    Lead volume vs. conversions over time
                  </div>
                  <ReactECharts
                    option={{
                      tooltip: {
                        trigger: 'axis',
                        formatter: function(params) {
                          let result = params[0].name + '<br/>';
                          params.forEach(param => {
                            result += `${param.marker} ${param.seriesName}: ${param.value}<br/>`;
                          });
                          return result;
                        }
                      },
                      grid: {
                        left: 60,
                        right: 40,
                        top: 20,
                        bottom: 60,
                        containLabel: true
                      },
                      xAxis: {
                        type: 'category',
                        data: monthlyTrendData.map(item => item.month),
                        axisLine: {
                          lineStyle: {
                            color: '#e5e7eb'
                          }
                        },
                        axisLabel: {
                          color: '#6b7280',
                          fontSize: 13,
                          fontWeight: 500
                        }
                      },
                      yAxis: {
                        type: 'value',
                        axisLine: {
                          lineStyle: {
                            color: '#e5e7eb'
                          }
                        },
                        axisLabel: {
                          color: '#6b7280',
                          fontSize: 13,
                          fontWeight: 500
                        },
                        splitLine: {
                          lineStyle: {
                            color: '#e5e7eb'
                          }
                        }
                      },
                      series: [
                        {
                          name: 'Leads',
                          type: 'line',
                          data: monthlyTrendData.map(item => item.leads),
                          smooth: true,
                          lineStyle: {
                            width: 4,
                            color: '#8B5CF6'
                          },
                          itemStyle: {
                            color: '#8B5CF6',
                            borderColor: '#ffffff',
                            borderWidth: 2
                          },
                          areaStyle: {
                            color: {
                              type: 'linear',
                              x: 0,
                              y: 0,
                              x2: 0,
                              y2: 1,
                              colorStops: [
                                { offset: 0, color: 'rgba(139, 92, 246, 0.3)' },
                                { offset: 1, color: 'rgba(139, 92, 246, 0)' }
                              ]
                            }
                          }
                        },
                        {
                          name: 'Converted',
                          type: 'line',
                          data: monthlyTrendData.map(item => item.converted),
                          smooth: true,
                          lineStyle: {
                            width: 4,
                            color: '#10B981'
                          },
                          itemStyle: {
                            color: '#10B981',
                            borderColor: '#ffffff',
                            borderWidth: 2
                          },
                          areaStyle: {
                            color: {
                              type: 'linear',
                              x: 0,
                              y: 0,
                              x2: 0,
                              y2: 1,
                              colorStops: [
                                { offset: 0, color: 'rgba(16, 185, 129, 0.3)' },
                                { offset: 1, color: 'rgba(16, 185, 129, 0)' }
                              ]
                            }
                          }
                        }
                      ],
                      legend: {
                        data: ['Leads', 'Converted'],
                        bottom: 10,
                        textStyle: {
                          fontSize: 14,
                          fontWeight: 500,
                          color: '#1a1c17'
                        }
                      },
                      tooltip: {
                        trigger: 'axis',
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        borderColor: '#e5e7eb',
                        borderWidth: 1,
                        textStyle: {
                          color: '#1a1c17',
                          fontSize: 13
                        }
                      }
                    }}
                    style={{ height: '350px', width: '100%' }}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
