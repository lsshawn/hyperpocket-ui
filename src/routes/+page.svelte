<script>
	let users = $state([
		{ id: 1, name: 'John Doe' },
		{ id: 2, name: 'Jane Doe' }
	]);

	let totalUsers = $derived(users.length);
</script>
