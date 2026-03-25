# Potential Optimizations

Full audit of the MoscarNodes codebase — structure, redundancies, performance, and security.

---

## Priority Legend

- **P0** — Security or data-loss risk. Fix before shipping.
- **P1** — Causes real bugs or major maintenance pain. Fix soon.
- **P2** — Performance or code quality. Fix when touching the area.
- **P3** — Nice to have. Low urgency.

---

## 1. ~~Centralize Model Configuration~~ (P1) DONE

**Problem:** Model metadata (labels, aspect ratios, capabilities, char limits) is scattered across 8+ files. Adding or changing a model requires edits in all of them, with high risk of sync bugs.

**Where it's duplicated:**

| What | Files |
|------|-------|
| Model labels | `QualityNode.svelte` ("Nano B2"), `OutputNode.svelte` ("Nano Banana 2"), `OutputDrawer.svelte`, `MasonryGrid.svelte`, `PromptPreview.svelte` |
| Aspect ratios per model | `QualityNode.svelte` (hardcoded), `api/generate/+server.ts` (per-model config), `api/edit/+server.ts`, `presets.ts` |
| Image-to-image model lists | `OutputNode.svelte` (2 different lists), `QualityNode.svelte` (inline check), `generation.ts` |
| Quality/resolution support | `QualityNode.svelte` (derived booleans), `api/generate/+server.ts` (config object) |
| Char limits | `api/optimize/+server.ts` |

**Fix:** Create `src/lib/data/models.ts` — single source of truth:

```ts
export const MODEL_REGISTRY = {
  'nano-banana-2': {
    label: 'Nano Banana 2',
    shortLabel: 'Nano B2',
    ratios: ['1:1', '4:3', '3:4', ...],
    maxPrompt: 20000,
    supportsQuality: false,
    supportsResolution: true,
    requiresImage: false,
    supportsImageInput: true,
    optimizerType: 'nano-banana' as const,
  },
  // ... all models
} as const;
```

Then import and derive everything from it — labels, ratio lists, capability checks, optimizer mapping.

---

## 2. ~~Deduplicate Batch Generation Logic~~ (P1) DONE

**Problem:** `generation.ts` has two nearly identical functions:
- `startBatchGeneration()` (~120 lines, single model)
- `startMultiModelBatchGeneration()` (~142 lines, multiple models)

They share 80%+ of their code: request loop, image-sending logic, error handling, database save patterns.

**Fix:** Extract shared logic into `_generateBatch(prompt, settings, models[])` and have both functions call it. Collapses ~260 lines into ~160.

---

## 3. ~~Fix Upload Route Security~~ (P0) DONE

**File:** `src/routes/api/upload/+server.ts`

| Issue | Risk |
|-------|------|
| No file size validation | OOM / denial of service — a multi-GB upload converts to `Uint8Array` in memory |
| No MIME type validation | Client sends `contentType` unchecked — could store malicious files |
| Weak filename uniqueness | `Math.random().toString(36).substring(2, 8)` = 6 chars, collision risk under load |

**Fix:**
- Reject files > 10 MB before reading body
- Validate `contentType` against allowlist (`image/png`, `image/jpeg`, `image/webp`)
- Use `crypto.randomUUID()` for filenames

---

## 4. ~~Remove Debug Console Logs~~ (P2) DONE

~40 debug `console.log` statements remain in production code.

**Worst offenders:**
- `+page.svelte` — 6 sync-related logs on every node change
- `OutputDrawer.svelte` — 5 GSAP animation logs
- `api/generate/+server.ts` — logs full API input/output (could leak prompt data)
- `+layout.svelte` — auth state log

**Fix:** Remove all debug logs. Keep `console.error` for actual failures. Consider a `DEBUG` env flag if verbose logging is needed during development.

---

## 5. ~~Fix Polling & Status Route~~ (P2) DONE

**File:** `generation.ts` lines 607–780 (173-line function)

| Issue | Impact |
|-------|--------|
| No exponential backoff — polls at fixed interval | Unnecessary API load |
| Calls `auth.getUser()` multiple times per iteration | Redundant async work |
| Database updates fired with different patterns in 3 places | Hard to follow, potential race conditions |
| Status route has 60s timeout with no adaptive delay | Wastes connections |

**Fix:**
- Extract polling into smaller helper functions
- Implement backoff: 2s → 4s → 8s → 15s cap
- Cache `user` at poll start, reuse throughout
- Consolidate database writes into single `saveResult()` helper

---

## 6. ~~Unify imageStorage.ts and imageHost.ts~~ (P2) DONE

**Problem:** Two services doing the same thing (upload to Supabase) with different interfaces:
- `imageHost.ts` — uploads `File` objects (user uploads)
- `imageStorage.ts` — downloads from URL then uploads (API results)

Both have their own Supabase upload logic, both fall back to Litterbox, both have independent error handling.

**Fix:** Create shared `uploadToStorage(source: File | string)` that handles both cases. One fallback path, one error handler.

**Bonus:** `imageStorage.ts` silently returns the temp URL on failure — the app shows "saved" but the image will expire. Should return an error status or warn the user.

---

## 7. ~~Fix Canvas Store Efficiency~~ (P2) DONE

**File:** `src/lib/stores/canvas.ts`

| Issue | Impact |
|-------|--------|
| `connectedToOutput` derived store runs BFS on every nodes/edges change | Expensive for large graphs |
| `updateNodeData`, `updateNodePosition`, `toggleBypass` all `.map()` the entire array | 5 property updates = 5 full iterations |

**Fix:**
- Debounce `connectedToOutput` or compute lazily
- Batch node updates: `updateNodeData(id, { field1, field2, field3 })` already works, but ensure callers use single calls instead of multiple sequential updates

---

## 8. ~~Fix +page.svelte Sync Logic~~ (P2) DONE

**File:** `src/routes/+page.svelte`

| Issue | Line | Impact |
|-------|------|--------|
| `JSON.stringify` comparison on every node update | ~216 | O(n) serialization on every change |
| 50% heuristic for deletion detection | ~186 | Brittle magic number |
| `handleNodeClick`/`handlePaneClick` reassign `currentNodes` even when nothing changes | 351–370 | Unnecessary XYFlow re-renders |
| Async component import in `onMount` with no loading guard | 34–154 | Race condition if store changes during import |

**Fix:**
- Replace JSON.stringify with field-level comparison (compare `data` fields individually)
- Add explicit delete tracking instead of count heuristic
- Guard click handlers with early-return if selection unchanged
- Add `mounted` gate for store subscriptions

---

## 9. ~~Merge Edit API into Generate API~~ (P1) DONE

**File:** `src/routes/api/edit/+server.ts`

This route is nearly identical to `api/generate` — same validation, same API call, same error handling. It hardcodes `seedream/5-lite-image-to-image` as the model.

**Fix:** Remove `/api/edit` and have the generate route handle edit mode when an image URL and edit model are provided. The RefineNode can call `/api/generate` with `model: 'seedream/5-lite-image-to-image'`.

---

## 10. ~~Shared API Validation~~ (P2) DONE

**Problem:** Prompt validation, aspect ratio validation, and error response patterns are copy-pasted across 4 API routes (`generate`, `edit`, `video`, `motion-control`).

**Fix:** Create `src/lib/server/validation.ts`:

```ts
export function validatePrompt(prompt: unknown, maxLength: number)
export function validateAspectRatio(ratio: unknown, validRatios: string[])
export function apiError(message: string, status: number)
```

---

## 11. ~~Fix Hidden Images Race Condition~~ (P2) DONE

**File:** `generation.ts` lines 88–178

The custom hidden images store calls `syncToDatabase()` asynchronously without `await` or error handling. Multiple rapid hide/unhide actions can fire concurrent syncs that write stale data.

Also uses a dynamic import to avoid circular dependency with auth — architectural smell.

**Fix:**
- Debounce `syncToDatabase` (300ms)
- Use `Promise.allSettled` or queue pattern
- Break circular dependency by passing `userId` as parameter instead of importing auth store

---

## 12. ~~Fix Toast Memory Leak~~ (P3) DONE

**File:** `src/lib/stores/toasts.ts`

Progress toasts are created with `duration: 0` (never auto-remove). If a batch operation fails mid-way, the progress toast persists forever.

**Fix:** Add a max lifetime (e.g. 60s) even for progress toasts, or add `clearAllProgress()` called in batch error handlers.

---

## 13. ~~Fix WebSocket Cleanup in ComfyUI~~ (P2) DONE

**File:** `src/lib/comfyui/comfyui.ts`

| Issue | Impact |
|-------|--------|
| No reconnection logic | Network drop = lost upscale |
| WebSocket stored in closure can outlive promise | Memory leak |
| 10 retries with flat 1s delay | Doesn't adapt to network conditions |

**Fix:**
- Add exponential backoff for retries
- Track active WebSocket outside promise closure and clean up on error
- Add `abort()` capability for cancelled upscales

---

## 14. ~~Simplify generationMode.ts~~ (P3) DONE

**File:** `src/lib/stores/generationMode.ts` (181 lines)

This store holds prompt presets and a mode selector. But the prompt compiler has its own auto-detect logic that overrides the mode, making the store partially dead code.

`LEGACY_QUALITY_PREFIXES` and `LEGACY_QUALITY_SUFFIXES` in `promptCompiler.ts` are noted as "kept for backwards compatibility" but nothing references them.

**Fix:**
- Verify if `modeState` is actively subscribed to anywhere — if only the compiler reads it and immediately overrides it, remove the store
- Remove legacy prefix/suffix constants from promptCompiler
- Move preset data to `data/presets.ts` if the store is unnecessary

---

## 15. ~~PromptCompiler Switch → Map~~ (P3) DONE

**File:** `src/lib/utils/promptCompiler.ts` lines 736–806

71-line switch statement with 22 cases, each calling a compile function.

**Fix:**
```ts
const compilers: Record<NodeType, (data: any) => string> = {
  product: compileProductSegment,
  scene: compileSceneSegment,
  // ...
};
const content = compilers[node.data.type]?.(node.data) ?? '';
```

Also: `getUploadedImageUrls()` and `getImageUrls()` do the same thing (iterate image nodes, extract hosted URLs) — deduplicate.

---

## 16. ~~Improve Supabase Client~~ (P3) DONE

**File:** `src/lib/services/supabase.ts`

- Mock client implements only 7 methods — any new Supabase feature call crashes silently
- `createSupabaseBrowserClient()` creates a new instance every call — should be a singleton
- No warning when running with mock client

**Fix:** Use singleton pattern with `let client: SupabaseClient | null = null` and return cached instance. Add `console.warn` on first mock access.

---

## 17. ~~Add Pagination to Database Queries~~ (P3) DONE

**Files:** `database.ts`, `canvasDatabase.ts`

- `fetchGenerationHistory()` loads up to 100 records into memory with no pagination
- `listCanvases()` fetches all canvases with no limit
- `loadLatestCanvas()` makes 2 sequential queries that could be 1

**Fix:**
- Add `offset`/`limit` parameters
- Combine `loadLatestCanvas` queries: `ORDER BY is_default DESC, updated_at DESC LIMIT 1`

---

## 18. ~~Node Component Abstraction~~ (P3) DONE

Several node components (HumanNode, AnimalNode, AccessoryNode) have identical field rendering patterns — label + select + options loop, repeated 5–9 times per component.

**Fix:** Create a `<NodeField>` component:
```svelte
<NodeField label="Body Type" bind:value={data.bodyType} options={bodyTypes} />
```

This would cut ~30 lines per node component and standardize styling.

---

## 19. ~~Auth Store Circular Dependency~~ (P3) DONE

**File:** `src/lib/stores/auth.ts` lines 65–66

Uses dynamic import of `generation` store inside `onAuthStateChange` to avoid circular dependency. This is fragile and hides the coupling.

**Fix:** Use an event-based approach — auth store emits `'login'` event, generation store listens. Or pass a callback during initialization.

---

## 20. ~~Inconsistent Error Return Types~~ (P3) DONE

**File:** `src/lib/services/database.ts`

Functions return different types on failure:
- `saveGeneration()` → `null`
- `updateGeneration()` → `false`
- `fetchHistory()` → `[]`
- `deleteGeneration()` → `false`

Callers have to know which type to check for each function.

**Fix:** Standardize on `{ data, error }` pattern matching Supabase's own conventions, or use a `Result<T>` type.

---

## Summary

| Priority | Count | Status |
|----------|-------|--------|
| P0 (Security) | 1 | All DONE |
| P1 (Bugs/Maintenance) | 3 | All DONE |
| P2 (Performance/Quality) | 8 | All DONE |
| P3 (Nice to have) | 8 | All DONE |

All 20 optimization items have been completed.
