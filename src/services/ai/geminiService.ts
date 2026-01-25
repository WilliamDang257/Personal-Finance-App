import type { ChatMessage } from '../../types';



export interface GeminiMessage {
    role: 'user' | 'model';
    parts: { text: string }[];
}

export interface GeminiRequest {
    contents: GeminiMessage[];
    generationConfig?: {
        temperature?: number;
        maxOutputTokens?: number;
    };
}

export interface GeminiResponse {
    usageMetadata?: {
        promptTokenCount: number;
        candidatesTokenCount: number;
        totalTokenCount: number;
    };
    candidates: {
        content: {
            parts: { text: string }[];
            role: string;
        };
        finishReason: string;
    }[];
}

export class GeminiService {
    private apiKey: string;
    private modelName: string = 'gemini-1.5-flash'; // default fallback

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    private async resolveModel(): Promise<string> {
        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${this.apiKey}`);
            if (!response.ok) return this.modelName;

            const data = await response.json();
            if (!data.models) return this.modelName;

            // Priority list of models to look for
            const priorities = [
                'gemini-1.5-flash',
                'gemini-1.5-flash-latest',
                'gemini-1.5-flash-001',
                'gemini-1.5-pro',
                'gemini-pro'
            ];

            // Filter for models that support generateContent
            const availableModels = data.models.filter((m: any) =>
                m.supportedGenerationMethods?.includes('generateContent') &&
                m.name.includes('gemini')
            );

            // Try to find a match in priority order
            for (const priority of priorities) {
                const match = availableModels.find((m: any) => m.name.endsWith(priority));
                if (match) {
                    const resolved = match.name.replace('models/', '');
                    console.log('Use Gemini Model:', resolved);
                    return resolved;
                }
            }

            // Fallback to first available gemini model
            if (availableModels.length > 0) {
                const resolved = availableModels[0].name.replace('models/', '');
                console.log('Use Gemini Model (Fallback):', resolved);
                return resolved;
            }

            return this.modelName;
        } catch (e) {
            console.warn('Failed to resolve model, using default', e);
            return this.modelName;
        }
    }

    async sendMessage(
        messages: ChatMessage[],
        systemPrompt?: string
    ): Promise<{ text: string; tokens?: { prompt: number; response: number; total: number } }> {
        try {
            // Resolve model if not already confident (or just do it once, but for now simple)
            const model = await this.resolveModel();
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

            // Convert ChatMessage[] to Gemini format
            const geminiMessages: GeminiMessage[] = messages
                .filter(m => m.role !== 'system')
                .map(m => ({
                    role: m.role === 'assistant' ? 'model' : 'user',
                    parts: [{ text: m.content }]
                }));

            // Prepend system prompt if provided
            if (systemPrompt) {
                geminiMessages.unshift({
                    role: 'user',
                    parts: [{ text: systemPrompt }]
                });
                geminiMessages.unshift({
                    role: 'model',
                    parts: [{ text: 'Understood. I will act as your financial assistant.' }]
                });
            }

            const requestBody: GeminiRequest = {
                contents: geminiMessages,
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 1000
                }
            };

            const response = await fetch(`${url}?key=${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('Gemini API Error details:', errorData);
                throw new Error(errorData.error?.message || `Gemini API Error: ${response.status} ${response.statusText}`);
            }

            const data: GeminiResponse = await response.json();

            if (!data.candidates || data.candidates.length === 0) {
                throw new Error('No response from Gemini');
            }

            const text = data.candidates[0].content.parts[0].text;
            const usage = data.usageMetadata ? {
                prompt: data.usageMetadata.promptTokenCount,
                response: data.usageMetadata.candidatesTokenCount,
                total: data.usageMetadata.totalTokenCount
            } : undefined;

            return { text, tokens: usage };
        } catch (error) {
            console.error('Gemini API error:', error);
            throw error;
        }
    }

    async testConnection(): Promise<boolean> {
        try {
            await this.sendMessage([
                {
                    id: 'test',
                    role: 'user',
                    content: 'Hello',
                    timestamp: new Date().toISOString(),
                    spaceId: 'test'
                }
            ]);
            return true;
        } catch {
            return false;
        }
    }
}
