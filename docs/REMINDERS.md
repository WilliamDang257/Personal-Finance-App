# Reminder Feature Documentation

## Filter Button Rules

The filter buttons on the Reminders page function as follows:

-   **Upcoming**: Shows **active** reminders that are due **Today or in the Future**.
    -   *Logic*: `!isPast(date) || isToday(date)` and `!isCompleted`

-   **Overdue**: Shows **active** reminders that were due **Yesterday or earlier**.
    -   *Logic*: `isPast(date) && !isToday(date)` and `!isCompleted`

-   **All**: Shows **all active** reminders, encompassing both Upcoming and Overdue.
    -   *Logic*: `!isCompleted`

-   **Completed**: Shows **only** reminders that have been marked as finished.
    -   *Logic*: `isCompleted`
