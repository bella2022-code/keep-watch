# 01 · Visual System

## 1.1 Color System

### 1.1.1 Global Anchor Colors (shared across all 4 scenes)

| Use | HEX | Notes |
|---|---|---|
| Line / outline | `#2A2128` | Warm black — replaces pure black |
| Highlight / warm white | `#F4EFE6` | Cream base |
| Neutral grey | `#7A7480` | Transition mid-tone |
| Plant green | `#7B9268` | The "breathing color" — used in every scene |
| Theme pink | `#E89BAA` | Officer accent + Mouse ear/nose |

### 1.1.2 Theme Packs (user-switchable)

| Theme | Wood / Water / Space / Room | Best for |
|---|---|---|
| **Warm Wood** (default) | `#8B5E3C` / `#5B8FA6` / `#1B2233` / `#A89478` | General use |
| Cool Mist | `#6B6B7A` / `#7A9BA8` / `#1A2028` / `#9B9DA5` | Evening / rainy |
| Sepia Quiet | `#7A6447` / `#8A7560` / `#2A2520` / `#A89478` | Deep focus |

Themes change *scene colors only*. Character colors never change — ensures recognition.

### 1.1.3 Color Rules

- Max 12 colors per scene (8 structure + 4 accent)
- **Pure black `#000000` and pure white `#FFFFFF` forbidden** — except in pixel text
- Anti-aliasing forbidden — use dithering for gradients

---

## 1.2 Character Sprite Spec

| Property | Spec |
|---|---|
| Canvas | **32×40** |
| Head-body ratio | **2.5** |
| Outline | 1px `#2A2128` |
| Grid | Strict 1px, no 0.5px |
| Silhouette test | Pure black silhouette must be recognizable |

### Per-character

| Character | Head/Body (px) | Main color | Accents | Identifier |
|---|---|---|---|---|
| Mouse | 12 / 18 | `#F4EFE6` | `#E89BAA` ear/nose/tail | Round ears + thin tail + pink hands |
| Goldfish | n/a | `#E89060` | `#C44536` fins / `#F4EFE6` belly | Flowing tail fin |
| Astronaut | 14 / 22 | `#ECEEF2` | `#7A8290` reflection / `#15161E` visor | Oversized helmet (cute) |
| Officer | 14 / 26 | `#5C6B4F` (olive) | `#D4A574` badge / `#F4EFE6` face / `#2A2128` cap/boots | Cap + languid pose |

---

## 1.3 Animation Frame Spec

| Action | Frames | Duration | Use |
|---|---|---|---|
| Idle | 2 | 800ms loop (all characters synced "breathing") | Standby |
| Walk | 4 | 400ms loop | Enter/exit |
| Hold sign | 3 | One-time | Opening / closing |
| Salute | 2 | One-time | Officer / Astronaut completion |
| **Card flip** | 4 | One-time | **Officer exclusive ritual** |
| Break 4th wall | 2 | One-time | Turn to face camera |

---

## 1.4 Scene Element Spec

| Scene | Native canvas | Elements | Ambient motion |
|---|---|---|---|
| Mouse Cage | 480×270 (web) / 195×422 (mobile) | Wooden bars / sawdust / water bottle / food bowl / cardboard hideout | Occasional flakes drifting |
| Fish Tank | same | Glass border / 2–3 plants / pebbles / shipwreck / 2px top ripple | Plants sway + slow bubbles |
| Astronaut Space | same | Cabin / porthole (stars + Earth curve) / floating tools / mug | Micro-gravity particles |
| Officer Room | same | White walls / wood plank floor (32×8) / white door / corner potted plant / desk lamp | Lamp 30s "breathing" |

---

## 1.5 Shared Visual Grammar

| Property | Rule |
|---|---|
| Light source | Top-left, 45° angle |
| Highlight | 1–2px |
| Shadow | 1–2px in deep color |
| Character outline | 1px `#2A2128` (not pure black) |
| Background outline | Often omitted (let characters pop) |
| Idle breathing | 800ms synced across all characters |
| Ambient particles | Max 5 simultaneously on screen |

---

## 1.6 Time-of-Day Tint System

Runtime palette tint, applied globally to all on-screen elements:

| Period | Time | Tint shift |
|---|---|---|
| 🌅 Morning | 06:00–10:00 | +5% warm yellow |
| ☀️ Day | 10:00–17:00 | Neutral baseline |
| 🌇 Dusk | 17:00–19:00 | +10% orange |
| 🌙 Night | 19:00–22:00 | -15% brightness + 5% cool blue |
| 🌌 Deep Night | 22:00–06:00 | -30% brightness + 10% cool blue |

Transitions use 5-minute gradients — never hard cuts.

User can manually override; sidebar shows "⟲ Auto" button.

**Implementation note**: Use a single sprite set per character/scene. Tint is a runtime shader/palette swap — never bake separate variants.

---

→ Next: [`02-characters-companions.md`](02-characters-companions.md)
