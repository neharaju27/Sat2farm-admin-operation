import { X } from 'lucide-react';

export default function Weather({ onClose }) {
  return (
    <div className="modal-overlay">
      <div className="modal" style={{width: '1000px', maxWidth: '95vw', maxHeight: '90vh'}}>
        <div className="modal-head">
          <h3>Weather</h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>
            <X className="ic-xs" />
          </button>
        </div>
        <div className="modal-body" style={{overflowY: 'auto'}}>
          <div style={{marginBottom: '24px'}}>
            <p style={{fontSize: '14px', color: 'var(--text-2)', marginBottom: '16px'}}>
              Real-time weather data and forecasts for your farm locations
            </p>
          </div>

          <div style={{
            backgroundColor: '#e0f2fe',
            border: '1px solid #bae6fd',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '24px'
          }}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <div>
                <div style={{fontSize: '48px', fontWeight: '600', color: '#0369a1'}}>28°C</div>
                <div style={{fontSize: '16px', color: '#0369a1', marginTop: '4px'}}>Partly Cloudy</div>
              </div>
              <div style={{fontSize: '64px'}}>🌤️</div>
            </div>
          </div>

          <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px'}}>
            <div style={{
              backgroundColor: '#fff',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '16px',
              textAlign: 'center'
            }}>
              <div style={{fontSize: '12px', color: 'var(--text-2)', marginBottom: '4px'}}>Humidity</div>
              <div style={{fontSize: '20px', fontWeight: '600', color: 'var(--text-1)'}}>65%</div>
            </div>
            <div style={{
              backgroundColor: '#fff',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '16px',
              textAlign: 'center'
            }}>
              <div style={{fontSize: '12px', color: 'var(--text-2)', marginBottom: '4px'}}>Wind</div>
              <div style={{fontSize: '20px', fontWeight: '600', color: 'var(--text-1)'}}>12 km/h</div>
            </div>
            <div style={{
              backgroundColor: '#fff',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '16px',
              textAlign: 'center'
            }}>
              <div style={{fontSize: '12px', color: 'var(--text-2)', marginBottom: '4px'}}>Rainfall</div>
              <div style={{fontSize: '20px', fontWeight: '600', color: 'var(--text-1)'}}>2 mm</div>
            </div>
            <div style={{
              backgroundColor: '#fff',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '16px',
              textAlign: 'center'
            }}>
              <div style={{fontSize: '12px', color: 'var(--text-2)', marginBottom: '4px'}}>UV Index</div>
              <div style={{fontSize: '20px', fontWeight: '600', color: 'var(--text-1)'}}>6</div>
            </div>
          </div>

          <div>
            <h5 style={{fontSize: '16px', fontWeight: '600', color: 'var(--text-1)', marginBottom: '12px'}}>
              5-Day Forecast
            </h5>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px'}}>
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day, idx) => (
                <div key={day} style={{
                  backgroundColor: '#fff',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  padding: '16px',
                  textAlign: 'center'
                }}>
                  <div style={{fontSize: '14px', fontWeight: '600', color: 'var(--text-1)', marginBottom: '8px'}}>{day}</div>
                  <div style={{fontSize: '32px', marginBottom: '8px'}}>
                    {['🌤️', '☀️', '🌧️', '⛅', '☀️'][idx]}
                  </div>
                  <div style={{fontSize: '16px', fontWeight: '600', color: 'var(--text-1)'}}>
                    {28 + idx}°C
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
