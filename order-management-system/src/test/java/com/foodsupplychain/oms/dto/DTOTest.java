package com.foodsupplychain.oms.dto;

import com.foodsupplychain.oms.enums.OrderStatus;
import com.foodsupplychain.oms.enums.ProductCategory;
import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class DTOTest {

    @Test
    void productDTO_gettersAndSetters() {
        ProductDTO dto = new ProductDTO();
        dto.setName("Test Product");
        dto.setDescription("Description");
        dto.setSku("TEST-001");
        dto.setCategory(ProductCategory.DAIRY);
        dto.setPrice(new BigDecimal("9.99"));
        dto.setUnit("kg");
        dto.setShelfLifeDays(7);
        dto.setStorageTemperature("0-4°C");

        assertEquals("Test Product", dto.getName());
        assertEquals("Description", dto.getDescription());
        assertEquals("TEST-001", dto.getSku());
        assertEquals(ProductCategory.DAIRY, dto.getCategory());
        assertEquals(new BigDecimal("9.99"), dto.getPrice());
        assertEquals("kg", dto.getUnit());
        assertEquals(7, dto.getShelfLifeDays());
        assertEquals("0-4°C", dto.getStorageTemperature());
    }

    @Test
    void supplierDTO_gettersAndSetters() {
        SupplierDTO dto = new SupplierDTO();
        dto.setName("Test Supplier");
        dto.setContactPerson("Jane Doe");
        dto.setEmail("jane@test.com");
        dto.setPhone("555-1234");
        dto.setAddress("100 Main St");
        dto.setCity("Portland");
        dto.setState("OR");
        dto.setZipCode("97201");
        dto.setCountry("USA");
        dto.setTaxId("TAX-S001");
        dto.setPaymentTerms("Net 45");
        dto.setActive(true);

        assertEquals("Test Supplier", dto.getName());
        assertEquals("Jane Doe", dto.getContactPerson());
        assertEquals("jane@test.com", dto.getEmail());
        assertEquals("555-1234", dto.getPhone());
        assertEquals("100 Main St", dto.getAddress());
        assertEquals("Portland", dto.getCity());
        assertEquals("OR", dto.getState());
        assertEquals("97201", dto.getZipCode());
        assertEquals("USA", dto.getCountry());
        assertEquals("TAX-S001", dto.getTaxId());
        assertEquals("Net 45", dto.getPaymentTerms());
        assertTrue(dto.getActive());
    }

    @Test
    void customerDTO_gettersAndSetters() {
        CustomerDTO dto = new CustomerDTO();
        dto.setName("Test Customer");
        dto.setEmail("customer@test.com");
        dto.setPhone("555-5678");
        dto.setAddress("200 Oak Ave");
        dto.setCity("Seattle");
        dto.setState("WA");
        dto.setZipCode("98101");
        dto.setCountry("USA");
        dto.setBusinessName("Test Corp");
        dto.setTaxId("TAX-C002");
        dto.setCreditLimit(new BigDecimal("25000"));
        dto.setActive(false);

        assertEquals("Test Customer", dto.getName());
        assertEquals("customer@test.com", dto.getEmail());
        assertEquals("555-5678", dto.getPhone());
        assertEquals("200 Oak Ave", dto.getAddress());
        assertEquals("Seattle", dto.getCity());
        assertEquals("WA", dto.getState());
        assertEquals("98101", dto.getZipCode());
        assertEquals("USA", dto.getCountry());
        assertEquals("Test Corp", dto.getBusinessName());
        assertEquals("TAX-C002", dto.getTaxId());
        assertEquals(new BigDecimal("25000"), dto.getCreditLimit());
        assertFalse(dto.getActive());
    }

    @Test
    void orderDTO_gettersAndSetters() {
        OrderItemDTO itemDTO = new OrderItemDTO();
        itemDTO.setProductId(1L);
        itemDTO.setQuantity(5);
        itemDTO.setUnitPrice(new BigDecimal("10.00"));

        OrderDTO dto = new OrderDTO();
        dto.setCustomerId(1L);
        dto.setSupplierId(2L);
        dto.setItems(List.of(itemDTO));
        dto.setShippingAddress("123 Ship St");
        dto.setDeliveryDate(LocalDate.of(2026, 6, 15));
        dto.setNotes("Urgent order");

        assertEquals(1L, dto.getCustomerId());
        assertEquals(2L, dto.getSupplierId());
        assertEquals(1, dto.getItems().size());
        assertEquals("123 Ship St", dto.getShippingAddress());
        assertEquals(LocalDate.of(2026, 6, 15), dto.getDeliveryDate());
        assertEquals("Urgent order", dto.getNotes());
    }

    @Test
    void orderItemDTO_gettersAndSetters() {
        OrderItemDTO dto = new OrderItemDTO();
        dto.setProductId(5L);
        dto.setQuantity(20);
        dto.setUnitPrice(new BigDecimal("7.50"));

        assertEquals(5L, dto.getProductId());
        assertEquals(20, dto.getQuantity());
        assertEquals(new BigDecimal("7.50"), dto.getUnitPrice());
    }

    @Test
    void inventoryDTO_gettersAndSetters() {
        InventoryDTO dto = new InventoryDTO();
        dto.setProductId(3L);
        dto.setQuantityOnHand(200);
        dto.setReorderLevel(30);
        dto.setReorderQuantity(100);
        dto.setWarehouseLocation("WH-B");

        assertEquals(3L, dto.getProductId());
        assertEquals(200, dto.getQuantityOnHand());
        assertEquals(30, dto.getReorderLevel());
        assertEquals(100, dto.getReorderQuantity());
        assertEquals("WH-B", dto.getWarehouseLocation());
    }

    @Test
    void statusUpdateDTO_gettersAndSetters() {
        StatusUpdateDTO dto = new StatusUpdateDTO();
        dto.setStatus(OrderStatus.CONFIRMED);

        assertEquals(OrderStatus.CONFIRMED, dto.getStatus());
    }

    @Test
    void restockDTO_gettersAndSetters() {
        RestockDTO dto = new RestockDTO();
        dto.setQuantity(50);

        assertEquals(50, dto.getQuantity());
    }
}
