/**
 * Stock Price Service - CafeF.vn Integration
 * 
 * Fetches real-time Vietnamese stock prices from CafeF.vn
 * No API key required, works client-side
 */

export interface StockPrice {
    symbol: string;
    price: number;
    change?: number;
    changePercent?: number;
    lastUpdated: Date;
}

export class StockPriceService {
    private cache: Map<string, StockPrice> = new Map();
    private readonly CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

    /**
     * Fetch stock price from CafeF.vn URL
     * @param cafefUrl Full CafeF URL, e.g., "https://cafef.vn/du-lieu/hose/hpg-cong-ty-co-phan-tap-doan-hoa-phat.chn"
     * @param symbol Stock symbol (for cache key)
     */
    async fetchPrice(cafefUrl: string, symbol: string): Promise<StockPrice> {
        // Check cache first
        const cached = this.getCachedPrice(symbol);
        if (cached) {
            return cached;
        }

        try {
            const response = await fetch(cafefUrl);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const html = await response.text();
            const price = this.parsePrice(html);

            const stockPrice: StockPrice = {
                symbol: symbol.toUpperCase(),
                price,
                lastUpdated: new Date()
            };

            // Cache the result
            this.cache.set(symbol.toUpperCase(), stockPrice);

            return stockPrice;

        } catch (error) {
            console.error(`Failed to fetch price for ${symbol}:`, error);
            throw new Error(`Unable to fetch price for ${symbol}. Please check the CafeF URL.`);
        }
    }

    /**
     * Parse price from CafeF HTML content
     * Looks for pattern: "Giá cổ phiếu ... : 27,100 VNĐ"
     */
    private parsePrice(html: string): number {
        // Try multiple patterns to extract price
        const patterns = [
            /Giá cổ phiếu[^:]*:\s*([\d,]+)\s*VN/i,  // Meta description
            /giá:\s*([\d,]+)/i,                        // Alternative pattern
            /"price":\s*"?([\d,]+)"?/i                 // JSON data
        ];

        for (const pattern of patterns) {
            const match = html.match(pattern);
            if (match && match[1]) {
                const priceStr = match[1].replace(/,/g, '');
                const price = parseFloat(priceStr);

                if (!isNaN(price) && price > 0) {
                    return price;
                }
            }
        }

        throw new Error('Price not found in page content');
    }

    /**
     * Get cached price if still valid
     */
    private getCachedPrice(symbol: string): StockPrice | null {
        const cached = this.cache.get(symbol.toUpperCase());

        if (!cached) {
            return null;
        }

        const age = Date.now() - cached.lastUpdated.getTime();

        if (age > this.CACHE_DURATION_MS) {
            this.cache.delete(symbol.toUpperCase());
            return null;
        }

        return cached;
    }

    /**
     * Batch update multiple stocks
     */
    async fetchMultiplePrices(stocks: Array<{ symbol: string, cafefUrl: string }>): Promise<StockPrice[]> {
        const promises = stocks.map(stock =>
            this.fetchPrice(stock.cafefUrl, stock.symbol)
        );

        return Promise.all(promises);
    }

    /**
     * Clear all cached prices
     */
    clearCache(): void {
        this.cache.clear();
    }
}

// Singleton instance
export const stockPriceService = new StockPriceService();
