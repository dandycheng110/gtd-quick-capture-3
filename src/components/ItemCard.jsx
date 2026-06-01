// =============================================================================
// ItemCard.jsx — 單一項目卡片（v0.2 新增）
// =============================================================================
// 這是「component 拆分」的核心示範。
//
// 為什麼要把卡片從 InboxView 抽出來變成獨立元件？
// 1. 重用：Inbox 視圖、五大分類視圖都會用到「顯示一個項目」這件事，
//    抽出來後到處都能用，不用複製貼上。
// 2. 單一職責：ItemCard 只負責「顯示與操作一個項目」，
//    InboxView 只負責「決定要顯示哪些項目」。各做各的事。
// 3. 可讀性：評分標準明確要求「避免全部寫在一個 component」。
//
// 關於 props（這一階的學習重點）：
//   父元件透過 props 把「資料」和「事件處理函式」傳給子元件。
//   ItemCard 自己不知道 dispatch，它只負責在使用者操作時「通知父層」。
//   這叫做「資料往下傳、事件往上報」的單向資料流。
// =============================================================================

import { useState, useRef, useEffect } from 'react';
import { Trash2, Check, Pencil, X, ArrowRightLeft, Sparkles } from 'lucide-react';
import { smartClassify } from '../utils/smartClassify.js';
import { CATEGORY_META } from '../utils/categories.js';

// props 解構：
//   item        — 要顯示的項目資料
//   onEdit      — 使用者編輯完成時呼叫，傳回新內容
//   onDelete    — 使用者按刪除時呼叫
//   onToggleDone— 使用者勾選完成時呼叫
//   onMove      — 使用者想移動分類時呼叫（v0.2 先做簡單版）
//   showMoveButton — 是否顯示「移動」按鈕（Inbox 不需要，分類視圖需要）
export default function ItemCard({
  item,
  onEdit,
  onDelete,
  onToggleDone,
  onMove,
  onClassify,
  showMoveButton = false,
  showAiButton = false,
}) {
  // === 編輯模式的 state ===
  // 這是「元件內部狀態」，只有這張卡片自己關心，不需要放到全域
  // 這就是 useState 的正確使用時機：純粹的 UI 局部狀態
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(item.content);
  const inputRef = useRef(null);

  // === AI 建議的 state ===
  const [suggestion, setSuggestion] = useState(null);

  function handleAiSuggest() {
    setSuggestion(smartClassify(item.content));
  }

  function acceptSuggestion() {
    if (suggestion && onClassify) {
      onClassify(item.id, suggestion.category, suggestion.contextTag);
    }
    setSuggestion(null);
  }

  // 進入編輯模式時，自動 focus 並把游標移到最後
  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      // 把游標移到文字最後（而不是選取全部）
      const len = inputRef.current?.value.length ?? 0;
      inputRef.current?.setSelectionRange(len, len);
    }
  }, [isEditing]);

  function startEdit() {
    setDraft(item.content); // 每次進編輯都用最新內容當草稿
    setIsEditing(true);
  }

  function saveEdit() {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== item.content) {
      onEdit(item.id, trimmed); // 通知父層：這個 id 要改成新內容
    }
    setIsEditing(false);
  }

  function cancelEdit() {
    setDraft(item.content); // 還原草稿
    setIsEditing(false);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.isComposing) {
      e.preventDefault();
      saveEdit();
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  }

  const isDone = item.category === 'done';

  // === 編輯模式的畫面 ===
  if (isEditing) {
    return (
      <li className="flex items-center gap-2 p-3 bg-white border-2 border-moss rounded-lg">
        <input
          ref={inputRef}
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={saveEdit}
          className="flex-1 px-2 py-1 bg-transparent text-ink
                     focus:outline-none"
        />
        <button
          onClick={saveEdit}
          className="p-1.5 text-moss hover:bg-moss/10 rounded transition-colors"
          aria-label="儲存"
        >
          <Check size={16} />
        </button>
        <button
          onClick={cancelEdit}
          className="p-1.5 text-slate hover:bg-slate/10 rounded transition-colors"
          aria-label="取消"
        >
          <X size={16} />
        </button>
      </li>
    );
  }

  // === 一般顯示模式 ===
  return (
    <li className="bg-white border border-slate/15 rounded-lg hover:border-moss/40 hover:shadow-sm transition-all overflow-hidden">
      <div className="group flex items-start gap-3 p-3">
        {/* 完成勾選圈 */}
        <button
          onClick={() => onToggleDone(item.id)}
          className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center
                      flex-shrink-0 transition-colors
                      ${isDone
                        ? 'bg-moss border-moss text-paper'
                        : 'border-slate/40 hover:border-moss'}`}
          aria-label={isDone ? '取消完成' : '標記完成'}
        >
          {isDone && <Check size={12} strokeWidth={3} />}
        </button>

        {/* 內容（點兩下進入編輯） */}
        <div
          className="flex-1 min-w-0 cursor-text"
          onDoubleClick={startEdit}
          title="雙擊編輯"
        >
          <p className={`break-words ${isDone ? 'line-through text-slate' : 'text-ink'}`}>
            {item.content}
          </p>
          {item.contextTag && (
            <span className="inline-block mt-1 px-1.5 py-0.5 text-xs bg-mossLight/15 text-moss rounded">
              {item.contextTag}
            </span>
          )}
        </div>

        {/* 操作按鈕：平常隱藏，hover 才出現 */}
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          {showAiButton && (
            <button
              onClick={handleAiSuggest}
              className="p-1.5 text-slate hover:text-moss hover:bg-moss/10 rounded transition-colors"
              aria-label="AI 建議分類"
              title="AI 建議分類"
            >
              <Sparkles size={15} />
            </button>
          )}
          <button
            onClick={startEdit}
            className="p-1.5 text-slate hover:text-moss hover:bg-moss/10 rounded transition-colors"
            aria-label="編輯"
          >
            <Pencil size={15} />
          </button>
          {showMoveButton && (
            <button
              onClick={() => onMove(item.id)}
              className="p-1.5 text-slate hover:text-moss hover:bg-moss/10 rounded transition-colors"
              aria-label="移動分類"
            >
              <ArrowRightLeft size={15} />
            </button>
          )}
          <button
            onClick={() => onDelete(item.id)}
            className="p-1.5 text-slate hover:text-rust hover:bg-rust/10 rounded transition-colors"
            aria-label="刪除"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* AI 建議橫幅：按了 AI 按鈕才出現 */}
      {suggestion && (
        <div className="bg-mossLight/10 border-t border-moss/20 px-3 py-2.5 flex items-center gap-3">
          <Sparkles size={16} className="text-moss flex-shrink-0" />
          <div className="flex-1 min-w-0 text-sm">
            <span className="text-slate">建議分類：</span>
            <span className="font-medium text-moss">
              {CATEGORY_META[suggestion.category].label}
            </span>
            {suggestion.contextTag && (
              <span className="ml-1 text-xs text-mossLight">{suggestion.contextTag}</span>
            )}
            <span className="text-xs text-slate ml-2">（{suggestion.reason}）</span>
          </div>
          <button
            onClick={acceptSuggestion}
            className="px-2.5 py-1 bg-moss text-paper text-xs rounded hover:bg-mossLight transition-colors flex-shrink-0"
          >
            採用
          </button>
          <button
            onClick={() => setSuggestion(null)}
            className="p-1 text-slate hover:text-ink flex-shrink-0"
            aria-label="忽略"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </li>
  );
}
