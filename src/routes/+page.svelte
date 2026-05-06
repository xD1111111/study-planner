<script lang="ts">
	import { onMount } from 'svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import TaskFilters from '$lib/components/TaskFilters.svelte';
	import TaskForm from '$lib/components/TaskForm.svelte';
	import TaskList from '$lib/components/TaskList.svelte';
	import TaskStats from '$lib/components/TaskStats.svelte';
	import type { Filter, Sort, Task } from '$lib/types';

	const storageKey = 'study-planner-tasks';
	const priorityOrder = { high: 0, medium: 1, low: 2 };
	const gridBackground =
		'linear-gradient(rgba(108,99,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(108,99,255,0.04) 1px, transparent 1px)';

	let tasks = $state<Task[]>([]);
	let activeFilter = $state<Filter>('all');
	let activeSort = $state<Sort>('date-added');
	let storageReady = $state(false);

	let completedTasks = $derived(tasks.filter((task) => task.completed).length);
	let activeTasks = $derived(tasks.length - completedTasks);
	let progressPercent = $derived(
		tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0
	);
	let visibleTasks = $derived.by(() => {
		let result = [...tasks];

		if (activeFilter === 'completed') result = result.filter((task) => task.completed);
		if (activeFilter === 'active') result = result.filter((task) => !task.completed);

		if (activeSort === 'priority') {
			result.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
		} else if (activeSort === 'deadline') {
			result.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
		} else {
			result.sort((a, b) => b.id - a.id);
		}

		return result;
	});

	onMount(() => {
		try {
			const savedTasks = localStorage.getItem(storageKey);
			tasks = savedTasks ? JSON.parse(savedTasks) : [];
		} catch {
			tasks = [];
		}
		storageReady = true;
	});

	$effect(() => {
		if (storageReady) {
			localStorage.setItem(storageKey, JSON.stringify(tasks));
		}
	});

	function addTask(task: Task) {
		tasks.push(task);
	}

	function deleteTask(id: number) {
		tasks = tasks.filter((task) => task.id !== id);
	}

	function toggleTask(id: number) {
		tasks = tasks.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task));
	}
</script>

<svelte:head>
	<title>Study Planner</title>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<div
	class="pointer-events-none fixed inset-0 z-0 bg-[length:40px_40px]"
	style:background-image={gridBackground}
></div>

<div class="relative z-10 mx-auto max-w-[1200px] px-6 pt-10 pb-15">
	<PageHeader />

	<div class="grid grid-cols-1 items-start gap-6 min-[861px]:grid-cols-[340px_1fr]">
		<aside>
			<TaskForm onAdd={addTask} />
			<TaskFilters
				{activeFilter}
				{activeSort}
				onFilterChange={(filter) => (activeFilter = filter)}
				onSortChange={(sort) => (activeSort = sort)}
			/>
			<TaskStats totalTasks={tasks.length} {completedTasks} {activeTasks} {progressPercent} />
		</aside>

		<TaskList tasks={visibleTasks} {activeFilter} onToggle={toggleTask} onDelete={deleteTask} />
	</div>
</div>
