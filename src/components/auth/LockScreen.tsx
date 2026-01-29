import { useState, useEffect } from 'react';
import { useStore } from '../../hooks/useStore';
import { Lock } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

export function LockScreen() {
    const { verifyPin, verifySecurityAnswer, unlock, settings } = useStore();
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const [isRecovering, setIsRecovering] = useState(false);
    const [answerAttempt, setAnswerAttempt] = useState('');
    const { t } = useTranslation();

    useEffect(() => {
        if (pin.length === 6) {
            if (verifyPin(pin)) {
                unlock();
                setPin('');
                setError('');
            } else {
                setError('Incorrect PIN');
                setPin('');
            }
        }
    }, [pin, verifyPin, unlock]);

    const handleNumberClick = (num: number) => {
        if (pin.length < 6) {
            setPin(prev => prev + num);
            setError('');
        }
    };

    const handleBackspace = () => {
        setPin(prev => prev.slice(0, -1));
        setError('');
    };

    const handleRecoverySubmit = () => {
        if (verifySecurityAnswer(answerAttempt)) {
            unlock();
            setAnswerAttempt('');
            setIsRecovering(false);
            setError('');
        } else {
            setError('Incorrect Answer');
        }
    };

    // If security is not enabled or no PIN set, don't show lock screen
    if (!settings.security?.enabled || !settings.security?.pin) {
        return null;
    }

    if (isRecovering) {
        return (
            <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background backdrop-blur-md">
                <div className="w-full max-w-sm px-8 space-y-8">
                    <div className="text-center space-y-4">
                        <div className="mx-auto w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-6 ring-4 ring-background shadow-lg">
                            <Lock className="w-8 h-8 text-primary" />
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">Account Recovery</h1>
                        <div className="bg-muted p-4 rounded-lg">
                            <p className="text-sm font-medium text-muted-foreground mb-1">Security Question:</p>
                            <p className="text-base font-semibold text-foreground">
                                {settings.security.securityQuestion || 'No question set'}
                            </p>
                        </div>
                    </div>

                    {!settings.security.securityQuestion ? (
                        <div className="text-center space-y-4">
                            <p className="text-sm text-destructive">
                                You have not set a security question. You must clear app data to reset access.
                            </p>
                            <button
                                onClick={() => setIsRecovering(false)}
                                className="text-sm text-muted-foreground hover:underline"
                            >
                                Back to PIN Entry
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <input
                                type="text"
                                value={answerAttempt}
                                onChange={(e) => setAnswerAttempt(e.target.value)}
                                placeholder="Enter your answer..."
                                className="w-full p-3 rounded-md border bg-background text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                                onKeyDown={(e) => e.key === 'Enter' && handleRecoverySubmit()}
                            />
                            {error && (
                                <p className="text-sm font-bold text-destructive text-center animate-shake">
                                    {error}
                                </p>
                            )}
                            <button
                                onClick={handleRecoverySubmit}
                                className="w-full py-3 bg-primary text-primary-foreground rounded-md font-semibold hover:bg-primary/90 transition-colors shadow-sm"
                            >
                                Unlock App
                            </button>
                            <button
                                onClick={() => {
                                    setIsRecovering(false);
                                    setError('');
                                    setAnswerAttempt('');
                                }}
                                className="w-full text-sm text-muted-foreground hover:text-foreground py-2"
                            >
                                Cancel
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background backdrop-blur-md">
            <div className="w-full max-w-sm px-8 space-y-10">
                <div className="text-center space-y-4">
                    <div className="mx-auto w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-6 ring-4 ring-background shadow-lg">
                        <Lock className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-foreground">{settings.appName || t.app.title}</h1>
                    <p className="text-base font-medium text-foreground/80">{t.settings?.security?.enterPin || 'Enter PIN to unlock'}</p>
                </div>

                <div className="flex justify-center gap-4 mb-8">
                    {[...Array(6)].map((_, i) => (
                        <div
                            key={i}
                            className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${i < pin.length
                                ? 'bg-primary border-primary scale-110 shadow-sm'
                                : 'bg-transparent border-foreground/30'
                                } ${error ? 'border-destructive bg-destructive/20' : ''}`}
                        />
                    ))}
                </div>

                {error && (
                    <p className="text-sm font-bold text-destructive text-center animate-shake bg-destructive/10 py-1 px-3 rounded-full mx-auto w-fit">
                        {error}
                    </p>
                )}

                <div className="grid grid-cols-3 gap-6 max-w-[280px] mx-auto">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                        <button
                            key={num}
                            onClick={() => handleNumberClick(num)}
                            className="w-16 h-16 rounded-full text-3xl font-semibold transition-all bg-secondary/80 text-secondary-foreground hover:bg-primary hover:text-primary-foreground focus:outline-none focus:ring-4 focus:ring-primary/20 flex items-center justify-center shadow-sm"
                        >
                            {num}
                        </button>
                    ))}
                    <div className="w-16 h-16" /> {/* Empty spacer */}
                    <button
                        onClick={() => handleNumberClick(0)}
                        className="w-16 h-16 rounded-full text-3xl font-semibold transition-all bg-secondary/80 text-secondary-foreground hover:bg-primary hover:text-primary-foreground focus:outline-none focus:ring-4 focus:ring-primary/20 flex items-center justify-center shadow-sm"
                    >
                        0
                    </button>
                    <button
                        onClick={handleBackspace}
                        className="w-16 h-16 rounded-full text-xl font-medium transition-all text-muted-foreground hover:text-destructive hover:bg-destructive/10 focus:outline-none focus:ring-4 focus:ring-destructive/20 flex items-center justify-center"
                    >
                        ⌫
                    </button>
                </div>

                {settings.security.securityQuestion ? (
                    <button
                        onClick={() => setIsRecovering(true)}
                        className="block mx-auto text-xs text-center text-primary hover:underline font-medium mt-8"
                    >
                        Forgot PIN? Recover Account
                    </button>
                ) : (
                    <p className="text-xs text-center text-muted-foreground font-medium mt-8">
                        Forgot PIN? Reset app data to clear.
                    </p>
                )}
            </div>
        </div>
    );
}
