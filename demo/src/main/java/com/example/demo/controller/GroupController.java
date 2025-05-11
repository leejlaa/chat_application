package com.example.demo.controller;

import com.example.demo.dto.CreateGroupRequest;
import com.example.demo.entity.ChatGroup;
import com.example.demo.service.GroupService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/groups")
public class GroupController {

    @Autowired
    private GroupService groupService;

    @PostMapping("/create")
    public ResponseEntity<?> createGroup(@RequestBody CreateGroupRequest request, Principal principal) {
        ChatGroup group = groupService.createGroup(principal.getName(), request);
        return ResponseEntity.ok(group);
    }

    @GetMapping("/my")
    public ResponseEntity<?> getUserGroups(Principal principal) {
        return ResponseEntity.ok(groupService.getGroupsForUser(principal.getName()));
    }
}
