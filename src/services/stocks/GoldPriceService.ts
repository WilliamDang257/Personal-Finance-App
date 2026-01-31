/**
 * Gold Price Service - Giavang.org Integration (Fixed HTML Parsing)
 * 
 * Fetches real-time Vietnamese gold prices from giavang.org
 * Supports DOJI, SJC, PNJ and other brands
 * No API key required, works client-side via CORS proxy
 */

export interface GoldPrice {
    product: string;      // e.g., "NHẪN TRÒN 999 HƯNG THỊNH VƯỢNG"
    brand: string;        // e.g., "DOJI", "SJC", "PNJ"
    buyPrice: number;     // Mua vào (triệu/lượng)
    sellPrice: number;    // Bán ra (triệu/lượng)
    city: string;         // "Hà Nội", "Đà Nẵng", "TP.HCM"
    lastUpdated: Date;
}

export class GoldPriceService {
    private cache: Map<string, GoldPrice> = new Map();
    private readonly CACHE_DURATION_MS = 30 * 60 * 1000; // 30 minutes (gold prices stable)

    /**
     * Fetch gold price from giavang.org (hard-coded to giavang.org/trong-nuoc/{brand})
     * @param productName Product name to search for, e.g., "NHẪN TRÒN 999"
     * @param city City preference: "Hà Nội", "Đà Nẵng", or "TP.HCM"
     * @param brand Brand: "doji", "sjc", or "pnj" (optional, defaults to DOJI)
     */
    async fetchPrice(
        productName: string,
        city: string = 'Hà Nội',
        brand: string = 'doji'
    ): Promise<GoldPrice> {
        const giavangUrl = `https://www.giavang.org/trong-nuoc/${brand.toLowerCase()}`;

        // Check cache first
        const cacheKey = `${giavangUrl}_${productName}_${city}`;
        const cached = this.getCachedPrice(cacheKey);
        if (cached) {
            return cached;
        }

        try {
            // Use CORS proxy to bypass browser restrictions
            // AllOrigins is a free CORS proxy service
            const corsProxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(giavangUrl)}`;
            const response = await fetch(corsProxyUrl);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const html = await response.text();

            // Remove JSON-LD schema markup and CSS to avoid false matches
            let cleanedHtml = html.replace(/<script[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi, '');
            cleanedHtml = cleanedHtml.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');

            console.log('[GoldPriceService] Cleaned HTML length:', cleanedHtml.length, 'bytes');

            const goldPrice = this.parseGoldPrice(cleanedHtml, productName, city, giavangUrl);

            // Cache the result
            this.cache.set(cacheKey, goldPrice);

            return goldPrice;

        } catch (error) {
            console.error(`Failed to fetch gold price for ${productName}:`, error);

            // Check if it's a CORS error
            if (error instanceof TypeError && error.message.includes('fetch')) {
                throw new Error(`CORS blocked: giavang.org doesn't allow browser requests. This feature requires a backend proxy or CORS-enabled API.`);
            }

            throw new Error(`Unable to fetch gold price: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Parse gold price from giavang.org HTML content
     * Focuses on table structures to avoid CSS/script matches
     */
    private parseGoldPrice(html: string, productName: string, city: string, url: string): GoldPrice {
        const brand = this.extractBrand(url);
        const normalizedProduct = this.normalizeText(productName);

        console.log(`[GoldPriceService] Searching for: "${normalizedProduct}" in ${brand} prices`);

        // Extract all table rows that might contain gold prices
        const tableRowPattern = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
        const matches: Array<{ product: string, buyPrice: number, sellPrice: number }> = [];

        let rowMatch;
        while ((rowMatch = tableRowPattern.exec(html)) !== null) {
            const rowContent = rowMatch[1];

            // Skip rows that don't have gold-related keywords
            if (!this.containsGoldKeywords(rowContent)) {
                continue;
            }

            // Extract all cell contents from this row
            const cells: string[] = [];
            const cellPattern = /<td[^>]*>(.*?)<\/td>/gi;
            let cellMatch;

            while ((cellMatch = cellPattern.exec(rowContent)) !== null) {
                cells.push(cellMatch[1].trim().replace(/<[^>]+>/g, '')); // Strip remaining HTML tags
            }

            // Need at least 3 cells: product name, buy price, sell price
            if (cells.length < 3) {
                continue;
            }

            // Try to find product name and prices in cells
            for (let i = 0; i < cells.length - 2; i++) {
                const potentialProduct = cells[i];
                const potentialBuy = cells[i + 1];
                const potentialSell = cells[i + 2];

                // Check if this looks like a product name (contains digits like 999 or gold keywords)
                if (!this.containsGoldKeywords(potentialProduct)) {
                    continue;
                }

                // Try to parse prices
                const buyPrice = this.parsePrice(potentialBuy);
                const sellPrice = this.parsePrice(potentialSell);

                // Validate prices
                if (buyPrice > 0 && sellPrice > 0 && buyPrice < sellPrice && buyPrice >= 100 && sellPrice <= 300) {
                    matches.push({
                        product: potentialProduct,
                        buyPrice,
                        sellPrice
                    });

                    // Check if this product matches what we're looking for
                    const normalizedFound = this.normalizeText(potentialProduct);

                    if (this.matchesProduct(normalizedFound, normalizedProduct)) {
                        console.log(`[GoldPriceService] ✅ Match found: ${potentialProduct} - Buy: ${buyPrice}, Sell: ${sellPrice}`);
                        return {
                            product: potentialProduct,
                            brand: brand,
                            buyPrice,
                            sellPrice,
                            city: city,
                            lastUpdated: new Date()
                        };
                    }
                }
            }
        }

        // Log what we found for debugging
        console.error(`[GoldPriceService] ❌ No match found. Found ${matches.length} gold products:`);
        matches.slice(0, 10).forEach(m => {
            console.log(`  - "${m.product}": ${m.buyPrice}/${m.sellPrice}`);
        });

        throw new Error(`Gold product "${productName}" not found. Found ${matches.length} products total. Try: ${matches.slice(0, 3).map(m => m.product).join(', ')}`);
    }

    /**
     * Check if text contains gold-related keywords
     */
    private containsGoldKeywords(text: string): boolean {
        const keywords = ['999', '9999', 'vàng', 'nhẫn', 'miếng', 'lẻ', '24k', '18k', 'sjc', 'doji', 'pnj'];
        const normalized = this.normalizeText(text);
        return keywords.some(keyword => normalized.includes(keyword));
    }

    /**
     * Parse price from string (handles: "186,40", "186.40", "186.400", etc.)
     */
    private parsePrice(priceStr: string): number {
        // Remove all non-digit characters except comma and dot
        const cleaned = priceStr.replace(/[^\d,\.]/g, '');

        // Replace comma with dot for decimal parsing
        const normalized = cleaned.replace(/,/g, '.');

        const price = parseFloat(normalized);
        return isNaN(price) ? 0 : price;
    }

    /**
     * Check if found product matches search criteria
     */
    private matchesProduct(found: string, search: string): boolean {
        // Exact match
        if (found === search) return true;

        // Contains match
        if (found.includes(search) || search.includes(found)) return true;

        // Keyword match (at least 2 words match)
        const searchWords = search.split(/\s+/).filter(w => w.length > 2);
        const matchCount = searchWords.filter(word => found.includes(word)).length;

        return matchCount >= Math.min(2, searchWords.length);
    }

    /**
     * Extract brand from giavang.org URL
     */
    private extractBrand(url: string): string {
        const match = url.match(/\/trong-nuoc\/([^\/\?]+)/);
        if (match) {
            return match[1].toUpperCase();
        }
        return 'Unknown';
    }

    /**
     * Normalize text for comparison
     */
    private normalizeText(text: string): string {
        return text
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
            .replace(/\s+/g, ' ')
            .trim();
    }

    /**
     * Get cached price if still valid
     */
    private getCachedPrice(key: string): GoldPrice | null {
        const cached = this.cache.get(key);

        if (!cached) {
            return null;
        }

        const age = Date.now() - cached.lastUpdated.getTime();

        if (age > this.CACHE_DURATION_MS) {
            this.cache.delete(key);
            return null;
        }

        return cached;
    }

    /**
     * Clear all cached prices
     */
    clearCache(): void {
        this.cache.clear();
    }
}

// Singleton instance
export const goldPriceService = new GoldPriceService();
