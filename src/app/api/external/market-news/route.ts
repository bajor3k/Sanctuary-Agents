import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const API_KEY = process.env.ALPHA_VANTAGE_API_KEY;
const BASE_URL = 'https://www.alphavantage.co/query';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tickers = searchParams.get('tickers');
    const sentiment = searchParams.get('sentiment');

    let queryParams = `function=NEWS_SENTIMENT&sort=LATEST&limit=50&apikey=${API_KEY}`;

    // Pass ticker to API
    if (tickers) {
      queryParams += `&tickers=${tickers}`;
    }

    const url = `${BASE_URL}?${queryParams}`;

    // Cache for 1 hour
    const response = await fetch(url, {
      headers: { 'User-Agent': 'request' },
      next: { revalidate: 3600 }
    });

    if (!response.ok) {
      if (response.status === 429) return NextResponse.json([]);
      throw new Error(`Alpha Vantage API error: ${response.statusText}`);
    }

    const data = await response.json();

    if (data["Error Message"]) return NextResponse.json({ error: data["Error Message"] }, { status: 400 });
    if (data["Information"]) return NextResponse.json({ error: data["Information"] }, { status: 429 });

    let feed = data.feed || [];

    // 1. STRICT TICKER FILTER
    // The API sometimes returns related news (like sector news) even if a ticker is requested.
    // We manually verify the ticker is in the 'ticker_sentiment' list.
    if (tickers) {
      const targetTicker = tickers.toUpperCase();
      feed = feed.filter((article: any) => {
        if (!article.ticker_sentiment) return false;
        return article.ticker_sentiment.some((t: any) => t.ticker === targetTicker);
      });
    }

    // 2. SENTIMENT FILTER
    if (sentiment && sentiment !== 'All') {
      feed = feed.filter((item: any) => {
        const label = item.overall_sentiment_label;
        if (sentiment === 'Bullish') return label === 'Bullish' || label === 'Somewhat-Bullish';
        if (sentiment === 'Bearish') return label === 'Bearish' || label === 'Somewhat-Bearish';
        if (sentiment === 'Neutral') return label === 'Neutral';
        return true;
      });
    }

    return NextResponse.json(feed.slice(0, 10));
  } catch (error) {
    console.error('Error fetching News Sentiment:', error);
    return NextResponse.json([], { status: 200 });
  }
}
