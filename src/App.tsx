import { useTripStore } from '@/store/useTripStore';
import { Header } from '@/components/Header';
import { BudgetDashboard } from '@/components/BudgetDashboard';
import { ExpenseBuckets } from '@/components/ExpenseBuckets';
import { Timeline } from '@/components/Timeline';
import { CityFilter } from '@/components/CityFilter';
import { ItemEditor } from '@/components/ItemEditor';
import { SplitModal } from '@/components/SplitModal';
import { PlanManager } from '@/components/PlanManager';
import { VisaChecklist } from '@/components/VisaChecklist';
import { PackingList } from '@/components/PackingList';
import { WeatherEditor } from '@/components/WeatherEditor';

export default function App() {
  const { editingItem, setEditingItem, editingWeather, setEditingWeather, showSplitModal, showPlanModal, showVisaModal, showPackingModal, showWeatherModal, setShowWeatherModal, currentPlan } = useTripStore();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-6 py-6">
        <div className="flex flex-col xl:flex-row gap-6 h-full">
          <div className="xl:w-72 flex-shrink-0 space-y-4 order-2 xl:order-1">
            <ExpenseBuckets />
            <CityFilter />
          </div>

          <div className="flex-1 flex flex-col min-h-[600px] order-1 xl:order-2">
            <Timeline />
          </div>

          <div className="xl:w-80 flex-shrink-0 order-3">
            <div className="sticky top-24">
              <BudgetDashboard />
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-paper-50 border-t border-paper-200 py-4 text-center text-xs text-ink-400">
        <p>
          旅行手账 · 预算沙盘
          {currentPlan && (
            <span className="ml-2">
              · 最后保存于 {new Date(currentPlan.updatedAt).toLocaleString('zh-CN')}
            </span>
          )}
        </p>
      </footer>

      {editingItem && (
        <ItemEditor item={editingItem} onClose={() => setEditingItem(null)} />
      )}

      {showSplitModal && <SplitModal />}

      {showPlanModal && <PlanManager />}

      {showVisaModal && <VisaChecklist />}

      {showPackingModal && <PackingList />}

      {showWeatherModal && editingWeather && (
        <WeatherEditor
          weather={editingWeather}
          onClose={() => {
            setShowWeatherModal(false);
            setEditingWeather(null);
          }}
        />
      )}
    </div>
  );
}
