package com.foodsupplychain.oms.entity;

import org.junit.jupiter.api.Test;
import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

class OrderItemTest {

    @Test
    void calculateSubtotal_withValidValues_calculatesCorrectly() {
        OrderItem item = new OrderItem();
        item.setQuantity(10);
        item.setUnitPrice(new BigDecimal("5.00"));
        item.calculateSubtotal();

        assertEquals(new BigDecimal("50.00"), item.getSubtotal());
    }

    @Test
    void calculateSubtotal_withNullQuantity_doesNotCalculate() {
        OrderItem item = new OrderItem();
        item.setQuantity(null);
        item.setUnitPrice(new BigDecimal("5.00"));
        item.calculateSubtotal();

        assertEquals(BigDecimal.ZERO, item.getSubtotal());
    }

    @Test
    void calculateSubtotal_withNullUnitPrice_doesNotCalculate() {
        OrderItem item = new OrderItem();
        item.setQuantity(10);
        item.setUnitPrice(null);
        item.calculateSubtotal();

        assertEquals(BigDecimal.ZERO, item.getSubtotal());
    }

    @Test
    void getSubtotal_withValidValues_calculatesOnTheFly() {
        OrderItem item = new OrderItem();
        item.setQuantity(3);
        item.setUnitPrice(new BigDecimal("7.50"));

        assertEquals(new BigDecimal("22.50"), item.getSubtotal());
    }

    @Test
    void getSubtotal_withNullQuantity_returnsZero() {
        OrderItem item = new OrderItem();
        item.setQuantity(null);
        item.setUnitPrice(new BigDecimal("5.00"));

        assertEquals(BigDecimal.ZERO, item.getSubtotal());
    }

    @Test
    void getSubtotal_withNullUnitPrice_returnsZero() {
        OrderItem item = new OrderItem();
        item.setQuantity(10);
        item.setUnitPrice(null);

        assertEquals(BigDecimal.ZERO, item.getSubtotal());
    }

    @Test
    void gettersAndSetters_workCorrectly() {
        OrderItem item = new OrderItem();
        Order order = new Order();
        Product product = new Product();

        item.setId(1L);
        item.setOrder(order);
        item.setProduct(product);
        item.setQuantity(5);
        item.setUnitPrice(new BigDecimal("10.00"));
        item.setSubtotal(new BigDecimal("50.00"));

        assertEquals(1L, item.getId());
        assertEquals(order, item.getOrder());
        assertEquals(product, item.getProduct());
        assertEquals(5, item.getQuantity());
        assertEquals(new BigDecimal("10.00"), item.getUnitPrice());
    }
}
