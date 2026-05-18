# Appendix

## A. Consolidated Asset Checklist

### A.1 Scenes (8 base images)

| Scene | Web px | Mobile px |
|---|---|---|
| Mouse Cage | 480×270 | 195×422 |
| Fish Tank | 480×270 | 195×422 |
| Astronaut Space | 480×270 | 195×422 |
| Officer Room | 480×270 | 195×422 |

### A.2 Character sprite sheets (4 sets × multiple sheets)

Per character:
- Idle (2 frames)
- Walk L→R / R→L (4 frames each)
- Hold sign (3 frames)
- Random behaviors (3–5 variations)
- Completion action (wave / jump / OK / salute)
- Break 4th wall (2 frames)

Officer additional: 5 idle poses + 5 random behaviors + **card flip 4 frames**

### A.3 Companion sprites

| Companion | Content |
|---|---|
| Mouse companions | 4 colors (grey/brown/pink/black) × walk × 2 directions |
| Fish companions | 4 colors (black/white/yellow/calico) × swim × 2 directions |
| Tardigrade | 1 × float animation |
| Ant | 1 × walk |

### A.4 UI assets

| Element | Spec |
|---|---|
| Card (blank) | 96×56 wood texture |
| Card (pink heart back) | Same + 4×4 heart |
| ☰ menu | 24×24 |
| Card fold corner icon | 8×8 |
| Progress bar background | 60×2 |
| Pixel font | 0–9, A–Z, a–z, top 200 Chinese chars |
| Speech bubble | 20×12 |

### A.5 Author page extra assets

| Element | Spec |
|---|---|
| Pixel self-portrait | 32×40 + 4 facings |
| Pixel cat / dog / duck / platypus | 24×24, 4-frame idle with tail wag |
| IG pixel icon | 16×16 |
| Bookmark pull tab | 32×8 |

### A.6 Audio

| Sound | Duration |
|---|---|
| Wood clack | 0.2s |
| Bell tail | 1s |
| Mouse claw | 0.3s loop |
| Goldfish bubbles | Ambient loop |
| Astronaut hum | Ambient loop |
| Officer wood floor steps | 0.4s loop |

---

## B. Consolidated Hex Color Reference

### B.1 Global anchors

```
#2A2128   Warm black / outline
#F4EFE6   Warm white / highlight
#7A7480   Neutral grey
#7B9268   Plant green / breathing color
#E89BAA   Theme pink / Officer + Mouse accent
```

### B.2 Character colors

```
Mouse body:        #F4EFE6
Mouse companions:  #9B9590 #8B6F4E #E8C5BC #3A3438

Goldfish body:     #E89060
Goldfish fins:     #C44536
Goldfish belly:    #F4EFE6
Goldfish vars:     #3A3438 #F4EFE6 #D4A574 (orange+white calico)

Astronaut suit:    #ECEEF2
Astronaut metal:   #7A8290
Astronaut visor:   #15161E

Officer olive:     #5C6B4F
Officer badge:     #D4A574
Officer cap/boots: #2A2128
```

### B.3 Theme backgrounds

```
Warm Wood (default)
  Wood: #8B5E3C  Water: #5B8FA6  Space: #1B2233  Room: #A89478

Cool Mist
  Wood: #6B6B7A  Water: #7A9BA8  Space: #1A2028  Room: #9B9DA5

Sepia Quiet
  Wood: #7A6447  Water: #8A7560  Space: #2A2520  Room: #A89478
```

---

## C. Naming Conventions

```
Scenes:     scene_[name]_[platform].png
            e.g. scene_mouse_cage_web.png

Characters: char_[name]_[action]_[frame].png
            e.g. char_officer_walk_03.png

UI:         ui_[element]_[state].png
            e.g. ui_card_blank_front.png

Audio:      sfx_[name].wav
            e.g. sfx_card_flip.wav
```

---

## D. Future Expansion Notes

1. **Slot 5 character**: Reserve `?` until product matures. Suggested fill: "maker's room" / author page extension.
2. **Cross-device sync**: Consider iCloud / Firebase in v2.
3. **More pixel animals**: 2 reserved slots in author page for future additions.
4. **New background variants**: Time-of-day already implemented. Future: weather dimension (rain / snow).
5. **Milestone expansion**: 1000hr / cumulative 100 days / cumulative 365 days as future additions.
6. **Author page content**: Filled after beta testing.

---

## E. Glossary

| Term | Meaning |
|---|---|
| Companion | Non-protagonist character that passes through a scene |
| Pass-by | Companion's quiet appearance, not protagonist interaction |
| 4th wall break | Character turns to face the player directly |
| Cumulative days | Total *distinct* dates focus was logged, never resets |
| Tint shift | Runtime palette/shader adjustment for time-of-day |
| Slot 5 | The 5th locked character placeholder, reserved as mystery |
