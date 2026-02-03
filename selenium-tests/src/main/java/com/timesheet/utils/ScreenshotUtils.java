package com.timesheet.utils;

import org.apache.commons.io.FileUtils;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.WebDriver;

import java.io.File;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Date;

public class ScreenshotUtils {

    public static String takeScreenshot(WebDriver driver, String testName) {
        if (driver == null) {
            return null;
        }

        String screenshotDir = ConfigReader.getScreenshotPath();
        File directory = new File(screenshotDir);
        if (!directory.exists()) {
            directory.mkdirs();
        }

        String timestamp = new SimpleDateFormat("yyyyMMdd_HHmmss").format(new Date());
        String fileName = testName + "_" + timestamp + ".png";
        String filePath = screenshotDir + File.separator + fileName;

        try {
            TakesScreenshot ts = (TakesScreenshot) driver;
            File source = ts.getScreenshotAs(OutputType.FILE);
            File destination = new File(filePath);
            FileUtils.copyFile(source, destination);
            System.out.println("Screenshot saved: " + filePath);
            return filePath;
        } catch (IOException e) {
            System.err.println("Failed to save screenshot: " + e.getMessage());
            return null;
        }
    }

    public static String takeScreenshotOnFailure(WebDriver driver, String testName) {
        if (ConfigReader.isScreenshotOnFailure()) {
            return takeScreenshot(driver, testName + "_FAILED");
        }
        return null;
    }
}
