package com.foodsupplychain.oms.entity;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class SupplierTest {

    @Test
    void onCreate_setsCreatedAtAndUpdatedAt() {
        Supplier supplier = new Supplier();
        supplier.onCreate();

        assertNotNull(supplier.getCreatedAt());
        assertNotNull(supplier.getUpdatedAt());
    }

    @Test
    void onUpdate_setsUpdatedAt() {
        Supplier supplier = new Supplier();
        supplier.onCreate();

        supplier.onUpdate();

        assertNotNull(supplier.getUpdatedAt());
    }

    @Test
    void gettersAndSetters_workCorrectly() {
        Supplier supplier = new Supplier();
        supplier.setId(1L);
        supplier.setName("Fresh Farms");
        supplier.setContactPerson("John Doe");
        supplier.setEmail("john@freshfarms.com");
        supplier.setPhone("555-0100");
        supplier.setAddress("123 Farm Rd");
        supplier.setCity("Springfield");
        supplier.setState("IL");
        supplier.setZipCode("62701");
        supplier.setCountry("USA");
        supplier.setTaxId("TAX-001");
        supplier.setPaymentTerms("Net 30");
        supplier.setActive(true);

        assertEquals(1L, supplier.getId());
        assertEquals("Fresh Farms", supplier.getName());
        assertEquals("John Doe", supplier.getContactPerson());
        assertEquals("john@freshfarms.com", supplier.getEmail());
        assertEquals("555-0100", supplier.getPhone());
        assertEquals("123 Farm Rd", supplier.getAddress());
        assertEquals("Springfield", supplier.getCity());
        assertEquals("IL", supplier.getState());
        assertEquals("62701", supplier.getZipCode());
        assertEquals("USA", supplier.getCountry());
        assertEquals("TAX-001", supplier.getTaxId());
        assertEquals("Net 30", supplier.getPaymentTerms());
        assertTrue(supplier.getActive());
    }
}
