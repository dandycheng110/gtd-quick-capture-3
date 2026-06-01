// =============================================================================
// smartClassify.js — 智能分類建議（規則式）
// =============================================================================
// 根據項目內容的關鍵字，建議分類與情境標籤。
//
// 設計說明：
//   目前用「關鍵字規則」實作。架構上刻意把分類邏輯獨立成一個純函式，
//   未來只要把這個函式內部換成「呼叫 LLM API」，其餘程式碼完全不用動。
//   這就是「介面與實作分離」—— 對外行為不變，內部實作可替換。
//
// 報告時的誠實講法：
//   「目前用規則式分類，已預留接 LLM API 的位置，函式介面不變即可升級。」
// =============================================================================

import { CATEGORIES } from '../context/reducer.js';

// 關鍵字 → 分類 的對應規則（順序有意義，前面的優先）
const RULES = [
  {
    category: CATEGORIES.WAITING,
    contextTag: null,
    keywords: ['等', '回覆', '回信', '等待', '催', '追蹤', '對方', '他們', '客戶回', '審核', '核准'],
    reason: '看起來在等別人回應',
  },
  {
    category: CATEGORIES.SOMEDAY,
    contextTag: null,
    keywords: ['也許', '可能', '考慮', '未來', '有空', '哪天', '想學', '想試', '研究看看', '夢想'],
    reason: '像是未來再考慮的點子',
  },
  {
    category: CATEGORIES.REFERENCE,
    contextTag: null,
    keywords: ['記錄', '筆記', '資料', '參考', '連結', '網址', '文件', '帳號', '密碼', '備查'],
    reason: '像是參考資料',
  },
  {
    category: CATEGORIES.NEXT,
    contextTag: '@電腦',
    keywords: ['寫', '程式', '報告', '信', 'email', '回信', '文件', '簡報', 'code', '上傳', '下載'],
    reason: '需要用電腦完成的下一步',
  },
  {
    category: CATEGORIES.NEXT,
    contextTag: '@外出',
    keywords: ['買', '採購', '領', '寄', '拿', '去', '前往', '銀行', '郵局', '超市'],
    reason: '需要出門辦的事',
  },
  {
    category: CATEGORIES.NEXT,
    contextTag: '@電話',
    keywords: ['打電話', '聯絡', '致電', '撥', '預約', '訂位'],
    reason: '打通電話就能處理',
  },
];

// 主函式：輸入內容字串，回傳建議
// 回傳：{ category, contextTag, reason, confidence }
export function smartClassify(content) {
  const text = content.toLowerCase();

  for (const rule of RULES) {
    const hit = rule.keywords.find(kw => text.includes(kw.toLowerCase()));
    if (hit) {
      return {
        category: rule.category,
        contextTag: rule.contextTag,
        reason: rule.reason,
        matched: hit,
      };
    }
  }

  // 沒匹配到任何規則 → 預設建議 Next Actions
  return {
    category: CATEGORIES.NEXT,
    contextTag: null,
    reason: '看起來是個可以執行的行動',
    matched: null,
  };
}
