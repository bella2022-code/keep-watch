# 07 · Author Page

## 7.1 Entry & Display

```
Tap sidebar bottom "ABOUT / 關於"
  ↓
Pushes up from screen bottom (500ms ease-out)
  ↓
80% screen-height reading window
Scene remains behind with backdrop #2A2128 @ 40%
  ↓
Top has pixel bookmark "pull tab" to dismiss
```

| Property | Spec |
|---|---|
| Push height | 80% of screen |
| Width | Web 480px centered / Mobile 95% |
| Border | 4px double pixel border, `#F4EFE6` |
| Background | `#F4EFE6` |
| Timer behavior | Pause |

## 7.2 Content Structure (8 sections)

1. **Opening** — pixel self-portrait + "KEEP WATCH / Made by [Name] / 2026"
2. **ABOUT ME** — self-intro
3. **WHY I MADE THIS** — design rationale
4. **INSPIRATION** — inspiration sources
5. **THANKS** — credits (including Claude)
6. **Pixel animal lineup** — 🐱 🐶 🦆 🦫 [?] [?]
7. **IG link**
8. **Closing easter egg** — "The end. See you next orbit." / 「收工。」

## 7.3 Scrolling Behavior

| Property | Spec |
|---|---|
| Default direction | Bottom-up (like credits roll) |
| Default speed | 12px/sec |
| User up-drag | Accelerate 3× |
| User down-drag | Reverse |
| Tap blank | Pause/resume |
| Reaching end | Loop back to start |

## 7.4 4-Character Cameos

| Character | Path | Frequency |
|---|---|---|
| 🐭 Mouse | Lower-left, horizontal pass-by | Every 20–30s |
| 🐠 Goldfish | Right side, vertical pass-by | Every 25–35s |
| 🚀 Astronaut | Top edge, slow drift in | Every 40–50s |
| 🪖 Officer | Bottom edge, horizontal walk | Every 30–40s |

**Iron rule**: always on text margins, never block content, never with dialog bubbles.

## 7.5 Pixel Animal Lineup (Section 6)

| Animal | Spec |
|---|---|
| Size | 24×24 px |
| Animation | Idle + tail wag (4-frame loop, 1.2s) |
| Tap interaction | Animal shows small bubble (meow / woof / quack / ...) |
| Layout | Web: horizontal row / Mobile: 2×2 |
| Grey placeholders | 2 reserved slots ? for future additions |

## 7.6 Content Templates

⚠️ Templates below are starting points — **final content rewritten by the maker**. Claude credits paragraph is by the maker's discretion.

### ABOUT ME (template)

> 我是 [你的名字]。
> 我喜歡安靜的事。
> 寫程式的時候我會在桌邊放一杯茶，看它慢慢涼掉。
> 這個 app 是我做給自己的，後來覺得也許別人也用得到。

Keep the keyword "安靜" — it resonates with the product philosophy.

### WHY I MADE THIS (template)

> 大部分的專注 app 都在催我。
> 紅色提示、連續天數、火焰圖示、「不要打破紀錄」。
> 我發現它們讓我更焦慮，不是更專注。
>
> 我想要的不是被催，是被陪。
>
> 所以 Keep Watch 沒有提醒、沒有打卡、沒有比較。
> 只有人安靜地看著你做事。
> 那個人是 Officer。她不嚴肅，她只是還沒下班。

This is the soul explanation. Preserve "被陪 vs 被催" contrast.

### INSPIRATION (template)

> Stardew Valley 教我，安靜也能是一種陪伴。
> A Short Hike 教我，小世界也能有完整感。
> [某本書 / 某段時光 / 某個人] 教我，自律不是逼自己，是回到自己。
>
> 還有那些我在咖啡廳偷瞄到的，獨自工作但安靜溫柔的人。
> Keep Watch 是寫給他們的。

### THANKS (template, including Claude paragraph)

> 謝謝 [試玩者]、[朋友 / 家人 / 影響你的人]。
>
> 謝謝 Claude。
> Keep Watch 整個設計規範是跟它逐字談出來的——168 行文案、4 種角色聲音、Officer 翻牌背面的粉色愛心，都是這場對話的產物。它不只執行，它會反問。這個產品有它的指紋。

Claude paragraph: keep, rewrite, or delete — your call.

### Closing easter egg

> The end.
> See you next orbit.
>
> — Astronaut

or

> 收工。
> — Officer

## 7.7 Personal Info Checklist

To be filled by maker (post-beta):

- [ ] Display name
- [ ] Production year (default 2026)
- [ ] Pixel self-portrait 32×40 + 4 facings
- [ ] IG handle
- [ ] Real ABOUT ME content
- [ ] Real WHY content
- [ ] Real INSPIRATION content
- [ ] Real THANKS list

**Status**: Author page content deferred until product beta testing.

---

→ Next: [`appendix.md`](appendix.md)
