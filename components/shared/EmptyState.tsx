import { Card, CardContent } from "@/components/ui/card"

interface EmptyStateProps {
    icon: React.ReactNode
    title: string
    description: string
}

export function EmptyState({ icon, title, description }: EmptyStateProps) {
    return (
        <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                {icon}
                <h3 className="text-lg font-semibold mt-4">{title}</h3>
                <p className="text-muted-foreground max-w-md mt-2">
                    {description}
                </p>
            </CardContent>
        </Card>
    )
}
