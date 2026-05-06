<script lang="ts">
	import { cardClass, inputClass, labelClass, sectionTitleClass } from '$lib/styles';
	import type { Priority, Task } from '$lib/types';

	let { onAdd }: { onAdd: (task: Task) => void } = $props();

	let title = $state('');
	let subject = $state('');
	let deadline = $state('');
	let priority = $state<Priority>('medium');
	let shouldShake = $state(false);
	let titleInput: HTMLInputElement;

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

		onAdd({
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
</script>

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
