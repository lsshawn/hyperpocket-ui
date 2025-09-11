<script lang="ts">
	import { goto } from '$app/navigation';
	import LoginForm from '$lib/components/LoginForm.svelte';
	import Icon from '@iconify/svelte';

	let showLoginForm = $state(false);

	function onSuccess() {
		goto('/payment-gateway/confirm-wallet-payment', { replaceState: true });
		showLoginForm = false;
	}
</script>

<svelte:head>
	<title>Payment Gateway</title>
</svelte:head>

<div class="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 font-sans">
	{#if showLoginForm}
		<div class="w-full max-w-md rounded-xl bg-white shadow-md">
			<LoginForm {onSuccess} />
		</div>
	{:else}
		<div class="w-full max-w-md">
			<div class="mb-6 rounded-xl bg-white p-6 text-center shadow-md">
				<p class="text-lg text-gray-600">You are paying for your ride booking</p>
				<p class="my-2 text-4xl font-bold text-gray-800">$20.00</p>
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

			<h2 class="mb-4 text-center text-xl font-bold text-gray-800">Select Payment Method</h2>
			<div class="flex flex-col space-y-4">
				<button class="btn btn-block btn-lg btn-primary" onclick={() => (showLoginForm = true)}>
					<Icon icon="lucide:wallet" class="h-6 w-6" />
					<span>Connect Hyperpocket Wallet</span>
				</button>
				<a href="/payment-gateway/credit-card" class="btn btn-block btn-outline btn-lg">
					<Icon icon="lucide:credit-card" class="h-6 w-6" />
					<span>Credit Card</span>
				</a>
			</div>
		</div>
	{/if}
</div>
