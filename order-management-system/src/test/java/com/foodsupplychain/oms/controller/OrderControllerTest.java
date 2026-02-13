package com.foodsupplychain.oms.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.foodsupplychain.oms.dto.OrderDTO;
import com.foodsupplychain.oms.dto.OrderItemDTO;
import com.foodsupplychain.oms.dto.StatusUpdateDTO;
import com.foodsupplychain.oms.entity.Customer;
import com.foodsupplychain.oms.entity.Order;
import com.foodsupplychain.oms.entity.Supplier;
import com.foodsupplychain.oms.enums.OrderStatus;
import com.foodsupplychain.oms.exception.ResourceNotFoundException;
import com.foodsupplychain.oms.service.OrderService;
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
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(OrderController.class)
class OrderControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private OrderService orderService;

    @Autowired
    private ObjectMapper objectMapper;

    private Order order;
    private OrderDTO orderDTO;
    private Customer customer;
    private Supplier supplier;

    @BeforeEach
    void setUp() {
        customer = new Customer();
        customer.setId(1L);
        customer.setName("Acme Corp");

        supplier = new Supplier();
        supplier.setId(1L);
        supplier.setName("Fresh Farms");

        order = new Order();
        order.setId(1L);
        order.setOrderNumber("ORD-ABC12345");
        order.setCustomer(customer);
        order.setSupplier(supplier);
        order.setStatus(OrderStatus.PENDING);
        order.setItems(new ArrayList<>());
        order.setTotalAmount(new BigDecimal("49.90"));
        order.setShippingAddress("123 Main St");
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
    }

    @Test
    void getAllOrders_returnsPagedResponse() throws Exception {
        Page<Order> page = new PageImpl<>(List.of(order));
        when(orderService.getAllOrders(any(Pageable.class))).thenReturn(page);

        mockMvc.perform(get("/api/orders"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].orderNumber").value("ORD-ABC12345"));
    }

    @Test
    void getOrderById_existingId_returnsOrder() throws Exception {
        when(orderService.getOrderById(1L)).thenReturn(order);

        mockMvc.perform(get("/api/orders/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.orderNumber").value("ORD-ABC12345"));
    }

    @Test
    void getOrderById_nonExistingId_returns404() throws Exception {
        when(orderService.getOrderById(99L)).thenThrow(new ResourceNotFoundException("Order", 99L));

        mockMvc.perform(get("/api/orders/99"))
                .andExpect(status().isNotFound());
    }

    @Test
    void getOrderByOrderNumber_returnsOrder() throws Exception {
        when(orderService.getOrderByOrderNumber("ORD-ABC12345")).thenReturn(order);

        mockMvc.perform(get("/api/orders/number/ORD-ABC12345"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.customerName").value("Acme Corp"));
    }

    @Test
    void getOrdersByCustomer_returnsOrders() throws Exception {
        when(orderService.getOrdersByCustomer(1L)).thenReturn(List.of(order));

        mockMvc.perform(get("/api/orders/customer/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].orderNumber").value("ORD-ABC12345"));
    }

    @Test
    void getOrdersBySupplier_returnsOrders() throws Exception {
        when(orderService.getOrdersBySupplier(1L)).thenReturn(List.of(order));

        mockMvc.perform(get("/api/orders/supplier/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].supplierName").value("Fresh Farms"));
    }

    @Test
    void getOrdersByStatus_returnsOrders() throws Exception {
        when(orderService.getOrdersByStatus(OrderStatus.PENDING)).thenReturn(List.of(order));

        mockMvc.perform(get("/api/orders/status/PENDING"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].status").value("PENDING"));
    }

    @Test
    void createOrder_validDto_returns201() throws Exception {
        when(orderService.createOrder(any(OrderDTO.class))).thenReturn(order);

        mockMvc.perform(post("/api/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(orderDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.orderNumber").value("ORD-ABC12345"));
    }

    @Test
    void createOrder_invalidDto_returns400() throws Exception {
        OrderDTO invalidDTO = new OrderDTO();

        mockMvc.perform(post("/api/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidDTO)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void updateOrder_validDto_returnsUpdated() throws Exception {
        when(orderService.updateOrder(eq(1L), any(OrderDTO.class))).thenReturn(order);

        mockMvc.perform(put("/api/orders/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(orderDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.orderNumber").value("ORD-ABC12345"));
    }

    @Test
    void updateOrderStatus_validStatus_returnsUpdated() throws Exception {
        when(orderService.updateOrderStatus(eq(1L), eq(OrderStatus.CONFIRMED))).thenReturn(order);
        StatusUpdateDTO statusDTO = new StatusUpdateDTO();
        statusDTO.setStatus(OrderStatus.CONFIRMED);

        mockMvc.perform(patch("/api/orders/1/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(statusDTO)))
                .andExpect(status().isOk());
    }

    @Test
    void updateOrderStatus_nullStatus_returns400() throws Exception {
        StatusUpdateDTO statusDTO = new StatusUpdateDTO();

        mockMvc.perform(patch("/api/orders/1/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(statusDTO)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void deleteOrder_existingId_returns204() throws Exception {
        doNothing().when(orderService).deleteOrder(1L);

        mockMvc.perform(delete("/api/orders/1"))
                .andExpect(status().isNoContent());
    }
}
