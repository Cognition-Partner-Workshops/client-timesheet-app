package com.foodsupplychain.oms.exception;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.core.MethodParameter;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    void handleResourceNotFound_returns404WithMessage() {
        ResourceNotFoundException ex = new ResourceNotFoundException("Product not found with id: 1");

        ResponseEntity<Map<String, Object>> response = handler.handleResourceNotFound(ex);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertEquals(404, response.getBody().get("status"));
        assertEquals("Not Found", response.getBody().get("error"));
        assertEquals("Product not found with id: 1", response.getBody().get("message"));
        assertNotNull(response.getBody().get("timestamp"));
    }

    @Test
    void handleIllegalArgument_returns400WithMessage() {
        IllegalArgumentException ex = new IllegalArgumentException("SKU already exists");

        ResponseEntity<Map<String, Object>> response = handler.handleIllegalArgument(ex);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals(400, response.getBody().get("status"));
        assertEquals("Bad Request", response.getBody().get("error"));
        assertEquals("SKU already exists", response.getBody().get("message"));
    }

    @Test
    void handleGenericException_returns500WithMessage() {
        Exception ex = new Exception("Unexpected error");

        ResponseEntity<Map<String, Object>> response = handler.handleGenericException(ex);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertEquals(500, response.getBody().get("status"));
        assertEquals("Internal Server Error", response.getBody().get("error"));
        assertEquals("Unexpected error", response.getBody().get("message"));
    }

    @Test
    void handleValidationErrors_returns400WithFieldErrors() throws Exception {
        Object target = new Object();
        BeanPropertyBindingResult bindingResult = new BeanPropertyBindingResult(target, "target");
        bindingResult.addError(new FieldError("target", "name", "Name is required"));
        bindingResult.addError(new FieldError("target", "email", "Email is invalid"));

        MethodParameter methodParameter = new MethodParameter(
                this.getClass().getDeclaredMethod("handleValidationErrors_returns400WithFieldErrors"), -1);
        MethodArgumentNotValidException ex = new MethodArgumentNotValidException(methodParameter, bindingResult);

        ResponseEntity<Map<String, Object>> response = handler.handleValidationErrors(ex);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals(400, response.getBody().get("status"));
        assertEquals("Validation Failed", response.getBody().get("error"));
        @SuppressWarnings("unchecked")
        Map<String, String> errors = (Map<String, String>) response.getBody().get("errors");
        assertEquals("Name is required", errors.get("name"));
        assertEquals("Email is invalid", errors.get("email"));
    }
}
