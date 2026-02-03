package com.timesheet.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

import java.util.List;

public class DashboardPage extends BasePage {

    private final By dashboardTitle = By.xpath("//h4[contains(text(), 'Dashboard')]");
    private final By totalClientsCard = By.xpath("//h6[contains(text(), 'Total Clients')]/following-sibling::div/h4 | //h6[contains(text(), 'Total Clients')]/..//h4");
    private final By totalWorkEntriesCard = By.xpath("//h6[contains(text(), 'Total Work Entries')]/following-sibling::div/h4 | //h6[contains(text(), 'Total Work Entries')]/..//h4");
    private final By totalHoursCard = By.xpath("//h6[contains(text(), 'Total Hours')]/following-sibling::div/h4 | //h6[contains(text(), 'Total Hours')]/..//h4");
    private final By statsCards = By.cssSelector(".MuiCard-root");
    private final By recentEntriesSection = By.xpath("//h6[contains(text(), 'Recent Work Entries')]");
    private final By quickActionsSection = By.xpath("//h6[contains(text(), 'Quick Actions')]");
    private final By addClientButton = By.xpath("//button[contains(., 'Add Client')]");
    private final By addWorkEntryButton = By.xpath("//button[contains(., 'Add Work Entry')]");
    private final By viewReportsButton = By.xpath("//button[contains(., 'View Reports')]");
    private final By addEntryLink = By.xpath("//button[contains(., 'Add Entry')]");
    private final By recentEntryItems = By.cssSelector(".MuiPaper-root .MuiBox-root[style*='border-bottom']");
    private final By noEntriesMessage = By.xpath("//*[contains(text(), 'No work entries yet')]");
    private final By userEmail = By.cssSelector(".MuiToolbar-root .MuiTypography-body2");
    private final By logoutButton = By.xpath("//button[contains(., 'Logout')]");
    private final By sidebarDashboard = By.xpath("//span[text()='Dashboard']");
    private final By sidebarClients = By.xpath("//span[text()='Clients']");
    private final By sidebarWorkEntries = By.xpath("//span[text()='Work Entries']");
    private final By sidebarReports = By.xpath("//span[text()='Reports']");

    public DashboardPage(WebDriver driver) {
        super(driver);
    }

    public boolean isDashboardDisplayed() {
        try {
            waitUtils.waitForElementVisible(dashboardTitle);
            return isElementDisplayed(dashboardTitle);
        } catch (Exception e) {
            return false;
        }
    }

    public void waitForDashboardLoad() {
        waitUtils.waitForElementVisible(dashboardTitle);
        waitUtils.sleep(500);
    }

    public String getTotalClients() {
        try {
            waitUtils.waitForElementVisible(totalClientsCard);
            return getText(totalClientsCard);
        } catch (Exception e) {
            return "0";
        }
    }

    public String getTotalWorkEntries() {
        try {
            waitUtils.waitForElementVisible(totalWorkEntriesCard);
            return getText(totalWorkEntriesCard);
        } catch (Exception e) {
            return "0";
        }
    }

    public String getTotalHours() {
        try {
            waitUtils.waitForElementVisible(totalHoursCard);
            return getText(totalHoursCard);
        } catch (Exception e) {
            return "0.00";
        }
    }

    public int getStatsCardsCount() {
        return getElementCount(statsCards);
    }

    public boolean isRecentEntriesSectionDisplayed() {
        return isElementDisplayed(recentEntriesSection);
    }

    public boolean isQuickActionsSectionDisplayed() {
        return isElementDisplayed(quickActionsSection);
    }

    public ClientsPage clickAddClientButton() {
        click(addClientButton);
        return new ClientsPage(driver);
    }

    public WorkEntriesPage clickAddWorkEntryButton() {
        click(addWorkEntryButton);
        return new WorkEntriesPage(driver);
    }

    public ReportsPage clickViewReportsButton() {
        click(viewReportsButton);
        return new ReportsPage(driver);
    }

    public WorkEntriesPage clickAddEntryLink() {
        click(addEntryLink);
        return new WorkEntriesPage(driver);
    }

    public boolean hasRecentEntries() {
        return !isElementDisplayed(noEntriesMessage);
    }

    public String getLoggedInUserEmail() {
        try {
            return getText(userEmail);
        } catch (Exception e) {
            return null;
        }
    }

    public LoginPage logout() {
        click(logoutButton);
        waitUtils.waitForUrlContains("/login");
        return new LoginPage(driver);
    }

    public DashboardPage navigateToDashboard() {
        click(sidebarDashboard);
        waitUtils.waitForUrlContains("/dashboard");
        return this;
    }

    public ClientsPage navigateToClients() {
        click(sidebarClients);
        waitUtils.waitForUrlContains("/clients");
        return new ClientsPage(driver);
    }

    public WorkEntriesPage navigateToWorkEntries() {
        click(sidebarWorkEntries);
        waitUtils.waitForUrlContains("/work-entries");
        return new WorkEntriesPage(driver);
    }

    public ReportsPage navigateToReports() {
        click(sidebarReports);
        waitUtils.waitForUrlContains("/reports");
        return new ReportsPage(driver);
    }

    public void clickTotalClientsCard() {
        List<WebElement> cards = getElements(statsCards);
        if (!cards.isEmpty()) {
            cards.get(0).click();
        }
    }

    public void clickTotalWorkEntriesCard() {
        List<WebElement> cards = getElements(statsCards);
        if (cards.size() > 1) {
            cards.get(1).click();
        }
    }

    public void clickTotalHoursCard() {
        List<WebElement> cards = getElements(statsCards);
        if (cards.size() > 2) {
            cards.get(2).click();
        }
    }
}
