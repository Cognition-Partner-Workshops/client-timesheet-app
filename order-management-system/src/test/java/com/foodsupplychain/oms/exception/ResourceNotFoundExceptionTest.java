package com.foodsupplychain.oms.exception;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class ResourceNotFoundExceptionTest {

    @Test
    void constructor_withMessage_setsMessage() {
        ResourceNotFoundException ex = new ResourceNotFoundException("Product not found");

        assertEquals("Product not found", ex.getMessage());
    }

    @Test
    void constructor_withResourceNameAndId_formatsMessage() {
        ResourceNotFoundException ex = new ResourceNotFoundException("Product", 42L);

        assertEquals("Product not found with id: 42", ex.getMessage());
    }

    @Test
    void isRuntimeException() {
        ResourceNotFoundException ex = new ResourceNotFoundException("test");

        assertInstanceOf(RuntimeException.class, ex);
    }
}
