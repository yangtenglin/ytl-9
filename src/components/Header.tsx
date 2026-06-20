import React from 'react';
import { NotebookPen, FolderOpen, Download, PlusCircle } from 'lucide-react';
import { useTripStore } from '@/store/useTripStore';
import { formatCurrency } from '@/utils/costUtils';

export const Header: React.FC = () => {
  const { currentPlan, setShowPlanModal, exportPlan, addItem, dateRange } = useTripStore();

  const handleQuickAdd = () => {
    if (!currentPlan || dateRange.length === 0) return;
    const firstDate = dateRange[0];
    addItem({
      title: '新项目',
      type: 'activity',
      city: currentPlan.items[0]?.city || '',
      startDate: firstDate,
      endDate: firstDate,
      cost: 0,
      participants: [],
      note: '',
    });
  };

  return (
    <header className="bg-paper-50/80 backdrop-blur-sm border-b-2 border-paper-200 sticky top-0 z-40">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-tape-orange/20 rounded-xl rotate-n-1">
              <NotebookPen size={28} className="text-ink-700" />
            </div>
            <div>
              <h1 className="font-handwritten text-3xl font-bold text-ink-700 leading-none">
                旅行手账
              </h1>
              <p className="text-xs text-ink-400 mt-0.5">预算沙盘 · 让旅行规划更有趣</p>
            </div>
          </div>

          {currentPlan && (
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-paper-100 rounded-xl">
              <span className="text-ink-500 text-sm">当前方案</span>
              <span className="font-bold text-ink-700">{currentPlan.name}</span>
              <span className="text-ink-400">·</span>
              <span className="font-mono text-sm text-ink-600">
                {dateRange.length} 天 · {currentPlan.items.length} 项
              </span>
            </div>
          )}

          <div className="flex items-center gap-2">
            {currentPlan && (
              <>
                <button
                  onClick={handleQuickAdd}
                  className="hidden sm:flex items-center gap-2 btn-secondary"
                  title="快速添加项目"
                >
                  <PlusCircle size={16} />
                  添加
                </button>
                <button
                  onClick={() => exportPlan(currentPlan.id)}
                  className="hidden sm:flex items-center gap-2 btn-secondary"
                  title="导出方案"
                >
                  <Download size={16} />
                  导出
                </button>
              </>
            )}
            <button
              onClick={() => setShowPlanModal(true)}
              className="btn-primary flex items-center gap-2"
              title="方案管理"
            >
              <FolderOpen size={16} />
              <span className="hidden sm:inline">方案</span>
            </button>
          </div>
        </div>

        {currentPlan && (
          <div className="mt-4 flex flex-wrap items-center gap-4 justify-between text-sm">
            <div className="flex items-center gap-6">
              <div>
                <span className="text-ink-400">总预算</span>
                <span className="ml-2 font-mono font-bold text-ink-700">
                  {formatCurrency(currentPlan.totalBudget)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
