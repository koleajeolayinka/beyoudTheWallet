export interface MarketData {
  risk_level: string;
  base_rate: string;
}

export async function fetchMarketData(): Promise<MarketData | null> {
  try {
    const response = await fetch("/api/market-data");
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
