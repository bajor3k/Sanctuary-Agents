import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Missing API Key" }, { status: 500 });
  }

  const searchParams = request.nextUrl.searchParams;
  const symbol = searchParams.get("symbol");

  if (!symbol) {
    return NextResponse.json({ error: "Stock symbol is required" }, { status: 400 });
  }

  try {
    const toDate = new Date().toISOString().split('T')[0];
    const fromDate = new Date(new Date().setFullYear(new Date().getFullYear() - 2)).toISOString().split('T')[0];

    const res = await fetch(
      `https://finnhub.io/api/v1/stock/usa-spending?symbol=${symbol}&from=${fromDate}&to=${toDate}&token=${apiKey}`,
      { next: { revalidate: 3600 } } // Cache for 1 hour
    );
    
    if (!res.ok) {
      throw new Error(`Finnhub error: ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("USA Spending Fetch Error:", error);
    return NextResponse.json({ error: "Failed to fetch USA spending data" }, { status: 500 });
  }
}
