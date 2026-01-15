'use client'

import { useQuery } from 'convex/react'
import { api } from '@repo/backend'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function HomePage() {
  const user = useQuery(api.users.viewer)

  if (user === undefined) {
    return (
      <DashboardLayout title="Dashboard">
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back{user?.name ? `, ${user.name}` : ''}!
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening with your project today.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
              <CardDescription>Quick start guide for your app</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Customize your dashboard layout</li>
                <li>Add new pages to the sidebar</li>
                <li>Connect your data sources</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Documentation</CardTitle>
              <CardDescription>Learn how to build with Kofi Stack</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>
                  <a
                    href="https://docs.convex.dev"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Convex Documentation
                  </a>
                </li>
                <li>
                  <a
                    href="https://ui.shadcn.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    shadcn/ui Components
                  </a>
                </li>
                <li>
                  <a
                    href="https://nextjs.org/docs"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Next.js Documentation
                  </a>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Stack</CardTitle>
              <CardDescription>Technologies powering your app</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Next.js 15 with App Router</li>
                <li>Convex for backend & database</li>
                <li>Convex Auth for authentication</li>
                <li>shadcn/ui components</li>
                <li>Tailwind CSS for styling</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            Created with{' '}
            <a
              href="https://github.com/theodenanyoh11/create-kofi-stack"
              className="text-primary hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              create-kofi-stack
            </a>
          </p>
        </div>
      </div>
    </DashboardLayout>
  )
}
