# Storage & Viewing

How generated images and canvas state are persisted and displayed.

---

## Database (Supabase)

`src/lib/services/database.ts`

Supabase project: `https://fwiebwdwvzougpvqmrsh.supabase.co`
Env vars: `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`

### `generations` table

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | Primary key |
| `user_id` | uuid | Auth user |
| `prompt` | text | Raw node prompt |
| `enhanced_prompt` | text | Claude-optimized prompt (nullable) |
| `model` | text | Model used |
| `aspect_ratio` | text | |
| `quality` | text | |
| `resolution` | text | |
| `task_id` | text | KIE AI task ID for polling |
| `state` | text | idle / submitted / processing / complete / error |
| `result_urls` | text[] | Generated image URLs |
| `error_message` | text | |
| `created_at` | timestamptz | |

Key functions:
- `saveGeneration(userId, record, enhancedPrompt)` — insert new record
- `updateGeneration(taskId, state, resultUrls, errorMessage)` — update by task ID
- `loadGenerationHistory(userId)` — last 100 records
- `deleteGeneration(generationId)` — remove record
- `saveHiddenImages(userId, urls)` / `loadHiddenImages(userId)` — hidden image list

### `user_settings` table

Stores per-user preferences including `hidden_images: string[]`.

---

## Canvas Storage

`src/lib/services/canvasDatabase.ts`

### `canvases` table

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | |
| `user_id` | uuid | |
| `name` | text | |
| `nodes` | jsonb | Full XYFlow node array |
| `edges` | jsonb | Full XYFlow edge array |
| `is_default` | boolean | |
| `created_at` / `updated_at` | timestamptz | |

Key functions:
- `saveCanvas(userId, name, nodes, edges, canvasId?)` — upsert canvas
- `loadCanvas(canvasId)` — load specific canvas
- `loadLatestCanvas(userId)` — load default or most recent
- `listCanvases(userId)` — list summaries for all user canvases
- `deleteCanvas(canvasId)` / `setDefaultCanvas(userId, canvasId)`

### Preset Canvases

Pre-built templates stored in a `preset_canvases` table.
Loaded via `listPresetCanvases()` / `loadPresetCanvas(presetId)`.
Categories and node counts shown without exposing full node data until selected.

---

## Generation State (Svelte Stores)

`src/lib/stores/generation.ts`

```
isGenerating      — true while polling task status
currentTaskId     — KIE AI task ID being polled
progress          — idle | submitted | processing | complete | error
generatedImages   — URLs from latest completed generation
error             — error message if failed
```

- `fetchUserHistory()` loads generation history from Supabase on login
- Hidden images are stored in Supabase and synced with `localStorage` as fallback
- `visibleImages` is a derived store that filters out hidden URLs

---

## Viewing: Output Drawer

`src/lib/components/ui/OutputDrawer.svelte`

The drawer has three size states: **collapsed** / **expanded** / **fullscreen**.

### Image Layout

Images are split into two groups:
- **Recent** — last 20 images, shown in a `MasonryGrid.svelte`
- **Older** — grouped by generation record, shown in `WeeklyHistoryList.svelte`

Each image card shows:
- The generated image
- Model label (e.g. "Seedream", "Z-Image", "Flux I2I", "Nano Banana")
- Hide button (removes from view, persisted to Supabase)

### Child Components

| Component | File | Role |
|-----------|------|------|
| `MasonryGrid` | `ui/MasonryGrid.svelte` | Responsive masonry layout for recent images |
| `ImageLightbox` | `ui/ImageLightbox.svelte` | Full-screen zoom view with download |
| `WeeklyHistoryList` | `ui/WeeklyHistoryList.svelte` | Older records grouped by generation batch |

### Download

Uses a blob-based download approach (fetch → blob → `<a>` click) to force download rather than browser navigation.

---

## Image Upscaling (ComfyUI)

`src/lib/comfyui/comfyui.ts`

Flow:
1. `uploadImageToComfy(file)` — POST to `/api/comfyui/upload` proxy
2. `upscaleImage(file, resolution, onProgress?)` — builds SeedVR2 workflow and queues it
3. Monitors job via WebSocket (client ID per session)
4. `onProgress` callback receives `{ status, percent }` updates
5. Final image URL returned on completion

Result is saved back to the generation record in Supabase via `updateGeneration()`.

---

## API Routes

All in `src/routes/api/`:

| Route | Purpose |
|-------|---------|
| `generate/+server.ts` | Submit image generation to KIE AI |
| `status/+server.ts` | Poll task status |
| `optimize/+server.ts` | Claude Haiku prompt enhancement |
| `video/+server.ts` | Kling 3.0 video generation |
| `edit/+server.ts` | Image editing |
| `upload/+server.ts` | General image uploads |
| `motion-control/+server.ts` | Motion-guided generation |
| `comfyui/upload/+server.ts` | Proxy image upload to ComfyUI |
| `comfyui/prompt/+server.ts` | Queue ComfyUI workflow |
| `comfyui/history/[promptId]/+server.ts` | Fetch ComfyUI job results |
| `comfyui/view/+server.ts` | Stream ComfyUI output image |
