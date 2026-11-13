// DrawFarm.jsx
// Install:  npm i leaflet leaflet-draw
// Usage:    import DrawFarm from "./DrawFarm";  <DrawFarm onSubmit={(farm) => console.log(farm)} onClose={() => {}} />

import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw";
import "leaflet-draw/dist/leaflet.draw.css";
import axios from "axios";

// Fix default marker icons when bundled
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const GREEN = "#16a34a";
const CROPS = ["Paddy", "Wheat", "Maize", "Sugarcane", "Cotton", "Groundnut", "Banana", "Coconut", "Other"];

const TILE_HYBRID = "https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"; // with labels
const TILE_SAT = "https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}";    // imagery only

// Crop-to-variety mapping (same as in UnlockFarm)
const cropVarietyMapping = {
  'Paddymedium': ['Mahaveer', 'Amrut', 'Shakthi', 'IR-64', 'CO-47', 'ADT-36', 'Tulsi', 'Roshi', 'Annada', 'Maibee', 'Govind', 'Dimroo', 'Saket-4', 'Narender-80', 'ASP 25L', 'Rasi', 'IR-20', 'IR-36', 'CO-43', 'CO-46', 'Lalat', 'Banglami', 'Rangadoria', 'CSR-10', 'Kasturi', 'KNM-1638', 'Panth-4', 'BPT-5204', 'ASP-25 L','SD20A','signia','Fedearroz 50'],
  'Paddy-Basmati': ['Rities', '1509', '1692', '1718', '1121', 'PB-7', '1847', '1885'],
  'Paddylong':['BPT-5204'],
  'Paddyshort':['Rasi','IR 20', 'IR 36', 'CO 43', 'CO 46', 'Lalat','I.R 64', 'Banglami', 'Rangadoria', 'CSR-10', 'Kasturi', 'Panth-4','RNR 15048','ASP 18','Others' ],
  'Date_Palm': ['Barhi', 'Deglet Nour', 'Medjool', 'Khuneji'],
  'Lettuce': ['Iceberg', 'Romaine'],
  'Panicum': ['Siambaza'],
  'Bamboo': ['Bambusa tulda']
};

const UNITS = {
  acres: { label: "acres", factor: 0.000247105 },
  hectares: { label: "hectares", factor: 0.0001 },
  "sq meters": { label: "sq meters", factor: 1 },
  "sq feet": { label: "sq feet", factor: 10.7639 },
};

const styles = {
  page: { fontFamily: "Arial, Helvetica, sans-serif", background: "#fff", height: "100vh", display: "flex", flexDirection: "column", padding: "0 16px 16px" },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", height: 78, flexShrink: 0 },
  title: { color: "#1e4d8c", fontSize: 24, fontWeight: 700, margin: 0 },
  step: { color: "#0fa968", fontSize: 18 },
  close: { background: "none", border: "none", fontSize: 34, cursor: "pointer", color: "#444", lineHeight: 1 },
  mapWrap: { position: "relative", flex: 1, minHeight: 0 },
  map: { position: "absolute", inset: 0 },
  search: { position: "absolute", top: 8, left: 8, zIndex: 1000, width: 220 },
  searchInput: { width: "100%", boxSizing: "border-box", padding: "14px 10px", border: "none", borderRadius: 3, fontSize: 14, boxShadow: "0 1px 4px rgba(0,0,0,.4)" },
  results: { background: "#fff", margin: 0, padding: 0, listStyle: "none", maxHeight: 220, overflowY: "auto", boxShadow: "0 1px 4px rgba(0,0,0,.4)" },
  resultItem: { padding: "8px 10px", fontSize: 13, cursor: "pointer", borderTop: "1px solid #eee" },
  areaBox: { position: "absolute", top: 198, left: 8, zIndex: 1000, background: "#fff", padding: "12px 10px", borderRadius: 3, boxShadow: "0 1px 4px rgba(0,0,0,.4)", fontSize: 14 },
  areaTitle: { color: "#168a3a", marginBottom: 14 },
  toolbar: { position: "absolute", top: 8, right: 8, zIndex: 1000, display: "flex", flexDirection: "column", gap: 14 },
  toolBtn: (active) => ({ width: 38, height: 38, border: "none", borderRadius: 6, background: active ? "#0d7a3e" : GREEN, color: "#fff", cursor: "pointer", fontSize: 17, boxShadow: "0 1px 4px rgba(0,0,0,.4)" }),
  form: { position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)", zIndex: 1000, background: "#fff", padding: 16, borderRadius: 8, boxShadow: "0 2px 10px rgba(0,0,0,.4)", display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" },
  input: { padding: "9px 10px", border: "1px solid #ccc", borderRadius: 4, fontSize: 14 },
  submit: { padding: "10px 22px", background: GREEN, color: "#fff", border: "none", borderRadius: 4, fontSize: 14, cursor: "pointer" },
};

export default function DrawFarm({ onSubmit, onClose, initialCenter = [15.43, 76.54], initialZoom = 13, farmerInfo = null, polygonCategory = 'Farm' }) {
  const mapEl = useRef(null);
  const map = useRef(null);
  const drawn = useRef(L.featureGroup());
  const drawHandler = useRef(null);
  const markerRef = useRef(null);
  const nameInputRef = useRef(null);

  const [areaM2, setAreaM2] = useState(0);
  const [unit, setUnit] = useState("acres");
  const [drawing, setDrawing] = useState(false);
  const [editing, setEditing] = useState(false);
  const [hasFarm, setHasFarm] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [name, setName] = useState("");
  const [crop, setCrop] = useState("");
  const [variety, setVariety] = useState("");
  const [sowingDate, setSowingDate] = useState("");
  const [irrigation, setIrrigation] = useState("");
  const [labels, setLabels] = useState(true);
  const labelLayer = useRef(null);

  // API-related state
  const [cropsList, setCropsList] = useState([]);
  const [loadingCrops, setLoadingCrops] = useState(false);
  const [varietiesList, setVarietiesList] = useState([]);

  // ---------- API functions ----------
  const fetchCropsList = async () => {
    setLoadingCrops(true);
    try {
      const response = await axios.get(
        import.meta.env.VITE_CROPS_API_URL
      );

      console.log("Crops API response:", response.data);

      if (Array.isArray(response.data)) {
        setCropsList(response.data);
      } else {
        console.error("Unexpected crops API response:", response.data);
        setCropsList([]);
      }

    } catch (error) {
      console.error("Error fetching crops:", error);
      setCropsList([]);
    } finally {
      setLoadingCrops(false);
    }
  };

  const handleCropTypeChange = (selectedCrop) => {
    setCrop(selectedCrop);
    setVariety(''); // Reset variety when crop changes

    console.log('Selected crop:', selectedCrop);

    // Get varieties for the selected crop
    const varieties = cropVarietyMapping[selectedCrop] || [];

    console.log('Varieties found:', varieties);

    setVarietiesList(varieties);
  };

  // Fetch crops on component mount
  useEffect(() => {
    fetchCropsList();
  }, []);

  // ---------- init map ----------
  useEffect(() => {
    const m = L.map(mapEl.current, { center: initialCenter, zoom: initialZoom, zoomControl: false, maxZoom: 22 });
    setTimeout(() => m.invalidateSize(), 200);
    map.current = m;

    // Google hybrid = satellite + place names, roads, POIs (like your screenshot)
    labelLayer.current = L.tileLayer(TILE_HYBRID, {
      subdomains: ["mt0", "mt1", "mt2", "mt3"],
      attribution: "Map data &copy; Google",
      maxNativeZoom: 20, // real tiles exist up to here
      maxZoom: 22,       // beyond this, tiles are stretched instead of going blank
    }).addTo(m);

    drawn.current.addTo(m);

    m.on(L.Draw.Event.CREATED, (e) => {
      drawn.current.clearLayers(); // one farm at a time
      drawn.current.addLayer(e.layer);

      // Check polygonCategory dynamically at event time
      const currentPolygonCategory = polygonCategory?.toLowerCase() === 'terrace garden' || polygonCategory?.toLowerCase() === 'garden';

      console.log('DRAW CREATED - polygonCategory:', polygonCategory);
      console.log('DRAW CREATED - isTerraceGarden:', currentPolygonCategory);
      console.log('DRAW CREATED - layer type:', e.layer instanceof L.Marker ? 'Marker' : 'Polygon');

      if (currentPolygonCategory || e.layer instanceof L.Marker) {
        // For terrace garden (marker), set fixed area
        console.log('Setting area to 40.4686 (0.01 acres) for terrace garden');
        setAreaM2(40.4686); // 0.01 acres in sq meters
        setHasFarm(true);
        setDrawing(false);
        // Auto-focus name input immediately after placing point
        setTimeout(() => nameInputRef.current?.focus(), 100);
      } else {
        // For other categories (polygon), compute area
        computeArea(e.layer);
        setHasFarm(true);
        setDrawing(false);
        // Auto-focus name input when polygon is closed
        setTimeout(() => nameInputRef.current?.focus(), 100);
      }
    });
    m.on(L.Draw.Event.DRAWSTOP, () => setDrawing(false));
    m.on(L.Draw.Event.EDITVERTEX, (e) => computeArea(e.poly));

    return () => m.remove();
    // eslint-disable-next-line
  }, []);

  const computeArea = (layer) => {
    const latlngs = layer.getLatLngs()[0];
    setAreaM2(L.GeometryUtil.geodesicArea(latlngs));
  };

  // Update area when polygonCategory changes and a farm is already drawn
  useEffect(() => {
    if (hasFarm) {
      const isTerraceGarden = polygonCategory?.toLowerCase() === 'terrace garden' || polygonCategory?.toLowerCase() === 'garden';
      if (isTerraceGarden) {
        setAreaM2(40.4686); // 0.01 acres in sq meters
      }
    }
  }, [polygonCategory, hasFarm]);

  // ---------- toolbar actions ----------
  const startDraw = () => {
    if (drawing) {
      drawHandler.current?.disable();
      setDrawing(false);
      return;
    }
    stopEdit();

    // Check polygonCategory dynamically at draw time
    const isTerraceGarden = polygonCategory?.toLowerCase() === 'terrace garden' || polygonCategory?.toLowerCase() === 'garden';

    if (isTerraceGarden) {
      // For terrace garden, use marker (single point)
      drawHandler.current = new L.Draw.Marker(map.current, {
        icon: L.icon({
          iconUrl: markerIcon,
          iconRetinaUrl: markerIcon2x,
          shadowUrl: markerShadow,
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        })
      });
    } else {
      // For other categories, use polygon
      drawHandler.current = new L.Draw.Polygon(map.current, {
        allowIntersection: false,
        showArea: false,
        shapeOptions: { color: "#ffd400", weight: 4, fillColor: "#ffd400", fillOpacity: 0.1 },
        metric: false,
        repeatMode: false,
        guideLayers: true,
      });
    }
    drawHandler.current.enable();
    setDrawing(true);
  };

  const stopEdit = () => {
    drawn.current.eachLayer((l) => l.editing?.disable());
    setEditing(false);
  };

  const toggleEdit = () => {
    if (!hasFarm) return;
    if (editing) return stopEdit();
    drawn.current.eachLayer((l) => l.editing?.enable());
    setEditing(true);
  };

  const clearAll = () => {
    drawHandler.current?.disable();
    drawn.current.clearLayers();
    setHasFarm(false);
    setAreaM2(0);
    setEditing(false);
    setDrawing(false);
  };

  const toggleLabels = () => {
    labelLayer.current.setUrl(labels ? TILE_SAT : TILE_HYBRID);
    setLabels(!labels);
  };

  const locateMe = () => {
    navigator.geolocation?.getCurrentPosition((pos) => {
      const ll = [pos.coords.latitude, pos.coords.longitude];
      map.current.setView(ll, 17);
      if (markerRef.current) map.current.removeLayer(markerRef.current);
      markerRef.current = L.marker(ll).addTo(map.current);
    });
  };

  const zoomToFarm = () => {
    if (hasFarm) map.current.fitBounds(drawn.current.getBounds(), { maxZoom: 18 });
  };

  // ---------- location search (OpenStreetMap Nominatim) ----------
  useEffect(() => {
    if (query.trim().length < 3) return setResults([]);
    const t = setTimeout(async () => {
      try {
        const r = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(query)}`
        );
        setResults(await r.json());
      } catch {
        setResults([]);
      }
    }, 400);
    return () => clearTimeout(t);
  }, [query]);

  const pickResult = (r) => {
    map.current.setView([+r.lat, +r.lon], 16);
    setResults([]);
    setQuery(r.display_name.split(",")[0]);
  };

  // ---------- submit ----------
  const handleSubmit = () => {
    if (!hasFarm) return alert("Please draw the farm boundary first.");
    if (!name.trim()) return alert("Please enter the farm name.");
    // Variety is optional for aquaculture, farm, polyhouse, and terrace garden
    const optionalVarietyCategories = ['aquaculture', 'farm', 'polyhouse', 'terrace garden', 'garden'];
    if (!optionalVarietyCategories.includes(polygonCategory?.toLowerCase()) && !variety.trim()) {
      return alert("Please enter the variety.");
    }
    // Sowing date is optional for aquaculture
    if (polygonCategory?.toLowerCase() !== 'aquaculture' && !sowingDate) {
      return alert("Please enter the sowing date.");
    }
    // Irrigation is optional for aquaculture
    if (polygonCategory?.toLowerCase() !== 'aquaculture' && !irrigation) {
      return alert("Please select the irrigation type.");
    }
    const layer = drawn.current.getLayers()[0];

    const isTerraceGarden = polygonCategory?.toLowerCase() === 'terrace garden' || polygonCategory?.toLowerCase() === 'garden';

    if (isTerraceGarden) {
      // Terrace garden uses marker (single point)
      const latlng = layer.getLatLng();
      if (!latlng) {
        return alert("Please select at least 1 point for terrace garden.");
      }
    } else {
      // Other categories use polygon
      const latlngs = layer.getLatLngs()[0];
      if (latlngs.length < 3) {
        return alert("At least 3 boundary points are required to draw a valid farm polygon.");
      }
    }

    const geojsonData = layer.toGeoJSON();
    console.log('DrawFarm - geojson:', geojsonData);
    console.log('DrawFarm - geojson geometry:', geojsonData.geometry);
    console.log('DrawFarm - geojson geometry coordinates:', geojsonData.geometry?.coordinates);

    // For terrace garden, set fixed area of 0.01 acres
    let finalAreaSqMeters = areaM2;
    let finalAreaAcres = areaM2 * UNITS.acres.factor;
    if (isTerraceGarden) {
      finalAreaSqMeters = 40.4686; // 0.01 acres in sq meters
      finalAreaAcres = 0.01;
    }

    onSubmit?.({
      name: name.trim(),
      cropType: crop,
      variety: variety.trim(),
      sowingDate: sowingDate,
      irrigation: irrigation,
      polygonCategory: polygonCategory,
      farmerInfo: farmerInfo,
      areaSqMeters: finalAreaSqMeters,
      areaAcres: finalAreaAcres,
      geojson: geojsonData,
    });
  };

  // show the farm name on the polygon (like "test1" in your screenshot)
  useEffect(() => {
    drawn.current.eachLayer((l) => {
      l.unbindTooltip();
      if (name.trim()) {
        const span = document.createElement("span");
        span.textContent = name.trim();
        span.style.cssText = "font-size:26px;font-weight:600;color:#c026d3;text-shadow:0 0 3px #fff,0 0 3px #fff";
        l.bindTooltip(span, { permanent: true, direction: "top", className: "farm-label" });
      }
    });
  }, [name, hasFarm]);

  const displayArea = (areaM2 * UNITS[unit].factor).toFixed(2);

  return (
    <div style={styles.page}>
      <style>{`
        .farm-label{background:transparent;border:none;box-shadow:none}.farm-label:before{display:none}
        /* Style the guide points as circles */
        .leaflet-draw-draw-polygon .leaflet-draw-guide-dash {
          fill: #ffd400;
          stroke: #fff;
          stroke-width: 2px;
          r: 6;
        }
        /* Hide the default dash pattern */
        .leaflet-draw-guide {
          stroke-dasharray: none;
        }
        /* Style vertex markers as circles */
        .leaflet-marker-icon {
          border-radius: 50% !important;
        }
        .leaflet-div-icon {
          background: #ffd400;
          border: 2px solid #fff;
          border-radius: 50%;
          box-shadow: 0 0 4px rgba(0,0,0,0.4);
        }
        .leaflet-mouse-marker {
          background: #ffd400;
          border: 2px solid #fff;
          border-radius: 50%;
        }
      `}</style>
      <div style={styles.header}>
        <h2 style={styles.title}>Draw Farm</h2>
        <span style={styles.step}>1. Drag the pointer to draw the boundary on the Map</span>
        <span style={styles.step}>2. Enter the Name and croptype of your farm</span>
        <span style={styles.step}>3. Click Submit</span>
        <button style={styles.close} onClick={onClose} aria-label="Close">×</button>
      </div>

      <div style={styles.mapWrap}>
        <div ref={mapEl} style={styles.map} />

        {/* search */}
        <div style={styles.search}>
          <input
            style={styles.searchInput}
            placeholder="Search for a location"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {results.length > 0 && (
            <ul style={styles.results}>
              {results.map((r) => (
                <li key={r.place_id} style={styles.resultItem} onClick={() => pickResult(r)}>
                  {r.display_name}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* area box */}
        <div style={styles.areaBox}>
          <div style={styles.areaTitle}>
            Area in {UNITS[unit].label}
            {areaM2 > 0 && <b style={{ marginLeft: 8, color: "#222" }}>{displayArea}</b>}
          </div>
          <label>
            Select Area Unit:{" "}
            <select value={unit} onChange={(e) => setUnit(e.target.value)}>
              {Object.keys(UNITS).map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </label>
        </div>

        {/* right toolbar */}
        <div style={styles.toolbar}>
          <button style={styles.toolBtn(false)} title="Delete boundary" onClick={clearAll}>🗑</button>
          <button style={styles.toolBtn(drawing || editing)} title="Draw / edit boundary"
            onClick={() => (hasFarm ? toggleEdit() : startDraw())}>✎</button>
          <button style={styles.toolBtn(false)} title="Redraw boundary" onClick={startDraw}>⬠</button>
          <button style={styles.toolBtn(!labels)} title="Toggle labels" onClick={toggleLabels}>👁</button>
          <button style={styles.toolBtn(false)} title="My location" onClick={locateMe}>📍</button>
          <button style={styles.toolBtn(false)} title="Zoom to farm" onClick={zoomToFarm}>🔍</button>
        </div>

        {/* Farm Details Form - matching Farm Details UI */}
        {hasFarm && (
          <div style={{
            position: 'absolute',
            bottom: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1000,
            background: '#fff',
            padding: '16px',
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.4)',
            maxWidth: '400px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
              <label style={{fontSize: '14px', fontWeight: '600', color: 'var(--text-1)'}}>
                {polygonCategory.toLowerCase() === 'aquaculture' 
                  ? 'Aquaculture Name' 
                  : polygonCategory.toLowerCase() === 'polyhouse'
                  ? 'Polyhouse Name'
                  : polygonCategory.toLowerCase() === 'terrace garden'
                  ? 'Garden Name'
                  : 'Farm Name'}
              </label>
              {farmerInfo && (
                <div style={{fontSize: '13px', color: 'var(--text-2)', marginBottom: '8px'}}>
                  Farmer: {farmerInfo.name} ({farmerInfo.user_id || farmerInfo.userId || farmerInfo.id})
                </div>
              )}
              <input
                ref={nameInputRef}
                style={{padding: '9px 10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px'}}
                placeholder={
                  polygonCategory.toLowerCase() === 'aquaculture' 
                    ? 'Enter aquaculture name' 
                    : polygonCategory.toLowerCase() === 'polyhouse'
                    ? 'Enter polyhouse name'
                    : polygonCategory.toLowerCase() === 'terrace garden'
                    ? 'Enter garden name'
                    : 'Enter farm name'
                }
                value={name} 
                onChange={(e) => setName(e.target.value)} 
              />
            </div>

            <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
              <label style={{fontSize: '14px', fontWeight: '600', color: 'var(--text-1)'}}>Polygon Category</label>
              <input
                type="text"
                value={polygonCategory}
                disabled
                style={{padding: '9px 10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px', backgroundColor: 'var(--bg-2)', cursor: 'not-allowed'}}
              />
            </div>

            {polygonCategory.toLowerCase() !== 'aquaculture' && (
              <>
                <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                  <label style={{fontSize: '14px', fontWeight: '600', color: 'var(--text-1)'}}>Crop Type</label>
                  <select 
                    style={{padding: '9px 10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px'}}
                    value={crop} 
                    onChange={(e) => handleCropTypeChange(e.target.value)}
                    disabled={loadingCrops}
                  >
                    <option value="">
                      {loadingCrops ? 'Loading crops...' : 'Select crop type'}
                    </option>
                    {cropsList.map((cropItem) => (
                      <option key={cropItem} value={cropItem}>
                        {cropItem.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                  <label style={{fontSize: '14px', fontWeight: '600', color: 'var(--text-1)'}}>Variety</label>
                  {varietiesList.length > 0 ? (
                    <select
                      style={{padding: '9px 10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px'}}
                      value={variety}
                      onChange={(e) => setVariety(e.target.value)}
                    >
                      <option value="">Select variety</option>
                      {varietiesList.map((varietyItem) => (
                        <option key={varietyItem} value={varietyItem}>
                          {varietyItem}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      style={{padding: '9px 10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px'}}
                      placeholder="Enter variety"
                      value={variety} 
                      onChange={(e) => setVariety(e.target.value)} 
                    />
                  )}
                </div>

                <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                  <label style={{fontSize: '14px', fontWeight: '600', color: 'var(--text-1)'}}>Sowing Date</label>
                  <input
                    type="date"
                    style={{padding: '9px 10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px'}}
                    value={sowingDate} 
                    onChange={(e) => setSowingDate(e.target.value)} 
                  />
                </div>

                <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                  <label style={{fontSize: '14px', fontWeight: '600', color: 'var(--text-1)'}}>Irrigation</label>
                  <div style={{display: 'flex', gap: '16px', marginTop: '8px'}}>
                    <label style={{display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer'}}>
                      <input
                        type="radio"
                        name="irrigation"
                        value="rainfed"
                        checked={irrigation === 'rainfed'}
                        onChange={(e) => setIrrigation(e.target.value)}
                      />
                      <span>Rainfed</span>
                    </label>
                    <label style={{display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer'}}>
                      <input
                        type="radio"
                        name="irrigation"
                        value="irrigated"
                        checked={irrigation === 'irrigated'}
                        onChange={(e) => setIrrigation(e.target.value)}
                      />
                      <span>Irrigated</span>
                    </label>
                  </div>
                </div>
              </>
            )}

            <div style={{display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '8px'}}>
              <button 
                style={{padding: '10px 22px', background: '#6b7280', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '14px', cursor: 'pointer'}}
                onClick={onClose}
              >
                Cancel
              </button>
              <button 
                style={{padding: '10px 22px', background: GREEN, color: '#fff', border: 'none', borderRadius: '4px', fontSize: '14px', cursor: 'pointer'}}
                onClick={handleSubmit}
              >
                Submit
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}