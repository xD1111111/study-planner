<script lang="ts">
	import { cardClass, pillButtonBase, sectionTitleClass } from '$lib/styles';
	import type { Filter, Sort } from '$lib/types';

	let {
		activeFilter,
		activeSort,
		onFilterChange,
		onSortChange
	}: {
		activeFilter: Filter;
		activeSort: Sort;
		onFilterChange: (filter: Filter) => void;
		onSortChange: (sort: Sort) => void;
	} = $props();

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
</script>

<section class={`${cardClass} mb-5`}>
	<h2 class={sectionTitleClass}>Фільтр</h2>
	<div class="flex flex-wrap gap-2">
		<button class={filterButtonClass('all')} onclick={() => onFilterChange('all')}>Усі</button>
		<button class={filterButtonClass('active')} onclick={() => onFilterChange('active')}
			>Активні</button
		>
		<button class={filterButtonClass('completed')} onclick={() => onFilterChange('completed')}
			>Виконані</button
		>
	</div>
	<h2 class={`${sectionTitleClass} mt-5`}>Сортування</h2>
	<div class="flex flex-wrap gap-2">
		<button class={sortButtonClass('date-added')} onclick={() => onSortChange('date-added')}
			>За датою</button
		>
		<button class={sortButtonClass('priority')} onclick={() => onSortChange('priority')}
			>За пріоритетом</button
		>
		<button class={sortButtonClass('deadline')} onclick={() => onSortChange('deadline')}
			>За дедлайном</button
		>
	</div>
</section>
