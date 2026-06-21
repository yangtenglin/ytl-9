import React from 'react';
import { X, Save, Users, CalendarRange, TreeDeciduous, Building, Plus, Trash2, RefreshCw } from 'lucide-react';
import { useTripStore } from '@/store/useTripStore';
import type { TripItem, ItemType, BackupPlan } from '@/types';
import { ITEM_TYPE_LABELS } from '@/types';
import { formatDate } from '@/utils/dateUtils';
import { formatCurrency } from '@/utils/costUtils';
import { generateId } from '@/utils/dateUtils';

interface ItemEditorProps {
  item: TripItem;
  onClose: () => void;
}

const typeOptions: { value: ItemType; label: string; color: string }[] = [
  { value: 'transport', label: '交通', color: 'bg-tape-orange/20 border-tape-orange text-orange-700' },
  { value: 'accommodation', label: '住宿', color: 'bg-tape-pink/20 border-tape-pink text-pink-700' },
  { value: 'activity', label: '活动', color: 'bg-tape-green/20 border-tape-green text-green-700' },
];

interface BackupPlanForm {
  id: string;
  title: string;
  type: ItemType;
  cost: string;
  note: string;
}

export const ItemEditor: React.FC<ItemEditorProps> = ({ item, onClose }) => {
  const { updateItem, setShowSplitModal } = useTripStore();
  const [formData, setFormData] = React.useState({
    title: item.title,
    type: item.type,
    city: item.city,
    startDate: item.startDate,
    endDate: item.endDate,
    cost: String(item.cost),
    note: item.note,
    participants: item.participants,
    isCrossDay: item.startDate !== item.endDate,
    newParticipant: '',
    isOutdoor: item.isOutdoor,
  });

  const [backupPlans, setBackupPlans] = React.useState<BackupPlanForm[]>(
    item.backupPlans.map(b => ({
      id: b.id,
      title: b.title,
      type: b.type,
      cost: String(b.cost),
      note: b.note,
    }))
  );

  const handleChange = (field: keyof typeof formData, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTypeChange = (type: ItemType) => {
    handleChange('type', type);
  };

  const handleCrossDayToggle = () => {
    const newIsCrossDay = !formData.isCrossDay;
    handleChange('isCrossDay', newIsCrossDay);
    if (!newIsCrossDay) {
      handleChange('endDate', formData.startDate);
    }
  };

  const handleAddParticipant = () => {
    const name = formData.newParticipant.trim();
    if (name && !formData.participants.includes(name)) {
      handleChange('participants', [...formData.participants, name]);
      handleChange('newParticipant', '');
    }
  };

  const handleRemoveParticipant = (name: string) => {
    handleChange('participants', formData.participants.filter(p => p !== name));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.target as HTMLInputElement).id === 'participant-input') {
      e.preventDefault();
      handleAddParticipant();
    }
  };

  const handleAddBackupPlan = () => {
    const newBackup: BackupPlanForm = {
      id: generateId(),
      title: '',
      type: 'activity',
      cost: '0',
      note: '',
    };
    setBackupPlans(prev => [...prev, newBackup]);
  };

  const handleRemoveBackupPlan = (id: string) => {
    setBackupPlans(prev => prev.filter(b => b.id !== id));
  };

  const handleBackupChange = (id: string, field: keyof BackupPlanForm, value: string) => {
    setBackupPlans(prev => prev.map(b =>
      b.id === id ? { ...b, [field]: value } : b
    ));
  };

  const handleSave = () => {
    const cost = parseFloat(formData.cost) || 0;
    const validBackupPlans: BackupPlan[] = backupPlans
      .filter(b => b.title.trim())
      .map(b => ({
        id: b.id,
        title: b.title.trim(),
        type: b.type,
        cost: parseFloat(b.cost) || 0,
        note: b.note.trim(),
      }));
    const validBackupIds = validBackupPlans.map(b => b.id);
    const newActiveBackupId = item.activeBackupId && validBackupIds.includes(item.activeBackupId)
      ? item.activeBackupId
      : null;

    updateItem(item.id, {
      title: formData.title,
      type: formData.type,
      city: formData.city,
      startDate: formData.startDate,
      endDate: formData.isCrossDay ? formData.endDate : formData.startDate,
      cost,
      note: formData.note,
      participants: formData.participants,
      isOutdoor: formData.isOutdoor,
      backupPlans: validBackupPlans,
      activeBackupId: newActiveBackupId,
    });
    onClose();
  };

  const perPerson = formData.participants.length > 0
    ? (parseFloat(formData.cost) || 0) / formData.participants.length
    : 0;

  return (
    <div className="fixed inset-0 bg-ink-700/50 flex items-center justify-center z-50 p-4">
      <div className="relative card-paper w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto animate-fade-in-up">
        <div className="tape-decoration" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-paper-200 transition-colors text-ink-500 hover:text-ink-700"
        >
          <X size={20} />
        </button>

        <h2 className="font-handwritten text-3xl font-bold text-ink-700 mb-6 text-center">
          <span className="handwritten-underline">编辑项目</span>
        </h2>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-ink-600 mb-1.5">
              项目名称
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="w-full px-4 py-2 rounded-xl border-2 border-ink-500/20 bg-paper-50 focus:border-ink-500 focus:outline-none transition-colors"
              placeholder="输入项目名称"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-600 mb-1.5">
              类型
            </label>
            <div className="flex gap-2">
              {typeOptions.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => handleTypeChange(opt.value)}
                  className={`flex-1 py-2 px-3 rounded-xl border-2 font-medium transition-all ${
                    formData.type === opt.value
                      ? `${opt.color} border-current shadow-paper`
                      : 'bg-paper-50 border-ink-500/20 text-ink-500 hover:border-ink-500/40'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink-600 mb-1.5">
                城市
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => handleChange('city', e.target.value)}
                className="w-full px-4 py-2 rounded-xl border-2 border-ink-500/20 bg-paper-50 focus:border-ink-500 focus:outline-none transition-colors"
                placeholder="如：东京、京都、大阪"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-600 mb-1.5">
                活动场景
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => handleChange('isOutdoor', true)}
                  className={`flex-1 py-2 px-3 rounded-xl border-2 font-medium text-sm transition-all flex items-center justify-center gap-1 ${
                    formData.isOutdoor
                      ? 'bg-emerald-100 border-emerald-400 text-emerald-800 shadow-paper'
                      : 'bg-paper-50 border-ink-500/20 text-ink-500 hover:border-ink-500/40'
                  }`}
                >
                  <TreeDeciduous size={14} />
                  户外
                </button>
                <button
                  onClick={() => handleChange('isOutdoor', false)}
                  className={`flex-1 py-2 px-3 rounded-xl border-2 font-medium text-sm transition-all flex items-center justify-center gap-1 ${
                    !formData.isOutdoor
                      ? 'bg-slate-100 border-slate-400 text-slate-700 shadow-paper'
                      : 'bg-paper-50 border-ink-500/20 text-ink-500 hover:border-ink-500/40'
                  }`}
                >
                  <Building size={14} />
                  室内
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="crossDay"
                checked={formData.isCrossDay}
                onChange={handleCrossDayToggle}
                className="w-4 h-4 rounded border-ink-500/30 text-ink-600 focus:ring-ink-500"
              />
              <label htmlFor="crossDay" className="text-sm text-ink-600 flex items-center gap-1">
                <CalendarRange size={14} />
                跨日项目
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink-600 mb-1.5">
                开始日期
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => {
                  handleChange('startDate', e.target.value);
                  if (!formData.isCrossDay) {
                    handleChange('endDate', e.target.value);
                  }
                }}
                className="w-full px-4 py-2 rounded-xl border-2 border-ink-500/20 bg-paper-50 focus:border-ink-500 focus:outline-none transition-colors"
              />
              <div className="text-xs text-ink-400 mt-1">
                {formatDate(formData.startDate)}
              </div>
            </div>
            {formData.isCrossDay && (
              <div>
                <label className="block text-sm font-medium text-ink-600 mb-1.5">
                  结束日期
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleChange('endDate', e.target.value)}
                  min={formData.startDate}
                  className="w-full px-4 py-2 rounded-xl border-2 border-ink-500/20 bg-paper-50 focus:border-ink-500 focus:outline-none transition-colors"
                />
                <div className="text-xs text-ink-400 mt-1">
                  {formatDate(formData.endDate)}
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-600 mb-1.5">
              费用 (¥)
            </label>
            <input
              type="number"
              value={formData.cost}
              onChange={(e) => handleChange('cost', e.target.value)}
              className="w-full px-4 py-2 rounded-xl border-2 border-ink-500/20 bg-paper-50 focus:border-ink-500 focus:outline-none transition-colors font-mono text-lg"
              placeholder="0"
              min="0"
              step="0.01"
            />
            {formData.participants.length > 0 && (
              <div className="text-xs text-ink-500 mt-1 flex items-center gap-2">
                <Users size={12} />
                {formData.participants.length} 人分摊 · 人均 ¥{perPerson.toFixed(2)}
                <button
                  onClick={() => setShowSplitModal(true)}
                  className="ml-auto text-tape-orange hover:underline"
                >
                  调整分摊
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-600 mb-1.5 flex items-center gap-1">
              <Users size={14} />
              参与人员
              <span className="text-ink-400 text-xs">（用于费用分摊）</span>
            </label>
            <div className="flex gap-2">
              <input
                id="participant-input"
                type="text"
                value={formData.newParticipant}
                onChange={(e) => handleChange('newParticipant', e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 px-4 py-2 rounded-xl border-2 border-ink-500/20 bg-paper-50 focus:border-ink-500 focus:outline-none transition-colors text-sm"
                placeholder="输入姓名后回车添加"
              />
              <button
                onClick={handleAddParticipant}
                className="px-4 py-2 btn-secondary"
              >
                添加
              </button>
            </div>
            {formData.participants.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.participants.map(name => (
                  <span
                    key={name}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-tape-yellow/30 border border-tape-yellow rounded-full text-sm text-ink-600"
                  >
                    {name}
                    <button
                      onClick={() => handleRemoveParticipant(name)}
                      className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-red-200 text-ink-500 hover:text-red-600 transition-colors"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-600 mb-1.5 flex items-center gap-1">
              <RefreshCw size={14} />
              备用方案
              <span className="text-ink-400 text-xs">（雨天备选）</span>
            </label>
            {backupPlans.length === 0 && (
              <div className="text-xs text-ink-400 mb-2">
                暂无备用方案，下雨时可点击「+ 添加备用方案」来添加室内替代活动
              </div>
            )}
            <div className="space-y-3">
              {backupPlans.map((backup, idx) => (
                <div
                  key={backup.id}
                  className="p-3 rounded-xl border-2 border-blue-200 bg-blue-50/50 relative"
                >
                  <button
                    onClick={() => handleRemoveBackupPlan(backup.id)}
                    className="absolute top-2 right-2 p-1 rounded hover:bg-red-100 text-ink-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                  <div className="text-xs font-medium text-blue-700 mb-2">
                    备选方案 {idx + 1}
                  </div>
                  <div className="space-y-2 pr-8">
                    <div>
                      <input
                        type="text"
                        value={backup.title}
                        onChange={(e) => handleBackupChange(backup.id, 'title', e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-ink-300 bg-paper-50 text-sm focus:border-blue-400 focus:outline-none"
                        placeholder="备用方案名称"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={backup.type}
                        onChange={(e) => handleBackupChange(backup.id, 'type', e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-ink-300 bg-paper-50 text-sm focus:border-blue-400 focus:outline-none"
                      >
                        {typeOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 text-sm">¥</span>
                        <input
                          type="number"
                          value={backup.cost}
                          onChange={(e) => handleBackupChange(backup.id, 'cost', e.target.value)}
                          className="w-full pl-7 pr-3 py-1.5 rounded-lg border border-ink-300 bg-paper-50 text-sm font-mono focus:border-blue-400 focus:outline-none"
                          placeholder="0"
                          min="0"
                        />
                      </div>
                    </div>
                    <div>
                      <input
                        type="text"
                        value={backup.note}
                        onChange={(e) => handleBackupChange(backup.id, 'note', e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-ink-300 bg-paper-50 text-sm focus:border-blue-400 focus:outline-none"
                        placeholder="方案说明（可选）"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={handleAddBackupPlan}
              className="w-full mt-2 py-2 rounded-xl border-2 border-dashed border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400 transition-colors text-sm flex items-center justify-center gap-1"
            >
              <Plus size={16} />
              添加备用方案
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-600 mb-1.5">
              备注
            </label>
            <textarea
              value={formData.note}
              onChange={(e) => handleChange('note', e.target.value)}
              rows={3}
              className="w-full px-4 py-2 rounded-xl border-2 border-ink-500/20 bg-paper-50 focus:border-ink-500 focus:outline-none transition-colors resize-none notebook-lines"
              placeholder="添加一些备注信息..."
            />
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
