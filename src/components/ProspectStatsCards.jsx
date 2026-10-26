import { useState, useEffect, useRef } from "react";
import {
  Users, Target, DollarSign, FileText, IndianRupee,
  RefreshCw, X, Search, ChevronDown, ChevronLeft, ChevronRight, BarChart3, ArrowUpRight, Edit
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

// ---- Presentational helpers (UI only, no business logic) ------------------

// Stage badge colours (same colour rules as before, grouped by table type)
const stageStyle = (stage, mode) => {
  const green = { background: '#DCFCE7', color: '#166534' };
  const red = { background: '#FEE2E2', color: '#991B1B' };
  const amber = { background: '#FEF3C7', color: '#92400E' };
  const blue = { background: '#E0F2FE', color: '#0369A1' };
  const grey = { background: '#F3F4F6', color: '#374151' };

  if (mode === 'invoiced') return stage === 'Invoiced' ? green : amber;
  if (mode === 'paid') return stage === 'Paid' ? green : amber;
  if (mode === 'full') {
    if (stage === 'Closed Won' || stage === 'Paid') return green;
    if (stage === 'Closed Lost') return red;
    if (stage === 'Invoiced' || stage === 'Negotiation') return amber;
    if (stage === 'Proposal') return blue;
    return grey;
  }
  // basic
  if (stage === 'Closed Won') return green;
  if (stage === 'Closed Lost') return red;
  return amber;
};

const overdueDaysStyle = (days) => ({
  background: days > 90 ? '#FEE2E2' : days > 30 ? '#FEF3C7' : '#DCFCE7',
  color: days > 90 ? '#991B1B' : days > 30 ? '#92400E' : '#166534'
});

// Generic responsive table: all columns visible (scroll + arrow buttons) on tablet/desktop,
// card list on mobile
function DetailTable({ columns, rows, loading, loadingText, emptyText, rowKey }) {
  const scrollRef = useRef(null);
  const [edge, setEdge] = useState({ left: false, right: false });

  const updateEdge = () => {
    const el = scrollRef.current;
    if (!el) return;
    setEdge({
      left: el.scrollLeft > 2,
      right: el.scrollLeft + el.clientWidth < el.scrollWidth - 2
    });
  };

  useEffect(() => {
    updateEdge();
    window.addEventListener('resize', updateEdge);
    return () => window.removeEventListener('resize', updateEdge);
  }, [rows, loading, columns.length]);

  const scrollByAmount = (dir) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.max(240, el.clientWidth * 0.6), behavior: 'smooth' });
  };

  return (
    <div className="pt-table-wrap">
      <div className="pt-table-scroll" ref={scrollRef} onScroll={updateEdge}>
        <table className="pt-table">
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c.label} title={c.label}>{c.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr className="pt-state-row">
                <td colSpan={columns.length} style={{ textAlign: 'center', padding: '40px', color: palette.inkSoft }}>
                  <RefreshCw size={24} className="fr-spin" style={{ margin: '0 auto 12px', display: 'block' }} />
                  {loadingText}
                </td>
              </tr>
            ) : rows && rows.length > 0 ? (
              rows.map((row, index) => (
                <tr key={rowKey(row, index)} className="pt-row">
                  {columns.map((c) => (
                    <td key={c.label} data-label={c.label}>
                      {c.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr className="pt-state-row">
                <td colSpan={columns.length} style={{ textAlign: 'center', padding: '40px', color: palette.inkSoft }}>
                  {emptyText}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Left / Right scroll buttons */}
      <div className="pt-scroll-bar">
        <button
          type="button"
          className="pt-scroll-btn"
          aria-label="Scroll left"
          disabled={!edge.left}
          onClick={() => scrollByAmount(-1)}
        >
          <ChevronLeft size={18} />
        </button>
        <button
          type="button"
          className="pt-scroll-btn"
          aria-label="Scroll right"
          disabled={!edge.right}
          onClick={() => scrollByAmount(1)}
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}

// Card shell: header + search + body
function DetailCard({
  title, subtitle, onClose, headerExtra,
  searchValue, onSearch, placeholder, children
}) {
  return (
    <div className="sa-table-card pt-card">
      <div className="pt-card-head">
        <div style={{ minWidth: 0 }}>
          <h3 className="fr-display" style={{ fontSize: '18px', fontWeight: 500, color: palette.ink, margin: 0 }}>
            {title}
          </h3>
          <p className="fr-body" style={{ fontSize: '13px', color: palette.inkSoft, margin: '4px 0 0 0' }}>
            {subtitle}
          </p>
        </div>
        <div className="pt-card-head-actions">
          {headerExtra}
          <button
            onClick={onClose}
            className="pt-icon-btn"
            onMouseEnter={(e) => e.currentTarget.style.background = palette.canvas}
            onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
          >
            <X size={20} color={palette.inkSoft} />
          </button>
        </div>
      </div>

      <div className="pt-card-search">
        <div className="pt-search-box">
          <Search size={16} color={palette.inkFaint} className="pt-search-icon" />
          <input
            type="text"
            placeholder={placeholder}
            value={searchValue}
            onChange={(e) => onSearch(e.target.value)}
            className="pt-search-input"
            onFocus={(e) => e.currentTarget.style.borderColor = palette.growth}
            onBlur={(e) => e.currentTarget.style.borderColor = palette.border}
          />
        </div>
      </div>

      <div className="pt-card-body">
        {children}
      </div>
    </div>
  );
}

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
        padding: '0 20px',
        textAlign: 'center',
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
        padding: '0 20px',
        textAlign: 'center',
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

  // ---- Table column builders (UI only) -------------------------------------
  const probOf = (r, strict) => strict ? (r.deal_probability || 0) : (r.deal_probability || r.probability || 0);
  const expectedOf = (r, strict) => {
    if (strict) return r.expected_revenue || 0;
    const p = probOf(r, false);
    return r.expected_revenue || (r.amount || 0) * (p / 100);
  };

  const txt = (value, style) => (
    <span style={style} title={value || 'N/A'}>{value || 'N/A'}</span>
  );

  const cDealName = () => ({
    label: 'Deal Name',
    render: (r) => txt(r.deal_name, { fontWeight: 600, color: palette.ink })
  });
  const cAccountName = () => ({
    label: 'Account Name',
    render: (r) => txt(r.account_name, { color: palette.ink })
  });
  const cAccountNumber = () => ({
    label: 'Account Number',
    render: (r) => <span style={{ color: palette.ink, fontSize: '13px' }} title={r.account_number}>#{r.account_number}</span>
  });
  const cContactName = () => ({
    label: 'Contact Name',
    render: (r) => txt(r.contact_name, { color: palette.ink })
  });
  const cAmount = (color) => ({
    label: 'Amount',
    render: (r) => (
      <span style={{ fontSize: '14px', fontWeight: 700, color }} title={formatCurrency(r.amount || 0)}>
        {formatCurrency(r.amount || 0)}
      </span>
    )
  });
  const cProbability = (strict) => ({
    label: 'Probability',
    render: (r) => {
      const p = probOf(r, strict);
      return <span style={{ fontSize: '13px', fontWeight: 600, color: palette.ink }} title={`${p}%`}>{p}%</span>;
    }
  });
  const cExpected = (label, strict) => ({
    label,
    render: (r) => {
      const e = expectedOf(r, strict);
      return <span style={{ fontSize: '14px', fontWeight: 700, color: palette.slate }} title={formatCurrency(e)}>{formatCurrency(e)}</span>;
    }
  });
  const cStage = (mode) => ({
    label: 'Stage',
    render: (r) => (
      <span
        style={{
          display: 'inline-block',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: 600,
          ...stageStyle(r.stage, mode)
        }}
        title={r.stage || 'N/A'}
      >
        {r.stage || 'N/A'}
      </span>
    )
  });
  const cOwner = () => ({
    label: 'Deal Owner',
    render: (r) => txt(r.deal_owner, { fontWeight: 600, color: palette.ink })
  });
  const cClosing = () => ({
    label: 'Closing Date',
    render: (r) => {
      const hasHistory = hasClosingDateHistory(r.lead_id, r.account_id);
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              color: hasHistory ? '#3B82F6' : palette.inkSoft,
              fontSize: '12px',
              cursor: hasHistory ? 'pointer' : 'default',
              textDecoration: hasHistory ? 'underline' : 'none'
            }}
            title={r.closing_date || 'N/A'}
            onClick={() => hasHistory && handleClosingDateClick(r, r.deal_name)}
          >
            {formatDate(r.closing_date)}
          </span>
          <Edit
            size={14}
            style={{ cursor: 'pointer', color: palette.inkSoft, flexShrink: 0 }}
            onClick={() => handleClosingDateEdit(r)}
            title="Edit Closing Date"
          />
        </span>
      );
    }
  });
  const cOverdueDays = () => ({
    label: 'Overdue Days',
    render: (r) => (
      <span
        style={{
          display: 'inline-block',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: 600,
          ...overdueDaysStyle(r.overdue_days)
        }}
        title={`${r.overdue_days || 0} days`}
      >
        {r.overdue_days || 0} days
      </span>
    )
  });
  const cMoneyWithCount = (label, amountKey, color, countText) => ({
    label,
    render: (o) => {
      const text = countText(o);
      return (
        <span style={{ display: 'inline-block' }}>
          <span style={{ display: 'block', fontSize: '14px', fontWeight: 700, color }}>
            {formatCurrency(o[amountKey] || 0)}
          </span>
          {text && (
            <span style={{ display: 'block', fontSize: '11px', color: palette.inkSoft, fontWeight: 600 }}>
              {text}
            </span>
          )}
        </span>
      );
    }
  });

  const ownerSummaryColumns = [
    { label: 'Owner', render: (o) => <span className="sa-manager-name" title={o.owner || 'N/A'}>{o.owner || 'N/A'}</span> },
    { label: 'Accounts', render: (o) => <span style={{ fontWeight: 600, color: palette.ink }}>{o.account_count || 0}</span> },
    { label: 'Deals', render: (o) => <span style={{ fontWeight: 600, color: palette.ink }}>{o.deal_count || 0}</span> },
    cMoneyWithCount('Invoiced', 'invoiced_amount', palette.amberDeep, (o) => `${o.invoiced_count || 0} invoiced`),
    cMoneyWithCount('Paid Amount', 'payment_received_amount', palette.teal, (o) => `${o.payment_received_count || 0} paid`),
    cMoneyWithCount('Total Paid', 'total_paid_amount', palette.growth, (o) => `${o.total_paid_count || 0} total`),
    cMoneyWithCount('Expected Revenue', 'expected_revenue', palette.slate, (o) => (o.expected_revenue_count || 0) > 0 ? `${o.expected_revenue_count} expected` : ''),
    cMoneyWithCount('Overdue', 'overdue_amount', palette.rust, (o) => `${o.overdue_count || 0} overdue`)
  ];

  const prospectColumns = [
    { label: 'Account Name', render: (p) => txt(p.account_name, { fontWeight: 600, color: palette.ink }) },
    { label: 'Account Number', render: (p) => <span style={{ color: palette.ink, fontSize: '13px' }} title={p.account_number}>#{p.account_number}</span> },
    { label: 'Contact Name', render: (p) => txt(p.contact_name, { color: palette.ink }) },
    {
      label: 'Contact',
      render: (p) => (
        <span style={{ display: 'inline-block' }}>
          <span style={{ display: 'block', color: palette.ink }} title={p.phone || 'N/A'}>{p.phone || 'N/A'}</span>
          <span style={{ display: 'block', color: palette.inkSoft, fontSize: '12px' }} title={p.email || 'N/A'}>{p.email || 'N/A'}</span>
        </span>
      )
    },
    { label: 'Account Owner', render: (p) => txt(p.account_owner, { fontWeight: 600, color: palette.ink }) },
    { label: 'Country', render: (p) => txt(p.country, { color: palette.inkSoft, fontSize: '12px' }) },
    { label: 'Account Type', render: (p) => txt(p.account_type, { color: palette.ink }) },
    { label: 'Deal Present', render: (p) => <span style={{ color: palette.ink }} title={p.deal_present || 0}>{p.deal_present || 0}</span> },
    { label: 'Created Time', render: (p) => <span style={{ color: palette.inkSoft, fontSize: '12px' }} title={p.account_created_time || 'N/A'}>{formatDate(p.account_created_time)}</span> }
  ];

  const dealColumns = [
    cDealName(), cAccountName(), cAccountNumber(), cContactName(),
    cAmount(palette.growth), cProbability(false), cExpected('Expected Amount', false),
    cStage('basic'), cOwner(), cClosing()
  ];

  const invoicedColumns = [
    cDealName(), cContactName(),
    cAmount(palette.amberDeep), cProbability(false), cExpected('Expected Amount', false),
    cStage('invoiced'), cOwner(), cClosing()
  ];

  const paymentColumns = [
    cDealName(), cContactName(),
    cAmount(palette.teal), cProbability(false), cExpected('Expected Amount', false),
    cStage('paid'), cOwner(), cClosing()
  ];

  const totalPaidColumns = [
    cDealName(), cContactName(),
    cAmount(palette.growth), cProbability(false), cExpected('Expected Amount', false),
    cStage('paid'), cOwner(), cClosing()
  ];

  const overdueColumns = [
    cDealName(), cContactName(), cAccountNumber(),
    cAmount(palette.rust), cProbability(false), cExpected('Expected Revenue', false),
    cStage('basic'), cOwner(), cClosing(), cOverdueDays()
  ];

  const totalDealAmountColumns = [
    cDealName(), cAccountName(), cAccountNumber(), cContactName(),
    cAmount(palette.growth), cProbability(false), cExpected('Expected Amount', false),
    cStage('full'), cOwner(), cClosing()
  ];

  const expectedRevenueColumns = [
    cDealName(), cAccountName(), cAccountNumber(), cContactName(),
    cAmount(palette.growth), cProbability(true), cExpected('Expected Revenue', true),
    cStage('full'), cOwner(), cClosing()
  ];

  const historyColumns = [
    { label: 'Previous Date', render: (h) => <span style={{ color: palette.inkSoft, fontSize: '12px' }} title={h.previous_closing_date || 'N/A'}>{formatDate(h.previous_closing_date)}</span> },
    { label: 'New Date', render: (h) => <span style={{ color: palette.growth, fontSize: '12px', fontWeight: 600 }} title={h.new_closing_date || 'N/A'}>{formatDate(h.new_closing_date)}</span> },
    { label: 'Changed By', render: (h) => txt(h.changed_by, { fontWeight: 600, color: palette.ink }) },
    { label: 'Modified Time', render: (h) => <span style={{ color: palette.inkSoft, fontSize: '12px' }} title={h.closing_date_modified_time || 'N/A'}>{formatDate(h.closing_date_modified_time)}</span> }
  ];

  const includesTerm = (term, ...fields) => {
    if (term === '') return true;
    const s = term.toLowerCase().trim();
    return fields.some(f => (f?.toLowerCase() || '').includes(s));
  };

  return (
    <div className="main-full" style={{ background: palette.canvas }}>
      <style>{`
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
        .sa-manager-name {
          font-size: 14px;
          font-weight: 600;
          color: #111827;
        }

        /* =========================================================
           RESPONSIVE LAYER
           ========================================================= */
        .main-full { overflow-x: hidden; max-width: 100%; }
        .main-full *, .main-full *::before, .main-full *::after { box-sizing: border-box; }
        .content-area, .sa-container { min-width: 0; max-width: 100%; }

        /* ---- Top bar ---- */
        .pt-topbar-right {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
          justify-content: flex-end;
          min-width: 0;
        }
        .pt-owner-wrap { display: flex; align-items: center; gap: 8px; }
        .pt-owner-box { position: relative; }
        .pt-owner-btn {
          padding: 8px 12px;
          border-radius: 8px;
          border: 1px solid ${palette.border};
          font-size: 13px;
          outline: none;
          background: ${palette.surface};
          color: ${palette.ink};
          cursor: pointer;
          font-family: var(--font-mono), monospace;
          display: flex;
          align-items: center;
          gap: 6px;
          min-width: 150px;
          justify-content: space-between;
        }
        .pt-owner-menu {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          margin-top: 4px;
          background: ${palette.surface};
          border: 1px solid ${palette.border};
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          z-index: 50;
          max-height: 220px;
          overflow-y: auto;
        }
        .pt-owner-item { padding: 8px 12px; font-size: 13px; cursor: pointer; }
        .pt-owner-item + .pt-owner-item { border-top: 1px solid ${palette.border}; }
        .pt-sync-pill {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: ${palette.inkSoft};
          padding: 6px 10px;
          border-radius: 999px;
          border: 1px solid ${palette.border};
          background: ${palette.surface};
          white-space: nowrap;
        }
        .pt-refresh-btn {
          padding: 8px 16px;
          background-color: ${palette.ink};
          color: #ffffff;
          border: none;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 6px;
          white-space: nowrap;
        }

        /* ---- Header band ---- */
        .pt-hero-title { font-size: 30px; }

        /* ---- Stat cards grid: auto-fits any width ---- */
        .op-dashboard-grid.pt-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, 155px);
          justify-content: start;
          gap: 14px;
          width: 100%;
        }
        .pt-stat-card {
          position: relative;
          min-width: 0;
          aspect-ratio: 1 / 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 14px 16px 16px;
          border-radius: 8px;
          background: ${palette.surface};
          border: 1px solid #b3b4b4;
          transition: transform 0.18s ease, box-shadow 0.18s ease, background-color 0.18s ease, border-color 0.18s ease;
        }
        /* entry animation must not freeze the hover transform */
        .pt-stat-card.fr-card { animation: frFadeUp 0.5s ease backwards; }
        .pt-stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(22, 36, 28, 0.08);
          background-color: #f0fdf4;
          border-color: #86efac;
        }

        .pt-stat-icon {
          width: 28px;
          height: 28px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--accent-soft);
        }

        .pt-stat-value {
          margin-top: 10px;
          font-size: 22px;
          font-weight: 600;
          line-height: 1;
          overflow-wrap: anywhere;
          color: ${palette.ink};
        }
        .pt-stat-title {
          margin-top: 5px;
          font-size: 12px;
          font-weight: 500;
          color: ${palette.inkSoft};
          line-height: 1.25;
        }
        .pt-stat-arrow {
          position: absolute;
          top: 14px;
          right: 14px;
          opacity: 0;
          transition: all 0.18s ease;
          color: ${palette.inkFaint};
        }
        .pt-stat-card:hover .pt-stat-arrow { opacity: 1; transform: translate(2px, -2px); }

        /* ---- Month tabs ---- */
        .month-tabs { max-width: 100%; }
        .month-chip { white-space: nowrap; }

        /* ---- Detail cards ---- */
        .pt-card {
          margin-top: 24px;
          display: flex;
          flex-direction: column;
          animation: frFadeUp 0.4s ease both;
          min-width: 0;
          max-width: 100%;
        }
        .pt-card-head {
          padding: 20px 24px;
          border-bottom: 1px solid ${palette.border};
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
        }
        .pt-card-head-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
        .pt-icon-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 8px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.15s;
        }
        .pt-sort-btn {
          background: ${palette.canvas};
          border: 1px solid ${palette.border};
          cursor: pointer;
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          color: ${palette.ink};
          font-family: var(--font-mono), monospace;
          white-space: nowrap;
        }
        .pt-card-search { padding: 16px 24px; border-bottom: 1px solid ${palette.border}; }
        .pt-search-box { position: relative; max-width: 400px; }
        .pt-search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); }
        .pt-search-input {
          width: 100%;
          padding: 10px 12px 10px 40px;
          border: 1px solid ${palette.border};
          border-radius: 8px;
          font-size: 13px;
          outline: none;
          background: ${palette.canvas};
          color: ${palette.ink};
          font-family: var(--font-mono), monospace;
        }
        .pt-card-body {
          flex: 1 1 0%;
          min-width: 0;
          overflow: hidden;
          padding: 20px;
          background: rgb(245, 245, 245);
        }

        /* ---- Table (desktop / tablet) ---- */
        .pt-table-wrap { width: 100%; min-width: 0; }
        .pt-table-scroll {
          width: 100%;
          max-height: 70vh;
          overflow: auto;
          -webkit-overflow-scrolling: touch;
          border-radius: 8px;
          scrollbar-width: thin;
        }
        .pt-table-scroll::-webkit-scrollbar { height: 10px; width: 10px; }
        .pt-table-scroll::-webkit-scrollbar-thumb { background: #c4cbc0; border-radius: 8px; }
        .pt-table-scroll::-webkit-scrollbar-track { background: #eef0ea; }
        .pt-table {
          width: max-content;
          min-width: 100%;
          border-collapse: collapse;
          background: ${palette.surface};
          font-size: 13px;
        }
        .pt-table thead th {
          position: sticky;
          top: 0;
          text-align: left;
          padding: 12px 14px;
          font-size: 12px;
          font-weight: 700;
          color: ${palette.inkSoft};
          background: #fafafa;
          border-bottom: 1px solid ${palette.border};
          white-space: nowrap;
          z-index: 1;
        }
        .pt-table tbody td {
          padding: 12px 14px;
          border-bottom: 1px solid #ececec;
          color: ${palette.ink};
          vertical-align: middle;
          white-space: nowrap;
        }
        .pt-table { border: 1px solid #dfe3da; }
        .pt-table thead th,
        .pt-table tbody td { border-right: 1px solid #dfe3da; }
        .pt-table thead th:last-child,
        .pt-table tbody td:last-child { border-right: none; }
        .pt-table tbody td { border-bottom-color: #dfe3da; }
        .pt-table tbody tr.pt-row:hover { background: #f7faf5; }
        /* long text -> "..." (full text on hover via title) */
        .pt-table td span[title] {
          display: inline-block;
          max-width: 220px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          vertical-align: middle;
        }

        /* left / right scroll buttons */
        .pt-scroll-bar { display: flex; justify-content: space-between; align-items: center; margin-top: 8px; }
        .pt-scroll-btn {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          border: 1px solid ${palette.border};
          background: ${palette.surface};
          color: ${palette.ink};
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          padding: 0;
        }
        .pt-scroll-btn:hover:not(:disabled) { background: ${palette.canvas}; border-color: ${palette.growth}; }
        .pt-scroll-btn:disabled { opacity: 0.35; cursor: not-allowed; }

        /* ---- Modals ---- */
        .pt-modal-overlay {
          position: fixed;
          inset: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          animation: frFadeUp 0.3s ease both;
        }
        .pt-modal {
          background: ${palette.surface};
          border-radius: 12px;
          width: 100%;
          display: flex;
          flex-direction: column;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          overflow: hidden;
        }
        .pt-modal-history { max-width: 900px; max-height: 85vh; }
        .pt-modal-edit { max-width: 500px; max-height: 90vh; }
        .pt-modal-head {
          padding: 20px 24px;
          border-bottom: 1px solid ${palette.border};
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
        }
        .pt-modal-body { flex: 1 1 0%; overflow: auto; padding: 20px; min-height: 0; }
        .pt-modal-foot {
          padding: 16px 24px;
          border-top: 1px solid ${palette.border};
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }
        .pt-modal-history .pt-table { min-width: 560px; }

        /* =========================================================
           TABLET  (<= 1024px)
           ========================================================= */
        @media (max-width: 1024px) {
          .op-dashboard-grid.pt-grid { gap: 12px; }
        }

        /* =========================================================
           MOBILE  (<= 768px)
           ========================================================= */
        @media (max-width: 768px) {
          .content-area { padding: 12px !important; }
          .sa-container { padding: 0 !important; }

          /* top bar stacks */
          .topbar {
            height: auto !important;
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 10px !important;
            padding: 12px !important;
          }
          .pt-topbar-right { width: 100%; justify-content: space-between; }
          .pt-owner-wrap { width: 100%; }
          .pt-owner-box { flex: 1; min-width: 0; }
          .pt-owner-btn { width: 100%; min-width: 0; }
          .pt-sync-pill { flex: 1; justify-content: center; }

          .pt-hero-title { font-size: clamp(22px, 6.5vw, 28px) !important; }

          /* month chips scroll sideways in one row */
          .month-tabs {
            display: flex !important;
            flex-wrap: nowrap !important;
            overflow-x: auto !important;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
            padding-bottom: 4px;
          }
          .month-tabs::-webkit-scrollbar { display: none; }
          .month-chip { flex-shrink: 0; }

          /* 2-column stat cards */
          .op-dashboard-grid.pt-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }

          /* detail cards */
          .pt-card { margin-top: 16px; }
          .pt-card-head { padding: 14px 16px; flex-wrap: wrap; }
          .pt-card-search { padding: 12px 16px; }
          .pt-search-box { max-width: 100%; }
          .pt-card-body { padding: 10px; }

          /* TABLE  ->  CARD LIST */
          .pt-table-scroll { overflow: visible; max-height: none; }
          .pt-scroll-bar { display: none; }
          .pt-table,
          .pt-table tbody,
          .pt-table tr,
          .pt-table td { display: block; width: 100%; min-width: 0 !important; }
          .pt-table { background: transparent; border: none; }
          .pt-table thead th, .pt-table tbody td { border-right: none !important; }
          .pt-table thead { display: none; }
          .pt-table tr.pt-row {
            background: ${palette.surface};
            border: 1px solid ${palette.border};
            border-radius: 10px;
            padding: 6px 12px;
            margin-bottom: 10px;
          }
          .pt-table tbody td {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 14px;
            padding: 8px 0;
            border-bottom: 1px dashed #e8ece4;
            white-space: normal;
            text-align: right;
          }
          .pt-table tbody tr.pt-row td:last-child { border-bottom: none; }
          .pt-table tbody td::before {
            content: attr(data-label);
            flex-shrink: 0;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 0.04em;
            text-transform: uppercase;
            color: ${palette.inkSoft};
            text-align: left;
          }
          .pt-table td span[title] { max-width: 55vw; }
          .pt-table tr.pt-state-row { background: ${palette.surface}; border-radius: 10px; }
          .pt-table tr.pt-state-row td { display: block; text-align: center; }
          .pt-table tr.pt-state-row td::before { content: none; }

          /* modals */
          .pt-modal-overlay { padding: 10px; align-items: flex-end; }
          .pt-modal-history, .pt-modal-edit { max-height: 90vh; }
          .pt-modal-head { padding: 14px 16px; }
          .pt-modal-body { padding: 12px; }
          .pt-modal-foot { padding: 12px 16px; }
          .pt-modal-foot button { flex: 1; }
          .pt-modal-history .pt-table { min-width: 0 !important; }
        }

        /* =========================================================
           SMALL PHONES  (<= 380px)
           ========================================================= */
        @media (max-width: 380px) {
          .op-dashboard-grid.pt-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
          .pt-topbar-right { gap: 8px; }
          .pt-refresh-btn { width: 100%; justify-content: center; }
        }
      `}</style>

      {/* Header */}
      <div className="topbar" style={{ borderBottom: `1px solid ${palette.border}` }}>
        <div className="tb-left">
          <div className="tb-page fr-body" style={{ fontWeight: 600, color: palette.ink }}>Prospect Statistics</div>
        </div>
        <div className="tb-right pt-topbar-right">
          {/* Owner Filter Dropdown */}
          <div className="pt-owner-wrap">
            <span className="fr-body" style={{ fontSize: '13px', color: palette.inkSoft }}>Owner:</span>
            <div className="pt-owner-box" ref={ownerDropdownRef}>
              <button
                className="pt-owner-btn"
                onClick={() => setShowOwnerDropdown(!showOwnerDropdown)}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = palette.growth}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = palette.border}
              >
                {selectedOwner === 'all' ? 'All Owners' : selectedOwner}
                <ChevronDown size={14} />
              </button>

              {showOwnerDropdown && (
                <div className="pt-owner-menu">
                  <div
                    className="pt-owner-item"
                    onClick={() => {
                      setSelectedOwner('all');
                      setShowOwnerDropdown(false);
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = palette.canvas}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                  >
                    All Owners
                  </div>
                  {ownerOptions.map((owner) => (
                    <div
                      key={owner}
                      className="pt-owner-item"
                      onClick={() => {
                        setSelectedOwner(owner);
                        setShowOwnerDropdown(false);
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

          <div className="fr-mono pt-sync-pill">
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
            className="fr-body pt-refresh-btn"
            style={{
              cursor: refreshing ? 'not-allowed' : 'pointer',
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
              style={{ position: 'absolute', top: '-40px', right: '-40px', opacity: 0.14, pointerEvents: 'none', maxWidth: '100%' }}
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
                className="fr-display pt-hero-title"
                style={{ color: '#1a1c17', fontWeight: 500, margin: 0, lineHeight: 1.2 }}
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
          padding: '64px 16px',
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
          <div className="op-dashboard-grid pt-grid">
            {prospectCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.key}
                  className="fr-card pt-stat-card"
                  onClick={card.onClick}
                  style={{
                    '--accent-soft': `${card.accent}1A`,
                    animationDelay: `${index * 0.05}s`,
                    cursor: card.onClick ? 'pointer' : 'default'
                  }}
                >
                  <div className="pt-stat-icon">
                    <Icon size={14} color={card.accent} />
                  </div>

                  <div className="fr-mono pt-stat-value">
                    {typeof card.value === 'string' ? card.value : (card.isCurrency ? formatCurrency(card.value) : formatNumber(card.value))}
                  </div>

                  <div className="fr-body pt-stat-title">
                    {card.title}
                  </div>

                  {card.onClick && (
                    <div className="fr-card-arrow pt-stat-arrow">
                      <ArrowUpRight size={13} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Owner Summary Table */}
          {showOwnerSummaryTable && (
            <DetailCard
              title="Owner Summary"
              subtitle={`Total Owners: ${ownerSummaryData?.length || 0} | Month: ${selectedMonth}`}
              onClose={() => setShowOwnerSummaryTable(false)}
              searchValue={ownerSummarySearchTerm}
              onSearch={setOwnerSummarySearchTerm}
              placeholder="Search by owner name..."
            >
              <DetailTable
                columns={ownerSummaryColumns}
                loading={false}
                emptyText="No owner summary data found"
                rowKey={(o, i) => o.owner || i}
                rows={(ownerSummaryData || []).filter(o => includesTerm(ownerSummarySearchTerm, o.owner))}
              />
            </DetailCard>
          )}

          {/* Prospect Details Table */}
          {showProspectDetails && (
            <DetailCard
              title="Prospect Details"
              subtitle={`Total Prospects: ${prospectDetailsData?.length || 0} | Month: ${selectedMonth}`}
              onClose={() => setShowProspectDetails(false)}
              searchValue={prospectDetailsSearchTerm}
              onSearch={setProspectDetailsSearchTerm}
              placeholder="Search by account name, contact, or owner..."
            >
              <DetailTable
                columns={prospectColumns}
                loading={prospectDetailsLoading}
                loadingText="Loading prospect details..."
                emptyText="No prospect details found"
                rowKey={(p) => p.id}
                rows={(prospectDetailsData || []).filter(p =>
                  includesTerm(prospectDetailsSearchTerm, p.account_name, p.contact_name, p.account_owner)
                )}
              />
            </DetailCard>
          )}

          {/* Deal Details Table */}
          {showDealDetails && (
            <DetailCard
              title="Deal Details"
              subtitle={`Total Deals: ${dealDetailsData?.length || 0} | Month: ${selectedMonth}`}
              onClose={() => setShowDealDetails(false)}
              searchValue={dealDetailsSearchTerm}
              onSearch={setDealDetailsSearchTerm}
              placeholder="Search by deal name, account, or owner..."
            >
              <DetailTable
                columns={dealColumns}
                loading={dealDetailsLoading}
                loadingText="Loading deal details..."
                emptyText="No deal details found"
                rowKey={(d) => d.deal_id}
                rows={(dealDetailsData || []).filter(d =>
                  includesTerm(dealDetailsSearchTerm, d.deal_name, d.account_name, d.deal_owner)
                )}
              />
            </DetailCard>
          )}

          {/* Invoiced Details Table */}
          {showInvoicedDetails && (
            <DetailCard
              title="Invoiced Details"
              subtitle={`Total Invoiced: ${invoicedDetailsData?.length || 0} | Month: ${selectedMonth}`}
              onClose={() => setShowInvoicedDetails(false)}
              searchValue={invoicedDetailsSearchTerm}
              onSearch={setInvoicedDetailsSearchTerm}
              placeholder="Search by deal name, contact, or owner..."
            >
              <DetailTable
                columns={invoicedColumns}
                loading={invoicedDetailsLoading}
                loadingText="Loading invoiced details..."
                emptyText="No invoiced details found"
                rowKey={(d) => d.deal_id}
                rows={(invoicedDetailsData || []).filter(d =>
                  includesTerm(invoicedDetailsSearchTerm, d.deal_name, d.contact_name, d.deal_owner)
                )}
              />
            </DetailCard>
          )}

          {/* Payment Received Details Table */}
          {showPaymentReceivedDetails && (
            <DetailCard
              title="Paid Amount Details"
              subtitle={`Total Payments: ${paymentReceivedDetailsData?.length || 0} | Month: ${selectedMonth}`}
              onClose={() => setShowPaymentReceivedDetails(false)}
              searchValue={paymentReceivedDetailsSearchTerm}
              onSearch={setPaymentReceivedDetailsSearchTerm}
              placeholder="Search by deal name, contact, or owner..."
            >
              <DetailTable
                columns={paymentColumns}
                loading={paymentReceivedDetailsLoading}
                loadingText="Loading paid amount details..."
                emptyText="No paid amount details found"
                rowKey={(d) => d.deal_id}
                rows={(paymentReceivedDetailsData || []).filter(d =>
                  includesTerm(paymentReceivedDetailsSearchTerm, d.deal_name, d.contact_name, d.deal_owner)
                )}
              />
            </DetailCard>
          )}

          {/* Total Paid Details Table */}
          {showTotalPaidDetails && (
            <DetailCard
              title="Total Paid Details"
              subtitle={`Total Paid: ${totalPaidDetailsData?.length || 0} | Month: ${selectedMonth}`}
              onClose={() => setShowTotalPaidDetails(false)}
              searchValue={totalPaidDetailsSearchTerm}
              onSearch={setTotalPaidDetailsSearchTerm}
              placeholder="Search by deal name, contact, or owner..."
            >
              <DetailTable
                columns={totalPaidColumns}
                loading={totalPaidDetailsLoading}
                loadingText="Loading total paid details..."
                emptyText="No total paid details found"
                rowKey={(d) => d.deal_id}
                rows={(totalPaidDetailsData || []).filter(d =>
                  includesTerm(totalPaidDetailsSearchTerm, d.deal_name, d.contact_name, d.deal_owner)
                )}
              />
            </DetailCard>
          )}

          {/* Overdue Details Table */}
          {showOverdueDetails && (
            <DetailCard
              title="Overdue Deals Details"
              subtitle={`Total Overdue: ${overdueDetailsData?.length || 0} | Month: ${selectedMonth}`}
              onClose={() => setShowOverdueDetails(false)}
              searchValue={overdueDetailsSearchTerm}
              onSearch={setOverdueDetailsSearchTerm}
              placeholder="Search by deal name, contact, or owner..."
              headerExtra={
                <button
                  className="pt-sort-btn"
                  onClick={() => setOverdueSortOrder(overdueSortOrder === 'latest' ? 'oldest' : 'latest')}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#e8e8e8'}
                  onMouseLeave={(e) => e.currentTarget.style.background = palette.canvas}
                >
                  {overdueSortOrder === 'latest' ? 'Latest First' : 'Oldest First'}
                </button>
              }
            >
              <DetailTable
                columns={overdueColumns}
                loading={overdueDetailsLoading}
                loadingText="Loading overdue details..."
                emptyText="No overdue details found"
                rowKey={(d) => d.deal_id}
                rows={(sortOverdueDetails(overdueDetailsData) || []).filter(d =>
                  includesTerm(overdueDetailsSearchTerm, d.deal_name, d.contact_name, d.deal_owner)
                )}
              />
            </DetailCard>
          )}

          {/* Total Deal Amount Details Table */}
          {showTotalDealAmountDetails && (
            <DetailCard
              title="Total Deal Amount Details"
              subtitle={`Total Deals: ${totalDealAmountDetailsData?.length || 0} | Month: ${selectedMonth}`}
              onClose={() => setShowTotalDealAmountDetails(false)}
              searchValue={totalDealAmountDetailsSearchTerm}
              onSearch={setTotalDealAmountDetailsSearchTerm}
              placeholder="Search by deal name, account, contact, or owner..."
            >
              <DetailTable
                columns={totalDealAmountColumns}
                loading={totalDealAmountDetailsLoading}
                loadingText="Loading total deal amount details..."
                emptyText="No total deal amount details found"
                rowKey={(d) => d.deal_id}
                rows={(totalDealAmountDetailsData || []).filter(d =>
                  includesTerm(totalDealAmountDetailsSearchTerm, d.deal_name, d.account_name, d.contact_name, d.deal_owner)
                )}
              />
            </DetailCard>
          )}

          {/* Expected Revenue Details Table */}
          {showExpectedRevenueDetails && (
            <DetailCard
              title="Expected Revenue Details"
              subtitle={`Total Deals: ${expectedRevenueDetailsData?.length || 0} | Month: ${selectedMonth} | Total Expected Revenue: ${formatCurrency(totalExpectedRevenue)}`}
              onClose={() => setShowExpectedRevenueDetails(false)}
              searchValue={expectedRevenueDetailsSearchTerm}
              onSearch={setExpectedRevenueDetailsSearchTerm}
              placeholder="Search by deal name, account, contact, or owner..."
            >
              <DetailTable
                columns={expectedRevenueColumns}
                loading={expectedRevenueDetailsLoading}
                loadingText="Loading expected revenue details..."
                emptyText="No expected revenue details found"
                rowKey={(d) => d.deal_id}
                rows={(expectedRevenueDetailsData || []).filter(d =>
                  includesTerm(expectedRevenueDetailsSearchTerm, d.deal_name, d.account_name, d.contact_name, d.deal_owner)
                )}
              />
            </DetailCard>
          )}

          {/* Closing Date History Modal */}
          {showClosingDateHistory && (
            <div
              className="pt-modal-overlay"
              style={{ zIndex: 1000 }}
              onClick={() => setShowClosingDateHistory(false)}
            >
              <div
                className="pt-modal pt-modal-history"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="pt-modal-head">
                  <div style={{ minWidth: 0 }}>
                    <h3
                      className="fr-display"
                      style={{ fontSize: '18px', fontWeight: 500, color: palette.ink, margin: 0 }}
                    >
                      Closing Date History
                    </h3>
                    <p
                      className="fr-body"
                      style={{ fontSize: '13px', color: palette.inkSoft, margin: '4px 0 0 0', overflowWrap: 'anywhere' }}
                    >
                      Deal: {closingDateHistoryDealName}
                    </p>
                  </div>
                  <button
                    className="pt-icon-btn"
                    onClick={() => setShowClosingDateHistory(false)}
                    onMouseEnter={(e) => e.currentTarget.style.background = palette.canvas}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                  >
                    <X size={20} color={palette.inkSoft} />
                  </button>
                </div>

                {/* Modal Content */}
                <div className="pt-modal-body">
                  {closingDateHistoryLoading ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: palette.inkSoft }}>
                      <RefreshCw size={24} className="fr-spin" style={{ margin: '0 auto 12px', display: 'block' }} />
                      Loading closing date history...
                    </div>
                  ) : currentDealHistory && currentDealHistory.length > 0 ? (
                    <DetailTable
                      columns={historyColumns}
                      loading={false}
                      emptyText="No closing date history found"
                      rowKey={(h, i) => h.timeline_id ?? i}
                      rows={[...currentDealHistory].sort((a, b) => new Date(b.closing_date_modified_time) - new Date(a.closing_date_modified_time))}
                    />
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
              className="pt-modal-overlay"
              style={{ backdropFilter: 'blur(2px)', zIndex: 99999 }}
              onClick={() => setShowClosingDateEditModal(false)}
            >
              <div
                className="pt-modal pt-modal-edit"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="pt-modal-head">
                  <div style={{ minWidth: 0 }}>
                    <h3
                      className="fr-display"
                      style={{ fontSize: '18px', fontWeight: 500, color: palette.ink, margin: 0 }}
                    >
                      Edit Closing Date
                    </h3>
                    <p
                      className="fr-body"
                      style={{ fontSize: '13px', color: palette.inkSoft, margin: '4px 0 0 0', overflowWrap: 'anywhere' }}
                    >
                      Deal: {editingClosingDateDeal?.deal_name || 'Unknown Deal'}
                    </p>
                  </div>
                  <button
                    className="pt-icon-btn"
                    onClick={() => setShowClosingDateEditModal(false)}
                    onMouseEnter={(e) => e.currentTarget.style.background = palette.canvas}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                  >
                    <X size={20} color={palette.inkSoft} />
                  </button>
                </div>

                {/* Modal Content */}
                <div className="pt-modal-body" style={{ padding: '24px' }}>
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
                        fontSize: '16px',
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
                <div className="pt-modal-foot">
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