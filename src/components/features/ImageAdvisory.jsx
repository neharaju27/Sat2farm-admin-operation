import { useState, useEffect } from 'react';
import { X, ArrowLeft, Info } from 'lucide-react';
import axios from 'axios';

export default function ImageAdvisory({ onClose, onBack, farmId, clientId }) {
  const [advisoryData, setAdvisoryData] = useState(null);
  const [imageData, setImageData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  useEffect(() => {
    if (farmId && clientId) {
      fetchAdvisoryData();
    } else if (farmId && !clientId) {
      setError('Report will be available soon');
    }
  }, [farmId, clientId]);

  const fetchAdvisoryData = async () => {
    setLoading(true);
    setError(null);
    try {
      const keyResponse = await axios.get(import.meta.env.VITE_FETCH_FARMER_KEY_API_URL, {
        params: { client_id: clientId }
      });
      const apiKey = keyResponse.data.api_key;

      // Fetch advisory details
      const advisoryResponse = await axios.get(import.meta.env.VITE_IMAGE_ADVISORY_API_URL, {
        params: { key: apiKey, farm_id: farmId }
      });

      const advisory = advisoryResponse.data;
      const hasAdvisory = Array.isArray(advisory) && advisory.length > 0;
      if (hasAdvisory) {
        setAdvisoryData(advisory[0]);
      }

      // Fetch image URL
      const imageResponse = await axios.get(import.meta.env.VITE_RETRIEVE_IMAGE_API_URL, {
        params: { farm_id: farmId, key: apiKey }
      });

      const image = imageResponse.data;
      const hasImage = Array.isArray(image) && image.length > 0;
      if (hasImage) {
        setImageData(image[0]);
      }

      // If no data is available, set error message
      if (!hasAdvisory && !hasImage) {
        setError('Report will be available soon');
      }
    } catch (err) {
      setError('Report will be available soon');
      console.error('Error fetching advisory data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal" style={{width: '900px', maxWidth: '95vw', maxHeight: '90vh'}}>
        <div className="modal-head">
          <button className="btn btn-ghost btn-sm" onClick={onBack || onClose}>
            <ArrowLeft className="ic-xs" />
          </button>
          <h3>Image Advisory</h3>
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
              Loading image advisory data...
            </div>
          ) : error ? (
            <div style={{textAlign: 'center', padding: '40px', color: '#ef4444'}}>
              {error}
            </div>
          ) : (
            <>
              {/* PNG Image Section */}
              <div style={{
                backgroundColor: '#fff',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '24px'
              }}>
                <h5 style={{fontSize: '16px', fontWeight: '600', color: 'var(--text-1)', marginBottom: '12px'}}>
                  Advisory Image
                </h5>
                {imageData && imageData.Image_URL ? (
                  <img 
                    src={imageData.Image_URL} 
                    alt="Advisory Image" 
                    style={{
                      width: '100%',
                      height: 'auto',
                      maxHeight: '400px',
                      objectFit: 'contain',
                      borderRadius: '8px',
                      backgroundColor: '#f1f5f9'
                    }}
                  />
                ) : (
                  <div style={{
                    width: '100%',
                    height: '300px',
                    backgroundColor: '#f1f5f9',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px dashed #cbd5e1'
                  }}>
                    <div style={{textAlign: 'center', color: '#64748b'}}>
                      <div style={{fontSize: '14px'}}>No image available</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Image Details Section */}
              <div style={{
                backgroundColor: '#fff',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '20px'
              }}>
                <h5 style={{fontSize: '16px', fontWeight: '600', color: 'var(--text-1)', marginBottom: '16px'}}>
                  Advisory Details
                </h5>
                {advisoryData ? (
                  <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px'}}>
                    {advisoryData.crop_name && (
                      <div>
                        <div style={{fontSize: '12px', color: 'var(--text-2)', marginBottom: '4px'}}>Crop Name</div>
                        <div style={{fontSize: '14px', fontWeight: '500', color: 'var(--text-1)'}}>
                          {advisoryData.crop_name}
                        </div>
                      </div>
                    )}
                    {advisoryData.disease_name && (
                      <div>
                        <div style={{fontSize: '12px', color: 'var(--text-2)', marginBottom: '4px'}}>Disease Name</div>
                        <div style={{fontSize: '14px', fontWeight: '500', color: 'var(--text-1)'}}>
                          {advisoryData.disease_name}
                        </div>
                      </div>
                    )}
                    {advisoryData.pest_name && (
                      <div>
                        <div style={{fontSize: '12px', color: 'var(--text-2)', marginBottom: '4px'}}>Pest Name</div>
                        <div style={{fontSize: '14px', fontWeight: '500', color: 'var(--text-1)'}}>
                          {advisoryData.pest_name}
                        </div>
                      </div>
                    )}
                    {advisoryData.nutrient_deficiency && (
                      <div>
                        <div style={{fontSize: '12px', color: 'var(--text-2)', marginBottom: '4px'}}>Nutrient Deficiency</div>
                        <div style={{fontSize: '14px', fontWeight: '500', color: 'var(--text-1)'}}>
                          {advisoryData.nutrient_deficiency}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{textAlign: 'center', color: '#64748b', padding: '20px'}}>
                    No advisory details available
                  </div>
                )}

                {/* Solution Section */}
                {advisoryData && (advisoryData.disease_solution || advisoryData.pest_solution || advisoryData.nutrient_management) && (
                  <div style={{marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--border)'}}>
                    <h5 style={{fontSize: '16px', fontWeight: '600', color: 'var(--text-1)', marginBottom: '12px'}}>
                      Solution / Management
                    </h5>
                    <div style={{fontSize: '14px', color: 'var(--text-1)', lineHeight: '1.6'}}>
                      {advisoryData.disease_solution && (
                        <div style={{marginBottom: '12px'}}>
                          <strong>Disease Solution:</strong> {advisoryData.disease_solution}
                        </div>
                      )}
                      {advisoryData.pest_solution && (
                        <div style={{marginBottom: '12px'}}>
                          <strong>Pest Solution:</strong> {advisoryData.pest_solution}
                        </div>
                      )}
                      {advisoryData.nutrient_management && (
                        <div style={{marginBottom: '12px'}}>
                          <strong>Nutrient Management:</strong> {advisoryData.nutrient_management}
                        </div>
                      )}
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
              <div style={{padding: '20px', fontSize: '14px', lineHeight: '1.6', color: 'var(--text-1)'}}>
                <p style={{marginBottom: '12px'}}>
                  This image advisory is generated using satellite imagery and AI analysis. The information provided is for reference purposes only and should not be considered as professional agricultural advice.
                </p>
                <p style={{marginBottom: '12px'}}>
                  Farmers should consult with local agricultural experts or extension services before making any decisions based on this advisory.
                </p>
                <p>
                  The accuracy of the advisory may vary based on weather conditions, image quality, and other factors beyond our control.
                </p>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-primary" onClick={() => setShowDisclaimer(false)}>
                I Understand
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}