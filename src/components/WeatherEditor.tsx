import React from 'react';
import { X, Save, CloudRain, Wind, Thermometer } from 'lucide-react';
import { useTripStore } from '@/store/useTripStore';
import type { DailyWeather, WeatherType } from '@/types';
import { WEATHER_LABELS, WEATHER_ICONS } from '@/types';
import { formatDate } from '@/utils/dateUtils';

interface WeatherEditorProps {
  weather: DailyWeather;
  onClose: () => void;
}

const weatherOptions: { value: WeatherType; label: string; icon: string }[] = [
  { value: 'sunny', label: WEATHER_LABELS.sunny, icon: WEATHER_ICONS.sunny },
  { value: 'cloudy', label: WEATHER_LABELS.cloudy, icon: WEATHER_ICONS.cloudy },
  { value: 'rainy', label: WEATHER_LABELS.rainy, icon: WEATHER_ICONS.rainy },
  { value: 'stormy', label: WEATHER_LABELS.stormy, icon: WEATHER_ICONS.stormy },
  { value: 'snowy', label: WEATHER_LABELS.snowy, icon: WEATHER_ICONS.snowy },
];

export const WeatherEditor: React.FC<WeatherEditorProps> = ({ weather, onClose }) => {
  const { setDailyWeather } = useTripStore();
  const [formData, setFormData] = React.useState({
    weather: weather.weather,
    temperatureHigh: weather.temperatureHigh,
    temperatureLow: weather.temperatureLow,
    precipitationProbability: weather.precipitationProbability,
    windSpeed: weather.windSpeed,
  });

  const handleChange = (field: keyof typeof formData, value: number | WeatherType) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    const updatedWeather: DailyWeather = {
      ...weather,
      weather: formData.weather,
      temperatureHigh: Number(formData.temperatureHigh),
      temperatureLow: Number(formData.temperatureLow),
      precipitationProbability: Number(formData.precipitationProbability),
      windSpeed: Number(formData.windSpeed),
    };
    setDailyWeather(updatedWeather);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-ink-700/50 flex items-center justify-center z-50 p-4">
      <div className="relative card-paper w-full max-w-md p-6 max-h-[90vh] overflow-y-auto animate-fade-in-up">
        <div className="tape-decoration" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-paper-200 transition-colors text-ink-500 hover:text-ink-700"
        >
          <X size={20} />
        </button>

        <h2 className="font-handwritten text-3xl font-bold text-ink-700 mb-2 text-center">
          <span className="handwritten-underline">编辑天气</span>
        </h2>

        <div className="text-center text-ink-500 text-sm mb-6">
          {weather.city} · {formatDate(weather.date)}
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-ink-600 mb-2">
              天气状况
            </label>
            <div className="grid grid-cols-5 gap-2">
              {weatherOptions.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => handleChange('weather', opt.value)}
                  className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl border-2 font-medium transition-all ${
                    formData.weather === opt.value
                      ? 'bg-tape-blue/20 border-tape-blue text-ink-700 shadow-paper'
                      : 'bg-paper-50 border-ink-500/20 text-ink-500 hover:border-ink-500/40'
                  }`}
                >
                  <span className="text-2xl leading-none">{opt.icon}</span>
                  <span className="text-xs">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink-600 mb-1.5 flex items-center gap-1">
                <Thermometer size={14} />
                最低温度 (°C)
              </label>
              <input
                type="number"
                value={formData.temperatureLow}
                onChange={(e) => handleChange('temperatureLow', parseInt(e.target.value) || 0)}
                className="w-full px-4 py-2 rounded-xl border-2 border-ink-500/20 bg-paper-50 focus:border-ink-500 focus:outline-none transition-colors font-mono"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-600 mb-1.5 flex items-center gap-1">
                <Thermometer size={14} />
                最高温度 (°C)
              </label>
              <input
                type="number"
                value={formData.temperatureHigh}
                onChange={(e) => handleChange('temperatureHigh', parseInt(e.target.value) || 0)}
                className="w-full px-4 py-2 rounded-xl border-2 border-ink-500/20 bg-paper-50 focus:border-ink-500 focus:outline-none transition-colors font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-600 mb-1.5 flex items-center gap-1">
              <CloudRain size={14} />
              降水概率: {formData.precipitationProbability}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={formData.precipitationProbability}
              onChange={(e) => handleChange('precipitationProbability', parseInt(e.target.value))}
              className="w-full h-2 bg-paper-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex justify-between text-xs text-ink-400 mt-1">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-600 mb-1.5 flex items-center gap-1">
              <Wind size={14} />
              风速: {formData.windSpeed} km/h
            </label>
            <input
              type="range"
              min="0"
              max="50"
              step="1"
              value={formData.windSpeed}
              onChange={(e) => handleChange('windSpeed', parseInt(e.target.value))}
              className="w-full h-2 bg-paper-200 rounded-lg appearance-none cursor-pointer accent-green-500"
            />
            <div className="flex justify-between text-xs text-ink-400 mt-1">
              <span>0</span>
              <span>15</span>
              <span>25</span>
              <span>50</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-8">
          <button
            onClick={onClose}
            className="flex-1 btn-secondary"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="flex-1 btn-primary flex items-center justify-center gap-2"
          >
            <Save size={16} />
            保存
          </button>
        </div>
      </div>
    </div>
  );
};
