export interface MarketData {
  risk_level: string;
  base_rate: string;
}

export async function fetchMarketData(): Promise<MarketData | null> {
  const URL = (import.meta as any).env.VITE_APPS_SCRIPT_URL;
  
  if (!URL || URL.includes("YOUR_GOOGLE_APPS_SCRIPT_URL_HERE")) {
    console.error("Back-Office URL is missing or placeholder in environment variables.");
    return null;
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
