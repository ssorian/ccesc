import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"

export function GradeInput({
    value,
    onChange,
    disabled = false,
}: {
    value: number | null
    onChange: (value: number | null) => void
    disabled?: boolean
}) {
    const [inputValue, setInputValue] = useState(value?.toString() || "")

    useEffect(() => {
        setInputValue(value?.toString() || "")
    }, [value])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value
        setInputValue(val)

        if (val === "") {
            onChange(null)
            return
        }

        const numVal = parseFloat(val)
        if (!isNaN(numVal) && numVal >= 0 && numVal <= 10) {
            onChange(numVal)
        }
    }

    return (
        <Input
            type="number"
            min={0}
            max={10}
            step={0.1}
            value={inputValue}
            onChange={handleChange}
            disabled={disabled}
            className="w-20 text-center"
            placeholder="-"
        />
    )
}
