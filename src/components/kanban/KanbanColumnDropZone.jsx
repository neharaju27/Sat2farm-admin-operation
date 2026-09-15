import React, { useEffect, useRef, useState } from 'react';
import { dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { useKanbanDnd } from './KanbanDndContext';

export default function KanbanColumnDropZone({ columnId, style, children, onScroll }) {
  const ref = useRef(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const { instanceId } = useKanbanDnd();

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return undefined;
    }

    return dropTargetForElements({
      element,
      getData: () => ({ type: 'column', columnId, instanceId }),
      canDrop: ({ source }) =>
        source.data.type === 'card' && source.data.instanceId === instanceId,
      onDragEnter: () => setIsDraggingOver(true),
      onDragLeave: () => setIsDraggingOver(false),
      onDrop: () => setIsDraggingOver(false),
    });
  }, [columnId, instanceId]);

  return (
    <div
      ref={ref}
      onScroll={onScroll}
      style={{
        ...style,
        backgroundColor: isDraggingOver ? '#f0f9ff' : style?.backgroundColor || 'transparent',
      }}
    >
      {children}
    </div>
  );
}
