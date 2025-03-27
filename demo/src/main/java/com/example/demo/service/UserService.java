package com.example.demo.service;

import com.example.demo.dto.LoginRequest;
import com.example.demo.dto.LoginResponse;
import com.example.demo.entity.User;
import com.example.demo.repository.UserRepository;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private static final SecretKey SECRET_KEY = Keys.secretKeyFor(SignatureAlgorithm.HS256);

    public User registerUser(User user) {
        System.out.println("📝 Attempting to register user: " + user.getUsername());
    
        // Check if username exists
        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            System.out.println("❌ Username already exists: " + user.getUsername());
            throw new RuntimeException("Username already exists");
        }
    
        // Check if email exists
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            System.out.println("❌ Email already exists: " + user.getEmail());
            throw new RuntimeException("Email already exists");
        }
    
        // Hash password
        System.out.println("🔑 Hashing password...");
        user.setPassword(passwordEncoder.encode(user.getPassword()));
    
        // Save user
        User savedUser = userRepository.save(user);
        System.out.println("✅ User successfully registered: " + savedUser.getId());
    
        return savedUser;
    }

    public LoginResponse loginUser(LoginRequest loginRequest) {
        System.out.println("🔍 Checking user: " + loginRequest.getUsername());
    
        Optional<User> userOptional = userRepository.findByUsername(loginRequest.getUsername());
        if (userOptional.isEmpty()) {
            System.out.println("❌ User not found in database");
            throw new RuntimeException("User not found");
        }
    
        User user = userOptional.get();
        System.out.println("✅ User found: " + user.getUsername());
    
        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            System.out.println("❌ Incorrect password");
            throw new RuntimeException("Invalid password");
        }
    
        System.out.println("✅ Password matches. Generating token...");
        String token = Jwts.builder()
                .setSubject(user.getUsername())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 86400000)) // 1 day
                .signWith(SECRET_KEY)
                .compact();
    
        return new LoginResponse(token);
    }
}