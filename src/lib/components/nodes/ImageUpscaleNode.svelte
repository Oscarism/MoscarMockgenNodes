<script lang="ts">
	import BaseNode from './BaseNode.svelte';
	import type { UpscaleNodeData } from '$lib/types';
	import { updateNodeData, addNode, addEdge } from '$lib/stores/canvas';
	import { upscaleImage, urlToFile, getImageBlobUrl } from '$lib/comfyui/comfyui';
	import { toasts } from '$lib/stores/toasts';
	import { generationState } from '$lib/stores/generation';
	import { user, isLoggedIn } from '$lib/stores/auth';
	import { IMAGE_SLOT_COLORS } from '$lib/types';

	interface Props {
		id: string;
		data: UpscaleNodeData;
	}

	let { id, data }: Props = $props();
	let fileInput: HTMLInputElement;

	// Resolution options
	const resolutions = [
		{ value: 4000, label: '4K' },
		{ value: 5000, label: '5K' },
		{ value: 6000, label: '6K' }
	] as const;

	// Upload to Supabase for permanent storage
	async function uploadToSupabase(file: File): Promise<string> {
		const formData = new FormData();
		formData.append('file', file);
		formData.append('userId', $user?.id || '');

		const response = await fetch('/api/upload', {
			method: 'POST',
			body: formData
		});

		if (!response.ok) {
			throw new Error('Failed to upload to cloud storage');
		}

		const result = await response.json();
		return result.publicUrl;
	}

	// Handle file upload
	async function handleFileSelect(event: Event) {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		// Validate file type
		if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
			toasts.error('Please upload JPEG, PNG, or WebP images only');
			return;
		}

		// Validate file size (max 20MB)
		if (file.size > 20 * 1024 * 1024) {
			toasts.error('File size must be under 20MB');
			return;
		}

		// Create preview
		const previewUrl = URL.createObjectURL(file);

		updateNodeData(id, {
			inputImageUrl: previewUrl,
			inputFile: file,
			status: 'idle',
			progress: '',
			progressPercent: 0,
			outputImageUrl: undefined,
			error: undefined
		});

		input.value = '';
	}

	// Handle URL input (from ImageLightbox)
	async function handleUrlInput(imageUrl: string) {
		updateNodeData(id, {
			inputImageUrl: imageUrl,
			status: 'idle',
			progress: 'Loading image...',
			progressPercent: 0
		});

		try {
			const file = await urlToFile(imageUrl, 'input.png');
			updateNodeData(id, {
				inputFile: file,
				progress: ''
			});
		} catch (error) {
			toasts.error('Failed to load image');
			updateNodeData(id, {
				status: 'error',
				error: 'Failed to load image'
			});
		}
	}

	// Start upscaling
	async function startUpscale() {
		if (!data.inputFile) {
			toasts.error('Please upload an image first');
			return;
		}

		updateNodeData(id, {
			status: 'processing',
			progress: 'Starting upscale...',
			progressPercent: 0,
			error: undefined
		});

		toasts.info(
			`Starting ${data.resolution === 4000 ? '4K' : data.resolution === 5000 ? '5K' : '6K'} upscale...`
		);

		try {
			const result = await upscaleImage(data.inputFile, data.resolution, (status, percent) => {
				updateNodeData(id, {
					progress: status,
					progressPercent: percent || 0
				});
			});

			if (!result.success || !result.imageUrl) {
				throw new Error(result.error || 'Upscale failed');
			}

			// Get the image as a blob URL for display
			const blobUrl = await getImageBlobUrl(result.imageUrl);

			// Upload to Supabase for permanent storage if logged in
			let finalUrl = result.imageUrl;
			if ($isLoggedIn) {
				try {
					const response = await fetch(blobUrl);
					const blob = await response.blob();
					const file = new File([blob], 'upscaled.png', { type: 'image/png' });
					finalUrl = await uploadToSupabase(file);
					toasts.success('Upscaled image saved to cloud');
				} catch (error) {
					console.warn('Failed to save to cloud, using temporary URL:', error);
					finalUrl = blobUrl;
				}
			} else {
				finalUrl = blobUrl;
			}

			updateNodeData(id, {
				status: 'complete',
				progress: 'Complete!',
				progressPercent: 100,
				outputImageUrl: finalUrl
			});

			// Add to generation state AND generation history (for model label tracking)
			generationState.update((state) => ({
				...state,
				generatedImages: [...state.generatedImages, finalUrl]
			}));

			// Create history record with unique ID
			const upscaleId = `upscale-${Date.now()}`;
			const historyRecord = {
				id: upscaleId,
				timestamp: Date.now(),
				prompt: `Upscaled to ${data.resolution}`,
				aspectRatio: '1:1' as const,
				quality: 'high' as const,
				taskId: upscaleId,
				state: 'success' as const,
				model: 'comfyui-upscale' as const,
				resultUrls: [finalUrl]
			};

			// Add to generation history so the lightbox shows correct model label
			const { generationHistory } = await import('$lib/stores/generation');
			generationHistory.update((h) => [historyRecord, ...h]);

			// Save to database for logged-in users
			if ($isLoggedIn && $user) {
				try {
					const { saveGeneration, updateGeneration } = await import('$lib/services/database');
					const dbId = await saveGeneration($user.id, historyRecord);
					if (dbId) {
						console.log('[Upscale] Saved to database with ID:', dbId);
						// Update with the permanent URL
						await updateGeneration(upscaleId, 'success', [finalUrl]);
						console.log('[Upscale] Updated database with permanent URL');
					}
				} catch (dbError) {
					console.error('[Upscale] Failed to save to database:', dbError);
				}
			}

			toasts.success('Image upscaled successfully!');

			// Auto-create Compare node with proper ID
			const compareNodeId = addNode('compare', { x: 600, y: 100 });

			// Update the compare node with both images using the ACTUAL returned ID
			setTimeout(() => {
				updateNodeData(compareNodeId, {
					originalImageUrl: data.inputImageUrl,
					upscaledImageUrl: finalUrl,
					sliderPosition: 50
				});
			}, 100);
		} catch (error) {
			console.error('Upscale error:', error);
			const errorMessage = error instanceof Error ? error.message : 'Unknown error';
			updateNodeData(id, {
				status: 'error',
				progress: '',
				error: errorMessage
			});
			toasts.error(`Upscale failed: ${errorMessage}`);
		}
	}

	// Set resolution
	function setResolution(res: 4000 | 5000 | 6000) {
		updateNodeData(id, { resolution: res });
	}

	// Reset node
	function resetNode() {
		if (data.inputImageUrl?.startsWith('blob:')) {
			URL.revokeObjectURL(data.inputImageUrl);
		}
		if (data.outputImageUrl?.startsWith('blob:')) {
			URL.revokeObjectURL(data.outputImageUrl);
		}
		updateNodeData(id, {
			inputImageUrl: undefined,
			inputFile: undefined,
			status: 'idle',
			progress: '',
			progressPercent: 0,
			outputImageUrl: undefined,
			error: undefined
		});
	}
</script>

<BaseNode {id} nodeType="upscale">
	{#if data.status === 'idle' && !data.inputImageUrl}
		<!-- Upload State -->
		<label class="dropzone">
			<input
				type="file"
				accept="image/jpeg,image/png,image/webp"
				onchange={handleFileSelect}
				bind:this={fileInput}
			/>
			<div class="dropzone-content">
				<span class="upload-text">Drop image or click to upload</span>
			</div>
		</label>
	{:else if data.status === 'processing'}
		<!-- Processing State -->
		<div class="processing">
			<div class="image-preview">
				<img src={data.inputImageUrl} alt="Processing" />
			</div>
			<div class="progress-container">
				<div class="progress-bar">
					<div class="progress-fill" style="width: {data.progressPercent}%"></div>
				</div>
				<span class="progress-text">{data.progress}</span>
			</div>
		</div>
	{:else if data.status === 'complete' && data.outputImageUrl}
		<!-- Complete State -->
		<div class="complete">
			<div class="result-preview">
				<img src={data.outputImageUrl} alt="Upscaled" />
				<div class="complete-badge">✓ Complete</div>
			</div>
			<div class="actions">
				<a href={data.outputImageUrl} download="upscaled.png" class="btn primary"> Download </a>
				<button class="btn secondary" onclick={resetNode}> New Image </button>
			</div>
		</div>
	{:else if data.status === 'error'}
		<!-- Error State -->
		<div class="error-state">
			<span class="error-text">{data.error || 'An error occurred'}</span>
			<button class="btn secondary" onclick={resetNode}> Try Again </button>
		</div>
	{:else}
		<!-- Preview State (has image, ready to upscale) -->
		<div class="preview-state">
			<div class="image-preview">
				<img src={data.inputImageUrl} alt="Input" />
				<button class="remove-btn" onclick={resetNode}>×</button>
			</div>
			<div class="resolution-selector">
				<span class="label">Resolution</span>
				<div class="resolution-buttons">
					{#each resolutions as res}
						<button
							class="res-btn"
							class:active={data.resolution === res.value}
							onclick={() => setResolution(res.value)}
						>
							{res.label}
						</button>
					{/each}
				</div>
			</div>
			<button class="btn primary upscale-btn" onclick={startUpscale}>
				Upscale to {data.resolution === 4000 ? '4K' : data.resolution === 5000 ? '5K' : '6K'}
			</button>
		</div>
	{/if}
</BaseNode>

<style>
	.dropzone {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 120px;
		border: 2px dashed var(--color-node-upscale, #00ced1);
		border-radius: var(--radius-md);
		cursor: pointer;
		transition: all 0.2s;
		background: rgba(0, 206, 209, 0.05);
	}

	.dropzone:hover {
		background: rgba(0, 206, 209, 0.1);
		border-color: var(--color-node-upscale);
	}

	.dropzone input {
		display: none;
	}

	.dropzone-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-sm);
		color: var(--color-text-muted);
	}

	.upload-text {
		font-size: var(--text-sm);
	}

	.image-preview {
		position: relative;
		width: 100%;
		aspect-ratio: 1;
		border-radius: var(--radius-md);
		overflow: hidden;
		border: 2px solid var(--color-node-upscale);
	}

	.image-preview img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.remove-btn {
		position: absolute;
		top: 4px;
		right: 4px;
		width: 24px;
		height: 24px;
		border-radius: 50%;
		background: rgba(0, 0, 0, 0.7);
		border: none;
		color: white;
		font-size: 14px;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.remove-btn:hover {
		background: var(--color-error);
	}

	.resolution-selector {
		margin: var(--space-sm) 0;
	}

	.label {
		display: block;
		font-size: var(--text-xs);
		color: var(--color-text-secondary);
		text-transform: uppercase;
		margin-bottom: var(--space-tiny);
	}

	.resolution-buttons {
		display: flex;
		gap: var(--space-tiny);
	}

	.res-btn {
		flex: 1;
		padding: 6px 12px;
		border-radius: var(--radius-sm);
		border: 1px solid var(--color-text-muted);
		background: transparent;
		color: var(--color-text-primary);
		font-size: var(--text-sm);
		cursor: pointer;
		transition: all 0.2s;
	}

	.res-btn:hover {
		border-color: var(--color-node-upscale);
	}

	.res-btn.active {
		background: var(--color-node-upscale, #00ced1);
		border-color: var(--color-node-upscale, #00ced1);
		color: #000;
		font-weight: var(--font-medium);
	}

	.btn {
		width: 100%;
		padding: 10px 16px;
		border-radius: var(--radius-md);
		font-size: var(--text-sm);
		font-weight: var(--font-medium);
		cursor: pointer;
		border: none;
		transition: all 0.2s;
		text-align: center;
		text-decoration: none;
		display: block;
	}

	.btn.primary {
		background: var(--color-node-product, #c9fe6e);
		color: #000;
	}

	.btn.primary:hover {
		transform: scale(1.02);
		box-shadow: 0 4px 12px rgba(201, 254, 110, 0.3);
	}

	.btn.secondary {
		background: var(--color-node-upscale, #00ced1);
		border: none;
		color: #000;
	}

	.btn.secondary:hover {
		transform: scale(1.02);
		box-shadow: 0 4px 12px rgba(0, 206, 209, 0.3);
	}

	.upscale-btn {
		margin-top: var(--space-sm);
	}

	.processing {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
	}

	.progress-container {
		padding: var(--space-sm);
		background: var(--color-bg-canvas);
		border-radius: var(--radius-sm);
	}

	.progress-bar {
		height: 8px;
		background: rgba(255, 255, 255, 0.1);
		border-radius: 4px;
		overflow: hidden;
		margin-bottom: var(--space-tiny);
	}

	.progress-fill {
		height: 100%;
		background: var(--color-node-upscale);
		transition: width 0.3s ease;
	}

	.progress-text {
		font-size: var(--text-xs);
		color: var(--color-text-secondary);
	}

	.complete {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
	}

	.result-preview {
		position: relative;
	}

	.result-preview img {
		width: 100%;
		border-radius: var(--radius-md);
	}

	.complete-badge {
		position: absolute;
		bottom: 8px;
		left: 8px;
		padding: 4px 8px;
		background: var(--color-success);
		color: #000;
		font-size: var(--text-xs);
		font-weight: var(--font-medium);
		border-radius: var(--radius-sm);
	}

	.actions {
		display: flex;
		gap: var(--space-sm);
	}

	.actions .btn {
		flex: 1;
	}

	.error-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-sm);
		padding: var(--space-md);
		text-align: center;
	}

	.error-text {
		font-size: var(--text-sm);
		color: var(--color-error);
	}
</style>
