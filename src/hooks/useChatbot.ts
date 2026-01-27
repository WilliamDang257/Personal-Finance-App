import { useState, useCallback } from 'react';
import { useStore } from './useStore';
import type { ChatMessage } from '../types';
import { GeminiService } from '../services/ai/geminiService';
import { buildSystemPrompt, WELCOME_MESSAGE, ERROR_MESSAGE, NO_API_KEY_MESSAGE } from '../services/ai/promptTemplates';
import { GEMINI_API_KEYS } from '../config/aiConfig';

export function useChatbot() {
    const {
        settings,
        chatMessages,
        addChatMessage,
        clearChatHistory,
        transactions,
        assets,
        budgets
    } = useStore();

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const activeSpaceId = settings.activeSpace;
    const spaceChatMessages = chatMessages.filter(m => m.spaceId === activeSpaceId);

    const getApiKey = useCallback(() => {
        if (settings.chat?.apiKey) return settings.chat.apiKey;
        if (GEMINI_API_KEYS.length > 0) {
            // Simple random rotation
            return GEMINI_API_KEYS[Math.floor(Math.random() * GEMINI_API_KEYS.length)];
        }
        return null;
    }, [settings.chat?.apiKey]);

    const apiKey = getApiKey();
    const hasApiKey = !!apiKey;

    const sendMessage = useCallback(async (userMessage: string) => {
        if (!userMessage.trim()) return;

        // Check if chat is enabled and API key is provided
        if (!(settings.chat?.enabled ?? false)) {
            setError('Chat is not enabled. Please enable it in Settings.');
            return;
        }

        if (!hasApiKey) {
            // Add system message about missing API key
            const systemMsg: ChatMessage = {
                id: crypto.randomUUID(),
                role: 'assistant',
                content: NO_API_KEY_MESSAGE,
                timestamp: new Date().toISOString(),
                spaceId: activeSpaceId
            };
            addChatMessage(systemMsg);
            return;
        }

        // Add user message
        const userMsg: ChatMessage = {
            id: crypto.randomUUID(),
            role: 'user',
            content: userMessage,
            timestamp: new Date().toISOString(),
            spaceId: activeSpaceId
        };
        addChatMessage(userMsg);

        setIsLoading(true);
        setError(null);

        try {
            // Build system prompt with current financial data
            const systemPrompt = buildSystemPrompt(
                transactions,
                assets,
                budgets,
                activeSpaceId
            );

            // Get conversation history (last 10 messages)
            const conversationHistory = spaceChatMessages.slice(-10);

            // Initialize Gemini service
            const gemini = new GeminiService(apiKey!);

            // Send message and get response
            const { text, tokens } = await gemini.sendMessage(
                [...conversationHistory, userMsg],
                systemPrompt
            );

            // Add assistant response
            const assistantMsg: ChatMessage = {
                id: crypto.randomUUID(),
                role: 'assistant',
                content: text,
                timestamp: new Date().toISOString(),
                spaceId: activeSpaceId,
                tokens
            };
            addChatMessage(assistantMsg);
        } catch (err) {
            console.error('Chat error:', err);
            setError(err instanceof Error ? err.message : 'An error occurred');

            // Add error message
            const errorMsg: ChatMessage = {
                id: crypto.randomUUID(),
                role: 'assistant',
                content: ERROR_MESSAGE,
                timestamp: new Date().toISOString(),
                spaceId: activeSpaceId
            };
            addChatMessage(errorMsg);
        } finally {
            setIsLoading(false);
        }
    }, [settings, spaceChatMessages, activeSpaceId, addChatMessage, transactions, assets, budgets, hasApiKey, apiKey]);

    const clearHistory = useCallback(() => {
        clearChatHistory(activeSpaceId);
    }, [activeSpaceId, clearChatHistory]);

    const initializeChat = useCallback(() => {
        // Add welcome message if no messages exist for this space
        if (spaceChatMessages.length === 0) {
            const welcomeMsg: ChatMessage = {
                id: crypto.randomUUID(),
                role: 'assistant',
                content: WELCOME_MESSAGE,
                timestamp: new Date().toISOString(),
                spaceId: activeSpaceId
            };
            addChatMessage(welcomeMsg);
        }
    }, [spaceChatMessages.length, activeSpaceId, addChatMessage]);

    return {
        messages: spaceChatMessages,
        isLoading,
        error,
        sendMessage,
        clearHistory,
        initializeChat,
        isEnabled: settings.chat?.enabled ?? false,
        hasApiKey
    };
}
