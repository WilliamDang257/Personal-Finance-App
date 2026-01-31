import { useEffect, useRef } from 'react';
import { useStore } from './useStore';
import { differenceInMinutes } from 'date-fns';

export function useReminderNotifications() {
    const { reminders, settings } = useStore();
    const notifiedReminders = useRef<Set<string>>(new Set());

    // Request permission on mount
    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, [settings.notifications?.enabled]); // Assuming settings might hav notifications toggle later, for now just run

    useEffect(() => {
        // If notifications not supported or not granted, do nothing
        if (!('Notification' in window) || Notification.permission !== 'granted') return;

        const checkReminders = () => {
            const now = new Date(); // Current local time

            reminders.forEach(reminder => {
                if (reminder.isCompleted) return;

                // Reminder date/time is stored as string "YYYY-MM-DD" and "HH:mm"
                // Construct a date object in local time
                const reminderDateTime = new Date(`${reminder.date}T${reminder.time}`);

                // If invalid date, skip
                if (isNaN(reminderDateTime.getTime())) return;

                // Check if reminder is due (e.g., within the last 1 minute or future)
                // But generally we want to notify exactly at the time.
                // Or if we missed it by a small window (e.g. app was closed).

                // Simple logic: If it's past due by less than 1 hour and we haven't notified yet.
                const diff = differenceInMinutes(now, reminderDateTime);

                // Notify if it's due now (diff >= 0) and not too old (diff < 60 mins)
                // and hasn't been notified this session.
                if (diff >= 0 && diff < 60 && !notifiedReminders.current.has(reminder.id)) {

                    // Send Notification
                    new Notification(reminder.title, {
                        body: reminder.description || `It's time for: ${reminder.title}`,
                        icon: '/vite.svg', // Placeholder icon
                        tag: reminder.id // Prevent duplicate notifications for same ID
                    });

                    notifiedReminders.current.add(reminder.id);
                }
            });
        };

        const intervalId = setInterval(checkReminders, 60 * 1000); // Check every minute
        checkReminders(); // Check immediately on mount/update

        return () => clearInterval(intervalId);
    }, [reminders]);
}
