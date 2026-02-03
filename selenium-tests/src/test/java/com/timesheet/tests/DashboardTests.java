package com.timesheet.tests;

import com.timesheet.pages.ClientsPage;
import com.timesheet.pages.DashboardPage;
import com.timesheet.pages.LoginPage;
import com.timesheet.pages.ReportsPage;
import com.timesheet.pages.WorkEntriesPage;
import org.testng.Assert;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

public class DashboardTests extends BaseTest {

    private DashboardPage dashboardPage;

    @BeforeMethod
    public void setup() {
        loginAsDefaultUser();
        dashboardPage = new DashboardPage(driver);
    }

    @Test(priority = 1, description = "Verify dashboard page is displayed after login")
    public void testDashboardDisplayed() {
        logInfo("Verifying dashboard page is displayed");
        Assert.assertTrue(dashboardPage.isDashboardDisplayed(), "Dashboard should be displayed");
        logInfo("Dashboard page displayed successfully");
    }

    @Test(priority = 2, description = "Verify stats cards are displayed on dashboard")
    public void testStatsCardsDisplayed() {
        logInfo("Verifying stats cards are displayed");
        int cardCount = dashboardPage.getStatsCardsCount();
        Assert.assertTrue(cardCount >= 3, "At least 3 stats cards should be displayed");
        logInfo("Stats cards count: " + cardCount);
    }

    @Test(priority = 3, description = "Verify total clients card displays a value")
    public void testTotalClientsCardDisplayed() {
        logInfo("Verifying total clients card");
        String totalClients = dashboardPage.getTotalClients();
        Assert.assertNotNull(totalClients, "Total clients value should be displayed");
        logInfo("Total clients: " + totalClients);
    }

    @Test(priority = 4, description = "Verify total work entries card displays a value")
    public void testTotalWorkEntriesCardDisplayed() {
        logInfo("Verifying total work entries card");
        String totalEntries = dashboardPage.getTotalWorkEntries();
        Assert.assertNotNull(totalEntries, "Total work entries value should be displayed");
        logInfo("Total work entries: " + totalEntries);
    }

    @Test(priority = 5, description = "Verify total hours card displays a value")
    public void testTotalHoursCardDisplayed() {
        logInfo("Verifying total hours card");
        String totalHours = dashboardPage.getTotalHours();
        Assert.assertNotNull(totalHours, "Total hours value should be displayed");
        logInfo("Total hours: " + totalHours);
    }

    @Test(priority = 6, description = "Verify recent entries section is displayed")
    public void testRecentEntriesSectionDisplayed() {
        logInfo("Verifying recent entries section");
        Assert.assertTrue(dashboardPage.isRecentEntriesSectionDisplayed(), 
            "Recent entries section should be displayed");
        logInfo("Recent entries section is displayed");
    }

    @Test(priority = 7, description = "Verify quick actions section is displayed")
    public void testQuickActionsSectionDisplayed() {
        logInfo("Verifying quick actions section");
        Assert.assertTrue(dashboardPage.isQuickActionsSectionDisplayed(), 
            "Quick actions section should be displayed");
        logInfo("Quick actions section is displayed");
    }

    @Test(priority = 8, description = "Verify Add Client button navigates to clients page")
    public void testAddClientButtonNavigation() {
        logInfo("Testing Add Client button navigation");
        ClientsPage clientsPage = dashboardPage.clickAddClientButton();
        Assert.assertTrue(clientsPage.isClientsPageDisplayed(), "Clients page should be displayed");
        Assert.assertTrue(driver.getCurrentUrl().contains("/clients"), "URL should contain /clients");
        logInfo("Successfully navigated to clients page");
    }

    @Test(priority = 9, description = "Verify Add Work Entry button navigates to work entries page")
    public void testAddWorkEntryButtonNavigation() {
        logInfo("Testing Add Work Entry button navigation");
        WorkEntriesPage workEntriesPage = dashboardPage.clickAddWorkEntryButton();
        Assert.assertTrue(workEntriesPage.isWorkEntriesPageDisplayed(), "Work entries page should be displayed");
        Assert.assertTrue(driver.getCurrentUrl().contains("/work-entries"), "URL should contain /work-entries");
        logInfo("Successfully navigated to work entries page");
    }

    @Test(priority = 10, description = "Verify View Reports button navigates to reports page")
    public void testViewReportsButtonNavigation() {
        logInfo("Testing View Reports button navigation");
        ReportsPage reportsPage = dashboardPage.clickViewReportsButton();
        Assert.assertTrue(reportsPage.isReportsPageDisplayed(), "Reports page should be displayed");
        Assert.assertTrue(driver.getCurrentUrl().contains("/reports"), "URL should contain /reports");
        logInfo("Successfully navigated to reports page");
    }

    @Test(priority = 11, description = "Verify sidebar navigation to Clients")
    public void testSidebarNavigationToClients() {
        logInfo("Testing sidebar navigation to Clients");
        ClientsPage clientsPage = dashboardPage.navigateToClients();
        Assert.assertTrue(clientsPage.isClientsPageDisplayed(), "Clients page should be displayed");
        logInfo("Successfully navigated to clients page via sidebar");
    }

    @Test(priority = 12, description = "Verify sidebar navigation to Work Entries")
    public void testSidebarNavigationToWorkEntries() {
        logInfo("Testing sidebar navigation to Work Entries");
        WorkEntriesPage workEntriesPage = dashboardPage.navigateToWorkEntries();
        Assert.assertTrue(workEntriesPage.isWorkEntriesPageDisplayed(), "Work entries page should be displayed");
        logInfo("Successfully navigated to work entries page via sidebar");
    }

    @Test(priority = 13, description = "Verify sidebar navigation to Reports")
    public void testSidebarNavigationToReports() {
        logInfo("Testing sidebar navigation to Reports");
        ReportsPage reportsPage = dashboardPage.navigateToReports();
        Assert.assertTrue(reportsPage.isReportsPageDisplayed(), "Reports page should be displayed");
        logInfo("Successfully navigated to reports page via sidebar");
    }

    @Test(priority = 14, description = "Verify logout functionality")
    public void testLogoutFunctionality() {
        logInfo("Testing logout functionality");
        LoginPage loginPage = dashboardPage.logout();
        Assert.assertTrue(loginPage.isLoginPageDisplayed(), "Login page should be displayed after logout");
        Assert.assertTrue(driver.getCurrentUrl().contains("/login"), "URL should contain /login");
        logInfo("Successfully logged out");
    }

    @Test(priority = 15, description = "Verify user email is displayed in header")
    public void testUserEmailDisplayed() {
        logInfo("Verifying user email is displayed in header");
        String email = dashboardPage.getLoggedInUserEmail();
        Assert.assertNotNull(email, "User email should be displayed");
        Assert.assertTrue(email.contains("@"), "Email should contain @ symbol");
        logInfo("User email displayed: " + email);
    }
}
