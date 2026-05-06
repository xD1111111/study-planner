<script lang="ts">
	import { cardClass, sectionTitleClass } from '$lib/styles';

	let {
		totalTasks,
		completedTasks,
		activeTasks,
		progressPercent
	}: {
		totalTasks: number;
		completedTasks: number;
		activeTasks: number;
		progressPercent: number;
	} = $props();
</script>

<section class={`${cardClass} mb-5`}>
	<h2 class={sectionTitleClass}>Статистика</h2>
	<div class="mb-4 grid grid-cols-3 gap-2.5">
		<div class="rounded-[10px] bg-[#1f2436] px-2 py-3 text-center">
			<span
				class="mb-1 block font-['Syne',sans-serif] text-2xl leading-none font-extrabold text-[#eaedf5]"
				>{totalTasks}</span
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
		<span class="min-w-8 text-right text-xs font-medium text-[#7a8099]">{progressPercent}%</span>
	</div>
</section>
