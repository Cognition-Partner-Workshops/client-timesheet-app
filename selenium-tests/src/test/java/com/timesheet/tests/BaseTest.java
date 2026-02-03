package com.timesheet.tests;

import com.aventstack.extentreports.ExtentReports;
import com.aventstack.extentreports.ExtentTest;
import com.aventstack.extentreports.Status;
import com.aventstack.extentreports.reporter.ExtentSparkReporter;
import com.timesheet.pages.DashboardPage;
import com.timesheet.pages.LoginPage;
import com.timesheet.utils.ConfigReader;
import com.timesheet.utils.DriverManager;
import com.timesheet.utils.ScreenshotUtils;
import org.openqa.selenium.WebDriver;
import org.testng.ITestResult;
import org.testng.annotations.AfterClass;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.AfterSuite;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.BeforeSuite;

import java.io.File;
import java.lang.reflect.Method;

public class BaseTest {
    protected WebDriver driver;
    protected LoginPage loginPage;
    protected DashboardPage dashboardPage;
    
    private static ExtentReports extent;
    private static final ThreadLocal<ExtentTest> extentTest = new ThreadLocal<>();

    @BeforeSuite
    public void setupSuite() {
        String reportPath = ConfigReader.getReportPath();
        File reportDir = new File(reportPath);
        if (!reportDir.exists()) {
            reportDir.mkdirs();
        }
        
        ExtentSparkReporter sparkReporter = new ExtentSparkReporter(reportPath + "/TestReport.html");
        sparkReporter.config().setDocumentTitle("Client Timesheet App - Test Report");
        sparkReporter.config().setReportName("Selenium Automation Test Results");
        
        extent = new ExtentReports();
        extent.attachReporter(sparkReporter);
        extent.setSystemInfo("Application", "Client Timesheet App");
        extent.setSystemInfo("Browser", ConfigReader.getBrowser());
        extent.setSystemInfo("Environment", "Test");
    }

    @BeforeClass
    public void setupClass() {
        DriverManager.initializeDriver();
        driver = DriverManager.getDriver();
    }

    @BeforeMethod
    public void setupMethod(Method method) {
        ExtentTest test = extent.createTest(method.getName());
        extentTest.set(test);
        logInfo("Starting test: " + method.getName());
    }

    @AfterMethod
    public void teardownMethod(ITestResult result) {
        if (result.getStatus() == ITestResult.FAILURE) {
            String screenshotPath = ScreenshotUtils.takeScreenshotOnFailure(driver, result.getName());
            logFail("Test failed: " + result.getThrowable().getMessage());
            if (screenshotPath != null) {
                try {
                    extentTest.get().addScreenCaptureFromPath(screenshotPath);
                } catch (Exception e) {
                    logWarning("Could not attach screenshot: " + e.getMessage());
                }
            }
        } else if (result.getStatus() == ITestResult.SKIP) {
            logSkip("Test skipped: " + result.getThrowable().getMessage());
        } else {
            logPass("Test passed");
        }
    }

    @AfterClass
    public void teardownClass() {
        DriverManager.quitDriver();
    }

    @AfterSuite
    public void teardownSuite() {
        if (extent != null) {
            extent.flush();
        }
    }

    protected void loginAsDefaultUser() {
        loginPage = new LoginPage(driver);
        loginPage.navigateToLoginPage();
        dashboardPage = loginPage.loginWithDefaultUser();
        dashboardPage.waitForDashboardLoad();
    }

    protected void logInfo(String message) {
        System.out.println("[INFO] " + message);
        if (extentTest.get() != null) {
            extentTest.get().log(Status.INFO, message);
        }
    }

    protected void logPass(String message) {
        System.out.println("[PASS] " + message);
        if (extentTest.get() != null) {
            extentTest.get().log(Status.PASS, message);
        }
    }

    protected void logFail(String message) {
        System.err.println("[FAIL] " + message);
        if (extentTest.get() != null) {
            extentTest.get().log(Status.FAIL, message);
        }
    }

    protected void logWarning(String message) {
        System.out.println("[WARN] " + message);
        if (extentTest.get() != null) {
            extentTest.get().log(Status.WARNING, message);
        }
    }

    protected void logSkip(String message) {
        System.out.println("[SKIP] " + message);
        if (extentTest.get() != null) {
            extentTest.get().log(Status.SKIP, message);
        }
    }
}
