import { useState, useEffect } from 'react';
import { X, ArrowLeft, Info } from 'lucide-react';
import ReactECharts from 'echarts-for-react';
import axios from 'axios';

export default function Weather({ onClose, onBack, farmId, clientId }) {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  useEffect(() => {
    if (farmId && clientId) {
      fetchWeatherData();
    } else if (farmId && !clientId) {
      setError('Report will be available soon');
    }
  }, [farmId, clientId]);

  const fetchWeatherData = async () => {
    setLoading(true);
    setError(null);
    try {
      const keyResponse = await axios.get(import.meta.env.VITE_FETCH_FARMER_KEY_API_URL, {
        params: { client_id: clientId }
      });
      const apiKey = keyResponse.data.api_key;

      const response = await axios.get(import.meta.env.VITE_WEATHER_API_URL, {
        params: { key: apiKey, farm_id: farmId }
      });

      const data = response.data;
      
      // Filter data from today to next 14 days
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const fourteenDaysLater = new Date(today);
      fourteenDaysLater.setDate(today.getDate() + 14);
      
      const filteredData = data.filter(item => {
        const itemDate = new Date(item.sunriseTimeLocal);
        itemDate.setHours(0, 0, 0, 0);
        return itemDate >= today && itemDate <= fourteenDaysLater;
      });
      
      // Map API response to component data structure
      const current = filteredData[0] || {};
      const forecast = filteredData.map(item => {
        // Parse temperature string "[max, min]" to extract values
        let maxTemp = 0, minTemp = 0;
        if (item.temperature) {
          const tempMatch = item.temperature.match(/\[(\d+\.?\d*),\s*(\d+\.?\d*)\]/);
          if (tempMatch) {
            maxTemp = parseFloat(tempMatch[1]);
            minTemp = parseFloat(tempMatch[2]);
          }
        }
        
        // Map weather condition to icon
        const getWeatherIcon = (thunderCategory) => {
          const category = thunderCategory?.toLowerCase() || '';
          if (category.includes('rain')) return '🌧️';
          if (category.includes('overcast')) return '☁️';
          if (category.includes('partially cloudy')) return '⛅';
          if (category.includes('clear')) return '☀️';
          return '🌤️';
        };
        
        // Format date from sunriseTimeLocal
        const formatDate = (dateStr) => {
          if (!dateStr) return '';
          const date = new Date(dateStr);
          const day = String(date.getDate()).padStart(2, '0');
          const month = String(date.getMonth() + 1).padStart(2, '0');
          return `${day}/${month}`;
        };
        
        return {
          date: formatDate(item.sunriseTimeLocal),
          icon: getWeatherIcon(item.thunderCategory),
          minTemp: minTemp,
          maxTemp: maxTemp,
          rainfall: parseFloat(item.qpf) || 0
        };
      });
      
      setWeatherData({
        current: {
          date: current.sunriseTimeLocal || '',
          description: current.narrative || 'No data available',
          humidity: parseFloat(current.relativeHumidity) || 0,
          windSpeed: parseFloat(current.WindSpeed) || 0,
          cloudCover: parseFloat(current.cloudCover) || 0,
          precipitationType: current.precipType || 'N/A',
          precipitationChance: parseFloat(current.precipChance) || 0,
          temperature: current.temperature ? parseFloat(current.temperature.match(/\[(\d+\.?\d*),/)?.[1]) : 0
        },
        forecast: forecast
      });
    } catch (err) {
      setError('Report will be available soon');
    } finally {
      setLoading(false);
    }
  };
  const rainfallChartOption = weatherData ? {
    backgroundColor: '#ffffff',
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        const item = params[0];
        return `Date: ${item.name}<br/>Rainfall: ${item.value.toFixed(3)} mm`;
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
      data: weatherData.forecast.map(d => d.date),
      axisLabel: {
        color: '#64748b',
        rotate: -45,
        fontSize: 11,
        interval: function(index) {
          return index % 2 === 0;
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
      name: 'Rainfall (mm)',
      nameTextStyle: {
        color: '#64748b',
        fontWeight: 600
      },
      min: 0,
      max: Math.max(...weatherData.forecast.map(d => d.rainfall), 0.08) * 1.1,
      interval: 0.02,
      axisLabel: {
        color: '#64748b',
        formatter: (value) => value.toFixed(2)
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
      name: 'Rainfall',
      data: weatherData.forecast.map(d => d.rainfall),
      type: 'bar',
      itemStyle: {
        color: '#3b82f6',
        borderRadius: [4, 4, 0, 0]
      },
      barWidth: '50%'
    }]
  } : null;

  const temperatureChartOption = weatherData ? {
    backgroundColor: '#ffffff',
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        let result = `Date: ${params[0].name}<br/>`;
        params.forEach(param => {
          result += `${param.seriesName}: ${param.value.toFixed(1)}°C<br/>`;
        });
        return result;
      }
    },
    legend: {
      data: ['Max Temperature', 'Min Temperature'],
      bottom: '8%',
      textStyle: {
        color: '#64748b'
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
      data: weatherData.forecast.map(d => d.date),
      axisLabel: {
        color: '#64748b',
        rotate: -45,
        fontSize: 11,
        interval: function(index) {
          return index % 2 === 0;
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
      name: 'Temperature (°C)',
      nameTextStyle: {
        color: '#64748b',
        fontWeight: 600
      },
      min: Math.min(...weatherData.forecast.map(d => d.minTemp)) - 2,
      max: Math.max(...weatherData.forecast.map(d => d.maxTemp)) + 2,
      axisLabel: {
        color: '#64748b',
        formatter: (value) => `${value.toFixed(0)}°C`
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
    series: [
      {
        name: 'Max Temperature',
        data: weatherData.forecast.map(d => d.maxTemp),
        type: 'line',
        smooth: true,
        smoothMonotone: 'x',
        lineStyle: {
          color: '#8b5cf6',
          width: 3
        },
        itemStyle: {
          color: '#8b5cf6'
        },
        symbol: 'circle',
        symbolSize: 6
      },
      {
        name: 'Min Temperature',
        data: weatherData.forecast.map(d => d.minTemp),
        type: 'line',
        smooth: true,
        smoothMonotone: 'x',
        lineStyle: {
          color: '#16a34a',
          width: 3
        },
        itemStyle: {
          color: '#16a34a'
        },
        symbol: 'circle',
        symbolSize: 6
      }
    ]
  } : null;

  return (
    <div className="modal-overlay">
      <div className="modal" style={{width: '1000px', maxWidth: '95vw', maxHeight: '90vh'}}>
        <div className="modal-head">
          <button className="btn btn-ghost btn-sm" onClick={onBack || onClose}>
            <ArrowLeft className="ic-xs" />
          </button>
          <h3>Weather</h3>
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
              Loading weather data...
            </div>
          ) : error ? (
            <div style={{textAlign: 'center', padding: '40px', color: '#ef4444'}}>
              {error}
            </div>
          ) : weatherData ? (
            <>
              {/* Top Section: Weather Forecast */}
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px'}}>
                {/* Left Panel: Current Weather Card */}
                <div style={{
                  backgroundColor: '#fff',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  padding: '20px'
                }}>
                  <h5 style={{fontSize: '16px', fontWeight: '600', color: 'var(--text-1)', marginBottom: '16px'}}>
                    Current Weather
                  </h5>
                  <div style={{marginBottom: '16px'}}>
                    <div style={{fontSize: '14px', color: 'var(--text-2)', marginBottom: '4px'}}>Date</div>
                    <div style={{fontSize: '18px', fontWeight: '600', color: 'var(--text-1)'}}>
                      {weatherData.current.date}
                    </div>
                  </div>
                  <div style={{marginBottom: '16px'}}>
                    <div style={{fontSize: '14px', color: 'var(--text-2)', marginBottom: '4px'}}>Temperature</div>
                    <div style={{fontSize: '32px', fontWeight: '700', color: 'var(--text-1)'}}>
                      {weatherData.current.temperature}°C
                    </div>
                  </div>
                  <div style={{marginBottom: '24px'}}>
                    <div style={{fontSize: '14px', color: 'var(--text-2)', marginBottom: '4px'}}>Description</div>
                    <div style={{fontSize: '16px', color: 'var(--text-1)'}}>
                      {weatherData.current.description}
                    </div>
                  </div>
                  
                  {/* Weather Details */}
                  <div style={{
                    backgroundColor: '#f1f5f9',
                    borderRadius: '8px',
                    padding: '16px',
                    border: '1px solid #cbd5e1'
                  }}>
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px'}}>
                      <div>
                        <div style={{fontSize: '12px', color: 'var(--text-2)', marginBottom: '4px'}}>Humidity</div>
                        <div style={{fontSize: '16px', fontWeight: '600', color: 'var(--text-1)'}}>{weatherData.current.humidity}%</div>
                      </div>
                      <div>
                        <div style={{fontSize: '12px', color: 'var(--text-2)', marginBottom: '4px'}}>Wind Speed</div>
                        <div style={{fontSize: '16px', fontWeight: '600', color: 'var(--text-1)'}}>{weatherData.current.windSpeed} km/h</div>
                      </div>
                      <div>
                        <div style={{fontSize: '12px', color: 'var(--text-2)', marginBottom: '4px'}}>Cloud Cover</div>
                        <div style={{fontSize: '16px', fontWeight: '600', color: 'var(--text-1)'}}>{weatherData.current.cloudCover}%</div>
                      </div>
                      <div>
                        <div style={{fontSize: '12px', color: 'var(--text-2)', marginBottom: '4px'}}>Precipitation</div>
                        <div style={{fontSize: '16px', fontWeight: '600', color: 'var(--text-1)'}}>{weatherData.current.precipitationType}</div>
                      </div>
                      <div style={{gridColumn: 'span 2'}}>
                        <div style={{fontSize: '12px', color: 'var(--text-2)', marginBottom: '4px'}}>Precipitation Chance</div>
                        <div style={{fontSize: '16px', fontWeight: '600', color: 'var(--text-1)'}}>{weatherData.current.precipitationChance}%</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Panel: 10-Day Forecast */}
                <div style={{
                  backgroundColor: '#fff',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  padding: '20px'
                }}> 
                  <h5 style={{fontSize: '16px', fontWeight: '600', color: 'var(--text-1)', marginBottom: '16px'}}>
                    14-Days Forecast
                  </h5>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(5, 1fr)',
                    gap: '12px'
                  }}>
                    {weatherData.forecast.map((day, idx) => (
                      <div key={idx} style={{
                        backgroundColor: '#f1f5f9',
                        borderRadius: '8px',
                        padding: '12px',
                        textAlign: 'center',
                        border: '1px solid #cbd5e1'
                      }}>
                        <div style={{fontSize: '12px', fontWeight: '600', color: 'var(--text-1)', marginBottom: '6px'}}>
                          {day.date}
                        </div>
                        <div style={{fontSize: '28px', marginBottom: '6px'}}>
                          {day.icon}
                        </div>
                        <div style={{fontSize: '12px', color: '#16a34a', fontWeight: '600'}}>
                          {day.minTemp}°C
                        </div>
                        <div style={{fontSize: '12px', color: '#8b5cf6', fontWeight: '600'}}>
                          {day.maxTemp}°C
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Section: Charts */}
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px'}}>
                {/* Rainfall Statistics */}
                <div style={{
                  backgroundColor: '#fff',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  padding: '20px'
                }}>
                  <h5 style={{fontSize: '16px', fontWeight: '600', color: 'var(--text-1)', marginBottom: '12px'}}>
                    Rainfall Statistics
                  </h5>
                  {rainfallChartOption && (
                    <ReactECharts option={rainfallChartOption} style={{height: '500px'}} />
                  )}
                </div>

                {/* Temperature Statistics */}
                <div style={{
                  backgroundColor: '#fff',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  padding: '20px'
                }}>
                  <h5 style={{fontSize: '16px', fontWeight: '600', color: 'var(--text-1)', marginBottom: '12px'}}>
                    Temperature Statistics
                  </h5>
                  {temperatureChartOption && (
                    <ReactECharts option={temperatureChartOption} style={{height: '500px'}} />
                  )}
                </div>
              </div>
            </>
          ) : null}
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
                  Weather Forecast
                </h5>
                <p style={{fontSize: '14px', color: 'var(--text-1)', lineHeight: '1.6'}}>
                  Users are advised to note that meteorological conditions can undergo swift changes, and the provided data may not consistently mirror real-time situations.
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
