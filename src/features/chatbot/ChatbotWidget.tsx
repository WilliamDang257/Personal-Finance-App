import { useState, useEffect, useRef } from 'react';
import { X, Trash2, Send } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useChatbot } from '../../hooks/useChatbot';
import { HUH_CAT_GIF } from '../../assets/images';

export function ChatbotWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const {
        messages,
        isLoading,
        sendMessage,
        clearHistory,
        initializeChat,
        isEnabled,
        hasApiKey
    } = useChatbot();

    useEffect(() => {
        if (isOpen && messages.length === 0) {
            initializeChat();
        }
    }, [isOpen, messages.length, initializeChat]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const message = input;
        setInput('');
        await sendMessage(message);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    if (!isEnabled) {
        return null;
    }

    return (
        <>
            {/* Floating Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 z-50 overflow-hidden h-16 w-16 rounded-full shadow-lg hover:scale-110 transition-transform duration-200 border-2 border-primary"
                    title="Open Finance Bro"
                >
                    <img
                        src={HUH_CAT_GIF}
                        alt="Huh Finance"
                        className="h-full w-full object-cover"
                    />
                </button>
            )}

            {/* Chat Panel */}
            {isOpen && (
                <div className="fixed bottom-6 right-6 z-50 flex flex-col w-96 h-[600px] rounded-xl border bg-card shadow-2xl overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b bg-primary text-primary-foreground">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-white/50">
                                <img
                                    src={HUH_CAT_GIF}
                                    alt="Huh Finance"
                                    className="h-full w-full object-cover"
                                />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg leading-none">Finance Bro</h3>
                                <span className="text-xs text-primary-foreground/80">Meow money problems?</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => {
                                    if (confirm('Clear chat history?')) {
                                        clearHistory();
                                    }
                                }}
                                className="p-1 hover:bg-primary-foreground/20 rounded"
                                title="Clear history"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 hover:bg-primary-foreground/20 rounded"
                                title="Close"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {!hasApiKey && (
                            <div className="rounded-lg bg-yellow-50 dark:bg-yellow-900/20 p-3 text-sm text-yellow-800 dark:text-yellow-200">
                                ⚠️ Please add your Gemini API key in Settings to use the AI assistant.
                            </div>
                        )}

                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] rounded-lg px-4 py-2 ${message.role === 'user'
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-muted text-foreground'
                                        }`}
                                >
                                    <div className="text-sm prose prose-sm dark:prose-invert max-w-none break-words">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {message.content}
                                        </ReactMarkdown>
                                    </div>
                                    <div className="flex items-center justify-between mt-1 select-none">
                                        <div className="text-xs opacity-70">
                                            {new Date(message.timestamp).toLocaleTimeString()}
                                        </div>
                                        {message.tokens && (
                                            <div className="text-[10px] opacity-50 flex gap-1 items-center" title={`Prompt: ${message.tokens.prompt} | Reponse: ${message.tokens.response}`}>
                                                <span>⚡ {message.tokens.total} tokens</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-muted rounded-lg px-4 py-2">
                                    <div className="flex items-center gap-2">
                                        <div className="flex gap-1">
                                            <div className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <div className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <div className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </div>
                                        <span className="text-sm text-muted-foreground">Thinking...</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-4 border-t">
                        <div className="flex gap-2">
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder={hasApiKey ? "Ask me anything about your finances..." : "Add API key in Settings first..."}
                                disabled={!hasApiKey || isLoading}
                                className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                                rows={2}
                            />
                            <button
                                onClick={handleSend}
                                disabled={!input.trim() || isLoading || !hasApiKey}
                                className="px-4 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <Send className="h-4 w-4" />
                            </button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                            Press Enter to send, Shift+Enter for new line
                        </p>
                    </div>
                </div>
            )}
        </>
    );
}
