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
            detail: { destination: 'cases' },
            bubbles: true,
            composed: true
        }));
    }

    handleCreateNew() {
        this.dispatchEvent(new CustomEvent('navigate', {
            detail: { destination: 'cases/create' },
            bubbles: true,
            composed: true
        }));
    }
}
