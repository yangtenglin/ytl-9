export type ItemType = 'transport' | 'accommodation' | 'activity';

export type VisaDocumentStatus = 'pending' | 'submitted' | 'approved' | 'rejected';

export type ExpiryAlertLevel = 'normal' | 'warning' | 'danger' | 'expired';

export type PriorityLevel = 'must' | 'important' | 'optional';

export interface PackingGroup {
  id: string;
  name: string;
  color?: string;
  sortOrder: number;
}

export interface PackingItem {
  id: string;
  name: string;
  quantity: number;
  weight: number;
  unit: 'g' | 'kg';
  priority: PriorityLevel;
  groupId: string;
  packed: boolean;
  note: string;
  sortOrder: number;
}

export interface PackingList {
  id: string;
  planId: string;
  name: string;
  maxWeight: number;
  maxWeightUnit: 'g' | 'kg';
  groups: PackingGroup[];
  items: PackingItem[];
  createdAt: string;
  updatedAt: string;
}

export interface VisaDocument {
  id: string;
  travelerName: string;
  documentType: string;
  documentNumber: string;
  issueDate: string;
  expiryDate: string;
  alertDaysBefore: number;
  status: VisaDocumentStatus;
  uploaded: boolean;
  checked: boolean;
  uploadFileName?: string;
  uploadFileData?: string;
  note: string;
  sortOrder: number;
}

export interface TripItem {
  id: string;
  title: string;
  type: ItemType;
  city: string;
  startDate: string;
  endDate: string;
  cost: number;
  participants: string[];
  note: string;
  sortOrder: number;
}

export interface TripPlan {
  id: string;
  name: string;
  totalBudget: number;
  items: TripItem[];
  visaDocuments: VisaDocument[];
  packingLists: PackingList[];
  createdAt: string;
  updatedAt: string;
}

export interface TripStore {
  currentPlanId: string | null;
  plans: TripPlan[];
  selectedCity: string | null;
  editingItem: TripItem | null;
  showSplitModal: boolean;
  showPlanModal: boolean;
  showVisaModal: boolean;
  showPackingModal: boolean;
  currentPlan: TripPlan | undefined;
  totalSpent: number;
  isOverBudget: boolean;
  transportTotal: number;
  accommodationTotal: number;
  activityTotal: number;
  cities: string[];
  cityTotals: Record<string, number>;
  dateRange: string[];
  uniqueTravelers: string[];
  visaStats: {
    total: number;
    checked: number;
    uploaded: number;
    expiredCount: number;
    warningCount: number;
  };
  packingStats: {
    totalItems: number;
    packedItems: number;
    totalWeight: number;
    maxWeight: number;
    isOverWeight: boolean;
    weightPercent: number;
    mustUnpacked: number;
  };
  setCurrentPlanId: (id: string | null) => void;
  setSelectedCity: (city: string | null) => void;
  setEditingItem: (item: TripItem | null) => void;
  setShowSplitModal: (show: boolean) => void;
  setShowPlanModal: (show: boolean) => void;
  setShowVisaModal: (show: boolean) => void;
  setShowPackingModal: (show: boolean) => void;
  createPlan: (name: string, budget: number) => void;
  deletePlan: (id: string) => void;
  updatePlan: (id: string, updates: Partial<TripPlan>) => void;
  addItem: (item: Omit<TripItem, 'id' | 'sortOrder'>) => void;
  updateItem: (id: string, updates: Partial<TripItem>) => void;
  deleteItem: (id: string) => void;
  moveItem: (itemId: string, targetDate: string, newIndex: number) => void;
  reorderItems: (date: string, items: TripItem[]) => void;
  addVisaDocument: (doc: Omit<VisaDocument, 'id' | 'sortOrder'>) => void;
  updateVisaDocument: (id: string, updates: Partial<VisaDocument>) => void;
  deleteVisaDocument: (id: string) => void;
  toggleVisaChecked: (id: string) => void;
  getExpiryAlertLevel: (expiryDate: string, alertDaysBefore: number) => ExpiryAlertLevel;
  getVisaDocumentsByTraveler: (traveler: string) => VisaDocument[];
  exportPlan: (id: string) => void;
  importPlan: (json: string) => void;
  getItemsByDate: (date: string) => TripItem[];
  getPerPersonCost: (item: TripItem) => number;
  getCurrentPackingList: () => PackingList | null;
  createPackingList: (name: string, maxWeight: number, maxWeightUnit: 'g' | 'kg') => void;
  updatePackingList: (updates: Partial<Omit<PackingList, 'id' | 'planId' | 'createdAt'>>) => void;
  addPackingGroup: (name: string, color?: string) => void;
  updatePackingGroup: (id: string, updates: Partial<Omit<PackingGroup, 'id' | 'sortOrder'>>) => void;
  deletePackingGroup: (id: string) => void;
  addPackingItem: (item: Omit<PackingItem, 'id' | 'sortOrder'>) => void;
  updatePackingItem: (id: string, updates: Partial<PackingItem>) => void;
  deletePackingItem: (id: string) => void;
  togglePackingItem: (id: string) => void;
  getItemsByGroup: (groupId: string) => PackingItem[];
  calculateGroupWeight: (groupId: string) => number;
}

export const PRIORITY_LABELS: Record<PriorityLevel, string> = {
  must: '必带',
  important: '重要',
  optional: '可选',
};

export const PRIORITY_COLORS: Record<PriorityLevel, string> = {
  must: 'bg-red-100 text-red-700 border-red-300',
  important: 'bg-amber-100 text-amber-700 border-amber-300',
  optional: 'bg-green-100 text-green-700 border-green-300',
};

export const DEFAULT_PACKING_GROUPS: { name: string; color: string }[] = [
  { name: '证件文件', color: 'tape-blue' },
  { name: '衣物', color: 'tape-pink' },
  { name: '电子设备', color: 'tape-orange' },
  { name: '洗漱用品', color: 'tape-green' },
  { name: '药品', color: 'tape-yellow' },
];

export const ITEM_TYPE_LABELS: Record<ItemType, string> = {
  transport: '交通',
  accommodation: '住宿',
  activity: '活动',
};

export const ITEM_TYPE_COLORS: Record<ItemType, string> = {
  transport: 'tape-orange',
  accommodation: 'tape-pink',
  activity: 'tape-green',
};
