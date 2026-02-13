package com.foodsupplychain.oms.service;

import com.foodsupplychain.oms.dto.OrderDTO;
import com.foodsupplychain.oms.dto.OrderItemDTO;
import com.foodsupplychain.oms.entity.Customer;
import com.foodsupplychain.oms.entity.Order;
import com.foodsupplychain.oms.entity.Product;
import com.foodsupplychain.oms.entity.Supplier;
import com.foodsupplychain.oms.enums.OrderStatus;
import com.foodsupplychain.oms.enums.ProductCategory;
import com.foodsupplychain.oms.exception.ResourceNotFoundException;
import com.foodsupplychain.oms.repository.CustomerRepository;
import com.foodsupplychain.oms.repository.OrderRepository;
import com.foodsupplychain.oms.repository.ProductRepository;
import com.foodsupplychain.oms.repository.SupplierRepository;
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
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;
    @Mock
    private CustomerRepository customerRepository;
    @Mock
    private SupplierRepository supplierRepository;
    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private OrderService orderService;

    private Order order;
    private Customer customer;
    private Supplier supplier;
    private Product product;
    private OrderDTO orderDTO;

    @BeforeEach
    void setUp() {
        customer = new Customer();
        customer.setId(1L);
        customer.setName("Acme Corp");

        supplier = new Supplier();
        supplier.setId(1L);
        supplier.setName("Fresh Farms");

        product = new Product();
        product.setId(1L);
        product.setName("Organic Milk");
        product.setSku("DAIRY-001");
        product.setCategory(ProductCategory.DAIRY);
        product.setPrice(new BigDecimal("4.99"));

        order = new Order();
        order.setId(1L);
        order.setOrderNumber("ORD-ABC12345");
        order.setCustomer(customer);
        order.setSupplier(supplier);
        order.setStatus(OrderStatus.PENDING);
        order.setItems(new ArrayList<>());
        order.setTotalAmount(BigDecimal.ZERO);
        order.setShippingAddress("123 Main St");
        order.setDeliveryDate(LocalDate.now().plusDays(7));
        order.setNotes("Test order");

        OrderItemDTO itemDTO = new OrderItemDTO();
        itemDTO.setProductId(1L);
        itemDTO.setQuantity(10);
        itemDTO.setUnitPrice(new BigDecimal("4.99"));

        orderDTO = new OrderDTO();
        orderDTO.setCustomerId(1L);
        orderDTO.setSupplierId(1L);
        orderDTO.setItems(List.of(itemDTO));
        orderDTO.setShippingAddress("123 Main St");
        orderDTO.setDeliveryDate(LocalDate.now().plusDays(7));
        orderDTO.setNotes("Test order");
    }

    @Test
    void getAllOrders_returnsPaginatedResults() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Order> page = new PageImpl<>(List.of(order));
        when(orderRepository.findAll(pageable)).thenReturn(page);

        Page<Order> result = orderService.getAllOrders(pageable);

        assertEquals(1, result.getTotalElements());
    }

    @Test
    void getOrderById_existingId_returnsOrder() {
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

        Order result = orderService.getOrderById(1L);

        assertEquals("ORD-ABC12345", result.getOrderNumber());
    }

    @Test
    void getOrderById_nonExistingId_throwsException() {
        when(orderRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> orderService.getOrderById(99L));
    }

    @Test
    void getOrderByOrderNumber_existingNumber_returnsOrder() {
        when(orderRepository.findByOrderNumber("ORD-ABC12345")).thenReturn(Optional.of(order));

        Order result = orderService.getOrderByOrderNumber("ORD-ABC12345");

        assertEquals(1L, result.getId());
    }

    @Test
    void getOrderByOrderNumber_nonExistingNumber_throwsException() {
        when(orderRepository.findByOrderNumber("ORD-INVALID")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> orderService.getOrderByOrderNumber("ORD-INVALID"));
    }

    @Test
    void getOrdersByCustomer_returnsOrders() {
        when(orderRepository.findByCustomerId(1L)).thenReturn(List.of(order));

        List<Order> result = orderService.getOrdersByCustomer(1L);

        assertEquals(1, result.size());
    }

    @Test
    void getOrdersBySupplier_returnsOrders() {
        when(orderRepository.findBySupplierId(1L)).thenReturn(List.of(order));

        List<Order> result = orderService.getOrdersBySupplier(1L);

        assertEquals(1, result.size());
    }

    @Test
    void getOrdersByStatus_returnsOrders() {
        when(orderRepository.findByStatus(OrderStatus.PENDING)).thenReturn(List.of(order));

        List<Order> result = orderService.getOrdersByStatus(OrderStatus.PENDING);

        assertEquals(1, result.size());
    }

    @Test
    void createOrder_validOrder_createsSuccessfully() {
        when(customerRepository.findById(1L)).thenReturn(Optional.of(customer));
        when(supplierRepository.findById(1L)).thenReturn(Optional.of(supplier));
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(orderRepository.save(any(Order.class))).thenReturn(order);

        Order result = orderService.createOrder(orderDTO);

        assertNotNull(result);
        verify(orderRepository).save(any(Order.class));
    }

    @Test
    void createOrder_withoutSupplier_createsSuccessfully() {
        orderDTO.setSupplierId(null);
        when(customerRepository.findById(1L)).thenReturn(Optional.of(customer));
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(orderRepository.save(any(Order.class))).thenReturn(order);

        Order result = orderService.createOrder(orderDTO);

        assertNotNull(result);
    }

    @Test
    void createOrder_customerNotFound_throwsException() {
        when(customerRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> orderService.createOrder(orderDTO));
    }

    @Test
    void createOrder_supplierNotFound_throwsException() {
        when(customerRepository.findById(1L)).thenReturn(Optional.of(customer));
        when(supplierRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> orderService.createOrder(orderDTO));
    }

    @Test
    void createOrder_productNotFound_throwsException() {
        when(customerRepository.findById(1L)).thenReturn(Optional.of(customer));
        when(supplierRepository.findById(1L)).thenReturn(Optional.of(supplier));
        when(productRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> orderService.createOrder(orderDTO));
    }

    @Test
    void updateOrder_validUpdate_updatesSuccessfully() {
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(customerRepository.findById(1L)).thenReturn(Optional.of(customer));
        when(supplierRepository.findById(1L)).thenReturn(Optional.of(supplier));
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(orderRepository.save(any(Order.class))).thenReturn(order);

        Order result = orderService.updateOrder(1L, orderDTO);

        assertNotNull(result);
    }

    @Test
    void updateOrder_deliveredOrder_throwsException() {
        order.setStatus(OrderStatus.DELIVERED);
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

        assertThrows(IllegalArgumentException.class, () -> orderService.updateOrder(1L, orderDTO));
    }

    @Test
    void updateOrder_cancelledOrder_throwsException() {
        order.setStatus(OrderStatus.CANCELLED);
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

        assertThrows(IllegalArgumentException.class, () -> orderService.updateOrder(1L, orderDTO));
    }

    @Test
    void updateOrder_withoutSupplier_updatesSuccessfully() {
        orderDTO.setSupplierId(null);
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(customerRepository.findById(1L)).thenReturn(Optional.of(customer));
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(orderRepository.save(any(Order.class))).thenReturn(order);

        Order result = orderService.updateOrder(1L, orderDTO);

        assertNotNull(result);
    }

    @Test
    void updateOrderStatus_validTransition_updatesSuccessfully() {
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(orderRepository.save(any(Order.class))).thenReturn(order);

        Order result = orderService.updateOrderStatus(1L, OrderStatus.CONFIRMED);

        assertNotNull(result);
    }

    @Test
    void updateOrderStatus_cancelledOrderToOther_throwsException() {
        order.setStatus(OrderStatus.CANCELLED);
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

        assertThrows(IllegalArgumentException.class,
                () -> orderService.updateOrderStatus(1L, OrderStatus.PENDING));
    }

    @Test
    void updateOrderStatus_cancelledToCancelled_succeeds() {
        order.setStatus(OrderStatus.CANCELLED);
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(orderRepository.save(any(Order.class))).thenReturn(order);

        Order result = orderService.updateOrderStatus(1L, OrderStatus.CANCELLED);

        assertNotNull(result);
    }

    @Test
    void deleteOrder_existingId_deletesSuccessfully() {
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

        orderService.deleteOrder(1L);

        verify(orderRepository).delete(order);
    }

    @Test
    void deleteOrder_nonExistingId_throwsException() {
        when(orderRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> orderService.deleteOrder(99L));
    }
}
