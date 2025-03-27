import { cn } from "@/lib/utils"
import { EmployeeStatus } from "@/types"

interface EmployeeStatusBadgeProps {
  status: EmployeeStatus
}

export function EmployeeStatusBadge({ status }: EmployeeStatusBadgeProps) {
  const statusStyles = {
    FULL_TIME: "bg-green-100 text-green-700 border-green-200",
    PROBATION: "bg-yellow-100 text-yellow-700 border-yellow-200",
    CONTRACT: "bg-blue-100 text-blue-700 border-blue-200",
  }

  const statusLabels = {
    FULL_TIME: "Full Time",
    PROBATION: "Probation",
    CONTRACT: "Contract",
  }

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 text-xs rounded-sm font-medium border",
        statusStyles[status as keyof typeof statusStyles]
      )}
    >
      {statusLabels[status as keyof typeof statusLabels]}
    </span>
  )
} 