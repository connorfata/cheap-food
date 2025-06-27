export async function fetchFoodPantries() {
    const res = await fetch("https://data.cityofnewyork.us/resource/yjpx-8qdf.json?$limit=50");
    if (!res.ok) throw new Error("NYC Open Data error");
    return res.json();
  }