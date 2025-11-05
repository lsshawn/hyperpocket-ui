<script lang="ts">
	import Icon from '@iconify/svelte';
	import type { PaymentIntent } from '$lib/types/wallet';
	import { WalletApiClient } from '$lib/api/wallet-client';

	// Props
	export let paymentIntent: PaymentIntent;
	export let apiBaseUrl: string = 'http://localhost:3000';
	export let onSuccess: (transactionId: string) => void = () => {};
	export let onError: (error: string) => void = () => {};

	// State
	let pin = $state(['', '', '', '', '', '']);
	let isLoading = $state(false);
	let errorMessage = $state('');

	// Initialize API client
	const apiClient = new WalletApiClient(apiBaseUrl);

	// Computed
	const isPinComplete = $derived(pin.every((digit) => digit !== ''));
	const formattedAmount = $derived(
		`${paymentIntent.currency} ${paymentIntent.amount.toFixed(2)}`
	);

	function handleInput(event: Event, index: number) {
		const target = event.target as HTMLInputElement;
		const value = target.value;

		// Only allow digits
		if (!/^\d*$/.test(value)) {
			target.value = pin[index]; // revert
			return;
		}

		pin[index] = value;

		// Auto-focus next input
		if (value && index < pin.length - 1) {
			(target.nextElementSibling as HTMLElement)?.focus();
		}
	}

	function handlePaste(event: ClipboardEvent) {
		event.preventDefault();
		const paste = event.clipboardData?.getData('text') ?? '';
		const numbers = paste
			.split('')
			.filter((char) => /^\d$/.test(char))
			.slice(0, pin.length);

		numbers.forEach((num, i) => {
			pin[i] = num;
		});

		// Focus on the last filled input or the first empty one
		const form = (event.target as HTMLInputElement).form;
		if (!form) return;

		const nextFocusIndex = Math.min(numbers.length, pin.length - 1);
		(form.elements.namedItem(`pin-input-${nextFocusIndex}`) as HTMLElement)?.focus();
	}

	function handleKeydown(event: KeyboardEvent, index: number) {
		if (event.key === 'Backspace') {
			const target = event.target as HTMLInputElement;
			if (target.value === '' && index > 0) {
				pin[index - 1] = '';
				(target.previousElementSibling as HTMLElement)?.focus();
			}
		}
	}

	async function handleSubmit() {
		if (!isPinComplete) return;

		isLoading = true;
		errorMessage = '';

		try {
			const response = await apiClient.payWithWallet({
				userId: paymentIntent.userId,
				amount: paymentIntent.amount,
				currency: paymentIntent.currency,
				pin: pin.join(''),
				productType: paymentIntent.productType,
				sourceEntityType: paymentIntent.sourceEntityType,
				sourceEntityId: paymentIntent.sourceEntityId,
				description: paymentIntent.description,
				metadata: paymentIntent.metadata
			});

			if (response.data?.id) {
				onSuccess(response.data.id);
			} else {
				throw new Error('Payment completed but no transaction ID received');
			}
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Payment failed';
			errorMessage = message;
			onError(message);

			// Reset PIN on error
			pin = ['', '', '', '', '', ''];
			const firstInput = document.getElementById('pin-input-0');
			if (firstInput) firstInput.focus();
		} finally {
			isLoading = false;
		}
	}
</script>

<div class="wallet-payment">
	<div class="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4 text-center">
		<div class="mb-3 flex items-center justify-center gap-2">
			<Icon icon="lucide:wallet" class="h-6 w-6 text-primary" />
			<h3 class="text-lg font-semibold">Hyperpocket Wallet</h3>
		</div>
		<p class="text-sm text-gray-600">You are paying</p>
		<p class="text-3xl font-bold text-gray-800">{formattedAmount}</p>
		{#if paymentIntent.description}
			<p class="mt-2 text-sm text-gray-500">{paymentIntent.description}</p>
		{/if}
	</div>

	<form on:submit|preventDefault={handleSubmit}>
		<label for="pin-input-0" class="label justify-center">
			<span class="label-text font-medium">Enter your 6-digit PIN</span>
		</label>

		<div class="mb-6 flex justify-center gap-2">
			{#each pin as _, index}
				<input
					name={`pin-input-${index}`}
					id={`pin-input-${index}`}
					type="password"
					inputmode="numeric"
					maxlength="1"
					pattern="[0-9]"
					class="input input-bordered h-14 w-12 text-center text-2xl"
					bind:value={pin[index]}
					on:input={(event) => handleInput(event, index)}
					on:paste={handlePaste}
					on:focus={(e) => e.target.select()}
					on:keydown={(event) => handleKeydown(event, index)}
					required
					autocomplete="one-time-code"
					disabled={isLoading}
				/>
			{/each}
		</div>

		{#if errorMessage}
			<div class="alert alert-error mb-4">
				<Icon icon="lucide:alert-circle" class="h-5 w-5" />
				<span>{errorMessage}</span>
			</div>
		{/if}

		<button type="submit" class="btn btn-primary btn-block btn-lg" disabled={isLoading || !isPinComplete}>
			{#if isLoading}
				<span class="loading loading-spinner"></span>
				Processing payment...
			{:else}
				Confirm & Pay {formattedAmount}
			{/if}
		</button>
	</form>

	<div class="mt-4 rounded-lg bg-info/10 p-3">
		<div class="flex gap-2">
			<Icon icon="lucide:shield-check" class="h-5 w-5 shrink-0 text-info" />
			<p class="text-sm text-gray-600">
				Your payment is secured with PIN verification and encrypted transactions.
			</p>
		</div>
	</div>
</div>
