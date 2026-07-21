import { useState } from 'react';
import { X } from 'lucide-react';

export default function FeatureDashboard({ onClose, onFeatureSelect }) {
  const [selectedFeature, setSelectedFeature] = useState(null);

  const features = [
    {
      id: 1,
      name: 'Farm Map',
      description: 'Interactive map view of all your farms with boundaries and locations',
      status: 'Active',
      icon: '�️'
    },
    {
      id: 2,
      name: 'Weather',
      description: 'Real-time weather data and forecasts for your farm locations',
      status: 'Active',
      icon: '🌤️'
    },
    {
      id: 3,
      name: 'Crop Calendar',
      description: 'Crop scheduling and planting calendar for optimal growth cycles',
      status: 'Active',
      icon: '📅'
    },
    {
      id: 4,
      name: 'Pest and Disease',
      description: 'Pest detection and disease monitoring for crop protection',
      status: 'Active',
      icon: '🐛'
    },
    {
      id: 5,
      name: 'Soil Moisture',
      description: 'Soil moisture levels and irrigation recommendations',
      status: 'Active',
      icon: '�'
    },
    {
      id: 6,
      name: 'Crop Health',
      description: 'Crop health monitoring and growth analysis',
      status: 'Active',
      icon: '🌱'
    },
    {
      id: 7,
      name: 'LSWI',
      description: 'Land Surface Water Index for vegetation water content analysis',
      status: 'Active',
      icon: '�'
    }
  ];

  return (
    <div className="modal-overlay">
      <div className="modal" style={{width: '900px', maxWidth: '95vw', maxHeight: '90vh'}}>
        <div className="modal-head">
          <h3>Feature Dashboard</h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>
            <X className="ic-xs" />
          </button>
        </div>
        <div className="modal-body" style={{overflowY: 'auto'}}>
          <div style={{marginBottom: '24px'}}>
            <h4 style={{fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: 'var(--text-1)'}}>
              Available Features
            </h4>
            <p style={{fontSize: '14px', color: 'var(--text-2)', marginBottom: '16px'}}>
              Explore and manage available features for your farms
            </p>
          </div>

          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px'}}>
            {features.map((feature) => (
              <div
                key={feature.id}
                style={{
                  backgroundColor: '#fff',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  padding: '20px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}
                onClick={() => onFeatureSelect(feature)}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
                }}
              >
                <div style={{display: 'flex', alignItems: 'center', marginBottom: '12px'}}>
                  <div style={{
                    fontSize: '32px',
                    marginRight: '12px'
                  }}>
                    {feature.icon}
                  </div>
                  <div style={{flex: 1}}>
                    <h5 style={{fontSize: '16px', fontWeight: '600', color: 'var(--text-1)', marginBottom: '4px'}}>
                      {feature.name}
                    </h5>
                    <span style={{
                      fontSize: '12px',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      backgroundColor: feature.status === 'Active' ? '#dcfce7' : '#f1f5f9',
                      color: feature.status === 'Active' ? '#16a34a' : '#64748b',
                      fontWeight: '500'
                    }}>
                      {feature.status}
                    </span>
                  </div>
                </div>
                <p style={{fontSize: '13px', color: 'var(--text-2)', lineHeight: '1.5'}}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
