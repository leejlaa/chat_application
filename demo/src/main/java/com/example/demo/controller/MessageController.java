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

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.List;

@Transactional
@RestController // ← change from @Controller to @RestController
@RequestMapping("/api/messages")
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
}
