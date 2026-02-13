package com.foodsupplychain.oms.controller;

import com.foodsupplychain.oms.dto.InventoryDTO;
import com.foodsupplychain.oms.dto.RestockDTO;
import com.foodsupplychain.oms.dto.response.InventoryResponse;
import com.foodsupplychain.oms.service.InventoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/inventory")
@Tag(name = "Inventory", description = "Inventory management APIs")
public class InventoryController {

    private final InventoryService inventoryService;

    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @GetMapping
    @Operation(summary = "Get all inventory records (paginated)")
    public ResponseEntity<Page<InventoryResponse>> getAllInventory(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "id") String sortBy) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy));
        Page<InventoryResponse> inventory = inventoryService.getAllInventory(pageable)
                .map(InventoryResponse::fromEntity);
        return ResponseEntity.ok(inventory);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get inventory by ID")
    public ResponseEntity<InventoryResponse> getInventoryById(@PathVariable Long id) {
        return ResponseEntity.ok(InventoryResponse.fromEntity(inventoryService.getInventoryById(id)));
    }

    @GetMapping("/product/{productId}")
    @Operation(summary = "Get inventory by product ID")
    public ResponseEntity<InventoryResponse> getInventoryByProduct(@PathVariable Long productId) {
        return ResponseEntity.ok(InventoryResponse.fromEntity(inventoryService.getInventoryByProduct(productId)));
    }

    @GetMapping("/low-stock")
    @Operation(summary = "Get low stock items")
    public ResponseEntity<List<InventoryResponse>> getLowStockItems() {
        List<InventoryResponse> items = inventoryService.getLowStockItems().stream()
                .map(InventoryResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(items);
    }

    @GetMapping("/warehouse/{location}")
    @Operation(summary = "Get inventory by warehouse location")
    public ResponseEntity<List<InventoryResponse>> getInventoryByWarehouse(@PathVariable String location) {
        List<InventoryResponse> items = inventoryService.getInventoryByWarehouse(location).stream()
                .map(InventoryResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(items);
    }

    @PostMapping
    @Operation(summary = "Create a new inventory record")
    public ResponseEntity<InventoryResponse> createInventory(@Valid @RequestBody InventoryDTO dto) {
        InventoryResponse inventory = InventoryResponse.fromEntity(inventoryService.createInventory(dto));
        return ResponseEntity.status(HttpStatus.CREATED).body(inventory);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an inventory record")
    public ResponseEntity<InventoryResponse> updateInventory(@PathVariable Long id, @Valid @RequestBody InventoryDTO dto) {
        return ResponseEntity.ok(InventoryResponse.fromEntity(inventoryService.updateInventory(id, dto)));
    }

    @PatchMapping("/{id}/restock")
    @Operation(summary = "Restock inventory")
    public ResponseEntity<InventoryResponse> restockInventory(@PathVariable Long id, @Valid @RequestBody RestockDTO dto) {
        return ResponseEntity.ok(InventoryResponse.fromEntity(inventoryService.restockInventory(id, dto.getQuantity())));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete an inventory record")
    public ResponseEntity<Void> deleteInventory(@PathVariable Long id) {
        inventoryService.deleteInventory(id);
        return ResponseEntity.noContent().build();
    }
}
