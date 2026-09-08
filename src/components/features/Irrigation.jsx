import { useState, useEffect } from 'react';
import { X, ArrowLeft, Info } from 'lucide-react';
import axios from 'axios';

export default function Irrigation({ onClose, onBack, farmId, clientId }) {
  const [irrigationData, setIrrigationData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [remarks, setRemarks] = useState('');
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  useEffect(() => {
    if (farmId && clientId) {
      fetchIrrigationData();
    } else if (farmId && !clientId) {
      setError('Report will be available soon');
    }
  }, [farmId, clientId]);

  const fetchIrrigationData = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Fetch API key first using client_id
      const keyResponse = await axios.get(
        `${import.meta.env.VITE_FETCH_FARMER_KEY_API_URL}?client_id=${clientId}`
      );
      
      const apiKey = keyResponse.data.api_key;
      
      // Fetch irrigation data URL
      const irrigationResponse = await axios.get(
        `${import.meta.env.VITE_IRRIGATION_DATA_API_URL}?farm_id=${farmId}&key=${apiKey}`
      );
      
      if (irrigationResponse.data.status === 'success' && irrigationResponse.data.Irrigation_data) {
        // Fetch actual data from S3 URL
        const s3Response = await axios.get(irrigationResponse.data.Irrigation_data);
        const data = s3Response.data;
        
        setRemarks(data.Remarks || '');
        
        // Convert data to table format
        const tableData = [];
        Object.keys(data).forEach(date => {
          if (date !== 'Remarks') {
            const dateData = data[date];
            Object.keys(dateData).forEach(type => {
              tableData.push({
                date,
                type,
                grossIrrigation: dateData[type].Gross_Irrig,
                irrigationFrequency: dateData[type].Irrig_freq
              });
            });
          }
        });
        
        setIrrigationData(tableData);
      } else {
        setError('Report will be available soon');
      }
    } catch (err) {
      console.error('Error fetching irrigation data:', err);
      setError('Report will be available soon');
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
          <h3>Irrigation</h3>
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
          <div style={{marginBottom: '24px'}}>
            <p style={{fontSize: '14px', color: 'var(--text-2)', marginBottom: '16px'}}>
              Smart irrigation recommendations based on crop needs and weather
            </p>
          </div>

          {loading && (
            <div style={{textAlign: 'center', padding: '40px', color: 'var(--text-2)'}}>
              Loading irrigation data...
            </div>
          )}

          {error && (
            <div style={{
              backgroundColor: '#fee2e2',
              border: '1px solid #fca5a5',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '16px',
              color: '#dc2626'
            }}>
              {error}
            </div>
          )}

          {!loading && !error && (
            <>
              {remarks && (
                <div style={{
                  backgroundColor: '#fef3c7',
                  border: '1px solid #fcd34d',
                  borderRadius: '8px',
                  padding: '16px',
                  marginBottom: '16px',
                  color: '#92400e',
                  fontSize: '14px'
                }}>
                  <strong>Remarks:</strong> {remarks}
                </div>
              )}

              <div style={{
                backgroundColor: '#fff',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '20px'
              }}>
                {irrigationData.length > 0 ? (
                  <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    marginBottom: '16px'
                  }}>
                    <thead>
                      <tr style={{borderBottom: '2px solid var(--border)'}}>
                        <th style={{
                          padding: '12px',
                          textAlign: 'left',
                          fontSize: '14px',
                          fontWeight: '600',
                          color: 'var(--text-1)',
                          backgroundColor: '#f8fafc'
                        }}>Date</th>
                        <th style={{
                          padding: '12px',
                          textAlign: 'left',
                          fontSize: '14px',
                          fontWeight: '600',
                          color: 'var(--text-1)',
                          backgroundColor: '#f8fafc'
                        }}>Type</th>
                        <th style={{
                          padding: '12px',
                          textAlign: 'left',
                          fontSize: '14px',
                          fontWeight: '600',
                          color: 'var(--text-1)',
                          backgroundColor: '#f8fafc'
                        }}>Gross Irrigation (mm)</th>
                        <th style={{
                          padding: '12px',
                          textAlign: 'left',
                          fontSize: '14px',
                          fontWeight: '600',
                          color: 'var(--text-1)',
                          backgroundColor: '#f8fafc'
                        }}>Irrigation Frequency (days)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {irrigationData.map((row, index) => (
                        <tr key={index} style={{borderBottom: '1px solid var(--border)'}}>
                          <td style={{
                            padding: '12px',
                            fontSize: '14px',
                            color: 'var(--text-1)'
                          }}>{row.date}</td>
                          <td style={{
                            padding: '12px',
                            fontSize: '14px',
                            color: 'var(--text-1)',
                            fontWeight: '500'
                          }}>{row.type}</td>
                          <td style={{
                            padding: '12px',
                            fontSize: '14px',
                            color: 'var(--text-1)'
                          }}>{row.grossIrrigation}</td>
                          <td style={{
                            padding: '12px',
                            fontSize: '14px',
                            color: 'var(--text-1)'
                          }}>{row.irrigationFrequency}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div style={{textAlign: 'center', padding: '40px', color: 'var(--text-2)'}}>
                    No irrigation data available
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
                <h5 style={{fontSize: '18px', fontWeight: '600', color: 'var(--text-1)', marginBottom: '12px'}}>
                  Irrigation Advisory
                </h5>
                <p style={{fontSize: '14px', color: 'var(--text-1)', lineHeight: '1.6', marginBottom: '20px'}}>
                  The provided irrigation schedule serves as a general guideline, and adjustments should be made based on current weather conditions and the occurrence of rainfall.
                </p>
                
                <h5 style={{fontSize: '18px', fontWeight: '600', color: 'var(--text-1)', marginBottom: '12px'}}>
                  Interpretation of mm and freq.
                </h5>
                <p style={{fontSize: '14px', color: 'var(--text-1)', lineHeight: '1.6'}}>
                  Irrigation in 'mm' is the depth of water during irrigation. If yield (litre per second) of irrigation is available, it can be used to compute the irrigation time. For details, you can reach out to us through WhatsApp at
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
    </div>
  );
}
