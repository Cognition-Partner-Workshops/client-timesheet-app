package com.foodsupplychain.oms.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.foodsupplychain.oms.dto.ProductDTO;
import com.foodsupplychain.oms.entity.Product;
import com.foodsupplychain.oms.enums.ProductCategory;
import com.foodsupplychain.oms.exception.GlobalExceptionHandler;
import com.foodsupplychain.oms.exception.ResourceNotFoundException;
import com.foodsupplychain.oms.service.ProductService;
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

@WebMvcTest(ProductController.class)
class ProductControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ProductService productService;

    @Autowired
    private ObjectMapper objectMapper;

    private Product product;
    private ProductDTO productDTO;

    @BeforeEach
    void setUp() {
        product = new Product();
        product.setId(1L);
        product.setName("Organic Milk");
        product.setSku("DAIRY-001");
        product.setCategory(ProductCategory.DAIRY);
        product.setPrice(new BigDecimal("4.99"));
        product.setUnit("gallon");
        product.setShelfLifeDays(14);
        product.setStorageTemperature("2-6°C");
        product.setDescription("Fresh organic milk");

        productDTO = new ProductDTO();
        productDTO.setName("Organic Milk");
        productDTO.setSku("DAIRY-001");
        productDTO.setCategory(ProductCategory.DAIRY);
        productDTO.setPrice(new BigDecimal("4.99"));
        productDTO.setUnit("gallon");
    }

    @Test
    void getAllProducts_returnsPagedResponse() throws Exception {
        Page<Product> page = new PageImpl<>(List.of(product));
        when(productService.getAllProducts(any(Pageable.class))).thenReturn(page);

        mockMvc.perform(get("/api/products")
                        .param("page", "0")
                        .param("size", "20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].name").value("Organic Milk"))
                .andExpect(jsonPath("$.content[0].sku").value("DAIRY-001"));
    }

    @Test
    void getProductById_existingId_returnsProduct() throws Exception {
        when(productService.getProductById(1L)).thenReturn(product);

        mockMvc.perform(get("/api/products/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Organic Milk"))
                .andExpect(jsonPath("$.sku").value("DAIRY-001"));
    }

    @Test
    void getProductById_nonExistingId_returns404() throws Exception {
        when(productService.getProductById(99L)).thenThrow(new ResourceNotFoundException("Product", 99L));

        mockMvc.perform(get("/api/products/99"))
                .andExpect(status().isNotFound());
    }

    @Test
    void getProductBySku_existingSku_returnsProduct() throws Exception {
        when(productService.getProductBySku("DAIRY-001")).thenReturn(product);

        mockMvc.perform(get("/api/products/sku/DAIRY-001"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Organic Milk"));
    }

    @Test
    void getProductsByCategory_returnsProducts() throws Exception {
        when(productService.getProductsByCategory(ProductCategory.DAIRY)).thenReturn(List.of(product));

        mockMvc.perform(get("/api/products/category/DAIRY"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].category").value("DAIRY"));
    }

    @Test
    void searchProducts_returnsMatchingProducts() throws Exception {
        when(productService.searchProducts("Milk")).thenReturn(List.of(product));

        mockMvc.perform(get("/api/products/search").param("name", "Milk"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Organic Milk"));
    }

    @Test
    void createProduct_validDto_returns201() throws Exception {
        when(productService.createProduct(any(ProductDTO.class))).thenReturn(product);

        mockMvc.perform(post("/api/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(productDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Organic Milk"));
    }

    @Test
    void createProduct_invalidDto_returns400() throws Exception {
        ProductDTO invalidDTO = new ProductDTO();

        mockMvc.perform(post("/api/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidDTO)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void updateProduct_validDto_returnsUpdated() throws Exception {
        when(productService.updateProduct(eq(1L), any(ProductDTO.class))).thenReturn(product);

        mockMvc.perform(put("/api/products/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(productDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Organic Milk"));
    }

    @Test
    void deleteProduct_existingId_returns204() throws Exception {
        doNothing().when(productService).deleteProduct(1L);

        mockMvc.perform(delete("/api/products/1"))
                .andExpect(status().isNoContent());
    }

    @Test
    void createProduct_duplicateSku_returns400() throws Exception {
        when(productService.createProduct(any(ProductDTO.class)))
                .thenThrow(new IllegalArgumentException("Product with SKU 'DAIRY-001' already exists"));

        mockMvc.perform(post("/api/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(productDTO)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Product with SKU 'DAIRY-001' already exists"));
    }
}
