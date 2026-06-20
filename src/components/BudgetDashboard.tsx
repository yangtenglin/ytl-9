import React from 'react';
import { AlertTriangle, Wallet, TrendingDown, Pencil } from 'lucide-react';
import { useTripStore } from '@/store/useTripStore';
import { formatCurrency, getBudgetPercentage } from '@/utils/costUtils';
import { cn } from '@/lib/utils';

export const BudgetDashboard: React.FC = () => {
  const {
    currentPlan,
    totalSpent,
    isOverBudget,
    updatePlan,
  } = useTripStore();

  const [isEditing, setIsEditing] = React.useState(false);
  const [budgetInput, setBudgetInput] = React.useState('');

  const totalBudget = currentPlan?.totalBudget || 0;
  const remaining = totalBudget - totalSpent;
  const percentage = getBudgetPercentage(totalSpent, totalBudget);
  const remainingPercentage = Math.max(0, 100 - percentage);

  const handleBudgetEdit = () => {
    setBudgetInput(String(totalBudget));
    setIsEditing(true);
  };

  const handleBudgetSave = () => {
    const newBudget = parseFloat(budgetInput);
    if (!isNaN(newBudget) && newBudget >= 0 && currentPlan) {
      updatePlan(currentPlan.id, { totalBudget: newBudget });
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBudgetSave();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
    }
  };

  const circumference = 2 * Math.PI * 80;
  const strokeDashoffset = circumference - (remainingPercentage / 100) * circumference;

  return (
    <div className={cn(
      'card-paper p-6 relative overflow-hidden',
      isOverBudget && 'animate-shake'
    )}>
      {isOverBudget && (
        <div className="absolute top-0 right-0 bg-red-500 text-white px-4 py-1 text-xs font-bold rounded-bl-xl animate-bounce">
          ⚠️ 超预算！
        </div>
      )}

      <h2 className="font-handwritten text-2xl font-bold text-ink-700 mb-6 text-center">
        <span className="handwritten-underline">预算仪表盘</span>
      </h2>

      <div className="relative flex justify-center mb-6">
        <svg className="w-48 h-48 transform -rotate-90">
          <circle
            cx="96"
            cy="96"
            r="80"
            fill="none"
            stroke="#e8dcc8"
            strokeWidth="12"
          />
          <circle
            cx="96"
            cy="96"
            r="80"
            fill="none"
            stroke={isOverBudget ? '#ef4444' : remaining < 1000 ? '#f59e0b' : '#8b7355'}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-700 ease-out"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-ink-500 text-xs mb-1">剩余预算</div>
          <div className={cn(
            'font-mono font-bold text-2xl',
            isOverBudget ? 'text-red-600' : remaining < 1000 ? 'text-amber-600' : 'text-ink-700'
          )}>
            {formatCurrency(remaining)}
          </div>
          <div className="text-ink-400 text-xs mt-1">
            已用 {percentage.toFixed(0)}%
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-paper-100 rounded-xl">
          <div className="flex items-center gap-2">
            <Wallet size={18} className="text-ink-500" />
            <span className="text-ink-600">总预算</span>
          </div>
          {isEditing ? (
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={budgetInput}
                onChange={(e) => setBudgetInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleBudgetSave}
                className="w-24 px-2 py-1 rounded-lg border-2 border-ink-500/30 font-mono text-right focus:outline-none focus:border-ink-500"
                autoFocus
              />
            </div>
          ) : (
            <button
              onClick={handleBudgetEdit}
              className="flex items-center gap-1 font-mono font-bold text-ink-700 hover:text-ink-500 transition-colors"
            >
              {formatCurrency(totalBudget)}
              <Pencil size={14} />
            </button>
          )}
        </div>

        <div className="flex items-center justify-between p-3 bg-paper-100 rounded-xl">
          <div className="flex items-center gap-2">
            <TrendingDown size={18} className="text-ink-500" />
            <span className="text-ink-600">已花费</span>
          </div>
          <span className={cn(
            'font-mono font-bold',
            isOverBudget ? 'text-red-600' : 'text-ink-700'
          )}>
            {formatCurrency(totalSpent)}
          </span>
        </div>

        {isOverBudget && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border-2 border-red-200 rounded-xl text-red-700">
            <AlertTriangle size={18} className="animate-pulse" />
            <div>
              <div className="font-bold text-sm">超出预算</div>
              <div className="text-xs font-mono">
                {formatCurrency(Math.abs(remaining))}
              </div>
            </div>
          </div>
        )}

        {!isOverBudget && remaining < totalBudget * 0.2 && remaining > 0 && (
          <div className="flex items-center gap-2 p-3 bg-amber-50 border-2 border-amber-200 rounded-xl text-amber-700">
            <AlertTriangle size={18} />
            <div>
              <div className="font-bold text-sm">预算不足 20%</div>
              <div className="text-xs">请注意控制支出</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
