// src/components/reports/ReportScaffold.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import type { TableRow } from "./ResultsTableCard";
import ReportsPageShell from "./ReportsPageShell";
import HelpHeader, { helpHeaderAutoDismiss } from "./HelpHeader";
import { UploadRow } from "./UploadRow";
import FullBleed from "../layout/FullBleed";
import ActionsRow from "./ActionsRow";
import { saveAs } from "file-saver";
import ResultsTableCard from "./ResultsTableCard";
import KeyMetricsPanel from "./KeyMetricsPanel";
import { FLAGS } from "@/lib/featureFlags";
import UploadSlot from "@/components/UploadSlot";
import AskMavenShell from "./maven/AskMavenShell";
import { downloadTableExcel } from "@/lib/downloadTableExcel";

type Props = {
  reportName: string;
  summary?: string | React.ReactNode;
  instructions?: React.ReactNode;
  mergeApiPath?: string;
  requiredFileCount?: 1 | 2 | 3;
  fileLabels?: string[];
};

// Helper to safely format numbers as currency
const money = (n: any, decimals = 2): string => {
  const x = Number(n);
  if (!isFinite(x)) return '';
  return x.toLocaleString('en-US', { style:'currency', currency:'USD', minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

// Helper to safely parse string to number
const num = (v: any): number | null => {
  if (v === null || v === undefined) return null;
  const n = Number(String(v).replace(/[, $]/g,''));
  return isFinite(n) ? n : null;
}

export default function ReportScaffold({
  reportName,
  summary = "",
  instructions = "",
  mergeApiPath = "/api/reports/TBD/merge",
  requiredFileCount = 1,
  fileLabels,
}: Props) {
  const [files, setFiles] = React.useState<(File | null)[]>(Array(requiredFileCount).fill(null));
  const [runState, setRunState] = React.useState<"idle" | "running" | "success" | "error">("idle");
  const [error, setError] = React.useState<string | null>(null);
  const [activeView, setActiveView] = React.useState<"maven" | "key-metrics">("maven");
  const [isMavenOpen, setIsMavenOpen] = React.useState(true);
  const [excelDownloadPath, setExcelDownloadPath] = React.useState<string | null>(null);
  const [tableRows, setTableRows] = React.useState<TableRow[]>([]);
  
  const tableRef = useRef<HTMLTableElement>(null);

  const filesReady = files.slice(0, requiredFileCount).every(Boolean);
  const canOpenMaven = runState === 'success';

  const handleFileChange = (index: number) => async (file: File | null) => {
    return new Promise<void>((resolve, reject) => {
        try {
            setFiles(prevFiles => {
              const newFiles = [...prevFiles];
              newFiles[index] = file;
              if (newFiles.filter(Boolean).length === 1 && file !== null) {
                helpHeaderAutoDismiss();
              }
              return newFiles;
            });
            resolve();
        } catch(err) {
            reject(err);
        }
    });
  };

  const handleModalComplete = (uploadedFiles: File[]) => {
    const newFiles: (File | null)[] = Array(requiredFileCount).fill(null);
    uploadedFiles.slice(0, requiredFileCount).forEach((file, index) => {
      if (file) {
        newFiles[index] = file;
      }
    });
    setFiles(newFiles);
    if (uploadedFiles.length > 0) {
      helpHeaderAutoDismiss();
    }
  };

  function processApiData(data: any[]) {
    if (!data || data.length === 0) {
      setTableRows([]);
      return;
    }
    
    const rows: TableRow[] = data.map(r => {
      const advisoryFee = num(r['Advisory Fees']) ?? 0;
      return {
        ip: r['IP'] ?? '',
        acct: r['Account Number'] ?? r['Account'] ?? '',
        value: money(r['Value']),
        fee: money(advisoryFee),
        cash: money(r['Cash']),
        short: (num(r['Cash']) ?? 0) < advisoryFee,
      };
    });
    
    setTableRows(rows);
  }

  async function runReport() {
    if (!filesReady) return;
    setRunState("running"); 
    setError(null);
    setExcelDownloadPath(null);

    try {
      const fd = new FormData();
      files.forEach((file, index) => {
        if (file) fd.append(`file${String.fromCharCode(65 + index)}`, file);
      });
      
      const res = await fetch(`${mergeApiPath}?format=json`, { method: "POST", body: fd });
      if (!res.ok) {
        const errorBody = await res.text();
        let errorDetails = errorBody;
        try {
            const errorJson = JSON.parse(errorBody);
            errorDetails = errorJson.details || errorJson.error || errorBody;
        } catch {}
        throw new Error(errorDetails);
      }
      const rows = await res.json();
      
      processApiData(Array.isArray(rows) ? rows : []);
      setRunState("success");
    } catch (e: any) {
      setError(e?.message || "Failed to run report.");
      setRunState("error");
    }
  }

  function handleExcelDownload() {
    if (!tableRef.current) return;
    downloadTableExcel({
      table: tableRef.current,
      fileName: `${reportName.replace(/\s+/g, "_").toLowerCase()}.xlsx`,
      sheetName: reportName,
    });
  }

  const resultsTable = (
    <ResultsTableCard ref={tableRef} title="Results" rows={tableRows} />
  );
  
  return (
    <ReportsPageShell>
        <FullBleed>
            <HelpHeader summary={summary} instructions={instructions} />
        </FullBleed>
        
        {FLAGS.showReportUploadCards && (
          <FullBleed>
              <UploadRow>
                {Array.from({ length: requiredFileCount }).map((_, index) => (
                  <UploadSlot
                    key={index}
                    title={fileLabels?.[index] ?? `File ${index + 1}`}
                    onUpload={handleFileChange(index)}
                  />
                ))}
              </UploadRow>
          </FullBleed>
        )}
        
        <FullBleed>
            <ActionsRow
              filesReady={filesReady}
              runState={runState}
              onRun={runReport}
              onExcel={handleExcelDownload}
              excelEnabled={tableRows.length > 0}
              onModalComplete={handleModalComplete}
              requiredFileCount={requiredFileCount}
              onToggleKeyMetrics={() => setActiveView(p => p === 'key-metrics' ? 'maven' : 'key-metrics')}
            />
            {error && <div className="text-center text-xs text-rose-400 mt-2">{error}</div>}
            {runState === 'running' && <div className="text-center text-xs text-muted-foreground mt-2">Running report...</div>}
        </FullBleed>
        
        {runState === 'success' && (
           <div className={`grid gap-4 items-start ${isMavenOpen ? "grid-cols-1 xl:grid-cols-[1fr_400px]" : "grid-cols-1"}`}>
            {activeView === 'key-metrics' 
                ? <KeyMetricsPanel rows={tableRows} /> 
                : resultsTable
            }
            <AskMavenShell onOpenChange={setIsMavenOpen} />
          </div>
        )}
    </ReportsPageShell>
  );
}
