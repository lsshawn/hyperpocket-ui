<script lang="ts">
	import { goto } from '$app/navigation';

	let pin = $state(['', '', '', '', '', '']);
	let isLoading = $state(false);
	let errorMessage = $state('');

	const isPinComplete = $derived(pin.every((digit) => digit !== ''));

	function handleInput(event: Event, index: number) {
		const target = event.target as HTMLInputElement;
		const value = target.value;

		if (!/^\d*$/.test(value)) {
			target.value = pin[index]; // revert
			return;
		}

		pin[index] = value;

		if (value && index < pin.length - 1) {
			(target.nextElementSibling as HTMLElement)?.focus();
		}
	}

	function handlePaste(event: ClipboardEvent) {
		event.preventDefault();
		const paste = event.clipboardData?.getData('text') ?? '';
		const numbers = paste
			.split('')
			.filter((char) => /^\d$/.test(char))
			.slice(0, pin.length);

		numbers.forEach((num, i) => {
			pin[i] = num;
		});

		const form = (event.target as HTMLInputElement).form;
		if (!form) return;

		const nextFocusIndex = Math.min(numbers.length, pin.length - 1);
		(form.elements.namedItem(`pin-input-${nextFocusIndex}`) as HTMLElement)?.focus();
	}

	function handleKeydown(event: KeyboardEvent, index: number) {
		if (event.key === 'Backspace' && (event.target as HTMLInputElement).value === '' && index > 0) {
			pin[index - 1] = '';
			((event.target as HTMLInputElement).previousElementSibling as HTMLElement)?.focus();
		}
	}

	async function handleSubmit() {
		if (!isPinComplete) return;

		isLoading = true;
		errorMessage = '';

		// Simulate API call to verify PIN and process payment
		await new Promise((resolve) => setTimeout(resolve, 1500));

		// Mock PIN check
		if (pin.join('') === '123456') {
			// success pin
			goto('/payment-gateway/completed');
		} else {
			// error pin
			errorMessage = 'Invalid PIN. Please try again.';
			isLoading = false;
			pin = ['', '', '', '', '', ''];
			const firstInput = document.getElementById('pin-input-0');
			if (firstInput) firstInput.focus();
		}
	}
</script>

<svelte:head>
	<title>Confirm Payment</title>
</svelte:head>

<div class="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 font-sans">
	<div class="w-full max-w-md rounded-xl bg-white p-6 shadow-md md:p-8">
		<h1 class="mb-4 text-center text-2xl font-bold text-gray-800">Confirm Your Payment</h1>

		<div class="mb-6 rounded-lg border border-gray-200 p-4">
			<p class="text-center text-gray-600">You are paying</p>
			<p class="text-center text-4xl font-bold text-gray-800">$20.00</p>
			<p class="mt-1 text-center text-sm text-gray-500">using your Hyperpocket Wallet</p>
		</div>

		<form on:submit|preventDefault={handleSubmit}>
			<label for="pin-input-0" class="label justify-center">
				<span class="label-text">Enter your 6-digit PIN</span>
			</label>

			<div class="flex justify-center space-x-2">
				{#each pin as _, index}
					<input
						name={`pin-input-${index}`}
						id={`pin-input-${index}`}
						type="password"
						inputmode="numeric"
						maxlength="1"
						pattern="[0-9]"
						class="h-12 w-10 rounded-md border bg-base-100 text-center text-2xl"
						bind:value={pin[index]}
						on:input={(event) => handleInput(event, index)}
						on:paste={handlePaste}
						on:focus={(e) => e.target.select()}
						on:keydown={(event) => handleKeydown(event, index)}
						required
						autocomplete="one-time-code"
					/>
				{/each}
			</div>

			{#if errorMessage}
				<p class="mt-4 text-center text-sm text-red-500">{errorMessage}</p>
			{/if}

			<div class="pt-6">
				<button type="submit" class="btn btn-primary btn-block" disabled={isLoading || !isPinComplete}>
					{#if isLoading}
						<span class="loading loading-spinner"></span>
						Processing...
					{:else}
						Confirm & Pay $20.00
					{/if}
				</button>
			</div>
		</form>
	</div>
</div>
