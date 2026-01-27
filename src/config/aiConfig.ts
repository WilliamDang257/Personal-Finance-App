// Add your Gemini API keys here.
// These keys will be used in a round-robin rotation or failover manner.
// WARNING: Keys embedded here will be visible to anyone who inspects the compiled code.
export const GEMINI_API_KEYS: string[] = [
    "AIzaSyDxM0Q97S_0Ofwnm7H6noiwJJUt2cCXDas",
    "AIzaSyBqh8hPaM9zLmCWX_kBkX4lLQOMoLYpVAk",
    "AIzaSyAJf81HLfpD8YLAGvt0nfpYmmPw5lGqDnY",
    "AIzaSyCs30rKFidkXwM-sVx1wXh4_KU_gL_cXpo",
    "AIzaSyDQm2i6B9KtwOanUtNuhvJ3Jyrbnasv-h8"
];

export const hasEmbeddedKeys = GEMINI_API_KEYS.length > 0 && GEMINI_API_KEYS.some(k => k.length > 0 && !k.startsWith('//'));
