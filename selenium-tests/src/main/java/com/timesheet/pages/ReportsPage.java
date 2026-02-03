package com.timesheet.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

import java.util.List;

public class ReportsPage extends BasePage {

    private final By pageTitle = By.xpath("//h4[contains(text(), 'Reports')]");
    private final By clientSelect = By.cssSelector(".MuiSelect-select");
    private final By clientMenuItems = By.cssSelector(".MuiMenu-paper .MuiMenuItem-root");
    private final By csvExportButton = By.cssSelector("button[aria-label='Export as CSV'], button svg[data-testid='DescriptionIcon']");
    private final By pdfExportButton = By.cssSelector("button[aria-label='Export as PDF'], button svg[data-testid='PictureAsPdfIcon']");
    private final By totalHoursCard = By.xpath("//p[contains(text(), 'Total Hours')]/..//h4 | //*[contains(text(), 'Total Hours')]/following-sibling::*");
    private final By totalEntriesCard = By.xpath("//p[contains(text(), 'Total Entries')]/..//h4 | //*[contains(text(), 'Total Entries')]/following-sibling::*");
    private final By averageHoursCard = By.xpath("//p[contains(text(), 'Average Hours')]/..//h4 | //*[contains(text(), 'Average Hours')]/following-sibling::*");
    private final By reportTable = By.cssSelector("table");
    private final By reportRows = By.cssSelector("table tbody tr");
    private final By noEntriesMessage = By.xpath("//*[contains(text(), 'No work entries found for this client')]");
    private final By noClientsMessage = By.xpath("//*[contains(text(), 'need to create at least one client')]");
    private final By selectClientMessage = By.xpath("//*[contains(text(), 'Select a client to view')]");
    private final By createClientButton = By.xpath("//button[contains(., 'Create Client')]");
    private final By loadingSpinner = By.cssSelector(".MuiCircularProgress-root");
    private final By errorAlert = By.cssSelector(".MuiAlert-standardError");
    private final By statsCards = By.cssSelector(".MuiCard-root");

    public ReportsPage(WebDriver driver) {
        super(driver);
    }

    public boolean isReportsPageDisplayed() {
        try {
            waitUtils.waitForElementVisible(pageTitle);
            return isElementDisplayed(pageTitle);
        } catch (Exception e) {
            return false;
        }
    }

    public void waitForPageLoad() {
        waitUtils.waitForElementInvisible(loadingSpinner);
        waitUtils.waitForElementVisible(pageTitle);
        waitUtils.sleep(500);
    }

    public boolean hasNoClients() {
        return isElementDisplayed(noClientsMessage);
    }

    public ClientsPage clickCreateClientButton() {
        click(createClientButton);
        return new ClientsPage(driver);
    }

    public boolean isSelectClientMessageDisplayed() {
        return isElementDisplayed(selectClientMessage);
    }

    public void selectClient(String clientName) {
        click(clientSelect);
        waitUtils.sleep(300);
        List<WebElement> menuItems = getElements(clientMenuItems);
        for (WebElement item : menuItems) {
            if (item.getText().equals(clientName)) {
                item.click();
                waitUtils.sleep(500);
                waitUtils.waitForElementInvisible(loadingSpinner);
                return;
            }
        }
    }

    public void selectClientByIndex(int index) {
        click(clientSelect);
        waitUtils.sleep(300);
        List<WebElement> menuItems = getElements(clientMenuItems);
        if (index < menuItems.size()) {
            menuItems.get(index).click();
            waitUtils.sleep(500);
            waitUtils.waitForElementInvisible(loadingSpinner);
        }
    }

    public void selectFirstClient() {
        selectClientByIndex(1);
    }

    public String getTotalHours() {
        try {
            waitUtils.waitForElementVisible(totalHoursCard);
            return getText(totalHoursCard);
        } catch (Exception e) {
            return "0.00";
        }
    }

    public String getTotalEntries() {
        try {
            waitUtils.waitForElementVisible(totalEntriesCard);
            return getText(totalEntriesCard);
        } catch (Exception e) {
            return "0";
        }
    }

    public String getAverageHours() {
        try {
            waitUtils.waitForElementVisible(averageHoursCard);
            return getText(averageHoursCard);
        } catch (Exception e) {
            return "0.00";
        }
    }

    public boolean areStatsCardsDisplayed() {
        return getElementCount(statsCards) >= 3;
    }

    public void clickCsvExportButton() {
        List<WebElement> buttons = driver.findElements(By.cssSelector("button"));
        for (WebElement btn : buttons) {
            if (btn.getAttribute("innerHTML").contains("DescriptionIcon") ||
                btn.getAttribute("aria-label") != null && btn.getAttribute("aria-label").contains("CSV")) {
                btn.click();
                waitUtils.sleep(1000);
                return;
            }
        }
    }

    public void clickPdfExportButton() {
        List<WebElement> buttons = driver.findElements(By.cssSelector("button"));
        for (WebElement btn : buttons) {
            if (btn.getAttribute("innerHTML").contains("PictureAsPdfIcon") ||
                btn.getAttribute("aria-label") != null && btn.getAttribute("aria-label").contains("PDF")) {
                btn.click();
                waitUtils.sleep(1000);
                return;
            }
        }
    }

    public boolean isCsvExportEnabled() {
        List<WebElement> buttons = driver.findElements(By.cssSelector("button"));
        for (WebElement btn : buttons) {
            if (btn.getAttribute("innerHTML").contains("DescriptionIcon")) {
                return btn.isEnabled() && !btn.getAttribute("class").contains("Mui-disabled");
            }
        }
        return false;
    }

    public boolean isPdfExportEnabled() {
        List<WebElement> buttons = driver.findElements(By.cssSelector("button"));
        for (WebElement btn : buttons) {
            if (btn.getAttribute("innerHTML").contains("PictureAsPdfIcon")) {
                return btn.isEnabled() && !btn.getAttribute("class").contains("Mui-disabled");
            }
        }
        return false;
    }

    public boolean isReportTableDisplayed() {
        return isElementDisplayed(reportTable);
    }

    public int getReportEntryCount() {
        if (isElementDisplayed(noEntriesMessage)) {
            return 0;
        }
        List<WebElement> rows = getElements(reportRows);
        if (rows.size() == 1 && rows.get(0).getText().contains("No work entries")) {
            return 0;
        }
        return rows.size();
    }

    public boolean hasNoWorkEntries() {
        return isElementDisplayed(noEntriesMessage) || getReportEntryCount() == 0;
    }

    public String getErrorAlertText() {
        try {
            return getText(errorAlert);
        } catch (Exception e) {
            return null;
        }
    }

    public boolean isErrorAlertDisplayed() {
        return isElementDisplayed(errorAlert);
    }

    public List<String> getAvailableClients() {
        click(clientSelect);
        waitUtils.sleep(300);
        List<WebElement> menuItems = getElements(clientMenuItems);
        List<String> clients = menuItems.stream()
                .map(WebElement::getText)
                .filter(text -> !text.equals("Choose a client..."))
                .toList();
        driver.findElement(By.tagName("body")).click();
        waitUtils.sleep(200);
        return clients;
    }

    public String getSelectedClient() {
        try {
            return getText(clientSelect);
        } catch (Exception e) {
            return null;
        }
    }
}
