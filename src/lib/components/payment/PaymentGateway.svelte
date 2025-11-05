<script lang="ts">
	import { onMount } from 'svelte';
	import Icon from '@iconify/svelte';
	import type { Currency, PaymentIntent, PaymentMethod } from '$lib/types/wallet';
	import { WalletApiClient } from '$lib/api/wallet-client';
	import WalletPayment from './WalletPayment.svelte';
	import CreditCardPayment from './CreditCardPayment.svelte';
	import BankTransferPayment from './BankTransferPayment.svelte';

	// Props
	export let paymentIntent: PaymentIntent;
	export let apiBaseUrl: string = 'http://localhost:3000';
	export let onSuccess: (transactionId: string) => void = () => {};
	export let onError: (error: string) => void = () => {};
	export let showHeader: boolean = true;

	// State
	let selectedMethod: PaymentMethod | null = $state(null);
	let walletBalance: number = $state(0);
	let loading = $state(true);
	let errorMessage = $state('');

	// Initialize API client with custom base URL
	const apiClient = new WalletApiClient(apiBaseUrl);

	// Computed
	const hasInsufficientBalance = $derived(walletBalance < paymentIntent.amount);
	const formattedAmount = $derived(
		`${paymentIntent.currency} ${paymentIntent.amount.toFixed(2)}`
	);

	// Fetch wallet balance on mount
	onMount(async () => {
		try {
			const account = await apiClient.getWalletBalance(
				paymentIntent.userId,
				paymentIntent.currency
			);

			walletBalance = parseFloat(account.availableBalance);
		} catch (error) {
			console.error('Failed to fetch wallet balance:', error);
			errorMessage = error instanceof Error ? error.message : 'Failed to load wallet balance';
		} finally {
			loading = false;
		}
	});

	function handlePaymentSuccess(transactionId: string) {
		onSuccess(transactionId);
	}

	function handlePaymentError(error: string) {
		errorMessage = error;
		onError(error);
	}
</script>

<div class="payment-gateway">
	{#if showHeader}
		<h2 class="mb-4 text-center text-xl font-bold text-gray-800">Select Payment Method</h2>
		<div class="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
			<p class="text-center text-sm text-gray-600">Amount to pay</p>
			<p class="text-center text-3xl font-bold text-gray-800">{formattedAmount}</p>
			{#if paymentIntent.description}
				<p class="mt-2 text-center text-sm text-gray-500">{paymentIntent.description}</p>
			{/if}
		</div>
	{/if}

	{#if loading}
		<div class="flex justify-center py-8">
			<span class="loading loading-spinner loading-lg"></span>
		</div>
	{:else if !selectedMethod}
		<!-- Payment Method Selection -->
		<div class="flex flex-col gap-3">
			<!-- Wallet Option -->
			<button
				class="btn btn-outline btn-lg flex h-auto min-h-16 w-full items-center justify-start gap-4 p-4"
				class:btn-disabled={hasInsufficientBalance}
				disabled={hasInsufficientBalance}
				onclick={() => !hasInsufficientBalance && (selectedMethod = 'wallet')}
			>
				<div class="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
					<Icon icon="lucide:wallet" class="h-6 w-6 text-primary" />
				</div>
				<div class="flex-1 text-left">
					<h3 class="text-base font-semibold">Hyperpocket Wallet</h3>
					<p class="text-sm text-gray-500">
						Balance: {paymentIntent.currency}
						{walletBalance.toFixed(2)}
					</p>
					{#if hasInsufficientBalance}
						<span class="text-xs text-error">Insufficient balance</span>
					{/if}
				</div>
				{#if !hasInsufficientBalance}
					<Icon icon="lucide:chevron-right" class="h-5 w-5 text-gray-400" />
				{/if}
			</button>

			<!-- Credit Card -->
			<button
				class="btn btn-outline btn-lg flex h-auto min-h-16 w-full items-center justify-start gap-4 p-4"
				onclick={() => (selectedMethod = 'credit_card')}
			>
				<div class="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
					<Icon icon="lucide:credit-card" class="h-6 w-6 text-primary" />
				</div>
				<div class="flex-1 text-left">
					<h3 class="text-base font-semibold">Credit/Debit Card</h3>
					<p class="text-sm text-gray-500">Visa, Mastercard, Amex</p>
				</div>
				<Icon icon="lucide:chevron-right" class="h-5 w-5 text-gray-400" />
			</button>

			<!-- Bank Transfer -->
			<button
				class="btn btn-outline btn-lg flex h-auto min-h-16 w-full items-center justify-start gap-4 p-4 opacity-50"
				disabled
			>
				<div class="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
					<Icon icon="lucide:building-2" class="h-6 w-6 text-gray-400" />
				</div>
				<div class="flex-1 text-left">
					<h3 class="text-base font-semibold text-gray-500">Bank Transfer</h3>
					<p class="text-sm text-gray-400">Coming soon</p>
				</div>
			</button>
		</div>

		{#if errorMessage}
			<div class="alert alert-error mt-4">
				<Icon icon="lucide:alert-circle" class="h-5 w-5" />
				<span>{errorMessage}</span>
			</div>
		{/if}
	{:else}
		<!-- Back Button -->
		<button
			class="btn btn-ghost btn-sm mb-4 gap-2"
			onclick={() => {
				selectedMethod = null;
				errorMessage = '';
			}}
		>
			<Icon icon="lucide:arrow-left" class="h-4 w-4" />
			Change payment method
		</button>

		<!-- Payment Form -->
		{#if selectedMethod === 'wallet'}
			<WalletPayment
				{paymentIntent}
				{apiBaseUrl}
				onSuccess={handlePaymentSuccess}
				onError={handlePaymentError}
			/>
		{:else if selectedMethod === 'credit_card'}
			<CreditCardPayment
				{paymentIntent}
				{apiBaseUrl}
				onSuccess={handlePaymentSuccess}
				onError={handlePaymentError}
			/>
		{:else if selectedMethod === 'bank_transfer'}
			<BankTransferPayment
				{paymentIntent}
				onSuccess={handlePaymentSuccess}
				onError={handlePaymentError}
			/>
		{/if}
	{/if}
</div>

<style>
	.payment-gateway {
		width: 100%;
		max-width: 500px;
		margin: 0 auto;
	}
</style>
