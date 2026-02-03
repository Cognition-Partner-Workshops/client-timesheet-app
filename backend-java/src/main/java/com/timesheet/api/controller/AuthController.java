package com.timesheet.api.controller;

import com.timesheet.api.dto.LoginRequest;
import com.timesheet.api.dto.LoginResponse;
import com.timesheet.api.dto.UserResponse;
import com.timesheet.api.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = userService.login(request);
        
        String token = userService.generateToken(request.getEmail().toLowerCase().trim());
        
        Map<String, Object> result = new HashMap<>();
        result.put("message", response.getMessage());
        result.put("user", response.getUser());
        result.put("token", token);
        
        if (response.getMessage().contains("created")) {
            return ResponseEntity.status(HttpStatus.CREATED).body(result);
        }
        return ResponseEntity.ok(result);
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(Authentication authentication) {
        String email = (String) authentication.getPrincipal();
        UserResponse user = userService.getCurrentUser(email);
        return ResponseEntity.ok(user);
    }
}
