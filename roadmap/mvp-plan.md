# MVP Development Roadmap

## Philosophy

**MVP = Minimum Viable Product**: the smallest version that **delivers the Core Feeling completely**, not a "stripped-down" version.

For Keep Watch, MVP must include:
- At least 1 scene + 1 main character + full completion event
- Complete Onboarding (cannot be cut)
- Card UI interaction
- Local data storage

---

## Phase 1 · Core Loop (4–6 weeks)

**Goal**: User can run Start → Focus → Complete loop end-to-end.

| Week | Tasks |
|---|---|
| 1 | Project init, pixel canvas render framework, integer scaling system |
| 2 | Mouse Cage scene + Mouse sprite (idle/walk/sign) + time-of-day tint |
| 3 | Card UI interaction (scroll/swipe to adjust) + flip animation + Start/Pause/Cancel |
| 4 | Timer Mode + completion event (simplified, just Mouse wave) + completion audio |
| 5 | Onboarding (Tap me bubble + halo breathing) + first main screen layout |
| 6 | Local data storage (today / total time / total days) + MVP internal testing |

**Deliverable**: Can complete one Timer round in Mouse Cage, all data correctly stored.

---

## Phase 2 · World Expansion (3–4 weeks)

**Goal**: Unlock system works, world expands from 1 to 3 scenes.

| Week | Tasks |
|---|---|
| 7 | Fish Tank scene + Goldfish sprite + completion variant |
| 8 | First Timer completion = Goldfish unlock 30s cinematic |
| 9 | Pomodoro Mode (card flip switching) + segment vs full-round audio differentiation |
| 10 | Astronaut Space + Astronaut + first Pomodoro reveal animation |

**Deliverable**: 3 scenes switchable, 2 unlock paths fully working.

---

## Phase 3 · Polish (3–4 weeks)

**Goal**: Transition from "playable" to "want to stay".

| Week | Tasks |
|---|---|
| 11 | Officer Room + Officer + cumulative 14 days unlock + card flip exclusive ritual |
| 12 | Companion system (per-scene random pass-by + dialog bubbles) |
| 13 | Cross-scene easter eggs (<0.5% trigger) + 4th wall break C trigger |
| 14 | Stats page + full copy pool integration + conditional trigger algorithm |

**Deliverable**: All 4 characters unlocked, world complete, copy system operational.

---

## Phase 4 · Final (2–3 weeks)

**Goal**: Last mile before release.

| Week | Tasks |
|---|---|
| 15 | Full sidebar functionality (theme switching, language, volume, Stats, export/reset) |
| 16 | Notification system (background completion push) + edge case handling |
| 17 | Author page framework (content deferred) + pixel animals + slot 5 ? |

**Deliverable**: Product v1.0 complete, releasable.

---

## Timeline Estimates

| Phase | Duration | Cumulative |
|---|---|---|
| Phase 1 | 4–6 weeks | 1.5 months |
| Phase 2 | 3–4 weeks | 2.5 months |
| Phase 3 | 3–4 weeks | 3.5 months |
| Phase 4 | 2–3 weeks | **4 months** |

### Solo full-time estimate

| Team composition | v1.0 estimated time |
|---|---|
| **Solo full-time** (design + eng + art self-contained) | 4 months |
| **Duo** (1 design+eng, 1 art) | 2.5 months |
| **Small team** (3–4 people) | 6 weeks |
| **Eng only, AI-generated art with manual refinement** | 2.5–3 months |

---

## Risk Points & Mitigations

| Risk | Mitigation |
|---|---|
| Hard to maintain pixel art consistency | All sprites use same AI prompt template + same palette + manual touch-up |
| Cross-platform pixel scaling bugs | Decide integer scale only early, avoid sub-pixel |
| Copy pool growing unmanageable | Structure as JSON, use i18n standards |
| Pomodoro segment timing complexity | Defer to Phase 2, Phase 1 only Timer Mode |
| iOS background timer review risk | Use system BackgroundTasks API, no persistent process |

---

## Phased Release Strategy

| Release | Contents | Audience |
|---|---|---|
| **v0.1 Alpha** | Phase 1 complete, self only | maker only |
| **v0.5 Beta** | Phase 2 complete, invite 5–10 testers | closed beta |
| **v0.9 RC** | Phase 3 complete, public test | open beta |
| **v1.0 GA** | Phase 4 complete, official release | public |

---

## Definition of Done (per phase)

A phase is "done" when:

1. All listed tasks pass functional review
2. No critical bugs in core loop
3. Performance: 60fps on web, 60fps on iOS
4. Build deployable (web bundle / iOS testflight)
5. Internal play-test session has positive Core Feeling resonance
