# Adding a New Model to MoscarNodes

This guide walks through every place you need to touch when adding a new AI image generation model to the app. The model pipeline spans 4 files. Miss one and things will break silently.

---

## Overview of the Pipeline

```
QualityNode.svelte  →  generation.ts  →  +server.ts  →  Kie AI API
    (UI picker)         (API caller)      (validator)
        ↑
    types.ts
  (type system)
```

---

## Step-by-Step

### 1. `src/lib/types.ts` — Register the model ID as a TypeScript type

Find the `GenerationModel` union type and add your new model identifier:

```ts
// Before
export type GenerationModel =
  | 'seedream/4.5-text-to-image'
  | 'seedream/4.5-edit'
  | 'z-image'
  | 'flux-2/pro-image-to-image'
  | 'nano-banana-pro';

// After — add your new model
export type GenerationModel =
  | 'seedream/4.5-text-to-image'
  | 'seedream/4.5-edit'
  | 'z-image'
  | 'flux-2/pro-image-to-image'
  | 'nano-banana-pro'
  | 'your-new-model-id';  // ← add here
```

> The model ID string must **exactly match** the identifier expected by the Kie AI API (`model` field in `createTask`).

---

### 2. `src/routes/api/generate/+server.ts` — Add server-side validation config

Find the `MODEL_CONFIG` object and add a new entry. Every field is required:

```ts
const MODEL_CONFIG = {
  // ... existing models ...

  'your-new-model-id': {
    maxPromptLength: 3000,        // Max characters the model accepts
    validRatios: ['1:1', '16:9'], // Aspect ratios supported by this model
    supportsQuality: false,       // true = sends quality: 'basic'|'high' to API
    supportsResolution: false,    // true = sends resolution: '1K'|'2K'|'4K' to API
    supportsImages: false,        // true = model accepts image URL inputs
    requiresImages: false,        // true = images are mandatory (not optional)
    imageUrlField: 'image_urls'   // Field name the API expects for image inputs
  }
} as const;
```

#### Field Reference

| Field | Type | Notes |
|---|---|---|
| `maxPromptLength` | `number` | Characters. Check Kie AI model docs. |
| `validRatios` | `string[]` | Must be valid `AspectRatio` values. Include `'auto'` if supported. |
| `supportsQuality` | `boolean` | Currently only Seedream models use this. |
| `supportsResolution` | `boolean` | Flux and Nano Banana use this (`1K`/`2K`/`4K`). |
| `supportsImages` | `boolean` | Set `true` if model can take image input at all. |
| `requiresImages` | `boolean` | Set `true` if image input is mandatory (will error without it). |
| `imageUrlField` | `string` | The JSON key the API expects — e.g. `'image_urls'`, `'input_urls'`, `'image_input'`. Check the Kie AI docs for your model. |

> **Special case:** If your model needs a unique extra field (like Nano Banana needs `output_format: 'png'`), add a model-specific `if` block after the `supportsImages` section:
> ```ts
> if (selectedModel === 'your-new-model-id') {
>   input.some_extra_field = 'value';
> }
> ```

---

### 3. `src/lib/components/nodes/QualityNode.svelte` — Add to the UI picker

Two additions needed here:

#### a) Add to `modelOptions` (the button list)

```ts
const modelOptions: { value: GenerationModel; label: string; description: string }[] = [
  // ... existing entries ...
  {
    value: 'your-new-model-id',
    label: 'Short Name',          // Shown on the toggle button (keep it short, ~8 chars)
    description: 'One-liner'      // Shown as tooltip/hint
  }
];
```

#### b) Add to `modelRatios` (the aspect ratio map)

This must match exactly what you put in `validRatios` in `+server.ts`:

```ts
const modelRatios: Record<GenerationModel, string[]> = {
  // ... existing entries ...
  'your-new-model-id': ['1:1', '16:9', '9:16']  // same list as validRatios above
};
```

> **Tip:** The UI automatically computes the **intersection** of ratios when multiple models are selected. So be precise — only list ratios the model actually supports.

#### c) (Optional) Update capability-derived flags

If your model supports resolution or requires images, check these derived values near line 139 and update if needed:

```ts
// Resolution support — add your model if it supports 1K/2K/4K
let supportsResolution = $derived(isFluxModel || isNanoBanana || selectedModels.includes('your-new-model-id'));

// Image requirement — add your model if it strictly requires images
let requiresImages = $derived(
  selectedModels.includes('seedream/4.5-edit') ||
  selectedModels.includes('flux-2/pro-image-to-image') ||
  selectedModels.includes('your-new-model-id')
);
```

---

### 4. `src/lib/stores/generation.ts` — Add to the image-support lists

There are **two** places in this file (one in each generation function) where models that accept image input are listed. Update both:

```ts
// startBatchGeneration (~line 345)
const modelsSupportingImages = [
  'seedream/4.5-edit',
  'flux-2/pro-image-to-image',
  'nano-banana-pro',
  'your-new-model-id'  // ← add here if supportsImages: true
];

// startMultiModelBatchGeneration (~line 474)
const modelsSupportingImages = [
  'seedream/4.5-edit',
  'flux-2/pro-image-to-image',
  'nano-banana-pro',
  'your-new-model-id'  // ← add here too
];
```

> Search for `modelsSupportingImages` to find both occurrences quickly.

---

## Quick Checklist

Copy this when adding a model:

- [ ] `types.ts` — Added to `GenerationModel` union
- [ ] `+server.ts` — Added entry to `MODEL_CONFIG` with all fields
- [ ] `QualityNode.svelte` — Added to `modelOptions` (label + description)
- [ ] `QualityNode.svelte` — Added to `modelRatios` with correct ratio list
- [ ] `generation.ts` — Added to `modelsSupportingImages` in `startBatchGeneration` *(if image-capable)*
- [ ] `generation.ts` — Added to `modelsSupportingImages` in `startMultiModelBatchGeneration` *(if image-capable)*
- [ ] Tested a generation with the new model selected in the Quality Node

---

## Example: Adding a Hypothetical `flux-3/ultra` Model

Below is what the four file changes look like end-to-end for a model that:
- Accepts text-to-image only (no image input)
- Supports `1:1`, `16:9`, `9:16`, `4:3`, `3:4`
- Supports resolution (`1K`/`2K`)
- Does not support quality toggle
- Max prompt length: 8000

**`types.ts`**
```ts
| 'flux-3/ultra'
```

**`+server.ts`**
```ts
'flux-3/ultra': {
  maxPromptLength: 8000,
  validRatios: ['1:1', '16:9', '9:16', '4:3', '3:4'],
  supportsQuality: false,
  supportsResolution: true,
  supportsImages: false,
  requiresImages: false,
  imageUrlField: 'image_urls'
}
```

**`QualityNode.svelte` — modelOptions**
```ts
{ value: 'flux-3/ultra', label: 'Flux Ultra', description: 'Ultra quality T2I' }
```

**`QualityNode.svelte` — modelRatios**
```ts
'flux-3/ultra': ['1:1', '16:9', '9:16', '4:3', '3:4']
```

**`generation.ts`** — No changes needed (model doesn't support images).
