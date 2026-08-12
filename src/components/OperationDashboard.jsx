import { useState, useEffect } from "react";
import {
  Users, Target, DollarSign, CheckCircle, FileText, Leaf, Sprout, IndianRupee,
  TrendingUp, ArrowUpRight, ArrowDownRight, RefreshCw, Radio
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
  teal: '#14B8A6',
};

export default function OperationDashboard({ user, onPageChange }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [metrics, setMetrics] = useState({
    leads: 0,
    totalOpportunities: 0,
    deals: 0,
    closedWonDeals: 0,
    invoiced: 0,
    paid: 0,
    assignedToGreenTeam: 0,
    leadsGrowth: 0,
    dealsGrowth: 0,
    revenueGrowth: 0,
    totalDealValue: 0,
    closedWonAmount: 0,
    invoicedAmount: 0,
    paidAmount: 0
  });

  const displayName = user?.name || user?.fullName || user?.first_name || "Operation User";

  const formatNumber = (num) => {
    return num.toLocaleString();
  };

  const formatCurrency = (num) => {
  return '₹' + num.toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
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

  const fetchDashboardData = async () => {
  try {
    setLoading(true);
    const currentUserName = user?.name || user?.phone_number || 'Operation';
    const encodedUser = encodeURIComponent(currentUserName);
    const dealsApiUrl = import.meta.env.VITE_FILTER_DEALS_API_URL || import.meta.env.VITE_DEALS_API_URL;

    const [
      leadsResponse,
      dealsResponse,
      totalOpportunitiesResponse,
      closedWonResponse,
      invoicedResponse,
      paidResponse
    ] = await Promise.all([
      axios.get(`${import.meta.env.VITE_LEADS_API_URL}?user=${encodedUser}`),
      axios.get(`${import.meta.env.VITE_DEALS_API_URL}?user=${encodedUser}`),
      axios.get(`${import.meta.env.VITE_ACCOUNTS_API_URL}?user=${encodedUser}`),
      axios.get(`${dealsApiUrl}?user=${encodedUser}&deal_stage=${encodeURIComponent('Closed Won')}&offset=0&limit=1000`),
      axios.get(`${dealsApiUrl}?user=${encodedUser}&deal_stage=${encodeURIComponent('Invoiced')}&offset=0&limit=1000`),
      axios.get(`${dealsApiUrl}?user=${encodedUser}&deal_stage=${encodeURIComponent('Paid')}&offset=0&limit=1000`)
    ]);

    const leadsCount = leadsResponse.data?.total || leadsResponse.data?.data?.length || leadsResponse.data?.length || 0;
    const dealsCount = dealsResponse.data?.total || dealsResponse.data?.data?.length || dealsResponse.data?.length || 0;
    const totalOpportunitiesCount = totalOpportunitiesResponse.data?.total || totalOpportunitiesResponse.data?.data?.length || totalOpportunitiesResponse.data?.length || 0;

    const closedWonCount = closedWonResponse.data?.total ?? closedWonResponse.data?.count ?? (closedWonResponse.data?.data?.length || 0);
    const invoicedCount = invoicedResponse.data?.total ?? invoicedResponse.data?.count ?? (invoicedResponse.data?.data?.length || 0);
    const paidCount = paidResponse.data?.total ?? paidResponse.data?.count ?? (paidResponse.data?.data?.length || 0);

    // Closed won includes invoiced and paid deals
    const totalClosedWon = closedWonCount + invoicedCount + paidCount;

    // Invoiced + Paid total
    const totalInvoicedPaidCount = invoicedCount + paidCount;

    // Fetch total deal value and deal stage amounts from API
    const dealStageAmountApiUrl = import.meta.env.VITE_DEAL_STAGE_AMOUNT_API_URL;
    const dealStageAmountResponse = await axios.get(`${dealStageAmountApiUrl}?user=${encodedUser}`);

    console.log('Deal Stage Amounts API Response:', dealStageAmountResponse.data);

    const totalDealValue = parseFloat(dealStageAmountResponse.data?.Total || 0);
    console.log('Total Deal Value from API:', totalDealValue);

    const invoicedAmountFromAPI = parseFloat(dealStageAmountResponse.data?.Invoiced || 0);
    const paidAmount = parseFloat(dealStageAmountResponse.data?.Paid || 0);
    const invoicedAmount = invoicedAmountFromAPI + paidAmount;
    console.log('Invoiced Amount (Invoiced + Paid):', invoicedAmount);
    console.log('Paid Amount from API:', paidAmount);

    // Closed Won Amount: Closed Won + Invoiced + Paid from API
    const closedWonAmountFromAPI = parseFloat(dealStageAmountResponse.data?.['Closed Won'] || 0);
    const closedWonAmount = closedWonAmountFromAPI + invoicedAmountFromAPI + paidAmount;
    console.log('Closed Won Amount (Closed Won + Invoiced + Paid):', closedWonAmount);

    setMetrics({
      leads: leadsCount,
      totalOpportunities: totalOpportunitiesCount,
      deals: dealsCount,
      closedWonDeals: totalClosedWon,
      invoiced: totalInvoicedPaidCount,
      paid: paidCount,
      assignedToGreenTeam: 0,
      leadsGrowth: 0,
      dealsGrowth: 0,
      revenueGrowth: 0,
      totalDealValue,
      closedWonAmount,
      invoicedAmount: invoicedAmount,
      paidAmount: paidAmount
    });

    setLastUpdated(new Date());
    setLoading(false);
  } catch (error) {
    console.error('Error fetching operation dashboard data:', error);
    setMetrics({
      leads: 0,
      totalOpportunities: 0,
      deals: 0,
      closedWonDeals: 0,
      invoiced: 0,
      paid: 0,
      assignedToGreenTeam: 0,
      leadsGrowth: 0,
      dealsGrowth: 0,
      revenueGrowth: 0,
      totalDealValue: 0,
      closedWonAmount: 0,
      invoicedAmount: 0,
      paidAmount: 0
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

  useEffect(() => {
    fetchDashboardData();
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
      icon: Sprout,
      accent: palette.growth,
      growth: metrics.leadsGrowth,
      onClick: null
    },
    {
      key: 'totalOpportunities',
      code: '02',
      stage: 'Sprouted',
      title: 'Total Opportunity',
      value: metrics.totalOpportunities,
      icon: Target,
      accent: palette.amber,
      growth: 0,
      onClick: null
    },
    {
      key: 'deals',
      code: '03',
      stage: 'Rooted',
      title: 'Total Deals',
      value: metrics.deals,
      icon: IndianRupee,
      accent: palette.slate,
      growth: metrics.dealsGrowth,
      onClick: null
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
      onClick: null
    },
    {
      key: 'invoiced',
      code: '05',
      stage: 'Invoiced',
      title: 'Invoiced + Paid',
      value: metrics.invoiced,
      icon: FileText,
      accent: palette.amberDeep,
      growth: 0,
      onClick: null
    },
    {
      key: 'paid',
      code: '06',
      stage: 'Paid',
      title: 'Paid',
      value: metrics.paid,
      icon: IndianRupee,
      accent: palette.teal,
      growth: 0,
      onClick: null
    },
    {
      key: 'assignedToGreenTeam',
      code: '07',
      stage: 'Routed',
      title: 'Assigned to Green Team',
      value: metrics.assignedToGreenTeam,
      icon: Leaf,
      accent: palette.growth,
      growth: 0,
      onClick: null
    }
  ];

  const funnelSteps = [
    { label: 'Sown', sub: 'Leads', value: metrics.leads, accent: palette.pine },
    { label: 'Sprouted', sub: 'Total Opportunity', value: metrics.totalOpportunities, accent: palette.amber },
    { label: 'Rooted', sub: 'Total Deals', value: metrics.deals, accent: palette.slate },
    { label: 'Harvested', sub: 'Closed Won Deals', value: metrics.closedWonDeals, accent: palette.growth },
    { label: 'Invoiced', sub: 'Invoiced + Paid', value: metrics.invoiced, accent: palette.amberDeep },
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
            onClick={() => onPageChange('all-sales-data')}
            className="fr-body"
            style={{
              padding: '8px 16px',
              backgroundColor: palette.growth,
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            View All Sales Data
          </button>
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
                Welcome ..! {displayName}
              </h1>
              <p
                className="fr-body"
                style={{ color: '#2b2a29', fontSize: '14px', marginTop: '8px', maxWidth: '480px' }}
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
      Lead Data Summary
    </h2>
    <div className="op-dashboard-grid">
      {dashboardCards.map((card, index) => {
        const Icon = card.icon;
        const barWidth = Math.min(100, (card.value / funnelBase) * 100);
        const isBaseline = card.key === 'leads';
        const showsConversion = card.key !== 'assignedToGreenTeam';

        // Calculate conversion rate based on card type
        let conversionRate = 0;
        if (card.key === 'deals') {
          conversionRate = calculateConversionRate(card.value, metrics.totalOpportunities);
        } else if (card.key === 'closedWonDeals') {
          conversionRate = calculateConversionRate(card.value, metrics.deals);
        } else if (card.key === 'invoiced') {
          conversionRate = calculateConversionRate(card.value, metrics.closedWonDeals);
        } else if (card.key === 'paid') {
          conversionRate = calculateConversionRate(card.value, metrics.invoiced);
        } else if (card.key === 'totalOpportunities') {
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
          icon: IndianRupee,
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
          key: 'invoicedAmount',
          title: 'Invoiced',
          value: metrics.invoicedAmount,
          icon: FileText,
          accent: palette.amberDeep
        },
        {
          key: 'paidAmount',
          title: 'Paid Amount',
          value: metrics.paidAmount,
          icon: IndianRupee,
          accent: palette.teal
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