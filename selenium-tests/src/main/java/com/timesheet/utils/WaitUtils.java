package com.timesheet.utils;

import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.StaleElementReferenceException;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedCondition;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.FluentWait;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;
import java.util.List;

public class WaitUtils {
    private final WebDriver driver;
    private final WebDriverWait wait;
    private final int explicitWait;

    public WaitUtils(WebDriver driver) {
        this.driver = driver;
        this.explicitWait = ConfigReader.getExplicitWait();
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(explicitWait));
    }

    public WebElement waitForElementVisible(By locator) {
        try {
            return wait.until(ExpectedConditions.visibilityOfElementLocated(locator));
        } catch (TimeoutException e) {
            throw new TimeoutException("Element not visible after " + explicitWait + " seconds: " + locator, e);
        }
    }

    public WebElement waitForElementClickable(By locator) {
        try {
            return wait.until(ExpectedConditions.elementToBeClickable(locator));
        } catch (TimeoutException e) {
            throw new TimeoutException("Element not clickable after " + explicitWait + " seconds: " + locator, e);
        }
    }

    public WebElement waitForElementPresent(By locator) {
        try {
            return wait.until(ExpectedConditions.presenceOfElementLocated(locator));
        } catch (TimeoutException e) {
            throw new TimeoutException("Element not present after " + explicitWait + " seconds: " + locator, e);
        }
    }

    public List<WebElement> waitForElementsVisible(By locator) {
        try {
            return wait.until(ExpectedConditions.visibilityOfAllElementsLocatedBy(locator));
        } catch (TimeoutException e) {
            throw new TimeoutException("Elements not visible after " + explicitWait + " seconds: " + locator, e);
        }
    }

    public boolean waitForElementInvisible(By locator) {
        try {
            return wait.until(ExpectedConditions.invisibilityOfElementLocated(locator));
        } catch (TimeoutException e) {
            return false;
        }
    }

    public void waitForTextPresent(By locator, String text) {
        try {
            wait.until(ExpectedConditions.textToBePresentInElementLocated(locator, text));
        } catch (TimeoutException e) {
            throw new TimeoutException("Text '" + text + "' not present in element after " + explicitWait + " seconds: " + locator, e);
        }
    }

    public void waitForPageLoad() {
        wait.until((ExpectedCondition<Boolean>) driver -> {
            JavascriptExecutor js = (JavascriptExecutor) driver;
            return js.executeScript("return document.readyState").equals("complete");
        });
    }

    public void waitForAjaxComplete() {
        wait.until((ExpectedCondition<Boolean>) driver -> {
            JavascriptExecutor js = (JavascriptExecutor) driver;
            return (Boolean) js.executeScript("return (typeof jQuery === 'undefined') || jQuery.active === 0");
        });
    }

    public WebElement waitForElementWithRetry(By locator, int maxRetries) {
        FluentWait<WebDriver> fluentWait = new FluentWait<>(driver)
                .withTimeout(Duration.ofSeconds(explicitWait))
                .pollingEvery(Duration.ofMillis(500))
                .ignoring(NoSuchElementException.class)
                .ignoring(StaleElementReferenceException.class);

        int attempts = 0;
        while (attempts < maxRetries) {
            try {
                return fluentWait.until(ExpectedConditions.visibilityOfElementLocated(locator));
            } catch (TimeoutException e) {
                attempts++;
                if (attempts >= maxRetries) {
                    throw new TimeoutException("Element not found after " + maxRetries + " retries: " + locator, e);
                }
            }
        }
        throw new TimeoutException("Element not found: " + locator);
    }

    public void waitForUrlContains(String urlPart) {
        try {
            wait.until(ExpectedConditions.urlContains(urlPart));
        } catch (TimeoutException e) {
            throw new TimeoutException("URL does not contain '" + urlPart + "' after " + explicitWait + " seconds", e);
        }
    }

    public void waitForAttributeContains(By locator, String attribute, String value) {
        try {
            wait.until(ExpectedConditions.attributeContains(locator, attribute, value));
        } catch (TimeoutException e) {
            throw new TimeoutException("Attribute '" + attribute + "' does not contain '" + value + "' after " + explicitWait + " seconds: " + locator, e);
        }
    }

    public void sleep(long milliseconds) {
        try {
            Thread.sleep(milliseconds);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}
