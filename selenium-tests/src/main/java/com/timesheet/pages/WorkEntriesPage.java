package com.timesheet.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.Keys;

import java.util.List;

public class WorkEntriesPage extends BasePage {

    private final By pageTitle = By.xpath("//h4[contains(text(), 'Work Entries')]");
    private final By addWorkEntryButton = By.xpath("//button[contains(., 'Add Work Entry')]");
    private final By workEntriesTable = By.cssSelector("table");
    private final By workEntryRows = By.cssSelector("table tbody tr");
    private final By noEntriesMessage = By.xpath("//*[contains(text(), 'No work entries found')]");
    private final By noClientsMessage = By.xpath("//*[contains(text(), 'need to create at least one client')]");
    private final By createClientButton = By.xpath("//button[contains(., 'Create Client')]");
    private final By loadingSpinner = By.cssSelector(".MuiCircularProgress-root");
    private final By errorAlert = By.cssSelector(".MuiAlert-standardError");

    private final By dialogTitle = By.cssSelector(".MuiDialogTitle-root");
    private final By clientSelect = By.cssSelector(".MuiDialog-root .MuiSelect-select");
    private final By hoursInput = By.cssSelector(".MuiDialog-root input[type='number']");
    private final By dateInput = By.cssSelector(".MuiDialog-root input[type='text'][placeholder*='MM'], .MuiDialog-root input[value*='-'], .MuiDialog-root .MuiInputBase-root input");
    private final By descriptionInput = By.cssSelector(".MuiDialog-root textarea");
    private final By cancelButton = By.xpath("//button[contains(text(), 'Cancel')]");
    private final By createButton = By.xpath("//button[contains(text(), 'Create')]");
    private final By updateButton = By.xpath("//button[contains(text(), 'Update')]");
    private final By dialogLoadingSpinner = By.cssSelector(".MuiDialog-root .MuiCircularProgress-root");

    private final By clientMenuItems = By.cssSelector(".MuiMenu-paper .MuiMenuItem-root");

    public WorkEntriesPage(WebDriver driver) {
        super(driver);
    }

    public boolean isWorkEntriesPageDisplayed() {
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

    public void clickAddWorkEntryButton() {
        click(addWorkEntryButton);
        waitUtils.waitForElementVisible(dialogTitle);
    }

    public int getWorkEntryCount() {
        if (isElementDisplayed(noEntriesMessage) || isElementDisplayed(noClientsMessage)) {
            return 0;
        }
        List<WebElement> rows = getElements(workEntryRows);
        if (rows.size() == 1 && (rows.get(0).getText().contains("No work entries found") || 
            rows.get(0).getText().contains("need to create"))) {
            return 0;
        }
        return rows.size();
    }

    public boolean hasNoWorkEntries() {
        return isElementDisplayed(noEntriesMessage) || getWorkEntryCount() == 0;
    }

    public void selectClient(String clientName) {
        click(clientSelect);
        waitUtils.sleep(300);
        List<WebElement> menuItems = getElements(clientMenuItems);
        for (WebElement item : menuItems) {
            if (item.getText().equals(clientName)) {
                item.click();
                waitUtils.sleep(200);
                return;
            }
        }
        if (!menuItems.isEmpty()) {
            menuItems.get(0).click();
        }
    }

    public void selectClientByIndex(int index) {
        click(clientSelect);
        waitUtils.sleep(300);
        List<WebElement> menuItems = getElements(clientMenuItems);
        if (index < menuItems.size()) {
            menuItems.get(index).click();
            waitUtils.sleep(200);
        }
    }

    public void enterHours(String hours) {
        WebElement input = driver.findElement(hoursInput);
        input.clear();
        input.sendKeys(hours);
    }

    public void enterDate(String date) {
        List<WebElement> inputs = driver.findElements(By.cssSelector(".MuiDialog-root input"));
        for (WebElement input : inputs) {
            String type = input.getAttribute("type");
            String placeholder = input.getAttribute("placeholder");
            if (placeholder != null && (placeholder.contains("MM") || placeholder.contains("DD"))) {
                input.clear();
                input.sendKeys(date);
                return;
            }
        }
        if (inputs.size() >= 3) {
            WebElement dateField = inputs.get(2);
            dateField.sendKeys(Keys.chord(Keys.CONTROL, "a"));
            dateField.sendKeys(date);
        }
    }

    public void enterDescription(String description) {
        WebElement textarea = driver.findElement(descriptionInput);
        textarea.clear();
        textarea.sendKeys(description);
    }

    public void clickCreateButton() {
        click(createButton);
        waitUtils.waitForElementInvisible(dialogLoadingSpinner);
        waitUtils.sleep(500);
    }

    public void clickUpdateButton() {
        click(updateButton);
        waitUtils.waitForElementInvisible(dialogLoadingSpinner);
        waitUtils.sleep(500);
    }

    public void clickCancelButton() {
        click(cancelButton);
        waitUtils.sleep(300);
    }

    public void createWorkEntry(String clientName, String hours, String description) {
        clickAddWorkEntryButton();
        selectClient(clientName);
        enterHours(hours);
        if (description != null && !description.isEmpty()) {
            enterDescription(description);
        }
        clickCreateButton();
        waitForPageLoad();
    }

    public void createWorkEntryByClientIndex(int clientIndex, String hours, String description) {
        clickAddWorkEntryButton();
        selectClientByIndex(clientIndex);
        enterHours(hours);
        if (description != null && !description.isEmpty()) {
            enterDescription(description);
        }
        clickCreateButton();
        waitForPageLoad();
    }

    public boolean isWorkEntryInTable(String clientName, String hours) {
        List<WebElement> rows = getElements(workEntryRows);
        for (WebElement row : rows) {
            String rowText = row.getText();
            if (rowText.contains(clientName) && rowText.contains(hours)) {
                return true;
            }
        }
        return false;
    }

    public void editWorkEntry(String clientName) {
        List<WebElement> rows = getElements(workEntryRows);
        for (int i = 0; i < rows.size(); i++) {
            if (rows.get(i).getText().contains(clientName)) {
                List<WebElement> buttons = driver.findElements(By.cssSelector("table tbody tr:nth-child(" + (i + 1) + ") button"));
                for (WebElement btn : buttons) {
                    if (btn.getAttribute("innerHTML").contains("EditIcon") ||
                        btn.findElements(By.cssSelector("svg[data-testid='EditIcon']")).size() > 0) {
                        btn.click();
                        waitUtils.waitForElementVisible(dialogTitle);
                        return;
                    }
                }
                if (!buttons.isEmpty()) {
                    buttons.get(0).click();
                    waitUtils.waitForElementVisible(dialogTitle);
                    return;
                }
            }
        }
    }

    public void deleteWorkEntry(String clientName) {
        List<WebElement> rows = getElements(workEntryRows);
        for (int i = 0; i < rows.size(); i++) {
            if (rows.get(i).getText().contains(clientName)) {
                List<WebElement> buttons = driver.findElements(By.cssSelector("table tbody tr:nth-child(" + (i + 1) + ") button"));
                for (WebElement btn : buttons) {
                    if (btn.getAttribute("innerHTML").contains("DeleteIcon") ||
                        btn.findElements(By.cssSelector("svg[data-testid='DeleteIcon']")).size() > 0) {
                        btn.click();
                        acceptAlert();
                        waitUtils.sleep(500);
                        return;
                    }
                }
                if (buttons.size() > 1) {
                    buttons.get(1).click();
                    acceptAlert();
                    waitUtils.sleep(500);
                    return;
                }
            }
        }
    }

    public void updateWorkEntry(String newHours, String newDescription) {
        if (newHours != null && !newHours.isEmpty()) {
            enterHours(newHours);
        }
        if (newDescription != null) {
            enterDescription(newDescription);
        }
        clickUpdateButton();
        waitForPageLoad();
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

    public boolean isDialogOpen() {
        return isElementDisplayed(dialogTitle);
    }

    public String getDialogTitle() {
        try {
            return getText(dialogTitle);
        } catch (Exception e) {
            return null;
        }
    }

    public List<String> getWorkEntryClients() {
        List<WebElement> rows = getElements(workEntryRows);
        return rows.stream()
                .map(row -> {
                    List<WebElement> cells = row.findElements(By.tagName("td"));
                    return cells.isEmpty() ? "" : cells.get(0).getText();
                })
                .filter(name -> !name.isEmpty() && !name.contains("No work entries"))
                .toList();
    }
}
