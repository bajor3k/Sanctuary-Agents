
export function PlaceholderChart({ dataAiHint = "abstract chart" }: { dataAiHint?: string }) {
  return (
    <div 
      className="w-full h-full bg-black/40 backdrop-blur-sm rounded-lg shadow-white-glow-soft flex items-center justify-center p-4" 
      data-ai-hint={dataAiHint}
    >
      <svg width="100%" height="100%" viewBox="0 0 100 60" preserveAspectRatio="xMidYMid meet" className="text-primary/70">
        <defs>
          <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: "hsl(var(--primary))", stopOpacity: 0.5 }} />
            <stop offset="100%" style={{ stopColor: "hsl(var(--primary))", stopOpacity: 0.1 }} />
          </linearGradient>
        </defs>
        {/* Bars */}
        <rect width="10" height="40" x="5" y="18" fill="url(#chartGradient)" rx="2" />
        <rect width="10" height="30" x="20" y="28" fill="url(#chartGradient)" rx="2" />
        <rect width="10" height="50" x="35" y="8" fill="url(#chartGradient)" rx="2" />
        <rect width="10" height="20" x="50" y="38" fill="url(#chartGradient)" rx="2" />
        <rect width="10" height="45" x="65" y="13" fill="url(#chartGradient)" rx="2" />
        <rect width="10" height="35" x="80" y="23" fill="url(#chartGradient)" rx="2" />
        {/* Axes */}
        <line x1="2" y1="58" x2="98" y2="58" stroke="hsl(var(--border))" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="2" y1="2" x2="2" y2="58" stroke="hsl(var(--border))" strokeWidth="1.5" strokeLinecap="round" />
         {/* Placeholder text */}
        <text x="50" y="30" fontFamily="var(--font-geist-sans)" fontSize="8" fill="hsl(var(--muted-foreground))" textAnchor="middle" dominantBaseline="middle">
          Chart Area
        </text>
      </svg>
    </div>
  );
}
