<script lang="ts">
	import Icon from '@iconify/svelte';
	import type { PaymentIntent } from '$lib/types/wallet';

	// Props
	export let paymentIntent: PaymentIntent;
	export let onSuccess: (transactionId: string) => void = () => {};
	export let onError: (error: string) => void = () => {};

	// Computed
	const formattedAmount = $derived(
		`${paymentIntent.currency} ${paymentIntent.amount.toFixed(2)}`
	);
</script>

<div class="bank-transfer-payment">
	<div class="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4 text-center">
		<div class="mb-3 flex items-center justify-center gap-2">
			<Icon icon="lucide:building-2" class="h-6 w-6 text-primary" />
			<h3 class="text-lg font-semibold">Bank Transfer</h3>
		</div>
		<p class="text-sm text-gray-600">Amount to pay</p>
		<p class="text-3xl font-bold text-gray-800">{formattedAmount}</p>
		{#if paymentIntent.description}
			<p class="mt-2 text-sm text-gray-500">{paymentIntent.description}</p>
		{/if}
	</div>

	<div class="rounded-lg border border-warning/50 bg-warning/10 p-6 text-center">
		<Icon icon="lucide:construction" class="mx-auto mb-4 h-16 w-16 text-warning" />
		<h3 class="mb-2 text-xl font-semibold text-gray-800">Coming Soon</h3>
		<p class="text-gray-600">
			Bank transfer payments are currently under development. Please use another payment method for
			now.
		</p>
	</div>

	<div class="mt-6 rounded-lg bg-info/10 p-4">
		<h4 class="mb-2 flex items-center gap-2 font-semibold text-gray-800">
			<Icon icon="lucide:info" class="h-5 w-5 text-info" />
			What to expect
		</h4>
		<ul class="space-y-2 text-sm text-gray-600">
			<li class="flex items-start gap-2">
				<Icon icon="lucide:check" class="mt-0.5 h-4 w-4 shrink-0 text-success" />
				<span>Direct bank account transfers</span>
			</li>
			<li class="flex items-start gap-2">
				<Icon icon="lucide:check" class="mt-0.5 h-4 w-4 shrink-0 text-success" />
				<span>No credit card fees</span>
			</li>
			<li class="flex items-start gap-2">
				<Icon icon="lucide:check" class="mt-0.5 h-4 w-4 shrink-0 text-success" />
				<span>Secure ACH or wire transfers</span>
			</li>
			<li class="flex items-start gap-2">
				<Icon icon="lucide:check" class="mt-0.5 h-4 w-4 shrink-0 text-success" />
				<span>1-3 business day processing</span>
			</li>
		</ul>
	</div>
</div>
