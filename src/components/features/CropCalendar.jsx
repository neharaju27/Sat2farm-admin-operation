import { X } from 'lucide-react';

export default function CropCalendar({ onClose }) {
  return (
    <div className="modal-overlay">
      <div className="modal" style={{width: '1000px', maxWidth: '95vw', maxHeight: '90vh'}}>
        <div className="modal-head">
          <h3>Crop Calendar</h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>
            <X className="ic-xs" />
          </button>
        </div>
        <div className="modal-body" style={{overflowY: 'auto'}}>
          <div style={{marginBottom: '24px'}}>
            <p style={{fontSize: '14px', color: 'var(--text-2)', marginBottom: '16px'}}>
              Crop scheduling and planting calendar for optimal growth cycles
            </p>
          </div>

          <div style={{
            backgroundColor: '#fef3c7',
            border: '1px solid #fcd34d',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '24px'
          }}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <div>
                <h4 style={{fontSize: '18px', fontWeight: '600', color: '#92400e', marginBottom: '4px'}}>
                  Current Season: Kharif
                </h4>
                <p style={{fontSize: '14px', color: '#92400e'}}>June - September 2026</p>
              </div>
              <div style={{fontSize: '48px'}}>📅</div>
            </div>
          </div>

          <div style={{marginBottom: '24px'}}>
            <h5 style={{fontSize: '16px', fontWeight: '600', color: 'var(--text-1)', marginBottom: '12px'}}>
              Upcoming Activities
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
                  backgroundColor: '#dcfce7',
                  borderRadius: '8px',
                  padding: '12px',
                  fontSize: '24px'
                }}>🌱</div>
                <div style={{flex: 1}}>
                  <div style={{fontSize: '14px', fontWeight: '600', color: 'var(--text-1)'}}>Sowing - Rice</div>
                  <div style={{fontSize: '12px', color: 'var(--text-2)'}}>Farm FARM00001 • Due in 5 days</div>
                </div>
                <button className="btn btn-primary btn-sm">Schedule</button>
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
                  backgroundColor: '#dbeafe',
                  borderRadius: '8px',
                  padding: '12px',
                  fontSize: '24px'
                }}>💧</div>
                <div style={{flex: 1}}>
                  <div style={{fontSize: '14px', fontWeight: '600', color: 'var(--text-1)'}}>Irrigation - Cotton</div>
                  <div style={{fontSize: '12px', color: 'var(--text-2)'}}>Farm FARM00002 • Due in 3 days</div>
                </div>
                <button className="btn btn-primary btn-sm">Schedule</button>
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
                  backgroundColor: '#fce7f3',
                  borderRadius: '8px',
                  padding: '12px',
                  fontSize: '24px'
                }}>🌾</div>
                <div style={{flex: 1}}>
                  <div style={{fontSize: '14px', fontWeight: '600', color: 'var(--text-1)'}}>Harvesting - Wheat</div>
                  <div style={{fontSize: '12px', color: 'var(--text-2)'}}>Farm FARM00003 • Due in 12 days</div>
                </div>
                <button className="btn btn-primary btn-sm">Schedule</button>
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
