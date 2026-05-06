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
	let progressPercent = $derived(tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0);
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
		today.setHours(0, 0, 0, 0);
		return new Date(taskDeadline) < today;
	}

	function formatDate(dateStr: string) {
		if (!dateStr) return '—';
		const date = new Date(`${dateStr}T00:00:00`);
		return date.toLocaleDateString('uk-UA', { day: 'numeric', month: 'short', year: 'numeric' });
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

<div class="bg-grid"></div>

<div class="container">
	<header>
		<div class="header-badge">📚 Study Planner</div>
		<h1>Твої навчальні<br /><span class="accent">завдання</span></h1>
		<p class="subtitle">Плануй, виконуй, досягай</p>
	</header>

	<div class="main-grid">
		<aside class="sidebar">
			<section class="card task-form">
				<h2>Нове завдання</h2>
				<div class="field">
					<label for="title">Назва</label>
					<input bind:this={titleInput} bind:value={title} type="text" id="title" placeholder="Напр. Написати реферат" onkeydown={(event) => event.key === 'Enter' && addTask()} />
				</div>
				<div class="field">
					<label for="subject">Предмет</label>
					<input bind:value={subject} type="text" id="subject" placeholder="Напр. Математика" />
				</div>
				<div class="field">
					<label for="deadline">Дедлайн</label>
					<input bind:value={deadline} type="date" id="deadline" />
				</div>
				<div class="field">
					<label for="priority">Пріоритет</label>
					<select bind:value={priority} id="priority">
						<option value="low">🟢 Низький</option>
						<option value="medium">🟡 Середній</option>
						<option value="high">🔴 Високий</option>
					</select>
				</div>
				<button id="addTaskBtn" class:shake={shouldShake} onclick={addTask}><span>+</span> Додати завдання</button>
			</section>

			<section class="card filters-card">
				<h2>Фільтр</h2>
				<div class="filter-buttons">
					<button class:active={activeFilter === 'all'} class="filter-btn" onclick={() => (activeFilter = 'all')}>Усі</button>
					<button class:active={activeFilter === 'active'} class="filter-btn" onclick={() => (activeFilter = 'active')}>Активні</button>
					<button class:active={activeFilter === 'completed'} class="filter-btn" onclick={() => (activeFilter = 'completed')}>Виконані</button>
				</div>
				<h2 class="sort-title">Сортування</h2>
				<div class="filter-buttons">
					<button class:active={activeSort === 'date-added'} class="sort-btn" onclick={() => (activeSort = 'date-added')}>За датою</button>
					<button class:active={activeSort === 'priority'} class="sort-btn" onclick={() => (activeSort = 'priority')}>За пріоритетом</button>
					<button class:active={activeSort === 'deadline'} class="sort-btn" onclick={() => (activeSort = 'deadline')}>За дедлайном</button>
				</div>
			</section>

			<section class="card stats-card">
				<h2>Статистика</h2>
				<div class="stats-grid">
					<div class="stat-item">
						<span class="stat-number">{tasks.length}</span>
						<span class="stat-label">Всього</span>
					</div>
					<div class="stat-item completed-stat">
						<span class="stat-number">{completedTasks}</span>
						<span class="stat-label">Виконано</span>
					</div>
					<div class="stat-item active-stat">
						<span class="stat-number">{activeTasks}</span>
						<span class="stat-label">Активних</span>
					</div>
				</div>
				<div class="progress-wrap">
					<div class="progress-bar">
						<div class="progress-fill" style:width={`${progressPercent}%`}></div>
					</div>
					<span class="progress-label">{progressPercent}%</span>
				</div>
			</section>
		</aside>

		<main class="task-main">
			<div class="task-list-header">
				<h2>Список завдань</h2>
				<span class="task-count-badge">{visibleTasks.length}</span>
			</div>
			<div id="taskList">
				{#if visibleTasks.length === 0}
					<div class="empty-state">
						<div class="empty-icon">🎯</div>
						<p>{activeFilter === 'all' ? "Тут з'являться твої завдання" : 'Немає завдань у цій категорії'}</p>
						{#if activeFilter === 'all'}
							<span>Додай перше завдання зліва →</span>
						{/if}
					</div>
				{:else}
					{#each visibleTasks as task, index (task.id)}
						{@const overdue = isOverdue(task.deadline) && !task.completed}
						<div
							class:completed={task.completed}
							class:overdue
							class="task-card priority-{task.priority}"
							style:animation-delay={`${index * 0.05}s`}
						>
							<div class="card-top">
								<span class="task-title">{task.title}</span>
								<span class="priority-badge">{priorityLabels[task.priority]}</span>
							</div>
							<div class="card-meta">
								<span class="meta-item"><span class="icon">📚</span>{task.subject}</span>
								<span class="meta-item">
									<span class="icon">📅</span>{formatDate(task.deadline)}
									{#if overdue}
										<span class="overdue-tag">Прострочено</span>
									{/if}
								</span>
							</div>
							<div class="task-buttons">
								<button class="btn-complete" onclick={() => toggleTask(task.id)}>{task.completed ? '↩ Відновити' : '✓ Виконано'}</button>
								<button class="btn-delete" onclick={() => deleteTask(task.id)}>🗑 Видалити</button>
							</div>
						</div>
					{/each}
				{/if}
			</div>
		</main>
	</div>
</div>

<style>
	*,
	*::before,
	*::after {
		box-sizing: border-box;
		margin: 0;
		padding: 0;
	}

	:global(:root) {
		--bg: #0f1117;
		--surface: #181c27;
		--surface2: #1f2436;
		--border: rgba(255, 255, 255, 0.07);
		--text: #eaedf5;
		--text-muted: #7a8099;
		--accent: #6c63ff;
		--accent-soft: rgba(108, 99, 255, 0.15);
		--green: #22c55e;
		--green-soft: rgba(34, 197, 94, 0.15);
		--orange: #f59e0b;
		--orange-soft: rgba(245, 158, 11, 0.15);
		--red: #ef4444;
		--red-soft: rgba(239, 68, 68, 0.15);
		--radius: 16px;
		--radius-sm: 10px;
		--shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
	}

	:global(body) {
		font-family: 'DM Sans', sans-serif;
		background-color: var(--bg);
		color: var(--text);
		min-height: 100vh;
		padding: 0;
		overflow-x: hidden;
	}

	.bg-grid {
		position: fixed;
		inset: 0;
		background-image:
			linear-gradient(rgba(108, 99, 255, 0.04) 1px, transparent 1px),
			linear-gradient(90deg, rgba(108, 99, 255, 0.04) 1px, transparent 1px);
		background-size: 40px 40px;
		pointer-events: none;
		z-index: 0;
	}

	.container {
		position: relative;
		z-index: 1;
		max-width: 1200px;
		margin: 0 auto;
		padding: 40px 24px 60px;
	}

	header {
		text-align: center;
		margin-bottom: 48px;
		animation: fadeDown 0.6s ease both;
	}

	.header-badge {
		display: inline-block;
		background: var(--accent-soft);
		border: 1px solid rgba(108, 99, 255, 0.3);
		color: #a9a3ff;
		font-family: 'Syne', sans-serif;
		font-size: 13px;
		font-weight: 600;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		padding: 6px 16px;
		border-radius: 100px;
		margin-bottom: 20px;
	}

	h1 {
		font-family: 'Syne', sans-serif;
		font-size: clamp(2rem, 5vw, 3.2rem);
		font-weight: 800;
		line-height: 1.1;
		color: var(--text);
		margin-bottom: 12px;
	}

	h1 .accent {
		background: linear-gradient(135deg, #6c63ff, #a78bfa);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.subtitle {
		color: var(--text-muted);
		font-size: 16px;
		font-weight: 300;
	}

	.main-grid {
		display: grid;
		grid-template-columns: 340px 1fr;
		gap: 24px;
		align-items: start;
	}

	.card {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		padding: 24px;
		margin-bottom: 20px;
		box-shadow: var(--shadow);
		animation: fadeUp 0.5s ease both;
	}

	.card h2 {
		font-family: 'Syne', sans-serif;
		font-size: 13px;
		font-weight: 700;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--text-muted);
		margin-bottom: 16px;
	}

	.field {
		margin-bottom: 14px;
	}

	.field label {
		display: block;
		font-size: 12px;
		font-weight: 500;
		color: var(--text-muted);
		text-transform: uppercase;
		letter-spacing: 0.06em;
		margin-bottom: 6px;
	}

	input,
	select {
		width: 100%;
		padding: 10px 14px;
		background: var(--surface2);
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		color: var(--text);
		font-family: 'DM Sans', sans-serif;
		font-size: 14px;
		transition: border-color 0.2s, box-shadow 0.2s;
		outline: none;
		appearance: none;
		-webkit-appearance: none;
	}

	input:focus,
	select:focus {
		border-color: var(--accent);
		box-shadow: 0 0 0 3px var(--accent-soft);
	}

	input::placeholder {
		color: var(--text-muted);
		font-weight: 300;
	}

	input[type='date']::-webkit-calendar-picker-indicator {
		filter: invert(0.5);
		cursor: pointer;
	}

	select option {
		background: var(--surface2);
		color: var(--text);
	}

	#addTaskBtn {
		width: 100%;
		padding: 12px;
		background: var(--accent);
		color: white;
		border: none;
		border-radius: var(--radius-sm);
		font-family: 'Syne', sans-serif;
		font-size: 15px;
		font-weight: 700;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		margin-top: 6px;
		transition: all 0.2s ease;
	}

	#addTaskBtn span {
		font-size: 20px;
		line-height: 1;
		font-weight: 300;
	}

	#addTaskBtn:hover {
		background: #7b73ff;
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(108, 99, 255, 0.4);
	}

	.filter-buttons {
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
	}

	.filter-btn,
	.sort-btn {
		flex: 1;
		padding: 8px 10px;
		background: var(--surface2);
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		color: var(--text-muted);
		font-family: 'DM Sans', sans-serif;
		font-size: 13px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
		white-space: nowrap;
	}

	.filter-btn.active {
		background: var(--accent-soft);
		border-color: rgba(108, 99, 255, 0.4);
		color: #a9a3ff;
	}

	.sort-btn.active {
		background: rgba(255, 255, 255, 0.06);
		border-color: rgba(255, 255, 255, 0.15);
		color: var(--text);
	}

	.sort-title {
		margin-top: 20px;
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 10px;
		margin-bottom: 16px;
	}

	.stat-item {
		background: var(--surface2);
		border-radius: var(--radius-sm);
		padding: 12px 8px;
		text-align: center;
	}

	.stat-number {
		display: block;
		font-family: 'Syne', sans-serif;
		font-size: 24px;
		font-weight: 800;
		color: var(--text);
		line-height: 1;
		margin-bottom: 4px;
	}

	.completed-stat .stat-number {
		color: var(--green);
	}

	.active-stat .stat-number {
		color: var(--accent);
	}

	.stat-label {
		font-size: 11px;
		color: var(--text-muted);
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}

	.progress-wrap {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.progress-bar {
		flex: 1;
		height: 6px;
		background: var(--surface2);
		border-radius: 100px;
		overflow: hidden;
	}

	.progress-fill {
		height: 100%;
		background: linear-gradient(90deg, var(--accent), #a78bfa);
		border-radius: 100px;
		transition: width 0.5s ease;
	}

	.progress-label {
		font-size: 12px;
		font-weight: 500;
		color: var(--text-muted);
		min-width: 32px;
		text-align: right;
	}

	.task-list-header {
		display: flex;
		align-items: center;
		gap: 12px;
		margin-bottom: 20px;
	}

	.task-list-header h2 {
		font-family: 'Syne', sans-serif;
		font-size: 20px;
		font-weight: 700;
		color: var(--text);
		letter-spacing: normal;
		text-transform: none;
	}

	.task-count-badge {
		background: var(--surface);
		border: 1px solid var(--border);
		color: var(--text-muted);
		font-size: 12px;
		font-weight: 600;
		padding: 2px 10px;
		border-radius: 100px;
	}

	.empty-state {
		text-align: center;
		padding: 60px 20px;
	}

	.empty-icon {
		font-size: 48px;
		margin-bottom: 16px;
		opacity: 0.5;
	}

	.empty-state p {
		font-size: 16px;
		margin-bottom: 8px;
		color: var(--text-muted);
	}

	.empty-state span {
		font-size: 13px;
		color: var(--text-muted);
		opacity: 0.6;
	}

	.task-card {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		padding: 18px 20px;
		margin-bottom: 14px;
		position: relative;
		overflow: hidden;
		transition: transform 0.2s ease, box-shadow 0.2s ease;
		animation: cardIn 0.35s ease both;
	}

	.task-card::before {
		content: '';
		position: absolute;
		left: 0;
		top: 0;
		bottom: 0;
		width: 4px;
	}

	.task-card.priority-low::before {
		background: var(--green);
	}

	.task-card.priority-medium::before {
		background: var(--orange);
	}

	.task-card.priority-high::before {
		background: var(--red);
	}

	.task-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 12px 32px rgba(0, 0, 0, 0.3);
		border-color: rgba(255, 255, 255, 0.12);
	}

	.task-card.completed {
		opacity: 0.5;
	}

	.task-card.completed .task-title {
		text-decoration: line-through;
		color: var(--text-muted);
	}

	.task-card.overdue:not(.completed) {
		border-color: rgba(239, 68, 68, 0.3);
		background: rgba(239, 68, 68, 0.04);
	}

	.card-top {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 12px;
		margin-bottom: 12px;
	}

	.task-title {
		font-family: 'Syne', sans-serif;
		font-size: 16px;
		font-weight: 700;
		color: var(--text);
		line-height: 1.3;
	}

	.priority-badge {
		flex-shrink: 0;
		font-size: 11px;
		font-weight: 600;
		padding: 3px 10px;
		border-radius: 100px;
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}

	.priority-low .priority-badge {
		background: var(--green-soft);
		color: var(--green);
	}

	.priority-medium .priority-badge {
		background: var(--orange-soft);
		color: var(--orange);
	}

	.priority-high .priority-badge {
		background: var(--red-soft);
		color: var(--red);
	}

	.card-meta {
		display: flex;
		gap: 16px;
		flex-wrap: wrap;
		margin-bottom: 14px;
	}

	.meta-item {
		display: flex;
		align-items: center;
		gap: 5px;
		font-size: 13px;
		color: var(--text-muted);
	}

	.overdue-tag {
		background: var(--red-soft);
		color: var(--red);
		font-size: 11px;
		font-weight: 600;
		padding: 2px 8px;
		border-radius: 100px;
		margin-left: 4px;
	}

	.task-buttons {
		display: flex;
		gap: 8px;
	}

	.btn-complete,
	.btn-delete {
		padding: 7px 14px;
		border-radius: 8px;
		font-family: 'DM Sans', sans-serif;
		font-size: 13px;
		font-weight: 500;
		cursor: pointer;
		border: 1px solid transparent;
		transition: all 0.18s ease;
	}

	.btn-complete {
		background: var(--green-soft);
		border-color: rgba(34, 197, 94, 0.2);
		color: var(--green);
	}

	.btn-complete:hover {
		background: rgba(34, 197, 94, 0.25);
	}

	.task-card.completed .btn-complete {
		background: var(--surface2);
		border-color: var(--border);
		color: var(--text-muted);
	}

	.btn-delete {
		background: var(--red-soft);
		border-color: rgba(239, 68, 68, 0.2);
		color: var(--red);
	}

	.btn-delete:hover {
		background: rgba(239, 68, 68, 0.25);
	}

	.shake {
		animation: shake 0.4s ease;
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

	@media (max-width: 860px) {
		.main-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
