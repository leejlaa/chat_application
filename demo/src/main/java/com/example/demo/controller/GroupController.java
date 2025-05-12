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

    @DeleteMapping("/leave/{groupId}")
    public ResponseEntity<?> leaveGroup(@PathVariable Long groupId, Principal principal) {
        try {
            groupService.leaveGroup(principal.getName(), groupId);
            return ResponseEntity.ok("Left the group successfully.");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/kick/{groupId}")
    public ResponseEntity<?> kickMember(@PathVariable Long groupId,
            @RequestParam String usernameToKick,
            Principal principal) {
        try {
            groupService.kickMember(principal.getName(), groupId, usernameToKick);
            return ResponseEntity.ok(usernameToKick + " has been kicked from the group.");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/rename/{groupId}")
    public ResponseEntity<?> renameGroup(@PathVariable Long groupId,
            @RequestParam String newName,
            Principal principal) {
        try {
            groupService.renameGroup(principal.getName(), groupId, newName);
            return ResponseEntity.ok("Group renamed to: " + newName);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/transfer/{groupId}")
    public ResponseEntity<?> transferOwnership(@PathVariable Long groupId,
            @RequestParam String newOwnerUsername,
            Principal principal) {
        try {
            groupService.transferOwnership(principal.getName(), groupId, newOwnerUsername);
            return ResponseEntity.ok("Ownership transferred to: " + newOwnerUsername);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/delete/{groupId}")
    public ResponseEntity<?> deleteGroup(@PathVariable Long groupId, Principal principal) {
        try {
            groupService.deleteGroup(principal.getName(), groupId);
            return ResponseEntity.ok("Group deleted successfully.");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/members/{groupId}")
    public ResponseEntity<?> getGroupMembers(@PathVariable Long groupId) {
        return ResponseEntity.ok(groupService.getGroupMembers(groupId));
    }

    @GetMapping("/history/{groupId}")
    public ResponseEntity<?> getGroupMessageHistory(@PathVariable Long groupId, Principal principal) {
        return ResponseEntity.ok(groupService.getGroupMessageHistory(groupId, principal.getName()));
    }

}
