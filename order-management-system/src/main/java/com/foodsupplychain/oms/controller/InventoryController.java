package com.foodsupplychain.oms.controller;

import com.foodsupplychain.oms.dto.InventoryDTO;
import com.foodsupplychain.oms.entity.Inventory;
import com.foodsupplychain.oms.service.InventoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/inventory")
@Tag(name = "Inventory", description = "Inventory management APIs")
public class InventoryController {

    private final InventoryService inventoryService;

    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @GetMapping
    @Operation(summary = "Get all inventory records")
    public ResponseEntity<List<Inventory>> getAllInventory() {
        return ResponseEntity.ok(inventoryService.getAllInventory());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get inventory by ID")
    public ResponseEntity<Inventory> getInventoryById(@PathVariable Long id) {
        return ResponseEntity.ok(inventoryService.getInventoryById(id));
    }

    @GetMapping("/product/{productId}")
    @Operation(summary = "Get inventory by product ID")
    public ResponseEntity<Inventory> getInventoryByProduct(@PathVariable Long productId) {
        return ResponseEntity.ok(inventoryService.getInventoryByProduct(productId));
    }

    @GetMapping("/low-stock")
    @Operation(summary = "Get low stock items")
    public ResponseEntity<List<Inventory>> getLowStockItems() {
        return ResponseEntity.ok(inventoryService.getLowStockItems());
    }

    @GetMapping("/warehouse/{location}")
    @Operation(summary = "Get inventory by warehouse location")
    public ResponseEntity<List<Inventory>> getInventoryByWarehouse(@PathVariable String location) {
        return ResponseEntity.ok(inventoryService.getInventoryByWarehouse(location));
    }

    @PostMapping
    @Operation(summary = "Create a new inventory record")
    public ResponseEntity<Inventory> createInventory(@Valid @RequestBody InventoryDTO dto) {
        Inventory inventory = inventoryService.createInventory(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(inventory);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an inventory record")
    public ResponseEntity<Inventory> updateInventory(@PathVariable Long id, @Valid @RequestBody InventoryDTO dto) {
        return ResponseEntity.ok(inventoryService.updateInventory(id, dto));
    }

    @PatchMapping("/{id}/restock")
    @Operation(summary = "Restock inventory")
    public ResponseEntity<Inventory> restockInventory(@PathVariable Long id, @RequestBody Map<String, Integer> body) {
        Integer quantity = body.get("quantity");
        return ResponseEntity.ok(inventoryService.restockInventory(id, quantity));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete an inventory record")
    public ResponseEntity<Void> deleteInventory(@PathVariable Long id) {
        inventoryService.deleteInventory(id);
        return ResponseEntity.noContent().build();
    }
}
