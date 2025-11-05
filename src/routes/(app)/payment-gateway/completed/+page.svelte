<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import Icon from '@iconify/svelte';

	let transactionId = $derived($page.url.searchParams.get('transactionId') || '');
	let returnUrl = $derived($page.url.searchParams.get('returnUrl') || '/');
	let redirectCountdown = $state(5);

	onMount(() => {
		// Countdown redirect
		const interval = setInterval(() => {
			redirectCountdown--;
			if (redirectCountdown <= 0) {
				clearInterval(interval);
				// In production, redirect to the return URL from the originating app
				window.location.href = returnUrl;
			}
		}, 1000);

		return () => clearInterval(interval);
	});
</script>

<svelte:head>
	<title>Payment Successful</title>
</svelte:head>

<div class="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 font-sans">
	<div class="w-full max-w-md rounded-xl bg-white p-8 text-center shadow-md">
		<div class="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-success/20">
			<Icon icon="lucide:check-circle-2" class="h-12 w-12 text-success" />
		</div>
		<h1 class="mb-4 text-3xl font-bold text-gray-800">Payment Successful!</h1>
		<p class="mb-2 text-gray-600">
			Thank you for your payment. Your transaction has been completed successfully.
		</p>

		{#if transactionId}
			<div class="my-4 rounded-lg bg-gray-50 p-3">
				<p class="text-xs text-gray-500">Transaction ID</p>
				<p class="mt-1 font-mono text-sm text-gray-700">{transactionId}</p>
			</div>
		{/if}

		<div class="divider my-6"></div>

		<div class="mb-6 rounded-lg border border-info/30 bg-info/10 p-4">
			<Icon icon="lucide:clock" class="mx-auto mb-2 h-8 w-8 text-info" />
			<p class="text-sm text-gray-600">
				Redirecting you back in <span class="font-bold text-info">{redirectCountdown}</span>
				seconds...
			</p>
		</div>

		<a href={returnUrl} class="btn btn-primary btn-block">Return to App Now</a>
	</div>
</div>
