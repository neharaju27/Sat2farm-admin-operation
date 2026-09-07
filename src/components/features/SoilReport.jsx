import { useState, useEffect } from 'react';
import { X, Languages, RefreshCw, ArrowLeft, Info } from 'lucide-react';
import axios from 'axios';

export default function SoilReport({ onClose, onBack, farmId, clientId }) {
  const [pdfUrl, setPdfUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [translating, setTranslating] = useState(false);

  const languages = [
    { name: 'English', code: 'en' },
    { name: 'Hindi', code: 'hi' },
    { name: 'Marathi', code: 'mr' },
    { name: 'Telugu', code: 'te' },
    { name: 'Tamil', code: 'ta' },
    { name: 'Kannada', code: 'kn' },
    { name: 'Gujarati', code: 'gu' },
    { name: 'Bengali', code: 'bn' },
    { name: 'Punjabi', code: 'pa' },
    { name: 'Assamese', code: 'as' },
    { name: 'Odia', code: 'or' },
    { name: 'Spanish', code: 'es' },
    { name: 'French', code: 'fr' },
    { name: 'Thai', code: 'th' }
  ];

  useEffect(() => {
    if (farmId && clientId) {
      fetchSoilReport();
    } else if (farmId && !clientId) {
      setError('Report will be available soon');
    }
  }, [farmId, clientId]);

  const fetchSoilReport = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Fetch API key first using client_id
      const keyResponse = await axios.get(
        `${import.meta.env.VITE_FETCH_FARMER_KEY_API_URL}?client_id=${clientId}`
      );
      
      const apiKey = keyResponse.data.api_key;
      
      // Fetch soil report data
      const reportResponse = await axios.get(
        `${import.meta.env.VITE_SOIL_REPORT_API_URL}?farm_id=${farmId}&key=${apiKey}`
      );
      
      if (reportResponse.data.pdf) {
        setPdfUrl(reportResponse.data.pdf);
      } else {
        setError('Report will be available soon');
      }
    } catch (err) {
      console.error('Error fetching soil report:', err);
      setError('Report will be available soon');
    } finally {
      setLoading(false);
    }
  };

  const translateReport = async (langCode) => {
    setTranslating(true);
    setError('');
    setShowLanguageDropdown(false);
    
    try {
      // Fetch API key first using client_id
      const keyResponse = await axios.get(
        `${import.meta.env.VITE_FETCH_FARMER_KEY_API_URL}?client_id=${clientId}`
      );
      
      const apiKey = keyResponse.data.api_key;
      
      // Call translation API
      const translateResponse = await axios.get(
        `${import.meta.env.VITE_SOIL_REPORT_TRANSLATE_API_URL}?api_key=${apiKey}&farm_id=${farmId}&lang=${langCode}`
      );
      
      console.log('Translation API response:', translateResponse.data);
      
      if (translateResponse.data.pdf) {
        setPdfUrl(translateResponse.data.pdf);
        setSelectedLanguage(langCode);
      } else if (translateResponse.data.status === 'success' && translateResponse.data.message) {
        // Report is being generated asynchronously
        setError(translateResponse.data.message);
      } else {
        console.error('No PDF in response. Full response:', translateResponse.data);
        setError('Translation failed - no PDF returned');
      }
    } catch (err) {
      console.error('Error translating report:', err);
      setError('Failed to translate report');
    } finally {
      setTranslating(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal" style={{width: '1000px', maxWidth: '95vw', maxHeight: '90vh'}}>
        <div className="modal-head">
          <button className="btn btn-ghost btn-sm" onClick={onBack || onClose}>
            <ArrowLeft className="ic-xs" />
          </button>
          <h3>Soil Report</h3>
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
              Detailed soil analysis and nutrient recommendations for your farms
            </p>
          </div>

          <div style={{display: 'flex', gap: '12px', marginBottom: '16px'}}>
            <div style={{position: 'relative'}}>
              <button 
                className="btn btn-primary btn-sm"
                style={{display: 'flex', alignItems: 'center', gap: '8px'}}
                onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                disabled={translating}
              >
                <Languages size={16} />
                Translate
              </button>
              {showLanguageDropdown && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  backgroundColor: '#fff',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  zIndex: 100,
                  minWidth: '200px',
                  maxHeight: '300px',
                  overflowY: 'auto'
                }}>
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => translateReport(lang.code)}
                      style={{
                        width: '100%',
                        padding: '10px 16px',
                        textAlign: 'left',
                        border: 'none',
                        backgroundColor: selectedLanguage === lang.code ? '#f0f9ff' : 'transparent',
                        cursor: 'pointer',
                        fontSize: '14px',
                        color: 'var(--text-1)',
                        borderBottom: '1px solid var(--border)'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = selectedLanguage === lang.code ? '#f0f9ff' : '#f5f5f5'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = selectedLanguage === lang.code ? '#f0f9ff' : 'transparent'}
                    >
                      {lang.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button 
              className="btn btn-primary btn-sm"
              style={{display: 'flex', alignItems: 'center', gap: '8px'}}
              onClick={fetchSoilReport}
              disabled={loading || translating}
            >
              <RefreshCw size={16} />
              Regenerate
            </button>
          </div>

          {loading && (
            <div style={{textAlign: 'center', padding: '40px', color: 'var(--text-2)'}}>
              Loading soil report...
            </div>
          )}

          {translating && (
            <div style={{textAlign: 'center', padding: '40px', color: 'var(--text-2)'}}>
              Translating report...
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

          {!loading && !error && pdfUrl && (
            <div style={{
              backgroundColor: '#fff',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '20px',
              height: '70vh'
            }}>
              <iframe
                src={pdfUrl}
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none'
                }}
                title="Soil Report PDF"
              />
            </div>
          )}

          {!loading && !error && !pdfUrl && (
            <div style={{
              backgroundColor: '#fff',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '24px'
            }}>
              <div style={{textAlign: 'center', color: 'var(--text-2)', padding: '40px'}}>
                <div style={{fontSize: '48px', marginBottom: '16px'}}>📄</div>
                <div style={{fontSize: '16px', fontWeight: '600', marginBottom: '8px'}}>Soil Report PDF</div>
                <div style={{fontSize: '14px'}}>No soil report available for this farm</div>
              </div>
            </div>
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
                  Soil Health
                </h5>
                <p style={{fontSize: '14px', color: 'var(--text-1)', lineHeight: '1.6', marginBottom: '20px'}}>
                  This is generated on the date when the land was barren. The figures are based on satellite images with a spatial resolution of 10m*10m. When compared to lab tests, there may be minor differences. The reports are not to be reproduced wholly or in part and cannot be used as evidence in the court of LAW.
                </p>
                
                <h5 style={{fontSize: '18px', fontWeight: '600', color: 'var(--text-1)', marginBottom: '12px'}}>
                  Fertiliser Recommendation
                </h5>
                <p style={{fontSize: '14px', color: 'var(--text-1)', lineHeight: '1.6'}}>
                  Fertilizer recommendations are based on soil reports and general crop guidelines. However, agriculture's dynamic nature and varying conditions can affect outcomes. Users are advised to consider local factors and crop specifics before applying.
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
