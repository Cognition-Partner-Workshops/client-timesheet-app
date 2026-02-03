package com.timesheet.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

import java.util.List;

public class ClientsPage extends BasePage {

    private final By pageTitle = By.xpath("//h4[contains(text(), 'Clients')]");
    private final By addClientButton = By.xpath("//button[contains(., 'Add Client')]");
    private final By clearAllButton = By.xpath("//button[contains(., 'Clear All')]");
    private final By clientsTable = By.cssSelector("table");
    private final By clientRows = By.cssSelector("table tbody tr");
    private final By noClientsMessage = By.xpath("//*[contains(text(), 'No clients found')]");
    private final By loadingSpinner = By.cssSelector(".MuiCircularProgress-root");
    private final By errorAlert = By.cssSelector(".MuiAlert-standardError");

    private final By dialogTitle = By.cssSelector(".MuiDialogTitle-root");
    private final By clientNameInput = By.cssSelector("input[label='Client Name'], .MuiDialog-root input:first-of-type");
    private final By departmentInput = By.cssSelector("input[label='Department']");
    private final By emailInput = By.cssSelector("input[type='email']");
    private final By descriptionInput = By.cssSelector("textarea");
    private final By cancelButton = By.xpath("//button[contains(text(), 'Cancel')]");
    private final By createButton = By.xpath("//button[contains(text(), 'Create')]");
    private final By updateButton = By.xpath("//button[contains(text(), 'Update')]");
    private final By dialogLoadingSpinner = By.cssSelector(".MuiDialog-root .MuiCircularProgress-root");

    private final By editButtons = By.cssSelector("button[color='primary'] svg[data-testid='EditIcon'], button svg[data-testid='EditIcon']");
    private final By deleteButtons = By.cssSelector("button[color='error'] svg[data-testid='DeleteIcon'], button svg[data-testid='DeleteIcon']");

    public ClientsPage(WebDriver driver) {
        super(driver);
    }

    public boolean isClientsPageDisplayed() {
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

    public void clickAddClientButton() {
        click(addClientButton);
        waitUtils.waitForElementVisible(dialogTitle);
    }

    public boolean isClearAllButtonDisplayed() {
        return isElementDisplayed(clearAllButton);
    }

    public void clickClearAllButton() {
        click(clearAllButton);
    }

    public void confirmClearAll() {
        acceptAlert();
        waitUtils.sleep(1000);
    }

    public void clearAllClients() {
        if (isClearAllButtonDisplayed()) {
            clickClearAllButton();
            confirmClearAll();
            waitForPageLoad();
        }
    }

    public int getClientCount() {
        if (isElementDisplayed(noClientsMessage)) {
            return 0;
        }
        List<WebElement> rows = getElements(clientRows);
        if (rows.size() == 1 && rows.get(0).getText().contains("No clients found")) {
            return 0;
        }
        return rows.size();
    }

    public boolean hasNoClients() {
        return isElementDisplayed(noClientsMessage) || getClientCount() == 0;
    }

    public void enterClientName(String name) {
        List<WebElement> inputs = driver.findElements(By.cssSelector(".MuiDialog-root input"));
        if (!inputs.isEmpty()) {
            inputs.get(0).clear();
            inputs.get(0).sendKeys(name);
        }
    }

    public void enterDepartment(String department) {
        List<WebElement> inputs = driver.findElements(By.cssSelector(".MuiDialog-root input"));
        if (inputs.size() > 1) {
            inputs.get(1).clear();
            inputs.get(1).sendKeys(department);
        }
    }

    public void enterEmail(String email) {
        List<WebElement> inputs = driver.findElements(By.cssSelector(".MuiDialog-root input"));
        if (inputs.size() > 2) {
            inputs.get(2).clear();
            inputs.get(2).sendKeys(email);
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

    public void createClient(String name, String department, String email, String description) {
        clickAddClientButton();
        enterClientName(name);
        if (department != null && !department.isEmpty()) {
            enterDepartment(department);
        }
        if (email != null && !email.isEmpty()) {
            enterEmail(email);
        }
        if (description != null && !description.isEmpty()) {
            enterDescription(description);
        }
        clickCreateButton();
        waitForPageLoad();
    }

    public void createClient(String name) {
        createClient(name, null, null, null);
    }

    public boolean isClientInTable(String clientName) {
        List<WebElement> rows = getElements(clientRows);
        for (WebElement row : rows) {
            if (row.getText().contains(clientName)) {
                return true;
            }
        }
        return false;
    }

    public void editClient(String clientName) {
        List<WebElement> rows = getElements(clientRows);
        for (int i = 0; i < rows.size(); i++) {
            if (rows.get(i).getText().contains(clientName)) {
                List<WebElement> editBtns = driver.findElements(By.cssSelector("table tbody tr:nth-child(" + (i + 1) + ") button"));
                for (WebElement btn : editBtns) {
                    if (btn.getAttribute("innerHTML").contains("EditIcon") || 
                        btn.findElements(By.cssSelector("svg[data-testid='EditIcon']")).size() > 0) {
                        btn.click();
                        waitUtils.waitForElementVisible(dialogTitle);
                        return;
                    }
                }
                if (!editBtns.isEmpty()) {
                    editBtns.get(0).click();
                    waitUtils.waitForElementVisible(dialogTitle);
                    return;
                }
            }
        }
    }

    public void deleteClient(String clientName) {
        List<WebElement> rows = getElements(clientRows);
        for (int i = 0; i < rows.size(); i++) {
            if (rows.get(i).getText().contains(clientName)) {
                List<WebElement> deleteBtns = driver.findElements(By.cssSelector("table tbody tr:nth-child(" + (i + 1) + ") button"));
                for (WebElement btn : deleteBtns) {
                    if (btn.getAttribute("innerHTML").contains("DeleteIcon") ||
                        btn.findElements(By.cssSelector("svg[data-testid='DeleteIcon']")).size() > 0) {
                        btn.click();
                        acceptAlert();
                        waitUtils.sleep(500);
                        return;
                    }
                }
                if (deleteBtns.size() > 1) {
                    deleteBtns.get(1).click();
                    acceptAlert();
                    waitUtils.sleep(500);
                    return;
                }
            }
        }
    }

    public void updateClient(String newName, String newDepartment, String newEmail, String newDescription) {
        if (newName != null && !newName.isEmpty()) {
            enterClientName(newName);
        }
        if (newDepartment != null) {
            enterDepartment(newDepartment);
        }
        if (newEmail != null) {
            enterEmail(newEmail);
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

    public void closeErrorAlert() {
        try {
            WebElement closeBtn = driver.findElement(By.cssSelector(".MuiAlert-standardError button"));
            closeBtn.click();
        } catch (Exception e) {
        }
    }

    public List<String> getClientNames() {
        List<WebElement> rows = getElements(clientRows);
        return rows.stream()
                .map(row -> {
                    List<WebElement> cells = row.findElements(By.tagName("td"));
                    return cells.isEmpty() ? "" : cells.get(0).getText();
                })
                .filter(name -> !name.isEmpty() && !name.contains("No clients found"))
                .toList();
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
}
