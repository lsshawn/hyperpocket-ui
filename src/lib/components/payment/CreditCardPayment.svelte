<script lang="ts">
	import { onMount } from 'svelte';
	import Icon from '@iconify/svelte';
	import type { PaymentIntent } from '$lib/types/wallet';
	import { WalletApiClient } from '$lib/api/wallet-client';

	// Props
	export let paymentIntent: PaymentIntent;
	export let apiBaseUrl: string = 'http://localhost:3000';
	export let onSuccess: (transactionId: string) => void = () => {};
	export let onError: (error: string) => void = () => {};
	export let usePreAuth: boolean = false; // If true, authorize only (for security deposits)

	// State
	let dropinInstance: any = null;
	let isLoading = $state(false);
	let isInitializing = $state(true);
	let errorMessage = $state('');
	let dropinContainer: HTMLDivElement;

	// Initialize API client
	const apiClient = new WalletApiClient(apiBaseUrl);

	// Computed
	const formattedAmount = $derived(
		`${paymentIntent.currency} ${paymentIntent.amount.toFixed(2)}`
	);

	onMount(async () => {
		try {
			// Load Braintree Drop-in library from CDN
			await loadBraintreeScript();

			// Get client token from backend
			const tokenResponse = await apiClient.getBraintreeClientToken(paymentIntent.userId);

			if (!tokenResponse.data?.clientToken) {
				throw new Error('Failed to get Braintree client token');
			}

			// Initialize Braintree Drop-in UI
			const braintree = (window as any).braintree;
			dropinInstance = await braintree.dropin.create({
				authorization: tokenResponse.data.clientToken,
				container: dropinContainer,
				card: {
					cardholderName: {
						required: true
					}
				},
				paypal: {
					flow: 'vault'
				},
				venmo: false,
				applePay: false,
				googlePay: false
			});

			isInitializing = false;
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Failed to initialize payment';
			errorMessage = message;
			onError(message);
			isInitializing = false;
		}
	});

	async function loadBraintreeScript(): Promise<void> {
		return new Promise((resolve, reject) => {
			// Check if already loaded
			if ((window as any).braintree) {
				resolve();
				return;
			}

			const script = document.createElement('script');
			script.src = 'https://js.braintreegateway.com/web/dropin/1.43.0/js/dropin.min.js';
			script.onload = () => resolve();
			script.onerror = () => reject(new Error('Failed to load Braintree library'));
			document.head.appendChild(script);
		});
	}

	async function handleSubmit() {
		if (!dropinInstance) return;

		isLoading = true;
		errorMessage = '';

		try {
			// Request payment method nonce from Braintree
			const { nonce } = await dropinInstance.requestPaymentMethod();

			// Call backend API to process payment
			const response = usePreAuth
				? await apiClient.authorizePayment({
						userId: paymentIntent.userId,
						amount: paymentIntent.amount,
						currency: paymentIntent.currency,
						paymentMethodNonce: nonce,
						productType: paymentIntent.productType,
						sourceEntityType: paymentIntent.sourceEntityType,
						sourceEntityId: paymentIntent.sourceEntityId,
						description: paymentIntent.description,
						metadata: paymentIntent.metadata
					})
				: await apiClient.capturePayment({
						userId: paymentIntent.userId,
						amount: paymentIntent.amount,
						currency: paymentIntent.currency,
						paymentMethodNonce: nonce,
						productType: paymentIntent.productType,
						sourceEntityType: paymentIntent.sourceEntityType,
						sourceEntityId: paymentIntent.sourceEntityId,
						description: paymentIntent.description,
						metadata: paymentIntent.metadata
					});

			if (response.data?.transactionId) {
				onSuccess(response.data.transactionId);
			} else {
				throw new Error('Payment completed but no transaction ID received');
			}
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Payment failed';
			errorMessage = message;
			onError(message);
		} finally {
			isLoading = false;
		}
	}

	// Cleanup on unmount
	onMount(() => {
		return () => {
			if (dropinInstance) {
				dropinInstance.teardown();
			}
		};
	});
</script>

<div class="credit-card-payment">
	<div class="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4 text-center">
		<div class="mb-3 flex items-center justify-center gap-2">
			<Icon icon="lucide:credit-card" class="h-6 w-6 text-primary" />
			<h3 class="text-lg font-semibold">Credit/Debit Card</h3>
		</div>
		<p class="text-sm text-gray-600">
			{usePreAuth ? 'Pre-authorizing' : 'You are paying'}
		</p>
		<p class="text-3xl font-bold text-gray-800">{formattedAmount}</p>
		{#if paymentIntent.description}
			<p class="mt-2 text-sm text-gray-500">{paymentIntent.description}</p>
		{/if}
	</div>

	{#if isInitializing}
		<div class="flex flex-col items-center justify-center py-12">
			<span class="loading loading-spinner loading-lg mb-4"></span>
			<p class="text-gray-600">Loading payment form...</p>
		</div>
	{:else}
		<!-- Braintree Drop-in UI Container -->
		<div bind:this={dropinContainer} class="braintree-dropin mb-6"></div>

		{#if errorMessage}
			<div class="alert alert-error mb-4">
				<Icon icon="lucide:alert-circle" class="h-5 w-5" />
				<span>{errorMessage}</span>
			</div>
		{/if}

		<button
			type="button"
			class="btn btn-primary btn-block btn-lg"
			disabled={isLoading}
			onclick={handleSubmit}
		>
			{#if isLoading}
				<span class="loading loading-spinner"></span>
				Processing payment...
			{:else}
				{usePreAuth ? 'Authorize' : 'Pay'} {formattedAmount}
			{/if}
		</button>

		<div class="mt-4 rounded-lg bg-info/10 p-3">
			<div class="flex gap-2">
				<Icon icon="lucide:shield-check" class="h-5 w-5 shrink-0 text-info" />
				<div class="text-sm text-gray-600">
					<p class="font-medium">Secure Payment</p>
					<p class="mt-1">Your card information is encrypted and never stored on our servers.</p>
					{#if usePreAuth}
						<p class="mt-2 text-xs text-gray-500">
							This is a pre-authorization. Funds will be held but not charged until the transaction
							is completed.
						</p>
					{/if}
				</div>
			</div>
		</div>

		<div class="mt-4 flex items-center justify-center gap-3 text-gray-400">
			<Icon icon="simple-icons:visa" class="h-8 w-12" />
			<Icon icon="simple-icons:mastercard" class="h-8 w-12" />
			<Icon icon="simple-icons:americanexpress" class="h-8 w-12" />
		</div>
	{/if}
</div>

<style>
	:global(.braintree-dropin) {
		font-family: inherit;
	}

	:global(.braintree-sheet__content) {
		padding: 1rem;
	}

	:global(.braintree-form__field-group) {
		margin-bottom: 1rem;
	}

	:global(.braintree-form__label) {
		font-weight: 500;
		margin-bottom: 0.5rem;
		display: block;
	}

	:global(.braintree-form__hosted-field) {
		height: 3rem;
		padding: 0.75rem;
		border: 1px solid #d1d5db;
		border-radius: 0.5rem;
		background-color: white;
	}

	:global(.braintree-form__hosted-field.braintree-hosted-fields-focused) {
		outline: 2px solid #3b82f6;
		outline-offset: 2px;
	}

	:global(.braintree-form__hosted-field.braintree-hosted-fields-invalid) {
		border-color: #ef4444;
	}
</style>
