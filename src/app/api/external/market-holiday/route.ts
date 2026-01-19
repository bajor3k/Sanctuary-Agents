import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Missing API Key" }, { status: 500 });
  }

  try {
    const res = await fetch(`https://finnhub.io/api/v1/stock/market-holiday?exchange=US&token=${apiKey}`, {
      next: { revalidate: 86400 }, // Cache for 1 day
    });
    
    if (!res.ok) {
      throw new Error(`Finnhub error: ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Market Holiday Fetch Error:", error);
    return NextResponse.json({ error: "Failed to fetch market holidays" }, { status: 500 });
  }
}
