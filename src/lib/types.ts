export type Priority = 'low' | 'medium' | 'high';
export type Filter = 'all' | 'active' | 'completed';
export type Sort = 'date-added' | 'priority' | 'deadline';

export type Task = {
	id: number;
	title: string;
	subject: string;
	deadline: string;
	priority: Priority;
	completed: boolean;
};
