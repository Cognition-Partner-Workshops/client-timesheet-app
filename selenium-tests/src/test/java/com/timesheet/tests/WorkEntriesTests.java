package com.timesheet.tests;

import com.timesheet.pages.ClientsPage;
import com.timesheet.pages.DashboardPage;
import com.timesheet.pages.WorkEntriesPage;
import org.testng.Assert;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

import java.util.UUID;

public class WorkEntriesTests extends BaseTest {

    private WorkEntriesPage workEntriesPage;
    private ClientsPage clientsPage;
    private DashboardPage dashboardPage;
    private String testClientName;

    @BeforeMethod
    public void setup() {
        loginAsDefaultUser();
        dashboardPage = new DashboardPage(driver);
        
        clientsPage = dashboardPage.navigateToClients();
        clientsPage.waitForPageLoad();
        
        testClientName = "WE Test Client " + UUID.randomUUID().toString().substring(0, 8);
        clientsPage.createClient(testClientName, "Test Dept", "we@test.com", "Work entry test client");
        
        workEntriesPage = dashboardPage.navigateToWorkEntries();
        workEntriesPage.waitForPageLoad();
    }

    @Test(priority = 1, description = "Verify work entries page is displayed")
    public void testWorkEntriesPageDisplayed() {
        logInfo("Verifying work entries page is displayed");
        Assert.assertTrue(workEntriesPage.isWorkEntriesPageDisplayed(), 
            "Work entries page should be displayed");
        logInfo("Work entries page displayed successfully");
    }

    @Test(priority = 2, description = "Verify Add Work Entry button opens dialog")
    public void testAddWorkEntryButtonOpensDialog() {
        logInfo("Testing Add Work Entry button");
        workEntriesPage.clickAddWorkEntryButton();
        Assert.assertTrue(workEntriesPage.isDialogOpen(), "Add Work Entry dialog should open");
        String dialogTitle = workEntriesPage.getDialogTitle();
        Assert.assertTrue(dialogTitle.contains("Add") || dialogTitle.contains("New"), 
            "Dialog title should indicate adding new entry");
        workEntriesPage.clickCancelButton();
        logInfo("Add Work Entry button works correctly");
    }

    @Test(priority = 3, description = "Verify creating a work entry with all fields")
    public void testCreateWorkEntryWithAllFields() {
        logInfo("Testing create work entry with all fields");
        String hours = "4.5";
        String description = "Test work entry description " + UUID.randomUUID().toString().substring(0, 8);
        
        int initialCount = workEntriesPage.getWorkEntryCount();
        workEntriesPage.createWorkEntry(testClientName, hours, description);
        
        Assert.assertTrue(workEntriesPage.isWorkEntryInTable(testClientName, hours), 
            "New work entry should appear in the table");
        int newCount = workEntriesPage.getWorkEntryCount();
        Assert.assertEquals(newCount, initialCount + 1, "Work entry count should increase by 1");
        logInfo("Work entry created successfully");
    }

    @Test(priority = 4, description = "Verify creating a work entry without description")
    public void testCreateWorkEntryWithoutDescription() {
        logInfo("Testing create work entry without description");
        String hours = "2.0";
        
        workEntriesPage.createWorkEntry(testClientName, hours, null);
        
        Assert.assertTrue(workEntriesPage.isWorkEntryInTable(testClientName, hours), 
            "New work entry should appear in the table");
        logInfo("Work entry created without description");
    }

    @Test(priority = 5, description = "Verify editing an existing work entry")
    public void testEditWorkEntry() {
        logInfo("Testing edit work entry functionality");
        String originalHours = "3.0";
        workEntriesPage.createWorkEntry(testClientName, originalHours, "Original description");
        
        workEntriesPage.editWorkEntry(testClientName);
        Assert.assertTrue(workEntriesPage.isDialogOpen(), "Edit dialog should open");
        
        String dialogTitle = workEntriesPage.getDialogTitle();
        Assert.assertTrue(dialogTitle.contains("Edit"), "Dialog title should indicate editing");
        
        String updatedHours = "5.5";
        workEntriesPage.updateWorkEntry(updatedHours, "Updated description");
        
        Assert.assertTrue(workEntriesPage.isWorkEntryInTable(testClientName, updatedHours), 
            "Updated hours should appear in the table");
        logInfo("Work entry updated successfully");
    }

    @Test(priority = 6, description = "Verify deleting a work entry")
    public void testDeleteWorkEntry() {
        logInfo("Testing delete work entry functionality");
        String hours = "1.5";
        workEntriesPage.createWorkEntry(testClientName, hours, "To be deleted");
        
        Assert.assertTrue(workEntriesPage.isWorkEntryInTable(testClientName, hours), 
            "Work entry should exist before deletion");
        int countBefore = workEntriesPage.getWorkEntryCount();
        
        workEntriesPage.deleteWorkEntry(testClientName);
        workEntriesPage.waitForPageLoad();
        
        int countAfter = workEntriesPage.getWorkEntryCount();
        Assert.assertEquals(countAfter, countBefore - 1, "Work entry count should decrease by 1");
        logInfo("Work entry deleted successfully");
    }

    @Test(priority = 7, description = "Verify cancel button closes dialog without saving")
    public void testCancelButtonClosesDialog() {
        logInfo("Testing cancel button functionality");
        int initialCount = workEntriesPage.getWorkEntryCount();
        
        workEntriesPage.clickAddWorkEntryButton();
        workEntriesPage.selectClient(testClientName);
        workEntriesPage.enterHours("8.0");
        workEntriesPage.clickCancelButton();
        
        Assert.assertFalse(workEntriesPage.isDialogOpen(), "Dialog should be closed");
        Assert.assertEquals(workEntriesPage.getWorkEntryCount(), initialCount, 
            "Work entry count should remain the same");
        logInfo("Cancel button works correctly");
    }

    @Test(priority = 8, description = "Verify work entry with maximum hours (24)")
    public void testWorkEntryWithMaxHours() {
        logInfo("Testing work entry with maximum hours");
        String maxHours = "24";
        
        workEntriesPage.createWorkEntry(testClientName, maxHours, "Full day work");
        
        Assert.assertTrue(workEntriesPage.isWorkEntryInTable(testClientName, maxHours), 
            "Work entry with max hours should appear in the table");
        logInfo("Work entry with max hours created successfully");
    }

    @Test(priority = 9, description = "Verify work entry with minimum hours")
    public void testWorkEntryWithMinHours() {
        logInfo("Testing work entry with minimum hours");
        String minHours = "0.5";
        
        workEntriesPage.createWorkEntry(testClientName, minHours, "Quick task");
        
        Assert.assertTrue(workEntriesPage.isWorkEntryInTable(testClientName, minHours), 
            "Work entry with min hours should appear in the table");
        logInfo("Work entry with min hours created successfully");
    }

    @Test(priority = 10, description = "Verify multiple work entries can be created")
    public void testCreateMultipleWorkEntries() {
        logInfo("Testing creating multiple work entries");
        int initialCount = workEntriesPage.getWorkEntryCount();
        
        for (int i = 1; i <= 3; i++) {
            workEntriesPage.createWorkEntry(testClientName, String.valueOf(i), "Entry " + i);
        }
        
        int finalCount = workEntriesPage.getWorkEntryCount();
        Assert.assertEquals(finalCount, initialCount + 3, "Should have 3 more work entries");
        logInfo("Multiple work entries created successfully");
    }

    @Test(priority = 11, description = "Verify work entries list shows client name")
    public void testWorkEntriesListShowsClientName() {
        logInfo("Testing work entries list shows client name");
        String hours = "6.0";
        workEntriesPage.createWorkEntry(testClientName, hours, "Test entry");
        
        Assert.assertTrue(workEntriesPage.isWorkEntryInTable(testClientName, hours), 
            "Client name should be visible in work entries list");
        logInfo("Work entries list correctly shows client name");
    }

    @Test(priority = 12, description = "Verify decimal hours are accepted")
    public void testDecimalHoursAccepted() {
        logInfo("Testing decimal hours input");
        String decimalHours = "2.75";
        
        workEntriesPage.createWorkEntry(testClientName, decimalHours, "Decimal hours test");
        
        Assert.assertTrue(workEntriesPage.isWorkEntryInTable(testClientName, decimalHours), 
            "Work entry with decimal hours should appear in the table");
        logInfo("Decimal hours accepted successfully");
    }
}
