package com.foodsupplychain.oms.repository;

import com.foodsupplychain.oms.entity.Product;
import com.foodsupplychain.oms.enums.ProductCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    Optional<Product> findBySku(String sku);

    List<Product> findByCategory(ProductCategory category);

    List<Product> findByNameContainingIgnoreCase(String name);
}
