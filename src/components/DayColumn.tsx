import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus, CloudRain, AlertTriangle } from 'lucide-react';
import { formatDate } from '@/utils/dateUtils';
import { calculateByType, formatCurrency } from '@/utils/costUtils';
import { useTripStore } from '@/store/useTripStore';
import { ItemCard } from './ItemCard';
import { cn } from '@/lib/utils';
import { WEATHER_ICONS, WEATHER_LABELS, WEATHER_RISK_COLORS, WEATHER_RISK_LABELS } from '@/types';
import type { DailyWeather } from '@/types';

interface DayColumnProps {
  date: string;
  index: number;
}

const tapeStyles = ['tape-decoration', 'tape-decoration-alt', 'tape-decoration-green'];

export const DayColumn: React.FC<DayColumnProps> = ({ date, index }) => {
  const currentPlan = useTripStore(state => state.plans.find(p => p.id === state.currentPlanId));
  const { getItemsByDate, addItem, selectedCity, getWeatherForDate, getWeatherRiskLevel, isWeatherAffected, setEditingWeather, setShowWeatherModal } = useTripStore();
  const items = getItemsByDate(date);

  const filteredItems = selectedCity
    ? items.filter(item => item.city === selectedCity)
    : items;

  const { setNodeRef, isOver } = useDroppable({
    id: `day-${date}`,
    data: {
      type: 'day',
      date,
    },
  });

  const transportTotal = calculateByType(items, 'transport');
  const accommodationTotal = calculateByType(items, 'accommodation');
  const activityTotal = calculateByType(items, 'activity');
  const dayTotal = transportTotal + accommodationTotal + activityTotal;

  const uniqueCities = [...new Set(items.map(i => i.city))];
  const weatherByCity = uniqueCities.map(city => ({
    city,
    weather: currentPlan?.dailyWeather.find(w => w.date === date && w.city === city),
  }));

  const hasWeatherRisk = items.some(item => {
    if (!item.isOutdoor) return false;
    const weather = currentPlan?.dailyWeather.find(w => w.date === item.startDate && w.city === item.city);
    if (!weather) return false;
    if (weather.weather === 'rainy' || weather.weather === 'stormy' || weather.weather === 'snowy') return true;
    if (weather.precipitationProbability !== undefined && weather.precipitationProbability >= 50) return true;
    if (weather.windSpeed !== undefined && weather.windSpeed >= 15) return true;
    return false;
  });

  const maxRiskLevel = items.reduce((max, item) => {
    if (!item.isOutdoor) return max;
    const weather = currentPlan?.dailyWeather.find(w => w.date === item.startDate && w.city === item.city);
    if (!weather) return max;
    
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
    if (risks.includes('caution') && max !== 'danger') return 'caution';
    return max;
  }, 'safe' as 'safe' | 'caution' | 'danger');

  const handleAddItem = () => {
    const defaultItem = {
      title: '新项目',
      type: 'activity' as const,
      city: currentPlan?.items[0]?.city || '',
      startDate: date,
      endDate: date,
      cost: 0,
      participants: [],
      note: '',
      isOutdoor: true,
      backupPlans: [],
      activeBackupId: null,
    };
    addItem(defaultItem);
  };

  const handleEditWeather = (weather: DailyWeather) => {
    setEditingWeather(weather);
    setShowWeatherModal(true);
  };

  const tapeClass = tapeStyles[index % tapeStyles.length];

  return (
    <div
      className="relative flex-shrink-0 w-72 animate-fade-in-up"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className={cn(
        'card-paper p-4 min-h-[400px] transition-all duration-200',
        isOver && 'ring-2 ring-tape-orange ring-offset-2 ring-offset-paper-100'
      )}>
        <div className={tapeClass} />

        <div className="mb-4 text-center relative z-10">
          <h3 className="font-handwritten text-2xl font-bold text-ink-700">
            {formatDate(date)}
          </h3>

          {weatherByCity.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-2 mt-1.5 mb-1.5">
              {weatherByCity.map(({ city, weather }) => weather && (
                <button
                  key={city}
                  onClick={() => handleEditWeather(weather)}
                  className="flex items-center gap-1 text-xs bg-paper-50/80 rounded-full px-2 py-0.5 border border-ink-200 hover:border-ink-400 hover:bg-paper-100 transition-all cursor-pointer group"
                  title="点击编辑天气"
                >
                  <span>{city}</span>
                  <span className="text-base leading-none group-hover:scale-110 transition-transform">{WEATHER_ICONS[weather.weather]}</span>
                  <span className="text-ink-600">{weather.temperatureLow}°~{weather.temperatureHigh}°</span>
                  {weather.precipitationProbability > 50 && (
                    <span className="flex items-center gap-0.5 text-blue-600">
                      <CloudRain size={10} />
                      {weather.precipitationProbability}%
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {hasWeatherRisk && (
            <div className={cn(
              'flex items-center justify-center gap-1 text-[11px] border rounded-full px-2 py-0.5 mb-1.5',
              WEATHER_RISK_COLORS[maxRiskLevel]
            )}>
              <AlertTriangle size={12} />
              <span>当天{WEATHER_RISK_LABELS[maxRiskLevel]}项目需关注</span>
            </div>
          )}

          <div className="flex items-center justify-center gap-2 mt-1 text-xs">
            {transportTotal > 0 && (
              <span className="text-orange-600">
                交{formatCurrency(transportTotal)}
              </span>
            )}
            {accommodationTotal > 0 && (
              <span className="text-pink-600">
                住{formatCurrency(accommodationTotal)}
              </span>
            )}
            {activityTotal > 0 && (
              <span className="text-green-600">
                玩{formatCurrency(activityTotal)}
              </span>
            )}
          </div>
          <div className="mt-1 font-mono font-bold text-ink-600">
            合计: {formatCurrency(dayTotal)}
          </div>
        </div>

        <div
          ref={setNodeRef}
          className={cn(
            'space-y-2 min-h-[200px] rounded-lg transition-colors',
            isOver && 'bg-tape-orange/10'
          )}
        >
          <SortableContext
            items={filteredItems.map(i => i.id)}
            strategy={verticalListSortingStrategy}
          >
            {filteredItems.map((item, idx) => (
              <ItemCard key={item.id} item={item} index={idx} />
            ))}
          </SortableContext>

          {filteredItems.length === 0 && (
            <div className="text-center py-8 text-ink-400 text-sm dashed-border rounded-lg">
              {selectedCity ? '该城市当天无安排' : '拖拽项目到此处\n或点击下方添加'}
            </div>
          )}
        </div>

        <button
          onClick={handleAddItem}
          className="w-full mt-4 py-2 btn-secondary flex items-center justify-center gap-2"
        >
          <Plus size={16} />
          添加项目
        </button>
      </div>
    </div>
  );
};
