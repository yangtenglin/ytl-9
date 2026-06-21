import React, { useMemo, useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  Check,
  AlertTriangle,
  AlertCircle,
  Package,
  Edit3,
  Save,
  ChevronDown,
  ChevronUp,
  Settings,
  Scale,
  Star,
  FolderPlus,
  Download,
} from 'lucide-react';
import { useTripStore } from '@/store/useTripStore';
import type { PackingItem, PackingGroup, PriorityLevel } from '@/types';
import { PRIORITY_LABELS, PRIORITY_COLORS, DEFAULT_PACKING_GROUPS } from '@/types';

const formatWeight = (grams: number): string => {
  if (grams >= 1000) {
    return `${(grams / 1000).toFixed(1)}kg`;
  }
  return `${grams.toFixed(0)}g`;
};

const GROUP_COLOR_MAP: Record<string, string> = {
  'tape-blue': 'bg-tape-blue/15 border-tape-blue/40 text-blue-700',
  'tape-pink': 'bg-tape-pink/20 border-tape-pink/40 text-pink-700',
  'tape-orange': 'bg-tape-orange/15 border-tape-orange/40 text-orange-700',
  'tape-green': 'bg-tape-green/20 border-tape-green/40 text-green-700',
  'tape-yellow': 'bg-tape-yellow/20 border-tape-yellow/50 text-amber-700',
};

interface ItemFormProps {
  groups: PackingGroup[];
  initial?: PackingItem;
  onSubmit: (data: Omit<PackingItem, 'id' | 'sortOrder'>) => void;
  onCancel: () => void;
}

const ItemForm: React.FC<ItemFormProps> = ({ groups, initial, onSubmit, onCancel }) => {
  const [form, setForm] = useState({
    name: initial?.name || '',
    quantity: initial?.quantity ?? 1,
    weight: initial?.weight ?? 100,
    unit: initial?.unit || 'g' as const,
    priority: initial?.priority || 'important' as PriorityLevel,
    groupId: initial?.groupId || groups[0]?.id || '',
    note: initial?.note || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.groupId) return;
    onSubmit({
      name: form.name.trim(),
      quantity: Math.max(1, form.quantity),
      weight: Math.max(0, form.weight),
      unit: form.unit,
      priority: form.priority,
      groupId: form.groupId,
      packed: initial?.packed ?? false,
      note: form.note.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-paper-100 rounded-xl border-2 border-dashed border-ink-500/20">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2">
          <label className="block text-xs text-ink-500 mb-1 font-medium">物品名称 *</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border-2 border-ink-500/20 bg-paper-50 text-sm focus:border-ink-500 focus:outline-none transition-colors"
            placeholder="例如：护照"
            required
          />
        </div>
        <div>
          <label className="block text-xs text-ink-500 mb-1 font-medium">所属分组 *</label>
          <select
            value={form.groupId}
            onChange={(e) => setForm({ ...form, groupId: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border-2 border-ink-500/20 bg-paper-50 text-sm focus:border-ink-500 focus:outline-none transition-colors"
            required
          >
            {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-ink-500 mb-1 font-medium">必带级别</label>
          <select
            value={form.priority}
            onChange={(e) => setForm({ ...form, priority: e.target.value as PriorityLevel })}
            className="w-full px-3 py-2 rounded-lg border-2 border-ink-500/20 bg-paper-50 text-sm focus:border-ink-500 focus:outline-none transition-colors"
          >
            {Object.entries(PRIORITY_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs text-ink-500 mb-1 font-medium">数量</label>
          <input
            type="number"
            min="1"
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: parseInt(e.target.value) || 1 })}
            className="w-full px-3 py-2 rounded-lg border-2 border-ink-500/20 bg-paper-50 text-sm font-mono focus:border-ink-500 focus:outline-none transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs text-ink-500 mb-1 font-medium">单件重量</label>
          <input
            type="number"
            min="0"
            step="0.1"
            value={form.weight}
            onChange={(e) => setForm({ ...form, weight: parseFloat(e.target.value) || 0 })}
            className="w-full px-3 py-2 rounded-lg border-2 border-ink-500/20 bg-paper-50 text-sm font-mono focus:border-ink-500 focus:outline-none transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs text-ink-500 mb-1 font-medium">单位</label>
          <select
            value={form.unit}
            onChange={(e) => setForm({ ...form, unit: e.target.value as 'g' | 'kg' })}
            className="w-full px-3 py-2 rounded-lg border-2 border-ink-500/20 bg-paper-50 text-sm focus:border-ink-500 focus:outline-none transition-colors"
          >
            <option value="g">克 (g)</option>
            <option value="kg">千克 (kg)</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs text-ink-500 mb-1 font-medium">备注</label>
        <textarea
          value={form.note}
          onChange={(e) => setForm({ ...form, note: e.target.value })}
          rows={2}
          className="w-full px-3 py-2 rounded-lg border-2 border-ink-500/20 bg-paper-50 text-sm focus:border-ink-500 focus:outline-none transition-colors resize-none"
          placeholder="添加备注信息"
        />
      </div>

      <div className="flex gap-2 pt-1">
        <button type="button" onClick={onCancel} className="flex-1 btn-secondary text-sm py-2">
          取消
        </button>
        <button type="submit" className="flex-1 btn-primary text-sm py-2 flex items-center justify-center gap-1">
          <Save size={14} />
          {initial ? '保存修改' : '添加物品'}
        </button>
      </div>
    </form>
  );
};

interface GroupFormProps {
  initial?: PackingGroup;
  onSubmit: (name: string, color: string) => void;
  onCancel: () => void;
}

const GroupForm: React.FC<GroupFormProps> = ({ initial, onSubmit, onCancel }) => {
  const [name, setName] = useState(initial?.name || '');
  const [color, setColor] = useState(initial?.color || DEFAULT_PACKING_GROUPS[0].color);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit(name.trim(), color);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 p-4 bg-paper-100 rounded-xl border-2 border-dashed border-ink-500/20">
      <div>
        <label className="block text-xs text-ink-500 mb-1 font-medium">分组名称 *</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border-2 border-ink-500/20 bg-paper-50 text-sm focus:border-ink-500 focus:outline-none transition-colors"
          placeholder="例如：衣物"
          required
        />
      </div>
      <div>
        <label className="block text-xs text-ink-500 mb-2 font-medium">颜色标签</label>
        <div className="flex gap-2 flex-wrap">
          {DEFAULT_PACKING_GROUPS.map(g => (
            <button
              key={g.color}
              type="button"
              onClick={() => setColor(g.color)}
              className={`w-8 h-8 rounded-lg border-2 transition-all ${
                GROUP_COLOR_MAP[g.color]?.split(' ')[0] || 'bg-paper-200'
              } ${color === g.color ? 'ring-2 ring-offset-2 ring-ink-500 scale-110' : ''}`}
              title={g.name}
            />
          ))}
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <button type="button" onClick={onCancel} className="flex-1 btn-secondary text-sm py-2">
          取消
        </button>
        <button type="submit" className="flex-1 btn-primary text-sm py-2 flex items-center justify-center gap-1">
          <Save size={14} />
          {initial ? '保存修改' : '添加分组'}
        </button>
      </div>
    </form>
  );
};

interface ItemCardProps {
  item: PackingItem;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const ItemCard: React.FC<ItemCardProps> = ({ item, onToggle, onEdit, onDelete }) => {
  const convertToGrams = (w: number, unit: 'g' | 'kg') => unit === 'kg' ? w * 1000 : w;
  const itemWeight = convertToGrams(item.weight * item.quantity, item.unit);
  const singleWeight = convertToGrams(item.weight, item.unit);

  return (
    <div className={`relative rounded-xl border-2 p-3 transition-all hover:shadow-paper ${
      item.packed
        ? 'bg-green-50/50 border-green-200'
        : item.priority === 'must'
        ? 'bg-red-50/40 border-red-200/60'
        : 'bg-paper-50 border-paper-200'
    }`}>
      <div className="flex items-start gap-3">
        <button
          onClick={onToggle}
          className={`flex-shrink-0 mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
            item.packed
              ? 'bg-tape-green border-tape-green text-white'
              : 'bg-paper-50 border-ink-500/30 hover:border-ink-500'
          }`}
        >
          {item.packed && <Check size={12} strokeWidth={3} />}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h4 className={`font-bold text-sm ${item.packed ? 'text-ink-400 line-through' : 'text-ink-700'}`}>
              {item.name}
            </h4>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${PRIORITY_COLORS[item.priority]}`}>
              {item.priority === 'must' && <Star size={10} fill="currentColor" />}
              {PRIORITY_LABELS[item.priority]}
            </span>
            {item.quantity > 1 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-ink-500/10 text-ink-600 border border-ink-500/20">
                ×{item.quantity}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs text-ink-500 mb-2 flex-wrap">
            <span className="flex items-center gap-1 font-mono">
              <Scale size={10} />
              {item.quantity > 1 ? (
                <>
                  {formatWeight(singleWeight)}/件 · 共 <strong className="text-ink-600">{formatWeight(itemWeight)}</strong>
                </>
              ) : (
                <strong className="text-ink-600">{formatWeight(itemWeight)}</strong>
              )}
            </span>
          </div>

          {item.note && (
            <p className="text-xs text-ink-600 bg-paper-50/60 rounded-lg px-2 py-1 mb-2 leading-relaxed">
              📝 {item.note}
            </p>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={onEdit}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-lg bg-paper-100 text-ink-500 hover:bg-tape-yellow/20 hover:text-amber-700 transition-colors"
              title="编辑"
            >
              <Edit3 size={11} />
            </button>
            <button
              onClick={onDelete}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-lg bg-paper-100 text-ink-500 hover:bg-red-100 hover:text-red-600 transition-colors"
              title="删除"
            >
              <Trash2 size={11} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface GroupSectionProps {
  group: PackingGroup;
  items: PackingItem[];
  groupWeight: number;
  onToggleItem: (id: string) => void;
  onEditItem: (item: PackingItem) => void;
  onDeleteItem: (id: string) => void;
  onEditGroup: () => void;
  onDeleteGroup: () => void;
  onAddItem: () => void;
}

const GroupSection: React.FC<GroupSectionProps> = ({
  group,
  items,
  groupWeight,
  onToggleItem,
  onEditItem,
  onDeleteItem,
  onEditGroup,
  onDeleteGroup,
  onAddItem,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const colorStyle = GROUP_COLOR_MAP[group.color || 'tape-blue'] || GROUP_COLOR_MAP['tape-blue'];

  const stats = useMemo(() => {
    const packed = items.filter(i => i.packed).length;
    const mustUnpacked = items.filter(i => i.priority === 'must' && !i.packed).length;
    const hasMustUnpacked = mustUnpacked > 0;
    return { packed, total: items.length, hasMustUnpacked, mustUnpacked };
  }, [items]);

  return (
    <div className="card-paper overflow-hidden">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className={`w-full px-4 py-3 flex items-center gap-3 transition-colors hover:bg-paper-100 ${
          stats.hasMustUnpacked ? 'bg-red-50/40' : ''
        }`}
      >
        <div className={`p-2 rounded-xl border ${colorStyle}`}>
          <Package size={18} />
        </div>

        <div className="flex-1 text-left">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-ink-700">{group.name}</h3>
            {stats.hasMustUnpacked && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-700 border border-red-300">
                <AlertTriangle size={10} />
                {stats.mustUnpacked} 项必带未装
              </span>
            )}
          </div>
          <p className="text-xs text-ink-500 mt-0.5">
            {stats.packed}/{stats.total} 已装 · 分组重量 <strong className="font-mono text-ink-600">{formatWeight(groupWeight)}</strong>
          </p>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); onAddItem(); }}
            className="p-1.5 rounded-lg hover:bg-tape-green/20 hover:text-green-700 transition-colors text-ink-400"
            title="添加物品到本分组"
          >
            <Plus size={16} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onEditGroup(); }}
            className="p-1.5 rounded-lg hover:bg-tape-yellow/20 hover:text-amber-700 transition-colors text-ink-400"
            title="编辑分组"
          >
            <Edit3 size={14} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDeleteGroup(); }}
            className="p-1.5 rounded-lg hover:bg-red-100 hover:text-red-600 transition-colors text-ink-400"
            title="删除分组"
          >
            <Trash2 size={14} />
          </button>
          <div className="text-ink-400 ml-1">
            {collapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
          </div>
        </div>
      </button>

      {!collapsed && (
        <div className="px-4 pb-4 space-y-3 border-t border-paper-200 pt-4">
          {items.length === 0 ? (
            <div className="text-center py-6 text-ink-400 text-sm">
              <Package size={24} className="mx-auto mb-2 text-ink-300" />
              暂无物品，点击上方 + 添加
            </div>
          ) : (
            items.map(item => (
              <ItemCard
                key={item.id}
                item={item}
                onToggle={() => onToggleItem(item.id)}
                onEdit={() => onEditItem(item)}
                onDelete={() => onDeleteItem(item.id)}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};

export const PackingList: React.FC = () => {
  const {
    currentPlan,
    showPackingModal,
    setShowPackingModal,
    packingStats,
    getCurrentPackingList,
    createPackingList,
    updatePackingList,
    addPackingGroup,
    updatePackingGroup,
    deletePackingGroup,
    addPackingItem,
    updatePackingItem,
    deletePackingItem,
    togglePackingItem,
    getItemsByGroup,
    calculateGroupWeight,
  } = useTripStore();

  const [showItemForm, setShowItemForm] = useState(false);
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [editingItem, setEditingItem] = useState<PackingItem | null>(null);
  const [editingGroup, setEditingGroup] = useState<PackingGroup | null>(null);
  const [prefillGroupId, setPrefillGroupId] = useState<string | null>(null);

  const [maxWeight, setMaxWeight] = useState(20);
  const [maxWeightUnit, setMaxWeightUnit] = useState<'g' | 'kg'>('kg');
  const [listName, setListName] = useState('行李清单');

  const packingList = getCurrentPackingList();

  React.useEffect(() => {
    if (packingList) {
      setMaxWeight(packingList.maxWeight);
      setMaxWeightUnit(packingList.maxWeightUnit);
      setListName(packingList.name);
    }
  }, [packingList?.id]);

  const handleSaveSettings = () => {
    if (!packingList) {
      createPackingList(listName, maxWeight, maxWeightUnit);
    } else {
      updatePackingList({ name: listName, maxWeight, maxWeightUnit });
    }
    setShowSettings(false);
  };

  const handleExportSummary = () => {
    if (!packingList || !currentPlan) return;
    const lines: string[] = [];
    lines.push(`# ${currentPlan.name} - ${packingList.name}`);
    lines.push(`生成时间: ${new Date().toLocaleString('zh-CN')}`);
    lines.push(`限重: ${packingList.maxWeight}${packingList.maxWeightUnit}`);
    lines.push(`总重: ${formatWeight(packingStats.totalWeight)} / ${packingList.maxWeight}${packingList.maxWeightUnit} (${packingStats.weightPercent.toFixed(0)}%)`);
    lines.push(``);

    packingList.groups.forEach(group => {
      const items = getItemsByGroup(group.id);
      const gWeight = calculateGroupWeight(group.id);
      if (items.length === 0) return;
      lines.push(`## ${group.name} (${formatWeight(gWeight)})`);
      items.forEach(item => {
        const convertToGrams = (w: number, unit: 'g' | 'kg') => unit === 'kg' ? w * 1000 : w;
        const w = convertToGrams(item.weight * item.quantity, item.unit);
        const mark = item.packed ? '✓' : item.priority === 'must' ? '!' : ' ';
        lines.push(`- [${mark}] ${item.name}${item.quantity > 1 ? ` ×${item.quantity}` : ''}`);
        lines.push(`  ${PRIORITY_LABELS[item.priority]} | ${formatWeight(w)}${item.note ? ` | 📝 ${item.note}` : ''}`);
      });
      lines.push('');
    });

    lines.push(`## 统计`);
    lines.push(`- 物品总数: ${packingStats.totalItems}`);
    lines.push(`- 已装: ${packingStats.packedItems} (${packingStats.totalItems > 0 ? ((packingStats.packedItems / packingStats.totalItems) * 100).toFixed(0) : 0}%)`);
    lines.push(`- 总重量: ${formatWeight(packingStats.totalWeight)}`);
    lines.push(`- 未装必带: ${packingStats.mustUnpacked}`);
    if (packingStats.isOverWeight) {
      lines.push(`- ⚠️ 超重: ${formatWeight(packingStats.totalWeight - packingStats.maxWeight)}`);
    }

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentPlan.name}-${packingList.name}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleAddItemClick = (groupId?: string) => {
    setEditingItem(null);
    if (groupId) setPrefillGroupId(groupId);
    setShowItemForm(true);
    setShowGroupForm(false);
  };

  if (!showPackingModal) return null;

  if (!packingList) {
    return (
      <div className="fixed inset-0 bg-ink-700/50 flex items-center justify-center z-50 p-4">
        <div className="relative card-paper w-full max-w-lg animate-fade-in-up">
          <div className="tape-decoration" />
          <div className="flex items-center justify-between px-6 py-4 border-b border-paper-200">
            <h2 className="font-handwritten text-3xl font-bold text-ink-700">
              <span className="handwritten-underline">行李打包清单</span>
            </h2>
            <button
              onClick={() => setShowPackingModal(false)}
              className="p-2 rounded-full hover:bg-paper-200 transition-colors text-ink-500 hover:text-ink-700"
            >
              <X size={20} />
            </button>
          </div>
          <div className="p-6 text-center">
            <Package size={64} className="mx-auto text-ink-300 mb-4" />
            <h3 className="text-xl font-bold text-ink-700 mb-2">还没有行李清单</h3>
            <p className="text-ink-500 mb-6">创建一个行李清单来开始打包吧</p>
            <div className="space-y-4 max-w-sm mx-auto text-left">
              <div>
                <label className="block text-xs text-ink-500 mb-1 font-medium">清单名称</label>
                <input
                  type="text"
                  value={listName}
                  onChange={(e) => setListName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border-2 border-ink-500/20 bg-paper-50 text-sm focus:border-ink-500 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-ink-500 mb-1 font-medium">限重</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={maxWeight}
                    onChange={(e) => setMaxWeight(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg border-2 border-ink-500/20 bg-paper-50 text-sm font-mono focus:border-ink-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-ink-500 mb-1 font-medium">单位</label>
                  <select
                    value={maxWeightUnit}
                    onChange={(e) => setMaxWeightUnit(e.target.value as 'g' | 'kg')}
                    className="w-full px-3 py-2 rounded-lg border-2 border-ink-500/20 bg-paper-50 text-sm focus:border-ink-500 focus:outline-none"
                  >
                    <option value="kg">千克 (kg)</option>
                    <option value="g">克 (g)</option>
                  </select>
                </div>
              </div>
            </div>
            <button
              onClick={handleSaveSettings}
              className="btn-primary mt-6 inline-flex items-center gap-2"
            >
              <Plus size={16} />
              创建行李清单
            </button>
          </div>
        </div>
      </div>
    );
  }

  const itemsWithPrefill = editingItem || (prefillGroupId ? { ...editingItem, groupId: prefillGroupId } as PackingItem : null);

  return (
    <div className="fixed inset-0 bg-ink-700/50 flex items-center justify-center z-50 p-4">
      <div className="relative card-paper w-full max-w-4xl max-h-[90vh] flex flex-col animate-fade-in-up">
        <div className="tape-decoration" />

        <div className="flex items-center justify-between px-6 py-4 border-b border-paper-200">
          <div>
            <h2 className="font-handwritten text-3xl font-bold text-ink-700">
              <span className="handwritten-underline">{packingList.name}</span>
            </h2>
            <p className="text-xs text-ink-500 mt-1">分组管理 · 重量控制 · 必带标记 · 本地自动保存</p>
          </div>
          <button
            onClick={() => setShowPackingModal(false)}
            className="p-2 rounded-full hover:bg-paper-200 transition-colors text-ink-500 hover:text-ink-700"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-4 border-b border-paper-200 bg-paper-50/50 space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            <div className="bg-paper-50 rounded-xl p-3 border border-paper-200 text-center">
              <div className="font-mono text-xl font-bold text-ink-700">{packingStats.totalItems}</div>
              <div className="text-xs text-ink-500">物品总数</div>
            </div>
            <div className="bg-tape-green/15 rounded-xl p-3 border border-tape-green/40 text-center">
              <div className="font-mono text-xl font-bold text-green-700">{packingStats.packedItems}/{packingStats.totalItems}</div>
              <div className="text-xs text-green-700">已装箱</div>
            </div>
            <div className={`rounded-xl p-3 border text-center ${packingStats.isOverWeight ? 'bg-red-100 border-red-300 animate-pulse' : 'bg-tape-blue/15 border-tape-blue/40'}`}>
              <div className={`font-mono text-lg font-bold ${packingStats.isOverWeight ? 'text-red-600' : 'text-blue-700'}`}>
                {formatWeight(packingStats.totalWeight)}
              </div>
              <div className={`text-xs ${packingStats.isOverWeight ? 'text-red-600' : 'text-blue-700'}`}>
                总重量
              </div>
            </div>
            <div className={`rounded-xl p-3 border text-center ${packingStats.isOverWeight ? 'bg-red-100 border-red-300' : 'bg-paper-50 border-paper-200'}`}>
              <div className={`font-mono text-lg font-bold ${packingStats.isOverWeight ? 'text-red-600' : 'text-ink-700'}`}>
                {packingStats.weightPercent.toFixed(0)}%
              </div>
              <div className={`text-xs ${packingStats.isOverWeight ? 'text-red-600' : 'text-ink-500'}`}>
                / {packingList.maxWeight}{packingList.maxWeightUnit}
              </div>
            </div>
            <div className={`rounded-xl p-3 border text-center ${packingStats.mustUnpacked > 0 ? 'bg-red-100/70 border-red-300' : 'bg-paper-50 border-paper-200'}`}>
              <div className={`font-mono text-xl font-bold ${packingStats.mustUnpacked > 0 ? 'text-red-600' : 'text-ink-700'}`}>
                {packingStats.mustUnpacked}
              </div>
              <div className={`text-xs ${packingStats.mustUnpacked > 0 ? 'text-red-600' : 'text-ink-500'}`}>未装必带</div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs text-ink-500 mb-1">
              <span>重量进度</span>
              <span className="font-mono">
                {packingStats.isOverWeight ? (
                  <span className="text-red-600 font-bold flex items-center gap-1">
                    <AlertCircle size={12} />
                    超重 {formatWeight(packingStats.totalWeight - packingStats.maxWeight)}！
                  </span>
                ) : (
                  `${packingStats.weightPercent.toFixed(1)}%`
                )}
              </span>
            </div>
            <div className="h-3 bg-paper-200 rounded-full overflow-hidden relative">
              {packingStats.isOverWeight && packingStats.maxWeight > 0 && (
                <div
                  className="absolute top-0 left-0 h-full bg-red-200/50 border-r-2 border-dashed border-red-400"
                  style={{ width: '100%' }}
                />
              )}
              <div
                className={`h-full transition-all duration-500 relative ${
                  packingStats.isOverWeight
                    ? 'bg-gradient-to-r from-red-400 to-red-600'
                    : packingStats.weightPercent > 85
                    ? 'bg-gradient-to-r from-amber-400 to-orange-500'
                    : 'bg-gradient-to-r from-tape-green to-tape-blue'
                }`}
                style={{ width: `${Math.min(100, packingStats.weightPercent)}%` }}
              />
            </div>
          </div>

          {packingStats.isOverWeight && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border-2 border-red-200 text-red-700">
              <AlertTriangle size={20} className="flex-shrink-0" />
              <div className="text-sm">
                <strong>行李已超重！</strong>请减少物品或考虑拆分托运。超出部分可能产生额外费用。
              </div>
            </div>
          )}

          {packingStats.mustUnpacked > 0 && !packingStats.isOverWeight && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 border-2 border-amber-200 text-amber-700">
              <AlertCircle size={20} className="flex-shrink-0" />
              <div className="text-sm">
                还有 <strong>{packingStats.mustUnpacked}</strong> 项必带物品未装箱，请确认已全部打包。
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleAddItemClick()}
              className="btn-primary flex items-center gap-2 text-sm py-2"
            >
              <Plus size={14} />
              添加物品
            </button>
            <button
              onClick={() => { setShowGroupForm(true); setShowItemForm(false); setEditingGroup(null); }}
              className="btn-secondary flex items-center gap-2 text-sm py-2"
            >
              <FolderPlus size={14} />
              新增分组
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="btn-secondary flex items-center gap-2 text-sm py-2"
            >
              <Settings size={14} />
              限重设置
            </button>
            <button
              onClick={handleExportSummary}
              disabled={packingStats.totalItems === 0}
              className="btn-secondary flex items-center gap-2 text-sm py-2 disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
            >
              <Download size={14} />
              导出清单
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {showSettings && (
            <div className="space-y-4 p-4 bg-paper-100 rounded-xl border-2 border-dashed border-ink-500/20">
              <h3 className="text-sm font-bold text-ink-600 flex items-center gap-2">
                <Settings size={14} />
                清单设置
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <label className="block text-xs text-ink-500 mb-1 font-medium">清单名称</label>
                  <input
                    type="text"
                    value={listName}
                    onChange={(e) => setListName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border-2 border-ink-500/20 bg-paper-50 text-sm focus:border-ink-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-ink-500 mb-1 font-medium">限重</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={maxWeight}
                    onChange={(e) => setMaxWeight(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg border-2 border-ink-500/20 bg-paper-50 text-sm font-mono focus:border-ink-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-ink-500 mb-1 font-medium">单位</label>
                  <select
                    value={maxWeightUnit}
                    onChange={(e) => setMaxWeightUnit(e.target.value as 'g' | 'kg')}
                    className="w-full px-3 py-2 rounded-lg border-2 border-ink-500/20 bg-paper-50 text-sm focus:border-ink-500 focus:outline-none"
                  >
                    <option value="kg">千克 (kg)</option>
                    <option value="g">克 (g)</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowSettings(false)} className="flex-1 btn-secondary text-sm py-2">
                  取消
                </button>
                <button onClick={handleSaveSettings} className="flex-1 btn-primary text-sm py-2 flex items-center justify-center gap-1">
                  <Save size={14} />
                  保存设置
                </button>
              </div>
            </div>
          )}

          {showGroupForm && (
            <div>
              <h3 className="text-sm font-bold text-ink-600 mb-2 flex items-center gap-2">
                <FolderPlus size={14} />
                {editingGroup ? '编辑分组' : '新增分组'}
              </h3>
              <GroupForm
                initial={editingGroup || undefined}
                onSubmit={(name, color) => {
                  if (editingGroup) {
                    updatePackingGroup(editingGroup.id, { name, color });
                  } else {
                    addPackingGroup(name, color);
                  }
                  setShowGroupForm(false);
                  setEditingGroup(null);
                }}
                onCancel={() => { setShowGroupForm(false); setEditingGroup(null); }}
              />
            </div>
          )}

          {showItemForm && (
            <div>
              <h3 className="text-sm font-bold text-ink-600 mb-2 flex items-center gap-2">
                <Package size={14} />
                {editingItem ? '编辑物品' : '新增物品'}
              </h3>
              <ItemForm
                groups={packingList.groups}
                initial={itemsWithPrefill || undefined}
                onSubmit={(data) => {
                  if (editingItem) {
                    updatePackingItem(editingItem.id, data);
                  } else {
                    addPackingItem(data);
                  }
                  setShowItemForm(false);
                  setEditingItem(null);
                  setPrefillGroupId(null);
                }}
                onCancel={() => { setShowItemForm(false); setEditingItem(null); setPrefillGroupId(null); }}
              />
            </div>
          )}

          {packingList.groups.length === 0 && packingList.items.length === 0 ? (
            <div className="text-center py-12 dashed-border rounded-xl">
              <Package size={48} className="mx-auto text-ink-300 mb-4" />
              <p className="text-ink-500 mb-4">还没有添加任何物品</p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <button
                  onClick={() => handleAddItemClick()}
                  className="btn-primary inline-flex items-center gap-2"
                >
                  <Plus size={16} />
                  添加第一项物品
                </button>
                <button
                  onClick={() => { setShowGroupForm(true); setShowItemForm(false); }}
                  className="btn-secondary inline-flex items-center gap-2"
                >
                  <FolderPlus size={16} />
                  先创建分组
                </button>
              </div>
            </div>
          ) : (
            packingList.groups
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .map(group => (
                <GroupSection
                  key={group.id}
                  group={group}
                  items={getItemsByGroup(group.id)}
                  groupWeight={calculateGroupWeight(group.id)}
                  onToggleItem={togglePackingItem}
                  onEditItem={(item) => { setEditingItem(item); setShowItemForm(true); setShowGroupForm(false); setPrefillGroupId(null); }}
                  onDeleteItem={(id) => {
                    if (confirm('确定删除这个物品吗？')) deletePackingItem(id);
                  }}
                  onEditGroup={() => { setEditingGroup(group); setShowGroupForm(true); setShowItemForm(false); }}
                  onDeleteGroup={() => {
                    if (confirm(`确定删除分组"${group.name}"吗？该分组下的物品也会被删除。`)) {
                      deletePackingGroup(group.id);
                    }
                  }}
                  onAddItem={() => handleAddItemClick(group.id)}
                />
              ))
          )}
        </div>
      </div>
    </div>
  );
};
