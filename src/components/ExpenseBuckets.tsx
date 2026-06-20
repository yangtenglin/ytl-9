import React from 'react';
import { Train, Hotel, Ticket } from 'lucide-react';
import { useTripStore } from '@/store/useTripStore';
import { formatCurrency, getBudgetPercentage } from '@/utils/costUtils';

const bucketConfig = {
  transport: {
    icon: Train,
    label: '交通',
    bgColor: 'bg-tape-orange/20',
    borderColor: 'border-tape-orange',
    textColor: 'text-orange-700',
    progressColor: 'bg-tape-orange',
    key: 'transportTotal' as const,
  },
  accommodation: {
    icon: Hotel,
    label: '住宿',
    bgColor: 'bg-tape-pink/20',
    borderColor: 'border-tape-pink',
    textColor: 'text-pink-700',
    progressColor: 'bg-tape-pink',
    key: 'accommodationTotal' as const,
  },
  activity: {
    icon: Ticket,
    label: '活动',
    bgColor: 'bg-tape-green/20',
    borderColor: 'border-tape-green',
    textColor: 'text-green-700',
    progressColor: 'bg-tape-green',
    key: 'activityTotal' as const,
  },
};

export const ExpenseBuckets: React.FC = () => {
  const store = useTripStore();
  const totalBudget = store.currentPlan?.totalBudget || 0;
  const totalSpent = store.totalSpent;

  return (
    <div className="card-paper p-5">
      <h2 className="font-handwritten text-2xl font-bold text-ink-700 mb-4 text-center">
        <span className="handwritten-underline">费用桶</span>
      </h2>

      <div className="space-y-4">
        {Object.entries(bucketConfig).map(([type, config]) => {
          const Icon = config.icon;
          const amount = store[config.key];
          const percentage = totalBudget > 0 ? (amount / totalBudget) * 100 : 0;
          const ofTotal = totalSpent > 0 ? (amount / totalSpent) * 100 : 0;

          return (
            <div
              key={type}
              className={`relative p-4 rounded-xl border-2 ${config.bgColor} ${config.borderColor} transition-all duration-300 hover:shadow-paper-lg`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-lg bg-paper-50 ${config.textColor}`}>
                  <Icon size={20} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className={`font-bold ${config.textColor}`}>
                      {config.label}
                    </span>
                    <span className={`font-mono font-bold text-lg ${config.textColor}`}>
                      {formatCurrency(amount)}
                    </span>
                  </div>
                  <div className="text-xs text-ink-500">
                    占总支出 {ofTotal.toFixed(0)}% · 占预算 {percentage.toFixed(0)}%
                  </div>
                </div>
              </div>

              <div className="relative h-3 bg-paper-200 rounded-full overflow-hidden">
                <div
                  className={`absolute left-0 top-0 h-full ${config.progressColor} rounded-full transition-all duration-500`}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
                {percentage > 33 && percentage <= 66 && (
                  <div className="absolute left-1/3 top-0 h-full w-0.5 bg-paper-50" />
                )}
                {percentage > 66 && (
                  <>
                    <div className="absolute left-1/3 top-0 h-full w-0.5 bg-paper-50" />
                    <div className="absolute left-2/3 top-0 h-full w-0.5 bg-paper-50" />
                  </>
                )}
              </div>

              <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-paper-50 border-2 border-ink-500/20 flex items-center justify-center">
                <span className="text-xs font-bold text-ink-500">
                  {Math.round(ofTotal)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t-2 border-dashed border-ink-500/20">
        <div className="flex items-center justify-between mb-2">
          <span className="text-ink-500 text-sm">总支出</span>
          <span className={`font-mono font-bold text-xl ${totalSpent > totalBudget ? 'text-red-600' : 'text-ink-700'}`}>
            {formatCurrency(totalSpent)}
          </span>
        </div>
        <div className="relative h-4 bg-paper-200 rounded-full overflow-hidden">
          <div
            className={`absolute left-0 top-0 h-full rounded-full transition-all duration-500 ${
              totalSpent > totalBudget ? 'bg-red-400' : 'bg-ink-500'
            }`}
            style={{ width: `${getBudgetPercentage(totalSpent, totalBudget)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-ink-400 mt-1">
          <span>¥0</span>
          <span>预算 {formatCurrency(totalBudget)}</span>
        </div>
      </div>
    </div>
  );
};
