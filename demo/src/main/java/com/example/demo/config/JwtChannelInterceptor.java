package com.example.demo.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

import com.example.demo.service.UserService;

import java.security.Principal;
import java.util.List;

@Component
public class JwtChannelInterceptor implements ChannelInterceptor {

    private final UserService userService;

    public JwtChannelInterceptor(UserService userService) {
        this.userService = userService;
    }

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor != null && accessor.getCommand() != null) {
if (accessor.getCommand().equals(StompCommand.CONNECT) || accessor.getCommand().equals(StompCommand.SEND)) {
                List<String> authHeaders = accessor.getNativeHeader("Authorization");
                if (authHeaders != null && !authHeaders.isEmpty()) {
                    String token = authHeaders.get(0).replace("Bearer ", "").trim();
                    try {
                        System.out.println("🔐 WebSocket token received: " + token);

                        Claims claims = Jwts.parserBuilder()
                                .setSigningKey(userService.getSecretKey())
                                .build()
                                .parseClaimsJws(token)
                                .getBody();

                        String username = claims.getSubject();
                        System.out.println("✅ Token validated for user: " + username);

                        UsernamePasswordAuthenticationToken authentication =
                                new UsernamePasswordAuthenticationToken(
                                        username,
                                        null,
                                        List.of(new SimpleGrantedAuthority("ROLE_USER"))
                                );

                        // Only accessor.setUser is required for WebSocket identity
                        accessor.setUser(authentication);

                    } catch (Exception e) {
                        System.out.println("❌ Invalid token in WebSocket: " + e.getMessage());
                        throw new IllegalArgumentException("Invalid token");
                    }
                } else {
                    System.out.println("⚠️ No Authorization header in STOMP CONNECT/SEND frame");
                }
            }
        }

        return message;
    }
}
