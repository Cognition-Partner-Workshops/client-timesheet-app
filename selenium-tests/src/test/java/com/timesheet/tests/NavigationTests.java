package com.timesheet.tests;

import com.timesheet.pages.ClientsPage;
import com.timesheet.pages.DashboardPage;
import com.timesheet.pages.LoginPage;
import com.timesheet.pages.ReportsPage;
import com.timesheet.pages.WorkEntriesPage;
import org.testng.Assert;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

public class NavigationTests extends BaseTest {

    private DashboardPage dashboardPage;

    @BeforeMethod
    public void setup() {
        loginAsDefaultUser();
        dashboardPage = new DashboardPage(driver);
    }

    @Test(priority = 1, description = "Verify navigation from Dashboard to Clients and back")
    public void testNavigationDashboardToClientsAndBack() {
        logInfo("Testing navigation from Dashboard to Clients and back");
        
        ClientsPage clientsPage = dashboardPage.navigateToClients();
        Assert.assertTrue(clientsPage.isClientsPageDisplayed(), "Clients page should be displayed");
        Assert.assertTrue(driver.getCurrentUrl().contains("/clients"), "URL should contain /clients");
        
        dashboardPage = clientsPage.navigateTo("/dashboard") instanceof DashboardPage ? 
            new DashboardPage(driver) : null;
        dashboardPage = new DashboardPage(driver);
        dashboardPage.navigateToDashboard();
        Assert.assertTrue(dashboardPage.isDashboardDisplayed(), "Dashboard should be displayed");
        
        logInfo("Navigation Dashboard to Clients and back successful");
    }

    @Test(priority = 2, description = "Verify navigation from Dashboard to Work Entries and back")
    public void testNavigationDashboardToWorkEntriesAndBack() {
        logInfo("Testing navigation from Dashboard to Work Entries and back");
        
        WorkEntriesPage workEntriesPage = dashboardPage.navigateToWorkEntries();
        Assert.assertTrue(workEntriesPage.isWorkEntriesPageDisplayed(), "Work Entries page should be displayed");
        Assert.assertTrue(driver.getCurrentUrl().contains("/work-entries"), "URL should contain /work-entries");
        
        dashboardPage = new DashboardPage(driver);
        dashboardPage.navigateToDashboard();
        Assert.assertTrue(dashboardPage.isDashboardDisplayed(), "Dashboard should be displayed");
        
        logInfo("Navigation Dashboard to Work Entries and back successful");
    }

    @Test(priority = 3, description = "Verify navigation from Dashboard to Reports and back")
    public void testNavigationDashboardToReportsAndBack() {
        logInfo("Testing navigation from Dashboard to Reports and back");
        
        ReportsPage reportsPage = dashboardPage.navigateToReports();
        Assert.assertTrue(reportsPage.isReportsPageDisplayed(), "Reports page should be displayed");
        Assert.assertTrue(driver.getCurrentUrl().contains("/reports"), "URL should contain /reports");
        
        dashboardPage = new DashboardPage(driver);
        dashboardPage.navigateToDashboard();
        Assert.assertTrue(dashboardPage.isDashboardDisplayed(), "Dashboard should be displayed");
        
        logInfo("Navigation Dashboard to Reports and back successful");
    }

    @Test(priority = 4, description = "Verify navigation between all pages in sequence")
    public void testNavigationSequence() {
        logInfo("Testing navigation sequence through all pages");
        
        ClientsPage clientsPage = dashboardPage.navigateToClients();
        Assert.assertTrue(clientsPage.isClientsPageDisplayed(), "Clients page should be displayed");
        
        WorkEntriesPage workEntriesPage = new DashboardPage(driver).navigateToWorkEntries();
        Assert.assertTrue(workEntriesPage.isWorkEntriesPageDisplayed(), "Work Entries page should be displayed");
        
        ReportsPage reportsPage = new DashboardPage(driver).navigateToReports();
        Assert.assertTrue(reportsPage.isReportsPageDisplayed(), "Reports page should be displayed");
        
        dashboardPage = new DashboardPage(driver);
        dashboardPage.navigateToDashboard();
        Assert.assertTrue(dashboardPage.isDashboardDisplayed(), "Dashboard should be displayed");
        
        logInfo("Navigation sequence completed successfully");
    }

    @Test(priority = 5, description = "Verify logout redirects to login page")
    public void testLogoutRedirectsToLogin() {
        logInfo("Testing logout redirects to login page");
        
        LoginPage loginPage = dashboardPage.logout();
        Assert.assertTrue(loginPage.isLoginPageDisplayed(), "Login page should be displayed after logout");
        Assert.assertTrue(driver.getCurrentUrl().contains("/login"), "URL should contain /login");
        
        logInfo("Logout redirects to login page successfully");
    }

    @Test(priority = 6, description = "Verify unauthenticated user is redirected to login")
    public void testUnauthenticatedUserRedirectedToLogin() {
        logInfo("Testing unauthenticated user is redirected to login");
        
        dashboardPage.logout();
        
        driver.get(driver.getCurrentUrl().replace("/login", "/dashboard"));
        waitUtils.sleep(1000);
        
        Assert.assertTrue(driver.getCurrentUrl().contains("/login"), 
            "Unauthenticated user should be redirected to login");
        
        logInfo("Unauthenticated user redirected to login successfully");
    }

    @Test(priority = 7, description = "Verify clicking stats cards navigates to correct pages")
    public void testStatsCardsNavigation() {
        logInfo("Testing stats cards navigation");
        
        dashboardPage.clickTotalClientsCard();
        waitUtils.sleep(500);
        Assert.assertTrue(driver.getCurrentUrl().contains("/clients"), 
            "Clicking Total Clients card should navigate to clients page");
        
        dashboardPage = new DashboardPage(driver);
        dashboardPage.navigateToDashboard();
        
        dashboardPage.clickTotalWorkEntriesCard();
        waitUtils.sleep(500);
        Assert.assertTrue(driver.getCurrentUrl().contains("/work-entries"), 
            "Clicking Total Work Entries card should navigate to work entries page");
        
        dashboardPage = new DashboardPage(driver);
        dashboardPage.navigateToDashboard();
        
        dashboardPage.clickTotalHoursCard();
        waitUtils.sleep(500);
        Assert.assertTrue(driver.getCurrentUrl().contains("/reports"), 
            "Clicking Total Hours card should navigate to reports page");
        
        logInfo("Stats cards navigation works correctly");
    }

    @Test(priority = 8, description = "Verify page refresh maintains authentication")
    public void testPageRefreshMaintainsAuth() {
        logInfo("Testing page refresh maintains authentication");
        
        driver.navigate().refresh();
        waitUtils.sleep(1000);
        
        Assert.assertTrue(dashboardPage.isDashboardDisplayed(), 
            "Dashboard should still be displayed after refresh");
        Assert.assertFalse(driver.getCurrentUrl().contains("/login"), 
            "User should not be redirected to login after refresh");
        
        logInfo("Page refresh maintains authentication successfully");
    }

    @Test(priority = 9, description = "Verify browser back button works correctly")
    public void testBrowserBackButton() {
        logInfo("Testing browser back button");
        
        dashboardPage.navigateToClients();
        Assert.assertTrue(driver.getCurrentUrl().contains("/clients"), "Should be on clients page");
        
        driver.navigate().back();
        waitUtils.sleep(500);
        
        Assert.assertTrue(driver.getCurrentUrl().contains("/dashboard"), 
            "Back button should return to dashboard");
        
        logInfo("Browser back button works correctly");
    }

    @Test(priority = 10, description = "Verify direct URL navigation works when authenticated")
    public void testDirectUrlNavigation() {
        logInfo("Testing direct URL navigation");
        
        String baseUrl = driver.getCurrentUrl().replace("/dashboard", "");
        
        driver.get(baseUrl + "/clients");
        waitUtils.sleep(500);
        Assert.assertTrue(driver.getCurrentUrl().contains("/clients"), 
            "Direct navigation to /clients should work");
        
        driver.get(baseUrl + "/work-entries");
        waitUtils.sleep(500);
        Assert.assertTrue(driver.getCurrentUrl().contains("/work-entries"), 
            "Direct navigation to /work-entries should work");
        
        driver.get(baseUrl + "/reports");
        waitUtils.sleep(500);
        Assert.assertTrue(driver.getCurrentUrl().contains("/reports"), 
            "Direct navigation to /reports should work");
        
        logInfo("Direct URL navigation works correctly");
    }
}
