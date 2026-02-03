package com.timesheet.tests;

import com.timesheet.pages.ClientsPage;
import com.timesheet.pages.DashboardPage;
import com.timesheet.pages.ReportsPage;
import com.timesheet.pages.WorkEntriesPage;
import org.testng.Assert;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

import java.util.List;
import java.util.UUID;

public class ReportsTests extends BaseTest {

    private ReportsPage reportsPage;
    private ClientsPage clientsPage;
    private WorkEntriesPage workEntriesPage;
    private DashboardPage dashboardPage;
    private String testClientName;

    @BeforeMethod
    public void setup() {
        loginAsDefaultUser();
        dashboardPage = new DashboardPage(driver);
        
        clientsPage = dashboardPage.navigateToClients();
        clientsPage.waitForPageLoad();
        
        testClientName = "Report Test " + UUID.randomUUID().toString().substring(0, 8);
        clientsPage.createClient(testClientName, "Reports Dept", "reports@test.com", "Reports test client");
        
        workEntriesPage = dashboardPage.navigateToWorkEntries();
        workEntriesPage.waitForPageLoad();
        workEntriesPage.createWorkEntry(testClientName, "4.5", "Report test entry 1");
        workEntriesPage.createWorkEntry(testClientName, "3.0", "Report test entry 2");
        
        reportsPage = dashboardPage.navigateToReports();
        reportsPage.waitForPageLoad();
    }

    @Test(priority = 1, description = "Verify reports page is displayed")
    public void testReportsPageDisplayed() {
        logInfo("Verifying reports page is displayed");
        Assert.assertTrue(reportsPage.isReportsPageDisplayed(), "Reports page should be displayed");
        logInfo("Reports page displayed successfully");
    }

    @Test(priority = 2, description = "Verify select client message is displayed initially")
    public void testSelectClientMessageDisplayed() {
        logInfo("Verifying select client message is displayed");
        Assert.assertTrue(reportsPage.isSelectClientMessageDisplayed(), 
            "Select client message should be displayed initially");
        logInfo("Select client message displayed correctly");
    }

    @Test(priority = 3, description = "Verify client dropdown contains available clients")
    public void testClientDropdownContainsClients() {
        logInfo("Verifying client dropdown contains clients");
        List<String> clients = reportsPage.getAvailableClients();
        Assert.assertFalse(clients.isEmpty(), "Client dropdown should contain clients");
        Assert.assertTrue(clients.contains(testClientName), 
            "Test client should be in the dropdown");
        logInfo("Client dropdown contains " + clients.size() + " clients");
    }

    @Test(priority = 4, description = "Verify selecting a client shows report")
    public void testSelectingClientShowsReport() {
        logInfo("Testing selecting a client shows report");
        reportsPage.selectClient(testClientName);
        
        Assert.assertTrue(reportsPage.areStatsCardsDisplayed(), 
            "Stats cards should be displayed after selecting client");
        Assert.assertTrue(reportsPage.isReportTableDisplayed(), 
            "Report table should be displayed");
        logInfo("Report displayed after selecting client");
    }

    @Test(priority = 5, description = "Verify total hours is calculated correctly")
    public void testTotalHoursCalculation() {
        logInfo("Testing total hours calculation");
        reportsPage.selectClient(testClientName);
        
        String totalHours = reportsPage.getTotalHours();
        Assert.assertNotNull(totalHours, "Total hours should be displayed");
        double hours = Double.parseDouble(totalHours);
        Assert.assertEquals(hours, 7.5, 0.01, "Total hours should be 7.5 (4.5 + 3.0)");
        logInfo("Total hours calculated correctly: " + totalHours);
    }

    @Test(priority = 6, description = "Verify total entries count is correct")
    public void testTotalEntriesCount() {
        logInfo("Testing total entries count");
        reportsPage.selectClient(testClientName);
        
        String totalEntries = reportsPage.getTotalEntries();
        Assert.assertNotNull(totalEntries, "Total entries should be displayed");
        int entries = Integer.parseInt(totalEntries);
        Assert.assertEquals(entries, 2, "Total entries should be 2");
        logInfo("Total entries count correct: " + totalEntries);
    }

    @Test(priority = 7, description = "Verify average hours is calculated correctly")
    public void testAverageHoursCalculation() {
        logInfo("Testing average hours calculation");
        reportsPage.selectClient(testClientName);
        
        String averageHours = reportsPage.getAverageHours();
        Assert.assertNotNull(averageHours, "Average hours should be displayed");
        double avg = Double.parseDouble(averageHours);
        Assert.assertEquals(avg, 3.75, 0.01, "Average hours should be 3.75 (7.5 / 2)");
        logInfo("Average hours calculated correctly: " + averageHours);
    }

    @Test(priority = 8, description = "Verify report table shows work entries")
    public void testReportTableShowsEntries() {
        logInfo("Testing report table shows work entries");
        reportsPage.selectClient(testClientName);
        
        int entryCount = reportsPage.getReportEntryCount();
        Assert.assertEquals(entryCount, 2, "Report table should show 2 entries");
        logInfo("Report table shows correct number of entries: " + entryCount);
    }

    @Test(priority = 9, description = "Verify CSV export button is enabled when client selected")
    public void testCsvExportButtonEnabled() {
        logInfo("Testing CSV export button is enabled");
        reportsPage.selectClient(testClientName);
        
        Assert.assertTrue(reportsPage.isCsvExportEnabled(), 
            "CSV export button should be enabled when client is selected");
        logInfo("CSV export button is enabled");
    }

    @Test(priority = 10, description = "Verify PDF export button is enabled when client selected")
    public void testPdfExportButtonEnabled() {
        logInfo("Testing PDF export button is enabled");
        reportsPage.selectClient(testClientName);
        
        Assert.assertTrue(reportsPage.isPdfExportEnabled(), 
            "PDF export button should be enabled when client is selected");
        logInfo("PDF export button is enabled");
    }

    @Test(priority = 11, description = "Verify CSV export functionality")
    public void testCsvExportFunctionality() {
        logInfo("Testing CSV export functionality");
        reportsPage.selectClient(testClientName);
        
        reportsPage.clickCsvExportButton();
        logInfo("CSV export button clicked successfully");
    }

    @Test(priority = 12, description = "Verify PDF export functionality")
    public void testPdfExportFunctionality() {
        logInfo("Testing PDF export functionality");
        reportsPage.selectClient(testClientName);
        
        reportsPage.clickPdfExportButton();
        logInfo("PDF export button clicked successfully");
    }

    @Test(priority = 13, description = "Verify switching between clients updates report")
    public void testSwitchingClientUpdatesReport() {
        logInfo("Testing switching between clients updates report");
        
        dashboardPage.navigateToClients();
        String secondClient = "Second Client " + UUID.randomUUID().toString().substring(0, 8);
        clientsPage.createClient(secondClient);
        
        workEntriesPage = dashboardPage.navigateToWorkEntries();
        workEntriesPage.waitForPageLoad();
        workEntriesPage.createWorkEntry(secondClient, "8.0", "Second client entry");
        
        reportsPage = dashboardPage.navigateToReports();
        reportsPage.waitForPageLoad();
        
        reportsPage.selectClient(testClientName);
        String firstClientHours = reportsPage.getTotalHours();
        
        reportsPage.selectClient(secondClient);
        String secondClientHours = reportsPage.getTotalHours();
        
        Assert.assertNotEquals(firstClientHours, secondClientHours, 
            "Different clients should show different hours");
        logInfo("Report updates correctly when switching clients");
    }

    @Test(priority = 14, description = "Verify report shows no entries message for client without entries")
    public void testNoEntriesMessageForEmptyClient() {
        logInfo("Testing no entries message for client without entries");
        
        dashboardPage.navigateToClients();
        String emptyClient = "Empty Client " + UUID.randomUUID().toString().substring(0, 8);
        clientsPage.createClient(emptyClient);
        
        reportsPage = dashboardPage.navigateToReports();
        reportsPage.waitForPageLoad();
        reportsPage.selectClient(emptyClient);
        
        Assert.assertTrue(reportsPage.hasNoWorkEntries(), 
            "Should show no entries message for client without work entries");
        logInfo("No entries message displayed correctly");
    }

    @Test(priority = 15, description = "Verify stats cards show zero for client without entries")
    public void testZeroStatsForEmptyClient() {
        logInfo("Testing zero stats for client without entries");
        
        dashboardPage.navigateToClients();
        String emptyClient = "Zero Stats " + UUID.randomUUID().toString().substring(0, 8);
        clientsPage.createClient(emptyClient);
        
        reportsPage = dashboardPage.navigateToReports();
        reportsPage.waitForPageLoad();
        reportsPage.selectClient(emptyClient);
        
        String totalHours = reportsPage.getTotalHours();
        String totalEntries = reportsPage.getTotalEntries();
        
        Assert.assertEquals(Double.parseDouble(totalHours), 0.0, 0.01, 
            "Total hours should be 0 for empty client");
        Assert.assertEquals(Integer.parseInt(totalEntries), 0, 
            "Total entries should be 0 for empty client");
        logInfo("Zero stats displayed correctly for empty client");
    }
}
