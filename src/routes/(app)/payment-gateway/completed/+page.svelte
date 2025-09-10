<script lang="ts">
	import Icon from '@iconify/svelte';
</script>

<svelte:head>
	<title>Payment Successful</title>
</svelte:head>

<div class="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 font-sans">
	<div class="w-full max-w-md rounded-xl bg-white p-8 text-center shadow-md">
		<div class="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
			<Icon icon="lucide:check-circle-2" class="h-8 w-8 text-green-600" />
		</div>
		<h1 class="mb-4 text-2xl font-bold text-gray-800">Payment Successful</h1>
		<p class="mb-8 text-gray-600">
			Thank you for your payment. Your transaction has been completed successfully.
		</p>
		<a href="/" class="btn btn-block btn-primary">Redirecting you back to the app...</a>
	</div>
</div>
