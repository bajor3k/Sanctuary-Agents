import { Team } from "@/types/ticket";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface TeamSelectorProps {
    value?: Team;
    onChange: (value: Team) => void;
    exclude?: Team[];
    className?: string;
}

const ALL_TEAMS: Team[] = [
    "Advisor Services",
    "Compliance",
    "Principal Review Desk",
    "Direct Business",
    "Alternative Investments",
    "Asset Movement",
];

export function TeamSelector({ value, onChange, exclude = [], className }: TeamSelectorProps) {
    const teams = ALL_TEAMS.filter((t) => !exclude.includes(t));

    return (
        <Select value={value} onValueChange={(val) => onChange(val as Team)}>
            <SelectTrigger className={cn("w-full text-foreground bg-background border-input", className)}>
                <SelectValue placeholder="Select Destination Team" />
            </SelectTrigger>
            <SelectContent>
                {teams.map((team) => (
                    <SelectItem key={team} value={team}>
                        {team}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
