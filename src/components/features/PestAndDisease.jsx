import { useState, useEffect } from 'react';
import { X, ArrowLeft, Info } from 'lucide-react';
import axios from 'axios';
import { useLanguage } from '../../context/LanguageContext';

export default function PestAndDisease({ onClose, onBack, farmId, clientId }) {
  const { t } = useLanguage();
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
      setError(t('dataAvailableSoon'));
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
        `${import.meta.env.VITE_PEST_DISEASE_API_URL}?key=${apiKey}&farm_id=${farmId}&ln=en`
      );
      
      const data = response.data;
      console.log('Pest/Disease API response:', data);

      // Check if API response indicates no pest/disease for current weather
      // Response structure: {"exception": "No pest and disease attack for the current weather condition", "status": "message"}
      if (data && data.exception && data.exception.toLowerCase().includes('no pest and disease attack')) {
        setError(t('noPestDiseaseAvailable'));
        setPests([]);
        setDiseases([]);
        return;
      }

      // Check for specific error response: {"exception": "No pest/disease available for your crop", "status": "error"}
      if (data && data.exception && data.exception.toLowerCase().includes('no pest/disease available for your crop')) {
        setError(t('noPestDiseaseAvailable'));
        setPests([]);
        setDiseases([]);
        return;
      }

      // Separate pests and diseases
      const pestList = data.filter(item => item.Pest);
      const diseaseList = data.filter(item => item.Disease);

      // If both lists are empty, show custom message
      if (pestList.length === 0 && diseaseList.length === 0) {
        setError(t('noPestDiseaseAvailable'));
        return;
      }

      setPests(pestList);
      setDiseases(diseaseList);
    } catch (err) {
      console.error('Error fetching pest/disease data:', err);

      // Handle 404 error - show specific message
      if (err.response && err.response.status === 404) {
        setError(t('noPestDiseaseAvailable'));
      } else {
        setError(t('dataAvailableSoon'));
      }
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
        <span style={{fontSize: '13px', color: 'var(--text-2)', fontWeight: '500'}}>{t('date')}: </span>
        <span style={{fontSize: '13px', color: 'var(--text-1)'}}>{pest.Date}</span>
      </div>

      <div style={{marginBottom: '12px'}}>
        <span style={{fontSize: '13px', color: 'var(--text-2)', fontWeight: '500'}}>{t('cropName')}: </span>
        <span style={{fontSize: '13px', color: 'var(--text-1)'}}>{pest.Crop_name}</span>
      </div>

      <div style={{marginBottom: '12px'}}>
        <span style={{fontSize: '13px', color: 'var(--text-2)', fontWeight: '500'}}>{t('pestName')}: </span>
        <span style={{fontSize: '13px', color: 'var(--text-1)', fontWeight: '600'}}>{pest.Pest}</span>
      </div>

      {pest.Pest_img_url && pest.Pest_img_url.length > 0 && (
        <div style={{marginBottom: '16px'}}>
          <span style={{fontSize: '13px', color: 'var(--text-2)', fontWeight: '500', display: 'block', marginBottom: '8px'}}>{t('images')}:</span>
          <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap'}}>
            {pest.Pest_img_url.map((url, imgIndex) => (
              <img
                key={imgIndex}
                src={url}
                alt={`${pest.Pest} image ${imgIndex + 1}`}
                style={{
                  width: '120px',
                  height: '120px',
                  objectFit: 'cover',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  cursor: 'pointer'
                }}
                onClick={() => window.open(url, '_blank')}
              />
            ))}
          </div>
        </div>
      )}

      <div style={{marginBottom: '12px'}}>
        <span style={{fontSize: '13px', color: 'var(--text-2)', fontWeight: '500'}}>{t('symptoms')}: </span>
        <span style={{fontSize: '13px', color: 'var(--text-1)'}}>{pest.Symptoms}</span>
      </div>

      <div style={{marginBottom: '12px'}}>
        <span style={{fontSize: '13px', color: 'var(--text-2)', fontWeight: '500'}}>{t('affectedPart')}: </span>
        <span style={{fontSize: '13px', color: 'var(--text-1)'}}>{pest.Affected_Part}</span>
      </div>

      <div style={{marginBottom: '12px'}}>
        <span style={{fontSize: '13px', color: 'var(--text-2)', fontWeight: '500'}}>{t('modeOfSpread')}: </span>
        <span style={{fontSize: '13px', color: 'var(--text-1)'}}>{pest.Mode_of_Spread}</span>
      </div>

      <div style={{marginBottom: '12px'}}>
        <span style={{fontSize: '13px', color: 'var(--text-2)', fontWeight: '500'}}>{t('pathogen')}: </span>
        <span style={{fontSize: '13px', color: 'var(--text-1)'}}>{pest.Pathogen}</span>
      </div>

      <div style={{marginBottom: '12px'}}>
        <span style={{fontSize: '13px', color: 'var(--text-2)', fontWeight: '500'}}>{t('stageOfInfection')}: </span>
        <span style={{fontSize: '13px', color: 'var(--text-1)'}}>{pest.Stage_of_Infection}</span>
      </div>

      <div style={{marginBottom: '8px'}}>
        <span style={{fontSize: '13px', color: 'var(--text-2)', fontWeight: '500'}}>{t('solution')}: </span>
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
        <span style={{fontSize: '13px', color: 'var(--text-2)', fontWeight: '500'}}>{t('date')}: </span>
        <span style={{fontSize: '13px', color: 'var(--text-1)'}}>{disease.Date}</span>
      </div>

      <div style={{marginBottom: '12px'}}>
        <span style={{fontSize: '13px', color: 'var(--text-2)', fontWeight: '500'}}>{t('cropName')}: </span>
        <span style={{fontSize: '13px', color: 'var(--text-1)'}}>{disease.Crop_name}</span>
      </div>

      <div style={{marginBottom: '12px'}}>
        <span style={{fontSize: '13px', color: 'var(--text-2)', fontWeight: '500'}}>{t('diseaseName')}: </span>
        <span style={{fontSize: '13px', color: 'var(--text-1)', fontWeight: '600'}}>{disease.Disease}</span>
      </div>

      {disease.Disease_img_url && disease.Disease_img_url.length > 0 && (
        <div style={{marginBottom: '16px'}}>
          <span style={{fontSize: '13px', color: 'var(--text-2)', fontWeight: '500', display: 'block', marginBottom: '8px'}}>{t('images')}:</span>
          <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap'}}>
            {disease.Disease_img_url.map((url, imgIndex) => (
              <img
                key={imgIndex}
                src={url}
                alt={`${disease.Disease} image ${imgIndex + 1}`}
                style={{
                  width: '120px',
                  height: '120px',
                  objectFit: 'cover',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  cursor: 'pointer'
                }}
                onClick={() => window.open(url, '_blank')}
              />
            ))}
          </div>
        </div>
      )}

      <div style={{marginBottom: '12px'}}>
        <span style={{fontSize: '13px', color: 'var(--text-2)', fontWeight: '500'}}>{t('symptoms')}: </span>
        <span style={{fontSize: '13px', color: 'var(--text-1)'}}>{disease.Symptoms}</span>
      </div>

      <div style={{marginBottom: '12px'}}>
        <span style={{fontSize: '13px', color: 'var(--text-2)', fontWeight: '500'}}>{t('affectedPart')}: </span>
        <span style={{fontSize: '13px', color: 'var(--text-1)'}}>{disease.Affected_Part}</span>
      </div>

      <div style={{marginBottom: '12px'}}>
        <span style={{fontSize: '13px', color: 'var(--text-2)', fontWeight: '500'}}>{t('modeOfSpread')}: </span>
        <span style={{fontSize: '13px', color: 'var(--text-1)'}}>{disease.Mode_of_Spread}</span>
      </div>

      <div style={{marginBottom: '12px'}}>
        <span style={{fontSize: '13px', color: 'var(--text-2)', fontWeight: '500'}}>{t('pathogen')}: </span>
        <span style={{fontSize: '13px', color: 'var(--text-1)'}}>{disease.Pathogen}</span>
      </div>

      <div style={{marginBottom: '12px'}}>
        <span style={{fontSize: '13px', color: 'var(--text-2)', fontWeight: '500'}}>{t('stageOfInfection')}: </span>
        <span style={{fontSize: '13px', color: 'var(--text-1)'}}>{disease.Stage_of_Infection}</span>
      </div>

      <div style={{marginBottom: '8px'}}>
        <span style={{fontSize: '13px', color: 'var(--text-2)', fontWeight: '500'}}>{t('solution')}: </span>
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
          <h3>{t('pestAndDisease')}</h3>
          <button 
            className="btn btn-ghost btn-sm" 
            onClick={() => setShowDisclaimer(true)}
            style={{marginRight: '8px'}}
            title={t('disclaimer')}
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
              {t('pest')}
            </button>
            <button 
              onClick={() => setActiveTab('disease')}
              className={`btn btn-sm ${activeTab === 'disease' ? 'btn-primary' : 'btn-ghost'}`}
              style={{
                flex: 1,
                padding: '12px'
              }}
            >
              {t('disease')}
            </button>
          </div>

          {loading && (
            <div style={{textAlign: 'center', padding: '40px', color: 'var(--text-2)'}}>
              {t('loadingPestDiseaseData')}
            </div>
          )}

          {error && (
            <div style={{
              backgroundColor: '#dbeafe',
              border: '1px solid #93c5fd',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '16px',
              color: '#2563eb'
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
                    {t('noPestsDetected')}
                  </div>
                )
              ) : (
                diseases.length > 0 ? (
                  diseases.map((disease, index) => renderDiseaseCard(disease, index))
                ) : (
                  <div style={{textAlign: 'center', color: 'var(--text-2)', padding: '40px'}}>
                    {t('noDiseasesDetected')}
                  </div>
                )
              )}
            </div>
          )}
        </div>
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>{t('close')}</button>
        </div>
      </div>

      {/* Disclaimer Modal */}
      {showDisclaimer && (
        <div className="modal-overlay" style={{zIndex: 2000}}>
          <div className="modal" style={{width: '500px', maxWidth: '90vw'}}>
            <div className="modal-head">
              <h3>{t('disclaimer')}</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowDisclaimer(false)}>
                <X className="ic-xs" />
              </button>
            </div>
            <div className="modal-body">
              <div style={{padding: '20px'}}>
                <h5 style={{fontSize: '18px', fontWeight: '600', color: 'var(--text-1)', marginBottom: '12px'}}>
                  {t('pestDiseaseForewarning')}
                </h5>
                <p style={{fontSize: '14px', color: 'var(--text-1)', lineHeight: '1.6', marginBottom: '20px'}}>
                  {t('pestDiseaseForewarningText')}
                </p>
                
                <h5 style={{fontSize: '18px', fontWeight: '600', color: 'var(--text-1)', marginBottom: '12px'}}>
                  {t('pestDiseaseBannedChemicals')}
                </h5>
                <p style={{fontSize: '14px', color: 'var(--text-1)', lineHeight: '1.6'}}>
                  {t('pestDiseaseBannedChemicalsText')}
                </p>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-primary" onClick={() => setShowDisclaimer(false)}>
                {t('close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
