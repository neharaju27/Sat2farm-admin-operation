import React, { useState, useMemo } from 'react';
import { X, ClipboardCheck, ChevronDown, Star, TrendingUp, Award } from 'lucide-react';

// ────────────────────────────────────────────────────────────────────────────
// Sat2Farm Distributor / Channel Partner Scorecard
// Standalone component — import into LeadPipeline.jsx and render it as part
// of (or instead of) the existing "Convert" modal.
//
// Usage:
//   import DistributorScorecard from './DistributorScorecard';
//   <DistributorScorecard
//     isOpen={showScorecardModal}
//     onClose={() => setShowScorecardModal(false)}
//     leadName={selectedLead?.contactName}
//     onSave={(result) => {
//       // result = { answers, totalWeightedScore, overallPercent, rows }
//       console.log(result);
//     }}
//   />
// ────────────────────────────────────────────────────────────────────────────

// Each criterion has: key, label, weight (as decimal), and options.
// Options are the exact score definitions from the sheet — value 1-3.
const SCORECARD_LAYERS = [
  {
    id: 'layer1',
    title: 'LAYER 1 — Can they buy? (Deal qualification)',
    color: '#93a4c9', // matches the blue-grey band in the sheet
    criteria: [
      {
        key: 'committedFirstPayment',
        label: 'Committed first payment',
        weight: 0.15,
        options: [
          { value: 1, label: 'Trial (<25k)' },
          { value: 2, label: 'Starter (25–75k)' },
          { value: 3, label: 'Growth and Enterprise (>75k)' }
        ]
      },
      {
        key: 'capitalCreditworthiness',
        label: 'Capital / creditworthiness for upfront buy',
        weight: 0.15,
        options: [
          { value: 1, label: 'Looking for govt grant / contracts' },
          { value: 2, label: 'Revenue sharing' },
          { value: 3, label: 'Upfront pay' }
        ]
      },
      {
        key: 'decisionAuthority',
        label: 'Decision authority & internal champion',
        weight: 0.10,
        options: [
          { value: 1, label: 'Procurement staffer with no real authority' },
          { value: 2, label: 'Influences decision but needs sign-off' },
          { value: 3, label: 'Owner-operator (full authority)' }
        ]
      }
    ]
  },
  {
    id: 'layer2',
    title: 'LAYER 2 — Can they sell through to farmers? (Channel capability)',
    color: '#8fbf8f', // matches the green band in the sheet
    criteria: [
      {
        key: 'farmerTrustReach',
        label: 'Existing farmer trust & reach',
        weight: 0.25,
        options: [
          {
            value: 1,
            label: 'Weak',
            description: 'No real existing relationship, or purely transactional/occasional contact with no dependency. Farmers shop around freely and have no reason to prefer them.'
          },
          {
            value: 2,
            label: 'Moderate',
            description: 'Repeat relationship with a decent base, but reach is narrow (one village/crop) or the touchpoint is single-purpose e.g. just credit, or just equipment without broader trust/dependency.'
          },
          {
            value: 3,
            label: 'Strong',
            description: 'Farmers rely on them for something recurring and hard to substitute — credit, market access, or agronomic support.'
          }
        ]
      },
      {
        key: 'fieldExtensionCapacity',
        label: 'Field / extension capacity',
        weight: 0.15,
        options: [
          { value: 1, label: 'Just looking for another partners/dealers' },
          { value: 2, label: 'Willing to do in future' },
          { value: 3, label: 'Existing agronomists / field staff who can demo & explain a data product' }
        ]
      },
      {
        key: 'trackRecordValueAdded',
        label: 'Track record selling non-physical / value-added services',
        weight: 0.15,
        options: [
          { value: 1, label: 'Physical product' },
          { value: 2, label: 'Advisories' },
          { value: 3, label: 'Existing app' }
        ]
      },
      {
        key: 'exclusivityCommitment',
        label: 'Exclusivity / territory commitment requested',
        weight: 0.05,
        options: [
          { value: 1, label: 'No exclusivity / territory requested' },
          { value: 2, label: 'Soft preference for exclusivity' },
          { value: 3, label: 'Firm exclusivity / territory commitment requested' }
        ]
      }
    ]
  }
];

const FLAT_CRITERIA = SCORECARD_LAYERS.flatMap(l => l.criteria);
const MAX_WEIGHTED_TOTAL = FLAT_CRITERIA.reduce((sum, c) => sum + c.weight * 3, 0);

export default function DistributorScorecard({ isOpen, onClose, onSave, leadName }) {
  const [answers, setAnswers] = useState({}); // { [criterionKey]: { value, notes } }
  const [openDropdown, setOpenDropdown] = useState(null);

  const setScore = (key, value) => {
    setAnswers(prev => ({ ...prev, [key]: { ...prev[key], value } }));
    setOpenDropdown(null);
  };

  const setNotes = (key, notes) => {
    setAnswers(prev => ({ ...prev, [key]: { ...prev[key], notes } }));
  };

  const rows = useMemo(() => {
    return FLAT_CRITERIA.map(c => {
      const score = answers[c.key]?.value || 0;
      return {
        ...c,
        score,
        weightedScore: score ? +(score * c.weight).toFixed(4) : 0
      };
    });
  }, [answers]);

  const totalWeightedScore = useMemo(
    () => +rows.reduce((sum, r) => sum + r.weightedScore, 0).toFixed(2),
    [rows]
  );

  const overallPercent = useMemo(
    () => Math.round((totalWeightedScore / MAX_WEIGHTED_TOTAL) * 100),
    [totalWeightedScore]
  );

  const allAnswered = FLAT_CRITERIA.every(c => answers[c.key]?.value);

  if (!isOpen) return null;

  const getScoreBadge = (pct) => {
    if (pct >= 70) return { color: 'bg-green-100 text-green-700', icon: Award, label: 'Excellent' };
    if (pct >= 40) return { color: 'bg-amber-100 text-amber-700', icon: Star, label: 'Good' };
    return { color: 'bg-red-100 text-red-700', icon: TrendingUp, label: 'Needs Improvement' };
  };

  const scoreBadge = getScoreBadge(overallPercent);
  const ScoreIcon = scoreBadge.icon;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="bg-white border border-gray-200 rounded-2xl w-[900px] max-w-[95%] max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100 flex-shrink-0">
          <div className="flex justify-between items-start p-6">
            <div className="flex gap-3 items-start">
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-2.5 rounded-xl shadow-lg">
                <ClipboardCheck size={24} className="text-white" />
              </div>
              <div>
                <h2 className="m-0 text-xl font-bold text-gray-900 tracking-tight">
                  Distributor / Channel Partner Scorecard
                </h2>
                {leadName && (
                  <p className="mt-1.5 text-sm text-gray-600 flex items-center gap-2">
                    <span className="text-gray-400">Evaluating:</span>
                    <span className="font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">{leadName}</span>
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="bg-white/80 hover:bg-white border border-gray-200 text-gray-500 hover:text-gray-700 cursor-pointer p-2 rounded-lg transition-all shadow-sm hover:shadow-md"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-gray-50/50 to-white">
          <table className="w-full border-separate border-spacing-0 text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-gray-100 to-gray-50">
                <th className="px-3 py-3 text-left font-semibold text-gray-800 w-[30%] tracking-wide">Criterion</th>
                <th className="px-3 py-3 text-center font-semibold text-gray-800 w-[10%] tracking-wide">Weight</th>
                <th className="px-3 py-3 text-left font-semibold text-gray-800 w-[28%] tracking-wide">Score (1–3)</th>
                <th className="px-3 py-3 text-center font-semibold text-gray-800 w-[10%] tracking-wide">Weighted</th>
                <th className="px-3 py-3 text-left font-semibold text-gray-800 w-[22%] tracking-wide">Evidence / Notes</th>
              </tr>
            </thead>
            <tbody>
              {SCORECARD_LAYERS.map(layer => (
                <React.Fragment key={layer.id}>
                  <tr>
                    <td
                      colSpan={5}
                      className="px-3 py-3 text-white font-bold text-xs tracking-widest uppercase"
                      style={{ background: `linear-gradient(135deg, ${layer.color}, ${layer.color}dd)` }}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-4 bg-white/50 rounded-full"></div>
                        {layer.title}
                      </div>
                    </td>
                  </tr>
                  {layer.criteria.map(c => {
                    const current = answers[c.key] || {};
                    const selectedOption = c.options.find(o => o.value === current.value);
                    return (
                      <tr key={c.key} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                        <td className="px-3 py-3 text-gray-700 font-medium">{c.label}</td>
                        <td className="px-3 py-3 text-center">
                          <span className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded-lg text-xs font-semibold">
                            {Math.round(c.weight * 100)}%
                          </span>
                        </td>
                        <td className="px-2 py-3 relative">
                          <div
                            data-scorecard-dropdown
                            onClick={() => setOpenDropdown(openDropdown === c.key ? null : c.key)}
                            className={`flex items-center justify-between w-full px-3 py-2 border cursor-pointer text-xs min-h-[36px] transition-all duration-200 ${
                              current.value
                                ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-300 text-gray-900 shadow-sm'
                                : 'bg-white border-gray-300 text-gray-400 hover:border-emerald-300'
                            } rounded-lg`}
                          >
                            <span className="font-medium">
                              {selectedOption ? `${selectedOption.value} — ${selectedOption.label}` : 'Select score...'}
                            </span>
                            <ChevronDown size={14} className={`transition-transform duration-200 ${openDropdown === c.key ? 'rotate-180' : ''}`} />
                          </div>

                          {openDropdown === c.key && (
                            <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-xl z-[1000] mt-2 max-h-[250px] overflow-y-auto">
                              {c.options.map(opt => (
                                <div
                                  key={opt.value}
                                  onClick={() => setScore(c.key, opt.value)}
                                  title={opt.description || ''}
                                  className={`px-3 py-2.5 cursor-pointer text-xs text-gray-900 border-b border-gray-100 transition-all ${
                                    current.value === opt.value ? 'bg-emerald-50 border-l-4 border-l-emerald-500' : 'hover:bg-gray-50'
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                      current.value === opt.value ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-600'
                                    }`}>
                                      {opt.value}
                                    </span>
                                    <span className="font-semibold">{opt.label}</span>
                                  </div>
                                  {opt.description && (
                                    <div className="text-[11px] text-gray-500 mt-1.5 pl-7 leading-relaxed">
                                      {opt.description}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span className={`inline-block px-2 py-1 rounded-lg text-xs font-bold ${
                            current.value ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-400'
                          }`}>
                            {current.value ? (c.weight * current.value).toFixed(2) : '—'}
                          </span>
                        </td>
                        <td className="px-2 py-3">
                          <input
                            type="text"
                            value={current.notes || ''}
                            onChange={(e) => setNotes(c.key, e.target.value)}
                            placeholder="Add evidence..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs bg-white text-gray-900 min-h-[36px] focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all placeholder:text-gray-400"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </React.Fragment>
              ))}
              <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                <td className="px-3 py-4 font-bold text-gray-900">TOTAL</td>
                <td className="px-3 py-4 text-center">
                  <span className="inline-block bg-gray-800 text-white px-2 py-1 rounded-lg text-xs font-bold">100%</span>
                </td>
                <td className="px-3 py-4"></td>
                <td className="px-3 py-4 text-center">
                  <span className="inline-block bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-md">
                    {totalWeightedScore.toFixed(2)}
                  </span>
                </td>
                <td className="px-3 py-4"></td>
              </tr>
              <tr className="bg-gradient-to-r from-emerald-50 to-teal-50">
                <td className="px-3 py-4 font-bold text-gray-900" colSpan={3}>
                  <div className="flex items-center gap-2">
                    <ScoreIcon size={16} className="text-emerald-600" />
                    Overall score (% of max)
                  </div>
                </td>
                <td colSpan={2} className="px-3 py-4">
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold shadow-lg ${scoreBadge.color}`}>
                    <ScoreIcon size={18} />
                    {overallPercent}%
                    <span className="text-xs font-normal opacity-75">— {scoreBadge.label}</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          {!allAnswered && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2">
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
              <p className="text-xs text-amber-800 font-medium">
                Complete all {FLAT_CRITERIA.length} criteria to finalize the scorecard
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-5 border-t border-gray-200 flex-shrink-0 bg-gradient-to-r from-gray-50 to-white">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl cursor-pointer text-sm font-medium hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm hover:shadow"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (!onSave) return;
              onSave({
                answers,
                rows,
                totalWeightedScore,
                overallPercent
              });
            }}
            disabled={!allAnswered}
            className={`px-6 py-2.5 text-white border-none rounded-xl text-sm font-medium transition-all shadow-lg flex items-center gap-2 ${
              allAnswered
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 cursor-pointer hover:shadow-xl'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            {allAnswered && <ClipboardCheck size={16} />}
            Save Scorecard
          </button>
        </div>
      </div>
    </div>
  );
}

function scoreColor(pct) {
  if (pct >= 70) return '#16a34a';
  if (pct >= 40) return '#d97706';
  return '#dc2626';
}