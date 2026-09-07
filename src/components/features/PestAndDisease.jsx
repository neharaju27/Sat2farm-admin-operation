import { useState, useEffect } from 'react';
import { X, ArrowLeft, Info } from 'lucide-react';
import axios from 'axios';

export default function PestAndDisease({ onClose, onBack, farmId, clientId }) {
  const [activeTab, setActiveTab] = useState('pest');
  const [pests, setPests] = useState([]);
  const [diseases, setDiseases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  useEffect(() => {
    if (farmId && clientId) {
      fetchPestDiseaseData();
    } else if (farmId && !clientId) {
      setError('Report will be available soon');
    }
  }, [farmId, clientId]);

  const fetchPestDiseaseData = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Fetch API key first using client_id
      const keyResponse = await axios.get(
        `${import.meta.env.VITE_FETCH_FARMER_KEY_API_URL}?client_id=${clientId}`
      );
      
      const apiKey = keyResponse.data.api_key;
      
      // Fetch pest/disease data
      const response = await axios.get(
        `${import.meta.env.VITE_PEST_DISEASE_API_URL}?farm_id=${farmId}&key=${apiKey}&ln=en`
      );
      
      const data = response.data;
      
      // Separate pests and diseases
      const pestList = data.filter(item => item.Pest);
      const diseaseList = data.filter(item => item.Disease);
      
      setPests(pestList);
      setDiseases(diseaseList);
    } catch (err) {
      console.error('Error fetching pest/disease data:', err);
      setError('Report will be available soon');
    } finally {
      setLoading(false);
    }
  };

  const renderPestCard = (pest, index) => (
    <div key={index} style={{
      backgroundColor: '#fff',
      border: '1px solid var(--border)',
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '16px'
    }}>
      <div style={{marginBottom: '12px'}}>
        <span style={{fontSize: '13px', color: 'var(--text-2)', fontWeight: '500'}}>Date: </span>
        <span style={{fontSize: '13px', color: 'var(--text-1)'}}>{pest.Date}</span>
      </div>
      
      <div style={{marginBottom: '12px'}}>
        <span style={{fontSize: '13px', color: 'var(--text-2)', fontWeight: '500'}}>Crop Name: </span>
        <span style={{fontSize: '13px', color: 'var(--text-1)'}}>{pest.Crop_name}</span>
      </div>
      
      <div style={{marginBottom: '12px'}}>
        <span style={{fontSize: '13px', color: 'var(--text-2)', fontWeight: '500'}}>Pest Name: </span>
        <span style={{fontSize: '13px', color: 'var(--text-1)', fontWeight: '600'}}>{pest.Pest}</span>
      </div>
      
      <div style={{marginBottom: '12px'}}>
        <span style={{fontSize: '13px', color: 'var(--text-2)', fontWeight: '500'}}>Symptoms: </span>
        <span style={{fontSize: '13px', color: 'var(--text-1)'}}>{pest.Symptoms}</span>
      </div>
      
      <div style={{marginBottom: '12px'}}>
        <span style={{fontSize: '13px', color: 'var(--text-2)', fontWeight: '500'}}>Affected Part: </span>
        <span style={{fontSize: '13px', color: 'var(--text-1)'}}>{pest.Affected_Part}</span>
      </div>
      
      <div style={{marginBottom: '12px'}}>
        <span style={{fontSize: '13px', color: 'var(--text-2)', fontWeight: '500'}}>Mode of Spread: </span>
        <span style={{fontSize: '13px', color: 'var(--text-1)'}}>{pest.Mode_of_Spread}</span>
      </div>
      
      <div style={{marginBottom: '12px'}}>
        <span style={{fontSize: '13px', color: 'var(--text-2)', fontWeight: '500'}}>Pathogen: </span>
        <span style={{fontSize: '13px', color: 'var(--text-1)'}}>{pest.Pathogen}</span>
      </div>
      
      <div style={{marginBottom: '12px'}}>
        <span style={{fontSize: '13px', color: 'var(--text-2)', fontWeight: '500'}}>Stage of Infection: </span>
        <span style={{fontSize: '13px', color: 'var(--text-1)'}}>{pest.Stage_of_Infection}</span>
      </div>
      
      <div style={{marginBottom: '8px'}}>
        <span style={{fontSize: '13px', color: 'var(--text-2)', fontWeight: '500'}}>Solution: </span>
        <span style={{fontSize: '13px', color: 'var(--text-1)'}}>{pest.Solution}</span>
      </div>
    </div>
  );

  const renderDiseaseCard = (disease, index) => (
    <div key={index} style={{
      backgroundColor: '#fff',
      border: '1px solid var(--border)',
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '16px'
    }}>
      <div style={{marginBottom: '12px'}}>
        <span style={{fontSize: '13px', color: 'var(--text-2)', fontWeight: '500'}}>Date: </span>
        <span style={{fontSize: '13px', color: 'var(--text-1)'}}>{disease.Date}</span>
      </div>
      
      <div style={{marginBottom: '12px'}}>
        <span style={{fontSize: '13px', color: 'var(--text-2)', fontWeight: '500'}}>Crop Name: </span>
        <span style={{fontSize: '13px', color: 'var(--text-1)'}}>{disease.Crop_name}</span>
      </div>
      
      <div style={{marginBottom: '12px'}}>
        <span style={{fontSize: '13px', color: 'var(--text-2)', fontWeight: '500'}}>Disease Name: </span>
        <span style={{fontSize: '13px', color: 'var(--text-1)', fontWeight: '600'}}>{disease.Disease}</span>
      </div>
      
      <div style={{marginBottom: '12px'}}>
        <span style={{fontSize: '13px', color: 'var(--text-2)', fontWeight: '500'}}>Symptoms: </span>
        <span style={{fontSize: '13px', color: 'var(--text-1)'}}>{disease.Symptoms}</span>
      </div>
      
      <div style={{marginBottom: '12px'}}>
        <span style={{fontSize: '13px', color: 'var(--text-2)', fontWeight: '500'}}>Affected Part: </span>
        <span style={{fontSize: '13px', color: 'var(--text-1)'}}>{disease.Affected_Part}</span>
      </div>
      
      <div style={{marginBottom: '12px'}}>
        <span style={{fontSize: '13px', color: 'var(--text-2)', fontWeight: '500'}}>Mode of Spread: </span>
        <span style={{fontSize: '13px', color: 'var(--text-1)'}}>{disease.Mode_of_Spread}</span>
      </div>
      
      <div style={{marginBottom: '12px'}}>
        <span style={{fontSize: '13px', color: 'var(--text-2)', fontWeight: '500'}}>Pathogen: </span>
        <span style={{fontSize: '13px', color: 'var(--text-1)'}}>{disease.Pathogen}</span>
      </div>
      
      <div style={{marginBottom: '12px'}}>
        <span style={{fontSize: '13px', color: 'var(--text-2)', fontWeight: '500'}}>Stage of Infection: </span>
        <span style={{fontSize: '13px', color: 'var(--text-1)'}}>{disease.Stage_of_Infection}</span>
      </div>
      
      <div style={{marginBottom: '8px'}}>
        <span style={{fontSize: '13px', color: 'var(--text-2)', fontWeight: '500'}}>Solution: </span>
        <span style={{fontSize: '13px', color: 'var(--text-1)'}}>{disease.Solution}</span>
      </div>
    </div>
  );

  return (
    <div className="modal-overlay">
      <div className="modal" style={{width: '1000px', maxWidth: '95vw', maxHeight: '90vh'}}>
        <div className="modal-head">
          <button className="btn btn-ghost btn-sm" onClick={onBack || onClose}>
            <ArrowLeft className="ic-xs" />
          </button>
          <h3>Pest and Disease</h3>
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
          <div style={{display: 'flex', gap: '12px', marginBottom: '24px'}}>
            <button 
              onClick={() => setActiveTab('pest')}
              className={`btn btn-sm ${activeTab === 'pest' ? 'btn-primary' : 'btn-ghost'}`}
              style={{
                flex: 1,
                padding: '12px'
              }}
            >
              Pest
            </button>
            <button 
              onClick={() => setActiveTab('disease')}
              className={`btn btn-sm ${activeTab === 'disease' ? 'btn-primary' : 'btn-ghost'}`}
              style={{
                flex: 1,
                padding: '12px'
              }}
            >
              Disease
            </button>
          </div>

          {loading && (
            <div style={{textAlign: 'center', padding: '40px', color: 'var(--text-2)'}}>
              Loading pest and disease data...
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
            <div style={{maxHeight: '60vh', overflowY: 'auto'}}>
              {activeTab === 'pest' ? (
                pests.length > 0 ? (
                  pests.map((pest, index) => renderPestCard(pest, index))
                ) : (
                  <div style={{textAlign: 'center', color: 'var(--text-2)', padding: '40px'}}>
                    No pests detected
                  </div>
                )
              ) : (
                diseases.length > 0 ? (
                  diseases.map((disease, index) => renderDiseaseCard(disease, index))
                ) : (
                  <div style={{textAlign: 'center', color: 'var(--text-2)', padding: '40px'}}>
                    No diseases detected
                  </div>
                )
              )}
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
                  Pest & Disease Forewarning
                </h5>
                <p style={{fontSize: '14px', color: 'var(--text-1)', lineHeight: '1.6', marginBottom: '20px'}}>
                  The P&D forewarning does not verify the presence of disease or pests; rather, it suggests the potential for infection based on the prevailing weather conditions.
                </p>
                
                <h5 style={{fontSize: '18px', fontWeight: '600', color: 'var(--text-1)', marginBottom: '12px'}}>
                  P&D Banned Chemicals
                </h5>
                <p style={{fontSize: '14px', color: 'var(--text-1)', lineHeight: '1.6'}}>
                  The banned chemicals will be updated periodically to align with the government's yearly revisions of chemical regulations. If anything has been overlooked, please identify it and notify our team through WhatsApp at
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
