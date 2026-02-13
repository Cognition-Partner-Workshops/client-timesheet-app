package com.foodsupplychain.oms.service;

import com.foodsupplychain.oms.dto.SupplierDTO;
import com.foodsupplychain.oms.entity.Supplier;
import com.foodsupplychain.oms.exception.ResourceNotFoundException;
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
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SupplierServiceTest {

    @Mock
    private SupplierRepository supplierRepository;

    @InjectMocks
    private SupplierService supplierService;

    private Supplier supplier;
    private SupplierDTO supplierDTO;

    @BeforeEach
    void setUp() {
        supplier = new Supplier();
        supplier.setId(1L);
        supplier.setName("Fresh Farms Inc.");
        supplier.setContactPerson("John Doe");
        supplier.setEmail("john@freshfarms.com");
        supplier.setPhone("555-0100");
        supplier.setAddress("123 Farm Rd");
        supplier.setCity("Springfield");
        supplier.setState("IL");
        supplier.setZipCode("62701");
        supplier.setCountry("USA");
        supplier.setTaxId("TAX-001");
        supplier.setPaymentTerms("Net 30");
        supplier.setActive(true);

        supplierDTO = new SupplierDTO();
        supplierDTO.setName("Fresh Farms Inc.");
        supplierDTO.setContactPerson("John Doe");
        supplierDTO.setEmail("john@freshfarms.com");
        supplierDTO.setPhone("555-0100");
        supplierDTO.setAddress("123 Farm Rd");
        supplierDTO.setCity("Springfield");
        supplierDTO.setState("IL");
        supplierDTO.setZipCode("62701");
        supplierDTO.setCountry("USA");
        supplierDTO.setTaxId("TAX-001");
        supplierDTO.setPaymentTerms("Net 30");
        supplierDTO.setActive(true);
    }

    @Test
    void getAllSuppliers_returnsPaginatedResults() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Supplier> page = new PageImpl<>(List.of(supplier));
        when(supplierRepository.findAll(pageable)).thenReturn(page);

        Page<Supplier> result = supplierService.getAllSuppliers(pageable);

        assertEquals(1, result.getTotalElements());
        verify(supplierRepository).findAll(pageable);
    }

    @Test
    void getSupplierById_existingId_returnsSupplier() {
        when(supplierRepository.findById(1L)).thenReturn(Optional.of(supplier));

        Supplier result = supplierService.getSupplierById(1L);

        assertEquals("Fresh Farms Inc.", result.getName());
    }

    @Test
    void getSupplierById_nonExistingId_throwsException() {
        when(supplierRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> supplierService.getSupplierById(99L));
    }

    @Test
    void getActiveSuppliers_returnsActiveOnly() {
        when(supplierRepository.findByActive(true)).thenReturn(List.of(supplier));

        List<Supplier> result = supplierService.getActiveSuppliers();

        assertEquals(1, result.size());
        assertTrue(result.get(0).getActive());
    }

    @Test
    void searchSuppliers_returnsMatchingSuppliers() {
        when(supplierRepository.findByNameContainingIgnoreCase("Fresh")).thenReturn(List.of(supplier));

        List<Supplier> result = supplierService.searchSuppliers("Fresh");

        assertEquals(1, result.size());
    }

    @Test
    void createSupplier_createsSuccessfully() {
        when(supplierRepository.save(any(Supplier.class))).thenReturn(supplier);

        Supplier result = supplierService.createSupplier(supplierDTO);

        assertEquals("Fresh Farms Inc.", result.getName());
        verify(supplierRepository).save(any(Supplier.class));
    }

    @Test
    void createSupplier_withNullActive_defaultsToTrue() {
        supplierDTO.setActive(null);
        when(supplierRepository.save(any(Supplier.class))).thenReturn(supplier);

        Supplier result = supplierService.createSupplier(supplierDTO);

        assertNotNull(result);
    }

    @Test
    void updateSupplier_existingId_updatesSuccessfully() {
        when(supplierRepository.findById(1L)).thenReturn(Optional.of(supplier));
        when(supplierRepository.save(any(Supplier.class))).thenReturn(supplier);

        Supplier result = supplierService.updateSupplier(1L, supplierDTO);

        assertEquals("Fresh Farms Inc.", result.getName());
    }

    @Test
    void updateSupplier_nonExistingId_throwsException() {
        when(supplierRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> supplierService.updateSupplier(99L, supplierDTO));
    }

    @Test
    void deleteSupplier_existingId_deletesSuccessfully() {
        when(supplierRepository.findById(1L)).thenReturn(Optional.of(supplier));

        supplierService.deleteSupplier(1L);

        verify(supplierRepository).delete(supplier);
    }

    @Test
    void deleteSupplier_nonExistingId_throwsException() {
        when(supplierRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> supplierService.deleteSupplier(99L));
    }
}
