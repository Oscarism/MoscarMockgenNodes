// ============================================
// Prompt Optimization API Route
// Uses Claude Haiku to enhance prompts for specific image models
// ============================================

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';

const ANTHROPIC_API_KEY = env.ANTHROPIC_API_KEY;

// Map our model names to optimizer types
type OptimizerModel = 'seedream' | 'z-image' | 'nano-banana' | 'flux';

function mapModelToOptimizer(model: string): OptimizerModel {
  if (model.includes('seedream')) return 'seedream';
  if (model.includes('z-image')) return 'z-image';
  if (model.includes('nano-banana')) return 'nano-banana';
  if (model.includes('flux')) return 'flux';
  return 'seedream'; // Default
}

// Model-specific guidance
const MODEL_GUIDANCE: Record<OptimizerModel, string> = {
  'seedream': `You are optimizing a prompt for Seedream 4.5 by ByteDance.

STRICT CHARACTER LIMIT: Your optimized prompt MUST be under 2000 characters. This is a hard limit.

PROMPT REQUIREMENTS:
- Length: 30-100 words using structured keywords (NOT full sentences)
- Order matters: The model weighs earlier concepts more heavily, so place the most important elements first
- NEVER use HEX color codes (like #FF6B35) - they will appear literally in the generated image. Use color names instead.

REQUIRED STRUCTURE (follow this order):
1. Subject - The main focus, described with specific attributes
2. Style - Artistic or photographic approach (oil painting, portrait photography, cinematic, photorealistic)
3. Details - Materials, textures, colors (use color names like "warm orange", never hex codes), distinguishing features
4. Lighting - Specific lighting conditions (golden hour, studio lighting, dramatic side lighting, soft diffused)
5. Technical - Camera specs if relevant (85mm lens, shallow depth of field, 4K, high resolution)

INCLUDE WHEN RELEVANT:
- Compositional terms: symmetrical composition, rule of thirds, foreground detail, wide-angle view
- Aesthetic qualifiers: cinematic, minimalist, stylized, commercial quality
- Environment descriptors: background, setting, atmosphere

EXAMPLE INPUT: "a cat on a windowsill"
EXAMPLE OUTPUT: "Fluffy orange tabby cat sitting on wooden windowsill, photorealistic style, soft fur texture with white chest markings, warm morning sunlight streaming through window, shallow depth of field, 85mm lens, cozy domestic interior background"

Do NOT use full narrative sentences. Use comma-separated descriptive phrases.
Do NOT use HEX color codes - the model will render them as text in the image.`,

  'z-image': `You are optimizing a prompt for Z-Image Turbo.

STRICT CHARACTER LIMIT: Your optimized prompt MUST be under 1500 characters. This is a hard limit - do not exceed it.

CRITICAL RULES:
- Length: 80-200 words (stay concise to respect character limit)
- NO negative prompts supported - ALL constraints must be stated positively
- Think like a film director giving precise camera and scene instructions
- NEVER use HEX color codes (like #FF6B35) - they will appear literally in the generated image. Use color names instead.

REQUIRED STRUCTURE (follow this order):
1. Shot type - Close-up, wide shot, medium shot, overhead, low angle
2. Subject - Primary focus with specific details (age, ethnicity, distinguishing features)
3. Appearance - Clothing, accessories, expression, pose, body language
4. Environment - Setting, background elements, surrounding objects
5. Lighting - Quality, direction, color temperature (soft diffused, hard directional, golden hour ambient)
6. Composition - Framing, focus areas, spatial relationships
7. Technical - Camera/lens specs (shot on 85mm at f/2.8, shallow depth of field)
8. Safety clauses - ALWAYS end with: "fully clothed, safe for work, appropriate attire, clean composition, no text overlays, no watermarks"

STYLE NOTES:
- Use photography terminology: aperture, focal length, exposure
- Describe spatial relationships explicitly (subject centered in frame, foreground/background elements)
- Include mood/atmosphere descriptors
- Use color names, not HEX codes`,

  'nano-banana': `You are optimizing a prompt for Nano Banana Pro (Gemini 3 Pro Image).

CRITICAL RULES:
- Use natural, flowing sentences and descriptive paragraphs - NOT keyword lists
- The model excels at understanding narrative descriptions and context
- Provide intent and purpose when relevant

REQUIRED STRUCTURE:
Write in this natural sentence format:
"Create a [type of image] of [subject description], [what they're doing or their state], in [setting/environment], shot from [camera angle/perspective]. The style is [artistic/photographic style], with [lighting description]."

SPECIAL FEATURES:
- Text rendering: For any text in the image, use explicit quotes: 'the sign reads "EXACT TEXT HERE"'
- Multi-step: For complex scenes, break into steps: "First, establish [X]. Then, add [Y]. Finally, include [Z]."
- Positive framing: Instead of "no cars," say "an empty street free of traffic"

INCLUDE WHEN RELEVANT:
- Context and intent: What is this image for? (marketing, editorial, personal)
- Specific details: Exact colors, materials, textures, expressions
- Atmosphere: Time of day, weather, mood, emotional tone`,

  'flux': `You are optimizing a prompt for Flux 2.

CRITICAL RULES:
- Subject first, details second - the model prioritizes information appearing earlier
- Can use HEX color codes for precise brand colors (e.g., #FF6B35)
- Supports text generation - specify exact text in quotes with font description

REQUIRED STRUCTURE (Four Pillars):
1. Subject - Core entity described clearly and specifically
2. Action - What the subject is doing, their pose or state
3. Style - Artistic or photographic aesthetic (lifestyle, editorial, product, fashion)
4. Context - Environment, lighting, mood, composition

TECHNICAL SPECIFICATIONS TO INCLUDE:
- Camera angles: eye level, low angle, bird's-eye, over-the-shoulder
- Lens focal length: 14-24mm (wide/dramatic), 35-50mm (natural), 70-85mm (portrait), 100mm+ (telephoto)
- Depth of field: f/1.4-f/2.8 (shallow/blurred background), f/4-f/5.6 (moderate), f/8-f/16 (deep focus)
- Lighting: direction, quality, color (soft diffused studio, hard directional sunlight, golden hour ambient)

FOR TEXT IN IMAGES:
- Specify exact text in quotes: "headline reads 'FUTURE DESIGN'"
- Describe typography: "bold sans-serif" or "elegant serif font"

COMPOSITION TERMS:
- Rule of thirds, golden spiral, triangular arrangement, diagonal energy, symmetrical balance`
};

function getSystemPrompt(model: OptimizerModel): string {
  return `${MODEL_GUIDANCE[model]}

CRITICAL - PRESERVE THESE ELEMENTS EXACTLY:

1. IMAGE REFERENCES: If the prompt mentions "Image 1", "Image 2", "with X reference image(s)", or any reference to uploaded/attached images, you MUST preserve these references exactly. These tell the model to use uploaded reference images.
   Example: "with 1 reference image" -> KEEP this phrase exactly
   Example: "Image 1 shows the product" -> KEEP "Image 1" exactly

2. VARIATION SYNTAX: If the prompt contains {option1|option2|option3}, preserve it EXACTLY.
   Example: "a {red|blue|green} car" -> KEEP the {red|blue|green} intact

3. USER'S CORE REQUEST: Do not change the fundamental subject or creative intent. If the user says "cans with the word mockup", keep that EXACT request.

YOUR TASK:
ENHANCE the user's prompt by:
- Adding descriptive details for lighting, materials, textures
- Reorganizing for optimal model processing (subject first, then style, then details)
- Adding technical photography terms where appropriate

DO NOT:
- Remove or change the user's specific requests (like text on objects)
- Remove image references (Image 1, Image 2, "with X reference images")
- Add completely new subjects or elements the user didn't mention
- Change quoted text or specific words the user wants in the image

RESPOND WITH ONLY JSON IN THIS EXACT FORMAT:
{
  "optimizedPrompt": "the enhanced prompt following all guidelines",
  "reasoning": "brief explanation of key changes made (1-2 sentences)"
}`;
}

export const POST: RequestHandler = async ({ request }) => {
  try {
    if (!ANTHROPIC_API_KEY) {
      return json({ error: 'Anthropic API key not configured' }, { status: 500 });
    }

    const { prompt, models } = await request.json();

    if (!prompt || typeof prompt !== 'string') {
      return json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Extract variation blocks {option1|option2|...} to ensure they're preserved
    const variationBlocks: string[] = [];
    const variationPlaceholders: string[] = [];
    let promptForOptimization = prompt;
    
    // Find all variation blocks
    const variationRegex = /\{([^}]+\|[^}]+)\}/g;
    let match;
    let index = 0;
    while ((match = variationRegex.exec(prompt)) !== null) {
      const placeholder = `__VARIATION_${index}__`;
      variationBlocks.push(match[0]);
      variationPlaceholders.push(placeholder);
      console.log(`[Optimize] Found variation block: ${match[0]}`);
      index++;
    }

    // Use first model for optimization or default
    const primaryModel = Array.isArray(models) && models.length > 0 
      ? models[0] 
      : 'seedream/4.5-text-to-image';
    
    const optimizerModel = mapModelToOptimizer(primaryModel);
    console.log(`[Optimize] Model: ${primaryModel}, Optimizer: ${optimizerModel}`);
    console.log(`[Optimize] Original prompt: ${prompt}`);

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
        system: getSystemPrompt(optimizerModel),
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
      console.error('Anthropic API error:', errorText);
      return json({ error: `Optimization failed: ${response.status}` }, { status: 500 });
    }

    const data = await response.json();
    const content = data.content?.[0]?.text;

    if (!content) {
      return json({ error: 'No content in API response' }, { status: 500 });
    }

    // Parse JSON response, handling markdown code blocks
    let parsed: { optimizedPrompt: string; reasoning: string };
    try {
      const cleanedContent = content
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      parsed = JSON.parse(cleanedContent);
    } catch (e) {
      console.error('Failed to parse optimizer response:', content);
      return json({ error: 'Failed to parse optimization result' }, { status: 500 });
    }

    let finalPrompt = parsed.optimizedPrompt;
    console.log(`[Optimize] Claude output: ${finalPrompt}`);

    // Validate variation blocks are preserved
    for (let i = 0; i < variationBlocks.length; i++) {
      const block = variationBlocks[i];
      if (!finalPrompt.includes(block)) {
        console.log(`[Optimize] Variation block missing! Appending: ${block}`);
        // If the variation block was removed, append it to the end
        finalPrompt = `${finalPrompt}, ${block}`;
      } else {
        console.log(`[Optimize] Variation block preserved: ${block}`);
      }
    }

    // Post-process: Remove any HEX codes for models that don't support them
    if (optimizerModel === 'seedream' || optimizerModel === 'z-image') {
      // Remove HEX color codes (they appear as text in generated images)
      finalPrompt = finalPrompt.replace(/#[0-9A-Fa-f]{6}/g, '').replace(/#[0-9A-Fa-f]{3}/g, '');
      // Clean up any double spaces or commas left behind
      finalPrompt = finalPrompt.replace(/\s+/g, ' ').replace(/,\s*,/g, ',').trim();
    }

    // Enforce character limits per model
    const charLimits: Record<OptimizerModel, number> = {
      'seedream': 2000,
      'z-image': 1500,
      'nano-banana': 8000,
      'flux': 4000
    };
    
    const limit = charLimits[optimizerModel];
    if (finalPrompt.length > limit) {
      console.log(`[Optimize] Prompt exceeds ${limit} chars (${finalPrompt.length}), truncating...`);
      // Truncate at the last complete word/phrase before the limit
      finalPrompt = finalPrompt.substring(0, limit);
      const lastComma = finalPrompt.lastIndexOf(',');
      const lastPeriod = finalPrompt.lastIndexOf('.');
      const cutPoint = Math.max(lastComma, lastPeriod);
      if (cutPoint > limit * 0.7) { // Only use if it doesn't lose too much
        finalPrompt = finalPrompt.substring(0, cutPoint);
      }
      finalPrompt = finalPrompt.trim();
    }

    console.log(`[Optimize] Final prompt (${finalPrompt.length} chars): ${finalPrompt.substring(0, 100)}...`);

    return json({
      success: true,
      originalPrompt: prompt,
      optimizedPrompt: finalPrompt,
      reasoning: parsed.reasoning,
      model: primaryModel
    });

  } catch (error) {
    console.error('Optimization error:', error);
    return json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
};
