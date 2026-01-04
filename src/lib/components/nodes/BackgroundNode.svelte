<script lang="ts">
	import BaseNode from './BaseNode.svelte';
	import type { BackgroundNodeData } from '$lib/types';
	import { updateNodeData } from '$lib/stores/canvas';

	interface Props {
		id: string;
		data: BackgroundNodeData;
	}

	let { id, data }: Props = $props();

	// Main tabs for background type selection
	type BackgroundTab = 'solid' | 'gradient' | 'environment';
	let activeTab = $state<BackgroundTab>('solid');

	// Background styles
	const styles = [
		{ id: 'seamless', label: 'Seamless', prompt: 'seamless backdrop' },
		{ id: 'textured', label: 'Textured', prompt: 'textured background with subtle surface detail' },
		{ id: 'clean', label: 'Clean', prompt: 'clean minimal background' },
		{ id: 'minimal', label: 'Minimal', prompt: 'minimalist simple background' },
		{ id: 'bokeh', label: 'Bokeh', prompt: 'soft bokeh blur background with defocused lights' },
		{ id: 'gradient', label: 'Gradient', prompt: 'smooth gradient background' },
		{ id: 'vignette', label: 'Vignette', prompt: 'background with soft vignette edges' },
		{ id: 'paper', label: 'Paper', prompt: 'paper texture background' }
	];

	// Time of Day
	const timeOfDay = [
		{ id: '', label: 'Any', prompt: '' },
		{ id: 'dawn', label: 'Dawn', prompt: 'early dawn first light of day' },
		{ id: 'sunrise', label: 'Sunrise', prompt: 'sunrise golden morning light' },
		{ id: 'morning', label: 'Morning', prompt: 'bright morning daylight' },
		{ id: 'midday', label: 'Midday', prompt: 'midday high sun bright light' },
		{ id: 'afternoon', label: 'Afternoon', prompt: 'warm afternoon light' },
		{ id: 'golden-hour', label: 'Golden Hour', prompt: 'golden hour warm sunset light' },
		{ id: 'sunset', label: 'Sunset', prompt: 'sunset orange pink sky' },
		{ id: 'blue-hour', label: 'Blue Hour', prompt: 'blue hour twilight cool tones' },
		{ id: 'dusk', label: 'Dusk', prompt: 'dusk fading light evening' },
		{ id: 'evening', label: 'Evening', prompt: 'evening ambient light' },
		{ id: 'night', label: 'Night', prompt: 'nighttime dark setting' },
		{ id: 'midnight', label: 'Midnight', prompt: 'deep midnight darkness' },
		{ id: 'moonlit', label: 'Moonlit', prompt: 'moonlit night soft lunar glow' }
	];

	// Mood/Atmosphere categories
	const moodCategories = [
		{
			name: 'Temperature',
			moods: [
				{ id: 'warm', label: 'Warm', prompt: 'warm cozy inviting atmosphere' },
				{ id: 'hot', label: 'Hot', prompt: 'hot summer heat haze' },
				{ id: 'cool', label: 'Cool', prompt: 'cool calm refreshing atmosphere' },
				{ id: 'cold', label: 'Cold', prompt: 'cold crisp winter atmosphere' },
				{ id: 'neutral', label: 'Neutral', prompt: 'neutral balanced temperature' }
			]
		},
		{
			name: 'Energy',
			moods: [
				{ id: 'calm', label: 'Calm', prompt: 'calm peaceful serene' },
				{ id: 'relaxed', label: 'Relaxed', prompt: 'relaxed laid-back easy atmosphere' },
				{ id: 'energetic', label: 'Energetic', prompt: 'energetic dynamic lively' },
				{ id: 'intense', label: 'Intense', prompt: 'intense powerful dramatic' }
			]
		},
		{
			name: 'Emotion',
			moods: [
				{ id: 'happy', label: 'Happy', prompt: 'happy joyful cheerful bright' },
				{ id: 'romantic', label: 'Romantic', prompt: 'romantic love intimate soft' },
				{ id: 'mysterious', label: 'Mysterious', prompt: 'mysterious enigmatic intriguing' },
				{ id: 'dramatic', label: 'Dramatic', prompt: 'dramatic theatrical powerful' },
				{ id: 'peaceful', label: 'Peaceful', prompt: 'peaceful tranquil zen' },
				{ id: 'nostalgic', label: 'Nostalgic', prompt: 'nostalgic vintage memories' }
			]
		},
		{
			name: 'Style',
			moods: [
				{ id: 'dreamy', label: 'Dreamy', prompt: 'dreamy ethereal soft focus' },
				{ id: 'cinematic', label: 'Cinematic', prompt: 'cinematic movie-like dramatic' },
				{ id: 'editorial', label: 'Editorial', prompt: 'editorial fashion magazine style' },
				{ id: 'vintage', label: 'Vintage', prompt: 'vintage retro old-fashioned' },
				{ id: 'modern', label: 'Modern', prompt: 'modern contemporary sleek' },
				{ id: 'minimalist', label: 'Minimalist', prompt: 'minimalist clean simple' }
			]
		},
		{
			name: 'Weather',
			moods: [
				{ id: 'sunny', label: 'Sunny', prompt: 'sunny clear bright day' },
				{ id: 'cloudy', label: 'Cloudy', prompt: 'cloudy overcast diffused light' },
				{ id: 'rainy', label: 'Rainy', prompt: 'rainy wet rain drops' },
				{ id: 'foggy', label: 'Foggy', prompt: 'foggy misty atmospheric haze' },
				{ id: 'snowy', label: 'Snowy', prompt: 'snowy winter snowfall' }
			]
		}
	];

	let activeMoodCategory = $state(moodCategories[0].name);

	// Solid colors organized by category
	const colorCategories = [
		{
			name: 'Neutrals',
			colors: [
				{ hex: '#FFFFFF', label: 'White' },
				{ hex: '#F5F5F5', label: 'Off-White' },
				{ hex: '#E0E0E0', label: 'Light Gray' },
				{ hex: '#9E9E9E', label: 'Gray' },
				{ hex: '#616161', label: 'Dim Gray' },
				{ hex: '#212121', label: 'Charcoal' },
				{ hex: '#000000', label: 'Black' }
			]
		},
		{
			name: 'Pastels',
			colors: [
				{ hex: '#FFEBEE', label: 'Blush' },
				{ hex: '#FCE4EC', label: 'Pink' },
				{ hex: '#F3E5F5', label: 'Lavender' },
				{ hex: '#E3F2FD', label: 'Light Blue' },
				{ hex: '#E8F5E9', label: 'Mint' },
				{ hex: '#FFFDE7', label: 'Cream' },
				{ hex: '#FFF3E0', label: 'Peach' }
			]
		},
		{
			name: 'Warm',
			colors: [
				{ hex: '#FFCDD2', label: 'Rose' },
				{ hex: '#E57373', label: 'Coral' },
				{ hex: '#F44336', label: 'Red' },
				{ hex: '#FF7043', label: 'Tangerine' },
				{ hex: '#FF5722', label: 'Orange' },
				{ hex: '#FFD54F', label: 'Gold' },
				{ hex: '#FFC107', label: 'Honey' }
			]
		},
		{
			name: 'Cool',
			colors: [
				{ hex: '#90CAF9', label: 'Sky Blue' },
				{ hex: '#42A5F5', label: 'Azure' },
				{ hex: '#2196F3', label: 'Blue' },
				{ hex: '#0D47A1', label: 'Navy' },
				{ hex: '#26C6DA', label: 'Turquoise' },
				{ hex: '#AB47BC', label: 'Violet' },
				{ hex: '#6A1B9A', label: 'Deep Purple' }
			]
		},
		{
			name: 'Earth',
			colors: [
				{ hex: '#BCAAA4', label: 'Taupe' },
				{ hex: '#8D6E63', label: 'Brown' },
				{ hex: '#4E342E', label: 'Espresso' },
				{ hex: '#A5D6A7', label: 'Fern' },
				{ hex: '#66BB6A', label: 'Green' },
				{ hex: '#2E7D32', label: 'Evergreen' },
				{ hex: '#BDB76B', label: 'Olive' }
			]
		}
	];

	let activeColorCategory = $state(colorCategories[0].name);

	// Gradients organized by theme
	const gradientCategories = [
		{
			name: 'Warm',
			gradients: [
				{ id: 'sunset', colors: ['#FF6B6B', '#FEC89A'], label: 'Sunset' },
				{ id: 'sunrise', colors: ['#FF512F', '#F09819'], label: 'Sunrise' },
				{ id: 'golden', colors: ['#F2C94C', '#F2994A'], label: 'Golden' },
				{ id: 'peach', colors: ['#FFECD2', '#FCB69F'], label: 'Peach' },
				{ id: 'coral', colors: ['#FF9A8B', '#FF6A88'], label: 'Coral' },
				{ id: 'fire', colors: ['#F83600', '#F9D423'], label: 'Fire' }
			]
		},
		{
			name: 'Cool',
			gradients: [
				{ id: 'ocean', colors: ['#667eea', '#764ba2'], label: 'Ocean' },
				{ id: 'ice', colors: ['#74ebd5', '#ACB6E5'], label: 'Ice' },
				{ id: 'arctic', colors: ['#E0EAFC', '#CFDEF3'], label: 'Arctic' },
				{ id: 'sky', colors: ['#56CCF2', '#2F80ED'], label: 'Sky' },
				{ id: 'aqua', colors: ['#13547a', '#80d0c7'], label: 'Aqua' },
				{ id: 'deep-sea', colors: ['#0F2027', '#2C5364'], label: 'Deep Sea' }
			]
		},
		{
			name: 'Nature',
			gradients: [
				{ id: 'forest', colors: ['#11998e', '#38ef7d'], label: 'Forest' },
				{ id: 'meadow', colors: ['#56ab2f', '#a8e063'], label: 'Meadow' },
				{ id: 'moss', colors: ['#134E5E', '#71B280'], label: 'Moss' },
				{ id: 'sand', colors: ['#C9D6FF', '#E2E2E2'], label: 'Sand' },
				{ id: 'desert', colors: ['#FFE47A', '#E8C99B'], label: 'Desert' },
				{ id: 'bamboo', colors: ['#334d50', '#cbcaa5'], label: 'Bamboo' }
			]
		},
		{
			name: 'Vibrant',
			gradients: [
				{ id: 'cotton-candy', colors: ['#ff9a9e', '#fecfef'], label: 'Cotton Candy' },
				{ id: 'neon', colors: ['#00F260', '#0575E6'], label: 'Neon' },
				{ id: 'electric', colors: ['#a8ff78', '#78ffd6'], label: 'Electric' },
				{ id: 'aurora', colors: ['#7F7FD5', '#91EAE4'], label: 'Aurora' },
				{ id: 'rainbow', colors: ['#f5af19', '#f12711'], label: 'Rainbow' },
				{ id: 'prism', colors: ['#e1eec3', '#f05053'], label: 'Prism' }
			]
		},
		{
			name: 'Dark',
			gradients: [
				{ id: 'midnight', colors: ['#232526', '#414345'], label: 'Midnight' },
				{ id: 'twilight', colors: ['#2c3e50', '#fd746c'], label: 'Twilight' },
				{ id: 'noir', colors: ['#0f0c29', '#302b63'], label: 'Noir' },
				{ id: 'space', colors: ['#000000', '#434343'], label: 'Space' },
				{ id: 'galaxy', colors: ['#0f0c29', '#24243e'], label: 'Galaxy' },
				{ id: 'shadow', colors: ['#3a3d40', '#181719'], label: 'Shadow' }
			]
		},
		{
			name: 'Soft',
			gradients: [
				{ id: 'lavender', colors: ['#E8D5E0', '#F0E6EF'], label: 'Lavender' },
				{ id: 'rose', colors: ['#ffecd2', '#fcb69f'], label: 'Rose' },
				{ id: 'misty', colors: ['#eef2f3', '#8e9eab'], label: 'Misty' },
				{ id: 'cloud', colors: ['#ECE9E6', '#FFFFFF'], label: 'Cloud' },
				{ id: 'silk', colors: ['#fdfcfb', '#e2d1c3'], label: 'Silk' },
				{ id: 'cream', colors: ['#F3E7E9', '#E3EEFF'], label: 'Cream' }
			]
		}
	];

	let activeGradientCategory = $state(gradientCategories[0].name);

	// Environments organized by category
	const environmentCategories = [
		{
			name: 'Studio',
			environments: [
				{
					id: 'photo-studio',
					label: 'Photo Studio',
					prompt: 'professional photography studio with softbox lighting'
				},
				{
					id: 'white-cyclorama',
					label: 'White Cyc',
					prompt: 'white infinity cyclorama photography studio'
				},
				{
					id: 'black-studio',
					label: 'Dark Studio',
					prompt: 'dark black photography studio with dramatic lighting'
				},
				{ id: 'product-studio', label: 'Product', prompt: 'clean product photography studio setup' }
			]
		},
		{
			name: 'Nature',
			environments: [
				{ id: 'forest', label: 'Forest', prompt: 'lush green forest background' },
				{ id: 'garden', label: 'Garden', prompt: 'beautiful garden with flowers' },
				{ id: 'meadow', label: 'Meadow', prompt: 'open meadow with wildflowers' },
				{ id: 'autumn-forest', label: 'Autumn', prompt: 'autumn forest with colorful fall leaves' }
			]
		},
		{
			name: 'Water',
			environments: [
				{ id: 'beach', label: 'Beach', prompt: 'sandy beach with ocean waves' },
				{ id: 'tropical', label: 'Tropical', prompt: 'tropical paradise beach with palm trees' },
				{ id: 'ocean', label: 'Ocean', prompt: 'deep blue ocean background' },
				{ id: 'lake', label: 'Lake', prompt: 'calm lake with reflections' }
			]
		},
		{
			name: 'Sky',
			environments: [
				{ id: 'blue-sky', label: 'Blue Sky', prompt: 'clear blue sky with fluffy clouds' },
				{ id: 'sunset-sky', label: 'Sunset', prompt: 'dramatic sunset sky with orange and pink' },
				{ id: 'starry-night', label: 'Starry', prompt: 'clear night sky with stars' },
				{ id: 'northern-lights', label: 'Aurora', prompt: 'northern lights aurora borealis' }
			]
		},
		{
			name: 'Urban',
			environments: [
				{ id: 'city', label: 'City', prompt: 'modern city skyline' },
				{ id: 'street', label: 'Street', prompt: 'urban street scene' },
				{ id: 'neon-city', label: 'Neon City', prompt: 'neon-lit cyberpunk city at night' },
				{ id: 'cafe', label: 'Café', prompt: 'cozy sidewalk café' }
			]
		},
		{
			name: 'Interior',
			environments: [
				{ id: 'living-room', label: 'Living Room', prompt: 'modern living room interior' },
				{ id: 'office', label: 'Office', prompt: 'professional office interior' },
				{ id: 'loft', label: 'Loft', prompt: 'industrial loft space' },
				{ id: 'gallery', label: 'Gallery', prompt: 'art gallery white walls' }
			]
		},
		{
			name: 'Abstract',
			environments: [
				{ id: 'abstract', label: 'Abstract', prompt: 'abstract artistic background' },
				{ id: 'geometric', label: 'Geometric', prompt: 'geometric abstract shapes' },
				{ id: 'smoke', label: 'Smoke', prompt: 'colorful smoke and fog' },
				{ id: 'marble', label: 'Marble', prompt: 'elegant marble texture' }
			]
		},
		{
			name: 'Fantasy',
			environments: [
				{ id: 'ethereal', label: 'Ethereal', prompt: 'ethereal dreamy fantasy realm' },
				{ id: 'enchanted', label: 'Enchanted', prompt: 'magical enchanted forest' },
				{ id: 'cosmic', label: 'Cosmic', prompt: 'cosmic space nebula' },
				{ id: 'crystal', label: 'Crystal', prompt: 'glowing crystal cave' }
			]
		}
	];

	let activeEnvCategory = $state(environmentCategories[0].name);

	// Get color label from hex
	function getColorLabel(hex: string): string {
		for (const cat of colorCategories) {
			const color = cat.colors.find((c) => c.hex === hex);
			if (color) return color.label;
		}
		return hex;
	}

	// Get gradient label from colors
	function getGradientLabel(colors: string[]): string {
		if (!colors || colors.length < 2) return '';
		for (const cat of gradientCategories) {
			const gradient = cat.gradients.find(
				(g) => g.colors[0] === colors[0] && g.colors[1] === colors[1]
			);
			if (gradient) return gradient.label;
		}
		return `${colors[0]} → ${colors[1]}`;
	}

	// Get environment label from id
	function getEnvironmentLabel(envId: string): string {
		for (const cat of environmentCategories) {
			const env = cat.environments.find((e) => e.id === envId);
			if (env) return env.label;
		}
		return envId;
	}

	// Get environment prompt from id
	function getEnvironmentPrompt(envId: string): string {
		for (const cat of environmentCategories) {
			const env = cat.environments.find((e) => e.id === envId);
			if (env) return env.prompt;
		}
		return '';
	}

	// Get style prompt
	function getStylePrompt(styleId: string): string {
		const style = styles.find((s) => s.id === styleId);
		return style?.prompt || '';
	}

	// Get time of day prompt
	function getTimePrompt(timeId: string): string {
		const time = timeOfDay.find((t) => t.id === timeId);
		return time?.prompt || '';
	}

	// Get mood prompt
	function getMoodPrompt(moodId: string): string {
		for (const cat of moodCategories) {
			const mood = cat.moods.find((m) => m.id === moodId);
			if (mood) return mood.prompt;
		}
		return '';
	}

	function handleChange(field: string, value: any) {
		updateNodeData(id, { [field]: value });
	}

	function handleSolidColorSelect(hex: string) {
		// Clear gradient and environment when selecting solid color
		updateNodeData(id, {
			solidColor: hex,
			gradientColors: undefined,
			environment: ''
		});
		activeTab = 'solid';
	}

	function handleGradientSelect(gradient: { colors: string[] }) {
		// Clear solid color and environment when selecting gradient
		updateNodeData(id, {
			gradientColors: gradient.colors,
			solidColor: undefined,
			environment: ''
		});
		activeTab = 'gradient';
	}

	function handleEnvironmentSelect(envId: string) {
		// Clear solid color and gradient when selecting environment
		updateNodeData(id, {
			environment: envId,
			solidColor: undefined,
			gradientColors: undefined
		});
		activeTab = 'environment';
	}

	function getVisibleColors() {
		return colorCategories.find((c) => c.name === activeColorCategory)?.colors || [];
	}

	function getVisibleGradients() {
		return gradientCategories.find((c) => c.name === activeGradientCategory)?.gradients || [];
	}

	function getVisibleEnvironments() {
		return environmentCategories.find((c) => c.name === activeEnvCategory)?.environments || [];
	}

	function getVisibleMoods() {
		return moodCategories.find((c) => c.name === activeMoodCategory)?.moods || [];
	}

	// Generate preview of what the background node will send to the prompt
	let backgroundPreview = $derived(() => {
		const parts: string[] = [];

		// Style
		if (data.style) {
			const stylePrompt = getStylePrompt(data.style);
			if (stylePrompt) parts.push(stylePrompt);
		}

		// Main background type (solid, gradient, or environment)
		if (data.solidColor && data.solidColor !== '#FFFFFF') {
			parts.push(`${getColorLabel(data.solidColor)} colored background`);
		} else if (data.gradientColors && data.gradientColors.length >= 2) {
			parts.push(`${getGradientLabel(data.gradientColors)} gradient background`);
		} else if (data.environment) {
			const envPrompt = getEnvironmentPrompt(data.environment);
			if (envPrompt) parts.push(envPrompt);
		}

		// Time of day
		if (data.timeOfDay) {
			const timePrompt = getTimePrompt(data.timeOfDay);
			if (timePrompt) parts.push(timePrompt);
		}

		// Mood
		if (data.mood) {
			const moodPrompt = getMoodPrompt(data.mood);
			if (moodPrompt) parts.push(moodPrompt);
		}

		// Blur
		if (data.blur && data.blur > 0) {
			parts.push(`${data.blur}% background blur depth of field`);
		}

		// Custom prompt
		if (data.customPrompt && data.customPrompt.trim()) {
			parts.push(data.customPrompt.trim());
		}

		return parts.length > 0 ? parts.join(', ') : '(no background set)';
	});
</script>

<BaseNode {id} nodeType="background" width={320}>
	<!-- Style Selection -->
	<div class="field">
		<span class="field-label">Style</span>
		<div class="toggle-row wrap">
			{#each styles as style}
				<button
					type="button"
					class="toggle-btn small"
					class:active={data.style === style.id}
					onclick={() => handleChange('style', style.id)}
				>
					{style.label}
				</button>
			{/each}
		</div>
	</div>

	<!-- Main Background Tabs -->
	<div class="field">
		<span class="field-label">Background Type</span>
		<div class="main-tabs">
			<button
				class="main-tab"
				class:active={activeTab === 'solid'}
				onclick={() => (activeTab = 'solid')}
			>
				Solid Color
			</button>
			<button
				class="main-tab"
				class:active={activeTab === 'gradient'}
				onclick={() => (activeTab = 'gradient')}
			>
				Gradient
			</button>
			<button
				class="main-tab"
				class:active={activeTab === 'environment'}
				onclick={() => (activeTab = 'environment')}
			>
				Environment
			</button>
		</div>

		<!-- Solid Color Tab Content -->
		{#if activeTab === 'solid'}
			<div class="tab-content">
				<div class="category-tabs">
					{#each colorCategories as cat}
						<button
							class="category-tab"
							class:active={activeColorCategory === cat.name}
							onclick={() => (activeColorCategory = cat.name)}
						>
							{cat.name}
						</button>
					{/each}
				</div>
				<div class="color-swatches">
					{#each getVisibleColors() as color}
						<button
							class="color-swatch"
							class:active={data.solidColor === color.hex}
							style="background-color: {color.hex}"
							onclick={() => handleSolidColorSelect(color.hex)}
							title={color.label}
							aria-label={color.label}
						></button>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Gradient Tab Content -->
		{#if activeTab === 'gradient'}
			<div class="tab-content">
				<div class="category-tabs">
					{#each gradientCategories as cat}
						<button
							class="category-tab"
							class:active={activeGradientCategory === cat.name}
							onclick={() => (activeGradientCategory = cat.name)}
						>
							{cat.name}
						</button>
					{/each}
				</div>
				<div class="gradient-swatches">
					{#each getVisibleGradients() as gradient}
						<button
							class="gradient-swatch"
							class:active={data.gradientColors?.[0] === gradient.colors[0]}
							style="background: linear-gradient(135deg, {gradient.colors[0]}, {gradient
								.colors[1]})"
							onclick={() => handleGradientSelect(gradient)}
							title={gradient.label}
							aria-label={gradient.label}
						></button>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Environment Tab Content -->
		{#if activeTab === 'environment'}
			<div class="tab-content">
				<div class="category-tabs">
					{#each environmentCategories as cat}
						<button
							class="category-tab"
							class:active={activeEnvCategory === cat.name}
							onclick={() => (activeEnvCategory = cat.name)}
						>
							{cat.name}
						</button>
					{/each}
				</div>
				<div class="env-grid">
					{#each getVisibleEnvironments() as env}
						<button
							class="env-btn"
							class:active={data.environment === env.id}
							onclick={() => handleEnvironmentSelect(env.id)}
						>
							{env.label}
						</button>
					{/each}
				</div>
			</div>
		{/if}
	</div>

	<!-- Time of Day -->
	<div class="field">
		<label for="time-{id}">Time of Day</label>
		<select
			id="time-{id}"
			value={data.timeOfDay || ''}
			onchange={(e) => handleChange('timeOfDay', (e.target as HTMLSelectElement).value)}
		>
			{#each timeOfDay as time}
				<option value={time.id}>{time.label}</option>
			{/each}
		</select>
	</div>

	<!-- Mood / Atmosphere -->
	<div class="field">
		<span class="field-label">Atmosphere</span>
		<div class="category-tabs">
			{#each moodCategories as cat}
				<button
					class="category-tab"
					class:active={activeMoodCategory === cat.name}
					onclick={() => (activeMoodCategory = cat.name)}
				>
					{cat.name}
				</button>
			{/each}
		</div>
		<div class="mood-grid">
			{#each getVisibleMoods() as mood}
				<button
					class="mood-btn"
					class:active={data.mood === mood.id}
					onclick={() => handleChange('mood', mood.id)}
				>
					{mood.label}
				</button>
			{/each}
		</div>
		{#if data.mood}
			<button class="clear-btn" onclick={() => handleChange('mood', '')}> Clear </button>
		{/if}
	</div>

	<!-- Blur / Depth -->
	<div class="field">
		<label for="blur-{id}">Background Blur</label>
		<div class="slider-row">
			<input
				id="blur-{id}"
				type="range"
				min="0"
				max="100"
				value={data.blur || 0}
				oninput={(e) => handleChange('blur', parseInt((e.target as HTMLInputElement).value))}
			/>
			<span class="slider-value">{data.blur || 0}%</span>
		</div>
	</div>

	<!-- Custom Prompt -->
	<div class="field">
		<label for="custom-{id}">Custom Details</label>
		<textarea
			id="custom-{id}"
			class="nodrag"
			value={data.customPrompt}
			oninput={(e) => handleChange('customPrompt', (e.target as HTMLTextAreaElement).value)}
			placeholder="Additional background details..."
			rows={2}
		></textarea>
	</div>

	<!-- Preview Output -->
	<div class="preview">
		<span class="preview-label">Output:</span>
		<div class="preview-value">{backgroundPreview()}</div>
	</div>
</BaseNode>

<style>
	.field {
		display: flex;
		flex-direction: column;
		gap: 4px;
		margin-bottom: var(--space-sm);
	}

	.field label,
	.field-label {
		font-size: 10px;
		color: var(--color-text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.toggle-row {
		display: flex;
		gap: 3px;
	}

	.toggle-row.wrap {
		flex-wrap: wrap;
	}

	.toggle-btn {
		flex: 1;
		min-width: fit-content;
		padding: 5px 6px;
		background-color: var(--color-bg-canvas);
		border: 1px solid var(--color-text-muted);
		border-radius: var(--radius-sm);
		color: var(--color-text-primary);
		cursor: pointer;
		font-size: 9px;
		transition: all var(--transition-fast);
		text-align: center;
	}

	.toggle-btn.small {
		padding: 4px 5px;
		font-size: 8px;
	}

	.toggle-btn:hover {
		border-color: var(--color-node-background, #607d8b);
	}

	.toggle-btn.active {
		background-color: var(--color-node-background, #607d8b);
		border-color: var(--color-node-background, #607d8b);
		color: var(--color-bg-canvas);
	}

	.main-tabs {
		display: flex;
		gap: 2px;
		margin-bottom: 6px;
		background: var(--color-bg-canvas);
		border-radius: var(--radius-sm);
		padding: 2px;
	}

	.main-tab {
		flex: 1;
		padding: 6px 8px;
		font-size: 10px;
		background: transparent;
		border: none;
		color: var(--color-text-muted);
		cursor: pointer;
		border-radius: var(--radius-sm);
		transition: all var(--transition-fast);
		font-weight: 500;
	}

	.main-tab:hover {
		color: var(--color-text-primary);
	}

	.main-tab.active {
		color: var(--color-bg-canvas);
		background: var(--color-node-background, #607d8b);
	}

	.tab-content {
		padding: 6px 0;
	}

	.category-tabs {
		display: flex;
		gap: 2px;
		flex-wrap: wrap;
		margin-bottom: 6px;
	}

	.category-tab {
		padding: 3px 6px;
		font-size: 8px;
		background: transparent;
		border: none;
		color: var(--color-text-muted);
		cursor: pointer;
		border-radius: var(--radius-sm);
		transition: all var(--transition-fast);
	}

	.category-tab:hover {
		color: var(--color-text-primary);
		background: var(--color-bg-canvas);
	}

	.category-tab.active {
		color: var(--color-node-background, #607d8b);
		background: var(--color-bg-canvas);
		font-weight: 600;
	}

	.color-swatches {
		display: flex;
		flex-wrap: wrap;
		gap: 4px;
	}

	.color-swatch {
		width: 28px;
		height: 28px;
		border-radius: 4px;
		border: 2px solid transparent;
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.color-swatch:hover {
		transform: scale(1.1);
	}

	.color-swatch.active {
		border-color: var(--color-node-background, #607d8b);
		box-shadow: 0 0 0 2px var(--color-bg-ui);
	}

	.gradient-swatches {
		display: flex;
		flex-wrap: wrap;
		gap: 4px;
	}

	.gradient-swatch {
		width: 36px;
		height: 22px;
		border-radius: 4px;
		border: 2px solid transparent;
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.gradient-swatch:hover {
		transform: scale(1.05);
	}

	.gradient-swatch.active {
		border-color: var(--color-node-background, #607d8b);
		box-shadow: 0 0 0 2px var(--color-bg-ui);
	}

	.env-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 3px;
	}

	.env-btn {
		padding: 4px 2px;
		font-size: 8px;
		background: var(--color-bg-canvas);
		border: 1px solid var(--color-text-muted);
		border-radius: var(--radius-sm);
		color: var(--color-text-primary);
		cursor: pointer;
		transition: all var(--transition-fast);
		text-align: center;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.env-btn:hover {
		border-color: var(--color-node-background, #607d8b);
	}

	.env-btn.active {
		background: var(--color-node-background, #607d8b);
		border-color: var(--color-node-background, #607d8b);
		color: var(--color-bg-canvas);
	}

	.mood-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 3px;
	}

	.mood-btn {
		padding: 4px 6px;
		font-size: 9px;
		background: var(--color-bg-canvas);
		border: 1px solid var(--color-text-muted);
		border-radius: var(--radius-sm);
		color: var(--color-text-primary);
		cursor: pointer;
		transition: all var(--transition-fast);
		text-align: center;
	}

	.mood-btn:hover {
		border-color: var(--color-node-background, #607d8b);
	}

	.mood-btn.active {
		background: var(--color-node-background, #607d8b);
		border-color: var(--color-node-background, #607d8b);
		color: var(--color-bg-canvas);
	}

	.clear-btn {
		margin-top: 4px;
		padding: 3px 6px;
		font-size: 8px;
		background: transparent;
		border: 1px dashed var(--color-text-muted);
		border-radius: var(--radius-sm);
		color: var(--color-text-muted);
		cursor: pointer;
		transition: all var(--transition-fast);
		align-self: flex-start;
	}

	.clear-btn:hover {
		border-color: var(--color-text-secondary);
		color: var(--color-text-secondary);
	}

	.slider-row {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.slider-row input[type='range'] {
		flex: 1;
		height: 4px;
		-webkit-appearance: none;
		appearance: none;
		background: var(--color-text-muted);
		border-radius: 2px;
		outline: none;
	}

	.slider-row input[type='range']::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 12px;
		height: 12px;
		background: var(--color-node-background, #607d8b);
		border-radius: 50%;
		cursor: pointer;
	}

	.slider-value {
		font-size: 9px;
		color: var(--color-text-secondary);
		min-width: 28px;
		text-align: right;
	}

	.field select {
		padding: 5px 8px;
		font-size: 11px;
	}

	.field textarea {
		resize: vertical;
		min-height: 40px;
		font-size: 10px;
	}

	.preview {
		margin-top: var(--space-sm);
		padding: var(--space-sm);
		background-color: var(--color-bg-canvas);
		border-radius: var(--radius-sm);
		font-size: 10px;
	}

	.preview-label {
		color: var(--color-text-secondary);
		display: block;
		margin-bottom: 2px;
		font-size: 9px;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.preview-value {
		color: var(--color-node-background, #607d8b);
		font-family: var(--font-mono);
		font-size: 9px;
		word-break: break-word;
		line-height: 1.4;
	}
</style>
