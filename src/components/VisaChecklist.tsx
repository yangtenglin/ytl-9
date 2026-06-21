import React, { useMemo, useRef, useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  Upload,
  Download,
  Check,
  AlertTriangle,
  AlertCircle,
  FileText,
  User,
  Calendar,
  Clock,
  Edit3,
  Save,
  Eye,
  ChevronDown,
  ChevronUp,
  FileCheck2,
  FileX2,
  Shield,
  Filter,
  Layers,
  SortAsc,
  SortDesc,
  Flame,
} from 'lucide-react';
import { useTripStore } from '@/store/useTripStore';
import type { VisaDocument, VisaDocumentStatus, ExpiryAlertLevel } from '@/types';

const STATUS_LABELS: Record<VisaDocumentStatus, string> = {
  pending: '待准备',
  submitted: '已提交',
  approved: '已通过',
  rejected: '已拒绝',
};

const STATUS_COLORS: Record<VisaDocumentStatus, string> = {
  pending: 'bg-ink-500/20 text-ink-600 border-ink-500/30',
  submitted: 'bg-tape-blue/20 text-blue-700 border-tape-blue/50',
  approved: 'bg-tape-green/30 text-green-700 border-tape-green/50',
  rejected: 'bg-red-200/60 text-red-700 border-red-300',
};

const EXPIRY_STYLES: Record<ExpiryAlertLevel, { bg: string; border: string; text: string; icon: React.ReactNode; label: string }> = {
  normal: {
    bg: 'bg-green-50/60',
    border: 'border-green-200',
    text: 'text-green-700',
    icon: <Shield size={14} />,
    label: '有效',
  },
  warning: {
    bg: 'bg-tape-yellow/20',
    border: 'border-tape-yellow',
    text: 'text-amber-700',
    icon: <AlertCircle size={14} />,
    label: '即将到期',
  },
  danger: {
    bg: 'bg-orange-100/70',
    border: 'border-orange-300',
    text: 'text-orange-700',
    icon: <AlertTriangle size={14} />,
    label: '紧急',
  },
  expired: {
    bg: 'bg-red-100/80',
    border: 'border-red-400',
    text: 'text-red-700',
    icon: <FileX2 size={14} />,
    label: '已过期',
  },
};

const DOCUMENT_TYPES = ['护照', '签证', '日本签证', '美国签证', '申根签证', '机票行程单', '酒店预订单', '保险单', '身份证', '驾照', '其他'];

const getDaysUntil = (dateStr: string): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

const formatDateDisplay = (dateStr: string): string => {
  const date = new Date(dateStr);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

interface DocumentFormProps {
  initial?: VisaDocument;
  travelers: string[];
  onSubmit: (data: Omit<VisaDocument, 'id' | 'sortOrder'>) => void;
  onCancel: () => void;
}

const DocumentForm: React.FC<DocumentFormProps> = ({ initial, travelers, onSubmit, onCancel }) => {
  const [form, setForm] = useState({
    travelerName: initial?.travelerName || travelers[0] || '',
    documentType: initial?.documentType || '',
    customType: '',
    documentNumber: initial?.documentNumber || '',
    issueDate: initial?.issueDate || formatDateDisplay(new Date().toISOString()),
    expiryDate: initial?.expiryDate || '',
    alertDaysBefore: initial?.alertDaysBefore ?? 60,
    status: initial?.status || 'pending' as VisaDocumentStatus,
    note: initial?.note || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const docType = form.documentType === '其他' ? form.customType.trim() : form.documentType;
    if (!form.travelerName.trim() || !docType || !form.expiryDate) return;

    onSubmit({
      travelerName: form.travelerName.trim(),
      documentType: docType,
      documentNumber: form.documentNumber.trim(),
      issueDate: form.issueDate,
      expiryDate: form.expiryDate,
      alertDaysBefore: Math.max(0, form.alertDaysBefore),
      status: form.status,
      uploaded: initial?.uploaded ?? false,
      checked: initial?.checked ?? false,
      uploadFileName: initial?.uploadFileName,
      uploadFileData: initial?.uploadFileData,
      note: form.note.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-paper-100 rounded-xl border-2 border-dashed border-ink-500/20">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-ink-500 mb-1 font-medium">旅客姓名 *</label>
          <input
            type="text"
            value={form.travelerName}
            onChange={(e) => setForm({ ...form, travelerName: e.target.value })}
            list="travelers-list"
            className="w-full px-3 py-2 rounded-lg border-2 border-ink-500/20 bg-paper-50 text-sm focus:border-ink-500 focus:outline-none transition-colors"
            placeholder="输入姓名"
            required
          />
          <datalist id="travelers-list">
            {travelers.map(t => <option key={t} value={t} />)}
          </datalist>
        </div>
        <div>
          <label className="block text-xs text-ink-500 mb-1 font-medium">证件类型 *</label>
          <select
            value={DOCUMENT_TYPES.includes(form.documentType) ? form.documentType : '其他'}
            onChange={(e) => setForm({ ...form, documentType: e.target.value, customType: '' })}
            className="w-full px-3 py-2 rounded-lg border-2 border-ink-500/20 bg-paper-50 text-sm focus:border-ink-500 focus:outline-none transition-colors"
          >
            {DOCUMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      {form.documentType === '其他' && (
        <div>
          <label className="block text-xs text-ink-500 mb-1 font-medium">自定义类型 *</label>
          <input
            type="text"
            value={form.customType}
            onChange={(e) => setForm({ ...form, customType: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border-2 border-ink-500/20 bg-paper-50 text-sm focus:border-ink-500 focus:outline-none transition-colors"
            placeholder="请输入证件类型"
            required
          />
        </div>
      )}

      <div>
        <label className="block text-xs text-ink-500 mb-1 font-medium">证件号码</label>
        <input
          type="text"
          value={form.documentNumber}
          onChange={(e) => setForm({ ...form, documentNumber: e.target.value })}
          className="w-full px-3 py-2 rounded-lg border-2 border-ink-500/20 bg-paper-50 text-sm font-mono focus:border-ink-500 focus:outline-none transition-colors"
          placeholder="选填"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-ink-500 mb-1 font-medium">签发日期</label>
          <input
            type="date"
            value={form.issueDate}
            onChange={(e) => setForm({ ...form, issueDate: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border-2 border-ink-500/20 bg-paper-50 text-sm focus:border-ink-500 focus:outline-none transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs text-ink-500 mb-1 font-medium">到期日期 *</label>
          <input
            type="date"
            value={form.expiryDate}
            onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border-2 border-ink-500/20 bg-paper-50 text-sm focus:border-ink-500 focus:outline-none transition-colors"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-ink-500 mb-1 font-medium">提前提醒（天）</label>
          <input
            type="number"
            min="0"
            value={form.alertDaysBefore}
            onChange={(e) => setForm({ ...form, alertDaysBefore: parseInt(e.target.value) || 0 })}
            className="w-full px-3 py-2 rounded-lg border-2 border-ink-500/20 bg-paper-50 text-sm font-mono focus:border-ink-500 focus:outline-none transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs text-ink-500 mb-1 font-medium">办理状态</label>
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value as VisaDocumentStatus })}
            className="w-full px-3 py-2 rounded-lg border-2 border-ink-500/20 bg-paper-50 text-sm focus:border-ink-500 focus:outline-none transition-colors"
          >
            {Object.entries(STATUS_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
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
          {initial ? '保存修改' : '添加证件'}
        </button>
      </div>
    </form>
  );
};

interface DocumentCardProps {
  doc: VisaDocument;
  expiryLevel: ExpiryAlertLevel;
  onToggleChecked: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onUpload: (file: File) => void;
  onRemoveUpload: () => void;
  onViewFile: () => void;
  onStatusChange: (status: VisaDocumentStatus) => void;
}

const DocumentCard: React.FC<DocumentCardProps> = ({
  doc,
  expiryLevel,
  onToggleChecked,
  onEdit,
  onDelete,
  onUpload,
  onRemoveUpload,
  onViewFile,
  onStatusChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const style = EXPIRY_STYLES[expiryLevel];
  const daysUntil = getDaysUntil(doc.expiryDate);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUpload(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className={`relative rounded-xl border-2 ${style.border} ${style.bg} p-3 transition-all hover:shadow-paper ${expiryLevel === 'expired' ? 'animate-pulse' : ''}`}>
      {expiryLevel === 'expired' && (
        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full transform rotate-3 shadow-paper">
          已过期
        </div>
      )}
      {expiryLevel === 'danger' && (
        <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full transform rotate-3 shadow-paper">
          紧急
        </div>
      )}

      <div className="flex items-start gap-3">
        <button
          onClick={onToggleChecked}
          className={`flex-shrink-0 mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
            doc.checked
              ? 'bg-tape-green border-tape-green text-white'
              : 'bg-paper-50 border-ink-500/30 hover:border-ink-500'
          }`}
        >
          {doc.checked && <Check size={12} strokeWidth={3} />}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h4 className="font-bold text-ink-700 text-sm">{doc.documentType}</h4>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${STATUS_COLORS[doc.status]}`}>
              {doc.status === 'approved' && <FileCheck2 size={10} />}
              {doc.status === 'rejected' && <FileX2 size={10} />}
              {STATUS_LABELS[doc.status]}
            </span>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${style.bg} ${style.text} border ${style.border}`}>
              {style.icon}
              {style.label}
              <span className="font-mono ml-0.5">
                {daysUntil < 0 ? `${Math.abs(daysUntil)}天前` : `剩${daysUntil}天`}
              </span>
            </span>
          </div>

          {doc.documentNumber && (
            <p className="text-xs text-ink-500 font-mono mb-1">编号: {doc.documentNumber}</p>
          )}

          <div className="flex items-center gap-3 text-xs text-ink-500 mb-2 flex-wrap">
            <span className="flex items-center gap-1">
              <Calendar size={10} />
              {formatDateDisplay(doc.issueDate)} → {formatDateDisplay(doc.expiryDate)}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={10} />
              提前{doc.alertDaysBefore}天提醒
            </span>
          </div>

          {doc.note && (
            <p className="text-xs text-ink-600 bg-paper-50/60 rounded-lg px-2 py-1 mb-2 leading-relaxed">
              📝 {doc.note}
            </p>
          )}

          <div className="flex items-center gap-2 flex-wrap">
            {doc.uploaded ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={onViewFile}
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-lg bg-tape-blue/20 text-blue-700 hover:bg-tape-blue/30 transition-colors"
                  title="查看附件"
                >
                  <Eye size={11} />
                  {doc.uploadFileName?.substring(0, 20) || '查看附件'}
                  {doc.uploadFileName && doc.uploadFileName.length > 20 ? '...' : ''}
                </button>
                <button
                  onClick={onRemoveUpload}
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-lg bg-red-100/60 text-red-600 hover:bg-red-200 transition-colors"
                  title="移除附件"
                >
                  <Trash2 size={11} />
                </button>
              </div>
            ) : (
              <label className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-lg border-2 border-dashed border-ink-500/30 text-ink-500 hover:border-tape-blue hover:text-blue-600 cursor-pointer transition-colors">
                <Upload size={11} />
                上传
                <input ref={fileInputRef} type="file" className="hidden" onChange={handleFile} accept="image/*,.pdf,.jpg,.jpeg,.png" />
              </label>
            )}

            <select
              value={doc.status}
              onChange={(e) => onStatusChange(e.target.value as VisaDocumentStatus)}
              className="ml-auto text-xs px-2 py-1 rounded-lg border border-ink-500/20 bg-paper-50 text-ink-600 focus:outline-none focus:border-ink-500"
            >
              {Object.entries(STATUS_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>

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

interface TravelerSectionProps {
  traveler: string;
  docs: VisaDocument[];
  onToggleChecked: (id: string) => void;
  onEdit: (doc: VisaDocument) => void;
  onDelete: (id: string) => void;
  onUpload: (id: string, file: File) => void;
  onRemoveUpload: (id: string) => void;
  onViewFile: (doc: VisaDocument) => void;
  onStatusChange: (id: string, status: VisaDocumentStatus) => void;
}

const TravelerSection: React.FC<TravelerSectionProps> = ({
  traveler,
  docs,
  onToggleChecked,
  onEdit,
  onDelete,
  onUpload,
  onRemoveUpload,
  onViewFile,
  onStatusChange,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const getExpiryAlertLevel = useTripStore(s => s.getExpiryAlertLevel);

  const stats = useMemo(() => {
    let hasExpired = false;
    let hasDanger = false;
    let hasWarning = false;
    docs.forEach(doc => {
      const level = getExpiryAlertLevel(doc.expiryDate, doc.alertDaysBefore);
      if (level === 'expired') hasExpired = true;
      if (level === 'danger') hasDanger = true;
      if (level === 'warning') hasWarning = true;
    });
    const checkedCount = docs.filter(d => d.checked).length;
    return { hasExpired, hasDanger, hasWarning, checkedCount, total: docs.length };
  }, [docs, getExpiryAlertLevel]);

  return (
    <div className="card-paper overflow-hidden">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className={`w-full px-4 py-3 flex items-center gap-3 transition-colors hover:bg-paper-100 ${
          stats.hasExpired ? 'bg-red-50/50' : stats.hasDanger ? 'bg-orange-50/50' : stats.hasWarning ? 'bg-tape-yellow/10' : ''
        }`}
      >
        <div className={`p-2 rounded-xl ${
          stats.hasExpired ? 'bg-red-100' : stats.hasDanger ? 'bg-orange-100' : stats.hasWarning ? 'bg-tape-yellow/30' : 'bg-tape-green/20'
        }`}>
          <User size={18} className={`${
            stats.hasExpired ? 'text-red-600' : stats.hasDanger ? 'text-orange-600' : stats.hasWarning ? 'text-amber-600' : 'text-green-700'
          }`} />
        </div>

        <div className="flex-1 text-left">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-ink-700">{traveler}</h3>
            {stats.hasExpired && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-700 border border-red-300">
                <AlertTriangle size={10} />
                有过期
              </span>
            )}
            {stats.hasDanger && !stats.hasExpired && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-orange-100 text-orange-700 border border-orange-300">
                <AlertCircle size={10} />
                紧急
              </span>
            )}
            {stats.hasWarning && !stats.hasExpired && !stats.hasDanger && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-tape-yellow/30 text-amber-700 border border-tape-yellow">
                <Clock size={10} />
                即将到期
              </span>
            )}
          </div>
          <p className="text-xs text-ink-500 mt-0.5">
            {stats.checkedCount}/{stats.total} 项已确认 · {docs.filter(d => d.uploaded).length} 份已上传
          </p>
        </div>

        <div className="text-ink-400">
          {collapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
        </div>
      </button>

      {!collapsed && (
        <div className="px-4 pb-4 space-y-3 border-t border-paper-200 pt-4">
          {docs.map(doc => (
            <DocumentCard
              key={doc.id}
              doc={doc}
              expiryLevel={getExpiryAlertLevel(doc.expiryDate, doc.alertDaysBefore)}
              onToggleChecked={() => onToggleChecked(doc.id)}
              onEdit={() => onEdit(doc)}
              onDelete={() => onDelete(doc.id)}
              onUpload={(f) => onUpload(doc.id, f)}
              onRemoveUpload={() => onRemoveUpload(doc.id)}
              onViewFile={() => onViewFile(doc)}
              onStatusChange={(s) => onStatusChange(doc.id, s)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const VisaChecklist: React.FC = () => {
  const {
    currentPlan,
    showVisaModal,
    setShowVisaModal,
    uniqueTravelers,
    visaStats,
    addVisaDocument,
    updateVisaDocument,
    deleteVisaDocument,
    toggleVisaChecked,
    getVisaDocumentsByTraveler,
    getExpiryAlertLevel,
  } = useTripStore();

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingDoc, setEditingDoc] = useState<VisaDocument | null>(null);
  const [expandedTraveler, setExpandedTraveler] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<{ name: string; data?: string } | null>(null);

  const [viewMode, setViewMode] = useState<'normal' | 'risk'>('normal');
  const [riskFilterTraveler, setRiskFilterTraveler] = useState<string>('all');
  const [riskFilterStatus, setRiskFilterStatus] = useState<VisaDocumentStatus | 'all'>('all');
  const [riskFilterExpiry, setRiskFilterExpiry] = useState<ExpiryAlertLevel | 'all'>('all');
  const [riskOnlyAbnormal, setRiskOnlyAbnormal] = useState(false);
  const [riskSortBy, setRiskSortBy] = useState<'expiry' | 'traveler' | 'status'>('expiry');
  const [riskSortOrder, setRiskSortOrder] = useState<'asc' | 'desc'>('asc');

  const expiryLevelOrder: Record<ExpiryAlertLevel, number> = {
    expired: 0,
    danger: 1,
    warning: 2,
    normal: 3,
  };

  const allVisaDocuments = useMemo(() => {
    const plan = currentPlan;
    if (!plan || !plan.visaDocuments) return [];
    return plan.visaDocuments;
  }, [currentPlan]);

  const riskViewDocuments = useMemo(() => {
    let docs = [...allVisaDocuments];

    if (riskFilterTraveler !== 'all') {
      docs = docs.filter(d => d.travelerName === riskFilterTraveler);
    }
    if (riskFilterStatus !== 'all') {
      docs = docs.filter(d => d.status === riskFilterStatus);
    }
    if (riskFilterExpiry !== 'all') {
      docs = docs.filter(d => getExpiryAlertLevel(d.expiryDate, d.alertDaysBefore) === riskFilterExpiry);
    }
    if (riskOnlyAbnormal) {
      docs = docs.filter(d => {
        const level = getExpiryAlertLevel(d.expiryDate, d.alertDaysBefore);
        return level === 'expired' || level === 'danger';
      });
    }

    docs.sort((a, b) => {
      let cmp = 0;
      if (riskSortBy === 'expiry') {
        const levelA = getExpiryAlertLevel(a.expiryDate, a.alertDaysBefore);
        const levelB = getExpiryAlertLevel(b.expiryDate, b.alertDaysBefore);
        cmp = expiryLevelOrder[levelA] - expiryLevelOrder[levelB];
        if (cmp === 0) {
          cmp = getDaysUntil(a.expiryDate) - getDaysUntil(b.expiryDate);
        }
      } else if (riskSortBy === 'traveler') {
        cmp = a.travelerName.localeCompare(b.travelerName, 'zh-CN');
      } else if (riskSortBy === 'status') {
        const statusOrder: Record<VisaDocumentStatus, number> = {
          rejected: 0,
          pending: 1,
          submitted: 2,
          approved: 3,
        };
        cmp = statusOrder[a.status] - statusOrder[b.status];
      }
      return riskSortOrder === 'asc' ? cmp : -cmp;
    });

    return docs;
  }, [allVisaDocuments, riskFilterTraveler, riskFilterStatus, riskFilterExpiry, riskOnlyAbnormal, riskSortBy, riskSortOrder, getExpiryAlertLevel]);

  const riskViewStats = useMemo(() => {
    const docs = riskViewDocuments;
    const checked = docs.filter(d => d.checked).length;
    const total = docs.length;
    const abnormal = docs.filter(d => {
      const level = getExpiryAlertLevel(d.expiryDate, d.alertDaysBefore);
      return level === 'expired' || level === 'danger';
    }).length;
    return { checked, total, abnormal };
  }, [riskViewDocuments, getExpiryAlertLevel]);

  const handleFileUpload = async (docId: string, file: File) => {
    try {
      let fileData: string | undefined;
      if (file.size < 5 * 1024 * 1024) {
        const reader = new FileReader();
        fileData = await new Promise((resolve) => {
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(file);
        });
      }
      updateVisaDocument(docId, {
        uploaded: true,
        uploadFileName: file.name,
        uploadFileData: fileData,
      });
    } catch (e) {
      updateVisaDocument(docId, {
        uploaded: true,
        uploadFileName: file.name,
      });
    }
  };

  const handleRemoveUpload = (docId: string) => {
    updateVisaDocument(docId, {
      uploaded: false,
      uploadFileName: undefined,
      uploadFileData: undefined,
    });
  };

  const handleViewFile = (doc: VisaDocument) => {
    if (doc.uploadFileData) {
      setPreviewFile({ name: doc.uploadFileName || doc.documentType, data: doc.uploadFileData });
    } else if (doc.uploadFileName) {
      alert(`文件已记录：${doc.uploadFileName}\n\n（文件内容未存储，仅记录文件名）`);
    }
  };

  const handleExportSummary = () => {
    if (!currentPlan) return;
    const lines: string[] = [];
    lines.push(`# ${currentPlan.name} - 签证材料清单`);
    lines.push(`生成时间: ${new Date().toLocaleString('zh-CN')}\n`);

    uniqueTravelers.forEach(traveler => {
      const docs = getVisaDocumentsByTraveler(traveler);
      lines.push(`## ${traveler} (${docs.length}项)`);
      docs.forEach(doc => {
        const level = getExpiryAlertLevel(doc.expiryDate, doc.alertDaysBefore);
        const daysUntil = getDaysUntil(doc.expiryDate);
        const expiryText = daysUntil < 0
          ? `⚠️ 已过期${Math.abs(daysUntil)}天`
          : `剩${daysUntil}天到期`;
        lines.push(`- [${doc.checked ? '✓' : ' '}] ${doc.documentType}`);
        lines.push(`  状态: ${STATUS_LABELS[doc.status]} | ${EXPIRY_STYLES[level].label} (${expiryText})`);
        if (doc.documentNumber) lines.push(`  编号: ${doc.documentNumber}`);
        lines.push(`  有效期: ${formatDateDisplay(doc.issueDate)} ~ ${formatDateDisplay(doc.expiryDate)}`);
        if (doc.uploaded) lines.push(`  📎 附件: ${doc.uploadFileName || '已上传'}`);
        if (doc.note) lines.push(`  📝 ${doc.note}`);
        lines.push('');
      });
    });

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentPlan.name}-签证材料清单.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!showVisaModal) return null;

  const progressPercent = visaStats.total > 0 ? Math.round((visaStats.checked / visaStats.total) * 100) : 0;

  return (
    <div className="fixed inset-0 bg-ink-700/50 flex items-center justify-center z-50 p-4">
      <div className="relative card-paper w-full max-w-4xl max-h-[90vh] flex flex-col animate-fade-in-up">
        <div className="tape-decoration" />

        <div className="flex items-center justify-between px-6 py-4 border-b border-paper-200">
          <div>
            <h2 className="font-handwritten text-3xl font-bold text-ink-700">
              <span className="handwritten-underline">签证材料清单</span>
            </h2>
            <p className="text-xs text-ink-500 mt-1">按旅客管理证件 · 到期自动提醒 · 附件上传管理</p>
          </div>
          <button
            onClick={() => setShowVisaModal(false)}
            className="p-2 rounded-full hover:bg-paper-200 transition-colors text-ink-500 hover:text-ink-700"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-4 border-b border-paper-200 bg-paper-50/50 space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            <div className="bg-paper-50 rounded-xl p-3 border border-paper-200 text-center">
              <div className="font-mono text-xl font-bold text-ink-700">{visaStats.total}</div>
              <div className="text-xs text-ink-500">材料总数</div>
            </div>
            <div className="bg-tape-green/15 rounded-xl p-3 border border-tape-green/40 text-center">
              <div className="font-mono text-xl font-bold text-green-700">{visaStats.checked}/{visaStats.total}</div>
              <div className="text-xs text-green-700">已确认</div>
            </div>
            <div className="bg-tape-blue/15 rounded-xl p-3 border border-tape-blue/40 text-center">
              <div className="font-mono text-xl font-bold text-blue-700">{visaStats.uploaded}</div>
              <div className="text-xs text-blue-700">已上传</div>
            </div>
            <div className={`rounded-xl p-3 border text-center ${visaStats.expiredCount > 0 ? 'bg-red-100 border-red-300' : 'bg-paper-50 border-paper-200'}`}>
              <div className={`font-mono text-xl font-bold ${visaStats.expiredCount > 0 ? 'text-red-600' : 'text-ink-700'}`}>
                {visaStats.expiredCount}
              </div>
              <div className={`text-xs ${visaStats.expiredCount > 0 ? 'text-red-600' : 'text-ink-500'}`}>已过期</div>
            </div>
            <div className={`rounded-xl p-3 border text-center ${visaStats.warningCount > 0 ? 'bg-orange-100/70 border-orange-300' : 'bg-paper-50 border-paper-200'}`}>
              <div className={`font-mono text-xl font-bold ${visaStats.warningCount > 0 ? 'text-orange-600' : 'text-ink-700'}`}>
                {visaStats.warningCount}
              </div>
              <div className={`text-xs ${visaStats.warningCount > 0 ? 'text-orange-600' : 'text-ink-500'}`}>待关注</div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs text-ink-500 mb-1">
              <span>确认进度</span>
              <span className="font-mono">{progressPercent}%</span>
            </div>
            <div className="h-2 bg-paper-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-tape-green to-tape-blue transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

        <div className="flex flex-wrap gap-2">
            <div className="flex rounded-xl overflow-hidden border-2 border-ink-500/20">
              <button
                onClick={() => setViewMode('normal')}
                className={`px-3 py-2 text-sm flex items-center gap-1 transition-colors ${
                  viewMode === 'normal'
                    ? 'bg-ink-600 text-white'
                    : 'bg-paper-50 text-ink-500 hover:bg-paper-100'
                }`}
              >
                <User size={14} />
                旅客视图
              </button>
              <button
                onClick={() => setViewMode('risk')}
                className={`px-3 py-2 text-sm flex items-center gap-1 transition-colors ${
                  viewMode === 'risk'
                    ? 'bg-red-500 text-white'
                    : 'bg-paper-50 text-ink-500 hover:bg-paper-100'
                }`}
              >
                <Flame size={14} />
                风险视图
                {(visaStats.expiredCount > 0 || visaStats.warningCount > 0) && (
                  <span className="ml-1 px-1.5 py-0.5 rounded-full text-xs bg-red-500/20 text-white">
                    {visaStats.expiredCount + visaStats.warningCount}
                  </span>
                )}
              </button>
            </div>

            <button
              onClick={() => { setShowAddForm(true); setEditingDoc(null); }}
              className="btn-primary flex items-center gap-2 text-sm py-2"
            >
              <Plus size={14} />
              添加材料
            </button>
            <button
              onClick={handleExportSummary}
              disabled={!currentPlan || visaStats.total === 0}
              className="btn-secondary flex items-center gap-2 text-sm py-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download size={14} />
              导出清单
            </button>
            {expandedTraveler && (
              <button
                onClick={() => setExpandedTraveler(null)}
                className="text-xs text-ink-500 hover:text-ink-700 px-2 py-1 ml-auto"
              >
                收起全部
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {showAddForm && (
            <div>
              <h3 className="text-sm font-bold text-ink-600 mb-2 flex items-center gap-2">
                <FileText size={14} />
                {editingDoc ? '编辑材料' : '添加新材料'}
              </h3>
              <DocumentForm
                initial={editingDoc || undefined}
                travelers={uniqueTravelers}
                onSubmit={(data) => {
                  if (editingDoc) {
                    updateVisaDocument(editingDoc.id, data);
                  } else {
                    addVisaDocument(data);
                  }
                  setShowAddForm(false);
                  setEditingDoc(null);
                }}
                onCancel={() => { setShowAddForm(false); setEditingDoc(null); }}
              />
            </div>
          )}

          {viewMode === 'risk' && (
            <div className="card-paper p-4 space-y-3 bg-red-50/30 border-2 border-red-200/60">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <h3 className="font-bold text-ink-700 flex items-center gap-2">
                  <Filter size={16} className="text-red-500" />
                  风险筛选与排序
                </h3>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-ink-500">当前显示:</span>
                  <span className="font-mono font-bold text-red-600">{riskViewStats.total}</span>
                  <span className="text-ink-500">项</span>
                  <span className="text-ink-400 mx-1">·</span>
                  <span className="font-mono font-bold text-green-600">{riskViewStats.checked}/{riskViewStats.total}</span>
                  <span className="text-ink-500">已确认</span>
                  {riskViewStats.abnormal > 0 && (
                    <>
                      <span className="text-ink-400 mx-1">·</span>
                      <span className="font-mono font-bold text-red-600 flex items-center gap-1">
                        <Flame size={12} />
                        {riskViewStats.abnormal} 异常
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs text-ink-500 mb-1 font-medium flex items-center gap-1">
                    <User size={11} />
                    按旅客
                  </label>
                  <select
                    value={riskFilterTraveler}
                    onChange={(e) => setRiskFilterTraveler(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border-2 border-ink-500/20 bg-paper-50 text-sm focus:border-ink-500 focus:outline-none transition-colors"
                  >
                    <option value="all">全部旅客</option>
                    {uniqueTravelers.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-ink-500 mb-1 font-medium flex items-center gap-1">
                    <FileCheck2 size={11} />
                    按证件状态
                  </label>
                  <select
                    value={riskFilterStatus}
                    onChange={(e) => setRiskFilterStatus(e.target.value as VisaDocumentStatus | 'all')}
                    className="w-full px-3 py-1.5 rounded-lg border-2 border-ink-500/20 bg-paper-50 text-sm focus:border-ink-500 focus:outline-none transition-colors"
                  >
                    <option value="all">全部状态</option>
                    {Object.entries(STATUS_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-ink-500 mb-1 font-medium flex items-center gap-1">
                    <Clock size={11} />
                    按到期等级
                  </label>
                  <select
                    value={riskFilterExpiry}
                    onChange={(e) => setRiskFilterExpiry(e.target.value as ExpiryAlertLevel | 'all')}
                    className="w-full px-3 py-1.5 rounded-lg border-2 border-ink-500/20 bg-paper-50 text-sm focus:border-ink-500 focus:outline-none transition-colors"
                  >
                    <option value="all">全部等级</option>
                    <option value="expired">已过期</option>
                    <option value="danger">紧急</option>
                    <option value="warning">即将到期</option>
                    <option value="normal">有效</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-ink-500 mb-1 font-medium flex items-center gap-1">
                    <SortAsc size={11} />
                    排序方式
                  </label>
                  <div className="flex gap-1">
                    <select
                      value={riskSortBy}
                      onChange={(e) => setRiskSortBy(e.target.value as 'expiry' | 'traveler' | 'status')}
                      className="flex-1 px-3 py-1.5 rounded-lg border-2 border-ink-500/20 bg-paper-50 text-sm focus:border-ink-500 focus:outline-none transition-colors"
                    >
                      <option value="expiry">到期优先级</option>
                      <option value="traveler">旅客姓名</option>
                      <option value="status">证件状态</option>
                    </select>
                    <button
                      onClick={() => setRiskSortOrder(o => o === 'asc' ? 'desc' : 'asc')}
                      className="px-2 py-1.5 rounded-lg border-2 border-ink-500/20 bg-paper-50 hover:bg-paper-100 transition-colors"
                      title={riskSortOrder === 'asc' ? '升序' : '降序'}
                    >
                      {riskSortOrder === 'asc' ? <SortAsc size={16} /> : <SortDesc size={16} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <button
                  onClick={() => setRiskOnlyAbnormal(!riskOnlyAbnormal)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${
                    riskOnlyAbnormal
                      ? 'bg-red-500 text-white shadow-paper scale-105'
                      : 'bg-red-100/70 text-red-700 border-2 border-red-300 hover:bg-red-100'
                  }`}
                >
                  <Flame size={14} />
                  {riskOnlyAbnormal ? '查看全部' : '只看异常证件'}
                  {riskOnlyAbnormal && (
                    <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-xs">
                      小红异常
                    </span>
                  )}
                </button>

                {(riskFilterTraveler !== 'all' || riskFilterStatus !== 'all' || riskFilterExpiry !== 'all' || riskOnlyAbnormal) && (
                  <button
                    onClick={() => {
                      setRiskFilterTraveler('all');
                      setRiskFilterStatus('all');
                      setRiskFilterExpiry('all');
                      setRiskOnlyAbnormal(false);
                    }}
                    className="px-3 py-2 rounded-xl text-sm text-ink-500 hover:text-ink-700 hover:bg-paper-100 transition-colors"
                  >
                    清除所有筛选
                  </button>
                )}
              </div>
            </div>
          )}

          {viewMode === 'normal' && uniqueTravelers.length === 0 && visaStats.total === 0 ? (
            <div className="text-center py-12 dashed-border rounded-xl">
              <FileText size={48} className="mx-auto text-ink-300 mb-4" />
              <p className="text-ink-500 mb-4">还没有添加任何签证材料</p>
              <button
                onClick={() => { setShowAddForm(true); setEditingDoc(null); }}
                className="btn-primary inline-flex items-center gap-2"
              >
                <Plus size={16} />
                添加第一项材料
              </button>
            </div>
          ) : viewMode === 'normal' ? (
            uniqueTravelers.map(traveler => (
              <TravelerSection
                key={traveler}
                traveler={traveler}
                docs={getVisaDocumentsByTraveler(traveler)}
                onToggleChecked={toggleVisaChecked}
                onEdit={(doc) => { setEditingDoc(doc); setShowAddForm(true); }}
                onDelete={(id) => {
                  if (confirm('确定删除这份材料吗？')) deleteVisaDocument(id);
                }}
                onUpload={handleFileUpload}
                onRemoveUpload={handleRemoveUpload}
                onViewFile={handleViewFile}
                onStatusChange={(id, status) => updateVisaDocument(id, { status })}
              />
            ))
          ) : riskViewDocuments.length === 0 ? (
            <div className="text-center py-12 dashed-border rounded-xl">
              <Layers size={48} className="mx-auto text-ink-300 mb-4" />
              <p className="text-ink-500 mb-2">当前筛选条件下没有匹配的证件</p>
              <p className="text-xs text-ink-400 mb-4">尝试调整筛选条件，或添加新的签证材料</p>
              <button
                onClick={() => {
                  setRiskFilterTraveler('all');
                  setRiskFilterStatus('all');
                  setRiskFilterExpiry('all');
                  setRiskOnlyAbnormal(false);
                }}
                className="btn-secondary inline-flex items-center gap-2 mr-2"
              >
                清除筛选
              </button>
              <button
                onClick={() => { setShowAddForm(true); setEditingDoc(null); }}
                className="btn-primary inline-flex items-center gap-2"
              >
                <Plus size={16} />
                添加材料
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {riskViewDocuments.map(doc => {
                const expiryLevel = getExpiryAlertLevel(doc.expiryDate, doc.alertDaysBefore);
                const isAbnormal = expiryLevel === 'expired' || expiryLevel === 'danger';
                return (
                  <div
                    key={doc.id}
                    className={`${expiryLevel === 'expired' ? 'order-first' : ''}`}
                    style={{ order: expiryLevel === 'expired' ? -1 : expiryLevel === 'danger' ? 0 : undefined }}
                  >
                    <DocumentCard
                      doc={doc}
                      expiryLevel={expiryLevel}
                      onToggleChecked={() => toggleVisaChecked(doc.id)}
                      onEdit={() => { setEditingDoc(doc); setShowAddForm(true); }}
                      onDelete={() => {
                        if (confirm('确定删除这份材料吗？')) deleteVisaDocument(doc.id);
                      }}
                      onUpload={(f) => handleFileUpload(doc.id, f)}
                      onRemoveUpload={() => handleRemoveUpload(doc.id)}
                      onViewFile={() => handleViewFile(doc)}
                      onStatusChange={(s) => updateVisaDocument(doc.id, { status: s })}
                    />
                    {isAbnormal && riskOnlyAbnormal && (
                      <div className="mt-1 ml-8 text-xs text-red-500 flex items-center gap-1">
                        <Flame size={10} />
                        异常证件 · 请立即处理
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {previewFile && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4" onClick={() => setPreviewFile(null)}>
          <div className="card-paper max-w-3xl max-h-[85vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-paper-200">
              <h3 className="font-bold text-ink-700 truncate">{previewFile.name}</h3>
              <button onClick={() => setPreviewFile(null)} className="p-1 rounded hover:bg-paper-200">
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-auto bg-paper-100 flex items-center justify-center p-4">
              {previewFile.data?.startsWith('data:image') ? (
                <img src={previewFile.data} alt={previewFile.name} className="max-w-full max-h-[60vh] object-contain rounded-lg shadow-paper" />
              ) : previewFile.data?.startsWith('data:application/pdf') ? (
                <iframe src={previewFile.data} title={previewFile.name} className="w-full h-[70vh] rounded-lg bg-white" />
              ) : (
                <div className="text-center text-ink-500">
                  <FileText size={64} className="mx-auto mb-2 text-ink-300" />
                  <p>不支持预览此文件类型</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
