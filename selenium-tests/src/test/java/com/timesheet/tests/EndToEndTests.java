package com.timesheet.tests;

import com.timesheet.pages.ClientsPage;
import com.timesheet.pages.DashboardPage;
import com.timesheet.pages.LoginPage;
import com.timesheet.pages.ReportsPage;
import com.timesheet.pages.WorkEntriesPage;
import com.timesheet.utils.ConfigReader;
import org.testng.Assert;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

import java.util.UUID;

public class EndToEndTests extends BaseTest {

    private LoginPage loginPage;
    private DashboardPage dashboardPage;
    private ClientsPage clientsPage;
    private WorkEntriesPage workEntriesPage;
    private ReportsPage reportsPage;

    @BeforeMethod
    public void setup() {
        loginPage = new LoginPage(driver);
        loginPage.navigateToLoginPage();
    }

    @Test(priority = 1, description = "Complete end-to-end workflow: Login -> Create Client -> Add Work Entry -> View Report")
    public void testCompleteWorkflow() {
        logInfo("Starting complete end-to-end workflow test");
        
        logInfo("Step 1: Login");
        dashboardPage = loginPage.login(ConfigReader.getTestUserEmail());
        Assert.assertTrue(dashboardPage.isDashboardDisplayed(), "Dashboard should be displayed after login");
        logInfo("Login successful");
        
        logInfo("Step 2: Navigate to Clients and create a new client");
        clientsPage = dashboardPage.navigateToClients();
        clientsPage.waitForPageLoad();
        
        String clientName = "E2E Client " + UUID.randomUUID().toString().substring(0, 8);
        clientsPage.createClient(clientName, "E2E Department", "e2e@test.com", "End-to-end test client");
        Assert.assertTrue(clientsPage.isClientInTable(clientName), "Client should be created");
        logInfo("Client created: " + clientName);
        
        logInfo("Step 3: Navigate to Work Entries and add entries for the client");
        workEntriesPage = dashboardPage.navigateToWorkEntries();
        workEntriesPage.waitForPageLoad();
        
        workEntriesPage.createWorkEntry(clientName, "4.0", "E2E work entry 1");
        workEntriesPage.createWorkEntry(clientName, "3.5", "E2E work entry 2");
        workEntriesPage.createWorkEntry(clientName, "2.5", "E2E work entry 3");
        
        Assert.assertTrue(workEntriesPage.isWorkEntryInTable(clientName, "4"), 
            "First work entry should be visible");
        logInfo("Work entries created successfully");
        
        logInfo("Step 4: Navigate to Reports and verify the report");
        reportsPage = dashboardPage.navigateToReports();
        reportsPage.waitForPageLoad();
        reportsPage.selectClient(clientName);
        
        String totalHours = reportsPage.getTotalHours();
        String totalEntries = reportsPage.getTotalEntries();
        
        Assert.assertEquals(Double.parseDouble(totalHours), 10.0, 0.01, 
            "Total hours should be 10.0 (4.0 + 3.5 + 2.5)");
        Assert.assertEquals(Integer.parseInt(totalEntries), 3, 
            "Total entries should be 3");
        logInfo("Report verified - Total Hours: " + totalHours + ", Total Entries: " + totalEntries);
        
        logInfo("Step 5: Verify dashboard stats are updated");
        dashboardPage.navigateToDashboard();
        dashboardPage.waitForDashboardLoad();
        
        String dashboardTotalHours = dashboardPage.getTotalHours();
        Assert.assertNotNull(dashboardTotalHours, "Dashboard should show total hours");
        logInfo("Dashboard stats verified");
        
        logInfo("Step 6: Logout");
        loginPage = dashboardPage.logout();
        Assert.assertTrue(loginPage.isLoginPageDisplayed(), "Should be redirected to login after logout");
        logInfo("Logout successful");
        
        logInfo("End-to-end workflow completed successfully");
    }

    @Test(priority = 2, description = "Verify data persistence after logout and re-login")
    public void testDataPersistenceAfterRelogin() {
        logInfo("Testing data persistence after logout and re-login");
        
        String testEmail = ConfigReader.getTestUserEmail();
        dashboardPage = loginPage.login(testEmail);
        
        clientsPage = dashboardPage.navigateToClients();
        clientsPage.waitForPageLoad();
        
        String clientName = "Persist Client " + UUID.randomUUID().toString().substring(0, 8);
        clientsPage.createClient(clientName);
        
        workEntriesPage = dashboardPage.navigateToWorkEntries();
        workEntriesPage.waitForPageLoad();
        workEntriesPage.createWorkEntry(clientName, "5.0", "Persistence test entry");
        
        int workEntryCountBefore = workEntriesPage.getWorkEntryCount();
        logInfo("Work entry count before logout: " + workEntryCountBefore);
        
        loginPage = dashboardPage.logout();
        Assert.assertTrue(loginPage.isLoginPageDisplayed(), "Should be on login page");
        
        dashboardPage = loginPage.login(testEmail);
        Assert.assertTrue(dashboardPage.isDashboardDisplayed(), "Should be on dashboard after re-login");
        
        workEntriesPage = dashboardPage.navigateToWorkEntries();
        workEntriesPage.waitForPageLoad();
        
        int workEntryCountAfter = workEntriesPage.getWorkEntryCount();
        logInfo("Work entry count after re-login: " + workEntryCountAfter);
        
        Assert.assertEquals(workEntryCountAfter, workEntryCountBefore, 
            "Work entry count should be the same after re-login");
        Assert.assertTrue(workEntriesPage.isWorkEntryInTable(clientName, "5"), 
            "Work entry should still exist after re-login");
        
        logInfo("Data persistence verified successfully");
    }

    @Test(priority = 3, description = "Verify CRUD operations on clients")
    public void testClientCrudOperations() {
        logInfo("Testing CRUD operations on clients");
        
        dashboardPage = loginPage.login(ConfigReader.getTestUserEmail());
        clientsPage = dashboardPage.navigateToClients();
        clientsPage.waitForPageLoad();
        
        logInfo("CREATE: Creating a new client");
        String clientName = "CRUD Client " + UUID.randomUUID().toString().substring(0, 8);
        clientsPage.createClient(clientName, "CRUD Dept", "crud@test.com", "CRUD test description");
        Assert.assertTrue(clientsPage.isClientInTable(clientName), "Client should be created");
        logInfo("CREATE successful");
        
        logInfo("READ: Verifying client is in the list");
        Assert.assertTrue(clientsPage.getClientNames().contains(clientName), 
            "Client should be readable in the list");
        logInfo("READ successful");
        
        logInfo("UPDATE: Updating the client");
        String updatedName = "Updated " + clientName;
        clientsPage.editClient(clientName);
        clientsPage.updateClient(updatedName, "Updated Dept", null, "Updated description");
        Assert.assertTrue(clientsPage.isClientInTable(updatedName), "Client should be updated");
        Assert.assertFalse(clientsPage.isClientInTable(clientName), "Old client name should not exist");
        logInfo("UPDATE successful");
        
        logInfo("DELETE: Deleting the client");
        clientsPage.deleteClient(updatedName);
        clientsPage.waitForPageLoad();
        Assert.assertFalse(clientsPage.isClientInTable(updatedName), "Client should be deleted");
        logInfo("DELETE successful");
        
        logInfo("CRUD operations completed successfully");
    }

    @Test(priority = 4, description = "Verify CRUD operations on work entries")
    public void testWorkEntryCrudOperations() {
        logInfo("Testing CRUD operations on work entries");
        
        dashboardPage = loginPage.login(ConfigReader.getTestUserEmail());
        
        clientsPage = dashboardPage.navigateToClients();
        clientsPage.waitForPageLoad();
        String clientName = "WE CRUD Client " + UUID.randomUUID().toString().substring(0, 8);
        clientsPage.createClient(clientName);
        
        workEntriesPage = dashboardPage.navigateToWorkEntries();
        workEntriesPage.waitForPageLoad();
        
        logInfo("CREATE: Creating a new work entry");
        String hours = "6.0";
        workEntriesPage.createWorkEntry(clientName, hours, "CRUD work entry");
        Assert.assertTrue(workEntriesPage.isWorkEntryInTable(clientName, hours), 
            "Work entry should be created");
        logInfo("CREATE successful");
        
        logInfo("READ: Verifying work entry is in the list");
        Assert.assertTrue(workEntriesPage.getWorkEntryClients().contains(clientName), 
            "Work entry should be readable in the list");
        logInfo("READ successful");
        
        logInfo("UPDATE: Updating the work entry");
        String updatedHours = "8.0";
        workEntriesPage.editWorkEntry(clientName);
        workEntriesPage.updateWorkEntry(updatedHours, "Updated work entry description");
        Assert.assertTrue(workEntriesPage.isWorkEntryInTable(clientName, updatedHours), 
            "Work entry should be updated");
        logInfo("UPDATE successful");
        
        logInfo("DELETE: Deleting the work entry");
        int countBefore = workEntriesPage.getWorkEntryCount();
        workEntriesPage.deleteWorkEntry(clientName);
        workEntriesPage.waitForPageLoad();
        int countAfter = workEntriesPage.getWorkEntryCount();
        Assert.assertEquals(countAfter, countBefore - 1, "Work entry should be deleted");
        logInfo("DELETE successful");
        
        logInfo("Work entry CRUD operations completed successfully");
    }

    @Test(priority = 5, description = "Verify report accuracy with multiple clients and entries")
    public void testReportAccuracyWithMultipleData() {
        logInfo("Testing report accuracy with multiple clients and entries");
        
        dashboardPage = loginPage.login(ConfigReader.getTestUserEmail());
        
        clientsPage = dashboardPage.navigateToClients();
        clientsPage.waitForPageLoad();
        
        String client1 = "Report Client 1 " + UUID.randomUUID().toString().substring(0, 8);
        String client2 = "Report Client 2 " + UUID.randomUUID().toString().substring(0, 8);
        clientsPage.createClient(client1);
        clientsPage.createClient(client2);
        
        workEntriesPage = dashboardPage.navigateToWorkEntries();
        workEntriesPage.waitForPageLoad();
        
        workEntriesPage.createWorkEntry(client1, "2.0", "Client 1 Entry 1");
        workEntriesPage.createWorkEntry(client1, "3.0", "Client 1 Entry 2");
        workEntriesPage.createWorkEntry(client2, "4.0", "Client 2 Entry 1");
        workEntriesPage.createWorkEntry(client2, "5.0", "Client 2 Entry 2");
        workEntriesPage.createWorkEntry(client2, "1.0", "Client 2 Entry 3");
        
        reportsPage = dashboardPage.navigateToReports();
        reportsPage.waitForPageLoad();
        
        logInfo("Verifying Client 1 report");
        reportsPage.selectClient(client1);
        Assert.assertEquals(Double.parseDouble(reportsPage.getTotalHours()), 5.0, 0.01, 
            "Client 1 total hours should be 5.0");
        Assert.assertEquals(Integer.parseInt(reportsPage.getTotalEntries()), 2, 
            "Client 1 should have 2 entries");
        
        logInfo("Verifying Client 2 report");
        reportsPage.selectClient(client2);
        Assert.assertEquals(Double.parseDouble(reportsPage.getTotalHours()), 10.0, 0.01, 
            "Client 2 total hours should be 10.0");
        Assert.assertEquals(Integer.parseInt(reportsPage.getTotalEntries()), 3, 
            "Client 2 should have 3 entries");
        
        logInfo("Report accuracy verified for multiple clients");
    }
}
