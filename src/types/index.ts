export type ItemType = 'transport' | 'accommodation' | 'activity';

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
  currentPlan: TripPlan | undefined;
  totalSpent: number;
  isOverBudget: boolean;
  transportTotal: number;
  accommodationTotal: number;
  activityTotal: number;
  cities: string[];
  cityTotals: Record<string, number>;
  dateRange: string[];
  setCurrentPlanId: (id: string | null) => void;
  setSelectedCity: (city: string | null) => void;
  setEditingItem: (item: TripItem | null) => void;
  setShowSplitModal: (show: boolean) => void;
  setShowPlanModal: (show: boolean) => void;
  createPlan: (name: string, budget: number) => void;
  deletePlan: (id: string) => void;
  updatePlan: (id: string, updates: Partial<TripPlan>) => void;
  addItem: (item: Omit<TripItem, 'id' | 'sortOrder'>) => void;
  updateItem: (id: string, updates: Partial<TripItem>) => void;
  deleteItem: (id: string) => void;
  moveItem: (itemId: string, targetDate: string, newIndex: number) => void;
  reorderItems: (date: string, items: TripItem[]) => void;
  exportPlan: (id: string) => void;
  importPlan: (json: string) => void;
  getItemsByDate: (date: string) => TripItem[];
  getPerPersonCost: (item: TripItem) => number;
}

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
