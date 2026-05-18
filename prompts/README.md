# AI Generation Prompts

Prompts in this folder are ready to use with:
- **Midjourney v6** (best for pixel atmosphere)
- **Stable Diffusion + Pixel Art LoRA** (most controllable)
- **Pixellab.ai** (most pixel-accurate)
- **DALL-E 3** (acceptable, may need post-processing)

## Universal Prefix (prepend to every prompt)

```
pixel art, 32x32 base grid, restricted palette,
no anti-aliasing, hard pixel edges, no smooth gradients,
crisp pixel-perfect lines, indie game asset style,
inspired by Stardew Valley + Eastward + A Short Hike
```

## Universal Negative Prompt

```
3d render, smooth shading, photorealistic, anti-aliasing,
blurry, soft edges, gradient mesh, ray tracing, modern UI,
flat vector, watercolor, painterly, cartoon outline
```

## Files

| File | Contains |
|---|---|
| [scenes.md](scenes.md) | 8 scene prompts (4 scenes × web/mobile) |
| [characters.md](characters.md) | 4 main character sprite prompts |
| [companions.md](companions.md) | Mouse/Fish color variants + tardigrade + ant |
| [ui-elements.md](ui-elements.md) | Card, menu, icons, progress bar, bubble |
| [animals.md](animals.md) | Author page pixel animals (cat/dog/duck/platypus) + self-portrait template |

## Workflow Tips

1. Generate scenes first — they set the world's lighting and color baseline
2. Generate characters next — match their lighting/palette to the scenes
3. Companions inherit from main characters — keep palette consistent
4. UI elements last — they're independent

For consistency, always include the universal prefix and respect the restricted palette specified per asset.
