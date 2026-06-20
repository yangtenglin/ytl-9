import React from 'react';
import { X, Users, Calculator } from 'lucide-react';
import { useTripStore } from '@/store/useTripStore';
import { formatCurrency } from '@/utils/costUtils';

export const SplitModal: React.FC = () => {
  const { editingItem, setShowSplitModal, updateItem } = useTripStore();
  const [customAmounts, setCustomAmounts] = React.useState<Record<string, number>>({});
  const [splitMode, setSplitMode] = React.useState<'equal' | 'custom'>('equal');

  if (!editingItem) return null;

  const participants = editingItem.participants;
  const totalCost = editingItem.cost;
  const equalShare = participants.length > 0 ? totalCost / participants.length : 0;

  const handleEqualSplit = () => {
    const amounts: Record<string, number> = {};
    participants.forEach(p => {
      amounts[p] = equalShare;
    });
    setCustomAmounts(amounts);
  };

  React.useEffect(() => {
    if (splitMode === 'equal') {
      handleEqualSplit();
    }
  }, [splitMode, participants.length, totalCost]);

  const handleAmountChange = (name: string, value: string) => {
    const num = parseFloat(value) || 0;
    setCustomAmounts(prev => ({ ...prev, [name]: num }));
  };

  const getTotalCustom = () => {
    return Object.values(customAmounts).reduce((sum, val) => sum + val, 0);
  };

  const handleSave = () => {
    if (splitMode === 'equal') {
      setShowSplitModal(false);
      return;
    }

    const totalCustom = getTotalCustom();
    if (Math.abs(totalCustom - totalCost) > 0.01) {
      alert(`分摊总额 (${formatCurrency(totalCustom)}) 与总费用 (${formatCurrency(totalCost)}) 不相等`);
      return;
    }

    setShowSplitModal(false);
  };

  const totalCustom = getTotalCustom();
  const diff = totalCustom - totalCost;

  return (
    <div className="fixed inset-0 bg-ink-700/50 flex items-center justify-center z-50 p-4">
      <div className="relative card-paper w-full max-w-md p-6 animate-fade-in-up">
        <div className="tape-decoration-alt" />

        <button
          onClick={() => setShowSplitModal(false)}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-paper-200 transition-colors text-ink-500 hover:text-ink-700"
        >
          <X size={20} />
        </button>

        <h2 className="font-handwritten text-3xl font-bold text-ink-700 mb-6 text-center">
          <span className="handwritten-underline">费用分摊</span>
        </h2>

        <div className="mb-6 p-4 bg-tape-yellow/20 rounded-xl border-2 border-dashed border-tape-yellow">
          <div className="flex items-center justify-between">
            <span className="text-ink-600">总费用</span>
            <span className="font-mono font-bold text-xl text-ink-700">
              {formatCurrency(totalCost)}
            </span>
          </div>
          <div className="flex items-center justify-between mt-2 text-sm">
            <span className="text-ink-500 flex items-center gap-1">
              <Users size={14} />
              参与人数
            </span>
            <span className="font-mono text-ink-600">{participants.length} 人</span>
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setSplitMode('equal')}
            className={`flex-1 py-2 px-3 rounded-xl border-2 font-medium transition-all flex items-center justify-center gap-1 ${
              splitMode === 'equal'
                ? 'bg-tape-green/30 border-tape-green text-green-700'
                : 'bg-paper-50 border-ink-500/20 text-ink-500 hover:border-ink-500/40'
            }`}
          >
            <Calculator size={16} />
            平均分摊
          </button>
          <button
            onClick={() => setSplitMode('custom')}
            className={`flex-1 py-2 px-3 rounded-xl border-2 font-medium transition-all flex items-center justify-center gap-1 ${
              splitMode === 'custom'
                ? 'bg-tape-orange/30 border-tape-orange text-orange-700'
                : 'bg-paper-50 border-ink-500/20 text-ink-500 hover:border-ink-500/40'
            }`}
          >
            自定义
          </button>
        </div>

        <div className="space-y-3">
          {participants.map((name, index) => (
            <div key={name} className="flex items-center gap-3">
              <span className="w-6 h-6 flex items-center justify-center bg-paper-200 rounded-full text-xs font-bold text-ink-500">
                {index + 1}
              </span>
              <span className="flex-1 font-medium text-ink-700">{name}</span>
              {splitMode === 'equal' ? (
                <span className="font-mono text-ink-600 w-28 text-right">
                  {formatCurrency(equalShare)}
                </span>
              ) : (
                <div className="flex items-center gap-1">
                  <span className="text-ink-400">¥</span>
                  <input
                    type="number"
                    value={customAmounts[name] || ''}
                    onChange={(e) => handleAmountChange(name, e.target.value)}
                    className="w-20 px-2 py-1 rounded-lg border-2 border-ink-500/20 bg-paper-50 focus:border-ink-500 focus:outline-none transition-colors font-mono text-right"
                    placeholder="0"
                    min="0"
                    step="0.01"
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {splitMode === 'custom' && (
          <div className={`mt-4 p-3 rounded-xl border-2 ${
            Math.abs(diff) < 0.01
              ? 'bg-tape-green/20 border-tape-green'
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center justify-between text-sm">
              <span className={Math.abs(diff) < 0.01 ? 'text-green-700' : 'text-red-600'}>
                分摊合计
              </span>
              <span className={`font-mono font-bold ${
                Math.abs(diff) < 0.01 ? 'text-green-700' : 'text-red-600'
              }`}>
                {formatCurrency(totalCustom)}
                {Math.abs(diff) > 0.01 && (
                  <span className="text-xs ml-2">
                    (差 {formatCurrency(Math.abs(diff))})
                  </span>
                )}
              </span>
            </div>
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <button
            onClick={() => setShowSplitModal(false)}
            className="flex-1 btn-secondary"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="flex-1 btn-primary"
          >
            确认
          </button>
        </div>
      </div>
    </div>
  );
};
