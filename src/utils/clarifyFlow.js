// =============================================================================
// clarifyFlow.js — Clarify 決策流程定義
// =============================================================================
// GTD 的「釐清」階段：對每個 inbox 項目問一連串問題，決定它該去哪個分類。
// 把決策樹抽成資料，元件只負責「照著問、照著導」，邏輯清楚好維護。
//
// 決策邏輯（GTD 經典流程）：
//   1. 這需要採取行動嗎？
//      否 → 是參考資料嗎？ 是→Reference / 否→Someday（以後也許）
//      是 → 往下問
//   2. 兩分鐘內能完成嗎？
//      是 → 標記「立即做」（建議 Next + 跳計時器）
//      否 → 往下問
//   3. 該由你親自做嗎？
//      否 → Waiting（等別人）
//      是 → Next Actions（你的下一步）
// =============================================================================

import { CATEGORIES } from '../context/reducer.js';

// 每個節點：問題文字 + 兩個選項，選項可能「導向結果」或「導向下一題」
export const CLARIFY_TREE = {
  start: 'needAction',

  needAction: {
    question: '這件事需要採取「行動」嗎？',
    hint: '有些東西只是資訊，不需要你做任何事',
    yes: { next: 'twoMinute' },
    no: { next: 'isReference' },
  },

  isReference: {
    question: '那它是「參考資料」嗎？',
    hint: '之後可能用得到，存著就好',
    yes: { result: CATEGORIES.REFERENCE },
    no: { result: CATEGORIES.SOMEDAY },
  },

  twoMinute: {
    question: '兩分鐘內可以完成嗎？',
    hint: 'GTD 原則：能馬上做完的就立刻做',
    yes: { result: CATEGORIES.NEXT, startTimer: true },
    no: { next: 'delegate' },
  },

  delegate: {
    question: '該由你「親自」做嗎？',
    hint: '如果該交給別人，就歸到等待中',
    yes: { result: CATEGORIES.NEXT },
    no: { result: CATEGORIES.WAITING },
  },
};
