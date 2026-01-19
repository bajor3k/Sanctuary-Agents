import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Missing API Key" }, { status: 500 });
  }

  try {
    const today = new Date();
    
    // 1. Look BACK 6 months (to show recent IPOs)
    const fromDateObj = new Date();
    fromDateObj.setMonth(today.getMonth() - 6);
    
    // 2. Look FORWARD 6 months
    const toDateObj = new Date();
    toDateObj.setMonth(today.getMonth() + 6);

    const fromDate = fromDateObj.toISOString().split('T')[0];
    const toDate = toDateObj.toISOString().split('T')[0];

    const res = await fetch(
      `https://finnhub.io/api/v1/calendar/ipo?from=${fromDate}&to=${toDate}&token=${apiKey}`,
      { next: { revalidate: 3600 } }
    );
    
    if (!res.ok) {
      throw new Error(`Finnhub error: ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json(data.ipoCalendar || []);
  } catch (error) {
    console.error("IPO Calendar Fetch Error:", error);
    return NextResponse.json({ error: "Failed to fetch IPOs" }, { status: 500 });
  }
}
