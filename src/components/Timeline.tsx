import React from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { useTripStore } from '@/store/useTripStore';
import { DayColumn } from './DayColumn';
import { ItemCard } from './ItemCard';
import type { TripItem } from '@/types';

export const Timeline: React.FC = () => {
  const {
    dateRange,
    moveItem,
    getItemsByDate,
    reorderItems,
    currentPlan,
  } = useTripStore();

  const [activeItem, setActiveItem] = React.useState<TripItem | null>(null);

  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 5,
    },
  });

  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 200,
      tolerance: 5,
    },
  });

  const sensors = useSensors(mouseSensor, touchSensor);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const item = active.data.current?.item as TripItem | undefined;
    if (item) {
      setActiveItem(item);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveItem(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeData = active.data.current;
    const overData = over.data.current;

    if (!activeData) return;

    if (overData?.type === 'day') {
      const targetDate = overData.date as string;
      const dateItems = getItemsByDate(targetDate);
      const newIndex = dateItems.length;
      moveItem(activeId, targetDate, newIndex);
      return;
    }

    if (overData?.type === 'item') {
      const overItem = overData.item as TripItem;
      const targetDate = overItem.startDate;

      const activeItem = activeData.item as TripItem;
      const sourceDate = activeItem.startDate;

      if (sourceDate === targetDate) {
        const items = getItemsByDate(sourceDate);
        const oldIndex = items.findIndex(i => i.id === activeId);
        const newIndex = items.findIndex(i => i.id === overId);

        if (oldIndex !== newIndex) {
          const newItems = arrayMove(items, oldIndex, newIndex);
          reorderItems(sourceDate, newItems);
        }
      } else {
        const targetItems = getItemsByDate(targetDate);
        const insertIndex = targetItems.findIndex(i => i.id === overId);
        moveItem(activeId, targetDate, insertIndex);
      }
    }
  };

  if (!currentPlan || dateRange.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-ink-500 font-handwritten text-2xl mb-4">还没有行程安排</p>
          <p className="text-ink-400 text-sm">先创建一个方案，开始规划你的旅行吧！</p>
        </div>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex-1 overflow-x-auto overflow-y-hidden pb-8">
        <div className="flex gap-6 px-8 py-4 min-h-full">
          {dateRange.map((date, index) => (
            <DayColumn key={date} date={date} index={index} />
          ))}
        </div>
      </div>

      <DragOverlay dropAnimation={{
        duration: 200,
        easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
      }}>
        {activeItem ? (
          <div className="w-64 rotate-3 opacity-90">
            <ItemCard item={activeItem} index={0} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
