import { X } from 'lucide-react';

export default function SoilMoisture({ onClose }) {
  return (
    <div className="modal-overlay">
      <div className="modal" style={{width: '1000px', maxWidth: '95vw', maxHeight: '90vh'}}>
        <div className="modal-head">
          <h3>Soil Moisture</h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>
            <X className="ic-xs" />
          </button>
        </div>
        <div className="modal-body" style={{overflowY: 'auto'}}>
          <div style={{marginBottom: '24px'}}>
            <p style={{fontSize: '14px', color: 'var(--text-2)', marginBottom: '16px'}}>
              Soil moisture levels and irrigation recommendations
            </p>
          </div>

          <div style={{
            backgroundColor: '#dbeafe',
            border: '1px solid #93c5fd',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '24px'
          }}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <div>
                <h4 style={{fontSize: '18px', fontWeight: '600', color: '#1e40af', marginBottom: '4px'}}>
                  Average Soil Moisture: 42%
                </h4>
                <p style={{fontSize: '14px', color: '#1e40af'}}>Optimal range: 35-50%</p>
              </div>
              <div style={{fontSize: '48px'}}>💧</div>
            </div>
          </div>

          <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px'}}>
            <div style={{
              backgroundColor: '#fff',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '16px'
            }}>
              <div style={{fontSize: '12px', color: 'var(--text-2)', marginBottom: '4px'}}>Farm FARM00001</div>
              <div style={{fontSize: '24px', fontWeight: '600', color: '#16a34a', marginBottom: '8px'}}>45%</div>
              <div style={{height: '8px', backgroundColor: '#e5e7eb', borderRadius: '4px', overflow: 'hidden'}}>
                <div style={{width: '45%', height: '100%', backgroundColor: '#16a34a'}}></div>
              </div>
              <div style={{fontSize: '12px', color: '#16a34a', marginTop: '4px'}}>Optimal</div>
            </div>
            <div style={{
              backgroundColor: '#fff',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '16px'
            }}>
              <div style={{fontSize: '12px', color: 'var(--text-2)', marginBottom: '4px'}}>Farm FARM00002</div>
              <div style={{fontSize: '24px', fontWeight: '600', color: '#dc2626', marginBottom: '8px'}}>28%</div>
              <div style={{height: '8px', backgroundColor: '#e5e7eb', borderRadius: '4px', overflow: 'hidden'}}>
                <div style={{width: '28%', height: '100%', backgroundColor: '#dc2626'}}></div>
              </div>
              <div style={{fontSize: '12px', color: '#dc2626', marginTop: '4px'}}>Needs Water</div>
            </div>
            <div style={{
              backgroundColor: '#fff',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '16px'
            }}>
              <div style={{fontSize: '12px', color: 'var(--text-2)', marginBottom: '4px'}}>Farm FARM00003</div>
              <div style={{fontSize: '24px', fontWeight: '600', color: '#16a34a', marginBottom: '8px'}}>52%</div>
              <div style={{height: '8px', backgroundColor: '#e5e7eb', borderRadius: '4px', overflow: 'hidden'}}>
                <div style={{width: '52%', height: '100%', backgroundColor: '#16a34a'}}></div>
              </div>
              <div style={{fontSize: '12px', color: '#16a34a', marginTop: '4px'}}>Optimal</div>
            </div>
          </div>

          <div>
            <h5 style={{fontSize: '16px', fontWeight: '600', color: 'var(--text-1)', marginBottom: '12px'}}>
              Irrigation Recommendations
            </h5>
            <div style={{
              backgroundColor: '#fff',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '16px'
            }}>
              <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px'}}>
                <div style={{
                  backgroundColor: '#fee2e2',
                  borderRadius: '8px',
                  padding: '8px',
                  fontSize: '20px'
                }}>⚠️</div>
                <div style={{flex: 1}}>
                  <div style={{fontSize: '14px', fontWeight: '600', color: 'var(--text-1)'}}>Immediate Irrigation Required</div>
                  <div style={{fontSize: '12px', color: 'var(--text-2)'}}>Farm FARM00002 • Recommended: 15mm water</div>
                </div>
              </div>
              <button className="btn btn-primary btn-sm">Schedule Irrigation</button>
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
