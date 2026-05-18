# Character Prompts

4 main characters, each as full sprite sheets.

---

## Mouse

```
A small white pixel mouse character, side view profile,
canvas 32x40, 2.5 head-body ratio,
head 12px round, body 18px,
pure white body #F4EFE6, soft pink ears/nose/tail #E89BAA,
single black 1x1 pixel eyes #2A2128,
thin pink hands, thin curly tail,
charming and timid expression, slightly hunched posture,
needs frames: idle (2), walk-left (4), walk-right (4),
holding sign (3), waving (2), break-fourth-wall (2),
clean pixel-perfect outline 1px #2A2128 (warm black not pure),
restricted 6-color palette, indie game sprite sheet style
```

---

## Goldfish

```
A small orange-red goldfish character, side view,
canvas 32x40 (with extra space around small body),
body roughly 16x10 px,
warm orange body #E89060, red fins #C44536, white belly #F4EFE6,
1x1 pixel eye #2A2128,
elegant flowing tail fin with 3-frame animation,
calm aloof expression, slightly lidded eye,
needs frames: idle swim (2), swim-left (4), swim-right (4),
floating sign on water (3), jumping out (2), break-fourth-wall (2),
no outline on body (let color define shape), 
restricted 5-color palette
```

---

## Astronaut

```
A small astronaut character, side view, pixel art,
canvas 32x40, 2.5 head-body ratio,
head 14px (oversized helmet for cute factor),
body 22px in white space suit #ECEEF2,
silver metallic accents #7A8290, dark visor #15161E,
1x2 pixel highlight on visor (showing reflection),
gentle floating pose, slightly drifting,
needs frames: idle float (2), drift-left (4), drift-right (4),
holding floating sign (3), giving OK gesture 👌 (2), break-fourth-wall (2),
1px outline #2A2128, restricted 6-color palette
```

---

## Officer (most complex, generate multiple sheets)

### Base sheet

```
A relaxed military officer character, side view, pixel art,
canvas 32x40, 2.5 head-body ratio,
head 14px, body 26px (tallest character),
muted olive military uniform #5C6B4F,
golden badge accent #D4A574,
dark cap and tall boots #2A2128, light face #F4EFE6,
gentle smiling or half-lidded eye expression,
CRITICAL POSE: relaxed casual stance — hands in pockets OR
single hand on hip with slight head tilt OR leaning against wall,
NEVER military attention pose, NEVER stiff salute as idle,
1px outline #2A2128, restricted 7-color palette,
"off-duty officer" atmosphere—militaristic uniform but languid body language
```

### Idle pose variants (5 separate sprites, 2 frames each)

Generate each as a separate prompt by appending:

1. `pose: hand on hip, head tilted right, weight on right leg`
2. `pose: both hands behind back, gentle sway`
3. `pose: leaning against invisible wall, single leg crossed`
4. `pose: both hands in pockets, light idle sway`
5. `pose: weight shifting between left and right feet, cute step pattern`

### Random behaviors (5 separate animations)

1. `crouching down to look at the floor (the ant), 4 frames, peaceful curiosity`
2. `turning head sharply to face camera (4th wall break), 2 frames`
3. `taking off cap with one hand, scratching head, 2 frames`
4. `yawning with hand near mouth, 2 frames`
5. `glancing at wristwatch, slight bend, 2 frames`

### Card Flip (Officer exclusive, 4 frames)

```
A 4-frame card flip animation, the officer holding a small wooden sign,
frame 1: sign held flat showing front face
frame 2: sign tilting 45 degrees mid-flip
frame 3: sign perpendicular (thin edge)
frame 4: sign showing back face with pixel pink heart #E89BAA in lower-right corner,
smooth flip motion, pixel art, restricted palette consistent with officer
```

### Salute (2 frames)

```
The officer in soft salute pose,
right hand to brow, relaxed not stiff,
2 frames: 1 raising, 1 held, 
pixel art, 32x40, same palette as base sheet
```
