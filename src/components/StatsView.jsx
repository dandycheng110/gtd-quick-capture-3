// =============================================================================
// StatsView.jsx — 統計儀表板（v1.0 新增）
// =============================================================================
// 顯示各分類數量分布、今日捕捉數、完成數等。
//
// 設計：用純 CSS 畫長條圖（不引入圖表庫）。
//   好處：零依賴、好解釋、檔案小。每根長條就是一個寬度按比例的 div。
//
// 學習重點：用 reduce / filter 從原始資料算出統計數字（資料轉換）
// =============================================================================

import {
  Inbox, Zap, Clock, Cloud, BookMarked, CheckCircle2, TrendingUp,
} from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { CATEGORY_ORDER, CATEGORY_META } from '../utils/categories.js';

const ICON_MAP = { Inbox, Zap, Clock, Cloud, BookMarked, CheckCircle2 };

// 分類對應的長條顏色
const BAR_COLORS = {
  inbox: '#6b7280',
  next: '#3d5a40',
  waiting: '#c9a227',
  someday: '#9ca3af',
  reference: '#5b7d5e',
  done: '#8b3a3a',
};

export default function StatsView() {
  const { state } = useApp();
  const items = state.items;

  // === 計算統計數字 ===
  const total = items.length;

  // 各分類數量
  const byCategory = CATEGORY_ORDER.map(cat => ({
    category: cat,
    label: CATEGORY_META[cat].label,
    count: items.filter(it => it.category === cat).length,
  }));

  const maxCount = Math.max(...byCategory.map(c => c.count), 1);

  // 今日捕捉數
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const capturedToday = items.filter(it => it.createdAt >= todayStart.getTime()).length;

  // 完成數
  const doneCount = items.filter(it => it.category === 'done').length;
  // 完成率
  const completionRate = total > 0 ? Math.round((doneCount / total) * 100) : 0;

  return (
    <div className="flex-1 min-w-0">
      <div className="mb-6 flex items-center gap-2">
        <TrendingUp size={20} className="text-moss" />
        <h2 className="text-xl font-bold text-ink">統計儀表板</h2>
      </div>

      {/* 三個數字卡 */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white border border-slate/15 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-moss">{total}</p>
          <p className="text-xs text-slate mt-1">總項目數</p>
        </div>
        <div className="bg-white border border-slate/15 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-mossLight">{capturedToday}</p>
          <p className="text-xs text-slate mt-1">今日捕捉</p>
        </div>
        <div className="bg-white border border-slate/15 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-gold" style={{ color: '#c9a227' }}>{completionRate}%</p>
          <p className="text-xs text-slate mt-1">完成率</p>
        </div>
      </div>

      {/* 分類分布長條圖 */}
      <div className="bg-white border border-slate/15 rounded-xl p-5">
        <h3 className="text-sm font-bold text-ink mb-4">各分類分布</h3>
        <div className="space-y-3">
          {byCategory.map(({ category, label, count }) => {
            const Icon = ICON_MAP[CATEGORY_META[category].icon];
            const widthPct = (count / maxCount) * 100;
            return (
              <div key={category} className="flex items-center gap-3">
                <div className="w-28 flex items-center gap-1.5 flex-shrink-0">
                  <Icon size={14} style={{ color: BAR_COLORS[category] }} />
                  <span className="text-xs text-ink truncate">{label}</span>
                </div>
                <div className="flex-1 h-6 bg-slate/10 rounded overflow-hidden">
                  <div
                    className="h-full rounded transition-all duration-500 flex items-center justify-end pr-2"
                    style={{
                      width: count > 0 ? `${Math.max(widthPct, 8)}%` : '0%',
                      backgroundColor: BAR_COLORS[category],
                    }}
                  >
                    {count > 0 && (
                      <span className="text-xs text-white font-medium">{count}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {total === 0 && (
        <p className="text-center text-sm text-slate mt-6">
          還沒有資料，先去捕捉一些項目吧
        </p>
      )}
    </div>
  );
}
