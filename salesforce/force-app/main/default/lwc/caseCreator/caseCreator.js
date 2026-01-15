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

    get showForm() {
        return !this.isLoading && !this.showSuccess;
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
