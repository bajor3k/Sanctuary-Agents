// components/reports/ActionsRow.tsx
"use client";

import * as React from "react";
import ReportDownloadModal from "./ReportDownloadModal";
import ReportButtons from "./ReportButtons";

type RunState = "idle" | "running" | "success" | "error";

type Props = {
  filesReady: boolean;
  runState: RunState;
  onRun: () => void;
  onExcel?: () => void;
  onDownloadExcel?: () => void; // Alias for compatibility
  excelEnabled?: boolean;
  onToggleKeyMetrics?: () => void;
  onModalComplete?: (files: File[]) => void;
  requiredFileCount?: number;
  activeView?: "maven" | "key-metrics";
  onToggleMaven?: () => void;
  isMavenOpen?: boolean;
  canOpenMaven?: boolean;
};

export default function ActionsRow({
  filesReady,
  runState,
  onRun,
  onExcel,
  onDownloadExcel,
  excelEnabled,
  onToggleKeyMetrics,
  onModalComplete,
  requiredFileCount = 1,
  activeView,
  onToggleMaven,
  isMavenOpen,
  canOpenMaven,
}: Props) {
    const [modalOpen, setModalOpen] = React.useState(false);

    // Use onDownloadExcel if provided, otherwise onExcel
    const handleExcel = onDownloadExcel || onExcel;

  return (
    <>
      <div className="report-actions flex items-center justify-center gap-3">
        <ReportButtons
          onRun={onRun}
          filesReady={filesReady}
          running={runState === 'running'}
          downloadHref={"#"} // Download templates is always available
          onExcel={handleExcel}
          excelEnabled={excelEnabled !== undefined ? excelEnabled : !!handleExcel}
          onKeyMetrics={runState === 'success' ? onToggleKeyMetrics : undefined}
          onDownloadClick={() => setModalOpen(true)}
        />
      </div>

      {onModalComplete && (
        <ReportDownloadModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          title="Download Required Reports"
          onComplete={onModalComplete}
          requiredFileCount={requiredFileCount}
        />
      )}
    </>
  );
}
