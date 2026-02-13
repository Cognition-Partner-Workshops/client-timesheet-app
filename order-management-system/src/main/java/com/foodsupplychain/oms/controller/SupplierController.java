package com.foodsupplychain.oms.controller;

import com.foodsupplychain.oms.dto.SupplierDTO;
import com.foodsupplychain.oms.dto.response.SupplierResponse;
import com.foodsupplychain.oms.service.SupplierService;
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
@RequestMapping("/api/suppliers")
@Tag(name = "Suppliers", description = "Supplier management APIs")
public class SupplierController {

    private final SupplierService supplierService;

    public SupplierController(SupplierService supplierService) {
        this.supplierService = supplierService;
    }

    @GetMapping
    @Operation(summary = "Get all suppliers (paginated)")
    public ResponseEntity<Page<SupplierResponse>> getAllSuppliers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "id") String sortBy) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy));
        Page<SupplierResponse> suppliers = supplierService.getAllSuppliers(pageable)
                .map(SupplierResponse::fromEntity);
        return ResponseEntity.ok(suppliers);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get supplier by ID")
    public ResponseEntity<SupplierResponse> getSupplierById(@PathVariable Long id) {
        return ResponseEntity.ok(SupplierResponse.fromEntity(supplierService.getSupplierById(id)));
    }

    @GetMapping("/active")
    @Operation(summary = "Get active suppliers")
    public ResponseEntity<List<SupplierResponse>> getActiveSuppliers() {
        List<SupplierResponse> suppliers = supplierService.getActiveSuppliers().stream()
                .map(SupplierResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(suppliers);
    }

    @GetMapping("/search")
    @Operation(summary = "Search suppliers by name")
    public ResponseEntity<List<SupplierResponse>> searchSuppliers(@RequestParam String name) {
        List<SupplierResponse> suppliers = supplierService.searchSuppliers(name).stream()
                .map(SupplierResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(suppliers);
    }

    @PostMapping
    @Operation(summary = "Create a new supplier")
    public ResponseEntity<SupplierResponse> createSupplier(@Valid @RequestBody SupplierDTO dto) {
        SupplierResponse supplier = SupplierResponse.fromEntity(supplierService.createSupplier(dto));
        return ResponseEntity.status(HttpStatus.CREATED).body(supplier);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing supplier")
    public ResponseEntity<SupplierResponse> updateSupplier(@PathVariable Long id, @Valid @RequestBody SupplierDTO dto) {
        return ResponseEntity.ok(SupplierResponse.fromEntity(supplierService.updateSupplier(id, dto)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a supplier")
    public ResponseEntity<Void> deleteSupplier(@PathVariable Long id) {
        supplierService.deleteSupplier(id);
        return ResponseEntity.noContent().build();
    }
}
