package com.example.demo.controller;

import com.example.demo.dto.LoginRequest;
import com.example.demo.dto.LoginResponse;
import com.example.demo.dto.RegisterRequest;
import com.example.demo.entity.User;
import com.example.demo.service.UserService;
import jakarta.validation.Valid;
import java.util.Map; // ✅ Add this import

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest registerRequest) {
        try {
            System.out.println("📝 Registering user: " + registerRequest.getUsername());
            User registeredUser = userService.registerUser(registerRequest);
            System.out.println("✅ User registered: " + registeredUser.getUsername());
            return ResponseEntity.ok(registeredUser);
        } catch (RuntimeException e) {
            System.out.println("❌ Registration failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            LoginResponse loginResponse = userService.loginUser(loginRequest);
            return ResponseEntity.ok(loginResponse);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", e.getMessage())); // ✅ Send a proper JSON object
        }
    }
}