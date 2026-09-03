import { useState, useEffect } from 'react';
import { X, ArrowLeft, Cloud, Info } from 'lucide-react';
import ReactECharts from 'echarts-for-react';
import axios from 'axios';

export default function TimeSeries({ onClose, onBack, farmId, clientId }) {
  const [timeSeriesData, setTimeSeriesData] = useState([]);
  const [graphData, setGraphData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [graphLoading, setGraphLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  useEffect(() => {
    if (farmId && clientId) {
      fetchTimeSeriesData();
    } else if (farmId && !clientId) {
      setError('Report will be available soon');
    }
  }, [farmId, clientId]);

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    }).split('/').join('-');
  };

  const formatDateShort = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    }).split('/').join('-');
  };

  const getNextAvailableDate = () => {
    const today = new Date();
    const daysUntilSaturday = (6 - today.getDay() + 7) % 7;
    const nextSaturday = new Date(today);
    nextSaturday.setDate(
      today.getDate() + (daysUntilSaturday === 0 ? 7 : daysUntilSaturday)
    );
    return nextSaturday.toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  const fetchTimeSeriesData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Step 1 - Get API key
      const keyResponse = await axios.get(
        import.meta.env.VITE_FETCH_FARMER_KEY_API_URL,
        { params: { client_id: clientId } }
      );
      const apiKey = keyResponse.data.api_key;

      // Step 2 - Fetch Time Series array
      const response = await axios.get('https://api.sat2farm.com/water_tank/water_tank/time_series/data', {
        params: { key: apiKey, farmid: farmId }
      });

      console.log('TIME SERIES API RESPONSE:', response.data);

      // Handle different API response structures
      const data = Array.isArray(response.data) ? response.data : response.data.time_series || [];
      setTimeSeriesData(data);
      // Build graph from zonalStats
      await fetchGraphData(data);

    } catch (err) {
      console.error('Time Series error:', err);
      setError('Failed to fetch Time Series data');
    } finally {
      setLoading(false);
    }
  };

  const fetchGraphData = async (data) => {
    setGraphLoading(true);
    const points = [];

    console.log('Total data items:', data.length);
    console.log('Sample data structure:', data[0]);

    // The API returns data with Date and WaterArea directly
    // No need to fetch from zonalStats.time_series
    for (const item of data) {
      if (item.Date !== undefined && item.WaterArea !== undefined && !isNaN(item.WaterArea)) {
        points.push({
          date: formatDate(item.Date),
          value: parseFloat(Number(item.WaterArea).toFixed(4)),
          timestamp: item.Date
        });
      }
    }

    console.log('Total points added to graph:', points.length);

    // Sort chronologically
    points.sort((a, b) => a.timestamp - b.timestamp);
    setGraphData(points);
    setGraphLoading(false);
  };
  const hasGraphData = graphData.length > 0;

  const getChartOption = () => {
    if (!hasGraphData) return {};

    return {
      title: {
        text: 'Water Tank Time Series',
        left: 'center',
        top: 8,
        textStyle: {
          fontSize: 16,
          fontWeight: 500,
          color: '#374151'
        }
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#ffffff',
        borderColor: '#d1d5db',
        borderWidth: 1,
        textStyle: {
          color: '#374151',
          fontSize: 12
        },
        formatter: (params) => {
          const point = params?.[0];
          if (!point) return '';
          return `${point.axisValue}<br/>Time Series: <b>${point.value}</b>`;
        }
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: graphData.map(d => d.date),
        axisLabel: {
          color: '#6b7280',
          fontSize: 10,
          rotate: 0,
          margin: 10,
          interval: 0,
          formatter: (value, index) => {
            // Show every 2 months (approximately 5 data points)
            return index % 5 === 0 ? value : '';
          }
        },
        axisLine: {
          lineStyle: { color: '#9ca3af' }
        },
        axisTick: {
          show: false
        }
      },
      yAxis: {
        type: 'value',
        name: 'Mean Value of Time Series',
        nameLocation: 'middle',
        nameGap: 55,
        nameTextStyle: {
          color: '#4b5563',
          fontSize: 11
        },
        axisLabel: {
          color: '#6b7280',
          fontSize: 10
        },
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        splitLine: {
          lineStyle: {
            color: '#d1d5db',
            width: 1
          }
        },
        min: 0,
        max: 1800,
        interval: 200
      },
      series: [{
        name: 'Time Series',
        type: 'line',
        data: graphData.map(d => d.value),
        smooth: false,
        symbol: 'circle',
        symbolSize: 5,
        showSymbol: true,
        lineStyle: {
          color: '#4f8ac9',
          width: 2
        },
        itemStyle: {
          color: '#4f8ac9',
          borderColor: '#ffffff',
          borderWidth: 1.5
        }
      }],
      grid: {
        left: 72,
        right: 22,
        top: 48,
        bottom: 58,
        containLabel: true
      }
    };
  };

  return (
    <div
      className="modal-overlay"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <div
        className="modal"
        style={{
          width: '950px',
          maxWidth: '95vw',
          maxHeight: '90vh',
          background: '#ffffff',
          borderRadius: '12px',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div
          className="modal-head"
          style={{
            background: '#073b60',
            color: '#ffffff',
            minHeight: '44px',
            padding: '0 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <button
            className="btn btn-ghost btn-sm"
            onClick={onBack}
            style={{ color: '#ffffff' }}
          >
            <ArrowLeft className="ic-xs" />
          </button>

          <h3
            style={{
              margin: 0,
              flex: 1,
              fontSize: '15px',
              fontWeight: 700,
              paddingLeft: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            Time Series
            <button
              onClick={() => setShowDisclaimer(true)}
              style={{
                border: 'none',
                backgroundColor: 'transparent',
                color: '#ffffff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0
              }}
            >
              <Info size={18} />
            </button>
          </h3>

          <button
            className="btn btn-ghost btn-sm"
            onClick={onClose}
            style={{ color: '#ffffff' }}
          >
            <X className="ic-xs" />
          </button>
        </div>

        {/* Body */}
        <div
          className="modal-body"
          style={{
            overflowY: 'auto',
            padding: '24px',
            background: '#f8f9fa'
          }}
        >
          {loading && (
            <div
              style={{
                textAlign: 'center',
                padding: '80px 20px',
                color: '#6b7280'
              }}
            >
              Loading Time Series data...
            </div>
          )}

          {!loading && error && (
            <div
              style={{
                textAlign: 'center',
                padding: '70px 20px',
                color: '#dc2626',
                background: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}
            >
              {error}
            </div>
          )}

          {!loading && !error && timeSeriesData.length === 0 && (
            <div
              style={{
                background: '#ffffff',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                padding: '28px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px'
              }}
            >
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '50%',
                  background: '#eef2f7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Cloud size={26} color="#6b7280" />
              </div>

              <div>
                <h4
                  style={{
                    fontSize: '16px',
                    fontWeight: 600,
                    color: '#374151',
                    margin: '0 0 5px'
                  }}
                >
                  No data due to cloud
                </h4>

                
              </div>
            </div>
          )}

          {!loading && !error && timeSeriesData.length > 0 && (
            <div
              style={{
                background: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '18px 18px 10px',
                minHeight: '390px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
              }}
            >
              {graphLoading ? (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '350px',
                    color: '#6b7280',
                    fontSize: '14px'
                  }}
                >
                  Loading Time Series graph...
                </div>
              ) : hasGraphData ? (
                <ReactECharts
                  option={getChartOption()}
                  notMerge={true}
                  lazyUpdate={true}
                  style={{
                    height: '350px',
                    width: '100%'
                  }}
                />
              ) : (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '350px',
                    color: '#6b7280',
                    flexDirection: 'column',
                    gap: '10px'
                  }}
                >
                  <Cloud size={32} color="#9ca3af" />
                  <span style={{ fontSize: '14px' }}>
                    Time Series graph data not available
                  </span>
                </div>
              )}
            </div>
          )}

          
        </div>
      </div>

      {/* Disclaimer Modal */}
      {showDisclaimer && (
        <div 
          onClick={() => setShowDisclaimer(false)}
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
            zIndex: 2000
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#fff',
              borderRadius: '12px',
              padding: '24px',
              maxWidth: '500px',
              width: '90%',
              boxShadow: '0 6px 20px rgba(0,0,0,0.18)'
            }}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px'
            }}>
              <h4 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#374151',
                margin: 0
              }}>
                Time Series Disclaimer
              </h4>
              <button
                onClick={() => setShowDisclaimer(false)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                <X size={20} color="#6b7280" />
              </button>
            </div>
            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              lineHeight: '1.6',
              margin: '0 0 16px 0'
            }}>
              Time series data tracks the variation in the extent of water coverage within a waterbody over a period, serving as an indirect indicator of the percentage fluctuations in the available water in a waterbody over time.
            </p>
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px'
            }}>
              <button
                onClick={() => setShowDisclaimer(false)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#6b7280',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
              <button
                onClick={() => setShowDisclaimer(false)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#12851b',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

