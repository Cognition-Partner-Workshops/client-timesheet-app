package com.foodsupplychain.oms.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.foodsupplychain.oms.dto.InventoryDTO;
import com.foodsupplychain.oms.dto.RestockDTO;
import com.foodsupplychain.oms.entity.Inventory;
import com.foodsupplychain.oms.entity.Product;
import com.foodsupplychain.oms.enums.ProductCategory;
import com.foodsupplychain.oms.exception.ResourceNotFoundException;
import com.foodsupplychain.oms.service.InventoryService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import java.math.BigDecimal;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(InventoryController.class)
class InventoryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private InventoryService inventoryService;

    @Autowired
    private ObjectMapper objectMapper;

    private Inventory inventory;
    private Product product;
    private InventoryDTO inventoryDTO;

    @BeforeEach
    void setUp() {
        product = new Product();
        product.setId(1L);
        product.setName("Organic Milk");
        product.setSku("DAIRY-001");
        product.setCategory(ProductCategory.DAIRY);
        product.setPrice(new BigDecimal("4.99"));

        inventory = new Inventory();
        inventory.setId(1L);
        inventory.setProduct(product);
        inventory.setQuantityOnHand(100);
        inventory.setReorderLevel(20);
        inventory.setReorderQuantity(50);
        inventory.setWarehouseLocation("WH-A");

        inventoryDTO = new InventoryDTO();
        inventoryDTO.setProductId(1L);
        inventoryDTO.setQuantityOnHand(100);
        inventoryDTO.setReorderLevel(20);
        inventoryDTO.setReorderQuantity(50);
        inventoryDTO.setWarehouseLocation("WH-A");
    }

    @Test
    void getAllInventory_returnsPagedResponse() throws Exception {
        Page<Inventory> page = new PageImpl<>(List.of(inventory));
        when(inventoryService.getAllInventory(any(Pageable.class))).thenReturn(page);

        mockMvc.perform(get("/api/inventory"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].productName").value("Organic Milk"));
    }

    @Test
    void getInventoryById_existingId_returnsInventory() throws Exception {
        when(inventoryService.getInventoryById(1L)).thenReturn(inventory);

        mockMvc.perform(get("/api/inventory/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.quantityOnHand").value(100));
    }

    @Test
    void getInventoryById_nonExistingId_returns404() throws Exception {
        when(inventoryService.getInventoryById(99L)).thenThrow(new ResourceNotFoundException("Inventory", 99L));

        mockMvc.perform(get("/api/inventory/99"))
                .andExpect(status().isNotFound());
    }

    @Test
    void getInventoryByProduct_returnsInventory() throws Exception {
        when(inventoryService.getInventoryByProduct(1L)).thenReturn(inventory);

        mockMvc.perform(get("/api/inventory/product/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.productSku").value("DAIRY-001"));
    }

    @Test
    void getLowStockItems_returnsItems() throws Exception {
        when(inventoryService.getLowStockItems()).thenReturn(List.of(inventory));

        mockMvc.perform(get("/api/inventory/low-stock"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].quantityOnHand").value(100));
    }

    @Test
    void getInventoryByWarehouse_returnsItems() throws Exception {
        when(inventoryService.getInventoryByWarehouse("WH-A")).thenReturn(List.of(inventory));

        mockMvc.perform(get("/api/inventory/warehouse/WH-A"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].warehouseLocation").value("WH-A"));
    }

    @Test
    void createInventory_validDto_returns201() throws Exception {
        when(inventoryService.createInventory(any(InventoryDTO.class))).thenReturn(inventory);

        mockMvc.perform(post("/api/inventory")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(inventoryDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.quantityOnHand").value(100));
    }

    @Test
    void createInventory_invalidDto_returns400() throws Exception {
        InventoryDTO invalidDTO = new InventoryDTO();

        mockMvc.perform(post("/api/inventory")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidDTO)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void updateInventory_validDto_returnsUpdated() throws Exception {
        when(inventoryService.updateInventory(eq(1L), any(InventoryDTO.class))).thenReturn(inventory);

        mockMvc.perform(put("/api/inventory/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(inventoryDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.quantityOnHand").value(100));
    }

    @Test
    void restockInventory_validDto_returnsUpdated() throws Exception {
        when(inventoryService.restockInventory(eq(1L), eq(50))).thenReturn(inventory);
        RestockDTO restockDTO = new RestockDTO();
        restockDTO.setQuantity(50);

        mockMvc.perform(patch("/api/inventory/1/restock")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(restockDTO)))
                .andExpect(status().isOk());
    }

    @Test
    void restockInventory_nullQuantity_returns400() throws Exception {
        RestockDTO restockDTO = new RestockDTO();

        mockMvc.perform(patch("/api/inventory/1/restock")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(restockDTO)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void restockInventory_negativeQuantity_returns400() throws Exception {
        RestockDTO restockDTO = new RestockDTO();
        restockDTO.setQuantity(-5);

        mockMvc.perform(patch("/api/inventory/1/restock")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(restockDTO)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void deleteInventory_existingId_returns204() throws Exception {
        doNothing().when(inventoryService).deleteInventory(1L);

        mockMvc.perform(delete("/api/inventory/1"))
                .andExpect(status().isNoContent());
    }
}
