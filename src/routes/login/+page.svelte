<script lang="ts">
	import { auth, isLoggedIn, isAuthLoading } from '$lib/stores/auth';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	let mode = $state<'signin' | 'signup'>('signin');
	let email = $state('');
	let password = $state('');
	let confirmPassword = $state('');
	let isSubmitting = $state(false);
	let errorMessage = $state('');

	// Redirect if already logged in
	onMount(() => {
		const unsubscribe = isLoggedIn.subscribe((loggedIn) => {
			if (loggedIn) {
				goto('/');
			}
		});
		return unsubscribe;
	});

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
					goto('/');
				}
			} else {
				const { error } = await auth.signUpWithEmail(email, password);
				if (!error) {
					mode = 'signin';
					errorMessage = '';
				}
			}
		} finally {
			isSubmitting = false;
		}
	}

	function switchMode() {
		mode = mode === 'signin' ? 'signup' : 'signin';
		errorMessage = '';
	}
</script>

<svelte:head>
	<title>{mode === 'signin' ? 'Sign In' : 'Create Account'} | MOSCAR</title>
</svelte:head>

<div class="login-page">
	<!-- Animated background -->
	<div class="bg-gradient"></div>
	<div class="bg-grid"></div>

	<!-- Content container -->
	<div class="container">
		<!-- Logo -->
		<a href="/" class="logo">MOSCAR</a>

		<!-- Auth card -->
		<div class="auth-card">
			<h1>{mode === 'signin' ? 'Welcome Back' : 'Create Account'}</h1>
			<p class="subtitle">
				{mode === 'signin'
					? 'Sign in to access your generations and history'
					: 'Join MOSCAR to save your creations'}
			</p>

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
				<span>or continue with</span>
			</div>

			<div class="oauth-buttons">
				<button class="oauth-btn" onclick={() => auth.signInWithProvider('google')}>
					<svg viewBox="0 0 24 24" width="20" height="20">
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
					Google
				</button>

				<button class="oauth-btn" onclick={() => auth.signInWithProvider('github')}>
					<svg viewBox="0 0 24 24" width="20" height="20">
						<path
							fill="currentColor"
							d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
						/>
					</svg>
					GitHub
				</button>
			</div>

			<p class="switch-mode">
				{mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}
				<button type="button" onclick={switchMode}>
					{mode === 'signin' ? 'Sign up' : 'Sign in'}
				</button>
			</p>
		</div>

		<!-- Back to app link -->
		<a href="/" class="back-link">← Back to MOSCAR</a>
	</div>
</div>

<style>
	.login-page {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		overflow: hidden;
	}

	/* Animated gradient background */
	.bg-gradient {
		position: absolute;
		inset: 0;
		background: linear-gradient(
			135deg,
			rgba(201, 254, 110, 0.1) 0%,
			rgba(110, 201, 254, 0.05) 50%,
			rgba(201, 110, 254, 0.1) 100%
		);
		animation: gradientMove 15s ease infinite;
	}

	@keyframes gradientMove {
		0%,
		100% {
			background-position: 0% 50%;
		}
		50% {
			background-position: 100% 50%;
		}
	}

	/* Grid pattern overlay */
	.bg-grid {
		position: absolute;
		inset: 0;
		background-image: radial-gradient(circle, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
		background-size: 32px 32px;
	}

	.container {
		position: relative;
		z-index: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-xl);
		padding: var(--space-xl);
		width: 100%;
		max-width: 440px;
	}

	.logo {
		font-family: var(--font-mono);
		font-size: var(--text-2xl);
		font-weight: var(--font-normal);
		color: var(--color-node-product);
		text-decoration: none;
		letter-spacing: 2px;
	}

	.auth-card {
		width: 100%;
		background: linear-gradient(135deg, rgba(34, 34, 34, 0.95) 0%, rgba(42, 42, 42, 0.9) 100%);
		backdrop-filter: blur(20px);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: var(--radius-xl);
		padding: var(--space-2xl);
		box-shadow:
			0 4px 24px rgba(0, 0, 0, 0.4),
			0 0 80px rgba(201, 254, 110, 0.05);
	}

	h1 {
		font-size: var(--text-2xl);
		font-weight: var(--font-bold);
		color: var(--color-text-primary);
		margin-bottom: var(--space-sm);
		text-align: center;
	}

	.subtitle {
		font-size: var(--text-sm);
		color: var(--color-text-secondary);
		text-align: center;
		margin-bottom: var(--space-xl);
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
		font-weight: var(--font-medium);
	}

	input {
		padding: var(--space-md) var(--space-lg);
		background-color: rgba(18, 18, 18, 0.8);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: var(--radius-md);
		color: var(--color-text-primary);
		font-size: var(--text-base);
		transition: all var(--transition-fast);
	}

	input:focus {
		outline: none;
		border-color: var(--color-node-product);
		box-shadow: 0 0 0 3px rgba(201, 254, 110, 0.15);
	}

	input:disabled {
		opacity: 0.6;
	}

	input::placeholder {
		color: var(--color-text-muted);
	}

	.error-message {
		padding: var(--space-md);
		background-color: rgba(254, 110, 110, 0.1);
		border: 1px solid rgba(254, 110, 110, 0.3);
		border-radius: var(--radius-md);
		color: var(--color-error);
		font-size: var(--text-sm);
	}

	.submit-btn {
		margin-top: var(--space-md);
		padding: var(--space-md) var(--space-xl);
		background: linear-gradient(
			135deg,
			var(--color-node-product) 0%,
			var(--color-node-refine) 100%
		);
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
		transform: translateY(-2px);
		box-shadow: 0 8px 24px rgba(201, 254, 110, 0.3);
	}

	.submit-btn:active:not(:disabled) {
		transform: translateY(0);
	}

	.submit-btn:disabled {
		opacity: 0.7;
		cursor: not-allowed;
	}

	.spinner {
		width: 18px;
		height: 18px;
		border: 2px solid rgba(0, 0, 0, 0.2);
		border-top-color: var(--color-bg-canvas);
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
		margin: var(--space-xl) 0;
		gap: var(--space-md);
	}

	.divider::before,
	.divider::after {
		content: '';
		flex: 1;
		height: 1px;
		background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.1), transparent);
	}

	.divider span {
		color: var(--color-text-muted);
		font-size: var(--text-sm);
	}

	.oauth-buttons {
		display: flex;
		gap: var(--space-md);
	}

	.oauth-btn {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-sm);
		padding: var(--space-md);
		background-color: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: var(--radius-md);
		color: var(--color-text-primary);
		font-size: var(--text-sm);
		font-weight: var(--font-medium);
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.oauth-btn:hover {
		background-color: rgba(255, 255, 255, 0.1);
		border-color: rgba(255, 255, 255, 0.2);
		transform: translateY(-1px);
	}

	.switch-mode {
		text-align: center;
		margin-top: var(--space-xl);
		font-size: var(--text-sm);
		color: var(--color-text-secondary);
	}

	.switch-mode button {
		background: transparent;
		border: none;
		color: var(--color-node-product);
		cursor: pointer;
		font-size: var(--text-sm);
		font-weight: var(--font-medium);
		padding: 0;
		margin-left: var(--space-sm);
	}

	.switch-mode button:hover {
		text-decoration: underline;
	}

	.back-link {
		color: var(--color-text-muted);
		font-size: var(--text-sm);
		text-decoration: none;
		transition: color var(--transition-fast);
	}

	.back-link:hover {
		color: var(--color-node-product);
	}
</style>
