import React, { useRef } from 'react';
import { X, Plus, Trash2, Download, Upload, Calendar, MapPin } from 'lucide-react';
import { useTripStore } from '@/store/useTripStore';
import { formatCurrency } from '@/utils/costUtils';
import { readJSONFile } from '@/utils/storageUtils';

export const PlanManager: React.FC = () => {
  const {
    plans,
    currentPlanId,
    setCurrentPlanId,
    setShowPlanModal,
    createPlan,
    deletePlan,
    exportPlan,
    importPlan,
  } = useTripStore();

  const [newPlanName, setNewPlanName] = React.useState('');
  const [newPlanBudget, setNewPlanBudget] = React.useState('10000');
  const [showCreateForm, setShowCreateForm] = React.useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCreate = () => {
    const budget = parseFloat(newPlanBudget) || 0;
    if (newPlanName.trim() && budget >= 0) {
      createPlan(newPlanName.trim(), budget);
      setNewPlanName('');
      setNewPlanBudget('10000');
      setShowCreateForm(false);
    }
  };

  const handleSelectPlan = (id: string) => {
    setCurrentPlanId(id);
    setShowPlanModal(false);
  };

  const handleDelete = (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    if (confirm(`确定删除方案「${name}」吗？此操作不可恢复。`)) {
      deletePlan(id);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const content = await readJSONFile(file);
        importPlan(JSON.stringify(content));
      } catch (err) {
        alert('导入失败，请检查文件格式');
      }
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 bg-ink-700/50 flex items-center justify-center z-50 p-4">
      <div className="relative card-paper w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto animate-fade-in-up">
        <div className="tape-decoration-green" />

        <button
          onClick={() => setShowPlanModal(false)}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-paper-200 transition-colors text-ink-500 hover:text-ink-700"
        >
          <X size={20} />
        </button>

        <h2 className="font-handwritten text-3xl font-bold text-ink-700 mb-6 text-center">
          <span className="handwritten-underline">方案管理</span>
        </h2>

        <div className="space-y-3 mb-6">
          {plans.length === 0 ? (
            <div className="text-center py-8 text-ink-400 dashed-border rounded-xl">
              还没有方案，创建一个开始规划吧！
            </div>
          ) : (
            plans.map((plan, index) => {
              const isActive = plan.id === currentPlanId;
              const totalSpent = plan.items.reduce((sum, item) => sum + item.cost, 0);
              const cities = [...new Set(plan.items.map(i => i.city))].filter(Boolean);
              const rotation = (index % 2 === 0 ? -0.5 : 0.5);

              return (
                <div
                  key={plan.id}
                  onClick={() => handleSelectPlan(plan.id)}
                  className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-paper-lg group ${
                    isActive
                      ? 'bg-tape-orange/10 border-tape-orange shadow-paper'
                      : 'bg-paper-50 border-paper-200 hover:border-ink-500/30'
                  }`}
                  style={{ transform: `rotate(${rotation}deg)` }}
                >
                  {isActive && (
                    <div className="absolute -top-2 -right-2 bg-tape-orange text-white px-3 py-1 text-xs font-bold rounded-full transform rotate-3">
                      当前方案
                    </div>
                  )}

                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-ink-700 mb-1">
                        {plan.name}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-ink-500">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          更新于 {formatDate(plan.updatedAt)}
                        </span>
                        {cities.length > 0 && (
                          <span className="flex items-center gap-1">
                            <MapPin size={12} />
                            {cities.slice(0, 3).join('、')}
                            {cities.length > 3 && ` +${cities.length - 3}`}
                          </span>
                        )}
                        <span>{plan.items.length} 项安排</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-mono font-bold text-ink-700">
                        {formatCurrency(totalSpent)}
                      </div>
                      <div className="text-xs text-ink-400">
                        / {formatCurrency(plan.totalBudget)}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        exportPlan(plan.id);
                      }}
                      className="px-3 py-1 text-xs rounded-lg bg-paper-100 hover:bg-tape-blue/20 text-ink-500 hover:text-blue-600 transition-colors flex items-center gap-1"
                    >
                      <Download size={12} />
                      导出
                    </button>
                    <button
                      onClick={(e) => handleDelete(e, plan.id, plan.name)}
                      className="px-3 py-1 text-xs rounded-lg bg-paper-100 hover:bg-red-100 text-ink-500 hover:text-red-600 transition-colors flex items-center gap-1"
                    >
                      <Trash2 size={12} />
                      删除
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {showCreateForm ? (
          <div className="p-4 bg-tape-yellow/20 rounded-xl border-2 border-dashed border-tape-yellow">
            <h3 className="font-bold text-ink-700 mb-3">创建新方案</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-ink-600 mb-1">方案名称</label>
                <input
                  type="text"
                  value={newPlanName}
                  onChange={(e) => setNewPlanName(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border-2 border-ink-500/20 bg-paper-50 focus:border-ink-500 focus:outline-none transition-colors"
                  placeholder="如：东京夏日之旅"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm text-ink-600 mb-1">总预算</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400">¥</span>
                  <input
                    type="number"
                    value={newPlanBudget}
                    onChange={(e) => setNewPlanBudget(e.target.value)}
                    className="w-full pl-8 pr-4 py-2 rounded-xl border-2 border-ink-500/20 bg-paper-50 focus:border-ink-500 focus:outline-none transition-colors font-mono"
                    placeholder="10000"
                    min="0"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 btn-secondary"
                >
                  取消
                </button>
                <button
                  onClick={handleCreate}
                  className="flex-1 btn-primary"
                  disabled={!newPlanName.trim()}
                >
                  创建
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={() => setShowCreateForm(true)}
              className="flex-1 btn-primary flex items-center justify-center gap-2"
            >
              <Plus size={16} />
              创建新方案
            </button>
            <label className="flex-1 btn-secondary flex items-center justify-center gap-2 cursor-pointer">
              <Upload size={16} />
              导入方案
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </label>
          </div>
        )}
      </div>
    </div>
  );
};
