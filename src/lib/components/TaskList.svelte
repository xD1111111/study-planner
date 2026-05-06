<script lang="ts">
	import TaskCard from '$lib/components/TaskCard.svelte';
	import type { Filter, Task } from '$lib/types';

	let {
		tasks,
		activeFilter,
		onToggle,
		onDelete
	}: {
		tasks: Task[];
		activeFilter: Filter;
		onToggle: (id: number) => void;
		onDelete: (id: number) => void;
	} = $props();
</script>

<main>
	<div class="mb-5 flex items-center gap-3">
		<h2 class="font-['Syne',sans-serif] text-xl font-bold text-[#eaedf5]">Список завдань</h2>
		<span
			class="rounded-full border border-white/[0.07] bg-[#181c27] px-2.5 py-0.5 text-xs font-semibold text-[#7a8099]"
			>{tasks.length}</span
		>
	</div>

	{#if tasks.length === 0}
		<div class="px-5 py-15 text-center">
			<div class="mb-4 text-5xl opacity-50">🎯</div>
			<p class="mb-2 text-base text-[#7a8099]">
				{activeFilter === 'all' ? "Тут з'являться твої завдання" : 'Немає завдань у цій категорії'}
			</p>
			{#if activeFilter === 'all'}
				<span class="text-[13px] text-[#7a8099]/60">Додай перше завдання зліва →</span>
			{/if}
		</div>
	{:else}
		{#each tasks as task, index (task.id)}
			<TaskCard {task} {index} {onToggle} {onDelete} />
		{/each}
	{/if}
</main>
