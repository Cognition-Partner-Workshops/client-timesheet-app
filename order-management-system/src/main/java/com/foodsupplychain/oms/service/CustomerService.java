package com.foodsupplychain.oms.service;

import com.foodsupplychain.oms.dto.CustomerDTO;
import com.foodsupplychain.oms.entity.Customer;
import com.foodsupplychain.oms.exception.ResourceNotFoundException;
import com.foodsupplychain.oms.repository.CustomerRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@Transactional
public class CustomerService {

    private final CustomerRepository customerRepository;

    public CustomerService(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    public List<Customer> getAllCustomers() {
        return customerRepository.findAll();
    }

    public Customer getCustomerById(Long id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", id));
    }

    public Customer getCustomerByEmail(String email) {
        return customerRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with email: " + email));
    }

    public List<Customer> getActiveCustomers() {
        return customerRepository.findByActive(true);
    }

    public List<Customer> searchCustomers(String name) {
        return customerRepository.findByNameContainingIgnoreCase(name);
    }

    public Customer createCustomer(CustomerDTO dto) {
        customerRepository.findByEmail(dto.getEmail()).ifPresent(c -> {
            throw new IllegalArgumentException("Customer with email '" + dto.getEmail() + "' already exists");
        });

        Customer customer = new Customer();
        mapDtoToEntity(dto, customer);
        return customerRepository.save(customer);
    }

    public Customer updateCustomer(Long id, CustomerDTO dto) {
        Customer customer = getCustomerById(id);
        mapDtoToEntity(dto, customer);
        return customerRepository.save(customer);
    }

    public void deleteCustomer(Long id) {
        Customer customer = getCustomerById(id);
        customerRepository.delete(customer);
    }

    private void mapDtoToEntity(CustomerDTO dto, Customer customer) {
        customer.setName(dto.getName());
        customer.setEmail(dto.getEmail());
        customer.setPhone(dto.getPhone());
        customer.setAddress(dto.getAddress());
        customer.setCity(dto.getCity());
        customer.setState(dto.getState());
        customer.setZipCode(dto.getZipCode());
        customer.setCountry(dto.getCountry());
        customer.setBusinessName(dto.getBusinessName());
        customer.setTaxId(dto.getTaxId());
        customer.setCreditLimit(dto.getCreditLimit());
        if (dto.getActive() != null) {
            customer.setActive(dto.getActive());
        }
    }
}
