/**
 * @description Controller for Case Management LWC components
 * Handles case CRUD operations and account lookups for external app integration
 */
public without sharing class CaseController {

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
    @AuraEnabled
    public static List<PicklistOption> getSubTypeOptions(String caseType) {
        List<PicklistOption> options = new List<PicklistOption>();

        if (String.isBlank(caseType)) {
            return options;
        }

        // Get the controlling field (Type) picklist values
        Schema.DescribeFieldResult controllingField = Case.Type.getDescribe();
        List<Schema.PicklistEntry> controllingEntries = controllingField.getPicklistValues();

        // Build a map of controlling value to index
        Map<String, Integer> controllingValueToIndex = new Map<String, Integer>();
        Integer index = 0;
        for (Schema.PicklistEntry entry : controllingEntries) {
            controllingValueToIndex.put(entry.getValue(), index);
            index++;
        }

        // Get the index of the selected controlling value
        Integer selectedIndex = controllingValueToIndex.get(caseType);
        if (selectedIndex == null) {
            return options;
        }

        // Get the dependent field (Sub_Type__c) picklist values with validFor info
        Schema.DescribeFieldResult dependentField = Case.Sub_Type__c.getDescribe();
        List<Schema.PicklistEntry> dependentEntries = dependentField.getPicklistValues();

        // Serialize to JSON to access validFor property
        String jsonStr = JSON.serialize(dependentEntries);
        List<PicklistEntryWrapper> wrappedEntries = (List<PicklistEntryWrapper>) JSON.deserialize(
            jsonStr,
            List<PicklistEntryWrapper>.class
        );

        // Iterate through dependent values and check if they're valid for the selected controlling value
        for (PicklistEntryWrapper entry : wrappedEntries) {
            if (!entry.active) {
                continue;
            }

            // Check if this value is valid for the selected controlling value
            if (isValueValidFor(entry.validFor, selectedIndex)) {
                options.add(new PicklistOption(entry.label, entry.value));
            }
        }

        return options;
    }

    /**
     * @description Helper method to check if a dependent picklist value is valid for a controlling value index
     * @param validFor The base64 encoded validFor string from the picklist entry
     * @param controllingIndex The index of the controlling value
     * @return True if the dependent value is valid for the controlling value
     */
    private static Boolean isValueValidFor(String validFor, Integer controllingIndex) {
        if (String.isBlank(validFor)) {
            return true;
        }

        // Decode the base64 validFor string to get the bitfield
        Blob validForBlob = EncodingUtil.base64Decode(validFor);

        // Convert blob to hex string to process each byte
        String hexString = EncodingUtil.convertToHex(validForBlob);

        // Calculate which byte and bit to check
        Integer byteIndex = controllingIndex / 8;
        Integer bitIndex = 7 - Math.mod(controllingIndex, 8);

        // Each byte is represented by 2 hex characters
        if ((byteIndex * 2 + 2) > hexString.length()) {
            return false;
        }

        // Extract the byte value from hex
        String hexByte = hexString.substring(byteIndex * 2, byteIndex * 2 + 2);
        Integer byteValue = hexToInteger(hexByte);

        // Check if the bit at the controlling index position is set
        return ((byteValue >> bitIndex) & 1) == 1;
    }

    /**
     * @description Convert a hex string to an integer
     * @param hexStr The hex string (2 characters)
     * @return The integer value
     */
    private static Integer hexToInteger(String hexStr) {
        String hexChars = '0123456789ABCDEF';
        hexStr = hexStr.toUpperCase();
        Integer result = 0;
        for (Integer i = 0; i < hexStr.length(); i++) {
            result = result * 16 + hexChars.indexOf(hexStr.substring(i, i + 1));
        }
        return result;
    }

    /**
     * @description Wrapper class to deserialize picklist entries with validFor
     */
    private class PicklistEntryWrapper {
        public String label;
        public String value;
        public Boolean active;
        public String validFor;
    }

    /**
     * @description Create a new Case record
     * @param accountId The Account ID to associate with the case
     * @param caseType The Case Type value
     * @param subType The Case SubType value (optional)
     * @param description The case description
     * @param externalUserId The external user ID for tracking
     * @return The created Case ID
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
            newCase.Sub_Type__c = String.isNotBlank(subType) ? subType : null;
            newCase.Origin = 'Web';
            newCase.Description = description;
            newCase.Subject = caseType + ' - ' + (String.isNotBlank(subType) ? subType : 'General');

            insert newCase;

            return newCase.Id;
        } catch (DmlException e) {
            throw new AuraHandledException('Error creating case: ' + e.getMessage());
        }
    }

    /**
     * @description Get case details by ID
     * @param caseId The Case ID to retrieve
     * @return CaseWrapper with case details
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
            LIMIT 1
        ];

        if (cases.isEmpty()) {
            throw new AuraHandledException('Case not found');
        }

        return new CaseWrapper(cases[0]);
    }

    /**
     * @description Get cases for an external user
     * @param externalUserId The external user ID
     * @return List of CaseWrapper objects
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
        ];

        if (accounts.isEmpty()) {
            return results;
        }

        Set<Id> accountIds = new Set<Id>();
        for (Account acc : accounts) {
            accountIds.add(acc.Id);
        }

        List<Case> cases = [
            SELECT Id, CaseNumber, Subject, Type, Status, Priority, Description,
                   CreatedDate, LastModifiedDate, Account.Name, Contact.Name
            FROM Case
            WHERE AccountId IN :accountIds
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
        @AuraEnabled public String caseType { get; set; }
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
            this.caseType = c.Type;
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
