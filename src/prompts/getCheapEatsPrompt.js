// src/prompts/getCheapEatsPrompt.js
/**
 * Builds the Perplexity prompt for the Cheap Eats NYC app.
 *
 * @param {string} neighborhood – e.g. "SoHo", "Williamsburg".
 * @param {number} [maxPrice=20] – Maximum meal price in US dollars.
 * @param {number} [limit=10] – How many restaurants to request (8–10 suggested).
 * @returns {string} A Perplexity‑ready prompt string.
 */
export function getCheapEatsPrompt(neighborhood, maxPrice = 20, limit = 10) {
  return `Find ${limit} budget-friendly restaurants (average meal ≤ $${maxPrice}) in or near ${neighborhood}, New York City.

Return **ONLY** a valid JSON array, no markdown or extra text. Each element **must include all** of the following keys:

{
  "name": "Restaurant name",
  "cuisine": "Primary cuisine type",
  "average_price": 14.25,
  "price_level": "$",                     // $, $$, etc. for quick filter UI
  "address": "123 Example St, New York, NY 10001",
  "menu_url": "https://www.restaurant.com/menu",
  "yelp_rating": 4.3,
  "google_rating": 4.4,
  "tripadvisor_rating": 4.0,
  "phone": "(212)-555-1234"               // or null if unavailable
}

Guidelines:
• Include only restaurants clearly priced at or below $${maxPrice} on average.
• Prefer venues with ≥ 50 Yelp reviews for rating credibility.
• If any rating (Yelp/Google/Tripadvisor) is unavailable, output **null** (do not omit the key).
• Exclude large fast-food chains unless uniquely notable as budget NYC staples.
• Sort the final array by ascending *average_price*, then by highest *yelp_rating*.

Return the JSON array **and nothing else**.`;
}
