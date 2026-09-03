import { Card } from '../../shared/ui'

export function HrPlaceholderPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[22px] font-semibold leading-tight text-foreground">HR</h1>
        <p className="text-[13px] text-muted-foreground mt-1">This module is not connected yet, route and sidebar are reserved.</p>
      </div>
      <Card className="p-10 text-center">
        <p className="text-[13px] text-muted-foreground">HR domain stub — copy task/finance to connect later.</p>
      </Card>
    </div>
  )
}
