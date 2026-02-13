package com.foodsupplychain.oms.entity;

import com.foodsupplychain.oms.enums.OrderStatus;
import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class OrderTest {

    @Test
    void onCreate_setsTimestampsAndOrderNumber() {
        Order order = new Order();
        order.onCreate();

        assertNotNull(order.getCreatedAt());
        assertNotNull(order.getUpdatedAt());
        assertNotNull(order.getOrderNumber());
        assertTrue(order.getOrderNumber().startsWith("ORD-"));
    }

    @Test
    void onCreate_doesNotOverrideExistingOrderNumber() {
        Order order = new Order();
        order.setOrderNumber("ORD-EXISTING");
        order.onCreate();

        assertEquals("ORD-EXISTING", order.getOrderNumber());
    }

    @Test
    void onUpdate_setsUpdatedAt() {
        Order order = new Order();
        order.onCreate();

        order.onUpdate();

        assertNotNull(order.getUpdatedAt());
    }

    @Test
    void recalculateTotal_withItems_calculatesCorrectly() {
        Order order = new Order();
        Product product = new Product();
        product.setId(1L);

        OrderItem item1 = new OrderItem();
        item1.setQuantity(10);
        item1.setUnitPrice(new BigDecimal("5.00"));
        item1.setProduct(product);

        OrderItem item2 = new OrderItem();
        item2.setQuantity(5);
        item2.setUnitPrice(new BigDecimal("10.00"));
        item2.setProduct(product);

        order.setItems(List.of(item1, item2));
        order.recalculateTotal();

        assertEquals(new BigDecimal("100.00"), order.getTotalAmount());
    }

    @Test
    void recalculateTotal_withEmptyItems_returnsZero() {
        Order order = new Order();
        order.setItems(new ArrayList<>());
        order.recalculateTotal();

        assertEquals(BigDecimal.ZERO, order.getTotalAmount());
    }

    @Test
    void gettersAndSetters_workCorrectly() {
        Order order = new Order();
        Customer customer = new Customer();
        customer.setId(1L);
        Supplier supplier = new Supplier();
        supplier.setId(1L);

        order.setId(1L);
        order.setOrderNumber("ORD-TEST");
        order.setCustomer(customer);
        order.setSupplier(supplier);
        order.setStatus(OrderStatus.PENDING);
        order.setTotalAmount(new BigDecimal("100.00"));
        order.setShippingAddress("123 Main St");
        order.setDeliveryDate(LocalDate.of(2026, 3, 1));
        order.setNotes("Test notes");
        order.setItems(new ArrayList<>());

        assertEquals(1L, order.getId());
        assertEquals("ORD-TEST", order.getOrderNumber());
        assertEquals(customer, order.getCustomer());
        assertEquals(supplier, order.getSupplier());
        assertEquals(OrderStatus.PENDING, order.getStatus());
        assertEquals(new BigDecimal("100.00"), order.getTotalAmount());
        assertEquals("123 Main St", order.getShippingAddress());
        assertEquals(LocalDate.of(2026, 3, 1), order.getDeliveryDate());
        assertEquals("Test notes", order.getNotes());
        assertNotNull(order.getItems());
    }

    @Test
    void defaultStatus_isPending() {
        Order order = new Order();
        assertEquals(OrderStatus.PENDING, order.getStatus());
    }
}
