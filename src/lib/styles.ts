import type { Priority, Task } from '$lib/types';

export const cardClass =
	'rounded-2xl border border-white/[0.07] bg-[#181c27] p-6 shadow-[0_8px_32px_rgba(0,0,0,0.4)] [animation:fadeUp_0.5s_ease_both]';

export const sectionTitleClass =
	"mb-4 font-['Syne',sans-serif] text-[13px] font-bold uppercase tracking-[0.1em] text-[#7a8099]";

export const labelClass =
	'mb-1.5 block text-xs font-medium uppercase tracking-[0.06em] text-[#7a8099]';

export const inputClass =
	"w-full appearance-none rounded-[10px] border border-white/[0.07] bg-[#1f2436] px-3.5 py-2.5 text-sm text-[#eaedf5] outline-none transition placeholder:text-[#7a8099] placeholder:font-light focus:border-[#6c63ff] focus:shadow-[0_0_0_3px_rgba(108,99,255,0.15)] font-['DM_Sans',sans-serif]";

export const pillButtonBase =
	"flex-1 cursor-pointer whitespace-nowrap rounded-[10px] border border-white/[0.07] bg-[#1f2436] px-2.5 py-2 text-[13px] font-medium text-[#7a8099] transition font-['DM_Sans',sans-serif]";

export const taskButtonBase =
	"cursor-pointer rounded-lg border px-3.5 py-[7px] text-[13px] font-medium transition font-['DM_Sans',sans-serif]";

export function priorityStripeClass(priority: Priority) {
	return {
		low: 'bg-[#22c55e]',
		medium: 'bg-[#f59e0b]',
		high: 'bg-[#ef4444]'
	}[priority];
}

export function priorityBadgeClass(priority: Priority) {
	const base =
		'shrink-0 rounded-full px-2.5 py-[3px] text-[11px] font-semibold uppercase tracking-[0.06em]';
	const variants = {
		low: 'bg-[#22c55e]/15 text-[#22c55e]',
		medium: 'bg-[#f59e0b]/15 text-[#f59e0b]',
		high: 'bg-[#ef4444]/15 text-[#ef4444]'
	};

	return `${base} ${variants[priority]}`;
}

export function taskCardClass(task: Task, overdue: boolean) {
	return [
		'relative mb-3.5 overflow-hidden rounded-2xl border border-white/[0.07] bg-[#181c27] px-5 py-[18px] transition hover:-translate-y-0.5 hover:border-white/10 hover:shadow-[0_12px_32px_rgba(0,0,0,0.3)] [animation:cardIn_0.35s_ease_both]',
		task.completed ? 'opacity-50' : '',
		overdue ? 'border-[#ef4444]/30 bg-[#ef4444]/5' : ''
	]
		.filter(Boolean)
		.join(' ');
}
