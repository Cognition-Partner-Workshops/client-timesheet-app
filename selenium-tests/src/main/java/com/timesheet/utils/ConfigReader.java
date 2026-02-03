package com.timesheet.utils;

import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

public class ConfigReader {
    private static Properties properties;
    private static final String CONFIG_FILE = "src/test/resources/config.properties";

    static {
        loadProperties();
    }

    private static void loadProperties() {
        properties = new Properties();
        try (InputStream input = new FileInputStream(CONFIG_FILE)) {
            properties.load(input);
        } catch (IOException e) {
            throw new RuntimeException("Failed to load configuration file: " + CONFIG_FILE, e);
        }
    }

    public static String getProperty(String key) {
        String value = properties.getProperty(key);
        if (value == null) {
            throw new RuntimeException("Property not found: " + key);
        }
        return value;
    }

    public static String getProperty(String key, String defaultValue) {
        return properties.getProperty(key, defaultValue);
    }

    public static String getBaseUrl() {
        return getProperty("base.url");
    }

    public static String getBrowser() {
        return getProperty("browser", "chrome");
    }

    public static boolean isHeadless() {
        return Boolean.parseBoolean(getProperty("headless", "true"));
    }

    public static int getImplicitWait() {
        return Integer.parseInt(getProperty("implicit.wait", "10"));
    }

    public static int getExplicitWait() {
        return Integer.parseInt(getProperty("explicit.wait", "15"));
    }

    public static int getPageLoadTimeout() {
        return Integer.parseInt(getProperty("page.load.timeout", "30"));
    }

    public static String getTestUserEmail() {
        return getProperty("test.user.email");
    }

    public static boolean isScreenshotOnFailure() {
        return Boolean.parseBoolean(getProperty("screenshot.on.failure", "true"));
    }

    public static String getScreenshotPath() {
        return getProperty("screenshot.path", "target/screenshots");
    }

    public static String getReportPath() {
        return getProperty("report.path", "target/reports");
    }
}
