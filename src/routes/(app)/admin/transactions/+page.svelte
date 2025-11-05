<script lang="ts">
	import { onMount } from 'svelte';
	import Icon from '@iconify/svelte';
	import { WalletApiClient } from '$lib/api/wallet-client';
	import { config } from '$lib/config';
	import type { AdminTransactionsRequest, Transaction } from '$lib/types/wallet';

	const apiClient = new WalletApiClient(config.walletApiUrl);

	// State
	let transactions = $state<Transaction[]>([]);
	let loading = $state(true);
	let error = $state('');

	// Pagination
	let currentPage = $state(1);
	let totalPages = $state(1);
	let totalRecords = $state(0);
	let limit = $state(50);

	// Filters
	let filters = $state<AdminTransactionsRequest>({
		page: 1,
		limit: 50,
		type: undefined,
		currency: undefined,
		processor: undefined,
		startDate: '',
		endDate: ''
	});

	async function loadTransactions() {
		loading = true;
		error = '';

		try {
			const response = await apiClient.getAdminTransactions({
				...filters,
				page: currentPage,
				limit
			});

			transactions = response.data.transactions;
			currentPage = response.data.pagination.page;
			totalPages = response.data.pagination.totalPages;
			totalRecords = response.data.pagination.total;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load transactions';
		} finally {
			loading = false;
		}
	}

	function handleFilterChange() {
		currentPage = 1; // Reset to first page
		loadTransactions();
	}

	function nextPage() {
		if (currentPage < totalPages) {
			currentPage++;
			loadTransactions();
		}
	}

	function previousPage() {
		if (currentPage > 1) {
			currentPage--;
			loadTransactions();
		}
	}

	function formatAmount(amount: string, currency: string): string {
		return `${currency} ${parseFloat(amount).toFixed(2)}`;
	}

	function formatDate(dateString: string): string {
		return new Date(dateString).toLocaleString();
	}

	function getStatusBadgeClass(status: string): string {
		switch (status) {
			case 'completed':
				return 'badge-success';
			case 'pending':
				return 'badge-warning';
			case 'failed':
				return 'badge-error';
			case 'cancelled':
			case 'reversed':
				return 'badge-ghost';
			default:
				return 'badge-neutral';
		}
	}

	onMount(() => {
		loadTransactions();
	});
</script>

<svelte:head>
	<title>Admin - Transaction Monitoring</title>
</svelte:head>

<div class="container mx-auto p-6">
	<div class="mb-6 flex items-center justify-between">
		<h1 class="text-3xl font-bold">Transaction Monitoring</h1>
		<button class="btn btn-primary btn-sm" onclick={loadTransactions}>
			<Icon icon="lucide:refresh-cw" class="h-4 w-4" />
			Refresh
		</button>
	</div>

	<!-- Filters -->
	<div class="card mb-6 bg-base-100 shadow-xl">
		<div class="card-body">
			<h2 class="card-title text-lg">Filters</h2>
			<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
				<!-- Type Filter -->
				<div class="form-control">
					<label class="label">
						<span class="label-text">Type</span>
					</label>
					<select
						class="select select-bordered"
						bind:value={filters.type}
						onchange={handleFilterChange}
					>
						<option value={undefined}>All Types</option>
						<option value="deposit">Deposit</option>
						<option value="withdrawal">Withdrawal</option>
						<option value="transfer">Transfer</option>
						<option value="payment">Payment</option>
						<option value="fee">Fee</option>
						<option value="refund">Refund</option>
					</select>
				</div>

				<!-- Currency Filter -->
				<div class="form-control">
					<label class="label">
						<span class="label-text">Currency</span>
					</label>
					<select
						class="select select-bordered"
						bind:value={filters.currency}
						onchange={handleFilterChange}
					>
						<option value={undefined}>All Currencies</option>
						<option value="USD">USD</option>
						<option value="THB">THB</option>
						<option value="MYR">MYR</option>
						<option value="SGD">SGD</option>
						<option value="EUR">EUR</option>
						<option value="GBP">GBP</option>
					</select>
				</div>

				<!-- Processor Filter -->
				<div class="form-control">
					<label class="label">
						<span class="label-text">Processor</span>
					</label>
					<select
						class="select select-bordered"
						bind:value={filters.processor}
						onchange={handleFilterChange}
					>
						<option value={undefined}>All Processors</option>
						<option value="braintree">Braintree</option>
						<option value="stripe">Stripe</option>
						<option value="adyen">Adyen</option>
						<option value="razorpay">Razorpay</option>
					</select>
				</div>

				<!-- Limit Filter -->
				<div class="form-control">
					<label class="label">
						<span class="label-text">Per Page</span>
					</label>
					<select
						class="select select-bordered"
						bind:value={limit}
						onchange={() => {
							filters.limit = limit;
							handleFilterChange();
						}}
					>
						<option value={25}>25</option>
						<option value={50}>50</option>
						<option value={100}>100</option>
					</select>
				</div>

				<!-- Start Date -->
				<div class="form-control">
					<label class="label">
						<span class="label-text">Start Date</span>
					</label>
					<input
						type="date"
						class="input input-bordered"
						bind:value={filters.startDate}
						onchange={handleFilterChange}
					/>
				</div>

				<!-- End Date -->
				<div class="form-control">
					<label class="label">
						<span class="label-text">End Date</span>
					</label>
					<input
						type="date"
						class="input input-bordered"
						bind:value={filters.endDate}
						onchange={handleFilterChange}
					/>
				</div>
			</div>
		</div>
	</div>

	<!-- Stats -->
	<div class="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
		<div class="stat bg-base-100 shadow">
			<div class="stat-title">Total Transactions</div>
			<div class="stat-value text-primary">{totalRecords.toLocaleString()}</div>
		</div>
		<div class="stat bg-base-100 shadow">
			<div class="stat-title">Current Page</div>
			<div class="stat-value">{currentPage} / {totalPages}</div>
		</div>
		<div class="stat bg-base-100 shadow">
			<div class="stat-title">Showing</div>
			<div class="stat-value text-sm">{transactions.length} records</div>
		</div>
	</div>

	<!-- Error Alert -->
	{#if error}
		<div class="alert alert-error mb-6">
			<Icon icon="lucide:alert-circle" class="h-6 w-6" />
			<span>{error}</span>
		</div>
	{/if}

	<!-- Transactions Table -->
	<div class="card bg-base-100 shadow-xl">
		<div class="card-body p-0">
			{#if loading}
				<div class="flex h-64 items-center justify-center">
					<span class="loading loading-spinner loading-lg"></span>
				</div>
			{:else if transactions.length === 0}
				<div class="flex h-64 flex-col items-center justify-center text-gray-500">
					<Icon icon="lucide:inbox" class="mb-4 h-16 w-16" />
					<p>No transactions found</p>
				</div>
			{:else}
				<div class="overflow-x-auto">
					<table class="table table-zebra">
						<thead>
							<tr>
								<th>Date</th>
								<th>Type</th>
								<th>Direction</th>
								<th>Status</th>
								<th>Amount</th>
								<th>Fee</th>
								<th>Net</th>
								<th>Processor</th>
								<th>Reference</th>
							</tr>
						</thead>
						<tbody>
							{#each transactions as transaction}
								<tr>
									<td class="text-sm">{formatDate(transaction.createdAt)}</td>
									<td>
										<div class="badge badge-outline">{transaction.type}</div>
									</td>
									<td>
										{#if transaction.direction === 'credit'}
											<Icon icon="lucide:arrow-down-circle" class="h-5 w-5 text-success" />
										{:else}
											<Icon icon="lucide:arrow-up-circle" class="h-5 w-5 text-error" />
										{/if}
									</td>
									<td>
										<div class="badge {getStatusBadgeClass(transaction.status)}">
											{transaction.status}
										</div>
									</td>
									<td class="font-mono text-sm">
										{formatAmount(transaction.grossAmount, transaction.currency)}
									</td>
									<td class="font-mono text-sm text-error">
										{formatAmount(transaction.fee, transaction.currency)}
									</td>
									<td class="font-mono text-sm font-semibold">
										{formatAmount(transaction.netAmount, transaction.currency)}
									</td>
									<td>
										{#if transaction.processor}
											<div class="badge badge-sm">{transaction.processor}</div>
										{:else}
											<span class="text-gray-400">-</span>
										{/if}
									</td>
									<td class="font-mono text-xs">{transaction.reference || '-'}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>

				<!-- Pagination -->
				<div class="border-t p-4">
					<div class="flex items-center justify-between">
						<div class="text-sm text-gray-600">
							Showing {(currentPage - 1) * limit + 1} to {Math.min(currentPage * limit, totalRecords)}
							of {totalRecords} results
						</div>
						<div class="join">
							<button class="btn join-item btn-sm" onclick={previousPage} disabled={currentPage === 1}>
								<Icon icon="lucide:chevron-left" class="h-4 w-4" />
								Previous
							</button>
							<button class="btn join-item btn-sm">Page {currentPage}</button>
							<button
								class="btn join-item btn-sm"
								onclick={nextPage}
								disabled={currentPage === totalPages}
							>
								Next
								<Icon icon="lucide:chevron-right" class="h-4 w-4" />
							</button>
						</div>
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>
