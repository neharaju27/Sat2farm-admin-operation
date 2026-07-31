import { X, ArrowLeft, Edit, Save } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

export default function FarmMap({ onClose, onBack, farmId, clientId }) {
  const [farmData, setFarmData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    crop_type: '',
    crop_variety: '',
    sowing_date: ''
  });
  const [saving, setSaving] = useState(false);
  const [cropsList, setCropsList] = useState([]);
  const [loadingCrops, setLoadingCrops] = useState(false);

  useEffect(() => {
    if (farmId && clientId) {
      fetchFarmDetails();
      fetchCropsList();
    } else if (farmId && !clientId) {
      setError('Report will be available soon');
    }
  }, [farmId, clientId]);

  useEffect(() => {
    if (mapRef.current && !mapInstanceRef.current) {
      // Initialize MapLibre GL map with satellite imagery
      const map = new maplibregl.Map({
        container: mapRef.current,
        style: {
          version: 8,
          sources: {
            'satellite': {
              type: 'raster',
              tiles: ['https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}'],
              tileSize: 256,
              attribution: '© Google'
            }
          },
          layers: [{
            id: 'satellite-layer',
            type: 'raster',
            source: 'satellite',
            minzoom: 0,
            maxzoom: 20
          }]
        },
        center: [90, 25], // Center on Asia
        zoom: 4,
        pitch: 0,
        bearing: 0
      });

      mapInstanceRef.current = map;

      // Add controls
      map.addControl(new maplibregl.NavigationControl({ showCompass: true, showZoom: true }), 'top-right');
      map.addControl(new maplibregl.FullscreenControl(), 'top-right');
      map.addControl(new maplibregl.ScaleControl({ maxWidth: 100, unit: 'metric' }), 'bottom-right');

      // Add farm polygon when data is available
      if (farmData && farmData.coordinates && farmData.coordinates.length > 0) {
        map.on('load', () => {
          map.addSource('farm-polygon', {
            type: 'geojson',
            data: {
              type: 'Feature',
              geometry: {
                type: 'Polygon',
                coordinates: [farmData.coordinates]
              }
            }
          });

          map.addLayer({
            id: 'farm-fill',
            type: 'fill',
            source: 'farm-polygon',
            layout: {},
            paint: {
              'fill-color': '#3b82f6',
              'fill-opacity': 0.3
            }
          });

          map.addLayer({
            id: 'farm-border',
            type: 'line',
            source: 'farm-polygon',
            layout: {},
            paint: {
              'line-color': '#3b82f6',
              'line-width': 3
            }
          });

          // Fit map to farm polygon
          const bounds = new maplibregl.LngLatBounds();
          farmData.coordinates.forEach(coord => {
            bounds.extend(coord);
          });
          map.fitBounds(bounds, { padding: 50 });
        });
      }
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
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

    const data = response.data.data;
    const sowingDateRaw = data.Sowing_date || data.sowing_date || '';

    // Compute crop age (days since sowing) if the API doesn't already provide it
    let cropAge = '';
    if (sowingDateRaw) {
      const sowingDate = new Date(sowingDateRaw);
      const today = new Date();
      const diffDays = Math.floor(
        (Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()) -
          Date.UTC(sowingDate.getFullYear(), sowingDate.getMonth(), sowingDate.getDate())) /
          (1000 * 60 * 60 * 24)
      );
      cropAge = isNaN(diffDays) ? '' : `${diffDays} days`;
    }

    setFarmData({ ...data, crop_age: cropAge,sowing_date: sowingDateRaw });

    // Initialize edit form with current data
    setEditForm({
      crop_type: data.crop_type || '',
      crop_variety: data.crop_variety || '',
      sowing_date: sowingDateRaw || ''
    });
  } catch (err) {
    setError('Report will be available soon');
  } finally {
    setLoading(false);
  }
};

  const fetchCropsList = async () => {
    setLoadingCrops(true);
    try {
      const response = await axios.get(import.meta.env.VITE_CROPS_API_URL);
      if (response.data && Array.isArray(response.data)) {
        setCropsList(response.data);
      }
    } catch (err) {
      console.error('Error fetching crops list:', err);
    } finally {
      setLoadingCrops(false);
    }
  };

  const handleEditFarm = () => {
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      const keyResponse = await axios.get(import.meta.env.VITE_FETCH_FARMER_KEY_API_URL, {
        params: { client_id: clientId }
      });
      const apiKey = keyResponse.data.api_key;

      // Convert date from YYYY-MM-DD to DD-MM-YYYY format
      let formattedDate = '';
      if (editForm.sowing_date) {
        const [year, month, day] = editForm.sowing_date.split('-');
        formattedDate = `${day}-${month}-${year}`;
      }

      const response = await axios.get(import.meta.env.VITE_EDIT_FARM_API_URL, {
        params: {
          key: apiKey,
          farm_id: farmId,
          crop_type: editForm.crop_type,
          sowing_date: formattedDate,
          crop_variety: editForm.crop_variety
        }
      });

      if (response.data.status === 'success') {
        setShowEditModal(false);
        fetchFarmDetails(); // Refresh farm data
      } else {
        setError('Failed to update farm details');
      }
    } catch (err) {
      console.error('Error editing farm:', err);
      setError('Failed to update farm details');
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className="modal-overlay">
      <div className="modal" style={{width: '1200px', maxWidth: '95vw', maxHeight: '90vh'}}>
        <div className="modal-head">
          <button className="btn btn-ghost btn-sm" onClick={onBack || onClose}>
            <ArrowLeft className="ic-xs" />
          </button>
          <h3>Farm Map</h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>
            <X className="ic-xs" />
          </button>
        </div>
        <div className="modal-body" style={{overflowY: 'auto', padding: '0'}}>
          {loading ? (
            <div style={{textAlign: 'center', padding: '40px', color: 'var(--text-2)'}}>
              Loading farm map...
            </div>
          ) : error ? (
            <div style={{textAlign: 'center', padding: '40px', color: '#ef4444'}}>
              {error}
            </div>
          ) : (
            <div style={{position: 'relative', height: '600px', backgroundColor: '#000'}}>
              {/* Reset View Button */}
              <button
                onClick={() => {
                  if (mapInstanceRef.current) {
                    if (farmData && farmData.coordinates && farmData.coordinates.length > 0) {
                      // Fit to farm polygon
                      const bounds = new maplibregl.LngLatBounds();
                      farmData.coordinates.forEach(coord => {
                        bounds.extend(coord);
                      });
                      mapInstanceRef.current.fitBounds(bounds, { padding: 50 });
                    } else {
                      // Reset to default Asia view
                      mapInstanceRef.current.flyTo({ center: [90, 25], zoom: 4, pitch: 0, bearing: 0 });
                    }
                  }
                }}
                style={{
                  position: 'absolute',
                  top: '16px',
                  left: '16px',
                  zIndex: 1000,
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                  color: '#fff',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                Reset View
              </button>

              {/* Farm Info Panel */}
{farmData && (
  <div style={{
    position: 'absolute',
    bottom: '16px',
    left: '16px',
    zIndex: 1000,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    width: '220px',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  }}>
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 12px 8px 12px',
      borderBottom: '1px solid rgba(255, 255, 255, 0.15)',
      flexShrink: 0
    }}>
      <h5 style={{fontSize: '14px', fontWeight: '600', color: '#fff', margin: 0}}>
        Farm Information
      </h5>
      <button
        onClick={handleEditFarm}
        style={{
          backgroundColor: 'rgba(59, 130, 246, 0.8)',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          padding: '6px 12px',
          cursor: 'pointer',
          fontSize: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          flexShrink: 0
        }}
      >
        <Edit size={12} />
        Edit
      </button>
    </div>
    <div style={{
      display: 'grid',
      gap: '4px',
      padding: '8px 5px 12px 12px',
      overflowY: 'auto',
      flex: 1
    }}>
                    <div style={{fontSize: '13px', display: 'flex', gap: '4px'}}>
                      <span style={{color: 'rgba(255,255,255,0.7)'}}>Farm Name:</span>
                      <span style={{fontWeight: '600'}}>{farmData.farm_name}</span>
                    </div>
                    <div style={{fontSize: '13px', display: 'flex', gap: '4px'}}>
                      <span style={{color: 'rgba(255,255,255,0.7)'}}>Farm ID:</span>
                      <span>{farmData.farm_id}</span>
                    </div>
                    <div style={{fontSize: '13px', display: 'flex', gap: '4px'}}>
                      <span style={{color: 'rgba(255,255,255,0.7)'}}>Crop Type:</span>
                      <span>{farmData.crop_type}</span>
                    </div>
                    <div style={{fontSize: '13px', display: 'flex', gap: '4px'}}>
                      <span style={{color: 'rgba(255,255,255,0.7)'}}>Crop Variety:</span>
                      <span>{farmData.crop_variety || ' '}</span>
                    </div>
                    <div style={{fontSize: '13px', display: 'flex', gap: '4px'}}>
                      <span style={{color: 'rgba(255,255,255,0.7)'}}>Crop Age:</span>
                      <span>{farmData.crop_age || ' '}</span>
                    </div>
                    <div style={{fontSize: '13px', display: 'flex', gap: '4px'}}>
                      <span style={{color: 'rgba(255,255,255,0.7)'}}>Irrigation Type:</span>
                      <span>{farmData.irrigation_type || 'N/A'}</span>
                    </div>
                    <div style={{fontSize: '13px', display: 'flex', gap: '4px'}}>
                      <span style={{color: 'rgba(255,255,255,0.7)'}}>Latitude:</span>
                      <span>{farmData.center && farmData.center[1] ? farmData.center[1].toFixed(3) : 'N/A'}</span>
                    </div>
                    <div style={{fontSize: '13px', display: 'flex', gap: '4px'}}>
                      <span style={{color: 'rgba(255,255,255,0.7)'}}>Longitude:</span>
                      <span>{farmData.center && farmData.center[0] ? farmData.center[0].toFixed(3) : 'N/A'}</span>
                    </div>
                    <div style={{fontSize: '13px', display: 'flex', gap: '4px'}}>
                      <span style={{color: 'rgba(255,255,255,0.7)'}}>Area:</span>
                      <span>{farmData.area ? (farmData.area * 2.47105).toFixed(2) + ' acres' : 'N/A'}</span>
                    </div>
                    <div style={{fontSize: '13px', display: 'flex', gap: '4px'}}>
                      <span style={{color: 'rgba(255,255,255,0.7)'}}>Location:</span>
                      <span>{farmData.location?.district || 'N/A'}, {farmData.location?.state || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Map Container */}
              <div
                ref={mapRef}
                style={{
                  width: '100%',
                  height: '100%'
                }}
              />
            </div>
          )}
        </div>
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>Close</button>
        </div>
      </div>

      {/* Edit Farm Modal */}
      {showEditModal && (
        <div className="modal-overlay" style={{zIndex: 2000, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <div className="modal" style={{width: '500px', maxWidth: '90vw', maxHeight: '90vh', display: 'flex', flexDirection: 'column', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'}}>
            <div className="modal-head" style={{padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <h3 style={{margin: 0, fontSize: '18px', fontWeight: '600', color: 'var(--text-1)'}}>Edit Farm Details</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowEditModal(false)} style={{padding: '4px 8px'}}>
                <X className="ic-xs" />
              </button>
            </div>
            <div className="modal-body" style={{flex: 1, overflowY: 'auto', padding: '20px'}}>
              <div style={{marginBottom: '16px'}}>
                <label style={{display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: 'var(--text-1)'}}>
                  Crop Name
                </label>
                <select
                  value={editForm.crop_type}
                  onChange={(e) => setEditForm({...editForm, crop_type: e.target.value})}
                  disabled={loadingCrops}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    fontSize: '14px',
                    backgroundColor: '#fff'
                  }}
                >
                  <option value="">Select crop</option>
                  {cropsList.map((crop) => (
                    <option key={crop} value={crop}>
                      {crop.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
                {loadingCrops && (
                  <div style={{fontSize: '12px', color: 'var(--text-2)', marginTop: '4px'}}>Loading crops...</div>
                )}
              </div>
              <div style={{marginBottom: '16px'}}>
                <label style={{display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: 'var(--text-1)'}}>
                  Crop Variety
                </label>
                <input
                  type="text"
                  value={editForm.crop_variety}
                  onChange={(e) => setEditForm({...editForm, crop_variety: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                  placeholder="Enter crop variety"
                />
              </div>
              <div style={{marginBottom: '16px'}}>
                <label style={{display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: 'var(--text-1)'}}>
                  Sowing Date
                </label>
                <input
                  type="date"
                  value={editForm.sowing_date}
                  onChange={(e) => setEditForm({...editForm, sowing_date: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>
            <div className="modal-actions" style={{padding: '16px 20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: '8px'}}>
              <button className="btn btn-ghost" onClick={() => setShowEditModal(false)}>Cancel</button>
              <button
                className="btn btn-primary"
                onClick={handleSaveEdit}
                disabled={saving}
                style={{display: 'flex', alignItems: 'center', gap: '8px'}}
              >
                <Save size={16} />
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
