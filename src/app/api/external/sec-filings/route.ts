import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Missing API Key" }, { status: 500 });
  }

  try {
    // Fetch latest filings (no symbol specified returns general stream)
    const res = await fetch(`https://finnhub.io/api/v1/stock/filings?token=${apiKey}`, {
      next: { revalidate: 900 }, // Cache for 15 minutes
    });
    
    if (!res.ok) {
      throw new Error(`Finnhub error: ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("SEC Filings Fetch Error:", error);
    return NextResponse.json({ error: "Failed to fetch filings" }, { status: 500 });
  }
}
