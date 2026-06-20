import React from 'react';
import { MapPin } from 'lucide-react';
import { useTripStore } from '@/store/useTripStore';
import { formatCurrency } from '@/utils/costUtils';
import { cn } from '@/lib/utils';

export const CityFilter: React.FC = () => {
  const { cities, selectedCity, setSelectedCity, cityTotals } = useTripStore();

  const handleCityClick = (city: string) => {
    if (selectedCity === city) {
      setSelectedCity(null);
    } else {
      setSelectedCity(city);
    }
  };

  if (cities.length === 0) return null;

  return (
    <div className="card-paper p-4">
      <div className="flex items-center gap-2 mb-3">
        <MapPin size={18} className="text-ink-500" />
        <span className="font-handwritten text-xl font-bold text-ink-700">
          按城市筛选
        </span>
        {selectedCity && (
          <button
            onClick={() => setSelectedCity(null)}
            className="ml-auto text-xs text-ink-400 hover:text-ink-600 transition-colors"
          >
            清除筛选
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {cities.map((city, index) => {
          const isActive = selectedCity === city;
          const total = cityTotals[city] || 0;
          const rotation = (index % 2 === 0 ? -1 : 1) * (Math.random() * 2 + 1);

          return (
            <button
              key={city}
              onClick={() => handleCityClick(city)}
              className={cn(
                'stamp-label transition-all duration-200 hover:scale-110',
                isActive && 'active'
              )}
              style={{ transform: `rotate(${rotation}deg)` }}
              title={`${city} - ${formatCurrency(total)}`}
            >
              <span className="text-[10px] leading-tight text-center">
                {city.length > 3 ? city.slice(0, 3) : city}
              </span>
            </button>
          );
        })}
      </div>

      {selectedCity && (
        <div className="mt-3 pt-3 border-t border-dashed border-ink-500/20">
          <div className="flex items-center justify-between text-sm">
            <span className="text-ink-500">「{selectedCity}」总花费</span>
            <span className="font-mono font-bold text-ink-700">
              {formatCurrency(cityTotals[selectedCity] || 0)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
