# Node Types

All node types are defined in `src/lib/types.ts` and rendered as Svelte components in `src/lib/components/nodes/`.
The canvas uses `@xyflow/svelte` for the graph editor.

## Image / Input Nodes

| Node Type | Component | Purpose |
|-----------|-----------|---------|
| `image` | `ImageUploadNode.svelte` | Upload one or more reference images for generation |
| `reference` | `ReferenceImageNode.svelte` | Named reference images (e.g. "Image 1", "Image 2") |
| `video-upload` | `VideoUploadNode.svelte` | Upload video frames for motion control |

## Subject / Content Nodes

| Node Type | Component | Key Options |
|-----------|-----------|-------------|
| `product` | `ProductNode.svelte` | Category, specs, default prompts from `data/products.ts` |
| `human` | `HumanNode.svelte` | Gender, ethnicity, age, body type, pose, expression, hair, skin |
| `animal` | `AnimalNode.svelte` | Species, breed, age, behavior, coat — from `data/animals.ts` |
| `furniture` | `FurnitureNode.svelte` | Category, item, style, material, setting |
| `plant` | `PlantNode.svelte` | Plant type |
| `clothing` | `ClothingNode.svelte` | Type, style, color |
| `accessory` | `AccessoryNode.svelte` | Category, item, material, style, placement |
| `expression` | `ExpressionNode.svelte` | Mood, smile, eye contact, energy, eyebrows, mouth, head tilt |
| `pose` | `PoseNode.svelte` | Style mood, body pose |

## Scene / Environment Nodes

| Node Type | Component | Key Options |
|-----------|-----------|-------------|
| `scene` | `SceneNode.svelte` | Environment, setting description |
| `background` | `BackgroundNode.svelte` | Color, gradient, environment, time of day, mood, blur |
| `lighting` | `LightingNode.svelte` | Light type, light setting |
| `texture` | `TextureNode.svelte` | Texture type |

## Style / Creative Nodes

| Node Type | Component | Key Options |
|-----------|-----------|-------------|
| `style` | `StyleNode.svelte` | Style/aesthetic, color palette, design movement |
| `photography` | `PhotographyNode.svelte` | Photography preset, auto-enhance toggle |
| `camera` | `CameraNode.svelte` | Angle, distance, depth of field |
| `branding` | `BrandingNode.svelte` | Text overlay, placement, font |

## Generation / Output Nodes

| Node Type | Component | Key Options |
|-----------|-----------|-------------|
| `quality` | `QualityNode.svelte` | Model selection, aspect ratio, quality (basic/high), resolution (1K/2K/4K) |
| `output` | `OutputNode.svelte` | Trigger generation, batch count |
| `refine` | `RefineNode.svelte` | Refinement instructions for existing images |
| `variation` | `VariationNode.svelte` | Generate multiple variations |
| `custom` | `CustomPromptNode.svelte` | Free-form prompt text |
| `batch` | `BatchProcessorNode.svelte` | Batch image processing |

## Post-Processing Nodes

| Node Type | Component | Key Options |
|-----------|-----------|-------------|
| `upscale` | `ImageUpscaleNode.svelte` | Resolution selection: 4K / 5K / 6K via ComfyUI |
| `compare` | `ImageCompareNode.svelte` | Side-by-side slider comparison of two images |

## Video Nodes

| Node Type | Component | Key Options |
|-----------|-----------|-------------|
| `video-quality` | `VideoQualityNode.svelte` | Model (Kling 3.0), mode (std/pro), duration, aspect ratio |
| `video-output` | `VideoOutputNode.svelte` | Trigger video generation |
| `motion-control` | `MotionControlNode.svelte` | Image + video inputs for motion-guided generation |

---

## Base Node Behavior

Every node extends `BaseNode.svelte` which provides:
- **Bypass** — exclude node from prompt compilation without deleting it
- **Reset** — restore node defaults
- **Delete** — remove node from canvas

Node colors are defined in `src/lib/types.ts` (e.g. product=Lime, scene=Mint, style=Purple, quality=Pink, output=Red).

## Data Sources

Node options are driven by data files in `src/lib/data/`:
- `presets.ts` — all UI presets and option lists (41KB)
- `products.ts`, `animals.ts`, `accessories.ts`, `furniture.ts`, `clothing.ts`, `human.ts`, `expressions.ts`, `referenceLabels.ts`
