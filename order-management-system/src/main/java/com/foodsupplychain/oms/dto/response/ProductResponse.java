package com.foodsupplychain.oms.dto.response;

import com.foodsupplychain.oms.entity.Product;
import com.foodsupplychain.oms.enums.ProductCategory;
import java.math.BigDecimal;

public class ProductResponse {

    private Long id;
    private String name;
    private String description;
    private String sku;
    private ProductCategory category;
    private BigDecimal price;
    private String unit;
    private Integer shelfLifeDays;
    private String storageTemperature;

    public static ProductResponse fromEntity(Product product) {
        ProductResponse response = new ProductResponse();
        response.setId(product.getId());
        response.setName(product.getName());
        response.setDescription(product.getDescription());
        response.setSku(product.getSku());
        response.setCategory(product.getCategory());
        response.setPrice(product.getPrice());
        response.setUnit(product.getUnit());
        response.setShelfLifeDays(product.getShelfLifeDays());
        response.setStorageTemperature(product.getStorageTemperature());
        return response;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getSku() {
        return sku;
    }

    public void setSku(String sku) {
        this.sku = sku;
    }

    public ProductCategory getCategory() {
        return category;
    }

    public void setCategory(ProductCategory category) {
        this.category = category;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public Integer getShelfLifeDays() {
        return shelfLifeDays;
    }

    public void setShelfLifeDays(Integer shelfLifeDays) {
        this.shelfLifeDays = shelfLifeDays;
    }

    public String getStorageTemperature() {
        return storageTemperature;
    }

    public void setStorageTemperature(String storageTemperature) {
        this.storageTemperature = storageTemperature;
    }
}
