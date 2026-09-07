import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Info, ArrowLeft } from 'lucide-react';
import axios from 'axios';

export default function CropCalendar({ onClose, onBack, farmId, clientId }) {
  const [currentDay, setCurrentDay] = useState(60);
  const [farmData, setFarmData] = useState(null);
  const [calendarData, setCalendarData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [beforeTransplantationData, setBeforeTransplantationData] = useState(null);
  const [showBeforeTransplantationModal, setShowBeforeTransplantationModal] = useState(false);

  useEffect(() => {
    if (farmId && clientId) {
      fetchFarmDetails();
    } else if (farmId && !clientId) {
      setError('Report will be available soon');
    }
  }, [farmId, clientId]);

  useEffect(() => {
    if (farmData) {
      // Calculate days since sowing
      const sowingDate = new Date(farmData.Sowing_date);
      const today = new Date();
      const diffDays = Math.floor((today - sowingDate) / (1000 * 60 * 60 * 24));
      const daysSinceSowing = isNaN(diffDays) ? 0 : diffDays;
      const dayToUse = daysSinceSowing > 0 ? daysSinceSowing : 0;

      console.log('Sowing Date from API:', farmData.Sowing_date);
      console.log('Days since sowing calculated:', daysSinceSowing);
      console.log('Day to use for API:', dayToUse);

      setCurrentDay(dayToUse);
      // Pass the freshly-computed day directly instead of relying on
      // currentDay state (state updates aren't immediate, so calling
      // fetchCropCalendar() with no arg here could use a stale value)
      fetchCropCalendar(dayToUse);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [farmData]);

  const fetchFarmDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const keyResponse = await axios.get(import.meta.env.VITE_FETCH_FARMER_KEY_API_URL, {
        params: { client_id: clientId }
      });
      const apiKey = keyResponse.data.api_key;

      const response = await axios.get(import.meta.env.VITE_SHOW_FARM_DETAILS_API_URL, {
        params: { api_key: apiKey, farm_id: farmId }
      });

      console.log('FARM DETAILS RAW:', response.data);

      const rawData = response.data.data;
      const farm = Array.isArray(rawData) ? rawData[0] : rawData;

      // Normalize field names - different endpoints use different casing/keys
      const cropType =
        farm.crop_type || farm.crop || farm.Crop_type || farm.croptype || '';
      const sowingDateRaw =
        farm.Sowing_date || farm.sowing_date || farm.sowingdate || farm.SowingDate || '';

      setFarmData({ ...farm, crop_type: cropType, Sowing_date: sowingDateRaw });
    } catch (err) {
      setError('Report will be available soon');
    } finally {
      setLoading(false);
    }
  };

  const fetchCropCalendar = async (dayOverride = null) => {
    if (!farmData) return;

    const dayToUse = dayOverride !== null ? dayOverride : currentDay;

    setLoading(true);
    setError(null);
    try {
      const keyResponse = await axios.get(import.meta.env.VITE_FETCH_FARMER_KEY_API_URL, {
        params: { client_id: clientId }
      });
      const apiKey = keyResponse.data.api_key;

      const response = await axios.get(import.meta.env.VITE_CROP_CALENDAR_API_URL, {
        params: {
          key: apiKey,
          farm_id: farmId,
          sowing_date: dayToUse,
          crop: farmData.crop_type,
          lang: 'en'
        }
      });

      console.log('CROP CALENDAR RAW:', response.data);

      setCalendarData(response.data.data || response.data);
    } catch (err) {
      setError('Report will be available soon');
    } finally {
      setLoading(false);
    }
  };

  const handleRangeChange = (direction) => {
    if (!calendarData || calendarData.length === 0) return;

    const currentRange = calendarData[0].Range;
    const rangeParts = currentRange.split('-').map(Number);

    let targetDay;
    if (rangeParts.length === 1) {
      // Single value range (e.g., "0")
      const day = rangeParts[0];
      if (direction === 'previous') {
        targetDay = 0; // Stay at 0
      } else if (direction === 'next') {
        targetDay = 1; // Move to day 1
      }
    } else {
      // Range (e.g., "41-55")
      const [min, max] = rangeParts;
      if (direction === 'previous') {
        targetDay = min - 1;
        if (targetDay < 0) {
          targetDay = 0;
        }
      } else if (direction === 'next') {
        targetDay = max + 1;
      }
    }

    setCurrentDay(targetDay);
    fetchCropCalendar(targetDay);
  };

  const handleToday = () => {
    if (farmData) {
      const sowingDate = new Date(farmData.Sowing_date);
      const today = new Date();
      const diffDays = Math.floor((today - sowingDate) / (1000 * 60 * 60 * 24));
      const daysSinceSowing = isNaN(diffDays) ? 0 : diffDays;
      const dayToUse = daysSinceSowing > 0 ? daysSinceSowing : 0;

      setCurrentDay(dayToUse);
      fetchCropCalendar(dayToUse);
    }
  };

  const handleBeforeTransplantation = async () => {
    if (!farmData) return;

    setLoading(true);
    try {
      const keyResponse = await axios.get(import.meta.env.VITE_FETCH_FARMER_KEY_API_URL, {
        params: { client_id: clientId }
      });
      const apiKey = keyResponse.data.api_key;

      const response = await axios.get(import.meta.env.VITE_CROP_CALENDAR_API_URL, {
        params: {
          key: apiKey,
          farm_id: farmId,
          sowing_date: 0,
          crop: farmData.crop_type,
          lang: 'en'
        }
      });

      console.log('BEFORE TRANSPLANTATION RAW:', response.data);
      setBeforeTransplantationData(response.data.data || response.data);
      setShowBeforeTransplantationModal(true);
    } catch (err) {
      console.error('Failed to fetch before transplantation data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal" style={{width: '1000px', maxWidth: '95vw', maxHeight: '90vh'}}>
        <div className="modal-head">
          <button className="btn btn-ghost btn-sm" onClick={onBack || onClose}>
            <ArrowLeft className="ic-xs" />
          </button>
          <h3>Crop Calendar</h3>
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
              Loading crop calendar...
            </div>
          ) : error ? (
            <div style={{textAlign: 'center', padding: '40px', color: '#ef4444'}}>
              {error}
            </div>
          ) : (
            <>
              <div style={{marginBottom: '16px'}}>
                <button
                  onClick={handleBeforeTransplantation}
                  className="btn btn-primary btn-sm"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  Before Transplantation
                  <Info size={16} />
                </button>
              </div>

              <div style={{
                backgroundColor: '#f1f5f9',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                padding: '24px'
              }}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
                  <button 
                    onClick={() => handleRangeChange('previous')}
                    className="btn btn-ghost btn-sm"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <ChevronLeft size={16} />
                    Previous
                  </button>
                  <button 
                    onClick={handleToday}
                    className="btn btn-primary btn-sm"
                  >
                    Today
                  </button>
                  <button 
                    onClick={() => handleRangeChange('next')}
                    className="btn btn-ghost btn-sm"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    Next
                    <ChevronRight size={16} />
                  </button>
                </div>

                <div style={{marginBottom: '16px'}}>
                  {farmData && (
                    <div style={{
                      fontSize: '14px',
                      color: 'var(--text-2)',
                      marginBottom: '4px'
                    }}>
                      Crop: {farmData.crop_type}
                    </div>
                  )}
                  {farmData && (
                    <div style={{
                      fontSize: '14px',
                      color: 'var(--text-2)'
                    }}>
                      Sowing Date: {farmData.Sowing_date}
                    </div>
                  )}
                </div>

                {calendarData && calendarData.length > 0 && (
                  <div style={{
                    backgroundColor: '#fff',
                    borderRadius: '12px',
                    padding: '20px',
                    border: '1px solid var(--border)'
                  }}>
                    <h5 style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: 'var(--text-1)',
                      marginBottom: '12px'
                    }}>
                      ({calendarData[0].Range}) days of sowing
                    </h5>
                    <div style={{
                      fontSize: '14px',
                      color: 'var(--text-2)',
                      lineHeight: '1.6',
                      whiteSpace: 'pre-line'
                    }}>
                      {calendarData[0].Recommended}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
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
                  Crop Calendar
                </h5>
                <p style={{fontSize: '14px', color: 'var(--text-1)', lineHeight: '1.6'}}>
                  The packages of practices offered are derived from reputable government research institutes. The variations in these practices are contingent upon the agroclimatic zones within each particular region.
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

      {/* Before Transplantation Modal */}
      {showBeforeTransplantationModal && (
        <div className="modal-overlay" style={{zIndex: 2000}}>
          <div className="modal" style={{width: '800px', maxWidth: '95vw', maxHeight: '90vh'}}>
            <div className="modal-head">
              <h3>Before Transplantation</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowBeforeTransplantationModal(false)}>
                <X className="ic-xs" />
              </button>
            </div>
            <div className="modal-body" style={{overflowY: 'auto'}}>
              {beforeTransplantationData && beforeTransplantationData.length > 0 ? (
                <div style={{padding: '20px'}}>
                  {beforeTransplantationData.map((item, index) => (
                    <div key={index} style={{
                      marginBottom: index < beforeTransplantationData.length - 1 ? '20px' : '0',
                      paddingBottom: index < beforeTransplantationData.length - 1 ? '20px' : '0',
                      borderBottom: index < beforeTransplantationData.length - 1 ? '1px solid #e2e8f0' : 'none'
                    }}>
                      <div style={{
                        fontSize: '14px',
                        color: 'var(--text-2)',
                        lineHeight: '1.6',
                        whiteSpace: 'pre-line'
                      }}>
                        {item.Recommended}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{padding: '20px', textAlign: 'center', color: 'var(--text-2)'}}>
                  No before transplantation information available
                </div>
              )}
            </div>
            <div className="modal-actions">
              <button className="btn btn-primary" onClick={() => setShowBeforeTransplantationModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}