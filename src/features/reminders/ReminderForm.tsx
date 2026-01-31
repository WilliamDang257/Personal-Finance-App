import { useState, useEffect } from 'react';
import { X, Calendar, DollarSign, Bell, Repeat, FileText } from 'lucide-react';
import { useStore } from '../../hooks/useStore';
// import { useTranslation } from '../../hooks/useTranslation';
import type { Reminder } from '../../types';
import { v4 as uuidv4 } from 'uuid';

interface ReminderFormProps {
    onClose: () => void;
    editingReminder?: Reminder | null;
}

export function ReminderForm({ onClose, editingReminder }: ReminderFormProps) {
    const { addReminder, updateReminder, settings } = useStore();
    // const { t } = useTranslation();

    const [form, setForm] = useState<Partial<Reminder>>({
        title: '',
        description: '',
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        time: '09:00',
        isRecurring: false,
        frequency: 'monthly',
        type: 'payment',
        spaceId: settings.activeSpace,
        isCompleted: false
    });

    useEffect(() => {
        if (editingReminder) {
            setForm(editingReminder);
        }
    }, [editingReminder]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.title || !form.date || !form.time) return;

        const reminder: Reminder = {
            id: editingReminder?.id || uuidv4(),
            title: form.title,
            description: form.description || '',
            amount: form.type === 'payment' ? Number(form.amount) : undefined,
            date: form.date!, // Keeps just YYYY-MM-DD
            time: form.time!,
            isRecurring: form.isRecurring || false,
            frequency: form.isRecurring ? form.frequency : undefined,
            type: form.type as 'payment' | 'note',
            spaceId: settings.activeSpace,
            isCompleted: form.isCompleted || false
        };

        if (editingReminder) {
            updateReminder(reminder);
        } else {
            addReminder(reminder);
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-card rounded-2xl shadow-xl overflow-hidden border border-border animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-4 border-b bg-muted/30">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        {editingReminder ? 'Edit Reminder' : 'New Reminder'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-accent rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    {/* Type Selection */}
                    <div className="grid grid-cols-2 gap-2 p-1 bg-muted rounded-xl">
                        <button
                            type="button"
                            onClick={() => setForm({ ...form, type: 'payment' })}
                            className={`flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all ${form.type === 'payment' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:bg-background/50'}`}
                        >
                            <DollarSign className="w-4 h-4" />
                            Payment
                        </button>
                        <button
                            type="button"
                            onClick={() => setForm({ ...form, type: 'note' })}
                            className={`flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all ${form.type === 'note' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:bg-background/50'}`}
                        >
                            <FileText className="w-4 h-4" />
                            Note
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1.5">Title</label>
                            <input
                                required
                                type="text"
                                value={form.title}
                                onChange={(e) => setForm({ ...form, title: e.target.value })}
                                placeholder={form.type === 'payment' ? "Electric Bill, Rent..." : "Review Budget, Call Bank..."}
                                className="w-full px-3 py-2 bg-background border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            />
                        </div>

                        {form.type === 'payment' && (
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Amount</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-bold">
                                        {settings.currency}
                                    </span>
                                    <input
                                        type="number"
                                        value={form.amount}
                                        onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) })}
                                        className="w-full pl-12 pr-4 py-2 bg-background border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Date</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <input
                                        type="date"
                                        required
                                        value={form.date}
                                        onChange={(e) => setForm({ ...form, date: e.target.value })}
                                        className="w-full pl-9 pr-3 py-2 bg-background border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Time</label>
                                <div className="relative">
                                    <Bell className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <input
                                        type="time"
                                        required
                                        value={form.time}
                                        onChange={(e) => setForm({ ...form, time: e.target.value })}
                                        className="w-full pl-9 pr-3 py-2 bg-background border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 border rounded-xl bg-card/50">
                            <div className={`p-2 rounded-full ${form.isRecurring ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                                <Repeat className="w-4 h-4" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium">Recurring</label>
                                    <input // Using simple checkbox for now, could be a Switch component
                                        type="checkbox"
                                        checked={form.isRecurring}
                                        onChange={(e) => setForm({ ...form, isRecurring: e.target.checked })}
                                        className="w-4 h-4 accent-primary"
                                    />
                                </div>
                                {form.isRecurring && (
                                    <select
                                        value={form.frequency}
                                        onChange={(e) => setForm({ ...form, frequency: e.target.value as any })}
                                        className="mt-2 w-full text-sm bg-background border rounded-lg px-2 py-1 outline-none"
                                    >
                                        <option value="daily">Daily</option>
                                        <option value="weekly">Weekly</option>
                                        <option value="monthly">Monthly</option>
                                        <option value="yearly">Yearly</option>
                                    </select>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1.5">Note (Optional)</label>
                            <textarea
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                placeholder="Add any details..."
                                rows={2}
                                className="w-full px-3 py-2 bg-background border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                            />
                        </div>
                    </div>

                    <div className="pt-2 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border rounded-lg hover:bg-accent transition-colors text-sm font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all text-sm font-medium shadow-md shadow-primary/20"
                        >
                            {editingReminder ? 'Save Changes' : 'Create Reminder'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
