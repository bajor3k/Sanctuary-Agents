export interface Reminder {
    id: string;
    text: string;
    status: 'active' | 'completed';
    createdAt: Date;
    tags: string[];
    dueDate?: Date;
    type?: 'reminder' | 'timer';
    timerDuration?: number; // in seconds
    timerEndsAt?: Date;
}
