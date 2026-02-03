package com.timesheet.pages;

import com.timesheet.utils.WaitUtils;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.StaleElementReferenceException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.PageFactory;
import org.openqa.selenium.support.ui.Select;

import java.util.List;

public abstract class BasePage {
    protected WebDriver driver;
    protected WaitUtils waitUtils;
    protected Actions actions;
    protected JavascriptExecutor jsExecutor;

    public BasePage(WebDriver driver) {
        this.driver = driver;
        this.waitUtils = new WaitUtils(driver);
        this.actions = new Actions(driver);
        this.jsExecutor = (JavascriptExecutor) driver;
        PageFactory.initElements(driver, this);
    }

    protected void click(By locator) {
        try {
            WebElement element = waitUtils.waitForElementClickable(locator);
            element.click();
        } catch (StaleElementReferenceException e) {
            WebElement element = waitUtils.waitForElementClickable(locator);
            element.click();
        }
    }

    protected void clickWithJS(By locator) {
        WebElement element = waitUtils.waitForElementPresent(locator);
        jsExecutor.executeScript("arguments[0].click();", element);
    }

    protected void type(By locator, String text) {
        WebElement element = waitUtils.waitForElementVisible(locator);
        element.clear();
        element.sendKeys(text);
    }

    protected void typeWithClear(By locator, String text) {
        WebElement element = waitUtils.waitForElementVisible(locator);
        element.clear();
        waitUtils.sleep(100);
        element.sendKeys(text);
    }

    protected String getText(By locator) {
        WebElement element = waitUtils.waitForElementVisible(locator);
        return element.getText();
    }

    protected String getAttribute(By locator, String attribute) {
        WebElement element = waitUtils.waitForElementPresent(locator);
        return element.getAttribute(attribute);
    }

    protected boolean isElementDisplayed(By locator) {
        try {
            return driver.findElement(locator).isDisplayed();
        } catch (NoSuchElementException e) {
            return false;
        }
    }

    protected boolean isElementEnabled(By locator) {
        try {
            return driver.findElement(locator).isEnabled();
        } catch (NoSuchElementException e) {
            return false;
        }
    }

    protected List<WebElement> getElements(By locator) {
        return driver.findElements(locator);
    }

    protected int getElementCount(By locator) {
        return driver.findElements(locator).size();
    }

    protected void selectByVisibleText(By locator, String text) {
        WebElement element = waitUtils.waitForElementVisible(locator);
        Select select = new Select(element);
        select.selectByVisibleText(text);
    }

    protected void selectByValue(By locator, String value) {
        WebElement element = waitUtils.waitForElementVisible(locator);
        Select select = new Select(element);
        select.selectByValue(value);
    }

    protected void selectByIndex(By locator, int index) {
        WebElement element = waitUtils.waitForElementVisible(locator);
        Select select = new Select(element);
        select.selectByIndex(index);
    }

    protected void scrollToElement(By locator) {
        WebElement element = waitUtils.waitForElementPresent(locator);
        jsExecutor.executeScript("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", element);
        waitUtils.sleep(300);
    }

    protected void scrollToTop() {
        jsExecutor.executeScript("window.scrollTo(0, 0);");
    }

    protected void scrollToBottom() {
        jsExecutor.executeScript("window.scrollTo(0, document.body.scrollHeight);");
    }

    protected void hoverOverElement(By locator) {
        WebElement element = waitUtils.waitForElementVisible(locator);
        actions.moveToElement(element).perform();
    }

    protected void waitForPageLoad() {
        waitUtils.waitForPageLoad();
    }

    public String getCurrentUrl() {
        return driver.getCurrentUrl();
    }

    public String getPageTitle() {
        return driver.getTitle();
    }

    public void navigateTo(String url) {
        driver.get(url);
        waitForPageLoad();
    }

    public void refreshPage() {
        driver.navigate().refresh();
        waitForPageLoad();
    }

    protected void acceptAlert() {
        try {
            driver.switchTo().alert().accept();
        } catch (Exception e) {
            System.err.println("No alert present to accept");
        }
    }

    protected void dismissAlert() {
        try {
            driver.switchTo().alert().dismiss();
        } catch (Exception e) {
            System.err.println("No alert present to dismiss");
        }
    }

    protected String getAlertText() {
        try {
            return driver.switchTo().alert().getText();
        } catch (Exception e) {
            return null;
        }
    }
}
