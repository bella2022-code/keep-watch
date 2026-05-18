# 03 · UI & Layout

## 3.1 Main Screen Layout

### 3.1.1 Web version (1920×1080, native canvas 480×270, integer scaling)

```
╔═══════════════════════════════════════════════╗
║ ☰                                              ║
║                                                ║
║              [Scene — 16:9 wide composition]    ║
║                  ┌──────────┐                  ║
║                  │  25:00   │ ← Card (scroll wheel to adjust) ║
║                  └──────────┘                  ║
║                      🐭        ← Character (tap = Start) ║
║                                                ║
╚═══════════════════════════════════════════════╝
```

### 3.1.2 Mobile version (1170×2532, native canvas 195×422)

```
╔══════════════╗
║ ☰              ║
║                ║
║   [Scene        ║
║    9:19 vert]   ║
║                ║
║   ┌──────┐     ║
║   │25:00 │     ║ ← Card (swipe up/down)
║   └──────┘     ║
║      🐭        ║
╚══════════════╝
```

### 3.1.3 Layout spec

| Element | Position | Size |
|---|---|---|
| ☰ menu | Top-left, 24×24, 24px margin | — |
| Character | Horizontally centered, vertically at 35% from bottom | 32×40 |
| Card | 16px above character | 96×56 (3× pixel scale) |
| Scene background | Fills entire canvas | 16:9 or 9:19 |

---

## 3.2 Sidebar Layout (slides in from left)

```
╔════════════════════╗
║  KEEP WATCH         ║ ← LOGO
║  ────────────────   ║
║  🐭 ANGLE           ║ ← Characters (locked = hidden, slot 5 placeholder)
║  ────────────────   ║
║  🖼  BACKGROUND     ║ ← Auto + 5 time-of-day options
║  ────────────────   ║
║  🎨 THEME           ║ ← Warm Wood / Cool Mist / Sepia
║  ────────────────   ║
║  🌐 LANGUAGE        ║ ← 中 / EN
║  ────────────────   ║
║  🔊 VOLUME          ║ ← Slider 0–100% + Mute
║  ────────────────   ║
║  📊 STATS *         ║ (* appears after first completion)
║  ────────────────   ║
║  ✍ ABOUT            ║
╚════════════════════╝
```

### 3.2.1 Sidebar spec

| Property | Web | Mobile |
|---|---|---|
| Width | 320px | 80% of screen |
| Open direction | Slide in from left | Same |
| Animation | 200ms ease-out | Same |
| Backdrop | `#2A2128 @ 50%` | Same |
| **Timer behavior** | **Pause** | **Pause** |
| Close | Tap backdrop / Esc / tap ☰ | Tap backdrop / swipe right / tap ☰ |

---

## 3.3 Interaction Spec

### 3.3.1 Main screen gestures

| Action | Web | Mobile |
|---|---|---|
| Adjust time | Scroll wheel on card | Swipe up/down |
| Switch Timer/Pomodoro | Tap card lower-right corner = flip | Same |
| Start | Tap character | Tap character |
| Open sidebar | Tap ☰ / press `\` | Tap ☰ / swipe right from left edge |
| Pause (during focus) | Tap empty area / spacebar | Tap empty area |
| Cancel (during focus) | Long-press center position | Same |

### 3.3.2 Visual feedback

| Element | Default | Hover | Pressed |
|---|---|---|---|
| Character (idle) | Idle anim + halo breathing | Halo brightens | Shrinks 1px |
| Card number | Static | Numbers subtly glow | — |
| ☰ menu | Static | 10% brighter | Shrinks 1px |
| Sidebar option | `#F4EFE6` @ 80% | 100% + 2px line on left | Shrinks |

---

## 3.4 Time / Mode Settings

| Property | Spec |
|---|---|
| Timer min | 5 minutes |
| Timer max | 180 minutes |
| Timer step | 5 minutes |
| Pomodoro work segment | Default 25, adjustable 15/25/30/45/50 |
| Pomodoro rest segment | Default 5, adjustable 5/10/15 |

### 3.4.1 Card two-sided content

- **Front (Timer Mode)**: `25:00`
- **Back (Pomodoro Mode)**: `🍅 × 4` + small text `25min work` / `5min rest`

---

## 3.5 Focus Mode Display

When entering focus mode:

- Scene retained
- Character exits screen
- Companions pass per spec
- Bottom-left: mini clock + progress bar (top-bottom separation, "Plan A")

Progress bar spec:
- Bar width 60px (web) / 40px (mobile), bar height 2px
- Font 12px pixel
- Opacity 50%
- Color gradient `#F4EFE6 → #7A7480`
- 16px margin from bottom-left

---

→ Next: [`04-content-voice.md`](04-content-voice.md)
