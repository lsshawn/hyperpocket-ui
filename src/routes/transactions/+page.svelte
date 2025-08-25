<script>
	import { goto } from '$app/navigation';
	/** @type {import('./$types').PageData} */
	export let data;

	function formatCurrency(amount, currency) {
		return new Intl.NumberFormat(undefined, {
			style: 'currency',
			currency: currency
		}).format(amount);
	}
</script>

<div class="container mx-auto p-4 md:p-8">
	<h1 class="text-3xl font-bold mb-6">Your Transactions</h1>
	<div class="overflow-x-auto bg-base-100 rounded-box shadow">
		<table class="table w-full">
			<thead>
				<tr>
					<th>Date</th>
					<th>Description</th>
					<th>Type</th>
					<th>Status</th>
					<th class="text-right">Amount</th>
				</tr>
			</thead>
			<tbody>
				{#each data.transactions as tx (tx.id)}
					<tr class="hover cursor-pointer" on:click={() => goto(`/transactions/${tx.id}`)}>
						<td>
							<div class="flex items-center space-x-3">
								<div>
									<div class="font-bold">
										{new Date(tx.createdAt).toLocaleDateString(undefined, {
											month: 'short',
											day: 'numeric'
										})}
									</div>
									<div class="text-sm opacity-50">
										{new Date(tx.createdAt).toLocaleDateString(undefined, { year: 'numeric' })}
									</div>
								</div>
							</div>
						</td>
						<td>{tx.description}</td>
						<td>
							<span
								class="badge badge-ghost capitalize"
								class:badge-success={tx.direction === 'credit'}
								class:badge-error={tx.direction === 'debit'}
							>
								{tx.type}
							</span>
						</td>
						<td class="capitalize">{tx.status}</td>
						<td class="text-right">
							<span class:text-success={tx.direction === 'credit'} class:text-error={tx.direction === 'debit'}>
								{tx.direction === 'credit' ? '+' : '-'}
								{formatCurrency(tx.grossAmount, tx.currency)}
							</span>
							<br />
							<span class="text-xs opacity-60">Fee: {formatCurrency(tx.fee, tx.currency)}</span>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
