import { create } from 'zustand';
import type { TripStore, TripItem, TripPlan } from '@/types';
import { generateId, getDateRange, isSameDate } from '@/utils/dateUtils';
import {
  calculateTotal,
  calculateByType,
  calculateByCityMap,
  getUniqueCities,
  getPerPersonCost,
} from '@/utils/costUtils';
import { loadFromStorage, saveToStorage, downloadJSON } from '@/utils/storageUtils';
import { getInitialPlans, getInitialPlanId } from '@/data/mockData';

const storedPlans = loadFromStorage<TripPlan[]>('plans', []);
const storedCurrentPlanId = loadFromStorage<string | null>('currentPlanId', null);

const initialPlans = storedPlans.length > 0 ? storedPlans : getInitialPlans();
const initialPlanId = storedCurrentPlanId || getInitialPlanId();

export const useTripStore = create<TripStore>((set, get) => ({
  currentPlanId: initialPlanId,
  plans: initialPlans,
  selectedCity: null,
  editingItem: null,
  showSplitModal: false,
  showPlanModal: false,

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

  setCurrentPlanId: (id) => {
    set({ currentPlanId: id });
    saveToStorage('currentPlanId', id);
  },

  setSelectedCity: (city) => set({ selectedCity: city }),

  setEditingItem: (item) => set({ editingItem: item }),

  setShowSplitModal: (show) => set({ showSplitModal: show }),

  setShowPlanModal: (show) => set({ showPlanModal: show }),

  createPlan: (name, budget) => {
    const newPlan: TripPlan = {
      id: generateId(),
      name,
      totalBudget: budget,
      items: [],
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
}));
