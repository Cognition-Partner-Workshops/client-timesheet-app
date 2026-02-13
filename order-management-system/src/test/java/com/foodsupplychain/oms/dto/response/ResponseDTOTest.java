package com.foodsupplychain.oms.dto.response;

import com.foodsupplychain.oms.entity.*;
import com.foodsupplychain.oms.enums.OrderStatus;
import com.foodsupplychain.oms.enums.ProductCategory;
import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class ResponseDTOTest {

    @Test
    void productResponse_fromEntity_mapsAllFields() {
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

        ProductResponse response = ProductResponse.fromEntity(product);

        assertEquals(1L, response.getId());
        assertEquals("Organic Milk", response.getName());
        assertEquals("Fresh milk", response.getDescription());
        assertEquals("DAIRY-001", response.getSku());
        assertEquals(ProductCategory.DAIRY, response.getCategory());
        assertEquals(new BigDecimal("4.99"), response.getPrice());
        assertEquals("gallon", response.getUnit());
        assertEquals(14, response.getShelfLifeDays());
        assertEquals("2-6°C", response.getStorageTemperature());
    }

    @Test
    void supplierResponse_fromEntity_mapsAllFields() {
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
        supplier.setPaymentTerms("Net 30");
        supplier.setActive(true);

        SupplierResponse response = SupplierResponse.fromEntity(supplier);

        assertEquals(1L, response.getId());
        assertEquals("Fresh Farms", response.getName());
        assertEquals("John Doe", response.getContactPerson());
        assertEquals("john@freshfarms.com", response.getEmail());
        assertEquals("555-0100", response.getPhone());
        assertEquals("123 Farm Rd", response.getAddress());
        assertEquals("Springfield", response.getCity());
        assertEquals("IL", response.getState());
        assertEquals("62701", response.getZipCode());
        assertEquals("USA", response.getCountry());
        assertEquals("Net 30", response.getPaymentTerms());
        assertTrue(response.getActive());
    }

    @Test
    void customerResponse_fromEntity_mapsAllFields() {
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
        customer.setCreditLimit(new BigDecimal("50000"));
        customer.setActive(true);

        CustomerResponse response = CustomerResponse.fromEntity(customer);

        assertEquals(1L, response.getId());
        assertEquals("Acme Corp", response.getName());
        assertEquals("contact@acme.com", response.getEmail());
        assertEquals("555-0200", response.getPhone());
        assertEquals("456 Main St", response.getAddress());
        assertEquals("Chicago", response.getCity());
        assertEquals("IL", response.getState());
        assertEquals("60601", response.getZipCode());
        assertEquals("USA", response.getCountry());
        assertEquals("Acme Corporation", response.getBusinessName());
        assertEquals(new BigDecimal("50000"), response.getCreditLimit());
        assertTrue(response.getActive());
    }

    @Test
    void inventoryResponse_fromEntity_mapsAllFields() {
        Product product = new Product();
        product.setId(1L);
        product.setName("Organic Milk");
        product.setSku("DAIRY-001");

        Inventory inventory = new Inventory();
        inventory.setId(1L);
        inventory.setProduct(product);
        inventory.setQuantityOnHand(100);
        inventory.setReorderLevel(20);
        inventory.setReorderQuantity(50);
        inventory.setWarehouseLocation("WH-A");
        LocalDateTime now = LocalDateTime.now();
        inventory.setLastRestockedAt(now);

        InventoryResponse response = InventoryResponse.fromEntity(inventory);

        assertEquals(1L, response.getId());
        assertEquals(1L, response.getProductId());
        assertEquals("Organic Milk", response.getProductName());
        assertEquals("DAIRY-001", response.getProductSku());
        assertEquals(100, response.getQuantityOnHand());
        assertEquals(20, response.getReorderLevel());
        assertEquals(50, response.getReorderQuantity());
        assertEquals("WH-A", response.getWarehouseLocation());
        assertEquals(now, response.getLastRestockedAt());
    }

    @Test
    void orderItemResponse_fromEntity_mapsAllFields() {
        Product product = new Product();
        product.setId(1L);
        product.setName("Organic Milk");
        product.setSku("DAIRY-001");

        OrderItem item = new OrderItem();
        item.setId(1L);
        item.setProduct(product);
        item.setQuantity(10);
        item.setUnitPrice(new BigDecimal("4.99"));

        OrderItemResponse response = OrderItemResponse.fromEntity(item);

        assertEquals(1L, response.getId());
        assertEquals(1L, response.getProductId());
        assertEquals("Organic Milk", response.getProductName());
        assertEquals("DAIRY-001", response.getProductSku());
        assertEquals(10, response.getQuantity());
        assertEquals(new BigDecimal("4.99"), response.getUnitPrice());
        assertEquals(new BigDecimal("49.90"), response.getSubtotal());
    }

    @Test
    void orderResponse_fromEntity_mapsAllFields() {
        Customer customer = new Customer();
        customer.setId(1L);
        customer.setName("Acme Corp");

        Supplier supplier = new Supplier();
        supplier.setId(2L);
        supplier.setName("Fresh Farms");

        Order order = new Order();
        order.setId(1L);
        order.setOrderNumber("ORD-TEST");
        order.setCustomer(customer);
        order.setSupplier(supplier);
        order.setStatus(OrderStatus.PENDING);
        order.setItems(new ArrayList<>());
        order.setTotalAmount(new BigDecimal("100.00"));
        order.setShippingAddress("123 Main St");
        order.setDeliveryDate(LocalDate.of(2026, 3, 1));
        order.setNotes("Test");
        LocalDateTime now = LocalDateTime.now();
        order.setCreatedAt(now);
        order.setUpdatedAt(now);

        OrderResponse response = OrderResponse.fromEntity(order);

        assertEquals(1L, response.getId());
        assertEquals("ORD-TEST", response.getOrderNumber());
        assertEquals(1L, response.getCustomerId());
        assertEquals("Acme Corp", response.getCustomerName());
        assertEquals(2L, response.getSupplierId());
        assertEquals("Fresh Farms", response.getSupplierName());
        assertEquals(OrderStatus.PENDING, response.getStatus());
        assertNotNull(response.getItems());
        assertEquals(new BigDecimal("100.00"), response.getTotalAmount());
        assertEquals("123 Main St", response.getShippingAddress());
        assertEquals(LocalDate.of(2026, 3, 1), response.getDeliveryDate());
        assertEquals("Test", response.getNotes());
        assertEquals(now, response.getCreatedAt());
        assertEquals(now, response.getUpdatedAt());
    }

    @Test
    void orderResponse_fromEntity_withNullSupplier_handlesGracefully() {
        Customer customer = new Customer();
        customer.setId(1L);
        customer.setName("Acme Corp");

        Order order = new Order();
        order.setId(1L);
        order.setOrderNumber("ORD-TEST");
        order.setCustomer(customer);
        order.setSupplier(null);
        order.setStatus(OrderStatus.PENDING);
        order.setItems(new ArrayList<>());
        order.setTotalAmount(BigDecimal.ZERO);

        OrderResponse response = OrderResponse.fromEntity(order);

        assertNull(response.getSupplierId());
        assertNull(response.getSupplierName());
    }

    @Test
    void orderResponse_fromEntity_withItems_mapsItems() {
        Customer customer = new Customer();
        customer.setId(1L);
        customer.setName("Acme Corp");

        Product product = new Product();
        product.setId(1L);
        product.setName("Milk");
        product.setSku("D-001");

        OrderItem item = new OrderItem();
        item.setId(1L);
        item.setProduct(product);
        item.setQuantity(5);
        item.setUnitPrice(new BigDecimal("3.00"));

        Order order = new Order();
        order.setId(1L);
        order.setOrderNumber("ORD-TEST");
        order.setCustomer(customer);
        order.setStatus(OrderStatus.PENDING);
        order.setItems(List.of(item));
        order.setTotalAmount(new BigDecimal("15.00"));

        OrderResponse response = OrderResponse.fromEntity(order);

        assertEquals(1, response.getItems().size());
        assertEquals("Milk", response.getItems().get(0).getProductName());
    }
}
