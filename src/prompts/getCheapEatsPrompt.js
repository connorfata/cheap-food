export function getCheapEatsPrompt(neighborhood, maxPrice = 20, limit = 10) {
  return `Find ${limit} budget-friendly restaurants (average meal ≤ ${maxPrice}) in or near ${neighborhood}, New York City.

**IMPORTANT**: For each restaurant, you MUST include the exact latitude and longitude coordinates.

Return **ONLY** a valid JSON array, no markdown or extra text. Each element **must include all** of the following keys:

{
  "name": "Restaurant name",
  "cuisine": "Primary cuisine type",
  "average_price": 14.25,
  "price_level": "$",                     // $, $$, $$$ for quick filter UI
  "address": "123 Example St, New York, NY 10001",
  "latitude": 40.7589,                    // REQUIRED: Exact decimal coordinates
  "longitude": -73.9851,                  // REQUIRED: Exact decimal coordinates  
  "website_url": "https://www.restaurant.com",     // Main restaurant website
  "menu_url": "https://www.restaurant.com/menu",   // or null if unavailable
  "yelp_rating": 4.3,
  "google_rating": 4.4,
  "tripadvisor_rating": 4.0,              // or null if unavailable
  "phone": "(212)-555-1234"               // or null if unavailable
}

**Critical Requirements**:
• **COORDINATES ARE MANDATORY**: Every restaurant MUST have accurate latitude and longitude
• **TOP DISHES AS STRING**: List 3 popular dishes with prices in one descriptive sentence
• Use web search to verify each restaurant's exact location and get precise coordinates
• Include only restaurants clearly priced at or below $${maxPrice} on average
• **DISH PRICES MUST BE CHEAP**: All dishes mentioned should be under $${Math.round(maxPrice * 0.8)} individually
• Prefer venues with ≥ 50 Yelp reviews for rating credibility
• If any rating (Yelp/Google/Tripadvisor) is unavailable, output **null** (do not omit the key)
• Exclude large fast-food chains unless uniquely notable as budget NYC staples
• Sort the final array by ascending *average_price*, then by highest *yelp_rating*

**Coordinate Validation**:
• Latitude should be around 40.7 for NYC area
• Longitude should be around -73.9 to -74.0 for NYC area
• Verify coordinates place the restaurant in the correct neighborhood

Return the JSON array **and nothing else**.`;
}