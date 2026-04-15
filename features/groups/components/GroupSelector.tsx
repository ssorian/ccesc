import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users } from "lucide-react"

interface GroupSelectorProps {
    groups: any[]
    selectedGroupId: string
    onGroupSelect: (groupId: string) => void
}

export function GroupSelector({ groups, selectedGroupId, onGroupSelect }: GroupSelectorProps) {
    const selectedGroupData = groups.find(g => g.group.id === selectedGroupId)?.group

    return (
        <Card>
            <CardHeader>
                <CardTitle>Selecciona un Grupo</CardTitle>
                <CardDescription>
                    Elige el grupo del que deseas capturar calificaciones.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col gap-4 md:flex-row md:items-end">
                    <div className="flex-1">
                        <Select value={selectedGroupId} onValueChange={onGroupSelect}>
                            <SelectTrigger className="w-full md:w-[400px]">
                                <SelectValue placeholder="Selecciona un grupo asignado" />
                            </SelectTrigger>
                            <SelectContent>
                                {groups.map((item) => (
                                    <SelectItem key={item.group.id} value={item.group.id}>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">{item.group.name}</span>
                                            <span className="text-muted-foreground">-</span>
                                            <span>{item.group.course.name}</span>
                                            <Badge variant="outline" className="ml-2">
                                                {item.group.period}
                                            </Badge>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    {selectedGroupData && (
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                <span>{selectedGroupData._count.members} alumnos</span>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
