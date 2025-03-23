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
        // Check if username already exists
        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            throw new RuntimeException("Username already exists");
        }

        // Check if email already exists
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        // Hash the password
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        // Save the user
        return userRepository.save(user);
    }

    public LoginResponse loginUser(LoginRequest loginRequest) {
        // Find the user by username
        Optional<User> userOptional = userRepository.findByUsername(loginRequest.getUsername());
        if (userOptional.isEmpty()) {
            throw new RuntimeException("User not found");
        }

        User user = userOptional.get();

        // Verify the password
        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        // Generate a JWT token
        String token = Jwts.builder()
                .setSubject(user.getUsername())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 86400000)) // 1 day
                .signWith(SECRET_KEY)
                .compact();

        return new LoginResponse(token);
    }
}