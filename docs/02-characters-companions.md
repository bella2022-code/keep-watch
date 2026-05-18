# 02 · Characters & Companions

## 2.1 Officer Behavior System

Officer is the most behaviorally complex character. Her relaxed body language is the soul of the product's "contrast" pillar.

### 2.1.1 Idle Pose Pool (random rotation, ~10s switches)

| # | Pose |
|---|---|
| 1 | Hand on hip, head tilted |
| 2 | Hands behind back, gentle sway |
| 3 | Leaning against wall, single leg crossed |
| 4 | Hands in pockets, light swaying |
| 5 | Weight shifting left/right (cute step pattern) |

Transitions use 2-frame interpolation, never hard cuts.

### 2.1.2 Random Behavior Pool (<2% per minute)

| # | Behavior | Duration |
|---|---|---|
| 1 | Crouching to look at the ant | 4s |
| 2 | Suddenly turning to face camera (= 4th wall break C) | 1.5s |
| 3 | Taking off cap, scratching head | 2s |
| 4 | Yawning | 2s |
| 5 | Checking watch | 1.5s |

**Iron rule**: No sound, no vibration, no alert. Pure visual background performance. Player has to look up to notice.

---

## 2.2 Companion System

### 2.2.1 Per-Scene Companions

| Scene | Companion | Variants | Frequency | Interaction |
|---|---|---|---|---|
| Mouse Cage | Different-colored mice | Grey / Brown / Light pink / Black | Every 5–8 min, 1 at a time | None |
| Fish Tank | Different-colored fish | Black / White / Yellow / Calico | Every 5–8 min | None |
| Astronaut Space | Tardigrade ("water bear") | Translucent grey-white + green dot | Every 8–10 min | None |
| Officer Room | Ant (1×1 px) | `#2A2128` | Possibly every 5 min | **Officer crouches to look at it** (only interactive companion) |

### 2.2.2 Companion Behavior Rules

- Max 1 companion on screen at any time
- Entry direction: **random left or right**
- Behavior: enter → occasional pause / sniff / hide in plant → exit
- No interaction with the main character (except Officer↔ant)
- Time-of-day variation: use global tint, never separate sprites

### 2.2.3 Companion Dialog Bubbles (30% chance on pass-by)

| Companion | Bubble text pool |
|---|---|
| Mouse companion | *squeak* / *nibble* / *eek~* |
| Goldfish companion | *blub* / *blub blub* |
| Tardigrade | None |
| Ant | None |

Spec: 20×12px pixel bubble, 1s stay then fade, no sound effect.

---

## 2.3 Cross-Scene Easter Eggs (<0.5% trigger)

The four worlds secretly leak into each other.

| Scene | Hidden clue | Hints at |
|---|---|---|
| Mouse Cage | Paper plane shadow passes outside cage | Astronaut |
| Fish Tank | Mouse silhouette reflects on glass | Mouse |
| Astronaut Space | Olive-green note drifts past porthole | Officer |
| Officer Room | Goldfish-shaped cloud drifts past window | Goldfish |

Each lasts 2 seconds, no explanation, no guidance. The player must discover them.

---

## 2.4 Fourth Wall Breaks

Three trigger types:

| Type | Trigger | Reaction |
|---|---|---|
| A · Opening | Before Start | Character briefly faces camera ("Ready?") |
| B · Completion | Timer ends | Character turns, salutes / waves / catches card |
| C · Random | During focus, <1% | "Notices you watching", 1.5s pause then continues |

### 2.4.1 Per-character C reactions

| Character | Reaction | Duration |
|---|---|---|
| Mouse | Whiskers twitch, freezes instantly | 1s |
| Goldfish | Stops, slowly turns, mouth opens/closes | 1.5s |
| Astronaut | Waves + slowly floats away | 2s |
| Officer | Languid head turn, unfazed, continues moments later | 1.5s |

---

## 2.5 Sound System

### 2.5.1 Volume Control

| Property | Spec |
|---|---|
| Control | Single master volume slider (0–100%) |
| Default | **60%** |
| One-tap mute | Press = 0%, press again = restore |

### 2.5.2 Per-sound relative volume (at 100% master)

| Sound | Relative volume | Trigger |
|---|---|---|
| Mouse claw | 20% | On movement |
| Goldfish bubbles | 15% | Ambient loop |
| Astronaut space hum | 10% | Ambient loop |
| Officer wood floor steps | 25% | On movement |
| Card flip clack | 30% | On flip |
| **Timer completion** | **40%** | See 2.5.3 |
| Ant / tiny creatures | 0% | Pure visual |

### 2.5.3 Timer Completion Audio

- Composition: **wood clack (0.2s) + warm bell tail (1s fade out) = 1.2s total**
- Timing: synced with Officer card flip "flip motion"
- Timer Mode: full audio; Pomodoro segment-end: clack only; Pomodoro round-end: full audio

---

→ Next: [`03-ui-layout.md`](03-ui-layout.md)
