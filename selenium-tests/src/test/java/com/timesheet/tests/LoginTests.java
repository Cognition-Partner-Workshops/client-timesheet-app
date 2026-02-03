package com.timesheet.tests;

import com.timesheet.pages.DashboardPage;
import com.timesheet.pages.LoginPage;
import com.timesheet.utils.ConfigReader;
import org.testng.Assert;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

public class LoginTests extends BaseTest {

    private LoginPage loginPage;

    @BeforeMethod
    public void setup() {
        loginPage = new LoginPage(driver);
        loginPage.navigateToLoginPage();
    }

    @Test(priority = 1, description = "Verify login page is displayed correctly")
    public void testLoginPageDisplayed() {
        logInfo("Verifying login page is displayed");
        Assert.assertTrue(loginPage.isLoginPageDisplayed(), "Login page should be displayed");
        logInfo("Login page displayed successfully");
    }

    @Test(priority = 2, description = "Verify info alert about no password is displayed")
    public void testInfoAlertDisplayed() {
        logInfo("Verifying info alert is displayed");
        String infoText = loginPage.getInfoAlertText();
        Assert.assertNotNull(infoText, "Info alert should be displayed");
        Assert.assertTrue(infoText.contains("password"), "Info alert should mention password");
        logInfo("Info alert displayed: " + infoText);
    }

    @Test(priority = 3, description = "Verify login button is disabled when email is empty")
    public void testLoginButtonDisabledWhenEmailEmpty() {
        logInfo("Verifying login button is disabled when email is empty");
        loginPage.clearEmailInput();
        Assert.assertTrue(loginPage.isLoginButtonDisabled(), "Login button should be disabled when email is empty");
        logInfo("Login button is correctly disabled");
    }

    @Test(priority = 4, description = "Verify login button is enabled when email is entered")
    public void testLoginButtonEnabledWhenEmailEntered() {
        logInfo("Verifying login button is enabled when email is entered");
        loginPage.enterEmail("test@example.com");
        Assert.assertTrue(loginPage.isLoginButtonEnabled(), "Login button should be enabled when email is entered");
        logInfo("Login button is correctly enabled");
    }

    @Test(priority = 5, description = "Verify successful login with valid email")
    public void testSuccessfulLogin() {
        logInfo("Testing successful login with valid email");
        String testEmail = ConfigReader.getTestUserEmail();
        DashboardPage dashboard = loginPage.login(testEmail);
        
        Assert.assertTrue(dashboard.isDashboardDisplayed(), "Dashboard should be displayed after login");
        Assert.assertTrue(driver.getCurrentUrl().contains("/dashboard"), "URL should contain /dashboard");
        logInfo("Login successful, redirected to dashboard");
    }

    @Test(priority = 6, description = "Verify user email is displayed after login")
    public void testUserEmailDisplayedAfterLogin() {
        logInfo("Testing user email is displayed after login");
        String testEmail = ConfigReader.getTestUserEmail();
        DashboardPage dashboard = loginPage.login(testEmail);
        
        String displayedEmail = dashboard.getLoggedInUserEmail();
        Assert.assertNotNull(displayedEmail, "User email should be displayed");
        Assert.assertEquals(displayedEmail, testEmail, "Displayed email should match login email");
        logInfo("User email displayed correctly: " + displayedEmail);
    }

    @Test(priority = 7, description = "Verify login with different email formats")
    public void testLoginWithDifferentEmailFormats() {
        logInfo("Testing login with different email format");
        String testEmail = "user.name+tag@example.org";
        DashboardPage dashboard = loginPage.login(testEmail);
        
        Assert.assertTrue(dashboard.isDashboardDisplayed(), "Dashboard should be displayed after login");
        logInfo("Login successful with email: " + testEmail);
    }

    @Test(priority = 8, description = "Verify email input accepts valid email")
    public void testEmailInputAcceptsValidEmail() {
        logInfo("Testing email input accepts valid email");
        String testEmail = "valid@email.com";
        loginPage.enterEmail(testEmail);
        
        String inputValue = loginPage.getEmailInputValue();
        Assert.assertEquals(inputValue, testEmail, "Email input should contain the entered email");
        logInfo("Email input correctly accepts: " + testEmail);
    }
}
