import { create } from 'zustand';
import type { TripStore, TripItem, TripPlan, VisaDocument, ExpiryAlertLevel, PackingList, PackingItem, PriorityLevel } from '@/types';
import { generateId, getDateRange, isSameDate } from '@/utils/dateUtils';
import {
  calculateTotal,
  calculateByType,
  calculateByCityMap,
  getUniqueCities,
  getPerPersonCost,
} from '@/utils/costUtils';
import { loadFromStorage, saveToStorage, downloadJSON } from '@/utils/storageUtils';
import { getInitialPlans, getInitialPlanId, createInitialPackingList } from '@/data/mockData';

const rawStoredPlans = loadFromStorage<TripPlan[]>('plans', []);
const storedCurrentPlanId = loadFromStorage<string | null>('currentPlanId', null);

const storedPlans = rawStoredPlans.map(plan => ({
  ...plan,
  visaDocuments: plan.visaDocuments ?? [],
  packingLists: plan.packingLists ?? [],
}));

const initialPlans = storedPlans.length > 0 ? storedPlans : getInitialPlans();
const initialPlanId = storedCurrentPlanId || getInitialPlanId();

const getDaysUntil = (dateStr: string): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

export const useTripStore = create<TripStore>((set, get) => ({
  currentPlanId: initialPlanId,
  plans: initialPlans,
  selectedCity: null,
  editingItem: null,
  showSplitModal: false,
  showPlanModal: false,
  showVisaModal: false,
  showPackingModal: false,

  get currentPlan() {
    return get().plans.find(p => p.id === get().currentPlanId);
  },

  get totalSpent() {
    const plan = get().currentPlan;
    if (!plan) return 0;
    return calculateTotal(plan.items);
  },

  get isOverBudget() {
    const plan = get().currentPlan;
    if (!plan) return false;
    return get().totalSpent > plan.totalBudget;
  },

  get transportTotal() {
    const plan = get().currentPlan;
    if (!plan) return 0;
    return calculateByType(plan.items, 'transport');
  },

  get accommodationTotal() {
    const plan = get().currentPlan;
    if (!plan) return 0;
    return calculateByType(plan.items, 'accommodation');
  },

  get activityTotal() {
    const plan = get().currentPlan;
    if (!plan) return 0;
    return calculateByType(plan.items, 'activity');
  },

  get cities() {
    const plan = get().currentPlan;
    if (!plan) return [];
    return getUniqueCities(plan.items);
  },

  get cityTotals() {
    const plan = get().currentPlan;
    if (!plan) return {};
    return calculateByCityMap(plan.items);
  },

  get dateRange() {
    const plan = get().currentPlan;
    if (!plan || plan.items.length === 0) return [];
    const dates = plan.items.flatMap(item => getDateRange(item.startDate, item.endDate));
    const uniqueDates = [...new Set(dates)].sort();
    return uniqueDates;
  },

  get uniqueTravelers() {
    const plan = get().currentPlan;
    if (!plan) return [];
    const travelers = new Set<string>();
    plan.items.forEach(item => item.participants.forEach(p => travelers.add(p)));
    plan.visaDocuments?.forEach(doc => travelers.add(doc.travelerName));
    return [...travelers].filter(Boolean);
  },

  get visaStats() {
    const plan = get().currentPlan;
    if (!plan || !plan.visaDocuments) {
      return { total: 0, checked: 0, uploaded: 0, expiredCount: 0, warningCount: 0 };
    }
    const docs = plan.visaDocuments;
    let expiredCount = 0;
    let warningCount = 0;
    docs.forEach(doc => {
      const level = get().getExpiryAlertLevel(doc.expiryDate, doc.alertDaysBefore);
      if (level === 'expired') expiredCount++;
      if (level === 'danger' || level === 'warning') warningCount++;
    });
    return {
      total: docs.length,
      checked: docs.filter(d => d.checked).length,
      uploaded: docs.filter(d => d.uploaded).length,
      expiredCount,
      warningCount,
    };
  },

  get packingStats() {
    const plan = get().currentPlan;
    if (!plan || !plan.packingLists || plan.packingLists.length === 0) {
      return { totalItems: 0, packedItems: 0, totalWeight: 0, maxWeight: 0, isOverWeight: false, weightPercent: 0, mustUnpacked: 0 };
    }
    const packingList = plan.packingLists[0];
    const items = packingList.items;
    const totalItems = items.length;
    const packedItems = items.filter(i => i.packed).length;
    const convertToGrams = (w: number, unit: 'g' | 'kg') => unit === 'kg' ? w * 1000 : w;
    const totalWeight = items.reduce((sum, i) => sum + convertToGrams(i.weight * i.quantity, i.unit), 0);
    const maxWeight = convertToGrams(packingList.maxWeight, packingList.maxWeightUnit);
    const isOverWeight = totalWeight > maxWeight;
    const weightPercent = maxWeight > 0 ? Math.min(100, (totalWeight / maxWeight) * 100) : 0;
    const mustUnpacked = items.filter(i => i.priority === 'must' && !i.packed).length;
    return { totalItems, packedItems, totalWeight, maxWeight, isOverWeight, weightPercent, mustUnpacked };
  },

  setCurrentPlanId: (id) => {
    set({ currentPlanId: id });
    saveToStorage('currentPlanId', id);
  },

  setSelectedCity: (city) => set({ selectedCity: city }),

  setEditingItem: (item) => set({ editingItem: item }),

  setShowSplitModal: (show) => set({ showSplitModal: show }),

  setShowPlanModal: (show) => set({ showPlanModal: show }),

  setShowVisaModal: (show) => set({ showVisaModal: show }),

  setShowPackingModal: (show) => set({ showPackingModal: show }),

  createPlan: (name, budget) => {
    const newPlan: TripPlan = {
      id: generateId(),
      name,
      totalBudget: budget,
      items: [],
      visaDocuments: [],
      packingLists: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set((state) => ({
      plans: [...state.plans, newPlan],
      currentPlanId: newPlan.id,
    }));
    saveToStorage('plans', [...get().plans]);
    saveToStorage('currentPlanId', newPlan.id);
  },

  deletePlan: (id) => {
    set((state) => {
      const newPlans = state.plans.filter(p => p.id !== id);
      const newCurrentId = state.currentPlanId === id
        ? (newPlans.length > 0 ? newPlans[0].id : null)
        : state.currentPlanId;
      return {
        plans: newPlans,
        currentPlanId: newCurrentId,
      };
    });
    saveToStorage('plans', get().plans);
    saveToStorage('currentPlanId', get().currentPlanId);
  },

  updatePlan: (id, updates) => {
    set((state) => ({
      plans: state.plans.map(p =>
        p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
      ),
    }));
    saveToStorage('plans', get().plans);
  },

  addItem: (item) => {
    const state = get();
    if (!state.currentPlanId) return;

    const newItem: TripItem = {
      ...item,
      id: generateId(),
      sortOrder: Date.now(),
    };

    set((s) => ({
      plans: s.plans.map(p =>
        p.id === s.currentPlanId
          ? { ...p, items: [...p.items, newItem], updatedAt: new Date().toISOString() }
          : p
      ),
    }));
    saveToStorage('plans', get().plans);
  },

  updateItem: (id, updates) => {
    set((state) => ({
      plans: state.plans.map(p =>
        p.id === state.currentPlanId
          ? {
              ...p,
              items: p.items.map(item =>
                item.id === id ? { ...item, ...updates } : item
              ),
              updatedAt: new Date().toISOString(),
            }
          : p
      ),
    }));
    saveToStorage('plans', get().plans);
  },

  deleteItem: (id) => {
    set((state) => ({
      plans: state.plans.map(p =>
        p.id === state.currentPlanId
          ? { ...p, items: p.items.filter(item => item.id !== id), updatedAt: new Date().toISOString() }
          : p
      ),
    }));
    saveToStorage('plans', get().plans);
  },

  moveItem: (itemId, targetDate, newIndex) => {
    set((state) => {
      const plan = state.plans.find(p => p.id === state.currentPlanId);
      if (!plan) return state;

      const item = plan.items.find(i => i.id === itemId);
      if (!item) return state;

      const updatedItem = {
        ...item,
        startDate: targetDate,
        endDate: isSameDate(item.startDate, item.endDate) ? targetDate : item.endDate,
      };

      const otherItems = plan.items.filter(i => i.id !== itemId);
      const dateItems = otherItems
        .filter(i => isSameDate(i.startDate, targetDate))
        .sort((a, b) => a.sortOrder - b.sortOrder);

      dateItems.splice(newIndex, 0, updatedItem);

      const reindexedDateItems = dateItems.map((it, idx) => ({
        ...it,
        sortOrder: idx,
      }));

      const remainingItems = otherItems.filter(i => !isSameDate(i.startDate, targetDate));

      return {
        plans: state.plans.map(p =>
          p.id === state.currentPlanId
            ? {
                ...p,
                items: [...remainingItems, ...reindexedDateItems],
                updatedAt: new Date().toISOString(),
              }
            : p
        ),
      };
    });
    saveToStorage('plans', get().plans);
  },

  reorderItems: (date, items) => {
    set((state) => {
      const plan = state.plans.find(p => p.id === state.currentPlanId);
      if (!plan) return state;

      const otherItems = plan.items.filter(i => !isSameDate(i.startDate, date));
      const reindexedItems = items.map((it, idx) => ({
        ...it,
        sortOrder: idx,
      }));

      return {
        plans: state.plans.map(p =>
          p.id === state.currentPlanId
            ? {
                ...p,
                items: [...otherItems, ...reindexedItems],
                updatedAt: new Date().toISOString(),
              }
            : p
        ),
      };
    });
    saveToStorage('plans', get().plans);
  },

  addVisaDocument: (doc) => {
    const state = get();
    if (!state.currentPlanId) return;

    const newDoc: VisaDocument = {
      ...doc,
      id: generateId(),
      sortOrder: Date.now(),
    };

    set((s) => ({
      plans: s.plans.map(p =>
        p.id === s.currentPlanId
          ? {
              ...p,
              visaDocuments: [...(p.visaDocuments || []), newDoc],
              updatedAt: new Date().toISOString(),
            }
          : p
      ),
    }));
    saveToStorage('plans', get().plans);
  },

  updateVisaDocument: (id, updates) => {
    set((state) => ({
      plans: state.plans.map(p =>
        p.id === state.currentPlanId
          ? {
              ...p,
              visaDocuments: (p.visaDocuments || []).map(doc =>
                doc.id === id ? { ...doc, ...updates } : doc
              ),
              updatedAt: new Date().toISOString(),
            }
          : p
      ),
    }));
    saveToStorage('plans', get().plans);
  },

  deleteVisaDocument: (id) => {
    set((state) => ({
      plans: state.plans.map(p =>
        p.id === state.currentPlanId
          ? {
              ...p,
              visaDocuments: (p.visaDocuments || []).filter(doc => doc.id !== id),
              updatedAt: new Date().toISOString(),
            }
          : p
      ),
    }));
    saveToStorage('plans', get().plans);
  },

  toggleVisaChecked: (id) => {
    const state = get();
    const plan = state.currentPlan;
    if (!plan) return;
    const doc = (plan.visaDocuments || []).find(d => d.id === id);
    if (doc) {
      state.updateVisaDocument(id, { checked: !doc.checked });
    }
  },

  getExpiryAlertLevel: (expiryDate, alertDaysBefore) => {
    const daysUntil = getDaysUntil(expiryDate);
    if (daysUntil < 0) return 'expired';
    if (daysUntil <= alertDaysBefore * 0.3) return 'danger';
    if (daysUntil <= alertDaysBefore) return 'warning';
    return 'normal';
  },

  getVisaDocumentsByTraveler: (traveler) => {
    const plan = get().currentPlan;
    if (!plan || !plan.visaDocuments) return [];
    return plan.visaDocuments
      .filter(d => d.travelerName === traveler)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  },

  exportPlan: (id) => {
    const plan = get().plans.find(p => p.id === id);
    if (plan) {
      downloadJSON(plan, `${plan.name}-预算方案.json`);
    }
  },

  importPlan: (json) => {
    try {
      const plan = JSON.parse(json) as TripPlan;
      plan.id = generateId();
      plan.createdAt = new Date().toISOString();
      plan.updatedAt = new Date().toISOString();
      plan.items = plan.items.map(item => ({
        ...item,
        id: generateId(),
      }));
      plan.visaDocuments = (plan.visaDocuments || []).map(doc => ({
        ...doc,
        id: generateId(),
      }));
      plan.packingLists = (plan.packingLists || []).map(pl => ({
        ...pl,
        id: generateId(),
        groups: pl.groups.map(g => ({ ...g, id: generateId() })),
        items: pl.items.map(it => ({ ...it, id: generateId() })),
      }));
      set((state) => ({
        plans: [...state.plans, plan],
        currentPlanId: plan.id,
      }));
      saveToStorage('plans', get().plans);
      saveToStorage('currentPlanId', plan.id);
    } catch (e) {
      console.error('Failed to import plan:', e);
    }
  },

  getItemsByDate: (date) => {
    const plan = get().currentPlan;
    if (!plan) return [];
    return plan.items
      .filter(item => isSameDate(item.startDate, date))
      .sort((a, b) => a.sortOrder - b.sortOrder);
  },

  getPerPersonCost: (item) => getPerPersonCost(item),

  getCurrentPackingList: () => {
    const plan = get().currentPlan;
    if (!plan || !plan.packingLists || plan.packingLists.length === 0) return null;
    return plan.packingLists[0];
  },

  createPackingList: (name, maxWeight, maxWeightUnit) => {
    const state = get();
    if (!state.currentPlanId) return;
    const newPackingList = createInitialPackingList(state.currentPlanId, name, maxWeight, maxWeightUnit);
    set((s) => ({
      plans: s.plans.map(p =>
        p.id === s.currentPlanId
          ? { ...p, packingLists: [newPackingList], updatedAt: new Date().toISOString() }
          : p
      ),
    }));
    saveToStorage('plans', get().plans);
  },

  updatePackingList: (updates) => {
    const state = get();
    if (!state.currentPlanId) return;
    set((s) => ({
      plans: s.plans.map(p =>
        p.id === s.currentPlanId && p.packingLists && p.packingLists.length > 0
          ? {
              ...p,
              packingLists: [
                {
                  ...p.packingLists[0],
                  ...updates,
                  updatedAt: new Date().toISOString(),
                },
              ],
              updatedAt: new Date().toISOString(),
            }
          : p
      ),
    }));
    saveToStorage('plans', get().plans);
  },

  addPackingGroup: (name, color) => {
    const state = get();
    if (!state.currentPlanId) return;
    const plan = state.currentPlan;
    if (!plan) return;

    if (!plan.packingLists || plan.packingLists.length === 0) {
      state.createPackingList('行李清单', 20, 'kg');
    }

    set((s) => ({
      plans: s.plans.map(p => {
        if (p.id !== s.currentPlanId || !p.packingLists || p.packingLists.length === 0) return p;
        const pl = p.packingLists[0];
        const newGroup = {
          id: generateId(),
          name,
          color: color || 'tape-blue',
          sortOrder: pl.groups.length,
        };
        return {
          ...p,
          packingLists: [
            {
              ...pl,
              groups: [...pl.groups, newGroup],
              updatedAt: new Date().toISOString(),
            },
          ],
          updatedAt: new Date().toISOString(),
        };
      }),
    }));
    saveToStorage('plans', get().plans);
  },

  updatePackingGroup: (id, updates) => {
    const state = get();
    if (!state.currentPlanId) return;
    set((s) => ({
      plans: s.plans.map(p => {
        if (p.id !== s.currentPlanId || !p.packingLists || p.packingLists.length === 0) return p;
        const pl = p.packingLists[0];
        return {
          ...p,
          packingLists: [
            {
              ...pl,
              groups: pl.groups.map(g => g.id === id ? { ...g, ...updates } : g),
              updatedAt: new Date().toISOString(),
            },
          ],
          updatedAt: new Date().toISOString(),
        };
      }),
    }));
    saveToStorage('plans', get().plans);
  },

  deletePackingGroup: (id) => {
    const state = get();
    if (!state.currentPlanId) return;
    set((s) => ({
      plans: s.plans.map(p => {
        if (p.id !== s.currentPlanId || !p.packingLists || p.packingLists.length === 0) return p;
        const pl = p.packingLists[0];
        return {
          ...p,
          packingLists: [
            {
              ...pl,
              groups: pl.groups.filter(g => g.id !== id),
              items: pl.items.filter(i => i.groupId !== id),
              updatedAt: new Date().toISOString(),
            },
          ],
          updatedAt: new Date().toISOString(),
        };
      }),
    }));
    saveToStorage('plans', get().plans);
  },

  addPackingItem: (item) => {
    const state = get();
    if (!state.currentPlanId) return;
    const plan = state.currentPlan;
    if (!plan) return;

    if (!plan.packingLists || plan.packingLists.length === 0) {
      state.createPackingList('行李清单', 20, 'kg');
    }

    set((s) => ({
      plans: s.plans.map(p => {
        if (p.id !== s.currentPlanId || !p.packingLists || p.packingLists.length === 0) return p;
        const pl = p.packingLists[0];
        const newItem: PackingItem = {
          ...item,
          id: generateId(),
          sortOrder: pl.items.length,
        };
        return {
          ...p,
          packingLists: [
            {
              ...pl,
              items: [...pl.items, newItem],
              updatedAt: new Date().toISOString(),
            },
          ],
          updatedAt: new Date().toISOString(),
        };
      }),
    }));
    saveToStorage('plans', get().plans);
  },

  updatePackingItem: (id, updates) => {
    const state = get();
    if (!state.currentPlanId) return;
    set((s) => ({
      plans: s.plans.map(p => {
        if (p.id !== s.currentPlanId || !p.packingLists || p.packingLists.length === 0) return p;
        const pl = p.packingLists[0];
        return {
          ...p,
          packingLists: [
            {
              ...pl,
              items: pl.items.map(i => i.id === id ? { ...i, ...updates } : i),
              updatedAt: new Date().toISOString(),
            },
          ],
          updatedAt: new Date().toISOString(),
        };
      }),
    }));
    saveToStorage('plans', get().plans);
  },

  deletePackingItem: (id) => {
    const state = get();
    if (!state.currentPlanId) return;
    set((s) => ({
      plans: s.plans.map(p => {
        if (p.id !== s.currentPlanId || !p.packingLists || p.packingLists.length === 0) return p;
        const pl = p.packingLists[0];
        return {
          ...p,
          packingLists: [
            {
              ...pl,
              items: pl.items.filter(i => i.id !== id),
              updatedAt: new Date().toISOString(),
            },
          ],
          updatedAt: new Date().toISOString(),
        };
      }),
    }));
    saveToStorage('plans', get().plans);
  },

  togglePackingItem: (id) => {
    const state = get();
    const plan = state.currentPlan;
    if (!plan || !plan.packingLists || plan.packingLists.length === 0) return;
    const item = plan.packingLists[0].items.find(i => i.id === id);
    if (item) {
      state.updatePackingItem(id, { packed: !item.packed });
    }
  },

  getItemsByGroup: (groupId) => {
    const plan = get().currentPlan;
    if (!plan || !plan.packingLists || plan.packingLists.length === 0) return [];
    return plan.packingLists[0].items
      .filter(i => i.groupId === groupId)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  },

  calculateGroupWeight: (groupId) => {
    const items = get().getItemsByGroup(groupId);
    const convertToGrams = (w: number, unit: 'g' | 'kg') => unit === 'kg' ? w * 1000 : w;
    return items.reduce((sum, i) => sum + convertToGrams(i.weight * i.quantity, i.unit), 0);
  },
}));
