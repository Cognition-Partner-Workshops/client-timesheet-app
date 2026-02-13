package com.foodsupplychain.oms.service;

import com.foodsupplychain.oms.dto.ProductDTO;
import com.foodsupplychain.oms.entity.Product;
import com.foodsupplychain.oms.enums.ProductCategory;
import com.foodsupplychain.oms.exception.ResourceNotFoundException;
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
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private ProductService productService;

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
        productDTO.setShelfLifeDays(14);
        productDTO.setStorageTemperature("2-6°C");
        productDTO.setDescription("Fresh organic milk");
    }

    @Test
    void getAllProducts_returnsPaginatedResults() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Product> page = new PageImpl<>(List.of(product));
        when(productRepository.findAll(pageable)).thenReturn(page);

        Page<Product> result = productService.getAllProducts(pageable);

        assertEquals(1, result.getTotalElements());
        assertEquals(product.getName(), result.getContent().get(0).getName());
        verify(productRepository).findAll(pageable);
    }

    @Test
    void getProductById_existingId_returnsProduct() {
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));

        Product result = productService.getProductById(1L);

        assertEquals("Organic Milk", result.getName());
        verify(productRepository).findById(1L);
    }

    @Test
    void getProductById_nonExistingId_throwsException() {
        when(productRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> productService.getProductById(99L));
    }

    @Test
    void getProductBySku_existingSku_returnsProduct() {
        when(productRepository.findBySku("DAIRY-001")).thenReturn(Optional.of(product));

        Product result = productService.getProductBySku("DAIRY-001");

        assertEquals("Organic Milk", result.getName());
    }

    @Test
    void getProductBySku_nonExistingSku_throwsException() {
        when(productRepository.findBySku("INVALID")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> productService.getProductBySku("INVALID"));
    }

    @Test
    void getProductsByCategory_returnsFilteredProducts() {
        when(productRepository.findByCategory(ProductCategory.DAIRY)).thenReturn(List.of(product));

        List<Product> result = productService.getProductsByCategory(ProductCategory.DAIRY);

        assertEquals(1, result.size());
        assertEquals(ProductCategory.DAIRY, result.get(0).getCategory());
    }

    @Test
    void searchProducts_returnsMatchingProducts() {
        when(productRepository.findByNameContainingIgnoreCase("Milk")).thenReturn(List.of(product));

        List<Product> result = productService.searchProducts("Milk");

        assertEquals(1, result.size());
    }

    @Test
    void createProduct_uniqueSku_createsProduct() {
        when(productRepository.findBySku("DAIRY-001")).thenReturn(Optional.empty());
        when(productRepository.save(any(Product.class))).thenReturn(product);

        Product result = productService.createProduct(productDTO);

        assertEquals("Organic Milk", result.getName());
        verify(productRepository).save(any(Product.class));
    }

    @Test
    void createProduct_duplicateSku_throwsException() {
        when(productRepository.findBySku("DAIRY-001")).thenReturn(Optional.of(product));

        assertThrows(IllegalArgumentException.class, () -> productService.createProduct(productDTO));
        verify(productRepository, never()).save(any());
    }

    @Test
    void updateProduct_validUpdate_updatesProduct() {
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(productRepository.findBySku("DAIRY-001")).thenReturn(Optional.of(product));
        when(productRepository.save(any(Product.class))).thenReturn(product);

        Product result = productService.updateProduct(1L, productDTO);

        assertNotNull(result);
        verify(productRepository).save(any(Product.class));
    }

    @Test
    void updateProduct_duplicateSkuOnDifferentProduct_throwsException() {
        Product otherProduct = new Product();
        otherProduct.setId(2L);
        otherProduct.setSku("DAIRY-001");

        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(productRepository.findBySku("DAIRY-001")).thenReturn(Optional.of(otherProduct));

        assertThrows(IllegalArgumentException.class, () -> productService.updateProduct(1L, productDTO));
    }

    @Test
    void updateProduct_sameSkuOnSameProduct_succeeds() {
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(productRepository.findBySku("DAIRY-001")).thenReturn(Optional.of(product));
        when(productRepository.save(any(Product.class))).thenReturn(product);

        Product result = productService.updateProduct(1L, productDTO);

        assertNotNull(result);
    }

    @Test
    void updateProduct_newSkuNotTaken_succeeds() {
        productDTO.setSku("DAIRY-002");
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(productRepository.findBySku("DAIRY-002")).thenReturn(Optional.empty());
        when(productRepository.save(any(Product.class))).thenReturn(product);

        Product result = productService.updateProduct(1L, productDTO);

        assertNotNull(result);
    }

    @Test
    void deleteProduct_existingId_deletesProduct() {
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));

        productService.deleteProduct(1L);

        verify(productRepository).delete(product);
    }

    @Test
    void deleteProduct_nonExistingId_throwsException() {
        when(productRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> productService.deleteProduct(99L));
    }
}
