import { X } from 'lucide-react';

export default function CropHealth({ onClose }) {
  return (
    <div className="modal-overlay">
      <div className="modal" style={{width: '1000px', maxWidth: '95vw', maxHeight: '90vh'}}>
        <div className="modal-head">
          <h3>Crop Health</h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>
            <X className="ic-xs" />
          </button>
        </div>
        <div className="modal-body" style={{overflowY: 'auto'}}>
          <div style={{marginBottom: '24px'}}>
            <p style={{fontSize: '14px', color: 'var(--text-2)', marginBottom: '16px'}}>
              Crop health monitoring and growth analysis
            </p>
          </div>

          <div style={{
            backgroundColor: '#dcfce7',
            border: '1px solid #86efac',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '24px'
          }}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <div>
                <h4 style={{fontSize: '18px', fontWeight: '600', color: '#16a34a', marginBottom: '4px'}}>
                  Overall Crop Health: Good
                </h4>
                <p style={{fontSize: '14px', color: '#16a34a'}}>Average health score across all farms: 78%</p>
              </div>
              <div style={{fontSize: '48px'}}>🌱</div>
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
              <div style={{fontSize: '24px', fontWeight: '600', color: '#16a34a', marginBottom: '8px'}}>85%</div>
              <div style={{height: '8px', backgroundColor: '#e5e7eb', borderRadius: '4px', overflow: 'hidden'}}>
                <div style={{width: '85%', height: '100%', backgroundColor: '#16a34a'}}></div>
              </div>
              <div style={{fontSize: '12px', color: '#16a34a', marginTop: '4px'}}>Excellent</div>
            </div>
            <div style={{
              backgroundColor: '#fff',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '16px'
            }}>
              <div style={{fontSize: '12px', color: 'var(--text-2)', marginBottom: '4px'}}>Farm FARM00002</div>
              <div style={{fontSize: '24px', fontWeight: '600', color: '#f59e0b', marginBottom: '8px'}}>72%</div>
              <div style={{height: '8px', backgroundColor: '#e5e7eb', borderRadius: '4px', overflow: 'hidden'}}>
                <div style={{width: '72%', height: '100%', backgroundColor: '#f59e0b'}}></div>
              </div>
              <div style={{fontSize: '12px', color: '#f59e0b', marginTop: '4px'}}>Good</div>
            </div>
            <div style={{
              backgroundColor: '#fff',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '16px'
            }}>
              <div style={{fontSize: '12px', color: 'var(--text-2)', marginBottom: '4px'}}>Farm FARM00003</div>
              <div style={{fontSize: '24px', fontWeight: '600', color: '#16a34a', marginBottom: '8px'}}>78%</div>
              <div style={{height: '8px', backgroundColor: '#e5e7eb', borderRadius: '4px', overflow: 'hidden'}}>
                <div style={{width: '78%', height: '100%', backgroundColor: '#16a34a'}}></div>
              </div>
              <div style={{fontSize: '12px', color: '#16a34a', marginTop: '4px'}}>Good</div>
            </div>
          </div>

          <div>
            <h5 style={{fontSize: '16px', fontWeight: '600', color: 'var(--text-1)', marginBottom: '12px'}}>
              Growth Analysis
            </h5>
            <div style={{
              backgroundColor: '#fff',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '16px'
            }}>
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '16px'}}>
                <div>
                  <div style={{fontSize: '12px', color: 'var(--text-2)', marginBottom: '4px'}}>NDVI</div>
                  <div style={{fontSize: '18px', fontWeight: '600', color: 'var(--text-1)'}}>0.72</div>
                </div>
                <div>
                  <div style={{fontSize: '12px', color: 'var(--text-2)', marginBottom: '4px'}}>LAI</div>
                  <div style={{fontSize: '18px', fontWeight: '600', color: 'var(--text-1)'}}>3.2</div>
                </div>
                <div>
                  <div style={{fontSize: '12px', color: 'var(--text-2)', marginBottom: '4px'}}>Biomass</div>
                  <div style={{fontSize: '18px', fontWeight: '600', color: 'var(--text-1)'}}>4.5 t/ha</div>
                </div>
                <div>
                  <div style={{fontSize: '12px', color: 'var(--text-2)', marginBottom: '4px'}}>Growth Stage</div>
                  <div style={{fontSize: '18px', fontWeight: '600', color: 'var(--text-1)'}}>Vegetative</div>
                </div>
              </div>
              <button className="btn btn-primary btn-sm">View Detailed Analysis</button>
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
