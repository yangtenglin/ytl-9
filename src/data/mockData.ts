import type { TripPlan, VisaDocument, PackingList } from '@/types';
import { generateId } from '@/utils/dateUtils';
import { DEFAULT_PACKING_GROUPS } from '@/types';

const today = new Date();
const formatDate = (d: Date) => d.toISOString().split('T')[0];

const startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

const addMonths = (d: Date, months: number) => {
  const result = new Date(d);
  result.setMonth(result.getMonth() + months);
  return result;
};

const addDays = (d: Date, days: number) => {
  const result = new Date(d);
  result.setDate(result.getDate() + days);
  return result;
};

const mockVisaDocuments: VisaDocument[] = [
  {
    id: generateId(),
    travelerName: '小明',
    documentType: '护照',
    documentNumber: 'E12345678',
    issueDate: formatDate(addMonths(today, -24)),
    expiryDate: formatDate(addMonths(today, 80)),
    alertDaysBefore: 180,
    status: 'approved',
    uploaded: true,
    checked: true,
    uploadFileName: '小明-护照.jpg',
    note: '护照有效期充足',
    sortOrder: 0,
  },
  {
    id: generateId(),
    travelerName: '小明',
    documentType: '日本签证',
    documentNumber: 'V9876543210',
    issueDate: formatDate(addMonths(today, -1)),
    expiryDate: formatDate(addMonths(today, 2)),
    alertDaysBefore: 60,
    status: 'approved',
    uploaded: true,
    checked: true,
    uploadFileName: '小明-日本签证.pdf',
    note: '单次入境，90天有效期',
    sortOrder: 1,
  },
  {
    id: generateId(),
    travelerName: '小明',
    documentType: '机票行程单',
    documentNumber: 'CA1234567890',
    issueDate: formatDate(addDays(today, -7)),
    expiryDate: formatDate(addDays(startDate, 7)),
    alertDaysBefore: 30,
    status: 'approved',
    uploaded: true,
    checked: false,
    uploadFileName: '小明-机票行程单.pdf',
    note: '往返机票确认单',
    sortOrder: 2,
  },
  {
    id: generateId(),
    travelerName: '小明',
    documentType: '酒店预订单',
    documentNumber: 'HTL20240615',
    issueDate: formatDate(addDays(today, -3)),
    expiryDate: formatDate(addDays(startDate, 6)),
    alertDaysBefore: 15,
    status: 'pending',
    uploaded: false,
    checked: false,
    note: '含所有酒店的确认单',
    sortOrder: 3,
  },
  {
    id: generateId(),
    travelerName: '小红',
    documentType: '护照',
    documentNumber: 'E87654321',
    issueDate: formatDate(addMonths(today, -36)),
    expiryDate: formatDate(addDays(today, -5)),
    alertDaysBefore: 180,
    status: 'pending',
    uploaded: false,
    checked: false,
    note: '⚠️ 护照已过期，需尽快补办！',
    sortOrder: 0,
  },
  {
    id: generateId(),
    travelerName: '小红',
    documentType: '日本签证',
    documentNumber: 'V0123456789',
    issueDate: formatDate(addMonths(today, -1)),
    expiryDate: formatDate(addDays(today, 10)),
    alertDaysBefore: 60,
    status: 'submitted',
    uploaded: true,
    checked: false,
    uploadFileName: '小红-签证受理回执.jpg',
    note: '签证办理中，预计2周出签',
    sortOrder: 1,
  },
  {
    id: generateId(),
    travelerName: '小红',
    documentType: '机票行程单',
    documentNumber: 'CA0987654321',
    issueDate: formatDate(addDays(today, -7)),
    expiryDate: formatDate(addDays(startDate, 7)),
    alertDaysBefore: 30,
    status: 'approved',
    uploaded: true,
    checked: true,
    uploadFileName: '小红-机票行程单.pdf',
    note: '与小明同班机',
    sortOrder: 2,
  },
  {
    id: generateId(),
    travelerName: '小红',
    documentType: '保险单',
    documentNumber: 'INS2024JP001',
    issueDate: formatDate(addDays(today, -1)),
    expiryDate: formatDate(addDays(startDate, 8)),
    alertDaysBefore: 15,
    status: 'approved',
    uploaded: true,
    checked: true,
    uploadFileName: '小红-境外医疗保险.pdf',
    note: '保额50万，含紧急医疗转运',
    sortOrder: 3,
  },
];

export const mockPlan: TripPlan = {
  id: generateId(),
  name: '关西夏日之旅',
  totalBudget: 15000,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  visaDocuments: mockVisaDocuments,
  items: [
    {
      id: generateId(),
      title: '上海 → 大阪 机票',
      type: 'transport',
      city: '大阪',
      startDate: formatDate(startDate),
      endDate: formatDate(startDate),
      cost: 2800,
      participants: ['小明', '小红'],
      note: '往返机票，提前3个月预订优惠',
      sortOrder: 0,
    },
    {
      id: generateId(),
      title: '难波华盛顿酒店',
      type: 'accommodation',
      city: '大阪',
      startDate: formatDate(startDate),
      endDate: formatDate(new Date(startDate.getTime() + 2 * 24 * 60 * 60 * 1000)),
      cost: 1800,
      participants: ['小明', '小红'],
      note: '含早餐，步行5分钟到难波站',
      sortOrder: 1,
    },
    {
      id: generateId(),
      title: '道顿堀美食巡礼',
      type: 'activity',
      city: '大阪',
      startDate: formatDate(startDate),
      endDate: formatDate(startDate),
      cost: 500,
      participants: ['小明', '小红'],
      note: '章鱼烧、大阪烧、蟹道乐',
      sortOrder: 2,
    },
    {
      id: generateId(),
      title: '大阪 → 京都 JR',
      type: 'transport',
      city: '京都',
      startDate: formatDate(new Date(startDate.getTime() + 3 * 24 * 60 * 60 * 1000)),
      endDate: formatDate(new Date(startDate.getTime() + 3 * 24 * 60 * 60 * 1000)),
      cost: 120,
      participants: ['小明', '小红'],
      note: 'JR东海道新干线，约30分钟',
      sortOrder: 0,
    },
    {
      id: generateId(),
      title: '清水寺+伏见稻荷',
      type: 'activity',
      city: '京都',
      startDate: formatDate(new Date(startDate.getTime() + 3 * 24 * 60 * 60 * 1000)),
      endDate: formatDate(new Date(startDate.getTime() + 3 * 24 * 60 * 60 * 1000)),
      cost: 800,
      participants: ['小明', '小红'],
      note: '门票+和服体验',
      sortOrder: 1,
    },
    {
      id: generateId(),
      title: '京都祇园日式旅馆',
      type: 'accommodation',
      city: '京都',
      startDate: formatDate(new Date(startDate.getTime() + 3 * 24 * 60 * 60 * 1000)),
      endDate: formatDate(new Date(startDate.getTime() + 4 * 24 * 60 * 60 * 1000)),
      cost: 2500,
      participants: ['小明', '小红'],
      note: '含怀石料理，传统榻榻米房间',
      sortOrder: 2,
    },
    {
      id: generateId(),
      title: '岚山小火车',
      type: 'activity',
      city: '京都',
      startDate: formatDate(new Date(startDate.getTime() + 4 * 24 * 60 * 60 * 1000)),
      endDate: formatDate(new Date(startDate.getTime() + 4 * 24 * 60 * 60 * 1000)),
      cost: 400,
      participants: ['小明', '小红'],
      note: '保津川游船+小火车',
      sortOrder: 0,
    },
    {
      id: generateId(),
      title: '京都 → 东京 新干线',
      type: 'transport',
      city: '东京',
      startDate: formatDate(new Date(startDate.getTime() + 5 * 24 * 60 * 60 * 1000)),
      endDate: formatDate(new Date(startDate.getTime() + 5 * 24 * 60 * 60 * 1000)),
      cost: 1400,
      participants: ['小明', '小红'],
      note: '希望号，约2.5小时',
      sortOrder: 0,
    },
    {
      id: generateId(),
      title: '东京银座酒店',
      type: 'accommodation',
      city: '东京',
      startDate: formatDate(new Date(startDate.getTime() + 5 * 24 * 60 * 60 * 1000)),
      endDate: formatDate(new Date(startDate.getTime() + 6 * 24 * 60 * 60 * 1000)),
      cost: 2200,
      participants: ['小明', '小红'],
      note: '交通便利，购物方便',
      sortOrder: 1,
    },
    {
      id: generateId(),
      title: '东京迪士尼乐园',
      type: 'activity',
      city: '东京',
      startDate: formatDate(new Date(startDate.getTime() + 6 * 24 * 60 * 60 * 1000)),
      endDate: formatDate(new Date(startDate.getTime() + 6 * 24 * 60 * 60 * 1000)),
      cost: 1200,
      participants: ['小明', '小红'],
      note: '一日票，建议早到',
      sortOrder: 0,
    },
    {
      id: generateId(),
      title: '东京 → 上海 机票',
      type: 'transport',
      city: '东京',
      startDate: formatDate(new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000)),
      endDate: formatDate(new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000)),
      cost: 2600,
      participants: ['小明', '小红'],
      note: '返程机票，羽田机场出发',
      sortOrder: 0,
    },
  ],
  packingLists: [],
};

export const createInitialPackingList = (
  planId: string,
  name: string,
  maxWeight: number,
  maxWeightUnit: 'g' | 'kg'
): PackingList => {
  const groups = DEFAULT_PACKING_GROUPS.map((g, idx) => ({
    id: generateId(),
    name: g.name,
    color: g.color,
    sortOrder: idx,
  }));

  const items = [
    { id: generateId(), name: '护照', quantity: 2, weight: 100, unit: 'g' as const, priority: 'must' as const, groupId: groups[0].id, packed: false, note: '每人一本', sortOrder: 0 },
    { id: generateId(), name: '日本签证', quantity: 2, weight: 20, unit: 'g' as const, priority: 'must' as const, groupId: groups[0].id, packed: false, note: '打印的在留卡', sortOrder: 1 },
    { id: generateId(), name: '机票行程单', quantity: 2, weight: 50, unit: 'g' as const, priority: 'must' as const, groupId: groups[0].id, packed: false, note: '电子版+纸质版', sortOrder: 2 },
    { id: generateId(), name: '身份证', quantity: 2, weight: 20, unit: 'g' as const, priority: 'important' as const, groupId: groups[0].id, packed: false, note: '', sortOrder: 3 },
    { id: generateId(), name: '短袖T恤', quantity: 8, weight: 200, unit: 'g' as const, priority: 'important' as const, groupId: groups[1].id, packed: false, note: '每人4件', sortOrder: 0 },
    { id: generateId(), name: '内衣裤', quantity: 10, weight: 80, unit: 'g' as const, priority: 'important' as const, groupId: groups[1].id, packed: false, note: '', sortOrder: 1 },
    { id: generateId(), name: '薄外套', quantity: 2, weight: 400, unit: 'g' as const, priority: 'optional' as const, groupId: groups[1].id, packed: false, note: '空调房用', sortOrder: 2 },
    { id: generateId(), name: '轻便运动鞋', quantity: 2, weight: 500, unit: 'g' as const, priority: 'must' as const, groupId: groups[1].id, packed: false, note: '舒适为主', sortOrder: 3 },
    { id: generateId(), name: '拖鞋', quantity: 2, weight: 300, unit: 'g' as const, priority: 'optional' as const, groupId: groups[1].id, packed: false, note: '酒店穿', sortOrder: 4 },
    { id: generateId(), name: '手机', quantity: 2, weight: 200, unit: 'g' as const, priority: 'must' as const, groupId: groups[2].id, packed: false, note: '', sortOrder: 0 },
    { id: generateId(), name: '充电宝', quantity: 1, weight: 200, unit: 'g' as const, priority: 'must' as const, groupId: groups[2].id, packed: false, note: '小于100Wh', sortOrder: 1 },
    { id: generateId(), name: '充电器', quantity: 2, weight: 100, unit: 'g' as const, priority: 'must' as const, groupId: groups[2].id, packed: false, note: 'Type-C', sortOrder: 2 },
    { id: generateId(), name: '转换插头', quantity: 2, weight: 100, unit: 'g' as const, priority: 'important' as const, groupId: groups[2].id, packed: false, note: '日本两扁插', sortOrder: 3 },
    { id: generateId(), name: '移动WiFi', quantity: 1, weight: 150, unit: 'g' as const, priority: 'important' as const, groupId: groups[2].id, packed: false, note: '机场取还', sortOrder: 4 },
    { id: generateId(), name: '牙刷套装', quantity: 2, weight: 80, unit: 'g' as const, priority: 'important' as const, groupId: groups[3].id, packed: false, note: '', sortOrder: 0 },
    { id: generateId(), name: '防晒霜', quantity: 1, weight: 100, unit: 'g' as const, priority: 'must' as const, groupId: groups[3].id, packed: false, note: 'SPF50+', sortOrder: 1 },
    { id: generateId(), name: '洗面奶', quantity: 1, weight: 120, unit: 'g' as const, priority: 'important' as const, groupId: groups[3].id, packed: false, note: '', sortOrder: 2 },
    { id: generateId(), name: '毛巾', quantity: 2, weight: 150, unit: 'g' as const, priority: 'important' as const, groupId: groups[3].id, packed: false, note: '速干巾', sortOrder: 3 },
    { id: generateId(), name: '感冒药', quantity: 1, weight: 50, unit: 'g' as const, priority: 'important' as const, groupId: groups[4].id, packed: false, note: '', sortOrder: 0 },
    { id: generateId(), name: '肠胃药', quantity: 1, weight: 50, unit: 'g' as const, priority: 'must' as const, groupId: groups[4].id, packed: false, note: '吃生冷必带', sortOrder: 1 },
    { id: generateId(), name: '创可贴', quantity: 10, weight: 20, unit: 'g' as const, priority: 'important' as const, groupId: groups[4].id, packed: false, note: '', sortOrder: 2 },
    { id: generateId(), name: '晕车药', quantity: 1, weight: 20, unit: 'g' as const, priority: 'optional' as const, groupId: groups[4].id, packed: false, note: '新干线用', sortOrder: 3 },
  ];

  return {
    id: generateId(),
    planId,
    name,
    maxWeight,
    maxWeightUnit,
    groups,
    items,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

const defaultPackingList = createInitialPackingList(mockPlan.id, '关西行李清单', 20, 'kg');
mockPlan.packingLists = [defaultPackingList];

export const getInitialPlans = (): TripPlan[] => {
  return [mockPlan];
};

export const getInitialPlanId = (): string => {
  return mockPlan.id;
};
