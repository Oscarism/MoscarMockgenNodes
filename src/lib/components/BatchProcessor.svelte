<script lang="ts">
	import {
		modeState,
		type GenerationMode,
		type PhotographyPreset,
		MODE_LABELS,
		PRESET_LABELS
	} from '$lib/stores/generationMode';
	import { uploadImageToHost } from '$lib/services/imageHost';

	// Batch queue item type
	interface BatchQueueItem {
		id: string;
		file: File;
		previewUrl: string;
		hostedUrl?: string;
		status: 'pending' | 'uploading' | 'processing' | 'complete' | 'error';
		resultUrl?: string;
		error?: string;
	}

	// Component state
	let items = $state<BatchQueueItem[]>([]);
	let prompt = $state('');
	let isProcessing = $state(false);
	let currentIndex = $state(-1);
	let isDragOver = $state(false);

	// Mode options
	const modes: GenerationMode[] = ['product', 'photography', 'alteration'];
	const presets: PhotographyPreset[] = [
		'none',
		'portrait',
		'landscape',
		'macro',
		'street',
		'fashion',
		'food',
		'architecture',
		'wildlife'
	];

	// Generate unique ID
	function generateId(): string {
		return `batch-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
	}

	// Handle file selection
	function handleFiles(files: FileList | File[]) {
		const fileArray = Array.from(files);

		for (const file of fileArray) {
			if (!file.type.startsWith('image/')) continue;

			const newItem: BatchQueueItem = {
				id: generateId(),
				file,
				previewUrl: URL.createObjectURL(file),
				status: 'pending'
			};

			items = [...items, newItem];
		}
	}

	// Handle drag events
	function handleDragOver(event: DragEvent) {
		event.preventDefault();
		isDragOver = true;
	}

	function handleDragLeave() {
		isDragOver = false;
	}

	function handleDrop(event: DragEvent) {
		event.preventDefault();
		isDragOver = false;

		if (event.dataTransfer?.files) {
			handleFiles(event.dataTransfer.files);
		}
	}

	// Handle file input change
	function handleInputChange(event: Event) {
		const input = event.target as HTMLInputElement;
		if (input.files) {
			handleFiles(input.files);
		}
		// Reset input so same file can be selected again
		input.value = '';
	}

	// Remove item from queue
	function removeItem(id: string) {
		const item = items.find((i) => i.id === id);
		if (item) {
			URL.revokeObjectURL(item.previewUrl);
		}
		items = items.filter((i) => i.id !== id);
	}

	// Clear all items
	function clearAll() {
		for (const item of items) {
			URL.revokeObjectURL(item.previewUrl);
		}
		items = [];
	}

	// Update item in queue
	function updateItem(id: string, updates: Partial<BatchQueueItem>) {
		items = items.map((item) => (item.id === id ? { ...item, ...updates } : item));
	}

	// Process the batch queue
	async function processBatch() {
		if (isProcessing || items.length === 0 || !prompt.trim()) return;

		isProcessing = true;
		currentIndex = 0;

		for (let i = 0; i < items.length; i++) {
			currentIndex = i;
			const item = items[i];

			try {
				// Upload image
				updateItem(item.id, { status: 'uploading' });
				const hostedUrl = await uploadImageToHost(item.file);
				updateItem(item.id, { hostedUrl, status: 'processing' });

				// TODO: Call generation API with the uploaded image and prompt
				// For now, simulate processing
				await new Promise((resolve) => setTimeout(resolve, 1000));

				updateItem(item.id, {
					status: 'complete',
					resultUrl: hostedUrl // Placeholder - should be actual result
				});
			} catch (error) {
				updateItem(item.id, {
					status: 'error',
					error: error instanceof Error ? error.message : 'Unknown error'
				});
			}
		}

		isProcessing = false;
		currentIndex = -1;
	}

	// Mode handlers
	function handleModeChange(mode: GenerationMode) {
		modeState.setMode(mode);
	}

	function handlePresetChange(event: Event) {
		const preset = (event.target as HTMLSelectElement).value as PhotographyPreset;
		modeState.setPhotographyPreset(preset);
	}

	// Computed stats
	let completedCount = $derived(items.filter((i) => i.status === 'complete').length);
	let errorCount = $derived(items.filter((i) => i.status === 'error').length);
	let pendingCount = $derived(items.filter((i) => i.status === 'pending').length);
</script>

<div class="batch-processor">
	<div class="header">
		<h2>Batch Image Processor</h2>
		<p class="subtitle">Process multiple images with a single prompt</p>
	</div>

	<!-- Mode Selector -->
	<div class="mode-section">
		<span class="label">Mode</span>
		<div class="mode-tabs">
			{#each modes as mode}
				<button
					class="mode-tab"
					class:active={$modeState.mode === mode}
					onclick={() => handleModeChange(mode)}
				>
					{MODE_LABELS[mode]}
				</button>
			{/each}
		</div>
	</div>

	<!-- Photography Preset -->
	{#if $modeState.mode === 'photography'}
		<div class="preset-section">
			<label for="batch-preset">Style Preset</label>
			<select id="batch-preset" value={$modeState.photographyPreset} onchange={handlePresetChange}>
				{#each presets as preset}
					<option value={preset}>{PRESET_LABELS[preset]}</option>
				{/each}
			</select>
		</div>
	{/if}

	<!-- Prompt Input -->
	<div class="prompt-section">
		<label for="batch-prompt">Prompt (applies to all images)</label>
		<textarea
			id="batch-prompt"
			bind:value={prompt}
			placeholder="Enter the prompt that will be applied to all images..."
			rows="3"
		></textarea>
	</div>

	<!-- Drop Zone -->
	<div
		class="drop-zone"
		class:drag-over={isDragOver}
		class:has-items={items.length > 0}
		ondragover={handleDragOver}
		ondragleave={handleDragLeave}
		ondrop={handleDrop}
		role="button"
		tabindex="0"
	>
		{#if items.length === 0}
			<div class="drop-content">
				<span class="drop-icon">📁</span>
				<p>Drag & drop images here</p>
				<span class="drop-or">or</span>
				<label class="browse-btn">
					Browse Files
					<input type="file" accept="image/*" multiple onchange={handleInputChange} hidden />
				</label>
			</div>
		{:else}
			<!-- Thumbnail Grid -->
			<div class="thumbnail-grid">
				{#each items as item (item.id)}
					<div
						class="thumbnail"
						class:processing={item.status === 'processing' || item.status === 'uploading'}
						class:complete={item.status === 'complete'}
						class:error={item.status === 'error'}
					>
						<img src={item.previewUrl} alt="Queue item" />
						<button class="remove-btn" onclick={() => removeItem(item.id)} aria-label="Remove"
							>×</button
						>
						{#if item.status === 'uploading'}
							<div class="status-badge uploading">Uploading...</div>
						{:else if item.status === 'processing'}
							<div class="status-badge processing">Processing...</div>
						{:else if item.status === 'complete'}
							<div class="status-badge complete">✓</div>
						{:else if item.status === 'error'}
							<div class="status-badge error" title={item.error}>✗</div>
						{/if}
					</div>
				{/each}

				<!-- Add More Button -->
				<label class="add-more-btn">
					<span>+</span>
					<input type="file" accept="image/*" multiple onchange={handleInputChange} hidden />
				</label>
			</div>
		{/if}
	</div>

	<!-- Stats & Actions -->
	{#if items.length > 0}
		<div class="stats-bar">
			<div class="stats">
				<span class="stat">{items.length} images</span>
				{#if completedCount > 0}
					<span class="stat complete">{completedCount} done</span>
				{/if}
				{#if errorCount > 0}
					<span class="stat error">{errorCount} failed</span>
				{/if}
			</div>
			<button class="clear-btn" onclick={clearAll} disabled={isProcessing}> Clear All </button>
		</div>

		<!-- Progress Bar -->
		{#if isProcessing}
			<div class="progress-section">
				<div class="progress-bar">
					<div
						class="progress-fill"
						style="width: {((currentIndex + 1) / items.length) * 100}%"
					></div>
				</div>
				<span class="progress-text">Processing {currentIndex + 1} of {items.length}</span>
			</div>
		{/if}

		<!-- Process Button -->
		<button class="process-btn" onclick={processBatch} disabled={isProcessing || !prompt.trim()}>
			{#if isProcessing}
				<span class="spinner"></span>
				Processing...
			{:else}
				Process All Images
			{/if}
		</button>
	{/if}
</div>

<style>
	.batch-processor {
		background: var(--color-bg-ui);
		border-radius: var(--radius-lg);
		padding: var(--space-xl);
		max-width: 600px;
		margin: 0 auto;
	}

	.header {
		text-align: center;
		margin-bottom: var(--space-lg);
	}

	.header h2 {
		color: var(--color-text-primary);
		margin: 0 0 var(--space-xs);
	}

	.subtitle {
		color: var(--color-text-muted);
		font-size: var(--text-sm);
		margin: 0;
	}

	.label {
		font-size: var(--text-xs);
		color: var(--color-text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	/* Mode Selector */
	.mode-section {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
		margin-bottom: var(--space-md);
	}

	.mode-tabs {
		display: flex;
		gap: 2px;
		background: var(--color-bg-canvas);
		border-radius: var(--radius-sm);
		padding: 2px;
	}

	.mode-tab {
		flex: 1;
		padding: 8px 12px;
		font-size: 12px;
		background: transparent;
		border: none;
		color: var(--color-text-muted);
		cursor: pointer;
		border-radius: var(--radius-sm);
		transition: all var(--transition-fast);
		font-weight: 500;
	}

	.mode-tab:hover {
		color: var(--color-text-primary);
	}

	.mode-tab.active {
		color: var(--color-bg-canvas);
		background: var(--color-node-output);
	}

	/* Preset Section */
	.preset-section {
		display: flex;
		flex-direction: column;
		gap: var(--space-xs);
		margin-bottom: var(--space-md);
	}

	.preset-section label {
		font-size: var(--text-xs);
		color: var(--color-text-secondary);
	}

	.preset-section select {
		padding: 8px 12px;
		font-size: var(--text-sm);
		background-color: var(--color-bg-canvas);
		border: 1px solid var(--color-text-muted);
		border-radius: var(--radius-sm);
		color: var(--color-text-primary);
		cursor: pointer;
	}

	/* Prompt Section */
	.prompt-section {
		display: flex;
		flex-direction: column;
		gap: var(--space-xs);
		margin-bottom: var(--space-md);
	}

	.prompt-section label {
		font-size: var(--text-xs);
		color: var(--color-text-secondary);
	}

	.prompt-section textarea {
		width: 100%;
		padding: var(--space-md);
		background: var(--color-bg-canvas);
		border: 1px solid var(--color-text-muted);
		border-radius: var(--radius-md);
		color: var(--color-text-primary);
		font-size: var(--text-sm);
		resize: vertical;
		min-height: 80px;
	}

	.prompt-section textarea:focus {
		outline: none;
		border-color: var(--color-node-output);
	}

	/* Drop Zone */
	.drop-zone {
		border: 2px dashed var(--color-text-muted);
		border-radius: var(--radius-lg);
		padding: var(--space-xl);
		text-align: center;
		transition: all var(--transition-fast);
		min-height: 200px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.drop-zone.drag-over {
		border-color: var(--color-node-output);
		background: rgba(254, 110, 110, 0.1);
	}

	.drop-zone.has-items {
		padding: var(--space-md);
		display: block;
	}

	.drop-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-sm);
		color: var(--color-text-muted);
	}

	.drop-icon {
		font-size: 48px;
	}

	.drop-or {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
	}

	.browse-btn {
		padding: 8px 16px;
		background: var(--color-node-output);
		color: var(--color-bg-canvas);
		border-radius: var(--radius-sm);
		cursor: pointer;
		font-weight: 500;
		font-size: var(--text-sm);
	}

	.browse-btn:hover {
		opacity: 0.9;
	}

	/* Thumbnail Grid */
	.thumbnail-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
		gap: var(--space-sm);
	}

	.thumbnail {
		position: relative;
		aspect-ratio: 1;
		border-radius: var(--radius-sm);
		overflow: hidden;
		background: var(--color-bg-canvas);
	}

	.thumbnail img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.thumbnail.processing {
		opacity: 0.7;
	}

	.thumbnail.complete {
		box-shadow: 0 0 0 2px var(--color-success);
	}

	.thumbnail.error {
		box-shadow: 0 0 0 2px var(--color-error);
	}

	.remove-btn {
		position: absolute;
		top: 4px;
		right: 4px;
		width: 20px;
		height: 20px;
		border-radius: 50%;
		background: rgba(0, 0, 0, 0.7);
		color: white;
		border: none;
		cursor: pointer;
		font-size: 14px;
		line-height: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		opacity: 0;
		transition: opacity var(--transition-fast);
	}

	.thumbnail:hover .remove-btn {
		opacity: 1;
	}

	.status-badge {
		position: absolute;
		bottom: 4px;
		left: 4px;
		padding: 2px 6px;
		border-radius: var(--radius-sm);
		font-size: 9px;
		font-weight: 600;
		color: white;
	}

	.status-badge.uploading {
		background: var(--color-warning);
	}

	.status-badge.processing {
		background: var(--color-node-quality);
	}

	.status-badge.complete {
		background: var(--color-success);
	}

	.status-badge.error {
		background: var(--color-error);
	}

	.add-more-btn {
		aspect-ratio: 1;
		border: 2px dashed var(--color-text-muted);
		border-radius: var(--radius-sm);
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		color: var(--color-text-muted);
		font-size: 24px;
		transition: all var(--transition-fast);
	}

	.add-more-btn:hover {
		border-color: var(--color-node-output);
		color: var(--color-node-output);
	}

	/* Stats Bar */
	.stats-bar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-top: var(--space-md);
		padding: var(--space-sm) 0;
	}

	.stats {
		display: flex;
		gap: var(--space-md);
	}

	.stat {
		font-size: var(--text-xs);
		color: var(--color-text-secondary);
	}

	.stat.complete {
		color: var(--color-success);
	}

	.stat.error {
		color: var(--color-error);
	}

	.clear-btn {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		background: none;
		border: none;
		cursor: pointer;
		text-decoration: underline;
	}

	.clear-btn:hover:not(:disabled) {
		color: var(--color-text-primary);
	}

	.clear-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	/* Progress Section */
	.progress-section {
		margin-top: var(--space-md);
	}

	.progress-bar {
		height: 4px;
		background: var(--color-bg-canvas);
		border-radius: 2px;
		overflow: hidden;
	}

	.progress-fill {
		height: 100%;
		background: var(--color-node-output);
		transition: width var(--transition-fast);
	}

	.progress-text {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		display: block;
		margin-top: var(--space-xs);
		text-align: center;
	}

	/* Process Button */
	.process-btn {
		width: 100%;
		padding: var(--space-md);
		margin-top: var(--space-md);
		background: var(--color-node-output);
		border: none;
		border-radius: var(--radius-md);
		color: var(--color-bg-canvas);
		font-weight: 600;
		font-size: var(--text-md);
		cursor: pointer;
		transition: all var(--transition-fast);
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-sm);
	}

	.process-btn:hover:not(:disabled) {
		transform: scale(1.02);
		box-shadow: 0 0 20px rgba(254, 110, 110, 0.4);
	}

	.process-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.spinner {
		width: 16px;
		height: 16px;
		border: 2px solid var(--color-bg-canvas);
		border-top-color: transparent;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
