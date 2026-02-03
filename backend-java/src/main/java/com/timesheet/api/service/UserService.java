package com.timesheet.api.service;

import com.timesheet.api.dto.LoginRequest;
import com.timesheet.api.dto.LoginResponse;
import com.timesheet.api.dto.UserResponse;
import com.timesheet.api.entity.User;
import com.timesheet.api.repository.UserRepository;
import com.timesheet.api.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private static final DateTimeFormatter ISO_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    @Transactional
    public LoginResponse login(LoginRequest request) {
        String email = request.getEmail().toLowerCase().trim();
        Optional<User> existingUser = userRepository.findByEmail(email);

        if (existingUser.isPresent()) {
            User user = existingUser.get();
            return LoginResponse.builder()
                    .message("Login successful")
                    .user(UserResponse.builder()
                            .email(user.getEmail())
                            .createdAt(user.getCreatedAt().format(ISO_FORMATTER))
                            .build())
                    .build();
        } else {
            User newUser = User.builder()
                    .email(email)
                    .createdAt(LocalDateTime.now())
                    .build();
            userRepository.save(newUser);

            return LoginResponse.builder()
                    .message("User created and logged in successfully")
                    .user(UserResponse.builder()
                            .email(newUser.getEmail())
                            .createdAt(newUser.getCreatedAt().format(ISO_FORMATTER))
                            .build())
                    .build();
        }
    }

    public String generateToken(String email) {
        return jwtUtil.generateToken(email);
    }

    public UserResponse getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return UserResponse.builder()
                .email(user.getEmail())
                .createdAt(user.getCreatedAt().format(ISO_FORMATTER))
                .build();
    }
}
