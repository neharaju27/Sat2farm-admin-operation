import { useState, useEffect, useMemo } from 'react';
import { X, Lock } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function FeatureDashboard({ onClose, onFeatureSelect, farmStatus, farmCategory }) {
  const { t } = useLanguage();
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [showLockedPopup, setShowLockedPopup] = useState(false);

  // Determine feature status based on farm status
  const isFarmUnlocked = String(farmStatus).toLowerCase() === 'unlocked';
  const featureStatus = isFarmUnlocked ? t('active') : t('inactive');

  // Check if farm category is tank
  const isTankCategory = String(farmCategory || '').toLowerCase() === 'tank';
  // Check if farm category is polyhouse
  const isPolyhouseCategory = String(farmCategory || '').toLowerCase() === 'polyhouse';
  // Check if farm category is farm
  const isFarmCategory = String(farmCategory || '').toLowerCase() === 'farm';
  // Check if farm category is garden
  const isGardenCategory = String(farmCategory || '').toLowerCase() === 'garden';
  // Check if farm category is pasture
  const isPastureCategory = String(farmCategory || '').toLowerCase() === 'pasture';

  // Show locked popup when farm is locked
  useEffect(() => {
    if (!isFarmUnlocked) {
      setShowLockedPopup(true);
    }
  }, [isFarmUnlocked]);

  // Recalculate features when language changes
  const features = useMemo(() => [
    {
      id: 1,
      key: 'farmMap',
      name: t('farmMap'),
      description: t('farmMapDescription'),
      status: isFarmUnlocked,
      icon: '🗺️',
      visibleFor: ['all']
    },
    {
      id: 11,
      key: 'guideline',
      name: t('guideline'),
      description: t('guidelineDescription'),
      status: isFarmUnlocked,
      icon: '📋',
      visibleFor: ['tank']
    },
    {
      id: 2,
      key: 'weather',
      name: t('weather'),
      description: t('weatherDescription'),
      status: isFarmUnlocked,
      icon: '🌤️',
      visibleFor: ['polyhouse', 'garden', 'farm', 'tank', 'pasture']
    },
    {
      id: 12,
      key: 'ndci',
      name: t('ndci'),
      description: t('ndciDescription'),
      status: isFarmUnlocked,
      icon: '�',
      visibleFor: ['tank']
    },
    {
      id: 13,
      key: 'ndti',
      name: t('ndti'),
      description: t('ndtiDescription'),
      status: isFarmUnlocked,
      icon: '💧',
      visibleFor: ['tank']
    },
    {
      id: 14,
      key: 'timeSeries',
      name: t('timeSeries'),
      description: t('timeSeriesDescription'),
      status: isFarmUnlocked,
      icon: '📈',
      visibleFor: ['tank']
    },
    {
      id: 3,
      key: 'cropCalendar',
      name: t('cropCalendar'),
      description: t('cropCalendarDescription'),
      status: isFarmUnlocked,
      icon: '📅',
      visibleFor: ['polyhouse', 'garden', 'farm']
    },
    {
      id: 4,
      key: 'pestAndDisease',
      name: t('pestAndDisease'),
      description: t('pestAndDiseaseDescription'),
      status: isFarmUnlocked,
      icon: '🐛',
      visibleFor: ['polyhouse', 'garden', 'farm', 'pasture']
    },
    {
      id: 5,
      key: 'soilMoisture',
      name: t('soilMoisture'),
      description: t('soilMoistureDescription'),
      status: isFarmUnlocked,
      icon: '💧',
      visibleFor: ['farm', 'pasture']
    },
    {
      id: 6,
      key: 'cropHealth',
      name: t('cropHealth'),
      description: t('cropHealthDescription'),
      status: isFarmUnlocked,
      icon: '🌱',
      visibleFor: ['farm', 'pasture']
    },
    {
      id: 7,
      key: 'lswi',
      name: t('lswi'),
      description: t('lswiDescription'),
      status: isFarmUnlocked,
      icon: '💧',
      visibleFor: ['farm', 'pasture']
    },
    {
      id: 8,
      key: 'imageAdvisory',
      name: t('imageAdvisory'),
      description: t('imageAdvisoryDescription'),
      status: isFarmUnlocked,
      icon: '🖼️',
      visibleFor: ['polyhouse', 'garden', 'farm', 'pasture']
    },
    {
      id: 9,
      key: 'irrigation',
      name: t('irrigation'),
      description: t('irrigationDescription'),
      status: isFarmUnlocked,
      icon: '🚿',
      visibleFor: ['farm', 'pasture']
    },
    {
      id: 10,
      key: 'soilReport',
      name: t('soilReport'),
      description: t('soilReportDescription'),
      status: isFarmUnlocked,
      icon: '🌍',
      visibleFor: ['farm', 'pasture']
    }
  ], [t, isFarmUnlocked]);

  // Filter features based on farm category
  const visibleFeatures = features.filter(feature => {
    const visibleFor = feature.visibleFor;
    const categories = Array.isArray(visibleFor) ? visibleFor : [visibleFor];

    if (isTankCategory) {
      // For tank category, show tank-specific features and features marked as 'all'
      return categories.includes('tank') || categories.includes('all');
    } else if (isPolyhouseCategory) {
      // For polyhouse category, show polyhouse-specific features and features marked as 'all'
      return categories.includes('polyhouse') || categories.includes('all');
    } else if (isGardenCategory) {
      // For garden category, show garden-specific features and features marked as 'all'
      return categories.includes('garden') || categories.includes('all');
    } else if (isPastureCategory) {
      // For pasture category, show pasture-specific features and features marked as 'all'
      return categories.includes('pasture') || categories.includes('all');
    } else if (isFarmCategory) {
      // For farm category, show farm-specific features and features marked as 'all'
      return categories.includes('farm') || categories.includes('all');
    } else {
      // For other categories, show only features marked as 'all'
      return categories.includes('all');
    }
  });

  return (
    <div className="modal-overlay">
      <div className="modal" style={{width: '900px', maxWidth: '95vw', maxHeight: '90vh'}}>
        <div className="modal-head">
          <h3>{t('featureDashboard')}</h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>
            <X className="ic-xs" />
          </button>
        </div>
        <div className="modal-body" style={{overflowY: 'auto'}}>
          <div style={{marginBottom: '24px'}}>
            <h4 style={{fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: 'var(--text-1)'}}>
              {t('availableFeatures')}
            </h4>
            <p style={{fontSize: '14px', color: 'var(--text-2)', marginBottom: '16px'}}>
              {t('exploreManageFeatures')}
            </p>
          </div>

          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px'}}>
            {visibleFeatures.map((feature) => (
              <div
                key={feature.id}
                style={{
                  backgroundColor: '#fff',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  padding: '20px',
                  cursor: feature.status ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                  opacity: feature.status ? 1 : 0.6
                }}
                onClick={() => {
                  if (feature.status) {
                    onFeatureSelect(feature.key);
                  }
                }}
                onMouseEnter={(e) => {
                  if (feature.status) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (feature.status) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
                  }
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
                      backgroundColor: feature.status ? '#dcfce7' : '#fee2e2',
                      color: feature.status ? '#16a34a' : '#dc2626',
                      fontWeight: '500'
                    }}>
                      {feature.status ? t('active') : t('inactive')}
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
          <button className="btn btn-ghost" onClick={onClose}>{t('close')}</button>
        </div>
      </div>

      {/* Locked Farm Popup */}
      {showLockedPopup && (
        <div className="modal-overlay" style={{zIndex: 2000}}>
          <div className="modal" style={{width: '400px', maxWidth: '90vw'}}>
            <div className="modal-head">
              <h3>{t('farmLocked')}</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowLockedPopup(false)}>
                <X className="ic-xs" />
              </button>
            </div>
            <div className="modal-body">
              <div style={{padding: '20px', textAlign: 'center'}}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: '#fee2e2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px'
                }}>
                  <Lock size={32} color="#dc2626" />
                </div>
                <h4 style={{fontSize: '18px', fontWeight: '600', color: 'var(--text-1)', marginBottom: '12px'}}>
                  {t('farmIsLocked')}
                </h4>
                <p style={{fontSize: '14px', color: 'var(--text-2)', lineHeight: '1.6', marginBottom: '20px'}}>
                  {t('unlockFarmMessage')}
                </p>
                <button
                  className="btn btn-primary"
                  onClick={() => setShowLockedPopup(false)}
                  style={{width: '100%'}}
                >
                  {t('gotIt')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
