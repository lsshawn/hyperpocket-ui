<script lang="ts">
	import { onMount } from 'svelte';
	import Icon from '@iconify/svelte';
	import { WalletApiClient } from '$lib/api/wallet-client';
	import { config } from '$lib/config';
	import type { FeeSummaryItem, ProcessorBreakdownItem } from '$lib/types/wallet';

	const apiClient = new WalletApiClient(config.walletApiUrl);

	// State
	let feeSummary = $state<FeeSummaryItem[]>([]);
	let processorBreakdown = $state<ProcessorBreakdownItem[]>([]);
	let totals = $state({
		totalGrossAmount: '0',
		totalProcessorFees: '0',
		totalNetAmount: '0',
		transactionCount: 0
	});
	let loading = $state(true);
	let error = $state('');

	// Filters
	let startDate = $state('');
	let endDate = $state('');
	let currency = $state<string | undefined>(undefined);

	async function loadData() {
		loading = true;
		error = '';

		try {
			const [summaryResponse, breakdownResponse] = await Promise.all([
				apiClient.getFeeSummary({ startDate, endDate, currency }),
				apiClient.getProcessorBreakdown()
			]);

			feeSummary = summaryResponse.data.summary;
			totals = summaryResponse.data.totals;
			processorBreakdown = breakdownResponse.data;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load fee data';
		} finally {
			loading = false;
		}
	}

	function formatAmount(amount: string, currency: string): string {
		return `${currency} ${parseFloat(amount).toLocaleString(undefined, {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2
		})}`;
	}

	function formatPercentage(percentage: string): string {
		return `${parseFloat(percentage).toFixed(2)}%`;
	}

	function calculateProfitMargin(): string {
		const gross = parseFloat(totals.totalGrossAmount);
		const fees = parseFloat(totals.totalProcessorFees);
		if (gross === 0) return '0.00';
		return ((gross - fees) / gross * 100).toFixed(2);
	}

	onMount(() => {
		loadData();
	});
</script>

<svelte:head>
	<title>Admin - Fee Analytics</title>
</svelte:head>

<div class="container mx-auto p-6">
	<div class="mb-6 flex items-center justify-between">
		<h1 class="text-3xl font-bold">Fee Analytics</h1>
		<button class="btn btn-primary btn-sm" onclick={loadData}>
			<Icon icon="lucide:refresh-cw" class="h-4 w-4" />
			Refresh
		</button>
	</div>

	<!-- Filters -->
	<div class="card mb-6 bg-base-100 shadow-xl">
		<div class="card-body">
			<h2 class="card-title text-lg">Filters</h2>
			<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
				<div class="form-control">
					<label class="label">
						<span class="label-text">Currency</span>
					</label>
					<select class="select select-bordered" bind:value={currency} onchange={loadData}>
						<option value={undefined}>All Currencies</option>
						<option value="USD">USD</option>
						<option value="THB">THB</option>
						<option value="MYR">MYR</option>
						<option value="SGD">SGD</option>
						<option value="EUR">EUR</option>
						<option value="GBP">GBP</option>
					</select>
				</div>

				<div class="form-control">
					<label class="label">
						<span class="label-text">Start Date</span>
					</label>
					<input type="date" class="input input-bordered" bind:value={startDate} onchange={loadData} />
				</div>

				<div class="form-control">
					<label class="label">
						<span class="label-text">End Date</span>
					</label>
					<input type="date" class="input input-bordered" bind:value={endDate} onchange={loadData} />
				</div>
			</div>
		</div>
	</div>

	<!-- Error Alert -->
	{#if error}
		<div class="alert alert-error mb-6">
			<Icon icon="lucide:alert-circle" class="h-6 w-6" />
			<span>{error}</span>
		</div>
	{/if}

	{#if loading}
		<div class="flex h-64 items-center justify-center">
			<span class="loading loading-spinner loading-lg"></span>
		</div>
	{:else}
		<!-- Summary Stats -->
		<div class="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
			<div class="stat bg-base-100 shadow">
				<div class="stat-figure text-primary">
					<Icon icon="lucide:trending-up" class="h-8 w-8" />
				</div>
				<div class="stat-title">Total Volume</div>
				<div class="stat-value text-primary text-2xl">
					{parseFloat(totals.totalGrossAmount).toLocaleString()}
				</div>
				<div class="stat-desc">Across all transactions</div>
			</div>

			<div class="stat bg-base-100 shadow">
				<div class="stat-figure text-error">
					<Icon icon="lucide:credit-card" class="h-8 w-8" />
				</div>
				<div class="stat-title">Processor Fees</div>
				<div class="stat-value text-error text-2xl">
					{parseFloat(totals.totalProcessorFees).toLocaleString()}
				</div>
				<div class="stat-desc">Total fees paid</div>
			</div>

			<div class="stat bg-base-100 shadow">
				<div class="stat-figure text-success">
					<Icon icon="lucide:dollar-sign" class="h-8 w-8" />
				</div>
				<div class="stat-title">Net Amount</div>
				<div class="stat-value text-success text-2xl">
					{parseFloat(totals.totalNetAmount).toLocaleString()}
				</div>
				<div class="stat-desc">After fees</div>
			</div>

			<div class="stat bg-base-100 shadow">
				<div class="stat-figure text-info">
					<Icon icon="lucide:percent" class="h-8 w-8" />
				</div>
				<div class="stat-title">Profit Margin</div>
				<div class="stat-value text-info text-2xl">{calculateProfitMargin()}%</div>
				<div class="stat-desc">{totals.transactionCount} transactions</div>
			</div>
		</div>

		<!-- Fee Summary by Type -->
		<div class="card mb-6 bg-base-100 shadow-xl">
			<div class="card-body">
				<h2 class="card-title">Fee Summary by Transaction Type</h2>
				<div class="overflow-x-auto">
					<table class="table table-zebra">
						<thead>
							<tr>
								<th>Type</th>
								<th>Currency</th>
								<th>Processor</th>
								<th>Transactions</th>
								<th>Gross Amount</th>
								<th>Fees Paid</th>
								<th>Net Amount</th>
								<th>Avg Fee %</th>
							</tr>
						</thead>
						<tbody>
							{#each feeSummary as item}
								<tr>
									<td><div class="badge badge-outline">{item.type}</div></td>
									<td><div class="badge">{item.currency}</div></td>
									<td><div class="badge badge-sm">{item.processor}</div></td>
									<td class="font-semibold">{item.transactionCount.toLocaleString()}</td>
									<td class="font-mono">{formatAmount(item.totalGrossAmount, item.currency)}</td>
									<td class="font-mono text-error">{formatAmount(item.totalFees, item.currency)}</td>
									<td class="font-mono text-success">
										{formatAmount(item.totalNetAmount, item.currency)}
									</td>
									<td class="font-mono">
										{((parseFloat(item.totalFees) / parseFloat(item.totalGrossAmount)) * 100).toFixed(2)}%
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		</div>

		<!-- Processor Breakdown -->
		<div class="card bg-base-100 shadow-xl">
			<div class="card-body">
				<h2 class="card-title">Processor Performance Comparison</h2>
				<p class="text-sm text-gray-600 mb-4">
					Compare costs and efficiency across payment processors
				</p>
				<div class="overflow-x-auto">
					<table class="table table-zebra">
						<thead>
							<tr>
								<th>Processor</th>
								<th>Currency</th>
								<th>Transactions</th>
								<th>Total Volume</th>
								<th>Fees Paid</th>
								<th>Avg Fee %</th>
								<th>Efficiency</th>
							</tr>
						</thead>
						<tbody>
							{#each processorBreakdown as processor}
								{@const avgFee = parseFloat(processor.avgFeePercentage)}
								{@const efficiency = avgFee < 3 ? 'Excellent' : avgFee < 3.5 ? 'Good' : 'Average'}
								{@const efficiencyClass = avgFee < 3 ? 'badge-success' : avgFee < 3.5 ? 'badge-info' : 'badge-warning'}
								<tr>
									<td>
										<div class="flex items-center gap-2">
											<div class="badge badge-lg">{processor.processor}</div>
										</div>
									</td>
									<td><div class="badge">{processor.currency}</div></td>
									<td class="font-semibold">{processor.totalTransactions.toLocaleString()}</td>
									<td class="font-mono">{formatAmount(processor.totalVolume, processor.currency)}</td>
									<td class="font-mono text-error">
										{formatAmount(processor.totalFeesPaid, processor.currency)}
									</td>
									<td class="font-mono font-semibold">{formatPercentage(processor.avgFeePercentage)}</td>
									<td>
										<div class="badge {efficiencyClass}">{efficiency}</div>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		</div>

		<!-- Insights -->
		<div class="mt-6 rounded-lg bg-info/10 p-4">
			<div class="flex gap-2">
				<Icon icon="lucide:lightbulb" class="h-5 w-5 shrink-0 text-info" />
				<div class="text-sm">
					<p class="font-semibold text-gray-800">Insights</p>
					<ul class="mt-2 list-disc space-y-1 pl-5 text-gray-600">
						<li>Monitor processor fees to optimize routing decisions</li>
						<li>Consider volume discounts when negotiating with processors</li>
						<li>Track profit margin to ensure sustainable business model</li>
						<li>Compare processors by currency for regional optimization</li>
					</ul>
				</div>
			</div>
		</div>
	{/if}
</div>
