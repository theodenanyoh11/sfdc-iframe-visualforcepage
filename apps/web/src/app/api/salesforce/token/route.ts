import { NextResponse } from 'next/server'
import { getSalesforceAccessToken, getLightningOutEndpointUrl } from '@/lib/salesforce-auth'

/**
 * GET /api/salesforce/token
 *
 * Returns an access token using Client Credentials flow.
 * This token is used by Lightning Out (Beta) to authenticate
 * external users via the Integration User.
 */
export async function GET() {
  try {
    // Get access token using client credentials flow
    const tokenResponse = await getSalesforceAccessToken()

    // Get the Lightning Out endpoint URL (just the instance URL)
    const lightningEndpointUrl = getLightningOutEndpointUrl()

    return NextResponse.json({
      accessToken: tokenResponse.accessToken,
      instanceUrl: tokenResponse.instanceUrl,
      lightningEndpointUrl,
      expiresAt: tokenResponse.expiresAt,
    })
  } catch (error) {
    console.error('Salesforce token error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get Salesforce token' },
      { status: 500 }
    )
  }
}
