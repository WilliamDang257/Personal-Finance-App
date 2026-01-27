import { useEffect, useState } from 'react';
import { useStore } from '../../hooks/useStore';
import { X, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

export interface GuideStep {
    target: string; // CSS selector
    title: string;
    content: string;
    position?: 'top' | 'bottom' | 'left' | 'right';
    path?: string; // Route to navigate to
}

interface GuideTourProps {
    steps: GuideStep[];
}

export function GuideTour({ steps }: GuideTourProps) {
    const { activeGuide, currentStep, nextStep, prevStep, stopGuide } = useStore();
    const navigate = useNavigate();
    const location = useLocation();

    const [style, setStyle] = useState<React.CSSProperties>({});
    const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});

    useEffect(() => {
        if (!activeGuide) return;

        const step = steps[currentStep];
        if (!step) {
            stopGuide();
            return;
        }

        // Handle Navigation
        if (step.path && location.pathname !== step.path) {
            navigate(step.path);
            // Wait for navigation to complete before positioning
            setTimeout(() => calculatePosition(), 500);
            return;
        }

        const calculatePosition = () => {
            const element = document.querySelector(step.target);
            if (element) {
                const rect = element.getBoundingClientRect();

                // Highlight Box Style
                setStyle({
                    position: 'fixed',
                    top: rect.top - 4,
                    left: rect.left - 4,
                    width: rect.width + 8,
                    height: rect.height + 8,
                    borderRadius: '8px',
                    boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.7)',
                    zIndex: 9998,
                    pointerEvents: 'none',
                    transition: 'all 0.3s ease'
                });

                // Tooltip Position
                let top = 0;
                let left = 0;
                const tooltipWidth = 320;
                const gap = 12;

                if (step.position === 'right') {
                    top = rect.top;
                    left = rect.right + gap;
                } else if (step.position === 'left') {
                    top = rect.top;
                    left = rect.left - tooltipWidth - gap;
                } else if (step.position === 'top') {
                    top = rect.top - gap - 150; // Approximated height
                    left = rect.left;
                } else {
                    // Bottom default
                    top = rect.bottom + gap;
                    left = rect.left;
                }

                // Boundary checks (basic)
                if (left + tooltipWidth > window.innerWidth) left = window.innerWidth - tooltipWidth - 20;
                if (left < 10) left = 10;
                if (top < 10) top = 10;

                setTooltipStyle({
                    position: 'fixed',
                    top,
                    left,
                    zIndex: 9999,
                    width: tooltipWidth
                });

                // Scroll into view
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
                // If element not found, just center the modal? Or skip?
                // For now, let's just show it in center screen if target missing
                setStyle({ display: 'none' });
                setTooltipStyle({
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 9999,
                    width: 320
                });
            }
        };

        // Initial calculation
        // Small timeout to allow UI to settle if component just mounted or path changed
        const timer = setTimeout(calculatePosition, 200);
        window.addEventListener('resize', calculatePosition);

        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', calculatePosition);
        };

    }, [activeGuide, currentStep, steps, navigate, location.pathname, stopGuide]);

    if (!activeGuide) return null;

    const step = steps[currentStep];
    const isLast = currentStep === steps.length - 1;

    return (
        <>
            {/* Highlight Box Overlay */}
            <div style={style} className="guide-highlight ring-2 ring-primary"></div>

            {/* Tooltip Card */}
            <div style={tooltipStyle} className="bg-card border shadow-xl rounded-xl p-5 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-300">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2 text-primary">
                        <BookOpen className="h-5 w-5" />
                        <span className="font-semibold text-sm">Product Tour</span>
                    </div>
                    <button onClick={stopGuide} className="text-muted-foreground hover:text-foreground">
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div>
                    <h3 className="font-bold text-lg mb-1">{step?.title}</h3>
                    <p className="text-sm text-muted-foreground">{step?.content}</p>
                </div>

                <div className="flex items-center justify-between mt-2 pt-2 border-t">
                    <span className="text-xs text-muted-foreground">
                        Step {currentStep + 1} of {steps.length}
                    </span>
                    <div className="flex gap-2">
                        {currentStep > 0 && (
                            <button
                                onClick={prevStep}
                                className="px-3 py-1.5 text-xs font-medium rounded-md hover:bg-muted flex items-center gap-1"
                            >
                                <ChevronLeft className="h-3 w-3" /> Back
                            </button>
                        )}
                        <button
                            onClick={isLast ? stopGuide : nextStep}
                            className="bg-primary text-primary-foreground px-3 py-1.5 text-xs font-medium rounded-md hover:bg-primary/90 flex items-center gap-1 shadow-sm"
                        >
                            {isLast ? 'Finish' : 'Next'}
                            {!isLast && <ChevronRight className="h-3 w-3" />}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
