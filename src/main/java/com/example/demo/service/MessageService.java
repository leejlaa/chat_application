package com.example.demo.service;

import com.example.demo.dto.ChatMessage;
import com.example.demo.entity.Message;
import com.example.demo.entity.User;
import com.example.demo.repository.MessageRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class MessageService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MessageRepository messageRepository;

    public Message sendMessage(String senderUsername, ChatMessage chatMessage) {
        User sender = userRepository.findByUsername(senderUsername)
                .orElseThrow(() -> new RuntimeException("Sender not found"));

        User receiver = userRepository.findByUsername(chatMessage.getReceiverUsername())
                .orElseThrow(() -> new RuntimeException("Receiver not found"));

        if (!sender.getFriends().contains(receiver)) {
            throw new RuntimeException("You are not friends with this user.");
        }

        Message message = Message.builder()
                .sender(sender.getUsername())
                .receiver(receiver.getUsername())
                .content(chatMessage.getContent())
                .timestamp(LocalDateTime.now())
                .build();

        return messageRepository.save(message);
    }
}
