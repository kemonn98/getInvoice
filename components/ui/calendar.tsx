"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface CalendarProps {
  selected?: Date
  onSelect?: (date: Date) => void
  className?: string
  initialFocus?: boolean
  mode?: "single" // Add more modes if needed
}

function Calendar({ selected, onSelect, className }: CalendarProps) {
  const [viewDate, setViewDate] = React.useState(selected || new Date())

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]

  // Generate years (100 years in the past from current year)
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i)

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const handleYearChange = (year: string) => {
    setViewDate(new Date(parseInt(year), viewDate.getMonth(), 1))
  }

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(viewDate)
    const firstDay = getFirstDayOfMonth(viewDate)
    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10 w-10" />)
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), day)
      const isSelected = selected?.toDateString() === date.toDateString()
      const isToday = date.toDateString() === new Date().toDateString()

      days.push(
        <button
          key={day}
          onClick={() => {
            onSelect?.(date)
          }}
          className={cn(
            "h-10 w-10 rounded-full",
            "hover:bg-accent hover:text-accent-foreground",
            isSelected && "bg-primary text-primary-foreground",
            isToday && "border-2 border-primary",
            "transition-colors"
          )}
        >
          {day}
        </button>
      )
    }

    return days
  }

  return (
    <div className={cn("p-4 space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1))}
          className={buttonVariants({ variant: "ghost", size: "icon" })}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2">
          <div className="font-medium">
            {months[viewDate.getMonth()]}
          </div>
          <Select
            value={viewDate.getFullYear().toString()}
            onValueChange={handleYearChange}
          >
            <SelectTrigger className="w-[95px] h-8">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent className="max-h-[200px] overflow-y-auto">
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <button
          onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1))}
          className={buttonVariants({ variant: "ghost", size: "icon" })}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Weekdays */}
      <div className="grid grid-cols-7 gap-1 text-center text-sm text-muted-foreground">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {renderCalendarDays()}
      </div>
    </div>
  )
}

export { Calendar } 
