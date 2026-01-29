// Add your Gemini API keys here.
// These keys will be used in a round-robin rotation or failover manner.
// WARNING: Keys embedded here will be visible to anyone who inspects the compiled code.
export const GEMINI_API_KEYS: string[] = [];

export const hasEmbeddedKeys = GEMINI_API_KEYS.length > 0 && GEMINI_API_KEYS.some(k => k.length > 0 && !k.startsWith('//'));
