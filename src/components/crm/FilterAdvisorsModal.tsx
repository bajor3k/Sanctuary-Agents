import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface FilterAdvisorsModalProps {
    children?: React.ReactNode;
}

const FILTER_FIELDS = [
    "First Name", "Last Name", "Marital Status", "Job Title", "Email", "Phone",
    "Street", "City", "State", "Country", "Zip Code", "Company Name",
    "Gender", "Status", "Background Info", "Household", "Title", "Age",
    "Has Tags", "Contact Type", "Assigned To", "Visibility", "Source",
    "Investment Objective", "Time Horizon", "Risk Tolerance", "Occupation",
    "Attorney", "CPA", "Doctor", "Insurance", "Business Manager",
    "Family Officer", "Assistant", "Other Contact", "Trusted Contact"
];

export function FilterAdvisorsModal({ children }: FilterAdvisorsModalProps) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                {children || (
                    <Button variant="outline" size="sm" className="bg-white dark:bg-transparent border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:text-white">
                        <Filter className="mr-2 h-4 w-4" />
                        Filter
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto border-zinc-200 dark:border-zinc-800">
                <DialogHeader>
                    <DialogTitle>Filter Contacts</DialogTitle>
                    <DialogDescription>
                        Select fields to filter by.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 py-4">
                    {FILTER_FIELDS.map((field) => (
                        <div key={field} className="flex items-center space-x-2">
                            <Checkbox id={`filter-${field}`} />
                            <Label htmlFor={`filter-${field}`} className="text-sm font-medium leading-none text-zinc-700 dark:text-zinc-300 peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                {field}
                            </Label>
                        </div>
                    ))}
                </div>

                <DialogFooter>
                    <Button variant="outline">Reset</Button>
                    <Button>Apply Filters</Button>
                </DialogFooter>

            </DialogContent>
        </Dialog>
    );
}
