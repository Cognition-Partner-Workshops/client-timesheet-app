package com.foodsupplychain.oms.entity;

import org.junit.jupiter.api.Test;
import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

class CustomerTest {

    @Test
    void onCreate_setsCreatedAtAndUpdatedAt() {
        Customer customer = new Customer();
        customer.onCreate();

        assertNotNull(customer.getCreatedAt());
        assertNotNull(customer.getUpdatedAt());
    }

    @Test
    void onUpdate_setsUpdatedAt() {
        Customer customer = new Customer();
        customer.onCreate();

        customer.onUpdate();

        assertNotNull(customer.getUpdatedAt());
    }

    @Test
    void gettersAndSetters_workCorrectly() {
        Customer customer = new Customer();
        customer.setId(1L);
        customer.setName("Acme Corp");
        customer.setEmail("contact@acme.com");
        customer.setPhone("555-0200");
        customer.setAddress("456 Main St");
        customer.setCity("Chicago");
        customer.setState("IL");
        customer.setZipCode("60601");
        customer.setCountry("USA");
        customer.setBusinessName("Acme Corporation");
        customer.setTaxId("TAX-C001");
        customer.setCreditLimit(new BigDecimal("50000"));
        customer.setActive(true);

        assertEquals(1L, customer.getId());
        assertEquals("Acme Corp", customer.getName());
        assertEquals("contact@acme.com", customer.getEmail());
        assertEquals("555-0200", customer.getPhone());
        assertEquals("456 Main St", customer.getAddress());
        assertEquals("Chicago", customer.getCity());
        assertEquals("IL", customer.getState());
        assertEquals("60601", customer.getZipCode());
        assertEquals("USA", customer.getCountry());
        assertEquals("Acme Corporation", customer.getBusinessName());
        assertEquals("TAX-C001", customer.getTaxId());
        assertEquals(new BigDecimal("50000"), customer.getCreditLimit());
        assertTrue(customer.getActive());
    }
}
