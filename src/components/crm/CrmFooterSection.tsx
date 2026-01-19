
"use client";

import * as React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";


export default function CrmFooterSection({ firm, custodians }: { firm: any, custodians: string[] }) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const miscFileInputRef = React.useRef<HTMLInputElement>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const [activeCustodian, setActiveCustodian] = React.useState<string | null>(null);

  // When modal opens, set the first custodian as active
  React.useEffect(() => {
    if (isModalOpen && custodians && custodians.length > 0) {
      setActiveCustodian(custodians[0]);
    } else if (!isModalOpen) {
      setActiveCustodian(null);
    }
  }, [isModalOpen, custodians]);

  const handleCardClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleMiscCardClick = () => {
    miscFileInputRef.current?.click();
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">

        {/* Column 1 — Custodian Codes */}
        <Card 
          className="bg-card border border-border/10 rounded-xl hover:bg-muted/30 transition-colors cursor-pointer"
          onClick={() => setIsModalOpen(true)}
        >
          <CardContent className="flex flex-col items-center justify-center h-full p-6">
            <div className="flex items-center text-foreground">
              <h2 className="text-xl font-semibold">Custodian Codes</h2>
              <ChevronRight className="ml-2 h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        {/* Column 2 — Firm Documents */}
        <Card 
          className="bg-card border border-border/10 rounded-xl hover:bg-muted/30 transition-colors cursor-pointer"
          onClick={handleCardClick}
        >
          <CardContent className="flex flex-col items-center justify-center h-full p-6">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="flex items-center text-foreground">
              <h2 className="text-xl font-semibold">{firm?.firmInfo?.ip} Documents</h2>
              <ChevronRight className="ml-2 h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        {/* Column 3 — Misc Documents */}
        <Card 
          className="bg-card border border-border/10 rounded-xl hover:bg-muted/30 transition-colors cursor-pointer"
          onClick={handleMiscCardClick}
        >
          <CardContent className="flex flex-col items-center justify-center h-full p-6">
            <input
              type="file"
              ref={miscFileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="flex items-center text-foreground">
              <h2 className="text-xl font-semibold">Misc Documents</h2>
              <ChevronRight className="ml-2 h-6 w-6" />
            </div>
          </CardContent>
        </Card>

      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-lg bg-background border-border/50">
          <DialogHeader>
            <DialogTitle>Custodian Codes</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
             <div className="flex gap-2 mb-4 overflow-x-auto">
                {custodians.map((name) => (
                  <Button
                    key={name}
                    onClick={() => setActiveCustodian(name)}
                    variant={activeCustodian === name ? 'default' : 'outline'}
                    size="sm"
                    className={cn(
                      "transition-colors",
                      activeCustodian === name
                        ? "bg-primary text-primary-foreground"
                        : "bg-transparent border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    {name}
                  </Button>
                ))}
            </div>

            <div className="bg-muted/50 p-4 rounded-xl border border-border/50 min-h-[100px]">
                {activeCustodian && (
                    <>
                        <p className="font-semibold mb-2">{activeCustodian}</p>
                        {(firm?.codes?.[activeCustodian] || []).length > 0 ? (
                             firm.codes[activeCustodian].map((code: string, index: number) => (
                                <p key={`${activeCustodian}-${code}-${index}`} className="text-sm text-foreground/80">
                                • {code}
                                </p>
                            ))
                        ) : (
                             <p className="text-sm text-muted-foreground italic">No codes available for this custodian.</p>
                        )}
                    </>
                )}
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Dummy handler, you can implement actual file upload logic here
const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  if (event.target.files && event.target.files.length > 0) {
    const file = event.target.files[0];
    console.log("Selected file:", file.name);
  }
};
