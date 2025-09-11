<script lang="ts">
	import Icon from '@iconify/svelte';
	let availableBalance = $state(1234.56);

	const transactions = $state([
		{
			id: 1,
			type: 'deposit',
			description: 'Deposit from bank',
			date: '2025-08-26',
			amount: 500.0
		},
		{
			id: 2,
			type: 'purchase',
			description: 'Starbucks',
			date: '2025-08-25',
			amount: -12.5
		},
		{
			id: 3,
			type: 'transfer',
			description: 'Transfer to Jane Doe',
			date: '2025-08-24',
			amount: -100.0
		},
		{
			id: 4,
			type: 'deposit',
			description: 'Paycheck',
			date: '2025-08-23',
			amount: 897.11
		}
	]);

	function formatCurrency(amount: number) {
		const formatter = new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD'
		});
		return formatter.format(amount);
	}

	const iconMap: Record<string, string> = {
		deposit: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-6 w-6 text-gray-500"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>`,
		purchase: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-6 w-6 text-gray-500"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.16"/></svg>`,
		transfer: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-6 w-6 text-gray-500"><path d="m16 14 4-4-4-4"/><path d="M8 10H20"/><path d="m8 10-4 4 4 4"/><path d="M4 14h12"/></svg>`
	};
</script>

<svelte:head>
	<title>Wallet</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 p-4 font-sans md:p-8">
	<div class="mx-auto max-w-md">
		<h1 class="mb-4 text-3xl font-bold text-gray-800">Wallet</h1>

		<div class="mb-6 rounded-xl bg-white p-6 shadow-md">
			<p class="text-sm text-gray-500">Available Balance</p>
			<p class="text-4xl font-bold text-gray-800">{formatCurrency(availableBalance)}</p>
		</div>

		<div class="mb-8 grid grid-cols-3 gap-4">
			<button class="btn btn-primary">
				<Icon icon="lucide:plus" />
				<span>Add Money</span>
			</button>
			<button class="btn btn-primary">
				<Icon icon="hugeicons:reverse-withdrawal-01" />
				<span>Withdraw</span>
			</button>
			<button class="btn btn-primary">
				<Icon icon="lucide:send" />
				<span>Transfer</span>
			</button>
		</div>

		<div>
			<h2 class="mb-4 text-xl font-bold text-gray-800">Recent Transactions</h2>
			<div class="space-y-4">
				{#each transactions as transaction (transaction.id)}
					<div class="flex items-center justify-between rounded-lg bg-white p-4 shadow-sm">
						<div class="flex items-center gap-4">
							<div
								class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100"
							>
								{@html iconMap[transaction.type] ?? ''}
							</div>
							<div>
								<p class="font-semibold text-gray-800">{transaction.description}</p>
								<p class="text-sm text-gray-500">{transaction.date}</p>
							</div>
						</div>
						<p
							class:text-green-500={transaction.amount > 0}
							class:text-gray-800={transaction.amount < 0}
							class="font-semibold whitespace-nowrap"
						>
							{transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
						</p>
					</div>
				{/each}
			</div>
		</div>
	</div>
</div>
