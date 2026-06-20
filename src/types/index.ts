export type ItemType = 'transport' | 'accommodation' | 'activity';

export type VisaDocumentStatus = 'pending' | 'submitted' | 'approved' | 'rejected';

export type ExpiryAlertLevel = 'normal' | 'warning' | 'danger' | 'expired';

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
  setCurrentPlanId: (id: string | null) => void;
  setSelectedCity: (city: string | null) => void;
  setEditingItem: (item: TripItem | null) => void;
  setShowSplitModal: (show: boolean) => void;
  setShowPlanModal: (show: boolean) => void;
  setShowVisaModal: (show: boolean) => void;
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
