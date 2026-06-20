import type { TripItem, ItemType } from '@/types';

export const calculateTotal = (items: TripItem[]): number => {
  return items.reduce((sum, item) => sum + item.cost, 0);
};

export const calculateByType = (items: TripItem[], type: ItemType): number => {
  return items
    .filter(item => item.type === type)
    .reduce((sum, item) => sum + item.cost, 0);
};

export const calculateByCity = (items: TripItem[], city: string): number => {
  return items
    .filter(item => item.city === city)
    .reduce((sum, item) => sum + item.cost, 0);
};

export const calculateByCityMap = (items: TripItem[]): Record<string, number> => {
  return items.reduce((acc, item) => {
    acc[item.city] = (acc[item.city] || 0) + item.cost;
    return acc;
  }, {} as Record<string, number>);
};

export const getPerPersonCost = (item: TripItem): number => {
  if (item.participants.length === 0) return item.cost;
  return item.cost / item.participants.length;
};

export const formatCurrency = (amount: number): string => {
  return `¥${amount.toLocaleString('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
};

export const getUniqueCities = (items: TripItem[]): string[] => {
  return [...new Set(items.map(item => item.city).filter(Boolean))].sort();
};

export const getBudgetPercentage = (spent: number, budget: number): number => {
  if (budget <= 0) return 100;
  return Math.min((spent / budget) * 100, 100);
};
