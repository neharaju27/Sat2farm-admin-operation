import { useState, useEffect } from "react";
import { RefreshCw, ArrowLeft } from "lucide-react";
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

export default function AllSalesData({ user, onPageChange }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [allSalesData, setAllSalesData] = useState([]);
  const [activeTab, setActiveTab] = useState('deals');

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

  const fetchAllSalesData = async () => {
    try {
      setLoading(true);
      // List of sales users
      const salesUsers = [
        'Nirosha', 'Aymen','Chaturya', 'Priyanshu', 'Bhagwati', 'Harshitha', 'Shurti', 'Vijay K B',
        'Mustaqeem', 'Amith', 'Rohini','Ashok', 'Lipsa', 
      ];

      const salesDataPromises = salesUsers.map(async (salesName) => {
        const encodedUser = encodeURIComponent(salesName);
        const dealsApiUrl = import.meta.env.VITE_FILTER_DEALS_API_URL || import.meta.env.VITE_DEALS_API_URL;

        try {
          const [
            leadsResponse,
            dealsResponse,
            totalOpportunitiesResponse,
            closedWonResponse,
            invoicedResponse,
            paidResponse,
            dealStageAmountResponse
          ] = await Promise.all([
            axios.get(`${import.meta.env.VITE_LEADS_API_URL}?user=${encodedUser}`),
            axios.get(`${import.meta.env.VITE_DEALS_API_URL}?user=${encodedUser}`),
            axios.get(`${import.meta.env.VITE_ACCOUNTS_API_URL}?user=${encodedUser}`),
            axios.get(`${dealsApiUrl}?user=${encodedUser}&deal_stage=${encodeURIComponent('Closed Won')}&offset=0&limit=1000`),
            axios.get(`${dealsApiUrl}?user=${encodedUser}&deal_stage=${encodeURIComponent('Invoiced')}&offset=0&limit=1000`),
            axios.get(`${dealsApiUrl}?user=${encodedUser}&deal_stage=${encodeURIComponent('Paid')}&offset=0&limit=1000`),
            axios.get(`${import.meta.env.VITE_DEAL_STAGE_AMOUNT_API_URL}?user=${encodedUser}`)
          ]);

          const totalLeads = leadsResponse.data?.total || leadsResponse.data?.data?.length || leadsResponse.data?.length || 0;
          const totalDeals = dealsResponse.data?.total || dealsResponse.data?.data?.length || dealsResponse.data?.length || 0;
          const totalOpportunities = totalOpportunitiesResponse.data?.total || totalOpportunitiesResponse.data?.data?.length || totalOpportunitiesResponse.data?.length || 0;
          const closedWonCount = closedWonResponse.data?.total ?? closedWonResponse.data?.count ?? (closedWonResponse.data?.data?.length || 0);
          const invoicedCount = invoicedResponse.data?.total ?? invoicedResponse.data?.count ?? (invoicedResponse.data?.data?.length || 0);
          const paidCount = paidResponse.data?.total ?? paidResponse.data?.count ?? (paidResponse.data?.data?.length || 0);

          // Assigned to Green Team - currently set to 0 as per operation dashboard
          const assignedToGreenTeam = 0;

          // Deal Stage Amounts from API
          const dealStageAmountData = dealStageAmountResponse.data;
          const totalDealValue = parseFloat(dealStageAmountData?.Total || 0);
          const invoicedAmountFromAPI = parseFloat(dealStageAmountData?.Invoiced || 0);
          const paidAmount = parseFloat(dealStageAmountData?.Paid || 0);
          const invoicedAmount = invoicedAmountFromAPI + paidAmount;

          // Closed Won + Invoiced + Paid total
          const totalClosedWon = closedWonCount + invoicedCount + paidCount;

          // Invoiced + Paid total
          const totalInvoicedPaidCount = invoicedCount + paidCount;

          // Closed Won Amount: Closed Won + Invoiced + Paid from API
          const closedWonAmountFromAPI = parseFloat(dealStageAmountData?.['Closed Won'] || 0);
          const closedWonAmount = closedWonAmountFromAPI + invoicedAmountFromAPI + paidAmount;

          return {
            salesName: salesName,
            totalLeads: totalLeads,
            totalOpportunities: totalOpportunities,
            deals: totalDeals,
            closedWonDeal: totalClosedWon,
            invoiced: totalInvoicedPaidCount,
            paid: paidCount,
            assignedToGreenTeam: assignedToGreenTeam,
            totalDealValue: totalDealValue,
            closedWonAmount: closedWonAmount,
            invoicedAmount: invoicedAmount,
            paidAmount: paidAmount
          };
        } catch (error) {
          console.error(`Error fetching data for ${salesName}:`, error);
          return {
            salesName: salesName,
            totalLeads: 0,
            totalOpportunities: 0,
            deals: 0,
            closedWonDeal: 0,
            invoiced: 0,
            paid: 0,
            assignedToGreenTeam: 0,
            totalDealValue: 0,
            closedWonAmount: 0,
            invoicedAmount: 0,
            paidAmount: 0
          };
        }
      });

      const allSalesData = await Promise.all(salesDataPromises);
      setAllSalesData(allSalesData);
      setLastUpdated(new Date());
      setLoading(false);
    } catch (error) {
      console.error('Error fetching all sales data:', error);
      setLoading(false);
      toast.error('Failed to load all sales data');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAllSalesData();
    setRefreshing(false);
    toast.success('Data refreshed');
  };

  useEffect(() => {
    fetchAllSalesData();
  }, []);

  return (
    <div className="main-full" style={{ background: palette.canvas }}>
      <style>{`
        .fr-display { font-family: var(--font-display), Georgia, serif; }
        .fr-body { font-family: var(--font-display), Georgia, serif; }
        .fr-mono { font-family: var(--font-mono), monospace; }

        @keyframes frPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.35; }
        }
        @keyframes frSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .fr-spin { animation: frSpin 1s linear infinite; }
        .fr-live-dot {
          animation: frPulse 2s ease-in-out infinite;
        }
      `}</style>

      {/* Header */}
      <div className="topbar" style={{ borderBottom: `1px solid ${palette.border}` }}>
        <div className="tb-left" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => onPageChange('operation-dashboard')}
            className="fr-body"
            style={{
              padding: '8px 12px',
              backgroundColor: 'transparent',
              color: palette.inkSoft,
              border: `1px solid ${palette.border}`,
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <ArrowLeft size={14} />
            Back
          </button>
          <div className="tb-page fr-body" style={{ fontWeight: 600, color: palette.ink }}>All Sales Data</div>
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
                <p className="fr-body" style={{ fontSize: '14px' }}>Loading sales data…</p>
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
                All Sales Data
              </h2>
              
              {/* Tab Navigation */}
              <div style={{
                display: 'flex',
                gap: '8px',
                marginBottom: '16px'
              }}>
                <button
                  onClick={() => setActiveTab('deals')}
                  style={{
                    padding: '10px 20px',
                    background: activeTab === 'deals' ? palette.growth : palette.surface,
                    color: activeTab === 'deals' ? 'white' : palette.inkSoft,
                    border: `1px solid ${activeTab === 'deals' ? palette.growth : palette.border}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 600,
                    transition: 'all 0.2s'
                  }}
                >
                  Deals
                </button>
                <button
                  onClick={() => setActiveTab('revenue')}
                  style={{
                    padding: '10px 20px',
                    background: activeTab === 'revenue' ? palette.growth : palette.surface,
                    color: activeTab === 'revenue' ? 'white' : palette.inkSoft,
                    border: `1px solid ${activeTab === 'revenue' ? palette.growth : palette.border}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 600,
                    transition: 'all 0.2s'
                  }}
                >
                  Revenue
                </button>
              </div>

              <div style={{
                background: palette.surface,
                borderRadius: '12px',
                border: `1px solid ${palette.border}`,
                overflow: 'hidden'
              }}>
                {activeTab === 'deals' && (
                  <div style={{
                    overflowX: 'auto'
                  }}>
                    <table style={{
                      width: '100%',
                      borderCollapse: 'collapse',
                      fontSize: '13px'
                    }}>
                      <thead>
                        <tr style={{
                          background: palette.canvas,
                          borderBottom: `1px solid ${palette.border}`
                        }}>
                          <th style={{
                            padding: '12px 16px',
                            textAlign: 'left',
                            fontWeight: 600,
                            color: palette.ink,
                            fontSize: '12px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                          }}>
                            Sales Name
                          </th>
                          <th style={{
                            padding: '12px 16px',
                            textAlign: 'right',
                            fontWeight: 600,
                            color: palette.ink,
                            fontSize: '12px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                          }}>
                            Total Leads
                          </th>
                          <th style={{
                            padding: '12px 16px',
                            textAlign: 'right',
                            fontWeight: 600,
                            color: palette.ink,
                            fontSize: '12px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                          }}>
                            Total Opportunity
                          </th>
                          <th style={{
                            padding: '12px 16px',
                            textAlign: 'right',
                            fontWeight: 600,
                            color: palette.ink,
                            fontSize: '12px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                          }}>
                            Total Deals
                          </th>
                          <th style={{
                            padding: '12px 16px',
                            textAlign: 'right',
                            fontWeight: 600,
                            color: palette.ink,
                            fontSize: '12px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                          }}>
                            Closed Won Deals
                          </th>
                          <th style={{
                            padding: '12px 16px',
                            textAlign: 'right',
                            fontWeight: 600,
                            color: palette.ink,
                            fontSize: '12px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                          }}>
                            Invoiced + Paid
                          </th>
                          <th style={{
                            padding: '12px 16px',
                            textAlign: 'right',
                            fontWeight: 600,
                            color: palette.ink,
                            fontSize: '12px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                          }}>
                            Paid
                          </th>
                          <th style={{
                            padding: '12px 16px',
                            textAlign: 'right',
                            fontWeight: 600,
                            color: palette.ink,
                            fontSize: '12px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                          }}>
                            Assigned to Green Team
                          </th>
                        </tr>
                      </thead>
                    <tbody>
                      {allSalesData.map((row, index) => (
                        <tr
                          key={row.salesName}
                          style={{
                            borderBottom: index < allSalesData.length - 1 ? `1px solid ${palette.border}` : 'none',
                            transition: 'background-color 0.18s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#f0fdf4';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = palette.surface;
                          }}
                        >
                          <td style={{
                            padding: '12px 16px',
                            color: palette.ink,
                            fontWeight: 500
                          }}>
                            {row.salesName}
                          </td>
                          <td style={{
                            padding: '12px 16px',
                            textAlign: 'right',
                            color: palette.inkSoft,
                            fontWeight: 600
                          }}>
                            {formatNumber(row.totalLeads)}
                          </td>
                          <td style={{
                            padding: '12px 16px',
                            textAlign: 'right',
                            color: palette.amber,
                            fontWeight: 600
                          }}>
                            {formatNumber(row.totalOpportunities)} <span style={{ color: palette.inkFaint, fontWeight: 400, marginLeft: '4px' }}>({calculateConversionRate(row.totalOpportunities, row.totalLeads)}%)</span>
                          </td>
                          <td style={{
                            padding: '12px 16px',
                            textAlign: 'right',
                            color: palette.inkSoft,
                            fontWeight: 600
                          }}>
                            {formatNumber(row.deals)} <span style={{ color: palette.inkFaint, fontWeight: 400, marginLeft: '4px' }}>({calculateConversionRate(row.deals, row.totalOpportunities)}%)</span>
                          </td>
                          <td style={{
                            padding: '12px 16px',
                            textAlign: 'right',
                            color: palette.growth,
                            fontWeight: 600
                          }}>
                            {formatNumber(row.closedWonDeal)} <span style={{ color: palette.inkFaint, fontWeight: 400, marginLeft: '4px' }}>({calculateConversionRate(row.closedWonDeal, row.deals)}%)</span>
                          </td>
                          <td style={{
                            padding: '12px 16px',
                            textAlign: 'right',
                            color: palette.inkSoft,
                            fontWeight: 600
                          }}>
                            {formatNumber(row.invoiced)} <span style={{ color: palette.inkFaint, fontWeight: 400, marginLeft: '4px' }}>({calculateConversionRate(row.invoiced, row.closedWonDeal)}%)</span>
                          </td>
                          <td style={{
                            padding: '12px 16px',
                            textAlign: 'right',
                            color: palette.teal,
                            fontWeight: 600
                          }}>
                            {formatNumber(row.paid)} <span style={{ color: palette.inkFaint, fontWeight: 400, marginLeft: '4px' }}>({calculateConversionRate(row.paid, row.invoiced)}%)</span>
                          </td>
                          <td style={{
                            padding: '12px 16px',
                            textAlign: 'right',
                            color: palette.inkSoft,
                            fontWeight: 600
                          }}>
                            {formatNumber(row.assignedToGreenTeam)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                )}
                
                {activeTab === 'revenue' && (
                  <div style={{
                    overflowX: 'auto'
                  }}>
                    <table style={{
                      width: '100%',
                      borderCollapse: 'collapse',
                      fontSize: '13px'
                    }}>
                      <thead>
                        <tr style={{
                          background: palette.canvas,
                          borderBottom: `1px solid ${palette.border}`
                        }}>
                          <th style={{
                            padding: '12px 16px',
                            textAlign: 'left',
                            fontWeight: 600,
                            color: palette.ink,
                            fontSize: '12px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                          }}>
                            Sales Name
                          </th>
                          <th style={{
                            padding: '12px 16px',
                            textAlign: 'right',
                            fontWeight: 600,
                            color: palette.ink,
                            fontSize: '12px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                          }}>
                            Total Deal Amount
                          </th>
                          <th style={{
                            padding: '12px 16px',
                            textAlign: 'right',
                            fontWeight: 600,
                            color: palette.ink,
                            fontSize: '12px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                          }}>
                            Closed Won Amount
                          </th>
                          <th style={{
                            padding: '12px 16px',
                            textAlign: 'right',
                            fontWeight: 600,
                            color: palette.ink,
                            fontSize: '12px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                          }}>
                            Invoiced Amount
                          </th>
                          <th style={{
                            padding: '12px 16px',
                            textAlign: 'right',
                            fontWeight: 600,
                            color: palette.ink,
                            fontSize: '12px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                          }}>
                            Paid Amount
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {allSalesData.map((row, index) => (
                          <tr
                            key={row.salesName}
                            style={{
                              borderBottom: index < allSalesData.length - 1 ? `1px solid ${palette.border}` : 'none',
                              transition: 'background-color 0.18s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#f0fdf4';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = palette.surface;
                            }}
                          >
                            <td style={{
                              padding: '12px 16px',
                              color: palette.ink,
                              fontWeight: 500
                            }}>
                              {row.salesName}
                            </td>
                            <td style={{
                              padding: '12px 16px',
                              textAlign: 'right',
                              color: palette.inkSoft,
                              fontWeight: 600
                            }}>
                              {formatCurrency(row.totalDealValue)}
                            </td>
                            <td style={{
                              padding: '12px 16px',
                              textAlign: 'right',
                              color: palette.growth,
                              fontWeight: 600
                            }}>
                              {formatCurrency(row.closedWonAmount)} <span style={{ color: palette.inkFaint, fontWeight: 400, marginLeft: '4px' }}>({calculateConversionRate(row.closedWonAmount, row.totalDealValue)}%)</span>
                            </td>
                            <td style={{
                              padding: '12px 16px',
                              textAlign: 'right',
                              color: palette.amberDeep,
                              fontWeight: 600
                            }}>
                              {formatCurrency(row.invoicedAmount)} <span style={{ color: palette.inkFaint, fontWeight: 400, marginLeft: '4px' }}>({calculateConversionRate(row.invoicedAmount, row.closedWonAmount)}%)</span>
                            </td>
                            <td style={{
                              padding: '12px 16px',
                              textAlign: 'right',
                              color: palette.teal,
                              fontWeight: 600
                            }}>
                              {formatCurrency(row.paidAmount)} <span style={{ color: palette.inkFaint, fontWeight: 400, marginLeft: '4px' }}>({calculateConversionRate(row.paidAmount, row.invoicedAmount)}%)</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
