// =============================================================================
// TwoMinuteTimer.jsx — 兩分鐘計時器（v1.0 新增）
// =============================================================================
// GTD 兩分鐘原則：能在兩分鐘內做完的事就立刻做。
// 當使用者在 Clarify 選「兩分鐘內可完成」，跳出這個計時器。
//
// 學習重點：useRef 存 interval id（不需要 re-render 的值）+ useEffect 的 cleanup
// =============================================================================

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw, Check, X } from 'lucide-react';

export default function TwoMinuteTimer({ itemContent, onComplete, onClose }) {
  const [seconds, setSeconds] = useState(120); // 兩分鐘 = 120 秒
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null); // 存計時器 id，改它不需要 re-render

  // 計時邏輯：isRunning 變化時啟動/停止
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSeconds(s => {
          if (s <= 1) {
            clearInterval(intervalRef.current);
            setIsRunning(false);
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    }
    // cleanup：停止或 unmount 時清掉計時器，避免記憶體洩漏
    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
  const secs = String(seconds % 60).padStart(2, '0');
  const progress = ((120 - seconds) / 120) * 100;
  const isDone = seconds === 0;

  return (
    <div className="fixed inset-0 bg-ink/60 flex items-center justify-center z-50 p-4">
      <div className="bg-paper rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center">
        <div className="flex justify-between items-start mb-2">
          <span className="text-xs font-medium text-mossLight uppercase tracking-wide">
            兩分鐘原則
          </span>
          <button onClick={onClose} className="text-slate hover:text-ink p-1" aria-label="關閉">
            <X size={18} />
          </button>
        </div>

        <p className="text-sm text-slate mb-4 break-words">{itemContent}</p>

        {/* 圓形進度 */}
        <div className="relative w-40 h-40 mx-auto mb-4">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="#e8ede9" strokeWidth="6" />
            <circle
              cx="50" cy="50" r="45" fill="none"
              stroke={isDone ? '#3d5a40' : '#5b7d5e'}
              strokeWidth="6"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl font-mono font-bold text-ink">
              {mins}:{secs}
            </span>
          </div>
        </div>

        {isDone ? (
          <p className="text-moss font-medium mb-4">時間到！做完了嗎？</p>
        ) : (
          <div className="flex justify-center gap-2 mb-4">
            <button
              onClick={() => setIsRunning(r => !r)}
              className="px-4 py-2 bg-moss text-paper rounded-lg hover:bg-mossLight flex items-center gap-1.5 transition-colors"
            >
              {isRunning ? <Pause size={16} /> : <Play size={16} />}
              {isRunning ? '暫停' : '開始'}
            </button>
            <button
              onClick={() => { setSeconds(120); setIsRunning(false); }}
              className="px-4 py-2 bg-slate/15 text-ink rounded-lg hover:bg-slate/25 flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw size={16} />
              重設
            </button>
          </div>
        )}

        <button
          onClick={onComplete}
          className="w-full py-2.5 bg-moss text-paper rounded-lg hover:bg-mossLight font-medium flex items-center justify-center gap-2 transition-colors"
        >
          <Check size={18} />
          完成這件事
        </button>
      </div>
    </div>
  );
}
