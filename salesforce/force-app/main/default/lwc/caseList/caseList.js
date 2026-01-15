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
    { label: 'Type', fieldName: 'caseType' },
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
        console.log('[caseList] loadCases called, externalUserId:', this.externalUserId);
        this.isLoading = true;
        this.error = '';

        try {
            const result = await getCasesByExternalUserId({
                externalUserId: this.externalUserId
            });
            console.log('[caseList] Apex returned:', result?.length, 'cases');
            this.cases = result || [];
        } catch (err) {
            console.error('[caseList] Apex error:', err);
            this.error = err.body?.message || 'Failed to load cases';
        } finally {
            this.isLoading = false;
            console.log('[caseList] Loading complete. isLoading:', this.isLoading, 'hasData:', this.hasData, 'cases:', this.cases?.length);
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
            detail: { destination: 'cases/create' },
            bubbles: true,
            composed: true
        }));
    }

    @api
    refresh() {
        this.loadCases();
    }
}
