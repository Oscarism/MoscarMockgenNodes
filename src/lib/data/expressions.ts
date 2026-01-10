// ============================================
// Expression / Emotion Presets
// ============================================

export interface ExpressionPreset {
	id: string;
	label: string;
	prompt: string;
}

// Mood
export const moodPresets: ExpressionPreset[] = [
	{ id: 'happy', label: 'Happy', prompt: 'happy expression, joyful, cheerful mood' },
	{ id: 'serious', label: 'Serious', prompt: 'serious expression, focused, stern mood' },
	{ id: 'confident', label: 'Confident', prompt: 'confident expression, self-assured, empowered' },
	{ id: 'thoughtful', label: 'Thoughtful', prompt: 'thoughtful expression, pensive, contemplative' },
	{ id: 'relaxed', label: 'Relaxed', prompt: 'relaxed expression, calm, at ease' },
	{ id: 'excited', label: 'Excited', prompt: 'excited expression, enthusiastic, thrilled' },
	{ id: 'mysterious', label: 'Mysterious', prompt: 'mysterious expression, enigmatic, intriguing' },
	{ id: 'romantic', label: 'Romantic', prompt: 'romantic expression, dreamy, loving' },
	{ id: 'fierce', label: 'Fierce', prompt: 'fierce expression, intense, powerful' },
	{ id: 'playful', label: 'Playful', prompt: 'playful expression, fun, mischievous' },
	{ id: 'serene', label: 'Serene', prompt: 'serene expression, peaceful, tranquil' },
	{ id: 'surprised', label: 'Surprised', prompt: 'surprised expression, astonished, amazed' },
	{ id: 'melancholic', label: 'Melancholic', prompt: 'melancholic expression, wistful, pensive sadness' },
	{ id: 'determined', label: 'Determined', prompt: 'determined expression, resolved, focused intent' }
];

// Smile
export const smilePresets: ExpressionPreset[] = [
	{ id: 'none', label: 'No Smile', prompt: 'neutral face, no smile, straight expression' },
	{ id: 'subtle', label: 'Subtle Smile', prompt: 'subtle smile, slight grin, soft expression' },
	{ id: 'closed', label: 'Closed Smile', prompt: 'closed mouth smile, gentle smile, lips together' },
	{ id: 'open', label: 'Open Smile', prompt: 'open smile, teeth showing, genuine grin' },
	{ id: 'wide', label: 'Wide Smile', prompt: 'wide smile, big grin, broad happy expression' },
	{ id: 'laughing', label: 'Laughing', prompt: 'laughing, genuine laughter, joyful expression' },
	{ id: 'smirk', label: 'Smirk', prompt: 'smirk, half smile, knowing expression' },
	{ id: 'coy', label: 'Coy Smile', prompt: 'coy smile, shy smile, demure expression' }
];

// Eye Contact
export const eyeContactPresets: ExpressionPreset[] = [
	{ id: 'direct', label: 'Direct to Camera', prompt: 'direct eye contact, looking at camera, engaging gaze' },
	{ id: 'away', label: 'Looking Away', prompt: 'looking away, averted gaze, off-camera look' },
	{ id: 'down', label: 'Looking Down', prompt: 'looking down, downward gaze, lowered eyes' },
	{ id: 'up', label: 'Looking Up', prompt: 'looking up, upward gaze, raised eyes' },
	{ id: 'side', label: 'Side Glance', prompt: 'side glance, sideways look, peripheral gaze' },
	{ id: 'closed', label: 'Eyes Closed', prompt: 'eyes closed, shut eyes, peaceful' },
	{ id: 'squinting', label: 'Squinting', prompt: 'squinting, narrowed eyes, bright light reaction' },
	{ id: 'wide', label: 'Wide Eyes', prompt: 'wide eyes, open gaze, alert expression' },
	{ id: 'over-shoulder', label: 'Over Shoulder', prompt: 'looking over shoulder, turned head, backward glance' }
];

// Energy Level
export const energyPresets: ExpressionPreset[] = [
	{ id: 'calm', label: 'Calm', prompt: 'calm energy, peaceful, still, composed' },
	{ id: 'neutral', label: 'Neutral', prompt: 'neutral energy, balanced, unremarkable' },
	{ id: 'warm', label: 'Warm', prompt: 'warm energy, friendly, approachable, inviting' },
	{ id: 'energetic', label: 'Energetic', prompt: 'energetic, high energy, dynamic, lively' },
	{ id: 'intense', label: 'Intense', prompt: 'intense energy, powerful, strong presence' },
	{ id: 'soft', label: 'Soft', prompt: 'soft energy, gentle, delicate, tender' },
	{ id: 'dramatic', label: 'Dramatic', prompt: 'dramatic energy, theatrical, bold presence' },
	{ id: 'cool', label: 'Cool', prompt: 'cool energy, aloof, detached, sophisticated' }
];

// Eyebrows
export const eyebrowPresets: ExpressionPreset[] = [
	{ id: 'relaxed', label: 'Relaxed', prompt: 'relaxed eyebrows, neutral brow position' },
	{ id: 'raised', label: 'Raised', prompt: 'raised eyebrows, surprised look, lifted brows' },
	{ id: 'furrowed', label: 'Furrowed', prompt: 'furrowed brow, concentrated, slight frown' },
	{ id: 'one-raised', label: 'One Raised', prompt: 'one eyebrow raised, quizzical, skeptical look' },
	{ id: 'arched', label: 'Arched', prompt: 'arched eyebrows, elegant, refined expression' }
];

// Mouth Position
export const mouthPresets: ExpressionPreset[] = [
	{ id: 'closed', label: 'Closed', prompt: 'mouth closed, lips together' },
	{ id: 'slightly-open', label: 'Slightly Open', prompt: 'mouth slightly open, parted lips' },
	{ id: 'pout', label: 'Pout', prompt: 'pouting lips, pursed mouth, duck face' },
	{ id: 'biting-lip', label: 'Biting Lip', prompt: 'biting lower lip, flirty, anticipation' },
	{ id: 'open', label: 'Open Mouth', prompt: 'open mouth, speaking, mid-word' },
	{ id: 'teeth-showing', label: 'Teeth Showing', prompt: 'teeth visible, showing teeth, open smile' },
	{ id: 'tongue-out', label: 'Tongue Out', prompt: 'tongue sticking out, playful, silly' },
	{ id: 'blowing-kiss', label: 'Blowing Kiss', prompt: 'blowing kiss, puckered lips, sending love' }
];

// Head Position
export const headPositionPresets: ExpressionPreset[] = [
	{ id: 'straight', label: 'Straight', prompt: 'head straight, forward facing, level' },
	{ id: 'tilted-left', label: 'Tilted Left', prompt: 'head tilted left, angled, curious' },
	{ id: 'tilted-right', label: 'Tilted Right', prompt: 'head tilted right, angled, inquisitive' },
	{ id: 'chin-up', label: 'Chin Up', prompt: 'chin up, head back, confident stance' },
	{ id: 'chin-down', label: 'Chin Down', prompt: 'chin down, head lowered, demure' },
	{ id: 'profile', label: 'Profile', prompt: 'profile view, side of face, turned head' },
	{ id: 'three-quarter', label: 'Three-Quarter', prompt: 'three-quarter view, angled face, partial profile' },
	{ id: 'turned-away', label: 'Turned Away', prompt: 'head turned away, looking back, over shoulder' }
];
