// =============================================================================
// ClarifyView.jsx — Clarify 釐清精靈（v1.0 新增，最吸睛功能）
// =============================================================================
// 一次處理一個 inbox 項目，照決策樹問問題，根據答案自動分類。
//
// 學習重點：
// 1. 多步驟流程的 state 管理（目前在決策樹的哪個節點）
// 2. 用資料（CLARIFY_TREE）驅動 UI，元件邏輯保持單純
// 3. 條件渲染：有項目時顯示問題、處理完顯示完成畫面
// =============================================================================

import { useState } from 'react';
import { Sparkles, ArrowRight, CheckCircle2, X } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { ACTIONS, CATEGORIES } from '../context/reducer.js';
import { CATEGORY_META } from '../utils/categories.js';
import { CLARIFY_TREE } from '../utils/clarifyFlow.js';
import TwoMinuteTimer from './TwoMinuteTimer.jsx';

export default function ClarifyView({ onExit }) {
  const { state, dispatch } = useApp();

  // 取得所有待釐清的 inbox 項目
  const inboxItems = state.items.filter(it => it.category === CATEGORIES.INBOX);

  // 目前處理到第幾個項目
  const [currentIndex, setCurrentIndex] = useState(0);
  // 目前在決策樹的哪個節點
  const [nodeKey, setNodeKey] = useState(CLARIFY_TREE.start);
  // 計時器要顯示的項目（null = 不顯示）
  const [timerItem, setTimerItem] = useState(null);

  const currentItem = inboxItems[currentIndex];

  // === 全部處理完的畫面 ===
  if (!currentItem) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
        <CheckCircle2 size={56} className="text-moss mb-4" strokeWidth={1.5} />
        <h2 className="text-2xl font-bold text-ink mb-2">Inbox 清空了！</h2>
        <p className="text-slate mb-6">所有項目都已經釐清分類完成</p>
        <button
          onClick={onExit}
          className="px-5 py-2.5 bg-moss text-paper rounded-lg hover:bg-mossLight transition-colors"
        >
          回到清單
        </button>
      </div>
    );
  }

  const node = CLARIFY_TREE[nodeKey];

  // 處理使用者的回答（yes / no）
  function handleAnswer(answer) {
    const branch = node[answer];

    if (branch.next) {
      // 還有下一題，前往下一個節點
      setNodeKey(branch.next);
    } else if (branch.result) {
      // 到達結果，分類這個項目
      dispatch({
        type: ACTIONS.CLARIFY,
        payload: { id: currentItem.id, category: branch.result },
      });

      // 如果要跳計時器（兩分鐘規則）
      if (branch.startTimer) {
        setTimerItem(currentItem);
      }

      goToNext();
    }
  }

  // 前往下一個項目，重置決策樹
  function goToNext() {
    setNodeKey(CLARIFY_TREE.start);
    // 因為當前項目已被分類（離開 inbox），currentIndex 不用加，
    // 但因為 inboxItems 會重算，這裡用 0 重新從第一個未處理的開始
    setCurrentIndex(0);
  }

  function handleTimerComplete() {
    if (timerItem) {
      dispatch({ type: ACTIONS.TOGGLE_DONE, payload: timerItem.id });
    }
    setTimerItem(null);
  }

  const remaining = inboxItems.length;

  return (
    <div className="flex-1 min-w-0">
      {/* 頂部：進度 + 離開 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Sparkles size={20} className="text-moss" />
          <h2 className="text-xl font-bold text-ink">Clarify 釐清</h2>
          <span className="text-sm text-slate">還剩 {remaining} 項</span>
        </div>
        <button
          onClick={onExit}
          className="text-slate hover:text-ink p-1.5 hover:bg-slate/10 rounded transition-colors"
          aria-label="離開"
        >
          <X size={20} />
        </button>
      </div>

      {/* 進度條 */}
      <div className="w-full h-1.5 bg-slate/15 rounded-full mb-8 overflow-hidden">
        <div
          className="h-full bg-moss transition-all duration-300"
          style={{ width: `${100 / (remaining + 0.5)}%` }}
        />
      </div>

      {/* 卡片：目前項目 */}
      <div className="bg-white border border-slate/15 rounded-2xl shadow-sm p-6 mb-6">
        <span className="text-xs font-medium text-mossLight uppercase tracking-wide">
          正在處理
        </span>
        <p className="text-lg text-ink mt-2 break-words">{currentItem.content}</p>
      </div>

      {/* 決策問題 */}
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-ink mb-2">{node.question}</h3>
        <p className="text-sm text-slate">{node.hint}</p>
      </div>

      {/* 兩個答案按鈕 */}
      <div className="flex gap-3 max-w-md mx-auto">
        <button
          onClick={() => handleAnswer('yes')}
          className="flex-1 py-4 bg-moss text-paper rounded-xl hover:bg-mossLight font-medium text-lg transition-colors active:scale-95"
        >
          是
        </button>
        <button
          onClick={() => handleAnswer('no')}
          className="flex-1 py-4 bg-white border-2 border-slate/20 text-ink rounded-xl hover:border-moss hover:text-moss font-medium text-lg transition-colors active:scale-95"
        >
          否
        </button>
      </div>

      {/* 計時器彈窗 */}
      {timerItem && (
        <TwoMinuteTimer
          itemContent={timerItem.content}
          onComplete={handleTimerComplete}
          onClose={() => setTimerItem(null)}
        />
      )}
    </div>
  );
}
