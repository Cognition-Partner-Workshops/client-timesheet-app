package com.foodsupplychain.oms.service;

import com.foodsupplychain.oms.dto.CustomerDTO;
import com.foodsupplychain.oms.entity.Customer;
import com.foodsupplychain.oms.exception.ResourceNotFoundException;
import com.foodsupplychain.oms.repository.CustomerRepository;
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
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CustomerServiceTest {

    @Mock
    private CustomerRepository customerRepository;

    @InjectMocks
    private CustomerService customerService;

    private Customer customer;
    private CustomerDTO customerDTO;

    @BeforeEach
    void setUp() {
        customer = new Customer();
        customer.setId(1L);
        customer.setName("Acme Corp");
        customer.setEmail("contact@acme.com");
        customer.setPhone("555-0200");
        customer.setAddress("456 Main St");
        customer.setCity("Chicago");
        customer.setState("IL");
        customer.setZipCode("60601");
        customer.setCountry("USA");
        customer.setBusinessName("Acme Corporation");
        customer.setTaxId("TAX-C001");
        customer.setCreditLimit(new BigDecimal("50000"));
        customer.setActive(true);

        customerDTO = new CustomerDTO();
        customerDTO.setName("Acme Corp");
        customerDTO.setEmail("contact@acme.com");
        customerDTO.setPhone("555-0200");
        customerDTO.setAddress("456 Main St");
        customerDTO.setCity("Chicago");
        customerDTO.setState("IL");
        customerDTO.setZipCode("60601");
        customerDTO.setCountry("USA");
        customerDTO.setBusinessName("Acme Corporation");
        customerDTO.setTaxId("TAX-C001");
        customerDTO.setCreditLimit(new BigDecimal("50000"));
        customerDTO.setActive(true);
    }

    @Test
    void getAllCustomers_returnsPaginatedResults() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Customer> page = new PageImpl<>(List.of(customer));
        when(customerRepository.findAll(pageable)).thenReturn(page);

        Page<Customer> result = customerService.getAllCustomers(pageable);

        assertEquals(1, result.getTotalElements());
    }

    @Test
    void getCustomerById_existingId_returnsCustomer() {
        when(customerRepository.findById(1L)).thenReturn(Optional.of(customer));

        Customer result = customerService.getCustomerById(1L);

        assertEquals("Acme Corp", result.getName());
    }

    @Test
    void getCustomerById_nonExistingId_throwsException() {
        when(customerRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> customerService.getCustomerById(99L));
    }

    @Test
    void getCustomerByEmail_existingEmail_returnsCustomer() {
        when(customerRepository.findByEmail("contact@acme.com")).thenReturn(Optional.of(customer));

        Customer result = customerService.getCustomerByEmail("contact@acme.com");

        assertEquals("Acme Corp", result.getName());
    }

    @Test
    void getCustomerByEmail_nonExistingEmail_throwsException() {
        when(customerRepository.findByEmail("invalid@example.com")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> customerService.getCustomerByEmail("invalid@example.com"));
    }

    @Test
    void getActiveCustomers_returnsActiveOnly() {
        when(customerRepository.findByActive(true)).thenReturn(List.of(customer));

        List<Customer> result = customerService.getActiveCustomers();

        assertEquals(1, result.size());
    }

    @Test
    void searchCustomers_returnsMatchingCustomers() {
        when(customerRepository.findByNameContainingIgnoreCase("Acme")).thenReturn(List.of(customer));

        List<Customer> result = customerService.searchCustomers("Acme");

        assertEquals(1, result.size());
    }

    @Test
    void createCustomer_uniqueEmail_createsSuccessfully() {
        when(customerRepository.findByEmail("contact@acme.com")).thenReturn(Optional.empty());
        when(customerRepository.save(any(Customer.class))).thenReturn(customer);

        Customer result = customerService.createCustomer(customerDTO);

        assertEquals("Acme Corp", result.getName());
    }

    @Test
    void createCustomer_duplicateEmail_throwsException() {
        when(customerRepository.findByEmail("contact@acme.com")).thenReturn(Optional.of(customer));

        assertThrows(IllegalArgumentException.class, () -> customerService.createCustomer(customerDTO));
    }

    @Test
    void createCustomer_withNullActive_keepsDefault() {
        customerDTO.setActive(null);
        when(customerRepository.findByEmail("contact@acme.com")).thenReturn(Optional.empty());
        when(customerRepository.save(any(Customer.class))).thenReturn(customer);

        Customer result = customerService.createCustomer(customerDTO);

        assertNotNull(result);
    }

    @Test
    void updateCustomer_existingId_updatesSuccessfully() {
        when(customerRepository.findById(1L)).thenReturn(Optional.of(customer));
        when(customerRepository.save(any(Customer.class))).thenReturn(customer);

        Customer result = customerService.updateCustomer(1L, customerDTO);

        assertEquals("Acme Corp", result.getName());
    }

    @Test
    void deleteCustomer_existingId_deletesSuccessfully() {
        when(customerRepository.findById(1L)).thenReturn(Optional.of(customer));

        customerService.deleteCustomer(1L);

        verify(customerRepository).delete(customer);
    }

    @Test
    void deleteCustomer_nonExistingId_throwsException() {
        when(customerRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> customerService.deleteCustomer(99L));
    }
}
