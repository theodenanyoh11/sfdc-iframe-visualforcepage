<aura:application access="GLOBAL" extends="ltng:outApp" implements="ltng:allowGuestAccess">
    <!-- Dependencies for Lightning Out -->
    <aura:dependency resource="c:caseCreator" />
    <aura:dependency resource="c:caseDetail" />
    <aura:dependency resource="c:caseList" />

    <!-- Lightning Design System -->
    <aura:dependency resource="markup://force:slds" />
</aura:application>
