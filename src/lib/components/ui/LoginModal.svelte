<script lang="ts">
	import { auth, isLoggedIn, isAuthLoading } from '$lib/stores/auth';

	interface Props {
		isOpen: boolean;
		onClose: () => void;
	}

	let { isOpen, onClose }: Props = $props();

	let mode = $state<'signin' | 'signup'>('signin');
	let email = $state('');
	let password = $state('');
	let confirmPassword = $state('');
	let isSubmitting = $state(false);
	let errorMessage = $state('');

	async function handleSubmit(e: Event) {
		e.preventDefault();
		errorMessage = '';

		if (!email || !password) {
			errorMessage = 'Please fill in all fields';
			return;
		}

		if (mode === 'signup' && password !== confirmPassword) {
			errorMessage = 'Passwords do not match';
			return;
		}

		if (password.length < 6) {
			errorMessage = 'Password must be at least 6 characters';
			return;
		}

		isSubmitting = true;

		try {
			if (mode === 'signin') {
				const { error } = await auth.signInWithEmail(email, password);
				if (!error) {
					onClose();
					resetForm();
				}
			} else {
				const { error } = await auth.signUpWithEmail(email, password);
				if (!error) {
					// Don't close - show message about email confirmation
					mode = 'signin';
				}
			}
		} finally {
			isSubmitting = false;
		}
	}

	function resetForm() {
		email = '';
		password = '';
		confirmPassword = '';
		errorMessage = '';
	}

	function handleClose() {
		resetForm();
		onClose();
	}

	function switchMode() {
		mode = mode === 'signin' ? 'signup' : 'signin';
		errorMessage = '';
	}
</script>

{#if isOpen}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<div
		class="modal-overlay"
		onclick={handleClose}
		onkeydown={(e) => e.key === 'Escape' && handleClose()}
	>
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<div
			class="modal"
			onclick={(e) => e.stopPropagation()}
			role="dialog"
			aria-modal="true"
			tabindex="-1"
		>
			<button class="close-btn" onclick={handleClose} aria-label="Close">×</button>

			<h2>{mode === 'signin' ? 'Sign In' : 'Create Account'}</h2>

			<form onsubmit={handleSubmit}>
				{#if errorMessage}
					<div class="error-message">{errorMessage}</div>
				{/if}

				<div class="form-group">
					<label for="email">Email</label>
					<input
						type="email"
						id="email"
						bind:value={email}
						placeholder="you@example.com"
						disabled={isSubmitting}
						required
					/>
				</div>

				<div class="form-group">
					<label for="password">Password</label>
					<input
						type="password"
						id="password"
						bind:value={password}
						placeholder="••••••••"
						disabled={isSubmitting}
						required
						minlength="6"
					/>
				</div>

				{#if mode === 'signup'}
					<div class="form-group">
						<label for="confirmPassword">Confirm Password</label>
						<input
							type="password"
							id="confirmPassword"
							bind:value={confirmPassword}
							placeholder="••••••••"
							disabled={isSubmitting}
							required
						/>
					</div>
				{/if}

				<button type="submit" class="submit-btn" disabled={isSubmitting}>
					{#if isSubmitting}
						<span class="spinner"></span>
					{/if}
					{mode === 'signin' ? 'Sign In' : 'Create Account'}
				</button>
			</form>

			<div class="divider">
				<span>or</span>
			</div>

			<div class="oauth-buttons">
				<button class="oauth-btn google" onclick={() => auth.signInWithProvider('google')}>
					<svg viewBox="0 0 24 24" width="18" height="18">
						<path
							fill="currentColor"
							d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
						/>
						<path
							fill="currentColor"
							d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
						/>
						<path
							fill="currentColor"
							d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
						/>
						<path
							fill="currentColor"
							d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
						/>
					</svg>
					Continue with Google
				</button>

				<button class="oauth-btn github" onclick={() => auth.signInWithProvider('github')}>
					<svg viewBox="0 0 24 24" width="18" height="18">
						<path
							fill="currentColor"
							d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
						/>
					</svg>
					Continue with GitHub
				</button>
			</div>

			<p class="switch-mode">
				{mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}
				<button type="button" onclick={switchMode}>
					{mode === 'signin' ? 'Sign up' : 'Sign in'}
				</button>
			</p>
		</div>
	</div>
{/if}

<style>
	.modal-overlay {
		position: fixed;
		inset: 0;
		background-color: rgba(0, 0, 0, 0.7);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 10000;
		backdrop-filter: blur(4px);
	}

	.modal {
		background-color: var(--color-bg-ui);
		border-radius: var(--radius-lg);
		padding: var(--space-xl);
		max-width: 400px;
		width: 90%;
		position: relative;
		border: 1px solid var(--color-text-muted);
	}

	.close-btn {
		position: absolute;
		top: var(--space-sm);
		right: var(--space-sm);
		background: transparent;
		border: none;
		color: var(--color-text-muted);
		font-size: 24px;
		cursor: pointer;
		width: 32px;
		height: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: var(--radius-sm);
	}

	.close-btn:hover {
		color: var(--color-text-primary);
		background-color: var(--color-bg-canvas);
	}

	h2 {
		margin: 0 0 var(--space-lg);
		font-size: var(--text-xl);
		color: var(--color-text-primary);
		text-align: center;
	}

	form {
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
	}

	label {
		font-size: var(--text-sm);
		color: var(--color-text-secondary);
	}

	input {
		padding: var(--space-sm) var(--space-md);
		background-color: var(--color-bg-canvas);
		border: 1px solid var(--color-text-muted);
		border-radius: var(--radius-md);
		color: var(--color-text-primary);
		font-size: var(--text-base);
	}

	input:focus {
		outline: none;
		border-color: var(--color-node-product);
	}

	input:disabled {
		opacity: 0.6;
	}

	.error-message {
		padding: var(--space-sm) var(--space-md);
		background-color: rgba(255, 107, 107, 0.1);
		border: 1px solid var(--color-error);
		border-radius: var(--radius-md);
		color: var(--color-error);
		font-size: var(--text-sm);
	}

	.submit-btn {
		padding: var(--space-md);
		background: linear-gradient(135deg, var(--color-node-product), var(--color-node-refine));
		border: none;
		border-radius: var(--radius-md);
		color: var(--color-bg-canvas);
		font-weight: var(--font-bold);
		font-size: var(--text-base);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-sm);
		transition: all var(--transition-fast);
	}

	.submit-btn:hover:not(:disabled) {
		transform: scale(1.02);
	}

	.submit-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.spinner {
		width: 16px;
		height: 16px;
		border: 2px solid rgba(255, 255, 255, 0.3);
		border-top-color: white;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.divider {
		display: flex;
		align-items: center;
		margin: var(--space-lg) 0;
		gap: var(--space-md);
	}

	.divider::before,
	.divider::after {
		content: '';
		flex: 1;
		height: 1px;
		background-color: var(--color-text-muted);
	}

	.divider span {
		color: var(--color-text-muted);
		font-size: var(--text-sm);
	}

	.oauth-buttons {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
	}

	.oauth-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-sm);
		padding: var(--space-sm) var(--space-md);
		border: 1px solid var(--color-text-muted);
		border-radius: var(--radius-md);
		background-color: transparent;
		color: var(--color-text-primary);
		font-size: var(--text-sm);
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.oauth-btn:hover {
		background-color: var(--color-bg-canvas);
		border-color: var(--color-text-secondary);
	}

	.switch-mode {
		text-align: center;
		margin-top: var(--space-lg);
		font-size: var(--text-sm);
		color: var(--color-text-secondary);
	}

	.switch-mode button {
		background: transparent;
		border: none;
		color: var(--color-node-product);
		cursor: pointer;
		font-size: var(--text-sm);
		padding: 0;
	}

	.switch-mode button:hover {
		text-decoration: underline;
	}
</style>
