<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import Icon from '@iconify/svelte';

	let transactionId = $derived($page.url.searchParams.get('transactionId') || '');
	let redirectCountdown = $state(5);

	onMount(() => {
		// Countdown redirect
		const interval = setInterval(() => {
			redirectCountdown--;
			if (redirectCountdown <= 0) {
				clearInterval(interval);
				// Redirect back to wallet dashboard
				goto('/');
			}
		}, 1000);

		return () => clearInterval(interval);
	});
</script>

<svelte:head>
	<title>Top-up Successful</title>
</svelte:head>

<div class="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 font-sans">
	<div class="w-full max-w-md rounded-xl bg-white p-8 text-center shadow-md">
		<div class="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-success/20">
			<Icon icon="lucide:check-circle-2" class="h-12 w-12 text-success" />
		</div>
		<h1 class="mb-4 text-3xl font-bold text-gray-800">Top-up Successful!</h1>
		<p class="mb-2 text-gray-600">
			Your wallet has been topped up successfully. The funds will be available in your account shortly.
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
				Redirecting to your wallet in <span class="font-bold text-info">{redirectCountdown}</span>
				seconds...
			</p>
		</div>

		<a href="/" class="btn btn-primary btn-block">Return to Wallet Now</a>
	</div>
</div>
