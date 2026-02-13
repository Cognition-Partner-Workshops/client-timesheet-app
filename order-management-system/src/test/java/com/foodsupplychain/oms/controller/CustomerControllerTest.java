package com.foodsupplychain.oms.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.foodsupplychain.oms.dto.CustomerDTO;
import com.foodsupplychain.oms.entity.Customer;
import com.foodsupplychain.oms.exception.ResourceNotFoundException;
import com.foodsupplychain.oms.service.CustomerService;
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

@WebMvcTest(CustomerController.class)
class CustomerControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private CustomerService customerService;

    @Autowired
    private ObjectMapper objectMapper;

    private Customer customer;
    private CustomerDTO customerDTO;

    @BeforeEach
    void setUp() {
        customer = new Customer();
        customer.setId(1L);
        customer.setName("Acme Corp");
        customer.setEmail("contact@acme.com");
        customer.setPhone("555-0200");
        customer.setBusinessName("Acme Corporation");
        customer.setCreditLimit(new BigDecimal("50000"));
        customer.setActive(true);

        customerDTO = new CustomerDTO();
        customerDTO.setName("Acme Corp");
        customerDTO.setEmail("contact@acme.com");
        customerDTO.setPhone("555-0200");
    }

    @Test
    void getAllCustomers_returnsPagedResponse() throws Exception {
        Page<Customer> page = new PageImpl<>(List.of(customer));
        when(customerService.getAllCustomers(any(Pageable.class))).thenReturn(page);

        mockMvc.perform(get("/api/customers"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].name").value("Acme Corp"));
    }

    @Test
    void getCustomerById_existingId_returnsCustomer() throws Exception {
        when(customerService.getCustomerById(1L)).thenReturn(customer);

        mockMvc.perform(get("/api/customers/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Acme Corp"));
    }

    @Test
    void getCustomerById_nonExistingId_returns404() throws Exception {
        when(customerService.getCustomerById(99L)).thenThrow(new ResourceNotFoundException("Customer", 99L));

        mockMvc.perform(get("/api/customers/99"))
                .andExpect(status().isNotFound());
    }

    @Test
    void getCustomerByEmail_existingEmail_returnsCustomer() throws Exception {
        when(customerService.getCustomerByEmail("contact@acme.com")).thenReturn(customer);

        mockMvc.perform(get("/api/customers/email/contact@acme.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("contact@acme.com"));
    }

    @Test
    void getActiveCustomers_returnsActive() throws Exception {
        when(customerService.getActiveCustomers()).thenReturn(List.of(customer));

        mockMvc.perform(get("/api/customers/active"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].active").value(true));
    }

    @Test
    void searchCustomers_returnsMatching() throws Exception {
        when(customerService.searchCustomers("Acme")).thenReturn(List.of(customer));

        mockMvc.perform(get("/api/customers/search").param("name", "Acme"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Acme Corp"));
    }

    @Test
    void createCustomer_validDto_returns201() throws Exception {
        when(customerService.createCustomer(any(CustomerDTO.class))).thenReturn(customer);

        mockMvc.perform(post("/api/customers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(customerDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Acme Corp"));
    }

    @Test
    void createCustomer_invalidDto_returns400() throws Exception {
        CustomerDTO invalidDTO = new CustomerDTO();

        mockMvc.perform(post("/api/customers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidDTO)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void updateCustomer_validDto_returnsUpdated() throws Exception {
        when(customerService.updateCustomer(eq(1L), any(CustomerDTO.class))).thenReturn(customer);

        mockMvc.perform(put("/api/customers/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(customerDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Acme Corp"));
    }

    @Test
    void deleteCustomer_existingId_returns204() throws Exception {
        doNothing().when(customerService).deleteCustomer(1L);

        mockMvc.perform(delete("/api/customers/1"))
                .andExpect(status().isNoContent());
    }

    @Test
    void createCustomer_duplicateEmail_returns400() throws Exception {
        when(customerService.createCustomer(any(CustomerDTO.class)))
                .thenThrow(new IllegalArgumentException("Customer with email 'contact@acme.com' already exists"));

        mockMvc.perform(post("/api/customers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(customerDTO)))
                .andExpect(status().isBadRequest());
    }
}
