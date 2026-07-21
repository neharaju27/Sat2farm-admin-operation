import { X } from 'lucide-react';

export default function PestAndDisease({ onClose }) {
  return (
    <div className="modal-overlay">
      <div className="modal" style={{width: '1000px', maxWidth: '95vw', maxHeight: '90vh'}}>
        <div className="modal-head">
          <h3>Pest and Disease</h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>
            <X className="ic-xs" />
          </button>
        </div>
        <div className="modal-body" style={{overflowY: 'auto'}}>
          <div style={{marginBottom: '24px'}}>
            <p style={{fontSize: '14px', color: 'var(--text-2)', marginBottom: '16px'}}>
              Pest detection and disease monitoring for crop protection
            </p>
          </div>

          <div style={{
            backgroundColor: '#fee2e2',
            border: '1px solid #fca5a5',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '24px'
          }}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <div>
                <h4 style={{fontSize: '18px', fontWeight: '600', color: '#dc2626', marginBottom: '4px'}}>
                  ⚠️ Alert: Active Pest Detected
                </h4>
                <p style={{fontSize: '14px', color: '#dc2626'}}>Brown Plant Hopper detected in Farm FARM00001</p>
              </div>
              <div style={{fontSize: '48px'}}>🐛</div>
            </div>
          </div>

          <div style={{marginBottom: '24px'}}>
            <h5 style={{fontSize: '16px', fontWeight: '600', color: 'var(--text-1)', marginBottom: '12px'}}>
              Recent Detections
            </h5>
            <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
              <div style={{
                backgroundColor: '#fff',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px'
              }}>
                <div style={{
                  backgroundColor: '#fee2e2',
                  borderRadius: '8px',
                  padding: '12px',
                  fontSize: '24px'
                }}>🐛</div>
                <div style={{flex: 1}}>
                  <div style={{fontSize: '14px', fontWeight: '600', color: 'var(--text-1)'}}>Brown Plant Hopper</div>
                  <div style={{fontSize: '12px', color: 'var(--text-2)'}}>Farm FARM00001 • Detected 2 hours ago • Severity: High</div>
                </div>
                <span style={{
                  padding: '4px 12px',
                  borderRadius: '12px',
                  backgroundColor: '#fee2e2',
                  color: '#dc2626',
                  fontSize: '12px',
                  fontWeight: '600'
                }}>High</span>
              </div>
              <div style={{
                backgroundColor: '#fff',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px'
              }}>
                <div style={{
                  backgroundColor: '#fef3c7',
                  borderRadius: '8px',
                  padding: '12px',
                  fontSize: '24px'
                }}>🍂</div>
                <div style={{flex: 1}}>
                  <div style={{fontSize: '14px', fontWeight: '600', color: 'var(--text-1)'}}>Leaf Blight</div>
                  <div style={{fontSize: '12px', color: 'var(--text-2)'}}>Farm FARM00002 • Detected 1 day ago • Severity: Medium</div>
                </div>
                <span style={{
                  padding: '4px 12px',
                  borderRadius: '12px',
                  backgroundColor: '#fef3c7',
                  color: '#92400e',
                  fontSize: '12px',
                  fontWeight: '600'
                }}>Medium</span>
              </div>
              <div style={{
                backgroundColor: '#fff',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px'
              }}>
                <div style={{
                  backgroundColor: '#dcfce7',
                  borderRadius: '8px',
                  padding: '12px',
                  fontSize: '24px'
                }}>🌿</div>
                <div style={{flex: 1}}>
                  <div style={{fontSize: '14px', fontWeight: '600', color: 'var(--text-1)'}}>Aphids</div>
                  <div style={{fontSize: '12px', color: 'var(--text-2)'}}>Farm FARM00003 • Detected 3 days ago • Severity: Low</div>
                </div>
                <span style={{
                  padding: '4px 12px',
                  borderRadius: '12px',
                  backgroundColor: '#dcfce7',
                  color: '#16a34a',
                  fontSize: '12px',
                  fontWeight: '600'
                }}>Low</span>
              </div>
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
