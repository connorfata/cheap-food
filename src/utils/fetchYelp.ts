// src/utils/fetchYelp.ts
const YELP_API_URL = "https://api.yelp.com/v3/businesses/search";

export async function fetchYelpNYCCheapEats(borough = "Manhattan") {
  const cacheKey = `yelp_${borough}`;
  const cached = localStorage.getItem(cacheKey);
  if (cached) return JSON.parse(cached);

  const params = new URLSearchParams({
    location: `${borough}, New York, NY`,
    price: "1",
    categories: "restaurants,food",
    limit: "20",
    sort_by: "best_match",
  });

  const res = await fetch(`/api/yelp?${params.toString()}`);
  if (!res.ok) throw new Error("Yelp API error");
  const data = await res.json();
  localStorage.setItem(cacheKey, JSON.stringify(data));
  return data;
}