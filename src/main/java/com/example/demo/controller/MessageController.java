package com.example.demo.controller;

import com.example.demo.dto.MessageDTO;
import com.example.demo.entity.Message;
import com.example.demo.entity.User;
import com.example.demo.repository.MessageRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*; // ← added
import org.springframework.transaction.annotation.Transactional;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.http.ResponseEntity;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.*;

@Transactional
@RestController // ← change from @Controller to @RestController
@RequestMapping("/api/messages")
public class MessageController {

    private final SimpMessagingTemplate messagingTemplate;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final JdbcTemplate jdbcTemplate;


    public MessageController(SimpMessagingTemplate messagingTemplate,
                             MessageRepository messageRepository,
                             UserRepository userRepository,
                             JdbcTemplate jdbcTemplate) {
        this.messagingTemplate = messagingTemplate;
        this.messageRepository = messageRepository;
        this.userRepository = userRepository;
        this.jdbcTemplate = jdbcTemplate;
    }

    @MessageMapping("/chat")
    public void sendMessage(@Payload MessageDTO messageDTO, Principal principal) {
        if (principal == null) {
            System.out.println("❌ No user principal in WebSocket session");
            return;
        }

        String senderUsername = principal.getName();
        User sender = userRepository.findByUsername(senderUsername).orElse(null);
        User receiver = userRepository.findByUsername(messageDTO.getReceiver()).orElse(null);

        if (sender == null || receiver == null) return;

        boolean areFriends = sender.getFriends().stream()
                .anyMatch(friend -> friend.getUsername().equals(receiver.getUsername()));

        if (!areFriends) return;

        Message msg = new Message();
        msg.setSender(senderUsername);
        msg.setReceiver(receiver.getUsername());
        msg.setContent(messageDTO.getContent());
        msg.setTimestamp(LocalDateTime.now());

        messageRepository.save(msg);
        messagingTemplate.convertAndSend("/topic/messages/" + receiver.getUsername(), msg);
        messagingTemplate.convertAndSend("/topic/messages/" + senderUsername, msg);

    }

    // ✅ REST endpoint for chat history
    @GetMapping("/history")
    public List<Message> getChatHistory(@RequestParam String friendUsername, Principal principal) {
        String currentUsername = principal.getName();
        return messageRepository.findBySenderAndReceiverOrReceiverAndSenderOrderByTimestampAsc(
                currentUsername, friendUsername,
                currentUsername, friendUsername
        );
    }

    // REST endpoint for recent chats
    @GetMapping("/recent")
    public ResponseEntity<?> getRecentChats(Principal principal) {
        try {
            String currentUsername = principal.getName();
            List<Message> allMessages = messageRepository.findBySenderOrReceiverOrderByTimestampDesc(
                    currentUsername, currentUsername);
            
            // Process the messages to get only the most recent one for each conversation
            Map<String, Message> latestMessagesByContact = new HashMap<>();
            
            for (Message message : allMessages) {
                String chatPartner;
                if (message.getSender().equals(currentUsername)) {
                    chatPartner = message.getReceiver();
                } else {
                    chatPartner = message.getSender();
                }
                
                // Only keep the latest message for each contact
                if (!latestMessagesByContact.containsKey(chatPartner) || 
                    message.getTimestamp().isAfter(latestMessagesByContact.get(chatPartner).getTimestamp())) {
                    latestMessagesByContact.put(chatPartner, message);
                }
            }
            
            // Convert the map values to a list and sort by timestamp
            List<Message> result = new ArrayList<>(latestMessagesByContact.values());
            result.sort((m1, m2) -> m2.getTimestamp().compareTo(m1.getTimestamp()));
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error fetching recent chats: " + e.getMessage());
        }
    }
}
