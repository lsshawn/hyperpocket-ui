<script lang="ts">
	import { goto } from '$app/navigation';
	import Icon from '@iconify/svelte';

	let cardholderName = $state('');
	let cardNumber = $state('');
	let expiryDate = $state('');
	let cvc = $state('');
	let country = $state('US');
	let isLoading = $state(false);

	function formatCardNumber(e: Event) {
		const target = e.target as HTMLInputElement;
		let value = target.value.replace(/\D/g, '');
		value = value.substring(0, 16);
		const groups = value.match(/.{1,4}/g);
		cardNumber = groups ? groups.join(' ') : '';
	}

	function formatExpiryDate(e: Event) {
		const target = e.target as HTMLInputElement;
		let value = target.value.replace(/\D/g, '');
		value = value.substring(0, 4);
		if (value.length > 2) {
			expiryDate = `${value.slice(0, 2)} / ${value.slice(2)}`;
		} else {
			expiryDate = value;
		}
	}

	async function handleSubmit() {
		isLoading = true;
		// Simulate API call
		await new Promise((resolve) => setTimeout(resolve, 1500));
		goto('/payment-gateway/completed');
	}
</script>

<svelte:head>
	<title>Credit Card Payment</title>
</svelte:head>

<div class="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 font-sans">
	<div class="relative w-full max-w-md rounded-xl bg-white p-6 shadow-md md:p-8">
		<a href="/payment-gateway" class="btn absolute top-4 left-4 btn-ghost btn-sm">
			<Icon icon="lucide:arrow-left" class="h-4 w-4" />
			Back
		</a>
		<h1 class="mb-6 text-center text-2xl font-bold text-gray-800">Pay with Card</h1>

		<form onsubmit={handleSubmit} class="space-y-4">
			<div>
				<label for="cardholder-name" class="label">
					<span class="label-text">Cardholder Name</span>
				</label>
				<input
					id="cardholder-name"
					type="text"
					placeholder="John Doe"
					class="input-bordered input w-full"
					bind:value={cardholderName}
					required
				/>
			</div>

			<div>
				<label for="card-number" class="label">
					<span class="label-text">Card Number</span>
				</label>
				<div class="relative">
					<input
						id="card-number"
						type="tel"
						inputmode="numeric"
						placeholder="0000 0000 0000 0000"
						class="input-bordered input w-full pl-10"
						bind:value={cardNumber}
						oninput={formatCardNumber}
						required
					/>
					<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
						<Icon icon="lucide:credit-card" class="h-5 w-5 text-gray-400" />
					</div>
				</div>
			</div>

			<div class="grid grid-cols-2 gap-4">
				<div>
					<label for="expiry-date" class="label">
						<span class="label-text">Expiry Date</span>
					</label>
					<input
						id="expiry-date"
						type="text"
						placeholder="MM / YY"
						class="input-bordered input w-full"
						bind:value={expiryDate}
						oninput={formatExpiryDate}
						required
					/>
				</div>
				<div>
					<label for="cvc" class="label">
						<span class="label-text">CVC</span>
					</label>
					<input
						id="cvc"
						type="tel"
						inputmode="numeric"
						placeholder="123"
						class="input-bordered input w-full"
						bind:value={cvc}
						maxlength="4"
						required
					/>
				</div>
			</div>

			<div>
				<label for="country" class="label">
					<span class="label-text">Country or region</span>
				</label>
				<select id="country" class="select-bordered select w-full" bind:value={country} required>
					<option value="US">United States</option>
					<option value="CA">Canada</option>
					<option value="GB">United Kingdom</option>
					<option value="AU">Australia</option>
					<!-- Add more countries as needed -->
				</select>
			</div>

			<div class="pt-4">
				<button type="submit" class="btn btn-block btn-primary" disabled={isLoading}>
					{#if isLoading}
						<span class="loading loading-spinner"></span>
						Processing...
					{:else}
						Pay $25.00
					{/if}
				</button>
			</div>
		</form>
	</div>
</div>
