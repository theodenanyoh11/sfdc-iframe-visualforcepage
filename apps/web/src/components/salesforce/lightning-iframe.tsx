'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, RefreshCw, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

// Component types supported by the iframe approach
type LightningComponent = 'caseCreator' | 'caseDetail' | 'caseList'

interface LightningIframeProps {
  component: LightningComponent
  externalUserId?: string
  caseId?: string
  className?: string
  minHeight?: number
}

export function LightningIframe({
  component,
  externalUserId,
  caseId,
  className = '',
  minHeight = 500,
}: LightningIframeProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [iframeSrc, setIframeSrc] = useState<string | null>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const loadingRef = useRef(true)
  const router = useRouter()

  // Keep ref in sync with state
  useEffect(() => {
    loadingRef.current = loading
  }, [loading])

  // Handle messages from the iframe (postMessage communication)
  const handleMessage = useCallback(
    (event: MessageEvent) => {
      // Only process messages that look like ours
      if (!event.data || typeof event.data !== 'object') return

      const { type, payload } = event.data

      console.log('[Lightning Iframe] Received message:', type, payload)

      switch (type) {
        case 'CASE_CREATED':
          if (payload?.caseId) {
            router.push(`/cases/${payload.caseId}`)
          }
          break
        case 'CASE_SELECTED':
          if (payload?.caseId) {
            router.push(`/cases/${payload.caseId}`)
          }
          break
        case 'NAVIGATE':
          if (payload?.destination) {
            router.push(`/${payload.destination}`)
          }
          break
        case 'LOADED':
          console.log('[Lightning Iframe] Component loaded, hiding skeleton')
          setLoading(false)
          break
        case 'ERROR':
          setError(payload?.message || 'Unknown error from Salesforce component')
          setLoading(false)
          break
      }
    },
    [router]
  )

  useEffect(() => {
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [handleMessage])

  useEffect(() => {
    async function buildIframeSrc() {
      try {
        setLoading(true)
        loadingRef.current = true
        setError(null)

        // Get the Site URL from the API (which has access to server-side env vars)
        const res = await fetch('/api/salesforce/token')
        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.error || 'Failed to get Salesforce configuration')
        }

        const { lightningEndpointUrl } = data

        // Build the VF page URL with parameters
        const params = new URLSearchParams()

        // Map component name to Aura notation
        const componentMap: Record<LightningComponent, string> = {
          caseCreator: 'c:caseCreator',
          caseDetail: 'c:caseDetail',
          caseList: 'c:caseList',
        }

        params.set('component', componentMap[component])

        if (externalUserId) {
          params.set('externalUserId', externalUserId)
        }

        if (caseId) {
          params.set('caseId', caseId)
        }

        // Construct VF page URL on the Site
        const vfPageUrl = `${lightningEndpointUrl}/apex/CaseCreatorPage?${params.toString()}`

        console.log('[Lightning Iframe] Loading:', vfPageUrl)
        setIframeSrc(vfPageUrl)
      } catch (err) {
        console.error('[Lightning Iframe] Error:', err)
        setError(err instanceof Error ? err.message : 'Failed to initialize')
        setLoading(false)
      }
    }

    buildIframeSrc()
  }, [component, externalUserId, caseId])

  const handleIframeLoad = () => {
    console.log('[Lightning Iframe] iframe onLoad fired')
    // Use ref to check current loading state and set a shorter timeout
    setTimeout(() => {
      if (loadingRef.current) {
        console.log('[Lightning Iframe] Timeout - forcing loading to false')
        setLoading(false)
      }
    }, 3000)
  }

  const handleRetry = () => {
    setLoading(true)
    setError(null)
    setIframeSrc(null)
    setTimeout(() => {
      window.location.reload()
    }, 100)
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
    <div className={className} style={{ position: 'relative', minHeight }}>
      {/* Loading overlay - shows on top of iframe */}
      {loading && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-background/80 z-10"
          style={{ minHeight }}
        >
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Loading Salesforce component...</p>
          </div>
        </div>
      )}
      {/* iframe is always rendered once we have the src */}
      {iframeSrc && (
        <iframe
          ref={iframeRef}
          src={iframeSrc}
          onLoad={handleIframeLoad}
          className="w-full border-0"
          style={{ minHeight, opacity: loading ? 0.3 : 1, transition: 'opacity 0.3s' }}
          title={`Salesforce ${component}`}
        />
      )}
    </div>
  )
}
