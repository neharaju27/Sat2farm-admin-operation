import { useState, useEffect } from "react";

/* =========================
   CONSTANTS
========================= */
const API_BASE = "http://127.0.0.1:8000";

const COLUMN_META = [
  { id: "new", title: "New inquiry" },
  { id: "contacted", title: "Contacted" },
  { id: "demo", title: "Demo booked" },
  { id: "proposal", title: "Proposal sent" },
  { id: "negotiation", title: "Negotiation" },
  { id: "won", title: "Won" },
  { id: "lost", title: "Lost" }
];

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'mine', label: 'Mine' },
  { key: 'hot', label: 'Hot leads' },
  { key: 'stale', label: 'Stale >7d' },
  { key: 'demo', label: 'Demo booked' },
];

/* =========================
   CARD
========================= */
function KanbanCard({ card, onClick }) {
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
    <div style={cardStyle} onClick={card.lost ? undefined : onClick}>
      {/* Card header row — only when hot or stale badge needed */}
      {(card.hot || card.stale) && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)' }}>{card.full_name}</div>
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
          {card.full_name}
        </div>
      )}

      <div style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 6 }}>
        {card.city}{card.country ? `, ${card.country}` : ''}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {card.lost ? (
          <span style={{ fontSize: 10, color: 'var(--red-600)' }}>{card.lostReason || 'Lost'}</span>
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
                background: 'var(--green-200)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 8,
                color: 'var(--green-800)',
                fontWeight: 500,
              }}
            >
              {card.owner || '—'}
            </span>
          </>
        )}
      </div>
    </div>
  );
}

/* =========================
   COLUMN
========================= */
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
        maxHeight: 'calc(100vh - 280px)'
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
        {column.cards.map((card) => (
          <KanbanCard key={card.id} card={card} onClick={() => onCardClick(card)} />
        ))}
      </div>
    </div>
  );
}

/* =========================
   MAIN COMPONENT
========================= */
export default function LeadPipeline() {

  const [columns, setColumns] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLead, setSelectedLead] = useState(null);
  const [moveToStage, setMoveToStage] = useState("");
  const [loading, setLoading] = useState(true);

  /* =========================
     LOAD DATA
  ========================= */
  const loadLeads = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${API_BASE}/leads/`);
      const data = await res.json();

      const grouped = {
        new: [],
        contacted: [],
        demo: [],
        proposal: [],
        negotiation: [],
        won: [],
        lost: []
      };

      data.forEach((lead) => {
        const status = (lead.status || "new").toLowerCase().trim();

        const card = {
          id: lead.id,
          full_name: lead.full_name,
          city: lead.city,
          country: lead.country,
          phone: lead.phone,
          email: lead.email,
          company_name: lead.company_name,
          ac: lead.area ? `~${lead.area} ac` : '—',
          status: status,
          won: status === "won",
          lost: status === "lost"
        };

        if (grouped[status]) {
          grouped[status].push(card);
        }
      });

      const formatted = COLUMN_META.map(col => ({
        ...col,
        count: grouped[col.id].length,
        cards: grouped[col.id]
      }));

      setColumns(formatted);
    } catch (err) {
      console.error("Error loading leads:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, []);

  /* =========================
     UPLOAD CSV
  ========================= */
  const uploadCSV = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      await fetch(`${API_BASE}/upload-csv/`, {
        method: "POST",
        body: formData
      });

      alert("CSV Uploaded!");
      loadLeads();
    } catch (err) {
      console.error("Upload error:", err);
      alert("Failed to upload CSV.");
    }
    e.target.value = '';
  };

  /* =========================
     UPDATE STATUS
  ========================= */
  const updateStatus = async () => {
    if (!selectedLead || !moveToStage) return;

    try {
      await fetch(`${API_BASE}/update-status/?id=${selectedLead.id}&new_status=${moveToStage}`, {
        method: "PUT"
      });

      setSelectedLead(null);
      loadLeads();
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update status.");
    }
  };

  /* =========================
     COMPUTED METRICS
  ========================= */
  const totalLeads = columns.reduce((sum, col) => sum + col.count, 0);
  const totalAcreage = columns.reduce((sum, col) => {
    return sum + col.cards.reduce((s, card) => {
      const num = parseInt((card.ac || '').replace(/[^0-9]/g, ''), 10);
      return s + (isNaN(num) ? 0 : num);
    }, 0);
  }, 0);
  const wonCount = columns.find((c) => c.id === 'won')?.count || 0;
  const conversionRate = totalLeads > 0 ? Math.round((wonCount / totalLeads) * 100) : 0;

  /* =========================
     UI
  ========================= */
  return (
    <div style={{ padding: '28px 28px 40px', background: 'var(--bg)', minHeight: '100vh' }}>

      {/* HEADER */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 500 }}>Lead pipeline</div>

        <div style={{ display: 'flex', gap: 8 }}>
          <input type="file" hidden id="csvFile" onChange={uploadCSV} />
          <label htmlFor="csvFile" className="btn-upload-csv">
            📁 Upload CSV
          </label>
        </div>
      </div>

      {/* METRICS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 12, marginBottom: 22 }}>
        {[
          { label: 'Total leads', val: String(totalLeads), sub: `Across ${columns.length} stages`, accent: true },
          { label: 'Pipeline value (ac)', val: totalAcreage.toLocaleString(), sub: 'Potential acreage' },
          { label: 'Conversion rate', val: `${conversionRate}%`, sub: `${wonCount} won of ${totalLeads}`, subColor: conversionRate > 20 ? 'var(--green-600)' : undefined },
          { label: 'Avg. deal cycle', val: '—', sub: 'Inquiry → close' },
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

      {/* FILTER ROW */}
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

      {/* KANBAN */}
      <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8, minHeight: 420 }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', color: 'var(--text-3)', fontSize: 13 }}>
            Loading leads...
          </div>
        ) : (
          columns.map(col => (
            <KanbanColumn
              key={col.id}
              column={col}
              onCardClick={(card) => {
                setSelectedLead(card);
                setMoveToStage(card.status || "new");
              }}
            />
          ))
        )}
      </div>

      {/* MODAL */}
      {selectedLead && (
        <div className="modal-bg active" onClick={() => setSelectedLead(null)}>
          <div className="modal" style={{ width: '540px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <div className="modal-title">{selectedLead.full_name}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-3)', marginTop: '2px' }}>
                  {selectedLead.company_name || "No company"} · {selectedLead.ac}
                </div>
              </div>
              <button className="modal-close" onClick={() => setSelectedLead(null)}>×</button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                <span className="badge badge-blue" style={{ textTransform: 'capitalize' }}>{selectedLead.status}</span>
                <span style={{ fontSize: '11px', color: 'var(--text-3)', padding: '3px 0' }}>
                  Owner: {selectedLead.owner || "Unassigned"}
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
                <div>
                  <div style={{ fontSize: '10px', color: 'var(--text-3)', marginBottom: '2px' }}>Name</div>
                  <div style={{ fontSize: '12px', fontWeight: 500 }}>{selectedLead.full_name}</div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', color: 'var(--text-3)', marginBottom: '2px' }}>Company</div>
                  <div style={{ fontSize: '12px', fontWeight: 500 }}>{selectedLead.company_name || '—'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', color: 'var(--text-3)', marginBottom: '2px' }}>Est. acreage</div>
                  <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--green-700)' }}>
                    {selectedLead.ac}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', color: 'var(--text-3)', marginBottom: '2px' }}>Location</div>
                  <div style={{ fontSize: '12px' }}>{selectedLead.city}{selectedLead.country ? `, ${selectedLead.country}` : ''}</div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', color: 'var(--text-3)', marginBottom: '2px' }}>Phone</div>
                  <div style={{ fontSize: '12px' }}>{selectedLead.phone || '—'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', color: 'var(--text-3)', marginBottom: '2px' }}>Email</div>
                  <div style={{ fontSize: '12px' }}>{selectedLead.email || '—'}</div>
                </div>
              </div>

              {/* Move to stage */}
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label>Move to stage</label>
                <select
                  value={moveToStage}
                  onChange={(e) => setMoveToStage(e.target.value)}
                >
                  {COLUMN_META.map((col) => (
                    <option key={col.id} value={col.id}>
                      {col.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label>Add note / update</label>
                <textarea placeholder="Latest update, next steps..."></textarea>
              </div>
            </div>
            <div className="modal-foot">
              <button className="btn btn-danger btn-sm" onClick={() => { setMoveToStage('lost'); setTimeout(updateStatus, 0) }}>Mark lost</button>
              <button className="btn" onClick={() => setSelectedLead(null)}>Close</button>
              <button className="btn btn-primary" onClick={updateStatus}>Save & update</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}