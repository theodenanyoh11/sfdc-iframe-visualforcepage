/**
 * Salesforce OAuth Authentication Utility for Lightning Out (Beta)
 * Uses OAuth Client Credentials flow with Integration User
 *
 * This approach allows external users (without SF licenses) to use
 * Lightning Out components via a shared Integration User credential.
 */

export interface SalesforceTokenResponse {
  accessToken: string
  instanceUrl: string
  expiresAt: number
}

// Cache the token to avoid unnecessary requests
let cachedToken: SalesforceTokenResponse | null = null

/**
 * Get Salesforce access token using Client Credentials flow
 * This uses the Integration User for API access
 */
export async function getSalesforceAccessToken(): Promise<SalesforceTokenResponse> {
  // Return cached token if still valid (with 5 minute buffer)
  if (cachedToken && cachedToken.expiresAt > Date.now() + 5 * 60 * 1000) {
    return cachedToken
  }

  const {
    SALESFORCE_CLIENT_ID,
    SALESFORCE_CLIENT_SECRET,
    SALESFORCE_INSTANCE_URL,
  } = process.env

  if (!SALESFORCE_CLIENT_ID || !SALESFORCE_CLIENT_SECRET || !SALESFORCE_INSTANCE_URL) {
    throw new Error(
      'Missing Salesforce configuration. Required: SALESFORCE_CLIENT_ID, SALESFORCE_CLIENT_SECRET, SALESFORCE_INSTANCE_URL'
    )
  }

  const response = await fetch(`${SALESFORCE_INSTANCE_URL}/services/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: SALESFORCE_CLIENT_ID,
      client_secret: SALESFORCE_CLIENT_SECRET,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('Salesforce client credentials error:', errorText)
    throw new Error(`Client credentials authentication failed: ${response.status} - ${errorText}`)
  }

  const data = await response.json()

  cachedToken = {
    accessToken: data.access_token,
    instanceUrl: data.instance_url || SALESFORCE_INSTANCE_URL,
    // Default to 2 hours if not specified
    expiresAt: Date.now() + (data.expires_in ? data.expires_in * 1000 : 2 * 60 * 60 * 1000),
  }

  return cachedToken
}

/**
 * Get the Lightning Out endpoint URL
 * For Sites, use the SALESFORCE_SITE_URL which has proper CORS support
 */
export function getLightningOutEndpointUrl(): string {
  const { SALESFORCE_SITE_URL, SALESFORCE_INSTANCE_URL } = process.env

  // Prefer Site URL for Lightning Out (has CORS support)
  // Fall back to instance URL if no Site is configured
  const url = SALESFORCE_SITE_URL || SALESFORCE_INSTANCE_URL

  if (!url) {
    throw new Error('Missing SALESFORCE_SITE_URL or SALESFORCE_INSTANCE_URL configuration')
  }

  return url
}

/**
 * Clear the cached token (useful for testing or forced refresh)
 */
export function clearTokenCache(): void {
  cachedToken = null
}
