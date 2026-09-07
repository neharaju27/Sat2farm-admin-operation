import { useState, useEffect } from 'react';
import { X, ArrowLeft, Info } from 'lucide-react';
import ReactECharts from 'echarts-for-react';
import axios from 'axios';

export default function CropHealth({ onClose, onBack, farmId, clientId }) {
  const [satelliteData, setSatelliteData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  useEffect(() => {
    if (farmId && clientId) {
      fetchSatelliteData();
    } else if (farmId && !clientId) {
      setError('Report will be available soon');
    }
  }, [farmId, clientId]);

  const fetchSatelliteData = async () => {
    setLoading(true);
    setError(null);
    try {
      const keyResponse = await axios.get(import.meta.env.VITE_FETCH_FARMER_KEY_API_URL, {
        params: { client_id: clientId }
      });
      const apiKey = keyResponse.data.api_key;

      const response = await axios.get(import.meta.env.VITE_SATELLITE_REPORT_API_URL, {
        params: { key: apiKey, farm_id: farmId }
      });

      const data = response.data;
      const sortedData = [...data].sort((a, b) => b.Date - a.Date);
      setSatelliteData(sortedData);
      
      const validData = sortedData.filter(item => 
        item.zonalStats && item.zonalStats.ndvi && item.zonalStats.ndvi !== 'None' &&
        item.png && item.png.ndvi && item.png.ndvi !== 'None'
      );
      
      const pngOnlyData = sortedData.filter(item => 
        item.png && item.png.ndvi && item.png.ndvi !== 'None'
      );
      
      if (pngOnlyData.length > 0) {
        setSelectedDate(pngOnlyData[0]);
      }
      
      if (validData.length > 0) {
        await fetchChartData(validData);
      }
    } catch (err) {
      setError('Report will be available soon');
    } finally {
      setLoading(false);
    }
  };

  const fetchChartData = async (data) => {
    const chartPoints = [];
    
    for (const item of data) {
      if (item.zonalStats && item.zonalStats.ndvi && item.zonalStats.ndvi !== 'None') {
        try {
          const response = await axios.get(item.zonalStats.ndvi);
          if (response.data && response.data.length > 0) {
            chartPoints.push({
              date: item.Date,
              mean: parseFloat(response.data[0].mean) || 0
            });
          }
        } catch (err) {
          console.error('Failed to fetch zonal stats:', err);
        }
      }
    }
    
    chartPoints.sort((a, b) => a.date - b.date);
    setChartData(chartPoints);
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const calculateNextReportDate = (lastPngTimestamp) => {
    if (!lastPngTimestamp) return null;
    const lastDate = new Date(lastPngTimestamp);
    const nextDate = new Date(lastDate);
    nextDate.setDate(nextDate.getDate() + 6);
    return formatDate(nextDate.getTime());
  };

  const validSatelliteData = satelliteData.filter(item => 
    item.zonalStats && item.zonalStats.ndvi && item.zonalStats.ndvi !== 'None' &&
    item.png && item.png.ndvi && item.png.ndvi !== 'None'
  );

  // For last PNG date, only check for PNG data (not zonal stats)
  const pngData = satelliteData.filter(item => 
    item.png && item.png.ndvi && item.png.ndvi !== 'None'
  );
  
  const lastPngDate = pngData.length > 0 ? pngData[0].Date : null;
  const nextReportDate = calculateNextReportDate(lastPngDate);

  const chartOption = chartData && chartData.length > 0 ? {
    backgroundColor: '#ffffff',
    title: {
      text: 'NDVI Graph',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 600,
        color: '#1e293b'
      }
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        const item = params[0];
        return `Date: ${item.name}<br/>Mean Value of NDVI: ${item.value.toFixed(4)}`;
      }
    },
    grid: {
      left: '8%',
      right: '8%',
      bottom: '12%',
      top: '20%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: chartData.map(d => formatDate(d.date)),
      axisLabel: {
        color: '#64748b',
        rotate: -30,
        interval: function(index) {
          return index % 10 === 0;
        }
      },
      axisLine: {
        lineStyle: {
          color: '#cbd5e1'
        }
      }
    },
    yAxis: {
      type: 'value',
      name: 'Mean Value of NDVI',
      nameTextStyle: {
        color: '#64748b',
        fontWeight: 600
      },
      min: 0,
      max: 1.0,
      interval: 0.1,
      axisLabel: {
        color: '#64748b',
        formatter: (value) => value.toFixed(1)
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: '#e2e8f0',
          type: 'solid'
        }
      },
      axisLine: {
        lineStyle: {
          color: '#cbd5e1'
        }
      }
    },
    series: [{
      data: chartData.map(d => d.mean),
      type: 'line',
      smooth: true,
      smoothMonotone: 'x',
      lineStyle: {
        color: '#16a34a',
        width: 3
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [{
            offset: 0,
            color: 'rgba(22, 163, 74, 0.3)'
          }, {
            offset: 1,
            color: 'rgba(22, 163, 74, 0.05)'
          }]
        }
      },
      symbol: 'circle',
      symbolSize: 8,
      itemStyle: {
        color: '#16a34a',
        borderColor: '#16a34a',
        borderWidth: 2
      },
      emphasis: {
        itemStyle: {
          color: '#15803d',
          borderColor: '#15803d',
          borderWidth: 2
        }
      }
    }]
  } : null;

  return (
    <div className="modal-overlay">
      <div className="modal" style={{width: '1200px', maxWidth: '95vw', maxHeight: '90vh'}}>
        <div className="modal-head">
          <button className="btn btn-ghost btn-sm" onClick={onBack || onClose}>
            <ArrowLeft className="ic-xs" />
          </button>
          <h3>Crop Health</h3>
          <button 
            className="btn btn-ghost btn-sm" 
            onClick={() => setShowDisclaimer(true)}
            style={{marginRight: '8px'}}
            title="Disclaimer"
          >
            <Info className="ic-xs" />
          </button>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>
            <X className="ic-xs" />
          </button>
        </div>
        <div className="modal-body" style={{overflowY: 'auto'}}>
          {loading ? (
            <div style={{textAlign: 'center', padding: '40px', color: 'var(--text-2)'}}>
              Loading satellite data...
            </div>
          ) : error ? (
            <div style={{textAlign: 'center', padding: '40px', color: '#ef4444'}}>
              {error}
            </div>
          ) : (
            <>
              <div style={{marginBottom: '20px'}}>
                <label style={{fontSize: '14px', fontWeight: '600', color: 'var(--text-1)', marginRight: '12px'}}>
                  Select Date:
                </label>
                <select 
                  value={selectedDate?.Date || ''} 
                  onChange={(e) => {
                    const selected = pngData.find(d => d.Date === parseInt(e.target.value));
                    setSelectedDate(selected);
                  }}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--border)',
                    fontSize: '14px',
                    minWidth: '200px'
                  }}
                >
                  {pngData.map((item) => (
                    <option key={item.Date} value={item.Date}>
                      {formatDate(item.Date)}{item.Date === lastPngDate ? ' (Last PNG)' : ''}
                    </option>
                  ))}
                </select>
                {nextReportDate && (
                  <div style={{marginTop: '8px', fontSize: '13px', color: '#64748b'}}>
                    Next Crop Health report will be available on: <span style={{fontWeight: '600', color: '#1e293b'}}>{nextReportDate}</span>
                  </div>
                )}
              </div>

              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px'}}>
                <div style={{
                  backgroundColor: '#fff',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  padding: '20px'
                }}>
                  <h5 style={{fontSize: '16px', fontWeight: '600', color: 'var(--text-1)', marginBottom: '12px'}}>
                    NDVI Image
                  </h5>
                  {selectedDate && selectedDate.png && selectedDate.png.ndvi && selectedDate.png.ndvi !== 'None' ? (
                    <img 
                      src={selectedDate.png.ndvi} 
                      alt="NDVI" 
                      style={{
                        width: '100%',
                        height: '300px',
                        objectFit: 'contain',
                        borderRadius: '8px',
                        backgroundColor: '#f1f5f9'
                      }}
                    />
                  ) : (
                    <div style={{
                      width: '100%',
                      height: '300px',
                      backgroundColor: '#f1f5f9',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px dashed #cbd5e1'
                    }}>
                      <div style={{textAlign: 'center', color: '#64748b'}}>
                        <div style={{fontSize: '14px'}}>No image available for this date</div>
                      </div>
                    </div>
                  )}
                </div>

                <div style={{
                  backgroundColor: '#fff',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  padding: '20px'
                }}>
                  <h5 style={{fontSize: '16px', fontWeight: '600', color: 'var(--text-1)', marginBottom: '12px'}}>
                    NDVI Trend
                  </h5>
                  {chartOption ? (
                    <div style={{
                      backgroundColor: '#ffffff',
                      borderRadius: '12px',
                      padding: '16px',
                      height: '350px'
                    }}>
                      <ReactECharts option={chartOption} style={{width: '100%', height: '100%'}} />
                    </div>
                  ) : (
                    <div style={{
                      width: '100%',
                      height: '300px',
                      backgroundColor: '#f1f5f9',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px dashed #cbd5e1'
                    }}>
                      <div style={{textAlign: 'center', color: '#64748b'}}>
                        <div style={{fontSize: '14px'}}>No graph data available</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>Close</button>
        </div>
      </div>

      {/* Disclaimer Modal */}
      {showDisclaimer && (
        <div className="modal-overlay" style={{zIndex: 2000}}>
          <div className="modal" style={{width: '500px', maxWidth: '90vw'}}>
            <div className="modal-head">
              <h3>Disclaimer</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowDisclaimer(false)}>
                <X className="ic-xs" />
              </button>
            </div>
            <div className="modal-body">
              <div style={{padding: '20px'}}>
                <h5 style={{fontSize: '18px', fontWeight: '600', color: 'var(--text-1)', marginBottom: '16px'}}>
                  Crop Health
                </h5>
                <p style={{fontSize: '14px', color: 'var(--text-1)', lineHeight: '1.6'}}>
                  NDVI is a normalized difference vegetation index and is a proxy for the greenness and canopy structure. It helps in identifying the growth of a crop compared to a standard crop. However, a few issues can not be identified by NDVI e.g. impact only on the grains. NDVI data is subjected to available satellite passes and cloud free environment.
                </p>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-primary" onClick={() => setShowDisclaimer(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
