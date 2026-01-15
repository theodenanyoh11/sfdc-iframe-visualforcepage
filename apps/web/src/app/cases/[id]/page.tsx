'use client'

import { use } from 'react'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { LightningIframe } from '@/components/salesforce/lightning-iframe'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface CaseDetailPageProps {
  params: Promise<{ id: string }>
}

export default function CaseDetailPage({ params }: CaseDetailPageProps) {
  const { id } = use(params)

  if (!id) {
    return (
      <DashboardLayout title="Case Not Found">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            <p className="mb-4">No case ID provided.</p>
            <Link href="/cases">
              <Button variant="outline" size="sm">
                Go to My Cases
              </Button>
            </Link>
          </AlertDescription>
        </Alert>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Case Details">
      <div className="space-y-6">
        <div className="max-w-3xl">
          <Card>
            <CardContent className="p-0">
              <LightningIframe
                component="caseDetail"
                caseId={id}
                externalUserId={process.env.NEXT_PUBLIC_EXTERNAL_USER_ID}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
