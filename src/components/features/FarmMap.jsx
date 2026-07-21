import { X } from 'lucide-react';

export default function FarmMap({ onClose }) {
  return (
    <div className="modal-overlay">
      <div className="modal" style={{width: '1000px', maxWidth: '95vw', maxHeight: '90vh'}}>
        <div className="modal-head">
          <h3>Farm Map</h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>
            <X className="ic-xs" />
          </button>
        </div>
        <div className="modal-body" style={{overflowY: 'auto'}}>
          <div style={{marginBottom: '24px'}}>
            <p style={{fontSize: '14px', color: 'var(--text-2)', marginBottom: '16px'}}>
              Interactive map view of all your farms with boundaries and locations
            </p>
          </div>

          <div style={{
            backgroundColor: '#f8f7f4',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '24px',
            minHeight: '400px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column'
          }}>
            <div style={{fontSize: '64px', marginBottom: '16px'}}>🗺️</div>
            <h4 style={{fontSize: '18px', fontWeight: '600', color: 'var(--text-1)', marginBottom: '8px'}}>
              Farm Map View
            </h4>
            <p style={{fontSize: '14px', color: 'var(--text-2)', textAlign: 'center', maxWidth: '400px'}}>
              Interactive map showing all farm boundaries and locations will be displayed here.
            </p>
            <div style={{marginTop: '24px', display: 'flex', gap: '12px'}}>
              <button className="btn btn-primary">Load Map</button>
              <button className="btn btn-ghost">Refresh</button>
            </div>
          </div>

          <div style={{marginTop: '24px'}}>
            <h5 style={{fontSize: '16px', fontWeight: '600', color: 'var(--text-1)', marginBottom: '12px'}}>
              Farm Locations
            </h5>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '12px'}}>
              <div style={{
                backgroundColor: '#fff',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '16px'
              }}>
                <div style={{fontSize: '12px', color: 'var(--text-2)', marginBottom: '4px'}}>Farm ID</div>
                <div style={{fontSize: '14px', fontWeight: '600', color: 'var(--text-1)'}}>FARM00001</div>
                <div style={{fontSize: '12px', color: 'var(--text-2)', marginTop: '8px', marginBottom: '4px'}}>Location</div>
                <div style={{fontSize: '14px', color: 'var(--text-1)'}}>Karnataka</div>
              </div>
              <div style={{
                backgroundColor: '#fff',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '16px'
              }}>
                <div style={{fontSize: '12px', color: 'var(--text-2)', marginBottom: '4px'}}>Farm ID</div>
                <div style={{fontSize: '14px', fontWeight: '600', color: 'var(--text-1)'}}>FARM00002</div>
                <div style={{fontSize: '12px', color: 'var(--text-2)', marginTop: '8px', marginBottom: '4px'}}>Location</div>
                <div style={{fontSize: '14px', color: 'var(--text-1)'}}>Tamil Nadu</div>
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
