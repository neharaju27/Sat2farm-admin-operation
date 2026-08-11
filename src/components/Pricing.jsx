import { useState, useEffect } from "react";
import { IndianRupee, Calendar, User, Plus, Trash2 } from "lucide-react";
import toast from 'react-hot-toast';
import "../styles/Sat2FarmAdminPortal.css";

const palette = {
  canvas: '#F5F7F1',
  surface: '#FFFFFF',
  border: '#E2E7DD',
  ink: '#16241C',
  inkSoft: '#5B6B5E',
  pine: '#2F5233',
  growth: '#3D8361',
  amber: '#C98A2C',
};

export default function Pricing({ user, onPageChange }) {
  const [pricingRows, setPricingRows] = useState([
    { id: 1, acres: '', duration: '1-month', actualPrice: 0, discountPercentage: 0, discountAmount: 0, finalPrice: 0 }
  ]);
  const [createdDateTime, setCreatedDateTime] = useState('');

  const displayName = user?.name || user?.fullName || user?.first_name || user?.username || 'User';

  useEffect(() => {
    const now = new Date();
    const formatted = now.toLocaleString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    setCreatedDateTime(formatted);
  }, []);

  const formatCurrency = (num) => {
    return '₹' + (num || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  };

  const calculatePricing = (acres, duration) => {
    if (!acres || acres <= 0) return null;

    const acresNum = parseFloat(acres);
    let baseRatePerAcre = 400;

    if (duration === '1-month') {
      baseRatePerAcre = 400;
    } else if (duration === '6-month') {
      baseRatePerAcre = 800;
    } else if (duration === '12-month') {
      baseRatePerAcre = 1200;
    }

    const actualPrice = acresNum * baseRatePerAcre;

    // Discount % formula: Floor(Min(15 * log10(acres), 70))
    const rawDiscount = Math.floor(Math.min(15 * Math.log10(acresNum), 70));
    const discountPercentage = Math.max(0, rawDiscount);

    const finalPrice = actualPrice * (1 - discountPercentage / 100);
    const discountAmount = actualPrice - finalPrice;

    return {
      actualPrice: Math.round(actualPrice),
      finalPrice: Math.round(finalPrice),
      discountAmount: Math.round(discountAmount),
      discountPercentage: discountPercentage
    };
  };

  const handleRowChange = (id, field, value) => {
    setPricingRows(rows => rows.map(row => {
      if (row.id === id) {
        const updatedRow = { ...row, [field]: value };
        if (field === 'acres' || field === 'duration') {
          const calculated = calculatePricing(
            field === 'acres' ? value : row.acres,
            field === 'duration' ? value : row.duration
          );
          if (calculated) {
            updatedRow.actualPrice = calculated.actualPrice;
            updatedRow.discountPercentage = calculated.discountPercentage;
            updatedRow.discountAmount = calculated.discountAmount;
            updatedRow.finalPrice = calculated.finalPrice;
          } else {
            // acres cleared or invalid — reset everything back to zero
            updatedRow.actualPrice = 0;
            updatedRow.discountPercentage = 0;
            updatedRow.discountAmount = 0;
            updatedRow.finalPrice = 0;
          }
        }
        return updatedRow;
      }
      return row;
    }));
  };

  const addRow = () => {
    const newId = Math.max(...pricingRows.map(r => r.id), 0) + 1;
    setPricingRows([...pricingRows, { id: newId, acres: '', duration: '1-month', actualPrice: 0, discountPercentage: 0, discountAmount: 0, finalPrice: 0 }]);
  };

  const deleteRow = (id) => {
    if (pricingRows.length === 1) {
      toast.error('Cannot delete the last row');
      return;
    }
    setPricingRows(pricingRows.filter(row => row.id !== id));
  };

  return (
    <div className="main-full" style={{ background: palette.canvas, minHeight: '100vh' }}>
      {/* Header */}
      <div className="topbar" style={{
        borderBottom: `1px solid ${palette.border}`,
        background: palette.surface,
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
      }}>
        <div className="tb-left">
          <div className="tb-page" style={{
            fontWeight: 600,
            color: palette.ink,
            fontSize: '16px',
            letterSpacing: '-0.02em'
          }}>Pricing Calculator</div>
        </div>
      </div>

      <div className="content-area">
        <div className="sa-container" style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>

          {/* Created by info */}
          <div style={{
            background: palette.surface,
            borderRadius: '16px',
            padding: '20px 24px',
            marginBottom: '32px',
            border: `1px solid ${palette.border}`,
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: `linear-gradient(135deg, ${palette.pine}20, ${palette.growth}20)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(47, 82, 51, 0.15)',
              flexShrink: 0
            }}>
              <User size={20} color={palette.pine} strokeWidth={2} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: '11px',
                color: palette.inkSoft,
                marginBottom: '4px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                fontWeight: 500
              }}>Created on</div>
              <div style={{
                fontSize: '15px',
                fontWeight: 600,
                color: palette.ink,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Calendar size={16} color={palette.inkSoft} strokeWidth={2} />
                {createdDateTime}
              </div>
              <div style={{
                fontSize: '13px',
                color: palette.inkSoft,
                marginTop: '2px',
                fontWeight: 400
              }}>
                by <span style={{ color: palette.ink, fontWeight: 500 }}>{displayName}</span>
              </div>
            </div>
          </div>

          {/* Pricing Table */}
          <div style={{
            background: palette.surface,
            borderRadius: '16px',
            border: `1px solid ${palette.border}`,
            overflow: 'hidden',
            marginBottom: '32px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)'
          }}>
            {/* Table Header */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1.2fr 1.3fr 1.4fr 1.1fr 1.4fr 0.8fr',
              gap: '1px',
              background: `linear-gradient(135deg, ${palette.pine}, ${palette.growth})`,
              padding: '16px 24px'
            }}>
              <div style={{
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: 600,
                letterSpacing: '0.02em',
                textTransform: 'uppercase'
              }}>Acres</div>
              <div style={{
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: 600,
                letterSpacing: '0.02em',
                textTransform: 'uppercase'
              }}>Duration</div>
              <div style={{
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: 600,
                letterSpacing: '0.02em',
                textTransform: 'uppercase'
              }}>Actual Price</div>
              <div style={{
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: 600,
                letterSpacing: '0.02em',
                textTransform: 'uppercase'
              }}>Discount %</div>
              <div style={{
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: 600,
                letterSpacing: '0.02em',
                textTransform: 'uppercase'
              }}>Final Price</div>
              <div style={{
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: 600,
                letterSpacing: '0.02em',
                textTransform: 'uppercase',
                textAlign: 'center'
              }}>Actions</div>
            </div>

            {/* Table Rows */}
            {pricingRows.map((row, index) => (
              <div
                key={row.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1.2fr 1.3fr 1.4fr 1.1fr 1.4fr 0.8fr',
                  gap: '1px',
                  background: palette.border,
                  padding: '1px',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = `${palette.pine}10`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = palette.border;
                }}
              >
                <div style={{ background: palette.surface, padding: '16px' }}>
                  <input
                    type="number"
                    value={row.acres}
                    onChange={(e) => handleRowChange(row.id, 'acres', e.target.value)}
                    placeholder="0"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      border: `1px solid ${palette.border}`,
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                      background: palette.surface,
                      color: palette.ink,
                      fontWeight: 500,
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = palette.pine;
                      e.target.style.boxShadow = `0 0 0 3px ${palette.pine}20`;
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = palette.border;
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
                <div style={{ background: palette.surface, padding: '16px' }}>
                  <select
                    value={row.duration}
                    onChange={(e) => handleRowChange(row.id, 'duration', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      border: `1px solid ${palette.border}`,
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      backgroundColor: palette.surface,
                      cursor: 'pointer',
                      color: palette.ink,
                      fontWeight: 500,
                      transition: 'all 0.2s ease',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = palette.pine;
                      e.target.style.boxShadow = `0 0 0 3px ${palette.pine}20`;
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = palette.border;
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    <option value="1-month">1 Month</option>
                    <option value="6-month">6 Months</option>
                    <option value="12-month">12 Months</option>
                  </select>
                </div>
                <div style={{
                  background: palette.surface,
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <IndianRupee size={16} color={palette.inkSoft} strokeWidth={2} />
                  <span style={{
                    fontSize: '15px',
                    fontWeight: 600,
                    color: palette.inkSoft,
                    letterSpacing: '-0.01em'
                  }}>
                    {formatCurrency(row.actualPrice)}
                  </span>
                </div>
                <div style={{
                  background: palette.surface,
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  fontWeight: 600,
                  color: palette.growth,
                  fontSize: '15px'
                }}>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: '20px',
                    backgroundColor: `${palette.growth}15`,
                    color: palette.growth,
                    fontSize: '13px',
                    fontWeight: 600
                  }}>
                    {row.discountPercentage}%
                  </span>
                </div>
                <div style={{
                  background: palette.surface,
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <IndianRupee size={16} color={palette.pine} strokeWidth={2.5} />
                  <span style={{
                    fontSize: '16px',
                    fontWeight: 700,
                    color: palette.pine,
                    letterSpacing: '-0.01em'
                  }}>
                    {formatCurrency(row.finalPrice)}
                  </span>
                </div>
                {/* Actions cell */}
                <div style={{
                  background: palette.surface,
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <button
                    onClick={() => deleteRow(row.id)}
                    disabled={pricingRows.length === 1}
                    style={{
                      width: '36px',
                      height: '36px',
                      minWidth: '36px',
                      flexShrink: 0,
                      padding: 0,
                      backgroundColor: pricingRows.length === 1 ? '#f3f4f6' : '#fee2e2',
                      color: pricingRows.length === 1 ? '#9ca3af' : '#dc2626',
                      border: pricingRows.length === 1 ? '1px solid #e5e7eb' : '1px solid #fecaca',
                      borderRadius: '8px',
                      cursor: pricingRows.length === 1 ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: pricingRows.length === 1 ? 0.6 : 1,
                      transition: 'all 0.2s ease',
                      boxShadow: pricingRows.length === 1 ? 'none' : '0 2px 4px rgba(220, 38, 38, 0.1)'
                    }}
                    onMouseEnter={(e) => {
                      if (pricingRows.length > 1) {
                        e.currentTarget.style.backgroundColor = '#fecaca';
                        e.currentTarget.style.transform = 'scale(1.05)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (pricingRows.length > 1) {
                        e.currentTarget.style.backgroundColor = '#fee2e2';
                        e.currentTarget.style.transform = 'scale(1)';
                      }
                    }}
                    title="Delete row"
                  >
                    <Trash2 size={16} strokeWidth={2} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            gap: '16px',
            alignItems: 'center',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={addRow}
              style={{
                padding: '12px 24px',
                backgroundColor: palette.surface,
                color: palette.pine,
                border: `1.5px solid ${palette.pine}`,
                borderRadius: '10px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                transition: 'all 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 2px 8px rgba(47, 82, 51, 0.1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = `${palette.pine}10`;
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(47, 82, 51, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = palette.surface;
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(47, 82, 51, 0.1)';
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <Plus size={18} strokeWidth={2.5} />
              Add Row
            </button>
          </div>

          {/* Summary */}
          {pricingRows.some(row => row.acres && row.acres > 0) && (
            <div style={{
              marginTop: '32px',
              background: palette.surface,
              borderRadius: '16px',
              padding: '28px 32px',
              border: `1px solid ${palette.border}`,
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '24px'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: `linear-gradient(135deg, ${palette.growth}20, ${palette.pine}20)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <IndianRupee size={20} color={palette.pine} strokeWidth={2.5} />
                </div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: 700,
                  color: palette.ink,
                  letterSpacing: '-0.01em',
                  margin: 0
                }}>
                  Pricing Summary
                </h3>
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '24px'
              }}>
                <div style={{
                  background: `${palette.canvas}`,
                  borderRadius: '12px',
                  padding: '20px',
                  border: `1px solid ${palette.border}`
                }}>
                  <div style={{
                    fontSize: '12px',
                    color: palette.inkSoft,
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    fontWeight: 500
                  }}>Total Acres</div>
                  <div style={{
                    fontSize: '24px',
                    fontWeight: 700,
                    color: palette.ink,
                    letterSpacing: '-0.02em'
                  }}>
                    {pricingRows.reduce((sum, row) => sum + (parseFloat(row.acres) || 0), 0).toLocaleString()}
                  </div>
                </div>

                <div style={{
                  background: `${palette.canvas}`,
                  borderRadius: '12px',
                  padding: '20px',
                  border: `1px solid ${palette.border}`
                }}>
                  <div style={{
                    fontSize: '12px',
                    color: palette.inkSoft,
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    fontWeight: 500
                  }}>Total Actual Price</div>
                  <div style={{
                    fontSize: '24px',
                    fontWeight: 700,
                    color: palette.inkSoft,
                    letterSpacing: '-0.02em',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    {formatCurrency(pricingRows.reduce((sum, row) => sum + (row.actualPrice || 0), 0))}
                  </div>
                </div>

                <div style={{
                  background: `${palette.canvas}`,
                  borderRadius: '12px',
                  padding: '20px',
                  border: `1px solid ${palette.border}`
                }}>
                  <div style={{
                    fontSize: '12px',
                    color: palette.inkSoft,
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    fontWeight: 500
                  }}>Total Discount</div>
                  <div style={{
                    fontSize: '24px',
                    fontWeight: 700,
                    color: palette.amber,
                    letterSpacing: '-0.02em',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    {formatCurrency(pricingRows.reduce((sum, row) => sum + (row.discountAmount || 0), 0))}
                  </div>
                </div>

                <div style={{
                  background: `${palette.canvas}`,
                  borderRadius: '12px',
                  padding: '20px',
                  border: `1px solid ${palette.border}`
                }}>
                  <div style={{
                    fontSize: '12px',
                    color: palette.inkSoft,
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    fontWeight: 500
                  }}>Total Final Price</div>
                  <div style={{
                    fontSize: '24px',
                    fontWeight: 700,
                    color: palette.growth,
                    letterSpacing: '-0.02em',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    {formatCurrency(pricingRows.reduce((sum, row) => sum + (row.finalPrice || 0), 0))}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}