# 05 · Onboarding

## 5.1 First-time Boot (6 seconds)

```
[0.0–1.0s]  Logo fade in (warm white bg, pixel font "KEEP WATCH")
[1.0–2.0s]  Logo holds
[2.0–3.0s]  Logo fade out + camera approach
[3.0–4.0s]  Scene fade in (Mouse Cage, time-of-day tint applied)
[4.0–5.5s]  Mouse walks in from random left/right (4-frame walk)
[5.5–6.0s]  Mouse idle breathing + halo + card pops up showing 25:00
[6.0–8.0s]  Hold 2 seconds
[8.0s+]     "Tap me ☝" bubble appears above Mouse → waits for user
```

## 5.2 Subsequent Boot (1.5 seconds)

```
[0.0–0.5s]  Logo brief fade in
[0.5–1.0s]  Logo fade out
[1.0–1.5s]  Scene direct display, Mouse already centered idle
            (no teaching bubble, halo breathing retained)
```

## 5.3 Tap Me Bubble Spec

| Property | Spec |
|---|---|
| First appears | 2 seconds after scene load |
| Disappears | Instantly on first tap of Mouse |
| If no interaction | Fade out after 10s, reappear 10s later (loop) |
| Permanently disabled | After first Start completion |
| Character halo | Permanently retained |
| Position | 8px above character head |
| Style | Warm-white pixel speech bubble, 12px pixel font |
| Text | 點我 / Tap me |

## 5.4 First Timer Completion = Goldfish Unlock (30s cinematic)

```
[0–3s]    Mouse completion event (hold sign, wave, exit)
[3–5s]    Scene slowly fades to black (800ms fade)
[5–7s]    Fish Tank silhouette gradually appears
[7–10s]   Goldfish swims in from silhouette edge,
          stops center, turns to break 4th wall
[10–12s]  Goldfish holds card: 「咕嚕 / *blub*」
[12–15s]  Scene fills color (radial expansion from center)
[15–18s]  Camera subtle zoom 10%
[18–20s]  Cut back to Mouse Cage (Plan B) + ☰ flashes 3 times
[20–24h]  Sidebar 🐠 slot glows for 24 hours
```

## 5.5 First Pomodoro Completion = Astronaut Unlock

Same architecture as 5.4, differences:
- New scene silhouette: Astronaut Space (porthole as marker)
- Entry: slow zero-G drift in
- Debut signature: "呼叫地面 / Ground, this is Astro."
- Coloring: starfield first, Earth curve last

## 5.6 Officer Unlock (Cumulative 14 Days)

```
[0–3s]    Current scene's main character completion event
[3–5s]    After exit, hold 1.5s "empty stage"
[5–7s]    Scene fades to black
[7–10s]   Officer Room silhouette + olive outline
[10–13s]  Officer walks in languidly from random side
          (weight-shift step pattern)
[13–15s]  Stops center, turns to break 4th wall
[15–17s]  Card front: "報到 / Reporting in."
[17–20s]  FIRST CARD FLIP DEMO (4-frame flip)
          Back: "我看著你呢 / I've been watching." + pink heart
[20–23s]  Collects card, salutes, walks out
[23–25s]  Scene colors in
[25s+]    Return to original scene, ☰ flash, Officer slot glows 24h
```

## 5.7 Per-Character Completion Event

| Scene | Completion character | Card flip? | Closing action |
|---|---|---|---|
| Mouse Cage | Mouse | ✗ (single-sided sign) | Stand on hind legs, wave |
| Fish Tank | Goldfish | ✗ (sign floats up from water) | Jumps out of water |
| Astronaut Space | Astronaut | ✗ (sign drifts in) | Gives OK 👌 |
| Officer Room | Officer | **✓ Card flip exclusive ritual** | Salutes |

All characters enter from random left/right.

## 5.8 Start → Focus Flow

```
[1] Tap character
[2] Card locks 0.5s (locks the time value)
[3] Character takes card, waves 0.5s
[4] Character walks out random left/right (1s)
[5] Mini clock + progress bar fade in lower-left (300ms)
[6] Focus Mode begins
```

## 5.9 Completion → Restart Flow

```
[1] Time up, mini clock flashes once then disappears
[2] Scene character walks in from random side
[3] Stops center
[4] Pulls out card (per-scene ritual differs)
[5] Wood clack + bell tail sound
[6] Encouragement copy displays 2 seconds
[7] Character-exclusive closing action
[8] Walks out from other side
[9] Scene empty 0.5s
[10] Returns to opening flow, card shows last set time (Plan A — preserved)
```

## 5.10 Edge Cases

| Situation | Handling |
|---|---|
| App closed mid-focus | Save state, next open prompts "Continue last session?" modal |
| Backgrounded | Timer continues (uses system clock) |
| Lock screen | Timer continues, no extra notification |
| Cross-device sync | Not supported in v1 |
| Manual cancel (long press) | "Confirm cancel?" modal |
| Notification permission | Triggers on first background completion, no proactive popup |
| Push notification text | Main: 時間到 / Time's up. Sub: 點開看看你的牌子 / Tap to see your card |

---

→ Next: [`06-data-stats.md`](06-data-stats.md)
