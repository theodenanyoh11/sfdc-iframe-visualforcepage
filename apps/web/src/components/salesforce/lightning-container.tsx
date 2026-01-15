'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

// Lightning Out (Beta) component names (Aura notation: c:componentName)
type LightningComponent = 'c:caseCreator' | 'c:caseDetail' | 'c:caseList'

// Map from component name to display name for kebab-case props
const COMPONENT_MAP: Record<string, LightningComponent> = {
  'c-case-creator': 'c:caseCreator',
  'c-case-detail': 'c:caseDetail',
  'c-case-list': 'c:caseList',
}

interface LightningContainerProps {
  // Accept both kebab-case and Aura notation
  component: LightningComponent | 'c-case-creator' | 'c-case-detail' | 'c-case-list'
  attributes?: Record<string, unknown>
  externalUserId?: string
}

// Extend window to include $Lightning API
declare global {
  interface Window {
    $Lightning: {
      use: (
        appName: string,
        callback: () => void,
        lightningEndpointUrl?: string,
        authToken?: string
      ) => void
      createComponent: (
        componentName: string,
        attributes: Record<string, unknown>,
        container: HTMLElement,
        callback?: (component: unknown, status: string, errorMessage?: string) => void
      ) => void
    }
  }
}

export function LightningContainer({
  component,
  attributes = {},
  externalUserId,
}: LightningContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const scriptRef = useRef<HTMLScriptElement | null>(null)
  const initializedRef = useRef(false)

  // Normalize component name to Aura notation
  const normalizedComponent = COMPONENT_MAP[component] || component

  const handleEvent = useCallback(
    (event: CustomEvent) => {
      const { type, detail } = event

      if (type === 'casecreated' && detail?.caseId) {
        router.push(`/cases/${detail.caseId}`)
      } else if (type === 'caseselected' && detail?.caseId) {
        router.push(`/cases/${detail.caseId}`)
      } else if (type === 'navigate' && detail?.destination) {
        router.push(`/${detail.destination}`)
      }
    },
    [router]
  )

  useEffect(() => {
    // Prevent double initialization in React strict mode
    if (initializedRef.current) return
    initializedRef.current = true

    let mounted = true

    async function init() {
      if (!containerRef.current) return

      try {
        setLoading(true)
        setError(null)

        // Get access token and app URL from API
        const res = await fetch('/api/salesforce/token')
        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.error || 'Failed to get Salesforce token')
        }

        const { accessToken, instanceUrl, lightningEndpointUrl } = data

        if (!mounted) return

        // Remove any existing Lightning Out script
        if (scriptRef.current?.parentNode) {
          scriptRef.current.parentNode.removeChild(scriptRef.current)
        }

        // Load Lightning Out JS library from the Site URL
        const script = document.createElement('script')
        script.src = `${lightningEndpointUrl}/lightning/lightning.out.js`
        script.async = true
        scriptRef.current = script

        script.onload = () => {
          if (!mounted || !containerRef.current) return

          console.log('[Lightning Out] Script loaded, initializing app...')
          console.log('[Lightning Out] Endpoint URL:', lightningEndpointUrl)
          console.log('[Lightning Out] Has $Lightning:', !!window.$Lightning)

          // Set a timeout in case $Lightning.use never calls back
          const useTimeout = setTimeout(() => {
            if (mounted && loading) {
              console.error('[Lightning Out] $Lightning.use timeout - callback never fired')
              setError('Lightning Out initialization timed out. Check browser console for errors.')
              setLoading(false)
            }
          }, 15000)

          // Initialize Lightning Out with the Aura app
          // For ltng:allowGuestAccess apps, don't pass auth token - use guest mode
          window.$Lightning.use(
            'c:CaseManagementOutApp',
            () => {
              clearTimeout(useTimeout)
              console.log('[Lightning Out] App initialized, creating component:', normalizedComponent)

              if (!mounted || !containerRef.current) return

              // Prepare component attributes
              const finalAttributes: Record<string, unknown> = {
                ...attributes,
                externalUserId: externalUserId || process.env.NEXT_PUBLIC_EXTERNAL_USER_ID,
              }

              console.log('[Lightning Out] Component attributes:', finalAttributes)

              // Create the LWC component inside the container
              window.$Lightning.createComponent(
                normalizedComponent,
                finalAttributes,
                containerRef.current,
                (component, status, errorMessage) => {
                  console.log('[Lightning Out] createComponent callback:', status, errorMessage)

                  if (!mounted) return

                  if (status === 'SUCCESS') {
                    console.log('[Lightning Out] Component created successfully')
                    setLoading(false)

                    // Set up event listeners on the container for LWC events
                    const container = containerRef.current
                    if (container) {
                      const lwcEvents = ['casecreated', 'caseselected', 'navigate']
                      lwcEvents.forEach((eventName) => {
                        container.addEventListener(eventName, handleEvent as EventListener)
                      })
                    }
                  } else if (status === 'ERROR') {
                    console.error('[Lightning Out] Component error:', errorMessage)
                    setError(errorMessage || 'Failed to create component')
                    setLoading(false)
                  } else if (status === 'INCOMPLETE') {
                    console.error('[Lightning Out] Component incomplete')
                    setError('Component creation was incomplete. Check network connectivity.')
                    setLoading(false)
                  }
                }
              )
            },
            lightningEndpointUrl
            // No auth token - using ltng:allowGuestAccess mode
          )
        }

        script.onerror = () => {
          if (mounted) {
            setError('Failed to load Lightning Out script from Salesforce')
            setLoading(false)
          }
        }

        document.body.appendChild(script)
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to initialize Lightning Out')
          setLoading(false)
        }
      }
    }

    init()

    return () => {
      mounted = false
      initializedRef.current = false
      if (scriptRef.current?.parentNode) {
        scriptRef.current.parentNode.removeChild(scriptRef.current)
      }
      // Clear container
      if (containerRef.current) {
        containerRef.current.innerHTML = ''
      }
    }
  }, [normalizedComponent, attributes, externalUserId, handleEvent])

  const handleRetry = () => {
    initializedRef.current = false
    setLoading(true)
    setError(null)
    window.location.reload()
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error Loading Component</AlertTitle>
        <AlertDescription className="mt-2">
          <p className="mb-4">{error}</p>
          <Button variant="outline" size="sm" onClick={handleRetry}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div>
      {loading && (
        <div className="space-y-4 p-6">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-10 w-32" />
        </div>
      )}
      <div
        ref={containerRef}
        className={loading ? 'hidden' : ''}
        style={{ minHeight: 400 }}
      />
    </div>
  )
}
