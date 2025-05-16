package com.example.demo.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;
import org.springframework.lang.NonNull;

import com.example.demo.service.UserService;

import java.util.List;

@Component
public class JwtChannelInterceptor implements ChannelInterceptor {

    private final UserService userService;

    public JwtChannelInterceptor(UserService userService) {
        this.userService = userService;
    }

    @Override
    public Message<?> preSend(@NonNull Message<?> message, @NonNull MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (accessor == null || accessor.getCommand() == null) return message;
    
        StompCommand command = accessor.getCommand();
    
        if (command == StompCommand.CONNECT) {
            List<String> authHeaders = accessor.getNativeHeader("Authorization");
            if (authHeaders == null || authHeaders.isEmpty()) {
                System.out.println("⚠️ No Authorization header in CONNECT frame");
                throw new IllegalArgumentException("Missing token");
            }
    
            String token = authHeaders.get(0).replace("Bearer ", "").trim();
            try {
                System.out.println("🔐 Token received: " + token);
    
                Claims claims = Jwts.parserBuilder()
                        .setSigningKey(userService.getSecretKey())
                        .build()
                        .parseClaimsJws(token)
                        .getBody();
    
                String username = claims.getSubject();
                System.out.println("✅ Token validated for user: " + username);
    
                UsernamePasswordAuthenticationToken auth =
                        new UsernamePasswordAuthenticationToken(
                                username, null, List.of(new SimpleGrantedAuthority("ROLE_USER")));
                accessor.setUser(auth);
    
            } catch (Exception e) {
                System.out.println("❌ Invalid token: " + e.getMessage());
                throw new IllegalArgumentException("Invalid token");
            }
        }
    
        if (command == StompCommand.SEND && accessor.getUser() == null) {
            System.out.println("⚠️ Message sent without authentication context.");
        }
    
        return message;
    }
    

}
