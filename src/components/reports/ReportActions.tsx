// components/reports/ReportActions.tsx
"use client";

import * as React from "react";
import { Download as DownloadIcon, Brain, Loader2, ChevronDown, ChevronUp, BarChartHorizontal } from "lucide-react";
import Pill from "@/components/ui/Pill";
import MavenPill from "./maven/MavenPill";
import { Button } from "../ui/button";
import ReportDownloadModal from "./ReportDownloadModal";
import type { TestReportFiles } from "@/utils/reports/test/runTestReport";

type RunState = "idle" | "running" | "success" | "error";
type ActiveView = "none" | "dashboard" | "key-metrics";

type Props = {
    filesReady: boolean;
    runState: RunState;
    activeView: ActiveView;
    onRun: () => void;
    onDownloadExcel?: () => void;
    onDownloadCsv?: () => void;
    onToggleDashboard?: () => void;
    onToggleKeyMetrics?: () => void;
    onAskMaven?: () => void;
    kbLoading?: boolean;
    isMavenOpen?: boolean;
    canOpenMaven?: boolean;
};

export default function ActionsRow({
  filesReady,
  runState,
  activeView,
  onRun,
  onDownloadExcel,
  onDownloadCsv,
  onToggleDashboard,
  onToggleKeyMetrics,
  onAskMaven,
  kbLoading = false,
  isMavenOpen = false,
  canOpenMaven = false,
}: Props) {
    const [modalOpen, setModalOpen] = React.useState(false);
    
    // This component no longer deals with files directly,
    // but the parent page will control the `onRun` and `filesReady` state.

  return (
    <>
      <div className="flex items-center justify-center gap-2 py-3">
        <Button
          className="rounded-full h-9"
          onClick={onRun}
          disabled={!filesReady || runState === 'running'}
        >
          {runState === 'running' ? <Loader2 className="animate-spin" /> : 'Run Report'}
        </Button>
        <Button
          variant="secondary"
          className="rounded-full h-9"
          onClick={onDownloadExcel}
          disabled={runState !== 'success'}
        >
          Excel
        </Button>
        <Button
          variant="secondary"
          className="rounded-full h-9"
          onClick={onToggleKeyMetrics}
          disabled={runState !== 'success'}
        >
           Key Metrics
        </Button>
         <Button
          variant="secondary"
          className="rounded-full h-9"
          onClick={() => setModalOpen(true)}
         >
          <DownloadIcon className="w-4 h-4 mr-1" />
          Download
        </Button>
      </div>

       <ReportDownloadModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title="Download Required Reports"
        onComplete={(files) => {
          // The parent component should handle these files to enable 'Run Report'
          console.log("Modal complete, files ready for parent:", files);
        }}
      />
    </>
  );
}
