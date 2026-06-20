import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Train, Hotel, Ticket, Users, Pencil, Trash2, CalendarDays } from 'lucide-react';
import type { TripItem } from '@/types';
import { ITEM_TYPE_LABELS, ITEM_TYPE_COLORS } from '@/types';
import { formatShortDate, isCrossDay, getDaysDiff } from '@/utils/dateUtils';
import { formatCurrency } from '@/utils/costUtils';
import { useTripStore } from '@/store/useTripStore';
import { cn } from '@/lib/utils';

interface ItemCardProps {
  item: TripItem;
  index: number;
}

const typeIcons = {
  transport: Train,
  accommodation: Hotel,
  activity: Ticket,
};

const typeBgColors = {
  transport: 'bg-tape-orange/20 border-tape-orange/40',
  accommodation: 'bg-tape-pink/20 border-tape-pink/40',
  activity: 'bg-tape-green/20 border-tape-green/40',
};

const typeTextColors = {
  transport: 'text-orange-700',
  accommodation: 'text-pink-700',
  activity: 'text-green-700',
};

export const ItemCard: React.FC<ItemCardProps> = ({ item, index }) => {
  const { setEditingItem, deleteItem, getPerPersonCost, selectedCity } = useTripStore();
  const crossDay = isCrossDay(item.startDate, item.endDate);
  const daysCount = getDaysDiff(item.startDate, item.endDate);
  const perPerson = getPerPersonCost(item);
  const hasSplit = item.participants.length > 1;

  const isFiltered = selectedCity && item.city !== selectedCity;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: item.id,
    data: {
      type: 'item',
      item,
    },
    disabled: isFiltered,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : isFiltered ? 0.3 : 1,
    animationDelay: `${index * 50}ms`,
  };

  const Icon = typeIcons[item.type];
  const colorClass = ITEM_TYPE_COLORS[item.type];

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingItem(item);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`确定删除「${item.title}」吗？`)) {
      deleteItem(item.id);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group relative ticket-style p-3 pr-16 border-2 mb-2 cursor-grab active:cursor-grabbing',
        'hover:shadow-paper-lg transition-all duration-200',
        typeBgColors[item.type],
        isDragging && 'scale-105 shadow-paper-lg z-50',
        isFiltered && 'pointer-events-none'
      )}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-start gap-2">
        <div className={cn(
          'p-1.5 rounded-lg bg-paper-50/80 shadow-sm',
          typeTextColors[item.type]
        )}>
          <Icon size={16} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={cn('font-semibold text-sm text-ink-700 truncate')}>
              {item.title}
            </span>
            {crossDay && (
              <span className="flex items-center gap-1 text-xs text-ink-500 bg-paper-50/60 px-1.5 py-0.5 rounded">
                <CalendarDays size={12} />
                {daysCount}天
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-ink-500 mb-1.5">
            <span className={cn(
              'font-bold text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded',
              'bg-paper-50/60',
              typeTextColors[item.type]
            )}>
              {ITEM_TYPE_LABELS[item.type]}
            </span>
            <span className="truncate">
              {item.city}
            </span>
            {crossDay && (
              <span className="whitespace-nowrap">
                {formatShortDate(item.startDate)} → {formatShortDate(item.endDate)}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className={cn(
                'font-mono font-bold text-sm',
                typeTextColors[item.type]
              )}>
                {formatCurrency(item.cost)}
              </span>
              {hasSplit && (
                <span className="flex items-center gap-1 text-xs text-ink-500">
                  <Users size={12} />
                  {item.participants.length}人 · 人均{formatCurrency(perPerson)}
                </span>
              )}
            </div>
          </div>

          {item.note && (
            <p className="text-xs text-ink-500 mt-1 pt-1 border-t border-dashed border-ink-500/20 line-clamp-1">
              {item.note}
            </p>
          )}
        </div>
      </div>

      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={handleEdit}
          className="p-1.5 rounded-lg bg-paper-50 hover:bg-tape-yellow/30 text-ink-500 hover:text-ink-700 transition-colors"
          title="编辑"
        >
          <Pencil size={14} />
        </button>
        <button
          onClick={handleDelete}
          className="p-1.5 rounded-lg bg-paper-50 hover:bg-red-100 text-ink-500 hover:text-red-600 transition-colors"
          title="删除"
        >
          <Trash2 size={14} />
        </button>
      </div>

      <div className={cn(
        'absolute -right-1 -top-1 w-3 h-3 rounded-full border-2 border-paper-50',
        `bg-${colorClass}`
      )} />
    </div>
  );
};
