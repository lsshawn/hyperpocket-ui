<script>
	import { onMount } from 'svelte';

	let transactions = $state([]);

	let relatedEvents = $state([]);
	let isLoadingEvents = $state(true);

	function formatCurrency(amount, currency) {
		if (amount === null || amount === undefined) return '';
		return new Intl.NumberFormat(undefined, {
			style: 'currency',
			currency: currency
		}).format(amount);
	}

	function formatDate(dateString) {
		if (!dateString) return 'N/A';
		return new Date(dateString).toLocaleString(undefined, {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	onMount(async () => {
		const res = await fetch(
			'http://localhost:3000/wallets/deposit?userId=533fc4b2-e269-4576-b0eb-3cc648fa91ed'
		);
		if (!res.ok) {
			throw new Error(res.statusText);
		}
		const resData = await res.json();
		console.log('[LS] -> transactions/[id]/+page.svelte:34 -> resData: ', resData);
		transactions = resData.data;
		isLoadingEvents = false;
		// Simulate fetching additional data on the client
		// setTimeout(() => {
		// 	relatedEvents = [
		// 		{
		// 			id: 1,
		// 			timestamp: new Date(transactions.createdAt),
		// 			description: 'Payment initiated with merchant'
		// 		},
		// 		{
		// 			id: 2,
		// 			timestamp: new Date(new Date(transactions.createdAt).getTime() + 20000),
		// 			description: 'Authorization request sent to bank'
		// 		},
		// 		{
		// 			id: 3,
		// 			timestamp: new Date(new Date(transactions.createdAt).getTime() + 60000),
		// 			description: 'Authorization successful'
		// 		}
		// 	];
		// 	if (transactions.settledAt) {
		// 		relatedEvents.push({
		// 			id: 4,
		// 			timestamp: new Date(transactions.settledAt),
		// 			description: 'Transaction settled'
		// 		});
		// 	}
		// 	isLoadingEvents = false;
		// }, 1500);
	});
</script>

<div class="container mx-auto p-4 md:p-8">
	<a href="/transactions" class="btn mb-6 btn-ghost">
		<svg
			xmlns="http://www.w3.org/2000/svg"
			class="h-4 w-4"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
			><path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M10 19l-7-7m0 0l7-7m-7 7h18"
			/></svg
		>
		Back to Transactions
	</a>
	<h1 class="mb-2 text-3xl font-bold">Transaction Details</h1>
	<p class="mb-8 text-sm break-all text-base-content/60">ID: {transactions.id}</p>

	<div class="card bg-base-100 shadow-xl">
		<div class="card-body">
			<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
				<!-- Amount Details -->
				<div>
					<h3 class="mb-2 text-lg font-bold">Amount</h3>
					<p
						class="mb-4 font-mono text-4xl"
						class:text-success={transactions.direction === 'credit'}
						class:text-error={transactions.direction === 'debit'}
					>
						{transactions.direction === 'credit' ? '+' : '-'}
						{formatCurrency(transactions.grossAmount, transactions.currency)}
					</p>
					<div class="space-y-1 text-sm">
						<p>
							<strong>Net Amount:</strong>
							{formatCurrency(transactions.netAmount, transactions.currency)}
						</p>
						<p><strong>Fee:</strong> {formatCurrency(transactions.fee, transactions.currency)}</p>
					</div>
				</div>

				<!-- Status & Type -->
				<div>
					<h3 class="mb-2 text-lg font-bold">Details</h3>
					<div class="space-y-1 text-sm">
						<p>
							<strong>Type:</strong>
							<span class="badge badge-ghost capitalize">{transactions.type}</span>
						</p>
						<p>
							<strong>Direction:</strong>
							<span class="badge badge-outline capitalize">{transactions.direction}</span>
						</p>
						<p>
							<strong>Status:</strong>
							<span class="badge capitalize badge-primary">{transactions.status}</span>
						</p>
						<p>
							<strong>Reference:</strong> <span class="font-mono">{transactions.reference}</span>
						</p>
					</div>
				</div>

				<!-- Timestamps -->
				<div>
					<h3 class="mb-2 text-lg font-bold">Timeline</h3>
					<div class="space-y-1 text-sm">
						<p><strong>Created:</strong> {formatDate(transactions.createdAt)}</p>
						<p><strong>Settled:</strong> {formatDate(transactions.settledAt)}</p>
					</div>
				</div>
			</div>

			<div class="divider" />

			<!-- Description & Metadata -->
			<div>
				<h3 class="mb-2 text-lg font-bold">More Info</h3>
				<p class="mb-4">{transactions.description}</p>
				{#if transactions.metadata}
					<div class="rounded-lg bg-base-200 p-4 text-sm">
						<h4 class="mb-2 font-bold">Metadata</h4>
						<pre class="font-mono text-xs whitespace-pre-wrap">{JSON.stringify(
								transactions.metadata,
								null,
								2
							)}</pre>
					</div>
				{/if}
			</div>

			<div class="divider" />

			{#each transactions as tx}
				<div>
					{tx.id}
				</div>
			{/each}

			<!-- Related Events -->
			<div>
				<h3 class="mb-4 text-lg font-bold">Transaction Events</h3>
				{#if isLoadingEvents}
					<div class="flex items-center space-x-2">
						<span class="loading loading-sm loading-spinner" />
						<span>Loading event history...</span>
					</div>
				{:else if relatedEvents.length > 0}
					<ul class="steps steps-vertical w-full">
						{#each relatedEvents as event (event.id)}
							<li class="step step-primary" data-content="●">
								<div class="p-2 text-left">
									<p class="font-semibold">{event.description}</p>
									<p class="text-xs opacity-70">{formatDate(event.timestamp)}</p>
								</div>
							</li>
						{/each}
					</ul>
				{:else}
					<p>No event history available for this transaction.</p>
				{/if}
			</div>
		</div>
	</div>
</div>
