package com.example.demo.controller;

import com.example.demo.dto.MessageDTO;
import com.example.demo.entity.Message;
import com.example.demo.repository.MessageRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.entity.User;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.transaction.annotation.Transactional;

import java.security.Principal;
import java.time.LocalDateTime;

@Transactional
@Controller
public class MessageController {

    private final SimpMessagingTemplate messagingTemplate;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;

    public MessageController(SimpMessagingTemplate messagingTemplate,
                             MessageRepository messageRepository,
                             UserRepository userRepository) {
        this.messagingTemplate = messagingTemplate;
        this.messageRepository = messageRepository;
        this.userRepository = userRepository;
    }

    @MessageMapping("/chat")
   public void sendMessage(@Payload MessageDTO messageDTO, Principal principal) {
    if (principal == null) {
        System.out.println("❌ No user principal in WebSocket session");
        return;
    }

    String senderUsername = principal.getName();
    System.out.println("✅ WebSocket message from: " + senderUsername);
        User sender = userRepository.findByUsername(senderUsername).orElse(null);
        User receiver = userRepository.findByUsername(messageDTO.getReceiver()).orElse(null);
    
        if (sender == null || receiver == null) {
            System.out.println("❌ Sender or receiver not found");
            return;
        }
    
        boolean areFriends = sender.getFriends().stream()
            .anyMatch(friend -> friend.getUsername().equals(receiver.getUsername()));
    
        if (!areFriends) {
            System.out.println("❌ Message rejected: not mutual friends");
            return;
        }
    
        // Save the message
        Message msg = new Message();
        msg.setSender(senderUsername);
        msg.setReceiver(messageDTO.getReceiver());
        msg.setContent(messageDTO.getContent());
        msg.setTimestamp(LocalDateTime.now());
        // Save to database
try {
    messageRepository.save(msg);
    System.out.println("💾 Message saved successfully. ID: " + msg.getId());
} catch (Exception e) {
    System.out.println("❌ Error saving message: " + e.getMessage());
    e.printStackTrace();
    return;
}

    
        System.out.println("✅ Sending message from " + senderUsername + " to " + receiver.getUsername());
    
        // Send to both sender and receiver topics
        messagingTemplate.convertAndSend("/topic/messages/" + msg.getReceiver(), msg);
        
    }
}
