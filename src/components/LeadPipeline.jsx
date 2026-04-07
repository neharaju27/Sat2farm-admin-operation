import { useState } from 'react';

const FILTERS = [
  { key: 'all', label: 'All (74)' },
  { key: 'mine', label: 'Mine (12)' },
  { key: 'hot', label: 'Hot leads' },
  { key: 'stale', label: 'Stale >7d' },
  { key: 'demo', label: 'Demo booked' },
];

const KANBAN_COLUMNS = [
  {
    id: 'new',
    title: 'New inquiry',
    count: 18,
    cards: [
      { name: 'Nandi Agri Co-op', meta: 'Chikkaballapur, KA · Banana', ac: '~1,200 ac', owner: 'PS' },
      { name: 'Bhavani Plantations', meta: 'Salem, TN · Sugarcane', ac: '~800 ac', owner: 'AK' },
      { name: 'Rayalaseema Farms', meta: 'Kurnool, AP · Cotton', ac: '~2,400 ac', owner: 'RV' },
      { name: 'Malnad Spice Estate', meta: 'Shivamogga, KA · Pepper', ac: '~600 ac', owner: 'PS' },
    ],
  },
  {
    id: 'contacted',
    title: 'Contacted',
    count: 16,
    cards: [
      { name: 'Tungabhadra Growers', meta: 'Hospet, KA · Paddy', ac: '~3,100 ac', owner: 'AK' },
      { name: 'Cauvery Delta FPC', meta: 'Thanjavur, TN · Paddy', ac: '~5,000 ac', owner: 'RV' },
      { name: 'Vidarbha Cotton Ltd', meta: 'Amravati, MH · Cotton', ac: '~1,800 ac', owner: 'PS' },
    ],
  },
  {
    id: 'demo',
    title: 'Demo booked',
    count: 11,
    cards: [
      { name: 'Krishna Agro Hub', meta: 'Vijayawada, AP · Mango', ac: '~4,200 ac', owner: 'AK', hot: true },
      { name: 'Marathwada Farmers Union', meta: 'Aurangabad, MH · Soybean', ac: '~7,000 ac', owner: 'RV' },
      { name: 'Palghat Banana Growers', meta: 'Palakkad, KL · Banana', ac: '~2,100 ac', owner: 'PS', hot: true },
    ],
  },
  {
    id: 'proposal',
    title: 'Proposal sent',
    count: 9,
    cards: [
      { name: 'Godavari FPC', meta: 'Rajahmundry, AP · Paddy', ac: '~6,400 ac', owner: 'AK' },
      { name: 'Kutch Groundnut Coop', meta: 'Bhuj, GJ · Groundnut', ac: '~3,200 ac', owner: 'PS' },
    ],
  },
  {
    id: 'negotiation',
    title: 'Negotiation',
    count: 6,
    cards: [
      { name: 'Nashik Grape Growers', meta: 'Nashik, MH · Grapes', ac: '~1,600 ac', owner: 'RV', stale: '9d' },
      { name: 'Telangana Maize Corp', meta: 'Nizamabad, TS · Maize', ac: '~4,800 ac', owner: 'AK' },
    ],
  },
  {
    id: 'won',
    title: 'Won',
    count: 14,
    cards: [
      { name: 'Kaveri Holdings', meta: 'Warangal, TS · Paddy', ac: '4,800 ac', owner: 'AK', won: true },
      { name: 'Vijaya FarmTech', meta: 'Nashik, MH · Banana', ac: '3,600 ac', owner: 'PS', won: true },
    ],
  },
  {
    id: 'lost',
    title: 'Lost',
    count: 8,
    cards: [
      { name: 'Konkan Rice Millers', meta: 'Ratnagiri, MH · Paddy', lostReason: 'Price mismatch', lost: true },
      { name: 'Sundarbans FPC', meta: 'WB · Jute', lostReason: 'Went competitor', lost: true },
    ],
  },
];

function KanbanCard({ card, onCardClick }) {
  const cardStyle = {
    background: card.won ? 'var(--green-50)' : 'var(--surface)',
    border: card.won
      ? '1px solid var(--green-200)'
      : card.hot
      ? '1px solid var(--green-400)'
      : card.stale
      ? '1px solid var(--amber-200)'
      : '1px solid var(--border)',
    borderRadius: 'var(--r)',
    padding: '10px 11px',
    cursor: card.lost ? 'default' : 'pointer',
    opacity: card.lost ? 0.6 : 1,
    transition: 'border-color 0.15s',
  };

  return (
    <div style={cardStyle} onClick={card.lost ? undefined : onCardClick}>
      {/* Card header row — only when hot or stale badge needed */}
      {(card.hot || card.stale) && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)' }}>{card.name}</div>
          {card.hot && (
            <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 20, background: 'var(--green-100)', color: 'var(--green-700)' }}>
              Hot
            </span>
          )}
          {card.stale && (
            <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 20, background: 'var(--amber-100)', color: 'var(--amber-600)' }}>
              Stale {card.stale}
            </span>
          )}
        </div>
      )}

      {/* Normal name row */}
      {!card.hot && !card.stale && (
        <div style={{ fontSize: 12, fontWeight: 500, color: card.won ? 'var(--green-700)' : 'var(--text)', marginBottom: 2 }}>
          {card.name}
        </div>
      )}

      <div style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 6 }}>{card.meta}</div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {card.lost ? (
          <span style={{ fontSize: 10, color: 'var(--red-600)' }}>{card.lostReason}</span>
        ) : (
          <>
            <span style={{ fontSize: 10, color: 'var(--green-700)', background: 'var(--green-100)', padding: '2px 6px', borderRadius: 4 }}>
              {card.ac}
            </span>
            <span
              style={{
                width: 18,
                height: 18,
                borderRadius: '50%',
                background: card.won ? 'var(--green-200)' : 'var(--green-200)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 8,
                color: 'var(--green-800)',
                fontWeight: 500,
              }}
            >
              {card.owner}
            </span>
          </>
        )}
      </div>
    </div>
  );
}

function KanbanColumn({ column, onCardClick }) {
  return (
    <div
      style={{
        minWidth: 220,
        width: 220,
        flexShrink: 0,
        background: 'var(--gray-50)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--r-lg)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          padding: '10px 12px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--text)', letterSpacing: '0.03em' }}>
          {column.title}
        </span>
        <span
          style={{
            fontSize: 10,
            padding: '2px 7px',
            borderRadius: 10,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            color: 'var(--text-3)',
          }}
        >
          {column.count}
        </span>
      </div>
      <div style={{ padding: 8, display: 'flex', flexDirection: 'column', gap: 7, flex: 1, overflowY: 'auto' }}>
        {column.cards.map((card, i) => (
          <KanbanCard key={i} card={card} onCardClick={() => onCardClick(card)} />
        ))}
      </div>
    </div>
  );
}

export default function LeadPipeline({ onAddLead }) {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [isAddLeadModalOpen, setIsAddLeadModalOpen] = useState(false);

  const handleCardClick = (card) => {
    setSelectedLead(card);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedLead(null);
  };

  const openAddLeadModal = () => {
    setIsAddLeadModalOpen(true);
  };

  const closeAddLeadModal = () => {
    setIsAddLeadModalOpen(false);
  };

  const uploadCSV = async () => {
    const fileInput = document.getElementById("csvFile");
    const formData = new FormData();

    formData.append("file", fileInput.files[0]);

    await fetch("http://127.0.0.1:8000/upload-csv/", {
        method: "POST",
        body: formData
    });

    alert("Uploaded!");
    loadLeads();
  };

  const loadLeads = () => {
    // Function to reload/refresh leads data
    // You can implement the actual data loading logic here
    console.log("Loading leads...");
  };

  return (
    <div style={{ padding: '28px 28px 40px', background: 'var(--bg)', minHeight: '100vh' }}>

      {/* Section header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 500 }}>Lead pipeline</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="file"
            accept=".csv"
            style={{ display: 'none' }}
            id="csvFile"
            onChange={uploadCSV}
          />
          <label
            htmlFor="csvFile"
            className="btn-upload-csv"
          >
            📁 Upload CSV
          </label>
          <button
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              padding: '5px 10px',
              borderRadius: 'var(--r)',
              border: '1px solid var(--border)',
              cursor: 'pointer',
              background: 'var(--surface)',
              color: 'var(--text)',
            }}
          >
            ↓ Export
          </button>
          <button
            onClick={openAddLeadModal}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              padding: '5px 10px',
              borderRadius: 'var(--r)',
              border: '1px solid var(--green-600)',
              cursor: 'pointer',
              background: 'var(--green-600)',
              color: '#fff',
            }}
          >
            + Add lead
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 12, marginBottom: 22 }}>
        {[
          { label: 'Total leads', val: '74', sub: '↑ 8 this month', subColor: 'var(--green-600)', accent: true },
          { label: 'Pipeline value (ac)', val: '68,400', sub: 'Potential acreage' },
          { label: 'Conversion rate', val: '34%', sub: '↑ 4% vs last qtr', subColor: 'var(--green-600)' },
          { label: 'Avg. deal cycle', val: '18d', sub: 'Inquiry → close' },
        ].map((m, i) => (
          <div
            key={i}
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderLeft: m.accent ? '3px solid var(--green-500)' : '1px solid var(--border)',
              borderRadius: 'var(--r-lg)',
              padding: '16px 18px',
            }}
          >
            <div style={{ fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 6 }}>
              {m.label}
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 500, color: 'var(--text)', lineHeight: 1 }}>
              {m.val}
            </div>
            <div style={{ fontSize: 11, color: m.subColor || 'var(--text-3)', marginTop: 4 }}>{m.sub}</div>
          </div>
        ))}
      </div>

      {/* Filter row */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16, alignItems: 'center' }}>
        <span style={{ fontSize: 10, color: 'var(--text-3)', marginRight: 2 }}>Filter:</span>
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setSelectedFilter(f.key)}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              padding: '4px 10px',
              borderRadius: 20,
              border: selectedFilter === f.key ? '1px solid var(--green-700)' : '1px solid var(--border)',
              cursor: 'pointer',
              background: selectedFilter === f.key ? 'var(--green-700)' : 'var(--surface)',
              color: selectedFilter === f.key ? '#fff' : 'var(--text-2)',
              transition: 'all 0.15s',
            }}
          >
            {f.label}
          </button>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 'var(--r)', background: 'var(--surface)', width: 190 }}>
          <span style={{ color: 'var(--text-3)', fontSize: 13 }}>⌕</span>
          <input
            type="text"
            placeholder="Search leads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              border: 'none',
              outline: 'none',
              fontSize: 12,
              flex: 1,
              background: 'transparent',
              fontFamily: 'var(--font-mono)',
              color: 'var(--text)',
            }}
          />
        </div>
      </div>

      {/* Kanban board */}
      <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8, minHeight: 420 }}>
        {KANBAN_COLUMNS.map((col) => (
          <KanbanColumn
            key={col.id}
            column={col}
            onCardClick={handleCardClick}
          />
        ))}
      </div>

      {/* Add Lead Modal */}
      {isAddLeadModalOpen && (
        <div className="modal-bg active" onClick={closeAddLeadModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <span className="modal-title">Add new lead</span>
              <button className="modal-close" onClick={closeAddLeadModal}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-row full">
                <div className="form-group">
                  <label>Company / farm name</label>
                  <input type="text" placeholder="e.g. Nandi Agri Co-op"/>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Contact person</label>
                  <input type="text" placeholder="Full name"/>
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input type="tel" placeholder="+91 XXXXX XXXXX"/>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" placeholder="contact@company.in"/>
                </div>
                <div className="form-group">
                  <label>State</label>
                  <select>
                    <option>Karnataka</option>
                    <option>Tamil Nadu</option>
                    <option>Andhra Pradesh</option>
                    <option>Maharashtra</option>
                    <option>Telangana</option>
                    <option>Kerala</option>
                    <option>Gujarat</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Estimated acreage (ac)</label>
                  <input type="number" placeholder="e.g. 1500"/>
                </div>
                <div className="form-group">
                  <label>Primary crop</label>
                  <select>
                    <option>Banana</option>
                    <option>Paddy</option>
                    <option>Sugarcane</option>
                    <option>Cotton</option>
                    <option>Drumstick</option>
                    <option>Grapes</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Pipeline stage</label>
                  <select>
                    <option>New inquiry</option>
                    <option>Contacted</option>
                    <option>Demo booked</option>
                    <option>Proposal sent</option>
                    <option>Negotiation</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Lead owner</label>
                  <select>
                    <option>Anand Kumar</option>
                    <option>Priya Shankar</option>
                    <option>Ravi Verma</option>
                  </select>
                </div>
              </div>
              <div className="form-row full">
                <div className="form-group">
                  <label>Source</label>
                  <select>
                    <option>Inbound / website</option>
                    <option>Referral</option>
                    <option>Field sales</option>
                    <option>Trade event</option>
                    <option>Cold outreach</option>
                    <option>FPC / govt scheme</option>
                  </select>
                </div>
              </div>
              <div className="form-row full">
                <div className="form-group">
                  <label>Notes</label>
                  <textarea placeholder="Initial conversation notes, context..."></textarea>
                </div>
              </div>
            </div>
            <div className="modal-foot">
              <button className="btn" onClick={closeAddLeadModal}>Cancel</button>
              <button className="btn btn-primary" onClick={closeAddLeadModal}>Add lead</button>
            </div>
          </div>
        </div>
      )}

      {/* Lead Detail Modal */}
      {isModalOpen && selectedLead && (
        <div className="modal-bg active" onClick={closeModal}>
          <div className="modal" style={{width: '540px'}} onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <div className="modal-title">{selectedLead.name}</div>
                <div style={{fontSize: '11px', color: 'var(--text-3)', marginTop: '2px'}}>
                  {selectedLead.meta} · {selectedLead.ac}
                </div>
              </div>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            <div className="modal-body">
              <div style={{display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap'}}>
                {selectedLead.hot && <span className="badge badge-green">Hot lead</span>}
                {selectedLead.stale && <span className="badge badge-amber">Stale {selectedLead.stale}</span>}
                <span className="badge badge-blue">Demo booked</span>
                <span style={{fontSize: '11px', color: 'var(--text-3)', padding: '3px 0'}}>
                  Owner: {selectedLead.owner}
                </span>
              </div>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px'}}>
                <div>
                  <div style={{fontSize: '10px', color: 'var(--text-3)', marginBottom: '2px'}}>Contact</div>
                  <div style={{fontSize: '12px', fontWeight: 500}}>Suresh Babu</div>
                  <div style={{fontSize: '11px', color: 'var(--text-3)'}}>suresh@krishnaagro.in</div>
                </div>
                <div>
                  <div style={{fontSize: '10px', color: 'var(--text-3)', marginBottom: '2px'}}>Phone</div>
                  <div style={{fontSize: '12px'}}>+91 99850 67890</div>
                </div>
                <div>
                  <div style={{fontSize: '10px', color: 'var(--text-3)', marginBottom: '2px'}}>Est. acreage</div>
                  <div style={{fontSize: '12px', fontWeight: 500, color: 'var(--green-700)'}}>
                    {selectedLead.ac}
                  </div>
                </div>
                <div>
                  <div style={{fontSize: '10px', color: 'var(--text-3)', marginBottom: '2px'}}>Demo date</div>
                  <div style={{fontSize: '12px'}}>28 Mar 2026, 3 PM</div>
                </div>
                <div>
                  <div style={{fontSize: '10px', color: 'var(--text-3)', marginBottom: '2px'}}>Source</div>
                  <div style={{fontSize: '12px'}}>Trade event - Agritech Expo</div>
                </div>
                <div>
                  <div style={{fontSize: '10px', color: 'var(--text-3)', marginBottom: '2px'}}>Expected close</div>
                  <div style={{fontSize: '12px'}}>Apr 2026</div>
                </div>
              </div>
              <div className="form-group" style={{marginBottom: '12px'}}>
                <label>Move to stage</label>
                <select>
                  <option>New inquiry</option>
                  <option>Contacted</option>
                  <option selected>Demo booked</option>
                  <option>Proposal sent</option>
                  <option>Negotiation</option>
                  <option>Won</option>
                  <option>Lost</option>
                </select>
              </div>
              <div className="form-group" style={{marginBottom: '12px'}}>
                <label>Add note / update</label>
                <textarea placeholder="Latest update, next steps..."></textarea>
              </div>
              <div style={{borderTop: '1px solid var(--border-soft)', paddingTop: '12px'}}>
                <div style={{fontSize: '11px', fontWeight: 500, color: 'var(--text-2)', marginBottom: '8px'}}>
                  Recent activity
                </div>
                <div className="tl-item">
                  <div className="tl-dot-wrap">
                    <div className="tl-dot call"></div>
                  </div>
                  <div className="tl-body">
                    <div className="tl-title">Call - demo confirmed</div>
                    <div className="tl-desc">Spoke with Suresh, confirmed 28 Mar demo. Keen on banana + mango tracking.</div>
                    <div className="tl-time">Today · Anand Kumar</div>
                  </div>
                </div>
                <div className="tl-item">
                  <div className="tl-dot-wrap">
                    <div className="tl-dot email"></div>
                  </div>
                  <div className="tl-body">
                    <div className="tl-title">Email - product deck sent</div>
                    <div className="tl-time">23 Mar 2026</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-foot">
              <button className="btn btn-danger btn-sm" onClick={closeModal}>Mark lost</button>
              <button className="btn" onClick={closeModal}>Close</button>
              <button className="btn btn-primary" onClick={closeModal}>Save & update</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}