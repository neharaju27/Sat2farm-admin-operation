import { useState, useEffect, useRef } from "react";
import {
  Users, Target, DollarSign, FileText, IndianRupee,
  RefreshCw, X, Search, ChevronDown, BarChart3, ArrowUpRight, Edit
} from "lucide-react";
import axios from "axios";
import toast from 'react-hot-toast';
import "../styles/Sat2FarmAdminPortal.css";

// Function to extract month labels from API response format
const extractMonthLabels = (availableMonths) => {
  if (!Array.isArray(availableMonths) || availableMonths.length === 0) return [];
  
  // Extract labels from the API response format
  return availableMonths.map(month => month.label);
};

// ---- Design tokens -------------------------------------------------------
const palette = {
  canvas: '#F5F7F1',
  surface: '#FFFFFF',
  border: '#E2E7DD',
  ink: '#16241C',
  inkSoft: '#5B6B5E',
  inkFaint: '#8B9A8E',
  pine: '#2F5233',
  pineDeep: '#16241C',
  amber: '#C98A2C',
  amberDeep: '#A56A1D',
  growth: '#3D8361',
  slate: '#3E6D9C',
  rust: '#B5432B',
  teal: '#14B8A6',
};

export default function ProspectStatsCards({ user }) {

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [availableMonths, setAvailableMonths] = useState([]);
  const isInitialLoad = useRef(true);
  const [selectedOwner, setSelectedOwner] = useState('all');
  const [ownerOptions, setOwnerOptions] = useState([]);
  const [showOwnerDropdown, setShowOwnerDropdown] = useState(false);
  const ownerDropdownRef = useRef(null);
  const [metrics, setMetrics] = useState({
    totalProspects: 0,
    totalDeals: 0,
    invoicedAmount: 0,
    paidAmount: 0,
    totalDealAmount: 0,
    expectedRevenue: 0,
    closedLostAmount: 0,
    pendingAmount: 0,
    totalPaidAmount: 0,
    overdueDeals: 0,
    overdueAmount: 0
  });
  const [showOwnerSummaryTable, setShowOwnerSummaryTable] = useState(false);
  const [ownerSummaryData, setOwnerSummaryData] = useState(null);
  const [ownerSummaryLoading, setOwnerSummaryLoading] = useState(false);
  const [ownerSummarySearchTerm, setOwnerSummarySearchTerm] = useState('');
  const [showProspectDetails, setShowProspectDetails] = useState(false);
  const [prospectDetailsData, setProspectDetailsData] = useState(null);
  const [prospectDetailsLoading, setProspectDetailsLoading] = useState(false);
  const [prospectDetailsSearchTerm, setProspectDetailsSearchTerm] = useState('');
  const [showDealDetails, setShowDealDetails] = useState(false);
  const [dealDetailsData, setDealDetailsData] = useState(null);
  const [dealDetailsLoading, setDealDetailsLoading] = useState(false);
  const [dealDetailsSearchTerm, setDealDetailsSearchTerm] = useState('');
  const [showInvoicedDetails, setShowInvoicedDetails] = useState(false);
  const [invoicedDetailsData, setInvoicedDetailsData] = useState(null);
  const [invoicedDetailsLoading, setInvoicedDetailsLoading] = useState(false);
  const [invoicedDetailsSearchTerm, setInvoicedDetailsSearchTerm] = useState('');
  const [showPaymentReceivedDetails, setShowPaymentReceivedDetails] = useState(false);
  const [paymentReceivedDetailsData, setPaymentReceivedDetailsData] = useState(null);
  const [paymentReceivedDetailsLoading, setPaymentReceivedDetailsLoading] = useState(false);
  const [paymentReceivedDetailsSearchTerm, setPaymentReceivedDetailsSearchTerm] = useState('');
  const [showTotalPaidDetails, setShowTotalPaidDetails] = useState(false);
  const [totalPaidDetailsData, setTotalPaidDetailsData] = useState(null);
  const [totalPaidDetailsLoading, setTotalPaidDetailsLoading] = useState(false);
  const [totalPaidDetailsSearchTerm, setTotalPaidDetailsSearchTerm] = useState('');
  const [showOverdueDetails, setShowOverdueDetails] = useState(false);
  const [overdueDetailsData, setOverdueDetailsData] = useState(null);
  const [overdueDetailsLoading, setOverdueDetailsLoading] = useState(false);
  const [overdueDetailsSearchTerm, setOverdueDetailsSearchTerm] = useState('');
  const [overdueSortOrder, setOverdueSortOrder] = useState('latest');
  const [showTotalDealAmountDetails, setShowTotalDealAmountDetails] = useState(false);
  const [totalDealAmountDetailsData, setTotalDealAmountDetailsData] = useState(null);
  const [totalDealAmountDetailsLoading, setTotalDealAmountDetailsLoading] = useState(false);
  const [totalDealAmountDetailsSearchTerm, setTotalDealAmountDetailsSearchTerm] = useState('');
  const [showExpectedRevenueDetails, setShowExpectedRevenueDetails] = useState(false);
  const [expectedRevenueDetailsData, setExpectedRevenueDetailsData] = useState(null);
  const [expectedRevenueDetailsLoading, setExpectedRevenueDetailsLoading] = useState(false);
  const [expectedRevenueDetailsSearchTerm, setExpectedRevenueDetailsSearchTerm] = useState('');
  const [totalExpectedRevenue, setTotalExpectedRevenue] = useState(0);
  const [closingDateHistory, setClosingDateHistory] = useState(null);
  const [showClosingDateHistory, setShowClosingDateHistory] = useState(false);
  const [closingDateHistoryLoading, setClosingDateHistoryLoading] = useState(false);
  const [closingDateHistoryDealName, setClosingDateHistoryDealName] = useState('');
  const [currentDealHistory, setCurrentDealHistory] = useState(null);
  const [leadsWithHistory, setLeadsWithHistory] = useState(new Set());
  const [leadIdToDealIdMap, setLeadIdToDealIdMap] = useState(new Map());
  const [showClosingDateEditModal, setShowClosingDateEditModal] = useState(false);
  const [editingClosingDateDeal, setEditingClosingDateDeal] = useState(null);
  const [newClosingDate, setNewClosingDate] = useState('');
  const [isUpdatingClosingDate, setIsUpdatingClosingDate] = useState(false);

  // Validate user prop
  if (!user) {
    console.error('ProspectStatsCards: user prop is missing');
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: palette.canvas,
        color: palette.ink
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
        <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '8px' }}>Error</h2>
        <p style={{ fontSize: '14px', color: palette.inkSoft }}>
          User information not available. Please try logging in again.
        </p>
      </div>
    );
  }

  // Role-based access control - only operation role can access this page
  const userRole = user?.role?.toLowerCase() || user?.userType?.toLowerCase() || '';
  if (userRole !== 'operation') {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: palette.canvas,
        color: palette.ink
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔒</div>
        <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '8px' }}>Access Denied</h2>
        <p style={{ fontSize: '14px', color: palette.inkSoft }}>
          This page is only accessible to users with Operation role.
        </p>
      </div>
    );
  }



  const displayName = user?.name || user?.fullName || user?.first_name || "Operation User";

  const formatNumber = (num) => {
    if (num === null || num === undefined || isNaN(num)) return '0';
    return Number(num).toLocaleString();
  };

  const formatCurrency = (num) => {
    if (num === null || num === undefined || isNaN(num)) return '₹0';
    const numValue = Number(num);
    if (numValue >= 100000) {
      const lakhs = (numValue / 100000).toFixed(1);
      return `₹${lakhs} L`;
    }
    return '₹' + numValue.toLocaleString('en-IN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  };

  const formatTimeAgo = (date) => {
    if (!date) return 'Not synced yet';
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 10) return 'Synced just now';
    if (seconds < 60) return `Synced ${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `Synced ${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `Synced ${hours}h ago`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      
      const day = date.getDate();
      const month = date.toLocaleString('default', { month: 'short' });
      const year = date.getFullYear();
      
      return `${day} ${month} ${year}`;
    } catch (error) {
      return dateString;
    }
  };

  const handleMonthSelect = (month) => {
    setSelectedMonth(month);
  };

  // Function to close all detail tables
  const closeAllTables = () => {
    setShowOwnerSummaryTable(false);
    setShowProspectDetails(false);
    setShowDealDetails(false);
    setShowInvoicedDetails(false);
    setShowPaymentReceivedDetails(false);
    setShowTotalPaidDetails(false);
    setShowOverdueDetails(false);
    setShowTotalDealAmountDetails(false);
    setShowExpectedRevenueDetails(false);
  };

  // Function to sort overdue details
  const sortOverdueDetails = (data) => {
    if (!data || data.length === 0) return data;
    
    const sortedData = [...data].sort((a, b) => {
      const dateA = new Date(a.closing_date || a.stage_created_time || '1970-01-01');
      const dateB = new Date(b.closing_date || b.stage_created_time || '1970-01-01');
      
      if (overdueSortOrder === 'latest') {
        return dateB - dateA; // Latest first
      } else {
        return dateA - dateB; // Oldest first
      }
    });
    
    return sortedData;
  };

  // Function to get closing date history for a specific lead
  const getLeadClosingDateHistory = (leadId) => {
    if (!closingDateHistory || !leadId) return [];
    return closingDateHistory.filter(item => String(item.lead_id) === String(leadId));
  };

  // Function to handle closing date click
  const handleClosingDateClick = (deal, dealName) => {
    const lookupId = getHistoryLookupId(deal);
    const history = getLeadClosingDateHistory(lookupId);
    if (history.length > 0) {
      setCurrentDealHistory(history); // Set the filtered history for this specific lead
      setClosingDateHistoryDealName(dealName || deal.deal_name || 'Unknown Deal');
      setShowClosingDateHistory(true);
    }
  };

  // Function to check if a lead has closing date history
  const hasClosingDateHistory = (leadId, accountId) => {
    if (!leadId && !accountId) return false;
    // Check lead_id first, then fall back to account_id
    if (leadId && leadsWithHistory.has(String(leadId))) return true;
    if (accountId && leadsWithHistory.has(String(accountId))) return true;
    return false;
  };

  // Function to get the appropriate ID for history lookup
  const getHistoryLookupId = (deal) => {
    return deal.lead_id || deal.account_id || deal.deal_id;
  };

  // Convert month label (e.g., "Sep 26") to API format (e.g., "2026-09")
  const convertMonthToApiFormat = (monthLabel) => {
    if (!monthLabel) return '2026-09';
    
    const monthMap = {
      'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04', 
      'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08', 
      'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
    };
    
    const parts = monthLabel.split(' ');
    if (parts.length !== 2) return '2026-09';
    
    const [monthName, year] = parts;
    const monthNum = monthMap[monthName] || '09';
    const fullYear = '20' + year;
    
    return `${fullYear}-${monthNum}`;
  };

  const fetchDropdownOptions = async () => {
    try {
      const dropdownOptionsUrl = import.meta.env.VITE_DROPDOWN_OPTIONS_API_URL;
      if (!dropdownOptionsUrl) {
        console.warn('VITE_DROPDOWN_OPTIONS_API_URL not defined');
        return;
      }
      const response = await axios.get(`${dropdownOptionsUrl}?category=contact_owner`);
      
      if (response.data && response.data.status === true) {
        const owners = response.data.data || [];
        setOwnerOptions(owners);
      }
    } catch (error) {
      console.error('Error fetching dropdown options:', error);
    }
  };

  // ============================================================
  // FETCH PROSPECT DATA
  // ============================================================
  const fetchProspectData = async (month = selectedMonth, options = {}) => {
    const {
      owner: ownerOverride,
      forceRefresh = false
    } = options;

    try {
      setLoading(true);

      const apiMonth = convertMonthToApiFormat(month);
      const prospectStatsUrl = import.meta.env.VITE_PROSPECT_STATS_API_URL;

      if (!prospectStatsUrl) {
        console.error('VITE_PROSPECT_STATS_API_URL not defined');
        toast.error('API configuration error');
        return;
      }

      const ownerToUse = ownerOverride !== undefined ? ownerOverride : selectedOwner;

      let apiUrl = `${prospectStatsUrl}?month=${encodeURIComponent(apiMonth)}`;

      if (ownerToUse && ownerToUse !== 'all') {
        apiUrl += `&owner=${encodeURIComponent(String(ownerToUse).toLowerCase())}`;
      }

      // Prevent browser/proxy caching when the user explicitly refreshes.
      if (forceRefresh) {
        apiUrl += `&refresh=${Date.now()}`;
      }

      console.log('FETCH PROSPECT DATA:', {
        apiUrl,
        month,
        ownerToUse,
        forceRefresh
      });

      const response = await axios.get(apiUrl, {
        headers: {
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache'
        }
      });

      console.log('PROSPECT RESPONSE:', {
        status: response.status,
        dataStatus: response.data?.status
      });

      if (response.data && response.data.status === 'success') {
        const data = response.data.data;

        // Update available months from API response.
        if (data.filters && data.filters.available_months) {
          const monthLabels = extractMonthLabels(data.filters.available_months);
          // Reverse order so first month comes at the end
          const reversedMonthLabels = [...monthLabels].reverse();
          setAvailableMonths(reversedMonthLabels);

          // First request only discovers the available months.
          // The second request is made by the selectedMonth effect.
          if (isInitialLoad.current && reversedMonthLabels.length > 0) {
            const lastMonth = reversedMonthLabels[reversedMonthLabels.length - 1];
            isInitialLoad.current = false;
            setSelectedMonth(lastMonth);
            return;
          }
        }

        const summary = data.summary || {};
        const totalProspects = Number(summary.total_prospects?.count) || 0;
        const totalDeals = Number(summary.total_deals?.count) || 0;
        const totalDealAmount = Number(summary.total_deal_amount?.amount) || 0;
        const paidAmount = Number(summary.payment_received_amount?.amount) || 0;
        const invoicedAmount = Number(summary.invoiced_amount?.amount) || 0;
        const closedLostAmount = 0; // Not provided in new API
        const pendingAmount = Math.max(0, invoicedAmount - paidAmount);
        const totalPaidAmount = Number(summary.total_paid_amount?.amount) || 0;
        const overdueDeals = Number(summary.overdue_deals?.count) || 0;
        const overdueAmount = Number(summary.overdue_deals?.amount) || 0;
        const expectedRevenue = Number(summary.expected_revenue?.amount) || 0;

        setMetrics({
          totalProspects,
          totalDeals,
          invoicedAmount,
          paidAmount,
          totalDealAmount,
          expectedRevenue,
          closedLostAmount,
          pendingAmount,
          totalPaidAmount,
          overdueDeals,
          overdueAmount
        });

        // Set owner summary data from the new API
        setOwnerSummaryData(data.owner_summary || []);
        setLastUpdated(new Date());
      } else {
        throw new Error('API returned unsuccessful status');
      }
    } catch (error) {
      console.error('Error fetching prospect data:', error);
      toast.error('Failed to load prospect data');
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // FETCH OWNER SUMMARY
  // ============================================================
  const fetchOwnerSummaryData = async (month = selectedMonth, options = {}) => {
    const {
      owner: ownerOverride,
      forceRefresh = false
    } = options;

    try {
      setOwnerSummaryLoading(true);

      const apiMonth = convertMonthToApiFormat(month);
      const ownerSummaryUrl = import.meta.env.VITE_OWNER_SUMMARY_API_URL;

      if (!ownerSummaryUrl) {
        console.error('VITE_OWNER_SUMMARY_API_URL not defined');
        toast.error('API configuration error');
        return;
      }

      const ownerToUse = ownerOverride !== undefined ? ownerOverride : selectedOwner;

      let apiUrl = `${ownerSummaryUrl}?month=${encodeURIComponent(apiMonth)}`;

      if (ownerToUse && ownerToUse !== 'all') {
        apiUrl += `&owner=${encodeURIComponent(String(ownerToUse).toLowerCase())}`;
      }

      // Prevent browser/proxy caching when the user explicitly refreshes.
      if (forceRefresh) {
        apiUrl += `&refresh=${Date.now()}`;
      }

      console.log('FETCH OWNER SUMMARY:', apiUrl);

      const response = await axios.get(apiUrl, {
        headers: {
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache'
        }
      });

      if (response.data && response.data.status === 'success') {
        const data = response.data.data;
        setOwnerSummaryData(data.owner_summary || []);
      } else {
        throw new Error('API returned unsuccessful status');
      }
    } catch (error) {
      console.error('Error fetching owner summary data:', error);
      toast.error('Failed to load owner summary data');
      setOwnerSummaryData([]);
    } finally {
      setOwnerSummaryLoading(false);
    }
  };

  // ============================================================
  // FETCH PROSPECT DETAILS
  // ============================================================
  const fetchProspectDetails = async (month = selectedMonth, options = {}) => {
    const {
      owner: ownerOverride,
      forceRefresh = false
    } = options;

    try {
      setProspectDetailsLoading(true);

      const apiMonth = convertMonthToApiFormat(month);
      const prospectDetailsUrl = import.meta.env.VITE_PROSPECT_DETAILS_API_URL;

      if (!prospectDetailsUrl) {
        console.error('VITE_PROSPECT_DETAILS_API_URL not defined');
        toast.error('API configuration error');
        return;
      }

      const ownerToUse = ownerOverride !== undefined ? ownerOverride : selectedOwner;

      let apiUrl = `${prospectDetailsUrl}?type=prospects&month=${encodeURIComponent(apiMonth)}`;

      if (ownerToUse && ownerToUse !== 'all') {
        apiUrl += `&owner=${encodeURIComponent(String(ownerToUse).toLowerCase())}`;
      }

      // Prevent browser/proxy caching when the user explicitly refreshes.
      if (forceRefresh) {
        apiUrl += `&refresh=${Date.now()}`;
      }

      console.log('FETCH PROSPECT DETAILS:', apiUrl);

      const response = await axios.get(apiUrl, {
        headers: {
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache'
        }
      });

      if (response.data && response.data.status === 'success') {
        setProspectDetailsData(response.data.data || []);
      } else {
        throw new Error('API returned unsuccessful status');
      }
    } catch (error) {
      console.error('Error fetching prospect details:', error);
      toast.error('Failed to load prospect details');
      setProspectDetailsData([]);
    } finally {
      setProspectDetailsLoading(false);
    }
  };

  // ============================================================
  // FETCH DEAL DETAILS
  // ============================================================
  const fetchDealDetails = async (month = selectedMonth, options = {}) => {
    const {
      owner: ownerOverride,
      forceRefresh = false
    } = options;

    try {
      setDealDetailsLoading(true);

      const apiMonth = convertMonthToApiFormat(month);
      const dealDetailsUrl = import.meta.env.VITE_PROSPECT_DETAILS_API_URL;

      if (!dealDetailsUrl) {
        console.error('VITE_PROSPECT_DETAILS_API_URL not defined');
        toast.error('API configuration error');
        return;
      }

      const ownerToUse = ownerOverride !== undefined ? ownerOverride : selectedOwner;

      let apiUrl = `${dealDetailsUrl}?type=deals&month=${encodeURIComponent(apiMonth)}`;

      if (ownerToUse && ownerToUse !== 'all') {
        apiUrl += `&owner=${encodeURIComponent(String(ownerToUse).toLowerCase())}`;
      }

      // Prevent browser/proxy caching when the user explicitly refreshes.
      if (forceRefresh) {
        apiUrl += `&refresh=${Date.now()}`;
      }

      console.log('FETCH DEAL DETAILS:', apiUrl);

      const response = await axios.get(apiUrl, {
        headers: {
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache'
        }
      });

      if (response.data && response.data.status === 'success') {
        setDealDetailsData(response.data.data || []);
      } else {
        throw new Error('API returned unsuccessful status');
      }
    } catch (error) {
      console.error('Error fetching deal details:', error);
      toast.error('Failed to load deal details');
      setDealDetailsData([]);
    } finally {
      setDealDetailsLoading(false);
    }
  };

  // ============================================================
  // FETCH INVOICED DETAILS
  // ============================================================
  const fetchInvoicedDetails = async (month = selectedMonth, options = {}) => {
    const {
      owner: ownerOverride,
      forceRefresh = false
    } = options;

    try {
      setInvoicedDetailsLoading(true);

      const apiMonth = convertMonthToApiFormat(month);
      const invoicedDetailsUrl = import.meta.env.VITE_PROSPECT_DETAILS_API_URL;

      if (!invoicedDetailsUrl) {
        console.error('VITE_PROSPECT_DETAILS_API_URL not defined');
        toast.error('API configuration error');
        return;
      }

      const ownerToUse = ownerOverride !== undefined ? ownerOverride : selectedOwner;

      let apiUrl = `${invoicedDetailsUrl}?type=invoiced&month=${encodeURIComponent(apiMonth)}`;

      if (ownerToUse && ownerToUse !== 'all') {
        apiUrl += `&owner=${encodeURIComponent(String(ownerToUse).toLowerCase())}`;
      }

      // Prevent browser/proxy caching when the user explicitly refreshes.
      if (forceRefresh) {
        apiUrl += `&refresh=${Date.now()}`;
      }

      console.log('FETCH INVOICED DETAILS:', apiUrl);

      const response = await axios.get(apiUrl, {
        headers: {
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache'
        }
      });

      if (response.data && response.data.status === 'success') {
        setInvoicedDetailsData(response.data.data || []);
      } else {
        throw new Error('API returned unsuccessful status');
      }
    } catch (error) {
      console.error('Error fetching invoiced details:', error);
      toast.error('Failed to load invoiced details');
      setInvoicedDetailsData([]);
    } finally {
      setInvoicedDetailsLoading(false);
    }
  };

  // ============================================================
  // FETCH PAYMENT RECEIVED DETAILS
  // ============================================================
  const fetchPaymentReceivedDetails = async (month = selectedMonth, options = {}) => {
    const {
      owner: ownerOverride,
      forceRefresh = false
    } = options;

    try {
      setPaymentReceivedDetailsLoading(true);

      const apiMonth = convertMonthToApiFormat(month);
      const paymentReceivedDetailsUrl = import.meta.env.VITE_PROSPECT_DETAILS_API_URL;

      if (!paymentReceivedDetailsUrl) {
        console.error('VITE_PROSPECT_DETAILS_API_URL not defined');
        toast.error('API configuration error');
        return;
      }

      const ownerToUse = ownerOverride !== undefined ? ownerOverride : selectedOwner;

      let apiUrl = `${paymentReceivedDetailsUrl}?type=payment_received&month=${encodeURIComponent(apiMonth)}`;

      if (ownerToUse && ownerToUse !== 'all') {
        apiUrl += `&owner=${encodeURIComponent(String(ownerToUse).toLowerCase())}`;
      }

      // Prevent browser/proxy caching when the user explicitly refreshes.
      if (forceRefresh) {
        apiUrl += `&refresh=${Date.now()}`;
      }

      console.log('FETCH PAYMENT RECEIVED DETAILS:', apiUrl);

      const response = await axios.get(apiUrl, {
        headers: {
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache'
        }
      });

      if (response.data && response.data.status === 'success') {
        setPaymentReceivedDetailsData(response.data.data || []);
      } else {
        throw new Error('API returned unsuccessful status');
      }
    } catch (error) {
      console.error('Error fetching payment received details:', error);
      toast.error('Failed to load payment received details');
      setPaymentReceivedDetailsData([]);
    } finally {
      setPaymentReceivedDetailsLoading(false);
    }
  };

  // ============================================================
  // FETCH TOTAL PAID DETAILS
  // ============================================================
  const fetchTotalPaidDetails = async (month = selectedMonth, options = {}) => {
    const {
      owner: ownerOverride,
      forceRefresh = false
    } = options;

    try {
      setTotalPaidDetailsLoading(true);

      const apiMonth = convertMonthToApiFormat(month);
      const totalPaidDetailsUrl = import.meta.env.VITE_PROSPECT_DETAILS_API_URL;

      if (!totalPaidDetailsUrl) {
        console.error('VITE_PROSPECT_DETAILS_API_URL not defined');
        toast.error('API configuration error');
        return;
      }

      const ownerToUse = ownerOverride !== undefined ? ownerOverride : selectedOwner;

      let apiUrl = `${totalPaidDetailsUrl}?type=total_paid&month=${encodeURIComponent(apiMonth)}`;

      if (ownerToUse && ownerToUse !== 'all') {
        apiUrl += `&owner=${encodeURIComponent(String(ownerToUse).toLowerCase())}`;
      }

      // Prevent browser/proxy caching when the user explicitly refreshes.
      if (forceRefresh) {
        apiUrl += `&refresh=${Date.now()}`;
      }

      console.log('FETCH TOTAL PAID DETAILS:', apiUrl);

      const response = await axios.get(apiUrl, {
        headers: {
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache'
        }
      });

      if (response.data && response.data.status === 'success') {
        setTotalPaidDetailsData(response.data.data || []);
      } else {
        throw new Error('API returned unsuccessful status');
      }
    } catch (error) {
      console.error('Error fetching total paid details:', error);
      toast.error('Failed to load total paid details');
      setTotalPaidDetailsData([]);
    } finally {
      setTotalPaidDetailsLoading(false);
    }
  };

  // ============================================================
  // FETCH OVERDUE DETAILS
  // ============================================================
  const fetchOverdueDetails = async (month = selectedMonth, options = {}) => {
    const {
      owner: ownerOverride,
      forceRefresh = false
    } = options;

    try {
      setOverdueDetailsLoading(true);

      const apiMonth = convertMonthToApiFormat(month);
      const overdueDetailsUrl = import.meta.env.VITE_PROSPECT_DETAILS_API_URL;

      if (!overdueDetailsUrl) {
        console.error('VITE_PROSPECT_DETAILS_API_URL not defined');
        toast.error('API configuration error');
        return;
      }

      const ownerToUse = ownerOverride !== undefined ? ownerOverride : selectedOwner;

      let apiUrl = `${overdueDetailsUrl}?type=overdue_deals&month=${encodeURIComponent(apiMonth)}`;

      if (ownerToUse && ownerToUse !== 'all') {
        apiUrl += `&owner=${encodeURIComponent(String(ownerToUse).toLowerCase())}`;
      }

      // Prevent browser/proxy caching when the user explicitly refreshes.
      if (forceRefresh) {
        apiUrl += `&refresh=${Date.now()}`;
      }

      console.log('FETCH OVERDUE DETAILS:', apiUrl);

      const response = await axios.get(apiUrl, {
        headers: {
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache'
        }
      });

      if (response.data && response.data.status === 'success') {
        setOverdueDetailsData(response.data.data || []);
      } else {
        throw new Error('API returned unsuccessful status');
      }
    } catch (error) {
      console.error('Error fetching overdue details:', error);
      toast.error('Failed to load overdue details');
      setOverdueDetailsData([]);
    } finally {
      setOverdueDetailsLoading(false);
    }
  };

  // ============================================================
  // FETCH TOTAL DEAL AMOUNT DETAILS
  // ============================================================
  const fetchTotalDealAmountDetails = async (month = selectedMonth, options = {}) => {
    const {
      owner: ownerOverride,
      forceRefresh = false
    } = options;

    try {
      setTotalDealAmountDetailsLoading(true);

      const apiMonth = convertMonthToApiFormat(month);
      const totalDealAmountDetailsUrl = import.meta.env.VITE_PROSPECT_DETAILS_API_URL;

      if (!totalDealAmountDetailsUrl) {
        console.error('VITE_PROSPECT_DETAILS_API_URL not defined');
        toast.error('API configuration error');
        return;
      }

      const ownerToUse = ownerOverride !== undefined ? ownerOverride : selectedOwner;

      let apiUrl = `${totalDealAmountDetailsUrl}?type=total_deal_amount&month=${encodeURIComponent(apiMonth)}`;

      if (ownerToUse && ownerToUse !== 'all') {
        apiUrl += `&owner=${encodeURIComponent(String(ownerToUse).toLowerCase())}`;
      }

      // Prevent browser/proxy caching when the user explicitly refreshes.
      if (forceRefresh) {
        apiUrl += `&refresh=${Date.now()}`;
      }

      console.log('FETCH TOTAL DEAL AMOUNT DETAILS:', apiUrl);

      const response = await axios.get(apiUrl, {
        headers: {
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache'
        }
      });

      if (response.data && response.data.status === 'success') {
        setTotalDealAmountDetailsData(response.data.data || []);
      } else {
        throw new Error('API returned unsuccessful status');
      }
    } catch (error) {
      console.error('Error fetching total deal amount details:', error);
      toast.error('Failed to load total deal amount details');
      setTotalDealAmountDetailsData([]);
    } finally {
      setTotalDealAmountDetailsLoading(false);
    }
  };

  // ============================================================
  // FETCH EXPECTED REVENUE DETAILS
  // ============================================================
  const fetchExpectedRevenueDetails = async (month = selectedMonth, options = {}) => {
    const {
      owner: ownerOverride,
      forceRefresh = false
    } = options;

    try {
      setExpectedRevenueDetailsLoading(true);

      const apiMonth = convertMonthToApiFormat(month);
      const expectedRevenueDetailsUrl = import.meta.env.VITE_PROSPECT_DETAILS_API_URL;

      if (!expectedRevenueDetailsUrl) {
        console.error('VITE_PROSPECT_DETAILS_API_URL not defined');
        toast.error('API configuration error');
        return;
      }

      const ownerToUse = ownerOverride !== undefined ? ownerOverride : selectedOwner;

      let apiUrl = `${expectedRevenueDetailsUrl}?type=expected_revenue&month=${encodeURIComponent(apiMonth)}`;

      if (ownerToUse && ownerToUse !== 'all') {
        apiUrl += `&owner=${encodeURIComponent(String(ownerToUse).toLowerCase())}`;
      }

      // Prevent browser/proxy caching when the user explicitly refreshes.
      if (forceRefresh) {
        apiUrl += `&refresh=${Date.now()}`;
      }

      console.log('FETCH EXPECTED REVENUE DETAILS:', apiUrl);

      const response = await axios.get(apiUrl, {
        headers: {
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache'
        }
      });

      if (response.data && response.data.status === 'success') {
        setExpectedRevenueDetailsData(response.data.data || []);

        // Update expected revenue metric from API response details
        if (response.data.details && response.data.details.total_expected_revenue !== undefined) {
          const totalRevenue = Number(response.data.details.total_expected_revenue) || 0;
          setTotalExpectedRevenue(totalRevenue);
          setMetrics(prevMetrics => ({
            ...prevMetrics,
            expectedRevenue: totalRevenue
          }));
        }
      } else {
        throw new Error('API returned unsuccessful status');
      }
    } catch (error) {
      console.error('Error fetching expected revenue details:', error);
      toast.error('Failed to load expected revenue details');
      setExpectedRevenueDetailsData([]);
    } finally {
      setExpectedRevenueDetailsLoading(false);
    }
  };

  // ============================================================
  // FETCH CLOSING DATE HISTORY
  // ============================================================
  const fetchClosingDateHistory = async () => {
    try {
      setClosingDateHistoryLoading(true);

      const closingDateHistoryUrl = import.meta.env.VITE_PROSPECT_DETAILS_API_URL;

      if (!closingDateHistoryUrl) {
        console.error('VITE_PROSPECT_DETAILS_API_URL not defined');
        toast.error('API configuration error');
        return;
      }

      let apiUrl = `${closingDateHistoryUrl}?type=closing_date`;

      console.log('FETCH CLOSING DATE HISTORY:', apiUrl);

      const response = await axios.get(apiUrl, {
        headers: {
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache'
        }
      });

      if (response.data && response.data.status === 'success') {
        const historyData = response.data.data || [];
        setClosingDateHistory(historyData);
        
        // Extract lead_ids that have history and create lead_id to deal_id mapping
        const leadIdsWithHistory = new Set();
        const leadToDealMap = new Map();
        historyData.forEach(item => {
          if (item.lead_id) {
            leadIdsWithHistory.add(String(item.lead_id));
            // Map lead_id to deal_id for lookup
            if (!leadToDealMap.has(String(item.lead_id))) {
              leadToDealMap.set(String(item.lead_id), String(item.deal_id));
            }
          }
        });
        setLeadsWithHistory(leadIdsWithHistory);
        setLeadIdToDealIdMap(leadToDealMap);
        
        console.log('Leads with history:', leadIdsWithHistory);
        console.log('Lead to deal mapping:', leadToDealMap);
      } else {
        throw new Error('API returned unsuccessful status');
      }
    } catch (error) {
      console.error('Error fetching closing date history:', error);
      toast.error('Failed to load closing date history');
      setClosingDateHistory([]);
      setLeadsWithHistory(new Set());
    } finally {
      setClosingDateHistoryLoading(false);
    }
  };

  // ============================================================
  // UPDATE CLOSING DATE
  // ============================================================
  const handleClosingDateEdit = (deal) => {
    setEditingClosingDateDeal(deal);
    // Convert closing_date to YYYY-MM-DD format for date input
    let formattedDate = '';
    if (deal.closing_date) {
      try {
        const date = new Date(deal.closing_date);
        if (!isNaN(date.getTime())) {
          formattedDate = date.toISOString().split('T')[0];
        }
      } catch (error) {
        console.error('Error formatting date:', error);
      }
    }
    setNewClosingDate(formattedDate);
    setShowClosingDateEditModal(true);
  };

  const handleClosingDateUpdate = async () => {
    if (!editingClosingDateDeal || !newClosingDate) {
      toast.error('Please select a closing date');
      return;
    }

    try {
      setIsUpdatingClosingDate(true);
      toast.loading('Updating closing date...', { id: 'closing-date-update-toast' });

      const updateDealUrl = import.meta.env.VITE_UPDATE_CLOSE_DATE_API_URL;

      if (!updateDealUrl) {
        toast.dismiss('closing-date-update-toast');
        toast.error('Update Deal API URL not configured');
        return;
      }

      const dealId = editingClosingDateDeal.deal_id || editingClosingDateDeal.id;
      const currentUserName = user?.name || user?.fullName || user?.first_name || 'Operation User';

      const requestBody = {
        deal_id: dealId,
        id: dealId,
        deal_close_date: newClosingDate,
        user: currentUserName
      };

      console.log('UPDATING CLOSING DATE:', requestBody);

      // Construct URL with query parameters (matching Opportunities component pattern)
      const dealUrl = `${updateDealUrl}?deal_id=${encodeURIComponent(dealId)}&user=${encodeURIComponent(currentUserName)}&deal_close_date=${encodeURIComponent(newClosingDate)}`;

      const response = await fetch(dealUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      console.log('CLOSING DATE UPDATE RESPONSE STATUS:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('HTTP Error:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('CLOSING DATE UPDATE RESPONSE:', result);

      toast.dismiss('closing-date-update-toast');
      toast.success('Closing date updated successfully');

      // Refresh the data to show updated closing date
      if (showDealDetails) {
        await fetchDealDetails(selectedMonth, { forceRefresh: true });
      }
      if (showInvoicedDetails) {
        await fetchInvoicedDetails(selectedMonth, { forceRefresh: true });
      }
      if (showPaymentReceivedDetails) {
        await fetchPaymentReceivedDetails(selectedMonth, { forceRefresh: true });
      }
      if (showTotalPaidDetails) {
        await fetchTotalPaidDetails(selectedMonth, { forceRefresh: true });
      }
      if (showOverdueDetails) {
        await fetchOverdueDetails(selectedMonth, { forceRefresh: true });
      }
      if (showTotalDealAmountDetails) {
        await fetchTotalDealAmountDetails(selectedMonth, { forceRefresh: true });
      }
      if (showExpectedRevenueDetails) {
        await fetchExpectedRevenueDetails(selectedMonth, { forceRefresh: true });
      }

      // Refresh closing date history
      await fetchClosingDateHistory();

      setShowClosingDateEditModal(false);
      setEditingClosingDateDeal(null);
      setNewClosingDate('');
    } catch (error) {
      console.error('Error updating closing date:', error);
      toast.dismiss('closing-date-update-toast');
      toast.error('Failed to update closing date');
    } finally {
      setIsUpdatingClosingDate(false);
    }
  };

  // ============================================================
  // INITIAL LOAD + FILTER/MONTH/OWNER REFRESH
  // ============================================================
  useEffect(() => {
    fetchDropdownOptions().catch(err =>
      console.error('Dropdown options fetch failed:', err)
    );

    // First call gets the available months.
    fetchProspectData('2026-09').catch(err =>
      console.error('Initial prospect data fetch failed:', err)
    );
  }, []);

  // Close dropdowns when clicking outside them
  useEffect(() => {
    const handleClickOutside = (event) => {
      const target = event.target;

      if (ownerDropdownRef.current && !ownerDropdownRef.current.contains(target)) {
        setShowOwnerDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Once the API gives us the default month, or whenever the month
  // or owner changes, fetch fresh data using the current filter state.
  useEffect(() => {
    if (!selectedMonth || isInitialLoad.current) return;

    fetchProspectData(selectedMonth, {
      forceRefresh: true
    });

    if (showOwnerSummaryTable) {
      fetchOwnerSummaryData(selectedMonth, {
        forceRefresh: true
      });
    }

    if (showProspectDetails) {
      fetchProspectDetails(selectedMonth, {
        forceRefresh: true
      });
    }

    if (showDealDetails) {
      fetchDealDetails(selectedMonth, {
        forceRefresh: true
      });
    }

    if (showInvoicedDetails) {
      fetchInvoicedDetails(selectedMonth, {
        forceRefresh: true
      });
    }

    if (showPaymentReceivedDetails) {
      fetchPaymentReceivedDetails(selectedMonth, {
        forceRefresh: true
      });
    }

    if (showTotalPaidDetails) {
      fetchTotalPaidDetails(selectedMonth, {
        forceRefresh: true
      });
    }

    if (showOverdueDetails) {
      fetchOverdueDetails(selectedMonth, {
        forceRefresh: true
      });
    }

    if (showTotalDealAmountDetails) {
      fetchTotalDealAmountDetails(selectedMonth, {
        forceRefresh: true
      });
    }

    if (showExpectedRevenueDetails) {
      fetchExpectedRevenueDetails(selectedMonth, {
        forceRefresh: true
      });
    }
  }, [selectedMonth, selectedOwner]);



  // ============================================================
  // MANUAL REFRESH
  // ============================================================
  const handleRefresh = async () => {
    if (!selectedMonth || refreshing) return;

    setRefreshing(true);
    setLoading(true);

    try {
      await fetchProspectData(selectedMonth, {
        forceRefresh: true
      });

      if (showOwnerSummaryTable) {
        await fetchOwnerSummaryData(selectedMonth, {
          forceRefresh: true
        });
      }

      if (showTotalDealAmountDetails) {
        await fetchTotalDealAmountDetails(selectedMonth, {
          forceRefresh: true
        });
      }

      if (showExpectedRevenueDetails) {
        await fetchExpectedRevenueDetails(selectedMonth, {
          forceRefresh: true
        });
      }

      toast.success('Prospect data refreshed');
    } catch (error) {
      console.error('Refresh failed:', error);
      toast.error('Failed to refresh data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ---- Prospect Statistics Cards -----------------------------------------
  const prospectCards = [
    {
      key: 'totalProspects',
      title: 'Total Prospects',
      value: metrics.totalProspects,
      icon: Users,
      accent: palette.growth,
      subtitle: 'Active leads in pipeline',
      isCurrency: false,
      onClick: () => {
        closeAllTables();
        setProspectDetailsSearchTerm('');
        setShowProspectDetails(true);
        fetchProspectDetails(selectedMonth);
        // Ensure closing date history is loaded
        if (!closingDateHistory) {
          fetchClosingDateHistory();
        }
      }
    },
    {
      key: 'totalDeals',
      title: 'Total Deals',
      value: metrics.totalDeals,
      icon: Target,
      accent: palette.slate,
      subtitle: 'All deal stages',
      isCurrency: false,
      onClick: () => {
        closeAllTables();
        setDealDetailsSearchTerm('');
        setShowDealDetails(true);
        fetchDealDetails(selectedMonth);
        // Ensure closing date history is loaded
        if (!closingDateHistory) {
          fetchClosingDateHistory();
        }
      }
    },
    {
      key: 'totalDealAmount',
      title: 'Total Deal Amount',
      value: metrics.totalDealAmount,
      icon: DollarSign,
      accent: palette.growth,
      subtitle: 'All deal stages value',
      isCurrency: true,
      onClick: () => {
        closeAllTables();
        setTotalDealAmountDetailsSearchTerm('');
        setShowTotalDealAmountDetails(true);
        fetchTotalDealAmountDetails(selectedMonth);
        // Ensure closing date history is loaded
        if (!closingDateHistory) {
          fetchClosingDateHistory();
        }
      }
    },
    {
      key: 'expectedRevenue',
      title: 'Expected Revenue',
      value: metrics.expectedRevenue,
      icon: ArrowUpRight,
      accent: palette.slate,
      subtitle: metrics.totalDealAmount && metrics.totalDealAmount > 0 && !isNaN(metrics.expectedRevenue)
        ? `${((metrics.expectedRevenue / metrics.totalDealAmount) * 100).toFixed(1)}% of total`
        : 'Projected revenue',
      isCurrency: true,
      onClick: () => {
        closeAllTables();
        setShowExpectedRevenueDetails(true);
        fetchExpectedRevenueDetails(selectedMonth, { forceRefresh: true });
      }
    },
    {
      key: 'invoicedAmount',
      title: 'Invoiced Amount',
      value: metrics.invoicedAmount,
      icon: FileText,
      accent: palette.amberDeep,
      subtitle: metrics.totalDealAmount && metrics.totalDealAmount > 0 && !isNaN(metrics.invoicedAmount)
        ? `${((metrics.invoicedAmount / metrics.totalDealAmount) * 100).toFixed(1)}% of total`
        : 'Total invoiced value',
      isCurrency: true,
      onClick: () => {
        closeAllTables();
        setInvoicedDetailsSearchTerm('');
        setShowInvoicedDetails(true);
        fetchInvoicedDetails(selectedMonth);
        // Ensure closing date history is loaded
        if (!closingDateHistory) {
          fetchClosingDateHistory();
        }
      }
    },
    {
      key: 'paidAmount',
      title: 'Paid Amount',
      value: metrics.paidAmount,
      icon: IndianRupee,
      accent: palette.teal,
      subtitle: metrics.totalDealAmount && metrics.totalDealAmount > 0 && !isNaN(metrics.paidAmount)
        ? `${((metrics.paidAmount / metrics.totalDealAmount) * 100).toFixed(1)}% of total`
        : 'Amount collected',
      isCurrency: true,
      onClick: () => {
        closeAllTables();
        setPaymentReceivedDetailsSearchTerm('');
        setShowPaymentReceivedDetails(true);
        fetchPaymentReceivedDetails(selectedMonth);
        // Ensure closing date history is loaded
        if (!closingDateHistory) {
          fetchClosingDateHistory();
        }
      }
    },
    {
      key: 'totalPaidAmount',
      title: 'Total Paid Amount',
      value: metrics.totalPaidAmount,
      icon: DollarSign,
      accent: palette.growth,
      subtitle: 'Cumulative payments received',
      isCurrency: true,
      onClick: () => {
        closeAllTables();
        setTotalPaidDetailsSearchTerm('');
        setShowTotalPaidDetails(true);
        fetchTotalPaidDetails(selectedMonth);
        // Ensure closing date history is loaded
        if (!closingDateHistory) {
          fetchClosingDateHistory();
        }
      }
    },
    {
      key: 'overdueDeals',
      title: 'Overdue Deals',
      value: metrics.overdueDeals,
      icon: Target,
      accent: palette.rust,
      subtitle: `${formatCurrency(metrics.overdueAmount)} overdue`,
      isCurrency: false,
      onClick: () => {
        closeAllTables();
        setOverdueDetailsSearchTerm('');
        setShowOverdueDetails(true);
        fetchOverdueDetails(selectedMonth);
        // Ensure closing date history is loaded
        if (!closingDateHistory) {
          fetchClosingDateHistory();
        }
      }
    },
    {
      key: 'viewAllSales',
      title: 'View All Sales Details',
      value: 'View',
      icon: BarChart3,
      accent: palette.slate,
      subtitle: 'Complete sales overview',
      isCurrency: false,
      onClick: () => {
        closeAllTables();
        setOwnerSummarySearchTerm('');
        setShowOwnerSummaryTable(true);
        fetchOwnerSummaryData(selectedMonth);
        // Ensure closing date history is loaded
        if (!closingDateHistory) {
          fetchClosingDateHistory();
        }
      }
    }
  ];

  return (
    <div className="main-full" style={{ background: palette.canvas }}>
      <style>{`
        .fr-eyebrow { font-family: var(--font-mono), monospace; letter-spacing: 0.14em; text-transform: uppercase; }
        .fr-display { font-family: var(--font-display), Georgia, serif; }
        .fr-body { font-family: var(--font-display), Georgia, serif; }
        .fr-mono { font-family: var(--font-mono), monospace; }

        @keyframes frFadeUp {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes frPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.35; }
        }
        @keyframes frSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .fr-spin { animation: frSpin 1s linear infinite; }
        .fr-card {
          animation: frFadeUp 0.5s ease both;
        }
        .fr-live-dot {
          animation: frPulse 2s ease-in-out infinite;
        }
        .fr-card:hover .fr-card-arrow {
          transform: translate(2px, -2px);
          opacity: 1;
        }
        .sa-manager-cell {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .sa-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #DCFCE7;
          color: #166534;
          font-weight: 700;
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 14px;
        }
        .sa-manager-name {
          font-size: 14px;
          font-weight: 600;
          color: #111827;
        }
      `}</style>

      {/* Header */}
      <div className="topbar" style={{ borderBottom: `1px solid ${palette.border}` }}>
        <div className="tb-left">
          <div className="tb-page fr-body" style={{ fontWeight: 600, color: palette.ink }}>Prospect Statistics</div>
        </div>
        <div className="tb-right" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Owner Filter Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="fr-body" style={{ fontSize: '13px', color: palette.inkSoft }}>Owner:</span>
            <div style={{ position: 'relative' }} ref={ownerDropdownRef}>
              <button
                onClick={() => setShowOwnerDropdown(!showOwnerDropdown)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: `1px solid ${palette.border}`,
                  fontSize: '13px',
                  outline: 'none',
                  background: palette.surface,
                  color: palette.ink,
                  cursor: 'pointer',
                  fontFamily: 'var(--font-mono), monospace',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  minWidth: '150px',
                  justifyContent: 'space-between'
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = palette.growth}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = palette.border}
              >
                {selectedOwner === 'all' ? 'All Owners' : selectedOwner}
                <ChevronDown size={14} />
              </button>
              
              {showOwnerDropdown && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    marginTop: '4px',
                    background: palette.surface,
                    border: `1px solid ${palette.border}`,
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    zIndex: 10,
                    maxHeight: '200px',
                    overflowY: 'auto'
                  }}
                >
                  <div
                    onClick={() => {
                      setSelectedOwner('all');
                      setShowOwnerDropdown(false);
                    }}
                    style={{
                      padding: '8px 12px',
                      fontSize: '13px',
                      cursor: 'pointer',
                      ':hover': { background: palette.canvas }
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = palette.canvas}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                  >
                    All Owners
                  </div>
                  {ownerOptions.map((owner) => (
                    <div
                      key={owner}
                      onClick={() => {
                        setSelectedOwner(owner);
                        setShowOwnerDropdown(false);
                      }}
                      style={{
                        padding: '8px 12px',
                        fontSize: '13px',
                        cursor: 'pointer',
                        borderTop: `1px solid ${palette.border}`
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = palette.canvas}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                    >
                      {owner}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div
            className="fr-mono"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              color: palette.inkSoft,
              padding: '6px 10px',
              borderRadius: '999px',
              border: `1px solid ${palette.border}`,
              background: palette.surface
            }}
          >
            <span
              className="fr-live-dot"
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '999px',
                background: palette.growth,
                display: 'inline-block'
              }}
            />
            {formatTimeAgo(lastUpdated)}
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="fr-body"
            style={{
              padding: '8px 16px',
              backgroundColor: palette.ink,
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              cursor: refreshing ? 'not-allowed' : 'pointer',
              fontSize: '13px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              opacity: refreshing ? 0.7 : 1
            }}
          >
            <RefreshCw size={14} className={refreshing ? 'fr-spin' : ''} />
            {refreshing ? 'Refreshing' : 'Refresh'}
          </button>
        </div>
      </div>

      <div className="content-area">
        <div className="sa-container">

          {/* Field Report header band */}
          <div
            style={{
              position: 'relative',
              overflow: 'hidden',
              borderRadius: '12px',
              background: 'linear-gradient(225deg, #ffffff 0%, #ffffff 100%)',
              padding: '12px',
              marginBottom: '4px'
            }}
          >
            {/* Contour-line motif */}
            <svg
              width="480" height="240" viewBox="0 0 480 240"
              style={{ position: 'absolute', top: '-40px', right: '-40px', opacity: 0.14, pointerEvents: 'none' }}
            >
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <path
                  key={i}
                  d={`M ${-20 + i * 8} 240 C ${100 - i * 6} ${140 - i * 14}, ${260 + i * 10} ${180 - i * 10}, ${500 - i * 4} ${20 + i * 18}`}
                  fill="none"
                  stroke={palette.amber}
                  strokeWidth="1.4"
                />
              ))}
            </svg>

            <div style={{ position: 'relative', zIndex: 1 }}>
              
              <h1
                className="fr-display"
                style={{ color: '#1a1c17', fontSize: '30px', fontWeight: 500, margin: 0, lineHeight: 1.2 }}
              >
                Prospect Overview
              </h1>
            </div>
          </div>

      {/* Month Tabs */}
      {availableMonths.length > 0 && (
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
      )}

      {/* Loading State */}
      {loading || !selectedMonth ? (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '64px',
          color: palette.inkSoft
        }}>
          <div style={{ textAlign: 'center' }}>
            <RefreshCw size={28} className="fr-spin" style={{ margin: '0 auto 12px', display: 'block' }} />
            <p className="fr-body" style={{ fontSize: '14px' }}>Reading the field…</p>
          </div>
        </div>
      ) : (
        <>
          {/* Statistics Cards */}
          <div className="op-dashboard-grid">
            {prospectCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.key}
                  className="fr-card"
                  onClick={card.onClick}
                  style={{
                    animationDelay: `${index * 0.05}s`,
                    background: palette.surface,
                    borderRadius: '8px',
                    padding: '14px 16px 16px',
                    border: `1px solid #b3b4b4`,
                    cursor: card.onClick ? 'pointer' : 'default',
                    transition: 'transform 0.18s ease, box-shadow 0.18s ease, background-color 0.18s ease, border-color 0.18s ease',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(22, 36, 28, 0.08)';
                    e.currentTarget.style.backgroundColor = '#f0fdf4';
                    e.currentTarget.style.borderColor = '#86efac';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.backgroundColor = palette.surface;
                    e.currentTarget.style.borderColor = '#b3b4b4';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '6px',
                        background: `${card.accent}1A`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Icon size={14} color={card.accent} />
                    </div>
                  </div>

                  <div
                    className="fr-mono"
                    style={{ fontSize: '22px', fontWeight: 600, color: palette.ink, marginTop: '10px', lineHeight: 1 }}
                  >
                    {typeof card.value === 'string' ? card.value : (card.isCurrency ? formatCurrency(card.value) : formatNumber(card.value))}
                  </div>

                  <div className="fr-body" style={{ fontSize: '12px', color: palette.inkSoft, marginTop: '5px', fontWeight: 500 }}>
                    {card.title}
                  </div>

                  {card.onClick && (
                    <div
                      className="fr-card-arrow"
                      style={{
                        position: 'absolute',
                        top: '14px',
                        right: '14px',
                        opacity: 0,
                        transition: 'all 0.18s ease',
                        color: palette.inkFaint
                      }}
                    >
                      <ArrowUpRight size={14} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Owner Summary Table */}
          {showOwnerSummaryTable && (
            <div 
              className="sa-table-card" 
              style={{ 
                marginTop: '24px', 
                display: 'flex', 
                flexDirection: 'column',
                animation: 'frFadeUp 0.4s ease both'
              }}
            >
              {/* Table Header */}
              <div
                style={{
                  padding: '20px 24px',
                  borderBottom: `1px solid ${palette.border}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <h3
                    className="fr-display"
                    style={{
                      fontSize: '18px',
                      fontWeight: 500,
                      color: palette.ink,
                      margin: 0
                    }}
                  >
                    Owner Summary
                  </h3>
                  <p
                    className="fr-body"
                    style={{
                      fontSize: '13px',
                      color: palette.inkSoft,
                      margin: '4px 0 0 0'
                    }}
                  >
                    Total Owners: {ownerSummaryData?.length || 0} | Month: {selectedMonth}
                  </p>
                </div>
                <button
                  onClick={() => setShowOwnerSummaryTable(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '8px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background 0.15s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = palette.canvas}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                >
                  <X size={20} color={palette.inkSoft} />
                </button>
              </div>

              {/* Search Bar */}
              <div
                style={{
                  padding: '16px 24px',
                  borderBottom: `1px solid ${palette.border}`
                }}
              >
                <div
                  style={{
                    position: 'relative',
                    maxWidth: '400px'
                  }}
                >
                  <Search
                    size={16}
                    color={palette.inkFaint}
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)'
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Search by owner name..."
                    value={ownerSummarySearchTerm}
                    onChange={(e) => setOwnerSummarySearchTerm(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 40px',
                      border: `1px solid ${palette.border}`,
                      borderRadius: '8px',
                      fontSize: '13px',
                      outline: 'none',
                      background: palette.canvas,
                      color: palette.ink,
                      fontFamily: 'var(--font-mono), monospace'
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = palette.growth}
                    onBlur={(e) => e.currentTarget.style.borderColor = palette.border}
                  />
                </div>
              </div>

              {/* Table Content */}
              <div style={{ flex: '1 1 0%', overflow: 'auto', padding: '20px', background: 'rgb(245, 245, 245)' }}>
                <table className="sa-table">
                  <thead>
                    <tr>
                      <th style={{ width: '18%' }} title="Owner">Owner</th>
                      <th style={{ width: '10%' }} title="Accounts">Accounts</th>
                      <th style={{ width: '10%' }} title="Deals">Deals</th>
                      <th style={{ width: '14%' }} title="Invoiced">Invoiced</th>
                      <th style={{ width: '14%' }} title="Paid Amount">Paid Amount</th>
                      <th style={{ width: '14%' }} title="Total Paid">Total Paid</th>
                      <th style={{ width: '14%' }} title="Expected Revenue">Expected Revenue</th>
                      <th style={{ width: '14%' }} title="Overdue">Overdue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ownerSummaryData && ownerSummaryData.length > 0 ? (
                      ownerSummaryData
                        .filter(owner => {
                          if (ownerSummarySearchTerm === '') return true;
                          const searchTerm = ownerSummarySearchTerm.toLowerCase().trim();
                          return (owner.owner?.toLowerCase() || '').includes(searchTerm);
                        })
                        .map((owner, index) => (
                        <tr key={owner.owner || index} className="sa-table-row">
                          <td style={{ width: '18%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <div className="sa-manager-name" title={owner.owner || 'N/A'}>{owner.owner || 'N/A'}</div>
                          </td>
                          <td style={{ width: '10%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <span style={{ fontWeight: 600, color: palette.ink }}>
                              {owner.account_count || 0}
                            </span>
                          </td>
                          <td style={{ width: '10%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <span style={{ fontWeight: 600, color: palette.ink }}>
                              {owner.deal_count || 0}
                            </span>
                          </td>
                          <td style={{ width: '14%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <div>
                              <div style={{ fontSize: '14px', fontWeight: 700, color: palette.amberDeep }}>
                                {formatCurrency(owner.invoiced_amount || 0)}
                              </div>
                              <div style={{ fontSize: '11px', color: palette.inkSoft, fontWeight: 600 }}>
                                {owner.invoiced_count || 0} invoiced
                              </div>
                            </div>
                          </td>
                          <td style={{ width: '14%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <div>
                              <div style={{ fontSize: '14px', fontWeight: 700, color: palette.teal }}>
                                {formatCurrency(owner.payment_received_amount || 0)}
                              </div>
                              <div style={{ fontSize: '11px', color: palette.inkSoft, fontWeight: 600 }}>
                                {owner.payment_received_count || 0} paid
                              </div>
                            </div>
                          </td>
                          <td style={{ width: '14%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <div>
                              <div style={{ fontSize: '14px', fontWeight: 700, color: palette.growth }}>
                                {formatCurrency(owner.total_paid_amount || 0)}
                              </div>
                              <div style={{ fontSize: '11px', color: palette.inkSoft, fontWeight: 600 }}>
                                {owner.total_paid_count || 0} total
                              </div>
                            </div>
                          </td>
                          <td style={{ width: '14%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <div>
                              <div style={{ fontSize: '14px', fontWeight: 700, color: palette.slate }}>
                                {formatCurrency(owner.expected_revenue || 0)}
                              </div>
                              {(owner.expected_revenue_count || 0) > 0 && (
                                <div style={{ fontSize: '11px', color: palette.inkSoft, fontWeight: 600 }}>
                                  {owner.expected_revenue_count} expected
                                </div>
                              )}
                            </div>
                          </td>
                          <td style={{ width: '14%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <div>
                              <div style={{ fontSize: '14px', fontWeight: 700, color: palette.rust }}>
                                {formatCurrency(owner.overdue_amount || 0)}
                              </div>
                              <div style={{ fontSize: '11px', color: palette.inkSoft, fontWeight: 600 }}>
                                {owner.overdue_count || 0} overdue
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: palette.inkSoft }}>
                          No owner summary data found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Prospect Details Table */}
          {showProspectDetails && (
            <div 
              className="sa-table-card" 
              style={{ 
                marginTop: '24px', 
                display: 'flex', 
                flexDirection: 'column',
                animation: 'frFadeUp 0.4s ease both'
              }}
            >
              {/* Table Header */}
              <div
                style={{
                  padding: '20px 24px',
                  borderBottom: `1px solid ${palette.border}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <h3
                    className="fr-display"
                    style={{
                      fontSize: '18px',
                      fontWeight: 500,
                      color: palette.ink,
                      margin: 0
                    }}
                  >
                    Prospect Details
                  </h3>
                  <p
                    className="fr-body"
                    style={{
                      fontSize: '13px',
                      color: palette.inkSoft,
                      margin: '4px 0 0 0'
                    }}
                  >
                    Total Prospects: {prospectDetailsData?.length || 0} | Month: {selectedMonth}
                  </p>
                </div>
                <button
                  onClick={() => setShowProspectDetails(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '8px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background 0.15s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = palette.canvas}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                >
                  <X size={20} color={palette.inkSoft} />
                </button>
              </div>

              {/* Search Bar */}
              <div
                style={{
                  padding: '16px 24px',
                  borderBottom: `1px solid ${palette.border}`
                }}
              >
                <div
                  style={{
                    position: 'relative',
                    maxWidth: '400px'
                  }}
                >
                  <Search
                    size={16}
                    color={palette.inkFaint}
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)'
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Search by account name, contact, or owner..."
                    value={prospectDetailsSearchTerm}
                    onChange={(e) => setProspectDetailsSearchTerm(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 40px',
                      border: `1px solid ${palette.border}`,
                      borderRadius: '8px',
                      fontSize: '13px',
                      outline: 'none',
                      background: palette.canvas,
                      color: palette.ink,
                      fontFamily: 'var(--font-mono), monospace'
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = palette.growth}
                    onBlur={(e) => e.currentTarget.style.borderColor = palette.border}
                  />
                </div>
              </div>

              {/* Table Content */}
              <div style={{ flex: '1 1 0%', overflow: 'auto', padding: '20px', background: 'rgb(245, 245, 245)' }}>
                <table className="sa-table">
                  <thead>
                    <tr>
                      <th style={{ width: '15%' }} title="Account Name">Account Name</th>
                      <th style={{ width: '15%' }} title="Account Number">Account Number</th>
                      <th style={{ width: '15%' }} title="Contact Name">Contact Name</th>
                      <th style={{ width: '20%' }} title="Contact">Contact</th>
                      <th style={{ width: '15%' }} title="Account Owner">Account Owner</th>
                      <th style={{ width: '15%' }} title="Country">Country</th>
                      <th style={{ width: '15%' }} title="Account Type">Account Type</th>
                      <th style={{ width: '15%' }} title="Deal Present">Deal Present</th>
                      <th style={{ width: '15%' }} title="Created">Created Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prospectDetailsLoading ? (
                      <tr>
                        <td colSpan="9" style={{ textAlign: 'center', padding: '40px', color: palette.inkSoft }}>
                          <RefreshCw size={24} className="fr-spin" style={{ margin: '0 auto 12px', display: 'block' }} />
                          Loading prospect details...
                        </td>
                      </tr>
                    ) : prospectDetailsData && prospectDetailsData.length > 0 ? (
                      prospectDetailsData
                        .filter(prospect => {
                          if (prospectDetailsSearchTerm === '') return true;
                          const searchTerm = prospectDetailsSearchTerm.toLowerCase().trim();
                          return (
                            (prospect.account_name?.toLowerCase() || '').includes(searchTerm) ||
                            (prospect.contact_name?.toLowerCase() || '').includes(searchTerm) ||
                            (prospect.account_owner?.toLowerCase() || '').includes(searchTerm)
                          );
                        })
                        .map((prospect) => (
                        <tr key={prospect.id} className="sa-table-row">
                          <td style={{ width: '14%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <div style={{ fontWeight: 600, color: palette.ink }} title={prospect.account_name || 'N/A'}>
                              {prospect.account_name || 'N/A'}
                            </div>
                          </td>
                          <td style={{ width: '10%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <div style={{ color: palette.ink, fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={prospect.account_number}>
                              #{prospect.account_number}
                            </div>
                          </td>
                          <td style={{ width: '12%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <div style={{ color: palette.ink }} title={prospect.contact_name || 'N/A'}>
                              {prospect.contact_name || 'N/A'}
                            </div>
                          </td>
                          <td style={{ width: '14%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <div style={{ color: palette.ink }} title={prospect.phone || 'N/A'}>
                              {prospect.phone || 'N/A'}
                            </div>
                            <div style={{ color: palette.inkSoft, fontSize: '12px' }} title={prospect.email || 'N/A'}>
                              {prospect.email || 'N/A'}
                            </div>
                          </td>
                          <td style={{ width: '12%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <div style={{ fontWeight: 600, color: palette.ink }} title={prospect.account_owner || 'N/A'}>
                              {prospect.account_owner || 'N/A'}
                            </div>
                          </td>
                          <td style={{ width: '10%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <div style={{ color: palette.inkSoft, fontSize: '12px' }} title={prospect.country || 'N/A'}>
                              {prospect.country || 'N/A'}
                            </div>
                          </td>
                          <td style={{ width: '12%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <div style={{ color: palette.ink }} title={prospect.account_type || 'N/A'}>
                              {prospect.account_type || 'N/A'}
                            </div>
                          </td>
                          <td style={{ width: '10%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <div style={{ color: palette.ink }} title={prospect.deal_present || 0}>
                              {prospect.deal_present || 0}
                            </div>
                          </td>
                          <td style={{ width: '12%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <div style={{ color: palette.inkSoft, fontSize: '12px' }} title={prospect.account_created_time || 'N/A'}>
                              {formatDate(prospect.account_created_time)}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="9" style={{ textAlign: 'center', padding: '40px', color: palette.inkSoft }}>
                          No prospect details found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Deal Details Table */}
          {showDealDetails && (
            <div 
              className="sa-table-card" 
              style={{ 
                marginTop: '24px', 
                display: 'flex', 
                flexDirection: 'column',
                animation: 'frFadeUp 0.4s ease both'
              }}
            >
              {/* Table Header */}
              <div
                style={{
                  padding: '20px 24px',
                  borderBottom: `1px solid ${palette.border}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <h3
                    className="fr-display"
                    style={{
                      fontSize: '18px',
                      fontWeight: 500,
                      color: palette.ink,
                      margin: 0
                    }}
                  >
                    Deal Details
                  </h3>
                  <p
                    className="fr-body"
                    style={{
                      fontSize: '13px',
                      color: palette.inkSoft,
                      margin: '4px 0 0 0'
                    }}
                  >
                    Total Deals: {dealDetailsData?.length || 0} | Month: {selectedMonth}
                  </p>
                </div>
                <button
                  onClick={() => setShowDealDetails(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '8px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background 0.15s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = palette.canvas}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                >
                  <X size={20} color={palette.inkSoft} />
                </button>
              </div>

              {/* Search Bar */}
              <div
                style={{
                  padding: '16px 24px',
                  borderBottom: `1px solid ${palette.border}`
                }}
              >
                <div
                  style={{
                    position: 'relative',
                    maxWidth: '400px'
                  }}
                >
                  <Search
                    size={16}
                    color={palette.inkFaint}
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)'
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Search by deal name, account, or owner..."
                    value={dealDetailsSearchTerm}
                    onChange={(e) => setDealDetailsSearchTerm(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 40px',
                      border: `1px solid ${palette.border}`,
                      borderRadius: '8px',
                      fontSize: '13px',
                      outline: 'none',
                      background: palette.canvas,
                      color: palette.ink,
                      fontFamily: 'var(--font-mono), monospace'
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = palette.growth}
                    onBlur={(e) => e.currentTarget.style.borderColor = palette.border}
                  />
                </div>
              </div>

              {/* Table Content */}
              <div style={{ flex: '1 1 0%', overflow: 'auto', padding: '20px', background: 'rgb(245, 245, 245)' }}>
                <table className="sa-table">
                  <thead>
                    <tr>
                      <th style={{ width: '16%' }} title="Deal Name">Deal Name</th>
                      <th style={{ width: '12%' }} title="Account Name">Account Name</th>
                      <th style={{ width: '10%' }} title="Account Number">Account Number</th>
                      <th style={{ width: '12%' }} title="Contact Name">Contact Name</th>
                      <th style={{ width: '10%' }} title="Amount">Amount</th>
                      <th style={{ width: '8%' }} title="Probability">Probability</th>
                      <th style={{ width: '10%' }} title="Expected Amount">Expected Amount</th>
                      <th style={{ width: '10%' }} title="Stage">Stage</th>
                      <th style={{ width: '12%' }} title="Deal Owner">Deal Owner</th>
                      <th style={{ width: '12%' }} title="Closing Date">Closing Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dealDetailsLoading ? (
                      <tr>
                        <td colSpan="10" style={{ textAlign: 'center', padding: '40px', color: palette.inkSoft }}>
                          <RefreshCw size={24} className="fr-spin" style={{ margin: '0 auto 12px', display: 'block' }} />
                          Loading deal details...
                        </td>
                      </tr>
                    ) : dealDetailsData && dealDetailsData.length > 0 ? (
                      dealDetailsData
                        .filter(deal => {
                          if (dealDetailsSearchTerm === '') return true;
                          const searchTerm = dealDetailsSearchTerm.toLowerCase().trim();
                          return (
                            (deal.deal_name?.toLowerCase() || '').includes(searchTerm) ||
                            (deal.account_name?.toLowerCase() || '').includes(searchTerm) ||
                            (deal.deal_owner?.toLowerCase() || '').includes(searchTerm)
                          );
                        })
                        .map((deal) => {
                          const probability = deal.deal_probability || deal.probability || 0;
                          const expectedAmount = deal.expected_revenue || (deal.amount || 0) * (probability / 100);
                          return (
                        <tr key={deal.deal_id} className="sa-table-row">
                          <td style={{ width: '14%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <div style={{ fontWeight: 600, color: palette.ink }} title={deal.deal_name || 'N/A'}>
                              {deal.deal_name || 'N/A'}
                            </div>
                          </td>
                          <td style={{ width: '12%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <div style={{ color: palette.ink }} title={deal.account_name || 'N/A'}>
                              {deal.account_name || 'N/A'}
                            </div>
                          </td>
                          <td style={{ width: '10%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <div style={{ color: palette.ink, fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={deal.account_number}>
                              #{deal.account_number}
                            </div>
                          </td>
                          <td style={{ width: '12%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <div style={{ color: palette.ink }} title={deal.contact_name || 'N/A'}>
                              {deal.contact_name || 'N/A'}
                            </div>
                          </td>
                          <td style={{ width: '10%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <div style={{ fontSize: '14px', fontWeight: 700, color: palette.growth }} title={formatCurrency(deal.amount || 0)}>
                              {formatCurrency(deal.amount || 0)}
                            </div>
                          </td>
                          <td style={{ width: '8%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <div style={{ fontSize: '13px', fontWeight: 600, color: palette.ink }} title={`${probability}%`}>
                              {probability}%
                            </div>
                          </td>
                          <td style={{ width: '10%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <div style={{ fontSize: '14px', fontWeight: 700, color: palette.slate }} title={formatCurrency(expectedAmount)}>
                              {formatCurrency(expectedAmount)}
                            </div>
                          </td>
                          <td style={{ width: '10%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <div style={{
                              display: 'inline-block',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              fontWeight: 600,
                              background: deal.stage === 'Closed Won' ? '#DCFCE7' :
                                       deal.stage === 'Closed Lost' ? '#FEE2E2' : '#FEF3C7',
                              color: deal.stage === 'Closed Won' ? '#166534' :
                                     deal.stage === 'Closed Lost' ? '#991B1B' : '#92400E'
                            }} title={deal.stage || 'N/A'}>
                              {deal.stage || 'N/A'}
                            </div>
                          </td>
                          <td style={{ width: '12%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <div style={{ fontWeight: 600, color: palette.ink }} title={deal.deal_owner || 'N/A'}>
                              {deal.deal_owner || 'N/A'}
                            </div>
                          </td>
                          <td style={{ width: '12%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <div
                                style={{
                                  color: hasClosingDateHistory(deal.lead_id, deal.account_id) ? '#3B82F6' : palette.inkSoft,
                                  fontSize: '12px',
                                  cursor: hasClosingDateHistory(deal.lead_id, deal.account_id) ? 'pointer' : 'default',
                                  textDecoration: hasClosingDateHistory(deal.lead_id, deal.account_id) ? 'underline' : 'none'
                                }}
                                title={deal.closing_date || 'N/A'}
                                onClick={() => hasClosingDateHistory(deal.lead_id, deal.account_id) && handleClosingDateClick(deal, deal.deal_name)}
                              >
                                {formatDate(deal.closing_date)}
                              </div>
                              <Edit
                                size={14}
                                style={{ cursor: 'pointer', color: palette.inkSoft, flexShrink: 0 }}
                                onClick={() => handleClosingDateEdit(deal)}
                                title="Edit Closing Date"
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })
                    ) : (
                      <tr>
                        <td colSpan="10" style={{ textAlign: 'center', padding: '40px', color: palette.inkSoft }}>
                          No deal details found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Invoiced Details Table */}
          {showInvoicedDetails && (
            <div 
              className="sa-table-card" 
              style={{ 
                marginTop: '24px', 
                display: 'flex', 
                flexDirection: 'column',
                animation: 'frFadeUp 0.4s ease both'
              }}
            >
              {/* Table Header */}
              <div
                style={{
                  padding: '20px 24px',
                  borderBottom: `1px solid ${palette.border}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <h3
                    className="fr-display"
                    style={{
                      fontSize: '18px',
                      fontWeight: 500,
                      color: palette.ink,
                      margin: 0
                    }}
                  >
                    Invoiced Details
                  </h3>
                  <p
                    className="fr-body"
                    style={{
                      fontSize: '13px',
                      color: palette.inkSoft,
                      margin: '4px 0 0 0'
                    }}
                  >
                    Total Invoiced: {invoicedDetailsData?.length || 0} | Month: {selectedMonth}
                  </p>
                </div>
                <button
                  onClick={() => setShowInvoicedDetails(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '8px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background 0.15s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = palette.canvas}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                >
                  <X size={20} color={palette.inkSoft} />
                </button>
              </div>

              {/* Search Bar */}
              <div
                style={{
                  padding: '16px 24px',
                  borderBottom: `1px solid ${palette.border}`
                }}
              >
                <div
                  style={{
                    position: 'relative',
                    maxWidth: '400px'
                  }}
                >
                  <Search
                    size={16}
                    color={palette.inkFaint}
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)'
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Search by deal name, contact, or owner..."
                    value={invoicedDetailsSearchTerm}
                    onChange={(e) => setInvoicedDetailsSearchTerm(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 40px',
                      border: `1px solid ${palette.border}`,
                      borderRadius: '8px',
                      fontSize: '13px',
                      outline: 'none',
                      background: palette.canvas,
                      color: palette.ink,
                      fontFamily: 'var(--font-mono), monospace'
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = palette.growth}
                    onBlur={(e) => e.currentTarget.style.borderColor = palette.border}
                  />
                </div>
              </div>

              {/* Table Content */}
              <div style={{ flex: '1 1 0%', overflow: 'auto', padding: '20px', background: 'rgb(245, 245, 245)' }}>
                <table className="sa-table">
                  <thead>
                    <tr>
                      <th style={{ width: '20%' }} title="Deal Name">Deal Name</th>
                      <th style={{ width: '14%' }} title="Contact Name">Contact Name</th>
                      <th style={{ width: '12%' }} title="Amount">Amount</th>
                      <th style={{ width: '8%' }} title="Probability">Probability</th>
                      <th style={{ width: '10%' }} title="Expected Amount">Expected Amount</th>
                      <th style={{ width: '12%' }} title="Stage">Stage</th>
                      <th style={{ width: '14%' }} title="Deal Owner">Deal Owner</th>
                      <th style={{ width: '12%' }} title="Closing Date">Closing Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoicedDetailsLoading ? (
                      <tr>
                        <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: palette.inkSoft }}>
                          <RefreshCw size={24} className="fr-spin" style={{ margin: '0 auto 12px', display: 'block' }} />
                          Loading invoiced details...
                        </td>
                      </tr>
                    ) : invoicedDetailsData && invoicedDetailsData.length > 0 ? (
                      invoicedDetailsData
                        .filter(invoice => {
                          if (invoicedDetailsSearchTerm === '') return true;
                          const searchTerm = invoicedDetailsSearchTerm.toLowerCase().trim();
                          return (
                            (invoice.deal_name?.toLowerCase() || '').includes(searchTerm) ||
                            (invoice.contact_name?.toLowerCase() || '').includes(searchTerm) ||
                            (invoice.deal_owner?.toLowerCase() || '').includes(searchTerm)
                          );
                        })
                        .map((invoice) => {
                          const probability = invoice.deal_probability || invoice.probability || 0;
                          const expectedAmount = invoice.expected_revenue || (invoice.amount || 0) * (probability / 100);
                          return (
                        <tr key={invoice.deal_id} className="sa-table-row">
                          <td style={{ width: '18%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <div style={{ fontWeight: 600, color: palette.ink }} title={invoice.deal_name || 'N/A'}>
                              {invoice.deal_name || 'N/A'}
                            </div>
                          </td>
                          <td style={{ width: '14%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <div style={{ color: palette.ink }} title={invoice.contact_name || 'N/A'}>
                              {invoice.contact_name || 'N/A'}
                            </div>
                          </td>
                          <td style={{ width: '12%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <div style={{ fontSize: '14px', fontWeight: 700, color: palette.amberDeep }} title={formatCurrency(invoice.amount || 0)}>
                              {formatCurrency(invoice.amount || 0)}
                            </div>
                          </td>
                          <td style={{ width: '8%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <div style={{ fontSize: '13px', fontWeight: 600, color: palette.ink }} title={`${probability}%`}>
                              {probability}%
                            </div>
                          </td>
                          <td style={{ width: '10%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <div style={{ fontSize: '14px', fontWeight: 700, color: palette.slate }} title={formatCurrency(expectedAmount)}>
                              {formatCurrency(expectedAmount)}
                            </div>
                          </td>
                          <td style={{ width: '12%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <div style={{
                              display: 'inline-block',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              fontWeight: 600,
                              background: invoice.stage === 'Invoiced' ? '#DCFCE7' : '#FEF3C7',
                              color: invoice.stage === 'Invoiced' ? '#166534' : '#92400E'
                            }} title={invoice.stage || 'N/A'}>
                              {invoice.stage || 'N/A'}
                            </div>
                          </td>
                          <td style={{ width: '14%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <div style={{ fontWeight: 600, color: palette.ink }} title={invoice.deal_owner || 'N/A'}>
                              {invoice.deal_owner || 'N/A'}
                            </div>
                          </td>
                          <td style={{ width: '12%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <div
                                style={{
                                  color: hasClosingDateHistory(invoice.lead_id, invoice.account_id) ? '#3B82F6' : palette.inkSoft,
                                  fontSize: '12px',
                                  cursor: hasClosingDateHistory(invoice.lead_id, invoice.account_id) ? 'pointer' : 'default',
                                  textDecoration: hasClosingDateHistory(invoice.lead_id, invoice.account_id) ? 'underline' : 'none'
                                }}
                                title={invoice.closing_date || 'N/A'}
                                onClick={() => hasClosingDateHistory(invoice.lead_id, invoice.account_id) && handleClosingDateClick(invoice, invoice.deal_name)}
                              >
                                {formatDate(invoice.closing_date)}
                              </div>
                              <Edit
                                size={14}
                                style={{ cursor: 'pointer', color: palette.inkSoft, flexShrink: 0 }}
                                onClick={() => handleClosingDateEdit(invoice)}
                                title="Edit Closing Date"
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })
                    ) : (
                      <tr>
                        <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: palette.inkSoft }}>
                          No invoiced details found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Payment Received Details Table */}
          {showPaymentReceivedDetails && (
            <div 
              className="sa-table-card" 
              style={{ 
                marginTop: '24px', 
                display: 'flex', 
                flexDirection: 'column',
                animation: 'frFadeUp 0.4s ease both'
              }}
            >
              {/* Table Header */}
              <div
                style={{
                  padding: '20px 24px',
                  borderBottom: `1px solid ${palette.border}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <h3
                    className="fr-display"
                    style={{
                      fontSize: '18px',
                      fontWeight: 500,
                      color: palette.ink,
                      margin: 0
                    }}
                  >
                    Paid Amount Details
                  </h3>
                  <p
                    className="fr-body"
                    style={{
                      fontSize: '13px',
                      color: palette.inkSoft,
                      margin: '4px 0 0 0'
                    }}
                  >
                    Total Payments: {paymentReceivedDetailsData?.length || 0} | Month: {selectedMonth}
                  </p>
                </div>
                <button
                  onClick={() => setShowPaymentReceivedDetails(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '8px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background 0.15s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = palette.canvas}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                >
                  <X size={20} color={palette.inkSoft} />
                </button>
              </div>

              {/* Search Bar */}
              <div
                style={{
                  padding: '16px 24px',
                  borderBottom: `1px solid ${palette.border}`
                }}
              >
                <div
                  style={{
                    position: 'relative',
                    maxWidth: '400px'
                  }}
                >
                  <Search
                    size={16}
                    color={palette.inkFaint}
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)'
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Search by deal name, contact, or owner..."
                    value={paymentReceivedDetailsSearchTerm}
                    onChange={(e) => setPaymentReceivedDetailsSearchTerm(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 40px',
                      border: `1px solid ${palette.border}`,
                      borderRadius: '8px',
                      fontSize: '13px',
                      outline: 'none',
                      background: palette.canvas,
                      color: palette.ink,
                      fontFamily: 'var(--font-mono), monospace'
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = palette.growth}
                    onBlur={(e) => e.currentTarget.style.borderColor = palette.border}
                  />
                </div>
              </div>

              {/* Table Content */}
              <div style={{ flex: '1 1 0%', overflow: 'auto', padding: '20px', background: 'rgb(245, 245, 245)' }}>
                <table className="sa-table">
                  <thead>
                    <tr>
                      <th style={{ width: '20%' }} title="Deal Name">Deal Name</th>
                      <th style={{ width: '14%' }} title="Contact Name">Contact Name</th>
                      <th style={{ width: '12%' }} title="Amount">Amount</th>
                      <th style={{ width: '8%' }} title="Probability">Probability</th>
                      <th style={{ width: '10%' }} title="Expected Amount">Expected Amount</th>
                      <th style={{ width: '12%' }} title="Stage">Stage</th>
                      <th style={{ width: '14%' }} title="Deal Owner">Deal Owner</th>
                      <th style={{ width: '12%' }} title="Closing Date">Closing Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentReceivedDetailsLoading ? (
                      <tr>
                        <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: palette.inkSoft }}>
                          <RefreshCw size={24} className="fr-spin" style={{ margin: '0 auto 12px', display: 'block' }} />
                          Loading paid amount details...
                        </td>
                      </tr>
                    ) : paymentReceivedDetailsData && paymentReceivedDetailsData.length > 0 ? (
                      paymentReceivedDetailsData
                        .filter(payment => {
                          if (paymentReceivedDetailsSearchTerm === '') return true;
                          const searchTerm = paymentReceivedDetailsSearchTerm.toLowerCase().trim();
                          return (
                            (payment.deal_name?.toLowerCase() || '').includes(searchTerm) ||
                            (payment.contact_name?.toLowerCase() || '').includes(searchTerm) ||
                            (payment.deal_owner?.toLowerCase() || '').includes(searchTerm)
                          );
                        })
                        .map((payment) => {
                          const probability = payment.deal_probability || payment.probability || 0;
                          const expectedAmount = payment.expected_revenue || (payment.amount || 0) * (probability / 100);
                          return (
                        <tr key={payment.deal_id} className="sa-table-row">
                          <td style={{ width: '18%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <div style={{ fontWeight: 600, color: palette.ink }} title={payment.deal_name || 'N/A'}>
                              {payment.deal_name || 'N/A'}
                            </div>
                          </td>
                          <td style={{ width: '14%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <div style={{ color: palette.ink }} title={payment.contact_name || 'N/A'}>
                              {payment.contact_name || 'N/A'}
                            </div>
                          </td>
                          <td style={{ width: '12%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <div style={{ fontSize: '14px', fontWeight: 700, color: palette.teal }} title={formatCurrency(payment.amount || 0)}>
                              {formatCurrency(payment.amount || 0)}
                            </div>
                          </td>
                          <td style={{ width: '8%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <div style={{ fontSize: '13px', fontWeight: 600, color: palette.ink }} title={`${probability}%`}>
                              {probability}%
                            </div>
                          </td>
                          <td style={{ width: '10%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <div style={{ fontSize: '14px', fontWeight: 700, color: palette.slate }} title={formatCurrency(expectedAmount)}>
                              {formatCurrency(expectedAmount)}
                            </div>
                          </td>
                          <td style={{ width: '12%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <div style={{
                              display: 'inline-block',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              fontWeight: 600,
                              background: payment.stage === 'Paid' ? '#DCFCE7' : '#FEF3C7',
                              color: payment.stage === 'Paid' ? '#166534' : '#92400E'
                            }} title={payment.stage || 'N/A'}>
                              {payment.stage || 'N/A'}
                            </div>
                          </td>
                          <td style={{ width: '14%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <div style={{ fontWeight: 600, color: palette.ink }} title={payment.deal_owner || 'N/A'}>
                              {payment.deal_owner || 'N/A'}
                            </div>
                          </td>
                          <td style={{ width: '12%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <div
                                style={{
                                  color: hasClosingDateHistory(payment.lead_id, payment.account_id) ? '#3B82F6' : palette.inkSoft,
                                  fontSize: '12px',
                                  cursor: hasClosingDateHistory(payment.lead_id, payment.account_id) ? 'pointer' : 'default',
                                  textDecoration: hasClosingDateHistory(payment.lead_id, payment.account_id) ? 'underline' : 'none'
                                }}
                                title={payment.closing_date || 'N/A'}
                                onClick={() => hasClosingDateHistory(payment.lead_id, payment.account_id) && handleClosingDateClick(payment, payment.deal_name)}
                              >
                                {formatDate(payment.closing_date)}
                              </div>
                              <Edit
                                size={14}
                                style={{ cursor: 'pointer', color: palette.inkSoft, flexShrink: 0 }}
                                onClick={() => handleClosingDateEdit(payment)}
                                title="Edit Closing Date"
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })
                    ) : (
                      <tr>
                        <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: palette.inkSoft }}>
                          No paid amount details found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Total Paid Details Table */}
          {showTotalPaidDetails && (
            <div 
              className="sa-table-card" 
              style={{ 
                marginTop: '24px', 
                display: 'flex', 
                flexDirection: 'column',
                animation: 'frFadeUp 0.4s ease both'
              }}
            >
              {/* Table Header */}
              <div
                style={{
                  padding: '20px 24px',
                  borderBottom: `1px solid ${palette.border}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <h3
                    className="fr-display"
                    style={{
                      fontSize: '18px',
                      fontWeight: 500,
                      color: palette.ink,
                      margin: 0
                    }}
                  >
                    Total Paid Details
                  </h3>
                  <p
                    className="fr-body"
                    style={{
                      fontSize: '13px',
                      color: palette.inkSoft,
                      margin: '4px 0 0 0'
                    }}
                  >
                    Total Paid: {totalPaidDetailsData?.length || 0} | Month: {selectedMonth}
                  </p>
                </div>
                <button
                  onClick={() => setShowTotalPaidDetails(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '8px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background 0.15s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = palette.canvas}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                >
                  <X size={20} color={palette.inkSoft} />
                </button>
              </div>

              {/* Search Bar */}
              <div
                style={{
                  padding: '16px 24px',
                  borderBottom: `1px solid ${palette.border}`
                }}
              >
                <div
                  style={{
                    position: 'relative',
                    maxWidth: '400px'
                  }}
                >
                  <Search
                    size={16}
                    color={palette.inkFaint}
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)'
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Search by deal name, contact, or owner..."
                    value={totalPaidDetailsSearchTerm}
                    onChange={(e) => setTotalPaidDetailsSearchTerm(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 40px',
                      border: `1px solid ${palette.border}`,
                      borderRadius: '8px',
                      fontSize: '13px',
                      outline: 'none',
                      background: palette.canvas,
                      color: palette.ink,
                      fontFamily: 'var(--font-mono), monospace'
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = palette.growth}
                    onBlur={(e) => e.currentTarget.style.borderColor = palette.border}
                  />
                </div>
              </div>

              {/* Table Content */}
              <div style={{ flex: '1 1 0%', overflow: 'auto', padding: '20px', background: 'rgb(245, 245, 245)' }}>
                <table className="sa-table">
                  <thead>
                    <tr>
                      <th style={{ width: '16%' }} title="Deal Name">Deal Name</th>
                      <th style={{ width: '12%' }} title="Contact Name">Contact Name</th>
                      <th style={{ width: '10%' }} title="Amount">Amount</th>
                      <th style={{ width: '8%' }} title="Probability">Probability</th>
                      <th style={{ width: '10%' }} title="Expected Amount">Expected Amount</th>
                      <th style={{ width: '10%' }} title="Stage">Stage</th>
                      <th style={{ width: '12%' }} title="Deal Owner">Deal Owner</th>
                      <th style={{ width: '12%' }} title="Closing Date">Closing Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {totalPaidDetailsLoading ? (
                      <tr>
                        <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: palette.inkSoft }}>
                          <RefreshCw size={24} className="fr-spin" style={{ margin: '0 auto 12px', display: 'block' }} />
                          Loading total paid details...
                        </td>
                      </tr>
                    ) : totalPaidDetailsData && totalPaidDetailsData.length > 0 ? (
                      totalPaidDetailsData
                        .filter(paid => {
                          if (totalPaidDetailsSearchTerm === '') return true;
                          const searchTerm = totalPaidDetailsSearchTerm.toLowerCase().trim();
                          return (
                            (paid.deal_name?.toLowerCase() || '').includes(searchTerm) ||
                            (paid.contact_name?.toLowerCase() || '').includes(searchTerm) ||
                            (paid.deal_owner?.toLowerCase() || '').includes(searchTerm)
                          );
                        })
                        .map((paid) => {
                          const probability = paid.deal_probability || paid.probability || 0;
                          const expectedAmount = paid.expected_revenue || (paid.amount || 0) * (probability / 100);
                          return (
                        <tr key={paid.deal_id} className="sa-table-row">
                          <td style={{ width: '14%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <div style={{ fontWeight: 600, color: palette.ink }} title={paid.deal_name || 'N/A'}>
                              {paid.deal_name || 'N/A'}
                            </div>
                          </td>
                          <td style={{ width: '12%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <div style={{ color: palette.ink }} title={paid.contact_name || 'N/A'}>
                              {paid.contact_name || 'N/A'}
                            </div>
                          </td>
                          <td style={{ width: '10%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <div style={{ fontSize: '14px', fontWeight: 700, color: palette.growth }} title={formatCurrency(paid.amount || 0)}>
                              {formatCurrency(paid.amount || 0)}
                            </div>
                          </td>
                          <td style={{ width: '8%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <div style={{ fontSize: '13px', fontWeight: 600, color: palette.ink }} title={`${probability}%`}>
                              {probability}%
                            </div>
                          </td>
                          <td style={{ width: '10%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <div style={{ fontSize: '14px', fontWeight: 700, color: palette.slate }} title={formatCurrency(expectedAmount)}>
                              {formatCurrency(expectedAmount)}
                            </div>
                          </td>
                          <td style={{ width: '10%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <div style={{
                              display: 'inline-block',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              fontWeight: 600,
                              background: paid.stage === 'Paid' ? '#DCFCE7' : '#FEF3C7',
                              color: paid.stage === 'Paid' ? '#166534' : '#92400E'
                            }} title={paid.stage || 'N/A'}>
                              {paid.stage || 'N/A'}
                            </div>
                          </td>
                          <td style={{ width: '12%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <div style={{ fontWeight: 600, color: palette.ink }} title={paid.deal_owner || 'N/A'}>
                              {paid.deal_owner || 'N/A'}
                            </div>
                          </td>
                          <td style={{ width: '12%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <div
                                style={{
                                  color: hasClosingDateHistory(paid.lead_id, paid.account_id) ? '#3B82F6' : palette.inkSoft,
                                  fontSize: '12px',
                                  cursor: hasClosingDateHistory(paid.lead_id, paid.account_id) ? 'pointer' : 'default',
                                  textDecoration: hasClosingDateHistory(paid.lead_id, paid.account_id) ? 'underline' : 'none'
                                }}
                                title={paid.closing_date || 'N/A'}
                                onClick={() => hasClosingDateHistory(paid.lead_id, paid.account_id) && handleClosingDateClick(paid, paid.deal_name)}
                              >
                                {formatDate(paid.closing_date)}
                              </div>
                              <Edit
                                size={14}
                                style={{ cursor: 'pointer', color: palette.inkSoft, flexShrink: 0 }}
                                onClick={() => handleClosingDateEdit(paid)}
                                title="Edit Closing Date"
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })
                    ) : (
                      <tr>
                        <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: palette.inkSoft }}>
                          No total paid details found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Overdue Details Table */}
          {showOverdueDetails && (
            <div 
              className="sa-table-card" 
              style={{ 
                marginTop: '24px', 
                display: 'flex', 
                flexDirection: 'column',
                animation: 'frFadeUp 0.4s ease both'
              }}
            >
              {/* Table Header */}
              <div
                style={{
                  padding: '20px 24px',
                  borderBottom: `1px solid ${palette.border}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <h3
                    className="fr-display"
                    style={{
                      fontSize: '18px',
                      fontWeight: 500,
                      color: palette.ink,
                      margin: 0
                    }}
                  >
                    Overdue Deals Details
                  </h3>
                  <p
                    className="fr-body"
                    style={{
                      fontSize: '13px',
                      color: palette.inkSoft,
                      margin: '4px 0 0 0'
                    }}
                  >
                    Total Overdue: {overdueDetailsData?.length || 0} | Month: {selectedMonth}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={() => setOverdueSortOrder(overdueSortOrder === 'latest' ? 'oldest' : 'latest')}
                    style={{
                      background: palette.canvas,
                      border: `1px solid ${palette.border}`,
                      cursor: 'pointer',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'background 0.15s',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: palette.ink,
                      fontFamily: 'var(--font-mono), monospace'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#e8e8e8'}
                    onMouseLeave={(e) => e.currentTarget.style.background = palette.canvas}
                  >
                    {overdueSortOrder === 'latest' ? 'Latest First' : 'Oldest First'}
                  </button>
                  <button
                    onClick={() => setShowOverdueDetails(false)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '8px',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'background 0.15s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = palette.canvas}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                  >
                    <X size={20} color={palette.inkSoft} />
                  </button>
                </div>
              </div>

              {/* Search Bar */}
              <div
                style={{
                  padding: '16px 24px',
                  borderBottom: `1px solid ${palette.border}`
                }}
              >
                <div
                  style={{
                    position: 'relative',
                    maxWidth: '400px'
                  }}
                >
                  <Search
                    size={16}
                    color={palette.inkFaint}
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)'
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Search by deal name, contact, or owner..."
                    value={overdueDetailsSearchTerm}
                    onChange={(e) => setOverdueDetailsSearchTerm(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 40px',
                      border: `1px solid ${palette.border}`,
                      borderRadius: '8px',
                      fontSize: '13px',
                      outline: 'none',
                      background: palette.canvas,
                      color: palette.ink,
                      fontFamily: 'var(--font-mono), monospace'
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = palette.growth}
                    onBlur={(e) => e.currentTarget.style.borderColor = palette.border}
                  />
                </div>
              </div>

              {/* Table Content */}
              <div style={{ flex: '1 1 0%', overflow: 'auto', padding: '20px', background: 'rgb(245, 245, 245)' }}>
                <table className="sa-table">
                  <thead>
                    <tr>
                      <th style={{ width: '20%' }} title="Deal Name">Deal Name</th>
                      <th style={{ width: '15%' }} title="Contact Name">Contact Name</th>
                      <th style={{ width: '15%' }} title="Account Number">Account Number</th>
                      <th style={{ width: '15%' }} title="Amount">Amount</th>
                      <th style={{ width: '10%' }} title="Probability">Probability</th>
                      <th style={{ width: '10%' }} title="Expected Revenue">Expected Revenue</th>
                      <th style={{ width: '15%' }} title="Stage">Stage</th>
                      <th style={{ width: '15%' }} title="Deal Owner">Deal Owner</th>
                      <th style={{ width: '15%' }} title="Closing Date">Closing Date</th>
                      <th style={{ width: '15%' }} title="Overdue Days">Overdue Days</th>
                    </tr>
                  </thead>
                  <tbody>
                    {overdueDetailsLoading ? (
                      <tr>
                        <td colSpan="10" style={{ textAlign: 'center', padding: '40px', color: palette.inkSoft }}>
                          <RefreshCw size={24} className="fr-spin" style={{ margin: '0 auto 12px', display: 'block' }} />
                          Loading overdue details...
                        </td>
                      </tr>
                    ) : overdueDetailsData && overdueDetailsData.length > 0 ? (
                      sortOverdueDetails(overdueDetailsData)
                        .filter(overdue => {
                          if (overdueDetailsSearchTerm === '') return true;
                          const searchTerm = overdueDetailsSearchTerm.toLowerCase().trim();
                          return (
                            (overdue.deal_name?.toLowerCase() || '').includes(searchTerm) ||
                            (overdue.contact_name?.toLowerCase() || '').includes(searchTerm) ||
                            (overdue.deal_owner?.toLowerCase() || '').includes(searchTerm)
                          );
                        })
                        .map((overdue) => {
                          const probability = overdue.deal_probability || overdue.probability || 0;
                          const expectedRevenue = overdue.expected_revenue || (overdue.amount || 0) * (probability / 100);
                          return (
                        <tr key={overdue.deal_id} className="sa-table-row">
                          <td style={{ width: '15%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <div style={{ fontWeight: 600, color: palette.ink }} title={overdue.deal_name || 'N/A'}>
                              {overdue.deal_name || 'N/A'}
                            </div>
                          </td>
                          <td style={{ width: '13%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <div style={{ color: palette.ink }} title={overdue.contact_name || 'N/A'}>
                              {overdue.contact_name || 'N/A'}
                            </div>
                          </td>
                          <td style={{ width: '10%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <div style={{ color: palette.ink, fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={overdue.account_number}>
                              #{overdue.account_number}
                            </div>
                          </td>
                          <td style={{ width: '11%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <div style={{ fontSize: '14px', fontWeight: 700, color: palette.rust }} title={formatCurrency(overdue.amount || 0)}>
                              {formatCurrency(overdue.amount || 0)}
                            </div>
                          </td>
                          <td style={{ width: '8%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <div style={{ fontSize: '13px', fontWeight: 600, color: palette.ink }} title={`${probability}%`}>
                              {probability}%
                            </div>
                          </td>
                          <td style={{ width: '10%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <div style={{ fontSize: '14px', fontWeight: 700, color: palette.slate }} title={formatCurrency(expectedRevenue)}>
                              {formatCurrency(expectedRevenue)}
                            </div>
                          </td>
                          <td style={{ width: '11%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <div style={{
                              display: 'inline-block',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              fontWeight: 600,
                              background: overdue.stage === 'Closed Won' ? '#DCFCE7' :
                                       overdue.stage === 'Closed Lost' ? '#FEE2E2' : '#FEF3C7',
                              color: overdue.stage === 'Closed Won' ? '#166534' :
                                     overdue.stage === 'Closed Lost' ? '#991B1B' : '#92400E'
                            }} title={overdue.stage || 'N/A'}>
                              {overdue.stage || 'N/A'}
                            </div>
                          </td>
                          <td style={{ width: '13%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <div style={{ fontWeight: 600, color: palette.ink }} title={overdue.deal_owner || 'N/A'}>
                              {overdue.deal_owner || 'N/A'}
                            </div>
                          </td>
                          <td style={{ width: '11%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <div
                                style={{
                                  color: hasClosingDateHistory(overdue.lead_id, overdue.account_id) ? '#3B82F6' : palette.inkSoft,
                                  fontSize: '12px',
                                  cursor: hasClosingDateHistory(overdue.lead_id, overdue.account_id) ? 'pointer' : 'default',
                                  textDecoration: hasClosingDateHistory(overdue.lead_id, overdue.account_id) ? 'underline' : 'none'
                                }}
                                title={overdue.closing_date || 'N/A'}
                                onClick={() => hasClosingDateHistory(overdue.lead_id, overdue.account_id) && handleClosingDateClick(overdue, overdue.deal_name)}
                              >
                                {formatDate(overdue.closing_date)}
                              </div>
                              <Edit
                                size={14}
                                style={{ cursor: 'pointer', color: palette.inkSoft, flexShrink: 0 }}
                                onClick={() => handleClosingDateEdit(overdue)}
                                title="Edit Closing Date"
                              />
                            </div>
                          </td>
                          <td style={{ width: '11%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <div style={{
                              display: 'inline-block',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              fontWeight: 600,
                              background: overdue.overdue_days > 90 ? '#FEE2E2' :
                                       overdue.overdue_days > 30 ? '#FEF3C7' : '#DCFCE7',
                              color: overdue.overdue_days > 90 ? '#991B1B' :
                                     overdue.overdue_days > 30 ? '#92400E' : '#166534'
                            }} title={`${overdue.overdue_days || 0} days`}>
                              {overdue.overdue_days || 0} days
                            </div>
                          </td>
                        </tr>
                      );
                    })
                    ) : (
                      <tr>
                        <td colSpan="10" style={{ textAlign: 'center', padding: '40px', color: palette.inkSoft }}>
                          No overdue details found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Total Deal Amount Details Table */}
          {showTotalDealAmountDetails && (
            <div 
              className="sa-table-card" 
              style={{ 
                marginTop: '24px', 
                display: 'flex', 
                flexDirection: 'column',
                animation: 'frFadeUp 0.4s ease both'
              }}
            >
              {/* Table Header */}
              <div
                style={{
                  padding: '20px 24px',
                  borderBottom: `1px solid ${palette.border}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <h3
                    className="fr-display"
                    style={{
                      fontSize: '18px',
                      fontWeight: 500,
                      color: palette.ink,
                      margin: 0
                    }}
                  >
                    Total Deal Amount Details
                  </h3>
                  <p
                    className="fr-body"
                    style={{
                      fontSize: '13px',
                      color: palette.inkSoft,
                      margin: '4px 0 0 0'
                    }}
                  >
                    Total Deals: {totalDealAmountDetailsData?.length || 0} | Month: {selectedMonth}
                  </p>
                </div>
                <button
                  onClick={() => setShowTotalDealAmountDetails(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '8px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background 0.15s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = palette.canvas}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                >
                  <X size={20} color={palette.inkSoft} />
                </button>
              </div>

              {/* Search Bar */}
              <div
                style={{
                  padding: '16px 24px',
                  borderBottom: `1px solid ${palette.border}`
                }}
              >
                <div
                  style={{
                    position: 'relative',
                    maxWidth: '400px'
                  }}
                >
                  <Search
                    size={16}
                    color={palette.inkFaint}
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)'
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Search by deal name, account, contact, or owner..."
                    value={totalDealAmountDetailsSearchTerm}
                    onChange={(e) => setTotalDealAmountDetailsSearchTerm(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 40px',
                      border: `1px solid ${palette.border}`,
                      borderRadius: '8px',
                      fontSize: '13px',
                      outline: 'none',
                      background: palette.canvas,
                      color: palette.ink,
                      fontFamily: 'var(--font-mono), monospace'
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = palette.growth}
                    onBlur={(e) => e.currentTarget.style.borderColor = palette.border}
                  />
                </div>
              </div>

              {/* Table Content */}
              <div style={{ flex: '1 1 0%', overflow: 'auto', padding: '20px', background: 'rgb(245, 245, 245)' }}>
                <table className="sa-table">
                  <thead>
                    <tr>
                      <th style={{ width: '16%' }} title="Deal Name">Deal Name</th>
                      <th style={{ width: '12%' }} title="Account Name">Account Name</th>
                      <th style={{ width: '10%' }} title="Account Number">Account Number</th>
                      <th style={{ width: '12%' }} title="Contact Name">Contact Name</th>
                      <th style={{ width: '10%' }} title="Amount">Amount</th>
                      <th style={{ width: '8%' }} title="Probability">Probability</th>
                      <th style={{ width: '10%' }} title="Expected Amount">Expected Amount</th>
                      <th style={{ width: '10%' }} title="Stage">Stage</th>
                      <th style={{ width: '12%' }} title="Deal Owner">Deal Owner</th>
                      <th style={{ width: '12%' }} title="Closing Date">Closing Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {totalDealAmountDetailsLoading ? (
                      <tr>
                        <td colSpan="10" style={{ textAlign: 'center', padding: '40px', color: palette.inkSoft }}>
                          <RefreshCw size={24} className="fr-spin" style={{ margin: '0 auto 12px', display: 'block' }} />
                          Loading total deal amount details...
                        </td>
                      </tr>
                    ) : totalDealAmountDetailsData && totalDealAmountDetailsData.length > 0 ? (
                      totalDealAmountDetailsData
                        .filter(deal => {
                          if (totalDealAmountDetailsSearchTerm === '') return true;
                          const searchTerm = totalDealAmountDetailsSearchTerm.toLowerCase().trim();
                          return (
                            (deal.deal_name?.toLowerCase() || '').includes(searchTerm) ||
                            (deal.account_name?.toLowerCase() || '').includes(searchTerm) ||
                            (deal.contact_name?.toLowerCase() || '').includes(searchTerm) ||
                            (deal.deal_owner?.toLowerCase() || '').includes(searchTerm)
                          );
                        })
                        .map((deal) => {
                          const probability = deal.deal_probability || deal.probability || 0;
                          const expectedAmount = deal.expected_revenue || (deal.amount || 0) * (probability / 100);
                          return (
                        <tr key={deal.deal_id} className="sa-table-row">
                          <td style={{ width: '14%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <div style={{ fontWeight: 600, color: palette.ink }} title={deal.deal_name || 'N/A'}>
                              {deal.deal_name || 'N/A'}
                            </div>
                          </td>
                          <td style={{ width: '12%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <div style={{ color: palette.ink }} title={deal.account_name || 'N/A'}>
                              {deal.account_name || 'N/A'}
                            </div>
                          </td>
                          <td style={{ width: '10%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <div style={{ color: palette.ink, fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={deal.account_number}>
                              #{deal.account_number}
                            </div>
                          </td>
                          <td style={{ width: '12%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <div style={{ color: palette.ink }} title={deal.contact_name || 'N/A'}>
                              {deal.contact_name || 'N/A'}
                            </div>
                          </td>
                          <td style={{ width: '10%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <div style={{ fontSize: '14px', fontWeight: 700, color: palette.growth }} title={formatCurrency(deal.amount || 0)}>
                              {formatCurrency(deal.amount || 0)}
                            </div>
                          </td>
                          <td style={{ width: '8%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <div style={{ fontSize: '13px', fontWeight: 600, color: palette.ink }} title={`${probability}%`}>
                              {probability}%
                            </div>
                          </td>
                          <td style={{ width: '10%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <div style={{ fontSize: '14px', fontWeight: 700, color: palette.slate }} title={formatCurrency(expectedAmount)}>
                              {formatCurrency(expectedAmount)}
                            </div>
                          </td>
                          <td style={{ width: '10%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <div style={{
                              display: 'inline-block',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              fontWeight: 600,
                              background: deal.stage === 'Closed Won' ? '#DCFCE7' :
                                       deal.stage === 'Closed Lost' ? '#FEE2E2' :
                                       deal.stage === 'Paid' ? '#DCFCE7' :
                                       deal.stage === 'Invoiced' ? '#FEF3C7' :
                                       deal.stage === 'Proposal' ? '#E0F2FE' :
                                       deal.stage === 'Negotiation' ? '#FEF3C7' : '#F3F4F6',
                              color: deal.stage === 'Closed Won' ? '#166534' :
                                     deal.stage === 'Closed Lost' ? '#991B1B' :
                                     deal.stage === 'Paid' ? '#166534' :
                                     deal.stage === 'Invoiced' ? '#92400E' :
                                     deal.stage === 'Proposal' ? '#0369A1' :
                                     deal.stage === 'Negotiation' ? '#92400E' : '#374151'
                            }} title={deal.stage || 'N/A'}>
                              {deal.stage || 'N/A'}
                            </div>
                          </td>
                          <td style={{ width: '12%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <div style={{ fontWeight: 600, color: palette.ink }} title={deal.deal_owner || 'N/A'}>
                              {deal.deal_owner || 'N/A'}
                            </div>
                          </td>
                          <td style={{ width: '12%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <div
                                style={{
                                  color: hasClosingDateHistory(deal.lead_id, deal.account_id) ? '#3B82F6' : palette.inkSoft,
                                  fontSize: '12px',
                                  cursor: hasClosingDateHistory(deal.lead_id, deal.account_id) ? 'pointer' : 'default',
                                  textDecoration: hasClosingDateHistory(deal.lead_id, deal.account_id) ? 'underline' : 'none'
                                }}
                                title={deal.closing_date || 'N/A'}
                                onClick={() => hasClosingDateHistory(deal.lead_id, deal.account_id) && handleClosingDateClick(deal, deal.deal_name)}
                              >
                                {formatDate(deal.closing_date)}
                              </div>
                              <Edit
                                size={14}
                                style={{ cursor: 'pointer', color: palette.inkSoft, flexShrink: 0 }}
                                onClick={() => handleClosingDateEdit(deal)}
                                title="Edit Closing Date"
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })
                    ) : (
                      <tr>
                        <td colSpan="10" style={{ textAlign: 'center', padding: '40px', color: palette.inkSoft }}>
                          No total deal amount details found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Expected Revenue Details Table */}
          {showExpectedRevenueDetails && (
            <div
              className="sa-table-card"
              style={{
                marginTop: '24px',
                display: 'flex',
                flexDirection: 'column',
                animation: 'frFadeUp 0.4s ease both'
              }}
            >
              {/* Table Header */}
              <div
                style={{
                  padding: '20px 24px',
                  borderBottom: `1px solid ${palette.border}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <h3
                    className="fr-display"
                    style={{
                      fontSize: '18px',
                      fontWeight: 500,
                      color: palette.ink,
                      margin: 0
                    }}
                  >
                    Expected Revenue Details
                  </h3>
                  <p
                    className="fr-body"
                    style={{
                      fontSize: '13px',
                      color: palette.inkSoft,
                      margin: '4px 0 0 0'
                    }}
                  >
                    Total Deals: {expectedRevenueDetailsData?.length || 0} | Month: {selectedMonth} | Total Expected Revenue: {formatCurrency(totalExpectedRevenue)}
                  </p>
                </div>
                <button
                  onClick={() => setShowExpectedRevenueDetails(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '8px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background 0.15s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = palette.canvas}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                >
                  <X size={20} color={palette.inkSoft} />
                </button>
              </div>

              {/* Search Bar */}
              <div
                style={{
                  padding: '16px 24px',
                  borderBottom: `1px solid ${palette.border}`
                }}
              >
                <div
                  style={{
                    position: 'relative',
                    maxWidth: '400px'
                  }}
                >
                  <Search
                    size={16}
                    color={palette.inkFaint}
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)'
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Search by deal name, account, contact, or owner..."
                    value={expectedRevenueDetailsSearchTerm}
                    onChange={(e) => setExpectedRevenueDetailsSearchTerm(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 40px',
                      border: `1px solid ${palette.border}`,
                      borderRadius: '8px',
                      fontSize: '13px',
                      outline: 'none',
                      background: palette.canvas,
                      color: palette.ink,
                      fontFamily: 'var(--font-mono), monospace'
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = palette.growth}
                    onBlur={(e) => e.currentTarget.style.borderColor = palette.border}
                  />
                </div>
              </div>

              {/* Table Content */}
              <div style={{ flex: '1 1 0%', overflow: 'auto', padding: '20px', background: 'rgb(245, 245, 245)' }}>
                <table className="sa-table">
                  <thead>
                    <tr>
                      <th style={{ width: '16%' }} title="Deal Name">Deal Name</th>
                      <th style={{ width: '12%' }} title="Account Name">Account Name</th>
                      <th style={{ width: '10%' }} title="Account Number">Account Number</th>
                      <th style={{ width: '12%' }} title="Contact Name">Contact Name</th>
                      <th style={{ width: '10%' }} title="Amount">Amount</th>
                      <th style={{ width: '8%' }} title="Probability">Probability</th>
                      <th style={{ width: '10%' }} title="Expected Revenue">Expected Revenue</th>
                      <th style={{ width: '10%' }} title="Stage">Stage</th>
                      <th style={{ width: '12%' }} title="Deal Owner">Deal Owner</th>
                      <th style={{ width: '12%' }} title="Closing Date">Closing Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expectedRevenueDetailsLoading ? (
                      <tr>
                        <td colSpan="10" style={{ textAlign: 'center', padding: '40px', color: palette.inkSoft }}>
                          <RefreshCw size={24} className="fr-spin" style={{ margin: '0 auto 12px', display: 'block' }} />
                          Loading expected revenue details...
                        </td>
                      </tr>
                    ) : expectedRevenueDetailsData && expectedRevenueDetailsData.length > 0 ? (
                      expectedRevenueDetailsData
                        .filter(deal => {
                          if (expectedRevenueDetailsSearchTerm === '') return true;
                          const searchTerm = expectedRevenueDetailsSearchTerm.toLowerCase().trim();
                          return (
                            (deal.deal_name?.toLowerCase() || '').includes(searchTerm) ||
                            (deal.account_name?.toLowerCase() || '').includes(searchTerm) ||
                            (deal.contact_name?.toLowerCase() || '').includes(searchTerm) ||
                            (deal.deal_owner?.toLowerCase() || '').includes(searchTerm)
                          );
                        })
                        .map((deal) => {
                          const probability = deal.deal_probability || 0;
                          const expectedRevenue = deal.expected_revenue || 0;
                          return (
                        <tr key={deal.deal_id} className="sa-table-row">
                          <td style={{ width: '14%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <div style={{ fontWeight: 600, color: palette.ink }} title={deal.deal_name || 'N/A'}>
                              {deal.deal_name || 'N/A'}
                            </div>
                          </td>
                          <td style={{ width: '12%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <div style={{ color: palette.ink }} title={deal.account_name || 'N/A'}>
                              {deal.account_name || 'N/A'}
                            </div>
                          </td>
                          <td style={{ width: '10%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <div style={{ color: palette.ink, fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={deal.account_number}>
                              #{deal.account_number}
                            </div>
                          </td>
                          <td style={{ width: '12%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <div style={{ color: palette.ink }} title={deal.contact_name || 'N/A'}>
                              {deal.contact_name || 'N/A'}
                            </div>
                          </td>
                          <td style={{ width: '10%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <div style={{ fontSize: '14px', fontWeight: 700, color: palette.growth }} title={formatCurrency(deal.amount || 0)}>
                              {formatCurrency(deal.amount || 0)}
                            </div>
                          </td>
                          <td style={{ width: '8%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <div style={{ fontSize: '13px', fontWeight: 600, color: palette.ink }} title={`${probability}%`}>
                              {probability}%
                            </div>
                          </td>
                          <td style={{ width: '10%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <div style={{ fontSize: '14px', fontWeight: 700, color: palette.slate }} title={formatCurrency(expectedRevenue)}>
                              {formatCurrency(expectedRevenue)}
                            </div>
                          </td>
                          <td style={{ width: '10%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <div style={{
                              display: 'inline-block',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              fontWeight: 600,
                              background: deal.stage === 'Closed Won' ? '#DCFCE7' :
                                       deal.stage === 'Closed Lost' ? '#FEE2E2' :
                                       deal.stage === 'Paid' ? '#DCFCE7' :
                                       deal.stage === 'Invoiced' ? '#FEF3C7' :
                                       deal.stage === 'Proposal' ? '#E0F2FE' :
                                       deal.stage === 'Negotiation' ? '#FEF3C7' : '#F3F4F6',
                              color: deal.stage === 'Closed Won' ? '#166534' :
                                     deal.stage === 'Closed Lost' ? '#991B1B' :
                                     deal.stage === 'Paid' ? '#166534' :
                                     deal.stage === 'Invoiced' ? '#92400E' :
                                     deal.stage === 'Proposal' ? '#0369A1' :
                                     deal.stage === 'Negotiation' ? '#92400E' : '#374151'
                            }} title={deal.stage || 'N/A'}>
                              {deal.stage || 'N/A'}
                            </div>
                          </td>
                          <td style={{ width: '12%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <div style={{ fontWeight: 600, color: palette.ink }} title={deal.deal_owner || 'N/A'}>
                              {deal.deal_owner || 'N/A'}
                            </div>
                          </td>
                          <td style={{ width: '12%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <div
                                style={{
                                  color: hasClosingDateHistory(deal.lead_id, deal.account_id) ? '#3B82F6' : palette.inkSoft,
                                  fontSize: '12px',
                                  cursor: hasClosingDateHistory(deal.lead_id, deal.account_id) ? 'pointer' : 'default',
                                  textDecoration: hasClosingDateHistory(deal.lead_id, deal.account_id) ? 'underline' : 'none'
                                }}
                                title={deal.closing_date || 'N/A'}
                                onClick={() => hasClosingDateHistory(deal.lead_id, deal.account_id) && handleClosingDateClick(deal, deal.deal_name)}
                              >
                                {formatDate(deal.closing_date)}
                              </div>
                              <Edit
                                size={14}
                                style={{ cursor: 'pointer', color: palette.inkSoft, flexShrink: 0 }}
                                onClick={() => handleClosingDateEdit(deal)}
                                title="Edit Closing Date"
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })
                    ) : (
                      <tr>
                        <td colSpan="10" style={{ textAlign: 'center', padding: '40px', color: palette.inkSoft }}>
                          No expected revenue details found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Closing Date History Modal */}
          {showClosingDateHistory && (
            <div 
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                animation: 'frFadeUp 0.3s ease both'
              }}
              onClick={() => setShowClosingDateHistory(false)}
            >
              <div 
                style={{
                  background: palette.surface,
                  borderRadius: '12px',
                  maxWidth: '900px',
                  width: '90%',
                  maxHeight: '80vh',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div
                  style={{
                    padding: '20px 24px',
                    borderBottom: `1px solid ${palette.border}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <h3
                      className="fr-display"
                      style={{
                        fontSize: '18px',
                        fontWeight: 500,
                        color: palette.ink,
                        margin: 0
                      }}
                    >
                      Closing Date History
                    </h3>
                    <p
                      className="fr-body"
                      style={{
                        fontSize: '13px',
                        color: palette.inkSoft,
                        margin: '4px 0 0 0'
                      }}
                    >
                      Deal: {closingDateHistoryDealName}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowClosingDateHistory(false)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '8px',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'background 0.15s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = palette.canvas}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                  >
                    <X size={20} color={palette.inkSoft} />
                  </button>
                </div>

                {/* Modal Content */}
                <div style={{ flex: '1 1 0%', overflow: 'auto', padding: '20px' }}>
                  {closingDateHistoryLoading ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: palette.inkSoft }}>
                      <RefreshCw size={24} className="fr-spin" style={{ margin: '0 auto 12px', display: 'block' }} />
                      Loading closing date history...
                    </div>
                  ) : currentDealHistory && currentDealHistory.length > 0 ? (
                    <table className="sa-table">
                      <thead>
                        <tr>
                          <th style={{ width: '25%' }} title="Previous Date">Previous Date</th>
                          <th style={{ width: '25%' }} title="New Date">New Date</th>
                          <th style={{ width: '25%' }} title="Changed By">Changed By</th>
                          <th style={{ width: '25%' }} title="Modified Time">Modified Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentDealHistory
                          .sort((a, b) => new Date(b.closing_date_modified_time) - new Date(a.closing_date_modified_time))
                          .map((history) => (
                          <tr key={history.timeline_id} className="sa-table-row">
                            <td style={{ width: '20%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              <div style={{ color: palette.inkSoft, fontSize: '12px' }} title={history.previous_closing_date || 'N/A'}>
                                {formatDate(history.previous_closing_date)}
                              </div>
                            </td>
                            <td style={{ width: '20%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              <div style={{ color: palette.growth, fontSize: '12px', fontWeight: 600 }} title={history.new_closing_date || 'N/A'}>
                                {formatDate(history.new_closing_date)}
                              </div>
                            </td>
                            <td style={{ width: '20%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              <div style={{ fontWeight: 600, color: palette.ink }} title={history.changed_by || 'N/A'}>
                                {history.changed_by || 'N/A'}
                              </div>
                            </td>
                            <td style={{ width: '20%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              <div style={{ color: palette.inkSoft, fontSize: '12px' }} title={history.closing_date_modified_time || 'N/A'}>
                                {formatDate(history.closing_date_modified_time)}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '40px', color: palette.inkSoft }}>
                      No closing date history found
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Closing Date Edit Modal */}
          {showClosingDateEditModal && (
            <div
              style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                backdropFilter: 'blur(2px)',
                zIndex: 99999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px'
              }}
              onClick={() => setShowClosingDateEditModal(false)}
            >
              <div
                style={{
                  backgroundColor: palette.surface,
                  borderRadius: '12px',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                  width: '100%',
                  maxWidth: '500px',
                  maxHeight: '90vh',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div
                  style={{
                    padding: '20px 24px',
                    borderBottom: `1px solid ${palette.border}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <h3
                      className="fr-display"
                      style={{
                        fontSize: '18px',
                        fontWeight: 500,
                        color: palette.ink,
                        margin: 0
                      }}
                    >
                      Edit Closing Date
                    </h3>
                    <p
                      className="fr-body"
                      style={{
                        fontSize: '13px',
                        color: palette.inkSoft,
                        margin: '4px 0 0 0'
                      }}
                    >
                      Deal: {editingClosingDateDeal?.deal_name || 'Unknown Deal'}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowClosingDateEditModal(false)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '8px',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'background 0.15s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = palette.canvas}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                  >
                    <X size={20} color={palette.inkSoft} />
                  </button>
                </div>

                {/* Modal Content */}
                <div style={{ flex: '1 1 0%', overflow: 'auto', padding: '24px' }}>
                  <div style={{ marginBottom: '20px' }}>
                    <label
                      style={{
                        display: 'block',
                        marginBottom: '8px',
                        fontSize: '14px',
                        fontWeight: 500,
                        color: palette.ink
                      }}
                    >
                      Current Closing Date
                    </label>
                    <div
                      style={{
                        padding: '10px 12px',
                        backgroundColor: palette.canvas,
                        borderRadius: '6px',
                        fontSize: '14px',
                        color: palette.inkSoft
                      }}
                    >
                      {formatDate(editingClosingDateDeal?.closing_date) || 'N/A'}
                    </div>
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <label
                      style={{
                        display: 'block',
                        marginBottom: '8px',
                        fontSize: '14px',
                        fontWeight: 500,
                        color: palette.ink
                      }}
                    >
                      New Closing Date <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="date"
                      value={newClosingDate}
                      onChange={(e) => setNewClosingDate(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: `1px solid ${palette.border}`,
                        borderRadius: '6px',
                        fontSize: '14px',
                        outline: 'none',
                        boxSizing: 'border-box',
                        transition: 'border-color 0.15s'
                      }}
                      onFocus={(e) => e.currentTarget.style.borderColor = palette.growth}
                      onBlur={(e) => e.currentTarget.style.borderColor = palette.border}
                    />
                  </div>
                </div>

                {/* Modal Footer */}
                <div
                  style={{
                    padding: '16px 24px',
                    borderTop: `1px solid ${palette.border}`,
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '12px'
                  }}
                >
                  <button
                    onClick={() => setShowClosingDateEditModal(false)}
                    disabled={isUpdatingClosingDate}
                    style={{
                      padding: '10px 20px',
                      border: `1px solid ${palette.border}`,
                      borderRadius: '6px',
                      backgroundColor: palette.surface,
                      color: palette.ink,
                      fontSize: '14px',
                      fontWeight: 500,
                      cursor: isUpdatingClosingDate ? 'not-allowed' : 'pointer',
                      transition: 'background 0.15s'
                    }}
                    onMouseEnter={(e) => !isUpdatingClosingDate && (e.currentTarget.style.background = palette.canvas)}
                    onMouseLeave={(e) => e.currentTarget.style.background = palette.surface}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleClosingDateUpdate}
                    disabled={isUpdatingClosingDate || !newClosingDate}
                    style={{
                      padding: '10px 20px',
                      border: 'none',
                      borderRadius: '6px',
                      backgroundColor: isUpdatingClosingDate || !newClosingDate ? palette.inkSoft : palette.growth,
                      color: palette.surface,
                      fontSize: '14px',
                      fontWeight: 500,
                      cursor: isUpdatingClosingDate || !newClosingDate ? 'not-allowed' : 'pointer',
                      transition: 'background 0.15s'
                    }}
                    onMouseEnter={(e) => !isUpdatingClosingDate && newClosingDate && (e.currentTarget.style.background = '#2A4A2E')}
                    onMouseLeave={(e) => e.currentTarget.style.background = palette.growth}
                  >
                    {isUpdatingClosingDate ? 'Updating...' : 'Update Closing Date'}
                  </button>
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