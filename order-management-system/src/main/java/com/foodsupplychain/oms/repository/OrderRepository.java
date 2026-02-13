package com.foodsupplychain.oms.repository;

import com.foodsupplychain.oms.entity.Order;
import com.foodsupplychain.oms.enums.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    Optional<Order> findByOrderNumber(String orderNumber);

    List<Order> findByCustomerId(Long customerId);

    List<Order> findBySupplierId(Long supplierId);

    List<Order> findByStatus(OrderStatus status);
}
