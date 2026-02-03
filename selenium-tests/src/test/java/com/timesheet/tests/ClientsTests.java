package com.timesheet.tests;

import com.timesheet.pages.ClientsPage;
import com.timesheet.pages.DashboardPage;
import org.testng.Assert;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

import java.util.List;
import java.util.UUID;

public class ClientsTests extends BaseTest {

    private ClientsPage clientsPage;
    private DashboardPage dashboardPage;

    @BeforeMethod
    public void setup() {
        loginAsDefaultUser();
        dashboardPage = new DashboardPage(driver);
        clientsPage = dashboardPage.navigateToClients();
        clientsPage.waitForPageLoad();
    }

    @Test(priority = 1, description = "Verify clients page is displayed")
    public void testClientsPageDisplayed() {
        logInfo("Verifying clients page is displayed");
        Assert.assertTrue(clientsPage.isClientsPageDisplayed(), "Clients page should be displayed");
        logInfo("Clients page displayed successfully");
    }

    @Test(priority = 2, description = "Verify Add Client button is displayed")
    public void testAddClientButtonDisplayed() {
        logInfo("Verifying Add Client button is displayed");
        clientsPage.clickAddClientButton();
        Assert.assertTrue(clientsPage.isDialogOpen(), "Add Client dialog should open");
        String dialogTitle = clientsPage.getDialogTitle();
        Assert.assertTrue(dialogTitle.contains("Add") || dialogTitle.contains("New"), 
            "Dialog title should indicate adding new client");
        clientsPage.clickCancelButton();
        logInfo("Add Client button works correctly");
    }

    @Test(priority = 3, description = "Verify creating a new client with all fields")
    public void testCreateClientWithAllFields() {
        logInfo("Testing create client with all fields");
        String uniqueName = "Test Client " + UUID.randomUUID().toString().substring(0, 8);
        String department = "Engineering";
        String email = "client@example.com";
        String description = "Test client description";
        
        int initialCount = clientsPage.getClientCount();
        clientsPage.createClient(uniqueName, department, email, description);
        
        Assert.assertTrue(clientsPage.isClientInTable(uniqueName), 
            "New client should appear in the table");
        int newCount = clientsPage.getClientCount();
        Assert.assertEquals(newCount, initialCount + 1, "Client count should increase by 1");
        logInfo("Client created successfully: " + uniqueName);
    }

    @Test(priority = 4, description = "Verify creating a client with only required fields")
    public void testCreateClientWithRequiredFieldsOnly() {
        logInfo("Testing create client with required fields only");
        String uniqueName = "Minimal Client " + UUID.randomUUID().toString().substring(0, 8);
        
        clientsPage.createClient(uniqueName);
        
        Assert.assertTrue(clientsPage.isClientInTable(uniqueName), 
            "New client should appear in the table");
        logInfo("Client created with minimal fields: " + uniqueName);
    }

    @Test(priority = 5, description = "Verify editing an existing client")
    public void testEditClient() {
        logInfo("Testing edit client functionality");
        String originalName = "Edit Test " + UUID.randomUUID().toString().substring(0, 8);
        clientsPage.createClient(originalName);
        
        String updatedName = "Updated " + originalName;
        clientsPage.editClient(originalName);
        Assert.assertTrue(clientsPage.isDialogOpen(), "Edit dialog should open");
        
        String dialogTitle = clientsPage.getDialogTitle();
        Assert.assertTrue(dialogTitle.contains("Edit"), "Dialog title should indicate editing");
        
        clientsPage.updateClient(updatedName, "Updated Dept", null, "Updated description");
        
        Assert.assertTrue(clientsPage.isClientInTable(updatedName), 
            "Updated client name should appear in the table");
        logInfo("Client updated successfully: " + updatedName);
    }

    @Test(priority = 6, description = "Verify deleting a client")
    public void testDeleteClient() {
        logInfo("Testing delete client functionality");
        String clientName = "Delete Test " + UUID.randomUUID().toString().substring(0, 8);
        clientsPage.createClient(clientName);
        
        Assert.assertTrue(clientsPage.isClientInTable(clientName), "Client should exist before deletion");
        int countBefore = clientsPage.getClientCount();
        
        clientsPage.deleteClient(clientName);
        clientsPage.waitForPageLoad();
        
        Assert.assertFalse(clientsPage.isClientInTable(clientName), 
            "Client should not appear in the table after deletion");
        int countAfter = clientsPage.getClientCount();
        Assert.assertEquals(countAfter, countBefore - 1, "Client count should decrease by 1");
        logInfo("Client deleted successfully: " + clientName);
    }

    @Test(priority = 7, description = "Verify cancel button closes dialog without saving")
    public void testCancelButtonClosesDialog() {
        logInfo("Testing cancel button functionality");
        String clientName = "Cancel Test " + UUID.randomUUID().toString().substring(0, 8);
        int initialCount = clientsPage.getClientCount();
        
        clientsPage.clickAddClientButton();
        clientsPage.enterClientName(clientName);
        clientsPage.clickCancelButton();
        
        Assert.assertFalse(clientsPage.isDialogOpen(), "Dialog should be closed");
        Assert.assertFalse(clientsPage.isClientInTable(clientName), 
            "Client should not be created after cancel");
        Assert.assertEquals(clientsPage.getClientCount(), initialCount, 
            "Client count should remain the same");
        logInfo("Cancel button works correctly");
    }

    @Test(priority = 8, description = "Verify Clear All button functionality")
    public void testClearAllClients() {
        logInfo("Testing Clear All functionality");
        String client1 = "Clear Test 1 " + UUID.randomUUID().toString().substring(0, 8);
        String client2 = "Clear Test 2 " + UUID.randomUUID().toString().substring(0, 8);
        
        clientsPage.createClient(client1);
        clientsPage.createClient(client2);
        
        Assert.assertTrue(clientsPage.isClearAllButtonDisplayed(), 
            "Clear All button should be displayed when clients exist");
        
        clientsPage.clearAllClients();
        
        Assert.assertTrue(clientsPage.hasNoClients(), "All clients should be deleted");
        logInfo("Clear All functionality works correctly");
    }

    @Test(priority = 9, description = "Verify client list displays correct information")
    public void testClientListDisplaysCorrectInfo() {
        logInfo("Testing client list displays correct information");
        String clientName = "Info Test " + UUID.randomUUID().toString().substring(0, 8);
        String department = "Sales";
        String email = "info@test.com";
        
        clientsPage.createClient(clientName, department, email, "Test description");
        
        List<String> clientNames = clientsPage.getClientNames();
        Assert.assertTrue(clientNames.contains(clientName), 
            "Client name should be in the list");
        logInfo("Client list displays information correctly");
    }

    @Test(priority = 10, description = "Verify multiple clients can be created")
    public void testCreateMultipleClients() {
        logInfo("Testing creating multiple clients");
        int initialCount = clientsPage.getClientCount();
        
        for (int i = 1; i <= 3; i++) {
            String clientName = "Multi Client " + i + " " + UUID.randomUUID().toString().substring(0, 8);
            clientsPage.createClient(clientName);
        }
        
        int finalCount = clientsPage.getClientCount();
        Assert.assertEquals(finalCount, initialCount + 3, "Should have 3 more clients");
        logInfo("Multiple clients created successfully");
    }

    @Test(priority = 11, description = "Verify empty state message when no clients")
    public void testEmptyStateMessage() {
        logInfo("Testing empty state message");
        clientsPage.clearAllClients();
        
        Assert.assertTrue(clientsPage.hasNoClients(), "Should show no clients state");
        Assert.assertFalse(clientsPage.isClearAllButtonDisplayed(), 
            "Clear All button should not be displayed when no clients");
        logInfo("Empty state displayed correctly");
    }
}
