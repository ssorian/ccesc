import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

export function AttendanceCell({
    present,
    total,
    onPresentChange,
}: {
    present: number
    total: number
    onPresentChange: (value: number) => void
}) {
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0

    return (
        <div className="flex items-center gap-2">
            <Input
                type="number"
                min={0}
                max={total}
                value={present}
                onChange={(e) => onPresentChange(parseInt(e.target.value) || 0)}
                className="w-14 text-center"
            />
            <span className="text-muted-foreground text-sm">/ {total}</span>
            <Badge variant={percentage >= 80 ? "default" : percentage >= 60 ? "secondary" : "destructive"}>
                {percentage}%
            </Badge>
        </div>
    )
}
