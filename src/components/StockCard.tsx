
type Props = {
  symbol: string;
  price: number;
  changePct: number; // e.g., +1.23 or -0.85
};

export default function StockCard({ symbol, price, changePct }: Props) {
  const isUp = changePct >= 0;

  const trendClass = [
    isUp ? "text-emerald-600" : "text-destructive",            // light mode
    isUp ? "dark:text-emerald-400" : "dark:text-destructive",  // dark mode
  ].join(" ");

  const pctText = `${isUp ? "+" : ""}${changePct.toFixed(2)}%`;

  return (
    <div
      className="
        rounded-2xl border shadow-sm transition-colors
        bg-card text-card-foreground border-border 
        hover:bg-accent
        p-4
      "
    >
      <div className="flex items-start justify-between">
        <div className="flex flex-col">
          <span className="text-sm uppercase tracking-widest text-muted-foreground">
            {symbol}
          </span>
        </div>

        <div className="text-right">
          <div className="text-lg font-semibold text-foreground">
            ${price.toFixed(2)}
          </div>
          <div className={`mt-1 text-xs font-medium ${trendClass}`}>{pctText}</div>
        </div>
      </div>
    </div>
  );
}
