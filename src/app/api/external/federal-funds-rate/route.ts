import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const API_KEY = process.env.ALPHA_VANTAGE_API_KEY;
const BASE_URL = 'https://www.alphavantage.co/query';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const interval = searchParams.get('interval') || 'monthly';

    const url = `${BASE_URL}?function=FEDERAL_FUNDS_RATE&interval=${interval}&apikey=${API_KEY}`;

    // User-Agent header is required for Node.js
    const response = await fetch(url, {
      headers: { 'User-Agent': 'request' }
    });

    if (!response.ok) {
      throw new Error(`Alpha Vantage API error: ${response.statusText}`);
    }

    const data = await response.json();

    if (data["Error Message"]) return NextResponse.json({ error: data["Error Message"] }, { status: 400 });
    if (data["Information"]) return NextResponse.json({ error: data["Information"] }, { status: 429 });

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching Federal Funds Rate:', error);
    return NextResponse.json({ error: 'Failed to fetch Fed Funds data' }, { status: 500 });
  }
}
