package com.timesheet.pages;

import com.timesheet.utils.ConfigReader;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

public class LoginPage extends BasePage {

    private final By emailInput = By.id("email");
    private final By loginButton = By.cssSelector("button[type='submit']");
    private final By pageTitle = By.xpath("//h1[contains(text(), 'Time Tracker')]");
    private final By infoAlert = By.cssSelector(".MuiAlert-standardInfo");
    private final By errorAlert = By.cssSelector(".MuiAlert-standardError");
    private final By loadingSpinner = By.cssSelector(".MuiCircularProgress-root");

    public LoginPage(WebDriver driver) {
        super(driver);
    }

    public void navigateToLoginPage() {
        navigateTo(ConfigReader.getBaseUrl() + "/login");
        waitUtils.waitForElementVisible(emailInput);
    }

    public boolean isLoginPageDisplayed() {
        try {
            waitUtils.waitForElementVisible(pageTitle);
            return isElementDisplayed(pageTitle) && isElementDisplayed(emailInput);
        } catch (Exception e) {
            return false;
        }
    }

    public void enterEmail(String email) {
        typeWithClear(emailInput, email);
    }

    public void clickLoginButton() {
        click(loginButton);
    }

    public DashboardPage login(String email) {
        enterEmail(email);
        clickLoginButton();
        waitForLoginComplete();
        return new DashboardPage(driver);
    }

    public DashboardPage loginWithDefaultUser() {
        return login(ConfigReader.getTestUserEmail());
    }

    private void waitForLoginComplete() {
        waitUtils.waitForElementInvisible(loadingSpinner);
        waitUtils.waitForUrlContains("/dashboard");
    }

    public boolean isLoginButtonEnabled() {
        return isElementEnabled(loginButton);
    }

    public boolean isLoginButtonDisabled() {
        return !isLoginButtonEnabled();
    }

    public String getInfoAlertText() {
        try {
            return getText(infoAlert);
        } catch (Exception e) {
            return null;
        }
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

    public String getEmailInputValue() {
        return getAttribute(emailInput, "value");
    }

    public void clearEmailInput() {
        WebDriver.TargetLocator targetLocator = driver.switchTo();
        driver.findElement(emailInput).clear();
    }
}
