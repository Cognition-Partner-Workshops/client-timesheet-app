package com.foodsupplychain.oms.entity;

import com.foodsupplychain.oms.enums.ProductCategory;
import org.junit.jupiter.api.Test;
import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

class ProductTest {

    @Test
    void onCreate_setsCreatedAtAndUpdatedAt() {
        Product product = new Product();
        product.onCreate();

        assertNotNull(product.getCreatedAt());
        assertNotNull(product.getUpdatedAt());
    }

    @Test
    void onUpdate_setsUpdatedAt() {
        Product product = new Product();
        product.onCreate();
        var createdAt = product.getCreatedAt();

        product.onUpdate();

        assertNotNull(product.getUpdatedAt());
        assertEquals(createdAt, product.getCreatedAt());
    }

    @Test
    void gettersAndSetters_workCorrectly() {
        Product product = new Product();
        product.setId(1L);
        product.setName("Organic Milk");
        product.setDescription("Fresh milk");
        product.setSku("DAIRY-001");
        product.setCategory(ProductCategory.DAIRY);
        product.setPrice(new BigDecimal("4.99"));
        product.setUnit("gallon");
        product.setShelfLifeDays(14);
        product.setStorageTemperature("2-6°C");

        assertEquals(1L, product.getId());
        assertEquals("Organic Milk", product.getName());
        assertEquals("Fresh milk", product.getDescription());
        assertEquals("DAIRY-001", product.getSku());
        assertEquals(ProductCategory.DAIRY, product.getCategory());
        assertEquals(new BigDecimal("4.99"), product.getPrice());
        assertEquals("gallon", product.getUnit());
        assertEquals(14, product.getShelfLifeDays());
        assertEquals("2-6°C", product.getStorageTemperature());
    }
}
