package com.foodsupplychain.oms.service;

import com.foodsupplychain.oms.dto.InventoryDTO;
import com.foodsupplychain.oms.entity.Inventory;
import com.foodsupplychain.oms.entity.Product;
import com.foodsupplychain.oms.enums.ProductCategory;
import com.foodsupplychain.oms.exception.ResourceNotFoundException;
import com.foodsupplychain.oms.repository.InventoryRepository;
import com.foodsupplychain.oms.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InventoryServiceTest {

    @Mock
    private InventoryRepository inventoryRepository;
    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private InventoryService inventoryService;

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
    void getAllInventory_returnsPaginatedResults() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Inventory> page = new PageImpl<>(List.of(inventory));
        when(inventoryRepository.findAll(pageable)).thenReturn(page);

        Page<Inventory> result = inventoryService.getAllInventory(pageable);

        assertEquals(1, result.getTotalElements());
    }

    @Test
    void getInventoryById_existingId_returnsInventory() {
        when(inventoryRepository.findById(1L)).thenReturn(Optional.of(inventory));

        Inventory result = inventoryService.getInventoryById(1L);

        assertEquals(100, result.getQuantityOnHand());
    }

    @Test
    void getInventoryById_nonExistingId_throwsException() {
        when(inventoryRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> inventoryService.getInventoryById(99L));
    }

    @Test
    void getInventoryByProduct_existingProduct_returnsInventory() {
        when(inventoryRepository.findByProductId(1L)).thenReturn(Optional.of(inventory));

        Inventory result = inventoryService.getInventoryByProduct(1L);

        assertEquals("DAIRY-001", result.getProduct().getSku());
    }

    @Test
    void getInventoryByProduct_nonExistingProduct_throwsException() {
        when(inventoryRepository.findByProductId(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> inventoryService.getInventoryByProduct(99L));
    }

    @Test
    void getLowStockItems_returnsLowStockItems() {
        when(inventoryRepository.findLowStockItems()).thenReturn(List.of(inventory));

        List<Inventory> result = inventoryService.getLowStockItems();

        assertEquals(1, result.size());
    }

    @Test
    void getInventoryByWarehouse_returnsFilteredResults() {
        when(inventoryRepository.findByWarehouseLocation("WH-A")).thenReturn(List.of(inventory));

        List<Inventory> result = inventoryService.getInventoryByWarehouse("WH-A");

        assertEquals(1, result.size());
    }

    @Test
    void createInventory_newProduct_createsSuccessfully() {
        when(inventoryRepository.findByProductId(1L)).thenReturn(Optional.empty());
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(inventoryRepository.save(any(Inventory.class))).thenReturn(inventory);

        Inventory result = inventoryService.createInventory(inventoryDTO);

        assertNotNull(result);
        verify(inventoryRepository).save(any(Inventory.class));
    }

    @Test
    void createInventory_existingProduct_throwsException() {
        when(inventoryRepository.findByProductId(1L)).thenReturn(Optional.of(inventory));

        assertThrows(IllegalArgumentException.class, () -> inventoryService.createInventory(inventoryDTO));
    }

    @Test
    void createInventory_productNotFound_throwsException() {
        when(inventoryRepository.findByProductId(1L)).thenReturn(Optional.empty());
        when(productRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> inventoryService.createInventory(inventoryDTO));
    }

    @Test
    void updateInventory_existingId_updatesSuccessfully() {
        when(inventoryRepository.findById(1L)).thenReturn(Optional.of(inventory));
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(inventoryRepository.save(any(Inventory.class))).thenReturn(inventory);

        Inventory result = inventoryService.updateInventory(1L, inventoryDTO);

        assertNotNull(result);
    }

    @Test
    void updateInventory_withNewProduct_updatesProduct() {
        inventoryDTO.setProductId(2L);
        Product newProduct = new Product();
        newProduct.setId(2L);
        newProduct.setName("Cheese");
        newProduct.setSku("DAIRY-002");

        when(inventoryRepository.findById(1L)).thenReturn(Optional.of(inventory));
        when(productRepository.findById(2L)).thenReturn(Optional.of(newProduct));
        when(inventoryRepository.save(any(Inventory.class))).thenReturn(inventory);

        Inventory result = inventoryService.updateInventory(1L, inventoryDTO);

        assertNotNull(result);
    }

    @Test
    void updateInventory_withNullProductId_keepsExistingProduct() {
        inventoryDTO.setProductId(null);
        when(inventoryRepository.findById(1L)).thenReturn(Optional.of(inventory));
        when(inventoryRepository.save(any(Inventory.class))).thenReturn(inventory);

        Inventory result = inventoryService.updateInventory(1L, inventoryDTO);

        assertNotNull(result);
    }

    @Test
    void updateInventory_productNotFound_throwsException() {
        inventoryDTO.setProductId(99L);
        when(inventoryRepository.findById(1L)).thenReturn(Optional.of(inventory));
        when(productRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> inventoryService.updateInventory(1L, inventoryDTO));
    }

    @Test
    void restockInventory_positiveQuantity_restocksSuccessfully() {
        when(inventoryRepository.findById(1L)).thenReturn(Optional.of(inventory));
        when(inventoryRepository.save(any(Inventory.class))).thenReturn(inventory);

        Inventory result = inventoryService.restockInventory(1L, 50);

        assertNotNull(result);
        verify(inventoryRepository).save(any(Inventory.class));
    }

    @Test
    void restockInventory_zeroQuantity_throwsException() {
        assertThrows(IllegalArgumentException.class, () -> inventoryService.restockInventory(1L, 0));
    }

    @Test
    void restockInventory_negativeQuantity_throwsException() {
        assertThrows(IllegalArgumentException.class, () -> inventoryService.restockInventory(1L, -5));
    }

    @Test
    void deleteInventory_existingId_deletesSuccessfully() {
        when(inventoryRepository.findById(1L)).thenReturn(Optional.of(inventory));

        inventoryService.deleteInventory(1L);

        verify(inventoryRepository).delete(inventory);
    }

    @Test
    void deleteInventory_nonExistingId_throwsException() {
        when(inventoryRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> inventoryService.deleteInventory(99L));
    }
}
