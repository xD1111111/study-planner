<script lang="ts">
	import {
		priorityBadgeClass,
		priorityStripeClass,
		taskButtonBase,
		taskCardClass
	} from '$lib/styles';
	import type { Task } from '$lib/types';

	const priorityLabels = {
		low: 'Низький',
		medium: 'Середній',
		high: 'Високий'
	};

	let {
		task,
		index,
		onToggle,
		onDelete
	}: {
		task: Task;
		index: number;
		onToggle: (id: number) => void;
		onDelete: (id: number) => void;
	} = $props();

	let overdue = $derived(isOverdue(task.deadline) && !task.completed);

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
</script>

<div class={taskCardClass(task, overdue)} style:animation-delay={`${index * 0.05}s`}>
	<div class={`absolute top-0 bottom-0 left-0 w-1 ${priorityStripeClass(task.priority)}`}></div>
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
			onclick={() => onToggle(task.id)}
		>
			{task.completed ? '↩ Відновити' : '✓ Виконано'}
		</button>
		<button
			class={`${taskButtonBase} border-[#ef4444]/20 bg-[#ef4444]/15 text-[#ef4444] hover:bg-[#ef4444]/25`}
			onclick={() => onDelete(task.id)}
		>
			🗑 Видалити
		</button>
	</div>
</div>
