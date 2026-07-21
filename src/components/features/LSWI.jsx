import { X } from 'lucide-react';

export default function LSWI({ onClose }) {
  return (
    <div className="modal-overlay">
      <div className="modal" style={{width: '1000px', maxWidth: '95vw', maxHeight: '90vh'}}>
        <div className="modal-head">
          <h3>LSWI</h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>
            <X className="ic-xs" />
          </button>
        </div>
        <div className="modal-body" style={{overflowY: 'auto'}}>
          <div style={{marginBottom: '24px'}}>
            <p style={{fontSize: '14px', color: 'var(--text-2)', marginBottom: '16px'}}>
              Land Surface Water Index for vegetation water content analysis
            </p>
          </div>

          <div style={{
            backgroundColor: '#e0e7ff',
            border: '1px solid #a5b4fc',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '24px'
          }}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <div>
                <h4 style={{fontSize: '18px', fontWeight: '600', color: '#4338ca', marginBottom: '4px'}}>
                  Average LSWI: 0.42
                </h4>
                <p style={{fontSize: '14px', color: '#4338ca'}}>Vegetation water content: Moderate</p>
              </div>
              <div style={{fontSize: '48px'}}>📊</div>
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
              <div style={{fontSize: '24px', fontWeight: '600', color: '#16a34a', marginBottom: '8px'}}>0.48</div>
              <div style={{height: '8px', backgroundColor: '#e5e7eb', borderRadius: '4px', overflow: 'hidden'}}>
                <div style={{width: '48%', height: '100%', backgroundColor: '#16a34a'}}></div>
              </div>
              <div style={{fontSize: '12px', color: '#16a34a', marginTop: '4px'}}>High Water</div>
            </div>
            <div style={{
              backgroundColor: '#fff',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '16px'
            }}>
              <div style={{fontSize: '12px', color: 'var(--text-2)', marginBottom: '4px'}}>Farm FARM00002</div>
              <div style={{fontSize: '24px', fontWeight: '600', color: '#f59e0b', marginBottom: '8px'}}>0.35</div>
              <div style={{height: '8px', backgroundColor: '#e5e7eb', borderRadius: '4px', overflow: 'hidden'}}>
                <div style={{width: '35%', height: '100%', backgroundColor: '#f59e0b'}}></div>
              </div>
              <div style={{fontSize: '12px', color: '#f59e0b', marginTop: '4px'}}>Moderate</div>
            </div>
            <div style={{
              backgroundColor: '#fff',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '16px'
            }}>
              <div style={{fontSize: '12px', color: 'var(--text-2)', marginBottom: '4px'}}>Farm FARM00003</div>
              <div style={{fontSize: '24px', fontWeight: '600', color: '#16a34a', marginBottom: '8px'}}>0.43</div>
              <div style={{height: '8px', backgroundColor: '#e5e7eb', borderRadius: '4px', overflow: 'hidden'}}>
                <div style={{width: '43%', height: '100%', backgroundColor: '#16a34a'}}></div>
              </div>
              <div style={{fontSize: '12px', color: '#16a34a', marginTop: '4px'}}>High Water</div>
            </div>
          </div>

          <div>
            <h5 style={{fontSize: '16px', fontWeight: '600', color: 'var(--text-1)', marginBottom: '12px'}}>
              LSWI Analysis
            </h5>
            <div style={{
              backgroundColor: '#fff',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '16px'
            }}>
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px'}}>
                <div>
                  <div style={{fontSize: '12px', color: 'var(--text-2)', marginBottom: '4px'}}>Min Value</div>
                  <div style={{fontSize: '18px', fontWeight: '600', color: 'var(--text-1)'}}>0.25</div>
                </div>
                <div>
                  <div style={{fontSize: '12px', color: 'var(--text-2)', marginBottom: '4px'}}>Max Value</div>
                  <div style={{fontSize: '18px', fontWeight: '600', color: 'var(--text-1)'}}>0.52</div>
                </div>
                <div>
                  <div style={{fontSize: '12px', color: 'var(--text-2)', marginBottom: '4px'}}>Standard Deviation</div>
                  <div style={{fontSize: '18px', fontWeight: '600', color: 'var(--text-1)'}}>0.08</div>
                </div>
              </div>
              <div style={{fontSize: '13px', color: 'var(--text-2)', marginBottom: '12px'}}>
                LSWI values range from -1 to 1. Higher values indicate higher vegetation water content. 
                Values above 0.4 suggest good water availability in vegetation.
              </div>
              <button className="btn btn-primary btn-sm">View Historical Data</button>
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
