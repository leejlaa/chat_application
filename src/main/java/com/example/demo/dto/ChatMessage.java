package com.example.demo.dto;

import lombok.Data;

@Data
public class ChatMessage {
    private String receiverUsername;
    private String content;
}
