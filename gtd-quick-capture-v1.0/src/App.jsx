// =============================================================================
// App.jsx — 頂層元件（v1.0）
// =============================================================================
// v1.0 架構：
//   AppProvider
//     └─ AppLayout
//          ├─ CaptureBar
//          ├─ 頂部模式切換（清單 / Clarify / 統計）
//          └─ 依模式顯示：
//               ├─ 清單模式：CategoryNav + CategoryView
//               ├─ Clarify 模式：ClarifyView
//               └─ 統計模式：StatsView
// =============================================================================

import { useState } from 'react';
import { ListTodo, Sparkles, TrendingUp } from 'lucide-react';
import { AppProvider } from './context/AppContext.jsx';
import { CATEGORIES } from './context/reducer.js';
import CaptureBar from './components/CaptureBar.jsx';
import CategoryNav from './components/CategoryNav.jsx';
import CategoryView from './components/CategoryView.jsx';
import ClarifyView from './components/ClarifyView.jsx';
import StatsView from './components/StatsView.jsx';

// 三種主模式
const MODES = {
  LIST: 'list',
  CLARIFY: 'clarify',
  STATS: 'stats',
};

function AppLayout() {
  const [mode, setMode] = useState(MODES.LIST);
  const [activeCategory, setActiveCategory] = useState(CATEGORIES.INBOX);

  const modeButtons = [
    { id: MODES.LIST, label: '清單', icon: ListTodo },
    { id: MODES.CLARIFY, label: 'Clarify', icon: Sparkles },
    { id: MODES.STATS, label: '統計', icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <CaptureBar />

      {/* 頂部模式切換列 */}
      <div className="border-b border-slate/10 bg-white/50">
        <div className="max-w-5xl mx-auto px-4 flex gap-1">
          {modeButtons.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setMode(id)}
              className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors
                          ${mode === id
                            ? 'border-moss text-moss'
                            : 'border-transparent text-slate hover:text-ink'}`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>
      </div>

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6">
        {mode === MODES.LIST && (
          <div className="flex flex-col sm:flex-row gap-6">
            <CategoryNav activeCategory={activeCategory} onSelect={setActiveCategory} />
            <CategoryView category={activeCategory} />
          </div>
        )}
        {mode === MODES.CLARIFY && (
          <ClarifyView onExit={() => setMode(MODES.LIST)} />
        )}
        {mode === MODES.STATS && (
          <StatsView />
        )}
      </main>

      <footer className="py-4 text-center text-xs text-slate/60">
        GTD Quick Capture v1.0 · 成育典 · React 期末專題
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppLayout />
    </AppProvider>
  );
}
