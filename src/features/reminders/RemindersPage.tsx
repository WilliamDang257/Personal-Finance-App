import { useState } from 'react';
import { ReminderForm } from './ReminderForm';
import { ReminderList } from './ReminderList';
import { Plus, Bell, CheckSquare, Clock, AlertTriangle } from 'lucide-react';
import type { Reminder } from '../../types';

export default function RemindersPage() {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
    const [filter, setFilter] = useState<'all' | 'upcoming' | 'missed' | 'completed'>('upcoming');

    const handleEdit = (reminder: Reminder) => {
        setEditingReminder(reminder);
        setIsFormOpen(true);
    };

    const handleClose = () => {
        setIsFormOpen(false);
        setEditingReminder(null);
    };

    return (
        <div className="p-4 md:p-6 space-y-6 pb-20 md:pb-6 font-sans animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                        Reminders
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Never miss a bill or recurring payment again.
                    </p>
                </div>
                <button
                    onClick={() => setIsFormOpen(true)}
                    className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring"
                >
                    <Plus className="w-4 h-4" />
                    New Reminder
                </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-hide">
                {[
                    { id: 'upcoming', label: 'Upcoming', icon: Clock },
                    { id: 'missed', label: 'Overdue', icon: AlertTriangle },
                    { id: 'all', label: 'All', icon: Bell },
                    { id: 'completed', label: 'Completed', icon: CheckSquare },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setFilter(tab.id as any)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${filter === tab.id
                            ? 'bg-primary/10 text-primary border-2 border-primary/20 scale-105'
                            : 'bg-card border border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                            }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <ReminderList filter={filter} onEdit={handleEdit} />

            {/* Form Modal */}
            {isFormOpen && (
                <ReminderForm onClose={handleClose} editingReminder={editingReminder} />
            )}
        </div>
    );
}
