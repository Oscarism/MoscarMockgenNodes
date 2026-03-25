// ============================================
// Prompt Optimization API Route
// Uses Claude Haiku 4.5 to enhance prompts for specific image models
// ============================================

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';

const ANTHROPIC_API_KEY = env.ANTHROPIC_API_KEY;

type OptimizerModel = 'seedream' | 'nano-banana' | 'qwen';

// ============================================
// Model mapping
// ============================================

function mapModelToOptimizer(model: string): OptimizerModel {
  if (model.includes('seedream')) return 'seedream';
  if (model.includes('nano-banana')) return 'nano-banana';
  if (model.includes('qwen')) return 'qwen';
  return 'nano-banana';
}

// ============================================
// Character limits per optimizer
// ============================================

const CHAR_LIMITS: Record<OptimizerModel, number> = {
  'nano-banana': 8000,
  'seedream': 3000,
  'qwen': 780,
};

// ============================================
// Single-model system prompts
// ============================================

const MODEL_GUIDANCE: Record<OptimizerModel, string> = {

  // ------------------------------------------
  // NANO BANANA 2
  // ------------------------------------------
  'nano-banana': `You are optimizing a prompt for Nano Banana 2, a narrative image generation model.

HARD LIMIT: Output must be under 8000 characters.

CORE RULE: Write in natural, flowing sentences — never comma-separated keyword lists. This model was trained on narrative descriptions and performs significantly worse with keyword dumps.

REQUIRED PROMPT ORDER:
1. Subject — Lead with the primary subject and its specific visible attributes (material, color, texture, posture, age range, condition). Be concrete. "A slightly turned stance, chin raised, weight on the back foot" is actionable. "Confident" alone is not.
2. Action — What is the subject doing or what state is it in?
3. Location / Context — Place the subject in a named environment. Include surface materials, time of day, weather, and any background elements that shape the mood.
4. Composition — Use photographic framing language: "medium-full shot, center-framed", "low-angle looking up", "overhead flat-lay", "rule-of-thirds framing". Never leave framing to chance.
5. Style — Name a visual genre, photographic tradition, art movement, or specific filmmaker/artist. "Editorial fashion photography, shot on medium-format analog film, pronounced grain, high saturation" communicates more than any description of quality.
6. Lighting — Describe the source, direction, and character of the light. "Warm golden backlight with long shadows", "three-point softbox setup", "chiaroscuro with harsh contrast", "soft diffuse natural window light from the left". Never write "good lighting" or "well lit" — these add nothing.
7. Materiality — For products, objects, or clothing, name the physical material. "Navy blue tweed" reads differently from "navy blue silk". Surface-level specificity is where this model excels.

TEXT IN IMAGE:
Always wrap any text that should appear in the image in explicit quotation marks and follow with a typography description. Use the multi-step format for complex text layouts: "First, establish [X]. Then, add [Y]. Finally, include [Z]."

POSITIVE FRAMING ONLY:
Describe what you want, not what you don't want. Instead of "no cars", write "an empty street, completely free of traffic". Negative instructions consistently underperform positive ones.

CAMERA AND LENS:
Name hardware when the visual feel matters — "shot on a Fujifilm X-T5" produces authentic film color science, "shot on ARRI Alexa" produces cinematic broadcast quality. Add aperture values for depth of field: f/1.8 isolates the subject, f/11 keeps everything sharp.`,

  // ------------------------------------------
  // SEEDREAM 5 LITE
  // ------------------------------------------
  'seedream': `You are optimizing a prompt for Seedream 5 Lite, a reasoning-first image generation model.

HARD LIMIT: Output must be under 3000 characters.

CORE RULE: Use tightly ordered descriptive keywords and short phrases — NOT full narrative sentences. The model processes concepts in order and weights earlier keywords more heavily. Ordering is everything.

REQUIRED KEYWORD ORDER:
1. Subject — Primary subject with specific material, texture, condition, and action. Name everything concrete about the main focus before moving on.
2. Setting — Environment, surface materials, time of day, weather, background details. Be as precise about the setting as you are about the subject.
3. Style — Named visual genre, photographic tradition, art movement, or specific filmmaker/artist reference. Real camera brands and film stocks are understood and produce accurate results. Cross-references like "Star Wars cantina meets Moroccan souk" or "Beatrix Potter meets Studio Ghibli" work well.
4. Lighting — Source, direction, and quality. "Warm golden backlight, rim light on hair", "single dramatic sidelight, rim lighting on bottle edge", "god rays from above, soft diffuse daylight". Avoid generic lighting terms.
5. Technical — Camera body, lens, aperture, shutter speed. Real shutter speeds produce real visual effects: 1/8000s freezes all motion, 1/15s creates intentional blur, 25s renders star trails and light streaks. Real aperture values control depth of field precisely.

HEX COLOR CODES:
This model is the ONLY model in the pipeline that correctly interprets HEX color codes as actual colors. Use them freely for brand work, gradients, and per-element color precision. Always pair the HEX code with a plain-language color name for reinforcement — "#FF006E hot pink" outperforms "#FF006E" alone. Best on large surfaces: product bodies, backgrounds, large graphic shapes.

TEXT IN IMAGE:
Always wrap text that should appear in the image in explicit quotation marks. Also describe the text style and physical surface it lives on. Short text renders more reliably than long text.

SPATIAL LANGUAGE:
For scenes with multiple subjects, use explicit positional anchors: "on the left", "on the right", "in the foreground", "upper left corner", "lower right third". Use relational terms: "between them", "dwarfed by", "towering over". Vague placement like "two people at a table" leaves all composition to the model.

JSON FORMAT (multi-subject scenes only):
For compositions with more than three subjects requiring specific placement and per-element color control, you may format the prompt as a JSON object. Each subject gets its own description, position, color, and action. Use plain keyword prompts for single-subject work — JSON is only for complex commercial art direction.`,

  // ------------------------------------------
  // QWEN 2
  // ------------------------------------------
  'qwen': `You are optimizing a prompt for Qwen 2, a compact instruction-following image model with a strict 800-character API limit.

HARD LIMIT: Output must be under 780 characters. Every word must earn its place.

TARGET LENGTH: 50–120 words. Tight, direct, purposeful.

The model is available in two modes. Determine which applies based on whether the user's prompt is describing something to generate from scratch (text-to-image) or describing a change to make to an existing image (image-edit), and apply the corresponding rules.

TEXT-TO-IMAGE MODE:
Use short, structured sentence-like instructions — not keyword lists, not flowing narrative. Apply this order strictly:
1. Subject with specific visible attributes (material, color, texture, condition)
2. Visual style and genre named directly
3. Important details that are visually load-bearing
4. Compositional framing
5. Lighting — source, direction, character

IMAGE-EDIT MODE:
Edit instructions must be surgical and explicit. Apply these rules:
- Name the specific object or region being changed
- Describe the exact change
- Name any typographic, material, or color properties to match
- End every instruction with an explicit preservation clause: "keep everything else unchanged", "preserve font, size, and alignment", "do not alter the background or surrounding regions"
- Do not stack more than two distinct changes in a single instruction — chain edits across separate passes instead

TEXT IN IMAGE (both modes):
Quote any text that should appear in the image. Name the typographic style. Name the surface. For edits, also specify the original font, size, color, and alignment to preserve.

NEVER use HEX color codes — the model may render them as literal text in the generated image. Use named colors and descriptive material terms only.

POSITIVE FRAMING ONLY:
Describe what you want. "An empty street, no vehicles visible" outperforms "a street with no cars".

AVOID:
- Vague quality signals ("ultra realistic", "high quality", "stunning") — replace with specific style and lighting descriptors
- Flowing paragraphs — stay tight and instructional
- Abstract emotional language — "a scene that feels warm" is not actionable; "warm amber light, aged wooden surfaces" is`,
};

// ============================================
// Multi-model reconciliation prompt
// ============================================

function getMultiModelGuidance(optimizers: Set<OptimizerModel>): string {
  const has = (m: OptimizerModel) => optimizers.has(m);

  let charLimit = 8000;
  let formatRule = '';
  let hexRule = '';

  if (has('qwen')) {
    charLimit = 780;
    formatRule = `Use short, structured sentence-like instructions — not keyword lists, not flowing narrative. Aim for 50–120 words. This is the most restrictive model in this combination and sets the format and length floor for the entire prompt.`;
    hexRule = `Do NOT use HEX color codes — Qwen may render them as literal text in the image. Use named colors only.`;
  } else if (has('seedream')) {
    charLimit = 3000;
    formatRule = `Use tightly ordered descriptive keywords and short phrases. Seedream is keyword-ordered (Subject → Setting → Style → Lighting → Technical) and that structure is compatible with Nano Banana 2, which can interpret ordered phrases even if it prefers sentences.`;
    hexRule = has('nano-banana')
      ? `Avoid HEX color codes — Nano Banana 2 may render them as literal text. Use named colors only.`
      : `HEX color codes are supported by Seedream and may be used for precise color control.`;
  } else {
    charLimit = 8000;
    formatRule = `Use natural, flowing sentences and descriptive paragraphs.`;
    hexRule = `Avoid HEX color codes. Use named colors and descriptive material terms.`;
  }

  const modelList = [...optimizers].join(' + ');

  return `You are optimizing a prompt that will be sent to MULTIPLE image generation models simultaneously: ${modelList}.

HARD LIMIT: Output must be under ${charLimit} characters. This is the most restrictive limit across all selected models and is a hard ceiling.

MULTI-MODEL RULES:
When a prompt must work across different models, apply the most restrictive requirements from all models in the combination. A prompt that follows stricter rules will still perform acceptably on more permissive models — the reverse is not true.

FORMAT: ${formatRule}

COLOR: ${hexRule}

REQUIRED STRUCTURE (apply in this order — it is compatible across all selected models):
1. Subject — Primary subject with specific visible attributes: material, texture, color, condition, action. Be concrete and specific.
2. Setting — Environment, surface, time of day, weather, background. Name everything that shapes the scene.
3. Style — Named visual genre, photographic tradition, art movement, or filmmaker/artist reference. Use names, not descriptions of quality.
4. Lighting — Source, direction, character. Never write "good lighting". Describe the actual light.
5. Technical — Camera, lens, aperture where relevant. Real hardware names and real values produce accurate results.

TEXT IN IMAGE:
Always wrap any text that should appear in the image in explicit quotation marks. Describe the typographic style and the surface the text lives on. Short text renders more reliably than long text across all models.

POSITIVE FRAMING ONLY:
Describe what you want, not what you don't want. Positive instructions outperform negative ones across all models in this combination.

STAY WITHIN ${charLimit} CHARACTERS. Do not exceed this under any circumstances.`;
}

// ============================================
// System prompt assembly
// ============================================

const PRESERVATION_RULES = `
ALWAYS PRESERVE THESE ELEMENTS EXACTLY — DO NOT MODIFY UNDER ANY CIRCUMSTANCES:

1. IMAGE REFERENCES: If the prompt contains "Image 1", "Image 2", "with X reference image(s)", or any phrasing that references an uploaded or attached image, preserve it word-for-word. These are runtime instructions to the generation model.
   - "with 1 reference image" → keep exactly
   - "Image 1 shows the product" → keep "Image 1" exactly

2. VARIATION SYNTAX: If the prompt contains {option1|option2|option3}, preserve the entire block exactly including braces and pipes.
   - "a {red|blue|green} car" → keep {red|blue|green} intact

3. QUOTED TEXT: If the user has explicitly quoted text that should appear in the generated image, preserve the exact wording and quotation marks.

4. CORE CREATIVE INTENT: Do not change the fundamental subject or creative direction. Enhance the description — do not replace it.

YOUR TASK:
Enhance the prompt by adding descriptive detail for lighting, materials, textures, and composition. Reorganize for optimal model processing. Add relevant technical photography terms. Do not introduce subjects, objects, or elements the user did not mention.

RESPOND WITH ONLY VALID JSON IN THIS EXACT FORMAT — NO MARKDOWN, NO PREAMBLE:
{
  "optimizedPrompt": "the enhanced prompt following all guidelines above",
  "reasoning": "one or two sentences describing the key changes made"
}`;

function buildSystemPrompt(optimizers: Set<OptimizerModel>): string {
  const isMultiModel = optimizers.size > 1;
  const guidance = isMultiModel
    ? getMultiModelGuidance(optimizers)
    : MODEL_GUIDANCE[[...optimizers][0]];
  return `${guidance}\n\n${PRESERVATION_RULES}`;
}

// ============================================
// HEX stripping (post-process safety net)
// ============================================

function stripHexCodes(prompt: string): string {
  return prompt
    .replace(/#[0-9A-Fa-f]{6}\b/g, '')
    .replace(/#[0-9A-Fa-f]{3}\b/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/,\s*,/g, ',')
    .trim();
}

// ============================================
// Truncation with graceful cut point
// ============================================

function truncateToLimit(prompt: string, limit: number): string {
  if (prompt.length <= limit) return prompt;

  let cut = prompt.substring(0, limit);
  const lastComma = cut.lastIndexOf(',');
  const lastPeriod = cut.lastIndexOf('.');
  const cutPoint = Math.max(lastComma, lastPeriod);

  if (cutPoint > limit * 0.75) {
    cut = cut.substring(0, cutPoint);
  }

  return cut.trim();
}

// ============================================
// Request handler
// ============================================

export const POST: RequestHandler = async ({ request }) => {
  try {
    if (!ANTHROPIC_API_KEY) {
      return json({ error: 'Anthropic API key not configured' }, { status: 500 });
    }

    const { prompt, models } = await request.json();

    if (!prompt || typeof prompt !== 'string') {
      return json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Resolve all selected models into a deduplicated set of optimizer types
    const modelArray: string[] = Array.isArray(models) && models.length > 0
      ? models
      : ['nano-banana-2'];

    const optimizerSet = new Set<OptimizerModel>(
      modelArray.map(mapModelToOptimizer)
    );

    // The effective char limit is the most restrictive across all selected models
    const effectiveLimit = Math.min(
      ...[...optimizerSet].map(o => CHAR_LIMITS[o])
    );

    const systemPrompt = buildSystemPrompt(optimizerSet);

    console.log(`[Optimize] Models: ${modelArray.join(', ')}`);
    console.log(`[Optimize] Optimizers: ${[...optimizerSet].join(', ')}`);
    console.log(`[Optimize] Effective char limit: ${effectiveLimit}`);
    console.log(`[Optimize] Original prompt (${prompt.length} chars): ${prompt.substring(0, 120)}...`);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Optimize] Anthropic API error:', errorText);
      return json({ error: `Optimization failed: ${response.status}` }, { status: 500 });
    }

    const data = await response.json();
    const content = data.content?.[0]?.text;

    if (!content) {
      return json({ error: 'No content in API response' }, { status: 500 });
    }

    // Parse JSON response — strip markdown code fences if present
    let parsed: { optimizedPrompt: string; reasoning: string };
    try {
      const cleaned = content
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      parsed = JSON.parse(cleaned);
    } catch (e) {
      console.error('[Optimize] Failed to parse optimizer response:', content);
      return json({ error: 'Failed to parse optimization result' }, { status: 500 });
    }

    let finalPrompt = parsed.optimizedPrompt;

    // Post-process: strip HEX codes for any combination that includes a model that
    // cannot handle them (Nano Banana, Qwen). Only allow HEX if Seedream is the
    // sole model selected.
    const seedreamOnly = optimizerSet.size === 1 && optimizerSet.has('seedream');

    if (!seedreamOnly) {
      const beforeStrip = finalPrompt;
      finalPrompt = stripHexCodes(finalPrompt);
      if (finalPrompt !== beforeStrip) {
        console.log('[Optimize] HEX codes stripped from multi-model or non-Seedream prompt');
      }
    }

    // Post-process: verify variation blocks are intact, append any that were dropped
    const variationRegex = /\{([^}]+\|[^}]+)\}/g;
    const originalVariations: string[] = [];
    let match;
    while ((match = variationRegex.exec(prompt)) !== null) {
      originalVariations.push(match[0]);
    }

    for (const block of originalVariations) {
      if (!finalPrompt.includes(block)) {
        console.log(`[Optimize] Variation block missing, appending: ${block}`);
        finalPrompt = `${finalPrompt}, ${block}`;
      }
    }

    // Enforce effective character limit
    if (finalPrompt.length > effectiveLimit) {
      console.log(`[Optimize] Prompt exceeds limit (${finalPrompt.length} > ${effectiveLimit}), truncating`);
      finalPrompt = truncateToLimit(finalPrompt, effectiveLimit);
    }

    console.log(`[Optimize] Final prompt (${finalPrompt.length} chars): ${finalPrompt.substring(0, 120)}...`);

    return json({
      success: true,
      originalPrompt: prompt,
      optimizedPrompt: finalPrompt,
      reasoning: parsed.reasoning,
      models: modelArray,
      optimizers: [...optimizerSet],
      charLimit: effectiveLimit,
    });

  } catch (error) {
    console.error('[Optimize] Unhandled error:', error);
    return json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
};
