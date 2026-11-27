import { useState, useEffect } from 'react';
import { X, ArrowLeft, Info, Calendar, Download } from 'lucide-react';
import ReactECharts from 'echarts-for-react';
import axios from 'axios';
import { useLanguage } from '../../context/LanguageContext';

export default function CropHealth({ onClose, onBack, farmId, clientId, farmCategory }) {
  const { t } = useLanguage();
  const [satelliteData, setSatelliteData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [ndviData, setNdviData] = useState(null);

  const isPastureCategory = String(farmCategory || '').toLowerCase() === 'pasture';

  useEffect(() => {
    if (farmId && clientId) {
      isPastureCategory ? fetchPastureData() : fetchSatelliteData();
    } else if (farmId && !clientId) {
      setError(t('dataAvailableSoon'));
    }
  }, [farmId, clientId, farmCategory]);

  // Shared by pasture + non-pasture
  const processSatelliteData = async (data) => {
    const sortedData = [...data].sort((a, b) => b.Date - a.Date);
    setSatelliteData(sortedData);

    const validData = sortedData.filter(item =>
      item.zonalStats?.ndvi && item.zonalStats.ndvi !== 'None' &&
      item.png?.ndvi && item.png.ndvi !== 'None'
    );
    const pngOnlyData = sortedData.filter(item => item.png?.ndvi && item.png.ndvi !== 'None');

    if (pngOnlyData.length > 0) setSelectedDate(pngOnlyData[0]);
    if (validData.length > 0) await fetchChartData(validData);
    return sortedData.length > 0;
  };

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
      await processSatelliteData(response.data);
    } catch (err) {
      setError(t('dataAvailableSoon'));
    } finally {
      setLoading(false);
    }
  };

  const fetchPastureData = async () => {
    setLoading(true);
    setError(null);
    try {
      const keyResponse = await axios.get(import.meta.env.VITE_FETCH_FARMER_KEY_API_URL, {
        params: { client_id: clientId }
      });
      const apiKey = keyResponse.data.api_key;
      console.log('Pasture - API Key:', apiKey);

      const [satRes, avgRes] = await Promise.allSettled([
        axios.get(import.meta.env.VITE_SATELLITE_REPORT_API_URL, {
          params: { key: apiKey, farm_id: farmId }
        }),
        axios.get(import.meta.env.VITE_MEAN_NDVI_DATA_API_URL, {
          params: { api_key: apiKey, farm_id: farmId }
        })
      ]);

      console.log('Pasture - Satellite API Response:', satRes);
      console.log('Pasture - NDVI API Response:', avgRes);

      let hasData = false;
      let hasSatelliteData = false;

      // Process NDVI data (5-year average)
      if (avgRes.status === 'fulfilled' && avgRes.value.data?.status && avgRes.value.data?.data) {
        console.log('Pasture - Setting NDVI data:', avgRes.value.data.data);
        setNdviData(avgRes.value.data.data);
        hasData = true;
      } else {
        console.log('Pasture - NDVI API failed or no data:', avgRes.status === 'fulfilled' ? avgRes.value.data : avgRes.reason);
      }

      // Process satellite data (for PNG images and current season chart)
      if (satRes.status === 'fulfilled' && Array.isArray(satRes.value.data)) {
        console.log('Pasture - Processing satellite data, array length:', satRes.value.data.length);
        const ok = await processSatelliteData(satRes.value.data);
        hasData = hasData || ok;
        hasSatelliteData = ok;
      } else {
        console.log('Pasture - Satellite API failed or not array:', satRes.status === 'fulfilled' ? satRes.value.data : satRes.reason);
        // If satellite data is being processed, set a flag to show appropriate message
        if (satRes.status === 'fulfilled' && satRes.value.data?.message) {
          console.log('Pasture - Satellite data processing message:', satRes.value.data.message);
        }
      }

      // If we have NDVI data but no satellite data, create chart data from NDVI timeseries
      if (hasData && !hasSatelliteData && ndviData?.timeseries_data) {
        console.log('Pasture - Creating chart data from NDVI timeseries');
        const baseYear = new Date().getFullYear();
        const chartFromNdvi = ndviData.timeseries_data
          .filter(item => item.ndvi !== null && item.ndvi !== undefined)
          .map(item => {
            const d = new Date(baseYear, 0);
            d.setDate(item.year_day);
            return {
              date: d.getTime(),
              mean: item.ndvi
            };
          })
          .sort((a, b) => a.date - b.date);
        console.log('Pasture - Chart data from NDVI:', chartFromNdvi);
        setChartData(chartFromNdvi);
      }

      if (!hasData) {
        console.log('Pasture - No data available from either API');
        setError(t('dataAvailableSoon'));
      }
    } catch (err) {
      console.error('Pasture - Fetch error:', err);
      setError(t('dataAvailableSoon'));
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

  // Pasture chart helpers
  const dateFromYearDay = (yearDay, year) => {
    const d = new Date(year, 0);
    d.setDate(yearDay);
    return d;
  };
  const fmtShort = (ts) => {
    const d = new Date(ts);
    const yy = String(d.getFullYear()).slice(2);
    return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${yy}`;
  };

  // Chart 1: current season with value labels
  const pastureTrendOption = chartData.length > 0 ? {
    grid: { left: 8, right: 16, top: 24, bottom: 8, containLabel: true },
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: chartData.map(d => fmtShort(d.date)),
      axisLabel: { rotate: 40, fontSize: 10, color: '#444' }
    },
    yAxis: {
      type: 'value', min: 0, max: 0.9, interval: 0.1,
      axisLabel: { fontSize: 10, color: '#444' },
      splitLine: { lineStyle: { color: '#ddd' } }
    },
    series: [{
      name: 'NDVI',
      type: 'line',
      smooth: true,
      data: chartData.map(d => Number(d.mean.toFixed(2))),
      symbol: 'circle',
      symbolSize: 6,
      itemStyle: { color: '#fff', borderColor: '#2f8fc9', borderWidth: 2 },
      lineStyle: { color: '#3b9ad9', width: 2.5 },
      label: { show: true, position: 'top', fontSize: 10, color: '#333' }
    }]
  } : null;

  // Chart 2: current vs 5-year average (aligned to the current season start)
  const pastureCompareOption = (() => {
    if (chartData.length === 0 || !ndviData?.timeseries_data) return null;
    const startTs = chartData[0].date;
    const baseYear = new Date(startTs).getFullYear();

    const avgSeries = ndviData.timeseries_data
      .map(item => {
        let d = dateFromYearDay(item.year_day, baseYear);
        if (d.getTime() < startTs - 15 * 86400000) d = dateFromYearDay(item.year_day, baseYear + 1);
        return [d.getTime(), item.ndvi];
      })
      .sort((a, b) => a[0] - b[0]);

    const currentSeries = chartData.map(d => [d.date, d.mean]);

    return {
      grid: { left: 8, right: 16, top: 16, bottom: 36, containLabel: true },
      tooltip: {
        trigger: 'axis',
        valueFormatter: (v) => (typeof v === 'number' ? v.toFixed(2) : v)
      },
      legend: {
        bottom: 0, itemWidth: 10, itemHeight: 10, textStyle: { fontSize: 10 },
        data: ['5-Year Average', 'Current Data']
      },
      xAxis: {
        type: 'time',
        axisLabel: { rotate: 40, fontSize: 10, color: '#444', formatter: (v) => fmtShort(v) },
        splitLine: { show: true, lineStyle: { color: '#ddd' } }
      },
      yAxis: {
        type: 'value', min: 0.1, max: 0.8, interval: 0.1,
        axisLabel: { fontSize: 10, color: '#444' },
        splitLine: { lineStyle: { color: '#ddd' } }
      },
      series: [
        {
          name: '5-Year Average', type: 'line', smooth: true, showSymbol: false,
          data: avgSeries,
          lineStyle: { color: '#888', width: 2, type: 'dashed' },
          itemStyle: { color: '#888' }
        },
        {
          name: 'Current Data', type: 'line', smooth: true, showSymbol: false,
          data: currentSeries,
          lineStyle: { color: '#0000ee', width: 2.5 },
          itemStyle: { color: '#0000ee' }
        }
      ]
    };
  })();

  // Use pasture data for pasture category, otherwise use regular chart data
  const chartDataToUse = isPastureCategory ? chartData : chartData;
  const chartOption = chartDataToUse && chartDataToUse.length > 0 ? {
    backgroundColor: '#ffffff',
    title: {
      text: t('ndviTrend'),
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
        const value = isPastureCategory ? item.value : item.value;
        return `${t('date')}: ${item.name}<br/>NDVI: ${value.toFixed(4)}`;
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
      data: chartDataToUse.map(d => d.date),
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
      name: t('ndviValue'),
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
      data: chartDataToUse.map(d => isPastureCategory ? d.ndvi : d.mean),
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
      <div className="modal" style={{width: isPastureCategory ? '1000px' : '1200px', maxWidth: '95vw', maxHeight: '90vh'}}>
        <div className="modal-head">
          <button className="btn btn-ghost btn-sm" onClick={onBack || onClose}>
            <ArrowLeft className="ic-xs" />
          </button>
          <h3>{isPastureCategory ? t('cropHealthPasture') : t('cropHealth')}</h3>
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
              {t('loadingCropHealthData')}
            </div>
          ) : error ? (
            <div style={{textAlign: 'center', padding: '40px', color: '#2563eb'}}>
              {error}
            </div>
          ) : isPastureCategory ? (
            <div style={{ maxWidth: 960, margin: '0 auto' }}>
              <div style={{
                background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12,
                padding: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.08)'
              }}>
                {/* Header: date + download */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Calendar size={26} color="#c0392b" />
                  <select
                    value={selectedDate?.Date || ''}
                    onChange={(e) => setSelectedDate(pngData.find(d => d.Date === parseInt(e.target.value)))}
                    style={{ border: 'none', background: 'transparent', fontSize: 13, fontWeight: 500, flex: 1 }}
                  >
                    {pngData.map(item => (
                      <option key={item.Date} value={item.Date}>{formatDate(item.Date).replaceAll('-', '/')}</option>
                    ))}
                  </select>
                  {selectedDate?.png?.ndvi && (
                    <a href={selectedDate.png.ndvi} download target="_blank" rel="noreferrer" title="Download">
                      <Download size={20} color="#111" />
                    </a>
                  )}
                </div>

                {/* NDVI map and Chart side by side */}
                <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                  {/* NDVI map */}
                  <div style={{ flex: 1, textAlign: 'center' }}>
                    <div style={{ fontSize: 9, fontWeight: 700 }}>{t('normalizedDifferenceVegetationIndex')}</div>
                    {selectedDate?.png?.ndvi ? (
                      <img src={selectedDate.png.ndvi} alt="NDVI"
                           style={{ width: '100%', height: 250, objectFit: 'contain' }} />
                    ) : (
                      <div style={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: 13 }}>
                        No image available
                      </div>
                    )}
                  </div>

                  {/* Chart */}
                  <div style={{ flex: 1 }}>
                    <div style={{ color: '#1a9850', fontWeight: 700, fontSize: 13, marginBottom: 8 }}>Chart</div>
                    {pastureTrendOption ? (
                      <ReactECharts option={pastureTrendOption} style={{ width: '100%', height: 250 }} />
                    ) : (
                      <div style={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: 13 }}>
                        No graph data available
                      </div>
                    )}
                    <div style={{ fontSize: 10, color: '#444', display: 'flex', alignItems: 'center', gap: 4, marginTop: 8 }}>
                      <span style={{ width: 8, height: 8, background: '#3b9ad9', display: 'inline-block' }} /> NDVI
                    </div>
                  </div>
                </div>

                {nextReportDate && (
                  <div style={{ textAlign: 'center', color: '#2f8fc9', fontWeight: 700, fontSize: 13, padding: '6px 0',
                                marginTop: 12, borderBottom: '1px solid #ccc' }}>
                    *Next data will be available soon.
                  </div>
                )}

                {/* Compared to 5-year average */}
                <div style={{ color: '#1a9850', fontWeight: 700, fontSize: 13, margin: '12px 0 4px' }}>
                  Compared to 5-Year Historical Average
                </div>
                {pastureCompareOption ? (
                  <ReactECharts option={pastureCompareOption} style={{ width: '100%', height: 240 }} />
                ) : (
                  <div style={{ padding: 20, color: '#64748b', fontSize: 13 }}>No comparison data available</div>
                )}

                {/* Disclaimer link */}
                <div style={{ textAlign: 'right' }}>
                  <button
                    onClick={() => setShowDisclaimer(true)}
                    style={{ background: 'none', border: 'none', color: '#b03a00', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}
                  >
                    ⓘ Disclaimer
                  </button>
                </div>
              </div>
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
                  {isPastureCategory ? 'Crop Health (Pasture)' : 'Crop Health'}
                </h5>
                <p style={{fontSize: '14px', color: 'var(--text-1)', lineHeight: '1.6'}}>
                  {isPastureCategory
                    ? 'NDVI is a normalized difference vegetation index and is a proxy for the greenness and canopy structure. It helps in identifying the growth of pasture compared to a standard pasture. However, a few issues can not be identified by NDVI e.g. impact only on the grass quality. NDVI data is subjected to available satellite passes and cloud free environment.'
                    : 'NDVI is a normalized difference vegetation index and is a proxy for the greenness and canopy structure. It helps in identifying the growth of a crop compared to a standard crop. However, a few issues can not be identified by NDVI e.g. impact only on the grains. NDVI data is subjected to available satellite passes and cloud free environment.'
                  }
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
