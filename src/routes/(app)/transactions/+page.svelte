<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import Icon from '@iconify/svelte';
	import { WalletApiClient } from '$lib/api/wallet-client';
	import { config } from '$lib/config';
	import type { Transaction, Currency, TransactionType, PageData } from '$lib/types/wallet';

	let { data }: { data: PageData } = $props();

	const apiClient = new WalletApiClient(config.walletApiUrl);

	// State
	let transactions = $state<Transaction[]>([]);
	let loading = $state(true);
	let error = $state('');

	// Filters
	let selectedCurrency = $state<Currency | 'all'>('all');
	let selectedType = $state<TransactionType | 'all'>('all');

	// Pagination
	let currentPage = $state(1);
	let totalPages = $state(1);
	let limit = $state(25);

	const currencies: Currency[] = ['USD', 'THB', 'MYR', 'SGD', 'EUR', 'GBP'];
	const transactionTypes: TransactionType[] = ['deposit', 'withdrawal', 'transfer', 'payment', 'fee', 'refund'];

	async function loadTransactions() {
		loading = true;
		error = '';

		try {
			const userId = data.user?.id?.toString() || 'demo-user-123';

			const response = await apiClient.getAdminTransactions({
				userId,
				currency: selectedCurrency === 'all' ? undefined : selectedCurrency,
				type: selectedType === 'all' ? undefined : selectedType,
				page: currentPage,
				limit
			});

			transactions = response.data.transactions;
			totalPages = response.data.pagination.totalPages;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load transactions';
		} finally {
			loading = false;
		}
	}

	function formatCurrency(amount: string, currency: string): string {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: currency
		}).format(parseFloat(amount));
	}

	function formatDate(dateString: string): string {
		return new Date(dateString).toLocaleDateString(undefined, {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		});
	}

	function getTypeIcon(type: string, direction: string): string {
		if (type === 'deposit') return 'lucide:arrow-down-circle';
		if (type === 'withdrawal') return 'lucide:arrow-up-circle';
		if (type === 'transfer') return direction === 'credit' ? 'lucide:arrow-down-left' : 'lucide:arrow-up-right';
		if (type === 'payment') return 'lucide:credit-card';
		if (type === 'fee') return 'lucide:percent';
		if (type === 'refund') return 'lucide:rotate-ccw';
		return 'lucide:circle';
	}

	function handleFilterChange() {
		currentPage = 1; // Reset to first page when filters change
		loadTransactions();
	}

	function goToPage(page: number) {
		currentPage = page;
		loadTransactions();
	}

	onMount(() => {
		loadTransactions();
	});
</script>

<svelte:head>
	<title>Transaction History</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 p-4 font-sans md:p-8">
	<div class="mx-auto max-w-6xl">
		<div class="mb-6 flex items-center justify-between">
			<h1 class="text-3xl font-bold text-gray-800">Transaction History</h1>
			<button class="btn btn-ghost btn-sm" onclick={loadTransactions}>
				<Icon icon="lucide:refresh-cw" class="h-4 w-4" />
			</button>
		</div>

		{#if error}
			<div class="alert alert-error mb-6">
				<Icon icon="lucide:alert-circle" class="h-6 w-6" />
				<span>{error}</span>
			</div>
		{/if}

		<!-- Filters -->
		<div class="mb-6 rounded-lg bg-white p-4 shadow-sm">
			<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
				<!-- Currency Filter -->
				<div class="form-control">
					<label class="label">
						<span class="label-text font-semibold">Currency</span>
					</label>
					<select
						class="select select-bordered"
						bind:value={selectedCurrency}
						onchange={handleFilterChange}
					>
						<option value="all">All Currencies</option>
						{#each currencies as currency}
							<option value={currency}>{currency}</option>
						{/each}
					</select>
				</div>

				<!-- Type Filter -->
				<div class="form-control">
					<label class="label">
						<span class="label-text font-semibold">Transaction Type</span>
					</label>
					<select
						class="select select-bordered"
						bind:value={selectedType}
						onchange={handleFilterChange}
					>
						<option value="all">All Types</option>
						{#each transactionTypes as type}
							<option value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
						{/each}
					</select>
				</div>

				<!-- Items Per Page -->
				<div class="form-control">
					<label class="label">
						<span class="label-text font-semibold">Items Per Page</span>
					</label>
					<select
						class="select select-bordered"
						bind:value={limit}
						onchange={handleFilterChange}
					>
						<option value={10}>10</option>
						<option value={25}>25</option>
						<option value={50}>50</option>
					</select>
				</div>
			</div>
		</div>

		{#if loading}
			<div class="flex h-64 items-center justify-center">
				<span class="loading loading-spinner loading-lg"></span>
			</div>
		{:else if transactions.length === 0}
			<div class="rounded-lg bg-white p-8 text-center shadow-sm">
				<Icon icon="lucide:inbox" class="mx-auto mb-4 h-12 w-12 text-gray-300" />
				<p class="text-gray-500">No transactions found</p>
				<p class="text-sm text-gray-400">Try adjusting your filters</p>
			</div>
		{:else}
			<!-- Transactions List -->
			<div class="overflow-hidden rounded-lg bg-white shadow-sm">
				<div class="overflow-x-auto">
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
							{#each transactions as tx (tx.id)}
								<tr class="hover cursor-pointer" onclick={() => goto(`/transactions/${tx.id}`)}>
									<td>
										<div class="flex items-center gap-3">
											<div
												class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
												class:bg-success/20={tx.direction === 'credit'}
												class:bg-error/20={tx.direction === 'debit'}
											>
												<Icon
													icon={getTypeIcon(tx.type, tx.direction)}
													class="h-5 w-5"
													class:text-success={tx.direction === 'credit'}
													class:text-error={tx.direction === 'debit'}
												/>
											</div>
											<div>
												<div class="font-bold">{formatDate(tx.createdAt)}</div>
												<div class="text-xs text-gray-500">{tx.currency}</div>
											</div>
										</div>
									</td>
									<td>
										<div class="font-medium text-gray-800">
											{tx.description || `${tx.type} transaction`}
										</div>
										{#if tx.reference}
											<div class="text-xs text-gray-500">Ref: {tx.reference}</div>
										{/if}
									</td>
									<td>
										<span
											class="badge badge-sm capitalize"
											class:badge-success={tx.direction === 'credit'}
											class:badge-error={tx.direction === 'debit'}
										>
											{tx.type}
										</span>
									</td>
									<td>
										<span
											class="badge badge-xs capitalize"
											class:badge-success={tx.status === 'completed'}
											class:badge-warning={tx.status === 'pending'}
											class:badge-error={tx.status === 'failed' || tx.status === 'cancelled'}
										>
											{tx.status}
										</span>
									</td>
									<td class="text-right">
										<div
											class="whitespace-nowrap font-semibold"
											class:text-success={tx.direction === 'credit'}
											class:text-error={tx.direction === 'debit'}
										>
											{tx.direction === 'credit' ? '+' : '-'}
											{formatCurrency(tx.netAmount, tx.currency)}
										</div>
										{#if parseFloat(tx.fee) > 0}
											<div class="text-xs text-gray-500">
												Fee: {formatCurrency(tx.fee, tx.currency)}
											</div>
										{/if}
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>

			<!-- Pagination -->
			{#if totalPages > 1}
				<div class="mt-6 flex items-center justify-between">
					<div class="text-sm text-gray-600">
						Page {currentPage} of {totalPages}
					</div>
					<div class="btn-group">
						<button
							class="btn btn-sm"
							disabled={currentPage === 1}
							onclick={() => goToPage(currentPage - 1)}
						>
							<Icon icon="lucide:chevron-left" class="h-4 w-4" />
						</button>

						{#if totalPages <= 7}
							{#each Array.from({ length: totalPages }, (_, i) => i + 1) as page}
								<button
									class="btn btn-sm"
									class:btn-active={currentPage === page}
									onclick={() => goToPage(page)}
								>
									{page}
								</button>
							{/each}
						{:else}
							<!-- Show first page -->
							<button
								class="btn btn-sm"
								class:btn-active={currentPage === 1}
								onclick={() => goToPage(1)}
							>
								1
							</button>

							{#if currentPage > 3}
								<button class="btn btn-sm btn-disabled">...</button>
							{/if}

							<!-- Show pages around current page -->
							{#each Array.from({ length: totalPages }, (_, i) => i + 1).filter(p => p > 1 && p < totalPages && Math.abs(p - currentPage) <= 1) as page}
								<button
									class="btn btn-sm"
									class:btn-active={currentPage === page}
									onclick={() => goToPage(page)}
								>
									{page}
								</button>
							{/each}

							{#if currentPage < totalPages - 2}
								<button class="btn btn-sm btn-disabled">...</button>
							{/if}

							<!-- Show last page -->
							<button
								class="btn btn-sm"
								class:btn-active={currentPage === totalPages}
								onclick={() => goToPage(totalPages)}
							>
								{totalPages}
							</button>
						{/if}

						<button
							class="btn btn-sm"
							disabled={currentPage === totalPages}
							onclick={() => goToPage(currentPage + 1)}
						>
							<Icon icon="lucide:chevron-right" class="h-4 w-4" />
						</button>
					</div>
				</div>
			{/if}
		{/if}
	</div>
</div>
