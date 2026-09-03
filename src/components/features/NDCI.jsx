import { useState, useEffect } from 'react';
import { X, ArrowLeft, Cloud, Calendar, Info } from 'lucide-react';
import ReactECharts from 'echarts-for-react';
import axios from 'axios';

export default function NDCI({ onClose, onBack, farmId, clientId }) {
  const [ndciData, setNDCIData] = useState([]);
  const [graphData, setGraphData] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [loading, setLoading] = useState(false);
  const [graphLoading, setGraphLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date(2026, 7, 1));
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  useEffect(() => {
    if (farmId && clientId) {
      fetchNDCIData();
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

  const fetchNDCIData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Step 1 - Get API key
      const keyResponse = await axios.get(
        import.meta.env.VITE_FETCH_FARMER_KEY_API_URL,
        { params: { client_id: clientId } }
      );
      const apiKey = keyResponse.data.api_key;

      // Step 2 - Fetch NDCI array
      const response = await axios.get('https://api.sat2farm.com/satellite_report/prod', {
        params: { 
          key: apiKey, 
          startDate: '', 
          endDate: '', 
          farm_id: farmId 
        }
      });

      // Check if data is being processed
      if (response.data?.message && response.data.message.includes('currently being processed')) {
        setError('Data under process');
        return;
      }

      const data = Array.isArray(response.data) ? response.data : [];
      console.log('NDCI API Response:', response.data);
      console.log('NDCI Sample Data:', data[0]);
      setNDCIData(data);

      // Step 3 - Set latest valid entry as default
      const validEntries = data.filter(item =>
        item.png?.ndci &&
        item.png.ndci !== 'None'
      );
      if (validEntries.length > 0) {
        const latestEntry = [...validEntries].sort(
          (a, b) => new Date(b.Date) - new Date(a.Date)
        )[0];
        setSelectedEntry(latestEntry);
        setCalendarMonth(
          new Date(
            new Date(latestEntry.Date).getFullYear(),
            new Date(latestEntry.Date).getMonth(),
            1
          )
        );
      }

      // Step 4 - Build graph from zonalStats
      await fetchGraphData(data);

    } catch (err) {
      console.error('NDCI error:', err);
      setError('Failed to fetch NDCI data');
    } finally {
      setLoading(false);
    }
  };

  const fetchGraphData = async (data) => {
    setGraphLoading(true);
    const points = [];

    // Only fetch entries that have valid zonalStats URL
    const statsEntries = data.filter(
      item => item.zonalStats?.ndci && item.zonalStats.ndci !== 'None'
    );

    // Fetch all stats in parallel for speed
    const results = await Promise.allSettled(
      statsEntries.map(item =>
        axios.get(item.zonalStats.ndci).then(res => ({
          timestamp: item.Date,
          stats: res.data
        }))
      )
    );

    for (const result of results) {
      if (result.status === 'fulfilled') {
        const { timestamp, stats } = result.value;
        console.log('Stats JSON sample:', stats); // ← check console to see structure

        // Try different possible field names for mean NDCI value
        const meanValue =
          stats?.mean ??
          stats?.ndci_mean ??
          stats?.NDCI_mean ??
          stats?.Mean ??
          stats?.value ??
          (Array.isArray(stats) ? stats[0]?.mean : null) ??
          null;

        if (meanValue !== null && !isNaN(meanValue)) {
          points.push({
            date: formatDate(timestamp),
            value: parseFloat(Number(meanValue).toFixed(4)),
            timestamp
          });
        }
      }
    }

    // Sort chronologically
    points.sort((a, b) => a.timestamp - b.timestamp);
    setGraphData(points);
    setGraphLoading(false);
  };

  const validImageEntries = ndciData.filter(item => {
    return (
      item.png?.ndci &&
      item.png.ndci !== 'None'
    );
  });

  const getDateKey = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const availableDates = new Set(
    validImageEntries.map(item => {
      const date = new Date(item.Date);
      return getDateKey(date);
    })
  );

  const getEntryForDate = (date) => {
    const dateKey = getDateKey(date);
    return validImageEntries.find(item => {
      const itemDate = new Date(item.Date);
      return getDateKey(itemDate) === dateKey;
    });
  };

  const handleDateSelect = (date) => {
    const entry = getEntryForDate(date);
    if (!entry) return;
    setSelectedEntry(entry);
    setCalendarMonth(new Date(date.getFullYear(), date.getMonth(), 1));
    setShowCalendar(false);
  };

  const goToPreviousMonth = () => {
    setCalendarMonth(prev => {
      return new Date(prev.getFullYear(), prev.getMonth() - 1, 1);
    });
  };

  const goToNextMonth = () => {
    setCalendarMonth(prev => {
      return new Date(prev.getFullYear(), prev.getMonth() + 1, 1);
    });
  };

  const getCalendarDays = () => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    const days = [];

    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const isSelectedDate = (date) => {
    if (!date || !selectedEntry) return false;
    const selected = new Date(selectedEntry.Date);
    return (
      date.getFullYear() === selected.getFullYear() &&
      date.getMonth() === selected.getMonth() &&
      date.getDate() === selected.getDate()
    );
  };

  const hasGraphData = graphData.length > 0;

  const getChartOption = () => {
    if (!hasGraphData) return {};
    return {
      title: {
        text: 'NDCI Graph',
        left: 'center',
        textStyle: { fontSize: 16, fontWeight: 700, color: '#1e293b' }
      },
      tooltip: {
        trigger: 'axis',
        formatter: (params) => `${params[0].name}<br/>NDCI: ${params[0].value}`
      },
      xAxis: {
        type: 'category',
        data: graphData.map(d => d.date),
        axisLabel: { rotate: 45, color: '#6b7280', fontSize: 10 },
        axisLine: { lineStyle: { color: '#e5e7eb' } }
      },
      yAxis: {
        type: 'value',
        name: 'Mean Value of NDCI',
        nameLocation: 'middle',
        nameGap: 55,
        nameTextStyle: { color: '#6b7280', fontSize: 11 },
        axisLabel: { color: '#6b7280' },
        splitLine: { lineStyle: { color: '#e5e7eb' } },
        min: -0.2,
        max: 1,
        interval: 0.2
      },
      series: [{
        name: 'NDCI',
        type: 'line',
        data: graphData.map(d => d.value),
        smooth: true,
        lineStyle: { color: '#10b981', width: 2 },
        itemStyle: {
          color: '#10b981',
          borderColor: '#fff',
          borderWidth: 2
        },
        areaStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(16,185,129,0.2)' },
              { offset: 1, color: 'rgba(16,185,129,0)' }
            ]
          }
        }
      }],
      grid: { left: 70, right: 30, top: 50, bottom: 80 }
    };
  };

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ width: '950px', maxWidth: '95vw', maxHeight: '90vh' }}>

        {/* Header */}
        <div className="modal-head">
          <button className="btn btn-ghost btn-sm" onClick={onBack}>
            <ArrowLeft className="ic-xs" />
          </button>
          <h3>NDCI</h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>
            <X className="ic-xs" />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body" style={{ overflowY: 'auto', padding: '24px' }}>

          {/* Loading */}
          {loading && (
            <div style={{ textAlign: 'center', padding: '60px' }}>
              <div style={{ color: 'var(--text-2)' }}>Loading NDCI data...</div>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div style={{ textAlign: 'center', padding: '60px', color: error === 'Data under process' ? '#f59e0b' : '#dc2626' }}>
              {error}
            </div>
          )}

          {/* No data */}
          {!loading && !error && ndciData.length === 0 && (
            <div style={{
              backgroundColor: '#f3f4f6', border: '1px solid #d1d5db',
              borderRadius: '12px', padding: '24px',
              display: 'flex', alignItems: 'center', gap: '16px'
            }}>
              <div style={{
                width: '56px', height: '56px', borderRadius: '50%',
                backgroundColor: '#e5e7eb',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Cloud size={28} color="#6b7280" />
              </div>
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>
                  No data due to cloud
                </h4>
                <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                  Next NDCI data will be available by {getNextAvailableDate()}
                </p>
              </div>
            </div>
          )}

          {/* Main content */}
          {!loading && !error && ndciData.length > 0 && (
            <>
              {/* Date + Calendar */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  marginBottom: '16px',
                  position: 'relative'
                }}
              >
                {/* Date button */}
                {selectedEntry && (
                  <button
                    onClick={() => {
                      setCalendarMonth(
                        selectedEntry
                          ? new Date(
                              new Date(selectedEntry.Date).getFullYear(),
                              new Date(selectedEntry.Date).getMonth(),
                              1
                            )
                          : new Date()
                      );
                      setShowCalendar(!showCalendar);
                    }}
                    style={{
                      padding: '10px 24px',
                      backgroundColor: '#12851b',
                      color: '#fff',
                      borderRadius: '5px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      border: 'none',
                      minWidth: '160px',
                      justifyContent: 'center'
                    }}
                  >
                    <Calendar size={16} />
                    {formatDate(selectedEntry.Date)}
                  </button>
                )}

                {/* Info button */}
                <button
                  onClick={() => setShowDisclaimer(true)}
                  style={{
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: '#12851b',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 0,
                    marginLeft: '8px'
                  }}
                >
                  <Info size={20} />
                </button>

                {/* Calendar */}
                {showCalendar && (
                  <div
                    style={{
                      position: 'absolute',
                      right: '0',
                      top: '48px',
                      width: '230px',
                      backgroundColor: '#fff',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      padding: '14px',
                      boxShadow: '0 6px 20px rgba(0,0,0,0.18)',
                      zIndex: 1000
                    }}
                  >
                    {/* Calendar Header */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '12px'
                      }}
                    >
                      <button
                        onClick={goToPreviousMonth}
                        style={{
                          border: 'none',
                          background: 'transparent',
                          cursor: 'pointer',
                          fontSize: '18px',
                          color: '#374151',
                          width: '28px',
                          height: '28px'
                        }}
                      >
                        ‹
                      </button>
                      <div
                        style={{
                          fontSize: '14px',
                          fontWeight: '700',
                          color: '#374151'
                        }}
                      >
                        {calendarMonth.toLocaleDateString('en-US', {
                          month: 'long',
                          year: 'numeric'
                        })}
                      </div>
                      <button
                        onClick={goToNextMonth}
                        style={{
                          border: 'none',
                          background: 'transparent',
                          cursor: 'pointer',
                          fontSize: '18px',
                          color: '#374151',
                          width: '28px',
                          height: '28px'
                        }}
                      >
                        ›
                      </button>
                    </div>

                    {/* Week Header */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(7, 1fr)',
                        gap: '3px',
                        marginBottom: '6px'
                      }}
                    >
                      {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                        <div
                          key={day}
                          style={{
                            textAlign: 'center',
                            fontSize: '10px',
                            fontWeight: '600',
                            color: '#374151',
                            padding: '4px 0'
                          }}
                        >
                          {day}
                        </div>
                      ))}
                    </div>

                    {/* Calendar Days */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(7, 1fr)',
                        gap: '4px'
                      }}
                    >
                      {getCalendarDays().map((date, index) => {
                        if (!date) {
                          return (
                            <div
                              key={`empty-${index}`}
                              style={{
                                height: '27px'
                              }}
                            />
                          );
                        }

                        const dateKey = getDateKey(date);
                        const hasData = availableDates.has(dateKey);
                        const selected = isSelectedDate(date);

                        return (
                          <button
                            key={dateKey}
                            disabled={!hasData}
                            onClick={() => handleDateSelect(date)}
                            style={{
                              height: '27px',
                              width: '27px',
                              borderRadius: '4px',
                              border: selected
                                ? '1px solid #2563eb'
                                : '1px solid #e5e7eb',
                              backgroundColor: selected
                                ? '#2563eb'
                                : hasData
                                  ? '#fff'
                                  : '#f9fafb',
                              color: selected
                                ? '#fff'
                                : hasData
                                  ? '#374151'
                                  : '#d1d5db',
                              fontSize: '11px',
                              cursor: hasData ? 'pointer' : 'default',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: selected ? '700' : '400'
                            }}
                          >
                            {date.getDate()}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Heatmap + Graph */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '20px',
                marginBottom: '24px'
              }}>
                {/* Heatmap */}
                <div style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}>
                  <div style={{
                    fontSize: '13px', fontWeight: '600',
                    color: '#374151', marginBottom: '12px'
                  }}>
                    Normalized Difference Chlorophyll Index
                  </div>
                  {selectedEntry?.png?.ndci && selectedEntry.png.ndci !== 'None' ? (
                    <img
                      src={selectedEntry.png.ndci}
                      alt="NDCI Heatmap"
                      style={{
                        maxWidth: '100%',
                        maxHeight: '280px',
                        objectFit: 'contain',
                        borderRadius: '8px'
                      }}
                    />
                  ) : (
                    <div style={{
                      display: 'flex', alignItems: 'center',
                      gap: '8px', color: '#6b7280', padding: '40px'
                    }}>
                      <Cloud size={24} />
                      <span>No image available</span>
                    </div>
                  )}
                </div>

                {/* Graph */}
                <div style={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  padding: '16px'
                }}>
                  {graphLoading ? (
                    <div style={{
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'center', height: '280px',
                      color: '#6b7280'
                    }}>
                      Loading graph...
                    </div>
                  ) : hasGraphData ? (
                    <ReactECharts
                      option={getChartOption()}
                      style={{ height: '320px', width: '100%' }}
                    />
                  ) : (
                    <div style={{
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'center', height: '280px',
                      color: '#6b7280', flexDirection: 'column', gap: '8px'
                    }}>
                      <Cloud size={32} color="#9ca3af" />
                      <span style={{ fontSize: '14px' }}>
                        Graph data not available
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div style={{
                textAlign: 'center', padding: '12px',
                color: '#1e3a5f', fontSize: '15px', fontWeight: '500'
              }}>
                Next NDCI data will be available by {getNextAvailableDate()}
              </div>
            </>
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
                NDCI Disclaimer
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
              NDCI aims to predict the plant chlorophyll content in optically complex turbid productive waters. Useful for monitoring algae blooms in water bodies, water quality estimation. NDCI data is subjected to available satellite passes and cloud free environment.
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