'use client'

import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { LightningIframe } from '@/components/salesforce/lightning-iframe'
import { Card, CardContent } from '@/components/ui/card'

export default function CasesPage() {
  return (
    <DashboardLayout title="My Cases">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Cases</h1>
          <p className="text-muted-foreground">
            View and manage your support cases
          </p>
        </div>

        <Card>
          <CardContent className="p-0">
            <LightningIframe
              component="caseList"
              externalUserId={process.env.NEXT_PUBLIC_EXTERNAL_USER_ID}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
