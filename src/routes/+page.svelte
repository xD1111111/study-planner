<script lang="ts">
	import { onMount } from 'svelte';

	type Priority = 'low' | 'medium' | 'high';
	type Filter = 'all' | 'active' | 'completed';
	type Sort = 'date-added' | 'priority' | 'deadline';

	type Task = {
		id: number;
		title: string;
		subject: string;
		deadline: string;
		priority: Priority;
		completed: boolean;
	};

	const storageKey = 'study-planner-tasks';
	const priorityOrder: Record<Priority, number> = { high: 0, medium: 1, low: 2 };
	const priorityLabels: Record<Priority, string> = {
		low: 'Низький',
		medium: 'Середній',
		high: 'Високий'
	};

	const cardClass =
		'rounded-2xl border border-white/[0.07] bg-[#181c27] p-6 shadow-[0_8px_32px_rgba(0,0,0,0.4)] [animation:fadeUp_0.5s_ease_both]';
	const sectionTitleClass =
		"mb-4 font-['Syne',sans-serif] text-[13px] font-bold uppercase tracking-[0.1em] text-[#7a8099]";
	const labelClass = 'mb-1.5 block text-xs font-medium uppercase tracking-[0.06em] text-[#7a8099]';
	const inputClass =
		"w-full appearance-none rounded-[10px] border border-white/[0.07] bg-[#1f2436] px-3.5 py-2.5 text-sm text-[#eaedf5] outline-none transition placeholder:text-[#7a8099] placeholder:font-light focus:border-[#6c63ff] focus:shadow-[0_0_0_3px_rgba(108,99,255,0.15)] font-['DM_Sans',sans-serif]";
	const pillButtonBase =
		"flex-1 cursor-pointer whitespace-nowrap rounded-[10px] border border-white/[0.07] bg-[#1f2436] px-2.5 py-2 text-[13px] font-medium text-[#7a8099] transition font-['DM_Sans',sans-serif]";
	const taskButtonBase =
		"cursor-pointer rounded-lg border px-3.5 py-[7px] text-[13px] font-medium transition font-['DM_Sans',sans-serif]";
	const gridBackground =
		'linear-gradient(rgba(108,99,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(108,99,255,0.04) 1px, transparent 1px)';

	let tasks = $state<Task[]>([]);
	let activeFilter = $state<Filter>('all');
	let activeSort = $state<Sort>('date-added');
	let title = $state('');
	let subject = $state('');
	let deadline = $state('');
	let priority = $state<Priority>('medium');
	let shouldShake = $state(false);
	let storageReady = $state(false);
	let titleInput: HTMLInputElement;

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

	function isOverdue(taskDeadline: string) {
		if (!taskDeadline) return false;
		const today = new Date();
		const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
		return new Date(taskDeadline) < todayStart;
	}

	function formatDate(dateStr: string) {
		if (!dateStr) return '—';
		const date = new Date(`${dateStr}T00:00:00`);
		return date.toLocaleDateString('uk-UA', { day: 'numeric', month: 'short', year: 'numeric' });
	}

	function filterButtonClass(filter: Filter) {
		return `${pillButtonBase} ${
			activeFilter === filter
				? 'border-[#6c63ff]/40 bg-[#6c63ff]/15 text-[#a9a3ff]'
				: 'hover:border-white/15 hover:text-[#eaedf5]'
		}`;
	}

	function sortButtonClass(sort: Sort) {
		return `${pillButtonBase} ${
			activeSort === sort
				? 'border-white/15 bg-white/[0.06] text-[#eaedf5]'
				: 'hover:border-white/15 hover:text-[#eaedf5]'
		}`;
	}

	function priorityStripeClass(taskPriority: Priority) {
		return {
			low: 'bg-[#22c55e]',
			medium: 'bg-[#f59e0b]',
			high: 'bg-[#ef4444]'
		}[taskPriority];
	}

	function priorityBadgeClass(taskPriority: Priority) {
		const base =
			'shrink-0 rounded-full px-2.5 py-[3px] text-[11px] font-semibold uppercase tracking-[0.06em]';
		const variants = {
			low: 'bg-[#22c55e]/15 text-[#22c55e]',
			medium: 'bg-[#f59e0b]/15 text-[#f59e0b]',
			high: 'bg-[#ef4444]/15 text-[#ef4444]'
		};
		return `${base} ${variants[taskPriority]}`;
	}

	function taskCardClass(task: Task, overdue: boolean) {
		return [
			'relative mb-3.5 overflow-hidden rounded-2xl border border-white/[0.07] bg-[#181c27] px-5 py-[18px] transition hover:-translate-y-0.5 hover:border-white/10 hover:shadow-[0_12px_32px_rgba(0,0,0,0.3)] [animation:cardIn_0.35s_ease_both]',
			task.completed ? 'opacity-50' : '',
			overdue ? 'border-[#ef4444]/30 bg-[#ef4444]/5' : ''
		]
			.filter(Boolean)
			.join(' ');
	}

	function addTask() {
		const trimmedTitle = title.trim();
		const trimmedSubject = subject.trim();

		if (!trimmedTitle || !trimmedSubject || !deadline) {
			shouldShake = false;
			requestAnimationFrame(() => {
				shouldShake = true;
				setTimeout(() => (shouldShake = false), 500);
			});
			return;
		}

		tasks.push({
			id: Date.now(),
			title: trimmedTitle,
			subject: trimmedSubject,
			deadline,
			priority,
			completed: false
		});

		title = '';
		subject = '';
		deadline = '';
		priority = 'medium';
		titleInput?.focus();
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
	<header class="mb-12 text-center [animation:fadeDown_0.6s_ease_both]">
		<div
			class="mb-5 inline-block rounded-full border border-[#6c63ff]/30 bg-[#6c63ff]/15 px-4 py-1.5 font-['Syne',sans-serif] text-[13px] font-semibold tracking-[0.08em] text-[#a9a3ff] uppercase"
		>
			📚 Study Planner
		</div>
		<h1
			class="mb-3 font-['Syne',sans-serif] text-[clamp(2rem,5vw,3.2rem)] leading-[1.1] font-extrabold text-[#eaedf5]"
		>
			Твої навчальні<br /><span
				class="bg-linear-to-br from-[#6c63ff] to-[#a78bfa] bg-clip-text text-transparent"
				>завдання</span
			>
		</h1>
		<p class="text-base font-light text-[#7a8099]">Плануй, виконуй, досягай</p>
	</header>

	<div class="grid grid-cols-1 items-start gap-6 min-[861px]:grid-cols-[340px_1fr]">
		<aside>
			<section class={`${cardClass} mb-5`}>
				<h2 class={sectionTitleClass}>Нове завдання</h2>
				<div class="mb-3.5">
					<label class={labelClass} for="title">Назва</label>
					<input
						bind:this={titleInput}
						bind:value={title}
						class={inputClass}
						type="text"
						id="title"
						placeholder="Напр. Написати реферат"
						onkeydown={(event) => event.key === 'Enter' && addTask()}
					/>
				</div>
				<div class="mb-3.5">
					<label class={labelClass} for="subject">Предмет</label>
					<input
						bind:value={subject}
						class={inputClass}
						type="text"
						id="subject"
						placeholder="Напр. Математика"
					/>
				</div>
				<div class="mb-3.5">
					<label class={labelClass} for="deadline">Дедлайн</label>
					<input bind:value={deadline} class={inputClass} type="date" id="deadline" />
				</div>
				<div class="mb-3.5">
					<label class={labelClass} for="priority">Пріоритет</label>
					<select
						bind:value={priority}
						class={`${inputClass} [&_option]:bg-[#1f2436] [&_option]:text-[#eaedf5]`}
						id="priority"
					>
						<option value="low">🟢 Низький</option>
						<option value="medium">🟡 Середній</option>
						<option value="high">🔴 Високий</option>
					</select>
				</div>
				<button
					class={`mt-1.5 flex w-full cursor-pointer items-center justify-center gap-2 rounded-[10px] border-0 bg-[#6c63ff] p-3 font-['Syne',sans-serif] text-[15px] font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#7b73ff] hover:shadow-[0_6px_20px_rgba(108,99,255,0.4)] ${shouldShake ? '[animation:shake_0.4s_ease]' : ''}`}
					onclick={addTask}
				>
					<span class="text-xl leading-none font-light">+</span> Додати завдання
				</button>
			</section>

			<section class={`${cardClass} mb-5`}>
				<h2 class={sectionTitleClass}>Фільтр</h2>
				<div class="flex flex-wrap gap-2">
					<button class={filterButtonClass('all')} onclick={() => (activeFilter = 'all')}
						>Усі</button
					>
					<button class={filterButtonClass('active')} onclick={() => (activeFilter = 'active')}
						>Активні</button
					>
					<button
						class={filterButtonClass('completed')}
						onclick={() => (activeFilter = 'completed')}>Виконані</button
					>
				</div>
				<h2 class={`${sectionTitleClass} mt-5`}>Сортування</h2>
				<div class="flex flex-wrap gap-2">
					<button class={sortButtonClass('date-added')} onclick={() => (activeSort = 'date-added')}
						>За датою</button
					>
					<button class={sortButtonClass('priority')} onclick={() => (activeSort = 'priority')}
						>За пріоритетом</button
					>
					<button class={sortButtonClass('deadline')} onclick={() => (activeSort = 'deadline')}
						>За дедлайном</button
					>
				</div>
			</section>

			<section class={`${cardClass} mb-5`}>
				<h2 class={sectionTitleClass}>Статистика</h2>
				<div class="mb-4 grid grid-cols-3 gap-2.5">
					<div class="rounded-[10px] bg-[#1f2436] px-2 py-3 text-center">
						<span
							class="mb-1 block font-['Syne',sans-serif] text-2xl leading-none font-extrabold text-[#eaedf5]"
							>{tasks.length}</span
						>
						<span class="text-[11px] tracking-[0.06em] text-[#7a8099] uppercase">Всього</span>
					</div>
					<div class="rounded-[10px] bg-[#1f2436] px-2 py-3 text-center">
						<span
							class="mb-1 block font-['Syne',sans-serif] text-2xl leading-none font-extrabold text-[#22c55e]"
							>{completedTasks}</span
						>
						<span class="text-[11px] tracking-[0.06em] text-[#7a8099] uppercase">Виконано</span>
					</div>
					<div class="rounded-[10px] bg-[#1f2436] px-2 py-3 text-center">
						<span
							class="mb-1 block font-['Syne',sans-serif] text-2xl leading-none font-extrabold text-[#6c63ff]"
							>{activeTasks}</span
						>
						<span class="text-[11px] tracking-[0.06em] text-[#7a8099] uppercase">Активних</span>
					</div>
				</div>
				<div class="flex items-center gap-2.5">
					<div class="h-1.5 flex-1 overflow-hidden rounded-full bg-[#1f2436]">
						<div
							class="h-full rounded-full bg-linear-to-r from-[#6c63ff] to-[#a78bfa] transition-[width] duration-500"
							style:width={`${progressPercent}%`}
						></div>
					</div>
					<span class="min-w-8 text-right text-xs font-medium text-[#7a8099]"
						>{progressPercent}%</span
					>
				</div>
			</section>
		</aside>

		<main>
			<div class="mb-5 flex items-center gap-3">
				<h2 class="font-['Syne',sans-serif] text-xl font-bold text-[#eaedf5]">Список завдань</h2>
				<span
					class="rounded-full border border-white/[0.07] bg-[#181c27] px-2.5 py-0.5 text-xs font-semibold text-[#7a8099]"
					>{visibleTasks.length}</span
				>
			</div>

			{#if visibleTasks.length === 0}
				<div class="px-5 py-15 text-center">
					<div class="mb-4 text-5xl opacity-50">🎯</div>
					<p class="mb-2 text-base text-[#7a8099]">
						{activeFilter === 'all'
							? "Тут з'являться твої завдання"
							: 'Немає завдань у цій категорії'}
					</p>
					{#if activeFilter === 'all'}
						<span class="text-[13px] text-[#7a8099]/60">Додай перше завдання зліва →</span>
					{/if}
				</div>
			{:else}
				{#each visibleTasks as task, index (task.id)}
					{@const overdue = isOverdue(task.deadline) && !task.completed}
					<div class={taskCardClass(task, overdue)} style:animation-delay={`${index * 0.05}s`}>
						<div
							class={`absolute top-0 bottom-0 left-0 w-1 ${priorityStripeClass(task.priority)}`}
						></div>
						<div class="mb-3 flex items-start justify-between gap-3">
							<span
								class={`font-['Syne',sans-serif] text-base leading-[1.3] font-bold ${task.completed ? 'text-[#7a8099] line-through' : 'text-[#eaedf5]'}`}
								>{task.title}</span
							>
							<span class={priorityBadgeClass(task.priority)}>{priorityLabels[task.priority]}</span>
						</div>
						<div class="mb-3.5 flex flex-wrap gap-4">
							<span class="flex items-center gap-1 text-[13px] text-[#7a8099]"
								><span>📚</span>{task.subject}</span
							>
							<span class="flex items-center gap-1 text-[13px] text-[#7a8099]">
								<span>📅</span>{formatDate(task.deadline)}
								{#if overdue}
									<span
										class="ml-1 rounded-full bg-[#ef4444]/15 px-2 py-0.5 text-[11px] font-semibold text-[#ef4444]"
										>Прострочено</span
									>
								{/if}
							</span>
						</div>
						<div class="flex gap-2">
							<button
								class={`${taskButtonBase} ${task.completed ? 'border-white/[0.07] bg-[#1f2436] text-[#7a8099]' : 'border-[#22c55e]/20 bg-[#22c55e]/15 text-[#22c55e] hover:bg-[#22c55e]/25'}`}
								onclick={() => toggleTask(task.id)}
							>
								{task.completed ? '↩ Відновити' : '✓ Виконано'}
							</button>
							<button
								class={`${taskButtonBase} border-[#ef4444]/20 bg-[#ef4444]/15 text-[#ef4444] hover:bg-[#ef4444]/25`}
								onclick={() => deleteTask(task.id)}
							>
								🗑 Видалити
							</button>
						</div>
					</div>
				{/each}
			{/if}
		</main>
	</div>
</div>

<style>
	:global(input[type='date']::-webkit-calendar-picker-indicator) {
		filter: invert(0.5);
		cursor: pointer;
	}

	@keyframes fadeDown {
		from {
			opacity: 0;
			transform: translateY(-20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@keyframes fadeUp {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@keyframes cardIn {
		from {
			opacity: 0;
			transform: translateX(-10px);
		}
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}

	@keyframes shake {
		0%,
		100% {
			transform: translateX(0);
		}
		20% {
			transform: translateX(-6px);
		}
		40% {
			transform: translateX(6px);
		}
		60% {
			transform: translateX(-4px);
		}
		80% {
			transform: translateX(4px);
		}
	}
</style>
