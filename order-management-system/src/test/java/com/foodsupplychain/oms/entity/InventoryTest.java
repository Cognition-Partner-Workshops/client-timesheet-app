package com.foodsupplychain.oms.entity;

import org.junit.jupiter.api.Test;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class InventoryTest {

    @Test
    void onCreate_setsCreatedAtAndUpdatedAt() {
        Inventory inventory = new Inventory();
        inventory.onCreate();

        assertNotNull(inventory.getCreatedAt());
        assertNotNull(inventory.getUpdatedAt());
    }

    @Test
    void onUpdate_setsUpdatedAt() {
        Inventory inventory = new Inventory();
        inventory.onCreate();

        inventory.onUpdate();

        assertNotNull(inventory.getUpdatedAt());
    }

    @Test
    void gettersAndSetters_workCorrectly() {
        Inventory inventory = new Inventory();
        Product product = new Product();
        product.setId(1L);
        LocalDateTime now = LocalDateTime.now();

        inventory.setId(1L);
        inventory.setProduct(product);
        inventory.setQuantityOnHand(100);
        inventory.setReorderLevel(20);
        inventory.setReorderQuantity(50);
        inventory.setWarehouseLocation("WH-A");
        inventory.setLastRestockedAt(now);
        inventory.setCreatedAt(now);
        inventory.setUpdatedAt(now);

        assertEquals(1L, inventory.getId());
        assertEquals(product, inventory.getProduct());
        assertEquals(100, inventory.getQuantityOnHand());
        assertEquals(20, inventory.getReorderLevel());
        assertEquals(50, inventory.getReorderQuantity());
        assertEquals("WH-A", inventory.getWarehouseLocation());
        assertEquals(now, inventory.getLastRestockedAt());
        assertEquals(now, inventory.getCreatedAt());
        assertEquals(now, inventory.getUpdatedAt());
    }
}
