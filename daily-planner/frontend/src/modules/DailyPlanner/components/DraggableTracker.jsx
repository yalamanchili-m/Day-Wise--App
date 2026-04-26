import React, { useRef } from "react";
import { useDrag, useDrop } from "react-dnd";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

const ItemTypes = {
  TRACKER: "tracker",
};

const DraggableTrackerInner = ({ id, index, onDragEnd, children }) => {
  const ref = useRef(null);
  
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.TRACKER,
    item: { id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    end: (item, monitor) => {
      const dropResult = monitor.getDropResult();
      if (dropResult && dropResult.index !== undefined && onDragEnd) {
        onDragEnd(item.index, dropResult.index);
      }
    },
  });
  
  const [, drop] = useDrop({
    accept: ItemTypes.TRACKER,
    hover: (item, monitor) => {
      const dragIndex = item.index;
      const hoverIndex = index;
      
      if (dragIndex === hoverIndex) return;
      
      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;
      
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;
      
      if (onDragEnd) {
        onDragEnd(dragIndex, hoverIndex);
        item.index = hoverIndex;
      }
    },
    drop: (item, monitor) => {
      return { index };
    },
  });
  
  drag(drop(ref));
  
  return (
    <div ref={ref} style={{ opacity: isDragging ? 0.5 : 1, cursor: "grab" }}>
      {children}
    </div>
  );
};

export default function DraggableTracker({ id, index, onDragEnd, children }) {
  return (
    <DndProvider backend={HTML5Backend}>
      <DraggableTrackerInner id={id} index={index} onDragEnd={onDragEnd}>
        {children}
      </DraggableTrackerInner>
    </DndProvider>
  );
}