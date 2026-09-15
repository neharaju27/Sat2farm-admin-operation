import React, { useCallback } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { KanbanDndProvider } from './KanbanDndContext';
import KanbanColumnDropZone from './KanbanColumnDropZone';
import KanbanDraggableCard from './KanbanDraggableCard';
import { KANBAN_COLUMNS } from './constants';

const cardStyle = {
  background: 'white',
  border: '1px solid #e0e0e0',
  borderRadius: '6px',
  padding: '12px',
  marginBottom: '10px',
  minHeight: '90px',
  transition: 'box-shadow 0.2s ease, background-color 0.2s ease',
  cursor: 'pointer',
};

const dropZoneStyle = {
  padding: '12px',
  overflowY: 'auto',
  paddingBottom: '40px',
  flex: 1,
  minHeight: 0,
};

const KanbanSkeletonCard = () => (
  <div className="skeleton-card">
    <div className="skeleton-shimmer" style={{ height: '14px', width: '75%', marginBottom: '10px' }} />
    <div className="skeleton-shimmer" style={{ height: '12px', width: '45%', marginBottom: '12px' }} />
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div className="skeleton-shimmer" style={{ height: '11px', width: '35%' }} />
      <div className="skeleton-shimmer" style={{ height: '11px', width: '25%' }} />
    </div>
  </div>
);

export default function SalesPipelineKanbanBoard({
  filteredKanbanDeals,
  kanbanDeals,
  collapsedStages,
  setCollapsedStages,
  columnWidths,
  setColumnWidths,
  onDealMove,
  onDealClick,
  stageTotals = {},
  stageValues = {},
  isSearching = false,
  salesFiltersApplied = false,
  onLoadMoreStage,
  loadingMoreStages = {},
  isDealsLoading = false
}) {
  const getDealsForColumn = useCallback(
    (columnId) => {
      const column = KANBAN_COLUMNS.find((entry) => entry.id === columnId);
      if (!column) {
        return [];
      }

      if (column.useFiltered) {
        return filteredKanbanDeals[column.stage] || [];
      }

      return kanbanDeals[column.stage] || [];
    },
    [filteredKanbanDeals, kanbanDeals],
  );

  const getColumnDeals = (column) =>
    column.useFiltered
      ? filteredKanbanDeals[column.stage] || []
      : kanbanDeals[column.stage] || [];

  const handleColumnScroll = (stage, e) => {
    const { scrollTop, clientHeight, scrollHeight } = e.target;
    if (scrollTop + clientHeight >= scrollHeight - 60) {
      if (onLoadMoreStage) {
        onLoadMoreStage(stage);
      }
    }
  };

  return (
    <KanbanDndProvider getDealsForColumn={getDealsForColumn} onDealMove={onDealMove}>
      <div
        style={{
          flex: 1,
          maxHeight: 'calc(100vh - 200px)',
          overflowX: 'auto',
          overflowY: 'hidden',
          padding: '20px',
          background: '#f5f5f5',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: '12px',
            minWidth: 'fit-content',
            height: '100%',
            alignItems: 'flex-start',
          }}
        >
          {KANBAN_COLUMNS.map((column) => {
            const deals = getColumnDeals(column);
            const calculatedValue = deals.reduce(
              (sum, deal) => sum + (parseFloat(deal.deal_amount) || 0),
              0,
            );
            const isSearchingOrFiltered = isSearching || salesFiltersApplied;
            const totalStageCount = isSearchingOrFiltered
              ? deals.length
              : (stageTotals[column.stage] !== undefined ? stageTotals[column.stage] : deals.length);
            const totalValue = (!isSearchingOrFiltered && stageValues[column.stage] !== undefined)
              ? stageValues[column.stage]
              : calculatedValue;

            return (
              <div
                key={column.id}
                style={{
                  width: columnWidths[column.id] || '250px',
                  background: 'white',
                  borderRadius: '8px',
                  border: '1px solid #e0e0e0',
                  display: 'flex',
                  flexDirection: 'column',
                  maxHeight: 'calc(100vh - 200px)',
                  minHeight: 0,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    padding: '14px 16px',
                    borderBottom: '1px solid #e0e0e0',
                    background: '#f8f9fa',
                    borderTopLeftRadius: '8px',
                    borderTopRightRadius: '8px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '8px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                      <button
                        onClick={() =>
                          setCollapsedStages((prev) => ({
                            ...prev,
                            [column.id]: !prev[column.id],
                          }))
                        }
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '4px',
                          borderRadius: '4px',
                          color: '#666',
                        }}
                      >
                        {collapsedStages[column.id] ? (
                          <ChevronRight size={16} />
                        ) : (
                          <ChevronDown size={16} />
                        )}
                      </button>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: '#333', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {column.title}
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: '12px',
                        background: '#e0e0e0',
                        color: '#333',
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontWeight: '600',
                        flexShrink: 0
                      }}
                    >
                      {isDealsLoading ? (
                        <span className="skeleton-shimmer" style={{ display: 'inline-block', width: '20px', height: '12px', borderRadius: '4px' }} />
                      ) : (
                        totalStageCount
                      )}
                    </span>
                  </div>
                  {!collapsedStages[column.id] && (
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '12px',
                        color: '#666',
                      }}
                    >
                      <span>Total Value</span>
                      {isDealsLoading ? (
                        <div className="skeleton-shimmer" style={{ width: '60px', height: '14px', borderRadius: '4px' }} />
                      ) : (
                        <span style={{ fontWeight: '600', color: '#14B474' }}>
                          ₹{totalValue.toLocaleString()}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {!collapsedStages[column.id] && (
                  <KanbanColumnDropZone
                    columnId={column.id}
                    style={dropZoneStyle}
                    onScroll={(e) => handleColumnScroll(column.stage, e)}
                  >
                    {isDealsLoading ? (
                      <>
                        <KanbanSkeletonCard />
                        <KanbanSkeletonCard />
                        <KanbanSkeletonCard />
                      </>
                    ) : (
                      deals.map((deal) => (
                        <KanbanDraggableCard
                          key={deal.deal_id || deal.id}
                          dealId={deal.deal_id || deal.id}
                          columnId={column.id}
                          style={{ ...cardStyle, overflow: 'hidden' }}
                          onClick={() => onDealClick(deal)}
                        >
                          <div
                            style={{
                              fontSize: '13px',
                              fontWeight: '600',
                              color: '#333',
                              marginBottom: '6px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              wordBreak: 'break-word'
                            }}
                            title={deal.deal_name}
                          >
                            {deal.deal_name}
                          </div>
                          <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {deal.deal_type}
                          </div>
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                            }}
                          >
                            <span style={{ fontSize: '11px', color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{deal.deal_owner}</span>
                            <span
                              style={{
                                fontSize: '11px',
                                color: '#14B474',
                                fontWeight: '600',
                                flexShrink: 0
                              }}
                            >
                              ₹{parseFloat(deal.deal_amount || 0).toLocaleString()}
                            </span>
                          </div>
                        </KanbanDraggableCard>
                      ))
                    )}
                    {loadingMoreStages[column.stage] && (
                      <div style={{ textAlign: 'center', padding: '8px', fontSize: '12px', color: '#6b7280' }}>
                        Loading more deals...
                      </div>
                    )}
                  </KanbanColumnDropZone>
                )}

                <div
                  style={{
                    width: '5px',
                    maxHeight: 'calc(100vh - 200px)',
                    minHeight: 0,
                    position: 'absolute',
                    right: 0,
                    top: 0,
                    cursor: 'col-resize',
                    background: 'transparent',
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    const startX = e.clientX;
                    const startWidth = columnWidths[column.id] || 320;

                    const handleMouseMove = (moveEvent) => {
                      const diff = moveEvent.clientX - startX;
                      const newWidth = Math.max(250, Math.min(500, startWidth + diff));
                      setColumnWidths((prev) => ({ ...prev, [column.id]: newWidth }));
                    };

                    const handleMouseUp = () => {
                      document.removeEventListener('mousemove', handleMouseMove);
                      document.removeEventListener('mouseup', handleMouseUp);
                    };

                    document.addEventListener('mousemove', handleMouseMove);
                    document.addEventListener('mouseup', handleMouseUp);
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </KanbanDndProvider>
  );
}
