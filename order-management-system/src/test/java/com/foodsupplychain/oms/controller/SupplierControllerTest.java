package com.foodsupplychain.oms.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.foodsupplychain.oms.dto.SupplierDTO;
import com.foodsupplychain.oms.entity.Supplier;
import com.foodsupplychain.oms.exception.ResourceNotFoundException;
import com.foodsupplychain.oms.service.SupplierService;
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
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(SupplierController.class)
class SupplierControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private SupplierService supplierService;

    @Autowired
    private ObjectMapper objectMapper;

    private Supplier supplier;
    private SupplierDTO supplierDTO;

    @BeforeEach
    void setUp() {
        supplier = new Supplier();
        supplier.setId(1L);
        supplier.setName("Fresh Farms");
        supplier.setContactPerson("John Doe");
        supplier.setEmail("john@freshfarms.com");
        supplier.setPhone("555-0100");
        supplier.setActive(true);

        supplierDTO = new SupplierDTO();
        supplierDTO.setName("Fresh Farms");
        supplierDTO.setContactPerson("John Doe");
        supplierDTO.setEmail("john@freshfarms.com");
        supplierDTO.setPhone("555-0100");
    }

    @Test
    void getAllSuppliers_returnsPagedResponse() throws Exception {
        Page<Supplier> page = new PageImpl<>(List.of(supplier));
        when(supplierService.getAllSuppliers(any(Pageable.class))).thenReturn(page);

        mockMvc.perform(get("/api/suppliers"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].name").value("Fresh Farms"));
    }

    @Test
    void getSupplierById_existingId_returnsSupplier() throws Exception {
        when(supplierService.getSupplierById(1L)).thenReturn(supplier);

        mockMvc.perform(get("/api/suppliers/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Fresh Farms"));
    }

    @Test
    void getSupplierById_nonExistingId_returns404() throws Exception {
        when(supplierService.getSupplierById(99L)).thenThrow(new ResourceNotFoundException("Supplier", 99L));

        mockMvc.perform(get("/api/suppliers/99"))
                .andExpect(status().isNotFound());
    }

    @Test
    void getActiveSuppliers_returnsActive() throws Exception {
        when(supplierService.getActiveSuppliers()).thenReturn(List.of(supplier));

        mockMvc.perform(get("/api/suppliers/active"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].active").value(true));
    }

    @Test
    void searchSuppliers_returnsMatching() throws Exception {
        when(supplierService.searchSuppliers("Fresh")).thenReturn(List.of(supplier));

        mockMvc.perform(get("/api/suppliers/search").param("name", "Fresh"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Fresh Farms"));
    }

    @Test
    void createSupplier_validDto_returns201() throws Exception {
        when(supplierService.createSupplier(any(SupplierDTO.class))).thenReturn(supplier);

        mockMvc.perform(post("/api/suppliers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(supplierDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Fresh Farms"));
    }

    @Test
    void createSupplier_invalidDto_returns400() throws Exception {
        SupplierDTO invalidDTO = new SupplierDTO();

        mockMvc.perform(post("/api/suppliers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidDTO)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void updateSupplier_validDto_returnsUpdated() throws Exception {
        when(supplierService.updateSupplier(eq(1L), any(SupplierDTO.class))).thenReturn(supplier);

        mockMvc.perform(put("/api/suppliers/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(supplierDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Fresh Farms"));
    }

    @Test
    void deleteSupplier_existingId_returns204() throws Exception {
        doNothing().when(supplierService).deleteSupplier(1L);

        mockMvc.perform(delete("/api/suppliers/1"))
                .andExpect(status().isNoContent());
    }
}
