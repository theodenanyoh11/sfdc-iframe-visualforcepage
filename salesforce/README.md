# Salesforce Case Management LWC - Lightning Out (Beta)

This directory contains the Salesforce DX project for the Case Management Lightning Web Components, designed for **Lightning Out (Beta)** with guest access support.

## Why Lightning Out Beta?

Lightning Out Beta is used instead of Lightning Out 2.0 because:
- **Guest Access**: Supports `ltng:allowGuestAccess` for unauthenticated external users
- **Client Credentials**: Uses OAuth Client Credentials flow with Integration User
- **No SF Licenses Required**: External customers don't need Salesforce user accounts

## Prerequisites

- Salesforce CLI installed (`sf --version`)
- Salesforce Developer Edition or higher
- Authorized Salesforce org with Integration User configured
- Connected App with Client Credentials enabled

## Quick Start

```bash
# Navigate to this directory
cd salesforce

# Authorize your org (if not already done)
sf org login web --alias dev-org --instance-url https://login.salesforce.com

# Set as default org
sf config set target-org dev-org

# Deploy all metadata
sf project deploy start --target-org dev-org

# Assign permission set to your Integration User
sf org assign permset --name Case_Management_LWC_Access --target-org dev-org
```

## Connected App Setup (Required)

### 1. Enable Client Credentials Flow

1. Go to **Setup > App Manager**
2. Find your Connected App > **Edit**
3. Under OAuth Settings:
   - Enable **Client Credentials Flow**
   - Ensure these OAuth scopes are selected:
     - `api`
     - `web`
4. Under "Client Credentials Flow", select your **Integration User**
5. Save

### 2. Configure CORS

1. Go to **Setup > CORS**
2. Click **New**
3. Add origin: `http://localhost:3000`

### 3. Get Consumer Details

1. Go to **Setup > App Manager**
2. Find your Connected App > **Manage Consumer Details**
3. Copy **Consumer Key** and **Consumer Secret** to your `.env.local`:
   ```
   SALESFORCE_CLIENT_ID=<Consumer Key>
   SALESFORCE_CLIENT_SECRET=<Consumer Secret>
   SALESFORCE_INSTANCE_URL=https://your-org.my.salesforce.com
   ```

## Create Test Data

```bash
# Create test accounts linked to demo user
sf data create record --sobject Account \
  --values "Name='Test Company A' External_User_Id__c='demo-user-001'" \
  --target-org dev-org

sf data create record --sobject Account \
  --values "Name='Test Company B' External_User_Id__c='demo-user-002'" \
  --target-org dev-org
```

## Project Structure

```
force-app/main/default/
├── aura/
│   └── CaseManagementOutApp/       # Lightning Out app with guest access
├── classes/
│   └── CaseController.cls          # Apex controller
├── lwc/
│   ├── caseCreator/                # Create case form (c:caseCreator)
│   ├── caseDetail/                 # Case detail view (c:caseDetail)
│   └── caseList/                   # Cases list table (c:caseList)
├── objects/
│   └── Account/fields/             # Custom fields
└── permissionsets/                 # Permission sets
```

## Lightning Out Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Next.js Application                       │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              LightningContainer Component            │    │
│  │                                                      │    │
│  │  1. Fetches access token via client credentials     │    │
│  │  2. Loads lightning.out.js from Salesforce          │    │
│  │  3. Calls $Lightning.use('c:CaseManagementOutApp')  │    │
│  │  4. Creates LWC via $Lightning.createComponent()    │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  Salesforce Org                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │      CaseManagementOutApp.app (Aura)                │    │
│  │      - extends ltng:outApp                          │    │
│  │      - implements ltng:allowGuestAccess             │    │
│  │      - dependencies: c:caseCreator, c:caseDetail,   │    │
│  │                      c:caseList                     │    │
│  └─────────────────────────────────────────────────────┘    │
│                              │                               │
│                              ▼                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │            Lightning Web Components                  │    │
│  │  - caseCreator: Form for creating cases             │    │
│  │  - caseDetail: Display case information             │    │
│  │  - caseList: Table of user's cases                  │    │
│  └─────────────────────────────────────────────────────┘    │
│                              │                               │
│                              ▼                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │            CaseController.cls (Apex)                 │    │
│  │  - getAccountsByExternalUserId()                    │    │
│  │  - getCasesByExternalUserId()                       │    │
│  │  - createCase()                                     │    │
│  │  - getCaseById()                                    │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## How External Users Work

1. External user logs into your Next.js app (via your own auth system)
2. Your app stores their `externalUserId` (e.g., from Convex auth)
3. When rendering LWC components, this ID is passed as an attribute
4. The Apex controller queries Accounts where `External_User_Id__c` matches
5. Cases are filtered to only show/create for those linked Accounts

This approach:
- Uses a single Integration User for all API calls
- Filters data by `External_User_Id__c` field
- Doesn't require Salesforce licenses for external users

## Useful Commands

```bash
# Check deployment status
sf project deploy report --target-org dev-org

# View org errors/logs
sf apex tail log --target-org dev-org

# Query accounts
sf data query --query "SELECT Id, Name, External_User_Id__c FROM Account" --target-org dev-org

# Query cases
sf data query --query "SELECT Id, CaseNumber, Subject, Status FROM Case" --target-org dev-org
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Component not found" | Ensure LWC and Aura app are deployed |
| "Client credentials error" | Check Connected App has Client Credentials enabled |
| "Invalid client credentials" | Verify SALESFORCE_CLIENT_ID and SECRET in .env.local |
| "CORS error" | Add `http://localhost:3000` to CORS allowed origins |
| "No accounts found" | Create Account with matching External_User_Id__c |

## References

- [Lightning Out Developer Guide](https://developer.salesforce.com/docs/atlas.en-us.lightning.meta/lightning/lightning_out.htm)
- [ltng:allowGuestAccess Interface](https://developer.salesforce.com/docs/component-library/bundle/ltng:allowGuestAccess/documentation)
- [OAuth Client Credentials Flow](https://help.salesforce.com/s/articleView?id=sf.remoteaccess_oauth_client_credentials_flow.htm)
