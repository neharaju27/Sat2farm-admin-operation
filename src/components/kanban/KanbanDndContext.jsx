import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import invariant from 'tiny-invariant';
import { extractClosestEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import { getReorderDestinationIndex } from '@atlaskit/pragmatic-drag-and-drop-hitbox/util/get-reorder-destination-index';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';

const KanbanDndContext = createContext(null);

export function useKanbanDnd() {
  const context = useContext(KanbanDndContext);
  invariant(context, 'useKanbanDnd must be used within KanbanDndProvider');
  return context;
}

export function KanbanDndProvider({ getDealsForColumn, onDealMove, children }) {
  const [instanceId] = useState(() => Symbol('kanban-instance-id'));
  const getDealsRef = useRef(getDealsForColumn);
  const onMoveRef = useRef(onDealMove);

  useEffect(() => {
    getDealsRef.current = getDealsForColumn;
  }, [getDealsForColumn]);

  useEffect(() => {
    onMoveRef.current = onDealMove;
  }, [onDealMove]);

  useEffect(() => {
    return combine(
      monitorForElements({
        canMonitor({ source }) {
          return source.data.instanceId === instanceId;
        },
        onDrop({ location, source }) {
          document.body.style.cursor = 'default';

          if (!location.current.dropTargets.length) {
            return;
          }

          if (source.data.type !== 'card') {
            return;
          }

          const itemId = source.data.itemId;
          invariant(typeof itemId === 'string');

          const sourceColumnId = source.data.columnId;
          invariant(typeof sourceColumnId === 'string');

          const sourceDeals = getDealsRef.current(sourceColumnId);
          const itemIndex = sourceDeals.findIndex(
            (deal) => deal.deal_id.toString() === itemId,
          );

          if (itemIndex === -1) {
            return;
          }

          if (location.current.dropTargets.length === 1) {
            const [destinationColumnRecord] = location.current.dropTargets;
            const destinationColumnId = destinationColumnRecord.data.columnId;
            invariant(typeof destinationColumnId === 'string');

            if (sourceColumnId === destinationColumnId) {
              const destinationIndex = getReorderDestinationIndex({
                startIndex: itemIndex,
                indexOfTarget: sourceDeals.length - 1,
                closestEdgeOfTarget: null,
                axis: 'vertical',
              });

              onMoveRef.current({
                dealId: itemId,
                sourceColumnId,
                destinationColumnId,
                sourceIndex: itemIndex,
                destinationIndex,
              });
              return;
            }

            onMoveRef.current({
              dealId: itemId,
              sourceColumnId,
              destinationColumnId,
              sourceIndex: itemIndex,
              destinationIndex: 0,
            });
            return;
          }

          if (location.current.dropTargets.length === 2) {
            const [destinationCardRecord, destinationColumnRecord] =
              location.current.dropTargets;
            const destinationColumnId = destinationColumnRecord.data.columnId;
            invariant(typeof destinationColumnId === 'string');

            const destinationDeals = getDealsRef.current(destinationColumnId);
            const indexOfTarget = destinationDeals.findIndex(
              (deal) => deal.deal_id.toString() === destinationCardRecord.data.itemId,
            );
            const closestEdgeOfTarget = extractClosestEdge(destinationCardRecord.data);

            if (sourceColumnId === destinationColumnId) {
              const destinationIndex = getReorderDestinationIndex({
                startIndex: itemIndex,
                indexOfTarget,
                closestEdgeOfTarget,
                axis: 'vertical',
              });

              onMoveRef.current({
                dealId: itemId,
                sourceColumnId,
                destinationColumnId,
                sourceIndex: itemIndex,
                destinationIndex,
              });
              return;
            }

            const destinationIndex =
              closestEdgeOfTarget === 'bottom' ? indexOfTarget + 1 : indexOfTarget;

            onMoveRef.current({
              dealId: itemId,
              sourceColumnId,
              destinationColumnId,
              sourceIndex: itemIndex,
              destinationIndex,
            });
          }
        },
      }),
    );
  }, [instanceId]);

  const value = useMemo(() => ({ instanceId }), [instanceId]);

  return (
    <KanbanDndContext.Provider value={value}>{children}</KanbanDndContext.Provider>
  );
}
