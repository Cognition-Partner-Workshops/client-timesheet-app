package com.foodsupplychain.oms.dto.response;

import com.foodsupplychain.oms.entity.Inventory;
import java.time.LocalDateTime;

public class InventoryResponse {

    private Long id;
    private Long productId;
    private String productName;
    private String productSku;
    private Integer quantityOnHand;
    private Integer reorderLevel;
    private Integer reorderQuantity;
    private String warehouseLocation;
    private LocalDateTime lastRestockedAt;

    public static InventoryResponse fromEntity(Inventory inventory) {
        InventoryResponse response = new InventoryResponse();
        response.setId(inventory.getId());
        response.setProductId(inventory.getProduct().getId());
        response.setProductName(inventory.getProduct().getName());
        response.setProductSku(inventory.getProduct().getSku());
        response.setQuantityOnHand(inventory.getQuantityOnHand());
        response.setReorderLevel(inventory.getReorderLevel());
        response.setReorderQuantity(inventory.getReorderQuantity());
        response.setWarehouseLocation(inventory.getWarehouseLocation());
        response.setLastRestockedAt(inventory.getLastRestockedAt());
        return response;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public String getProductSku() {
        return productSku;
    }

    public void setProductSku(String productSku) {
        this.productSku = productSku;
    }

    public Integer getQuantityOnHand() {
        return quantityOnHand;
    }

    public void setQuantityOnHand(Integer quantityOnHand) {
        this.quantityOnHand = quantityOnHand;
    }

    public Integer getReorderLevel() {
        return reorderLevel;
    }

    public void setReorderLevel(Integer reorderLevel) {
        this.reorderLevel = reorderLevel;
    }

    public Integer getReorderQuantity() {
        return reorderQuantity;
    }

    public void setReorderQuantity(Integer reorderQuantity) {
        this.reorderQuantity = reorderQuantity;
    }

    public String getWarehouseLocation() {
        return warehouseLocation;
    }

    public void setWarehouseLocation(String warehouseLocation) {
        this.warehouseLocation = warehouseLocation;
    }

    public LocalDateTime getLastRestockedAt() {
        return lastRestockedAt;
    }

    public void setLastRestockedAt(LocalDateTime lastRestockedAt) {
        this.lastRestockedAt = lastRestockedAt;
    }
}
