# 06 · Data & Stats

## 6.1 Stats Architecture

Entry: sidebar bottom "📊 STATS" (appears only after first daily completion) → expands inside sidebar (does not leave scene).

### 6.1.1 First Layer (always displayed)

| Item | Display |
|---|---|
| Today's focus | `Xh Xm`, no progress bar (no daily comparison) |
| Total days (cumulative) | `📅 N` |
| Total time | `Xh / Yh` + progress bar to next milestone |
| Unlocked characters | 🐭 🐠 🚀 🪖 ? |

### 6.1.2 Second Layer (Show more)

| Item | Display |
|---|---|
| Completion count | Timer N / Pomodoro N |
| Longest single | `Xh Xm` |
| Unlock dates | Per character unlock date |
| First use | Date |

**Not included**: This week, this month, average, heatmap, streak counter, fire emoji.

## 6.2 Design Philosophy

> All numbers represent "cumulative" and "owned". Never "lost" or "broken".
> Breaks don't reset. No streaks. No daily check-in pressure.
> "Use it when you need to, not because you have to."

## 6.3 Officer Unlock Threshold

**Cumulative 14 days** (non-consecutive).

## 6.4 Storage & Privacy

| Property | Spec |
|---|---|
| Storage location | Local only (iOS UserDefaults / Web LocalStorage) |
| Cross-device sync | Not supported in v1 |
| Export | Sidebar bottom "Export" → download JSON |
| Reset | Sidebar bottom "Reset all" → 3 confirmation modals |
| Privacy copy | "你的數據只在你的裝置裡 / Your data lives on your device." |

## 6.5 Reset Flow (3-step confirmation)

```
[1] Tap "Reset all" → Modal 1: "Are you sure? This clears all time and unlocks."
[2] Tap confirm → Modal 2: "Really really? All characters will lock again."
[3] Tap confirm → Modal 3: "Last time. Type 'RESET' to confirm."
[4] Type RESET → executes
```

---

→ Next: [`07-author-page.md`](07-author-page.md)
