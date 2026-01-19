
"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import UploadCard from "@/components/UploadCard";

type SelectReportsModalProps = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onComplete: (files: { report1: File; report2: File; report3: File }) => void;
};

export function SelectReportsModal({ open, onOpenChange, onComplete }: SelectReportsModalProps) {
  const [report1, setReport1] = React.useState<File | null>(null);
  const [report2, setReport2] = React.useState<File | null>(null);
  const [report3, setReport3] = React.useState<File | null>(null);

  const ready = !!(report1 && report2 && report3);

  const reset = () => { setReport1(null); setReport2(null); setReport3(null); };

  return (
    <Dialog open={open} onOpenChange={(v) => { if(!v) reset(); onOpenChange(v); }}>
      <DialogContent className="sm:max-w-3xl border-0 bg-[#0b0b0b] text-white">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Select Files</DialogTitle>
        </DialogHeader>

        <div className="text-white/70 text-sm">
          Please upload the three required reports to run this test:
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <UploadCard dropzoneText="Report 1" file={report1} onFileChange={setReport1} />
          <UploadCard dropzoneText="Report 2" file={report2} onFileChange={setReport2} />
          <UploadCard dropzoneText="Report 3" file={report3} onFileChange={setReport3} />
        </div>

        <DialogFooter className="flex items-center justify-between sm:justify-between w-full">
          <Button variant="secondary" className="rounded-full" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            className="rounded-full"
            disabled={!ready}
            onClick={() => {
              if (!ready) return;
              onComplete({ report1: report1!, report2: report2!, report3: report3! });
              onOpenChange(false);
            }}
          >
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
