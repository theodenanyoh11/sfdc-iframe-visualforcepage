# Salesforce Case Management with Lightning Out 2.0

> A headless case management solution embedding Salesforce LWC components in a Next.js SaaS application

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Phase 1: Salesforce Environment Setup](#phase-1-salesforce-environment-setup)
- [Phase 2: Salesforce DX Project Setup](#phase-2-salesforce-dx-project-setup)
- [Phase 3: Salesforce Components](#phase-3-salesforce-components)
- [Phase 4: Next.js Application](#phase-4-nextjs-application)
- [Phase 5: CORS & Security Configuration](#phase-5-cors--security-configuration)
- [Phase 6: Testing](#phase-6-testing)
- [Troubleshooting](#troubleshooting)
- [Quick Reference](#quick-reference)

---

## Overview

### What We're Building

A headless case management system that:

- Embeds Salesforce Lightning Web Components (LWC) in a Next.js application
- Uses Lightning Out 2.0 for seamless integration
- Allows users to create, view, and manage support cases
- Provides automatic UI updates when Salesforce components change (no app redeployment needed)

### Key Features

| Feature | Description |
|---------|-------------|
| **Create Case** | Form with Account selection, Type/SubType (dependent picklist), Description |
| **Case Detail** | Read-only view of submitted case |
| **My Cases** | Searchable/sortable table of user's cases |
| **Headless Architecture** | Update LWCs in Salesforce, changes reflect immediately in app |

### Tech Stack

- **Frontend**: Next.js 16, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Salesforce (Developer Edition)
- **Integration**: Lightning Out 2.0, Server-to-Server OAuth
- **Components**: Lightning Web Components (LWC), Apex Controllers

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                       Next.js SaaS Application                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   /create-case          /case-detail           /my-cases            │
│   ┌──────────────┐      ┌──────────────┐      ┌──────────────┐      │
│   │ LWC:         │      │ LWC:         │      │ LWC:         │      │
│   │ caseCreator  │      │ caseDetail   │      │ caseList     │      │
│   └──────────────┘      └──────────────┘      └──────────────┘      │
│          │                     │                     │               │
└──────────┼─────────────────────┼─────────────────────┼───────────────┘
           │                     │                     │
           ▼                     ▼                     ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    Lightning Out 2.0 Container                       │
│              (Loads LWC app from Salesforce instance)                │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         Salesforce Org                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   LWC Components:                                                    │
│   • caseCreator    - Account lookup, Type/SubType, Description      │
│   • caseDetail     - Read-only case display                         │
│   • caseList       - DataTable with navigation                      │
│                                                                      │
│   Apex Controller:                                                   │
│   • CaseController - CRUD operations, picklist handling             │
│                                                                      │
│   Lightning Out App:                                                 │
│   • CaseManagementOutApp.app - Exposes LWCs externally              │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Data Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Next.js   │────▶│  Lightning  │────▶│  Salesforce │
│     App     │     │   Out 2.0   │     │     Org     │
└─────────────┘     └─────────────┘     └─────────────┘
       │                                       │
       │  1. Request SF token (server-side)    │
       │──────────────────────────────────────▶│
       │                                       │
       │  2. Return access_token               │
       │◀──────────────────────────────────────│
       │                                       │
       │  3. Load Lightning Out JS             │
       │◀──────────────────────────────────────│
       │                                       │
       │  4. Create LWC with token             │
       │──────────────────────────────────────▶│
       │                                       │
       │  5. LWC calls Apex Controller         │
       │──────────────────────────────────────▶│
       │                                       │
       │  6. Return data/confirmation          │
       │◀──────────────────────────────────────│
       │                                       │
       │  7. LWC fires custom event            │
       │◀──────────────────────────────────────│
       │                                       │
       │  8. Next.js handles navigation        │
       ▼                                       │
```

---

## Prerequisites

### Required Accounts & Tools

- [ ] Salesforce Developer Edition account ([Sign up free](https://developer.salesforce.com/signup))
- [ ] Node.js 18+ installed
- [ ] Salesforce CLI installed
- [ ] Code editor (VS Code recommended with Salesforce Extension Pack)

### Install Salesforce CLI

```bash
# macOS (Homebrew)
brew install sf

# Windows/Linux (npm)
npm install -g @salesforce/cli

# Verify installation
sf --version
```

---

## Phase 1: Salesforce Environment Setup

### 1.1 Enable My Domain

My Domain is **required** for Lightning Out to work.

1. Navigate to: **Setup → My Domain**
2. Choose a subdomain name (e.g., `yourcompany-dev`)
3. Click **Register Domain**
4. Wait for provisioning (can take a few minutes)
5. Click **Deploy to Users**

> ⚠️ **Important**: Lightning Out will not work without My Domain configured and deployed.

### 1.2 Create Connected App

The Connected App enables server-to-server authentication between your Next.js app and Salesforce.

#### Navigation
**Setup → App Manager → New Connected App**

#### Basic Information

| Field | Value |
|-------|-------|
| Connected App Name | `Case Management Integration` |
| API Name | `Case_Management_Integration` |
| Contact Email | Your email address |

#### API (Enable OAuth Settings)

| Field | Value |
|-------|-------|
| Enable OAuth Settings | ✅ Checked |
| Callback URL | `https://localhost:3000/oauth/callback` |
| Selected OAuth Scopes | `Full access (full)` |
| | `Perform requests at any time (refresh_token, offline_access)` |
| Enable Client Credentials Flow | ✅ Checked |

#### After Saving

1. Wait 2-10 minutes for the app to propagate
2. Click **Manage Consumer Details**
3. Verify your identity (may require email verification)
4. Copy and securely store:
   - **Consumer Key** (this is your `client_id`)
   - **Consumer Secret** (this is your `client_secret`)

### 1.3 Create Integration User

Create a dedicated user for API access:

#### Create the User

1. **Setup → Users → New User**

| Field | Value |
|-------|-------|
| First Name | `Integration` |
| Last Name | `User` |
| Email | Your email |
| Username | `integration@yourcompany.salesforce.com` (must be globally unique) |
| User License | `Salesforce` |
| Profile | `System Administrator` |

#### Create Permission Set

1. **Setup → Permission Sets → New**

| Field | Value |
|-------|-------|
| Label | `API Integration Access` |
| API Name | `API_Integration_Access` |

2. After saving, configure permissions:

**System Permissions:**
- [x] API Enabled

**Object Settings → Case:**
- [x] Read
- [x] Create
- [x] Edit

**Object Settings → Account:**
- [x] Read

3. **Assign to Integration User**: Permission Sets → API Integration Access → Manage Assignments → Add Assignment

### 1.4 Configure Connected App Access

1. **Setup → App Manager → Case Management Integration → Manage**
2. Click **Edit Policies**
3. Set **Permitted Users** to: `Admin approved users are pre-authorized`
4. Save
5. Scroll to **Permission Sets** section
6. Add the `API Integration Access` permission set

---

## Phase 2: Salesforce DX Project Setup

### 2.1 Create SFDX Project

```bash
# Create the project
sf project generate --name case-management-lwc --template standard

# Navigate into the project
cd case-management-lwc
```

### 2.2 Authorize Your Org

```bash
# Login to your Developer Edition org
sf org login web --alias dev-org --instance-url https://login.salesforce.com

# Set as default org
sf config set target-org dev-org

# Verify connection
sf org display --target-org dev-org
```

### 2.3 Project Structure

After setup, your project should look like this:

```
case-management-lwc/
├── config/
│   └── project-scratch-def.json
├── force-app/
│   └── main/
│       └── default/
│           ├── aura/
│           │   └── CaseManagementOutApp/
│           ├── classes/
│           │   ├── CaseController.cls
│           │   └── CaseController.cls-meta.xml
│           ├── lwc/
│           │   ├── caseCreator/
│           │   ├── caseDetail/
│           │   └── caseList/
│           ├── objects/
│           │   └── Account/
│           │       └── fields/
│           │           └── External_User_Id__c.field-meta.xml
│           └── permissionsets/
│               └── Case_Management_LWC_Access.permissionset-meta.xml
├── scripts/
├── sfdx-project.json
└── README.md
```

---

## Phase 3: Salesforce Components

### 3.1 Custom Field: External User ID

This field links Salesforce Accounts to external SaaS users.

**File:** `force-app/main/default/objects/Account/fields/External_User_Id__c.field-meta.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<CustomField xmlns="http://soap.sforce.com/2006/04/metadata">
    <fullName>External_User_Id__c</fullName>
    <label>External User Id</label>
    <type>Text</type>
    <length>100</length>
    <required>false</required>
    <unique>true</unique>
    <externalId>true</externalId>
    <description>Unique identifier from external SaaS application</description>
</CustomField>
```

### 3.2 Apex Controller

**File:** `force-app/main/default/classes/CaseController.cls`

```apex
/**
 * @description Controller for Case Management LWC components
 * Handles case CRUD operations and account lookups for external app integration
 */
public with sharing class CaseController {
    
    /**
     * @description Get accounts associated with an external user ID
     * @param externalUserId The unique ID from the external SaaS application
     * @return List of matching accounts
     */
    @AuraEnabled(cacheable=true)
    public static List<AccountWrapper> getAccountsByExternalUserId(String externalUserId) {
        if (String.isBlank(externalUserId)) {
            throw new AuraHandledException('External User ID is required');
        }
        
        List<AccountWrapper> results = new List<AccountWrapper>();
        
        List<Account> accounts = [
            SELECT Id, Name, AccountNumber, Industry
            FROM Account
            WHERE External_User_Id__c = :externalUserId
            WITH SECURITY_ENFORCED
            ORDER BY Name
            LIMIT 100
        ];
        
        for (Account acc : accounts) {
            results.add(new AccountWrapper(acc));
        }
        
        return results;
    }
    
    /**
     * @description Get picklist values for Case Type field
     * @return List of picklist options
     */
    @AuraEnabled(cacheable=true)
    public static List<PicklistOption> getCaseTypeOptions() {
        List<PicklistOption> options = new List<PicklistOption>();
        Schema.DescribeFieldResult fieldResult = Case.Type.getDescribe();
        
        for (Schema.PicklistEntry entry : fieldResult.getPicklistValues()) {
            if (entry.isActive()) {
                options.add(new PicklistOption(entry.getLabel(), entry.getValue()));
            }
        }
        
        return options;
    }
    
    /**
     * @description Get dependent picklist values for Case SubType based on Type
     * @param caseType The selected Case Type value
     * @return List of SubType picklist options valid for the given Type
     */
    @AuraEnabled(cacheable=true)
    public static List<PicklistOption> getSubTypeOptions(String caseType) {
        List<PicklistOption> options = new List<PicklistOption>();
        
        if (String.isBlank(caseType)) {
            return options;
        }
        
        // Note: Implement dependent picklist logic based on your org's configuration
        // This is a simplified version - see full implementation for production
        
        return options;
    }
    
    /**
     * @description Create a new Case record
     */
    @AuraEnabled
    public static String createCase(
        String accountId, 
        String caseType, 
        String subType, 
        String description,
        String externalUserId
    ) {
        if (String.isBlank(accountId)) {
            throw new AuraHandledException('Account is required');
        }
        if (String.isBlank(caseType)) {
            throw new AuraHandledException('Type is required');
        }
        if (String.isBlank(description)) {
            throw new AuraHandledException('Description is required');
        }
        
        try {
            Case newCase = new Case();
            newCase.AccountId = accountId;
            newCase.Type = caseType;
            newCase.Origin = 'Web';
            newCase.Description = description;
            newCase.Subject = caseType + ' - ' + (subType != null ? subType : 'General');
            
            insert newCase;
            
            return newCase.Id;
        } catch (DmlException e) {
            throw new AuraHandledException('Error creating case: ' + e.getMessage());
        }
    }
    
    /**
     * @description Get case details by ID
     */
    @AuraEnabled(cacheable=true)
    public static CaseWrapper getCaseById(String caseId) {
        if (String.isBlank(caseId)) {
            throw new AuraHandledException('Case ID is required');
        }
        
        List<Case> cases = [
            SELECT Id, CaseNumber, Subject, Type, Status, Priority,
                   Description, CreatedDate, LastModifiedDate,
                   Account.Name, Contact.Name
            FROM Case
            WHERE Id = :caseId
            WITH SECURITY_ENFORCED
            LIMIT 1
        ];
        
        if (cases.isEmpty()) {
            throw new AuraHandledException('Case not found');
        }
        
        return new CaseWrapper(cases[0]);
    }
    
    /**
     * @description Get cases for an external user
     */
    @AuraEnabled(cacheable=true)
    public static List<CaseWrapper> getCasesByExternalUserId(String externalUserId) {
        if (String.isBlank(externalUserId)) {
            throw new AuraHandledException('External User ID is required');
        }
        
        List<CaseWrapper> results = new List<CaseWrapper>();
        
        List<Account> accounts = [
            SELECT Id 
            FROM Account 
            WHERE External_User_Id__c = :externalUserId
            WITH SECURITY_ENFORCED
        ];
        
        if (accounts.isEmpty()) {
            return results;
        }
        
        Set<Id> accountIds = new Set<Id>();
        for (Account acc : accounts) {
            accountIds.add(acc.Id);
        }
        
        List<Case> cases = [
            SELECT Id, CaseNumber, Subject, Type, Status, CreatedDate,
                   Account.Name
            FROM Case
            WHERE AccountId IN :accountIds
            WITH SECURITY_ENFORCED
            ORDER BY CreatedDate DESC
            LIMIT 200
        ];
        
        for (Case c : cases) {
            results.add(new CaseWrapper(c));
        }
        
        return results;
    }
    
    // ============ Wrapper Classes ============
    
    public class AccountWrapper {
        @AuraEnabled public String id { get; set; }
        @AuraEnabled public String name { get; set; }
        @AuraEnabled public String accountNumber { get; set; }
        @AuraEnabled public String industry { get; set; }
        
        public AccountWrapper(Account acc) {
            this.id = acc.Id;
            this.name = acc.Name;
            this.accountNumber = acc.AccountNumber;
            this.industry = acc.Industry;
        }
    }
    
    public class CaseWrapper {
        @AuraEnabled public String id { get; set; }
        @AuraEnabled public String caseNumber { get; set; }
        @AuraEnabled public String subject { get; set; }
        @AuraEnabled public String type { get; set; }
        @AuraEnabled public String status { get; set; }
        @AuraEnabled public String priority { get; set; }
        @AuraEnabled public String description { get; set; }
        @AuraEnabled public Datetime createdDate { get; set; }
        @AuraEnabled public String accountName { get; set; }
        @AuraEnabled public String contactName { get; set; }
        
        public CaseWrapper(Case c) {
            this.id = c.Id;
            this.caseNumber = c.CaseNumber;
            this.subject = c.Subject;
            this.type = c.Type;
            this.status = c.Status;
            this.priority = c.Priority;
            this.description = c.Description;
            this.createdDate = c.CreatedDate;
            this.accountName = c.Account?.Name;
            this.contactName = c.Contact?.Name;
        }
    }
    
    public class PicklistOption {
        @AuraEnabled public String label { get; set; }
        @AuraEnabled public String value { get; set; }
        
        public PicklistOption(String label, String value) {
            this.label = label;
            this.value = value;
        }
    }
}
```

**File:** `force-app/main/default/classes/CaseController.cls-meta.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<ApexClass xmlns="http://soap.sforce.com/2006/04/metadata">
    <apiVersion>59.0</apiVersion>
    <status>Active</status>
</ApexClass>
```

### 3.3 Case Creator LWC

**File:** `force-app/main/default/lwc/caseCreator/caseCreator.html`

```html
<template>
    <lightning-card title="Create New Case" icon-name="standard:case">
        <div class="slds-p-around_medium">
            <!-- Loading Spinner -->
            <template lwc:if={isLoading}>
                <lightning-spinner alternative-text="Loading..." size="medium"></lightning-spinner>
            </template>

            <!-- Error Message -->
            <template lwc:if={error}>
                <div class="slds-notify slds-notify_alert slds-alert_error slds-m-bottom_medium" role="alert">
                    <lightning-icon icon-name="utility:error" alternative-text="Error" size="small"></lightning-icon>
                    <h2>{error}</h2>
                </div>
            </template>

            <!-- Success Message -->
            <template lwc:if={showSuccess}>
                <div class="slds-notify slds-notify_alert slds-alert_success slds-m-bottom_medium" role="alert">
                    <lightning-icon icon-name="utility:success" alternative-text="Success" size="small"></lightning-icon>
                    <h2>Case created successfully! Redirecting...</h2>
                </div>
            </template>

            <template lwc:if={!isLoading}>
                <div class="slds-form">
                    <!-- Account Selection -->
                    <div class="slds-form-element slds-m-bottom_medium">
                        <lightning-combobox
                            name="account"
                            label="Select Account"
                            value={selectedAccountId}
                            placeholder="Choose an account..."
                            options={accountOptions}
                            onchange={handleAccountChange}
                            required>
                        </lightning-combobox>
                    </div>

                    <!-- Type Selection -->
                    <div class="slds-form-element slds-m-bottom_medium">
                        <lightning-combobox
                            name="type"
                            label="Type"
                            value={selectedType}
                            placeholder="Choose a type..."
                            options={typeOptions}
                            onchange={handleTypeChange}
                            required>
                        </lightning-combobox>
                    </div>

                    <!-- Sub Type Selection -->
                    <div class="slds-form-element slds-m-bottom_medium">
                        <lightning-combobox
                            name="subType"
                            label="Sub Type"
                            value={selectedSubType}
                            placeholder={subTypePlaceholder}
                            options={subTypeOptions}
                            onchange={handleSubTypeChange}
                            disabled={isSubTypeDisabled}>
                        </lightning-combobox>
                    </div>

                    <!-- Description -->
                    <div class="slds-form-element slds-m-bottom_medium">
                        <lightning-textarea
                            name="description"
                            label="Description"
                            value={description}
                            placeholder="Describe your issue..."
                            max-length="32000"
                            onchange={handleDescriptionChange}
                            required>
                        </lightning-textarea>
                    </div>

                    <!-- Submit Button -->
                    <div class="slds-form-element">
                        <lightning-button
                            variant="brand"
                            label="Submit Case"
                            onclick={handleSubmit}
                            disabled={isSubmitDisabled}>
                        </lightning-button>
                    </div>
                </div>
            </template>
        </div>
    </lightning-card>
</template>
```

**File:** `force-app/main/default/lwc/caseCreator/caseCreator.js`

```javascript
import { LightningElement, api, track } from 'lwc';
import getAccountsByExternalUserId from '@salesforce/apex/CaseController.getAccountsByExternalUserId';
import getCaseTypeOptions from '@salesforce/apex/CaseController.getCaseTypeOptions';
import getSubTypeOptions from '@salesforce/apex/CaseController.getSubTypeOptions';
import createCase from '@salesforce/apex/CaseController.createCase';

export default class CaseCreator extends LightningElement {
    @api externalUserId;
    
    @track accountOptions = [];
    @track typeOptions = [];
    @track subTypeOptions = [];
    @track selectedAccountId = '';
    @track selectedType = '';
    @track selectedSubType = '';
    @track description = '';
    @track isLoading = true;
    @track error = '';
    @track showSuccess = false;
    
    connectedCallback() {
        this.loadInitialData();
    }
    
    async loadInitialData() {
        this.isLoading = true;
        this.error = '';
        
        try {
            const [accounts, types] = await Promise.all([
                getAccountsByExternalUserId({ externalUserId: this.externalUserId }),
                getCaseTypeOptions()
            ]);
            
            this.accountOptions = accounts.map(acc => ({
                label: acc.name + (acc.accountNumber ? ` (${acc.accountNumber})` : ''),
                value: acc.id
            }));
            
            this.typeOptions = types.map(type => ({
                label: type.label,
                value: type.value
            }));
            
            if (this.accountOptions.length === 0) {
                this.error = 'No accounts found for your user. Please contact support.';
            }
        } catch (err) {
            this.error = this.extractErrorMessage(err);
        } finally {
            this.isLoading = false;
        }
    }
    
    handleAccountChange(event) {
        this.selectedAccountId = event.detail.value;
    }
    
    async handleTypeChange(event) {
        this.selectedType = event.detail.value;
        this.selectedSubType = '';
        this.subTypeOptions = [];
        
        if (this.selectedType) {
            try {
                const subTypes = await getSubTypeOptions({ caseType: this.selectedType });
                this.subTypeOptions = subTypes.map(st => ({
                    label: st.label,
                    value: st.value
                }));
            } catch (err) {
                console.error('Error loading sub types:', err);
            }
        }
    }
    
    handleSubTypeChange(event) {
        this.selectedSubType = event.detail.value;
    }
    
    handleDescriptionChange(event) {
        this.description = event.detail.value;
    }
    
    get isSubTypeDisabled() {
        return !this.selectedType || this.subTypeOptions.length === 0;
    }
    
    get subTypePlaceholder() {
        if (!this.selectedType) return 'Select a type first...';
        if (this.subTypeOptions.length === 0) return 'No sub types available';
        return 'Choose a sub type...';
    }
    
    get isSubmitDisabled() {
        return !this.selectedAccountId || 
               !this.selectedType || 
               !this.description || 
               this.isLoading ||
               this.showSuccess;
    }
    
    async handleSubmit() {
        this.isLoading = true;
        this.error = '';
        
        try {
            const caseId = await createCase({
                accountId: this.selectedAccountId,
                caseType: this.selectedType,
                subType: this.selectedSubType,
                description: this.description,
                externalUserId: this.externalUserId
            });
            
            this.showSuccess = true;
            
            // Fire event for external app to handle navigation
            this.dispatchEvent(new CustomEvent('casecreated', {
                detail: { caseId, success: true },
                bubbles: true,
                composed: true
            }));
            
        } catch (err) {
            this.error = this.extractErrorMessage(err);
        } finally {
            this.isLoading = false;
        }
    }
    
    extractErrorMessage(err) {
        if (typeof err === 'string') return err;
        if (err.body?.message) return err.body.message;
        if (err.message) return err.message;
        return 'An unexpected error occurred.';
    }
}
```

**File:** `force-app/main/default/lwc/caseCreator/caseCreator.js-meta.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<LightningComponentBundle xmlns="http://soap.sforce.com/2006/04/metadata">
    <apiVersion>59.0</apiVersion>
    <isExposed>true</isExposed>
    <masterLabel>Case Creator</masterLabel>
    <description>LWC for creating cases from external applications</description>
    <targets>
        <target>lightning__AppPage</target>
        <target>lightning__HomePage</target>
        <target>lightningCommunity__Page</target>
        <target>lightningCommunity__Default</target>
    </targets>
</LightningComponentBundle>
```

### 3.4 Case Detail LWC

**File:** `force-app/main/default/lwc/caseDetail/caseDetail.html`

```html
<template>
    <lightning-card icon-name="standard:case">
        <h2 slot="title">
            <template lwc:if={caseData}>Case {caseData.caseNumber}</template>
            <template lwc:else>Case Details</template>
        </h2>

        <div class="slds-p-around_medium">
            <template lwc:if={isLoading}>
                <lightning-spinner alternative-text="Loading..." size="medium"></lightning-spinner>
            </template>

            <template lwc:if={error}>
                <div class="slds-text-align_center slds-p-around_medium">
                    <lightning-icon icon-name="utility:error" size="large"></lightning-icon>
                    <p class="slds-text-color_error slds-m-top_small">{error}</p>
                    <lightning-button label="Go to My Cases" onclick={handleBackToCases} 
                                      class="slds-m-top_medium"></lightning-button>
                </div>
            </template>

            <template lwc:if={caseData}>
                <div class="slds-grid slds-wrap">
                    <div class="slds-col slds-size_1-of-1 slds-medium-size_1-of-2 slds-p-right_medium">
                        <dl class="slds-list_horizontal slds-wrap">
                            <dt class="slds-item_label">Case Number</dt>
                            <dd class="slds-item_detail">{caseData.caseNumber}</dd>
                            
                            <dt class="slds-item_label">Subject</dt>
                            <dd class="slds-item_detail">{caseData.subject}</dd>
                            
                            <dt class="slds-item_label">Type</dt>
                            <dd class="slds-item_detail">{caseData.type}</dd>
                            
                            <dt class="slds-item_label">Status</dt>
                            <dd class="slds-item_detail">
                                <lightning-badge label={caseData.status}></lightning-badge>
                            </dd>
                        </dl>
                    </div>

                    <div class="slds-col slds-size_1-of-1 slds-medium-size_1-of-2">
                        <dl class="slds-list_horizontal slds-wrap">
                            <dt class="slds-item_label">Priority</dt>
                            <dd class="slds-item_detail">{caseData.priority}</dd>
                            
                            <dt class="slds-item_label">Account</dt>
                            <dd class="slds-item_detail">{caseData.accountName}</dd>
                            
                            <dt class="slds-item_label">Created</dt>
                            <dd class="slds-item_detail">{formattedCreatedDate}</dd>
                        </dl>
                    </div>

                    <div class="slds-col slds-size_1-of-1 slds-m-top_medium">
                        <h3 class="slds-text-heading_small slds-m-bottom_x-small">Description</h3>
                        <div class="slds-box slds-theme_shade">
                            <p>{caseData.description}</p>
                        </div>
                    </div>
                </div>

                <div class="slds-m-top_large slds-border_top slds-p-top_medium">
                    <lightning-button label="Back to My Cases" onclick={handleBackToCases}></lightning-button>
                    <lightning-button label="Create New Case" onclick={handleCreateNew} 
                                      variant="brand" class="slds-m-left_small"></lightning-button>
                </div>
            </template>
        </div>
    </lightning-card>
</template>
```

**File:** `force-app/main/default/lwc/caseDetail/caseDetail.js`

```javascript
import { LightningElement, api, track } from 'lwc';
import getCaseById from '@salesforce/apex/CaseController.getCaseById';

export default class CaseDetail extends LightningElement {
    @api caseId;
    @api externalUserId;
    
    @track caseData = null;
    @track isLoading = true;
    @track error = '';
    
    connectedCallback() {
        if (this.caseId) {
            this.loadCaseDetails();
        } else {
            this.error = 'No case ID provided';
            this.isLoading = false;
        }
    }
    
    async loadCaseDetails() {
        this.isLoading = true;
        this.error = '';
        
        try {
            this.caseData = await getCaseById({ caseId: this.caseId });
        } catch (err) {
            this.error = err.body?.message || 'Failed to load case';
        } finally {
            this.isLoading = false;
        }
    }
    
    get formattedCreatedDate() {
        if (!this.caseData?.createdDate) return '';
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        }).format(new Date(this.caseData.createdDate));
    }
    
    handleBackToCases() {
        this.dispatchEvent(new CustomEvent('navigate', {
            detail: { destination: 'my-cases' },
            bubbles: true,
            composed: true
        }));
    }
    
    handleCreateNew() {
        this.dispatchEvent(new CustomEvent('navigate', {
            detail: { destination: 'create-case' },
            bubbles: true,
            composed: true
        }));
    }
}
```

**File:** `force-app/main/default/lwc/caseDetail/caseDetail.js-meta.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<LightningComponentBundle xmlns="http://soap.sforce.com/2006/04/metadata">
    <apiVersion>59.0</apiVersion>
    <isExposed>true</isExposed>
    <masterLabel>Case Detail</masterLabel>
    <targets>
        <target>lightning__AppPage</target>
        <target>lightningCommunity__Page</target>
    </targets>
</LightningComponentBundle>
```

### 3.5 Case List LWC

**File:** `force-app/main/default/lwc/caseList/caseList.html`

```html
<template>
    <lightning-card title="My Cases" icon-name="standard:case">
        <div slot="actions">
            <lightning-button label="Create New Case" onclick={handleCreateNew} variant="brand"></lightning-button>
        </div>

        <div class="slds-p-around_medium">
            <template lwc:if={isLoading}>
                <lightning-spinner alternative-text="Loading..." size="medium"></lightning-spinner>
            </template>

            <template lwc:if={error}>
                <div class="slds-notify slds-notify_alert slds-alert_error" role="alert">
                    <lightning-icon icon-name="utility:error" size="small"></lightning-icon>
                    <h2>{error}</h2>
                </div>
            </template>

            <template lwc:if={showEmptyState}>
                <div class="slds-p-vertical_xx-large slds-text-align_center">
                    <lightning-icon icon-name="standard:empty_state" size="large"></lightning-icon>
                    <h3 class="slds-text-heading_medium slds-m-top_small">No Cases Found</h3>
                    <p class="slds-text-color_weak">You haven't submitted any cases yet.</p>
                    <lightning-button label="Create Your First Case" onclick={handleCreateNew}
                                      variant="brand" class="slds-m-top_medium"></lightning-button>
                </div>
            </template>

            <template lwc:if={hasData}>
                <lightning-datatable
                    key-field="id"
                    data={cases}
                    columns={columns}
                    hide-checkbox-column
                    onrowaction={handleRowAction}>
                </lightning-datatable>
            </template>
        </div>
    </lightning-card>
</template>
```

**File:** `force-app/main/default/lwc/caseList/caseList.js`

```javascript
import { LightningElement, api, track } from 'lwc';
import getCasesByExternalUserId from '@salesforce/apex/CaseController.getCasesByExternalUserId';

const COLUMNS = [
    {
        label: 'Case Number',
        fieldName: 'caseNumber',
        type: 'button',
        typeAttributes: { label: { fieldName: 'caseNumber' }, name: 'view', variant: 'base' }
    },
    {
        label: 'Subject',
        fieldName: 'subject',
        type: 'button',
        typeAttributes: { label: { fieldName: 'subject' }, name: 'view', variant: 'base' }
    },
    { label: 'Type', fieldName: 'type' },
    { label: 'Status', fieldName: 'status' },
    {
        label: 'Created Date',
        fieldName: 'createdDate',
        type: 'date',
        typeAttributes: { year: 'numeric', month: 'short', day: '2-digit' }
    }
];

export default class CaseList extends LightningElement {
    @api externalUserId;
    
    @track cases = [];
    @track isLoading = true;
    @track error = '';
    
    columns = COLUMNS;
    
    connectedCallback() {
        this.loadCases();
    }
    
    async loadCases() {
        this.isLoading = true;
        this.error = '';
        
        try {
            this.cases = await getCasesByExternalUserId({ 
                externalUserId: this.externalUserId 
            });
        } catch (err) {
            this.error = err.body?.message || 'Failed to load cases';
        } finally {
            this.isLoading = false;
        }
    }
    
    get hasData() {
        return !this.isLoading && !this.error && this.cases.length > 0;
    }
    
    get showEmptyState() {
        return !this.isLoading && !this.error && this.cases.length === 0;
    }
    
    handleRowAction(event) {
        if (event.detail.action.name === 'view') {
            this.dispatchEvent(new CustomEvent('caseselected', {
                detail: { caseId: event.detail.row.id },
                bubbles: true,
                composed: true
            }));
        }
    }
    
    handleCreateNew() {
        this.dispatchEvent(new CustomEvent('navigate', {
            detail: { destination: 'create-case' },
            bubbles: true,
            composed: true
        }));
    }
    
    @api
    refresh() {
        this.loadCases();
    }
}
```

**File:** `force-app/main/default/lwc/caseList/caseList.js-meta.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<LightningComponentBundle xmlns="http://soap.sforce.com/2006/04/metadata">
    <apiVersion>59.0</apiVersion>
    <isExposed>true</isExposed>
    <masterLabel>Case List</masterLabel>
    <targets>
        <target>lightning__AppPage</target>
        <target>lightningCommunity__Page</target>
    </targets>
</LightningComponentBundle>
```

### 3.6 Lightning Out Aura Application

**File:** `force-app/main/default/aura/CaseManagementOutApp/CaseManagementOutApp.app`

```xml
<aura:application access="GLOBAL" extends="ltng:outApp">
    <aura:dependency resource="c:caseCreator"/>
    <aura:dependency resource="c:caseDetail"/>
    <aura:dependency resource="c:caseList"/>
    <aura:dependency resource="lightning:button"/>
    <aura:dependency resource="lightning:card"/>
    <aura:dependency resource="lightning:combobox"/>
    <aura:dependency resource="lightning:datatable"/>
    <aura:dependency resource="lightning:spinner"/>
</aura:application>
```

**File:** `force-app/main/default/aura/CaseManagementOutApp/CaseManagementOutApp.app-meta.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<AuraDefinitionBundle xmlns="http://soap.sforce.com/2006/04/metadata">
    <apiVersion>59.0</apiVersion>
    <description>Lightning Out Application for Case Management</description>
</AuraDefinitionBundle>
```

### 3.7 Permission Set

**File:** `force-app/main/default/permissionsets/Case_Management_LWC_Access.permissionset-meta.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<PermissionSet xmlns="http://soap.sforce.com/2006/04/metadata">
    <label>Case Management LWC Access</label>
    <description>Permissions for Case Management LWC integration</description>
    <hasActivationRequired>false</hasActivationRequired>
    <license>Salesforce</license>
    
    <classAccesses>
        <apexClass>CaseController</apexClass>
        <enabled>true</enabled>
    </classAccesses>
    
    <objectPermissions>
        <object>Case</object>
        <allowCreate>true</allowCreate>
        <allowDelete>false</allowDelete>
        <allowEdit>true</allowEdit>
        <allowRead>true</allowRead>
        <modifyAllRecords>false</modifyAllRecords>
        <viewAllRecords>false</viewAllRecords>
    </objectPermissions>
    
    <objectPermissions>
        <object>Account</object>
        <allowCreate>false</allowCreate>
        <allowDelete>false</allowDelete>
        <allowEdit>false</allowEdit>
        <allowRead>true</allowRead>
        <modifyAllRecords>false</modifyAllRecords>
        <viewAllRecords>false</viewAllRecords>
    </objectPermissions>
    
    <fieldPermissions>
        <field>Account.External_User_Id__c</field>
        <editable>false</editable>
        <readable>true</readable>
    </fieldPermissions>
</PermissionSet>
```

### 3.8 Deploy to Salesforce

```bash
# Deploy all metadata
sf project deploy start --target-org dev-org

# Assign permission set to integration user
sf org assign permset --name Case_Management_LWC_Access --target-org dev-org
```

---

## Phase 4: Next.js Application

### 4.1 Create Project

```bash
# Create Next.js project
npx create-next-app@latest case-management-app --typescript --tailwind --eslint --app --src-dir

cd case-management-app

# Initialize shadcn/ui
npx shadcn-ui@latest init

# Add components
npx shadcn-ui@latest add card button alert skeleton
```

### 4.2 Environment Variables

**File:** `.env.local`

```bash
# Salesforce Connected App
SALESFORCE_CLIENT_ID=your_consumer_key
SALESFORCE_CLIENT_SECRET=your_consumer_secret
SALESFORCE_USERNAME=integration@yourcompany.salesforce.com
SALESFORCE_INSTANCE_URL=https://your-domain.my.salesforce.com

# External User ID (for POC)
NEXT_PUBLIC_EXTERNAL_USER_ID=demo-user-001
```

### 4.3 Salesforce Auth Utility

**File:** `src/lib/salesforce-auth.ts`

```typescript
interface CachedToken {
  accessToken: string;
  instanceUrl: string;
  expiresAt: number;
}

let tokenCache: CachedToken | null = null;

export async function getSalesforceAccessToken(): Promise<{
  accessToken: string;
  instanceUrl: string;
}> {
  // Return cached token if still valid
  if (tokenCache && tokenCache.expiresAt > Date.now() + 5 * 60 * 1000) {
    return {
      accessToken: tokenCache.accessToken,
      instanceUrl: tokenCache.instanceUrl,
    };
  }

  const { SALESFORCE_CLIENT_ID, SALESFORCE_CLIENT_SECRET, SALESFORCE_INSTANCE_URL } = process.env;

  if (!SALESFORCE_CLIENT_ID || !SALESFORCE_CLIENT_SECRET || !SALESFORCE_INSTANCE_URL) {
    throw new Error('Missing Salesforce configuration');
  }

  const response = await fetch(`${SALESFORCE_INSTANCE_URL}/services/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: SALESFORCE_CLIENT_ID,
      client_secret: SALESFORCE_CLIENT_SECRET,
    }),
  });

  if (!response.ok) {
    throw new Error(`Salesforce auth failed: ${response.status}`);
  }

  const data = await response.json();
  
  tokenCache = {
    accessToken: data.access_token,
    instanceUrl: data.instance_url,
    expiresAt: Date.now() + 2 * 60 * 60 * 1000,
  };

  return { accessToken: data.access_token, instanceUrl: data.instance_url };
}
```

### 4.4 API Route

**File:** `src/app/api/salesforce/token/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { getSalesforceAccessToken } from '@/lib/salesforce-auth';

export async function GET() {
  try {
    const { accessToken, instanceUrl } = await getSalesforceAccessToken();
    
    return NextResponse.json({
      accessToken,
      instanceUrl,
      lightningOutUrl: `${instanceUrl}/c/CaseManagementOutApp.app`,
    });
  } catch (error) {
    console.error('Salesforce auth error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
```

### 4.5 Lightning Container Component

**File:** `src/components/lightning-container.tsx`

```typescript
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface LightningContainerProps {
  component: 'c:caseCreator' | 'c:caseDetail' | 'c:caseList';
  attributes?: Record<string, unknown>;
}

declare global {
  interface Window {
    $Lightning: {
      use: (app: string, callback: () => void, endpoint: string, token: string) => void;
      createComponent: (
        name: string,
        attrs: Record<string, unknown>,
        el: HTMLElement,
        cb: (cmp: unknown, status: string, error: string) => void
      ) => void;
    };
  }
}

export function LightningContainer({ component, attributes = {} }: LightningContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleEvent = useCallback((event: CustomEvent) => {
    const { type, detail } = event;
    
    if (type === 'casecreated' && detail?.caseId) {
      router.push(`/case-detail?caseId=${detail.caseId}`);
    } else if (type === 'caseselected' && detail?.caseId) {
      router.push(`/case-detail?caseId=${detail.caseId}`);
    } else if (type === 'navigate') {
      router.push(`/${detail.destination}`);
    }
  }, [router]);

  useEffect(() => {
    let script: HTMLScriptElement | null = null;

    async function init() {
      try {
        const res = await fetch('/api/salesforce/token');
        if (!res.ok) throw new Error('Failed to get token');
        
        const { accessToken, instanceUrl } = await res.json();

        script = document.createElement('script');
        script.src = `${instanceUrl}/lightning/lightning.out.js`;
        
        script.onload = () => {
          window.$Lightning.use(
            'c:CaseManagementOutApp',
            () => {
              window.$Lightning.createComponent(
                component,
                { ...attributes, externalUserId: process.env.NEXT_PUBLIC_EXTERNAL_USER_ID },
                containerRef.current!,
                (_, status, errorMsg) => {
                  if (status === 'SUCCESS') setLoading(false);
                  else setError(errorMsg || 'Component failed');
                }
              );
            },
            instanceUrl,
            accessToken
          );
        };

        document.body.appendChild(script);

        // Listen for LWC events
        const events = ['casecreated', 'caseselected', 'navigate'];
        events.forEach(e => containerRef.current?.addEventListener(e, handleEvent as EventListener));

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize');
        setLoading(false);
      }
    }

    init();

    return () => {
      if (script?.parentNode) script.parentNode.removeChild(script);
    };
  }, [component, attributes, handleEvent]);

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div>
      {loading && (
        <div className="space-y-4 p-6">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      )}
      <div ref={containerRef} className={loading ? 'hidden' : ''} style={{ minHeight: 400 }} />
    </div>
  );
}
```

### 4.6 Navigation Header

**File:** `src/components/nav-header.tsx`

```typescript
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/create-case', label: 'Create Case' },
  { href: '/my-cases', label: 'My Cases' },
];

export function NavHeader() {
  const pathname = usePathname();

  return (
    <header className="border-b bg-white">
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-bold">Case Management</Link>
          <ul className="flex space-x-6">
            {navItems.map(item => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'text-sm font-medium hover:text-primary',
                    pathname === item.href ? 'text-primary' : 'text-muted-foreground'
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
```

### 4.7 Layout & Pages

**File:** `src/app/layout.tsx`

```typescript
import { Inter } from 'next/font/google';
import { NavHeader } from '@/components/nav-header';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          <NavHeader />
          <main className="container mx-auto px-4 py-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
```

**File:** `src/app/page.tsx`

```typescript
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function HomePage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Welcome to Case Management</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Create a Case</CardTitle>
            <CardDescription>Submit a new support request</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/create-case"><Button className="w-full">Get Started</Button></Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>My Cases</CardTitle>
            <CardDescription>View your submitted cases</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/my-cases"><Button variant="outline" className="w-full">View Cases</Button></Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

**File:** `src/app/create-case/page.tsx`

```typescript
import { LightningContainer } from '@/components/lightning-container';

export default function CreateCasePage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Create a New Case</h1>
      <LightningContainer component="c:caseCreator" />
    </div>
  );
}
```

**File:** `src/app/case-detail/page.tsx`

```typescript
'use client';

import { useSearchParams } from 'next/navigation';
import { LightningContainer } from '@/components/lightning-container';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function CaseDetailPage() {
  const caseId = useSearchParams().get('caseId');

  if (!caseId) {
    return (
      <Alert variant="destructive">
        <AlertDescription>No case ID provided.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <LightningContainer component="c:caseDetail" attributes={{ caseId }} />
    </div>
  );
}
```

**File:** `src/app/my-cases/page.tsx`

```typescript
import { LightningContainer } from '@/components/lightning-container';

export default function MyCasesPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">My Cases</h1>
      <LightningContainer component="c:caseList" />
    </div>
  );
}
```

---

## Phase 5: CORS & Security Configuration

### 5.1 Add CORS Allowed Origin

1. **Setup → CORS** (search "CORS")
2. Click **New**
3. **Origin URL Pattern**: `http://localhost:3000`
4. For production, add your domain (e.g., `https://app.yourcompany.com`)

### 5.2 CSP Trusted Sites (if needed)

1. **Setup → CSP Trusted Sites**
2. Add your Next.js domain
3. Enable for **Connect sources** and **Script sources**

---

## Phase 6: Testing

### 6.1 Create Test Data

```bash
# Create test accounts linked to demo user
sf data create record --sobject Account \
  --values "Name='Test Company A' External_User_Id__c='demo-user-001'" \
  --target-org dev-org

sf data create record --sobject Account \
  --values "Name='Test Company B' External_User_Id__c='demo-user-001'" \
  --target-org dev-org
```

### 6.2 Start Application

```bash
cd case-management-app
npm run dev
```

### 6.3 Test Checklist

- [ ] Navigate to `http://localhost:3000`
- [ ] Click "Create Case" → LWC loads with accounts
- [ ] Select account, type, description → Submit
- [ ] Verify redirect to `/case-detail?caseId=xxx`
- [ ] Case details display correctly
- [ ] Navigate to "My Cases" → Case appears in table
- [ ] Click case number → Navigate to detail

---

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| "Lightning Out not loading" | Verify My Domain is deployed, check CORS settings |
| "Authentication failed" | Verify Connected App credentials, check Client Credentials flow is enabled |
| "No accounts found" | Ensure test accounts have `External_User_Id__c` matching env var |
| "Component not found" | Verify LWC deployed, check Aura app dependencies |
| "CORS error" | Add `localhost:3000` to CORS allowed origins |

### Debug Commands

```bash
# Check deployment status
sf project deploy report --target-org dev-org

# View org errors
sf apex tail log --target-org dev-org

# Query accounts
sf data query --query "SELECT Id, Name, External_User_Id__c FROM Account" --target-org dev-org
```

---

## Quick Reference

### Salesforce CLI Commands

```bash
sf org login web --alias dev-org                     # Login to org
sf project deploy start --target-org dev-org         # Deploy metadata
sf org assign permset --name Permission_Set          # Assign permission set
sf data create record --sobject Object --values ""   # Create record
sf apex tail log                                     # View logs
```

### Next.js Commands

```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run start    # Start production server
```

### Key URLs

| Resource | URL |
|----------|-----|
| Local App | `http://localhost:3000` |
| SF Setup | `https://your-domain.my.salesforce.com/lightning/setup/SetupOneHome/home` |
| Lightning Out Docs | `https://developer.salesforce.com/docs/platform/lwc/guide/lightning-out-intro.html` |

---

## Next Steps

1. **Add Authentication**: Implement real user authentication in Next.js
2. **Error Tracking**: Add error monitoring (Sentry, etc.)
3. **Production Deployment**: Configure CORS for production domain
4. **Enhanced Features**: Add case comments, file attachments, notifications
5. **Testing**: Add unit tests for Apex and LWC components

---

*Document Version: 1.0 | Last Updated: January 2026*