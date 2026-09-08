import { useState, useEffect, useRef } from "react";
import {
  Users, Target, DollarSign, CheckCircle, FileText, IndianRupee,
  RefreshCw, X, Search, ArrowUpRight, ChevronDown, BarChart3
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
  const [selectedOwner, setSelectedOwner] = useState('');
  const [ownerOptions, setOwnerOptions] = useState([]);
  const [showOwnerDropdown, setShowOwnerDropdown] = useState(false);
  const [metrics, setMetrics] = useState({
    totalProspects: 0,
    totalDeals: 0,
    invoicedAmount: 0,
    paidAmount: 0,
    totalDealAmount: 0,
    closedLostAmount: 0,
    pendingAmount: 0
  });
  const [accountsData, setAccountsData] = useState(null);
  const [showAccountsTable, setShowAccountsTable] = useState(false);
  const [dealsData, setDealsData] = useState(null);
  const [otherDealsData, setOtherDealsData] = useState(null);
  const [paidInvoicedData, setPaidInvoicedData] = useState(null);
  const [paidData, setPaidData] = useState(null);
  const [closedLostDealsData, setClosedLostDealsData] = useState(null);
  const [showDealsTable, setShowDealsTable] = useState(false);
  const [showOwnerSummaryTable, setShowOwnerSummaryTable] = useState(false);
  const [ownerSummaryData, setOwnerSummaryData] = useState(null);
  const [dealsFilterType, setDealsFilterType] = useState('all'); // 'all', 'invoiced', 'paid', 'closed_lost'
  const [accountsSearchTerm, setAccountsSearchTerm] = useState('');
  const [dealsSearchTerm, setDealsSearchTerm] = useState('');
  const [ownerSummarySearchTerm, setOwnerSummarySearchTerm] = useState('');
  const [selectedDealHistory, setSelectedDealHistory] = useState(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const displayName = user?.name || user?.fullName || user?.first_name || "Operation User";

  const formatNumber = (num) => {
    return num.toLocaleString();
  };

  const formatCurrency = (num) => {
    if (num >= 100000) {
      const lakhs = (num / 100000).toFixed(1);
      return `₹${lakhs} L`;
    }
    return '₹' + num.toLocaleString('en-IN', {
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

  const handleMonthSelect = (month) => {
    setSelectedMonth(month);
    // Trigger data refresh for the selected month
    fetchProspectData(month);
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
      const response = await axios.get(`${dropdownOptionsUrl}?category=contact_owner`);
      
      if (response.data && response.data.status === true) {
        const owners = response.data.data || [];
        setOwnerOptions(owners);
      }
    } catch (error) {
      console.error('Error fetching dropdown options:', error);
    }
  };

  const fetchProspectData = async (month = selectedMonth) => {
    try {
      setLoading(true);
      const apiMonth = convertMonthToApiFormat(month);
      const prospectStatsUrl = import.meta.env.VITE_PROSPECT_STATS_API_URL;
      
      let apiUrl = `${prospectStatsUrl}?month=${apiMonth}`;
      if (selectedOwner) {
        apiUrl += `&owner=${selectedOwner.toLowerCase()}`;
      }

      const response = await axios.get(apiUrl);

      if (response.data && response.data.status === 'success') {
        const data = response.data;
        
        // Update available months from API response
        if (data.filters && data.filters.available_months) {
          const monthLabels = extractMonthLabels(data.filters.available_months);
          setAvailableMonths(monthLabels);
          
          // Set the last month as default only on initial load
          if (isInitialLoad.current && monthLabels.length > 0) {
            const lastMonth = monthLabels[monthLabels.length - 1];
            setSelectedMonth(lastMonth);
            isInitialLoad.current = false;
            // Don't process data yet - let useEffect handle the real fetch
            setLoading(false);
            return;
          }
        }

        // Extract metrics from API response based on user requirements
        const totalProspects = data.accounts?.total_accounts || 0;
        const totalDeals = data.total_other?.total_deals || 0;
        const totalDealAmount = data.total_other?.total_amount || 0;
        const paidAmount = data.paid?.amount || 0;
        const invoicedAmount = data.paid_invoiced?.amount || 0;
        const closedLostAmount = data.closed_lost?.amount || 0;
        const pendingAmount = invoicedAmount - paidAmount;

        setMetrics({
          totalProspects,
          totalDeals: totalDeals,
          invoicedAmount: invoicedAmount,
          paidAmount,
          totalDealAmount: totalDealAmount > 0 ? totalDealAmount : 0,
          closedLostAmount: closedLostAmount > 0 ? closedLostAmount : 0,
          pendingAmount: pendingAmount > 0 ? pendingAmount : 0
        });

        // Store accounts data for table display
        setAccountsData(data.accounts?.details || []);
        
        // Store total_other deals data for table display (for Total Deals and Total Deal Amount cards)
        const totalOtherDeals = data.total_other?.details || [];
        setOtherDealsData(totalOtherDeals);
        
        // Store paid deals data for table display (for Paid Amount card)
        const paidDeals = data.paid?.details || [];
        setPaidData(paidDeals);
        
        // Store paid_invoiced deals data for table display (for Invoiced Amount card)
        const paidInvoicedDeals = data.paid_invoiced?.details || [];
        setPaidInvoicedData(paidInvoicedDeals);
        
        // Store closed lost deals separately for the closed lost card
        const closedLostDeals = data.closed_lost?.details || [];
        setClosedLostDealsData(closedLostDeals);

        setLastUpdated(new Date());
      } else {
        throw new Error('API returned unsuccessful status');
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching prospect data:', error);
      setMetrics({
        totalProspects: 0,
        totalDeals: 0,
        invoicedAmount: 0,
        paidAmount: 0,
        totalDealAmount: 0,
        closedLostAmount: 0,
        pendingAmount: 0
      });
      setLoading(false);
      toast.error('Failed to load prospect data');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchProspectData();
    setRefreshing(false);
    toast.success('Prospect data refreshed');
  };

  const fetchOwnerSummaryData = async () => {
    try {
      const apiMonth = convertMonthToApiFormat(selectedMonth);
      const ownerSummaryUrl = import.meta.env.VITE_OWNER_SUMMARY_API_URL;
      const apiUrl = `${ownerSummaryUrl}?month=${apiMonth}`;
      
      const response = await axios.get(apiUrl);
      
      if (response.data && response.data.status === 'success') {
        setOwnerSummaryData(response.data.owner_summary || []);
      } else {
        throw new Error('API returned unsuccessful status');
      }
    } catch (error) {
      console.error('Error fetching owner summary data:', error);
      toast.error('Failed to load owner summary data');
      setOwnerSummaryData([]);
    }
  };

  useEffect(() => {
    // Fetch dropdown options on mount
    fetchDropdownOptions();
    
    // Fetch initial prospect data with a default month to get available months
    // We'll use a temporary default, then switch to the last available month
    fetchProspectData('2026-09'); // Temporary default to get available months
  }, []);

  // Fetch data when selected month changes
  useEffect(() => {
    if (selectedMonth) {
      fetchProspectData(selectedMonth);
    }
  }, [selectedMonth]);

  // Refetch data when owner changes
  useEffect(() => {
    if (selectedOwner && selectedMonth) {
      fetchProspectData(selectedMonth);
    }
  }, [selectedOwner]);

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
        setAccountsSearchTerm('');
        setShowDealsTable(false); // Close deals table if open
        setShowOwnerSummaryTable(false); // Close owner summary table if open
        setShowAccountsTable(true);
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
        setDealsSearchTerm('');
        setDealsFilterType('total_other');
        setShowAccountsTable(false); // Close accounts table if open
        setShowOwnerSummaryTable(false); // Close owner summary table if open
        setShowDealsTable(true);
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
        setDealsSearchTerm('');
        setDealsFilterType('total_other');
        setShowAccountsTable(false);
        setShowOwnerSummaryTable(false);
        setShowDealsTable(true);
      }
    },
    {
      key: 'invoicedAmount',
      title: 'Invoiced Amount',
      value: metrics.invoicedAmount,
      icon: FileText,
      accent: palette.amberDeep,
      subtitle: metrics.totalDealAmount && metrics.totalDealAmount > 0 
        ? `${((metrics.invoicedAmount / metrics.totalDealAmount) * 100).toFixed(1)}% of total` 
        : 'Total invoiced value',
      isCurrency: true,
      onClick: () => {
        setDealsSearchTerm('');
        setDealsFilterType('paid_invoiced');
        setShowAccountsTable(false); // Close accounts table if open
        setShowOwnerSummaryTable(false); // Close owner summary table if open
        setShowDealsTable(true);
      }
    },
    {
      key: 'paidAmount',
      title: 'Paid Amount',
      value: metrics.paidAmount,
      icon: IndianRupee,
      accent: palette.teal,
      subtitle: metrics.totalDealAmount && metrics.totalDealAmount > 0 
        ? `${((metrics.paidAmount / metrics.totalDealAmount) * 100).toFixed(1)}% of total` 
        : 'Amount collected',
      isCurrency: true,
      onClick: () => {
        setDealsSearchTerm('');
        setDealsFilterType('paid');
        setShowAccountsTable(false); // Close accounts table if open
        setShowOwnerSummaryTable(false); // Close owner summary table if open
        setShowDealsTable(true);
      }
    },
    {
      key: 'closedLostAmount',
      title: 'Closed Lost Amount',
      value: metrics.closedLostAmount,
      icon: X,
      accent: palette.rust,
      subtitle: metrics.totalDealAmount && metrics.totalDealAmount > 0 
        ? `${((metrics.closedLostAmount / metrics.totalDealAmount) * 100).toFixed(1)}% of total` 
        : 'Lost deal value',
      isCurrency: true,
      onClick: () => {
        setDealsSearchTerm('');
        setDealsFilterType('closed_lost');
        setShowAccountsTable(false);
        setShowOwnerSummaryTable(false);
        setShowDealsTable(true);
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
        setOwnerSummarySearchTerm('');
        setShowAccountsTable(false);
        setShowDealsTable(false);
        setShowOwnerSummaryTable(true);
        fetchOwnerSummaryData();
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
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
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
            <div style={{ position: 'relative' }}>
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
                {selectedOwner || 'All Owners'}
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
                      setSelectedOwner('');
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
              <p
                className="fr-body"
                style={{ color: '#2b2a29', fontSize: '14px', marginTop: '8px', maxWidth: '480px' }}
              >
                Track your prospect pipeline performance — from initial leads to final payments.
              </p>
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
                    borderRadius: '12px',
                    padding: '18px 20px 20px',
                    border: `1px solid #b3b4b4`,
                    cursor: card.onClick ? 'pointer' : 'default',
                    transition: 'transform 0.18s ease, box-shadow 0.18s ease, background-color 0.18s ease, border-color 0.18s ease',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = '0 10px 24px rgba(22, 36, 28, 0.08)';
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
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: `${card.accent}1A`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Icon size={16} color={card.accent} />
                    </div>
                  </div>

                  <div
                    className="fr-mono"
                    style={{ fontSize: '30px', fontWeight: 600, color: palette.ink, marginTop: '14px', lineHeight: 1 }}
                  >
                    {typeof card.value === 'string' ? card.value : (card.isCurrency ? formatCurrency(card.value) : formatNumber(card.value))}
                  </div>
                  {(card.key === 'invoicedAmount' || card.key === 'paidAmount' || card.key === 'closedLostAmount') && metrics.totalDealAmount && metrics.totalDealAmount > 0 && typeof card.value === 'number' && (
                    <div
                      style={{
                        fontSize: '12px',
                        color: card.accent,
                        fontWeight: 600,
                        marginTop: '4px',
                        opacity: 0.85
                      }}
                    >
                      {((card.value / metrics.totalDealAmount) * 100).toFixed(1)}% of total
                    </div>
                  )}

                  <div className="fr-body" style={{ fontSize: '13px', color: palette.inkSoft, marginTop: '6px', fontWeight: 500 }}>
                    {card.title}
                  </div>

                  {card.onClick && (
                    <div
                      className="fr-card-arrow"
                      style={{
                        position: 'absolute',
                        top: '18px',
                        right: '18px',
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

          {/* Accounts Table */}
          {showAccountsTable && (
            <div className="sa-table-card" style={{ marginTop: '24px' }}>
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
                    Account Details
                  </h3>
                  <p
                    className="fr-body"
                    style={{
                      fontSize: '13px',
                      color: palette.inkSoft,
                      margin: '4px 0 0 0'
                    }}
                  >
                    Total Accounts: {accountsData?.length || 0} | Month: {selectedMonth}
                  </p>
                </div>
                <button
                  onClick={() => setShowAccountsTable(false)}
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
                    placeholder="Search by name, account, account number, contact, owner, city, type, deals..."
                    value={accountsSearchTerm}
                    onChange={(e) => setAccountsSearchTerm(e.target.value)}
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
              <div style={{ overflowX: 'auto' }}>
                <table className="sa-table">
                  <thead>
                    <tr>
                      <th>Prospect Name</th>
                      <th>Account Name</th>
                      <th>Account Number</th>
                      <th>Contact</th>
                      <th>Owner</th>
                      <th>City</th>
                      <th>Account Type</th>
                      <th>Deals</th>
                      <th>Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accountsData && accountsData.length > 0 ? (
                      accountsData
                        .filter(account => 
                          accountsSearchTerm === '' || 
                          account.full_name?.toLowerCase().includes(accountsSearchTerm.toLowerCase()) ||
                          account.account_name?.toLowerCase().includes(accountsSearchTerm.toLowerCase()) ||
                          account.account_number?.toLowerCase().includes(accountsSearchTerm.toLowerCase()) ||
                          account.email?.toLowerCase().includes(accountsSearchTerm.toLowerCase()) ||
                          account.phone?.includes(accountsSearchTerm) ||
                          account.owner?.toLowerCase().includes(accountsSearchTerm.toLowerCase()) ||
                          account.city?.toLowerCase().includes(accountsSearchTerm.toLowerCase()) ||
                          account.account_type?.toLowerCase().includes(accountsSearchTerm.toLowerCase()) ||
                          String(account.deal_present).includes(accountsSearchTerm)
                        )
                        .map((account, index) => (
                        <tr key={account.id || index} className="sa-table-row">
                          <td>
                            <div className="sa-manager-cell">
                              <div className="sa-avatar">
                                {account.full_name?.charAt(0)?.toUpperCase() || 'P'}
                              </div>
                              <div>
                                <div className="sa-manager-name">{account.full_name || 'N/A'}</div>
                              </div>
                            </div>
                          </td>
                          <td>{account.account_name || 'N/A'}</td>
                          <td>
                            <span style={{ fontFamily: 'var(--font-mono), monospace', fontSize: '13px', color: palette.ink }}>
                              {account.account_number || 'N/A'}
                            </span>
                          </td>
                          <td>
                            <div style={{ fontSize: '13px' }}>
                              <div style={{ fontWeight: 500 }}>{account.phone || 'N/A'}</div>
                              <div style={{ fontSize: '11px', color: palette.inkSoft }}>
                                {account.email || 'No email'}
                              </div>
                            </div>
                          </td>
                          <td>
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '4px 10px',
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontWeight: 600,
                                background: '#DCFCE7',
                                color: '#166534'
                              }}
                            >
                              {account.owner || 'Unassigned'}
                            </span>
                          </td>
                          <td>{account.city || 'N/A'}</td>
                          <td>{account.account_type || 'N/A'}</td>
                          <td>
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '4px 8px',
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontWeight: 600,
                                background: account.deal_present > 0 ? '#DCFCE7' : '#F1F5F9',
                                color: account.deal_present > 0 ? '#166534' : '#64748B'
                              }}
                            >
                              {account.deal_present || 0}
                            </span>
                          </td>
                          <td>
                            {account.created_time 
                              ? new Date(account.created_time).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric'
                                })
                              : 'N/A'
                            }
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="9" style={{ textAlign: 'center', padding: '40px', color: palette.inkSoft }}>
                          {loading ? 'Loading accounts...' : 'No accounts found'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Deals Table */}
          {showDealsTable && (
            <div className="sa-table-card" style={{ marginTop: '24px' }}>
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
                    {dealsFilterType === 'total_other' ? 'All Deals' : 
                     dealsFilterType === 'paid_invoiced' ? 'Invoiced Deals' : 
                     dealsFilterType === 'paid' ? 'Paid Deals' : 
                     dealsFilterType === 'closed_lost' ? 'Closed Lost Deals' : 'Deals'}: {(() => {
                       if (dealsFilterType === 'total_other') {
                         return otherDealsData?.length || 0;
                       } else if (dealsFilterType === 'paid_invoiced') {
                         return paidInvoicedData?.length || 0;
                       } else if (dealsFilterType === 'paid') {
                         return paidData?.length || 0;
                       } else if (dealsFilterType === 'closed_lost') {
                         return closedLostDealsData?.length || 0;
                       } else {
                         return dealsData?.length || 0;
                       }
                     })()} | Month: {selectedMonth}
                  </p>
                </div>
                <button
                  onClick={() => setShowDealsTable(false)}
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
                  borderBottom: `1px solid ${palette.border}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '16px'
                }}
              >
                <div
                  style={{
                    position: 'relative',
                    maxWidth: '400px',
                    flex: 1
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
                    placeholder="Search by deal, contact, account number, stage, owner, amount..."
                    value={dealsSearchTerm}
                    onChange={(e) => setDealsSearchTerm(e.target.value)}
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
                
                {/* Filter Buttons */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => setDealsFilterType('total_other')}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: `1px solid ${dealsFilterType === 'total_other' ? palette.growth : palette.border}`,
                      background: dealsFilterType === 'total_other' ? palette.growth : palette.surface,
                      color: dealsFilterType === 'total_other' ? '#ffffff' : palette.ink,
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s'
                    }}
                    onMouseEnter={(e) => {
                      if (dealsFilterType !== 'total_other') {
                        e.currentTarget.style.background = palette.canvas;
                        e.currentTarget.style.borderColor = palette.growth;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (dealsFilterType !== 'total_other') {
                        e.currentTarget.style.background = palette.surface;
                        e.currentTarget.style.borderColor = palette.border;
                      }
                    }}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setDealsFilterType('paid_invoiced')}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: `1px solid ${dealsFilterType === 'paid_invoiced' ? palette.amberDeep : palette.border}`,
                      background: dealsFilterType === 'paid_invoiced' ? palette.amberDeep : palette.surface,
                      color: dealsFilterType === 'paid_invoiced' ? '#ffffff' : palette.ink,
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s'
                    }}
                    onMouseEnter={(e) => {
                      if (dealsFilterType !== 'paid_invoiced') {
                        e.currentTarget.style.background = palette.canvas;
                        e.currentTarget.style.borderColor = palette.amberDeep;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (dealsFilterType !== 'paid_invoiced') {
                        e.currentTarget.style.background = palette.surface;
                        e.currentTarget.style.borderColor = palette.border;
                      }
                    }}
                  >
                    Invoiced
                  </button>
                  <button
                    onClick={() => setDealsFilterType('paid')}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: `1px solid ${dealsFilterType === 'paid' ? palette.teal : palette.border}`,
                      background: dealsFilterType === 'paid' ? palette.teal : palette.surface,
                      color: dealsFilterType === 'paid' ? '#ffffff' : palette.ink,
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s'
                    }}
                    onMouseEnter={(e) => {
                      if (dealsFilterType !== 'paid') {
                        e.currentTarget.style.background = palette.canvas;
                        e.currentTarget.style.borderColor = palette.teal;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (dealsFilterType !== 'paid') {
                        e.currentTarget.style.background = palette.surface;
                        e.currentTarget.style.borderColor = palette.border;
                      }
                    }}
                  >
                    Paid
                  </button>
                  <button
                    onClick={() => setDealsFilterType('closed_lost')}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: `1px solid ${dealsFilterType === 'closed_lost' ? palette.rust : palette.border}`,
                      background: dealsFilterType === 'closed_lost' ? palette.rust : palette.surface,
                      color: dealsFilterType === 'closed_lost' ? '#ffffff' : palette.ink,
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s'
                    }}
                    onMouseEnter={(e) => {
                      if (dealsFilterType !== 'closed_lost') {
                        e.currentTarget.style.background = palette.canvas;
                        e.currentTarget.style.borderColor = palette.rust;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (dealsFilterType !== 'closed_lost') {
                        e.currentTarget.style.background = palette.surface;
                        e.currentTarget.style.borderColor = palette.border;
                      }
                    }}
                  >
                    Closed Lost
                  </button>
                </div>
              </div>

              {/* Table Content */}
              <div style={{ overflowX: 'auto' }}>
                <table className="sa-table">
                  <thead>
                    <tr>
                      <th>Deal Name</th>
                      <th>Contact Name</th>
                      <th>Account Number</th>
                      <th>Amount</th>
                      <th>Stage</th>
                      <th>Deal Owner</th>
                      <th>Closing Date</th>
                      <th>Created Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      // Combine deals based on filter type
                      let filteredDeals = [];
                      if (dealsFilterType === 'total_other') {
                        // Show total_other deals (for Total Deals and Total Deal Amount cards)
                        filteredDeals = otherDealsData || [];
                      } else if (dealsFilterType === 'paid_invoiced') {
                        // Show paid_invoiced deals (for Invoiced Amount card)
                        filteredDeals = paidInvoicedData || [];
                      } else if (dealsFilterType === 'paid') {
                        // Show paid deals (for Paid Amount card)
                        filteredDeals = paidData || [];
                      } else if (dealsFilterType === 'closed_lost') {
                        // Show closed lost deals (for Closed Lost Amount card)
                        filteredDeals = closedLostDealsData || [];
                      } else {
                        filteredDeals = dealsData || [];
                      }
                      
                      return filteredDeals.length > 0 ? (
                        filteredDeals
                          .filter(deal => {
                            // Find the associated account to get the contact name for search
                            const associatedAccount = accountsData.find(account => account.id === deal.account_id);
                            const contactName = deal.account_name || associatedAccount?.full_name || '';
                            const accountNumber = deal.account_number || associatedAccount?.account_number || '';
                            
                            // Apply search filter
                            const matchesSearch = dealsSearchTerm === '' || 
                              deal.deal_name?.toLowerCase().includes(dealsSearchTerm.toLowerCase()) ||
                              contactName.toLowerCase().includes(dealsSearchTerm.toLowerCase()) ||
                              String(accountNumber).toLowerCase().includes(dealsSearchTerm.toLowerCase()) ||
                              deal.deal_stage?.toLowerCase().includes(dealsSearchTerm.toLowerCase()) ||
                              deal.deal_owner?.toLowerCase().includes(dealsSearchTerm.toLowerCase()) ||
                              String(deal.deal_amount).includes(dealsSearchTerm);
                            
                            return matchesSearch;
                          })
                        .map((deal, index) => {
                          // Find the associated account to get the contact name (full_name)
                          const associatedAccount = accountsData.find(account => account.id === deal.account_id);
                          const contactName = deal.account_name || associatedAccount?.full_name || 'N/A';
                          const accountNumber = deal.account_number || associatedAccount?.account_number || 'N/A';
                          
                          return (
                        <tr key={deal.deal_id || index} className="sa-table-row">
                          <td>
                            <div className="sa-manager-name">{deal.deal_name || 'N/A'}</div>
                          </td>
                          <td>
                            <div className="sa-manager-name">{contactName}</div>
                          </td>
                          <td>
                            <span style={{ fontFamily: 'var(--font-mono), monospace', fontSize: '13px', color: palette.ink }}>
                              {accountNumber}
                            </span>
                          </td>
                          <td>
                            <span style={{ fontWeight: 600, color: palette.ink }}>
                              {formatCurrency(deal.deal_amount || 0)}
                            </span>
                          </td>
                          <td>
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '4px 8px',
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontWeight: 600,
                                background: deal.deal_stage === 'Paid' ? '#DCFCE7' : 
                                           deal.deal_stage === 'Invoiced' ? '#FEF3C7' :
                                           deal.deal_stage === 'Closed Won' ? '#DCFCE7' :
                                           deal.deal_stage === 'Proposal' ? '#DBEAFE' :
                                           deal.deal_stage === 'Opportunity' ? '#E0E7FF' :
                                           deal.deal_stage === 'Negotiation' ? '#FEF3C7' :
                                           '#F1F5F9',
                                color: deal.deal_stage === 'Paid' ? '#166534' :
                                       deal.deal_stage === 'Invoiced' ? '#92400E' :
                                       deal.deal_stage === 'Closed Won' ? '#166534' :
                                       deal.deal_stage === 'Proposal' ? '#1E40AF' :
                                       deal.deal_stage === 'Opportunity' ? '#4338CA' :
                                       deal.deal_stage === 'Negotiation' ? '#92400E' :
                                       '#64748B'
                              }}
                            >
                              {deal.deal_stage || 'N/A'}
                            </span>
                          </td>
                          <td>
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '4px 10px',
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontWeight: 600,
                                background: '#DCFCE7',
                                color: '#166534'
                              }}
                            >
                              {deal.deal_owner || 'Unassigned'}
                            </span>
                          </td>
                          <td>
                            {deal.deal_close_date 
                              ? (
                                <span
                                  onClick={() => {
                                    if (deal.deal_close_date_history && deal.deal_close_date_history.length > 0) {
                                      setSelectedDealHistory(deal);
                                      setShowHistoryModal(true);
                                    }
                                  }}
                                  style={{
                                    cursor: deal.deal_close_date_history && deal.deal_close_date_history.length > 0 ? 'pointer' : 'default',
                                    color: deal.deal_close_date_history && deal.deal_close_date_history.length > 0 ? '#3B82F6' : palette.ink,
                                    textDecoration: deal.deal_close_date_history && deal.deal_close_date_history.length > 0 ? 'underline' : 'none'
                                  }}
                                >
                                  {new Date(deal.deal_close_date).toLocaleDateString('en-IN', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric'
                                  })}
                                </span>
                              )
                              : 'N/A'
                            }
                          </td>
                          <td>
                            {deal.created_time 
                              ? new Date(deal.created_time).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric'
                                })
                              : 'N/A'
                            }
                          </td>
                        </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: palette.inkSoft }}>
                          {loading ? 'Loading deals...' : `No ${dealsFilterType === 'total_other' ? '' : dealsFilterType.replace('_', ' ')} deals found`}
                        </td>
                      </tr>
                    );
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Owner Summary Table */}
          {showOwnerSummaryTable && (
            <div className="sa-table-card" style={{ marginTop: '24px' }}>
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
              <div style={{ overflowX: 'auto' }}>
                <table className="sa-table">
                  <thead>
                    <tr>
                      <th>Owner</th>
                      <th>Accounts Count</th>
                      <th>Deals Amount</th>
                      <th>Paid Amount</th>
                      <th>Invoiced Amount</th>
                      <th>Closed Lost Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ownerSummaryData && ownerSummaryData.length > 0 ? (
                      ownerSummaryData
                        .filter(owner => 
                          ownerSummarySearchTerm === '' || 
                          owner.owner?.toLowerCase().includes(ownerSummarySearchTerm.toLowerCase())
                        )
                        .map((owner, index) => (
                        <tr key={owner.owner || index} className="sa-table-row">
                          <td>
                            <div className="sa-manager-name">{owner.owner || 'N/A'}</div>
                          </td>
                          <td>
                            <span style={{ fontWeight: 600, color: palette.ink }}>
                              {owner.accounts?.count || 0}
                            </span>
                          </td>
                          <td>
                            <div>
                              <div style={{ fontSize: '16px', fontWeight: 700, color: palette.ink }}>
                                {formatCurrency(owner.deals?.amount || 0)}
                              </div>
                              <div style={{ fontSize: '15px', color: palette.inkSoft, fontWeight: 600 }}>
                                {owner.deals?.count || 0} deals
                              </div>
                            </div>
                          </td>
                          <td>
                            <div>
                              <div style={{ fontSize: '16px', fontWeight: 700, color: palette.teal }}>
                                {formatCurrency(owner.paid?.amount || 0)}
                              </div>
                              <div style={{ fontSize: '12px', color: palette.inkSoft, fontWeight: 600 }}>
                                {owner.paid?.count || 0} paid
                              </div>
                              {owner.deals?.amount > 0 && (
                                <div style={{ fontSize: '11px', color: palette.teal, fontWeight: 500, marginTop: '2px' }}>
                                  {((owner.paid?.amount || 0) / owner.deals?.amount * 100).toFixed(1)}%
                                </div>
                              )}
                            </div>
                          </td>
                          <td>
                            <div>
                              <div style={{ fontSize: '16px', fontWeight: 700, color: palette.amberDeep }}>
                                {formatCurrency(owner.paid_invoiced?.amount || 0)}
                              </div>
                              <div style={{ fontSize: '12px', color: palette.inkSoft, fontWeight: 600 }}>
                                {owner.paid_invoiced?.count || 0} invoiced
                              </div>
                              {owner.deals?.amount > 0 && (
                                <div style={{ fontSize: '11px', color: palette.amberDeep, fontWeight: 500, marginTop: '2px' }}>
                                  {((owner.paid_invoiced?.amount || 0) / owner.deals?.amount * 100).toFixed(1)}%
                                </div>
                              )}
                            </div>
                          </td>
                          <td>
                            <div>
                              <div style={{ fontSize: '16px', fontWeight: 700, color: palette.rust }}>
                                {formatCurrency(owner.closed_lost?.amount || 0)}
                              </div>
                              <div style={{ fontSize: '12px', color: palette.inkSoft, fontWeight: 600 }}>
                                {owner.closed_lost?.count || 0} lost
                              </div>
                              {owner.deals?.amount > 0 && (
                                <div style={{ fontSize: '11px', color: palette.rust, fontWeight: 500, marginTop: '2px' }}>
                                  {((owner.closed_lost?.amount || 0) / owner.deals?.amount * 100).toFixed(1)}%
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: palette.inkSoft }}>
                          No owner summary data found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Deal Close Date History Modal */}
          {showHistoryModal && selectedDealHistory && (
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000
              }}
              onClick={() => setShowHistoryModal(false)}
            >
              <div
                style={{
                  background: palette.surface,
                  borderRadius: '12px',
                  maxWidth: '600px',
                  width: '90%',
                  maxHeight: '80vh',
                  overflow: 'auto',
                  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
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
                      Deal Close Date History
                    </h3>
                    <p
                      className="fr-body"
                      style={{
                        fontSize: '13px',
                        color: palette.inkSoft,
                        margin: '4px 0 0 0'
                      }}
                    >
                      Deal: {selectedDealHistory.deal_name || 'N/A'}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowHistoryModal(false)}
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
                <div style={{ padding: '24px' }}>
                  {selectedDealHistory.deal_close_date_history && selectedDealHistory.deal_close_date_history.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {selectedDealHistory.deal_close_date_history.map((historyItem, index) => (
                        <div
                          key={index}
                          style={{
                            padding: '16px',
                            borderRadius: '8px',
                            background: palette.canvas,
                            border: `1px solid ${palette.border}`
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <div style={{ fontSize: '13px', fontWeight: 600, color: palette.ink }}>
                              Change #{index + 1}
                            </div>
                            <div style={{ fontSize: '12px', color: palette.inkSoft }}>
                              {historyItem.deal_close_date_changed_at 
                                ? new Date(historyItem.deal_close_date_changed_at).toLocaleString('en-IN', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })
                                : 'N/A'
                              }
                            </div>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div>
                              <div style={{ fontSize: '11px', color: palette.inkSoft, marginBottom: '4px' }}>
                                Previous Date
                              </div>
                              <div style={{ fontSize: '13px', color: palette.ink }}>
                                {historyItem.deal_close_date_old 
                                  ? new Date(historyItem.deal_close_date_old).toLocaleDateString('en-IN', {
                                      day: 'numeric',
                                      month: 'short',
                                      year: 'numeric'
                                    })
                                  : 'N/A'
                                }
                              </div>
                            </div>
                            <div>
                              <div style={{ fontSize: '11px', color: palette.inkSoft, marginBottom: '4px' }}>
                                New Date
                              </div>
                              <div style={{ fontSize: '13px', color: palette.growth, fontWeight: 600 }}>
                                {historyItem.deal_close_date_new 
                                  ? new Date(historyItem.deal_close_date_new).toLocaleDateString('en-IN', {
                                      day: 'numeric',
                                      month: 'short',
                                      year: 'numeric'
                                    })
                                  : 'N/A'
                                }
                              </div>
                            </div>
                          </div>
                          <div style={{ marginTop: '8px', fontSize: '12px', color: palette.inkSoft }}>
                            Changed by: <span style={{ color: palette.ink, fontWeight: 500 }}>
                              {historyItem.deal_close_date_changed_by || 'N/A'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '40px', color: palette.inkSoft }}>
                      No history available
                    </div>
                  )}
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