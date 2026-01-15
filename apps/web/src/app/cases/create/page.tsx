'use client'

import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { LightningIframe } from '@/components/salesforce/lightning-iframe'
import { Card, CardContent } from '@/components/ui/card'

export default function CreateCasePage() {
  return (
    <DashboardLayout title="Create Case">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create New Case</h1>
          <p className="text-muted-foreground">
            Submit a new support request
          </p>
        </div>

        <div className="max-w-2xl">
          <Card>
            <CardContent className="p-0">
              <LightningIframe
              component="caseCreator"
              externalUserId={process.env.NEXT_PUBLIC_EXTERNAL_USER_ID}
            />
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
