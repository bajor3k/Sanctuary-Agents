"use client";

type Props = {
  onRun: () => Promise<void> | void;
  running?: boolean;
  filesReady?: boolean;

  // NEW:
  onExcel?: () => void;
  excelEnabled?: boolean;

  downloadHref?: string | null;   // enable when non-null
  onKeyMetrics?: () => void;      // keep null/undefined until ready
  onDownloadClick?: () => void;
};
export default function ReportButtons({
  onRun, running, filesReady,
  onExcel, excelEnabled,
  downloadHref, onKeyMetrics, onDownloadClick
}: Props) {
  const pill = "rounded-3xl border border-white/10 px-4 py-2";
  const dis  = "pointer-events-none opacity-30";
  
  const handleDownloadClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onDownloadClick) {
      e.preventDefault();
      onDownloadClick();
    }
  };

  return (
    <div className="flex gap-3">
      <a 
        href={downloadHref ?? "#"} 
        className={`${pill} ${!downloadHref ? dis : ""}`} 
        onClick={handleDownloadClick}
      >
        Download
      </a>
      <button 
        onClick={onRun} 
        disabled={!!running || !filesReady} 
        className={`${pill} disabled:opacity-40`}
      >
        {running ? "Running…" : "Run Report"}
      </button>

      {/* Excel */}
      <button
        onClick={onExcel}
        disabled={!excelEnabled}
        className={`${pill} disabled:opacity-30`}
      >
        Excel
      </button>

      <button onClick={onKeyMetrics} className={`${pill} ${!onKeyMetrics ? dis : ""}`}>Key Metrics</button>
    </div>
  );
}
