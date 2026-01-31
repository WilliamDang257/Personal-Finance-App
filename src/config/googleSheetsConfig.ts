// Google OAuth Configuration
export const GOOGLE_OAUTH_CONFIG = {
    // Replace this with your actual Google OAuth Client ID
    // Get this from: https://console.cloud.google.com/apis/credentials
    CLIENT_ID: '693269285370-tfbi5lgopb5m5o6cm8f435bcbaqp9dpe.apps.googleusercontent.com',

    // Scopes required for Google Sheets integration
    SCOPES: 'https://www.googleapis.com/auth/spreadsheets.readonly',

    // Default sheet name for Google Forms responses
    DEFAULT_SHEET_NAME: 'Form Responses 1',
};

/**
 * Extracts the Spreadsheet ID from a Google Sheets URL
 * 
 * Supported formats:
 * - https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit
 * - https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit#gid=0
 * - Just the ID itself
 * 
 * @param input - Google Sheets URL or Spreadsheet ID
 * @returns Extracted Spreadsheet ID or original input if it's already an ID
 */
export function extractSpreadsheetId(input: string): string {
    if (!input) return '';

    const trimmed = input.trim();

    // Check if it's already just an ID (no slashes, looks like an ID)
    if (!trimmed.includes('/') && trimmed.length > 20) {
        return trimmed;
    }

    // Try to extract from URL
    const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (match && match[1]) {
        return match[1];
    }

    // If no match, return original (might be a valid ID)
    return trimmed;
}
