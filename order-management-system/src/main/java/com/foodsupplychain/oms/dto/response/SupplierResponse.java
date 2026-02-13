package com.foodsupplychain.oms.dto.response;

import com.foodsupplychain.oms.entity.Supplier;

public class SupplierResponse {

    private Long id;
    private String name;
    private String contactPerson;
    private String email;
    private String phone;
    private String address;
    private String city;
    private String state;
    private String zipCode;
    private String country;
    private String paymentTerms;
    private Boolean active;

    public static SupplierResponse fromEntity(Supplier supplier) {
        SupplierResponse response = new SupplierResponse();
        response.setId(supplier.getId());
        response.setName(supplier.getName());
        response.setContactPerson(supplier.getContactPerson());
        response.setEmail(supplier.getEmail());
        response.setPhone(supplier.getPhone());
        response.setAddress(supplier.getAddress());
        response.setCity(supplier.getCity());
        response.setState(supplier.getState());
        response.setZipCode(supplier.getZipCode());
        response.setCountry(supplier.getCountry());
        response.setPaymentTerms(supplier.getPaymentTerms());
        response.setActive(supplier.getActive());
        return response;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getContactPerson() {
        return contactPerson;
    }

    public void setContactPerson(String contactPerson) {
        this.contactPerson = contactPerson;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getZipCode() {
        return zipCode;
    }

    public void setZipCode(String zipCode) {
        this.zipCode = zipCode;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public String getPaymentTerms() {
        return paymentTerms;
    }

    public void setPaymentTerms(String paymentTerms) {
        this.paymentTerms = paymentTerms;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }
}
