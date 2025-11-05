<script lang="ts">
	import { goto } from '$app/navigation';
	import Icon from '@iconify/svelte';
	import PaymentGateway from '$lib/components/payment/PaymentGateway.svelte';
	import { config } from '$lib/config';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	function handlePaymentSuccess(transactionId: string) {
		console.log('Payment successful:', transactionId);
		goto(`/payment-gateway/completed?transactionId=${transactionId}`);
	}

	function handlePaymentError(error: string) {
		console.error('Payment error:', error);
	}
</script>

<svelte:head>
	<title>Payment Gateway</title>
</svelte:head>

<div class="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 font-sans">
	<div class="w-full max-w-md">
		<!-- Booking Details Card -->
		<div class="mb-6 rounded-xl bg-white p-6 shadow-md">
			<p class="text-center text-lg text-gray-600">You are paying for your ride booking</p>
			<p class="my-2 text-center text-4xl font-bold text-gray-800">
				{data.paymentIntent.currency}
				{data.paymentIntent.amount.toFixed(2)}
			</p>
			<div class="divider"></div>
			<div class="text-left">
				<div class="flex items-start gap-4">
					<Icon icon="lucide:map-pin" class="mt-1 h-5 w-5 text-gray-400" />
					<div>
						<p class="text-sm text-gray-500">From</p>
						<p class="font-semibold text-gray-700">Grand Central Terminal</p>
					</div>
				</div>
				<div class="my-2 h-4 border-l border-dashed border-gray-300 ltr:ml-2.5 rtl:mr-2.5"></div>
				<div class="flex items-start gap-4">
					<Icon icon="lucide:flag" class="mt-1 h-5 w-5 text-gray-400" />
					<div>
						<p class="text-sm text-gray-500">To</p>
						<p class="font-semibold text-gray-700">John F. Kennedy International Airport</p>
					</div>
				</div>
			</div>
		</div>

		<!-- Payment Gateway Component -->
		<div class="rounded-xl bg-white p-6 shadow-md">
			<PaymentGateway
				paymentIntent={data.paymentIntent}
				apiBaseUrl={config.walletApiUrl}
				onSuccess={handlePaymentSuccess}
				onError={handlePaymentError}
				showHeader={false}
			/>
		</div>
	</div>
</div>
