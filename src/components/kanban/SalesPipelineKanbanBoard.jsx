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
  transition: 'box-shadow 0.2s ease',
};

const dropZoneStyle = {
  padding: '12px',
  overflowY: 'auto',
  paddingBottom: '40px',
  flex: 1,
  minHeight: 0,
};

export default function SalesPipelineKanbanBoard({
  filteredKanbanDeals,
  kanbanDeals,
  collapsedStages,
  setCollapsedStages,
  columnWidths,
  setColumnWidths,
  onDealMove,
  onDealClick,
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
            const totalValue = deals.reduce(
              (sum, deal) => sum + (parseFloat(deal.deal_amount) || 0),
              0,
            );

            return (
              <div
                key={column.id}
                style={{
                  width: columnWidths[column.id] || '200px',
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                      <span style={{ fontSize: '14px', fontWeight: '600', color: '#333' }}>
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
                      }}
                    >
                      {deals.length}
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
                      <span style={{ fontWeight: '600', color: '#14B474' }}>
                        ₹{totalValue.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>

                {!collapsedStages[column.id] && (
                  <KanbanColumnDropZone columnId={column.id} style={dropZoneStyle}>
                    {deals.map((deal) => (
                      <KanbanDraggableCard
                        key={deal.deal_id}
                        dealId={deal.deal_id}
                        columnId={column.id}
                        style={cardStyle}
                      >
                        <div
                          style={{
                            fontSize: '13px',
                            fontWeight: '600',
                            color: '#333',
                            marginBottom: '6px',
                            cursor: 'pointer',
                            transition: 'color 0.2s ease',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = '#3b82f6';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = '#333';
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onDealClick(deal);
                          }}
                        >
                          {deal.deal_name}
                        </div>
                        <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                          {deal.deal_type}
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <span style={{ fontSize: '11px', color: '#888' }}>{deal.deal_owner}</span>
                          <span
                            style={{
                              fontSize: '11px',
                              color: '#14B474',
                              fontWeight: '600',
                            }}
                          >
                            ₹{parseFloat(deal.deal_amount || 0).toLocaleString()}
                          </span>
                        </div>
                      </KanbanDraggableCard>
                    ))}
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
