<script lang="ts">
	import { goto } from '$app/navigation';
	import Icon from '@iconify/svelte';
	import CreditCardPayment from '$lib/components/payment/CreditCardPayment.svelte';
	import BankTransferPayment from '$lib/components/payment/BankTransferPayment.svelte';
	import { config } from '$lib/config';
	import type { Currency, PaymentIntent, PaymentMethod } from '$lib/types/wallet';

	let step = $state<1 | 2 | 3>(1);
	let amount = $state(100);
	let selectedCurrency = $state<Currency>('USD');
	let selectedPaymentMethod = $state<PaymentMethod | null>(null);
	let error = $state('');

	const currencies: Currency[] = ['USD', 'THB', 'MYR', 'SGD', 'EUR', 'GBP'];

	const paymentMethods: { id: PaymentMethod; name: string; icon: string; available: boolean }[] = [
		{ id: 'credit_card', name: 'Credit/Debit Card', icon: 'lucide:credit-card', available: true },
		{ id: 'bank_transfer', name: 'Bank Transfer', icon: 'lucide:building-2', available: false }
	];

	// Quick amount presets
	const amountPresets = [50, 100, 200, 500];

	function setAmountPreset(preset: number) {
		amount = preset;
	}

	function proceedToPaymentMethod() {
		if (amount < 1) {
			error = 'Please enter an amount of at least 1';
			return;
		}
		if (amount > 10000) {
			error = 'Maximum top-up amount is 10,000 per transaction';
			return;
		}
		error = '';
		step = 2;
	}

	function selectPaymentMethod(method: PaymentMethod) {
		selectedPaymentMethod = method;
		step = 3;
	}

	function goBack() {
		error = '';
		if (step === 3) {
			step = 2;
			selectedPaymentMethod = null;
		} else if (step === 2) {
			step = 1;
		}
	}

	function handlePaymentSuccess(transactionId: string) {
		// Redirect to success page
		goto(`/top-up/completed?transactionId=${transactionId}`);
	}

	function handlePaymentError(errorMessage: string) {
		error = errorMessage;
		// Go back to payment method selection
		step = 2;
		selectedPaymentMethod = null;
	}

	function formatCurrency(value: number): string {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: selectedCurrency
		}).format(value);
	}

	// Create payment intent for the selected payment method
	const paymentIntent = $derived<PaymentIntent>({
		amount,
		currency: selectedCurrency,
		userId: 'demo-user-123', // Replace with actual user ID from session
		productType: 'ride_hailing',
		sourceEntityType: 'wallet_topup',
		sourceEntityId: `topup-${Date.now()}`,
		description: `Wallet top-up of ${formatCurrency(amount)}`
	});
</script>

<svelte:head>
	<title>Top Up Wallet</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 p-4 font-sans md:p-8">
	<div class="mx-auto max-w-md">
		<!-- Header -->
		<div class="mb-6 flex items-center justify-between">
			{#if step > 1}
				<button class="btn btn-circle btn-ghost btn-sm" onclick={goBack}>
					<Icon icon="lucide:arrow-left" class="h-5 w-5" />
				</button>
			{:else}
				<div></div>
			{/if}
			<h1 class="text-2xl font-bold text-gray-800">Top Up Wallet</h1>
			<div class="w-10"></div>
		</div>

		<!-- Error Message -->
		{#if error}
			<div class="alert alert-error mb-6">
				<Icon icon="lucide:alert-circle" class="h-5 w-5" />
				<span>{error}</span>
			</div>
		{/if}

		<!-- Step 1: Amount Selection -->
		{#if step === 1}
			<div class="space-y-6 rounded-xl bg-white p-6 shadow-md">
				<!-- Currency Selector -->
				<div class="form-control">
					<label class="label">
						<span class="label-text font-semibold">Currency</span>
					</label>
					<select class="select select-bordered w-full" bind:value={selectedCurrency}>
						{#each currencies as currency}
							<option value={currency}>{currency}</option>
						{/each}
					</select>
				</div>

				<!-- Amount Input -->
				<div class="form-control">
					<label class="label">
						<span class="label-text font-semibold">Amount</span>
					</label>
					<label class="input input-bordered flex items-center gap-2">
						<span class="text-gray-500">{selectedCurrency}</span>
						<input
							type="number"
							min="1"
							max="10000"
							step="0.01"
							bind:value={amount}
							class="grow text-2xl font-semibold"
							placeholder="0.00"
						/>
					</label>
				</div>

				<!-- Quick Amount Presets -->
				<div>
					<p class="mb-2 text-sm font-medium text-gray-600">Quick amounts</p>
					<div class="grid grid-cols-4 gap-2">
						{#each amountPresets as preset}
							<button
								class="btn btn-outline btn-sm"
								class:btn-active={amount === preset}
								onclick={() => setAmountPreset(preset)}
							>
								{preset}
							</button>
						{/each}
					</div>
				</div>

				<!-- Total Display -->
				<div class="rounded-lg bg-gray-50 p-4">
					<div class="flex items-center justify-between">
						<span class="text-gray-600">You will deposit</span>
						<span class="text-2xl font-bold text-gray-800">{formatCurrency(amount)}</span>
					</div>
				</div>

				<!-- Proceed Button -->
				<button class="btn btn-primary btn-block" onclick={proceedToPaymentMethod}>
					Continue
					<Icon icon="lucide:arrow-right" class="h-5 w-5" />
				</button>
			</div>
		{/if}

		<!-- Step 2: Payment Method Selection -->
		{#if step === 2}
			<div class="space-y-4 rounded-xl bg-white p-6 shadow-md">
				<div class="mb-4">
					<h2 class="text-xl font-bold text-gray-800">Select Payment Method</h2>
					<p class="text-sm text-gray-500">Top up: {formatCurrency(amount)}</p>
				</div>

				<div class="space-y-3">
					{#each paymentMethods as method (method.id)}
						<button
							class="flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white p-4 text-left transition-all hover:border-primary hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-50"
							disabled={!method.available}
							onclick={() => selectPaymentMethod(method.id)}
						>
							<div class="flex items-center gap-4">
								<div class="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
									<Icon icon={method.icon} class="h-6 w-6 text-primary" />
								</div>
								<div>
									<p class="font-semibold text-gray-800">{method.name}</p>
									{#if !method.available}
										<p class="text-xs text-gray-500">Coming soon</p>
									{/if}
								</div>
							</div>
							{#if method.available}
								<Icon icon="lucide:chevron-right" class="h-5 w-5 text-gray-400" />
							{/if}
						</button>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Step 3: Payment Processing -->
		{#if step === 3 && selectedPaymentMethod}
			<div class="rounded-xl bg-white p-6 shadow-md">
				<div class="mb-6">
					<h2 class="text-xl font-bold text-gray-800">Complete Payment</h2>
					<p class="text-sm text-gray-500">Amount: {formatCurrency(amount)}</p>
				</div>

				{#if selectedPaymentMethod === 'credit_card'}
					<CreditCardPayment
						{paymentIntent}
						apiBaseUrl={config.walletApiUrl}
						onSuccess={handlePaymentSuccess}
						onError={handlePaymentError}
					/>
				{:else if selectedPaymentMethod === 'bank_transfer'}
					<BankTransferPayment {paymentIntent} />
				{/if}
			</div>
		{/if}

		<!-- Info Section -->
		{#if step === 1}
			<div class="mt-6 rounded-lg bg-blue-50 p-4">
				<div class="flex gap-3">
					<Icon icon="lucide:info" class="h-5 w-5 shrink-0 text-blue-600" />
					<div class="text-sm text-blue-900">
						<p class="font-semibold">Top-up limits</p>
						<ul class="mt-2 list-inside list-disc space-y-1 text-blue-800">
							<li>Minimum: {formatCurrency(1)}</li>
							<li>Maximum per transaction: {formatCurrency(10000)}</li>
							<li>Instant processing for card payments</li>
						</ul>
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>
