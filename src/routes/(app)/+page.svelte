<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import Icon from '@iconify/svelte';
	import { WalletApiClient } from '$lib/api/wallet-client';
	import { config } from '$lib/config';
	import type { Transaction, WalletAccount, Currency } from '$lib/types/wallet';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const apiClient = new WalletApiClient(config.walletApiUrl);

	// State
	let walletAccounts = $state<WalletAccount[]>([]);
	let recentTransactions = $state<Transaction[]>([]);
	let loading = $state(true);
	let error = $state('');
	let selectedCurrency = $state<Currency>('USD');

	const currencies: Currency[] = ['USD', 'THB', 'MYR', 'SGD', 'EUR', 'GBP'];

	async function loadWalletData() {
		loading = true;
		error = '';

		try {
			// Get user ID from layout data
			const userId = data.user?.id?.toString() || 'demo-user-123';

			// Load wallet balances for all currencies
			const accountPromises = currencies.map(currency =>
				apiClient.getWalletBalance(userId, currency).catch(() => null)
			);

			const accounts = await Promise.all(accountPromises);
			walletAccounts = accounts.filter((acc): acc is WalletAccount => acc !== null);

			// Load recent transactions for selected currency
			const txResponse = await apiClient.getAdminTransactions({
				userId,
				currency: selectedCurrency,
				limit: 5,
				page: 1
			});

			recentTransactions = txResponse.data.transactions;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load wallet data';
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

	const selectedAccount = $derived(
		walletAccounts.find(acc => acc.currency === selectedCurrency) || walletAccounts[0]
	);

	onMount(() => {
		loadWalletData();
	});
</script>

<svelte:head>
	<title>Wallet Dashboard</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 p-4 font-sans md:p-8">
	<div class="mx-auto max-w-4xl">
		<div class="mb-6 flex items-center justify-between">
			<h1 class="text-3xl font-bold text-gray-800">My Wallet</h1>
			<button class="btn btn-ghost btn-sm" onclick={loadWalletData}>
				<Icon icon="lucide:refresh-cw" class="h-4 w-4" />
			</button>
		</div>

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
			<!-- Currency Selector -->
			<div class="mb-6 flex gap-2 overflow-x-auto pb-2">
				{#each walletAccounts as account}
					<button
						class="btn btn-sm"
						class:btn-primary={selectedCurrency === account.currency}
						class:btn-outline={selectedCurrency !== account.currency}
						onclick={() => {
							selectedCurrency = account.currency as Currency;
							loadWalletData();
						}}
					>
						{account.currency}
					</button>
				{/each}
			</div>

			<!-- Balance Card -->
			{#if selectedAccount}
				<div class="mb-6 rounded-xl bg-gradient-to-br from-primary to-primary-focus p-6 text-white shadow-lg">
					<p class="text-sm opacity-90">Available Balance</p>
					<p class="mb-2 text-5xl font-bold">
						{formatCurrency(selectedAccount.availableBalance, selectedAccount.currency)}
					</p>
					<div class="mt-4 flex items-center gap-4 text-sm opacity-75">
						<div>
							<span>Total:</span>
							<span class="ml-2 font-semibold">
								{formatCurrency(selectedAccount.balance, selectedAccount.currency)}
							</span>
						</div>
						{#if parseFloat(selectedAccount.balance) > parseFloat(selectedAccount.availableBalance)}
							<div class="badge badge-warning badge-sm">
								{formatCurrency(
									(parseFloat(selectedAccount.balance) - parseFloat(selectedAccount.availableBalance)).toString(),
									selectedAccount.currency
								)} pending
							</div>
						{/if}
					</div>
				</div>
			{:else}
				<div class="mb-6 rounded-xl bg-base-100 p-6 text-center shadow-md">
					<Icon icon="lucide:wallet" class="mx-auto mb-4 h-16 w-16 text-gray-300" />
					<p class="text-gray-600">No wallet found for {selectedCurrency}</p>
					<button class="btn btn-primary btn-sm mt-4">Create Wallet</button>
				</div>
			{/if}

			<!-- Quick Actions -->
			<div class="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
				<button class="btn btn-outline" onclick={() => goto('/top-up')}>
					<Icon icon="lucide:plus-circle" class="h-5 w-5" />
					<span>Top Up</span>
				</button>
				<button class="btn btn-outline" onclick={() => goto('/payment-gateway')}>
					<Icon icon="lucide:credit-card" class="h-5 w-5" />
					<span>Pay</span>
				</button>
				<button class="btn btn-outline">
					<Icon icon="lucide:send" class="h-5 w-5" />
					<span>Transfer</span>
				</button>
				<button class="btn btn-outline" onclick={() => goto('/transactions')}>
					<Icon icon="lucide:list" class="h-5 w-5" />
					<span>History</span>
				</button>
			</div>

			<!-- Recent Transactions -->
			<div>
				<div class="mb-4 flex items-center justify-between">
					<h2 class="text-xl font-bold text-gray-800">Recent Transactions</h2>
					<button class="btn btn-ghost btn-sm" onclick={() => goto('/transactions')}>
						View All
						<Icon icon="lucide:arrow-right" class="h-4 w-4" />
					</button>
				</div>

				{#if recentTransactions.length === 0}
					<div class="rounded-lg bg-base-100 p-8 text-center shadow-sm">
						<Icon icon="lucide:inbox" class="mx-auto mb-4 h-12 w-12 text-gray-300" />
						<p class="text-gray-500">No transactions yet</p>
						<p class="text-sm text-gray-400">Your transaction history will appear here</p>
					</div>
				{:else}
					<div class="space-y-3">
						{#each recentTransactions as transaction (transaction.id)}
							<button
								class="flex w-full items-center justify-between rounded-lg bg-white p-4 shadow-sm transition-all hover:shadow-md"
								onclick={() => goto(`/transactions/${transaction.id}`)}
							>
								<div class="flex items-center gap-4">
									<div
										class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
										class:bg-success/20={transaction.direction === 'credit'}
										class:bg-error/20={transaction.direction === 'debit'}
									>
										<Icon
											icon={getTypeIcon(transaction.type, transaction.direction)}
											class="h-6 w-6"
											class:text-success={transaction.direction === 'credit'}
											class:text-error={transaction.direction === 'debit'}
										/>
									</div>
									<div class="text-left">
										<p class="font-semibold text-gray-800">
											{transaction.description || `${transaction.type} transaction`}
										</p>
										<div class="flex items-center gap-2">
											<p class="text-sm text-gray-500">{formatDate(transaction.createdAt)}</p>
											<div class="badge badge-xs {transaction.status === 'completed' ? 'badge-success' : 'badge-warning'}">
												{transaction.status}
											</div>
										</div>
									</div>
								</div>
								<div class="text-right">
									<p
										class="whitespace-nowrap font-semibold"
										class:text-success={transaction.direction === 'credit'}
										class:text-error={transaction.direction === 'debit'}
									>
										{transaction.direction === 'credit' ? '+' : '-'}
										{formatCurrency(transaction.netAmount, transaction.currency)}
									</p>
									{#if parseFloat(transaction.fee) > 0}
										<p class="text-xs text-gray-500">
											Fee: {formatCurrency(transaction.fee, transaction.currency)}
										</p>
									{/if}
								</div>
							</button>
						{/each}
					</div>
				{/if}
			</div>
		{/if}
	</div>
</div>
