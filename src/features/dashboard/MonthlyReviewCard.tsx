import { useState, useEffect } from 'react';
import { useStore } from '../../hooks/useStore';
import { Star, Edit2 } from 'lucide-react';

interface Props {
    selectedDate: Date;
}

export function MonthlyReviewCard({ selectedDate }: Props) {
    const { monthlySummaries, addMonthlySummary, updateMonthlySummary, settings } = useStore();
    const currentMonth = selectedDate.getMonth();
    const currentYear = selectedDate.getFullYear();
    const activeSpaceId = settings.activeSpace;

    const summary = monthlySummaries.find(
        (s) => s.spaceId === activeSpaceId && s.month === currentMonth && s.year === currentYear
    );

    const [isEditing, setIsEditing] = useState(false);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');

    useEffect(() => {
        if (summary) {
            setRating(summary.rating);
            setComment(summary.comment);
        } else {
            setRating(0);
            setComment('');
        }
    }, [summary, isEditing]);

    const handleSave = () => {
        if (rating === 0) return; // Require rating

        const summaryData = {
            id: summary ? summary.id : crypto.randomUUID(),
            month: currentMonth,
            year: currentYear,
            rating,
            comment,
            spaceId: activeSpaceId,
        };

        if (summary) {
            updateMonthlySummary(summaryData);
        } else {
            addMonthlySummary(summaryData);
        }
        setIsEditing(false);
    };

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    return (
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
            <div className="flex flex-col space-y-1.5 p-6">
                <div className="flex items-center justify-between">
                    <h3 className="font-semibold leading-none tracking-tight">
                        {monthNames[currentMonth]} Review
                    </h3>
                    {!isEditing && summary && (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="text-muted-foreground hover:text-foreground"
                        >
                            <Edit2 className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </div>
            <div className="p-6 pt-0">
                {!isEditing && !summary ? (
                    <div className="text-center py-6">
                        <p className="text-muted-foreground mb-4">How is your financial health this month?</p>
                        <button
                            onClick={() => setIsEditing(true)}
                            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                        >
                            Rate this Month
                        </button>
                    </div>
                ) : isEditing ? (
                    <div className="space-y-4">
                        <div className="flex justify-center space-x-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    className={`transition-transform hover:scale-110 focus:outline-none ${rating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'
                                        }`}
                                >
                                    <Star className={`h-8 w-8 ${rating >= star ? 'fill-current' : ''}`} />
                                </button>
                            ))}
                        </div>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Add a comment about your financial progress..."
                            className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                        />
                        <div className="flex gap-2">
                            <button
                                onClick={handleSave}
                                disabled={rating === 0}
                                className="flex-1 rounded-md bg-primary py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                            >
                                Save Review
                            </button>
                            <button
                                onClick={() => setIsEditing(false)}
                                className="flex-1 rounded-md border border-input bg-background py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex justify-center space-x-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <div
                                    key={star}
                                    className={`${summary!.rating >= star ? 'text-yellow-400' : 'text-muted-foreground/30'
                                        }`}
                                >
                                    <Star className={`h-6 w-6 ${summary!.rating >= star ? 'fill-current' : ''}`} />
                                </div>
                            ))}
                        </div>
                        {summary?.comment && (
                            <div className="rounded-md bg-muted/50 p-4">
                                <p className="text-sm italic text-muted-foreground">"{summary.comment}"</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
