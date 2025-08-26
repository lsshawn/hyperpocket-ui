<script lang="ts">
	let step = $state(1);
	let amount = $state(200);

	const paymentChannels = $state([
		{ id: 1, name: 'Credit/Debit Card' },
		{ id: 2, name: 'Bank Transfer' },
		{ id: 3, name: 'Apple Pay' },
		{ id: 4, name: 'Google Pay' },
		{ id: 5, name: 'PayPal' },
		{ id: 6, name: 'Crypto Wallet' }
	]);

	function proceedToPaymentChannels() {
		step = 2;
	}

	function goBack() {
		step = 1;
	}
</script>

<svelte:head>
	<title>Top Up</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 p-4 font-sans md:p-8">
	<div class="mx-auto max-w-md">
		<h1 class="mb-4 text-center text-2xl font-bold text-gray-800">Top Up</h1>

		{#if step === 1}
			<div class="space-y-4 rounded-xl bg-white p-6 shadow-md">
				<label for="amount" class="sr-only">Amount</label>
				<input
					id="amount"
					type="number"
					bind:value={amount}
					class="w-full rounded-lg border border-gray-300 p-4 text-center text-2xl font-semibold text-gray-800"
				/>
				<button
					onclick={proceedToPaymentChannels}
					class="w-full rounded-lg bg-blue-500 py-3 font-semibold text-white transition-colors hover:bg-blue-600"
				>
					Topup
				</button>
			</div>
		{:else if step === 2}
			<div class="rounded-xl bg-white p-6 shadow-md">
				<div class="mb-4 flex items-center">
					<button onclick={goBack} class="p-2 text-gray-500 hover:text-gray-700">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							class="h-6 w-6"
						>
							<path d="M19 12H5" />
							<path d="m12 19-7-7 7-7" />
						</svg>
					</button>
					<h2 class="flex-grow text-center text-xl font-bold text-gray-800">
						Choose payment channel
					</h2>
					<div class="w-8"></div>
					<!-- Spacer to balance back button -->
				</div>
				<hr class="mb-4" />
				<div class="space-y-3">
					{#each paymentChannels as channel (channel.id)}
						<button
							class="w-full rounded-lg border border-gray-300 bg-white p-4 text-left font-medium text-gray-700 transition-colors hover:bg-gray-100"
						>
							{channel.name}
						</button>
					{/each}
				</div>
			</div>
		{/if}
	</div>
</div>
