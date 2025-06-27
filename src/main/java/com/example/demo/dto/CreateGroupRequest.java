package com.example.demo.dto;

import lombok.Data;

import java.util.List;

@Data
public class CreateGroupRequest {
    private String name;
    private List<String> memberUsernames;
}
