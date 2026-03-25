# AI Models

## Image Generation Models

Defined in `src/lib/types.ts` · Configured in `src/routes/api/generate/+server.ts`

| Model | Max Prompt | Quality | Resolution | Aspect Ratios | Default |
| ----- | ---------- | ------- | ---------- | ------------- | ------- |
| `nano-banana-2` | 20,000 | — | 1K/2K/4K | 14 ratios (incl. 1:4, 1:8, 4:1, 8:1) | ★ |
| `seedream/5-lite-text-to-image` | 3,000 | basic/high | — | 8 ratios | |
| `seedream/5-lite-image-to-image` | 3,000 | basic/high | — | 8 ratios (requires image) | |
| `qwen2/text-to-image` | 800 | — | — | uses `image_size` param | |
| `qwen2/image-edit` | 800 | — | — | uses `image_size` param (requires image) | |

All image generation calls go to the **KIE AI API**: `https://api.kie.ai/api/v1/jobs`
Auth via env var: `KIE_API_KEY`

### Prompt Optimizer per Model Group

| Optimizer | Used For | Style | Char Limit |
| --------- | -------- | ----- | ---------- |
| Nano Banana | `nano-banana-2` | Natural flowing sentences, NOT keyword lists | 8,000 |
| Seedream | `seedream/*` | 30–100 keywords, ordered Subject→Style→Details→Lighting→Technical, no HEX | 2,000 |
| Qwen | `qwen2/*` | Concise 50–120 word descriptions, direct and tight | 780 (API max: 800) |

Optimization uses **Claude Haiku 4.5** (`claude-haiku-4-5-20251001`) via Anthropic API.
See `src/routes/api/optimize/+server.ts` for full system prompts.

---

## Video Generation Model

| Model | Modes | Durations | Aspect Ratios |
| ----- | ----- | --------- | ------------- |
| `kling-3.0/video` | std / pro | 3–15 seconds | 16:9 / 9:16 / 1:1 |

API route: `src/routes/api/video/+server.ts`

---

## Upscaling (ComfyUI)

| Model | Resolutions | Source |
| ----- | ----------- | ------ |
| SeedVR2 (7B) | 4K / 5K / 6K | local ComfyUI instance |

- WebSocket: `PUBLIC_COMFY_WS_URL`
- API: `PUBLIC_COMFY_API_URL`
- VAE: `ema_vae_fp16.safetensors`
- DiT: `seedvr2_ema_7b_sharp_fp16.safetensors`

See `src/lib/comfyui/comfyui.ts` and `src/lib/components/nodes/ImageUpscaleNode.svelte`.
