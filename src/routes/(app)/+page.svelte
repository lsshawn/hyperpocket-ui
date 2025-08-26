<script>
	let { data } = $props();
	let users = $state([
		{ id: 1, name: 'John Doe' },
		{ id: 2, name: 'Jane Doe' }
	]);

	let totalUsers = $derived(users.length);
</script>

<div class="bg-green-200">
	this is page user id : {data.user.id}
</div>
