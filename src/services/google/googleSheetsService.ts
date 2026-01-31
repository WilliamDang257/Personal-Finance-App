
declare global {
    interface Window {
        google: any;
        gapi: any;
    }
}

export interface GoogleSheetRow {
    timestamp: string;
    type: string;
    amount: string;
    category: string;
    note: string;
}

export class GoogleSheetsService {
    private tokenClient: any;
    private gapiInited = false;
    private gisInited = false;
    private clientId: string;
    private readonly TOKEN_STORAGE_KEY = 'google_sheets_token';

    constructor(clientId: string) {
        this.clientId = clientId;
    }

    private saveToken(token: any): void {
        try {
            localStorage.setItem(this.TOKEN_STORAGE_KEY, JSON.stringify({
                access_token: token.access_token,
                expires_at: Date.now() + (token.expires_in * 1000), // Convert to timestamp
                scope: token.scope,
            }));
        } catch (e) {
            console.error('Failed to save token:', e);
        }
    }

    private loadToken(): any | null {
        try {
            const stored = localStorage.getItem(this.TOKEN_STORAGE_KEY);
            if (!stored) return null;

            const tokenData = JSON.parse(stored);

            // Check if token is expired (with 5 minute buffer)
            if (tokenData.expires_at && Date.now() >= tokenData.expires_at - 5 * 60 * 1000) {
                this.clearToken();
                return null;
            }

            return tokenData;
        } catch (e) {
            console.error('Failed to load token:', e);
            return null;
        }
    }

    private clearToken(): void {
        try {
            localStorage.removeItem(this.TOKEN_STORAGE_KEY);
        } catch (e) {
            console.error('Failed to clear token:', e);
        }
    }

    public async initialize(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.gapiInited && this.gisInited) {
                resolve();
                return;
            }

            // Load GAPI
            const gapiScript = document.createElement('script');
            gapiScript.src = "https://apis.google.com/js/api.js";
            gapiScript.onload = () => {
                window.gapi.load('client', async () => {
                    await window.gapi.client.init({
                        discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
                    });
                    this.gapiInited = true;
                    if (this.gisInited) resolve();
                });
            };
            gapiScript.onerror = reject;
            document.body.appendChild(gapiScript);

            // Load GIS
            const gisScript = document.createElement('script');
            gisScript.src = "https://accounts.google.com/gsi/client";
            gisScript.onload = () => {
                this.tokenClient = window.google.accounts.oauth2.initTokenClient({
                    client_id: this.clientId,
                    scope: 'https://www.googleapis.com/auth/spreadsheets.readonly',
                    callback: '', // defined at request time
                });
                this.gisInited = true;
                if (this.gapiInited) resolve();
            };
            gisScript.onerror = reject;
            document.body.appendChild(gisScript);
        });
    }

    public async fetchSheetData(spreadsheetId: string, range: string = 'Form Responses 1!A:E'): Promise<GoogleSheetRow[]> {
        await this.initialize();

        return new Promise((resolve, reject) => {
            // Try to load existing token first
            const savedToken = this.loadToken();
            if (savedToken) {
                // Set the token in gapi client
                window.gapi.client.setToken({
                    access_token: savedToken.access_token,
                });
            }

            this.tokenClient.callback = async (resp: any) => {
                if (resp.error !== undefined) {
                    reject(resp);
                    return;
                }

                // Save the new token
                this.saveToken(resp);

                try {
                    const response = await window.gapi.client.request({
                        path: `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`,
                    });

                    const rows = response.result.values;
                    if (!rows || rows.length === 0) {
                        resolve([]);
                        return;
                    }

                    // Assume first row is header if needed, but for now map by index logic
                    // Mapping: Timestamp (0), Type (1), Amount (2), Category (3), Note (4)
                    // Skip header row if "Timestamp" is in first cell
                    let startIdx = 0;
                    if (rows[0][0] === 'Timestamp') {
                        startIdx = 1;
                    }

                    const parsedRows: GoogleSheetRow[] = [];
                    for (let i = startIdx; i < rows.length; i++) {
                        const row = rows[i];
                        if (row.length < 3) continue; // Basic validation

                        parsedRows.push({
                            timestamp: row[0],
                            type: row[1],
                            amount: row[2],
                            category: row[3],
                            note: row[4] || ''
                        });
                    }

                    resolve(parsedRows);

                } catch (e: any) {
                    // Handle 401 Unauthorized (Token expired or revoked)
                    if (e.status === 401 || (e.result && e.result.error && e.result.error.code === 401)) {
                        console.log("Token expired or invalid (401). clearing and refreshing...");
                        this.clearToken();
                        window.gapi.client.setToken(null);

                        // Request new token with consent prompt to ensure fresh credentials
                        // This will trigger this callback again upon success
                        this.tokenClient.requestAccessToken({ prompt: 'consent' });
                        return;
                    }

                    reject(e);
                }
            };

            // Check if we have a valid token
            const currentToken = window.gapi.client.getToken();
            if (currentToken === null || currentToken.access_token === undefined) {
                // Need to request new token
                this.tokenClient.requestAccessToken({ prompt: savedToken ? '' : 'consent' });
            } else {
                // Token exists, try to use it
                this.tokenClient.callback({ access_token: currentToken.access_token });
            }
        });
    }

    public revokeAccess(): void {
        const token = window.gapi.client.getToken();
        if (token !== null) {
            window.google.accounts.oauth2.revoke(token.access_token, () => {
                this.clearToken();
                window.gapi.client.setToken(null);
            });
        } else {
            this.clearToken();
        }
    }
}

