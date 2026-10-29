import { useState, useEffect } from "react";
import {
  Users, Target, DollarSign, CheckCircle, FileText, Leaf, Sprout, IndianRupee,
  TrendingUp, ArrowUpRight, ArrowDownRight, RefreshCw, Radio, Filter
} from "lucide-react";
import axios from "axios";
import toast from 'react-hot-toast';
import "../styles/Sat2FarmAdminPortal.css";

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
};

export default function OperationDashboard({ user, onPageChange }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [showFilter, setShowFilter] = useState(false);
  const [filterType, setFilterType] = useState('month'); // 'month', 'year', 'custom'
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [availableYears, setAvailableYears] = useState([]);
  const [metrics, setMetrics] = useState({
    leads: 0,
    interested: 0,
    deals: 0,
    closedWonDeals: 0,
    invoiced: 0,
    assignedToGreenTeam: 0,
    leadsGrowth: 0,
    dealsGrowth: 0,
    revenueGrowth: 0,
    totalDealValue: 0,
    closedWonAmount: 0,
    invoicedPaidAmount: 0
  });

  const displayName = user?.name || user?.fullName || user?.first_name || "Operation User";

  const formatNumber = (num) => {
    return num.toLocaleString();
  };

  const formatCurrency = (num) => {
  return '₹' + num.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

  const calculateConversionRate = (value, total) => {
    if (total === 0) return 0;
    return ((value / total) * 100).toFixed(1);
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

  const fetchDashboardData = async (filterParams = null) => {
  try {
    setLoading(true);
    const currentUserName = user?.name || user?.phone_number || 'Operation';
    const encodedUser = encodeURIComponent(currentUserName);
    const baseUrl = import.meta.env.VITE_OPERATION_DASHBOARD_API_URL;

    // Build URL with filter parameters if provided
    let url = `${baseUrl}?user=${encodedUser}`;
    if (filterParams) {
      if (filterParams.month) {
        url += `&month=${filterParams.month}`;
      }
      if (filterParams.year) {
        url += `&year=${filterParams.year}`;
      }
      if (filterParams.startDate && filterParams.endDate) {
        // Convert date format from YYYY-MM-DD to MM/DD/YYYY
        const formatDate = (dateStr) => {
          const [year, month, day] = dateStr.split('-');
          return `${month}/${day}/${year}`;
        };
        url += `&filter&custom&from_date=${formatDate(filterParams.startDate)}&to_date=${formatDate(filterParams.endDate)}`;
      }
    }

    // Fetch counts from operation_dashboard API
    const countsResponse = await axios.get(url);
    console.log('Operation Dashboard Counts Response:', countsResponse.data);

    const leadsCount = countsResponse.data?.total_leads || 0;
    const totalOpportunitiesCount = countsResponse.data?.total_accounts || 0;
    const dealsCount = countsResponse.data?.total_deals || 0;
    const closedWonDeals = countsResponse.data?.closed_won_deals || 0;
    const invoicedPaidCount = countsResponse.data?.invoiced_deals || 0;
    const paidCount = countsResponse.data?.paid_deals || 0;

    // Fetch deal data summary with same filter parameters
    let dealDataUrl = baseUrl;
    if (filterParams) {
      dealDataUrl += '?';
      if (filterParams.month) {
        dealDataUrl += `month=${filterParams.month}&`;
      }
      if (filterParams.year) {
        dealDataUrl += `year=${filterParams.year}&`;
      }
      if (filterParams.startDate && filterParams.endDate) {
        // Convert date format from YYYY-MM-DD to MM/DD/YYYY
        const formatDate = (dateStr) => {
          const [year, month, day] = dateStr.split('-');
          return `${month}/${day}/${year}`;
        };
        dealDataUrl += `filter&custom&from_date=${formatDate(filterParams.startDate)}&to_date=${formatDate(filterParams.endDate)}`;
      }
      // Remove trailing & if present
      dealDataUrl = dealDataUrl.endsWith('&') ? dealDataUrl.slice(0, -1) : dealDataUrl;
    }
    const dealDataResponse = await axios.get(dealDataUrl);
    console.log('Deal Data Summary API Response:', dealDataResponse.data);

    const totalDealValue = parseFloat(dealDataResponse.data?.total_deal_amount || 0);
    console.log('Total Deal Value:', totalDealValue);

    // Extract amounts from data array based on deal_stage
    const dealData = dealDataResponse.data?.data || [];
    const closedWonAmount = parseFloat(dealData.find(item => item.deal_stage === 'Closed Won')?.deal_amount || 0);
    console.log('Closed Won Amount:', closedWonAmount);

    const invoicedAmount = parseFloat(dealData.find(item => item.deal_stage === 'Invoiced')?.deal_amount || 0);
    console.log('Invoiced Amount:', invoicedAmount);

    const paidAmount = parseFloat(dealData.find(item => item.deal_stage === 'Paid')?.deal_amount || 0);
    console.log('Paid Amount:', paidAmount);

    // Green team count is already in dealDataResponse
    const assignedToGreenTeam = dealDataResponse.data?.green_team_assigned || 0;
    console.log('Assigned to Green Team:', assignedToGreenTeam);

    setMetrics({
      leads: leadsCount,
      interested: interestedCount,
      deals: dealsCount,
      closedWonDeals: totalClosedWon,
      invoiced: invoicedCount,
      assignedToGreenTeam: 0,
      leadsGrowth: 0,
      dealsGrowth: 0,
      revenueGrowth: 0,
      totalDealValue,
      closedWonAmount,
      invoicedPaidAmount: totalInvoicedPaid
    });

    setLastUpdated(new Date());
    setLoading(false);
  } catch (error) {
    console.error('Error fetching operation dashboard data:', error);
    setMetrics({
      leads: 0,
      interested: 0,
      deals: 0,
      closedWonDeals: 0,
      invoiced: 0,
      assignedToGreenTeam: 0,
      leadsGrowth: 0,
      dealsGrowth: 0,
      revenueGrowth: 0,
      totalDealValue: 0,
      closedWonAmount: 0,
      invoicedPaidAmount: 0
    });
    setLoading(false);
    toast.error('Failed to load dashboard data');
  }
};

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
    toast.success('Dashboard refreshed');
  };

  const fetchAvailableYears = async () => {
    try {
      const baseUrl = import.meta.env.VITE_OPERATION_DASHBOARD_API_URL;
      const response = await axios.get(`${baseUrl}?filter`);
      console.log('Available Years API Response:', response.data);
      const years = response.data?.available_years || [];
      setAvailableYears(years);
    } catch (error) {
      console.error('Error fetching available years:', error);
      setAvailableYears([]);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    fetchAvailableYears();
  }, []);

  // ---- Field Report metric definitions -----------------------------------
  // Each metric is framed as a stage in a growing season, since Sat2Farm's
  // whole product is about tracking crops from sowing to harvest.
  const dashboardCards = [
    {
      key: 'leads',
      code: '01',
      stage: 'Sown',
      title: 'Leads',
      value: metrics.leads,
      icon: Users,
      accent: palette.pine,
      growth: metrics.leadsGrowth,
      onClick: () => onPageChange('lead-pipeline')
    },
    {
      key: 'interested',
      code: '02',
      stage: 'Sprouted',
      title: 'Interested',
      value: metrics.interested,
      icon: Target,
      accent: palette.amber,
      growth: 0,
      onClick: () => onPageChange('opportunities')
    },
    {
      key: 'deals',
      code: '03',
      stage: 'Rooted',
      title: 'Deals',
      value: metrics.deals,
      icon: DollarSign,
      accent: palette.slate,
      growth: metrics.dealsGrowth,
      onClick: () => onPageChange('opportunities')
    },
    {
      key: 'closedWonDeals',
      code: '04',
      stage: 'Harvested',
      title: 'Closed Won Deals',
      value: metrics.closedWonDeals,
      icon: CheckCircle,
      accent: palette.growth,
      growth: 0,
      onClick: () => onPageChange('opportunities')
    },
    {
      key: 'invoiced',
      code: '05',
      stage: 'Invoiced',
      title: 'Invoiced',
      value: metrics.invoiced,
      icon: FileText,
      accent: palette.amberDeep,
      growth: 0,
      onClick: null
    },
    {
      key: 'assignedToGreenTeam',
      code: '06',
      stage: 'Routed',
      title: 'Assigned to Green Team',
      value: metrics.assignedToGreenTeam,
      icon: Leaf,
      accent: palette.pineDeep,
      growth: 0,
      onClick: null
    }
  ];

  const funnelSteps = [
    { label: 'Sown', sub: 'Leads', value: metrics.leads, accent: palette.pine },
    { label: 'Sprouted', sub: 'Total Opportunity', value: metrics.totalOpportunities, accent: palette.amber },
    { label: 'Rooted', sub: 'Total Deals', value: metrics.deals, accent: palette.slate },
    { label: 'Harvested', sub: 'Closed Won Deals', value: metrics.closedWonDeals, accent: palette.growth },
    { label: 'Invoiced', sub: 'Invoiced', value: metrics.invoiced, accent: palette.amberDeep },
    { label: 'Paid', sub: 'Paid', value: metrics.paid, accent: palette.teal },
  ];
  const funnelBase = Math.max(metrics.leads, 1);

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
      `}</style>

      {/* Header */}
      <div className="topbar" style={{ borderBottom: `1px solid ${palette.border}` }}>
        <div className="tb-left">
          <div className="tb-page fr-body" style={{ fontWeight: 600, color: palette.ink }}>Dashboard</div>
        </div>
        <div className="tb-right" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
              borderRadius: '16px',
              background: 'linear-gradient(225deg, rgb(70 119 75) 0%, rgb(7 87 41) 100%)',
              padding: '32px 32px',
              marginBottom: '24px'
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
                style={{ color: '#ffffff', fontSize: '30px', fontWeight: 500, margin: 0, lineHeight: 1.2 }}
              >
                Welcome back, {displayName}
              </h1>
              <p
                className="fr-body"
                style={{ color: 'rgba(255,255,255,0.72)', fontSize: '14px', marginTop: '8px', maxWidth: '480px' }}
              >
                Your pipeline, tracked the way a season grows — from the first lead
                sown to the invoice that closes the cycle.
              </p>
            </div>
          </div>

          {/* Metric tiles */}
{loading ? (
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
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', marginTop: '0' }}>
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setShowFilter(!showFilter)}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            borderRadius: '6px',
            transition: 'background-color 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = `${palette.pine}15`}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <Filter size={20} color={palette.inkSoft} strokeWidth={2} />
        </button>

        {showFilter && (
          <div style={{
            position: 'fixed',
            top: '80px',
            right: '40px',
            background: palette.surface,
            border: `1px solid ${palette.border}`,
            borderRadius: '12px',
            padding: '20px',
            width: '320px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
            zIndex: 100
          }}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                fontSize: '13px',
                fontWeight: 500,
                color: palette.inkSoft,
                marginBottom: '8px',
                display: 'block'
              }}>
                Filter Type
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setFilterType('month')}
                  style={{
                    padding: '8px 12px',
                    border: `1px solid ${filterType === 'month' ? palette.pine : palette.border}`,
                    backgroundColor: filterType === 'month' ? `${palette.pine}15` : palette.surface,
                    color: filterType === 'month' ? palette.pine : palette.ink,
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: 500,
                    transition: 'all 0.2s ease',
                    flex: 1
                  }}
                >
                  Month
                </button>
                <button
                  onClick={() => setFilterType('year')}
                  style={{
                    padding: '8px 12px',
                    border: `1px solid ${filterType === 'year' ? palette.pine : palette.border}`,
                    backgroundColor: filterType === 'year' ? `${palette.pine}15` : palette.surface,
                    color: filterType === 'year' ? palette.pine : palette.ink,
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: 500,
                    transition: 'all 0.2s ease',
                    flex: 1
                  }}
                >
                  Year
                </button>
                <button
                  onClick={() => setFilterType('custom')}
                  style={{
                    padding: '8px 12px',
                    border: `1px solid ${filterType === 'custom' ? palette.pine : palette.border}`,
                    backgroundColor: filterType === 'custom' ? `${palette.pine}15` : palette.surface,
                    color: filterType === 'custom' ? palette.pine : palette.ink,
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: 500,
                    transition: 'all 0.2s ease',
                    flex: 1
                  }}
                >
                  Custom
                </button>
              </div>
            </div>

            {filterType === 'month' && (
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{
                    fontSize: '13px',
                    fontWeight: 500,
                    color: palette.inkSoft,
                    marginBottom: '8px',
                    display: 'block'
                  }}>
                    Month
                  </label>
                  <select
                    value={filterMonth}
                    onChange={(e) => setFilterMonth(parseInt(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: `1px solid ${palette.border}`,
                      borderRadius: '6px',
                      fontSize: '13px',
                      backgroundColor: palette.surface,
                      color: palette.ink,
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value={1}>January</option>
                    <option value={2}>February</option>
                    <option value={3}>March</option>
                    <option value={4}>April</option>
                    <option value={5}>May</option>
                    <option value={6}>June</option>
                    <option value={7}>July</option>
                    <option value={8}>August</option>
                    <option value={9}>September</option>
                    <option value={10}>October</option>
                    <option value={11}>November</option>
                    <option value={12}>December</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{
                    fontSize: '13px',
                    fontWeight: 500,
                    color: palette.inkSoft,
                    marginBottom: '8px',
                    display: 'block'
                  }}>
                    Year
                  </label>
                  <select
                    value={filterYear}
                    onChange={(e) => setFilterYear(parseInt(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: `1px solid ${palette.border}`,
                      borderRadius: '6px',
                      fontSize: '13px',
                      backgroundColor: palette.surface,
                      color: palette.ink,
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    {availableYears.length > 0 ? (
                      availableYears.map((year) => (
                        <option key={year} value={year}>{year}</option>
                      ))
                    ) : (
                      <option value={filterYear}>{filterYear}</option>
                    )}
                  </select>
                </div>
              </div>
            )}

            {filterType === 'year' && (
              <div>
                <label style={{
                  fontSize: '13px',
                  fontWeight: 500,
                  color: palette.inkSoft,
                  marginBottom: '8px',
                  display: 'block'
                }}>
                  Year
                </label>
                <select
                  value={filterYear}
                  onChange={(e) => setFilterYear(parseInt(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: `1px solid ${palette.border}`,
                    borderRadius: '6px',
                    fontSize: '13px',
                    backgroundColor: palette.surface,
                    color: palette.ink,
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {availableYears.length > 0 ? (
                    availableYears.map((year) => (
                      <option key={year} value={year}>{year}</option>
                    ))
                  ) : (
                    <option value={filterYear}>{filterYear}</option>
                  )}
                </select>
              </div>
            )}

            {filterType === 'custom' && (
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{
                    fontSize: '13px',
                    fontWeight: 500,
                    color: palette.inkSoft,
                    marginBottom: '8px',
                    display: 'block'
                  }}>
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: `1px solid ${palette.border}`,
                      borderRadius: '6px',
                      fontSize: '13px',
                      backgroundColor: palette.surface,
                      color: palette.ink,
                      outline: 'none'
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{
                    fontSize: '13px',
                    fontWeight: 500,
                    color: palette.inkSoft,
                    marginBottom: '8px',
                    display: 'block'
                  }}>
                    End Date
                  </label>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: `1px solid ${palette.border}`,
                      borderRadius: '6px',
                      fontSize: '13px',
                      backgroundColor: palette.surface,
                      color: palette.ink,
                      outline: 'none'
                    }}
                  />
                </div>
              </div>
            )}

            <div style={{ marginTop: '16px', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowFilter(false)}
                style={{
                  padding: '6px 12px',
                  border: `1px solid ${palette.border}`,
                  backgroundColor: palette.surface,
                  color: palette.ink,
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 500
                }}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  let filterParams = null;
                  const monthNames = ['', 'january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];

                  if (filterType === 'month') {
                    filterParams = {
                      month: monthNames[filterMonth],
                      year: filterYear
                    };
                  } else if (filterType === 'year') {
                    filterParams = {
                      year: filterYear
                    };
                  } else if (filterType === 'custom') {
                    filterParams = {
                      startDate: customStartDate,
                      endDate: customEndDate
                    };
                  }

                  console.log('Apply filter:', { filterType, filterParams });
                  await fetchDashboardData(filterParams);
                  setShowFilter(false);
                }}
                style={{
                  padding: '6px 12px',
                  border: `1px solid ${palette.pine}`,
                  backgroundColor: palette.pine,
                  color: '#ffffff',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 500
                }}
              >
                Apply
              </button>
            </div>
          </div>
        )}
      </div>
      <h2
        className="fr-display"
        style={{
          fontSize: '20px',
          fontWeight: 500,
          color: palette.ink,
          margin: '0'
        }}
      >
        Lead Data Summary
      </h2>
    </div>
    <div className="op-dashboard-grid">
      {dashboardCards.map((card, index) => {
        const Icon = card.icon;
        const barWidth = Math.min(100, (card.value / funnelBase) * 100);
        const isBaseline = card.key === 'leads';
        const showsConversion = card.key !== 'assignedToGreenTeam';

        // Calculate conversion rate based on card type
        let conversionRate = 0;
        if (card.key === 'deals') {
          conversionRate = calculateConversionRate(card.value, metrics.interested);
        } else if (card.key === 'closedWonDeals') {
          conversionRate = calculateConversionRate(card.value, metrics.deals);
        } else if (card.key === 'invoiced') {
          conversionRate = calculateConversionRate(card.value, metrics.closedWonDeals);
        } else if (card.key === 'interested') {
          conversionRate = calculateConversionRate(card.value, metrics.leads);
        }

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
              e.currentTarget.style.borderColor = palette.border;
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

              {showsConversion && (
                <div
                  className="fr-mono"
                  style={{
                    fontSize: '13px',
                    fontWeight: 700,
                    color: card.accent,
                    background: `${card.accent}14`,
                    padding: '3px 8px',
                    borderRadius: '999px',
                    whiteSpace: 'nowrap',
                    lineHeight: 1.4
                  }}
                >
                  {isBaseline ? 'BASELINE' : `${conversionRate}%`}
                </div>
              )}
            </div>

            <div
              className="fr-mono"
              style={{ fontSize: '30px', fontWeight: 600, color: palette.ink, marginTop: '14px', lineHeight: 1 }}
            >
              {formatNumber(card.value)}
            </div>

            <div className="fr-body" style={{ fontSize: '13px', color: palette.inkSoft, marginTop: '6px', fontWeight: 500 }}>
              {card.title}
              {showsConversion && !isBaseline && (
                <span style={{ color: palette.inkFaint, fontWeight: 400 }}> </span>
              )}
            </div>

            {/* Relative-to-leads mini bar */}
            <div style={{ marginTop: '12px', height: '4px', borderRadius: '999px', background: palette.canvas, overflow: 'hidden' }}>
              <div style={{ width: `${barWidth}%`, height: '100%', background: card.accent, borderRadius: '999px' }} />
            </div>

            {card.growth !== 0 && (
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                marginTop: '10px',
                padding: '2px 7px',
                borderRadius: '6px',
                backgroundColor: card.growth > 0 ? '#E4F1E9' : '#F6E4DF',
                color: card.growth > 0 ? palette.growth : palette.rust,
                fontSize: '11px',
                fontWeight: 600
              }}>
                {card.growth > 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {Math.abs(card.growth)}%
              </div>
            )}

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

    {/* Deal Amount Data Summary */}
    <h2
      className="fr-display"
      style={{
        fontSize: '20px',
        fontWeight: 500,
        color: palette.ink,
        marginBottom: '20px',
        marginTop: '0'
      }}
    >
      Deal Amount Data Summary
    </h2>
    <div className="op-deal-amount-grid">
      {[
        {
          key: 'totalDealValue',
          title: 'Total Deal Value',
          value: metrics.totalDealValue,
          icon: DollarSign,
          accent: palette.slate
        },
        {
          key: 'closedWonAmount',
          title: 'Closed Won Amount',
          value: metrics.closedWonAmount,
          icon: CheckCircle,
          accent: palette.growth
        },
        {
          key: 'invoicedPaidAmount',
          title: 'Invoiced + Paid Amount',
          value: metrics.invoicedPaidAmount,
          icon: FileText,
          accent: palette.amberDeep
        }
      ].map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={card.key}
            className="fr-card"
            style={{
              animationDelay: `${index * 0.05}s`,
              background: palette.surface,
              borderRadius: '12px',
              padding: '18px 20px 20px',
              border: `1px solid #b3b4b4`,
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
              e.currentTarget.style.borderColor = palette.border;
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
              {formatCurrency(card.value)}
            </div>

            <div className="fr-body" style={{ fontSize: '13px', color: palette.inkSoft, marginTop: '6px', fontWeight: 500 }}>
              {card.title}
            </div>
          </div>
        );
      })}
    </div>

              

              {/* Quick actions */}
              <div style={{
                background: palette.surface,
                borderRadius: '12px',
                padding: '24px',
                border: `1px solid ${palette.border}`
              }}>
                <h3
                  className="fr-display"
                  style={{
                    fontSize: '17px',
                    fontWeight: 500,
                    color: palette.ink,
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <TrendingUp size={18} color={palette.growth} />
                  Field Kit
                </h3>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '12px'
                }}>
                  {[
                    { label: 'Lead Pipeline', desc: 'Every seed still growing', icon: Users, page: 'lead-pipeline' },
                    { label: 'Opportunities', desc: 'Deals moving through the field', icon: Target, page: 'opportunities' },
                    { label: 'Acreages', desc: 'Land under management', icon: Radio, page: 'monthly-acreages' },
                  ].map((action) => {
                    const Icon = action.icon;
                    return (
                      <button
                        key={action.page}
                        onClick={() => onPageChange(action.page)}
                        className="fr-body"
                        style={{
                          textAlign: 'left',
                          padding: '14px 16px',
                          backgroundColor: palette.canvas,
                          color: palette.ink,
                          border: `1px solid ${palette.border}`,
                          borderRadius: '10px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          transition: 'all 0.18s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#ffffff';
                          e.currentTarget.style.borderColor = palette.pine;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = palette.canvas;
                          e.currentTarget.style.borderColor = palette.border;
                        }}
                      >
                        <div style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: '8px',
                          background: `${palette.pine}14`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          <Icon size={16} color={palette.pine} />
                        </div>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 600 }}>{action.label}</div>
                          <div style={{ fontSize: '11px', color: palette.inkSoft, marginTop: '1px' }}>{action.desc}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}