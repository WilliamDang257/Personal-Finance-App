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
    private modelName: string = 'gemini-2.5-flash'; // default fallback

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    private async resolveModel(key?: string): Promise<string> {
        try {
            const apiKeyToUse = key || this.apiKey;
            if (!apiKeyToUse) return this.modelName;

            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKeyToUse}`);
            if (!response.ok) return this.modelName;

            const data = await response.json();
            if (!data.models) return this.modelName;

            // Priority list of models to look for
            const priorities = [
                'gemini-2.5-flash',
                'gemini-1.5-flash',
                'gemini-1.5-flash-latest',
                'gemini-1.5-flash-001',
                'gemini-1.5-pro',
                'gemini-pro'
            ];

            // Filter for models that support generateContent
            const availableModels = data.models.filter((m: { supportedGenerationMethods?: string[], name: string }) =>
                m.supportedGenerationMethods?.includes('generateContent') &&
                m.name.includes('gemini')
            );

            // Try to find a match in priority order
            for (const priority of priorities) {
                const match = availableModels.find((m: { name: string }) => m.name.endsWith(priority));
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
        // Collect all available keys: User provided key + Embedded keys
        const keysToTry: string[] = [];
        if (this.apiKey) {
            keysToTry.push(this.apiKey);
        }

        // Add embedded keys if they exist and are valid
        const { GEMINI_API_KEYS } = await import('../../config/aiConfig');
        const embedded = GEMINI_API_KEYS.filter(k => k && !k.startsWith('//') && k.length > 20);
        keysToTry.push(...embedded);

        if (keysToTry.length === 0) {
            throw new Error('No API key provided. Please add one in Settings or embed it in the code.');
        }

        let lastError: any = null;

        // Try keys in order (Failover strategy)
        for (const key of keysToTry) {
            try {
                // Resolve model (optional: could also cache this per key if needed)
                // For simplicity, we use the key to check model availability only if we haven't resolved yet
                // But honestly, just hardcoding the model endpoint is often safer than extra calls.
                // Let's stick to the current logic but pass the key.
                const model = await this.resolveModel(key);
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

                const response = await fetch(`${url}?key=${key}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(requestBody)
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    console.warn(`Gemini API Error with key ${key.substring(0, 5)}...:`, errorData);

                    // If regular error (not auth/quota), maybe don't retry? 
                    // But usually multiple keys help with Quota mainly.
                    if (response.status === 429 || response.status === 403 || response.status === 400) {
                        // 429 = Quota exceeded, 403 = Invalid key, 400 = Bad Request (sometimes key related)
                        lastError = new Error(errorData.error?.message || response.statusText);
                        continue; // Try next key
                    }

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
                console.warn(`Attempt failed with key ${key.substring(0, 5)}...`, error);
                lastError = error;
                // Continue to next key
            }
        }

        // If loop finishes without success
        throw lastError || new Error('All API keys failed.');
    }

    async testConnection(): Promise<boolean> {
        try {
            // sendMessage handles key resolution now
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
