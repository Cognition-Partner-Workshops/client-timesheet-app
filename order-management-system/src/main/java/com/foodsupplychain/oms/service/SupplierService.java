package com.foodsupplychain.oms.service;

import com.foodsupplychain.oms.dto.SupplierDTO;
import com.foodsupplychain.oms.entity.Supplier;
import com.foodsupplychain.oms.exception.ResourceNotFoundException;
import com.foodsupplychain.oms.repository.SupplierRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@Transactional
public class SupplierService {

    private final SupplierRepository supplierRepository;

    public SupplierService(SupplierRepository supplierRepository) {
        this.supplierRepository = supplierRepository;
    }

    public List<Supplier> getAllSuppliers() {
        return supplierRepository.findAll();
    }

    public Supplier getSupplierById(Long id) {
        return supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier", id));
    }

    public List<Supplier> getActiveSuppliers() {
        return supplierRepository.findByActive(true);
    }

    public List<Supplier> searchSuppliers(String name) {
        return supplierRepository.findByNameContainingIgnoreCase(name);
    }

    public Supplier createSupplier(SupplierDTO dto) {
        Supplier supplier = new Supplier();
        mapDtoToEntity(dto, supplier);
        return supplierRepository.save(supplier);
    }

    public Supplier updateSupplier(Long id, SupplierDTO dto) {
        Supplier supplier = getSupplierById(id);
        mapDtoToEntity(dto, supplier);
        return supplierRepository.save(supplier);
    }

    public void deleteSupplier(Long id) {
        Supplier supplier = getSupplierById(id);
        supplierRepository.delete(supplier);
    }

    private void mapDtoToEntity(SupplierDTO dto, Supplier supplier) {
        supplier.setName(dto.getName());
        supplier.setContactPerson(dto.getContactPerson());
        supplier.setEmail(dto.getEmail());
        supplier.setPhone(dto.getPhone());
        supplier.setAddress(dto.getAddress());
        supplier.setCity(dto.getCity());
        supplier.setState(dto.getState());
        supplier.setZipCode(dto.getZipCode());
        supplier.setCountry(dto.getCountry());
        supplier.setTaxId(dto.getTaxId());
        supplier.setPaymentTerms(dto.getPaymentTerms());
        if (dto.getActive() != null) {
            supplier.setActive(dto.getActive());
        }
    }
}
