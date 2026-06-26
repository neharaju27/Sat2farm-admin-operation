import React, { useEffect, useRef, useState } from 'react';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import { draggable, dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { attachClosestEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import { useKanbanDnd } from './KanbanDndContext';

export default function KanbanDraggableCard({ dealId, columnId, children, style }) {
  const ref = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const { instanceId } = useKanbanDnd();
  const itemId = dealId.toString();

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return undefined;
    }

    return combine(
      draggable({
        element,
        getInitialData: () => ({
          type: 'card',
          itemId,
          columnId,
          instanceId,
        }),
        onDragStart: () => {
          document.body.style.cursor = 'grabbing';
          setIsDragging(true);
        },
        onDrop: () => {
          document.body.style.cursor = 'default';
          setIsDragging(false);
        },
      }),
      dropTargetForElements({
        element,
        getData: ({ input, element: dropElement }) =>
          attachClosestEdge(
            { type: 'card', itemId, columnId, instanceId },
            { input, element: dropElement, allowedEdges: ['top', 'bottom'] },
          ),
        canDrop: ({ source }) =>
          source.data.type === 'card' && source.data.instanceId === instanceId,
      }),
    );
  }, [columnId, instanceId, itemId]);

  return (
    <div
      ref={ref}
      style={{
        ...style,
        cursor: isDragging ? 'grabbing' : 'grab',
        boxShadow: isDragging
          ? '0 8px 20px rgba(0,0,0,0.15)'
          : style?.boxShadow || '0 1px 2px rgba(0,0,0,0.05)',
        opacity: isDragging ? 0.4 : 1,
      }}
    >
      {children}
    </div>
  );
}
