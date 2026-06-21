import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Train, Hotel, Ticket, Users, Pencil, Trash2, CalendarDays, CloudRain, Sun, TreeDeciduous, Building, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import type { TripItem } from '@/types';
import {
  ITEM_TYPE_LABELS,
  ITEM_TYPE_COLORS,
  WEATHER_RISK_LABELS,
  WEATHER_RISK_COLORS,
  WEATHER_LABELS,
  WEATHER_ICONS,
} from '@/types';
import { formatShortDate, isCrossDay, getDaysDiff } from '@/utils/dateUtils';
import { formatCurrency, isCustomSplit } from '@/utils/costUtils';
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

const weatherBorderColors: Record<string, string> = {
  safe: '',
  caution: 'ring-2 ring-amber-400 ring-offset-2 ring-offset-paper-100',
  danger: 'ring-2 ring-red-500 ring-offset-2 ring-offset-paper-100 animate-pulse',
};

export const ItemCard: React.FC<ItemCardProps> = ({ item, index }) => {
  const currentPlan = useTripStore(state => state.plans.find(p => p.id === state.currentPlanId));
  const {
    setEditingItem,
    deleteItem,
    getPerPersonCost,
    selectedCity,
    getWeatherRiskLevel,
    isWeatherAffected,
    getWeatherForDate,
    activateBackupPlan,
    deactivateBackupPlan,
  } = useTripStore();

  const [showBackupPlans, setShowBackupPlans] = React.useState(false);

  const crossDay = isCrossDay(item.startDate, item.endDate);
  const daysCount = getDaysDiff(item.startDate, item.endDate);
  const perPerson = getPerPersonCost(item);
  const hasSplit = item.participants.length > 1;
  const customSplit = isCustomSplit(item);

  const isFiltered = selectedCity && item.city !== selectedCity;

  const weather = currentPlan?.dailyWeather.find(w => w.date === item.startDate && w.city === item.city);
  
  const weatherAffected = React.useMemo(() => {
    if (!item.isOutdoor || !weather) return false;
    if (weather.weather === 'rainy' || weather.weather === 'stormy' || weather.weather === 'snowy') return true;
    if (weather.precipitationProbability !== undefined && weather.precipitationProbability >= 50) return true;
    if (weather.windSpeed !== undefined && weather.windSpeed >= 15) return true;
    return false;
  }, [item.isOutdoor, weather]);

  const riskLevel = React.useMemo(() => {
    if (!item.isOutdoor || !weather) return 'safe';
    const risks: ('safe' | 'caution' | 'danger')[] = [];
    if (weather.weather === 'stormy') risks.push('danger');
    else if (weather.weather === 'rainy' || weather.weather === 'snowy') risks.push('caution');
    if (weather.precipitationProbability !== undefined) {
      if (weather.precipitationProbability >= 80) risks.push('danger');
      else if (weather.precipitationProbability >= 50) risks.push('caution');
    }
    if (weather.windSpeed !== undefined) {
      if (weather.windSpeed >= 25) risks.push('danger');
      else if (weather.windSpeed >= 15) risks.push('caution');
    }
    if (risks.includes('danger')) return 'danger';
    if (risks.includes('caution')) return 'caution';
    return 'safe';
  }, [item.isOutdoor, weather]);
  const adoptedBackups = item.backupPlans.filter(b => b.status === 'adopted');
  const activeBackup = item.activeBackupId
    ? adoptedBackups.find(b => b.id === item.activeBackupId)
    : null;

  const displayTitle = activeBackup ? activeBackup.title : item.title;
  const displayCost = activeBackup ? activeBackup.cost : item.cost;
  const displayType = activeBackup ? activeBackup.type : item.type;

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

  const Icon = typeIcons[displayType];
  const colorClass = ITEM_TYPE_COLORS[displayType];

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

  const handleSelectBackup = (backupId: string) => {
    if (item.activeBackupId === backupId) {
      deactivateBackupPlan(item.id);
    } else {
      activateBackupPlan(item.id, backupId);
    }
    setShowBackupPlans(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group relative ticket-style p-3 pr-16 border-2 mb-2 cursor-grab active:cursor-grabbing',
        'hover:shadow-paper-lg transition-all duration-200',
        typeBgColors[displayType],
        isDragging && 'scale-105 shadow-paper-lg z-50',
        isFiltered && 'pointer-events-none',
        weatherBorderColors[riskLevel]
      )}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-start gap-2">
        <div className={cn(
          'p-1.5 rounded-lg bg-paper-50/80 shadow-sm',
          typeTextColors[displayType]
        )}>
          <Icon size={16} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={cn('font-semibold text-sm text-ink-700 truncate')}>
              {displayTitle}
            </span>
            {activeBackup && (
              <span className="flex items-center gap-1 text-[10px] bg-blue-100 text-blue-700 border border-blue-300 px-1.5 py-0.5 rounded-full">
                <RefreshCw size={10} />
                备选方案
              </span>
            )}
            {crossDay && (
              <span className="flex items-center gap-1 text-xs text-ink-500 bg-paper-50/60 px-1.5 py-0.5 rounded">
                <CalendarDays size={12} />
                {daysCount}天
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-ink-500 mb-1.5 flex-wrap">
            <span className={cn(
              'font-bold text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded',
              'bg-paper-50/60',
              typeTextColors[displayType]
            )}>
              {ITEM_TYPE_LABELS[displayType]}
            </span>
            <span className="truncate">
              {item.city}
            </span>
            {weather && (
              <span className="flex items-center gap-1">
                {WEATHER_ICONS[weather.weather]}
                {WEATHER_LABELS[weather.weather]}
                {weather.temperatureLow}°~{weather.temperatureHigh}°
              </span>
            )}
            {crossDay && (
              <span className="whitespace-nowrap">
                {formatShortDate(item.startDate)} → {formatShortDate(item.endDate)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap mb-1">
            {item.isOutdoor && (
              <span className="flex items-center gap-1 text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded-full">
                <TreeDeciduous size={10} />
                户外
              </span>
            )}
            {!item.isOutdoor && item.type === 'activity' && (
              <span className="flex items-center gap-1 text-[10px] bg-slate-50 text-slate-600 border border-slate-200 px-1.5 py-0.5 rounded-full">
                <Building size={10} />
                室内
              </span>
            )}
            {weatherAffected && item.isOutdoor && (
              <span className={cn(
                'flex items-center gap-1 text-[10px] border px-1.5 py-0.5 rounded-full',
                WEATHER_RISK_COLORS[riskLevel]
              )}>
                <CloudRain size={10} />
                天气{WEATHER_RISK_LABELS[riskLevel]}
              </span>
            )}
            {!weatherAffected && item.isOutdoor && weather && (weather.weather === 'sunny' || weather.weather === 'cloudy') && (
              <span className="flex items-center gap-1 text-[10px] bg-yellow-50 text-yellow-700 border border-yellow-200 px-1.5 py-0.5 rounded-full">
                <Sun size={10} />
                天气适宜
              </span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className={cn(
                'font-mono font-bold text-sm',
                typeTextColors[displayType]
              )}>
                {formatCurrency(displayCost)}
                {activeBackup && activeBackup.cost !== item.cost && (
                  <span className="ml-1 text-xs line-through opacity-60">
                    {formatCurrency(item.cost)}
                  </span>
                )}
              </span>
              {hasSplit && (
                <span className="flex items-center gap-1 text-xs text-ink-500">
                  <Users size={12} />
                  {item.participants.length}人 · 
                  {customSplit ? (
                    <span className="text-tape-orange font-medium">自定义分摊</span>
                  ) : (
                    <span>人均{formatCurrency(perPerson)}</span>
                  )}
                </span>
              )}
            </div>
          </div>

          {activeBackup && (
            <p className="text-xs text-blue-600 mt-1 pt-1 border-t border-dashed border-blue-500/20 line-clamp-2">
              💡 备用说明: {activeBackup.note}
            </p>
          )}
          {!activeBackup && item.note && (
            <p className="text-xs text-ink-500 mt-1 pt-1 border-t border-dashed border-ink-500/20 line-clamp-1">
              {item.note}
            </p>
          )}

          {weatherAffected && item.isOutdoor && adoptedBackups.length > 0 && (
            <div className="mt-2 pt-2 border-t border-dashed border-ink-500/20">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowBackupPlans(!showBackupPlans);
                }}
                className="w-full flex items-center justify-between text-xs text-ink-600 hover:text-ink-800 bg-paper-50/80 hover:bg-paper-100 rounded-lg px-2 py-1.5 transition-colors"
              >
                <span className="flex items-center gap-1 font-medium">
                  <RefreshCw size={12} />
                  切换备用方案 ({adoptedBackups.length})
                </span>
                {showBackupPlans ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>

              {showBackupPlans && (
                <div className="mt-2 space-y-1.5 animate-fade-in-up">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectBackup('');
                    }}
                    className={cn(
                      'w-full text-left p-2 rounded-lg border-2 text-xs transition-all',
                      !item.activeBackupId
                        ? 'bg-green-50 border-green-300 text-green-800'
                        : 'bg-paper-50 border-ink-200 text-ink-600 hover:border-ink-400'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{item.title}（原计划）</span>
                      <span className="font-mono">{formatCurrency(item.cost)}</span>
                    </div>
                  </button>
                  {adoptedBackups.map((backup) => (
                    <button
                      key={backup.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectBackup(backup.id);
                      }}
                      className={cn(
                        'w-full text-left p-2 rounded-lg border-2 text-xs transition-all',
                        item.activeBackupId === backup.id
                          ? 'bg-blue-50 border-blue-400 text-blue-800'
                          : 'bg-paper-50 border-ink-200 text-ink-600 hover:border-blue-300 hover:bg-blue-50/50'
                      )}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{backup.title}</span>
                        <span className="font-mono">
                          {formatCurrency(backup.cost)}
                          {backup.cost !== item.cost && (
                            <span className={cn(
                              'ml-1',
                              backup.cost > item.cost ? 'text-red-500' : 'text-green-600'
                            )}>
                              ({backup.cost > item.cost ? '+' : ''}{(backup.cost - item.cost).toFixed(0)})
                            </span>
                          )}
                        </span>
                      </div>
                      <p className="text-[11px] opacity-80 line-clamp-1">
                        {backup.note}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
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
