package com.foodsupplychain.oms.controller;

import com.foodsupplychain.oms.dto.OrderDTO;
import com.foodsupplychain.oms.dto.StatusUpdateDTO;
import com.foodsupplychain.oms.dto.response.OrderResponse;
import com.foodsupplychain.oms.enums.OrderStatus;
import com.foodsupplychain.oms.service.OrderService;
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
@RequestMapping("/api/orders")
@Tag(name = "Orders", description = "Order management APIs")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping
    @Operation(summary = "Get all orders (paginated)")
    public ResponseEntity<Page<OrderResponse>> getAllOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "id") String sortBy) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy));
        Page<OrderResponse> orders = orderService.getAllOrders(pageable)
                .map(OrderResponse::fromEntity);
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get order by ID")
    public ResponseEntity<OrderResponse> getOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(OrderResponse.fromEntity(orderService.getOrderById(id)));
    }

    @GetMapping("/number/{orderNumber}")
    @Operation(summary = "Get order by order number")
    public ResponseEntity<OrderResponse> getOrderByOrderNumber(@PathVariable String orderNumber) {
        return ResponseEntity.ok(OrderResponse.fromEntity(orderService.getOrderByOrderNumber(orderNumber)));
    }

    @GetMapping("/customer/{customerId}")
    @Operation(summary = "Get orders by customer ID")
    public ResponseEntity<List<OrderResponse>> getOrdersByCustomer(@PathVariable Long customerId) {
        List<OrderResponse> orders = orderService.getOrdersByCustomer(customerId).stream()
                .map(OrderResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/supplier/{supplierId}")
    @Operation(summary = "Get orders by supplier ID")
    public ResponseEntity<List<OrderResponse>> getOrdersBySupplier(@PathVariable Long supplierId) {
        List<OrderResponse> orders = orderService.getOrdersBySupplier(supplierId).stream()
                .map(OrderResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/status/{status}")
    @Operation(summary = "Get orders by status")
    public ResponseEntity<List<OrderResponse>> getOrdersByStatus(@PathVariable OrderStatus status) {
        List<OrderResponse> orders = orderService.getOrdersByStatus(status).stream()
                .map(OrderResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(orders);
    }

    @PostMapping
    @Operation(summary = "Create a new order")
    public ResponseEntity<OrderResponse> createOrder(@Valid @RequestBody OrderDTO dto) {
        OrderResponse order = OrderResponse.fromEntity(orderService.createOrder(dto));
        return ResponseEntity.status(HttpStatus.CREATED).body(order);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing order")
    public ResponseEntity<OrderResponse> updateOrder(@PathVariable Long id, @Valid @RequestBody OrderDTO dto) {
        return ResponseEntity.ok(OrderResponse.fromEntity(orderService.updateOrder(id, dto)));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update order status")
    public ResponseEntity<OrderResponse> updateOrderStatus(@PathVariable Long id, @Valid @RequestBody StatusUpdateDTO dto) {
        return ResponseEntity.ok(OrderResponse.fromEntity(orderService.updateOrderStatus(id, dto.getStatus())));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete an order")
    public ResponseEntity<Void> deleteOrder(@PathVariable Long id) {
        orderService.deleteOrder(id);
        return ResponseEntity.noContent().build();
    }
}
