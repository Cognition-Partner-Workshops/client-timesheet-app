package com.foodsupplychain.oms.repository;

import com.foodsupplychain.oms.entity.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SupplierRepository extends JpaRepository<Supplier, Long> {

    List<Supplier> findByActive(Boolean active);

    List<Supplier> findByNameContainingIgnoreCase(String name);
}
