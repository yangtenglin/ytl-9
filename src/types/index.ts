export type ItemType = 'transport' | 'accommodation' | 'activity';

export type VisaDocumentStatus = 'pending' | 'submitted' | 'approved' | 'rejected';

export type ExpiryAlertLevel = 'normal' | 'warning' | 'danger' | 'expired';

export type PriorityLevel = 'must' | 'important' | 'optional';

export type BagSlot = 'carry-on' | 'checked' | 'hotel-storage';

export const BAG_SLOT_LABELS: Record<BagSlot, string> = {
  'carry-on': '随身包',
  'checked': '托运行李',
  'hotel-storage': '酒店寄存',
};

export const BAG_SLOT_COLORS: Record<BagSlot, string> = {
  'carry-on': 'bg-tape-blue/15 text-blue-700 border-tape-blue/40',
  'checked': 'bg-tape-orange/15 text-orange-700 border-tape-orange/40',
  'hotel-storage': 'bg-tape-green/15 text-green-700 border-tape-green/40',
};

export type WeatherType = 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'snowy';

export type WeatherRiskLevel = 'safe' | 'caution' | 'danger';

export type BackupPlanStatus = 'pending' | 'adopted' | 'abandoned';

export const BACKUP_PLAN_STATUS_LABELS: Record<BackupPlanStatus, string> = {
  pending: '待定',
  adopted: '采用',
  abandoned: '放弃',
};

export const BACKUP_PLAN_STATUS_COLORS: Record<BackupPlanStatus, string> = {
  pending: 'bg-amber-100 text-amber-700 border-amber-300',
  adopted: 'bg-green-100 text-green-700 border-green-300',
  abandoned: 'bg-gray-100 text-gray-500 border-gray-300',
};

export interface BackupPlan {
  id: string;
  title: string;
  type: ItemType;
  cost: number;
  note: string;
  status: BackupPlanStatus;
  reason: string;
}

export interface DailyWeather {
  date: string;
  city: string;
  weather: WeatherType;
  temperatureHigh: number;
  temperatureLow: number;
  precipitationProbability: number;
  windSpeed: number;
}

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
  bagSlot: BagSlot;
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
  carryOnLimit: number;
  checkedLimit: number;
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
  isOutdoor: boolean;
  backupPlans: BackupPlan[];
  activeBackupId: string | null;
  splitMode: 'equal' | 'custom';
  splitAmounts: Record<string, number>;
}

export interface TripPlan {
  id: string;
  name: string;
  totalBudget: number;
  items: TripItem[];
  visaDocuments: VisaDocument[];
  packingLists: PackingList[];
  dailyWeather: DailyWeather[];
  createdAt: string;
  updatedAt: string;
}

export interface TripStore {
  currentPlanId: string | null;
  plans: TripPlan[];
  selectedCity: string | null;
  editingItem: TripItem | null;
  editingWeather: DailyWeather | null;
  showSplitModal: boolean;
  showPlanModal: boolean;
  showVisaModal: boolean;
  showPackingModal: boolean;
  showWeatherModal: boolean;
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
    carryOnWeight: number;
    carryOnLimit: number;
    carryOnOverWeight: boolean;
    checkedWeight: number;
    checkedLimit: number;
    checkedOverWeight: boolean;
    hotelStorageWeight: number;
  };
  setCurrentPlanId: (id: string | null) => void;
  setSelectedCity: (city: string | null) => void;
  setEditingItem: (item: TripItem | null) => void;
  setEditingWeather: (weather: DailyWeather | null) => void;
  setShowSplitModal: (show: boolean) => void;
  setShowPlanModal: (show: boolean) => void;
  setShowVisaModal: (show: boolean) => void;
  setShowPackingModal: (show: boolean) => void;
  setShowWeatherModal: (show: boolean) => void;
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
  createPackingList: (name: string, maxWeight: number, maxWeightUnit: 'g' | 'kg', carryOnLimit?: number, checkedLimit?: number) => void;
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
  setDailyWeather: (weather: DailyWeather) => void;
  getWeatherForDate: (date: string, city: string) => DailyWeather | undefined;
  getWeatherRiskLevel: (item: TripItem) => WeatherRiskLevel;
  isWeatherAffected: (item: TripItem) => boolean;
  activateBackupPlan: (itemId: string, backupId: string) => void;
  deactivateBackupPlan: (itemId: string) => void;
  addBackupPlan: (itemId: string, backup: Omit<BackupPlan, 'id'>) => void;
  removeBackupPlan: (itemId: string, backupId: string) => void;
  updateBackupPlan: (itemId: string, backupId: string, updates: Partial<BackupPlan>) => void;
  toggleItemOutdoor: (itemId: string) => void;
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

export const WEATHER_LABELS: Record<WeatherType, string> = {
  sunny: '晴',
  cloudy: '多云',
  rainy: '雨',
  stormy: '暴雨',
  snowy: '雪',
};

export const WEATHER_ICONS: Record<WeatherType, string> = {
  sunny: '☀️',
  cloudy: '⛅',
  rainy: '🌧️',
  stormy: '⛈️',
  snowy: '❄️',
};

export const WEATHER_RISK_LABELS: Record<WeatherRiskLevel, string> = {
  safe: '正常',
  caution: '注意',
  danger: '风险',
};

export const WEATHER_RISK_COLORS: Record<WeatherRiskLevel, string> = {
  safe: 'bg-green-100 text-green-700 border-green-300',
  caution: 'bg-amber-100 text-amber-700 border-amber-300',
  danger: 'bg-red-100 text-red-700 border-red-300',
};
