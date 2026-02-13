package com.foodsupplychain.oms.service;

import com.foodsupplychain.oms.dto.InventoryDTO;
import com.foodsupplychain.oms.entity.Inventory;
import com.foodsupplychain.oms.entity.Product;
import com.foodsupplychain.oms.exception.ResourceNotFoundException;
import com.foodsupplychain.oms.repository.InventoryRepository;
import com.foodsupplychain.oms.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class InventoryService {

    private final InventoryRepository inventoryRepository;
    private final ProductRepository productRepository;

    public InventoryService(InventoryRepository inventoryRepository, ProductRepository productRepository) {
        this.inventoryRepository = inventoryRepository;
        this.productRepository = productRepository;
    }

    public List<Inventory> getAllInventory() {
        return inventoryRepository.findAll();
    }

    public Inventory getInventoryById(Long id) {
        return inventoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory", id));
    }

    public Inventory getInventoryByProduct(Long productId) {
        return inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory not found for product id: " + productId));
    }

    public List<Inventory> getLowStockItems() {
        return inventoryRepository.findLowStockItems();
    }

    public List<Inventory> getInventoryByWarehouse(String warehouseLocation) {
        return inventoryRepository.findByWarehouseLocation(warehouseLocation);
    }

    public Inventory createInventory(InventoryDTO dto) {
        inventoryRepository.findByProductId(dto.getProductId()).ifPresent(i -> {
            throw new IllegalArgumentException("Inventory record already exists for product id: " + dto.getProductId());
        });

        Product product = productRepository.findById(dto.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product", dto.getProductId()));

        Inventory inventory = new Inventory();
        inventory.setProduct(product);
        inventory.setQuantityOnHand(dto.getQuantityOnHand());
        inventory.setReorderLevel(dto.getReorderLevel());
        inventory.setReorderQuantity(dto.getReorderQuantity());
        inventory.setWarehouseLocation(dto.getWarehouseLocation());

        return inventoryRepository.save(inventory);
    }

    public Inventory updateInventory(Long id, InventoryDTO dto) {
        Inventory inventory = getInventoryById(id);

        if (dto.getProductId() != null) {
            Product product = productRepository.findById(dto.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product", dto.getProductId()));
            inventory.setProduct(product);
        }

        inventory.setQuantityOnHand(dto.getQuantityOnHand());
        inventory.setReorderLevel(dto.getReorderLevel());
        inventory.setReorderQuantity(dto.getReorderQuantity());
        inventory.setWarehouseLocation(dto.getWarehouseLocation());

        return inventoryRepository.save(inventory);
    }

    public Inventory restockInventory(Long id, Integer quantity) {
        if (quantity <= 0) {
            throw new IllegalArgumentException("Restock quantity must be positive");
        }

        Inventory inventory = getInventoryById(id);
        inventory.setQuantityOnHand(inventory.getQuantityOnHand() + quantity);
        inventory.setLastRestockedAt(LocalDateTime.now());
        return inventoryRepository.save(inventory);
    }

    public void deleteInventory(Long id) {
        Inventory inventory = getInventoryById(id);
        inventoryRepository.delete(inventory);
    }
}
