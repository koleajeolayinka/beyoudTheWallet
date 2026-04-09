export interface MarketData {
  risk_level: string;
  base_rate: string;
}

export async function fetchMarketData(): Promise<MarketData | null> {
  let URL = (import.meta as any).env.VITE_APPS_SCRIPT_URL;
  
  // Fallback to the provided real URL if env is missing or placeholder
  if (!URL || URL === "YOUR_GOOGLE_APPS_SCRIPT_URL_HERE") {
    URL = "https://script.google.com/macros/s/AKfycbz8jPXlnCjWQGaq9eSCS8HaXxGceaq290986nmLsHmV9JeHz0gAKKekmI2MdDuXyVt5ag/exec";
  }
  
  try {
    const response = await fetch(URL);
    if (!response.ok) throw new Error("Failed to fetch market data");
    const data = await response.json();
    
    return {
      risk_level: data.risk_level || "Medium",
      base_rate: data.base_rate || "15%",
    };
  } catch (error) {
    console.error("Market data fetch error:", error);
    return null;
  }
}
