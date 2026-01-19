
"use client";

import * as React from 'react';
import Image from "next/image";
import { Loader2, Search, Send, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { PlaceholderCard } from '@/components/dashboard/placeholder-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from "@/lib/utils";

export default function TickerLookupTool() {
  const [tickerQuery, setTickerQuery] = React.useState('');
  const [tickerData, setTickerData] = React.useState<any>(null);
  const [isLoadingTicker, setIsLoadingTicker] = React.useState(false);

  const handleTickerLookup = () => {
    if (!tickerQuery.trim()) return;
    setIsLoadingTicker(true);
    setTickerData(null);
    setTimeout(() => {
      const companySymbol = tickerQuery.toUpperCase();
      setTickerData({
        companyName: `${companySymbol} Innovations Inc.`,
        symbol: companySymbol,
        exchange: "NASDAQ",
        sector: "Technology",
        industry: "Software - Application",
        logo: `https://placehold.co/48x48.png?text=${companySymbol}`,
        marketCap: "1.75T",
        currentPrice: (Math.random() * 200 + 100).toFixed(2),
        priceChangeAmount: (Math.random() * 5 - 2.5).toFixed(2),
        priceChangePercent: (Math.random() * 2 - 1).toFixed(2),
        previousClose: (Math.random() * 200 + 98).toFixed(2),
        openPrice: (Math.random() * 200 + 99).toFixed(2),
        daysRange: `${(Math.random() * 190 + 95).toFixed(2)} - ${(Math.random() * 210 + 105).toFixed(2)}`,
        fiftyTwoWeekRange: `${(Math.random() * 150 + 50).toFixed(2)} - ${(Math.random() * 250 + 150).toFixed(2)}`,
        volume: (Math.random() * 10000000 + 5000000).toLocaleString(undefined, {maximumFractionDigits:0}),
        avgVolume: (Math.random() * 12000000 + 6000000).toLocaleString(undefined, {maximumFractionDigits:0}),
        peRatio: (Math.random() * 30 + 15).toFixed(1),
        epsTTM: (Math.random() * 10 + 2).toFixed(2),
        dividendYield: `${(Math.random() * 2.5).toFixed(2)}%`,
        beta: (Math.random() * 0.8 + 0.7).toFixed(2),
        nextEarningsDate: new Date(Date.now() + Math.random() * 60 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        dividendDate: Math.random() > 0.5 ? new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString() : "N/A",
        priceHistory1D: Array.from({ length: 20 }, () => Math.random() * 5 + 150),
        recentNews: [
          { id: 'n1', headline: `${companySymbol} announces breakthrough in AI research.`, sentiment: 'positive', source: 'Tech Times' },
          { id: 'n2', headline: `Analysts upgrade ${companySymbol} to 'Buy'.`, sentiment: 'positive', source: 'Finance Today' },
          { id: 'n3', headline: `Market volatility impacts ${companySymbol} stock price.`, sentiment: 'neutral', source: 'Market Watch' },
        ]
      });
      setIsLoadingTicker(false);
    }, 1500);
  };

  return (
    <PlaceholderCard title="Ticker Lookup Tool" icon={Search} className="lg:col-span-3">
        <div className="flex space-x-2 mb-4">
        <Input
            type="text"
            placeholder="Enter stock ticker (e.g., AAPL)"
            className="bg-input border-border/50 text-foreground placeholder-muted-foreground focus:ring-primary"
            value={tickerQuery}
            onChange={(e) => setTickerQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleTickerLookup()}
        />
        <Button onClick={handleTickerLookup} disabled={isLoadingTicker}>
            {isLoadingTicker ? <Loader2 className="animate-spin h-4 w-4" /> : <Send className="h-4 w-4" />}
        </Button>
        </div>
        {isLoadingTicker && <p className="text-sm text-muted-foreground text-center">Fetching data...</p>}
        {tickerData && !isLoadingTicker && (
        <div className="space-y-6 text-sm">
            {/* Header Section */}
            <div className="pb-4 border-b border-border/30">
                <div className="flex items-start space-x-4 mb-3">
                    <Image src={tickerData.logo} alt={`${tickerData.companyName} logo`} width={48} height={48} className="rounded-md bg-muted p-1" data-ai-hint="company logo"/>
                    <div>
                    <h3 className="text-xl font-bold text-foreground">{tickerData.companyName}</h3>
                    <p className="text-muted-foreground">
                        {tickerData.symbol} • {tickerData.exchange}
                    </p>
                    <p className="text-xs text-muted-foreground/80">
                        {tickerData.sector} • {tickerData.industry}
                    </p>
                    </div>
                </div>
            </div>

            {/* Live Price Section */}
            <div className="pb-4 border-b border-border/30">
                <div className="flex items-baseline space-x-2 mb-2">
                    <p className="text-4xl font-bold text-foreground">${tickerData.currentPrice}</p>
                    <p className={cn(
                    "text-lg font-semibold",
                    parseFloat(tickerData.priceChangeAmount) >= 0 ? "text-green-400" : "text-red-400"
                    )}>
                    {parseFloat(tickerData.priceChangeAmount) >= 0 ? <ArrowUpRight className="inline h-4 w-4 mb-1" /> : <ArrowDownRight className="inline h-4 w-4 mb-1" />}
                    {tickerData.priceChangeAmount} ({tickerData.priceChangePercent}%)
                    </p>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                    <div><strong className="text-muted-foreground">Prev. Close:</strong> ${tickerData.previousClose}</div>
                    <div><strong className="text-muted-foreground">Open:</strong> ${tickerData.openPrice}</div>
                    <div><strong className="text-muted-foreground">Day's Range:</strong> {tickerData.daysRange}</div>
                    <div><strong className="text-muted-foreground">52W Range:</strong> {tickerData.fiftyTwoWeekRange}</div>
                    <div><strong className="text-muted-foreground">Volume:</strong> {tickerData.volume}</div>
                    <div><strong className="text-muted-foreground">Avg. Volume:</strong> {tickerData.avgVolume}</div>
                </div>
            </div>

            {/* Valuation Metrics Section */}
            <div className="pb-4 border-b border-border/30">
                <h4 className="text-md font-semibold text-foreground mb-2">Valuation Metrics</h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                    <div><strong className="text-muted-foreground">Market Cap:</strong> {tickerData.marketCap}</div>
                    <div><strong className="text-muted-foreground">P/E Ratio (TTM):</strong> {tickerData.peRatio}</div>
                    <div><strong className="text-muted-foreground">EPS (TTM):</strong> ${tickerData.epsTTM}</div>
                    <div><strong className="text-muted-foreground">Div. Yield:</strong> {tickerData.dividendYield}</div>
                    <div><strong className="text-muted-foreground">Beta:</strong> {tickerData.beta}</div>
                </div>
            </div>

            {/* Key Dates Section */}
            <div className="pb-4 border-b border-border/30">
                <h4 className="text-md font-semibold text-foreground mb-2">Key Dates</h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                    <div><strong className="text-muted-foreground">Next Earnings:</strong> {tickerData.nextEarningsDate}</div>
                    <div><strong className="text-muted-foreground">Dividend Date:</strong> {tickerData.dividendDate}</div>
                </div>
            </div>

            {/* Optional: 1D Price Trend (Placeholder) */}
            <div className="pb-4 border-b border-border/30">
                <h4 className="text-md font-semibold text-foreground mb-2">1D Price Trend</h4>
                <div className="h-20 w-full bg-muted/30 rounded-md flex items-center justify-center" data-ai-hint="mini stock chart">
                    <span className="text-xs text-muted-foreground">Chart Placeholder</span>
                </div>
            </div>

            {/* Optional: Recent News (Placeholder) */}
            <div>
                <h4 className="text-md font-semibold text-foreground mb-2">Recent News</h4>
                <ul className="space-y-2 text-xs">
                    {tickerData.recentNews.map((newsItem: any) => (
                    <li key={newsItem.id} className="pb-1 border-b border-border/20 last:border-b-0">
                        <p className="text-foreground hover:text-primary cursor-pointer">{newsItem.headline}</p>
                        <p className={cn(
                        "text-xs",
                        newsItem.sentiment === 'positive' ? 'text-green-400' :
                        newsItem.sentiment === 'negative' ? 'text-red-400' :
                        'text-muted-foreground'
                        )}>
                        {newsItem.source} - {newsItem.sentiment}
                        </p>
                    </li>
                    ))}
                </ul>
            </div>
        </div>
        )}
    </PlaceholderCard>
  );
}
