# Prompt Enhancement

How the node graph becomes an AI-enhanced generation prompt.

---

## Step 1 — Prompt Compilation

`src/lib/utils/promptCompiler.ts`

Each node in the graph contributes a **segment** to the final prompt. The compiler iterates connected nodes and calls a segment generator per node type:

| Node | Segment Generator | Output |
|------|------------------|--------|
| product | `compileProductSegment()` | Product description from `data/products.ts` defaults |
| scene | `compileSceneSegment()` | Environment/setting |
| style | `compileStyleSegment()` | Style, palette, design movement |
| branding | `compileBrandingSegment()` | Text with placement and typography |
| lighting | `compileLightingSegment()` | Light type and setting |
| camera | `compileCameraSegment()` | Angle, distance, depth of field |
| human | `compileHumanSegment()` | Gender, ethnicity, age, features, pose |
| clothing | `compileClothingSegment()` | Clothing description |
| ...20+ more | per node type | — |

The resulting string is the **node prompt** — a raw concatenation of all segment outputs.
Token estimation is also available via `estimateTokens()`.

---

## Step 2 — AI Enhancement

`src/lib/stores/promptOptimizer.ts` · `src/routes/api/optimize/+server.ts`

When the user clicks **Enhance**, the node prompt is sent to the `/api/optimize` endpoint.

### What happens in the API

1. **All selected models** are passed in and mapped to optimizer types (`nano-banana`, `seedream`, `qwen`).
2. If only one optimizer type is active, its dedicated system prompt is used.
3. If multiple optimizer types are active, a **multi-model reconciliation prompt** is built that applies the most restrictive rules from the combination.
4. The system prompt is sent to **Claude Haiku 4.5** (`claude-haiku-4-5-20251001`).
5. Claude rewrites the prompt following the rules for the combination.
6. Post-processing: HEX stripping, variation block verification, char limit enforcement.
7. Returns JSON: `{ optimizedPrompt, reasoning, models, optimizers, charLimit }`.

### Optimizer Rules per Model

| Optimizer | Models | Format | Char Limit | HEX codes |
|-----------|--------|--------|------------|-----------|
| `nano-banana` | `nano-banana-2` | Natural flowing sentences — never keyword lists | 8,000 | Not supported |
| `seedream` | `seedream/5-lite-*` | Tightly ordered keywords: Subject → Setting → Style → Lighting → Technical | 3,000 | Supported (only model that reads them correctly) |
| `qwen` | `qwen2/*` | Short sentence-like instructions, 50–120 words | 780 | Not supported |

### Multi-model combinations

When multiple model types are selected simultaneously, the **most restrictive rules win**:

| Combination | Effective limit | Format | HEX |
|-------------|----------------|--------|-----|
| nano-banana + seedream | 3,000 | Seedream keyword order (compatible with both) | Stripped |
| nano-banana + qwen (any) | 780 | Short sentence-like instructions | Stripped |
| seedream + qwen (any) | 780 | Short sentence-like instructions | Stripped |
| All three | 780 | Short sentence-like instructions | Stripped |

### What is always preserved

- Image reference markers (`"Image 1"`, `"with X reference images"`)
- Variation syntax `{option1|option2|option3}`
- User's explicit quoted text (text intended to appear in the generated image)

---

## Step 3 — Optimizer State

`src/lib/stores/promptOptimizer.ts`

```
isOptimizing   — spinner while Claude is generating
originalPrompt — the compiled node prompt
optimizedPrompt — Claude's rewrite
reasoning      — Claude's explanation of changes
useEnhanced    — which prompt will be used for generation
isStale        — true if any node changed after last enhancement
```

- `markStale()` is called automatically when nodes change, warning the user the enhancement is outdated.
- `useOptimized()` / `useOriginal()` toggle which prompt goes to the generation API.
- `getActivePrompt()` returns the currently active prompt for generation.
- Default optimizer is **Nano Banana** (since `nano-banana-2` is now the default model).

---

## Step 4 — Prompt Preview UI

`src/lib/components/ui/PromptPreview.svelte`

Displays:
- The compiled node prompt with character count and token estimate
- The enhanced prompt (once available) with Claude's reasoning
- A toggle to switch between original / enhanced
- A stale indicator when nodes have changed since last enhancement
- The **Enhance** button that triggers the optimizer
